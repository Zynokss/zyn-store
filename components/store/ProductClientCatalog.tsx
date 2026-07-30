'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Heart, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All Items', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes'];

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  images: string[];
}

export function ProductClientCatalog({ initialProducts }: { initialProducts: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All Items' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white border border-zinc-200/80 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search 60+ items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200/80 bg-white py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-lg font-extrabold text-zinc-900">
          Exclusive Collection ({filteredProducts.length})
        </h3>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isFav = favorites.includes(product.id);
          return (
            <div
              key={product.id}
              className="group relative flex flex-col rounded-3xl border border-zinc-200/70 bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Image & Favorite Button */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100">
                {/* eslint-disable-next-html-element-for-img */}
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'}
                  alt={product.name}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 text-zinc-600 shadow-sm backdrop-blur-md hover:text-rose-500 transition-colors"
                  aria-label="Favorite"
                >
                  <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Product Details */}
              <div className="mt-3 flex flex-col flex-1 justify-between space-y-2 p-1">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                    {product.category}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold text-zinc-900">
                    ${product.price.toFixed(2)} <span className="text-[10px] text-zinc-400 font-normal">USD</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 inline-block"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-400 inline-block"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-700 inline-block"></span>
                  </div>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 transition-all active:scale-95"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}