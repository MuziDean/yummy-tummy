import React, { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatUsd } from '../lib/storeLogic';
import { ProductImage } from './ProductImage';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useStore();
  const [variant, setVariant] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setVariant(quickViewProduct.variants[0] || '');
      setQty(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const outOfStock = !quickViewProduct.is_available || quickViewProduct.stock_qty <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Quick view ${quickViewProduct.name}`}>
      <div
        className="fixed inset-0 bg-[#35170D]/45 backdrop-blur-xs"
        onClick={() => setQuickViewProduct(null)}
      />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-neutral-200">
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close quick view"
          className="absolute top-4 right-4 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/95 text-[#35170D] hover:bg-[#35170D] hover:text-white shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="bg-[#FFF5E9] aspect-[4/3] md:aspect-auto md:h-full">
          <ProductImage
            src={quickViewProduct.image_url}
            alt={quickViewProduct.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="text-xs font-medium text-[#5A524C] flex items-center gap-2">
              <span className="uppercase tracking-wider">{quickViewProduct.category_slug.replace('-', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className={outOfStock ? 'text-red-700' : 'text-emerald-800'}>
                {outOfStock ? 'Out of stock' : 'In stock'}
              </span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#35170D]">{quickViewProduct.name}</h2>
            <div className="flex items-baseline gap-2.5">
              <p className="text-xl font-bold text-[#F15A00] tabular-nums">{formatUsd(quickViewProduct.price_usd)}</p>
              {quickViewProduct.info_verified && quickViewProduct.weight_label && (
                <span className="text-xs font-medium text-[#5A524C]">{quickViewProduct.weight_label}</span>
              )}
            </div>
            <p className="text-sm text-[#5A524C] leading-relaxed">
              {quickViewProduct.description || quickViewProduct.short_description}
            </p>
            {quickViewProduct.info_verified && quickViewProduct.ingredients && (
              <p className="text-xs text-[#5A524C] pt-1">
                <strong className="text-[#35170D]">Ingredients:</strong> {quickViewProduct.ingredients}
              </p>
            )}

            {quickViewProduct.variants.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="block text-xs font-semibold text-[#35170D] uppercase tracking-wider">
                  Select Option
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVariant(v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        variant === v
                          ? 'bg-[#35170D] text-white border-[#35170D]'
                          : 'bg-[#F7F6F3] text-[#35170D] border-neutral-200 hover:border-[#F15A00]'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-neutral-200 bg-[#F7F6F3]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 inline-flex items-center justify-center text-[#35170D] cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <span className="px-3 text-sm font-bold text-[#35170D] tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 inline-flex items-center justify-center text-[#35170D] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  addToCart(quickViewProduct, variant, qty, true);
                  setQuickViewProduct(null);
                }}
                className="flex-1 py-2.5 px-5 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
