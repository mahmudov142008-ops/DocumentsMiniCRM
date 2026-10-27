import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types/crm';

export const profileService = {
  /**
   * Fetches the user profile from public.profiles
   * Only reads columns supported by schema.sql (id, email, full_name, created_at)
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile | null;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  },

  /**
   * Updates only supported fields on public.profiles (full_name)
   * Also synchronizes with Supabase auth metadata so sidebar/header updates instantly.
   */
  async updateProfile(userId: string, fullName: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are not configured.');
    }

    const trimmed = fullName.trim();

    // 1. Update public.profiles row
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    // 2. Sync with Supabase Auth metadata
    try {
      await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
    } catch (err) {
      console.warn('Could not synchronize auth user metadata:', err);
    }
  },
};
