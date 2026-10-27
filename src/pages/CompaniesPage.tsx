import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import { customerService } from '../services/customerService';
import { dealService } from '../services/dealService';
import { Company, CompanyInput, Customer, Deal } from '../types/crm';
import { validateCompanyForm, ValidationErrors } from '../lib/validation';
import {
  Building,
  Plus,
  Search,
  Globe,
  Users,
  KanbanSquare,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formInput, setFormInput] = useState<CompanyInput>({
    name: '',
    domain: '',
    industry: '',
    size: '',
    phone: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allCompanies, allCustomers, allDeals] = await Promise.all([
        companyService.getAll(),
        customerService.getAll().catch(() => []),
        dealService.getAll().catch(() => []),
      ]);
      setCompanies(allCompanies);
      setCustomers(allCustomers);
      setDeals(allDeals);
    } catch (err: unknown) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setFormInput({
      name: '',
      domain: '',
      industry: 'Technology',
      size: '10-50 employees',
      phone: '',
      notes: '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormInput({
      name: comp.name,
      domain: comp.domain || '',
      industry: comp.industry || '',
      size: comp.size || '',
      phone: comp.phone || '',
      notes: comp.notes || '',
    });
    setFormError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateCompanyForm(formInput);
    if (!isValid) {
      setFieldErrors(errors);
      setFormError(Object.values(errors).filter(Boolean).join('. '));
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      if (editingCompany) {
        const updated = await companyService.update(editingCompany.id, formInput);
        setCompanies(prev => prev.map(c => (c.id === editingCompany.id ? updated : c)));
      } else {
        if (!user) throw new Error('User not authenticated.');
        const created = await companyService.create(formInput, user.id);
        setCompanies(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save company.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await companyService.delete(id);
        setCompanies(prev => prev.filter(c => c.id !== id));
        if (viewingCompany?.id === id) setViewingCompany(null);
      } catch (err: unknown) {
        console.error('Failed to delete company:', err);
      }
    }
  };

  // Industries list
  const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean))) as string[];

  // Filtered
  const filteredCompanies = companies.filter(c => {
    if (selectedIndustry !== 'all' && c.industry !== selectedIndustry) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDomain = c.domain?.toLowerCase().includes(q);
      if (!matchName && !matchDomain) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Companies</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Manage client organizations, linked contacts, and active pipeline deals
          </p>
        </div>

        <button
          id="btn-create-company"
          data-testid="btn-create-company"
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> New Company
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-tertiary)" />
          <input
            type="text"
            placeholder="Search by company name or domain..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ maxWidth: '320px', padding: '6px 12px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Industry:</span>
          <select
            value={selectedIndustry}
            onChange={e => setSelectedIndustry(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem' }}
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading companies...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Building size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No companies found</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {companies.length === 0 ? 'Create your first company account to group customer contacts.' : 'No companies match your filters.'}
          </p>
          {companies.length === 0 && (
            <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} /> Add First Company
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredCompanies.map(comp => {
            const linkedContacts = customers.filter(
              c => c.company_id === comp.id || c.company.toLowerCase() === comp.name.toLowerCase()
            );
            const linkedDeals = deals.filter(
              d => d.company_id === comp.id || (d.company_name && d.company_name.toLowerCase() === comp.name.toLowerCase())
            );
            const totalDealValue = linkedDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

            return (
              <div
                key={comp.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  gap: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => setViewingCompany(comp)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--primary-subtle)',
                          border: '1px solid var(--primary-border)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                        }}
                      >
                        {comp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</h3>
                        {comp.industry && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{comp.industry}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(comp)}
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--text-secondary)' }}
                        title="Edit company"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(comp.id)}
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--danger)' }}
                        title="Delete company"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {comp.domain && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <Globe size={13} color="var(--text-tertiary)" />
                      <span>{comp.domain}</span>
                    </div>
                  )}

                  {comp.notes && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '8px', lineHeight: 1.4 }}>
                      {comp.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Stats */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                    <Users size={13} color="var(--primary)" /> {linkedContacts.length} contacts
                  </span>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    <KanbanSquare size={13} /> {linkedDeals.length} deals (${totalDealValue.toLocaleString()})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Company Detail Slide-over / Modal */}
      {viewingCompany && (
        <div className="modal-backdrop" onClick={() => setViewingCompany(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {viewingCompany.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="modal-title">{viewingCompany.name}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {viewingCompany.industry || 'Organization'} • {viewingCompany.size || 'N/A'}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingCompany(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-card-subtle)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Domain:</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {viewingCompany.domain || 'Not specified'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Phone:</span>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {viewingCompany.phone || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Linked Contacts */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Associated Contacts
                </h4>
                {customers.filter(c => c.company.toLowerCase() === viewingCompany.name.toLowerCase()).length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>No contacts linked to this company yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {customers
                      .filter(c => c.company.toLowerCase() === viewingCompany.name.toLowerCase())
                      .map(c => (
                        <div
                          key={c.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '8px' }}>{c.email}</span>
                          </div>
                          <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Linked Deals */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Associated Deals
                </h4>
                {deals.filter(d => d.company_id === viewingCompany.id || (d.company_name && d.company_name.toLowerCase() === viewingCompany.name.toLowerCase())).length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>No deals associated with this company yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {deals
                      .filter(d => d.company_id === viewingCompany.id || (d.company_name && d.company_name.toLowerCase() === viewingCompany.name.toLowerCase()))
                      .map(d => (
                        <div
                          key={d.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginLeft: '8px' }}>
                              ${Number(d.value).toLocaleString()}
                            </span>
                          </div>
                          <span className={`badge badge-${d.stage.toLowerCase()}`}>{d.stage}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setViewingCompany(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Company Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCompany ? 'Edit Company' : 'New Company'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px', backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '14px' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Stripe, Shopify, Acme Corp"
                    value={formInput.name}
                    onChange={e => {
                      setFormInput({ ...formInput, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={`form-input ${fieldErrors.name ? 'has-error' : ''}`}
                  />
                  {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Website Domain</label>
                    <input
                      type="text"
                      placeholder="e.g., stripe.com"
                      value={formInput.domain || ''}
                      onChange={e => setFormInput({ ...formInput, domain: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input
                      type="text"
                      placeholder="e.g., Fintech, Healthcare"
                      value={formInput.industry || ''}
                      onChange={e => setFormInput({ ...formInput, industry: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Company Size</label>
                    <select
                      value={formInput.size || ''}
                      onChange={e => setFormInput({ ...formInput, size: e.target.value })}
                      className="form-select"
                    >
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-1000 employees">201-1000 employees</option>
                      <option value="1000+ employees">1000+ employees</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formInput.phone || ''}
                      onChange={e => {
                        setFormInput({ ...formInput, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      className={`form-input ${fieldErrors.phone ? 'has-error' : ''}`}
                    />
                    {fieldErrors.phone && <span className="form-error">{fieldErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Key strategic initiatives, partner agreements, etc."
                    value={formInput.notes || ''}
                    onChange={e => setFormInput({ ...formInput, notes: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : editingCompany ? 'Save Changes' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
