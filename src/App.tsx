import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { PipelinePage } from './pages/PipelinePage';
import { AppLayout, AppPage } from './components/layout/AppLayout';
import { customerService } from './services/customerService';
import { Customer, CustomerInput, CustomerStatus } from './types/crm';
import './styles/main.css';

type PublicView = 'landing' | 'login' | 'register';

const MainApplication: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
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

  // Sync publicView with browser hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        setPublicView('login');
      } else if (hash === '#register') {
        setPublicView('register');
      } else if (!hash || hash === '#' || hash === '#/' || hash === '#features' || hash === '#workflow' || hash === '#about') {
        if (!window.location.hash.startsWith('#login') && !window.location.hash.startsWith('#register')) {
          setPublicView('landing');
        }
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
      // Only show error toast if not just an initial setup notice
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
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            boxShadow: '0 0 28px rgba(99, 102, 241, 0.45)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.25rem',
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
    if (publicView === 'landing') {
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
        onBackToLanding={() => navigatePublicView('landing')}
      />
    );
  }

  // Authenticated Main Workspace
  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && (
        <DashboardPage
          customers={customers}
          loading={loadingCustomers}
          onRefresh={loadCustomers}
          onCreateCustomer={handleCreateCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onNavigate={setCurrentPage}
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
    </AppLayout>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApplication />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
