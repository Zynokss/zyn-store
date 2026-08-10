'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Heart, Check, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer, CartItem } from '@/components/store/CartDrawer';
import { useTranslation } from '@/components/providers/IntlProvider';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  colors?: string[];
  images: string[];
  image?: string;
}

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Cart & Favorites LocalStorage State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('zyn_cart');
    const savedFavs = localStorage.getItem('zyn_favorites');
    queueMicrotask(() => {
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('zyn_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('zyn_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          const found = data.products.find(
            (p: Product) => String(p.id) === String(productId)
          );
          if (found) {
            setProduct(found);
            if (found.sizes && found.sizes.length > 0) {
              setSelectedSize(found.sizes[0]);
            }
            if (found.colors && found.colors.length > 0) {
              setSelectedColor(found.colors[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    if (!product) return;
    const displayImage =
      (Array.isArray(product.images) && product.images[0]) ||
      product.image ||
      'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop';

    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
    const displayName = hasColors && selectedColor ? `${product.name} (${selectedColor})` : product.name;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          (hasColors ? item.selectedColor === selectedColor : true)
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: displayName,
          price: product.price,
          image: displayImage,
          category: product.category,
          quantity: 1,
          selectedSize: selectedSize,
          selectedColor: hasColors ? selectedColor : undefined,
        },
      ];
    });
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#ccff00] mb-2" />
          <p className="text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
            {t('Checkout.processing')}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <p className="text-sm font-bold uppercase text-zinc-500 dark:text-zinc-400">
            Product Not Found.
          </p>
          <Link href="/" className="mt-4 text-xs font-black uppercase underline text-black dark:text-[#ccff00]">
            {t('Cart.continue')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isFav = favorites.includes(product.id);
  const mainImage =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop';

  const hasColorVariants = Array.isArray(product.colors) && product.colors.length > 0;

  // Add-to-cart translation string resolution with fallback
  const addToCartText =
    t('Product.addToCart') !== 'Product.addToCart'
      ? t('Product.addToCart')
      : t('addToCart') !== 'addToCart'
      ? t('addToCart')
      : 'ADD TO CART';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans tracking-tight transition-colors duration-200">
      <Navbar
        favoriteCount={favorites.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-[#ccff00] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('Cart.continue')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="relative aspect-[4/5] w-full rounded-3xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
            {/* eslint-disable-next-html-element-for-img */}
            <img
              src={mainImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute right-4 top-4 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700/60 p-3 text-zinc-700 dark:text-zinc-300 backdrop-blur-md hover:text-rose-500 transition-all cursor-pointer shadow-md active:scale-90"
              aria-label="Favorite"
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-[#ccff00]">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-1">
                {product.name}
              </h1>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                {product.price.toFixed(2)}{' '}
                <span className="text-xs font-mono font-normal text-zinc-400">MAD</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Render Color Options conditionally if specified for product */}
            {hasColorVariants && (
              <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Color: <span className="text-zinc-900 dark:text-white uppercase">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-3">
                  {product.colors!.map((colorName) => {
                    const cleanColor = colorName.trim();
                    const isHex = cleanColor.startsWith('#');
                    const lower = cleanColor.toLowerCase();

                    const bgStyle = isHex
                      ? cleanColor
                      : lower.includes('black')
                      ? '#000000'
                      : lower.includes('white')
                      ? '#ffffff'
                      : lower.includes('red')
                      ? '#ef4444'
                      : lower.includes('orange')
                      ? '#f97316'
                      : lower.includes('gray') || lower.includes('grey')
                      ? '#888888'
                      : lower.includes('brown')
                      ? '#654321'
                      : lower.includes('blue')
                      ? '#3b82f6'
                      : lower.includes('green')
                      ? '#22c55e'
                      : '#27272a';

                    return (
                      <button
                        key={cleanColor}
                        type="button"
                        onClick={() => setSelectedColor(cleanColor)}
                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                          selectedColor === cleanColor
                            ? 'border-black dark:border-[#ccff00] scale-110 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                        style={{ backgroundColor: bgStyle }}
                        title={cleanColor}
                      >
                        {selectedColor === cleanColor && (
                          <Check
                            className={`h-4 w-4 ${
                              bgStyle === '#ffffff' || lower.includes('white')
                                ? 'text-black'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t('Product.selectSize') !== 'Product.selectSize' ? t('Product.selectSize') : 'Select Size'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-[48px] px-4 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black shadow-md'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black dark:bg-[#ccff00] py-4 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> {addToCartText} - {product.price.toFixed(2)} MAD
              </button>
            </div>
          </div>
        </div>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={(id, delta) =>
          setCart((prev) =>
            prev
              .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
              .filter((item) => item.quantity > 0)
          )
        }
        onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
      />
      <Footer />
    </div>
  );
}