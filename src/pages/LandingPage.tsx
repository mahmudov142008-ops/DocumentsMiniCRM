import React, { useState } from 'react';
import {
  Users,
  KanbanSquare,
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Database,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewActiveTab, setPreviewActiveTab] = useState<'pipeline' | 'table'>('pipeline');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Ambient Lighting Orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-160px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '780px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, rgba(99, 102, 241, 0.12) 35%, rgba(56, 189, 248, 0.04) 60%, transparent 80%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '40%',
          right: '-100px',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(139, 92, 246, 0.06) 45%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Navigation Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8, 11, 17, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-light)',
          transition: 'all 200ms ease',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #38BDF8 100%)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.125rem',
              }}
            >
              M
            </div>
            <div>
              <span style={{ fontSize: '1.1875rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Mini<span style={{ color: 'var(--accent-blue)' }}>CRM</span>
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(139, 92, 246, 0.16)',
                  color: 'var(--accent-violet)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                v2.0
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '32px',
            }}
            className="desktop-nav-links"
          >
            <button
              onClick={() => scrollToSection('features')}
              style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 150ms' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 150ms' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('about')}
              style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 150ms' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              About & Security
            </button>
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={onSignIn}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.875rem' }}
            >
              Get Started
              <ArrowRight size={15} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger"
              style={{
                display: 'none',
                padding: '6px',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px 20px',
              borderTop: '1px solid var(--border-light)',
              background: 'rgba(10, 14, 24, 0.98)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <button
              onClick={() => scrollToSection('features')}
              style={{ textAlign: 'left', padding: '8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              style={{ textAlign: 'left', padding: '8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('about')}
              style={{ textAlign: 'left', padding: '8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}
            >
              About & Security
            </button>
            <div style={{ paddingTop: '8px', display: 'flex', gap: '10px' }}>
              <button onClick={onSignIn} className="btn btn-secondary" style={{ flex: 1 }}>
                Sign In
              </button>
              <button onClick={onGetStarted} className="btn btn-primary" style={{ flex: 1 }}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '72px 24px 56px',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Release Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.28)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
            marginBottom: '24px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--accent-blue)',
          }}
        >
          <Sparkles size={14} color="var(--accent-violet)" />
          <span>MiniCRM 2.0 • Intelligent Relationship Platform</span>
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            maxWidth: '900px',
            marginBottom: '20px',
            color: '#FFFFFF',
          }}
        >
          Build Better Customer Relationships.
        </h1>

        {/* Supporting Copy */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            marginBottom: '36px',
          }}
        >
          Turn everyday leads into long-term customer partnerships. Manage client records, track interactions with timestamped notes, and visualize your pipeline in real time—all with enterprise PostgreSQL security.
        </p>

        {/* Call to Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            marginBottom: '44px',
          }}
        >
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '1rem',
              borderRadius: '12px',
              fontWeight: 600,
              boxShadow: '0 6px 24px rgba(99, 102, 241, 0.45)',
            }}
          >
            Get Started Free
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="btn btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              borderRadius: '12px',
              fontWeight: 500,
            }}
          >
            Explore Features
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Key Guarantees Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            marginBottom: '56px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-blue)" />
            <span>Row-Level Security (RLS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--accent-violet)" />
            <span>Instant Kanban Synchronization</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="#34D399" />
            <span>Multi-Tenant Data Isolation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="#FBBF24" />
            <span>Real PostgreSQL Storage</span>
          </div>
        </div>

        {/* Realistic Interactive Dashboard Preview */}
        <div
          style={{
            width: '100%',
            maxWidth: '1080px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            background: 'linear-gradient(180deg, rgba(22, 31, 52, 0.75) 0%, rgba(11, 15, 25, 0.95) 100%)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), 0 0 50px rgba(99, 102, 241, 0.22)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* Mac-style Window Title Bar */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 21, 35, 0.85)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FBBF24' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                MiniCRM Workspace • Live Pipeline View (Interactive Preview)
              </span>
            </div>

            {/* Preview View Switcher */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setPreviewActiveTab('pipeline')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: previewActiveTab === 'pipeline' ? '#FFFFFF' : 'var(--text-secondary)',
                  background: previewActiveTab === 'pipeline' ? 'var(--primary)' : 'transparent',
                  transition: 'all 150ms',
                }}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setPreviewActiveTab('table')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: previewActiveTab === 'table' ? '#FFFFFF' : 'var(--text-secondary)',
                  background: previewActiveTab === 'table' ? 'var(--primary)' : 'transparent',
                  transition: 'all 150ms',
                }}
              >
                Customer Directory
              </button>
            </div>
          </div>

          {/* Preview Quick Metric Bar */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              background: 'rgba(10, 14, 24, 0.5)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Managed Customers</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>48 Accounts</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Deals in Motion</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-blue)' }}>22 Deals</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pipeline Velocity</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-violet)' }}>84% On-Track</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Database Security</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399' }}>RLS Active</div>
            </div>
          </div>

          {/* Preview Content Area */}
          <div style={{ padding: '24px', minHeight: '320px' }}>
            {previewActiveTab === 'pipeline' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Column 1: New */}
                <div style={{ background: 'rgba(15, 21, 35, 0.7)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-new-text)' }}>● New Leads</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '999px' }}>2</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(25, 35, 58, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>CloudScale AI</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sarah Chen • Enterprise Cloud</div>
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-new">New</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Just now</span>
                      </div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(25, 35, 58, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Apex Technologies</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marcus Vance • Security Infra</div>
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-new">New</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>2h ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Contacted */}
                <div style={{ background: 'rgba(15, 21, 35, 0.7)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-contacted-text)' }}>● Contacted</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '999px' }}>1</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(25, 35, 58, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Horizon Logistics</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Elena Rostova • Supply Chain</div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-contacted">Contacted</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Demo booked</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Negotiation */}
                <div style={{ background: 'rgba(15, 21, 35, 0.7)', borderRadius: '12px', border: '1px solid rgba(192, 132, 252, 0.25)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-negotiation-text)' }}>● Negotiation</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '999px' }}>1</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(25, 35, 58, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Nexus Dynamics</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>David Kross • FinTech SaaS</div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-negotiation">Negotiation</span>
                      <span style={{ fontSize: '0.6875rem', color: '#C084FC' }}>Annual Contract</span>
                    </div>
                  </div>
                </div>

                {/* Column 4: Closed / Lost */}
                <div style={{ background: 'rgba(15, 21, 35, 0.7)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.25)', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-lost-text)' }}>● Completed / Lost</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: '999px' }}>1</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(25, 35, 58, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Starlight Creative</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Liam Davies • Brand Studio</div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-lost">Lost</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Revisit Q3</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>Customer Name</th>
                      <th style={{ padding: '10px 12px' }}>Company</th>
                      <th style={{ padding: '10px 12px' }}>Email</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Sarah Chen</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>CloudScale AI</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>sarah@cloudscale.ai</td>
                      <td style={{ padding: '12px' }}><span className="badge badge-new">New</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>Elena Rostova</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Horizon Logistics</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>elena@horizonlogistics.com</td>
                      <td style={{ padding: '12px' }}><span className="badge badge-contacted">Contacted</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontWeight: 600 }}>David Kross</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Nexus Dynamics</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>david@nexusdynamics.io</td>
                      <td style={{ padding: '12px' }}><span className="badge badge-negotiation">Negotiation</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section
        id="features"
        style={{
          position: 'relative',
          padding: '88px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Built for Modern Teams
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 700, marginTop: '8px', marginBottom: '16px' }}>
            Everything You Need to Close Deals Faster
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Four streamlined pillars engineered without unnecessary CRM complexity, allowing you to focus on genuine relationships.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1 */}
          <div
            className="card"
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.6) 0%, rgba(12, 17, 28, 0.8) 100%)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Customer Management</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1 }}>
              Unified contacts directory with multi-field search across name, company, email, and phone. Real-time status filtering and responsive mobile card views.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--accent-blue)', fontWeight: 500 }}>
              <CheckCircle2 size={15} /> Instant Lead Search & Filter
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="card"
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.6) 0%, rgba(12, 17, 28, 0.8) 100%)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-violet)',
              }}
            >
              <KanbanSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Visual Deal Pipeline</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1 }}>
              Drag-and-drop Kanban board spanning 4 distinct stages (New, Contacted, Negotiation, Lost) with optimistic UI updates and instant database persistence.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--accent-violet)', fontWeight: 500 }}>
              <CheckCircle2 size={15} /> Persistent Drag & Drop
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="card"
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.6) 0%, rgba(12, 17, 28, 0.8) 100%)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399',
              }}
            >
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Customer Activity Notes</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1 }}>
              Maintain historical relationship context with timestamped notes. Integrated slide-out drawer lets you log calls, meeting minutes, and next steps in real time.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#34D399', fontWeight: 500 }}>
              <CheckCircle2 size={15} /> Chronological Audit Log
            </div>
          </div>

          {/* Card 4 */}
          <div
            className="card"
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.6) 0%, rgba(12, 17, 28, 0.8) 100%)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(251, 191, 36, 0.12)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FBBF24',
              }}
            >
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pipeline Analytics</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1 }}>
              Executive dashboard metrics revealing total deal volume, active pipeline counts, negotiation rates, and live status distribution charts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#FBBF24', fontWeight: 500 }}>
              <CheckCircle2 size={15} /> Real-Time Conversion Metrics
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section
        id="workflow"
        style={{
          position: 'relative',
          padding: '88px 24px',
          background: 'rgba(13, 18, 29, 0.65)',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-violet)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              How It Works
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 700, marginTop: '8px', marginBottom: '16px' }}>
              Designed For Frictionless Daily Flow
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              From the initial phone call to the finalized agreement, navigate every phase with zero cognitive overhead.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--accent-blue)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>1. Capture & Organize</h3>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Add new customer leads in seconds. Email and phone numbers are validated client-side with feedback, preventing invalid database records.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--accent-violet-subtle)',
                  border: '1px solid var(--accent-violet-border)',
                  color: 'var(--accent-violet)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>2. Document & Follow-Up</h3>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Open the customer detail drawer to log conversation highlights and key requirements. Every note is stamped with a precise UTC timestamp.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent-blue)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>3. Drag & Close Deals</h3>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Move deals forward in the visual pipeline. Dragging a card instantly reflects in real-time statistics and updates Postgres behind the scenes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About & Security Section */}
      <section
        id="about"
        style={{
          position: 'relative',
          padding: '88px 24px',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          zIndex: 1,
        }}
      >
        <div
          style={{
            borderRadius: '24px',
            border: '1px solid var(--border-medium)',
            background: 'linear-gradient(135deg, rgba(22, 31, 52, 0.6) 0%, rgba(15, 21, 35, 0.9) 100%)',
            padding: '48px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Architecture & Security
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, marginTop: '8px', marginBottom: '16px' }}>
              Enterprise Grade Multi-Tenant Isolation
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '24px' }}>
              MiniCRM is constructed with a zero-trust database philosophy. Every customer record, note, and profile is strictly bound to the authenticated user ID through native PostgreSQL Row-Level Security (RLS).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>PostgreSQL Row-Level Security</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Queries cannot bypass tenant isolation even if frontend code is manipulated.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Cryptographic JWT Sessions</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Bcrypt password hashing and secure token renewal handled via Supabase Auth.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Full Stack Test Coverage</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Automated Vitest test suite covering inputs, filters, badges, and dashboard metrics.</div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(8, 11, 17, 0.85)',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            <div style={{ color: 'var(--accent-blue)', marginBottom: '8px' }}>-- Postgres Multi-Tenant Policy</div>
            <div><span style={{ color: '#C084FC' }}>CREATE POLICY</span> "Users view own customers"</div>
            <div>&nbsp;&nbsp;<span style={{ color: '#C084FC' }}>ON</span> public.customers <span style={{ color: '#C084FC' }}>FOR SELECT</span></div>
            <div>&nbsp;&nbsp;<span style={{ color: '#C084FC' }}>USING</span> (auth.uid() = user_id);</div>
            <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
            <div style={{ color: '#34D399' }}>✓ Multi-tenant separation enforced by DB engine</div>
            <div style={{ color: '#34D399' }}>✓ Cross-tenant data leakage mathematically prevented</div>
          </div>
        </div>
      </section>

      {/* Conversion Banner Section */}
      <section
        style={{
          position: 'relative',
          padding: '64px 24px 96px',
          maxWidth: '1240px',
          margin: '0 auto',
          width: '100%',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2) 0%, rgba(15, 21, 35, 0.95) 70%)',
            padding: '64px 24px',
            boxShadow: '0 0 50px rgba(99, 102, 241, 0.25)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Transform Your Deal Flow?
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 32px' }}>
            Get started in under 60 seconds. Create your free CRM workspace and start tracking your customer relationships today.
          </p>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              borderRadius: '12px',
              fontWeight: 600,
              boxShadow: '0 6px 28px rgba(99, 102, 241, 0.5)',
            }}
          >
            Create Your Account
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-light)',
          background: 'rgba(8, 11, 17, 0.95)',
          padding: '36px 24px',
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              M
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>MiniCRM</span>
            <span>— SaaS Customer Pipeline Platform</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => scrollToSection('features')} style={{ color: 'var(--text-tertiary)' }}>
              Features
            </button>
            <button onClick={() => scrollToSection('workflow')} style={{ color: 'var(--text-tertiary)' }}>
              Workflow
            </button>
            <button onClick={() => scrollToSection('about')} style={{ color: 'var(--text-tertiary)' }}>
              About
            </button>
            <button onClick={onSignIn} style={{ color: 'var(--accent-blue)' }}>
              Sign In
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} MiniCRM. All rights reserved.
          </div>
        </div>
      </footer>

      {/* CSS Styles for Responsive Navbar */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .mobile-hamburger {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
