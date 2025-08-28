import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const handler: Handler = async event => {
  try {
    const org = event.queryStringParameters?.org;
    if (!org) return { statusCode: 400, body: 'org required' };

    const db = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: client } = await db
      .from('clients')
      .insert({ org_id: org, name: 'Acme Inc', email: 'billing@acme.test' })
      .select('id')
      .single();

    const { data: invoice } = await db
      .from('invoices')
      .insert({
        org_id: org,
        client_id: client!.id,
        status: 'sent',
        notes: 'Demo invoice',
      })
      .select('id')
      .single();

    await db.from('invoice_items').insert([
      {
        org_id: org,
        invoice_id: invoice!.id,
        description: 'Design sprint',
        quantity: 5,
        unit_price: 200,
      },
      {
        org_id: org,
        invoice_id: invoice!.id,
        description: 'Hosting',
        quantity: 1,
        unit_price: 50,
      },
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, invoice: invoice!.id }),
    };
  } catch (e: unknown) {
    return {
      statusCode: 500,
      body: String(e instanceof Error ? e.message : e),
    };
  }
};
