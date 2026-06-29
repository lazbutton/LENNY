import { getPool, sendJson } from './_db.js';

async function ensureTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS lenny_push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      subscription JSONB NOT NULL,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function parseBody(request) {
  return typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
}

export default async function handler(request, response) {
  try {
    await ensureTable();

    if (request.method === 'GET') {
      const result = await getPool().query('SELECT COUNT(*)::INT AS count FROM lenny_push_subscriptions');
      return sendJson(response, 200, { count: result.rows[0]?.count || 0 });
    }

    if (request.method === 'POST') {
      const { subscription } = parseBody(request);
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return sendJson(response, 400, { error: 'Invalid subscription' });
      }

      await getPool().query(
        `
          INSERT INTO lenny_push_subscriptions (endpoint, subscription, user_agent, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (endpoint)
          DO UPDATE SET subscription = EXCLUDED.subscription, user_agent = EXCLUDED.user_agent, updated_at = NOW()
        `,
        [subscription.endpoint, subscription, request.headers['user-agent'] || null]
      );

      return sendJson(response, 200, { ok: true });
    }

    response.setHeader('Allow', 'GET, POST');
    return sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message });
  }
}
