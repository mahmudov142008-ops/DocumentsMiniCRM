import React, { useState, useEffect } from 'react';
import { Customer, CustomerNote } from '../../types/crm';
import { Badge } from '../ui/Badge';
import { notesService } from '../../services/notesService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

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
          maxWidth: '620px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="modal-title">{customer.name}</h2>
            <Badge status={customer.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
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
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={16} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Company</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{customer.company}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Email</span>
                <a href={`mailto:${customer.email}`} style={{ fontSize: '0.9375rem', wordBreak: 'break-all' }}>
                  {customer.email}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={16} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Phone</span>
                <a href={`tel:${customer.phone}`} style={{ fontSize: '0.9375rem' }}>
                  {customer.phone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>Added On</span>
                <span style={{ fontSize: '0.9375rem' }}>{formatDate(customer.created_at)}</span>
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
              <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="var(--primary)" />
                Activity & Notes
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {notes.length}
                </span>
              </h3>
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a timestamped note or meeting summary..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  disabled={submittingNote}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingNote || !newNoteContent.trim()}
                  style={{ padding: '0 16px' }}
                >
                  <Send size={14} />
                  {submittingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>

            {/* Notes Timeline List */}
            {loadingNotes ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ height: '50px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ height: '50px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-sm)' }} />
              </div>
            ) : notes.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
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
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xs)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={12} />
                        {formatDate(note.created_at)}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn-ghost"
                        style={{ padding: '2px 4px', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', whiteSpace: 'pre-wrap' }}>
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
