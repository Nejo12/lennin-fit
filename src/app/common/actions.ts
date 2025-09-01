import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '@/app/invoices/api';
import { useCreateTaskQuick } from '@/app/schedule/api';
import { useCreateClient } from '@/app/leads/api';
import { track } from '@/lib/track';

interface NewInvoiceOptions {
  client_id?: string | null;
  notes?: string | null;
}

interface NewTaskOptions {
  title?: string;
  due?: Date;
}

export function useQuickActions() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const createTaskQuick = useCreateTaskQuick();
  const createClient = useCreateClient();

  const newInvoice = async (opts?: NewInvoiceOptions) => {
    try {
      const id = await createInvoice.mutateAsync({
        client_id: opts?.client_id,
        notes: opts?.notes ?? '',
      });
      track('qa_new_invoice', { id, client: opts?.client_id || null });
      navigate(`/app/invoices?open=${id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  };

  const newTask = async (opts?: NewTaskOptions) => {
    try {
      const title = opts?.title || 'New task';
      const dueDate = opts?.due || new Date();
      const due_date = dueDate.toISOString().slice(0, 10);
      await createTaskQuick.mutateAsync({ title, due_date });
      track('qa_new_task', { title, due_date });
      navigate('/app/schedule');
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const scheduleMeeting = async () => {
    try {
      const title = prompt('Meeting title?', 'Client call');
      if (!title) return;

      const dateStr = prompt(
        'Date (YYYY-MM-DD)?',
        new Date().toISOString().slice(0, 10)
      );
      if (!dateStr) return;

      await createTaskQuick.mutateAsync({
        title: `Meeting: ${title}`,
        due_date: dateStr,
      });
      track('qa_schedule_meeting', { title, due_date: dateStr });
      navigate('/app/schedule');
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      throw error;
    }
  };

  const addLead = async () => {
    try {
      const name = prompt('Lead / Client name?');
      if (!name) return;

      const email = prompt('Client email? (optional)') || undefined;
      const phone = prompt('Client phone? (optional)') || undefined;

      const result = await createClient.mutateAsync({
        name,
        email: email || null,
        phone: phone || null,
      });

      track('qa_add_lead', { client_id: result.id, name: result.name });
      navigate(`/app/leads?open=${result.id}`);
    } catch (error) {
      console.error('Failed to add lead:', error);
      throw error;
    }
  };

  return {
    newInvoice,
    newTask,
    scheduleMeeting,
    addLead,
  };
}
