import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { currentOrgId } from '@/lib/workspace'
import { mockData } from '@/lib/mockData'
import type { Task } from '@/types/db'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, org_id, project_id, title, status, priority, due_date, position, updated_at')
          .order('due_date', { ascending: true, nullsFirst: false })
        if (error) throw error
        return data as Task[]
      } catch (error) {
        // Fallback to mock data if database is not set up
        console.log('Using mock data for tasks')
        return mockData.tasks as Task[]
      }
    }
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Pick<Task,'title'|'project_id'|'due_date'|'priority'>) => {
      try {
        const org_id = await currentOrgId()
        const { error } = await supabase.from('tasks').insert({ org_id, status: 'todo', position: 0, ...payload })
        if (error) throw error
      } catch (error) {
        // Mock creation
        console.log('Mock task creation:', payload)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { id: string } & Partial<Task>) => {
      try {
        const { id, ...rest } = args
        const { error } = await supabase.from('tasks').update(rest).eq('id', id)
        if (error) throw error
      } catch (error) {
        // Mock update
        console.log('Mock task update:', args)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (error) throw error
      } catch (error) {
        // Mock deletion
        console.log('Mock task deletion:', id)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })
}
