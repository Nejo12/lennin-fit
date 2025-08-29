export type OverdueLike = {
  id: string;
  client_id: string | null | undefined;
  client_name: string;
  amount_total: number;
  due_date: string;
  days_overdue: number;
  status?: string;
};

export function formatCurrency(amount: number, currency = 'EUR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `€${amount.toFixed(2)}`;
  }
}

export function buildReminderEmail(
  item: OverdueLike,
  opts?: { sender?: string; currency?: string }
) {
  const amt = formatCurrency(item.amount_total, opts?.currency || 'EUR');
  const subject = `Friendly reminder: Invoice ${item.id.slice(0, 6)} (${amt})`;
  const body = [
    `Subject: ${subject}`,
    '',
    `Hi ${item.client_name},`,
    '',
    `Hope you're well. This is a friendly reminder about invoice ${item.id.slice(0, 6)} for ${amt},`,
    `which fell due on ${new Date(item.due_date).toLocaleDateString()} (${item.days_overdue} day(s) overdue).`,
    '',
    `Could you let me know the expected payment date? If you've already sent it, please ignore this.`,
    '',
    `Thanks so much,`,
    `${opts?.sender || '—'}`,
  ].join('\n');
  return { subject, body };
}
