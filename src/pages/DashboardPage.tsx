import React, { useState } from 'react';
import { Customer, CustomerInput } from '../types/crm';
import { StatCards } from '../components/dashboard/StatCards';
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart';
import { RecentCustomersList } from '../components/dashboard/RecentCustomersList';
import { CustomerDetailDrawer } from '../components/customers/CustomerDetailDrawer';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { AppPage } from '../components/layout/AppLayout';
import { Plus, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  customers: Customer[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateCustomer: (input: CustomerInput) => Promise<void>;
  onUpdateCustomer: (id: string, input: Partial<CustomerInput>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onNavigate: (page: AppPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  customers,
  loading,
  onRefresh,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onNavigate,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleEdit = (cust: Customer) => {
    setSelectedCustomer(null);
    setEditingCustomer(cust);
  };

  const handleDelete = (cust: Customer) => {
    setSelectedCustomer(null);
    setDeletingCustomer(cust);
  };

  const confirmDelete = async () => {
    if (deletingCustomer) {
      await onDeleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Executive Dashboard
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time pipeline metrics and lead activity tracking
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={loading || isRefreshing}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            New Customer
          </button>
        </div>
      </div>

      {/* Loading Skeletons or Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: '110px' }}>
              <Skeleton width="60%" height="16px" style={{ marginBottom: '12px' }} />
              <Skeleton width="40%" height="28px" />
            </div>
          ))}
        </div>
      ) : (
        <StatCards customers={customers} />
      )}

      {/* Analytics & Activity Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        <StatusDistributionChart customers={customers} />
        <RecentCustomersList
          customers={customers}
          onViewCustomer={(cust) => setSelectedCustomer(cust)}
          onNavigateToCustomers={() => onNavigate('customers')}
          onAddCustomer={() => setIsAddModalOpen(true)}
        />
      </div>

      {/* Modals & Drawers */}
      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onCreateCustomer}
      />

      <CustomerFormModal
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        initialData={editingCustomer}
        onSubmit={async (input) => {
          if (editingCustomer) {
            await onUpdateCustomer(editingCustomer.id, input);
            setEditingCustomer(null);
          }
        }}
      />

      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to permanently remove "${deletingCustomer?.name}"? All associated notes and pipeline history will be deleted.`}
      />
    </div>
  );
};
