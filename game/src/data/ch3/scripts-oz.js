// Chapter 3 scripts: Oz (the Munchkins and the Good Witch, the Tin Woodman, the Lion and the Kalidah chase, the
// Scarecrow and the Stork, the wildcat and the Queen of the Field Mice, the poppies, the Emerald City and the Wizard,
// the Winkie Country and the Witch, the Golden Cap, Glinda), the China Country, and the Stair of Eyes.
import { G } from '../../core.js';
import { flag, hasItem } from '../../state.js';

const said = (s, k) => { if (s.flag(k)) return true; s.set(k); return false; };
// the first travelling companion with a line in `lines` says it
async function chime(s, lines, fallback) {
  const p = s.party().filter(id => id !== 'bramble');
  for (const id of p) if (lines[id]) { await s.say(id, lines[id]); return id; }
  if (fallback) await s.say(fallback[0], fallback[1]);
  return null;
}
async function meetLion(s) {
  s.set('c3_lionMet');
  if (!s.actor('cowardly-lion')) s.spawn({ id: 'cowardly-lion', x: 20, y: 10, facing: 'se', talk: 'c3.lion.talk' });
  s.sfx('rumble'); s.shake(0.6, 3);
  await s.narrate('With a terrible roar, a great Lion bounds out of the trees onto the road, right in front of you!');
  const kid = s.member('pip') ? 'pip' : null;
  if (kid) { await s.say('pip', 'Eep!'); await s.narrate('The Lion swipes a paw at Pip. It doesn\'t touch him. It doesn\'t even come close. But Pip falls over backwards.'); }
  const c = await s.ask('bramble', kid ? 'Pip is sitting in the road, shaking.' : 'The Lion is snarling at the Tin Woodman.', ['Stand in front and boop him on the nose.', 'Shout "Don\'t you DARE!"']);
  if (c === 0) await s.narrate('You hop straight up to the Lion and boop him, very firmly, on the end of his great big nose.');
  else await s.say('bramble', 'Don\'t you DARE! Picking on someone smaller than you!');
  await s.say('cowardly-lion', 'Ow. OW. You didn\'t have to do that. I didn\'t touch him. I never touch anybody.');
  await s.say('cowardly-lion', '...I\'m a coward, you see. A great big coward. I roar so that nobody finds out. And now you\'ve found out.');
  await s.narrate('And the Lion sits down in the road and wipes his eyes on the tip of his tail.');
  await chime(s, { 'tin-woodman': 'Oh, don\'t cry. If you cry I shall cry, and I have only just been oiled.', pip: 'He\'s scared of US? But we\'re tiny!', tansy: 'A lion who\'s scared of rabbits. That\'s the best thing I\'ve heard all year.' });
  await s.say('bramble', 'We\'re going to see the Wizard. You could ask him for courage.');
  await s.say('cowardly-lion', 'Could I? Would he? Oh, I should like that more than anything. Only... the road goes over the Kalidah ditch. Kalidahs, you know. Bears with tiger heads.');
  await s.say('cowardly-lion', 'I\'ll come anyway. My knees will knock all the way, but I\'ll come.');
  s.quest('Cross the Kalidah ditch to the east, on the fallen tree.');
}
const bubbleOne = (s, lines) => { const p = s.party().filter(id => id !== 'bramble' && lines[id]); if (p[0]) s.bubble(p[0], lines[p[0]]); };

export const ozScripts = {
  // ---------------- the Munchkin Country
  'c3.munchkin.enter': async (s) => {
    if (!said(s, 'c3_munchSeen')) {
      s.set('c3_ozVisited');
      await s.narrate('BUMP. The house settles with a groan, crooked, in the middle of the bluest meadow you have ever seen.');
      await s.narrate('Blue grass. Blue fences. Little round blue houses with domed roofs. And the sky is so bright it makes your eyes water.');
      await s.say('bramble', 'Where... where are we?', { mood: 'worried' });
      await chime(s, {
        pip: 'Bramble! The grass is BLUE! Is it supposed to be blue? Can you eat blue grass?',
        'jade-rabbit': 'This is not the moon, and it is not the downs. But it is very beautiful.',
        tansy: 'Well. That was the worst burrow-tumble of my life. Where\'s the ground gone? Oh. It\'s blue.',
        toad: 'A FLYING HOUSE! Poop-poop! I must have one! Where does one buy a flying house?',
        mole: 'Oh my. Oh my word. Blue! Everything\'s blue! I think I need to sit down.',
      });
      s.music('m-oz');
      await s.wait(0.3);
      s.emote('c3-munch-1', '!'); s.emote('c3-munch-3', '!');
      await s.say('munchkin', 'It\'s come down again! Another one! Everybody, the sky\'s dropping houses again!');
      await s.say('good-witch', 'Hush, now, hush. Let the little traveller get their breath.');
      s.quest('Talk to the Good Witch of the North, by the fallen house.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.goodwitch.talk': async (s) => {
    if (s.flag('c3_kissed')) {
      await s.say('good-witch', 'Follow the road of yellow brick, little one. It goes all the way to the Emerald City.');
      await s.say('good-witch', 'No one will harm you while you wear my mark. Well. Most no-ones.');
      return;
    }
    await s.say('good-witch', 'Welcome to the land of the Munchkins, small furry stranger. I am the Witch of the North.');
    await s.say('bramble', 'A witch? Are you... the wicked kind?');
    await s.say('good-witch', 'Oh, no, dear. I am a good witch. The people love me. There are only two wicked ones left now, and one of those is gone.');
    await s.say('good-witch', 'A house fell out of the sky a little while ago, right on top of the Wicked Witch of the East. All that was left were her shoes.');
    await s.say('munchkin', 'And now the sky has dropped a rabbit. It\'s been a very strange month.');
    await s.say('bramble', 'I\'m Bramble. I came through a whirl of dust under Wheatsheaf. We\'re trying to stop the Hum, the bad dream under the ground.');
    await s.say('good-witch', 'A dream under the ground... yes. Even here, the deepest roots of the trees have been restless. The Munchkins dream of humming.');
    await s.say('good-witch', 'I am not wise enough to help you. But Oz is. The Great Wizard, in the Emerald City, at the end of the yellow brick road.');
    await s.say('munchkin', 'Take the shoes! Take them! The Witch of the East wore them, and they frighten us, and you\'ve come out of the sky like a hero.');
    s.sfx('shimmer');
    await s.give({ 'silver-shoes': 1 });
    s.set('c3_shoes');
    await chime(s, {
      pip: 'They\'re SHINY. Bramble, you\'ve got shiny feet!',
      tansy: 'Silver shoes on a rabbit. Now I\'ve seen everything. They suit you. Don\'t tell anyone I said that.',
      'jade-rabbit': 'There is old magic in them. Quiet magic, like moonlight on water.',
    });
    await s.say('good-witch', 'There is a charm in those shoes, though I never learned what it is. Now hold still.');
    const c = await s.ask('bramble', 'The Good Witch bends down toward you.', ['Hold very still.', 'Twitch your nose nervously.']);
    s.sfx('wake-chime', { vol: 0.6, pitch: 1.3 });
    await s.narrate('She kisses you, very lightly, on the forehead. Where her lips touched, a round shining mark is left.');
    if (c === 1) await s.say('good-witch', 'There. That didn\'t hurt, did it? Your nose is still going like a little bellows.');
    await s.say('good-witch', 'No one will dare to harm a creature kissed by the Witch of the North. Go well, Bramble.');
    s.set('c3_kissed');
    s.quest('Follow the road of yellow brick east, toward the Emerald City.');
  },
  'c3.munchkin.notyet': async (s) => { await s.say('munchkin', 'Oh, you mustn\'t go yet! The Good Witch wants a word with you. She\'s just there, by the house.'); s.place('bramble', 26, 12, 'nw'); },
  'c3.munchkin.sign': async (s) => { await s.narrate('A blue signpost. One arm says EMERALD CITY, and has a little drawing of a very green building. The other says HOME, and points at the sky.'); },
  'c3.munchkin.1': async (s) => {
    if (!s.flag('c3_kissed')) { await s.say('munchkin', 'Are you a witch? You came out of the sky. Only witches and houses come out of the sky.'); return; }
    await s.say('munchkin', 'The road of yellow brick! Mind the bits where it\'s broken. And mind the forest. And the river. And the... well, mind everything.');
  },
  'c3.munchkin.2': async (s) => {
    await s.say('munchkin', 'We\'re having a feast tonight because the Wicked Witch of the East is gone. You\'re welcome to stay. There\'s blue cake.');
    if (s.member('pip')) await s.say('pip', 'Blue CAKE?!');
  },
  'c3.munchkin.3': async (s) => { await s.say('munchkin', 'My grandmother says the ground has been humming at night. She says it\'s the hills snoring. I don\'t think hills snore.'); await s.say('bramble', 'Sometimes they do. That\'s what we\'re trying to fix.'); },
  'c3.munchkin.4': async (s) => { await s.say('munchkin', 'Have you met the Wizard? Nobody\'s met the Wizard. Not even the people who\'ve met him.'); },
  'c3.oz.whirlback': async (s) => {
    const c = await s.ask('bramble', 'The little whirl of dust is still turning here. It smells of Wheatsheaf.', ['Step into it (back to the Underway).', 'Not yet.']);
    if (c !== 0) { s.place('bramble', 3, 12, 'se'); return; }
    s.sfx('whoosh'); s.shake(0.6, 2);
    await s.warp('c3-underway', 'cyclone');
  },

  // ---------------- the forest: the Tin Woodman, the Lion, the Kalidah chase
  'c3.forest.enter': async (s) => {
    if (!said(s, 'c3_forestSeen')) {
      await s.narrate('The road runs into a forest. The trees close overhead and the yellow bricks go dim and mossy.');
      await chime(s, { pip: 'It\'s dark in here. I\'m not scared. Are you scared? I\'m a little bit scared.', tansy: 'I don\'t like trees this close. You can\'t see what\'s coming.', badger: 'Hmph. A wood is a wood. Keep to the path.', 'jade-rabbit': 'Listen. Someone is groaning, deeper in.' });
      await s.narrate('From somewhere off the road comes a sound: a long, creaking groan, like a gate that wants oiling.');
      s.quest('Find out who is groaning in the clearing north of the road.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.tin.talk': async (s) => {
    if (!s.flag('c3_tinMet')) {
      s.set('c3_tinMet');
      await s.narrate('A man made entirely of tin stands in the clearing with his axe raised over his head. He does not move. Only his eyes do.');
      await s.say('tin-woodman', 'Mmmh. Mmmmh. Oil. Can.');
      await s.say('bramble', 'Oil? You need oil? Where?');
      await s.say('tin-woodman', 'Cott... age. Shelf. Mmmh.');
      s.quest('Find the oil-can in the woodman\'s clearing (by the hollow log) and oil the Tin Woodman.');
      return;
    }
    if (!s.flag('c3_oilcan')) { await s.say('tin-woodman', 'Oil. Can. Mmmh. Table.'); return; }
    await s.narrate('You oil his jaw first, then his neck, then each elbow, then every joint down to his toes.');
    s.sfx('shimmer');
    await s.say('tin-woodman', 'Ahhh. Oh, that is a great comfort. I have been standing with my axe in the air for a year, or more.');
    await s.say('tin-woodman', 'A rainstorm caught me, and I rusted solid. I could not even weep about it, or I would have rusted worse.');
    await s.say('tin-woodman', 'I was once a man of meat, you know, until an enchanted axe chopped me to bits, and a tinsmith mended me.');
    await s.say('tin-woodman', 'He did a fine job. But he forgot to give me a heart. And so I have been very careful ever since, in case I am unkind by accident.');
    await s.say('bramble', 'You don\'t seem unkind. You seem very kind.', { mood: 'happy' });
    await s.say('tin-woodman', 'Do I? Oh dear. Oh, I must not cry. Pass me that oil-can again, would you? Just in case.');
    await chime(s, { pip: 'He\'s crying oil! No, water. Quick, the can!', tansy: 'A tin man with no heart who cries at being called kind. Right. I like him.', mole: 'Oh, the poor dear fellow. Here, let me dab at your jaw.' });
    await s.say('bramble', 'We\'re going to the Emerald City, to the Wizard. Come with us. Maybe he can help you too.');
    await s.say('tin-woodman', 'A heart! He might give me a heart. Yes. I will come, and I will chop every branch that stands in your way, and nothing else, ever.');
    await s.recruit('tin-woodman', { line: 'I shall be very careful never to hurt anything. Except branches.' });
    if (!s.actor('cowardly-lion')) s.spawn({ id: 'cowardly-lion', x: 20, y: 10, facing: 'sw', talk: 'c3.lion.talk' });
    s.quest('Follow the yellow brick road east through the forest.');
  },
  'c3.tin.oilcan': async (s) => {
    if (s.flag('c3_oilcan')) { await s.narrate('A rough wooden table, scattered with wood chips. Nothing else.'); return; }
    s.set('c3_oilcan');
    await s.narrate('On a rough table in the clearing, among the wood chips: an oil-can, a little rusty, but still full.');
    s.sfx('chest-open'); s.toast('Got the oil-can!');
    if (!s.flag('c3_tinMet')) await s.say('bramble', 'Somebody\'s oil-can. I wonder whose.');
  },
  'c3.lion.talk': async (s) => {
    if (!s.flag('c3_lionMet')) { await meetLion(s); return; }
    await s.say('cowardly-lion', 'Is it... is it the ditch? We have to cross the ditch? Oh, my whiskers are shaking.');
    await s.say('cowardly-lion', 'I\'ll come. I\'ll come. Just... let me go last. No, first. No. In the middle.');
  },
  'c3.ditch.edge': async (s) => {
    s.place('bramble', 23, 11, 'se');
    if (!s.flag('g_recruit_tin-woodman')) {
      await s.narrate('The road ends at a ditch so deep you can hear a stream far below. A single tree has fallen across it: a narrow, wobbly bridge.');
      await s.narrate('Off in the forest on the other side, something very large growls. It would be a bad idea to cross without more friends.');
      s.place('bramble', 22, 11, 'nw');
      return;
    }
    if (!s.flag('c3_lionMet')) await meetLion(s);
    await s.narrate('A ditch so deep you can hear a stream far below. A single fallen tree lies across it.');
    await s.say('tin-woodman', 'Over you go, small friend. I will come last, with my axe, in case anything follows.');
    await s.move('bramble', [[24, 11], [25, 11], [26, 11], [27, 11]], 0.3);
    s.sfx('bridge-creak');
    await s.wait(0.3);
    s.spawn({ id: 'c3-kal-a', sprite: 'kalidah', x: 20, y: 11, facing: 'se' });
    s.spawn({ id: 'c3-kal-b', sprite: 'kalidah', x: 21, y: 12, facing: 'se' });
    s.sfx('alert-horn', { vol: 0.5 });
    s.shake(0.5, 2);
    await s.narrate('A terrible snarling! Two beasts burst out of the trees: bodies like bears, heads like tigers. Kalidahs!');
    await s.say('cowardly-lion', 'Oh no oh no oh no. Kalidahs. They\'ll... they\'ll... they\'ll...');
    s.place('cowardly-lion', 23, 11, 'nw');
    s.face('cowardly-lion', 'nw');
    await s.narrate('The Lion turns round on the very edge of the ditch. His knees are knocking. And he ROARS.');
    s.sfx('rumble'); s.shake(0.8, 4);
    await s.narrate('It is a tremendous roar. The Kalidahs skid to a stop. The Lion looks more surprised than anybody.');
    await s.say('cowardly-lion', 'Did... did I do that?');
    await s.say('tin-woodman', 'Hold them a moment more! I need only a few chops!');
    s.place('cowardly-lion', 27, 12, 'nw');
    s.place('tin-woodman', 26, 11, 'nw');
    const r = await s.battle('c3.kalidah-chase');
    if (r !== 'win') return;
    s.sfx('bridge-crash'); s.shake(0.6, 3);
    s.remove('c3-kal-a'); s.remove('c3-kal-b');
    await s.narrate('CRASH! The tree tumbles into the ditch, Kalidahs and all. Far below there is a splash, and a lot of very grumpy grumbling.');
    await s.say('cowardly-lion', 'They\'re... they\'re gone. Are they hurt? I didn\'t want them hurt. Just elsewhere.');
    await s.say('tin-woodman', 'Only wet. And cross. I made very sure.');
    await s.say('bramble', 'You roared at two Kalidahs! You were amazing!', { mood: 'happy' });
    await s.say('cowardly-lion', 'I was terrified the whole time. My heart was going like a drum.');
    await s.say('bramble', 'Being scared and roaring anyway... I think that\'s what courage is.');
    await s.say('cowardly-lion', 'Is it? Is it really? I shall have to ask the Wizard. He\'d know. Can I come with you? I\'ll ask him for courage. Proper courage. In a bottle.');
    await s.recruit('cowardly-lion', { line: 'I\'ll roar for you. Probably. If my knees let me.' });
    s.remove('cowardly-lion');
    s.place('tin-woodman', 26, 11, 'nw');
    await s.narrate('The Tin Woodman fells a second, stouter tree across the ditch, so that the way home stays open. Then he wipes his eyes, very carefully.');
    s.ex.buildFollowers(true);
    s.set('c3_chaseDone');
    s.quest('Follow the road east to the river.');
  },

  // ---------------- the river: the Scarecrow and the Stork, the wildcat and the Queen of the Field Mice
  'c3.river.enter': async (s) => {
    if (!said(s, 'c3_riverSeen')) {
      await s.narrate('A broad river, too deep to hop. Somebody has left a raft tied up at the near bank.');
      await s.narrate('And in the middle of the river, clinging to a pole stuck in the riverbed, is a man made of straw.');
      await s.say('scarecrow', 'Hullo! Hullo the bank! You wouldn\'t happen to have a long arm about you? Or a short boat?');
      s.quest('Help the Scarecrow off his pole in the middle of the river.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.scarecrow.pole': async (s) => {
    await s.say('scarecrow', 'I was poling the raft across, and the pole stuck, and I held on, and the raft didn\'t. A bad idea, in hindsight.');
    await s.say('scarecrow', 'I haven\'t any brains, you see. Only straw. That bird on the bank might help, if you ask her nicely. I never think of asking nicely.');
  },
  'c3.stork.talk': async (s) => {
    await s.say('stork', 'Good day. I am on my way home to my nest, and I am in rather a hurry.');
    const c = await s.ask('bramble', 'The Stork looks down her long beak at you.', ['Could you lift the Scarecrow off his pole? Please?', 'Our friend is stuck. We\'d be ever so grateful.']);
    await s.say('stork', c === 0 ? 'A straw man? Well. He can\'t weigh much. Straw never does.' : 'Grateful, you say? I do like grateful. Very well.');
    s.sfx('wings');
    await s.move('stork', [[12, 7], [13, 7], [14, 8]], 0.25);
    await s.narrate('The Stork flaps out over the water, takes the Scarecrow by the arm in her beak, and heaves.');
    s.remove('scarecrow');
    await s.move('stork', [[13, 8], [12, 8]], 0.3);
    s.spawn({ id: 'scarecrow', x: 12, y: 9, facing: 'ne', talk: 'c3.scarecrow.pole' });
    s.ex.map.props = s.ex.map.props.filter(p => p.id !== 'prop-scarecrow-pole');
    s.emote('scarecrow', 'heart');
    await s.say('scarecrow', 'Dry land! Well, damp land. Thank you, madam. Thank you, rabbit. I would think of a better thank-you if I had any brains.');
    await s.say('stork', 'You\'re very welcome. Do try not to hold on to poles in rivers.');
    s.sfx('wings');
    s.remove('stork');
    await s.say('scarecrow', 'Where are you going? The Emerald City? Oh, may I come? The Wizard might give me some brains.');
    await chime(s, { 'tin-woodman': 'And a heart for me! What a pair we shall be. Brains and a heart.', pip: 'I\'ve got brains! Do you want to borrow some? I\'m using them, though.', tansy: 'If brains were straw, you\'d have plenty. Come on, then, scarecrow.' });
    await s.recruit('scarecrow', { line: 'I may not have brains, but I can stand in a field for a very long time.' });
    s.remove('scarecrow');
    s.set('c3_storkDone');
    s.quest('Cross the river on the raft and follow the road east.');
  },
  'c3.river.raft': async (s) => {
    await s.say('bramble', 'We can\'t just leave him stuck out there.');
    s.place('bramble', 12, 12, 'nw');
  },
  'c3.wildcat': async (s) => {
    s.spawn({ id: 'c3-mouse', sprite: 'mouse-queen', x: 22, y: 16, facing: 'nw' });
    s.spawn({ id: 'c3-wildcat', sprite: 'wildcat', x: 23, y: 18, facing: 'nw' });
    s.sfx('scamper');
    await s.move('c3-mouse', [[22, 15], [22, 14], [22, 13]], 0.16);
    await s.move('c3-wildcat', [[23, 17], [23, 16], [23, 15]], 0.16);
    s.emote('c3-mouse', '!');
    await s.narrate('A little grey field mouse comes racing across the grass, and behind her, ears flat, a great yellow wildcat!');
    await s.say('mouse-queen', 'Help! Oh, help!');
    await s.say('tin-woodman', 'I cannot hurt it. But I can stand in its way. Stay behind me, small one.');
    const r = await s.battle('c3.wildcat');
    if (r !== 'win') return;
    s.remove('c3-wildcat');
    await s.narrate('The wildcat decides that a mouse is not worth all this fuss, and stalks off into the long grass with its tail in the air.');
    await s.say('mouse-queen', 'Thank you. Oh, thank you. You must forgive me, I am quite out of breath. I am the Queen of the Field Mice.');
    await s.say('mouse-queen', 'You have saved my life. If ever you need help, call my people. There are thousands of us in the grass by the poppy field.');
    await chime(s, { pip: 'A queen! A real queen! Are you allowed to be that small and a queen?', tansy: 'Thousands of mice. Hm. That might come in handy.', 'tin-woodman': 'I am so glad I did not hurt the cat. Or the mouse. Or anyone.' });
    s.remove('c3-mouse');
    s.set('c3_mouseSaved');
    s.quest('Follow the road east, past the poppy field, to the Emerald City.');
  },

  // ---------------- the poppies
  'c3.poppies.enter': async (s) => {
    if (!said(s, 'c3_poppiesSeen')) {
      await s.narrate('Poppies. A great field of them, scarlet as a sunset, on both sides of the road. The scent is heavy and sweet.');
      await chime(s, { pip: 'They smell like bedtime.', 'jade-rabbit': 'Careful. There is a sleep in these flowers that is older than the flowers.', tansy: 'Pretty. Too pretty. Like it\'s trying.' });
      return;
    }
    s.ex.enterBubble();
  },
  'c3.poppies.sleep': async (s) => {
    await s.narrate('The scent of the poppies gets thicker with every hop. Your eyes feel heavy. Your paws feel heavy.');
    await chime(s, { pip: 'Bramble... I\'m just going to... have a little sit...', tansy: 'Don\'t you dare fall asleep, Bramble, or I... I\'ll... yawn...', 'jade-rabbit': 'Keep walking... keep... walking...' });
    await s.say('bramble', 'Just a little... rest...', { mood: 'worried' });
    s.music(null);
    await s.fadeOut(1.4);
    await s.picture('bg-battle-oz-road', ['Everyone falls asleep among the poppies. Only the Tin Woodman, who does not breathe, stays awake.', 'He cannot carry everyone. So he calls, as loudly as a tin man can.', 'And out of the grass come mice. Hundreds of mice. Thousands of mice, with their Queen at their head.', 'They tie threads to every paw and every ear, and they pull, all together, out of the poppies and into the clean air.'], { skippable: true });
    s.remember('mem-poppies');
    s.place('bramble', 29, 12, 'sw');
    s.ex.cam = s.ex.camTarget(); s.ex.camX = s.ex.cam.x; s.ex.camY = s.ex.cam.y;
    await s.fadeIn(0.8);
    s.music('m-oz');
    s.spawn({ id: 'mouse-queen', x: 28, y: 13, facing: 'ne' });
    s.spawn({ id: 'c3-mice-a', sprite: 'caroller', x: 27, y: 11, facing: 'ne' });
    s.spawn({ id: 'c3-mice-b', sprite: 'caroller', x: 27, y: 14, facing: 'ne' });
    await s.narrate('You wake on the soft grass beside the road, with the poppies behind you, and a great many small faces peering at you.');
    await s.say('mouse-queen', 'There. Awake at last. You saved my life by the river, and now my people have saved yours. That is how it ought to go.');
    await s.say('bramble', 'Thank you. All of you. I didn\'t know mice could pull a whole party.', { mood: 'happy' });
    await s.say('mouse-queen', 'One mouse cannot. A thousand can. You should remember that, little rabbit. It will matter, where you are going.');
    await chime(s, { pip: 'A thousand mice pulled me by the ears! I want to do it again! No I don\'t.', tansy: 'I was not asleep. I was resting my eyes. With some snoring.', 'jade-rabbit': 'All those small hands, pulling together. That is a thing I will keep.' });
    await s.say('mouse-queen', 'Wherever you go, we will come. Our court is in the grass on the far side of the poppies. You may rest there whenever you like.');
    await s.recruit('mouse-queen', { line: 'One mouse cannot. A thousand can.' });
    s.remove('mouse-queen'); s.remove('c3-mice-a'); s.remove('c3-mice-b');
    s.set('c3_poppiesDone');
    s.quest('Follow the yellow brick road east to the Emerald City.');
  },
  'c3.poppies.sign': async (s) => { await s.narrate('EMERALD CITY, this way. Underneath, smaller: "Do NOT nap in the poppies."'); },
  'c3.mousequeen.court': async (s) => {
    await s.say('mouse-queen', 'Welcome to our court. It is only grass and clover, but it is ours. Rest by the stone, if you are weary.');
    if (s.flag('c3_witchMelted')) await s.say('mouse-queen', 'They say the Witch of the West is a puddle now. My people have been dancing for two nights.');
  },
  'c3.mouse.1': async (s) => { await s.say('mouse', 'I pulled your left ear! The left one! Do you remember? You were snoring.'); },
  'c3.mouse.2': async (s) => { await s.say('mouse', 'The poppies don\'t make us sleepy. We\'re too small for them to notice. Being small is very useful.'); if (s.member('pip')) await s.say('pip', 'That\'s what I always say!'); },
  'c3.mousequeen.city': async (s) => { await s.say('mouse-queen', 'We came to the city for the celebration. Thousands of us. The Guardian had to lock up all the cheese.'); },

  // ---------------- the Emerald City and the Wizard
  'c3.emerald.enter': async (s) => {
    if (!s.flag('c3_specs')) {
      await s.narrate('A great green wall rises across the road, with a great green gate in it. Beside the gate stands a little man dressed all in green.');
      await s.say('guardian', 'Halt! I am the Guardian of the Gates. What do you wish in the Emerald City?');
      await s.say('bramble', 'We\'ve come to see the Great Oz. About a bad dream under the ground.');
      await s.say('guardian', 'It has been many years since anyone asked to see Oz. He is powerful and terrible, and if you come on a silly errand, he may be cross.');
      await s.say('guardian', 'But first: spectacles. Everyone in the city wears them, or the glory of the place would blind you.');
      await s.narrate('He fits a pair of green spectacles on your nose and locks them on with a tiny golden key. Everything turns a deep, glowing green.');
      await chime(s, { pip: 'Bramble, you look like a cabbage! I bet I do too!', tansy: 'Green. Very green. Is anything actually green, or is it just the glasses?', 'tin-woodman': 'How lovely. I am a green tin man now.', 'jade-rabbit': 'The city is bright. Whether it is truly green, I cannot say.' });
      s.set('c3_specs');
      s.quest('Go up the main street to the palace and ask to see the Wizard.');
      return;
    }
    if (s.flag('c3_witchMelted') && !s.flag('c3_humbug') && !said(s, 'c3_backFromWest')) {
      await s.narrate('The Winged Monkeys set everyone down in the middle of the city, bow, and wheel away into the sky.');
      await s.say('guardian', 'You have come back! And the Witch? Melted?! Oz will want to hear this. Go straight to the palace.');
      s.quest('Go to the palace and tell the Wizard the Witch is gone.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.guardian.talk': async (s) => {
    if (s.flag('c3_humbug')) { await s.say('guardian', 'The Scarecrow rules the city now. He has a head full of bran-new brains. He tells me so every morning.'); return; }
    if (s.flag('c3_wizardMet')) { await s.say('guardian', 'The west gate leads to the Winkie Country. No one has ever come back from there. Mind you take a coat.'); return; }
    await s.say('guardian', 'The palace is straight up the main street. You can\'t miss it. Everything here is green, but it\'s the greenest.');
  },
  'c3.market': async (s) => { await s.say('munchkin', 'Emerald City Market! Cloaks, spectacles, axes, lozenges! Prices in emeralds, buttons gladly taken!'); await s.shop('c3.emerald-market'); },
  'c3.citizen.1': async (s) => {
    if (s.flag('c3_humbug')) { await s.say('munchkin', 'Did you hear? The Wizard is just a man! And the city is just... the city. Still lovely, though.'); return; }
    await s.say('munchkin', 'Nobody has seen the Wizard for years. Some say he is a great head. Some say a lady. Some say a ball of fire.');
  },
  'c3.citizen.2': async (s) => { await s.say('munchkin', 'Are your spectacles comfortable? Mine pinch. I\'ve worn them for thirty years. I\'m not sure what colour my house is.'); },
  'c3.palace.nospecs': async (s) => { await s.say('guardian', 'Not without spectacles! Come here, come here.'); },
  'c3.westgate.notyet': async (s) => { await s.narrate('The west gate is barred. A green soldier yawns and says nobody goes west without the Wizard\'s leave.'); },
  'c3.southgate.notyet': async (s) => { await s.narrate('The south-west gate leads to the Quadling Country. A green soldier says it is closed until the Wizard says otherwise.'); },
  'c3.palace.enter': async (s) => {
    if (!said(s, 'c3_palaceSeen')) {
      await s.narrate('A vast green room with a vaulted roof. In the middle stands a green marble throne. On the throne floats an enormous Head, with no body at all.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.wizard.talk': async (s) => {
    if (!s.flag('c3_wizardMet')) {
      s.sfx('rumble', { vol: 0.5 }); s.shake(0.4, 2);
      await s.say('wizard', 'I AM OZ, THE GREAT AND TERRIBLE. WHO ARE YOU, AND WHY DO YOU SEEK ME?', { voice: undefined });
      await s.say('bramble', 'I\'m Bramble, from Thimblebank Warren. Please, sir. There\'s a bad dream under the ground. It makes rabbits forget their names.');
      await s.say('wizard', 'WHERE DID YOU GET THE SILVER SHOES? AND THAT MARK UPON YOUR FOREHEAD?');
      await s.say('bramble', 'The Munchkins gave me the shoes. The Good Witch gave me the mark.');
      await s.say('wizard', 'HMM. HMM. VERY WELL. IN THIS LAND, NO ONE GETS SOMETHING FOR NOTHING.');
      await s.say('wizard', 'SEND THE WICKED WITCH OF THE WEST PACKING, AND I SHALL TELL YOU ALL I KNOW OF DREAMS.');
      await chime(s, { 'tin-woodman': 'Send someone packing? Oh dear. I suppose... if it is packing, and not chopping.', pip: 'Why does the head shout so much? Has it lost something?', tansy: 'Typical. You ask a simple question and get a quest.' });
      await s.say('wizard', 'GO! WEST! THE WINKIE COUNTRY! AND DO NOT RETURN UNTIL SHE IS GONE!');
      s.set('c3_wizardMet');
      s.quest('Leave by the city\'s west gate for the Winkie Country, and the Wicked Witch\'s castle.');
      return;
    }
    if (!s.flag('c3_witchMelted')) { await s.say('wizard', 'THE WITCH. THE WEST. THE PACKING OF THE WITCH. WHY ARE YOU STILL HERE?'); return; }
    // the humbug
    await s.say('wizard', 'YOU... HAVE RETURNED. ER. COME BACK TOMORROW. I MUST... THINK.');
    if (s.member('pip')) {
      await s.say('pip', 'Bramble, there\'s somebody behind that screen. I can hear him breathing. And his tummy rumbling.');
      await s.narrate('Pip hops over to the green screen in the corner and gives it a push. It topples over with a crash.');
    } else {
      await s.narrate('Something rustles behind the green screen in the corner. The Lion jumps, bumps the screen, and it topples over with a crash.');
    }
    s.sfx('bridge-crash', { vol: 0.5 });
    s.ex.map.props = s.ex.map.props.filter(p => p.id !== 'prop-palace-screen');
    s.spawn({ id: 'wizard', x: 10, y: 3, facing: 'sw', talk: 'c3.wizard.after' });
    s.remove('great-head');
    await s.narrate('Behind it stands a little old man with a bald head and a wrinkled face, holding a speaking-trumpet. He looks as surprised as you.');
    await s.say('wizard', 'Oh. Oh dear. Er. I am Oz, the Great and Terrible. But don\'t shout, please. Somebody will hear.');
    await s.say('bramble', 'You\'re not a great head at all. You\'re a man!', { mood: 'worried' });
    await s.say('wizard', 'I\'m afraid I am. Just a common man. A humbug. I came here in a balloon, long ago, and the people thought I was a wizard, and I let them.');
    await s.say('wizard', 'I am a very good man, I hope. But I am a very bad Wizard.');
    const c = await s.ask('bramble', 'He wrings his hands.', ['That\'s all right. You were honest in the end.', 'But we needed you!']);
    if (c === 0) await s.say('wizard', 'You\'re a kind little creature. Kinder than I deserve. Let me do what I can.');
    else await s.say('wizard', 'I know, I know. And I\'m sorry. Let me do what I can, which is a little, and which is honest.');
    await s.narrate('He pours something green and fizzing into a dish, and calls the Lion in.');
    await s.say('wizard', 'Drink. It is courage. Inside you, it will be courage. Courage is always inside, you know, but this helps it find the way.');
    await s.say('cowardly-lion', '...I feel... I feel FULL of courage! Bramble! Bramble, I could roar at a thousand Kalidahs!');
    await s.say('wizard', 'And the Scarecrow: brains. Bran, and pins, and needles. Very sharp. And he shall rule the city when I am gone.');
    await s.say('wizard', 'As for your dream under the ground... I know nothing of dreams. But Glinda the Good, in the south, knows everything about shoes.');
    await s.say('wizard', 'Those silver shoes have a charm in them. Go and ask her. The south-west gate is open to you.');
    s.set('c3_humbug');
    s.quest('Leave the city by the south-west gate and find Glinda in the Quadling Country.');
  },
  'c3.wizard.after': async (s) => {
    await s.say('wizard', 'I am making a balloon. Green silk. If it goes well, I shall float home to Omaha. If it goes badly, I shall float somewhere else.');
    await s.say('wizard', 'Go and see Glinda, little rabbit. She is a real witch, and a good one. I\'m only a good man, and that will have to do.');
  },
  'c3.scarecrow.city': async (s) => {
    await s.say('scarecrow', 'I have brains now! Bran-new ones! I have already had three thoughts today, and one of them was about rabbits.');
    await s.say('scarecrow', 'The Emerald Guard will march with you, Bramble. Clever soldiers. Well. Soldiers, anyway.');
  },
  'c3.lion.city': async (s) => {
    if (s.flag('c3_humbug')) { await s.say('cowardly-lion', 'I am FULL of courage. My knees hardly shake at all now. Only on Tuesdays.'); return; }
    await s.say('cowardly-lion', 'The city is very big. And very green. And full of people who might be dangerous. Ha. Ha. Just being careful.');
  },
  'c3.monkey.city': async (s) => {
    await s.say('monkey-king', 'The Cap has three wishes in it, little master, and you have used one. We fly when you call. Mind the other two.');
  },

  // ---------------- the Winkie Country and the Witch
  'c3.winkie.enter': async (s) => {
    if (!said(s, 'c3_winkieSeen')) {
      await s.narrate('The land turns yellow: yellow grass, yellow stones, yellow sky. Far to the west stands a castle with two yellow towers.');
      await s.narrate('On the highest tower, something glints. A telescope? An eye? It is looking straight at you.');
      await chime(s, { tansy: 'She knows we\'re here. Good. Saves knocking.', pip: 'Somebody\'s watching us. I can feel it in my ears.', 'tin-woodman': 'The Winkies are her slaves. Poor things. I should like to set them free.', 'jade-rabbit': 'That one eye has watched this country a long time. It is tired, and cruel.' });
      s.quest('Cross the Winkie Country to the Witch\'s castle in the west.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.winkie.1': async (s) => {
    if (s.flag('c3_witchMelted')) { await s.say('winkie', 'Free! We\'re free! We have asked the Tin Woodman to be our king, and he cried, and said yes!'); return; }
    await s.say('winkie', 'Shh! Don\'t let her hear! There are two buckets by the castle door, and a well in the scullery.');
    await s.say('winkie', 'She hates water. Hates it. She hasn\'t washed in a hundred years. Do with that what you will.');
  },
  'c3.winkie.2': async (s) => { await s.say('winkie', 'I was a soldier this morning. Now I\'m a tinsmith\'s apprentice. The Tin Woodman needs a lot of oiling.'); },
  'c3.winkie.3': async (s) => {
    if (s.flag('c3_witchMelted')) { await s.say('winkie', 'I\'ve been scrubbing her floors for twenty years. Today I\'m mopping HER up. Best day of my life.'); return; }
    await s.say('winkie', 'Fill your pails at the well, here in the scullery. Quick, while she\'s looking out of the window.');
  },
  'c3.castle.enter': async (s) => {
    if (!s.flag('c3_witchMelted') && !said(s, 'c3_castleSeen')) {
      await s.narrate('A dim yellow hall. At the far end, on a raised floor, a thin old woman with one eye and a silver whistle is pacing.');
      await s.narrate('By the door stand two wooden pails, full of water.');
      s.quest('Pick up the pails by the door, then face the Wicked Witch.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.pail.1': async (s) => { s.set('c3_pail1'); s.ex.map.props = s.ex.map.props.filter(p => !(p.id === 'prop-wash-bucket' && p.x === 9)); await s.give({ 'water-pail': 1 }); },
  'c3.pail.2': async (s) => { s.set('c3_pail2'); s.ex.map.props = s.ex.map.props.filter(p => !(p.id === 'prop-wash-bucket' && p.x === 12)); await s.give({ 'water-pail': 1 }); },
  'c3.well': async (s) => {
    if (s.flag('c3_witchMelted')) { await s.narrate('The old well. The Winkies have hung a sign on it: "Free water. Help yourself. Please splash."'); return; }
    const n = s.count('water-pail');
    if (n >= 3) { await s.narrate('The scullery well. Your pails are already full.'); return; }
    await s.narrate('The scullery well. You let the bucket down, haul it up, and fill a pail to the brim.');
    await s.give({ 'water-pail': 3 - n });
  },
  'c3.witch.talk': async (s) => {
    if (!s.flag('c3_witchMet')) {
      s.set('c3_witchMet');
      await s.say('wicked-witch', 'So. The little rabbit with the silver shoes. I watched you all the way from the river.');
      await s.say('wicked-witch', 'Give me those shoes. They should have been mine. My sister\'s shoes! Mine!');
      await s.say('bramble', 'They were given to me. And the Wizard sent us. You have to let the Winkies go.');
      await s.say('wicked-witch', 'Let them go? Let them GO? I have sent wolves after you, and crows, and soldiers, and now I shall do it myself!');
      await chime(s, { 'tin-woodman': 'Madam, I would very much prefer not to hurt you. Please be reasonable.', pip: 'She smells of dust. Like she\'s never ever had a bath.', tansy: 'Is she shouting at us or at the furniture? Hard to tell.' });
    }
    if (!s.has('water-pail')) { await s.say('bramble', 'Wait. Those pails by the door... and the well in the scullery. Let\'s get some water first.'); return; }
    const r = await s.battle('c3.witch');
    if (r !== 'win') return;
    s.sfx('splash-melt');
    await s.narrate('SPLASH! The Witch looks down at her feet, and she begins to shrink, and to sag, like brown sugar in the rain.');
    await s.say('wicked-witch', 'See what you have done! In a minute I shall be all melted! Didn\'t you know water would be the end of me?');
    await s.say('bramble', 'No! I\'m sorry! I didn\'t know it would be that bad!', { mood: 'worried' });
    await s.say('wicked-witch', 'Well. Never mind. I have been wicked a long, long time. It is a tiring thing to be. I think... I shall have a little rest...');
    s.remove('wicked-witch');
    await s.narrate('Where she stood there is only a brown puddle, a crumpled cloak, and a smell of old dust. The silver whistle rolls away under the cupboard.');
    s.take('water-pail', s.count('water-pail'));
    s.set('c3_witchMelted');
    s.music('m-oz');
    await s.narrate('All through the castle, doors bang open. Winkies come running, yellow coats flapping, cheering at the top of their voices.');
    await s.say('winkie', 'She\'s gone! She\'s a puddle! Oh, who\'s going to rule us now? Somebody kind, please, this time!');
    await s.say('tin-woodman', 'I... I would like that very much. If you would have me. A kind tin king. I shall oil my crown every day.');
    await s.say('winkie', 'Long live the Tin Woodman! He\'s crying again! Somebody fetch the oil!');
    s.quest('Look in the Witch\'s cupboard, at the back of the hall.');
  },
  'c3.cupboard': async (s) => {
    if (!s.flag('c3_witchMelted')) { await s.narrate('A tall black cupboard. The Witch is watching you with her one eye. Better not.'); return; }
    if (s.flag('c3_cap')) { await s.narrate('The Witch\'s cupboard: brooms, a spare umbrella, and a great many unwashed teacups.'); return; }
    s.set('c3_cap');
    s.ex.map.props = s.ex.map.props.filter(p => p.id !== 'prop-golden-cap');
    await s.narrate('In the cupboard, on a velvet cushion, lies a golden cap set with diamonds and rubies.');
    await s.give({ 'golden-cap': 1 });
    await chime(s, { pip: 'There\'s writing inside! Tiny writing! It says... Ep-pe, pep-pe, kak-ke! What does that mean?', tansy: 'There\'s writing in the lining. Some sort of chant. Say it, go on.' }, ['bramble', 'There\'s writing in the lining. A sort of chant.']);
    await s.narrate('You read the words aloud, standing on your left foot and then your right, as the lining says. Ep-pe, pep-pe, kak-ke! Hil-lo, hol-lo, hel-lo! Ziz-zy, zuz-zy, zik!');
    s.sfx('wings'); s.shake(0.6, 2);
    s.spawn({ id: 'monkey-king', x: 14, y: 8, facing: 'sw' });
    await s.narrate('The windows darken. The air fills with the rush of wings. A great band of monkeys pours into the hall, and the biggest one bows low.');
    await s.say('monkey-king', 'You have called us with the Golden Cap. Whoever holds it may command us three times. What is your wish?');
    const c = await s.ask('bramble', 'The Monkey King waits.', ['Carry us back to the Emerald City, please.', 'Why do you have to obey a cap?']);
    if (c === 1) {
      await s.say('monkey-king', 'Long ago we played a joke on a lady\'s husband and dropped him in a river. She was not amused. So: the Cap, and three wishes, forever.');
      await s.say('monkey-king', 'We were not always wicked, master. The Witch used us wickedly. You, I think, will not.');
      await s.say('bramble', 'Then... carry us back to the Emerald City, please. And after that, be free.');
    }
    await s.say('monkey-king', 'Free? You would... ha! We shall carry you, and gladly. And when you need wings, little master, call us. Not as a wish. As friends.');
    await s.recruit('monkey-king', { line: 'Not as a wish. As friends.' });
    s.sfx('wings');
    await s.fadeOut(0.6);
    await s.picture('bg-battle-emerald', ['The monkeys carry everyone up through the castle windows, over the yellow fields, over the poppies, all the way back to the Emerald City.'], { skippable: true });
    await s.warp('c3-emerald', 'monkeys');
  },

  // ---------------- the south: Glinda, the Hammer-Heads' hill
  'c3.south.enter': async (s) => {
    if (!said(s, 'c3_southSeen')) {
      await s.narrate('The Quadling Country. Everything here is red: the fences, the roofs, the little round people\'s coats. To the south, a palace glows white and gold.');
      await s.narrate('East of the road, a rocky hill bristles with flat-headed men who have no arms at all. To the north-west, a white china wall glints.');
      s.quest('Find Glinda at her palace in the south.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.south.sign': async (s) => { await s.narrate('South: GLINDA. East: HAMMER-HEADS (go round). North-west: CHINA COUNTRY (tread softly).'); },
  'c3.glinda.talk': async (s) => {
    if (s.flag('c3_glinda')) {
      await s.say('glinda', 'Three steps, Bramble. Knock your heels together and say where. They will take you anywhere, as long as you know the way home.');
      const c = await s.ask('bramble', 'Use the silver shoes?', ['Not yet.', s.flag('c3_princessMet') ? 'Back to Wheatsheaf\'s Underway.' : 'Yes: to Wheatsheaf\'s Underway (skips the China Country).']);
      if (c === 1) { s.sfx('shimmer'); await s.warp('c3-underway', 'stone'); }
      return;
    }
    await s.say('glinda', 'Welcome, little traveller. I have been expecting you. The mice told me, and the monkeys, and the Winkies. Oz is a very chatty country.');
    await s.say('glinda', 'You wish to know about your bad dream under the ground. And about the shoes.');
    await s.say('bramble', 'The Wizard said you\'d know. About the shoes, anyway.');
    await s.say('glinda', 'The silver shoes can carry their wearer anywhere at all. Three steps. A knock of the heels. And a place held firmly in your heart.');
    await s.say('glinda', 'Anywhere. Across the desert. Home to your warren. Even, I think, into a dream, if the dreamer were sleeping near enough.');
    await chime(s, { pip: 'Into a DREAM? Can I come?', tansy: 'Into the Sleeper\'s dream. Bramble. You\'re not thinking what I think you\'re thinking.', 'jade-rabbit': 'Into a dream... Chang\'e said the Sleeper\'s dreams leak upward. Perhaps a rabbit can walk down.', 'tin-woodman': 'Into a dream! Oh, I should be very careful, if I were you. And kind. Mostly kind.' });
    await s.say('glinda', 'You are not ready for that yet. The Sleeper lies very deep, and the way down is long. Go down first. Then the shoes will know where to take you.');
    await s.say('glinda', 'Beneath your Wheatsheaf, a stair goes down that has too many eyes. Its Watcher will not let you pass unseen. Go and be seen. And be brave.');
    s.set('c3_glinda'); s.set('g_c3_oz_done');
    s.quest('Use the silver shoes to go back to Wheatsheaf\'s Underway, then go down the Stair of Eyes.');
    // the full playthrough said yes and only later learned it had skipped the China Country: say so (calibration.md)
    await s.say('glinda', 'The China Country is just north-west of here, over the white wall, if you would like to see it first. It is not on your way, but it is lovely. The shoes will wait.');
    const c = await s.ask('bramble', 'Use the silver shoes now? (Yes skips the China Country, which is optional.)', ['Not yet: see the south and the China Country first.', 'Yes: knock your heels, back to the Underway now.']);
    if (c === 1) {
      await s.narrate('You knock your heels together, three times. The world turns once, like a page.');
      s.sfx('shimmer');
      await s.warp('c3-underway', 'stone');
    }
  },

  // ---------------- the China Country
  'c3.china.enter': async (s) => {
    if (!said(s, 'c3_chinaSeen')) {
      await s.narrate('Over the wall, everything is china: the ground, the little houses, the cows in the fields, the people no taller than your ear.');
      await s.narrate('The floor is thin as an eggshell. One step cracks it. Two steps on the same spot will break it right through.');
      await s.narrate('Your friends tuck in close behind you. Only your own paws touch the china. Tread softly, and never twice.');
      s.quest('Cross the china path to the Princess on her lawn. Step on each china tile only once.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.princess.talk': async (s) => {
    if (s.flag('c3_princessMet')) { await s.say('china-princess', 'Do mind the little gate on your way out. It\'s the only part of the wall that bends.'); return; }
    s.set('c3_princessMet');
    await s.say('china-princess', 'Oh! Don\'t come too close, please! If you bumped me I should chip, and then I should have to be mended, and never be pretty again.');
    await s.say('bramble', 'I\'ll be very careful. You\'re beautiful. Is it lonely, being made of china?');
    await s.say('china-princess', 'Lonely? Oh, no. Everyone here is made of china too. We are all very careful of each other. That is a kind of love, you know.');
    await s.say('china-princess', 'Some travellers want to carry us home, to sit on a mantelpiece. But there we should only be stiff, and stand still, and be looked at.');
    await s.say('china-princess', 'Here we can dance. So we stay here, where we can be ourselves.');
    const c = await s.ask('bramble', 'She curtseys, with a tiny clink.', ['Then I\'ll remember you dancing.', 'I wouldn\'t take you anywhere. Promise.']);
    await s.say('china-princess', c === 0 ? 'That is the nicest thing anyone has said to me in a hundred years.' : 'Then you may come again. Softly.');
    s.remember('mem-china');
    s.sfx('wake-chime', { vol: 0.5, pitch: 1.5 });
    await s.narrate('She points to a little gate in the china wall behind her lawn. It bends politely to let you through.');
    s.quest(s.flag('g_c3_oz_done') ? 'Go down the Stair of Eyes under Wheatsheaf.' : 'Find Glinda in the south.');
  },

  // ---------------- the Stair of Eyes
  'c3.stair.enter': async (s) => {
    s.chapter(3);
    if (!said(s, 'c3_stairSeen')) {
      await s.narrate('The stair goes down. And down. And then, when it ought to stop, down some more.');
      await s.narrate('The walls are carved with eyes. Rabbit eyes, bird eyes, eyes like no animal\'s. When you move, they follow you. When you stop, they wait.');
      await chime(s, { pip: 'Bramble. Bramble. Behind us. Did you hear footsteps? After ours?', 'tin-woodman': 'I do not like this place. I think it is sad, underneath being frightening.', tansy: 'There\'s an echo. Only it\'s late. Like something\'s copying us and can\'t keep up.', 'jade-rabbit': 'This is older than the warrens. It was carved for something that wanted to be watched.' });
      s.quest('Go down the Stair of Eyes to whatever waits at the bottom.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.stair.landing': async (s) => {
    await s.narrate('A wide landing. The light down here is faint and grey, and it seems to be getting fainter.');
    await chime(s, { pip: 'The light\'s going out when we stand still! Keep moving! Keep moving!', tansy: 'It goes dark when we stop. Right. So we don\'t stop.', 'jade-rabbit': 'The dark here is patient. Do not give it time.' }, ['bramble', 'The light dims when we stand still. Keep going.']);
  },
  'c3.watcher.talk': async (s) => {
    if (!s.flag('c3_watcherMet')) {
      s.set('c3_watcherMet');
      await s.narrate('At the bottom of the stair stands something tall and thin, taller than a tree, made all of shut eyelids, like a pine cone of eyes.');
      await s.narrate('One of the eyes opens. It looks at you. It is pale and blue, the colour of the Hum.');
      await s.say('watcher', 'SEEN.');
      await chime(s, { pip: 'It looked at me. Bramble, it LOOKED at me.', 'tin-woodman': 'Stand behind me, small friends. Tin is very hard to see through.', tansy: 'Don\'t let it open all of them. Hit the open ones. Go!' });
    }
    const r = await s.battle('c3.watcher');
    if (r !== 'win') return;
    s.set('c3_watcherDone');
    s.remove('watcher');
    s.sfx('fade-sigh');
    await s.narrate('One by one the Watcher\'s eyes close. It folds down into itself, and then there is nothing there but a draught.');
    await s.narrate('A breath of air comes up from below. Not cold, like the stair. Warm. Warm as a burrow in winter, and very, very slow, like breathing.');
    await chime(s, { 'jade-rabbit': 'That is breath. Something below us is breathing. Asleep.', pip: 'It\'s warm! Why is it warm? Is it... is something sleeping down there?', tansy: 'That\'s it, isn\'t it. That\'s the Sleeper. Breathing.', 'tin-woodman': 'If I had a heart, it would be beating very fast.' });
    await s.say('bramble', 'We\'re getting close. Flintcomb dug down, the old stories said. That\'s where the way goes on.');
    s.set('g_ch3_done');
    s.quest('Climb back up and go home to Thimblebank. The Lookout Stone will show the way to Flintcomb.');
    s.save();
  },
};
