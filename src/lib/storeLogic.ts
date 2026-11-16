import type { CartItem, Order, PaymentMethod } from '../types/store';

export function roundUsd(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatUsd(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `$${roundUsd(safe).toFixed(2)}`;
}

export function calculateCartTotals(
  items: Pick<CartItem, 'priceUsd' | 'quantity'>[],
  deliveryFeeUsd = 0,
): { itemCount: number; subtotalUsd: number; deliveryFeeUsd: number; totalUsd: number } {
  let itemCount = 0;
  let subtotal = 0;
  for (const item of items) {
    const qty = Math.max(0, Math.floor(item.quantity));
    const price = Math.max(0, Number(item.priceUsd) || 0);
    itemCount += qty;
    subtotal += price * qty;
  }
  const cleanSubtotal = roundUsd(subtotal);
  const cleanDelivery = items.length > 0 ? roundUsd(Math.max(0, deliveryFeeUsd)) : 0;
  return {
    itemCount,
    subtotalUsd: cleanSubtotal,
    deliveryFeeUsd: cleanDelivery,
    totalUsd: roundUsd(cleanSubtotal + cleanDelivery),
  };
}

export function generateOrderReference(sequenceId: number, date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const paddedSeq = String(Math.max(1, sequenceId)).padStart(4, '0');
  return `YT-${year}${month}-${paddedSeq}`;
}

export interface CheckoutValidationInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  city: string;
  deliveryOption: string;
  paymentMethod: PaymentMethod | '';
  itemsCount: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCheckoutForm(input: CheckoutValidationInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (input.itemsCount <= 0) {
    errors.cart = 'Your shopping bag is empty. Add at least one product before placing an order.';
  }
  if (!input.customerName || input.customerName.trim().length < 2) {
    errors.customerName = 'Please enter your full name.';
  }
  const phoneDigits = (input.customerPhone || '').replace(/[^\d+]/g, '');
  if (phoneDigits.length < 7) {
    errors.customerPhone = 'Please enter a valid contact phone number.';
  }
  if (!input.customerEmail || !EMAIL_REGEX.test(input.customerEmail.trim())) {
    errors.customerEmail = 'Please enter a valid email address.';
  }
  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Please enter your city or town.';
  }
  if (!input.deliveryAddress || input.deliveryAddress.trim().length < 5) {
    errors.deliveryAddress = 'Please enter a complete delivery street address or collection note.';
  }
  if (!input.deliveryOption) {
    errors.deliveryOption = 'Please select a delivery option.';
  }
  if (!input.paymentMethod) {
    errors.paymentMethod = 'Please choose a payment method.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface WholesaleValidationInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  productInterests: string;
}

export function validateWholesaleForm(input: WholesaleValidationInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.companyName || input.companyName.trim().length < 2) {
    errors.companyName = 'Please enter your business or store name.';
  }
  if (!input.contactName || input.contactName.trim().length < 2) {
    errors.contactName = 'Please enter a contact person name.';
  }
  if (!input.email || !EMAIL_REGEX.test(input.email.trim())) {
    errors.email = 'Please enter a valid business email address.';
  }
  const phoneDigits = (input.phone || '').replace(/[^\d+]/g, '');
  if (phoneDigits.length < 7) {
    errors.phone = 'Please enter a valid phone or WhatsApp number.';
  }
  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Please enter your city or region.';
  }
  if (!input.productInterests || input.productInterests.trim().length < 3) {
    errors.productInterests = 'Please tell us which Yummy Tummy products you are interested in.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatWhatsAppOrderUrl(
  whatsappNumber: string,
  payload: {
    orderRef?: string;
    customerName?: string;
    city?: string;
    deliveryAddress?: string;
    items: Pick<CartItem, 'name' | 'variant' | 'quantity' | 'priceUsd'>[];
    subtotalUsd: number;
    deliveryFeeUsd?: number;
    totalUsd: number;
  },
): string {
  const digitsOnly = (whatsappNumber || '').replace(/\D/g, '');
  const targetNumber = digitsOnly || '263770000000';
  const lines: string[] = ['Hello Yummy Tummy! I would like to place an order:'];
  if (payload.orderRef) {
    lines.push(`Order Ref: ${payload.orderRef}`);
  }
  for (const item of payload.items) {
    const variantPart = item.variant ? ` (${item.variant})` : '';
    lines.push(
      `- ${item.quantity}x ${item.name}${variantPart} @ ${formatUsd(item.priceUsd)} = ${formatUsd(item.priceUsd * item.quantity)}`,
    );
  }
  lines.push(`Subtotal: ${formatUsd(payload.subtotalUsd)}`);
  if (payload.deliveryFeeUsd && payload.deliveryFeeUsd > 0) {
    lines.push(`Delivery: ${formatUsd(payload.deliveryFeeUsd)}`);
  }
  lines.push(`Total: ${formatUsd(payload.totalUsd)}`);
  if (payload.customerName) {
    lines.push(`Name: ${payload.customerName}`);
  }
  if (payload.city || payload.deliveryAddress) {
    lines.push(`Delivery: ${[payload.deliveryAddress, payload.city].filter(Boolean).join(', ')}`);
  }
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ordersToCsv(orders: Order[]): string {
  const headers = [
    'Order Ref',
    'Date',
    'Customer Name',
    'Phone',
    'Email',
    'City',
    'Address',
    'Delivery Option',
    'Payment Method',
    'Payment Status',
    'Order Status',
    'Subtotal USD',
    'Delivery USD',
    'Total USD',
    'Items',
  ];

  const rows = orders.map((order) => {
    const itemsSummary = (order.items || [])
      .map((item) => `${item.quantity}x ${item.product_name}${item.variant ? ` (${item.variant})` : ''}`)
      .join('; ');
    return [
      order.order_ref,
      order.created_at,
      order.customer_name,
      order.customer_phone,
      order.customer_email,
      order.city,
      order.delivery_address,
      order.delivery_option,
      order.payment_method,
      order.payment_status,
      order.order_status,
      order.subtotal_usd.toFixed(2),
      order.delivery_fee_usd.toFixed(2),
      order.total_usd.toFixed(2),
      itemsSummary,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
}

export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
