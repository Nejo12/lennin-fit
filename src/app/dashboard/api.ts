import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';

/** Fetches total count of active clients/leads */
export function useActiveLeadsCount() {
  return useQuery({
    queryKey: ['active-leads-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        return count ?? 0;
      } catch {
        // Fallback to mock data count
        return mockData.clients?.length ?? 0;
      }
    },
  });
}

/** Fetches count of tasks due today */
export function useTodayEventsCount() {
  return useQuery({
    queryKey: ['today-events-count'],
    queryFn: async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { count, error } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('due_date', today);
        if (error) throw error;
        return count ?? 0;
      } catch {
        // Fallback to mock data
        const today = new Date().toISOString().slice(0, 10);
        return mockData.tasks?.filter(t => t.due_date === today).length ?? 0;
      }
    },
  });
}

export function useUnpaidTotal() {
  return useQuery({
    queryKey: ['unpaid-total'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('amount_total, status')
          .in('status', ['sent', 'overdue']);
        if (error) throw error;
        return (data ?? []).reduce(
          (s, r) => s + Number(r.amount_total || 0),
          0
        );
      } catch (e: unknown) {
        // If tables aren't created yet, don't block the app.
        if (String(e).includes('Could not find the table')) return 0;
        return 0;
      }
    },
  });
}

export function useThisWeekTasks() {
  return useQuery({
    queryKey: ['this-week'],
    queryFn: async () => {
      try {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const { data, error: supabaseError } = await supabase
          .from('tasks')
          .select('id, title, due_date, status')
          .gte('due_date', start.toISOString().slice(0, 10))
          .lt('due_date', end.toISOString().slice(0, 10));
        if (supabaseError) throw supabaseError;
        return data ?? [];
      } catch {
        // Fallback to mock data
        console.log('Using mock data for this week tasks');
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 7);

        return mockData.tasks
          .filter(task => {
            if (!task.due_date) return false;
            const taskDate = new Date(task.due_date);
            return taskDate >= start && taskDate < end;
          })
          .map(task => ({
            id: task.id,
            title: task.title,
            due_date: task.due_date,
            status: task.status,
          }));
      }
    },
  });
}
