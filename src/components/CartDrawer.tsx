import React from 'react';
import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatUsd, formatWhatsAppOrderUrl } from '../lib/storeLogic';
import { ProductImage } from './ProductImage';

export function CartDrawer() {
  const {
    cart,
    cartCount,
    cartSubtotalUsd,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    navigate,
    storefront,
  } = useStore();

  if (!isCartOpen) return null;

  const whatsappUrl = formatWhatsAppOrderUrl(storefront?.company.whatsappNumber || '', {
    items: cart,
    subtotalUsd: cartSubtotalUsd,
    totalUsd: cartSubtotalUsd,
  });

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleBrowse = () => {
    setIsCartOpen(false);
    navigate('/shop');
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      <div
        className="fixed inset-0 bg-[#35170D]/40 backdrop-blur-xs"
        onClick={() => setIsCartOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F15A00]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold text-[#35170D]">
              Your Shopping Bag <span className="text-sm font-medium text-[#5A524C] tabular-nums">({cartCount})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close shopping bag"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#35170D] hover:bg-[#FFF5E9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cart Items or Empty Experience */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF5E9] flex items-center justify-center text-[#F15A00]">
                <ShoppingBag className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="font-display text-lg font-bold text-[#35170D]">Your snack bag is empty</h3>
                <p className="text-sm text-[#5A524C]">
                  From crispy roll puffs to smooth almond and chilli peanut butters, your next favourite bite is waiting.
                </p>
              </div>
              <button
                type="button"
                onClick={handleBrowse}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Explore Yummy Tummy</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200/80">
              {cart.map((item) => (
                <li key={`${item.productId}-${item.variant}`} className="py-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FFF5E9] shrink-0 border border-neutral-200/60">
                    <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-bold text-[#35170D] truncate">{item.name}</h3>
                        {item.variant && <p className="text-xs text-[#5A524C]">{item.variant}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, item.variant)}
                        aria-label={`Remove ${item.name} from bag`}
                        className="text-[#5A524C] hover:text-red-700 p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="inline-flex items-center rounded-full border border-neutral-200 bg-[#F7F6F3]">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.productId, item.variant, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-[#35170D] hover:text-[#F15A00] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#35170D] tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.productId, item.variant, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-[#35170D] hover:text-[#F15A00] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#35170D] tabular-nums">
                        {formatUsd(item.priceUsd * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 bg-[#FFF5E9]/50 p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm text-[#5A524C]">
                <span>Subtotal</span>
                <span className="font-bold text-[#35170D] text-base tabular-nums" data-testid="cart-subtotal">
                  {formatUsd(cartSubtotalUsd)}
                </span>
              </div>
              <p className="text-xs text-[#5A524C]">Delivery options and EcoCash / Bank Transfer selected at checkout.</p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 px-5 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              {storefront?.payments.whatsappOrderEnabled && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-full bg-white border border-neutral-300 hover:border-[#35170D] text-[#35170D] text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  <span>Order via WhatsApp Instead</span>
                </a>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
