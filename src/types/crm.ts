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
    color: '#183C28',
    bg: '#EBF3EE',
    border: '#C5DEC8',
  },
  Contacted: {
    label: 'Contacted',
    color: '#8A6008',
    bg: '#FBF4E4',
    border: '#EED9A7',
  },
  Negotiation: {
    label: 'Negotiation',
    color: '#5C4B7E',
    bg: '#F2EEF8',
    border: '#D8CCE8',
  },
  Lost: {
    label: 'Lost',
    color: '#626764',
    bg: '#F0F1F0',
    border: '#D4D7D5',
  },
};
