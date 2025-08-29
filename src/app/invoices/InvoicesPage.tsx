import { useMemo, useState } from 'react';
import {
  useInvoices,
  useCreateInvoice,
  useSetInvoiceStatus,
  useAddManyItems,
} from './api';
import InvoiceDetail from './InvoiceDetail';
import { suggestInvoice } from './ai';
import { buildReminderEmail } from '@/lib/reminders';
import { track } from '@/lib/track';
import styles from './Invoices.module.scss';

export default function InvoicesPage() {
  const { data: invoices = [], isLoading, error } = useInvoices();
  const createInvoice = useCreateInvoice();
  const setStatus = useSetInvoiceStatus();
  const addMany = useAddManyItems();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const selected = useMemo(
    () => invoices.find(i => i.id === selectedId) || null,
    [invoices, selectedId]
  );

  const onNew = async () => {
    const id = await createInvoice.mutateAsync({ notes: '' });
    setSelectedId(id);
  };

  const onAISuggest = async () => {
    if (!selected) return;
    try {
      setAiLoading(true);
      // Pull a little context; you can fetch previous items/tasks elsewhere if desired
      const out = await suggestInvoice({
        clientName: selected.client_id
          ? `Client ${selected.client_id.slice(0, 6)}`
          : 'Client',
        previousItems: [], // hydrate later
        recentTasks: [], // hydrate later
        currency: 'EUR',
      });
      // Copy to clipboard or open a modal to accept items
      await navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      alert(
        'AI draft copied to clipboard. Paste into items, or wire auto-apply.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  async function copyReminder(inv: {
    id: string;
    client_id?: string | null;
    amount_total: number;
    due_date?: string | null;
    client_name?: string;
  }) {
    const days = Math.max(
      0,
      Math.floor((Date.now() - +new Date(inv.due_date || '')) / 86400000)
    );
    const email = buildReminderEmail({
      id: inv.id,
      client_id: inv.client_id ?? null,
      client_name: inv.client_name || 'Client',
      amount_total: inv.amount_total,
      due_date: inv.due_date || new Date().toISOString().slice(0, 10),
      days_overdue: days,
    });
    await navigator.clipboard.writeText(email.body);
    alert('Reminder copied. Paste into your email client.');
    track('invoice_reminder_copied', { id: inv.id, days_overdue: days });
  }

  async function onAISuggestApply(invoiceId: string) {
    const draft = await suggestInvoice({
      clientName: 'Client',
      previousItems: [],
      recentTasks: [],
      currency: 'EUR',
    });
    if (!draft.items?.length) {
      alert('No items suggested.');
      return;
    }
    addMany.mutate({ invoice_id: invoiceId, items: draft.items });
    track('ai_suggest_apply', {
      invoice_id: invoiceId,
      items: draft.items.length,
    });
  }

  return (
    <div className={styles.invoices}>
      <div className={styles.grid2col}>
        <section className={styles.card}>
          <div className={styles.header}>
            <h2 style={{ margin: 0 }}>Invoices</h2>
            <div className={styles.actions}>
              <button className={styles.btn} onClick={onNew}>
                New
              </button>
              <button
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={onAISuggest}
                disabled={!selected || aiLoading}
              >
                {aiLoading ? 'Thinking…' : 'AI Suggest'}
              </button>
            </div>
          </div>

          {isLoading && <div className={styles.loading}>Loading…</div>}
          {error && <div className={styles.error}>Error loading invoices</div>}

          <ul className={styles.list}>
            {invoices.map(inv => (
              <li
                key={inv.id}
                className={`${styles.listRow} ${selectedId === inv.id ? styles.active : ''}`}
                onClick={() => setSelectedId(inv.id)}
              >
                <div className={styles.col}>
                  <div className={styles.title}>
                    #{inv.id.slice(0, 6)} — {inv.status}
                  </div>
                  <div className={styles.muted}>
                    {inv.due_date || 'No due date'}
                  </div>
                </div>
                <div className={styles.amount}>
                  €{Number(inv.amount_total || 0).toFixed(2)}
                </div>
                <div className={styles.actions}>
                  <select
                    value={inv.status}
                    onChange={e =>
                      setStatus.mutate({
                        id: inv.id,
                        status: e.target.value as
                          | 'draft'
                          | 'sent'
                          | 'paid'
                          | 'overdue',
                      })
                    }
                    className={styles.select}
                  >
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="paid">paid</option>
                    <option value="overdue">overdue</option>
                  </select>
                  <button
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={e => {
                      e.stopPropagation();
                      copyReminder(inv);
                    }}
                  >
                    Remind
                  </button>
                  {selectedId === inv.id && (
                    <button
                      className={styles.btn}
                      onClick={e => {
                        e.stopPropagation();
                        onAISuggestApply(inv.id);
                      }}
                    >
                      AI Apply
                    </button>
                  )}
                </div>
              </li>
            ))}
            {!invoices.length && (
              <li className={styles.muted}>No invoices yet. Click "New".</li>
            )}
          </ul>
        </section>

        <section>
          {selected && <InvoiceDetail invoiceId={selected.id} />}
        </section>
      </div>
    </div>
  );
}
