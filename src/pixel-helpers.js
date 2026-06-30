export function createPixelHelpers({ fblk, fpx }) {
  function line(x1, y1, x2, y2, key) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) {
      fpx(x1, y1, key);
      return;
    }

    for (let step = 0; step <= steps; step++) {
      const x = Math.round(x1 + (dx * step) / steps);
      const y = Math.round(y1 + (dy * step) / steps);
      fpx(x, y, key);
    }
  }

  function pattern(x, y, rows, palette = {}) {
    rows.forEach((row, rowIndex) => {
      [...row].forEach((cell, colIndex) => {
        if (cell === '.') return;
        fpx(x + colIndex, y + rowIndex, palette[cell] || cell);
      });
    });
  }

  function symmetric(drawLeft, mirrorX = 47) {
    const mirror = {
      fblk(x, y, w, h, key) {
        fblk(mirrorX - x - w + 1, y, w, h, key);
      },
      fpx(x, y, key) {
        fpx(mirrorX - x, y, key);
      },
      line(x1, y1, x2, y2, key) {
        line(mirrorX - x1, y1, mirrorX - x2, y2, key);
      },
      pattern(x, y, rows, palette = {}) {
        rows.forEach((row, rowIndex) => {
          [...row].forEach((cell, colIndex) => {
            if (cell === '.') return;
            fpx(mirrorX - x - colIndex, y + rowIndex, palette[cell] || cell);
          });
        });
      },
    };

    drawLeft({ fblk, fpx, line, pattern });
    drawLeft(mirror);
  }

  return { line, pattern, symmetric };
}
