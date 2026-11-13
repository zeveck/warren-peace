// Wonderland maps: the Hall of Doors, the Pool of Tears and the Caucus shore, the White Rabbit's lane and house,
// the Caterpillar's mushroom wood, the Duchess's kitchen, the Mad Tea-Party, the Queen's garden.
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { mk, box, dot, oval, line, speckle, bake, label, glow, chest, setTile } from './util.js';

const GLASS_TABLE = 'prop-glass-table', TEA_TABLE = 'prop-tea-table', STUB = 'prop-lantern-mushroom';
const base = { world: 'wonder', music: 'm-wonderland', sky: '#c8b8e0' };

// ------------------------------------------------------------ (a) the Hall of Doors
export const POOL_TILES = [];
for (let y = 9; y <= 12; y++) for (let x = 12; x <= 16; x++) if (!(y === 9 && (x === 12 || x === 16)) && !(y === 12 && x === 16)) POOL_TILES.push([x, y]);
function hall() {
  const m = mk(18, 14, 'k', 0);
  box(m, 0, 0, 17, 0, '#'); box(m, 0, 0, 0, 13, '#');
  box(m, 14, 2, 16, 4, 'k', 2);                     // the dais (only big Bramble steps up)
  dot(m, 11, 2, 's');                                // in front of the tiny door
  box(m, 1, 1, 17, 1, 'f');                          // a strip of plain boards along the back wall
  dot(m, 11, 1, 'f');
  box(m, 17, 8, 17, 13, ' '); box(m, 12, 13, 17, 13, ' '); box(m, 0, 13, 3, 13, ' ');   // ragged far edges
  const [c1, c1p] = chest('c1w-hall', 'dais', 16, 2, { buttons: 25, 'eat-me': 1 });
  return {
    ...base, name: 'The Hall of Doors', area: 'hall', battle: 'wonder-hall', merge: true, ...bake(m),
    entries: { fall: [6, 9, 'se'], tinydoor: [11, 3, 'se'] },
    props: [
      { id: 'prop-ruin-arch', x: 1, y: 2 }, { id: 'prop-tunnel-heap', x: 3, y: 2, w: 2, h: 1 },
      { id: 'prop-sealed-door', x: 3, y: 1 }, { id: 'prop-door-keyhole', x: 6, y: 1 }, { id: 'prop-sealed-door', x: 9, y: 1 },
      { id: 'prop-tiny-door', x: 11, y: 1 }, { id: 'prop-door-keyhole', x: 14, y: 1 },
      { id: 'prop-sealed-door', x: 1, y: 6 }, { id: 'prop-door-keyhole', x: 1, y: 10 },
      { id: GLASS_TABLE, x: 8, y: 6, cond: () => !flag('c1w_key') }, { id: 'prop-glass-table-empty', x: 8, y: 6, cond: () => flag('c1w_key') }, { id: 'prop-drink-stand', x: 5, y: 8 }, { id: STUB, x: 13, y: 6 },
      c1p, { id: 'prop-pool-rock', x: 14, y: 11, cond: () => flag('c1w_tears') },
      { id: 'prop-lantern', x: 16, y: 6 }, { id: 'prop-lantern', x: 2, y: 9 }, { id: 'prop-armchair', x: 3, y: 4 },
    ],
    chests: [c1],
    enemies: [{ id: 'hall-pots', type: 'flying-teapot', x: 9, y: 12, loop: [[9, 12], [11, 12], [11, 13], [9, 13]], encounter: 'c1w.teapots-1', facing: 'se' }],
    doors: [
      { x: 11, y: 2, to: 'c1w-pool', entry: 'door', locked: () => G.s && (!flag('c1w_key') || sizeNow() !== 'small'), lockedRun: 'c1w.hall.tinydoor' },
      { x: 1, y: 2, run: 'c1w.hall.up' },
    ],
    triggers: [
      { x: 1, y: 2, use: true, run: 'c1w.hall.up' },
      { x: 8, y: 6, w: 2, h: 2, use: true, cond: ex => ex.size === 'big', run: 'c1w.hall.key' },
      { x: 8, y: 6, w: 2, h: 2, use: true, run: 'c1w.hall.table' },
      { x: 5, y: 8, use: true, run: 'c1w.stand' },
      { x: 13, y: 6, use: true, run: 'c1w.stub' },
      { x: 11, y: 1, use: true, run: 'c1w.hall.tinydoor' },
    ],
    onEnter: 'c1w.hall.enter',
    drawOver(ex, c, ox, oy) {
      label(ex, c, ox, oy, 5, 8, 'DRINK ME  EAT ME', 44);
      if (!flag('c1w_key')) glow(ex, c, ox, oy, 9, 6, '255,220,120', 0.35);
    },
  };
}
function sizeNow() { const ex = G.scenes && G.scenes.find(s => s.kind === 'explore'); return ex ? ex.size : 'normal'; }
export function floodHall(ex) { for (const [x, y] of POOL_TILES) setTile(ex, x, y, '~', 0); }

// ------------------------------------------------------------ (a, b) the Pool of Tears and the Caucus shore
export const RACE = [[16, 12], [19, 15], [15, 16]];
function pool() {
  const m = mk(26, 22, 'z', 0);
  box(m, 0, 0, 25, 0, 'h'); box(m, 0, 0, 0, 21, 'h');
  oval(m, 10, 10, 7.5, 6.5, '~');
  oval(m, 18, 15, 5.5, 4.5, '.');                        // the grassy caucus ground
  box(m, 20, 7, 25, 11, '.');
  oval(m, 4, 19, 4, 3, '.');
  speckle(m, '.', ',', 9, 3);
  line(m, [[2, 2], [20, 2], [20, 8], [22, 8], [22, 18], [22, 21]], '_');
  dot(m, 1, 1, 'z'); dot(m, 2, 1, 'z');
  for (const [x, y] of RACE) dot(m, x, y, '.');
  const [c1, c1p] = chest('c1w-pool', 'reeds', 2, 19, { buttons: 30, comfits: 1 });
  return {
    ...base, name: 'The Pool of Tears', area: 'shore', battle: 'wonder-garden', ...bake(m),
    entries: { door: [2, 2, 'se'], lane: [22, 20, 'nw'] },
    props: [
      { id: 'prop-tiny-door', x: 1, y: 1 },
      { id: 'prop-pool-rock', x: 7, y: 8 }, { id: 'prop-pool-rock', x: 12, y: 13 }, { id: 'prop-pool-rock', x: 14, y: 7 },
      { id: 'prop-reeds', x: 3, y: 9 }, { id: 'prop-reeds', x: 4, y: 14 }, { id: 'prop-reeds', x: 16, y: 5 }, { id: 'prop-reeds', x: 10, y: 17 },
      { id: 'prop-caucus-rock', x: 17, y: 14 },
      { id: 'prop-store-counter', x: 23, y: 9, w: 2, h: 1 }, { id: 'prop-button-shelves', x: 24, y: 7, w: 2, h: 1 },
      { id: 'prop-hedge', x: 25, y: 13 }, { id: 'prop-hedge', x: 25, y: 14 }, { id: 'prop-rose-bush', x: 25, y: 16 },
      { id: 'prop-lantern-mushroom', x: 6, y: 20 }, { id: STUB, x: 1, y: 16 }, c1p,
    ],
    chests: [c1],
    npcs: [
      { id: 'dodo', x: 21, y: 12, facing: 'sw', talk: 'c1w.dodo' },
      { id: 'dodo-shop', sprite: 'dodo', x: 23, y: 10, facing: 'sw', talk: 'c1w.dodo.shop', cond: () => flag('c1w_caucus_done') },
    ],
    enemies: [
      { id: 'pool-cards', type: 'card-soldier', x: 13, y: 2, loop: [[11, 2], [17, 2], [17, 3], [11, 3]], encounter: 'c1w.cards-1', facing: 'se' },
      { id: 'pool-mix', type: 'flying-teapot', x: 20, y: 4, loop: [[19, 4], [19, 6], [21, 6], [21, 4]], encounter: 'c1w.mixed-1', facing: 'sw' },
      { id: 'pool-pots', type: 'flying-teapot', x: 5, y: 18, loop: [[3, 18], [6, 18], [6, 19], [3, 19]], encounter: 'c1w.teapots-1', facing: 'ne' },
    ],
    doors: [
      { x: 1, y: 2, to: 'c1w-hall', entry: 'tinydoor' },
      { x: 22, y: 21, to: 'c1w-lane', entry: 'pool', locked: () => !flag('c1w_caucus_done'), lockedRun: 'c1w.pool.notyet' },
    ],
    triggers: [
      { x: 1, y: 1, use: true, run: async s => s.warp('c1w-hall', 'tinydoor') },
      { x: 1, y: 16, use: true, run: 'c1w.stub' },
      ...RACE.map(([x, y], i) => ({ id: 'race' + i, x, y, cond: () => flag('c1w_caucus_on') && !flag('c1w_race' + i), run: 'c1w.race.' + i })),
    ],
    onEnter: 'c1w.pool.enter',
    drawGround(ex, c, ox, oy) { if (flag('c1w_caucus_on')) RACE.forEach(([x, y], i) => { if (!flag('c1w_race' + i)) glow(ex, c, ox, oy, x, y, '255,230,140', 0.6); }); },
    drawOver(ex, c, ox, oy) { label(ex, c, ox, oy, 23, 9, 'CAUCUS STORE', 40); },
  };
}

// ------------------------------------------------------------ (c) the White Rabbit's lane and house
function lane() {
  const m = mk(22, 20, '.', 0);
  box(m, 0, 0, 21, 0, 'h'); box(m, 0, 0, 0, 19, 'h');
  box(m, 15, 1, 20, 5, ',');
  box(m, 15, 1, 15, 5, 'h'); box(m, 15, 5, 20, 5, 'h'); box(m, 20, 1, 20, 5, 'h'); dot(m, 15, 4, 's');
  line(m, [[0, 9], [6, 9], [6, 4], [9, 4], [9, 2]], '_');
  line(m, [[9, 4], [12, 4], [12, 12], [18, 12], [18, 17], [21, 17]], '_');
  speckle(m, '.', ',', 11, 5);
  const [c1, c1p] = chest('c1w-lane', 'frame', 18, 2, { buttons: 30, 'drink-me': 1, 'eat-me': 1 });
  return {
    ...base, name: 'The White Rabbit\'s Lane', area: 'rabbit-house', battle: 'wonder-garden', merge: true, ...bake(m),
    entries: { pool: [1, 9, 'se'], house: [9, 3, 'se'], wood: [20, 17, 'nw'] },
    props: [
      { id: 'prop-rabbit-house', x: 8, y: 1, w: 3, h: 1, whole: true },
      { id: 'prop-fence', x: 6, y: 2 }, { id: 'prop-fence', x: 12, y: 2 }, { id: 'prop-fence', x: 13, y: 2 },
      { id: 'prop-rose-bush', x: 7, y: 2 }, { id: 'prop-rose-bush', x: 11, y: 2 },
      { id: 'prop-hawthorn', x: 3, y: 4 }, { id: 'prop-hawthorn', x: 3, y: 14 }, { id: 'prop-oz-tree', x: 8, y: 15 }, { id: 'prop-oz-tree', x: 15, y: 9 },
      { id: 'prop-signpost', x: 13, y: 13 }, { id: 'prop-hedge', x: 4, y: 11 }, { id: 'prop-gorse', x: 9, y: 11 },
      { id: 'prop-banquet-table', x: 14, y: 6, cond: () => flag('c1w_house_done') },
      { id: 'prop-lantern-mushroom', x: 19, y: 9 }, c1p,
    ],
    chests: [c1],
    npcs: [
      { id: 'white-rabbit', x: 11, y: 4, facing: 'sw', talk: 'c1w.wr.talk', cond: () => !flag('g_recruit_white-rabbit') },
      { id: 'bill-lizard', x: 5, y: 3, facing: 'se', talk: 'c1w.bill', cond: () => flag('c1w_house_done') },
    ],
    enemies: [
      { id: 'lane-cards', type: 'card-soldier', x: 13, y: 9, loop: [[13, 8], [16, 8], [16, 10], [13, 10]], encounter: 'c1w.cards-1', facing: 'sw' },
      { id: 'lane-pots', type: 'flying-teapot', x: 4, y: 16, loop: [[3, 16], [7, 16], [7, 18], [3, 18]], encounter: 'c1w.mixed-1', facing: 'se' },
    ],
    doors: [
      { x: 0, y: 9, to: 'c1w-pool', entry: 'lane' },
      { x: 9, y: 2, to: 'c1w-rabbit-house', entry: 'door', locked: () => !flag('c1w_wr_asked'), lockedRun: 'c1w.lane.door' },
      { x: 21, y: 17, to: 'c1w-wood', entry: 'lane', locked: () => !flag('g_recruit_white-rabbit'), lockedRun: 'c1w.lane.notyet' },
    ],
    triggers: [
      { x: 14, y: 6, use: true, cond: () => flag('c1w_house_done'), run: 'c1w.pebblecakes' },
    ],
    onEnter: 'c1w.lane.enter',
    drawOver(ex, c, ox, oy) { label(ex, c, ox, oy, 9, 1, 'W. RABBIT', 26, '#5a4422', '#e8c95a'); },
  };
}
function rabbitHouse() {
  const m = mk(10, 9, 'w', 0);
  box(m, 0, 0, 9, 0, '#'); box(m, 0, 0, 0, 8, '#');
  return {
    ...base, name: 'The White Rabbit\'s House', area: 'rabbit-house', battle: 'wonder-hall', merge: true, sky: '#2a2030', ...bake(m),
    entries: { door: [5, 7, 'ne'] },
    props: [
      { id: 'prop-dresser', x: 3, y: 1, w: 2, h: 1 }, { id: 'prop-hearth', x: 7, y: 1, w: 2, h: 1 },
      { id: 'prop-drink-stand', x: 6, y: 4 }, { id: 'prop-armchair', x: 1, y: 4 }, { id: 'prop-table', x: 2, y: 6 },
      { id: 'prop-herb-rack', x: 1, y: 2 },
      { id: 'prop-banquet-table', x: 8, y: 6, cond: () => flag('c1w_cakes_in') && !flag('c1w_house_done') },
    ],
    doors: [{ x: 5, y: 8, to: 'c1w-lane', entry: 'house', locked: () => sizeNow() === 'big', lockedRun: 'c1w.house.stuck' }],
    triggers: [
      { x: 3, y: 1, w: 2, h: 1, use: true, run: 'c1w.house.dresser' },
      { x: 6, y: 4, use: true, run: 'c1w.house.bottle' },
      { x: 8, y: 6, use: true, cond: () => flag('c1w_cakes_in'), run: 'c1w.house.cake' },
    ],
    onEnter: 'c1w.house.enter',
  };
}

// ------------------------------------------------------------ (d) the Caterpillar's wood and the Duchess's kitchen
export const PIG_AT = [25, 21];
function wood() {
  const m = mk(28, 26, '.', 0);
  box(m, 0, 0, 27, 0, 'h'); box(m, 0, 0, 0, 25, 'h');
  box(m, 16, 0, 16, 25, 'h');                                  // the great hedge (only a giant steps over)
  // the Caterpillar's clearing: a ring of hedge, one low gap under the bracken
  box(m, 4, 12, 12, 20, 'h'); box(m, 5, 13, 11, 19, 'G'); dot(m, 8, 12, 's'); dot(m, 8, 11, 's');
  line(m, [[0, 3], [3, 3], [3, 9], [8, 9], [8, 10]], '_');
  line(m, [[3, 9], [3, 22], [12, 22], [14, 22]], '_');
  line(m, [[17, 4], [22, 4], [22, 3]], '_'); line(m, [[22, 4], [22, 14], [27, 14]], '_');
  speckle(m, '.', ',', 13, 7);
  const [c1, c1p] = chest('c1w-wood', 'nest', 19, 2, { buttons: 35, 'courage-ribbon+2': 1 });
  const [c2, c2p] = chest('c1w-wood', 'roots', 14, 24, { buttons: 30, dandelion: 1 });
  return {
    ...base, name: 'The Mushroom Wood', area: 'wood', battle: 'mushroom', merge: true, ...bake(m),
    entries: { lane: [1, 3, 'se'], duchess: [22, 4, 'sw'], tea: [26, 14, 'nw'] },
    props: [
      { id: 'prop-drink-stand', x: 5, y: 5 }, { id: STUB, x: 6, y: 2 }, { id: STUB, x: 20, y: 9 },
      { id: 'prop-giant-mushroom', x: 8, y: 15, w: 2, h: 2 },
      { id: 'prop-giant-mushroom', x: 24, y: 8, w: 2, h: 2 },
      { id: 'prop-giant-mushroom', x: 12, y: 3, w: 2, h: 2 }, { id: 'prop-giant-mushroom', x: 2, y: 24, w: 2, h: 2 },
      { id: 'prop-lantern-mushroom', x: 6, y: 7 }, { id: 'prop-lantern-mushroom', x: 13, y: 9 }, { id: 'prop-lantern-mushroom', x: 19, y: 18 },
      { id: 'prop-lantern-mushroom', x: 26, y: 24 }, { id: 'prop-lantern-mushroom', x: 10, y: 24 },
      { id: 'prop-oz-tree', x: 1, y: 13 }, { id: 'prop-oz-tree', x: 14, y: 16 }, { id: 'prop-oz-tree', x: 25, y: 2 }, { id: 'prop-oz-tree', x: 20, y: 23 },
      { id: 'prop-dovecote', x: 18, y: 1 },
      { id: 'prop-badger-door', x: 21, y: 1, w: 2, h: 1, whole: true },
      { id: 'prop-hollow-log', x: 23, y: 18, w: 2, h: 1 }, { id: 'prop-gorse', x: 26, y: 19 },
      c1p, c2p,
    ],
    chests: [c1, c2],
    npcs: [
      { id: 'caterpillar', x: 7, y: 15, facing: 'se', talk: 'c1w.caterpillar', cond: () => !flag('g_recruit_caterpillar') },
      { id: 'flamingo-1', sprite: 'flamingo', x: 6, y: 18, facing: 'se', talk: 'c1w.flamingo', cond: () => !flag('g_recruit_caterpillar') },
      { id: 'flamingo-2', sprite: 'flamingo', x: 11, y: 18, facing: 'sw', talk: 'c1w.flamingo', cond: () => !flag('g_recruit_caterpillar') },
      { id: 'flamingo-3', sprite: 'flamingo', x: 11, y: 14, facing: 'sw', talk: 'c1w.flamingo', cond: () => !flag('g_recruit_caterpillar') },
      { id: 'pigeon', x: 18, y: 4, facing: 'sw', talk: 'c1w.pigeon.talk' },
      { id: 'pig', sprite: 'pig-baby', x: PIG_AT[0], y: PIG_AT[1], facing: 'sw', talk: 'c1w.pig', cond: () => flag('c1w_pig') },
      { id: 'cheshire-cat', x: 20, y: 7, facing: 'sw', talk: 'c1w.cat.wood', cond: () => flag('c1w_pig') && !flag('g_recruit_cheshire-cat') },
    ],
    enemies: [
      { id: 'wood-a', type: 'pepper-cloud', x: 5, y: 9, loop: [[4, 9], [4, 11], [2, 11], [2, 9]], encounter: 'c1w.wood-1', facing: 'se' },
      { id: 'wood-b', type: 'flying-teapot', x: 9, y: 22, loop: [[6, 22], [11, 22], [11, 24], [6, 24]], encounter: 'c1w.tea-1', facing: 'ne' },
      { id: 'wood-c', type: 'card-soldier', x: 19, y: 12, loop: [[18, 11], [21, 11], [21, 13], [18, 13]], encounter: 'c1w.wood-2', facing: 'sw' },
      { id: 'wood-d', type: 'pepper-cloud', x: 24, y: 16, loop: [[23, 16], [26, 16], [26, 17], [23, 17]], encounter: 'c1w.pepper-1', facing: 'sw' },
    ],
    doors: [
      { x: 0, y: 3, to: 'c1w-lane', entry: 'wood' },
      { x: 22, y: 3, run: 'c1w.duchess.door' },
      { x: 27, y: 14, to: 'c1w-tea', entry: 'wood', locked: () => !flag('g_recruit_cheshire-cat'), lockedRun: 'c1w.wood.notyet' },
    ],
    triggers: [
      { x: 5, y: 5, use: true, run: 'c1w.stand' },
      { x: 6, y: 2, use: true, run: 'c1w.stub' }, { x: 20, y: 9, use: true, run: 'c1w.stub' },
      { x: 8, y: 15, w: 2, h: 2, use: true, run: 'c1w.mushroom' },
      { x: 24, y: 8, w: 2, h: 2, use: true, run: 'c1w.mushroom' },
      { id: 'pigeon', x: 16, y: 0, w: 1, h: 26, cond: ex => ex.size === 'big' && !flag('c1w_pigeon'), run: 'c1w.pigeon' },
      { x: 21, y: 1, w: 2, h: 1, use: true, run: 'c1w.duchess.door' },
    ],
    onEnter: 'c1w.wood.enter',
    drawOver(ex, c, ox, oy) { if (flag('c1w_cater_done') && !flag('c1w_used_mushroom')) glow(ex, c, ox, oy, 9, 17, '200,255,200', 0.4); },
  };
}
function duchess() {
  const m = mk(11, 10, 'f', 0);
  box(m, 0, 0, 10, 0, '#'); box(m, 0, 0, 0, 9, '#');
  box(m, 1, 1, 9, 2, 'k');
  return {
    ...base, name: 'The Duchess\'s Kitchen', area: 'wood', battle: 'wonder-hall', low: true, sky: '#2a2030', ...bake(m),
    entries: { door: [5, 8, 'ne'] },
    props: [
      { id: 'prop-hearth', x: 3, y: 1, w: 2, h: 1 }, { id: 'prop-stove', x: 8, y: 1 }, { id: 'prop-cauldron', x: 6, y: 4 },
      { id: 'prop-dresser', x: 1, y: 3, w: 1, h: 2 }, { id: 'prop-armchair', x: 2, y: 6 }, { id: 'prop-table', x: 8, y: 5 },
      { id: 'prop-herb-rack', x: 9, y: 3 },
    ],
    npcs: [
      { id: 'duchess', x: 3, y: 6, facing: 'se', talk: 'c1w.duchess', cond: () => !flag('c1w_baby') },
      { id: 'cook', x: 7, y: 4, facing: 'sw', talk: 'c1w.cook' },
      { id: 'cheshire-cat', x: 5, y: 1, facing: 'se', talk: 'c1w.cat.kitchen', cond: () => !flag('c1w_baby') },
    ],
    enemies: [
      { id: 'kitchen-pepper', type: 'pepper-cloud', x: 8, y: 7, loop: [[7, 7], [9, 7], [9, 8], [7, 8]], encounter: 'c1w.pepper-1', facing: 'sw' },
    ],
    doors: [{ x: 5, y: 9, to: 'c1w-wood', entry: 'duchess' }],
    onEnter: 'c1w.duchess.enter',
  };
}

// ------------------------------------------------------------ (e) the Mad Tea-Party
function tea() {
  const m = mk(22, 18, '.', 0);
  box(m, 0, 0, 21, 0, 'h'); box(m, 0, 0, 0, 17, 'h');
  box(m, 6, 5, 13, 10, 'G');
  line(m, [[0, 10], [5, 10], [5, 4], [9, 4], [9, 2]], '_'); line(m, [[13, 7], [17, 7], [17, 6]], '_');
  dot(m, 18, 5, 's');
  speckle(m, '.', ',', 12, 2);
  const [c1, c1p] = chest('c1w-tea', 'jam', 2, 15, { buttons: 35, 'pluck-berry': 2 });
  return {
    ...base, name: 'The Mad Tea-Party', area: 'tea', battle: 'wonder-garden', merge: true, ...bake(m),
    entries: { wood: [1, 10, 'se'], tree: [17, 6, 'sw'] },
    props: [
      { id: 'prop-rabbit-house', x: 8, y: 1, w: 3, h: 1, whole: true },
      { id: TEA_TABLE, x: 8, y: 7, w: 3, h: 1 },
      { id: 'prop-armchair', x: 8, y: 6 }, { id: 'prop-armchair', x: 10, y: 8 }, { id: 'prop-armchair', x: 12, y: 6 },
      { id: 'prop-banquet-table', x: 13, y: 9 },
      { id: 'prop-oz-tree', x: 18, y: 3 }, { id: 'prop-tiny-door', x: 18, y: 4 }, { id: 'prop-drink-stand', x: 16, y: 4 },
      { id: 'prop-oz-tree', x: 3, y: 6 }, { id: 'prop-oz-tree', x: 15, y: 14 }, { id: 'prop-hawthorn', x: 20, y: 11 },
      { id: 'prop-rose-bush', x: 7, y: 2 }, { id: 'prop-rose-bush', x: 12, y: 2 }, { id: 'prop-gorse', x: 4, y: 13 }, c1p,
    ],
    chests: [c1],
    npcs: [
      { id: 'hatter', x: 7, y: 7, facing: 'se', talk: 'c1w.hatter' },
      { id: 'march-hare', x: 11, y: 7, facing: 'sw', talk: 'c1w.marchhare' },
      { id: 'dormouse', x: 9, y: 6, facing: 'se', talk: 'c1w.dormouse' },
    ],
    enemies: [
      { id: 'tea-pots', type: 'flying-teapot', x: 8, y: 13, loop: [[6, 13], [11, 13], [11, 15], [6, 15]], encounter: 'c1w.tea-1', facing: 'ne' },
      { id: 'tea-pots-2', type: 'flying-teapot', x: 17, y: 11, loop: [[16, 10], [19, 10], [19, 13], [16, 13]], encounter: 'c1w.wood-1', facing: 'nw' },
    ],
    doors: [
      { x: 0, y: 10, to: 'c1w-wood', entry: 'tea' },
      { x: 18, y: 5, to: 'c1w-garden', entry: 'tree', locked: () => !flag('c1w_tea_done'), lockedRun: 'c1w.tree.notyet' },
    ],
    triggers: [
      { x: 16, y: 4, use: true, run: 'c1w.stand' },
      { x: 18, y: 4, use: true, run: 'c1w.tree.door' },
    ],
    onEnter: 'c1w.tea.enter',
    drawOver(ex, c, ox, oy) { label(ex, c, ox, oy, 9, 1, 'ALWAYS SIX O\'CLOCK', 30, '#5a4422', '#f4ecd8'); },
  };
}

// ------------------------------------------------------------ (f) the Queen's garden
export const WHITE_ROSES = [[5, 5], [8, 5], [11, 5]];
export const HOOPS = [[11, 13], [14, 11], [17, 14], [14, 16], [20, 12]];
function garden() {
  const m = mk(28, 26, '.', 0);
  box(m, 0, 0, 27, 0, 'h'); box(m, 0, 0, 0, 25, 'h');
  box(m, 3, 3, 13, 3, 'h'); dot(m, 2, 3, '.');
  box(m, 9, 9, 22, 18, 'G');                                  // the croquet ground
  box(m, 19, 2, 26, 6, 'k');                                  // the court
  line(m, [[2, 2], [2, 7], [16, 7], [16, 9]], '_'); line(m, [[16, 7], [22, 7], [22, 6]], '_'); line(m, [[2, 7], [2, 21], [5, 21]], '_');
  speckle(m, '.', ',', 15, 4);
  const [c1, c1p] = chest('c1w-garden', 'tarts', 26, 23, { buttons: 40, 'carrot-cake': 1 });
  return {
    ...base, name: 'The Queen\'s Garden', area: 'garden', battle: 'wonder-garden', ...bake(m),
    entries: { tree: [2, 2, 'se'], court: [21, 8, 'ne'] },
    props: [
      { id: 'prop-oz-tree', x: 1, y: 1 },
      ...WHITE_ROSES.map(([x, y]) => ({ id: 'prop-rose-bush', x, y })),
      { id: 'prop-rose-bush', x: 4, y: 2 }, { id: 'prop-rose-bush', x: 7, y: 2 }, { id: 'prop-rose-bush', x: 10, y: 2 }, { id: 'prop-rose-bush', x: 13, y: 2 },
      { id: 'prop-rose-bush', x: 4, y: 10 }, { id: 'prop-rose-bush', x: 4, y: 14 }, { id: 'prop-rose-bush', x: 24, y: 20 }, { id: 'prop-rose-bush', x: 7, y: 23 },
      ...HOOPS.map(([x, y]) => ({ id: 'prop-hoop-card', x, y })),
      { id: 'prop-jury-box', x: 20, y: 2, w: 2, h: 1 }, { id: 'prop-heart-throne', x: 24, y: 2 }, { id: 'prop-table', x: 23, y: 4 },
      { id: 'prop-hedge', x: 8, y: 20 }, { id: 'prop-hedge', x: 9, y: 20 }, { id: 'prop-hedge', x: 10, y: 20 }, { id: 'prop-hedge', x: 18, y: 21 }, { id: 'prop-hedge', x: 19, y: 21 },
      { id: 'prop-hare-burrow', x: 6, y: 24 }, { id: 'prop-oz-tree', x: 25, y: 10 }, { id: 'prop-oz-tree', x: 13, y: 22 }, c1p,
    ],
    chests: [c1],
    npcs: [
      { id: 'seven-of-spades', sprite: 'card-soldier', x: 8, y: 6, facing: 'ne', talk: 'c1w.seven', cond: () => !flag('g_recruit_seven-of-spades') },
      { id: 'two', sprite: 'card-soldier', x: 6, y: 4, facing: 'sw', talk: 'c1w.twofive', cond: () => !flag('g_recruit_seven-of-spades') },
      { id: 'five', sprite: 'card-soldier', x: 9, y: 4, facing: 'sw', talk: 'c1w.twofive', cond: () => !flag('g_recruit_seven-of-spades') },
      { id: 'queen-of-hearts', x: 15, y: 12, facing: 'sw', talk: 'c1w.queen', cond: () => !flag('c1w_croquet_won') },
      { id: 'king-of-hearts', x: 17, y: 11, facing: 'sw', talk: 'c1w.king', cond: () => !flag('c1w_croquet_won') },
      { id: 'knave', x: 13, y: 12, facing: 'se', talk: 'c1w.knave', cond: () => !flag('c1w_croquet_won') },
      { id: 'flamingo-g', sprite: 'flamingo', x: 12, y: 15, facing: 'se', talk: 'c1w.flamingo.g' },
      { id: 'hedgehog-g', sprite: 'hedgehog', x: 19, y: 16, facing: 'sw', talk: 'c1w.hedgehog.g' },
      // the court, after the croquet
      { id: 'queen-of-hearts', x: 23, y: 3, facing: 'sw', talk: 'c1w.queen.after', cond: () => flag('c1w_croquet_won') },
      { id: 'king-of-hearts', x: 24, y: 3, facing: 'sw', talk: 'c1w.king.after', cond: () => flag('c1w_croquet_won') },
      { id: 'knave', x: 22, y: 5, facing: 'se', talk: 'c1w.knave.after', cond: () => flag('c1w_croquet_won') },
      { id: 'white-rabbit', x: 25, y: 5, facing: 'sw', talk: 'c1w.wr.court', cond: () => flag('c1w_croquet_won') },
      { id: 'dodo-court', sprite: 'dodo', x: 20, y: 9, facing: 'ne', talk: 'c1w.dodo.court', cond: () => flag('c1w_trial_done') },
    ],
    enemies: [
      { id: 'garden-cards', type: 'card-soldier', x: 13, y: 7, loop: [[12, 7], [15, 7], [15, 8], [12, 8]], encounter: 'c1w.cards-2', facing: 'sw' },
      { id: 'garden-cards-2', type: 'card-soldier', x: 7, y: 15, loop: [[6, 13], [8, 13], [8, 17], [6, 17]], encounter: 'c1w.cards-3', facing: 'se' },
      { id: 'garden-pots', type: 'flying-teapot', x: 22, y: 21, loop: [[21, 21], [24, 21], [24, 23], [21, 23]], encounter: 'c1w.mixed-1', facing: 'nw' },
    ],
    doors: [
      { x: 1, y: 2, to: 'c1w-tea', entry: 'tree' },
    ],
    triggers: [
      ...WHITE_ROSES.map(([x, y], i) => ({ x, y, use: true, run: 'c1w.rose.' + i })),
      { x: 6, y: 24, use: true, run: 'c1w.garden.home' },
      { id: 'court', x: 19, y: 7, w: 5, h: 1, once: true, cond: () => flag('c1w_croquet_won') && !flag('c1w_trial_done'), run: 'c1w.trial' },
    ],
    onHop: (ex) => { if (G.data.scripts['c1w.roses.hop']) G.data.scripts['c1w.roses.hop'](ex); },
    onEnter: 'c1w.garden.enter',
    drawOver(ex, c, ox, oy) {
      WHITE_ROSES.forEach(([x, y], i) => { if (!flag('c1w_rose' + i) && !flag('g_recruit_seven-of-spades')) { glow(ex, c, ox, oy, x, y, '255,255,255', 0.55); whiteRoses(ex, c, ox, oy, x, y); } });
    },
  };
}
// little white blooms painted over a rose bush that hasn't been painted yet
function whiteRoses(ex, c, ox, oy, x, y) {
  const sx = (x - y) * 16 + ox, sy = (x + y) * 8 + oy;
  c.fillStyle = '#f8f4ee';
  for (const [dx, dy] of [[-6, -18], [0, -22], [5, -17], [-2, -13], [7, -24], [-8, -24]]) c.fillRect(Math.round(sx + dx), Math.round(sy + 8 + dy), 3, 3);
}

export default {
  'c1w-hall': hall(), 'c1w-pool': pool(), 'c1w-lane': lane(), 'c1w-rabbit-house': rabbitHouse(),
  'c1w-wood': wood(), 'c1w-duchess': duchess(), 'c1w-tea': tea(), 'c1w-garden': garden(),
};
