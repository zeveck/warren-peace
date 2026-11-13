// Thimblebank Depths (the rooty older tunnels under the sealed door) and the Underway (the round cavern of doors).
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { toScreen } from '../../engine/iso.js';
import { grid, rect, put, disk, sprinkle, done, chest, rim } from './build.js';

// ---------------- Thimblebank Depths
function depths() {
  const g = grid(24, 38, '#', 1);
  rect(g, 2, 1, 7, 5, 'o', 2); put(g, 4, 0, 'o', 2);                 // the landing below the old door
  rect(g, 3, 6, 4, 8, 'r', 2); rect(g, 3, 9, 4, 11, 'r', 1);          // down the first root tunnel
  rect(g, 1, 12, 8, 17, 'r', 1);                                      // room B: the worm's hollow
  rect(g, 9, 14, 10, 15, 'r', 1); rect(g, 11, 12, 16, 17, 'm', 1);    // room C: a mossy side burrow
  rect(g, 4, 18, 5, 19, 'r', 1); rect(g, 4, 20, 5, 21, 'r', 0);
  rect(g, 1, 22, 13, 29, 'r', 0); rect(g, 1, 22, 4, 24, 'm', 1);      // room D: the great root cavern (a mossy ledge)
  put(g, 8, 28, '~', 0); put(g, 9, 28, '~', 0); put(g, 9, 29, '~', 0); put(g, 10, 29, '~', 0);   // a still little pool
  rect(g, 14, 25, 16, 26, 'r', 0);
  rect(g, 17, 19, 22, 31, 'm', 0);                                    // room E: moss and old stones
  rect(g, 19, 32, 20, 36, 'o', 0); put(g, 20, 37, 'o', 0);            // carved steps down to the Underway
  sprinkle(g, 'r', 'm', 6, 2); sprinkle(g, 'm', 'r', 7, 3);
  rim(g);
  const t = done(g);
  const c1 = chest('c1-depths', 'd1', 15, 13, { buttons: 10, 'clover-bunch': 2 });
  const c2 = chest('c1-depths', 'd2', 22, 20, { buttons: 15, 'pluck-berry': 1, dandelion: 1 });
  return {
    name: 'Thimblebank Depths', world: 'warren', area: 'depths', music: 'm-depths', ambience: [['drone-bed', 0.25]], battle: 'depths', dark: 0.42,
    ...t,
    entries: { top: [4, 2, 'sw'], bottom: [20, 35, 'ne'] },
    props: [
      { id: 'prop-sealed-door', x: 4, y: 0 },
      ['prop-root-pillar', 2, 1], ['prop-root-pillar', 7, 1], ['prop-lantern-mushroom', 6, 4],
      ['prop-rubble', 2, 5], ['prop-lantern-mushroom', 1, 12], ['prop-root-pillar', 8, 12], ['prop-rubble', 1, 17],
      ['prop-lantern-mushroom', 16, 12], ['prop-root-pillar', 11, 17], ['prop-moss-bed', 12, 12, 1, 2],
      { id: 'prop-giant-root', x: 6, y: 22, w: 2, h: 1 }, ['prop-root-pillar', 12, 22], ['prop-root-pillar', 1, 29], ['prop-lantern-mushroom', 13, 29],
      ['prop-rubble', 11, 25], ['prop-lantern-mushroom', 1, 22], ['prop-root-pillar', 4, 26],
      ['prop-root-pillar', 17, 19], ['prop-lantern-mushroom', 17, 31], ['prop-carved-rock', 22, 25], ['prop-rubble', 18, 27], ['prop-lantern-mushroom', 22, 31],
      ['prop-carved-pillar', 19, 36], ['prop-carved-pillar', 21, 36], ['prop-rest-stone', 21, 28],
      ...c1.props, ...c2.props,
    ],
    chests: [c1.chest, c2.chest],
    doors: [
      { x: 4, y: 0, to: 'c0-warren', entry: 'deep', locked: () => !G.data.maps['c0-warren'], lockedRun: async s => s.say(null, 'The old door is shut fast from the other side. (Thimblebank Warren isn\'t here yet.)') },
      { x: 20, y: 37, to: 'c1-underway', entry: 'depths' },
    ],
    triggers: [
      { id: 'tip-guard', x: 3, y: 9, w: 2, h: 1, once: true, run: 'c1.depths.tip' },
      { id: 'roots', x: 1, y: 22, w: 13, h: 1, once: true, run: 'c1.depths.roots' },
      { id: 'carving', x: 17, y: 30, w: 6, h: 2, once: true, run: 'c1.depths.carving' },
      { x: 21, y: 28, use: true, run: 'c1.rest' },
    ],
    enemies: [
      { id: 'dw1', type: 'dazed-earthworm', x: 5, y: 15, loop: [[5, 15], [7, 15], [7, 16], [5, 16]], encounter: 'c1.d-worm', facing: 'nw' },
      { id: 'dw2', type: 'dazed-earthworm', x: 13, y: 15, loop: [[12, 15], [15, 15], [15, 16], [12, 16]], encounter: 'c1.d-worms' },
      { id: 'db1', type: 'burrowing-beetle', x: 8, y: 24, loop: [[8, 24], [11, 24], [11, 27], [8, 27]], encounter: 'c1.d-beetles' },
      { id: 'dt1', type: 'root-tangler', x: 3, y: 27, loop: [[2, 27], [5, 27]], encounter: 'c1.d-tangler' },
      { id: 'db2', type: 'burrowing-beetle', x: 19, y: 23, loop: [[18, 22], [21, 22], [21, 26], [18, 26]], encounter: 'c1.d-mixed' },
      { id: 'dt2', type: 'root-tangler', x: 20, y: 33, still: true, facing: 'ne', encounter: 'c1.d-tanglers' },
    ],
    onEnter: 'c1.depths.enter',
  };
}

// ---------------- the Underway: a round cavern with three carved doors
const UW = { river: [1, 8], keyhole: [3, 3], eye: [8, 1], stone: [8, 8] };
function underway() {
  const g = grid(18, 18, ' ', 0);
  for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) {
    const d = Math.hypot(x - 8, y - 8);
    if (d <= 7.2) put(g, x, y, d <= 5.2 ? 'f' : 'o', 0);
    else if (x + y < 17) put(g, x, y, '#', 1);
  }
  disk(g, 8, 8, 1.6, 'o', 0);
  rect(g, 14, 7, 17, 9, 'f', 0); put(g, 17, 7, ' '); put(g, 17, 9, ' ');   // the passage up to the Depths
  for (const [x, y] of Object.values(UW)) put(g, x, y, 'o', 0);
  const t = done(g);
  return {
    name: 'The Underway', world: 'depths', area: 'underway', music: 'm-deep', ambience: [['drone-bed', 0.35]], battle: 'depths', dark: 0.3,
    ...t,
    entries: { stone: [9, 8, 'nw'], river: [2, 8, 'se'], keyhole: [4, 4, 'se'], stair: [8, 2, 'sw'], depths: [14, 8, 'nw'] },
    props: [
      { id: 'prop-door-river', x: UW.river[0], y: UW.river[1] },
      { id: 'prop-door-keyhole', x: UW.keyhole[0], y: UW.keyhole[1] },
      { id: 'prop-door-eye', x: UW.eye[0], y: UW.eye[1] },
      { id: 'prop-rest-stone', x: 8, y: 8 },
      ['prop-carved-pillar', 2, 5], ['prop-carved-pillar', 5, 2], ['prop-carved-pillar', 2, 11], ['prop-carved-pillar', 11, 2],
      ['prop-glow-crystal', 4, 13], ['prop-glow-crystal', 13, 4], ['prop-stone-face', 6, 1], ['prop-lantern-mushroom', 12, 12],
      ['prop-carved-pillar', 15, 6], ['prop-carved-pillar', 15, 10],
    ],
    doors: [
      { x: UW.river[0], y: UW.river[1], to: 'c1-riverbank', entry: 'underway' },
      { x: UW.keyhole[0], y: UW.keyhole[1], run: 'c1.underway.keyhole' },
      { x: UW.eye[0], y: UW.eye[1], run: 'c1.underway.eye' },
      { x: 17, y: 8, to: 'c1-depths', entry: 'bottom' },
    ],
    triggers: [
      { x: 8, y: 8, use: true, run: 'underway.stone' },
      { x: UW.river[0], y: UW.river[1], use: true, run: async s => s.warp('c1-riverbank', 'underway') },
      { x: UW.keyhole[0], y: UW.keyhole[1], use: true, run: 'c1.underway.keyhole' },
      { x: UW.eye[0], y: UW.eye[1], use: true, run: 'c1.underway.eye' },
    ],
    onEnter: 'c1.underway.enter',
    // the two carved symbols beside the eye-stair glow as the two worlds are done
    drawOver(ex, c, ox, oy) {
      const s = toScreen(UW.eye[0], UW.eye[1], ex.hAt(UW.eye[0], UW.eye[1]));
      const x = s.x + ox, y = s.y + oy;
      const glyph = (gx, gy, lit, col, kind) => {
        const a = lit ? 0.75 + 0.25 * Math.sin(G.time * 3) : 1;
        if (lit) { c.fillStyle = `rgba(${col},${0.25 * a})`; c.fillRect(gx - 7, gy - 7, 15, 15); }
        c.fillStyle = lit ? `rgba(${col},${a})` : 'rgba(70,80,100,0.9)';
        if (kind === 'wave') { for (let i = 0; i < 7; i++) c.fillRect(gx - 3 + i, gy - 2 + (i % 3 === 1 ? -1 : i % 3 === 2 ? 1 : 0), 1, 1); for (let i = 0; i < 7; i++) c.fillRect(gx - 3 + i, gy + 2 + (i % 3 === 1 ? -1 : i % 3 === 2 ? 1 : 0), 1, 1); c.fillRect(gx - 4, gy - 4, 9, 1); c.fillRect(gx - 4, gy + 4, 9, 1); }
        else { c.fillRect(gx - 1, gy - 4, 3, 3); c.fillRect(gx, gy - 1, 1, 4); c.fillRect(gx - 2, gy + 3, 5, 1); c.fillRect(gx - 4, gy - 4, 1, 9); c.fillRect(gx + 4, gy - 4, 1, 9); }
      };
      glyph(x - 22, y - 30, flag('g_c1_riverbank_done'), '120,220,230', 'wave');
      glyph(x + 22, y - 30, flag('g_c1_wonder_done'), '240,150,200', 'key');
    },
  };
}

export default { 'c1-depths': depths(), 'c1-underway': underway() };
