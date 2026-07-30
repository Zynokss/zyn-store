import React from 'react';
import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function ProductGrid({ products, title, subtitle }: ProductGridProps) {
  return (
    <section className="py-12">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>}
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}