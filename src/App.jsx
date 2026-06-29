import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FACE, PAL, SPRITE } from './lenny-art.js';

const ART_COLS = 48;
const ART_ROWS = 60;
const PX = 8;
const OX = 6;
const OY = 4;
const MODES = ['awake', 'sleep', 'breakfast', 'pool', 'cafe'];
const ADMIN_MODES = ['auto', ...MODES];
const RESUME_RELOAD_AFTER_MS = 5000;
const NOTIFICATION_MESSAGE_DURATION_MS = 6000;
const MODE_LABELS = {
  auto: 'Auto horaire',
  awake: 'Réveillé',
  sleep: 'Dodo',
  breakfast: 'Petit déjeuner',
  pool: 'Piscine',
  cafe: '6ème café',
};

function scheduledMode(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 60 && minutes < 570) return 'sleep';
  if (minutes >= 570 && minutes < 720) return 'breakfast';
  return 'awake';
}

function drawScene(canvas, mode, expr, ticks) {
  const ctx = canvas.getContext('2d');
  const breakfast = mode === 'breakfast';
  const pool = mode === 'pool';
  const cafe = mode === 'cafe';

  function px(x, y, key) {
    const color = PAL[key];
    if (!color) return;
    ctx.fillStyle = color;
    ctx.fillRect(x * PX, y * PX, PX, PX);
  }

  function block(x, y, w, h, key) {
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) px(x + xx, y + yy, key);
    }
  }

  function fpx(x, y, key) {
    px(x + OX, y + OY, key);
  }

  function fblk(x, y, w, h, key) {
    block(x + OX, y + OY, w, h, key);
  }

  function steamCol(baseX) {
    for (let y = 44; y >= 39; y--) {
      const off = Math.round(Math.sin((44 - y + ticks.breakfast * 0.6) * 1.1));
      fpx(baseX + off, y, 'u');
    }
  }

  function drawBreakfast() {
    fblk(37, 45, 7, 1, 'b');
    fpx(37, 46, 'b');
    fblk(38, 46, 5, 1, 'c');
    fpx(43, 46, 'b');
    fblk(38, 47, 5, 5, 'm');
    for (let y = 47; y <= 51; y++) {
      fpx(37, y, 'b');
      fpx(43, y, 'b');
    }
    fblk(37, 52, 7, 1, 'b');
    fpx(44, 47, 'b');
    fpx(45, 48, 'b');
    fpx(45, 49, 'b');
    fpx(44, 50, 'b');
    fblk(36, 53, 9, 1, 'd');
    fpx(36, 53, 'b');
    fpx(44, 53, 'b');
    fblk(37, 54, 7, 1, 'b');
    steamCol(39);
    steamCol(42);

    fblk(4, 43, 5, 1, 'o');
    fpx(3, 44, 'o');
    fblk(4, 44, 5, 1, 'e');
    fpx(9, 44, 'o');
    fpx(3, 45, 'o');
    fblk(4, 45, 5, 1, 'j');
    fpx(9, 45, 'o');
    fpx(3, 46, 'o');
    fblk(4, 46, 5, 1, 'j');
    fpx(9, 46, 'o');
    for (let y = 47; y <= 50; y++) {
      fpx(3, y, 'o');
      fblk(4, y, 5, 1, 'e');
      fpx(9, y, 'o');
    }
    fblk(4, 51, 5, 1, 'o');
    fpx(1, 52, 'b');
    fblk(2, 52, 8, 1, 'w');
    fpx(10, 52, 'b');
    fblk(2, 53, 8, 1, 'b');

    fblk(10, 45, 4, 1, 'b');
    fpx(10, 46, 'b');
    fblk(11, 46, 2, 1, 'r');
    fpx(13, 46, 'b');
    fpx(10, 47, 'b');
    fblk(11, 47, 2, 1, 'r');
    fpx(13, 47, 'b');
    fpx(10, 48, 'b');
    fblk(11, 48, 2, 1, 'w');
    fpx(13, 48, 'b');
    for (let y = 49; y <= 52; y++) {
      fpx(10, y, 'b');
      fblk(11, y, 2, 1, 'j');
      fpx(13, y, 'b');
    }
    fblk(11, 50, 2, 1, 'w');
    fblk(10, 53, 4, 1, 'b');

    fpx(2, 55, 'o');
    fpx(6, 54, 'e');
    fpx(9, 55, 'o');
    fpx(36, 55, 'o');
    fpx(41, 56, 'e');
    fpx(45, 55, 'o');
  }

  function drawPool() {
    fblk(3, -3, 3, 1, 'y');
    fblk(2, -2, 5, 3, 'y');
    fblk(3, 1, 3, 1, 'y');
    fpx(0, -1, 'e');
    fpx(8, -1, 'e');
    fpx(4, -4, 'e');
    fpx(4, 2, 'e');

    for (let x = -OX; x <= ART_COLS - 1 + OX; x++) {
      const surf = 41 + Math.round(Math.sin((x + ticks.pool * 0.7) * 0.5));
      fpx(x, surf, 'n');
      for (let y = surf + 1; y <= ART_ROWS + 7; y++) fpx(x, y, 'i');
    }
    for (let x = -OX; x <= ART_COLS - 1 + OX; x += 4) {
      const wy = 47 + Math.round(Math.sin((x + ticks.pool) * 0.8));
      fpx(x, wy, 'n');
    }

    // Grande bouée autour du buste : anneau rouge/blanc posé sous les bras.
    fblk(13, 39, 4, 1, 'b');
    fpx(12, 40, 'b');
    fblk(13, 40, 2, 1, 'j');
    fblk(15, 40, 2, 1, 'w');
    fpx(17, 40, 'b');
    fpx(12, 41, 'b');
    fblk(13, 41, 2, 1, 'j');
    fblk(15, 41, 2, 1, 'w');
    fpx(17, 41, 'b');
    fblk(13, 42, 4, 1, 'b');

    fblk(31, 39, 4, 1, 'b');
    fpx(30, 40, 'b');
    fblk(31, 40, 2, 1, 'w');
    fblk(33, 40, 2, 1, 'j');
    fpx(35, 40, 'b');
    fpx(30, 41, 'b');
    fblk(31, 41, 2, 1, 'w');
    fblk(33, 41, 2, 1, 'j');
    fpx(35, 41, 'b');
    fblk(31, 42, 4, 1, 'b');

    fblk(18, 42, 4, 1, 'j');
    fblk(22, 42, 4, 1, 'w');
    fblk(26, 42, 6, 1, 'j');

    fpx(21, 16, 'k');
    fpx(22, 16, 'k');
    fpx(20, 17, 'k');
    fblk(21, 17, 2, 1, 'n');
    fpx(23, 17, 'k');
    fpx(20, 18, 'k');
    fblk(21, 18, 2, 1, 'n');
    fpx(23, 18, 'k');
    fpx(21, 19, 'k');
    fpx(22, 19, 'k');
    fpx(26, 16, 'k');
    fpx(27, 16, 'k');
    fpx(25, 17, 'k');
    fblk(26, 17, 2, 1, 'n');
    fpx(28, 17, 'k');
    fpx(25, 18, 'k');
    fblk(26, 18, 2, 1, 'n');
    fpx(28, 18, 'k');
    fpx(26, 19, 'k');
    fpx(27, 19, 'k');
    fpx(24, 17, 'k');
    fpx(19, 17, 'k');
    fpx(29, 17, 'k');
    fpx(21, 17, 'w');
    fpx(26, 17, 'w');
    fpx(22, 18, 'k');
    fpx(27, 18, 'k');

    fblk(34, 12, 2, 9, 'j');
    fpx(34, 11, 'k');
    fpx(35, 11, 'k');
    fpx(33, 20, 'j');
    fpx(32, 21, 'j');
  }

  function coffeeSteam(baseX, topY, bottomY) {
    for (let y = bottomY; y >= topY; y--) {
      const off = Math.round(Math.sin((bottomY - y + ticks.cafe * 0.6) * 1.1));
      fpx(baseX + off, y, 'u');
    }
  }

  function drawCoffeeCup(x, y, full) {
    fpx(x, y, 'b');
    fblk(x + 1, y, 2, 1, full ? 'c' : 'd');
    fpx(x + 3, y, 'b');
    if (full) fpx(x + 1, y, 'e');
    fpx(x, y + 1, 'b');
    fblk(x + 1, y + 1, 2, 1, 'w');
    fblk(x + 3, y + 1, 2, 1, 'b');
    fpx(x, y + 2, 'b');
    fblk(x + 1, y + 2, 2, 1, 'w');
    fblk(x + 3, y + 2, 2, 1, 'b');
    fpx(x - 1, y + 3, 'b');
    fblk(x, y + 3, 4, 1, 'd');
    fpx(x + 4, y + 3, 'b');
  }

  function drawCoffee() {
    // Comptoir en bois où s'accumulent les tasses vidées.
    fblk(0, 57, 48, 1, 'o');
    fblk(0, 58, 48, 2, 'c');

    const slots = [4, 11, 18, 25, 32, 39];
    slots.forEach((cx, idx) => {
      drawCoffeeCup(cx, 53, idx === slots.length - 1);
    });

    // Vapeur du 6ème café, encore brûlant.
    coffeeSteam(40, 47, 52);
    coffeeSteam(41, 48, 52);

    // Yeux en spirale : Lenny a la tête qui tourne.
    const spiral = ['.###.', '#....', '#.##.', '#..#.', '.###.'];
    const drawSpiral = (sx, sy, mirror) => {
      fblk(sx, sy, 5, 5, 'w');
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (spiral[r][c] !== '#') continue;
          fpx(sx + (mirror ? 4 - c : c), sy + r, 'k');
        }
      }
    };
    drawSpiral(19, 14, false);
    drawSpiral(25, 14, true);
  }

  function drawFlower(fx, fy, col) {
    fpx(fx, fy + 2, 'q');
    fpx(fx, fy + 3, 'q');
    fpx(fx, fy - 1, col);
    fpx(fx - 1, fy, col);
    fpx(fx + 1, fy, col);
    fpx(fx, fy + 1, col);
    fpx(fx, fy, 'e');
  }

  function drawGarden() {
    const left = -OX;
    const right = ART_COLS - 1 + OX;

    // Soleil dans le coin haut droit.
    fblk(44, 4, 3, 3, 'e');
    fpx(45, 2, 'y');
    fpx(45, 8, 'y');
    fpx(42, 5, 'y');
    fpx(48, 5, 'y');

    // Pelouse avec un liseré plus foncé en haut.
    for (let x = left; x <= right; x++) {
      const top = 46 + [0, -1, 0, 1, 0, -1][((x % 6) + 6) % 6];
      fpx(x, top, 'q');
      for (let y = top + 1; y <= 56; y++) fpx(x, y, 'g');
    }

    // Massifs de buissons de part et d'autre de Lenny.
    const bush = (bx) => {
      fblk(bx, 49, 9, 5, 'q');
      fblk(bx + 1, 47, 7, 2, 'q');
      fblk(bx + 3, 46, 3, 1, 'q');
      fpx(bx + 2, 48, 'g');
      fpx(bx + 6, 50, 'g');
      fpx(bx + 4, 47, 'g');
    };
    bush(-5);
    bush(37);

    // Quelques fleurs sur la pelouse.
    drawFlower(2, 51, 'r');
    drawFlower(7, 52, 'y');
    drawFlower(40, 51, 'p');
    drawFlower(45, 52, 'r');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (cafe) drawGarden();
  for (let y = 0; y < ART_ROWS; y++) {
    const row = SPRITE[y];
    for (let x = 0; x < ART_COLS; x++) fpx(x, y, row[x]);
  }
  if (breakfast) drawBreakfast();
  if (pool) drawPool();
  if (cafe) drawCoffee();
  if (expr && FACE[expr]) {
    for (const [x, y, key] of FACE[expr]) fpx(x, y, key);
  }
}

function moodFor(mode) {
  if (mode === 'sleep') return 'Lenny dort encore un peu.';
  if (mode === 'breakfast') {
    return 'Lenny prend son petit déjeuner : tartines, confiture de fraise et double expresso.';
  }
  if (mode === 'pool') return 'Lenny se prélasse à la piscine : masque, tuba et eau fraîche.';
  if (mode === 'cafe') return 'Lenny en est déjà à son 6ème café : impossible de l’arrêter.';
  return '';
}

async function readJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(fallbackMessage);
  }
  return response.json();
}

async function fetchDefaultMode() {
  const response = await fetch('/api/lenny-state');
  if (!response.ok) return 'auto';
  const data = await readJsonResponse(response, 'API locale indisponible, mode auto utilisé.');
  return ADMIN_MODES.includes(data.mode) ? data.mode : 'auto';
}

async function saveDefaultMode(mode) {
  const response = await fetch('/api/lenny-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });

  if (!response.ok) {
    const data = await readJsonResponse(response, 'API indisponible en local. Utilise la version en ligne ou vercel dev.').catch(
      () => ({})
    );
    throw new Error(data.error || 'Impossible de sauvegarder.');
  }

  return readJsonResponse(response, 'API indisponible en local. Utilise la version en ligne ou vercel dev.');
}

async function sendPushMessage(message) {
  const response = await fetch('/api/send-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await readJsonResponse(response, 'API indisponible en local. Utilise la version en ligne ou vercel dev.').catch(
    () => ({})
  );
  if (!response.ok) throw new Error(data.error || 'Impossible d’envoyer la notification.');
  return data;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function registerPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Notifications non supportées sur cet appareil.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js?v=3');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications refusées.');

  const keyResponse = await fetch('/api/vapid-public-key');
  if (!keyResponse.ok) throw new Error('Clé notification indisponible.');
  const { publicKey } = await readJsonResponse(
    keyResponse,
    'Notifications disponibles sur la version en ligne ou avec vercel dev.'
  );

  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const response = await fetch('/api/push-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });

  if (!response.ok) throw new Error('Abonnement impossible.');
  return subscription;
}

function notificationMessageFromUrl() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('message')?.trim() || '';
}

function AdminPage() {
  const [mode, setMode] = useState('auto');
  const [status, setStatus] = useState('Chargement...');
  const [saving, setSaving] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const [sendingPush, setSendingPush] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDefaultMode()
      .then((nextMode) => {
        if (cancelled) return;
        setMode(nextMode);
        setStatus('Prêt.');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(nextMode) {
    setSaving(true);
    setStatus('Sauvegarde...');
    try {
      const result = await saveDefaultMode(nextMode);
      setMode(result.mode);
      setStatus(`État par défaut : ${MODE_LABELS[result.mode]}.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendPush(event) {
    event.preventDefault();
    setSendingPush(true);
    setPushStatus('Envoi...');
    try {
      const result = await sendPushMessage(pushMessage);
      setPushStatus(`Notification envoyée à ${result.sent}/${result.total} appareil(s).`);
    } catch (error) {
      setPushStatus(error.message);
    } finally {
      setSendingPush(false);
    }
  }

  return (
    <main className="admin-app">
      <section className="admin-card">
        <p className="admin-eyebrow">LENNYGOTCHI</p>
        <h1>État par défaut</h1>
        <p className="admin-copy">Choisis ce que tout le monde verra en ouvrant Lenny.</p>

        <div className="admin-actions">
          {ADMIN_MODES.map((item) => (
            <button
              className={item === mode ? 'selected' : ''}
              disabled={saving}
              key={item}
              onClick={() => handleSave(item)}
              type="button"
            >
              {MODE_LABELS[item]}
            </button>
          ))}
        </div>

        <p className="admin-status" aria-live="polite">
          {status}
        </p>

        <form className="admin-push-form" onSubmit={handleSendPush}>
          <label>
            Notification push
            <textarea
              maxLength="180"
              onChange={(event) => setPushMessage(event.target.value)}
              placeholder="Ton message"
              rows="3"
              value={pushMessage}
            />
          </label>
          <button disabled={sendingPush || !pushMessage.trim()} type="submit">
            Envoyer la notification
          </button>
          <p className="admin-status" aria-live="polite">
            {pushStatus}
          </p>
        </form>

        <a className="admin-link" href="/">
          Voir Lenny
        </a>
      </section>
    </main>
  );
}

function LennyApp() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const touchedRef = useRef(false);
  const tickRef = useRef({ breakfast: 0, pool: 0, cafe: 0 });
  const lastActiveAtRef = useRef(Date.now());
  const resumeReloadedRef = useRef(false);
  const [manualMode, setManualMode] = useState(null);
  const [defaultMode, setDefaultMode] = useState('auto');
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [clockTick, setClockTick] = useState(() => Date.now());
  const [resumeTick, setResumeTick] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState(() => notificationMessageFromUrl());
  const mode = useMemo(() => {
    const remoteMode = defaultMode === 'auto' ? scheduledMode(new Date(clockTick)) : defaultMode;
    if (notificationMessage) return 'awake';
    return manualMode || remoteMode;
  }, [clockTick, defaultMode, manualMode, notificationMessage]);
  const asleep = mode === 'sleep';

  const refreshState = useCallback(async () => {
    setClockTick(Date.now());
    try {
      setDefaultMode(await fetchDefaultMode());
    } catch {
      setDefaultMode('auto');
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClockTick(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const markActive = () => {
      lastActiveAtRef.current = Date.now();
    };

    const reloadIfResumed = () => {
      const now = Date.now();
      const wasSuspended = now - lastActiveAtRef.current > RESUME_RELOAD_AFTER_MS;
      lastActiveAtRef.current = now;
      if (!wasSuspended || resumeReloadedRef.current) return;

      resumeReloadedRef.current = true;
      window.location.reload();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markActive();
        return;
      }
      reloadIfResumed();
    };

    const resumeWatchId = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      reloadIfResumed();
    }, 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', reloadIfResumed);
    window.addEventListener('pageshow', reloadIfResumed);
    window.addEventListener('pagehide', markActive);

    return () => {
      window.clearInterval(resumeWatchId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', reloadIfResumed);
      window.removeEventListener('pageshow', reloadIfResumed);
      window.removeEventListener('pagehide', markActive);
    };
  }, []);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setPushSupported(supported);
    if (!supported) return;

    navigator.serviceWorker.register('/sw.js?v=3').catch(() => {
      setPushStatus('Notifications indisponibles.');
    });

    if (Notification.permission === 'granted') {
      setPushEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!notificationMessage) return undefined;

    setManualMode(null);
    refreshState();

    const url = new URL(window.location.href);
    url.searchParams.delete('message');
    url.searchParams.delete('push');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    const timeout = window.setTimeout(() => {
      setNotificationMessage('');
      refreshState();
      setResumeTick((tick) => tick + 1);
    }, NOTIFICATION_MESSAGE_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [notificationMessage, refreshState]);

  useEffect(() => {
    refreshState();
    const id = window.setInterval(refreshState, 30000);

    const handleForeground = () => {
      if (document.visibilityState !== 'visible') return;
      refreshState();
      setResumeTick((tick) => tick + 1);
    };
    document.addEventListener('visibilitychange', handleForeground);
    window.addEventListener('focus', handleForeground);
    window.addEventListener('pageshow', handleForeground);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', handleForeground);
      window.removeEventListener('focus', handleForeground);
      window.removeEventListener('pageshow', handleForeground);
    };
  }, [refreshState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const timeouts = new Set();
    const draw = (expr = null) => drawScene(canvas, mode, expr, tickRef.current);

    draw(mode === 'sleep' ? 'sleep' : null);

    const blinkId = window.setInterval(() => {
      if (mode !== 'sleep' && mode !== 'pool' && mode !== 'cafe' && Math.random() < 0.5) {
        draw('blink');
        const timeout = window.setTimeout(() => draw(), 160);
        timeouts.add(timeout);
      }
    }, 4200);

    const sleepId = window.setInterval(() => {
      if (mode !== 'sleep' || Math.random() >= 0.6 || !stageRef.current) return;
      const el = document.createElement('span');
      el.className = 'spark';
      el.textContent = 'z';
      el.style.left = `${stageRef.current.clientWidth * 0.62}px`;
      el.style.top = `${stageRef.current.clientHeight * 0.18}px`;
      stageRef.current.appendChild(el);
      const timeout = window.setTimeout(() => el.remove(), 1400);
      timeouts.add(timeout);
    }, 2600);

    const breakfastId = window.setInterval(() => {
      if (mode !== 'breakfast') return;
      tickRef.current.breakfast += 1;
      draw();
    }, 420);

    const poolId = window.setInterval(() => {
      if (mode !== 'pool') return;
      tickRef.current.pool += 1;
      draw();
    }, 360);

    const cafeId = window.setInterval(() => {
      if (mode !== 'cafe') return;
      tickRef.current.cafe += 1;
      draw();
    }, 420);

    return () => {
      window.clearInterval(blinkId);
      window.clearInterval(sleepId);
      window.clearInterval(breakfastId);
      window.clearInterval(poolId);
      window.clearInterval(cafeId);
      for (const timeout of timeouts) window.clearTimeout(timeout);
    };
  }, [mode, resumeTick]);

  function cycleMode() {
    setManualMode((currentManualMode) => {
      const remoteMode = defaultMode === 'auto' ? scheduledMode() : defaultMode;
      const currentMode = currentManualMode || remoteMode;
      return MODES[(MODES.indexOf(currentMode) + 1) % MODES.length];
    });
  }

  function handleTouchStart(event) {
    event.preventDefault();
    if (notificationMessage) return;
    touchedRef.current = true;
    cycleMode();
  }

  function handleClick() {
    if (notificationMessage) return;
    if (touchedRef.current) {
      touchedRef.current = false;
      return;
    }
    cycleMode();
  }

  async function handleEnablePush() {
    setPushStatus('Activation...');
    try {
      await registerPushSubscription();
      setPushEnabled(true);
      setPushStatus('');
    } catch (error) {
      setPushStatus(error.message);
    }
  }

  return (
    <main className={`app ${asleep ? 'asleep' : ''}`}>
      <section className="lenny-screen">
        <div className="stage" ref={stageRef}>
          <canvas
            ref={canvasRef}
            className="lenny breathe"
            width="480"
            height="576"
            role="img"
            aria-label={`Lenny en mode ${mode}`}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        </div>
        <p className="mood" aria-live="polite">
          {notificationMessage || moodFor(mode)}
        </p>
        {pushSupported && !pushEnabled ? (
          <button className="push-button" type="button" onClick={handleEnablePush}>
            Activer les nouvelles de Lenny
          </button>
        ) : null}
        {pushStatus ? (
          <p className="push-status" aria-live="polite">
            {pushStatus}
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default function App() {
  return window.location.pathname === '/admin' ? <AdminPage /> : <LennyApp />;
}
