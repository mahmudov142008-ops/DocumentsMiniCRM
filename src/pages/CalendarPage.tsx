import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { meetingService } from '../services/meetingService';
import { customerService } from '../services/customerService';
import { Meeting, MeetingInput, MeetingType, MeetingStatus, Customer } from '../types/crm';
import { validateMeetingForm, ValidationErrors } from '../lib/validation';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Edit2,
  CheckCircle,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar View State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formInput, setFormInput] = useState<MeetingInput>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:00',
    meeting_type: 'Discovery',
    status: 'scheduled',
    customer_id: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allMeetings, allCustomers] = await Promise.all([
        meetingService.getAll(),
        customerService.getAll().catch(() => []),
      ]);
      setMeetings(allMeetings);
      setCustomers(allCustomers);
    } catch (err: unknown) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = (presetDate?: string) => {
    setEditingMeeting(null);
    setFormInput({
      title: '',
      description: '',
      date: presetDate || new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '11:00',
      meeting_type: 'Discovery',
      status: 'scheduled',
      customer_id: '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormInput({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      meeting_type: meeting.meeting_type,
      status: meeting.status,
      customer_id: meeting.customer_id || '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMeetingForm(formInput);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError(Object.values(validation.errors)[0] || 'Please fix the errors below.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      if (editingMeeting) {
        const updated = await meetingService.update(editingMeeting.id, formInput);
        setMeetings(prev => prev.map(m => (m.id === editingMeeting.id ? updated : m)));
      } else {
        if (!user) throw new Error('User not authenticated.');
        const created = await meetingService.create(formInput, user.id);
        setMeetings(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await meetingService.delete(id);
        setMeetings(prev => prev.filter(m => m.id !== id));
      } catch (err: unknown) {
        console.error('Failed to delete meeting:', err);
      }
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Month grid helper
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Calendar & Meetings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Schedule and coordinate customer discovery calls, demos, and closing reviews
          </p>
        </div>

        <button
          id="btn-create-meeting"
          data-testid="btn-create-meeting"
          onClick={() => handleOpenCreateModal()}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Schedule Meeting
        </button>
      </div>

      {/* Month Navigation & View Modes */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '14px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Previous Month">
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '160px', textAlign: 'center' }}>
            {monthName}
          </span>
          <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '6px 10px' }} title="Next Month">
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            Today
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['month', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8125rem',
                padding: '6px 14px',
                backgroundColor: viewMode === mode ? 'var(--primary-subtle)' : 'transparent',
                borderColor: viewMode === mode ? 'var(--primary-border)' : 'var(--border-light)',
                color: viewMode === mode ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: viewMode === mode ? 600 : 500,
              }}
            >
              {mode === 'month' ? 'Calendar Grid' : 'Meeting List'}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode: Month Grid */}
      {viewMode === 'month' && (
        <div className="card" style={{ padding: '16px' }}>
          {/* Day of Week Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  padding: '4px',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      minHeight: '100px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: '1px dashed var(--border-light)',
                      opacity: 0.25,
                    }}
                  />
                );
              }

              const formattedMonth = String(month + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dayDateStr = `${year}-${formattedMonth}-${formattedDay}`;
              const isToday = dayDateStr === todayStr;
              const dayMeetings = meetings.filter(m => m.date === dayDateStr);

              return (
                <div
                  key={dayDateStr}
                  onClick={() => handleOpenCreateModal(dayDateStr)}
                  style={{
                    minHeight: '110px',
                    borderRadius: '8px',
                    padding: '8px',
                    backgroundColor: isToday ? 'var(--primary-subtle)' : 'var(--bg-card-subtle)',
                    border: isToday ? '1px solid var(--primary-border)' : '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.borderColor = isToday ? 'var(--primary-border)' : 'var(--border-light)')
                  }
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: isToday ? 700 : 500,
                        color: isToday ? 'var(--primary)' : 'var(--text-primary)',
                      }}
                    >
                      {day}
                    </span>
                    {dayMeetings.length > 0 && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        {dayMeetings.length}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                    {dayMeetings.map(m => (
                      <div
                        key={m.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenEditModal(m);
                        }}
                        style={{
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          backgroundColor: m.status === 'completed' ? 'rgba(36, 57, 47, 0.10)' : 'var(--bg-hover)',
                          color: m.status === 'completed' ? 'var(--primary)' : 'var(--text-primary)',
                          borderLeft: '2px solid var(--primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={`${m.title} (${m.start_time} - ${m.end_time})`}
                      >
                        {m.start_time} {m.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode: List */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading meetings...
            </div>
          ) : meetings.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <CalendarIcon size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No meetings scheduled</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Coordinate upcoming discussions, product demos, and client milestones.
              </p>
              <button onClick={() => handleOpenCreateModal()} className="btn btn-primary" style={{ marginTop: '16px' }}>
                <Plus size={16} /> Schedule First Meeting
              </button>
            </div>
          ) : (
            meetings.map(m => {
              const linkedCustomer = customers.find(c => c.id === m.customer_id);
              const isPast = m.date < todayStr;

              return (
                <div
                  key={m.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    gap: '16px',
                    borderLeft: m.status === 'completed' ? '4px solid var(--accent-olive)' : '4px solid var(--primary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CalendarIcon size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.title}
                        </span>
                        <span className="badge badge-emerald">{m.meeting_type}</span>
                        {m.status === 'completed' && (
                          <span className="badge" style={{ backgroundColor: 'rgba(36, 57, 47, 0.10)', color: 'var(--primary)' }}>
                            <CheckCircle size={12} /> COMPLETED
                          </span>
                        )}
                        {isPast && m.status === 'scheduled' && (
                          <span className="badge badge-lost">PAST</span>
                        )}
                      </div>

                      {m.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {m.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} /> {m.date} • {m.start_time} - {m.end_time}
                        </span>

                        {linkedCustomer && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)' }}>
                            <Users size={13} /> {linkedCustomer.name} ({linkedCustomer.company})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditModal(m)}
                      className="btn-ghost"
                      style={{ padding: '6px', color: 'var(--text-secondary)' }}
                      title="Edit meeting"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="btn-ghost"
                      style={{ padding: '6px', color: 'var(--danger)' }}
                      title="Delete meeting"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Meeting Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
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
                  <label className="form-label">Meeting Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Demo with Acme Corp Leadership"
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
                  <label className="form-label">Description / Agenda</label>
                  <textarea
                    rows={2}
                    placeholder="Agenda points or video call link..."
                    value={formInput.description || ''}
                    onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Meeting Type</label>
                    <select
                      value={formInput.meeting_type}
                      onChange={e => setFormInput({ ...formInput, meeting_type: e.target.value as MeetingType })}
                      className="form-select"
                    >
                      <option value="Discovery">Discovery</option>
                      <option value="Demo">Demo</option>
                      <option value="Proposal Review">Proposal Review</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Check-in">Check-in</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formInput.status}
                      onChange={e => setFormInput({ ...formInput, status: e.target.value as MeetingStatus })}
                      className="form-select"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={formInput.date}
                    onChange={e => {
                      setFormInput({ ...formInput, date: e.target.value });
                      if (fieldErrors.date) setFieldErrors({ ...fieldErrors, date: undefined });
                    }}
                    className={`form-input ${fieldErrors.date ? 'has-error' : ''}`}
                  />
                  {fieldErrors.date && <span className="form-error">{fieldErrors.date}</span>}
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={formInput.start_time}
                        onChange={e => {
                          setFormInput({ ...formInput, start_time: e.target.value });
                          if (fieldErrors.time_range) setFieldErrors({ ...fieldErrors, time_range: undefined });
                        }}
                        className={`form-input ${fieldErrors.time_range ? 'has-error' : ''}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Time *</label>
                      <input
                        type="time"
                        required
                        value={formInput.end_time}
                        onChange={e => {
                          setFormInput({ ...formInput, end_time: e.target.value });
                          if (fieldErrors.time_range) setFieldErrors({ ...fieldErrors, time_range: undefined });
                        }}
                        className={`form-input ${fieldErrors.time_range ? 'has-error' : ''}`}
                      />
                    </div>
                  </div>
                  {fieldErrors.time_range && <span className="form-error" style={{ display: 'block', marginTop: '4px' }}>{fieldErrors.time_range}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Customer</label>
                  <select
                    value={formInput.customer_id || ''}
                    onChange={e => setFormInput({ ...formInput, customer_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">None (General internal / client)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Scheduling...' : editingMeeting ? 'Save Changes' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
