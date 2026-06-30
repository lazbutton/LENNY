import { FACE, PAL, SPRITE } from '../src/lenny-art.js';
import { BACKGROUND_SCENES, SCENES } from '../src/lenny-scenes.js';
import { ADMIN_MODES, LENNY_STATES, MODES, PUBLIC_MODES, VALID_MODES } from '../src/lenny-states.js';

const EXPECTED_ROWS = 60;
const EXPECTED_COLS = 48;

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function validatePaletteKey(key, context) {
  assert(Object.prototype.hasOwnProperty.call(PAL, key), `${context} utilise une couleur inconnue "${key}".`);
}

assert(SPRITE.length === EXPECTED_ROWS, `SPRITE doit avoir ${EXPECTED_ROWS} lignes (actuel: ${SPRITE.length}).`);

SPRITE.forEach((row, index) => {
  assert(row.length === EXPECTED_COLS, `SPRITE ligne ${index + 1} doit faire ${EXPECTED_COLS} caractères (actuel: ${row.length}).`);
  for (const key of row) validatePaletteKey(key, `SPRITE ligne ${index + 1}`);
});

for (const [expression, pixels] of Object.entries(FACE)) {
  assert(Array.isArray(pixels), `FACE.${expression} doit être une liste de pixels.`);
  pixels.forEach(([x, y, key], index) => {
    assert(Number.isInteger(x) && Number.isInteger(y), `FACE.${expression}[${index}] doit utiliser des coordonnées entières.`);
    validatePaletteKey(key, `FACE.${expression}[${index}]`);
  });
}

assert(ADMIN_MODES[0] === 'auto', 'ADMIN_MODES doit commencer par "auto".');
assert(
  JSON.stringify(ADMIN_MODES.slice(1)) === JSON.stringify(MODES),
  'ADMIN_MODES doit correspondre à ["auto", ...MODES].'
);

for (const mode of ADMIN_MODES) {
  assert(VALID_MODES.has(mode), `VALID_MODES ne contient pas "${mode}".`);
}

for (const mode of PUBLIC_MODES) {
  assert(MODES.includes(mode), `PUBLIC_MODES contient "${mode}", absent de MODES.`);
}
assert(!PUBLIC_MODES.includes('sad'), 'PUBLIC_MODES ne doit pas contenir "sad" : cet état est réservé à l’admin.');
assert(!PUBLIC_MODES.includes('grumpy'), 'PUBLIC_MODES ne doit pas contenir "grumpy" : cet état est réservé à l’admin.');

for (const [mode, state] of Object.entries(LENNY_STATES)) {
  assert(MODES.includes(mode), `LENNY_STATES.${mode} n'est pas présent dans MODES.`);
  assert(typeof state.label === 'string' && state.label.length > 0, `${mode}.label doit être une chaîne non vide.`);
  assert(typeof state.mood === 'string', `${mode}.mood doit être une chaîne.`);

  if (state.scene) {
    assert(SCENES.includes(state.scene), `${mode}.scene référence "${state.scene}", absent de SCENES.`);
  }

  if (state.backgroundScene) {
    assert(
      BACKGROUND_SCENES.includes(state.backgroundScene),
      `${mode}.backgroundScene référence "${state.backgroundScene}", absent de BACKGROUND_SCENES.`
    );
  }

  assert(typeof state.animated === 'boolean', `${mode}.animated doit être un booléen.`);
  if (state.animated) {
    assert(Number.isInteger(state.tickMs) && state.tickMs > 0, `${mode}.tickMs doit être un entier positif si animated=true.`);
  }

  assert(typeof state.allowBlink === 'boolean', `${mode}.allowBlink doit être un booléen.`);
  assert(typeof state.sleepEffect === 'boolean', `${mode}.sleepEffect doit être un booléen.`);
}

if (errors.length > 0) {
  console.error('check:lenny a trouvé des problèmes:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('check:lenny OK');
