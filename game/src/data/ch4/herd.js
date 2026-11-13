// The far shore: the forest of giant mushrooms, the plain of bones (Rumble, lost), and the shepherd's field
// (sneak past the giant shepherd's gaze with Rumble, back to the herd), then the fallen rock on the way down.
import { G } from '../../core.js';
import { flag, setFlag, travelling, setActive } from '../../state.js';
import { toScreen } from '../../engine/iso.js';
import { audio } from '../../engine/audio.js';
import { grid, sprinkle, ridge } from './grid.js';
import { LEG, comp, chime, chirp } from './common.js';

const tileXY = (ex, x, y) => { const s = toScreen(x, y, ex.hAt(x, y)); return { x: s.x + ex.ox, y: s.y + ex.oy }; };

// ---------------------------------------------------------------- the mushroom forest and the plain of bones
const MUSH = [[4, 8], [9, 5], [15, 7], [6, 14], [3, 25], [8, 29], [14, 31], [18, 25], [19, 14], [11, 25], [17, 3], [5, 33], [20, 33], [2, 4]];
function mushrooms() {
  const g = grid(44, 40, ' ', 0);
  g.rect(0, 2, 22, 37, 'm', 0);
  g.rect(23, 4, 43, 35, 'j', 0);
  g.rect(21, 8, 24, 30, 'm', 0);
  // wandering paths of trodden rock through the forest
  g.path([[0, 20], [6, 20], [6, 17], [12, 17], [12, 21], [22, 21]], 'a', 2, 0);
  g.path([[22, 21], [30, 21], [30, 13], [42, 13]], 'a', 2, 0);
  g.disc(12, 20, 3.2, ',', 0);                                           // the glade
  // the plain of bones: humps and heaps
  for (const [x, y] of [[27, 7], [34, 9], [39, 18], [26, 27], [33, 31], [40, 27], [36, 23]]) g.rect(x, y, x + 1, y + 1, 'B', 1);
  for (let y = 4; y < 36; y++) for (let x = 23; x < 44; x++) if (g.get(x, y) === 'j' && ((x * 5 + y * 3) % 7 === 0)) g.set(x, y, 'a');
  for (let y = 0; y < 40; y++) for (let x = 0; x < 44; x++) if ((g.get(x, y) === 'j' || g.get(x, y) === 'a') && x > 32 && y < 12) g.set(x, y, null, 1);
  for (let y = 0; y < 40; y++) for (let x = 0; x < 44; x++) if ((g.get(x, y) === 'j' || g.get(x, y) === 'a') && x > 36 && y < 9) g.set(x, y, null, 2);
  sprinkle(g, 'm', ',', 10, 6);
  ridge(g, 'mja,B');
  return g;
}
const MU = mushrooms();
const mushroomsMap = {
  name: 'The Mushroom Forest', world: 'journey', area: 'mushrooms', music: 'm-journey', ambience: [['wind', 0.15], ['drone-bed', 0.2]], battle: 'mushroom', dark: 0.15,
  sky: '#1a1e1a',
  tiles: MU.rows(), heights: MU.hrows(), legend: LEG,
  entries: { shore: [1, 20, 'se'], field: [41, 13, 'nw'], glade: [12, 20, 'se'] },
  props: [
    ...MUSH.map(([x, y]) => ({ id: 'prop-giant-mushroom', x, y, w: 2, h: 2 })),
    ['prop-lantern-mushroom', 8, 18], ['prop-lantern-mushroom', 16, 18], ['prop-lantern-mushroom', 10, 23], ['prop-lantern-mushroom', 15, 23],
    ['prop-lantern-mushroom', 3, 11], ['prop-lantern-mushroom', 20, 9], ['prop-lantern-mushroom', 4, 31],
    ['prop-bones', 28, 15], ['prop-bones', 37, 16], ['prop-bones', 25, 33], ['prop-bones', 41, 30], ['prop-bones', 31, 26], ['prop-bones', 34, 4],
    ['prop-crater-rock', 38, 34], ['prop-rest-stone', 39, 11],
  ],
  npcs: [
    { id: 'rumble', sprite: 'rumble', x: 34, y: 28, facing: 'nw', talk: 'c4.rumble.find', cond: () => !flag('c4_rumble_met') },
  ],
  enemies: [
    { id: 'mu1', type: 'cave-lizard', x: 7, y: 11, loop: [[7, 11], [11, 11], [11, 12], [7, 12]], encounter: 'c4.mu-1', facing: 'sw' },
    { id: 'mu3', type: 'eel-cloud', x: 27, y: 18, loop: [[26, 16], [26, 20], [28, 20], [28, 16]], encounter: 'c4.mu-3', facing: 'sw' },
    { id: 'mu4', type: 'cave-lizard', x: 36, y: 15, loop: [[35, 15], [35, 19], [37, 19], [37, 15]], encounter: 'c4.mu-4', facing: 'sw' },
  ],
  doors: [
    { x: 0, y: 20, to: 'c4-sea', entry: 'mushrooms' }, { x: 0, y: 21, to: 'c4-sea', entry: 'mushrooms' },
    { x: 43, y: 13, to: 'c4-field', entry: 'west', locked: () => !flag('c4_rumble_met'), lockedRun: 'c4.field-locked' },
    { x: 43, y: 14, to: 'c4-field', entry: 'west', locked: () => !flag('c4_rumble_met'), lockedRun: 'c4.field-locked' },
  ],
  triggers: [
    { x: 11, y: 19, w: 3, h: 3, run: 'c4.glade', once: true },
    { x: 26, y: 13, w: 1, h: 18, run: 'c4.bones', once: true },
    { x: 39, y: 11, use: true, run: async s => { await s.narrate('A flat stone among the bones, furred with soft grey moss. Strangely restful.'); await s.rest(); } },
    { x: 29, y: 26, w: 1, h: 5, run: 'c4.rumble.hear', once: true, cond: () => !flag('c4_rumble_met') },
  ],
  chests: [
    { id: 'c4mu-1', x: 2, y: 35, give: { buttons: 280, 'glow-mushroom': 1 } },
    { id: 'c4mu-2', x: 42, y: 34, give: { buttons: 300, 'pluck-berry': 2 } },
    { id: 'c4mu-3', x: 13, y: 3, give: { 'carrot-cake': 2 } },
  ],
  onEnter: 'c4.mushrooms.enter',
  // spores drifting up in the lantern light
  drawOver(ex, c) {
    const t = G.time;
    for (let i = 0; i < 26; i++) {
      const x = (i * 71 + Math.sin(t * 0.3 + i) * 20) % 640, y = 360 - ((t * (6 + i % 5) + i * 37) % 380);
      c.fillStyle = `rgba(200,240,190,${0.25 + 0.2 * Math.sin(t * 2 + i)})`; c.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  },
};

// ---------------------------------------------------------------- the shepherd's field
export const SHEP = { x: 15, y: 13 };
const DIRV = [[1, 0], [0, 1], [-1, 0], [0, -1]];        // +x (down-right), +y (down-left), -x (up-left), -y (up-right)
const DIRNAME = ['se', 'sw', 'nw', 'ne'];
const TURN = 2;                                          // seconds per gaze
export function inCone(dir, x, y) {
  const [dx, dy] = DIRV[dir];
  const rx = x - SHEP.x, ry = y - SHEP.y;
  const d = rx * dx + ry * dy, l = Math.abs(rx * -dy + ry * dx);
  return d >= 2 && d <= 6 && l <= Math.floor(d / 2);
}
const FMUSH = [[11, 8], [18, 8], [11, 16], [18, 16]];
function field() {
  const g = grid(34, 27, ' ', 0);
  g.disc(SHEP.x, SHEP.y, 6.4, 'm', 0);
  g.rect(0, 12, 9, 14, 'm', 0);                          // in from the mushroom forest
  g.rect(21, 12, 23, 14, 'm', 0);                        // out to the herd
  g.rect(23, 2, 33, 25, 'm', 0);                         // the herd's meadow
  g.rect(31, 18, 33, 21, 'a', 0);                        // the tunnel mouth (behind the fallen rock)
  g.rect(SHEP.x - 1, SHEP.y - 1, SHEP.x + 1, SHEP.y + 1, 'R', 2);
  g.set(SHEP.x, SHEP.y, 'R', 3);
  // shade: the tiles round each tall mushroom are cover
  for (const [mx, my] of FMUSH) for (let y = my - 1; y <= my + 2; y++) for (let x = mx - 1; x <= mx + 2; x++) if (g.get(x, y) === 'm') g.set(x, y, 'C');
  sprinkle(g, 'm', ',', 8, 3);
  for (let y = 2; y < 26; y++) for (let x = 23; x < 34; x++) if (g.get(x, y) === 'm' && (x * 3 + y * 5) % 11 === 0) g.set(x, y, ',');
  ridge(g, 'mCa,R', 'R', 2);
  return g;
}
const FI = field();
const herdDone = () => flag('c4_herd_done');
const gazeOn = () => !herdDone();
const fieldMap = {
  name: 'The Shepherd\'s Field', world: 'journey', area: 'mushrooms', music: null, ambience: [['drone-bed', 0.3], ['wind', 0.2]], battle: 'mushroom', dark: 0.25,
  sky: '#141814', merge: true,
  tiles: FI.rows(), heights: FI.hrows(), legend: LEG,
  entries: { west: [1, 13, 'se'], root: [29, 20, 'nw'], herd: [25, 13, 'se'] },
  props: [
    ...FMUSH.map(([x, y]) => ({ id: 'prop-giant-mushroom', x, y, w: 2, h: 2 })),
    { id: 'prop-fallen-rock', x: 30, y: 19, w: 2, h: 2, cond: () => !flag('c4_rock_cleared') },
    ['prop-bones', 4, 11], ['prop-tube-mouth', 33, 21], ['prop-lantern-mushroom', 26, 4], ['prop-lantern-mushroom', 32, 10], ['prop-bones', 27, 23], ['prop-rubble', 32, 22],
  ],
  npcs: [
    // scale 2: 192 px, four Rumbles tall (the text's giant). No talk, so his sprite never takes clicks (clickAt only
    // picks actors with a talk); the stone-heap trigger below is how you speak to him
    { id: 'shepherd', sprite: 'shepherd', x: SHEP.x, y: SHEP.y, facing: 'se', deco: true, scale: 2 },
    { id: 'mast-1', sprite: 'mastodon', x: 29, y: 5, facing: 'sw', talk: 'c4.mastodon' },
    { id: 'mast-2', sprite: 'mastodon', x: 32, y: 7, facing: 'sw', talk: 'c4.mastodon' },
    { id: 'mast-3', sprite: 'mastodon', x: 27, y: 8, facing: 'se', talk: 'c4.mastodon' },
    { id: 'mast-4', sprite: 'mastodon', x: 31, y: 13, facing: 'nw', talk: 'c4.mastodon', cond: () => !herdDone() },
  ],
  doors: [
    { x: 0, y: 12, to: 'c4-mushrooms', entry: 'field' }, { x: 0, y: 13, to: 'c4-mushrooms', entry: 'field' }, { x: 0, y: 14, to: 'c4-mushrooms', entry: 'field' },
    { x: 33, y: 19, to: 'c4-root', entry: 'top', cond: () => flag('c4_rock_cleared') }, { x: 33, y: 20, to: 'c4-root', entry: 'top', cond: () => flag('c4_rock_cleared') },
  ],
  triggers: [
    { x: SHEP.x - 1, y: SHEP.y - 1, w: 3, h: 3, use: true, run: 'c4.shepherd', cond: () => herdDone() },   // face his stone heap and press Space
    { x: 24, y: 12, w: 1, h: 3, run: 'c4.herd', once: true, cond: ex => ex.escorts.some(e => e.id === 'rumble') },
    { x: 30, y: 19, w: 2, h: 2, use: true, run: 'c4.rock', cond: () => !flag('c4_rock_cleared') },
  ],
  chests: [{ id: 'c4fi-1', x: 33, y: 3, give: { buttons: 320, 'jade-elixir': 1 } }],
  onEnter: 'c4.field.enter',
  update(ex, dt) {
    // the giant fades while Bramble or Rumble is behind him, so the sneak (and the gaze cone) stays visible
    const shp = ex.map.actors.find(a => a.id === 'shepherd');
    if (shp) {
      const behind = [ex.b, ...(ex.followers || [])].some(a => a && a.x + a.y < SHEP.x + SHEP.y && Math.abs((a.x - a.y) - (SHEP.x - SHEP.y)) <= 4);
      const want = behind ? 0.4 : 1; shp.alpha = (shp.alpha === undefined ? 1 : shp.alpha) + (want - (shp.alpha === undefined ? 1 : shp.alpha)) * Math.min(1, dt * 6);
    }
    if (!gazeOn() || ex.busy || ex.leaving || G.paused || G.scenes[G.scenes.length - 1] !== ex) return;   // he only turns while you play
    const before = ex._gz || 0;
    ex._gz = before + dt;
    const d0 = Math.floor(before / TURN) % 4, d1 = Math.floor(ex._gz / TURN) % 4;
    if (d0 === d1 && (before % TURN) < TURN - 0.5 && (ex._gz % TURN) >= TURN - 0.5) audio.sfx('bridge-creak', { vol: 0.25, pitch: 0.6 });
    const sh = ex.map.actors.find(a => a.id === 'shepherd'); if (sh) sh.facing = DIRNAME[d1];
    if (d0 !== d1 && exposed(ex)) caught(ex);
  },
  onHop(ex, x, y) {
    if (!gazeOn()) return;
    const t = ex.tile(x, y);
    if (t && t.cover) ex._check = { x, y };
    if (exposed(ex)) caught(ex);
  },
  gazeState(ex) {
    const gz = ex._gz || 0;
    return { on: gazeOn(), dir: gazeDir(ex), facing: DIRNAME[gazeDir(ex)], next: +(TURN - (gz % TURN)).toFixed(2), check: ex._check || null };
  },
  drawGround(ex, c, ox, oy) {
    const dia = (x, y, col) => { const s = toScreen(x, y, ex.hAt(x, y)), px = s.x + ox, py = s.y + oy; c.fillStyle = col; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 16, py + 8); c.lineTo(px, py + 16); c.lineTo(px - 16, py + 8); c.closePath(); c.fill(); };
    // the mushrooms' shade
    for (let y = 0; y < FI.h; y++) for (let x = 0; x < FI.w; x++) { const t = ex.tile(x, y); if (t && t.cover) dia(x, y, 'rgba(10,20,10,0.32)'); }
    if (!gazeOn()) return;
    const dir = gazeDir(ex);
    const warn = (TURN - ((ex._gz || 0) % TURN)) < 0.5;
    const a = warn ? 0.18 + 0.12 * Math.sin(G.time * 30) : 0.3;
    for (let y = 0; y < FI.h; y++) for (let x = 0; x < FI.w; x++) {
      if (!inCone(dir, x, y) || !ex.tile(x, y)) continue;
      dia(x, y, ex.tile(x, y).cover ? 'rgba(200,230,255,0.07)' : `rgba(205,232,255,${a})`);
    }
  },
};
function gazeDir(ex) { const e = ex || (G.scenes || []).find(s => s.kind === 'explore'); return Math.floor(((e && e._gz) || 0) / TURN) % 4; }
function exposed(ex) {
  const dir = gazeDir(ex);
  const bad = (x, y) => { const t = ex.tile(x, y); return inCone(dir, x, y) && !(t && t.cover); };
  if (bad(ex.b.x, ex.b.y)) return true;
  const r = ex.followers.find(f => f.id === 'rumble');
  return !!(r && bad(r.x, r.y));
}
function caught(ex) {
  if (ex._catching) return;
  ex._catching = true;
  ex.path = null;
  ex.queueScript(async s => {
    s.sfx('shepherd-hum', { vol: 0.8 });
    await s.fadeOut(0.5);
    const n = (s.val('c4_caught') || 0) + 1; s.set('c4_caught', n);
    const cp = ex._check || { x: 1, y: 13 };
    s.place('bramble', cp.x, cp.y, 'se');
    for (const f of ex.followers) { f.x = cp.x; f.y = cp.y; f.hop = null; f.hopT = -1; }
    ex.trail = [];
    await s.fadeIn(0.5);
    ex._catching = false;
    if (n === 1) {
      await s.narrate('The shepherd\'s eyes pass over Bramble like cold water. Everything goes grey and slow, and hums...');
      await s.narrate('...and Bramble is back under the last mushroom, his heart going like a drum, with Rumble pressed against his side.');
      if (s.escorting('rumble')) await s.say('rumble', 'Hrrm. Scary. Hide. Hide better.');
    } else s.toast('Seen! Back to the last mushroom.');
  });
}

// ---------------------------------------------------------------- scripts
export const SCRIPTS = {
  'c4.mushrooms.enter': async (s) => {
    s.set('c4_reached_mushrooms');
    if (!s.flag('c4_seen_mushrooms')) {
      s.set('c4_seen_mushrooms');
      await s.wait(0.3);
      await s.narrate('A forest. But the trees are mushrooms: pale, tall as oaks, their caps spread like roofs against the glowing cloud.');
      await chime(s, { pip: 'They\'re MUSHROOMS. They\'re as big as the Great Burrow! Can we eat one? Just the edge?', caterpillar: 'Finally. Somebody down here understands mushrooms.', mole: 'Oh my. If only I\'d had one of these at Mole End. Think of the shade.', _: 'The forest smells of rain and bread.' });
      await chime(s, { 'captain-quarry': 'Quiet in here. The good sort of quiet.', 'jade-rabbit': 'They glow, a little. Like the cassia tree at night.', toad: 'I could build a house in one! A mushroom hall! Toad Mushroom!', burdock: 'Hmph. Mushrooms. Big ones.' });
      s.quest('Find the way on, through the mushroom forest.');
      s.save();
    } else s.ex.enterBubble();
  },
  'c4.glade': async (s) => {
    await s.narrate('A clearing ringed by the biggest mushrooms of all. The ground is soft, and someone flops down, and then everyone does.');
    await s.narrate('They lie on their backs, ears out, and look up at the gills of the caps, ribbed and pale and glowing, high as a sky.');
    await chime(s, { pip: 'If you look long enough, it\'s like they\'re looking back. In a nice way.', ninefold: 'I have never lain down on purpose before. I recommend it.', 'tin-woodman': 'I cannot lie down without rusting. I shall sit. Sitting is very nearly as good.', _: 'Nobody says anything for a while.' });
    await chime(s, { 'captain-quarry': 'I haven\'t looked UP in a year. I forgot there was an up.', tansy: 'Remember the dandelion clocks on Sorrel Down? Lying in the grass, blowing them? This is like that. Bigger.', badger: 'Hmph. Five minutes. Then we go on.', mole: 'I could stay forever. Well. Five minutes. But a very good five minutes.' });
    await s.say('bramble', 'When this is over, I\'m going to tell everyone at home about this.', { mood: 'happy' });
    s.remember('mem-mushrooms');
    s.toast('A memory to keep: the giant mushrooms.');
  },
  'c4.bones': async (s) => {
    await s.narrate('The forest ends. Beyond it the ground is white and ridged: bones. Old, old bones, bigger than anything alive, half sunk in the earth.');
    await chime(s, { 'tin-woodman': 'Poor things. But they have been resting a very long time. I think they would not mind us passing, if we are quiet.', toad: 'I am NOT frightened of bones. Bones are just... Toad\'s insides. Everyone\'s insides. Let\'s go faster.', 'cheshire-cat': 'Don\'t mind them. They\'re only the leftovers of very large dinners. Not ours.', pip: 'Whose are they? Were they big? Were they nice?', _: 'Nobody hurries, and nobody dawdles.' });
  },
  'c4.rumble.hear': async (s) => {
    s.sfx('alert-horn', { pitch: 1.6, vol: 0.5 });
    await s.narrate('A sound. High, wobbly, sad: like a trumpet blown by somebody who has been crying.');
    await s.say('bramble', 'Somebody\'s lost.');
    s.quest('Find whoever is crying among the bones.');
  },
  'c4.field-locked': async (s) => {
    await s.narrate('Somebody is crying, out among the bones: a high, sad, wobbly trumpeting. Bramble can\'t just walk past that.');
    s.quest('Find whoever is crying among the bones.');
  },
  'c4.rumble.find': async (s) => {
    if (s.flag('c4_rumble_met')) return;
    s.face('rumble', { x: s.b.x, y: s.b.y });
    await s.narrate('Huddled against a great curved bone is a calf: woolly, red-brown, with stubby tusks and a trunk he keeps wrapping round himself.');
    await s.narrate('He is enormous. He is also very, very small, and he is shaking.');
    await s.say('rumble', 'HRRMP! Go \'way! Big. I\'m big. Scary.');
    const c = await s.ask('bramble', 'Bramble sits down, just out of reach of the trunk.', ['You don\'t look scary. You look lost.', 'I\'m Bramble. I\'m lost a bit too.']);
    if (c === 0) await s.say('rumble', '...Lost. Yes. Lost-lost. Mama gone. Herd gone. Big man look, I run, I run, then... bones.');
    else await s.say('rumble', 'Bram-ble. Bramble. Small. You small AND lost? Hrrm. Sit with me.');
    await chime(s, { 'tin-woodman': 'Oh, the poor little fellow. Oh dear, I shall rust. Somebody hold my oil-can.', pip: 'He\'s just a kit! A really, really, REALLY big kit!', 'jade-rabbit': 'Hush, little one. We will find your mother. We are good at finding people.', tansy: 'I know that look. Bramble wore it for a whole week when I was taken. Come here, big lump.', _: 'He leans, very carefully, against Bramble. Bramble very nearly falls over.' });
    await s.say('rumble', 'Herd is that way. Past big man. Big man... looks. Always looks. Round and round. If he sees, everything goes hummy.');
    await s.say('bramble', 'Then we won\'t let him see. We\'ll go together, mushroom to mushroom. Stay right behind me.');
    await s.say('rumble', 'Behind Bramble. Yes. HRRMP!', {});
    s.emote('rumble', 'heart');
    s.set('c4_rumble_met');
    s.remove('rumble');
    s.escort('rumble', true, { sprite: 'rumble' });
    s.quest('Lead Rumble back to his herd, past the giant shepherd. Hide in the mushrooms\' shade when he looks your way.');
    s.save();
  },
  'c4.field.enter': async (s) => {
    s.ex._gz = 0; s.ex._check = { x: 1, y: 13 }; s.ex._catching = false;
    if (!s.flag('c4_seen_field')) {
      s.set('c4_seen_field');
      await s.wait(0.3);
      await s.narrate('A wide field of soft grey grass, very still. In the middle, on a heap of stones, stands a man.');
      await s.narrate('He is twice as tall as a tree, and wrapped in hide, and he leans on a staff like a whole trunk. He does not move. Only his head turns.');
      await s.narrate('Slowly. Round and round. Looking.');
      s.sfx('shepherd-hum', { vol: 0.5 });
      if (s.escorting('rumble')) await s.say('rumble', 'Big man. Herd-keeper. Don\'t let him look at you. Hide in the mushroom shade.');
      await s.narrate('(Watch which way he faces: the pale patch on the ground is where he is looking. In the shade under the tall mushrooms, you can\'t be seen.)');
    } else s.ex.enterBubble();
  },
  'c4.shepherd': async (s) => {
    if (herdDone()) {
      await s.narrate('The shepherd has sat down on his stones, his staff across his knees. He is watching the herd. He hums, very low, a tune with no end.');
      await s.narrate('Once, just once, he looks at Bramble. Then he nods, slowly, like a hill nodding, and looks away.');
      return;
    }
    await s.narrate('He is too far up, and too strange, to talk to. And he is looking.');
  },
  'c4.mastodon': async (s, a) => {
    if (!herdDone()) { await s.narrate('A great woolly mastodon, grazing. It rumbles to itself, a sound you feel in your paws more than hear.'); return; }
    const lines = ['The mastodon lowers its huge head and sniffs Bramble all over, very gently. Then it huffs warm air in his face. Thank you, that means.', 'A big old cow mastodon, Rumble\'s aunt maybe, curls her trunk round Bramble\'s ears like a scarf, and lets go.', 'The bull mastodon looks at Bramble for a long time. Then he steps aside, out of the way, which for him is a very big gesture.', 'This one is eating. It keeps eating. It is not interested in rabbits. That is fine.'];
    const i = Math.max(0, ['mast-1', 'mast-2', 'mast-3', 'mast-4'].indexOf(a && a.id));
    await s.narrate(lines[i]);
  },
  'c4.herd': async (s) => {
    s.set('c4_herd_done');
    s.escort('rumble', false);
    s.spawn({ id: 'rumble-scene', sprite: 'rumble', x: s.b.x, y: s.b.y, facing: 'ne' });
    await s.say('rumble', 'MAMA!! HRRRRMMMP!!');
    s.sfx('alert-horn', { pitch: 1.2 });
    await s.move('rumble-scene', [[26, 12], [27, 11], [28, 10], [28, 9], [28, 8], [29, 8]], 0.26);
    s.face('mast-3', 'se');
    await s.narrate('The biggest of the mastodons turns, slowly, like a hill turning. Then she lifts her trunk and roars a roar that shakes the bones in the ground.');
    s.shake(0.8, 3);
    await s.narrate('Rumble barrels into her legs. She wraps her trunk round him and holds on, and the whole herd trumpets, all together, all at once.');
    await chime(s, { 'tin-woodman': 'Oh! Oh, I am quite rusted through. I don\'t mind at all.', pip: 'He found his mum! He FOUND her!', tansy: 'Hmph. Dust in my eye. Shut up, all of you.', 'captain-quarry': 'Hmph. That. That\'s what it\'s for. All of it.', _: 'Nobody says anything. Nobody has to.' });
    await s.wait(0.6);
    await s.narrate('Behind them, on his heap of stones, the shepherd has stopped turning. He is looking at the herd. Then, very slowly, he sits down.');
    s.sfx('shepherd-hum', { vol: 0.4 });
    await s.wait(0.6);
    await s.move('rumble-scene', [[28, 9], [28, 10], [27, 11], [26, 12], [26, 13]], 0.26);
    s.face('rumble-scene', { x: s.b.x, y: s.b.y });
    await s.say('rumble', 'Bramble. Herd is home. Mama is home. Rumble is home.');
    await s.say('rumble', 'But Bramble is not home. Bramble going DOWN. Into the dark. Where the bad sound comes from.');
    const c = await s.ask('bramble', 'Rumble looks at the dark beyond the meadow, then at Bramble.', ['You should stay with your mother.', 'We could use somebody big.']);
    if (c === 0) await s.say('rumble', 'Mama says: friend who brings you home, you walk them home too. Mama is very big. Mama is right.');
    else await s.say('rumble', 'I am VERY big. Biggest small one. HRRMP!');
    await s.say('rumble', 'Rumble comes. And herd comes behind Rumble. Herd is slow. But herd always comes.');
    s.remove('rumble-scene');
    await s.recruit('rumble', { line: 'HRRMP! Rumble comes!', level: 24 });
    { const t = travelling().filter(id => id !== 'bramble' && id !== 'rumble'); setActive(['rumble', t[0]].filter(Boolean)); s.ex.buildFollowers(true); }
    await s.narrate('Rumble\'s herd will march with the army. Rumble walks with Bramble.');
    s.quest('A fallen rock blocks the tunnel at the end of the meadow. Look at it.');
    s.save();
  },
  'c4.rock': async (s) => {
    if (s.flag('c4_rock_cleared')) return;
    if (!s.flag('g_recruit_rumble')) { await s.narrate('A great slab of fallen rock blocks a tunnel mouth. Warm air leaks round its edges, from somewhere far below. It won\'t budge.'); return; }
    await s.narrate('A great slab of fallen rock, wedged in a tunnel mouth. Warm air breathes round its edges, from somewhere much further down.');
    s.spawn({ id: 'quarry-scene', sprite: 'captain-quarry', x: 29, y: 18, facing: 'se' });
    s.spawn({ id: 'rumble-dig', sprite: 'rumble', x: 29, y: 21, facing: 'ne' });
    await s.say('captain-quarry', 'Hmph. Bad fall. Old. The rock\'s split along the grain, see? There and there.');
    await s.say('captain-quarry', 'I can dig under it. But I can\'t lift it. Not on my own.');
    await s.say('rumble', 'Rumble can lift. Rumble can PUSH. Tell Rumble where.');
    await s.say('captain-quarry', 'There, lad. When I say. ...Ha. Like old times. Somebody shouting, and everybody digging.');
    await s.fadeOut(0.5);
    s.sfx('rumble'); s.shake(1.4, 4);
    await s.wait(0.6);
    s.sfx('bridge-crash');
    await s.wait(0.4);
    s.set('c4_rock_cleared');
    s.ex.map.props = s.ex.map.props.filter(p => p.id !== 'prop-fallen-rock');
    await s.fadeIn(0.5);
    await s.narrate('Quarry digs, Rumble shoves, the slab tips, and slides, and goes rumbling away down the tunnel in a cloud of dust. The way is open.');
    await s.say('rumble', 'HRRMP! Rock gone!');
    await s.say('captain-quarry', 'Good lad. GOOD lad. That\'s the first hole I\'ve dug in a year that I\'m glad of.');
    await chime(s, { tansy: 'You two make a terrifying team.', pip: 'Can I push the next rock? A little one?', 'jade-rabbit': 'Well done, both of you. Now: slowly. That air is old.', _: 'Warm air sighs up out of the tunnel.' });
    s.remove('quarry-scene'); s.remove('rumble-dig');
    s.quest('Go down the tunnel behind the fallen rock, to the Root of the World.');
    s.save();
  },
};

const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export const ENCOUNTERS = {
  'c4.mu-1': { enemies: [['cave-lizard', 24, 2], ['trilobite-swarm', 24, 1], ['eel-cloud', 24]], bg: 'mushroom', tweak: hardy(1.6) },
  'c4.mu-3': { enemies: [['eel-cloud', 24, 2], ['cave-lizard', 24, 1], ['cave-lizard', 24, 1]], bg: 'mushroom', tweak: hardy(1.6) },
  'c4.mu-4': { enemies: [['cave-lizard', 25, 2], ['trilobite-swarm', 24, 1], ['eel-cloud', 24, 1], ['trilobite-swarm', 24]], bg: 'mushroom', tweak: hardy(1.25) },
};

export const MAPS = { 'c4-mushrooms': mushroomsMap, 'c4-field': fieldMap };
