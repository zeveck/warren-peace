// Chapter 4's people and words: bestiary, memories, banter (Talk, map-entry bubbles, pairs), quests, places,
// the home rabbits' Chapter 4 lines (home.<id>.ch4), and Captain Quarry and Rumble visiting Thimblebank.
import { G } from '../../core.js';
import { flag, travelling } from '../../state.js';
import { placed } from './common.js';

const away = id => () => !!(G.s && G.s.party.members[id]) && !travelling().includes(id);

// ---------------------------------------------------------------- bestiary
export const bestiary = {
  'captain-quarry': 'Captain Quarry, once Flintcomb\'s cheerful head digger. He heard the Sleeper under the flint and dug toward it. Woken, he walks the hole he dug. Leads the Flintcomb Diggers.',
  rumble: 'Rumble, a mastodon calf lost on the plain of bones. Brought home past the shepherd, he chose to walk Bramble home too. Leads the Mastodon Herd.',
  knapper: 'Old Knapper keeps Quarry\'s store in Flintcomb. Deaf as a flint, so the Hum never reached him. Sells good tools, very loudly.',
  shepherd: 'The giant shepherd of the herd under the world. Twice as tall as a tree; he only looks, round and round. Once Rumble was home, he sat down.',
  mastodon: 'Woolly mastodons, grazing under the glowing cloud. Slow, huge and gentle. They trumpet all together when one of theirs comes home.',
  'sea-monsters': 'Two great old sea-beasts of the Lidenbrock Sea, wrestling far out in the waves. Seen, not fought. Nobody wanted to find out.',
  'cave-lizard': 'Cave Lizards bask on the warm rock of the tubes. Quick, snappy, and very sure every warm spot is theirs.',
  'trilobite-swarm': 'Trilobite Swarms: armoured little crawlers older than anything. They nip in a crowd and scuttle off when the crowd thins.',
  'eel-cloud': 'Electric Eel-clouds fizz down out of the glowing cloud in a storm, crackling. Mostly made of weather and bad temper.',
  'moving-root': 'Moving Roots in the Root of the World. Roots of what, nobody knows. They shift like sleepers turning over, and sometimes they shove.',
  'star-thing': 'Star-Things drift through the Root of the World, made of the light in the rock. Cold, curious, and not at all friendly.',
  'hollow-rabbit': 'The Hollow Rabbits of Deepdelve: rabbit-shaped shadows who forgot everything, even that they forgot. Woken, they remembered their names, thanked Bramble, and faded at peace.',
  elevenfold: 'Elevenfold, Ninefold\'s cousin, keeps a stall in the Root of the World. Eleven eyes, no visitors in four hundred years, until Bramble. Collects star-stones.',
  quarryman: 'Flintcomb\'s diggers: broad, dusty, strong as flint. Hum-taken, they quarried day and night. Woken, they plant gardens. Upward.',
};

// ---------------------------------------------------------------- memories (finale stories)
export const memories = {
  'mem-mushrooms': { title: 'The giant mushrooms', friend: 'pip', line: 'Under mushrooms tall as oaks, everyone lay down on their backs and looked up, and for five whole minutes nobody was afraid of anything.', eye: 'The Eye has never looked up. It finds there is an up, and that things grow there.', bg: 'mushroom', hint: 'Rest in the glade of the mushroom forest.' },
  'mem-stars': { title: 'Elevenfold\'s star-stones', friend: 'ninefold', line: 'Three fallen stars, carried through the dark as a present for someone who had never been given one.', eye: 'The Eye has never been given anything, either. It thinks it might like to be.', bg: 'root', hint: 'Bring Elevenfold three star-stones in the Root of the World.' },
};

// ---------------------------------------------------------------- banter
const T = (who, line, cond) => ({ who, line, ...(cond ? { cond } : {}) });
const freed = () => flag('g_freed_flintcomb');
export const banter = {
  'talk.flintcomb': [
    T('burdock', 'Hmph. Good flint. Wasted on a hole.'),
    T('mole', 'All this white! It hurts my eyes. I\'ll be glad to be under ground again. That\'s a strange thing to be glad of.'),
    T('ratty', 'Not a drop of water in the whole place. How do they live? Oh. They don\'t, much. Not lately.'),
    T('badger', 'Flintcomb was always a hard warren. Hard ground makes hard rabbits. Hard isn\'t bad.'),
    T('toad', 'A quarry! I could have it made into a motor-track. A splendid one. With a grandstand.'),
    T('cheshire-cat', 'They dug a hole so deep they can\'t see the bottom. Very mad. I like them already.'),
    T('caterpillar', 'Flint. It doesn\'t grow. It doesn\'t change. It doesn\'t even get bigger when you eat it. Pointless.'),
    T('ninefold', 'The humming here is very loud. It is the voice of somebody having a bad night. I wish I could tuck it in.'),
    T('jade-rabbit', 'White as the Moon\'s dust, but harder. Nothing grows here. Something will, I think. Soon.'),
    T('tansy', 'They kept me here, at first. A pen of flint. I don\'t remember much. The humming. A kit crying. Let\'s finish this.'),
    T('pip', 'Is the Captain scary? Is he really big? Will he remember his name? I always remember mine. Pip. See?'),
    T('tin-woodman', 'I must be careful not to step on anyone. They all look so tired.'),
    T('captain-quarry', 'Every burrow here, I dug or I ordered dug. I could walk the whole warren with my eyes shut. I did, for a year.', freed),
    T('captain-quarry', 'Knapper never heard a thing. Deaf as a flint. Luckiest rabbit in Flintcomb.', freed),
  ],
  'talk.hole': [
    T('burdock', 'Hmph. Nobody dug this. Don\'t trust a tunnel nobody dug.'),
    T('mole', 'It\'s a tunnel and it isn\'t. I keep wanting to tidy the walls, but the walls are already tidier than I am.'),
    T('ratty', 'There\'s water somewhere ahead. I can smell it. Running water, under all this rock. Marvellous.'),
    T('badger', 'A.S., whoever you were, you had good sense. Follow the sensible fellow.'),
    T('toad', 'Slides! Slides made of rock! Why did nobody tell me the underneath had slides?'),
    T('cheshire-cat', 'Every tube goes somewhere. Some of them go back. That\'s the joke.'),
    T('caterpillar', 'Tubes. Like a hookah, but larger, and less useful.'),
    T('ninefold', 'This is nearer home than the Shallows. I feel it in my folds. Home is very far down.'),
    T('jade-rabbit', 'The rock is warm. Somebody, very long ago, made it so. Or it made itself. Either way, it is kind to cold paws.'),
    T('tansy', 'Stay where I can see you, Bramble. I\'ve lost you once. Well. You lost me. Same thing.'),
    T('pip', 'Who\'s A.S.? Do you think they had a kit with them? Do you think the kit got to carve one of the letters?'),
    T('tin-woodman', 'I can hear somebody laughing through the rock. That is a lovely thing to hear in a tunnel.'),
    T('captain-quarry', 'I dug down a year without stopping. Never once wondered what was already down here. Should have.'),
    T('rumble', 'Tubes. Tight. Rumble breathes in. Rumble fits.'),
  ],
  'talk.sea': [
    T('burdock', 'Hmph. Water. All of it. Everywhere.'),
    T('mole', 'Ratty would... Ratty, you\'re here! Isn\'t it the most wonderful thing you ever saw?'),
    T('ratty', 'A sea, Bramble. A whole sea, and nobody\'s ever rowed on it but us. I could live here. I couldn\'t. But I could.'),
    T('badger', 'Big things in that water. Big old things. Let them be.'),
    T('toad', 'A raft is just a boat that hasn\'t believed in itself yet. Poop-poop! Toad, Admiral of the Underneath!'),
    T('cheshire-cat', 'Water, water, everywhere, and not a drop of milk. Typical.'),
    T('caterpillar', 'A sea. Under the ground. Hmph. Somebody has been putting things in the wrong places.'),
    T('ninefold', 'I can\'t swim. I have never needed to. I would like to try, one day, in a very small puddle.'),
    T('jade-rabbit', 'The cloud glows like the Moon, but closer. I feel at home under it, a little.'),
    T('tansy', 'The storm made Quarry\'s needle point backwards. I don\'t like anything that makes needles point backwards.'),
    T('pip', 'Is there a bottom to the sea? Is there a sea under the sea? Is there a SKY under the sea?'),
    T('tin-woodman', 'I must not fall in. I would rust before I reached the bottom. Hold my arm, please, someone.'),
    T('captain-quarry', 'All that time, digging for something grand. This was here. Nobody needed to dig for it at all.'),
    T('rumble', 'Water. Big water. Rumble does not swim. Rumble wades. Rumble wades VERY far.'),
  ],
  'talk.mushrooms': [
    T('burdock', 'Hmph. Mushrooms. Big ones. Bigger than me. Don\'t like it.'),
    T('mole', 'I should love one of these over Mole End. For shade. And for having something to tell Ratty about.'),
    T('ratty', 'No river, but I don\'t mind. The forest sounds like rain even when it isn\'t raining.'),
    T('badger', 'Bones of very big creatures, and a very big man watching very big beasts. Everything here is too big. Keep your heads down.'),
    T('toad', 'Mastodons! Hairy elephants! I shall ride one. Later. When they\'re asleep. Possibly never.'),
    T('cheshire-cat', 'The shepherd only sees what he looks at. Most people are like that. I prefer to be looked at selectively.'),
    T('caterpillar', 'Finally, mushrooms of the proper size. I could live here. I won\'t. But I could.'),
    T('ninefold', 'The shepherd doesn\'t scream when he sees things. He just looks. That is nearly polite.'),
    T('jade-rabbit', 'He tends them, the shepherd. All alone, for longer than I have pounded elixir. I understand him.'),
    T('tansy', 'Lie down in the glade with me a minute, Bramble. Just a minute. Like on the downs.'),
    T('pip', 'Rumble is the biggest kit I ever saw. I\'m going to teach him hide-and-seek. He\'ll be terrible at it.'),
    T('tin-woodman', 'A lost little one, and a mother waiting. Oh, I must keep my oil-can handy.'),
    T('captain-quarry', 'That shepherd frightens me more than the Hum did. He doesn\'t want anything. He just watches.'),
    T('rumble', 'Mama says: Bramble is herd now. Herd keeps herd. HRRMP.', () => flag('g_recruit_rumble')),
  ],
  'talk.root': [
    T('burdock', 'Hmph. Stars underground. Rabbits underground, gone to shadows. Let\'s finish and go home.'),
    T('mole', 'It\'s a warren. A real rabbit warren, like home. Oh, the poor things. Oh, the poor empty rooms.'),
    T('ratty', 'No water. No sky. No sound but breathing. I\'ll write a poem about this place. A sad one, then a hopeful one.'),
    T('badger', 'My city under the Wild Wood was empty too. Empty isn\'t the end. Somebody always comes back.'),
    T('toad', 'I\'m not frightened. I\'m being QUIET. Out of respect. Toad can be quiet. Watch. ...See?'),
    T('cheshire-cat', 'A warren full of rabbits who forgot themselves. I forget myself all the time. The trick is to remember to come back.'),
    T('caterpillar', 'Who are YOU, I would ask them. They wouldn\'t know. That is the saddest thing I have ever not said.'),
    T('ninefold', 'Elevenfold! My cousin, here, all this time. Selling stones to nobody. I shall visit more. I shall bring dandelions.'),
    T('jade-rabbit', 'The light in the rock is very old. It does not know the Moon. It might like to.'),
    T('tansy', 'This is what the Hum does if nobody comes. I was nearly one of them. You came. Remember that, Bramble. Always come.'),
    T('pip', 'It\'s like home but empty. I don\'t like it. Bramble, home\'s still there, isn\'t it? Everyone\'s still there?'),
    T('tin-woodman', 'I do not have a heart that beats, they say. Mine is beating very hard just now.'),
    T('captain-quarry', 'Deepdelve. Their claws, their burrows. I\'d have dug Flintcomb into this, given a hundred years. Never again.'),
    T('rumble', 'Stars inside rock. Shadows inside warren. Rumble stays close to Bramble. Very close.'),
  ],
  'enter.c4-flintcomb': [T('tansy', 'Flintcomb. I remember the white.'), T('captain-quarry', 'Home. Quieter now.', freed), T('pip', 'It\'s so white!'), T('badger', 'Hard ground. Hard rabbits.')],
  'enter.c4-warren': [T('captain-quarry', 'Round and round. Like I did for a year.', freed), T('tansy', 'Mind the edge.'), T('mole', 'So many tunnels!'), T('ninefold', 'The hole is breathing.')],
  'enter.c4-underway': [T('ninefold', 'Another Underway. Every one smells of me.'), T('captain-quarry', 'All the way down. All the way.'), T('jade-rabbit', 'Warm air.')],
  'enter.c4-tubes': [T('pip', 'Follow the letters!'), T('ratty', 'Water, somewhere ahead.'), T('captain-quarry', 'Nobody dug this.'), T('rumble', 'Tight. Rumble breathes in.')],
  'enter.c4-sea': [T('ratty', 'The sea!'), T('toad', 'Admiral Toad, reporting!'), T('rumble', 'Big water.'), T('tin-woodman', 'Hold my arm, please.')],
  'enter.c4-mushrooms': [T('caterpillar', 'Proper mushrooms at last.'), T('pip', 'They\'re SO big!'), T('rumble', 'Home smells. Mushroom smells.'), T('mole', 'Think of the shade!')],
  'enter.c4-field': [T('rumble', 'Shh. Big man looks.'), T('cheshire-cat', 'Don\'t be seen. It\'s easier than it looks.'), T('tansy', 'Stay in the shade.')],
  'enter.c4-root': [T('ninefold', 'The Root of the World.'), T('rumble', 'Stars! Inside!'), T('jade-rabbit', 'Old light.'), T('captain-quarry', 'The Hum. It\'s here.')],
  'enter.c4-deepdelve': [T('pip', 'It\'s like home. But empty.'), T('captain-quarry', 'Deepdelve.'), T('tansy', 'Gently, everyone.'), T('tin-woodman', 'Oh, the poor things.')],
  pairs: [
    { id: 'pip-quarry-1', a: 'pip', b: 'captain-quarry', cond: () => flag('g_recruit_captain-quarry'), lines: [
      ['pip', 'Captain Quarry? Are you really a captain? Of what?'],
      ['captain-quarry', 'Of diggers. Used to be. Shouting mostly. "Deeper! Faster! Mind your tails!"'],
      ['pip', 'Can I be a digger? I\'m small, but I find things. I found Barley\'s bell!'],
      ['captain-quarry', 'Hmph. Small is good, in a tunnel. You find the gaps. Big lumps like me just knock walls down.'],
      ['pip', 'So I\'m HIRED?'],
      ['captain-quarry', '...Ha! Yes. You\'re hired. First rule: dig up, not down. Remember it for me.'],
    ] },
    { id: 'tin-rumble-1', a: 'tin-woodman', b: 'rumble', cond: () => flag('g_recruit_rumble'), lines: [
      ['rumble', 'Shiny man. Why shiny man leak from eyes?'],
      ['tin-woodman', 'I cry when I am happy, little one, and when I am sad, and sometimes when I see a very small mastodon find his mother.'],
      ['rumble', 'Crying makes rusty. Rumble hold the oil-can.'],
      ['tin-woodman', 'Oh! Would you? Very gently, please. With your trunk. ...Oh, that\'s lovely. Oh dear, now I\'m crying again.'],
      ['rumble', 'Rumble holds oil-can forever. HRRMP.'],
    ] },
    { id: 'tansy-quarry-1', a: 'tansy', b: 'captain-quarry', cond: () => flag('g_recruit_captain-quarry'), lines: [
      ['captain-quarry', 'Tansy. I know your face. You were in the flint pen. My pen. I put you there.'],
      ['tansy', 'You did. I remember you humming outside it all night. Very low. Very out of tune.'],
      ['captain-quarry', 'I\'m sorry. That\'s not enough, but I\'m sorry.'],
      ['tansy', 'It\'s a start. Carry the heavy bags for the rest of the trip and we\'ll call it even.'],
      ['captain-quarry', '...Fair. Hmph. Very fair.'],
    ] },
    { id: 'burdock-quarry-1', a: 'burdock', b: 'captain-quarry', cond: () => flag('g_recruit_captain-quarry'), lines: [
      ['burdock', 'Hmph. You dig with your left paw leading.'],
      ['captain-quarry', 'Hmph. You dig with both at once. Show-off.'],
      ['burdock', 'Faster.'],
      ['captain-quarry', 'Messier.'],
      ['burdock', '...After this, there\'s a nursery tunnel at Thimblebank wants widening.'],
      ['captain-quarry', 'I\'ll bring my good claws.'],
    ] },
    { id: 'ninefold-rumble-1', a: 'ninefold', b: 'rumble', cond: () => flag('g_recruit_rumble'), lines: [
      ['rumble', 'Many-eyes. You see everything?'],
      ['ninefold', 'Nine things at once, yes. Right now I see you, and you are very large, and you did not scream.'],
      ['rumble', 'Rumble does not scream. Rumble TRUMPETS. Different.'],
      ['ninefold', 'I have never been trumpeted at kindly before. Would you? Just a small one?'],
      ['rumble', 'hrrmp.'],
      ['ninefold', 'I shall keep it forever.'],
    ] },
    { id: 'toad-rumble-1', a: 'toad', b: 'rumble', cond: () => flag('g_recruit_rumble'), lines: [
      ['toad', 'I say, Rumble, old fellow. Have you ever considered being ridden? By a gentleman? Of means?'],
      ['rumble', 'No.'],
      ['toad', 'At a very sedate pace. Twenty miles an hour. Poop-poop!'],
      ['rumble', 'NO.'],
      ['toad', 'Fifteen.'],
      ['rumble', 'Rumble sits on Toad.'],
      ['toad', '...Five is a perfectly good speed. Five is splendid.'],
    ] },
  ],
};

// ---------------------------------------------------------------- quests and places
export const quests = [
  { title: 'Captain Quarry', show: () => flag('g_ch4_open') || flag('c4_seen_flintcomb'), done: () => flag('g_freed_flintcomb'),
    step: () => !flag('c4_seen_warren') ? 'Go east from Sorrel Down to Flintcomb and find the warren mouth at the back of the quarry.' : 'Follow Flintcomb\'s spiral down to the lip of the hole and wake Captain Quarry.' },
  { title: 'Down the Hole', show: () => flag('g_freed_flintcomb'), done: () => flag('c4_reached_mushrooms'),
    step: () => !flag('c4_seen_tubes') ? 'Climb down Quarry\'s rope at the lip, and take the tube on from Flintcomb\'s Underway.' : !flag('c4_seen_sea') ? 'Follow the carved "A.S." at each fork, then the stream.' : !flag('c4_crossed') ? 'Take the raft across the sea, by way of the geyser island.' : 'Go east from the far shore into the mushroom forest.' },
  { title: 'Rumble\'s Herd', show: () => flag('c4_rumble_met'), done: () => flag('g_recruit_rumble'),
    step: () => 'Lead Rumble across the shepherd\'s field to his herd. Keep to the mushrooms\' shade when the shepherd looks your way.' },
  { title: 'The Fallen Rock', show: () => flag('g_recruit_rumble'), done: () => flag('c4_rock_cleared'),
    step: () => 'Look at the fallen rock at the end of the herd\'s meadow: Rumble and Quarry can shift it.' },
  { title: 'Elevenfold\'s Star-Stones', show: () => flag('c4_eleven_asked'), done: () => flag('c4_eleven_done'),
    step: () => { const n = [0, 1, 2].filter(k => flag('c4_star' + k)).length; return n >= 3 ? 'Take the three star-stones to Elevenfold\'s stall.' : `Find star-stones in the corners of the Root of the World (${n} of 3).`; } },
  { title: 'Deepdelve', show: () => flag('c4_seen_root'), done: () => flag('g_ch4_done'),
    step: () => !flag('c4_seen_dd') ? 'Go through the carved gate at the far end of the Root of the World.' : 'Find the Hollow Rabbits in Deepdelve\'s Great Burrow and wake them.' },
];
export const places = [
  { name: 'Flintcomb', map: 'c4-flintcomb', cond: () => flag('c4_seen_flintcomb') },
  { name: 'Flintcomb Warren', map: 'c4-warren', cond: () => flag('c4_seen_warren') },
  { name: 'Flintcomb\'s Underway', map: 'c4-underway', cond: () => flag('g_underway_c4') },
  { name: 'The Hole', map: 'c4-tubes', cond: () => flag('c4_seen_tubes') },
  { name: 'The Lidenbrock Sea', map: 'c4-sea', cond: () => flag('c4_seen_sea') },
  { name: 'The Mushroom Forest', map: 'c4-mushrooms', cond: () => flag('c4_seen_mushrooms') },
  { name: 'The Shepherd\'s Field', map: 'c4-field', cond: () => flag('c4_seen_field') },
  { name: 'The Root of the World', map: 'c4-root', cond: () => flag('c4_seen_root') },
  { name: 'Deepdelve', map: 'c4-deepdelve', cond: () => flag('c4_seen_dd') },
];

// ---------------------------------------------------------------- the home rabbits, Chapter 4 (before Quarry is woken / after)
const H = {
  yarrow: [
    ['Flintcomb, now. The last of the four. I knew Quarry when he was a loud young buck who laughed at everything. Bring that laugh back, Bramble.', 'I\'ve a mind to walk to Flintcomb myself. Don\'t look at me like that. My knees will grumble. Let them.'],
    ['I sat with Flintcomb two days. Told them it was all right until they believed it. Then I came home. Knees are furious.', 'Four warrens free. Below Flintcomb, Deepdelve. Below Deepdelve... well. You know the rhyme. Be gentle with it.'],
  ],
  mallow: [
    ['Flintcomb flint! Best in the downs. When they\'re trading again, I want first pick. Tell them Mallow said so.'],
    ['Flintcomb sent a cart of flint with a note: "From Quarry. Sorry. Here\'s flint." Very Flintcomb. I\'ve priced it high.'],
  ],
  woodruff: [
    ['Deepdelve. I tell it to the kits as a warning. Dig too deep, and the deep digs back. I wish it were only a story.'],
    ['A sea under the world, mushrooms like oaks, a shepherd taller than a tree... Bramble, you\'re making my stories look small.', 'And Deepdelve\'s rabbits remembered their names at the end? Then I\'ll tell it differently from now on. With their names in.'],
  ],
  comfrey: [
    ['Flintcomb rabbits will come home with sore paws and flint in their fur. I\'ve been making paw-salve all week.'],
    ['Captain Quarry came by. Paws like boulders, both cracked. I told him to sit still. He sat still for nearly a minute.'],
  ],
  'home-1': [['I watch the east now. The dust over Flintcomb used to hang there all day. Today it\'s thinner. I\'m counting that.'], ['No dust over Flintcomb at all, this morning. Just sky. I watched it for an hour. It was lovely.']],
  'home-2': [['Flintcomb dig too deep and too straight. No drainage. Mark my words, there\'s water down there.'], ['A SEA? Under the ground? I SAID there was water. Nobody listens to Hob.']],
  'home-3': [['Flintcomb\'s quarry is the only place on the downs I\'ve never jumped. Too deep. I\'ve looked. Very deep.'], ['Quarry says the hole goes down past a sea. I\'m not jumping that one. I\'m brave, not daft.']],
  'home-4': [['Nothing grows at Flintcomb. When it\'s over, I\'m sending them clover seed. A whole sack.'], ['Sent the sack. Their kits wrote back: "It came up!" Spelled wrong. Perfect.']],
  'home-5': [['Flintcomb next? I said I\'d have words with them. You go first. Soften them up.'], ['Quarry shook my paw. MY paw. Nearly took it off. I\'m never washing it.']],
  'home-6': [['The tune under the ground has changed. Lower. Further away. Like it\'s going home too.'], ['I\'m writing a song about a mastodon calf. It\'s got a trumpet bit. Tuft does the trumpet bit.']],
  'home-7': [['Some of Flintcomb\'s kits were born while their mothers were humming. Bring them all home, Bramble. Every one.'], ['Flintcomb mothers came to visit. We swapped lullabies. Theirs are all about digging. I gave them some about sky.']],
  'home-8': [['Flintcomb\'s tunnels are measured to the claw. I admire that. I\'d never admit it to them.'], ['Quarry looked at my cellar wall and said "decent". DECENT. I\'ve had it framed. In my head.']],
  'home-9': [['Is it true there\'s a hole at Flintcomb that goes down FOREVER? Did you drop a pebble? How long till it went plink?'], ['Pip says there\'s a mastodon called Rumble and he\'s a KIT and he\'s BIGGER THAN THE WARREN. I need to meet him. I need to.']],
  'home-10': [['Eh? Flintcomb? My cousin married into Flintcomb. Dug too much. Always digging. Eh? Still? Oh dear.'], ['Eh? Deepdelve? My granny\'s granny said she came from Deepdelve. Said it every winter. Nobody believed her. Eh. Maybe she did.']],
};
export const homeScripts = {};
for (const [id, [before, after]] of Object.entries(H)) {
  homeScripts[`home.${id}.ch4`] = async (s) => {
    const list = freed() ? after : before;
    const k = `c4_home_${id}`; const n = s.val(k) || 0; s.set(k, n + 1);
    await s.say(id, list[n % list.length]);
  };
}

// ---------------------------------------------------------------- Quarry and Rumble visit Thimblebank
export const mapAdds = {
  'c0-warren': {
    npcs: [
      placed('c0-warren', 0, 0, 'great-burrow', 7, { id: 'c4-quarry', sprite: 'captain-quarry', facing: 'sw', talk: 'c4.home.quarry', cond: () => flag('g_recruit_captain-quarry') && away('captain-quarry')() }),
    ],
  },
  'c0-downs': {
    npcs: [
      placed('c0-downs', 0, 0, 'east', 3, { id: 'c4-rumble', sprite: 'rumble', facing: 'sw', talk: 'c4.home.rumble', cond: () => flag('g_recruit_rumble') && away('rumble')() }),
      placed('c0-downs', 0, 0, 'east', 5, { id: 'c4-knapper', sprite: 'quarryman', fur: 'grey', facing: 'nw', talk: 'c4.home.knapper', cond: () => flag('g_freed_flintcomb') }),
    ],
  },
};
export const homeVisitors = {
  'c4.home.quarry': async (s) => {
    if (flag('g_ch4_done')) await s.say('captain-quarry', 'Burdock has me widening the nursery tunnel. Up, mind. Sideways and up. I\'m getting good at up.');
    else await s.say('captain-quarry', 'Thimblebank. I sent raiders here. I came to say sorry to every rabbit by name. Took all morning. They gave me tea.');
  },
  'c4.home.rumble': async (s) => {
    await s.say('rumble', 'Grass! Up-top grass! Sky! Sky is very far. Rumble likes sky. HRRMP!');
    await s.narrate('Several kits are sitting on Rumble. He does not appear to mind.');
  },
  'c4.home.knapper': async (s) => {
    await s.say('knapper', 'EH? Came over from Flintcomb with a cart of flint. Mallow says it\'s overpriced. I can\'t hear her, so it\'s fine.');
  },
};
