// The Epilogue's additions to other chapters' maps: Shale's invitation (Sorrel Down at sunset, and Sorrel Down
// for anyone who has left the feast), and Flintcomb rebuilt stage by stage (surface and the spiral's lip).
import { flag } from '../../state.js';
import { won, started, done, running, standing, escorting, has, trav } from './common.js';

const waiting = () => won() && !flag('c6_invited');
const hinting = () => waiting() && !flag('c6_hinted');   // the hint fires once ever, not on every visit
const T = (id, sprite, fur, x, y, facing, cond, extra = {}) => ({ id, sprite, fur, x, y, facing, talk: 'c6.talk', cond, ...extra });
const heapAt = { 1: [10, 22], 2: [24, 19], 3: [16, 6] };
const clockAt = { 1: [4, 1], 2: [4, 7], 3: [2, 11], 4: [1, 13], 5: [3, 23] };

export const MAP_ADDS = {
  // ---------------------------------------------------------------- the invitation
  'c5-sunset': {
    npcs: [{ id: 'c6-shale', sprite: 'rabbit-doe', fur: 'grey', x: 8, y: 10, facing: 'se', talk: 'c6.invite', cond: waiting }],
    triggers: [{ id: 'c6-hint', x: 0, y: 0, w: 34, h: 32, once: true, run: 'c6.hint', cond: hinting }],
  },
  'c0-downs': {
    // by the warren mouth (19,20), clear of the ch5 visitors (21,23 / 26,28 / 28,24 / 30,26) and the Lookout (30,10)
    npcs: [{ id: 'c6-shale', sprite: 'rabbit-doe', fur: 'grey', x: 22, y: 19, facing: 'sw', talk: 'c6.invite', cond: waiting }],
    triggers: [{ id: 'c6-hint', x: 0, y: 0, w: 40, h: 40, once: true, run: 'c6.hint', cond: hinting }],
  },
  // ---------------------------------------------------------------- Flintcomb's bowl
  'c4-flintcomb': {
    entries: { burrow: [2, 9, 'se'] },
    props: [
      // the new burrow door in the west bank, and the helpers' camp
      { id: 'prop-flint-doorway', x: 1, y: 6, w: 2, h: 2, whole: true, cond: started },
      { id: 'prop-hay-cart', x: 21, y: 15, w: 2, h: 1, cond: started },
      { id: 'prop-wash-bucket', x: 9, y: 9, cond: running },
      { id: 'prop-lantern', x: 7, y: 12, cond: started }, { id: 'prop-lantern', x: 7, y: 23, cond: started },
      // dandelion clocks on the west downs
      ...Object.entries(clockAt).map(([n, [x, y]]) => ({ id: 'prop-dandelion-clock', x, y, cond: () => started() && !flag('c6_clock' + n) })),
      // where each heap was: a sown patch the moment it's cleared (with a clock), bare chalk until then
      ...Object.entries(heapAt).map(([n, [x, y]]) => ({ id: 'prop-sprout-patch', x, y, w: 2, h: 2, ground: true, cond: () => flag('c6_sown' + n) })),
      // the last two clocks, blown over the bowl
      { id: 'prop-sprout-patch', x: 19, y: 13, w: 2, h: 2, ground: true, cond: () => flag('c6_sown') },
      { id: 'prop-sprout-patch', x: 8, y: 23, w: 2, h: 2, ground: true, cond: () => flag('c6_sown') },
      // the feast, and the bowl in flower
      { id: 'prop-feast-spread', x: 12, y: 9, w: 2, h: 2, ground: true, cond: done },
      ...[[15, 21], [23, 17], [18, 15], [10, 15], [20, 6], [14, 20]].map(([x, y]) => ({ id: 'prop-dandelions', x, y, cond: done })),
    ],
    npcs: [
      T('c6-quarry', 'captain-quarry', null, 8, 16, 'se', standing('captain-quarry'), { talk: 'c6.quarry' }),
      T('c6-rumble', 'rumble', null, 10, 18, 'sw', () => standing('rumble')() && !escorting('c6-rumble'), { talk: 'c6.rumble' }),
      T('c6-burdock', 'burdock', null, 11, 14, 'sw', () => standing('burdock')() && done(), { talk: 'c6.friend' }),
      T('c6-badger', 'badger', null, 17, 22, 'nw', standing('badger'), { talk: 'c6.friend' }),
      T('c6-mole', 'mole', null, 8, 9, 'se', () => standing('mole')() && done(), { talk: 'c6.friend' }),
      T('c6-tansy', 'tansy', null, 23, 12, 'sw', standing('tansy'), { talk: 'c6.friend' }),
      T('c6-ws', 'rabbit-buck', 'ginger', 20, 16, 'nw', started),
      T('c6-sd', 'rabbit-doe', 'silver', 24, 14, 'sw', started),
      // a kit out playing for every old room found
      T('c6-kit1', 'rabbit-kit', 'grey', 14, 17, 'se', () => flag('c6_room_nursery'), { kid: true }),
      T('c6-kit2', 'rabbit-kit', 'dark', 15, 18, 'nw', () => flag('c6_room_larder'), { kid: true }),
      T('c6-kit3', 'rabbit-kit', 'cream', 13, 19, 'ne', () => flag('c6_room_den'), { kid: true }),
      // at the feast
      T('c6-knapper', 'quarryman', 'grey', 14, 11, 'nw', done, { talk: 'c6.knapper' }),
      T('c6-gault', 'rabbit-buck', 'dark', 11, 11, 'se', done),
      T('c6-chip', 'rabbit-kit', 'dark', 11, 10, 'se', done, { kid: true }),
    ],
    doors: [{ x: 1, y: 8, to: 'c6-upburrow', entry: 'top', cond: started }, { x: 2, y: 8, to: 'c6-upburrow', entry: 'top', cond: started }],
    triggers: [
      ...Object.entries(heapAt).map(([n, [x, y]]) => ({ id: 'c6-heap' + n, x, y, w: 2, h: 1, use: true, run: 'c6.heap' + n, cond: () => started() && !flag('c6_heap' + n) })),
      ...Object.entries(heapAt).map(([n, [x, y]]) => ({ id: 'c6-patch' + n, x, y, w: 2, h: 2, use: true, here: true, run: 'c6.patch' + n, cond: () => flag('c6_heap' + n) && !flag('c6_sown' + n) })),
      ...Object.entries(clockAt).map(([n, [x, y]]) => ({ id: 'c6-clock' + n, x, y, use: true, run: 'c6.clock' + n, cond: () => started() && !flag('c6_clock' + n) })),
    ],
  },
  // ---------------------------------------------------------------- the spiral's lip
  'c4-warren': {
    props: [{ id: 'prop-thump-stone', x: 19, y: 12, cond: () => flag('c6_stone') }],
    npcs: [{ id: 'c6-gault', sprite: 'rabbit-buck', fur: 'dark', x: 22, y: 12, facing: 'sw', talk: 'c6.gault', cond: () => started() && !flag('c6_gault_done') }],
    triggers: [
      { id: 'c6-close', x: 12, y: 14, w: 1, h: 4, run: 'c6.closing', cond: () => !done() && flag('c6_heaps_done') && flag('c6_sown') && flag('c6_rooms_done') && flag('c6_gault_done') },
      { id: 'c6-stone', x: 19, y: 12, use: true, run: 'c6.stone', cond: () => flag('c6_stone') },
    ],
  },
};
export { has, trav };
