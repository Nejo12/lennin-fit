export type Id = string;

// Organizations & membership
export type Organization = {
  id: Id;
  name: string;
  created_at: string;
};

export type Profile = {
  id: Id;
  full_name?: string | null;
  default_org_id?: Id | null;
  created_at: string;
};

export type Membership = {
  user_id: Id;
  org_id: Id;
  role: 'owner' | 'member';
  created_at: string;
};

// Clients (Leads)
export type Client = {
  id: Id;
  org_id: Id;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
};

// Projects
export type Project = {
  id: Id;
  org_id: Id;
  client_id?: Id | null;
  name: string;
  status: 'active' | 'paused' | 'done' | 'archived';
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  created_at: string;
};

// Tasks (T)
export type Task = {
  id: Id;
  org_id: Id;
  project_id?: Id | null;
  title: string;
  description?: string | null;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string | null;
  estimate_minutes?: number | null;
  position: number;
  created_at: string;
  updated_at: string;
};

// Invoices (I)
export type Invoice = {
  id: Id;
  org_id: Id;
  client_id?: Id | null;
  issue_date: string;
  due_date?: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string | null;
  amount_subtotal: number;
  amount_tax: number;
  amount_total: number;
  created_at: string;
};

// Invoice items
export type InvoiceItem = {
  id: Id;
  org_id: Id;
  invoice_id: Id;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

// Payments
export type Payment = {
  id: Id;
  org_id: Id;
  invoice_id: Id;
  amount: number;
  paid_at: string;
  method?: string | null;
  status: string;
};
