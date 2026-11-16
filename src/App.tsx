import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { Preloader } from './components/Preloader';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { OurStoryPage } from './pages/OurStoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactWholesalePage } from './pages/ContactWholesalePage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';

function AppRoutes() {
  const { route, toastMessage } = useStore();

  const renderPage = () => {
    if (route === '/' || route === '') return <HomePage />;
    if (route === '/our-story') return <OurStoryPage />;
    if (route === '/shop' || route === '/our-products') return <ShopPage initialCategory="all" />;
    if (route === '/crispy-snacks') return <ShopPage initialCategory="crispy-snacks" />;
    if (route === '/nut-butters') return <ShopPage initialCategory="nut-butters" />;
    if (route === '/checkout') return <CheckoutPage />;
    if (route === '/contact') return <ContactWholesalePage />;
    if (route === '/privacy') return <LegalPage type="privacy" />;
    if (route === '/terms') return <LegalPage type="terms" />;
    if (route === '/shipping') return <LegalPage type="shipping" />;
    if (route === '/admin') return <AdminPage />;
    return <HomePage />;
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
