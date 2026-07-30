'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
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

  const results = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-auto max-w-2xl mt-16 p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200">
            <Search className="h-5 w-5 text-zinc-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search by product name or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            <button onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-2">
            {query.trim() === '' ? (
              <p className="text-center py-8 text-xs font-mono text-zinc-400 uppercase">Type to search collection...</p>
            ) : results.length === 0 ? (
              <p className="text-center py-8 text-xs font-mono text-zinc-400 uppercase">No products match "{query}"</p>
            ) : (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                >
                  <img src={product.images[0]} alt={product.name} className="h-12 w-10 object-cover rounded-lg bg-zinc-200" />
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold uppercase text-zinc-900">{product.name}</h4>
                    <p className="text-[10px] font-mono text-zinc-400 uppercase">{product.category}</p>
                  </div>
                  <span className="text-xs font-black">${product.price.toFixed(2)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}