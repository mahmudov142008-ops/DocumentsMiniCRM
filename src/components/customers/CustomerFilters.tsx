import React from 'react';
import { CustomerStatus } from '../../types/crm';
import { Search, X, Filter } from 'lucide-react';

interface CustomerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: CustomerStatus | 'ALL';
  onStatusChange: (status: CustomerStatus | 'ALL') => void;
  onReset: () => void;
  totalResults: number;
  totalCustomers: number;
}

const STATUS_OPTIONS: Array<{ value: CustomerStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Lost', label: 'Lost' },
];

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onReset,
  totalResults,
  totalCustomers,
}) => {
  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'ALL';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-light)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', paddingRight: searchQuery ? '36px' : '14px' }}
            placeholder="Search by name, company, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                padding: '2px',
                borderRadius: '4px',
              }}
              aria-label="Clear search text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px', color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 500 }}>
            <Filter size={14} color="var(--primary)" />
            <span>Stage:</span>
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'var(--bg-card-subtle)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--primary-border)' : 'var(--border-light)'}`,
                  boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results and Reset Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <span>
          Showing <strong>{totalResults}</strong> of <strong>{totalCustomers}</strong> customer{totalCustomers === 1 ? '' : 's'}
          {isFiltered && ' (filtered)'}
        </span>

        {isFiltered && (
          <button
            onClick={onReset}
            className="btn-ghost"
            style={{
              padding: '2px 8px',
              fontSize: '0.8125rem',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500,
            }}
          >
            <X size={13} />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
};
