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
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Phone</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stage</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Created</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
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
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Customer & Company */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      onClick={() => onView(c)}
                      style={{
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      className="btn-ghost"
                    >
                      {c.name}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{c.company}</span>
                  </div>
                </td>

                {/* Email */}
                <td style={{ padding: '14px 16px' }}>
                  <a
                    href={`mailto:${c.email}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <Mail size={13} color="var(--primary)" />
                    {c.email}
                  </a>
                </td>

                {/* Phone */}
                <td style={{ padding: '14px 16px' }}>
                  <a
                    href={`tel:${c.phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <Phone size={13} color="var(--primary)" />
                    {c.phone}
                  </a>
                </td>

                {/* Status */}
                <td style={{ padding: '14px 16px' }}>
                  <Badge status={c.status} />
                </td>

                {/* Date */}
                <td style={{ padding: '14px 16px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  {formatDate(c.created_at)}
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <button
                      onClick={() => onView(c)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                      title="View Details & Notes"
                    >
                      <Eye size={15} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                      title="Edit Customer"
                    >
                      <Edit2 size={15} color="var(--text-secondary)" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="btn-ghost"
                      style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                      title="Delete Customer"
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
