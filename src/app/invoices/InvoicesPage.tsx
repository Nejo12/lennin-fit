import { useState } from 'react';
import { useInvoices, useCreateInvoice } from './api';
import styles from './Invoices.module.scss';

export default function InvoicesPage() {
  const { data: invoices = [], isLoading, error } = useInvoices();
  const createInvoice = useCreateInvoice();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    due_date: '',
    notes: '',
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return styles.statusPaid;
      case 'sent':
        return styles.statusSent;
      case 'overdue':
        return styles.statusOverdue;
      default:
        return styles.statusDraft;
    }
  };

  const handleCreateInvoice = async () => {
    try {
      await createInvoice.mutateAsync({
        client_id: newInvoice.client_id || null,
        due_date: newInvoice.due_date || null,
        notes: newInvoice.notes || null,
      });
      setNewInvoice({ client_id: '', due_date: '', notes: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const getAISuggestions = () => {
    return [
      'Create invoice for "Website Maintenance" - €500',
      'Follow up on overdue invoice from "Design Studio"',
      'Send reminder for "Consulting Services" - €1200',
    ];
  };

  if (isLoading) {
    return (
      <div className={styles.invoices}>
        <div className={styles.header}>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.invoices}>
        <div className={styles.header}>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>Error loading invoices</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invoices}>
      <div className={styles.header}>
        <h1 className={styles.title}>Invoices</h1>
        <p className={styles.subtitle}>Manage your invoices and payments</p>
      </div>

      {/* Create Invoice Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className={styles.submitButton}
        style={{ marginBottom: '20px' }}
      >
        {showCreateForm ? 'Cancel' : 'Create New Invoice'}
      </button>

      {/* AI Suggestions */}
      <div className={styles.aiSuggestions}>
        <div className={styles.suggestionsTitle}>AI Suggestions</div>
        <div className={styles.suggestionsList}>
          {getAISuggestions().map((suggestion, index) => (
            <div key={index} className={styles.suggestionItem}>
              <div className={styles.suggestionText}>{suggestion}</div>
              <button className={styles.useButton}>Use</button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Invoice Form */}
      {showCreateForm && (
        <div className={styles.form}>
          <div className={styles.formTitle}>Create New Invoice</div>
          <div className={styles.formGrid}>
            <input
              type="text"
              placeholder="Client ID (optional)"
              value={newInvoice.client_id}
              onChange={e =>
                setNewInvoice({ ...newInvoice, client_id: e.target.value })
              }
              className={styles.formInput}
            />
            <input
              type="date"
              value={newInvoice.due_date}
              onChange={e =>
                setNewInvoice({ ...newInvoice, due_date: e.target.value })
              }
              className={styles.formInput}
            />
            <textarea
              placeholder="Notes (optional)"
              value={newInvoice.notes}
              onChange={e =>
                setNewInvoice({ ...newInvoice, notes: e.target.value })
              }
              className={styles.formInput}
            />
            <button
              onClick={handleCreateInvoice}
              disabled={createInvoice.isPending}
              className={styles.submitButton}
            >
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className={styles.invoicesList}>
        <div className={styles.invoicesTitle}>All Invoices</div>
        {invoices.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No invoices yet. Create your first invoice to get started.</p>
          </div>
        ) : (
          invoices.map(invoice => (
            <div key={invoice.id} className={styles.invoiceItem}>
              <div className={styles.invoiceInfo}>
                <div className={styles.invoiceNumber}>
                  Invoice #{invoice.id.slice(0, 8)}
                </div>
                <div className={styles.invoiceClient}>
                  {invoice.notes || 'No description'}
                </div>
              </div>
              <div className={styles.invoiceAmount}>
                €{(invoice.amount_total || 0).toLocaleString()}
              </div>
              <div
                className={`${styles.invoiceStatus} ${getStatusClass(invoice.status)}`}
              >
                {invoice.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
