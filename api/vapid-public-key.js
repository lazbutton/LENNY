import { sendJson } from './_db.js';

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed' });
  }

  if (!process.env.VAPID_PUBLIC_KEY) {
    return sendJson(response, 500, { error: 'VAPID_PUBLIC_KEY is not configured' });
  }

  return sendJson(response, 200, { publicKey: process.env.VAPID_PUBLIC_KEY });
}
