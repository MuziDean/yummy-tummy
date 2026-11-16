import React, { useMemo, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MEDIA_ASSETS } from '../lib/mediaAssets';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';

export function HomePage() {
  const { storefront, loadingStorefront, navigate } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const homepage = storefront?.homepage;
  const products = storefront?.products || [];
  const categories = storefront?.categories || [];
  const company = storefront?.company;

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.slug, c.name);
    }
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const pool = activeCategory === 'all' ? products.filter((p) => p.featured) : products.filter((p) => p.category_slug === activeCategory);
    return pool.slice(0, 6);
  }, [products, activeCategory]);

  const whatsappDirect = `https://wa.me/${(company?.whatsappNumber || '263770000000').replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hello Yummy Tummy! I would like to enquire about wholesale and retail distribution.',
  )}`;

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION — full-screen looping background video (no overlay text; video has its own words) */}
      <section className="relative overflow-hidden h-screen bg-black">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/vid final.mp4"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
      </section>

      {/* DISTRIBUTION & WHOLESALE INVITATION */}
      <section className="py-16 bg-[#FFF5E9] border-t border-[#EED9C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F15A00]">Retail & Wholesale</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#35170D] tracking-tight text-balance">
              LOVE YUMMY TUMMY? LET&apos;S GET IT ON YOUR SHELVES.
            </h2>
            <p className="text-base text-[#5A524C] leading-relaxed">
              Are you a retailer, wholesaler or distribution partner? We&apos;d love to explore how we can bring Yummy
              Tummy products closer to your customers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/contact#wholesale')}
              className="px-7 py-3.5 rounded-full bg-[#35170D] hover:bg-[#F15A00] text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Wholesale Enquiries
            </button>
            <a
              href={whatsappDirect}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-neutral-300 hover:border-[#35170D] text-[#35170D] text-sm font-bold transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>WhatsApp Partner Desk</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
