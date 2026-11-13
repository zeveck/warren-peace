// The Root of the World (stars in the rock, roots that move, Elevenfold's stall and its star-stones) and the
// ruins of Deepdelve Warren (the Hollow Rabbits, and the way down to the Sleeping Deep).
import { G } from '../../core.js';
import { flag, setFlag, travelling } from '../../state.js';
import { toScreen } from '../../engine/iso.js';
import { grid, sprinkle, ridge } from './grid.js';
import { LEG, comp, chime, chirp } from './common.js';

const tileXY = (ex, x, y) => { const s = toScreen(x, y, ex.hAt(x, y)); return { x: s.x + ex.ox, y: s.y + ex.oy }; };
// a fixed starfield (seeded), for behind the map and in the rock
const STARS = (() => { let a = 7; const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; return Array.from({ length: 140 }, () => [r() * 640, r() * 360, r(), r() * 6]); })();
function drawStars(c, k = 1) {
  const t = G.time;
  for (const [x, y, b, ph] of STARS) {
    const a = (0.25 + 0.6 * b) * (0.6 + 0.4 * Math.sin(t * (0.8 + b) + ph)) * k;
    c.fillStyle = b > 0.85 ? `rgba(255,236,190,${a})` : `rgba(200,220,255,${a})`;
    c.fillRect(Math.round(x), Math.round(y), b > 0.9 ? 2 : 1, b > 0.9 ? 2 : 1);
  }
}

// ---------------------------------------------------------------- the Root of the World
const STONES = [[28, 3], [17, 16], [12, 31]];
const ELEVEN = { x: 36, y: 12 };
function root() {
  const g = grid(40, 36, ' ', 0);
  g.path([[2, 3], [9, 3], [9, 12], [20, 12], [20, 5], [31, 5], [31, 20], [22, 20], [22, 29], [34, 29]], 'r', 3, 0);
  g.disc(5, 5, 3.4, 'r', 0);
  g.disc(15, 13, 4.2, 'r', 0);
  g.disc(27, 5, 3.4, 'r', 0);
  g.path([[33, 12], [36, 12]], 'r', 3, 0); g.disc(37, 13, 2.8, 'r', 0);       // Elevenfold's hollow
  g.disc(26, 21, 4.2, 'r', 0);
  g.path([[22, 28], [14, 28]], 'r', 3, 0); g.disc(13, 30, 3, 'r', 0);        // a dead-end hollow with a star
  g.disc(34, 30, 3.2, 'o', 0);                                                // the old carved gate of Deepdelve
  for (let y = 0; y < 36; y++) for (let x = 0; x < 40; x++) if (g.get(x, y) === 'r' && (x * 3 + y * 7) % 13 === 0) g.set(x, y, 'f');
  for (let y = 0; y < 36; y++) for (let x = 0; x < 40; x++) if (g.get(x, y) === 'r' && (x * 5 + y * 11) % 17 === 0) g.set(x, y, 'm');
  ridge(g, 'rfmo', 'V', 2);
  return g;
}
const RO = root();
const rootMap = {
  name: 'The Root of the World', world: 'depths', area: 'root', music: 'm-deep', ambience: [['drone-bed', 0.4], ['hum', 0.12]], battle: 'root', dark: 0.35,
  sky: '#05060c',
  tiles: RO.rows(), heights: RO.hrows(), legend: LEG,
  entries: { top: [3, 4, 'se'], gate: [33, 29, 'nw'], eleven: [36, 14, 'nw'] },
  props: [
    { id: 'prop-giant-root', x: 12, y: 10, w: 2, h: 1 }, { id: 'prop-giant-root', x: 17, y: 15, w: 2, h: 1 },
    { id: 'prop-giant-root', x: 24, y: 3, w: 2, h: 1 }, { id: 'prop-giant-root', x: 29, y: 23, w: 2, h: 1 },
    ['prop-root-pillar', 13, 15], ['prop-root-pillar', 18, 11], ['prop-star-rock', 3, 7], ['prop-root-pillar', 29, 8], ['prop-root-pillar', 23, 24],
    ['prop-star-rock', 4, 3], ['prop-star-rock', 15, 10], ['prop-star-rock', 30, 4], ['prop-star-rock', 24, 18], ['prop-star-rock', 38, 12], ['prop-star-rock', 11, 29],
    ['prop-glow-crystal', 8, 6], ['prop-glow-crystal', 21, 13], ['prop-glow-crystal', 33, 16], ['prop-glow-crystal', 27, 25],
    { id: 'prop-elevenfold-stall', x: 36, y: 11, w: 2, h: 1 },
    ...STONES.map(([x, y], i) => ({ id: 'prop-star-stone', x, y, cond: () => !flag('c4_star' + i) })),
    ['prop-ruin-arch', 35, 28], ['prop-ruin-arch', 36, 31], ['prop-rest-stone', 32, 31],
  ],
  npcs: [
    { id: 'elevenfold', x: ELEVEN.x, y: ELEVEN.y, facing: 'se', talk: 'c4.elevenfold', faceBack: 'se' },
  ],
  enemies: [
    { id: 'ro2', type: 'star-thing', x: 26, y: 6, loop: [[25, 5], [28, 5], [28, 7], [25, 7]], encounter: 'c4.ro-2', facing: 'sw' },
    { id: 'ro3', type: 'moving-root', x: 31, y: 15, loop: [[31, 13], [32, 13], [32, 18], [31, 18]], encounter: 'c4.ro-3', facing: 'sw' },
    { id: 'ro4', type: 'star-thing', x: 25, y: 22, loop: [[24, 20], [28, 20], [28, 22], [24, 22]], encounter: 'c4.ro-4', facing: 'nw' },
  ],
  doors: [
    { x: 1, y: 3, to: 'c4-field', entry: 'root' }, { x: 1, y: 4, to: 'c4-field', entry: 'root' }, { x: 1, y: 5, to: 'c4-field', entry: 'root' },
    { x: 37, y: 30, to: 'c4-deepdelve', entry: 'gate' }, { x: 37, y: 29, to: 'c4-deepdelve', entry: 'gate' },
  ],
  triggers: [
    ...STONES.map(([x, y], i) => ({ x, y, use: true, run: async s => pickStar(s, i), cond: () => !flag('c4_star' + i) })),
    { x: 32, y: 31, use: true, run: async s => { await s.narrate('A rest stone, mossy and warm, under the carved gate. Somebody put it here on purpose, a long time ago.'); await s.rest(); } },
    { x: 7, y: 3, w: 1, h: 3, run: 'c4.root-stars', once: true },
    { x: 12, y: 12, w: 1, h: 3, run: 'c4.root-roots', once: true },
    { x: 33, y: 11, w: 1, h: 3, run: 'c4.eleven-first', once: true },
    { x: 31, y: 28, w: 1, h: 3, run: 'c4.gate-first', once: true },
  ],
  chests: [
    { id: 'c4ro-1', x: 5, y: 8, give: { buttons: 320, 'star-stone-item': 2 } },
    { id: 'c4ro-2', x: 14, y: 32, give: { buttons: 360, 'glow-mushroom': 1 } },
  ],
  onEnter: 'c4.root.enter',
  drawBack(ex, c) { drawStars(c); },
  // stars in the rock: glints on the walls near Bramble's screen
  drawOver(ex, c) {
    const t = G.time;
    for (let i = 0; i < 40; i++) {
      const x = (i * 131 + 17) % 640, y = (i * 89 + 41) % 360, a = 0.15 + 0.15 * Math.sin(t * 1.3 + i * 2.1);
      if (a > 0.22) { c.fillStyle = `rgba(255,240,200,${a})`; c.fillRect(x, y, 1, 1); }
    }
  },
  // the roots that move: two of them shift every few seconds (one tile), as if the world were breathing
  update(ex, dt) {
    ex._rootT = (ex._rootT || 0) + dt;
    const ph = Math.floor(ex._rootT / 3.5) % 2;
    if (ph === ex._rootPh) return;
    ex._rootPh = ph;
    for (const p of ex.map.props) {
      if (p.id !== 'prop-giant-root' || !(p.y === 15 || p.y === 16 || p.y === 23 || p.y === 24)) continue;
      const ny = (p.y === 15 || p.y === 16) ? (ph ? 16 : 15) : (ph ? 24 : 23);
      const free = [0, 1].every(k => !(ex.b.x === p.x + k && ex.b.y === ny) && !ex.followers.some(f => f.x === p.x + k && f.y === ny && f.merge < 1) && !ex.map.enemies.some(e => e.x === p.x + k && e.y === ny));
      if (free) p.y = ny;
    }
  },
};
async function pickStar(s, i) {
  if (s.flag('c4_star' + i)) return;
  s.set('c4_star' + i);
  s.ex.map.props = s.ex.map.props.filter(p => !(p.id === 'prop-star-stone' && p.x === STONES[i][0] && p.y === STONES[i][1]));
  s.sfx('shimmer');
  await s.give({ 'star-stones': 1 });
  const n = [0, 1, 2].filter(k => s.flag('c4_star' + k)).length;
  if (n === 1) await s.narrate('A star-stone: a pebble with a light inside it, cool and steady, like a star that has decided to stay put.');
  else s.toast(`Star-stones: ${n} of 3`);
}

// ---------------------------------------------------------------- the ruins of Deepdelve Warren
const HR = { x: 22, y: 17 };            // the storyteller's seat in Deepdelve's Great Burrow
function deepdelve() {
  const g = grid(38, 36, ' ', 0);
  g.path([[0, 17], [12, 17]], 'e', 3, 0);                    // the gate tunnel
  g.path([[10, 17], [10, 8]], 'e', 2, 0); g.disc(10, 6, 3.6, 'f', 0);            // the nursery
  g.path([[10, 19], [10, 27]], 'e', 2, 0); g.disc(10, 29, 3.6, 'f', 0);          // the mural room
  g.path([[12, 17], [17, 17]], 'e', 3, 0);
  g.disc(HR.x, HR.y + 1, 5.6, 'f', 0);                       // the Great Burrow
  g.path([[22, 11], [22, 5]], 'e', 2, 0); g.disc(24, 4, 3, 'f', 0);              // a sleeping room
  g.path([[22, 23], [22, 30]], 'e', 2, 0); g.disc(24, 31, 3, 'f', 0);            // the store
  g.path([[27, 17], [33, 17]], 'e', 3, 0);                   // on to the way down
  g.disc(33, 18, 3.4, 'o', 0);
  for (let y = 0; y < 36; y++) for (let x = 0; x < 38; x++) if (g.get(x, y) === 'f' && Math.hypot(x - HR.x, y - HR.y - 1) < 2.2) g.set(x, y, 'o');
  sprinkle(g, 'e', 'r', 14, 3);
  sprinkle(g, 'f', 'm', 8, 5);
  ridge(g, 'efrmo', 'V', 1);
  g.set(9, 26, 'V', 2); g.set(10, 26, 'V', 2);             // the mural's back wall (the way in is x=11)
  return g;
}
const DD = deepdelve();
const fade = () => flag('c4_hollow_won');
const hollowNpc = (id, x, y, sprite, facing, talk) => ({ id, sprite, look: 'hollow', x, y, facing, talk, cond: () => !fade() });
const deepdelveMap = {
  name: 'Deepdelve', world: 'warren', area: 'root', music: () => flag('c4_hollow_won') ? 'm-deep' : 'm-deep', ambience: [['hum', 0.2], ['drone-bed', 0.3]], battle: 'root', dark: 0.5,
  sky: '#040408',
  tiles: DD.rows(), heights: DD.hrows(), legend: LEG,
  entries: { gate: [2, 17, 'se'], deep: [31, 18, 'nw'], burrow: [17, 17, 'se'] },
  props: [
    ['prop-ruin-arch', 1, 15], ['prop-ruin-arch', 1, 19],
    ['prop-nursery-nest', 9, 4], ['prop-nursery-nest', 12, 5], ['prop-nursery-nest', 8, 7], ['prop-moss-bed', 12, 8], ['prop-tunnel-heap', 7, 4],
    { id: 'prop-mural-wall', x: 8, y: 27, w: 3, h: 1, whole: true }, ['prop-rubble', 7, 30], ['prop-bones', 13, 30],
    ['prop-ruin-seat', HR.x, HR.y - 1], ['prop-root-pillar', 18, 14], ['prop-root-pillar', 26, 14], ['prop-root-pillar', 18, 22], ['prop-root-pillar', 26, 22],
    ['prop-rest-stone', 13, 19], ['prop-lantern-mushroom', 15, 19], ['prop-moss-bed', 24, 2], ['prop-moss-bed', 26, 4], ['prop-rubble', 21, 3],
    ['prop-cellar-baskets', 25, 33], ['prop-cellar-baskets', 26, 31], ['prop-tunnel-heap', 22, 33],
    { id: 'prop-eye-stair', x: 34, y: 17, w: 2, h: 2 }, ['prop-carved-pillar', 33, 15], ['prop-carved-pillar', 33, 21],
  ],
  npcs: [
    hollowNpc('hollow-a', 11, 6, 'rabbit-kit', 'se', 'c4.hollow-talk'),
    hollowNpc('hollow-b', 9, 30, 'rabbit-doe', 'ne', 'c4.hollow-talk'),
    hollowNpc('hollow-c', 25, 4, 'rabbit-buck', 'sw', 'c4.hollow-talk'),
    hollowNpc('hollow-1', HR.x - 2, HR.y + 1, 'rabbit-buck', 'ne', 'c4.hollow-boss'),
    hollowNpc('hollow-2', HR.x + 2, HR.y + 1, 'rabbit-doe', 'nw', 'c4.hollow-boss'),
    hollowNpc('hollow-3', HR.x - 1, HR.y + 3, 'rabbit-doe', 'ne', 'c4.hollow-boss'),
    hollowNpc('hollow-4', HR.x + 1, HR.y + 3, 'rabbit-kit', 'nw', 'c4.hollow-boss'),
  ],
  enemies: [
    { id: 'dd1', type: 'hollow-rabbit', sprite: 'rabbit-buck', look: 'hollow', x: 6, y: 17, loop: [[5, 17], [8, 17], [8, 18], [5, 18]], encounter: 'c4.dd-1', facing: 'sw' },
    { id: 'dd3', type: 'hollow-rabbit', sprite: 'rabbit-doe', look: 'hollow', x: 22, y: 27, loop: [[22, 25], [23, 25], [23, 29], [22, 29]], encounter: 'c4.dd-3', facing: 'ne' },
  ],
  doors: [
    { x: 0, y: 16, to: 'c4-root', entry: 'gate' }, { x: 0, y: 17, to: 'c4-root', entry: 'gate' }, { x: 0, y: 18, to: 'c4-root', entry: 'gate' },
    { x: 33, y: 18, to: 'c5-deep', entry: 'top', cond: () => flag('g_ch4_done'), run: 'c4.way-down' },
  ],
  triggers: [
    { x: 13, y: 19, use: true, run: async s => { await s.narrate('A rest stone in the gate tunnel, its moss gone silver. Rabbits rested here, once, on the way home.'); await s.rest(); } },
    { x: 8, y: 27, w: 3, h: 1, use: true, run: 'c4.dd-mural' },
    { x: HR.x, y: HR.y - 1, use: true, run: 'c4.dd-seat' },
    { x: 18, y: 16, w: 1, h: 3, run: 'c4.hollow-boss', once: true, cond: () => !fade() },
    { x: 33, y: 18, run: 'c4.way-shut', cond: () => !flag('g_ch4_done') },
    { x: 34, y: 17, w: 2, h: 2, use: true, run: 'c4.way-down', cond: () => flag('g_ch4_done') },
  ],
  chests: [
    { id: 'c4dd-1', x: 13, y: 7, give: { buttons: 380, 'jade-elixir': 1 } },
    { id: 'c4dd-2', x: 26, y: 32, give: { buttons: 400, 'star-stone-item': 2, 'glow-mushroom': 1 } },
  ],
  onEnter: 'c4.deepdelve.enter',
  drawBack(ex, c) { drawStars(c, 0.5); },
  // a faint blue breath out of the way down, and pale motes where the Hollow Rabbits faded
  drawOver(ex, c) {
    const t = G.time, p = tileXY(ex, 34, 17);
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.3 + i / 3) % 1);
      c.strokeStyle = `rgba(150,190,255,${(1 - k) * (flag('g_ch4_done') ? 0.3 : 0.12)})`;
      c.beginPath(); c.ellipse(p.x + 16, p.y + 14 - k * 30, 10 + k * 30, 5 + k * 14, 0, 0, Math.PI * 2); c.stroke();
    }
    if (ex._motes) for (const m of ex._motes) { m.y -= 0.25; m.a -= 0.004; if (m.a > 0) { c.fillStyle = `rgba(200,220,255,${m.a})`; c.fillRect(Math.round(m.x + ex.ox), Math.round(m.y + ex.oy), 2, 2); } }
  },
};

// ---------------------------------------------------------------- scripts
export const SCRIPTS = {
  'c4.root.enter': async (s) => {
    if (!s.flag('c4_seen_root')) {
      s.set('c4_seen_root');
      await s.wait(0.3);
      await s.narrate('Down the tunnel, and down, and the air goes cool and still. And then there are stars.');
      await s.narrate('Not in a sky. In the rock. Pinpricks of light in the walls, the floor, the roof, slowly turning, as if the earth had swallowed a night.');
      await chime(s, { rumble: 'Stars! Inside! Hrrm... Rumble whispers now. Stars like whispering.', ninefold: 'Oh. Oh, I have heard of this. The Root of the World. I never thought I would be invited.', 'jade-rabbit': 'They are not my stars. They are older. They do not know the Moon.', pip: 'Can I take one home? A little one? Just to show Tuft?', _: 'Nobody speaks above a whisper.' });
      await chime(s, { 'captain-quarry': 'The Hum. Feel it? It\'s here, under everything. Like a snore through a wall.', tansy: 'The Hum\'s stronger. Stay close, everyone. Bramble, that means you.', badger: 'Deep. Very deep. Too deep for any honest creature. Hmph. On we go.', burdock: 'Hmph. Stars. Underground. No.' });
      s.quest('Find a way through the Root of the World.');
      s.save();
    } else s.ex.enterBubble();
  },
  'c4.root-stars': async (s) => {
    await chime(s, { mole: 'If you count them, they count you back. I\'m sure of it. Don\'t count them.', 'tin-woodman': 'I should like to show these to Dorothy. She would know a song about them.', 'cheshire-cat': 'Every one of those is a little hole where the night is leaking in. Or out. Which, do you think?', caterpillar: 'Stars. In rock. Hmph. They are only sky that took a wrong turn.', toad: 'Splendid! I shall have the ceiling at Toad Hall done in exactly this.', _: 'The stars turn, very slowly.' });
  },
  'c4.root-roots': async (s) => {
    await s.narrate('Roots, thick as tree trunks, run across the cave from wall to wall. Not quite still. Now and then one of them shifts, like a sleeper turning over.');
    await chime(s, { badger: 'Roots of what, I wonder. No tree could grow this far down. Hmph. Don\'t answer that.', 'captain-quarry': 'Watch the big ones. They move when you\'re not looking. Like flint dust in a breeze.', rumble: 'Roots wiggle. Rumble does not like wiggle.', _: 'Something above is very, very big.' });
  },
  'c4.eleven-first': async (s) => {
    await s.narrate('A soft light in a hollow off the passage. A little stall with an awning made of moss. Behind it, something with a great many eyes is arranging pebbles.');
  },
  'c4.elevenfold': async (s) => {
    const n = [0, 1, 2].filter(k => s.flag('c4_star' + k)).length;
    if (!s.flag('c4_eleven_met')) {
      s.set('c4_eleven_met');
      await s.say('elevenfold', 'Oh! Oh, customers. Real ones. With feet. Please do not scream. Nobody ever stays to look at the stock.');
      await s.say('bramble', 'I\'m not going to scream. I\'m Bramble. Who are you?');
      await s.say('elevenfold', 'Elevenfold, of the Root, at your service. Eleven eyes, one stall, no visitors in four hundred years. Until now. This is a GREAT day.');
      if (s.party().includes('ninefold') || s.member('ninefold')) {
        await s.say('ninefold', 'Cousin?');
        await s.say('elevenfold', 'NINEFOLD! Little Ninefold! Look at you, travelling! With FRIENDS! Who do not scream!');
        await s.say('ninefold', 'They gave me a dandelion. I still have it. Would you like to see?');
        await s.say('elevenfold', 'Would I! Oh, the family will never believe it.');
      }
      await s.say('elevenfold', 'I sell what the Root grows: tough coats, bright stones, good tools. And I collect star-stones. Fallen stars. They roll about down here.');
      await s.say('elevenfold', 'If you should find three, and bring them to me, I could make you my very best things. The things I keep for nobody.');
      s.set('c4_eleven_asked');
      s.quest('Optional: find three star-stones in the Root of the World for Elevenfold. (Then on through the carved gate to Deepdelve.)');
    } else if (n >= 3 && !s.flag('c4_eleven_done')) {
      await s.say('bramble', 'We found three star-stones. Here.');
      s.take('star-stones', 3);
      await s.narrate('Elevenfold holds the three stones up, one by one, to all eleven eyes. The stall fills with soft starlight.');
      await s.say('elevenfold', 'Oh. Oh, they are perfect. This one is from a summer. This one remembers snow. This one was somebody\'s wish, once.');
      await s.say('elevenfold', 'Do you know, nobody has ever brought me a present. Ninefold told me about the dandelion. I thought it was a story. It is NOT a story.');
      await chime(s, { ninefold: 'You see, cousin? It happens. It happens to us, too.', 'jade-rabbit': 'A gift for the one who sells gifts. That is how it should be.', pip: 'It\'s crying! Is it crying? Is it happy-crying?', _: 'Elevenfold\'s eyes shine, every one of them.' });
      s.set('c4_eleven_done');
      s.remember('mem-stars');
      await s.give({ buttons: 260 });
      await s.say('elevenfold', 'My best stock is yours. Anything. And I shall tell the whole family. Every fold of it.');
      s.toast('A memory to keep: Elevenfold\'s star-stones.');
      if (!s.flag('c4_hollow_won')) s.quest('Go through the carved gate at the far end of the Root, into Deepdelve. (Rest at the stone first.)');
    } else if (s.flag('c4_eleven_done')) {
      await s.say('elevenfold', 'Back again! I have polished everything twice. Please do look. Looking is free. Looking is WONDERFUL.');
    } else {
      await s.say('elevenfold', n ? `${n} star-stone${n > 1 ? 's' : ''}! You are a natural. ${3 - n} more, and my best things are yours.` : 'Star-stones glow in the corners of the Root. They like dead ends. Most lovely things do.');
    }
    await s.shop('c4.elevenfold-stall');
  },
  'c4.gate-first': async (s) => {
    await s.narrate('An arch, carved with rabbits. Rabbits digging, rabbits sitting, rabbits dancing in a ring. Beyond it, a tunnel that smells of very old earth.');
    await s.say('bramble', 'Rabbits made this. Deepdelve. We\'re here.');
    await chime(s, { 'captain-quarry': 'Deepdelve. Yarrow\'s old story. I always thought it was for frightening kits.', tansy: 'The bedtime story with the bad ending. Let\'s give it a better one.', ninefold: 'I can hear something whispering inside. Not unkind. Just... lost.', _: 'Something beyond the arch whispers.' });
    s.quest('Go through the carved gate into the ruins of Deepdelve Warren. (Rest at the stone first.)');
  },
  'c4.deepdelve.enter': async (s) => {
    if (!s.flag('c4_seen_dd')) {
      s.set('c4_seen_dd');
      await s.wait(0.3);
      await s.narrate('Deepdelve Warren. Rooms like Thimblebank\'s, tunnels like Thimblebank\'s, nests and beds and baskets, all furred with dust.');
      await s.narrate('And all empty. Except for the shadows. Rabbit-shaped shadows, sitting where rabbits would sit, not quite there.');
      await chime(s, { pip: 'It\'s like home. It\'s like home, but everybody went away. Bramble, I don\'t like it.', 'captain-quarry': 'This is what Flintcomb would have been. In a hundred years. This is what I was digging toward.', 'tin-woodman': 'Oh, how sad. How very sad. I shall not cry. I shall need my joints.', _: 'Dust hangs in the air, not falling.' });
      s.quest('Find what\'s left of Deepdelve: follow the tunnel to its Great Burrow.');
      s.save();
    } else s.ex.enterBubble();
  },
  'c4.hollow-talk': async (s, a) => {
    const lines = {
      'hollow-a': ['"...I was going to grow up and... and..."', 'The little shadow looks at Bramble, and looks through him, and goes back to looking at the empty nest.'],
      'hollow-b': ['"There was a painting. Somebody painted us. Somebody... was it me?"', 'She touches the wall where the mural is, very lightly, the way you touch something you used to know.'],
      'hollow-c': ['"Is it morning? It\'s always nearly morning. I keep almost waking up."', 'He curls tighter on the dusty bed, and is very nearly not there.'],
    };
    const l = lines[a && a.id] || lines['hollow-a'];
    await s.say('hollow-rabbit', l[0]);
    await s.narrate(l[1]);
    if (!s.flag('c4_hollow_talked')) { s.set('c4_hollow_talked'); await chime(s, { ninefold: 'They have forgotten everything. Even that they forgot. I know that cold.', tansy: 'That\'s what the Hum does if nobody comes. That was nearly me.', _: 'They have forgotten everything.' }); }
  },
  'c4.dd-mural': async (s) => {
    await s.picture('bg-mural', ['A mural, cracked and faded. Deepdelve\'s rabbits, digging down, down, all together, singing.', 'At the bottom, a long dark shape, curled. And one great eye, opening.']);
    await chime(s, { 'captain-quarry': 'They didn\'t mean it. You can see. They were singing. They were happy. They just didn\'t stop.', ninefold: 'The same mural as in the Shallows. They painted it twice. Perhaps they wanted somebody to understand.', _: 'They didn\'t mean it.' });
  },
  'c4.dd-seat': async (s) => {
    if (!fade()) { await s.narrate('A storyteller\'s seat, worn into the shape of somebody who sat in it every night for years.'); return; }
    await s.narrate('The storyteller\'s seat. Bramble sits in it, just for a moment. It\'s still a little warm. It can\'t be. It is.');
    await s.say('bramble', 'When we get home, somebody should tell Deepdelve\'s story. The real one. Not the scary one.');
  },
  'c4.hollow-boss': async (s) => {
    if (fade()) return;
    if (!s.flag('c4_hollow_seen')) {
      s.set('c4_hollow_seen');
      await s.narrate('Deepdelve\'s Great Burrow. A ring of roots like pillars, and in the middle a storyteller\'s seat. Around it, four shadows sit, waiting for a story.');
      await s.narrate('As Bramble steps in, they turn. Slowly. All together. Where their eyes should be, there is only a pale blue nothing.');
      await s.say('hollow-rabbit', '"...New ones. New ones, come down to dig. Come and sit. Come and forget. It\'s quiet, when you forget."');
      const c = await s.ask('bramble', 'The shadows rise.', ['We\'re here to remember for you.', 'Wake up. Please. It\'s nearly morning.']);
      if (c === 0) await s.say('hollow-rabbit', '"Remember? What is... remember...?"');
      else await s.say('hollow-rabbit', '"Morning... morning... it is always nearly morning..."');
      await chime(s, { tansy: 'Gently, everyone. They\'re rabbits. They\'re just very, very tired rabbits.', 'jade-rabbit': 'Light. Bring them light. That is what they have been missing.', ninefold: 'Be kind to them. Someone should have been, long ago.', _: 'Gently.' });
    } else await s.say('hollow-rabbit', '"...Come and sit... come and forget..."');
    await s.battle('c4.hollow');
    s.set('c4_hollow_won');
    s.sfx('wake-chime');
    await s.wait(0.5);
    await s.narrate('The shadows stop. They sit down, one by one, around the storyteller\'s seat, as if somebody had just said "once upon a time".');
    s.voice('vo-whisper');
    await s.say('hollow-rabbit', '"...Sorrel. My name was Sorrel. Like the down. My mother named me for the down."');
    await s.say('hollow-rabbit', '"Fern. I was Fern. I kept the nursery. Oh, the kits. Did they get out? Somebody tell me the kits got out."');
    const c2 = await s.ask('bramble', 'The little one is looking at Bramble.', ['They got out. They built new warrens.', 'I\'ll make sure everyone knows your names.']);
    if (c2 === 0) await s.say('hollow-rabbit', '"New warrens. Up in the light. ...Thimblebank? With the chalk? Oh. Oh, good."');
    else await s.say('hollow-rabbit', '"Names. Yes. A name is a sort of light. Keep ours lit."');
    await s.say('hollow-rabbit', '"Thank you, little buck. We were so cold. We were so tired of almost waking."');
    await s.narrate('And they fade: not all at once, but like breath on a cold morning, gently, until there is only a little drift of pale motes rising toward the stars in the roof.');
    const ex = s.ex;
    ex._motes = [];
    for (const id of ['hollow-1', 'hollow-2', 'hollow-3', 'hollow-4', 'hollow-a', 'hollow-b', 'hollow-c']) {
      const a = ex.map.actors.find(q => q.id === id);
      if (a) { const p = toScreen(a.x, a.y, ex.hAt(a.x, a.y)); for (let k = 0; k < 8; k++) ex._motes.push({ x: p.x - 6 + Math.random() * 12, y: p.y - Math.random() * 20, a: 0.7 + Math.random() * 0.3 }); }
      s.remove(id);
    }
    s.sfx('fade-sigh');
    await s.wait(1.2);
    await chime(s, { 'captain-quarry': 'At peace. That\'s... that\'s more than I deserved, and they got it anyway. Good.', 'tin-woodman': 'I am crying. It is the good kind. It is all right.', pip: 'They\'re not sad any more. Are they? Bramble, they\'re not sad?', rumble: 'Hrrm. Shadows sleep now. Good sleep.', _: 'Everyone stands still for a long time.' });
    s.shake(1.4, 2); s.sfx('rumble', { vol: 0.6 });
    await s.narrate('Then, from far below, from beyond the stair at the end of the burrow: a long, slow breath. The whole warren breathes with it.');
    await s.say('bramble', 'That\'s it. That\'s the Sleeper. It\'s right underneath us.');
    await chime(s, { tansy: 'Then that\'s where we go. Together. Like always.', 'captain-quarry': 'Four warrens are free. Thimblebank, Silverdown, Wheatsheaf, Flintcomb. Yarrow said: nearly enough for a thump.', ninefold: 'It isn\'t wicked. I can tell. It is only dreaming badly. We all do, sometimes.', _: 'The stair goes down into the dark.' });
    await s.say('bramble', 'When all the warrens thump as one... Let\'s go and finish the rhyme.');
    s.set('g_ch4_done');
    s.chapter(5);
    s.quest('Go down the stair at the end of Deepdelve, to the Sleeping Deep.');
    s.save();
  },
  'c4.way-shut': async (s) => {
    await s.narrate('A stair, going down. Something pale and patient seems to be looking up it. Not yet. Deepdelve isn\'t finished with you.');
    await s.warp('c4-deepdelve', 31, 18, 'nw');
  },
  'c4.way-down': async (s) => {
    const c = await s.ask(null, 'The stair goes down into the Sleeping Deep. There may be no coming back until it\'s done.', ['Go down.', 'Not yet.']);
    if (c !== 0) { await s.warp('c4-deepdelve', 31, 18, 'nw'); return; }
    s.set('g_ch4_done');
    if (G.data.maps['c5-deep']) await s.warp('c5-deep', 'top');
    else { await s.narrate('(The Sleeping Deep is not here yet.)'); await s.warp('c4-deepdelve', 31, 18, 'nw'); }
  },
};

const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export const ENCOUNTERS = {
  'c4.ro-2': { enemies: [['star-thing', 25, 2], ['moving-root', 25, 1], ['moving-root', 25]], bg: 'root', tweak: hardy(1.25) },
  'c4.ro-3': { enemies: [['moving-root', 25, 2], ['star-thing', 25, 1], ['star-thing', 25]], bg: 'root', tweak: hardy(1.25) },
  'c4.ro-4': { enemies: [['star-thing', 25, 2], ['moving-root', 25, 1], ['star-thing', 25]], bg: 'root', tweak: hardy(1.25) },
  'c4.dd-1': { enemies: [['hollow-rabbit', 25, 2], ['hollow-rabbit', 25, 1], ['hollow-rabbit', 25]], bg: 'root', tweak: hardy(1.4) },
  'c4.dd-3': { enemies: [['hollow-rabbit', 26, 2], ['hollow-rabbit', 25, 1], ['hollow-rabbit', 25, 1], ['hollow-rabbit', 25]], bg: 'root', tweak: hardy(1.2) },
  'c4.hollow': {
    enemies: [['hollow-rabbits', 26, 1], ['hollow-rabbits', 26, 1], ['hollow-rabbits', 26, 1], ['hollow-rabbits', 26, 1]], bg: 'root', boss: true, music: 'm-boss-hum',
    intro: ['The Hollow Rabbits rise, pale and quick and cold.', '"Come and forget..."'],
    tweak(enemies) { for (const e of enemies) { e.xp = Math.round(e.xp * 0.25); e.maxHp = e.hp = Math.round(e.maxHp * 3.0); e.str = Math.round(e.str * 0.9); e.wit = Math.round(e.wit * 0.9); } },   // four boss shares: together they give one boss's XP. HP/STR: boss fix (design/progress/bosses.md): ~11 rounds (an outlier: no Light hit-all in the travelling three)
  },
};

export const SHOPS = {
  'c4.elevenfold-stall': {
    name: 'Elevenfold\'s Stall', keeper: 'elevenfold',
    line: 'Welcome, welcome! Everything is lovely and nothing bites. Except that. Don\'t touch that.',
    gear: () => flag('c4_eleven_done')
      ? ['flint-pick+6', 'lantern+6', 'mastodon-hide+6', 'tin-vest+6', 'glow-bead+6', 'courage-ribbon+6', 'calm-stone+6', 'silver-bell+6', 'acorn-cap+6']
      : ['mastodon-hide+5', 'glow-bead+5', 'silver-bell+5', 'quill+5'],
    items: ['dandelion', 'carrot-cake', 'pluck-berry', 'glow-mushroom', 'star-stone-item', 'jade-elixir', 'emerald-lozenge', 'courage-biscuit'],
    army: 3,
  },
};

export const MAPS = { 'c4-root': rootMap, 'c4-deepdelve': deepdelveMap };
