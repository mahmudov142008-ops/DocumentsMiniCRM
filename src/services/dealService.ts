import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Deal, DealInput, DealStage } from '../types/crm';

const LOCAL_STORAGE_KEY = 'minicrm_deals_cache';

function getLocalDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDeals(deals: Deal[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deals));
  } catch {
    // Storage quota exceeded or disabled
  }
}

export const dealService = {
  async getAll(): Promise<Deal[]> {
    if (!isSupabaseConfigured) {
      return getLocalDeals();
    }

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase deals table query failed, reading local cache:', error.message);
        return getLocalDeals();
      }

      const cloudDeals = (data as Deal[]) || [];
      const localDeals = getLocalDeals();

      // Case 1: Cloud returned records. Merge cloud and local-only records to avoid duplicates.
      if (cloudDeals.length > 0) {
        const cloudIds = new Set(cloudDeals.map(d => d.id));
        const localOnly = localDeals.filter(d => !cloudIds.has(d.id));
        const merged = [...cloudDeals, ...localOnly];
        saveLocalDeals(merged);
        return merged;
      }

      // Case 2: Cloud returned 0 records, but local cache has records.
      // Prevent data loss: preserve local cache and attempt safe cloud reconciliation.
      if (localDeals.length > 0) {
        console.warn('Cloud returned 0 deals but local cache has records. Preserving cache and attempting safe cloud synchronization.');
        try {
          const synced = await this.migrateLocalToCloud(localDeals);
          if (synced && synced.length > 0) {
            saveLocalDeals(synced);
            return synced;
          }
        } catch (syncErr: any) {
          console.error('Failed to synchronize local deals cache to cloud:', syncErr?.message || syncErr);
        }
        return localDeals;
      }

      // Case 3: Both are empty
      saveLocalDeals([]);
      return [];
    } catch (err: any) {
      console.error('Unexpected error fetching deals from cloud:', err?.message || err);
      return getLocalDeals();
    }
  },

  async migrateLocalToCloud(localDeals: Deal[]): Promise<Deal[]> {
    if (!isSupabaseConfigured || localDeals.length === 0) {
      return localDeals;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return localDeals;
    }

    const migrated: Deal[] = [];
    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val) : false;

    for (const deal of localDeals) {
      try {
        const payload: Record<string, unknown> = {
          user_id: deal.user_id && isValidUuid(deal.user_id) ? deal.user_id : user.id,
          title: deal.title.trim(),
          value: Number(deal.value) || 0,
          stage: deal.stage || 'Lead',
          customer_id: isValidUuid(deal.customer_id) ? deal.customer_id : null,
          company_id: isValidUuid(deal.company_id) ? deal.company_id : null,
          expected_close_date: deal.expected_close_date || null,
          description: deal.description?.trim() || null,
          lost_reason: deal.lost_reason?.trim() || null,
          is_favorite: deal.is_favorite || false,
        };

        if (isValidUuid(deal.id)) {
          payload.id = deal.id;
        }

        const { data, error } = await supabase
          .from('deals')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) {
          console.error(`Cloud synchronization failed for deal "${deal.title}":`, error.message);
          migrated.push(deal);
        } else if (data) {
          migrated.push(data as Deal);
        }
      } catch (err: any) {
        console.error(`Cloud synchronization exception for deal "${deal.title}":`, err?.message || err);
        migrated.push(deal);
      }
    }

    return migrated.length > 0 ? migrated : localDeals;
  },

  async create(input: DealInput, userId: string): Promise<Deal> {
    const newDeal: Deal = {
      id: crypto.randomUUID ? crypto.randomUUID() : `deal-${Date.now()}`,
      user_id: userId,
      title: input.title.trim(),
      value: Number(input.value) || 0,
      stage: input.stage || 'Lead',
      customer_id: input.customer_id,
      company_id: input.company_id,
      expected_close_date: input.expected_close_date,
      description: input.description?.trim(),
      lost_reason: input.lost_reason?.trim(),
      is_favorite: input.is_favorite || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('deals')
        .insert([
          {
            user_id: userId,
            title: newDeal.title,
            value: newDeal.value,
            stage: newDeal.stage,
            customer_id: newDeal.customer_id || null,
            company_id: newDeal.company_id || null,
            expected_close_date: newDeal.expected_close_date || null,
            description: newDeal.description || null,
            lost_reason: newDeal.lost_reason || null,
            is_favorite: newDeal.is_favorite,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const created = data as Deal;
        const current = getLocalDeals();
        saveLocalDeals([created, ...current.filter(d => d.id !== created.id)]);
        return created;
      }
    }

    const current = getLocalDeals();
    saveLocalDeals([newDeal, ...current]);
    return newDeal;
  },

  async update(id: string, input: Partial<DealInput>): Promise<Deal> {
    const current = getLocalDeals();
    const existing = current.find(d => d.id === id);

    const updated: Deal = {
      ...(existing || {
        id,
        user_id: '',
        title: '',
        value: 0,
        stage: 'Lead',
        created_at: new Date().toISOString(),
      }),
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.value !== undefined && { value: Number(input.value) || 0 }),
      ...(input.stage !== undefined && { stage: input.stage }),
      ...(input.customer_id !== undefined && { customer_id: input.customer_id }),
      ...(input.company_id !== undefined && { company_id: input.company_id }),
      ...(input.expected_close_date !== undefined && { expected_close_date: input.expected_close_date }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.lost_reason !== undefined && { lost_reason: input.lost_reason.trim() }),
      ...(input.is_favorite !== undefined && { is_favorite: input.is_favorite }),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const payload: Record<string, unknown> = {};
      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.value !== undefined) payload.value = Number(input.value) || 0;
      if (input.stage !== undefined) payload.stage = input.stage;
      if (input.customer_id !== undefined) payload.customer_id = input.customer_id || null;
      if (input.company_id !== undefined) payload.company_id = input.company_id || null;
      if (input.expected_close_date !== undefined) payload.expected_close_date = input.expected_close_date || null;
      if (input.description !== undefined) payload.description = input.description.trim() || null;
      if (input.lost_reason !== undefined) payload.lost_reason = input.lost_reason.trim() || null;
      if (input.is_favorite !== undefined) payload.is_favorite = input.is_favorite;

      const { data, error } = await supabase
        .from('deals')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const res = data as Deal;
        saveLocalDeals(current.map(d => (d.id === id ? res : d)));
        return res;
      }
    }

    saveLocalDeals(current.map(d => (d.id === id ? updated : d)));
    return updated;
  },

  async updateStage(id: string, stage: DealStage, lostReason?: string): Promise<Deal> {
    return this.update(id, { stage, ...(lostReason ? { lost_reason: lostReason } : {}) });
  },

  async toggleFavorite(id: string, currentFav: boolean): Promise<boolean> {
    const next = !currentFav;
    await this.update(id, { is_favorite: next });
    return next;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    }
    const current = getLocalDeals();
    saveLocalDeals(current.filter(d => d.id !== id));
  },
};
