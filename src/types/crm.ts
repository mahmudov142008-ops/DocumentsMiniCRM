export type CustomerStatus = 'New' | 'Contacted' | 'Negotiation' | 'Lost';

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  byStatus: Record<CustomerStatus, number>;
  activeDealsCount: number; // 'Contacted' + 'Negotiation'
  recentCustomers: Customer[];
}

export const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bg: string; border: string }> = {
  New: {
    label: 'New',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.28)',
  },
  Contacted: {
    label: 'Contacted',
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.28)',
  },
  Negotiation: {
    label: 'Negotiation',
    color: '#C084FC',
    bg: 'rgba(192, 132, 252, 0.14)',
    border: 'rgba(192, 132, 252, 0.32)',
  },
  Lost: {
    label: 'Lost',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.24)',
  },
};
