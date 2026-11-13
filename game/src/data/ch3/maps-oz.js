// Oz: the Munchkin Country, the forest and the Kalidah ditch, the river, the poppy field and the Field Mice's court,
// the Emerald City and the palace, the Winkie Country and the Witch's castle, the Quadling south (Glinda, the
// Hammer-Heads' hill) and the China Country.
import { flag, hasItem } from '../../state.js';
import { grid, trimWalls, LEDGE } from './build.js';
import { G, W, H } from '../../core.js';
import { toScreen } from '../../engine/iso.js';

// a whirl of dust drawn in code over tile (tx, ty)
function whirl(c, ox, oy, tx, ty, size = 1) {
  const t = G.time;
  const p = toScreen(tx, ty, 0), cx = p.x + ox, cy = p.y + oy + 8;
  for (let i = 0; i < 46; i++) {
    const k = i / 46, a = t * (2.2 + k) + i * 2.4, r = (5 + k * 18) * size, yy = cy - k * 50 * size;
    c.fillStyle = i % 3 ? 'rgba(220,200,150,0.5)' : 'rgba(250,235,190,0.75)';
    c.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(yy + Math.sin(a) * r * 0.35), i % 4 === 0 ? 2 : 1, 1);
  }
}
const trees = (list) => list.map(([x, y]) => ['prop-oz-tree', x, y]);

// ---------------- c3-munchkin: the blue Munchkin Country, where the house came down
const MUN = (() => {
  const g = grid(28, 24, 'u');
  g.line([[9, 12], [27, 12]], 'b');                       // the road of yellow brick, eastward
  g.rect(5, 9, 10, 15, 'u');
  g.scatter('.', 30, 11, ['u']);
  g.blob(4, 19, 2, '~'); g.set(6, 20, '~');               // a little blue pond
  g.scatter(',', 8, 5, ['u'], [12, 2, 26, 22]);
  g.rect(0, 0, 27, 0, '.'); g.rect(0, 0, 0, 23, '.');
  return g.out();
})();

// ---------------- c3-forest: the road through the forest, the Tin Woodman's clearing, the Kalidah ditch
const FOR = (() => {
  const g = grid(36, 22, '.');
  g.scatter('G', 30, 3, ['.']);
  g.line([[0, 11], [35, 11]], 'b');
  g.rect(8, 4, 13, 9, 'w');                               // the woodman's clearing (chips everywhere)
  g.line([[10, 9], [10, 11]], '_');
  g.rect(0, 0, 35, 21, null, 1);                          // banks are one up...
  g.rect(24, 0, 26, 21, '~', 0);                          // ...the ditch, with a stream at the bottom
  return g.out();
})();

// ---------------- c3-river: the broad river, the Scarecrow on his pole, the Stork; the wildcat
const RIV = (() => {
  const g = grid(32, 24, '.');
  g.scatter('G', 24, 8, ['.']);
  g.rect(13, 0, 17, 23, '~');
  g.line([[0, 12], [12, 12]], 'b'); g.line([[18, 12], [31, 12]], 'b');
  g.rect(22, 4, 28, 8, 'p');                               // a few early poppies on the far bank
  g.scatter('.', 10, 4, ['p'], [22, 4, 28, 8]);
  return g.out();
})();

// ---------------- c3-poppies: the deadly poppy field, and the Field Mice's court in the grass beside it
const POP = (() => {
  const g = grid(34, 26, '.');
  g.rect(8, 3, 26, 22, 'p');
  g.blob(17, 12, 7, 'p');
  g.line([[0, 12], [33, 12]], 'b');
  g.rect(2, 17, 7, 23, 'G'); g.rect(3, 18, 6, 22, ',');   // the mice's court: a clover lawn
  g.rect(27, 8, 33, 16, '.');
  return g.out();
})();

// ---------------- c3-emerald: the Emerald City (inside the walls)
const EME = (() => {
  const g = grid(30, 32, 'g');
  g.rect(0, 0, 29, 1, '#'); g.rect(0, 0, 1, 31, '#'); g.rect(28, 0, 29, 31, '#'); g.rect(0, 30, 29, 31, '#');
  g.line([[15, 31], [15, 3]], 'b', 2);                     // the main street, south gate to palace
  g.line([[2, 16], [27, 16]], 'b');                        // the cross street: west gate (Winkies), east lane
  g.set(15, 31, 'b'); g.set(16, 31, 'b'); g.set(0, 16, 'b'); g.set(1, 16, 'b'); g.set(1, 26, 'b'); g.set(0, 26, 'b');
  g.line([[2, 26], [14, 26]], 'b');                        // the south-west lane to the Quadling gate
  g.rect(4, 4, 11, 10, 'k');                               // the market square
  g.rect(20, 20, 26, 26, 'k');                             // a little green square
  trimWalls(g);
  return g.out();
})();

// ---------------- c3-palace: the throne room
const PAL = (() => {
  const g = grid(16, 18, 'g');
  g.rect(0, 0, 15, 0, '#'); g.rect(0, 0, 0, 17, '#'); g.rect(15, 0, 15, 17, '#');
  g.line([[7, 17], [7, 3]], 'k', 2);
  g.rect(5, 2, 10, 5, 'k', 1);                             // the dais
  trimWalls(g);
  return g.out();
})();

// ---------------- c3-winkie: the yellow Winkie Country
const WIN = (() => {
  const g = grid(34, 26, 'y');
  g.scatter('.', 40, 21, ['y']);
  g.line([[33, 18], [20, 18], [20, 10], [8, 10], [8, 6]], '_');
  g.rect(2, 2, 13, 5, 'f');                                // the castle forecourt (back edge)
  g.rect(24, 3, 30, 7, null, 1); g.rect(25, 4, 29, 6, null, 2);   // a yellow hill
  return g.out();
})();

// ---------------- c3-castle: the Witch's castle hall
const CAS = (() => {
  const g = grid(20, 20, 'f');
  g.frame(0, 0, 19, 19, '#');
  g.set(10, 19, 'f'); g.set(11, 19, 'f');
  g.line([[10, 18], [10, 4]], 'y', 2);
  g.rect(3, 3, 7, 7, 'k');                                 // the scullery (the well)
  g.rect(13, 2, 17, 6, 'f', 1);                            // the Witch's dais
  trimWalls(g);
  return g.out();
})();

// ---------------- c3-south: the red Quadling Country, Glinda, the Hammer-Heads' hill, the China wall
const SOU = (() => {
  const g = grid(32, 28, '.');
  g.scatter('G', 30, 41, ['.']);
  g.line([[0, 14], [16, 14], [16, 22], [16, 26]], 'b');
  g.rect(13, 22, 19, 26, 'k');                             // Glinda's court
  g.rect(22, 2, 30, 10, null, 1); g.rect(24, 3, 29, 8, null, 2); g.rect(26, 4, 28, 6, null, 3);  // the Hammer-Heads' hill
  g.line([[16, 14], [24, 14], [24, 10]], '_');
  g.rect(4, 2, 10, 4, 'c');                                // the china wall's foot (the China Country is beyond)
  g.line([[7, 5], [7, 13]], '_');
  return g.out();
})();

// ---------------- c3-china: the China Country (china tiles: step on each only once)
// A winding china path from the wall to the Princess's lawn, with china houses and a few dead ends.
const CHI = (() => {
  const g = grid(22, 22, 'R', 0);                          // china flowerbeds all round (keep off!)
  const P = '.';
  g.rect(1, 18, 4, 20, P, 0);                              // where you climb down off the wall (safe grass)
  // the main path (one tile wide, sunk between the terraces), in order
  const path = [[4, 17], [5, 17], [6, 17], [6, 16], [6, 15], [7, 15], [8, 15], [9, 15], [9, 14], [9, 13], [8, 13], [7, 13], [6, 13], [6, 12], [6, 11],
    [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [12, 10], [12, 11], [12, 12], [13, 12], [14, 12], [15, 12], [15, 11], [15, 10], [15, 9],
    [15, 8], [14, 8], [13, 8], [13, 7], [13, 6], [13, 5], [14, 5], [15, 5]];
  for (const [x, y] of path) g.set(x, y, 'c', 0);
  // dead ends (tempting short cuts that only lead back over cracked china)
  for (const [x, y] of [[7, 17], [8, 17], [9, 17], [10, 15], [11, 15], [11, 14], [5, 11], [4, 11], [12, 13], [12, 14], [16, 9], [17, 9], [12, 6], [11, 6]]) g.set(x, y, 'c', 0);
  g.rect(16, 2, 20, 7, P, 0);                              // the Princess's lawn (safe)
  g.rect(18, 1, 19, 1, P, 0);
  g.rect(0, 0, 21, 0, ' '); g.rect(0, 0, 0, 21, ' '); g.rect(21, 0, 21, 21, ' '); g.rect(0, 21, 21, 21, ' ');
  g.set(1, 20, P, 0); g.set(19, 1, P, 0);
  return g.out();
})();

// the china folk and their cows, out in the china fields (never on the china path): people no taller than Bramble's
// ear (tinted porcelain, half size), little blue-spotted china cows; the folk cheer as Bramble goes carefully by
const FOLK = (id, sprite, x, y, facing) => ({ id, sprite, x, y, facing, china: true, scale: 0.6, tintCol: '#f2f5ff', tintAmt: 0.35 });
const COW = (id, x, y, facing) => ({ id, sprite: 'china-cow', x, y, facing });
const CHINA_FOLK = [
  FOLK('cf-milkmaid', 'china-princess', 5, 16, 'ne'), FOLK('cf-shepherd', 'munchkin', 8, 14, 'sw'), FOLK('cf-lady', 'china-princess', 7, 11, 'se'),
  FOLK('cf-boy', 'munchkin', 10, 11, 'sw'), FOLK('cf-girl', 'china-princess', 14, 11, 'se'), FOLK('cf-clown', 'munchkin', 16, 10, 'sw'),
  FOLK('cf-baker', 'munchkin', 14, 7, 'sw'), FOLK('cf-dancer', 'china-princess', 12, 4, 'se'),
  COW('cc-1', 2, 9, 'se'), COW('cc-2', 2, 12, 'sw'), COW('cc-3', 10, 18, 'se'), COW('cc-4', 12, 19, 'sw'),
  COW('cc-5', 17, 17, 'sw'), COW('cc-6', 18, 10, 'se'), COW('cc-7', 9, 3, 'se'), COW('cc-8', 11, 2, 'sw'),
];
function chinaCheer(ex, dt) {
  const b = ex.b; if (!b) return;
  for (const a of ex.map.actors) {
    if (!a.china) continue;
    if (a._cheer > 0) { a._cheer -= dt; if (a._cheer <= 0) a.emote = null; continue; }
    if (a._cool > 0) { a._cool -= dt; continue; }
    if (Math.hypot(a.x - b.x, a.y - b.y) <= 2.6) { a.emote = (a.id.length % 2) ? 'heart' : '!'; a._cheer = 1.4; a._cool = 6; a.facing = b.x >= a.x ? (b.y >= a.y ? 'se' : 'ne') : (b.y >= a.y ? 'sw' : 'nw'); }
  }
}

// ---------------- c3-stair: the Stair of Eyes (Wheatsheaf's layer 3)
const STA = (() => {
  const g = grid(30, 30, '%');
  // the stair winds down: height 3 at the top, a long switchback, a landing, more stair, the bottom hall
  const seg = (pts, h) => g.line(pts, 'o', 2, h);
  seg([[2, 2], [9, 2]], 3);
  seg([[9, 2], [9, 7]], 2);
  seg([[9, 7], [3, 7]], 2);
  seg([[3, 7], [3, 12]], 1);
  g.rect(3, 12, 10, 16, 'a', 1);                           // the landing (the light dims if you stand still)
  seg([[10, 14], [17, 14]], 1);
  seg([[17, 14], [17, 20]], 0);
  seg([[17, 20], [12, 20]], 0);
  g.rect(9, 20, 13, 23, 'o', 0);
  seg([[11, 23], [11, 25]], 0);
  g.rect(14, 22, 27, 28, 'a', 0);                          // the Watcher's hall
  g.line([[12, 24], [14, 24]], 'o', 2, 0);
  // smooth the heights along the stair so each hop is one step
  const H = (x, y, h) => g.set(x, y, null, h);
  for (let x = 2; x <= 10; x++) for (const y of [2, 3]) H(x, y, x < 6 ? 3 : 2);
  for (let y = 2; y <= 8; y++) for (const x of [9, 10]) H(x, y, 2);
  for (let x = 3; x <= 10; x++) for (const y of [7, 8]) H(x, y, x < 6 ? 1 : 2);
  for (let y = 7; y <= 12; y++) for (const x of [3, 4]) H(x, y, 1);
  for (let x = 10; x <= 18; x++) for (const y of [14, 15]) H(x, y, x < 14 ? 1 : 0);
  trimWalls(g, '%');
  return g.out();
})();

export const ozMaps = {
  'c3-munchkin': {
    name: 'The Munchkin Country', world: 'oz', area: 'oz', battle: 'oz-road', music: 'm-oz', ambience: [['wind', 0.15]],
    tiles: MUN.tiles, heights: MUN.heights,
    entries: { landing: [8, 12, 'se'], west: [4, 12, 'se'], east: [26, 12, 'nw'] },
    props: [
      { id: 'prop-rabbit-house', x: 5, y: 7, w: 3, h: 1, whole: true },
      ['prop-brick-bits', 9, 13], ['prop-brick-bits', 11, 11],
      ['prop-munchkin-house', 14, 3, 2, 2], ['prop-munchkin-house', 20, 4, 2, 2], ['prop-munchkin-house', 14, 17, 2, 2], ['prop-munchkin-house', 21, 17, 2, 2],
      ['prop-munchkin-fence', 13, 6], ['prop-munchkin-fence', 14, 6], ['prop-munchkin-fence', 16, 6], ['prop-munchkin-fence', 19, 7], ['prop-munchkin-fence', 22, 7],
      ['prop-munchkin-fence', 13, 16], ['prop-munchkin-fence', 17, 16], ['prop-munchkin-fence', 20, 16], ['prop-munchkin-fence', 23, 16],
      ...trees([[2, 3], [1, 8], [3, 15], [8, 21], [12, 22], [25, 2], [26, 7], [26, 19], [18, 21], [10, 2]]),
      ['prop-dandelions', 12, 14], ['prop-rose-bush', 23, 10], ['prop-signpost', 25, 11],
    ],
    npcs: [
      { id: 'good-witch', x: 10, y: 10, facing: 'sw', talk: 'c3.goodwitch.talk' },
      { id: 'c3-munch-1', sprite: 'munchkin', x: 12, y: 9, facing: 'sw', talk: 'c3.munchkin.1' },
      { id: 'c3-munch-2', sprite: 'munchkin', x: 13, y: 14, facing: 'nw', talk: 'c3.munchkin.2' },
      { id: 'c3-munch-3', sprite: 'munchkin', x: 18, y: 9, facing: 'sw', talk: 'c3.munchkin.3' },
      { id: 'c3-munch-4', sprite: 'munchkin', x: 22, y: 14, facing: 'nw', talk: 'c3.munchkin.4' },
    ],
    doors: [
      { x: 27, y: 12, to: 'c3-forest', entry: 'west', locked: () => !flag('c3_kissed'), lockedRun: 'c3.munchkin.notyet' },
    ],
    triggers: [
      { x: 2, y: 12, w: 1, h: 1, run: 'c3.oz.whirlback' },
      { x: 25, y: 11, use: true, run: 'c3.munchkin.sign' },
    ],
    chests: [{ id: 'c3-mun-c1', x: 2, y: 22, give: { buttons: 150, 'emerald-lozenge': 1 } }],
    onEnter: 'c3.munchkin.enter',
    drawOver(ex, c, ox, oy) { whirl(c, ox, oy, 2, 12, 0.7); },
  },

  'c3-forest': {
    name: 'The Forest by the Road', world: 'oz', area: 'oz', battle: 'oz-road', music: 'm-oz', ambience: [['wind', 0.25]], dark: 0.12,
    tiles: FOR.tiles, heights: FOR.heights,
    entries: { west: [1, 11, 'se'], east: [34, 11, 'nw'], clearing: [10, 10, 'ne'], ditch: [22, 11, 'se'] },
    get props() {
      const p = [
        ...trees([[2, 3], [4, 6], [1, 15], [3, 18], [6, 2], [6, 16], [7, 19], [12, 15], [14, 2], [15, 7], [16, 17], [18, 4], [19, 14], [20, 8], [21, 19], [22, 2],
          [28, 4], [30, 8], [29, 15], [32, 18], [33, 3], [31, 1], [14, 19], [5, 9], [17, 9]]),
        ['prop-hollow-log', 11, 6, 2, 1], ['prop-table', 9, 5], ['prop-fallen-rock', 18, 16, 2, 2],
        ['prop-ditch-rock', 23, 9], ['prop-ditch-rock', 23, 13], ['prop-ditch-rock', 27, 9], ['prop-ditch-rock', 27, 13],
        { id: 'prop-tree-bridge', x: 24, y: 11, w: 3, h: 1, ground: true },
      ];
      return p;
    },
    npcs: [
      { id: 'tin-woodman', x: 12, y: 8, facing: 'sw', talk: 'c3.tin.talk', cond: () => !flag('g_recruit_tin-woodman') },
      { id: 'cowardly-lion', x: 20, y: 10, facing: 'sw', talk: 'c3.lion.talk', cond: () => flag('g_recruit_tin-woodman') && !flag('c3_chaseDone') },
    ],
    enemies: [
      { id: 'c3-for-1', type: 'kalidah', sprite: 'kalidah', x: 5, y: 13, loop: [[5, 13], [5, 16], [2, 16], [2, 13]], encounter: 'c3.kalidah-1' },
      { id: 'c3-for-2', type: 'crow-west', sprite: 'crow-west', x: 16, y: 12, loop: [[16, 12], [16, 14], [20, 14], [20, 12]], encounter: 'c3.road-1' },
      { id: 'c3-for-3', type: 'kalidah', sprite: 'kalidah', x: 31, y: 13, loop: [[31, 13], [31, 16], [28, 16], [28, 13]], encounter: 'c3.kalidah-2' },
    ],
    doors: [
      { x: 0, y: 11, to: 'c3-munchkin', entry: 'east' },
      { x: 35, y: 11, to: 'c3-river', entry: 'west' },
    ],
    triggers: [
      { x: 9, y: 5, use: true, run: 'c3.tin.oilcan' },
      { x: 23, y: 0, w: 1, h: 22, run: 'c3.ditch.edge', cond: () => !flag('c3_chaseDone') },
    ],
    chests: [{ id: 'c3-for-c1', x: 2, y: 20, give: { buttons: 160, dandelion: 2 } }, { id: 'c3-for-c2', x: 33, y: 20, give: { 'pluck-berry': 2, buttons: 120 } }],
    onEnter: 'c3.forest.enter',
  },

  'c3-river': {
    name: 'The River', world: 'oz', area: 'oz', battle: 'oz-road', music: 'm-oz', ambience: [['river', 0.45]],
    tiles: RIV.tiles, heights: RIV.heights,
    entries: { west: [1, 12, 'se'], east: [30, 12, 'nw'] },
    props: [
      { id: 'prop-raft', x: 13, y: 12, w: 2, h: 2, ground: true }, { id: 'prop-raft', x: 15, y: 12, w: 2, h: 2, ground: true }, { id: 'prop-raft', x: 17, y: 12, w: 1, h: 1, ground: true },
      { id: 'prop-scarecrow-pole', x: 15, y: 8, cond: () => !flag('c3_storkDone') },
      ...trees([[3, 3], [6, 18], [9, 2], [10, 20], [21, 2], [24, 19], [29, 4], [28, 20], [2, 21], [20, 22]]),
      ['prop-reeds', 12, 9], ['prop-reeds', 12, 16], ['prop-reeds', 18, 7], ['prop-reeds', 18, 17], ['prop-reeds', 12, 4],
      ['prop-rose-bush', 23, 5], ['prop-rose-bush', 26, 7], ['prop-hollow-log', 22, 15, 2, 1],
    ],
    npcs: [
      { id: 'scarecrow', x: 15, y: 8, facing: 'sw', talk: 'c3.scarecrow.pole', cond: () => !flag('c3_storkDone') },
      { id: 'stork', x: 11, y: 7, facing: 'ne', talk: 'c3.stork.talk', cond: () => !flag('c3_storkDone') },
    ],
    enemies: [
      { id: 'c3-riv-1', type: 'wolf-west', sprite: 'wolf-west', x: 6, y: 15, loop: [[6, 15], [9, 15], [9, 17], [6, 17]], encounter: 'c3.road-2' },
      { id: 'c3-riv-2', type: 'crow-west', sprite: 'crow-west', x: 25, y: 10, loop: [[25, 10], [28, 10], [28, 9], [25, 9]], encounter: 'c3.road-1' },
    ],
    doors: [
      { x: 0, y: 12, to: 'c3-forest', entry: 'east' },
      { x: 31, y: 12, to: 'c3-poppies', entry: 'west' },
    ],
    triggers: [
      { x: 13, y: 12, w: 1, h: 2, run: 'c3.river.raft', cond: () => !flag('c3_storkDone') },
      { x: 21, y: 0, w: 1, h: 24, run: 'c3.wildcat', cond: () => flag('c3_storkDone') && !flag('c3_mouseSaved') },
    ],
    chests: [{ id: 'c3-riv-c1', x: 30, y: 22, give: { buttons: 180, 'carrot-cake': 1 } }],
    onEnter: 'c3.river.enter',
  },

  'c3-poppies': {
    name: 'The Poppy Field', world: 'oz', area: 'oz', battle: 'oz-road', music: 'm-oz', ambience: [['wind', 0.2]],
    tiles: POP.tiles, heights: POP.heights,
    entries: { west: [1, 12, 'se'], east: [32, 12, 'nw'], court: [5, 19, 'se'], woke: [29, 12, 'sw'] },
    props: [
      ['prop-poppies', 10, 8], ['prop-poppies', 13, 5], ['prop-poppies', 19, 6], ['prop-poppies', 23, 9], ['prop-poppies', 11, 17], ['prop-poppies', 16, 19],
      ['prop-poppies', 22, 17], ['prop-poppies', 25, 14], ['prop-poppies', 14, 15], ['prop-poppies', 20, 15], ['prop-poppies', 9, 14], ['prop-poppies', 24, 4],
      ['prop-mouse-throne', 4, 18], ['prop-rest-stone', 7, 22], ['prop-dandelions', 2, 21],
      ...trees([[2, 3], [5, 6], [29, 3], [31, 20], [28, 23], [1, 15]]),
      ['prop-signpost', 31, 11],
    ],
    npcs: [
      { id: 'mouse-queen', x: 4, y: 19, facing: 'se', talk: 'c3.mousequeen.court', cond: () => flag('g_recruit_mouse-queen') },
      { id: 'c3-mouse-1', sprite: 'caroller', x: 6, y: 18, facing: 'sw', talk: 'c3.mouse.1', cond: () => flag('g_recruit_mouse-queen') },
      { id: 'c3-mouse-2', sprite: 'caroller', x: 3, y: 21, facing: 'ne', talk: 'c3.mouse.2', cond: () => flag('g_recruit_mouse-queen') },
    ],
    doors: [
      { x: 0, y: 12, to: 'c3-river', entry: 'east' },
      { x: 33, y: 12, to: 'c3-emerald', entry: 'south' },
    ],
    triggers: [
      { x: 13, y: 0, w: 1, h: 26, run: 'c3.poppies.sleep', cond: () => !flag('c3_poppiesDone') },
      { x: 7, y: 22, use: true, run: 'c3.rest' },
      { x: 31, y: 11, use: true, run: 'c3.poppies.sign' },
    ],
    chests: [{ id: 'c3-pop-c1', x: 2, y: 23, give: { buttons: 200, 'emerald-lozenge': 1 } }],
    onEnter: 'c3.poppies.enter',
  },

  'c3-emerald': {
    name: 'The Emerald City', world: 'oz', area: 'emerald', battle: 'emerald', music: 'm-oz', ambience: [['hearth', 0.1]],
    legend: LEDGE, tiles: EME.tiles, heights: EME.heights,
    entries: { south: [15, 29, 'ne'], palace: [15, 5, 'se'], west: [2, 16, 'se'], quadling: [2, 26, 'se'], monkeys: [15, 18, 'se'] },
    props: [
      { id: 'prop-emerald-gate', x: 14, y: 1, w: 3, h: 1, whole: true },
      ['prop-city-column', 13, 4], ['prop-city-column', 18, 4], ['prop-city-column', 13, 9], ['prop-city-column', 18, 9], ['prop-city-column', 13, 22], ['prop-city-column', 18, 22],
      ['prop-store-counter', 6, 4, 2, 1], ['prop-drink-stand', 9, 4], ['prop-lantern', 4, 10], ['prop-lantern', 11, 10],
      ['prop-oz-tree', 22, 21], ['prop-oz-tree', 25, 25], ['prop-oz-tree', 21, 25], ['prop-dandelions', 23, 23],
      ['prop-munchkin-house', 4, 19, 2, 2], ['prop-munchkin-house', 8, 20, 2, 2], ['prop-munchkin-house', 22, 5, 2, 2], ['prop-munchkin-house', 23, 10, 2, 2],
      ['prop-munchkin-house', 4, 28, 2, 1], ['prop-munchkin-house', 23, 28, 2, 1],
      ['prop-lantern', 13, 28], ['prop-lantern', 18, 29], ['prop-lantern', 3, 15], ['prop-lantern', 26, 15],
    ],
    npcs: [
      { id: 'guardian', x: 17, y: 28, facing: 'nw', talk: 'c3.guardian.talk' },
      { id: 'c3-trader', sprite: 'munchkin', x: 7, y: 5, facing: 'se', talk: 'c3.market' },
      { id: 'c3-citizen-1', sprite: 'munchkin', x: 21, y: 16, facing: 'sw', talk: 'c3.citizen.1' },
      { id: 'c3-citizen-2', sprite: 'munchkin', x: 10, y: 24, facing: 'se', talk: 'c3.citizen.2' },
      { id: 'scarecrow', x: 17, y: 6, facing: 'sw', talk: 'c3.scarecrow.city', cond: () => flag('c3_humbug') },
      { id: 'cowardly-lion', x: 12, y: 17, facing: 'se', talk: 'c3.lion.city', cond: () => flag('c3_chaseDone') },
      { id: 'mouse-queen', x: 24, y: 23, facing: 'sw', talk: 'c3.mousequeen.city', cond: () => flag('g_recruit_mouse-queen') && flag('c3_witchMelted') },
      { id: 'monkey-king', x: 20, y: 18, facing: 'sw', talk: 'c3.monkey.city', cond: () => flag('g_recruit_monkey-king') },
    ],
    doors: [
      { x: 15, y: 30, to: 'c3-poppies', entry: 'east' }, { x: 16, y: 30, to: 'c3-poppies', entry: 'east' },
      { x: 15, y: 2, to: 'c3-palace', entry: 'door', locked: () => !flag('c3_specs'), lockedRun: 'c3.palace.nospecs' },
      { x: 0, y: 16, to: 'c3-winkie', entry: 'east', locked: () => !flag('c3_wizardMet'), lockedRun: 'c3.westgate.notyet' },
      { x: 0, y: 26, to: 'c3-south', entry: 'north', locked: () => !flag('c3_humbug'), lockedRun: 'c3.southgate.notyet' },
    ],
    chests: [{ id: 'c3-eme-c1', x: 26, y: 27, give: { buttons: 220, 'emerald-lozenge': 2 } }],
    onEnter: 'c3.emerald.enter',
  },

  'c3-palace': {
    name: 'The Throne Room', world: 'oz', area: 'emerald', battle: 'emerald', music: () => flag('c3_humbug') ? 'm-oz' : 'm-deep', ambience: [['drone-bed', 0.2]],
    legend: LEDGE, tiles: PAL.tiles, heights: PAL.heights,
    entries: { door: [7, 15, 'ne'] },
    props: [
      ['prop-green-throne', 7, 3], ['prop-city-column', 3, 3], ['prop-city-column', 12, 3], ['prop-city-column', 3, 9], ['prop-city-column', 12, 9], ['prop-city-column', 3, 14], ['prop-city-column', 12, 14],
      { id: 'prop-palace-screen', x: 10, y: 2, w: 2, h: 1 },
      ['prop-lantern', 5, 6], ['prop-lantern', 10, 6],
    ],
    npcs: [
      { id: 'great-head', x: 7, y: 4, facing: 'se', talk: 'c3.wizard.talk', cond: () => !flag('c3_humbug') },
      { id: 'wizard', x: 8, y: 4, facing: 'se', talk: 'c3.wizard.after', cond: () => flag('c3_humbug') },
    ],
    doors: [{ x: 7, y: 17, to: 'c3-emerald', entry: 'palace' }, { x: 8, y: 17, to: 'c3-emerald', entry: 'palace' }],
    onEnter: 'c3.palace.enter',
  },

  'c3-winkie': {
    name: 'The Winkie Country', world: 'oz', area: 'winkie', battle: 'winkie', music: () => flag('c3_witchMelted') ? 'm-oz' : 'm-wildwood', ambience: [['wind', 0.35]],
    tiles: WIN.tiles, heights: WIN.heights,
    entries: { east: [32, 18, 'nw'], castle: [8, 6, 'se'] },
    props: [
      { id: 'prop-winkie-tower', x: 3, y: 0, w: 2, h: 2, whole: true }, { id: 'prop-winkie-tower', x: 11, y: 0, w: 2, h: 2, whole: true },
      ['prop-winkie-pillar', 6, 2], ['prop-winkie-pillar', 10, 2],
      ['prop-oz-tree', 17, 3], ['prop-oz-tree', 30, 11], ['prop-oz-tree', 2, 14], ['prop-oz-tree', 12, 21], ['prop-oz-tree', 27, 23], ['prop-oz-tree', 5, 22],
      ['prop-chalk-boulder', 23, 14], ['prop-chalk-boulder', 15, 7], ['prop-gorse', 27, 15], ['prop-gorse', 18, 21], ['prop-wash-bucket', 13, 5],
    ],
    npcs: [
      { id: 'c3-winkie-1', sprite: 'winkie', x: 9, y: 4, facing: 'se', talk: 'c3.winkie.1' },
      { id: 'c3-winkie-2', sprite: 'winkie', x: 22, y: 20, facing: 'nw', talk: 'c3.winkie.2', cond: () => flag('c3_witchMelted') },
    ],
    enemies: [
      { id: 'c3-win-1', type: 'wolf-west', sprite: 'wolf-west', x: 27, y: 17, loop: [[27, 17], [27, 20], [24, 20], [24, 17]], encounter: 'c3.wolves', cond: () => !flag('c3_witchMelted') },
      { id: 'c3-win-2', type: 'crow-west', sprite: 'crow-west', x: 20, y: 13, loop: [[20, 13], [23, 13], [23, 11], [21, 11]], encounter: 'c3.crows', cond: () => !flag('c3_witchMelted') },
      { id: 'c3-win-3', type: 'winkie-guard', sprite: 'winkie-guard', x: 14, y: 11, loop: [[14, 11], [14, 13], [11, 13], [11, 11]], encounter: 'c3.winkies-1', cond: () => !flag('c3_witchMelted') },
      { id: 'c3-win-4', type: 'winkie-guard', sprite: 'winkie-guard', x: 6, y: 9, loop: [[6, 9], [4, 9], [4, 12], [6, 12]], encounter: 'c3.winkies-2', cond: () => !flag('c3_witchMelted') },
      { id: 'c3-win-5', type: 'wolf-west', sprite: 'wolf-west', x: 27, y: 7, still: true, encounter: 'c3.winkies-3', cond: () => !flag('c3_witchMelted') },
    ],
    doors: [
      { x: 33, y: 18, to: 'c3-emerald', entry: 'west' },
      { x: 8, y: 5, to: 'c3-castle', entry: 'door' },
    ],
    chests: [{ id: 'c3-win-c1', x: 27, y: 5, give: { buttons: 260, 'tin-vest+4': 1 } }, { id: 'c3-win-c2', x: 2, y: 24, give: { buttons: 180, dandelion: 2 } }],
    onEnter: 'c3.winkie.enter',
  },

  'c3-castle': {
    name: 'The Witch\'s Castle', world: 'oz', area: 'winkie', battle: 'winkie', dark: 0.15, music: () => flag('c3_witchMelted') ? 'm-oz' : 'm-deep', ambience: [['drone-bed', 0.25]],
    legend: LEDGE, tiles: CAS.tiles, heights: CAS.heights,
    entries: { door: [10, 17, 'ne'] },
    props: [
      ['prop-winkie-pillar', 8, 9], ['prop-winkie-pillar', 13, 9], ['prop-winkie-pillar', 8, 14], ['prop-winkie-pillar', 13, 14],
      ['prop-witch-cupboard', 17, 2], ['prop-cauldron', 4, 4], ['prop-mortar', 6, 3],
      { id: 'prop-wash-bucket', x: 9, y: 17, cond: () => !flag('c3_pail1') }, { id: 'prop-wash-bucket', x: 12, y: 17, cond: () => !flag('c3_pail2') },
      { id: 'prop-golden-cap', x: 16, y: 2, cond: () => flag('c3_witchMelted') && !flag('c3_cap') },
      ['prop-lantern', 3, 7], ['prop-lantern', 16, 7], ['prop-rest-stone', 2, 17],   // fullrun run 2: a rest stone by the castle door (three Winkie fights, then the Witch; no rest anywhere in between: lost once)
    ],
    npcs: [
      { id: 'wicked-witch', x: 15, y: 4, facing: 'sw', talk: 'c3.witch.talk', cond: () => !flag('c3_witchMelted') },
      { id: 'c3-winkie-3', sprite: 'winkie', x: 5, y: 6, facing: 'se', talk: 'c3.winkie.3' },
    ],
    doors: [{ x: 10, y: 19, to: 'c3-winkie', entry: 'castle' }, { x: 11, y: 19, to: 'c3-winkie', entry: 'castle' }],
    triggers: [{ x: 2, y: 17, use: true, run: 'c3.rest' },
      { x: 9, y: 17, use: true, run: 'c3.pail.1', cond: () => !flag('c3_pail1') },
      { x: 12, y: 17, use: true, run: 'c3.pail.2', cond: () => !flag('c3_pail2') },
      { x: 4, y: 4, use: true, run: 'c3.well' },
      { x: 17, y: 2, use: true, run: 'c3.cupboard' },
      { x: 16, y: 2, use: true, run: 'c3.cupboard', cond: () => flag('c3_witchMelted') && !flag('c3_cap') },
    ],
    onEnter: 'c3.castle.enter',
  },

  'c3-south': {
    name: 'The Quadling Country', world: 'oz', area: 'south', battle: 'oz-road', music: 'm-oz', ambience: [['wind', 0.15]],
    tiles: SOU.tiles, heights: SOU.heights,
    entries: { north: [1, 14, 'se'], glinda: [16, 21, 'se'], china: [7, 6, 'se'], hill: [24, 11, 'ne'] },
    props: [
      ['prop-hedge', 13, 21], ['prop-hedge', 19, 21], ['prop-rose-bush', 13, 25], ['prop-rose-bush', 19, 25], ['prop-lantern', 14, 22], ['prop-lantern', 18, 22],
      ['prop-china-house', 5, 1], ['prop-china-house', 9, 1], ['prop-fence', 3, 3], ['prop-fence', 11, 3],
      ['prop-oz-tree', 2, 6], ['prop-oz-tree', 12, 9], ['prop-oz-tree', 3, 22], ['prop-oz-tree', 8, 25], ['prop-oz-tree', 25, 20], ['prop-oz-tree', 29, 25], ['prop-oz-tree', 20, 5],
      ['prop-chalk-boulder', 23, 6], ['prop-chalk-boulder', 29, 3], ['prop-rose-bush', 10, 18], ['prop-rose-bush', 22, 16], ['prop-signpost', 15, 13],
    ],
    npcs: [
      { id: 'glinda', x: 16, y: 24, facing: 'nw', talk: 'c3.glinda.talk' },
    ],
    enemies: [
      { id: 'c3-sou-1', type: 'hammer-head', sprite: 'hammer-head', x: 25, y: 6, still: true, encounter: 'c3.hammer-1', once: true },
      { id: 'c3-sou-2', type: 'hammer-head', sprite: 'hammer-head', x: 27, y: 5, still: true, encounter: 'c3.hammer-2', once: true },
    ],
    doors: [
      { x: 0, y: 14, to: 'c3-emerald', entry: 'quadling' },
      { x: 7, y: 4, to: 'c3-china', entry: 'wall' },
    ],
    triggers: [{ x: 15, y: 13, use: true, run: 'c3.south.sign' }],
    chests: [{ id: 'c3-sou-c1', x: 27, y: 4, give: { buttons: 300, 'acorn-cap+4': 1 } }, { id: 'c3-sou-c2', x: 30, y: 26, give: { buttons: 150, 'emerald-lozenge': 1 } }],
    onEnter: 'c3.south.enter',
  },

  'c3-china': {
    name: 'The Dainty China Country', world: 'oz', area: 'south', battle: 'oz-road', music: 'm-oz', merge: true, sky: '#d8e8f8',
    tiles: CHI.tiles, heights: CHI.heights, legend: { R: { k: 'poppy', walk: 0 } },
    entry: [3, 19, 'ne'],
    entries: { wall: [3, 19, 'ne'], lawn: [18, 4, 'sw'] },
    props: [
      ['prop-china-house', 2, 3], ['prop-china-house', 3, 7], ['prop-china-house', 9, 6], ['prop-china-house', 4, 14], ['prop-china-house', 18, 15], ['prop-china-house', 14, 17],
      ['prop-china-house', 20, 13], ['prop-china-house', 20, 7], ['prop-fence', 1, 17], ['prop-fence', 2, 17],
      ['prop-rose-bush', 17, 2], ['prop-dandelions', 20, 4], ['prop-lantern', 16, 7],
    ],
    npcs: [
      { id: 'china-princess', x: 18, y: 3, facing: 'sw', talk: 'c3.princess.talk' },
      ...CHINA_FOLK,
    ],
    update(ex, dt) { chinaCheer(ex, dt); },
    doors: [
      { x: 1, y: 20, to: 'c3-south', entry: 'china' },
      { x: 19, y: 1, to: 'c3-south', entry: 'china', cond: () => flag('c3_princessMet') },
    ],
    onEnter: 'c3.china.enter',
  },

  'c3-stair': {
    name: 'The Stair of Eyes', world: 'depths', area: 'stair', battle: 'stair', dark: 0.45, music: 'm-deep', ambience: [['drone-bed', 0.4], ['hum', 0.15]],
    legend: LEDGE, tiles: STA.tiles, heights: STA.heights,
    entries: { top: [3, 2, 'se'], landing: [6, 14, 'se'], hall: [16, 24, 'se'] },
    props: [
      ['prop-stone-face', 2, 4], ['prop-stone-face', 8, 4], ['prop-carved-pillar', 11, 6], ['prop-stone-face', 2, 9], ['prop-carved-pillar', 5, 9],
      ['prop-stone-face', 9, 12], ['prop-carved-pillar', 3, 16], ['prop-stone-face', 12, 16], ['prop-carved-pillar', 16, 13], ['prop-stone-face', 19, 17],
      ['prop-carved-pillar', 15, 19], ['prop-stone-face', 9, 22], ['prop-carved-pillar', 14, 27], ['prop-carved-pillar', 26, 22], ['prop-stone-face', 20, 22],
      ['prop-rest-stone', 13, 23], ['prop-glow-crystal', 27, 28], ['prop-glow-crystal', 6, 12],
    ],
    npcs: [
      { id: 'watcher', x: 22, y: 25, facing: 'sw', talk: 'c3.watcher.talk', cond: () => !flag('c3_watcherDone') },
    ],
    enemies: [
      { id: 'c3-sta-1', type: 'late-footstep', sprite: 'late-footstep', x: 9, y: 4, loop: [[9, 4], [9, 6], [10, 6], [10, 4]], encounter: 'c3.stair-1' },
      { id: 'c3-sta-2', type: 'shut-eye', sprite: 'shut-eye', x: 8, y: 15, loop: [[8, 15], [8, 13], [6, 13], [6, 15]], encounter: 'c3.stair-2' },
      { id: 'c3-sta-3', type: 'late-footstep', sprite: 'late-footstep', x: 17, y: 18, loop: [[17, 18], [18, 18], [18, 16], [17, 16]], encounter: 'c3.stair-3' },
    ],
    doors: [
      { x: 2, y: 2, to: 'c3-underway', entry: 'stair' },
      { x: 27, y: 25, to: 'c3-underway', entry: 'stair', cond: () => flag('c3_watcherDone') },
    ],
    triggers: [
      { x: 13, y: 23, use: true, run: 'c3.rest' },
      { x: 3, y: 12, w: 2, h: 1, run: 'c3.stair.landing', once: true },
    ],
    chests: [{ id: 'c3-sta-c1', x: 10, y: 16, give: { buttons: 250, 'glow-mushroom': 1 } }],
    onEnter: 'c3.stair.enter',
    // footsteps that land a beat too late, and a landing whose light dims while you stand still
    onHop(ex, x, y) { setTimeout(() => { if (G.data && ex.map && ex.map.id === 'c3-stair') import('../../engine/audio.js').then(m => m.audio.sfx('hop-2', { vol: 0.18, pitch: 0.8 })); }, 520); },
    drawOver(ex, c) {
      const onLanding = ex.b && ex.b.x >= 3 && ex.b.x <= 10 && ex.b.y >= 12 && ex.b.y <= 16;
      ex._dim = onLanding && !ex.busy ? Math.min(0.7, (ex._dim || 0) + (ex.standStill > 1.5 ? 0.004 : -0.02)) : Math.max(0, (ex._dim || 0) - 0.02);
      if (ex._dim > 0) { c.fillStyle = `rgba(6,6,14,${ex._dim.toFixed(3)})`; c.fillRect(0, 0, W, H); }
    },
    gazeState(ex) { return { dim: +(ex._dim || 0).toFixed(2) }; },
  },
};
