'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { ArrowLeft } from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { useTranslation } from '@/components/providers/IntlProvider';
import '../_neon-auth-scoped.css';

export default function AuthCatchAllPage() {
  const params = useParams<{ pathname?: string | string[] }>();
  const pathname = usePathname();
  const { t } = useTranslation();

  const tail = Array.isArray(params?.pathname) ? params.pathname.join('/') : params?.pathname || 'sign-in';

  return (
    <StoreLayout>
      <div className="flex-1 flex items-center justify-center p-4 my-8 sm:my-12">
        <div className="w-full max-w-2xl neon-auth-root">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-[#ccff00] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> {t('continueShopping') || 'Back to Store'}
          </Link>

          <div
            className="border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-sm p-0 sm:p-0 shadow-xl overflow-hidden"
            style={{ ['--better-radius' as any]: '2px' }}
          >
            <AuthView
              {...({
                pathname: `/auth/${tail}`,
                appearance: {
                  baseTheme: 'zinc',
                  layout: { variant: 'card', split: false },
                  variables: {
                    colorPrimary: '#ccff00',
                    colorForeground: '#09090b',
                    colorBackground: '#ffffff',
                    colorInputBackground: '#fafafa',
                    colorBorder: '#e4e4e7',
                    colorMutedForeground: '#52525b',
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                  },
                  darkModeVariables: {
                    colorForeground: '#fafafa',
                    colorBackground: '#18181b',
                    colorInputBackground: '#09090b',
                    colorBorder: '#27272a',
                    colorMutedForeground: '#a1a1aa',
                  },
                  elements: {
                    container: '!bg-transparent !border-0 !shadow-none !p-0',
                    sidebar: '!hidden !w-0 !flex-0 !min-w-0',
                    sidePanel: '!hidden',
                    decor: '!hidden',
                    card: '!w-full !max-w-full !border-0 !shadow-none !p-6 sm:!p-10',
                    main: '!w-full',
                    heading: '!font-black !tracking-tight !uppercase !text-zinc-900 dark:!text-white',
                    subheading: '!font-mono !uppercase !tracking-widest !text-[10px] !text-zinc-500 dark:!text-zinc-400',
                    label: '!font-mono !uppercase !tracking-wider !text-[10px] !font-bold !text-zinc-500 dark:!text-zinc-400 !mb-1',
                    input:
                      '!rounded-sm !border-2 !border-zinc-200 dark:!border-zinc-800 !bg-zinc-50 dark:!bg-zinc-950 !px-3 !py-2.5 !text-xs !font-bold !font-mono !text-zinc-900 dark:!text-white placeholder:!font-normal placeholder:!text-zinc-400 dark:placeholder:!text-zinc-500 focus:!ring-0 focus:!border-black dark:focus:!border-[#ccff00] focus:!bg-white dark:focus:!bg-zinc-900',
                    button:
                      '!rounded-sm !bg-black dark:!bg-[#ccff00] !text-white dark:!text-black !text-xs !font-black !uppercase !tracking-wider !py-3 !border-2 !border-black dark:!border-[#ccff00] hover:!bg-[#ccff00] hover:!text-black dark:hover:!bg-lime-400 !transition-all active:!scale-[0.98]',
                    linkButton:
                      '!text-xs !font-bold !uppercase !text-zinc-600 dark:!text-zinc-400 hover:!text-black dark:hover:!text-[#ccff00] !underline !decoration-1 underline-offset-4',
                    dividerText: '!font-mono !uppercase !tracking-widest !text-[10px] !text-zinc-400 dark:!text-zinc-500',
                  },
                },
                fallbackPath: '/auth/sign-in',
                routerPush: (to: string) => {
                  if (typeof window !== 'undefined') {
                    window.location.href = to;
                  }
                },
              } as any)}
            />
          </div>

          <input type="hidden" value={pathname} />
        </div>
      </div>
    </StoreLayout>
  );
}
