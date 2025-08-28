import type { Handler } from '@netlify/functions';

/**
 * GET /.netlify/functions/materialize-cron
 * Configure Netlify Scheduler to call daily.
 */
export const handler: Handler = async () => {
  try {
    // Just call the same logic as materialize-recurrence but for all orgs
    const resp = await fetch(
      process.env.URL + '/.netlify/functions/materialize-recurrence',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }
    );
    const j = await resp.text();
    return { statusCode: 200, body: j };
  } catch (e: unknown) {
    return {
      statusCode: 500,
      body: String(e instanceof Error ? e.message : e),
    };
  }
};
