import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Order } from '../types/store';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];
  
  // Simple validation
  if (items.length === 0) {
    res.status(400).json({ error: 'Your shopping bag is empty.' });
    return;
  }
  
  const sequenceId = Date.now() % 10000;
  const orderRef = `YT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.max(1, sequenceId)).padStart(4, '0')}`;
  
  const order: Order = {
    id: Date.now(),
    order_ref: orderRef,
    customer_name: body.customerName || '',
    customer_phone: body.customerPhone || '',
    customer_email: body.customerEmail || '',
    delivery_address: body.deliveryAddress || '',
    city: body.city || '',
    delivery_instructions: body.deliveryInstructions || '',
    delivery_option: body.deliveryOption || 'standard',
    delivery_fee_usd: Number(body.deliveryFeeUsd) || 5.00,
    subtotal_usd: Number(body.subtotalUsd) || 15.00,
    total_usd: Number(body.totalUsd) || 20.00,
    payment_method: body.paymentMethod || 'ecocash',
    payment_status: 'pending',
    order_status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: items.map((item: any) => ({
      id: item.id || Date.now(),
      order_id: Date.now(),
      product_id: item.productId,
      product_name: item.name,
      variant: item.variant || '',
      unit_price_usd: item.priceUsd,
      quantity: item.quantity,
      line_total_usd: (item.priceUsd * item.quantity),
    })),
  };
  
  res.status(201).json(order);
}