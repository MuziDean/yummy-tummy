import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './auth.ts';
import type {
  Category,
  CompanyInfo,
  HomepageContent,
  Order,
  OrderItem,
  PaymentSettings,
  Product,
} from '../src/types/store.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DB_PATH = path.join(DATA_DIR, 'yummytummy.db');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

export function initDatabase(): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      headline TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category_slug TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      price_usd REAL NOT NULL DEFAULT 0,
      weight_label TEXT NOT NULL DEFAULT '',
      ingredients TEXT NOT NULL DEFAULT '',
      variants_json TEXT NOT NULL DEFAULT '[]',
      stock_qty INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      info_verified INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_ref TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      city TEXT NOT NULL,
      delivery_instructions TEXT NOT NULL DEFAULT '',
      delivery_option TEXT NOT NULL,
      delivery_fee_usd REAL NOT NULL DEFAULT 0,
      subtotal_usd REAL NOT NULL DEFAULT 0,
      total_usd REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      order_status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      variant TEXT NOT NULL DEFAULT '',
      unit_price_usd REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total_usd REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      city TEXT NOT NULL DEFAULT '',
      default_address TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wholesale_enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'Retailer',
      product_interests TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT 'General Enquiry',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'super_admin',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (catCount.c === 0) {
    const insertCat = db.prepare(
      'INSERT INTO categories (slug, name, headline, description, sort_order) VALUES (?, ?, ?, ?, ?)',
    );
    insertCat.run(
      'crispy-snacks',
      'Crispy Snacks',
      'Hear That Crunch?',
      'Light, crispy and packed with flavour. Find your favourite chip for every moment.',
      1,
    );
  }

  const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
  if (prodCount.c === 0) {
    const insertProd = db.prepare(`
      INSERT INTO products (
        slug, name, category_slug, short_description, description,
        price_usd, weight_label, ingredients, variants_json,
        stock_qty, is_available, featured, info_verified, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedProducts = [
      [
        'blue-chips',
        'Blue Chips',
        'crispy-snacks',
        'Bold blue-pack chips with a satisfying crunch in every bite.',
        'Crispy chips with a bold flavour punch, perfect for snacking any time of day.',
        1.5,
        '120 g',
        'Potatoes, vegetable oil, salt, natural flavouring.',
        JSON.stringify(['Single Pack', 'Sharing Pack']),
        100,
        1,
        1,
        0,
        '/blu1.jpg',
      ],
      [
        'green-chips',
        'Green Chips',
        'crispy-snacks',
        'Fresh green-pack chips with a light, crispy crunch.',
        'Lightly salted crispy chips for everyday snacking and sharing.',
        1.5,
        '120 g',
        'Potatoes, vegetable oil, salt, natural flavouring.',
        JSON.stringify(['Single Pack', 'Sharing Pack']),
        100,
        1,
        1,
        0,
        '/gree1.jpg',
      ],
      [
        'red-chips',
        'Red Chips',
        'crispy-snacks',
        'Spicy red-pack chips with a fiery kick.',
        'Boldly seasoned crispy chips for those who love a little heat.',
        1.5,
        '120 g',
        'Potatoes, vegetable oil, salt, chilli, natural flavouring.',
        JSON.stringify(['Single Pack', 'Sharing Pack']),
        100,
        1,
        1,
        0,
        '/red1.jpg',
      ],
      [
        'yellow-chips',
        'Yellow Chips',
        'crispy-snacks',
        'Classic yellow-pack chips with timeless savoury flavour.',
        'Golden crispy chips with the classic taste everyone loves.',
        1.5,
        '120 g',
        'Potatoes, vegetable oil, salt, natural flavouring.',
        JSON.stringify(['Single Pack', 'Sharing Pack']),
        100,
        1,
        1,
        0,
        '/yell1.jpg',
      ],
      [
        'yepu-chips',
        'Yepu Chips',
        'crispy-snacks',
        'Yepu chips with a unique, irresistible crunch.',
        'A distinctive crispy chip flavour made to share or savour solo.',
        1.5,
        '120 g',
        'Potatoes, vegetable oil, salt, natural flavouring.',
        JSON.stringify(['Single Pack', 'Sharing Pack']),
        100,
        1,
        1,
        0,
        '/yepu1.jpg',
      ],
    ];

    for (const p of seedProducts) {
      insertProd.run(...p);
    }
  }

  ensureSetting<HomepageContent>('homepage', {
    heroLabel: 'MADE WITH LOVE. PACKED WITH FLAVOUR.',
    heroTitleLine1: 'GOOD FOOD.',
    heroTitleLine2: 'GREAT MOODS.',
    heroTitleLine3: 'PURE YUMMY.',
    heroSubtext:
      'From irresistibly crispy snacks to deliciously smooth nut butters, discover the little things that make every bite special.',
    promoBannerText: 'GOOD THINGS COME IN YUMMY PACKS!',
    storyHeadline: 'BIG FLAVOUR. BIG DREAMS. A WHOLE LOT OF YUMMY.',
    storyFounderIntro:
      'Yummy Tummy was founded and is led by Zimbabwean entrepreneur Patience Agar, built on a belief that locally manufactured snacks and spreads can stand shoulder to shoulder with the finest international food brands.',
    storyOrigins:
      'Born from a passion for honest flavour, everyday joy, and culinary creativity in Zimbabwe, Yummy Tummy began with a simple question: why settle for ordinary snacks when local ingredients and bold craft can create something memorable?',
    storyManufacturing:
      'Every product range â€” from airy Crispy Roll Puffs and seasoned Naks to stone-milled nut butters and baked granola treats â€” is produced with attentive process control, clean food-grade handling, and consistency from batch to batch.',
    storyPhilosophy:
      'We craft variety for real life: savoury crunch for midday breaks, wholesome nut spreads for breakfast tables, and sweet-spiced treats for sharing. Selected nut butter formulations are crafted without added sugar, stabilisers, or artificial preservatives.',
    storyDistribution:
      'Today, Yummy Tummy partners with supermarkets, independent grocers, wholesalers, and direct-to-consumer shoppers across Zimbabwe to bring joyful snacking within easy reach.',
    storyVision:
      'As we grow our manufacturing footprint and product portfolio, our goal remains clear: to champion Zimbabwean food manufacturing, create delight in every pack, and scale across regional shelves without losing our heart.',
    galleryImages: ['asset://story_artisan_craft', 'asset://hero_snack_composition'],
  });

  ensureSetting<CompanyInfo>('company', {
    brandName: 'Yummy Tummy',
    tagline: 'Bringing delicious flavours and exciting food experiences to Zimbabwe.',
    phone: '+263 77 000 0000 (Update in Admin)',
    email: 'hello@yummytummy.co.zw',
    whatsappNumber: '+263770000000',
    address: 'Harare Manufacturing & Distribution Hub (Editable in Admin)',
    city: 'Harare, Zimbabwe',
    instagramUrl: 'https://www.instagram.com/yummy.tummy.official/',
    facebookUrl: 'https://www.facebook.com/p/Yummy-Tummy-61590373484775/',
    logoUrl: '/logo 1.png',
  });

  ensureSetting<PaymentSettings>('payments', {
    ecocashEnabled: true,
    ecocashMerchantName: 'Yummy Tummy (Pvt) Ltd',
    ecocashMerchantCode: 'Configure Merchant Code in Admin Settings',
    ecocashInstructions:
      'Dial *151# or open the EcoCash app, select Make Payment / Merchant Pay, enter the verified Merchant Code, and include your Order Reference as the payment reference.',
    bankEnabled: true,
    bankName: 'Configure Bank Name in Admin Settings',
    bankAccountName: 'Yummy Tummy (Pvt) Ltd',
    bankAccountNumber: 'Configure Account Number in Admin Settings',
    bankBranch: 'Harare',
    bankInstructions:
      'Transfer the exact USD order total via RTGS/Nostro or ZIPIT and email or WhatsApp your proof of payment quoting your Order Reference.',
    cardGatewayEnabled: false,
    cardProviderName: 'Paynow / Zimswitch / Stripe (Integration Ready)',
    cardGatewayNotice:
      'Online card checkout requires live merchant gateway credentials to be configured by the administrator in Store Settings.',
    whatsappOrderEnabled: true,
    deliveryOptions: [
      {
        id: 'harare-standard',
        label: 'Harare Standard Delivery',
        description: 'Next business day delivery within Harare metro',
        feeUsd: 3.0,
      },
      {
        id: 'harare-express',
        label: 'Harare Same-Day Express',
        description: 'Priority dispatch for orders confirmed before 12:00',
        feeUsd: 5.0,
      },
      {
        id: 'nationwide-courier',
        label: 'Nationwide Courier (Bulawayo, Mutare, Gweru & more)',
        description: '2â€“4 business days via partner courier',
        feeUsd: 7.0,
      },
      {
        id: 'collection',
        label: 'Direct Collection (Harare)',
        description: 'Collect directly once your order confirmation is ready',
        feeUsd: 0,
      },
    ],
  });

  // Ensure server-persisted session signing secret exists
  const secretRow = db.prepare("SELECT value_json FROM site_settings WHERE key = 'session_secret'").get() as
    | { value_json: string }
    | undefined;
  if (!secretRow) {
    const generatedSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
    db.prepare("INSERT INTO site_settings (key, value_json) VALUES ('session_secret', ?)").run(
      JSON.stringify(generatedSecret),
    );
  }

  // Ensure initial admin user exists
  const adminCount = db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as { c: number };
  if (adminCount.c === 0) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@yummytummy.co.zw';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'YummyAdmin2026!';
    db.prepare('INSERT INTO admin_users (email, name, role, password_hash) VALUES (?, ?, ?, ?)').run(
      defaultEmail.toLowerCase(),
      'Patience Agar (Admin)',
      'super_admin',
      hashPassword(defaultPassword),
    );
  }
}

function ensureSetting<T>(key: string, defaultValue: T): void {
  const existing = db.prepare('SELECT key FROM site_settings WHERE key = ?').get(key);
  if (!existing) {
    db.prepare('INSERT INTO site_settings (key, value_json) VALUES (?, ?)').run(key, JSON.stringify(defaultValue));
  }
}

export function getSetting<T>(key: string): T {
  const row = db.prepare('SELECT value_json FROM site_settings WHERE key = ?').get(key) as
    | { value_json: string }
    | undefined;
  if (!row) {
    throw new Error(`Missing setting: ${key}`);
  }
  return JSON.parse(row.value_json) as T;
}

export function setSetting<T>(key: string, value: T): void {
  db.prepare(
    `INSERT INTO site_settings (key, value_json, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = datetime('now')`,
  ).run(key, JSON.stringify(value));
}

export function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const row = db.prepare("SELECT value_json FROM site_settings WHERE key = 'session_secret'").get() as
    | { value_json: string }
    | undefined;
  if (row) {
    return JSON.parse(row.value_json) as string;
  }
  return 'fallback-dev-secret-change-in-prod';
}

export function mapProductRow(row: Record<string, unknown>): Product {
  let variants: string[] = [];
  try {
    const parsed = JSON.parse(String(row.variants_json || '[]'));
    if (Array.isArray(parsed)) variants = parsed.map(String);
  } catch {
    variants = [];
  }
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category_slug: String(row.category_slug),
    short_description: String(row.short_description || ''),
    description: String(row.description || ''),
    price_usd: Number(row.price_usd || 0),
    weight_label: String(row.weight_label || ''),
    ingredients: String(row.ingredients || ''),
    variants,
    stock_qty: Number(row.stock_qty || 0),
    is_available: Boolean(row.is_available),
    featured: Boolean(row.featured),
    info_verified: Boolean(row.info_verified),
    image_url: String(row.image_url || ''),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
  };
}

export function listCategories(): Category[] {
  const rows = db.prepare('SELECT slug, name, headline, description, sort_order FROM categories ORDER BY sort_order ASC').all();
  return rows.map((r) => ({
    slug: String(r.slug),
    name: String(r.name),
    headline: String(r.headline),
    description: String(r.description),
    sort_order: Number(r.sort_order),
  }));
}

export function listProducts(includeUnavailable = false): Product[] {
  const sql = includeUnavailable
    ? 'SELECT * FROM products ORDER BY featured DESC, id ASC'
    : 'SELECT * FROM products WHERE is_available = 1 ORDER BY featured DESC, id ASC';
  return db.prepare(sql).all().map(mapProductRow);
}

export function listOrdersWithItems(): Order[] {
  const orderRows = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  const itemRows = db.prepare('SELECT * FROM order_items ORDER BY id ASC').all();

  const itemsByOrder = new Map<number, OrderItem[]>();
  for (const row of itemRows) {
    const orderId = Number(row.order_id);
    const item: OrderItem = {
      id: Number(row.id),
      order_id: orderId,
      product_id: Number(row.product_id),
      product_name: String(row.product_name),
      variant: String(row.variant || ''),
      unit_price_usd: Number(row.unit_price_usd),
      quantity: Number(row.quantity),
      line_total_usd: Number(row.line_total_usd),
    };
    const arr = itemsByOrder.get(orderId) || [];
    arr.push(item);
    itemsByOrder.set(orderId, arr);
  }

  return orderRows.map((r) => ({
    id: Number(r.id),
    order_ref: String(r.order_ref),
    customer_name: String(r.customer_name),
    customer_phone: String(r.customer_phone),
    customer_email: String(r.customer_email),
    delivery_address: String(r.delivery_address),
    city: String(r.city),
    delivery_instructions: String(r.delivery_instructions || ''),
    delivery_option: String(r.delivery_option),
    delivery_fee_usd: Number(r.delivery_fee_usd),
    subtotal_usd: Number(r.subtotal_usd),
    total_usd: Number(r.total_usd),
    payment_method: String(r.payment_method) as Order['payment_method'],
    payment_status: String(r.payment_status) as Order['payment_status'],
    order_status: String(r.order_status) as Order['order_status'],
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
    items: itemsByOrder.get(Number(r.id)) || [],
  }));
}


