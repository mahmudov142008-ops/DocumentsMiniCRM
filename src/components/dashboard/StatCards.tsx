import React from 'react';
import { Customer } from '../../types/crm';
import { Users, UserPlus, TrendingUp, AlertOctagon } from 'lucide-react';

interface StatCardsProps {
  customers: Customer[];
}

export const StatCards: React.FC<StatCardsProps> = ({ customers }) => {
  const total = customers.length;
  const newCount = customers.filter((c) => c.status === 'New').length;
  const contactedCount = customers.filter((c) => c.status === 'Contacted').length;
  const negotiationCount = customers.filter((c) => c.status === 'Negotiation').length;
  const lostCount = customers.filter((c) => c.status === 'Lost').length;

  const activePipeline = contactedCount + negotiationCount;
  const conversionRate = total > 0 ? Math.round((negotiationCount / total) * 100) : 0;

  const stats = [
    {
      label: 'Total Customers',
      value: total,
      sub: 'All registered leads',
      icon: <Users size={20} color="var(--primary)" />,
      accentBg: 'var(--primary-subtle)',
    },
    {
      label: 'New Leads',
      value: newCount,
      sub: 'Awaiting first contact',
      icon: <UserPlus size={20} color="var(--primary)" />,
      accentBg: 'var(--status-new-bg)',
    },
    {
      label: 'Active Pipeline',
      value: activePipeline,
      sub: `${contactedCount} contacted, ${negotiationCount} negotiating`,
      icon: <TrendingUp size={20} color="var(--accent-violet)" />,
      accentBg: 'var(--accent-violet-subtle)',
    },
    {
      label: 'Negotiation Rate',
      value: `${conversionRate}%`,
      sub: `${lostCount} lost deals`,
      icon: <AlertOctagon size={20} color="var(--text-secondary)" />,
      accentBg: 'var(--bg-secondary)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {s.label}
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '4px 0', color: 'var(--text-primary)' }}>
              {s.value}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.sub}</span>
          </div>

          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: s.accentBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {s.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
