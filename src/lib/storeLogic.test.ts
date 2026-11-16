import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  formatUsd,
  formatWhatsAppOrderUrl,
  generateOrderReference,
  ordersToCsv,
  slugifyProductName,
  validateCheckoutForm,
  validateWholesaleForm,
} from './storeLogic';

test('calculateCartTotals computes exact USD subtotal, delivery, and itemCount', () => {
  const totals = calculateCartTotals(
    [
      { priceUsd: 4.5, quantity: 2 },
      { priceUsd: 1.99, quantity: 3 },
    ],
    3.0,
  );
  assert.equal(totals.itemCount, 5);
  assert.equal(totals.subtotalUsd, 14.97);
  assert.equal(totals.deliveryFeeUsd, 3.0);
  assert.equal(totals.totalUsd, 17.97);
});

test('calculateCartTotals zeros delivery fee when cart is empty', () => {
  const totals = calculateCartTotals([], 5.0);
  assert.equal(totals.itemCount, 0);
  assert.equal(totals.subtotalUsd, 0);
  assert.equal(totals.deliveryFeeUsd, 0);
  assert.equal(totals.totalUsd, 0);
});

test('generateOrderReference formats deterministic YYYYMM-XXXX reference', () => {
  const ref = generateOrderReference(42, new Date('2026-11-14T10:00:00Z'));
  assert.equal(ref, 'YT-202611-0042');
});

test('validateCheckoutForm rejects empty fields and accepts valid Zimbabwean checkout input', () => {
  const invalid = validateCheckoutForm({
    customerName: '',
    customerPhone: '123',
    customerEmail: 'bad-email',
    deliveryAddress: '1',
    city: '',
    deliveryOption: '',
    paymentMethod: '',
    itemsCount: 0,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.cart);
  assert.ok(invalid.errors.customerName);
  assert.ok(invalid.errors.customerPhone);
  assert.ok(invalid.errors.customerEmail);

  const valid = validateCheckoutForm({
    customerName: 'Rudo Moyo',
    customerPhone: '+263 77 123 4567',
    customerEmail: 'rudo@example.co.zw',
    deliveryAddress: '14 Samora Machel Ave',
    city: 'Harare',
    deliveryOption: 'harare-standard',
    paymentMethod: 'ecocash',
    itemsCount: 2,
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateWholesaleForm enforces required business enquiry fields', () => {
  const res = validateWholesaleForm({
    companyName: '',
    contactName: 'Tinashe',
    email: 'buyer@shop.co.zw',
    phone: '0772111222',
    city: 'Bulawayo',
    productInterests: 'Crispy Roll Puffs',
  });
  assert.equal(res.valid, false);
  assert.ok(res.errors.companyName);
});

test('formatWhatsAppOrderUrl encodes items and order total cleanly', () => {
  const url = formatWhatsAppOrderUrl('+263 77 555 0199', {
    orderRef: 'YT-202611-0007',
    customerName: 'Tendai',
    city: 'Harare',
    items: [{ name: 'Almond Butter', variant: '250g Jar', quantity: 2, priceUsd: 6.5 }],
    subtotalUsd: 13,
    deliveryFeeUsd: 2,
    totalUsd: 15,
  });
  assert.ok(url.startsWith('https://wa.me/263775550199?text='));
  assert.ok(decodeURIComponent(url).includes('YT-202611-0007'));
  assert.ok(decodeURIComponent(url).includes('2x Almond Butter (250g Jar)'));
  assert.equal(formatUsd(15), '$15.00');
});

test('ordersToCsv escapes commas and quotes properly', () => {
  const csv = ordersToCsv([
    {
      id: 1,
      order_ref: 'YT-202611-0001',
      customer_name: 'Chipo, Jr.',
      customer_phone: '+263771234567',
      customer_email: 'chipo@example.com',
      delivery_address: '10 "Main" Rd',
      city: 'Harare',
      delivery_instructions: '',
      delivery_option: 'Harare Standard',
      delivery_fee_usd: 3,
      subtotal_usd: 10,
      total_usd: 13,
      payment_method: 'ecocash',
      payment_status: 'pending',
      order_status: 'new',
      created_at: '2026-11-14T12:00:00Z',
      updated_at: '2026-11-14T12:00:00Z',
      items: [
        {
          id: 1,
          order_id: 1,
          product_id: 1,
          product_name: 'Almond Butter',
          variant: '250g',
          unit_price_usd: 5,
          quantity: 2,
          line_total_usd: 10,
        },
      ],
    },
  ]);
  assert.ok(csv.includes('"Chipo, Jr."'));
  assert.ok(csv.includes('"10 ""Main"" Rd"'));
  assert.ok(csv.includes('2x Almond Butter (250g)'));
  assert.equal(slugifyProductName('Cheese & Onion Naks!'), 'cheese-onion-naks');
});
