import React from 'react';
import { Customer } from '../../types/crm';
import { Badge } from '../ui/Badge';
import { Eye, Edit2, Trash2, Mail, Phone, Building } from 'lucide-react';

interface CustomerCardListProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerCardList: React.FC<CustomerCardListProps> = ({
  customers,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {customers.map((c) => (
        <div
          key={c.id}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <h4
                onClick={() => onView(c)}
                style={{ fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                {c.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                <Building size={13} />
                <span>{c.company}</span>
              </div>
            </div>
            <Badge status={c.status} size="sm" />
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
            <a
              href={`mailto:${c.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}
            >
              <Mail size={14} color="var(--primary)" />
              {c.email}
            </a>
            <a
              href={`tel:${c.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}
            >
              <Phone size={14} color="var(--primary)" />
              {c.phone}
            </a>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => onView(c)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
            >
              <Eye size={14} />
              View & Notes
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => onEdit(c)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                title="Edit Customer"
              >
                <Edit2 size={16} color="var(--text-secondary)" />
              </button>
              <button
                onClick={() => onDelete(c)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                title="Delete Customer"
              >
                <Trash2 size={16} color="var(--danger)" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
