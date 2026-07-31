'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface StoreLayoutProps {
  children: React.ReactNode;
  favoriteCount?: number;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onToggleFavoritesFilter?: () => void;
  isFavoritesFilterActive?: boolean;
}

export function StoreLayout({
  children,
  favoriteCount = 0,
  cartCount = 0,
  onOpenCart,
  onOpenSearch,
  onToggleFavoritesFilter,
  isFavoritesFilterActive = false,
}: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans antialiased selection:bg-[#ccff00] selection:text-black transition-colors duration-200">
      <Navbar
        favoriteCount={favoriteCount}
        cartCount={cartCount}
        onOpenCart={onOpenCart}
        onOpenSearch={onOpenSearch}
        onToggleFavoritesFilter={onToggleFavoritesFilter}
        isFavoritesFilterActive={isFavoritesFilterActive}
      />
      
      <main className="flex-1 w-full">{children}</main>

      <Footer />
    </div>
  );
}