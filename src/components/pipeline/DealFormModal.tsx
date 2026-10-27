import React, { useState, useEffect } from 'react';
import { Deal, DealInput, DealStage, Customer } from '../../types/crm';
import { validateDealForm, ValidationErrors } from '../../lib/validation';
import { X, DollarSign } from 'lucide-react';

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: DealInput) => Promise<void>;
  initialData?: Deal | null;
  defaultStage?: DealStage;
  customers: Customer[];
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultStage = 'Lead',
  customers,
}) => {
  const [formData, setFormData] = useState<DealInput>({
    title: '',
    value: 5000,
    stage: defaultStage,
    customer_id: '',
    expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    description: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        value: initialData.value,
        stage: initialData.stage,
        customer_id: initialData.customer_id || '',
        expected_close_date: initialData.expected_close_date || '',
        description: initialData.description || '',
        lost_reason: initialData.lost_reason || '',
      });
    } else {
      setFormData({
        title: '',
        value: 5000,
        stage: defaultStage,
        customer_id: customers[0]?.id || '',
        expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        description: '',
      });
    }
    setError('');
    setFieldErrors({});
  }, [initialData, defaultStage, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateDealForm(formData);
    if (!isValid) {
      setFieldErrors(errors);
      setError(Object.values(errors).filter(Boolean).join('. '));
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save deal.');
    } finally {
      setSubmitting(false);
    }
  };

  const stages: DealStage[] = ['Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Edit Deal' : 'New Sales Deal'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '10px', backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Deal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Enterprise Annual License"
                value={formData.title}
                onChange={e => {
                  setFormData({ ...formData, title: e.target.value });
                  if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
                }}
                className={`form-input ${fieldErrors.title ? 'has-error' : ''}`}
              />
              {fieldErrors.title && <span className="form-error">{fieldErrors.title}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Deal Value ($) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }}>
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={formData.value}
                    onChange={e => {
                      setFormData({ ...formData, value: Number(e.target.value) });
                      if (fieldErrors.value) setFieldErrors(prev => ({ ...prev, value: undefined }));
                    }}
                    className={`form-input ${fieldErrors.value ? 'has-error' : ''}`}
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
                {fieldErrors.value && <span className="form-error">{fieldErrors.value}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Pipeline Stage</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value as DealStage })}
                  className="form-select"
                >
                  {stages.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Associated Customer</label>
                <select
                  value={formData.customer_id || ''}
                  onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                  className="form-select"
                >
                  <option value="">None (Independent Opportunity)</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Close Date</label>
                <input
                  type="date"
                  value={formData.expected_close_date || ''}
                  onChange={e => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Scope</label>
              <textarea
                rows={3}
                placeholder="Key requirements, decision criteria, or contract scope..."
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="form-textarea"
              />
            </div>

            {formData.stage === 'Lost' && (
              <div className="form-group">
                <label className="form-label">Reason for Lost Deal</label>
                <input
                  type="text"
                  placeholder="e.g., Budget freeze, competitor selected, project postponed"
                  value={formData.lost_reason || ''}
                  onChange={e => setFormData({ ...formData, lost_reason: e.target.value })}
                  className="form-input"
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
