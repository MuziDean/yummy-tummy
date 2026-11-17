import React, { useState, useEffect } from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ContactWholesalePage } from './pages/ContactWholesalePage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { MEDIA_ASSETS } from './lib/mediaAssets';
import { ProductCard } from './components/ProductCard';
import { ProductImage } from './components/ProductImage';

const routePages = {
  '': HomePage,
  '/': HomePage,
  '/our-story': () => import('./pages/OurStoryPage').then(mod => mod.OurStoryPage),
  '/shop': () => import('./pages/ShopPage').then(mod => mod.ShopPage),
  '/our-products': () => import('./pages/ShopPage').then(mod => mod.ShopPage),
  '/crispy-snacks': () => import('./pages/ShopPage').then(mod => mod.ShopPage),
  '/nut-butters': () => import('./pages/ShopPage').then(mod => mod.ShopPage),
  '/checkout': () => import('./pages/CheckoutPage').then(mod => mod.CheckoutPage),
  '/contact': () => import('./pages/ContactWholesalePage').then(mod => mod.ContactWholesalePage),
  '/privacy': () => import('./pages/LegalPage').then(mod => mod.LegalPage),
  '/terms': () => import('./pages/LegalPage').then(mod => mod.LegalPage),
  '/shipping': () => import('./pages/LegalPage').then(mod => mod.LegalPage),
  '/admin': () => import('./pages/AdminPage').then(mod => mod.AdminPage),
};

function AppRoutes() {
  const { route, toastMessage, storefront, setStorefront, loadingStorefront } = useStore();
  
  const renderPage = () => {
    const Component = routePages[route] || HomePage;
    return <Component />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1D1B] relative">
      <Preloader />
      <Header />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-full bg-[#35170D] text-white text-xs font-semibold shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  );
}
