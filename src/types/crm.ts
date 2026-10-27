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

export const DEAL_STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string; border: string }> = {
  Lead: {
    label: 'Lead',
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.28)',
  },
  Contacted: {
    label: 'Contacted',
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.28)',
  },
  Qualified: {
    label: 'Qualified',
    color: '#38BDF8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.28)',
  },
  Proposal: {
    label: 'Proposal',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.28)',
  },
  Negotiation: {
    label: 'Negotiation',
    color: '#C084FC',
    bg: 'rgba(192, 132, 252, 0.14)',
    border: 'rgba(192, 132, 252, 0.32)',
  },
  Won: {
    label: 'Won',
    color: '#34D399',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.32)',
  },
  Lost: {
    label: 'Lost',
    color: '#94A3B8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.24)',
  },
};

