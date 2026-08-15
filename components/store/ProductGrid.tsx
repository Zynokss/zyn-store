'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { useLanguage } from '@/components/providers/IntlProvider';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onOpenCart?: () => void;
  onToast?: (msg: string) => void;
  showFavorite?: boolean;
}

export function ProductGrid({
  products,
  title,
  subtitle,
  onOpenCart,
  onToast,
  showFavorite,
}: ProductGridProps) {
  const { t } = useLanguage();

  return (
    <section className="py-10 sm:py-14 font-sans">
      {(title || subtitle) && (
        <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto space-y-2">
          {subtitle && (
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ae600] block">
              {t(subtitle)}
            </span>
          )}
          {title && (
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
              {t(title)}
            </h2>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenCart={onOpenCart}
            onToast={onToast}
            showFavorite={showFavorite}
          />
        ))}
      </div>
    </section>
  );
}