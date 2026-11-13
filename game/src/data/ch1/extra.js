// Chapter 1's people and words: speakers, bestiary, memories, banter, quests, places, the shop, and what ch1
// adds to Thimblebank (the home visit, recruits by the fire, the five rescued rabbits).
import { flag, getVal, travelling } from '../../state.js';

const away = id => () => !travelling().includes(id);   // recruits stand in Thimblebank when not travelling

export const speakers = {
  washerwoman: { name: 'A washerwoman', por: 'toad' },
  weasel: { name: 'A weasel', por: 'chief-weasel' },
  'field-mouse': { name: 'Field-mouse', por: 'generic-kit' },
};

export const bestiary = {
  mole: 'Mole of Mole End. Earnest, easily delighted, homesick. He had never seen a river until the day he met Bramble.',
  ratty: 'The Water Rat. Easy-going, poetic, and happiest messing about in boats. Knows the Wild Wood a bit, and says so.',
  badger: 'Badger of the Wild Wood. Gruff, wise, hates Society, and will not let any young creature be taken from home.',
  toad: 'Toad of Toad Hall. Boastful, generous, impulsive. Lost his Hall to the weasels and won it back with a secret passage.',
  otter: 'Otter keeps Ratty\'s Riverside Swap. Buys anything shiny. Sells anything that floats.',
  hedgehog: 'Two hedgehog lads, lost in the snow on their way to school. Very fond of porridge and of Mr. Badger.',
  caroller: 'The field mice of Mole End, who sing at his door every winter, even in the dark. Especially in the dark.',
  'chief-weasel': 'The Chief Weasel took Toad Hall when the Wild Wood went cold and humming. Said sorry eleven times after.',
  weasel: 'Weasels, stoats and ferrets of the Wild Wood. Snappish this winter, with a faint blue in their eyes. Not wicked, only cold.',
  chert: 'Chert of Flintcomb, a raider woken in the Great Burrow. The first proof that waking works. Sad, decent, making amends.',
  'dazed-earthworm': 'Earthworms of the Depths, gone dozy and strange. They wriggle at anything warm.',
  'burrowing-beetle': 'Burrowing beetles: quick, clicky, and very sure the tunnels are theirs.',
  'root-tangler': 'Old roots that grip and creak. They have been trodden on for a hundred years and are tired of it.',
  stoat: 'Stoats of the Wild Wood: bigger than weasels, slower, and much more sure of themselves.',
  'ferret-sentry': 'Ferret sentries keep watch for the Chief Weasel. They shout a great deal and listen very little.',
  washerwoman: 'A washerwoman with a large green face, goggles under her bonnet, and webbed hands. Nobody was fooled.',
};

export const memories = {
  'mem-river': { title: 'The river', friend: 'mole', line: 'Mole saw a river for the first time, and it was laughing, and going somewhere, and he kept it.', eye: 'The Eye remembers water: cold, far down, moving. It had forgotten water could laugh.', bg: 'riverbank', hint: 'Bring Mole to the River Bank.' },
  'mem-pebble': { title: 'Tansy\'s chalk pebble', friend: 'pip', line: 'A white pebble rolled home from the east, scratched with Tansy\'s mark: she was still herself enough to leave a sign.', eye: 'The Eye turns the little stone over. Something taken, and still remembering its own name.', bg: 'downs', hint: 'Go home after the River Bank.' },
};

// ---------------------------------------------------------------- banter
const T = (who, line, cond) => ({ who, line, cond });
export const banter = {
  'talk.depths': [
    T('cheshire-cat', 'Tunnels going down, and down, and down. I do like a story that won\'t say where it\'s going.'),
    T('caterpillar', 'Damp. Dark. Roots. And YOU, asking how I like it. I don\'t.'),
    T('ninefold', 'These tunnels are very young. I mean that kindly. They have hardly any eyes at all.'),
    T('chert', 'Flintcomb has a door like this one, under the quarry. We dug right past it. Nobody stopped to wonder why it was there.'),
    T('burdock', 'Hmph. Older than our tunnels, these. Someone dug them who knew what they were doing.'),
    T('burdock', 'Stay where I can see your ears. Both of them. Even the floppy one.'),
    T('mole', 'Lovely deep tunnels! Damp, though. Somebody ought to whitewash them.'),
    T('ratty', 'Too far from water for my liking. I keep listening for a river and hearing that hum instead.'),
    T('badger', 'Good old work. Rabbits dug these, a long time ago, and then stopped. I wonder why they stopped.'),
    T('toad', 'Dark, damp, and no motor-cars. I shall write a strongly worded letter.'),
  ],
  'talk.underway': [
    T('cheshire-cat', 'Three doors, and one of them a keyhole. I came in by that one. Or I will have. Time is so untidy down here.'),
    T('caterpillar', 'A round room. Doors. A rabbit. I have seen all this before, and it was no more interesting then.'),
    T('ninefold', 'This is a crossroads. My people would sit here and count the travellers. There were never any. Until you.'),
    T('burdock', 'The eye door\'s open now. Hmph. I liked it shut.', () => flag('c1_eye_open')),
    T('burdock', 'Three doors. The eye one can stay shut.'),
    T('mole', 'It\'s ever so round. Like being inside an egg. A very old, very quiet egg.'),
    T('ratty', 'The river door smells of home. I\'d know that weed anywhere.'),
    T('badger', 'Somebody carved these doors for travellers. Somebody who expected us.'),
    T('toad', 'A door for every occasion! I approve. Toad Hall has forty-one.'),
  ],
  'talk.riverbank': [
    T('cheshire-cat', 'A river that laughs. How very sensible of it. Most rivers just mutter.'),
    T('caterpillar', 'Water. Willows. A Rat in a boat reciting poetry. Hmph. Mine was better.'),
    T('ninefold', 'The sky is so very large here. I have closed six of my eyes and it is still too large. It is wonderful.'),
    T('burdock', 'Water. Lots of it. Going somewhere fast. Hmph. I don\'t trust it.'),
    T('ratty', 'Listen to her, chattering away. The river, I mean. She\'s never quiet, and never dull.'),
    T('ratty', 'Believe me, there\'s nothing half so much worth doing as messing about in boats.', () => flag('g_recruit_mole')),
    T('mole', 'I still can\'t get over it. All that water, all at once, and nobody minding.'),
    T('badger', 'The bank is pleasant. I do not care for pleasant. It makes animals soft.'),
    T('toad', 'The river is all very well, but have you ever seen a road? A long, straight, empty road?'),
  ],
  'talk.wildwood': [
    T('cheshire-cat', 'Snow at dusk, and a hum under the roots. Somebody\'s dreaming badly. Not me. I dream in grins.'),
    T('ninefold', 'The trees here hum the way the Shallows do. Very faintly. I would rather they sang.'),
    T('burdock', 'Too dark, too early. Keep the little ones in the middle.'),
    T('ratty', 'Never been this dark. Never been this cold. Something\'s wrong under the roots.'),
    T('mole', 'I came to see the snow. I didn\'t think the snow would look back.'),
    T('badger', 'My wood. Mine, and it has gone sour. I will find out why, and then I will be very cross.'),
    T('toad', 'I\'m not frightened. Toads are never frightened. Is that a weasel? Stand in front of me.'),
  ],
  'talk.moleend': [
    T('mole', 'It\'s only small. But it\'s mine, and it was waiting for me.'),
    T('ratty', 'Snug as anything. Moly, you\'ve a gift for snugness.'),
    T('burdock', 'Good little burrow. Tidy. I like a tidy burrow.'),
  ],
  'talk.badger': [
    T('cheshire-cat', 'A badger who hates visitors, with the warmest kitchen in the wood. We\'re all mad here, you see.'),
    T('ninefold', 'Mr. Badger offered me porridge and did not scream. I have written it down. I have nine places to write things down.'),
    T('badger', 'Sit down. Eat. A full animal is a sensible animal.'),
    T('ratty', 'Badger\'s kitchen! I could stay here all winter. I nearly did, once.'),
    T('mole', 'The hams! The fire! The porridge! I feel I could do anything after this porridge.'),
    T('toad', 'Badger\'s cooking is very plain. Very plain indeed. Is there more?'),
    T('burdock', 'Hmph. A badger who keeps his tunnels clean. I could get to like him.'),
  ],
  'talk.toadhall': [
    T('burdock', 'Big house. Too many windows. Where do you dig?'),
    T('toad', 'My Hall! My lovely Hall! Mind the carpets. Mind the portraits. Mind the jam.'),
    T('badger', 'Quietly, Toad. And then, after, as loudly as you like.'),
    T('ratty', 'Smells of weasel. And gravy. Mostly gravy.'),
    T('mole', 'It\'s ever so big. How does anyone find the bathroom?'),
  ],
  'enter.c1-depths': [T('burdock', 'Hmph. Older than our tunnels. Mind your ears.'), T('mole', 'Lovely deep tunnels! Damp, though.'), T('toad', 'Underground again? Very well. I shall be brave about it.')],
  'enter.c1-underway': [T('burdock', 'Three doors. I don\'t like the eye.'), T('ratty', 'The river door smells of home.'), T('badger', 'A crossroads. Built by someone who expected travellers.')],
  'enter.c1-riverbank': [T('burdock', 'Sunshine. Under the ground. Don\'t think about it.'), T('ratty', 'Home! Hullo, river!'), T('mole', 'Oh, the river! Every time!')],
  'enter.c1-wildwood': [T('ratty', 'Keep to the path. Keep together.'), T('badger', 'My wood. Sour this winter. Stay close.'), T('burdock', 'Snow. Hmph. And humming.')],
  'enter.c1-mole-end': [T('mole', 'Home! Wipe your feet, if you don\'t mind.'), T('ratty', 'Snug as a bug, Moly.')],
  'enter.c1-badger': [T('badger', 'In. Shut the door. Sit by the fire.'), T('mole', 'Oh, it\'s warm! It\'s so warm!'), T('toad', 'Badger! Breakfast! What is there?')],
  'enter.c1-buried-city': [T('badger', 'The old city. Mind the columns: some of them are only pretending to stand.'), T('burdock', 'Who digs a city and then leaves it?'), T('ratty', 'Echoes. I don\'t like echoes. They always get the last word.')],
  'enter.c1-road': [T('ratty', 'Toad Hall. Handsomest house on the river, and doesn\'t it know it.'), T('toad', 'My Hall! Look at it! Isn\'t it splendid? Even with weasels in.'), T('badger', 'Keep off the road. Motor-cars.')],
  'enter.c1-toadhall-in': [T('toad', '(whispering) My pantry!'), T('badger', 'Quietly.'), T('ratty', 'Smells of gravy and weasel.')],
  pairs: [
    { id: 'ratty-mole-1', a: 'ratty', b: 'mole', lines: [['mole', 'Ratty, do you think Mole End missed me?'], ['ratty', 'Missed you? It was sulking, Moly. All its candles had gone out on purpose.'], ['mole', 'Oh, don\'t. I shall cry.'], ['ratty', 'Cry, then. Then we\'ll have supper. That\'s the proper order.']] },
    { id: 'ratty-mole-2', a: 'mole', b: 'ratty', cond: () => flag('c1_mem_river'), lines: [['mole', 'Ratty, will you teach me to row? When this is all over?'], ['ratty', 'Of course I will. You\'ll fall in, mind.'], ['mole', 'Will I?'], ['ratty', 'Everybody does, the first time. It\'s how the river says hullo.']] },
    { id: 'toad-badger-1', a: 'toad', b: 'badger', lines: [['toad', 'Badger, old chap, when this is done I\'m going to buy a new motor-car. A faster one.'], ['badger', 'You are going to do nothing of the kind.'], ['toad', 'A slightly faster one?'], ['badger', 'Toad.'], ['toad', '...A bicycle, then.']] },
    { id: 'toad-badger-2', a: 'badger', b: 'toad', cond: () => flag('g_recruit_toad'), lines: [['badger', 'You did well at the banquet, Toad. You held your tongue for very nearly a minute.'], ['toad', 'Did I? I did! I was magnificent!'], ['badger', 'And there it goes again.']] },
    { id: 'burdock-badger-1', a: 'burdock', b: 'badger', lines: [['burdock', 'You dig well. For a badger.'], ['badger', 'You dig well. For a rabbit.'], ['burdock', 'Hmph.'], ['badger', 'Hm.'], ['burdock', '...I\'ll show you our nursery tunnel some time. It wants a badger\'s shoulders.']] },
    { id: 'burdock-toad-1', a: 'toad', b: 'burdock', lines: [['toad', 'Madam, you have the shoulders of a champion! Have you ever considered motoring?'], ['burdock', 'No.'], ['toad', 'Not even a little?'], ['burdock', 'Hmph. Ask me again and I\'ll sit on you.']] },
    { id: 'mole-burdock-1', a: 'mole', b: 'burdock', lines: [['mole', 'Miss Burdock, do your tunnels have whitewash?'], ['burdock', 'They have chalk. It\'s white already.'], ['mole', 'Oh! How very clever of them.'], ['burdock', 'Hmph. I suppose it is.']] },
    { id: 'ratty-toad-1', a: 'ratty', b: 'toad', lines: [['toad', 'Ratty, old thing, have you ever thought of putting a motor in that boat of yours?'], ['ratty', 'Never. Not once. Not for a second.'], ['toad', 'Just a little one. Poop-poop, across the water...'], ['ratty', 'Toad, if you so much as look at my boat with a spanner, I shall row you into the weir.']] },
    { id: 'mole-badger-1', a: 'mole', b: 'badger', lines: [['mole', 'Mr. Badger, sir, weren\'t you frightened? Coming out of your house, with the wood all dark?'], ['badger', 'Frightened? Yes. Of course.'], ['mole', 'Oh! I thought badgers were never frightened.'], ['badger', 'Badgers are frightened a great deal, Mole. They simply go on anyway. It is the same for moles.']] },
    { id: 'burdock-ratty-1', a: 'burdock', b: 'ratty', lines: [['ratty', 'Burdock, have you ever been in a boat?'], ['burdock', 'No.'], ['ratty', 'Would you like to try?'], ['burdock', 'Will it go under the ground?'], ['ratty', 'Well, no.'], ['burdock', 'Hmph. Then what\'s the point of it.']] },
    { id: 'mole-toad-1', a: 'toad', b: 'mole', cond: () => flag('g_recruit_toad'), lines: [['toad', 'Mole! Did you see me at the banquet? Did you see me leap upon the table?'], ['mole', 'You fell on the table, Toad. Onto the trifle.'], ['toad', 'I leapt. Onto the trifle. On purpose. To distract the enemy.'], ['mole', 'It was a very distracting trifle.']] },
  ],
};

// ---------------------------------------------------------------- quests and places
export const quests = [
  { title: 'Find Friends Below', show: () => flag('c0_door_open') || flag('c1_card'), done: () => flag('g_c1_riverbank_done') && flag('g_c1_wonder_done'),
    step: () => !flag('g_underway_c1') ? 'Follow the old tunnels down to the bottom of the Depths.' : !flag('g_c1_riverbank_done') ? 'Go through the river door to the River Bank.' : 'Go through the keyhole door.' },
  { title: 'Ratty\'s Boat', show: () => flag('c1_metRatty'), done: () => flag('g_recruit_ratty'), step: () => 'Shove the three logs off the weir.' },
  { title: 'Mole, Lost in the Snow', show: () => flag('g_recruit_ratty'), done: () => flag('g_recruit_mole'),
    step: () => !flag('c1_scent_on') ? 'Look for Mole in the Wild Wood, east over the weir.' : !flag('c1_mole_found') ? 'Follow Mole\'s warm scent, one shimmer at a time.' : 'Go into Mole End with Mole.' },
  { title: 'Two Lost Hedgehogs', show: () => flag('c1_hog_any'), done: () => flag('g_recruit_badger'), step: () => 'Bring both hedgehog lads to Badger\'s door, north-west in the Wild Wood.' },
  { title: 'Toad of Toad Hall', show: () => flag('c1_road_seen'), done: () => flag('g_recruit_toad'),
    step: () => !flag('c1_toad_fled') ? 'Pull Toad out of his motor-car on the road.' : !flag('c1_toad_unmasked') ? 'Toad fled toward the river. Look for anyone acting oddly by the weir.' : !flag('c1_chief_beaten') ? 'Through Badger\'s buried city and the secret tunnel to Toad Hall: face the Chief Weasel.' : 'Done.' },
  { title: 'Home, Briefly', show: () => flag('g_c1_riverbank_done'), done: () => flag('c1_home_brief'), step: () => 'Visit Thimblebank: Burdock wants to see to the nursery.' },
  { title: 'The Battle of Sorrel Down', show: () => flag('g_c1_riverbank_done') && flag('g_c1_wonder_done'), done: () => flag('g_freed_thimblebank'),
    step: () => !flag('g_c1-rts1_won') ? 'Gather the army at the Lookout Stone and take back Sorrel Down.' : 'Wake the raiders in the Great Burrow.' },
];
export const places = [
  { name: 'Thimblebank Depths', map: 'c1-depths', cond: () => flag('c1_card') },
  { name: 'The Underway', map: 'c1-underway', cond: () => flag('g_underway_c1') },
  { name: 'The River Bank', map: 'c1-riverbank', cond: () => flag('c1_rb_seen') },
  { name: 'The Wild Wood', map: 'c1-wildwood', cond: () => flag('g_recruit_ratty') },
  { name: 'Mole End', map: 'c1-mole-end', cond: () => flag('g_recruit_mole') },
  { name: 'Badger\'s House', map: 'c1-badger', cond: () => flag('c1_hogs_home') },
  { name: 'The Buried City', map: 'c1-buried-city', cond: () => flag('c1_hogs_home') },
  { name: 'Toad Hall', map: 'c1-road', cond: () => flag('c1_road_seen') },
];

// ---------------------------------------------------------------- the shop: Ratty's Riverside Swap (Otter minds it)
export const shops = {
  'c1.ratty-shop': {
    name: 'Ratty\'s Riverside Swap', keeper: 'otter', line: 'Fair trades, no weasels!',
    gear: () => flag('g_recruit_mole')
      ? ['sling+1', 'quill+1', 'waistcoat+1', 'courage-ribbon+1', 'digging-claw+2', 'sling+2', 'quill+2', 'waistcoat+2', 'oilskin+2', 'motor-goggles+2', 'courage-ribbon+2']
      : ['sling+1', 'digging-claw+1', 'quill+1', 'waistcoat+1', 'oilskin+1', 'courage-ribbon+1', 'motor-goggles+1'],
    items: ['clover-bunch', 'dandelion', 'pluck-berry', 'courage-biscuit', 'carrot-cake'],
    army: 1,
  },
};

// ---------------------------------------------------------------- Thimblebank: home briefly, recruits, the rescued five
const brief = () => flag('g_c1_riverbank_done') && !flag('c1_home_brief');
export const mapAdds = {
  'c0-warren': {
    triggers: [
      { id: 'c1-brief-mouth', x: 2, y: 2, w: 7, h: 3, cond: brief, run: 'c1.home.brief' },
      { id: 'c1-brief-deep', x: 19, y: 28, w: 7, h: 1, cond: brief, run: 'c1.home.brief' },
      { id: 'c1-brief-deep2', x: 25, y: 18, w: 1, h: 10, cond: brief, run: 'c1.home.brief' },
    ],
    npcs: [
      { id: 'c1-badger', sprite: 'badger', x: 18, y: 3, facing: 'sw', talk: 'c1.home.badger', cond: () => flag('g_recruit_badger') && flag('c1_home_brief') && away('badger')() },   // fullrun: was (14,3): with Woodruff (12,5), kit-a (13,4) and home-6 (15,3) he walled the Great Burrow off from the mouth whenever he was home
      { id: 'c1-ratty', sprite: 'ratty', x: 24, y: 13, facing: 'sw', talk: 'c1.home.ratty', cond: () => flag('g_recruit_ratty') && flag('c1_home_brief') && away('ratty')() },
      { id: 'c1-mole', sprite: 'mole', x: 5, y: 24, facing: 'nw', talk: 'c1.home.mole', cond: () => flag('g_recruit_mole') && flag('c1_home_brief') && away('mole')() },
      { id: 'c1-toad', sprite: 'toad', x: 10, y: 6, facing: 'se', talk: 'c1.home.toad', cond: () => flag('g_recruit_toad') && flag('c1_home_brief') && away('toad')() },
      { id: 'c1-chert', sprite: 'chert', x: 14, y: 16, facing: 'nw', talk: 'c1.home.chert', cond: () => flag('g_freed_thimblebank') },
      // Chert's band still humming in the Great Burrow, if the fight after the battle was lost: talk to try again
      { id: 'c1-chert-hum', sprite: 'chert', hum: true, x: 14, y: 7, facing: 'sw', talk: 'c1.greatburrow.fight', cond: () => flag('g_c1-rts1_won') && !flag('g_freed_thimblebank') },
      ...[[12, 8, 'grey', 'rabbit-doe', 'nw'], [14, 7, 'sandy', 'rabbit-buck', 'sw'], [21, 6, 'cream', 'rabbit-doe', 'sw'], [2, 2, 'dark', 'rabbit-buck', 'se'], [2, 4, 'ginger', 'rabbit-doe', 'ne']]   // fullrun: 3 was at (16,5) (cut Mallow's half of the Great Burrow off), 4 and 5 at (6,3),(5,4) (plugged the passage from the warren mouth to the Great Burrow)
        .map(([x, y, fur, sprite, facing], i) => ({ id: `c1-rescued-${i + 1}`, sprite, fur, x, y, facing, talk: 'c1.home.rescued', cond: () => flag('g_freed_thimblebank') && !(i === 1 && flag('g_c1-rts1_won') && !flag('g_freed_thimblebank')) })),
    ],
  },
};
export const homeSeen = () => getVal('c1_home_brief');
