// The play-test's levels for chapter 4.
const ALL3 = ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar', 'ninefold', 'jade-rabbit', 'tansy', 'pip', 'tin-woodman'];
const lv = (L, extra = []) => [['bramble', L], ...ALL3.map(id => [id, L]), ...extra.map(id => [id, L])];
const FLAGS3 = {
  g_ch0_done: true, g_ch1_done: true, g_ch2_done: true, g_ch3_done: true, g_ch2_open: true, g_ch3_open: true,
  g_freed_thimblebank: true, g_freed_silverdown: true, g_freed_wheatsheaf: true,
  g_c1_riverbank_done: true, g_c1_wonder_done: true, g_c1_shallows_done: true,
  'g_c1-rts1_won': true, 'g_c2-rts2_won': true, 'g_c3-rts3_won': true,
  g_underway_c1: true, g_underway_c2: true, g_underway_c3: true,
  g_recruit_chert: true, g_recruit_aster: true, g_recruit_barley: true, 'g_recruit_white-rabbit': true,
  g_recruit_scarecrow: true, 'g_recruit_cowardly-lion': true, 'g_recruit_mouse-queen': true, 'g_recruit_monkey-king': true,
};
const MEM3 = ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies'];
// gear on the main-path budget (design/progress/calibration.md): T4 tools and coats, T3 charms; at Quarry's store T5
// tools for three and two coats first (c4-hole), two more pieces by the herd, the full T5 set by the Root
const T3C = { 'courage-ribbon+3': 1, 'calm-stone+3': 1, 'motor-goggles+3': 1 };
const T4 = { ...T3C, 'little-axe+4': 1, 'sling+4': 1, 'lantern+4': 1, 'emerald-cloak+4': 2, 'tin-vest+4': 1 };
const T5A = { ...T4, 'flint-pick+5': 1, 'digging-claw+5': 1, 'lantern+5': 1, 'oilskin+5': 1, 'tin-vest+5': 1 };
const T5B = { ...T5A, 'waistcoat+5': 1, 'calm-stone+5': 1 };
const T5 = { 'flint-pick+5': 1, 'digging-claw+5': 1, 'lantern+5': 1, 'oilskin+5': 1, 'tin-vest+5': 1, 'waistcoat+5': 1, 'courage-ribbon+5': 1, 'calm-stone+5': 1, 'lucky-clover+5': 1 };
const ITEMS = { dandelion: 4, 'carrot-cake': 2, 'pluck-berry': 3, 'courage-biscuit': 2 };
export const SEGMENTS = [
  { id: 'c4-rts4', name: 'The Battle of Flintcomb', map: 'c4-flintcomb', x: 2, y: 19, facing: 'se',
    party: lv(22), active: ['tansy', 'jade-rabbit'], flags: { ...FLAGS3 }, items: ITEMS, gear: T4, equip: true, buttons: 400, memories: MEM3,
    quest: 'The Lookout Stone: win the Battle of Flintcomb.', script: 'c4.test.lookout',
    done: s => s.flags['g_c4-rts4_won'] },
  { id: 'c4-quarry', name: 'Flintcomb and Captain Quarry', map: 'c4-flintcomb', x: 2, y: 19, facing: 'se',
    party: lv(22), active: ['tansy', 'jade-rabbit'], flags: { ...FLAGS3, 'g_c4-rts4_won': true, g_ch4_open: true }, items: ITEMS, gear: T4, equip: true, buttons: 500, memories: MEM3,
    quest: 'Find the warren mouth at the back of the quarry and go down.', enter: true,
    done: s => s.flags.g_freed_flintcomb },
  { id: 'c4-hole', name: 'The Hole and the Lidenbrock Sea', map: 'c4-underway', x: 9, y: 3, facing: 'se',
    party: lv(23, ['captain-quarry']), active: ['captain-quarry', 'jade-rabbit'], flags: { ...FLAGS3, 'g_c4-rts4_won': true, g_ch4_open: true, g_freed_flintcomb: true, c4_needle: true, c4_seen_flintcomb: true, c4_seen_warren: true },
    items: { ...ITEMS, 'flintcomb-key': 1 }, gear: T5A, equip: true, buttons: 300, memories: MEM3,
    quest: 'Follow the old tubes down from the Underway.', enter: true,
    done: s => s.flags.c4_reached_mushrooms },
  { id: 'c4-herd', name: 'The Mushrooms and the Herd', map: 'c4-mushrooms', x: 1, y: 20, facing: 'se',
    party: lv(24, ['captain-quarry']), active: ['captain-quarry', 'jade-rabbit'], flags: { ...FLAGS3, 'g_c4-rts4_won': true, g_ch4_open: true, g_freed_flintcomb: true, c4_needle: true, g_underway_c4: true, c4_reached_mushrooms: true, c4_crossed: true },
    items: { ...ITEMS, 'flintcomb-key': 1 }, gear: T5B, equip: true, buttons: 400, memories: MEM3,
    quest: 'Find a way on through the giant mushroom forest.', enter: true,
    done: s => s.flags.g_recruit_rumble && s.flags.c4_rock_cleared },
  { id: 'c4-root', name: 'The Root of the World', map: 'c4-root', x: 3, y: 4, facing: 'se',
    party: lv(25, ['captain-quarry', 'rumble']), active: ['rumble', 'jade-rabbit'], flags: { ...FLAGS3, 'g_c4-rts4_won': true, g_ch4_open: true, g_freed_flintcomb: true, c4_needle: true, g_underway_c4: true, c4_reached_mushrooms: true, c4_crossed: true, c4_rock_cleared: true, 'g_squad_mastodon-herd': true },
    items: { ...ITEMS, 'flintcomb-key': 1 }, gear: T5, equip: true, buttons: 600, memories: [...MEM3, 'mem-mushrooms'],
    quest: 'Go down into the Root of the World.', enter: true,
    done: s => s.flags.g_ch4_done },
];
