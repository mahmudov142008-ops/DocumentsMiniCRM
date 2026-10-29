import React, { useState, useEffect } from 'react';
import { Customer, CustomerInput, CustomerStatus, Deal, Task, Meeting, SalesGoal } from '../types/crm';
import { dealService } from '../services/dealService';
import { taskService } from '../services/taskService';
import { meetingService } from '../services/meetingService';
import { salesGoalService } from '../services/salesGoalService';
import { CustomerDetailDrawer } from '../components/customers/CustomerDetailDrawer';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { AppPage } from '../components/layout/AppLayout';
import {
  Users,
  Trophy,
  KanbanSquare,
  CheckSquare,
  Calendar,
  TrendingUp,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  Target,
  Search,
  X,
  Filter,
} from 'lucide-react';

interface DashboardPageProps {
  customers: Customer[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateCustomer: (input: CustomerInput) => Promise<void>;
  onUpdateCustomer: (id: string, input: Partial<CustomerInput>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onNavigate: (page: AppPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  customers,
  loading: customersLoading,
  onRefresh,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onNavigate,
}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [goals, setGoals] = useState<SalesGoal[]>([]);
  const [extraLoading, setExtraLoading] = useState(true);

  // Date Filter
  const [period, setPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Dashboard Activity Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL');

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadExtraData = async () => {
    setExtraLoading(true);
    try {
      const [allDeals, allTasks, allMeetings, allGoals] = await Promise.all([
        dealService.getAll().catch(() => []),
        taskService.getAll().catch(() => []),
        meetingService.getAll().catch(() => []),
        salesGoalService.getAll().catch(() => []),
      ]);
      setDeals(allDeals);
      setTasks(allTasks);
      setMeetings(allMeetings);
      setGoals(allGoals);
    } finally {
      setExtraLoading(false);
    }
  };

  useEffect(() => {
    loadExtraData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([onRefresh(), loadExtraData()]);
    setIsRefreshing(false);
  };

  // Date filter helper
  const filterByPeriod = <T extends { created_at: string }>(items: T[]): T[] => {
    if (period === 'all') return items;
    const now = new Date();
    let threshold: Date;

    if (period === 'month') {
      threshold = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      threshold = new Date(now.getFullYear(), qMonth, 1);
    } else {
      threshold = new Date(now.getFullYear(), 0, 1);
    }

    return items.filter(item => new Date(item.created_at) >= threshold);
  };

  const filteredCustomers = filterByPeriod(customers);
  const filteredDeals = filterByPeriod(deals);

  // Filtered displayed customers for dashboard activity
  const displayedCustomers = filteredCustomers.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesCompany = c.company.toLowerCase().includes(q);
      const matchesEmail = c.email.toLowerCase().includes(q);
      const matchesPhone = c.phone?.toLowerCase().includes(q);
      if (!matchesName && !matchesCompany && !matchesEmail && !matchesPhone) {
        return false;
      }
    }
    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  // Real Calculated Metrics
  const totalCustomers = filteredCustomers.length;
  const newCustomers = filteredCustomers.filter(c => c.status === 'New').length;
  const activeCustomers = filteredCustomers.filter(c => c.status === 'Contacted' || c.status === 'Negotiation').length;

  const totalDealValue = filteredDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const wonDeals = filteredDeals.filter(d => d.stage === 'Won');
  const lostDeals = filteredDeals.filter(d => d.stage === 'Lost');
  const wonDealValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const closedCount = wonDeals.length + lostDeals.length;
  const dealConversionRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = tasks.filter(t => taskService.isOverdue(t));
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');

  // Primary Goal progress
  const activeGoal = goals[0];
  const goalProgress = activeGoal ? salesGoalService.calculateProgress(activeGoal, deals) : null;

  const loading = customersLoading || extraLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Executive Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time pipeline analytics, revenue metrics, and scheduled activities
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Period Selector */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-card-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            {(['all', 'month', 'quarter', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: period === p ? 600 : 500,
                  backgroundColor: period === p ? 'var(--primary)' : 'transparent',
                  color: period === p ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 150ms',
                }}
              >
                {p === 'all' ? 'All Time' : p === 'month' ? 'Month' : p === 'quarter' ? 'Quarter' : 'Year'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={loading || isRefreshing}
            title="Refresh database records"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            id="btn-dashboard-new-customer"
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> New Customer
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ height: '110px' }}>
              <Skeleton width="60%" height="16px" style={{ marginBottom: '12px' }} />
              <Skeleton width="40%" height="28px" />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Won Revenue */}
          <div className="card" onClick={() => onNavigate('pipeline')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Closed Revenue</span>
              <Trophy size={18} color="var(--accent-brass)" />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--accent-brass)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              ${wonDealValue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              {wonDeals.length} won deals
            </span>
          </div>

          {/* Total Pipeline */}
          <div className="card" onClick={() => onNavigate('pipeline')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pipeline Value</span>
              <KanbanSquare size={18} color="var(--primary)" />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              ${totalDealValue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              Across {filteredDeals.length} total deals
            </span>
          </div>

          {/* Win Rate */}
          <div className="card" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Deal Conversion</span>
              <TrendingUp size={18} color="var(--accent-olive)" />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--accent-olive)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {dealConversionRate}%
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              {closedCount} deals closed (won/lost)
            </span>
          </div>

          {/* Customers */}
          <div className="card" onClick={() => onNavigate('customers')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Customers</span>
              <Users size={18} color="var(--primary)" />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {totalCustomers}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              {activeCustomers} active / {newCustomers} new leads
            </span>
          </div>

          {/* Tasks */}
          <div className="card" onClick={() => onNavigate('tasks')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Tasks</span>
              <CheckSquare size={18} color={overdueTasks.length > 0 ? '#DC2626' : 'var(--accent-brass)'} />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {pendingTasks.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: overdueTasks.length > 0 ? '#DC2626' : 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              {overdueTasks.length > 0 ? `${overdueTasks.length} overdue tasks!` : 'All tasks on schedule'}
            </span>
          </div>

          {/* Meetings */}
          <div className="card" onClick={() => onNavigate('calendar')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Scheduled Meetings</span>
              <Calendar size={18} color="var(--accent-olive)" />
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px', letterSpacing: '-0.02em' }}>
              {upcomingMeetings.length}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
              Upcoming customer sessions
            </span>
          </div>
        </div>
      )}

      {/* Target Progress Bar (if goal exists) */}
      {activeGoal && goalProgress && (
        <div
          className="card"
          onClick={() => onNavigate('reports')}
          style={{
            cursor: 'pointer',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'var(--bg-card-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={16} color="var(--accent-brass)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Target Sprint: {activeGoal.name}
              </span>
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-brass)' }}>
              ${goalProgress.current.toLocaleString()} / ${Number(activeGoal.target_amount).toLocaleString()} ({goalProgress.percentage}%)
            </span>
          </div>

          <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${goalProgress.percentage}%`,
                background: 'var(--accent-brass)',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      )}

      {/* Middle Grid: Pipeline Overview & Actionable Reminders */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Deal Pipeline Summary Card */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Pipeline Stages
            </h3>
            <button onClick={() => onNavigate('pipeline')} className="btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Pipeline <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(['Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const).map(st => {
              const stageDeals = filteredDeals.filter(d => d.stage === st);
              const val = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
              const pct = totalDealValue > 0 ? (val / totalDealValue) * 100 : 0;

              return (
                <div key={st}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{st} ({stageDeals.length})</span>
                    <span style={{ color: 'var(--text-secondary)' }}>${val.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: st === 'Won' ? 'var(--primary)' : 'var(--accent-olive)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Tasks & Reminders Card */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Upcoming Milestones
            </h3>
            <button onClick={() => onNavigate('tasks')} className="btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Tasks <ArrowRight size={13} />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <CheckSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '0.8125rem' }}>No pending tasks.</p>
              <span style={{ fontSize: '0.6875rem' }}>You're all caught up on customer deliverables!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingTasks.slice(0, 5).map(task => {
                const isOverdue = taskService.isOverdue(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => onNavigate('tasks')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-card-subtle)',
                      border: isOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {task.title}
                        </span>
                        <span className={`badge badge-priority-${task.priority}`} style={{ fontSize: '0.625rem', padding: '1px 5px' }}>
                          {task.priority}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: isOverdue ? '#EF4444' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <Clock size={12} /> Due: {task.due_date} {isOverdue && '(Overdue)'}
                      </span>
                    </div>

                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Customers List */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Customer Activity
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Recently added contacts and accounts
            </span>
          </div>

          <button onClick={() => onNavigate('customers')} className="btn-ghost" style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            All Customers <ArrowRight size={13} />
          </button>
        </div>

        {/* Dashboard Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <input
              type="text"
              id="dashboard-search-input"
              data-testid="dashboard-search-input"
              className="form-input"
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: searchQuery ? '32px' : '12px',
                fontSize: '0.8125rem',
                height: '36px',
              }}
              placeholder="Search recent activity by name, company, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                data-testid="dashboard-clear-search-btn"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '2px',
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '2px' }}>
              <Filter size={13} /> Status:
            </span>
            {(['ALL', 'New', 'Contacted', 'Negotiation', 'Lost'] as const).map(st => (
              <button
                key={st}
                type="button"
                data-testid={`dashboard-filter-${st.toLowerCase()}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: statusFilter === st ? 600 : 500,
                  backgroundColor: statusFilter === st ? 'var(--primary-subtle)' : 'transparent',
                  color: statusFilter === st ? 'var(--primary)' : 'var(--text-secondary)',
                  border: `1px solid ${statusFilter === st ? 'var(--primary-border)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}

            {(searchQuery.trim() !== '' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                data-testid="dashboard-reset-filters-btn"
                className="btn-ghost"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--danger)',
                  padding: '4px 8px',
                  marginLeft: '4px',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No customers registered yet.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary" style={{ marginTop: '12px' }}>
              <Plus size={15} /> Add First Customer
            </button>
          </div>
        ) : displayedCustomers.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Search size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              No recent customer activity matches your search and filter criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ marginTop: '12px', fontSize: '0.8125rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '10px 12px' }}>NAME</th>
                  <th style={{ padding: '10px 12px' }}>COMPANY</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px' }}>EMAIL</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {displayedCustomers.slice(0, 6).map(cust => (
                  <tr
                    key={cust.id}
                    style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                    onClick={() => setSelectedCustomer(cust)}
                  >
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cust.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{cust.company}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${cust.status.toLowerCase()}`}>{cust.status}</span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-tertiary)' }}>{cust.email}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>View Details</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Modals */}
      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onCreateCustomer}
      />

      <CustomerFormModal
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        initialData={editingCustomer}
        onSubmit={async input => {
          if (editingCustomer) {
            await onUpdateCustomer(editingCustomer.id, input);
            setEditingCustomer(null);
          }
        }}
      />

      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        onEdit={cust => {
          setSelectedCustomer(null);
          setEditingCustomer(cust);
        }}
        onDelete={cust => {
          setSelectedCustomer(null);
          setDeletingCustomer(cust);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={async () => {
          if (deletingCustomer) {
            await onDeleteCustomer(deletingCustomer.id);
            setDeletingCustomer(null);
          }
        }}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deletingCustomer?.name}?`}
      />
    </div>
  );
};
