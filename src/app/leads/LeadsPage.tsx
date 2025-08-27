import React, { useState } from 'react'
import { useClients, useCreateClient, useDeleteClient, useUpdateClient } from './api'
import styles from './Leads.module.scss'

export default function LeadsPage() {
  const { data, isLoading, error } = useClients()
  const create = useCreateClient()
  const update = useUpdateClient()
  const del = useDeleteClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create.mutate({ name, email: email || null })
    setName('')
    setEmail('')
  }

  return (
    <div className={styles.leads}>
      <div className={styles.header}>
        <h1 className={styles.title}>Leads & CRM</h1>
      </div>

      {/* Create Client Form */}
      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>Add New Client</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Client Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter client name" 
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email (Optional)</label>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Enter email address" 
              type="email"
              className={styles.formInput}
            />
          </div>
          <button 
            type="submit"
            disabled={create.isPending}
            className={styles.submitButton}
          >
            {create.isPending ? 'Adding...' : 'Add Client'}
          </button>
        </form>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className={styles.loadingState}>
          <span className={styles.loadingIcon}>⏳</span>
          <div>Loading clients...</div>
        </div>
      )}
      
      {error && (
        <div className={styles.errorState}>
          <div className={styles.errorTitle}>Error loading clients</div>
          <div className={styles.errorMessage}>{String(error)}</div>
        </div>
      )}

      {/* Clients List */}
      <div className={styles.clientsSection}>
        <h3 className={styles.clientsTitle}>All Clients</h3>
        {data && data.length > 0 ? (
          <div className={styles.clientsList}>
            {data.map(client => (
              <div key={client.id} className={styles.clientItem}>
                <div className={styles.clientInfo}>
                  <input 
                    defaultValue={client.name} 
                    onBlur={e => update.mutate({ id: client.id, name: e.target.value })} 
                    className={styles.clientName}
                  />
                  <input 
                    defaultValue={client.email ?? ''} 
                    onBlur={e => update.mutate({ id: client.id, email: e.target.value || null })} 
                    className={styles.clientEmail}
                    placeholder="No email"
                  />
                </div>
                <button 
                  onClick={() => del.mutate(client.id)}
                  disabled={del.isPending}
                  className={styles.deleteButton}
                >
                  {del.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>👥</span>
            <div>No clients yet. Add your first client above!</div>
          </div>
        )}
      </div>
    </div>
  )
}
