'use client';

import * as React from 'react';

type Theme = 'dark' | 'light';
type ThemeContextValue = {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Theme | undefined;
  themes: Theme[];
};

const THEME_STORAGE_KEY = 'zyn-theme';
const DEFAULT_THEME: Theme = 'dark';
const THEMES: Theme[] = ['light', 'dark'];

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial = (stored && THEMES.includes(stored) ? stored : defaultTheme) as Theme;
    applyTheme(initial, false);
    return initial;
  });

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue && THEMES.includes(e.newValue as Theme)) {
        applyTheme(e.newValue as Theme, true);
        setThemeState(e.newValue as Theme);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    applyTheme(next, true);
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: Theme, persist: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const prev = root.getAttribute('data-zyn-theme-applied');
  if (prev === theme) return;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.setAttribute('data-zyn-theme-applied', theme);
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* noop */
    }
  }
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return ctx;
}

export type { Theme };