// The Shallows, the first layer of the eerie depths: the eye-stair landing with its carvings and the whisper, and
// the room that is bigger inside than its door (Ninefold, the Whispering Choir, the mural).
import { G, toast } from '../../core.js';
import { flag } from '../../state.js';
import { audio } from '../../engine/audio.js';
import { mk, box, dot, line, speckle, bake, glow, chest } from './util.js';

const base = { world: 'depths', music: 'm-depths', ambience: [['drone-bed', 0.4], ['hum', 0.12]], battle: 'shallows', sky: '#07080e' };

// A whisper says Bramble's name if he stands still for five seconds (first time: a short scene).
function whisperHook(ex, dt) {
  if (ex.busy || ex.b.hop) return;
  ex._wcool = Math.max(0, (ex._wcool || 0) - dt);
  if (ex.standStill > 5 && ex._wcool <= 0) {
    ex._wcool = 14; ex.standStill = 0;
    if (!flag('c1w_whisper')) { ex.queueScript('c1w.shallows.whisper'); return; }
    audio.voice('vo-whisper'); toast('"...Bramble..."', 2.4);
  }
}

function landing() {
  const m = mk(22, 20, 'o', 0);
  box(m, 0, 0, 21, 0, '%'); box(m, 0, 0, 0, 19, '%');
  box(m, 1, 1, 5, 4, 'f');
  speckle(m, 'o', 'f', 6, 2);
  line(m, [[4, 4], [4, 9], [10, 9], [10, 14], [16, 14], [16, 3], [19, 3], [19, 2]], 'a');
  box(m, 13, 16, 21, 19, 'a'); box(m, 17, 17, 21, 19, '%'); dot(m, 17, 17, 'a');
  box(m, 6, 1, 9, 5, '%'); box(m, 1, 12, 4, 15, '%');
  const [c1, c1p] = chest('c1w-shallows', 'niche', 1, 17, { buttons: 45, 'courage-biscuit': 2 });
  return {
    ...base, name: 'The Shallows', area: 'shallows', dark: 0.45, ...bake(m),
    entries: { top: [4, 4, 'se'], deep: [19, 3, 'sw'] },
    props: [
      { id: 'prop-eye-stair', x: 2, y: 1, w: 2, h: 2 },
      { id: 'prop-carved-pillar', x: 7, y: 7 }, { id: 'prop-carved-pillar', x: 13, y: 7 }, { id: 'prop-carved-pillar', x: 7, y: 12 }, { id: 'prop-carved-pillar', x: 13, y: 12 },
      { id: 'prop-stone-face', x: 11, y: 1 }, { id: 'prop-stone-face', x: 14, y: 1 }, { id: 'prop-stone-face', x: 1, y: 7 }, { id: 'prop-stone-face', x: 1, y: 10 },
      { id: 'prop-carved-rock', x: 10, y: 4 }, { id: 'prop-carved-rock', x: 5, y: 16 }, { id: 'prop-carved-rock', x: 18, y: 10 },
      { id: 'prop-glow-crystal', x: 20, y: 6 }, { id: 'prop-glow-crystal', x: 3, y: 18 }, { id: 'prop-glow-crystal', x: 15, y: 18 },
      { id: 'prop-door-eye', x: 19, y: 1 }, { id: 'prop-bones', x: 9, y: 17, w: 2, h: 1 }, c1p,
    ],
    chests: [c1],
    enemies: [
      { id: 'sh-whispers', type: 'whisper', x: 9, y: 9, loop: [[8, 9], [11, 9], [11, 10], [8, 10]], encounter: 'c1w.whispers-1', facing: 'sw' },
      { id: 'sh-carving', type: 'moving-carving', sprite: 'moving-carving', x: 16, y: 11, loop: [[16, 10], [16, 13], [17, 13], [17, 10]], encounter: 'c1w.carving-1', facing: 'nw' },
      { id: 'sh-whispers-2', type: 'whisper', x: 4, y: 17, loop: [[4, 17], [7, 17], [7, 18], [4, 18]], encounter: 'c1w.whispers-1', facing: 'ne' },
    ],
    doors: [
      { x: 2, y: 3, run: 'c1w.shallows.up' },
      { x: 19, y: 2, to: 'c1w-deep', entry: 'door' },
    ],
    triggers: [
      { x: 2, y: 1, w: 2, h: 2, use: true, run: 'c1w.shallows.up' },
      { x: 19, y: 1, use: true, run: async s => s.warp('c1w-deep', 'door') },
      { x: 1, y: 7, use: true, run: 'c1w.shallows.face' }, { x: 1, y: 10, use: true, run: 'c1w.shallows.face' },
      { x: 11, y: 1, use: true, run: 'c1w.shallows.face' }, { x: 14, y: 1, use: true, run: 'c1w.shallows.face' },
      { x: 7, y: 7, use: true, run: 'c1w.shallows.pillar' }, { x: 13, y: 7, use: true, run: 'c1w.shallows.pillar' },
      { x: 7, y: 12, use: true, run: 'c1w.shallows.pillar' }, { x: 13, y: 12, use: true, run: 'c1w.shallows.pillar' },
    ],
    onEnter: 'c1w.shallows.enter',
    update: whisperHook,
  };
}

// The room bigger inside than its door.
export const MOUTHS = [[26, 1], [28, 1], [30, 1]];
function deep() {
  const m = mk(32, 26, 'o', 0);
  box(m, 0, 0, 31, 0, '%'); box(m, 0, 0, 0, 25, '%');
  speckle(m, 'o', 'f', 5, 9);
  box(m, 24, 1, 31, 4, 'a');                                     // the floor before the mouths
  line(m, [[2, 2], [8, 2], [8, 10], [18, 10], [18, 4], [27, 4]], 'a');
  box(m, 1, 20, 6, 24, 'f');                                     // Ninefold's corner
  box(m, 10, 13, 13, 16, '%'); box(m, 20, 14, 23, 17, '%'); box(m, 12, 3, 14, 6, '%');
  box(m, 26, 18, 31, 25, 'a');
  const [c1, c1p] = chest('c1w-deep', 'far', 30, 24, { buttons: 50, 'pluck-berry': 2 });
  return {
    ...base, name: 'The Room Bigger Inside', area: 'shallows', dark: 0.55, ...bake(m),
    entries: { door: [2, 2, 'se'], choir: [27, 5, 'ne'], corner: [6, 21, 'sw'] },
    props: [
      { id: 'prop-door-eye', x: 1, y: 1 },
      ...MOUTHS.map(([x, y]) => ({ id: 'prop-stone-mouth', x, y, cond: () => !flag('c1w_choir_won') })),
      { id: 'prop-mural-wall', x: 27, y: 1, w: 3, h: 1, whole: true, cond: () => flag('c1w_choir_won') },
      { id: 'prop-carved-pillar', x: 5, y: 7 }, { id: 'prop-carved-pillar', x: 16, y: 7 }, { id: 'prop-carved-pillar', x: 24, y: 9 },
      { id: 'prop-carved-pillar', x: 5, y: 15 }, { id: 'prop-carved-pillar', x: 17, y: 20 }, { id: 'prop-carved-pillar', x: 27, y: 14 },
      { id: 'prop-stone-face', x: 1, y: 9 }, { id: 'prop-stone-face', x: 1, y: 13 }, { id: 'prop-stone-face', x: 20, y: 1 },
      { id: 'prop-glow-crystal', x: 1, y: 21 }, { id: 'prop-glow-crystal', x: 3, y: 24 }, { id: 'prop-glow-crystal', x: 2, y: 19 },
      { id: 'prop-moss-bed', x: 2, y: 22, w: 2, h: 1 },
      { id: 'prop-rest-stone', x: 22, y: 5 },
      { id: 'prop-carved-rock', x: 9, y: 20 }, { id: 'prop-carved-rock', x: 30, y: 9 }, { id: 'prop-star-rock', x: 15, y: 23 }, c1p,
    ],
    chests: [c1],
    npcs: [
      { id: 'ninefold', x: 4, y: 21, facing: 'se', talk: 'c1w.ninefold', cond: () => !flag('g_recruit_ninefold') },
    ],
    enemies: [
      { id: 'dp-whispers', type: 'whisper', x: 9, y: 6, loop: [[9, 5], [11, 5], [11, 8], [9, 8]], encounter: 'c1w.whispers-2', facing: 'sw' },
      { id: 'dp-carvings', type: 'moving-carving', x: 19, y: 11, loop: [[19, 11], [22, 11], [22, 12], [19, 12]], encounter: 'c1w.carving-2', facing: 'sw' },
      { id: 'dp-whispers-2', type: 'whisper', x: 7, y: 18, loop: [[6, 17], [9, 17], [9, 18], [6, 18]], encounter: 'c1w.whispers-1', facing: 'ne' },
      { id: 'dp-carving-3', type: 'moving-carving', x: 28, y: 20, loop: [[27, 19], [30, 19], [30, 21], [27, 21]], encounter: 'c1w.carving-1', facing: 'nw' },
    ],
    doors: [{ x: 1, y: 1, to: 'c1w-shallows', entry: 'deep' }],
    triggers: [
      { x: 1, y: 1, use: true, run: async s => s.warp('c1w-shallows', 'deep') },
      { x: 22, y: 5, use: true, run: async s => s.rest() },
      { id: 'mouths', x: 24, y: 3, w: 8, h: 1, cond: () => !flag('c1w_choir_won'), run: 'c1w.choir' },
      ...MOUTHS.map(([x, y]) => ({ x, y, use: true, cond: () => !flag('c1w_choir_won'), run: 'c1w.choir' })),
      { x: 27, y: 1, w: 3, h: 1, use: true, cond: () => flag('c1w_choir_won'), run: 'c1w.mural' },
    ],
    onEnter: 'c1w.deep.enter',
    update: whisperHook,
    drawGround(ex, c, ox, oy) { if (!flag('c1w_choir_won')) for (const [x] of MOUTHS) glow(ex, c, ox, oy, x, 2, '150,200,230', 0.25); },
  };
}

export default { 'c1w-shallows': landing(), 'c1w-deep': deep() };
