// Chapter 2's play-test segments: RTS 2, Aster, the Moon (a: the depths to the Jade Rabbit; b: Chang'e to the
// Moth Queen), and the Drowned Halls (Tansy and the Tidewarden).
const CH1 = {
  c0_attack: true, c0_guided: true, g_ch0_done: true, c0_door_open: true, c1_card: true, g_underway_c1: true, c1_underway_seen: true,
  g_c1_riverbank_done: true, g_c1_wonder_done: true, g_c1_shallows_done: true, 'g_c1-rts1_won': true, g_freed_thimblebank: true, g_ch1_done: true,
  'g_recruit_white-rabbit': true, g_squad_heralds: true, g_recruit_chert: true, g_c1_nursery_cleared: true,
};
const RTS2 = { ...CH1, c2_card: true, 'g_c2-rts2_won': true, g_ch2_open: true };
const ASTER = { ...RTS2, c2_sd_seen: true, c2_sw_seen: true, c2_asterSeen: true, g_freed_silverdown: true, c2_asterWoken: true, 'g_recruit_aster': true };
const MOONA = { ...ASTER, c2_deepOpen: true, c2_dp_seen: true, g_underway_c2: true, c2_uw_seen: true, c2_mn_seen: true, c2_metWu: true, c2_metJade: true,
  c2_metTraveller: true, c2_traveller: true, c2_jadeTold: true };
const MOONB = { ...MOONA, c2_mp_seen: true, c2_changeMet1: true, c2_metChange: true, c2_mc_seen: true, c2_hares: true, c2_mg_seen: true, c2_mqSeen: true,
  c2_mothQueen: true, c2_tideDown: true };
const CH1_PARTY = ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar', 'ninefold'];
const p = (lv, ids) => [['bramble', lv], ...ids.map(id => [id, lv])];
const T2 = { 'sling+2': 1, 'digging-claw+2': 1, 'quill+2': 1, 'waistcoat+2': 2, 'oilskin+2': 1, 'courage-ribbon+2': 1, 'motor-goggles+2': 1 };
const T3 = { 'pestle-tool+3': 1, 'lantern+3': 1, 'walking-stick+3': 1, 'moon-silk+3': 2, 'waistcoat+3': 1, 'calm-stone+3': 1, 'glow-bead+3': 1 };   // no courage-ribbon+3: the T2 one still stops Afraid (main-path budget, calibration.md)
const MEM1 = ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty'];

export const segments = [
  { id: 'c2-rts2', name: 'The Battle of Silverdown', map: 'c2-silverdown', x: 31, y: 29, facing: 'ne',
    party: p(12, CH1_PARTY), active: ['badger', 'mole'], flags: { ...CH1 }, items: { 'old-key': 1, 'chalk-pebble': 1, sweetgrass: 1, dandelion: 2 },
    gear: T2, equip: true, buttons: 500, memories: MEM1.slice(), chapter: 2,
    quest: 'Gather the army at the Lookout Stone: Silverdown is next.', script: 'c2.seg.rts2', done: (s) => !!s.flags['g_c2-rts2_won'] },
  { id: 'c2-aster', name: 'Silverdown and Aster', map: 'c2-silverdown', x: 31, y: 29, facing: 'ne', enter: true,
    party: p(12, CH1_PARTY), active: ['mole', 'ninefold'], flags: { ...RTS2 }, items: { 'old-key': 1, 'chalk-pebble': 1, sweetgrass: 1, dandelion: 3, 'clover-bunch': 3 },
    gear: T2, equip: true, buttons: 500, memories: MEM1.slice(), chapter: 2,
    quest: 'North road to Silverdown: go down into the warren and wake Aster, its chief.', done: (s) => !!s.flags.g_freed_silverdown },
  { id: 'c2-moon-a', name: 'The Moon (a): Silverdown Depths to the Jade Rabbit', map: 'c2-silverdown-warren', x: 8, y: 9, facing: 'nw',
    party: p(13, CH1_PARTY), active: ['mole', 'ninefold'], flags: { ...ASTER },
    items: { 'old-key': 1, 'chalk-pebble': 1, sweetgrass: 1, 'silverdown-key': 1, dandelion: 3, 'clover-bunch': 2 },
    gear: T2, equip: true, buttons: 700, memories: MEM1.slice(), chapter: 2,
    quest: 'Silverdown\'s deep door is on the left of the Heart, down the narrow passage. Follow Tansy down.', done: (s) => !!s.flags.c2_jadeTold },
  { id: 'c2-moon-b', name: 'The Moon (b): Chang\'e and the Moth Queen', map: 'c2-moon', x: 18, y: 12, facing: 'nw',
    party: p(14, CH1_PARTY), active: ['mole', 'ninefold'], flags: { ...MOONA },
    items: { 'old-key': 1, 'chalk-pebble': 1, 'silverdown-key': 1, dandelion: 3, mooncake: 2 },
    gear: { ...T2, ...T3 }, equip: true, buttons: 400, memories: [...MEM1, 'mem-traveller'], chapter: 2,
    quest: 'Climb to the Moon Palace (north of the tree) and ask Chang\'e to speak to the Moon Hares.', done: (s) => !!s.flags['g_recruit_jade-rabbit'] },
  { id: 'c2-drowned', name: 'The Drowned Halls', map: 'c2-underway', x: 12, y: 4, facing: 'sw',
    party: p(16, [...CH1_PARTY, 'jade-rabbit']), active: ['jade-rabbit', 'badger'], flags: { ...MOONB },
    items: { 'old-key': 1, 'chalk-pebble': 1, 'silverdown-key': 1, dandelion: 3, mooncake: 4, 'jade-elixir': 2 },
    gear: { ...T2, ...T3 }, equip: true, buttons: 600, memories: [...MEM1, 'mem-traveller'], chapter: 2,
    quest: 'Go down the drowned stair. Find Tansy in the Drowned Halls.', done: (s) => !!s.flags.g_ch2_done },
];
