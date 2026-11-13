// Headless battle check: node tools/battle-check.mjs <encounterId> <avgPartyLevel> [member:level ...] [--seeds N] [--gear T] [--plain]
// Plays the encounter N times (default 30) with the shared AI in lib-battle.mjs: by default the counter AI (the boss's
// counter policy: guard/shield the big hits, hit glowing mouths and open eyes, splash the Witch, cure, revive, Light vs
// Eerie); --plain plays the design's plain AI (heal below 40%, else the strongest skill at the first enemy; no Guard,
// items, cures or target choice). --gear T puts tier-T gear on everyone (0 = none). Prints win rate, rounds, Heart left.
import { loadData, runEncounter } from './lib-battle.mjs';
const args = process.argv.slice(2);
const encId = args[0]; const lvl = +args[1] || 5;
const opt = k => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : null; };
const members = args.slice(2).filter(a => a.includes(':')).map(a => { const [id, l] = a.split(':'); return [id, +l]; });
if (!members.find(m => m[0] === 'bramble')) members.unshift(['bramble', lvl]);
const D = await loadData();
const enc = D.encounters[encId]; if (!enc) { console.log('no encounter', encId); process.exit(1); }
const r = runEncounter(encId, enc, members, { seeds: opt('--seeds') || 30, gear: opt('--gear') || 0, plain: args.includes('--plain') });
console.log(JSON.stringify({ encounter: encId, ai: args.includes('--plain') ? 'plain' : 'counter', party: members, wins: `${r.wins}/${r.seeds}`, avgRounds: r.avgRounds, minRounds: r.minRounds, maxRounds: r.maxRounds, avgHeartLeft: r.heartLeft + '%', xp: r.xp }));
