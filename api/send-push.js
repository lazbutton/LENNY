import webPush from 'web-push';
import { getPool, sendJson } from './_db.js';
import { MODES } from '../src/lenny-states.js';

const VALID_DURATIONS = new Set([0, 3, 6, 10]);

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

function configureWebPush() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error('VAPID keys are not configured');
  }

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:lenny@lennygotchi.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export default async function handler(request, response) {
  try {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      return sendJson(response, 405, { error: 'Method not allowed' });
    }

    const { durationSeconds, message, mode } = parseBody(request);
    const body = String(message || '').trim();
    const duration = durationSeconds === 0 ? 0 : Number(durationSeconds || 6);
    const pushMode = mode || 'awake';
    if (!body) return sendJson(response, 400, { error: 'Message required' });
    if (body.length > 180) return sendJson(response, 400, { error: 'Message too long' });
    if (!VALID_DURATIONS.has(duration)) return sendJson(response, 400, { error: 'Invalid duration' });
    if (!MODES.includes(pushMode)) return sendJson(response, 400, { error: 'Invalid mode' });

    configureWebPush();
    await ensureTable();

    const result = await getPool().query('SELECT endpoint, subscription FROM lenny_push_subscriptions');
    const url = `/?message=${encodeURIComponent(body)}&mode=${encodeURIComponent(pushMode)}&duration=${duration}&push=${Date.now()}`;
    const payload = JSON.stringify({ body, url });

    let sent = 0;
    let failed = 0;

    await Promise.all(
      result.rows.map(async ({ endpoint, subscription }) => {
        try {
          await webPush.sendNotification(subscription, payload);
          sent += 1;
        } catch (error) {
          failed += 1;
          if (error.statusCode === 404 || error.statusCode === 410) {
            await getPool().query('DELETE FROM lenny_push_subscriptions WHERE endpoint = $1', [endpoint]);
          }
        }
      })
    );

    return sendJson(response, 200, { total: result.rows.length, sent, failed });
  } catch (error) {
    return sendJson(response, 500, { error: error.message });
  }
}
