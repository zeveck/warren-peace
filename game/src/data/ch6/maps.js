// The New Burrows (c6-upburrow): Flintcomb's homes dug up and sideways into the west bank, away from the hole.
// A long hall with five flint-stopped alcoves; three hide Flintcomb's old pre-Hum rooms (thump to find them).
// The tiles are a getter: a room's floor only exists once it's dug (refreshConds re-reads them, def.retile).
import { flag } from '../../state.js';
import { toScreen } from '../../engine/iso.js';
import { G } from '../../core.js';
import { standing, running, done, escorting } from './common.js';

export const W6 = 22, H6 = 17;
// the five alcove mouths and the rooms ("pockets") behind them; room: null = solid chalk
export const ALCOVES = [
  { k: 1, x: 4, y: 5, room: 'den', pocket: [2, 1, 6, 4] },
  { k: 2, x: 15, y: 5, room: 'nursery', pocket: [13, 1, 17, 4] },
  { k: 3, x: 5, y: 11, room: null, pocket: [3, 12, 7, 15] },
  { k: 4, x: 12, y: 11, room: 'larder', pocket: [10, 12, 14, 15] },
  { k: 5, x: 18, y: 11, room: null, pocket: [16, 12, 20, 15] },
];
const dug = r => flag('c6_room_' + r);
const inR = (x, y, [x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1;

function carved(x, y) {
  if (x >= 2 && x <= 19 && y >= 6 && y <= 10) return 'hall';
  if (x >= 9 && x <= 11 && y >= 1 && y <= 5) return 'pass';
  for (const a of ALCOVES) {
    if (a.x === x && a.y === y) return 'mouth';
    if (a.room && dug(a.room) && inR(x, y, a.pocket)) return a.room;
  }
  return null;
}
function rows() {
  const out = [];
  for (let y = 0; y < H6; y++) {
    let r = '';
    for (let x = 0; x < W6; x++) {
      const c = carved(x, y);
      if (c === 'hall') r += (x * 7 + y * 3) % 9 === 0 ? 'f' : 'm';
      else if (c === 'pass') r += 'r';
      else if (c === 'mouth') r += 'f';
      else if (c === 'nursery') r += 'm';
      else if (c === 'larder') r += 'e';
      else if (c === 'den') r += 'w';
      else {
        let near = ALCOVES.some(a => inR(x, y, a.pocket));
        for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1 && !near; dx++) if (carved(x + dx, y + dy)) near = true;
        r += near ? 'B' : ' ';
      }
    }
    out.push(r);
  }
  return out;
}

// low earth walls (two levels, so they don't hide the floor) round everything dug
const LEGEND6 = { B: { k: 'wall', walk: 0 } };
const heightRows = () => rows().map(r => r.replace(/./g, ch => (ch === 'B' ? '2' : '0')));

// drawn hints for the tally-stone's clues: a morning sunbeam by the nursery, a damp weep by the larder
function drawGround(ex, c, ox, oy) {
  const diamond = (x, y, col) => { const s = toScreen(x, y, ex.hAt(x, y)); const cx = s.x + ox, cy = s.y + oy; c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + 16, cy + 8); c.lineTo(cx, cy + 16); c.lineTo(cx - 16, cy + 8); c.closePath(); c.fill(); };
  for (const [x, y] of [[11, 10], [12, 10], [13, 10]]) diamond(x, y, 'rgba(40,60,96,0.28)');
  const t = G.time;
  for (let i = 0; i < 3; i++) { const s = toScreen(11 + i, 11, 3); const k = ((t * 0.4 + i * 0.37) % 1); c.fillStyle = `rgba(150,190,230,${0.7 * (1 - k)})`; c.fillRect(Math.round(s.x + ox - 2), Math.round(s.y + oy - 6 + k * 26), 1, 2); }
}
function drawOver(ex, c, ox, oy) {
  // the morning comes in through a crack above the nursery's alcove
  const s = toScreen(15, 6, 0), cx = s.x + ox, cy = s.y + oy + 8;
  const g = c.createLinearGradient(cx, cy - 120, cx, cy);
  g.addColorStop(0, 'rgba(255,236,170,0)'); g.addColorStop(1, 'rgba(255,236,170,0.22)');
  c.fillStyle = g; c.beginPath(); c.moveTo(cx - 6, cy - 120); c.lineTo(cx + 10, cy - 120); c.lineTo(cx + 22, cy); c.lineTo(cx - 18, cy); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,236,170,0.16)'; c.beginPath(); c.ellipse(cx + 2, cy, 26, 10, 0, 0, Math.PI * 2); c.fill();
}

const R = (room, list) => list.map(p => ({ ...p, cond: () => dug(room) }));
const npc = (id, sprite, fur, x, y, facing, cond, extra = {}) => ({ id, sprite, fur, x, y, facing, talk: 'c6.talk', cond, ...extra });

const upburrow = {
  name: 'The New Burrows', world: 'warren', area: 'flintcomb', music: 'm-warren', ambience: [['hearth', 0.3]], battle: 'warren',
  dark: 0.12, sky: '#1e1610',
  retile: true,
  get tiles() { return rows(); }, get heights() { return heightRows(); }, legend: LEGEND6,
  entries: { top: [10, 3, 'se'], hall: [10, 7, 'se'] },
  props: [
    // rubble in every alcove mouth until (if) it's dug
    ...ALCOVES.map(a => ({ id: 'prop-flint-wall', x: a.x, y: a.y, cond: () => !(a.room && dug(a.room)) })),
    ['prop-lantern', 2, 10], ['prop-lantern', 19, 10], ['prop-lantern', 9, 5], ['prop-lantern', 11, 5],
    { id: 'prop-hearth', x: 5, y: 6, w: 2, h: 1 },          // "beside the warm" (the den's alcove is at 4,5)
    ['prop-carved-rock', 8, 6],                               // the tally-stone
    ['prop-tunnel-heap', 17, 8, 2, 1], ['prop-wash-bucket', 3, 8],
    // the rooms, furnished when dug
    ...R('den', [{ id: 'prop-settle', x: 3, y: 2, w: 2, h: 1 }, { id: 'prop-table', x: 5, y: 2 }, { id: 'prop-lantern', x: 2, y: 1 }, { id: 'prop-armchair', x: 6, y: 1 }]),
    ...R('nursery', [{ id: 'prop-nursery-nest', x: 14, y: 2 }, { id: 'prop-nursery-nest', x: 16, y: 2 }, { id: 'prop-moss-bed', x: 17, y: 3, w: 1, h: 2 }, { id: 'prop-lantern', x: 13, y: 1 }]),
    ...R('larder', [{ id: 'prop-herb-rack', x: 10, y: 13 }, { id: 'prop-cellar-baskets', x: 13, y: 14 }, { id: 'prop-cellar-baskets', x: 14, y: 13 }, { id: 'prop-lantern', x: 10, y: 15 }]),
  ],
  npcs: [
    npc('c6-pip', 'pip', null, 7, 9, 'se', standing('pip'), { kid: true, talk: 'c6.pip' }),
    npc('c6-burdock', 'burdock', null, 16, 9, 'nw', () => standing('burdock')() && !done(), { talk: 'c6.friend' }),
    npc('c6-mole', 'mole', null, 4, 8, 'se', () => standing('mole')(), { talk: 'c6.friend' }),
    npc('c6-mum', 'rabbit-doe', 'grey', 5, 3, 'se', () => dug('den')),
    npc('c6-larder', 'rabbit-buck', 'dark', 12, 13, 'nw', () => dug('larder')),
    npc('c6-nurse', 'rabbit-doe', 'cream', 15, 3, 'se', () => dug('nursery')),
    npc('c6-chip', 'rabbit-kit', 'dark', 14, 3, 'se', () => dug('nursery') && !escorting('c6-chip'), { kid: true, talk: 'c6.chip' }),
    npc('c6-gault-home', 'rabbit-buck', 'dark', 16, 4, 'nw', () => flag('c6_gault_done'), { talk: 'c6.gault' }),
    npc('c6-kit-a', 'rabbit-kit', 'grey', 6, 4, 'sw', () => dug('den'), { kid: true }),
    npc('c6-kit-b', 'rabbit-kit', 'brown', 13, 4, 'se', () => dug('nursery'), { kid: true }),
  ],
  doors: [9, 10, 11].map(x => ({ x, y: 1, to: 'c4-flintcomb', entry: 'burrow' })),
  triggers: [
    ...ALCOVES.map(a => ({ id: 'alcove' + a.k, x: a.x, y: a.y, use: true, run: 'c6.alcove' + a.k, cond: () => !(a.room && dug(a.room)) })),
    { id: 'tally', x: 8, y: 6, use: true, run: 'c6.tally' },
    { id: 'hearth', x: 5, y: 6, w: 2, h: 1, use: true, run: async s => { await s.narrate('An old hearth, cold for a year. Somebody has laid a fire in it again, ready.'); } },
  ],
  onEnter: 'c6.upburrow.enter',
  drawGround, drawOver,
};

export const MAPS = { 'c6-upburrow': upburrow };
export { running };
