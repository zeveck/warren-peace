// Whole-game level and button curve: plays every visible map enemy (once) and every scripted battle in play order,
// gives the XP of each won fight to the party (everyone gets full XP) and reports the party level on arrival at each
// boss and at each segment start, against the design's targets. Also sums each chapter's button income
// (fight drops, chests, scripted gifts) against what the design assumes is bought.
// Run: node tools/curve.mjs [--frac 0.8] [--opt 0.2] [--no-catchup]  (--frac: the 'all' model's share of visible map
// fights, default 0.9; --opt: the 'real' model's share of off-route enemies, default 0.2; XP uses the game's catch-up)
//
// Three player models side by side:
//   all  = the old model: every visible map enemy x FRAC (0.9), once
//   full = full clear: every visible map enemy, once (the most XP a non-grinding player gets)
//   real = the main path: enemies standing on or next to the route the full playthrough walked (within R_MEET tiles of
//          design/solutions/fullrun/route.json, made by tools/route.mjs; an enemy's patrol loop counts) are fought,
//          plus OPT (20%) of the others; chests within R_CHEST of the route are opened, plus OPT of the others.
//          (R_MEET = 1, i.e. on or next to the route: with the old XP numbers this model reproduced the full playthrough's
//          levels at each boss within ~1, slightly above: the run took a few fewer optional fights.)
//          Buttons are tracked against the gear each segment assumes (new pieces of a segment's gear set are
//          bought before it starts), so 'spare' < 0 means that segment's start gear is not affordable on the main path.
// Checks (real): boss arrival within [boss L - 1.5, boss L + 0.25]; segment party level within 1 of the curve;
// full clear at most boss L + 1 (target + 2); spare >= 0 at every segment start.
import { readFileSync, readdirSync } from 'node:fs';
import { loadData, runEncounter } from './lib-battle.mjs';
import { xpNext, makeEnemy } from '../game/src/battle/sim.js';
import { xpCatchUp } from '../game/src/state.js';
import { gearPrice, armyGearPrice } from '../game/src/data/core/items.js';
globalThis.location = undefined;
const argv = process.argv.slice(2);
const arg = k => argv.includes(k) ? +argv[argv.indexOf(k) + 1] : 0;
const FRAC = arg('--frac') || 0.9, OPT = arg('--opt') || 0.2, R_MEET = arg('--r') || 1, R_CHEST = 4;
const ROUTE = JSON.parse(readFileSync(new URL('../design/solutions/fullrun/route.json', import.meta.url), 'utf8'));
const D = await loadData();
const { loadData: loadGame } = await import('../game/src/data/index.js');
const G = await loadGame();
// play order: [chapter key, step] where a step is a map id (its visible enemies), 'battle:<encounter>' (scripted),
// or 'seg:<segment id>' (a segment starts here)
const PLAY = [
  ['ch0', 'seg:c0-surface'], ['ch0', 'seg:c0-warren'], ['ch0', 'seg:c0-attack'], ['ch0', 'c0-warren'], ['ch0', 'battle:c0.first-fight'], ['ch0', 'c0-downs'],
  ['ch1', 'seg:c1-depths'], ['ch1', 'c1-depths'], ['ch1', 'seg:c1-riverbank'], ['ch1', 'c1-riverbank'], ['ch1', 'c1-wildwood'], ['ch1', 'c1-buried-city'],
  ['ch1', 'seg:c1-toadhall'], ['ch1', 'c1-road'], ['ch1', 'c1-toadhall-in'], ['ch1', 'battle:c1.chief-weasel'],
  ['ch1w', 'seg:c1w-wonder-a'], ['ch1w', 'c1w-hall'], ['ch1w', 'c1w-pool'], ['ch1w', 'c1w-lane'], ['ch1w', 'seg:c1w-wonder-b'], ['ch1w', 'c1w-wood'], ['ch1w', 'c1w-duchess'],
  ['ch1w', 'c1w-tea'], ['ch1w', 'c1w-garden'], ['ch1w', 'battle:c1w.croquet'],
  ['ch1w', 'seg:c1w-shallows'], ['ch1w', 'c1w-shallows'], ['ch1w', 'c1w-deep'], ['ch1w', 'battle:c1w.choir'],
  ['ch1', 'seg:c1-rts1'], ['ch1', 'seg:c1-greatburrow'], ['ch1', 'battle:c1.great-burrow'],
  ['ch2', 'seg:c2-rts2'], ['ch2', 'seg:c2-aster'], ['ch2', 'c2-silverdown'], ['ch2', 'battle:c2.aster'],
  ['ch2', 'seg:c2-moon-a'], ['ch2', 'c2-silverdown-warren'], ['ch2', 'c2-depths'], ['ch2', 'c2-moon'], ['ch2', 'seg:c2-moon-b'], ['ch2', 'c2-moon-palace'], ['ch2', 'c2-moon-craters'],
  ['ch2', 'c2-moon-grove'], ['ch2', 'battle:c2.moth-queen'],
  ['ch2', 'seg:c2-drowned'], ['ch2', 'c2-drowned'], ['ch2', 'battle:c2.tansy'], ['ch2', 'c2-drowned-pool'], ['ch2', 'battle:c2.tidewarden'],
  ['ch3', 'seg:c3-rts3'], ['ch3', 'seg:c3-barley'], ['ch3', 'c3-wheatsheaf'], ['ch3', 'c3-wheatsheaf-warren'], ['ch3', 'battle:c3.barley'],
  ['ch3', 'seg:c3-oz-a'], ['ch3', 'c3-munchkin'], ['ch3', 'c3-forest'], ['ch3', 'battle:c3.kalidah-chase'], ['ch3', 'c3-river'], ['ch3', 'battle:c3.wildcat'], ['ch3', 'c3-poppies'], ['ch3', 'c3-emerald'],
  ['ch3', 'seg:c3-oz-b'], ['ch3', 'c3-winkie'], ['ch3', 'battle:c3.witch'], ['ch3', 'seg:c3-china'], ['ch3', 'c3-south'],
  ['ch3', 'seg:c3-stair'], ['ch3', 'c3-stair'], ['ch3', 'battle:c3.watcher'],
  ['ch4', 'seg:c4-rts4'], ['ch4', 'seg:c4-quarry'], ['ch4', 'c4-flintcomb'], ['ch4', 'c4-warren'], ['ch4', 'battle:c4.quarry'],
  ['ch4', 'seg:c4-hole'], ['ch4', 'c4-tubes'], ['ch4', 'c4-sea'], ['ch4', 'battle:c4.storm'], ['ch4', 'seg:c4-herd'], ['ch4', 'c4-mushrooms'], ['ch4', 'c4-field'],
  ['ch4', 'seg:c4-root'], ['ch4', 'c4-root'], ['ch4', 'c4-deepdelve'], ['ch4', 'battle:c4.hollow'],
  ['ch5', 'seg:c5-rts5'], ['ch5', 'seg:c5-dream'], ['ch5', 'battle:c5.nightmare-deepdelve'], ['ch5', 'battle:c5.nightmare-flintcomb'], ['ch5', 'battle:c5.undersleeper-eye'], ['ch5', 'seg:c5-ending'],
];
// design target party level on arrival (boss level - 1 .. boss level)
const PARTY_BY = { ch0: ['bramble', 'burdock'], ch1: ['bramble', 'badger', 'mole'], ch1w: ['bramble', 'badger', 'mole'], ch2: ['bramble', 'jade-rabbit', 'badger'], ch3: ['bramble', 'tansy', 'jade-rabbit'], ch4: ['bramble', 'tin-woodman', 'jade-rabbit'], ch5: ['bramble', 'captain-quarry', 'jade-rabbit'] };
const GEAR_BY = { ch0: 0, ch1: 1, ch1w: 2, ch2: 3, ch3: 4, ch4: 5, ch5: 5 };
const chKey = ch => ch === 'ch1w' ? 'ch1' : ch;
// scripted button gifts per chapter (give({buttons}) / s.buttons(n) in the chapter's sources), paid at its first step
const gifts = {};
for (const ch of ['ch0', 'ch1', 'ch1w', 'ch2', 'ch3', 'ch4', 'ch5']) {
  const dir = new URL(`../game/src/data/${ch}/`, import.meta.url);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js') || /maps|segments|grid|common|util|build/.test(f)) continue;
    const src = readFileSync(new URL(f, dir), 'utf8').replace(/chests:\s*\[[^\]]*\]/g, '');
    for (const m of src.matchAll(/give\(\{[^}]*?buttons:\s*(\d+)/g)) gifts[chKey(ch)] = (gifts[chKey(ch)] || 0) + +m[1];
    for (const m of src.matchAll(/s\.buttons\((\d+)\)/g)) gifts[chKey(ch)] = (gifts[chKey(ch)] || 0) + +m[1];
  }
}
// route geometry
const near = (mapId, pts, r) => { const t = ROUTE[mapId] && ROUTE[mapId].tiles; if (!t || !t.length) return false; return pts.some(([x, y]) => t.some(([a, b]) => Math.max(Math.abs(a - x), Math.abs(b - y)) <= r)); };
const enemyPts = e => {
  const pts = [[e.x, e.y]]; const L = e.loop || [];
  for (let i = 0; i < L.length; i++) { const [a, b] = L[i], [c, d] = L[(i + 1) % L.length]; const n = Math.max(Math.abs(c - a), Math.abs(d - b)); for (let k = 0; k <= n; k++) pts.push([Math.round(a + (c - a) * k / (n || 1)), Math.round(b + (d - b) * k / (n || 1))]); }
  return pts;
};
const MODELS = {
  all: { enemy: () => FRAC, chest: () => 1, btnF: 0.8 / FRAC },
  full: { enemy: () => 1, chest: () => 1, btnF: 1 },
  real: { enemy: (m, e) => near(m, enemyPts(e), R_MEET) ? 1 : OPT, chest: (m, c) => near(m, [[c.x, c.y]], R_CHEST) ? 1 : OPT, btnF: 1 },
};
const cache = new Map();
const fightRes = (ch, id, L) => {
  const k = id + '@' + L; if (cache.has(k)) return cache.get(k);
  const enc = D.encounters[id]; const r = enc ? runEncounter(id, enc, PARTY_BY[ch].map(m => [m, L]), { gear: GEAR_BY[ch], seeds: 3 }) : null;
  if (r) { let w = 0, wl = 0; for (const e of enc.enemies) { const u = makeEnemy(e, 0); w += u.xp; wl += u.xp * u.lvl; } r.foeLvl = w ? wl / w : L; }
  cache.set(k, r); return r;
};
const catchUp = argv.includes('--no-catchup') ? () => 1 : xpCatchUp;   // the game's level catch-up (state.js)
function play(model) {
  const M = MODELS[model];
  let L = 1, xp = 0, btn = 0, fights = 0; const rows = {}; const money = {}; const seen = new Set();
  const add = (ch, k, v) => { const c = chKey(ch); money[c] = money[c] || { fights: 0, chests: 0, gifts: 0 }; money[c][k] += v; btn += v; };
  const give = n => { xp += n; while (L < 30 && xp >= xpNext(L)) { xp -= xpNext(L); L++; } if (L >= 30) xp = 0; };
  const lv = () => +(L + xp / xpNext(L)).toFixed(1);
  const fight = (ch, id, frac) => { const r = fightRes(ch, id, L); if (!r) return null; give(r.xp * frac * catchUp(r.foeLvl - L)); fights += frac; add(ch, 'fights', r.buttons * frac * (D.encounters[id].boss ? 1 : M.btnF)); return r; };
  for (const [ch, step] of PLAY) {
    if (!seen.has(chKey(ch))) { seen.add(chKey(ch)); add(ch, 'gifts', gifts[chKey(ch)] || 0); }
    if (step.startsWith('seg:')) rows[step] = { lv: lv(), btn: Math.round(btn) };
    else if (step.startsWith('battle:')) { const at = lv(), b0 = Math.round(btn); const r = fight(ch, step.slice(7), 1); rows[step] = { lv: at, btn: b0, xp: r && r.xp }; }
    else {
      const map = G.maps[step]; if (!map) { rows[step] = { missing: 1 }; continue; }
      const at = lv(); let n = 0;
      for (const e of map.enemies || []) { const f = M.enemy(step, e); n += f; fight(ch, e.encounter, f); }
      for (const c of map.chests || []) if (c.give && c.give.buttons) add(ch, 'chests', c.give.buttons * M.chest(step, c));
      rows[step] = { lv: at, to: lv(), n, of: (map.enemies || []).length };
    }
  }
  return { rows, money, fights, final: lv() };
}
const P = { all: play('all'), full: play('full'), real: play('real') };
// gear each segment assumes: pieces not held in an earlier segment's set are bought before it (prices: items.js)
const segOf = id => D.segments.find(s => s.id === id);
let held = {}, spent = 0;
const out = []; let bad = 0;
out.push('                                         all   full  real  real btn  gear spent  spare');
for (const [ch, step] of PLAY) {
  const a = P.all.rows[step], f = P.full.rows[step], r = P.real.rows[step];
  if (step.startsWith('seg:')) {
    const seg = segOf(step.slice(4)); if (!seg) { out.push(`  ?? no segment ${step}`); continue; }
    for (const [id, n] of Object.entries(seg.gear || {})) { const more = n - (held[id] || 0); if (more > 0) { spent += more * gearPrice(+id.split('+')[1]); held[id] = n; } }
    const pl = seg.party[0][1]; const spare = r.btn - spent;
    const flags = []; if (Math.abs(pl - r.lv) > 1) flags.push('level'); if (spare < 0) flags.push('gear'); if (flags.length) bad++;
    out.push(`seg  ${seg.id.padEnd(22)} party ${String(pl).padStart(2)}  ${String(a.lv).padStart(5)} ${String(f.lv).padStart(5)} ${String(r.lv).padStart(5)} ${String(r.btn).padStart(8)} ${String(spent).padStart(11)} ${String(r.btn - spent).padStart(6)}${flags.length ? '  <-- ' + flags.join(', ') : ''}`);
  } else if (step.startsWith('battle:')) {
    const id = step.slice(7), enc = D.encounters[id];
    if (enc.boss) {
      const bl = Math.max(...enc.enemies.map(e => Array.isArray(e) ? e[1] : e.lvl));
      const flags = []; if (r.lv < bl - 1.5 || r.lv > bl + 0.25) flags.push('real'); if (f.lv > bl + 1) flags.push('full'); if (flags.length) bad++;
      out.push(`BOSS ${id.padEnd(22)} L${String(bl).padEnd(7)} ${String(a.lv).padStart(5)} ${String(f.lv).padStart(5)} ${String(r.lv).padStart(5)} ${String(r.btn).padStart(8)}${flags.length ? '  <-- off: ' + flags.join(', ') : ''}`);
    } else out.push(`     ${id.padEnd(22)} story   ${String(a.lv).padStart(5)} ${String(f.lv).padStart(5)} ${String(r.lv).padStart(5)} ${String(r.btn).padStart(8)}`);
  } else if (!r.missing && r.of) out.push(`     ${step.padEnd(22)} ${String(r.of).padStart(2)} foes  ${String(a.lv).padStart(5)} ${String(f.lv).padStart(5)} ${String(r.lv).padStart(5)} ${String(r.btn ?? '').padStart(8)}   real fights ${r.n.toFixed(2)}`);
}
console.log(out.join('\n'));
console.log(`\nfights taken: all ${P.all.fights.toFixed(0)} (x${FRAC}), full ${P.full.fights.toFixed(0)}, real ${P.real.fights.toFixed(1)} (route + ${OPT * 100}% of the rest); final level all ${P.all.final} / full ${P.full.final} / real ${P.real.final}`);
// what the design assumes is bought per chapter: 9 gear pieces of the chapter's tier, 4 army items, plus items
const BUY = { ch1: [2, 1, 150], ch2: [3, 2, 300], ch3: [4, 3, 400], ch4: [5, 3, 450] };
for (const model of ['all', 'real']) {
  console.log(`\nbuttons per chapter (${model}) vs the chapter's assumed purchases (9 gear + 4 army items + items):`);
  for (const [ch, m] of Object.entries(P[model].money)) {
    const inc = Math.round(m.fights + m.chests + m.gifts); const b = BUY[ch];
    const cost = b ? 9 * gearPrice(b[0]) + 4 * armyGearPrice(b[1]) + b[2] : 0;
    const ok = !b || model === 'real' || inc >= 1.1 * cost; if (!ok) bad++;
    console.log(`  ${ch}: income ${inc} (fights ${Math.round(m.fights)}, chests ${Math.round(m.chests)}, gifts ${m.gifts})` + (b ? `  cost ${cost}  ratio ${(inc / cost).toFixed(2)}${ok ? '' : '  <-- short'}` : ''));
  }
}
console.log(bad ? `${bad} problem(s)` : 'curve ok');
