import type { Handler } from '@netlify/functions';

interface FocusAIRequest {
  kpis: { unpaidTotal: number; overdueCount: number };
  todayTasks: Array<{ title: string; status: string; priority: string }>;
  topOverdue: Array<{
    client_name: string;
    amount_total: number;
    days_overdue: number;
  }>;
}

interface FocusAIResponse {
  headline: string;
  top_actions: Array<{
    label: string;
    why: string;
    nav: 'invoices' | 'schedule' | 'leads' | 'tasks';
  }>;
  followups: string[];
}

const KEY = process.env.OPENAI_API_KEY!;

export const handler: Handler = async event => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    if (!KEY) {
      return { statusCode: 500, body: 'OPENAI_API_KEY missing' };
    }

    const body = JSON.parse(event.body || '{}') as FocusAIRequest;
    const { kpis, todayTasks = [], topOverdue = [] } = body;

    const prompt = `
You are a productivity coach for a freelancer. Return a terse JSON plan (no prose) that prioritizes cash and commitments.
Context:
- Unpaid total: ${kpis?.unpaidTotal ?? 0}
- Overdue count: ${kpis?.overdueCount ?? 0}
- Top overdue: ${topOverdue.map(o => `${o.client_name} ${o.amount_total} (${o.days_overdue}d)`).join('; ') || 'none'}
- Today tasks: ${todayTasks.map(t => `${t.title} [${t.priority}/${t.status}]`).join('; ') || 'none'}

Return ONLY JSON in this shape:
{
  "headline": string,
  "top_actions": [
    { "label": string, "why": string, "nav": "invoices" | "schedule" | "leads" | "tasks" }
  ],
  "followups": string[]
}
- 3 to 4 top_actions max.
- Prefer actions that move money (overdue follow-ups) then time commitments (today's tasks).
- Keep each 'why' under 18 words.
`.trim();

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const j = await r.json();
    let out: FocusAIResponse = {
      headline: "Today's Focus",
      top_actions: [],
      followups: [],
    };

    try {
      const content = j.choices?.[0]?.message?.content;
      if (content) {
        out = JSON.parse(content) as FocusAIResponse;
      }
    } catch {
      // Use default response if parsing fails
    }

    // Ensure arrays exist
    if (!Array.isArray(out.top_actions)) {
      out.top_actions = [];
    }
    if (!Array.isArray(out.followups)) {
      out.followups = [];
    }

    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (e: unknown) {
    console.error('AI focus error:', e);
    return {
      statusCode: 200,
      body: JSON.stringify({
        headline: "Today's Focus",
        top_actions: [],
        followups: [],
      }),
    };
  }
};
