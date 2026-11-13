// Post-game army revisits: best times (battle time in sim ticks, from the first order), medals and formatting.
// Stored per save in G.s.armyBest[id] = { ticks, easy, when }, created lazily (old saves and new games alike).
import { G } from '../core.js';

export const REVISITS = ['c1-rts1', 'c2-rts2', 'c3-rts3', 'c4-rts4', 'c5-rts5'];
export const MEDALS = ['gold', 'silver', 'bronze'];
export const MEDAL_NAME = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
export const MEDAL_COLOR = { gold: '#f0c850', silver: '#d8dce8', bronze: '#d89a5a' };

export function bests() { if (!G.s) return {}; if (!G.s.armyBest || typeof G.s.armyBest !== 'object') G.s.armyBest = {}; return G.s.armyBest; }
export function bestOf(id) { const b = bests()[id]; return b && typeof b.ticks === 'number' ? b : null; }
// m:ss.t from ticks (10 a second)
export function fmtTime(ticks) {
  const t = Math.max(0, Math.round(ticks)), m = Math.floor(t / 600), s = Math.floor((t % 600) / 10), d = t % 10;
  return `${m}:${String(s).padStart(2, '0')}.${d}`;
}
export const fmtSecs = secs => fmtTime(Math.round(secs * 10));
export function shortName(id) { const d = G.data.rts[id]; return d ? (d.short || d.name.replace(/^The Battle of /, '')) : id; }
export function medalsOf(id) { const d = G.data.rts[id]; return (d && d.medals) || null; }
// the medal a run earns: Normal mode only, time at or under the target
export function medalFor(id, ticks, easy) {
  const m = medalsOf(id); if (!m || easy) return null;
  for (const k of MEDALS) if (ticks <= Math.round(m[k] * 10)) return k;
  return null;
}
export function medalOf(id) { const b = bestOf(id); return b ? medalFor(id, b.ticks, b.easy) : null; }
export function beatBurdock(id, ticks, easy) { const m = medalsOf(id); return !!(m && !easy && ticks < Math.round(m.burdock * 10)); }
// record a won revisit: a Normal time always beats an Easy best; an Easy time only fills an empty slot or improves an Easy best
export function recordBest(id, ticks, easy) {
  const B = bests(), prev = bestOf(id);
  let better;
  if (!prev) better = true;
  else if (!easy && prev.easy) better = true;
  else if (easy && !prev.easy) better = false;
  else better = ticks < prev.ticks;
  if (better) B[id] = { ticks, easy: !!easy, when: Date.now() };
  return { isNew: better, prev };
}
