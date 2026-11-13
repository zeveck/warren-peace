// The Epilogue's scripts: Shale's invitation, the arrival, the four tasks (spoil heaps, dandelion clocks, the old
// rooms, the last digger), the Top Stone at the lip and the feast.
import { G } from '../../core.js';
import { flag } from '../../state.js';
import {
  started, done, trav, has, escorting, heapsCleared, clocksPicked, patchesSown, clocksHeld, roomsOpen, ready, nextStep,
  refreshConds, thump, chime, chirp, stage, HEAPS,
} from './common.js';
import { ALCOVES } from './maps.js';

const quest = s => s.quest(nextStep());
const refresh = s => refreshConds(s.ex);
const bubbleOr = (s, id, text) => { if (trav(id)) s.bubble(id, text, 3); else s.emote('c6-' + id, '!'); };

// ---------------------------------------------------------------- the invitation
async function hint(s) {
  if (flag('c6_invited') || flag('c6_hinted')) return;
  s.set('c6_hinted');
  s.emote('c6-shale', '!', 2.5);
  s.sfx('hop-2', { vol: 0.4 });
  s.quest(nextStep());
}
async function invite(s, a) {
  if (flag('c6_invited')) return;
  await s.say('shale', 'Bramble! It\'s me. Shale. From Flintcomb. I remember my name every morning now. I check.');
  await s.say('shale', 'The Captain sent me with this. He said give it to you after the clover, not before. Is it after the clover?');
  await s.narrate('A flat slate of flint, scratched deep with a claw: BRAMBLE. COME DIG. UP THIS TIME. BRING THE BIG ONE. Q.');
  await s.say('shale', 'He can\'t write much. Took him all night. He did "BIG" three times before it came out right.');
  const c = await s.ask('bramble', 'Dig up?', ['I\'ll come.', 'How do you dig up?']);
  if (c === 0) await s.say('shale', 'He said you would. Knapper said you wouldn\'t. Knapper didn\'t hear the question.');
  else await s.say('shale', 'Nobody in Flintcomb knows. That\'s the point, the Captain says. We\'re going to find out together.');
  await s.say('shale', 'East, past the last green hill. When you\'re ready. There\'s heaps want shifting, so bring Rumble if he\'s about.');
  s.set('c6_invited');
  s.quest(nextStep());
  s.sfx('hop-1', { vol: 0.5 });
  const st = [[a.x + 1, a.y], [a.x + 2, a.y], [a.x + 3, a.y], [a.x + 4, a.y]];
  await s.move(a.id, st, 0.16);
  s.remove(a.id);
  s.save();
}

// ---------------------------------------------------------------- the arrival
async function arrive(s) {
  s.set('c6_started'); s.set('c4_seen_flintcomb'); s.chapter(6);
  s.music('m-downs'); s.ambience('hum', 0);
  await s.chapterCard('Digging the Other Way', 'Epilogue', 'bg-battle-downs');
  refresh(s);
  await s.narrate('Flintcomb. Still white, still bitten out of the downs. But the dust has settled, and somebody is whistling.');
  const q = stage(s, 'captain-quarry');
  if (q && !trav('captain-quarry')) { await s.move('c6-quarry', [[7, 16], [6, 17], [5, 18], [4, 18]], 0.2); s.face('c6-quarry', { x: s.b.x, y: s.b.y }); }
  await s.say('captain-quarry', 'BRAMBLE! You came! Knapper bet me a flint you wouldn\'t. I\'m going to frame that flint.');
  await s.say('captain-quarry', 'Look at it. A year of digging, and all we made was a hole and those heaps. We quarried our own nursery for that. Our larder. My den.');
  await s.say('captain-quarry', 'The whole warren sleeps round the hole on bare flint. It only purrs now, I know. I still won\'t have kits sleeping next to it.');
  const c = await s.ask('bramble', 'Quarry looks at the bowl.', ['So we dig the other way.', 'Where do we start?']);
  if (c === 0) await s.say('captain-quarry', 'The other way! Up, and sideways, into the good green bank. Away from the hole. I\'ve been saying it in my sleep.');
  else await s.say('captain-quarry', 'At the top. For once in my life, at the top.');
  await s.say('captain-quarry', 'Those spoil heaps want shoving back down the chute. Something big. Something with a trunk.');
  await s.say('captain-quarry', 'We\'ve started the new burrows in the west bank, and broken into our old rooms. Only nobody remembers which wall they\'re behind.');
  await s.say('captain-quarry', 'Hob of Thimblebank says dandelions grow where nothing else will. There are clocks gone to seed up on the downs by the bank. Seed, Bramble!');
  await s.say('captain-quarry', 'And there\'s Gault. He won\'t stop digging at the lip. Won\'t listen to me. Maybe he\'ll listen once there\'s something better to dig.');
  await chime(s, { tansy: 'Half the downs turned up to help, look. Wheatsheaf brought a hay-cart. Silverdown brought opinions.', pip: 'I can help! I can find things! I found Barley\'s bell!', burdock: 'Hmph. Good. Digging.', rumble: 'Heaps! Rumble SHOVES heaps!', mole: 'Spring-cleaning! In autumn! Oh, what fun!', _: 'All round the bowl, rabbits from every warren are rolling up their sleeves, which is hard, since rabbits don\'t have any.' });
  if (q && !trav('captain-quarry')) await s.move('c6-quarry', [[5, 18], [6, 17], [7, 16], [8, 16]], 0.2);
  refresh(s);
  quest(s);
  s.save();
}

// ---------------------------------------------------------------- task A: the spoil heaps (Rumble shoves)
const rumbleHere = () => trav('rumble') || escorting('c6-rumble');
async function rumbleTalk(s) {
  if (!flag('c6_heaps_done')) {
    await s.say('rumble', 'Bramble! Heaps? Rumble SHOVES heaps. Rumble is very good at shove.');
    await s.narrate('Rumble falls in behind Bramble, swinging his trunk, ready.');
    s.escort('c6-rumble', true, { sprite: 'rumble' });
    refresh(s);
    s.quest('Take Rumble to the spoil heaps and use them. (' + heapsCleared() + '/3 shoved)');
    return;
  }
  if (done()) { await s.say('rumble', 'Kits on Rumble! Rumble is a hill now. A hill that eats clover. HRRMP.'); return; }
  await s.say('rumble', 'Heaps gone! Rumble shoved ALL. Rumble is very good at shove. Told you.');
}
async function heap(s, n) {
  if (flag('c6_heap' + n)) return;
  if (!rumbleHere()) {
    await s.narrate('Bramble puts his shoulder to the heap. The heap does not notice.');
    if (has('rumble')) await s.say('bramble', 'This wants someone big. Rumble\'s by the ramp.'); else await s.say('bramble', 'This wants someone much bigger than me.');
    return;
  }
  const k = heapsCleared();
  const [x, y] = { 1: [10, 22], 2: [24, 19], 3: [16, 6] }[n];
  if (k === 0) {
    await s.say('rumble', 'Push? Rumble pushes! Where to?');
    await s.say('captain-quarry', 'Down the chute! Every barrow-load goes back down where it came from.');
    await s.say('captain-quarry', 'A barrow at a time. Flick says it\'ll take a hundred years to fill the hole. Fine. We\'ve got a hundred years now.');
    await s.say('rumble', 'Rumble pushes a hundred years. HRRRMP!');
  } else if (k === 1) {
    await s.narrate('Three Flintcomb kits run up and put their paws on the heap beside Rumble\'s trunk.');
    await s.say('kit', 'We\'re HELPING!');
    await s.narrate('It makes no difference at all. They are very proud.');
    await s.say('rumble', 'Small ones push too. Herd pushes together. HRRMP!');
  } else {
    await s.say('rumble', 'Last heap. Rumble does it ALONE. Watch Rumble. Everybody watch!');
    await chime(s, { tansy: 'We\'re watching, you great show-off.', toad: 'A natural performer! I recognise the type.', pip: 'I\'m watching! I\'m watching SO hard!', _: 'Everyone in the bowl stops to watch.' });
  }
  s.sfx('rumble', { vol: 0.8 }); s.shake(0.8, 2);
  s.set('c6_heap' + n);
  refresh(s);
  for (let a = 0; a < 2; a++) s.ex.dust && s.ex.dust(x + a, y, s.ex.hAt(x + a, y));
  await s.narrate(k === 2 ? 'With one great shove the whole heap slides to the chute and rattles away down, down, toward the hole. A small cheer goes up all round the bowl.' : 'The heap slides off across the flint, tips into the chute and rattles away down toward the hole.');
  if (k === 2) {
    await s.narrate('Where it stood, half buried in the chalk: a battered tin with a kit\'s scratches on the lid.');
    await s.say('captain-quarry', 'The nursery\'s button tin! We lost it the week the humming started. Keep what\'s in it. The kits insist. I asked them.');
    await s.give({ buttons: 250, 'carrot-cake': 2 });
  }
  if (clocksHeld() > 0) { await sow(s, n, true); await finishSowing(s); }
  else await s.narrate('Bare chalk, where the heap was. With a little seed, something would take here.');
  if (heapsCleared() === 3) {
    s.set('c6_heaps_done');
    if (escorting('c6-rumble')) { s.escort('c6-rumble', false); refresh(s); }
    await s.say('rumble', 'All heaps gone! Rumble goes to be sat on now. Kits like sitting. Rumble likes being a hill.');
  }
  await afterTask(s);
}

// ---------------------------------------------------------------- task D: dandelion clocks, sown the moment a patch is bare
async function clock(s, n) {
  if (flag('c6_clock' + n)) return;
  s.set('c6_clock' + n);
  refresh(s);
  s.sfx('nibble', { vol: 0.4 });
  const k = clocksPicked();
  await s.narrate(['A dandelion clock, gone to seed. Bramble picks it very carefully, so as not to start it off early.', 'Another clock. It trembles in the wind, wanting to go.', 'A third clock. Bramble holds them all up together, like a little cloud on stalks.', 'Four. He is trying very hard not to sneeze.', 'Five clocks: every one on the bank.'][k - 1] || 'A dandelion clock.');
  if (k === 1) await chime(s, { ninefold: 'A small sun, gone white and soft. And it gives itself away to the wind. I like it very much.', 'cheshire-cat': 'Blow on it and it tells you the time. It\'s always the time to blow on it.', pip: 'Can I blow one? Just one? Just a little one?' });
  const bare = HEAPS.find(h => flag('c6_heap' + h) && !flag('c6_sown' + h));
  if (bare) s.quest('A heap\'s been cleared: blow a clock over the bare chalk where it stood.');
  else quest(s);
  await finishSowing(s);
}
async function sow(s, n, auto) {
  if (flag('c6_sown' + n) || clocksHeld() < 1) return false;
  await s.narrate(auto ? 'Bramble takes a dandelion clock and blows. The seeds lift off like tiny parachutes and settle on the bare chalk.' : 'Bramble blows a clock over the bare chalk. The seeds drift down and settle, and the kits stamp them in, very seriously.');
  s.sfx('shimmer', { vol: 0.6 });
  s.set('c6_sown' + n);
  refresh(s);
  await s.narrate('Green comes up through the chalk at once, the way it only ever does in stories. Nobody in Flintcomb minds that it\'s a story.');
  return true;
}
async function patch(s, n) {
  if (flag('c6_sown' + n)) return;
  if (clocksHeld() < 1) { await s.narrate('Bare chalk, where the heap was. A dandelion clock would take here. There are some up on the west downs, by the new burrow door.'); return; }
  await sow(s, n, false);
  await finishSowing(s);
  await afterTask(s);
}
async function finishSowing(s) {
  if (flag('c6_sown') || clocksPicked() < 5 || patchesSown() < 3) return;
  await s.narrate('Two clocks left over. Bramble hops up on the bank, takes a deep breath, and blows them out over the whole white bowl.');
  s.sfx('shimmer', { vol: 0.8 });
  s.set('c6_sown');
  refresh(s);
  await chime(s, { ninefold: 'Two small suns, given away to everyone at once. That is the most generous thing I have ever seen a rabbit do.', tansy: 'Show-off.', mole: 'Oh, look at them go! Like snow going the wrong way!', _: 'The seeds sail out across Flintcomb, and come down everywhere.' });
  await s.say('captain-quarry', 'Flintcomb, growing things. My grandmother would sit down and cry. Then she\'d tell us to weed it.');
  await afterTask(s);
}

// ---------------------------------------------------------------- task B: the old rooms (thump the alcoves)
const SOLID = {
  3: ['Thock. Solid chalk, all the way through. Possibly all the way to Wheatsheaf.', 'Thock. Still solid. It hasn\'t changed its mind.'],
  5: ['Thock. Then, very faintly, from somewhere behind it: "EH? WHO\'S THAT?"', 'Thock. "I SAID, WHO\'S THAT?" It\'s Knapper\'s store, on the other side. Best leave it.'],
};
const SOLID_CHIME = {
  3: { pip: 'That one\'s a no. Definitely a no. It sounded like Burdock\'s head.', burdock: 'Hmph. Solid. Like me.', toad: 'Solid as my reputation!', 'cheshire-cat': 'A wall that is a wall all the way through. How dull.', _: '' },
  5: { pip: 'That was a person! Walls aren\'t supposed to say EH!', tansy: 'Your knock\'s rubbish, Bramble. Even Knapper heard it.', 'captain-quarry': 'That\'s my old store. Knapper\'s had his ear to that wall a year. Can\'t hear a thing through it either.', _: '' },
};
const ROOM_LINES = {
  den: ['BOOM. Deep and round, like a drum with a cave in it.', 'Behind the rubble: a low room with a scorched old settle and a table scratched with tally-marks. It smells of pipe-smoke that hasn\'t been smoked for a year.', ['captain-quarry', 'My den. My DEN. I quarried it out for the spiral myself. Look, there\'s my chair. It\'s all right. It\'s all right.']],
  nursery: ['BOOM. A soft boom, and then, somehow, the boom sounds sleepy.', 'Behind the rubble: a round room where the morning comes in through a crack high in the chalk. Nests in the corners, still lined with old fluff.', ['shale', 'The nursery. I slept in that corner. I knew it. I KNEW I knew it.']],
  larder: ['BOOM. A cool, damp sort of boom.', 'Behind the rubble: a long cold room, the walls weeping a little, with hooks for roots and shelves for apples. Very cool. Exactly right.', ['captain-quarry', 'The larder! Cold as a well. Fill it up, everyone! Something that isn\'t flint!']],
};
async function alcove(s, k) {
  const a = ALCOVES.find(a => a.k === k); if (!a) return;
  if (a.room && flag('c6_room_' + a.room)) return;
  s.face('bramble', { x: a.x, y: a.y });
  await thump(s, 1);
  if (!a.room) {
    s.sfx('hit-1', { vol: 0.5, pitch: 0.6 });
    const n = s.val('c6_solid' + k) || 0; s.set('c6_solid' + k, n + 1);
    await s.narrate(SOLID[k][Math.min(n, 1)]);
    if (n === 0) { const said = chirp(s, SOLID_CHIME[k]); if (!said && s.actor('c6-pip')) s.emote('c6-pip', '?'); }
    return;
  }
  const [boom, room, [who, line]] = ROOM_LINES[a.room];
  s.sfx('thump-2', { vol: 1, pitch: 0.7 });
  await s.narrate(boom);
  await chime(s, { pip: 'HOLLOW! That one\'s hollow! I heard it in my feet!', burdock: 'Hmph. Hollow. Stand back.', 'captain-quarry': 'Hollow! Dig, dig, dig! The right way!', _: '' });
  await s.fadeOut(0.5);
  s.sfx('scamper', { vol: 0.8 }); s.sfx('rumble', { vol: 0.5 });
  s.set('c6_room_' + a.room);
  refresh(s);
  await s.wait(0.6);
  await s.fadeIn(0.5);
  await s.narrate(room);
  await s.say(who, line);
  if (roomsOpen() === 3) {
    s.set('c6_rooms_done');
    await s.narrate('Flintcomb families come in with bundles of bedding from Wheatsheaf\'s hay-cart, and the new burrows start, very quietly, to smell like home.');
  }
  if (a.room === 'nursery' && !flag('c6_gault_done')) await s.narrate('In the new nursery, one dark little kit sits apart from the others, ears down.');
  await afterTask(s);
}
async function tally(s) {
  await s.narrate('A tally-stone, carved by some long-ago Flintcomb grandmother. Under the tallies, three lines:');
  await s.narrate('"Where the morning comes in, the kits sleep. Where the chalk weeps, the roots keep. Beside the warm, the Captain snores."');
  await chime(s, { 'captain-quarry': 'My grandmother. She always did talk in riddles. The Captain was my grandad. He snored like a rockfall.', pip: 'Riddles! I LOVE riddles. Thump the walls and listen. Hollow goes BOOM.', _: 'Thump the alcoves and listen. Hollow walls answer.' });
}
async function pip(s) {
  if (done()) { await s.say('pip', 'I found a room! Well. You thumped it. But I heard it! That counts!'); return; }
  await s.say('pip', 'Bramble! Yarrow taught me to listen to the ground. Thump on a wall, and if it goes BOOM, it\'s hollow!');
  await s.say('pip', 'And if it goes thock, it\'s just a wall. Walls are boring. Except when they\'re not.');
}

// ---------------------------------------------------------------- task C: the last digger
async function chip(s, a) {
  if (flag('c6_gault_done')) return;
  if (!flag('c6_chip_met')) {
    s.set('c6_chip_met');
    await s.say('chip', 'I\'m Chip. I\'m not sleeping in the new nest. Not without my dad.');
    await s.say('chip', 'He\'s at the hole. He\'s ALWAYS at the hole. His paws won\'t stop. Mum says don\'t look.');
    const c = await s.ask('bramble', 'Chip looks at his paws.', ['Let\'s go and get him.', 'Will you show him the nursery?']);
    await s.say('chip', c === 0 ? 'You and me? Down the spiral? ...All right. I\'m brave. I\'m only small.' : 'If he looks at it he\'ll see it\'s better. It\'s got a window made of morning.');
  } else await s.say('chip', 'Down the spiral. Round and round. Stay where I can see you.');
  s.escort('c6-chip', true, { sprite: 'rabbit-kit', kid: true });
  refresh(s);
  s.quest('Take Chip down Flintcomb\'s spiral to his dad, Gault, at the lip of the hole.');
  s.save();
}
async function gault(s, a) {
  if (flag('c6_gault_done')) {
    await s.say('gault', done() ? 'Paws quiet. Kit asleep. Purring under the floor. Best night\'s sleep in a year.' : 'I dug Chip a bed. Upward. It\'s a terrible bed. He says it\'s the best bed in Flintcomb.');
    return;
  }
  if (!escorting('c6-chip')) {
    s.set('c6_gault_met');
    await s.narrate('A dark buck kneels at the very edge, scraping at the flint. Scrape. Scrape. He doesn\'t look up.');
    await s.say('gault', 'Can\'t stop. Paws won\'t. I tell them stop and they say: deeper. Scrape, scrape.');
    const c = await s.ask('bramble', 'What does Bramble say?', ['It\'s over, Gault. The Hum\'s gone.', 'Sit with me a minute.']);
    if (c === 0) await s.say('gault', 'I know. I know it\'s gone. I can hear it purring. My paws didn\'t get told.');
    else { await s.narrate('Bramble sits down at the edge beside him. For a while, neither of them says anything. The scraping slows. Then starts again.'); await s.say('gault', 'Nice of you. Didn\'t work. Nice, though.'); }
    s.quest(flag('c6_room_nursery') ? 'Gault won\'t stop. His kit, Chip, is in the new nursery. Bring Chip down to him.' : nextStep());
    return;
  }
  // with Chip
  s.escort('c6-chip', false);
  const g = s.actor('c6-gault');
  s.spawn({ id: 'c6-chip-scene', sprite: 'rabbit-kit', fur: 'dark', kid: true, x: s.b.x, y: s.b.y, facing: 'se' });
  if (g) await s.move('c6-chip-scene', [[g.x, g.y + 1]], 0.25);
  await s.say('chip', 'Dad.');
  await s.narrate('The scraping stops.');
  await s.say('gault', 'Chip? You shouldn\'t be down here. Not by the hole. Never by the hole.');
  await s.say('chip', 'Then come up. There\'s a nursery. A real one. It\'s got a window made of morning. I need a bed dug, and I want YOU to dig it.');
  await s.say('gault', 'Up? I don\'t know how to dig up. I\'ve forgotten. My paws only know down.');
  const c = await s.ask('bramble', 'What does Bramble say?', ['He needs you up there.', 'Dig with him, not for it.']);
  await s.say('bramble', c === 0 ? 'Your paws learned down in a year. They\'ll learn up in an afternoon. Chip will show them.' : 'You dug for the Hum a whole year. Dig for Chip one afternoon. See which one feels better.');
  await s.narrate('Bramble takes out Quarry\'s digger\'s needle, the lodestone that always points home to Flintcomb, and holds it out flat.');
  await s.narrate('Down here, at the lip, it swings round and points up the spiral. Up, toward the new burrows.');
  await s.say('bramble', 'It points home. Home\'s up now.');
  await s.wait(0.5);
  await s.say('gault', '...My paws stopped. Chip. Chip, my paws have stopped.');
  await s.say('chip', 'Good. Now dig my bed. Upward.');
  s.set('c6_gault_done');
  if (g) { const p = [[g.x - 1, g.y], [g.x - 2, g.y], [g.x - 3, g.y]]; await Promise.all([s.move('c6-gault', p, 0.2), s.move('c6-chip-scene', p.map(([x, y]) => [x, y + 1]), 0.2)]); }
  s.remove('c6-chip-scene'); s.remove('c6-gault');
  refresh(s);
  await afterTask(s);
}

// ---------------------------------------------------------------- after any task: the next step, or the stone
async function afterTask(s) {
  quest(s);
  if (ready() && !flag('c6_ready_said')) {
    s.set('c6_ready_said');
    s.sfx('alert-horn', { vol: 0.3 });
    await s.narrate('From somewhere across Flintcomb comes Knapper\'s voice, very loud, as always: "FINISHED! THE STONE\'S FINISHED! TAKE IT DOWN!"');
    await s.say('captain-quarry', 'That\'s it, then. Everyone down to the lip. Bramble, you lead. Mind the edge.');
    quest(s);
    if (s.ex.map.id === 'c4-warren') await closing(s);
  }
  s.save();
}

// ---------------------------------------------------------------- the Top Stone, and the feast
const CROWD = [
  ['c6x-quarry', 'captain-quarry', null, 17, 12, 'se', 'captain-quarry'], ['c6x-knapper', 'quarryman', 'grey', 20, 12, 'sw'],
  ['c6x-chert', 'chert', null, 21, 13, 'sw'], ['c6x-shale', 'rabbit-doe', 'grey', 22, 12, 'sw'], ['c6x-gault', 'rabbit-buck', 'dark', 23, 13, 'sw'],
  ['c6x-chip', 'rabbit-kit', 'dark', 22, 13, 'sw', null, { kid: true }], ['c6x-fc1', 'rabbit-buck', 'dark', 13, 12, 'se'], ['c6x-fc2', 'rabbit-doe', 'grey', 15, 12, 'se'],
  ['c6x-kit', 'rabbit-kit', 'grey', 12, 13, 'se', null, { kid: true }], ['c6x-burdock', 'burdock', null, 13, 14, 'ne', 'burdock'],
  ['c6x-rumble', 'rumble', null, 24, 14, 'nw', 'rumble'], ['c6x-pip', 'pip', null, 12, 12, 'se', 'pip', { kid: true }], ['c6x-tansy', 'tansy', null, 24, 16, 'nw', 'tansy'],
];
async function closing(s) {
  if (done() || !ready()) return;
  await s.fadeOut(0.8);
  s.set('c6_stone');
  refresh(s);
  for (const [id, sprite, fur, x, y, facing, member, extra] of CROWD) {
    if (member && (!has(member) || trav(member))) continue;
    s.spawn({ id, sprite, fur, x, y, facing, ...(extra || {}) });
  }
  s.place('bramble', 18, 12, 'se');
  s.music('m-warren');
  await s.wait(0.3);
  await s.fadeIn(0.8);
  await s.narrate('Everyone has come down the spiral. Flintcomb, and its friends, all round the lip of the hole, as close as anyone likes to stand.');
  await s.narrate('Beside Quarry\'s old rope stands a new stone, white and square-shouldered, cut to look like the Thump Stones in the Deep.');
  await s.say('knapper', 'THERE. Best stone I ever knapped. I can\'t hear a thing, but I can feel that hole purring in my feet. So: a stone, where everyone can feel it.');
  await s.say('captain-quarry', 'I carved the words. Read them out, Bramble. I can\'t read my own claw-writing.');
  await s.narrate('DIG NO DEEPER THAN THIS. THUMP IF YOU\'RE LONELY.');
  s.spawn({ id: 'c6x-yarrow', sprite: 'yarrow', x: 12, y: 15, facing: 'ne' });
  await s.move('c6x-yarrow', [[13, 15]], 0.32);
  await s.say('yarrow', 'Well. My knees said no. I said somebody old ought to see it. We compromised, and they complained the whole way down.');
  await s.say('yarrow', 'A stone at the top of the hole. Not a lid. A lid is a secret. This is a story. Kits will ask what it\'s for, and somebody will tell them.');
  await s.say('captain-quarry', 'Will you do the first thump, Bramble? You did the last one.');
  await s.ask('bramble', 'Bramble puts a paw on the stone.', ['Thump.']);
  await thump(s, 1);
  s.emote('c6x-chip', '!');
  await s.ask('bramble', 'Everybody joins in.', ['Thump!']);
  for (const [id] of CROWD) s.emote(id, '!', 1);
  await thump(s, 2);
  await s.ask('bramble', 'Every warren on the downs, as one.', ['THUMP!']);
  await thump(s, 3);
  s.shake(1.2, 2);
  await s.wait(1.0);
  s.ambience('hum', 0.12);
  await s.narrate('And from far, far down the hole comes an answer: a long, low, contented rumble, like a cat purring under the hills.');
  s.sfx('wake-chime', { vol: 0.8 });
  await s.say('yarrow', 'There. It heard. Sleeping like a kit, and glad of the company.');
  await s.say('gault', '...My paws are quiet. Listen to that. Everything\'s quiet but the purring.');
  await s.say('chip', 'Dad! Dad, it PURRED!');
  await chime(s, { tansy: 'Thump if you\'re lonely. I\'m going to come and thump it every week. Not because I\'m lonely. Because it\'s nice.', rumble: 'Rumble thumps too! ...Rumble thumped too hard. Sorry, hole.', pip: 'It purred at ME. I\'m almost sure it purred at me.', burdock: 'Hmph. Good stone.', ninefold: 'It said thank you. In the deep way. I heard it in nine places.', _: '' });
  await s.say('captain-quarry', 'Right! Everybody UP! There\'s a feast in the bowl, and if I\'m not first to it I\'ll start humming again.');
  s.ambience('hum', 0);
  s.set('g_c6_done');
  s.music('m-sunset');
  await s.warp('c4-flintcomb', 12, 12, 'se');
  await s.wait(0.6);
  await s.narrate('Up in the bowl, the sun is going down gold. Where the heaps were, the chalk has gone green, and the dandelions are out.');
  await s.picture('bg-epilogue', ['Flintcomb, at the end of a long day\'s digging.', 'Every warren on the downs, round one cloth of clover. Rumble, a hill with kits on.', 'Somewhere far below, under a new stone, the hills purr.'], {});
  s.remember('mem-flintcomb');
  await s.say('knapper', 'EH? Bramble! Here. Chips off the stone. I knapped you one into a heart. Don\'t tell anyone I\'m soft.');
  await s.give({ 'knappers-flint': 1 });
  await s.say('captain-quarry', 'Flintcomb, rebuilt. Upward. Come back whenever you like. There\'ll always be a bed, and it\'ll always be up.');
  s.quest(nextStep());
  s.save();
}
async function stone(s) {
  await s.narrate('The Top Stone. DIG NO DEEPER THAN THIS. THUMP IF YOU\'RE LONELY.');
  const c = await s.ask('bramble', 'Bramble puts a paw on the stone.', ['Thump.', 'Remember the feast.', 'Leave it.']);
  if (c === 0) { await thump(s, 2); s.ambience('hum', 0.1); await s.narrate('Far down the hole, the hills purr back.'); s.ambience('hum', 0); }
  else if (c === 1) await s.picture('bg-epilogue', ['Flintcomb, at the end of a long day\'s digging.', 'Every warren on the downs, round one cloth of clover.', 'Somewhere far below, under a new stone, the hills purr.'], {});
}

// ---------------------------------------------------------------- people
const LINES = {
  'c6-ws': { who: 'ws', pre: ['Barley sent his hay-cart. Said: "Bedding. Flintcomb took our harvest once. They can sleep on it now." Then he laughed for a week.'], post: ['The straw\'s all in the new nests. Wheatsheaf straw, Flintcomb nests. Barley says that\'s what peace smells like. Bit dusty.'] },
  'c6-sd': { who: 'sd', pre: ['Aster sent me to help. I\'ve mostly been telling Flintcomb where to put things. They\'ve mostly been putting them somewhere else.'], post: ['Our pigeons can see the green from Silverdown! A little green thumbprint on the white. Aster cried. Poetically.'] },
  'c6-kit1': { who: 'kit', pre: ['We\'ve got a NURSERY! With a window made of MORNING!'], post: ['I\'m going to sleep in the morning corner every night forever.'] },
  'c6-kit2': { who: 'kit', pre: ['The larder\'s full of roots! I\'m not allowed in. I went in.'], post: ['I ate a whole apple. It wasn\'t flint. I checked first.'] },
  'c6-kit3': { who: 'kit', pre: ['The Captain cried in his den. He said it was dust. It was crying. I know crying.'], post: ['The Captain\'s den has a chair. The Captain fell asleep in it at lunchtime. We drew whiskers on him. He has whiskers already.'] },
  'c6-mum': { who: 'mum', pre: ['I\'m Marl. The Captain\'s mum. Yes, he had one. He was a terrible kit. Dug through my larder twice.', 'He\'s a good boy. Don\'t tell him I said so. He\'ll get loud.'] },
  'c6-larder': { who: 'buck', pre: ['Cold as a well in here. Perfect for roots. I\'ve put one root on every shelf so they don\'t get lonely.'] },
  'c6-nurse': { who: 'doe', pre: ['Twelve nests, and the morning comes in at the top. Twelve kits in them, nearly. Chip\'s still holding out.'], post: ['Every nest full. Even Chip. Especially Chip. His dad sings him to sleep. Badly. Upward.'] },
  'c6-kit-a': { who: 'kit', pre: ['This is the Captain\'s den and I\'m the Captain now. DEEPER! ...I mean UPPER! UPPER, everyone!'] },
  'c6-kit-b': { who: 'kit', pre: ['The sun comes in that crack! I\'m going to sit in it. All day. I\'m sitting.'] },
  'c6-gault': { who: 'gault', pre: ['Paws quiet. Kit fed. Clover in a bowl that never grew anything. Pinch me. Gently.'] },
  'c6-chip': { who: 'chip', pre: ['My dad dug me a bed! It\'s lumpy and it goes UP. It\'s the best bed in Flintcomb.'] },
};
async function talk(s, a) {
  const L = LINES[a.id]; if (!L) { await s.narrate('They smile, and go back to work.'); return; }
  const list = (done() && L.post) || L.pre;
  const k = 'c6_talk_' + a.id, n = s.val(k) || 0; s.set(k, n + 1);
  await s.say(L.who, list[n % list.length]);
}
async function quarry(s) {
  if (done()) { await s.say('captain-quarry', 'Clover, in Flintcomb! Rabbits from every warren, round one cloth! If anyone hums, it\'s me, and it\'s a song.'); return; }
  await s.say('captain-quarry', 'Busy, busy! Up, everyone, UP!');
  await s.say('captain-quarry', nextStep().replace('Rebuild Flintcomb: ', 'Still to do: ').replace('(Rumble)', '(get Rumble to shove)'));
}
async function knapper(s) {
  await s.say('knapper', 'EH? A feast? I KNOW it\'s a feast. I\'m sitting in it. Pass the carrots.');
}
const FRIEND = {
  burdock: ['Hmph. Quarry digs left paw leading. Still. After all that.', 'Hmph. Good burrows. Up ones. I\'ll allow it.'],
  mole: ['Spring-cleaning! In autumn! Whitewash, everywhere! Oh, bother whitewash! No, whitewash is lovely, actually.', 'Every wall white and every floor swept. Oh, I could live here. I won\'t. Mole End misses me. But I could.'],
  badger: ['Build on what\'s left. My city under the Wild Wood was empty for an age. It\'s only empty till somebody comes back.', 'Good work. Hard ground, good rabbits. I said so.'],
  tansy: ['They kept me in a flint pen just there. They\'ve turned it into a run for the kits to race round. I raced them. I won. Obviously.', 'Clover in Flintcomb. If you\'d told me that in the pen, Bramble, I\'d have laughed in your face.'],
};
async function friend(s, a) {
  const id = a.id.replace('c6-', ''); const L = FRIEND[id]; if (!L) return;
  await s.say(id, L[done() ? 1 : 0]);
}
async function shale(s) {
  if (done()) { await s.say('shale', 'Shale of Flintcomb, sleeping in the nursery corner I slept in as a kit. Somebody write THAT down.'); return; }
  await s.say('shale', 'I\'m Shale. Still. Every morning. I check.');
  await s.say('shale', nextStep().replace('Rebuild Flintcomb: ', 'The Captain\'s list says: '));
}
async function upburrowEnter(s) {
  if (!flag('c6_seen_upburrow')) {
    s.set('c6_seen_upburrow');
    await s.wait(0.3);
    await s.narrate('The New Burrows. Fresh chalk, a hall half dug, and five old alcoves walled up with flint in the year the spiral swallowed everything.');
    await s.narrate('Somewhere behind three of them are Flintcomb\'s old rooms. Nobody remembers which three.');
    await chime(s, { pip: 'Thump the walls! Yarrow taught me. If it goes BOOM, it\'s hollow!', 'captain-quarry': 'There\'s a tally-stone by the stair. My grandmother\'s. She always knew where everything was.', burdock: 'Hmph. Thump them. Listen.', _: 'By the stair stands an old carved tally-stone.' });
    quest(s);
    return;
  }
  s.ex.enterBubble();
}

const scripts = {
  'c6.hint': hint, 'c6.invite': invite, 'c6.arrive': arrive,
  'c6.rumble': rumbleTalk, 'c6.quarry': quarry, 'c6.knapper': knapper, 'c6.friend': friend, 'c6.talk': talk, 'c6.shale': shale, 'c6.pip': pip,
  'c6.tally': tally, 'c6.chip': chip, 'c6.gault': gault, 'c6.closing': closing, 'c6.stone': stone, 'c6.upburrow.enter': upburrowEnter,
};
for (const n of HEAPS) { scripts['c6.heap' + n] = s => heap(s, n); scripts['c6.patch' + n] = s => patch(s, n); }
for (const n of [1, 2, 3, 4, 5]) { scripts['c6.clock' + n] = s => clock(s, n); scripts['c6.alcove' + n] = s => alcove(s, n); }
export default scripts;
