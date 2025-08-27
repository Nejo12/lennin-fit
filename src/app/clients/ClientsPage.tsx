import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

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
    <div className="grid gap-4">
      <form
        onSubmit={e => {
          e.preventDefault();
          create.mutate();
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Client name"
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2"
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email (optional)"
          className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2"
        />
        <button className="bg-emerald-400 text-black rounded-xl px-3">
          Add
        </button>
      </form>

      {isLoading && <div>Loading…</div>}
      {error && <div className="text-red-400">{String(error)}</div>}

      <ul className="grid gap-2">
        {data?.map(c => (
          <li
            key={c.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 flex justify-between"
          >
            <span>{c.name}</span>
            <span className="text-neutral-400 text-sm">{c.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
