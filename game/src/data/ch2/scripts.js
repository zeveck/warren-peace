// Chapter 2 story scripts: the Battle of Silverdown (RTS 2), Silverdown and waking Aster, Silverdown Depths and
// its Underway, the Moon (Wu Gang, the traveller, the Jade Rabbit, Chang'e, the Moon Hares, the Moth Queen, Wick)
// and the Drowned Halls (Tansy, the Tidewarden).
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { withNinefold } from '../ch1w/util.js';

// ---------------------------------------------------------------- helpers
const lines = async (s, list) => { for (const l of list) { if (!l) continue; const [who, text, o] = l; if (who) await s.say(who, text, o || {}); else await s.narrate(text); } };
const trav = (s, id) => s.party().includes(id);
// the first travelling companion with a line in the table says it
async function chime(s, table) {
  for (const id of s.party()) { if (id === 'bramble') continue; if (table[id]) { await s.say(id, table[id]); return id; } }
  if (table.any) { const id = s.party().find(i => i !== 'bramble'); if (id) await s.say(id, table.any); }
  return null;
}
const runIf = async (s, id) => { const f = G.data.scripts[id]; if (f) await f(s); };
// a free floor tile near (x, y) for staging someone
function freeNear(s, x, y) {
  const ex = s.ex;
  for (let r = 0; r < 5; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const tx = x + dx, ty = y + dy;
    if (tx === ex.b.x && ty === ex.b.y) continue;
    if (!ex.walkable(tx, ty) || ex.followers.some(f => f.x === tx && f.y === ty)) continue;
    return [tx, ty];
  }
  return [x, y];
}
// Wick is an escort; after a reload he picks up where he was (escorts aren't saved)
function wickBack(s) { if (flag('c2_wickFollows') && !flag('g_recruit_wick') && !s.escorting('wick')) s.escort('wick', true, { sprite: 'wick' }); }

function moonQuest() {
  if (flag('g_recruit_jade-rabbit')) return 'Back down the moonbeam stair: Tansy\'s tracks went to the drowned stair in the Underway.';
  if (flag('c2_mothQueen')) return 'Take the pestle back to the Jade Rabbit.';
  if (flag('c2_hares')) return 'Into the lantern grove beyond the crater warren: win back the Jade Rabbit\'s pestle.';
  if (flag('c2_metChange')) return 'Through the crater warren (east of the tree): ask the Moon Hares to help.';
  if (flag('c2_jadeTold')) return 'Climb to the Moon Palace (north of the tree) and ask Chang\'e to speak to the Moon Hares.';
  if (flag('c2_traveller') && flag('c2_metJade')) return 'Go back to the Jade Rabbit under the cassia tree.';
  if (flag('c2_metJade')) return 'Someone hungry is sitting by the path below the tree.';
  return 'Follow the sound of chopping to the great tree.';
}

export const scripts = {
  // ================================================================ RTS 2: THE BATTLE OF SILVERDOWN
  // run by the Lookout Stone (ch0) before the battle: the chapter card and a word from Chert
  'c2-rts2.intro': async (s) => {
    if (!flag('c2_card')) {
      s.set('c2_card'); s.chapter(2);
      await s.chapterCard('Silverdown and the Moon', 'Chapter 2', 'bg-battle-moon');
      await lines(s, [
        [null, 'North of Sorrel Down the chalk goes pale, almost white, and the hills are crowned with dovecotes. Silverdown.'],
        [null, 'Even from the Lookout Stone you can hear it: the humming, and under it the clatter of a thousand pigeon wings.'],
        ['bramble', 'Chert said they took Tansy on to Silverdown. So that\'s where we\'re going.'],
      ]);
      await chime(s, {
        badger: 'They keep pigeons, the Silverdown lot. Riders on their backs. If you build a wall, they\'ll simply fly over it. Mind that.',
        ratty: 'Pigeons! Flying rabbits, more or less. Don\'t put all your diggers in one heap, old chap, they\'ll get dived on.',
        burdock: 'Hmph. Fliers. Diggers can\'t stop what comes from the sky. Runners catch fliers. Remember it.',
        any: 'They ride pigeons up there. Keep some quick ones back to catch the fliers.',
      });
      s.save();
    }
    return true;
  },
  'c2-rts2.won': async (s) => {
    s.set('g_c2-rts2_won'); s.set('g_ch2_open');
    s.sfx('victory');
    await lines(s, [
      [null, 'The last of the Pigeon Riders wheel away over the dovecotes. Silverdown\'s hill is quiet.'],
      [null, 'Quiet, but not still. Down in the warren the humming goes on, low and steady, like a kettle that never boils.'],
      ['bramble', 'We took the hill. But they\'re still humming down there.', { mood: 'worried' }],
    ]);
    await chime(s, {
      badger: 'The hill is only the doorstep. The heart of a warren is its chief. Wake her, and the rest will follow.',
      mole: 'Their chief is called Aster, I heard. A poet, they say. Oh, I do hope she\'s all right.',
      ninefold: 'The humming comes from one place, mostly. A middle. I can feel it the way you would feel a draught.',
      any: 'Their chief is down there. Wake her, and the warren wakes.',
    });
    s.quest(withNinefold('North road to Silverdown: go down into the warren and wake Aster, its chief.'));
    s.save();
    const c = await s.ask('bramble', 'The north road is open.', ['Go to Silverdown now', 'Not yet']);
    if (c === 0 && G.data.maps['c2-silverdown']) await s.warp('c2-silverdown', 'south');
  },
  // the segment's own start: the Lookout Stone's battle, without depending on the hub's state
  'c2.seg.rts2': async (s) => {
    await scripts['c2-rts2.intro'](s);
    const r = await s.army('c2-rts2');
    if (r === 'win') await scripts['c2-rts2.won'](s);
  },

  // ================================================================ SILVERDOWN, THE SURFACE
  'c2.silverdown.enter': async (s) => {
    if (!flag('c2_card')) { s.set('c2_card'); s.chapter(2); await s.chapterCard('Silverdown and the Moon', 'Chapter 2', 'bg-battle-moon'); }
    if (!flag('c2_sd_seen')) {
      s.set('c2_sd_seen');
      await lines(s, [
        [null, 'Silverdown: pale chalk, pale grass, and dovecotes standing on their poles like tall white lanterns.'],
        [null, 'The rabbits here sit very still, ears down, eyes the colour of a winter sky. All of them are humming the same low note.'],
        ['bramble', 'It\'s so quiet. A warren should never be this quiet.', { mood: 'worried' }],
      ]);
      await chime(s, {
        mole: 'Oh, the poor things. They don\'t even look up. As if we weren\'t here at all.',
        badger: 'Stragglers on the hill still. Mind them. Their chief is down below, in the heart of the warren.',
        toad: 'Not one of them has asked who I am! Not ONE! This is a very rude warren.',
        any: 'Stay close. There are still raiders on the hill.',
      });
      s.quest('Into Silverdown Warren (the mouth at the top of the hill): find and wake Aster, its chief.');
      s.save();
    }
    if (flag('g_freed_silverdown') && !flag('c2_sd_freedSeen')) {
      s.set('c2_sd_freedSeen');
      await s.narrate('The hill is noisy now: kits chasing pigeons, does gossiping, somebody singing badly. Silverdown sounds like a warren again.');
    }
    s.ex.enterBubble();
  },
  'c2.sd.hummer': async (s, a) => {
    const lns = [
      'Hmmmm... Deeper. It\'s nicer deeper. Hmmmm.',
      'Name? I had one. It was... pale. Hmmm. It doesn\'t matter.',
      'The pigeons don\'t come to me any more. They don\'t like the humming. Hmmmm.',
      'You hop too loud. Hush. Listen. Can\'t you hear it? It wants us.',
      'Dig... dig down... Aster says... no. The hum says. Hmmm.',
    ];
    const k = 'c2_hum_' + ((a && a.id) || 'x'); const n = s.val(k) || 0; s.set(k, n + 1);
    await s.say((a && a.sprite === 'pigeon-rider') ? 'pigeon-rider' : 'buck', lns[(n + ((a && a.x) || 0)) % lns.length]);
    if (n === 0) await chime(s, { mole: 'They\'ll wake when their chief does. I\'m sure of it. Nearly sure.', ninefold: 'Their eyes are the colour of my insides. I am very sorry about that.', tansy: 'Oh, I know that look. I WORE that look. Come on, Bramble.' });
  },
  'c2.sd.woken': async (s, a) => {
    const lns = [
      ['doe', 'I was humming. For days, they tell me. I don\'t remember a single day of it. Only cold.'],
      ['buck', 'Thank you, Thimblebank. When you want us, call. Silverdown remembers its friends now.'],
      ['kit', 'My pigeon came back! She sat on my head! She\'s never done that before!'],
      ['pigeon-rider', 'Up in the sky the humming can\'t reach you. Did you know? I\'m going to fly ALL day.'],
    ];
    const i = ['sd-doe-w', 'sd-buck-w', 'sd-kit-w', 'sd-rider-w'].indexOf(a && a.id);
    const [who, t] = lns[Math.max(0, i)];
    await s.say(who, t);
  },
  'c2.sd.pigeon': async (s) => {
    s.sfx('wings', { vol: 0.5 });
    if (flag('g_freed_silverdown')) await s.narrate('The pigeon puffs up, coos, and walks round Bramble in a slow, important circle. It seems to approve.');
    else await s.narrate('A grey pigeon on the chalk, feathers fluffed. It won\'t go near the humming rabbits. It looks at Bramble hopefully.');
  },
  'c2.sd.elder': async (s) => {
    if (!flag('c2_elder')) {
      s.set('c2_elder');
      await lines(s, [
        ['doe', 'You\'re the little brown buck from Thimblebank. Aster told us. I\'m Vetch: I keep the dovecotes.'],
        ['doe', 'When Flintcomb came, they hummed at the cotes until even the pigeons went quiet. Then they hummed at us.'],
        ['doe', 'Take these. Silverdown pays its debts in white chalk and good clover.'],
      ]);
      await s.give({ buttons: 60, 'clover-bunch': 3 });
      return;
    }
    await s.say('doe', 'The pigeons are flying again. Listen to them. I\'d forgotten how loud happiness is.');
  },
  'c2.sd.sign': async (s) => {
    await s.narrate('A signpost, chalked in a neat hand: "SILVERDOWN. Mind the pigeons. Mind the cotes. Mind your manners." Somebody has added: "hmmm".');
  },

  // ================================================================ SILVERDOWN WARREN AND ASTER
  'c2.warren.enter': async (s) => {
    if (!flag('c2_sw_seen')) {
      s.set('c2_sw_seen');
      s.ambience('hum', 0.6);
      await lines(s, [
        [null, 'Inside, the tunnels are whitewashed with chalk and lit by pale mushrooms. The hum is in the walls here. Bramble feels it in his teeth.'],
        ['bramble', 'It\'s stronger underground. Like we\'re walking inside it.', { mood: 'worried' }],
      ]);
      await chime(s, {
        burdock: 'Hmph. Good tunnels. Well dug. Shame about the humming.',
        badger: 'The heart of a warren is always at its deepest, oldest end. That way, past the loft and up the stair.',
        ninefold: 'The hum is louder at the far end of this warren. I would say "that way", if I had something to point with.',
        any: 'The heart of the warren will be at the far end. Their chief will be there.',
      });
      s.quest('Find Aster in the Heart of Silverdown Warren (the round room at the far end, past the antechamber).');
    }
    if (flag('g_freed_silverdown') && !flag('c2_sw_freedSeen')) {
      s.set('c2_sw_freedSeen');
      await s.narrate('Lamps lit in every room. Kits shrieking. Someone is arguing about whose turn it is to clean the loft. It is a wonderful noise.');
    }
    s.ex.enterBubble();
  },
  'c2.sw.seat': async (s) => {
    await s.narrate('Aster\'s seat, carved from a root. Scratched into its arm, in a small careful hand: a poem, half finished. "The moon looks down on Silverdown, and Silverdown looks..."');
    if (flag('g_freed_silverdown')) await s.say('aster', 'Looks up. "...and Silverdown looks up." I\'ve been stuck on that line for three summers. Thank you for the time to finish it.');
  },
  'c2.aster.approach': async (s) => { await scripts['c2.aster.boss'](s); },
  'c2.aster.boss': async (s) => {
    if (flag('g_freed_silverdown')) return;
    if (!flag('c2_asterSeen')) {
      s.set('c2_asterSeen');
      s.face('aster', { x: s.b.x, y: s.b.y });
      await lines(s, [
        [null, 'The Heart of Silverdown: a round white room under a round white roof. In the middle, on a seat cut from a root, sits a slender doe as pale as the moon.'],
        [null, 'Aster. Silverdown\'s chief. Her eyes are blank and blue, and she is humming, very softly, a tune with no end.'],
        ['aster', 'A brown rabbit. From the south. Hush, little one. Can you hear it? It is so beautiful down there.'],
        ['aster', 'We sent a sandy doe down to it. She fought it all the way. She kept scratching marks in the walls. Silly thing.'],
      ]);
      const c = await s.ask('bramble', '', ['That\'s Tansy. Where is she?', 'Wake up, Aster. Please.']);
      if (c === 0) await s.say('bramble', 'That\'s Tansy. My best friend. Where did you send her?', { mood: 'worried' });
      else await s.say('bramble', 'Aster, wake up. Please. This isn\'t you.', { mood: 'worried' });
      await s.say('aster', 'Down. Everyone goes down. You too. Hush, now.');
      await chime(s, { mole: 'Spring-cleaning, Bramble! If she hums at one of us, I can clear it right out.', ninefold: 'She will try to put the hum in one of you. I am not very hummable. Let me stand in front.', badger: 'Gently, now. She\'s their chief, not our enemy.', any: 'Gently. She\'s not herself.' });
    } else {
      await s.say('aster', 'Back again? Hush. Listen. Hmmmmm...');
    }
    const r = await s.battle('c2.aster');
    if (r !== 'win') return;
    s.set('g_freed_silverdown'); s.set('c2_asterWoken');
    s.sfx('wake-chime');
    await lines(s, [
      [null, 'Aster shakes her head, hard, the way a rabbit shakes off rain. She blinks. Her eyes are grey again: warm, ordinary grey.'],
      ['aster', 'Oh. Oh, the light. Has it always been this bright in here?'],
      ['aster', 'I was... dreaming. A long, cold dream of digging. I remember singing it to my own kits. Oh, stars. My kits.'],
      [null, 'All through the warren, the humming stops. One by one. Then a kit starts crying, and somebody laughs, and somebody else calls a name.'],
      ['aster', 'You did this. A rabbit from Thimblebank, with mud on his feet. What is your name?'],
      ['bramble', 'Bramble. And we came for Tansy. A sandy doe. You said she went down.'],
      ['aster', 'I did. I... remember it like a reflection. The diggers took her through our old deep door, the one my grandmother sealed.'],
      ['aster', 'She fought every step. She left marks on the walls. She wanted someone to follow her, Bramble. I think she meant you.'],
    ]);
    await s.recruit('aster', { line: 'Silverdown answers. When the warrens thump, we will thump with you.' });
    await s.say('aster', 'Here: the key to our deep door. My grandmother called it the moon\'s door, though she never said why. Bring her home.');
    await s.give({ 'silverdown-key': 1 });
    await chime(s, { mole: 'She\'s alive, Bramble. She left marks! That\'s just exactly like her.', badger: 'A friend who leaves a trail is a friend who expects to be found. Down we go.', toad: 'A trail of clues! Like a detective! I have always been an excellent detective.', any: 'She\'s leaving a trail for you. Let\'s go.' });
    s.quest('Silverdown\'s deep door is on the left of the Heart, down the narrow passage. Follow Tansy down.');
    s.save();
  },
  'c2.aster.talk': async (s) => {
    const n = s.val('c2_asterTalk') || 0; s.set('c2_asterTalk', n + 1);
    const lns = [
      'The moon used to look into our warren through the cotes. My grandmother said it was watching over us. Lately it watches the other way.',
      'Go carefully below. The deep door is cold, and what is behind it is older than any warren on the downs.',
      'When you bring Tansy back, I will write her a poem. Don\'t tell her. She\'ll pull a face.',
    ];
    if (flag('g_recruit_tansy')) await s.say('aster', 'Tansy! The sandy doe with the marks. You found her. I owe you a poem, Tansy. Don\'t pull that face.');
    else await s.say('aster', lns[n % lns.length]);
  },
  'c2.sw.kit': async (s, a) => {
    if (a && a.id === 'sw-kit-1w') await s.say('kit', 'Mum says I hummed for a week and wouldn\'t eat my clover! I don\'t believe her. I LOVE clover.');
    else await s.say('kit', 'Are you the one who woke Aster? Can you wake my brother? Oh, he\'s already awake. He\'s just boring.');
  },
  'c2.sw.nurse': async (s) => {
    await s.say('doe', 'Every kit in this nursery hummed itself to sleep for a week. Tonight they\'re going to sleep the ordinary way. Shouting.');
  },
  'c2.sw.loft': async (s) => {
    if (!flag('c2_loftGift')) {
      s.set('c2_loftGift');
      await s.say('pigeon-rider', 'The pigeons wouldn\'t come near us while we hummed. Now they won\'t leave me alone. Here: a thank-you from the loft.');
      await s.give({ 'pluck-berry': 2, dandelion: 1 });
      return;
    }
    await s.say('pigeon-rider', 'When you fight on the downs again, look up. We\'ll be there. Pigeons and all.');
  },
  'c2.rest': async (s) => { await s.narrate('A mossy stone, warm as a sleeping animal. A good place to rest before whatever comes next.'); await s.rest(); },
  'c2.deepdoor': async (s) => {
    if (!flag('g_freed_silverdown')) {
      await s.narrate('A round door of old grey wood, set in the chalk and sealed with a heavy lock. Scratched beside it, low down: a little sandy pawprint, and an arrow pointing down.');
      await s.say('bramble', 'Tansy\'s mark! She was here. But it\'s locked.', { mood: 'worried' });
      return;
    }
    if (!flag('c2_deepOpen')) {
      s.set('c2_deepOpen');
      s.sfx('key-turn');
      await s.narrate('Aster\'s key turns with a sound like a sigh. Cold air breathes out of the dark, smelling of stone and deep water.');
    }
    await s.warp('c2-depths', 'top');
  },

  // ================================================================ SILVERDOWN DEPTHS
  'c2.depths.enter': async (s) => {
    if (!flag('c2_dp_seen')) {
      s.set('c2_dp_seen');
      await lines(s, [
        [null, 'Below Silverdown\'s door the tunnels are older, wider, cut through grey stone. And on the floor, in the dust: pawprints. Small, sandy, going down.'],
        ['bramble', 'Tansy. Those are hers. I\'d know those feet anywhere. She always lands crooked on the left.', { mood: 'worried' }],
      ]);
      s.quest('Follow Tansy\'s pawprints down through Silverdown Depths.');
      s.save();
    }
    s.ex.enterBubble();
  },
  'c2.dp.tracks': async (s) => {
    await s.narrate('The pawprints scuff and stop here, as if she dug her heels in. Then bigger prints close around them, and they all go on together.');
    await chime(s, { badger: 'She didn\'t go quietly. Good girl.', mole: 'She dug her heels in! Oh, I like her already.', any: 'She fought them, here. See?' });
  },
  'c2.dp.mark': async (s) => {
    await s.narrate('Scratched on the wall at rabbit height, quick and crooked: a T, and an arrow pointing down. Under it, smaller: "B, hurry up."');
    await s.say('bramble', 'Ha. "Hurry up." That\'s Tansy all over.', { mood: 'happy' });
  },
  'c2.dp.tuft': async (s) => {
    await s.narrate('A tuft of sandy fur, caught on a rough stone. Further on the pawprints change: shorter, slower, dragging. No more marks on the walls.');
    await s.say('bramble', 'She\'s stopped fighting. The hum\'s got her.', { mood: 'worried' });
    await chime(s, { mole: 'Then we go faster, that\'s all. Come on.', badger: 'Then she needs us more, not less. On.', ninefold: 'The hum is loud below us. I am sorry. We will be louder.', any: 'Then we hurry.' });
  },

  // ================================================================ SILVERDOWN'S UNDERWAY
  'c2.underway.enter': async (s) => {
    s.set('g_underway_c2');
    if (!flag('c2_uw_seen')) {
      s.set('c2_uw_seen');
      s.sfx('shimmer', { vol: 0.5 });
      await lines(s, [
        [null, 'Another round cavern, smooth as an egg, with carved faces round its walls. Another Underway. This one has two doors.'],
        [null, 'High on one side, an arch with a silver crescent cut into it, and through it a pale light spills down like milk. A stair of moonlight, going UP.'],
        [null, 'Low on the other side, a stair goes down into black water. The water is right at the top step, still as glass.'],
        ['bramble', 'Her tracks go right to the water\'s edge. Right into it.', { mood: 'worried' }],
      ]);
      await chime(s, {
        ratty: 'That water\'s cold and deep and it isn\'t going anywhere, old chap. Even I wouldn\'t swim that.',
        mole: 'And up there, look! A stair made of moonlight. Who ever heard of such a thing?',
        badger: 'There\'s no going down that stair while the water sits on it. Something has to move it.',
        any: 'We can\'t swim that. But the other door goes up.',
      });
      if (flag('g_underway_c1')) await s.narrate('In the middle of the cavern, a mossy stone like the one in Thimblebank\'s Underway. Under the moss it hums, very faintly: the Underways are linked.');
      s.quest('The drowned stair is under water. Climb the moonbeam stair and see where it goes.');
      s.save();
      return;
    }
    if (flag('g_recruit_jade-rabbit') && !flag('c2_tideDown')) {
      s.set('c2_tideDown');
      s.sfx('rumble', { vol: 0.5 }); s.shake(1.2, 2);
      await lines(s, [
        [null, 'As the Jade Rabbit steps off the moonbeam stair, the black water on the drowned stair shivers. Then, slowly, it begins to draw back.'],
        ['jade-rabbit', 'The water under your hills rises and falls with the moon. Chang\'e asked it, very politely, to let you pass.'],
        [null, 'Step by step the drowned stair comes up out of the dark, wet and shining. At the bottom, in the silt: small sandy pawprints.'],
        ['bramble', 'Tansy. Hold on. We\'re coming.', { mood: 'worried' }],
      ]);
      s.quest('Go down the drowned stair. Find Tansy in the Drowned Halls.');
      s.save();
      return;
    }
    if (flag('g_recruit_jade-rabbit') && !flag('g_recruit_tansy')) s.quest('Go down the drowned stair. Find Tansy in the Drowned Halls.');
    s.ex.enterBubble();
  },
  // the mossy stone: Underway travel (ch1's underway.stone), or just a rest if that isn't loaded
  'c2.uw.stone': async (s) => {
    s.set('g_underway_c2');
    const f = G.data.scripts['underway.stone'];
    if (f) await f(s); else { await s.narrate('A mossy stone, warm to the touch. Under the moss it hums, very faintly, like a cat purring.'); await s.rest(); }
  },
  'c2.uw.drownedLocked': async (s) => {
    await s.narrate('The stair goes down into black water, right to the top step. It is so cold that Bramble\'s whiskers ache. Tansy\'s pawprints go straight in.');
    if (flag('c2_metChange')) await s.say('bramble', 'Chang\'e said the water answers to the moon. The Jade Rabbit, then. We need her.');
    else await chime(s, { ratty: 'Not that way. Not without a boat, and not even with one.', badger: 'The water has to move first. Up the other stair.', any: 'We can\'t go through that. Up the moon stair first.' });
  },

  // ================================================================ THE MOON
  'c2.moon.enter': async (s) => {
    wickBack(s);
    if (!flag('c2_mn_seen')) {
      s.set('c2_mn_seen');
      s.sfx('shimmer');
      await lines(s, [
        [null, 'The moonbeam stair goes up and up, and then there is no up any more: only silver dust, soft as flour, and a sky full of stars.'],
        [null, 'And hanging in the black, small and blue and green: the downs. Home. Seen from very, very far away.'],
        ['bramble', 'That\'s... us. That\'s Sorrel Down. We\'re on the moon.', { mood: 'happy' }],
      ]);
      await chime(s, {
        mole: 'Oh my. Oh my, oh my. I don\'t think I\'ll ever be able to describe this to anybody. I shall simply have to bring them.',
        toad: 'The moon! Of COURSE we\'re on the moon. Toad of Toad Hall goes everywhere eventually.',
        ratty: 'Silver dust and starlight and not a drop of river anywhere. I\'ll need a poem for this. A long one.',
        ninefold: 'I have lived in the dark all my life, and here is more dark, but with lights in it. I did not know dark could be so pretty.',
        'cheshire-cat': 'The moon. Everyone always says it\'s made of something. Nobody ever asks what it thinks it\'s made of.',
        caterpillar: 'The moon. Hm. Smaller than I expected. Or I am larger. One never knows.',
        any: 'We\'re on the moon. Somebody pinch me.',
      });
      await s.narrate('From somewhere ahead comes a steady sound: chock. Chock. Chock. Somebody is chopping wood.');
      s.quest(moonQuest()); s.save();
      s.ex.enterBubble();
      return;
    }
    if (!flag('g_recruit_tansy')) s.quest(moonQuest());   // after the Drowned Halls later quests own the line
    s.ex.enterBubble();
  },
  'c2.wugang': async (s) => {
    if (!flag('c2_metWu')) {
      s.set('c2_metWu');
      await lines(s, [
        [null, 'A woodcutter in a patched coat, swinging an axe at an enormous silver-leafed tree. Chock. The cut closes over before the axe is even out.'],
        ['wu-gang', 'Ha! Visitors! Mind the chips, little ones. Not that there are ever any chips. Watch this.'],
        [null, 'Chock. The bark heals like water closing over a stone.'],
        ['wu-gang', 'Wu Gang. Woodcutter. I was told I could stop when this cassia tree came down. That was a very long time ago.'],
      ]);
      const c = await s.ask('bramble', '', ['Why don\'t you just stop?', 'That sounds awful.']);
      if (c === 0) {
        await s.say('bramble', 'Why don\'t you just... stop?');
        await s.say('wu-gang', 'Ha! You know, nobody has asked me that in a thousand years. I suppose I\'ve got used to it. It\'s good exercise. And the tree enjoys the company.');
      } else {
        await s.say('bramble', 'That sounds awful.');
        await s.say('wu-gang', 'It was, at first. Now? The tree and I are old friends. It heals, I chop, we talk. Mostly I talk.');
      }
      await s.say('wu-gang', 'The Jade Rabbit lives under my tree. She makes the medicine of long life, pounding it with her pestle. Or she did. Ask her why she\'s stopped.');
      s.quest(moonQuest());
      return;
    }
    const n = s.val('c2_wu') || 0; s.set('c2_wu', n + 1);
    const lns = flag('g_recruit_jade-rabbit') ? [
      'Off with you both, then! I\'ll keep the tree company. And the mortar. Don\'t worry, I won\'t chop the mortar.',
      'Chock! There, look. It healed faster today. I think it\'s pleased for her.',
    ] : [
      'The cassia heals every night. The scars all close up by morning. I find that comforting, oddly.',
      'Chang\'e lives in the palace up the path. She doesn\'t come out much. She watches your little blue world through her window.',
      'The moths used to sit in my tree and glow. Lately they hum instead. I don\'t like it. Chock!',
    ];
    await s.say('wu-gang', lns[n % lns.length]);
  },
  'c2.traveller': async (s) => {
    if (flag('c2_traveller')) return;
    if (!flag('c2_metTraveller')) {
      s.set('c2_metTraveller');
      await lines(s, [
        [null, 'By the path sits an old, old traveller with a stick and a bundle, so dusty with moon-silver that he looks half made of it.'],
        ['traveller', 'Good evening, little one. It\'s a long road, this. I\'ve been walking it since before your hills were hills.'],
        ['traveller', 'I don\'t suppose... you wouldn\'t have a bite of something to spare? I am so very hungry.'],
      ]);
    } else {
      await s.say('traveller', 'Still here, little one. Still hungry. The moon has very little to eat on it, you know. Mostly dust.');
    }
    const have = s.has('sweetgrass');
    await s.narrate(have
      ? 'Bramble feels in his fur. There, squashed and a little dry: the sweetgrass he picked for Old Yarrow on the morning of the attack. He never got to give it.'
      : 'Bramble feels in his fur. Nothing but a squashed sprig of sweetgrass from the downs, a little dry, caught there since the morning of the attack.');
    const c = await s.ask('bramble', '', ['Share the sweetgrass', 'Not yet']);
    if (c !== 0) { await s.say('traveller', 'No, no. Of course. It\'s yours. I\'ll wait. I\'m very good at waiting.'); return; }
    if (have) s.take('sweetgrass');
    s.set('c2_traveller');
    await lines(s, [
      ['bramble', 'It\'s not much. I was saving it for somebody. But he\'d want you to have it. He\'d say "never go into the dark without something nice to chew".'],
      [null, 'The traveller takes the little sprig very carefully, as if it were the most precious thing on the moon. He eats it slowly. He closes his eyes.'],
      ['traveller', 'Oh. That tastes of rain, and chalk, and summer. Of home. Thank you, little one. You had so little, and you gave me half of it.'],
      ['traveller', 'There\'s a lady under the tree who knows what that means. Tell her I said so.'],
    ]);
    s.sfx('shimmer');
    await s.fadeOut(0.5); s.remove('traveller'); await s.fadeIn(0.5);
    await s.narrate('When Bramble looks up, the traveller is gone. There are no footprints in the silver dust. Not one.');
    await chime(s, { mole: 'Where did he go? He was right there. He was RIGHT THERE.', toad: 'Gone! Without so much as a thank-you. Well. He did say thank you. Rather beautifully.', 'cheshire-cat': 'Ah. One of those. They always leave by the side door.', ninefold: 'He did not scream. He said thank you. I liked him very much.', any: 'He just... vanished.' });
    s.quest(moonQuest());
  },
  'c2.jade.tree': async (s) => {
    if (flag('c2_mothQueen')) return;
    if (!flag('c2_metJade')) {
      s.set('c2_metJade');
      await lines(s, [
        [null, 'Under the cassia tree, beside a great green mortar, sits a rabbit white as jade. She lifts her empty paws and brings them down. Lifts them, and brings them down. Pounding nothing.'],
        ['jade-rabbit', 'Ah. Earth rabbits. It has been a long while since anyone climbed the moonbeam stair.'],
        ['jade-rabbit', 'Forgive me. I am pounding the elixir of long life. Or I would be. My pestle is gone.'],
        ['bramble', 'Gone where?'],
        ['jade-rabbit', 'The lantern moths took it. They glowed once, gently. Now something hums in them, and they take every bright thing they can carry.'],
      ]);
    }
    if (!flag('c2_traveller')) {
      await s.say('jade-rabbit', 'The road below my tree is long. Someone on it is hungry tonight. Go on, little one. I will be here. I am always here.');
      s.quest(moonQuest());
      return;
    }
    if (!flag('c2_jadeTold')) {
      s.set('c2_jadeTold');
      await lines(s, [
        ['jade-rabbit', 'You met the old traveller. I saw. I see most things, from under this tree.'],
        ['jade-rabbit', 'You gave him your sweetgrass. All you had.'],
        ['jade-rabbit', 'Long ago, on your world, he came to me too. I was a hare in a wood with nothing at all to give him. Not a seed. Not a leaf.'],
        ['jade-rabbit', 'So I gave him the only thing I had, which was my kindness. And he brought me here, to the moon, to keep its medicine. I have kept it ever since.'],
        ['bramble', 'He said to tell you: I had so little, and I gave half of it.'],
        ['jade-rabbit', 'Then he trusts you. And so do I.'],
      ]);
      s.remember('mem-traveller');
      s.toast('A memory: the old traveller');
      await lines(s, [
        ['jade-rabbit', 'The moths took my pestle to the lantern grove, past the warren of the Moon Hares. Their queen sits on it like a hen on an egg.'],
        ['jade-rabbit', 'The Hares have shut their doors since the moths went strange. They will open them for Chang\'e. Go to the palace, at the top of the path, and ask her.'],
        ['bramble', 'And then we\'ll get your pestle back. And then... could you help us? My friend is somewhere under deep water.'],
        ['jade-rabbit', 'Bring me my pestle, and you will not need to ask.'],
      ]);
      s.quest(moonQuest()); s.save();
      return;
    }
    const n = s.val('c2_jadeN') || 0; s.set('c2_jadeN', n + 1);
    await s.say('jade-rabbit', ['The palace is at the top of the path, past the lanterns. Chang\'e will be at her window. She is always at her window.', 'Be gentle with the moths, if you can. They are not cruel. They are only frightened of the dark.', 'Wu Gang talks to the tree when he thinks nobody is listening. I always listen. It is very nice talk.'][n % 3]);
  },
  'c2.moonhare': async (s, a) => {
    const n = s.val('c2_hareN') || 0; s.set('c2_hareN', n + 1);
    const before = ['We stay near the palace now. The moths sting, a little. Not like they used to glow.', 'Earth rabbits! Short ears. Brown! How very... brown.', 'We don\'t leave the warren without Chang\'e\'s say-so. Not since the humming started.'];
    const after = ['The grove is lit again! I can see my own paws at night! I\'d forgotten what they look like.', 'Brown rabbits are our friends now. Officially. There was a vote.', 'When you go back to your world, look up at us sometimes. We\'ll wave.'];
    await s.say('moon-hare', (flag('c2_mothQueen') ? after : before)[n % 3]);
  },
  'c2.moon.cratersLocked': async (s) => {
    await s.narrate('A low arch of moon-rock, the way to the crater warren. Behind it, a door of woven silver grass is shut tight. From the other side a voice says: "Go away, please. Unless Chang\'e sent you."');
    s.quest(moonQuest());
  },

  // ================================================================ THE MOON PALACE
  'c2.palace.enter': async (s) => {
    wickBack(s);
    if (!flag('c2_mp_seen')) {
      s.set('c2_mp_seen');
      await s.narrate('The Moon Palace: white courts, silver grass, and rows of lanterns burning a warm, steady orange, the only warm colour on the whole moon.');
    }
    s.ex.enterBubble();
  },
  'c2.change': async (s) => {
    if (!flag('c2_changeMet1')) {
      s.set('c2_changeMet1');
      await lines(s, [
        [null, 'At the top of the court, by a window that looks out over the stars, stands a lady in pale silk. She turns as Bramble comes near, and smiles a small, kind smile.'],
        ['change', 'A rabbit from the blue world. I know your hills. I have watched them every night for longer than I can count.'],
        ['change', 'I am Chang\'e. I came here long ago, and I cannot go back. So I watch. I watched your warren on the morning the raiders came.'],
        ['bramble', 'You saw it? You saw them take Tansy?', { mood: 'worried' }],
        ['change', 'I saw. I am sorry. I could do nothing but watch, which is the hardest thing there is.'],
        ['change', 'There is something under your world, little one. Something very old, asleep and dreaming. Its dreams are not happy ones.'],
        ['change', 'Even here, some nights, the light flickers.'],
      ]);
      await chime(s, { ninefold: 'She knows about the Sleeper. Everyone in the deep knows about the Sleeper. I did not know the moon did too.', badger: 'Hmph. Even the moon. This is bigger than one warren, Bramble.', mole: 'Even the moon? Oh dear. Oh, dear oh dear.', any: 'Even here...' });
    }
    if (!flag('c2_jadeTold')) {
      await s.say('change', 'The Jade Rabbit sits under the cassia tree, below my palace. She has lost something dear to her. Go and sit with her a while.');
      return;
    }
    if (!flag('c2_metChange')) {
      s.set('c2_metChange');
      await lines(s, [
        ['bramble', 'The Jade Rabbit sent us. The moths took her pestle to the lantern grove. We need the Moon Hares to open their warren.'],
        ['change', 'She trusts you? Then the Hares will too. Tell them I sent you, and give them this.'],
        [null, 'She takes a paper lantern from the window and folds it, very small, into a silver flower.'],
        ['change', 'And these, for the road. Mooncakes. They are a little sweet and a little heavy, like most good things.'],
      ]);
      await s.give({ mooncake: 3 });
      await lines(s, [
        ['change', 'One more thing. Your friend, under the water. The water under your hills rises and falls with the moon. It always has.'],
        ['change', 'When the Jade Rabbit walks your stair, it will remember that, and draw back for her.'],
      ]);
      s.quest(moonQuest()); s.save();
      return;
    }
    if (flag('g_recruit_tansy')) { await s.say('change', 'I saw you both, on the stair under the water. I watched until you were safe. I think that is the best thing I have ever watched.'); return; }
    const n = s.val('c2_changeN') || 0; s.set('c2_changeN', n + 1);
    const lns = flag('c2_mothQueen')
      ? ['The grove is calmer. I see it from my window. It is a kind thing, to wake something rather than chase it away.', 'If the moths want light, my lanterns have plenty. They always did. They only had to ask.']
      : ['The Hares\' warren is east of the tree, past the craters. The lantern grove is beyond it.', 'Mind the Moth Queen. She is not wicked. She is frightened, and she has made herself very large about it.'];
    await s.say('change', lns[n % lns.length]);
  },
  'c2.palace.lantern': async (s) => {
    if (flag('c2_wickFollows') && !flag('c2_flame') && s.escorting('wick')) {
      s.set('c2_flame');
      s.sfx('shimmer');
      await lines(s, [
        [null, 'Wick flutters up to the lantern and hovers there, wings trembling, until a single bright bead of flame drops into his cupped feelers.'],
        ['wick', 'Oh. Oh, it\'s warm. I\'d forgotten warm. Quick, quick, before it goes out!'],
      ]);
      await s.give({ flame: 1 });
      s.quest('Carry the flame back to the lantern grove, past the crater warren. Wick is following.');
      return;
    }
    await s.narrate(flag('c2_flame') ? 'The palace lanterns burn on, warm and orange.' : 'A tall paper lantern, burning with a warm orange flame that doesn\'t flicker at all.');
  },

  // ================================================================ THE CRATER WARREN
  'c2.craters.enter': async (s) => {
    wickBack(s);
    if (!flag('c2_mc_seen')) {
      s.set('c2_mc_seen');
      await lines(s, [
        [null, 'The silver-grass door opens. Beyond it, a great crater full of burrows, and the long-eared Moon Hares peering out of every one.'],
        ['moon-hare', 'Chang\'e sent you? With a silver flower? Then come in, come in. Mind the dust-hoppers. They\'ve gone strange too.'],
      ]);
      s.quest('Find the Hares\' elder in the middle of the crater warren.');
    }
    s.ex.enterBubble();
  },
  'c2.hare.elder': async (s) => {
    if (!flag('c2_hares')) {
      await lines(s, [
        ['moon-hare', 'So. The Jade Rabbit trusts you, Chang\'e trusts you, and you smell of earth and clover. That is a great deal of trust for one small rabbit.'],
        ['moon-hare', 'The moths come from the grove beyond our crater. The Hum got into their queen first, then into all of them. They stole our light. Then the pestle.'],
        ['moon-hare', 'We have been too frightened to go. But you are going anyway, aren\'t you? I can see it in your ears.'],
      ]);
      const c = await s.ask('bramble', '', ['We\'re going. Come with us.', 'We could use some help.']);
      await s.say('bramble', c === 0 ? 'We\'re going. Come with us. It\'s less scary with more.' : 'We could use some help. Please.');
      await s.say('moon-hare', 'Hah. Very well. The Hares will ring the grove and keep her moths from her. You go to the middle and talk sense to the Queen.');
      s.set('c2_hares');
      s.sfx('warren-drum');
      await s.narrate('All round the crater, long ears go up. The Moon Hares are coming.');
      s.quest(moonQuest()); s.save();
      return;
    }
    if (flag('c2_mothQueen')) { await s.say('moon-hare', 'The grove is lit, the moths are kind again, and the Jade Rabbit has her pestle. That\'s a good night\'s work. Sleep well, earth rabbits.'); return; }
    await s.say('moon-hare', 'The grove is through the far gate, at the top of the crater. We\'ll be right behind you. Well. Slightly behind you.');
  },
  'c2.moontoad': async (s) => {
    if (!flag('c2_metToad3')) {
      s.set('c2_metToad3');
      await lines(s, [
        [null, 'Behind a counter of moon-rock squats a very large toad with only three legs, balancing perfectly. A coin of pearl sits on her tongue.'],
        ['moon-toad', 'Customers! Real ones! Welcome to the only shop on the moon. Croak. Pearls, buttons, either will do. Everything shines up here.'],
      ]);
      await chime(s, { toad: 'A TOAD! On the moon! Madam, as one toad to another, I must say: what a splendid counter.', ratty: 'Three legs, and still better balanced than Toad on a good day.', any: 'A three-legged toad. Of course there is.' });
    }
    await s.shop('c2.moon-toad');
  },
  'c2.craters.groveLocked': async (s) => {
    await s.narrate('A gate of silver reeds at the top of the crater. Beyond it, between strange glowing trees, something hums. The reeds won\'t part.');
    await s.say('bramble', 'We need the Hares to open it. Their elder is in the middle of the crater.');
  },

  // ================================================================ THE LANTERN GROVE AND THE MOTH QUEEN
  'c2.grove.enter': async (s) => {
    wickBack(s);
    if (!flag('c2_mg_seen')) {
      s.set('c2_mg_seen');
      await lines(s, [
        [null, 'The lantern grove: white trees hung with little paper-thin lanterns. Every lantern is dark. Only the moths glow, a cold, wrong blue.'],
        [null, 'Behind them the Moon Hares slip between the trees, ears flat, making a ring round the grove.'],
      ]);
      await chime(s, { mole: 'It\'s like a Christmas wood with all the candles blown out. That\'s the saddest sort of dark.', ninefold: 'The moths are humming the same note as the Silverdown rabbits. The note is everywhere now.', any: 'The Queen will be in the middle.' });
      s.quest(moonQuest());
    }
    if (flag('c2_wickFollows') && flag('c2_flame') && !flag('c2_groveLit')) s.quest('Set the palace flame in the lantern at the heart of the grove.');
    s.ex.enterBubble();
  },
  'c2.grove.clearing': async (s) => { await scripts['c2.mothqueen'](s); },
  'c2.mothqueen': async (s) => {
    if (flag('c2_mothQueen')) return;
    if (!flag('c2_mqSeen')) {
      s.set('c2_mqSeen');
      await lines(s, [
        [null, 'In the clearing at the heart of the grove, on a heap of stolen bright things, sits the Moth Queen. Under her wings, glowing faintly green: the Jade Rabbit\'s pestle.'],
        ['moth-queen', 'Mine. All mine. Everything that glows is MINE now. The humming says the dark is coming, and I will not be in the dark.'],
        ['bramble', 'That\'s not yours. The Jade Rabbit needs it.'],
        ['moth-queen', 'Then let her come and be dark with the rest of us! Moths! MOTHS! To me!'],
        [null, 'All round the grove the Moon Hares stand up at once, a ring of long ears. The moths dither. Only two reach their Queen.'],
      ]);
    } else await s.say('moth-queen', 'You again! Moths, to me! Keep the dark away!');
    const r = await s.battle('c2.moth-queen');
    if (r !== 'win') return;
    s.set('c2_mothQueen');
    s.sfx('wake-chime');
    await lines(s, [
      [null, 'The Moth Queen folds her great wings and drops to the ground, small and shaking. The cold blue light goes out of her, like breath on a window.'],
      ['moth-queen', 'I... I was so afraid of the dark. The humming said it was coming for everything. I thought if I kept all the lights, it couldn\'t have me.'],
      ['bramble', 'It\'s all right. Everybody\'s afraid of something.'],
      ['moth-queen', 'Take the pestle. Take it back to her. Tell her... tell her I\'m sorry. I only wanted to be warm.'],
    ]);
    await s.give({ 'jade-pestle': 1 });
    // the Jade Rabbit comes up through the trees with the Hares
    const [jx, jy] = freeNear(s, s.b.x + 2, s.b.y + 1);
    s.spawn({ id: 'jade-rabbit', sprite: 'jade-rabbit', x: jx, y: jy, facing: 'nw' });
    s.face('bramble', { x: jx, y: jy });
    await lines(s, [
      [null, 'Through the dark trees comes a pale shape: the Jade Rabbit, walking softly, with the Hares around her.'],
      ['jade-rabbit', 'I could not stay under my tree while you came here for me. Wu Gang is minding the mortar. He promised not to chop it.'],
      [null, 'Bramble holds out the pestle. She takes it in both paws, and it glows a soft, clean green.'],
      ['jade-rabbit', 'Thank you. You gave a stranger half of all you had, and you went into the dark for a rabbit you had only just met.'],
    ]);
    const c = await s.ask('bramble', '', ['Come with us. Please.', 'Tansy would have done the same.']);
    if (c === 0) await s.say('bramble', 'Come with us. My friend is under deep water, and I don\'t know how to reach her alone.');
    else await s.say('bramble', 'Tansy would have done the same. She\'s my best friend. She\'s under deep water, somewhere below.');
    await s.say('jade-rabbit', 'Then I will walk your stair with you. I have pounded medicine for a thousand years. It is time I carried some.');
    s.remove('jade-rabbit');
    await s.recruit('jade-rabbit', { line: 'I have kept the moon\'s medicine for a thousand years. Let me keep you, for a while.' });
    s.take('jade-pestle');
    await s.say('jade-rabbit', 'Here. Pounded fresh. Keep it for when one of you needs to get up again.');
    await s.give({ 'jade-elixir': 2 });
    await s.say('moth-queen', 'And... the Hares say you have friends who fight on the downs. If you ever need lights in the dark, my moths will come.');
    await chime(s, { mole: 'She\'s coming with us! A real moon rabbit! Wait until Thimblebank sees!', toad: 'A rabbit from the MOON joins Toad\'s party. Naturally. I attract only the finest.', ninefold: 'She is very calm. I would like to be that calm. I will watch how she does it.', any: 'A rabbit from the moon. Thimblebank will never believe it.' });
    s.quest(moonQuest()); s.save();
  },
  'c2.hare.grove': async (s) => {
    await s.say('moon-hare', flag('c2_mothQueen') ? 'The moths are sitting in the trees again, all quiet. They look cold. Somebody ought to give them a light.' : 'We\'ve made a ring round the grove. Nothing gets in or out. Go on: the Queen is in the clearing.');
  },
  'c2.grove.moth': async (s) => {
    await s.narrate(flag('c2_groveLit') ? 'A lantern moth, glowing a warm gold, dozes on a twig. It looks very content.' : 'A lantern moth, its glow gone grey. It shivers on its twig. It isn\'t humming any more, but it isn\'t glowing either.');
  },
  'c2.wick': async (s) => {
    if (!flag('c2_wickAsked')) {
      s.set('c2_wickAsked');
      await lines(s, [
        [null, 'A small moth with a bent feeler flutters down onto a root in front of Bramble. Its glow is almost gone.'],
        ['wick', 'Excuse me. Sorry. Excuse me. I\'m Wick. I lit the lantern in the middle of the grove. That was my job. Before.'],
        ['wick', 'The humming put all our lights out. We\'re awake now, thank you, but we\'re so cold. A moth with no light is just a bit of dust that worries.'],
        ['wick', 'Chang\'e\'s lanterns never go out. If I could carry one flame back here, just one, we could light the whole grove from it.'],
        ['wick', 'But it\'s a long way, and I\'m very small, and the crater is full of dust-hoppers. Would you... would you come with me?'],
      ]);
    }
    const c = await s.ask('bramble', '', ['Of course. Stay close.', 'Not right now.']);
    if (c !== 0) { await s.say('wick', 'That\'s all right. I\'ll wait. Moths are good at waiting. And at worrying. Mostly worrying.'); return; }
    await s.say('bramble', 'Of course. Stay close behind me, Wick.');
    await s.say('wick', 'Oh! Oh, thank you. I\'ll be right behind you. Right behind. Don\'t go too fast.');
    s.set('c2_wickFollows');
    s.remove('wick');
    s.escort('wick', true, { sprite: 'wick' });
    s.quest('Take Wick to the Moon Palace and let him take a flame from one of Chang\'e\'s lanterns.');
  },
  'c2.grove.lantern': async (s) => {
    if (flag('c2_groveLit')) { await s.narrate('The heart-lantern of the grove burns warm and gold. All around it, the trees glow back.'); return; }
    if (!flag('c2_flame') || !s.has('flame')) { await s.narrate('A tall lantern at the heart of the grove, cold and dark. Its glass is frosted over.'); return; }
    s.set('c2_groveLit');
    s.take('flame');
    s.sfx('shimmer');
    await lines(s, [
      [null, 'Wick flies up into the dark lantern with the little bead of flame. For a moment nothing happens.'],
      [null, 'Then the lantern catches, and glows, and the glow jumps to the next tree, and the next, until the whole grove is lit warm and gold.'],
      [null, 'All through the branches, the moths open their wings, and every one of them is shining.'],
      ['wick', 'We\'re lit. We\'re LIT! Oh, look at them. Look at all of them!'],
      ['wick', 'You carried it all that way for a moth you\'d never met. Nobody\'s ever done anything like that for us.'],
      ['wick', 'If you ever need light, on your downs or in the dark under them, the Lantern Moths will come. Every one. I\'ll lead them myself.'],
    ]);
    s.escort('wick', false);
    s.set('c2_wickFollows', false);
    s.remember('mem-wick');
    s.toast('A memory: Wick\'s flame');
    await s.recruit('wick', { line: 'A little light, carried a long way. The Lantern Moths will light your road.' });
    await s.give({ buttons: 70, mooncake: 2 });
    await chime(s, { mole: 'Oh, it\'s like Christmas after all. It\'s exactly like Christmas.', 'jade-rabbit': 'I had forgotten how the grove looked lit. Thank you for reminding me.', ninefold: 'So many small lights. I will try to remember every one.', any: 'Look at it. The whole grove.' });
    s.quest(moonQuest()); s.save();
  },

  // ================================================================ THE DROWNED HALLS
  'c2.drowned.enter': async (s) => {
    if (!flag('c2_dr_seen')) {
      s.set('c2_dr_seen');
      await lines(s, [
        [null, 'The Drowned Halls. Columns rise out of black water into a dark that has no roof. The cold gets into Bramble\'s bones.'],
        [null, 'Carved faces line the walls. As he passes, one of them turns its head. Slowly. To watch him go.'],
        ['bramble', 'Did that... did that move?', { mood: 'worried' }],
      ]);
      await chime(s, {
        'jade-rabbit': 'They are only watching. Watching is not the same as harming. Walk on, little one.',
        ninefold: 'They are very old. They have not seen anyone in a long time. I think they are curious. I hope they are curious.',
        badger: 'Eyes front. Don\'t give them the satisfaction.',
        mole: 'I wish they wouldn\'t. I do wish they wouldn\'t.',
        any: 'Keep moving. Don\'t look at them.',
      });
      s.quest('Follow Tansy\'s pawprints through the Drowned Halls (north, up the narrow stair).');
      s.save();
    }
    s.ex.enterBubble();
  },
  'c2.dr.carving': async (s, a) => {
    const n = s.val('c2_carvN') || 0; s.set('c2_carvN', n + 1);
    const lns = [
      'A carved face, worn smooth by water. It is looking at Bramble. It was not looking at him a moment ago.',
      'The carving\'s stone eyes follow Bramble\'s whiskers. Very slowly, it tilts its head, as if listening for something under the floor.',
      'An old carving of a rabbit-shaped thing with too many eyes. Somebody long ago scratched a little thump-mark beside it, like a prayer.',
    ];
    s.emote(a ? a.id : 'bramble', '!');
    await s.narrate(lns[n % lns.length]);
  },
  'c2.dr.seeTansy': async (s) => {
    await lines(s, [
      [null, 'At the top of the stair the hall opens out. And there, in the middle of the stone floor, digging: a sandy doe, thin and dusty, with one crooked ear.'],
      ['bramble', 'TANSY!', { mood: 'worried' }],
      [null, 'She doesn\'t turn. Her paws keep digging, scrape, scrape, scrape, at stone that will never give. She is humming.'],
    ]);
    await chime(s, { mole: 'Oh, Bramble. Oh, her poor paws.', 'jade-rabbit': 'She is far down inside herself. Call to her. She will hear you, even if she cannot answer yet.', badger: 'Steady. She\'s here. That\'s what matters. Go to her.', any: 'Go to her, Bramble.' });
    s.quest('Go to Tansy.');
  },
  'c2.tansy.dig': async (s) => {
    if (flag('g_recruit_tansy')) return;
    if (!flag('c2_tansyTalk')) {
      s.set('c2_tansyTalk');
      await lines(s, [
        ['bramble', 'Tansy. Tansy, it\'s me. It\'s Bramble.'],
        [null, 'Scrape. Scrape. She stops. Her head turns, slowly. Her eyes are flat and pale blue, and they don\'t know him.'],
        ['tansy', 'Go away. I\'m busy. It\'s down here somewhere. It wants me to find it. Hmmmm.'],
      ]);
      const c = await s.ask('bramble', '', ['You\'re Tansy. You beat me to the warren mouth every day.', 'Remember the chalk pebble? You sent it home.']);
      if (c === 0) await s.say('bramble', 'You\'re Tansy of Thimblebank. You beat me to the warren mouth every single morning, and you never once let me forget it.');
      else await s.say('bramble', 'You scratched your mark on a chalk pebble and sent it home. Pip found it. We knew you were still you.');
      await s.say('tansy', 'Tansy...? No. No names. Names are heavy. Down is light. Hmmmm. Get OUT of my way!');
    } else await s.say('tansy', 'Hmmmm. You again. Go away. Go AWAY.');
    const r = await s.battle('c2.tansy');
    if (r !== 'win') return;
    s.sfx('wake-chime');
    await lines(s, [
      [null, 'Tansy sits down hard on the cold stone. She shakes her head, once, twice, and her crooked ear flops over the way it always has.'],
      [null, 'She blinks. Her eyes are brown. Ordinary, sharp, Tansy brown.'],
      ['tansy', '...Bramble?'],
      ['tansy', 'Bramble, you great lump, what took you so LONG?'],
    ]);
    const c2 = await s.ask('bramble', '', ['I came as fast as I could.', 'You\'re welcome, by the way.']);
    if (c2 === 0) await s.say('bramble', 'I came as fast as I could. Through a river and a rabbit-hole and the moon. I\'m not even joking about the moon.', { mood: 'happy' });
    else await s.say('bramble', 'You\'re welcome, by the way. Hello. I missed you too.', { mood: 'happy' });
    await lines(s, [
      ['tansy', 'I left you marks. All the way down. Did you see them? I scratched every one with my own claws. Look at my claws.'],
      ['tansy', 'And then it got so loud. The humming. It was like being underwater inside my own head. I stopped being able to remember your stupid floppy ear.'],
      ['tansy', 'But I remember it now. It\'s still stupid.'],
      ['bramble', 'Come home, Tansy.'],
      ['tansy', 'Home. Yes. In a minute. First, there\'s something under this water, and it\'s been watching me dig for days. And I want a word with it.'],
    ]);
    await s.recruit('tansy', { line: 'Race you. And this time, I\'m not letting go of your ear till we\'re home.' });
    await chime(s, { mole: 'Hello, Tansy! I\'m Mole. Bramble talks about you all the time. Ever so much. It\'s rather sweet.', 'jade-rabbit': 'So this is the friend under deep water. She is louder than I imagined. I like her.', badger: 'Hmph. So you\'re the one. He\'s talked of nothing else.', toad: 'Delighted, madam! Toad, of Toad Hall. You will have heard of me. Everyone has.', any: 'Welcome back, Tansy.' });
    await s.say('tansy', 'Who are all these people? Bramble, where on earth have you BEEN?');
    s.quest('Something is moving in the black water past the east passage. The way to the pool is open.');
    s.save();
  },
  'c2.dr.poolLocked': async (s) => {
    await s.narrate('The passage east ends in a sheet of black water, stirring, like something very big is breathing under it. It won\'t let Bramble pass.');
    await s.say('bramble', 'Not yet. Tansy first.', { mood: 'worried' });
  },
  'c2.dr.eyedoor': async (s) => {
    await s.narrate('A tall stone door, carved with one great eye, shut tight. Water seeps from under it. From the far side comes a sound like a very slow breath.');
    if (flag('g_recruit_tansy')) await s.say('tansy', 'That\'s what I was digging toward. It wanted me to open it. I\'m very glad I couldn\'t.');
    else await chime(s, { ninefold: 'That door goes further down than I have ever been. Please let us not open it today.', any: 'Let\'s leave that one shut.' });
  },

  // ================================================================ THE DROWNED POOL AND THE TIDEWARDEN
  'c2.pool.enter': async (s) => {
    if (!flag('c2_pool_seen')) {
      s.set('c2_pool_seen');
      await lines(s, [
        [null, 'A round hall around a round black pool. A broken jetty runs out into the water. Under the surface, far down, pale shapes open and close. Eyes.'],
        ['tansy', 'That. That\'s what was watching me. Day and night.'],
        [null, 'By the wall, a mossy stone, warm as a sleeping animal. A good place to rest before whatever comes next.'],
      ]);
      s.quest('Rest at the mossy stone. Then walk out along the broken jetty.');
      s.save();
    }
    s.ex.enterBubble();
  },
  'c2.tidewarden': async (s) => {
    if (flag('g_ch2_done')) return;
    if (!flag('c2_tideSeen')) {
      s.set('c2_tideSeen');
      s.shake(1.5, 3); s.sfx('rumble');
      await lines(s, [
        [null, 'At the end of the jetty the water bulges. Rises. A shape comes up out of the pool, too big to see all at once: a darkness with a ring of pale eyes.'],
        [null, 'It does not speak. It only looks at them, every eye at once, the way the deep looks at a pebble dropped into it.'],
      ]);
      await chime(s, { tansy: 'It\'s the Hum. Or it\'s what the Hum looks like when it climbs up out of the water. Either way, it doesn\'t get me twice.', 'jade-rabbit': 'It is not wicked. It is a bad dream that has grown too big for its bed. Guard yourselves when it sinks; it will strike when it rises.', any: 'When it goes under, brace yourselves!' });
    }
    const r = await s.battle('c2.tidewarden');
    if (r !== 'win') return;
    s.set('g_ch2_done'); s.set('c2_tidewarden');
    s.sfx('fade-sigh');
    await lines(s, [
      [null, 'The ring of eyes closes, one by one, like a sleeper settling. The great shape sinks back into the pool, and the black water goes still and clear.'],
      [null, 'Far, far below, deeper than the pool, deeper than anything, something turns over in its sleep. The humming in the walls grows a little softer.'],
      ['tansy', 'It\'s gone quieter. In my head. Bramble, it\'s gone quiet.'],
      ['bramble', 'Then let\'s go home.'],
    ]);
    if (s.party().includes('jade-rabbit')) await s.say('jade-rabbit', 'The Sleeper dreamed a little easier just now. Your Yarrow\'s rhyme is right, I think. It will need every warren, all at once.');
    s.sfx('victory');
    await s.narrate('Silverdown woken, the moon\'s light given back, Tansy found. Chapter 2 is complete.');
    s.quest('Chapter 3: from the Lookout Stone, Wheatsheaf is next.');
    s.save();
    if (G.data.maps['c0-downs']) {
      const c = await s.ask('tansy', 'Take me home, Bramble. I want to see the warren mouth. I want to beat you to it.', ['Go home to Sorrel Down', 'Stay a while']);
      if (c === 0) await s.warp('c0-downs', 'north');
    }
  },
};
