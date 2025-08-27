export type Id = string;

export type Client = {
  id: Id;
  org_id: Id;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
};

export type Project = {
  id: Id;
  org_id: Id;
  client_id?: Id | null;
  name: string;
  description?: string | null;
  status: 'planned' | 'active' | 'paused' | 'done' | 'archived';
  start_date?: string | null;
  due_date?: string | null;
  created_at: string;
};

export type Task = {
  id: Id;
  org_id: Id;
  project_id?: Id | null;
  assignee_id?: Id | null;
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
