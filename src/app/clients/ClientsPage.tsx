import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import styles from './Clients.module.scss';

type Client = { id: string; name: string; email?: string | null };

async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id,name,email')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Client[];
}

export default function ClientsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const create = useMutation({
    mutationFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('default_org_id')
        .single();
      const { error } = await supabase
        .from('clients')
        .insert({ org_id: profile!.default_org_id, name, email });
      if (error) throw error;
    },
    onSuccess: () => {
      setName('');
      setEmail('');
      qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return (
    <div className={styles.clients}>
      <div className={styles.header}>
        <h1 className={styles.title}>Clients</h1>
        <p className={styles.subtitle}>Manage your client relationships</p>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          create.mutate();
        }}
        className={styles.form}
      >
        <div className={styles.formRow}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Client name"
            className={styles.formInput}
            required
          />
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email (optional)"
            type="email"
            className={styles.formInput}
          />
          <button type="submit" className={styles.submitButton}>
            Add Client
          </button>
        </div>
      </form>

      {isLoading && <div className={styles.loadingState}>Loading clients…</div>}
      {error && <div className={styles.errorState}>{String(error)}</div>}

      <div className={styles.clientsList}>
        <h2 className={styles.listTitle}>All Clients</h2>
        <div className={styles.clientsGrid}>
          {data?.map(client => (
            <div key={client.id} className={styles.clientItem}>
              <div className={styles.clientInfo}>
                <h3 className={styles.clientName}>{client.name}</h3>
                {client.email && (
                  <p className={styles.clientEmail}>{client.email}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
