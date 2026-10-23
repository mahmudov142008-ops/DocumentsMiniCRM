import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Database, KeyRound, ExternalLink } from 'lucide-react';

export const ConfigNotice: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        backgroundColor: 'var(--status-contacted-bg)',
        borderBottom: '1px solid var(--status-contacted-border)',
        color: 'var(--status-contacted-text)',
        padding: '12px 20px',
        fontSize: '0.875rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Database Setup Required:</strong> Connect your Supabase project in <code>.env</code> to enable live authentication and real database persistence.
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn-ghost"
          style={{
            fontSize: '0.8125rem',
            padding: '4px 8px',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline',
          }}
        >
          {expanded ? 'Hide setup steps' : 'View quick 2-minute setup'}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '12px auto 4px',
            padding: '16px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
          }}
        >
          <h4 style={{ fontSize: '0.9375rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="var(--primary)" />
            How to Connect Supabase to Mini CRM:
          </h4>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 500 }}>supabase.com <ExternalLink size={12} style={{ display: 'inline' }} /></a> and create a free project.
            </li>
            <li>
              Open the <strong>SQL Editor</strong> in your Supabase project, copy all contents from the file <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>supabase/schema.sql</code>, paste it, and click <strong>Run</strong>.
            </li>
            <li>
              Go to <strong>Project Settings → API</strong> and copy your <strong>Project URL</strong> and <strong>anon public API key</strong>.
            </li>
            <li>
              Create a <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>.env</code> file in this project folder and paste:
              <pre
                style={{
                  margin: '8px 0',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                }}
              >
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
              </pre>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} color="var(--primary)" />
              Restart the Vite dev server. You can immediately register your user and start managing customers!
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
