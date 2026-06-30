import { writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { PAL, SPRITE } from '../src/lenny-art.js';
import { createSceneDrawers } from '../src/lenny-scenes.js';
import { stateFor } from '../src/lenny-states.js';

const BASE_ART_COLS = 48;
const BASE_ART_ROWS = 60;
const DETAIL_SCALE = 2;
const PX = 4;
const BASE_OX = 6;
const BASE_OY = 4;
const OX = BASE_OX * DETAIL_SCALE;
const OY = BASE_OY * DETAIL_SCALE;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 576;

const mode = process.argv[2] || 'music';
const tickValue = Number(process.argv[3] || 0);
const ticks = { [mode]: tickValue };

const png = new PNG({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

function hexToRgb(hex) {
  const v = hex.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

const SCREEN_BG = [32, 28, 25];
for (let i = 0; i < png.data.length; i += 4) {
  png.data[i] = SCREEN_BG[0];
  png.data[i + 1] = SCREEN_BG[1];
  png.data[i + 2] = SCREEN_BG[2];
  png.data[i + 3] = 255;
}

function setPixel(px, py, rgb) {
  if (px < 0 || py < 0 || px >= CANVAS_WIDTH || py >= CANVAS_HEIGHT) return;
  const idx = (py * CANVAS_WIDTH + px) * 4;
  png.data[idx] = rgb[0];
  png.data[idx + 1] = rgb[1];
  png.data[idx + 2] = rgb[2];
  png.data[idx + 3] = 255;
}

function px(x, y, key) {
  const color = PAL[key];
  if (!color) return;
  const rgb = hexToRgb(color);
  for (let yy = 0; yy < PX; yy++) for (let xx = 0; xx < PX; xx++) setPixel(x * PX + xx, y * PX + yy, rgb);
}

function block(x, y, w, h, key) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) px(x + xx, y + yy, key);
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

const state = stateFor(mode);
const { backgrounds, scenes } = createSceneDrawers({
  detailScale: DETAIL_SCALE,
  fine,
  fpx,
  fblk,
  ticks,
  artCols: BASE_ART_COLS,
  artRows: BASE_ART_ROWS,
  ox: BASE_OX,
});

if (state.backgroundScene && state.backgroundScene !== 'backrooms') backgrounds[state.backgroundScene]?.();
for (let y = 0; y < BASE_ART_ROWS; y++) {
  const row = SPRITE[y];
  for (let x = 0; x < BASE_ART_COLS; x++) fpx(x, y, row[x]);
}
if (state.scene) scenes[state.scene]?.();

const out = `preview-${mode}.png`;
writeFileSync(new URL(`../${out}`, import.meta.url), PNG.sync.write(png));
console.log('wrote', out);
