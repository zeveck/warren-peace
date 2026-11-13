// The play-test's levels for the Epilogue (after the ending, everyone recruited, level 28).
const EVERYONE = ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar', 'ninefold', 'jade-rabbit', 'tansy', 'pip', 'tin-woodman', 'captain-quarry', 'rumble'];
const party = [['bramble', 28], ...EVERYONE.map(id => [id, 28])];
// the ending's flags (copied from ch5's segments, plus the finale's own)
export const WON = {
  g_ch0_done: true, g_ch1_done: true, g_ch2_done: true, g_ch3_done: true, g_ch4_done: true, g_ch5_done: true, g_won: true,
  g_ch2_open: true, g_ch3_open: true, g_ch4_open: true,
  g_freed_thimblebank: true, g_freed_silverdown: true, g_freed_wheatsheaf: true, g_freed_flintcomb: true,
  g_c1_riverbank_done: true, g_c1_wonder_done: true, g_c1_shallows_done: true,
  'g_c1-rts1_won': true, 'g_c2-rts2_won': true, 'g_c3-rts3_won': true, 'g_c4-rts4_won': true, 'g_c5-rts5_won': true,
  g_underway_c1: true, g_underway_c2: true, g_underway_c3: true, g_underway_c4: true, g_underway_c5: true,
  g_recruit_chert: true, g_recruit_aster: true, g_recruit_barley: true, 'g_recruit_white-rabbit': true,
  g_recruit_scarecrow: true, 'g_recruit_cowardly-lion': true, 'g_recruit_mouse-queen': true, 'g_recruit_monkey-king': true,
  'g_recruit_captain-quarry': true, g_recruit_rumble: true, c4_needle: true, c4_seen_flintcomb: true, c4_seen_warren: true,
  c4_card: true, c5_gathered: true, c5_yarrow_talked: true, c5_dream_arrived: true, c5_p1: true, c5_p2: true, g_c5_dream_done: true, c5_sunset_arrived: true,
};
const MEM = ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies', 'mem-mushrooms'];
const ITEMS = { 'old-key': 1, 'silver-shoes': 1, 'flintcomb-key': 1, dandelion: 3, 'clover-bunch': 3 };
const base = { party, items: ITEMS, buttons: 600, memories: MEM, equip: true, chapter: 6 };
const STARTED = { ...WON, c6_invited: true, c6_started: true };
const BOWL = { c6_heap1: true, c6_heap2: true, c6_heap3: true, c6_heaps_done: true, c6_clock1: true, c6_clock2: true, c6_clock3: true, c6_clock4: true, c6_clock5: true, c6_sown1: true, c6_sown2: true, c6_sown3: true, c6_sown: true };
export const SEGMENTS = [
  // Shale by Thimblebank's mouth, the walk east, the arrival, Rumble and the heaps, the clocks
  { id: 'c6-bowl', name: 'Epilogue: Flintcomb\'s Bowl', map: 'c0-downs', x: 19, y: 20, facing: 'se', ...base, active: ['tansy', 'burdock'], chapter: 5,
    flags: { ...WON }, quest: 'Peace on the Downs. Wander, and talk to everyone.', enter: false,
    done: s => s.flags.c6_heaps_done && s.flags.c6_sown },
  // the old rooms in the new burrows, then Chip and Gault
  { id: 'c6-burrows', name: 'Epilogue: The Old Rooms', map: 'c4-flintcomb', x: 2, y: 19, facing: 'se', ...base, active: ['tansy', 'burdock'],
    flags: { ...STARTED, ...BOWL }, quest: 'Rebuild Flintcomb.', enter: true,
    done: s => s.flags.c6_rooms_done && s.flags.c6_gault_done },
  // the same two, with the friends the scenes stage travelling instead of standing on the map (both-ways test)
  { id: 'c6-bowl-b', name: 'Epilogue: Flintcomb\'s Bowl (Rumble and Quarry travelling)', map: 'c0-downs', x: 19, y: 20, facing: 'se', ...base, active: ['rumble', 'captain-quarry'], chapter: 5,
    flags: { ...WON }, quest: 'Peace on the Downs. Wander, and talk to everyone.', enter: false,
    done: s => s.flags.c6_heaps_done && s.flags.c6_sown },
  { id: 'c6-burrows-b', name: 'Epilogue: The Old Rooms (Pip and Quarry travelling)', map: 'c4-flintcomb', x: 2, y: 19, facing: 'se', ...base, active: ['pip', 'captain-quarry'],
    flags: { ...STARTED, ...BOWL }, quest: 'Rebuild Flintcomb.', enter: true,
    done: s => s.flags.c6_rooms_done && s.flags.c6_gault_done },
  // the Top Stone at the lip and the feast
  { id: 'c6-stone', name: 'Epilogue: The Top Stone', map: 'c4-warren', x: 13, y: 16, facing: 'se', ...base, active: ['tansy', 'burdock'],
    flags: { ...STARTED, ...BOWL, c6_room_nursery: true, c6_room_larder: true, c6_room_den: true, c6_rooms_done: true, c6_gault_met: true, c6_gault_done: true, c6_seen_upburrow: true },
    quest: 'Go down Flintcomb\'s spiral to the lip of the hole.', enter: true,
    done: s => s.flags.g_c6_done },
];
