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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 transition-colors duration-200">
        <div className="flex items-center px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="h-5 w-5 text-zinc-400 dark:text-zinc-500 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search products or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {query.trim() && filtered.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono font-bold uppercase text-zinc-400">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-html-element-for-img */}
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop'}
                    alt={product.name}
                    className="h-12 w-10 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white group-hover:text-black dark:group-hover:text-[#ccff00]">
                      {product.name}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{product.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-900 dark:text-white">{product.price.toFixed(2)} MAD</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-black dark:group-hover:text-[#ccff00] transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}