import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Workspace } from '../types/crm';

const ACTIVE_WS_KEY = 'minicrm_active_workspace_id';
const LOCAL_WS_KEY = 'minicrm_workspaces_cache';

function getLocalWorkspaces(userId: string): Workspace[] {
  try {
    const raw = localStorage.getItem(LOCAL_WS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  // Default personal workspace
  const defaultWs: Workspace = {
    id: `ws-personal-${userId}`,
    name: 'Personal Workspace',
    type: 'personal',
    owner_id: userId,
    role: 'owner',
    created_at: new Date().toISOString(),
  };

  try {
    localStorage.setItem(LOCAL_WS_KEY, JSON.stringify([defaultWs]));
  } catch {
    // ignore
  }

  return [defaultWs];
}

export const workspaceService = {
  async getWorkspaces(userId: string): Promise<Workspace[]> {
    if (!isSupabaseConfigured) {
      return getLocalWorkspaces(userId);
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*');

      if (error || !data || data.length === 0) {
        return getLocalWorkspaces(userId);
      }

      const workspaces = data.map(w => ({
        id: w.id,
        name: w.name,
        type: w.type as 'personal' | 'team',
        owner_id: w.owner_id,
        role: (w.owner_id === userId ? 'owner' : 'member') as 'owner' | 'admin' | 'member',
        created_at: w.created_at,
      }));

      return workspaces;
    } catch {
      return getLocalWorkspaces(userId);
    }
  },

  async createWorkspace(name: string, type: 'personal' | 'team', userId: string): Promise<Workspace> {
    const newWs: Workspace = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ws-${Date.now()}`,
      name: name.trim(),
      type,
      owner_id: userId,
      role: 'owner',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .insert([
            {
              name: newWs.name,
              type: newWs.type,
              owner_id: userId,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          const ws: Workspace = {
            id: data.id,
            name: data.name,
            type: data.type,
            owner_id: data.owner_id,
            role: 'owner',
            created_at: data.created_at,
          };
          this.setActiveWorkspaceId(ws.id);
          return ws;
        }
      } catch {
        // ignore
      }
    }

    const current = getLocalWorkspaces(userId);
    const updated = [...current, newWs];
    try {
      localStorage.setItem(LOCAL_WS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    this.setActiveWorkspaceId(newWs.id);
    return newWs;
  },

  getActiveWorkspaceId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_WS_KEY);
    } catch {
      return null;
    }
  },

  setActiveWorkspaceId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_WS_KEY, id);
    } catch {
      // ignore
    }
  },
};
