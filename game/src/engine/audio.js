// Web Audio: music with loop windows and crossfades, one-shot sfx with pitch jitter, ambience loops,
// voice lines, code-synth blips, and a thump scheduler for the finale.
import { G } from '../core.js';
import { LOOPS } from '../data/core/audio-loops.js';

let ctx = null, master, musicBus, sfxBus, voiceBus, ambBus;
const buffers = new Map(), loading = new Map();
let music = null;            // { id, gain, segs, buf, ls, le, tail, dead }: the playing track
const amb = new Map();       // id -> { src, gain }
let wantMusic = null;
let ducked = false;

export const audio = {
  get ctx() { return ctx; },
  state() { return { context: ctx ? ctx.state : 'none', musicMuted: muted(), sfxMuted: muted(), track: music ? music.id : null }; },
  unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.connect(master);
      voiceBus = ctx.createGain(); voiceBus.connect(master);
      ambBus = ctx.createGain(); ambBus.connect(sfxBus);
      applyVolumes();
      if (wantMusic) { const w = wantMusic; wantMusic = null; this.music(w); }
    }
    if (ctx.state === 'suspended') ctx.resume();
  },
  applyVolumes,
  async load(path) { return loadBuf(path); },
  preload(ids) { for (const id of ids) loadBuf(pathFor(id)); },

  // music(id): crossfade to that track (1.5 s); same track = nothing. null = fade out.
  async music(id, fade = 1.5) {
    if (!ctx) { wantMusic = id; return; }
    if (music && music.id === id) return;
    const old = music; music = null;
    if (old) { fadeOut(old.gain, fade); setTimeout(() => stopTrack(old), fade * 1000 + 100); }
    if (!id) return;
    const token = { id, segs: [] }; music = token;
    const buf = await loadBuf(`assets/audio/music/${id}.mp3`);
    if (music !== token || !buf) return;
    // The loop is played as overlapping one-shot segments (not src.loop): each segment fades out over XF
    // centred on loopEnd while the next fades in from loopStart, so a seam can't click whatever the decoder's
    // MP3 delay. Windows: data/core/audio-loops.js (picked by measurement, design/progress/loops.md).
    const lw = LOOPS[id], lead = leadIn(buf), h = XF / 2;
    const ls = Math.max(h, lw ? lw[0] : lead), le = Math.min(lw ? lw[1] : buf.duration, buf.duration - h);
    token.buf = buf; token.ls = ls; token.le = le;
    const gain = ctx.createGain(); gain.connect(musicBus); token.gain = gain;
    const t0 = ctx.currentTime + 0.05;   // a little ahead, so the seam times below are exact
    gain.gain.setValueAtTime(0, t0); gain.gain.linearRampToValueAtTime(1, t0 + Math.max(fade, 0.01));
    if (le - ls < 1) { addSeg(token, t0, lead, false, true); return; }   // degenerate window: plain loop
    addSeg(token, t0, lead < le - 1 ? lead : ls, false);
    addSeg(token, token.tail - h, ls - h, true);   // always one segment queued ahead
  },
  currentMusic() { return music ? music.id : null; },
  duck(on) { if (!ctx || ducked === on) return; ducked = on; musicBus.gain.setTargetAtTime(vol('music') * (on ? 0.35 : 1) * 0.7, ctx.currentTime, 0.1); },   // same level as applyVolumes

  // sfx(id, {pitch, vol, jitter}): one-shot from assets/audio/sfx/<id>.mp3 (leading silence trimmed)
  async sfx(id, o = {}) {
    if (!ctx || muted()) return;
    const buf = await loadBuf(`assets/audio/sfx/${id}.mp3`);
    if (!buf) return synth(id);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const j = o.jitter === undefined ? 0.06 : o.jitter;
    src.playbackRate.value = (o.pitch || 1) * (1 + (Math.random() * 2 - 1) * j);
    const g = ctx.createGain(); g.gain.value = o.vol === undefined ? 1 : o.vol;
    src.connect(g); g.connect(sfxBus); src.start(0, leadIn(buf));
    if (o.reverse) { /* reversed buffers are prepared on demand */ }
    return src;
  },
  // reversed copy (the shrink swanee)
  async sfxReverse(id) {
    if (!ctx || muted()) return;
    const buf = await loadBuf(`assets/audio/sfx/${id}.mp3`); if (!buf) return;
    const key = id + '#rev';
    let r = buffers.get(key);
    if (!r) { r = ctx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate); for (let c = 0; c < buf.numberOfChannels; c++) { const a = buf.getChannelData(c), b = r.getChannelData(c); for (let i = 0; i < a.length; i++) b[i] = a[a.length - 1 - i]; } buffers.set(key, r); }
    const src = ctx.createBufferSource(); src.buffer = r; src.connect(sfxBus); src.start();
  },
  // ambience loops (WAV, gapless). vol 0 stops it.
  async ambience(id, v = 0.5) {
    if (!ctx) return;
    const cur = amb.get(id);
    if (v <= 0) { if (cur) { fadeOut(cur.gain, 1); setTimeout(() => { try { cur.src.stop(); } catch (_) { /* gone */ } }, 1100); amb.delete(id); } return; }
    if (cur) { cur.gain.gain.setTargetAtTime(v, ctx.currentTime, 0.3); return; }
    const entry = { src: null, gain: ctx.createGain() }; amb.set(id, entry);
    const buf = await loadBuf(`assets/audio/loops/${id}.wav`);
    if (amb.get(id) !== entry || !buf) return;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    entry.gain.gain.value = 0; src.connect(entry.gain); entry.gain.connect(ambBus); src.start();
    entry.gain.gain.setTargetAtTime(v, ctx.currentTime, 0.4); entry.src = src;
  },
  stopAmbience(except = []) { for (const id of [...amb.keys()]) if (!except.includes(id)) this.ambience(id, 0); },
  async voice(id) {
    if (!ctx) return;
    const buf = await loadBuf(`assets/audio/vo/${id}.mp3`); if (!buf || muted()) return;
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(voiceBus); src.start(0, leadIn(buf));
  },
  // code-synth sounds: blip (talk), move, confirm, cancel, equip, shiver, drip, chime, creak, twinkle
  synth(kind, pitch = 1) { synth(kind, pitch); },
  // finale thumps: schedule layers at a BPM while running
  thumps: { layers: 0, timer: null, beat: 0 },
  startThumps(bpm = 72) {
    this.stopThumps(); if (!ctx) return;
    const spb = 60 / bpm; let next = ctx.currentTime + 0.1; this.thumps.beat = 0;
    this.thumps.timer = setInterval(() => {
      while (next < ctx.currentTime + 0.3) {
        const L = this.thumps.layers, b = this.thumps.beat++;
        if (L >= 1) playAt('thump-1', next, 0.9);
        if (L >= 2 && b % 2 === 1) { playAt('thump-2', next, 0.8); }
        if (L >= 3 && b % 4 === 0) playAt('warren-drum', next, 0.9);
        next += spb;
      }
    }, 100);
  },
  stopThumps() { if (this.thumps.timer) clearInterval(this.thumps.timer); this.thumps.timer = null; },
};

function pathFor(id) { return `assets/audio/sfx/${id}.mp3`; }
function muted() { return !!(G.settings && G.settings.mute); }
function vol(k) { const s = G.settings || {}; return (s.mute ? 0 : 1) * (s[k + 'Vol'] === undefined ? 0.8 : s[k + 'Vol']); }
function applyVolumes() {
  if (!ctx) return;
  master.gain.value = muted() ? 0 : 1;
  musicBus.gain.value = vol('music') * (ducked ? 0.35 : 1) * 0.7;
  sfxBus.gain.value = vol('sound');
  voiceBus.gain.value = vol('voice');
}
// --- music segments: equal-power seam crossfade ---
const XF = 0.03;   // seam crossfade length (s)
const XIN = new Float32Array(64).map((_, i) => Math.sin(Math.PI / 2 * i / 63)), XOUT = XIN.slice().reverse();
function curve(p, c, at, dur) {
  try { p.setValueCurveAtTime(c, at, dur); } catch (_) { p.setValueAtTime(c[0], at); p.linearRampToValueAtTime(c[c.length - 1], at + dur); }
}
// one pass of the track from `offset` (s) starting at ctx time `when`, fading out across loopEnd; when it ends,
// the segment after the queued one is scheduled, so there is always one segment waiting (no timers involved)
function addSeg(token, when, offset, fadeIn, plain) {
  const { buf, ls, le } = token, h = XF / 2;
  const now = ctx.currentTime;
  if (when < now) { offset += now - when; when = now; }   // main thread stalled past the start: stay in time
  const src = ctx.createBufferSource(); src.buffer = buf;
  const g = ctx.createGain(); src.connect(g); g.connect(token.gain);
  token.segs.push(src);
  if (plain) { src.loop = true; src.loopStart = ls; src.loopEnd = le; src.start(when, offset); return; }
  if (offset >= le - h) offset = ls - h;
  const seam = when + (le - offset); token.tail = seam;
  if (fadeIn) { g.gain.value = 0; curve(g.gain, XIN, when, XF); }
  curve(g.gain, XOUT, seam - h, XF);
  src.start(when, offset); src.stop(seam + h + 0.005);
  src.onended = () => {
    token.segs = token.segs.filter(x => x !== src);
    try { g.disconnect(); } catch (_) { /* gone */ }
    if (music === token && !token.dead) addSeg(token, token.tail - h, ls - h, true);
  };
}
function stopTrack(tr) {
  tr.dead = true;
  for (const s of tr.segs || []) { try { s.stop(); } catch (_) { /* gone */ } }
  if (tr.gain) { try { tr.gain.disconnect(); } catch (_) { /* gone */ } }
  tr.segs = [];
}
function fadeOut(g, secs) { try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + secs); } catch (_) { /* ignore */ } }
async function loadBuf(path) {
  if (buffers.has(path)) return buffers.get(path);
  if (loading.has(path)) return loading.get(path);
  const p = (async () => {
    try {
      const r = await fetch(path); if (!r.ok) throw new Error(r.status);
      const ab = await r.arrayBuffer();
      if (!ctx) return null;
      const buf = await ctx.decodeAudioData(ab); buffers.set(path, buf); return buf;
    } catch (_) { buffers.set(path, null); return null; }
  })();
  loading.set(path, p); return p;
}
// first sample above -40 dB (0.01): skips MP3 padding and leading silence
const leadCache = new WeakMap();
function leadIn(buf) {
  if (leadCache.has(buf)) return leadCache.get(buf);
  const d = buf.getChannelData(0); let i = 0; const lim = Math.min(d.length, buf.sampleRate * 1.5);
  while (i < lim && Math.abs(d[i]) < 0.01) i++;
  const t = i >= lim ? 0 : Math.max(0, i / buf.sampleRate - 0.005); leadCache.set(buf, t); return t;
}
async function playAt(id, when, v) {
  const buf = await loadBuf(`assets/audio/sfx/${id}.mp3`); if (!buf || muted()) return;
  const src = ctx.createBufferSource(); src.buffer = buf; const g = ctx.createGain(); g.gain.value = v;
  src.connect(g); g.connect(sfxBus); src.start(Math.max(when, ctx.currentTime), leadIn(buf));
}
function synth(kind, pitch = 1) {
  if (!ctx || muted()) return;
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(sfxBus);
  const env = (a, d, peak) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  switch (kind) {
    case 'blip': o.type = 'square'; o.frequency.value = 520 * pitch; env(0.003, 0.05, 0.05); break;
    case 'move': o.type = 'triangle'; o.frequency.value = 660; env(0.003, 0.06, 0.12); break;
    case 'confirm': o.type = 'triangle'; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(990, t + 0.06); env(0.003, 0.14, 0.15); break;
    case 'cancel': o.type = 'triangle'; o.frequency.setValueAtTime(500, t); o.frequency.linearRampToValueAtTime(330, t + 0.1); env(0.003, 0.12, 0.13); break;
    case 'equip': o.type = 'square'; o.frequency.setValueAtTime(440, t); o.frequency.setValueAtTime(660, t + 0.05); o.frequency.setValueAtTime(880, t + 0.1); env(0.003, 0.18, 0.06); break;
    case 'shiver': o.type = 'sine'; o.frequency.setValueAtTime(300, t); for (let i = 0; i < 8; i++) o.frequency.setValueAtTime(i % 2 ? 280 : 320, t + i * 0.04); env(0.01, 0.35, 0.12); break;
    case 'drip': o.type = 'sine'; o.frequency.setValueAtTime(1400 * pitch, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.12); env(0.002, 0.15, 0.08); break;
    case 'chime': o.type = 'sine'; o.frequency.value = 1320 * pitch; env(0.002, 0.8, 0.07); break;
    case 'creak': o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(55, t + 0.4); env(0.05, 0.4, 0.05); break;
    case 'twinkle': o.type = 'sine'; o.frequency.setValueAtTime(1760, t); o.frequency.setValueAtTime(2349, t + 0.07); env(0.002, 0.3, 0.06); break;
    case 'pop': o.type = 'sine'; o.frequency.setValueAtTime(300 * pitch, t); o.frequency.exponentialRampToValueAtTime(900 * pitch, t + 0.08); env(0.002, 0.1, 0.14); break;
    default: o.type = 'sine'; o.frequency.value = 440; env(0.003, 0.08, 0.06);
  }
  o.start(t); o.stop(t + 1);
}
