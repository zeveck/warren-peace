// Small helpers for building Chapter 1's maps from ASCII art (tiles and props in one picture).
import { G } from '../../core.js';

// art: rows of characters. key: { char: { t: tileChar, z: height digit or null, p: propId | [propId, w, h], o: extra prop fields } }
// Characters not in key are used as tile characters directly. zmap: optional rows of height digits (same shape).
export function fromArt(art, key = {}, zmap = null, zdef = '0') {
  const tiles = [], heights = [], props = [];
  const h = art.length, w = Math.max(...art.map(r => r.length));
  for (let y = 0; y < h; y++) {
    let tr = '', hr = '';
    for (let x = 0; x < w; x++) {
      const ch = art[y][x] === undefined ? ' ' : art[y][x];
      const k = key[ch];
      tr += k ? k.t : ch;
      let z = zmap ? ((zmap[y] || '')[x] || zdef) : zdef;
      if (k && k.z !== undefined && k.z !== null) z = String(k.z);
      hr += z;
      if (k && k.p) {
        const [id, pw, ph] = Array.isArray(k.p) ? k.p : [k.p, 1, 1];
        props.push({ id, x, y, w: pw || 1, h: ph || 1, ...(k.o || {}) });
      }
    }
    tiles.push(tr); heights.push(hr);
  }
  return { tiles, heights, props };
}

// a grid you can paint on: g.t[y][x] tile chars, g.z[y][x] height digits
export function grid(w, h, ch = '#', z = '0') {
  return { w, h, t: Array.from({ length: h }, () => Array(w).fill(ch)), z: Array.from({ length: h }, () => Array(w).fill(String(z))) };
}
export function rect(g, x0, y0, x1, y1, ch, z) {
  for (let y = Math.max(0, y0); y <= Math.min(g.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(g.w - 1, x1); x++) {
    if (ch !== null) g.t[y][x] = ch; if (z !== undefined && z !== null) g.z[y][x] = String(z);
  }
}
export function put(g, x, y, ch, z) { if (x < 0 || y < 0 || x >= g.w || y >= g.h) return; if (ch !== null) g.t[y][x] = ch; if (z !== undefined && z !== null) g.z[y][x] = String(z); }
export function disk(g, cx, cy, r, ch, z) { for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(g, x, y, ch, z); }
// deterministic sprinkle: replace some tiles of kind `from` with `to`
export function sprinkle(g, from, to, every = 5, seed = 1) {
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.t[y][x] === from && ((x * 73 + y * 151 + seed * 37) % 97) % every === 0) g.t[y][x] = to;
}
export function done(g) { return { tiles: g.t.map(r => r.join('')), heights: g.z.map(r => r.join('')) }; }

// a chest drawn as a prop that opens when used: returns { chest, props }
export function chest(mapId, id, x, y, give) {
  const key = mapId + ':' + id;
  const closed = { id: 'prop-chest', x, y, w: 1, h: 1, cond: () => !(G.s && G.s.opened[key]), chestKey: key };
  const open = { id: 'prop-chest-open', x, y, w: 1, h: 1, cond: () => !!(G.s && G.s.opened[key]) };
  const run = async (s) => {
    // swap the drawn chest for the open one without reloading the map
    const ps = s.ex.map.props; const i = ps.findIndex(p => p.chestKey === key);
    if (i >= 0) ps.splice(i, 1, { ...open, cond: undefined });
  };
  return { chest: { id, x, y, give, run }, props: [closed, open] };
}

// a free, walkable tile on a map near a named entry (for placing people on other chapters' maps)
export function spotNear(mapId, entry, dx = 0, dy = 0, taken = []) {
  const m = G.data && G.data.maps[mapId]; if (!m) return [1, 1];
  const e = (m.entries || {})[entry] || [1, 1];
  const ok = (x, y) => {
    const row = m.tiles[y]; if (!row) return false; const ch = row[x]; if (!ch || ch === ' ' || ch === '#' || ch === '%' || ch === '~' || ch === 'L' || ch === 'h') return false;
    if (m.legend && m.legend[ch] && !m.legend[ch].walk) return false;
    for (const p of m.props || []) { const o = Array.isArray(p) ? { x: p[1], y: p[2], w: p[3] || 1, h: p[4] || 1 } : { w: 1, h: 1, ...p }; if (!o.ground && !o.walk && x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h) return false; }
    for (const a of m.npcs || []) { try { if (a.x === x && a.y === y && a !== taken.self) return false; } catch (e) { /* getters */ } }
    for (const d of m.doors || []) if (d.x === x && d.y === y) return false;
    if (taken.some(t => t[0] === x && t[1] === y)) return false;
    if (x === e[0] && y === e[1]) return false;
    return true;
  };
  const tx = e[0] + dx, ty = e[1] + dy;
  for (let r = 0; r < 8; r++) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
    if (Math.max(Math.abs(xx), Math.abs(yy)) !== r) continue;
    if (ok(tx + xx, ty + yy)) return [tx + xx, ty + yy];
  }
  return [tx, ty];
}

// Tidy a grid's walls so rooms read clearly: walls no floor touches become void; walls standing in FRONT of the floor
// (the floor only behind them, at x-1 / y-1) become void too, so they never hide a tunnel; the back rims that remain
// stand two levels above the floor they border.
export function rim(g, wallCh = '#') {
  const solid = ch => ch === wallCh || ch === ' ' || ch === '%';
  const at = (x, y) => (x < 0 || y < 0 || x >= g.w || y >= g.h) ? ' ' : g.t[y][x];
  const out = g.t.map(r => r.slice()), oz = g.z.map(r => r.slice());
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.t[y][x] !== wallCh) continue;
    let back = false, front = false, fz = 0;
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1]]) { const ch = at(x + dx, y + dy); if (!solid(ch)) { back = true; fz = Math.max(fz, +g.z[y + dy][x + dx]); } }
    for (const [dx, dy] of [[-1, 0], [0, -1], [-1, -1], [1, -1], [-1, 1]]) { const ch = at(x + dx, y + dy); if (!solid(ch)) front = true; }
    if (!back) { out[y][x] = ' '; continue; }
    oz[y][x] = String(Math.max(0, Math.min(3, fz - 1)));
  }
  g.t = out; g.z = oz;
  return g;
}
