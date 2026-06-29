import { getPool, sendJson } from './_db.js';

const VALID_MODES = new Set(['auto', 'awake', 'sleep', 'breakfast', 'pool', 'cafe']);

async function ensureTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS lenny_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function readMode() {
  await ensureTable();
  const result = await getPool().query(
    "SELECT value FROM lenny_settings WHERE key = 'default_mode' LIMIT 1"
  );
  return result.rows[0]?.value || 'auto';
}

async function writeMode(mode) {
  await ensureTable();
  await getPool().query(
    `
      INSERT INTO lenny_settings (key, value, updated_at)
      VALUES ('default_mode', $1, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `,
    [mode]
  );
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      const mode = await readMode();
      return sendJson(response, 200, { mode });
    }

    if (request.method === 'POST') {
      const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body;
      const mode = body?.mode;
      if (!VALID_MODES.has(mode)) {
        return sendJson(response, 400, { error: 'Invalid mode' });
      }

      await writeMode(mode);
      return sendJson(response, 200, { mode });
    }

    response.setHeader('Allow', 'GET, POST');
    return sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message });
  }
}
