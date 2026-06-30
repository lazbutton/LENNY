import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, drawScene } from './lenny-renderer.js';
import { ADMIN_MODES, MODE_LABELS, MODES, moodFor, nextMode, scheduledMode, stateFor } from './lenny-states.js';

const RESUME_RELOAD_AFTER_MS = 5000;
const NOTIFICATION_MESSAGE_DURATION_MS = 6000;
const DEFAULT_NOTIFICATION_DURATION_SECONDS = NOTIFICATION_MESSAGE_DURATION_MS / 1000;
const NOTIFICATION_DURATION_OPTIONS = [3, 6, 10, 0];
const PUSH_TEMPLATES = ['Je pense à toi', 'Regarde Lenny', 'Petit coucou'];
const APP_VERSION = '1.0.0';
const DEV_CONTROLS_ENABLED = import.meta.env.DEV;
const NOTIFICATION_STORAGE_KEY = 'lenny_notification_override';
const EMPTY_NOTIFICATION = { durationMs: NOTIFICATION_MESSAGE_DURATION_MS, expiresAt: 0, infinite: false, message: '', mode: '' };
const DEFAULT_SETTINGS = {
  messageOfDay: '',
  mode: 'auto',
  scheduledMode: '',
  scheduledUntil: '',
};

async function readJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(fallbackMessage);
  }
  return response.json();
}

function normalizeSettings(data = {}) {
  return {
    messageOfDay: String(data.messageOfDay || ''),
    mode: ADMIN_MODES.includes(data.mode) ? data.mode : 'auto',
    scheduledMode: ADMIN_MODES.includes(data.scheduledMode) ? data.scheduledMode : '',
    scheduledUntil: data.scheduledUntil && !Number.isNaN(new Date(data.scheduledUntil).getTime()) ? data.scheduledUntil : '',
  };
}

function modeFromSettings(settings, date = new Date()) {
  if (settings.scheduledMode && settings.scheduledUntil && new Date(settings.scheduledUntil).getTime() > date.getTime()) {
    return settings.scheduledMode;
  }
  return settings.mode === 'auto' ? scheduledMode(date) : settings.mode;
}

function scheduleUntilFromTime(timeValue) {
  if (!timeValue) return '';
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return '';

  const until = new Date();
  until.setHours(hours, minutes, 0, 0);
  if (until.getTime() <= Date.now()) until.setDate(until.getDate() + 1);
  return until.toISOString();
}

function formatSchedule(isoValue) {
  if (!isoValue) return '';
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(isoValue));
}

async function fetchSettings() {
  const response = await fetch('/api/lenny-state');
  if (!response.ok) return DEFAULT_SETTINGS;
  const data = await readJsonResponse(response, 'API locale indisponible, mode auto utilisé.');
  return normalizeSettings(data);
}

async function saveSettings(partialSettings) {
  const response = await fetch('/api/lenny-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partialSettings),
  });

  if (!response.ok) {
    const data = await readJsonResponse(response, 'API indisponible en local. Utilise la version en ligne ou vercel dev.').catch(
      () => ({})
    );
    throw new Error(data.error || 'Impossible de sauvegarder.');
  }

  const data = await readJsonResponse(response, 'API indisponible en local. Utilise la version en ligne ou vercel dev.');
  return normalizeSettings(data);
}

function formatDuration(seconds) {
  return seconds === 0 ? 'Infini' : `${seconds}s`;
}

function clearStoredNotification() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
}

function normalizeNotification(value = {}) {
  const message = String(value.message || '').trim();
  const mode = MODES.includes(value.mode) ? value.mode : '';
  const infinite = Boolean(value.infinite);
  const expiresAt = Number(value.expiresAt || 0);
  const durationMs = Number(value.durationMs || NOTIFICATION_MESSAGE_DURATION_MS);

  if (!message && !mode) return EMPTY_NOTIFICATION;
  if (!infinite && (!expiresAt || expiresAt <= Date.now())) {
    clearStoredNotification();
    return EMPTY_NOTIFICATION;
  }

  return {
    durationMs: infinite ? 0 : Math.max(0, expiresAt - Date.now()) || durationMs,
    expiresAt,
    infinite,
    message,
    mode,
  };
}

function storeNotification(notification) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeNotification(notification);
  if (!normalized.message && !normalized.mode) {
    clearStoredNotification();
    return;
  }
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(normalized));
}

function readStoredNotification() {
  if (typeof window === 'undefined') return EMPTY_NOTIFICATION;
  try {
    return normalizeNotification(JSON.parse(window.localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '{}'));
  } catch {
    clearStoredNotification();
    return EMPTY_NOTIFICATION;
  }
}

async function sendPushMessage(message, durationSeconds, mode) {
  const response = await fetch('/api/send-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ durationSeconds, message, mode }),
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

  const registration = await navigator.serviceWorker.register('/sw.js?v=4');
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

function notificationFromUrl() {
  if (typeof window === 'undefined') return EMPTY_NOTIFICATION;
  const params = new URLSearchParams(window.location.search);
  const hasNotificationParams = params.has('message') || params.has('mode') || params.has('duration');
  if (!hasNotificationParams) return readStoredNotification();

  const rawDuration = params.get('duration');
  const durationSeconds = rawDuration === '0' ? 0 : Number(rawDuration || DEFAULT_NOTIFICATION_DURATION_SECONDS);
  const safeDurationSeconds = NOTIFICATION_DURATION_OPTIONS.includes(durationSeconds)
    ? durationSeconds
    : DEFAULT_NOTIFICATION_DURATION_SECONDS;
  const mode = MODES.includes(params.get('mode')) ? params.get('mode') : '';
  const notification = normalizeNotification({
    durationMs: safeDurationSeconds === 0 ? 0 : safeDurationSeconds * 1000,
    expiresAt: safeDurationSeconds === 0 ? 0 : Date.now() + safeDurationSeconds * 1000,
    infinite: safeDurationSeconds === 0,
    message: params.get('message')?.trim() || '',
    mode,
  });
  storeNotification(notification);
  return notification;
}

function AdminPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState('Chargement...');
  const [saving, setSaving] = useState(false);
  const [pushMessage, setPushMessage] = useState('');
  const [pushDurationSeconds, setPushDurationSeconds] = useState(DEFAULT_NOTIFICATION_DURATION_SECONDS);
  const [pushMode, setPushMode] = useState('awake');
  const [pushStatus, setPushStatus] = useState('');
  const [sendingPush, setSendingPush] = useState(false);
  const [scheduledMode, setScheduledMode] = useState('amour');
  const [scheduledTime, setScheduledTime] = useState('');
  const mode = settings.mode;

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((nextSettings) => {
        if (cancelled) return;
        setSettings(nextSettings);
        if (nextSettings.scheduledMode) setScheduledMode(nextSettings.scheduledMode);
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

  async function persistSettings(partialSettings, successMessage) {
    setSaving(true);
    setStatus('Sauvegarde...');
    try {
      const nextSettings = await saveSettings(partialSettings);
      setSettings(nextSettings);
      setStatus(successMessage(nextSettings));
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSave(nextMode) {
    persistSettings({ mode: nextMode }, (nextSettings) => `État par défaut : ${MODE_LABELS[nextSettings.mode]}.`);
  }

  function handleMessageOfDayChange(event) {
    setSettings((current) => ({ ...current, messageOfDay: event.target.value }));
  }

  function handleSaveMessageOfDay() {
    persistSettings(
      { messageOfDay: settings.messageOfDay },
      (nextSettings) => (nextSettings.messageOfDay ? 'Message du jour sauvegardé.' : 'Message du jour retiré.')
    );
  }

  function handleSchedule() {
    const scheduledUntil = scheduleUntilFromTime(scheduledTime);
    if (!scheduledUntil) {
      setStatus('Choisis une heure de fin.');
      return;
    }
    persistSettings(
      { scheduledMode, scheduledUntil },
      () => `${MODE_LABELS[scheduledMode]} programmé jusqu’à ${formatSchedule(scheduledUntil)}.`
    );
  }

  function handleClearSchedule() {
    persistSettings({ scheduledMode: '', scheduledUntil: '' }, () => 'Programmation retirée.');
  }

  async function handleSendPush(event) {
    event.preventDefault();
    setSendingPush(true);
    setPushStatus('Envoi...');
    try {
      const result = await sendPushMessage(pushMessage, pushDurationSeconds, pushMode);
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

        <button
          className={`admin-auto-button ${mode === 'auto' ? 'selected' : ''}`}
          disabled={saving}
          onClick={() => handleSave('auto')}
          type="button"
        >
          Retour auto
        </button>

        <label className="admin-field">
          État
          <select disabled={saving} value={mode} onChange={(event) => handleSave(event.target.value)}>
            {ADMIN_MODES.map((item) => (
              <option key={item} value={item}>
                {MODE_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          Message du jour
          <textarea
            maxLength="140"
            onChange={handleMessageOfDayChange}
            placeholder="Message visible sans notification"
            rows="2"
            value={settings.messageOfDay}
          />
        </label>
        <button className="admin-secondary-button" disabled={saving} onClick={handleSaveMessageOfDay} type="button">
          Sauvegarder le message du jour
        </button>

        <div className="admin-schedule">
          <p>Programmer temporairement</p>
          <select value={scheduledMode} onChange={(event) => setScheduledMode(event.target.value)}>
            {MODES.map((item) => (
              <option key={item} value={item}>
                {MODE_LABELS[item]}
              </option>
            ))}
          </select>
          <input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
          <button disabled={saving} onClick={handleSchedule} type="button">
            Programmer
          </button>
          {settings.scheduledMode && settings.scheduledUntil ? (
            <button disabled={saving} onClick={handleClearSchedule} type="button">
              Retirer la programmation
            </button>
          ) : null}
          {settings.scheduledMode && settings.scheduledUntil ? (
            <p className="admin-status">
              Actif : {MODE_LABELS[settings.scheduledMode]} jusqu’à {formatSchedule(settings.scheduledUntil)}
            </p>
          ) : null}
        </div>

        <details className="admin-gallery">
          <summary>Galerie des états</summary>
          <div className="admin-gallery-grid">
            {MODES.map((item) => (
              <span key={item}>{MODE_LABELS[item]}</span>
            ))}
          </div>
        </details>

        <div className="admin-preview">
          <p>Prévisualisation</p>
          <span>État par défaut : {MODE_LABELS[mode]}</span>
          <span>Au clic notif : {MODE_LABELS[pushMode]}</span>
          <span>Message : {pushMessage || 'Aucun message de notif'}</span>
          <span>Durée : {formatDuration(pushDurationSeconds)}</span>
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
          <div className="admin-template-list" aria-label="Templates de notification">
            {PUSH_TEMPLATES.map((template) => (
              <button key={template} type="button" onClick={() => setPushMessage(template)}>
                {template}
              </button>
            ))}
          </div>
          <label className="admin-field">
            État au clic
            <select value={pushMode} onChange={(event) => setPushMode(event.target.value)}>
              {MODES.map((item) => (
                <option key={item} value={item}>
                  {MODE_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-duration-group" aria-label="Durée du message">
            <span>Durée affichage état/message</span>
            <div className="admin-duration-options">
              {NOTIFICATION_DURATION_OPTIONS.map((duration) => (
                <button
                  className={duration === pushDurationSeconds ? 'selected' : ''}
                  key={duration}
                  type="button"
                  onClick={() => setPushDurationSeconds(duration)}
                >
                  {formatDuration(duration)}
                </button>
              ))}
            </div>
          </div>
          <button disabled={sendingPush || !pushMessage.trim()} type="submit">
            Envoyer la notification
          </button>
          <p className="admin-status" aria-live="polite">
            {pushStatus}
          </p>
        </form>

        <p className="admin-version">App v{APP_VERSION} · SW v4</p>

        <a className="admin-link" href="/">
          Voir Lenny
        </a>
      </section>
    </main>
  );
}

function LennyApp() {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const tickRef = useRef(Object.fromEntries(MODES.map((item) => [item, 0])));
  const lastActiveAtRef = useRef(Date.now());
  const longPressRef = useRef(false);
  const pressTimerRef = useRef(null);
  const reactionExprTimerRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const resumeReloadedRef = useRef(false);
  const [manualMode, setManualMode] = useState(null);
  const [reactionExpr, setReactionExpr] = useState('');
  const [reactionMessage, setReactionMessage] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsReady, setSettingsReady] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [musicMuted, setMusicMuted] = useState(true);
  const [clockTick, setClockTick] = useState(() => Date.now());
  const [resumeTick, setResumeTick] = useState(0);
  const [notification, setNotification] = useState(() => notificationFromUrl());
  const notificationMessage = notification.message;
  const notificationActive = Boolean(notificationMessage || notification.mode);
  const visualReady = notificationActive || settingsReady;
  const mode = useMemo(() => {
    const remoteMode = modeFromSettings(settings, new Date(clockTick));
    if (notificationActive) return notification.mode || 'awake';
    return manualMode || remoteMode;
  }, [clockTick, manualMode, notification.mode, notificationActive, settings]);
  const activeState = useMemo(() => stateFor(mode), [mode]);
  const asleep = visualReady && activeState.sleepEffect;
  const isMusicListen = mode === 'musicListen';
  const isMinecraft = mode === 'minecraft';
  const audioSrc = isMusicListen ? '/Maribou%20State%20-%20Eko%E2%80%99s%20(Official%20Audio).mp3' : '/sable%20chaud.mp3';

  function showReaction(message, sparkText = '♥', expr = 'blink') {
    setReactionMessage(message);
    setReactionExpr(expr);
    window.clearTimeout(reactionExprTimerRef.current);
    window.clearTimeout(reactionTimerRef.current);
    reactionExprTimerRef.current = window.setTimeout(() => setReactionExpr(''), 520);
    reactionTimerRef.current = window.setTimeout(() => setReactionMessage(''), 2200);

    if (!stageRef.current) return;
    const el = document.createElement('span');
    el.className = 'spark reaction-spark';
    el.textContent = sparkText;
    el.style.left = `${stageRef.current.clientWidth * 0.68}px`;
    el.style.top = `${stageRef.current.clientHeight * 0.2}px`;
    stageRef.current.appendChild(el);
    window.setTimeout(() => el.remove(), 1400);
  }

  const clearNotificationOverride = useCallback(() => {
    clearStoredNotification();
    setNotification(EMPTY_NOTIFICATION);
  }, []);

  const refreshState = useCallback(async () => {
    setClockTick(Date.now());
    try {
      setSettings(await fetchSettings());
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setSettingsReady(true);
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClockTick(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    window.screen?.orientation?.lock?.('portrait').catch(() => {});
  }, []);

  useEffect(() => {
    const image = new Image();
    image.decoding = 'async';
    image.src = '/music.PNG';

    const minecraftImage = new Image();
    minecraftImage.decoding = 'async';
    minecraftImage.src = '/lenny-minecraft.png';
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (notificationActive || Math.random() > 0.25) return;
      showReaction('Lenny fait un petit coucou.', '*');
    }, 42000);

    return () => window.clearInterval(id);
  }, [notificationActive]);

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

    navigator.serviceWorker.register('/sw.js?v=7').catch(() => {
      setPushStatus('Notifications indisponibles.');
    });

    if (Notification.permission === 'granted') {
      setPushEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!notificationActive) return undefined;

    setManualMode(null);
    refreshState();

    const url = new URL(window.location.href);
    url.searchParams.delete('message');
    url.searchParams.delete('mode');
    url.searchParams.delete('push');
    url.searchParams.delete('duration');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

    if (notification.infinite) return undefined;

    const timeout = window.setTimeout(() => {
      clearNotificationOverride();
      refreshState();
      setResumeTick((tick) => tick + 1);
    }, notification.durationMs);

    return () => window.clearTimeout(timeout);
  }, [clearNotificationOverride, notification.durationMs, notification.infinite, notificationActive, refreshState]);

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

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visualReady) return undefined;

    const timeouts = new Set();
    const draw = (expr = null) => drawScene(canvas, mode, expr, tickRef.current);

    draw(reactionExpr || (activeState.sleepEffect ? 'sleep' : null));

    const blinkId = window.setInterval(() => {
      if (activeState.allowBlink && Math.random() < 0.5) {
        draw('blink');
        const timeout = window.setTimeout(() => draw(), 160);
        timeouts.add(timeout);
      }
    }, 4200);

    const sleepId = window.setInterval(() => {
      if (!activeState.sleepEffect || Math.random() >= 0.6 || !stageRef.current) return;
      const el = document.createElement('span');
      el.className = 'spark';
      el.textContent = 'z';
      el.style.left = `${stageRef.current.clientWidth * 0.62}px`;
      el.style.top = `${stageRef.current.clientHeight * 0.18}px`;
      stageRef.current.appendChild(el);
      const timeout = window.setTimeout(() => el.remove(), 1400);
      timeouts.add(timeout);
    }, 2600);

    const animationId = activeState.animated && activeState.tickMs
      ? window.setInterval(() => {
          tickRef.current[mode] = (tickRef.current[mode] || 0) + 1;
          draw();
        }, activeState.tickMs)
      : null;

    return () => {
      window.clearInterval(blinkId);
      window.clearInterval(sleepId);
      if (animationId) window.clearInterval(animationId);
      for (const timeout of timeouts) window.clearTimeout(timeout);
    };
  }, [activeState, mode, reactionExpr, resumeTick, visualReady]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = musicMuted;
  }, [musicMuted]);

  function cycleMode() {
    setManualMode((currentManualMode) => {
      const remoteMode = modeFromSettings(settings);
      const currentMode = currentManualMode || remoteMode;
      return nextMode(currentMode);
    });
  }

  function handlePressStart(event) {
    event.preventDefault();
    if (!visualReady) return;
    longPressRef.current = false;
    window.clearTimeout(pressTimerRef.current);
    pressTimerRef.current = window.setTimeout(() => {
      longPressRef.current = true;
      showReaction('Lenny pense à toi.', '♥');
    }, 520);
  }

  function handlePressEnd(event) {
    event.preventDefault();
    if (!visualReady) return;
    window.clearTimeout(pressTimerRef.current);
    if (longPressRef.current) return;
    if (notificationActive) {
      const nextManualMode = nextMode(mode);
      clearNotificationOverride();
      setManualMode(nextManualMode);
      return;
    }
    cycleMode();
  }

  function handlePressCancel() {
    window.clearTimeout(pressTimerRef.current);
  }

  function handleDevModeChange(event) {
    clearNotificationOverride();
    setManualMode(event.target.value);
  }

  async function handleMusicKeyboardClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const audio = audioRef.current;
    if (!audio) return;

    if (!musicMuted) {
      audio.muted = true;
      setMusicMuted(true);
      setReactionMessage('');
      return;
    }

    audio.muted = false;
    setMusicMuted(false);
    try {
      await audio.play();
      showReaction('Banger lancé.', '♪');
    } catch {
      setMusicMuted(true);
      audio.muted = true;
      showReaction('Clique encore pour le son.', '♪');
    }
  }

  async function handleListeningAudioClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const audio = audioRef.current;
    if (!audio) return;

    if (!musicMuted) {
      audio.muted = true;
      setMusicMuted(true);
      return;
    }

    audio.muted = false;
    setMusicMuted(false);
    try {
      await audio.play();
    } catch {
      setMusicMuted(true);
      audio.muted = true;
    }
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
    <main
      className={`app ${asleep ? 'asleep' : ''} ${isMusicListen ? 'is-image-scene' : ''} ${
        isMusicListen ? 'is-listening-scene' : ''
      } ${isMinecraft ? 'is-minecraft-scene' : ''}`}
    >
      <section className="lenny-screen">
        <audio ref={audioRef} key={audioSrc} src={audioSrc} loop autoPlay muted={musicMuted} preload="auto" />
        <div className={`stage ${isMusicListen ? 'image-scene-stage' : ''}`} ref={stageRef}>
          {isMusicListen ? (
            <>
              <img className="image-scene-background" src="/music.PNG" alt="Lenny écoute de la musique dans un paysage fleuri" />
              <div className="listening-pixel-layer" aria-hidden="true">
                <span className="pixel-note note-one" />
                <span className="pixel-note note-two" />
                <span className="pixel-note note-three" />
                <span className="pixel-sparkle sparkle-one" />
                <span className="pixel-sparkle sparkle-two" />
              </div>
              <button
                className="image-scene-hitbox"
                type="button"
                aria-label="Changer d’état"
                onContextMenu={(event) => event.preventDefault()}
                onPointerCancel={handlePressCancel}
                onPointerDown={handlePressStart}
                onPointerLeave={handlePressCancel}
                onPointerUp={handlePressEnd}
                onSelectStart={(event) => event.preventDefault()}
              />
              <button
                className={`listening-head-audio-toggle ${musicMuted ? 'is-muted' : 'is-playing'}`}
                type="button"
                aria-label={musicMuted ? 'Activer la musique' : 'Couper la musique'}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onPointerUp={handleListeningAudioClick}
              />
            </>
          ) : isMinecraft ? (
            <>
              <img
                className={`minecraft-photo breathe ${visualReady ? '' : 'is-pending'}`}
                src="/lenny-minecraft.png"
                alt="Lenny dans Minecraft sous des cerisiers"
                onContextMenu={(event) => event.preventDefault()}
                onPointerCancel={handlePressCancel}
                onPointerDown={handlePressStart}
                onPointerLeave={handlePressCancel}
                onPointerUp={handlePressEnd}
                onSelectStart={(event) => event.preventDefault()}
              />
            </>
          ) : (
            <>
              {mode === 'backrooms' ? (
                <img aria-hidden="true" className="backrooms-background" src="/backrooms.gif" alt="" />
              ) : null}
              <canvas
                ref={canvasRef}
                className={`lenny breathe ${visualReady ? '' : 'is-pending'}`}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                role="img"
                aria-label={visualReady ? `Lenny en mode ${mode}` : 'Lenny se prépare'}
                onContextMenu={(event) => event.preventDefault()}
                onPointerCancel={handlePressCancel}
                onPointerDown={handlePressStart}
                onPointerLeave={handlePressCancel}
                onPointerUp={handlePressEnd}
                onSelectStart={(event) => event.preventDefault()}
              />
              {mode === 'music' ? (
                <button
                  className="music-keyboard-hotspot"
                  type="button"
                  aria-label={musicMuted ? 'Activer la musique' : 'Musique activée'}
                  onClick={handleMusicKeyboardClick}
                  onPointerDown={(event) => event.stopPropagation()}
                />
              ) : null}
            </>
          )}
        </div>
        {!isMusicListen ? (
          <p className="mood" aria-live="polite">
            {visualReady ? notificationMessage || reactionMessage || settings.messageOfDay || moodFor(mode) : ''}
          </p>
        ) : null}
        {DEV_CONTROLS_ENABLED && !isMusicListen ? (
          <label className="dev-state-select">
            État dev
            <select value={mode} onChange={handleDevModeChange}>
              {MODES.map((item) => (
                <option key={item} value={item}>
                  {MODE_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
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
