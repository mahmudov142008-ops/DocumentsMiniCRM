import React, { useState, useEffect } from 'react';
import { Customer, CustomerNote } from '../../types/crm';
import { Badge } from '../ui/Badge';
import { notesService } from '../../services/notesService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usePreferences } from '../../context/PreferencesContext';
import { Mail, Phone, Building, Calendar, Edit3, Trash2, Send, Clock, X, MessageSquare } from 'lucide-react';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatDate } = usePreferences();
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      loadNotes(customer.id);
    } else {
      setNotes([]);
      setNewNoteContent('');
    }
  }, [customer, isOpen]);

  const loadNotes = async (customerId: string) => {
    try {
      setLoadingNotes(true);
      const data = await notesService.getByCustomerId(customerId);
      setNotes(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customer notes.';
      toast.error(msg);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !user) return;
    if (!newNoteContent.trim()) {
      toast.error('Note content cannot be empty.');
      return;
    }

    try {
      setSubmittingNote(true);
      const created = await notesService.create(customer.id, newNoteContent, user.id);
      setNotes((prev) => [...prev, created]);
      setNewNoteContent('');
      toast.success('Note added successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add note.';
      toast.error(msg);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesService.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success('Note removed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete note.';
      toast.error(msg);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-container"
        style={{
          maxWidth: '640px',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="modal-title" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{customer.name}</h2>
            <Badge status={customer.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onEdit(customer)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              title="Edit customer"
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={() => onDelete(customer)}
              className="btn btn-danger"
              style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              title="Delete customer"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: '8px', color: 'var(--text-tertiary)' }}
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Contact Details Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              backgroundColor: 'rgba(20, 27, 45, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={18} color="var(--accent-blue)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Company</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{customer.company}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="var(--accent-violet)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Email</span>
                <a href={`mailto:${customer.email}`} style={{ fontSize: '0.9375rem', wordBreak: 'break-all', color: 'var(--accent-blue)' }}>
                  {customer.email}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={18} color="#34D399" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Phone</span>
                <a href={`tel:${customer.phone}`} style={{ fontSize: '0.9375rem', color: '#34D399' }}>
                  {customer.phone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="#FBBF24" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Added On</span>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{formatDate(customer.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
                <MessageSquare size={18} color="var(--accent-blue)" />
                Activity & Interaction Notes
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.14)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    color: 'var(--accent-blue)',
                    border: '1px solid var(--primary-border)',
                  }}
                >
                  {notes.length}
                </span>
              </h3>
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a timestamped note, call summary, or next step..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  disabled={submittingNote}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingNote || !newNoteContent.trim()}
                  style={{ padding: '0 18px', borderRadius: '10px' }}
                >
                  <Send size={15} />
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Notes Timeline List */}
            {loadingNotes ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ height: '60px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }} />
                <div style={{ height: '60px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }} />
              </div>
            ) : notes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: '12px',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.875rem',
                }}
              >
                No notes recorded yet. Add your first note above to track interactions with {customer.name}.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '16px 18px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-xs)',
                      position: 'relative',
                      transition: 'border-color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-border)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Clock size={13} color="var(--primary)" />
                        {formatDate(note.created_at, { includeTime: true })}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn-ghost"
                        style={{ padding: '3px 6px', fontSize: '0.75rem', color: 'var(--danger)', borderRadius: '4px' }}
                        title="Delete note"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-subtle)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
