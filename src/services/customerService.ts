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

    const { data, error } = await supabase
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

    if (error) {
      throw new Error(error.message);
    }

    return data as Customer;
  },

  async update(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const payload: Record<string, string> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.email !== undefined) payload.email = input.email.trim().toLowerCase();
    if (input.phone !== undefined) payload.phone = input.phone.trim();
    if (input.company !== undefined) payload.company = input.company.trim();
    if (input.status !== undefined) payload.status = input.status;

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
