import { createContext, useEffect, useLayoutEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  mode: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  mode: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'mesco-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useLayoutEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    setSystemTheme(systemTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, systemTheme]);

  const value = {
    theme,
    mode: theme === 'system' ? systemTheme : theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export { ThemeProvider, ThemeProviderContext };
