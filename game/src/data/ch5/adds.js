// After the ending: visitors from every warren stay on Sorrel Down (the hub), so wandering after the
// credits still feels like the peace the Finale won.
import { flag } from '../../state.js';

const won = () => flag('g_won');
const V = (id, sprite, fur, x, y, facing, extra = {}) => ({ id, sprite, fur, x, y, facing, talk: 'c5.visit', cond: won, ...extra });

export const MAP_ADDS = {
  'c0-downs': {
    npcs: [
      V('c5-echo', 'rabbit-doe', null, 21, 23, 'se', { look: 'hollow' }),
      V('c5-sd', 'rabbit-doe', 'silver', 28, 24, 'sw'),
      V('c5-ws', 'rabbit-buck', 'ginger', 30, 26, 'nw'),
      V('c5-fc', 'rabbit-kit', 'dark', 26, 28, 'ne', { kid: true }),
    ],
  },
};

const LINES = {
  'c5-echo': [
    'I am... I was... of Deepdelve. Your Yarrow says I may stay until I remember my name. He says there is no hurry.',
    'The sun is very loud up here. I like it. I think I used to like it before, too.',
  ],
  'c5-sd': [
    'Aster sent us to help rebuild your nursery. Mostly we\'re eating your clover. It\'s very good clover.',
    'Listen. Can you hear the hills purring? Silverdown can. We sleep with our ears on the ground now.',
  ],
  'c5-ws': [
    'Barley says the corn came up twice as tall this year. Says it\'s the ground being happy. I say it\'s the rain. We\'re both right.',
    'You\'re the one who went into the dream. Hm. Thought you\'d be taller. Better that you\'re not, maybe.',
  ],
  'c5-fc': [
    'I\'m from Flintcomb! We\'re filling in the hole! ALL of it! Captain Quarry says it\'ll take a hundred years!',
    'I can say my name now whenever I want. It\'s Flick. Flick, Flick, Flick. Sorry. I like saying it.',
  ],
};

export const ADD_SPEAKERS = {
  'c5-echo': { name: 'An echo of Deepdelve', por: 'hollow-rabbit' },
  'c5-sd': { name: 'A Silverdown doe', por: 'generic-doe' },
  'c5-ws': { name: 'A Wheatsheaf buck', por: 'generic-buck' },
  'c5-fc': { name: 'Flick of Flintcomb', por: 'generic-kit' },
};

export const ADD_SCRIPTS = {
  'c5.visit': async (s, a) => {
    const L = LINES[a.id]; if (!L) return;
    const k = 'c5_visit_' + a.id; const n = s.val(k) || 0;
    await s.say(a.id, L[n % L.length]);
    s.set(k, n + 1);
  },
};
