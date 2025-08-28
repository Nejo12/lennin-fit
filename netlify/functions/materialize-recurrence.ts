import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(URL, KEY);

/**
 * POST /.netlify/functions/materialize-recurrence
 * Body: { org?: string }  (optional: scope to an org)
 * Creates forward instances for tasks with recurrence.
 */
export const handler: Handler = async event => {
  try {
    if (!URL || !KEY) return { statusCode: 500, body: 'Server keys missing' };
    const body =
      event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const org = (body.org || '').trim();

    let q = db
      .from('tasks')
      .select(
        'id, org_id, title, priority, due_date, recur_rule, recur_interval, recur_count, recur_until'
      )
      .not('recur_rule', 'is', null)
      .order('due_date', { ascending: true });

    if (org) q = q.eq('org_id', org);

    const { data: seeds, error } = await q;
    if (error) throw error;

    const toCreate: Array<{
      org_id: string;
      title: string;
      status: string;
      priority: string;
      due_date: string;
      position: number;
    }> = [];
    const today = new Date();

    for (const t of seeds || []) {
      if (!t.due_date) continue;
      const interval = Math.max(1, t.recur_interval || 1);
      const count = Math.max(1, t.recur_count || 6);

      let cursor = new Date(t.due_date);
      let created = 0;

      while (created < count) {
        cursor = new Date(cursor);
        if (t.recur_rule === 'WEEKLY')
          cursor.setDate(cursor.getDate() + 7 * interval);
        else if (t.recur_rule === 'MONTHLY')
          cursor.setMonth(cursor.getMonth() + 1 * interval);
        else break;

        if (t.recur_until && new Date(cursor) > new Date(t.recur_until)) break;
        if (cursor < today) continue;

        toCreate.push({
          org_id: t.org_id,
          title: t.title,
          status: 'todo',
          priority: t.priority || 'medium',
          due_date: cursor.toISOString().slice(0, 10),
          position: 0,
        });
        created++;
      }
    }

    if (toCreate.length) {
      const { error: insErr } = await db.from('tasks').insert(toCreate);
      if (insErr) throw insErr;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ created: toCreate.length }),
    };
  } catch (e: unknown) {
    return {
      statusCode: 500,
      body: String(e instanceof Error ? e.message : e),
    };
  }
};
