export type CustomerStatus = 'New' | 'Contacted' | 'Negotiation' | 'Lost';

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  tags?: string[];
  is_favorite?: boolean;
  last_contact_date?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  tags?: string[];
  is_favorite?: boolean;
  last_contact_date?: string;
  company_id?: string;
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

export type DealStage = 'Lead' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  id: string;
  user_id: string;
  customer_id?: string;
  customer_name?: string;
  company_id?: string;
  company_name?: string;
  title: string;
  value: number;
  stage: DealStage;
  expected_close_date?: string;
  description?: string;
  lost_reason?: string;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealInput {
  customer_id?: string;
  company_id?: string;
  title: string;
  value: number;
  stage: DealStage;
  expected_close_date?: string;
  description?: string;
  lost_reason?: string;
  is_favorite?: boolean;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  user_id: string;
  customer_id?: string;
  customer_name?: string;
  deal_id?: string;
  deal_title?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string; // YYYY-MM-DD
  due_time?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  customer_id?: string;
  deal_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  due_time?: string;
}

export type MeetingType = 'Discovery' | 'Demo' | 'Proposal Review' | 'Negotiation' | 'Check-in';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  user_id: string;
  customer_id?: string;
  customer_name?: string;
  deal_id?: string;
  deal_title?: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  meeting_type: MeetingType;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
}

export interface MeetingInput {
  customer_id?: string;
  deal_id?: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  contact_count?: number;
  deal_count?: number;
}

export interface CompanyInput {
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  phone?: string;
  notes?: string;
}

export interface SalesGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface SalesGoalInput {
  name: string;
  target_amount: number;
  start_date: string;
  end_date: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task_due' | 'task_overdue' | 'meeting_upcoming' | 'deal_won' | 'deal_lost' | 'general';
  link_page?: string;
  link_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
  owner_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  byStatus: Record<CustomerStatus, number>;
  totalDealValue: number;
  wonDealValue: number;
  activeDealsCount: number;
  wonDealsCount: number;
  lostDealsCount: number;
  conversionRate: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
  upcomingMeetingsCount: number;
  recentCustomers: Customer[];
  recentDeals: Deal[];
  pipelineBreakdown: Record<DealStage, { count: number; value: number }>;
  salesGoalProgress?: {
    name: string;
    target: number;
    current: number;
    percentage: number;
    remaining: number;
  };
}

export const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bg: string; border: string }> = {
  New: {
    label: 'New',
    color: '#24392F',
    bg: 'rgba(36, 57, 47, 0.08)',
    border: 'rgba(36, 57, 47, 0.22)',
  },
  Contacted: {
    label: 'Contacted',
    color: '#8A703E',
    bg: 'rgba(180, 154, 105, 0.12)',
    border: 'rgba(180, 154, 105, 0.28)',
  },
  Negotiation: {
    label: 'Negotiation',
    color: '#69735C',
    bg: 'rgba(105, 115, 92, 0.12)',
    border: 'rgba(105, 115, 92, 0.28)',
  },
  Lost: {
    label: 'Lost',
    color: '#74766F',
    bg: 'rgba(116, 118, 111, 0.10)',
    border: 'rgba(116, 118, 111, 0.22)',
  },
};

export const DEAL_STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string; border: string }> = {
  Lead: {
    label: 'Lead',
    color: '#24392F',
    bg: 'rgba(36, 57, 47, 0.08)',
    border: 'rgba(36, 57, 47, 0.22)',
  },
  Contacted: {
    label: 'Contacted',
    color: '#8A703E',
    bg: 'rgba(180, 154, 105, 0.12)',
    border: 'rgba(180, 154, 105, 0.28)',
  },
  Qualified: {
    label: 'Qualified',
    color: '#4B6B58',
    bg: 'rgba(75, 107, 88, 0.12)',
    border: 'rgba(75, 107, 88, 0.26)',
  },
  Proposal: {
    label: 'Proposal',
    color: '#B49A69',
    bg: 'rgba(180, 154, 105, 0.14)',
    border: 'rgba(180, 154, 105, 0.32)',
  },
  Negotiation: {
    label: 'Negotiation',
    color: '#69735C',
    bg: 'rgba(105, 115, 92, 0.14)',
    border: 'rgba(105, 115, 92, 0.28)',
  },
  Won: {
    label: 'Won',
    color: '#1C4A34',
    bg: 'rgba(28, 74, 52, 0.14)',
    border: 'rgba(28, 74, 52, 0.32)',
  },
  Lost: {
    label: 'Lost',
    color: '#74766F',
    bg: 'rgba(116, 118, 111, 0.10)',
    border: 'rgba(116, 118, 111, 0.22)',
  },
};

