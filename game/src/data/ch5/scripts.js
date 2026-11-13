// The Finale's scripts: the gathering, the Long Thump, the Dream, and the ending at sunset.
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { DEEP_CROWD } from './maps.js';
import { DEEP_LINES, LAST_LINES, DEEP_DEFAULT } from './people.js';
import { ensureMemories } from './memories.js';
import { slots, freeSlot, saveStateToSlot } from '../../engine/save.js';

// New Game+ (design/changes/ngplus.md): Woodruff offers to tell the story again. Called by c5.last (Woodruff at sunset),
// by his home lines after the ending, and by the epilogue's home Woodruff. The won game is first kept in a save slot
// (a free one, or one the player picks); the new game starts only after this script has finished (requestNgPlus).
async function ngOffer(s) {
  if (!s.flag('g_won')) return;
  const c = await s.ask('woodruff', 'Shall I tell it again? From the very start: the morning, the sweetgrass, the door.', ['Tell it again. (New Game+)', 'Not tonight.']);
  if (c !== 0) { await s.say('woodruff', 'Whenever you like. Stories keep.'); return; }
  await s.say('woodruff', 'Everyone keeps what they learned on the way. Only the story forgets. And the dreams down there will remember you: they\'ll be harder.');
  const b = G.s.party.members.bramble, won = JSON.parse(JSON.stringify(G.s));
  const ok = await s.ask(null, `Start New Game+? Bramble (Lv ${b ? b.lvl : 1}) and every friend keep their levels; the story, gear, items and buttons start again. The autosave moves to Load as "Previous autosave".`, ['Start New Game+.', 'Not yet.']);
  if (ok !== 0) return;
  let slot = freeSlot();
  if (slot < 0) {
    const sl = slots().slots;
    const k = await s.ask(null, 'All three save slots are full. Which one should keep your finished game? (It replaces what\'s there.)', [...sl.map((e, i) => `Slot ${i + 1}: ${e ? e.s.placeName || e.s.map : 'empty'}`), 'Not now.']);
    if (k >= 3) return;
    slot = k;
  }
  if (!saveStateToSlot(slot, won)) { await s.narrate('(Your finished game couldn\'t be kept: storage is full or blocked. New Game+ waits.)'); return; }
  await s.narrate(`(Your finished game is kept in Slot ${slot + 1}.)`);
  await s.say('woodruff', 'Once upon a time, under the downs...');
  const { requestNgPlus } = await import('../../screens/title.js');
  requestNgPlus(won);
}

// play a list of [speaker, line] pairs; '@' is the person being talked to
async function play(s, id, list) {
  for (const [who, text] of list || []) {
    if (who === null) await s.narrate(text);
    else await s.say(who === '@' ? id : who, text);
  }
}
// the first travelling companion who has a line in this table says it
async function companion(s, table, key) {
  for (const id of s.party()) {
    if (id === 'bramble') continue;
    const L = table[id] && table[id][key]; if (L) { await s.say(id, L); return id; }
  }
  return null;
}
const travellers = s => s.party().filter(id => id !== 'bramble');

// a staircase path of single-tile hops from (x0, y0) to (x1, y1)
function stairs(x0, y0, x1, y1) {
  const p = []; let x = x0, y = y0, i = 0;
  while (x !== x1 || y !== y1) { if ((i++ % 2 === 0 && x !== x1) || y === y1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); p.push([x, y]); }
  return p;
}

// ---------------------------------------------------------------- lines for the travelling companions
const DREAM = {
  burdock: { arrive: 'Hmph. Don\'t like it. Grass shouldn\'t be on the ceiling.', p1: 'Those were rabbits. All of them. Hmph.', p2: 'Dug its own hole and fell in it. Good riddance.', end: 'Hmph. Home, then. I\'ll dig you a nest.', eye: 'Stand behind me if it looks at you. I\'ll look back.' },
  mole: { arrive: 'Oh my! The hills are upside down! And my stomach agrees with them!', p1: 'Poor things. Poor, poor things. They only wanted to go home.', p2: 'It\'s getting warmer, isn\'t it? Or is that me?', end: 'Home! Oh, Bramble, home!', eye: 'Tell it about the river. Please. It needs to hear about the river.' },
  ratty: { arrive: 'A queer sort of place. Like a reflection in a puddle that\'s decided to stay.', p1: 'There. They\'re at peace now. You could see it go out of their shoulders.', p2: 'The dream\'s turning, Bramble. Like the tide.', end: 'Well. That\'s a story for the bank. A long one, with a good picnic after.', eye: 'Steady. Talk to it like you\'d talk to anyone who\'s had a bad night.' },
  badger: { arrive: 'Stay close. I don\'t know this wood, and I know every wood.', p1: 'That was well done. Gently done. That\'s the right way.', p2: 'Nearly there. Shoulders back, young one.', end: 'Now then. Supper.', eye: 'It\'s not a monster. It\'s a sleeper who can\'t get comfortable. I know the feeling.' },
  toad: { arrive: 'Upside down! Topsy-turvy! What a lark! I\'m not frightened in the least! ...Is anyone else frightened?', p1: 'Ha! Sent packing! Er. Sent gently to rest. With dignity. My dignity, mostly.', p2: 'Another one! Toad strikes again!', end: 'Poop-poop! Homeward! Someone tell them to start the feast without me. No, don\'t!', eye: 'Let ME tell it a story! I have several! All about Toad!' },
  'cheshire-cat': { arrive: 'Oh, I like it here. Everything is the wrong way round, which makes it the right way for me.', p1: 'Gone. Not like I go. Properly gone.', p2: 'Stranger and stranger. And then, curiously, less.', end: 'I\'ll see you at the party. Some of me, at least.', eye: 'It\'s mad, you know. Everyone is, when they\'re dreaming.' },
  caterpillar: { arrive: 'Hm. Upside down. I have been upside down. It is overrated.', p1: 'They have forgotten who they were. Now they need not worry about it.', p2: 'Change, it seems, can be agreeable.', end: 'Who are you now, Bramble? Hm. Yes. Better.', eye: 'Ask it who it is. Then tell it who you are.' },
  ninefold: { arrive: 'I know this kind of dark. It is my cousin\'s cousin\'s dark. It is not well.', p1: 'They thanked you. I heard it. Very quietly, in nine places.', p2: 'The dream is softening. I can feel it in my folds.', end: 'Up we go. To the surface. Where there are dandelions.', eye: 'It has never met anyone who did not scream. Like me, before you. Be gentle.' },
  'jade-rabbit': { arrive: 'Even here, the light flickers. Chang\'e was right. It is the Sleeper\'s dream.', p1: 'Rest now, little ones. The moon remembers you.', p2: 'The black sun is warming. Like the moon, when the clouds pass.', end: 'It sleeps. Truly sleeps. I will tell Chang\'e the light has stopped flickering.', eye: 'Give it a memory. Something you would give to a hungry traveller.' },
  tansy: { arrive: 'Sorrel Down. Upside down. That\'s just rude, is what that is.', p1: 'They looked like us, Bramble. Just... emptied out.', p2: 'Good riddance. I can\'t hear it any more. The Hum. Not a whisper.', end: 'Race you home? Upside down doesn\'t count.', eye: 'Tell it about the pebble. I want it to know I didn\'t forget who I was.' },
  pip: { arrive: 'Bramble, the sun is black! Is it supposed to be black? I don\'t like it black.', p1: 'Where did they go? Are they okay? I think they\'re okay.', p2: 'I can hear the ground again! It\'s singing a nice song now!', end: 'Can we go home? I want to tell Yarrow EVERYTHING.', eye: 'It\'s so big. Bramble, is it scared too?' },
  'tin-woodman': { arrive: 'Oh dear. A dream that hurts. I can feel it with my heart, and it is a very new heart.', p1: 'They were so sad. I have rusted my eyes, a little.', p2: 'Kinder. It is getting kinder. I can feel it ticking.', end: 'What a happy ending. Pass the oil can, someone.', eye: 'Be kind to it. I was a woodman, once. I was never sorry for being gentle.' },
  'captain-quarry': { arrive: 'This is where the Hum came from. I\'d know it anywhere. I sang it long enough.', p1: 'Deepdelve. They dug too deep, same as us. Nobody came for them.', p2: 'That was me. What I was. It\'s gone now. Truly gone.', end: 'I dug the hole. You walked us out of it. Let\'s go home.', eye: 'I woke it. Flintcomb did. Tell it we\'re sorry. Tell it we didn\'t know.' },
  rumble: { arrive: 'Sky is DOWN. Grass is UP. Rumble DIZZY.', p1: 'Sad shapes gone. Rumble glad. Rumble sad. Both.', p2: 'Big hummy rock GONE! Rumble stomp it extra, to be sure.', end: 'HOME! Rumble go home with Bramble!', eye: 'Big eye. Big sleepy. Rumble sing it to sleep? Rumble sing like herd.' },
};

// ---------------------------------------------------------------- the Sleeping Deep
async function gathering(s) {
  s.set('c5_gathered');
  const crowd = DEEP_CROWD.map(a => a.id).filter(id => s.actor(id));
  for (const id of [...crowd, 'yarrow']) s.hide(id);
  await s.chapterCard('The Sleeping Deep', 'The Finale', 'bg-battle-root');
  await s.narrate('The bottom of every story. The way down ends in a cavern so big that its far side is only darkness, and the darkness is breathing.');
  await s.narrate('Under everything, slow and enormous, something hums.');
  for (const id of travellers(s)) { const L = DREAM[id]; if (L) { await s.say(id, { burdock: 'Hmph. Quiet.', mole: 'Oh my. Oh my. It\'s ever so dark.', ratty: 'Listen to it. Like a river, only made of sleep.', badger: 'Steady, everyone.', toad: 'Hullo-o-o! ...It doesn\'t echo. I don\'t like a place that doesn\'t echo.', 'cheshire-cat': 'How very deep. I shall have to vanish carefully.', caterpillar: 'Hm. Dark.', ninefold: 'This is the oldest dark there is. It is very tired.', 'jade-rabbit': 'The light flickers, even here.', tansy: 'Stay close, Bramble. I mean it.', pip: 'Bramble... I can hear it breathing.', 'tin-woodman': 'Oh, it\'s so sad down here. I can feel it in my heart.', 'captain-quarry': 'This is where it all came from. The bottom of my hole.', rumble: 'Dark. Big dark. Rumble not scared. Rumble little bit scared.' }[id]); break; } }
  await s.say('bramble', 'We came all this way. Just us.', { mood: 'worried' });
  await s.narrate('Behind Bramble, the dark fills up with footsteps.');
  s.sfx('scamper', { vol: 0.7 });
  await s.move('bramble', [[4, 4], [5, 5], [6, 6]], 0.2);
  s.face('bramble', 'nw');
  // the warrens come down behind him, one after another
  const groups = [0, 1, 2, 3, 4, 5, 6];
  const say = { 0: ['woodruff', 'Mind your feet, everyone! It\'s a long way down, and the steps were made by nobody.'], 1: ['aster', 'Silverdown is here.'], 2: ['barley', 'Wheatsheaf too. All of us.'], 3: ['chert', 'And Flintcomb. Every one of us who can walk.'], 4: ['echo', '...and Deepdelve... what is left of us...'], 5: ['white-rabbit', 'Oh my ears and whiskers! Am I late? Tell me I\'m not late!'], 6: [null, 'And every friend Bramble made on the long way down.'] };
  for (const g of groups) {
    const ids = DEEP_CROWD.filter(a => a.group === g && s.actor(a.id)).map(a => a.id);
    const moves = ids.map((id, i) => { const a = s.actor(id); const tx = a.x, ty = a.y; s.place(id, 3, 3); s.show(id); return s.wait(i * 0.12).then(() => s.move(id, stairs(3, 3, tx, ty), 0.13)); });
    if (say[g]) { const [who, text] = say[g]; s.bubble(who || 'bramble', text, 2.6); }
    s.sfx('hop-1', { vol: 0.5 });
    await Promise.all([...moves.slice(0, 1), s.wait(0.9)]);
    if (g === 6) await Promise.all(moves);
  }
  await s.wait(1.6);
  await s.say('woodruff', 'Mind your feet, everyone! It\'s a long way down, and the steps were made by nobody.');
  await s.say('aster', 'Silverdown is here, Bramble. Every pale foot of us.');
  await s.say('barley', 'Wheatsheaf too. The corn can mind itself one night.');
  await s.say('chert', 'And Flintcomb. We started this. We\'ve come down to help finish it.');
  await s.say('echo', '...and Deepdelve... what is left of us... we remember the rhyme...');
  await s.say('white-rabbit', 'Oh my ears and whiskers, how DEEP it is! I\'m not late, am I?');
  await s.say('cowardly-lion', 'I\'m terribly frightened. I came anyway. Everyone did.');
  await s.say('bramble', 'You all came.', { mood: 'happy' });
  // Old Yarrow, last of all, slowly
  s.place('yarrow', 3, 3, 'se'); s.show('yarrow');
  await s.move('yarrow', [[4, 4], [5, 5]], 0.32);
  await s.say('yarrow', 'Well. Look at this. Every warren on the downs, at the bottom of the world.');
  await s.say('yarrow', 'I never thought I\'d live to see it. I\'m not sure I can see it now, mind. It\'s very dark and I\'m very old.');
  await s.say('yarrow', 'Everybody. You all know the rhyme. Your mothers sang it to you, and theirs to them, back and back to Deepdelve.');
  s.voice('vo-rhyme');
  await s.say('yarrow', '"When all the warrens thump as one, the Sleeper\'s dream is soft and done."');
  s.bubble('tb-3', '...soft and done!', 2.5); s.bubble('ec-1', '...as one...', 2.5);
  await s.say('yarrow', 'Three Thump Stones stand at the edge of the dark. Hold all three together, and keep thumping, and don\'t stop.');
  await s.say('yarrow', 'The Sleeper will dream at us while we do it. Bad dreams, with shapes. Don\'t let them have a stone.');
  const c = await s.ask('bramble', 'What does Bramble say?', ['We\'re ready.', 'I\'m scared, Yarrow.', 'Let\'s wake... no. Let\'s help it sleep.']);
  await s.say('yarrow', ['Good. Rest first if you like; there\'s a mossy stone up by the steps. Then come and find me at the stones.', 'So am I. So is everyone. That\'s how you know you\'re in the right place. Come and find me at the stones when you\'re ready.', 'That\'s it exactly. A kind voice in a bad night. Come and find me at the stones when you\'re ready.'][c]);
  await s.move('yarrow', stairs(5, 5, 19, 19), 0.15);
  s.face('yarrow', 'nw');
  s.quest('Talk to Old Yarrow at the Thump Stones to begin the Long Thump.');
}

async function longThumpWon(s) {
  s.set('g_c5-rts5_won');
  s.ambience('hum', 0.2); s.ambience('drone-bed', 0.2);
  s.shake(0.8, 2); s.sfx('thump-2', { vol: 1 });
  await s.narrate('The last stone rings. Then the whole Deep thumps: every warren at once, one heartbeat, over and over.');
  s.sfx('warren-drum', { vol: 0.8 });
  await s.narrate('The Hum shudders. Under Bramble\'s feet the stone goes soft as moss. The dark at the edge of everything opens, very slowly, like an eye.');
  await s.say('yarrow', 'There. Hear that? That\'s the Sleeper\'s heart, slowing to match ours.');
  await s.say('yarrow', 'Now comes the part of the rhyme nobody ever sang, because nobody knew it. Somebody has to go into the dream itself, and tell it something kind.');
  const c = await s.ask('bramble', 'What does Bramble say?', ['I\'ll go.', 'Why does it have to be me?']);
  if (c === 0) await s.say('yarrow', 'I know you will. You always do, you daft brave thing.');
  else { await s.say('yarrow', 'It doesn\'t. But you\'re the one who knows the story. You were in all of it.'); await s.say('bramble', '...I\'ll go.'); }
  await s.say('yarrow', 'Keep thumping, everyone! Don\'t stop till he\'s back!');
  await intoDream(s);
}
async function intoDream(s) {
  if (!s.has('silver-shoes')) s.give('silver-shoes', 1, true);
  await s.narrate('Bramble looks down at the silver shoes from the Munchkin Country. Glinda said they would carry their wearer anywhere at all, in three steps.');
  await s.narrate('Anywhere. Even into a dream.');
  await companion(s, { tansy: { a: 'You\'re not going alone, you know. Shift up.' }, burdock: { a: 'Hmph. Where you go, I go. Always have.' }, mole: { a: 'I\'m coming too! I think. Yes! Definitely!' }, toad: { a: 'Into a dream? Splendid! Toad has always been a tremendous dreamer!' }, rumble: { a: 'Rumble come. Rumble hold on to Bramble\'s ear.' }, 'captain-quarry': { a: 'I\'m coming. I dug the hole; I\'ll walk the dream at the bottom of it.' } }, 'a');
  const c = await s.ask('bramble', 'Step into the dream?', ['Three steps. Let\'s go.', 'Not yet.']);
  if (c === 1) { s.quest('Talk to Old Yarrow at the stones when you\'re ready to step into the dream.'); return; }
  for (const n of ['One.', 'Two.', 'Three.']) { s.sfx('thump-1', { vol: 0.8 }); await s.narrate(n); }
  s.sfx('shimmer', { vol: 1 });
  s.music('m-dream');
  await s.warp('c5-dream', 'start');
}

// ---------------------------------------------------------------- the Dream
async function phase1(s) {
  if (s.flag('c5_p1')) return;
  ensureMemories();
  s.face('nightmare-deepdelve', 'nw'); s.emote('bramble', '!');
  await s.narrate('Something stands up out of the grass. A rabbit, or the shape of one, as tall as a hawthorn: every empty room of Deepdelve, folded into a body.');
  await s.say('nightmare-deepdelve', '...too deep... you have come too deep... like we did...');
  await companion(s, DREAM, 'p0') || await s.say(travellers(s)[0] || 'bramble', 'Bramble... it\'s made of rabbits.');
  const c = await s.ask('bramble', 'What does Bramble say?', ['We\'ve come to help.', 'Let them go.']);
  await s.say('nightmare-deepdelve', c === 0 ? '...help...? nobody came... nobody came to help us...' : '...go...? where... where would we go... we forgot the way...');
  await s.say('bramble', 'Up. Home. I\'ll show you.');
  await s.battle('c5.nightmare-deepdelve');
  s.set('c5_p1'); s.remove('nightmare-deepdelve');
  await s.narrate('The great hollow shape sits down, very slowly, and comes apart into a great many small shapes: rabbits, holding paws.');
  await s.say('echo', '...someone came... someone came for us...');
  await s.narrate('They fade like breath on a cold morning.');
  await companion(s, DREAM, 'p1');
  s.shake(0.6, 2); s.sfx('choir-sting', { vol: 0.6 });
  await s.narrate('The dream turns over in its sleep. The hanging hills sway, and around the black sun a ring of eyes opens, blinking.');
  s.heal();
  await s.narrate('The grass here is soft and warm. Everyone feels rested.');
  s.quest('Go on, deeper into the dream.');
}
async function phase2(s) {
  if (s.flag('c5_p2')) return;
  s.emote('bramble', '!');
  await s.narrate('The ground hums. A digger made of flint and cold blue light is digging a hole in the grass, and the hole is digging back.');
  await s.say('nightmare-flintcomb', 'Deeper. Deeper. Dig, little rabbits. Forget your names. It is so much quieter when you forget.');
  if (s.member('captain-quarry')) await s.say('captain-quarry', 'That\'s my voice. That\'s what I sounded like. Bramble... that\'s the Hum I sang to them.');
  else await companion(s, { tansy: { a: 'I remember that voice. I dug to it for a whole season. Not again.' }, pip: { a: 'Bramble, it wants us to forget our names!' } }, 'a');
  const c = await s.ask('bramble', 'What does Bramble say?', ['Not this time.', 'My name is Bramble. Of Thimblebank.']);
  await s.say('nightmare-flintcomb', c === 0 ? 'Every time. Every time. Dig.' : 'Bramble... Bramble... it sounds so loud. Stop saying it.');
  await s.battle('c5.nightmare-flintcomb');
  s.set('c5_p2'); s.remove('nightmare-flintcomb');
  await s.narrate('The flint shatters into chalk dust, white and harmless, and the hole fills itself in, like a burrow at dawn.');
  await companion(s, DREAM, 'p2');
  s.sfx('wake-chime', { vol: 0.7 });
  await s.narrate('And now the dream starts to be kinder. The eyes round the sun close one by one, and the black sun\'s edge goes warm, like an ember remembering it was a fire.');
  s.heal();
  s.quest('Walk on to the black sun. Something is waiting there.');
}
async function phase3(s) {
  if (s.flag('g_c5_dream_done')) return;
  ensureMemories();
  await s.narrate('At the bottom of the dream the ground ends, and there is an eye.');
  await s.narrate('It is the size of the sky. It is very old, and very, very sleepy.');
  await s.say('eye', '...who... is... dreaming... me...?');
  await companion(s, DREAM, 'eye');
  const c = await s.ask('bramble', 'What does Bramble say?', ['Nobody. You\'re dreaming us.', 'I\'ve come to tell you a story.', 'It\'s all right. You can sleep now.']);
  await s.say('eye', ['...then... the dreams... are... mine... the cold ones... the humming ones... I am sorry...', '...a... story...? nobody... has told me... a story...', '...I... cannot... it is so loud... in here...'][c]);
  await s.narrate('It doesn\'t want to fight. It only wants the bad dreams to stop. Hitting it will barely reach it. Tell it a story instead: one each round.');
  await s.battle('c5.undersleeper-eye');
  s.set('g_c5_dream_done');
  s.music('m-sunset');
  await s.narrate('The Eye closes. Slowly, the way an old rabbit settles into a warm burrow after a long day.');
  await s.narrate('And at the corner of it, very faintly, it smiles.');
  await s.say('eye', '...thank... you... little... brown... one...');
  s.sfx('wake-chime', { vol: 1 });
  await s.narrate('Far above, the Hum changes. It becomes a low, slow, contented sound, like a cat purring under the hills.');
  await companion(s, DREAM, 'end');
  await s.say('bramble', 'Let\'s go home.', { mood: 'happy' });
  await s.narrate('The silver shoes take three steps. Up.');
  s.sfx('shimmer', { vol: 1 });
  await s.warp('c5-sunset', 'start');
}

// ---------------------------------------------------------------- Sorrel Down at sunset
async function sunsetArrive(s) {
  s.set('c5_sunset_arrived');
  await s.narrate('The silver shoes set Bramble down in the grass outside Thimblebank. The sun is low and gold, and the whole of Sorrel Down smells of clover.');
  await s.narrate('Every warren is here. Every friend. Up from the Deep, still thumping a little, out of habit.');
  s.emote('pip', '!');
  await s.say('pip', 'BRAMBLE! He\'s back! Everybody, he\'s BACK!');
  await s.say('burdock', 'Hmph.');
  await s.narrate('Burdock hugs him so hard his floppy ear stands straight up for a moment.');
  await s.say('mallow', 'Clover for the hero! Clover for everyone! Free! Don\'t get used to it!');
  await s.give({ 'clover-bunch': 3 });
  await s.say('yarrow', 'Welcome home, Bramble. Eat something. Then talk to everyone; they\'ve all got something to tell you, and they\'ll burst if they don\'t.');
  await s.say('yarrow', 'Tansy\'s up on the Lookout Stone. Go and sit with her when you\'re ready. I\'ll find you there.');
  s.quest('Talk to everyone at the feast, then sit with Tansy on the Lookout Stone.');
}
async function finale(s) {
  // Tansy and Bramble on the Lookout Stone
  await s.say('tansy', 'There you are. Sit. The sun\'s doing that thing where it goes all orange and shows off.');
  await s.narrate('Bramble climbs up beside her on the Lookout Stone. Below them, the whole of Sorrel Down is having supper.');
  await s.say('tansy', 'Remember when I raced you to the warren mouth? That was one morning. It feels like a hundred years ago.');
  const c = await s.ask('bramble', 'What does Bramble say?', ['You cheated.', 'You won.', 'I let you win.']);
  await s.say('tansy', ['I did NOT. I just started before "go". That\'s called being quick.', 'I did. I always do. Don\'t you forget it.', 'Ha! You did not. Your ears were too heavy.'][c]);
  await s.say('tansy', 'I left you a pebble, you know. When they were taking me east. In case you came.');
  await s.say('tansy', 'I didn\'t really think you would.');
  await s.say('bramble', 'I came.');
  await s.say('tansy', 'You came. You and a toad and a mole and a cat that keeps disappearing and something with nine eyes. Bramble, you brought the whole world with you.');
  await s.say('tansy', 'Shh. Listen.');
  await s.narrate('Far down, under the chalk, under everything, something hums. A low, slow, happy sound, like a cat purring under the hills.');
  await s.say('tansy', 'That\'s it, then. That\'s the Sleeper. Dreaming something nice.');
  const d = await s.ask('bramble', 'What does Bramble say?', ['It\'s dreaming about us.', 'It\'s dreaming about clover.', 'It\'s dreaming about the river, I think.']);
  await s.say('tansy', ['About us. Good. We\'re worth dreaming about.', 'Course it is. What else is there?', 'Mole will be unbearable when he hears that.'][d]);
  await s.narrate('They sit for a while without saying anything. It is the best kind of not saying anything.');
  // Old Yarrow, the door and the key
  const y = s.actor('yarrow');
  if (y) { await s.move('yarrow', stairs(y.x, y.y, 7, 22).slice(0, 26), 0.18); s.face('yarrow', 'se'); }
  await s.say('yarrow', 'Bramble. Walk an old rabbit to the deep door, would you? And bring the key.');
  await s.say('tansy', 'Go on. I\'ll save your place. I won\'t, actually. I\'ll sit in it.');
  await s.fadeOut(1.0);
  s.ambience('wind', 0);
  await s.narrate('Down through Thimblebank, past the rebuilt nursery and the Great Burrow, along the deep passage, to the old sealed door with its curling sign.');
  await s.say('yarrow', 'My grandmother locked this door. And her grandfather. And somebody\'s great-great-grandmother, back and back to Deepdelve.');
  await s.say('yarrow', 'One last time, then.');
  s.sfx('door-grind', { vol: 0.7 }); await s.wait(0.6); s.sfx('key-turn', { vol: 1 });
  // the Old Key stays in the save (ch0's sealed door needs it for wandering below after the ending); the story leaves it in the lock
  await s.narrate('The Old Key turns. The door is locked.');
  await s.narrate('And then Old Yarrow does something no elder of Thimblebank has ever done. He leaves the key in the lock.');
  const e = await s.ask('bramble', 'What does Bramble say?', ['You\'re leaving it there?', 'Won\'t someone open it?']);
  await s.say('yarrow', e === 0 ? 'I am. A locked door with the key hidden is a secret. A locked door with the key in it is only a story.' : 'Maybe one day. A locked door with the key in it isn\'t a secret any more. It\'s only a story.');
  await s.say('yarrow', 'Kits ought to know where the stories are. And if anyone ever has to go down again, they\'ll find the way.');
  await s.say('yarrow', 'With friends, this time. That\'s the part we forgot to put in the rhyme.');
  await s.say('yarrow', 'Now. I believe somebody promised me some sweetgrass, one morning, a long time ago.');
  await s.say('bramble', 'I did, didn\'t I.', { mood: 'happy' });
  s.ambience('wind', 0.2);
  await s.fadeIn(1.0);
  await s.ending();
  s.set('g_won'); s.set('g_ch5_done');
  s.quest('Peace on the Downs. Wander, and talk to everyone.');
  s.save();
  await s.narrate('The sun has gone down. Nobody has gone indoors. The fireflies are out over Sorrel Down, and somewhere deep below, the hills purr.');
}

// ---------------------------------------------------------------- home rabbits during the Finale (run by ch0's home.<id>)
const HOME = {
  yarrow: [['The bottom of every story is down there, Bramble. And everyone\'s waiting at the top of it to come with you.'], ['A key in a lock. A kit with a story. That\'s all an old rabbit ever wanted.']],
  mallow: [['Shop\'s shut tomorrow. I\'m coming down with everyone. Don\'t look so surprised.'], ['Business is booming. Everyone wants buttons with a little thump-stone stamped on. I\'ve run out.']],
  woodruff: [['Every warren thumping as one. I\'ve told that story a thousand times. I\'d like to see it, once.'], ['The kits want the new ending every night. "And then Bramble went into the dream..." They know it better than I do.']],
  comfrey: [['Come back whole, Bramble. That\'s all I ask. Whole and hungry.'], ['Not a single nightmare in the nursery since. Not one. The kits sleep like stones.']],
};
// the ten named home rabbits (Clary, Hob, Teasel, Penny, Nettle, Sloe, Bryony, Rush, Tuft, Lichen): before the end, after
const HOME_N = [
  ['Everyone\'s going down to the bottom of the world. I\'ve checked the sky twice. It\'s still up there. That\'s something.', 'No rumbles last night. None. I counted. Zero is my new favourite number.'],
  ['Going all the way down, are they? Mind the drainage. Nobody ever minds the drainage.', 'Ground\'s settled. Dry as a biscuit. Whatever you did down there, it was very good for drainage.'],
  ['I\'m practising my thump. Watch. ...That was a thump AND a jump. Nobody else can do both at once.', 'I did the biggest thump in the whole Deep. Ask anyone. Well. Don\'t ask Rumble.'],
  ['I\'m picking every clover head on the down for when you come back. There will be a when. I\'ve already picked for it.', 'The clover\'s come up thicker than I\'ve ever seen. As if the ground\'s in a good mood.'],
  ['I\'m not scared of any Sleeper. I\'m going to thump it so hard... gently. Yarrow says gently.', 'I wasn\'t scared. My ears were. That\'s different.'],
  ['I\'m making a song about the Long Thump. It only has one note so far. A very deep one.', 'Listen. The hills hum in tune now. I\'ve been singing along all evening.'],
  ['The kits want to come down and thump too. I\'ve said they can thump from the nursery. Very loudly.', 'Every kit in the nursery slept right through the night. Every one. I hardly knew what to do with myself.'],
  ['I\'ve measured the way down. Four hundred and twelve hops, give or take a hop. Mostly take.', 'Not one new crack in the walls since. I checked. Twice. With a grass stem, for straightness.'],
  ['Pip says he\'s going to the very bottom with you! Can I come? Pip says I\'d talk too much. I wouldn\'t. Much. Hardly.', 'Pip told me everything! Twice! The Eye and the black sun and the upside-down hills! Is it ALL true?'],
  ['Eh? The bottom of the world? In my day we didn\'t go to the bottom of anything. We went to bed.', 'Eh? Quiet, is it? I hadn\'t noticed. Hasn\'t been properly quiet since I was a kit. Lovely.'],
];

const scripts = {
  'c5.deep.enter': async (s) => {
    s.set('g_underway_c5', true);
    if (!s.flag('c5_gathered')) { await gathering(s); return; }
    s.ex.enterBubble();
  },
  'c5.deep.rest': async (s) => { await s.narrate('A mossy stone at the foot of the steps, warm from all the rabbits who have sat on it tonight.'); await s.rest(); },
  'c5.deep.back': async (s) => {
    // back up to whichever map has the door down to the Sleeping Deep (ch4's Root of the World)
    const maps = G.data.maps;
    const from = Object.keys(maps).find(id => id !== 'c5-deep' && (maps[id].doors || []).some(d => d.to === 'c5-deep'));
    if (!from || s.flag('g_c5-rts5_won')) { await s.narrate(s.flag('g_c5-rts5_won') ? 'Everyone is thumping. There\'s no going back up now: only on, into the dream.' : 'The way back up is a long climb, and every warren on the downs is behind you. Not now.'); return; }
    const door = maps[from].doors.find(d => d.to === 'c5-deep');
    const ents = Object.values(maps[from].entries || {});
    const best = ents.sort((a, b) => (Math.abs(a[0] - door.x) + Math.abs(a[1] - door.y)) - (Math.abs(b[0] - door.x) + Math.abs(b[1] - door.y)))[0];
    if (!best) return;
    await s.warp(from, best[0], best[1], best[2]);
  },
  'c5.deep.talk': async (s, a) => {
    const L = DEEP_LINES[a.id] || DEEP_DEFAULT;
    await play(s, a.id, s.flag('g_c5-rts5_won') ? L.post : L.pre);
  },
  'c5.yarrow.deep': async (s) => {
    if (s.flag('g_c5-rts5_won')) { await s.say('yarrow', 'Keep thumping, everyone! Go on, Bramble. The shoes.'); await intoDream(s); return; }
    if (!s.flag('c5_yarrow_talked')) {
      s.set('c5_yarrow_talked');
      await s.say('yarrow', 'Here they are. The Thump Stones. Older than Deepdelve, older than anyone. Feel them? They want to be thumped.');
      await s.say('yarrow', 'You lead, Bramble. Send your squads to all three stones and hold them together. The Long Thump only counts while every stone is ours.');
      await s.say('yarrow', 'Lose one and the count waits. It never goes back. Take it again, and on we go.');
      await s.say('yarrow', 'The shapes are made of the Sleeper\'s bad dreams. Moon Hares and Wick\'s moths carry light, and dreams can\'t abide light. Deepdelve\'s echoes are coming too, for nothing. They insist.');
    }
    const c = await s.ask('yarrow', 'Shall we begin the Long Thump?', ['Let\'s thump.', 'Not yet.']);
    if (c === 1) { await s.say('yarrow', 'Whenever you\'re ready. The Sleeper isn\'t going anywhere. That\'s rather the point of it.'); return; }
    const r = await s.army('c5-rts5');
    s.ambience('hum', 0.35); s.ambience('drone-bed', 0.25);
    if (r === 'win') { await longThumpWon(s); return; }
    if (r === 'lose') {
      await s.say('yarrow', 'Not like this, Bramble. Not alone, and not in a hurry. Breathe. We\'ll go again.');
      await s.say('yarrow', 'Keep a strong squad on every stone, not everyone on one. Reinforce on the stones between the shapes. And let the light squads meet them.');
    } else await s.say('yarrow', 'Whenever you\'re ready.');
  },
  'c5-rts5.won': longThumpWon,
  'c5.dream.enter': async (s) => {
    ensureMemories();
    if (!s.flag('c5_dream_arrived')) {
      s.set('c5_dream_arrived');
      await s.narrate('Sorrel Down. But wrong.');
      await s.narrate('The hills hang down from the sky like roots. The grass grows in a bowl where the downs should rise. And the sun is black, and it hums.');
      await companion(s, DREAM, 'arrive');
      await s.say('bramble', 'It\'s home. Upside down.', { mood: 'worried' });
      await s.narrate('Far off, faint as a heartbeat through a wall, every warren is still thumping.');
      s.quest('Walk down into the dream, toward the black sun.');
      return;
    }
    s.ex.enterBubble();
  },
  'c5.dream.rest': async (s) => { await s.narrate('A patch of dream-moss, soft as a nest. It smells of Thimblebank.'); await s.rest(); },
  'c5.dream.phase1': phase1,
  'c5.dream.phase2': phase2,
  'c5.dream.phase3': phase3,
  'c5.sunset.enter': async (s) => {
    if (s.flag('g_c5_dream_done') && !s.flag('c5_sunset_arrived') && !s.flag('g_won')) { await sunsetArrive(s); return; }
    s.ex.enterBubble();
  },
  'c5.sunset.door': async (s) => {
    if (!s.flag('g_won')) { await s.say('yarrow', 'Not yet, Bramble. Nobody\'s going indoors tonight. Look at that sky.'); return; }
    const maps = G.data.maps;
    if (maps['c0-warren'] && (maps['c0-warren'].entries || {}).mouth) { await s.warp('c0-warren', 'mouth'); return; }
    if (maps['c0-downs'] && (maps['c0-downs'].entries || {}).warren) { await s.warp('c0-downs', 'warren'); return; }
    await s.narrate('Thimblebank is warm and full and quiet. Everyone is out here, anyway.');
  },
  'c5.last': async (s, a) => {
    if (a.id === 'tansy' && !s.flag('g_won')) { await finale(s); return; }
    const L = LAST_LINES[a.id]; if (!L) { await s.narrate('They smile at you in the sunset.'); return; }
    await play(s, a.id, s.flag('g_won') ? (L.post || L.pre) : (L.pre || L.post));
    if (a.id === 'woodruff' && s.flag('g_won')) await ngOffer(s);
  },
  'ng.offer': ngOffer,
};
for (const [id, [pre, post]] of Object.entries(HOME)) scripts[`home.${id}.ch5`] = async (s, a) => { for (const l of (flag('g_won') ? post : pre)) await s.say(id, l); if (id === 'woodruff') await ngOffer(s); };
HOME_N.forEach(([pre, post], i) => { scripts[`home.home-${i + 1}.ch5`] = async (s, a) => { await s.say(a && a.id ? a.id : 'buck', flag('g_won') ? post : pre); }; });

export default scripts;
