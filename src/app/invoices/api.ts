import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { currentOrgId } from '@/lib/workspace';

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('invoices')
        .select(
          'id, client_id, due_date, status, amount_total, notes, created_at'
        )
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      client_id?: string | null;
      due_date?: string | null;
      notes?: string | null;
    }) => {
      const db = getSupabaseClient();
      const org_id = await currentOrgId();
      const { data, error } = await db
        .from('invoices')
        .insert({ org_id, status: 'draft', ...payload })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useInvoiceItems(invoice_id: string) {
  return useQuery({
    queryKey: ['invoice_items', invoice_id],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return [];
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('invoice_items')
        .select('id, description, quantity, unit_price, amount')
        .eq('invoice_id', invoice_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!invoice_id,
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      invoice_id: string;
      description: string;
      quantity?: number;
      unit_price?: number;
    }) => {
      const db = getSupabaseClient();
      const org_id = await currentOrgId();
      const { error } = await db
        .from('invoice_items')
        .insert({ org_id, ...payload });
      if (error) throw error;
    },
    onSuccess: (_r, v) =>
      qc.invalidateQueries({ queryKey: ['invoice_items', v.invoice_id] }),
  });
}
