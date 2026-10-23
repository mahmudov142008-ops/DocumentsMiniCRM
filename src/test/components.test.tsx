import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/ui/Badge';
import { StatCards } from '../components/dashboard/StatCards';
import { Customer } from '../types/crm';

const mockList: Customer[] = [
  {
    id: '1',
    user_id: 'u1',
    name: 'Alice',
    company: 'Alpha',
    email: 'alice@alpha.com',
    phone: '1234567',
    status: 'New',
    created_at: '2026-10-24T00:00:00Z',
    updated_at: '2026-10-24T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'u1',
    name: 'Bob',
    company: 'Beta',
    email: 'bob@beta.com',
    phone: '1234567',
    status: 'Contacted',
    created_at: '2026-10-24T00:00:00Z',
    updated_at: '2026-10-24T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'u1',
    name: 'Charlie',
    company: 'Gamma',
    email: 'charlie@gamma.com',
    phone: '1234567',
    status: 'Negotiation',
    created_at: '2026-10-24T00:00:00Z',
    updated_at: '2026-10-24T00:00:00Z',
  },
];

describe('UI Component Unit Tests', () => {
  describe('Badge component', () => {
    it('renders correct label for New status', () => {
      render(<Badge status="New" />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders correct label for Negotiation status', () => {
      render(<Badge status="Negotiation" />);
      expect(screen.getByText('Negotiation')).toBeInTheDocument();
    });
  });

  describe('StatCards component', () => {
    it('calculates total customers and stages correctly from stored records', () => {
      render(<StatCards customers={mockList} />);
      // Total customers is 3
      expect(screen.getByText('Total Customers')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // New leads is 1
      expect(screen.getByText('New Leads')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();

      // Active Pipeline (Contacted + Negotiation = 2)
      expect(screen.getByText('Active Pipeline')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('handles empty customer array gracefully with zero counts', () => {
      render(<StatCards customers={[]} />);
      expect(screen.getByText('Total Customers')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
