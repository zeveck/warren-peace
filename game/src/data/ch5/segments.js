// The play-test's levels for the Finale: the Long Thump, the Dream, the ending.
const EVERYONE = ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar', 'ninefold', 'jade-rabbit', 'tansy', 'pip', 'tin-woodman', 'captain-quarry', 'rumble'];
const lv = L => [['bramble', L], ...EVERYONE.map(id => [id, L])];
export const FLAGS4 = {
  g_ch0_done: true, g_ch1_done: true, g_ch2_done: true, g_ch3_done: true, g_ch4_done: true,
  g_ch2_open: true, g_ch3_open: true, g_ch4_open: true,
  g_freed_thimblebank: true, g_freed_silverdown: true, g_freed_wheatsheaf: true, g_freed_flintcomb: true,
  g_c1_riverbank_done: true, g_c1_wonder_done: true, g_c1_shallows_done: true,
  'g_c1-rts1_won': true, 'g_c2-rts2_won': true, 'g_c3-rts3_won': true, 'g_c4-rts4_won': true,
  g_underway_c1: true, g_underway_c2: true, g_underway_c3: true, g_underway_c4: true,
  g_recruit_chert: true, g_recruit_aster: true, g_recruit_barley: true, 'g_recruit_white-rabbit': true,
  g_recruit_scarecrow: true, 'g_recruit_cowardly-lion': true, 'g_recruit_mouse-queen': true, 'g_recruit_monkey-king': true,
};
// the seven main-path memories (the optional four come from optional content)
const MEM = ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies', 'mem-mushrooms'];
// tier-5 gear from Quarry's store, a few tier-6 pieces from Elevenfold
const GEAR = {
  'flint-pick+5': 1, 'digging-claw+5': 1, 'lantern+6': 1, 'mastodon-hide+6': 1, 'oilskin+5': 1, 'tin-vest+5': 1,
  'courage-ribbon+5': 1, 'calm-stone+5': 1, 'lucky-clover+5': 1,   // calm-stone 6 -> 5: main-path budget (calibration.md)
};
const ITEMS = { dandelion: 5, 'carrot-cake': 3, 'pluck-berry': 4, 'glow-mushroom': 2, 'emerald-lozenge': 2, 'star-stone-item': 2, 'jade-elixir': 2 };
const KEYS = { 'old-key': 1, 'silver-shoes': 1 };
const ARMY3 = {}; for (const k of ['stout', 'swift', 'wing', 'eerie']) for (const g of ['banner', 'mail', 'rations']) ARMY3[k + ':' + g] = 2;

export const SEGMENTS = [
  { id: 'c5-rts5', name: 'The Long Thump', map: 'c5-deep', x: 3, y: 3, facing: 'se',
    party: lv(26), active: ['tansy', 'captain-quarry'], flags: { ...FLAGS4 }, items: { ...ITEMS, ...KEYS }, gear: GEAR, equip: true,
    armyGear: ARMY3, buttons: 900, memories: MEM, quest: 'Go down into the Sleeping Deep.', enter: true,
    done: s => s.flags['g_c5-rts5_won'] },
  { id: 'c5-dream', name: 'The Dream', map: 'c5-dream', x: 9, y: 2, facing: 'se',
    party: lv(26), active: ['tansy', 'jade-rabbit'], flags: { ...FLAGS4, c5_gathered: true, c5_yarrow_talked: true, 'g_c5-rts5_won': true },
    items: { ...ITEMS, ...KEYS }, gear: GEAR, equip: true, armyGear: ARMY3, buttons: 900, memories: MEM,
    quest: 'Walk down into the dream, toward the black sun.', enter: true,
    done: s => s.flags.g_c5_dream_done },
  { id: 'c5-ending', name: 'Home at Sunset', map: 'c5-sunset', x: 10, y: 9, facing: 'se',
    party: lv(27), active: ['tansy', 'pip'], flags: { ...FLAGS4, c5_gathered: true, c5_yarrow_talked: true, 'g_c5-rts5_won': true, c5_dream_arrived: true, c5_p1: true, c5_p2: true, g_c5_dream_done: true },
    items: { ...ITEMS, ...KEYS }, gear: GEAR, equip: true, armyGear: ARMY3, buttons: 900, memories: MEM,
    quest: 'Home.', enter: true,
    done: s => s.flags.g_won },
  // post-game: the army revisits at the sunset Lookout Stone (rts/revisits.js); done when two battles have best times
  { id: 'pg-revisits', name: 'Revisits (post-game)', map: 'c5-sunset', x: 7, y: 24, facing: 'ne', chapter: 5,
    party: lv(27), active: ['tansy', 'pip'], flags: { ...FLAGS4, c5_gathered: true, c5_yarrow_talked: true, 'g_c5-rts5_won': true, c5_dream_arrived: true, c5_p1: true, c5_p2: true, g_c5_dream_done: true, c5_sunset_arrived: true, g_won: true, g_ch5_done: true, c0_intro: true, c0_attack: true, c0_guided: true },
    items: { ...ITEMS, ...KEYS }, gear: GEAR, equip: true, armyGear: ARMY3, buttons: 900, memories: MEM,
    quest: 'Peace on the Downs. Wander, and talk to everyone.',
    done: s => !!(s.armyBest && s.armyBest['c1-rts1'] && s.armyBest['c4-rts4']) },
];
