import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Meeting, MeetingInput } from '../types/crm';

const LOCAL_STORAGE_KEY = 'minicrm_meetings_cache';

function getLocalMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMeetings(meetings: Meeting[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meetings));
  } catch {
    // ignore
  }
}

export const meetingService = {
  async getAll(): Promise<Meeting[]> {
    if (!isSupabaseConfigured) {
      return getLocalMeetings();
    }

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.warn('Supabase meetings table query failed, reading local cache:', error.message);
        return getLocalMeetings();
      }

      const cloudMeetings = (data as Meeting[]) || [];
      const localMeetings = getLocalMeetings();

      // Case 1: Cloud returned records. Merge cloud and local-only records to avoid duplicates.
      if (cloudMeetings.length > 0) {
        const cloudIds = new Set(cloudMeetings.map(m => m.id));
        const localOnly = localMeetings.filter(m => !cloudIds.has(m.id));
        const merged = [...cloudMeetings, ...localOnly];
        saveLocalMeetings(merged);
        return merged;
      }

      // Case 2: Cloud returned 0 records, but local cache has records.
      // Prevent data loss: preserve local cache and attempt safe cloud reconciliation.
      if (localMeetings.length > 0) {
        console.warn('Cloud returned 0 meetings but local cache has records. Preserving cache and attempting safe cloud synchronization.');
        try {
          const synced = await this.migrateLocalToCloud(localMeetings);
          if (synced && synced.length > 0) {
            saveLocalMeetings(synced);
            return synced;
          }
        } catch (syncErr: any) {
          console.error('Failed to synchronize local meetings cache to cloud:', syncErr?.message || syncErr);
        }
        return localMeetings;
      }

      // Case 3: Both are empty
      saveLocalMeetings([]);
      return [];
    } catch (err: any) {
      console.error('Unexpected error fetching meetings from cloud:', err?.message || err);
      return getLocalMeetings();
    }
  },

  async migrateLocalToCloud(localMeetings: Meeting[]): Promise<Meeting[]> {
    if (!isSupabaseConfigured || localMeetings.length === 0) {
      return localMeetings;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return localMeetings;
    }

    const migrated: Meeting[] = [];
    const isValidUuid = (val?: string) =>
      val ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val) : false;

    for (const meet of localMeetings) {
      try {
        const payload: Record<string, unknown> = {
          user_id: meet.user_id && isValidUuid(meet.user_id) ? meet.user_id : user.id,
          title: meet.title.trim(),
          description: meet.description?.trim() || null,
          date: meet.date,
          start_time: meet.start_time,
          end_time: meet.end_time,
          meeting_type: meet.meeting_type || 'Discovery',
          status: meet.status || 'scheduled',
          customer_id: isValidUuid(meet.customer_id) ? meet.customer_id : null,
          deal_id: isValidUuid(meet.deal_id) ? meet.deal_id : null,
        };

        if (isValidUuid(meet.id)) {
          payload.id = meet.id;
        }

        const { data, error } = await supabase
          .from('meetings')
          .upsert(payload, { onConflict: 'id' })
          .select()
          .single();

        if (error) {
          console.error(`Cloud synchronization failed for meeting "${meet.title}":`, error.message);
          migrated.push(meet);
        } else if (data) {
          migrated.push(data as Meeting);
        }
      } catch (err: any) {
        console.error(`Cloud synchronization exception for meeting "${meet.title}":`, err?.message || err);
        migrated.push(meet);
      }
    }

    return migrated.length > 0 ? migrated : localMeetings;
  },

  async create(input: MeetingInput, userId: string): Promise<Meeting> {
    if (input.start_time >= input.end_time) {
      throw new Error('Meeting end time must be after start time.');
    }

    const newMeeting: Meeting = {
      id: crypto.randomUUID ? crypto.randomUUID() : `meeting-${Date.now()}`,
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim(),
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      meeting_type: input.meeting_type || 'Discovery',
      status: input.status || 'scheduled',
      customer_id: input.customer_id,
      deal_id: input.deal_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('meetings')
        .insert([
          {
            user_id: userId,
            title: newMeeting.title,
            description: newMeeting.description || null,
            date: newMeeting.date,
            start_time: newMeeting.start_time,
            end_time: newMeeting.end_time,
            meeting_type: newMeeting.meeting_type,
            status: newMeeting.status,
            customer_id: newMeeting.customer_id || null,
            deal_id: newMeeting.deal_id || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const created = data as Meeting;
        const current = getLocalMeetings();
        saveLocalMeetings([created, ...current.filter(m => m.id !== created.id)]);
        return created;
      }
    }

    const current = getLocalMeetings();
    saveLocalMeetings([newMeeting, ...current]);
    return newMeeting;
  },

  async update(id: string, input: Partial<MeetingInput>): Promise<Meeting> {
    const current = getLocalMeetings();
    const existing = current.find(m => m.id === id);

    // Validate start/end time using merged values so partial updates are also caught
    const effectiveStart = input.start_time ?? existing?.start_time ?? '00:00';
    const effectiveEnd   = input.end_time   ?? existing?.end_time   ?? '23:59';
    if (input.start_time !== undefined || input.end_time !== undefined) {
      if (effectiveStart >= effectiveEnd) {
        throw new Error('Meeting end time must be after start time.');
      }
    }

    const updated: Meeting = {
      ...(existing || {
        id,
        user_id: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00',
        meeting_type: 'Discovery',
        status: 'scheduled',
        created_at: new Date().toISOString(),
      }),
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.start_time !== undefined && { start_time: input.start_time }),
      ...(input.end_time !== undefined && { end_time: input.end_time }),
      ...(input.meeting_type !== undefined && { meeting_type: input.meeting_type }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.customer_id !== undefined && { customer_id: input.customer_id }),
      ...(input.deal_id !== undefined && { deal_id: input.deal_id }),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const payload: Record<string, unknown> = {};
      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.description !== undefined) payload.description = input.description.trim() || null;
      if (input.date !== undefined) payload.date = input.date;
      if (input.start_time !== undefined) payload.start_time = input.start_time;
      if (input.end_time !== undefined) payload.end_time = input.end_time;
      if (input.meeting_type !== undefined) payload.meeting_type = input.meeting_type;
      if (input.status !== undefined) payload.status = input.status;
      if (input.customer_id !== undefined) payload.customer_id = input.customer_id || null;
      if (input.deal_id !== undefined) payload.deal_id = input.deal_id || null;

      const { data, error } = await supabase
        .from('meetings')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const res = data as Meeting;
        saveLocalMeetings(current.map(m => (m.id === id ? res : m)));
        return res;
      }
    }

    saveLocalMeetings(current.map(m => (m.id === id ? updated : m)));
    return updated;
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    }
    const current = getLocalMeetings();
    saveLocalMeetings(current.filter(m => m.id !== id));
  },
};
