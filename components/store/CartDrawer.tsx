'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CartItem } from '@/lib/types';
import { useTranslation } from '@/components/providers/IntlProvider';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number, size?: string, color?: string) => void;
  onRemoveItem: (id: string, size?: string, color?: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-2xl flex flex-col transition-colors duration-200 border-l border-zinc-200 dark:border-zinc-800">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-zinc-900 dark:text-[#9ae600]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                {t('cart')} ({items.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Item List / Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('emptyCart')}</p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-semibold underline text-zinc-900 dark:text-[#9ae600] cursor-pointer"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const itemKey = `${item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}-${index}`;

                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-3 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={80}
                      unoptimized
                      className="h-20 w-16 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold uppercase text-zinc-900 dark:text-white line-clamp-1">{item.name}</h3>
                          <button
                            onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedColor)}
                            className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer p-1"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase mt-0.5">
                          {item.category}
                        </p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {item.selectedSize && <span>{t('size')}: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span> | </span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                          {(item.price * item.quantity).toFixed(2)} MAD
                        </span>
                        
                        {/* Rounded Quantity Selector */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1, item.selectedSize, item.selectedColor)}
                            className="px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-zinc-900 dark:text-white min-w-[1.75rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1, item.selectedSize, item.selectedColor)}
                            className="px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase">
                <span className="text-zinc-500 dark:text-zinc-400">{t('total')}</span>
                <span className="text-base font-extrabold text-zinc-900 dark:text-[#9ae600]">{subtotal.toFixed(2)} MAD</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black py-3.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg active:scale-95 cursor-pointer"
              >
                {t('checkout')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}