'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Heart, Check, Loader2, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { useTranslation } from '@/components/providers/IntlProvider';
import { useCart } from '@/lib/CartContext';
import { Product } from '@/lib/types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=1000&auto=format&fit=crop';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const productId = params.id as string;
  const { addToCart, toggleFavorite, isFavorite, cart, updateQuantity, removeFromCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, { cache: 'no-store' });
        const data = await response.json();
        if (data.success && data.product) {
          const p = data.product;
          setProduct(p);
          if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
          if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0]);
        } else {
          const allRes = await fetch('/api/products', { cache: 'no-store' });
          const allData = await allRes.json();
          if (allData.success && Array.isArray(allData.products)) {
            const found = allData.products.find((p: Product) => String(p.id) === String(productId));
            if (found) {
              setProduct(found);
              if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
              if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart(product, selectedSize, {
      quantity,
      color: selectedColor || undefined,
    });
    setIsCartOpen(true);
    showToast(`Added "${product.name}" (${selectedSize}) to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#9ae600] mb-3" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {t('loadingProduct')}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-6 border border-zinc-200 dark:border-zinc-800">
            <ShoppingBag className="h-10 w-10 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-800 dark:text-zinc-200 mb-2">
            Product Not Found.
          </h2>
          <p className="text-xs text-zinc-500 mb-6 max-w-sm text-center leading-relaxed">
            The item you&apos;re looking for doesn&apos;t exist or may have been removed from the catalog.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-md"
          >
            <ArrowLeft className="h-4 w-4" /> {t('returnToStore')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isFav = isFavorite(product.id);
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image || DEFAULT_IMAGE];
  const mainImage = productImages[selectedImageIdx] || productImages[0] || DEFAULT_IMAGE;
  const hasColorVariants = Array.isArray(product.colors) && product.colors.length > 0;
  const displayPrice = Number(product.price) || 0;
  const displayTotal = Number((displayPrice * quantity).toFixed(2));

  const addToCartText = t('addToCart');

  const colorSwitchBg = (colorName: string): string => {
    const clean = String(colorName || '').trim();
    const lower = clean.toLowerCase();
    if (clean.startsWith('#')) return clean;
    if (lower.includes('black')) return '#000000';
    if (lower.includes('white')) return '#ffffff';
    if (lower.includes('red')) return '#ef4444';
    if (lower.includes('orange')) return '#f97316';
    if (lower.includes('cream') || lower.includes('beige')) return '#f5f5dc';
    if (lower.includes('sand') || lower.includes('tan')) return '#d4b896';
    if (lower.includes('olive')) return '#556b2f';
    if (lower.includes('gray') || lower.includes('grey')) return '#71717a';
    if (lower.includes('brown')) return '#78350f';
    if (lower.includes('blue')) return '#2563eb';
    if (lower.includes('green')) return '#16a34a';
    if (lower.includes('purple')) return '#7c3aed';
    if (lower.includes('pink')) return '#ec4899';
    if (lower.includes('navy')) return '#1e3a8a';
    if (lower.includes('camel')) return '#c19a6b';
    if (lower.includes('burgundy') || lower.includes('wine')) return '#722f37';
    return '#27272a';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans antialiased transition-colors duration-200">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2.5 rounded-full shadow-2xl text-xs font-semibold tracking-wide border border-zinc-700">
          {toastMsg}
        </div>
      )}

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 sm:mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t('returnToStore')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm group">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                unoptimized
                className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.03]"
              />

              {/* Top Floating Badges */}
              {product.featured && (
                <span className="absolute left-4 top-4 bg-zinc-900/80 text-[#9ae600] backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-zinc-700/50 z-10">
                  FEATURED
                </span>
              )}

              {/* Floating Favorite Button */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute right-4 top-4 rounded-full bg-white/80 dark:bg-zinc-900/80 p-3 text-zinc-700 dark:text-zinc-200 backdrop-blur-md hover:bg-white hover:text-rose-500 transition-all duration-200 cursor-pointer shadow-md z-10"
                aria-label="Favorite"
              >
                <Heart className={`h-5 w-5 transition-transform ${isFav ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
              </button>

              {/* Next/Prev Controls */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx((p) => (p - 1 + productImages.length) % productImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md z-10 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx((p) => (p + 1) % productImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md z-10 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedImageIdx === i
                        ? 'border-zinc-900 dark:border-white shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`View ${i + 1}`}
                      fill
                      unoptimized
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Order Controls */}
          <div className="space-y-6 lg:py-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9ae600]">
                  {product.category}
                </span>
                {product.inStock === false && (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    {t('outOfStockBadge')}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
                  {displayPrice.toFixed(2)}
                </p>
                <span className="text-xs font-semibold text-zinc-500 uppercase">
                  MAD
                </span>
                {quantity > 1 && (
                  <span className="text-xs font-semibold text-zinc-500 ml-auto border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    Total: <span className="font-extrabold text-zinc-900 dark:text-white">{displayTotal.toFixed(2)} MAD</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
              {product.description}
            </p>

            <div className="space-y-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
              
              {/* Quantity Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full bg-zinc-50 dark:bg-zinc-900 w-fit">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-5 py-2 text-xs font-bold tabular-nums w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Color Variants */}
              {hasColorVariants && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                    Color: <span className="text-zinc-900 dark:text-white font-bold">{selectedColor}</span>
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {product.colors!.map((colorName) => {
                      const clean = String(colorName).trim();
                      const bg = colorSwitchBg(clean);
                      const isLight =
                        clean.toLowerCase().includes('white') ||
                        clean.toLowerCase().includes('cream') ||
                        clean.toLowerCase().includes('beige') ||
                        clean.toLowerCase().includes('sand') ||
                        bg === '#ffffff' ||
                        bg === '#f5f5dc' ||
                        bg === '#d4b896' ||
                        bg === '#c19a6b';
                      return (
                        <button
                          key={clean}
                          type="button"
                          onClick={() => setSelectedColor(clean)}
                          className={`group relative h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                            selectedColor === clean
                              ? 'border-zinc-900 dark:border-white scale-110 shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 ring-zinc-400'
                              : 'border-zinc-200 dark:border-zinc-700 hover:scale-105'
                          }`}
                          style={{ backgroundColor: bg }}
                          title={clean}
                        >
                          {selectedColor === clean && (
                            <Check
                              className={`h-4 w-4 font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}
                              strokeWidth={3}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector Pills */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                  {t('selectSize')}
                  {selectedSize && (
                    <span className="text-zinc-900 dark:text-white font-bold ml-1">— {selectedSize}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL']).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                        selectedSize === size
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Add to Cart */}
            <div className="pt-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false || !selectedSize}
                className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black py-4 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-colors shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{addToCartText}</span>
                <span className="opacity-80 font-normal">— {displayTotal.toFixed(2)} MAD</span>
              </button>

              {/* Guarantee Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 text-center">
                  <TruckIcon />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 leading-tight">
                    Fast Delivery
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 text-center">
                  <ShieldIcon />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 leading-tight">
                    Small Batch
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 text-center">
                  <LeafIcon />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 leading-tight">
                    Pay On Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={(id, delta, size, color) => updateQuantity(id, delta, size, color)}
        onRemoveItem={(id, size, color) => removeFromCart(id, size, color)}
      />
      <Footer />
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 dark:text-[#9ae600]">
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 dark:text-[#9ae600]">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 dark:text-[#9ae600]">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}