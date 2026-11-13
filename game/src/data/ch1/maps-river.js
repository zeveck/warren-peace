// The River Bank: the summer river and the weir, the Wild Wood in snow at dusk, Mole End, Badger's house and the
// old buried city beneath it, the road and Toad Hall (outside and the banquet hall).
import { G, findScene } from '../../core.js';
import { flag, getVal } from '../../state.js';
import { audio } from '../../engine/audio.js';
import { toScreen } from '../../engine/iso.js';
import { grid, rect, put, sprinkle, done, chest, rim } from './build.js';

export const escortingNow = id => { const ex = findScene('explore'); return !!(ex && ex.escorts && ex.escorts.some(e => e.id === id)); };

// ---------------- the River Bank (summer)
function riverbank() {
  const g = grid(40, 30, '.', 1);
  rect(g, 0, 0, 39, 3, '.', 2);                                 // a raised meadow at the back
  rect(g, 0, 12, 39, 16, '~', 0);                               // the river
  rect(g, 26, 12, 27, 16, 'w', 1);                              // the weir walkway
  rect(g, 0, 6, 39, 6, '_', 1); rect(g, 26, 7, 27, 11, '_', 1); // the towpath and the way down to the weir
  rect(g, 6, 19, 27, 19, '_', 1); rect(g, 6, 20, 6, 24, '_', 1); rect(g, 26, 17, 27, 18, '_', 1); rect(g, 12, 18, 13, 18, '_', 1);
  rect(g, 29, 23, 33, 27, '.', 2);                              // a sunny hillock
  sprinkle(g, '.', ',', 9, 4); put(g, 31, 25, ';'); put(g, 3, 2, ';');
  const t = done(g);
  const c1 = chest('c1-riverbank', 'r1', 37, 26, { buttons: 25, dandelion: 1 });
  const c2 = chest('c1-riverbank', 'r2', 2, 1, { buttons: 15, 'clover-bunch': 2 });
  const log = (n, y) => ({ id: 'prop-weir-logs', x: 26, y, w: 2, h: 1, cond: () => !flag('c1_log' + n), log: n });
  return {
    name: 'The River Bank', world: 'willows', area: 'riverbank', music: 'm-riverbank', ambience: [['river', 0.45], ['wind', 0.1]], battle: 'riverbank',
    ...t,
    entries: { underway: [6, 25, 'se'], west: [1, 6, 'se'], east: [38, 6, 'nw'], weir: [26, 18, 'ne'] },
    props: [
      { id: 'prop-warren-entrance', x: 4, y: 25, w: 2, h: 2 },
      { id: 'prop-ratty-hole', x: 12, y: 17 },
      { id: 'prop-boat', x: 16, y: 14, w: 2, h: 1, cond: () => !flag('c1_log3') },
      { id: 'prop-boat', x: 10, y: 13, w: 2, h: 1, cond: () => flag('c1_log3') },
      log(1, 16), log(2, 14), log(3, 12),
      ['prop-cellar-baskets', 8, 20], ['prop-signpost', 10, 20],
      { id: 'prop-wash-bucket', x: 22, y: 18, cond: () => flag('c1_toad_fled') && !flag('c1_toad_unmasked') },
      ['prop-willow', 3, 10], ['prop-willow', 9, 11], ['prop-willow', 18, 10], ['prop-willow', 33, 11], ['prop-willow', 37, 9],
      ['prop-willow', 2, 18], ['prop-willow', 20, 17], ['prop-willow', 36, 18], ['prop-willow', 15, 22],
      ['prop-reeds', 5, 12], ['prop-reeds', 6, 16], ['prop-reeds', 22, 16], ['prop-reeds', 31, 12], ['prop-reeds', 35, 16], ['prop-reeds', 1, 15], ['prop-reeds', 24, 12],
      ['prop-hawthorn', 1, 0], ['prop-hawthorn', 8, 0], ['prop-hawthorn', 17, 1], ['prop-hawthorn', 25, 0], ['prop-hawthorn', 33, 1], ['prop-hawthorn', 0, 8],
      ['prop-dandelions', 11, 23], ['prop-dandelions', 25, 26], ['prop-dandelions', 6, 3], ['prop-dandelions', 30, 9], ['prop-dandelions', 19, 27],
      ['prop-gorse', 31, 23], ['prop-gorse', 1, 27], ['prop-hollow-log', 21, 4, 2, 1], ['prop-fence', 38, 4], ['prop-fence', 38, 8],
      ...c1.props, ...c2.props,
    ],
    npcs: [
      { id: 'ratty', x: 13, y: 18, facing: 'sw', talk: 'c1.ratty.talk', cond: () => !flag('g_recruit_ratty') },
      { id: 'otter', x: 9, y: 21, facing: 'se', talk: 'c1.otter.talk' },
      { id: 'washerwoman', sprite: 'toad-washerwoman', x: 23, y: 18, facing: 'sw', talk: 'c1.washerwoman', cond: () => flag('c1_toad_fled') && !flag('c1_toad_unmasked') },
    ],
    enemies: [
      { id: 'rb1', type: 'weasel', x: 17, y: 23, loop: [[16, 23], [20, 23], [20, 26], [16, 26]], encounter: 'c1.rb-weasels' },
      { id: 'rb2', type: 'stoat', x: 23, y: 22, loop: [[22, 22], [25, 22], [25, 24]], encounter: 'c1.rb-stoat' },
      { id: 'rb3', type: 'ferret-sentry', x: 12, y: 8, loop: [[10, 8], [14, 8], [14, 9], [10, 9]], encounter: 'c1.rb-ferret' },
      { id: 'rb4', type: 'stoat', x: 32, y: 8, loop: [[30, 8], [34, 8], [34, 9], [31, 9]], encounter: 'c1.rb-north' },
    ],
    chests: [c1.chest, c2.chest],
    doors: [
      { x: 4, y: 25, to: 'c1-underway', entry: 'river' }, { x: 5, y: 25, to: 'c1-underway', entry: 'river' },
      { x: 0, y: 6, to: 'c1-road', entry: 'east', locked: () => !flag('g_recruit_badger'), lockedRun: 'c1.rb.roadlocked' },
      { x: 39, y: 6, to: 'c1-wildwood', entry: 'west' },
    ],
    triggers: [
      { x: 26, y: 16, w: 2, h: 1, use: true, cond: () => !flag('c1_log1'), run: 'c1.weir.log' },
      { x: 26, y: 14, w: 2, h: 1, use: true, cond: () => !flag('c1_log2'), run: 'c1.weir.log' },
      { x: 26, y: 12, w: 2, h: 1, use: true, cond: () => !flag('c1_log3'), run: 'c1.weir.log' },
      { x: 4, y: 25, w: 2, h: 1, use: true, run: async s => s.warp('c1-underway', 'river') },
      { x: 10, y: 20, use: true, run: async s => s.say(null, 'The sign says: RATTY\'S RIVERSIDE SWAP. Fair trades. No weasels. (The "no weasels" is underlined twice.)') },
    ],
    onEnter: 'c1.riverbank.enter',
  };
}

// ---------------- the Wild Wood (snow at dusk) with Mole's scent trail
export const SCENT = [[18, 13], [21, 11], [23, 8], [26, 6], [28, 4]];   // five warm markers; the sixth is Mole himself
export const MOLE_AT = [31, 3];
function wildwood() {
  const W = 36, H = 36;
  const g = grid(W, H, 'n', 0);
  const trees = new Set(), stumps = new Set(), keep = new Set();
  const K = (x, y) => x + ',' + y;
  const keepRect = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) keep.add(K(x, y)); };
  const lpath = (pts) => { for (let i = 0; i + 1 < pts.length; i++) { let [x, y] = pts[i]; const [bx, by] = pts[i + 1]; keep.add(K(x, y)); while (x !== bx) { x += Math.sign(bx - x); keep.add(K(x, y)); } while (y !== by) { y += Math.sign(by - y); keep.add(K(x, y)); } } };
  // trodden paths
  const paths = [[[1, 18], [15, 18], [15, 13]], [[15, 18], [15, 31]], [[8, 18], [8, 12], [5, 12], [5, 3]], [[15, 24], [27, 24], [27, 18]], [[15, 30], [26, 30]]];
  for (const p of paths) { lpath(p); for (let i = 0; i + 1 < p.length; i++) { let [x, y] = p[i]; const [bx, by] = p[i + 1]; put(g, x, y, '_'); while (x !== bx) { x += Math.sign(bx - x); put(g, x, y, '_'); } while (y !== by) { y += Math.sign(by - y); put(g, x, y, '_'); } } }
  // Mole's trail and its false turns through the thicket
  lpath([[15, 16], ...SCENT, MOLE_AT]);
  lpath([[21, 11], [25, 11], [25, 10]]); lpath([[23, 8], [23, 4], [21, 4]]); lpath([[26, 6], [31, 6], [31, 9]]); lpath([[18, 13], [18, 9]]);
  keepRect(29, 1, 33, 4); keepRect(3, 2, 6, 4);
  // clearings and enemy beats
  keepRect(12, 14, 18, 20); keepRect(7, 21, 13, 26); keepRect(17, 23, 23, 28); keepRect(23, 16, 30, 21); keepRect(5, 13, 12, 15); keepRect(13, 29, 20, 33);
  keepRect(3, 26, 7, 30); keepRect(23, 29, 27, 33); keepRect(1, 16, 3, 20);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = K(x, y); if (keep.has(k)) continue;
    if (x === 0 || y === 0) { if (!(x === 0 && y === 18)) trees.add(k); continue; }
    if (x === W - 1 || y === H - 1) { stumps.add(k); continue; }
    const thicketNE = x >= 16 && y <= 12, thicketNW = x <= 10 && y <= 10;
    if ((thicketNE || thicketNW) && (x * 5 + y * 3) % 4 === 0) { trees.add(k); continue; }
    if (thicketNE || thicketNW) continue;
    const h = (x * 73 + y * 151) % 41;
    if (h === 0 || h === 17 || h === 29) trees.add(k); else if (h === 9) stumps.add(k);
  }
  for (const k of trees) { const [x, y] = k.split(',').map(Number); if (x === 0 && y === 18) trees.delete(k); }
  // in the north-east thicket, a tall tree standing just in front of the trail would hide Mole and the shimmers: stumps there
  for (const k of [...trees]) {
    const [x, y] = k.split(',').map(Number); if (!(x >= 16 && y <= 12) || x === 0 || y === 0) continue;
    let hides = false;
    for (let dy = -2; dy <= 0 && !hides; dy++) for (let dx = -2; dx <= 0 && !hides; dx++) if ((dx || dy) && keep.has(K(x + dx, y + dy))) hides = true;
    if (hides) { trees.delete(k); stumps.add(k); }
  }
  const t = done(g);
  const props = [];
  for (const k of trees) { const [x, y] = k.split(',').map(Number); props.push({ id: 'prop-snow-tree', x, y, w: 1, h: 1 }); }
  for (const k of stumps) { const [x, y] = k.split(',').map(Number); props.push({ id: 'prop-snow-stump', x, y, w: 1, h: 1 }); }
  const c1 = chest('c1-wildwood', 'w1', 3, 29, { buttons: 30, 'courage-biscuit': 2 });
  return {
    name: 'The Wild Wood', world: 'willows', area: 'wildwood', music: 'm-wildwood', ambience: [['wind', 0.45], ['hum', 0.08]], battle: 'wildwood',
    dark: 0.42, tint: 'rgba(40,36,110,0.16)', sky: '#191829',
    ...t,
    entries: { west: [1, 18, 'se'], badger: [4, 2, 'sw'], moleend: [32, 2, 'sw'] },
    props: [
      ...props,
      { id: 'prop-badger-door', x: 4, y: 1 },
      { id: 'prop-mole-end-door', x: 32, y: 1, cond: () => flag('c1_mole_found'), moleDoor: true },
      ...c1.props,
    ],
    npcs: [
      { id: 'mole', x: MOLE_AT[0], y: MOLE_AT[1], facing: 'sw', talk: 'c1.mole.found', get hidden() { return (getVal('c1_scent') || 0) < 5; }, cond: () => !flag('c1_mole_found') },
      { id: 'mole', x: 31, y: 2, facing: 'sw', talk: 'c1.mole.again', cond: () => flag('c1_mole_found') && !flag('g_recruit_mole') && !escortingNow('mole') },
      { id: 'hedgehog-1', sprite: 'hedgehog', x: 5, y: 28, facing: 'ne', talk: 'c1.hog.talk', cond: () => !flag('c1_hogs_home') && !escortingNow('hedgehog-1') },
      { id: 'hedgehog-2', sprite: 'hedgehog', x: 25, y: 31, facing: 'nw', talk: 'c1.hog.talk', cond: () => !flag('c1_hogs_home') && !escortingNow('hedgehog-2') },
    ],
    enemies: [
      { id: 'ww1', type: 'weasel', x: 10, y: 22, loop: [[8, 22], [12, 22], [12, 25], [8, 25]], encounter: 'c1.ww-1' },
      { id: 'ww2', type: 'ferret-sentry', x: 20, y: 25, loop: [[18, 25], [22, 25], [22, 27], [18, 27]], encounter: 'c1.ww-2' },
      { id: 'ww3', type: 'stoat', x: 26, y: 17, loop: [[24, 17], [29, 17], [29, 20], [24, 20]], encounter: 'c1.ww-3' },
      { id: 'ww4', type: 'weasel', x: 9, y: 14, loop: [[6, 14], [11, 14]], encounter: 'c1.ww-4' },
      { id: 'ww5', type: 'stoat', x: 17, y: 31, loop: [[14, 31], [19, 31], [19, 32], [14, 32]], encounter: 'c1.ww-5' },
    ],
    chests: [c1.chest],
    doors: [
      { x: 0, y: 18, to: 'c1-riverbank', entry: 'east' },
      { x: 4, y: 1, run: 'c1.badger.door' },
      { x: 32, y: 1, run: 'c1.moleend.door', cond: () => flag('c1_mole_found') },
    ],
    triggers: [
      { id: 'scent', x: 12, y: 13, w: 9, h: 8, once: true, run: 'c1.ww.scent' },
      { id: 'dusk', x: 1, y: 16, w: 4, h: 5, once: true, run: 'c1.ww.dusk' },
      { x: 4, y: 1, use: true, run: 'c1.badger.door' },
      { x: 32, y: 1, use: true, cond: () => flag('c1_mole_found'), run: 'c1.moleend.door' },
    ],
    onEnter: 'c1.wildwood.enter',
    onHop(ex, x, y) {
      const n = getVal('c1_scent') || 0;
      if (n >= SCENT.length || !flag('c1_scent_on')) return;
      const [mx, my] = SCENT[n];
      if (x !== mx || y !== my) return;
      G.s.flags.c1_scent = n + 1;
      audio.synth('twinkle'); audio.sfx('shimmer', { vol: 0.5 });
      const s = toScreen(x, y, ex.hAt(x, y)); for (let i = 0; i < 8; i++) ex.fx.push({ k: 'spark', x: s.x - 8 + i * 2, y: s.y + 4 - (i % 3) * 3, t: -i * 0.04, life: 0.9 });
      const lines = ['Warm, like toast. That\'s Mole all right.', 'Here again! He went round and round.', 'Fresher now. He can\'t be far.', 'This way. I\'d know that smell anywhere.', 'Listen! Somebody\'s sniffling up ahead.'];
      const who = ex.followers.find(f => f.id === 'ratty') ? 'ratty' : (ex.followers.find(f => !f.escort) || {}).id;
      if (who) ex.bubbles.push({ who, text: lines[n], t: 3.5 });
      if (n + 1 === SCENT.length) { const m = ex.map.actors.find(a => a.id === 'mole'); if (m) { m.hidden = false; m.emote = '?'; setTimeout(() => { m.emote = null; }, 1600); } }
    },
    drawGround(ex, c, ox, oy) {
      if (!flag('c1_scent_on') || flag('c1_mole_found')) return;
      const n = getVal('c1_scent') || 0;
      const [tx, ty] = n < SCENT.length ? SCENT[n] : MOLE_AT;
      if (Math.max(Math.abs(ex.b.x - tx), Math.abs(ex.b.y - ty)) > 4) return;
      const s = toScreen(tx, ty, ex.hAt(tx, ty)); const x = s.x + ox, y = s.y + oy + 8;
      const k = 0.5 + 0.5 * Math.sin(G.time * 4);
      c.save();
      c.fillStyle = `rgba(255,200,110,${0.18 + 0.14 * k})`;
      c.beginPath(); c.ellipse(x, y, 15, 7.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = `rgba(255,226,150,${0.35 + 0.3 * k})`;
      c.beginPath(); c.ellipse(x, y, 8, 4, 0, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 5; i++) {
        const ph = (G.time * 0.8 + i * 0.2) % 1; const px = x - 8 + ((i * 37) % 17), py = y - ph * 22;
        c.fillStyle = `rgba(255,236,170,${1 - ph})`; c.fillRect(Math.round(px), Math.round(py), 2, 2);
      }
      c.restore();
    },
  };
}

// ---------------- Mole End
function moleEnd() {
  const g = grid(12, 10, '#', 1);
  rect(g, 1, 1, 10, 8, 'f', 0); rect(g, 3, 3, 8, 6, 'm', 0); put(g, 6, 9, 'f', 0);
  rim(g);
  const t = done(g);
  return {
    name: 'Mole End', world: 'warren', area: 'moleend', music: 'm-warren', ambience: [['hearth', 0.3]], battle: 'warren', dark: 0.05,
    ...t,
    entries: { door: [6, 7, 'ne'] },
    props: [
      ['prop-lantern', 1, 1], ['prop-armchair', 3, 1], ['prop-dresser', 9, 1], ['prop-table', 5, 4], ['prop-table', 6, 4],
      ['prop-cellar-baskets', 10, 3], ['prop-herb-rack', 1, 4], { id: 'prop-moss-bed', x: 10, y: 6, w: 1, h: 2 }, ['prop-lantern-mushroom', 1, 8], ['prop-button-shelves', 7, 1],
    ],
    npcs: [],
    doors: [{ x: 6, y: 9, to: 'c1-wildwood', entry: 'moleend' }],
    triggers: [{ x: 10, y: 6, w: 1, h: 2, use: true, run: 'c1.moleend.bed' }],
    onEnter: 'c1.moleend.enter',
  };
}

// ---------------- Badger's house (the warm kitchen) and the old buried city beneath it
function badgerHouse() {
  const g = grid(16, 13, '#', 1);
  rect(g, 1, 1, 14, 11, 'f', 0); rect(g, 4, 3, 9, 7, 'm', 0); put(g, 7, 12, 'f', 0); put(g, 15, 8, 'f', 0);
  rim(g);
  const t = done(g);
  return {
    name: 'Badger\'s House', world: 'warren', area: 'badger', music: 'm-warren', ambience: [['hearth', 0.5]], battle: 'warren', dark: 0,
    ...t,
    entries: { door: [7, 10, 'ne'], stairs: [13, 8, 'nw'] },
    props: [
      { id: 'prop-hearth', x: 6, y: 1, w: 2, h: 1 }, ['prop-lantern', 1, 1], ['prop-dresser', 1, 4], ['prop-herb-rack', 12, 1], ['prop-armchair', 9, 2],
      { id: 'prop-settle', x: 5, y: 4, w: 2, h: 1 }, ['prop-banquet-table', 9, 6], ['prop-banquet-table', 10, 6], ['prop-banquet-table', 11, 6],
      ['prop-cellar-baskets', 14, 4], ['prop-cellar-baskets', 14, 11], ['prop-lantern', 14, 6], ['prop-herb-rack', 14, 10], ['prop-lantern-mushroom', 1, 11],
    ],
    npcs: [
      { id: 'badger', x: 8, y: 3, facing: 'sw', talk: 'c1.badger.talk', cond: () => !flag('g_recruit_badger') },
      { id: 'hedgehog-1', sprite: 'hedgehog', x: 9, y: 7, facing: 'ne', talk: 'c1.hog.breakfast', cond: () => flag('c1_hogs_home') },
      { id: 'hedgehog-2', sprite: 'hedgehog', x: 11, y: 7, facing: 'ne', talk: 'c1.hog.breakfast', cond: () => flag('c1_hogs_home') },
      { id: 'toad', x: 3, y: 7, facing: 'se', talk: 'c1.toad.badgers', cond: () => flag('c1_toad_unmasked') && !flag('g_recruit_toad') && !escortingNow('toad') },
    ],
    doors: [{ x: 7, y: 12, to: 'c1-wildwood', entry: 'badger' }, { x: 15, y: 8, to: 'c1-buried-city', entry: 'stairs' }],
    triggers: [{ x: 5, y: 4, w: 2, h: 1, use: true, run: 'c1.badger.settle' }],
    onEnter: 'c1.badgerhouse.enter',
    drawGround(ex, c, ox, oy) { const s = toScreen(15, 8, 0); c.fillStyle = 'rgba(20,12,8,0.75)'; c.beginPath(); c.moveTo(s.x + ox, s.y + oy + 2); c.lineTo(s.x + ox + 14, s.y + oy + 8); c.lineTo(s.x + ox, s.y + oy + 14); c.lineTo(s.x + ox - 14, s.y + oy + 8); c.fill(); },
  };
}
function buriedCity() {
  const g = grid(26, 22, '#', 1);
  rect(g, 1, 1, 5, 4, 'x', 1); put(g, 2, 0, 'x', 1);
  rect(g, 3, 5, 21, 8, 'f', 0); rect(g, 4, 5, 6, 5, 'x', 1);
  rect(g, 7, 9, 17, 16, 'x', 0); rect(g, 10, 11, 14, 14, 'f', 0);
  rect(g, 18, 9, 24, 20, 'f', 0); rect(g, 19, 17, 23, 20, 'x', 0); put(g, 25, 19, 'f', 0);
  sprinkle(g, 'f', 'x', 7, 5);
  rim(g);
  const t = done(g);
  const c1 = chest('c1-buried-city', 'b1', 8, 15, { buttons: 30, 'carrot-cake': 1 });
  return {
    name: 'The Buried City', world: 'flint', sky: '#0d0b12', area: 'badger', music: 'm-depths', ambience: [['drone-bed', 0.2]], battle: 'warren', dark: 0.42,
    ...t,
    entries: { stairs: [2, 2, 'sw'], tunnel: [23, 19, 'nw'] },
    props: [
      ['prop-city-column', 3, 5], ['prop-city-column', 8, 5], ['prop-city-column', 13, 5], ['prop-city-column', 18, 5], ['prop-city-column', 21, 8],
      ['prop-city-column', 7, 9], ['prop-city-column', 17, 9], ['prop-city-column', 7, 16], ['prop-city-column', 17, 16],
      ['prop-ruin-arch', 18, 12], ['prop-rubble', 11, 7], ['prop-rubble', 15, 15], ['prop-brick-bits', 9, 12], ['prop-brick-bits', 20, 10], ['prop-ruin-seat', 12, 10],
      ['prop-rubble', 24, 9], ['prop-carved-rock', 22, 12], ['prop-lantern-mushroom', 1, 4], ['prop-lantern-mushroom', 24, 15], ['prop-rest-stone', 21, 17],
      ['prop-root-pillar', 5, 1], ['prop-city-column', 24, 18],
      ...c1.props,
    ],
    chests: [c1.chest],
    enemies: [
      { id: 'bc1', type: 'stoat', x: 12, y: 6, loop: [[10, 6], [16, 6], [16, 7], [10, 7]], encounter: 'c1.bc-1' },
      { id: 'bc2', type: 'ferret-sentry', x: 20, y: 13, loop: [[19, 11], [23, 11], [23, 15], [19, 15]], encounter: 'c1.bc-2' },
    ],
    doors: [
      { x: 2, y: 0, to: 'c1-badger', entry: 'stairs' },
      { x: 25, y: 19, to: 'c1-toadhall-in', entry: 'pantry', locked: () => !flag('c1_toad_unmasked'), lockedRun: 'c1.tunnel.locked' },
    ],
    triggers: [{ x: 21, y: 17, use: true, run: 'c1.rest' }, { id: 'city', x: 3, y: 5, w: 4, h: 3, once: true, run: 'c1.city.enter' }],
    drawGround(ex, c, ox, oy) { const s = toScreen(25, 19, 0); c.fillStyle = 'rgba(10,8,12,0.8)'; c.beginPath(); c.moveTo(s.x + ox, s.y + oy + 2); c.lineTo(s.x + ox + 14, s.y + oy + 8); c.lineTo(s.x + ox, s.y + oy + 14); c.lineTo(s.x + ox - 14, s.y + oy + 8); c.fill(); },
  };
}

// ---------------- the road and Toad Hall
function road() {
  const g = grid(36, 24, '.', 1);
  rect(g, 6, 2, 26, 9, 'G', 1); rect(g, 14, 0, 17, 1, '.', 1);
  rect(g, 15, 2, 16, 11, '_', 1); rect(g, 0, 12, 35, 13, '_', 1);
  rect(g, 0, 18, 35, 19, '~', 0); rect(g, 0, 20, 35, 23, '.', 0); rect(g, 0, 17, 35, 17, '.', 1);
  sprinkle(g, '.', ',', 11, 6);
  const t = done(g);
  const c1 = chest('c1-road', 'rd1', 33, 3, { buttons: 30, 'pluck-berry': 2 });
  return {
    name: 'The Road to Toad Hall', world: 'willows', area: 'riverbank', music: 'm-riverbank', ambience: [['wind', 0.2], ['river', 0.15]], battle: 'riverbank',
    ...t,
    entries: { east: [34, 12, 'nw'], hall: [15, 2, 'sw'] },
    props: [
      { id: 'prop-toad-hall', x: 14, y: 0, w: 4, h: 2, whole: true },
      { id: 'prop-motor-car', x: 24, y: 15, w: 2, h: 1 },
      ['prop-hedge', 6, 10], ['prop-hedge', 7, 10], ['prop-hedge', 8, 10], ['prop-hedge', 9, 10], ['prop-hedge', 10, 10], ['prop-hedge', 11, 10], ['prop-hedge', 12, 10], ['prop-hedge', 13, 10],
      ['prop-hedge', 18, 10], ['prop-hedge', 19, 10], ['prop-hedge', 20, 10], ['prop-hedge', 21, 10], ['prop-hedge', 22, 10], ['prop-hedge', 23, 10], ['prop-hedge', 24, 10], ['prop-hedge', 25, 10],
      ['prop-willow', 3, 3], ['prop-willow', 29, 2], ['prop-willow', 2, 16], ['prop-willow', 30, 16], ['prop-willow', 9, 21], ['prop-willow', 22, 22],
      ['prop-reeds', 5, 18], ['prop-reeds', 13, 19], ['prop-reeds', 27, 18], ['prop-reeds', 33, 19],
      ['prop-signpost', 31, 11], ['prop-rose-bush', 10, 3], ['prop-rose-bush', 21, 3], ['prop-dandelions', 8, 7], ['prop-dandelions', 24, 6], ['prop-fence', 4, 9], ['prop-fence', 27, 9],
      ['prop-lantern', 13, 2], ['prop-lantern', 18, 2], ['prop-hawthorn', 0, 1], ['prop-hawthorn', 35, 7], ['prop-gorse', 1, 21],
      ...c1.props,
    ],
    npcs: [
      { id: 'toad', x: 26, y: 15, facing: 'nw', talk: 'c1.toad.car', cond: () => !flag('c1_toad_fled') },
      { id: 'door-weasel-1', sprite: 'weasel', x: 15, y: 2, facing: 'se', talk: 'c1.doorweasel', cond: () => !flag('c1_chief_beaten') },
      { id: 'door-weasel-2', sprite: 'weasel', x: 16, y: 2, facing: 'sw', talk: 'c1.doorweasel', cond: () => !flag('c1_chief_beaten') },
    ],
    enemies: [
      { id: 'rd1', type: 'weasel', x: 8, y: 13, loop: [[4, 13], [11, 13]], encounter: 'c1.rd-1', cond: () => !flag('c1_chief_beaten') },
      { id: 'rd2', type: 'ferret-sentry', x: 22, y: 6, loop: [[19, 5], [24, 5], [24, 8], [19, 8]], encounter: 'c1.rd-2', cond: () => !flag('c1_chief_beaten') },
    ],
    chests: [c1.chest],
    doors: [
      { x: 35, y: 12, to: 'c1-riverbank', entry: 'west' }, { x: 35, y: 13, to: 'c1-riverbank', entry: 'west' },
      { x: 15, y: 1, to: 'c1-toadhall-in', entry: 'front', locked: () => !flag('c1_chief_beaten'), lockedRun: 'c1.doorweasel' },
      { x: 16, y: 1, to: 'c1-toadhall-in', entry: 'front', locked: () => !flag('c1_chief_beaten'), lockedRun: 'c1.doorweasel' },
    ],
    triggers: [{ x: 31, y: 11, use: true, run: async s => s.say(null, 'The signpost points two ways: TOAD HALL, and THE RIVER. Someone has added, in wobbly chalk, "AND STAY OUT".') }],
    onEnter: 'c1.road.enter',
  };
}
function toadHall() {
  const g = grid(22, 16, '#', 1);
  rect(g, 1, 1, 20, 10, 'w', 0); rect(g, 6, 3, 15, 7, 'm', 0);
  rect(g, 1, 12, 6, 14, 'f', 0); put(g, 4, 11, 'w', 0); put(g, 21, 6, 'w', 0);
  rim(g);
  const t = done(g);
  return {
    name: 'Toad Hall', world: 'willows', sky: '#1a120c', area: 'toadhall', music: () => flag('c1_chief_beaten') ? 'm-riverbank' : 'm-wildwood', ambience: [['hearth', 0.3]], battle: 'riverbank', dark: 0.1,
    ...t,
    entries: { pantry: [2, 13, 'ne'], front: [19, 6, 'nw'], table: [12, 8, 'ne'] },
    props: [
      { id: 'prop-hearth', x: 10, y: 1, w: 2, h: 1 }, ['prop-dresser', 3, 1], ['prop-dresser', 17, 1], ['prop-lantern', 1, 1], ['prop-lantern', 20, 1], ['prop-lantern', 20, 10],
      ['prop-banquet-table', 7, 5], ['prop-banquet-table', 8, 5], ['prop-banquet-table', 9, 5], ['prop-banquet-table', 10, 5], ['prop-banquet-table', 11, 5], ['prop-banquet-table', 12, 5], ['prop-banquet-table', 13, 5],
      ['prop-armchair', 14, 5], ['prop-cellar-baskets', 1, 12], ['prop-cellar-baskets', 6, 12], ['prop-herb-rack', 5, 14], ['prop-store-counter', 1, 10],
      ['prop-rose-bush', 1, 7], ['prop-settle', 17, 9, 2, 1],
    ],
    npcs: [
      { id: 'chief-weasel', x: 15, y: 5, facing: 'nw', talk: 'c1.chief.talk' },
      { id: 'banq-1', sprite: 'weasel', x: 8, y: 4, facing: 'sw', talk: 'c1.banqueter' }, { id: 'banq-2', sprite: 'weasel', x: 10, y: 4, facing: 'sw', talk: 'c1.banqueter' },
      { id: 'banq-3', sprite: 'stoat', x: 12, y: 4, facing: 'sw', talk: 'c1.banqueter' }, { id: 'banq-4', sprite: 'weasel', x: 9, y: 6, facing: 'ne', talk: 'c1.banqueter' },
      { id: 'banq-5', sprite: 'ferret-sentry', x: 11, y: 6, facing: 'ne', talk: 'c1.banqueter' },
    ],
    enemies: [
      { id: 'th1', type: 'weasel', x: 4, y: 9, loop: [[3, 8], [6, 8], [6, 9], [3, 9]], encounter: 'c1.th-1', cond: () => !flag('c1_chief_beaten') },
      { id: 'th2', type: 'stoat', x: 17, y: 7, loop: [[16, 7], [18, 7], [18, 4]], encounter: 'c1.th-2', cond: () => !flag('c1_chief_beaten') },
    ],
    doors: [{ x: 1, y: 14, to: 'c1-buried-city', entry: 'tunnel' }, { x: 21, y: 6, to: 'c1-road', entry: 'hall' }],
    triggers: [{ id: 'chief', x: 13, y: 3, w: 4, h: 6, once: true, cond: () => !flag('c1_chief_beaten'), run: 'c1.chief.talk' }],
    onEnter: 'c1.toadhall.enter',
    drawGround(ex, c, ox, oy) { const s = toScreen(1, 14, 0); c.fillStyle = 'rgba(30,18,10,0.85)'; c.fillRect(s.x + ox - 7, s.y + oy + 4, 14, 8); c.fillStyle = '#7a5838'; c.fillRect(s.x + ox - 8, s.y + oy + 3, 16, 1); },
  };
}

export default {
  'c1-riverbank': riverbank(), 'c1-wildwood': wildwood(), 'c1-mole-end': moleEnd(), 'c1-badger': badgerHouse(),
  'c1-buried-city': buriedCity(), 'c1-road': road(), 'c1-toadhall-in': toadHall(),
};
