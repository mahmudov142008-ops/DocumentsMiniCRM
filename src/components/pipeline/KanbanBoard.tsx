import React from 'react';
import { Customer, CustomerStatus, STATUS_CONFIG } from '../../types/crm';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  customers: Customer[];
  onStatusChange: (customerId: string, newStatus: CustomerStatus) => Promise<void>;
  onViewCustomer: (customer: Customer) => void;
  onAddInStage: (stage: CustomerStatus) => void;
}

const COLUMNS: CustomerStatus[] = ['New', 'Contacted', 'Negotiation', 'Lost'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  customers,
  onStatusChange,
  onViewCustomer,
  onAddInStage,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Dropped in same place
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as CustomerStatus;
    if (newStatus !== source.droppableId) {
      onStatusChange(draggableId, newStatus);
    }
  };

  // Group customers by status
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = customers.filter((c) => c.status === col);
    return acc;
  }, {} as Record<CustomerStatus, Customer[]>);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((columnKey) => {
          const config = STATUS_CONFIG[columnKey];
          const columnCustomers = grouped[columnKey] || [];

          return (
            <div
              key={columnKey}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '480px',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${config.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: config.color,
                    }}
                  />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{config.label}</h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: config.bg,
                      color: config.color,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${config.border}`,
                    }}
                  >
                    {columnCustomers.length}
                  </span>
                </div>

                <button
                  onClick={() => onAddInStage(columnKey)}
                  className="btn-ghost"
                  style={{
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                  }}
                  title={`Add customer directly to ${columnKey}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={columnKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      minHeight: '200px',
                      backgroundColor: snapshot.isDraggingOver ? 'var(--primary-subtle)' : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      transition: 'background-color var(--transition-fast)',
                      padding: '4px',
                    }}
                  >
                    {columnCustomers.length === 0 && !snapshot.isDraggingOver ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '32px 12px',
                          border: '1px dashed var(--border-medium)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-tertiary)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        No deals in {columnKey}
                      </div>
                    ) : (
                      columnCustomers.map((cust, idx) => (
                        <KanbanCard
                          key={cust.id}
                          customer={cust}
                          index={idx}
                          onView={onViewCustomer}
                          onQuickMove={(customer, nextStatus) => {
                            onStatusChange(customer.id, nextStatus);
                          }}
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
