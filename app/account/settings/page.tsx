'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Bell,
  Shield,
  Save,
  Loader2,
  ArrowLeft,
  Check,
  XCircle,
} from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { useTranslation } from '@/components/providers/IntlProvider';
import { authClient } from '@/lib/auth-client';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Tétouan',
  'Meknès', 'Oujda', 'Kenitra', 'Nador', 'Safi', 'Mohammedia', 'El Jadida',
  'Beni Mellal', 'Taza', 'Khouribga', 'Larache', 'Ksar El Kebir',
  'Guelmim', 'Berrechid', 'Khemisset', 'Taourirt', 'Berkane',
  'Sidi Slimane', 'Errachidia', 'Taroudant', 'Essaouira', 'Dakhla', 'Laâyoune', 'Autre'
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const useSession = authClient.useSession as () => {
    data?: { user?: { id?: string; email?: string; name?: string } };
    isPending: boolean;
  };
  const { data: sessionData, isPending: sessionLoading } = useSession();
  const session = sessionData as { user?: { email?: string; name?: string } } | undefined | null;

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address1: '',
    address2: '',
    city: 'Casablanca',
    postalCode: '',
    orderUpdatesEmail: true,
    promoEmails: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session?.user?.email) {
      router.push('/login');
    }
  }, [sessionLoading, session, router]);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.success && data.user) {
          const u = data.user;
          setFormData((prev) => ({
            ...prev,
            name: u.name || session.user?.name || '',
            phone: u.phone || '',
            address1: u.address1 || '',
            address2: u.address2 || '',
            city: u.city || 'Casablanca',
            postalCode: u.postalCode || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }

    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(t('addressSaved') || 'Settings saved successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || t('saveError') || 'Failed to update settings');
      }
    } catch {
      setErrorMsg(t('saveError') || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading) {
    return (
      <StoreLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#9ae600] mb-2" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t('loading')}
          </p>
        </div>
      </StoreLayout>
    );
  }

  if (!session) return null;

  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 font-sans antialiased">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t('myAccount')}
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">
            Manage your personal details, default shipping address, and notification preferences.
          </p>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-[#9ae600]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Personal Details */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <User className="h-4 w-4 text-zinc-400 dark:text-[#9ae600]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                  {t('email')}
                </label>
                <input
                  type="email"
                  disabled
                  value={session.user?.email || ''}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 px-4 py-3 text-xs font-normal text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  placeholder="0661234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Shipping Address */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <MapPin className="h-4 w-4 text-zinc-400 dark:text-[#9ae600]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                {t('defaultAddress')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                  {t('addressLine1')}
                </label>
                <input
                  type="text"
                  placeholder="Quartier, Rue, N° d'appartement"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                  {t('addressLine2')}
                </label>
                <input
                  type="text"
                  placeholder="Bâtiment, Étage, Repère..."
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                    {t('city')}
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors cursor-pointer"
                  >
                    {MOROCCAN_CITIES.map((city) => (
                      <option key={city} value={city} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                    {t('postalCode')}
                  </label>
                  <input
                    type="text"
                    placeholder="20000"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Preferences & Notifications */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Bell className="h-4 w-4 text-zinc-400 dark:text-[#9ae600]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Notifications & Preferences
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors">
                <div>
                  <span className="font-bold block text-zinc-900 dark:text-white uppercase">Order Status Alerts</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Receive email updates when your package ships or updates status</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.orderUpdatesEmail}
                  onChange={(e) => setFormData({ ...formData, orderUpdatesEmail: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-[#9ae600] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors">
                <div>
                  <span className="font-bold block text-zinc-900 dark:text-white uppercase">New Drops & Offers</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Get early access notifications for limited streetwear releases</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.promoEmails}
                  onChange={(e) => setFormData({ ...formData, promoEmails: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:accent-[#9ae600] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await authClient.signOut();
                } catch (err) {
                  console.error('Failed to sign out', err);
                }
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold uppercase text-rose-600 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Shield className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}