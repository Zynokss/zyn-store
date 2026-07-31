'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Lock, Mail, Loader2 } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/account');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="flex-1 flex items-center justify-center p-4 my-8 sm:my-16">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors duration-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-[#ccff00] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              {isRegistering
                ? 'Join ZYN.STORE to track orders & save preferences.'
                : 'Sign in to access your order history & profile.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-3 pl-10 pr-4 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-3 pl-10 pr-4 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-3 pl-10 pr-4 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#ccff00] focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-black dark:bg-[#ccff00] py-3.5 text-xs font-black uppercase text-white dark:text-black hover:bg-[#ccff00] hover:text-black dark:hover:bg-lime-400 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-[#ccff00] underline uppercase cursor-pointer transition-colors"
            >
              {isRegistering
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}