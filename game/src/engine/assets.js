// Images: lazy loading by name, fur-ramp recolouring, Hum-blue eyes, and code placeholders while
// (or if) an image isn't there. Everything is drawn 1:1 at its native size.
const imgs = new Map();
let manifest = {};
export async function loadManifest() {
  try { manifest = await (await fetch('assets/manifest.json')).json(); } catch (_) { manifest = {}; }
}
export function has(kind, name) { return !!(manifest[kind] && manifest[kind][name]); }
export function manifestOf(kind) { return manifest[kind] || {}; }

export function image(path) {
  let e = imgs.get(path);
  if (!e) {
    e = { img: new Image(), ok: false, bad: false, p: null };
    e.p = new Promise(res => { e.img.onload = () => { e.ok = true; res(e.img); }; e.img.onerror = () => { e.bad = true; res(null); }; });
    e.img.src = path; imgs.set(path, e);
  }
  return e.ok ? e.img : null;
}
export function imageReady(path) { image(path); return imgs.get(path).p; }
export async function preload(paths) { await Promise.all(paths.map(p => imageReady(p))); }

// sprite(kind, name): kind = map | battle | small | big | kid
export function sprite(kind, name) {
  if (!has(kind, name)) return null;
  return image(`assets/sprites/${kind}/${name}.png`);
}
export function spritePath(kind, name) { return `assets/sprites/${kind}/${name}.png`; }
export function portrait(name) { return has('portraits', name) ? image(`assets/portraits/${name}.png`) : null; }
export function bg(name) { return has('bg', name) ? image(`assets/bg/${name}.png`) : null; }
export function prop(name) { return has('props', name) ? image(`assets/sprites/props/${name}.png`) : null; }
export function icon(name) { return has('icons', name) ? image(`assets/sprites/icons/${name}.png`) : null; }
// animation sheet: returns { img, fw, fh, n } or null
export function anim(kind, name) {
  const m = manifest['anim-' + kind]; if (!m || !m[name]) return null;
  const img = image(`assets/anims/${kind}/${name}.png`); if (!img) return null;
  const [fw, fh, n] = m[name]; return { img, fw, fh, n };
}

// ---- recolouring (fur ramps), cached per (image, ramp, flags)
const tintCache = new Map();
function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
let _rid = 0;
export function recolor(img, key, fn) {
  // canvases (e.g. a furRamp result) have no src: give each its own id so chained recolours don't share one cache entry
  const k = (img.src || img._rid || (img._rid = 'canvas#' + (++_rid))) + '|' + key;
  let c = tintCache.get(k); if (c) return c;
  c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height); fn(d.data, c.width, c.height); x.putImageData(d, 0, 0);
  c.src = k; tintCache.set(k, c); return c;
}
// map mid-tone fur colours onto a ramp (dark->light hex list); keep outline, eyes, whites, pinks
export function furRamp(img, ramp) {
  if (!ramp) return img;
  const R = ramp.map(rgb);
  return recolor(img, 'fur:' + ramp.join(','), (p) => {
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] === 0) continue;
      const r = p[i], g = p[i + 1], b = p[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, sat = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255) + 1);
      if (l < 50) continue;                       // outline and eyes
      if (l > 205 && sat < 0.35) continue;         // belly, tail, highlights
      if (r > 180 && b > 120 && g < r - 30) continue; // pink ears and nose
      const t = Math.min(0.999, Math.max(0, (l - 50) / 160));
      const f = t * (R.length - 1), j = Math.floor(f), u = f - j, A = R[j], B = R[Math.min(R.length - 1, j + 1)];
      p[i] = A[0] + (B[0] - A[0]) * u; p[i + 1] = A[1] + (B[1] - A[1]) * u; p[i + 2] = A[2] + (B[2] - A[2]) * u;
    }
  });
}
// tint toward a colour by amount (enemy tiers, Hum, dream-shapes)
export function tint(img, hex, amt) {
  const T = rgb(hex);
  return recolor(img, 'tint:' + hex + amt, p => { for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; for (let c = 0; c < 3; c++) p[i + c] = p[i + c] + (T[c] - p[i + c]) * amt; } });
}
// silhouette in one colour with alpha (hollow rabbits, shepherd, dream things)
export function silhouette(img, hex, alpha = 1) {
  const T = rgb(hex);
  return recolor(img, 'sil:' + hex + alpha, p => { for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const l = (p[i] + p[i + 1] + p[i + 2]) / 765; p[i] = T[0] * (0.7 + l * 0.6); p[i + 1] = T[1] * (0.7 + l * 0.6); p[i + 2] = T[2] * (0.7 + l * 0.6); p[i + 3] = 255 * alpha; } });
}
// Hum-taken eyes: the darkest pixels inside the face area that are surrounded by lighter fur become pale blue
export function humEyes(img) {
  return recolor(img, 'hum', (p, w, h) => {
    const at = (x, y) => (y * w + x) * 4;
    const lum = (i) => (p[i] + p[i + 1] + p[i + 2]) / 3;
    for (let y = 1; y < Math.floor(h * 0.6); y++) for (let x = 1; x < w - 1; x++) {
      const i = at(x, y); if (!p[i + 3] || lum(i) > 60) continue;
      // an eye pixel has opaque neighbours on all four sides (it's inside the head, not the outline)
      let inside = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = at(x + dx, y + dy); if (!p[j + 3]) inside = false; }
      if (!inside) continue;
      let lighter = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = at(x + dx, y + dy); if (lum(j) > 90) lighter++; }
      if (lighter >= 2) { p[i] = 0xBF; p[i + 1] = 0xE3; p[i + 2] = 0xF0; }
    }
  });
}
// mirrored copy
const flipCache = new Map();
export function flipped(img) {
  if (!img) return null;
  const k = img.src || img; let c = flipCache.get(img); if (c) return c;
  c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.translate(img.width, 0); x.scale(-1, 1); x.drawImage(img, 0, 0);
  flipCache.set(img, c); return c;
}
// Placeholder: a soft coloured blob with a face, sized like the sprite would be
const phCache = new Map();
export function placeholder(w, h, hex = '#8a6a4a') {
  const k = w + 'x' + h + hex; let c = phCache.get(k); if (c) return c;
  c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = '#3e2a1e'; x.beginPath(); x.ellipse(w / 2, h * 0.62, w * 0.36, h * 0.36, 0, 0, 7); x.fill();
  x.fillStyle = hex; x.beginPath(); x.ellipse(w / 2, h * 0.62, w * 0.36 - 1, h * 0.36 - 1, 0, 0, 7); x.fill();
  x.fillStyle = '#2a1c14'; x.fillRect(Math.round(w * 0.38), Math.round(h * 0.52), 2, 2); x.fillRect(Math.round(w * 0.58), Math.round(h * 0.52), 2, 2);
  phCache.set(k, c); return c;
}
