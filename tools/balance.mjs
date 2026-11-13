// Whole-game RPG balance (design "tools/balance.mjs"):
// - every boss, played with its counter policy at the expected level, is won (>= 80%) in 8-15 rounds; with the plain AI
//   it is lost (< 80% wins) or takes longer than with the counter (dream bosses: counter only);
// - --all: every map's visible fights as a whole-dungeon run (Heart and Pluck carried, 30% Pluck back after each win,
//   no rest), played with the counter policy: 2.3-4 rounds per fight on average, none under 2 (single-enemy tutorial
//   fights excepted) or over 6, nobody loses, the party never starts two fights in a row unable to afford a skill;
//   and the Tussle-masher (Tussle every turn, each fight fresh) wins >= 90% in <= 6.5 rounds on average; every normal
//   fight is won fresh 12/12 (counter). Heart lost per fight and the biggest enemy hit (regular / wind-up) are shown.
// Expected level: a boss is played at its level - 1 (tools/curve.mjs checks the party really arrives there); a map at
// its highest enemy level. Gear: the chapter's shop tier on everyone. Run: node tools/balance.mjs [--all]
import { loadData, runEncounter, runDungeon } from './lib-battle.mjs';
// --table: per-map table (counter / tussle rounds and Heart lost); --before: run with no wind-ups (for comparisons)
const D = await loadData();
const all = process.argv.includes('--all');
// expected party per chapter folder (travelling three first, then reserves)
const PARTY_BY = { ch0: ['bramble', 'burdock'], ch1: ['bramble', 'badger', 'mole', 'ratty', 'toad', 'burdock'], ch1w: ['bramble', 'badger', 'mole', 'caterpillar', 'cheshire-cat'],
  ch2: ['bramble', 'jade-rabbit', 'badger', 'ninefold', 'mole'], ch3: ['bramble', 'tansy', 'jade-rabbit', 'tin-woodman', 'pip'], ch4: ['bramble', 'tin-woodman', 'jade-rabbit', 'captain-quarry', 'tansy'], ch5: ['bramble', 'captain-quarry', 'jade-rabbit', 'rumble', 'ninefold'] };
const GEAR_BY = { ch0: 0, ch1: 1, ch1w: 2, ch2: 3, ch3: 4, ch4: 5, ch5: 5 };
// gear the party really has at each boss (the segments' gear: a boss early in a chapter is fought with the last
// chapter's shop tier)
// (calibration.md: the segments now carry what the main path affords, mixed tiers; these are the averages over the
// three's tool / coat / charm: Toad Hall T1 + two T2 tools and coats; the Moth Queen T3 with a T2 ribbon; the
// Emerald City T4 tools, T4/T3 coats, T3 charms)
const BOSS_GEAR = { 'c1.chief-weasel': 1.4, 'c1w.croquet': 2, 'c1w.choir': 2, 'c2.aster': 2, 'c2.moth-queen': 2.9, 'c2.tansy': 2.9, 'c2.tidewarden': 2.9,
  'c3.barley': 3, 'c3.witch': 3.6, 'c3.watcher': 3.7, 'c4.quarry': 3.7, 'c4.hollow': 5 };
// the travelling three the segment solutions really take into each boss (Bramble + the segment's two active members)
const BOSS_TEAM = { 'c1.chief-weasel': ['badger', 'mole'], 'c1w.croquet': ['badger', 'mole'], 'c1w.choir': ['badger', 'mole'], 'c2.aster': ['mole', 'ninefold'],
  'c2.moth-queen': ['mole', 'ninefold'], 'c2.tansy': ['jade-rabbit', 'badger'], 'c2.tidewarden': ['jade-rabbit', 'badger'], 'c3.barley': ['tansy', 'jade-rabbit'],
  'c3.witch': ['tin-woodman', 'jade-rabbit'], 'c3.watcher': ['tin-woodman', 'jade-rabbit'], 'c4.quarry': ['tansy', 'jade-rabbit'], 'c4.hollow': ['rumble', 'jade-rabbit'],
  'c5.nightmare-deepdelve': ['tansy', 'jade-rabbit'], 'c5.nightmare-flintcomb': ['tansy', 'jade-rabbit'], 'c5.undersleeper-eye': ['tansy', 'jade-rabbit'] };
// bosses with no rest stone before them: checked at the state the segment solution really arrives in (measured in the
// replay: level, Heart and Pluck fractions, battle items) instead of fresh at boss level - 1
const BOSS_ARRIVE = { 'c1w.croquet': { lvl: 9, hpF: 0.65, plF: 0.4, items: { 'clover-bunch': 3, dandelion: 1, 'carrot-cake': 1 } } };
// maps fought before the chapter's usual three have joined (party, level)
const MAP_PARTY = { 'c1-depths': [['bramble', 'burdock'], 4], 'c1-riverbank': [['bramble', 'burdock', 'ratty'], 5] };
// the counter policy includes who is in the travelling three (Ninefold vs Aster's Hum-taken, Light hit-all for the Hollow Rabbits)
const COUNTER_PARTY = {};
let fails = 0, warns = 0; const rows = [], mapRows = [];
// ---- New Game+ (--ng; design/changes/ngplus.md): the party at NG_LVL with the segments' teams and gear; every boss at the
// party's level + 1 with its second phase (data/ng/bosses.js). Counter: >= 80% wins in 10-18 rounds, phase 2 reached
// in >= 90% of wins; plain clearly worse (< 60% wins, or at least 3 rounds slower). The Eye: counter-only story finale,
// 6-10 rounds and no slower than plain. --ng --all: every map's fights at party - 4 (quick: counter <= 3.5 rounds,
// no losses; masher >= 90% wins in <= 6.5 rounds). The base checks below are not run with --ng.
if (process.argv.includes('--ng')) {
  const NG_LVL = 27;
  // where the counter needs a particular friend in the three (their skills: Light, Dig, Afraid, the right tellers)
  const NG_TEAM = { 'c4.quarry': ['mole', 'jade-rabbit'], 'c3.barley': ['tansy', 'jade-rabbit'] };
  const NG_PARTY_BY = { ...PARTY_BY, ch1w: [...PARTY_BY.ch1w, 'toad', 'ratty', 'burdock'], ch5: ['bramble', 'captain-quarry', 'jade-rabbit', 'rumble', 'ninefold', 'mole', 'pip', 'cheshire-cat', 'tin-woodman'] };
  for (const [id, enc] of Object.entries(D.encounters)) {
    if (!enc.boss) continue;
    const team = NG_TEAM[id] || BOSS_TEAM[id] || [];
    const ids = ['bramble', ...team, ...(NG_PARTY_BY[enc.ch] || []).filter(m => m !== 'bramble' && !team.includes(m))];
    const members = ids.map(m => [m, NG_LVL]);
    const arr = BOSS_ARRIVE[id];   // no rest stone before it: the measured arrival state, as in the base check
    const bo = { gear: BOSS_GEAR[id] ?? GEAR_BY[enc.ch], ng: { party: NG_LVL, lockLT: enc.ch !== 'ch5' }, ...(arr ? { hpF: arr.hpF, plF: arr.plF, items: arr.items } : {}) };
    const c = runEncounter(id, enc, members, bo), p = runEncounter(id, enc, members, { ...bo, plain: true });
    const eye = !!enc.dream;
    const ok = eye ? c.wins === c.seeds && c.avgRounds >= 6 && c.avgRounds <= 10 && c.avgRounds <= p.avgRounds
      : c.wins >= c.seeds * 0.8 && c.avgRounds >= 10 && c.avgRounds <= 18 && c.phased >= c.wins * 0.9 && (p.wins < p.seeds * 0.6 || p.avgRounds >= c.avgRounds + 3);
    if (!ok) fails++;
    rows.push(`${ok ? 'ok  ' : 'FAIL'} ng boss ${id} @${NG_LVL}${arr ? ' (arrival)' : ''}: counter ${c.wins}/${c.seeds} in ${c.avgRounds} rounds (${c.minRounds}-${c.maxRounds}), phase 2 in ${c.phased}, heart left ${c.heartLeft}%; plain ${p.wins}/${p.seeds} in ${p.avgRounds}`);
  }
  if (all) {
    const { loadData: loadGame } = await import('../game/src/data/index.js');
    const G = await loadGame();
    for (const [mapId, map] of Object.entries(G.maps)) {
      const list = (map.enemies || []).map(e => e.encounter).filter(x => D.encounters[x] && !D.encounters[x].boss); if (!list.length) continue;
      const ch = D.encounters[list[0]].ch; const mp = (MAP_PARTY[mapId] || [PARTY_BY[ch] || ['bramble']])[0];
      const ms = mp.map(m => [m, NG_LVL]), o = { gear: GEAR_BY[ch], seeds: 12, ng: { party: NG_LVL, lockLT: ch !== 'ch5' } };
      const r = runDungeon(list, D, ms, o);
      const tf = list.map(x => runEncounter(x, D.encounters[x], ms.slice(0, 3), { ...o, plain: 'tussle' }));
      const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
      const cm = mean(r.fights.map(f => f.avg)), tm = mean(tf.map(x => x.avgRounds)), tw = Math.round(100 * mean(tf.map(x => x.wins / x.seeds)));
      const ok = cm <= 3.5 && !r.losses && tm <= 6.5 && tw >= 90;
      if (!ok) warns++;
      rows.push(`${ok ? 'ok  ' : 'warn'} ng run ${mapId}: counter ${cm.toFixed(1)}r ${mean(r.fights.map(f => f.lostPct)).toFixed(0)}%/fight | tussle ${tm.toFixed(1)}r wins ${tw}%${r.losses ? ` ${r.losses} LOSSES` : ''}`);
    }
  }
  console.log(rows.join('\n')); console.log(fails || warns ? `${fails} boss problem(s), ${warns} warning(s)` : 'all good');
  process.exit(0);
}
for (const [id, enc] of Object.entries(D.encounters)) {
  const lvls = enc.enemies.map(e => Array.isArray(e) ? e[1] : e.lvl);
  const top = Math.max(...lvls);
  const arr = enc.boss && BOSS_ARRIVE[id];
  const lvl = arr ? arr.lvl : enc.boss ? top - 1 : top;
  const ids = enc.boss && BOSS_TEAM[id] ? ['bramble', ...BOSS_TEAM[id], ...(PARTY_BY[enc.ch] || []).filter(m => m !== 'bramble' && !BOSS_TEAM[id].includes(m))] : PARTY_BY[enc.ch] || ['bramble'];
  const members = ids.map(m => [m, lvl]);
  if (enc.boss) {
    const bo = { gear: BOSS_GEAR[id] ?? GEAR_BY[enc.ch], ...(arr ? { hpF: arr.hpF, plF: arr.plF, items: arr.items } : {}) };
    const c = runEncounter(id, enc, COUNTER_PARTY[id] ? COUNTER_PARTY[id].map(m => [m, lvl]) : members, bo);
    const p = runEncounter(id, enc, members, { ...bo, plain: true });
    const ok = c.wins >= c.seeds * 0.8 && c.avgRounds >= 8 && c.avgRounds <= 15 && (enc.dream || p.wins < p.seeds * 0.8 || p.avgRounds > c.avgRounds);
    if (!ok) fails++;
    rows.push(`${ok ? 'ok  ' : 'FAIL'} boss ${id} @${lvl}${arr ? ` (arrival: ${arr.hpF * 100}% Heart, ${arr.plF * 100}% Pluck)` : ''}: counter ${c.wins}/${c.seeds} in ${c.avgRounds} rounds (${c.minRounds}-${c.maxRounds}), heart left ${c.heartLeft}%; plain ${p.wins}/${p.seeds} in ${p.avgRounds}`);
  } else if (all) {
    const c = runEncounter(id, enc, members.slice(0, 3), { gear: GEAR_BY[enc.ch], seeds: 12 });
    if (c.wins < c.seeds) { warns++; rows.push(`warn ${id} @${lvl}: fresh ${c.wins}/${c.seeds} wins`); }
  }
}
if (all) {
  const { loadData: loadGame } = await import('../game/src/data/index.js');
  const G = await loadGame();
  for (const [mapId, map] of Object.entries(G.maps)) {
    const list = (map.enemies || []).map(e => e.encounter).filter(x => D.encounters[x] && !D.encounters[x].boss); if (!list.length) continue;
    const ch = D.encounters[list[0]].ch; const L = Math.max(...list.flatMap(x => D.encounters[x].enemies.map(e => e[1])));
    const [mp, ml] = MAP_PARTY[mapId] || [PARTY_BY[ch] || ['bramble'], L];
    const r = runDungeon(list, D, mp.map(m => [m, ml]), { gear: GEAR_BY[ch], seeds: 12 });
    // the Tussle-masher: every fight fresh (heals up between fights), Tussle every turn
    const tf = list.map(id => runEncounter(id, D.encounters[id], mp.map(m => [m, ml]).slice(0, 3), { gear: GEAR_BY[ch], seeds: 12, plain: 'tussle' }));
    const cf = list.map(id => runEncounter(id, D.encounters[id], mp.map(m => [m, ml]).slice(0, 3), { gear: GEAR_BY[ch], seeds: 12 }));
    const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
    const avgs = r.fights.map(f => f.avg); const cm = mean(avgs), cl = mean(r.fights.map(f => f.lostPct));
    const tm = mean(tf.map(x => x.avgRounds)), tl = mean(tf.map(x => x.heartLost)), tw = Math.round(100 * mean(tf.map(x => x.wins / x.seeds)));
    const reg = Math.max(...r.fights.map(f => f.maxHit), ...tf.map(x => x.maxHit / 100)) * 100, hv = Math.max(...r.fights.map(f => f.maxHeavy), ...tf.map(x => x.maxHeavy / 100)) * 100;
    const cfl = mean(cf.map(x => x.heartLost));
    // normal fights: 3-4 rounds with sensible play (counter, whole-dungeon run), Tussle-mashing not much longer;
    // nobody loses with sensible play
    // (the gap left is the party's own hit-all / Light skills: late in the game sensible play ends fights in ~2.5 rounds)
    const ok = cm >= 2.3 && cm <= 4 && avgs.every((a, i) => (a >= 2 || D.encounters[list[i]].enemies.length === 1) && a <= 6) && tm <= 6.5 && tw >= 90 && !r.losses && !r.brokeRuns;
    if (!ok) warns++;
    mapRows.push({ mapId, ml, cm, tm, cl, cfl, tl, tw, reg: Math.round(reg), hv: Math.round(hv), closs: r.losses });
    rows.push(`${ok ? 'ok  ' : 'warn'} run ${mapId} @${ml}: counter ${cm.toFixed(1)}r ${cl.toFixed(0)}%/fight (fresh ${cfl.toFixed(0)}%) | tussle fresh ${tm.toFixed(1)}r ${tl.toFixed(0)}%/fight, wins ${tw}% | biggest hit ${Math.round(reg)}%, wind-up ${Math.round(hv)}%  [${r.fights.map((f, i) => `${f.id.replace(/^c\d+w?\./, '')} ${f.avg}/${tf[i].avgRounds}`).join(', ')}]${r.losses ? ` ${r.losses} LOSSES` : ''}${r.brokeRuns ? `, ${r.brokeRuns} runs out of Pluck 2+ fights` : ''}`);
  }
  if (process.argv.includes('--table')) {
    console.log('| Map | lvl | counter rounds (dungeon) | counter Heart lost/fight (dungeon / fresh) | tussle rounds (fresh) | tussle Heart lost/fight | tussle wins | biggest hit / wind-up |\n|---|---|---|---|---|---|---|---|');
    for (const m of mapRows) console.log(`| ${m.mapId} | ${m.ml} | ${m.cm.toFixed(1)} | ${m.cl.toFixed(0)}% / ${m.cfl.toFixed(0)}% | ${m.tm.toFixed(1)} | ${m.tl.toFixed(0)}% | ${m.tw}% | ${m.reg}% / ${m.hv}% |`);
  }
}
console.log(rows.join('\n')); console.log(fails || warns ? `${fails} boss problem(s), ${warns} warning(s)` : 'all good');
