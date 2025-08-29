export interface FocusAIRequest {
  kpis: { unpaidTotal: number; overdueCount: number };
  todayTasks: Array<{ title: string; status: string; priority: string }>;
  topOverdue: Array<{
    id: string;
    client_name: string;
    amount_total: number;
    days_overdue: number;
  }>;
}

export interface FocusAIResponse {
  headline: string;
  top_actions: Array<{
    label: string;
    why: string;
    nav: 'invoices' | 'schedule' | 'leads' | 'tasks';
  }>;
  followups: string[];
}

export async function fetchFocusPlan(
  context: FocusAIRequest
): Promise<FocusAIResponse> {
  const res = await fetch('/.netlify/functions/ai-focus-today', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  });
  if (!res.ok) throw new Error('AI focus failed');
  return (await res.json()) as FocusAIResponse;
}
