import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { PAL, SPRITE } from '../src/lenny-art.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const BG = '#ECEAE3';

// On garde surtout la tête, avec juste le petit bas sous le visage pour l'ancrer au bord.
const ICON_ROWS = 29;
const iconRows = SPRITE.slice(0, ICON_ROWS);

let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;
iconRows.forEach((row, y) => {
  for (let x = 0; x < row.length; x++) {
    if (row[x] && row[x] !== '.') {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
});

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function cellColor(cx, cy) {
  const row = iconRows[minY + cy];
  const key = row ? row[minX + cx] : '.';
  return PAL[key] || null;
}

function renderPng(width, height, padScale, { alignBottom = false } = {}) {
  const png = new PNG({ width, height });
  const [br, bgv, bb] = hexToRgb(BG);
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = br;
    png.data[i * 4 + 1] = bgv;
    png.data[i * 4 + 2] = bb;
    png.data[i * 4 + 3] = 255;
  }

  const scale = Math.max(1, Math.floor(Math.min((width * padScale) / cropW, (height * padScale) / cropH)));
  const ox = Math.round((width - cropW * scale) / 2);
  const oy = alignBottom ? height - cropH * scale : Math.round((height - cropH * scale) / 2);

  for (let cy = 0; cy < cropH; cy++) {
    for (let cx = 0; cx < cropW; cx++) {
      const color = cellColor(cx, cy);
      if (!color) continue;
      const [r, g, b] = hexToRgb(color);
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = ox + cx * scale + dx;
          const py = oy + cy * scale + dy;
          if (px < 0 || py < 0 || px >= width || py >= height) continue;
          const idx = (py * width + px) * 4;
          png.data[idx] = r;
          png.data[idx + 1] = g;
          png.data[idx + 2] = b;
          png.data[idx + 3] = 255;
        }
      }
    }
  }

  return PNG.sync.write(png);
}

function renderSvg() {
  const pad = 2;
  const w = cropW + pad * 2;
  const h = cropH + pad * 2;
  let rects = `<rect width="${w}" height="${h}" fill="${BG}"/>`;
  for (let cy = 0; cy < cropH; cy++) {
    for (let cx = 0; cx < cropW; cx++) {
      const color = cellColor(cx, cy);
      if (!color) continue;
      rects += `<rect x="${cx + pad}" y="${cy + pad}" width="1" height="1" fill="${color}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>\n`;
}

const targets = [
  ['icon-192.png', renderPng(192, 192, 0.98, { alignBottom: true })],
  ['icon-512.png', renderPng(512, 512, 0.98, { alignBottom: true })],
  ['maskable-512.png', renderPng(512, 512, 0.76, { alignBottom: true })],
  ['apple-touch-icon.png', renderPng(180, 180, 0.98, { alignBottom: true })],
  ['og.png', renderPng(1200, 630, 0.92, { alignBottom: true })],
  ['icon.svg', renderSvg()],
];

for (const [name, data] of targets) {
  writeFileSync(resolve(publicDir, name), data);
  console.log(`generated ${name}`);
}
