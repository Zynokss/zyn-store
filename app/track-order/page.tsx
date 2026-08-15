'use client';

import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';

interface Order {
  id: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    selectedSize: string;
    product: { name: string; images: string[] };
  }[];
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err: unknown) {
      console.error('Error tracking order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const s = String(status || '').toUpperCase();
    
    switch (s) {
      case 'DELIVERED':
      case 'COMPLETED':
        return {
          label: 'LIVRÉ',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#9ae600]" />,
          colorClass: 'text-emerald-500 dark:text-[#9ae600]',
        };
      case 'SHIPPED':
        return {
          label: 'EXPÉDIÉ',
          icon: <Truck className="h-4 w-4 text-blue-500 dark:text-sky-400" />,
          colorClass: 'text-blue-500 dark:text-sky-400',
        };
      case 'PROCESSING':
        return {
          label: 'EN COURS DE TRAITEMENT',
          icon: <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
          colorClass: 'text-amber-500 dark:text-amber-400',
        };
      case 'CANCELLED':
      case 'CANCELED':
        return {
          label: 'CANCELED',
          icon: <XCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />,
          colorClass: 'text-rose-500 dark:text-rose-400',
        };
      case 'PENDING':
      case 'PENDING_PAYMENT':
      default:
        return {
          label: 'EN ATTENTE DE CONFIRMATION',
          icon: <Package className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />,
          colorClass: 'text-zinc-500 dark:text-zinc-400',
        };
    }
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full space-y-10 font-sans">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ae600] block">
            Shipment Status
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
            Enter your Order ID or Email address to view real-time shipment status and tracking details.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              required
              placeholder="Enter Order ID or Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 py-3 pl-10 pr-4 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black px-7 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track Order'}
          </button>
        </form>

        {/* Search Results Display */}
        {orders && (
          <div className="space-y-4 pt-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                <AlertCircle className="h-8 w-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  No orders found matching &quot;{query}&quot;
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const statusMeta = getStatusDisplay(order.status);
                return (
                  <div
                    key={order.id}
                    className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900/50 space-y-4 shadow-sm transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase block">
                          Order ID: {order.id}
                        </span>
                        <p className="text-xs font-bold uppercase text-zinc-900 dark:text-white mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 px-4 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm w-fit">
                        {statusMeta.icon}
                        <span className={`text-xs font-bold uppercase tracking-wider ${statusMeta.colorClass}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          {/* eslint-disable-next-html-element-for-img */}
                          <img
                            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop'}
                            alt={item.product?.name || 'Product Image'}
                            className="h-12 w-10 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
                          />
                          <div className="flex-1">
                            <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white">
                              {item.product?.name}
                            </h4>
                            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                              Size: {item.selectedSize || 'Standard'} | Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex justify-between items-center text-xs font-bold uppercase">
                      <span className="text-zinc-500">Total Paid</span>
                      <span className="text-zinc-900 dark:text-[#9ae600] font-extrabold text-sm">
                        {order.total.toFixed(2)} MAD
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}