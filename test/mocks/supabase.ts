type TableResponse<T> =
  | { data: T | null; error: null }
  | { data: null; error: Error };
function ok<T>(data: T): TableResponse<T> {
  return { data, error: null };
}

interface Client {
  id: string;
  name: string;
  email: string;
  org_id: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  org_id: string;
}

interface Invoice {
  id: string;
  client_id: string;
  amount: number;
  status: string;
  org_id: string;
}

interface Profile {
  id: string;
  default_org_id: string;
}

const rows = {
  clients: [] as Client[],
  tasks: [] as Task[],
  invoices: [] as Invoice[],
  profiles: [{ id: 'profile_1', default_org_id: 'org_1' }] as Profile[],
};

function selectImpl<T extends keyof typeof rows>(table: T) {
  return {
    select: () => ({
      order: () => ok(rows[table]),
      in: () => ok(rows[table]),
      gte: () => ({ lt: () => ok(rows[table]) }),
      single: () => ok(rows[table][0] ?? null),
    }),
    insert: (payload: Record<string, unknown>) => {
      const newItem = { id: crypto.randomUUID?.() ?? 'id', ...payload };
      (rows[table] as unknown[]).push(newItem);
      return ok(null);
    },
    update: (payload: Record<string, unknown>) => ({
      eq: (k: string, v: string) => {
        const i = (rows[table] as unknown[]).findIndex(
          r => (r as Record<string, unknown>)[k] === v
        );
        if (i >= 0)
          (rows[table] as unknown[])[i] = {
            ...((rows[table] as unknown[])[i] as Record<string, unknown>),
            ...payload,
          };
        return ok(null);
      },
    }),
    delete: () => ({
      eq: (k: string, v: string) => {
        const i = (rows[table] as unknown[]).findIndex(
          r => (r as Record<string, unknown>)[k] === v
        );
        if (i >= 0) (rows[table] as unknown[]).splice(i, 1);
        return ok(null);
      },
    }),
  };
}

export const supabase = {
  from: (table: string) => {
    if (!(table in rows)) throw new Error('Unknown table: ' + table);
    // @ts-expect-error - Mock implementation
    return selectImpl(table);
  },
  auth: {
    getUser: async () => ({
      data: { user: { id: 'user_1', email: 't@t.com' } },
    }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
    signInWithOtp: async () => ({ error: null }),
  },
  rpc: async () => ({ data: null, error: null }),
  __rows: rows,
};
