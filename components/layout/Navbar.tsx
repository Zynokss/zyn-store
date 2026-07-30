'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, Search, Heart, User, LogOut, Globe } from 'lucide-react';
import { useTranslation } from '@/components/providers/IntlProvider';

interface NavbarProps {
  favoriteCount?: number;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onToggleFavoritesFilter?: () => void;
  isFavoritesFilterActive?: boolean;
}

export function Navbar({
  favoriteCount = 0,
  cartCount = 0,
  onOpenCart,
  onOpenSearch,
  onToggleFavoritesFilter,
  isFavoritesFilterActive = false,
}: NavbarProps) {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 text-xl font-black tracking-tighter text-black uppercase">
          ZYN<span className="text-[#ccff00] bg-black px-1.5 py-0.5 rounded text-sm">STORE</span>
        </Link>

        {/* Functional Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-zinc-700">
          <Link href="/#catalog" className="hover:text-black transition-colors">
            {t('Navbar.catalog')}
          </Link>
          <Link href="/#catalog" className="hover:text-black transition-colors flex items-center gap-1">
            <span>New Arrivals</span>
            <span className="bg-[#ccff00] text-black text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">HOT</span>
          </Link>
          <Link href="/track-order" className="hover:text-black transition-colors">
            {t('Navbar.trackOrder')}
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 rounded-full px-2 py-1 text-[10px] font-mono font-bold border border-zinc-200">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <button
              onClick={() => setLocale('en')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                locale === 'en' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'
              }`}
              type="button"
            >
              EN
            </button>
            <button
              onClick={() => setLocale('fr')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                locale === 'fr' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'
              }`}
              type="button"
            >
              FR
            </button>
            <button
              onClick={() => setLocale('ar')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                locale === 'ar' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'
              }`}
              type="button"
            >
              عربي
            </button>
          </div>

          {/* Search Toggle */}
          <button
            onClick={onOpenSearch}
            className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all"
            title="Search"
            type="button"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist Filter Toggle */}
          <button
            onClick={onToggleFavoritesFilter}
            className={`relative rounded-full p-2 transition-all ${
              isFavoritesFilterActive ? 'bg-rose-50 text-rose-600' : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Filter Favorites"
            type="button"
          >
            <Heart className={`h-5 w-5 ${favoriteCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favoriteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Toggle */}
          <button
            onClick={onOpenCart}
            className="relative rounded-full bg-black p-2.5 text-white hover:bg-[#ccff00] hover:text-black transition-all"
            title="Open Cart"
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ccff00] text-[9px] font-mono font-bold text-black border border-black">
              {cartCount}
            </span>
          </button>

          {/* Authentication & User Account Actions */}
          {session ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
              <Link
                href="/account"
                className="text-xs font-mono font-bold uppercase text-zinc-700 hover:text-black max-w-[100px] truncate"
                title={session.user?.email || 'Account'}
              >
                {session.user?.name || session.user?.email?.split('@')[0] || 'Account'}
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full p-2 text-zinc-500 hover:text-rose-500 transition-colors"
                title="Sign Out"
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all"
              title="Sign In"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}