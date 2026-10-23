import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConfigNotice } from '../ui/ConfigNotice';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export type AppPage = 'dashboard' | 'customers' | 'pipeline';

interface AppLayoutProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  const { user, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as AppPage, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'customers' as AppPage, label: 'Customers', icon: <Users size={18} /> },
    { id: 'pipeline' as AppPage, label: 'Deal Pipeline', icon: <KanbanSquare size={18} /> },
  ];

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const userEmail = user?.email || 'User';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {!isConfigured && <ConfigNotice />}

      {/* Main Layout Container */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            zIndex: 10,
          }}
          className="desktop-sidebar"
        >
          {/* Logo / Brand Header */}
          <div
            style={{
              padding: '24px 20px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #38BDF8 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              M
            </div>
            <div>
              <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Mini<span style={{ color: 'var(--accent-blue)' }}>CRM</span>
              </h1>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Relationship Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.18)' : 'none',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RLS Status Badge in Sidebar */}
          <div
            style={{
              padding: '12px 14px',
              margin: '0 12px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.22)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>Row-Level Security Active</span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '3px' }}>
              Multi-tenant Postgres isolation
            </span>
          </div>

          {/* User Profile Footer */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'rgba(8, 11, 17, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  color: 'var(--accent-violet)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </div>
              <div style={{ minWidth: 0, paddingRight: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {userName}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="btn-ghost"
              style={{
                padding: '8px',
                borderRadius: '8px',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--danger)';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {/* Mobile Top Header */}
          <header
            style={{
              height: '58px',
              backgroundColor: 'rgba(11, 15, 25, 0.95)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
            }}
            className="mobile-header"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--primary-gradient)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                M
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Mini<span style={{ color: 'var(--accent-blue)' }}>CRM</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-ghost"
                style={{ padding: '8px', color: 'var(--text-secondary)' }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </header>

          {/* Mobile Dropdown Navigation */}
          {mobileMenuOpen && (
            <div
              style={{
                backgroundColor: 'rgba(11, 15, 25, 0.98)',
                borderBottom: '1px solid var(--border-light)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
              className="mobile-menu-dropdown"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 12px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: currentPage === item.id ? 600 : 500,
                    backgroundColor: currentPage === item.id ? 'var(--primary-subtle)' : 'transparent',
                    color: currentPage === item.id ? '#FFFFFF' : 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: currentPage === item.id ? 'var(--accent-blue)' : 'var(--text-tertiary)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '8px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Signed in as {userName}</span>
                <button
                  onClick={() => signOut()}
                  className="btn btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Main Page Body */}
          <main style={{ flex: 1, padding: '28px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
