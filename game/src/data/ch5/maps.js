// The Finale's maps: the Sleeping Deep (the gathering and the Long Thump), the Dream (upside-down Sorrel Down
// under a black sun), and Sorrel Down at sunset (the ending, and wandering afterwards).
import { flag } from '../../state.js';
import { G, W, H } from '../../core.js';
import { travelling, hasMember } from '../../state.js';
import { toScreen } from '../../engine/iso.js';

// drop props whose footprint would hang over the void
function onLand(tiles, props) {
  return props.filter(p => { const [x, y, w, h] = Array.isArray(p) ? [p[1], p[2], p[3] || 1, p[4] || 1] : [p.x, p.y, p.w || 1, p.h || 1]; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((tiles[y + j] || '')[x + i] === undefined || tiles[y + j][x + i] === ' ') return false; return true; });
}
// build a map's rows from a function (x, y) -> tile char
function grid(w, h, f) { const rows = []; for (let y = 0; y < h; y++) { let r = ''; for (let x = 0; x < w; x++) r += f(x, y); rows.push(r); } return rows; }
const wob = (x, y, n = 5) => ((x * 13 + y * 7 + ((x * y) % 3)) % n) - Math.floor(n / 2);
const notTravelling = id => () => hasMember(id) && !travelling().includes(id);
const recruited = id => () => flag('g_recruit_' + id);

// ---------------------------------------------------------------- the Sleeping Deep
const DEEP_W = 28, DEEP_H = 28;
const deepTiles = grid(DEEP_W, DEEP_H, (x, y) => {
  if (x === 0 || y === 0) return '%';
  if ((x === 1 && y > 8 && y < 13) || (y === 1 && x > 10 && x < 15)) return '%';
  if (x + y > 43 + wob(x, y) || x > 26 || y > 26) return ' ';
  if ((x >= 3 && x <= 5 && y >= 16 && y <= 19) || (x >= 16 && x <= 19 && y >= 3 && y <= 5)) return '~';
  if (Math.abs(x - y) <= 1 && x + y < 42) return 'o';
  if ((x + y) % 7 === 0 && Math.abs(x - y) > 3) return 'o';
  return 'f';
});
const deepHeights = grid(DEEP_W, DEEP_H, (x, y) => {
  if (x === 0 || y === 0) return '1';
  if (x + y <= 6) return '1';
  if ((x <= 2 && y >= 4 && y <= 8) || (y <= 2 && x >= 5 && x <= 9)) return '1';
  return '0';
});

// the gathering: who stands where in the Sleeping Deep ([id, sprite, x, y, facing, extra])
const R = (id, sprite, fur, x, y, facing, extra = {}) => ({ id, sprite, fur, x, y, facing, talk: 'c5.deep.talk', ...extra });
export const DEEP_CROWD = [
  // Thimblebank
  { id: 'woodruff', x: 10, y: 7, facing: 'se', talk: 'c5.deep.talk', group: 0 },
  { id: 'mallow', x: 12, y: 8, facing: 'sw', talk: 'c5.deep.talk', group: 0 },
  { id: 'comfrey', x: 8, y: 10, facing: 'se', talk: 'c5.deep.talk', group: 0 },
  R('tb-1', 'rabbit-buck', 'brown', 13, 10, 'sw', { group: 0 }), R('tb-2', 'rabbit-doe', 'grey', 9, 12, 'se', { group: 0 }), R('tb-3', 'rabbit-kit', 'brown', 11, 9, 'se', { group: 0, kid: true }),
  // Silverdown
  { id: 'aster', x: 16, y: 10, facing: 'sw', talk: 'c5.deep.talk', group: 1 },
  R('sd-1', 'rabbit-buck', 'silver', 17, 12, 'sw', { group: 1 }), R('sd-2', 'rabbit-doe', 'cream', 18, 9, 'sw', { group: 1 }), R('sd-3', 'rabbit-kit', 'silver', 15, 12, 'sw', { group: 1, kid: true }),
  // Wheatsheaf
  { id: 'barley', x: 9, y: 15, facing: 'se', talk: 'c5.deep.talk', group: 2 },
  R('ws-1', 'rabbit-buck', 'ginger', 8, 17, 'se', { group: 2 }), R('ws-2', 'rabbit-doe', 'sandy', 11, 17, 'ne', { group: 2 }), R('ws-3', 'rabbit-kit', 'ginger', 10, 13, 'se', { group: 2, kid: true }),
  // Flintcomb
  { id: 'chert', x: 17, y: 14, facing: 'sw', talk: 'c5.deep.talk', group: 3 },
  R('fc-1', 'rabbit-buck', 'dark', 18, 15, 'sw', { group: 3 }), R('fc-2', 'rabbit-doe', 'grey', 19, 13, 'sw', { group: 3 }), R('fc-3', 'rabbit-buck', 'dark', 14, 17, 'nw', { group: 3 }),
  // Deepdelve's echoes (hollow, quiet, standing nearest the dark)
  R('ec-1', 'rabbit-buck', null, 22, 13, 'sw', { group: 4, look: 'hollow' }), R('ec-2', 'rabbit-doe', null, 23, 15, 'sw', { group: 4, look: 'hollow' }),
  R('ec-3', 'rabbit-buck', null, 12, 22, 'ne', { group: 4, look: 'hollow' }), R('ec-4', 'rabbit-kit', null, 14, 23, 'ne', { group: 4, look: 'hollow', kid: true }),
  // the storybook army leaders
  { id: 'white-rabbit', x: 14, y: 11, facing: 'sw', talk: 'c5.deep.talk', group: 5 },
  { id: 'scarecrow', x: 20, y: 10, facing: 'sw', talk: 'c5.deep.talk', group: 5 },
  { id: 'cowardly-lion', x: 21, y: 8, facing: 'sw', talk: 'c5.deep.talk', group: 5 },
  { id: 'mouse-queen', x: 7, y: 13, facing: 'se', talk: 'c5.deep.talk', group: 5 },
  { id: 'monkey-king', x: 7, y: 19, facing: 'ne', talk: 'c5.deep.talk', group: 5 },
  { id: 'wick', x: 19, y: 11, facing: 'sw', talk: 'c5.deep.talk', group: 5, cond: recruited('wick') },
  { id: 'seven-of-spades', sprite: 'card-soldier', x: 12, y: 15, facing: 'se', talk: 'c5.deep.talk', group: 5, cond: recruited('seven-of-spades') },
  { id: 'mastodon', x: 23, y: 6, facing: 'sw', talk: 'c5.deep.talk', group: 5 },
  // the party friends who aren't walking with Bramble right now
  { id: 'burdock', x: 9, y: 6, facing: 'se', talk: 'c5.deep.talk', group: 6, cond: notTravelling('burdock') },
  { id: 'mole', x: 6, y: 9, facing: 'se', talk: 'c5.deep.talk', group: 6, cond: notTravelling('mole') },
  { id: 'ratty', x: 6, y: 11, facing: 'se', talk: 'c5.deep.talk', group: 6, cond: notTravelling('ratty') },
  { id: 'badger', x: 12, y: 5, facing: 'se', talk: 'c5.deep.talk', group: 6, cond: notTravelling('badger') },
  { id: 'toad', x: 14, y: 7, facing: 'sw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('toad') },
  { id: 'cheshire-cat', x: 20, y: 6, facing: 'sw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('cheshire-cat') },
  { id: 'caterpillar', x: 20, y: 16, facing: 'sw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('caterpillar') },
  { id: 'ninefold', x: 21, y: 14, facing: 'sw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('ninefold') },
  { id: 'jade-rabbit', x: 16, y: 8, facing: 'sw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('jade-rabbit') },
  { id: 'tansy', x: 10, y: 19, facing: 'ne', talk: 'c5.deep.talk', group: 6, cond: notTravelling('tansy') },
  { id: 'tin-woodman', x: 12, y: 19, facing: 'ne', talk: 'c5.deep.talk', group: 6, cond: notTravelling('tin-woodman') },
  { id: 'pip', x: 9, y: 20, facing: 'ne', talk: 'c5.deep.talk', group: 6, cond: notTravelling('pip'), kid: true },
  { id: 'captain-quarry', x: 19, y: 16, facing: 'sw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('captain-quarry') },
  { id: 'rumble', x: 16, y: 20, facing: 'nw', talk: 'c5.deep.talk', group: 6, cond: notTravelling('rumble') },
];

// glowing rings on the three stones once the Long Thump has been won
function drawStoneRings(ex, c, ox, oy) {
  if (!flag('g_c5-rts5_won')) return;
  const t = G.time;
  for (const [x, y] of [[22, 17], [20, 21], [17, 22]]) {
    const s = toScreen(x, y, 0); const cx = s.x + ox, cy = s.y + oy + 8;
    c.strokeStyle = `rgba(240,220,140,${0.45 + 0.35 * Math.sin(t * 2.5 + x)})`; c.lineWidth = 1;
    c.beginPath(); c.ellipse(cx, cy, 20 + Math.sin(t * 2.5) * 2, 10, 0, 0, 7); c.stroke();
  }
}

const deep = {
  name: 'The Sleeping Deep', world: 'depths', area: 'finale', music: null, ambience: [['hum', 0.35], ['drone-bed', 0.25]],
  battle: 'root', dark: 0.4, sky: '#07080e',
  tiles: deepTiles, heights: deepHeights,
  entries: { top: [3, 3, 'se'], stones: [18, 18, 'se'], back: [16, 16, 'nw'] },
  props: [
    // the dark edge: roots, mushrooms and old bones where the cavern runs out into nothing
    ...onLand(deepTiles, [['prop-root-pillar', 25, 5], ['prop-lantern-mushroom', 24, 8], ['prop-bones', 23, 19, 2, 1], ['prop-lantern-mushroom', 8, 23],
      ['prop-root-pillar', 4, 24], ['prop-star-rock', 22, 22], ['prop-storyteller-seat', 3, 21], ['prop-lantern-mushroom', 15, 25], ['prop-star-rock', 25, 15]]),
    ['prop-rest-stone', 6, 2], ['prop-giant-root', 2, 5], ['prop-root-pillar', 4, 1], ['prop-root-pillar', 1, 7],
    ['prop-glow-crystal', 7, 4], ['prop-glow-crystal', 15, 2], ['prop-glow-crystal', 2, 14], ['prop-glow-crystal', 24, 10], ['prop-glow-crystal', 6, 23],
    ['prop-star-rock', 10, 2], ['prop-star-rock', 2, 10], ['prop-star-rock', 20, 3], ['prop-carved-pillar', 13, 2], ['prop-carved-pillar', 2, 13],
    ['prop-ruin-arch', 1, 2], ['prop-star-stone', 25, 12], ['prop-star-stone', 11, 24],
    ['prop-thump-stone', 22, 17], ['prop-thump-stone', 20, 21], ['prop-thump-stone', 17, 22],
  ],
  npcs: [
    { id: 'yarrow', x: 19, y: 19, facing: 'nw', talk: 'c5.yarrow.deep' },
    ...DEEP_CROWD,
  ],
  doors: [{ x: 2, y: 2, run: 'c5.deep.back' }],
  triggers: [{ x: 6, y: 2, use: true, run: 'c5.deep.rest' }],
  onEnter: 'c5.deep.enter',
  drawGround: drawStoneRings,
};

// ---------------------------------------------------------------- the Dream: upside-down Sorrel Down
const DR_W = 20, DR_H = 38;
const dreamTiles = grid(DR_W, DR_H, (x, y) => {
  const half = 7 + Math.round(2 * Math.sin(y * 0.45)) + (y < 2 || y > DR_H - 3 ? -3 : 0);
  if (Math.abs(x - 9.5) > half + (wob(x, y, 3) * 0.5)) return ' ';
  if (x === 9 || x === 10) return 'x';
  if ((x === 8 || x === 11) && y % 3 === 0) return 'x';
  if ((x * 5 + y * 3) % 11 === 0) return ',';
  if (y > 12 && y < 20 && (x + y) % 9 === 0) return ';';
  return '.';
});
// upside-down: the downs sink into a bowl instead of rising into hills
const dreamHeights = grid(DR_W, DR_H, (x, y) => { const d = Math.abs(x - 9.5); return d > 6.5 ? '2' : d > 4.5 ? '1' : '0'; });

function dreamStage() { return flag('g_c5_dream_done') ? 3 : flag('c5_p2') ? 2 : flag('c5_p1') ? 1 : 0; }
// the black sun and the hanging hills, drawn behind the map; a little kinder at each stage
function drawDreamBack(ex, c) {
  const st = dreamStage(), t = G.time;
  c.save();
  // the hanging hills of Sorrel Down, upside down along the top of the sky
  const hill = ['#1a2a1e', '#22352a', '#2c4434', '#3a5a44'][st];
  c.fillStyle = hill;
  c.beginPath(); c.moveTo(0, 0);
  for (let x = 0; x <= W; x += 8) c.lineTo(x, 46 + Math.sin(x * 0.012 + 1) * 22 + Math.sin(x * 0.031) * 9);
  c.lineTo(W, 0); c.fill();
  // the warren entrance and the Lookout Stone, hanging the wrong way up
  c.fillStyle = '#0c0c10'; c.beginPath(); c.ellipse(170, 62, 14, 8, 0, 0, 7); c.fill();
  c.fillStyle = '#5a5a64'; c.fillRect(452, 58, 10, 18); c.fillRect(449, 72, 16, 5);
  // the sun: black with a pale ring; it warms at each stage
  const cx = W * 0.74, cy = 64, r = 30;
  const ring = ['rgba(200,180,240,0.55)', 'rgba(220,170,240,0.6)', 'rgba(250,200,170,0.7)', 'rgba(255,220,150,0.9)'][st];
  for (let i = 4; i >= 1; i--) { c.fillStyle = ring.replace(/[\d.]+\)$/, (0.12 * i / 4) + ')'); c.beginPath(); c.arc(cx, cy, r + i * 9 + Math.sin(t * 1.3) * 2, 0, 7); c.fill(); }
  c.strokeStyle = ring; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r + 2, 0, 7); c.stroke();
  c.fillStyle = st === 3 ? '#f4c070' : '#050308'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
  if (st === 1 || st === 2) {
    // the stranger middle: a ring of tiny eyes around the sun, blinking
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + t * 0.15; const ex2 = cx + Math.cos(a) * (r + 18), ey = cy + Math.sin(a) * (r + 18); const open = Math.sin(t * 2 + i * 1.7) > -0.3; c.fillStyle = '#e8e0f4'; c.fillRect(ex2 - 3, ey - (open ? 1 : 0), 6, open ? 3 : 1); if (open) { c.fillStyle = '#2a1840'; c.fillRect(ex2 - 1, ey, 2, 2); } }
  }
  // drifting motes falling upward
  for (let i = 0; i < 28; i++) { const x = (i * 97 + t * (6 + i % 5)) % W, y = H - ((i * 53 + t * (10 + i % 7)) % H); c.fillStyle = st === 3 ? 'rgba(255,230,170,0.7)' : 'rgba(190,170,240,0.55)'; c.fillRect(Math.round(x), Math.round(y), 2, 2); }
  c.restore();
}
const dreamTint = ['rgba(70,30,120,0.30)', 'rgba(90,20,110,0.34)', 'rgba(120,70,130,0.22)', 'rgba(255,190,120,0.14)'];
const dreamSky = ['#0b0714', '#0d0610', '#1a1020', '#3a2a3a'];

const dream = {
  name: 'The Dream', world: 'downs', area: 'dream', music: 'm-dream', ambience: [['hum', 0.15]], battle: 'dream',
  get tint() { return dreamTint[dreamStage()]; },
  get sky() { return dreamSky[dreamStage()]; },
  tiles: dreamTiles, heights: dreamHeights,
  entries: { start: [9, 2, 'se'], eye: [10, 30, 'se'] },
  props: onLand(dreamTiles, [
    ['prop-rest-stone', 12, 3], ['prop-lookout-stone', 6, 5], ['prop-hawthorn', 14, 6], ['prop-dandelions', 5, 8], ['prop-gorse', 15, 10],
    ['prop-willow', 4, 13], ['prop-reeds', 15, 13], ['prop-tea-table', 12, 16, 3, 1], ['prop-armchair', 15, 17], ['prop-cassia-tree', 3, 18, 2, 2],
    ['prop-lantern', 6, 21], ['prop-lantern-mushroom', 13, 21], ['prop-dandelions', 14, 23], ['prop-lantern-mushroom', 5, 24], ['prop-oz-tree', 6, 25],
    ['prop-giant-mushroom', 12, 26, 2, 2], ['prop-glow-crystal', 15, 28], ['prop-star-rock', 6, 31], ['prop-chalk-boulder', 14, 32], ['prop-dandelions', 12, 34],
  ]),
  npcs: [
    { id: 'nightmare-deepdelve', sprite: 'rabbit-buck', look: 'hollow', scale: 2, x: 9, y: 11, facing: 'nw', talk: 'c5.dream.phase1', cond: () => !flag('c5_p1') },
    { id: 'nightmare-flintcomb', sprite: 'quarryman', look: 'dream', scale: 2, hum: true, x: 10, y: 22, facing: 'nw', talk: 'c5.dream.phase2', cond: () => !flag('c5_p2') },
    { id: 'eye', sprite: 'drowned-eye', look: 'dream', x: 10, y: 33, facing: 'nw', talk: 'c5.dream.phase3', cond: () => !flag('g_c5_dream_done') },
  ],
  triggers: [
    { x: 2, y: 9, w: 16, h: 1, run: 'c5.dream.phase1', cond: () => !flag('c5_p1') },
    { x: 2, y: 20, w: 16, h: 1, run: 'c5.dream.phase2', cond: () => flag('c5_p1') && !flag('c5_p2') },
    { x: 2, y: 31, w: 16, h: 1, run: 'c5.dream.phase3', cond: () => flag('c5_p2') && !flag('g_c5_dream_done') },
    { x: 12, y: 3, use: true, run: 'c5.dream.rest' },
  ],
  onEnter: 'c5.dream.enter',
  drawBack: drawDreamBack,
};

// ---------------------------------------------------------------- Sorrel Down at sunset
const SS_W = 34, SS_H = 32;
const sunsetTiles = grid(SS_W, SS_H, (x, y) => {
  if (x + y > 60 + wob(x, y) || x > 32 || y > 30) return ' ';
  // the little stream along the right-hand side
  if (y >= 3 && y <= 22 && Math.abs(x - (27 + Math.round(Math.sin(y * 0.4) * 1.5))) <= 0) return '~';
  // the feast of clover in the middle
  if (Math.hypot(x - 14, y - 15) < 5.2) return ',';
  // chalk paths: warren mouth to the feast, feast to the Lookout hill, feast to the stream
  if ((x === 9 || x === 10) && y >= 6 && y <= 12) return 'x';
  if (y === 15 && x >= 19 && x <= 25) return '_';
  if (x === 14 && y >= 20 && y <= 25) return '_';
  if ((x + y) % 13 === 0 && (x * y) % 5 === 1) return ';';
  return (x * 3 + y * 5) % 17 === 0 ? ',' : '.';
});
// the Lookout Stone's little hill (bottom-left) and gentle swells
const sunsetHeights = grid(SS_W, SS_H, (x, y) => {
  const dx = Math.abs(x - 6), dy = Math.abs(y - 24);
  if (dx <= 1 && dy <= 1) return '2';
  if (dx <= 3 && dy <= 3) return '1';
  if (x <= 2 && y <= 8) return '1';
  return '0';
});

const afterDark = () => !!(G.s && G.s.flags && G.s.flags.g_won);
function sunsetSky(ex, c) {
  const night = afterDark(), g = c.createLinearGradient(0, 0, 0, H);
  const stops = night ? [[0, '#0b0d22'], [0.55, '#1c1c3e'], [1, '#33284a']] : [[0, '#3c3466'], [0.45, '#8e5c7e'], [0.8, '#d48a6c'], [1, '#eaa877']];
  for (const [k, col] of stops) g.addColorStop(k, col);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // a few early stars at the top of the sky (many more after dark)
  const n = night ? 40 : 10;
  for (let i = 0; i < n; i++) {
    const x = (i * 157 + 31) % W, y = (i * 89 + 7) % (night ? 200 : 70), tw = 0.35 + 0.35 * Math.sin(G.time * 1.7 + i * 2.3);
    c.fillStyle = `rgba(255,246,220,${(night ? 0.45 : 0.25) + tw * 0.4})`; c.fillRect(x, y, 1, 1);
  }
}
// after dark: a blue night wash over the down, then fireflies drifting over it (code-drawn, a glow and a bright core)
function sunsetNight(ex, c, ox, oy) {
  if (!afterDark()) return;
  c.fillStyle = 'rgba(16,20,58,0.46)'; c.fillRect(0, 0, W, H);
  const t = G.time;
  for (let i = 0; i < 46; i++) {
    // each firefly wanders round a home spot on the meadow (tile coords), so they stay over the land as the camera moves
    const hx = 2 + (i * 37 % 29), hy = 2 + (i * 53 % 27);
    if (hx + hy > 56) continue;
    const s = toScreen(hx + Math.sin(t * 0.31 + i) * 1.6, hy + Math.cos(t * 0.27 + i * 1.7) * 1.6, 0);
    const x = Math.round(s.x + ox), y = Math.round(s.y + oy - 18 - 10 * Math.sin(t * 0.5 + i * 0.9));
    if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;
    const a = Math.max(0, Math.sin(t * (1.1 + (i % 5) * 0.23) + i * 1.9));   // blink
    if (a < 0.05) continue;
    c.fillStyle = `rgba(200,255,120,${0.12 * a})`; c.fillRect(x - 5, y - 2, 12, 6); c.fillRect(x - 2, y - 5, 6, 12);
    c.fillStyle = `rgba(214,255,140,${0.3 * a})`; c.fillRect(x - 2, y - 1, 6, 4); c.fillRect(x - 1, y - 2, 4, 6);
    c.fillStyle = `rgba(255,255,200,${a})`; c.fillRect(x, y, 2, 2);
  }
}

// every recruit and friend at the ending ([id, x, y, facing, extra])
const S = (id, x, y, facing, extra = {}) => ({ id, x, y, facing, talk: 'c5.last', ...extra });
export const SUNSET_PEOPLE = [
  // at the warren mouth
  S('yarrow', 9, 5, 'se'), S('woodruff', 12, 6, 'sw'), S('comfrey', 6, 7, 'se'), S('mallow', 13, 8, 'sw'),
  // round the feast
  S('burdock', 11, 13, 'se'), S('pip', 15, 12, 'sw', { kid: true }), S('badger', 10, 16, 'se'), S('toad', 17, 15, 'sw'), S('mole', 12, 18, 'ne'), S('ratty', 13, 19, 'ne'),
  S('aster', 18, 12, 'sw'), S('barley', 9, 18, 'ne'), S('chert', 18, 18, 'nw'), S('captain-quarry', 16, 19, 'nw'),
  S('white-rabbit', 16, 10, 'sw'), S('seven-of-spades', 11, 10, 'se', { sprite: 'card-soldier', cond: recruited('seven-of-spades') }),
  // Wonderland's two, half in the hedge
  S('cheshire-cat', 4, 12, 'se'), S('caterpillar', 3, 15, 'se'),
  // by the stream
  S('otter', 25, 9, 'sw'), S('hedgehog', 23, 12, 'sw'), S('jade-rabbit', 24, 17, 'sw'), S('wick', 25, 19, 'sw', { cond: recruited('wick') }), S('moon-hare', 23, 20, 'sw'),
  // Oz
  S('tin-woodman', 20, 22, 'nw'), S('scarecrow', 22, 23, 'nw'), S('cowardly-lion', 18, 24, 'ne'), S('mouse-queen', 16, 25, 'ne'), S('monkey-king', 21, 26, 'nw'),
  // the deep folk and the herd at the back of the meadow
  S('ninefold', 6, 18, 'se'), S('elevenfold', 4, 18, 'se'), S('rumble', 11, 25, 'ne'), S('mastodon', 9, 28, 'ne'),
  // Bramble's best friend, on the Lookout Stone
  S('tansy', 7, 23, 'se'),
  // warren rabbits from everywhere, mixed up together at last
  S('ss-tb1', 13, 11, 'sw', { sprite: 'rabbit-buck', fur: 'brown' }), S('ss-tb2', 8, 14, 'se', { sprite: 'rabbit-doe', fur: 'grey' }), S('ss-tb3', 15, 16, 'sw', { sprite: 'rabbit-kit', fur: 'brown', kid: true }),
  S('ss-sd1', 19, 14, 'sw', { sprite: 'rabbit-doe', fur: 'silver' }), S('ss-sd2', 20, 11, 'sw', { sprite: 'rabbit-buck', fur: 'cream' }),
  S('ss-ws1', 8, 17, 'ne', { sprite: 'rabbit-buck', fur: 'ginger' }), S('ss-ws2', 11, 21, 'ne', { sprite: 'rabbit-doe', fur: 'sandy' }),
  S('ss-fc1', 19, 17, 'nw', { sprite: 'rabbit-buck', fur: 'dark' }), S('ss-fc2', 17, 21, 'nw', { sprite: 'rabbit-kit', fur: 'grey', kid: true }),
  S('ss-ec1', 2, 23, 'se', { sprite: 'rabbit-buck', look: 'hollow' }),
];

const sunset = {
  name: 'Sorrel Down', world: 'downs', area: 'sunset', music: 'm-sunset', ambience: [['wind', 0.2]], battle: 'downs',
  // everyone is at the feast: the travelling friends join it (each has a place in SUNSET_PEOPLE) instead of following
  // Bramble, so nobody is in two places at once (Pip by the clover AND at his heels; Tansy at the Stone AND behind him)
  merge: true,
  // a soft dusk sky round the map; once the story is over (g_won) the sun is down: night light and fireflies
  get tint() { return afterDark() ? null : 'rgba(255,140,60,0.14)'; }, sky: '#8a5a72',
  drawBack: sunsetSky, drawOver: sunsetNight,
  tiles: sunsetTiles, heights: sunsetHeights,
  entries: { start: [10, 9, 'se'], lookout: [7, 24, 'ne'], feast: [14, 15, 'se'] },
  props: [
    { id: 'prop-warren-entrance', x: 9, y: 3, w: 2, h: 2, whole: true }, ['prop-lookout-stone', 6, 24],
    ['prop-hawthorn', 2, 2], ['prop-hawthorn', 17, 3], ['prop-hawthorn', 30, 6], ['prop-gorse', 5, 3], ['prop-gorse', 21, 5], ['prop-gorse', 1, 10],
    ['prop-hollow-log', 22, 3, 2, 1], ['prop-dandelions', 16, 7], ['prop-dandelions', 7, 20], ['prop-dandelions', 21, 20], ['prop-dandelions', 13, 27],
    ['prop-chalk-boulder', 3, 26], ['prop-chalk-boulder', 26, 25], ['prop-reeds', 26, 6], ['prop-reeds', 28, 14], ['prop-reeds', 25, 21],
    ['prop-banquet-table', 13, 14], ['prop-banquet-table', 14, 14], ['prop-banquet-table', 15, 14],
    ['prop-boat', 29, 10, 2, 1], ['prop-fence', 30, 18], ['prop-fence', 30, 19], ['prop-signpost', 12, 3],
  ],
  npcs: SUNSET_PEOPLE,
  doors: [{ x: 10, y: 5, run: 'c5.sunset.door' }],
  // after the ending the Lookout Stone here opens the army revisits menu too (ch0's lookout.stone); before it, plain decoration
  triggers: [{ x: 6, y: 24, use: true, run: 'lookout.stone', cond: afterDark }],
  onEnter: 'c5.sunset.enter',
  // everyone is home: Bramble's two travelling friends stand with the others instead of trailing behind him
  update(ex) { for (const f of ex.followers || []) f.hidden = true; },
};

export default { 'c5-deep': deep, 'c5-dream': dream, 'c5-sunset': sunset };
