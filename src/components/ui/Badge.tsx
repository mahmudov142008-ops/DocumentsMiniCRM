import React from 'react';
import { CustomerStatus, STATUS_CONFIG } from '../../types/crm';

interface BadgeProps {
  status: CustomerStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'var(--text-secondary)',
    bg: 'var(--bg-secondary)',
    border: 'var(--border-medium)',
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`badge badge-${status.toLowerCase()}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
        padding: isSmall ? '2px 8px' : '4px 12px',
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        borderRadius: 'var(--radius-full)',
        borderWidth: '1px',
        borderStyle: 'solid',
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      <span
        style={{
          width: isSmall ? '6px' : '7px',
          height: isSmall ? '6px' : '7px',
          borderRadius: '50%',
          backgroundColor: config.color,
          marginRight: '6px',
        }}
      />
      {config.label}
    </span>
  );
};
