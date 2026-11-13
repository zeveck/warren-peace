// Boot, scaling, the fixed-step loop and the layer compositor.
import { G, W, H, ui, hits, topScene, findScene, tickWaiters, pushScene, noLig, setTextScale } from './core.js';
import { input, initInput } from './engine/input.js';
import { audio } from './engine/audio.js';
import { loadSettings } from './engine/save.js';
import { loadManifest, preload } from './engine/assets.js';
import { panel } from './engine/gfx.js';
import { P } from './data/core/palette.js';
import { loadData } from './data/index.js';
import { installHook } from './hook.js';
import { TitleScene } from './screens/title.js';

const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H;
const px = off.getContext('2d');
let K = 1, OX = 0, OY = 0, DPR = 1, CW = 0, CH = 0;

function resize() {
  DPR = window.devicePixelRatio || 1;
  const cw = window.innerWidth, ch = window.innerHeight;
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  CW = Math.round(cw * DPR); CH = Math.round(ch * DPR);
  canvas.width = CW; canvas.height = CH;
  // whole-number scale when it gives 2x or more, else a fractional fit
  const fit = Math.min(CW / W, CH / H);
  K = fit >= 2 ? Math.floor(fit) : fit;
  OX = Math.floor((CW - W * K) / 2); OY = Math.floor((CH - H * K) / 2);
  setTextScale(K);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
resize();

input.toLogical = (cx, cy) => {
  const x = (cx * DPR - OX) / K, y = (cy * DPR - OY) / K;
  return { x, y, inside: x >= 0 && y >= 0 && x < W && y < H };
};
input.onFirstInput = () => audio.unlock();
export const view = { get K() { return K; }, get OX() { return OX; }, get OY() { return OY; }, get DPR() { return DPR; } };

// ---- drawing: each scene layer draws pixels into `px`, which is blitted, then its queued text.
function flushText() {
  for (const t of ui.q) {
    const o = t.o, size = (o.size || 10) * K;
    ctx.font = `${o.bold ? 'bold ' : ''}${Math.round(size)}px Pixelify, monospace`;
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    const x = OX + t.x * K, y = OY + t.y * K;
    const str = noLig(String(t.str));
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.shadow !== false) { ctx.fillStyle = o.shadow || 'rgba(18,14,24,0.85)'; fillText5(str, x + Math.max(1, K * 0.5), y + Math.max(1, K * 0.5), size); }
    ctx.fillStyle = o.color || P.chalk; fillText5(str, x, y, size);
  }
  ctx.globalAlpha = 1; ui.q.length = 0;
}
// Pixelify Sans' 5 has a curled top and reads as an S at our sizes ("2S buttons"): draw every other character with
// the font and the 5s as a flat-topped pixel 5 in the same advance, so numbers read right and the font is unchanged
// two drawings of the 5 (7 rows, and 5 rows for small text), the one whose height best matches the font's digits
const FIVES = [['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'], ['####', '#...', '###.', '...#', '###.']];
function fiveFor(size) {
  const hd = size * 0.65; let best = null;
  for (const g of FIVES) { const u = Math.max(1, Math.round(hd / g.length)), err = Math.abs(g.length * u - hd); if (!best || err < best.err - 0.01) best = { g, u, err }; }
  return best;
}
function fillText5(str, x, y, size) {
  if (str.indexOf('5') < 0) { ctx.fillText(str, x, y); return; }
  const align = ctx.textAlign, total = ctx.measureText(str).width;
  let cx = align === 'center' ? x - total / 2 : align === 'right' || align === 'end' ? x - total : x;
  ctx.textAlign = 'left';
  const { g: FIVE, u } = fiveFor(size), cols = FIVE[0].length, rows = FIVE.length, adv = ctx.measureText('5').width, gx0 = Math.round((adv - cols * u) / 2);
  for (const part of str.split(/(5)/)) {
    if (!part) continue;
    if (part === '5') {
      const gx = Math.round(cx) + gx0, gy = Math.round(y) - rows * u;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) if (FIVE[r][k] === '#') ctx.fillRect(gx + k * u, gy + r * u, u, u);
      cx += adv;
    } else { ctx.fillText(part, cx, y); cx += ctx.measureText(part).width; }
  }
  ctx.textAlign = align;
}
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0c0a10'; ctx.fillRect(0, 0, CW, CH);
  ctx.imageSmoothingEnabled = false;
  hits.list.length = 0;
  // find the lowest scene that needs drawing (the top opaque one)
  let start = 0;
  for (let i = G.scenes.length - 1; i >= 0; i--) if (G.scenes[i].opaque) { start = i; break; }
  for (let i = start; i < G.scenes.length; i++) {
    const s = G.scenes[i];
    G.drawingTop = i === G.scenes.length - 1;
    if (G.drawingTop) hits.list.length = 0;  // only the top scene's buttons count
    px.setTransform(1, 0, 0, 1, 0, 0); px.clearRect(0, 0, W, H); px.imageSmoothingEnabled = false;
    s.draw(px, i === G.scenes.length - 1);
    ctx.drawImage(off, 0, 0, W, H, OX, OY, W * K, H * K);
    flushText();
  }
  // toast
  if (G.flash) {
    px.clearRect(0, 0, W, H);
    const w = Math.min(400, ui.measure(G.flash.msg, 10) + 24);
    panel(px, (W - w) / 2, 8, w, 22);
    ui.text(G.flash.msg, W / 2, 23, { align: 'center', size: 10 });
    ctx.drawImage(off, 0, 0, W, H, OX, OY, W * K, H * K); flushText();
  }
}

// ---- loop: fixed 60 Hz updates with an accumulator; huge gaps clamped
const STEP = 1 / 60;
let acc = 0, last = performance.now();
G.speed = 1;   // test helper multiplier is never used by solutions; kept at 1
function frame(now) {
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.25) dt = 0.25;
  acc += dt;
  let n = 0, mp = null, rel = null;
  while (acc >= STEP && n < 8) {
    update(STEP); acc -= STEP; n++;
    if (n === 1) { mp = input.mouse.pressed.slice(); rel = input.mouse.released.slice(); }
    input.endKeys();
  }
  if (n === 8) acc = 0;
  // mouse presses stay visible to the drawing pass (buttons are hit-tested while drawn), then clear
  if (mp) { input.mouse.pressed = mp; input.mouse.released = rel; }
  draw();
  if (n > 0) input.endMouse();
  requestAnimationFrame(frame);
}
function update(dt) {
  G.time += dt; G.frame++;
  if (G.s && !G.paused) G.s.playTime = (G.s.playTime || 0) + dt;
  const top = topScene();
  // global keys: mute
  if (input.isPressed('KeyM') && !(top && top.ownsKey && top.ownsKey('KeyM'))) {
    G.settings.mute = !G.settings.mute; audio.applyVolumes();
    import('./engine/save.js').then(m => m.saveSettings());
    input.eat('KeyM');
  }
  if (G.flash) { G.flash.t -= dt; if (G.flash.t <= 0) G.flash = null; }
  tickWaiters(dt);
  for (const s of [...G.scenes]) if (s.tick) s.tick(dt, s === top);
  if (top && top.update) top.update(dt);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { const t = topScene(); t && t.onBlur && t.onBlur(); audio.duck(true); }
  else if (!findScene('pause')) audio.duck(false);   // back from another tab: un-duck unless the pause menu is open
});
window.addEventListener('blur', () => { const t = topScene(); t && t.onBlur && t.onBlur(); });

async function boot() {
  loadSettings();
  initInput(canvas);
  // the loading screen shows once its font is in (or after 2 s), so its words never pop in after the bar
  const showBoot = () => { const b = document.getElementById('boot'); if (b) b.style.visibility = 'visible'; };
  document.fonts.load('20px Pixelify').then(showBoot, showBoot); setTimeout(showBoot, 2000);
  const fill = document.getElementById('bootfill');
  fill.style.width = '15%';
  await Promise.all([loadManifest(), document.fonts.load('20px Pixelify').catch(() => null)]);
  fill.style.width = '40%';
  G.data = await loadData();
  fill.style.width = '70%';
  await preload(['assets/bg/bg-title.png', 'assets/sprites/map/bramble-se.png']).catch(() => null);
  fill.style.width = '100%';
  installHook();
  // index.html applies a waiting service-worker update only while this says the title screen is up and no game is loaded
  window.__wpOnTitle = () => { const t = topScene(); return !G.s && !!t && t.kind === 'title' && !t.leaving; };
  pushScene(new TitleScene());
  document.getElementById('boot').remove();
  canvas.focus();
  requestAnimationFrame(t => { last = t; frame(t); });
}
boot();
