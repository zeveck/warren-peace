// Chapter 2 maps: Silverdown (surface and warren), Silverdown Depths, Silverdown's Underway, the Moon
// (the cassia tree, the palace, the crater warren, the lantern grove) and the Drowned Halls.
import { flag, hasItem } from '../../state.js';
import { G } from '../../core.js';
import { toScreen } from '../../engine/iso.js';
import { grid, line } from './build.js';
const LEG_LOW = { Z: { k: 'wall', walk: 0 }, Y: { k: 'rock', walk: 0 } };   // low ledges left by trim()

const freed = () => flag('g_freed_silverdown');
const noise = (x, y, s = 1) => Math.abs(Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453) % 1;

// ---------- shared drawing helpers for hooks
function tileCenter(ex, x, y, ox, oy) { const s = toScreen(x, y, Math.max(0, ex.hAt(x, y))); return { x: s.x + ox, y: s.y + oy + 8 }; }
function stars(c, seed, n, t, col = '255,255,240') {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(noise(i, 1, seed) * 640), y = Math.floor(noise(i, 2, seed) * 360);
    const a = 0.35 + 0.45 * Math.sin(t * (0.6 + noise(i, 3, seed)) + i);
    c.fillStyle = `rgba(${col},${Math.max(0.08, a)})`; c.fillRect(x, y, noise(i, 4, seed) < 0.15 ? 2 : 1, noise(i, 4, seed) < 0.15 ? 2 : 1);
  }
}
function glow(c, x, y, r, rgb, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
// the downs seen from the Moon: a small blue-green world hanging in the black
function drawEarth(c, t) {
  const x = 92, y = 70, r = 26;
  glow(c, x, y, r + 22, '120,200,220', 0.18);
  c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#3e7aa0'; c.fillRect(x - r, y - r, r * 2, r * 2);
  c.fillStyle = '#7aa86a'; c.beginPath(); c.ellipse(x - 6, y - 4, 13, 8, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 10, y + 9, 8, 5, -0.3, 0, 7); c.fill();
  c.fillStyle = 'rgba(240,240,250,0.75)'; c.fillRect(x - 20 + ((t * 2) % 40), y - 14, 14, 2); c.fillRect(x - 10 + ((t * 1.3) % 30), y + 4, 10, 2);
  c.fillStyle = 'rgba(10,10,30,0.45)'; c.beginPath(); c.arc(x + 12, y + 6, r, 0, Math.PI * 2); c.fill();
  c.restore();
}
function moonBack(ex, c) { stars(c, 7, 130, G.time); drawEarth(c, G.time); }
// silver dust motes drifting up past the camera
function motes(c, t, n, rgb = '230,235,255') {
  for (let i = 0; i < n; i++) {
    const sp = 6 + noise(i, 5) * 10, x = (noise(i, 6) * 700 + Math.sin(t * 0.4 + i) * 12) % 660 - 10, y = 370 - ((t * sp + noise(i, 7) * 400) % 400);
    c.fillStyle = `rgba(${rgb},${0.25 + 0.3 * noise(i, 8)})`; c.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}

// ======================================================================= Silverdown, the surface
const sd = grid(36, 32, '.', 0);
sd.sprinkle(0, 0, 35, 31, '.', 'G', 0.06, 2).sprinkle(0, 0, 35, 31, '.', ',', 0.04, 3);
sd.rect(9, 0, 25, 6, '.', 1).sprinkle(9, 0, 25, 6, '.', 'x', 0.35, 4).rect(13, 0, 21, 5, 'x', 1);  // the chalk crown round the warren mouth
sd.rect(27, 15, 31, 19, 'x', 1).rect(28, 16, 30, 18, 'x', 2);                                       // a chalk outcrop
sd.rect(4, 22, 8, 25, '~', 0).rect(5, 21, 7, 21, '~').set(3, 23, '~');                               // the dew pond
sd.path([[31, 31], [31, 26], [25, 26], [25, 16], [17, 16], [17, 7]], 'x').path([[17, 7], [17, 3]], 'x', 1);
sd.path([[17, 12], [9, 12], [9, 9]], 'x').path([[25, 21], [33, 21], [33, 14]], 'x');
sd.set(20, 24, ';').set(6, 15, ';');
sd.rect(16, 0, 18, 2, 'x', 1);
const SD = sd.out();
// NB: hum-blue eyes are drawn only on plain sprites (no fur ramp): the engine's recolour cache keys on img.src,
// which canvases (fur-ramped images, hop frames) don't have. Woken, they get their pale Silverdown fur back.
const hummers = [
  { id: 'sd-doe', x: 13, y: 21, sprite: 'rabbit-doe', fur: 'silver', facing: 'ne' },
  { id: 'sd-buck', x: 21, y: 12, sprite: 'rabbit-buck', fur: 'grey', facing: 'sw' },
  { id: 'sd-kit', x: 7, y: 17, sprite: 'rabbit-kit', fur: 'cream', facing: 'se', kid: true },
  { id: 'sd-rider', x: 10, y: 7, sprite: 'pigeon-rider', facing: 'se' },
];

const silverdown = {
  name: 'Silverdown', world: 'silver', area: 'silverdown', battle: 'downs', tiles: SD.tiles, heights: SD.heights,
  music: () => (freed() ? 'm-warren' : 'm-silverdown'),
  get ambience() { return freed() ? [['wind', 0.3]] : [['wind', 0.2], ['hum', 0.35]]; },
  get tint() { return freed() ? null : 'rgba(150,170,210,0.13)'; },
  entries: { south: [31, 29, 'ne'], mouth: [17, 4, 'sw'] },
  props: [
    { id: 'prop-warren-entrance', x: 16, y: 1, w: 2, h: 2, whole: true },
    ['prop-dovecote', 5, 7], ['prop-dovecote', 8, 5], ['prop-dovecote', 6, 11], ['prop-dovecote', 11, 9], ['prop-dovecote', 27, 8], ['prop-dovecote', 30, 11],
    ['prop-chalk-boulder', 29, 17], ['prop-chalk-boulder', 14, 3], ['prop-chalk-boulder', 22, 2], ['prop-chalk-boulder', 3, 28], ['prop-chalk-boulder', 34, 26],
    ['prop-hawthorn', 2, 13], ['prop-hawthorn', 33, 3], ['prop-hawthorn', 12, 27], ['prop-gorse', 20, 13], ['prop-gorse', 28, 28], ['prop-gorse', 9, 25], ['prop-gorse', 34, 18],
    ['prop-dandelions', 22, 23], ['prop-dandelions', 4, 19], ['prop-fence', 2, 9], ['prop-fence', 2, 10], ['prop-signpost', 30, 27],
  ],
  npcs: [
    ...hummers.map(h => ({ ...h, fur: undefined, hum: true, talk: 'c2.sd.hummer', cond: () => !freed() })),
    ...hummers.map(h => ({ ...h, id: h.id + '-w', talk: 'c2.sd.woken', cond: freed })),
    { id: 'pigeon-1', sprite: 'pigeon', x: 7, y: 8, facing: 'se', talk: 'c2.sd.pigeon' },
    { id: 'pigeon-2', sprite: 'pigeon', x: 28, y: 10, facing: 'sw', talk: 'c2.sd.pigeon' },
    { id: 'sd-elder', sprite: 'rabbit-doe', fur: 'cream', x: 19, y: 5, facing: 'sw', talk: 'c2.sd.elder', cond: freed },
  ],
  enemies: [
    { id: 'sde1', type: 'raider', sprite: 'raider', x: 28, y: 24, loop: [[28, 24], [28, 22], [30, 22], [30, 24]], encounter: 'c2.sd-1', cond: () => !freed() },
    { id: 'sde2', type: 'hum-digger', hum: true, x: 22, y: 21, loop: [[22, 21], [20, 21], [20, 18], [22, 18]], encounter: 'c2.sd-2', cond: () => !freed() },
    { id: 'sde3', type: 'raider', sprite: 'pigeon-rider', hum: true, x: 13, y: 14, loop: [[13, 14], [14, 14], [14, 10], [13, 10]], encounter: 'c2.sd-3', cond: () => !freed() },
    { id: 'sde4', type: 'hum-digger', hum: true, x: 20, y: 8, loop: [[20, 8], [23, 8], [23, 10], [20, 10]], encounter: 'c2.sd-4', cond: () => !freed() },
  ],
  doors: [
    { x: 31, y: 31, to: 'c0-downs', entry: 'north' },
    { x: 16, y: 3, to: 'c2-silverdown-warren', entry: 'mouth' }, { x: 17, y: 3, to: 'c2-silverdown-warren', entry: 'mouth' },
  ],
  triggers: [{ x: 30, y: 27, use: true, run: 'c2.sd.sign' }],
  chests: [{ id: 'sd-c1', x: 3, y: 4, give: { buttons: 60, dandelion: 2 } }, { id: 'sd-c2', x: 34, y: 13, give: { buttons: 45, 'pluck-berry': 2 } }],
  onEnter: 'c2.silverdown.enter',
};

// ======================================================================= Silverdown, the warren
const sw = grid(34, 34, '#', 0);
sw.rect(25, 26, 32, 31, 'x', 0).set(29, 32, 'x').set(29, 33, 'x');                 // entrance hall
sw.path([[27, 26], [27, 20]], 'x', 0, 2);                                            // north corridor
sw.rect(23, 11, 31, 19, 'x', 0);                                                     // the pigeon loft
sw.path([[27, 21], [13, 21]], 'x', 0, 2);                                            // west corridor
sw.rect(3, 19, 11, 28, 'x', 0).sprinkle(3, 19, 11, 28, 'x', 'f', 0.25, 5);           // the nursery
sw.path([[11, 23], [13, 23]], 'x', 0, 2);
sw.path([[13, 21], [13, 12]], 'x', 0, 2);                                            // up to the antechamber
sw.rect(10, 7, 18, 12, 'x', 0);                                                      // antechamber (rest stone)
sw.path([[23, 13], [18, 13], [18, 11]], 'x', 0, 2);                                  // loft to antechamber
sw.disc(6, 6, 5.2, 'x', 0).sprinkle(1, 1, 11, 11, 'x', 'f', 0.2, 6);                // the Heart
sw.path([[9, 8], [10, 8]], 'x', 0, 2);
sw.path([[3, 9], [1, 9], [1, 15]], 'x', 0, 1).rect(1, 14, 3, 16, 'x', 0);            // the deep passage
sw.rect(1, 14, 1, 14, 'x', 0);
const SW = sw.trim().out();
const swAster = () => !freed();
const silverdownWarren = {
  name: 'Silverdown Warren', world: 'silver', area: 'silverdown', battle: 'warren', sky: '#1b1d26', tiles: SW.tiles, heights: SW.heights, legend: LEG_LOW,
  music: () => (freed() ? 'm-warren' : 'm-silverdown'),
  get ambience() { return freed() ? [['hearth', 0.25]] : [['hum', 0.5]]; },
  get dark() { return freed() ? 0.15 : 0.4; },
  get tint() { return freed() ? null : 'rgba(140,160,210,0.12)'; },
  entries: { mouth: [29, 30, 'ne'], deep: [2, 15, 'ne'], heart: [8, 9, 'nw'] },
  props: [
    ['prop-dovecote', 24, 12], ['prop-dovecote', 30, 12], ['prop-dovecote', 24, 18], ['prop-dovecote', 31, 17],
    ['prop-nursery-nest', 4, 20], ['prop-nursery-nest', 7, 20], ['prop-nursery-nest', 4, 25], ['prop-moss-bed', 10, 26, 1, 2],
    ['prop-root-pillar', 25, 27], ['prop-root-pillar', 32, 27], ['prop-lantern-mushroom', 26, 30], ['prop-lantern-mushroom', 12, 7],
    ['prop-rest-stone', 15, 8], ['prop-storyteller-seat', 3, 4], ['prop-rubble', 17, 12], ['prop-rubble', 3, 27],
    ['prop-sealed-door', 2, 14], ['prop-table', 10, 19], ['prop-cellar-baskets', 3, 19],
  ],
  npcs: [
    { id: 'aster', x: 5, y: 5, facing: 'se', hum: true, talk: 'c2.aster.boss', cond: swAster },
    { id: 'sd-guard-1', sprite: 'hum-lookout', x: 8, y: 3, facing: 'sw', hum: true, talk: 'c2.sd.hummer', cond: swAster },
    { id: 'sd-guard-2', sprite: 'rabbit-buck', x: 3, y: 8, facing: 'se', hum: true, talk: 'c2.sd.hummer', cond: swAster },
    { id: 'aster', x: 5, y: 5, facing: 'se', talk: 'c2.aster.talk', cond: freed },
    { id: 'sw-kit-1', sprite: 'rabbit-kit', kid: true, x: 6, y: 22, facing: 'se', hum: true, talk: 'c2.sd.hummer', cond: () => !freed() },
    { id: 'sw-kit-2', sprite: 'rabbit-kit', kid: true, x: 8, y: 24, facing: 'ne', hum: true, talk: 'c2.sd.hummer', cond: () => !freed() },
    { id: 'sw-kit-1w', sprite: 'rabbit-kit', fur: 'silver', kid: true, x: 6, y: 22, facing: 'se', talk: 'c2.sw.kit', cond: freed },
    { id: 'sw-kit-2w', sprite: 'rabbit-kit', fur: 'cream', kid: true, x: 8, y: 24, facing: 'ne', talk: 'c2.sw.kit', cond: freed },
    { id: 'sw-nurse', sprite: 'rabbit-doe', fur: 'silver', x: 9, y: 22, facing: 'sw', talk: 'c2.sw.nurse', cond: freed },
    { id: 'sw-loft', sprite: 'pigeon-rider', x: 27, y: 14, facing: 'sw', hum: true, talk: 'c2.sd.hummer', cond: () => !freed() },
    { id: 'sw-loft-w', sprite: 'pigeon-rider', x: 27, y: 14, facing: 'sw', talk: 'c2.sw.loft', cond: freed },
    { id: 'sw-pigeon', sprite: 'pigeon', x: 29, y: 15, facing: 'sw', talk: 'c2.sd.pigeon' },
  ],
  enemies: [
    { id: 'swe1', type: 'hum-digger', hum: true, x: 27, y: 23, loop: [[27, 23], [28, 23], [28, 20], [27, 20]], encounter: 'c2.sw-1', cond: swAster },
    { id: 'swe2', type: 'raider', sprite: 'pigeon-rider', hum: true, x: 26, y: 16, loop: [[26, 16], [29, 16], [29, 13], [26, 13]], encounter: 'c2.sw-2', cond: swAster },
    { id: 'swe3', type: 'hum-digger', sprite: 'raider', x: 18, y: 21, loop: [[18, 21], [15, 21], [15, 22], [18, 22]], encounter: 'c2.sw-3', cond: swAster },
    { id: 'swe4', type: 'raider', sprite: 'hum-lookout', hum: true, x: 13, y: 16, loop: [[13, 16], [13, 14], [14, 14], [14, 16]], encounter: 'c2.sw-4', cond: swAster },
  ],
  doors: [{ x: 29, y: 33, to: 'c2-silverdown', entry: 'mouth' }],
  triggers: [
    { x: 15, y: 8, use: true, run: 'c2.rest' },
    { x: 2, y: 14, use: true, run: 'c2.deepdoor' },
    { x: 3, y: 4, use: true, run: 'c2.sw.seat' },
    { id: 'heart', x: 8, y: 8, w: 3, h: 3, once: true, run: 'c2.aster.approach', cond: swAster },
  ],
  chests: [{ id: 'sw-c1', x: 5, y: 27, give: { buttons: 55, 'clover-bunch': 3 } }, { id: 'sw-c2', x: 31, y: 19, give: { buttons: 65, 'carrot-cake': 1 } }, { id: 'sw-c3', x: 17, y: 7, give: { 'calm-stone+2': 1 } }],
  onEnter: 'c2.warren.enter',
};

// ======================================================================= Silverdown Depths
const dp = grid(30, 30, '%', 0);
const dpMain = [[3, 4], [4, 4], [4, 12], [10, 12], [10, 8], [16, 8], [16, 16], [22, 16], [22, 22], [26, 22], [26, 28]];
dp.rect(2, 3, 6, 7, 'f', 0).set(3, 2, 'f');
dp.path(dpMain, 'f', 0, 2);
dp.rect(6, 13, 12, 18, 'f', 0).sprinkle(6, 13, 12, 18, 'f', 'o', 0.3, 7);   // chamber with old carvings
dp.rect(17, 3, 22, 8, 'f', 0);                                              // side chamber (chest)
dp.rect(12, 18, 16, 23, 'f', 0).rect(13, 19, 15, 21, '~', 0);                // a cold pool
dp.path([[11, 17], [12, 19]], 'f', 0, 1);
dp.sprinkle(0, 0, 29, 29, 'f', 'a', 0.15, 8);
dp.rect(26, 28, 27, 29, 'f', 0);
const DP = dp.trim().out();
const tansyTracks = line([[4, 7], [4, 12], [10, 12], [10, 8], [16, 8], [16, 16], [22, 16], [22, 22], [26, 22], [26, 27]]);
const depths = {
  name: 'Silverdown Depths', world: 'depths', area: 'silverdown', battle: 'depths', dark: 0.45, music: 'm-depths', ambience: [['drone-bed', 0.25], ['hum', 0.2]],
  tiles: DP.tiles, heights: DP.heights, legend: LEG_LOW,
  entries: { top: [4, 5, 'se'], bottom: [26, 26, 'nw'] },
  props: [
    { id: 'prop-sealed-door', x: 3, y: 2, whole: true }, ['prop-carved-pillar', 6, 13], ['prop-carved-pillar', 12, 13], ['prop-stone-face', 9, 13],
    ['prop-glow-crystal', 21, 3], ['prop-glow-crystal', 2, 7], ['prop-glow-crystal', 23, 17], ['prop-rubble', 18, 8], ['prop-tunnel-heap', 6, 17, 2, 1],
    ['prop-root-pillar', 11, 9], ['prop-pool-rock', 12, 22], ['prop-glow-crystal', 27, 25],
  ],
  enemies: [
    { id: 'dpe1', type: 'whisper', x: 9, y: 15, loop: [[9, 15], [11, 15], [11, 17], [9, 17]], encounter: 'c2.dp-1' },
    { id: 'dpe2', type: 'moving-carving', x: 16, y: 12, loop: [[16, 12], [17, 12], [17, 14], [16, 14]], encounter: 'c2.dp-2' },
    { id: 'dpe3', type: 'hum-digger', hum: true, x: 22, y: 19, loop: [[22, 19], [23, 19], [23, 21], [22, 21]], encounter: 'c2.dp-3' },
  ],
  doors: [{ x: 3, y: 3, to: 'c2-silverdown-warren', entry: 'deep' }, { x: 26, y: 29, to: 'c2-underway', entry: 'top' }, { x: 27, y: 29, to: 'c2-underway', entry: 'top' }],
  triggers: [
    { id: 'tracks', x: 4, y: 8, w: 2, h: 1, once: true, run: 'c2.dp.tracks' },
    { id: 'mark', x: 16, y: 9, w: 2, h: 1, once: true, run: 'c2.dp.mark' },
    { id: 'tuft', x: 22, y: 17, w: 2, h: 1, once: true, run: 'c2.dp.tuft' },
  ],
  chests: [{ id: 'dp-c1', x: 21, y: 5, give: { buttons: 70, 'smelling-salts': 2, 'courage-biscuit': 2 } }],
  // Tansy's pawprints, small and sandy, going down and down
  drawGround(ex, c, ox, oy) {
    tansyTracks.forEach(([x, y], i) => {
      const p = tileCenter(ex, x, y, ox, oy); const s = i % 2 ? 3 : -3;
      c.fillStyle = 'rgba(232,212,164,0.55)'; c.fillRect(p.x + s - 1, p.y - 1, 2, 2); c.fillRect(p.x + s - 2, p.y - 3, 1, 1); c.fillRect(p.x + s + 1, p.y - 3, 1, 1);
    });
  },
};

// ======================================================================= Silverdown's Underway
const uw = grid(25, 25, '%', 0);
uw.disc(12, 12, 9.6, 'o', 1).sprinkle(3, 3, 21, 21, 'o', 'f', 0.18, 9);
uw.rect(1, 11, 3, 13, 'f', 1).set(0, 12, 'f', 1);                     // up to Silverdown Depths
uw.rect(11, 1, 13, 3, 'o', 1);                                        // the moon door
uw.rect(11, 21, 13, 23, '~', 0).set(12, 21, 'o', 1).set(12, 22, 'o', 0).set(12, 23, 'o', 0).set(12, 24, 'o', 0); // the drowned stair
uw.rect(10, 10, 14, 14, 'f', 1).rect(11, 11, 13, 13, 'm', 1);
const UW = uw.trim().out();
const underway = {
  name: 'Silverdown\'s Underway', world: 'depths', area: 'silverdown', battle: 'depths', dark: 0.35, music: 'm-depths', ambience: [['drone-bed', 0.3]],
  tiles: UW.tiles, heights: UW.heights, legend: LEG_LOW,
  entries: { stone: [12, 14, 'se'], top: [4, 12, 'se'], moon: [12, 4, 'sw'], drowned: [12, 20, 'ne'] },
  props: [
    ['prop-rest-stone', 12, 12], { id: 'prop-ruin-arch', x: 12, y: 1, whole: true }, ['prop-carved-pillar', 11, 21], ['prop-carved-pillar', 13, 21],
    ['prop-stone-face', 5, 6], ['prop-stone-face', 19, 6], ['prop-stone-face', 5, 18], ['prop-stone-face', 18, 19], ['prop-glow-crystal', 8, 3], ['prop-glow-crystal', 21, 13],
    ['prop-carved-rock', 16, 3], ['prop-carved-rock', 3, 16], ['prop-star-rock', 20, 17], ['prop-glow-crystal', 4, 9],
  ],
  doors: [
    { x: 0, y: 12, to: 'c2-depths', entry: 'bottom' },
    { x: 12, y: 2, to: 'c2-moon', entry: 'stair' },
    { x: 12, y: 24, to: 'c2-drowned', entry: 'stair', locked: () => !flag('g_recruit_jade-rabbit'), lockedRun: 'c2.uw.drownedLocked' },
  ],
  triggers: [{ x: 12, y: 12, use: true, run: 'c2.uw.stone' }],
  onEnter: 'c2.underway.enter',
  // moonlight spills from the moon door; the drowned stair breathes cold mist
  drawOver(ex, c, ox, oy) {
    const p = tileCenter(ex, 12, 1, ox, oy); const t = G.time;
    glow(c, p.x, p.y - 26, 46 + Math.sin(t * 1.3) * 4, '210,220,250', 0.35);
    c.fillStyle = 'rgba(235,240,255,0.85)'; c.beginPath(); c.arc(p.x, p.y - 34, 7, 0, 7); c.fill();
    c.fillStyle = 'rgba(40,46,70,0.9)'; c.beginPath(); c.arc(p.x + 3, p.y - 36, 6, 0, 7); c.fill();
    const q = tileCenter(ex, 12, 23, ox, oy);
    glow(c, q.x, q.y, 34, flag('g_recruit_jade-rabbit') ? '160,230,200' : '60,90,120', 0.25);
  },
};

// ======================================================================= The Moon: the cassia tree
const mn = grid(36, 34, ' ', 2);
mn.disc(18, 15, 15, 'd', 2);
mn.each((x, y, c) => { if (c === 'd' && (x - 18) ** 2 + (y - 15) ** 2 > 13.6 ** 2 && noise(x, y, 11) < 0.45) mn.set(x, y, ' '); });
mn.sprinkle(0, 0, 35, 33, 'd', '.', 0.07, 12).sprinkle(0, 0, 35, 33, 'd', 'G', 0.03, 13);
mn.disc(10, 20, 2.3, 'd', 1).disc(24, 7, 2, 'd', 1).disc(28, 18, 1.6, 'd', 1).disc(8, 10, 1.5, 'd', 1);   // little craters
mn.path([[25, 27], [25, 22], [21, 22], [21, 16], [17, 16], [17, 11]], 'f', 2).path([[17, 11], [13, 11], [13, 4]], 'f', 2).path([[21, 16], [27, 16], [27, 9], [31, 9]], 'f', 2);
mn.rect(14, 7, 17, 10, '.', 2).set(15, 7, 'G').set(17, 8, 'G');
mn.path([[25, 28], [25, 33]], 'f', 2).set(25, 30, 'f', 1).set(25, 31, 'f', 1).set(25, 32, 'f', 0).set(25, 33, 'f', 0);   // the moonbeam stair
mn.set(13, 3, 'f', 2).set(31, 8, 'f', 2).set(32, 9, 'f', 2).set(31, 9, 'f', 2);
const MN = mn.out();
const moon = {
  name: 'The Moon', world: 'moon', area: 'moon', battle: 'moon', music: 'm-moon', ambience: [['wind', 0.12]], sky: '#14122a',
  tiles: MN.tiles, heights: MN.heights,
  entries: { stair: [25, 30, 'ne'], palace: [13, 5, 'sw'], craters: [30, 9, 'nw'], tree: [18, 12, 'nw'] },
  props: [
    { id: 'prop-cassia-tree', x: 15, y: 8, w: 2, h: 2 }, ['prop-mortar', 13, 9],
    ['prop-crater-rock', 8, 18], ['prop-crater-rock', 12, 21], ['prop-crater-rock', 26, 6], ['prop-crater-rock', 29, 19], ['prop-crater-rock', 6, 9],
    ['prop-crater-rock', 20, 26], ['prop-crater-rock', 31, 14], ['prop-star-rock', 9, 14], ['prop-lantern', 12, 4], ['prop-lantern', 14, 4],
    ['prop-lantern-tree', 22, 11], ['prop-lantern-tree', 9, 6], ['prop-crater-rock', 4, 16], ['prop-lantern', 24, 27], ['prop-lantern', 26, 27],
  ],
  npcs: [
    { id: 'wu-gang', x: 17, y: 9, facing: 'nw', talk: 'c2.wugang' },
    { id: 'jade-rabbit', x: 14, y: 10, facing: 'ne', talk: 'c2.jade.tree', cond: () => !flag('g_recruit_jade-rabbit') },
    { id: 'traveller', x: 22, y: 18, facing: 'se', talk: 'c2.traveller', cond: () => !flag('c2_traveller') },
    { id: 'moon-hare-1', sprite: 'moon-hare', x: 28, y: 12, facing: 'sw', talk: 'c2.moonhare' },
  ],
  enemies: [
    { id: 'mne1', type: 'dust-hopper', x: 19, y: 25, loop: [[19, 25], [22, 25], [22, 23], [19, 23]], encounter: 'c2.mn-1' },
    { id: 'mne2', type: 'dust-hopper', x: 11, y: 15, loop: [[11, 15], [14, 15], [14, 13], [11, 13]], encounter: 'c2.mn-2' },
    { id: 'mne3', type: 'lantern-moth', x: 24, y: 11, loop: [[24, 11], [25, 11], [25, 14], [24, 14]], encounter: 'c2.mn-3' },
  ],
  doors: [
    { x: 25, y: 33, to: 'c2-underway', entry: 'moon' },
    { x: 13, y: 3, to: 'c2-moon-palace', entry: 'south' },
    { x: 32, y: 9, to: 'c2-moon-craters', entry: 'moon', locked: () => !flag('c2_metChange'), lockedRun: 'c2.moon.cratersLocked' },
  ],
  chests: [{ id: 'mn-c1', x: 6, y: 21, give: { buttons: 75, mooncake: 2 } }, { id: 'mn-c2', x: 30, y: 17, give: { buttons: 60, 'pluck-berry': 2 } }],
  onEnter: 'c2.moon.enter',
  drawBack: moonBack,
  // the moonbeam stair glows; Wu Gang's axe bites; silver dust drifts up
  drawGround(ex, c, ox, oy) {
    for (let y = 28; y <= 33; y++) { const p = tileCenter(ex, 25, y, ox, oy); glow(c, p.x, p.y, 22, '220,230,255', 0.22); }
  },
  drawOver(ex, c, ox, oy) { motes(c, G.time, 40); },
  update(ex, dt) {
    ex._chop = (ex._chop || 0) + dt;
    if (ex._chop > 2.4) {
      ex._chop = 0;
      const d = Math.abs(ex.b.x - 17) + Math.abs(ex.b.y - 9);
      if (d < 12 && !ex.busy) { G.audio && 0; import('../../engine/audio.js').then(m => m.audio.sfx('thump-1', { vol: 0.18 * (1 - d / 12), pitch: 1.6 })); }
      const s = toScreen(16, 9, ex.hAt(16, 9)); for (let i = 0; i < 4; i++) ex.fx.push({ k: 'spark', x: s.x + 6 + i * 3, y: s.y - 6 - i * 2, t: 0, life: 0.6 });
    }
  },
};

// ======================================================================= The Moon Palace
const mp = grid(28, 26, ' ', 1);
mp.rect(3, 3, 24, 22, 'f', 1).rect(3, 3, 24, 6, 'f', 2).rect(11, 2, 15, 2, 'f', 2);
mp.sprinkle(3, 7, 24, 22, 'f', 'd', 0.12, 14);
mp.rect(4, 8, 8, 20, 'G', 1).rect(18, 8, 23, 20, 'G', 1).sprinkle(4, 8, 23, 20, 'G', '.', 0.5, 15);
mp.path([[13, 7], [13, 24]], 'f', 1).rect(12, 7, 14, 22, 'f', 1).set(13, 23, 'f', 1).set(13, 24, 'f', 1);
const MP = mp.out();
const palace = {
  name: 'The Moon Palace', world: 'moon', area: 'moon', battle: 'moon', music: 'm-moon', sky: '#14122a', tiles: MP.tiles, heights: MP.heights,
  entries: { south: [13, 22, 'ne'] },
  props: [
    { id: 'prop-palace-gate', x: 12, y: 2, w: 3, h: 1, whole: true }, { id: 'prop-palace-screen', x: 5, y: 4, w: 2, h: 1 }, { id: 'prop-palace-screen', x: 20, y: 4, w: 2, h: 1 },
    ['prop-lantern', 11, 8], ['prop-lantern', 15, 8], ['prop-lantern', 11, 12], ['prop-lantern', 15, 12], ['prop-lantern', 11, 16], ['prop-lantern', 15, 16], ['prop-lantern', 11, 20], ['prop-lantern', 15, 20],
    ['prop-lantern-tree', 4, 7], ['prop-lantern-tree', 23, 7], ['prop-lantern-tree', 4, 21], ['prop-lantern-tree', 23, 21], ['prop-cassia-tree', 7, 13, 2, 2], ['prop-mortar', 20, 11], ['prop-crater-rock', 21, 17],
  ],
  npcs: [
    { id: 'change', x: 13, y: 4, facing: 'sw', talk: 'c2.change' },
    { id: 'moon-hare-2', sprite: 'moon-hare', x: 7, y: 10, facing: 'se', talk: 'c2.moonhare' },
    { id: 'moon-hare-3', sprite: 'moon-hare', x: 19, y: 15, facing: 'sw', talk: 'c2.moonhare' },
  ],
  enemies: [{ id: 'mpe1', type: 'lantern-moth', x: 20, y: 19, loop: [[20, 19], [22, 19], [22, 13], [20, 13]], encounter: 'c2.mn-4' }],
  doors: [{ x: 13, y: 24, to: 'c2-moon', entry: 'palace' }],
  triggers: [
    { x: 11, y: 8, use: true, run: 'c2.palace.lantern' }, { x: 15, y: 8, use: true, run: 'c2.palace.lantern' }, { x: 11, y: 12, use: true, run: 'c2.palace.lantern' },
    { x: 15, y: 12, use: true, run: 'c2.palace.lantern' }, { x: 11, y: 16, use: true, run: 'c2.palace.lantern' }, { x: 15, y: 16, use: true, run: 'c2.palace.lantern' },
  ],
  chests: [{ id: 'mp-c1', x: 22, y: 5, give: { buttons: 75, mooncake: 2 } }],
  drawBack: moonBack,
  drawOver(ex, c, ox, oy) {
    for (const [x, y] of [[11, 8], [15, 8], [11, 12], [15, 12], [11, 16], [15, 16], [11, 20], [15, 20]]) { const p = tileCenter(ex, x, y, ox, oy); glow(c, p.x, p.y - 18, 20 + Math.sin(G.time * 2 + x) * 2, '255,190,120', 0.3); }
    motes(c, G.time, 24, '255,235,200');
  },
};

// ======================================================================= The crater warren of the Moon Hares
const mc = grid(34, 30, ' ', 2);
mc.disc(17, 15, 16, 'd', 2);
mc.each((x, y, c) => { if (c === 'd' && (x - 17) ** 2 + (y - 15) ** 2 > 14.5 ** 2 && noise(x, y, 21) < 0.5) mc.set(x, y, ' '); });
mc.disc(12, 12, 4.2, 'd', 1).disc(12, 12, 2.4, '.', 1).disc(22, 18, 4, 'd', 1).disc(22, 18, 2, 'G', 1).disc(24, 8, 2.6, 'd', 1);
mc.sprinkle(0, 0, 33, 29, 'd', '.', 0.06, 22);
mc.path([[4, 25], [8, 25], [8, 18], [16, 18], [16, 10], [27, 10], [27, 5], [28, 3]], 'f', 2);
mc.set(3, 26, 'f', 2).set(3, 27, 'f', 2).set(4, 26, 'f', 2).set(28, 2, 'f', 2);
const MC = mc.out();
const craters = {
  name: 'The Crater Warren', world: 'moon', area: 'moon', battle: 'moon', music: 'm-moon', sky: '#14122a', tiles: MC.tiles, heights: MC.heights,
  entries: { moon: [5, 25, 'ne'], grove: [27, 5, 'sw'] },
  props: [
    ['prop-hare-burrow', 11, 10], ['prop-hare-burrow', 14, 13], ['prop-hare-burrow', 10, 14], ['prop-hare-burrow', 21, 16], ['prop-hare-burrow', 24, 19], ['prop-hare-burrow', 25, 7],
    ['prop-crater-rock', 8, 9], ['prop-crater-rock', 16, 15], ['prop-crater-rock', 19, 21], ['prop-crater-rock', 26, 14], ['prop-crater-rock', 5, 18], ['prop-crater-rock', 29, 20],
    { id: 'prop-store-counter', x: 18, y: 6, w: 2, h: 1 }, ['prop-rest-stone', 13, 19], ['prop-lantern', 17, 7], ['prop-lantern', 21, 7], ['prop-lantern-tree', 6, 6], ['prop-lantern-tree', 30, 13],
  ],
  npcs: [
    { id: 'moon-toad', x: 20, y: 6, facing: 'sw', talk: 'c2.moontoad' },
    { id: 'hare-elder', sprite: 'moon-hare', x: 12, y: 11, facing: 'se', talk: 'c2.hare.elder' },
    { id: 'moon-hare-4', sprite: 'moon-hare', x: 23, y: 17, facing: 'sw', talk: 'c2.moonhare' },
    { id: 'moon-hare-5', sprite: 'moon-hare', x: 10, y: 13, facing: 'ne', talk: 'c2.moonhare' },
  ],
  enemies: [
    { id: 'mce1', type: 'dust-hopper', x: 7, y: 21, loop: [[7, 21], [9, 21], [9, 23], [7, 23]], encounter: 'c2.mn-5' },
    { id: 'mce2', type: 'lantern-moth', x: 24, y: 11, loop: [[24, 11], [26, 11], [26, 12], [24, 12]], encounter: 'c2.mn-6' },
  ],
  doors: [{ x: 3, y: 27, to: 'c2-moon', entry: 'craters' }, { x: 28, y: 2, to: 'c2-moon-grove', entry: 'craters', locked: () => !flag('c2_hares'), lockedRun: 'c2.craters.groveLocked' }],
  triggers: [{ x: 13, y: 19, use: true, run: 'c2.rest' }],
  chests: [{ id: 'mc-c1', x: 29, y: 21, give: { buttons: 70, 'jade-elixir': 1 } }, { id: 'mc-c2', x: 4, y: 12, give: { buttons: 50, mooncake: 1 } }],
  drawBack: moonBack,
  drawOver(ex, c, ox, oy) { motes(c, G.time, 30); },
};

// ======================================================================= The lantern grove
const mg = grid(30, 30, ' ', 2);
mg.disc(15, 15, 14.5, '.', 2);
mg.each((x, y, c) => { if (c === '.' && (x - 15) ** 2 + (y - 15) ** 2 > 13 ** 2 && noise(x, y, 31) < 0.45) mg.set(x, y, ' '); });
mg.sprinkle(0, 0, 29, 29, '.', 'd', 0.3, 32).sprinkle(0, 0, 29, 29, '.', 'G', 0.05, 33);
mg.path([[26, 27], [24, 27], [24, 20], [17, 20], [17, 14], [12, 14], [12, 9], [9, 9]], 'f', 2).set(26, 28, 'f', 2).set(27, 28, 'f', 2);
mg.disc(8, 7, 3.3, 'd', 2);
const MG = mg.out();
const groveTrees = [[5, 12], [9, 15], [14, 10], [16, 6], [20, 16], [21, 23], [27, 18], [13, 24], [6, 20], [19, 9], [3, 7], [11, 4], [25, 12], [8, 27]];
const grove = {
  name: 'The Lantern Grove', world: 'moon', area: 'moon', battle: 'moon', sky: '#100e22', tiles: MG.tiles, heights: MG.heights,
  music: () => (flag('c2_mothQueen') ? 'm-moon' : 'm-deep'),
  get dark() { return flag('c2_mothQueen') ? 0.15 : 0.35; },
  get tint() { return flag('c2_mothQueen') ? null : 'rgba(90,60,140,0.12)'; },
  entries: { craters: [25, 27, 'nw'], clearing: [10, 9, 'nw'] },
  props: [...groveTrees.map(([x, y]) => ['prop-lantern-tree', x, y]), ['prop-rest-stone', 23, 25], ['prop-lantern', 6, 9], ['prop-crater-rock', 10, 5], ['prop-mortar', 7, 5]],
  npcs: [
    { id: 'moth-queen', x: 7, y: 7, facing: 'se', talk: 'c2.mothqueen', cond: () => !flag('c2_mothQueen') },
    { id: 'grove-hare-1', sprite: 'moon-hare', x: 12, y: 11, facing: 'nw', talk: 'c2.hare.grove', cond: () => flag('c2_hares') },
    { id: 'grove-hare-2', sprite: 'moon-hare', x: 10, y: 11, facing: 'nw', talk: 'c2.hare.grove', cond: () => flag('c2_hares') },
    { id: 'wick', x: 8, y: 9, facing: 'se', talk: 'c2.wick', cond: () => flag('c2_mothQueen') && !flag('g_recruit_wick') && !flag('c2_wickFollows') },
    { id: 'wick-moth-1', sprite: 'lantern-moth', x: 5, y: 8, facing: 'se', talk: 'c2.grove.moth', cond: () => flag('c2_mothQueen') },
    { id: 'wick-moth-2', sprite: 'lantern-moth', x: 9, y: 6, facing: 'sw', talk: 'c2.grove.moth', cond: () => flag('c2_mothQueen') },
  ],
  enemies: [
    { id: 'mge1', type: 'lantern-moth', x: 23, y: 22, loop: [[23, 22], [25, 22], [25, 20], [23, 20]], encounter: 'c2.mg-1', cond: () => !flag('c2_mothQueen') },
    { id: 'mge2', type: 'lantern-moth', x: 18, y: 18, loop: [[18, 18], [20, 18], [20, 19], [18, 19]], encounter: 'c2.mg-2', cond: () => !flag('c2_mothQueen') },
    { id: 'mge3', type: 'lantern-moth', x: 16, y: 13, loop: [[16, 13], [18, 13], [18, 15], [16, 15]], encounter: 'c2.mg-3', cond: () => !flag('c2_mothQueen') },
    { id: 'mge4', type: 'dust-hopper', x: 13, y: 12, loop: [[13, 12], [13, 10], [11, 10], [11, 12]], encounter: 'c2.mg-4', cond: () => !flag('c2_mothQueen') },
  ],
  doors: [{ x: 27, y: 28, to: 'c2-moon-craters', entry: 'grove' }, { x: 26, y: 28, to: 'c2-moon-craters', entry: 'grove' }],
  triggers: [{ x: 23, y: 25, use: true, run: 'c2.rest' }, { x: 6, y: 9, use: true, run: 'c2.grove.lantern' }, { id: 'clearing', x: 9, y: 8, w: 3, h: 3, once: true, run: 'c2.grove.clearing', cond: () => !flag('c2_mothQueen') }],
  chests: [{ id: 'mg-c1', x: 3, y: 15, give: { buttons: 80, mooncake: 1, 'pluck-berry': 1 } }],
  drawBack(ex, c) { stars(c, 9, 90, G.time, '220,200,255'); },
  drawOver(ex, c, ox, oy) {
    const lit = flag('c2_groveLit'), done = flag('c2_mothQueen');
    for (const [x, y] of groveTrees) {
      const p = tileCenter(ex, x, y, ox, oy);
      const rgb = lit ? '255,210,120' : done ? '200,200,230' : '150,200,255';
      glow(c, p.x, p.y - 30, lit ? 26 : 14, rgb, lit ? 0.35 : done ? 0.08 : 0.18 + 0.1 * Math.sin(G.time * 3 + x));
    }
    if (lit) { const p = tileCenter(ex, 6, 9, ox, oy); glow(c, p.x, p.y - 20, 36, '255,200,110', 0.45); }
    motes(c, G.time, lit ? 40 : 18, lit ? '255,220,150' : '180,170,240');
  },
};

// ======================================================================= The Drowned Halls
const LEG_DROWNED = { W: { k: 'water', walk: 1 }, ...LEG_LOW };
const dr = grid(40, 36, '%', 0);
dr.rect(24, 24, 37, 33, 'o', 0).rect(30, 24, 31, 33, '~', 0).rect(30, 28, 31, 29, 'o', 0);     // hall one, a black channel down the middle
dr.rect(36, 34, 37, 35, 'o', 0);
dr.rect(16, 27, 23, 29, 'o', 0);                                                                  // corridor west
dr.rect(4, 22, 16, 34, 'o', 0).sprinkle(4, 22, 16, 34, 'o', 'W', 0.35, 41).rect(7, 29, 10, 32, '~', 0).rect(12, 23, 14, 25, '~', 0); // hall two, flooded
dr.rect(8, 12, 10, 21, 'o', 0).sprinkle(8, 12, 10, 21, 'o', 'W', 0.3, 42);                      // the stair north
dr.rect(4, 3, 20, 11, 'o', 0).rect(4, 3, 20, 3, 'o', 0).sprinkle(5, 4, 19, 10, 'o', 'W', 0.15, 43);  // hall three, the eye door
dr.rect(14, 6, 18, 9, 'e', 0).set(16, 7, 'a').set(15, 8, 'a');                                   // where Tansy has been digging
dr.rect(21, 6, 31, 8, 'o', 0).set(32, 7, 'o', 0);                                                 // the way to the pool
dr.rect(25, 13, 29, 16, 'o', 0).path([[27, 9], [27, 13]], 'o', 0);                              // a side room
dr.rect(5, 4, 5, 4, 'o').rect(12, 2, 12, 2, 'o', 0);
const DR = dr.trim().out();
const carvings = [[24, 25, 'se'], [37, 25, 'sw'], [24, 32, 'ne'], [4, 23, 'se'], [16, 24, 'sw'], [4, 33, 'ne'], [4, 5, 'se'], [20, 5, 'sw'], [11, 12, 'sw']];
const drownedTracks = line([[36, 33], [36, 28], [17, 28], [17, 27], [9, 27], [9, 10], [14, 10], [14, 8]]);
const drowned = {
  name: 'The Drowned Halls', world: 'depths', area: 'drowned', battle: 'drowned', dark: 0.5, music: 'm-drowned', ambience: [['drone-bed', 0.4], ['river', 0.15], ['hum', 0.15]],
  tiles: DR.tiles, heights: DR.heights, legend: LEG_DROWNED,
  entries: { stair: [36, 33, 'nw'], pool: [31, 7, 'nw'], tansy: [16, 10, 'ne'] },
  props: [
    ['prop-drowned-column', 26, 26], ['prop-drowned-column', 34, 26], ['prop-drowned-column', 26, 31], ['prop-drowned-column', 34, 31],
    ['prop-drowned-column', 6, 24], ['prop-drowned-column', 15, 28], ['prop-drowned-column', 6, 33], ['prop-drowned-column', 15, 33],
    ['prop-drowned-column', 6, 6], ['prop-drowned-column', 18, 4], ['prop-drowned-column', 6, 10], ['prop-carved-pillar', 8, 12], ['prop-carved-pillar', 10, 12],
    { id: 'prop-door-eye', x: 12, y: 2, whole: true }, ['prop-stone-face', 28, 13], ['prop-pool-rock', 13, 22], ['prop-glow-crystal', 37, 28], ['prop-glow-crystal', 4, 28],
    ['prop-rubble', 17, 6], ['prop-rest-stone', 5, 3],   // fullrun run 2: a rest stone in Tansy's hall (three fights on the way in, no rest before her: the run lost her twice)
    ['prop-carved-rock', 29, 15], ['prop-bones', 22, 8, 2, 1],
  ],
  npcs: [
    ...carvings.map(([x, y, f], i) => ({ id: 'carving-' + i, sprite: 'moving-carving', x, y, facing: f, carving: true, talk: 'c2.dr.carving' })),
    { id: 'tansy', x: 16, y: 7, facing: 'ne', hum: true, talk: 'c2.tansy.dig', cond: () => !flag('g_recruit_tansy') },
  ],
  enemies: [
    { id: 'dre1', type: 'cold-ripple', x: 28, y: 27, loop: [[28, 27], [28, 30], [27, 30], [27, 27]], encounter: 'c2.dr-1' },
    { id: 'dre2', type: 'drowned-eye', x: 20, y: 28, loop: [[20, 28], [18, 28], [18, 27], [20, 27]], encounter: 'c2.dr-2' },
    { id: 'dre3', type: 'cold-ripple', x: 11, y: 27, loop: [[11, 27], [11, 26], [8, 26], [8, 27]], encounter: 'c2.dr-3' },
    { id: 'dre4', type: 'moving-carving', x: 9, y: 17, loop: [[9, 17], [9, 15], [10, 15], [10, 17]], encounter: 'c2.dr-4' },
    { id: 'dre5', type: 'drowned-eye', x: 26, y: 7, loop: [[26, 7], [29, 7], [29, 6], [26, 6]], encounter: 'c2.dr-5' },
  ],
  doors: [{ x: 37, y: 35, to: 'c2-underway', entry: 'drowned' }, { x: 36, y: 35, to: 'c2-underway', entry: 'drowned' },
    { x: 32, y: 7, to: 'c2-drowned-pool', entry: 'halls', locked: () => !flag('g_recruit_tansy'), lockedRun: 'c2.dr.poolLocked' }],
  triggers: [{ x: 5, y: 3, use: true, run: 'c2.rest' }, { x: 12, y: 2, use: true, run: 'c2.dr.eyedoor' }, { x: 12, y: 3, use: true, here: true, run: 'c2.dr.eyedoor' }, { id: 'seeTansy', x: 9, y: 11, w: 3, h: 1, once: true, run: 'c2.dr.seeTansy', cond: () => !flag('g_recruit_tansy') }],
  chests: [{ id: 'dr-c1', x: 36, y: 24, give: { buttons: 80, 'jade-elixir': 1 } }, { id: 'dr-c2', x: 28, y: 14, give: { buttons: 85, dandelion: 2 } }, { id: 'dr-c3', x: 4, y: 11, give: { 'moon-silk+3': 1 } }],
  onEnter: 'c2.drowned.enter',
  onHop(ex, x, y) {
    const t = ex.tile(x, y), wet = t && t.ch === 'W';
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const n = ex.tile(x + dx, y + dy); return n && n.water; });
    if (wet || near) import('../../engine/audio.js').then(m => m.audio.sfx('water-step', { vol: wet ? 0.45 : 0.25 }));
  },
  // the carvings turn their heads to watch Bramble go by
  update(ex, dt) {
    ex._look = (ex._look || 0) + dt; if (ex._look < 0.25) return; ex._look = 0;
    for (const a of ex.map.actors) {
      if (!a.carving) continue;
      const dx = ex.b.x - a.x, dy = ex.b.y - a.y; const d = Math.abs(dx) + Math.abs(dy);
      if (d > 7) continue;
      const f = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'se' : 'nw') : (dy > 0 ? 'sw' : 'ne');
      if (a.facing !== f) { a.facing = f; if (d <= 3 && !a.emote) { a.emote = '!'; setTimeout(() => { a.emote = null; }, 700); } }
    }
  },
  // Tansy's pawprints (the quest says follow them): from the stair, west through the halls, north up the narrow stair
  drawGround(ex, c, ox, oy) {
    if (flag('g_recruit_tansy')) return;
    drownedTracks.forEach(([x, y], i) => {
      const p = tileCenter(ex, x, y, ox, oy); const s = i % 2 ? 3 : -3;
      c.fillStyle = 'rgba(244,224,172,0.85)'; c.fillRect(p.x + s - 1, p.y - 1, 3, 2); c.fillRect(p.x + s - 2, p.y - 3, 1, 1); c.fillRect(p.x + s, p.y - 4, 1, 1); c.fillRect(p.x + s + 2, p.y - 3, 1, 1);
    });
  },
  drawOver(ex, c, ox, oy) {
    // the shut eye on the door seems to flutter now and then
    const p = tileCenter(ex, 12, 2, ox, oy); const k = (Math.sin(G.time * 0.7) + 1) / 2;
    glow(c, p.x, p.y - 30, 30, '120,170,220', 0.12 + 0.12 * k);
  },
};

// ======================================================================= The Tidewarden's pool
const dw = grid(30, 30, '%', 0);
dw.disc(15, 15, 12.4, 'o', 0).disc(15, 15, 7.4, '~', 0);
dw.sprinkle(0, 0, 29, 29, 'o', 'W', 0.12, 51);
dw.rect(1, 14, 3, 16, 'o', 0).set(0, 15, 'o', 0);
dw.rect(8, 15, 11, 15, 'o', 0);   // a broken jetty out into the black water
const DW = dw.trim().out();
const pool = {
  name: 'The Drowned Pool', world: 'depths', area: 'drowned', battle: 'drowned', dark: 0.55, music: () => (flag('g_ch2_done') ? 'm-drowned' : 'm-deep'),
  ambience: [['drone-bed', 0.5], ['river', 0.2]], tiles: DW.tiles, heights: DW.heights, legend: LEG_DROWNED,
  entries: { halls: [3, 15, 'se'] },
  props: [['prop-rest-stone', 4, 13], ['prop-drowned-column', 6, 6], ['prop-drowned-column', 24, 6], ['prop-drowned-column', 6, 24], ['prop-drowned-column', 24, 24],
    ['prop-drowned-column', 15, 3], ['prop-drowned-column', 15, 27], ['prop-stone-face', 26, 15], ['prop-glow-crystal', 4, 18], ['prop-pool-rock', 7, 13]],
  enemies: [
    { id: 'dwe1', type: 'cold-ripple', x: 15, y: 4, loop: [[13, 5], [17, 5], [17, 4], [13, 4]], encounter: 'c2.dr-6', cond: () => !flag('g_ch2_done') },
    { id: 'dwe2', type: 'moving-carving', x: 15, y: 26, loop: [[13, 25], [17, 25], [17, 26], [13, 26]], encounter: 'c2.dr-7', cond: () => !flag('g_ch2_done') },
  ],
  doors: [{ x: 0, y: 15, to: 'c2-drowned', entry: 'pool' }],
  triggers: [{ x: 4, y: 13, use: true, run: 'c2.rest' }, { id: 'jetty', x: 11, y: 15, run: 'c2.tidewarden', cond: () => !flag('g_ch2_done') }],
  chests: [{ id: 'dw-c1', x: 25, y: 20, give: { buttons: 90, 'carrot-cake': 2 } }],
  onEnter: 'c2.pool.enter',
  onHop: drowned.onHop,
  drawOver(ex, c, ox, oy) {
    if (flag('g_ch2_done')) return;
    // a ring of pale eyes, far down under the water, opening and closing out of time
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * Math.PI * 2 + G.time * 0.05, r = 4 + (i % 3);
      const p = tileCenter(ex, Math.round(15 + Math.cos(a) * r), Math.round(15 + Math.sin(a) * r), ox, oy);
      const open = Math.max(0, Math.sin(G.time * 0.6 + i * 1.7));
      if (open < 0.1) continue;
      c.fillStyle = `rgba(200,230,240,${0.35 * open})`; c.fillRect(p.x - 4, p.y - 1, 9, Math.max(1, Math.round(3 * open)));
      c.fillStyle = `rgba(20,30,40,${0.6 * open})`; c.fillRect(p.x - 1, p.y - 1, 3, Math.max(1, Math.round(3 * open)));
    }
  },
};

export const maps = {
  'c2-silverdown': silverdown, 'c2-silverdown-warren': silverdownWarren, 'c2-depths': depths, 'c2-underway': underway,
  'c2-moon': moon, 'c2-moon-palace': palace, 'c2-moon-craters': craters, 'c2-moon-grove': grove,
  'c2-drowned': drowned, 'c2-drowned-pool': pool,
};
