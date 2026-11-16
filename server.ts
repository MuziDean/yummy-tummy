import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import dotenv from 'dotenv';
import {
  createRequireAdmin,
  hashPassword,
  parseCookies,
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
  type AuthenticatedRequest,
} from './server/auth.ts';
import {
  db,
  getSessionSecret,
  getSetting,
  initDatabase,
  listCategories,
  listOrdersWithItems,
  listProducts,
  mapProductRow,
  setSetting,
  UPLOADS_DIR,
} from './server/db.ts';
import {
  generateOrderReference,
  ordersToCsv,
  roundUsd,
  slugifyProductName,
  validateCheckoutForm,
  validateWholesaleForm,
} from './src/lib/storeLogic.ts';
import type {
  CompanyInfo,
  HomepageContent,
  OrderStatus,
  PaymentMethod,
  PaymentSettings,
  PaymentStatus,
} from './src/types/store.ts';

dotenv.config();
initDatabase();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const requireAdmin = createRequireAdmin(getSessionSecret);

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Public health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'yummy-tummy-api' });
});

// Public storefront bootstrap payload
app.get('/api/storefront', (_req, res) => {
  try {
    const categories = listCategories();
    const products = listProducts(false);
    const homepage = getSetting<HomepageContent>('homepage');
    const company = getSetting<CompanyInfo>('company');
    const payments = getSetting<PaymentSettings>('payments');

    res.json({
      categories,
      products,
      homepage,
      company,
      payments,
    });
  } catch (err) {
    console.error('Storefront fetch error:', err);
    res.status(500).json({ error: 'Unable to load storefront data.' });
  }
});

// Public single product detail + related products
app.get('/api/products/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE slug = ? AND is_available = 1').get(req.params.slug);
  if (!row) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  const product = mapProductRow(row);
  const relatedRows = db
    .prepare('SELECT * FROM products WHERE category_slug = ? AND id != ? AND is_available = 1 ORDER BY featured DESC LIMIT 3')
    .all(product.category_slug, product.id);
  res.json({
    product,
    related: relatedRows.map(mapProductRow),
  });
});

// Public order submission (authoritative server-side price & stock validation)
app.post('/api/orders', (req, res) => {
  const body = req.body || {};
  const rawItems = Array.isArray(body.items) ? body.items : [];

  const validation = validateCheckoutForm({
    customerName: String(body.customerName || ''),
    customerPhone: String(body.customerPhone || ''),
    customerEmail: String(body.customerEmail || ''),
    deliveryAddress: String(body.deliveryAddress || ''),
    city: String(body.city || ''),
    deliveryOption: String(body.deliveryOption || ''),
    paymentMethod: String(body.paymentMethod || '') as PaymentMethod,
    itemsCount: rawItems.length,
  });

  if (!validation.valid) {
    res.status(400).json({ error: 'Please correct the highlighted fields.', fieldErrors: validation.errors });
    return;
  }

  const payments = getSetting<PaymentSettings>('payments');
  const deliveryOpt = payments.deliveryOptions.find(
    (opt) => opt.id === body.deliveryOption || opt.label === body.deliveryOption,
  );
  if (!deliveryOpt) {
    res.status(400).json({ error: 'Invalid delivery option selected.' });
    return;
  }

  const paymentMethod = String(body.paymentMethod) as PaymentMethod;
  if (!['ecocash', 'bank_transfer', 'card_gateway', 'whatsapp_assisted'].includes(paymentMethod)) {
    res.status(400).json({ error: 'Unsupported payment method.' });
    return;
  }

  if (paymentMethod === 'card_gateway' && !payments.cardGatewayEnabled) {
    res.status(400).json({
      error:
        payments.cardGatewayNotice ||
        'Online card payment is not active yet. Please select EcoCash, Bank Transfer, or WhatsApp-Assisted Ordering.',
    });
    return;
  }

  try {
    db.exec('BEGIN');

    let subtotal = 0;
    const verifiedItems: Array<{
      productId: number;
      productName: string;
      variant: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }> = [];

    for (const reqItem of rawItems) {
      const productId = Number(reqItem.productId);
      const qty = Math.floor(Number(reqItem.quantity));
      const variant = String(reqItem.variant || '').slice(0, 80);

      if (!Number.isInteger(productId) || qty < 1 || qty > 200) {
        throw new Error('INVALID_ITEM_QUANTITY');
      }

      const prodRow = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      if (!prodRow || !prodRow.is_available) {
        throw new Error(`PRODUCT_UNAVAILABLE:${productId}`);
      }

      const availableStock = Number(prodRow.stock_qty || 0);
      if (availableStock < qty) {
        throw new Error(`INSUFFICIENT_STOCK:${String(prodRow.name)}`);
      }

      const unitPrice = roundUsd(Number(prodRow.price_usd));
      const lineTotal = roundUsd(unitPrice * qty);
      subtotal = roundUsd(subtotal + lineTotal);

      verifiedItems.push({
        productId,
        productName: String(prodRow.name),
        variant,
        unitPrice,
        quantity: qty,
        lineTotal,
      });

      db.prepare("UPDATE products SET stock_qty = stock_qty - ?, updated_at = datetime('now') WHERE id = ?").run(
        qty,
        productId,
      );
    }

    const deliveryFee = roundUsd(deliveryOpt.feeUsd);
    const totalUsd = roundUsd(subtotal + deliveryFee);
    const tempRef = `YT-TMP-${crypto.randomUUID().slice(0, 8)}`;

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_ref, customer_name, customer_phone, customer_email,
        delivery_address, city, delivery_instructions, delivery_option,
        delivery_fee_usd, subtotal_usd, total_usd, payment_method,
        payment_status, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialPaymentStatus: PaymentStatus =
      paymentMethod === 'ecocash' || paymentMethod === 'bank_transfer' ? 'awaiting_verification' : 'pending';

    const orderResult = insertOrder.run(
      tempRef,
      String(body.customerName).trim(),
      String(body.customerPhone).trim(),
      String(body.customerEmail).trim().toLowerCase(),
      String(body.deliveryAddress).trim(),
      String(body.city).trim(),
      String(body.deliveryInstructions || '').trim(),
      deliveryOpt.label,
      deliveryFee,
      subtotal,
      totalUsd,
      paymentMethod,
      initialPaymentStatus,
      'new',
    );

    const orderId = Number(orderResult.lastInsertRowid);
    const orderRef = generateOrderReference(orderId);
    db.prepare('UPDATE orders SET order_ref = ? WHERE id = ?').run(orderRef, orderId);

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, variant, unit_price_usd, quantity, line_total_usd
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of verifiedItems) {
      insertItem.run(orderId, item.productId, item.productName, item.variant, item.unitPrice, item.quantity, item.lineTotal);
    }

    // Upsert customer record
    db.prepare(`
      INSERT INTO customers (full_name, phone, email, city, default_address)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        full_name = excluded.full_name,
        phone = excluded.phone,
        city = excluded.city,
        default_address = excluded.default_address,
        updated_at = datetime('now')
    `).run(
      String(body.customerName).trim(),
      String(body.customerPhone).trim(),
      String(body.customerEmail).trim().toLowerCase(),
      String(body.city).trim(),
      String(body.deliveryAddress).trim(),
    );

    db.exec('COMMIT');

    const createdOrder = listOrdersWithItems().find((o) => o.id === orderId);
    res.status(201).json({
      order: createdOrder,
      paymentSettings: payments,
    });
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // ignore rollback if not active
    }
    const msg = err instanceof Error ? err.message : 'ORDER_ERROR';
    if (msg.startsWith('INSUFFICIENT_STOCK:')) {
      const name = msg.split(':')[1];
      res.status(400).json({ error: `Not enough stock available for ${name}.` });
      return;
    }
    if (msg.startsWith('PRODUCT_UNAVAILABLE:')) {
      res.status(400).json({ error: 'One of the selected products is currently unavailable.' });
      return;
    }
    if (msg === 'INVALID_ITEM_QUANTITY') {
      res.status(400).json({ error: 'Invalid item quantity in cart.' });
      return;
    }
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Unable to submit order. Please try again.' });
  }
});

// Public wholesale enquiry
app.post('/api/wholesale', (req, res) => {
  const body = req.body || {};
  const validation = validateWholesaleForm({
    companyName: String(body.companyName || ''),
    contactName: String(body.contactName || ''),
    email: String(body.email || ''),
    phone: String(body.phone || ''),
    city: String(body.city || ''),
    productInterests: String(body.productInterests || ''),
  });

  if (!validation.valid) {
    res.status(400).json({ error: 'Please complete all required business fields.', fieldErrors: validation.errors });
    return;
  }

  const info = db
    .prepare(
      `INSERT INTO wholesale_enquiries (
        company_name, contact_name, email, phone, city, business_type, product_interests, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      String(body.companyName).trim(),
      String(body.contactName).trim(),
      String(body.email).trim().toLowerCase(),
      String(body.phone).trim(),
      String(body.city).trim(),
      String(body.businessType || 'Retailer').trim(),
      String(body.productInterests).trim(),
      String(body.message || '').trim(),
    );

  res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
});

// Public contact form
app.post('/api/contact', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) {
    res.status(400).json({ error: 'Please provide your name, a valid email address, and a message.' });
    return;
  }

  const info = db
    .prepare('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)')
    .run(name, email.toLowerCase(), String(body.phone || '').trim(), String(body.subject || 'General Enquiry').trim(), message);

  res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
});

// Public newsletter signup
app.post('/api/newsletter', (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(email);
  res.status(201).json({ ok: true, message: 'Thank you for subscribing to Yummy Tummy updates.' });
});

// ---------------- ADMIN AUTH ----------------

app.post('/api/admin/login', (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, String(user.password_hash))) {
    res.status(401).json({ error: 'Invalid administrator email or password.' });
    return;
  }

  const role = String(user.role) === 'store_manager' ? 'store_manager' : 'super_admin';
  const token = signSessionToken(
    {
      userId: Number(user.id),
      email: String(user.email),
      name: String(user.name),
      role,
    },
    getSessionSecret(),
  );

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    user: {
      id: Number(user.id),
      email: String(user.email),
      name: String(user.name),
      role,
    },
  });
});

app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

app.get('/api/admin/me', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    res.json({ user: null });
    return;
  }
  const payload = verifySessionToken(token, getSessionSecret());
  if (!payload) {
    res.json({ user: null });
    return;
  }
  res.json({
    user: {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
  });
});

app.post('/api/admin/change-password', requireAdmin, (req: AuthenticatedRequest, res) => {
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');
  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.adminUser!.userId);
  if (!user || !verifyPassword(currentPassword, String(user.password_hash))) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), req.adminUser!.userId);
  res.json({ ok: true });
});

// ---------------- ADMIN DASHBOARD & CRUD ----------------

app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
  const allOrders = listOrdersWithItems();
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => ['new', 'confirmed', 'preparing', 'dispatched'].includes(o.order_status)).length;
  const completedOrders = allOrders.filter((o) => o.order_status === 'completed').length;
  const revenueUsd = roundUsd(
    allOrders
      .filter((o) => o.order_status !== 'cancelled')
      .reduce((acc, o) => acc + (o.payment_status === 'paid' || o.order_status === 'completed' ? o.total_usd : 0), 0),
  );
  const products = listProducts(true);
  const lowStockProducts = products.filter((p) => p.stock_qty <= 10);
  const wholesaleRow = db.prepare('SELECT COUNT(*) as c FROM wholesale_enquiries').get() as { c: number };

  res.json({
    totalOrders,
    pendingOrders,
    completedOrders,
    revenueUsd,
    productCount: products.length,
    lowStockProducts,
    recentOrders: allOrders.slice(0, 6),
    wholesaleEnquiriesCount: wholesaleRow.c,
  });
});

// Admin Products
app.get('/api/admin/products', requireAdmin, (_req, res) => {
  res.json({
    products: listProducts(true),
    categories: listCategories(),
  });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const categorySlug = String(body.category_slug || '').trim();
  if (name.length < 2 || !categorySlug) {
    res.status(400).json({ error: 'Product name and category are required.' });
    return;
  }

  let slug = slugifyProductName(String(body.slug || name));
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const variants = Array.isArray(body.variants)
    ? body.variants.map((v: unknown) => String(v).trim()).filter(Boolean)
    : [];

  const result = db
    .prepare(
      `INSERT INTO products (
        slug, name, category_slug, short_description, description,
        price_usd, weight_label, ingredients, variants_json,
        stock_qty, is_available, featured, info_verified, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      slug,
      name,
      categorySlug,
      String(body.short_description || '').trim(),
      String(body.description || '').trim(),
      roundUsd(Math.max(0, Number(body.price_usd) || 0)),
      String(body.weight_label || '').trim(),
      String(body.ingredients || '').trim(),
      JSON.stringify(variants),
      Math.max(0, Math.floor(Number(body.stock_qty) || 0)),
      body.is_available === false ? 0 : 1,
      body.featured ? 1 : 0,
      body.info_verified ? 1 : 0,
      String(body.image_url || 'asset://crispy_roll_puffs').trim(),
    );

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(result.lastInsertRowid));
  res.status(201).json({ product: mapProductRow(created!) });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const body = req.body || {};
  const name = String(body.name ?? existing.name).trim();
  const variants = Array.isArray(body.variants)
    ? body.variants.map((v: unknown) => String(v).trim()).filter(Boolean)
    : JSON.parse(String(existing.variants_json || '[]'));

  db.prepare(
    `UPDATE products SET
      name = ?,
      category_slug = ?,
      short_description = ?,
      description = ?,
      price_usd = ?,
      weight_label = ?,
      ingredients = ?,
      variants_json = ?,
      stock_qty = ?,
      is_available = ?,
      featured = ?,
      info_verified = ?,
      image_url = ?,
      updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    name,
    String(body.category_slug ?? existing.category_slug),
    String(body.short_description ?? existing.short_description).trim(),
    String(body.description ?? existing.description).trim(),
    roundUsd(Math.max(0, Number(body.price_usd ?? existing.price_usd))),
    String(body.weight_label ?? existing.weight_label).trim(),
    String(body.ingredients ?? existing.ingredients).trim(),
    JSON.stringify(variants),
    Math.max(0, Math.floor(Number(body.stock_qty ?? existing.stock_qty))),
    body.is_available === undefined ? Number(existing.is_available) : body.is_available ? 1 : 0,
    body.featured === undefined ? Number(existing.featured) : body.featured ? 1 : 0,
    body.info_verified === undefined ? Number(existing.info_verified) : body.info_verified ? 1 : 0,
    String(body.image_url ?? existing.image_url).trim(),
    id,
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.json({ product: mapProductRow(updated!) });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (info.changes === 0) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json({ ok: true });
});

// Admin category updates
app.put('/api/admin/categories/:slug', requireAdmin, (req, res) => {
  const slug = req.params.slug;
  const body = req.body || {};
  const existing = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  if (!existing) {
    res.status(404).json({ error: 'Category not found.' });
    return;
  }
  db.prepare('UPDATE categories SET name = ?, headline = ?, description = ? WHERE slug = ?').run(
    String(body.name ?? existing.name).trim(),
    String(body.headline ?? existing.headline).trim(),
    String(body.description ?? existing.description).trim(),
    slug,
  );
  res.json({ categories: listCategories() });
});

// Admin image upload (base64 data URL -> /uploads/file)
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  const dataUrl = String(req.body?.dataUrl || '');
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    res.status(400).json({ error: 'Please upload a valid PNG, JPG, or WEBP image.' });
    return;
  }
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 5 * 1024 * 1024) {
    res.status(400).json({ error: 'Image must be smaller than 5MB.' });
    return;
  }
  const fileName = `yt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), buffer);
  res.status(201).json({ url: `/uploads/${fileName}` });
});

// Admin Orders
app.get('/api/admin/orders', requireAdmin, (_req, res) => {
  res.json({ orders: listOrdersWithItems() });
});

app.get('/api/admin/orders/export', requireAdmin, (_req, res) => {
  const orders = listOrdersWithItems();
  const csv = ordersToCsv(orders);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="yummy-tummy-orders.csv"');
  res.send(csv);
});

app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  const validOrderStatuses: OrderStatus[] = ['new', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled'];
  const validPaymentStatuses: PaymentStatus[] = ['pending', 'awaiting_verification', 'paid', 'failed'];

  const nextOrderStatus = String(req.body?.order_status ?? existing.order_status) as OrderStatus;
  const nextPaymentStatus = String(req.body?.payment_status ?? existing.payment_status) as PaymentStatus;

  if (!validOrderStatuses.includes(nextOrderStatus) || !validPaymentStatuses.includes(nextPaymentStatus)) {
    res.status(400).json({ error: 'Invalid order or payment status.' });
    return;
  }

  db.prepare(
    "UPDATE orders SET order_status = ?, payment_status = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(nextOrderStatus, nextPaymentStatus, id);

  const updated = listOrdersWithItems().find((o) => o.id === id);
  res.json({ order: updated });
});

// Admin Customers
app.get('/api/admin/customers', requireAdmin, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*,
        COUNT(o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.total_usd ELSE 0 END), 0) as total_spent_usd,
        MAX(o.created_at) as last_order_at
       FROM customers c
       LEFT JOIN orders o ON LOWER(o.customer_email) = LOWER(c.email)
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
    )
    .all();

  res.json({
    customers: rows.map((r) => ({
      id: Number(r.id),
      full_name: String(r.full_name),
      phone: String(r.phone),
      email: String(r.email),
      city: String(r.city || ''),
      default_address: String(r.default_address || ''),
      notes: String(r.notes || ''),
      order_count: Number(r.order_count || 0),
      total_spent_usd: roundUsd(Number(r.total_spent_usd || 0)),
      last_order_at: r.last_order_at ? String(r.last_order_at) : undefined,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
    })),
  });
});

app.put('/api/admin/customers/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!existing) {
    res.status(404).json({ error: 'Customer not found.' });
    return;
  }
  const body = req.body || {};
  db.prepare(
    "UPDATE customers SET full_name = ?, phone = ?, city = ?, default_address = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(
    String(body.full_name ?? existing.full_name).trim(),
    String(body.phone ?? existing.phone).trim(),
    String(body.city ?? existing.city).trim(),
    String(body.default_address ?? existing.default_address).trim(),
    String(body.notes ?? existing.notes).trim(),
    id,
  );
  res.json({ ok: true });
});

// Admin Enquiries (Wholesale & Contact)
app.get('/api/admin/enquiries', requireAdmin, (_req, res) => {
  const wholesale = db.prepare('SELECT * FROM wholesale_enquiries ORDER BY id DESC').all();
  const contact = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
  const newsletter = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY id DESC').all();
  res.json({ wholesale, contact, newsletter });
});

app.patch('/api/admin/enquiries/:type/:id', requireAdmin, (req, res) => {
  const { type, id } = req.params;
  const status = String(req.body?.status || 'reviewed');
  const table = type === 'wholesale' ? 'wholesale_enquiries' : type === 'contact' ? 'contact_messages' : null;
  if (!table) {
    res.status(400).json({ error: 'Unknown enquiry type.' });
    return;
  }
  db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(status, Number(id));
  res.json({ ok: true });
});

// Admin Website Content, Company Info & Payments
app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  res.json({
    homepage: getSetting<HomepageContent>('homepage'),
    company: getSetting<CompanyInfo>('company'),
    payments: getSetting<PaymentSettings>('payments'),
  });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const body = req.body || {};
  if (body.homepage) {
    setSetting('homepage', body.homepage);
  }
  if (body.company) {
    setSetting('company', body.company);
  }
  if (body.payments) {
    setSetting('payments', body.payments);
  }
  res.json({
    homepage: getSetting<HomepageContent>('homepage'),
    company: getSetting<CompanyInfo>('company'),
    payments: getSetting<PaymentSettings>('payments'),
  });
});

// Mount Vite in dev or static dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yummy Tummy server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
