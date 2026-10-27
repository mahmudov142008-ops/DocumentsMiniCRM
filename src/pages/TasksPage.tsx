import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { customerService } from '../services/customerService';
import { dealService } from '../services/dealService';
import { Task, TaskInput, TaskPriority, TaskStatus, Customer, Deal } from '../types/crm';
import { validateTaskForm, ValidationErrors } from '../lib/validation';
import {
  Plus,
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  X,
  Users,
  KanbanSquare,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formInput, setFormInput] = useState<TaskInput>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '14:00',
    customer_id: '',
    deal_id: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTasks, allCustomers, allDeals] = await Promise.all([
        taskService.getAll(),
        customerService.getAll().catch(() => []),
        dealService.getAll().catch(() => []),
      ]);
      setTasks(allTasks);
      setCustomers(allCustomers);
      setDeals(allDeals);
    } catch (err: unknown) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormInput({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: new Date().toISOString().split('T')[0],
      due_time: '14:00',
      customer_id: '',
      deal_id: '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormInput({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date,
      due_time: task.due_time || '',
      customer_id: task.customer_id || '',
      deal_id: task.deal_id || '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateTaskForm(formInput);
    if (!isValid) {
      setFieldErrors(errors);
      setFormError(Object.values(errors).filter(Boolean).join('. '));
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      if (editingTask) {
        const updated = await taskService.update(editingTask.id, formInput);
        setTasks(prev => prev.map(t => (t.id === editingTask.id ? updated : t)));
      } else {
        if (!user) throw new Error('User not authenticated.');
        const created = await taskService.create(formInput, user.id);
        setTasks(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const updated = await taskService.toggleStatus(task.id, task.status);
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
    } catch (err: unknown) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (err: unknown) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const overdueCount = tasks.filter(t => taskService.isOverdue(t)).length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tasks & Reminders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Track client action items, follow-ups, and milestone deadlines
          </p>
        </div>

        <button
          id="btn-create-task"
          data-testid="btn-create-task"
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              color: '#38BDF8',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Pending Tasks</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Overdue Tasks</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: overdueCount > 0 ? '#EF4444' : 'var(--text-primary)' }}>
              {overdueCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
            }}
          >
            <CheckSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Completed Tasks</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <Filter size={15} /> Status:
          </div>
          {(['all', 'pending', 'in_progress', 'completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-secondary"
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                backgroundColor: statusFilter === st ? 'var(--primary-subtle)' : 'transparent',
                borderColor: statusFilter === st ? 'var(--primary-border)' : 'var(--border-light)',
                color: statusFilter === st ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: statusFilter === st ? 600 : 500,
              }}
            >
              {st === 'all' ? 'All' : st === 'in_progress' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-light)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Priority:
          </div>
          {(['all', 'high', 'medium', 'low'] as const).map(pr => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className="btn btn-secondary"
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                backgroundColor: priorityFilter === pr ? 'var(--primary-subtle)' : 'transparent',
                borderColor: priorityFilter === pr ? 'var(--primary-border)' : 'var(--border-light)',
                color: priorityFilter === pr ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: priorityFilter === pr ? 600 : 500,
              }}
            >
              {pr.charAt(0).toUpperCase() + pr.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ maxWidth: '240px', padding: '6px 12px', fontSize: '0.8125rem' }}
        />
      </div>

      {/* Task List */}
      {loading ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <CheckSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No tasks found</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {tasks.length === 0 ? 'Create your first task to stay on top of customer interactions.' : 'No tasks match current filters.'}
          </p>
          {tasks.length === 0 && (
            <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} /> Add First Task
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTasks.map(task => {
            const isDone = task.status === 'completed';
            const isOverdue = taskService.isOverdue(task);
            const linkedCustomer = customers.find(c => c.id === task.customer_id);
            const linkedDeal = deals.find(d => d.id === task.deal_id);

            return (
              <div
                key={task.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  gap: '16px',
                  opacity: isDone ? 0.65 : 1,
                  borderLeft: isOverdue ? '4px solid #EF4444' : isDone ? '4px solid #10B981' : '4px solid var(--border-medium)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="btn-ghost"
                    style={{ padding: '2px', color: isDone ? '#10B981' : 'var(--text-tertiary)', marginTop: '2px' }}
                    title={isDone ? 'Mark as pending' : 'Mark as complete'}
                  >
                    {isDone ? <CheckSquare size={20} color="#10B981" /> : <Square size={20} />}
                  </button>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      <span className={`badge badge-priority-${task.priority}`}>
                        {task.priority.toUpperCase()}
                      </span>

                      {/* Overdue Badge */}
                      {isOverdue && (
                        <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.28)' }}>
                          <AlertTriangle size={12} /> OVERDUE
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} /> Due: {task.due_date} {task.due_time ? `at ${task.due_time}` : ''}
                      </span>

                      {linkedCustomer && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)' }}>
                          <Users size={13} /> {linkedCustomer.name} ({linkedCustomer.company})
                        </span>
                      )}

                      {linkedDeal && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold)' }}>
                          <KanbanSquare size={13} /> Deal: {linkedDeal.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-secondary)' }}
                    title="Edit task"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--danger)' }}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '14px' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Send follow-up proposal"
                    value={formInput.title}
                    onChange={e => {
                      setFormInput({ ...formInput, title: e.target.value });
                      if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined });
                    }}
                    className={`form-input ${fieldErrors.title ? 'has-error' : ''}`}
                  />
                  {fieldErrors.title && <span className="form-error">{fieldErrors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Actionable notes or details..."
                    value={formInput.description || ''}
                    onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      value={formInput.priority}
                      onChange={e => setFormInput({ ...formInput, priority: e.target.value as TaskPriority })}
                      className="form-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formInput.status}
                      onChange={e => setFormInput({ ...formInput, status: e.target.value as TaskStatus })}
                      className="form-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={formInput.due_date}
                      onChange={e => {
                        setFormInput({ ...formInput, due_date: e.target.value });
                        if (fieldErrors.due_date) setFieldErrors({ ...fieldErrors, due_date: undefined });
                      }}
                      className={`form-input ${fieldErrors.due_date ? 'has-error' : ''}`}
                    />
                    {fieldErrors.due_date && <span className="form-error">{fieldErrors.due_date}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Time (Optional)</label>
                    <input
                      type="time"
                      value={formInput.due_time || ''}
                      onChange={e => setFormInput({ ...formInput, due_time: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Related Customer</label>
                    <select
                      value={formInput.customer_id || ''}
                      onChange={e => setFormInput({ ...formInput, customer_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">None</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Related Deal</label>
                    <select
                      value={formInput.deal_id || ''}
                      onChange={e => setFormInput({ ...formInput, deal_id: e.target.value })}
                      className="form-select"
                    >
                      <option value="">None</option>
                      {deals.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.title} (${Number(d.value).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
