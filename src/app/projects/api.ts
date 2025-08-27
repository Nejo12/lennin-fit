import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/db'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, org_id, client_id, name, status, due_date, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Project[]
    }
  })
}
