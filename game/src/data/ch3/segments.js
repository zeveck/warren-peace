// Chapter 3's play-test segments.
const CH12 = ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar', 'ninefold', 'jade-rabbit', 'tansy'];
const BASE_FLAGS = {
  g_ch0_done: true, g_ch1_done: true, g_ch2_done: true, g_ch2_open: true,
  g_freed_thimblebank: true, g_freed_silverdown: true, g_c1_riverbank_done: true, g_c1_wonder_done: true, g_c1_shallows_done: true,
  'g_c1-rts1_won': true, 'g_c2-rts2_won': true, g_underway_c1: true, g_underway_c2: true,
  'g_recruit_white-rabbit': true, g_recruit_chert: true, g_recruit_aster: true,
};
const T3 = { 'digging-claw+3': 1, 'sling+3': 1, 'quill+3': 1, 'moon-silk+3': 2, 'waistcoat+3': 1, 'courage-ribbon+3': 1, 'calm-stone+3': 1, 'motor-goggles+3': 1 };
// the Emerald City on the main-path budget (calibration.md): T4 tools for three and two T4 coats, the rest T3;
// a third T4 coat after the Witch
const T4 = { ...T3, 'little-axe+4': 1, 'sling+4': 1, 'quill+4': 1, 'emerald-cloak+4': 1, 'tin-vest+4': 1 };
const T4B = { ...T4, 'straw-vest+4': 1 };
const party = (lv, extra = []) => [['bramble', lv], ...CH12.map(id => [id, lv]), ...extra.map(id => [id, lv])];
const OZ_A = { g_ch3_open: true, 'g_c3-rts3_won': true, g_freed_wheatsheaf: true, g_recruit_barley: true, g_underway_c3: true, c3_barleyWoken: true, c3_bellHung: true, c3_ozVisited: true };

export const segments = [
  { id: 'c3-rts3', name: 'The Battle of Wheatsheaf', map: 'c3-wheatsheaf', x: 27, y: 15, facing: 'nw',
    party: party(18), active: ['tansy', 'jade-rabbit'], flags: { ...BASE_FLAGS }, items: { dandelion: 3 }, gear: T3, equip: true, buttons: 400,
    memories: ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller'], quest: 'Win the Battle of Wheatsheaf.',
    script: 'c3.seg.rts3', done: (s) => s.flags['g_c3-rts3_won'] },
  { id: 'c3-barley', name: 'Wheatsheaf: Barley and Pip', map: 'c3-wheatsheaf', x: 27, y: 15, facing: 'nw',
    party: party(18), active: ['tansy', 'jade-rabbit'], flags: { ...BASE_FLAGS, g_ch3_open: true, 'g_c3-rts3_won': true, c3_wsSeen: true }, items: { dandelion: 3, 'clover-bunch': 3 }, gear: T3, equip: true, buttons: 500,
    memories: ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller'], quest: 'Wake Barley, Wheatsheaf\'s chief, in the hall under the warren mouth.',
    done: (s) => s.flags.g_freed_wheatsheaf },
  { id: 'c3-oz-a', name: 'Oz: Munchkins to the poppies', map: 'c3-underway', x: 11, y: 15, facing: 'ne',
    party: party(19, ['pip']), active: ['pip', 'jade-rabbit'], flags: { ...BASE_FLAGS, ...OZ_A, c3_ozVisited: false, c3_underwaySeen: true },
    items: { dandelion: 3, 'carrot-cake': 1, 'wheatsheaf-key': 1 }, gear: T3, equip: true, buttons: 700,
    memories: ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller'], quest: 'Step into the whirling dust in the middle of the Underway.',
    done: (s) => s.flags['g_recruit_tin-woodman'] && s.flags.g_recruit_scarecrow && s.flags['g_recruit_cowardly-lion'] && s.flags['g_recruit_mouse-queen'] },
  { id: 'c3-oz-b', name: 'Oz: the Emerald City and the Witch', map: 'c3-emerald', x: 15, y: 29, facing: 'ne',
    party: party(20, ['pip', 'tin-woodman']), active: ['tin-woodman', 'jade-rabbit'],
    flags: { ...BASE_FLAGS, ...OZ_A, 'g_recruit_tin-woodman': true, g_recruit_scarecrow: true, 'g_recruit_cowardly-lion': true, 'g_recruit_mouse-queen': true,
      g_squad_winkies: true, 'g_squad_emerald-guard': true, 'g_squad_lions-beasts': true, 'g_squad_field-mice': true,
      c3_shoes: true, c3_kissed: true, c3_tinOiled: true, c3_chaseDone: true, c3_poppiesDone: true, c3_mouseSaved: true, c3_storkDone: true },
    items: { dandelion: 4, 'carrot-cake': 2, 'silver-shoes': 1, 'wheatsheaf-key': 1 }, gear: T4, equip: true, buttons: 300,
    memories: ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies'], quest: 'Go into the Emerald City and ask to see the Wizard.', enter: true,
    done: (s) => s.flags.g_c3_oz_done },
  { id: 'c3-china', name: 'Oz: the China Country', map: 'c3-south', x: 4, y: 14, facing: 'se',
    party: party(21, ['pip', 'tin-woodman']), active: ['tin-woodman', 'pip'],
    flags: { ...BASE_FLAGS, ...OZ_A, 'g_recruit_tin-woodman': true, g_recruit_scarecrow: true, 'g_recruit_cowardly-lion': true, 'g_recruit_mouse-queen': true, c3_shoes: true, c3_kissed: true, c3_specs: true, c3_wizardMet: true },
    items: { dandelion: 4, 'silver-shoes': 1 }, gear: T4B, equip: true, buttons: 800,
    memories: ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies'], quest: 'Cross the dainty China Country to its Princess.',
    done: (s) => s.memories.includes('mem-china') },
  { id: 'c3-stair', name: 'The Stair of Eyes', map: 'c3-underway', x: 15, y: 8, facing: 'ne',
    party: party(21, ['pip', 'tin-woodman']), active: ['tin-woodman', 'jade-rabbit'],
    flags: { ...BASE_FLAGS, ...OZ_A, 'g_recruit_tin-woodman': true, g_recruit_scarecrow: true, 'g_recruit_cowardly-lion': true, 'g_recruit_mouse-queen': true, 'g_recruit_monkey-king': true,
      g_c3_oz_done: true, c3_underwaySeen: true, c3_witchMelted: true, c3_glinda: true },
    items: { dandelion: 4, 'carrot-cake': 2, 'emerald-lozenge': 2, 'silver-shoes': 1, 'golden-cap': 1, 'wheatsheaf-key': 1 }, gear: T4B, equip: true, buttons: 900,
    memories: ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies'], quest: 'Go down the Stair of Eyes.',
    done: (s) => s.flags.g_ch3_done },
];
