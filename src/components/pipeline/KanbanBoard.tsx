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
          gap: '18px',
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
                backgroundColor: 'var(--bg-card-subtle)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '520px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
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
                      boxShadow: `0 0 8px ${config.color}`,
                    }}
                  />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{config.label}</h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: config.bg,
                      color: config.color,
                      padding: '2px 8px',
                      borderRadius: '9999px',
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
                    padding: '6px',
                    borderRadius: '8px',
                    color: 'var(--text-tertiary)',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
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
                      minHeight: '220px',
                      backgroundColor: snapshot.isDraggingOver ? 'var(--primary-subtle)' : 'transparent',
                      borderRadius: '12px',
                      border: snapshot.isDraggingOver ? '1px dashed var(--primary)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)',
                      padding: '4px',
                    }}
                  >
                    {columnCustomers.length === 0 && !snapshot.isDraggingOver ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '36px 12px',
                          border: '1px dashed var(--border-medium)',
                          borderRadius: '12px',
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
