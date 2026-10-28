import React, { useState } from 'react';
import {
  KanbanSquare,
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Lock,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  Database,
  LayoutDashboard,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onGoToDashboard?: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onGoToDashboard,
  isAuthenticated,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'pipeline' | 'directory'>('pipeline');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navigation Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border-medium)',
          transition: 'all var(--transition-fast)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
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
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              M
            </div>
            <div>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Mini<span style={{ color: 'var(--accent-brass)' }}>CRM</span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
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
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('security')}
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Security
            </button>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <button
                id="landing-dashboard-btn"
                data-testid="landing-dashboard-btn"
                onClick={onGoToDashboard || onSignIn}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '7px' }}
              >
                <LayoutDashboard size={15} />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <>
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
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-header-btn"
              style={{
                display: 'none',
                padding: '7px',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px 20px',
              borderTop: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <button
              onClick={() => scrollToSection('features')}
              style={{ textAlign: 'left', padding: '8px 0', fontSize: '0.9375rem', color: 'var(--text-primary)' }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              style={{ textAlign: 'left', padding: '8px 0', fontSize: '0.9375rem', color: 'var(--text-primary)' }}
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection('security')}
              style={{ textAlign: 'left', padding: '8px 0', fontSize: '0.9375rem', color: 'var(--text-primary)' }}
            >
              Security
            </button>
            <div style={{ paddingTop: '8px', display: 'flex', gap: '10px' }}>
              {isAuthenticated ? (
                <button
                  id="mobile-landing-dashboard-btn"
                  data-testid="mobile-landing-dashboard-btn"
                  onClick={onGoToDashboard || onSignIn}
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                >
                  <LayoutDashboard size={15} />
                  <span>Go to Dashboard</span>
                </button>
              ) : (
                <>
                  <button onClick={onSignIn} className="btn btn-secondary" style={{ flex: 1 }}>
                    Sign In
                  </button>
                  <button onClick={onGetStarted} className="btn btn-primary" style={{ flex: 1 }}>
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 64px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Editorial Sub-kicker */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            marginBottom: '24px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--accent-olive)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
          Client Relationship & Pipeline Suite
        </div>

        {/* Hero Headline */}
        <h1
          className="editorial-title"
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            maxWidth: '860px',
            marginBottom: '22px',
            color: 'var(--text-primary)',
          }}
        >
          Every relationship has room to grow.
        </h1>

        {/* Supporting Copy */}
        <p
          style={{
            fontSize: 'clamp(1.0625rem, 2vw, 1.25rem)',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            marginBottom: '36px',
            fontWeight: 400,
          }}
        >
          Keep your customers close, your pipeline clear, and your next opportunity within reach.
        </p>

        {/* Call to Action Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{
              padding: '13px 28px',
              fontSize: '0.9375rem',
            }}
          >
            Start Managing Leads
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="btn btn-secondary"
            style={{
              padding: '13px 24px',
              fontSize: '0.9375rem',
            }}
          >
            Explore Platform
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Quality Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            marginBottom: '52px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>Row-Level Security (RLS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KanbanSquare size={16} color="var(--accent-olive)" />
            <span>Interactive Deal Stages</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="var(--accent-brass)" />
            <span>Multi-Tenant Isolation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} color="var(--primary)" />
            <span>PostgreSQL Persistence</span>
          </div>
        </div>

        {/* Purposeful Miniature CRM Pipeline & Relationship Preview */}
        <div
          style={{
            width: '100%',
            maxWidth: '1060px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* Window Chrome */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-card-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D9D5CB' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D9D5CB' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D9D5CB' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                MiniCRM Workspace • Live Pipeline View
              </span>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setPreviewTab('pipeline')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: previewTab === 'pipeline' ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: previewTab === 'pipeline' ? 'var(--primary)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Kanban Pipeline
              </button>
              <button
                onClick={() => setPreviewTab('directory')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: previewTab === 'directory' ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: previewTab === 'directory' ? 'var(--primary)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Customer Directory
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Active Accounts</span>
              <div style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-primary)' }}>48 Customers</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Pipeline Volume</span>
              <div style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--primary)' }}>$142,500</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Average Velocity</span>
              <div style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--accent-olive)' }}>18 Days</div>
            </div>
            <div>
              <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 600 }}>Monthly Win Rate</span>
              <div style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--accent-brass)' }}>68% Projected</div>
            </div>
          </div>

          {/* Tab Body */}
          <div style={{ padding: '20px', minHeight: '300px', backgroundColor: 'var(--bg-primary)' }}>
            {previewTab === 'pipeline' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                {/* Column 1: New */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-new-text)' }}>New Leads</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>2</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Meridian Advisors</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sarah Chen • Enterprise Consulting</div>
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-new">New</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>$24,000</span>
                      </div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Oakhaven Media</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marcus Vance • Annual Retainer</div>
                      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-new">New</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>$16,500</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Contacted */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-contacted-text)' }}>Contacted</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>1</span>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Horizon Logistics</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Elena Rostova • Supply Chain</div>
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-contacted">Contacted</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>$42,000</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Negotiation */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-negotiation-text)' }}>Negotiation</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>1</span>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Nexus Dynamics</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>David Kross • Multi-Seat License</div>
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-negotiation">Negotiation</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-brass)' }}>$60,000</span>
                    </div>
                  </div>
                </div>

                {/* Column 4: Won */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--status-won-text)' }}>Won / Closed</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>1</span>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Sterling Partners</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Julian Howard • Full Implementation</div>
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-won">Won</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>$75,000</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Customer Name</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Company</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Direct Contact</th>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Sarah Chen</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>Meridian Advisors</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>sarah@meridian.com</td>
                      <td style={{ padding: '12px 14px' }}><span className="badge badge-new">New</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>Elena Rostova</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>Horizon Logistics</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>elena@horizon.com</td>
                      <td style={{ padding: '12px 14px' }}><span className="badge badge-contacted">Contacted</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>David Kross</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>Nexus Dynamics</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>david@nexus.io</td>
                      <td style={{ padding: '12px 14px' }}><span className="badge badge-negotiation">Negotiation</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-brass)', marginBottom: '10px' }}>
            Thoughtfully Engineered
          </div>
          <h2 className="editorial-title" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Built for intentional client relationships.
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto' }}>
            A unified suite designed to organize conversations, monitor deal progression, and safeguard client privacy without unnecessary complexity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Feature 1 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KanbanSquare size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>Visual Deal Pipelines</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              4-stage interactive Kanban board with drag-and-drop mechanics, optimistic UI updates, and real-time database synchronization.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-olive-subtle)',
                color: 'var(--accent-olive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>Chronological Activity Notes</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Attach timestamped meeting summaries, call logs, and partnership agreements directly to scoped customer profiles.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-brass-subtle)',
                color: 'var(--accent-brass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>Actionable Analytics</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Real-time calculations for sales volume, pipeline velocity, conversion distribution charts, and monthly goal progress.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>PostgreSQL Row-Level Security</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Database-level multi-tenant isolation ensuring users and organizations only ever view and edit their own private data.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section
        id="workflow"
        style={{
          padding: '72px 24px',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-medium)',
          borderBottom: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-olive)', marginBottom: '10px' }}>
              Structured Process
            </div>
            <h2 className="editorial-title" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
              How MiniCRM moves opportunities forward.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto' }}>
              From the initial point of introduction to the signed contract, every stage is structured and visible.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="card">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-brass)', marginBottom: '6px' }}>PHASE 01</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Capture & Qualify</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Record verified contacts with international phone formatting, email validation, and organization associations.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-brass)', marginBottom: '6px' }}>PHASE 02</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Track & Schedule</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Log interaction notes and book meetings with chronological time validation directly in the integrated calendar.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-brass)', marginBottom: '6px' }}>PHASE 03</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Negotiate on Kanban</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Drag deal cards between pipeline columns with monetary values, expected closing dates, and instant rollback protection.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-brass)', marginBottom: '6px' }}>PHASE 04</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Report & Scale</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Review win/loss ratios, pipeline stage velocity, and team sales goals to forecast upcoming monthly revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Callout */}
      <section
        id="security"
        style={{
          padding: '80px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            boxShadow: 'var(--shadow-sm)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: '8px' }}>
              Security First
            </div>
            <h3 className="editorial-title" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Your client data stays exclusively yours.
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              MiniCRM is architected around PostgreSQL Row-Level Security (RLS) across all 11 database tables. Access rights are evaluated inside the database engine, with least-privilege function execution and non-destructive offline reconciliation preventing accidental data loss.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>11 Dedicated relational PostgreSQL tables with foreign key integrity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Explicit least-privilege role permissions for authenticated access</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: 'var(--primary)' }}>
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Two-way non-destructive cache reconciliation preventing empty-cloud overwrites</span>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Lock size={16} color="var(--accent-brass)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Enterprise Protection Standard</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Row-Level Security</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Enforced on all 11 tables</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Auth Token Protocol</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>JWT + Automatic Refresh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Automated Test Coverage</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-olive)' }}>94 Tests (100% Pass)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trigger Functions</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-brass)' }}>Client Execution Revoked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Banner */}
      <section
        style={{
          padding: '64px 24px 80px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="editorial-title"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: '14px',
              maxWidth: '640px',
            }}
          >
            Ready to bring clarity to your client pipeline?
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#D4DDD7',
              maxWidth: '560px',
              marginBottom: '28px',
              lineHeight: 1.55,
            }}
          >
            Start tracking leads, organizing customer notes, and guiding deals to close today.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={onGetStarted}
              className="btn"
              style={{
                backgroundColor: 'var(--accent-brass)',
                color: '#FFFFFF',
                padding: '12px 28px',
                fontSize: '0.9375rem',
                border: 'none',
              }}
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onSignIn}
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '12px 24px',
                fontSize: '0.9375rem',
              }}
            >
              Sign In to Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-medium)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '32px 24px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.6875rem',
              }}
            >
              M
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>MiniCRM</span>
            <span>—</span>
            <span>Intelligent Customer Relationship Management</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={() => scrollToSection('features')} style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Features
            </button>
            <button onClick={() => scrollToSection('workflow')} style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Workflow
            </button>
            <button onClick={() => scrollToSection('security')} style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Security
            </button>
            <button onClick={onSignIn} style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
