// Real-path route extractor for tools/curve.mjs --real. Reads the full playthrough's step files
// (design/solutions/fullrun/NNN-*.json, in order; retries / grinding / resume files skipped), tracks the map and
// Bramble's tile through walk/click/talk/goto targets, door hops and `until s.map === ...` waits, joins consecutive
// points with A* over the map's walkable tiles (|height step| <= 1, props ignored) and writes, per map, the tiles the
// main path crosses plus how many fights the full run actually took there: design/solutions/fullrun/route.json.
// Run: node tools/route.mjs        (re-run after moving doors/entries; enemy positions are read live by curve.mjs)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
globalThis.location = undefined;
const { LEGEND } = await import('../game/src/engine/iso.js');
const { findPath } = await import('../game/src/engine/path.js');
const { loadData } = await import('../game/src/data/index.js');
const G = await loadData();
const DIR = new URL('../design/solutions/fullrun/', import.meta.url);
// files that are part of the main path (not retries after a loss, not the grinding detours of the run)
const files = readdirSync(DIR).filter(f => /^\d{3}-.*\.json$/.test(f)).sort();
const tileOf = (m, x, y) => { const r = m.tiles[y]; return r && LEGEND[r[x]]; };
const hOf = (m, x, y) => { const r = m.heights && m.heights[y]; return r ? parseInt(r[x], 36) || 0 : 0; };
const walk = (m, x, y) => { const t = tileOf(m, x, y); return !!(t && t.walk); };
const route = {};   // mapId -> Set of "x,y"
const fights = {};  // mapId -> fights the run took
const notes = {};   // mapId -> the notes of those fight steps
let map = G.start.map, pos = [G.start.x, G.start.y];
const mark = (id, x, y) => { (route[id] = route[id] || new Set()).add(x + ',' + y); };
function go(x, y) {
  const m = G.maps[map]; if (!m) { pos = null; return; }
  if (pos) {
    const p = findPath(pos[0], pos[1], x, y, (a, b, c, d) => walk(m, c, d) && Math.abs(hOf(m, c, d) - hOf(m, a, b)) <= 1, (a, b) => hOf(m, a, b), 20000);
    if (p) for (const q of p) mark(map, q.x, q.y);
    else { // straight line (a door on a blocked tile, a raised ledge the real game allows)
      const n = Math.max(Math.abs(x - pos[0]), Math.abs(y - pos[1]));
      for (let i = 0; i <= n; i++) mark(map, Math.round(pos[0] + (x - pos[0]) * i / (n || 1)), Math.round(pos[1] + (y - pos[1]) * i / (n || 1)));
    }
  } else mark(map, x, y);
  pos = [x, y];
  const door = (m.doors || []).find(d => d.x === x && d.y === y);
  if (door && G.maps[door.to]) { map = door.to; const e = (G.maps[map].entries || {})[door.entry]; pos = e ? [e[0], e[1]] : null; if (pos) mark(map, pos[0], pos[1]); }
}
const bad = [];
for (const f of files) {
  const sol = JSON.parse(readFileSync(new URL(f, DIR), 'utf8'));
  const seg = G.segments.find(s => s.id === f.slice(4, -5));   // NNN-<segment>.json starts where the segment starts
  if (seg && seg.map !== map) { map = seg.map; pos = seg.x !== undefined ? [seg.x, seg.y] : null; }
  for (const st of sol.steps || []) {
    const t = st.walk || st.click || st.goto;
    if (t) {
      const m = G.maps[map];
      if (!m || !tileOf(m, t[0], t[1])) {   // not a tile of this map: a scripted move we did not see; find the map by the next door/until
        bad.push(`${f}: ${JSON.stringify(t)} not on ${map}`); pos = null; continue;
      }
      go(t[0], t[1]); continue;
    }
    if (st.talk) { const m = G.maps[map]; const n = m && (m.npcs || []).find(n => n.id === st.talk); if (n) go(n.x, n.y); continue; }
    if (st.fight === 'auto' || st.fightIf !== undefined || st.engage) { fights[map] = (fights[map] || 0) + 1; (notes[map] = notes[map] || []).push(st.note || (st.fightIf !== undefined ? 'fightIf' : st.engage ? 'engage ' + st.engage : '?')); continue; }
    const c = st.until || st.spaceUntil;
    if (typeof c === 'string') {
      const mm = c.match(/s\.map\s*===\s*\\?["']([\w-]+)\\?["']/);
      if (mm && mm[1] !== map && G.maps[mm[1]]) { map = mm[1]; pos = null; }
    }
  }
}
if (bad.length) console.log('unplaced points (scripted moves):\n  ' + bad.join('\n  '));
const out = {};
for (const [id, s] of Object.entries(route)) out[id] = { tiles: [...s].map(k => k.split(',').map(Number)), fights: fights[id] || 0 };
for (const [id, n] of Object.entries(fights)) if (!out[id]) out[id] = { tiles: [], fights: n };
writeFileSync(new URL('route.json', DIR), JSON.stringify(out));
for (const [id, r] of Object.entries(out)) console.log(id.padEnd(24), String(r.tiles.length).padStart(4), 'route tiles', String(r.fights).padStart(3), 'fights in the run', ((G.maps[id] && G.maps[id].enemies) || []).length, 'enemies');
if (process.argv.includes('--notes')) for (const [id, n] of Object.entries(notes)) console.log(id.padEnd(24), n.join(' | '));
