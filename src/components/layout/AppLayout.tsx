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
  UserCheck,
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {!isConfigured && <ConfigNotice />}

      {/* Main Layout Container */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: 'var(--bg-card)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
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
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              M
            </div>
            <div>
              <h1 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Mini CRM
              </h1>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enterprise Pipeline
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
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
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-tertiary)' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RLS Status Badge in Sidebar */}
          <div style={{ padding: '12px 16px', margin: '0 12px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>
              <ShieldCheck size={14} />
              <span>Row-Level Security Active</span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
              Multi-tenant data isolation enabled
            </span>
          </div>

          {/* User Profile Footer */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ minWidth: 0, paddingRight: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} color="var(--primary)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)' }}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Mobile Top Header */}
          <header
            style={{
              height: '56px',
              backgroundColor: 'var(--bg-card)',
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
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                }}
              >
                M
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Mini CRM</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-ghost"
                style={{ padding: '8px' }}
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
                backgroundColor: 'var(--bg-card)',
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
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: currentPage === item.id ? 600 : 500,
                    backgroundColor: currentPage === item.id ? 'var(--primary-subtle)' : 'transparent',
                    color: currentPage === item.id ? 'var(--primary)' : 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '8px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Signed in as {userName}</span>
                <button
                  onClick={() => signOut()}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
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
