import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validateCustomerForm, validateRequired } from '../lib/validation';

describe('Form Validation Utilities', () => {
  describe('validateEmail', () => {
    it('returns error when email is empty', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail('   ')).toBe('Email is required');
    });

    it('returns error for invalid email formats', () => {
      expect(validateEmail('plainaddress')).toBe('Please enter a valid email address');
      expect(validateEmail('missingatsign.com')).toBe('Please enter a valid email address');
      expect(validateEmail('@missingusername.com')).toBe('Please enter a valid email address');
      expect(validateEmail('user@domain')).toBe('Please enter a valid email address');
    });

    it('returns null for valid emails', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@sub.domain.co')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('returns error when phone is empty', () => {
      expect(validatePhone('')).toBe('Phone number is required');
    });

    it('returns error for numbers with fewer than 7 digits', () => {
      expect(validatePhone('12345')).toBe('Phone number must contain between 7 and 15 digits');
    });

    it('returns null for valid formatted phones', () => {
      expect(validatePhone('+1 (555) 123-4567')).toBeNull();
      expect(validatePhone('+44 20 7946 0958')).toBeNull();
      expect(validatePhone('05321234567')).toBeNull();
    });
  });

  describe('validateRequired', () => {
    it('returns error when string is blank', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required');
      expect(validateRequired('   ', 'Company')).toBe('Company is required');
    });

    it('returns null when value is non-empty', () => {
      expect(validateRequired('Acme Corp', 'Company')).toBeNull();
    });
  });

  describe('validateCustomerForm', () => {
    it('catches multiple validation errors at once', () => {
      const result = validateCustomerForm({
        name: '',
        email: 'bad-email',
        phone: '12',
        company: '',
        status: 'New',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
      expect(result.errors.email).toBe('Please enter a valid email address');
      expect(result.errors.phone).toBe('Phone number must contain between 7 and 15 digits');
      expect(result.errors.company).toBe('Company is required');
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

    it('rejects unrecognized customer status values', () => {
      const result = validateCustomerForm({
        name: 'John',
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
});
