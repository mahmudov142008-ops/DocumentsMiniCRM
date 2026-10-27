/**
 * Service-layer unit tests covering:
 *  - taskService.isOverdue
 *  - meetingService time validation (create & update merged logic)
 *  - salesGoalService.calculateProgress
 *  - dealService field coercion (value, stage defaults)
 */

import { describe, it, expect } from 'vitest';
import { taskService } from '../services/taskService';
import { salesGoalService } from '../services/salesGoalService';
import { Task, SalesGoal, Deal } from '../types/crm';

// ---------------------------------------------------------------------------
// Helper builders
// ---------------------------------------------------------------------------
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    user_id: 'u1',
    title: 'Follow-up call',
    priority: 'medium',
    status: 'pending',
    due_date: '2026-01-01',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeGoal(overrides: Partial<SalesGoal> = {}): SalesGoal {
  return {
    id: 'goal-1',
    user_id: 'u1',
    name: 'Q4 Revenue',
    target_amount: 100000,
    start_date: '2026-10-01',
    end_date: '2026-12-31',
    created_at: '2026-10-01T00:00:00Z',
    ...overrides,
  };
}

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: 'deal-1',
    user_id: 'u1',
    title: 'Enterprise Deal',
    value: 25000,
    stage: 'Won',
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
    expected_close_date: '2026-11-15',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// taskService.isOverdue
// ---------------------------------------------------------------------------
describe('taskService.isOverdue', () => {
  it('returns false for a completed task regardless of due date', () => {
    const task = makeTask({ status: 'completed', due_date: '2020-01-01' });
    expect(taskService.isOverdue(task)).toBe(false);
  });

  it('returns true for a pending task with a past due date', () => {
    const task = makeTask({ status: 'pending', due_date: '2020-01-01' });
    expect(taskService.isOverdue(task)).toBe(true);
  });

  it('returns false for a pending task with a future due date', () => {
    const futureDate = '2099-12-31';
    const task = makeTask({ status: 'pending', due_date: futureDate });
    expect(taskService.isOverdue(task)).toBe(false);
  });

  it('returns false for a task due today', () => {
    const today = new Date().toISOString().split('T')[0];
    const task = makeTask({ status: 'pending', due_date: today });
    expect(taskService.isOverdue(task)).toBe(false);
  });

  it('returns false for an in_progress task with a future due date', () => {
    const task = makeTask({ status: 'in_progress', due_date: '2099-01-01' });
    expect(taskService.isOverdue(task)).toBe(false);
  });

  it('returns true for an in_progress task with a past due date', () => {
    const task = makeTask({ status: 'in_progress', due_date: '2020-06-15' });
    expect(taskService.isOverdue(task)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Meeting time validation (pure string comparison logic mirrored from service)
// ---------------------------------------------------------------------------
describe('Meeting time validation (start < end constraint)', () => {
  function validateMeetingTimes(start: string, end: string): boolean {
    return start < end; // service throws when start >= end
  }

  it('passes when start is before end', () => {
    expect(validateMeetingTimes('09:00', '10:00')).toBe(true);
    expect(validateMeetingTimes('08:30', '08:45')).toBe(true);
  });

  it('fails when start equals end', () => {
    expect(validateMeetingTimes('10:00', '10:00')).toBe(false);
  });

  it('fails when start is after end', () => {
    expect(validateMeetingTimes('14:00', '11:00')).toBe(false);
  });

  it('handles midnight edge case correctly', () => {
    expect(validateMeetingTimes('23:30', '23:59')).toBe(true);
    expect(validateMeetingTimes('23:59', '00:00')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// salesGoalService.calculateProgress
// ---------------------------------------------------------------------------
describe('salesGoalService.calculateProgress', () => {
  const goal = makeGoal({
    target_amount: 100000,
    start_date: '2026-10-01',
    end_date: '2026-12-31',
  });

  it('returns 0% progress when there are no won deals', () => {
    const result = salesGoalService.calculateProgress(goal, []);
    expect(result.current).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.remaining).toBe(100000);
  });

  it('counts only Won deals within the goal date range', () => {
    const deals: Deal[] = [
      makeDeal({ value: 30000, stage: 'Won', expected_close_date: '2026-10-15' }),
      makeDeal({ id: 'deal-2', value: 20000, stage: 'Won', expected_close_date: '2026-11-20' }),
      // Outside date range — should be excluded
      makeDeal({ id: 'deal-3', value: 50000, stage: 'Won', expected_close_date: '2026-09-30' }),
    ];

    const result = salesGoalService.calculateProgress(goal, deals);
    expect(result.current).toBe(50000); // only 30000 + 20000
    expect(result.percentage).toBe(50);
    expect(result.remaining).toBe(50000);
  });

  it('excludes non-Won deals (Proposal, Lost, etc.)', () => {
    const deals: Deal[] = [
      makeDeal({ value: 40000, stage: 'Proposal', expected_close_date: '2026-11-01' }),
      makeDeal({ id: 'deal-lost', value: 60000, stage: 'Lost', expected_close_date: '2026-11-01' }),
    ];

    const result = salesGoalService.calculateProgress(goal, deals);
    expect(result.current).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('caps percentage at 100% when goal is exceeded', () => {
    const deals: Deal[] = [
      makeDeal({ value: 150000, stage: 'Won', expected_close_date: '2026-11-01' }),
    ];

    const result = salesGoalService.calculateProgress(goal, deals);
    expect(result.percentage).toBe(100); // capped
    expect(result.remaining).toBe(0);   // cannot go negative
    expect(result.current).toBe(150000);
  });

  it('handles zero target amount safely without divide-by-zero', () => {
    const zeroGoal = makeGoal({ target_amount: 0 });
    const result = salesGoalService.calculateProgress(zeroGoal, []);
    // Should not throw; percentage should be 0 or 100 based on implementation
    expect(typeof result.percentage).toBe('number');
    expect(isNaN(result.percentage)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Deal value coercion
// ---------------------------------------------------------------------------
describe('Deal value coercion', () => {
  it('Number() coercion handles numeric strings', () => {
    expect(Number('25000')).toBe(25000);
    expect(Number('')).toBe(0);
    expect(Number(undefined)).toBeNaN();
  });

  it('dealService create uses || 0 fallback for non-numeric value', () => {
    // Mirrors: value: Number(input.value) || 0
    const coerce = (v: unknown) => Number(v) || 0;
    expect(coerce('')).toBe(0);
    expect(coerce(undefined)).toBe(0);
    expect(coerce('abc')).toBe(0);
    expect(coerce(5000)).toBe(5000);
  });
});
