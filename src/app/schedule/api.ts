import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { currentOrgId } from '@/lib/workspace';

/** Existing range loader */
export function useTasksInRange(startISO: string, endISO: string) {
  return useQuery({
    queryKey: ['tasks-range', startISO, endISO],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('tasks')
        .select(
          'id, title, description, status, priority, due_date, position, recur_rule, recur_interval, recur_count, recur_until'
        )
        .gte('due_date', startISO)
        .lt('due_date', endISO)
        .order('due_date', { ascending: true })
        .order('position', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateTaskQuick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { title: string; due_date: string }) => {
      const db = getSupabaseClient();
      const org_id = await currentOrgId();
      const { error } = await db.from('tasks').insert({
        org_id,
        title: p.title,
        due_date: p.due_date,
        status: 'todo',
        priority: 'medium',
        position: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-range'] }),
  });
}

export function useUpdateTaskQuick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: string;
      status?: 'todo' | 'doing' | 'done' | 'blocked';
      due_date?: string;
      title?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      description?: string;
      recur_rule?: 'WEEKLY' | 'MONTHLY' | null;
      recur_interval?: number | null;
      recur_count?: number | null;
      recur_until?: string | null;
    }) => {
      const db = getSupabaseClient();
      const { error } = await db.from('tasks').update(p).eq('id', p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-range'] }),
  });
}

/** Reorder within one day */
export function useReorderDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { due_date: string; orderedIds: string[] }) => {
      const db = getSupabaseClient();
      const updates = p.orderedIds.map((id, idx) => ({ id, position: idx }));
      const { error } = await db
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-range'] }),
  });
}

/** Move across days + reorder both */
export function useMoveTaskAcrossDays() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      taskId: string;
      fromDate: string;
      toDate: string;
      fromOrderedIds: string[];
      toOrderedIds: string[]; // new final orders (to includes taskId)
    }) => {
      const db = getSupabaseClient();

      // Build upserts: set new positions; set due_date for moved task
      const updates: Array<{
        id: string;
        position: number;
        due_date?: string;
      }> = [];
      p.fromOrderedIds.forEach((id, idx) =>
        updates.push({ id, position: idx })
      );
      p.toOrderedIds.forEach((id, idx) => {
        if (id === p.taskId)
          updates.push({ id, position: idx, due_date: p.toDate });
        else updates.push({ id, position: idx });
      });

      const { error } = await db
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-range'] }),
  });
}

/** Fetch a single task (details modal) */
export function useTaskDetails(id: string | null) {
  return useQuery({
    queryKey: ['task', id],
    enabled: !!id,
    queryFn: async () => {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('tasks')
        .select(
          'id, title, description, status, priority, due_date, recur_rule, recur_interval, recur_count, recur_until'
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
