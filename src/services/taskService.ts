import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskInput } from '../types/crm';

const LOCAL_STORAGE_KEY = 'minicrm_tasks_cache';

function getLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: Task[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export const taskService = {
  async getAll(): Promise<Task[]> {
    if (!isSupabaseConfigured) {
      return getLocalTasks();
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.warn('Supabase tasks table query failed, reading local cache:', error.message);
        return getLocalTasks();
      }

      const cloudTasks = (data as Task[]) || [];
      const localTasks = getLocalTasks();

      // Case 1: Cloud returned records. Merge cloud and local-only records to avoid duplicates.
      if (cloudTasks.length > 0) {
        const cloudIds = new Set(cloudTasks.map(t => t.id));
        const localOnly = localTasks.filter(t => !cloudIds.has(t.id));
        const merged = [...cloudTasks, ...localOnly];
        saveLocalTasks(merged);
        return merged;
      }

      // Case 2: Cloud returned 0 records, but local cache has records.
      // Prevent data loss: preserve local cache and attempt safe cloud reconciliation.
      if (localTasks.length > 0) {
        console.warn('Cloud returned 0 tasks but local cache has records. Preserving cache and attempting safe cloud synchronization.');
        try {
          const synced = await this.migrateLocalToCloud(localTasks);
          if (synced && synced.length > 0) {
            saveLocalTasks(synced);
            return synced;
          }
        } catch (syncErr: any) {
          console.error('Failed to synchronize local tasks cache to cloud:', syncErr?.message || syncErr);
        }
        return localTasks;
      }

      // Case 3: Both are empty
      saveLocalTasks([]);
      return [];
    } catch (err: any) {
      console.error('Unexpected error fetching tasks from cloud:', err?.message || err);
      return getLocalTasks();
    }
  },

  async migrateLocalToCloud(localTasks: Task[]): Promise<Task[]> {
    if (!isSupabaseConfigured || localTasks.length === 0) {
      return localTasks;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return localTasks;
    }

    const migrated: Task[] = [];
    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val) : false;

    for (const task of localTasks) {
      try {
        const payload: Record<string, unknown> = {
          user_id: task.user_id && isValidUuid(task.user_id) ? task.user_id : user.id,
          title: task.title.trim(),
          description: task.description?.trim() || null,
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          due_date: task.due_date,
          due_time: task.due_time || null,
          customer_id: isValidUuid(task.customer_id) ? task.customer_id : null,
          deal_id: isValidUuid(task.deal_id) ? task.deal_id : null,
        };

        if (isValidUuid(task.id)) {
          payload.id = task.id;
        }

        const { data, error } = await supabase
          .from('tasks')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) {
          console.error(`Cloud synchronization failed for task "${task.title}":`, error.message);
          migrated.push(task);
        } else if (data) {
          migrated.push(data as Task);
        }
      } catch (err: any) {
        console.error(`Cloud synchronization exception for task "${task.title}":`, err?.message || err);
        migrated.push(task);
      }
    }

    return migrated.length > 0 ? migrated : localTasks;
  },

  async create(input: TaskInput, userId: string): Promise<Task> {
    const newTask: Task = {
      id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority || 'medium',
      status: input.status || 'pending',
      due_date: input.due_date,
      due_time: input.due_time,
      customer_id: input.customer_id,
      deal_id: input.deal_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: userId,
            title: newTask.title,
            description: newTask.description || null,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.due_date,
            due_time: newTask.due_time || null,
            customer_id: newTask.customer_id || null,
            deal_id: newTask.deal_id || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const created = data as Task;
        const current = getLocalTasks();
        saveLocalTasks([created, ...current.filter(t => t.id !== created.id)]);
        return created;
      }
    }

    const current = getLocalTasks();
    saveLocalTasks([newTask, ...current]);
    return newTask;
  },

  async update(id: string, input: Partial<TaskInput>): Promise<Task> {
    const current = getLocalTasks();
    const existing = current.find(t => t.id === id);

    const updated: Task = {
      ...(existing || {
        id,
        user_id: '',
        title: '',
        priority: 'medium',
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      }),
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.status !== undefined && {
        status: input.status,
        completed_at: input.status === 'completed' ? new Date().toISOString() : undefined,
      }),
      ...(input.due_date !== undefined && { due_date: input.due_date }),
      ...(input.due_time !== undefined && { due_time: input.due_time }),
      ...(input.customer_id !== undefined && { customer_id: input.customer_id }),
      ...(input.deal_id !== undefined && { deal_id: input.deal_id }),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const payload: Record<string, unknown> = {};
      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.description !== undefined) payload.description = input.description.trim() || null;
      if (input.priority !== undefined) payload.priority = input.priority;
      if (input.status !== undefined) {
        payload.status = input.status;
        payload.completed_at = input.status === 'completed' ? new Date().toISOString() : null;
      }
      if (input.due_date !== undefined) payload.due_date = input.due_date;
      if (input.due_time !== undefined) payload.due_time = input.due_time || null;
      if (input.customer_id !== undefined) payload.customer_id = input.customer_id || null;
      if (input.deal_id !== undefined) payload.deal_id = input.deal_id || null;

      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const res = data as Task;
        saveLocalTasks(current.map(t => (t.id === id ? res : t)));
        return res;
      }
    }

    saveLocalTasks(current.map(t => (t.id === id ? updated : t)));
    return updated;
  },

  async toggleStatus(id: string, currentStatus: string): Promise<Task> {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return this.update(id, { status: nextStatus });
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    }
    const current = getLocalTasks();
    saveLocalTasks(current.filter(t => t.id !== id));
  },

  isOverdue(task: Task): boolean {
    if (task.status === 'completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date < today;
  },
};
