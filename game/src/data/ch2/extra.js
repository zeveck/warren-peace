// Chapter 2's people and words: bestiary, memories, banter (Talk, map-entry bubbles, pairs), quests, places,
// the home rabbits' Chapter 2 lines (home.<id>.ch2), and Silverdown's and the Moon's friends visiting Thimblebank.
import { G } from '../../core.js';
import { flag, travelling } from '../../state.js';

const away = id => () => !travelling().includes(id);

// ---------------------------------------------------------------- bestiary
export const bestiary = {
  aster: 'Aster, chief of Silverdown: moon-pale, poetic, stuck on the second line of a poem for three summers. Woken, she leads the Silverdown Rabbits.',
  'pigeon-rider': 'Silverdown rabbits ride pigeons over the downs. Hum-taken, they dived on anything that wasn\'t humming. Woken, they mostly get dived on by their own pigeons.',
  'jade-rabbit': 'The Jade Rabbit pounds the elixir of long life under the cassia tree on the Moon. Serene, generous, a little lonely after a thousand years.',
  change: 'Chang\'e lives in the Moon Palace and watches the downs through her window. Kind and sad. She knows about the Sleeper\'s dreams.',
  'wu-gang': 'Wu Gang chops the cassia tree on the Moon, and every night it heals. He has got used to it. The tree enjoys the company.',
  'moon-toad': 'The three-legged Moon Toad keeps a pearl stall in the crater warren. No refunds. Croak.',
  traveller: 'A hungry old traveller on the Moon\'s silver road. Bramble shared his sweetgrass, and the traveller vanished without a footprint.',
  'moon-hare': 'The Moon Hares: long-eared, silver, very fond of votes. They rang the lantern grove so the Moth Queen\'s moths couldn\'t reach her.',
  'moth-queen': 'The Moth Queen of the lantern grove. Hum-touched, she stole everything that glowed. Woken, she was mostly frightened of the dark.',
  wick: 'Wick, a small Lantern Moth who wanted his light back. He carried a flame from Chang\'e\'s palace to the grove and now leads the Lantern Moths.',
  'lantern-moth': 'Lantern Moths glow warm gold when they\'re happy. Hum-touched, their glow went grey and they hummed instead.',
  'dust-hopper': 'Dust Hoppers bounce about the Moon\'s silver dust. Not wicked; just very bouncy, and lately very cross.',
  'drowned-eye': 'Drowned Eyes float in the black water of the Drowned Halls, opening and shutting. They are what it feels like to be watched.',
  'cold-ripple': 'A Cold Ripple is a shiver that runs across still water and keeps going, out onto the floor and up your legs.',
  'moving-carving': 'Carvings that turn their heads when you aren\'t looking. In the Drowned Halls they stopped waiting for you not to look.',
  tidewarden: 'The Tidewarden: a vast shape under the Drowned Pool that rose as a ring of pale eyes. Not wicked. A bad dream grown too big for its bed.',
  tansy: 'Tansy, Bramble\'s best friend: quick, sharp-tongued, loyal. Carried off in the attack, she left marks all the way down. Found Hum-taken in the Drowned Halls, and woken.',
};

// ---------------------------------------------------------------- memories (finale stories)
export const memories = {
  'mem-traveller': { title: 'The old traveller', friend: 'jade-rabbit', line: 'On the Moon, Bramble gave his last sprig of sweetgrass to a hungry old traveller, and the Jade Rabbit saw.', eye: 'The Eye has never been given anything. It looks at the little dry sprig for a very long time.', bg: 'moon', hint: 'Share with someone hungry on the Moon.' },
  'mem-wick': { title: 'Wick\'s flame', friend: 'wick', line: 'A small moth carried one warm flame across the Moon, and a whole grove lit up again, tree by tree.', eye: 'The Eye has dreamed of nothing but dark. It watches the little flame spread, and does not look away.', bg: 'moon', hint: 'Help the little Lantern Moth in the grove.' },
};

// ---------------------------------------------------------------- banter
const T = (who, line, cond) => ({ who, line, cond });
const hasT = () => flag('g_recruit_tansy');
export const banter = {
  'talk.silverdown': [
    T('burdock', 'Hmph. Chalk tunnels. Whitewashed. Showing off, I call it. Good digging, though.'),
    T('burdock', 'Silverdown\'s woken. One warren back. Two to go. Then Flintcomb.', () => flag('g_freed_silverdown')),
    T('mole', 'All those pigeons! I never knew rabbits could keep birds. I wonder if they\'d keep a mole.'),
    T('mole', 'Aster\'s kits came and sniffed my nose. All of them, one after another. I didn\'t mind a bit.', () => flag('g_freed_silverdown')),
    T('ratty', 'Pale chalk, pale grass, pale rabbits. It wants a river through it, if you ask me. Everything does.'),
    T('badger', 'A warren is its chief. Wake the chief and you\'ve woken the hill. Remember that for the next one.'),
    T('toad', 'They humming at ME? At Toad of Toad Hall? I have never been so thoroughly ignored. I rather hated it.'),
    T('cheshire-cat', 'Everyone here hums the same note. Very tidy. I prefer a warren where everyone\'s mad in their own key.'),
    T('caterpillar', 'Who are YOU, they ought to ask. Nobody here asks anything. Most unsatisfactory.'),
    T('ninefold', 'The humming here is a little like home. I do not like that it is a little like home.'),
    T('jade-rabbit', 'Your Silverdown keeps its eyes on the sky. My moon has watched it back for a very long time.', () => flag('g_recruit_jade-rabbit')),
    T('tansy', 'I scratched marks all the way down from here. I wasn\'t sure anyone would ever read them. You did. Obviously.', hasT),
  ],
  'talk.moon': [
    T('burdock', 'Ground\'s too soft. Dust. Can\'t dig in dust. Hmph. Pretty, though.'),
    T('mole', 'I keep looking for home up there. That little blue ball. Is Mole End on it? It must be, mustn\'t it?'),
    T('ratty', '"The silver dust lay soft and deep, the tree was chopped, and still would keep." Hm. Needs work.'),
    T('badger', 'Wu Gang\'s been chopping a thousand years and never once complained to me. I respect that.'),
    T('toad', 'A toad keeps the shop on the moon! Three legs! Imagine what I could do with three legs. Poop-poop!'),
    T('cheshire-cat', 'The moon\'s grinning tonight. Or I am. One of us is, anyway.'),
    T('caterpillar', 'The moon is quite the wrong size for a moon, from here. Hm. I approve.'),
    T('ninefold', 'There is so much sky. I keep looking for its ceiling. It does not seem to have one. That is very brave of it.'),
    T('jade-rabbit', 'My mortar is quiet without me. Wu Gang will talk to it. He talks to everything.', () => flag('g_recruit_jade-rabbit')),
    T('tansy', 'I was on the MOON and I don\'t remember a thing. That\'s the most annoying sentence I\'ve ever said.', hasT),
  ],
  'talk.drowned': [
    T('burdock', 'Water where tunnels should be. Somebody dug wrong, long ago. Hmph.'),
    T('mole', 'It\'s cold enough to make your whiskers ache. I wish I\'d brought my scarf. I wish I HAD a scarf.'),
    T('ratty', 'I\'ve never met water I didn\'t like until now. This water doesn\'t want to go anywhere. That\'s the trouble with it.'),
    T('badger', 'Carvings that turn their heads. Keep your own head down and your feet moving.'),
    T('toad', 'I am NOT frightened. I am merely walking very close to Badger, for warmth.'),
    T('cheshire-cat', 'They watch you here. I do sympathise. I\'m usually the one doing it.'),
    T('caterpillar', 'All these eyes and not one asks a decent question.'),
    T('ninefold', 'This is a deep place. Not my deep. Further down than my deep. Please stay close to me; I am easier to find than a door.'),
    T('jade-rabbit', 'The water rises and falls with the moon, even here. It is listening to her, a little.', () => flag('g_recruit_jade-rabbit')),
    T('tansy', 'I don\'t like it down here. I liked it even less when I did like it. If that makes sense. It doesn\'t.', hasT),
    T('tansy', 'Bramble. Thanks for coming. Don\'t make that face. I said it once. That\'s all you get.', hasT),
  ],
  'enter.c2-silverdown': [T('burdock', 'Hmph. Pigeons. Up there. Watch the sky.'), T('mole', 'Everything\'s so pale here! Like a field with the colour washed out.'), T('toad', 'A pigeon looked at me. Rudely.')],
  'enter.c2-silverdown-warren': [T('badger', 'Whitewashed walls. Somebody cared about this warren once. They will again.'), T('ninefold', 'The humming is in the walls here. I can feel it in my folds.'), T('ratty', 'Smells of chalk and pigeons. Not a drop of river.')],
  'enter.c2-depths': [T('mole', 'Those are her pawprints! Oh, quickly, Bramble!'), T('burdock', 'Old stone. Older than the warren. Mind your feet.'), T('ninefold', 'This way goes down. Most ways do, in the end.')],
  'enter.c2-underway': [T('ninefold', 'Another Underway. Every warren has one, and they all smell faintly of me.'), T('badger', 'The same round room. The same faces. Someone built all of these.'), T('mole', 'A stair made of moonlight! Who ever heard of such a thing?')],
  'enter.c2-moon': [T('toad', 'The moon! Naturally. Toad goes everywhere eventually.'), T('ratty', 'Silver dust and stars and not a drop of river.'), T('jade-rabbit', 'Home. It is very quiet without the moths glowing.', () => flag('g_recruit_jade-rabbit'))],
  'enter.c2-moon-palace': [T('mole', 'Real lanterns! Warm ones! The only warm thing on the whole moon.'), T('cheshire-cat', 'A palace. Somebody here is lonely. Palaces are where lonely people keep their things.')],
  'enter.c2-moon-craters': [T('badger', 'Hares. Long legs, short tempers. Mind your manners.'), T('caterpillar', 'Hares. Hm. Too many ears.'), T('toad', 'A shop! I smell a SHOP.')],
  'enter.c2-moon-grove': [T('ninefold', 'The moths hum the same note as Silverdown. It is everywhere.'), T('mole', 'It\'s like a Christmas wood with all the candles blown out.'), T('jade-rabbit', 'My pestle is somewhere in here. I can hear it humming.', () => !flag('c2_mothQueen'))],
  'enter.c2-drowned': [T('ratty', 'This water\'s not right. It isn\'t going anywhere.'), T('jade-rabbit', 'The moon\'s pull reaches even here. Faintly.'), T('tansy', 'Back here. Great. Brilliant. Let\'s be quick.', hasT)],
  'enter.c2-drowned-pool': [T('tansy', 'That\'s what was watching me. Day and night.', hasT), T('badger', 'Rest first. Then we face it.'), T('ninefold', 'There are more eyes down there than I have. I did not know that was possible.')],
  pairs: [
    { id: 'c2-tansy-bramble-1', a: 'tansy', b: 'bramble', cond: hasT, lines: [
      ['tansy', 'So. You came all the way down. Through the moon. For me.'],
      ['bramble', 'You left marks. "B, hurry up." What else was I going to do?'],
      ['tansy', 'You could have hurried up, for a start.'],
      ['bramble', 'I went to the MOON, Tansy.'],
      ['tansy', 'Excuses. Your ear\'s still flopping, by the way. I missed it. Don\'t tell anyone.'],
    ] },
    { id: 'c2-tansy-burdock', a: 'tansy', b: 'burdock', cond: hasT, lines: [
      ['tansy', 'Burdock! You came too? You hate going anywhere.'],
      ['burdock', 'Hmph. Somebody had to keep him from getting lost.'],
      ['tansy', 'And did you?'],
      ['burdock', 'He went to the moon.'],
      ['tansy', 'So that\'s a no.'],
      ['burdock', 'Hmph. Glad you\'re back, girl.'],
    ] },
    { id: 'c2-jade-ninefold', a: 'jade-rabbit', b: 'ninefold', cond: () => flag('g_recruit_jade-rabbit'), lines: [
      ['ninefold', 'You did not scream when you met me. I have been meaning to thank you for that.'],
      ['jade-rabbit', 'I have looked at the dark every night for a thousand years. You are the kindest piece of it I have seen.'],
      ['ninefold', 'Oh. Oh, that is the nicest thing. I will keep it next to my dandelion.'],
      ['jade-rabbit', 'Then I will make you a mooncake, to keep beside them both.'],
    ] },
    { id: 'c2-jade-mole', a: 'jade-rabbit', b: 'mole', cond: () => flag('g_recruit_jade-rabbit'), lines: [
      ['mole', 'Is it lonely? Living on the moon? I was lonely once, before Ratty. I didn\'t know I was, till I wasn\'t.'],
      ['jade-rabbit', 'Yes. It was. I did not know either, until a brown rabbit gave away his sweetgrass in front of me.'],
      ['mole', 'Oh, Bramble does things like that. He can\'t help it.'],
      ['jade-rabbit', 'No. I do not think he can. It is why I came.'],
    ] },
    { id: 'c2-toad-moontoad', a: 'toad', b: 'ratty', area: 'moon', lines: [
      ['toad', 'Ratty, did you see her counter? Three legs and a counter of solid moon-rock! I must have one for Toad Hall.'],
      ['ratty', 'You don\'t need a counter, Toady. You haven\'t got anything to sell.'],
      ['toad', 'I could sell... adventures! Toad\'s Lunar Excursions! Poop-poop!'],
      ['ratty', 'Heaven help the moon.'],
    ] },
    { id: 'c2-tansy-ninefold', a: 'tansy', b: 'ninefold', cond: hasT, lines: [
      ['tansy', 'You\'re... a lot of eyes.'],
      ['ninefold', 'Nine. I am sorry. Please do not scream.'],
      ['tansy', 'I\'ve just spent a week digging toward a door with one enormous eye on it. Nine is cosy.'],
      ['ninefold', 'Cosy! Nobody has ever called me cosy. I will keep it forever.'],
    ] },
  ],
};

// ---------------------------------------------------------------- quests
export const quests = [
  { title: 'Wake Silverdown', show: () => flag('g_c2-rts2_won'), done: () => flag('g_freed_silverdown'),
    step: () => 'Go down into Silverdown Warren and wake Aster in its Heart.' },
  { title: 'Tansy\'s Trail', show: () => flag('g_freed_silverdown'), done: () => flag('g_recruit_tansy'),
    step: () => !flag('g_underway_c2') ? 'Follow Tansy\'s pawprints down through Silverdown Depths.'
      : !flag('g_recruit_jade-rabbit') ? 'The drowned stair is under water. Climb the moonbeam stair and find a way to move it.'
      : 'Go down the drowned stair and find Tansy in the Drowned Halls.' },
  { title: 'The Jade Rabbit\'s Pestle', show: () => flag('c2_metJade'), done: () => flag('g_recruit_jade-rabbit'),
    step: () => !flag('c2_traveller') ? 'Someone hungry is sitting by the path below the cassia tree.'
      : !flag('c2_jadeTold') ? 'Go back to the Jade Rabbit under the cassia tree.'
      : !flag('c2_metChange') ? 'Ask Chang\'e in the Moon Palace to speak to the Moon Hares.'
      : !flag('c2_hares') ? 'Find the Hares\' elder in the crater warren.'
      : !flag('c2_mothQueen') ? 'Win the pestle back from the Moth Queen in the lantern grove.' : 'Take the pestle back to the Jade Rabbit.' },
  { title: 'Wick\'s Flame', show: () => flag('c2_wickAsked'), done: () => flag('g_recruit_wick'),
    step: () => !flag('c2_wickFollows') ? 'Talk to Wick, the little grey moth in the grove.'
      : !flag('c2_flame') ? 'Take Wick to a lantern in Chang\'e\'s palace.' : 'Carry the flame back to the heart-lantern of the grove.' },
  { title: 'The Tidewarden', show: () => flag('g_recruit_tansy'), done: () => flag('g_ch2_done'),
    step: () => 'Rest at the mossy stone in the Drowned Pool, then walk out along the broken jetty.' },
];

// ---------------------------------------------------------------- places (camp Map)
export const places = [
  { name: 'Silverdown', map: 'c2-silverdown', cond: () => flag('g_ch2_open') },
  { name: 'Silverdown Warren', map: 'c2-silverdown-warren', cond: () => flag('c2_sw_seen') },
  { name: 'Silverdown Depths', map: 'c2-depths', cond: () => flag('c2_dp_seen') },
  { name: 'Silverdown\'s Underway', map: 'c2-underway', cond: () => flag('g_underway_c2') },
  { name: 'The Moon', map: 'c2-moon', cond: () => flag('c2_mn_seen') },
  { name: 'The Moon Palace', map: 'c2-moon-palace', cond: () => flag('c2_mp_seen') },
  { name: 'The Crater Warren', map: 'c2-moon-craters', cond: () => flag('c2_mc_seen') },
  { name: 'The Lantern Grove', map: 'c2-moon-grove', cond: () => flag('c2_mg_seen') },
  { name: 'The Drowned Halls', map: 'c2-drowned', cond: () => flag('c2_dr_seen') },
  { name: 'The Drowned Pool', map: 'c2-drowned-pool', cond: () => flag('c2_pool_seen') },
];

// ---------------------------------------------------------------- home: Thimblebank during Chapter 2
// one line before Tansy is home, one after (g_recruit_tansy)
const H = {
  yarrow: [
    ['Silverdown, eh? Their old chief\'s grandmother sealed a door, same as ours. The old ones all knew. None of us said.', 'The moon, you say? Hm. My granny always said the moon had a rabbit in it. I thought she meant the shadows.'],
    ['Tansy. Come here, child. Let an old blind rabbit feel your ears. ...Yes. Both still there. Good.', 'Two warrens woken. When all the warrens thump as one... we\'re getting there, Bramble. We\'re getting there.'],
  ],
  mallow: [
    ['Silverdown pays in pigeon feathers, if you let them. Don\'t let them. Buttons, Bramble. Always buttons.'],
    ['Tansy\'s back and she\'s already haggled me down on a carrot. Twice. Welcome home, menace.'],
  ],
  woodruff: [
    ['A rabbit in the moon? Oh, there IS a story like that. A very old one. A rabbit who had nothing to give but itself...', 'Tell me everything about the Moon Hares. Slowly. I\'m writing it down. In my head. Which is full.'],
    ['Tansy found, the moon visited, a deep thing sent back to sleep. That\'s a whole winter of stories. I may never stop talking.'],
  ],
  comfrey: [
    ['Mooncakes! Heal a rabbit right up, they say. I\'d love the recipe. I\'d settle for a crumb.'],
    ['Let me look at Tansy. ...Cold to the bone, still. Clover tea and a warm nest. She\'ll argue. Ignore her.'],
  ],
  'home-1': [['Clary here. I watched the north all night. The dovecotes at Silverdown had their lamps lit. First time in weeks.'], ['I counted the stars again last night. Then I counted Tansy. Still here. Good.']],
  'home-2': [['Silverdown whitewash their tunnels? Pff. Whitewash is for rabbits who can\'t dig straight.'], ['Tansy\'s back. First thing she said was my drainage looked "fine". FINE. She\'s definitely back.']],
  'home-3': [['They say Silverdown\'s rabbits ride pigeons. RIDE them. I need to try that. For science.'], ['Tansy challenged me to a jump. I won. She says she let me win. She did not let me win. Probably.']],
  'home-4': [['I planted a row of clover for Tansy, for when she\'s home. It\'s come up in a T. I didn\'t plan that. I think.'], ['Tansy ate the T. All of it. I\'m so happy I could cry. I did cry, a bit.']],
  'home-5': [['Silverdown? I\'d have gone. I was just... guarding the warren mouth. Somebody had to. Very important.'], ['Tansy says I talk tough. I said I don\'t. She said "see". I don\'t know what she meant by that.']],
  'home-6': [['I wrote a song about the moon. It\'s very sad. Then I heard there are hares up there who vote on things, and now it\'s a funny song.'], ['Tansy asked me to sing the moon song. Then she laughed at the voting verse. That\'s the right place to laugh.']],
  'home-7': [['Bring her home, Bramble. I\'ve kept her old nest warm. Well. I\'ve kept a kit in it. Same thing.'], ['There she is. That girl. I knew she\'d leave a trail. She always left a trail. Usually of mud, through my nursery.']],
  'home-8': [['Silverdown chalk is softer than ours. Twelve percent softer. I\'ve measured. Don\'t ask me how.'], ['Forty-three baskets in the cellar. One for Tansy\'s homecoming. She ate it before I could count it. Forty-two.']],
  'home-9': [['Is it true you went to the MOON? Did you bring me a bit? Even a small bit? Even dust?'], ['Tansy\'s back! I showed her my thumping. She said it was "adequate". That\'s the BEST thing she\'s ever said to me.']],
  'home-10': [['Eh? The moon? My granny went to the moon. Or she said she did. She said a lot of things.'], ['Eh? Tansy? The sandy one? Back from where? Under the WATER? Well, don\'t do that again, dear.']],
};
const homeScripts = {};
for (const [id, [before, after]] of Object.entries(H)) {
  homeScripts[`home.${id}.ch2`] = async (s, a) => {
    // moon talk only once the moon has been visited; with nothing left to say yet, the Chapter 1 line
    const list = flag('g_recruit_tansy') ? after : before.filter(l => flag('c2_mn_seen') || !/moon/i.test(l));
    if (!list.length) { const f = G.data.scripts[`home.${id}.ch1`]; if (f) await f(s, a); return; }
    const k = `c2_home_${id}`; const n = s.val(k) || 0; s.set(k, n + 1);
    await s.say(id, list[n % list.length]);
    // (Mallow's trade and Comfrey's rest are offered by ch0's home.<id> dispatcher after this)
  };
}
export { homeScripts };

// Thimblebank visitors in Chapter 2: Aster (after she's woken), the Jade Rabbit and Tansy when they're not travelling
export const mapAdds = {
  'c0-warren': {
    npcs: [
      { id: 'c2-aster', sprite: 'aster', x: 15, y: 10, facing: 'nw', talk: 'c2.home.aster', cond: () => flag('g_freed_silverdown') },
      { id: 'c2-jade', sprite: 'jade-rabbit', x: 19, y: 15, facing: 'sw', talk: 'c2.home.jade', cond: () => flag('g_recruit_jade-rabbit') && away('jade-rabbit')() },
      { id: 'c2-tansy', sprite: 'tansy', x: 19, y: 5, facing: 'sw', talk: 'c2.home.tansy', cond: () => flag('g_recruit_tansy') && away('tansy')() },
      { id: 'c2-wick', sprite: 'wick', x: 20, y: 15, facing: 'sw', talk: 'c2.home.wick', cond: () => flag('g_recruit_wick') },
    ],
  },
};
export const homeVisitors = {
  'c2.home.aster': async (s) => {
    await s.say('aster', flag('g_recruit_tansy')
      ? 'I came to see Thimblebank. It\'s smaller than Silverdown, and louder, and warmer. I like it very much. Don\'t tell my warren.'
      : 'Your Yarrow and I have been comparing deep doors. Both our grandmothers sealed theirs the same spring. Isn\'t that strange?');
  },
  'c2.home.jade': async (s) => {
    await s.say('jade-rabbit', 'Your warren is very loud. I have not heard so many voices since... I do not think I ever have. Thank you for bringing me.');
  },
  'c2.home.tansy': async (s) => {
    await s.say('tansy', 'Home. It smells exactly the same. I could cry. I\'m not going to. Go away, Bramble, before I do.');
  },
  'c2.home.wick': async (s) => {
    await s.say('wick', 'It\'s so DARK down here! Don\'t worry, I\'ve got it. There. A little light. Is that better? It\'s better.');
  },
};
