import { useMemo, useState } from 'react';
import { useInvoices, useCreateInvoice, useSetInvoiceStatus } from './api';
import InvoiceDetail from './InvoiceDetail';
import { suggestInvoice } from './ai';
import styles from './Invoices.module.scss';

export default function InvoicesPage() {
  const { data: invoices = [], isLoading, error } = useInvoices();
  const createInvoice = useCreateInvoice();
  const setStatus = useSetInvoiceStatus();
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
                <div>
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
