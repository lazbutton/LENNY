import { FACE, PAL, SPRITE } from './lenny-art.js';
import { createSceneDrawers } from './lenny-scenes.js';
import { stateFor } from './lenny-states.js';

const BASE_ART_COLS = 48;
const BASE_ART_ROWS = 60;
const DETAIL_SCALE = 2;
const PX = 4;
const BASE_OX = 6;
const BASE_OY = 4;
const OX = BASE_OX * DETAIL_SCALE;
const OY = BASE_OY * DETAIL_SCALE;

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 576;

function debugGridEnabled() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === 'grid' || window.localStorage.getItem('lenny_debug_grid') === '1';
}

function drawDebugGrid(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#2A2622';
  for (let x = 0; x <= CANVAS_WIDTH; x += PX * 4) ctx.fillRect(x, 0, 1, CANVAS_HEIGHT);
  for (let y = 0; y <= CANVAS_HEIGHT; y += PX * 4) ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  ctx.globalAlpha = 0.32;
  for (let x = 0; x <= CANVAS_WIDTH; x += PX * DETAIL_SCALE * 10) ctx.fillRect(x, 0, 1, CANVAS_HEIGHT);
  for (let y = 0; y <= CANVAS_HEIGHT; y += PX * DETAIL_SCALE * 10) ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  ctx.restore();
}

export function drawScene(canvas, mode, expr, ticks) {
  const ctx = canvas.getContext('2d');
  const state = stateFor(mode);

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

  function scaled(value) {
    return Math.round(value * DETAIL_SCALE);
  }

  function fpx(x, y, key) {
    block(scaled(x) + OX, scaled(y) + OY, DETAIL_SCALE, DETAIL_SCALE, key);
  }

  function fblk(x, y, w, h, key) {
    block(scaled(x) + OX, scaled(y) + OY, scaled(w), scaled(h), key);
  }

  const fine = {
    fpx(x, y, key) {
      px(x + OX, y + OY, key);
    },
    fblk(x, y, w, h, key) {
      block(x + OX, y + OY, w, h, key);
    },
  };

  const { backgrounds: backgroundDrawers, scenes: sceneDrawers } = createSceneDrawers({
    detailScale: DETAIL_SCALE,
    fine,
    fpx,
    fblk,
    ticks,
    artCols: BASE_ART_COLS,
    artRows: BASE_ART_ROWS,
    ox: BASE_OX,
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.backgroundScene && state.backgroundScene !== 'backrooms') {
    backgroundDrawers[state.backgroundScene]?.();
  }
  for (let y = 0; y < BASE_ART_ROWS; y++) {
    const row = SPRITE[y];
    for (let x = 0; x < BASE_ART_COLS; x++) fpx(x, y, row[x]);
  }
  if (state.scene) sceneDrawers[state.scene]?.();
  if (debugGridEnabled()) drawDebugGrid(ctx);
  if (expr && FACE[expr]) {
    for (const [x, y, key] of FACE[expr]) fpx(x, y, key);
  }
}
