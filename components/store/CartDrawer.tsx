'use client';

import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/IntlProvider';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  selectedSize?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-2xl flex flex-col transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-black dark:text-[#ccff00]" />
              <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                {t('Cart.title')} ({items.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto" />
                <p className="text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">{t('Cart.empty')}</p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-black uppercase underline text-black dark:text-[#ccff00] cursor-pointer"
                >
                  {t('Cart.continue')}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-16 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white line-clamp-1">{item.name}</h3>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400 uppercase">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">{item.price * item.quantity} MAD</span>
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-l-xl transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-zinc-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-r-xl transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase">
                <span className="text-zinc-500 dark:text-zinc-400">{t('Cart.total')}</span>
                <span className="text-base font-black text-zinc-900 dark:text-[#ccff00]">{subtotal.toFixed(2)} MAD</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black dark:bg-[#ccff00] py-3.5 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                {t('Cart.checkout')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}