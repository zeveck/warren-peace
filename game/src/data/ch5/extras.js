// The Finale's speakers, bestiary, banter (Talk lines, map-entry bubbles, pair banters), quests and places.
import { flag } from '../../state.js';

// ---------------------------------------------------------------- speakers
const gen = (name, por) => ({ name, por });
export const SPEAKERS = {
  echo: gen('An echo of Deepdelve', 'hollow-rabbit'),
  'nightmare-deepdelve': gen('The Nightmare of Deepdelve', 'hollow-rabbit'),
  'nightmare-flintcomb': gen('The Nightmare of Flintcomb', 'quarryman'),
  mastodon: gen('The old mastodon', 'rumble'),
  'tb-1': gen('A Thimblebank buck', 'generic-buck'), 'tb-2': gen('A Thimblebank doe', 'generic-doe'), 'tb-3': gen('A Thimblebank kit', 'generic-kit'),
  'sd-1': gen('A Silverdown buck', 'generic-buck'), 'sd-2': gen('A Silverdown doe', 'generic-doe'), 'sd-3': gen('A Silverdown kit', 'generic-kit'),
  'ws-1': gen('A Wheatsheaf buck', 'generic-buck'), 'ws-2': gen('A Wheatsheaf doe', 'generic-doe'), 'ws-3': gen('A Wheatsheaf kit', 'generic-kit'),
  'fc-1': gen('A Flintcomb digger', 'quarryman'), 'fc-2': gen('A Flintcomb doe', 'generic-doe'), 'fc-3': gen('A Flintcomb buck', 'quarryman'),
  'ec-1': gen('An echo of Deepdelve', 'hollow-rabbit'), 'ec-2': gen('An echo of Deepdelve', 'hollow-rabbit'),
  'ec-3': gen('An echo of Deepdelve', 'hollow-rabbit'), 'ec-4': gen('An echo of Deepdelve', 'hollow-rabbit'),
  'ss-tb1': gen('A Thimblebank buck', 'generic-buck'), 'ss-tb2': gen('A Thimblebank doe', 'generic-doe'), 'ss-tb3': gen('A Thimblebank kit', 'generic-kit'),
  'ss-sd1': gen('A Silverdown doe', 'generic-doe'), 'ss-sd2': gen('A Silverdown buck', 'generic-buck'),
  'ss-ws1': gen('A Wheatsheaf buck', 'generic-buck'), 'ss-ws2': gen('A Wheatsheaf doe', 'generic-doe'),
  'ss-fc1': gen('A Flintcomb buck', 'quarryman'), 'ss-fc2': gen('A Flintcomb kit', 'generic-kit'),
  'ss-ec1': gen('The last echo', 'hollow-rabbit'),
};

// ---------------------------------------------------------------- bestiary
export const BESTIARY = {
  echo: 'What is left of Deepdelve Warren: rabbit-shaped hush. They came down to thump with everyone else, and they remember the rhyme better than anyone.',
  'nightmare-deepdelve': 'Every empty room of Deepdelve folded into one tall shape. It only ever wanted somebody to come for them. Somebody did.',
  'nightmare-flintcomb': 'The Hum Captain Quarry sang, dreamed back at him in flint and cold blue light. It hated hearing names said out loud.',
  eye: 'The Undersleeper: older than the chalk, bigger than the downs, not wicked at all. Nobody had ever told it a story. Now it dreams of clover.',
  mastodon: 'The old matriarch of Rumble\'s herd. She followed her calf all the way up to see a sunset, and liked it.',
};

// ---------------------------------------------------------------- banter
const T = (who, line, cond) => ({ who, line, ...(cond ? { cond } : {}) });
const before = () => !flag('g_c5-rts5_won');
const after = () => flag('g_c5-rts5_won');
const won = () => flag('g_won');
const notWon = () => !flag('g_won');

export const BANTER = {
  'talk.finale': [
    T('burdock', 'Hmph. Every warren on the downs, down a hole. Don\'t like holes. Like this one, a bit.', before),
    T('burdock', 'Stones are thumping. Your turn now. I\'ll be right here when you get back.', after),
    T('mole', 'Oh my, the dark down here is so very old. But it smells of everyone now. Clover and fur. Much better.', before),
    T('mole', 'I can feel the thumping in my whiskers. Like a heartbeat in a burrow at night. It\'s ever so comforting.', after),
    T('ratty', 'Hear that? Under everything? Like a weir in the dark. Slow and big. I\'d not like to row against it.', before),
    T('ratty', 'Steady strokes, all together. That\'s the trick with anything, rivers or dreams.', after),
    T('badger', 'Keep a squad on every stone. Not all on one. A sett with one door is a trap; a sett with three is a home.', before),
    T('badger', 'Well held. Now, the bit nobody can help you with. Be gentle with it.', after),
    T('toad', 'An audience of THOUSANDS! Every warren! Bramble, if you need a speech, I have six ready.', before),
    T('toad', 'I thumped so hard I think I\'ve sprained my magnificence. Carry on.', after),
    T('cheshire-cat', 'You may have noticed it\'s dark. I noticed. Then I stopped noticing, which is much more restful.', before),
    T('cheshire-cat', 'Into a dream. How lovely. Do mind which way is up. Nobody down there knows.', after),
    T('caterpillar', 'Three stones. One rhyme. Hm. Simple enough, if you do not think about it.', before),
    T('caterpillar', 'Go and tell it who you are. You know now, I think.', after),
    T('ninefold', 'This dark is very, very old and very, very tired. I recognise it. It is like meeting a great-grandparent.', before),
    T('ninefold', 'The Sleeper heard the thumping. I felt it notice. It was not angry. It was surprised.', after),
    T('jade-rabbit', 'On the moon the light flickered when the Sleeper dreamed badly. Down here I can feel why. It is cold in its dreams.', before),
    T('jade-rabbit', 'Steady and slow. Like pounding the elixir. One beat, then the next, then the next.', after),
    T('tansy', 'If you look scared, everyone gets scared. So don\'t. Or look scared at me. I don\'t count.', before),
    T('tansy', 'Go on. Do the dream bit. If you\'re not back by supper I\'m coming in after you.', after),
    T('pip', 'Yarrow taught me to listen to the ground. Down here it\'s so loud it\'s like listening to the sea!', before),
    T('pip', 'It\'s slowing down, Bramble! The big heart! It\'s keeping time with ours!', after),
    T('tin-woodman', 'There is so much sadness in the stone here. I can feel it with my heart. I have my oil can ready, just in case.', before),
    T('tin-woodman', 'Something gentle is happening. I can hear it ticking, like a clock that has decided to slow down.', after),
    T('captain-quarry', 'I dug toward this for a whole season and never once asked what was at the bottom. Now I know. I\'m sorry for it.', before),
    T('captain-quarry', 'Every rabbit I dragged down here is thumping for you. Make it count.', after),
    T('rumble', 'Dark. BIG dark. Rumble hold Bramble\'s tail. Not scared. Holding for Bramble.', before),
    T('rumble', 'THUMP THUMP THUMP. Rumble feet tired. Rumble feet happy.', after),
  ],
  'talk.dream': [
    T('burdock', 'Hmph. Grass on the ceiling. Sun\'s black. Stay where I can see you.'),
    T('mole', 'It\'s Sorrel Down, but it\'s been turned out like a pocket. I don\'t think I like pockets any more.'),
    T('ratty', 'Everything\'s the wrong way round. Like seeing the bank from under the water.'),
    T('badger', 'Bad dreams are only stories nobody finished. We\'ll finish this one.'),
    T('toad', 'I am not frightened. Toad is never frightened. Toad would simply like to hold somebody\'s paw, for the look of it.'),
    T('cheshire-cat', 'Which way should we go? That depends a great deal on where you want to wake up.'),
    T('caterpillar', 'Upside down. I have been upside down. It is mostly a matter of attitude.'),
    T('ninefold', 'My cousins dream like this, sometimes. Then someone kind tells them a story and they sleep better. Truly.'),
    T('jade-rabbit', 'Remember the traveller, Bramble. Give it what you have, even if it seems small.'),
    T('tansy', 'I was in a dream like this once. A cold one. You pulled me out. Let\'s pull this one out too.'),
    T('pip', 'Is the sun supposed to hum? I don\'t think the sun is supposed to hum.'),
    T('tin-woodman', 'Be kind to it. It does not know it is hurting anyone. That is the saddest kind of hurt.'),
    T('captain-quarry', 'I know this place. I sang it. If you hear my voice in here, it isn\'t me. Not any more.'),
    T('rumble', 'Sky DOWN. Grass UP. Rumble hold on with all four feet.'),
  ],
  'talk.sunset': [
    T('burdock', 'Hmph. Good sunset. Seen worse. Not many.'),
    T('mole', 'Clover and sunset and everyone. Oh, Bramble. I don\'t want to go anywhere, ever.'),
    T('ratty', 'There\'s a little stream along the bottom of the down. I\'ve already named it. Don\'t ask what.'),
    T('badger', 'Too many people. Too much noise. Splendid evening.'),
    T('toad', 'I\'ve told the story of the Long Thump eleven times. It gets better every time. I\'m in it much more now.'),
    T('cheshire-cat', 'Every ending is somebody\'s beginning. I intend to be at several.'),
    T('caterpillar', 'Hm. A sunset. Very orange. Very nice. Don\'t tell anyone I said so.'),
    T('ninefold', 'The sun goes down and nobody is afraid. Up here, the dark is just a blanket somebody puts on the hills.'),
    T('jade-rabbit', 'From the moon, this hill is a small green thumbprint. I never knew it was so full.'),
    T('tansy', 'Race you to the Lookout Stone? Actually, no. Let\'s just walk. For once.'),
    T('pip', 'Bramble, Bramble, BRAMBLE, everybody wants to say hello to you and I said I\'d tell you!'),
    T('tin-woodman', 'My heart is so full I can hear it. Tick, tick, tick. Happy ticking.'),
    T('captain-quarry', 'I keep waiting to hear the Hum. Nothing. Only crickets. I could listen to crickets all night.'),
    T('rumble', 'Sky is ORANGE! Rumble never see orange sky! Rumble eat some clover about it.'),
  ],
  'enter.c5-deep': [
    T('burdock', 'Hmph. Deep.'), T('mole', 'Oh my, the dark breathes!'), T('ratty', 'Hear that hum? Slow, like the river at night.'),
    T('badger', 'Stay close.'), T('toad', 'Hullo-o-o-o! ...No echo. How rude.'), T('cheshire-cat', 'How very bottom-of-everything.'),
    T('caterpillar', 'Hm. Dark.'), T('ninefold', 'The oldest dark. It is so tired.'), T('jade-rabbit', 'The light flickers, even here.'),
    T('tansy', 'Stay where I can see you.'), T('pip', 'Bramble... I can hear it breathing.'), T('tin-woodman', 'Oh, it\'s so sad down here.'),
    T('captain-quarry', 'The bottom of my hole.'), T('rumble', 'Big dark. Rumble brave.'),
  ],
  'enter.c5-dream': [
    T('burdock', 'Hmph. Ceiling\'s grass.'), T('mole', 'The hills are upside down!'), T('ratty', 'A reflection that\'s decided to stay.'),
    T('badger', 'I don\'t know this wood.'), T('toad', 'Topsy-turvy! What a lark!'), T('cheshire-cat', 'At last, somewhere sensible.'),
    T('caterpillar', 'Upside down. Overrated.'), T('ninefold', 'This dream is unwell.'), T('jade-rabbit', 'The black sun. Chang\'e saw this.'),
    T('tansy', 'Upside down. That\'s just rude.'), T('pip', 'The sun is BLACK!'), T('tin-woodman', 'A dream that hurts.'),
    T('captain-quarry', 'I know this hum.'), T('rumble', 'Sky DOWN!'),
  ],
  'enter.c5-sunset': [
    T('burdock', 'Hmph. Home.', won), T('mole', 'Oh, the smell of clover!', won), T('ratty', 'What an evening.', won),
    T('toad', 'Poop-poop! Party!', won), T('tansy', 'Still the fastest.', won), T('pip', 'Everybody\'s HERE!', won),
    T('rumble', 'Orange sky!', won), T('ninefold', 'Every night? How generous.', won),
  ],
  pairs: [
    { id: 'c5-tansy-bramble', a: 'tansy', b: 'bramble', area: 'finale', cond: before, lines: [
      ['tansy', 'Bramble. If this goes wrong...'], ['bramble', 'It won\'t.'], ['tansy', 'I KNOW it won\'t. I\'m saying IF.'],
      ['tansy', 'If it goes wrong, I\'m glad it was you who came. That\'s all. Don\'t make a face.'], ['bramble', 'I\'m not making a face.'], ['tansy', 'You\'re making a huge face.'] ] },
    { id: 'c5-toad-badger', a: 'toad', b: 'badger', area: 'finale', lines: [
      ['toad', 'Badger, old chap, when this is over I shall host a banquet at Toad Hall for every warren on the downs!'], ['badger', 'Every warren. Thousands of rabbits. In your dining room.'],
      ['toad', 'Er. In the grounds. On the lawn. With lanterns!'], ['badger', 'And who will pay for the lanterns, Toad?'], ['toad', '...Ratty?'], ['badger', 'Hmph. Thump, Toad. Just thump.'] ] },
    { id: 'c5-ratty-mole', a: 'ratty', b: 'mole', area: 'sunset', lines: [
      ['mole', 'Ratty. Do you remember the first day? When I came up out of the ground and saw the river?'], ['ratty', 'You sat down in the grass and said "Oh my" eleven times. I counted.'],
      ['mole', 'I told that to the Undersleeper, you know. Bramble did. In the dream.'], ['ratty', 'Did it like it?'],
      ['mole', 'Bramble says it smiled.'], ['ratty', 'Well. Of course it did. It\'s a very good river.'] ] },
    { id: 'c5-ninefold-cat', a: 'ninefold', b: 'cheshire-cat', area: 'dream', lines: [
      ['ninefold', 'Cat. In this dream, I find I cannot tell which way is up.'], ['cheshire-cat', 'Nor can I. Isn\'t it marvellous?'],
      ['ninefold', 'It is not marvellous. It is unsettling. I am only telling you because you do not scream.'], ['cheshire-cat', 'I never scream. It spoils the grin.'],
      ['ninefold', 'Then I shall stay near your grin. As a fixed point.'], ['cheshire-cat', 'How flattering. I\'ll try to leave it on.'] ] },
    { id: 'c5-pip-quarry', a: 'pip', b: 'captain-quarry', area: 'finale', lines: [
      ['pip', 'Captain Quarry? Are you scared?'], ['captain-quarry', '...Yes, little one. Very.'],
      ['pip', 'Me too. Yarrow says that\'s how you know you\'re in the right place.'], ['captain-quarry', 'Old Yarrow says a lot of things.'],
      ['pip', 'He\'s usually right.'], ['captain-quarry', 'Hmph. He is, at that. Stay by me, then. We\'ll be scared together.'] ] },
    { id: 'c5-tin-rumble', a: 'tin-woodman', b: 'rumble', area: 'sunset', lines: [
      ['rumble', 'Tin man! Tin man shiny! Sunset make tin man ORANGE!'], ['tin-woodman', 'Oh! So it does. I hadn\'t noticed. How very pretty.'],
      ['rumble', 'Tin man crying again?'], ['tin-woodman', 'Only a little. Happy crying. It is the best kind.'],
      ['rumble', 'Rumble get oil can.'], ['tin-woodman', 'Thank you, Rumble. You are a very good friend.'] ] },
  ],
};

// ---------------------------------------------------------------- quests and places
export const QUESTS = [
  { title: 'The Long Thump', show: () => flag('c5_gathered'), done: () => flag('g_c5-rts5_won'),
    step: () => 'Talk to Old Yarrow at the Thump Stones, then hold all three stones together.' },
  { title: 'Into the Dream', show: () => flag('g_c5-rts5_won'), done: () => flag('g_c5_dream_done'),
    step: () => flag('c5_p2') ? 'Walk on to the black sun and tell the Eye a story each round.' : flag('c5_p1') ? 'Go deeper into the dream.' : 'Walk down into the dream, toward the black sun.' },
  { title: 'Home', show: () => flag('g_c5_dream_done'), done: () => flag('g_won'),
    step: () => 'Talk to everyone at the feast, then sit with Tansy on the Lookout Stone.' },
];
export const PLACES = [
  { name: 'The Sleeping Deep', map: 'c5-deep', cond: () => flag('c5_gathered') },
  { name: 'The Dream', map: 'c5-dream', cond: () => flag('c5_dream_arrived') },
  { name: 'Sorrel Down at Sunset', map: 'c5-sunset', cond: () => flag('g_c5_dream_done') },
];
export { notWon };
