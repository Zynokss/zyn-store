'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  images: string[];
  image?: string;
}

const COLOR_OPTIONS = [
  { name: 'Pitch Black', hex: '#000000' },
  { name: 'Studio Gray', hex: '#888888' },
  { name: 'Earth Brown', hex: '#654321' },
];

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0].name);

  // Cart & Favorites LocalStorage State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('zyn_cart');
    const savedFavs = localStorage.getItem('zyn_favorites');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
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
        // Explicitly bypass caching so live DB data is returned
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

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize
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
          name: `${product.name} (${selectedColor})`,
          price: product.price,
          image: displayImage,
          category: product.category,
          quantity: 1,
          selectedSize: selectedSize,
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans tracking-tight transition-colors duration-200">
      <Navbar
        favoriteCount={favorites.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-[#ccff00] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('Cart.continue')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Gallery Image */}
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

          {/* Product Info & Selectors */}
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

            {/* Color Selector */}
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Color: <span className="text-zinc-900 dark:text-white">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor === c.name 
                        ? 'border-black dark:border-[#ccff00] scale-110 shadow-sm' 
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && (
                      <Check className={`h-4 w-4 ${c.hex === '#000000' ? 'text-white' : 'text-black'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {t('Product.selectSize')}
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

            {/* Add to Basket Action */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black dark:bg-[#ccff00] py-4 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> {t('Product.addToCart')} — {product.price.toFixed(2)} MAD
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