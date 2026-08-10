'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, Search, Heart, User, LogOut, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/components/providers/IntlProvider';
import { useTheme } from 'next-themes';

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
  const { language, locale, setLanguage, setLocale, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Active language getter (supports both 'locale' and 'language' props)
  const currentLang = locale || language || 'en';
  const changeLanguage = setLocale || setLanguage;

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
          ZYN<span className="text-[#ccff00] bg-black dark:bg-zinc-900 px-1.5 py-0.5 rounded text-sm border border-black dark:border-zinc-800">STORE</span>
        </Link>

        {/* Functional Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          <Link href="/#catalog" className="hover:text-black dark:hover:text-[#ccff00] transition-colors">
            {t('Navbar.catalog') !== 'Navbar.catalog' ? t('Navbar.catalog') : t('catalog')}
          </Link>
          <Link href="/#catalog" className="hover:text-black dark:hover:text-[#ccff00] transition-colors flex items-center gap-1">
            <span>New Arrivals</span>
            <span className="bg-[#ccff00] text-black text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">HOT</span>
          </Link>
          <Link href="/track-order" className="hover:text-black dark:hover:text-[#ccff00] transition-colors">
            {t('Navbar.trackOrder') !== 'Navbar.trackOrder' ? t('Navbar.trackOrder') : t('trackOrder')}
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="Toggle Theme"
              type="button"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-[#ccff00]" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-800" />
              )}
            </button>
          )}

          {/* Language Switcher Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-full px-2 py-1 text-[10px] font-mono font-bold border border-zinc-200 dark:border-zinc-800">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <button
              onClick={() => changeLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                currentLang === 'en' ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              type="button"
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                currentLang === 'fr' ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              type="button"
            >
              FR
            </button>
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                currentLang === 'ar' ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black' : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              type="button"
            >
              عربي
            </button>
          </div>

          {/* Search Toggle */}
          <button
            onClick={onOpenSearch}
            className="rounded-full p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all cursor-pointer"
            title="Search"
            type="button"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist Filter Toggle */}
          <button
            onClick={onToggleFavoritesFilter}
            className={`relative rounded-full p-2 transition-all cursor-pointer ${
              isFavoritesFilterActive 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' 
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
            className="relative rounded-full bg-black dark:bg-[#ccff00] p-2.5 text-white dark:text-black hover:bg-[#ccff00] dark:hover:bg-lime-400 hover:text-black transition-all cursor-pointer"
            title="Open Cart"
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ccff00] dark:bg-black text-[9px] font-mono font-bold text-black dark:text-[#ccff00] border border-black dark:border-zinc-800">
              {cartCount}
            </span>
          </button>

          {/* Authentication & User Account Actions */}
          {session ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <Link
                href="/account"
                className="text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white max-w-[100px] truncate"
                title={session.user?.email || 'Account'}
              >
                {session.user?.name || session.user?.email?.split('@')[0] || 'Account'}
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-full p-2 text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                title="Sign Out"
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
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