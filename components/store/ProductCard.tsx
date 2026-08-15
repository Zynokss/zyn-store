'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check, Heart, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenCart?: () => void;
  onToast?: (msg: string) => void;
  showFavorite?: boolean;
}

export function ProductCard({
  product,
  onOpenCart,
  onToast,
  showFavorite = true,
}: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const defaultSize =
    Array.isArray(product.sizes) && product.sizes[0] ? product.sizes[0] : 'M';
  const displayImage =
    (!imgError && product.images?.[0]) ||
    product.image ||
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&auto=format&fit=crop';
  const favorite = isFavorite(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, defaultSize, { quantity: 1 });

    setAdded(true);
    if (onToast) onToast(`Added to cart: ${product.name}`);
    setTimeout(() => setAdded(false), 1800);

    if (onOpenCart) {
      setTimeout(() => onOpenCart(), 350);
    }
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    if (onToast) onToast(favorite ? `Removed from favorites` : `Added to favorites`);
  };

  const priceNum = Number(product.price) || 0;
  const isInStock = product.inStock !== false;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 font-sans">
      
      {/* Image Frame */}
      <div className="relative aspect-[3/4] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            unoptimized
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Top Floating Stock Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${
              isInStock
                ? 'bg-zinc-900/80 text-[#9ae600] border border-zinc-700/50'
                : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
            }`}
          >
            {isInStock ? 'In Stock' : 'Sold Out'}
          </span>
        </div>

        {/* Floating Favorite Button */}
        {showFavorite && (
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              favorite
                ? 'bg-white text-rose-500 scale-110'
                : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-200 hover:bg-white hover:text-black dark:hover:bg-zinc-900'
            }`}
          >
            <Heart className={`h-4 w-4 transition-transform duration-200 active:scale-125 ${favorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Info Content */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        
        {/* Category & Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
            {product.category || 'STREETWEAR'}
          </span>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors uppercase tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Stock Status */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black text-zinc-900 dark:text-white">
              {priceNum.toFixed(2)}
            </span>
            <span className="text-[10px] font-normal text-zinc-500 uppercase">
              MAD
            </span>
          </div>

          <span className="text-[10px] font-semibold text-emerald-600 dark:text-[#9ae600] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-[#9ae600] animate-pulse" />
            {isInStock ? 'In Stock' : 'Out Of Stock'}
          </span>
        </div>

        {/* Action Button Row */}
        <div className="grid grid-cols-5 gap-2 pt-2 mt-auto">
          <Link
            href={`/products/${product.id}`}
            className="col-span-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-[#9ae600] hover:text-black hover:border-[#9ae600] text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider transition-all cursor-pointer text-center group/btn"
          >
            <Eye className="h-3.5 w-3.5 text-zinc-400 group-hover/btn:text-black transition-colors" />
            <span>Details</span>
          </Link>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!isInStock}
            className={`col-span-2 flex items-center justify-center gap-1 py-2 px-3 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black'
            }`}
          >
            {added ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}