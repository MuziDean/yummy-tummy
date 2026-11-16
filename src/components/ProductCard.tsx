import React, { useState } from 'react';
import { Eye, Plus, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatUsd } from '../lib/storeLogic';
import type { Product } from '../types/store';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addToCart, setQuickViewProduct } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants[0] || '');
  const [justAdded, setJustAdded] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<'individual' | 'box12' | 'box24'>('individual');
  const [bulkQuantity, setBulkQuantity] = useState<number>(1);

  const isHealthy = product.category_slug === 'nut-butters' || product.category_slug === 'nuts-granola';
  const outOfStock = !product.is_available || product.stock_qty <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    const multiplier = purchaseMode === 'individual' ? 1 : purchaseMode === 'box12' ? 12 : 24;
    addToCart(product, selectedVariant, bulkQuantity * multiplier, true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      data-testid={`product-card-${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200/80 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Product Photography Pedestal */}
      <div
        className={`relative aspect-[4/3] overflow-hidden ${
          isHealthy ? 'bg-[#FFF5E9]' : 'bg-[#F7F6F3]'
        }`}
      >
        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          className="block w-full h-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A00]"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>

        {/* Quick View Trigger */}
        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          aria-label={`Quick view ${product.name}`}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[#35170D] text-xs font-semibold shadow-sm border border-neutral-200/80 hover:bg-[#35170D] hover:text-white transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Zero-Pill Metadata Line */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#5A524C]">
          <span className="uppercase tracking-wider">{categoryName || product.category_slug.replace('-', ' ')}</span>
          <span aria-hidden="true">·</span>
          <span className={outOfStock ? 'text-red-700' : 'text-emerald-800'}>
            {outOfStock ? 'Out of stock' : 'Available'}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-bold text-[#35170D] leading-snug">
            <button
              type="button"
              onClick={() => setQuickViewProduct(product)}
              className="text-left hover:text-[#F15A00] transition-colors cursor-pointer"
            >
              {product.name}
            </button>
          </h3>
          <p className="text-sm text-[#5A524C] line-clamp-2 leading-relaxed">{product.short_description}</p>
        </div>

        {/* Variant / Flavour Selector */}
        {product.variants.length > 0 && (
          <div className="pt-1">
            {product.variants.length === 1 ? (
              <p className="text-xs text-[#5A524C]">
                Variant: <span className="font-medium text-[#35170D]">{product.variants[0]}</span>
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`Variants for ${product.name}`}>
                {product.variants.map((variant) => {
                  const active = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#35170D] text-white border-[#35170D]'
                          : 'bg-[#F7F6F3] text-[#35170D] border-neutral-200 hover:border-[#F15A00]'
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bulk Box Selector (Wholesale) */}
        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5A524C] mb-1.5">Buy as</p>
          <div className="flex gap-1.5" role="group" aria-label="Purchase mode">
            <button
              type="button"
              onClick={() => setPurchaseMode('individual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                purchaseMode === 'individual'
                  ? 'bg-[#35170D] text-white border-[#35170D]'
                  : 'bg-[#F7F6F3] text-[#35170D] border-neutral-200 hover:border-[#F15A00]'
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setPurchaseMode('box12')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                purchaseMode === 'box12'
                  ? 'bg-[#35170D] text-white border-[#35170D]'
                  : 'bg-[#F7F6F3] text-[#35170D] border-neutral-200 hover:border-[#F15A00]'
              }`}
            >
              Box of 12
            </button>
            <button
              type="button"
              onClick={() => setPurchaseMode('box24')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                purchaseMode === 'box24'
                  ? 'bg-[#35170D] text-white border-[#35170D]'
                  : 'bg-[#F7F6F3] text-[#35170D] border-neutral-200 hover:border-[#F15A00]'
              }`}
            >
              Box of 24
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs font-medium text-[#35170D]">{purchaseMode === 'individual' ? 'Quantity' : 'Boxes'}</label>
            <input
              type="number"
              min="1"
              value={bulkQuantity}
              onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs text-center text-[#35170D] focus:outline-none focus:border-[#F15A00]"
            />
            {purchaseMode !== 'individual' && (
              <span className="text-xs text-[#5A524C]">= {bulkQuantity * (purchaseMode === 'box12' ? 12 : 24)} units</span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            {purchaseMode === 'individual' ? (
              <span className="text-lg font-bold text-[#35170D] tabular-nums">{formatUsd(product.price_usd)}</span>
            ) : (
              <>
                <span className="text-lg font-bold text-[#35170D] tabular-nums">
                  {formatUsd(product.price_usd * (purchaseMode === 'box12' ? 12 : 24))}
                </span>
                <span className="ml-1.5 text-xs text-[#5A524C]">per box</span>
              </>
            )}
            {product.info_verified && product.weight_label && (
              <span className="ml-1.5 text-xs text-[#5A524C]">{product.weight_label}</span>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#F15A00] hover:bg-[#D64D00] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
