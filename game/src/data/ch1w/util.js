// Small helpers for building ch1w maps and scripts.
import { G, findScene, ui } from '../../core.js';
import { LEGEND, toScreen } from '../../engine/iso.js';
import { flag } from '../../state.js';

// Ninefold's errand stays on the quest line until it is done (the full playthrough lost it after the Choir: the next
// quest lines all point at the Lookout Stone). Used by ch1w, ch1 and ch2 quest lines set after the Choir.
export const ninefoldWaiting = () => flag('c1w_nf_asked') && !flag('g_recruit_ninefold');
export const withNinefold = t => (ninefoldWaiting() && t ? `${t} (Ninefold still waits for a dandelion.)` : t);

export const grid = (w, h, ch = '.') => Array.from({ length: h }, () => Array(w).fill(ch));
export function fill(g, x0, y0, x1, y1, ch) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y] && x < g[y].length) g[y][x] = ch; }
export function put(g, pts, ch) { for (const [x, y] of pts) g[y][x] = ch; }
export const rows = g => g.map(r => r.join(''));
export const explore = () => findScene('explore');
export const size = () => { const e = findScene('explore'); return e ? e.size : 'normal'; };
export const isBig = ex => ex.size === 'big';

// A paintable map: m.t[y][x] tile chars, m.z[y][x] heights. bake(m) -> { tiles, heights }.
export function mk(w, h, ch = '.', z = 0) { return { w, h, t: Array.from({ length: h }, () => Array(w).fill(ch)), z: Array.from({ length: h }, () => Array(w).fill(z)) }; }
export function box(m, x0, y0, x1, y1, ch, z) { for (let y = Math.max(0, y0); y <= Math.min(m.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(m.w - 1, x1); x++) { if (ch != null) m.t[y][x] = ch; if (z != null) m.z[y][x] = z; } }
export function dot(m, x, y, ch, z) { if (x < 0 || y < 0 || x >= m.w || y >= m.h) return; if (ch != null) m.t[y][x] = ch; if (z != null) m.z[y][x] = z; }
export function oval(m, cx, cy, rx, ry, ch, z) { for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) dot(m, x, y, ch, z); }
export function line(m, pts, ch, z) { for (let i = 0; i < pts.length - 1; i++) { let [x, y] = pts[i]; const [x1, y1] = pts[i + 1]; for (;;) { dot(m, x, y, ch, z); if (x === x1 && y === y1) break; if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); } } }
export function speckle(m, from, to, every = 7, seed = 1) { for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.t[y][x] === from && ((x * 73 + y * 151 + seed * 37) % 97) % every === 0) m.t[y][x] = to; }
export const bake = m => ({ tiles: m.t.map(r => r.join('')), heights: m.z.map(r => r.map(v => String(v)).join('')) });

// Words drawn over the map (signs, labels on bottles): call from a map's drawOver hook.
export function label(ex, c, ox, oy, x, y, text, lift = 34, color = '#3e2a1e', bg = '#f4ecd8') {
  const s = toScreen(x, y, Math.max(0, ex.hAt(x, y)));
  const w = ui.measure(text, 7) + 6, cx = Math.round(s.x + ox), cy = Math.round(s.y + oy - lift);
  c.fillStyle = color; c.fillRect(cx - w / 2 - 1, cy - 7, w + 2, 11); c.fillStyle = bg; c.fillRect(cx - w / 2, cy - 6, w, 9);
  ui.text(text, cx, cy + 1, { size: 7, align: 'center', color, shadow: false });
}
// A soft glow on a tile (race markers, the white roses).
export function glow(ex, c, ox, oy, x, y, rgb = '255,240,180', a = 0.5) {
  const s = toScreen(x, y, Math.max(0, ex.hAt(x, y))); const k = 0.6 + 0.4 * Math.sin(G.time * 4 + x + y);
  c.fillStyle = `rgba(${rgb},${(a * k).toFixed(2)})`;
  const cx = Math.round(s.x + ox), cy = Math.round(s.y + oy + 8);
  c.beginPath(); c.moveTo(cx, cy - 6); c.lineTo(cx + 12, cy); c.lineTo(cx, cy + 6); c.lineTo(cx - 12, cy); c.fill();
}

// A chest that is also drawn (the engine's chests are invisible on their own): returns [chest, prop].
export function chest(mapId, id, x, y, give, run) {
  const key = mapId + ':' + id;
  const prop = { get id() { return G.s && G.s.opened[key] ? 'prop-chest-open' : 'prop-chest'; }, x, y, chestKey: key };
  const c = { id, x, y, give, run: async (s) => { const p = s.ex.map.props.find(p => p.chestKey === key); if (p) p.id = 'prop-chest-open'; if (run) await run(s); } };
  return [c, prop];
}

// Change a tile at runtime (the Pool of Tears).
export function setTile(ex, x, y, ch, h = 0) {
  const L = { ...LEGEND, ...(ex.map.def.legend || {}) }[ch];
  const i = ex.idx(x, y); ex.map.tiles[i] = L ? { ...L, ch } : null; ex.map.heights[i] = L ? h + (L.wall ? 3 : 0) : -1;
}

// Find free, reachable tiles on another chapter's map (Thimblebank, Sorrel Down) near a named entry, so that
// our additions land somewhere sensible whatever the final layout. Cached per key.
const cache = {};
export function spotNear(mapId, entry, opts = {}) {
  const key = mapId + '|' + entry + '|' + JSON.stringify(opts);
  if (cache[key] !== undefined && G.data) return cache[key];
  const def = G.data && G.data.maps[mapId];
  if (!def || !def.entries || !def.entries[entry]) return null;
  const legend = { ...LEGEND, ...(def.legend || {}) };
  const rowsT = def.tiles, h = rowsT.length, w = Math.max(...rowsT.map(r => r.length));
  const T = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? null : legend[rowsT[y][x] || ' '];
  const H = (x, y) => { const c = def.heights ? (def.heights[y] || '')[x] : '0'; const v = c ? parseInt(c, 36) : 0; return isNaN(v) ? 0 : v; };
  const taken = new Set();
  for (const p of def.props || []) { if (p && p.mine) continue; const o = Array.isArray(p) ? { x: p[1], y: p[2], w: p[3] || 1, h: p[4] || 1 } : { w: 1, h: 1, ...p }; if (o.ground || o.walk) continue; for (let a = 0; a < o.w; a++) for (let b = 0; b < o.h; b++) taken.add((o.x + a) + ',' + (o.y + b)); }
  for (const a of [...(def.npcs || []), ...(def.doors || []), ...(def.chests || [])]) { if (a.mine) continue; try { taken.add(a.x + ',' + a.y); } catch (e) { /* getter */ } }
  for (const t of def.triggers || []) { if (t.mine) continue; try { for (let a = 0; a < (t.w || 1); a++) for (let b = 0; b < (t.h || 1); b++) taken.add((t.x + a) + ',' + (t.y + b)); } catch (e) { /* */ } }
  for (const e of Object.values(def.entries)) taken.add(e[0] + ',' + e[1]);
  for (const e of def.enemies || []) for (const [x, y] of e.loop || [[e.x, e.y]]) taken.add(x + ',' + y);
  const ok = (x, y) => { const t = T(x, y); return t && t.walk && !t.small && !t.china && !t.cover && !taken.has(x + ',' + y); };
  const pass = (x, y) => { const t = T(x, y); return t && t.walk && !t.small; };
  const [ex0, ey0] = def.entries[entry];
  const dist = new Map([[ex0 + ',' + ey0, 0]]); const q = [[ex0, ey0]];
  while (q.length) { const [x, y] = q.shift(); const d = dist.get(x + ',' + y); if (d > (opts.max || 8)) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (dist.has(k) || !pass(nx, ny) || Math.abs(H(nx, ny) - H(x, y)) > 1) continue; if (taken.has(k) && !Object.values(def.entries).some(e => e[0] === nx && e[1] === ny)) continue; dist.set(k, d + 1); q.push([nx, ny]); } }
  const walls = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].filter(([dx, dy]) => { const t = T(x + dx, y + dy); return !t || !t.walk; }).length;
  const cands = [];
  for (const [k, d] of dist) {
    const [x, y] = k.split(',').map(Number);
    if (d < (opts.min || 2) || !ok(x, y)) continue;
    const nOpen = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => ok(x + dx, y + dy) || dist.has((x + dx) + ',' + (y + dy))).length;
    if (nOpen < (opts.open || 2)) continue;
    cands.push({ x, y, d, walls: walls(x, y) });
  }
  if (opts.corner) cands.sort((a, b) => b.walls - a.walls || a.d - b.d || a.x - b.x || a.y - b.y);
  else cands.sort((a, b) => Math.abs(a.d - (opts.want || 4)) - Math.abs(b.d - (opts.want || 4)) || a.walls - b.walls || a.x - b.x || a.y - b.y);
  const skip = opts.skip || 0;
  const r = cands[skip] || null;
  if (G.data) cache[key] = r;
  return r;
}
