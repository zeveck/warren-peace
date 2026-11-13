// Button prompts that follow the last used device. On the keyboard every prompt draws exactly what it drew before;
// with a controller it draws code-made button glyphs (PlayStation or Xbox) in the palette, each followed by a word.
import { G, ui } from '../core.js';
import { P } from '../data/core/palette.js';
import { input } from './input.js';
import { keyHint } from './gfx.js';
import { audio } from './audio.js';

// a controller press may not count as the click browsers want before they play sound: after a pad has been used for
// a second with the sound still locked, a line asks for one click or key
export const SOUND_HINT = 'Click or press a key once for sound.';
export function soundLocked() {
  if (!input.padSeen || !input.padSeenAt || performance.now() - input.padSeenAt < 1000) return false;
  const ctx = audio.ctx; return !ctx || ctx.state !== 'running';
}

const OUT = '#120e18', FILL = '#4a3e5a';
// an 11 px disc (row widths), drawn from the top-left of a 12 px cell
const DISC = [5, 7, 9, 11, 11, 11, 11, 11, 9, 7, 5];
const PS_SYM = {
  cross: { col: P.pluck, px: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'] },
  circle: { col: P.heart, px: ['.###.', '#...#', '#...#', '#...#', '.###.'] },
  square: { col: '#e8a0b8', px: ['#####', '#...#', '#...#', '#...#', '#####'] },
  triangle: { col: P.emerald, px: ['..#..', '..#..', '.#.#.', '.#.#.', '#####'] },
};
const XB = { cross: ['A', P.emerald], circle: ['B', P.red], square: ['X', P.pluck], triangle: ['Y', P.gold] };
const SHOULDER = { l1: ['L1', 'LB'], r1: ['R1', 'RB'], l2: ['L2', 'LT'], r2: ['R2', 'RT'] };

function disc(c, x, y, fill) {
  DISC.forEach((w, j) => { c.fillStyle = OUT; c.fillRect(x + (11 - w) / 2, y + j, w, 1); });
  DISC.forEach((w, j) => { if (j === 0 || j === 10) return; const iw = Math.max(1, w - 2); c.fillStyle = fill; c.fillRect(x + (11 - iw) / 2, y + j, iw, 1); });
}
function pill(c, x, y, w) {
  c.fillStyle = OUT; c.fillRect(x + 1, y + 1, w - 2, 10); c.fillRect(x, y + 2, w, 8);
  c.fillStyle = FILL; c.fillRect(x + 1, y + 2, w - 2, 8);
}

// one glyph with its top-left at (x, y), 12 px tall; returns its width
export function glyph(c, name, x, y) {
  x = Math.round(x); y = Math.round(y);
  const ps = input.padKind === 'ps';
  if (PS_SYM[name]) {
    disc(c, x, y, FILL);
    if (ps) { const s = PS_SYM[name]; c.fillStyle = s.col; s.px.forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === '#') c.fillRect(x + 3 + i, y + 3 + j, 1, 1); }); }
    else { const [l, col] = XB[name]; ui.text(l, x + 5.5, y + 9, { align: 'center', size: 8, color: col, shadow: false, bold: true }); }
    return 11;
  }
  if (SHOULDER[name]) { const t = SHOULDER[name][ps ? 0 : 1]; pill(c, x, y, 16); ui.text(t, x + 8, y + 9, { align: 'center', size: 7, color: P.chalk, shadow: false }); return 16; }
  if (name === 'l1r1') { const a = glyph(c, 'l1', x, y); return a + 1 + glyph(c, 'r1', x + a + 1, y); }
  if (name === 'options') { pill(c, x, y, 14); c.fillStyle = P.chalk; for (let k = 0; k < 3; k++) c.fillRect(x + 4, y + 3 + k * 2, 6, 1); return 14; }
  if (name === 'create') { pill(c, x, y, 14); c.fillStyle = P.chalk; c.fillRect(x + 3, y + 3, 4, 4); c.fillStyle = FILL; c.fillRect(x + 4, y + 4, 2, 2); c.fillStyle = P.chalk; c.fillRect(x + 7, y + 5, 4, 4); return 14; }
  if (name === 'lstick' || name === 'rstick' || name === 'l3' || name === 'r3') {
    disc(c, x, y, FILL); c.fillStyle = '#6b5a7e'; c.fillRect(x + 2, y + 5, 7, 1);
    ui.text(name[0] === 'l' ? 'L' : 'R', x + 5.5, y + 9, { align: 'center', size: 7, color: P.chalk, shadow: false });
    if (name.endsWith('3')) { c.fillStyle = P.gold; c.fillRect(x + 9, y, 2, 2); }
    return 11;
  }
  if (name.startsWith('dpad')) {
    const arm = name.split('-')[1];
    c.fillStyle = OUT; c.fillRect(x + 3, y + 1, 5, 11); c.fillRect(x, y + 4, 11, 5);
    c.fillStyle = P.chalk; c.fillRect(x + 4, y + 2, 3, 9); c.fillRect(x + 1, y + 5, 9, 3);
    c.fillStyle = P.gold;
    if (arm === 'up') c.fillRect(x + 4, y + 2, 3, 3); if (arm === 'down') c.fillRect(x + 4, y + 8, 3, 3);
    if (arm === 'left') c.fillRect(x + 1, y + 5, 3, 3); if (arm === 'right') c.fillRect(x + 7, y + 5, 3, 3);
    c.fillStyle = FILL; c.fillRect(x + 5, y + 6, 1, 1);
    return 11;
  }
  return 0;
}

export const padOn = () => input.device === 'pad';

// width of a pad hint line: items [[glyph, label], ...]
function itemsWidth(items, size) {
  let w = 0;
  items.forEach(([g, label], i) => { w += glyphW(g) + (label ? 3 + ui.measure(label, size) : 0) + (i < items.length - 1 ? 9 : 0); });
  return w;
}
function glyphW(g) { return SHOULDER[g] ? 16 : g === 'l1r1' ? 33 : g === 'options' || g === 'create' ? 14 : 11; }

// A prompt line. spec: { kb: 'the exact keyboard text' (or a function (c) drawing it), pad: [[glyph, label], ...] }
// y is the text baseline, as for ui.text; o: the text options (size, color, align). Logged in G.hintLog.
export function hint(c, x, y, spec, o = {}) {
  const log = G.hintLog || (G.hintLog = []);
  if (!padOn() || !spec.pad) {
    if (typeof spec.kb === 'function') spec.kb(c); else if (spec.kb) ui.text(spec.kb, x, y, o);
    if (typeof spec.kb === 'string') log.push(spec.kb); else if (spec.kbLog) log.push(spec.kbLog);
    return;
  }
  const size = o.size || 8, items = spec.pad;
  const w = itemsWidth(items, size);
  let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  if (spec.back) { c.fillStyle = spec.back; c.fillRect(Math.round(cx) - 4, y - 11, Math.round(w) + 8, 14); }
  for (const [g, label] of items) {
    cx += glyph(c, g, cx, y - 9);
    if (label) { cx += 3; ui.text(label, cx, y, { ...o, align: 'left', size }); cx += ui.measure(label, size); }
    cx += 9;
  }
  log.push(items.map(([g, l]) => `[${g}]${l ? ' ' + l : ''}`).join(' '));
}

// the keyHint chip ([Space]) or the pad glyph; returns the width. Hidden by the Key hints setting either way.
export function chip(c, key, padGlyph, x, y) {
  if (G.settings && G.settings.keyHints === false) return 0;
  if (padOn()) { (G.hintLog || (G.hintLog = [])).push(`[${padGlyph}]`); return glyph(c, padGlyph, x, y); }
  (G.hintLog || (G.hintLog = [])).push(`[${key}]`);
  return keyHint(c, key, x, y);
}
