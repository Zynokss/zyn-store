'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import en from '@/messages/en.json';
import fr from '@/messages/fr.json';
import ar from '@/messages/ar.json';

const dictionaries: Record<string, Record<string, Record<string, string>>> = { en, fr, ar };

interface IntlContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('zyn_locale');
    if (saved && ['en', 'fr', 'ar'].includes(saved)) {
      queueMicrotask(() => setLocaleState(saved));
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem('zyn_locale', newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  const t = (path: string) => {
    const [namespace, key] = path.split('.');
    return dictionaries[locale]?.[namespace]?.[key] || dictionaries['en']?.[namespace]?.[key] || path;
  };

  return (
    <IntlContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </IntlContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(IntlContext);
  if (!context) throw new Error('useTranslation must be used within IntlProvider');
  return context;
}