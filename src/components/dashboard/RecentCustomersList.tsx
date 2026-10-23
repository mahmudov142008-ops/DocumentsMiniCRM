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
    <div
      className="card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.7) 0%, rgba(13, 18, 30, 0.85) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
          <Clock size={18} color="var(--accent-violet)" />
          Recently Added Leads
        </h3>
        <button
          onClick={onNavigateToCustomers}
          className="btn-ghost"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--accent-blue)',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
            borderRadius: '6px',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
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
            padding: '36px 16px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
          }}
        >
          <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
            No customer records created yet.
          </p>
          <button onClick={onAddCustomer} className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '8px 16px' }}>
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
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(15, 21, 35, 0.6)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(25, 35, 58, 0.75)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(15, 21, 35, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'none';
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
                    gap: '5px',
                    marginTop: '2px',
                  }}
                >
                  <Building size={12} /> {c.company}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
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
