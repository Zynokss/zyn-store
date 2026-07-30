'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Default to the first available size
    const defaultSize = product.sizes[0] || 'M';
    addToCart(product, defaultSize, 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/30 transition-all hover:border-slate-700">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-800">
        {product.featured && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            Featured
          </span>
        )}
        {/* eslint-disable-next-html-element-for-img */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-xs text-indigo-400 font-medium">{product.category}</p>
          <h3 className="mt-1 text-sm font-semibold text-white">
            <Link href={`/products/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-base font-bold text-slate-100">${product.price}</p>
          <button 
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`relative z-10 rounded-lg p-2 transition-all ${
              added 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}