// Whole-game data check (headless): every map, door, person, prop, battle, army battle and segment refers to
// things that exist, and every door, person, chest and trigger can be reached on foot from a map's entries.
// Run: node tools/reach.mjs [mapId ...]     Prints ERR (broken) and warn (look at it) lines; exit 1 on any ERR.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
globalThis.location = undefined;
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { LEGEND } = await import('../game/src/engine/iso.js');
const { ENEMIES, BOSSES } = await import('../game/src/data/core/enemies.js');
const { SQUADS, ENEMY_SQUADS } = await import('../game/src/data/core/squads.js');
const { SPEAKERS } = await import('../game/src/data/core/speakers.js');
const { PARTY } = await import('../game/src/data/core/party.js');
const { loadData } = await import('../game/src/data/index.js');
const { G } = await import('../game/src/core.js');
const { newGame } = await import('../game/src/state.js');

const MAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'game/assets/manifest.json'), 'utf8'));
const has = (dir, f) => fs.existsSync(path.join(ROOT, 'game/assets/audio', dir, f));
const errs = [], warns = [];
const E = (m) => errs.push(m), Wn = (m) => warns.push(m);

const _warn = console.warn; console.warn = (...a) => E('load: ' + a.join(' '));
let D;
try { D = await loadData(); } catch (e) { console.log('ERR  data does not load: ' + (e.stack || e)); process.exit(1); }
console.warn = _warn;
G.data = D;
try { newGame(); } catch (e) { /* conds that read the save just see an empty one */ }

const only = process.argv.slice(2);
const safe = (f, d) => { try { return typeof f === 'function' ? f() : f; } catch { return d; } };
const scriptOk = (r) => typeof r === 'function' || (typeof r === 'string' && !!D.scripts[r]);
const speakers = { ...SPEAKERS, ...D.speakers };

for (const [id, m] of Object.entries(D.maps)) {
  if (only.length && !only.includes(id)) continue;
  const T = m.tiles; if (!Array.isArray(T) || !T.length) { E(`${id}: no tiles`); continue; }
  const w = Math.max(...T.map(r => r.length)), h = T.length;
  if (T.some(r => r.length !== w)) Wn(`${id}: rows differ in length`);
  if (w > 56 || h > 56) Wn(`${id}: ${w}x${h} is over 56x56`);
  if (m.heights && (m.heights.length !== h || m.heights.some((r, y) => r.length !== T[y].length))) E(`${id}: heights do not match tiles`);
  const leg = { ...LEGEND, ...(m.legend || {}) };
  const tile = (x, y) => (y >= 0 && y < h && x >= 0 && x < T[y].length) ? T[y][x] : ' ';
  for (let y = 0; y < h; y++) for (const ch of T[y]) if (!(ch in leg)) { E(`${id}: tile char "${ch}" is not in the legend`); y = h; break; }
  const hAt = (x, y) => m.heights && m.heights[y] ? +(m.heights[y][x] || 0) : 0;
  // blocking props
  const blocked = new Set(), ground = new Set();
  for (const p of m.props || []) {
    const o = Array.isArray(p) ? { id: p[0], x: p[1], y: p[2], w: p[3] || 1, h: p[4] || 1 } : { w: 1, h: 1, ...p };
    if (!MAN.props[o.id] && !o.draw) E(`${id}: prop "${o.id}" has no art`);
    for (let j = 0; j < (o.h || 1); j++) for (let i = 0; i < (o.w || 1); i++) {
      const k = (o.x + i) + ',' + (o.y + j);
      if (o.ground || o.walk) ground.add(k); else if (!o.cond) blocked.add(k);
    }
  }
  // generous walk test: any size of Bramble, ignoring conditional things and map hooks
  const walk = (x, y) => { const k = x + ',' + y; if (ground.has(k)) return true; const t = leg[tile(x, y)]; return !!t && (t.walk || t.hedge) && !blocked.has(k); };
  const starts = [];
  for (const [n, e] of Object.entries(m.entries || {})) { if (!walk(e[0], e[1])) E(`${id}: entry "${n}" (${e[0]},${e[1]}) is not on a walkable tile`); starts.push([e[0], e[1]]); }
  if (m.entry) starts.push([m.entry[0], m.entry[1]]);
  if (id === (D.start && D.start.map)) starts.push([D.start.x, D.start.y]);
  for (const s of D.segments) if (s.map === id) starts.push([s.x, s.y]);
  for (const d of m.doors || []) starts.push([d.x, d.y]);
  const seen = new Set(); const q = [];
  for (const [x, y] of starts) if (walk(x, y) && !seen.has(x + ',' + y)) { seen.add(x + ',' + y); q.push([x, y]); }
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (seen.has(k) || !walk(nx, ny)) continue;
      const stairs = m.ramps || m.blocked || m.update;   // maps with hooks may change heights or passage
      if (!stairs && Math.abs(hAt(nx, ny) - hAt(x, y)) > 1) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  const near = (x, y, w2 = 1, h2 = 1) => { for (let j = -1; j <= h2; j++) for (let i = -1; i <= w2; i++) if (seen.has((x + i) + ',' + (y + j))) return true; return false; };
  if (!starts.length) Wn(`${id}: no entries, doors or segment starts lead here`);
  for (const d of m.doors || []) {
    if (d.to) {
      const t = D.maps[d.to];
      if (!t) (d.cond ? Wn : E)(`${id}: door (${d.x},${d.y}) leads to missing map "${d.to}"`);
      else if (typeof d.entry === 'string' && !(t.entries || {})[d.entry]) E(`${id}: door (${d.x},${d.y}) → ${d.to} has no entry "${d.entry}"`);
    } else if (!d.run && !d.lockedRun) Wn(`${id}: door (${d.x},${d.y}) goes nowhere`);
    if (d.run && !scriptOk(d.run)) E(`${id}: door script "${d.run}" is missing`);
    if (!walk(d.x, d.y)) Wn(`${id}: door (${d.x},${d.y}) is on a blocked tile`);
  }
  for (const n of m.npcs || []) {
    const spr = n.sprite || n.id;
    if (!MAN.map[spr] && !MAN.map[spr + '-se']) E(`${id}: person "${n.id}" has no map sprite "${spr}"`);
    if (n.talk && !scriptOk(n.talk)) E(`${id}: person "${n.id}" talk script "${n.talk}" is missing`);
    if (!n.talk && !n.deco) Wn(`${id}: person "${n.id}" has nothing to say`);
    if (blocked.has(n.x + ',' + n.y) || !leg[tile(n.x, n.y)]) Wn(`${id}: person "${n.id}" (${n.x},${n.y}) stands in a prop or off the map`);
    if (!near(n.x, n.y)) Wn(`${id}: person "${n.id}" (${n.x},${n.y}) can't be reached`);
  }
  for (const e of m.enemies || []) {
    if (!ENEMIES[e.type] && !BOSSES[e.type]) E(`${id}: map enemy "${e.id}" type "${e.type}" is unknown`);
    const spr = e.sprite || e.type; if (!MAN.map[spr]) E(`${id}: map enemy "${e.id}" has no map sprite "${spr}"`);
    if (e.encounter && typeof e.encounter === 'string' && !D.encounters[e.encounter]) E(`${id}: map enemy "${e.id}" encounter "${e.encounter}" is missing`);
    if (!walk(e.x, e.y)) Wn(`${id}: map enemy "${e.id}" (${e.x},${e.y}) starts on a blocked tile`);
    for (const [x, y] of e.loop || []) if (!walk(x, y)) Wn(`${id}: map enemy "${e.id}" loop point (${x},${y}) is blocked`);
  }
  for (const c of m.chests || []) if (!near(c.x, c.y)) Wn(`${id}: chest "${c.id}" (${c.x},${c.y}) can't be reached`);
  for (const t of m.triggers || []) {
    if (t.run && !scriptOk(t.run)) E(`${id}: trigger (${t.x},${t.y}) script "${t.run}" is missing`);
    if (!near(t.x, t.y, t.w || 1, t.h || 1)) Wn(`${id}: trigger (${t.x},${t.y}) can't be reached`);
  }
  if (m.onEnter && !scriptOk(m.onEnter)) E(`${id}: onEnter script "${m.onEnter}" is missing`);
  const mus = safe(m.music, null); if (typeof mus === 'string' && !has('music', mus + '.mp3')) E(`${id}: music "${mus}" is missing`);
  for (const a of m.ambience || []) if (!has('loops', a[0] + '.wav')) E(`${id}: ambience "${a[0]}" is missing`);
  if (m.battle && !MAN.bg['bg-battle-' + m.battle]) E(`${id}: battle backdrop "${m.battle}" is missing`);
  if (!m.name) Wn(`${id}: no name`);
}

if (!only.length) {
  for (const [id, e] of Object.entries(D.encounters)) {
    for (const en of e.enemies || []) { const t = Array.isArray(en) ? en[0] : en.type; if (!ENEMIES[t] && !BOSSES[t]) E(`battle ${id}: enemy "${t}" is unknown`); else if (!MAN.battle[t] && !(BOSSES[t] || ENEMIES[t]).sprite && !(BOSSES[t] || ENEMIES[t]).draw) Wn(`battle ${id}: enemy "${t}" has no battle sprite of its own name`); }
    if (e.bg && !MAN.bg['bg-battle-' + e.bg]) E(`battle ${id}: backdrop "${e.bg}" is missing`);
    if (e.backdrop && !MAN.bg[e.backdrop]) E(`battle ${id}: backdrop "${e.backdrop}" is missing`);
    if (e.music && !has('music', e.music + '.mp3')) E(`battle ${id}: music "${e.music}" is missing`);
  }
  for (const [id, r] of Object.entries(D.rts)) {
    const ids = new Set((r.nodes || []).map(n => n.id));
    for (const k of ['home', 'mouth']) if (r[k] && !ids.has(r[k])) E(`army ${id}: ${k} node "${r[k]}" is missing`);
    for (const p of r.paths || []) for (const n of p.slice(0, 2)) if (!ids.has(n)) E(`army ${id}: path to missing node "${n}"`);
    for (const s of r.required || []) if (!SQUADS[s]) E(`army ${id}: required squad "${s}" is unknown`);
    const en = r.enemy || {};
    for (const g of en.guards || []) { if (!ENEMY_SQUADS[g.sq]) E(`army ${id}: enemy squad "${g.sq}" is unknown`); if (!ids.has(g.node)) E(`army ${id}: guard at missing node "${g.node}"`); }
    for (const wv of en.waves || []) { for (const s of wv.sq || []) if (!ENEMY_SQUADS[s]) E(`army ${id}: enemy squad "${s}" is unknown`); for (const n of wv.route || []) if (!ids.has(n)) E(`army ${id}: wave route through missing node "${n}"`); }
  }
  for (const [id, sp] of Object.entries(speakers)) if (sp && sp.por && !MAN.portraits['por-' + sp.por] && !MAN.portraits[sp.por]) Wn(`speaker ${id}: portrait "${sp.por}" is missing`);
  for (const [id, s] of Object.entries(D.shops)) if (s.keeper && !speakers[s.keeper] && !PARTY[s.keeper]) Wn(`shop ${id}: keeper "${s.keeper}" is not a speaker`);
  const segIds = new Set();
  for (const s of D.segments) {
    if (segIds.has(s.id)) E(`segment ${s.id}: duplicate id`); segIds.add(s.id);
    if (!D.maps[s.map]) E(`segment ${s.id}: map "${s.map}" is missing`);
    if (typeof s.done !== 'function') E(`segment ${s.id}: no done()`);
    if (s.script && !scriptOk(s.script)) E(`segment ${s.id}: script "${s.script}" is missing`);
    for (const [m] of s.party || []) if (!PARTY[m]) E(`segment ${s.id}: party member "${m}" is unknown`);
    if (!fs.existsSync(path.join(ROOT, 'design/solutions', s.id + '.json'))) Wn(`segment ${s.id}: no solution file`);
  }
  if (!D.start || !D.maps[D.start.map]) E('no start map');
  for (const mem of ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies', 'mem-mushrooms', 'mem-roses', 'mem-wick', 'mem-china', 'mem-stars']) if (!D.memories[mem]) Wn(`memory ${mem} is not defined by any chapter`);
  for (const id of ['c0-downs', 'c0-warren', 'c1-depths', 'c1-underway', 'c1w-hall', 'c1w-shallows', 'c2-silverdown', 'c2-underway', 'c3-wheatsheaf', 'c3-underway', 'c4-flintcomb', 'c4-underway']) if (!D.maps[id]) E(`interface map ${id} is missing`);
  for (const id of ['underway.stone', 'c1-rts1.won', 'c2-rts2.won', 'c3-rts3.won', 'c4-rts4.won']) if (!D.scripts[id]) E(`interface script ${id} is missing`);
  for (const id of ['c0-guided', 'c1-rts1', 'c2-rts2', 'c3-rts3', 'c4-rts4']) if (!D.rts[id]) E(`army battle ${id} is missing`);
}

for (const m of warns) console.log('warn ' + m);
for (const m of errs) console.log('ERR  ' + m);
console.log(`${Object.keys(D.maps).length} maps, ${Object.keys(D.scripts).length} scripts, ${Object.keys(D.encounters).length} battles, ${Object.keys(D.rts).length} army battles, ${D.segments.length} segments: ${errs.length} error(s), ${warns.length} warning(s)`);
process.exit(errs.length ? 1 : 0);
