import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NotificationItem, Task, Meeting, Deal } from '../types/crm';

const LOCAL_STORAGE_KEY = 'minicrm_notifications_cache';

function getLocalNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(items: NotificationItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const notificationService = {
  async getAll(): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured) {
      return getLocalNotifications();
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return getLocalNotifications();
      }

      const notifs = (data as NotificationItem[]) || [];
      saveLocalNotifications(notifs);
      return notifs;
    } catch {
      return getLocalNotifications();
    }
  },

  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
      } catch {
        // ignore
      }
    }

    const current = getLocalNotifications();
    saveLocalNotifications(current.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  },

  async markAllAsRead(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('is_read', false);
      } catch {
        // ignore
      }
    }

    const current = getLocalNotifications();
    saveLocalNotifications(current.map(n => ({ ...n, is_read: true })));
  },

  async create(item: Omit<NotificationItem, 'id' | 'created_at'>): Promise<NotificationItem> {
    const newItem: NotificationItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}-${Math.random()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('notifications')
        .insert([newItem])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const created = data as NotificationItem;
        const current = getLocalNotifications();
        saveLocalNotifications([created, ...current]);
        return created;
      }
    }

    const current = getLocalNotifications();
    saveLocalNotifications([newItem, ...current]);
    return newItem;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    }
    const current = getLocalNotifications();
    saveLocalNotifications(current.filter(n => n.id !== id));
  },

  /**
   * Evaluates application state (tasks, meetings, deals) to populate realistic notifications
   * without duplicating existing events.
   */
  async syncSystemNotifications(
    userId: string,
    tasks: Task[],
    meetings: Meeting[],
    deals: Deal[]
  ): Promise<NotificationItem[]> {
    const existing = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    const generated: NotificationItem[] = [];

    // 1. Overdue Tasks
    for (const task of tasks) {
      if (task.status !== 'completed' && task.due_date < today) {
        const titleKey = `Overdue Task: ${task.title}`;
        const alreadyExists = existing.some(e => e.title === titleKey && e.link_id === task.id);
        if (!alreadyExists) {
          generated.push({
            id: `sys-task-overdue-${task.id}`,
            user_id: userId,
            title: titleKey,
            message: `Task was due on ${task.due_date}. Please update or complete it.`,
            type: 'task_overdue',
            link_page: 'tasks',
            link_id: task.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      } else if (task.status !== 'completed' && task.due_date === today) {
        const titleKey = `Task Due Today: ${task.title}`;
        const alreadyExists = existing.some(e => e.title === titleKey && e.link_id === task.id);
        if (!alreadyExists) {
          generated.push({
            id: `sys-task-due-${task.id}`,
            user_id: userId,
            title: titleKey,
            message: `Task is scheduled for completion today.`,
            type: 'task_due',
            link_page: 'tasks',
            link_id: task.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 2. Upcoming Meetings
    for (const meeting of meetings) {
      if (meeting.status === 'scheduled' && meeting.date >= today) {
        const titleKey = `Upcoming Meeting: ${meeting.title}`;
        const alreadyExists = existing.some(e => e.title === titleKey && e.link_id === meeting.id);
        if (!alreadyExists) {
          generated.push({
            id: `sys-meet-${meeting.id}`,
            user_id: userId,
            title: titleKey,
            message: `${meeting.meeting_type} scheduled on ${meeting.date} at ${meeting.start_time}.`,
            type: 'meeting_upcoming',
            link_page: 'calendar',
            link_id: meeting.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 3. Won Deals
    for (const deal of deals) {
      if (deal.stage === 'Won') {
        const titleKey = `Deal Won: ${deal.title}`;
        const alreadyExists = existing.some(e => e.title === titleKey && e.link_id === deal.id);
        if (!alreadyExists) {
          generated.push({
            id: `sys-deal-won-${deal.id}`,
            user_id: userId,
            title: titleKey,
            message: `Congratulations! Closed deal with value $${Number(deal.value).toLocaleString()}.`,
            type: 'deal_won',
            link_page: 'pipeline',
            link_id: deal.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    if (generated.length > 0) {
      if (isSupabaseConfigured) {
        try {
          const dbPayloads = generated.map(({ id: _id, ...rest }) => ({
            ...rest,
            user_id: userId,
          }));
          const { data, error } = await supabase
            .from('notifications')
            .insert(dbPayloads)
            .select();
          if (!error && data && data.length > 0) {
            const combined = [...(data as NotificationItem[]), ...existing];
            saveLocalNotifications(combined);
            return combined;
          }
        } catch {
          // fallback to local below
        }
      }

      const combined = [...generated, ...existing];
      saveLocalNotifications(combined);
      return combined;
    }

    return existing;
  },
};
