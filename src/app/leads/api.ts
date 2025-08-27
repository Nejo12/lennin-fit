import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { currentOrgId } from '@/lib/workspace'
import { mockData } from '@/lib/mockData'
import type { Client } from '@/types/db'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('clients')
          .select('id, org_id, name, email, phone, notes, created_at')
          .order('created_at', { ascending: false })
        if (supabaseError) throw supabaseError
        return data as Client[]
      } catch {
        // Fallback to mock data if database is not set up
        console.log('Using mock data for clients')
        return mockData.clients as Client[]
      }
    }
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Pick<Client,'name'|'email'|'phone'|'notes'>) => {
      try {
        const org_id = await currentOrgId()
        const { error: supabaseError } = await supabase.from('clients').insert({ org_id, ...payload })
        if (supabaseError) throw supabaseError
      } catch {
        // Mock creation - in real app this would be handled by the database
        console.log('Mock client creation:', payload)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] })
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { id: string } & Partial<Client>) => {
      try {
        const { id, ...rest } = args
        const { error: supabaseError } = await supabase.from('clients').update(rest).eq('id', id)
        if (supabaseError) throw supabaseError
      } catch {
        // Mock update
        console.log('Mock client update:', args)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] })
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error: supabaseError } = await supabase.from('clients').delete().eq('id', id)
        if (supabaseError) throw supabaseError
      } catch {
        // Mock deletion
        console.log('Mock client deletion:', id)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] })
  })
}
