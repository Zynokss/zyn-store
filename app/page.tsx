'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Heart, Loader2, ShoppingBag, 
  Compass, ArrowUpDown 
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
        const response = await fetch('/api/products');
        const data = await response.json();
        
        // Flexible check: works with both direct arrays and `{ success: true, products: [...] }`
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
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = !showFavoritesOnly || favorites.includes(product.id);
      return matchesCategory && matchesSearch && matchesFav;
    })
    .sort((a, b) => {
      if (sortBy === 'low-to-high') return a.price - b.price;
      if (sortBy === 'high-to-low') return b.price - a.price;
      return 0;
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

      <main className="flex-1 w-full space-y-6 sm:space-y-8 pb-16">
        {/* CATALOG HEADER BANNER */}
        <section className="bg-zinc-950 text-white border-b border-zinc-800 py-10 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-[10px] sm:text-xs font-mono text-[#ccff00]">
              <span className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse"></span>
              <span>FULL INVENTORY CATALOG</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              THE <span className="text-[#ccff00]">COLLECTION</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-medium">
              Browse heavyweight essentials, custom streetwear drops, and limited edition items.
            </p>
          </div>
        </section>

        {/* CONTROLS & FILTER BAR */}
        <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl">
            {/* Dynamic Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {dynamicCategories.map((catName) => {
                const isActive = selectedCategory === catName;
                return (
                  <button
                    key={catName}
                    onClick={() => { setSelectedCategory(catName); setShowFavoritesOnly(false); }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold uppercase whitespace-nowrap transition-all cursor-pointer ${
                      isActive && !showFavoritesOnly
                        ? 'bg-black text-white shadow-md'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                    }`}
                  >
                    {catName === 'All Items' && <Compass className="h-3.5 w-3.5 text-[#ccff00]" />}
                    <span>{catName}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t('Categories.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Sort Selector */}
              <div className="relative flex items-center bg-white border border-zinc-200 rounded-xl px-3 py-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-extrabold uppercase text-zinc-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-black mb-2" />
              <p className="text-xs font-mono font-bold uppercase">{t('Checkout.processing')}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200">
              <p className="text-sm font-bold uppercase text-zinc-500">
                {showFavoritesOnly ? t('Account.noOrders') : 'No catalog items match your selected filters.'}
              </p>
              <button
                onClick={() => { setSelectedCategory('All Items'); setSearchQuery(''); setShowFavoritesOnly(false); setSortBy('featured'); }}
                className="mt-4 text-xs font-black text-black underline uppercase cursor-pointer"
              >
                Reset all catalog filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => {
                const isFav = isMounted && favorites.includes(product.id);
                const displayImg =
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop';

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[4/5] w-full bg-[#f4f4f5] overflow-hidden">
                      <Link href={`/products/${product.id}`} className="block h-full w-full">
                        <img
                          src={displayImg}
                          alt={product.name}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase rounded pointer-events-none">
                        IN STOCK
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm hover:text-rose-500 transition-colors z-10 cursor-pointer"
                        aria-label="Favorite"
                        type="button"
                      >
                        <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                      <Link href={`/products/${product.id}`} className="block">
                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                          {product.category}
                        </p>
                        <h3 className="text-xs font-extrabold uppercase text-zinc-900 line-clamp-1 mt-0.5 group-hover:underline">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        <span className="text-sm font-black text-zinc-900">
                          {product.price.toFixed(2)} MAD
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00] inline-block"></span>
                          <span className="text-[10px] font-mono font-semibold text-zinc-400">{t('Product.inStock')}</span>
                        </div>
                      </div>

                      {/* View Product CTA */}
                      <Link
                        href={`/products/${product.id}`}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-black uppercase text-white hover:bg-[#ccff00] hover:text-black transition-all text-center"
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