// The Epilogue's words: speakers, bestiary, the memory, banter, quests, places, and the home rabbits' lines
// (home.<id>.ch6, which ch0's dispatch picks from the ending on: until the Epilogue starts they play ch5's lines).
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { started, done, running, nextStep, heapsCleared, clocksPicked, roomsOpen } from './common.js';

export const speakers = {
  shale: { name: 'Shale of Flintcomb', por: 'generic-doe' },
  gault: { name: 'Gault', por: 'generic-buck' },
  chip: { name: 'Chip', por: 'generic-kit' },
  mum: { name: 'Marl, Quarry\'s mum', por: 'generic-doe' },
  ws: { name: 'A Wheatsheaf buck', por: 'generic-buck' },
  sd: { name: 'A Silverdown doe', por: 'generic-doe' },
};

export const bestiary = {
  shale: 'Shale of Flintcomb, the first doe Bramble woke in the white quarry. Remembers her name every morning, and checks. Carried Quarry\'s slate to Sorrel Down.',
  gault: 'Gault, Flintcomb\'s last digger. A year of the Hum taught his paws only "down". His kit Chip, and Quarry\'s needle, taught them "up".',
  chip: 'Chip, Gault\'s kit. Small, brave and very stubborn. Refused to sleep in the new nursery until his dad dug him a bed. Upward.',
  knapper: 'Old Knapper keeps Quarry\'s store in Flintcomb. Deaf as a flint, so the Hum never reached him. He cut the Top Stone, so everyone can feel the hills purr.',
};

export const memories = {
  'mem-flintcomb': { title: 'Digging the other way', friend: 'captain-quarry', line: 'Five warrens and a mastodon, digging upward, and a stone at the top of the hole that says: thump if you\'re lonely.', eye: 'The Eye hears a small thump, far above, and purrs back. It is not lonely any more.', bg: 'epilogue' },
};

const T = (who, line, cond) => ({ who, line, cond: cond || running });
export const banter = {
  'talk.flintcomb': [
    T('burdock', 'Hmph. Quarry digs up now. Badly. He\'ll learn.'),
    T('mole', 'New burrows! Fresh chalk! I\'ve never wanted to whitewash anything so much in all my life.'),
    T('ratty', 'Still not a drop of water. I\'ve told Quarry: a dew-pond, at the bottom of the bowl. He\'s thinking about it. Loudly.'),
    T('badger', 'You build on what\'s left. Always. That\'s the whole secret of it.'),
    T('toad', 'Rebuilding! I rebuilt Toad Hall, you know. Well. Badger did. And Mole. And Ratty. I supervised. Splendidly.'),
    T('cheshire-cat', 'Digging up. How contrary. I approve of contrary.'),
    T('caterpillar', 'They are changing. It is uncomfortable. It is supposed to be.'),
    T('ninefold', 'The hole purrs. I sat by it and purred back. It did not mind. I think we are friends now.'),
    T('jade-rabbit', 'I said something would grow here. Dandelions are a very good something.'),
    T('tansy', 'I hated this place. I don\'t, now. That\'s the strangest thing that\'s happened all year, and it\'s been a strange year.'),
    T('pip', 'Flintcomb kits play the same games as us! Except their hide-and-seek is in holes. They always win.'),
    T('tin-woodman', 'Nobody is crying here any more. Except me, a little, with happiness. Pass the oil-can, Rumble.'),
    T('captain-quarry', 'Up. Every claw-stroke up. My paws keep forgetting. I keep reminding them.'),
    T('rumble', 'Rumble shoves heaps! Rumble is heap-shover now. Best job. HRRMP.'),
  ],
  'enter.c6-upburrow': [T('pip', 'Thump the walls!'), T('captain-quarry', 'Up, for once.'), T('mole', 'Fresh chalk!'), T('burdock', 'Hmph. Good digging.'), T('tansy', 'Smells like home. Somebody else\'s.')],
  pairs: [
    { id: 'burdock-quarry-2', a: 'burdock', b: 'captain-quarry', cond: started, lines: [
      ['burdock', 'Hmph. You\'re digging down again. Left paw.'],
      ['captain-quarry', 'I am NOT. That\'s... sideways. Sideways with a lean.'],
      ['burdock', 'Up.'],
      ['captain-quarry', 'Up. Yes. Up.'],
      ['burdock', '...Better.'],
    ] },
    { id: 'mole-badger-whitewash', a: 'mole', b: 'badger', cond: started, lines: [
      ['mole', 'Badger! They\'ve got a whitewash bucket! A real one! In Flintcomb!'],
      ['badger', 'Everything in Flintcomb is white already, Mole.'],
      ['mole', 'Not THIS white. Not fresh white. There\'s white and there\'s spring-cleaning white.'],
      ['badger', '...Go on, then. Just the nursery.'],
      ['mole', 'Oh, bother whitewash! No. Whitewash is lovely, actually.'],
    ] },
    { id: 'pip-rumble-kits', a: 'pip', b: 'rumble', cond: started, lines: [
      ['pip', 'Rumble, how many kits can sit on you at once?'],
      ['rumble', 'Rumble does not know. Rumble has not run out of back yet.'],
      ['pip', 'There were eleven this morning! Eleven! I counted twice!'],
      ['rumble', 'Twelve. One was hiding in the fur. Rumble felt.'],
      ['pip', 'I\'m writing that down. Twelve.'],
    ] },
  ],
};

export const quests = [
  { title: 'Flintcomb\'s Rebuilding', show: () => flag('g_won'), done, step: nextStep },
  { title: 'The Spoil Heaps', show: started, done: () => flag('c6_heaps_done'), step: () => `Take Rumble to the three spoil heaps in Flintcomb's bowl, and use them (${heapsCleared()} of 3).` },
  { title: 'Seed for the Bowl', show: started, done: () => flag('c6_sown'), step: () => `Pick the dandelion clocks on Flintcomb's west downs (${clocksPicked()} of 5), and blow them over the chalk where the heaps were.` },
  { title: 'The Old Rooms', show: started, done: () => flag('c6_rooms_done'), step: () => `In the new burrows (the door in the west bank), thump the alcoves: hollow ones boom (${roomsOpen()} of 3). The tally-stone has clues.` },
  { title: 'The Last Digger', show: () => flag('c6_gault_met') || flag('c6_room_nursery'), done: () => flag('c6_gault_done'), step: () => flag('c6_room_nursery') ? 'Bring Chip, from the new nursery, down the spiral to his dad, Gault, at the lip.' : 'Gault won\'t stop digging at the lip. Maybe once there\'s a nursery to dig for.' },
  { title: 'The Top Stone', show: () => flag('c6_ready_said'), done, step: () => 'Go down Flintcomb\'s spiral to the lip of the hole. Knapper has finished the stone.' },
];
export const places = [{ name: 'The New Burrows', map: 'c6-upburrow', cond: () => flag('c6_seen_upburrow') }];

// ---------------------------------------------------------------- the home rabbits: [while Flintcomb rebuilds, after]
const H = {
  yarrow: [['Flintcomb\'s sent for you. Digging, this time, and upward. Go on. I\'ll come down for the end; my knees insist on the end.'], ['A stone at the top of a hole, with the right words on it. That\'s worth a sore knee. Two sore knees.']],
  mallow: [['Flintcomb\'s rebuilding? Then they\'ll want buttons. I\'ve sent a cart. On credit. Don\'t look at me like that.'], ['Flintcomb paid me back in flint. Overpriced flint. Their own, which I then sold back to them. Everybody\'s happy.']],
  woodruff: [['Digging the other way. I like that. I\'m putting it at the end of the story, after the bit with the Eye.'], ['"And then they set a stone at the top of the hole, and it said: thump if you\'re lonely." The kits thump on the nursery floor now, every night. Just in case.']],
  comfrey: [['Flintcomb paws, mending paws, digging paws. I\'ve sent salve. Tell Quarry to USE it, not eat it.'], ['Gault came by with Chip. Paws quite still. Sat in my kitchen an hour and never scraped once. I made him a cake.']],
  'home-1': [['There\'s dust over Flintcomb again! Good dust, they tell me. Building dust.'], ['There\'s green on the white, from the Lookout. A thumbprint of green on Flintcomb. I\'ve looked at it every morning.']],
  'home-2': [['Dandelions? In chalk? Of course. I told Quarry. Dandelions grow where nothing else will. Nobody listens to Hob. He listened!'], ['They\'re talking about a dew-pond. I\'ve sent drawings. Proper drainage this time. A whole page on drainage.']],
  'home-3': [['Rumble shoving heaps into a hole? I want to see that. I want to jump the heaps first.'], ['I jumped the Top Stone. Quarry said don\'t. I did anyway. It purred. I think it liked it.']],
  'home-4': [['My first sack of clover seed came up in one little corner of Flintcomb. Now there\'s dandelions too! Two kinds of green!'], ['They sent me a jar of Flintcomb clover. It tastes of flint a little. I love it.']],
  'home-5': [['I\'m going to Flintcomb to help! Or to have words. I\'ll decide when I get there.'], ['I helped! I carried one stone. A small one. Very carefully. Quarry said "decent". I\'m having it framed.']],
  'home-6': [['The tune under the ground is so quiet now, I have to put my ear right down. It\'s humming in its sleep.'], ['Flintcomb\'s stone purrs when you thump it. I thumped it in time. I think I taught the Sleeper a song.']],
  'home-7': [['Flintcomb\'s kits sleeping by a hole! Not for much longer, if I know you. Take them a lullaby. One about up.'], ['Twelve nests in Flintcomb\'s nursery, with a window of morning. I sang in it. Every kit asleep in four minutes.']],
  'home-8': [['Flintcomb digging upward. Upward! I\'ve asked to see their plans. For professional reasons.'], ['Their new burrows are measured to the claw. Upward. It\'s very good work. I told Quarry so. It nearly killed me.']],
  'home-9': [['Rumble shoves HEAPS? Like, whole heaps? Can I go? Can I sit on Rumble? Pip says twelve kits can!'], ['I went! I sat on Rumble! I was number thirteen! Pip says it doesn\'t count. It COUNTS.']],
  'home-10': [['Eh? Flintcomb, digging up? In my day, up was where the sky was. Mind the sky.'], ['Eh? A stone that purrs? Well. In my day stones just sat there. This is better.']],
};
export const homeScripts = {};
for (const [id, [during, after]] of Object.entries(H)) {
  homeScripts[`home.${id}.ch6`] = async (s, a) => {
    if (!started()) {
      // before the Epilogue begins: Chapter 5's after-the-ending lines, unchanged
      const f = G.data.scripts[`home.${id}.ch5`]; if (f) await f(s, a);
    } else {
      const list = done() ? after : during;
      const k = `c6_home_${id}`; const n = s.val(k) || 0; s.set(k, n + 1);
      await s.say(id, list[n % list.length]);
    }
    // New Game+ hangs its offer off Woodruff (conflict C in design/changes/REVIEW.md)
    if (id === 'woodruff') { const f = G.data.scripts['ng.offer']; if (f && flag('g_won')) await f(s); }
  };
}
