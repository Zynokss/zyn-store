'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Sparkles, Truck, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { SearchModal } from '@/components/store/SearchModal';
import { ProductCard } from '@/components/store/ProductCard';
import { useCart } from '@/lib/CartContext';
import { Product as CatalogProduct } from '@/lib/types';
import { useLanguage } from '@/components/providers/IntlProvider';

const ITEMS_PER_PAGE = 8;

// Reusable shimmer block component for Facebook-style loading animation
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${className || ''}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
  </div>
);

// Shimmer skeleton grid matching ProductCard layout
function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden font-sans"
        >
          {/* Image Frame Skeleton */}
          <SkeletonBlock className="aspect-[3/4] w-full" />

          {/* Card Info Content Skeleton */}
          <div className="flex flex-col flex-1 p-4 space-y-3">
            <div className="space-y-1">
              <SkeletonBlock className="h-2 w-1/3 rounded-full" />
              <SkeletonBlock className="h-3.5 w-3/4 rounded-full" />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
              <SkeletonBlock className="h-3 w-1/4 rounded-full" />
              <SkeletonBlock className="h-2 w-1/5 rounded-full" />
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2 mt-auto">
              <SkeletonBlock className="col-span-3 h-8 rounded-full" />
              <SkeletonBlock className="col-span-2 h-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, isFavorite, updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();

  const catalogRef = useRef<HTMLDivElement>(null);

  const initialCategory = searchParams.get('category') || 'All Items';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as 'featured' | 'low-to-high' | 'high-to-low') || 'featured';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'low-to-high' | 'high-to-low'>(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Translate dynamic database categories safely
  const formatCategoryName = useCallback(
    (cat: string) => {
      if (!cat) return '';
      if (cat === 'All Items') return t('allItems');
      const key = cat.toLowerCase().trim();
      const translated = t(key);
      return translated && translated !== key ? translated : cat;
    },
    [t]
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const updateQueryParams = useCallback(
    (cat: string, q: string, sort: string, page: number) => {
      const params = new URLSearchParams();
      if (cat !== 'All Items') params.set('category', cat);
      if (q.trim()) params.set('q', q.trim());
      if (sort !== 'featured') params.set('sort', sort);
      if (page > 1) params.set('page', page.toString());
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : '/', { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const controller = new AbortController();
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const productList = Array.isArray(data) ? data : data?.products;
        if (Array.isArray(productList)) setProducts(productList);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load products:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    return () => controller.abort();
  }, []);

  const dynamicCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(String(p.category).trim());
    });
    return ['All Items', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const selCat = selectedCategory.toLowerCase().trim();

    return products
      .filter((product) => {
        const pCategory = product.category ? String(product.category).toLowerCase().trim() : '';
        const pName = product.name ? String(product.name).toLowerCase() : '';
        const matchesCategory = selectedCategory === 'All Items' || pCategory === selCat;
        const matchesSearch = !query || pName.includes(query) || pCategory.includes(query);
        const matchesFav = !showFavoritesOnly || isFavorite(product.id);
        return matchesCategory && matchesSearch && matchesFav;
      })
      .sort((a, b) => {
        if (sortBy === 'low-to-high') return Number(a.price) - Number(b.price);
        if (sortBy === 'high-to-low') return Number(b.price) - Number(a.price);
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, showFavoritesOnly, isFavorite, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const hoodiesSection = useMemo(() => products.filter((p) => p.category?.toLowerCase().includes('hoodie')).slice(0, 4), [products]);
  const teesSection = useMemo(() => products.filter((p) => p.category?.toLowerCase().includes('tee') || p.category?.toLowerCase().includes('t-shirt')).slice(0, 4), [products]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setShowFavoritesOnly(false);
    setCurrentPage(1);
    updateQueryParams(cat, searchQuery, sortBy, 1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    updateQueryParams(selectedCategory, q, sortBy, 1);
  };

  const handleSortChange = (sortVal: 'featured' | 'low-to-high' | 'high-to-low') => {
    setSortBy(sortVal);
    setCurrentPage(1);
    updateQueryParams(selectedCategory, searchQuery, sortVal, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateQueryParams(selectedCategory, searchQuery, sortBy, newPage);
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-[#9ae600] selection:text-black transition-colors duration-200">
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleFavoritesFilter={() => setShowFavoritesOnly((p) => !p)}
        isFavoritesFilterActive={showFavoritesOnly}
      />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2.5 shadow-xl text-xs font-medium tracking-wide rounded-full">
          {toastMsg}
        </div>
      )}

      <main className="flex-1 w-full overflow-hidden">
        {/* Full-Bleed Hero Section */}
        <section className="relative w-full min-h-[520px] sm:min-h-[640px] flex items-center justify-center bg-zinc-900 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&auto=format&fit=crop"
            alt="ZYN Streetwear Collection"
            fill
            priority
            className="object-cover object-center opacity-70 dark:opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Overlaid Editorial Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#9ae600]">
              {t('piecesLimited')}
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-none">
              STYLE EACH MOMENT
            </h1>

            <p className="text-xs sm:text-base font-medium text-zinc-200 max-w-xl mx-auto leading-relaxed">
              {t('subscribeText')}
            </p>

            <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={() => scrollToSection(catalogRef)}
                className="bg-white text-zinc-900 hover:bg-[#9ae600] hover:text-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer min-w-[160px] rounded-full"
              >
                {t('viewCatalog')}
              </button>
              <button
                onClick={() => handleCategoryChange('Hoodies')}
                className="bg-zinc-950/80 backdrop-blur-md text-white border border-zinc-700 hover:border-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer min-w-[160px] rounded-full"
              >
                {formatCategoryName('Hoodies')}
              </button>
            </div>
          </div>
        </section>

        {/* Feature Highlights Strip */}
        <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <Truck className="h-4 w-4 text-zinc-500 dark:text-[#9ae600] shrink-0" />
              <div>
                <span className="font-bold block text-zinc-900 dark:text-white text-xs">{t('freeShipping')}</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{t('freeShippingOn')}</span>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <Zap className="h-4 w-4 text-zinc-500 dark:text-[#9ae600] shrink-0" />
              <div>
                <span className="font-bold block text-zinc-900 dark:text-white text-xs">{t('returns')}</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{t('returnsPolicy')}</span>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <Sparkles className="h-4 w-4 text-zinc-500 dark:text-[#9ae600] shrink-0" />
              <div>
                <span className="font-bold block text-zinc-900 dark:text-white text-xs">{t('ecoPackaging')}</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{t('ecoDetails')}</span>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <ShieldCheck className="h-4 w-4 text-zinc-500 dark:text-[#9ae600] shrink-0" />
              <div>
                <span className="font-bold block text-zinc-900 dark:text-white text-xs">{t('securePayment')}</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">{t('secureDetails')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Soft Category Sticky Filter */}
        <div ref={catalogRef} id="catalog" className="sticky top-16 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {dynamicCategories.map((catName) => {
                const isActive = selectedCategory === catName && !showFavoritesOnly;
                const label = formatCategoryName(catName);
                return (
                  <button
                    key={catName}
                    onClick={() => handleCategoryChange(catName)}
                    className={`shrink-0 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border rounded-full ${
                      isActive
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Sort & Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  aria-label="Search catalog"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1.5 pl-8 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-full focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <select
                aria-label="Sort products by"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'featured' | 'low-to-high' | 'high-to-low')}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1.5 px-3 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 rounded-full focus:outline-none cursor-pointer transition-colors"
              >
                <option value="featured">{t('featured')}</option>
                <option value="low-to-high">{t('lowToHigh')}</option>
                <option value="high-to-low">{t('highToLow')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Product Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase text-start">
              {showFavoritesOnly ? t('cart') : formatCategoryName(selectedCategory)}{' '}
              <span className="text-xs font-normal text-zinc-500">({filteredProducts.length})</span>
            </h2>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl">
              <Search className="h-8 w-8 mx-auto text-zinc-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('emptyCart')}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('All Items');
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                  setSortBy('featured');
                  setCurrentPage(1);
                  updateQueryParams('All Items', '', 'featured', 1);
                }}
                className="text-xs font-semibold underline text-zinc-900 dark:text-white transition-all cursor-pointer"
              >
                {t('resetFilters')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenCart={() => setIsCartOpen(true)}
                    onToast={showToast}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-12 text-xs">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 disabled:opacity-40 font-semibold transition-colors cursor-pointer rounded-full"
                  >
                    <ChevronLeft className="h-4 w-4" /> {t('back')}
                  </button>

                  <span className="font-semibold text-zinc-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 disabled:opacity-40 font-semibold transition-colors cursor-pointer rounded-full"
                  >
                    {t('continue')} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Category Spotlight 1: Hoodies */}
        {hoodiesSection.length > 0 && selectedCategory === 'All Items' && !searchQuery && (
          <section className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
                <div>
                  <span className="text-[11px] font-bold text-[#9ae600] uppercase tracking-wider block">{t('curatedCollections')}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white uppercase">{formatCategoryName('Hoodies')}</h3>
                </div>
                <button
                  onClick={() => handleCategoryChange('Hoodies')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span>{t('viewCatalog')}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {hoodiesSection.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenCart={() => setIsCartOpen(true)}
                    onToast={showToast}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Editorial Mid-Store Brand Banner */}
        <section className="my-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-900 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl">
            <div className="space-y-3 max-w-xl z-10">
              <span className="text-[11px] font-bold text-[#9ae600] uppercase tracking-wider block">{t('subscribeStudio')}</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug uppercase">
                {t('subscribeText')}
              </h3>
            </div>
            <button
              onClick={() => scrollToSection(catalogRef)}
              className="z-10 shrink-0 bg-white text-zinc-900 hover:bg-[#9ae600] hover:text-black px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-full"
            >
              {t('viewCatalog')}
            </button>
          </div>
        </section>

        {/* Category Spotlight 2: Tees */}
        {teesSection.length > 0 && selectedCategory === 'All Items' && !searchQuery && (
          <section className="border-t border-zinc-200 dark:border-zinc-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
                <div>
                  <span className="text-[11px] font-bold text-[#9ae600] uppercase tracking-wider block">{t('curatedCollections')}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white uppercase">{formatCategoryName('Tees')}</h3>
                </div>
                <button
                  onClick={() => handleCategoryChange('Tees')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span>{t('viewCatalog')}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {teesSection.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenCart={() => setIsCartOpen(true)}
                    onToast={showToast}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pre-Footer Brand Statement */}
        <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white py-16 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <span className="text-xs font-bold text-[#9ae600] uppercase tracking-wider block">{t('subscribeStudio')}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight uppercase">
                ZYN STREETWEAR STUDIO
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                {t('subscribeText')}
              </p>
            </div>
            <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8 space-y-4">
              <div className="text-left md:text-right">
                <span className="text-[11px] text-zinc-500 uppercase block">{t('country')}</span>
                <span className="text-xs font-bold text-white uppercase">Morocco</span>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[11px] text-zinc-500 uppercase block">{t('newDrop')}</span>
                <span className="text-xs font-bold text-[#9ae600] uppercase">Season 04 Active</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
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

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-zinc-950 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}