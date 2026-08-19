'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Building2, CheckCircle2,
  Copy, Check, Loader2, Truck, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useTranslation } from '@/components/providers/IntlProvider';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { authClient } from '@/lib/auth-client';

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Tétouan',
  'Meknès', 'Oujda', 'Kenitra', 'Nador', 'Safi', 'Mohammedia', 'El Jadida',
  'Beni Mellal', 'Taza', 'Khouribga', 'Larache', 'Ksar El Kebir',
  'Guelmim', 'Berrechid', 'Khemisset', 'Taourirt', 'Berkane',
  'Sidi Slimane', 'Errachidia', 'Taroudant', 'Essaouira', 'Dakhla', 'Laâyoune', 'Autre'
];

interface BankDetails {
  bankName: string;
  accountHolder: string;
  rib: string;
  whatsapp: string;
}

interface ConfirmationData {
  orderId: string;
  verifiedGrandTotal: number;
  verifiedSubtotal: number;
  verifiedShipping: number;
  bankDetails: BankDetails;
}

export default function CheckoutPage() {
  const useSession = authClient.useSession as () => {
    data?: { user?: { id?: string; email?: string; name?: string } };
    isPending: boolean;
  };
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { cart, subtotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    phone: '',
    password: '',
    address1: '',
    address2: '',
    city: 'Casablanca',
    postalCode: '',
    note: '',
  });

  const SHIPPING_FLAT = 35;
  const FREE_SHIPPING_THRESHOLD = 500;
  const displayShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const clientEstimateTotal = subtotal > 0 ? subtotal + displayShipping : 0;

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(id);
  }, []);

  const handleCopyRIB = (rib: string) => {
    navigator.clipboard.writeText(rib.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError(t('errorContact'));
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address1.trim() || !formData.city.trim()) {
      setError(t('errorAddress'));
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = (currentStep: number) => {
    if (currentStep === 1 && validateStep1()) {
      setActiveStep(2);
      if (maxCompletedStep < 2) setMaxCompletedStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setActiveStep(3);
      if (maxCompletedStep < 3) setMaxCompletedStep(3);
    } else if (currentStep === 3) {
      setActiveStep(4);
      if (maxCompletedStep < 4) setMaxCompletedStep(4);
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= maxCompletedStep) {
      setActiveStep(targetStep);
      setError('');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    if (cart.length === 0) {
      setError(t('errorEmptyCart'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formattedCart = cart.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'DEFAULT',
        selectedColor: item.selectedColor || null,
        product: {
          id: item.id,
          price: item.price,
        },
      }));

      const res = await fetch('/api/checkout/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: formattedCart,
          formData,
          shippingMethod: 'AMANA_COLIS_POSTAUX',
          saveAddressToProfile: true,
        }),
      });
      const data = await res.json();

      if (data.success && data.order?.id) {
        clearCart();
        const bd = data.bankDetails || {};
        setConfirmation({
          orderId: data.order.id,
          verifiedGrandTotal: Number(data.verifiedGrandTotal ?? data.order.total ?? clientEstimateTotal),
          verifiedSubtotal: Number(data.verifiedSubtotal ?? subtotal),
          verifiedShipping: Number(data.verifiedShipping ?? displayShipping),
          bankDetails: {
            bankName: bd.bankName || 'CIH BANK',
            accountHolder: bd.accountHolder || '',
            rib: bd.rib || '',
            whatsapp: bd.whatsapp || '',
          },
        });
      } else {
        setError(data.error || t('errorSubmit'));
      }
    } catch {
      setError(t('errorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (confirmation) {
    const { orderId, verifiedGrandTotal, bankDetails } = confirmation;
    const waLink = bankDetails.whatsapp
      ? `https://wa.me/${bankDetails.whatsapp.replace(/\D/g, '')}`
      : '#';
    return (
      <StoreLayout>
        <div className="mx-auto max-w-3xl px-4 py-12 w-full space-y-6 font-sans antialiased">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-6 sm:p-8 space-y-6 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-3 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-[#9ae600] shrink-0" />
              <div>
                <h1 className="text-xl font-bold uppercase tracking-tight text-emerald-950 dark:text-emerald-100">{t('orderPlaced')}</h1>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {t('orderNumber')} <span className="font-bold underline">{orderId}</span>
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed font-normal">
              {t('transferToAccount')} — <strong>Amana</strong>. {t('whatsappProof')}{' '}
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-emerald-900 dark:text-[#9ae600]"
              >
                {bankDetails.whatsapp || '+212 6XX XXX XXX'}
              </a>
              .
            </p>

            <div className="bg-zinc-900 text-white rounded-2xl p-6 space-y-4 shadow-lg border border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold text-[#9ae600] uppercase tracking-wider">{t('bankDetails')} {bankDetails.bankName || ''}</span>
                <Building2 className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase block font-semibold">{t('totalToPay')}</span>
                  <span className="text-lg font-extrabold text-white">{verifiedGrandTotal.toFixed(2)} MAD</span>
                </div>
                {bankDetails.accountHolder && (
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase block font-semibold">{t('accountHolder')}</span>
                    <span className="font-bold text-white uppercase">{bankDetails.accountHolder}</span>
                  </div>
                )}
                {bankDetails.rib && (
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase block font-semibold">{t('rib')}</span>
                    <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800 mt-1">
                      <span className="font-bold text-[#9ae600] tracking-wider">{bankDetails.rib}</span>
                      <button
                        onClick={() => handleCopyRIB(bankDetails.rib)}
                        className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-amber-400 text-[10px] font-bold uppercase block">{t('reference')} · {t('mandatory')}</span>
                  <span className="text-sm font-extrabold text-white tracking-wider">{orderId}</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/account"
            className="w-full inline-block text-center rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black py-4 text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            {t('viewInAccount')}
          </Link>
        </div>
      </StoreLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-20 w-full text-center space-y-6 font-sans">
          <Truck className="h-14 w-14 text-zinc-400 mx-auto" />
          <h1 className="text-2xl font-bold uppercase text-zinc-900 dark:text-white">{t('emptyCart')}</h1>
          <p className="text-xs font-medium text-zinc-500">
            {t('catalog')} ←
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <ArrowLeft className="h-4 w-4" /> {t('continueShopping')}
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full font-sans antialiased">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t('continueShopping')}
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-4">
            
            {/* Step 1: Contact Details */}
            <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm transition-colors duration-200">
              <div
                onClick={() => handleStepClick(1)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 1
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-xs font-bold text-white dark:text-zinc-900">1</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">{t('contact')}</h2>
                </div>
                {maxCompletedStep > 1 && <Check className="h-5 w-5 text-emerald-600 dark:text-[#9ae600]" />}
              </div>

              {activeStep === 1 && (
                <div className="p-5 space-y-4 bg-white dark:bg-zinc-900/40">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('firstName')} *</label>
                      <input
                        type="text"
                        required
                        placeholder={t('firstName')}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('lastName')} *</label>
                      <input
                        type="text"
                        required
                        placeholder={t('lastName')}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('email')} *</label>
                      <input
                        type="email"
                        required
                        placeholder={t('email')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('phone')} *</label>
                      <input
                        type="tel"
                        required
                        placeholder={t('phone')}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {!session && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 flex items-center justify-between">
                        <span>{t('createAccount')}</span>
                        <span className="text-zinc-400 font-normal lowercase">{t('passwordHint')}</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('password')}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 pr-10 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleNextStep(1)}
                    className="w-full py-3.5 bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    {t('continue')} → {t('shipping')}
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Shipping Address */}
            <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm transition-colors duration-200">
              <div
                onClick={() => handleStepClick(2)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 2
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-xs font-bold text-white dark:text-zinc-900">2</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">{t('shipping')}</h2>
                </div>
                {maxCompletedStep > 2 && <Check className="h-5 w-5 text-emerald-600 dark:text-[#9ae600]" />}
              </div>

              {activeStep === 2 && (
                <div className="p-5 space-y-4 bg-white dark:bg-zinc-900/40">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('addressLine1')} *</label>
                    <input
                      type="text"
                      required
                      placeholder={t('addressLine1')}
                      value={formData.address1}
                      onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                      className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('addressLine2')}</label>
                    <input
                      type="text"
                      placeholder={t('addressLine2')}
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('city')} *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors cursor-pointer"
                      >
                        {MOROCCAN_CITIES.map((city, idx) => (
                          <option key={`${city}-${idx}`} value={city} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('postalCode')}</label>
                      <input
                        type="text"
                        placeholder={t('postalCode')}
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNextStep(2)}
                    className="w-full py-3.5 bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    {t('continue')} → {t('delivery')}
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Delivery Options */}
            <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm transition-colors duration-200">
              <div
                onClick={() => handleStepClick(3)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 3
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-xs font-bold text-white dark:text-zinc-900">3</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">{t('delivery')}</h2>
                </div>
                {maxCompletedStep > 3 && <Check className="h-5 w-5 text-emerald-600 dark:text-[#9ae600]" />}
              </div>

              {activeStep === 3 && (
                <div className="p-5 space-y-4 bg-white dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-zinc-900 dark:text-[#9ae600]" />
                      <div>
                        <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white">AMANA COLIS POSTAUX</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">{t('shipping')} · 24-48H Delivery</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-[#9ae600]">
                      {displayShipping === 0 ? t('free') : `${displayShipping.toFixed(2)} MAD`}
                    </span>
                  </div>

                  <textarea
                    placeholder={t('note')}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 text-xs font-normal text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none h-20 transition-colors"
                  />

                  <button
                    type="button"
                    onClick={() => handleNextStep(3)}
                    className="w-full py-3.5 bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    {t('continue')} → {t('payment')}
                  </button>
                </div>
              )}
            </div>

            {/* Step 4: Payment Transfer Details */}
            <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm transition-colors duration-200">
              <div
                onClick={() => handleStepClick(4)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 4
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-xs font-bold text-white dark:text-zinc-900">4</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">{t('payment')}</h2>
                </div>
              </div>

              {activeStep === 4 && (
                <div className="p-5 space-y-5 bg-white dark:bg-zinc-900/40">
                  <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-3 border border-zinc-800">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-[10px] font-bold text-[#9ae600] uppercase tracking-wider">{t('bankDetails')}</span>
                      <Building2 className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                      {t('transferToAccount')}.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{t('reference')} · {t('mandatory')}</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        {t('reference')}: <strong>{t('orderNumber')}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black py-4 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> {t('processing')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> {t('checkout')} — {clientEstimateTotal.toFixed(2)} MAD
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 h-fit space-y-4 transition-colors duration-200 lg:sticky lg:top-24">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('orderSummary')}</h2>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize || 's'}-${item.selectedColor || 'c'}`} className="flex items-center gap-3">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={48}
                    unoptimized
                    className="h-12 w-10 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {t('size')}: {item.selectedSize || 'M'} | {t('quantity')}: {item.quantity}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1, item.selectedSize, item.selectedColor)}
                        className="h-5 w-5 flex items-center justify-center text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-bold text-zinc-900 dark:text-white w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1, item.selectedSize, item.selectedColor)}
                        className="h-5 w-5 flex items-center justify-center text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                        className="ml-2 text-[10px] font-semibold underline text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} MAD</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>{t('subtotal')}</span>
                <span className="font-bold text-zinc-900 dark:text-white">{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>{t('shipping')}</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {displayShipping === 0 ? <span className="text-emerald-600 dark:text-[#9ae600]">{t('free')}</span> : `${displayShipping.toFixed(2)} MAD`}
                </span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                  {t('freeShipping')}: {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} MAD
                </p>
              )}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between items-center text-sm font-bold uppercase text-zinc-900 dark:text-white">
                <span>{t('totalToPay')}</span>
                <span className="text-base text-zinc-900 dark:text-[#9ae600] font-extrabold">{clientEstimateTotal.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}