'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft, Building2, CheckCircle2,
  Copy, Check, Loader2, Truck, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { CartItem } from '@/components/store/CartDrawer';
import { useTranslation } from '@/components/providers/IntlProvider';
import { StoreLayout } from '@/components/layout/StoreLayout';

const CIH_ACCOUNT_DETAILS = {
  bankName: 'CIH BANK',
  accountHolder: 'ACHRAF MLILOU',
  rib: '230726251607921102440031',
  whatsappProof: '+212671396595',
};

const SHIPPING_COST = 35.00; // Amana Flat Rate in MAD

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Tétouan',
  'Meknès', 'Oujda', 'Kenitra', 'Nador', 'Safi', 'Mohammedia', 'El Jadida',
  'Beni Mellal', 'Taza', 'Khouribga', 'Larache', 'Ksar El Kebir',
  'Guelmim', 'Berrechid', 'Khemisset', 'Taourirt', 'Berkane',
  'Sidi Slimane', 'Errachidia', 'Taroudant', 'Essaouira', 'Dakhla', 'Laâyoune', 'Autre'
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Step Control (1: Info, 2: Address, 3: Shipping, 4: Payment)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address1: '',
    address2: '',
    city: 'Casablanca',
    postalCode: '',
    note: '',
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('zyn_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        queueMicrotask(() => setCart(parsedCart));
      } catch (e) {
        console.error(e);
      }
    }
    queueMicrotask(() => setLoading(false));
  }, []);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (session?.user?.email) {
      queueMicrotask(() => {
        setFormData((prev) => ({
          ...prev,
          email: session.user?.email || '',
          firstName: session.user?.name?.split(' ')[0] || prev.firstName,
          lastName: session.user?.name?.split(' ').slice(1).join(' ') || prev.lastName,
        }));
      });
    }
  }, [session]);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = cartSubtotal > 0 ? cartSubtotal + SHIPPING_COST : 0;

  const handleCopyRIB = () => {
    navigator.clipboard.writeText(CIH_ACCOUNT_DETAILS.rib.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires des informations personnelles.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address1.trim() || !formData.city.trim()) {
      setError('Veuillez renseigner votre adresse principale et votre ville.');
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
    if (cart.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          formData,
          total: grandTotal,
          shippingCost: SHIPPING_COST,
          shippingMethod: 'AMANA_COLIS_POSTAUX',
          activeUserId: (session?.user as { id?: string })?.id || null,
          saveAddressToProfile: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.order?.id) {
        localStorage.removeItem('zyn_cart');
        setCart([]);
        setPlacedOrderId(data.order.id);
      } else {
        setError(data.error || 'Impossible de valider la commande.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StoreLayout cartCount={cart.reduce((a, b) => a + b.quantity, 0)}>
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#ccff00] mb-2" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('Checkout.processing')}
          </p>
        </div>
      </StoreLayout>
    );
  }

  // Order Confirmation View
  if (placedOrderId) {
    return (
      <StoreLayout cartCount={0}>
        <div className="mx-auto max-w-3xl px-4 py-12 w-full space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-6 sm:p-8 space-y-6 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-3 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-black uppercase text-emerald-950 dark:text-emerald-100">Commande Enregistrée !</h1>
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  N° de Bon de Commande: <span className="font-mono font-black underline">{placedOrderId}</span>
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed font-medium">
              Afin de valider votre expédition par <strong>Amana</strong>, envoyez une copie de votre virement sur WhatsApp au{' '}
              <a href={`https://wa.me/212${CIH_ACCOUNT_DETAILS.whatsappProof.substring(1)}`} target="_blank" rel="noreferrer" className="font-bold underline text-emerald-900 dark:text-[#ccff00]">
                +{CIH_ACCOUNT_DETAILS.whatsappProof}
              </a>{' '}
              avec votre N° de Commande.
            </p>

            {/* CIH Coordonnées Card */}
            <div className="bg-zinc-950 text-white rounded-2xl p-6 space-y-4 shadow-xl border border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-mono font-bold text-[#ccff00] uppercase">&#47;&#47; COORDONNÉES CIH BANK</span>
                <Building2 className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Montant Total</span>
                  <span className="text-lg font-black text-white">{grandTotal.toFixed(2)} MAD</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Titulaire du compte</span>
                  <span className="font-bold text-white uppercase">{CIH_ACCOUNT_DETAILS.accountHolder}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">RIB CIH (24 Chiffres)</span>
                  <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 mt-1">
                    <span className="font-bold text-[#ccff00]">{CIH_ACCOUNT_DETAILS.rib}</span>
                    <button onClick={handleCopyRIB} className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer">
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-amber-400 text-[10px] font-bold uppercase block">Motif du Virement Obligatoire</span>
                  <span className="text-sm font-black text-white tracking-widest">{placedOrderId}</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/account"
            className="w-full inline-block text-center rounded-xl bg-black dark:bg-[#ccff00] py-4 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all cursor-pointer shadow-lg"
          >
            Voir ma commande dans l&apos;Espace Client
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout cartCount={cart.reduce((a, b) => a + b.quantity, 0)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-[#ccff00] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t('Cart.continue')}
        </Link>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Accordion */}
          <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-4">
            {/* STEP 1: INFORMATIONS PERSONNELLES */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors duration-200">
              <div 
                onClick={() => handleStepClick(1)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 1 
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-[#ccff00] text-xs font-black text-white dark:text-black">1</span>
                  <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t('Checkout.contact')}</h2>
                </div>
                {maxCompletedStep > 1 && <Check className="h-5 w-5 text-emerald-600 dark:text-[#ccff00]" />}
              </div>

              {activeStep === 1 && (
                <div className="p-5 space-y-4 bg-white dark:bg-zinc-900">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Prénom *</label>
                      <input
                        type="text"
                        required
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Nom *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Adresse Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Téléphone (ex: 0661234567)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {!session && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 flex items-center justify-between">
                        <span>Créer un compte (Optionnel)</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal">Entrez un mot de passe</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mot de passe (Laisser vide pour commander sans compte)"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 pr-10 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleNextStep(1)}
                    className="w-full py-3.5 bg-black dark:bg-[#ccff00] text-white dark:text-black rounded-xl text-xs font-black uppercase hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all cursor-pointer shadow-md"
                  >
                    Continuer vers Adresse
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: ADRESSES */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors duration-200">
              <div 
                onClick={() => handleStepClick(2)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 2 
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-[#ccff00] text-xs font-black text-white dark:text-black">2</span>
                  <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t('Checkout.shipping')}</h2>
                </div>
                {maxCompletedStep > 2 && <Check className="h-5 w-5 text-emerald-600 dark:text-[#ccff00]" />}
              </div>

              {activeStep === 2 && (
                <div className="p-5 space-y-4 bg-white dark:bg-zinc-900">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Adresse Ligne 1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="Quartier, Rue, N° d'appartement"
                      value={formData.address1}
                      onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Adresse Ligne 2 (Optionnel)</label>
                    <input
                      type="text"
                      placeholder="Bâtiment, Étage, Repère..."
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Ville *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                      >
                        {MOROCCAN_CITIES.map((city, idx) => (
                          <option key={`${city}-${idx}`} value={city} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Code Postal (Optionnel)</label>
                      <input
                        type="text"
                        placeholder="Code Postal"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNextStep(2)}
                    className="w-full py-3.5 bg-black dark:bg-[#ccff00] text-white dark:text-black rounded-xl text-xs font-black uppercase hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all cursor-pointer shadow-md"
                  >
                    Continuer vers Mode de Livraison
                  </button>
                </div>
              )}
            </div>

            {/* STEP 3: MODE DE LIVRAISON (AMANA ONLY) */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors duration-200">
              <div 
                onClick={() => handleStepClick(3)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 3 
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-[#ccff00] text-xs font-black text-white dark:text-black">3</span>
                  <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">Mode de Livraison</h2>
                </div>
                {maxCompletedStep > 3 && <Check className="h-5 w-5 text-emerald-600 dark:text-[#ccff00]" />}
              </div>

              {activeStep === 3 && (
                <div className="p-5 space-y-4 bg-white dark:bg-zinc-900">
                  <div className="flex items-center justify-between p-4 border-2 border-black dark:border-[#ccff00] rounded-2xl bg-zinc-50 dark:bg-zinc-950">
                    <div className="flex items-center gap-3">
                      <Truck className="h-6 w-6 text-black dark:text-[#ccff00]" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">AMANA COLIS POSTAUX</h4>
                        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">Livraison à domicile (24H - 48H)</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-zinc-900 dark:text-[#ccff00]">35,00 MAD</span>
                  </div>

                  <textarea
                    placeholder="Remarques sur la commande / instructions de livraison (Optionnel)"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none h-20 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => handleNextStep(3)}
                    className="w-full py-3.5 bg-black dark:bg-[#ccff00] text-white dark:text-black rounded-xl text-xs font-black uppercase hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all cursor-pointer shadow-md"
                  >
                    Continuer vers Paiement
                  </button>
                </div>
              )}
            </div>

            {/* STEP 4: PAIEMENT (CIH BANK ONLY) */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-colors duration-200">
              <div 
                onClick={() => handleStepClick(4)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer border-b ${
                  activeStep === 4 
                    ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black dark:bg-[#ccff00] text-xs font-black text-white dark:text-black">4</span>
                  <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t('Checkout.title')}</h2>
                </div>
              </div>

              {activeStep === 4 && (
                <div className="p-5 space-y-5 bg-white dark:bg-zinc-900">
                  <div className="bg-zinc-950 text-white rounded-2xl p-5 space-y-4 border border-zinc-800">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-[10px] font-mono text-[#ccff00] uppercase font-bold">&#47;&#47; VIREMENT CIH BANK</span>
                      <Building2 className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="text-xs text-zinc-300">
                      Vous effectuerez le virement bancaire sur notre RIB CIH après confirmation.
                    </p>
                    <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs font-mono">
                      <span className="text-zinc-500 text-[10px] block uppercase">RIB CIH Bank</span>
                      <span className="font-bold text-[#ccff00]">{CIH_ACCOUNT_DETAILS.rib}</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[10px] uppercase">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Motif de Virement Obligatoire</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Dès que vous cliquez sur <strong>Confirmer la commande</strong>, un N° de commande unique sera généré. Vous devez obligatoirement l&apos;indiquer dans le motif du virement sur votre application CIH.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-[#ccff00] py-4 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> {t('Checkout.processing')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Confirmer la commande - {grandTotal.toFixed(2)} MAD
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Summary Box */}
          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-fit space-y-4 transition-colors duration-200">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#ccff00]">&#47;&#47; {t('Checkout.summary')}</h2>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-html-element-for-img */}
                  <img src={item.image} alt={item.name} className="h-12 w-10 object-cover rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex-1">
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">Taille: {item.selectedSize || 'M'} | Qte: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-white">{(item.price * item.quantity).toFixed(2)} MAD</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Sous-total</span>
                <span className="font-bold text-zinc-900 dark:text-white">{cartSubtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Livraison (Amana)</span>
                <span className="font-bold text-zinc-900 dark:text-white">{SHIPPING_COST.toFixed(2)} MAD</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between items-center text-sm font-black uppercase text-zinc-900 dark:text-white">
                <span>{t('Checkout.totalToPay')}</span>
                <span className="text-base text-zinc-900 dark:text-[#ccff00]">{grandTotal.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}