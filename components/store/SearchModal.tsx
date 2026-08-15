'use client';

import React from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  products: Product[];
}

export function SearchModal({ isOpen, onClose, query, setQuery, products }: SearchModalProps) {
  if (!isOpen) return null;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase().trim()) ||
      p.category.toLowerCase().includes(query.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 font-sans">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 transition-colors duration-200">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="h-5 w-5 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search products or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close search modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {query.trim() && filtered.length === 0 ? (
            <div className="text-center py-12 text-xs font-semibold uppercase text-zinc-400">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-html-element-for-img */}
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop'}
                    alt={product.name}
                    className="h-12 w-10 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
                  />
                  <div>
                    <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-[#9ae600] transition-colors">
                      {product.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">{product.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-zinc-900 dark:text-white">{product.price.toFixed(2)} MAD</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-[#9ae600] transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}