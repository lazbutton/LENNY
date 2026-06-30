import { SPRITE } from './lenny-art.js';
import { createPixelHelpers } from './pixel-helpers.js';

export const BACKGROUND_SCENES = ['garden', 'badmintonPark', 'backrooms', 'studio'];
export const SCENES = ['breakfast', 'pool', 'cafe', 'amour', 'badminton', 'music', 'sad', 'grumpy', 'backrooms'];

export function createSceneDrawers({ detailScale, fine, fpx, fblk, ticks, artCols, artRows, ox }) {
  const { line, pattern } = createPixelHelpers({ fblk, fpx });

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

    for (let x = -ox; x <= artCols - 1 + ox; x++) {
      const surf = 41 + Math.round(Math.sin((x + ticks.pool * 0.7) * 0.5));
      fpx(x, surf, 'n');
      for (let y = surf + 1; y <= artRows + 7; y++) fpx(x, y, 'i');
    }
    for (let x = -ox; x <= artCols - 1 + ox; x += 4) {
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
    const left = -ox;
    const right = artCols - 1 + ox;

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

  function drawBadmintonPark() {
    const left = -ox;
    const right = artCols - 1 + ox;

    // Soleil de fin d'après-midi, bien visible au-dessus des arbres.
    fblk(8, 4, 5, 5, 'e');
    fpx(10, 2, 'y');
    fpx(10, 10, 'y');
    fpx(6, 6, 'y');
    fpx(14, 6, 'y');
    fpx(7, 3, 'y');
    fpx(13, 9, 'y');

    // Herbe basse sur tout le terrain.
    for (let x = left; x <= right; x++) {
      const top = 47 + [0, 0, -1, 0, 1, 0][((x % 6) + 6) % 6];
      fpx(x, top, 'q');
      for (let y = top + 1; y <= 58; y++) fpx(x, y, 'g');
      if (x % 7 === 0) fpx(x, top + 3, 'q');
    }

    // Plein de petites fleurs au sol, comme un terrain de vacances.
    drawFlower(3, 52, 'r');
    drawFlower(7, 54, 'y');
    drawFlower(12, 53, 'p');
    drawFlower(16, 55, 'r');
    drawFlower(31, 54, 'y');
    drawFlower(36, 52, 'p');
    drawFlower(41, 54, 'r');
    drawFlower(45, 53, 'y');
    fpx(4, 52, 'q');
    fpx(7, 53, 'q');
    fpx(39, 52, 'q');
    fpx(43, 51, 'q');
  }

  function drawStudio() {
    const t = ticks.music || 0;

    // Fond volontairement nu : seules les enceintes restent derrière Lenny.
    const speaker = [
      '.ddddddddd.',
      'ddddddddddd',
      'ddkkkkkkkdd',
      'dkkkkkkkkkd',
      'dkkkdddkkkd',
      'dkkddwddkkd',
      'dkkkdddkkkd',
      'dkkkkkkkkkd',
      'dkkkkkkkkkd',
      'dkkkdddkkkd',
      'dkkduuudkkd',
      'dkduuuuudkd',
      'dkduukuudkd',
      'dkduuuuudkd',
      'dkkduuudkkd',
      'dkkkdddkkkd',
      'dkkkkkkkkkd',
      'ddkkkkkkkdd',
      'ddddddddddd',
      '.ddddddddd.',
    ];
    const drawSpeaker = (sx) => {
      pattern(sx, 10, speaker);
      fblk(sx + 2, 30, 7, 1, 'k');
      fblk(sx + 4, 31, 3, 3, 'd');
      fpx(sx + 1, 14, t % 4 === 0 ? 'e' : 'g');
    };
    drawSpeaker(1);
    drawSpeaker(36);
  }

  function drawBackrooms() {
    const left = -ox;
    const right = artCols - 1 + ox;
    const top = -4;
    const bottom = artRows + 7;
    const ceilingBottom = 18;
    const floorTop = 43;
    const vanX = 24;
    const vanY = 30;
    const t = ticks.backrooms || 0;
    const fineLeft = left * detailScale;
    const fineRight = right * detailScale;

    const lerp = (a, b, ratio) => Math.round(a + (b - a) * ratio);
    const fillTrap = (y1, y2, leftTop, rightTop, leftBottom, rightBottom, colorFor) => {
      for (let y = y1; y <= y2; y++) {
        const ratio = (y - y1) / Math.max(1, y2 - y1);
        const lx = lerp(leftTop, leftBottom, ratio);
        const rx = lerp(rightTop, rightBottom, ratio);
        for (let x = lx; x <= rx; x++) fpx(x, y, colorFor(x, y));
      }
    };

    const fillAll = (key) => {
      for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) fpx(x, y, key);
      }
    };

    fillAll('h');

    // Plafond saumon à dalles, beaucoup plus proche de la référence fournie.
    fillTrap(top, ceilingBottom, left, right, 13, 35, (x, y) => ((x + y) % 17 === 0 ? 'v' : 'a'));
    line(left, 8, right, 8, 'v');
    line(left, 14, right, 14, 'v');
    line(left, top, 13, ceilingBottom, 'v');
    line(right, top, 35, ceilingBottom, 'v');
    line(5, top, 18, ceilingBottom, 'v');
    line(18, top, 22, ceilingBottom, 'v');
    line(31, top, 27, ceilingBottom, 'v');
    line(44, top, 32, ceilingBottom, 'v');

    const neon = (x, y, w, dim = false) => {
      fblk(x - 1, y - 1, w + 2, 1, 'v');
      fblk(x, y, w, 2, dim ? 'u' : 'w');
      fblk(x + 2, y + 2, w - 4, 1, dim ? 'a' : 'e');
      fine.fblk(x * detailScale + 2, y * detailScale + 1, w * detailScale - 4, 1, 'w');
    };
    neon(12, 3, 23, t % 7 === 0);
    neon(18, 13, 13, t % 9 === 0);
    neon(21, 22, 7, t % 5 === 0);

    // Sol pêche/moquette, grand plan propre qui part vers le fond.
    fillTrap(floorTop, bottom, 13, 35, left, right, (x, y) => ((x * 5 + y * 3) % 23 === 0 ? 'v' : 'l'));
    line(13, floorTop, left, bottom, 'v');
    line(35, floorTop, right, bottom, 'v');
    line(vanX, vanY, left, bottom, 'v');
    line(vanX, vanY, right, bottom, 'v');
    for (let y = floorTop + 6; y <= bottom; y += 8) {
      const spread = Math.round((y - floorTop) * 0.85);
      line(13 - spread, y, 35 + spread, y, 'v');
    }

    // Murs latéraux jaunes très marqués et reconnaissables.
    fillTrap(ceilingBottom, floorTop, left, 13, left, 13, (x, y) => ((x + y) % 19 === 0 ? 'e' : 'h'));
    fillTrap(ceilingBottom, floorTop, 35, right, 35, right, (x, y) => ((x + y) % 19 === 0 ? 'e' : 'h'));
    fillTrap(ceilingBottom, floorTop, 13, 35, 13, 35, (x, y) => ((x + y) % 23 === 0 ? 'e' : 'h'));

    // Papier peint vertical type Backrooms, en lignes nettes avec arches simplifiées.
    const wallPattern = (xStart, xEnd, skew = 0) => {
      for (let x = xStart; x <= xEnd; x += 5) {
        line(x, ceilingBottom + 1, x + skew, floorTop - 1, 's');
        fpx(x + 1, 23, 's');
        fpx(x + 2, 24, 's');
        fpx(x + 1, 25, 's');
        fpx(x + skew + 1, 34, 's');
        fpx(x + skew + 2, 35, 's');
        fpx(x + skew + 1, 36, 's');
      }
    };
    wallPattern(left, 12, -3);
    wallPattern(36, right, 3);
    wallPattern(16, 32, 0);

    // Bords perspectifs des murs et du couloir.
    line(left, ceilingBottom, 13, ceilingBottom, 'v');
    line(35, ceilingBottom, right, ceilingBottom, 'v');
    line(13, ceilingBottom, 13, floorTop, 'v');
    line(35, ceilingBottom, 35, floorTop, 'v');
    line(13, floorTop, left, bottom, 'v');
    line(35, floorTop, right, bottom, 'v');
    line(13, ceilingBottom, vanX, vanY, 'v');
    line(35, ceilingBottom, vanX, vanY, 'v');

    // Renfoncements/colonnes comme dans la ref, plus propres.
    fblk(9, 26, 4, 17, 's');
    fblk(9, 26, 1, 17, 'v');
    fblk(12, 27, 1, 16, 'e');
    fblk(35, 24, 5, 19, 's');
    fblk(35, 24, 1, 19, 'v');
    fblk(39, 25, 1, 18, 'e');

    // Ouvertures sombres, limitées pour éviter le brouillon.
    fblk(2, 28, 4, 15, 'v');
    fblk(3, 29, 2, 14, 'k');
    fblk(29, 31, 5, 12, 'v');
    fblk(30, 32, 3, 11, 'k');
    fpx(33, 37, 'e');

    // Petit panneau rouge.
    fblk(7, 22, 3, 2, 'r');
    fpx(8, 22, 'w');
    fpx(9, 23, 'k');

    // Détails fins, très discrets.
    for (let y = (ceilingBottom + 4) * detailScale; y < (floorTop - 4) * detailScale; y += 14) {
      const x = fineLeft + ((y * 5) % (fineRight - fineLeft - 3));
      fine.fpx(x, y, 's');
      fine.fpx(x + 1, y + 1, 'v');
    }
    for (let y = floorTop * detailScale + 8; y <= bottom * detailScale; y += 16) {
      const x = fineLeft + ((y * 3) % (fineRight - fineLeft - 2));
      fine.fpx(x, y, 'v');
      fine.fpx(x + 1, y + 1, 'l');
    }

    // Petite chaise perdue au fond, élément liminal sans prendre le dessus sur Lenny.
    fblk(37, 39, 5, 1, 'b');
    fblk(38, 40, 3, 3, 'm');
    fpx(37, 43, 'b');
    fpx(41, 43, 'b');
    line(37, 43, 36, 48, 'b');
    line(41, 43, 42, 48, 'b');
    line(38, 39, 38, 34, 'b');
    line(41, 39, 41, 34, 'b');
  }

  function drawPoppy(x, y) {
    fpx(x, y + 2, 'q');
    fpx(x, y + 3, 'q');
    fpx(x - 1, y, 'j');
    fpx(x + 1, y, 'j');
    fpx(x, y - 1, 'r');
    fpx(x, y + 1, 'r');
    fpx(x, y, 'k');
  }

  function drawAmour() {
    pattern(35, 8, ['.rr.rr.', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
    pattern(6, 42, ['.rr.rr.', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
    drawPoppy(5, 53);
    drawPoppy(10, 55);
    drawPoppy(37, 54);
    drawPoppy(43, 52);
    fpx(21, 17, 'r');
    fpx(26, 17, 'r');
  }

  function drawBadminton() {
    // Raquette tenue à gauche : tête ovale, cordage croisé et manche droit.
    pattern(-3, 16, [
      '....bbb....',
      '..bb...bb..',
      '.b..u.u..b.',
      'b..uuuuu..b',
      'b.u.u.u.u.b',
      'b..uuuuu..b',
      'b.u.u.u.u.b',
      'b..uuuuu..b',
      '.b..u.u..b.',
      '..bb...bb..',
      '....bbb....',
    ]);
    fpx(1, 20, 'u');
    fpx(6, 20, 'u');
    fpx(1, 25, 'u');
    fpx(6, 25, 'u');
    fblk(2, 27, 2, 2, 'b');
    fblk(2, 29, 2, 8, 'o');
    fpx(3, 29, 'c');
    fpx(3, 31, 'c');
    fpx(3, 33, 'c');
    fpx(3, 35, 'c');
    fblk(1, 36, 4, 2, 'b');
    fblk(2, 36, 2, 1, 'w');

    // Volant plus haut, droit et bien lisible.
    const t = ticks.badminton || 0;
    const vx = 37 + Math.round(Math.sin(t * 0.6) * 1);
    const vy = 8 + Math.round(Math.cos(t * 0.6) * 1);
    pattern(vx, vy, [
      'b.w.w.b',
      '.bwwwb.',
      '..www..',
      '..bbb..',
      '...e...',
      '...b...',
    ]);

    // Petits traits de mouvement au-dessus du volant.
    fpx(vx + 6, vy - 2, 'u');
    fpx(vx + 7, vy - 3, 'u');
  }

  function drawMusic() {
    const left = -ox;
    const right = artCols - 1 + ox;
    const t = ticks.music || 0;

    // --- Bureau plus fin, qui laisse respirer Lenny ---
    fblk(left, 49, right - left + 1, 1, 'e');
    fblk(left, 50, right - left + 1, 2, 'o');
    fblk(left, 52, right - left + 1, 1, 'c');
    fblk(2, 53, 14, 5, 'b');
    fblk(29, 53, 14, 5, 'b');
    fblk(3, 54, 12, 1, 'o');
    fblk(30, 54, 12, 1, 'o');
    fpx(9, 56, 'e');
    fpx(36, 56, 'e');
    fblk(17, 53, 11, 2, 'c');
    fblk(20, 55, 5, 1, 'b');

    // --- Clavier / synthé large et lisible au premier plan ---
    const kx = 20;
    fblk(kx - 1, 42, 25, 1, 'b');
    fblk(kx, 43, 23, 3, 'k');
    fblk(kx + 2, 44, 6, 1, 'd');
    fpx(kx + 10, 44, 'e');
    fpx(kx + 12, 44, 'r');
    fpx(kx + 14, 44, 'g');
    fpx(kx + 21, 44, 'i');
    fblk(kx, 46, 23, 3, 'w');
    for (const bx of [1, 3, 6, 8, 10, 13, 15, 18, 20]) fblk(kx + bx, 46, 1, 2, 'k');
    fblk(kx - 1, 49, 25, 1, 'b');

    // --- Notes de musique qui s'envolent (animées) ---
    const note = (nx, ny, key) => {
      fblk(nx, ny, 2, 2, key);
      fpx(nx + 2, ny - 3, key);
      fpx(nx + 2, ny - 2, key);
      fpx(nx + 2, ny - 1, key);
      fpx(nx + 2, ny, key);
      fpx(nx + 3, ny - 3, key);
    };
    const floatNote = (baseX, key, phase) => {
      const p = (t + phase) % 24;
      const ny = 40 - p;
      const nx = baseX + Math.round(Math.sin(p * 0.4) * 2);
      note(nx, ny, key);
    };
    floatNote(34, 'w', 0);
    floatNote(40, 'e', 9);
    floatNote(44, 'r', 17);
  }

  function drawSad() {
    // Visage triste : yeux bas, larme et petite bouche vers le bas.
    fblk(20, 17, 3, 1, 'w');
    fblk(26, 17, 3, 1, 'w');
    fpx(20, 18, 'k');
    fpx(22, 18, 'k');
    fpx(26, 18, 'k');
    fpx(28, 18, 'k');
    fpx(29, 19, 'i');
    fpx(29, 20, 'i');
    fpx(30, 21, 'n');
    fpx(22, 25, 'k');
    fpx(23, 24, 'k');
    fpx(24, 24, 'k');
    fpx(25, 24, 'k');
    fpx(26, 25, 'k');
    pattern(35, 10, ['.ddd.', 'dduud', '.uuu.']);
    fpx(38, 14, 'i');
    fpx(40, 16, 'i');
  }

  function drawGrumpy() {
    // Pas content : sourcils en V, yeux plissés et bouche contrariée.
    fpx(19, 15, 'k');
    fpx(20, 16, 'k');
    fpx(21, 16, 'k');
    fpx(22, 17, 'k');
    fpx(29, 15, 'k');
    fpx(28, 16, 'k');
    fpx(27, 16, 'k');
    fpx(26, 17, 'k');
    fblk(19, 18, 5, 1, 'k');
    fblk(25, 18, 5, 1, 'k');
    fpx(21, 19, 'k');
    fpx(27, 19, 'k');
    fpx(18, 22, 'r');
    fpx(30, 22, 'r');
    fpx(21, 25, 'k');
    fpx(22, 24, 'k');
    fpx(23, 24, 'k');
    fpx(24, 24, 'k');
    fpx(25, 24, 'k');
    fpx(26, 24, 'k');
    fpx(27, 25, 'k');
    fpx(22, 25, 'k');
    fpx(26, 25, 'k');
    pattern(36, 8, ['r.r', '.r.', 'r.r']);
    fpx(37, 11, 'j');
    fpx(39, 10, 'j');
  }

  function drawBackroomsOutfit() {
    const swap = {
      g: 'p',
      p: 'g',
      r: 'y',
      y: 'r',
    };

    for (let y = 31; y < SPRITE.length; y++) {
      const row = SPRITE[y];
      for (let x = 0; x < row.length; x++) {
        const nextColor = swap[row[x]];
        if (nextColor) fpx(x, y, nextColor);
      }
    }
  }

  return {
    backgrounds: {
      backrooms: drawBackrooms,
      badmintonPark: drawBadmintonPark,
      garden: drawGarden,
      studio: drawStudio,
    },
    scenes: {
      amour: drawAmour,
      badminton: drawBadminton,
      backrooms: drawBackroomsOutfit,
      breakfast: drawBreakfast,
      cafe: drawCoffee,
      grumpy: drawGrumpy,
      music: drawMusic,
      pool: drawPool,
      sad: drawSad,
    },
  };
}
