import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { PipelinePage } from './pages/PipelinePage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AppLayout, AppPage } from './components/layout/AppLayout';
import { customerService } from './services/customerService';
import { Customer, CustomerInput, CustomerStatus } from './types/crm';
import './styles/main.css';

type PublicView = 'landing' | 'login' | 'register';

const VALID_PAGES: AppPage[] = [
  'dashboard',
  'customers',
  'pipeline',
  'settings',
  'tasks',
  'calendar',
  'companies',
  'reports',
];

const MainApplication: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Authenticated page navigation synced with hash
  const getInitialAppPage = (): AppPage => {
    if (typeof window !== 'undefined') {
      const cleanHash = window.location.hash.toLowerCase().replace('#', '') as AppPage;
      if (VALID_PAGES.includes(cleanHash)) {
        return cleanHash;
      }
    }
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState<AppPage>(getInitialAppPage);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Public route navigation
  const getInitialPublicView = (): PublicView => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') return 'login';
      if (hash === '#register') return 'register';
    }
    return 'landing';
  };

  const [publicView, setPublicView] = useState<PublicView>(getInitialPublicView);
  const [isViewingLanding, setIsViewingLanding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      return hash === '#landing' || hash === '#/' || hash === '#home';
    }
    return false;
  });

  // Sync publicView and currentPage with browser hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const cleanHash = hash.replace('#', '') as AppPage;

      if (VALID_PAGES.includes(cleanHash)) {
        setCurrentPage(cleanHash);
        setIsViewingLanding(false);
      } else if (hash.includes('access_token=') || hash.includes('token_hash=') || hash.includes('type=')) {
        setIsViewingLanding(false);
        return;
      }

      if (hash === '#login') {
        setPublicView('login');
        setIsViewingLanding(false);
      } else if (hash === '#register') {
        setPublicView('register');
        setIsViewingLanding(false);
      } else if (hash === '#landing' || hash === '#/' || hash === '#home') {
        setPublicView('landing');
        setIsViewingLanding(true);
      } else if (!hash || hash === '#') {
        setPublicView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigatePublicView = (view: PublicView) => {
    setPublicView(view);
    if (view === 'login') {
      window.location.hash = '#login';
    } else if (view === 'register') {
      window.location.hash = '#register';
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const navigateToLanding = () => {
    setIsViewingLanding(true);
    setPublicView('landing');
    if (typeof window !== 'undefined') {
      window.location.hash = '#landing';
    }
  };

  const handleNavigate = (page: AppPage) => {
    setIsViewingLanding(false);
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${page}`;
    }
  };

  const handleReturnToDashboard = () => {
    setIsViewingLanding(false);
    handleNavigate('dashboard');
  };

  // Stable ref to toast so it never causes useCallback to re-create
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  // Load customer records from Supabase
  const loadCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      return;
    }

    try {
      setLoadingCustomers(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch customer records';
      if (!msg.includes('credentials are not configured')) {
        toastRef.current.error(msg);
      }
    } finally {
      setLoadingCustomers(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCustomers();
    } else {
      setCustomers([]);
    }
  }, [user, loadCustomers]);

  // Create Customer
  const handleCreateCustomer = async (input: CustomerInput) => {
    if (!user) return;
    const created = await customerService.create(input, user.id);
    setCustomers((prev) => [created, ...prev]);
    toast.success(`Customer "${created.name}" created successfully.`);
  };

  // Update Customer Details
  const handleUpdateCustomer = async (id: string, input: Partial<CustomerInput>) => {
    const updated = await customerService.update(id, input);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
    toast.success(`Customer "${updated.name}" updated successfully.`);
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string) => {
    const target = customers.find((c) => c.id === id);
    await customerService.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Customer "${target?.name || ''}" deleted.`);
  };

  // Drag and Drop / Quick Move Status Change with Optimistic Update & Rollback
  const handleStatusChange = async (customerId: string, newStatus: CustomerStatus) => {
    const previousCustomer = customers.find((c) => c.id === customerId);
    if (!previousCustomer || previousCustomer.status === newStatus) return;

    const previousStatus = previousCustomer.status;

    // 1. Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: newStatus } : c))
    );

    try {
      // 2. Persist in database
      await customerService.updateStatus(customerId, newStatus);
      toast.success(`Moved "${previousCustomer.name}" to ${newStatus}.`);
    } catch (err: unknown) {
      // 3. Rollback on failure
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, status: previousStatus } : c))
      );
      const msg = err instanceof Error ? err.message : 'Failed to persist status change.';
      toast.error(msg);
    }
  };

  // Loading Splash Screen
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            background: 'var(--primary)',
            boxShadow: '0 2px 8px rgba(36, 57, 47, 0.12)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.125rem',
          }}
        >
          M
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Loading MiniCRM...
        </span>
      </div>
    );
  }

  // Not authenticated: Show Public Landing Page or Auth Page based on route
  if (!user) {
    if (publicView === 'landing' || isViewingLanding) {
      return (
        <LandingPage
          onGetStarted={() => navigatePublicView('register')}
          onSignIn={() => navigatePublicView('login')}
        />
      );
    }

    return (
      <AuthPage
        initialMode={publicView === 'register' ? 'register' : 'login'}
        onBackToLanding={() => {
          setIsViewingLanding(true);
          navigatePublicView('landing');
        }}
      />
    );
  }

  // Authenticated user viewing public landing page
  if (isViewingLanding) {
    return (
      <LandingPage
        onGetStarted={handleReturnToDashboard}
        onSignIn={handleReturnToDashboard}
        onGoToDashboard={handleReturnToDashboard}
        isAuthenticated={true}
      />
    );
  }

  // Authenticated Main Workspace
  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onNavigateToLanding={navigateToLanding}
    >
      {currentPage === 'dashboard' && (
        <DashboardPage
          customers={customers}
          loading={loadingCustomers}
          onRefresh={loadCustomers}
          onCreateCustomer={handleCreateCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'customers' && (
        <CustomersPage
          customers={customers}
          loading={loadingCustomers}
          onRefresh={loadCustomers}
          onCreateCustomer={handleCreateCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {currentPage === 'pipeline' && (
        <PipelinePage
          customers={customers}
          loading={loadingCustomers}
          onRefresh={loadCustomers}
          onCreateCustomer={handleCreateCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onStatusChange={handleStatusChange}
        />
      )}

      {currentPage === 'tasks' && <TasksPage />}

      {currentPage === 'calendar' && <CalendarPage />}

      {currentPage === 'companies' && <CompaniesPage />}

      {currentPage === 'reports' && <ReportsPage />}

      {currentPage === 'settings' && <SettingsPage />}
    </AppLayout>
  );
};

export function App() {
  return (
    <ToastProvider>
      <PreferencesProvider>
        <AuthProvider>
          <MainApplication />
        </AuthProvider>
      </PreferencesProvider>
    </ToastProvider>
  );
}

export default App;
