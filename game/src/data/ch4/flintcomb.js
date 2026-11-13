// Flintcomb: the white quarry on the surface, and the warren that spirals down round the hole Quarry dug.
import { G } from '../../core.js';
import { flag, setActive, travelling, member, maxHp, maxPl } from '../../state.js';
import { grid, sprinkle } from './grid.js';
import { LEG } from './common.js';

const freed = () => flag('g_freed_flintcomb');
// the Epilogue (ch6): once Flintcomb starts rebuilding, the Hum loop and the hard quarry music stop for good
const epi = () => flag('c6_started');
// Shale (fc-doe) waits on Sorrel Down after the ending until she has brought Bramble the Epilogue's invitation
const shaleAway = () => flag('g_won') && !flag('c6_invited');

// ---------------------------------------------------------------- the surface: c4-flintcomb
function surface() {
  const g = grid(30, 26, 'q', 0);
  // the downs above the quarry, on the west
  g.rect(0, 0, 5, 25, '.', 2);
  sprinkle(g, '.', ',', 14, 3);
  // a ledge of white flint between the downs and the pit, with a chalk ramp down
  g.rect(6, 0, 6, 25, 'W', 3);
  g.rect(6, 18, 6, 21, 'x', 1);
  g.rect(5, 18, 5, 21, '_', 2);
  // back walls of the quarry (north-east), stepped
  g.rect(7, 0, 29, 1, 'W', 4);
  g.rect(28, 0, 29, 25, 'W', 4);
  g.rect(27, 2, 27, 25, 'W', 2);
  g.rect(7, 2, 26, 2, 'W', 2);
  g.rect(7, 25, 27, 25, 'W', 1);
  // the warren mouth stands in a notch of the back wall
  g.rect(18, 2, 21, 3, 'x', 0);
  // chalk scars and loose flint across the floor
  g.rect(9, 8, 14, 10, 'x', 0); g.rect(20, 14, 25, 16, 'x', 0); g.rect(12, 20, 17, 21, 'x', 0);
  // flint outcrops: raised white blocks the quarrymen left standing
  g.rect(13, 13, 15, 15, 'W', 2); g.set(14, 14, 'W', 3);
  g.rect(22, 7, 23, 8, 'W', 2);
  g.rect(9, 15, 9, 16, 'W', 1);
  g.rect(19, 21, 20, 22, 'W', 1);
  return g;
}
const S = surface();

const surfaceMap = {
  name: 'Flintcomb', world: 'flint', area: 'flintcomb', music: () => (epi() ? 'm-downs' : 'm-flintcomb'), get ambience() { return epi() ? [['wind', 0.3]] : [['hum', 0.25], ['wind', 0.3]]; }, battle: 'downs',
  sky: '#a8b0bc',
  // the Epilogue's feast is at sundown
  get tint() { return flag('g_c6_done') ? 'rgba(255,150,70,0.12)' : null; },
  tiles: S.rows(), heights: S.hrows(), legend: LEG,
  entries: { west: [2, 19, 'se'], mouth: [19, 5, 'sw'] },
  props: [
    { id: 'prop-warren-entrance', x: 19, y: 2, w: 2, h: 2, whole: true },
    ['prop-flint-wall', 17, 3], ['prop-flint-wall', 22, 3], ['prop-flint-wall', 10, 4], ['prop-flint-wall', 25, 11],
    // the Epilogue's Rumble shoves these three away (c6_heap1..3)
    { id: 'prop-spoil-heap', x: 10, y: 22, w: 2, h: 1, cond: () => !flag('c6_heap1') }, { id: 'prop-spoil-heap', x: 24, y: 19, w: 2, h: 1, cond: () => !flag('c6_heap2') },
    { id: 'prop-spoil-heap', x: 16, y: 6, w: 2, h: 1, cond: () => !flag('c6_heap3') },
    ['prop-hare-burrow', 11, 12], ['prop-hare-burrow', 18, 9], ['prop-hare-burrow', 21, 11], ['prop-hare-burrow', 8, 6],
    ['prop-hare-burrow', 17, 18], ['prop-hare-burrow', 23, 22], ['prop-hare-burrow', 12, 17], ['prop-hare-burrow', 25, 5],
    ['prop-hare-burrow', 15, 23], ['prop-hare-burrow', 20, 18],
    ['prop-rim-stones', 8, 13], ['prop-rim-stones', 26, 15], ['prop-chalk-boulder', 3, 4], ['prop-gorse', 1, 9], ['prop-gorse', 4, 14],
    ['prop-hawthorn', 1, 2], ['prop-signpost', 3, 17],
  ],
  npcs: [
    { id: 'chert', x: 8, y: 20, facing: 'sw', talk: 'c4.chert' },
    { id: 'fc-doe', sprite: 'rabbit-doe', get fur() { return freed() ? 'grey' : undefined; }, get hum() { return !freed(); }, x: 12, y: 11, facing: 'sw', talk: 'c4.fc-doe', cond: () => !shaleAway() },
    { id: 'fc-buck', sprite: 'rabbit-buck', get fur() { return freed() ? 'dark' : undefined; }, get hum() { return !freed(); }, x: 22, y: 20, facing: 'nw', talk: 'c4.fc-buck' },
    { id: 'fc-kit', sprite: 'rabbit-kit', kid: true, get fur() { return freed() ? 'grey' : undefined; }, get hum() { return !freed(); }, x: 18, y: 12, facing: 'se', talk: 'c4.fc-kit' },
  ],
  enemies: [
    { id: 'fs1', type: 'raider', sprite: 'raider', hum: true, x: 15, y: 9, loop: [[15, 9], [18, 7], [20, 7], [17, 10]], encounter: 'c4.fc-s1', cond: () => !freed() },
    { id: 'fs2', type: 'hum-digger', sprite: 'hum-digger', hum: true, x: 22, y: 5, loop: [[22, 5], [24, 5], [24, 9], [21, 9]], encounter: 'c4.fc-s2', cond: () => !freed() },
  ],
  doors: [
    { x: 0, y: 18, to: 'c0-downs', entry: 'east' }, { x: 0, y: 19, to: 'c0-downs', entry: 'east' }, { x: 0, y: 20, to: 'c0-downs', entry: 'east' },
    { x: 19, y: 4, to: 'c4-warren', entry: 'top' }, { x: 20, y: 4, to: 'c4-warren', entry: 'top' },
  ],
  triggers: [
    { x: 3, y: 17, use: true, run: async s => { await s.narrate('A signpost. Somebody has scratched out FLINTCOMB and scratched in DEEPER. Then somebody else, more recently, has scratched out DEEPER.'); } },
  ],
  chests: [
    { id: 'c4fs-1', x: 26, y: 23, give: { buttons: 160, 'pluck-berry': 2 } },
    { id: 'c4fs-2', x: 2, y: 3, give: { dandelion: 3 } },
  ],
  onEnter: 'c4.flintcomb.enter',
};

// ---------------------------------------------------------------- the warren: c4-warren, a spiral round the hole
const C = 18;
const ANG0 = -135; // the spiral starts at the top corner of the screen
const fracOf = (x, y, a0) => { let a = Math.atan2(y - C, x - C) * 180 / Math.PI - a0; a = ((a % 360) + 360) % 360; return a / 360; };
const RING1 = (x, y) => 6 - Math.min(3, Math.floor(fracOf(x, y, ANG0) * 4));
const A1 = ANG0 - 18;  // where ring 1 drops into ring 2 (just before it would meet its own start)
const RING2 = (x, y) => 3 - Math.min(2, Math.floor(fracOf(x, y, A1 + 4) * 3));
const A2 = A1 - 20;    // where ring 2 opens onto the lip
function spiral() {
  const g = grid(37, 37, ' ', 0);
  for (let y = 0; y < 37; y++) for (let x = 0; x < 37; x++) {
    const d = Math.max(Math.abs(x - C), Math.abs(y - C));
    if (d <= 4) continue;                                        // the hole
    if (d <= 6) g.set(x, y, 'q', 0);                             // the lip
    else if (d === 7) g.set(x, y, 'W', RING2(x, y) + 1);
    else if (d <= 10) g.set(x, y, 'q', RING2(x, y));
    else if (d === 11) g.set(x, y, 'W', RING1(x, y) + 1);
    else if (d <= 14) g.set(x, y, 'q', RING1(x, y));
    else if (d === 15) g.set(x, y, 'W', 7);
  }
  // chalk seams on the floors
  for (let y = 0; y < 37; y++) for (let x = 0; x < 37; x++) { const d = Math.max(Math.abs(x - C), Math.abs(y - C)); if (g.get(x, y) === 'q' && ((x * 7 + y * 3) % 11 === 0) && d > 6) g.set(x, y, 'x'); }
  // ring 1 -> ring 2: on the top-left side (x = C-11 column), rows just past the start corner
  for (let y = 9; y <= 10; y++) { g.set(C - 11, y, 'x', 3); }
  // ring 2 -> lip: on the left side (x = C-7 column), where ring 2 has come all the way round
  for (let y = 15; y <= 16; y++) { g.set(C - 7, y, 'x', 0); }
  // the stair up to the surface at the top corner, and the store room off the east side
  g.rect(1, 1, 3, 4, 'x', 6); g.rect(1, 1, 4, 3, 'x', 6);
  g.rect(3, 3, 4, 4, 'q', 6);
  g.rect(33, 15, 35, 20, 'w', 5);
  g.rect(36, 14, 36, 21, 'W', 7); g.rect(33, 14, 35, 14, 'W', 7); g.rect(33, 21, 35, 21, 'W', 7);
  return g;
}
const SP = spiral();
// fix up heights on the two gaps so they meet both sides
(function fixGaps() {
  // ring1 at (C-11, 9..10) neighbours ring1 (C-12) and ring2 (C-10): use ring2's height there (should be 3)
  for (let y = 9; y <= 10; y++) { SP.set(C - 11, y, 'x', SP.hget(C - 10, y)); }
})();

const warrenMap = {
  name: 'Flintcomb Warren', world: 'flint', area: 'flintcomb', music: () => (epi() ? 'm-warren' : 'm-flintcomb'), get ambience() { return epi() ? [['hearth', 0.15]] : [['hum', 0.45]]; }, battle: 'warren',
  sky: '#07070b', dark: 0.25,
  tiles: SP.rows(), heights: SP.hrows(), legend: LEG,
  entries: { top: [4, 4, 'se'], lip: [13, 16, 'se'], store: [32, 17, 'se'] },
  props: [
    ['prop-flint-wall', 5, 6], ['prop-lantern', 8, 5], ['prop-lantern', 29, 6], ['prop-lantern', 31, 28], ['prop-lantern', 6, 30],
    ['prop-spoil-heap', 12, 30, 2, 1], ['prop-tunnel-heap', 24, 4, 2, 1], ['prop-rubble', 30, 12], ['prop-rubble', 5, 22],
    ['prop-lantern', 9, 18], ['prop-rubble', 26, 26], ['prop-lantern', 27, 12], ['prop-spoil-heap', 18, 9, 2, 1],
    ['prop-rim-stones', 14, 13], ['prop-rim-stones', 16, 13], ['prop-rim-stones', 20, 13], ['prop-rim-stones', 23, 15], ['prop-rim-stones', 23, 19],
    ['prop-rim-stones', 21, 23], ['prop-rim-stones', 17, 23], ['prop-rim-stones', 13, 21], ['prop-rim-stones', 13, 17],
    { id: 'prop-store-counter', x: 34, y: 16, w: 1, h: 2 }, ['prop-button-shelves', 35, 20], ['prop-cellar-baskets', 35, 15],
    ['prop-rest-stone', 12, 18],
  ],
  npcs: [
    { id: 'captain-quarry', x: 18, y: 13, facing: 'se', hum: true, talk: 'c4.quarry', cond: () => !freed() },
    { id: 'knapper', sprite: 'quarryman', fur: 'grey', x: 35, y: 17, facing: 'nw', talk: 'c4.knapper', faceBack: 'nw' },
    { id: 'yarrow', x: 12, y: 13, facing: 'se', talk: 'c4.yarrow', cond: () => freed() && !epi() },
  ],
  enemies: [
    { id: 'fw1', type: 'raider', sprite: 'raider', hum: true, x: 22, y: 5, loop: [[22, 5], [26, 5], [26, 6], [22, 6]], encounter: 'c4.fc-1', cond: () => !freed() },
    { id: 'fw2', type: 'hum-digger', sprite: 'hum-digger', hum: true, x: 31, y: 24, loop: [[31, 24], [31, 29], [30, 29]], encounter: 'c4.fc-2', cond: () => !freed() },
    { id: 'fw3', type: 'hum-lookout', sprite: 'hum-lookout', hum: true, x: 18, y: 30, loop: [[20, 30], [14, 30], [14, 31], [20, 31]], encounter: 'c4.fc-3', cond: () => !freed() },
    { id: 'fw4', type: 'raider', sprite: 'raider', hum: true, x: 5, y: 24, loop: [[5, 24], [5, 18], [6, 18], [6, 24]], encounter: 'c4.fc-4', cond: () => !freed() },
    { id: 'fw5', type: 'hum-digger', sprite: 'hum-digger', hum: true, x: 26, y: 18, loop: [[26, 16], [26, 22], [27, 22], [27, 16]], encounter: 'c4.fc-5', cond: () => !freed() },
    { id: 'fw6', type: 'hum-lookout', sprite: 'hum-lookout', hum: true, x: 12, y: 26, loop: [[11, 26], [16, 26], [16, 27], [11, 27]], encounter: 'c4.fc-6', cond: () => !freed() },
  ],
  doors: [{ x: 1, y: 1, to: 'c4-flintcomb', entry: 'mouth' }, { x: 2, y: 1, to: 'c4-flintcomb', entry: 'mouth' }, { x: 1, y: 2, to: 'c4-flintcomb', entry: 'mouth' }],
  triggers: [
    { x: 12, y: 18, use: true, run: async s => { await s.rest(); } },
    { x: 18, y: 13, run: 'c4.climb', cond: () => freed() },
    { x: 11, y: 15, w: 1, h: 2, run: 'c4.lip-arrive', once: true },
    { x: 5, y: 9, w: 2, h: 1, run: 'c4.spiral-midway', once: true },
  ],
  chests: [
    { id: 'c4fw-1', x: 30, y: 31, give: { buttons: 220, 'carrot-cake': 1 } },
    { id: 'c4fw-2', x: 5, y: 28, give: { 'courage-biscuit': 2, 'smelling-salts': 2 } },
    { id: 'c4fw-3', x: 26, y: 9, give: { buttons: 180 } },
  ],
  onEnter: 'c4.warren.enter',
  // the deep, deep hole: a soft dark well and slow pale rings of Hum rising out of it
  drawBack(ex, c) {
    const ox = -ex.camX, oy = -ex.camY;
    const cx = ox + 0, cy = oy + C * 16 + 8;
    const g = c.createRadialGradient(cx, cy, 4, cx, cy, 150);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(14,14,22,0)');
    c.fillStyle = g; c.fillRect(cx - 160, cy - 100, 320, 200);
  },
  drawGround(ex, c, ox, oy) {
    if (flag('g_freed_flintcomb') && !flag('c4_hum_quiet')) return;
    const t = G.time, cx = ox, cy = oy + C * 16 + 8;
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.25 + i / 3) % 1);
      c.strokeStyle = `rgba(191,227,240,${(1 - k) * (freed() ? 0.06 : 0.22)})`;
      c.beginPath(); c.ellipse(cx, cy + 10 - k * 18, 20 + k * 60, 10 + k * 30, 0, 0, Math.PI * 2); c.stroke();
    }
  },
};

export const MAPS = { 'c4-flintcomb': surfaceMap, 'c4-warren': warrenMap };

// ---------------------------------------------------------------- encounters
const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
const QUARRY_HP = 1.1, QUARRY_STR = 0.95, QUARRY_COLLAPSE = 2.2;   // boss fix (design/progress/bosses.md)
export const ENCOUNTERS = {
  'c4.fc-s1': { enemies: [['raider', 22, 1], ['raider', 22], ['hum-lookout', 21]], bg: 'downs', tweak: hardy(1.9) },
  'c4.fc-s2': { enemies: [['hum-digger', 22, 1], ['hum-lookout', 22], ['raider', 21]], bg: 'downs', tweak: hardy(1.9) },
  'c4.fc-1': { enemies: [['raider', 22, 1], ['hum-digger', 22], ['raider', 22]], bg: 'warren', tweak: hardy(1.45) },
  'c4.fc-2': { enemies: [['hum-digger', 22, 1], ['hum-digger', 22], ['hum-lookout', 22]], bg: 'warren', tweak: hardy(1.45) },
  'c4.fc-3': { enemies: [['hum-lookout', 22, 1], ['raider', 22, 1], ['raider', 22]], bg: 'warren', tweak: hardy(1.45) },
  'c4.fc-4': { enemies: [['raider', 22, 1], ['hum-lookout', 22], ['hum-digger', 22]], bg: 'warren', tweak: hardy(1.45) },
  'c4.fc-5': { enemies: [['hum-digger', 22, 1], ['raider', 22, 1], ['hum-lookout', 22]], bg: 'warren', tweak: hardy(1.45) },
  'c4.fc-6': { enemies: [['hum-digger', 22, 1], ['raider', 22, 1], ['hum-digger', 22], ['hum-lookout', 22]], bg: 'warren', tweak: hardy(1.15) },
  'c4.quarry': {
    enemies: [['captain-quarry-boss', 23]], bg: 'warren', boss: true, music: 'm-boss',
    tweak(es) { for (const e of es) if (e.boss) { e.maxHp = e.hp = Math.round(e.maxHp * QUARRY_HP); e.str = Math.round(e.str * QUARRY_STR); } },   // boss fix (design/progress/bosses.md)
    // boss fix: the counter is "Shielded (or Guard) before the collapse". The Quarry Collapse (every third round, announced
    // the round before) brings the whole roof down: his Strength is QUARRY_COLLAPSE x for that blow. Braced, the party
    // takes it; caught in the open, it doesn't.
    onRound(sim) {
      const q = sim.enemies.find(e => e.id === 'captain-quarry-boss' && !e.ko); if (!q) return [];
      q.ms.str0 = q.ms.str0 || q.str; q.str = sim.round % 3 === 0 ? Math.round(q.ms.str0 * QUARRY_COLLAPSE) : q.ms.str0;
      return [];
    },
    intro: ['Captain Quarry hefts a flint the size of a kit.', '"Deeper," he hums. "Everybody, deeper."'],
  },
};

export const SHOPS = {
  'c4.quarry-store': {
    name: 'Quarry\'s Old Store', keeper: 'knapper',
    line: 'Captain\'s stores. He always bought the best flint. Take what you need, pay what\'s fair.',
    gear: ['flint-pick+5', 'digging-claw+5', 'lantern+5', 'oilskin+5', 'tin-vest+5', 'waistcoat+5', 'courage-ribbon+5', 'calm-stone+5', 'lucky-clover+5'],
    items: ['clover-bunch', 'dandelion', 'carrot-cake', 'pluck-berry', 'courage-biscuit', 'smelling-salts', 'jade-elixir'],
    army: 3,
  },
};

// ---------------------------------------------------------------- scripts
export const SCRIPTS = {
  // play-test stand-in for ch0's Lookout Stone (same order: battle, then the flag, then <id>.won)
  'c4.test.lookout': async (s) => {
    await G.data.scripts['c4-rts4.intro'](s);
    const r = await s.army('c4-rts4');
    if (r !== 'win') { await s.say('yarrow', 'Not like this, Bramble. Not alone. Again, when you\'re ready.'); return; }
    s.set('g_c4-rts4_won');
    await G.data.scripts['c4-rts4.won'](s);
  },
  // the Lookout Stone runs this after the army battle is won (ch0 sets g_c4-rts4_won first)
  // the Lookout Stone runs this first: chapter 4's card, the first time the last battle is offered
  'c4-rts4.intro': async (s) => {
    s.chapter(4);
    if (s.flag('c4_card')) return;
    s.set('c4_card');
    await s.chapterCard('Flintcomb and the Center of the Earth', 'Chapter 4', 'bg-battle-lidenbrock');
    await s.narrate('East, past the last green hill, the downs go white. Flintcomb. The dust over it never settles now.');
    if (s.party().includes('tin-woodman')) await s.say('tin-woodman', 'I do hope nobody gets hurt. I shall be very careful where I put my feet.');
    if (s.party().includes('pip')) await s.say('pip', 'Is Flintcomb the last one? After Flintcomb, is everyone home?');
    await s.say('bramble', 'After Flintcomb, every warren on the downs is ours again. Then we find out what\'s underneath.');
  },
  'c4-rts4.won': async (s) => {
    s.set('g_ch4_open'); s.chapter(4);
    if (!s.flag('c4_card')) { s.set('c4_card'); await s.chapterCard('Flintcomb and the Center of the Earth', 'Chapter 4', 'bg-battle-lidenbrock'); }
    await s.narrate('The quarrymen sit down in the white dust, one by one, blinking. They are still humming. But they have stopped digging.');
    await s.say('chert', 'That\'s my home. That\'s Flintcomb.', { listener: 'bramble' });
    await s.say('chert', 'The mouth\'s open. The Captain will be down at the bottom, by the hole. He always is, now.');
    await s.say('bramble', 'Then that\'s where we\'re going.');
    s.quest('Go east from Sorrel Down to Flintcomb, and down into its warren.');
    await s.warp('c4-flintcomb', 'west');
  },
  'c4.flintcomb.enter': async (s) => {
    // the Epilogue's arrival scene (ch6), the first time back after Shale's invitation
    if (s.flag('c6_invited') && !s.flag('c6_started') && G.data.scripts['c6.arrive']) { await G.data.scripts['c6.arrive'](s); return; }
    if (!s.flag('c4_seen_flintcomb')) {
      s.set('c4_seen_flintcomb');
      await s.wait(0.4);
      await s.narrate('Flintcomb. A bowl of white flint bitten out of the downs, pocked with burrows like a sponge. Nothing grows. Everything hums.');
      if (s.party().length > 1) s.bubble(s.party()[1], 'It\'s so... white.', 3);
      s.quest('Find the warren mouth at the back of the quarry and go down.');
    } else s.ex.enterBubble();
  },
  'c4.chert': async (s) => {
    if (s.flag('g_freed_flintcomb')) {
      await s.say('chert', 'Listen. Hear that? Nothing. No hum. Just wind on flint, and somebody\'s kit crying for breakfast.');
      await s.say('chert', 'Best sound in the world. Thank you, Bramble.');
      return;
    }
    if (!s.flag('c4_chert_1')) {
      s.set('c4_chert_1');
      await s.say('chert', 'I used to race the other kits round the rim, there. Fell in twice. Quarry pulled me out both times.');
      await s.say('chert', 'He was the best of us. Loudest laugh in the warren. Dug like the ground owed him buttons.');
      await s.say('chert', 'Then he heard something under the flint, and he stopped laughing, and started humming.');
      const c = await s.ask('bramble', 'Chert looks at the warren mouth.', ['We\'ll wake him.', 'Will you come down with us?']);
      if (c === 0) await s.say('chert', 'You woke me. I\'ve stopped saying "can\'t" about you.');
      else await s.say('chert', 'Someone has to sit with this lot when they come round. I know how it feels. I\'ll stay.');
      return;
    }
    await s.say('chert', 'Down the mouth, round and round and round. Mind the edge. It goes further than it should.');
  },
  'c4.fc-doe': async (s) => {
    if (s.flag('c6_started') && G.data.scripts['c6.shale']) { await G.data.scripts['c6.shale'](s); return; }
    if (s.flag('g_freed_flintcomb')) { await s.say('shale', 'I had a name all along. It\'s Shale. I\'m Shale! Somebody write it down before I lose it again.'); return; }
    await s.say('doe', 'Hmmmm... deeper. The bottom\'s nearly... hmmm.');
    await s.narrate('She is scraping at the flint with worn-down claws. She doesn\'t look up.');
  },
  'c4.fc-buck': async (s) => {
    if (s.flag('g_freed_flintcomb')) { await s.say('buck', 'My paws hurt like anything. Why do my paws hurt? ...Oh. Oh, I remember. Don\'t tell my mother.'); return; }
    await s.say('buck', 'Mmmmm. Captain says deeper. Captain says, captain says, captain says...');
  },
  'c4.fc-kit': async (s) => {
    if (s.flag('g_freed_flintcomb')) { await s.say('kit', 'Are you the one who went down the hole? Is it true there\'s a sea? A whole SEA? Underneath?'); return; }
    await s.say('kit', 'Hum hum hum. Hum hum.');
    await s.narrate('The kit hums the tune Pip hums at bedtime. Only flatter, and slower, and wrong.');
  },
  'c4.warren.enter': async (s) => {
    if (!s.flag('c4_seen_warren')) {
      s.set('c4_seen_warren');
      await s.wait(0.3);
      await s.narrate('Flintcomb Warren goes down in a spiral, round and round a hole so deep the dark at the bottom looks solid.');
      await s.narrate('The Hum is loud here. It comes up out of the hole like warm air.');
      s.quest('Follow the spiral down to the lip of the hole and find Captain Quarry.');
    } else s.ex.enterBubble();
  },
  'c4.spiral-midway': async (s) => {
    await s.narrate('Claw marks on every wall. Some of them are very small. The whole warren dug this, together, without stopping.');
    const p = s.party(); if (p[1]) s.bubble(p[1], 'Round and round...', 3);
  },
  'c4.lip-arrive': async (s) => {
    if (s.flag('g_freed_flintcomb')) return;
    s.quest('Wake Captain Quarry at the lip of the hole. (A mossy stone nearby: rest first.)');
    await s.narrate('The lip. Smooth white flint, worn by a thousand paws, and then nothing at all.');
    await s.narrate('Someone big stands right at the edge, looking down. He is humming the lowest note you have ever heard.');
    // the full playthrough walked past the stone and lost: point at it (calibration.md)
    await s.say('bramble', 'That mossy stone by the lantern, just behind us. We rest there before we go anywhere near him.');
  },
  'c4.knapper': async (s) => {
    if (!s.flag('c4_knapper_met')) {
      s.set('c4_knapper_met');
      await s.say('knapper', 'Eh? Visitors? Speak up, I\'m deaf as a flint.');
      await s.say('knapper', 'Been deaf ten years. Never heard any humming. Never heard much of anything, come to that.');
      await s.say('knapper', 'Whole warren went odd round me and I just kept the Captain\'s store tidy. Somebody had to.');
      await s.say('bramble', 'You\'re the only one it didn\'t take.');
      await s.say('knapper', 'EH? Oh, yes. Lucky old ears. Buying?');
    } else if (s.flag('g_freed_flintcomb') && !s.flag('c4_knapper_after')) {
      s.set('c4_knapper_after');
      await s.say('knapper', 'They tell me the Captain\'s himself again. I can\'t hear a word he says, but I can see him smile. That\'ll do.');
    }
    await s.shop('c4.quarry-store');
  },
  'c4.quarry': async (s) => {
    if (s.flag('g_freed_flintcomb')) return;
    s.face('captain-quarry', 'nw');
    if (!s.flag('c4_quarry_talked')) {
      s.set('c4_quarry_talked');
      await s.say('captain-quarry', 'Hmmmmm. Nearly. Just a little deeper. Can you hear it? It\'s nearly singing now.');
      const c = await s.ask('bramble', 'He doesn\'t turn round.', ['Captain Quarry?', 'Step back from the edge. Please.']);
      if (c === 0) await s.say('captain-quarry', 'Captain? Was I a captain? I was something. Somebody shouted a lot. Probably me.');
      else await s.say('captain-quarry', 'Back? There is no back. There\'s only down. Ask anyone. Ask the flint.');
      s.face('captain-quarry', { x: s.b.x, y: s.b.y });
      await s.say('captain-quarry', 'You walked all the way round. Good legs. Strong claws. Dig with us, little one. The bottom\'s just there.');
      await s.say('bramble', 'I\'ve come to take you home. You ARE home. You just can\'t hear it.', { mood: 'worried' });
    } else {
      await s.say('captain-quarry', 'Back again? Good. More paws. Deeper, deeper.');
    }
    // hurt? offer the rest stone a few hops back (12,18) before the fight (calibration.md: the full run lost here
    // after the lip's wanderers, with the stone right beside him)
    if (travelling().some(id => { const m = member(id); return m && (m.hp < maxHp(id) * 0.8 || m.pl < maxPl(id) * 0.6); })) {
      const c = await s.ask('bramble', 'We\'re worn out, and he\'s big. The mossy stone is just behind us.', ['Rest at the stone first.', 'Wake him now.']);
      if (c === 0) await s.rest();
    }
    await s.battle('c4.quarry');
    // woken
    s.sfx('wake-chime');
    s.actor('captain-quarry').hum = false;
    s.ambience('hum', 0.1);
    await s.wait(0.6);
    s.emote('captain-quarry', '?');
    await s.say('captain-quarry', '...Flint. Flint dust. I can taste it.');
    await s.say('captain-quarry', 'Why am I standing on the... what is THAT? What is that HOLE?');
    await s.say('bramble', 'You dug it. All of you did.');
    await s.wait(0.4);
    await s.say('captain-quarry', 'Oh. Oh, no. Oh, my warren.');
    await s.say('captain-quarry', 'That\'s not a quarry. That\'s a wound.');
    // Yarrow comes down the spiral
    s.spawn({ id: 'yarrow-scene', sprite: 'yarrow', x: 11, y: 15, facing: 'se' });
    s.sfx('hop-1');
    await s.move('yarrow-scene', [[12, 15], [12, 14], [12, 13], [12, 12], [13, 12], [14, 12]], 0.32);
    await s.say('yarrow', 'There you are, Quarry. You always did dig past supper.');
    await s.say('captain-quarry', 'Yarrow? Old Yarrow of Thimblebank? Down MY hole?');
    await s.say('yarrow', 'I\'m half blind, not half dead. And somebody old ought to see it. Elders keep secrets. We should keep watch, too.');
    await s.say('yarrow', 'I heard the young one was coming for you. I wanted to be here when you woke. Nobody should wake up to this alone.');
    await s.say('captain-quarry', 'I heard it under the flint. Months back. A low note, like a cart far off.');
    await s.say('captain-quarry', 'I thought: water, or gold, or something grand. So I dug toward it. And I made them all dig toward it.');
    await s.say('captain-quarry', 'And then I stopped hearing anything else.');
    const c2 = await s.ask('bramble', 'Quarry stares at his own claws.', ['It wasn\'t your fault.', 'Then help us put it right.']);
    if (c2 === 0) await s.say('captain-quarry', 'Kind of you. Wrong, but kind. I was the Captain. It\'s always the Captain\'s fault.');
    else await s.say('captain-quarry', 'Put it right. Yes. That, I understand. That\'s just digging the other way.');
    await s.say('yarrow', 'It\'s the old story, Quarry. Deepdelve dug too deep and woke something. You only heard it snore.');
    await s.say('yarrow', 'Bramble has woken Thimblebank, Silverdown and Wheatsheaf. With Flintcomb, that\'s four warrens. Nearly enough for a thump.');
    await s.say('captain-quarry', 'Whatever is at the bottom, I sent its noise up into your homes. I took your friends with it.');
    await s.say('captain-quarry', 'So. I dug the hole. I\'ll walk it.');
    await s.recruit('captain-quarry', { line: 'I dug the hole. I\'ll walk it.', level: 23 });
    // he walks it: Quarry takes the second place in the line (the camp menu can change it)
    { const t = travelling().filter(id => id !== 'bramble'); setActive(['captain-quarry', t[0]].filter(Boolean)); s.ex.buildFollowers(true); }
    s.set('g_freed_flintcomb');
    s.set('c4_needle');
    await s.give({ 'flintcomb-key': 1 });
    await s.say('captain-quarry', 'And take this. My digger\'s needle: a sliver of lodestone on a thread. It always points home to Flintcomb.');
    await s.say('captain-quarry', 'Down there, you\'ll want to know which way is up.');
    await s.say('yarrow', 'Go on, all of you. I\'ll sit with Flintcomb a while. Confused rabbits like an old one to tell them it\'s all right.');
    await s.say('yarrow', 'And Bramble. When you find the bottom... be gentle with it.');
    s.remove('yarrow-scene');
    s.remove('captain-quarry');
    s.ex.map.actors.push({ kind: 'npc', id: 'yarrow', sprite: 'yarrow', x: 12, y: 13, facing: 'se', hopT: -1, talk: 'c4.yarrow' });
    s.ambience('hum', 0);
    s.quest('Climb down the hole from the lip, where Quarry\'s rope hangs.');
    s.save();
  },
  'c4.yarrow': async (s) => {
    if (!s.flag('c4_yarrow_1')) {
      s.set('c4_yarrow_1');
      await s.say('yarrow', 'Listen. The Hum is softer now. Not gone. It\'s further down, that\'s all, where it started.');
      await s.say('yarrow', 'When I was a kit, my grandmother said the Depths go down in layers, like a cake nobody should eat.');
      await s.say('yarrow', 'You\'ve had three slices. Mind your stomach.');
      return;
    }
    await s.say('yarrow', 'Quarry\'s rope is by the edge. I\'d go down myself, but my knees have opinions.');
  },
  'c4.climb': async (s) => {
    if (!s.flag('g_freed_flintcomb')) return;
    const c = await s.ask('bramble', 'Quarry\'s old rope hangs over the lip, down into the dark.', ['Climb down.', 'Not yet.']);
    if (c !== 0) return;
    await s.fadeOut(0.8);
    s.sfx('scamper');
    await s.narrate('Down. Down. Paw under paw. The light from the lip shrinks to a coin, then a crumb, then nothing.');
    await s.narrate('The rock changes. White flint gives way to something older: dark, glassy, ridged, like it once ran like water.');
    await s.warp('c4-underway', 'top');
  },
};
