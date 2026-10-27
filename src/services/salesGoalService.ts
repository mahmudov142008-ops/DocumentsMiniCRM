import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SalesGoal, SalesGoalInput, Deal } from '../types/crm';

const LOCAL_STORAGE_KEY = 'minicrm_sales_goals_cache';

function getLocalGoals(): SalesGoal[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGoals(goals: SalesGoal[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // ignore
  }
}

export const salesGoalService = {
  async getAll(): Promise<SalesGoal[]> {
    if (!isSupabaseConfigured) {
      return getLocalGoals();
    }

    try {
      const { data, error } = await supabase
        .from('sales_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return getLocalGoals();
      }

      const cloudGoals = (data as SalesGoal[]) || [];
      const localGoals = getLocalGoals();

      if (cloudGoals.length > 0) {
        const cloudIds = new Set(cloudGoals.map(g => g.id));
        const localOnly = localGoals.filter(g => !cloudIds.has(g.id));
        const merged = [...cloudGoals, ...localOnly];
        saveLocalGoals(merged);
        return merged;
      }

      if (localGoals.length > 0) {
        console.warn('Cloud returned 0 sales goals but local cache has records. Preserving cache.');
        return localGoals;
      }

      saveLocalGoals([]);
      return [];
    } catch {
      return getLocalGoals();
    }
  },

  async create(input: SalesGoalInput, userId: string): Promise<SalesGoal> {
    const newGoal: SalesGoal = {
      id: crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`,
      user_id: userId,
      name: input.name.trim(),
      target_amount: Number(input.target_amount) || 0,
      start_date: input.start_date,
      end_date: input.end_date,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('sales_goals')
        .insert([
          {
            user_id: userId,
            name: newGoal.name,
            target_amount: newGoal.target_amount,
            start_date: newGoal.start_date,
            end_date: newGoal.end_date,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const created = data as SalesGoal;
        const current = getLocalGoals();
        saveLocalGoals([created, ...current.filter(g => g.id !== created.id)]);
        return created;
      }
    }

    const current = getLocalGoals();
    saveLocalGoals([newGoal, ...current]);
    return newGoal;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('sales_goals').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    }
    const current = getLocalGoals();
    saveLocalGoals(current.filter(g => g.id !== id));
  },

  calculateProgress(goal: SalesGoal, deals: Deal[]): { current: number; percentage: number; remaining: number } {
    // Only count 'Won' deals that fall within start_date and end_date
    const wonInPeriod = deals.filter(deal => {
      if (deal.stage !== 'Won') return false;
      const dealDate = (deal.expected_close_date || deal.updated_at || deal.created_at).split('T')[0];
      return dealDate >= goal.start_date && dealDate <= goal.end_date;
    });

    const current = wonInPeriod.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const target = Number(goal.target_amount) || 1;
    const percentage = Math.min(100, Math.round((current / target) * 100));
    const remaining = Math.max(0, target - current);

    return { current, percentage, remaining };
  },
};
