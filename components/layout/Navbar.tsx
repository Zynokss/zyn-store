'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut } from '@neondatabase/neon-js/auth/react/ui';
import { ShoppingBag, Search, Heart, User, Globe, Sun, Moon, ChevronDown, Check, Package, Settings, LogOut } from 'lucide-react';
import { useTranslation } from '@/components/providers/IntlProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useCart } from '@/lib/CartContext';
import { neon } from '@/lib/neon';

interface NavbarProps {
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onToggleFavoritesFilter?: () => void;
  isFavoritesFilterActive?: boolean;
}

interface NeonSessionUser {
  id?: string;
  name?: string;
  email?: string;
}

interface NeonSessionData {
  user?: NeonSessionUser;
}

export function Navbar({
  onOpenCart,
  onOpenSearch,
  onToggleFavoritesFilter,
  isFavoritesFilterActive = false,
}: NavbarProps) {
  const { locale, setLocale, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { totalItems, favoriteCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const useSession = neon.auth.useSession as () => {
    data?: NeonSessionData;
    isPending?: boolean;
  };
  const { data: sessionData } = useSession?.() || {};

  const LANGS = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'ar', label: 'العربية', short: 'AR' },
  ] as const;
  const currentLang = LANGS.find((l) => l.code === locale) || LANGS[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const cartBadge = mounted ? totalItems : 0;
  const favBadge = mounted ? favoriteCount : 0;

  return (
    <header className="sticky top-0 z-50 w-full font-sans transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-zinc-950 text-white text-[11px] font-sans font-medium py-2 px-4 text-center tracking-wider border-b border-zinc-800 flex items-center justify-between sm:justify-center gap-4">
        <span>Get 20% off when you subscribe to regular updates with code: <strong className="text-[#9ae600] font-bold">ZYN20</strong></span>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-zinc-400 uppercase tracking-widest">
          <span>City Studio</span>
          <span>•</span>
          <span>Express Delivery</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          
          {/* Brand Logo & Main Nav Links */}
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="text-2xl sm:text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase transition-opacity hover:opacity-80"
            >
              ZYN<span className="text-[#9ae600]">.</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              <Link href="/#catalog" className="hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
                {t('catalog')}
              </Link>
              <Link href="/#catalog" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 py-1">
                <span>{t('newDrop')}</span>
                <span className="bg-[#9ae600] text-black text-[9px] px-1.5 py-0.5 font-bold leading-none">
                  NEW
                </span>
              </Link>
              <Link href="/track-order" className="hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
                {t('trackOrder')}
              </Link>
              <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors py-1">
                {t('contact')}
              </Link>
            </nav>
          </div>

          {/* Search Bar (ASOS-Style Pill) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-2 px-4 text-xs text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <span className="truncate">Search for garments, drops and styles...</span>
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white cursor-pointer"
              type="button"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Toggle Theme"
                type="button"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-[#9ae600]" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* Language Switcher */}
            <div className="hidden md:flex items-center relative" ref={langRef}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1 p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white cursor-pointer text-xs font-semibold uppercase"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Change language"
              >
                <Globe className="h-4 w-4" />
                <span>{currentLang.short}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 top-full mt-2 w-36 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl z-[60]"
                >
                  {LANGS.map((l) => {
                    const active = locale === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLocale(l.code);
                          setLangOpen(false);
                        }}
                        role="option"
                        aria-selected={active}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                          active
                            ? 'bg-zinc-100 dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <span>{l.label}</span>
                        {active && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Favorites Button */}
            <button
              onClick={onToggleFavoritesFilter}
              className={`relative p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer ${
                isFavoritesFilterActive ? 'text-rose-600 dark:text-rose-500' : ''
              }`}
              type="button"
              aria-label="Toggle favorites"
            >
              <Heart className={`h-5 w-5 ${favBadge > 0 || isFavoritesFilterActive ? 'fill-current' : ''}`} />
              {favBadge > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-[#9ae600] text-black text-[9px] font-bold rounded-full">
                  {favBadge}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              type="button"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartBadge > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center bg-[#9ae600] text-black text-[9px] font-bold rounded-full">
                  {cartBadge > 99 ? '99+' : cartBadge}
                </span>
              )}
            </button>

            {/* Account Menu */}
            <SignedIn>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  type="button"
                  className="p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <User className="h-5 w-5" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl z-[70]">
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-900">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {sessionData?.user?.name || 'Account'}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {sessionData?.user?.email || ''}
                      </p>
                    </div>

                    <div className="py-1 text-xs">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Package className="h-4 w-4 text-zinc-400" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Settings className="h-4 w-4 text-zinc-400" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          try {
                            await neon.auth.signOut?.({});
                          } catch {}
                          if (typeof window !== 'undefined') {
                            window.location.href = '/';
                          }
                        }}
                        type="button"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left border-t border-zinc-100 dark:border-zinc-900 mt-1"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SignedIn>

            <SignedOut>
              <Link
                href="/auth/sign-in"
                className="p-2 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white cursor-pointer"
                aria-label={t('signIn') || 'Sign in'}
              >
                <User className="h-5 w-5" />
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}