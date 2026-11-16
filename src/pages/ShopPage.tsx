import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  initialCategory?: string;
}

export function ShopPage({ initialCategory = 'all' }: ShopPageProps) {
  const { storefront, loadingStorefront } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  // Sync when route changes between /shop, /crispy-snacks, /nut-butters, /our-products
  React.useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const categories = storefront?.categories || [];
  const products = storefront?.products || [];

  const categoryMap = useMemo(() => {
    const m = new Map<string, (typeof categories)[number]>();
    for (const c of categories) m.set(c.slug, c);
    return m;
  }, [categories]);

  const activeCategoryMeta = selectedCategory !== 'all' ? categoryMap.get(selectedCategory) : null;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategory !== 'all' && p.category_slug !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.variants.some((v) => v.toLowerCase().includes(q))
      );
    });
    if (sortBy === 'price-asc') return [...list].sort((a, b) => a.price_usd - b.price_usd);
    if (sortBy === 'price-desc') return [...list].sort((a, b) => b.price_usd - a.price_usd);
    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="bg-white min-h-[70vh]">
      {/* Header Banner */}
      <section className="bg-[#FFF5E9]/65 border-b border-[#EED9C4]/70 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F15A00]">
            {activeCategoryMeta ? activeCategoryMeta.name : 'Full Yummy Tummy Range'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#35170D] tracking-tight">
            {activeCategoryMeta ? activeCategoryMeta.headline : 'Shop All Snacks & Spreads'}
          </h1>
          <p className="text-base text-[#5A524C] max-w-2xl">
            {activeCategoryMeta
              ? activeCategoryMeta.description
              : 'Browse crispy corn puffs, flavoured naks, artisanal nut butters, caramelised nuts, and baked granola treats.'}
          </p>
        </div>
      </section>

      {/* Filter Toolbar & Product Grid */}
      <section className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Product Categories">
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#35170D] text-white'
                    : 'bg-[#F7F6F3] text-[#35170D] hover:bg-[#FFF5E9]'
                }`}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === c.slug}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === c.slug
                      ? 'bg-[#35170D] text-white'
                      : 'bg-[#F7F6F3] text-[#35170D] hover:bg-[#FFF5E9]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5A524C] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <label htmlFor="shop-search-input" className="sr-only">
                  Search products
                </label>
                <input
                  id="shop-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search flavours or snacks..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-full border border-neutral-200 bg-[#F7F6F3] text-sm text-[#35170D] placeholder:text-[#5A524C] focus:outline-none focus:bg-white focus:border-[#F15A00]"
                />
              </div>

              <div>
                <label htmlFor="shop-sort-select" className="sr-only">
                  Sort products
                </label>
                <select
                  id="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full sm:w-auto px-4 py-2 rounded-full border border-neutral-200 bg-white text-sm text-[#35170D] font-medium focus:outline-none focus:border-[#F15A00]"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {loadingStorefront ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-2xl bg-[#F7F6F3] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-[#F7F6F3] rounded-3xl space-y-3">
              <h2 className="font-display text-xl font-bold text-[#35170D]">No matching products found</h2>
              <p className="text-sm text-[#5A524C]">Try clearing your search or exploring another snack category.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-full bg-[#F15A00] text-white text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryMap.get(product.category_slug)?.name}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
