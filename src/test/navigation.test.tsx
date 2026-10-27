import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppLayout } from '../components/layout/AppLayout';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'u123',
      email: 'alex@example.com',
      created_at: '2026-10-24T00:00:00Z',
      user_metadata: { full_name: 'Alex Morgan' },
    },
    signOut: vi.fn(),
    isConfigured: true,
  }),
}));

describe('AppLayout Navigation Tests', () => {
  it('renders Settings in the desktop sidebar navigation', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Main Content</div>
      </AppLayout>
    );

    // Verify Settings button exists in sidebar
    const settingsBtn = screen.getByTestId('nav-settings');
    expect(settingsBtn).toBeInTheDocument();
    expect(settingsBtn).toHaveTextContent('Settings');
  });

  it('clicking Settings in the sidebar triggers onNavigate with "settings"', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Main Content</div>
      </AppLayout>
    );

    const settingsBtn = screen.getByTestId('nav-settings');
    fireEvent.click(settingsBtn);

    expect(handleNavigate).toHaveBeenCalledWith('settings');
  });

  it('renders Settings in the user profile footer and triggers navigation on click', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Main Content</div>
      </AppLayout>
    );

    const footerSettingsBtn = screen.getByTestId('footer-settings-btn');
    expect(footerSettingsBtn).toBeInTheDocument();

    fireEvent.click(footerSettingsBtn);
    expect(handleNavigate).toHaveBeenCalledWith('settings');
  });

  it('renders Settings in the mobile menu when opened', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Main Content</div>
      </AppLayout>
    );

    // Open mobile menu
    const menuToggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuToggle);

    // Verify mobile navigation has Settings button
    const mobileSettingsBtn = screen.getByTestId('mobile-nav-settings');
    expect(mobileSettingsBtn).toBeInTheDocument();

    fireEvent.click(mobileSettingsBtn);
    expect(handleNavigate).toHaveBeenCalledWith('settings');
  });

  it('renders the notification bell in the top header and opens the dropdown menu when clicked', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Main Content</div>
      </AppLayout>
    );

    const bellBtn = screen.getByTestId('notifications-bell-btn');
    expect(bellBtn).toBeInTheDocument();

    // Dropdown should not be open initially
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();

    // Click bell
    fireEvent.click(bellBtn);

    // Dropdown menu should now be visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(document.getElementById('notifications-dropdown-menu')).toBeInTheDocument();
  });
});
