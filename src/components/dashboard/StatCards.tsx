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
      borderAccent: 'var(--border-light)',
    },
    {
      label: 'New Leads',
      value: newCount,
      sub: 'Awaiting first contact',
      icon: <UserPlus size={20} color="var(--accent-olive)" />,
      accentBg: 'rgba(105, 115, 92, 0.10)',
      borderAccent: 'rgba(105, 115, 92, 0.25)',
    },
    {
      label: 'Active Pipeline',
      value: activePipeline,
      sub: `${contactedCount} contacted, ${negotiationCount} negotiating`,
      icon: <TrendingUp size={20} color="var(--accent-brass)" />,
      accentBg: 'rgba(180, 154, 105, 0.12)',
      borderAccent: 'rgba(180, 154, 105, 0.25)',
    },
    {
      label: 'Negotiation Rate',
      value: `${conversionRate}%`,
      sub: `${lostCount} lost deals`,
      icon: <AlertOctagon size={20} color="var(--accent-brass)" />,
      accentBg: 'rgba(180, 154, 105, 0.08)',
      borderAccent: 'var(--border-light)',
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
            padding: '20px 22px',
            border: `1px solid ${s.borderAccent}`,
            background: 'var(--bg-card)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {s.label}
            </span>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, margin: '4px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.sub}</span>
          </div>

          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: s.accentBg,
              border: `1px solid ${s.borderAccent}`,
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
