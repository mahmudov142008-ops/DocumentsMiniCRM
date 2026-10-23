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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {customers.map((c) => (
        <div
          key={c.id}
          className="card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '18px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <h4
                onClick={() => onView(c)}
                style={{ fontSize: '1rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)', transition: 'color 150ms' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              >
                {c.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginTop: '2px' }}>
                <Building size={13} />
                <span>{c.company}</span>
              </div>
            </div>
            <Badge status={c.status} size="sm" />
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
            <a
              href={`mailto:${c.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}
            >
              <Mail size={14} color="var(--accent-blue)" />
              {c.email}
            </a>
            <a
              href={`tel:${c.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}
            >
              <Phone size={14} color="#34D399" />
              {c.phone}
            </a>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => onView(c)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8125rem', borderRadius: '8px' }}
            >
              <Eye size={14} />
              View & Notes
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => onEdit(c)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: '6px' }}
                title="Edit Customer"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Edit2 size={16} color="var(--accent-violet)" />
              </button>
              <button
                onClick={() => onDelete(c)}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: '6px' }}
                title="Delete Customer"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
