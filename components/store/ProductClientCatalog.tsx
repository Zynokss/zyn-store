'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/components/providers/IntlProvider';
import { ProductCard } from './ProductCard';

const DEFAULT_CATEGORIES = [
  'All Items',
  'Tops',
  'Bottoms',
  'Outerwear',
  'Accessories',
  'Streetwear',
];

interface ProductClientCatalogProps {
  initialProducts: Product[];
  categories?: string[];
  title?: string;
  subtitle?: string;
  onOpenCart?: () => void;
  onToast?: (msg: string) => void;
}

export function ProductClientCatalog({
  initialProducts,
  categories,
  title,
  subtitle,
  onOpenCart,
  onToast,
}: ProductClientCatalogProps) {
  const { favorites, isFavorite } = useCart();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'low-to-high' | 'high-to-low' | 'newest'>('featured');

  const catalogCategories = useMemo(() => {
    if (categories?.length) return ['All Items', ...categories];
    const dynamic = new Set<string>();
    (initialProducts || []).forEach((p) => {
      if (p.category?.trim()) dynamic.add(p.category.trim());
    });
    const sorted = Array.from(dynamic).sort((a, b) => a.localeCompare(b));
    const merged: string[] = ['All Items'];
    DEFAULT_CATEGORIES.slice(1).forEach((c) => {
      if (dynamic.has(c)) merged.push(c);
    });
    sorted.forEach((c) => {
      if (!DEFAULT_CATEGORIES.includes(c) && !merged.includes(c)) merged.push(c);
    });
    return merged;
  }, [initialProducts, categories]);

  const filteredProducts = useMemo(() => {
    let list = Array.isArray(initialProducts) ? [...initialProducts] : [];

    if (selectedCategory !== 'All Items') {
      list = list.filter(
        (p) => String(p.category || '').toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

    if (showFavoritesOnly) {
      list = list.filter((p) => isFavorite(p.id));
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.description || '').toLowerCase().includes(q) ||
          String(p.category || '').toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'low-to-high':
        list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'high-to-low':
        list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'newest':
        list.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        break;
      case 'featured':
      default:
        list.sort((a, b) => {
          const fa = a.featured ? 1 : 0;
          const fb = b.featured ? 1 : 0;
          if (fb !== fa) return fb - fa;
          return 0;
        });
    }

    return list;
  }, [initialProducts, selectedCategory, searchQuery, sortBy, showFavoritesOnly, isFavorite]);

  const resetAll = () => {
    setSelectedCategory('All Items');
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'All Items' ||
    searchQuery.trim() !== '' ||
    showFavoritesOnly ||
    sortBy !== 'featured';

  return (
    <div className="space-y-6 font-sans">
      {(title || subtitle) && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          {subtitle && (
            <span className="text-xs font-bold uppercase tracking-widest text-[#9ae600] block">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
              {title}
            </h2>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            {catalogCategories.map((cat) => {
              const active = selectedCategory === cat;
              const displayCat = cat === 'All Items' ? t('allItems') : cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {displayCat}
                </button>
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Favorites Toggle Button */}
            <button
              onClick={() => setShowFavoritesOnly((v) => !v)}
              className={`h-9 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                showFavoritesOnly
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
              aria-pressed={showFavoritesOnly}
            >
              <Heart className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              {t('favorites') || 'Favorites'} ({favorites.length})
            </button>

            {/* Search Input */}
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 py-1.5 pl-8 pr-8 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
              />
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 px-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer transition-colors"
            >
              <option value="featured">{t('featured')}</option>
              <option value="newest">{t('newest')}</option>
              <option value="low-to-high">{t('lowToHigh')}</option>
              <option value="high-to-low">{t('highToLow')}</option>
            </select>

            {/* Filter Drawer Toggle */}
            <button className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer" aria-label="More filters">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-semibold text-zinc-500">
                {t('activeFilters') || 'Active filters:'}
              </span>
              {selectedCategory !== 'All Items' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200">
                  {selectedCategory === 'All Items' ? t('allItems') : selectedCategory}
                </span>
              )}
              {showFavoritesOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">
                  {t('favorites') || 'Favorites'}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 max-w-xs truncate">
                  « {searchQuery.trim()} »
                </span>
              )}
              {sortBy !== 'featured' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200">
                  {t('sort') || 'Sort'}: {t(sortBy) || sortBy}
                </span>
              )}
            </div>
            <button
              onClick={resetAll}
              className="text-xs font-semibold underline text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {t('resetFilters')}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {filteredProducts.length} {t('itemsFound')}
          </p>
        </div>
      </div>

      {/* Empty State vs Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 py-20 text-center space-y-3 px-4">
          <Search className="h-8 w-8 text-zinc-400" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {t('noProductsFound') || 'No products found matching your filter.'}
          </p>
          <button
            onClick={resetAll}
            className="mt-1 text-xs font-semibold underline text-zinc-900 dark:text-white cursor-pointer"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenCart={onOpenCart}
              onToast={onToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}