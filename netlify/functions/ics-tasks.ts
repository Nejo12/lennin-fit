import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Read-only ICS feed of tasks by org.
 * GET /.netlify/functions/ics-tasks?org=<uuid>&status=todo,doing (optional)
 */
export const handler: Handler = async event => {
  if (!SUPABASE_URL || !SERVICE_KEY)
    return { statusCode: 500, body: 'Missing server keys' };
  const org = (event.queryStringParameters?.org || '').trim();
  if (!org) return { statusCode: 400, body: 'org required' };

  const statusFilter = (event.queryStringParameters?.status || '')
    .split(',')
    .filter(Boolean);
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  let query = db
    .from('tasks')
    .select('id,title,due_date')
    .eq('org_id', org)
    .not('due_date', 'is', null);
  if (statusFilter.length)
    query = query.in(
      'status',
      statusFilter as ('todo' | 'doing' | 'done' | 'blocked')[]
    );

  const { data, error } = await query.order('due_date', { ascending: true });
  if (error) return { statusCode: 500, body: error.message };

  const nowUTC =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const esc = (s: string) =>
    (s || 'Task').replace(/\\n/g, ' ').replace(/,/g, '\\,');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lennin//TILSF//EN',
    ...data.map(t =>
      [
        'BEGIN:VEVENT',
        `UID:${t.id}@tilsf`,
        `DTSTAMP:${nowUTC}`,
        `DTSTART;VALUE=DATE:${String(t.due_date).replace(/-/g, '')}`,
        `SUMMARY:${esc(t.title)}`,
        'END:VEVENT',
      ].join('\r\n')
    ),
    'END:VCALENDAR',
  ].join('\r\n');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    body: lines,
  };
};
