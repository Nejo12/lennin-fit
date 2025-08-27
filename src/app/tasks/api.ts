import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';
import { currentOrgId } from '@/lib/workspace';
import { mockData } from '@/lib/mockData';
import type { Task } from '@/types/db';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, using mock data for tasks');
          return mockData.tasks as Task[];
        }

        const client = getSupabaseClient();
        const { data, error: supabaseError } = await client
          .from('tasks')
          .select(
            'id, org_id, project_id, title, status, priority, due_date, position, updated_at'
          )
          .order('due_date', { ascending: true, nullsFirst: false });
        if (supabaseError) throw supabaseError;
        return data as Task[];
      } catch {
        // Fallback to mock data if database is not set up
        console.log('Using mock data for tasks');
        return mockData.tasks as Task[];
      }
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Pick<Task, 'title' | 'project_id' | 'due_date' | 'priority'>
    ) => {
      try {
        if (!isSupabaseConfigured()) {
          console.log('Mock task creation:', payload);
          return;
        }

        const client = getSupabaseClient();
        const org_id = await currentOrgId();
        const { error: supabaseError } = await client
          .from('tasks')
          .insert({ org_id, status: 'todo', position: 0, ...payload });
        if (supabaseError) throw supabaseError;
      } catch {
        // Mock creation
        console.log('Mock task creation:', payload);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string } & Partial<Task>) => {
      try {
        if (!isSupabaseConfigured()) {
          console.log('Mock task update:', args);
          return;
        }

        const client = getSupabaseClient();
        const { id, ...rest } = args;
        const { error: supabaseError } = await client
          .from('tasks')
          .update(rest)
          .eq('id', id);
        if (supabaseError) throw supabaseError;
      } catch {
        // Mock update
        console.log('Mock task update:', args);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        if (!isSupabaseConfigured()) {
          console.log('Mock task deletion:', id);
          return;
        }

        const client = getSupabaseClient();
        const { error: supabaseError } = await client
          .from('tasks')
          .delete()
          .eq('id', id);
        if (supabaseError) throw supabaseError;
      } catch {
        // Mock deletion
        console.log('Mock task deletion:', id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
