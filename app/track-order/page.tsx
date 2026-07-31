'use client';

import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Loader2 } from 'lucide-react';
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
    } catch (err) {
      console.error('Error tracking order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-[#ccff00]" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500 dark:text-sky-400" />;
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return <Package className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />;
    }
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-md mx-auto">
            Enter your Order ID or Email address to view real-time shipment status.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              required
              placeholder="Enter Order ID or Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 py-3 pl-10 pr-4 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-black dark:bg-[#ccff00] px-6 py-3 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track Order'}
          </button>
        </form>

        {orders && (
          <div className="space-y-4 pt-4">
            {orders.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-2">
                <AlertCircle className="h-8 w-8 text-zinc-400 dark:text-zinc-500 mx-auto" />
                <p className="text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  No orders found matching "{query}"
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-4 shadow-sm transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase block">
                        Order ID: {order.id}
                      </span>
                      <p className="text-xs font-black uppercase text-zinc-900 dark:text-white mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 px-3.5 py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit">
                      {getStatusIcon(order.status)}
                      <span className="text-xs font-black uppercase text-zinc-900 dark:text-white">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop'}
                          alt={item.product?.name || 'Product Image'}
                          className="h-12 w-10 object-cover rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white">
                            {item.product?.name}
                          </h4>
                          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                            Size: {item.selectedSize || 'Standard'} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-3 flex justify-between items-center text-xs font-black uppercase">
                    <span className="text-zinc-500 dark:text-zinc-400">Total Paid</span>
                    <span className="text-zinc-900 dark:text-[#ccff00] font-black text-sm">
                      {order.total.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}