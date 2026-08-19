'use client'; 

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Truck, ShieldCheck, Zap, ArrowUpRight, Pause, Play } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { SearchModal } from '@/components/store/SearchModal';
import { ProductCard } from '@/components/store/ProductCard';
import { useCart } from '@/lib/CartContext';
import { Product as CatalogProduct } from '@/lib/types';
import { useLanguage } from '@/components/providers/IntlProvider';

function LandingPageContent() {
  const router = useRouter();
  const { updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Home Page Section Filter States
  const [genderCategory, setGenderCategory] = useState<'Men' | 'Women' | 'Kids'>('Men');
  const [bestsellerTab, setBestsellerTab] = useState<'Men' | 'Women' | 'Kids'>('Men');

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        badge: t('piecesLimited'),
        leftTitle: 'TRACK &',
        rightTitle: 'STREET.',
        subtext: 'Engineered Sportswear & Athleisure Fits',
        leftImg: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1200&auto=format&fit=crop',
        rightImg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop',
        category: 'Hoodies',
      },
      {
        id: 2,
        badge: 'SEASON 04 DROP',
        leftTitle: 'ATHLETIC',
        rightTitle: 'ESSENTIALS.',
        subtext: '400GSM Oversized Heavyweight Cotton',
        leftImg: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop',
        rightImg: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&auto=format&fit=crop',
        category: 'Tees',
      },
      {
        id: 3,
        badge: 'EXCLUSIVE ARCHIVE',
        leftTitle: 'URBAN',
        rightTitle: 'SPORTWEAR.',
        subtext: 'Designed in Morocco',
        leftImg: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1200&auto=format&fit=crop',
        rightImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop',
        category: 'Streetwear',
      },
    ],
    [t]
  );

  // Auto-advance
  useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, isDragging, heroSlides.length]);

  // Dragging Mechanics
  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setIsDragging(true);
  };
  const handleDragMove = (clientX: number) => {
    if (!isDragging || dragStartX === null) return;
    setDragOffset(clientX - dragStartX);
  };
  const handleDragEnd = () => {
    if (dragStartX !== null) {
      if (dragOffset < -60) {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      } else if (dragOffset > 60) {
        setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
      }
    }
    setDragStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

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
      }
    }
    fetchProducts();
    return () => controller.abort();
  }, []);

  const bestsellers = useMemo(() => products.slice(0, 4), [products]);

  const navigateToCatalog = (categoryName?: string) => {
    if (categoryName && categoryName !== 'All Items') {
      router.push(`/catalog?category=${encodeURIComponent(categoryName)}`);
    } else {
      router.push('/catalog');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-[#9ae600] selection:text-black transition-colors duration-200">
      
      {/* Top Marquee Bar */}
      <div className="bg-[#9ae600] text-black border-b border-black text-xs font-black uppercase tracking-widest py-2 px-4 flex items-center justify-between">
        <div className="flex-1 text-center font-mono text-[10px] sm:text-xs tracking-wider truncate">
          FORECAST: TEES & SHORTS   STAPLES FOR THE SUN   {t('freeShippingOn')}
        </div>
        <button
          onClick={() => setIsPaused((p) => !p)}
          aria-label="Pause announcement ticker"
          className="hidden sm:flex items-center justify-center h-5 w-5 rounded-full border border-black/40 hover:border-black text-black cursor-pointer transition-colors"
        >
          {isPaused ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
        </button>
      </div>

      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleFavoritesFilter={() => navigateToCatalog()}
        isFavoritesFilterActive={false}
      />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2.5 shadow-xl text-xs font-medium tracking-wide rounded-full">
          {toastMsg}
        </div>
      )}

      <main className="flex-1 w-full overflow-hidden">
        {/* Story Circle Navigation */}
        <section className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 py-6 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-6 sm:gap-10 overflow-x-auto py-3 px-2 scrollbar-none snap-x touch-pan-x">
            {[
              { id: 'All Items', label: t('allItems'), img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop' },
              { id: 'Hoodies', label: 'Hoodies', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop' },
              { id: 'Tees', label: 'Tees', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop' },
              { id: 'Streetwear', label: 'Streetwear', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&auto=format&fit=crop' },
              { id: 'Accessories', label: 'Accessories', img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=300&auto=format&fit=crop' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigateToCatalog(cat.id)}
                className="flex flex-col items-center gap-2.5 group shrink-0 cursor-pointer focus:outline-none snap-start"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 transition-all duration-300 border border-zinc-300 dark:border-zinc-700 hover:border-[#9ae600] group-hover:scale-105">
                  <Image
                    src={cat.img}
                    alt={cat.label}
                    fill
                    className="object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 group-hover:text-[#9ae600] transition-colors">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Hero Slider Carousel */}
        <section
          className="relative w-full bg-zinc-900 border-b border-zinc-800 overflow-hidden select-none cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="relative min-h-[480px] sm:min-h-[600px] overflow-hidden">
            <div
              className="flex w-full h-full min-h-[480px] sm:min-h-[600px] touch-pan-y"
              style={{
                transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                transition: isDragging ? 'none' : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="w-full shrink-0 min-w-full grid grid-cols-1 md:grid-cols-2 h-full min-h-[480px] sm:min-h-[600px]"
                >
                  <div className="relative flex items-end p-6 sm:p-12 min-h-[240px] sm:min-h-[400px] group overflow-hidden">
                    <Image
                      src={slide.leftImg}
                      alt={slide.leftTitle}
                      fill
                      priority
                      draggable={false}
                      className="object-cover object-center grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="relative z-10 space-y-2">
                      <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#9ae600] leading-none drop-shadow-md">
                        {slide.leftTitle}
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-widest text-white">{slide.badge}</p>
                    </div>
                  </div>
                  <div className="relative flex items-end justify-between p-6 sm:p-12 min-h-[240px] sm:min-h-[400px] group overflow-hidden border-t md:border-t-0 md:border-l border-zinc-800">
                    <Image
                      src={slide.rightImg}
                      alt={slide.rightTitle}
                      fill
                      priority
                      draggable={false}
                      className="object-cover object-center grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="relative z-10 space-y-3 w-full flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                      <div>
                        <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#9ae600] leading-none drop-shadow-md">
                          {slide.rightTitle}
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">{slide.subtext}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToCatalog(slide.category);
                        }}
                        className="bg-black/80 hover:bg-[#9ae600] hover:text-black border border-white/80 hover:border-[#9ae600] text-white px-6 py-3 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer rounded-none backdrop-blur-sm shrink-0"
                      >
                        <span>{t('viewCatalog')}</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Category Banners Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Category</h2>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800">
              {(['Men', 'Women', 'Kids'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setGenderCategory(tab)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase transition-all rounded ${
                    genderCategory === tab
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab}&apos;s
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigateToCatalog('Clothing')}
              className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800"
            >
              <Image
                src="https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&auto=format&fit=crop"
                alt="Clothing"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 space-y-2">
                <h3 className="text-2xl font-black text-white uppercase">Clothing</h3>
                <span className="inline-block px-4 py-1.5 border border-white/80 bg-black/40 backdrop-blur-sm text-white text-xs font-extrabold uppercase hover:bg-white hover:text-black transition-colors">
                  Shop Now
                </span>
              </div>
            </div>
            <div
              onClick={() => navigateToCatalog('Footwear')}
              className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800"
            >
              <Image
                src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop"
                alt="Footwear"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 space-y-2">
                <h3 className="text-2xl font-black text-white uppercase">Footwear</h3>
                <span className="inline-block px-4 py-1.5 border border-white/80 bg-black/40 backdrop-blur-sm text-white text-xs font-extrabold uppercase hover:bg-white hover:text-black transition-colors">
                  Shop Now
                </span>
              </div>
            </div>
            <div
              onClick={() => navigateToCatalog('Accessories')}
              className="relative aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800"
            >
              <Image
                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop"
                alt="Accessories"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 space-y-2">
                <h3 className="text-2xl font-black text-white uppercase">Accessories</h3>
                <span className="inline-block px-4 py-1.5 border border-white/80 bg-black/40 backdrop-blur-sm text-white text-xs font-extrabold uppercase hover:bg-white hover:text-black transition-colors">
                  Shop Now
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Discount Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left z-10">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                STUDENTS, SAVE MORE. <span className="text-[#9ae600]">20% OFF*</span>
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">*Exclusions apply. Limited time only. T&Cs Apply.</p>
            </div>
            <button
              onClick={() => navigateToCatalog()}
              className="z-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-[#9ae600] dark:hover:bg-[#9ae600] dark:hover:text-black font-black text-xs uppercase px-8 py-3.5 rounded-full transition-colors shrink-0 cursor-pointer"
            >
              Claim Discount
            </button>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Bestsellers</h2>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
              {(['Men', 'Women', 'Kids'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBestsellerTab(tab)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase transition-all rounded ${
                    bestsellerTab === tab
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {bestsellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenCart={() => setIsCartOpen(true)}
                onToast={showToast}
              />
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => navigateToCatalog()}
              className="inline-block border border-zinc-900 dark:border-white px-8 py-3 text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Shop All Bestsellers
            </button>
          </div>
        </section>

        {/* Dual Spotlight Banners */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => navigateToCatalog('Hoodies')}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800"
            >
              <Image
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop"
                alt="Coats & Jackets"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 left-6 right-6 text-center bg-white/90 dark:bg-black/90 backdrop-blur-md py-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Back to School Coats & Jackets
                </span>
              </div>
            </div>
            <div
              onClick={() => navigateToCatalog('Footwear')}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-zinc-200 dark:border-zinc-800"
            >
              <Image
                src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop"
                alt="Triple Black Footwear"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 left-6 right-6 text-center bg-white/90 dark:bg-black/90 backdrop-blur-md py-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Triple Black Footwear
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Footer Brand Statement */}
        <section className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white py-16 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <span className="text-xs font-black text-[#9ae600] uppercase tracking-wider block">{t('subscribeStudio')}</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight uppercase">
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
        items={useCart().cart}
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" />}>
      <LandingPageContent />
    </Suspense>
  );
}