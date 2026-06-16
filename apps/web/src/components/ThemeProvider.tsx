'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'creepjs-theme';

interface ThemeContextType {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getPreferredTheme(): Theme {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  }

  return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme);
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    html.classList.toggle('dark', newTheme === 'dark');
    html.style.colorScheme = newTheme;
  };

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      // Check system preference if no stored theme
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const systemTheme: Theme = prefersDark ? 'dark' : 'light';
      setThemeState(systemTheme);
      applyTheme(systemTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Always provide context, even during SSR
  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
