import { describe, it, expect } from 'vitest';
import { Customer } from '../types/crm';

const mockCustomers: Customer[] = [
  {
    id: '1',
    user_id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@nexus.tech',
    phone: '+1 555-1111',
    company: 'Nexus Tech',
    status: 'New',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'u1',
    name: 'Bob Smith',
    email: 'bob@orbit.io',
    phone: '+1 555-2222',
    company: 'Orbit Solutions',
    status: 'Contacted',
    created_at: '2026-10-21T12:00:00Z',
    updated_at: '2026-10-21T12:00:00Z',
  },
  {
    id: '3',
    user_id: 'u1',
    name: 'Carol White',
    email: 'carol@apex.co',
    phone: '+44 20 7946 0999',
    company: 'Apex Logistics',
    status: 'Negotiation',
    created_at: '2026-10-22T14:00:00Z',
    updated_at: '2026-10-22T14:00:00Z',
  },
  {
    id: '4',
    user_id: 'u1',
    name: 'David Lee',
    email: 'david@nexus.tech',
    phone: '+1 555-4444',
    company: 'Nexus Tech',
    status: 'Lost',
    created_at: '2026-10-23T16:00:00Z',
    updated_at: '2026-10-23T16:00:00Z',
  },
];

function filterCustomers(
  list: Customer[],
  query: string,
  status: string
): Customer[] {
  return list.filter((item) => {
    if (status !== 'ALL' && item.status !== status) {
      return false;
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCompany = item.company.toLowerCase().includes(q);
      const matchesEmail = item.email.toLowerCase().includes(q);
      const matchesPhone = item.phone.toLowerCase().includes(q);
      if (!matchesName && !matchesCompany && !matchesEmail && !matchesPhone) {
        return false;
      }
    }
    return true;
  });
}

describe('Customer Search & Filtering Logic', () => {
  it('returns all customers when query is empty and status is ALL', () => {
    const results = filterCustomers(mockCustomers, '', 'ALL');
    expect(results.length).toBe(4);
  });

  it('filters by status correctly', () => {
    const contacted = filterCustomers(mockCustomers, '', 'Contacted');
    expect(contacted.length).toBe(1);
    expect(contacted[0].name).toBe('Bob Smith');
  });

  it('searches by name case-insensitively', () => {
    const results = filterCustomers(mockCustomers, 'alice', 'ALL');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Alice Johnson');
  });

  it('searches by company name', () => {
    const results = filterCustomers(mockCustomers, 'Nexus Tech', 'ALL');
    expect(results.length).toBe(2);
  });

  it('searches by phone digits', () => {
    const results = filterCustomers(mockCustomers, '7946', 'ALL');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Carol White');
  });

  it('supports combined search and status filtering', () => {
    // Both Alice and David work at Nexus Tech, but only David is 'Lost'
    const results = filterCustomers(mockCustomers, 'Nexus', 'Lost');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('David Lee');
  });

  it('returns empty array when no records match', () => {
    const results = filterCustomers(mockCustomers, 'NonExistentPerson', 'ALL');
    expect(results.length).toBe(0);
  });
});
