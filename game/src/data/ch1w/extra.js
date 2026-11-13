// ch1w extras: the Caucus Store, memories, bestiary, quests, places, and the Wonderland friends and Ninefold
// visiting Thimblebank (mapAdds), plus the dandelion patch on Sorrel Down for Ninefold.
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { spotNear } from './util.js';

export const shops = {
  'c1w.caucus-store': {
    name: 'The Caucus Store', keeper: 'dodo', line: 'Everybody has won, and all must have prizes! At reasonable prices.',
    gear: ['thimble-armour+1', 'walking-stick+1', 'thimble-armour+2', 'walking-stick+2', 'quill+2', 'lucky-clover+2', 'courage-ribbon+2', 'motor-goggles+2'],
    items: ['clover-bunch', 'dandelion', 'comfits', 'pluck-berry', 'smelling-salts', 'courage-biscuit', 'drink-me', 'eat-me'],
    army: 1,
  },
};

export const speakers = {};

export const memories = {
  'mem-dandelion': { title: 'Ninefold\'s dandelion', friend: 'ninefold', line: 'In the darkest room in the world, a rabbit held out one small yellow sun. Nobody had ever offered it anything before.', eye: 'The Eye has never been given anything. It looks at the little sun for a long time.', bg: 'shallows', hint: 'Bring Ninefold a dandelion from the surface.' },
  'mem-teaparty': { title: 'The tea-party', friend: 'cheshire-cat', line: 'It was always six o\'clock, nobody knew the answer to the riddle, and every answer was right. Bramble laughed till his ears shook.', eye: 'The Eye does not know what a riddle is. It finds it would like one.', bg: 'wonder-garden', hint: 'Join the Mad Tea-Party.' },
  'mem-roses': { title: 'The painted roses', friend: 'white-rabbit', line: 'Three frightened cards and a rabbit with a paintbrush, making the roses the colour they ought to be, just in time.', eye: 'The Eye has never been afraid of a Queen. It thinks it might understand being afraid of being wrong.', bg: 'wonder-garden', hint: 'Help the gardeners paint the white roses red.' },
};

export const bestiary = {
  'white-rabbit': 'The White Rabbit: the Queen\'s herald, always late, never for other rabbits. Leads the White Rabbit\'s Heralds.',
  dodo: 'The Dodo runs Caucus-races (everybody wins) and the Caucus Store (everybody pays).',
  'bill-lizard': 'Bill the Lizard: always sent down chimneys. Once came out of one like a cork. Bears no grudge.',
  'cheshire-cat': 'The Cheshire Cat: grins, vanishes, riddles. Came along "to see how it ends". Leads The Grin.',
  caterpillar: 'The Caterpillar: sat on a mushroom asking "Who are YOU?" until Bramble answered with a poem full of rabbits. Leads the Flamingos.',
  duchess: 'The Duchess: finds a moral in everything, especially pepper. Her baby is a pig now, and happier.',
  cook: 'The Duchess\'s Cook: believes there is no such thing as too much pepper. Throws pans.',
  pigeon: 'The Pigeon: guards her eggs from serpents. Considers any long neck a serpent.',
  hatter: 'The Hatter: quarrelled with Time, so it is always six o\'clock. Asks riddles with no answers.',
  'march-hare': 'The March Hare: a cousin, more or less. Offers wine there isn\'t any of.',
  dormouse: 'The Dormouse: tells stories in his sleep, about a treacle-well and things that begin with M.',
  'queen-of-hearts': 'The Queen of Hearts: plays croquet with flamingos and hedgehogs, and shouts "Off with his head!" at everybody.',
  'king-of-hearts': 'The King of Hearts: quietly pardons everyone the Queen sentences. Nearly every afternoon.',
  knave: 'The Knave of Hearts: on trial for stealing tarts. Had jam on his sleeve. Got two tarts and gave one back.',
  'seven-of-spades': 'Seven of Spades: a gardener who planted white roses by mistake. Leads the Card Gardeners.',
  ninefold: 'Ninefold: small, polite and many-eyed, from the Shallows. Had never met anyone who didn\'t scream. Leads The Polite Dark.',
  choir: 'The Whispering Choir: three stone mouths that said true things cruelly. It only said what the Sleeper dreams.',
};

export const quests = [
  { title: 'The White Rabbit\'s Gloves', show: () => flag('c1w_wr_asked'), done: () => flag('g_recruit_white-rabbit'),
    step: () => !flag('c1w_gloves') ? 'Fetch the gloves and fan from his house.' : !flag('c1w_house_done') ? 'Get out of the house (eat a little cake).' : 'Give him the gloves and fan.' },
  { title: 'Who Are YOU?', show: () => flag('c1w_wood_seen'), done: () => flag('g_recruit_caterpillar'),
    step: () => 'Find the Caterpillar inside his hedge ring in the Mushroom Wood (shrink through the gap, or grow and step over).' },
  { title: 'The Duchess\'s Baby', show: () => flag('c1w_kitchen_seen'), done: () => flag('g_recruit_cheshire-cat'),
    step: () => !flag('c1w_baby') ? 'Talk to the Duchess in her kitchen.' : 'Find where the pig trotted off to (south-east of the wood, by the hollow log).' },
  { title: 'Painting the Roses Red', show: () => flag('c1w_garden'), done: () => flag('g_recruit_seven-of-spades'),
    step: () => !flag('c1w_roses_on') ? 'Talk to the gardeners by the gate of the Queen\'s garden.' : `Paint the three white rose bushes red (${[0, 1, 2].filter(i => flag('c1w_rose' + i)).length} of 3).` },
  { title: 'A Dandelion for Ninefold', show: () => flag('c1w_nf_asked'), done: () => flag('g_recruit_ninefold'),
    step: () => (G.s && (G.s.keyItems['ninefold-dandelion'] || G.s.items.dandelion)) ? 'Take the dandelion down to Ninefold in the Shallows.' : 'Pick a dandelion on Sorrel Down (by the warren mouth) and bring it to Ninefold.' },
  { title: 'The Whispering Choir', show: () => flag('c1w_choir_seen'), done: () => flag('c1w_choir_won'),
    step: () => 'Face the stone mouths at the far end of the room bigger inside. Hit the glowing mouth.' },
];

export const places = [
  { name: 'The Hall of Doors', map: 'c1w-hall', cond: () => flag('c1w_fell') },
  { name: 'The Pool of Tears', map: 'c1w-pool', cond: () => flag('c1w_pool_seen') },
  { name: 'The White Rabbit\'s Lane', map: 'c1w-lane', cond: () => flag('c1w_lane_seen') },
  { name: 'The Mushroom Wood', map: 'c1w-wood', cond: () => flag('c1w_wood_seen') },
  { name: 'The Duchess\'s Kitchen', map: 'c1w-duchess', cond: () => flag('c1w_kitchen_seen') },
  { name: 'The Mad Tea-Party', map: 'c1w-tea', cond: () => flag('c1w_tea_seen') },
  { name: 'The Queen\'s Garden', map: 'c1w-garden', cond: () => flag('c1w_garden') },
  { name: 'The Shallows', map: 'c1w-shallows', cond: () => flag('c1w_sh_seen') },
  { name: 'The Room Bigger Inside', map: 'c1w-deep', cond: () => flag('c1w_deep_seen') },
];

// ---------------------------------------------------------------- visitors in Thimblebank, and the dandelions
const away = (id) => () => !(G.s && G.s.party.active.includes(id)) && !!(G.s && G.s.party.members[id]);
// a person placed on a free tile near a named entry of someone else's map, found when the map loads
function visitor(id, mapId, entry, talk, cond, opts) {
  // a fixed tile (opts.at): Thimblebank's warren got crowded with every chapter's visitors and triggers, and the
  // searched spots came back empty (nobody appeared)
  if (opts.at) return { id: 'c1w-' + id, sprite: id, facing: opts.facing || 'sw', talk, cond, mine: true, x: opts.at[0], y: opts.at[1] };
  return {
    id: 'c1w-' + id, sprite: id, facing: 'sw', talk, cond: () => cond() && !!spotNear(mapId, entry, opts), mine: true,
    get x() { const p = spotNear(mapId, entry, opts); return p ? p.x : -1; },
    get y() { const p = spotNear(mapId, entry, opts); return p ? p.y : -1; },
  };
}
const dandySpot = () => spotNear('c0-downs', 'warren', { min: 2, want: 3, skip: 1 });
const dandyCond = () => flag('c1w_nf_asked') && !flag('g_recruit_ninefold');
export const mapAdds = {
  'c0-warren': {
    npcs: [
      visitor('cheshire-cat', 'c0-warren', 'great-burrow', 'c1w.home.cat', () => flag('g_recruit_cheshire-cat') && away('cheshire-cat')(), { at: [18, 8], facing: 'sw' }),
      visitor('caterpillar', 'c0-warren', 'great-burrow', 'c1w.home.caterpillar', () => flag('g_recruit_caterpillar') && away('caterpillar')(), { at: [11, 10], facing: 'se' }),
      visitor('ninefold', 'c0-warren', 'deep', 'c1w.home.ninefold', () => flag('g_recruit_ninefold') && away('ninefold')(), { at: [27, 7], facing: 'nw' }),
    ],
  },
  'c0-downs': {
    npcs: [
      visitor('white-rabbit', 'c0-downs', 'lookout', 'c1w.home.wr', () => flag('g_recruit_white-rabbit'), { want: 3 }),
    ],
    props: [
      { id: 'prop-dandelions', mine: true, get x() { const p = dandySpot(); return p ? p.x : -1; }, get y() { const p = dandySpot(); return p ? p.y : -1; }, cond: () => dandyCond() && !!dandySpot() },
    ],
    triggers: [
      { use: true, mine: true, get x() { const p = dandySpot(); return p ? p.x : -99; }, get y() { const p = dandySpot(); return p ? p.y : -99; }, cond: () => dandyCond(), run: 'c1w.pick-dandelion' },
    ],
  },
};
