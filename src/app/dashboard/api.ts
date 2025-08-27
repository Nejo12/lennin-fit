import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mockData } from '@/lib/mockData';

export function useUnpaidTotal() {
  return useQuery({
    queryKey: ['unpaid-total'],
    queryFn: async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('invoices')
          .select('amount_total, status')
          .in('status', ['sent', 'overdue']);
        if (supabaseError) throw supabaseError;
        return (data ?? []).reduce(
          (sum, r) => sum + Number(r.amount_total || 0),
          0
        );
      } catch {
        // Fallback to mock data
        console.log('Using mock data for unpaid total');
        return mockData.invoices
          .filter(invoice => ['sent', 'overdue'].includes(invoice.status))
          .reduce((sum, invoice) => sum + Number(invoice.amount_total || 0), 0);
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
