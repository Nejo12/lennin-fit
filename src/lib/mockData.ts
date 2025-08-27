// Mock data provider to handle 404 errors until database is set up
export const mockData = {
  clients: [
    {
      id: '1',
      org_id: 'org-1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: null,
      notes: null,
      created_at: '2024-02-01T10:00:00Z'
    },
    {
      id: '2',
      org_id: 'org-1',
      name: 'TechStart Inc',
      email: 'hello@techstart.com',
      phone: null,
      notes: null,
      created_at: '2024-02-05T14:30:00Z'
    }
  ],
  
  tasks: [
    {
      id: '1',
      org_id: 'org-1',
      project_id: null,
      assignee_id: null,
      title: 'Review website design',
      description: null,
      status: 'todo' as const,
      priority: 'high' as const,
      due_date: '2024-02-16',
      estimate_minutes: null,
      position: 0,
      created_at: '2024-02-10T09:00:00Z',
      updated_at: '2024-02-10T09:00:00Z'
    },
    {
      id: '2',
      org_id: 'org-1',
      project_id: null,
      assignee_id: null,
      title: 'Client meeting preparation',
      description: null,
      status: 'doing' as const,
      priority: 'medium' as const,
      due_date: '2024-02-17',
      estimate_minutes: null,
      position: 1,
      created_at: '2024-02-11T11:00:00Z',
      updated_at: '2024-02-11T11:00:00Z'
    },
    {
      id: '3',
      org_id: 'org-1',
      project_id: null,
      assignee_id: null,
      title: 'Invoice follow-up',
      description: null,
      status: 'todo' as const,
      priority: 'high' as const,
      due_date: '2024-02-18',
      estimate_minutes: null,
      position: 2,
      created_at: '2024-02-12T15:00:00Z',
      updated_at: '2024-02-12T15:00:00Z'
    }
  ],
  
  invoices: [
    {
      id: '1',
      org_id: 'org-1',
      client_id: '1',
      amount_total: 2500,
      status: 'sent' as const,
      due_date: '2024-02-15',
      created_at: '2024-02-01T10:00:00Z'
    },
    {
      id: '2',
      org_id: 'org-1',
      client_id: '2',
      amount_total: 1800,
      status: 'overdue' as const,
      due_date: '2024-02-10',
      created_at: '2024-02-05T14:30:00Z'
    }
  ]
}
