import React, { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'fittrack_theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let current: 'light' | 'dark' = 'dark';
      if (theme === 'system') {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        current = theme;
      }

      root.classList.remove('light', 'dark');
      root.classList.add(current);
      setResolvedTheme(current);
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <button
      onClick={cycleTheme}
      type="button"
      title={`Current: ${theme}. Click to change theme.`}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-all duration-200 border border-border/40 hover:scale-105 active:scale-95 ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'system' ? (
        <Monitor className="w-4 h-4 text-primary animate-in fade-in zoom-in-75 duration-200" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="w-4 h-4 text-indigo-400 animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 animate-in fade-in zoom-in-75 duration-200" />
      )}
    </button>
  );
}
