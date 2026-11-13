// ch1w play-test segments: Wonderland a (Hall of Doors to the White Rabbit), Wonderland b (the Mushroom Wood to the
// Queen's croquet and trial), and the Shallows (Ninefold and the Whispering Choir).
const PRO = { c0_attack: true, c0_guided: true, g_ch0_done: true, c0_door_open: true };
const DEPTHS = { ...PRO, c1_card: true, c1_in_depths: true, g_underway_c1: true, c1_underway_seen: true, c1_keyhole_seen: true };
// the River Bank done first (the usual order; Wonderland can also come first)
const RIVER = {
  ...DEPTHS, c1_rb_seen: true, c1_metRatty: true, c1_mole_found: true, c1_mem_river: true, c1_hogs_home: true,
  c1_road_seen: true, c1_toad_met: true, c1_chief_beaten: true, g_c1_riverbank_done: true, c1_home_brief: true, g_c1_nursery_cleared: true,
};
const WA = { ...RIVER, c1w_fell: true, c1w_key: true, c1w_tears: true, c1w_through: true, c1w_pool_seen: true, c1w_caucus_on: true,
  c1w_race0: true, c1w_race1: true, c1w_race2: true, c1w_caucus_done: true, c1w_lane_seen: true, c1w_wr_asked: true, c1w_house_seen: true,
  c1w_gloves: true, c1w_cakes_in: true, c1w_house_done: true, 'g_recruit_white-rabbit': true, g_squad_heralds: true };
const WB = { ...WA, c1w_wood_seen: true, c1w_cater_done: true, c1w_pigeon: true, c1w_duchess_knock: true, c1w_kitchen_seen: true, c1w_baby: true, c1w_pig: true,
  c1w_cat_joined: true, c1w_tea_seen: true, c1w_riddle: true, c1w_treacle: true, c1w_tea_done: true, c1w_garden: true, c1w_croquet_won: true,
  c1w_trial_done: true, g_c1_wonder_done: true, 'g_recruit_caterpillar': true, 'g_recruit_cheshire-cat': true, g_squad_flamingos: true, 'g_squad_the-grin': true };
// Wonderland a starts with Toad Hall's gear (T1 + two T2 tools and coats); the full T2 set from the Caucus Store after
const T2A = { 'sling+1': 1, 'waistcoat+1': 2, 'courage-ribbon+1': 1, 'sling+2': 1, 'digging-claw+2': 1, 'waistcoat+2': 2 };
const T2 = { 'sling+2': 1, 'digging-claw+2': 1, 'quill+2': 1, 'waistcoat+2': 2, 'oilskin+2': 1, 'courage-ribbon+2': 1, 'motor-goggles+2': 1 };
const RB = ['burdock', 'mole', 'ratty', 'badger', 'toad'];
const p = (lv, ids) => [['bramble', lv], ...ids.map(id => [id, lv])];

export const segments = [
  { id: 'c1w-wonder-a', chapter: 1, name: 'Wonderland: the Hall of Doors to the White Rabbit', map: 'c1w-hall', x: 6, y: 9, facing: 'se', enter: true,
    party: p(8, RB), active: ['badger', 'mole'], flags: { ...RIVER }, items: { 'old-key': 1, 'clover-bunch': 3, dandelion: 2, 'carrot-cake': 1 },
    gear: T2A, equip: true, buttons: 250, memories: ['mem-river'], quest: 'Get the little golden key from the glass table.',
    done: (s) => !!s.flags['g_recruit_white-rabbit'] },
  { id: 'c1w-wonder-b', chapter: 1, name: 'Wonderland: the Mushroom Wood to the Queen\'s croquet', map: 'c1w-wood', x: 1, y: 3, facing: 'se', enter: true,
    party: p(9, RB), active: ['badger', 'mole'], flags: { ...WA }, items: { 'old-key': 1, 'clover-bunch': 3, dandelion: 2, 'carrot-cake': 1, comfits: 2 },
    gear: T2, equip: true, buttons: 250, memories: ['mem-river'], quest: 'Find the Caterpillar in the Mushroom Wood.',
    done: (s) => !!s.flags.g_c1_wonder_done },
  { id: 'c1w-shallows', chapter: 1, name: 'The Shallows', map: 'c1w-shallows', x: 4, y: 4, facing: 'se', enter: true,
    party: p(11, [...RB, 'caterpillar', 'cheshire-cat']), active: ['badger', 'mole'], flags: { ...WB },
    items: { 'old-key': 1, 'clover-bunch': 3, dandelion: 2, 'carrot-cake': 1, comfits: 2, 'mushroom-halves': 1 },
    gear: T2, equip: true, buttons: 350, memories: ['mem-river', 'mem-teaparty'], quest: 'Go deeper: through the eye door, into the room beyond.',
    done: (s) => !!s.flags.g_c1_shallows_done },
];
