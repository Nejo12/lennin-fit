import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { currentOrgId } from '@/lib/workspace';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  priority: string;
  due_date: string;
  position: number;
}

interface CreateTaskParams {
  title: string;
  due_date: string;
}

interface UpdateTaskParams {
  id: string;
  status?: 'todo' | 'doing' | 'done' | 'blocked';
  due_date?: string;
}

interface ReorderDayParams {
  due_date: string;
  orderedIds: string[];
}

export function useTasksInRange(startISO: string, endISO: string) {
  return useQuery({
    queryKey: ['tasks-range', startISO, endISO],
    queryFn: async (): Promise<Task[]> => {
      if (!isSupabaseConfigured()) return [];
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('tasks')
        .select('id, title, status, priority, due_date, position')
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
    mutationFn: async (params: CreateTaskParams): Promise<void> => {
      const db = getSupabaseClient();

      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await db.auth.getUser();
      if (authError || !user) {
        console.error('User not authenticated:', authError);
        throw new Error('Please sign in to create tasks');
      }

      // Ensure user has membership
      const { error: membershipError } = await db.rpc('ensure_membership');
      if (membershipError) {
        console.error('Failed to ensure membership:', membershipError);
      }

      const org_id = await currentOrgId();
      const { error } = await db.from('tasks').insert({
        org_id,
        title: params.title,
        due_date: params.due_date,
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
    mutationFn: async (params: UpdateTaskParams): Promise<void> => {
      const db = getSupabaseClient();
      const { error } = await db
        .from('tasks')
        .update(params)
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-range'] }),
  });
}

export function useReorderDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: ReorderDayParams): Promise<void> => {
      const db = getSupabaseClient();
      const updates = params.orderedIds.map((id, idx) => ({
        id,
        position: idx,
      }));
      const { error } = await db
        .from('tasks')
        .upsert(updates, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-range'] }),
  });
}
