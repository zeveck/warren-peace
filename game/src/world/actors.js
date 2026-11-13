// Drawing characters on the map: picks the right still, back view, mirror or hop frame for each actor.
import { sprite, anim, flipped, furRamp, humEyes, silhouette, tint, placeholder } from '../engine/assets.js';
import { FUR } from '../data/core/palette.js';
import { PARTY } from '../data/core/party.js';

export const DIRS = { se: [1, 0], sw: [0, 1], ne: [0, -1], nw: [-1, 0] };
export const dirOf = (dx, dy) => dx > 0 ? 'se' : dx < 0 ? 'nw' : dy > 0 ? 'sw' : 'ne';
const LEFT = { sw: 1, nw: 1 }, BACK = { ne: 1, nw: 1 };
export const FLAP = { 'lantern-moth': 'anim-moth-flutter', wick: 'anim-moth-flutter', 'monkey-king': 'anim-monkey-flap' };
const GENERIC = { 'rabbit-buck': 'rabbit', 'rabbit-doe': 'rabbit', 'rabbit-kit': 'rabbit', raider: 'raider', 'hum-digger': null };

function look(img, a) {
  if (!img) return img;
  if (a.fur && FUR[a.fur]) img = furRamp(img, FUR[a.fur]);
  if (a.look === 'hollow') img = silhouette(img, '#3a3a7a', 0.72);
  else if (a.look === 'dream') img = silhouette(img, '#6a4a8a', 0.8);
  else if (a.look === 'shadow') img = silhouette(img, '#1a1622', 0.9);
  if (a.hum) img = humEyes(img);
  if (a.tintCol) img = tint(img, a.tintCol, a.tintAmt || 0.3);
  return img;
}

// Returns { img, ox, oy, sx, sy } where (ox, oy) is the pixel offset from the actor's foot point; scale is never used.
// a: actor { sprite, facing, size, hopT (0..1 or -1), kind, fur, hum, look }
export function actorFrame(a) {
  const f = a.facing || 'se';
  const kind = a.size === 'small' ? 'small' : a.size === 'big' ? 'big' : (a.kid ? 'map' : 'map');
  let img = null, flip = false, codeHop = true;
  if (a.sprite === 'bramble') {
    codeHop = false;
    const hop = a.hopT >= 0 ? anim(kind, 'anim-bramble-hop-' + f) : null;
    if (hop) { const n = hop.n, i = Math.min(n - 1, Math.floor(a.hopT * n)); img = frame(hop, i, 'bramble' + kind + f + i); }
    else if (a.nibbleT >= 0) { const nb = anim('map', 'anim-bramble-nibble'); if (nb && kind === 'map') img = frame(nb, Math.floor(a.nibbleT * nb.n * 2) % nb.n, 'bnib' + Math.floor(a.nibbleT * nb.n * 2) % nb.n); }
    if (!img) {
      img = sprite(kind, 'bramble-' + f);
      if (!img) { // fall back to mirrors of what exists
        const alt = { sw: 'se', nw: 'ne', se: 'sw', ne: 'nw' }[f];
        const m = sprite(kind, 'bramble-' + alt); if (m) { img = m; flip = true; }
        else { img = sprite(kind, 'bramble-se'); flip = !!LEFT[f]; }
      }
      if (a.hopT >= 0) codeHop = true;
      else if (a.idleT >= 0 && f === 'se' && kind === 'map') { const id = anim('map', 'anim-bramble-idle'); if (id) { img = frame(id, Math.floor(a.idleT * id.n) % id.n, 'bidle' + Math.floor(a.idleT * id.n) % id.n); flip = false; } }
    }
  } else {
    const g = GENERIC[a.sprite];
    const back = !!BACK[f];
    const k = a.kid ? 'kid' : 'map';
    if (g && a.hopT >= 0) {
      const hop = anim(k, `anim-${g}-hop-${back ? 'ne' : 'se'}`) || anim('map', `anim-${g}-hop-${back ? 'ne' : 'se'}`);
      if (hop) { const i = Math.min(hop.n - 1, Math.floor(a.hopT * hop.n)); img = frame(hop, i, g + k + back + i); codeHop = false; }
    }
    const flap = FLAP[a.sprite];
    if (!img && flap) { const sh = anim('map', flap); if (sh) { const i = Math.floor(performance.now() / 120) % sh.n; img = frame(sh, i, flap + i); codeHop = false; } }
    if (!img) {
      const base = a.sprite === 'rabbit-doe' || a.sprite === 'rabbit-kit' ? a.sprite : a.sprite;
      if (back) img = sprite('map', base + '-back') || (g ? sprite('map', 'rabbit-buck-back') : null);
      if (!img) img = sprite('map', base);
    }
    // mirror: front views face down-right (se) and back views face up-right (ne); left facings mirror
    flip = !!LEFT[f];
  }
  if (!img) {
    const big = PARTY[a.sprite] && PARTY[a.sprite].big;
    img = placeholder(big ? 30 : 20, big ? 40 : 28, a.kind === 'enemy' ? '#9a5a5a' : '#a08060');
  }
  img = look(img, a);
  if (flip) img = flipped(img);
  return { img, codeHop };
}
const frameCache = new Map();
export function frame(sheet, i, key) {
  const k = sheet.img.src + '#' + i;
  let c = frameCache.get(k); if (c) return c;
  c = document.createElement('canvas'); c.width = sheet.fw; c.height = sheet.fh;
  c.getContext('2d').drawImage(sheet.img, i * sheet.fw, 0, sheet.fw, sheet.fh, 0, 0, sheet.fw, sheet.fh);
  c.src = k; frameCache.set(k, c); return c;
}

// Draw at foot point (fx, fy) in screen pixels with a code hop (squash/stretch + arc) when needed.
// hopT: -1 when standing; 0..1 during a hop. bob: idle bob for enemies. alpha, scaleMerge (0..1 shrink into Bramble).
export function drawActor(c, a, fx, fy, o = {}) {
  const { img, codeHop } = actorFrame(a);
  let w = img.width, h = img.height, x = fx - w / 2, y = fy - h + 2;
  let sx = 1, sy = 1, lift = 0;
  if (a.hopT >= 0) {
    const t = a.hopT;
    lift = Math.sin(t * Math.PI) * (a.size === 'big' ? 10 : a.size === 'small' ? 4 : 7);
    if (codeHop) { if (t < 0.15) { sy = 0.85; sx = 1.12; } else if (t < 0.6) { sy = 1.1; sx = 0.92; } else if (t > 0.88) { sy = 0.88; sx = 1.1; } }
  } else if (o.bob) { lift = Math.round(Math.sin(o.bob) * 1); }
  const m = o.merge || 0;
  if (m > 0) { sx *= 1 - m; sy *= 1 - m; }
  const k = a.scale || 1;   // a.scale: whole-number upscale for giant figures (dream Nightmares)
  if (k !== 1) { sx *= k; sy *= k; }
  if (sx <= 0.02 || sy <= 0.02) return;
  c.save();
  if (o.alpha !== undefined) c.globalAlpha = o.alpha;
  // shadow
  c.fillStyle = 'rgba(30,20,30,0.28)';
  const sw = Math.max(6, Math.round(w * k * 0.5 * (1 - lift / 20) * (1 - m)));
  c.fillRect(Math.round(fx - sw / 2), Math.round(fy - 1), sw, 2); c.fillRect(Math.round(fx - sw / 2 + 1), Math.round(fy - 2), sw - 2, 4);
  if (sx === 1 && sy === 1) c.drawImage(img, Math.round(x), Math.round(y - lift));
  else {
    const dw = Math.round(w * sx), dh = Math.round(h * sy);
    c.drawImage(img, Math.round(fx - dw / 2), Math.round(fy - dh + 2 - lift), dw, dh);
  }
  c.restore();
  if (k !== 1) { const dw = Math.round(w * k), dh = Math.round(h * k); return { x: Math.round(fx - dw / 2), y: Math.round(fy - dh + 2 - lift), w: dw, h: dh }; }
  return { x: Math.round(x), y: Math.round(y - lift), w, h };
}
