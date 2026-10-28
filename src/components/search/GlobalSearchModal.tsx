import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, KanbanSquare, CheckSquare, Building, ArrowRight, X } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { dealService } from '../../services/dealService';
import { taskService } from '../../services/taskService';
import { companyService } from '../../services/companyService';
import { Customer, Deal, Task, Company } from '../../types/crm';
import { AppPage } from '../layout/AppLayout';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: AppPage) => void;
}

interface SearchResult {
  id: string;
  type: 'customer' | 'deal' | 'task' | 'company';
  title: string;
  subtitle: string;
  page: AppPage;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Preload data for instant, seamless searching
      Promise.all([
        customerService.getAll().catch(() => []),
        dealService.getAll().catch(() => []),
        taskService.getAll().catch(() => []),
        companyService.getAll().catch(() => []),
      ]).then(([custs, dls, tsks, comps]) => {
        setCustomers(custs);
        setDeals(dls);
        setTasks(tsks);
        setCompanies(comps);
      });

      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const cleanQuery = query.trim().toLowerCase();

  const results: SearchResult[] = [];

  if (cleanQuery.length > 0) {
    // 1. Customers
    customers
      .filter(c => c.name.toLowerCase().includes(cleanQuery) || c.email.toLowerCase().includes(cleanQuery) || c.company.toLowerCase().includes(cleanQuery))
      .slice(0, 5)
      .forEach(c => {
        results.push({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: `${c.company} • ${c.email}`,
          page: 'customers',
        });
      });

    // 2. Deals
    deals
      .filter(d => d.title.toLowerCase().includes(cleanQuery) || (d.customer_name && d.customer_name.toLowerCase().includes(cleanQuery)))
      .slice(0, 5)
      .forEach(d => {
        results.push({
          id: d.id,
          type: 'deal',
          title: d.title,
          subtitle: `${d.stage} • $${Number(d.value).toLocaleString()}`,
          page: 'pipeline',
        });
      });

    // 3. Tasks
    tasks
      .filter(t => t.title.toLowerCase().includes(cleanQuery) || (t.description && t.description.toLowerCase().includes(cleanQuery)))
      .slice(0, 5)
      .forEach(t => {
        results.push({
          id: t.id,
          type: 'task',
          title: t.title,
          subtitle: `Due ${t.due_date} • ${t.priority} priority`,
          page: 'tasks',
        });
      });

    // 4. Companies
    companies
      .filter(co => co.name.toLowerCase().includes(cleanQuery) || (co.industry && co.industry.toLowerCase().includes(cleanQuery)))
      .slice(0, 5)
      .forEach(co => {
        results.push({
          id: co.id,
          type: 'company',
          title: co.name,
          subtitle: co.industry ? `${co.industry} • ${co.domain || 'Direct'}` : co.domain || 'Company',
          page: 'companies',
        });
      });
  }

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.page);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'customer':
        return <Users size={16} color="var(--primary)" />;
      case 'deal':
        return <KanbanSquare size={16} color="var(--accent-brass)" />;
      case 'task':
        return <CheckSquare size={16} color="var(--accent-olive)" />;
      case 'company':
        return <Building size={16} color="var(--primary)" />;
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '80px',
        zIndex: 1100,
      }}
    >
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '600px',
          padding: 0,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card-solid)',
          boxShadow: 'var(--shadow-lg), 0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-card-subtle)',
          }}
        >
          <Search size={20} color="var(--text-tertiary)" />
          <input
            ref={inputRef}
            id="global-search-input"
            data-testid="global-search-input"
            type="text"
            placeholder="Search customers, deals, companies, tasks... (Press ESC to close)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="btn-ghost"
              style={{ padding: '4px', color: 'var(--text-tertiary)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
          {cleanQuery.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Search size={24} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>Type a name, company, deal title, or task...</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Tip: Press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-hover)', border: '1px solid var(--border-light)' }}>↑</kbd> <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-hover)', border: '1px solid var(--border-light)' }}>↓</kbd> to navigate, <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-hover)', border: '1px solid var(--border-light)' }}>Enter</kbd> to open
              </span>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '0.875rem' }}>No results found for "{query}"</p>
              <span style={{ fontSize: '0.75rem' }}>Try searching by first name, domain, or stage name</span>
            </div>
          ) : (
            results.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                    border: isSelected ? '1px solid var(--primary-border)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getTypeIcon(result.type)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {result.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            color: 'var(--text-tertiary)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'var(--bg-hover)',
                          }}
                        >
                          {result.type}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                        {result.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight size={15} color={isSelected ? 'var(--primary)' : 'var(--text-tertiary)'} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-card-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>MiniCRM Global Fast Search</span>
          <span>ESC to cancel</span>
        </div>
      </div>
    </div>
  );
};
