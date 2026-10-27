import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dealService } from '../services/dealService';
import { customerService } from '../services/customerService';
import { salesGoalService } from '../services/salesGoalService';
import { Deal, Customer, SalesGoal, SalesGoalInput, DealStage } from '../types/crm';
import { validateRequired, validateDateRange } from '../lib/validation';
import {
  BarChart3,
  TrendingUp,
  Download,
  Target,
  Trophy,
  Plus,
  Trash2,
  X,
  PieChart,
  Calendar,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [goals, setGoals] = useState<SalesGoal[]>([]);
  const [, setLoading] = useState(true);

  // Date Range Filter
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState<SalesGoalInput>({
    name: '',
    target_amount: 50000,
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });
  const [goalSubmitting, setGoalSubmitting] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [goalFieldErrors, setGoalFieldErrors] = useState<Record<string, string | undefined>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [allDeals, allCustomers, allGoals] = await Promise.all([
        dealService.getAll(),
        customerService.getAll().catch(() => []),
        salesGoalService.getAll().catch(() => []),
      ]);
      setDeals(allDeals);
      setCustomers(allCustomers);
      setGoals(allGoals);
    } catch (err: unknown) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter deals and customers by date range
  const filterByDate = <T extends { created_at: string }>(items: T[]): T[] => {
    if (dateRange === 'all') return items;
    const now = new Date();
    let threshold: Date;

    if (dateRange === 'month') {
      threshold = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === 'quarter') {
      const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
      threshold = new Date(now.getFullYear(), currentQuarterMonth, 1);
    } else {
      threshold = new Date(now.getFullYear(), 0, 1);
    }

    return items.filter(item => new Date(item.created_at) >= threshold);
  };

  const filteredDeals = filterByDate(deals);
  const filteredCustomers = filterByDate(customers);

  // Calculations
  const wonDeals = filteredDeals.filter(d => d.stage === 'Won');
  const lostDeals = filteredDeals.filter(d => d.stage === 'Lost');
  const wonRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const totalPipelineValue = filteredDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const closedCount = wonDeals.length + lostDeals.length;
  const conversionRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

  // Pipeline by stage
  const stages: DealStage[] = ['Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const pipelineByStage = stages.map(stage => {
    const stageDeals = filteredDeals.filter(d => d.stage === stage);
    const value = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    return {
      stage,
      count: stageDeals.length,
      value,
    };
  });

  // Handle Sales Goal Create
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const nameErr = validateRequired(goalInput.name, 'Goal name');
    if (nameErr) errors.name = nameErr;

    if (isNaN(goalInput.target_amount) || goalInput.target_amount <= 0) {
      errors.target_amount = 'Target amount must be greater than zero.';
    }

    const rangeErr = validateDateRange(goalInput.start_date, goalInput.end_date, 'End date must be after start date.');
    if (rangeErr) errors.date_range = rangeErr;

    if (Object.keys(errors).length > 0) {
      setGoalFieldErrors(errors);
      setGoalError(Object.values(errors)[0]);
      return;
    }

    setGoalSubmitting(true);
    setGoalError('');
    setGoalFieldErrors({});

    try {
      if (!user) throw new Error('User not authenticated.');
      const created = await salesGoalService.create(goalInput, user.id);
      setGoals(prev => [created, ...prev]);
      setIsGoalModalOpen(false);
    } catch (err: unknown) {
      setGoalError(err instanceof Error ? err.message : 'Failed to save goal.');
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Delete this sales target?')) {
      try {
        await salesGoalService.delete(id);
        setGoals(prev => prev.filter(g => g.id !== id));
      } catch (err: unknown) {
        console.error('Failed to delete goal:', err);
      }
    }
  };

  // CSV Export with RFC 4180 Quote Escaping
  const exportCSV = (dataType: 'deals' | 'customers') => {
    let csvContent = '';
    const sanitize = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    if (dataType === 'deals') {
      const headers = ['ID', 'Title', 'Value', 'Stage', 'Expected Close Date', 'Lost Reason', 'Created At'];
      const rows = filteredDeals.map(d => [
        sanitize(d.id),
        sanitize(d.title),
        sanitize(d.value),
        sanitize(d.stage),
        sanitize(d.expected_close_date || ''),
        sanitize(d.lost_reason || ''),
        sanitize(d.created_at),
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    } else {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Status', 'Created At'];
      const rows = filteredCustomers.map(c => [
        sanitize(c.id),
        sanitize(c.name),
        sanitize(c.email),
        sanitize(c.phone),
        sanitize(c.company),
        sanitize(c.status),
        sanitize(c.created_at),
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `minicrm_${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Real-time pipeline performance, win conversion rates, and revenue targets
          </p>
        </div>

        {/* CSV Export Dropdown & Target Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => exportCSV('deals')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
          >
            <Download size={15} /> Export Deals CSV
          </button>

          <button
            onClick={() => exportCSV('customers')}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
          >
            <Download size={15} /> Export Customers CSV
          </button>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}
          >
            <Plus size={15} /> Set Target
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={15} /> Reporting Period:
        </span>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'month', 'quarter', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '5px 12px',
                backgroundColor: dateRange === range ? 'var(--primary-subtle)' : 'transparent',
                borderColor: dateRange === range ? 'var(--primary-border)' : 'var(--border-light)',
                color: dateRange === range ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: dateRange === range ? 600 : 500,
              }}
            >
              {range === 'all'
                ? 'All Time'
                : range === 'month'
                ? 'This Month'
                : range === 'quarter'
                ? 'This Quarter'
                : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Closed Won Revenue</span>
            <Trophy size={18} color="var(--accent-gold)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '8px' }}>
            ${wonRevenue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
            {wonDeals.length} won deals
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Total Pipeline Value</span>
            <BarChart3 size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
            ${totalPipelineValue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
            Across {filteredDeals.length} deals
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Win Conversion Rate</span>
            <TrendingUp size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', marginTop: '8px' }}>
            {conversionRate}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
            {wonDeals.length} won / {closedCount} closed deals
          </span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Customer Growth</span>
            <PieChart size={18} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
            {filteredCustomers.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
            Active clients in period
          </span>
        </div>
      </div>

      {/* Pipeline Stage Breakdown Table & Bars */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Pipeline Stage Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pipelineByStage.map(item => {
            const percentOfTotal = totalPipelineValue > 0 ? (item.value / totalPipelineValue) * 100 : 0;

            return (
              <div key={item.stage} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge badge-${item.stage.toLowerCase()}`}>{item.stage}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{item.count} deals</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${item.value.toLocaleString()} ({Math.round(percentOfTotal)}%)
                  </div>
                </div>

                {/* Progress bar container */}
                <div
                  style={{
                    height: '8px',
                    width: '100%',
                    backgroundColor: 'var(--bg-hover)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentOfTotal}%`,
                      backgroundColor: item.stage === 'Won' ? 'var(--status-won-text)' : 'var(--primary)',
                      borderRadius: '4px',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Goals Progress Tracking */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Sales Goals & Quotas
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Progress is computed automatically from closed Won deals within each target's timeframe
            </p>
          </div>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Target size={15} /> Add Target
          </button>
        </div>

        {goals.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Target size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No active sales goals set.</p>
            <span style={{ fontSize: '0.75rem' }}>Set a revenue milestone to track your team's velocity.</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {goals.map(goal => {
              const progress = salesGoalService.calculateProgress(goal, deals);
              const isFinished = progress.percentage >= 100;

              return (
                <div
                  key={goal.id}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {goal.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {goal.start_date} to {goal.end_date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="btn-ghost"
                      style={{ padding: '4px', color: 'var(--danger)' }}
                      title="Delete goal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: isFinished ? '#10B981' : 'var(--accent-gold)' }}>
                        ${progress.current.toLocaleString()} / ${Number(goal.target_amount).toLocaleString()}
                      </span>
                      <span style={{ fontWeight: 700, color: isFinished ? '#10B981' : 'var(--text-primary)' }}>
                        {progress.percentage}%
                      </span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        width: '100%',
                        backgroundColor: 'var(--bg-hover)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progress.percentage}%`,
                          background: isFinished ? 'var(--primary-gradient)' : 'var(--accent-gold-gradient)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Remaining: ${progress.remaining.toLocaleString()}</span>
                    {isFinished && <span style={{ color: '#10B981', fontWeight: 600 }}>Target Reached!</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Target Modal */}
      {isGoalModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsGoalModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Define Sales Target</h2>
              <button onClick={() => setIsGoalModalOpen(false)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal}>
              <div className="modal-body">
                {goalError && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '14px' }}>
                    {goalError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Goal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Q4 Revenue Sprint"
                    value={goalInput.name}
                    onChange={e => {
                      setGoalInput({ ...goalInput, name: e.target.value });
                      if (goalFieldErrors.name) setGoalFieldErrors({ ...goalFieldErrors, name: undefined });
                    }}
                    className={`form-input ${goalFieldErrors.name ? 'has-error' : ''}`}
                  />
                  {goalFieldErrors.name && <span className="form-error">{goalFieldErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Target Revenue ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={goalInput.target_amount}
                    onChange={e => {
                      setGoalInput({ ...goalInput, target_amount: Number(e.target.value) });
                      if (goalFieldErrors.target_amount) setGoalFieldErrors({ ...goalFieldErrors, target_amount: undefined });
                    }}
                    className={`form-input ${goalFieldErrors.target_amount ? 'has-error' : ''}`}
                  />
                  {goalFieldErrors.target_amount && <span className="form-error">{goalFieldErrors.target_amount}</span>}
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={goalInput.start_date}
                        onChange={e => {
                          setGoalInput({ ...goalInput, start_date: e.target.value });
                          if (goalFieldErrors.date_range) setGoalFieldErrors({ ...goalFieldErrors, date_range: undefined });
                        }}
                        className={`form-input ${goalFieldErrors.date_range ? 'has-error' : ''}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        required
                        value={goalInput.end_date}
                        onChange={e => {
                          setGoalInput({ ...goalInput, end_date: e.target.value });
                          if (goalFieldErrors.date_range) setGoalFieldErrors({ ...goalFieldErrors, date_range: undefined });
                        }}
                        className={`form-input ${goalFieldErrors.date_range ? 'has-error' : ''}`}
                      />
                    </div>
                  </div>
                  {goalFieldErrors.date_range && <span className="form-error" style={{ display: 'block', marginTop: '4px' }}>{goalFieldErrors.date_range}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={goalSubmitting} className="btn btn-primary">
                  {goalSubmitting ? 'Saving...' : 'Set Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
