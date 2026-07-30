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
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success && Array.isArray(data.products)) {
          const found = data.products.find((p: Product) => p.id === productId);
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
    fetchProduct();
  }, [productId]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    if (!product) return;

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
          image: product.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
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
      <div className="min-h-screen flex flex-col bg-white text-zinc-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-black mb-2" />
          <p className="text-xs font-mono font-bold uppercase">{t('Checkout.processing')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-zinc-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <p className="text-sm font-bold uppercase text-zinc-600">Product Not Found.</p>
          <Link href="/" className="mt-4 text-xs font-black uppercase underline text-black">
            {t('Cart.continue')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isFav = favorites.includes(product.id);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans tracking-tight">
      <Navbar
        favoriteCount={favorites.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('Cart.continue')}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Gallery Image */}
          <div className="relative aspect-[4/5] w-full rounded-2xl bg-[#f4f4f5] overflow-hidden border border-zinc-200">
            <img
              src={product.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-zinc-700 shadow-md hover:text-rose-500 transition-colors"
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Product Info & Selectors */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 mt-1">
                {product.name}
              </h1>
              <p className="text-2xl font-black text-zinc-900 mt-2">
                {product.price.toFixed(2)}{' '}
                <span className="text-xs font-mono font-normal text-zinc-400">MAD</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                Color: <span className="text-black">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === c.name ? 'border-black scale-110 shadow-sm' : 'border-zinc-200'
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
            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                {t('Product.selectSize')}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-[48px] px-4 rounded-xl text-xs font-black uppercase transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white shadow-md'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Basket Action */}
            <div className="pt-4 border-t border-zinc-100">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-4 text-xs font-black uppercase text-white hover:bg-[#ccff00] hover:text-black transition-all active:scale-95 shadow-lg"
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