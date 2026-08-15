'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { useLanguage } from '@/components/providers/IntlProvider';

export default function ContactPage() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order Status Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit message.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-10 font-sans antialiased">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t('returnToStore')}
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ae600] block">
            {t('customerSupport')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
            {t('contactTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
            {t('contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Quick Direct Contact & Policy Info */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Contact Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white space-y-5 shadow-lg">
              <span className="text-xs font-bold text-[#9ae600] uppercase tracking-wider block">
                {t('directContact')}
              </span>
              
              <div className="space-y-4 text-xs font-medium">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-[#9ae600] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase block font-semibold">
                      {t('whatsappSupport')}
                    </span>
                    <a
                      href="https://wa.me/212671396595"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-white hover:text-[#9ae600] transition-colors text-sm"
                    >
                      +212 6 71 39 65 95
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#9ae600] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase block font-semibold">
                      {t('emailAddress')}
                    </span>
                    <a
                      href="mailto:support@zyn.store"
                      className="font-bold text-white hover:text-[#9ae600] transition-colors"
                    >
                      support@zyn.store
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#9ae600] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase block font-semibold">
                      {t('workingHours')}
                    </span>
                    <span className="font-bold text-white">
                      {t('workingHoursVal')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Summary Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-2 text-xs font-normal text-zinc-600 dark:text-zinc-400">
              <h4 className="font-bold uppercase text-zinc-900 dark:text-white tracking-wider">
                {t('policiesTitle')}
              </h4>
              <p className="leading-relaxed">
                {t('policiesBody')}
              </p>
            </div>
          </div>

          {/* Main Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-[#9ae600] mx-auto" />
                <h3 className="text-xl font-extrabold uppercase text-zinc-900 dark:text-white">
                  {t('msgDelivered')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal max-w-sm mx-auto leading-relaxed">
                  {t('msgThankYou')}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'Order Status Inquiry', message: '' });
                  }}
                  className="mt-4 text-xs font-bold uppercase text-zinc-900 dark:text-[#9ae600] underline cursor-pointer hover:no-underline transition-all"
                >
                  {t('sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  {t('sendMessage')}
                </span>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                      {t('fullName')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                      {t('emailAddress')}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                    {t('subject')}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-semibold uppercase text-zinc-800 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Order Status Inquiry">Order Status Inquiry</option>
                    <option value="Amana Tracking Issue">Amana Tracking Issue</option>
                    <option value="CIH Bank Payment Proof">CIH Bank Payment Proof</option>
                    <option value="Sizing & Product Details">Sizing &amp; Product Details</option>
                    <option value="Other Question">Other Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">
                    {t('yourMessage')}
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t('messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 text-xs font-normal text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {t('contactSend')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}