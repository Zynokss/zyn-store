'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/lib/types';

const CART_STORAGE_KEY = 'zyn_cart';
const FAV_STORAGE_KEY = 'zyn_favorites';

interface CartContextType {
  cart: CartItem[];
  favorites: string[];
  addToCart: (product: Product, size: string, options?: { quantity?: number; color?: string }) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, delta: number, size?: string, color?: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  totalItems: number;
  favoriteCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildItemKey(id: string, size?: string, color?: string) {
  return `${id}__${size || 'default'}__${color || 'default'}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(safeParse<CartItem[]>(CART_STORAGE_KEY, []));
    setFavorites(safeParse<string[]>(FAV_STORAGE_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch {
        /* ignore */
      }
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
      } catch {
        /* ignore */
      }
    }
  }, [favorites, hydrated]);

  const addToCart = useCallback(
    (product: Product, size: string, options?: { quantity?: number; color?: string }) => {
      const qty = Math.max(1, options?.quantity || 1);
      const color = options?.color;
      const displayImage = product.images?.[0] || product.image || '';

      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            item.id === product.id &&
            (item.selectedSize || 'default') === (size || 'default') &&
            (item.selectedColor || 'default') === (color || 'default')
        );

        if (existingIdx > -1) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: next[existingIdx].quantity + qty,
          };
          return next;
        }

        const displayName =
          color && product.colors?.length ? `${product.name} (${color})` : product.name;

        return [
          ...prev,
          {
            id: product.id,
            name: displayName,
            price: Number(product.price) || 0,
            image: displayImage,
            category: product.category,
            quantity: qty,
            selectedSize: size || undefined,
            selectedColor: color || undefined,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        const keyA = buildItemKey(item.id, item.selectedSize, item.selectedColor);
        const keyB = buildItemKey(id, size, color);
        if (size || color) return keyA !== keyB;
        return item.id !== id;
      })
    );
  }, []);

  const updateQuantity = useCallback(
    (id: string, delta: number, size?: string, color?: string) => {
      setCart((prev) =>
        prev
          .map((item) => {
            const matches =
              item.id === id &&
              (item.selectedSize || 'default') === (size || 'default') &&
              (item.selectedColor || 'default') === (color || 'default');
            if (!matches) return item;
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          })
          .filter((i): i is CartItem => i !== null)
      );
    },
    []
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const favoriteCount = favorites.length;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleFavorite,
        isFavorite,
        totalItems,
        favoriteCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    if (typeof window === 'undefined') {
      return {
        cart: [],
        favorites: [],
        addToCart: () => {},
        removeFromCart: () => {},
        updateQuantity: () => {},
        clearCart: () => {},
        toggleFavorite: () => {},
        isFavorite: () => false,
        totalItems: 0,
        favoriteCount: 0,
        subtotal: 0,
      };
    }
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
