import { useCreateTaskQuick } from '@/app/schedule/api';
import { useCreateInvoice } from '@/app/invoices/api';
import { useNavigate } from 'react-router-dom';
import { track } from '@/lib/track';

export default function ActionBar() {
  const createTask = useCreateTaskQuick();
  const createInvoice = useCreateInvoice();
  const nav = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="row gap">
      <button
        className="btn"
        onClick={() => {
          createTask.mutate({ title: 'New task', due_date: today });
          track('quick_new_task', { due_date: today });
        }}
      >
        + Task
      </button>
      <button
        className="btn"
        onClick={async () => {
          const id = await createInvoice.mutateAsync({ notes: '' });
          nav(`/app/invoices?open=${id}`);
          track('quick_new_invoice', { id });
        }}
      >
        + Invoice
      </button>
      <a className="btn btn-ghost" href="/app/schedule">
        Schedule
      </a>
      <a className="btn btn-ghost" href="/app/leads">
        Leads
      </a>
    </div>
  );
}
