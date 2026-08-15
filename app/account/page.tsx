'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
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
  MapPin,
  Save,
  XCircle,
} from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { useTranslation } from '@/components/providers/IntlProvider';
import { neon } from '@/lib/neon';

interface OrderItem {
  id: string;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  price: number;
  product: {
    name: string;
    images?: string[];
    image?: string;
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
  accountHolder: 'ACHRAF MLILOU',
  rib: '230726251607921102440031',
};

// FIX 2: Removed duplicate 'Kénitra' entry
const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Tétouan',
  'Meknès', 'Oujda', 'Kenitra', 'Nador', 'Safi', 'Mohammedia', 'El Jadida',
  'Beni Mellal', 'Taza', 'Khouribga', 'Larache', 'Ksar El Kebir',
  'Guelmim', 'Berrechid', 'Khemisset', 'Taourirt', 'Berkane',
  'Sidi Slimane', 'Errachidia', 'Taroudant', 'Essaouira', 'Dakhla', 'Laâyoune', 'Autre'
];

export default function AccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const useSession = neon.auth.useSession as () => {
    data?: { user?: { id?: string; email?: string; name?: string; image?: string } };
    isPending: boolean;
    error?: unknown;
    refetch: () => Promise<void>;
  };
  const { data: sessionData, isPending: sessionLoading } = useSession();
  const session = sessionData as { user?: { email?: string; name?: string } } | undefined | null;
  const status = sessionLoading ? 'loading' : session?.user?.email ? 'authenticated' : 'unauthenticated';
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedRib, setCopiedRib] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address1: '',
    address2: '',
    city: 'Casablanca',
    postalCode: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.email) return;
      try {
        const ordersRes = await fetch(`/api/orders/track?query=${encodeURIComponent(session.user.email)}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success && Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        }

        const profileRes = await fetch('/api/user/profile');
        const profileDataRes = await profileRes.json();
        if (profileDataRes.success && profileDataRes.user) {
          const u = profileDataRes.user;
          setProfileData({
            name: u.name || session.user.name || '',
            phone: u.phone || '',
            address1: u.address1 || '',
            address2: u.address2 || '',
            city: u.city || 'Casablanca',
            postalCode: u.postalCode || '',
          });
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally { // FIX 1: Removed stray 'font-sans' string before finally
        setLoadingOrders(false);
      }
    }

    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]);

  const handleCopyRIB = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(CIH_ACCOUNT_DETAILS.rib.replace(/\s+/g, ''));
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSuccess(t('addressSaved'));
      } else {
        setProfileError(data.error || t('saveError'));
      }
    } catch {
      setProfileError(t('saveError'));
    } finally {
      setSavingProfile(false);
    }
  };

  if (status === 'loading') {
    return (
      <StoreLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-20 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#9ae600] mb-2" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t('loading')}
          </p>
        </div>
      </StoreLayout>
    );
  }

  if (!session) return null;

  const getStatusBadge = (orderStatus: string) => {
    const s = String(orderStatus || '').toUpperCase();

    switch (s) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#9ae600] border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-[#9ae600]" /> {t('delivered')}
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-blue-800/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Truck className="h-3.5 w-3.5 text-blue-500 dark:text-sky-400" /> {t('shipped')}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" /> {t('processing')}
          </span>
        );
      case 'CANCELLED':
      case 'CANCELED':
        return (
          <span className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <XCircle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" /> {t('canceled')}
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" /> {t('pendingPayment')}
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Package className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" /> {t('pendingConfirmation')}
          </span>
        );
    }
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 font-sans antialiased">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t('continueShopping')}
        </Link>

        {/* Profile Banner */}
        <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#9ae600] text-black flex items-center justify-center font-extrabold text-xl uppercase shadow-md shrink-0">
              {session.user?.name ? session.user.name.charAt(0) : <User className="h-6 w-6" />}
            </div>
            <div>
              <span className="text-xs font-bold text-[#9ae600] uppercase tracking-wider block">{t('myAccount')}</span>
              <h1 className="text-2xl font-extrabold uppercase text-white tracking-tight">{session.user?.name || 'Client'}</h1>
              <p className="text-xs text-zinc-400 font-normal">{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                // FIX 3: Safe sign out optional chaining
                await neon?.auth?.signOut?.({});
              } catch {}
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-2 rounded-full bg-zinc-800 hover:bg-rose-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors border border-zinc-700 hover:border-rose-600 cursor-pointer"
          >
            <XCircle className="h-4 w-4" /> {t('signOut')}
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Package className="h-4 w-4" /> {t('orders')} ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <MapPin className="h-4 w-4" /> {t('profile')}
          </button>
        </div>

        {/* Orders Tab View */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-900 dark:text-[#9ae600] mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">{t('loading')}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <Package className="h-10 w-10 text-zinc-400 mx-auto" />
                <p className="text-xs font-bold uppercase text-zinc-500">{t('noOrders')}</p>
                <Link href="/" className="inline-block text-xs font-bold uppercase underline text-zinc-900 dark:text-[#9ae600]">
                  {t('viewCatalog')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 overflow-hidden transition-all"
                    >
                      <div
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white dark:bg-zinc-900/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase">Order #{order.id}</span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium">
                            {order.items?.length || 0} article(s) - Total: <span className="font-extrabold text-zinc-900 dark:text-white">{order.total.toFixed(2)} MAD</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          {getStatusBadge(order.status)}
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/50 space-y-5">
                          {order.status === 'PENDING_PAYMENT' && (
                            <div className="bg-zinc-900 text-white rounded-2xl p-4 space-y-3 border border-zinc-800">
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                <span className="text-[10px] font-bold text-[#9ae600] uppercase tracking-wider">CIH BANK</span>
                                <Building2 className="h-4 w-4 text-zinc-400" />
                              </div>
                              <p className="text-xs text-zinc-300 font-normal leading-relaxed">
                                {t('transferOf')} <span className="font-bold text-white">{order.total.toFixed(2)} MAD</span>:
                              </p>
                              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-xs font-bold">
                                <span className="text-[#9ae600] tracking-wider">{CIH_ACCOUNT_DETAILS.rib}</span>
                                <button
                                  onClick={handleCopyRIB}
                                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedRib ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{t('itemsOrdered')}</h4>
                            {(order.items || []).map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                {/* eslint-disable-next-html-element-for-img */}
                                <img
                                  src={
                                    item.product?.images?.[0] ||
                                    item.product?.image ||
                                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'
                                  }
                                  alt={item.product?.name || 'Produit'}
                                  className="h-12 w-10 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
                                />
                                <div className="flex-1">
                                  <h5 className="text-xs font-bold uppercase text-zinc-900 dark:text-white">{item.product?.name || 'Article'}</h5>
                                  <p className="text-[10px] text-zinc-500 font-medium">
                                    {t('size')}: {item.selectedSize}
                                    {item.selectedColor ? ` | Color: ${item.selectedColor}` : ''}
                                    {' | '}{t('quantity')}: {item.quantity}
                                  </p>
                                </div>
                                <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{(item.price * item.quantity).toFixed(2)} MAD</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="font-bold uppercase text-zinc-700 dark:text-zinc-300">{t('deliveryAddress')}:</span> {order.address}, {order.city}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab View */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-5 max-w-2xl shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('defaultAddress')}</h2>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <Check className="h-4 w-4 text-[#9ae600]" /> {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('fullName')}</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('phone')}</label>
                <input
                  type="tel"
                  required
                  placeholder="0661234567"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('addressLine1')}</label>
              <input
                type="text"
                required
                placeholder="Quartier, Rue, N° d'appartement"
                value={profileData.address1}
                onChange={(e) => setProfileData({ ...profileData, address1: e.target.value })}
                className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('addressLine2')}</label>
              <input
                type="text"
                placeholder="Bâtiment, Étage, Repère..."
                value={profileData.address2}
                onChange={(e) => setProfileData({ ...profileData, address2: e.target.value })}
                className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('city')}</label>
                <select
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('postalCode')}</label>
                <input
                  type="text"
                  placeholder="Code Postal"
                  value={profileData.postalCode}
                  onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t('saveAddress')}
            </button>
          </form>
        )}
      </div>
    </StoreLayout>
  );
}