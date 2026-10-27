import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Company, CompanyInput } from '../types/crm';

const LOCAL_STORAGE_KEY = 'minicrm_companies_cache';

function getLocalCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCompanies(companies: Company[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companies));
  } catch {
    // ignore
  }
}

export const companyService = {
  async getAll(): Promise<Company[]> {
    if (!isSupabaseConfigured) {
      return getLocalCompanies();
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Supabase companies table query failed, reading local cache:', error.message);
        return getLocalCompanies();
      }

      const cloudCompanies = (data as Company[]) || [];
      const localCompanies = getLocalCompanies();

      // Case 1: Cloud returned records. Merge cloud and local-only records to avoid duplicates.
      if (cloudCompanies.length > 0) {
        const cloudIds = new Set(cloudCompanies.map(c => c.id));
        const localOnly = localCompanies.filter(c => !cloudIds.has(c.id));
        const merged = [...cloudCompanies, ...localOnly];
        saveLocalCompanies(merged);
        return merged;
      }

      // Case 2: Cloud returned 0 records, but local cache has records.
      // Prevent data loss: preserve local cache and attempt safe cloud reconciliation.
      if (localCompanies.length > 0) {
        console.warn('Cloud returned 0 companies but local cache has records. Preserving cache and attempting safe cloud synchronization.');
        try {
          const synced = await this.migrateLocalToCloud(localCompanies);
          if (synced && synced.length > 0) {
            saveLocalCompanies(synced);
            return synced;
          }
        } catch (syncErr: any) {
          console.error('Failed to synchronize local companies cache to cloud:', syncErr?.message || syncErr);
        }
        return localCompanies;
      }

      // Case 3: Both are empty
      saveLocalCompanies([]);
      return [];
    } catch (err: any) {
      console.error('Unexpected error fetching companies from cloud:', err?.message || err);
      return getLocalCompanies();
    }
  },

  async migrateLocalToCloud(localCompanies: Company[]): Promise<Company[]> {
    if (!isSupabaseConfigured || localCompanies.length === 0) {
      return localCompanies;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return localCompanies;
    }

    const migrated: Company[] = [];
    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val) : false;

    for (const comp of localCompanies) {
      try {
        const payload: Record<string, unknown> = {
          name: comp.name.trim(),
          domain: comp.domain?.trim() || null,
          industry: comp.industry?.trim() || null,
          size: comp.size?.trim() || null,
          phone: comp.phone?.trim() || null,
          notes: comp.notes?.trim() || null,
          user_id: comp.user_id && isValidUuid(comp.user_id) ? comp.user_id : user.id,
        };

        if (isValidUuid(comp.id)) {
          payload.id = comp.id;
        }

        const { data, error } = await supabase
          .from('companies')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) {
          console.error(`Cloud synchronization failed for company "${comp.name}":`, error.message);
          migrated.push(comp);
        } else if (data) {
          migrated.push(data as Company);
        }
      } catch (err: any) {
        console.error(`Cloud synchronization exception for company "${comp.name}":`, err?.message || err);
        migrated.push(comp);
      }
    }

    return migrated.length > 0 ? migrated : localCompanies;
  },

  async create(input: CompanyInput, userId: string): Promise<Company> {
    const newCompany: Company = {
      id: crypto.randomUUID ? crypto.randomUUID() : `company-${Date.now()}`,
      user_id: userId,
      name: input.name.trim(),
      domain: input.domain?.trim(),
      industry: input.industry?.trim(),
      size: input.size?.trim(),
      phone: input.phone?.trim(),
      notes: input.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('companies')
        .insert([
          {
            user_id: userId,
            name: newCompany.name,
            domain: newCompany.domain || null,
            industry: newCompany.industry || null,
            size: newCompany.size || null,
            phone: newCompany.phone || null,
            notes: newCompany.notes || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const created = data as Company;
        const current = getLocalCompanies();
        saveLocalCompanies([created, ...current.filter(c => c.id !== created.id)]);
        return created;
      }
    }

    const current = getLocalCompanies();
    saveLocalCompanies([newCompany, ...current]);
    return newCompany;
  },

  async update(id: string, input: Partial<CompanyInput>): Promise<Company> {
    const current = getLocalCompanies();
    const existing = current.find(c => c.id === id);

    const updated: Company = {
      ...(existing || {
        id,
        user_id: '',
        name: '',
        created_at: new Date().toISOString(),
      }),
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.domain !== undefined && { domain: input.domain.trim() }),
      ...(input.industry !== undefined && { industry: input.industry.trim() }),
      ...(input.size !== undefined && { size: input.size.trim() }),
      ...(input.phone !== undefined && { phone: input.phone.trim() }),
      ...(input.notes !== undefined && { notes: input.notes.trim() }),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const payload: Record<string, unknown> = {};
      if (input.name !== undefined) payload.name = input.name.trim();
      if (input.domain !== undefined) payload.domain = input.domain.trim() || null;
      if (input.industry !== undefined) payload.industry = input.industry.trim() || null;
      if (input.size !== undefined) payload.size = input.size.trim() || null;
      if (input.phone !== undefined) payload.phone = input.phone.trim() || null;
      if (input.notes !== undefined) payload.notes = input.notes.trim() || null;

      const { data, error } = await supabase
        .from('companies')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const res = data as Company;
        saveLocalCompanies(current.map(c => (c.id === id ? res : c)));
        return res;
      }
    }

    saveLocalCompanies(current.map(c => (c.id === id ? updated : c)));
    return updated;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    }
    const current = getLocalCompanies();
    saveLocalCompanies(current.filter(c => c.id !== id));
  },
};
