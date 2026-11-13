// Shared bits for chapter 4: legend chars, small script helpers, safe spots on other chapters' maps.
import { G } from '../../core.js';
import { LEGEND } from '../../engine/iso.js';

// extra legend: raised flint that blocks (quarry walls), low rock ridges, cover tiles for the sneak, etc.
export const LEG = {
  W: { k: 'flint', walk: 0 },            // white flint block (use heights for its size)
  R: { k: 'rock', walk: 0 },             // volcanic rock ridge
  C: { k: 'moss', walk: 1, cover: 1 },   // under a tall mushroom: the shepherd can't see you here
  B: { k: 'bone', walk: 0 },             // heaped bones
  D: { k: 'carve', walk: 0 },            // Deepdelve's carved stone blocks
  V: { k: 'wall', walk: 0 },             // dark depth-stone block
  F: { k: 'floor', walk: 1 },
  S: { k: 'sand', walk: 1 },
};

// a door-like trigger runner that tolerates a script someone else owns being missing
export function runIfThere(id, fallback) {
  return async (s, a) => {
    const f = G.data.scripts[id];
    if (f) return f(s, a);
    if (fallback) return fallback(s, a);
  };
}

// Find a free, walkable tile on another chapter's map near (px, py) (or near a named entry), so the
// people we add to Thimblebank never stand in a wall even if that map changes. Called at map load.
export function freeSpot(mapId, px, py, entry, salt = 0) {
  const m = G.data && G.data.maps[mapId];
  if (!m) return { x: px, y: py };
  if (entry && m.entries && m.entries[entry]) { px = m.entries[entry][0]; py = m.entries[entry][1]; }
  const leg = { ...LEGEND, ...(m.legend || {}) };
  const rows = m.tiles || [];
  const H = rows.length, Wd = Math.max(...rows.map(r => r.length));
  const taken = new Set();
  // only plain numbers: other chapters' people and props placed by getters are never read here (their getters may
  // look at ours, and round and round it would go)
  const plain = o => { const d = Object.getOwnPropertyDescriptor(o, 'x'); return d && !d.get && typeof o.x === 'number'; };
  for (const p of m.props || []) { if (!Array.isArray(p) && !plain(p)) continue; const o = Array.isArray(p) ? { x: p[1], y: p[2], w: p[3] || 1, h: p[4] || 1 } : { w: p.w || 1, h: p.h || 1, x: p.x, y: p.y }; for (let a = 0; a < o.w; a++) for (let b = 0; b < o.h; b++) taken.add((o.x + a) + ',' + (o.y + b)); }
  for (const n of m.npcs || []) if (plain(n)) taken.add(n.x + ',' + n.y);
  for (const d of m.doors || []) if (plain(d)) taken.add(d.x + ',' + d.y);
  for (const e of Object.values(m.entries || {})) taken.add(e[0] + ',' + e[1]);
  const ok = (x, y) => {
    if (x < 1 || y < 1 || x >= Wd - 1 || y >= H - 1) return false;
    const L = leg[(rows[y] || '')[x] || ' ']; if (!L || !L.walk || L.small) return false;
    if (taken.has(x + ',' + y)) return false;
    // keep at least two walkable neighbours so nobody gets boxed in
    let n = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const L2 = leg[(rows[y + dy] || '')[x + dx] || ' ']; if (L2 && L2.walk && !taken.has((x + dx) + ',' + (y + dy))) n++; }
    return n >= 2;
  };
  let skip = salt;
  for (let r = 1; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    if (ok(px + dx, py + dy)) { if (skip-- > 0) continue; return { x: px + dx, y: py + dy }; }
  }
  return { x: px, y: py };
}
// an NPC whose position is worked out when the map loads (getters run when the engine copies it)
export function placed(mapId, px, py, entry, salt, rest) {
  let cache = null, busy = false;
  const at = () => { if (cache) return cache; if (busy) return { x: -99, y: -99 }; busy = true; try { cache = freeSpot(mapId, px, py, entry, salt); } finally { busy = false; } return cache; };
  return { mine: true, ...rest, get x() { return at().x; }, get y() { return at().y; } };
}

// draw "A.S." in tiny pixel letters (3x5 each) at a screen point
const GLYPH = {
  A: ['010', '101', '111', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  '.': ['000', '000', '000', '000', '010'],
};
export function pixelText(c, str, x, y, col, scale = 1) {
  c.fillStyle = col;
  let cx = x;
  for (const ch of str) {
    const g = GLYPH[ch]; if (!g) { cx += 3 * scale; continue; }
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (g[r][k] === '1') c.fillRect(cx + k * scale, y + r * scale, scale, scale);
    cx += (ch === '.' ? 2 : 4) * scale;
  }
}

// the travelling companions (not Bramble)
export const comp = (s) => s.party().filter(id => id !== 'bramble');
// one companion comments: the first travelling one with a line in `opts` ({ id: text }); `_` = narration fallback
export async function chime(s, opts) {
  for (const id of comp(s)) if (opts[id]) return s.say(id, opts[id]);
  if (opts._) return s.narrate(opts._);
}
// a bubble from the first travelling companion with a line
export function chirp(s, opts, secs = 3.5) {
  for (const id of comp(s)) if (opts[id]) { s.bubble(id, opts[id], secs); return; }
}
// run a cross-chapter script if it exists
export async function maybe(s, id) { const f = G.data.scripts[id]; if (f) await f(s); }
