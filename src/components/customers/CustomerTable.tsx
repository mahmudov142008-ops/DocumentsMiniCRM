import React from 'react';
import { Customer } from '../../types/crm';
import { Badge } from '../ui/Badge';
import { Eye, Edit2, Trash2, Mail, Phone } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(15, 21, 35, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'rgba(10, 14, 24, 0.75)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-tertiary)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '14px 18px', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '14px 18px', fontWeight: 600 }}>Phone</th>
              <th style={{ padding: '14px 18px', fontWeight: 600 }}>Stage</th>
              <th style={{ padding: '14px 18px', fontWeight: 600 }}>Created</th>
              <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.035)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Customer & Company */}
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      onClick={() => onView(c)}
                      style={{
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'color 150ms',
                      }}
                      className="btn-ghost"
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {c.name}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{c.company}</span>
                  </div>
                </td>

                {/* Email */}
                <td style={{ padding: '14px 18px' }}>
                  <a
                    href={`mailto:${c.email}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      transition: 'color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <Mail size={13} color="var(--accent-blue)" />
                    {c.email}
                  </a>
                </td>

                {/* Phone */}
                <td style={{ padding: '14px 18px' }}>
                  <a
                    href={`tel:${c.phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      transition: 'color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#34D399')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <Phone size={13} color="#34D399" />
                    {c.phone}
                  </a>
                </td>

                {/* Status */}
                <td style={{ padding: '14px 18px' }}>
                  <Badge status={c.status} />
                </td>

                {/* Date */}
                <td style={{ padding: '14px 18px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  {formatDate(c.created_at)}
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <button
                      onClick={() => onView(c)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: '6px' }}
                      title="View Details & Notes"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Eye size={15} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: '6px' }}
                      title="Edit Customer"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Edit2 size={15} color="var(--accent-violet)" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: '6px' }}
                      title="Delete Customer"
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 size={15} color="var(--danger)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
