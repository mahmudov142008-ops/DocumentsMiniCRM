import { CustomerInput } from '../types/crm';

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  // Standard RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  // Allow international and common phone formats (digits, +, -, (), spaces, min 7 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return 'Phone number must contain between 7 and 15 digits';
  }
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
}

export function validateCustomerForm(input: CustomerInput): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const nameError = validateRequired(input.name, 'Name');
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(input.phone);
  if (phoneError) errors.phone = phoneError;

  const companyError = validateRequired(input.company, 'Company');
  if (companyError) errors.company = companyError;

  const validStatuses = ['New', 'Contacted', 'Negotiation', 'Lost'];
  if (!input.status || !validStatuses.includes(input.status)) {
    errors.status = 'Please select a valid customer status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
