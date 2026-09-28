import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'system' | 'black' | 'light' | 'navy';
export type ResolvedTheme = 'black' | 'light' | 'navy';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'age_labes_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && ['system', 'black', 'light', 'navy'].includes(saved)) {
      return saved;
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default fallback to dark
  });

  // Listen to device theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute resolved theme
  const resolvedTheme: ResolvedTheme =
    mode === 'system'
      ? systemIsDark
        ? 'black' // If device is dark/black -> black
        : 'light' // If device is light -> white
      : mode;

  const isDark = resolvedTheme === 'black' || resolvedTheme === 'navy';

  // Apply to DOM and theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('theme-black', 'theme-light', 'theme-navy');
    root.classList.add(`theme-${resolvedTheme}`);

    let metaColor = '#000000';
    if (resolvedTheme === 'black') {
      body.className = 'bg-black text-white selection:bg-sky-500 selection:text-white transition-colors duration-200';
      metaColor = '#000000';
    } else if (resolvedTheme === 'light') {
      body.className = 'bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white transition-colors duration-200';
      metaColor = '#f8fafc';
    } else if (resolvedTheme === 'navy') {
      body.className = 'bg-[#0a1128] text-white selection:bg-cyan-500 selection:text-white transition-colors duration-200';
      metaColor = '#0a1128';
    }

    const metaTag = document.getElementById('theme-color-meta') || document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      metaTag.setAttribute('content', metaColor);
    }
  }, [resolvedTheme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['system', 'black', 'light', 'navy'];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
  };

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, cycleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
