// The Prologue's story scripts: the intro, the morning, the warren, the attack, the first battle,
// the Lookout Stone, the Old Key, the sealed door, and the closed edge roads.
import { G, pushScene } from '../../core.js';
import { flag, setFlag, addMember, member, stats, skillsOf, hasMember } from '../../state.js';
import { findPath } from '../../engine/path.js';
import { input } from '../../engine/input.js';
import { padWords } from '../../engine/pad.js';
import { audio } from '../../engine/audio.js';
import { PictureScene } from '../../screens/picture.js';
import { makeAlly } from '../../battle/sim.js';
import { imageReady, spritePath } from '../../engine/assets.js';
import { attacked } from './maps.js';

// ---------------------------------------------------------------- helpers
function pathFor(s, a, x, y) {
  const ex = s.ex;
  return findPath(a.x, a.y, x, y, (fx, fy, tx, ty) => ex.walkable(tx, ty, true) && Math.abs(ex.hAt(tx, ty) - ex.hAt(fx, fy)) <= 1, (px, py) => ex.hAt(px, py), 3000) || [];
}
export async function go(s, id, x, y, dur = 0.2) {
  const a = s.actor(id); if (!a) return;
  const p = pathFor(s, a, x, y);
  await s.move(id, p.map(n => [n.x, n.y]), dur);
}
const all = (...ps) => Promise.all(ps);
function emoteAll(s, e, secs = 1.6) {
  for (const a of s.ex.map.actors) { if (a.hidden) continue; a.emote = e; setTimeout(() => { if (a.emote === e) a.emote = null; }, secs * 1000); }
}
// three skippable intro cards: Escape on any of them skips the rest
async function pictures(s, cards) {
  let skip = false;
  for (const [bg, lines] of cards) {
    if (skip) break;
    await new Promise(r => {
      const sc = new PictureScene(bg, lines, r, { skippable: true });
      const up = sc.update.bind(sc); sc.update = dt => { if (input.back()) skip = true; up(dt); };
      pushScene(sc);
    });
  }
}

// ---------------------------------------------------------------- quest lines
export function morningQuest() {
  if (!flag('c0_tansy') && !flag('c0_pip_asked')) return 'Say good morning: Tansy is in the meadow, and Pip is sniffling by the hollow log.';
  if (flag('c0_pip_asked') && !flag('c0_button') && !flag('c0_pip_done')) return 'Find Pip\'s button in the hollow log (face the log and press {act}).';
  if (flag('c0_button') && !flag('c0_pip_done')) return 'Take the shiny button back to Pip.';
  if (!flag('c0_pip_asked')) return 'Pip is sniffling by the hollow log, west of the meadow. See what\'s wrong.';
  if (!flag('c0_tansy')) return 'Tansy is waiting for you in the meadow.';
  return 'Race Tansy to the warren mouth, just north of the meadow, and hop down inside.';
}
export function warrenQuest() {
  if (attacked()) return attackQuest();
  if (flag('c0_yarrow_asked')) return 'Pick sweetgrass for Old Yarrow: it grows beside the warren mouth, up on the down.';
  if (!flag('c0_rhyme')) return 'Hear Woodruff\'s story in the Great Burrow, then find Old Yarrow in his den.';
  return 'Find Old Yarrow in his den, through the tunnel south of the Great Burrow.';
}
export function attackQuest() {
  if (flag('g_ch0_done')) return flag('c0_door_open') ? 'Find friends below the sealed door.' : 'Open the old sealed door at the end of the deep passage, below the root cellar.';
  if (!flag('c0_burdock')) return 'Raiders at the warren mouth! Stand your ground.';
  if (!flag('c0_guided')) return 'Climb the hill east of the warren mouth to the Lookout Stone and see what\'s left.';
  return 'Find Old Yarrow in the wrecked Great Burrow.';
}

// ---------------------------------------------------------------- the intro (New Game)
async function startScript(s) {
  await pictures(s, [
    ['bg-intro-1', ['Under the green downs, the rabbits of Thimblebank Warren dig, and nibble, and tell each other stories.', 'Their oldest story is a nursery rhyme about a sleeper under the hills. Nobody believes it any more.']],
    ['bg-intro-2', ['Lately the ground has been rumbling.', 'Far to the east, Flintcomb Warren has been digging deeper than any warren should.']],
    ['bg-intro-3', ['This is Bramble. His left ear flops, his feet are a size too big, and he is about to have the strangest year of his life.']],
  ]);
  setFlag('c0_intro');
  await s.wait(0.3);
  s.emote('bramble', '!', 1.2);
  await s.say('bramble', 'Morning, Sorrel Down! Smells like clover and... more clover.', { mood: 'happy' });
  await s.narrate(input.device === 'pad' ? padWords('The stick or the d-pad hops. {cross} talks. {square} nibbles clover. {triangle} opens the camp menu.')
    : 'Arrow keys or WASD hop. Click a tile to hop there. Space talks. N nibbles clover. Tab opens the camp menu.');
  s.quest(morningQuest());
}

// ---------------------------------------------------------------- Tansy
async function tansy(s, a) {
  if (attacked()) return;
  if (!flag('c0_tansy')) {
    await s.say('tansy', 'Morning, slowcoach! Your ear\'s flopping again. Did you sleep on it, or did it just give up?');
    const c = await s.ask('bramble', '', ['It flops with dignity.', 'At least I don\'t snore like a badger.']);
    if (c === 0) await s.say('tansy', 'Dignity! Ha! The only dignified thing about you is your feet, and that\'s because they\'re enormous.');
    else await s.say('tansy', 'I do NOT snore. I breathe enthusiastically. There\'s a difference.');
    await s.say('tansy', 'I\'ve been up since the lark. Already nibbled the best clover on the whole down. You\'re welcome.');
    await s.say('tansy', 'Oh, and Pip\'s crying by the hollow log again. Lost something, I bet. You\'re good at finding things.');
    await s.say('tansy', 'Sort Pip out, then race me to the warren mouth! Loser tells Old Yarrow his beard looks like a dandelion clock.');
    s.set('c0_tansy');
    await go(s, 'tansy', 21, 21, 0.16);
    s.face('tansy', 'nw');
    s.quest(morningQuest());
    return;
  }
  if (!flag('c0_race')) {
    if (!flag('c0_pip_done')) await s.say('tansy', 'Help Pip first. I\'m patient. Ish. My paws are getting cold, mind.');
    else await s.say('tansy', 'Well? The warren mouth\'s right there, slowcoach. First paw down the tunnel wins!');
    return;
  }
  // in the Great Burrow, before the attack
  if (!flag('c0_rhyme')) { await s.say('tansy', 'Shh! Woodruff\'s about to start. The kits have been thumping for it all morning.'); await s.say('tansy', 'Go and sit down. And don\'t you dare fall asleep in the good bit like last time.'); return; }
  if (!flag('c0_yarrow_asked')) {
    await s.say('tansy', 'Did you feel the rumble earlier? Mum says it\'s just the chalk settling.');
    await s.say('tansy', 'Chalk doesn\'t settle, Bramble. It\'s chalk. It\'s been sitting there since before rabbits.');
    await s.say('tansy', 'Old Yarrow was asking for you. His den\'s through the south tunnel. Mind his toes, he can\'t see them.');
    return;
  }
  await s.say('tansy', 'Sweetgrass for Yarrow? Get the stuff by the mouth, it\'s sweetest. And bring me some. I\'ll owe you.');
  await s.say('tansy', 'I won\'t actually owe you. But it\'s nice to say.');
}

// ---------------------------------------------------------------- Pip and the hollow log
async function pip(s) {
  // later chapters may give Pip fresh lines (home.pip.chN), newest first
  for (let n = 5; n >= 1; n--) { const f = G.data.scripts[`home.pip.ch${n}`]; if (f && flag(`g_ch${n - 1}_done`)) { await f(s); return; } }
  if (attacked()) {
    if (!flag('g_ch0_done')) {
      await s.say('pip', 'I hid in the nest. Under Bryony. She sat on me the whole time. It was very warm and very scary.');
      await s.say('pip', 'Is Tansy coming back? Tansy always comes back. She came back from the badger sett that time.');
      const c = await s.ask('bramble', '', ['I\'ll bring her back. Promise.', 'I don\'t know, Pip.']);
      if (c === 0) await s.say('pip', 'Promise promise? With a thump?');
      else await s.say('pip', 'That\'s all right. I don\'t know lots of things. I still ask about them.');
      return;
    }
    await s.say('pip', 'Yarrow says I have to practise listening to the ground. I\'m listening. It\'s very quiet.');
    await s.say('pip', 'Is quiet good? Or is quiet the ground holding its breath? Bramble, can the ground hold its breath?');
    return;
  }
  if (!flag('c0_pip_asked')) {
    await s.say('pip', 'Bramble! I lost my button. My shiny one, with the little anchor on it.');
    await s.say('pip', 'It rolled into the hollow log. And there might be a beetle in there. A big one. With opinions.');
    const c = await s.ask('bramble', '', ['I\'ll get it for you.', 'A beetle with opinions?']);
    if (c === 1) await s.say('pip', 'They ALL have opinions! Mostly about you not being in their log.');
    await s.say('pip', 'Will you look? Just stand by the log and have a rummage. Please?');
    s.set('c0_pip_asked'); s.quest(morningQuest());
    return;
  }
  if (!flag('c0_pip_done')) {
    if (!s.has('pips-button')) { await s.say('pip', 'It\'s in the log. Probably. Or the beetle\'s wearing it as a hat.'); return; }
    s.take('pips-button');
    s.emote('pip', 'heart', 1.6);
    await s.say('pip', 'My button! You found it! It\'s even shinier than before. Did the beetle polish it?');
    await s.say('bramble', 'There was a whole hoard in there. Old buttons, all sorts.');
    await s.say('pip', 'Then the beetle\'s very rich. Keep them, he won\'t mind. Probably. Here, have my clover too.');
    await s.give({ 'clover-bunch': 1 });
    s.set('c0_pip_done');
    await s.say('pip', 'Mallow trades buttons for things, down in the warren. You could buy a whole waistcoat! Or a quarter of one.');
    s.quest(morningQuest());
    return;
  }
  if (!flag('c0_tremor')) { await s.say('pip', 'Why do the hills rumble at night? Is it a giant? Is it hungry? Does it like buttons?'); return; }
  await s.say('pip', 'Did you feel THAT? The whole down went hmmmm. Like a big cat purring. A big cat under the ground.');
  await s.say('pip', 'Woodruff says there\'s a sleeper under the hills. I asked if it snores and everyone went quiet.');
}
async function log(s) {
  if (flag('c0_button') || s.has('pips-button')) { await s.say(null, 'The hollow log. Something inside rustles, rather offended.'); return; }
  if (!flag('c0_pip_asked')) { await s.say(null, 'An old hollow log, soft with moss. It smells of beetles and secrets.'); return; }
  await s.say(null, 'Bramble pokes his head into the log. It\'s dark, and smells of beetle.');
  s.sfx('scamper', { vol: 0.5 });
  await s.say(null, 'Something with a great many legs scuttles off, grumbling. And there, in the dust: a glint of brass.');
  s.set('c0_button');
  await s.give({ 'pips-button': 1, buttons: 25 });
  await s.say('bramble', 'Pip\'s button! And somebody\'s been keeping a hoard in here.', { mood: 'happy' });
  s.quest(morningQuest());
}

// ---------------------------------------------------------------- the morning tremor
async function tremor(s) {
  if (flag('c0_tremor')) return;
  s.set('c0_tremor');
  s.sfx('rumble', { vol: 0.9 }); s.shake(1.6, 3);
  for (const a of [s.ex.b, ...s.ex.map.actors]) s.ex.puff(a);
  for (const a of s.ex.map.actors) a.facing = 'ne';
  emoteAll(s, '!', 2.2); s.emote('bramble', '!', 2.2);
  await s.wait(1.8);
  await s.narrate('A deep rumble rolls under the down. Dust puffs up from the chalk, and every rabbit sits bolt upright, ears high.');
  await s.say('bramble', 'The ground just... hummed?', { mood: 'worried' });
  await s.narrate('Nothing else happens. A lark goes on singing, as if it hadn\'t noticed.');
  s.quest(morningQuest());
}

// ---------------------------------------------------------------- the warren mouth
async function mouthLocked(s) {
  if (!flag('c0_tansy')) { await s.say('bramble', 'Tansy\'s waving at me from the meadow. I\'d better say good morning first, or I\'ll never hear the end of it.'); return; }
  await s.say('bramble', 'Pip\'s still sniffling by the hollow log. I can\'t just leave him like that.');
}
async function mouthDoor(s) {
  if (!flag('c0_tremor') && !attacked()) await tremor(s);
  if (!flag('c0_race') && !attacked()) {
    const t = s.actor('tansy');
    if (t) {
      await s.say('tansy', 'Ready? Three, two... ONE!');
      s.sfx('scamper');
      await go(s, 'tansy', 19, 19, 0.12);
      s.hide('tansy');
      await s.say('tansy', '(from somewhere down the tunnel) Beat you by a whole ear, slowcoach!');
    }
    s.set('c0_race');
  }
  await s.warp('c0-warren', 'mouth');
}

// ---------------------------------------------------------------- map arrivals
async function downsEnter(s) {
  // once the sealed door is open the later chapters own the quest line: don't overwrite it on the way home
  if (flag('c0_door_open')) { /* keep */ }
  else if (flag('c0_yarrow_asked') && !attacked()) s.quest(warrenQuest());
  else if (attacked()) s.quest(attackQuest());
  s.ex.enterBubble();
}
async function warrenEnter(s) {
  if (!flag('c0_in_warren')) {
    s.set('c0_in_warren');
    await s.narrate('Thimblebank Warren. Cool earth, warm lanterns, and the smell of a hundred rabbits\' breakfasts.');
    await s.say('bramble', 'Home. The Great Burrow\'s just down this tunnel. Woodruff tells stories there every morning.', { mood: 'happy' });
    if (!flag('c0_door_open')) s.quest(warrenQuest());
  } else if (attacked() && !flag('c0_seen_wreck')) {
    s.set('c0_seen_wreck');
    await s.narrate('Chalk dust hangs in the air. Tunnels have slumped, lanterns lie snuffed in the dirt. The warren is very quiet.');
    if (s.party().includes('burdock')) await s.say('burdock', 'Hmph. Walls can be dug again. Rabbits can\'t. Let\'s find who\'s left.');
    if (!flag('c0_door_open')) s.quest(attackQuest());
  } else if (!flag('c0_door_open')) s.quest(attacked() ? attackQuest() : warrenQuest());
  s.ex.enterBubble();
}

// ---------------------------------------------------------------- the attack
async function attack(s) {
  if (attacked()) return;
  s.set('c0_attack');
  const b = s.ex.b;
  await s.say(null, 'Bramble nips off the sweetest, greenest stems, the way Yarrow likes them.');
  await s.give({ sweetgrass: 1 });
  s.music(null);
  await s.wait(0.6);
  for (let i = 0; i < 3; i++) {
    s.shake(0.9, 3 + i * 2); s.sfx('rumble', { vol: 0.6 + 0.2 * i });
    for (const a of [b, ...s.ex.map.actors]) s.ex.puff(a);
    if (i === 0) s.emote('bramble', '?', 1);
    if (i === 2) { emoteAll(s, '!', 2); s.emote('bramble', '!', 2); }
    await s.wait(1.2);
  }
  await s.say('bramble', 'That\'s not the chalk settling.', { mood: 'worried' });
  s.quest(attackQuest());   // the sweetgrass errand is over: the raid's quest line from here
  s.music('m-attack');
  s.sfx('warren-drum');
  await s.picture('bg-attack', [
    'Over the eastern hill they come: Flintcomb raiders, dozens of them, eyes pale and blank, all humming one low note.',
    'They don\'t shout. They don\'t look at anyone. They simply pour down the slope toward Thimblebank, like water finding a hole.',
  ]);
  // --- the scene on the map
  const bx = b.x, by = b.y;
  // the warren pours out to see
  const out = [['tansy', 'tansy', null], ['x-nettle', 'rabbit-buck', 'sandy'], ['x-sloe', 'rabbit-doe', 'silver'], ['x-rush', 'rabbit-buck', 'grey']];
  out.forEach(([id, sprite, fur], i) => s.spawn({ id, sprite, fur, x: 18 + (i % 2), y: 19, facing: 'se' }));
  s.sfx('scamper');
  await all(go(s, 'tansy', 20, 21), go(s, 'x-nettle', 17, 21), go(s, 'x-sloe', 21, 22), go(s, 'x-rush', 16, 20));
  await s.say('tansy', 'Bramble? What was that? Is the warren falling down?');
  // raiders from the east
  const R = [['r1', 33, 18], ['r2', 34, 20], ['r3', 33, 22], ['r4', 35, 19], ['r5', 35, 21], ['r6', 36, 23], ['r7', 36, 17], ['r8', 37, 21]];
  for (const [id, x, y] of R) s.spawn({ id, sprite: 'raider', hum: true, x, y, facing: 'nw' });
  s.ambience('hum', 0.5);
  for (const a of s.ex.map.actors) if (!a.id.startsWith('r')) a.facing = 'se';
  emoteAll(s, '!', 1.6);
  await s.wait(0.4);
  await all(go(s, 'r1', 26, 18), go(s, 'r2', 26, 21), go(s, 'r3', 27, 23), go(s, 'r4', 28, 19), go(s, 'r5', 28, 22), go(s, 'r6', 29, 24), go(s, 'r7', 29, 17), go(s, 'r8', 30, 21));
  await s.say('tansy', 'Raiders! RUN! Everybody, into the... no, they\'re going for the mouth!');
  // Hob and Penny scatter; the rest are caught between the raiders and the warren
  const hob = s.actor('home-2'), penny = s.actor('home-4');
  s.sfx('scamper');
  await all(
    hob ? go(s, 'home-2', 18, 19, 0.14).then(() => s.hide('home-2')) : null,
    penny ? go(s, 'home-4', 22, 34, 0.14).then(() => s.hide('home-4')) : null,
    go(s, 'r1', 21, 20, 0.16), go(s, 'r2', 21, 23, 0.16), go(s, 'r4', 19, 22, 0.16), go(s, 'r7', 17, 22, 0.16),
  );
  s.shake(0.6, 3); s.sfx('rumble', { vol: 0.7 });
  await s.narrate('The raiders hum louder. The tunnel roof behind the mouth gives way in a cloud of chalk dust.');
  // one raider shoulders Bramble aside without seeing him
  const r3 = s.actor('r3');
  await go(s, 'r3', bx + 1, by, 0.16);
  s.sfx('hit-1', { vol: 0.5 }); s.shake(0.25, 2);
  const side = s.ex.walkable(bx, by + 1, true) ? [bx, by + 1] : [bx - 1, by];
  await s.move('bramble', [side], 0.14);
  s.emote('bramble', '!', 1.4);
  if (r3) r3.facing = 'nw';
  await go(s, 'r3', bx, by, 0.16);
  await s.narrate('A raider shoulders straight past, not even looking. Its pale eyes slide over Bramble as if he were a stone.');
  await s.say('bramble', 'Hey! HEY! Can\'t you see me?', { mood: 'worried' });
  // herding: Tansy and five others are gathered up and walked off east
  const taken = ['tansy', 'x-nettle', 'x-sloe', 'x-rush', 'home-1', 'home-3'];
  await s.narrate('The raiders close round Tansy and the others like a slow tide. Nobody is struck. They are simply... gathered.');
  await s.say('tansy', 'Bramble! Tell Yarrow! Tell everyone! I\'ll... I\'ll leave you a sign!');
  const lanes = [[38, 19], [38, 20], [38, 21], [38, 22], [37, 20], [37, 21]];
  const guards = ['r1', 'r2', 'r4', 'r5', 'r6', 'r7', 'r8'];
  await all(...taken.map((id, i) => go(s, id, lanes[i][0], lanes[i][1], 0.22)), ...guards.map((id, i) => go(s, id, 36 - (i % 3), 18 + i, 0.22)));
  for (const id of [...taken, ...guards]) s.remove(id);
  s.ambience('hum', 0);
  await s.wait(0.5);
  s.face('bramble', 'se');
  await s.say('bramble', 'Tansy...', { mood: 'worried' });
  // two dazed raiders left behind
  s.spawn({ id: 'd1', sprite: 'raider', hum: true, x: s.ex.b.x + 2, y: s.ex.b.y, facing: 'nw' });
  s.spawn({ id: 'd2', sprite: 'raider', hum: true, x: s.ex.b.x + 2, y: s.ex.b.y + 1, facing: 'nw' });
  s.remove('r3');
  await s.narrate('Two raiders have stayed behind. They sway on the spot, humming, as if they\'ve forgotten which way to go. Then they turn toward Bramble.');
  const c = await s.ask('bramble', '', ['Give them back!', 'You\'ll have to go through me.']);
  await s.say('bramble', c === 0 ? 'Give them BACK!' : 'You\'re not taking anyone else.', { mood: 'worried' });
  await s.narrate('Battles: pick Tussle to scuffle, Skill for special moves (they cost Pluck), and Guard to brace. Knock a raider\'s Hum bar to nothing to snap them out of it.');
  imageReady(spritePath('battle', 'burdock')); imageReady(spritePath('battle', 'burdock-act'));
  await s.battle('c0.first-fight', { canLose: true });
  // --- Burdock
  s.remove('d1'); s.remove('d2');
  await s.narrate('The two raiders blink, shake their heads... and then the humming takes them again, and they lope away east, lost.');
  if (hasMember('burdock')) setFlag('g_recruit_burdock', false);
  await s.say('burdock', 'Hmph. Not bad, for a buck with one working ear.');
  await s.say('bramble', 'Burdock! Where did you come from?');
  await s.say('burdock', 'Under. Dug out of the cellar when the roof came down. Saw you squaring up to two of them on your own.');
  await s.say('burdock', 'Daft. Brave, but daft. So I\'m coming with you. Don\'t argue.');
  await s.recruit('burdock', { line: 'Hmph. Somebody has to keep you in one piece.' });
  setFlag('g_recruit_burdock'); setFlag('c0_burdock');
  await s.say('burdock', 'They took Tansy east. Before we chase anything, we see what\'s left. Lookout Stone. Up the hill.');
  s.quest(attackQuest());
  s.save();
  await s.warp('c0-downs', s.ex.b.x, s.ex.b.y, s.ex.b.facing, { noEnter: true });
}

// the first battle: Burdock barrels in at the start of round 2
export const firstFight = {
  enemies: [['raider', 2], ['raider', 2]], bg: 'downs', story: true, xp: 200, music: 'm-battle',
  intro: ['The raiders hum. Their eyes are pale as frost.'],
  tweak(enemies) { for (const e of enemies) { e.str = Math.max(3, Math.round(e.str * 0.55)); e.wit = Math.max(3, Math.round(e.wit * 0.5)); } },
  onRound(sim) {
    if (sim.round !== 2 || sim._burdock) return [];
    sim._burdock = true;
    if (!member('burdock')) addMember('burdock', 1);
    const m = member('burdock'); m.hp = stats('burdock').hp; m.pl = stats('burdock').pl;
    const u = makeAlly({ id: 'burdock', name: 'Burdock', lvl: m.lvl, hp: m.hp, pl: m.pl, stats: stats('burdock'), skills: skillsOf('burdock') }, 2);
    sim.party.push(u);
    return [{ t: 'say', text: 'A big shape bursts out of the bank in a shower of chalk: BURDOCK!' }, { t: 'swap', in: 2 }, { t: 'say', text: '"Hmph. Two on one? Make it two on two."' }];
  },
};

// ---------------------------------------------------------------- the Lookout Stone
const RTS_ORDER = [['c1-rts1', 'g_ch0_done'], ['c2-rts2', 'g_ch1_done'], ['c3-rts3', 'g_ch2_done'], ['c4-rts4', 'g_ch3_done']];
export async function lookoutStone(s) {
  // after the ending: fight any army battle again for the best time (no story, no flags: see rts/revisits.js)
  if (flag('g_won')) { await revisits(s); return; }
  if (!attacked()) {
    await s.say(null, 'The Lookout Stone: a tall white finger of chalk on the top of the down. From here you can see every warren\'s hill.');
    await s.say('bramble', 'North, Silverdown. West, Wheatsheaf. And east... Flintcomb. There\'s dust over Flintcomb again.');
    return;
  }
  if (!flag('c0_guided')) { await guided(s); return; }
  if (!flag('g_ch0_done')) {
    await s.say('burdock', 'Not now. Yarrow first. He\'ll be in the Great Burrow, if it\'s still standing.');
    return;
  }
  const next = RTS_ORDER.find(([id, open]) => G.data.rts[id] && !flag('g_' + id + '_won') && flag(open));
  if (!next) {
    const allWon = RTS_ORDER.every(([id]) => flag('g_' + id + '_won'));
    if (allWon && flag('g_ch4_done')) { await s.say(null, 'From the Lookout Stone, every warren\'s hill is quiet and green. Somewhere a lark is singing.'); return; }
    await s.say(null, 'From the Lookout Stone you can see raider camps on the far side of the down, their humming carried on the wind.');
    if (s.party().includes('burdock')) await s.say('burdock', 'Not enough of us yet. Find friends below the old door first. Then we come back up here.');
    return;
  }
  const id = next[0], D = G.data.rts[id];
  // a chapter may stage something first (a chapter card, a word from a friend): script "<id>.intro" (return false to stop)
  const intro = G.data.scripts[id + '.intro'];
  if (intro) { const r = await intro(s); if (r === false) return; }
  await s.say(null, `${D.name}. ${D.sub || ''}`);
  const c = await s.ask('bramble', 'Gather the army?', ['Gather the army', 'Not yet']);
  if (c !== 0) return;
  const res = await s.army(id);
  if (res === 'win') {
    s.set('g_' + id + '_won'); s.save();
    const won = G.data.scripts[id + '.won']; if (won) await won(s);
  } else if (res === 'lose') {
    const lines = ['"Not like this," Yarrow\'s voice seems to say. "Gather yourselves. Try again."', 'The army limps back to the Lookout Stone. Nobody is lost. Everyone is ready to try again.'];
    await s.say(null, lines[(G.s.losses[id] || 0) % 2]);
    if (s.party().includes('burdock')) await s.say('burdock', 'Hmph. Again, then. Think about who beats who. Diggers stop runners, fliers stop diggers, runners catch fliers.');
  }
}
// the post-game Lookout Stone: a menu of the won army battles; each run is s.army(id, { revisit: true }), which never runs
// <id>.intro / <id>.won and never sets g_<id>_won, so no story replays; the best time is saved after every run
async function revisits(s) {
  const { openRevisits, revisitList } = await import('../../rts/revisits.js');
  if (!revisitList().length) { await s.say(null, 'From the Lookout Stone, every warren\'s hill is quiet and green. Somewhere a lark is singing.'); return; }
  if (!flag('pg_revisits_seen')) {
    s.set('pg_revisits_seen');
    await s.narrate('Every battlefield on the downs is quiet now. The army could walk any of them again, just for the fun of it.');
    if (s.party().includes('burdock') || s.member('burdock')) await s.say('burdock', 'Hmph. I\'ve timed every one of them. Beat my time, if you can.');
  }
  for (;;) {
    const id = await openRevisits(); if (!id) return;
    const r = await s.army(id, { revisit: true });
    if (r === 'lose') await s.narrate('The army trots back up to the Lookout Stone, puffing. Nobody minds.');
    s.save();
  }
}
async function guided(s) {
  await s.narrate('From the Lookout Stone the whole down spreads out below. Raiders everywhere, humming in the grass, and six squads of them massing on the ridge.');
  await s.say('burdock', 'They\'ll come for the warren mouth next. Then the deep tunnels.');
  await s.narrate('What\'s left of Thimblebank gathers under the stone: diggers with chalk to the elbows, bucks with torn ears, does with their teeth set. They look at Bramble.');
  const c = await s.ask('bramble', '', ['We hold the hill!', 'Stay together. Follow me.']);
  await s.say('bramble', c === 0 ? 'We hold the hill. Nobody else gets taken today.' : 'Stay together. Follow me, and stay together.', { mood: 'worried' });
  await s.say('burdock', 'Hmph. Diggers, with me.');
  G._c0Voice = false;
  await s.army('c0-guided', { guided: true });
  s.set('c0_guided');
  if (!G._c0Voice) { s.voice('vo-notalone'); await s.say('yarrow', 'Not like this, Bramble. Not alone.'); }
  await s.narrate('The little army falls back to the warren mouth, everyone together, nobody left behind. The raiders don\'t follow. They just hum.');
  await s.say('bramble', 'That was Yarrow\'s voice. Clear as anything, right in my ear.', { mood: 'worried' });
  await s.say('burdock', 'He\'s an old rabbit with a big voice. Great Burrow. Come on.');
  s.quest(attackQuest()); s.save();
}
export const guidedRts = {
  name: 'The Lookout Stone', sub: 'Hold the hilltop. See what Thimblebank can do.',
  size: 20, cap: 2, world: 'downs', home: 'home', mouth: 'mouth', focus: 'hill',
  required: ['thimblebank-rabbits', 'thimblebank-diggers'],
  nodes: [
    { id: 'home', kind: 'home', x: 3, y: 16, owner: 'player' }, { id: 'hill', kind: 'hilltop', x: 7, y: 9 },
    { id: 'clover', kind: 'clover', x: 11, y: 14 }, { id: 'plain', kind: 'plain', x: 12, y: 6 }, { id: 'mouth', kind: 'warren', x: 16, y: 3, owner: 'enemy' },
  ],
  paths: [['home', 'hill'], ['home', 'clover'], ['hill', 'clover'], ['hill', 'plain'], ['clover', 'mouth'], ['plain', 'mouth']],
  enemy: {
    tier: 1.0, guards: [{ sq: 'diggers', node: 'mouth' }],
    waves: [{ at: 9, sq: ['raiders', 'raiders'], route: ['plain', 'hill', 'home'] }, { at: 13, sq: ['diggers', 'raiders'], route: ['clover', 'hill', 'home'] }, { at: 17, sq: ['diggers'], route: ['plain', 'hill', 'home'] }],
  },
  prompts: [
    { text: r => { const i = r.listSquads().findIndex(q => q.sq === 'thimblebank-rabbits'); return `Click your squad (or press ${i >= 0 ? i + 1 : 1}) to select it. Nothing moves until you give an order.`; },
      pad: 'Press {r1} to select your squad. Nothing moves until you give an order.', cond: r => r.sel.size > 0 || r.t - r.prompt.shownAt > 12 },
    { text: 'Right-click the hilltop (or press its letter, S) to send them there.', pad: 'Move the cursor to the hilltop (S) with the left stick or the d-pad, then press {cross} to send them there.', cond: r => r.S.squads.some(q => q.side === 'player' && (q.goal === 'hill' || q.at === 'hill')) || r.t - r.prompt.shownAt > 14 },
    { text: 'Arrow keys, the screen edge or the minimap (top right) look around the field. V jumps back home.', pad: 'The right stick looks around the field. Hold {r2} and press {l1} to jump back home.', wait: true },
    { text: 'Space pauses; you can still give orders while paused.', pad: '{create} pauses; you can still give orders while paused.', wait: true },
  ],
  update(rts) {
    const S = rts.S;
    const me = S.squads.find(q => q.side === 'player' && q.sq === 'thimblebank-rabbits');
    // S.t is battle time: the clock only starts with the first order, so reading the tips never eats into it
    if (!rts._retreat && (S.result || !me || me.worn || me.hp < me.maxHp / 2 || S.t >= 45 || S.holdT > 0)) {
      rts._retreat = rts.t; rts._res = S.result; S.result = null; rts.prompts = [];
      G._c0Voice = true; audio.voice('vo-notalone');
      rts.prompt = { text: 'Yarrow\'s voice, from somewhere far off: "Not like this, Bramble. Not alone."', shownAt: rts.t };
    }
    if (rts._retreat !== undefined) {
      rts.paused = true;
      if (rts.t - rts._retreat > 3) { rts.prompt = null; S.result = 'lose'; }
    }
  },
};

// ---------------------------------------------------------------- the sealed door
async function sealedDoor(s) {
  if (!attacked()) {
    if (!flag('c0_ear')) {
      await s.say(null, 'At the end of the deep passage stands the old sealed door: dark wood, iron bands, and a curling sign carved above it that nobody can read.');
      await s.say(null, 'Bramble presses one ear to the wood. The floppy one.');
      s.ambience('hum', 0.35);
      await s.wait(1.2);
      await s.say(null, 'Far, far below: a faint hum. Not a sound exactly. More like the feeling of a sound.');
      s.ambience('hum', 0);
      await s.say('bramble', 'Every kit dares every other kit to touch this door. Nobody ever says what\'s behind it.', { mood: 'worried' });
      s.set('c0_ear');
      return;
    }
    await s.say(null, 'The old sealed door. The hum is still there, just at the edge of hearing.');
    return;
  }
  if (!flag('g_ch0_done') || !s.has('old-key')) {
    await s.say(null, 'The old sealed door. The hum behind it is louder since the raid, like a held breath.');
    return;
  }
  if (!G.data.maps['c1-depths']) {
    s.sfx('key-turn');
    await s.say(null, 'The Old Key turns halfway... and sticks. The door is stuck fast. (The way below isn\'t ready yet.)');
    return;
  }
  if (!flag('c0_door_open')) {
    s.sfx('key-turn'); await s.wait(0.8);
    await s.say(null, 'The Old Key slides in as if it had never left. Click. Clunk.');
    s.sfx('door-grind'); s.shake(1.2, 2);
    await s.wait(1.2);
    await s.say(null, 'With a groan of old iron, the door that never opened... opens. Cool air breathes out of the dark, smelling of roots and stone.');
    if (s.party().includes('burdock')) await s.say('burdock', 'Hmph. Mind your ears. I\'m right behind you.');
    s.set('c0_door_open');
  } else s.sfx('door-grind', { vol: 0.6 });
  await s.warp('c1-depths', 'top');
}

// ---------------------------------------------------------------- the edge roads (closed until their warrens are free)
const edge = (dir, open, mapId) => async (s) => {
  const lines = {
    north: ['The north road climbs toward Silverdown, the pale-chalk warren where the rabbits keep pigeons.', 'Raider dust hangs over the north road. Silverdown\'s hill is quiet in a way hills shouldn\'t be.'],
    west: ['The west road runs down to Wheatsheaf, the farmland warren in the cornfields.', 'Wheatsheaf\'s corn stands tall and silent. Somewhere in it, something hums.'],
    east: ['The east road goes to Flintcomb, over the hard flinty downs.', 'East is Flintcomb. The humming comes from there, and the raiders, and the dust.'],
  }[dir];
  if (!flag(open)) {
    await s.say(null, attacked() ? lines[1] : lines[0]);
    if (!attacked()) await s.say('bramble', 'Yarrow says no young rabbit goes beyond the downs alone. And I promised Tansy a race.');
    else if (s.party().includes('burdock')) await s.say('burdock', dir === 'east' ? 'Not that way. Not yet. Not with two of us.' : 'Their raiders hold that road. We\'ll need an army first.');
    return;
  }
  await s.say(null, 'The road is washed out where it leaves the down. (Not yet.)');
};

// ---------------------------------------------------------------- small things
async function signpost(s) {
  await s.say(null, 'A weathered signpost. Its arms point north to Silverdown, west to Wheatsheaf, east to Flintcomb, and down to Thimblebank.');
  await s.say(null, 'Somebody has scratched a little rabbit on the Thimblebank arm. It looks a lot like Tansy\'s work.');
}
async function seat(s) {
  await s.say(null, 'Woodruff\'s storyteller seat, worn smooth by a hundred years of stories and a great many sitting-downs.');
}

// the rabbits nibbling about the down (maps.js DOWN_RABBITS)
const DOWN_LINES = {
  'dr-1': ['(munch munch) Penny says this is the best clover on the whole down. Penny says lots of things.', 'I counted all the clover heads in Penny\'s garden! Then I ate one and had to start again.'],
  'dr-2': ['Lovely morning for it. The dew\'s still on the clover, and that\'s when it\'s sweetest.', 'I never thought I\'d sit out here in the sun again, not after the humming. Sit a while, Bramble.'],
  'dr-3': ['Mind the gorse, young Bramble. It doesn\'t mind you.', 'From up here you can see all the way to Flintcomb. Quiet now. Good.'],
  'dr-4': ['Shh. There\'s a lark nesting just over there. Don\'t step on the buttercups.', 'The buttercups came back after the raid. Things do, if you let them.'],
  'dr-5': ['I climbed the Lookout hill all by myself! The top step is the hardest.', 'Yarrow says the Lookout Stone is older than the warren. I said it doesn\'t look a day over a hundred.'],
};
async function downsRabbit(s, a) {
  const L = DOWN_LINES[a && a.id] || DOWN_LINES['dr-2'];
  await s.say(a.sprite === 'rabbit-kit' ? 'kit' : a.sprite === 'rabbit-doe' ? 'doe' : 'buck', attacked() ? L[1] : L[0]);
}

export default {
  start: startScript,
  scripts: {
    'c0.tansy': tansy, 'c0.pip': pip, 'c0.log': log, 'c0.tremor': tremor, 'c0.mouth-door': mouthDoor, 'c0.mouth-locked': mouthLocked,
    'c0.downs.enter': downsEnter, 'c0.warren.enter': warrenEnter, 'c0.attack': attack, 'lookout.stone': lookoutStone,
    'c0.sealed-door': sealedDoor, 'c0.signpost': signpost, 'c0.seat': seat, 'c0.downs.rabbit': downsRabbit,
    'c0.edge-north': edge('north', 'g_ch2_open', 'c2-silverdown'), 'c0.edge-west': edge('west', 'g_ch3_open', 'c3-wheatsheaf'), 'c0.edge-east': edge('east', 'g_ch4_open', 'c4-flintcomb'),
  },
};
