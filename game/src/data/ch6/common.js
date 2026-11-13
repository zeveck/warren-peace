// Shared helpers for the Epilogue: flags, staging for friends who may or may not be travelling, the code-made
// thump, refreshing a map in place after a flag changes, and the one-line quest.
import { G } from '../../core.js';
import { flag, travelling } from '../../state.js';
import { LEGEND } from '../../engine/iso.js';

export const won = () => flag('g_won');
export const started = () => flag('c6_started');
export const done = () => flag('g_c6_done');
export const running = () => started() && !done();
export const trav = id => !!(G.s && travelling().includes(id));
export const has = id => !!(G.s && G.s.party.members[id]);
export const escorting = id => !!(G.s && Array.isArray(G.s.escorts) && G.s.escorts.some(e => e.id === id));
// a friend stands on the map (as c6-<id>) when they're with us but not travelling
export const standing = id => () => started() && has(id) && !trav(id);

// ---------------------------------------------------------------- the four tasks
export const HEAPS = [1, 2, 3];
export const CLOCKS = [1, 2, 3, 4, 5];
export const ROOMS = ['nursery', 'larder', 'den'];
export const heapsCleared = () => HEAPS.filter(n => flag('c6_heap' + n)).length;
export const clocksPicked = () => CLOCKS.filter(n => flag('c6_clock' + n)).length;
export const patchesSown = () => HEAPS.filter(n => flag('c6_sown' + n)).length;
export const clocksHeld = () => clocksPicked() - patchesSown() - (flag('c6_sown') ? 2 : 0);
export const roomsOpen = () => ROOMS.filter(r => flag('c6_room_' + r)).length;
export const ready = () => flag('c6_heaps_done') && flag('c6_sown') && flag('c6_rooms_done') && flag('c6_gault_done');

export function nextStep() {
  if (done()) return 'Peace on the Downs. Wander, and talk to everyone.';
  if (!flag('c6_invited')) return 'Shale of Flintcomb is waiting for you, near Thimblebank\'s mouth.';
  if (!started()) return 'Go east from Sorrel Down to Flintcomb. Shale has gone ahead.';
  if (ready()) return 'Go down Flintcomb\'s spiral to the lip of the hole. Knapper has finished the stone.';
  const todo = [];
  if (!flag('c6_heaps_done')) todo.push(`heaps ${heapsCleared()}/3 (Rumble)`);
  if (!flag('c6_sown')) todo.push(`clocks ${clocksPicked()}/5`);
  if (!flag('c6_rooms_done')) todo.push(`old rooms ${roomsOpen()}/3`);
  if (!flag('c6_gault_done')) todo.push(flag('c6_room_nursery') ? 'Chip to Gault' : 'Gault');
  return 'Rebuild Flintcomb: ' + todo.join(', ') + '.';
}

// ---------------------------------------------------------------- refresh a map in place (no re-warp)
// Props, people and (for maps whose tiles are getters) the tiles are only read when a map loads. After a flag
// changes, this re-reads them so the change shows at once: props and npcs whose cond turned true appear, those
// whose cond turned false go; actors spawned by scripts are left alone.
export function refreshConds(ex) {
  const m = ex.map, def = m.def;
  if (def.retile) {
    const rows = def.tiles, legend = { ...LEGEND, ...(def.legend || {}) };
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const ch = rows[y][x] || ' '; const L = legend[ch] || null;
      const hch = def.heights ? (def.heights[y] || '')[x] : '0';
      let h = hch && hch !== ' ' && hch !== '.' ? parseInt(hch, 36) : 0; if (isNaN(h)) h = 0;
      m.tiles[y * m.w + x] = L ? { ...L, ch } : null; m.heights[y * m.w + x] = L ? h + (L.wall ? 3 : 0) : -1;
    }
  }
  m.props = [];
  for (const p of def.props || []) {
    const o = Array.isArray(p) ? { id: p[0], x: p[1], y: p[2], w: p[3] || 1, h: p[4] || 1 } : { w: 1, h: 1, ...p };
    if (o.cond && !o.cond()) continue;
    m.props.push(o);
  }
  const defIds = new Set((def.npcs || []).map(a => a.id));
  const want = (def.npcs || []).filter(a => !a.cond || a.cond());
  const wantIds = new Set(want.map(a => a.id));
  m.actors = m.actors.filter(a => !defIds.has(a.id) || wantIds.has(a.id));
  for (const a of want) if (!m.actors.some(b => b.id === a.id)) m.actors.push({ kind: 'npc', facing: 'se', hopT: -1, ...a, sprite: a.sprite || a.id, x: a.x, y: a.y, tx: a.x, ty: a.y });
}

// ---------------------------------------------------------------- the thump (there is no map thump animation:
// a hop in place, a shake and the sound)
export async function thump(s, big = 1) {
  const ex = s.ex, b = ex.b, h = ex.hAt(b.x, b.y);
  // a landing re-runs step triggers on the tile (Quarry's rope at the lip!): only hop where there are none
  const onTrig = (ex.map.def.triggers || []).some(t => !t.use && b.x >= t.x && b.x < t.x + (t.w || 1) && b.y >= t.y && b.y < t.y + (t.h || 1));
  if (!onTrig) { b.hop = { fx: b.x, fy: b.y, fh: h, tx: b.x, ty: b.y, th: h, t: 0, dur: 0.26, o0: { x: 0, y: 0 }, o1: { x: 0, y: 0 } }; b.hopT = 0; }
  else s.emote('bramble', '!', 0.5);
  await s.wait(0.25);
  s.shake(0.2 + 0.15 * big, 1 + big);
  s.sfx(big >= 3 ? 'warren-drum' : big === 2 ? 'thump-2' : 'thump-1', { vol: 0.9 });
  ex.dust && ex.dust(b.x, b.y, h);
  await s.wait(0.25);
}

// the first travelling companion with a line in `opts` says it ({ id: text }); `_` = narration fallback
export async function chime(s, opts) {
  for (const id of travelling()) if (id !== 'bramble' && opts[id]) return s.say(id, opts[id]);
  if (opts._) return s.narrate(opts._);
}
export function chirp(s, opts, secs = 3.5) {
  for (const id of travelling()) if (id !== 'bramble' && opts[id]) { s.bubble(id, opts[id], secs); return true; }
  return false;
}
// staging: the actor that stands for a friend on this map (their follower if travelling, else c6-<id>)
export const stage = (s, id) => s.actor(trav(id) ? id : 'c6-' + id);
