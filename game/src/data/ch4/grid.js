// A tiny map-carving helper for chapter 4: build tile and height grids with shapes instead of typing
// 50-character rows by hand. Everything is plain data at the end (arrays of strings).
export function grid(w, h, ch = ' ', hgt = 0) {
  const t = [], hs = [];
  for (let y = 0; y < h; y++) { t.push(Array(w).fill(ch)); hs.push(Array(w).fill(hgt)); }
  const g = {
    w, h, t, hs,
    ok: (x, y) => x >= 0 && y >= 0 && x < w && y < h,
    set(x, y, c, hh) { if (!g.ok(x, y)) return g; if (c !== null && c !== undefined) t[y][x] = c; if (hh !== undefined && hh !== null) hs[y][x] = hh; return g; },
    get: (x, y) => g.ok(x, y) ? t[y][x] : null,
    hget: (x, y) => g.ok(x, y) ? hs[y][x] : 0,
    rect(x0, y0, x1, y1, c, hh) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) g.set(x, y, c, hh); return g; },
    // fill only where the current char is in `only` (string of chars)
    rectIf(x0, y0, x1, y1, only, c, hh) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g.ok(x, y) && only.includes(t[y][x])) g.set(x, y, c, hh); return g; },
    disc(cx, cy, r, c, hh) { for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) g.set(x, y, c, hh); return g; },
    // a corridor of width wd along a list of points (axis-aligned steps)
    path(pts, c, wd = 2, hh) {
      for (let i = 0; i + 1 < pts.length; i++) {
        let [x, y] = pts[i]; const [x1, y1] = pts[i + 1];
        while (true) {
          g.rect(x, y, x + wd - 1, y + wd - 1, c, hh);
          if (x === x1 && y === y1) break;
          if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y);
        }
      }
      return g;
    },
    // a border of `c` around every tile in `inside` (chars) that touches a void tile
    edge(inside, c, hh, onto = ' ') {
      const mark = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!onto.includes(t[y][x])) continue;
        let near = false;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (g.ok(x + dx, y + dy) && inside.includes(t[y + dy][x + dx])) near = true;
        if (near) mark.push([x, y]);
      }
      for (const [x, y] of mark) g.set(x, y, c, typeof hh === 'function' ? hh(x, y) : hh);
      return g;
    },
    rows: () => t.map(r => r.join('')),
    hrows: () => hs.map(r => r.map(v => v.toString(36)).join('')),
  };
  return g;
}
// deterministic sprinkle: a few specks of `c` over tiles of `on`, seeded
export function sprinkle(g, on, c, n, seed = 1) {
  let a = seed * 9301 + 49297;
  const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  for (let i = 0; i < n * 20 && n > 0; i++) {
    const x = Math.floor(r() * g.w), y = Math.floor(r() * g.h);
    if (on.includes(g.get(x, y))) { g.set(x, y, c); n--; }
  }
  return g;
}
// raise a rim of `c` round every tile whose char is in `floorChars`: back rims (behind the floor, as seen on screen)
// are taller and uneven; in front of the floor the edge is left open (a cut-away), so nothing hides the floor or steals clicks
export function ridge(g, floorChars, c = 'R', extra = 1) {
  const marks = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.t[y][x] !== ' ') continue;
    let mh = -1, front = true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!g.ok(x + dx, y + dy) || !floorChars.includes(g.t[y + dy][x + dx])) continue;
      mh = Math.max(mh, g.hs[y + dy][x + dx]);
      if (dx + dy > 0) front = false;
    }
    if (mh < 0 || front) continue;          // in front of the floor: leave it open (a cut-away edge)
    const bump = front ? 0 : (((x * 7 + y * 13) % 5) === 0 ? 2 : ((x * 3 + y * 5) % 4 === 0 ? 1 : 0));
    marks.push([x, y, mh + (front ? 1 : extra) + bump]);
  }
  for (const [x, y, h] of marks) g.set(x, y, c, h);
  return g;
}
