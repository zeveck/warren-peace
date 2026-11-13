// The Hole: Flintcomb's Underway at the bottom of the rope, the volcanic tubes with Saknussemm's marks, the
// whispering gallery, the Hansbach stream, and the Lidenbrock Sea (raft, sea monsters, storm, geyser island).
import { G } from '../../core.js';
import { flag, setFlag, travelling } from '../../state.js';
import { toScreen } from '../../engine/iso.js';
import { grid, sprinkle, ridge } from './grid.js';
import { LEG, pixelText, comp, chime, chirp } from './common.js';

// ridge heights round a carved floor: one or two above the highest floor tile next to them
const tileXY = (ex, x, y) => { const s = toScreen(x, y, ex.hAt(x, y)); return { x: s.x + ex.ox, y: s.y + ex.oy }; };
// the "A.S." carved beside the right way at each fork, glowing faintly
function drawAS(ex, c, x, y) {
  const p = tileXY(ex, x, y);
  const a = 0.55 + 0.25 * Math.sin(G.time * 2 + x);
  c.fillStyle = `rgba(250,220,150,${0.18 * a})`; c.fillRect(p.x - 9, p.y - 20, 19, 11);
  pixelText(c, 'A.S.', p.x - 7, p.y - 18, `rgba(255,232,170,${a})`);
}

// ---------------------------------------------------------------- Flintcomb's Underway (bottom of the hole)
function underway() {
  const g = grid(20, 20, ' ', 0);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
    const d = Math.hypot(x - 9, y - 9);
    if (d <= 7.3) g.set(x, y, d <= 5.3 ? 'a' : 'o', 0);
    else if (x + y < 19 && d < 9.5) g.set(x, y, '%', 1);
  }
  g.disc(9, 9, 1.6, 'o', 0);
  g.rect(15, 8, 19, 10, 'a', 0);                   // the tube on down
  g.set(19, 8, ' '); g.set(19, 10, ' ');
  g.rect(16, 7, 19, 7, '%', 1);
  g.rect(16, 11, 19, 11, 'R', 1);
  sprinkle(g, 'a', 'm', 6, 4);
  return g;
}
const UW = underway();
const underwayMap = {
  name: 'Flintcomb\'s Underway', world: 'journey', area: 'hole', music: 'm-deep', ambience: [['drone-bed', 0.35]], battle: 'lidenbrock', dark: 0.3,
  sky: '#0c0a0a',
  tiles: UW.rows(), heights: UW.hrows(), legend: LEG,
  entries: { top: [9, 3, 'se'], stone: [10, 9, 'nw'], tubes: [17, 9, 'nw'] },
  props: [
    { id: 'prop-rest-stone', x: 9, y: 9 },
    ['prop-carved-pillar', 3, 5], ['prop-carved-pillar', 5, 3], ['prop-carved-pillar', 3, 13], ['prop-carved-pillar', 13, 3],
    ['prop-stone-face', 6, 2], ['prop-glow-crystal', 4, 14], ['prop-glow-crystal', 14, 4], ['prop-tube-mouth', 15, 7],
    ['prop-rubble', 11, 2], ['prop-glow-crystal', 15, 13],
  ],
  doors: [{ x: 19, y: 9, to: 'c4-tubes', entry: 'top' }],
  triggers: [
    { x: 9, y: 9, use: true, run: 'underway.stone' },
    { x: 9, y: 2, use: true, run: 'c4.rope-up' }, { x: 8, y: 2, use: true, run: 'c4.rope-up' }, { x: 9, y: 3, here: true, use: true, run: 'c4.rope-up' },
  ],
  onEnter: 'c4.underway.enter',
  // Quarry's rope, hanging down out of the dark
  drawOver(ex, c) {
    const p = tileXY(ex, 9, 2);
    const sway = Math.sin(G.time * 0.9) * 1.5;
    c.fillStyle = '#8a6a44'; for (let y = -400; y < p.y + 6; y += 2) c.fillRect(Math.round(p.x + sway * (1 - (p.y - y) / 400)), y, 2, 2);
    c.fillStyle = '#6a5034'; c.fillRect(Math.round(p.x - 2 + sway), p.y + 4, 6, 3);
  },
};

// ---------------------------------------------------------------- the tubes: three forks, the gallery, the Hansbach
// forks (where the wrong branches slide you back to) and the A.S. marks by the right ways
const FORKS = [{ back: [15, 4, 'sw'], as: [13, 7] }, { back: [15, 16, 'ne'], as: [18, 14] }, { back: [26, 29, 'nw'], as: [24, 32] }];
function tubes() {
  const g = grid(42, 42, ' ', 0);
  g.disc(4, 4, 3.2, 'a', 3);
  g.path([[4, 3], [16, 3]], 'a', 3, 3);                 // in from the Underway
  g.path([[16, 3], [28, 3]], 'a', 3, 3);                // fork 1, wrong: east
  g.path([[14, 5], [14, 15]], 'a', 3, 3);               // fork 1, right: south and down
  g.path([[14, 15], [4, 15]], 'a', 3, 1);               // fork 2, wrong: west
  g.path([[16, 15], [22, 15]], 'a', 3, 1);              // fork 2, right: east to the gallery
  g.disc(26, 16, 4.6, 'f', 1);                          // the whispering gallery
  g.path([[25, 20], [25, 28]], 'a', 3, 1);              // down from the gallery
  g.path([[27, 28], [38, 28]], 'a', 3, 0);              // fork 3, wrong: east
  g.path([[25, 30], [25, 34]], 'a', 3, 0);              // fork 3, right: on down
  g.path([[25, 34], [6, 34]], 'a', 3, 0);               // along the Hansbach
  g.rect(6, 37, 27, 38, '~', 0);                        // the Hansbach stream
  g.rect(28, 36, 29, 38, '~', 0);
  // heights: the tubes go down in steps
  for (let y = 0; y < 42; y++) for (let x = 0; x < 42; x++) {
    if (g.get(x, y) !== 'a') continue;
    if (x >= 14 && x <= 16 && y >= 5 && y <= 17) g.set(x, y, null, y <= 8 ? 3 : y <= 11 ? 2 : 1);
    if (x >= 25 && x <= 27 && y >= 20 && y <= 30) g.set(x, y, null, y <= 24 ? 1 : 0);
    if (y >= 28 && y <= 30 && x > 27) g.set(x, y, null, 0);
  }
  // the gallery's floor: worn smooth, with a ring of carved stone
  for (let y = 0; y < 42; y++) for (let x = 0; x < 42; x++) { const d = Math.hypot(x - 26, y - 16); if (g.get(x, y) === 'f' && d > 3.4) g.set(x, y, 'o'); }
  for (let y = 0; y < 42; y++) for (let x = 0; x < 42; x++) if (g.get(x, y) === 'a' && (x * 5 + y * 3) % 4) g.set(x, y, 'f');
  sprinkle(g, 'f', 'z', 18, 7);
  sprinkle(g, 'f', 'm', 10, 9);
  ridge(g, 'afoz~m');
  return g;
}
const TB = tubes();
const tubesMap = {
  name: 'The Hole', world: 'journey', area: 'hole', music: 'm-journey', ambience: [['drone-bed', 0.3], ['wind', 0.15]], battle: 'lidenbrock', dark: 0.2,
  sky: '#0c0808',
  tiles: TB.rows(), heights: TB.hrows(), legend: LEG,
  entries: { top: [4, 4, 'se'], sea: [8, 35, 'ne'], gallery: [26, 16, 'se'] },
  props: [
    ['prop-tube-mouth', 2, 1], ['prop-glow-crystal', 6, 2], ['prop-carved-rock', 13, 7], ['prop-carved-rock', 18, 14], ['prop-carved-rock', 24, 32],
    ['prop-rubble', 22, 3], ['prop-crater-rock', 7, 16], ['prop-glow-crystal', 10, 14], ['prop-rubble', 33, 30],
    ['prop-glow-crystal', 30, 12], ['prop-glow-crystal', 22, 19], ['prop-glow-crystal', 30, 20], ['prop-carved-pillar', 23, 13], ['prop-carved-pillar', 29, 19],
    ['prop-reeds', 12, 36], ['prop-reeds', 20, 36], ['prop-pool-rock', 16, 36], ['prop-glow-crystal', 26, 35], ['prop-lantern-mushroom', 9, 33],
  ],
  enemies: [
    { id: 'tb1', type: 'cave-lizard', x: 15, y: 10, loop: [[15, 9], [15, 13], [16, 13], [16, 9]], encounter: 'c4.tb-1', facing: 'ne' },
    { id: 'tb2', type: 'trilobite-swarm', x: 26, y: 23, loop: [[26, 22], [26, 26], [25, 26], [25, 22]], encounter: 'c4.tb-2', facing: 'ne' },
    { id: 'tb3', type: 'cave-lizard', x: 22, y: 4, loop: [[20, 4], [25, 4], [25, 3], [20, 3]], encounter: 'c4.tb-3', facing: 'sw' },
    { id: 'tb4', type: 'trilobite-swarm', x: 16, y: 35, loop: [[18, 35], [12, 35], [12, 34], [18, 34]], encounter: 'c4.tb-4', facing: 'sw' },
  ],
  doors: [
    { x: 2, y: 4, to: 'c4-underway', entry: 'tubes' }, { x: 2, y: 3, to: 'c4-underway', entry: 'tubes' },
    { x: 6, y: 34, to: 'c4-sea', entry: 'west' }, { x: 6, y: 35, to: 'c4-sea', entry: 'west' }, { x: 6, y: 36, to: 'c4-sea', entry: 'west' },
  ],
  triggers: [
    { x: 11, y: 3, w: 1, h: 3, run: 'c4.fork1', once: true },
    { x: 30, y: 3, w: 1, h: 3, run: async s => slideBack(s, 0) },
    { x: 4, y: 15, w: 1, h: 3, run: async s => slideBack(s, 1) },
    { x: 40, y: 28, w: 1, h: 3, run: async s => slideBack(s, 2) },
    { x: 13, y: 7, use: true, run: 'c4.as-mark' }, { x: 18, y: 14, use: true, run: 'c4.as-mark' }, { x: 24, y: 32, use: true, run: 'c4.as-mark' },
    { x: 25, y: 15, w: 3, h: 3, run: 'c4.gallery', once: true },
    { x: 20, y: 34, w: 1, h: 3, run: 'c4.hansbach', once: true },
  ],
  chests: [
    { id: 'c4tb-1', x: 28, y: 5, give: { buttons: 240, 'pluck-berry': 2 } },
    { id: 'c4tb-2', x: 38, y: 30, give: { 'glow-mushroom': 1, buttons: 120 } },
    { id: 'c4tb-3', x: 5, y: 17, give: { dandelion: 2, 'smelling-salts': 1 } },
  ],
  onEnter: 'c4.tubes.enter',
  drawOver(ex, c) { for (const f of FORKS) drawAS(ex, c, f.as[0], f.as[1]); },
};
async function slideBack(s, i) {
  const f = FORKS[i];
  s.sfx('scamper');
  const n = (s.val('c4_slides') || 0) + 1; s.set('c4_slides', n);
  const lines = [
    'The tube tilts, steeper and steeper, and the glassy floor gives no grip at all. Down the party slides, round a bend and... back where they started.',
    'Another wrong way. The rock is smooth as ice here. Whoosh, round, and back to the fork, all in a heap.',
    'This tube curls round on itself like a snail shell. Of course it does. Back to the fork.',
  ];
  await s.narrate(lines[(n - 1) % lines.length]);
  await s.warp('c4-tubes', f.back[0], f.back[1], f.back[2]);
  if (n === 1) await chime(s, { 'captain-quarry': 'Hmph. Rock that runs downhill and then runs back. Never dug anything like it.', tansy: 'Whee. Again? No. Let\'s follow the letters, shall we?', pip: 'That was FUN. Was it meant to happen?', _: 'Look for the carved letters.' });
}

// ---------------------------------------------------------------- the Lidenbrock Sea
// west shore (from the Hansbach), the geyser island in the middle, the east shore (the mushroom forest)
const RAFT = { w: [11, 19], iw: [20, 19], ie: [35, 19], e: [43, 19] };
function sea() {
  const g = grid(56, 40, '~', 0);
  // west shore
  g.rect(0, 12, 8, 28, 'z', 1); g.rect(0, 16, 3, 24, 'a', 1); g.disc(7, 20, 3, 'z', 1);
  g.rect(0, 10, 4, 12, 'R', 3); g.rect(0, 28, 4, 30, 'R', 3);
  // the island
  g.disc(28, 20, 6.3, 'z', 1); g.disc(28, 20, 3.6, 'a', 1);
  g.rect(23, 19, 24, 20, 'z', 1); g.rect(32, 19, 33, 20, 'z', 1);
  // east shore and the edge of the mushroom forest
  g.rect(47, 6, 55, 34, 'z', 1); g.rect(50, 8, 55, 32, 'm', 1); g.disc(47, 20, 3, 'z', 1);
  g.rect(53, 4, 55, 6, 'R', 3); g.rect(53, 34, 55, 36, 'R', 3);
  sprinkle(g, 'z', 'a', 12, 5);
  sprinkle(g, 'm', ',', 3, 2);
  return g;
}
const SEA = sea();
// raft lines over the water (raft position of its back tile; Bramble rides on it)
const LINE = {
  'w-iw': [[11, 19], [12, 19], [13, 18], [14, 18], [15, 18], [16, 18], [17, 18], [18, 19], [19, 19], [20, 19]],
  'ie-e': [[35, 19], [36, 19], [37, 19], [38, 20], [39, 20], [40, 20], [41, 20], [42, 19], [43, 19]],
};
const raftAt = () => flag('c4_raft_e') ? 'e' : flag('c4_raft_i') ? 'i' : 'w';
const seaMap = {
  name: 'The Lidenbrock Sea', world: 'journey', area: 'sea', music: 'm-journey', ambience: [['river', 0.35], ['wind', 0.25]], battle: 'lidenbrock', dark: 0.1,
  sky: '#3a4650',
  tiles: SEA.rows(), heights: SEA.hrows(), legend: LEG,
  entries: { west: [2, 20, 'se'], island: [27, 23, 'se'], east: [48, 20, 'se'], mushrooms: [53, 20, 'nw'] },
  props: [
    { id: 'prop-raft', x: RAFT.w[0], y: RAFT.w[1], w: 2, h: 2, ground: true, raft: 'w', cond: () => raftAt() === 'w' },
    { id: 'prop-raft', x: RAFT.iw[0], y: RAFT.iw[1], w: 2, h: 2, ground: true, raft: 'iw', cond: () => raftAt() === 'i' && !flag('c4_raft_ie') },
    { id: 'prop-raft', x: RAFT.ie[0], y: RAFT.ie[1], w: 2, h: 2, ground: true, raft: 'ie', cond: () => raftAt() === 'i' && flag('c4_raft_ie') },
    { id: 'prop-raft', x: RAFT.e[0], y: RAFT.e[1], w: 2, h: 2, ground: true, raft: 'e', cond: () => raftAt() === 'e' },
    ['prop-geyser-vent', 27, 18], ['prop-geyser-vent', 30, 22], ['prop-rest-stone', 26, 22], ['prop-crater-rock', 31, 17],
    ['prop-pool-rock', 5, 14], ['prop-reeds', 7, 25], ['prop-bones', 2, 26], ['prop-tube-mouth', 0, 19],
    { id: 'prop-giant-mushroom', x: 52, y: 10, w: 2, h: 2 }, { id: 'prop-giant-mushroom', x: 51, y: 26, w: 2, h: 2 },
    ['prop-lantern-mushroom', 49, 14], ['prop-lantern-mushroom', 49, 25], ['prop-reeds', 47, 9],
  ],
  enemies: [
    { id: 'sea1', type: 'trilobite-swarm', x: 5, y: 15, loop: [[4, 13], [7, 13], [7, 16], [4, 16]], encounter: 'c4.sea-1', facing: 'se' },
    { id: 'sea2', type: 'cave-lizard', x: 29, y: 25, loop: [[27, 25], [31, 24], [31, 25], [27, 26]], encounter: 'c4.sea-2', facing: 'nw' },
    { id: 'sea3', type: 'eel-cloud', x: 49, y: 29, loop: [[49, 29], [49, 31], [51, 31], [51, 29]], encounter: 'c4.sea-3', facing: 'nw' },
  ],
  doors: [
    { x: 0, y: 19, to: 'c4-tubes', entry: 'sea' }, { x: 0, y: 20, to: 'c4-tubes', entry: 'sea' }, { x: 0, y: 21, to: 'c4-tubes', entry: 'sea' },
    { x: 55, y: 19, to: 'c4-mushrooms', entry: 'shore' }, { x: 55, y: 20, to: 'c4-mushrooms', entry: 'shore' }, { x: 55, y: 21, to: 'c4-mushrooms', entry: 'shore' },
  ],
  triggers: [
    { x: RAFT.w[0], y: RAFT.w[1], w: 2, h: 2, use: true, here: true, run: 'c4.raft', cond: () => raftAt() === 'w' },
    { x: RAFT.iw[0], y: RAFT.iw[1], w: 2, h: 2, use: true, here: true, run: 'c4.raft', cond: () => raftAt() === 'i' && !flag('c4_raft_ie') },
    { x: RAFT.ie[0], y: RAFT.ie[1], w: 2, h: 2, use: true, here: true, run: 'c4.raft', cond: () => raftAt() === 'i' && flag('c4_raft_ie') },
    { x: RAFT.e[0], y: RAFT.e[1], w: 2, h: 2, use: true, here: true, run: 'c4.raft', cond: () => raftAt() === 'e' },
    { x: 9, y: 19, w: 2, h: 2, run: 'c4.raft-first', once: true },
    { x: 26, y: 22, use: true, run: async s => { await s.narrate('A flat warm stone by the geysers, furred with moss. The ground underneath thumps softly, like a heart.'); await s.rest(); } },
    { x: 28, y: 20, w: 1, h: 1, run: 'c4.geyser' },
    { x: 33, y: 19, w: 1, h: 2, run: 'c4.island-east', cond: () => !flag('c4_crossed') },
  ],
  chests: [
    { id: 'c4sea-1', x: 29, y: 16, give: { buttons: 260, 'carrot-cake': 1 } },
    { id: 'c4sea-2', x: 49, y: 11, give: { 'courage-biscuit': 2, 'jade-elixir': 1 } },
  ],
  onEnter: 'c4.sea.enter',
  // glowing cloud overhead (the light of this sea), far-off flickers, geysers, and the storm
  drawBack(ex, c) {
    const t = G.time;
    for (let i = 0; i < 9; i++) {
      const x = ((i * 97 + t * 4) % 760) - 60, y = 18 + (i * 37) % 70;
      c.fillStyle = `rgba(210,220,200,${0.06 + 0.03 * Math.sin(t + i)})`; c.fillRect(x, y, 120, 14); c.fillRect(x + 20, y - 6, 70, 8);
    }
  },
  drawOver(ex, c) {
    const t = G.time;
    // geysers: every few seconds a white column
    for (const [gx, gy, ph] of [[27, 18, 0], [30, 22, 2.1]]) {
      const k = ((t + ph) % 5) / 5;
      if (k < 0.3) {
        const p = tileXY(ex, gx, gy), hgt = Math.sin(k / 0.3 * Math.PI) * 70;
        for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(240,245,250,${0.5 - i * 0.03})`; c.fillRect(Math.round(p.x - 3 + Math.sin(t * 9 + i) * 3), Math.round(p.y + 4 - hgt * i / 14), 6, 6); }
      }
    }
    if (ex._storm) {
      const f = (Math.sin(t * 13) > 0.93) ? 0.5 : (Math.sin(t * 7.3) > 0.97 ? 0.35 : 0);
      c.fillStyle = 'rgba(20,24,40,0.35)'; c.fillRect(0, 0, 640, 360);
      if (f) { c.fillStyle = `rgba(230,240,255,${f})`; c.fillRect(0, 0, 640, 360); }
      c.fillStyle = 'rgba(170,190,220,0.5)';
      for (let i = 0; i < 70; i++) { const x = (i * 53 + t * 300) % 680 - 20, y = (i * 91 + t * 520) % 380 - 20; c.fillRect(Math.round(x), Math.round(y), 1, 5); }
    }
  },
};

// ---------------------------------------------------------------- scripts
async function ride(s, line, to) {
  const ex = s.ex;
  const p = ex.map.props.find(q => q.raft && q.id === 'prop-raft' && (!q.cond || q.cond()));
  if (!p) return;
  // everyone crowds onto the raft (the companions tuck in for the trip)
  for (const f of ex.followers) { f.merge = f.mergeTo = 1; }
  s.place('bramble', p.x, p.y + 1, line[1][0] > line[0][0] ? 'se' : 'nw');
  for (const f of ex.followers) { f.merge = f.mergeTo = 1; }
  for (let i = 1; i < line.length; i++) {
    const [x, y] = line[i];
    const dx = x - p.x, dy = y - p.y;
    p.x = x; p.y = y;
    await s.move('bramble', [[ex.b.x + dx, ex.b.y + dy]], 0.42);
    if (to.mid && i === to.mid.at) await to.mid.run();
  }
}
async function landed(s, x, y, facing) {
  s.place('bramble', x, y, facing);
  s.ex.buildFollowers(true);
}
export const SCRIPTS = {
  'c4.underway.enter': async (s) => {
    s.set('g_underway_c4');
    if (!s.flag('c4_seen_underway')) {
      s.set('c4_seen_underway');
      s.chapter(4);
      await s.wait(0.3);
      await s.narrate('The rope ends in a round cavern. Carved pillars. A mossy stone. Faces in the walls, worn smooth.');
      await s.say('bramble', 'An Underway. Flintcomb dug all the way down to its own Underway.');
      await chime(s, {
        'captain-quarry': 'We never knew this was here. We just kept digging, and the floor fell in, and we kept digging.',
        ninefold: 'Every warren has one. I find that very reassuring. Somebody planned for visitors.',
        _: 'Somewhere below, water drips, very slowly, like a clock nobody needs.',
      });
      await chime(s, { 'jade-rabbit': 'The air is warm. On the Moon, warm air means the Palace kitchens. Here I do not know what it means.', pip: 'It\'s warm! Why is it warm? Underground is supposed to be cold.', tansy: 'Warm air, from below. Keep your ears up.', burdock: 'Hmph. Warm. Don\'t like warm rock.' });
      s.quest('Follow the old tube on down from Flintcomb\'s Underway.');
      s.save();
    } else s.ex.enterBubble();
  },
  'c4.rope-up': async (s) => {
    const c = await s.ask(null, 'Quarry\'s rope, back up to the lip of Flintcomb\'s hole.', ['Climb up.', 'Stay down here.']);
    if (c === 0) { s.sfx('scamper'); await s.warp('c4-warren', 'lip'); }
  },
  'c4.tubes.enter': async (s) => {
    if (!s.flag('c4_seen_tubes')) {
      s.set('c4_seen_tubes');
      await s.wait(0.3);
      await s.narrate('The tube is round and glassy, as if the rock was once poured, like honey, and set. It goes down. Everything here goes down.');
      await chime(s, { 'captain-quarry': 'Nobody dug this. No claw marks. Rock made this itself, a long time ago, when it was hot.', badger: 'Old. Older than my city, older than any city. Mind your feet.', mole: 'Oh my! It\'s like a drainpipe for a giant. A very tidy giant.', _: 'Warm air breathes up the tube, and out again.' });
      s.quest('Find the way down through the tubes.');
    } else s.ex.enterBubble();
  },
  'c4.fork1': async (s) => {
    await s.narrate('The tube splits. Beside one opening, on the rock, someone has scratched two small, neat letters, and two dots.');
    await s.narrate('A.S.');
    await chime(s, { 'captain-quarry': 'Not a Flintcomb mark. Ours are a claw and a line. Somebody else came down here, long before us.', tansy: 'Letters. Somebody wrote on the wall. Somebody wanted to be followed.', _: 'Somebody came this way before, and wanted to be followed.' });
    await chime(s, { 'cheshire-cat': 'If you don\'t know where you\'re going, any tube will take you there. If you do, follow the letters.', caterpillar: 'A. S. Who are THEY? Never mind. They knew the way. That is all one needs to know about anyone.', 'tin-woodman': 'I wonder if they were frightened. I think I would have been. They kept on, though.', ninefold: 'Somebody wrote their name so the dark would know them. How polite.', pip: 'What does A.S. stand for? Always Straight? Absolutely Super?' });
    s.quest('Follow the carved "A.S." at each fork in the tubes.');
  },
  'c4.as-mark': async (s) => {
    const n = (s.val('c4_as_read') || 0) + 1; s.set('c4_as_read', n);
    const lines = [
      'A.S., carved small and neat. The letters are worn, but whoever made them pressed hard.',
      'A.S. again. Under it, very faint, an arrow. Down.',
      'A.S. And a third scratch beside it, like a tally. This is the way.',
    ];
    await s.narrate(lines[Math.min(n, 3) - 1]);
  },
  'c4.gallery': async (s) => {
    await s.narrate('A round chamber, smooth as the inside of a shell. Every hop echoes. Then the echoes start to say things.');
    s.sfx('shimmer', { vol: 0.4 });
    await s.wait(0.5);
    await s.say('quarryman', '"...Is it true? The Captain went down the hole? On a ROPE?"');
    await s.say('doe', '"Shale says the hum\'s stopped. I can\'t stop listening for it. Is that silly?"');
    await s.say('kit', '"I\'m going to dig a garden. Up. Not down. A garden goes UP."');
    await s.narrate('Flintcomb voices, far above, carried down through the rock as clear as if they stood in the room.');
    if (s.member('captain-quarry')) {
      await s.say('captain-quarry', 'That\'s Flint. And Shale. And little Knot. They\'re... laughing.');
      await s.say('captain-quarry', 'I haven\'t heard Flintcomb laugh in a year. I had forgotten it could.');
      const c = await s.ask('bramble', 'Quarry presses his ear to the wall.', ['They\'ll be all right.', 'Do you want to say something to them?']);
      if (c === 0) await s.say('captain-quarry', 'Yes. They will. That\'s the thing I keep having to learn: they will, without me.');
      else { await s.say('captain-quarry', 'GARDENS UP, KNOT! GOOD LAD!'); await s.wait(0.6); await s.say('kit', '"...Did the wall just say something?"'); await s.say('captain-quarry', 'Hmph. Ha. Ha ha!'); }
    } else {
      await chime(s, { tansy: 'Flintcomb. They sound... ordinary. That\'s the best sound I\'ve heard all year.', _: 'They sound ordinary. Ordinary is the best sound in the world.' });
    }
  },
  'c4.hansbach': async (s) => {
    await s.narrate('A stream! Warm water runs out of the rock and along the tube, bubbling, talking to itself. It goes down too, of course.');
    await chime(s, { ratty: 'A stream! Oh, a stream, down here, all on its own. Hello, you. Where are you off to?', 'jade-rabbit': 'Drink, everyone. It is warm, and clean, and a little fizzy. Like moon-dew.', toad: 'Water! Splendid. I shall follow it. Toad follows rivers, rivers follow Toad. Poop-poop!', _: 'The water is warm, and a little fizzy.' });
    s.quest('Follow the stream down to wherever it goes.');
  },
  'c4.sea.enter': async (s) => {
    if (!s.flag('c4_seen_sea')) {
      s.set('c4_seen_sea');
      await s.wait(0.4);
      await s.picture('bg-sea', ['The tube opens, and the dark stops being dark.', 'A sea. A whole sea, under the world, under a sky of glowing cloud.', 'Waves come in, small and grey, and break on a beach of black sand.']);
      await s.say('bramble', '...', { mood: 'happy' });
      await chime(s, { ratty: 'A sea. I\'ve heard of the sea. I never, ever thought I\'d see one. And it\'s UNDERNEATH.', pip: 'Is that the sky? Why is the sky down here? Is it a different sky?', 'captain-quarry': 'All those years digging for something grand under the flint. Water, I said, or gold. And it was this.', _: 'The water goes on further than the eye can see.' });
      await chime(s, { mole: 'Oh, Ratty would weep. I very nearly am.', 'tin-woodman': 'I am weeping a little. It is all right. I have my oil-can.', ninefold: 'I have lived in the dark all my life and I never knew it had a seaside.', badger: 'Hmph. Big. Very big. Bigger than I like.' });
      s.quest('Find a way across the sea. Something is moored by the shore.');
    } else s.ex.enterBubble();
  },
  'c4.raft-first': async (s) => {
    if (s.flag('c4_crossed')) return;
    await s.narrate('A raft, moored to a rock: logs of some pale, hard wood lashed with old cord. Somebody built it, long ago, and left it for whoever came next.');
    await chime(s, { ratty: 'Believe me, my young friend, there is NOTHING half so much worth doing as simply messing about on rafts.', 'captain-quarry': 'Cord\'s rotten. Logs are good. I can lash it. Give me a moment.', _: 'The cord is old, but the logs are sound.' });
  },
  'c4.raft': async (s) => {
    const at = raftAt(), ie = s.flag('c4_raft_ie');
    if (at === 'w') {
      const c = await s.ask(null, 'Push off for the island in the middle of the sea?', ['Push off.', 'Not yet.']);
      if (c !== 0) return;
      s.sfx('water-step');
      await ride(s, LINE['w-iw'], { mid: { at: 4, run: () => monsters(s) } });
      s.set('c4_raft_i'); s.set('c4_raft_ie', false);
      await landed(s, 23, 20, 'se');
      if (!s.flag('c4_on_island')) { s.set('c4_on_island'); await s.narrate('The raft bumps onto a beach of warm sand. Steam drifts over the island in long white scarves.'); s.quest('Cross the island to its far side, and take the raft on east.'); }
      s.save();
    } else if (at === 'i' && !ie) {
      const c = await s.ask(null, 'Back to the west shore?', ['Row back.', 'Stay.']);
      if (c !== 0) return;
      await ride(s, LINE['w-iw'].slice().reverse(), {});
      s.set('c4_raft_i', false);
      await landed(s, 9, 20, 'nw');
    } else if (at === 'i' && ie) {
      const c = await s.ask(null, 'Push off east, for the far shore?', ['Push off.', 'Not yet.']);
      if (c !== 0) return;
      const first = !s.flag('c4_crossed');
      await ride(s, LINE['ie-e'], first ? { mid: { at: 3, run: () => storm(s) } } : {});
      s.ex._storm = false; s.ambience('storm', 0);
      s.set('c4_raft_e');
      await landed(s, 48, 20, 'se');
      if (first) {
        s.set('c4_crossed');
        await s.narrate('The storm blows itself out as suddenly as it came. The raft grinds onto sand. Everyone is soaked, and everyone is there.');
        await chime(s, { toad: 'I was not frightened. I was HOLDING ON, which is quite different, and very brave.', tansy: 'Everyone all right? Bramble? Pip? Count ears. Good.', 'captain-quarry': 'Hmph. I\'ve had worse days. Most of them this year.', _: 'Everyone is there.' });
        s.quest('Go on east, into the forest of giant mushrooms.');
        s.save();
      }
    } else if (at === 'e') {
      const c = await s.ask(null, 'Back across to the island?', ['Push off.', 'Stay.']);
      if (c !== 0) return;
      await ride(s, LINE['ie-e'].slice().reverse(), {});
      s.set('c4_raft_e', false); s.set('c4_raft_i'); s.set('c4_raft_ie');
      await landed(s, 33, 20, 'nw');
    }
  },
  'c4.island-east': async (s) => {
    if (s.flag('c4_raft_ie')) return;
    s.set('c4_raft_ie');
    await s.narrate('On the far side of the island, the raft is waiting: Quarry has carried it across on his back, grumbling, while everyone else watched the geysers.');
    if (s.member('captain-quarry')) await s.say('captain-quarry', 'Don\'t thank me. Carrying heavy things is the only thing I\'m sure I\'m good for.');
    await s.warp('c4-sea', 33, 20, 'se');
  },
  'c4.geyser': async (s) => {
    if (s.flag('c4_geyser')) return;
    s.set('c4_geyser');
    s.sfx('geyser'); s.shake(0.8, 3);
    await s.narrate('WHOOSH! The ground right beside Bramble splits into a roaring white column of steam and hot water.');
    await chime(s, { pip: 'IT WENT UP! The ground went UP! Again! Do it again!', toad: 'Poop-poop! A fountain! I shall have one installed at Toad Hall. Several.', 'cheshire-cat': 'How rude. It didn\'t even say anything first.', mole: 'Oh my whiskers! Is everyone still here? Everyone still here!', _: 'Everyone is drenched, and steaming gently.' });
  },
};
async function monsters(s) {
  if (s.flag('c4_monsters')) return;
  s.set('c4_monsters');
  s.spawn({ id: 'sea-monsters', sprite: 'sea-monsters', x: 22, y: 6, facing: 'sw' });
  s.shake(0.6, 2); s.sfx('splash-melt', { pitch: 0.5 });
  await s.narrate('Far out across the water, the sea humps up. Something huge rises: a long neck, a long jaw, a flipper like a sail.');
  await s.narrate('Two of them, great old sea-beasts, wrestling in the waves as if nobody had told them the world had moved on.');
  await chime(s, { tansy: 'Don\'t. Move. Nobody move. Nobody sneeze.', pip: 'Are they FIGHTING? Are they going to eat us? Are they friends?', 'captain-quarry': 'Paddle. Quietly. They\'re busy with each other.', _: 'Nobody breathes.' });
  for (let i = 0; i < 3; i++) { await s.move('sea-monsters', [[22 + i * 2, 6 - (i % 2)]], 0.6); s.sfx('splash-melt', { pitch: 0.4, vol: 0.5 }); }
  await s.narrate('They roll over, and over, and sink, and the sea smooths itself flat as if nothing had happened at all.');
  s.remove('sea-monsters');
  await chime(s, { 'tin-woodman': 'I do hope they weren\'t hurting each other. Perhaps they were only playing. Some people play very roughly.', ratty: 'I take back everything I ever said about pike.', _: '' });
}
async function storm(s) {
  s.ex._storm = true; s.ambience('storm', 0.6); s.shake(1.2, 3); s.sfx('rumble');
  await s.narrate('The glowing cloud goes dark. Then it goes bright, all at once, in a crack of light that makes every hair stand on end.');
  await s.narrate('A storm, underground, with nothing to stop it. The raft bucks. The wind howls round in circles.');
  if (s.flag('c4_needle')) {
    await s.say('captain-quarry', 'The needle! Look at my needle!');
    await s.narrate('Quarry\'s lodestone needle, which always points home to Flintcomb, spins, and spins, and stops: pointing straight back the other way.');
    await s.say('captain-quarry', 'It says Flintcomb\'s AHEAD of us. That\'s not right. That\'s backwards. Everything down here is backwards.');
    await s.say('bramble', 'Then we don\'t steer by the needle. We steer by the shore.');
  }
  await s.narrate('Something crackles out of the cloud: fat grey shapes, fizzing with light, like eels made of rain.');
  await s.battle('c4.storm');
  s.shake(0.6, 2);
}

const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export const ENCOUNTERS = {
  'c4.tb-1': { enemies: [['cave-lizard', 23, 1], ['cave-lizard', 23, 1], ['trilobite-swarm', 23]], bg: 'lidenbrock', tweak: hardy(1.6) },
  'c4.tb-2': { enemies: [['trilobite-swarm', 23, 1], ['cave-lizard', 23, 1], ['cave-lizard', 23]], bg: 'lidenbrock', tweak: hardy(1.6) },
  'c4.tb-3': { enemies: [['cave-lizard', 23, 2], ['trilobite-swarm', 23, 1], ['eel-cloud', 23]], bg: 'lidenbrock', tweak: hardy(1.6) },
  'c4.tb-4': { enemies: [['trilobite-swarm', 23, 1], ['eel-cloud', 23, 1], ['cave-lizard', 23]], bg: 'lidenbrock', tweak: hardy(1.6) },
  'c4.sea-1': { enemies: [['trilobite-swarm', 23, 1], ['trilobite-swarm', 23, 1], ['eel-cloud', 23, 1]], bg: 'lidenbrock', tweak: hardy(1.6) },
  'c4.sea-2': { enemies: [['cave-lizard', 24, 2], ['eel-cloud', 24, 1], ['cave-lizard', 24]], bg: 'lidenbrock', tweak: hardy(1.6) },
  'c4.sea-3': { enemies: [['eel-cloud', 24, 2], ['trilobite-swarm', 24, 1], ['trilobite-swarm', 24], ['cave-lizard', 24]], bg: 'lidenbrock', tweak: hardy(1.3) },
  'c4.storm': { enemies: [['eel-cloud', 24, 2], ['eel-cloud', 24, 1], ['eel-cloud', 24, 1], ['eel-cloud', 24]], bg: 'lidenbrock', story: true, intro: ['The eel-clouds crackle down onto the raft!'] },
};

export const MAPS = { 'c4-underway': underwayMap, 'c4-tubes': tubesMap, 'c4-sea': seaMap };
