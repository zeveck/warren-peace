// New Game+ (design/changes/ngplus.md): the play-test's NG+ segments. The bosses' second phases are in ./bosses.js
// (read by battle/rpg.js by encounter id, not merged here). Each NG segment starts as its base segment does, with the
// NG+ carry set and every friend at least level 27 (hook.js goToLevel resolves `base`); chapter is given explicitly.
import { G } from '../../core.js';

const baseDone = (base) => s => { const b = G.data.segments.find(x => x.id === base); return !!(s.ng && b && b.done && b.done(s)); };
const ng = (base, chapter) => ({ id: 'ng-' + base, name: 'New Game+: ' + base, base, chapter, ng: { cycle: 1, level: 27 }, done: baseDone(base) });

const segments = [
  ng('c1-toadhall', 1), ng('c1w-wonder-b', 1), ng('c1w-shallows', 1),
  ng('c2-aster', 2), ng('c2-moon-b', 2), ng('c2-drowned', 2),
  ng('c3-barley', 3), ng('c3-oz-b', 3), ng('c3-stair', 3),
  ng('c4-quarry', 4), ng('c4-root', 4), ng('c5-dream', 5),
  // the won game on the sunset map: talk to Woodruff, tell it again, and arrive at the start of New Game+
  { id: 'ng-start', name: 'New Game+ from the sunset', base: 'c5-ending', chapter: 5,
    flags: { c5_sunset_arrived: true, g_won: true, g_ch5_done: true, c6_invited: true },   // (the epilogue's invitation is its own segment's business) quest: 'Peace on the Downs. Wander, and talk to everyone.',
    done: s => !!(s.ng && s.ng.cycle === 1 && s.map === (G.data.start && G.data.start.map) && s.party.members.bramble && s.party.members.bramble.lvl >= 27) },
];

export default { segments };
