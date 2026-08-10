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
  MapPin,
  Save,
} from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
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
  accountHolder: 'ACHRAF MLILOU',
  rib: '230726251607921102440031',
};

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Tétouan',
  'Meknès', 'Oujda', 'Kenitra', 'Nador', 'Safi', 'Mohammedia', 'El Jadida',
  'Beni Mellal', 'Taza', 'Khouribga', 'Kénitra', 'Larache', 'Ksar El Kebir',
  'Guelmim', 'Berrechid', 'Khemisset', 'Taourirt', 'Berkane',
  'Sidi Slimane', 'Errachidia', 'Taroudant', 'Essaouira', 'Dakhla', 'Laâyoune', 'Autre'
];

export default function AccountPage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedRib, setCopiedRib] = useState(false);

  // Profile Form State
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
      router.push('/login');
    }
  }, [status, router]);

  // Fetch orders and profile details
  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.email) return;
      try {
        // Fetch Orders
        const ordersRes = await fetch(`/api/orders/track?query=${encodeURIComponent(session.user.email)}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) setOrders(ordersData.orders);

        // Fetch Profile Details
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
      } finally {
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
        setProfileSuccess('Vos informations de livraison ont été mises à jour !');
      } else {
        setProfileError(data.error || 'Impossible de mettre à jour le profil.');
      }
    } catch (err) {
      setProfileError('Erreur lors de la sauvegarde.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (status === 'loading') {
    return (
      <StoreLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#ccff00] mb-2" />
          <p className="text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
            {t('Checkout.processing')}
          </p>
        </div>
      </StoreLayout>
    );
  }

  if (!session) return null;

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#ccff00] border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <CheckCircle2 className="h-3.5 w-3.5" /> Livré
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-blue-800/80 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Truck className="h-3.5 w-3.5" /> En cours d&apos;expédition
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Clock className="h-3.5 w-3.5" /> En attente du virement
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Package className="h-3.5 w-3.5" /> En cours de traitement
          </span>
        );
    }
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-[#ccff00] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('Cart.continue')}
        </Link>

        {/* Profile Banner */}
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#ccff00] text-black flex items-center justify-center font-black text-xl uppercase shadow-md">
              {session.user?.name ? session.user.name.charAt(0) : <User className="h-6 w-6" />}
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold tracking-widest">&#47;&#47; {t('Account.title')}</span>
              <h1 className="text-2xl font-black uppercase text-white">{session.user?.name || 'Client'}</h1>
              <p className="text-xs text-zinc-400 font-medium">{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-rose-600 px-4 py-2.5 text-xs font-black uppercase text-white transition-all border border-zinc-800 hover:border-rose-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> {t('Account.signOut')}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Package className="h-4 w-4" /> Commandes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-black dark:bg-[#ccff00] text-white dark:text-black shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <MapPin className="h-4 w-4" /> Mon Adresse &amp; Informations
          </button>
        </div>

        {/* TAB 1: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin text-black dark:text-[#ccff00] mb-2" />
                <p className="text-xs font-mono font-bold uppercase">{t('Checkout.processing')}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                <Package className="h-10 w-10 text-zinc-400 dark:text-zinc-500 mx-auto" />
                <p className="text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">{t('Account.noOrders')}</p>
                <Link href="/" className="inline-block text-xs font-black uppercase underline text-black dark:text-[#ccff00]">
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
                      className="border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/40 overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
                    >
                      <div
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-white dark:bg-zinc-900"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-zinc-900 dark:text-white uppercase">{t('Account.orderNo')} {order.id}</span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {order.items.length} article(s) - Total: <span className="font-bold text-zinc-900 dark:text-white">{order.total.toFixed(2)} MAD</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          {getStatusBadge(order.status)}
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 space-y-5">
                          {order.status === 'PENDING_PAYMENT' && (
                            <div className="bg-zinc-950 text-white rounded-2xl p-4 space-y-3 border border-zinc-800">
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase">&#47;&#47; CIH BANK</span>
                                <Building2 className="h-4 w-4 text-zinc-400" />
                              </div>
                              <p className="text-xs text-zinc-300">
                                {t('Account.transferNotice')} <span className="font-bold text-white">{order.total.toFixed(2)} MAD</span>:
                              </p>
                              <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 text-xs font-mono">
                                <span className="font-bold text-[#ccff00]">{CIH_ACCOUNT_DETAILS.rib}</span>
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
                            <h4 className="text-[10px] font-mono font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">&#47;&#47; {t('Account.itemsOrdered')}</h4>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                {/* eslint-disable-next-html-element-for-img */}
                                <img
                                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2'}
                                  alt={item.product?.name || 'Produit'}
                                  className="h-12 w-10 object-cover rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                                />
                                <div className="flex-1">
                                  <h5 className="text-xs font-black uppercase text-zinc-900 dark:text-white">{item.product?.name || 'Article'}</h5>
                                  <p className="text-[10px] font-mono text-zinc-400">
                                    {t('Cart.size')}: {item.selectedSize} | {t('Cart.qty')}: {item.quantity}
                                  </p>
                                </div>
                                <span className="text-xs font-black text-zinc-900 dark:text-white">{(item.price * item.quantity).toFixed(2)} MAD</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="font-bold uppercase text-zinc-700 dark:text-zinc-300">{t('Account.deliveryAddress')}:</span> {order.address}, {order.city}
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

        {/* TAB 2: PROFILE & ADDRESS SETTINGS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 max-w-2xl shadow-sm">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#ccff00]">&#47;&#47; ADRESSE DE LIVRAISON PAR DÉFAUT</h2>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
                <Check className="h-4 w-4" /> {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="0661234567"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Adresse Ligne 1</label>
              <input
                type="text"
                required
                placeholder="Quartier, Rue, N° d'appartement"
                value={profileData.address1}
                onChange={(e) => setProfileData({ ...profileData, address1: e.target.value })}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Adresse Ligne 2 (Optionnel)</label>
              <input
                type="text"
                placeholder="Bâtiment, Étage, Repère..."
                value={profileData.address2}
                onChange={(e) => setProfileData({ ...profileData, address2: e.target.value })}
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Ville</label>
                <select
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Code Postal</label>
                <input
                  type="text"
                  placeholder="Code Postal"
                  value={profileData.postalCode}
                  onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 rounded-2xl bg-black dark:bg-[#ccff00] px-6 py-3.5 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all cursor-pointer shadow-md"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Sauvegarder mon Adresse
            </button>
          </form>
        )}
      </div>
    </StoreLayout>
  );
}