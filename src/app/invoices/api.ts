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
      return data ?? [];
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
      return data!.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useInvoiceItems(invoice_id: string) {
  return useQuery({
    queryKey: ['invoice_items', invoice_id],
    queryFn: async () => {
      if (!invoice_id) return [];
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('invoice_items')
        .select('id, description, quantity, unit_price, amount')
        .eq('invoice_id', invoice_id)
        .order('id', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!invoice_id,
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      invoice_id: string;
      description: string;
      quantity?: number;
      unit_price?: number;
    }) => {
      const db = getSupabaseClient();
      const org_id = await currentOrgId();
      const { error } = await db.from('invoice_items').insert({ org_id, ...p });
      if (error) throw error;
    },
    onSuccess: (_res, p) =>
      qc.invalidateQueries({ queryKey: ['invoice_items', p.invoice_id] }),
  });
}

interface InvoiceSuggestionContext {
  clientName: string;
  previousItems?: Array<{ description: string; unit_price: number }>;
  recentTasks?: Array<{ title: string }>;
  currency?: string;
}

export async function suggestInvoice(ctx: InvoiceSuggestionContext) {
  const res = await fetch('/.netlify/functions/ai-suggest-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx),
  });
  return await res.json();
}
