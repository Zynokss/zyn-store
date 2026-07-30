'use client';

import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <Package className="h-5 w-5 text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans tracking-tight">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase">Track Your Order</h1>
          <p className="text-xs text-zinc-500 font-medium">
            Enter your Order ID or Email address to view real-time shipment status.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              required
              placeholder="Enter Order ID or Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-xs font-bold focus:border-black focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-black px-6 py-3 text-xs font-black uppercase text-white hover:bg-[#ccff00] hover:text-black transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {orders && (
          <div className="space-y-4 pt-4">
            {orders.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                <AlertCircle className="h-8 w-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-bold uppercase text-zinc-600">No orders found matching "{query}"</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Order ID: {order.id}</span>
                      <p className="text-xs font-black uppercase text-zinc-900">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-sm w-fit">
                      {getStatusIcon(order.status)}
                      <span className="text-xs font-black uppercase">{order.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-12 w-10 object-cover rounded-lg bg-zinc-200"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold uppercase">{item.product.name}</h4>
                          <p className="text-[10px] font-mono text-zinc-400">
                            Size: {item.selectedSize} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-xs font-black uppercase">
                    <span>Total Paid</span>
                    <span>${order.total.toFixed(2)} USD</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}