import { describe, it, expect, beforeEach, vi } from 'vitest';
import { companyService } from '../services/companyService';
import { meetingService } from '../services/meetingService';
import { taskService } from '../services/taskService';
import { dealService } from '../services/dealService';
import { supabase } from '../lib/supabase';

describe('Empty-Cloud / Non-Empty-Cache Reconciliation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('companyService preserves local cache and does not overwrite with [] when Supabase returns 0 rows', async () => {
    const existingCompany = {
      id: 'comp-100',
      user_id: 'user-1',
      name: 'Existing Local Company',
      domain: 'existing.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('minicrm_companies_cache', JSON.stringify([existingCompany]));

    // Mock Supabase select returning empty array [] (cloud table has 0 rows post-migration)
    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'companies') {
        return { select: selectMock } as any;
      }
      return {} as any;
    }) as any);

    // Mock auth.getUser returning null or user
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: { user: null }, error: null } as any);

    const result = await companyService.getAll();

    // Verification: Data must NOT be wiped
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Existing Local Company');

    // Verification: localStorage MUST NOT be overwritten with []
    const rawCache = localStorage.getItem('minicrm_companies_cache');
    expect(rawCache).not.toBeNull();
    const parsed = JSON.parse(rawCache!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Existing Local Company');
  });

  it('meetingService preserves local cache and does not overwrite with [] when Supabase returns 0 rows', async () => {
    const existingMeeting = {
      id: 'meet-200',
      user_id: 'user-1',
      title: 'Strategy Session',
      date: '2026-11-01',
      start_time: '10:00',
      end_time: '11:00',
      meeting_type: 'Discovery',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('minicrm_meetings_cache', JSON.stringify([existingMeeting]));

    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'meetings') {
        return { select: selectMock } as any;
      }
      return {} as any;
    }) as any);

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: { user: null }, error: null } as any);

    const result = await meetingService.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Strategy Session');

    const rawCache = localStorage.getItem('minicrm_meetings_cache');
    expect(rawCache).not.toBeNull();
    const parsed = JSON.parse(rawCache!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('Strategy Session');
  });

  it('taskService preserves local cache when Supabase returns 0 rows', async () => {
    const existingTask = {
      id: 'task-300',
      user_id: 'user-1',
      title: 'Urgent Client Review',
      priority: 'high',
      status: 'pending',
      due_date: '2026-12-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('minicrm_tasks_cache', JSON.stringify([existingTask]));

    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'tasks') {
        return { select: selectMock } as any;
      }
      return {} as any;
    }) as any);

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: { user: null }, error: null } as any);

    const result = await taskService.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Urgent Client Review');

    const rawCache = localStorage.getItem('minicrm_tasks_cache');
    const parsed = JSON.parse(rawCache!);
    expect(parsed).toHaveLength(1);
  });

  it('dealService preserves local cache when Supabase returns 0 rows', async () => {
    const existingDeal = {
      id: 'deal-400',
      user_id: 'user-1',
      title: 'Key Enterprise Deal',
      value: 50000,
      stage: 'Negotiation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('minicrm_deals_cache', JSON.stringify([existingDeal]));

    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'deals') {
        return { select: selectMock } as any;
      }
      return {} as any;
    }) as any);

    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: { user: null }, error: null } as any);

    const result = await dealService.getAll();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Key Enterprise Deal');

    const rawCache = localStorage.getItem('minicrm_deals_cache');
    const parsed = JSON.parse(rawCache!);
    expect(parsed).toHaveLength(1);
  });

  it('avoids duplicates when reconciling cloud records with local cache', async () => {
    const cloudCompany = {
      id: 'c1',
      user_id: 'user-1',
      name: 'Cloud Company A',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const localCompanySame = {
      id: 'c1',
      user_id: 'user-1',
      name: 'Stale Local Company A',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const localCompanyNew = {
      id: 'c2',
      user_id: 'user-1',
      name: 'Local Only Company B',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('minicrm_companies_cache', JSON.stringify([localCompanySame, localCompanyNew]));

    const selectMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [cloudCompany], error: null }),
    });
    vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
      if (table === 'companies') {
        return { select: selectMock } as any;
      }
      return {} as any;
    }) as any);

    const result = await companyService.getAll();

    // Must contain exactly 2 companies: c1 (from cloud) and c2 (from local-only), no duplicates for c1
    expect(result).toHaveLength(2);
    expect(result.find(c => c.id === 'c1')?.name).toBe('Cloud Company A');
    expect(result.find(c => c.id === 'c2')?.name).toBe('Local Only Company B');
  });
});
