// Code-drawn UI pieces in the palette: panels, buttons, bars, icons, portraits frames.
import { ui, hits, G } from '../core.js';
import { P } from '../data/core/palette.js';
import { icon, portrait, placeholder } from './assets.js';
import { input } from './input.js';
import { audio } from './audio.js';

// A panel: dark fill, a 1px light inner line, a 1px bark outline, rounded corners.
export function panel(c, x, y, w, h, o = {}) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const fill = o.fill || P.panel, edge = o.edge || '#6b5a7e', out = o.out || '#120e18';
  c.fillStyle = out; c.fillRect(x + 1, y, w - 2, h); c.fillRect(x, y + 1, w, h - 2);
  c.fillStyle = edge; c.fillRect(x + 2, y + 1, w - 4, h - 2); c.fillRect(x + 1, y + 2, w - 2, h - 4);
  c.fillStyle = fill; c.fillRect(x + 2, y + 2, w - 4, h - 4);
  if (o.shine !== false) { c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 2, y + 2, w - 4, 1); }
}
export function paper(c, x, y, w, h) { panel(c, x, y, w, h, { fill: P.paper, edge: '#c8b48c', out: P.bark }); }

// A button: draws, registers a hit region, returns true when clicked (or chosen by keyboard: sel === true and act pressed)
export function button(c, label, x, y, w, h, o = {}) {
  const m = input.mouse;
  const over = G.drawingTop && m.inside && m.x >= x && m.x < x + w && m.y >= y && m.y < y + h;
  // selected (o.sel): gold edge, raised fill. Hovered but not selected: a lighter fill and a pale lilac edge, never
  // gold, so a hovered tab never looks like a second selected one.
  const sel = !!o.sel, hov = over && !sel;
  const disabled = !!o.disabled;
  panel(c, x, y, w, h, { fill: disabled ? '#2a2430' : sel ? '#5a4a72' : hov ? '#453a58' : (o.fill || P.panel2), edge: disabled ? '#6b5a7e' : sel ? P.gold : hov ? '#b0a2c8' : '#6b5a7e' });
  if (hov && !disabled) { c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(Math.round(x) + 2, Math.round(y) + 2, Math.round(w) - 4, 1); }
  if (o.icon) { const ic = icon(o.icon); if (ic) c.drawImage(ic, Math.round(label ? x + 4 : x + (w - ic.width) / 2), Math.round(y + (h - ic.height) / 2)); }   // icon-only buttons centre it
  ui.text(label, x + (o.icon ? 22 + (w - 22) / 2 : w / 2), y + h / 2 + 3.5, { align: 'center', size: o.size || 10, color: disabled ? '#7a7084' : sel || hov ? '#fff6d8' : P.chalk });
  if (G.drawingTop) hits.add(o.hitLabel || label, x, y, w, h, null, { disabled });
  if (disabled) return false;
  if (G.drawingTop && input.clickIn(x, y, w, h)) { input.mouse.pressed[0] = false; audio.synth('confirm'); return true; }
  return false;
}
export function mouseIn(x, y, w, h) { const m = input.mouse; return m.inside && m.x >= x && m.x < x + w && m.y >= y && m.y < y + h; }
// a click this frame that went down inside the box (see input.clickIn)
export function clickIn(x, y, w, h) { return G.drawingTop && input.clickIn(x, y, w, h); }

export function bar(c, x, y, w, h, frac, col, back = '#1a141f') {
  frac = Math.max(0, Math.min(1, frac || 0));
  c.fillStyle = '#120e18'; c.fillRect(x - 1, y - 1, w + 2, h + 2);
  c.fillStyle = back; c.fillRect(x, y, w, h);
  c.fillStyle = col; c.fillRect(x, y, Math.round(w * frac), h);
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x, y, Math.round(w * frac), 1);
}

// icon by name, or a small code glyph fallback
export function drawIcon(c, name, x, y, size = 16) {
  const ic = icon(name);
  if (ic) { c.drawImage(ic, Math.round(x), Math.round(y)); return; }
  c.fillStyle = '#120e18'; c.fillRect(x + 2, y + 2, size - 4, size - 4);
  c.fillStyle = P.meadow; c.fillRect(x + 3, y + 3, size - 6, size - 6);
}

// icon fitted into a box x 'box' square, centred: 16 px icons are scaled up and 24 px ones down to the same size,
// so a list of mixed icons lines up (shop rows)
export function drawIconFit(c, name, x, y, box = 20) {
  const ic = icon(name);
  if (!ic) { drawIcon(c, name, x + (box - 16) / 2, y + (box - 16) / 2); return; }
  const k = box / Math.max(ic.width, ic.height), w = Math.round(ic.width * k), h = Math.round(ic.height * k);
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  c.drawImage(ic, Math.round(x + (box - w) / 2), Math.round(y + (box - h) / 2), w, h);
  c.imageSmoothingEnabled = sm;
}

// portrait in an 84x84 frame
export function drawPortrait(c, name, x, y, o = {}) {
  panel(c, x, y, 84, 84, { fill: o.fill || '#d8ccb0', edge: '#c8b48c', out: P.bark });
  const img = portrait('por-' + name) || portrait(name);
  if (img) { if (o.flip) { c.save(); c.translate(x + 2 + 80, y + 2); c.scale(-1, 1); c.drawImage(img, 0, 0); c.restore(); } else c.drawImage(img, x + 2, y + 2); }
  else c.drawImage(placeholder(80, 80, '#a08060'), x + 2, y + 2);
}
// small portrait (40x40 crop of the 80x80, for the HUD and lists)
export function drawFace(c, name, x, y, size = 32) {
  const img = portrait('por-' + name) || portrait(name);
  c.fillStyle = P.bark; c.fillRect(x - 1, y - 1, size + 2, size + 2);
  c.fillStyle = '#d8ccb0'; c.fillRect(x, y, size, size);
  if (img) c.drawImage(img, 12, 6, 56, 56, x, y, size, size);
  else c.drawImage(placeholder(size, size, '#a08060'), x, y);
}

// key hint chip, like [Space]
export function keyHint(c, key, x, y) {
  if (G.settings && G.settings.keyHints === false) return 0;
  const w = Math.max(14, ui.measure(key, 8) + 8);
  c.fillStyle = '#120e18'; c.fillRect(x, y, w, 12); c.fillStyle = '#4a3e5a'; c.fillRect(x + 1, y + 1, w - 2, 10);
  ui.text(key, x + w / 2, y + 9, { align: 'center', size: 8, color: P.chalk, shadow: false });
  return w;
}

// soft fade overlay
export function fade(c, a, col = '#000') { if (a <= 0) return; c.globalAlpha = Math.min(1, a); c.fillStyle = col; c.fillRect(0, 0, 640, 360); c.globalAlpha = 1; }
