import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { calculateCartTotals } from '../lib/storeLogic';
import type { CartItem, Product, StorefrontPayload } from '../types/store';

const CART_STORAGE_KEY = 'yummy_tummy_cart_v1';

interface StoreContextValue {
  route: string;
  navigate: (to: string) => void;
  storefront: StorefrontPayload | null;
  loadingStorefront: boolean;
  storefrontError: string | null;
  refreshStorefront: () => Promise<void>;
  cart: CartItem[];
  cartCount: number;
  cartSubtotalUsd: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: string, quantity?: number, openDrawer?: boolean) => void;
  updateCartQty: (productId: number, variant: string, quantity: number) => void;
  removeFromCart: (productId: number, variant: string) => void;
  clearCart: () => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadPersistedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<string>(() => window.location.pathname || '/');
  const [storefront, setStorefront] = useState<StorefrontPayload | null>(null);
  const [loadingStorefront, setLoadingStorefront] = useState<boolean>(true);
  const [storefrontError, setStorefrontError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(loadPersistedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const refreshStorefront = useCallback(async () => {
    try {
      setLoadingStorefront(true);
      setStorefrontError(null);
      const data = await api.getStorefront();
      setStorefront(data);
    } catch (err) {
      setStorefrontError(err instanceof Error ? err.message : 'Could not load products.');
    } finally {
      setLoadingStorefront(false);
    }
  }, []);

  useEffect(() => {
    refreshStorefront();
  }, [refreshStorefront]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [pathname, hash] = to.split('#');
    const cleanPath = pathname || '/';
    if (window.location.pathname !== cleanPath) {
      window.history.pushState({}, '', to);
      setRoute(cleanPath);
    }
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const addToCart = useCallback(
    (product: Product, variant?: string, quantity = 1, openDrawer = true) => {
      const selectedVariant = variant || product.variants[0] || '';
      const qtyToAdd = Math.max(1, Math.floor(quantity));

      setCart((prev) => {
        const idx = prev.findIndex(
          (item) => item.productId === product.id && item.variant === selectedVariant,
        );
        if (idx >= 0) {
          const next = [...prev];
          const maxAllowed = product.stock_qty > 0 ? product.stock_qty : 99;
          next[idx] = {
            ...next[idx],
            priceUsd: product.price_usd,
            quantity: Math.min(maxAllowed, next[idx].quantity + qtyToAdd),
          };
          return next;
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            variant: selectedVariant,
            priceUsd: product.price_usd,
            quantity: qtyToAdd,
            imageUrl: product.image_url,
            categorySlug: product.category_slug,
          },
        ];
      });

      showToast(`Added ${product.name} to your bag`);
      if (openDrawer) {
        setIsCartOpen(true);
      }
    },
    [showToast],
  );

  const updateCartQty = useCallback((productId: number, variant: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => !(item.productId === productId && item.variant === variant));
      }
      return prev.map((item) =>
        item.productId === productId && item.variant === variant
          ? { ...item, quantity: Math.floor(quantity) }
          : item,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number, variant: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.variant === variant)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totals = useMemo(() => calculateCartTotals(cart, 0), [cart]);

  const value: StoreContextValue = {
    route,
    navigate,
    storefront,
    loadingStorefront,
    storefrontError,
    refreshStorefront,
    cart,
    cartCount: totals.itemCount,
    cartSubtotalUsd: totals.subtotalUsd,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    quickViewProduct,
    setQuickViewProduct,
    toastMessage,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
