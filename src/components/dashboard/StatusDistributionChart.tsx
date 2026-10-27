import React from 'react';
import { Customer, CustomerStatus, STATUS_CONFIG } from '../../types/crm';
import { PieChart as PieChartIcon } from 'lucide-react';

interface StatusDistributionChartProps {
  customers: Customer[];
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ customers }) => {
  const total = customers.length;

  const counts: Record<CustomerStatus, number> = {
    New: customers.filter((c) => c.status === 'New').length,
    Contacted: customers.filter((c) => c.status === 'Contacted').length,
    Negotiation: customers.filter((c) => c.status === 'Negotiation').length,
    Lost: customers.filter((c) => c.status === 'Lost').length,
  };

  const stages: CustomerStatus[] = ['New', 'Contacted', 'Negotiation', 'Lost'];

  // SVG Donut Chart Calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let strokeOffsetAccumulator = 0;

  const segments = stages.map((stage) => {
    const count = counts[stage];
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -strokeOffsetAccumulator;
    strokeOffsetAccumulator += (percentage / 100) * circumference;

    return {
      stage,
      count,
      percentage: Math.round(percentage),
      strokeDasharray,
      strokeDashoffset,
      config: STATUS_CONFIG[stage],
    };
  });

  return (
    <div
      className="card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <PieChartIcon size={18} color="var(--primary)" />
          Pipeline Distribution
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '999px', border: '1px solid var(--border-light)' }}>
          {total} total records
        </span>
      </div>

      {total === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '0.875rem',
            padding: '36px 0',
          }}
        >
          No active customer data to generate pipeline breakdown
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            alignItems: 'center',
            gap: '24px',
            flex: 1,
          }}
        >
          {/* Donut graphic */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="var(--border-light)"
                strokeWidth="18"
              />
              {segments.map((s) => (
                <circle
                  key={s.stage}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={s.config.color}
                  strokeWidth="18"
                  strokeDasharray={s.strokeDasharray}
                  strokeDashoffset={s.strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                />
              ))}
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {total}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deals
              </span>
            </div>
          </div>

          {/* Breakdown bars and legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {segments.map((s) => (
              <div key={s.stage}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    marginBottom: '5px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: s.config.color,
                        boxShadow: `0 0 8px ${s.config.color}`,
                      }}
                    />
                    <strong style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.config.label}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {s.count} ({s.percentage}%)
                  </span>
                </div>
                {/* Micro progress bar */}
                <div
                  style={{
                    height: '5px',
                    backgroundColor: 'var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${s.percentage}%`,
                      backgroundColor: s.config.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                      boxShadow: `0 0 10px ${s.config.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
