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
        <p className={styles.subtitle}>Manage your client relationships</p>
      </div>

      {/* Create Client Form */}
      <div className={styles.form}>
        <div className={styles.formRow}>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Client name" 
            className={styles.clientName}
            required
          />
          <input 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email (optional)" 
            type="email"
            className={styles.clientEmail}
          />
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={create.isPending}
            className={styles.submitButton}
          >
            {create.isPending ? 'Adding...' : 'Add Client'}
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && <div>Loading clients...</div>}
      
      {error && <div>Error loading clients: {String(error)}</div>}

      {/* Clients List */}
      <div className={styles.clientList}>
        {data && data.length > 0 ? (
          data.map(client => (
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
                Delete
              </button>
            </div>
          ))
        ) : (
          <div>No clients yet. Add your first client above!</div>
        )}
      </div>
    </div>
  )
}
