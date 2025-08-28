import type { Handler } from '@netlify/functions';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export const handler: Handler = async event => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, body: 'Method Not Allowed' };
  if (!OPENAI_API_KEY)
    return { statusCode: 500, body: 'OPENAI_API_KEY missing' };

  const {
    clientName,
    previousItems = [],
    recentTasks = [],
    currency = 'EUR',
  } = JSON.parse(event.body || '{}');

  const prompt = `
Return ONLY JSON:
{ "due_in_days": number,
  "items":[{"description":string,"quantity":number,"unit_price":number}],
  "notes": string }
Client: ${clientName}
Previous items: ${previousItems.map((i: { description: string; unit_price: number }) => `${i.description}:${i.unit_price}`).join(', ')}
Recent tasks: ${recentTasks.map((t: { title: string }) => t.title).join(', ') || 'none'}
Currency: ${currency}
`.trim();

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const j = await r.json();
  let out: {
    due_in_days: number;
    items: Array<{ description: string; quantity: number; unit_price: number }>;
    notes: string;
  } = { due_in_days: 14, items: [], notes: '' };
  try {
    out = JSON.parse(j.choices?.[0]?.message?.content || '{}');
  } catch {
    // Fallback to default values
  }
  if (!Array.isArray(out.items)) out.items = [];
  if (typeof out.due_in_days !== 'number') out.due_in_days = 14;
  return { statusCode: 200, body: JSON.stringify(out) };
};
