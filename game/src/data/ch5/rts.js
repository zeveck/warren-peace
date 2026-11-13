// RTS 5: The Long Thump. Take and hold all three Thump Stones together for 60 seconds while the
// Undersleeper's dream-shapes roll in from the dark edges.
import { addSquad } from '../../rts/sim.js';
import { audio } from '../../engine/audio.js';

const R = { 'edge-n': ['stone-n', 'centre', 'near', 'home'], 'edge-w': ['stone-w', 'near', 'home'], 'edge-e': ['stone-e', 'near', 'home'] };
const SURGE = (at, from, sq) => ({ at, from, sq, route: R[from] });
const SURGES = [];
const EDGES = ['edge-e', 'edge-w', 'edge-n'];
const KNOTS = [['weight', 'drift', 'flicker'], ['weight', 'weight', 'flicker'], ['drift', 'flicker', 'weight', 'drift']];
for (let i = 0; i < 16; i++) SURGES.push(SURGE(14 + i * 12, EDGES[i % 3], KNOTS[i % 3]));

export default {
  'c5-rts5': {
    name: 'The Long Thump', sub: 'Take all three Thump Stones and hold them together until the Long Thump reaches 60.',
    music: 'm-army-finale',   // no drums of its own: the Thump Stone layers (72 BPM) carry the beat; the preview plays m-army2
    previewMusic: 'm-army2',
    // post-game revisit par times in seconds (tools/rts-par.mjs): Burdock's time to beat, and the medals
    medals: { burdock: 71.5, gold: 70.5, silver: 125, bronze: 190 },
    size: 22, cap: 12, world: 'depths', dark: 0.4, groundKind: 'floor', pathKind: 'carve',
    home: 'home', mouth: 'edge-n', focus: 'centre',
    // one squad from every freed warren and the strongest of the storybook friends; with these alone (no army gear)
    // the odds are Even, with army gear Strong (tools/rts-check.mjs; the design's tier 1.35 was far too soft for 12 squads)
    required: ['thimblebank-rabbits', 'thimblebank-diggers', 'silverdown-rabbits', 'wheatsheaf-rabbits', 'flintcomb-diggers', 'cherts-band', 'moon-hares', 'polite-dark', 'mastodon-herd', 'winkies', 'tansys-scouts', 'winged-monkeys'],
    nodes: [
      { id: 'home', kind: 'home', x: 17, y: 18, owner: 'player' },
      { id: 'near', kind: 'plain', x: 12, y: 13 },
      { id: 'stone-w', kind: 'thump', x: 5, y: 14 },
      { id: 'stone-n', kind: 'thump', x: 7, y: 6 },
      { id: 'stone-e', kind: 'thump', x: 15, y: 6 },
      { id: 'centre', kind: 'plain', x: 10, y: 9 },
      { id: 'edge-w', kind: 'plain', x: 1, y: 19, dark: true },
      { id: 'edge-n', kind: 'plain', x: 2, y: 1, dark: true },
      { id: 'edge-e', kind: 'plain', x: 20, y: 2, dark: true },
    ],
    paths: [
      ['home', 'near'], ['near', 'stone-w'], ['near', 'stone-e'], ['near', 'centre'],
      ['centre', 'stone-w'], ['centre', 'stone-n'], ['centre', 'stone-e'], ['stone-n', 'stone-w'], ['stone-n', 'stone-e'],
      ['edge-w', 'stone-w'], ['edge-n', 'stone-n'], ['edge-e', 'stone-e'],
    ],
    // one dream-shape every 8 s from the dark edges (the engine makes it 11 s on Easy), and every so often the
    // dream turns over and a whole knot of them rolls in at once
    enemy: {
      tier: 2.6, every: 8, cycle: ['drift', 'weight', 'flicker'], spawnAt: ['edge-n', 'edge-w', 'edge-e'], hunt: true,
      waves: SURGES,
    },
    thump: true,
    prompts: [
      { text: 'Old Yarrow\'s voice, from somewhere warm: "When all the warrens thump as one, the Sleeper\'s dream is soft and done." Take all three Thump Stones and hold them together.', wait: true },
      { text: 'The Long Thump counts only while every stone is yours. Lose one and it waits for you; it never goes back.', when: rts => rts.S.thumpT > 0.5, wait: true },
    ],
    onStart(rts) {
      // Deepdelve's echoes come too, free, beyond the cap
      if (!rts.S.squads.some(q => q.side === 'player' && q.sq === 'deepdelve-echoes')) addSquad(rts.S, 'player', 'deepdelve-echoes', 'home');
      // Yarrow's rhyme is the story's; a post-game revisit (Lookout Stone) plays without it
      if (!(rts.o && rts.o.revisit)) audio.voice('vo-rhyme');
    },
  },
};
