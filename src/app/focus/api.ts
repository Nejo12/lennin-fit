import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { startOfWeek, addDays, toISODate } from '@/app/schedule/date';

function todayISO(): string {
  return toISODate(new Date());
}

function inPast(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  // compare on date only
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return d < now;
}

interface InvoiceRow {
  id: string;
  client_id: string | null;
  amount_total: number | null;
  status: string;
  due_date: string | null;
}

interface InvoicePublicRow {
  id: string;
  client_id: string | null;
  amount_total: number | null;
  computed_status: string;
  due_date: string | null;
}

interface KpiData {
  unpaidTotal: number;
  overdueCount: number;
}

interface OverdueInvoice {
  id: string;
  client_id: string | null;
  amount_total: number;
  due_date: string | null;
  status: string;
  days_overdue: number;
  client_name: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  position: number;
}

interface WeekSummary {
  dueThisWeek: number;
  doneThisWeek: number;
}

export function useKpis() {
  return useQuery({
    queryKey: ['focus-kpis'],
    queryFn: async (): Promise<KpiData> => {
      if (!isSupabaseConfigured()) return { unpaidTotal: 0, overdueCount: 0 };

      const db = getSupabaseClient();
      // Try invoice_public first (has computed_status)
      try {
        const { data, error } = await db
          .from('invoice_public')
          .select('amount_total, computed_status, due_date');
        if (error) throw error;

        const rows = (data ?? []) as InvoicePublicRow[];
        const unpaidTotal = rows
          .filter(r => ['sent', 'overdue'].includes(r.computed_status))
          .reduce((s, r) => s + Number(r.amount_total || 0), 0);
        const overdueCount = rows.filter(
          r => r.computed_status === 'overdue'
        ).length;
        return { unpaidTotal, overdueCount };
      } catch {
        // Fallback: compute overdue locally from invoices
        const { data } = await db
          .from('invoices')
          .select('amount_total, status, due_date');
        const rows = (data ?? []) as InvoiceRow[];
        const unpaidTotal = rows
          .filter(r => ['sent', 'overdue'].includes(r.status))
          .reduce((s, r) => s + Number(r.amount_total || 0), 0);
        const overdueCount = rows.filter(
          r => ['sent', 'overdue'].includes(r.status) && inPast(r.due_date)
        ).length;
        return { unpaidTotal, overdueCount };
      }
    },
  });
}

export function useTopOverdue(limit = 3) {
  return useQuery({
    queryKey: ['focus-top-overdue', limit],
    queryFn: async (): Promise<OverdueInvoice[]> => {
      if (!isSupabaseConfigured()) return [];
      const db = getSupabaseClient();

      // Try joining clients for names (do in two queries to keep RLS simple)
      let rows: Array<{
        id: string;
        client_id: string | null;
        amount_total: number;
        due_date: string | null;
        status: string;
      }> = [];

      try {
        const { data, error } = await db
          .from('invoice_public')
          .select('id, client_id, amount_total, due_date, computed_status')
          .order('due_date', { ascending: true });
        if (error) throw error;
        rows = (data ?? []).map((r: InvoicePublicRow) => ({
          id: r.id,
          client_id: r.client_id,
          amount_total: Number(r.amount_total || 0),
          due_date: r.due_date,
          status: r.computed_status,
        }));
      } catch {
        const { data } = await db
          .from('invoices')
          .select('id, client_id, amount_total, due_date, status')
          .order('due_date', { ascending: true });
        rows = (data ?? []).map((r: InvoiceRow) => ({
          id: r.id,
          client_id: r.client_id,
          amount_total: Number(r.amount_total || 0),
          due_date: r.due_date,
          status: r.status,
        }));
      }

      const overdue = rows
        .filter(
          r => ['sent', 'overdue'].includes(r.status) && inPast(r.due_date)
        )
        .map(r => ({
          ...r,
          days_overdue: Math.max(
            0,
            Math.floor((+new Date() - +new Date(r.due_date || '')) / 86400000)
          ),
        }))
        .sort((a, b) => b.days_overdue - a.days_overdue)
        .slice(0, limit);

      // fetch client names (best-effort)
      const clientIds = Array.from(
        new Set(overdue.map(o => o.client_id).filter(Boolean))
      ) as string[];
      const names = new Map<string, string>();
      if (clientIds.length) {
        const { data: clients } = await getSupabaseClient()
          .from('clients')
          .select('id,name')
          .in('id', clientIds);
        (clients ?? []).forEach((c: { id: string; name: string }) =>
          names.set(c.id, c.name)
        );
      }
      return overdue.map(o => ({
        ...o,
        client_name: o.client_id
          ? names.get(o.client_id) || 'Client'
          : 'Client',
      }));
    },
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: ['focus-today'],
    queryFn: async (): Promise<Task[]> => {
      if (!isSupabaseConfigured()) return [];
      const db = getSupabaseClient();
      const today = todayISO();
      const { data, error } = await db
        .from('tasks')
        .select('id, title, status, priority, due_date, position')
        .eq('due_date', today)
        .neq('status', 'done')
        .order('position', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useWeekTasksSummary() {
  return useQuery({
    queryKey: ['focus-week'],
    queryFn: async (): Promise<WeekSummary> => {
      if (!isSupabaseConfigured()) return { dueThisWeek: 0, doneThisWeek: 0 };
      const db = getSupabaseClient();
      const start = startOfWeek(new Date());
      const end = addDays(start, 7);
      const { data, error } = await db
        .from('tasks')
        .select('status, due_date')
        .gte('due_date', toISODate(start))
        .lt('due_date', toISODate(end));
      if (error) throw error;
      const rows = data ?? [];
      return {
        dueThisWeek: rows.length,
        doneThisWeek: rows.filter(
          (r: { status: string }) => r.status === 'done'
        ).length,
      };
    },
  });
}

export function useToggleTaskDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; done: boolean }) => {
      const db = getSupabaseClient();
      const { error } = await db
        .from('tasks')
        .update({ status: p.done ? 'done' : 'todo' })
        .eq('id', p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['focus-today'] });
      qc.invalidateQueries({ queryKey: ['tasks-range'] });
      qc.invalidateQueries({ queryKey: ['focus-week'] });
    },
  });
}
