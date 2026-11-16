import React, { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { YummyTummyLogo } from './YummyTummyLogo';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Shop All', href: '/shop' },
  { label: 'Crispy Snacks', href: '/crispy-snacks' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const { route, navigate, cartCount, setIsCartOpen, storefront } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [route]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    navigate(href);
  };

  return (
    <>
      <header
        className={`
          z-50 w-full
          ${route === '/'
            ? 'absolute top-0 left-0 right-0 z-[60] bg-transparent'
            : 'sticky top-0 bg-[#35170D]/90 backdrop-blur-md border-b border-white/30'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-36 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Logo */}
          <a
            href="/"
            onClick={(e) => handleNavClick(e, '/')}
            className="whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A00] rounded-lg"
            aria-label="Yummy Tummy Home"
          >
            <img
              src={storefront?.company.logoUrl || '/logo 1.png'}
              alt="Yummy Tummy Logo"
              className="h-36 w-auto block drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Zone 2: Desktop Single-Line Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center gap-6 text-sm font-medium text-white"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = route === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors hover:text-[#F15A00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A00] rounded ${
                    isActive ? 'text-[#F15A00] font-semibold' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#F15A00] rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action (Shopping Bag) + Mobile Drawer Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping bag with ${cartCount} items`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#35170D] text-white text-sm font-semibold hover:bg-[#F15A00] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A00] focus-visible:ring-offset-2"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span>Bag</span>
              <span
                data-testid="header-cart-count"
                className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#F15A00] text-white text-xs font-bold tabular-nums"
              >
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="xl:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#35170D] hover:bg-[#FFF5E9] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F15A00]"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          <div
            className="fixed inset-0 bg-[#35170D]/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                <YummyTummyLogo size="sm" logoUrl={storefront?.company.logoUrl} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#35170D] hover:bg-[#FFF5E9] cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile Links">
                {NAV_ITEMS.map((item) => {
                  const isActive = route === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-[#FFF5E9] text-[#F15A00] font-semibold'
                          : 'text-[#35170D] hover:bg-[#F7F6F3]'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#F15A00] text-white font-semibold text-sm hover:bg-[#D64D00] transition-colors cursor-pointer"
              >
                View Shopping Bag ({cartCount})
              </button>
              <a
                href="/admin"
                onClick={(e) => handleNavClick(e, '/admin')}
                className="block text-center text-xs text-[#5A524C] hover:text-[#35170D] py-1"
              >
                Store Administration
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
