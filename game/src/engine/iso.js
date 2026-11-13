// Isometric projection, code-drawn tiles, and picking. Tiles are 32x16 diamonds, 8 px per height level.
// Screen position of a tile's top corner: sx = (x - y) * 16, sy = (x + y) * 8 - h * 8.
import { WORLD } from '../data/core/palette.js';
import { hashStr } from '../core.js';

export const TW = 32, TH = 16, LH = 8;
export const toScreen = (x, y, h = 0) => ({ x: (x - y) * 16, y: (x + y) * 8 - h * LH });

// Default legend: char -> { k: palette kind, walk, block, water, nib (nibble kind), wall, ... }
export const LEGEND = {
  '.': { k: 'grass', walk: 1 }, ',': { k: 'clover', walk: 1, nib: 'clover' }, ';': { k: 'sweet', walk: 1, nib: 'sweet' },
  '_': { k: 'path', walk: 1 }, 'x': { k: 'chalk', walk: 1 }, 'e': { k: 'earth', walk: 1 }, 'f': { k: 'floor', walk: 1 },
  'm': { k: 'moss', walk: 1 }, 'r': { k: 'root', walk: 1 }, 'w': { k: 'wood', walk: 1 }, 'k': { k: 'check', walk: 1 },
  'n': { k: 'snow', walk: 1 }, 'd': { k: 'dust', walk: 1 }, 'b': { k: 'brick', walk: 1 }, 'u': { k: 'blue', walk: 1 },
  'g': { k: 'emerald', walk: 1 }, 'y': { k: 'yellow', walk: 1 }, 'p': { k: 'poppy', walk: 1 }, 'z': { k: 'sand', walk: 1 },
  'q': { k: 'flint', walk: 1 }, 'v': { k: 'corn', walk: 1, cover: 1 }, 'a': { k: 'rock', walk: 1 }, 'j': { k: 'bone', walk: 1 },
  'o': { k: 'carve', walk: 1 }, 'G': { k: 'grass', walk: 1, nib: 'grass' },
  'c': { k: 'china', walk: 1, china: 1 },
  's': { k: 'floor', walk: 1, small: 1 },     // small-only (mouse holes, under tables)
  'h': { k: 'hedge', walk: 0, hedge: 1, raise: 1 }, // big Bramble steps over
  't': { k: 'floor', walk: 1, shelf: 1 },     // high-shelf trigger tiles (big Bramble reaches)
  '~': { k: 'water', walk: 0, water: 1 }, 'L': { k: 'lava', walk: 0, water: 1 },
  '#': { k: 'wall', walk: 0, wall: 1 }, '%': { k: 'rock', walk: 0, wall: 1 },
  ' ': null,
};

// world palette lookup with fallbacks
function pal(world, kind) {
  const w = WORLD[world] || WORLD.downs;
  if (w[kind]) return w[kind];
  const alt = { floor: ['floor', 'grass', 'dust', 'rock'], wall: ['wall', 'rock', 'earth', 'floor'], grass: ['grass', 'moss', 'floor'], path: ['path', 'brick', 'floor'],
    moss: ['moss', 'grass', 'floor'], earth: ['earth', 'floor', 'rock'], chalk: ['chalk', 'path', 'floor'], clover: ['clover', 'grass'], sweet: ['sweet', 'grass'] }[kind] || ['floor', 'grass'];
  for (const a of alt) if (w[a]) return w[a];
  const k = Object.keys(w).find(k => Array.isArray(w[k])); return w[k];
}

// Tile block images, cached by (world, kind, height-of-side, variant)
const cache = new Map();
export function tileImage(world, kind, side, variant = 0, dark = 0) {
  const key = world + kind + side + '|' + variant + '|' + dark;
  let c = cache.get(key); if (c) return c;
  const P = pal(world, kind);
  const sideH = side * LH;
  c = document.createElement('canvas'); c.width = 32; c.height = 16 + sideH; const x = c.getContext('2d');
  const r = rngFrom(hashStr(key));
  // sides
  if (sideH > 0) {
    x.fillStyle = P[2]; x.beginPath(); x.moveTo(0, 8); x.lineTo(16, 16); x.lineTo(16, 16 + sideH); x.lineTo(0, 8 + sideH); x.fill();
    x.fillStyle = P[3]; x.beginPath(); x.moveTo(16, 16); x.lineTo(32, 8); x.lineTo(32, 8 + sideH); x.lineTo(16, 16 + sideH); x.fill();
    // strata lines and specks on the sides
    x.fillStyle = 'rgba(0,0,0,0.12)';
    for (let yy = 12; yy < 8 + sideH; yy += 6) { x.fillRect(1, yy + 2, 14, 1); x.fillRect(17, yy + 2, 14, 1); }
    x.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < side * 3; i++) x.fillRect(Math.floor(r() * 30) + 1, 10 + Math.floor(r() * (sideH - 2)), 2, 1);
    // dark edge line
    x.fillStyle = 'rgba(30,20,20,0.45)'; x.fillRect(15, 16, 1, sideH); x.fillRect(16, 16, 1, sideH);
  }
  // top diamond
  x.fillStyle = P[0]; diamond(x, 0, 0);
  // dithered texture: lighter pixels on the upper-left half, specks
  x.fillStyle = P[1];
  for (let i = 0; i < 26; i++) { const px = Math.floor(r() * 30) + 1, py = Math.floor(r() * 14) + 1; if (inDiamond(px, py) && px + py * 2 < 34) x.fillRect(px, py, 1, 1); }
  x.fillStyle = P[4];
  const nspeck = kind === 'clover' ? 7 : kind === 'sweet' ? 5 : kind === 'poppy' ? 4 : 5;
  for (let i = 0; i < nspeck; i++) { const px = Math.floor(r() * 28) + 2, py = Math.floor(r() * 12) + 2; if (inDiamond(px, py)) { x.fillRect(px, py, kind === 'clover' || kind === 'poppy' ? 2 : 1, 1); } }
  if (kind === 'clover') { x.fillStyle = '#5e8a50'; for (let i = 0; i < 4; i++) { const px = Math.floor(r() * 24) + 4, py = Math.floor(r() * 8) + 4; if (inDiamond(px, py)) { x.fillRect(px, py, 3, 1); x.fillRect(px + 1, py - 1, 1, 3); } } }
  if (kind === 'sweet') { x.fillStyle = '#6a9a3a'; for (let i = 0; i < 6; i++) { const px = Math.floor(r() * 24) + 4, py = Math.floor(r() * 8) + 4; if (inDiamond(px, py)) x.fillRect(px, py - 2, 1, 3); } }
  if (kind === 'grass' && world !== 'depths') { x.fillStyle = 'rgba(40,70,30,0.35)'; for (let i = 0; i < 4; i++) { const px = Math.floor(r() * 24) + 4, py = Math.floor(r() * 8) + 4; if (inDiamond(px, py)) x.fillRect(px, py - 1, 1, 2); } }
  if (kind === 'brick' || kind === 'check') {
    x.fillStyle = kind === 'brick' ? 'rgba(120,80,20,0.45)' : P[4];
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 32; xx++) {
      if (!inDiamond(xx, yy)) continue;
      const u = Math.floor((xx / 2 + yy) / 4), v = Math.floor((xx / 2 - yy + 16) / 4);
      if (kind === 'check') { if ((u + v) % 2 === 0) x.fillRect(xx, yy, 1, 1); }
      else if ((xx / 2 + yy) % 4 < 0.6 || ((xx / 2 - yy + 16) % 8 < 0.6 && u % 2 === 0)) x.fillRect(xx, yy, 1, 1);
    }
  }
  if (kind === 'china') { x.fillStyle = P[4]; x.fillRect(10, 6, 12, 1); x.fillRect(15, 4, 2, 5); }
  if (kind === 'carve') { x.fillStyle = P[4]; x.fillRect(12, 7, 8, 1); x.fillRect(15, 5, 2, 1); x.fillRect(14, 9, 4, 1); }
  // edge highlight on the upper-left edges, shadow on lower-right
  x.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 16; i++) x.fillRect(i, 8 - Math.floor(i / 2) - 1 + 1, 1, 1);
  x.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 16; i++) x.fillRect(16 + i, 15 - Math.floor(i / 2), 1, 1);
  if (dark) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(10,8,20,${dark})`; x.fillRect(0, 0, 32, c.height); }
  cache.set(key, c); return c;
}
function diamond(x, ox, oy) { x.beginPath(); x.moveTo(ox + 16, oy); x.lineTo(ox + 32, oy + 8); x.lineTo(ox + 16, oy + 16); x.lineTo(ox, oy + 8); x.closePath(); x.fill(); }
function inDiamond(px, py) { return Math.abs(px - 16) / 16 + Math.abs(py - 8) / 8 <= 0.92; }
function rngFrom(seed) { let a = seed; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// water: flat, slightly sunk, with an animated shimmer drawn per frame
export function drawWater(c, world, sx, sy, t, x, y) {
  const P = pal(world, 'water');
  c.fillStyle = P[0]; c.beginPath(); c.moveTo(sx + 16, sy + 2); c.lineTo(sx + 32, sy + 10); c.lineTo(sx + 16, sy + 18); c.lineTo(sx, sy + 10); c.fill();
  const ph = Math.sin(t * 2 + x * 0.9 + y * 0.6);
  c.fillStyle = P[4]; c.globalAlpha = 0.5 + 0.3 * ph;
  c.fillRect(sx + 9 + Math.round(ph * 3), sy + 8, 6, 1); c.fillRect(sx + 18 - Math.round(ph * 2), sy + 12, 5, 1);
  c.globalAlpha = 1;
}

// Pick the tile under a screen point (map-local pixel coords). heights(x,y) -> h or -1 for none.
export function pick(mx, my, w, h, heightAt) {
  let best = null;
  for (let hh = 6; hh >= 0; hh--) {
    // invert: sx = (x - y)*16, sy = (x + y)*8 - hh*8 + 8 (centre)
    const a = mx / 16, b = (my + hh * LH - 8) / 8; // a = x - y, b = x + y
    const fx = (a + b) / 2, fy = (b - a) / 2;
    const tx = Math.round(fx), ty = Math.round(fy);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const x = tx + dx, y = ty + dy;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (heightAt(x, y) !== hh) continue;
      const s = toScreen(x, y, hh);
      if (Math.abs(mx - (s.x)) / 16 + Math.abs(my - (s.y + 8)) / 8 <= 1.02) {
        if (!best || x + y > best.x + best.y) best = { x, y };
      }
    }
  }
  return best;
}
