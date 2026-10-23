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
            backgroundColor: 'var(--bg-card)',
            border: `1px solid ${snapshot.isDragging ? 'var(--primary)' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '10px',
            boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
            cursor: 'grab',
            transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
            position: 'relative',
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
                }}
              >
                {customer.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '2px' }}>
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
                style={{ padding: '4px', borderRadius: 'var(--radius-sm)' }}
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
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '6px',
                    minWidth: '160px',
                    zIndex: 50,
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
                      padding: '6px 8px',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderRadius: '4px',
                    }}
                    className="btn-ghost"
                  >
                    <Eye size={13} /> View & Notes
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '4px 0' }} />

                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', padding: '2px 8px', display: 'block' }}>
                    Move to Stage:
                  </span>

                  {STAGES.filter((s) => s !== customer.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setShowMenu(false);
                        onQuickMove(customer, s);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '5px 8px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '4px',
                      }}
                      className="btn-ghost"
                    >
                      <MoveRight size={12} color="var(--primary)" /> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Mail size={12} color="var(--primary)" />
              {customer.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={12} color="var(--primary)" />
              {customer.phone}
            </span>
          </div>

          {/* Quick Click to View */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
            <button
              onClick={() => onView(customer)}
              className="btn-ghost"
              style={{
                fontSize: '0.6875rem',
                color: 'var(--primary)',
                padding: '2px 4px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Eye size={12} /> View details
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
