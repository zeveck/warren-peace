// Wheatsheaf (the cornfield warren to the west), its warren, and Wheatsheaf's Underway.
import { flag, hasItem } from '../../state.js';
import { grid, trimWalls, LEDGE } from './build.js';
import { G } from '../../core.js';

const freed = () => flag('g_freed_wheatsheaf');

// ---------------- c3-wheatsheaf: the cornfields
function wheatsheafTiles() {
  const g = grid(30, 30, 'v');
  // grass margins and the warren yard
  g.rect(0, 0, 29, 1, '.'); g.rect(0, 0, 1, 29, '.');
  g.blob(9, 9, 5, '.'); g.rect(5, 4, 14, 13, '.');
  g.scatter(',', 14, 7, ['.'], [4, 3, 15, 14]);
  // the pond in the south-west
  g.blob(5, 23, 2, '~'); g.set(7, 24, '~'); g.blob(5, 23, 4, '.', null, ['v']);
  // paths: from the east gate to the yard, and a farm track south to the hay cart
  g.line([[29, 15], [20, 15], [20, 11], [13, 11]], '_');
  g.line([[20, 15], [20, 21], [17, 21]], '_');
  g.line([[13, 11], [11, 11], [11, 9]], '_');
  // a field-edge of grass along the east gate and some stubble lanes in the corn
  g.rect(25, 13, 29, 17, '.'); g.line([[25, 15], [29, 15]], '_');
  g.line([[2, 16], [16, 16]], '.'); g.line([[24, 3], [24, 12]], '.');
  g.scatter(',', 6, 19, ['.'], [0, 14, 29, 29]);
  // a rise behind the warren (back edge): gentle heights
  g.rect(2, 2, 16, 3, null, 1); g.rect(2, 2, 3, 12, null, 1); g.rect(2, 2, 4, 3, null, 2);
  g.set(1, 1, null, 1);
  return g.out();
}
const WS = wheatsheafTiles();

export const wheatsheafMaps = {
  'c3-wheatsheaf': {
    name: 'Wheatsheaf', world: 'corn', area: 'wheatsheaf', battle: 'downs',
    music: () => 'm-wheatsheaf',
    get ambience() { return freed() ? [['wind', 0.3]] : [['hum', 0.45], ['wind', 0.2]]; },
    get tint() { return freed() ? null : 'rgba(70,80,120,0.14)'; },
    tiles: WS.tiles, heights: WS.heights,
    entries: { east: [28, 15, 'nw'], warren: [10, 9, 'se'], start: [27, 15, 'nw'] },
    props: [
      ['prop-warren-entrance', 8, 6, 2, 2],
      { id: 'prop-bell-post', x: 12, y: 7, cond: () => flag('c3_bellHung') },
      ['prop-hay-cart', 18, 22, 2, 1],
      ['prop-corn-stook', 15, 18], ['prop-corn-stook', 23, 19], ['prop-corn-stook', 26, 8], ['prop-corn-stook', 6, 18],
      ['prop-corn-stook', 17, 4], ['prop-corn-stook', 22, 25], ['prop-corn-stook', 11, 25], ['prop-corn-stook', 27, 22],
      ['prop-fence', 5, 4], ['prop-fence', 6, 4], ['prop-fence', 14, 4], ['prop-fence', 15, 6], ['prop-fence', 4, 13],
      ['prop-signpost', 26, 14], ['prop-hawthorn', 3, 9], ['prop-hawthorn', 27, 3], ['prop-gorse', 13, 3], ['prop-dandelions', 7, 12],
      ['prop-reeds', 8, 22], ['prop-reeds', 3, 25],
    ],
    npcs: [
      // Hum-taken Wheatsheaf rabbits sitting in the corn (woken when the bell rings)
      { id: 'c3-ws-1', sprite: 'rabbit-doe', fur: 'ginger', x: 16, y: 13, facing: 'sw', talk: 'c3.ws.rabbit1', get hum() { return !freed(); } },
      { id: 'c3-ws-2', sprite: 'rabbit-buck', fur: 'ginger', x: 23, y: 10, facing: 'sw', talk: 'c3.ws.rabbit2', get hum() { return !freed(); } },
      { id: 'c3-ws-3', sprite: 'rabbit-kit', fur: 'sandy', x: 9, y: 17, facing: 'se', talk: 'c3.ws.rabbit3', get hum() { return !freed(); } },
      { id: 'barley', x: 12, y: 8, facing: 'sw', talk: 'c3.barley.surface', cond: () => flag('c3_barleyWoken') },
      // after the bell: Wheatsheaf comes back to itself
      { id: 'c3-ws-4', sprite: 'rabbit-doe', fur: 'cream', x: 11, y: 13, facing: 'ne', talk: 'c3.ws.rabbit4', cond: freed },
      { id: 'c3-ws-5', sprite: 'rabbit-buck', fur: 'sandy', x: 20, y: 18, facing: 'se', talk: 'c3.ws.rabbit5', cond: freed },
    ],
    enemies: [
      { id: 'c3-wsh-1', type: 'raider', sprite: 'raider', hum: true, x: 22, y: 13, loop: [[22, 13], [22, 17], [18, 17], [18, 13]], encounter: 'c3.hum-1', cond: () => !freed() },
      { id: 'c3-wsh-2', type: 'hum-digger', sprite: 'hum-digger', hum: true, x: 15, y: 20, loop: [[15, 20], [11, 20], [11, 23], [15, 23]], encounter: 'c3.hum-3', cond: () => !freed() },
      { id: 'c3-wsh-3', type: 'hum-lookout', sprite: 'hum-lookout', hum: true, x: 17, y: 9, loop: [[17, 9], [17, 6], [21, 6], [21, 9]], encounter: 'c3.hum-2', cond: () => !freed() },
    ],
    doors: [
      { x: 29, y: 15, to: 'c0-downs', entry: 'west' },
      { x: 9, y: 8, to: 'c3-wheatsheaf-warren', entry: 'mouth' }, { x: 10, y: 7, to: 'c3-wheatsheaf-warren', entry: 'mouth' },
    ],
    triggers: [
      { x: 19, y: 23, w: 2, h: 2, run: 'c3.bell.find', cond: () => flag('c3_pipSearching') && !hasItem('barleys-bell') && !flag('c3_bellHung') },
      { x: 26, y: 14, use: true, run: 'c3.ws.sign' },
    ],
    chests: [
      { id: 'c3-ws-c1', x: 4, y: 26, give: { buttons: 120, dandelion: 2 } },
      { id: 'c3-ws-c2', x: 27, y: 4, give: { 'carrot-cake': 1, buttons: 80 } },
    ],
    onEnter: 'c3.wheatsheaf.enter',
  },

  // ---------------- c3-wheatsheaf-warren: the tunnels, Barley's hall, the deep door
  'c3-wheatsheaf-warren': (() => {
    const g = grid(24, 24, '#');
    g.rect(10, 0, 12, 6, 'e');            // the mouth tunnel down from the yard
    g.rect(3, 3, 9, 8, 'f'); g.line([[9, 5], [10, 5]], 'e');                 // the granary
    g.rect(15, 3, 21, 8, 'm'); g.line([[12, 5], [15, 5]], 'e');              // the empty nursery
    g.rect(10, 6, 12, 10, 'e');            // the passage to the hall
    g.rect(6, 11, 17, 19, 'f'); g.rect(8, 12, 15, 18, 'r');                  // Barley's hall
    g.line([[17, 17], [20, 17], [20, 21]], 'e', 2);                         // the deep passage
    g.rect(19, 20, 22, 22, 'e');
    trimWalls(g);
    const o = g.out();
    return {
      name: 'Wheatsheaf Warren', world: 'warren', area: 'wheatsheaf', battle: 'warren', dark: 0.18,
      music: () => 'm-wheatsheaf',
      get ambience() { return freed() ? [['hearth', 0.25]] : [['hum', 0.6]]; },
      get tint() { return freed() ? null : 'rgba(60,70,120,0.12)'; },
      tiles: o.tiles, heights: o.heights, legend: LEDGE,
      entries: { mouth: [11, 1, 'se'], deep: [20, 20, 'nw'], hall: [11, 11, 'se'] },
      props: [
        ['prop-cellar-baskets', 3, 3], ['prop-cellar-baskets', 4, 3], ['prop-cellar-baskets', 3, 4], ['prop-corn-stook', 9, 3], ['prop-lantern-mushroom', 6, 8],
        ['prop-nursery-nest', 16, 4], ['prop-nursery-nest', 19, 4], ['prop-nursery-nest', 18, 7], ['prop-lantern-mushroom', 21, 8],
        ['prop-root-pillar', 6, 11], ['prop-root-pillar', 17, 11], ['prop-root-pillar', 6, 19], ['prop-storyteller-seat', 12, 12],
        ['prop-corn-stook', 8, 12], ['prop-corn-stook', 15, 12], ['prop-lantern-mushroom', 10, 19], ['prop-lantern-mushroom', 15, 19],
        ['prop-rest-stone', 10, 9],
        ['prop-sealed-door', 22, 21],
      ],
      npcs: [
        { id: 'barley', x: 12, y: 14, facing: 'sw', hum: true, talk: 'c3.barley.boss', cond: () => !flag('c3_barleyWoken') },
        { id: 'c3-wsw-1', sprite: 'rabbit-kit', fur: 'ginger', x: 18, y: 6, facing: 'sw', talk: 'c3.ws.nursery', get hum() { return !freed(); } },
        { id: 'c3-wsw-2', sprite: 'rabbit-doe', fur: 'ginger', x: 5, y: 6, facing: 'se', talk: 'c3.ws.granary', cond: freed },
      ],
      enemies: [
        { id: 'c3-wsh-4', type: 'raider', sprite: 'raider', hum: true, x: 7, y: 5, loop: [[7, 5], [4, 5], [4, 7], [7, 7]], encounter: 'c3.hum-4', cond: () => !freed() },
      ],
      doors: [
        { x: 11, y: 0, to: 'c3-wheatsheaf', entry: 'warren' },
        { x: 22, y: 22, to: 'c3-underway', entry: 'stone', locked: () => !hasItem('wheatsheaf-key'), lockedRun: 'c3.deepdoor.locked' },
      ],
      triggers: [
        { x: 10, y: 9, use: true, run: 'c3.rest' },
        { x: 21, y: 21, use: true, run: 'c3.deepdoor.look', cond: () => !hasItem('wheatsheaf-key') },
      ],
      chests: [{ id: 'c3-wsw-c1', x: 21, y: 5, give: { buttons: 150, 'pluck-berry': 2 } }],
      onEnter: 'c3.wswarren.enter',
    };
  })(),

  // ---------------- c3-underway: Wheatsheaf's Underway (the dust cyclone; the stair down)
  'c3-underway': (() => {
    const g = grid(21, 21, '%');
    g.blob(10, 10, 8, 'a'); g.blob(10, 10, 5, 'f', null, ['a']);
    g.blob(10, 9, 2, 'z');                  // the dusty floor under the whirl
    g.line([[3, 4], [6, 6]], 'a', 2); g.rect(1, 2, 4, 5, 'a');          // the tunnel up to Wheatsheaf
    g.rect(15, 3, 17, 6, 'o');              // the carved landing of the stair
    g.rect(3, 6, 4, 7, 'a');
    trimWalls(g, '%');
    const o = g.out();
    return {
      name: 'Wheatsheaf\'s Underway', world: 'depths', area: 'c3-underway', battle: 'depths', dark: 0.4,
      music: 'm-depths', ambience: [['wind', 0.35], ['drone-bed', 0.2]],
      tiles: o.tiles, heights: o.heights, legend: LEDGE,
      entries: { stone: [11, 15, 'ne'], door: [3, 3, 'se'], stair: [15, 7, 'sw'], cyclone: [10, 12, 'sw'] },
      props: [
        ['prop-rest-stone', 12, 16], ['prop-eye-stair', 15, 3, 2, 2], ['prop-carved-pillar', 17, 7], ['prop-carved-pillar', 6, 15],
        ['prop-stone-face', 4, 12], ['prop-glow-crystal', 15, 14], ['prop-glow-crystal', 5, 5],
      ],
      doors: [
        { x: 1, y: 2, to: 'c3-wheatsheaf-warren', entry: 'deep' },
        { x: 16, y: 5, to: 'c3-stair', entry: 'top', locked: () => !flag('g_c3_oz_done'), lockedRun: 'c3.stair.locked' },
      ],
      triggers: [
        { x: 12, y: 16, use: true, run: 'underway.stone' },
        { x: 9, y: 8, w: 3, h: 3, run: 'c3.cyclone' },
      ],
      onEnter: 'c3.underway.enter',
      // the dust cyclone, drawn in code: a turning funnel of motes over the sandy floor
      drawOver(ex, c, ox, oy) {
        const t = G.time;
        const cx = (10 - 9) * 16 + ox, cy = (10 + 9) * 8 + oy + 8;
        for (let i = 0; i < 70; i++) {
          const k = i / 70, a = t * (2.2 + k) + i * 2.4, r = 6 + k * 26, yy = cy - k * 70;
          const x = Math.round(cx + Math.cos(a) * r), y = Math.round(yy + Math.sin(a) * r * 0.35);
          c.fillStyle = i % 3 ? 'rgba(220,200,150,0.55)' : 'rgba(250,235,190,0.8)';
          c.fillRect(x, y, i % 4 === 0 ? 2 : 1, 1);
        }
      },
    };
  })(),
};
