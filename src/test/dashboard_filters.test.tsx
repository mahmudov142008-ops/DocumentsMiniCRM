import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DashboardPage } from '../pages/DashboardPage';
import { Customer } from '../types/crm';

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

// Mock ToastContext
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
  }),
}));

// Mock PreferencesContext
vi.mock('../context/PreferencesContext', () => ({
  usePreferences: () => ({
    formatDate: (s: string) => s,
    theme: 'light',
    accent: 'green',
    compactMode: false,
    dateFormat: 'MMM D, YYYY',
  }),
}));

// Mock services to return empty arrays synchronously
vi.mock('../services/dealService', () => ({
  dealService: { getAll: vi.fn(() => Promise.resolve([])) },
}));
vi.mock('../services/taskService', () => ({
  taskService: { getAll: vi.fn(() => Promise.resolve([])), isOverdue: vi.fn(() => false) },
}));
vi.mock('../services/meetingService', () => ({
  meetingService: { getAll: vi.fn(() => Promise.resolve([])) },
}));
vi.mock('../services/salesGoalService', () => ({
  salesGoalService: { getAll: vi.fn(() => Promise.resolve([])), calculateProgress: vi.fn() },
}));

const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    user_id: 'u1',
    name: 'Sarah Connor',
    email: 'sarah@cyberdyne.io',
    phone: '+1 555-0101',
    company: 'Cyberdyne Systems',
    status: 'New',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    user_id: 'u1',
    name: 'Miles Dyson',
    email: 'miles@cyberdyne.io',
    phone: '+1 555-0102',
    company: 'Cyberdyne Systems',
    status: 'Negotiation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    user_id: 'u1',
    name: 'John Matrix',
    email: 'john@valverde.gov',
    phone: '+1 555-0202',
    company: 'Val Verde Defense',
    status: 'Contacted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cust-4',
    user_id: 'u1',
    name: 'Douglas Quaid',
    email: 'quaid@rekall.mars',
    phone: '+1 555-0303',
    company: 'Rekall Inc',
    status: 'Lost',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('Dashboard Search and Filter Logic', () => {
  const defaultProps = {
    customers: mockCustomers,
    loading: false,
    onRefresh: vi.fn(() => Promise.resolve()),
    onCreateCustomer: vi.fn(() => Promise.resolve()),
    onUpdateCustomer: vi.fn(() => Promise.resolve()),
    onDeleteCustomer: vi.fn(() => Promise.resolve()),
    onNavigate: vi.fn(),
  };

  it('renders all initial customers within the recent customer activity table', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    expect(screen.getByText('Recent Customer Activity')).toBeInTheDocument();
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Miles Dyson')).toBeInTheDocument();
    expect(screen.getByText('John Matrix')).toBeInTheDocument();
    expect(screen.getByText('Douglas Quaid')).toBeInTheDocument();
  });

  it('filters customer rows according to search query (name, company, email)', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    const searchInput = screen.getByTestId('dashboard-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Rekall' } });
    });

    expect(screen.getByText('Douglas Quaid')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Connor')).not.toBeInTheDocument();
    expect(screen.queryByText('John Matrix')).not.toBeInTheDocument();
  });

  it('filters customer rows when selecting a status filter pill', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    const contactedBtn = screen.getByTestId('dashboard-filter-contacted');
    await act(async () => {
      fireEvent.click(contactedBtn);
    });

    expect(screen.getByText('John Matrix')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Connor')).not.toBeInTheDocument();
    expect(screen.queryByText('Miles Dyson')).not.toBeInTheDocument();
    expect(screen.queryByText('Douglas Quaid')).not.toBeInTheDocument();
  });

  it('supports combined search query and status filter simultaneously', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    // Both Sarah and Miles are at Cyberdyne, but only Miles is in Negotiation
    const searchInput = screen.getByTestId('dashboard-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Cyberdyne' } });
    });

    const negotiationBtn = screen.getByTestId('dashboard-filter-negotiation');
    await act(async () => {
      fireEvent.click(negotiationBtn);
    });

    expect(screen.getByText('Miles Dyson')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Connor')).not.toBeInTheDocument();
    expect(screen.queryByText('John Matrix')).not.toBeInTheDocument();
  });

  it('clears search text and restores results when clicking clear search button', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    const searchInput = screen.getByTestId('dashboard-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Sarah' } });
    });

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.queryByText('Douglas Quaid')).not.toBeInTheDocument();

    const clearBtn = screen.getByTestId('dashboard-clear-search-btn');
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Douglas Quaid')).toBeInTheDocument();
  });

  it('resets all filters when clicking the "Clear Filters" button', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    const searchInput = screen.getByTestId('dashboard-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Cyberdyne' } });
      fireEvent.click(screen.getByTestId('dashboard-filter-negotiation'));
    });

    expect(screen.getByTestId('dashboard-reset-filters-btn')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('dashboard-reset-filters-btn'));
    });

    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Miles Dyson')).toBeInTheDocument();
    expect(screen.getByText('John Matrix')).toBeInTheDocument();
    expect(screen.getByText('Douglas Quaid')).toBeInTheDocument();
  });

  it('displays empty filter state when no customer matches search criteria', async () => {
    await act(async () => {
      render(<DashboardPage {...defaultProps} />);
    });

    const searchInput = screen.getByTestId('dashboard-search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'NonExistentPerson' } });
    });

    expect(screen.getByText(/No recent customer activity matches your search and filter criteria/i)).toBeInTheDocument();
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();

    // Clicking Reset Filters restores records
    await act(async () => {
      fireEvent.click(screen.getByText('Reset Filters'));
    });
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
  });
});
