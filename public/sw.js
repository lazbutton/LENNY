const SW_VERSION = 7;
const STATIC_CACHE = `lennygotchi-static-v${SW_VERSION}`;
const RUNTIME_CACHE = `lennygotchi-runtime-v${SW_VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/maskable-512.png',
  '/backrooms.gif',
  '/music.PNG',
  '/lenny-minecraft.png',
  '/lennyssong.mp3',
  '/sable%20chaud.mp3',
  '/Maribou%20State%20-%20Eko%E2%80%99s%20(Official%20Audio).mp3',
];

function wrapNotificationText(text, maxLength = 38) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return text;

  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
      continue;
    }
    line = next;
  }

  if (line) lines.push(line);
  return lines.join('\n');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isApiRequest(request) {
  return new URL(request.url).pathname.startsWith('/api/');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'image' ||
    request.destination === 'audio' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/') ||
    /\.(?:png|gif|svg|webp|jpg|jpeg|mp3|css|js|woff2?)$/i.test(url.pathname)
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request).then((cached) => cached || caches.match('/'));
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !isSameOrigin(request) || isApiRequest(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  const message = String(payload.body || payload.title || '').trim();
  if (!message) return;

  // iOS tronque le titre sur une ligne : le message complet va dans le corps.
  event.waitUntil(
    self.registration.showNotification('', {
      body: wrapNotificationText(message),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: payload.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        if ('navigate' in client) {
          const navigatedClient = await client.navigate(targetUrl);
          if (navigatedClient && 'focus' in navigatedClient) return navigatedClient.focus();
        }
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
