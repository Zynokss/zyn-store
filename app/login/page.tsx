'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { useTranslation } from '@/components/providers/IntlProvider';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const useSession = authClient.useSession as () => {
    data?: { user?: { email?: string } };
    isPending: boolean;
  };
  const { data: sessionData, isPending: sessionLoading } = useSession();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionLoading && sessionData?.user?.email) {
      router.replace('/account');
    }
  }, [sessionLoading, sessionData, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: authError } =
        mode === 'signIn'
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name.trim() || email.split('@')[0] });

      if (authError) {
        setError(authError.message || t('saveError') || 'Authentication failed.');
        return;
      }

      router.push('/account');
    } catch {
      setError(t('saveError') || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading || sessionData?.user?.email) {
    return (
      <StoreLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24 font-sans">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-[#9ae600]" />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-md px-4 py-16 w-full font-sans antialiased">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t('continueShopping')}
        </Link>

        <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            {mode === 'signIn' ? (
              <LogIn className="h-5 w-5 text-zinc-900 dark:text-[#9ae600]" />
            ) : (
              <UserPlus className="h-5 w-5 text-zinc-900 dark:text-[#9ae600]" />
            )}
            <h1 className="text-lg font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">
              {mode === 'signIn' ? t('signIn') : t('createAccountCTA')}
            </h1>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signUp' && (
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1.5 block">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 pr-10 text-xs font-medium text-zinc-900 dark:text-white focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-zinc-900 text-white hover:bg-[#9ae600] hover:text-black dark:bg-white dark:text-zinc-900 dark:hover:bg-[#9ae600] dark:hover:text-black py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'signIn' ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {mode === 'signIn' ? t('signIn') : t('createAccountCTA')}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
              setError('');
            }}
            className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {mode === 'signIn' ? t('createAccount') : t('signIn')}
          </button>
        </div>
      </div>
    </StoreLayout>
  );
}
