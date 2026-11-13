// Post-game army revisit par times: node tools/rts-par.mjs [--gear 2] [--easy]
// For each story army battle, with the post-game army (every non-optional squad, the game's defaultArmy pick, rank 1.48):
//   R = "Burdock's time": a rush bot (every squad but the first straight to the goal nodes, re-ordered each second)
//   A = the Lookout odds auto-player (autoPlay)
//   P = the best of a seeded plan search (random armies under the cap, every squad to a random goal node, Rally or not):
//       proof that a time is reachable by orders alone
// Medals (seconds): burdock = R, gold = max(0.9 R, P) rounded up to 0.5 s (beatable, and provably reachable),
// silver = A, bronze = 1.5 A (both rounded up to 5 s).
// Paste the printed `medals` objects into each battle's def (data/ch*/rts.js, ch2/battles.js).
import { makeSim, step, order, autoPlay, addSquad, useAbility } from '../game/src/rts/sim.js';
import { KINDS, SQUADS } from '../game/src/data/core/squads.js';
globalThis.location = undefined;
const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const G = +(opt('--gear') || 2), easy = a.includes('--easy');
const R = {};
for (const ch of ['ch1', 'ch2', 'ch3', 'ch4', 'ch5']) { try { Object.assign(R, (await import(`../game/src/data/${ch}/index.js`)).default.rts || {}); } catch (e) { if (!String(e).includes('Cannot find')) console.error(ch, e.message); } }
const L = ['A', 'S', 'D', 'G', 'H', 'J', 'K', 'L', 'Z', 'X'];
const owned = Object.keys(SQUADS).filter(q => !SQUADS[q].free && !SQUADS[q].optional);
const BRAMBLE = 'thimblebank-rabbits';
// the same pick as rts.js defaultArmy
function defaultArmy(d) {
  const strength = q => { const S = SQUADS[q], K = KINDS[S.kind]; return K.hp * S.m[0] + K.atk * S.m[1] * 8; };
  const req = (d.required || []).filter(q => owned.includes(q));
  const rest = owned.filter(q => !req.includes(q)).sort((x, y) => strength(y) - strength(x));
  const army = [...req, ...rest].slice(0, d.cap);
  if (!army.includes(BRAMBLE)) { if (army.length >= d.cap) army.pop(); army.push(BRAMBLE); }
  return army;
}
function defOf(d) {
  const def = JSON.parse(JSON.stringify({ ...d, prompts: undefined }));
  def.nodes.forEach((n, i) => { n.letter = n.letter || L[i]; });
  def.paths = def.paths.map(([x, y, len]) => { const A = def.nodes.find(n => n.id === x), B = def.nodes.find(n => n.id === y); return [x, y, len || Math.abs(A.x - B.x) + Math.abs(A.y - B.y)]; });
  return def;
}
function sim(d, army) {
  const gear = {}; for (const k of ['stout', 'swift', 'wing', 'eerie']) gear[k] = { banner: G, mail: G, rations: G };
  const S = makeSim(defOf(d), army, { rank: 1.48, gear, easy });
  if (d.thump) addSquad(S, 'player', 'deepdelve-echoes', d.home);   // free, beyond the cap, as the game's onStart does
  return S;
}
const up5 = x => Math.ceil(x / 5) * 5, upHalf = x => Math.ceil(x * 2 - 1e-9) / 2;
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function search(d, trials = 600) {
  let best = 1e9;
  const goalsOf = S => d.thump ? S.nodes.filter(n => n.kind === 'thump').map(n => n.id) : (d.hold || [d.mouth]);
  for (let t = 0; t < trials; t++) {
    const army = owned.slice().sort(() => rnd() - 0.5).slice(0, d.cap), rally = rnd() < 0.5;
    const S = sim(d, army); S.abilities = ['rally'];
    const goals = goalsOf(S), mine = S.squads.filter(q => q.side === 'player'), asg = mine.map(() => goals[Math.floor(rnd() * goals.length)]);
    for (let i = 0; i < 3000 && !S.result && S.tick / 10 < best; i++) {
      if (i % 5 === 0) mine.forEach((q, k) => { if (q.worn || q.contact) return; if (q.at !== asg[k] && !(q.path && q.path.length)) order(S, q, asg[k]); });
      if (rally && !S.buffs.rally && S.supply >= 25 && mine.some(q => q.contact)) useAbility(S, 'rally');
      step(S);
    }
    if (S.result === 'win') best = Math.min(best, S.tick / 10);
  }
  return best < 1e9 ? best : null;
}
const out = {};
for (const id of ['c1-rts1', 'c2-rts2', 'c3-rts3', 'c4-rts4', 'c5-rts5']) {
  const d = R[id]; if (!d) continue;
  const army = defaultArmy(d);
  // rush
  let S = sim(d, army);
  const goals = d.thump ? S.nodes.filter(n => n.kind === 'thump').map(n => n.id) : (d.hold || [d.mouth]);
  const mine = S.squads.filter(q => q.side === 'player');
  for (let i = 0; i < 6000 && !S.result; i++) {
    if (i % 10 === 0) mine.forEach((q, k) => { if (k === 0 || q.worn || q.contact) return; const g = goals[k % goals.length]; if (q.at !== g && !(q.path && q.path.length)) order(S, q, g); });
    step(S);
  }
  const rush = S.result === 'win' ? S.tick / 10 : null;
  // auto
  S = sim(d, army);
  for (let i = 0; i < 6000 && !S.result; i++) { if (i % 10 === 0) autoPlay(S); step(S); }
  const auto = S.result === 'win' ? S.tick / 10 : null;
  const plan = search(d);
  const medals = rush && auto ? { burdock: rush, gold: upHalf(Math.max(rush * 0.9, plan || 0)), silver: up5(auto), bronze: up5(auto * 1.5) } : null;
  out[id] = { army, rush, auto, plan, medals };
  console.log(id, JSON.stringify({ rush, auto, plan }), 'medals:', JSON.stringify(medals));
}
