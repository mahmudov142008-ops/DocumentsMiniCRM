import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CustomerNote } from '../types/crm';

export const notesService = {
  async getByCustomerId(customerId: string): Promise<CustomerNote[]> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true }); // Chronological order

    if (error) {
      throw new Error(error.message);
    }

    return (data as CustomerNote[]) || [];
  },

  async create(customerId: string, content: string, userId: string): Promise<CustomerNote> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    if (!content.trim()) {
      throw new Error('Note content cannot be empty.');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          customer_id: customerId,
          content: content.trim(),
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as CustomerNote;
  },

  async delete(noteId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (error) {
      throw new Error(error.message);
    }
  },
};
