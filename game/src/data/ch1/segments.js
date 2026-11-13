// Chapter 1's play-test segments: the Depths, the River Bank, Toad Hall, RTS 1 and the Great Burrow.
import { G } from '../../core.js';

const PRO = { c0_attack: true, c0_guided: true, g_ch0_done: true, c0_door_open: true };
const DEPTHS = { ...PRO, c1_card: true, c1_in_depths: true, g_underway_c1: true, c1_underway_seen: true };
const RIVER = {
  ...DEPTHS, c1_rb_seen: true, c1_metRatty: true, c1_log1: true, c1_log2: true, c1_log3: true, c1_scent_on: true, c1_scent: 5,
  c1_mole_found: true, c1_mem_river: true, c1_hog_any: true, c1_hogs_home: true, c1_otter_met: true,
  'trig_c1-wildwood_scent': true, 'trig_c1-wildwood_dusk': true,
};
const ALL = {
  ...RIVER, c1_road_seen: true, c1_toad_met: true, c1_toad_fled: true, c1_toad_unmasked: true, c1_chief_beaten: true, c1_th_in: true,
  g_c1_riverbank_done: true, c1_home_brief: true, g_c1_nursery_cleared: true, g_c1_wonder_done: true,
  'g_recruit_white-rabbit': true, g_squad_heralds: true, c1_keyhole_seen: true,
};
const T1 = { 'sling+1': 1, 'waistcoat+1': 2, 'courage-ribbon+1': 1 };
// what the main path affords at Toad Hall (design/progress/calibration.md): the T1 set + Otter's T2 tools and coats for two
const T2A = { ...T1, 'sling+2': 1, 'digging-claw+2': 1, 'waistcoat+2': 2 };
const T2 = { 'sling+2': 1, 'digging-claw+2': 1, 'quill+2': 1, 'waistcoat+2': 2, 'oilskin+2': 1, 'courage-ribbon+2': 1, 'motor-goggles+2': 1 };
const p = (lv, ids) => [['bramble', lv], ...ids.map(id => [id, lv])];

export const segments = [
  { id: 'c1-depths', name: 'Thimblebank Depths', map: 'c1-depths', x: 4, y: 2, facing: 'sw', enter: true,
    party: p(3, ['burdock']), active: ['burdock'], flags: { ...PRO }, items: { 'old-key': 1, 'clover-bunch': 2 }, buttons: 60,
    quest: 'Follow the old tunnels down. Find friends.', done: (s) => !!s.flags.g_underway_c1 },
  { id: 'c1-riverbank', name: 'The River Bank', map: 'c1-underway', x: 2, y: 8, facing: 'se',
    party: p(5, ['burdock']), active: ['burdock'], flags: { ...DEPTHS }, items: { 'old-key': 1, 'clover-bunch': 3, dandelion: 1 }, gear: T1, equip: true, buttons: 150,
    quest: 'Go through the river door. Find friends.', done: (s) => !!(s.flags.g_recruit_ratty && s.flags.g_recruit_mole && s.flags.g_recruit_badger) },
  { id: 'c1-toadhall', name: 'Toad Hall', map: 'c1-riverbank', x: 1, y: 6, facing: 'se',
    party: p(7, ['burdock', 'ratty', 'mole', 'badger']), active: ['badger', 'mole'], flags: { ...RIVER }, items: { 'old-key': 1, 'clover-bunch': 3, dandelion: 2, 'carrot-cake': 1 },
    gear: T2A, equip: true, buttons: 250, memories: ['mem-river'], quest: 'Toad is in trouble on the road to Toad Hall, west of the River Bank.',
    done: (s) => !!s.flags.g_c1_riverbank_done },
  { id: 'c1-rts1', name: 'The Battle of Sorrel Down', map: 'c0-downs', x: 30, y: 13, facing: 'ne',
    party: p(12, ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar']), active: ['badger', 'mole'], flags: { ...ALL },
    items: { 'old-key': 1, 'chalk-pebble': 1, dandelion: 2 }, gear: T2, equip: true, buttons: 400, memories: ['mem-river', 'mem-pebble', 'mem-teaparty'],
    quest: 'Gather the army at the Lookout Stone: take back Sorrel Down.', done: (s) => !!s.flags['g_c1-rts1_won'] },
  { id: 'c1-greatburrow', name: 'The Great Burrow', map: 'c0-warren', x: 13, y: 7, facing: 'sw',
    party: p(12, ['burdock', 'mole', 'ratty', 'badger', 'toad', 'cheshire-cat', 'caterpillar']), active: ['badger', 'mole'], flags: { ...ALL, 'g_c1-rts1_won': true, c1_rts1_intro: true },
    items: { 'old-key': 1, 'chalk-pebble': 1, dandelion: 2 }, gear: T2, equip: true, buttons: 400, memories: ['mem-river', 'mem-pebble', 'mem-teaparty'],
    quest: 'Wake the raiders in the Great Burrow.', script: 'c1-rts1.won', done: (s) => !!s.flags.g_freed_thimblebank },
];

export const segScripts = {
  // the Lookout Stone is ch0's; the segment launches the battle the same way it does
  'c1.seg.rts1': async (s) => {
    const intro = G.data.scripts['c1-rts1.intro']; if (intro) await intro(s);
    const r = await s.army('c1-rts1');
    if (r === 'win') s.set('g_c1-rts1_won');
  },
};
