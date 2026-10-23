import React, { useState } from 'react';
import { Customer, CustomerInput, CustomerStatus } from '../types/crm';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { CustomerDetailDrawer } from '../components/customers/CustomerDetailDrawer';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, RefreshCw, Layers } from 'lucide-react';

interface PipelinePageProps {
  customers: Customer[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateCustomer: (input: CustomerInput) => Promise<void>;
  onUpdateCustomer: (id: string, input: Partial<CustomerInput>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
  onStatusChange: (customerId: string, newStatus: CustomerStatus) => Promise<void>;
}

export const PipelinePage: React.FC<PipelinePageProps> = ({
  customers,
  loading,
  onRefresh,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onStatusChange,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetStageForNew, setTargetStageForNew] = useState<CustomerStatus>('New');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleAddInStage = (stage: CustomerStatus) => {
    setTargetStageForNew(stage);
    setIsAddModalOpen(true);
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="var(--primary)" />
            Sales Deal Pipeline
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Interactive Kanban board. Drag deals between stages to update deal flow in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
            disabled={loading || isRefreshing}
            title="Refresh pipeline status"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => handleAddInStage('New')}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Deal
          </button>
        </div>
      </div>

      {/* Board or Loading Skeleton */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="card" style={{ height: '420px', backgroundColor: 'var(--bg-secondary)' }}>
              <Skeleton width="50%" height="22px" style={{ marginBottom: '16px' }} />
              <Skeleton width="100%" height="90px" style={{ marginBottom: '10px' }} />
              <Skeleton width="100%" height="90px" />
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          customers={customers}
          onStatusChange={onStatusChange}
          onViewCustomer={(cust) => setSelectedCustomer(cust)}
          onAddInStage={handleAddInStage}
        />
      )}

      {/* Modals & Dialogs */}
      <CustomerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultStatus={targetStageForNew}
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
        message={`Are you sure you want to permanently delete "${deletingCustomer?.name}"?`}
      />
    </div>
  );
};
