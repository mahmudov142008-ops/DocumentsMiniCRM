import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'violet' | 'blue' | 'green';
export type DateFormatOption = 'MMM D, YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

interface PreferencesContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  accent: AccentColor;
  compactMode: boolean;
  dateFormat: DateFormatOption;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setCompactMode: (compact: boolean) => void;
  setDateFormat: (format: DateFormatOption) => void;
  formatDate: (isoString: string, options?: { includeTime?: boolean }) => string;
}

const STORAGE_KEYS = {
  THEME: 'minicrm_theme',
  ACCENT: 'minicrm_accent',
  COMPACT: 'minicrm_compact',
  DATE_FORMAT: 'minicrm_date_format',
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    }
    return 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCENT) as AccentColor;
      if (saved === 'violet' || saved === 'blue' || saved === 'green') return saved;
    }
    return 'violet';
  });

  const [compactMode, setCompactModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.COMPACT) === 'true';
    }
    return false;
  });

  const [dateFormat, setDateFormatState] = useState<DateFormatOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.DATE_FORMAT) as DateFormatOption;
      if (saved === 'MMM D, YYYY' || saved === 'MM/DD/YYYY' || saved === 'DD/MM/YYYY' || saved === 'YYYY-MM-DD') {
        return saved;
      }
    }
    return 'MMM D, YYYY';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // 2. Resolve Theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // 3. Listen to OS System Theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 4. Apply DOM Attributes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-accent', accent);

    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  }, [resolvedTheme, accent, compactMode]);

  // 5. Persistent Setters
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const setAccent = useCallback((newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem(STORAGE_KEYS.ACCENT, newAccent);
  }, []);

  const setCompactMode = useCallback((compact: boolean) => {
    setCompactModeState(compact);
    localStorage.setItem(STORAGE_KEYS.COMPACT, String(compact));
  }, []);

  const setDateFormat = useCallback((format: DateFormatOption) => {
    setDateFormatState(format);
    localStorage.setItem(STORAGE_KEYS.DATE_FORMAT, format);
  }, []);

  // 6. Consistent Date Formatter
  const formatDate = useCallback(
    (isoString: string, options?: { includeTime?: boolean }) => {
      if (!isoString) return '';
      try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const monthShort = d.toLocaleDateString('en-US', { month: 'short' });

        let datePart = '';
        switch (dateFormat) {
          case 'MM/DD/YYYY':
            datePart = `${month}/${day}/${year}`;
            break;
          case 'DD/MM/YYYY':
            datePart = `${day}/${month}/${year}`;
            break;
          case 'YYYY-MM-DD':
            datePart = `${year}-${month}-${day}`;
            break;
          case 'MMM D, YYYY':
          default:
            datePart = `${monthShort} ${d.getDate()}, ${year}`;
            break;
        }

        if (options?.includeTime) {
          const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `${datePart}, ${timePart}`;
        }

        return datePart;
      } catch {
        return isoString;
      }
    },
    [dateFormat]
  );

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        resolvedTheme,
        accent,
        compactMode,
        dateFormat,
        setTheme,
        setAccent,
        setCompactMode,
        setDateFormat,
        formatDate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
