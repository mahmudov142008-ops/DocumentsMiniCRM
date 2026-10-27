import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConfigNotice } from '../ui/ConfigNotice';
import { NotificationDropdown } from './NotificationDropdown';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CheckSquare,
  Calendar,
  Building,
  BarChart3,
  Search,
} from 'lucide-react';

export type AppPage =
  | 'dashboard'
  | 'customers'
  | 'pipeline'
  | 'settings'
  | 'tasks'
  | 'calendar'
  | 'companies'
  | 'reports';

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
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for global search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'dashboard' as AppPage, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'customers' as AppPage, label: 'Customers', icon: <Users size={18} /> },
    { id: 'pipeline' as AppPage, label: 'Deal Pipeline', icon: <KanbanSquare size={18} /> },
    { id: 'tasks' as AppPage, label: 'Tasks', icon: <CheckSquare size={18} /> },
    { id: 'calendar' as AppPage, label: 'Calendar', icon: <Calendar size={18} /> },
    { id: 'companies' as AppPage, label: 'Companies', icon: <Building size={18} /> },
    { id: 'reports' as AppPage, label: 'Reports', icon: <BarChart3 size={18} /> },
    { id: 'settings' as AppPage, label: 'Settings', icon: <Settings size={18} /> },
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

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(page) => {
          handleNavClick(page);
          setSearchOpen(false);
        }}
      />

      {/* Main Layout Container */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
        {/* Desktop Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: 'var(--bg-sidebar)',
            backdropFilter: 'blur(16px)',
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            zIndex: 10,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
          className="desktop-sidebar"
        >
          {/* Logo / Brand Header */}
          <div
            style={{
              padding: '20px 18px',
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
                background: 'var(--primary-gradient)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.125rem',
                boxShadow: 'var(--primary-glow)',
                flexShrink: 0,
              }}
            >
              M
            </div>
            <div>
              <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Mini<span style={{ color: 'var(--primary)' }}>CRM</span>
              </h1>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Relationship Suite
              </span>
            </div>
          </div>

          {/* Global Search Shortcut */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-light)' }}>
            <button
              id="sidebar-search-btn"
              data-testid="sidebar-search-btn"
              onClick={() => setSearchOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-tertiary)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              title="Search across MiniCRM (Ctrl+K)"
            >
              <Search size={15} />
              <span style={{ flex: 1, textAlign: 'left' }}>Quick search...</span>
              <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--bg-active)', fontWeight: 600 }}>
                ⌘K
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  data-testid={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 16px var(--primary-subtle)' : 'none',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
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
                  <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-tertiary)' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RLS Status Badge */}
          <div
            style={{
              padding: '10px 14px',
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
              padding: '14px 16px',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-sidebar-footer)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              onClick={() => handleNavClick('settings')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, cursor: 'pointer' }}
              title="Open Settings"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--primary-border)',
                  color: 'var(--primary)',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                id="footer-settings-btn"
                data-testid="footer-settings-btn"
                onClick={() => handleNavClick('settings')}
                className="btn-ghost"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  color: currentPage === 'settings' ? 'var(--primary)' : 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = 'var(--primary-subtle)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentPage === 'settings' ? 'var(--primary)' : 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>

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
                  e.currentTarget.style.backgroundColor = 'var(--danger-subtle)';
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
          </div>
        </aside>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {/* Application Top Header */}
          <header
            style={{
              height: '58px',
              backgroundColor: 'var(--bg-sidebar)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              position: 'sticky',
              top: 0,
              zIndex: 40,
            }}
            className="app-header"
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
                className="mobile-header-brand"
              >
                M
              </div>
              <span className="mobile-header-brand" style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Mini<span style={{ color: 'var(--primary)' }}>CRM</span>
              </span>
              <span className="desktop-header-title" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost"
                style={{ padding: '8px', color: 'var(--text-secondary)' }}
                aria-label="Search"
                title="Quick search (Ctrl+K)"
              >
                <Search size={18} />
              </button>
              <NotificationDropdown onNavigate={handleNavClick} userId={user?.id} />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-ghost mobile-menu-toggle-btn"
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
                backgroundColor: 'var(--bg-sidebar)',
                borderBottom: '1px solid var(--border-light)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
              className="mobile-menu-dropdown"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  data-testid={`mobile-nav-${item.id}`}
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
                    color: currentPage === item.id ? 'var(--primary)' : 'var(--text-primary)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: currentPage === item.id ? 'var(--primary)' : 'var(--text-tertiary)' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '8px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Signed in as {userName}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleNavClick('settings')}
                    className="btn btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Settings size={13} /> Settings
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
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
