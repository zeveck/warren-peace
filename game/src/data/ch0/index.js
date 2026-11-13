// The Prologue: Sorrel Down and Thimblebank Warren, the hub the whole game returns to.
import { flag } from '../../state.js';
import { downs, warren } from './maps.js';
import story, { firstFight, guidedRts } from './story.js';
import homeScripts, { HOME_NAMES } from './home.js';
import banter from './banter.js';

// how far the story has got: 0 in the Prologue, 1 once ch1 has started, ... 5 in the finale
const chapterNow = () => { let n = 0; for (let i = 0; i <= 4; i++) if (flag(`g_ch${i}_done`)) n = i + 1; return n; };

const speakers = {
  'c0-kit-a': { name: 'Thistle (a kit)', por: 'generic-kit' }, 'c0-kit-b': { name: 'Moss (a kit)', por: 'generic-kit' },
};
for (const [id, [name, por]] of Object.entries(HOME_NAMES)) speakers[id] = { name, por };

// Mallow's stock grows with the chapters (tiers 1 to 6, army ranks from ch1)
const MALLOW_GEAR = [
  ['sling+1', 'digging-claw+1', 'waistcoat+1', 'courage-ribbon+1'],
  ['sling+2', 'quill+1', 'waistcoat+2', 'courage-ribbon+1', 'lucky-clover+1'],
  ['digging-claw+3', 'quill+2', 'waistcoat+3', 'poppy-ward+2', 'lucky-clover+2'],
  ['digging-claw+4', 'quill+3', 'waistcoat+4', 'calm-stone+3', 'silver-bell+3'],
  ['digging-claw+5', 'quill+4', 'waistcoat+5', 'calm-stone+4', 'acorn-cap+4'],
  ['digging-claw+6', 'quill+5', 'waistcoat+6', 'calm-stone+5', 'acorn-cap+5'],
];
const MALLOW_ITEMS = [
  ['clover-bunch', 'dandelion'],
  ['clover-bunch', 'dandelion', 'pluck-berry', 'courage-biscuit'],
  ['clover-bunch', 'dandelion', 'carrot-cake', 'pluck-berry', 'courage-biscuit', 'smelling-salts'],
  ['dandelion', 'carrot-cake', 'pluck-berry', 'courage-biscuit', 'smelling-salts'],
  ['dandelion', 'carrot-cake', 'pluck-berry', 'courage-biscuit', 'smelling-salts'],
  ['dandelion', 'carrot-cake', 'pluck-berry', 'courage-biscuit', 'smelling-salts'],
];
const shops = {
  'c0.mallow-shop': {
    name: 'Mallow\'s Trading Nook', keeper: 'mallow',
    get line() { return ['Buttons for goods, goods for buttons. That\'s civilisation.', 'Fresh stock! Well. Stock. It\'s fresh to YOU.', 'Silverdown buttons! Silver ones! Business is looking up.', 'Corn-dollies, straw, and the finest Wheatsheaf thread.', 'Flint-edged, Flintcomb-tested. They\'ll dig through anything.', 'Everything I have. Take it down there with you, Bramble.'][chapterNow()]; },
    gear: () => MALLOW_GEAR[chapterNow()],
    get items() { return MALLOW_ITEMS[chapterNow()]; },
    army: () => Math.min(3, chapterNow()),
  },
};

const encounters = {
  'c0.first-fight': firstFight,
  'c0.raiders-1': { enemies: [['raider', 2, 0], ['raider', 1, 0]], bg: 'downs' },
  'c0.raiders-2': { enemies: [['raider', 2, 0], ['raider', 2, 0]], bg: 'downs' },
  'c0.raiders-3': { enemies: [['raider', 3, 0], ['raider', 2, 0]], bg: 'downs' },
};

const bestiary = {
  yarrow: 'Old Yarrow, Thimblebank\'s eldest. Half-blind, never wrong for long, and the keeper of a key nobody was meant to need.',
  woodruff: 'Woodruff the storyteller. Knows the rhyme of the Long Thump, and every story Thimblebank ever told.',
  mallow: 'Mallow trades buttons for goods and goods for buttons, and calls it civilisation.',
  comfrey: 'Comfrey the healer fixes most things, and the rest she sits with.',
  burdock: 'Burdock, Thimblebank\'s best digger: big, gruff, soft as moss underneath. Came out of a bank of chalk to stand beside Bramble and hasn\'t moved since.',
  tansy: 'Tansy, Bramble\'s best friend: quick, sandy, sharp-tongued, and always one hop ahead in a race. Carried off east in the raid.',
  pip: 'Pip, the smallest kit in Thimblebank. Loses buttons, finds beetles, asks one more question than anyone can answer.',
  'home-1': 'Clary watches the sky for Thimblebank and worries for it too. Heather behind one ear.',
  'home-2': 'Hob, the old digger with the notched ear. Has opinions about drainage. Shares them.',
  'home-3': 'Teasel jumps higher than anyone on Sorrel Down, and will tell you so.',
  'home-4': 'Penny keeps the clover garden, fence and all. Wears one of its flowers.',
  'home-5': 'Nettle wears a red neckerchief and talks tougher than he is.',
  'home-6': 'Sloe, the warren\'s singer. Half her songs are about the moon.',
  'home-7': 'Bryony runs the nursery: warm, tired, and never once lost a kit.',
  'home-8': 'Rush mends tunnels in a knitted scarf and measures everything twice.',
  'home-9': 'Tuft, Pip\'s best friend, who has never finished a sentence before starting the next.',
  'home-10': 'Lichen is older than Yarrow, nearly deaf, and remembers when the sealed door was only a door.',
  raider: 'Flintcomb rabbits, Hum-taken: pale eyes, a low hum, and no names left. Knock the Hum out of them and they remember.',
};

const START = { map: 'c0-downs', x: downs.entries.start[0], y: downs.entries.start[1], facing: downs.entries.start[2], script: 'start' };
const PRO = { c0_intro: true };
const SURFACE_DONE = { ...PRO, c0_tansy: true, c0_pip_asked: true, c0_button: true, c0_pip_done: true, c0_tremor: true, c0_race: true };
const WARREN_DONE = { ...SURFACE_DONE, c0_in_warren: true, c0_rhyme: true, c0_yarrow_asked: true };

const segments = [
  { id: 'c0-surface', name: 'Prologue: Sorrel Down', map: 'c0-downs', x: START.x, y: START.y, facing: START.facing,
    party: [['bramble', 1]], flags: PRO, buttons: 0, quest: 'Say good morning: Tansy is in the meadow, and Pip is sniffling by the hollow log.',
    done: (s) => !!s.flags.c0_race },
  { id: 'c0-warren', name: 'Prologue: Thimblebank Warren', map: 'c0-warren', x: warren.entries.mouth[0], y: warren.entries.mouth[1], facing: 'se',
    party: [['bramble', 1]], flags: SURFACE_DONE, items: { 'clover-bunch': 1 }, buttons: 25, quest: 'Hear Woodruff\'s story in the Great Burrow, then find Old Yarrow in his den.',
    done: (s) => !!s.flags.c0_yarrow_asked },
  { id: 'c0-attack', name: 'Prologue: The attack and the Lookout', map: 'c0-downs', x: downs.entries.warren[0], y: downs.entries.warren[1], facing: 'se',
    party: [['bramble', 1]], flags: WARREN_DONE, items: { 'clover-bunch': 1 }, buttons: 25, quest: 'Pick sweetgrass for Old Yarrow: it grows beside the warren mouth, up on the down.',
    done: (s) => !!s.flags.g_ch0_done },
];

const quests = [
  { title: 'Pip\'s Button', show: () => flag('c0_pip_asked'), done: () => flag('c0_pip_done'), step: () => flag('c0_button') ? 'Take the button back to Pip.' : 'Rummage in the hollow log for Pip\'s button.' },
  { title: 'Sweetgrass for Yarrow', show: () => flag('c0_yarrow_asked'), done: () => flag('c0_attack'), step: () => 'Pick sweetgrass by the warren mouth.' },
  { title: 'The Old Key', show: () => flag('g_ch0_done'), done: () => flag('c0_door_open'), step: () => 'Open the sealed door at the end of the deep passage.' },
];

const places = [
  { name: 'Sorrel Down', map: 'c0-downs', cond: () => true },
  { name: 'Thimblebank Warren', map: 'c0-warren', cond: () => flag('c0_race') || flag('c0_in_warren') },
];

export default {
  maps: { 'c0-downs': downs, 'c0-warren': warren },
  scripts: { start: story.start, ...story.scripts, ...homeScripts },
  encounters, shops,
  rts: { 'c0-guided': guidedRts },
  speakers, bestiary, quests, places, segments,
  banter,
  start: START,
};
