import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';
import {
  currentOrgId,
  debugUserStatus,
  ensureUserInitialized,
} from '@/lib/workspace';
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

        // Check if user is authenticated
        const {
          data: { user },
          error: authError,
        } = await client.auth.getUser();
        if (authError || !user) {
          console.error('User not authenticated:', authError);
          throw new Error('Please sign in to create tasks');
        }

        // Ensure user is properly initialized with organization and membership
        console.log('Ensuring user is initialized...');
        await ensureUserInitialized();

        // Debug user status for troubleshooting
        await debugUserStatus();

        // Get the current organization ID
        const org_id = await currentOrgId();
        console.log('Creating task with org_id:', org_id, 'payload:', payload);

        // Create the task
        const { data: newTask, error: supabaseError } = await client
          .from('tasks')
          .insert({
            org_id,
            status: 'todo',
            position: 0,
            ...payload,
          })
          .select()
          .single();

        if (supabaseError) {
          console.error('Supabase error creating task:', supabaseError);
          throw supabaseError;
        }

        console.log('Task created successfully:', newTask);
        return newTask;
      } catch (error) {
        console.error('Error creating task:', error);

        // If it's a database error, don't fall back to mock
        if (isSupabaseConfigured()) {
          throw error;
        }

        // Only use mock for non-database scenarios
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
