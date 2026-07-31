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
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <Link href="/" className="text-xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white">
              ZYN<span className="text-black dark:text-[#ccff00]">.STORE</span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Engineered streetwear built with heavyweight fabrics, boxy fits, and daily utility in mind.
            </p>
          </div>

          {/* Shop Col (Connected Category Filters) */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-[#ccff00]">Shop</h4>
            <ul className="mt-3 space-y-2 text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Tops & Hoodies
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Bottoms & Pants
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  Jerseys & Outerwear
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-black dark:hover:text-white transition-colors">
                  All Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-[#ccff00]">Support</h4>
            <ul className="mt-3 space-y-2 text-xs font-bold uppercase text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/track-order" className="hover:text-black dark:hover:text-white transition-colors">
                  Track Order (Amana)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">
                  Sizing Chart
                </Link>
              </li>
            </ul>
          </div>

          {/* Working Newsletter Col */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-[#ccff00]">Newsletter</h4>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Subscribe for early access to drops & private restocks.
            </p>

            <form className="mt-3 space-y-2" onSubmit={handleNewsletterSubmit}>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER EMAIL"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-black dark:bg-[#ccff00] px-4 py-2 text-xs font-black uppercase text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-lime-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                </button>
              </div>

              {status.type === 'success' && (
                <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#ccff00] flex items-center gap-1">
                  <Check className="h-3 w-3" /> {status.msg}
                </p>
              )}

              {status.type === 'error' && (
                <p className="text-[10px] font-mono font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {status.msg}
                </p>
              )}
            </form>
          </div>

        </div>

        <div className="mt-12 border-t border-zinc-200 dark:border-zinc-900 pt-6 text-center">
          <p className="text-[11px] font-mono text-zinc-500">
            &copy; {new Date().getFullYear()} ZYN.STORE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}