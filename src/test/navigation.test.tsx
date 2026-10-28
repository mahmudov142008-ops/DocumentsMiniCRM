import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../pages/LandingPage';

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

  it('renders a clearly visible Home button in the authenticated header and navigates to the public landing page', () => {
    const handleNavigate = vi.fn();
    const handleNavigateToLanding = vi.fn();

    render(
      <AppLayout
        currentPage="dashboard"
        onNavigate={handleNavigate}
        onNavigateToLanding={handleNavigateToLanding}
      >
        <div>Main Content</div>
      </AppLayout>
    );

    const homeBtn = screen.getByTestId('header-home-btn');
    expect(homeBtn).toBeInTheDocument();
    expect(homeBtn).toHaveTextContent('Home');

    fireEvent.click(homeBtn);
    expect(handleNavigateToLanding).toHaveBeenCalledTimes(1);
    expect(handleNavigate).not.toHaveBeenCalled();
  });

  it('clicking the desktop sidebar MiniCRM logo navigates to the public landing page', () => {
    const handleNavigate = vi.fn();
    const handleNavigateToLanding = vi.fn();

    render(
      <AppLayout
        currentPage="dashboard"
        onNavigate={handleNavigate}
        onNavigateToLanding={handleNavigateToLanding}
      >
        <div>Main Content</div>
      </AppLayout>
    );

    const brandLogo = screen.getByTestId('sidebar-brand-logo');
    expect(brandLogo).toBeInTheDocument();

    fireEvent.click(brandLogo);
    expect(handleNavigateToLanding).toHaveBeenCalledTimes(1);
    expect(handleNavigate).not.toHaveBeenCalled();
  });

  it('clicking the mobile header MiniCRM logo navigates to the public landing page', () => {
    const handleNavigate = vi.fn();
    const handleNavigateToLanding = vi.fn();

    render(
      <AppLayout
        currentPage="dashboard"
        onNavigate={handleNavigate}
        onNavigateToLanding={handleNavigateToLanding}
      >
        <div>Main Content</div>
      </AppLayout>
    );

    const mobileBrand = screen.getByTestId('mobile-header-brand');
    expect(mobileBrand).toBeInTheDocument();

    fireEvent.click(mobileBrand);
    expect(handleNavigateToLanding).toHaveBeenCalledTimes(1);
    expect(handleNavigate).not.toHaveBeenCalled();
  });

  it('renders Home in the mobile dropdown menu and navigates to the public landing page when clicked', () => {
    const handleNavigate = vi.fn();
    const handleNavigateToLanding = vi.fn();

    render(
      <AppLayout
        currentPage="dashboard"
        onNavigate={handleNavigate}
        onNavigateToLanding={handleNavigateToLanding}
      >
        <div>Main Content</div>
      </AppLayout>
    );

    // Open mobile menu
    const menuToggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuToggle);

    const mobileHomeBtn = screen.getByTestId('mobile-nav-home');
    expect(mobileHomeBtn).toBeInTheDocument();
    expect(mobileHomeBtn).toHaveTextContent(/Home/);

    fireEvent.click(mobileHomeBtn);
    expect(handleNavigateToLanding).toHaveBeenCalledTimes(1);
    expect(handleNavigate).not.toHaveBeenCalled();
  });
});

describe('LandingPage Authenticated Navigation Tests', () => {
  it('renders "Go to Dashboard" button when accessed by authenticated user', () => {
    const handleGoToDashboard = vi.fn();
    const handleGetStarted = vi.fn();
    const handleSignIn = vi.fn();

    render(
      <LandingPage
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
        onGoToDashboard={handleGoToDashboard}
        isAuthenticated={true}
      />
    );

    const dashboardBtn = screen.getByTestId('landing-dashboard-btn');
    expect(dashboardBtn).toBeInTheDocument();
    expect(dashboardBtn).toHaveTextContent(/Go to Dashboard/i);

    fireEvent.click(dashboardBtn);
    expect(handleGoToDashboard).toHaveBeenCalledTimes(1);
  });

  it('renders public "Sign In" and "Get Started" buttons when unauthenticated', () => {
    const handleGetStarted = vi.fn();
    const handleSignIn = vi.fn();

    render(
      <LandingPage
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
        isAuthenticated={false}
      />
    );

    expect(screen.queryByTestId('landing-dashboard-btn')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^sign in$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^get started$/i })[0]).toBeInTheDocument();
  });
});

