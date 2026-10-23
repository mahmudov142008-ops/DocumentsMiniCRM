import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Customer, CustomerInput, CustomerStatus } from '../../types/crm';
import { validateCustomerForm, ValidationErrors } from '../../lib/validation';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CustomerInput) => Promise<void>;
  initialData?: Customer | null;
  defaultStatus?: CustomerStatus;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultStatus = 'New',
}) => {
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: defaultStatus,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        company: initialData.company,
        status: initialData.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: defaultStatus,
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, defaultStatus, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateCustomerForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save customer. Please try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Customer' : 'Add New Customer'}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Create Customer')}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-subtle)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.875rem',
            }}
          >
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="customer-name" className="form-label">
            Full Name *
          </label>
          <input
            id="customer-name"
            name="name"
            type="text"
            className={`form-input ${errors.name ? 'has-error' : ''}`}
            placeholder="e.g. Jane Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            autoFocus
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="customer-company" className="form-label">
            Company *
          </label>
          <input
            id="customer-company"
            name="company"
            type="text"
            className={`form-input ${errors.company ? 'has-error' : ''}`}
            placeholder="e.g. Acme Corporation"
            value={formData.company}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.company && <span className="form-error">{errors.company}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label htmlFor="customer-email" className="form-label">
              Email Address *
            </label>
            <input
              id="customer-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="jane@company.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="customer-phone" className="form-label">
              Phone Number *
            </label>
            <input
              id="customer-phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'has-error' : ''}`}
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="customer-status" className="form-label">
            Deal Pipeline Stage *
          </label>
          <select
            id="customer-status"
            name="status"
            className={`form-select ${errors.status ? 'has-error' : ''}`}
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Lost">Lost</option>
          </select>
          {errors.status && <span className="form-error">{errors.status}</span>}
        </div>
      </form>
    </Modal>
  );
};
