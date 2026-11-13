// The save state and the rules that change it: flags, party, levels, gear, items, buttons, recruiting.
import { G } from './core.js';
import { PARTY, SKILLS } from './data/core/party.js';
import { ITEMS, KEY_ITEMS, gearInfo } from './data/core/items.js';
import { SQUADS } from './data/core/squads.js';

export const statAt = (base, L) => Math.round(base * (1 + 0.1 * (L - 1)));
// XP to the next level: refit to the real encounter lists (was 12*L^1.6+20; see design/progress/balance.md)
export const xpNext = L => Math.round(55 * Math.pow(L, 1.4) + 60);

// ngFrom: a won save's state (New Game+): its party's levels and XP carry over (applied as each friend joins), and so
// do the bestiary (met) and the army best times (armyBest); everything else starts fresh (design/changes/ngplus.md)
export function newGame(ngFrom) {
  G.s = {
    v: 1, chapter: 0, map: 'c0-downs', x: 0, y: 0, facing: 'se', placeName: '',
    flags: {}, buttons: 0, items: {}, keyItems: {}, gear: {}, armyGear: {},
    party: { members: {}, active: [], order: [] },  // active: up to 2 travelling with Bramble
    playTime: 0, defeated: {}, opened: {}, quest: '', losses: {}, memories: [], met: {}, rallied: {}, lastDoor: null, escorts: [],
  };
  if (ngFrom) {
    G.s.ng = ngCarry(ngFrom);
    G.s.met = { ...(ngFrom.met || {}) };
    if (ngFrom.armyBest) G.s.armyBest = JSON.parse(JSON.stringify(ngFrom.armyBest));
  }
  addMember('bramble', 1, true);
  return G.s;
}
// what a New Game+ carries from a won save: every member's level and XP (a member the save never had keeps the earlier
// cycle's carried level), the cycle count and the play time so far
export function ngCarry(src) {
  const prev = src.ng || {}, levels = { ...(prev.levels || {}) }, xp = { ...(prev.xp || {}) };
  for (const [id, m] of Object.entries((src.party && src.party.members) || {})) { levels[id] = m.lvl; xp[id] = m.xp || 0; }
  return { cycle: (prev.cycle || 0) + 1, levels, xp, prevTime: (prev.prevTime || 0) + (src.playTime || 0), from: Date.now() };
}
export const ngCycle = () => (G.s && G.s.ng ? G.s.ng.cycle || 0 : 0);

// ---- flags
export const flag = k => !!(G.s && G.s.flags[k]);
export const setFlag = (k, v = true) => { G.s.flags[k] = v; };
export const getVal = k => G.s.flags[k];

// ---- party
export function addMember(id, level, silent) {
  const P = PARTY[id]; if (!P) throw new Error('no party member ' + id);
  const s = G.s.party;
  if (s.members[id]) return s.members[id];
  // New Game+: a friend joins at their carried level (and XP) if that is higher
  const carried = (G.s.ng && G.s.ng.levels && G.s.ng.levels[id]) || 0;
  const lv = Math.max(level || P.join, avgLevel(), carried);
  const m = { id, lvl: lv, xp: carried && lv === carried ? (G.s.ng.xp && G.s.ng.xp[id]) || 0 : 0, hp: 0, pl: 0, gear: { tool: null, coat: null, charm: null } };
  s.members[id] = m; s.order.push(id);
  m.hp = maxHp(id); m.pl = maxPl(id);
  if (id !== 'bramble' && s.active.length < 2) s.active.push(id);
  G.s.flags['g_recruit_' + id] = true;
  return m;
}
export function avgLevel() {
  const ms = Object.values(G.s.party.members); if (!ms.length) return 1;
  const act = ['bramble', ...G.s.party.active].map(id => G.s.party.members[id]).filter(Boolean);
  return Math.round(act.reduce((a, m) => a + m.lvl, 0) / act.length);
}
export function member(id) { return G.s.party.members[id]; }
export function travelling() { return ['bramble', ...G.s.party.active].filter(id => G.s.party.members[id]); }
export function reserves() { return G.s.party.order.filter(id => id !== 'bramble' && !G.s.party.active.includes(id)); }
export function hasMember(id) { return !!G.s.party.members[id]; }
export function gearBonus(id) {
  const m = member(id), b = { str: 0, wit: 0, tgh: 0, hp: 0, spd: 0, effects: [] };
  for (const slot of ['tool', 'coat', 'charm']) {
    const g = m.gear[slot] && gearInfo(m.gear[slot]); if (!g) continue;
    for (const k in g.bonus) b[k] += g.bonus[k];
    if (g.effect) b.effects.push(g.effect);
  }
  return b;
}
export function stats(id) {
  const P = PARTY[id], m = member(id), L = m.lvl, gb = gearBonus(id);
  return {
    hp: statAt(P.hp, L) + gb.hp, pl: statAt(P.pl, L), str: statAt(P.str, L) + gb.str, tgh: statAt(P.tgh, L) + gb.tgh,
    spd: statAt(P.spd, L) + gb.spd, wit: statAt(P.wit, L) + gb.wit, effects: gb.effects,
  };
}
export const maxHp = id => stats(id).hp;
export const maxPl = id => stats(id).pl;
export function skillsOf(id) {
  const P = PARTY[id], m = member(id);
  const n = m.lvl >= 20 ? 5 : m.lvl >= 10 ? 4 : 3;
  // New Game+: the Long Thump is the finale's move; Bramble learns it again when Chapter 4 is done
  return P.skills.slice(0, n).filter(k => SKILLS[k] && !(k === 'long-thump' && G.s.ng && !G.s.flags.g_ch4_done));
}
// level catch-up: XP x (1 + 0.3 per level the foes stand above the member), 0.25x to 2x. A member who skipped
// fights catches up on the next ones; one who cleared every map (or grinds) levels slower. (design/progress/calibration.md)
export const xpCatchUp = d => Math.max(0.25, Math.min(2, 1 + 0.3 * d));
// give XP to everyone (reserves included); foeLvl = the beaten foes' level (XP-weighted); returns level-ups [{id, lvl}]
export function giveXp(xp, foeLvl) {
  const ups = [];
  for (const id of G.s.party.order) {
    const m = member(id); m.xp += foeLvl === undefined ? xp : Math.round(xp * xpCatchUp(foeLvl - m.lvl));
    while (m.lvl < 30 && m.xp >= xpNext(m.lvl)) {
      m.xp -= xpNext(m.lvl); const oldHp = maxHp(id), oldPl = maxPl(id); m.lvl++;
      m.hp += maxHp(id) - oldHp; m.pl += maxPl(id) - oldPl; ups.push({ id, lvl: m.lvl });
    }
    if (m.lvl >= 30) m.xp = 0;
  }
  return ups;
}
export function healAll() { for (const id of G.s.party.order) { const m = member(id); m.hp = maxHp(id); m.pl = maxPl(id); } }
export function restorePluck(frac) { for (const id of G.s.party.order) { const m = member(id); m.pl = Math.min(maxPl(id), m.pl + Math.ceil(maxPl(id) * frac)); } }
export function setActive(list) { G.s.party.active = list.filter(id => id !== 'bramble' && hasMember(id)).slice(0, 2); }

// ---- items and gear
export function giveItem(id, n = 1) {
  if (KEY_ITEMS[id]) { G.s.keyItems[id] = (G.s.keyItems[id] || 0) + n; return; }
  if (ITEMS[id]) { G.s.items[id] = Math.min(99, (G.s.items[id] || 0) + n); return; }
  if (gearInfo(id)) { G.s.gear[id] = (G.s.gear[id] || 0) + n; return; }
  throw new Error('unknown item ' + id);
}
export function takeItem(id, n = 1) {
  const bag = KEY_ITEMS[id] ? G.s.keyItems : ITEMS[id] ? G.s.items : G.s.gear;
  if ((bag[id] || 0) < n) return false;
  bag[id] -= n; if (bag[id] <= 0) delete bag[id]; return true;
}
export const hasItem = (id, n = 1) => ((G.s.keyItems[id] || G.s.items[id] || G.s.gear[id] || 0) >= n);
export const itemCount = id => G.s.keyItems[id] || G.s.items[id] || G.s.gear[id] || 0;
// gear owned but not equipped by anyone
export function gearFree(id) {
  let used = 0; for (const m of Object.values(G.s.party.members)) for (const s in m.gear) if (m.gear[s] === id) used++;
  return (G.s.gear[id] || 0) - used;
}
export function equip(mid, slot, gid) {
  const m = member(mid);
  if (gid && gearFree(gid) <= 0 && m.gear[slot] !== gid) return false;
  const hpFrac = m.hp / maxHp(mid);
  m.gear[slot] = gid || null;
  m.hp = Math.max(1, Math.min(maxHp(mid), Math.round(maxHp(mid) * hpFrac)));
  return true;
}
// Auto-equip best: fill the travelling three from everything owned (score by total bonus)
export function autoEquip() {
  const ids = travelling();
  for (const id of ids) for (const s of ['tool', 'coat', 'charm']) member(id).gear[s] = null;
  const score = (g, id) => {
    const P = PARTY[id]; const b = g.bonus;
    const prefersWit = P.wit > P.str;
    return (prefersWit ? b.wit * 1.2 + b.str * 0.3 : b.str * 1.2 + b.wit * 0.3) + b.tgh + b.hp / 4 + b.spd + (g.effect ? 2 : 0);
  };
  for (const slot of ['tool', 'coat', 'charm']) {
    for (const id of ids) {
      let best = null, bs = -1;
      for (const gid of Object.keys(G.s.gear)) {
        const g = gearInfo(gid); if (!g || g.slot !== slot || gearFree(gid) <= 0) continue;
        const sc = score(g, id); if (sc > bs) { bs = sc; best = gid; }
      }
      if (best) member(id).gear[slot] = best;
    }
  }
  for (const id of ids) { const m = member(id); m.hp = Math.min(m.hp, maxHp(id)); }
}

// ---- army
export function ownedSquads() {
  const out = [];
  for (const [id, sq] of Object.entries(SQUADS)) {
    if (sq.free) continue;
    const leader = sq.leader;
    if (G.s.flags['g_recruit_' + leader] || G.s.flags['g_squad_' + id]) out.push(id);
  }
  return out;
}
export const warrensFreed = () => ['g_freed_thimblebank', 'g_freed_silverdown', 'g_freed_wheatsheaf', 'g_freed_flintcomb'].filter(f => G.s.flags[f]).length;

// ---- quest line
export function setQuest(text) { G.s.quest = text; }
