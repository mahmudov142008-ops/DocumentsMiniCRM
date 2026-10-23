import React from 'react';
import { Customer } from '../../types/crm';
import { Badge } from '../ui/Badge';
import { Clock, ArrowRight, Building, Plus } from 'lucide-react';

interface RecentCustomersListProps {
  customers: Customer[];
  onViewCustomer: (customer: Customer) => void;
  onNavigateToCustomers: () => void;
  onAddCustomer: () => void;
}

export const RecentCustomersList: React.FC<RecentCustomersListProps> = ({
  customers,
  onViewCustomer,
  onNavigateToCustomers,
  onAddCustomer,
}) => {
  // Sort descending by created_at and take top 5
  const recent = [...customers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="var(--primary)" />
          Recently Added Leads
        </h3>
        <button
          onClick={onNavigateToCustomers}
          className="btn-ghost"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--primary)',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
          }}
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      {recent.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ fontSize: '0.875rem', marginBottom: '14px' }}>
            No customer records created yet.
          </p>
          <button onClick={onAddCustomer} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
            <Plus size={14} /> Add your first lead
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {recent.map((c) => (
            <div
              key={c.id}
              onClick={() => onViewCustomer(c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-card-subtle)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <div style={{ minWidth: 0, paddingRight: '8px' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px',
                  }}
                >
                  <Building size={11} /> {c.company}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  {formatDate(c.created_at)}
                </span>
                <Badge status={c.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
