import React, { useState, useMemo } from 'react';
import { Customer, CustomerInput, CustomerStatus } from '../types/crm';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerCardList } from '../components/customers/CustomerCardList';
import { CustomerFilters } from '../components/customers/CustomerFilters';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { CustomerDetailDrawer } from '../components/customers/CustomerDetailDrawer';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Users, UserX, RefreshCw } from 'lucide-react';

interface CustomersPageProps {
  customers: Customer[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateCustomer: (input: CustomerInput) => Promise<void>;
  onUpdateCustomer: (id: string, input: Partial<CustomerInput>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  loading,
  onRefresh,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combined Search and Filter Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && customer.status !== statusFilter) {
        return false;
      }

      // 2. Search query (matches name, company, email, or phone)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(query);
        const matchesCompany = customer.company.toLowerCase().includes(query);
        const matchesEmail = customer.email.toLowerCase().includes(query);
        const matchesPhone = customer.phone.toLowerCase().includes(query);

        if (!matchesName && !matchesCompany && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [customers, searchQuery, statusFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
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
            Customer Directory
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage client profiles, contact information, and activity history
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
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onReset={handleResetFilters}
        totalResults={filteredCustomers.length}
        totalCustomers={customers.length}
      />

      {/* Customer List Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card" style={{ padding: '16px' }}>
              <Skeleton width="40%" height="20px" style={{ marginBottom: '8px' }} />
              <Skeleton width="70%" height="16px" />
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No customers yet"
          description="Build your pipeline by creating your first customer record with contact information and status."
          action={{
            label: 'Add Customer',
            onClick: () => setIsAddModalOpen(true),
          }}
        />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<UserX size={28} />}
          title="No matching customers found"
          description={`No customer records matched your query "${searchQuery}" with status "${statusFilter}". Try adjusting your search term or clearing filters.`}
          action={{
            label: 'Clear All Filters',
            onClick: handleResetFilters,
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-table-container">
            <CustomerTable
              customers={filteredCustomers}
              onView={(cust) => setSelectedCustomer(cust)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-card-container">
            <CustomerCardList
              customers={filteredCustomers}
              onView={(cust) => setSelectedCustomer(cust)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {/* Modals & Dialogs */}
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
        message={`Are you sure you want to permanently delete "${deletingCustomer?.name}"? All associated notes will be removed.`}
      />
    </div>
  );
};
