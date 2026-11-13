// Sorrel Down (c0-downs) and Thimblebank Warren (c0-warren): the home maps the whole game returns to.
// Both are painted in code (a little grid painter) so rooms, terraces and hills stay easy to adjust.
import { flag, hasItem } from '../../state.js';
import { G } from '../../core.js';
import { toScreen } from '../../engine/iso.js';

// ---------------------------------------------------------------- story stage helpers
export const attacked = () => flag('c0_attack');
// Thimblebank's rebuild level: 0 before the attack, 1 wrecked, 2 nursery cleared (ch1 home visit),
// 3 Great Burrow rebuilt (RTS 1 won), 4 cellar and nook (ch2), 5 den and deep passage lit (ch3), 6 bright (ch4)
export function homeLevel() {
  if (!attacked()) return 0;
  if (flag('g_ch4_done')) return 6;
  if (flag('g_ch3_done')) return 5;
  if (flag('g_ch2_done')) return 4;
  if (flag('g_freed_thimblebank')) return 3;
  if (flag('g_c1_riverbank_done') || flag('g_c1_nursery_cleared')) return 2;
  return 1;
}
const wreck = (fixAt) => () => attacked() && homeLevel() < fixAt;          // debris until rebuilt at level fixAt
const lit = (litAt) => () => !attacked() || homeLevel() >= litAt;            // lanterns: before the attack, and after rebuild
const after = (lv) => () => homeLevel() >= lv;                               // rebuild decorations
export const homeBack = () => flag('g_freed_thimblebank');                   // the taken five and the hidden two are home

// ---------------------------------------------------------------- grid painter
function painter(w, h, ch, hh = 0) {
  const t = Array.from({ length: h }, () => Array(w).fill(ch));
  const z = Array.from({ length: h }, () => Array(w).fill(hh));
  const P = {
    t, z, w, h,
    set(x, y, c, hv) { if (x < 0 || y < 0 || x >= w || y >= h) return; if (c != null) t[y][x] = c; if (hv != null) z[y][x] = hv; },
    rect(x0, y0, x1, y1, c, hv) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) P.set(x, y, c, hv); },
    // L-shaped path: along x first, then along y
    path(x0, y0, x1, y1, c) { let x = x0, y = y0; P.set(x, y, c); while (x !== x1) { x += Math.sign(x1 - x); P.set(x, y, c); } while (y !== y1) { y += Math.sign(y1 - y); P.set(x, y, c); } },
    rows() { return t.map(r => r.join('')); },
    hrows() { return z.map(r => r.map(v => v.toString(36)).join('')); },
  };
  return P;
}

// ================================================================ SORREL DOWN (40 x 40)
function buildDowns() {
  const P = painter(40, 40, '.');
  // chalk terraces in the north-west
  P.rect(0, 0, 11, 12, null, 1); P.rect(0, 0, 6, 6, null, 2); P.rect(0, 0, 2, 3, null, 3);
  P.rect(12, 0, 13, 5, null, 1);
  // the Lookout hill in the north-east, centred on (30, 10): three square grassy terraces (straight chalk lips, a
  // slope you can read) rather than a diamond, whose stepped edges drew as a checkerboard of chalk pillars
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) {
    const d = Math.max(Math.abs(x - 30), Math.abs(y - 10));
    if (d <= 1) P.set(x, y, null, 3); else if (d <= 3) P.set(x, y, null, 2); else if (d <= 5) P.set(x, y, null, 1);
  }
  // a low rise in the south-east
  P.rect(32, 30, 38, 36, null, 1);
  // terrace rims and hill rims show their chalk: any raised tile with a lower neighbour in front
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) {
    const h = P.z[y][x]; if (!h) continue;
    const fx = x + 1 < 40 ? P.z[y][x + 1] : 0, fy = y + 1 < 40 ? P.z[y + 1][x] : 0;
    // (the Lookout hill keeps grass on its lips: green terraces read as a slope, chalk rings read as walls)
    if ((fx < h || fy < h) && Math.max(Math.abs(x - 30), Math.abs(y - 10)) > 5) P.set(x, y, 'x');
  }
  // clover patches
  P.rect(4, 21, 7, 24, ','); P.set(8, 22, ','); P.set(3, 23, ',');
  P.rect(25, 26, 29, 30, ','); P.set(26, 25, ','); P.set(30, 28, ',');
  P.rect(7, 8, 9, 10, ','); P.set(10, 9, ',');
  P.rect(33, 26, 35, 27, ','); P.rect(14, 30, 16, 31, ',');
  // more clover about the open down, and on the hill's terraces
  P.rect(10, 13, 11, 14, ','); P.rect(33, 33, 34, 34, ','); P.rect(2, 7, 3, 8, ','); P.rect(13, 36, 14, 37, ','); P.set(26, 8, ','); P.set(33, 12, ',');
  P.rect(21, 29, 22, 30, ','); P.set(8, 29, ','); P.set(36, 11, ',');
  // grass you can nibble (longer tufts)
  for (const [x, y] of [[13, 23], [15, 28], [20, 26], [24, 13], [9, 18], [3, 16], [34, 18], [27, 35], [18, 33], [36, 23], [11, 4], [5, 9],
    [6, 28], [11, 31], [22, 35], [31, 25], [37, 34], [28, 16], [32, 6], [23, 3], [14, 9], [2, 24], [16, 29], [35, 9]]) P.set(x, y, 'G');
  // the dew pond
  P.rect(4, 31, 7, 33, '~'); P.rect(5, 30, 6, 34, '~'); P.set(8, 32, '~');
  // sweetgrass by the warren mouth
  P.rect(22, 16, 24, 18, ';');
  // roads: north, west, east, and the climb to the Lookout Stone
  P.path(20, 19, 20, 0, '_');          // north road
  P.path(18, 19, 18, 21, '_'); P.path(18, 21, 0, 21, '_');   // west road
  P.path(19, 19, 19, 20, '_'); P.path(19, 20, 39, 20, '_');  // east road
  P.path(30, 20, 30, 13, '_');          // up the hill
  P.path(18, 21, 18, 25, '_'); P.path(18, 25, 14, 25, '_');  // home lane to the morning meadow
  P.path(20, 9, 24, 9, '_');            // a side track toward the hill's shoulder
  return P;
}
const D = buildDowns();

// rabbits about the down (talk: c0.downs.rabbit in story.js)
export const DOWN_RABBITS = [
  { id: 'dr-1', sprite: 'rabbit-kit', fur: 'sandy', kid: true, x: 26, y: 29, facing: 'sw' },
  { id: 'dr-2', sprite: 'rabbit-doe', fur: 'brown', x: 6, y: 22, facing: 'se' },
  { id: 'dr-3', sprite: 'rabbit-buck', fur: 'silver', x: 34, y: 26, facing: 'nw' },
  { id: 'dr-4', sprite: 'rabbit-doe', fur: 'ginger', x: 15, y: 30, facing: 'ne' },
  { id: 'dr-5', sprite: 'rabbit-kit', fur: 'grey', kid: true, x: 27, y: 13, facing: 'sw' },
];
// flowers: daisies, buttercups, pink clover heads and darker tufts on plain grass (a seeded scatter, so it never shimmers)
const FLOWERS = (() => {
  const out = [];
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) {
    const k = D.t[y][x]; if (k !== '.' && k !== ',' && k !== 'G') continue;
    const r = ((x * 73856093) ^ (y * 19349663)) >>> 0, n = r % 7;
    if (n > 2) continue;
    out.push({ x, y, kind: (r >>> 4) % 4, dx: ((r >>> 8) % 13) - 6, dy: ((r >>> 12) % 7) - 3, two: (r >>> 16) % 3 === 0 });
  }
  return out;
})();
const FCOL = [['#f4f0e4', '#e8c840'], ['#f0d040', '#c89a20'], ['#e8a0c0', '#c87098'], ['#5e8a4c', '#4c763e']];
function drawMeadow(ex, c, ox, oy) {
  for (const f of FLOWERS) {
    const h = ex.hAt(f.x, f.y);
    // not where a higher tile in front would cover it (the flower would float on the cliff face)
    if (ex.hAt(f.x + 1, f.y) > h || ex.hAt(f.x, f.y + 1) > h || ex.hAt(f.x + 1, f.y + 1) > h) continue;
    const s = toScreen(f.x, f.y, h), px = Math.round(s.x + ox + f.dx), py = Math.round(s.y + oy + 8 + f.dy);
    if (px < -8 || py < -8 || px > 648 || py > 368) continue;
    const [a, b] = FCOL[f.kind];
    const one = (x, y) => {
      if (f.kind === 3) { c.fillStyle = a; c.fillRect(x, y - 2, 1, 3); c.fillRect(x + 2, y - 3, 1, 4); c.fillStyle = b; c.fillRect(x + 1, y - 1, 1, 2); return; }
      c.fillStyle = a; c.fillRect(x - 1, y, 3, 1); c.fillRect(x, y - 1, 1, 3); c.fillStyle = b; c.fillRect(x, y, 1, 1);
    };
    one(px, py); if (f.two) one(px + 5, py + 2);
  }
}

const downsDoorLocked = (open, mapId) => () => !flag(open) || !G.data.maps[mapId];
export const downs = {
  name: 'Sorrel Down', world: 'downs', area: 'downs',
  music: () => (attacked() && !flag('g_ch0_done') ? 'm-attack' : 'm-downs'),
  ambience: [['wind', 0.35]], battle: 'downs',
  tiles: D.rows(), heights: D.hrows(),
  entries: {
    start: [14, 26, 'ne'], warren: [19, 20, 'se'], lookout: [30, 13, 'ne'],
    north: [20, 1, 'sw'], west: [1, 21, 'se'], east: [38, 20, 'nw'],
  },
  props: [
    { id: 'prop-warren-entrance', x: 18, y: 16, w: 2, h: 2 },
    { id: 'prop-lookout-stone', x: 30, y: 10 },
    { id: 'prop-hollow-log', x: 9, y: 26, w: 2, h: 1 },
    { id: 'prop-signpost', x: 17, y: 22 },
    // hawthorns
    ['prop-hawthorn', 8, 15], ['prop-hawthorn', 26, 4], ['prop-hawthorn', 13, 34], ['prop-hawthorn', 35, 33], ['prop-hawthorn', 3, 13],
    ['prop-hawthorn', 37, 7], ['prop-hawthorn', 15, 6], ['prop-hawthorn', 23, 27], ['prop-hawthorn', 2, 37],
    // gorse
    ['prop-gorse', 12, 17], ['prop-gorse', 13, 18], ['prop-gorse', 2, 27], ['prop-gorse', 27, 23], ['prop-gorse', 35, 15],
    ['prop-gorse', 17, 36], ['prop-gorse', 30, 36], ['prop-gorse', 7, 37], ['prop-gorse', 38, 25], ['prop-gorse', 23, 32],
    ['prop-gorse', 9, 3], ['prop-gorse', 25, 1], ['prop-gorse', 37, 16], ['prop-gorse', 1, 31], ['prop-gorse', 33, 3],
    // chalk boulders
    ['prop-chalk-boulder', 16, 12], ['prop-chalk-boulder', 33, 22], ['prop-chalk-boulder', 10, 34], ['prop-chalk-boulder', 26, 11],
    ['prop-chalk-boulder', 5, 4], ['prop-chalk-boulder', 37, 30],
    // fences: Penny's clover garden and the south field
    ['prop-fence', 24, 25], ['prop-fence', 24, 26], ['prop-fence', 24, 27], ['prop-fence', 24, 29], ['prop-fence', 24, 30], ['prop-fence', 24, 31],
    ['prop-fence', 25, 31], ['prop-fence', 26, 31], ['prop-fence', 28, 31], ['prop-fence', 29, 31], ['prop-fence', 30, 31],
    ['prop-fence', 10, 38], ['prop-fence', 11, 38], ['prop-fence', 12, 38], ['prop-fence', 14, 38], ['prop-fence', 15, 38],
    // reeds by the pond
    ['prop-reeds', 8, 31], ['prop-reeds', 4, 34], ['prop-reeds', 3, 30],
    // dandelions (walk through them)
    { id: 'prop-dandelions', x: 15, y: 27, walk: true }, { id: 'prop-dandelions', x: 21, y: 24, walk: true }, { id: 'prop-dandelions', x: 6, y: 19, walk: true },
    { id: 'prop-dandelions', x: 28, y: 33, walk: true }, { id: 'prop-dandelions', x: 11, y: 11, walk: true }, { id: 'prop-dandelions', x: 34, y: 20, walk: true },
    { id: 'prop-dandelions', x: 22, y: 6, walk: true }, { id: 'prop-dandelions', x: 3, y: 18, walk: true },
    // the attack's marks: spoil heaps and rubble by the mouth until RTS 1 is won
    { id: 'prop-spoil-heap', x: 15, y: 15, w: 2, h: 1, cond: () => attacked() && !flag('g_freed_thimblebank') },
    { id: 'prop-rubble', x: 21, y: 15, cond: () => attacked() && !flag('g_freed_thimblebank') },
    { id: 'prop-rubble', x: 16, y: 19, cond: () => attacked() && !flag('g_freed_thimblebank') },
    { id: 'prop-spoil-heap', x: 34, y: 18, w: 2, h: 1, cond: () => attacked() && !flag('g_freed_thimblebank') },
    // the feast-day garland stones once every warren is free
    { id: 'prop-lantern', x: 21, y: 18, cond: () => flag('g_ch4_done') },
    { id: 'prop-lantern', x: 17, y: 18, cond: () => flag('g_ch4_done') },
  ],
  npcs: [
    { id: 'tansy', x: 16, y: 24, facing: 'sw', talk: 'c0.tansy', cond: () => !flag('c0_tansy') && !attacked() },
    { id: 'tansy', x: 21, y: 21, facing: 'nw', talk: 'c0.tansy', cond: () => flag('c0_tansy') && !flag('c0_race') && !attacked() },
    { id: 'pip', x: 11, y: 27, facing: 'nw', talk: 'c0.pip', cond: () => !attacked(), kid: true },
    { id: 'home-1', sprite: 'rabbit-doe', fur: 'grey', x: 28, y: 18, facing: 'ne', talk: 'home.home-1', cond: () => !attacked() || homeBack() },
    { id: 'home-2', sprite: 'rabbit-buck', fur: 'dark', x: 17, y: 19, facing: 'se', talk: 'home.home-2', cond: () => !attacked() || homeBack() },
    { id: 'home-3', sprite: 'rabbit-buck', fur: 'ginger', x: 25, y: 23, facing: 'sw', talk: 'home.home-3', cond: () => !attacked() || homeBack() },
    { id: 'home-4', sprite: 'rabbit-doe', fur: 'cream', x: 27, y: 28, facing: 'sw', talk: 'home.home-4', cond: () => !attacked() || homeBack() },
    // rabbits out on the down, nibbling (not while the raiders hold it)
    ...DOWN_RABBITS.map(r => ({ ...r, talk: 'c0.downs.rabbit', cond: () => !attacked() || homeBack() })),
  ],
  enemies: [
    { id: 'c0r1', type: 'raider', sprite: 'raider', hum: true, x: 34, y: 25, loop: [[34, 25], [37, 25], [37, 28], [34, 28]], encounter: 'c0.raiders-1', cond: () => attacked() && flag('c0_burdock') && !flag('g_freed_thimblebank') },
    { id: 'c0r2', type: 'raider', sprite: 'raider', hum: true, x: 36, y: 4, loop: [[36, 4], [38, 4], [38, 7], [36, 7]], encounter: 'c0.raiders-2', cond: () => attacked() && flag('c0_burdock') && !flag('g_freed_thimblebank') },
    { id: 'c0r3', type: 'raider', sprite: 'raider', hum: true, x: 9, y: 36, loop: [[9, 36], [12, 36], [12, 34], [9, 34]], encounter: 'c0.raiders-3', cond: () => attacked() && flag('c0_burdock') && !flag('g_freed_thimblebank') },
  ],
  doors: [
    { x: 18, y: 18, run: 'c0.mouth-door', locked: () => !flag('c0_tansy') || !flag('c0_pip_done'), lockedRun: 'c0.mouth-locked' },
    { x: 19, y: 18, run: 'c0.mouth-door', locked: () => !flag('c0_tansy') || !flag('c0_pip_done'), lockedRun: 'c0.mouth-locked' },
    { x: 20, y: 0, to: 'c2-silverdown', entry: 'south', locked: downsDoorLocked('g_ch2_open', 'c2-silverdown'), lockedRun: 'c0.edge-north' },
    { x: 0, y: 21, to: 'c3-wheatsheaf', entry: 'east', locked: downsDoorLocked('g_ch3_open', 'c3-wheatsheaf'), lockedRun: 'c0.edge-west' },
    { x: 39, y: 20, to: 'c4-flintcomb', entry: 'west', locked: downsDoorLocked('g_ch4_open', 'c4-flintcomb'), lockedRun: 'c0.edge-east' },
  ],
  triggers: [
    { x: 9, y: 26, w: 2, h: 1, use: true, run: 'c0.log' },
    { x: 30, y: 10, use: true, run: 'lookout.stone' },
    { x: 17, y: 22, use: true, run: 'c0.signpost' },
    { x: 22, y: 16, w: 3, h: 3, run: 'c0.attack', cond: () => flag('c0_yarrow_asked') && !attacked() },
  ],
  chests: [
    { id: 'c0-gorse-chest', x: 2, y: 2, give: { buttons: 20, 'clover-bunch': 2 } },
    { id: 'c0-pond-chest', x: 3, y: 33, give: { dandelion: 1, buttons: 10 } },
  ],
  onEnter: 'c0.downs.enter',
  // the morning tremor: about two minutes in, or as soon as Tansy and Pip are both seen to
  update(ex) {
    if (ex.busy || ex.leaving || flag('c0_tremor') || attacked()) return;
    if ((flag('c0_tansy') && flag('c0_pip_done')) || (G.s.playTime > 120 && flag('c0_tansy'))) ex.queueScript('c0.tremor');
  },
  // wild flowers and grass tufts on the open grass, painted in code
  drawGround(ex, c, ox, oy) { drawMeadow(ex, c, ox, oy); },
  // the signpost's words, drawn in code
  drawOver(ex, c, ox, oy) {
    const s = toScreen(17, 22, ex.hAt(17, 22)); const x = s.x + ox, y = s.y + oy;
    c.fillStyle = '#3e2a1e'; c.fillRect(x - 6, y - 26, 3, 1); c.fillRect(x - 2, y - 26, 4, 1); c.fillRect(x + 3, y - 25, 3, 1);
  },
};

// ================================================================ THIMBLEBANK WARREN (32 x 32)
// Rooms (inclusive rectangles) and tunnels; everything within 2 tiles of a floor becomes earth wall,
// tall at the back of a room (nothing walks behind it) and low elsewhere so nobody is ever hidden.
const ROOMS = {
  mouth: [2, 2, 5, 5, 'e'], burrow: [9, 2, 18, 10, 'f'], nook: [22, 3, 27, 8, 'f'], nursery: [2, 13, 7, 18, 'm'],
  den: [11, 13, 16, 18, 'r'], cellar: [21, 12, 26, 17, 'r'], comfrey: [2, 22, 7, 26, 'm'],
};
const TUNNELS = [
  [6, 3, 8, 4, 'e'], [19, 5, 21, 6, 'f'], [13, 11, 14, 12, 'f'], [3, 6, 4, 12, 'e'], [8, 15, 10, 15, 'e'],
  [17, 15, 20, 16, 'f'], [24, 9, 24, 11, 'e'], [4, 19, 5, 21, 'm'], [25, 18, 25, 27, 'r'], [19, 28, 25, 28, 'r'], [3, 0, 3, 1, 'e'],
];
function buildWarren() {
  const P = painter(32, 32, ' ');
  const floor = new Set();
  for (const [x0, y0, x1, y1, c] of [...Object.values(ROOMS), ...TUNNELS]) { P.rect(x0, y0, x1, y1, c, 0); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) floor.add(x + ',' + y); }
  // moss and root patches in rooms
  P.rect(15, 3, 17, 4, 'm'); P.rect(10, 8, 11, 9, 'm'); P.rect(12, 16, 13, 17, 'm'); P.rect(26, 7, 27, 8, 'r');
  P.set(18, 28, 'o');   // the sealed door's threshold: old carved stone
  floor.add('18,28');
  const isF = (x, y) => floor.has(x + ',' + y);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    if (isF(x, y)) continue;
    let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 3 && isF(x + dx, y + dy)) { near = true; break; }
    if (!near) continue;
    const front = isF(x + 1, y) || isF(x, y + 1) || isF(x + 1, y + 1) || isF(x + 2, y) || isF(x, y + 2);
    const behind = isF(x - 1, y) || isF(x, y - 1) || isF(x - 1, y - 1) || isF(x - 2, y) || isF(x, y - 2) || isF(x - 1, y + 1) || isF(x + 1, y - 1);
    P.set(x, y, 'E', front && !behind ? 3 : 1);
  }
  // one-tile tunnels: a low wall just in front of the floor (x+1 / y+1) is drawn over it and takes the click
  // (engine pick()), so those tunnels could not be click-walked. Make those walls floor-level ledges.
  for (const [x0, y0, x1, y1] of [...TUNNELS, [18, 28, 18, 28]]) {   // + the sealed door's threshold
    if (x0 !== x1 && y0 !== y1) continue;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (!isF(nx, ny) && P.t[ny] && P.t[ny][nx] === 'E' && P.z[ny][nx] === 1) P.set(nx, ny, null, 0);
    }
  }
  return P;
}
const WR = buildWarren();

const L = (x, y, at = 0) => ({ id: 'prop-lantern-mushroom', x, y, cond: lit(at) });
export const warren = {
  name: 'Thimblebank Warren', world: 'warren', area: 'thimblebank',
  music: 'm-warren', ambience: [['hearth', 0.25]], battle: 'warren',
  get dark() { return [0.15, 0.45, 0.38, 0.28, 0.22, 0.18, 0.12][homeLevel()]; },
  sky: '#140e0c',
  legend: { E: { k: 'wall', walk: 0 } },
  tiles: WR.rows(), heights: WR.hrows(),
  entries: { mouth: [3, 3, 'se'], 'great-burrow': [13, 7, 'sw'], deep: [19, 28, 'nw'] },
  props: [
    // the mouth chamber
    ['prop-root-pillar', 5, 2], L(2, 5), L(5, 5, 3),
    // the Great Burrow
    ['prop-root-pillar', 10, 3], ['prop-root-pillar', 17, 9], ['prop-root-pillar', 10, 9],
    { id: 'prop-root-pillar', x: 17, y: 3, cond: () => !attacked() || homeLevel() >= 3 },
    { id: 'prop-storyteller-seat', x: 11, y: 5 },
    { id: 'prop-moss-bed', x: 16, y: 3, w: 1, h: 2 }, { id: 'prop-moss-bed', x: 9, y: 7, w: 1, h: 2, cond: lit(3) },
    ['prop-table', 15, 7], { id: 'prop-table', x: 15, y: 6, cond: lit(3) },
    L(9, 2), L(18, 2, 3), L(9, 10, 3), L(18, 10), L(14, 2, 3),
    { id: 'prop-hearth', x: 12, y: 2, w: 2, h: 1, cond: after(3) },
    { id: 'prop-lantern', x: 16, y: 9, cond: after(6) },
    { id: 'prop-rubble', x: 13, y: 9, cond: wreck(3) }, { id: 'prop-rubble', x: 16, y: 6, cond: wreck(3) }, { id: 'prop-rubble', x: 11, y: 7, cond: wreck(3) },
    { id: 'prop-tunnel-heap', x: 17, y: 3, w: 2, h: 1, cond: wreck(3) },
    { id: 'prop-rubble', x: 12, y: 3, cond: wreck(3) }, { id: 'prop-rubble', x: 18, y: 7, cond: wreck(3) },
    // Mallow's trading nook
    { id: 'prop-store-counter', x: 23, y: 5, w: 2, h: 1 }, ['prop-button-shelves', 22, 3], ['prop-button-shelves', 25, 3], ['prop-cellar-baskets', 27, 4],
    L(27, 3), L(22, 8, 4), { id: 'prop-rubble', x: 26, y: 6, cond: wreck(4) }, { id: 'prop-chest-open', x: 27, y: 8, cond: after(4) },
    // the nursery
    ['prop-nursery-nest', 2, 13], ['prop-nursery-nest', 6, 13], ['prop-nursery-nest', 2, 17], { id: 'prop-nursery-nest', x: 7, y: 17, cond: lit(2) },
    { id: 'prop-moss-bed', x: 7, y: 14, w: 1, h: 2 }, L(2, 15), L(7, 13, 2),
    { id: 'prop-rubble', x: 5, y: 18, cond: wreck(2) }, { id: 'prop-rubble', x: 3, y: 14, cond: wreck(2) },
    { id: 'prop-tunnel-heap', x: 8, y: 15, w: 2, h: 1, cond: wreck(2) },
    // Yarrow's den
    { id: 'prop-moss-bed', x: 11, y: 13, w: 1, h: 2 }, ['prop-herb-rack', 16, 13], ['prop-table', 14, 14], ['prop-storyteller-seat', 13, 13],
    L(16, 18, 5), L(11, 18), { id: 'prop-rubble', x: 15, y: 17, cond: wreck(5) }, { id: 'prop-lantern', x: 11, y: 16, cond: after(5) },
    // the root cellar
    ['prop-cellar-baskets', 21, 12], ['prop-cellar-baskets', 22, 12], ['prop-cellar-baskets', 26, 13], ['prop-root-pillar', 23, 15],
    { id: 'prop-cellar-baskets', x: 26, y: 14, cond: lit(4) }, { id: 'prop-cellar-baskets', x: 21, y: 17, cond: lit(4) }, L(26, 17, 4), L(21, 15),
    { id: 'prop-rubble', x: 24, y: 10, cond: wreck(4) }, { id: 'prop-rubble', x: 22, y: 16, cond: wreck(4) },
    // Comfrey's corner
    ['prop-herb-rack', 2, 22], ['prop-herb-rack', 4, 22], { id: 'prop-moss-bed', x: 7, y: 23, w: 1, h: 2 }, ['prop-mortar', 2, 25], L(7, 26), L(2, 23, 2),
    { id: 'prop-moss-bed', x: 7, y: 25, w: 1, h: 2, cond: after(3) },
    // the deep passage and the old sealed door
    { id: 'prop-sealed-door', x: 18, y: 28 }, L(24, 17, 5), L(21, 16, 5), { id: 'prop-carved-rock', x: 26, y: 23, cond: () => true },   // fullrun: lanterns were at (25,19) and (22,28), inside the one-tile deep passage (blocked it from Chapter 4 on)
  ],
  npcs: [
    // before the attack
    { id: 'yarrow', x: 12, y: 15, facing: 'se', talk: 'home.yarrow', cond: () => !attacked() || homeLevel() >= 3 },
    { id: 'yarrow', x: 13, y: 6, facing: 'sw', talk: 'home.yarrow', cond: () => attacked() && homeLevel() < 3 },
    { id: 'woodruff', x: 12, y: 5, facing: 'se', talk: 'home.woodruff' },
    { id: 'mallow', x: 24, y: 4, facing: 'sw', talk: 'home.mallow' },
    { id: 'comfrey', x: 3, y: 23, facing: 'se', talk: 'home.comfrey' },
    { id: 'tansy', x: 14, y: 4, facing: 'sw', talk: 'c0.tansy', cond: () => flag('c0_race') && !attacked() },
    { id: 'pip', x: 5, y: 16, facing: 'sw', talk: 'c0.pip', kid: true, cond: () => attacked() && !flag('g_recruit_pip') && !flag('g_ch2_done') },   // in Chapter 3 Yarrow has sent him after Bramble
    { id: 'home-2', sprite: 'rabbit-buck', fur: 'dark', x: 14, y: 9, facing: 'nw', talk: 'home.home-2', cond: () => attacked() && !homeBack() },
    { id: 'home-5', sprite: 'rabbit-buck', fur: 'sandy', x: 16, y: 8, facing: 'nw', talk: 'home.home-5', cond: () => !attacked() || homeBack() },
    { id: 'home-6', sprite: 'rabbit-doe', fur: 'silver', x: 15, y: 3, facing: 'sw', talk: 'home.home-6', cond: () => !attacked() || homeBack() },
    { id: 'home-7', sprite: 'rabbit-doe', fur: 'brown', x: 4, y: 15, facing: 'se', talk: 'home.home-7' },
    { id: 'home-8', sprite: 'rabbit-buck', fur: 'grey', x: 24, y: 14, facing: 'sw', talk: 'home.home-8', cond: () => !attacked() || homeBack() },
    { id: 'home-9', sprite: 'rabbit-kit', fur: 'brown', kid: true, x: 12, y: 7, facing: 'ne', talk: 'home.home-9', cond: () => !attacked() || homeLevel() >= 2 },
    { id: 'home-9', sprite: 'rabbit-kit', fur: 'brown', kid: true, x: 6, y: 16, facing: 'nw', talk: 'home.home-9', cond: () => attacked() && homeLevel() < 2 },
    { id: 'home-10', sprite: 'rabbit-doe', fur: 'grey', x: 26, y: 15, facing: 'sw', talk: 'home.home-10' },   // fullrun: was (25,20), which plugged the one-tile deep passage to the sealed door after the raid
    // two kits at Woodruff's feet (scenery that talks)
    { id: 'c0-kit-a', sprite: 'rabbit-kit', fur: 'sandy', kid: true, x: 13, y: 4, facing: 'sw', talk: 'c0.kit-a', cond: () => !attacked() || homeLevel() >= 3 },
    { id: 'c0-kit-b', sprite: 'rabbit-kit', fur: 'cream', kid: true, x: 11, y: 6, facing: 'ne', talk: 'c0.kit-b', cond: () => !attacked() || homeLevel() >= 3 },
  ],
  doors: [{ x: 3, y: 0, to: 'c0-downs', entry: 'warren' }, { x: 3, y: 1, to: 'c0-downs', entry: 'warren' }],
  triggers: [
    { x: 18, y: 28, use: true, run: 'c0.sealed-door' },
    { x: 11, y: 5, use: true, run: 'c0.seat' },
  ],
  chests: [
    { id: 'c0-cellar-chest', x: 26, y: 16, give: { 'clover-bunch': 2, buttons: 15 } },
  ],
  onEnter: 'c0.warren.enter',
  // the sealed door's curling sign (drawn in code, no letters) and a pale light falling down the mouth
  drawOver(ex, c, ox, oy) {
    const s = toScreen(18, 28, ex.hAt(18, 28)); const x = s.x + ox + 16, y = s.y + oy - 52;
    const glow = flag('c0_door_open') ? 0.9 : 0.45 + 0.25 * Math.sin(G.time * 1.3);
    c.fillStyle = `rgba(191,227,240,${glow})`;
    // a little spiral: rings of pixels winding inward
    const pts = [];
    for (let i = 0; i < 26; i++) { const a = i * 0.55, r = 7 - i * 0.24; pts.push([Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r * 0.6)]); }
    for (const [dx, dy] of pts) c.fillRect(x + dx, y + dy, 1, 1);
    c.fillRect(x - 9, y + 5, 3, 1); c.fillRect(x + 7, y - 5, 3, 1);
    // daylight down the mouth tunnel
    const m = toScreen(3, 1, 0); const mx = m.x + ox + 16, my = m.y + oy + 8;
    c.fillStyle = `rgba(255,240,200,${attacked() && homeLevel() < 3 ? 0.08 : 0.14})`;
    c.beginPath(); c.moveTo(mx - 10, my - 60); c.lineTo(mx + 10, my - 60); c.lineTo(mx + 18, my + 6); c.lineTo(mx - 18, my + 6); c.fill();
  },
};
export { hasItem };
