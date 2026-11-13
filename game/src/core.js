// Shared core: screen size, the scene stack, the UI text queue, and the global game object.
export const W = 640, H = 360;

// G holds everything about the current game and session. Save data lives in G.s (see save.js).
export const G = {
  s: null,          // the save state (flags, party, items, ...), set by newGame()/load
  settings: null,   // settings (separate from saves)
  scenes: [],       // scene stack; the top scene gets input
  time: 0,          // seconds since boot (real time, for animation)
  frame: 0,
  debug: typeof location !== 'undefined' && new URLSearchParams(location.search).has('debug'),
  data: null,       // merged data registries (data/index.js)
  flash: null,      // short toast messages
};

// Full-screen covers (intro and story pictures, chapter cards, the title) set cover = true. When one closes, the
// next cover usually arrives a frame or more later (a script continues after the frame is drawn, or loads a module or
// a map first), and for those frames whatever was underneath (the map) would flash through. So the closed cover keeps
// being drawn, frozen, until another cover opens or HOLD_FRAMES pass (main.js draw()).
export const HOLD_FRAMES = 20;
// Boxes that come one after another (dialog lines) set lingers = true: a closed box stays drawn for a few frames
// unless the next box opens, so it doesn't blink off between lines.
export const LINGER_FRAMES = 3;
export function pushScene(s) { if (s.cover) G.hold = null; G.linger = null; G.scenes.push(s); s.enter && s.enter(); return s; }
export function popScene(s) {
  const i = s ? G.scenes.lastIndexOf(s) : G.scenes.length - 1;
  if (i < 0) return;
  const [gone] = G.scenes.splice(i, 1);
  if (gone.cover) G.hold = { scene: gone, frames: 0 };
  if (gone.lingers) G.linger = { scene: gone, frames: 0 };
  gone.exit && gone.exit();
  const top = G.scenes[G.scenes.length - 1];
  top && top.resume && top.resume();
}
export function replaceScenes(s) { while (G.scenes.length) popScene(); return pushScene(s); }
export function topScene() { return G.scenes[G.scenes.length - 1]; }
export function findScene(kind) { for (let i = G.scenes.length - 1; i >= 0; i--) if (G.scenes[i].kind === kind) return G.scenes[i]; return null; }

// ---- UI text layer: queued per layer, drawn crisp on the full-resolution canvas after the pixel layer.
export const ui = {
  q: [],
  // opts: size (logical px, default 10), color, align ('left'|'center'|'right'), shadow (colour or false), alpha, bold
  text(str, x, y, opts = {}) { this.q.push({ str: String(str), x, y, o: opts }); },
  // measure in logical px
  // measured at the size it is drawn (fonts hint wider at small pixel sizes), so boxes fit their text at every scale
  measure(str, size = 10) { const px = Math.max(1, Math.round(size * MEASURE_K)); return measureCtx(px).measureText(noLig(String(str))).width / (px / size); },
  // word-wrap to lines that fit maxW logical px
  // balance: even out the lines (no lone last word), like CSS text-wrap: balance
  wrap(str, maxW, size = 10, balance = false) {
    if (balance) {
      const n = this.wrap(str, maxW, size).length;
      if (n < 2) return this.wrap(str, maxW, size);
      let lo = maxW / n, hi = maxW;
      for (let k = 0; k < 10; k++) { const mid = (lo + hi) / 2; if (this.wrap(str, mid, size).length > n) lo = mid; else hi = mid; }
      return this.wrap(str, hi, size);
    }
    const out = [];
    for (const para of String(str).split('\n')) {
      const words = para.split(' '); let line = '';
      for (const w of words) {
        const t = line ? line + ' ' + w : w;
        if (this.measure(t, size) > maxW && line) { out.push(line); line = w; } else line = t;
      }
      out.push(line);
    }
    return out;
  },
};
let MEASURE_K = 2;   // the draw scale (main.js sets it on resize)
export function setTextScale(k) { MEASURE_K = Math.max(1, k); }
// Pixelify Sans has ligatures that read wrong at pixel sizes ("fi" looks like "A", "No." becomes a numero sign):
// a zero-width non-joiner between the letters stops them.
export function noLig(str) { return str.indexOf('f') < 0 && str.indexOf('No') < 0 ? str : str.replace(/f(?=[fil])/g, 'f\u200C').replace(/No(?=\.)/g, 'No\u200C'); }
let _mc = null;
function measureCtx(px) {
  if (!_mc) _mc = document.createElement('canvas').getContext('2d');
  _mc.font = `${px}px Pixelify, monospace`;
  return _mc;
}

// Pressable regions for the debug hook and for mouse hit-testing: rebuilt every frame by the scenes.
export const hits = { list: [], add(label, x, y, w, h, fn, extra) { this.list.push({ label, x, y, w, h, fn, ...extra }); } };

export function toast(msg, secs = 2.2) { G.flash = { msg, t: secs }; }

// Small deterministic RNG (mulberry32) and string hash, for seeded randomness.
export function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed) {
  let a = typeof seed === 'string' ? hashStr(seed) : seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const sleep = (secs) => new Promise(r => waiters.push({ t: secs, r }));
// sleep() is driven by the game clock (so it pauses with the game and runs at the same rate in tests)
export const waiters = [];
export function tickWaiters(dt) {
  for (let i = waiters.length - 1; i >= 0; i--) { const w = waiters[i]; w.t -= dt; if (w.t <= 0) { waiters.splice(i, 1); w.r(); } }
}
