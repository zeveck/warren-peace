// ch3 extras: the Emerald City Market, speakers, memories, bestiary, quests, places, banter, the home rabbits'
// Chapter 3 lines (home.<id>.ch3), and Wheatsheaf's and Oz's friends visiting Thimblebank (mapAdds).
import { G } from '../../core.js';
import { flag, travelling } from '../../state.js';

export const shops = {
  'c3.emerald-market': {
    name: 'The Emerald City Market', keeper: 'munchkin', line: 'Everything green! Well. Everything looks green. Buttons and emeralds both welcome.',
    gear: ['emerald-cloak+4', 'straw-vest+4', 'tin-vest+4', 'little-axe+4', 'sling+4', 'quill+4', 'acorn-cap+4', 'courage-ribbon+4', 'poppy-ward+4', 'emerald-cloak+3', 'little-axe+3'],
    items: ['clover-bunch', 'dandelion', 'carrot-cake', 'pluck-berry', 'emerald-lozenge', 'smelling-salts', 'courage-biscuit', 'jade-elixir'],
    army: 3,
  },
};

export const speakers = {
  mouse: { name: 'A Field Mouse', por: 'mouse-queen' },
  'great-head': { name: 'Oz, the Great and Terrible', por: 'wizard' },
};

export const memories = {
  'mem-poppies': { title: 'The poppy-field mice', friend: 'mouse-queen', line: 'Everyone fell asleep in the poppies, and a thousand mice tied threads to their ears and pulled them out into the air, all together.', eye: 'The Eye has never been carried. It did not know that small things, together, can carry something big.', bg: 'oz-road', hint: 'Oz' },
  'mem-china': { title: 'The China Princess', friend: 'china-princess', line: 'A princess no bigger than an ear, who would not be carried away to a mantelpiece, because at home she could dance.', eye: 'The Eye thinks about being careful of something fragile. It has never been careful. It would like to try.', bg: 'oz-road', hint: 'the China Country' },
};

export const bestiary = {
  barley: 'Barley, chief of Wheatsheaf: broad, slow-spoken, a farmer to his toes. Rang his bell till the Hum took him; Pip found it. Leads the Wheatsheaf Rabbits.',
  pip: 'Pip: a tiny kit who loses things, finds things and asks questions. Old Yarrow taught him to listen to the ground. Leads Pip\'s Kits.',
  'good-witch': 'The Good Witch of the North: kind, a little forgetful. Her kiss leaves a round shining mark that keeps harm away. Mostly.',
  munchkin: 'The Munchkins: small, round, dressed in blue. Have had a lot of things fall out of the sky lately and are coping well.',
  'tin-woodman': 'The Tin Woodman: rusted solid for a year. Thinks he has no heart, so he is careful never to hurt anything. Cries easily; carry oil. Leads the Winkies.',
  'cowardly-lion': 'The Cowardly Lion: roars so nobody finds out he is frightened. Roared at two Kalidahs anyway. Leads the Lion\'s Beasts.',
  kalidah: 'Kalidahs: bodies like bears, heads like tigers. Very grumpy after a bath in a ditch.',
  scarecrow: 'The Scarecrow: stuffed with straw, stuck on a pole in a river until a Stork lifted him off. Now has bran-new brains. Leads the Emerald Guard.',
  stork: 'The Stork: in a hurry, but kind. Lifted a scarecrow out of a river because somebody asked nicely.',
  wildcat: 'The Wildcat: chased a mouse, found a tin man in the way, and decided the mouse was not worth it.',
  'mouse-queen': 'The Queen of the Field Mice: tiny, brave, and very good at organising thousands of mice to pull together. Leads the Field Mice.',
  guardian: 'The Guardian of the Gates: locks green spectacles on every visitor. Has not seen a colour that isn\'t green in years.',
  wizard: 'Oz, the Great and Terrible: a great Head, a ball of fire, a lady... and really a kind old humbug from Omaha with a speaking-trumpet.',
  'great-head': 'The great Head on the green throne. It turned out to be painted paper, worked with strings.',
  'wolf-west': 'Wolves of the West: sent by the Witch. Gave up and went home when nobody would be frightened of them.',
  'crow-west': 'Crows of the West: sent by the Witch to peck. Mostly pecked each other.',
  'winkie-guard': 'Winkie Guards: the Witch\'s soldiers, who never wanted to be. Sent home happy.',
  winkie: 'The Winkies: the yellow people of the west. Free now, with a tin king who cries at their speeches.',
  'wicked-witch': 'The Wicked Witch of the West: one eye that sees across a country, a horror of water, and a tiredness under all the wickedness. Melted.',
  'monkey-king': 'The King of the Winged Monkeys: bound to the Golden Cap for a joke played long ago. Bramble asked, and they fly as friends now. Leads the Winged Monkeys.',
  glinda: 'Glinda the Good, of the south: knows all about shoes. Says the silver ones can carry a rabbit anywhere. Even into a dream.',
  'hammer-head': 'Hammer-Heads: no arms, flat heads, very springy necks. They guard their hill and the treasure on it.',
  'china-princess': 'The China Princess: no bigger than an ear. Would rather dance at home than stand on a mantelpiece being looked at.',
  'late-footstep': 'Late Footsteps: the echo on the Stair of Eyes that lands a beat after yours. It wants to catch up.',
  'shut-eye': 'Shut Eyes: carvings on the Stair that open when you are not looking.',
  watcher: 'The Watcher on the Stair: a tall shape made of shut eyelids. When all seven open, it Sees you. It only wanted to be looked back at.',
};

export const quests = [
  { title: 'Wake Wheatsheaf', show: () => flag('g_ch3_open'), done: () => flag('g_freed_wheatsheaf'),
    step: () => !flag('c3_barleyWoken') ? 'Wake Barley in his hall under Wheatsheaf\'s warren mouth.' : !flag('c3_bellHung') ? 'Find Barley\'s bell in the corn by the hay cart, and bring it to his bell post.' : 'Ring the bell.' },
  { title: 'The Road of Yellow Brick', show: () => flag('c3_ozVisited'), done: () => flag('c3_poppiesDone'),
    step: () => !flag('c3_kissed') ? 'Talk to the Good Witch of the North.' : !flag('g_recruit_tin-woodman') ? 'Oil the Tin Woodman in the forest (the oil-can is on the table in his clearing).' : !flag('c3_chaseDone') ? 'Cross the Kalidah ditch.' : !flag('c3_storkDone') ? 'Ask the Stork to lift the Scarecrow off his pole.' : !flag('c3_mouseSaved') ? 'Follow the road east of the river.' : 'Cross the poppy field.' },
  { title: 'The Great and Terrible', show: () => flag('c3_specs'), done: () => flag('c3_humbug'),
    step: () => !flag('c3_wizardMet') ? 'Go up to the palace and see the Wizard.' : !flag('c3_witchMelted') ? 'Send the Wicked Witch of the West packing (pails by the castle door; the well in the scullery).' : 'Go back to the Wizard.' },
  { title: 'Glinda\'s Secret', show: () => flag('c3_humbug'), done: () => flag('g_c3_oz_done'), step: () => 'Find Glinda in the Quadling Country, through the city\'s south-west gate.' },
  { title: 'The China Country', show: () => flag('c3_southSeen'), done: () => flag('c3_princessMet'), step: () => 'Climb the china wall north-west of the Quadling road and visit the Princess. Never step on the same china tile twice.' },
  { title: 'The Hammer-Heads\' Hill', show: () => flag('c3_southSeen'), done: () => flag('beat_c3-sou-1') && flag('beat_c3-sou-2'), step: () => 'Get past the Hammer-Heads on their hill east of the road. There is something at the top.' },
  { title: 'The Stair of Eyes', show: () => flag('g_c3_oz_done'), done: () => flag('g_ch3_done'), step: () => 'Go down the eye-carved stair in Wheatsheaf\'s Underway, and get past its Watcher.' },
];

export const places = [
  { name: 'Wheatsheaf', map: 'c3-wheatsheaf', cond: () => flag('g_ch3_open') },
  { name: 'Wheatsheaf Warren', map: 'c3-wheatsheaf-warren', cond: () => flag('c3_wswSeen') || flag('c3_barleyWoken') },
  { name: 'Wheatsheaf\'s Underway', map: 'c3-underway', cond: () => flag('g_underway_c3') },
  { name: 'The Munchkin Country', map: 'c3-munchkin', cond: () => flag('c3_ozVisited') },
  { name: 'The Forest by the Road', map: 'c3-forest', cond: () => flag('c3_forestSeen') },
  { name: 'The River', map: 'c3-river', cond: () => flag('c3_riverSeen') },
  { name: 'The Poppy Field', map: 'c3-poppies', cond: () => flag('c3_poppiesSeen') },
  { name: 'The Emerald City', map: 'c3-emerald', cond: () => flag('c3_specs') },
  { name: 'The Throne Room', map: 'c3-palace', cond: () => flag('c3_palaceSeen') },
  { name: 'The Winkie Country', map: 'c3-winkie', cond: () => flag('c3_winkieSeen') },
  { name: 'The Witch\'s Castle', map: 'c3-castle', cond: () => flag('c3_castleSeen') },
  { name: 'The Quadling Country', map: 'c3-south', cond: () => flag('c3_southSeen') },
  { name: 'The China Country', map: 'c3-china', cond: () => flag('c3_chinaSeen') },
  { name: 'The Stair of Eyes', map: 'c3-stair', cond: () => flag('c3_stairSeen') },
];

// ---------------- banter
const T = (who, line, cond) => ({ who, line, ...(cond ? { cond } : {}) });
export const banter = {
  'talk.wheatsheaf': [
    T('pip', 'Wheatsheaf\'s corn is taller than ME. Taller than Burdock, even! I could get lost in here. I mean I won\'t. Probably.'),
    T('tansy', 'They kept us here a night, after Silverdown. I remember the corn, and humming, and not knowing my own name. It\'s different now.'),
    T('jade-rabbit', 'Barley\'s bell has a good voice. Plain and loud. The moon has nothing so honest.'),
    T('burdock', 'Hmph. Good soil. Barley\'s lot dig straight. I\'ll give them that.'),
    T('mole', 'Oh, a farm warren! All those cellars of grain. I keep wanting to tidy them, and it isn\'t even my place.'),
    T('ratty', 'No river here. Just the wind going over the corn like water. That\'ll do, I suppose.'),
    T('badger', 'Barley\'s a sound fellow. Slow to speak. I like that in a chief.'),
    T('toad', 'I shall buy a farm after all this. A small one. With a motor-tractor. Poop-poop through the wheat!'),
    T('cheshire-cat', 'So much corn. A cat could vanish in it without even trying. How restful.'),
    T('caterpillar', 'Corn. It does nothing. I approve.'),
    T('ninefold', 'The Wheatsheaf rabbits screamed when they first saw me. Then they offered me bread. I have never been offered bread. I am keeping it.'),
    T('tin-woodman', 'A scarecrow would like it here. I must tell him.'),
  ],
  'talk.c3-underway': [
    T('pip', 'The dust goes round and round. I tried to count how many times. I got to four hundred and then I lost it.'),
    T('tansy', 'Stairs with eyes. Of course there are stairs with eyes. Why wouldn\'t there be.'),
    T('jade-rabbit', 'The whirl is a door that does not stay still. I like doors like that.'),
    T('ninefold', 'The eyes on the stair are not looking at us. They are looking up. They have been waiting for someone to come down.'),
  ],
  'talk.oz': [
    T('pip', 'Everything in Oz is a colour! Blue, then green, then yellow! I want to see red. Is there a red bit?'),
    T('tansy', 'Silver shoes, a kiss on the head, a tin man and a scarecrow. Thimblebank won\'t believe a word of it.'),
    T('jade-rabbit', 'The sky here is very far away. Not like the downs. I keep looking for the moon in it.'),
    T('tin-woodman', 'I am so glad you oiled me. I had a great deal of time to think, standing there. Mostly about rain.'),
    T('mole', 'Yellow bricks! Who would lay a road in yellow bricks? Somebody very cheerful, I should think.'),
    T('ratty', 'That river was a fine river. A bit too keen to keep scarecrows, mind.'),
    T('badger', 'Hmph. Lions that cry. Tin men that cry. I\'ll not cry. I\'ve a cold, that\'s all.'),
    T('toad', 'A flying house! A Wizard! Silver shoes! Bramble, this is the best adventure I have ever had, and I have had MANY.'),
    T('cheshire-cat', 'A country where things fall out of the sky. I feel quite at home.'),
    T('caterpillar', 'Poppies. Hmph. I have smoked better.', () => flag('c3_poppiesDone')),
    T('ninefold', 'The Munchkins did not scream at me. They asked if I was a witch. I said no. They seemed disappointed.'),
    T('burdock', 'Too bright. My eyes water. Not crying. Bright.'),
  ],
  'talk.emerald': [
    T('pip', 'If I take my spectacles off will everything be grey? I\'m scared to look.'),
    T('tansy', 'An entire city that\'s only green because everyone\'s wearing green glasses. I don\'t know whether to laugh or be annoyed.'),
    T('jade-rabbit', 'The Wizard is lonely, I think. People who hide behind great faces often are.', () => flag('c3_wizardMet')),
    T('tin-woodman', 'I shall ask the Wizard for a heart. Although... perhaps I shall not need it, now. I seem to keep crying without one.'),
    T('toad', 'A humbug! He\'s a humbug! I knew it from the start. Well, from the end. Same thing.', () => flag('c3_humbug')),
    T('cheshire-cat', 'A great Head with no body. I find it very relatable.'),
  ],
  'talk.winkie': [
    T('pip', 'She has one eye but it sees everything. How? Is it a very big eye?'),
    T('tansy', 'Wolves, crows and soldiers. Seems like a lot of fuss to stop a few rabbits.'),
    T('tin-woodman', 'The Winkies are good people. They only need someone to be kind to them for a while.'),
    T('jade-rabbit', 'All this yellow, and so little laughter. That will change, I think.'),
    T('badger', 'Water. A witch afraid of water. There\'s a lesson about washing behind your ears there.'),
  ],
  'talk.south': [
    T('pip', 'Red! There IS a red bit! I knew it!'),
    T('tansy', 'China people. Don\'t breathe on them, Bramble. Your breath is mostly carrots.'),
    T('jade-rabbit', 'Glinda is old, older than she looks. Like the moon.'),
    T('tin-woodman', 'The china folk are lovely. I should be terrified to step anywhere near them. I shall stay on the grass.'),
  ],
  'talk.stair': [
    T('pip', 'The footsteps behind us are ours. Aren\'t they? Bramble? They are ours?'),
    T('tansy', 'Keep moving. I mean it. Don\'t stand still down here.'),
    T('jade-rabbit', 'The eyes are not angry. They are only very, very tired of being alone in the dark.'),
    T('tin-woodman', 'If I clank loudly, perhaps the echo will be too embarrassed to copy me.'),
    T('ninefold', 'I know this kind of place. I was born near one. It is not wicked. It is only waiting to be seen.'),
  ],
  'enter.c3-wheatsheaf': [T('pip', 'The corn\'s whispering!'), T('tansy', 'Smells of bread here. Always did.')],
  'enter.c3-wheatsheaf-warren': [T('pip', 'Barley\'s warren is so TIDY.'), T('jade-rabbit', 'Warm. It is warm here now.')],
  'enter.c3-underway': [T('pip', 'Round and round...'), T('tansy', 'Mind the dust.')],
  'enter.c3-munchkin': [T('pip', 'Blue grass!'), T('tin-woodman', 'The Munchkins are kind people.')],
  'enter.c3-forest': [T('tin-woodman', 'My old forest. Mind the branches.'), T('pip', 'It\'s dark in the trees.')],
  'enter.c3-river': [T('tansy', 'No poles this time.'), T('jade-rabbit', 'The river sings.')],
  'enter.c3-poppies': [T('pip', 'Don\'t... yawn... don\'t yawn.'), T('tin-woodman', 'I shan\'t sleep. I can\'t.')],
  'enter.c3-emerald': [T('pip', 'GREEN!'), T('tansy', 'Spectacles on, everyone.')],
  'enter.c3-palace': [T('pip', 'Shh. It\'s very echo-y.'), T('tin-woodman', 'What a grand room.')],
  'enter.c3-winkie': [T('tansy', 'Eyes open.'), T('pip', 'It\'s all yellow!')],
  'enter.c3-castle': [T('tin-woodman', 'Be brave, everyone. I shall try.'), T('pip', 'It smells of dust.')],
  'enter.c3-south': [T('pip', 'Red!'), T('jade-rabbit', 'A gentle country.')],
  'enter.c3-china': [T('pip', 'Softly. Softly.'), T('tin-woodman', 'I shall hold my breath. I do not breathe anyway.')],
  'enter.c3-stair': [T('pip', 'Was that our footsteps?'), T('tansy', 'Keep moving.')],
  pairs: [
    { id: 'c3-pip-tansy', a: 'pip', b: 'tansy', lines: [['pip', 'Tansy! I found Barley\'s bell! Did you hear? I found a thing that MATTERED!'], ['tansy', 'I heard. Everyone heard. You told the Munchkins. And the Stork. And a tree.'], ['pip', 'The tree was very interested.'], ['tansy', '...I\'m proud of you, you know. Don\'t make a thing of it.'], ['pip', 'I\'m going to make SUCH a thing of it.']] },
    { id: 'c3-tin-pip', a: 'tin-woodman', b: 'pip', lines: [['pip', 'Mister Woodman, if you haven\'t got a heart, what\'s that ticking?'], ['tin-woodman', 'Ticking? Oh. Oh my. Is something ticking?'], ['pip', 'In your chest. Tick tick tick. Like a little clock.'], ['tin-woodman', 'I... I believe that is a loose rivet.'], ['pip', 'I think it\'s a heart and you just didn\'t notice.'], ['tin-woodman', 'Pass me the oil-can, please. Quickly. I am going to cry.']] },
    { id: 'c3-tin-jade', a: 'tin-woodman', b: 'jade-rabbit', lines: [['jade-rabbit', 'You are always so careful where you step. Why?'], ['tin-woodman', 'In case there is a beetle. I once stepped on a beetle, and I cried for a whole afternoon.'], ['jade-rabbit', 'On the moon there is a man who chops a tree that grows back every night. He would like you.'], ['tin-woodman', 'A tree that grows back? Oh, how wonderful. Then the chopping never hurts it for long.']] },
    { id: 'c3-tansy-jade', a: 'tansy', b: 'jade-rabbit', lines: [['tansy', 'You don\'t talk much, Jade.'], ['jade-rabbit', 'I was alone a long time. I am still learning how many words a friend needs.'], ['tansy', 'Fewer than you\'d think. Bramble uses about six.'], ['jade-rabbit', 'Six good ones.'], ['tansy', 'Yeah. Six good ones.']] },
    { id: 'c3-pip-bramble', a: 'pip', b: 'jade-rabbit', cond: () => flag('c3_witchMelted'), lines: [['pip', 'Jade, why did the Witch say she was tired?'], ['jade-rabbit', 'Being cruel is heavy work, Pip. Heavier than being kind.'], ['pip', 'Then why do people do it?'], ['jade-rabbit', 'Because nobody showed them where to put it down.']] },
  ],
};

// ---------------- the home rabbits in Chapter 3
const H = {
  yarrow: [
    ['I sent Pip after you. Don\'t look at me like that. He\'s been listening to the ground for weeks. He\'s ready. More ready than you were.', 'Wheatsheaf\'s bell. I heard it ring once, when I was a kit. Plain and loud, like Barley.'],
    ['A stair of eyes, beneath Wheatsheaf. My grandmother called it the Watching Way. She said you must let it see you.', 'Silver shoes. Hm. Rhyme says "thump as one". Doesn\'t say how you get down to the Sleeper to hear it. Perhaps it does now.'],
  ],
  mallow: [['Wheatsheaf bread! They sent a cartload. I\'ve traded half of it already. Business is good, Bramble.'], ['Emeralds? You\'re paying me in EMERALDS? I\'ll take them. Don\'t know what to do with them, but I\'ll take them.']],
  woodruff: [
    ['Barley of Wheatsheaf, woken by his own bell. Now THAT\'S a story ending. I\'d have written it myself if I\'d thought of it.'],
    ['A tin man who weeps, a lion who roars because he\'s frightened, a wizard who\'s just a man. Bramble, you are ruining me for ordinary stories.'],
  ],
  comfrey: [['Pip\'s gone off after you with nothing but a acorn and an ear to the ground. Bring him back in one piece. Two ears.'], ['Let me look at Pip. ...He\'s grown. He won\'t admit it, but he has. Good.']],
  'home-1': [['Clary here. I saw a little whirlwind over Wheatsheaf last night. Going round and round. I didn\'t like it.'], ['Your Pip told me there\'s a country where the sky drops houses. I\'m not going to sleep for a week.']],
  'home-2': [['Wheatsheaf dig straight, I\'ll grant them. Their drainage, though. Corn roots everywhere.'], ['Pip says Oz has yellow brick roads. Brick! Underground, brick would be a disaster. Above ground, I suppose it\'s fine.']],
  'home-3': [['Wheatsheaf rabbits can jump corn stooks from standing. I\'ve been practising on Rush.'], ['A Lion! Pip says you met a LION. I\'d have jumped right over him. Probably.']],
  'home-4': [['Barley sent me seed corn. I\'m planting it next to the clover. It\'ll be the tallest garden in the warren.'], ['Pip brought me a poppy seed from Oz. One. He says it makes you sleepy. I\'m planting it a LONG way from the nursery.']],
  'home-5': [['Pip went? PIP? He\'s tiny! I mean, I\'d have gone. I was... busy.'], ['Pip says he wasn\'t scared of the Witch. Hm. Well. I\'d not have been scared either. Of a puddle.']],
  'home-6': [['I\'m writing a song about Barley\'s bell. It goes DONG. That\'s the chorus. The verses are harder.'], ['A song about a mouse queen who pulled a lion out of the poppies. It\'s my best one yet. Don\'t tell the moon song.']],
  'home-7': [['Pip\'s gone after you. I packed him a lunch. He lost it before the warren mouth. Keep an eye on him.'], ['He\'s back and he talks of nothing but tin men and mice. My Pip. Off saving the world. Wipe your nose, Pip.']],
  'home-8': [['Wheatsheaf grain: four hundred and twelve baskets. Our cellar holds three hundred and nine. I\'ve stacked the rest in the passage. Tidily.'], ['Emeralds. Pip brought one back. Precisely one point six grains. I weighed it twice.']],
  'home-9': [['Pip went on an ADVENTURE without me! He promised I could come on the next one! This IS the next one!'], ['Pip says he found a bell AND a heart AND a wizard. I found a beetle. It was a good beetle. It\'s not the same.']],
  'home-10': [['Eh? Wheatsheaf? Their bell? I remember that bell. Loud enough to wake the dead. Or the hummed, I suppose.'], ['Eh? Oz? Silver shoes? Young rabbits these days. In my day you walked, and if you wanted shoes you grew thicker paws.']],
};
const WOKEN = ['woodruff', 'mallow', 'home-4', 'home-6', 'home-8'];
const homeScripts = {};
for (const [id, [before, after]] of Object.entries(H)) {
  homeScripts[`home.${id}.ch3`] = async (s, a) => {
    // Wheatsheaf is woken in the same scene that brings Pip in, so the "Barley's woken" lines belong after it;
    // before that these rabbits keep their Chapter 2 lines
    const list = flag('g_recruit_pip') ? [...after, ...(WOKEN.includes(id) ? before : [])] : WOKEN.includes(id) ? [] : before;
    if (!list.length) { const f = G.data.scripts[`home.${id}.ch2`]; if (f) await f(s, a); return; }
    const k = `c3_home_${id}`; const n = s.val(k) || 0; s.set(k, n + 1);
    await s.say(id, list[n % list.length]);
  };
}
export { homeScripts };

// ---------------- visitors in Thimblebank after Chapter 3's friends join
const away = id => () => !travelling().includes(id);
export const mapAdds = {
  'c0-warren': {
    npcs: [
      { id: 'c3-barley', sprite: 'barley', x: 13, y: 11, facing: 'sw', talk: 'c3.home.barley', cond: () => flag('g_freed_wheatsheaf') },
      { id: 'c3-pip', sprite: 'pip', x: 17, y: 15, facing: 'se', talk: 'c3.home.pip', cond: () => flag('g_recruit_pip') && away('pip')() },
      { id: 'c3-tin', sprite: 'tin-woodman', x: 13, y: 17, facing: 'sw', talk: 'c3.home.tin', cond: () => flag('g_recruit_tin-woodman') && away('tin-woodman')() },
    ],
  },
};
export const homeVisitors = {
  'c3.home.barley': async (s) => {
    await s.say('barley', flag('g_ch3_done')
      ? 'Your Yarrow and me, we\'ve been talking about the old days. When the warrens thumped together for the harvest. We could do it again, I reckon.'
      : 'Brought the bread. Wheatsheaf always brings the bread. Your Mallow\'s already trying to sell it back to me.');
  },
  'c3.home.pip': async (s) => { await s.say('pip', 'I\'m telling everyone about Oz! Tuft doesn\'t believe the bit about the mice. It\'s the TRUEST bit!'); },
  'c3.home.tin': async (s) => { await s.say('tin-woodman', 'Your warren is so cosy. I have to be careful of my head on the ceilings. And of the kits. They keep trying to see their faces in me.'); },
};
