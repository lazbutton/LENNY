export const LENNY_STATES = {
  awake: {
    label: 'Réveillé',
    mood: '',
    scene: null,
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: true,
    sleepEffect: false,
  },
  sleep: {
    label: 'Dodo',
    mood: 'Lenny dort encore un peu.',
    scene: null,
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: false,
    sleepEffect: true,
  },
  breakfast: {
    label: 'Petit déjeuner',
    mood: 'Lenny prend son petit déjeuner : tartines, confiture de fraise et double expresso.',
    scene: 'breakfast',
    backgroundScene: null,
    animated: true,
    tickMs: 420,
    allowBlink: true,
    sleepEffect: false,
  },
  pool: {
    label: 'Piscine',
    mood: 'Lenny se prélasse à la piscine : masque, tuba et eau fraîche.',
    scene: 'pool',
    backgroundScene: null,
    animated: true,
    tickMs: 360,
    allowBlink: false,
    sleepEffect: false,
  },
  cafe: {
    label: '6ème café',
    mood: 'Lenny en est déjà à son 6ème café : impossible de l’arrêter.',
    scene: 'cafe',
    backgroundScene: 'garden',
    animated: true,
    tickMs: 420,
    allowBlink: false,
    sleepEffect: false,
  },
  amour: {
    label: 'Câlin',
    mood: 'Lenny réclame un gros câlin tout doux.',
    scene: 'amour',
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: false,
    sleepEffect: false,
  },
  badminton: {
    label: 'Badminton',
    mood: 'Lenny fait du badminton',
    scene: 'badminton',
    backgroundScene: 'badmintonPark',
    animated: true,
    tickMs: 420,
    allowBlink: true,
    sleepEffect: false,
  },
  music: {
    label: 'Musique',
    mood: 'Lenny droppe un banger.',
    scene: 'music',
    backgroundScene: 'studio',
    animated: true,
    tickMs: 360,
    allowBlink: true,
    sleepEffect: false,
  },
  musicListen: {
    label: 'Écoute musique',
    mood: '',
    scene: null,
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: false,
    sleepEffect: false,
  },
  minecraft: {
    label: 'Minecraft',
    mood: '/tp @Lenny @Chloé',
    scene: null,
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: false,
    sleepEffect: false,
  },
  sad: {
    label: 'Triste',
    mood: 'Lenny est un peu triste, il a besoin d’un câlin.',
    scene: 'sad',
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: false,
    sleepEffect: false,
  },
  grumpy: {
    label: 'Pas content',
    mood: 'Lenny n’est pas content.',
    scene: 'grumpy',
    backgroundScene: null,
    animated: false,
    tickMs: null,
    allowBlink: false,
    sleepEffect: false,
  },
  backrooms: {
    label: 'Backrooms',
    mood: 'Lenny s’est perdu dans les Backrooms.',
    scene: 'backrooms',
    backgroundScene: 'backrooms',
    animated: false,
    tickMs: null,
    allowBlink: true,
    sleepEffect: false,
  },
};

export const MODES = Object.keys(LENNY_STATES);
export const PUBLIC_MODES = MODES.filter((mode) => !['sad', 'grumpy'].includes(mode));
export const ADMIN_MODES = ['auto', ...MODES];
export const VALID_MODES = new Set(ADMIN_MODES);

export const MODE_LABELS = {
  auto: 'Auto horaire',
  ...Object.fromEntries(MODES.map((mode) => [mode, LENNY_STATES[mode].label])),
};

export function stateFor(mode) {
  return LENNY_STATES[mode] || LENNY_STATES.awake;
}

export function moodFor(mode) {
  return stateFor(mode).mood;
}

export function scheduledMode(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 60 && minutes < 570) return 'sleep';
  if (minutes >= 570 && minutes < 720) return 'breakfast';
  return 'awake';
}

export function nextMode(mode) {
  const currentIndex = PUBLIC_MODES.indexOf(mode);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % PUBLIC_MODES.length;
  return PUBLIC_MODES[nextIndex];
}
