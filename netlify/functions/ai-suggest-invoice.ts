import type { Handler } from '@netlify/functions';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

interface InvoiceItem {
  description: string;
  unit_price: number;
}

interface Task {
  title: string;
}

interface RequestBody {
  clientName: string;
  previousItems?: InvoiceItem[];
  recentTasks?: Task[];
  paymentPattern?: string;
  currency?: string;
}

export const handler: Handler = async event => {
  try {
    if (event.httpMethod !== 'POST')
      return { statusCode: 405, body: 'Method Not Allowed' };
    if (!OPENAI_API_KEY)
      return { statusCode: 500, body: 'OPENAI_API_KEY missing' };

    const body: RequestBody = JSON.parse(event.body || '{}');
    const {
      clientName,
      previousItems = [],
      recentTasks = [],
      paymentPattern = 'unknown',
      currency = 'EUR',
    } = body;

    const prompt = `
You generate concise invoice suggestions as strict JSON.
Client: ${clientName}
Payment pattern: ${paymentPattern}
Previous items: ${previousItems.map((i: InvoiceItem) => `${i.description} - ${i.unit_price}`).join('; ')}
Recent tasks: ${recentTasks.map((t: Task) => t.title).join('; ') || 'none'}
Currency: ${currency}

Return ONLY JSON:
{ "due_in_days": number, "items":[{"description":string,"quantity":number,"unit_price":number}], "notes": string }
Keep items 1–4 lines. No commentary.
`.trim();

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    const json = await resp.json();
    const text = json.choices?.[0]?.message?.content || '{}';

    // Safe parse
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { due_in_days: 14, items: [], notes: '' };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({ due_in_days: 14, items: [], notes: '' }),
    };
  }
};
