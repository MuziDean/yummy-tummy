import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function OurStoryPage() {
  const { storefront, navigate } = useStore();
  const h = storefront?.homepage;

  const chapters = [
    {
      num: '01.',
      title: 'Founder Introduction — Patience Agar',
      body:
        h?.storyFounderIntro ||
        'Yummy Tummy was founded and is led by Zimbabwean entrepreneur Patience Agar, built on a belief that locally manufactured snacks and spreads can stand shoulder to shoulder with the finest international food brands.',
    },
    {
      num: '02.',
      title: 'Brand Origins',
      body:
        h?.storyOrigins ||
        'Born from a passion for honest flavour, everyday joy, and culinary creativity in Zimbabwe, Yummy Tummy began with a simple question: why settle for ordinary snacks when local ingredients and bold craft can create something memorable?',
    },
    {
      num: '03.',
      title: 'Our Manufacturing Journey',
      body:
        h?.storyManufacturing ||
        'Every product range — from airy Crispy Roll Puffs and seasoned Naks to stone-milled nut butters and baked granola treats — is produced with attentive process control, clean food-grade handling, and consistency from batch to batch.',
    },
    {
      num: '04.',
      title: 'Product Philosophy',
      body:
        h?.storyPhilosophy ||
        'We craft variety for real life: savoury crunch for midday breaks, wholesome nut spreads for breakfast tables, and sweet-spiced treats for sharing. Selected nut butter formulations are crafted without added sugar, stabilisers, or artificial preservatives.',
    },
    {
      num: '05.',
      title: 'Growth & Distribution Presence',
      body:
        h?.storyDistribution ||
        'Today, Yummy Tummy partners with supermarkets, independent grocers, wholesalers, and direct-to-consumer shoppers across Zimbabwe to bring joyful snacking within easy reach.',
    },
    {
      num: '06.',
      title: 'Vision for the Future',
      body:
        h?.storyVision ||
        'As we grow our manufacturing footprint and product portfolio, our goal remains clear: to champion Zimbabwean food manufacturing, create delight in every pack, and scale across regional shelves without losing our heart.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Editorial Hero */}
      <section
        className="relative border-b border-[#EED9C4]/70 py-14 lg:py-22 overflow-hidden"
        style={{
          backgroundImage: 'url(/about.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Cream overlay so text stays readable over the about image */}
        <div
          className="absolute inset-0 bg-[#FFF5E9]/70 mix-blend-overlay"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F15A00]">Our Story · Zimbabwe</p>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#35170D] tracking-tight leading-[1.03] text-balance">
              {h?.storyHeadline ? (
                <>
                  BIG FLAVOUR. BIG DREAMS. A WHOLE LOT OF <span className="type-yummy">YUMMY.</span>
                </>
              ) : (
                'BIG FLAVOUR. BIG DREAMS. A WHOLE LOT OF YUMMY.'
              )}
            </h1>
            <p className="text-base sm:text-lg text-[#5A524C] leading-relaxed">
              Founded and led by entrepreneur Patience Agar, Yummy Tummy is building a proudly Zimbabwean snack and food
              manufacturing brand focused on flavour, craft, and everyday delight.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                <span>Explore Our Products</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact#wholesale')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#35170D]/25 hover:border-[#35170D] text-[#35170D] text-sm font-bold transition-colors cursor-pointer"
              >
                <span>Partner With Us</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <img
              src={storefront?.company.logoUrl || '/logo 1.png'}
              alt="Yummy Tummy Logo"
              className="w-full aspect-[4/3] object-contain object-center block"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Editorial Story Chapters */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {chapters.map((ch) => (
              <article key={ch.num} className="space-y-3 border-t border-neutral-200 pt-6">
                <span className="font-mono text-xs font-semibold text-[#F15A00]">{ch.num}</span>
                <h2 className="font-display text-2xl font-extrabold text-[#35170D]">{ch.title}</h2>
                <p className="text-sm sm:text-base text-[#5A524C] leading-relaxed">{ch.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase Band */}
      <section className="py-14 bg-[#F7F6F3] border-t border-neutral-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#35170D]">
              Ready to taste the Yummy Tummy range?
            </h2>
            <p className="text-sm sm:text-base text-[#5A524C]">
              Shop direct online or reach out to stock Yummy Tummy snacks and nut butters in your store.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="px-7 py-3.5 rounded-full bg-[#35170D] hover:bg-[#F15A00] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Shop Online
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact#wholesale')}
              className="px-7 py-3.5 rounded-full bg-white border border-neutral-300 hover:border-[#35170D] text-[#35170D] text-sm font-bold transition-colors cursor-pointer"
            >
              Stock Yummy Tummy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
