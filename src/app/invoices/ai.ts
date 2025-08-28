export async function suggestInvoice(ctx: {
  clientName: string;
  previousItems: Array<{ description: string; unit_price: number }>;
  recentTasks: Array<{ title: string }>;
  currency: string;
}) {
  const res = await fetch('/.netlify/functions/ai-suggest-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx),
  });
  if (!res.ok) throw new Error('AI suggest failed');
  const data = await res.json();
  if (!Array.isArray(data.items)) data.items = [];
  if (typeof data.due_in_days !== 'number') data.due_in_days = 14;
  return data as {
    due_in_days: number;
    items: Array<{ description: string; quantity: number; unit_price: number }>;
    notes: string;
  };
}
