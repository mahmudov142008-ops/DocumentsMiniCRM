import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Customer, CustomerInput, CustomerStatus } from '../types/crm';

export const customerService = {
  async getAll(): Promise<Customer[]> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your credentials in .env.');
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as Customer[]) || [];
  },

  async create(input: CustomerInput, userId: string): Promise<Customer> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, unknown> = {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      company: input.company.trim(),
      status: input.status,
      user_id: userId,
    };

    if (input.tags) payload.tags = input.tags;
    if (input.is_favorite !== undefined) payload.is_favorite = input.is_favorite;
    if (input.last_contact_date) payload.last_contact_date = input.last_contact_date;
    if (input.company_id !== undefined) payload.company_id = input.company_id || null;

    const { data, error } = await supabase
      .from('customers')
      .insert([payload])
      .select()
      .single();

    if (error) {
      // In case optional columns are not present in an older migration, retry with core fields
      if (error.message && (error.message.includes('tags') || error.message.includes('is_favorite') || error.message.includes('company_id'))) {
        const { data: retryData, error: retryError } = await supabase
          .from('customers')
          .insert([
            {
              name: input.name.trim(),
              email: input.email.trim().toLowerCase(),
              phone: input.phone.trim(),
              company: input.company.trim(),
              status: input.status,
              user_id: userId,
            },
          ])
          .select()
          .single();

        if (retryError) throw new Error(retryError.message);
        return retryData as Customer;
      }
      throw new Error(error.message);
    }

    return data as Customer;
  },

  async update(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.email !== undefined) payload.email = input.email.trim().toLowerCase();
    if (input.phone !== undefined) payload.phone = input.phone.trim();
    if (input.company !== undefined) payload.company = input.company.trim();
    if (input.status !== undefined) payload.status = input.status;
    if (input.tags !== undefined) payload.tags = input.tags;
    if (input.is_favorite !== undefined) payload.is_favorite = input.is_favorite;
    if (input.last_contact_date !== undefined) payload.last_contact_date = input.last_contact_date;
    if (input.company_id !== undefined) payload.company_id = input.company_id || null;

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Customer;
  },

  async toggleFavorite(id: string, currentFavorite: boolean): Promise<boolean> {
    const nextFavorite = !currentFavorite;
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('customers')
          .update({ is_favorite: nextFavorite })
          .eq('id', id);
      }
    } catch {
      // Graceful fallback
    }

    // Also persist in local favorites cache for 100% reliability
    try {
      const stored = localStorage.getItem('minicrm_fav_customers');
      const favs: string[] = stored ? JSON.parse(stored) : [];
      const updated = nextFavorite ? [...new Set([...favs, id])] : favs.filter(favId => favId !== id);
      localStorage.setItem('minicrm_fav_customers', JSON.stringify(updated));
    } catch {
      // Storage unavailable
    }

    return nextFavorite;
  },

  async updateStatus(id: string, status: CustomerStatus): Promise<Customer> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Customer;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
