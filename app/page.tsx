'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Heart, Loader2, 
  Compass, ArrowUpDown, Sparkles, FilterX, ArrowRight
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer, CartItem } from '@/components/store/CartDrawer';
import { SearchModal } from '@/components/store/SearchModal';
import { useTranslation } from '@/components/providers/IntlProvider';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  images: string[];
}

export default function CatalogPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'low-to-high' | 'high-to-low'>('featured');
  
  // LocalStorage State & Hydration Protection
  const [isMounted, setIsMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI Overlays State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load from LocalStorage after client mount
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

  // Fetch live products from Supabase API route
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        const data = await response.json();
        
        const productList = Array.isArray(data) ? data : data?.products;
        if (Array.isArray(productList)) {
          setProducts(productList);
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

  // Dynamic category list inferred directly from database items
  const dynamicCategories = [
    'All Items',
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Items' ||
        product.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesFav = !showFavoritesOnly || favorites.includes(product.id);
      return matchesCategory && matchesSearch && matchesFav;
    })
    .sort((a, b) => {
      if (sortBy === 'low-to-high') return a.price - b.price;
      if (sortBy === 'high-to-low') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans antialiased selection:bg-[#ccff00] selection:text-black transition-colors duration-200">
      <Navbar
        favoriteCount={isMounted ? favorites.length : 0}
        cartCount={isMounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleFavoritesFilter={() => setShowFavoritesOnly((prev) => !prev)}
        isFavoritesFilterActive={showFavoritesOnly}
      />

      <main className="flex-1 w-full pb-24 space-y-10">
        {/* HERO SECTION BANNER */}
        <section className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900/90 border border-zinc-800 p-8 md:p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            {/* Ambient background glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#ccff00]/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="space-y-6 max-w-xl z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-950 border border-[#ccff00]/30 px-3.5 py-1 text-[11px] font-mono text-[#ccff00] shadow-inner">
                <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span>● 50% OFF ON EVERYTHING TODAY</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none text-white">
                ELEVATE IN YOUR <span className="text-[#ccff00]">UNIQUE</span> STYLE
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed max-w-md">
                Heavyweight essentials, engineered streetwear, and limited edition drops designed for timeless fit.
              </p>

              <button
                onClick={() => {
                  const element = document.getElementById('catalog-grid');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#ccff00] px-6 py-3.5 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all active:scale-95 shadow-lg shadow-[#ccff00]/20 cursor-pointer"
              >
                Explore Drops <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
              {/* eslint-disable-next-html-element-for-img */}
              <img
                src="https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop"
                alt="Hero Streetwear"
                className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </section>

        {/* STICKY CONTROLS & FILTER BAR */}
        <section id="catalog-grid" className="sticky top-16 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-y border-zinc-200 dark:border-zinc-800/80 py-4 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {dynamicCategories.map((catName) => {
                const isActive = selectedCategory === catName && !showFavoritesOnly;
                return (
                  <button
                    key={catName}
                    onClick={() => { setSelectedCategory(catName); setShowFavoritesOnly(false); }}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black shadow-lg'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {catName === 'All Items' && <Compass className={`h-3.5 w-3.5 ${isActive ? 'text-white dark:text-black' : 'text-zinc-500 dark:text-[#ccff00]'}`} />}
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={t('Categories.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 py-2 pl-9 pr-4 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-[#ccff00] transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-3.5 py-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500 dark:text-[#ccff00] mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="featured" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Featured</option>
                  <option value="low-to-high" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Price: Low to High</option>
                  <option value="high-to-low" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Price: High to Low</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* PRODUCT GRID SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              TOP PRODUCTS <span className="text-xs font-mono font-normal text-zinc-500">({filteredProducts.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-black dark:text-[#ccff00]" />
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                Fetching live items...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                <FilterX className="h-5 w-5" />
              </div>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {showFavoritesOnly ? t('Account.noOrders') : 'No catalog items match your selected filters.'}
              </p>
              <button
                onClick={() => { setSelectedCategory('All Items'); setSearchQuery(''); setShowFavoritesOnly(false); setSortBy('featured'); }}
                className="inline-flex items-center gap-2 text-xs font-black text-black dark:text-[#ccff00] uppercase underline hover:text-zinc-700 dark:hover:text-lime-400 transition-colors cursor-pointer"
              >
                Reset all catalog filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isFav = isMounted && favorites.includes(product.id);
                const displayImg =
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop';

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl dark:hover:shadow-[#ccff00]/5 transition-all duration-300"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[4/5] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                      <Link href={`/products/${product.id}`} className="block h-full w-full">
                        {/* eslint-disable-next-html-element-for-img */}
                        <img
                          src={displayImg}
                          alt={product.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Stock Badge */}
                      <span className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-md text-[#ccff00] border border-[#ccff00]/20 text-[9px] font-mono font-bold px-2.5 py-1 uppercase rounded-full pointer-events-none">
                        ● IN STOCK
                      </span>

                      {/* Favorite Action Button */}
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="absolute right-3.5 top-3.5 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/60 p-2.5 text-zinc-700 dark:text-zinc-300 backdrop-blur-md hover:text-rose-500 hover:border-rose-500/50 transition-all z-10 cursor-pointer active:scale-90"
                        aria-label="Favorite"
                        type="button"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                      <Link href={`/products/${product.id}`} className="block space-y-1">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-[#ccff00] uppercase tracking-widest">
                          {product.category}
                        </span>
                        <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white line-clamp-1 group-hover:text-black dark:group-hover:text-[#ccff00] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price & Specs */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div>
                          <span className="text-base font-black text-zinc-900 dark:text-white">
                            {product.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 font-bold ml-1">MAD</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-[#ccff00] animate-pulse" />
                          <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase">In Stock</span>
                        </div>
                      </div>

                      {/* View Details Action */}
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black dark:bg-white py-3 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-[#ccff00] transition-all text-center active:scale-95 shadow-lg cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Slide-over Drawer & Search Overlay */}
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