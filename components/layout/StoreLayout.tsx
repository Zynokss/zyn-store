'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface StoreLayoutProps {
  children: React.ReactNode;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onToggleFavoritesFilter?: () => void;
  isFavoritesFilterActive?: boolean;
  className?: string;
}

export function StoreLayout({
  children,
  onOpenCart,
  onOpenSearch,
  onToggleFavoritesFilter,
  isFavoritesFilterActive = false,
  className = '',
}: StoreLayoutProps) {
  return (
    <div
      className={`min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-[#9ae600] selection:text-black transition-colors duration-200 ${className}`}
    >
      <Navbar
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