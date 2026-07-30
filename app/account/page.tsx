'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  LogOut,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  Building2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useTranslation } from '@/components/providers/IntlProvider';

interface OrderItem {
  id: string;
  quantity: number;
  selectedSize: string;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  city: string;
  items: OrderItem[];
}

const CIH_ACCOUNT_DETAILS = {
  bankName: 'CIH BANK',
  accountHolder: 'YOUR FULL NAME HERE',
  rib: '230 780 XXXXXXXXXXXXXXXX 72',
};

export default function AccountPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedRib, setCopiedRib] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch(`/api/orders/track?query=${encodeURIComponent(session.user.email)}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (session?.user?.email) {
      fetchUserOrders();
    }
  }, [session]);

  const handleCopyRIB = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(CIH_ACCOUNT_DETAILS.rib.replace(/\s+/g, ''));
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-white text-zinc-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-black mb-2" />
          <p className="text-xs font-mono font-bold uppercase">{t('Checkout.processing')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) return null;

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" /> Livrée
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Truck className="h-3.5 w-3.5" /> En cours d'expédition
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Clock className="h-3.5 w-3.5" /> En attente du virement
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Package className="h-3.5 w-3.5" /> En cours de traitement
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans tracking-tight">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('Cart.continue')}
        </Link>

        {/* Profile Banner */}
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#ccff00] text-black flex items-center justify-center font-black text-xl uppercase">
              {session.user?.name ? session.user.name.charAt(0) : <User className="h-6 w-6" />}
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-widest">// {t('Account.title')}</span>
              <h1 className="text-2xl font-black uppercase text-white">{session.user?.name || 'Client'}</h1>
              <p className="text-xs text-zinc-400 font-medium">{session.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-rose-600 px-4 py-2.5 text-xs font-black uppercase text-white transition-all border border-zinc-700 hover:border-rose-600"
          >
            <LogOut className="h-4 w-4" /> {t('Account.signOut')}
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h2 className="text-xl font-black uppercase tracking-tight">{t('Account.history')}</h2>
            <span className="text-xs font-mono font-bold text-zinc-400">({orders.length} {t('Account.orders')})</span>
          </div>

          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin text-black mb-2" />
              <p className="text-xs font-mono font-bold uppercase">{t('Checkout.processing')}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <Package className="h-10 w-10 text-zinc-300 mx-auto" />
              <p className="text-xs font-mono font-bold uppercase text-zinc-500">{t('Account.noOrders')}</p>
              <Link href="/" className="inline-block text-xs font-black uppercase underline text-black">
                {t('Account.viewCatalog')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="border border-zinc-200 rounded-2xl bg-zinc-50/50 overflow-hidden transition-all hover:border-zinc-400"
                  >
                    {/* Header bar - click to expand/collapse details */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-black uppercase">{t('Account.orderNo')} {order.id}</span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">
                          {order.items.length} article(s) • Total: <span className="font-bold text-black">{order.total.toFixed(2)} MAD</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {getStatusBadge(order.status)}
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-5">
                        {/* Bank Transfer Reference Notice */}
                        {order.status === 'PENDING_PAYMENT' && (
                          <div className="bg-zinc-950 text-white rounded-xl p-4 space-y-3 border border-zinc-800">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                              <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase">// CIH BANK</span>
                              <Building2 className="h-4 w-4 text-zinc-400" />
                            </div>
                            <p className="text-xs text-zinc-300">
                              {t('Account.transferNotice')} <span className="font-bold text-white">{order.total.toFixed(2)} MAD</span>:
                            </p>

                            <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-xs font-mono">
                              <span className="font-bold text-[#ccff00]">{CIH_ACCOUNT_DETAILS.rib}</span>
                              <button
                                onClick={handleCopyRIB}
                                className="p-1 text-zinc-400 hover:text-white transition-colors"
                              >
                                {copiedRib ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">// {t('Account.itemsOrdered')}</h4>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200">
                              <img
                                src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'}
                                alt={item.product?.name || 'Produit'}
                                className="h-12 w-10 object-cover rounded-md bg-zinc-200"
                              />
                              <div className="flex-1">
                                <h5 className="text-xs font-black uppercase text-zinc-900">{item.product?.name || 'Article'}</h5>
                                <p className="text-[10px] font-mono text-zinc-400">
                                  {t('Cart.size')}: {item.selectedSize} | {t('Cart.qty')}: {item.quantity}
                                </p>
                              </div>
                              <span className="text-xs font-black">{(item.price * item.quantity).toFixed(2)} MAD</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Info */}
                        <div className="text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-200">
                          <span className="font-bold uppercase text-zinc-700">{t('Account.deliveryAddress')}:</span> {order.address}, {order.city}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}