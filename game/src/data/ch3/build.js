// A tiny grid builder for chapter 3's maps: paint tiles and heights with rectangles, lines and blobs,
// then export the row strings the engine reads. (x = character index, y = row.)
export function grid(w, h, ch = '.', ht = 0) {
  const T = Array.from({ length: h }, () => Array(w).fill(ch));
  const H = Array.from({ length: h }, () => Array(w).fill(ht));
  const g = {
    w, h, T, H,
    in: (x, y) => x >= 0 && y >= 0 && x < w && y < h,
    set(x, y, c, hh) { if (!g.in(x, y)) return g; if (c != null) T[y][x] = c; if (hh != null) H[y][x] = hh; return g; },
    get: (x, y) => g.in(x, y) ? T[y][x] : null,
    rect(x0, y0, x1, y1, c, hh) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) g.set(x, y, c, hh); return g; },
    // a frame (outline) of a rectangle
    frame(x0, y0, x1, y1, c, hh) { for (let x = x0; x <= x1; x++) { g.set(x, y0, c, hh); g.set(x, y1, c, hh); } for (let y = y0; y <= y1; y++) { g.set(x0, y, c, hh); g.set(x1, y, c, hh); } return g; },
    // manhattan polyline through points, `wd` tiles wide (extra width goes +x / +y)
    line(pts, c, wd = 1, hh) {
      for (let i = 0; i + 1 < pts.length; i++) {
        let [x, y] = pts[i]; const [x1, y1] = pts[i + 1];
        const dx = Math.sign(x1 - x), dy = Math.sign(y1 - y);
        for (;;) {
          for (let a = 0; a < wd; a++) for (let b = 0; b < wd; b++) g.set(x + a, y + b, c, hh);
          if (x === x1 && y === y1) break;
          if (x !== x1) x += dx; else y += dy;
        }
      }
      return g;
    },
    // a rough disc
    blob(cx, cy, r, c, hh, only) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) { const d = Math.hypot(x - cx, y - cy); if (d <= r + 0.3 && (!only || only.includes(g.get(x, y)))) g.set(x, y, c, hh); } return g; },
    // replace one char with another inside a box
    swap(x0, y0, x1, y1, from, to) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g.get(x, y) === from) g.set(x, y, to); return g; },
    // deterministic scatter of a char over tiles that currently hold one of `on`
    scatter(c, n, seed, on, box = [0, 0, w - 1, h - 1]) {
      let s = seed >>> 0; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      for (let i = 0, k = 0; i < n && k < n * 20; k++) { const x = box[0] + Math.floor(r() * (box[2] - box[0] + 1)), y = box[1] + Math.floor(r() * (box[3] - box[1] + 1)); if (on.includes(g.get(x, y))) { g.set(x, y, c); i++; } }
      return g;
    },
    out() { return { tiles: T.map(r => r.join('')), heights: H.map(r => r.map(v => v.toString(36)).join('')) }; },
  };
  return g;
}
// deterministic picks for decoration
export function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
// Tunnel walls: walls that stand in FRONT of a floor (at larger x or y) become a flat, unwalkable ledge ('Q'),
// so they never hide or steal clicks from the floor behind them; walls far from any floor become void.
export const LEDGE = { Q: { k: 'wall', walk: 0 } };
export function trimWalls(g, wallCh = '#') {
  const floor = (x, y) => { const c = g.get(x, y); return c != null && c !== wallCh && c !== ' ' && c !== 'Q'; };
  const out = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.get(x, y) !== wallCh) continue;
    let near = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (floor(x + dx, y + dy)) near = true;
    let front = false; for (let j = 0; j <= 3; j++) for (let i = 0; i <= 3; i++) if ((i || j) && floor(x - i, y - j)) front = true;
    if (front) out.push([x, y, 'Q']); else if (!near) out.push([x, y, ' ']);
  }
  for (const [x, y, c] of out) g.set(x, y, c, 0);
  return g;
}
