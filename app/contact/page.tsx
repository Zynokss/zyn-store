'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MessageSquare, Send, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';

export default function ContactPage() {
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
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-[#ccff00] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-[#ccff00]">
            // CUSTOMER SUPPORT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            GET IN TOUCH
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Have questions about your order, shipping policies, or sizing? Our support team responds within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-[#ccff00] uppercase">// DIRECT CONTACT</h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">WhatsApp Support</span>
                    <a
                      href="https://wa.me/212671396595"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-white hover:text-[#ccff00] transition-colors"
                    >
                      +212 6 71 39 65 95
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Email Address</span>
                    <a
                      href="mailto:support@zyn.store"
                      className="font-bold text-white hover:text-[#ccff00] transition-colors"
                    >
                      support@zyn.store
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block">Working Hours</span>
                    <span className="font-bold text-white">Mon – Sat (09:00 - 19:00 GMT+1)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Summary Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <h4 className="font-bold uppercase text-zinc-900 dark:text-white">Shipping & Return Policies</h4>
              <p className="leading-relaxed text-[11px]">
                Orders ship nationwide via <strong>Amana Colis Postaux</strong> (24-48 hours delivery). Returns are accepted within 7 days of delivery for unworn items with tags attached.
              </p>
            </div>
          </div>

          {/* Main Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 dark:text-[#ccff00] mx-auto" />
                <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white">Message Delivered!</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
                  Thank you for reaching out. We have logged your request and will send a reply to <strong>{formData.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'Order Status Inquiry', message: '' });
                  }}
                  className="mt-4 text-xs font-black uppercase text-black dark:text-[#ccff00] underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-[#ccff00]">
                  // SEND A MESSAGE
                </h3>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs font-bold text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Order Status Inquiry">Order Status Inquiry</option>
                    <option value="Amana Tracking Issue">Amana Tracking Issue</option>
                    <option value="CIH Bank Payment Proof">CIH Bank Payment Proof</option>
                    <option value="Sizing & Product Details">Sizing & Product Details</option>
                    <option value="Other Question">Other Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your inquiry or include your order reference number..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black dark:bg-[#ccff00] py-4 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}