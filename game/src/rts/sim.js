// The army-battle simulation: pure, deterministic, no randomness, no drawing. 10 ticks a second.
// Used by the battle scene, the Lookout Stone odds (headless), and tools/rts-balance.mjs.
import { KINDS, SQUADS, ENEMY_SQUADS, matchup } from '../data/core/squads.js';

export const TICK = 0.1;

// battle def: { id, nodes: [{id, letter, kind, x, y, owner}], paths: [[a, b, len]], home, mouth, hold: [nodeIds] (win = hold these 10 s),
//   enemy: { tier, guards: [{sq, node}], waves: [{at (s), sq: [..], route: [nodeIds]}], every, count, spawnRoute },
//   cap, cover: {nodeId: true}, coverPaths: [[a,b]], thump: true (finale) }
export function makeSim(def, army, o = {}) {
  const S = {
    def, t: 0, tick: 0, supply: 20, result: null, holdT: 0, rank: o.rank || 1, easy: !!o.easy, rallied: !!o.rallied,
    nodes: def.nodes.map(n => ({ ...n, owner: n.owner || 'none', cap: 0, capBy: null })),
    squads: [], nextId: 1, waveI: 0, spawnI: 0, abil: { rally: 0, moonlight: 0, monkey: 0, tunnel: 0 }, buffs: { rally: 0, moonlight: 0 }, monkeysUsed: 0,
    events: [], gear: o.gear || {}, thumpT: 0, abilities: o.abilities || [],
  };
  S.node = id => S.nodes.find(n => n.id === id);
  S.adj = {};
  for (const [a, b, len] of def.paths) { (S.adj[a] = S.adj[a] || []).push({ to: b, len }); (S.adj[b] = S.adj[b] || []).push({ to: a, len }); }
  // player squads start at home
  for (const id of army) addSquad(S, 'player', id, def.home);
  // enemy guards
  const tier = (def.enemy.tier || 1) * (S.easy ? 0.75 : 1);
  S.enemyTier = tier;
  for (const g of def.enemy.guards || []) addSquad(S, 'enemy', g.sq, g.node, { guard: g.node });
  return S;
}
function sqDef(side, id) { return side === 'player' ? SQUADS[id] : ENEMY_SQUADS[id]; }
export function addSquad(S, side, id, nodeId, extra = {}) {
  const D = sqDef(side, id), K = KINDS[D.kind];
  const scale = side === 'player' ? S.rank : S.enemyTier;
  const g = side === 'player' ? (S.gear[D.kind] || {}) : {};
  const rally = side === 'player' && S.rallied ? 1.15 : 1;
  const maxHp = K.hp * D.m[0] * scale * (1 + 0.1 * (g.rations || 0)) * rally;
  const n = S.node(nodeId);
  const q = {
    id: S.nextId++, side, sq: id, kind: D.kind, name: D.name, perk: D.perk, light: D.perk === 'light' || D.perk === 'light-reveal',
    reveal: D.perk === 'reveal' || D.perk === 'light-reveal' || id === 'lookouts',
    hp: maxHp, maxHp, atk: K.atk * D.m[1] * scale * (1 + 0.15 * (g.banner || 0)) * rally, def: K.def * D.m[2], spd: K.spd * D.m[3], mail: g.mail || 0,
    at: nodeId, x: n.x, y: n.y, path: null, edge: null, prog: 0, target: null, order: null, contact: null, worn: false, cooldown: 0, disengage: 0,
    ...extra,
  };
  S.squads.push(q); return q;
}

// ---- pathing on the node graph (Dijkstra by tile length)
export function route(S, from, to) {
  if (from === to) return [from];
  const dist = { [from]: 0 }, prev = {}, open = [from], done = new Set();
  while (open.length) {
    open.sort((a, b) => dist[a] - dist[b]); const u = open.shift(); if (done.has(u)) continue; done.add(u);
    if (u === to) break;
    for (const e of S.adj[u] || []) { const d = dist[u] + e.len; if (dist[e.to] === undefined || d < dist[e.to]) { dist[e.to] = d; prev[e.to] = u; open.push(e.to); } }
  }
  if (dist[to] === undefined) return null;
  const p = [to]; let c = to; while (prev[c]) { c = prev[c]; p.unshift(c); } return p;
}
function edgeLen(S, a, b) { const e = (S.adj[a] || []).find(e => e.to === b); return e ? e.len : 1; }

// ---- orders
export function order(S, q, nodeId) {
  if (q.worn || q.side !== 'player') return false;
  const start = q.at || (q.edge ? (q.prog < 0.5 ? q.edge[0] : q.edge[1]) : null);
  if (q.edge && !q.at) {
    // mid-path: turn round or carry on toward the node nearest the goal
    const [a, b] = q.edge; const ra = route(S, a, nodeId), rb = route(S, b, nodeId);
    const da = ra ? pathLen(S, ra) + q.prog * edgeLen(S, a, b) : 1e9, db = rb ? pathLen(S, rb) + (1 - q.prog) * edgeLen(S, a, b) : 1e9;
    if (da < db) { q.edge = [b, a]; q.prog = 1 - q.prog; q.path = ra.slice(1); } else q.path = rb ? rb.slice(1) : [];
    q.goal = nodeId;
  } else {
    const r = route(S, start, nodeId); if (!r) return false;
    q.path = r.slice(1); q.goal = nodeId;
  }
  if (q.contact) q.disengage = 1.0;
  q.contact = null; q.chase = null;
  return true;
}
function pathLen(S, p) { let L = 0; for (let i = 0; i + 1 < p.length; i++) L += edgeLen(S, p[i], p[i + 1]); return L; }
export function orderAttack(S, q, target) { const n = target.at || (target.edge ? (target.prog < 0.5 ? target.edge[0] : target.edge[1]) : null); if (!n) return false; const ok = order(S, q, n); q.chase = target.id; return ok; }

// ---- supply spending
export function reinforce(S, q) {
  if (S.supply < 10 || q.worn || q.cooldown > 0 || q.contact || !q.at) return false;
  const n = S.node(q.at); if (n.owner !== 'player') return false;
  S.supply -= 10; q.hp = Math.min(q.maxHp, q.hp + q.maxHp * 0.4); q.cooldown = 5; S.events.push({ k: 'reinforce', q: q.id }); return true;
}
export const ABILITY = {
  rally: { name: 'Rally', cost: 25, key: 'KeyQ', target: false },
  moonlight: { name: 'Moonlight', cost: 30, key: 'KeyW', target: 'node' },
  monkey: { name: 'Monkey Drop', cost: 35, key: 'KeyE', target: 'node', uses: 2 },
  tunnel: { name: 'Tunnel', cost: 20, key: 'KeyR', target: 'burrow' },
};
export function useAbility(S, id, nodeId, q) {
  const A = ABILITY[id]; if (!S.abilities.includes(id) || S.supply < A.cost) return false;
  if (id === 'monkey' && S.monkeysUsed >= 2) return false;
  if (id === 'rally') { S.buffs.rally = 10; }
  else if (id === 'moonlight') { S.buffs.moonlight = 20; const n = S.node(nodeId); const near = [nodeId, ...(S.adj[nodeId] || []).map(e => e.to)]; for (const s of S.squads) if (s.side === 'player' && !s.worn && near.includes(s.at)) s.hp = Math.min(s.maxHp, s.hp + s.maxHp * 0.25); }
  else if (id === 'monkey') { const m = addSquad(S, 'player', 'winged-monkeys', nodeId, { temp: 30 }); S.monkeysUsed++; }
  else if (id === 'tunnel') { const n = S.node(nodeId); if (!q || q.worn || !n || n.kind !== 'burrow' || n.owner !== 'player') return false; q.at = nodeId; q.edge = null; q.path = null; q.contact = null; q.x = n.x; q.y = n.y; }
  S.supply -= A.cost; S.events.push({ k: 'ability', id, node: nodeId }); return true;
}

// ---- the tick
export function step(S) {
  if (S.result) return;
  S.tick++; S.t = S.tick * TICK; const dt = TICK;
  const def = S.def;
  // supply
  let inc = 0.5; for (const n of S.nodes) if (n.owner === 'player' && n.kind === 'clover') inc += 0.5;
  S.supply = Math.min(99, S.supply + inc * dt);
  for (const k in S.buffs) if (S.buffs[k] > 0) S.buffs[k] = Math.max(0, S.buffs[k] - dt);
  // enemy waves
  spawnWaves(S);
  const live = S.squads.filter(q => !q.worn);
  // finale: dream-shapes slow by held stones
  const held = S.nodes.filter(n => n.kind === 'thump' && n.owner === 'player').length;
  const fin = def.thump;
  // movement
  for (const q of live) {
    q.cooldown = Math.max(0, q.cooldown - dt); q.disengage = Math.max(0, q.disengage - dt);
    if (q.temp !== undefined) { q.temp -= dt; if (q.temp <= 0) { q.worn = true; q.gone = true; continue; } }
    if (q.contact) continue;
    if (q.side === 'enemy') enemyThink(S, q);
    if (!q.path || !q.path.length) { if (q.edge) {} else continue; }
    let speed = q.spd * (fin && q.side === 'enemy' ? Math.max(0.3, 1 - 0.15 * held) : 1);
    if (!q.edge) { const nxt = q.path[0]; q.edge = [q.at, nxt]; q.prog = 0; q.at = null; }
    const L = edgeLen(S, q.edge[0], q.edge[1]);
    q.prog += speed * dt / L;
    if (q.prog >= 1) { q.at = q.edge[1]; q.edge = null; q.prog = 0; q.path.shift(); if (!q.path.length) q.path = null; }
    const a = S.node(q.edge ? q.edge[0] : q.at), b = S.node(q.edge ? q.edge[1] : q.at);
    q.x = a.x + (b.x - a.x) * (q.edge ? q.prog : 0); q.y = a.y + (b.y - a.y) * (q.edge ? q.prog : 0);
  }
  // contact: same node, or same path within 1 tile
  for (const q of live) q.contact = null;
  const pairs = [];
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const a = live[i], b = live[j]; if (a.side === b.side) continue;
    if (inContact(S, a, b)) pairs.push([a, b]);
  }
  for (const [a, b] of pairs) { a.contact = a.contact || []; b.contact = b.contact || []; a.contact.push(b); b.contact.push(a); }
  // combat
  const dmg = new Map();
  for (const q of live) {
    if (!q.contact || q.disengage > 0) continue;
    // pick: best matchup, then lowest HP, then lowest id
    const tgt = q.contact.slice().sort((x, y) => (matchup(q.kind, y.kind, q.light) - matchup(q.kind, x.kind, q.light)) || (x.hp - y.hp) || (x.id - y.id))[0];
    const M = matchup(q.kind, tgt.kind, q.light);
    let A = q.atk;
    if (q.side === 'player' && S.buffs.rally > 0) A *= 1.2;
    const nodeHere = q.at ? S.node(q.at) : null;
    // auras: friendly on same node
    for (const f of live) if (f.side === q.side && f !== q && f.at && f.at === q.at) { if (f.perk === 'atk-aura') A *= 1.1; }
    if (q.perk === 'outnumbered' && q.contact.length > 1) A *= 1.25;
    // eerie aura on enemies of an eerie squad within 3 tiles: -20%
    if (q.kind !== 'eerie') for (const e of live) if (e.side !== q.side && e.kind === 'eerie' && (q.contact.includes(e) || dist(q, e) <= 3)) { A *= 0.8; break; }
    if (q.side === 'enemy' && fin) A *= Math.max(0.3, 1 - 0.1 * held);
    if (tgt.perk === 'hum-resist' && q.side === 'enemy') A *= 0.9;
    let D = tgt.def;
    const tn = tgt.at ? S.node(tgt.at) : null;
    if (tn && tn.kind === 'hilltop' && tn.owner === tgt.side) D *= 1.25;
    if (tn && tn.kind === 'fortified' && tn.owner === tgt.side) D *= 1.5;
    if (tn && tn.kind === 'hilltop' && tgt.perk === 'hill-def') D *= 1.2;
    for (const f of live) if (f.side === tgt.side && f !== tgt && f.at && f.at === tgt.at && f.perk === 'def-aura') D *= 1.1;
    const dps = A * M * (0.5 + 0.5 * q.hp / q.maxHp) * 10 / (10 + D);
    let d = dps * dt * (1 - 0.1 * (tgt.mail || 0));
    dmg.set(tgt, (dmg.get(tgt) || 0) + d);
    if (tgt.perk === 'thorns') dmg.set(q, (dmg.get(q) || 0) + 1 * dt);
  }
  // free hits on disengaging squads
  for (const q of live) if (q.disengage > 0 && q.contact) for (const e of q.contact) { const M = matchup(e.kind, q.kind, e.light); dmg.set(q, (dmg.get(q) || 0) + e.atk * M * 0.5 * dt * 10 / (10 + q.def)); }
  // regen perks
  for (const q of live) {
    if (q.perk === 'regen') q.hp = Math.min(q.maxHp, q.hp + 1 * dt);
    for (const f of live) if (f.side === q.side && f.perk === 'regen-aura' && f.at && f.at === q.at) q.hp = Math.min(q.maxHp, q.hp + 1 * dt);
  }
  for (const [q, d] of dmg) {
    q.hp -= d;
    if (q.hp <= 0) { q.hp = 0; q.worn = true; q.contact = null; q.path = null; q.edge = null; q.at = q.side === 'player' ? def.home : def.mouth; S.events.push({ k: 'worn', q: q.id, side: q.side }); }
  }
  // capture
  for (const n of S.nodes) {
    if (n.dark) continue;
    const here = live.filter(q => !q.worn && q.at === n.id);
    const sides = new Set(here.map(q => q.side));
    if (sides.size !== 1) { if (sides.size === 0) { n.cap = 0; n.capBy = null; } continue; }
    const side = [...sides][0];
    if (n.owner === side) { n.cap = 0; n.capBy = null; continue; }
    if (n.capBy !== side) { n.capBy = side; n.cap = 0; }
    let need = 5;
    for (const q of here) need = Math.min(need, q.perk === 'fast-capture' ? 2 : KINDS[q.kind].cap === 3 ? 3 : q.perk === 'capture-4' ? 4 : 5);
    n.cap += dt;
    if (n.cap >= need) { n.owner = side; n.cap = 0; n.capBy = null; S.events.push({ k: 'taken', node: n.id, side }); if (side === 'player') for (const q of here) if (q.perk === 'supply-capture') S.supply = Math.min(99, S.supply + 3); }
  }
  // win/lose
  const homeN = S.node(def.home);
  if (homeN.owner === 'enemy') S.result = 'lose';
  if (!S.squads.some(q => q.side === 'player' && !q.worn)) S.result = 'lose';
  if (def.thump) {
    const stones = S.nodes.filter(n => n.kind === 'thump');
    if (stones.every(n => n.owner === 'player')) S.thumpT += dt;
    if (S.thumpT >= 60) S.result = 'win';
  } else {
    const holdIds = def.hold || [def.mouth];
    const all = holdIds.every(id => { const n = S.node(id); const contested = live.some(q => q.side === 'enemy' && q.at === id); return n.owner === 'player' && !contested; });
    S.holdT = all ? S.holdT + dt : 0;
    if (S.holdT >= 10) S.result = 'win';
  }
}
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function inContact(S, a, b) {
  if (a.at && b.at) return a.at === b.at;
  // on the same path (either direction) within 1 tile
  const ea = a.edge || (a.at ? null : null), eb = b.edge;
  if (a.at && eb) return (eb[0] === a.at && eb && b.prog * edgeLen(S, eb[0], eb[1]) <= 1) || (eb[1] === a.at && (1 - b.prog) * edgeLen(S, eb[0], eb[1]) <= 1);
  if (b.at && ea) return inContact(S, b, a);
  if (ea && eb) {
    const same = (ea[0] === eb[0] && ea[1] === eb[1]) || (ea[0] === eb[1] && ea[1] === eb[0]);
    if (!same) return false;
    return dist(a, b) <= 1.0;
  }
  return false;
}
function spawnWaves(S) {
  const E = S.def.enemy;
  for (const w of E.waves || []) {
    if (w.done || S.t < w.at * (S.easy && S.def.thump ? 11 / 8 : 1)) continue;
    w.done = true;
    for (const id of w.sq) { const q = addSquad(S, 'enemy', id, w.from || S.def.mouth, { wave: w.route }); S.events.push({ k: 'wave', q: q.id, node: w.from || S.def.mouth }); }
  }
  if (E.every) {
    const every = E.every * (S.easy && S.def.thump ? 11 / 8 : 1);
    const due = Math.floor(S.t / every);
    while (S.spawnI < due && (!E.count || S.spawnI < E.count)) {
      const i = S.spawnI++;
      const ids = E.cycle ? [E.cycle[i % E.cycle.length]] : E.sq;
      const from = E.spawnAt ? E.spawnAt[i % E.spawnAt.length] : S.def.mouth;
      for (const id of ids) { const q = addSquad(S, 'enemy', id, from, { wave: E.route || null, hunt: !!E.hunt }); S.events.push({ k: 'wave', q: q.id, node: from }); }
    }
  }
}
// enemy behaviour: guards hold and attack what enters their node or adjacent paths, then return;
// waves aim at the nearest node on their route the player holds (or walk the route)
function enemyThink(S, q) {
  if (q.path && q.path.length) return;
  if (q.guard) {
    const adj = (S.adj[q.guard] || []).map(e => e.to);
    const intr = S.squads.find(p => p.side === 'player' && !p.worn && !p.hidden && (p.at === q.guard || (p.edge && (p.edge.includes(q.guard)) && adj.some(n => p.edge.includes(n)))));
    if (!intr && q.at !== q.guard) { const r = route(S, q.at || q.edge[1], q.guard); if (r) q.path = r.slice(1); }
    return;
  }
  if (q.hunt) {
    // finale dream-shapes: go for the nearest Thump Stone the player holds, else any stone, else home
    const stones = S.nodes.filter(n => n.kind === 'thump');
    const tgt = stones.find(n => n.owner === 'player') || stones[(q.id) % stones.length];
    const here = q.at; if (!here) return;
    if (here === tgt.id) { const r = route(S, here, S.def.home); if (r && r.length > 1 && !S.squads.some(p => p.side === 'player' && p.at === here && !p.worn)) q.path = r.slice(1); return; }
    const r = route(S, here, tgt.id); if (r) q.path = r.slice(1); return;
  }
  if (q.wave) {
    const here = q.at; if (!here) return;
    const held = q.wave.find(id => S.node(id).owner === 'player');
    const goal = held || q.wave[q.wave.length - 1];
    if (here === goal) { if (goal !== S.def.home) { const r = route(S, here, S.def.home); if (r && r.length > 1) q.path = r.slice(1); } return; }
    const r = route(S, here, goal); if (r) q.path = r.slice(1);
  }
}

// hidden (cover) check, for drawing and targeting
export function hidden(S, q) {
  if (q.worn) return false;
  if (S.buffs.moonlight > 0 && q.side === 'enemy') return false;
  const cover = q.at ? (S.def.cover || {})[q.at] : q.edge ? (S.def.coverPaths || []).some(([a, b]) => (q.edge[0] === a && q.edge[1] === b) || (q.edge[0] === b && q.edge[1] === a)) : false;
  const always = q.perk === 'hidden';
  if (!cover && !always) return false;
  if (q.kind === 'wing' && !always) return false;
  const near = q.perk === 'deep-cover' ? 1 : 3;
  for (const o of S.squads) {
    if (o.side === q.side || o.worn) continue;
    const r = o.reveal ? 6 : near;
    if (dist(o, q) <= r) return false;
    if (always && q.contact) return false;
  }
  return true;
}

// headless auto-player for the Lookout odds: every squad heads for the nearest node it doesn't hold
export function autoPlay(S) {
  for (const q of S.squads) {
    if (q.side !== 'player' || q.worn || q.contact) continue;
    if (q.path && q.path.length) continue;
    const here = q.at; if (!here) continue;
    let best = null, bl = 1e9;
    for (const n of S.nodes) {
      if (n.owner === 'player' || n.dark) continue;
      const r = route(S, here, n.id); if (!r) continue;
      const L = pathLen(S, r); if (L < bl) { bl = L; best = r; }
    }
    if (best && best.length > 1) { q.path = best.slice(1); q.goal = best[best.length - 1]; }
  }
}
export function oddsOf(def, army, o = {}) {
  const S = makeSim(JSON.parse(JSON.stringify(def)), army, o);
  for (let i = 0; i < 4000 && !S.result; i++) { if (i % 10 === 0) autoPlay(S); step(S); }
  if (S.result !== 'win') return { odds: 'Weak', S };
  const left = S.squads.filter(q => q.side === 'player').reduce((a, q) => a + q.hp, 0) / S.squads.filter(q => q.side === 'player').reduce((a, q) => a + q.maxHp, 0);
  return { odds: left < 0.4 ? 'Even' : 'Strong', left, S };
}
