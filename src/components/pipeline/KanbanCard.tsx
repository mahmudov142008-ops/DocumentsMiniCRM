import React from 'react';
import { Customer, CustomerStatus } from '../../types/crm';
import { Draggable } from '@hello-pangea/dnd';
import { Mail, Phone, Building, MoreHorizontal, Eye, MoveRight } from 'lucide-react';

interface KanbanCardProps {
  customer: Customer;
  index: number;
  onView: (customer: Customer) => void;
  onQuickMove: (customer: Customer, newStatus: CustomerStatus) => void;
}

const STAGES: CustomerStatus[] = ['New', 'Contacted', 'Negotiation', 'Lost'];

export const KanbanCard: React.FC<KanbanCardProps> = ({
  customer,
  index,
  onView,
  onQuickMove,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <Draggable draggableId={customer.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            backgroundColor: 'rgba(20, 27, 45, 0.85)',
            border: `1px solid ${snapshot.isDragging ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '10px',
            boxShadow: snapshot.isDragging
              ? '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(139, 92, 246, 0.35)'
              : '0 2px 6px rgba(0, 0, 0, 0.3)',
            cursor: 'grab',
            transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast)',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            ...provided.draggableProps.style,
          }}
        >
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <h4
                onClick={() => onView(customer)}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  lineHeight: 1.3,
                  transition: 'color 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              >
                {customer.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '2px' }}>
                <Building size={12} />
                <span>{customer.company}</span>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="btn-ghost"
                style={{ padding: '4px', borderRadius: '6px' }}
                aria-label="Card options"
              >
                <MoreHorizontal size={14} color="var(--text-tertiary)" />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '24px',
                    backgroundColor: 'rgba(15, 21, 35, 0.95)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                    padding: '6px',
                    minWidth: '160px',
                    zIndex: 50,
                    backdropFilter: 'blur(16px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onView(customer);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--text-primary)',
                      transition: 'background-color 150ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Eye size={13} color="var(--accent-blue)" /> View Details & Notes
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />

                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '4px 10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Quick Move
                  </span>

                  {STAGES.filter((s) => s !== customer.status).map((targetStage) => (
                    <button
                      key={targetStage}
                      onClick={() => {
                        setShowMenu(false);
                        onQuickMove(customer, targetStage);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-secondary)',
                        transition: 'all 150ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <MoveRight size={12} color="var(--accent-violet)" />
                      {targetStage}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Mail size={12} color="var(--text-tertiary)" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={12} color="var(--text-tertiary)" />
              <span>{customer.phone}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
