import { CustomerInput, CompanyInput, DealInput, TaskInput, MeetingInput } from '../types/crm';

export function validateRequired(value: string | undefined | null, fieldName: string): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email: string | undefined | null): string | null {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const trimmed = email.trim();
  // Standard RFC-compliant practical regex: local-part, @, domain with at least 2 char TLD, no consecutive dots
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed) || trimmed.includes('..') || trimmed.endsWith('.')) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePhone(phone: string | undefined | null, required = true): string | null {
  if (!phone || !phone.trim()) {
    return required ? 'Phone number is required' : null;
  }
  const trimmed = phone.trim();

  // Allow legitimate international formats: optional leading +, digits, spaces, parentheses, hyphens, dots
  const allowedPattern = /^\+?[0-9\s().-]+$/;
  if (!allowedPattern.test(trimmed)) {
    return 'Phone number contains invalid characters (only digits, +, spaces, hyphens, and parentheses allowed)';
  }

  // Count raw digits
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return 'Phone number must contain between 7 and 15 digits';
  }

  return null;
}

export function validateNonNegativeNumber(
  value: number | string | undefined | null,
  fieldName: string,
  allowZero = true
): string | null {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (allowZero ? num < 0 : num <= 0) {
    return allowZero ? `${fieldName} cannot be negative` : `${fieldName} must be greater than zero`;
  }
  return null;
}

export function validateTimeRange(
  startTime: string | undefined | null,
  endTime: string | undefined | null,
  errorMessage = 'End time must be after start time'
): string | null {
  if (!startTime || !startTime.trim()) {
    return 'Start time is required';
  }
  if (!endTime || !endTime.trim()) {
    return 'End time is required';
  }
  if (startTime.trim() >= endTime.trim()) {
    return errorMessage;
  }
  return null;
}

export function validateDateRange(
  startDate: string | undefined | null,
  endDate: string | undefined | null,
  errorMessage = 'End date must be after start date',
  allowEqual = false
): string | null {
  if (!startDate || !startDate.trim()) {
    return 'Start date is required';
  }
  if (!endDate || !endDate.trim()) {
    return 'End date is required';
  }
  if (allowEqual ? startDate.trim() > endDate.trim() : startDate.trim() >= endDate.trim()) {
    return errorMessage;
  }
  return null;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function validateCustomerForm(input: CustomerInput): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const nameError = validateRequired(input.name, 'Name');
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(input.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(input.phone, true);
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

export function validateCompanyForm(input: CompanyInput): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const nameError = validateRequired(input.name, 'Company name');
  if (nameError) errors.name = nameError;

  if (input.phone) {
    const phoneError = validatePhone(input.phone, false);
    if (phoneError) errors.phone = phoneError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDealForm(input: DealInput): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const titleError = validateRequired(input.title, 'Deal title');
  if (titleError) errors.title = titleError;

  const valueError = validateNonNegativeNumber(input.value, 'Deal value', true);
  if (valueError) errors.value = valueError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTaskForm(input: TaskInput): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const titleError = validateRequired(input.title, 'Task title');
  if (titleError) errors.title = titleError;

  const dateError = validateRequired(input.due_date, 'Due date');
  if (dateError) errors.due_date = dateError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateMeetingForm(input: MeetingInput): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  const titleError = validateRequired(input.title, 'Meeting title');
  if (titleError) errors.title = titleError;

  const dateError = validateRequired(input.date, 'Date');
  if (dateError) errors.date = dateError;

  const timeError = validateTimeRange(input.start_time, input.end_time);
  if (timeError) {
    errors.time = timeError;
    errors.time_range = timeError;
    errors.end_time = timeError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
