'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Heart, ArrowRight, Loader2, ShoppingBag, 
  Shirt, Compass, Sparkles, SlidersHorizontal 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer, CartItem } from '@/components/store/CartDrawer';
import { SearchModal } from '@/components/store/SearchModal';
import { useTranslation } from '@/components/providers/IntlProvider';

const CATEGORY_BOXES = [
  { name: 'All Items', translationKey: 'Categories.all', icon: Compass },
  { name: 'Tops', translationKey: 'Categories.tops', icon: Shirt },
  { name: 'Bottoms', translationKey: 'Categories.bottoms', icon: Sparkles },
  { name: 'Outerwear', translationKey: 'Categories.outerwear', icon: ShoppingBag },
];

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  images: string[];
}

export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  
  // LocalStorage State & Hydration Protection
  const [isMounted, setIsMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI Overlays State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load from LocalStorage ONLY after mounting on client
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('zyn_cart');
    const savedFavs = localStorage.getItem('zyn_favorites');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('zyn_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('zyn_favorites', JSON.stringify(favorites));
    }
  }, [favorites, isMounted]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to load products from API:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All Items' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = !showFavoritesOnly || favorites.includes(product.id);
    return matchesCategory && matchesSearch && matchesFav;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans tracking-tight">
      <Navbar
        favoriteCount={isMounted ? favorites.length : 0}
        cartCount={isMounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleFavoritesFilter={() => setShowFavoritesOnly((prev) => !prev)}
        isFavoritesFilterActive={showFavoritesOnly}
      />

      <main className="flex-1 w-full space-y-8 sm:space-y-12 pb-16">
        {/* HERO BANNER */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-6 sm:p-14 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl">
            <div className="space-y-4 sm:space-y-6 max-w-xl z-10 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-[10px] sm:text-xs font-mono text-[#ccff00]">
                <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                <span>50% OFF ON EVERYTHING TODAY</span>
              </div>
              
              <h1 className="text-3xl sm:text-6xl font-black uppercase tracking-tight leading-none text-white">
                ELEVATE IN YOUR <span className="text-[#ccff00]">UNIQUE</span> STYLE
              </h1>
              
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed font-medium">
                  Heavyweight essentials & engineered streetwear for timeless fit.
              </p> 
              <div className="pt-1 sm:pt-2">
                <Link
                  href="#catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ccff00] px-6 py-3 sm:px-8 sm:py-4 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition-all active:scale-95 shadow-lg shadow-[#ccff00]/20"
                >
                  {t('Navbar.catalog')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative w-full lg:w-1/2 h-48 sm:h-96 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200"
                alt="Streetwear Banner"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
            </div>
          </div>
        </section>

        {/* CATEGORY ICON GRID */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-3">
          <h2 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
            // {t('Categories.categorySelect')}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {CATEGORY_BOXES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setShowFavoritesOnly(false); }}
                  className={`flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4 border text-[11px] sm:text-xs font-extrabold uppercase transition-all ${
                    isActive && !showFavoritesOnly
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive && !showFavoritesOnly ? 'text-[#ccff00]' : 'text-zinc-500'}`} />
                  <span>{t(cat.translationKey)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* MAIN PRODUCT CATALOG */}
        <section id="catalog" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3 sm:pb-4">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
              {showFavoritesOnly ? t('Account.orders') : t('Categories.topProducts')}{' '}
              <span className="text-xs font-mono font-medium text-zinc-400">({filteredProducts.length})</span>
            </h2>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={t('Categories.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-8 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-black mb-2" />
              <p className="text-xs font-mono font-bold uppercase">{t('Checkout.processing')}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200">
              <p className="text-xs font-bold uppercase text-zinc-500">
                {showFavoritesOnly ? t('Account.noOrders') : 'No items found matching your filter.'}
              </p>
              <button
                onClick={() => { setSelectedCategory('All Items'); setSearchQuery(''); setShowFavoritesOnly(false); }}
                className="mt-3 text-xs font-black text-black underline uppercase"
              >
                Reset catalog filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredProducts.map((product) => {
                const isFav = isMounted && favorites.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white border border-zinc-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative aspect-[4/5] w-full bg-[#f4f4f5] overflow-hidden">
                      <Link href={`/products/${product.id}`} className="block h-full w-full">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800'}
                          alt={product.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black text-white text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase rounded pointer-events-none">
                        HOT
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-white/90 p-1.5 sm:p-2 text-zinc-700 shadow-sm hover:text-rose-500 transition-colors z-10"
                        aria-label="Favorite"
                        type="button"
                      >
                        <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2 sm:space-y-3">
                      <Link href={`/products/${product.id}`} className="block">
                        <p className="text-[9px] sm:text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                          {product.category}
                        </p>
                        <h3 className="text-[11px] sm:text-xs font-extrabold uppercase text-zinc-900 line-clamp-1 mt-0.5 group-hover:underline">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                        <span className="text-xs sm:text-sm font-black text-zinc-900">
                          {product.price.toFixed(2)} MAD
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00] inline-block"></span>
                          <span className="hidden sm:inline-block text-[10px] font-mono font-semibold text-zinc-400">{t('Product.inStock')}</span>
                        </div>
                      </div>

                      {/* BUY NOW CTA Button */}
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-black py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase text-white hover:bg-[#ccff00] hover:text-black transition-all text-center"
                      >
                        {t('Product.addToCart')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Slide-over Overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        query={searchQuery}
        setQuery={setSearchQuery}
        products={products}
      />

      <Footer />
    </div>
  );
}