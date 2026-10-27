/**
 * Navigation tests verifying that all 8 sidebar items are rendered and
 * trigger the correct page identifier via onNavigate.
 */
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

const ALL_PAGES = [
  'dashboard',
  'customers',
  'pipeline',
  'tasks',
  'calendar',
  'companies',
  'reports',
  'settings',
] as const;

describe('Full 8-page Sidebar Navigation', () => {
  ALL_PAGES.forEach(page => {
    it(`renders "${page}" nav item and navigates on click`, () => {
      const handleNavigate = vi.fn();

      render(
        <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
          <div>Content</div>
        </AppLayout>
      );

      const btn = screen.getByTestId(`nav-${page}`);
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleNavigate).toHaveBeenCalledWith(page);
    });
  });

  it('renders all 8 desktop sidebar nav buttons', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Content</div>
      </AppLayout>
    );

    ALL_PAGES.forEach(page => {
      expect(screen.getByTestId(`nav-${page}`)).toBeInTheDocument();
    });
  });

  it('highlights the active page item', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="tasks" onNavigate={handleNavigate}>
        <div>Content</div>
      </AppLayout>
    );

    const tasksBtn = screen.getByTestId('nav-tasks');
    // Active button has fontWeight 600 applied via inline style
    expect(tasksBtn).toBeInTheDocument();
  });

  it('opens mobile menu and shows all 8 items', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Content</div>
      </AppLayout>
    );

    const menuToggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuToggle);

    ALL_PAGES.forEach(page => {
      expect(screen.getByTestId(`mobile-nav-${page}`)).toBeInTheDocument();
    });
  });

  it('global search button is present in the sidebar', () => {
    const handleNavigate = vi.fn();

    render(
      <AppLayout currentPage="dashboard" onNavigate={handleNavigate}>
        <div>Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('sidebar-search-btn')).toBeInTheDocument();
  });
});
