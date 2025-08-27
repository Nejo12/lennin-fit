import { useState } from 'react';
import styles from './Invoices.module.scss';

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  description: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      clientName: 'Acme Corp',
      amount: 2500,
      status: 'sent',
      dueDate: '2024-02-15',
      description: 'Website redesign project',
    },
    {
      id: '2',
      clientName: 'TechStart Inc',
      amount: 1800,
      status: 'draft',
      dueDate: '2024-02-20',
      description: 'Mobile app development',
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const getStatusClass = (status: Invoice['status']) => {
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

  const handleCreateInvoice = () => {
    const invoice: Invoice = {
      id: Date.now().toString(),
      clientName: newInvoice.clientName,
      amount: parseFloat(newInvoice.amount),
      status: 'draft',
      dueDate: newInvoice.dueDate,
      description: newInvoice.description,
    };
    setInvoices([...invoices, invoice]);
    setNewInvoice({ clientName: '', amount: '', dueDate: '', description: '' });
    setShowCreateForm(false);
  };

  const getAISuggestions = () => {
    return [
      'Create invoice for "Website Maintenance" - €500',
      'Follow up on overdue invoice from "Design Studio"',
      'Send reminder for "Consulting Services" - €1200',
    ];
  };

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
              placeholder="Client name"
              value={newInvoice.clientName}
              onChange={e =>
                setNewInvoice({ ...newInvoice, clientName: e.target.value })
              }
              className={styles.formInput}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newInvoice.amount}
              onChange={e =>
                setNewInvoice({ ...newInvoice, amount: e.target.value })
              }
              className={styles.formInput}
            />
            <input
              type="date"
              value={newInvoice.dueDate}
              onChange={e =>
                setNewInvoice({ ...newInvoice, dueDate: e.target.value })
              }
              className={styles.formInput}
            />
            <button
              onClick={handleCreateInvoice}
              className={styles.submitButton}
            >
              Create Invoice
            </button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className={styles.invoicesList}>
        <div className={styles.invoicesTitle}>All Invoices</div>
        {invoices.map(invoice => (
          <div key={invoice.id} className={styles.invoiceItem}>
            <div className={styles.invoiceInfo}>
              <div className={styles.invoiceNumber}>{invoice.clientName}</div>
              <div className={styles.invoiceClient}>{invoice.description}</div>
            </div>
            <div className={styles.invoiceAmount}>
              €{invoice.amount.toLocaleString()}
            </div>
            <div
              className={`${styles.invoiceStatus} ${getStatusClass(invoice.status)}`}
            >
              {invoice.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
