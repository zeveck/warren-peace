// A tiny grid builder for Chapter 2's maps: draw rooms, discs and paths into tile and height rows.
export function grid(w, h, fill = ' ', hv = 0) {
  const T = [...Array(h)].map(() => Array(w).fill(fill));
  const Hh = [...Array(h)].map(() => Array(w).fill(String(hv)));
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const put = (x, y, c, v) => { if (!inb(x, y)) return; if (c != null) T[y][x] = c; if (v != null) Hh[y][x] = String(v); };
  const api = {
    w, h,
    get: (x, y) => (inb(x, y) ? T[y][x] : null),
    set(x, y, c, v) { put(x, y, c, v); return api; },
    rect(x0, y0, x1, y1, c, v) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) put(x, y, c, v); return api; },
    disc(cx, cy, r, c, v) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(x, y, c, v); return api; },
    // axis-aligned segments through the points; width grows down-right
    path(pts, c, v, wd = 1) {
      for (let i = 0; i + 1 < pts.length; i++) {
        let [x, y] = pts[i]; const [x1, y1] = pts[i + 1];
        const stamp = () => { for (let a = 0; a < wd; a++) for (let b = 0; b < wd; b++) put(x + a, y + b, c, v); };
        stamp();
        while (x !== x1 || y !== y1) { if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); stamp(); }
      }
      return api;
    },
    // replace some tiles of one kind with another, deterministically
    sprinkle(x0, y0, x1, y1, from, to, p, seed = 1) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        if (!inb(x, y) || !from.includes(T[y][x])) continue;
        const r = Math.abs(Math.sin((x * 12.9898 + y * 78.233 + seed * 37.719)) * 43758.5453) % 1;
        if (r < p) T[y][x] = to;
      }
      return api;
    },
    // tidy the rock round tunnels so the camera can see in: rock far from any floor becomes void, rock standing in
    // front of a floor (it would hide it) becomes a low ledge ('Z' wall / 'Y' rock, see LEG_LOW), the rest stays tall
    trim() {
      const isW = c => c === '#' || c === '%';
      const isF = (x, y) => inb(x, y) && !isW(T[y][x]) && T[y][x] !== ' ' && T[y][x] !== 'Z' && T[y][x] !== 'Y';
      const out = T.map(r => r.slice()), oh = Hh.map(r => r.slice());
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!isW(T[y][x])) continue;
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 3 && isF(x + dx, y + dy)) { near = true; break; }
        if (!near) { out[y][x] = ' '; continue; }
        const behind = [[-1, 0], [0, -1], [-1, -1], [-2, 0], [0, -2], [-2, -1], [-1, -2]].filter(([dx, dy]) => isF(x + dx, y + dy));
        if (behind.length) {
          out[y][x] = T[y][x] === '#' ? 'Z' : 'Y';
          oh[y][x] = String(Math.max(...behind.map(([dx, dy]) => +Hh[y + dy][x + dx])));   // level with the floor: a raised ledge would steal clicks meant for the floor behind it
        }
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { T[y][x] = out[y][x]; Hh[y][x] = oh[y][x]; }
      return api;
    },
    each(fn) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) fn(x, y, T[y][x], +Hh[y][x]); return api; },
    out() { return { tiles: T.map(r => r.join('')), heights: Hh.map(r => r.join('')) }; },
  };
  return api;
}
// the tiles of a polyline path, in walking order (for drawing tracks)
export function line(pts) {
  const out = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    let [x, y] = pts[i]; const [x1, y1] = pts[i + 1];
    if (!i) out.push([x, y]);
    while (x !== x1 || y !== y1) { if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); out.push([x, y]); }
  }
  return out;
}
