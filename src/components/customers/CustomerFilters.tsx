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
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', paddingRight: searchQuery ? '32px' : '12px' }}
            placeholder="Search by name, company, email, or phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                padding: '2px',
              }}
              aria-label="Clear search text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Buttons / Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            <Filter size={14} />
            <span>Stage:</span>
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-light)'}`,
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
          paddingTop: '8px',
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
              padding: '2px 6px',
              fontSize: '0.8125rem',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'underline',
            }}
          >
            <X size={12} />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
};
