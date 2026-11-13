// Shared headless battle runner for battle-check.mjs and balance.mjs.
import { BattleSim, makeEnemy, makeAlly } from '../game/src/battle/sim.js';
import { PARTY, SKILLS } from '../game/src/data/core/party.js';
import { ITEMS } from '../game/src/data/core/items.js';
import { BOSSES } from '../game/src/data/core/enemies.js';
import { ngEnemies } from '../game/src/battle/ngplus.js';
import { tellerOf } from '../game/src/data/ng/bosses.js';
// New Game+: the main-path memories a finished run has for the Eye (ch5/memories.js MAIN_MEMORIES)
export const NG_MEMORIES = ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies', 'mem-mushrooms'];
// NG+ Tell a Story: one memory a round, each once (all again when they run out). counter: the memory this teller was
// there for; past half, if nobody in the three can tell a remaining memory right, swap in a reserve who can.
function ngStory(sim, u, counter) {
  const used = sim._used || (sim._used = new Set());
  let left = NG_MEMORIES.filter(m => !used.has(m)); if (!left.length) { used.clear(); left = NG_MEMORIES.slice(); }
  let m = left[0];
  if (counter) {
    const mine = left.find(x => tellerOf(sim, x) === u.id);
    if (mine) m = mine;
    else if (sim.phase2) {
      const party = sim.party.filter(p => !p.ko && !p.out);
      const anyRight = left.some(x => party.some(p => p.id === tellerOf(sim, x)));
      if (!anyRight && u.id !== 'bramble') { const r = sim.reserves.find(x => !x.ko && left.some(y => tellerOf(sim, y) === x.id)); if (r) return sim.act(u, { k: 'swap', reserve: r }); }
      if (anyRight) return sim.act(u, { k: 'guard' });   // let the friend who was there tell it this round
    }
  }
  used.add(m); sim.useSkill(u, 'tell-a-story', m); sim.after([]);
}
// NG+ second-phase counters (data/ng/bosses.js counter2); tools/play.js decide() mirrors them. pre: before the usual
// Guard / Shield reflexes; post: where the policy picks what to hit. Return an action, or undefined to go on.
function counter2Pre(sim, u, c2, x) {
  const { foes, act, has, hits } = x;
  if (c2 === 'guard-named' && (u.buffs.marked)) { const hide = has(S => S.k === 'buff' && (S.buff === 'hidden' || S.buff === 'hidden-strike') && S.t === 'self'); if (hide) return act({ k: 'skill', skill: hide[0] }); }
  if (c2 === 'all-hit-eyes' && sim.ngs.seen) return act({ k: 'guard' });
  if (c2 === 'light-aoe' && sim.ngs.forget) return act({ k: 'guard' });   // "Come and forget" lands next round: brace
  if (c2 === 'light-dims' && sim.ngs.dust && !has(S => S.k === 'hit' && (S.tags || []).includes('Light'))) return act({ k: 'guard' });   // Moon-dust is coming: brace   // SEEN is coming: look away
  if (c2 === 'hit-eyes') {
    const eyes = foes.filter(e => e.ngEye);
    if (eyes.length) { const aoe = hits.find(([, S]) => S.t === 'enemies'); if (aoe && eyes.length >= 2) return act({ k: 'skill', skill: aoe[0] }); const one = hits.filter(([, S]) => S.t === 'enemy').sort((a, b) => b[1].pw - a[1].pw)[0]; const t = eyes.sort((a, b) => a.hp - b.hp)[0]; return act(one ? { k: 'skill', skill: one[0], target: t.uid } : { k: 'tussle', target: t.uid }); }
  }
}
function counter2Post(sim, u, c2, x) {
  const { foes, act, has, hits, boss } = x;
  const single = (t) => { const one = hits.filter(([, S]) => S.t === 'enemy').sort((a, b) => (b[1].pw === 'rand' ? 1.6 : b[1].pw) * (b[1].hits || 1) - (a[1].pw === 'rand' ? 1.6 : a[1].pw) * (a[1].hits || 1))[0]; return act(one ? { k: 'skill', skill: one[0], target: t.uid } : { k: 'tussle', target: t.uid }); };
  const aoe = hits.filter(([, S]) => S.t === 'enemies').sort((a, b) => b[1].pw - a[1].pw)[0];
  if (c2 === 'aoe-then-boss') { const lads = foes.filter(e => !e.boss); if (lads.length >= 2 && aoe && u.pl >= aoe[1].pl) return act({ k: 'skill', skill: aoe[0] }); if (boss && boss.buffs.shielded && lads.length) return single(lads.sort((a, b) => a.hp - b.hp)[0]); }
  if (c2 === 'aoe-glowing') { if (foes.filter(e => e.ms.glow && !e.ms.silenced).length >= 2 && aoe && u.pl >= aoe[1].pl) return act({ k: 'skill', skill: aoe[0] }); }
  if (c2 === 'focus-verse' && sim.ngs.verse > 0 && boss && sim.targetable(boss)) return single(boss);
  if (c2 === 'light-dims' && boss && sim.targetable(boss) && (sim.ngs.glow || 0) >= 2) { const l = has(S => S.k === 'hit' && (S.tags || []).includes('Light')); if (l) return act({ k: 'skill', skill: l[0], target: boss.uid }); }
  if (c2 === 'afraid-unroots' && boss && sim.ngs.rooted && !boss.statuses.afraid) { const f = has(S => S.k === 'status' && S.status === 'afraid' && (S.t === 'enemy' || S.t === 'enemies')); if (f) return act({ k: 'skill', skill: f[0], target: boss.uid }); }
  if (c2 === 'dig-backfill' && boss && sim.targetable(boss) && (sim.ngs.hole || 0) >= 2) { const d = has(S => S.k === 'hit' && (S.tags || []).includes('Dig')); if (d) return act({ k: 'skill', skill: d[0], target: boss.uid }); }
  if (c2 === 'light-aoe' && foes.filter(e => e.id === 'hollow-rabbits').length === 2) { const l = has(S => S.k === 'hit' && (S.tags || []).includes('Light')); const t = foes.slice().sort((a, b) => a.hp - b.hp)[0]; if (l) return act({ k: 'skill', skill: l[0], target: t.uid }); return single(t); }
  if (c2 === 'rescue-hole') { const h = foes.find(e => e.id === 'dream-hole'); if (h) return act({ k: 'tussle', target: h.uid }); }
  if (c2 === 'thump-drone' && u.id === 'bramble' && boss && sim.targetable(boss) && sim.ngs.drone) { const t = has(S => S.name === 'Thump'); if (t) return act({ k: 'skill', skill: t[0], target: boss.uid }); }
}
globalThis.location = undefined;
export async function loadData() {
  const D = { encounters: {}, rts: {}, segments: [] };
  for (const ch of ['ch0', 'ch1', 'ch1w', 'ch2', 'ch3', 'ch4', 'ch5']) {
    try { const m = (await import(`../game/src/data/${ch}/index.js`)).default; for (const [k, v] of Object.entries(m.encounters || {})) D.encounters[k] = { ...v, ch }; Object.assign(D.rts, m.rts || {}); D.segments.push(...(m.segments || [])); }
    catch (e) { if (!String(e).includes('Cannot find')) console.error(ch, e.message); }
  }
  return D;
}
const statAt = (b, L) => Math.round(b * (1 + 0.1 * (L - 1)));
// gear: tier t on everyone (tool + coat + charm) like the shops of that chapter would give
export function ally(id, L, uid, t = 0) {
  const P = PARTY[id];
  const s = { hp: statAt(P.hp, L) + 6 * t + t, pl: statAt(P.pl, L), str: statAt(P.str, L) + (P.str >= P.wit ? 3 * t : 0), tgh: statAt(P.tgh, L) + 2 * t, spd: statAt(P.spd, L), wit: statAt(P.wit, L) + (P.wit > P.str ? 3 * t : 0) };
  const n = L >= 20 ? 5 : L >= 10 ? 4 : 3;
  return makeAlly({ id, name: P.name, lvl: L, hp: s.hp, pl: s.pl, stats: s, skills: P.skills.slice(0, n) }, uid);
}
// Party AI. plain (the design's "plain AI"): heal one below 40% Heart, else the strongest affordable attack skill
// (hit-all when 3+ foes stand), else Tussle; always at the weakest enemy (greedy; no Guard, no items, no cures,
// no reading of the boss's mechanic). counter: the boss's counter policy (data/core/enemies.js BOSSES[..].counter) on top of a sensible
// AI (lowest-Heart target, hit-all at 2+ foes, Light vs Eerie, revive, items when no healer can act).
function partyAct(sim, u, enc, plain) {
  const foes = sim.enemies.filter(e => sim.targetable(e));
  // tussle: the button-masher (Tussle every turn at the first enemy still standing: the menu's default target)
  if (plain === 'tussle') { if (enc.dream && sim.storyUsedRound !== sim.round) { if (sim.ng2 && sim.ng2.story) return ngStory(sim, u, false); sim.useSkill(u, 'tell-a-story', 'm'); sim.after([]); return; } return sim.act(u, { k: 'tussle', target: foes[0] && foes[0].uid }); }
  const sk = u.skills.map(id => [id, SKILLS[id]]).filter(([, S]) => S && S.pl <= u.pl);
  const has = f => sk.find(([, S]) => f(S));
  const act = c => sim.act(u, c);
  if (enc.dream && sim.storyUsedRound !== sim.round) { if (sim.ng2 && sim.ng2.story) return ngStory(sim, u, !plain); sim.useSkill(u, 'tell-a-story', 'm'); sim.after([]); return; }
  const party = sim.party.filter(p => !p.ko && !p.out);
  const low = party.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  const heal = has(S => S.k === 'heal');
  const hits = sk.filter(([, S]) => S.k === 'hit');
  const pw = S => (S.pw === 'rand' ? 1.6 : S.pw) * (S.hits || 1);
  if (plain) {
    if (low && low.hp / low.maxHp < 0.4 && heal) return act({ k: 'skill', skill: heal[0], target: low.uid });
    const tgt = foes.slice().sort((a, b) => a.hp - b.hp)[0];
    const aoe = hits.filter(([, S]) => S.t === 'enemies').sort((a, b) => pw(b[1]) - pw(a[1]))[0];
    const one = hits.filter(([, S]) => S.t === 'enemy').sort((a, b) => pw(b[1]) - pw(a[1]))[0];
    if (aoe && foes.length >= 3) return act({ k: 'skill', skill: aoe[0] });
    if (one && tgt) return act({ k: 'skill', skill: one[0], target: tgt.uid });
    return act({ k: 'tussle', target: tgt && tgt.uid });
  }
  const boss = sim.enemies.find(e => e.boss && !e.ko) || sim.enemies.find(e => e.boss);
  const ctr = boss ? (BOSSES[boss.id] || {}).counter : null;
  const r = sim.round;
  const c2 = sim.phase2 && sim.ng2 ? sim.ng2.counter2 : null, cx = { foes, act, has, hits, boss };
  if (c2) { const a = counter2Pre(sim, u, c2, cx); if (a !== undefined) return a; }
  // a big hit lands this round: Shielded if nobody has it, else Guard
  const shield = has(S => S.k === 'buff' && S.buff === 'shielded' && S.t === 'allies');
  const shielded = party.every(p => p.buffs.shielded);
  const bigNow = foes.some(e => (e.ms.charge === 2 && e.mech === 'off-with') || e.ms.strike) || (ctr === 'shield-before' && r % 3 === 0) || foes.some(e => e.mech === 'watcher' && e.ms.eyes >= 6);
  const bigNext = (ctr === 'shield-before' && r % 3 === 2) || ctr === 'shield-guard';   // a fast two-action boss: keep the party Shielded
  if ((bigNow || bigNext) && !shielded && shield) return act({ k: 'skill', skill: shield[0] });
  if (bigNow && !shielded && !(foes.some(e => e.mech === 'watcher') && foes.some(e => e.ms.eyes > 0))) return act({ k: 'guard' });
  // an ordinary foe's wind-up names this member (or everyone): Guard it (the "(Guard!)" line; sim.js windup)
  if (u.buffs.marked || u.buffs['marked-all']) return act({ k: 'guard' });
  const witch = foes.find(e => e.mech === 'witch'); if (witch && sim.items['water-pail'] > 0 && !(sim.phase2 && sim.ngs.umbrella)) return act({ k: 'item', item: 'water-pail', target: witch.uid });
  // bring the counter in: a Hummed cure vs a Hum boss (Ninefold Welcome): a non-healer without it swaps itself out for a
  // reserve who has it. (Not done for Light hit-all vs the Hollow Rabbits: Caterpillar waits ungeared in reserve and is
  // knocked out in a round; design/progress/bosses.md.)
  const want = ctr === 'cure' ? S => S.k === 'cure' || (S.cure && S.t !== 'self' && (S.cure.includes('all') || S.cure.includes('hummed'))) : null;
  const can = x => x.skills.some(k => SKILLS[k] && want(SKILLS[k]));
  if (want && u.id !== 'bramble' && !party.some(can) && !u.skills.some(k => SKILLS[k] && SKILLS[k].k === 'heal')) {
    const r = sim.reserves.find(x => !x.ko && can(x)); if (r) return act({ k: 'swap', reserve: r });
  }
  const ko = sim.party.find(p => p.ko); const rev = has(S => S.k === 'revive'); if (ko && rev) return act({ k: 'skill', skill: rev[0], target: ko.uid });
  // cure a Hummed / Asleep friend (or an Afraid hitter) with a skill that really cures that status (Brave Heart only cures Afraid)
  const ill = p => ['hummed', 'asleep', ...(p.str >= p.wit ? ['afraid'] : [])].filter(k => p.statuses[k]);
  const cures = (S, ks) => S.k === 'cure' || (S.cure && S.t !== 'self' && (S.cure.includes('all') || ks.some(k => S.cure.includes(k))));
  const sick = party.find(p => ill(p).length && has(S => cures(S, ill(p)))); const cure = sick && has(S => cures(S, ill(sick)));
  if (sick && cure) return act({ k: 'skill', skill: cure[0], target: sick.uid });
  const healAt = ctr === 'no-guard-on-charge' ? 0.55 : 0.4;
  if (low && low.hp / low.maxHp < healAt && heal) return act({ k: 'skill', skill: heal[0], target: low.uid });
  if (low && low.hp / low.maxHp < 0.3 && !party.some(p => p !== u && SKILLS && p.skills.some(k => SKILLS[k] && SKILLS[k].k === 'heal' && SKILLS[k].pl <= p.pl))) {
    const it = ['dandelion', 'clover-bunch'].find(k => sim.items[k] > 0); if (it) return act({ k: 'item', item: it, target: low.uid });
  }
  // Afraid / status on a fast boss (Tansy), keep the last moth alive (Moth Queen)
  if (ctr === 'shield-guard' && boss && !boss.statuses.afraid) { const fr = has(S => S.k === 'status' && S.status === 'afraid' && S.t === 'enemy'); if (fr) return act({ k: 'skill', skill: fr[0], target: boss.uid }); }
  if (c2) { const a = counter2Post(sim, u, c2, cx); if (a !== undefined) return a; }
  let tgt = foes.find(e => e.ms.glow) || foes.find(e => e.ms.eyes > 0) || foes.slice().sort((a, b) => a.hp - b.hp)[0];
  if ((ctr === 'aoe-on-summon' || ctr === 'swap' || ctr === 'guard-submerged') && boss && sim.targetable(boss)) tgt = boss;
  if (ctr === 'light' && boss && foes.filter(e => !e.boss).length <= 1 && sim.targetable(boss)) tgt = boss;
  const light = foes.some(e => e.eerie);
  const lt = S => light && (S.tags || []).includes('Light') ? 1.5 : 1;
  const aoe = hits.filter(([, S]) => S.t === 'enemies').sort((a, b) => pw(b[1]) * lt(b[1]) - pw(a[1]) * lt(a[1]))[0];
  const one = hits.filter(([, S]) => S.t === 'enemy').sort((a, b) => pw(b[1]) * lt(b[1]) - pw(a[1]) * lt(a[1]))[0];
  const focus = foes.some(e => e.ms.glow || e.ms.eyes > 0);
  const unsp = has(S => S.humBonus && S.t === 'enemies'); if (unsp && foes.filter(e => e.hum).length >= 2 && u.pl >= unsp[1].pl + 2) return act({ k: 'skill', skill: unsp[0] });   // Ninefold vs the Hum-taken
  if (aoe && !focus && foes.length >= 2 && u.pl >= aoe[1].pl + 2) return act({ k: 'skill', skill: aoe[0] });
  if (one && tgt) return act({ k: 'skill', skill: one[0], target: tgt.uid });
  return act({ k: 'tussle', target: tgt && tgt.uid });
}
// enemy turn with hit bookkeeping: biggest single hit on a party member (% of that member's max Heart)
function enemyTurn(sim, u, M) {
  const ev = sim.enemyAct(u) || [];
  for (const e of ev) if (e.t === 'hit') { const t = sim.unit(e.tg); if (t && t.side === 'party') { const f = e.dmg / t.maxHp; if (e.heavy) { if (f > (M.maxHeavy || 0)) M.maxHeavy = f; } else if (f > M.maxHit) M.maxHit = f; } }
}
const partyHp = sim => sim.party.reduce((a, p) => a + Math.max(0, p.hp), 0);
const partyMax = sim => sim.party.reduce((a, p) => a + p.maxHp, 0);
// o: { seeds, plain (true | 'tussle'), gear (tier), hpF / plF: Heart and Pluck fractions the party arrives with, items: battle items }
export function runEncounter(encId, enc, members, o = {}) {
  const seeds = o.seeds || 30, plain = o.plain === 'tussle' ? 'tussle' : !!o.plain, tier = o.gear || 0;
  let wins = 0, phased = 0; const rounds = [], left = [], xps = [], btns = [], lost = [], spikes = [], heavies = [];
  for (let k = 0; k < seeds; k++) {
    const party = members.slice(0, 3).map(([id, L], i) => ally(id, L, i + 1, tier));
    const reserves = members.slice(3).map(([id, L], i) => ally(id, L, 10 + i, tier));
    if (o.ng && o.ng.lockLT) for (const p of [...party, ...reserves]) p.skills = p.skills.filter(x => x !== 'long-thump');   // NG+: the Long Thump comes back after Chapter 4
    for (const p of party) { p.hp = Math.round(p.maxHp * (o.hpF || 1)); p.pl = Math.round(p.maxPl * (o.plF || 1)); }   // arrival state (a boss with no rest stone before it)
    const ngr = o.ng ? ngEnemies(encId, enc, o.ng.party) : null;
    const sim = new BattleSim(party, ngr ? ngr.enemies : enc.enemies.map((e, i) => makeEnemy(e, 50 + i)), { seed: encId + '#' + k, items: o.items || { 'water-pail': 3, dandelion: 2, 'clover-bunch': 2 }, itemDefs: ITEMS, reserves, flee: 'never', dream: !!enc.dream, onRound: enc.onRound ? (s) => { try { return enc.onRound(s, { s: { flags: {} } }); } catch (e) { return []; } } : null,
      ...(ngr ? { ng2: o.ng.phase === false ? null : ngr.ng2, lvlShift: ngr.shift } : {}) });
    if (enc.tweak && !ngr) enc.tweak(sim.enemies);
    for (const e of sim.enemies) if (e.boss) { if (o.bossHp) e.maxHp = e.hp = Math.round(e.maxHp * o.bossHp); if (o.bossAtk) { e.str = Math.round(e.str * o.bossAtk); e.wit = Math.round(e.wit * o.bossAtk); } }
    let n = 0; const M = { maxHit: 0 }; const hp0 = partyHp(sim);
    while (!sim.result && n < 40) {
      sim.startRound(); let u;
      while (!sim.result && (u = sim.nextActor())) {
        if (u.side !== 'party') { enemyTurn(sim, u, M); continue; }
        partyAct(sim, u, enc, plain);
      }
      n++;
    }
    if (sim.phase2) phased++;
    lost.push((hp0 - partyHp(sim)) / partyMax(sim)); spikes.push(M.maxHit); heavies.push(M.maxHeavy || 0);
    if (sim.result === 'win') { wins++; rounds.push(sim.round); xps.push(sim.enemies.reduce((a, e) => a + (e.xp || 0), 0) + (enc.xp || 0)); btns.push(sim.enemies.reduce((a, e) => a + (e.drops || 0), 0) + (enc.buttons || 0)); left.push(sim.party.reduce((a, p) => a + p.hp, 0) / sim.party.reduce((a, p) => a + p.maxHp, 0)); }
  }
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  return { wins, seeds, avgRounds: +avg(rounds).toFixed(1), minRounds: rounds.length ? Math.min(...rounds) : 0, maxRounds: rounds.length ? Math.max(...rounds) : 0, heartLeft: Math.round(avg(left) * 100), heartLost: Math.round(avg(lost) * 100), maxHit: Math.round(Math.max(0, ...spikes) * 100), maxHeavy: Math.round(Math.max(0, ...heavies) * 100), avgMaxHit: Math.round(avg(spikes) * 100), xp: Math.round(avg(xps)), buttons: Math.round(avg(btns)), phased };
}
// Whole-dungeon run (design: "all its fights in order, Pluck carried over, the 30% restore after each win, no rest
// until the rest stone"): Heart and Pluck carry from fight to fight (a member who went down comes back at 1 Heart, as in
// the game). Returns per-fight rounds and how often the party started a fight unable to afford any skill.
export function runDungeon(list, D, members, o = {}) {
  const seeds = o.seeds || 6, tier = o.gear || 0, mode = o.mode === 'tussle' ? 'tussle' : o.mode === 'plain' ? true : false;
  const out = { fights: list.map(id => ({ id, rounds: [], broke: 0, lost: 0, hpLost: [], maxHit: 0, maxHeavy: 0 })), brokeRuns: 0, losses: 0 };
  for (let k = 0; k < seeds; k++) {
    const party = members.slice(0, 3).map(([id, L], i) => ally(id, L, i + 1, tier));
    let brokeRow = 0, worst = 0;
    list.forEach((encId, fi) => {
      const enc = D.encounters[encId]; const F = out.fights[fi];
      for (const p of party) { p.ko = p.hp <= 0; if (p.ko) p.hp = 1, p.ko = false; p.statuses = {}; p.buffs = {}; p.out = false; delete p.guard; }
      const canSkill = party.filter(p => p.skills.some(s => SKILLS[s] && SKILLS[s].k === 'hit' && SKILLS[s].pl <= p.pl)).length;
      if (canSkill === 0) { F.broke++; brokeRow++; worst = Math.max(worst, brokeRow); } else brokeRow = 0;
      const ngr = o.ng ? ngEnemies(encId, enc, o.ng.party) : null;
      const sim = new BattleSim(party, ngr ? ngr.enemies : enc.enemies.map((e, i) => makeEnemy(e, 50 + i)), { seed: encId + '@' + k, items: {}, itemDefs: ITEMS, reserves: [], flee: 'never', onRound: enc.onRound ? (s) => { try { return enc.onRound(s, { s: { flags: {} } }); } catch (e) { return []; } } : null });
      if (enc.tweak && !ngr) enc.tweak(sim.enemies);
      let n = 0; const M = { maxHit: 0 }; const hp0 = partyHp(sim);
      while (!sim.result && n < 40) { sim.startRound(); let u; while (!sim.result && (u = sim.nextActor())) { if (u.side !== 'party') enemyTurn(sim, u, M); else partyAct(sim, u, enc, mode); } n++; }
      F.hpLost.push((hp0 - partyHp(sim)) / partyMax(sim)); F.maxHit = Math.max(F.maxHit, M.maxHit); F.maxHeavy = Math.max(F.maxHeavy, M.maxHeavy || 0);
      if (sim.result === 'win') { F.rounds.push(sim.round); for (const p of party) p.pl = Math.min(p.maxPl, p.pl + Math.ceil(p.maxPl * 0.3)); }
      else { F.lost++; out.losses++; for (const p of party) { p.hp = p.maxHp; p.pl = p.maxPl; } }   // a loss: back at the last door, full Heart
    });
    if (worst > 1) out.brokeRuns++;
  }
  for (const F of out.fights) { F.avg = F.rounds.length ? +(F.rounds.reduce((a, b) => a + b, 0) / F.rounds.length).toFixed(1) : 0; F.lostPct = Math.round(100 * F.hpLost.reduce((a, b) => a + b, 0) / F.hpLost.length); }
  return out;
}
