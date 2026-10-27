import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateNonNegativeNumber,
  validateDateRange,
  validateTimeRange,
  validateCustomerForm,
  validateCompanyForm,
  validateDealForm,
  validateTaskForm,
  validateMeetingForm,
} from '../lib/validation';

describe('Form Validation Utilities', () => {
  describe('validateRequired', () => {
    it('returns error when string is empty or contains only spaces', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required');
      expect(validateRequired('   ', 'Company')).toBe('Company is required');
      expect(validateRequired('\t\n  ', 'Title')).toBe('Title is required');
    });

    it('returns null when value is non-empty', () => {
      expect(validateRequired('Acme Corp', 'Company')).toBeNull();
      expect(validateRequired('  Valid Input  ', 'Name')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('returns error when email is empty or only spaces', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail('   ')).toBe('Email is required');
    });

    it('returns error for invalid email formats', () => {
      // Specifically required test cases
      expect(validateEmail('test@')).toBe('Please enter a valid email address');
      expect(validateEmail('test.com')).toBe('Please enter a valid email address');
      expect(validateEmail('test@gmail')).toBe('Please enter a valid email address');
      expect(validateEmail('test@.com')).toBe('Please enter a valid email address');

      // Additional invalid variations
      expect(validateEmail('plainaddress')).toBe('Please enter a valid email address');
      expect(validateEmail('@missingusername.com')).toBe('Please enter a valid email address');
      expect(validateEmail('username@domain..com')).toBe('Please enter a valid email address');
      expect(validateEmail('user@domain.')).toBe('Please enter a valid email address');
    });

    it('returns null for valid emails', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@sub.domain.co')).toBeNull();
      expect(validateEmail('contact@company.org')).toBeNull();
      expect(validateEmail('sales_team@enterprise.io')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('returns error when phone is empty and required', () => {
      expect(validatePhone('', true)).toBe('Phone number is required');
      expect(validatePhone('   ', true)).toBe('Phone number is required');
    });

    it('returns null when phone is empty and optional', () => {
      expect(validatePhone('', false)).toBeNull();
      expect(validatePhone('   ', false)).toBeNull();
      expect(validatePhone(undefined, false)).toBeNull();
    });

    it('rejects letters and invalid characters', () => {
      const invalidCharsMsg = 'Phone number contains invalid characters (only digits, +, spaces, hyphens, and parentheses allowed)';
      expect(validatePhone('1234567abc')).toBe(invalidCharsMsg);
      expect(validatePhone('+1 (555) CALL-ME')).toBe(invalidCharsMsg);
      expect(validatePhone('555-1234-xyz')).toBe(invalidCharsMsg);
      expect(validatePhone('+1 (555) 123-4567 #123')).toBe(invalidCharsMsg);
      expect(validatePhone('123$456&7890')).toBe(invalidCharsMsg);
    });

    it('returns error for numbers that are too short (< 7 digits)', () => {
      expect(validatePhone('12345')).toBe('Phone number must contain between 7 and 15 digits');
      expect(validatePhone('+1 23456')).toBe('Phone number must contain between 7 and 15 digits');
      expect(validatePhone('(123) 45')).toBe('Phone number must contain between 7 and 15 digits');
    });

    it('returns error for numbers that exceed the accepted length (> 15 digits)', () => {
      expect(validatePhone('+1234567890123456')).toBe('Phone number must contain between 7 and 15 digits');
      expect(validatePhone('12345678901234567')).toBe('Phone number must contain between 7 and 15 digits');
    });

    it('allows legitimate international formats', () => {
      expect(validatePhone('+1 (555) 123-4567')).toBeNull();
      expect(validatePhone('+44 20 7946 0958')).toBeNull();
      expect(validatePhone('+994 50 123 45 67')).toBeNull();
      expect(validatePhone('05321234567')).toBeNull();
      expect(validatePhone('+49-30-1234567')).toBeNull();
      expect(validatePhone('(800) 555-0199')).toBeNull();
      expect(validatePhone('+33 1 42 68 55 00')).toBeNull();
      expect(validatePhone('1234567890')).toBeNull();
    });
  });

  describe('validateNonNegativeNumber', () => {
    it('rejects NaN and non-numeric values', () => {
      expect(validateNonNegativeNumber(NaN, 'Value')).toBe('Value must be a valid number');
      expect(validateNonNegativeNumber('abc', 'Amount')).toBe('Amount must be a valid number');
      expect(validateNonNegativeNumber(undefined, 'Price')).toBe('Price is required');
    });

    it('rejects negative numbers', () => {
      expect(validateNonNegativeNumber(-1, 'Deal value')).toBe('Deal value cannot be negative');
      expect(validateNonNegativeNumber(-500.25, 'Target')).toBe('Target cannot be negative');
    });

    it('allows zero and positive numbers', () => {
      expect(validateNonNegativeNumber(0, 'Value')).toBeNull();
      expect(validateNonNegativeNumber(150, 'Value')).toBeNull();
      expect(validateNonNegativeNumber('25000', 'Revenue')).toBeNull();
      expect(validateNonNegativeNumber(99.99, 'Amount')).toBeNull();
    });
  });

  describe('validateDateRange', () => {
    it('returns error when start date is after end date', () => {
      expect(validateDateRange('2026-10-30', '2026-10-01')).toBe('End date must be after start date');
    });

    it('returns error when dates are equal and allowEqual is false', () => {
      expect(validateDateRange('2026-10-15', '2026-10-15', 'End date must be after start date', false)).toBe('End date must be after start date');
    });

    it('returns null when valid range', () => {
      expect(validateDateRange('2026-10-01', '2026-10-31')).toBeNull();
      expect(validateDateRange('2026-10-15', '2026-10-15', undefined, true)).toBeNull();
    });

    it('returns error when either date is missing', () => {
      expect(validateDateRange('', '2026-10-31')).toBe('Start date is required');
      expect(validateDateRange('2026-10-01', '')).toBe('End date is required');
    });
  });

  describe('validateTimeRange', () => {
    it('returns error when end time is before or equal to start time', () => {
      expect(validateTimeRange('14:00', '13:00')).toBe('End time must be after start time');
      expect(validateTimeRange('10:00', '10:00')).toBe('End time must be after start time');
    });

    it('returns null when end time is after start time', () => {
      expect(validateTimeRange('09:00', '10:00')).toBeNull();
      expect(validateTimeRange('14:30', '15:15')).toBeNull();
    });

    it('returns error when required times are missing', () => {
      expect(validateTimeRange('', '10:00')).toBe('Start time is required');
      expect(validateTimeRange('10:00', '')).toBe('End time is required');
    });
  });

  describe('validateCustomerForm', () => {
    it('catches empty/spaces required fields and format errors', () => {
      const result = validateCustomerForm({
        name: '   ',
        email: 'test@gmail',
        phone: '1234567abc',
        company: '   ',
        status: 'New',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
      expect(result.errors.company).toBe('Company is required');
      expect(result.errors.email).toBe('Please enter a valid email address');
      expect(result.errors.phone).toBe('Phone number contains invalid characters (only digits, +, spaces, hyphens, and parentheses allowed)');
    });

    it('returns isValid true when all fields pass validation', () => {
      const result = validateCustomerForm({
        name: 'Sarah Connor',
        email: 'sarah@skynet.com',
        phone: '+1 555-0199',
        company: 'Cyberdyne Systems',
        status: 'Negotiation',
      });

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('rejects invalid customer status values', () => {
      const result = validateCustomerForm({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-0199',
        company: 'Corp',
        // @ts-expect-error Testing invalid runtime value
        status: 'InvalidStatus',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.status).toBe('Please select a valid customer status');
    });
  });

  describe('validateCompanyForm', () => {
    it('rejects empty name and invalid phone', () => {
      const result = validateCompanyForm({
        name: '   ',
        phone: 'abc1234567',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Company name is required');
      expect(result.errors.phone).toBe('Phone number contains invalid characters (only digits, +, spaces, hyphens, and parentheses allowed)');
    });

    it('rejects phone exceeding 15 digits', () => {
      const result = validateCompanyForm({
        name: 'Acme Inc',
        phone: '+1234567890123456',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.phone).toBe('Phone number must contain between 7 and 15 digits');
    });

    it('allows valid company with optional phone', () => {
      const resultWithoutPhone = validateCompanyForm({
        name: 'Acme Inc',
        phone: '',
      });
      expect(resultWithoutPhone.isValid).toBe(true);

      const resultWithPhone = validateCompanyForm({
        name: 'Acme Inc',
        phone: '+1 (555) 234-5678',
      });
      expect(resultWithPhone.isValid).toBe(true);
    });
  });

  describe('validateDealForm', () => {
    it('rejects empty title and negative amount', () => {
      const result = validateDealForm({
        title: '   ',
        value: -500,
        stage: 'Lead',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Deal title is required');
      expect(result.errors.value).toBe('Deal value cannot be negative');
    });

    it('rejects NaN deal value', () => {
      const result = validateDealForm({
        title: 'Enterprise Contract',
        value: NaN,
        stage: 'Lead',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.value).toBe('Deal value must be a valid number');
    });

    it('allows valid deal with zero or positive amount', () => {
      const resultZero = validateDealForm({
        title: 'Trial Evaluation',
        value: 0,
        stage: 'Lead',
      });
      expect(resultZero.isValid).toBe(true);

      const resultPaid = validateDealForm({
        title: 'Annual Enterprise Plan',
        value: 45000,
        stage: 'Qualified',
      });
      expect(resultPaid.isValid).toBe(true);
    });
  });

  describe('validateTaskForm', () => {
    it('rejects empty title and missing due_date', () => {
      const result = validateTaskForm({
        title: '   ',
        priority: 'medium',
        status: 'pending',
        due_date: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Task title is required');
      expect(result.errors.due_date).toBe('Due date is required');
    });

    it('allows valid task', () => {
      const result = validateTaskForm({
        title: 'Follow up with lead',
        priority: 'high',
        status: 'pending',
        due_date: '2026-10-30',
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateMeetingForm', () => {
    it('rejects empty title, empty date, and invalid time range', () => {
      const result = validateMeetingForm({
        title: '   ',
        date: '',
        start_time: '15:00',
        end_time: '14:00',
        meeting_type: 'Demo',
        status: 'scheduled',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Meeting title is required');
      expect(result.errors.date).toBe('Date is required');
      expect(result.errors.time_range).toBe('End time must be after start time');
    });

    it('allows valid meeting', () => {
      const result = validateMeetingForm({
        title: 'Q4 Product Roadmap Sync',
        date: '2026-11-05',
        start_time: '10:00',
        end_time: '11:00',
        meeting_type: 'Demo',
        status: 'scheduled',
      });

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });
});
