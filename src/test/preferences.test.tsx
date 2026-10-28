import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { PreferencesProvider, usePreferences } from '../context/PreferencesContext';
import { SettingsPage } from '../pages/SettingsPage';
import { ToastProvider } from '../context/ToastContext';

// Mock profileService
vi.mock('../services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(() => Promise.resolve({
      id: 'u123',
      email: 'test@example.com',
      full_name: 'John Doe',
      created_at: '2026-10-24T00:00:00Z',
    })),
    updateProfile: vi.fn(() => Promise.resolve()),
  },
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'u123',
      email: 'test@example.com',
      created_at: '2026-10-24T00:00:00Z',
      user_metadata: { full_name: 'John Doe' },
    },
    signOut: vi.fn(),
    isConfigured: true,
  }),
}));

describe('Preferences & Settings Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.classList.remove('compact-mode');
  });

  describe('PreferencesContext Hook', () => {
    it('initializes with default preferences and sets DOM attributes', () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.accent).toBe('green');
      expect(result.current.compactMode).toBe(false);
      expect(result.current.dateFormat).toBe('MMM D, YYYY');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-accent')).toBe('green');
      expect(document.documentElement.classList.contains('compact-mode')).toBe(false);
    });

    it('switches theme to light and updates DOM and localStorage', () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
      });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(localStorage.getItem('minicrm_theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('updates accent color and sets data-accent attribute', () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
      });

      act(() => {
        result.current.setAccent('blue');
      });

      expect(result.current.accent).toBe('blue');
      expect(localStorage.getItem('minicrm_accent')).toBe('blue');
      expect(document.documentElement.getAttribute('data-accent')).toBe('blue');

      act(() => {
        result.current.setAccent('green');
      });

      expect(result.current.accent).toBe('green');
      expect(localStorage.getItem('minicrm_accent')).toBe('green');
      expect(document.documentElement.getAttribute('data-accent')).toBe('green');
    });

    it('toggles compact mode and updates document classList', () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
      });

      act(() => {
        result.current.setCompactMode(true);
      });

      expect(result.current.compactMode).toBe(true);
      expect(localStorage.getItem('minicrm_compact')).toBe('true');
      expect(document.documentElement.classList.contains('compact-mode')).toBe(true);

      act(() => {
        result.current.setCompactMode(false);
      });

      expect(result.current.compactMode).toBe(false);
      expect(localStorage.getItem('minicrm_compact')).toBe('false');
      expect(document.documentElement.classList.contains('compact-mode')).toBe(false);
    });

    it('formats dates consistently based on selected dateFormat', () => {
      const { result } = renderHook(() => usePreferences(), {
        wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
      });

      const testDate = '2026-10-24T15:30:00Z';

      // Default format: MMM D, YYYY
      expect(result.current.formatDate(testDate)).toContain('2026');

      // ISO Standard: YYYY-MM-DD
      act(() => {
        result.current.setDateFormat('YYYY-MM-DD');
      });
      expect(result.current.formatDate(testDate)).toMatch(/2026-\d{2}-\d{2}/);

      // US: MM/DD/YYYY
      act(() => {
        result.current.setDateFormat('MM/DD/YYYY');
      });
      expect(result.current.formatDate(testDate)).toMatch(/\d{2}\/\d{2}\/2026/);

      // International: DD/MM/YYYY
      act(() => {
        result.current.setDateFormat('DD/MM/YYYY');
      });
      expect(result.current.formatDate(testDate)).toMatch(/\d{2}\/\d{2}\/2026/);
    });
  });

  describe('SettingsPage Component', () => {
    it('renders Appearance, Profile, and Preferences sections', async () => {
      render(
        <ToastProvider>
          <PreferencesProvider>
            <SettingsPage />
          </PreferencesProvider>
        </ToastProvider>
      );

      // Verify Headers
      expect(screen.getByText('Settings & Preferences')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Profile Details')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();

      // Verify Theme Options
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
      expect(screen.getByText('System Default')).toBeInTheDocument();

      // Verify Accent Options
      expect(screen.getByText('Violet / Indigo')).toBeInTheDocument();
      expect(screen.getByText('Electric Blue')).toBeInTheDocument();
      expect(screen.getByText('Emerald Green')).toBeInTheDocument();

      // Verify Profile Read-Only fields
      expect(screen.getByDisplayValue('test@example.com')).toBeDisabled();

      // Verify Date Format Options
      expect(screen.getByText('MMM D, YYYY')).toBeInTheDocument();
      expect(screen.getByText('MM/DD/YYYY')).toBeInTheDocument();
      expect(screen.getByText('DD/MM/YYYY')).toBeInTheDocument();
      expect(screen.getByText('YYYY-MM-DD')).toBeInTheDocument();
    });

    it('interactively changes theme when clicking theme buttons', () => {
      render(
        <ToastProvider>
          <PreferencesProvider>
            <SettingsPage />
          </PreferencesProvider>
        </ToastProvider>
      );

      const lightButton = screen.getByText('Light Theme').closest('button');
      expect(lightButton).toBeInTheDocument();

      fireEvent.click(lightButton!);

      expect(localStorage.getItem('minicrm_theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('interactively changes accent color when clicking accent buttons', () => {
      render(
        <ToastProvider>
          <PreferencesProvider>
            <SettingsPage />
          </PreferencesProvider>
        </ToastProvider>
      );

      const blueButton = screen.getByText('Electric Blue').closest('button');
      expect(blueButton).toBeInTheDocument();

      fireEvent.click(blueButton!);

      expect(localStorage.getItem('minicrm_accent')).toBe('blue');
      expect(document.documentElement.getAttribute('data-accent')).toBe('blue');
    });
  });
});
