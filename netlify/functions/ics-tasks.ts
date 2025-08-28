import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async event => {
  if (!SUPABASE_URL || !SERVICE_KEY)
    return { statusCode: 500, body: 'Missing server keys' };
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const org = (event.queryStringParameters?.org || '').trim();
  if (!org) return { statusCode: 400, body: 'org required' };

  const { data, error } = await db
    .from('tasks')
    .select('id,title,due_date')
    .eq('org_id', org)
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true });

  if (error) return { statusCode: 500, body: error.message };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lennin//TILSF//EN',
    ...data.map(t =>
      [
        'BEGIN:VEVENT',
        `UID:${t.id}@tilsf`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${String(t.due_date).replace(/-/g, '')}`,
        `SUMMARY:${(t.title || 'Task').replace(/\r?\n/g, ' ')}`,
        'END:VEVENT',
      ].join('\r\n')
    ),
    'END:VCALENDAR',
  ].join('\r\n');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/calendar' },
    body: lines,
  };
};
