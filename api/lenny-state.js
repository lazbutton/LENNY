import { getPool, sendJson } from './_db.js';
import { VALID_MODES } from '../src/lenny-states.js';

const SETTING_KEYS = ['default_mode', 'message_of_day', 'scheduled_mode', 'scheduled_until'];

async function ensureTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS lenny_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function parseBody(request) {
  return typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
}

async function readSettings() {
  await ensureTable();
  const result = await getPool().query(
    'SELECT key, value FROM lenny_settings WHERE key = ANY($1::TEXT[])',
    [SETTING_KEYS]
  );
  const values = Object.fromEntries(result.rows.map(({ key, value }) => [key, value]));
  return {
    messageOfDay: values.message_of_day || '',
    mode: values.default_mode || 'auto',
    scheduledMode: values.scheduled_mode || '',
    scheduledUntil: values.scheduled_until || '',
  };
}

async function writeSetting(key, value) {
  await ensureTable();
  if (value === null || value === undefined || value === '') {
    await getPool().query('DELETE FROM lenny_settings WHERE key = $1', [key]);
    return;
  }

  await getPool().query(
    `
      INSERT INTO lenny_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `,
    [key, value]
  );
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      return sendJson(response, 200, await readSettings());
    }

    if (request.method === 'POST') {
      const body = parseBody(request);
      const writes = [];

      if (Object.prototype.hasOwnProperty.call(body, 'mode')) {
        const mode = body.mode;
        if (!VALID_MODES.has(mode)) {
          return sendJson(response, 400, { error: 'Invalid mode' });
        }
        writes.push(writeSetting('default_mode', mode));
      }

      if (Object.prototype.hasOwnProperty.call(body, 'messageOfDay')) {
        const messageOfDay = String(body.messageOfDay || '').trim();
        if (messageOfDay.length > 140) {
          return sendJson(response, 400, { error: 'Message too long' });
        }
        writes.push(writeSetting('message_of_day', messageOfDay));
      }

      if (Object.prototype.hasOwnProperty.call(body, 'scheduledMode')) {
        const scheduledMode = body.scheduledMode || '';
        if (scheduledMode && !VALID_MODES.has(scheduledMode)) {
          return sendJson(response, 400, { error: 'Invalid scheduled mode' });
        }
        writes.push(writeSetting('scheduled_mode', scheduledMode));
      }

      if (Object.prototype.hasOwnProperty.call(body, 'scheduledUntil')) {
        const scheduledUntil = String(body.scheduledUntil || '').trim();
        if (scheduledUntil && Number.isNaN(new Date(scheduledUntil).getTime())) {
          return sendJson(response, 400, { error: 'Invalid scheduled until' });
        }
        writes.push(writeSetting('scheduled_until', scheduledUntil));
      }

      if (writes.length === 0) {
        return sendJson(response, 400, { error: 'Invalid mode' });
      }

      await Promise.all(writes);
      return sendJson(response, 200, await readSettings());
    }

    response.setHeader('Allow', 'GET, POST');
    return sendJson(response, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message });
  }
}
