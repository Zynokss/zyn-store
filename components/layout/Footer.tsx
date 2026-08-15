'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Check, AlertCircle } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({
    type: null,
    msg: '',
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', msg: 'Subscribed to VIP drops!' });
        setEmail('');
      } else {
        setStatus({ type: 'error', msg: data.error || 'Failed to subscribe.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error submitting email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 transition-colors duration-200 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white">
              ZYN<span className="text-[#9ae600]">.</span>
            </Link>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              An independent apparel studio based in city, country. Considered streetwear for everyday, crafted in limited drops.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Shop Collections</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Heavyweight Hoodies
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Graphic &amp; Plain Tees
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Studio Outerwear
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Limited Drop Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio / Support Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Customer Care</h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/track-order" className="hover:text-black dark:hover:text-white transition-colors">
                  Track Order (Amana Express)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                  Shipping &amp; Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Join The Club</h4>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Sign up for early drop access, restock alerts, and exclusive subscriber offers.
            </p>

            <form className="mt-4 space-y-2" onSubmit={handleNewsletterSubmit}>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 rounded-full focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black px-5 py-2.5 text-xs font-bold uppercase rounded-full transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                </button>
              </div>

              {status.type === 'success' && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-[#9ae600] flex items-center gap-1 pt-1">
                  <Check className="h-3.5 w-3.5" /> {status.msg}
                </p>
              )}

              {status.type === 'error' && (
                <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 pt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {status.msg}
                </p>
              )}
            </form>
          </div>

        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>&copy; {new Date().getFullYear()} ZYN APPAREL STUDIO. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Instagram</Link>
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}