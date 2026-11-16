import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import {
  calculateCartTotals,
  formatUsd,
  formatWhatsAppOrderUrl,
  validateCheckoutForm,
} from '../lib/storeLogic';
import type { Order, PaymentMethod, PaymentSettings } from '../types/store';
import { ProductImage } from '../components/ProductImage';

export function CheckoutPage() {
  const { cart, navigate, storefront, clearCart } = useStore();
  const payments = storefront?.payments;
  const company = storefront?.company;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('Harare');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryOptionId, setDeliveryOptionId] = useState<string>(
    payments?.deliveryOptions?.[0]?.id || 'harare-standard',
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ecocash');
  const [reviewStep, setReviewStep] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmedOrder, setConfirmedOrder] = useState<{
    order: Order;
    paymentSettings: PaymentSettings;
  } | null>(null);

  // Sync default delivery option once storefront loads
  React.useEffect(() => {
    if (payments?.deliveryOptions?.length && !payments.deliveryOptions.some((d) => d.id === deliveryOptionId)) {
      setDeliveryOptionId(payments.deliveryOptions[0].id);
    }
  }, [payments, deliveryOptionId]);

  const selectedDelivery = useMemo(() => {
    return payments?.deliveryOptions?.find((d) => d.id === deliveryOptionId) || payments?.deliveryOptions?.[0];
  }, [payments, deliveryOptionId]);

  const totals = useMemo(
    () => calculateCartTotals(cart, selectedDelivery?.feeUsd || 0),
    [cart, selectedDelivery],
  );

  // Confirmed Receipt Screen
  if (confirmedOrder) {
    const { order, paymentSettings } = confirmedOrder;
    const waConfirmUrl = formatWhatsAppOrderUrl(company?.whatsappNumber || '', {
      orderRef: order.order_ref,
      customerName: order.customer_name,
      city: order.city,
      deliveryAddress: order.delivery_address,
      items: (order.items || []).map((i) => ({
        name: i.product_name,
        variant: i.variant,
        quantity: i.quantity,
        priceUsd: i.unit_price_usd,
      })),
      subtotalUsd: order.subtotal_usd,
      deliveryFeeUsd: order.delivery_fee_usd,
      totalUsd: order.total_usd,
    });

    return (
      <div className="bg-[#FFF5E9]/45 min-h-[75vh] py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-10 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#F15A00]">Order Received</p>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#35170D]">
                  Thank you, {order.customer_name}!
                </h1>
                <p className="text-sm text-[#5A524C]">
                  Your order reference is{' '}
                  <strong className="font-mono text-[#35170D]" data-testid="confirmed-order-ref">
                    {order.order_ref}
                  </strong>
                  . Our team has received your order details.
                </p>
              </div>
            </div>

            {/* Selected Payment Instructions */}
            <div className="rounded-2xl bg-[#FFF5E9] border border-[#EED9C4] p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-[#35170D]">Payment Instructions</h2>
              {order.payment_method === 'ecocash' && (
                <div className="text-sm text-[#35170D] space-y-1.5">
                  <p>
                    <strong>Method:</strong> EcoCash Merchant Payment ({paymentSettings.ecocashMerchantName})
                  </p>
                  <p>
                    <strong>Merchant Code:</strong>{' '}
                    <span className="font-mono">{paymentSettings.ecocashMerchantCode}</span>
                  </p>
                  <p>
                    <strong>Amount Due:</strong> <span className="tabular-nums font-bold">{formatUsd(order.total_usd)}</span>
                  </p>
                  <p className="text-xs text-[#5A524C] pt-1">{paymentSettings.ecocashInstructions}</p>
                </div>
              )}

              {order.payment_method === 'bank_transfer' && (
                <div className="text-sm text-[#35170D] space-y-1.5">
                  <p>
                    <strong>Bank:</strong> {paymentSettings.bankName} ({paymentSettings.bankBranch})
                  </p>
                  <p>
                    <strong>Account Name:</strong> {paymentSettings.bankAccountName}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{' '}
                    <span className="font-mono">{paymentSettings.bankAccountNumber}</span>
                  </p>
                  <p>
                    <strong>Reference:</strong> <span className="font-mono">{order.order_ref}</span>
                  </p>
                  <p>
                    <strong>Amount Due:</strong> <span className="tabular-nums font-bold">{formatUsd(order.total_usd)}</span>
                  </p>
                  <p className="text-xs text-[#5A524C] pt-1">{paymentSettings.bankInstructions}</p>
                </div>
              )}

              {order.payment_method === 'whatsapp_assisted' && (
                <div className="text-sm text-[#35170D] space-y-3">
                  <p>
                    You selected WhatsApp-assisted ordering. Send your pre-filled order summary directly to our team to
                    finalise payment and delivery timing.
                  </p>
                  <a
                    href={waConfirmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Send Order {order.order_ref} on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h2 className="font-display text-base font-bold text-[#35170D]">Order Summary</h2>
              <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[#35170D]">{item.product_name}</span>
                      {item.variant && <span className="text-[#5A524C]"> ({item.variant})</span>}
                      <span className="text-[#5A524C]"> × {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#35170D] tabular-nums">{formatUsd(item.line_total_usd)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#5A524C]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatUsd(order.subtotal_usd)}</span>
                </div>
                <div className="flex justify-between text-[#5A524C]">
                  <span>Delivery ({order.delivery_option})</span>
                  <span className="tabular-nums">{formatUsd(order.delivery_fee_usd)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#35170D] pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span className="tabular-nums">{formatUsd(order.total_usd)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <a
                href={waConfirmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#35170D] hover:text-[#F15A00]"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Send proof / confirm via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="px-6 py-3 rounded-full bg-[#35170D] hover:bg-[#F15A00] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <h1 className="font-display text-3xl font-extrabold text-[#35170D]">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-[#5A524C]">Add snacks or nut butters to your bag before checking out.</p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="px-7 py-3.5 rounded-full bg-[#F15A00] text-white text-sm font-bold cursor-pointer"
        >
          Shop Yummy Tummy
        </button>
      </div>
    );
  }

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const check = validateCheckoutForm({
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      city,
      deliveryOption: selectedDelivery?.id || deliveryOptionId,
      paymentMethod,
      itemsCount: cart.length,
    });
    setFieldErrors(check.errors);
    if (!check.valid) return;
    setReviewStep(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrder = async () => {
    setSubmitError(null);
    try {
      setSubmitting(true);
      const res = await api.submitOrder({
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        city,
        deliveryInstructions,
        deliveryOption: selectedDelivery?.id || deliveryOptionId,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          variant: item.variant,
          quantity: item.quantity,
        })),
      });
      clearCart();
      setConfirmedOrder(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const apiErr = err as Error & { fieldErrors?: Record<string, string> };
      if (apiErr.fieldErrors) setFieldErrors(apiErr.fieldErrors);
      setSubmitError(apiErr.message || 'Could not place order.');
      setReviewStep(false);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappFallbackUrl = formatWhatsAppOrderUrl(company?.whatsappNumber || '', {
    customerName,
    city,
    deliveryAddress,
    items: cart,
    subtotalUsd: totals.subtotalUsd,
    deliveryFeeUsd: totals.deliveryFeeUsd,
    totalUsd: totals.totalUsd,
  });

  return (
    <div className="bg-[#F7F6F3]/60 min-h-[80vh] py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => (reviewStep ? setReviewStep(false) : navigate('/shop'))}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A524C] hover:text-[#F15A00] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{reviewStep ? 'Edit Delivery & Payment Details' : 'Back to Shop'}</span>
        </button>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#35170D] mb-8">
          {reviewStep ? 'Review & Confirm Your Order' : 'Checkout'}
        </h1>

        {submitError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form or Review Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8">
            {reviewStep ? (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-neutral-200 pb-4">
                  <h2 className="font-display text-xl font-bold text-[#35170D]">Delivery Details</h2>
                  <p className="text-sm text-[#5A524C]">
                    {customerName} · {customerPhone} · {customerEmail}
                  </p>
                  <p className="text-sm text-[#35170D] font-medium">
                    {deliveryAddress}, {city}
                  </p>
                  {deliveryInstructions && (
                    <p className="text-xs text-[#5A524C]">Note: {deliveryInstructions}</p>
                  )}
                </div>

                <div className="space-y-1 border-b border-neutral-200 pb-4">
                  <h2 className="font-display text-xl font-bold text-[#35170D]">Delivery & Payment</h2>
                  <p className="text-sm text-[#5A524C]">
                    Delivery: <strong className="text-[#35170D]">{selectedDelivery?.label}</strong>
                  </p>
                  <p className="text-sm text-[#5A524C]">
                    Payment:{' '}
                    <strong className="text-[#35170D]">
                      {paymentMethod === 'ecocash'
                        ? 'EcoCash Merchant Payment'
                        : paymentMethod === 'bank_transfer'
                          ? 'Bank Transfer / ZIPIT'
                          : paymentMethod === 'whatsapp_assisted'
                            ? 'WhatsApp-Assisted Order'
                            : 'Online Card Payment'}
                    </strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmOrder}
                    className="px-8 py-3.5 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? 'Submitting Order...' : 'Place Order'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setReviewStep(false)}
                    className="px-6 py-3.5 rounded-full border border-neutral-300 text-[#35170D] text-sm font-semibold hover:border-[#35170D] cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewClick} noValidate className="space-y-7">
                {/* Customer Details */}
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold text-[#35170D]">1. Customer Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-name" className="block text-xs font-semibold text-[#35170D] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="checkout-name"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rudo Moyo"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                      />
                      {fieldErrors.customerName && (
                        <p className="text-xs text-red-700 mt-1">{fieldErrors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="checkout-phone" className="block text-xs font-semibold text-[#35170D] mb-1.5">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+263 77 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                      />
                      {fieldErrors.customerPhone && (
                        <p className="text-xs text-red-700 mt-1">{fieldErrors.customerPhone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="checkout-email" className="block text-xs font-semibold text-[#35170D] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                      />
                      {fieldErrors.customerEmail && (
                        <p className="text-xs text-red-700 mt-1">{fieldErrors.customerEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Option */}
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <h2 className="font-display text-xl font-bold text-[#35170D]">2. Delivery Address & Option</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-city" className="block text-xs font-semibold text-[#35170D] mb-1.5">
                        City / Town *
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Harare, Bulawayo, Mutare..."
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                      />
                      {fieldErrors.city && <p className="text-xs text-red-700 mt-1">{fieldErrors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor="checkout-address" className="block text-xs font-semibold text-[#35170D] mb-1.5">
                        Street Address *
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House number, street & suburb"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                      />
                      {fieldErrors.deliveryAddress && (
                        <p className="text-xs text-red-700 mt-1">{fieldErrors.deliveryAddress}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-notes" className="block text-xs font-semibold text-[#35170D] mb-1.5">
                        Delivery Instructions (Optional)
                      </label>
                      <input
                        id="checkout-notes"
                        type="text"
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        placeholder="Gate code, landmark, or preferred delivery time"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-semibold text-[#35170D]">Select Delivery Option *</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(payments?.deliveryOptions || []).map((opt) => {
                        const active = deliveryOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDeliveryOptionId(opt.id)}
                            className={`text-left p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#FFF5E9] border-[#F15A00]'
                                : 'bg-white border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#35170D]">{opt.label}</span>
                              <span className="text-xs font-bold text-[#F15A00] tabular-nums">
                                {opt.feeUsd === 0 ? 'Free' : formatUsd(opt.feeUsd)}
                              </span>
                            </div>
                            <p className="text-xs text-[#5A524C] mt-1">{opt.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4 pt-4 border-t border-neutral-200">
                  <h2 className="font-display text-xl font-bold text-[#35170D]">3. Payment Method</h2>
                  <div className="space-y-2.5">
                    {payments?.ecocashEnabled !== false && (
                      <label
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                          paymentMethod === 'ecocash' ? 'bg-[#FFF5E9] border-[#F15A00]' : 'border-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="ecocash"
                          checked={paymentMethod === 'ecocash'}
                          onChange={() => setPaymentMethod('ecocash')}
                          className="mt-1 accent-[#F15A00]"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 font-bold text-[#35170D]">
                            <Smartphone className="w-4 h-4 text-[#F15A00]" aria-hidden="true" />
                            <span>EcoCash Merchant Payment</span>
                          </div>
                          <p className="text-xs text-[#5A524C] mt-0.5">
                            Receive verified EcoCash merchant code and order reference upon submission.
                          </p>
                        </div>
                      </label>
                    )}

                    {payments?.bankEnabled !== false && (
                      <label
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                          paymentMethod === 'bank_transfer' ? 'bg-[#FFF5E9] border-[#F15A00]' : 'border-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="mt-1 accent-[#F15A00]"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 font-bold text-[#35170D]">
                            <Building2 className="w-4 h-4 text-[#F15A00]" aria-hidden="true" />
                            <span>Bank Transfer / ZIPIT</span>
                          </div>
                          <p className="text-xs text-[#5A524C] mt-0.5">
                            Transfer USD via Nostro/ZIPIT with your generated order reference.
                          </p>
                        </div>
                      </label>
                    )}

                    {/* Card Gateway (honestly indicates configuration state) */}
                    <div
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        payments?.cardGatewayEnabled
                          ? paymentMethod === 'card_gateway'
                            ? 'bg-[#FFF5E9] border-[#F15A00] cursor-pointer'
                            : 'border-neutral-200 cursor-pointer'
                          : 'bg-[#F7F6F3] border-neutral-200 opacity-75'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card_gateway"
                        disabled={!payments?.cardGatewayEnabled}
                        checked={paymentMethod === 'card_gateway'}
                        onChange={() => setPaymentMethod('card_gateway')}
                        className="mt-1 accent-[#F15A00]"
                      />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2 font-bold text-[#35170D]">
                          <CreditCard className="w-4 h-4 text-[#5A524C]" aria-hidden="true" />
                          <span>Card Payment ({payments?.cardProviderName || 'Gateway Integration Ready'})</span>
                        </div>
                        <p className="text-xs text-[#5A524C] mt-0.5">
                          {payments?.cardGatewayEnabled
                            ? 'Pay securely online via configured card gateway.'
                            : payments?.cardGatewayNotice ||
                              'Card gateway requires live merchant credentials configured in Admin Settings.'}
                        </p>
                      </div>
                    </div>

                    {payments?.whatsappOrderEnabled !== false && (
                      <label
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                          paymentMethod === 'whatsapp_assisted' ? 'bg-[#FFF5E9] border-[#F15A00]' : 'border-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="whatsapp_assisted"
                          checked={paymentMethod === 'whatsapp_assisted'}
                          onChange={() => setPaymentMethod('whatsapp_assisted')}
                          className="mt-1 accent-[#F15A00]"
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 font-bold text-[#35170D]">
                            <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                            <span>WhatsApp-Assisted Ordering</span>
                          </div>
                          <p className="text-xs text-[#5A524C] mt-0.5">
                            Submit your order reference and complete coordination directly with our WhatsApp team.
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-bold transition-colors cursor-pointer"
                  >
                    Review Order
                  </button>

                  <a
                    href={whatsappFallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#35170D] hover:text-[#F15A00]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Or send bag directly via WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Right Order Summary Sidebar */}
          <aside className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold text-[#35170D]">Order Summary ({totals.itemCount})</h2>
            <ul className="divide-y divide-neutral-200/80 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.variant}`} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FFF5E9] shrink-0">
                    <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#35170D] truncate">{item.name}</p>
                    <p className="text-xs text-[#5A524C]">
                      {item.variant ? `${item.variant} · ` : ''}Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#35170D] tabular-nums">
                    {formatUsd(item.priceUsd * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-neutral-200 space-y-2 text-sm">
              <div className="flex justify-between text-[#5A524C]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#35170D] tabular-nums">{formatUsd(totals.subtotalUsd)}</span>
              </div>
              <div className="flex justify-between text-[#5A524C]">
                <span>Delivery ({selectedDelivery?.label || 'Standard'})</span>
                <span className="font-semibold text-[#35170D] tabular-nums">
                  {totals.deliveryFeeUsd === 0 ? 'Free' : formatUsd(totals.deliveryFeeUsd)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-[#35170D] pt-3 border-t border-neutral-200">
                <span>Total (USD)</span>
                <span className="tabular-nums text-[#F15A00]">{formatUsd(totals.totalUsd)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
