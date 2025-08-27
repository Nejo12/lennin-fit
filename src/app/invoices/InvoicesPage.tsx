import { useState } from 'react'
import styles from './Invoices.module.scss'

interface Invoice {
  id: string
  clientName: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  description: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      clientName: 'Acme Corp',
      amount: 2500,
      status: 'sent',
      dueDate: '2024-02-15',
      description: 'Website redesign project'
    },
    {
      id: '2',
      clientName: 'TechStart Inc',
      amount: 1800,
      status: 'draft',
      dueDate: '2024-02-20',
      description: 'Mobile app development'
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    amount: '',
    dueDate: '',
    description: ''
  })

  const getStatusClass = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return styles.statusPaid
      case 'sent': return styles.statusSent
      case 'overdue': return styles.statusOverdue
      default: return styles.statusDraft
    }
  }

  const handleCreateInvoice = () => {
    const invoice: Invoice = {
      id: Date.now().toString(),
      clientName: newInvoice.clientName,
      amount: parseFloat(newInvoice.amount),
      status: 'draft',
      dueDate: newInvoice.dueDate,
      description: newInvoice.description
    }
    setInvoices([...invoices, invoice])
    setNewInvoice({ clientName: '', amount: '', dueDate: '', description: '' })
    setShowCreateForm(false)
  }

  const getAISuggestions = () => {
    return [
      'Create invoice for "Website Maintenance" - €500',
      'Follow up on overdue invoice from "Design Studio"',
      'Send reminder for "Consulting Services" - €1200'
    ]
  }

  return (
    <div className={styles.invoices}>
      <div className={styles.header}>
        <h1 className={styles.title}>Invoices</h1>
      </div>

      {/* AI Suggestions */}
      <div className={styles.aiSection}>
        <h3 className={styles.aiTitle}>
          <span className={styles.aiIcon}>🤖</span>
          AI Suggestions
        </h3>
        <div className={styles.suggestionsList}>
          {getAISuggestions().map((suggestion, index) => (
            <div key={index} className={styles.suggestionItem}>
              <span className={styles.suggestionText}>{suggestion}</span>
              <button className={styles.applyButton}>Apply</button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Invoice Form */}
      {showCreateForm && (
        <div className={styles.formSection}>
          <h3 className={styles.formTitle}>Create New Invoice</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Client Name</label>
              <input
                type="text"
                placeholder="Enter client name"
                value={newInvoice.clientName}
                onChange={(e) => setNewInvoice({...newInvoice, clientName: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount (€)</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Due Date</label>
              <input
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                className={styles.formInput}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              onClick={handleCreateInvoice}
              className={styles.submitButton}
            >
              Create Invoice
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className={styles.invoicesSection}>
        <h3 className={styles.invoicesTitle}>All Invoices</h3>
        {invoices.length > 0 ? (
          <div className={styles.invoicesList}>
            {invoices.map((invoice) => (
              <div key={invoice.id} className={styles.invoiceItem}>
                <div className={styles.invoiceInfo}>
                  <div className={styles.invoiceClient}>{invoice.clientName}</div>
                  <div className={styles.invoiceDescription}>{invoice.description}</div>
                </div>
                <div className={styles.invoiceAmount}>
                  <div className={styles.amountValue}>€{invoice.amount.toLocaleString()}</div>
                  <div className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </div>
                </div>
                <div className={styles.invoiceDate}>Due: {invoice.dueDate}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📄</span>
            <div>No invoices yet. Create your first invoice above!</div>
          </div>
        )}
      </div>
    </div>
  )
}
