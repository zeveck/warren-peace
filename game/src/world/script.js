// Story scripts: async functions (s, actor) => {...} that drive dialog, choices, battles, cutscenes.
// Scripts are registered by id in the data (G.data.scripts) or passed as functions.
import { G, W, H, ui, pushScene, popScene, sleep, toast, findScene } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { autosave } from '../engine/save.js';
import { panel, drawPortrait, fade, keyHint, drawIcon } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { ITEMS, KEY_ITEMS, gearInfo } from '../data/core/items.js';
import { PARTY } from '../data/core/party.js';
import { SQUADS } from '../data/core/squads.js';
import * as st from '../state.js';
import { DIRS, dirOf } from './actors.js';

export const ABORT = { abort: true };

export async function runScript(fn, ex, actor) {
  if (typeof fn === 'string') {
    const f = G.data.scripts[fn];
    if (!f) { console.warn('missing script', fn); return; }
    fn = f;
  }
  if (!fn) return;
  const s = makeApi(ex);
  try { await fn(s, actor); }
  catch (e) { if (e !== ABORT) { console.error(e); } }
}

// speaker info: name, portrait, voice pitch for blips
export function speaker(who) {
  if (!who) return null;
  const d = (G.data.speakers || {})[who];
  if (d) return d;
  if (PARTY[who]) return { name: PARTY[who].name, por: who };
  return { name: who.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), por: who };
}

function makeApi(ex) {
  const s = {
    ex,
    get b() { return ex.b; },
    // ---- talk
    say: (who, text, o = {}) => dialog({ who, text, ...o }),
    ask: (who, text, choices, o = {}) => dialog({ who, text, choices, ...o }),
    narrate: (text) => dialog({ who: null, text }),
    bubble: (who, text, secs = 3.5) => { ex.bubbles.push({ who, text, t: secs }); },
    // ---- state
    flag: st.flag, set: st.setFlag, val: st.getVal,
    has: st.hasItem, count: st.itemCount,
    take: st.takeItem,
    member: st.hasMember,
    party: () => st.travelling(),
    quest: (t) => st.setQuest(t),
    async give(what, n = 1, quiet) {
      if (typeof what === 'string') what = { [what]: n };
      const lines = [];
      for (const [k, v] of Object.entries(what)) {
        if (k === 'buttons') { G.s.buttons += v; lines.push(`${v} buttons`); audio.sfx('coins', { vol: 0.7 }); continue; }
        st.giveItem(k, v);
        const name = (ITEMS[k] || KEY_ITEMS[k] || gearInfo(k) || { name: k }).name;
        lines.push(v > 1 ? `${name} x${v}` : name);
      }
      if (!quiet) { audio.synth('twinkle'); await dialog({ who: null, text: 'Got ' + (lines.length > 1 ? lines.slice(0, -1).join(', ') + ' and ' + lines[lines.length - 1] : lines[0]) + '!', small: true }); }
    },
    buttons: (n) => { G.s.buttons += n; },
    heal: () => st.healAll(),
    // ---- recruiting: party members join the party (and army); others only the army
    async recruit(id, o = {}) {
      if (st.flag('g_recruit_' + id)) return;
      if (PARTY[id]) st.addMember(id, o.level);
      else st.setFlag('g_recruit_' + id);
      const sq = Object.entries(SQUADS).find(([, q]) => q.leader === id);
      if (sq) st.setFlag('g_squad_' + sq[0]);
      const { RecruitCard } = await import('../screens/recruit.js');
      await new Promise(r => pushScene(new RecruitCard(id, o.line, r)));
      if (PARTY[id]) ex.buildFollowers(false), placeNewFollower(ex);
    },
    // ---- battles
    async battle(enc, o = {}) {
      const { startBattle } = await import('../battle/rpg.js');
      ex.b.idleT = -1;
      const res = await startBattle(enc, o);
      if (res === 'lose' && !o.canLose) {
        // nothing is lost: back at the last door with full Heart
        await s.upYouGet();
        throw ABORT;
      }
      return res;
    },
    async upYouGet() {
      ex.holdFade = true; ex.fadeA = 1;
      st.healAll();
      audio.voice('vo-upyouget');
      const d = G.s.lastDoor || { map: G.s.map, x: G.s.x, y: G.s.y, f: G.s.facing };
      await ex.load(d.map, d.x, d.y, d.f, { noEnter: true });
      // the defeat card (screens/picture.js): who helps them up, and that nothing is lost
      const { DefeatCard } = await import('../screens/picture.js');
      const lost = G.lastDefeat || {}; G.lastDefeat = null;
      await new Promise(r => pushScene(new DefeatCard({ ...lost, place: (G.data.maps[d.map] || {}).name || null }, r)));
      ex.holdFade = false;
    },
    async army(id, o = {}) { const { startArmy } = await import('../rts/rts.js'); return startArmy(id, o); },
    async shop(id) { const { ShopScene } = await import('../screens/shop.js'); await new Promise(r => pushScene(new ShopScene(id, r))); },
    async rest(o = {}) {
      st.healAll(); audio.sfx('heal');
      await s.fadeOut(0.4); await sleep(0.3); await s.fadeIn(0.4);
      autosave();
      if (!o.quiet) await dialog({ who: null, text: 'Everyone rests. Heart and Pluck are full, and the game is saved.', small: true });
    },
    // ---- movement and staging
    async warp(map, x, y, facing, o = {}) {
      const cur = ex.map && ex.map.id;
      await s.iris(true);
      if (map !== cur || o.reload) { let lx = x, ly = y, lf = facing; if (typeof x === 'string') { const e = G.data.maps[map].entries[x]; lx = e[0]; ly = e[1]; lf = lf || e[2]; } G.s.lastDoor = { map, x: lx, y: ly, f: lf || ex.b.facing }; }
      ex.leaving = false;
      await ex.load(map, x, y, facing, o);
      ex.fadeA = 0;
      await s.iris(false);
    },
    async iris(close) {
      const t0 = G.time; const dur = 0.45;
      if (close) audio.sfx('whoosh', { vol: 0.45 });
      while (G.time - t0 < dur) { const k = (G.time - t0) / dur; ex.iris = close ? k : 1 - k; await sleep(0); }
      ex.iris = close ? 1 : 0;
    },
    async fadeOut(secs = 0.6) { ex.holdFade = true; const t0 = G.time; while (G.time - t0 < secs) { ex.fadeA = (G.time - t0) / secs; await sleep(0); } ex.fadeA = 1; },
    async fadeIn(secs = 0.6) { const t0 = G.time; while (G.time - t0 < secs) { ex.fadeA = 1 - (G.time - t0) / secs; await sleep(0); } ex.fadeA = 0; ex.holdFade = false; },
    wait: (secs) => sleep(secs),
    shake: (secs, amt) => ex.shake(secs, amt),
    sfx: (id, o) => audio.sfx(id, o),
    music: (id) => audio.music(id),
    voice: (id) => audio.voice(id),
    ambience: (id, v) => audio.ambience(id, v),
    actor: (id) => id === 'bramble' ? ex.b : (ex.map.actors.find(a => a.id === id) || ex.followers.find(f => f.id === id) || ex.map.enemies.find(e => e.id === id)),
    emote(id, e, secs = 1.4) { const a = s.actor(id); if (!a) return; a.emote = e; setTimeout(() => { if (a.emote === e) a.emote = null; }, secs * 1000); },
    face(id, dir) { const a = s.actor(id); if (!a) return; if (typeof dir === 'string' && DIRS[dir]) a.facing = dir; else if (dir && dir.x !== undefined) a.facing = dirOf(dir.x - a.x, dir.y - a.y) || a.facing; },
    hide(id) { const a = s.actor(id); if (a) a.hidden = true; },
    show(id) { const a = s.actor(id); if (a) a.hidden = false; },
    spawn(a) { const o = { kind: 'npc', facing: 'sw', hopT: -1, ...a, sprite: a.sprite || a.id }; ex.map.actors.push(o); return o; },
    remove(id) { ex.map.actors = ex.map.actors.filter(a => a.id !== id); },
    // move an actor (or 'bramble') along tiles [[x,y],...] with hops
    async move(id, path, dur = 0.22) {
      const a = s.actor(id); if (!a) return;
      for (const [x, y] of path) {
        if (a === ex.b) { ex.b.facing = dirOf(x - a.x, y - a.y); ex.startHop(x, y, dur); }
        else {
          a.facing = dirOf(x - a.x, y - a.y) || a.facing;
          a.hop = { fx: a.x, fy: a.y, fh: ex.hAt(a.x, a.y), tx: x, ty: y, th: ex.hAt(x, y), t: 0, dur };
          a.x = x; a.y = y; a.hopT = 0;
        }
        await sleep(dur + 0.01);
      }
      if (a === ex.b) { G.s.x = a.x; G.s.y = a.y; }
    },
    place(id, x, y, facing) { const a = s.actor(id); if (!a) return; a.x = x; a.y = y; a.hop = null; a.hopT = -1; if (facing) a.facing = facing; if (a === ex.b) { G.s.x = x; G.s.y = y; ex.buildFollowers(true); } },
    setSize: (sz) => ex.setSize(sz),
    size: () => ex.size,
    escort(id, on = true, o = {}) {
      ex.escorts = ex.escorts.filter(e => e.id !== id);
      if (on) ex.escorts.push({ id, sprite: o.sprite || id, kid: o.kid });
      ex.buildFollowers(false); placeNewFollower(ex);
    },
    escorting: (id) => ex.escorts.some(e => e.id === id),
    // full-screen picture with a caption (intro cards, the attack, the mural)
    async picture(bgId, lines, o = {}) { const { PictureScene } = await import('../screens/picture.js'); await new Promise(r => pushScene(new PictureScene(bgId, lines, r, o))); },
    async chapterCard(title, sub, bgId) { const { ChapterCard } = await import('../screens/picture.js'); await new Promise(r => pushScene(new ChapterCard(title, sub, bgId, r))); },
    async ending() { const { EndingScene } = await import('../screens/ending.js'); await new Promise(r => pushScene(new EndingScene(r))); },
    save: () => autosave(),
    toast: (m) => toast(m),
    remember(id) { if (!G.s.memories.includes(id)) G.s.memories.push(id); },
    chapter(n) { G.s.chapter = Math.max(G.s.chapter, n); },
  };
  return s;
}
function placeNewFollower(ex) {
  // anyone new in the line pops in right behind Bramble
  for (let i = 0; i < ex.followers.length; i++) {
    const f = ex.followers[i];
    if (f.x === ex.b.x && f.y === ex.b.y && f.merge === 0) {
      const t = ex.trail[i] || ex.trail[ex.trail.length - 1];
      if (t) { f.x = t.x; f.y = t.y; } else {
        for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0], [0, 1]]) if (ex.walkable(ex.b.x + dx, ex.b.y + dy)) { f.x = ex.b.x + dx; f.y = ex.b.y + dy; break; }
      }
      ex.puff(f);
    }
  }
}

// ---------------- the dialog box
const SPEED = { slow: 30, normal: 55, fast: 110, instant: 99999 };
export function dialog(o) {
  return new Promise(res => pushScene(new DialogScene(o, res)));
}
export class DialogScene {
  constructor(o, done) {
    this.kind = 'dialog'; this.o = o; this.done = done; this.t = 0; this.shown = 0; this.sel = 0;
    this.sp = speaker(o.who);
    if (o.who && G.s) G.s.met[o.who] = 1;
    let text = o.text;
    this.lines = ui.wrap(text, o.who ? 430 : 560, 11);
    this.total = this.lines.join(' ').length;
    this.pitch = 0.8 + ((o.who || 'x').length % 5) * 0.12;
    if (o.voice) audio.voice(o.voice);
    this.wait = 0.1;
  }
  enter() { const ex = findScene('explore'); if (ex) ex.b && (ex.b.idleT = -1); }
  update(dt) {
    this.wait -= dt;
    const sp = SPEED[G.settings.textSpeed] || 55;
    const before = Math.floor(this.shown);
    if (this.shown < this.total) { this.shown = Math.min(this.total, this.shown + sp * dt); if (Math.floor(this.shown) !== before && Math.floor(this.shown) % 3 === 0 && this.o.who) audio.synth('blip', this.pitch); }
    const full = this.shown >= this.total;
    const ch = this.o.choices;
    if (full && ch) {
      if (input.up()) { this.sel = (this.sel + ch.length - 1) % ch.length; audio.synth('move'); }
      if (input.down()) { this.sel = (this.sel + 1) % ch.length; audio.synth('move'); }
      const d = input.digit(); if (d >= 1 && d <= ch.length) { this.sel = d - 1; this.finish(this.sel); return; }
    }
    const clicked = input.click();
    if ((input.act() || clicked) && this.wait <= 0) {
      if (!full) { this.shown = this.total; return; }
      if (ch) {
        // which choice the press went down on (from the last drawn layout), so a fast click needs no hover frame first
        if (clicked) { const g = this.choiceGeo, m = input.mouse; const k = g && m.px > g.tx - 4 && m.px < g.tx + 420 ? Math.floor((m.py - (g.cy - 10)) / 13) : -1; if (!(k >= 0 && k < ch.length)) return; this.sel = k; }
        this.finish(this.sel);
      }
      else this.finish(0);
    }
  }
  finish(v) { audio.synth('confirm'); popScene(this); this.done(v); }
  draw(c) {
    const o = this.o, y0 = H - 104;
    const hasPor = !!o.who;
    const x0 = 8, w = W - 16;
    panel(c, x0, y0, w, 98, { fill: '#2b2236' });
    let tx = x0 + 12;
    if (hasPor) {
      const por = o.mood && (o.who === 'bramble') ? 'bramble-' + o.mood : (this.sp.por || o.who);
      drawPortrait(c, por, x0 + 6, y0 + 7);
      tx = x0 + 98;
      // name tag
      const nw = ui.measure(this.sp.name, 10) + 14;
      panel(c, tx - 4, y0 - 12, nw, 18, { fill: '#4a3e5a' });
      ui.text(this.sp.name, tx + 3, y0 + 1, { size: 10, color: P.gold });
    }
    if (o.listener) { drawPortrait(c, (speaker(o.listener) || {}).por || o.listener, W - 98, y0 + 7, { flip: true }); }
    // typed text
    let left = Math.floor(this.shown);
    const ch = o.choices;
    const lines = this.lines;
    const ty0 = ch ? y0 + 18 : y0 + 24;
    for (let i = 0; i < lines.length && left > 0; i++) {
      const part = lines[i].slice(0, left); left -= lines[i].length + 1;
      ui.text(part, tx, ty0 + i * 14, { size: 11, color: o.who ? P.chalk : '#e8dcc0' });
    }
    if (ch && this.shown >= this.total) {
      const cy = ty0 + lines.length * 14 + 2;
      this.hover = undefined; this.choiceGeo = { cy, tx };
      ch.forEach((t, i) => {
        const yy = cy + i * 13, sel = i === this.sel;
        const m = input.mouse; const over = m.inside && m.y >= yy - 10 && m.y < yy + 3 && m.x > tx - 4 && m.x < tx + 420;
        if (over) { this.hover = i; if (input.mouse.moved) this.sel = i; }
        if (sel) { c.fillStyle = 'rgba(232,201,90,0.18)'; c.fillRect(tx - 4, yy - 10, 430, 13); }
        ui.text((sel ? '> ' : '  ') + t, tx, yy, { size: 10, color: sel ? P.gold : P.chalk });
      });
      import('../core.js').then(() => {});
      ch.forEach((t, i) => { G.drawingTop && pushHit(t, tx - 4, cy + i * 13 - 10, 430, 13); });
    } else if (this.shown >= this.total) {
      const k = Math.floor(G.time * 2) % 2; c.fillStyle = P.gold; c.fillRect(x0 + w - 18, y0 + 84 + k, 6, 3); c.fillRect(x0 + w - 17, y0 + 87 + k, 4, 1);
      if (G.drawingTop) pushHit('Next', x0, y0, w, 98);
    }
  }
}
import { hits } from '../core.js';
function pushHit(label, x, y, w, h) { hits.add(label, x, y, w, h); }
