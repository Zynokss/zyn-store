'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="text-xl font-black tracking-tighter uppercase text-white">
              ZYN<span className="text-[#ccff00]">.STORE</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Engineered streetwear built with heavyweight fabrics, boxy fits, and daily utility in mind.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#ccff00]">Shop</h4>
            <ul className="mt-3 space-y-2 text-xs font-bold uppercase text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">Tops</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Bottoms</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Outerwear</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#ccff00]">Support</h4>
            <ul className="mt-3 space-y-2 text-xs font-bold uppercase text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sizing Chart</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#ccff00]">Newsletter</h4>
            <p className="mt-3 text-xs text-zinc-400 font-medium">Subscribe for early access to drops.</p>
            <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="ENTER EMAIL"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#ccff00] px-4 py-2 text-xs font-black uppercase text-black hover:bg-[#b8e600] transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-900 pt-6 text-center">
          <p className="text-[11px] font-mono text-zinc-500">
            &copy; {new Date().getFullYear()} ZYN.STORE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}