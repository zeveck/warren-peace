// Army battles: the preview (odds, picking squads) and the battle scene (field, camera, minimap, orders).
import { G, W, H, ui, pushScene, popScene, clamp, lerp, hits, sleep, toast, findScene } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { saveSettings } from '../engine/save.js';
import { toScreen, tileImage } from '../engine/iso.js';
import { sprite, prop, flipped, furRamp, silhouette, humEyes, placeholder, anim } from '../engine/assets.js';
import { FLAP, frame } from '../world/actors.js';
import { panel, bar, button, drawIcon, fade, mouseIn, drawFace } from '../engine/gfx.js';
import { P, FUR } from '../data/core/palette.js';
import { KINDS, SQUADS, ENEMY_SQUADS } from '../data/core/squads.js';
import { makeSim, step, order, orderAttack, reinforce, useAbility, ABILITY, hidden, oddsOf, TICK } from './sim.js';
import * as st from '../state.js';
import { bestOf, recordBest, medalFor, medalOf, medalsOf, beatBurdock, fmtTime, fmtSecs, MEDAL_NAME, MEDAL_COLOR } from './best.js';

const LETTERS = ['A', 'S', 'D', 'G', 'H', 'J', 'K', 'L', 'Z', 'X'];
const LKEY = { A: 'KeyA', S: 'KeyS', D: 'KeyD', G: 'KeyG', H: 'KeyH', J: 'KeyJ', K: 'KeyK', L: 'KeyL', Z: 'KeyZ', X: 'KeyX' };

export function battleDef(id) {
  const d = G.data.rts[id]; if (!d) throw new Error('no army battle ' + id);
  const def = JSON.parse(JSON.stringify({ ...d, script: undefined, prompts: undefined }));
  def.nodes.forEach((n, i) => { n.letter = n.letter || LETTERS[i]; });
  def.paths = def.paths.map(([a, b, len]) => { const A = def.nodes.find(n => n.id === a), B = def.nodes.find(n => n.id === b); return [a, b, len || Math.abs(A.x - B.x) + Math.abs(A.y - B.y)]; });
  return def;
}
export function armyGearMap() {
  const g = {}; for (const k of ['stout', 'swift', 'wing', 'eerie']) g[k] = { banner: (G.s.armyGear[k + ':banner'] || 0), mail: (G.s.armyGear[k + ':mail'] || 0), rations: (G.s.armyGear[k + ':rations'] || 0) };
  return g;
}
export function abilitiesNow() { const n = st.warrensFreed(); const a = []; if (n >= 1) a.push('rally'); if (n >= 2) a.push('moonlight'); if (n >= 3) a.push('monkey'); if (G.data.rts && G.s.flags.g_tunnel) a.push('tunnel'); return a; }
export function defaultArmy(id) {
  const d = G.data.rts[id]; const owned = st.ownedSquads();
  const strength = q => { const S = SQUADS[q]; const K = KINDS[S.kind]; return K.hp * S.m[0] + K.atk * S.m[1] * 8; };
  const req = (d.required || []).filter(q => owned.includes(q));
  const rest = owned.filter(q => !req.includes(q)).sort((a, b) => strength(b) - strength(a));
  const army = [...req, ...rest].slice(0, d.cap);
  // Bramble's own squad always goes (in the last slot if the battle's story squads fill the cap, so the others keep their numbers)
  if (owned.includes(BRAMBLE) && !army.includes(BRAMBLE)) { if (army.length >= d.cap) army.pop(); army.push(BRAMBLE); }
  return army;
}
const BRAMBLE = 'thimblebank-rabbits';
export function computeOdds(id, army, rallied) {
  const d = G.data.rts[id];
  return oddsOf(battleDef(id), army, { rank: 1 + 0.12 * st.warrensFreed(), easy: G.settings.easy, gear: armyGearMap(), abilities: [], rallied });
}

// start: shows the preview, then the battle; resolves 'win' | 'lose' | 'back'
export function startArmy(id, o = {}) {
  // backing out or losing returns to the map: bring its music back (a win hands over to the story, which picks the music)
  const prev = audio.currentMusic();
  return new Promise(res0 => {
    const res = r => { if ((r !== 'win' || o.revisit) && prev && !audio.currentMusic()) audio.music(prev); res0(r); };
    if (o.guided) pushScene(new RtsScene(id, defaultArmy(id), { ...o, done: res }));
    else pushScene(new PreviewScene(id, o, res));
  });
}

// ---------------- the preview
class PreviewScene {
  constructor(id, o, done) {
    this.kind = 'rts-preview'; this.opaque = true; this.id = id; this.o = o; this.done = done; this.d = G.data.rts[id];
    // the list shows the default pick first (in squad-number order), then the rest
    const def = defaultArmy(id), owned = st.ownedSquads();
    this.owned = [...def, ...owned.filter(q => !def.includes(q))]; this.pick = new Set(def); this.defPick = def; this.sel = 0; this.rally = false; this.recalc();
  }
  enter() { audio.music(this.d.previewMusic || this.d.music || 'm-army'); }
  recalc() { this.odds = computeOdds(this.id, [...this.pick], this.rally); }
  advice() {
    const enemy = {}; const d = this.d;
    for (const g of d.enemy.guards || []) { const k = ENEMY_SQUADS[g.sq].kind; enemy[k] = (enemy[k] || 0) + 1; }
    for (const w of d.enemy.waves || []) for (const s of w.sq) { const k = ENEMY_SQUADS[s].kind; enemy[k] = (enemy[k] || 0) + 1; }
    const top = Object.keys(enemy).sort((a, b) => enemy[b] - enemy[a])[0]; if (!top) return '';
    const beat = { stout: 'wing', swift: 'stout', wing: 'swift', eerie: 'light' }[top];
    const names = { wing: 'Flyers', stout: 'Stout squads', swift: 'Swift squads', light: 'Light squads' };
    const cand = Object.keys(SQUADS).find(q => (beat === 'light' ? SQUADS[q].perk && SQUADS[q].perk.startsWith('light') : SQUADS[q].kind === beat) && !this.pick.has(q) && !SQUADS[q].free);
    let tail = '';
    const have = [...this.pick].find(q => beat === 'light' ? (SQUADS[q].perk || '').startsWith('light') : SQUADS[q].kind === beat);
    if (have) return `Their army is mostly ${KINDS[top].name}. Your ${SQUADS[have].name} will do well against them: send them at it.`;
    if (cand) tail = this.owned.includes(cand) ? ` ${SQUADS[cand].name} are waiting: add them below.` : ` Find friends who fly, dig or shine.`;
    else tail = ' Better army gear from the shops would help.';
    return `Their army is mostly ${KINDS[top].name}. ${names[beat]} would help.${tail}`;
  }
  update() {
    const list = this.owned;
    if (input.up()) { this.sel = (this.sel + list.length - 1) % list.length; audio.synth('move'); }
    if (input.down()) { this.sel = (this.sel + 1) % list.length; audio.synth('move'); }
    if (input.mouse.wheel && list.length) this.sel = clamp(this.sel + Math.sign(input.mouse.wheel), 0, list.length - 1);
    if (input.act() && list.length) this.toggle(list[this.sel]);
    if (input.back()) this.leave();
    if (input.isPressed('Enter') && false) this.start();
  }
  toggle(q) {
    if (this.pick.has(q)) this.pick.delete(q); else if (this.pick.size < this.d.cap) this.pick.add(q); else { toast(`Up to ${this.d.cap} squads.`); return; }
    audio.synth('confirm'); this.recalc();
  }
  leave() { popScene(this); audio.music(null); this.done('back'); }
  start() { popScene(this); pushScene(new RtsScene(this.id, [...this.pick], { ...this.o, rallied: this.rally, done: this.done })); }
  draw(c) {
    c.fillStyle = '#1f2a1c'; c.fillRect(0, 0, W, H);
    const b = import.meta && null;
    panel(c, 10, 8, W - 20, H - 16);
    ui.text(this.d.name, 24, 30, { size: 15, color: P.gold });
    // the goal wraps short of the odds column on the right
    const sub = ui.wrap(this.d.sub || '', 372, 9, true);
    sub.forEach((l, i) => ui.text(l, 24, 46 + i * 11, { size: 9, color: '#c8bca8' }));
    // odds
    const odds = this.odds.odds, col = odds === 'Strong' ? '#8de08a' : odds === 'Even' ? '#f0d880' : '#e08a7a';
    ui.text('Odds:', 410, 30, { size: 11 }); ui.text(odds, 450, 30, { size: 13, color: col });
    // advice
    const adv = ui.wrap(this.advice(), 590, 9), ay = sub.length > 1 ? 75 : 66;
    adv.forEach((l, i) => ui.text(l, 24, ay + i * 11, { size: 9, color: '#e8dcc0' }));
    // squad list
    // one count: how many are picked, the battle's cap, and how many you could choose from
    ui.text(`Picked ${this.pick.size} of ${this.d.cap} allowed (${this.owned.length} available)`, 24, 98, { size: 10 });
    // 'suggested': the default pick (the battle's story squads you own, up to the cap, and Bramble's)
    const sugg = this.defPick;
    const list = this.owned, per = 10, start = clamp(this.sel - per + 1, 0, Math.max(0, list.length - per));
    list.slice(start, start + per).forEach((q, j) => {
      const i = start + j, S = SQUADS[q], y = 104 + j * 18, on = this.pick.has(q), sel = i === this.sel;
      if (G.drawingTop) hits.add('squad:' + S.name, 22, y, 380, 16);
      if (mouseIn(22, y, 380, 16)) { if (input.mouse.moved) this.sel = i; if (input.click()) { input.mouse.pressed[0] = false; this.sel = i; this.toggle(q); } }
      c.fillStyle = sel ? 'rgba(232,201,90,0.18)' : 'rgba(255,255,255,0.03)'; c.fillRect(22, y, 380, 16);
      drawCheck(c, 26, y + 3, on);
      drawIcon(c, KINDS[S.kind].icon, 42, y, 16);
      ui.text(S.name, 62, y + 12, { size: 9, color: on ? P.chalk : '#a89cb8' });
      ui.text(KINDS[S.kind].name + (S.perk && S.perk.startsWith('light') ? ', Light' : ''), 300, y + 12, { size: 8, color: '#b8acc8' });
      if (sugg.includes(q)) ui.text('suggested', 396, y + 12, { size: 8, align: 'right', color: '#f0d880' });
    });
    if (!list.length) ui.text('No squads yet.', 30, 120, { size: 9 });
    if (list.length > per) ui.text(`${start + 1}-${Math.min(list.length, start + per)} of ${list.length}   (mouse wheel or arrows for more)`, 26, 296, { size: 8, color: '#b8acc8' });
    // field preview: node map
    this.drawMini(c, 420, 100, 200, 150);
    if (this.o.revisit) this.drawPar(c, 420, 262);
    else if ((G.s.losses[this.id] || 0) >= 2) {
      if (button(c, this.rally ? 'The warren rallies! (on)' : 'The warren rallies', 420, 262, 200, 18, { size: 9, sel: this.rally })) { this.rally = !this.rally; this.recalc(); }
      ui.wrap('All squads +15% for this battle. Easy mode is in Settings.', 196, 8, true).forEach((l, i) => ui.text(l, 422, 290 + i * 10, { size: 8, color: '#b8acc8' }));   // fits the column
    }
    if (button(c, 'Start the battle', 420, 310, 120, 22, { size: 10, disabled: !this.pick.size })) this.start();
    if (button(c, 'Back', 548, 310, 72, 22, { size: 10 })) this.leave();
    ui.text('Space: pick/unpick   Esc: back', 24, 332, { size: 8, color: '#8a7e9a' });
  }
  // post-game revisit: your best, Burdock's time and the medal times, under the field preview
  drawPar(c, x, y) {
    const b = bestOf(this.id), m = medalsOf(this.id), med = medalOf(this.id);
    ui.text(b ? `Your best: ${fmtTime(b.ticks)}${b.easy ? ' (Easy)' : ''}` : 'Your best: not yet', x + 2, y + 8, { size: 9, color: P.chalk });
    if (med) ui.text(MEDAL_NAME[med], x + 198, y + 8, { size: 9, align: 'right', color: MEDAL_COLOR[med] });
    if (m) {
      ui.text(`Burdock's time: ${fmtSecs(m.burdock)}`, x + 2, y + 20, { size: 8, color: '#f0d880' });
      ui.text(`Gold ${fmtSecs(m.gold)}  Silver ${fmtSecs(m.silver)}  Bronze ${fmtSecs(m.bronze)}`, x + 2, y + 31, { size: 8, color: '#b8acc8' });
    }
    if (G.settings.easy) ui.text('Easy mode: times count, medals don\'t.', x + 2, y + 42, { size: 8, color: '#8a7e9a' });
  }
  drawMini(c, x, y, w, h) {
    const d = battleDef(this.id);
    c.fillStyle = '#2e3a26'; c.fillRect(x, y, w, h);
    const N = d.size || 28; const sx = w / N, sy = h / N;
    const p = n => [x + (n.x - n.y + N) / 2 * sx, y + (n.x + n.y) / 2 * sy];
    c.strokeStyle = '#8a7a5a'; c.lineWidth = 1;
    for (const [a, b] of d.paths) { const A = d.nodes.find(n => n.id === a), B = d.nodes.find(n => n.id === b); const [x1, y1] = p(A), [x2, y2] = p(B); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
    for (const n of d.nodes) { if (n.dark) continue; const [px, py] = p(n); c.fillStyle = n.id === d.home ? '#8de08a' : n.id === d.mouth ? '#e08a7a' : n.kind === 'clover' ? '#c0e0a0' : '#d8ccb0'; c.fillRect(px - 3, py - 3, 6, 6); ui.text(n.letter, px + 5, py + 3, { size: 8 }); }
  }
}

// a 10x10 pixel checkbox; ticked: a two-pixel-thick tick, short arm down-right, long arm up-right
const TICK_PX = ['........##', '.......###', '......###.', '##...###..', '###.###...', '.#####....', '..###.....', '...#......'];
function drawCheck(c, x, y, on) {
  c.fillStyle = '#120e18'; c.fillRect(x - 1, y - 1, 12, 12);
  c.fillStyle = on ? P.sage : '#3a3046'; c.fillRect(x, y, 10, 10);
  if (!on) return;
  c.fillStyle = P.bark;
  TICK_PX.forEach((row, j) => { for (let i = 0; i < 10; i++) if (row[i] === '#') c.fillRect(x + i, y + 1 + j, 1, 1); });
}

// ---------------- the battle
const CAMSPEED = 8 * 32;
// the HUD: top bar, squad list (left), minimap with the tips/alerts column under it (right), bottom bar.
// CLEAR is the field between them; SIDE is the column under the minimap where tips, alerts and the clock notice stack.
const CLEAR = { l: 134, r: W - 142, t: 28, b: H - 48 };
const SIDE = { x: W - 137, y: 102, w: 134 };
const FAN = [[-44, 4], [44, 4], [0, -22], [0, 26], [-88, 0], [88, 0], [-44, -34], [44, -34], [-44, 40], [44, 40], [-88, -38], [88, -38], [-88, 38], [88, 38]];
class RtsScene {
  constructor(id, army, o) {
    this.kind = 'rts'; this.opaque = true; this.id = id; this.o = o; this.data = G.data.rts[id]; this.def = battleDef(id);
    this.S = makeSim(this.def, army, { rank: 1 + 0.12 * st.warrensFreed(), easy: G.settings.easy, gear: armyGearMap(), abilities: abilitiesNow(), rallied: o.rallied });
    this.paused = false; this.speed = 1; this.acc = 0; this.sel = new Set(); this.targeting = null; this.alerts = []; this.fx = []; this.fadeA = 1; this.t = 0;
    this.N = this.def.size || 28;
    this.prompts = o.revisit ? [] : (this.data.prompts || []).slice(); this.prompt = null;
    this.lastAuto = 0; this.contactSeen = false;
    // the clock waits for the first order, so reading the field and the opening tips costs nothing (startOnOrder: false opts out)
    this.started = this.def.startOnOrder === false;
    // under-attack warnings: threatened player nodes, a banner, and the first threat to home pauses once
    this.threats = {}; this.threatCool = {}; this.alertBanner = null; this.homeWarned = false;
    this.buildField();
    this.side = [];
    // the nodes' extent on screen (camera 0), for the camera clamp
    const sp = this.def.nodes.map(n => toScreen(n.x, n.y));
    this.nodeBox = { x0: Math.min(...sp.map(p => p.x)), x1: Math.max(...sp.map(p => p.x)), y0: Math.min(...sp.map(p => p.y)) + 8, y1: Math.max(...sp.map(p => p.y)) + 8 };
    const home = this.S.node(this.def.home), first = this.S.node(this.def.focus || this.def.nodes[1].id);
    this.centerOn((home.x + first.x) / 2, (home.y + first.y) / 2, true);
    // keep home and the army fanned out round it in the clear field: off the squad list, the tips column and the bars
    const hp = this.w2s(home.x, home.y);
    if (hp.x < 250) this.camTX -= 250 - hp.x; else if (hp.x > CLEAR.r - 100) this.camTX += hp.x - (CLEAR.r - 100);
    if (hp.y < CLEAR.t + 80) this.camTY -= CLEAR.t + 80 - hp.y; else if (hp.y > CLEAR.b - 62) this.camTY += hp.y - (CLEAR.b - 62);
    this.clampCam(); this.camX = this.camTX; this.camY = this.camTY;
  }
  // squads standing on a node fan out round it (drawing and clicking only; the sim keeps them on the node)
  fanOffset(q) {
    if (!q.at || q.edge || q.worn) return [0, 0];
    const here = this.S.squads.filter(o => o.at === q.at && !o.edge && !o.worn && !o.gone && !(o.side === 'enemy' && hidden(this.S, o)))
      .sort((a, b) => (a.side === b.side ? a.id - b.id : a.side === 'player' ? -1 : 1));
    if (here.length < 2) return [0, 0];
    const i = here.indexOf(q); if (i < 0) return [0, 0];
    // a diamond lattice round the node (players first, then enemies), wide enough that squads don't overlap
    return FAN[i % FAN.length];
  }
  // a squad's spot on screen, fanned out and eased so arrivals slide into place
  sqPos(q) {
    const p = this.w2s(q.x, q.y), [fx, fy] = this.fanOffset(q);
    if (q._fx === undefined) { q._fx = fx; q._fy = fy; }
    return { x: p.x + q._fx, y: p.y + q._fy, tx: fx, ty: fy };
  }
  easeFan(dt) { const k = 1 - Math.pow(0.002, dt); for (const q of this.S.squads) { const [fx, fy] = this.fanOffset(q); if (q._fx === undefined) { q._fx = fx; q._fy = fy; } q._fx += (fx - q._fx) * k; q._fy += (fy - q._fy) * k; } }
  enter() { audio.music(this.data.music || (this.def.thump ? null : 'm-army')); if (this.def.thump) { audio.ambience('drone-bed', this.data.music ? 0.35 : 0.6); audio.startThumps(72); } audio.ambience('clash', 0); if (this.data.onStart) this.data.onStart(this); }
  exit() { audio.stopThumps(); audio.ambience('clash', 0); audio.ambience('drone-bed', 0); }
  buildField() {
    // ground: grass with paths drawn as chalk tiles between nodes; corn on cover
    const N = this.N; this.ground = [];
    const pathSet = new Set(), coverSet = new Set();
    const line = (A, B, set) => { let x = A.x, y = A.y; set.add(x + ',' + y); while (x !== B.x || y !== B.y) { if (x !== B.x && (Math.abs(B.x - x) >= Math.abs(B.y - y) || y === B.y)) x += Math.sign(B.x - x); else y += Math.sign(B.y - y); set.add(x + ',' + y); } };
    for (const [a, b] of this.def.paths) { const A = this.S.node(a), B = this.S.node(b); line(A, B, pathSet); }
    for (const [a, b] of this.def.coverPaths || []) line(this.S.node(a), this.S.node(b), coverSet);
    for (const id in this.def.cover || {}) { const n = this.S.node(id); for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) coverSet.add((n.x + dx) + ',' + (n.y + dy)); }
    const world = this.def.world || 'downs';
    this.world = world;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = x + ',' + y; const kind = coverSet.has(k) ? 'corn' : pathSet.has(k) ? (this.def.pathKind || 'path') : (this.def.groundKind || 'grass');
      this.ground.push({ x, y, kind, h: (this.def.heights && this.def.heights[y] ? +this.def.heights[y][x] || 0 : 0) });
    }
    this.pathSet = pathSet;
  }
  // camera in screen pixels
  centerOn(tx, ty, instant) { const s = toScreen(tx, ty); this.camTX = s.x - (CLEAR.l + CLEAR.r) / 2; this.camTY = s.y + 8 - (CLEAR.t + CLEAR.b) / 2; if (instant) { this.camX = this.camTX; this.camY = this.camTY; } }
  clampCam() {
    const B = this.nodeBox;
    // far enough that every node and the squads fanned round it (112 px either side, 70 above, 62 below: clear of the hint line too) can be
    // scrolled into the clear field between the HUD panels, and no further (no screens of empty sky)
    const minX = B.x0 - 112 - CLEAR.l, maxX = B.x1 + 112 - CLEAR.r, minY = B.y0 - 70 - CLEAR.t, maxY = B.y1 + 62 - CLEAR.b;
    this.camTX = clamp(this.camTX, minX, Math.max(minX, maxX)); this.camTY = clamp(this.camTY, minY, Math.max(minY, maxY)); }
  w2s(x, y) { const s = toScreen(x, y); return { x: s.x - this.camX, y: s.y + 8 - this.camY }; }
  // ---------- update
  update(dt) {
    this.t += dt;
    if (this.done) return;
    // a tutorial tip waiting for Space still lets Escape / P open the pause menu
    // (orders still work under the tip: B then a letter, clicks on squads; Space/Enter or a click on the tip closes it)
    if (this.prompt && this.prompt.wait && !this.prompt.cond) {
      if (input.isPressed('Escape') || input.isPressed('KeyP')) { input.eatAll(); this.openPause(); return; }
      const b = this.promptBox, onTip = b && input.click() && mouseIn(b.x, b.y, b.w, b.h);
      if (input.isPressed('Space') || input.isPressed('Enter') || onTip) { input.eat('Space'); input.eat('Enter'); if (onTip) input.mouse.pressed[0] = false; this.closeTip(); }
    }
    const S = this.S;
    // keys
    if (input.isPressed('Escape') && this.targeting) { this.targeting = null; input.eat('Escape'); audio.synth('cancel'); }
    if (input.isPressed('Escape') || input.isPressed('KeyP')) { input.eatAll(); this.openPause(); return; }
    if (input.isPressed('Space')) { this.paused = !this.paused; audio.synth(this.paused ? 'cancel' : 'confirm'); }
    if (input.isPressed('KeyF')) { this.speed = this.speed === 1 ? 2 : 1; }
    // camera keys
    const h = input.held;
    if (h.has('ArrowLeft')) this.camTX -= CAMSPEED * dt; if (h.has('ArrowRight')) this.camTX += CAMSPEED * dt;
    if (h.has('ArrowUp')) this.camTY -= CAMSPEED * dt; if (h.has('ArrowDown')) this.camTY += CAMSPEED * dt;
    const m = input.mouse;
    if (G.settings.edgeScroll && m.inside && !this.dragBox) { if (m.x < 12) this.camTX -= CAMSPEED * dt; if (m.x > W - 12) this.camTX += CAMSPEED * dt; if (m.y < 12) this.camTY -= CAMSPEED * dt; if (m.y > H - 12) this.camTY += CAMSPEED * dt; }
    if (m.down[1] && this.midFrom) { this.camTX = this.midFrom.cx - (m.x - this.midFrom.x); this.camTY = this.midFrom.cy - (m.y - this.midFrom.y); }
    if (m.pressed[1]) this.midFrom = { x: m.x, y: m.y, cx: this.camTX, cy: this.camTY }; if (!m.down[1]) this.midFrom = null;
    if (input.isPressed('KeyC')) { const q = this.selected()[0]; if (q) this.centerOn(q.x, q.y); }
    if (input.isPressed('KeyV')) { const n = S.node(this.def.home); this.centerOn(n.x, n.y); }
    this.clampCam();
    this.camX = lerp(this.camX, this.camTX, 1 - Math.pow(0.0005, dt)); this.camY = lerp(this.camY, this.camTY, 1 - Math.pow(0.0005, dt));
    // selection keys
    const mine = this.listSquads();
    const d = input.digit();
    if (d >= 0) { const i = d === 0 ? 9 : d - 1; const q = mine[i]; if (q) { if (!input.shiftWith('Digit' + d)) this.sel.clear(); this.sel.add(q.id); audio.synth('move'); } }
    if (input.isPressed('KeyB')) { this.sel = new Set(mine.filter(q => !q.worn).map(q => q.id)); }
    if (input.isPressed('Tab')) { const live = mine.filter(q => !q.worn); if (live.length) { const cur = live.findIndex(q => this.sel.has(q.id)); const nx = live[(cur + 1) % live.length]; this.sel = new Set([nx.id]); } }
    if (input.isPressed('KeyT')) { let any = false; for (const q of this.selected()) any = reinforce(S, q) || any; audio.synth(any ? 'confirm' : 'cancel'); if (any) audio.sfx('heal', { vol: 0.6 }); }
    // abilities
    for (const [id, A] of Object.entries(ABILITY)) if (input.isPressed(A.key)) this.startAbility(id);
    // node letters: order or target
    for (const n of S.nodes) { if (n.dark) continue; if (input.isPressed(LKEY[n.letter])) this.nodeCommand(n); }
    // mouse on the field (the HUD handles its own clicks in draw)
    if (!this.overHud(m)) {
      if (m.pressed[0]) { this.dragBox = { x: m.x, y: m.y, x2: m.x, y2: m.y }; }
      if (this.dragBox && m.down[0]) { this.dragBox.x2 = m.x; this.dragBox.y2 = m.y; }
      if (this.dragBox && m.released[0]) { this.finishBox(); }
      if (m.pressed[2]) this.rightClick(m.x, m.y);
    } else if (m.released[0]) this.dragBox = null;
    // sim
    if (!this.paused && this.started) {
      this.acc += dt * this.speed;
      while (this.acc >= TICK && !S.result) {
        this.acc -= TICK; step(S); this.handleEvents();
        // auto-pause on exact ticks
        const ap = G.settings.autoPause;
        if (ap === 'every10' && S.tick % 100 === 0) { this.paused = true; this.acc = 0; break; }
        if (ap === 'contact' && !this.contactSeen && S.squads.some(q => q.contact)) { this.contactSeen = true; this.paused = true; this.acc = 0; break; }
      }
    }
    // prompts (tutorial)
    if (!this.prompt && this.prompts.length) { const p = this.prompts[0]; if (!p.when || p.when(this)) { this.prompts.shift(); this.prompt = { ...p, text: typeof p.text === 'function' ? p.text(this) : p.text, shownAt: this.t }; if (p.wait) { this.promptWasPaused = this.paused; this.paused = true; } } }
    if (this.prompt && this.prompt.cond && this.prompt.cond(this)) { this.prompt = null; audio.synth('twinkle'); }
    if (this.data.update) this.data.update(this, dt);
    if (!S.result) this.watchThreats();
    // a new tip or alert in the side column nudges the view once so your squads aren't under it
    const sideKey = (this.prompt ? this.prompt.text : '') + '|' + (this.alertBanner ? this.alertBanner.text : '');
    if (sideKey !== this.sideKey) { this.sideKey = sideKey; if (sideKey !== '|' && !S.result) this.dodgeSide(); }
    this.easeFan(dt);
    if (S.result && !this.done) this.finish(S.result);
    // ambience: clash while fighting
    const fighting = S.squads.some(q => q.contact);
    audio.ambience('clash', fighting && !this.paused ? 0.35 : 0);
    if (this.def.thump) audio.thumps.layers = S.nodes.filter(n => n.kind === 'thump' && n.owner === 'player').length;
  }
  closeTip() { if (!this.prompt) return; const w = this.prompt.wait && !this.prompt.cond; this.prompt = null; if (w) this.paused = this.promptWasPaused; }
  // player nodes with raiders on them, taking them, or about to arrive: a horn, a banner, an arrow if off screen
  watchThreats() {
    const S = this.S, now = {};
    for (const n of S.nodes) {
      if (n.dark || n.owner !== 'player') continue;
      let lvl = 0;
      for (const q of S.squads) {
        if (q.side !== 'enemy' || q.worn || q.gone) continue;
        if (q.at === n.id) lvl = Math.max(lvl, 2);
        // a wave or dream-shape whose road ends here: warn as soon as it sets out
        else if (!q.guard && q.path && q.path[q.path.length - 1] === n.id && !hidden(S, q)) lvl = Math.max(lvl, 1);
        else if (q.edge && q.edge[1] === n.id && !hidden(S, q) && (1 - q.prog) * (S.adj[q.edge[0]].find(e => e.to === n.id) || { len: 1 }).len <= 5) lvl = Math.max(lvl, 1);
      }
      if (n.capBy === 'enemy') lvl = 3;
      if (lvl) now[n.id] = lvl;
    }
    for (const id in now) {
      const lvl = now[id], was = this.threats[id] || 0;
      if (lvl > was && (lvl === 3 || !(this.threatCool[id] > this.t))) this.raiseAlert(S.node(id), lvl);
    }
    this.threats = now;
  }
  raiseAlert(n, lvl) {
    const home = n.id === this.def.home;
    const name = home ? 'Home' : { hilltop: 'The hilltop', clover: 'The clover', burrow: 'The burrow', plain: 'The field', fortified: 'The wall', thump: 'The Thump Stone', warren: 'The warren mouth' }[n.kind] || 'A node';
    const text = lvl === 3 ? `${name} (${n.letter}) is being taken!` : lvl === 2 ? `${name} (${n.letter}) is under attack!` : `${this.def.thump ? 'Dream-shapes' : 'Raiders'} are coming for ${name.toLowerCase()} (${n.letter})!`;
    this.threatCool[n.id] = this.t + 12;
    this.alertBanner = { text: text + (home ? ' Send someone back!' : ''), t: home ? 5 : 3.5, home };
    this.alerts.push({ x: n.x, y: n.y, t: 5, node: n.id });
    audio.sfx('alert-horn', { vol: home ? 1 : 0.7 }); if (home) audio.sfx('warren-drum', { vol: 0.8 });
    // with army auto-pause on (Settings), the first threat to home also pauses the battle once
    if (home && !this.homeWarned && G.settings.autoPause !== 'off') { this.homeWarned = true; this.paused = true; this.acc = 0; this.alertBanner.text += ' (paused)'; }
  }
  listSquads() { return this.S.squads.filter(q => q.side === 'player' && !q.gone); }
  selected() { return this.S.squads.filter(q => this.sel.has(q.id) && !q.worn); }
  overHud(m) { return (m.x < 132 && m.y > 40) || m.y > H - 46 || (m.x > W - 140 && m.y < 100) || m.y < 30 || this.side.some(b => m.x >= b.x && m.x < b.x + b.w && m.y >= b.y && m.y < b.y + b.h); }
  handleEvents() {
    for (const e of this.S.events) {
      if (e.k === 'taken') { audio.sfx('node-taken', { vol: 0.7 }); const n = this.S.node(e.node); this.fx.push({ k: 'ripple', x: n.x, y: n.y, t: 0, side: e.side }); }
      if (e.k === 'worn') { audio.sfx('squad-worn', { vol: 0.6 }); this.sel.delete(e.q); }
      if (e.k === 'wave') { const n = this.S.node(e.node); this.alerts.push({ x: n.x, y: n.y, t: 4 }); audio.sfx('alert-horn', { vol: 0.5 }); }
      if (e.k === 'ability') audio.sfx('warren-drum');
    }
    this.S.events.length = 0;
  }
  nodeCommand(n) {
    if (this.targeting) { this.fireAbility(n); return; }
    let any = false; for (const q of this.selected()) any = order(this.S, q, n.id) || any;
    if (any) { audio.sfx('rts-order', { vol: 0.6 }); this.fx.push({ k: 'ping', x: n.x, y: n.y, t: 0 }); this.ordered(); }
  }
  // the first order starts a startOnOrder battle's clock; an order also closes a waiting tip
  ordered() { this.started = true; if (this.prompt && this.prompt.wait && !this.prompt.cond) this.closeTip(); }
  startAbility(id) {
    const A = ABILITY[id]; if (!this.S.abilities.includes(id)) return;
    if (this.S.supply < A.cost) { toast(`Needs ${A.cost} Supply.`, 1.2); return; }
    if (!A.target) { useAbility(this.S, id); audio.synth('confirm'); return; }
    if (id === 'tunnel' && !this.selected().some(q => q.kind === 'stout')) { toast('Select a Stout squad to tunnel.', 1.4); return; }
    this.targeting = id; audio.synth('move');
  }
  fireAbility(n) {
    const id = this.targeting; this.targeting = null;
    const q = id === 'tunnel' ? this.selected().find(q => q.kind === 'stout') : null;
    if (!useAbility(this.S, id, n.id, q)) { audio.synth('cancel'); toast('Can\'t do that there.', 1.2); }
  }
  rightClick(mx, my) {
    // an enemy squad?
    const S = this.S;
    let tgt = null;
    for (const q of S.squads) { if (q.side !== 'enemy' || q.worn || hidden(S, q)) continue; const p = this.sqPos(q); if (Math.abs(p.x - mx) < 14 && my > p.y - 30 && my < p.y + 4) tgt = q; }
    if (tgt && !this.targeting) { let any = false; for (const q of this.selected()) any = orderAttack(S, q, tgt) || any; if (any) { audio.sfx('rts-order', { vol: 0.6 }); this.ordered(); } return; }
    const n = this.nodeAt(mx, my); if (n) this.nodeCommand(n);
  }
  nodeAt(mx, my) { let best = null, bd = 22; for (const n of this.S.nodes) { if (n.dark) continue; const p = this.w2s(n.x, n.y); const d = Math.hypot(p.x - mx, (p.y - my) * 1.6); if (d < bd) { bd = d; best = n; } } return best; }
  finishBox() {
    const b = this.dragBox; this.dragBox = null;
    const x0 = Math.min(b.x, b.x2), x1 = Math.max(b.x, b.x2), y0 = Math.min(b.y, b.y2), y1 = Math.max(b.y, b.y2);
    const S = this.S;
    if (x1 - x0 < 4 && y1 - y0 < 4) {
      // a click: a squad, or empty ground clears
      let hit = null;
      for (const q of this.listSquads()) { if (q.worn) continue; const p = this.sqPos(q); if (Math.abs(p.x - b.x) < 14 && b.y > p.y - 30 && b.y < p.y + 4) hit = q; }
      if (hit) { if (!input.shift) this.sel.clear(); this.sel.add(hit.id); audio.synth('move'); }
      else if (!input.shift) this.sel.clear();
      return;
    }
    if (!input.shift) this.sel.clear();
    for (const q of this.listSquads()) { if (q.worn) continue; const p = this.sqPos(q); if (p.x >= x0 && p.x <= x1 && p.y - 10 >= y0 && p.y - 10 <= y1) this.sel.add(q.id); }
  }
  async finish(result) {
    if (this.done) return;
    this.done = true; this.paused = true;
    audio.music(null); audio.stopThumps();
    if (result === 'win') audio.sfx('victory'); else audio.sfx('squad-worn');
    const homeLost = result === 'lose' && this.S.node(this.def.home).owner === 'enemy';
    this.banner = result === 'win' ? 'Victory!' : 'The army falls back.';
    this.bannerSub = homeLost ? `They took home (${this.S.node(this.def.home).letter}). Keep a squad there next time.` : null;
    if (this.o.revisit) this.revisitResult(result);
    await sleep(this.o.revisit ? 3.2 : 2.2);
    // a revisit (post-game) never counts a loss: the story's "warren rallies" help is left as it was
    if (result === 'lose' && !this.o.revisit) G.s.losses[this.id] = (G.s.losses[this.id] || 0) + 1;
    popScene(this); this.o.done(result);
  }
  // a post-game revisit's time: battle time (sim ticks from the first order; speed and pauses don't count)
  revisitResult(result) {
    if (result !== 'win') { if (!this.bannerSub) this.bannerSub = 'No time this run. Nothing lost: try again from the stone.'; this.rev = { result }; return; }
    const ticks = this.S.tick, easy = !!G.settings.easy, m = medalsOf(this.id);
    const { isNew, prev } = recordBest(this.id, ticks, easy), medal = medalFor(this.id, ticks, easy);
    let sub = `Time ${fmtTime(ticks)}.`;
    if (isNew) sub += prev ? ` New best! (was ${fmtTime(prev.ticks)})` : ' New best!';
    else sub += ` Best ${fmtTime(prev.ticks)}.`;
    if (medal) sub += ` ${MEDAL_NAME[medal]} medal.`;
    if (m && !easy) sub += beatBurdock(this.id, ticks, easy) ? ' Faster than Burdock!' : ticks === Math.round(m.burdock * 10) ? ' Level with Burdock!' : ` Burdock's time: ${fmtSecs(m.burdock)}.`;
    if (easy) sub += ' (Easy: no medal.)';
    this.bannerSub = sub; this.rev = { result, ticks, isNew, medal };
    if (isNew) setTimeout(() => audio.synth('twinkle'), 700);
  }
  // one pause menu at a time, and none once the battle is decided (Retreat after a win used to count a loss)
  openPause() {
    if (this.done || this.pausing || findScene('pause')) return;
    this.pausing = true;
    import('../screens/pause.js').then(m => {
      this.pausing = false;
      if (this.done || findScene('pause') || !G.scenes.includes(this)) return;
      pushScene(new m.PauseScene({ army: true, retreat: () => { if (this.done) return; this.S.result = 'lose'; this.finish('lose'); } }));
    }, () => { this.pausing = false; });
  }
  onBlur() { this.paused = true; }
  tick(dt) { if (this.alertBanner && (this.alertBanner.t -= dt) <= 0) this.alertBanner = null; for (const f of this.fx) f.t += dt; this.fx = this.fx.filter(f => f.t < 1); for (const a of this.alerts) a.t -= dt; this.alerts = this.alerts.filter(a => a.t > 0); if (this.fadeA > 0) this.fadeA = Math.max(0, this.fadeA - dt * 2); }

  // ---------- drawing
  draw(c) {
    const S = this.S;
    c.fillStyle = (this.def.sky) || '#bcd8e0'; c.fillRect(0, 0, W, H);
    const ox = -Math.round(this.camX), oy = -Math.round(this.camY);
    // once the battle has a result, only the banner: no tips, alerts or live controls
    this.side = this.banner ? [] : this.layoutSide();
    const bb = this.banner && this.bannerBox();
    for (const g of this.ground) {
      const s = toScreen(g.x, g.y, g.h); const x = s.x + ox, y = s.y + oy;
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
      c.drawImage(tileImage(this.world, g.kind, Math.max(1, g.h), (g.x * 7 + g.y * 13) % 3, this.def.dark || 0), x - 16, y);
    }
    // nodes
    const items = [];
    for (const n of S.nodes) {
      const p = this.w2s(n.x, n.y);
      if (n.dark) { c.fillStyle = 'rgba(20,10,40,0.5)'; c.beginPath(); c.ellipse(p.x, p.y, 26, 13, 0, 0, 7); c.fill(); continue; }
      const col = n.owner === 'player' ? '#8de08a' : n.owner === 'enemy' ? '#e07a6a' : '#e8dcc0';
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(p.x, p.y, 20, 10, 0, 0, 7); c.fill();
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y, 19, 9.5, 0, 0, 7); c.stroke();
      if (n.kind === 'thump' && n.owner === 'player') { c.strokeStyle = `rgba(240,220,140,${0.5 + 0.4 * Math.sin(this.t * 4)})`; c.beginPath(); c.ellipse(p.x, p.y, 26 + Math.sin(this.t * 4) * 2, 13, 0, 0, 7); c.stroke(); }
      if (this.threats[n.id]) { const k = 0.5 + 0.5 * Math.sin(this.t * 10); c.strokeStyle = `rgba(240,90,70,${0.5 + 0.5 * k})`; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, p.y, 24 + k * 4, 12 + k * 2, 0, 0, 7); c.stroke(); }
      if (n.cap > 0) { const need = 5; c.fillStyle = n.capBy === 'player' ? '#8de08a' : '#e07a6a'; c.fillRect(p.x - 12, p.y + 12, Math.round(24 * Math.min(1, n.cap / need)), 2); }
      const propName = { clover: 'prop-node-clover', hilltop: 'prop-node-flag', burrow: 'prop-node-burrow', thump: 'prop-thump-stone', fortified: 'prop-flint-wall', home: 'prop-warren-entrance', mouth: 'prop-warren-entrance' }[n.kind === 'warren' ? 'mouth' : n.kind];
      if (propName) items.push({ y: p.y - 2, draw: () => { const im = prop(propName); if (im) c.drawImage(im, Math.round(p.x - im.width / 2), Math.round(p.y - im.height + 6)); } });
      const glow = this.targeting && this.validTarget(n);
      // letters are text (drawn above every pixel): skip those under the HUD bars, the squad list and the minimap
      const ly = p.y - 12, underHud = ly < 34 || ly > H - 46 || (p.x < 140 && ly < 40 + Math.min(this.listSquads().length, 13) * 21) || (p.x > W - 146 && ly < 104) || this.side.some(b => p.x > b.x - 6 && p.x < b.x + b.w + 6 && ly > b.y - 2 && ly < b.y + b.h + 10) || (bb && p.x > bb.x - 8 && p.x < bb.x + bb.w + 8 && ly > bb.y - 2 && ly < bb.y + bb.h + 10);
      if (!underHud) items.push({ y: 9999, draw: () => { ui.text(n.letter, p.x, p.y - 12 - (glow ? Math.sin(this.t * 8) * 2 : 0), { align: 'center', size: glow ? 13 : 11, color: glow ? P.gold : col }); if (G.drawingTop) hits.add('node:' + n.letter, p.x - 18, p.y - 18, 36, 28, null, { node: n.id }); } });
    }
    // squads
    for (const q of S.squads) {
      if (q.worn && q.side === 'enemy') continue;
      if (q.gone) continue;
      if (q.side === 'enemy' && hidden(S, q)) continue;
      const p = this.sqPos(q);
      const hid = q.side === 'player' && hidden(S, q);
      items.push({ y: p.y, draw: () => this.drawSquad(c, q, p, hid) });
    }
    items.sort((a, b) => a.y - b.y); for (const it of items) it.draw();
    for (const f of this.fx) { const p = this.w2s(f.x, f.y); if (f.k === 'ripple') { c.strokeStyle = f.side === 'player' ? `rgba(141,224,138,${1 - f.t})` : `rgba(224,122,106,${1 - f.t})`; c.beginPath(); c.ellipse(p.x, p.y, 20 + f.t * 20, 10 + f.t * 10, 0, 0, 7); c.stroke(); } if (f.k === 'ping') { c.strokeStyle = `rgba(232,201,90,${1 - f.t})`; c.beginPath(); c.ellipse(p.x, p.y, 8 + f.t * 14, 4 + f.t * 7, 0, 0, 7); c.stroke(); } }
    if (this.dragBox) { const b = this.dragBox; c.strokeStyle = P.gold; c.lineWidth = 1; c.strokeRect(Math.min(b.x, b.x2) + 0.5, Math.min(b.y, b.y2) + 0.5, Math.abs(b.x2 - b.x), Math.abs(b.y2 - b.y)); }
    if (!this.banner) this.drawAlerts(c);
    this.drawHud(c);
    this.drawSide(c);
    if (this.banner) {
      const b = this.bannerBox(), cx = b.x + b.w / 2, win = this.banner === 'Victory!';
      panel(c, b.x, b.y, b.w, b.h, { fill: win ? '#2f4a2c' : '#4a2a30' });
      ui.text(this.banner, cx, b.y + 28, { align: 'center', size: 16, color: win ? P.gold : '#f0d0b0' });
      b.sub.forEach((l, i) => ui.text(l, cx, b.y + 46 + i * 12, { align: 'center', size: 9, color: P.chalk }));
    }
    fade(c, this.fadeA);
  }
  // the result banner, centred on the clear field
  bannerBox() { const sub = this.bannerSub ? ui.wrap(this.bannerSub, 260, 9, true) : []; return { x: Math.round((CLEAR.l + W - 4) / 2) - 150, y: 130, w: 300, h: 42 + sub.length * 12, sub }; }
  validTarget(n) { if (this.targeting === 'tunnel') return n.kind === 'burrow' && n.owner === 'player'; return true; }
  drawSquad(c, q, p, hid) {
    const D = q.side === 'player' ? SQUADS[q.sq] : ENEMY_SQUADS[q.sq];
    let img = D.battleSprite ? sprite('battle', D.sprite) : sprite(D.kid ? 'map' : 'map', D.sprite);
    const fl = FLAP[D.sprite] && anim('map', FLAP[D.sprite]); if (fl) img = frame(fl, Math.floor(this.t * 8 + q.id) % fl.n, FLAP[D.sprite]);
    if (!img) img = placeholder(18, 24, q.side === 'player' ? '#8a7a5a' : '#7a5a6a');
    if (D.fur) img = furRamp(img, FUR[D.fur]);
    if (D.look === 'hollow') img = silhouette(img, '#3a3a7a', 0.72);
    if (D.look === 'dream') img = silhouette(img, '#6a4a8a', 0.85);
    if (q.side === 'enemy' && !D.look && (q.sq === 'raiders' || q.sq === 'diggers' || q.sq === 'lookouts')) img = humEyes(img);
    if (q.side === 'enemy') img = flipped(img);
    const n = D.one ? 1 : q.worn ? 1 : Math.max(1, Math.ceil(5 * q.hp / q.maxHp));
    const offs = [[0, 0], [-9, -4], [9, -4], [-5, 5], [6, 5]];
    const bob = q.path && !q.contact ? Math.abs(Math.sin(this.t * 8 + q.id)) * 2 : 0;
    c.globalAlpha = q.worn ? 0.35 : hid ? 0.55 : 1;
    if (this.sel.has(q.id)) { c.strokeStyle = P.gold; c.lineWidth = 1; c.beginPath(); c.ellipse(p.x, p.y, 16, 8, 0, 0, 7); c.stroke(); }
    const idx = [3, 4, 1, 2, 0].filter(i => i < n).sort((a, b) => offs[a][1] - offs[b][1]);
    for (const i of idx) { const [dx, dy] = offs[i]; c.drawImage(img, Math.round(p.x + dx - img.width / 2), Math.round(p.y + dy - img.height + 2 - bob)); }
    // banner
    c.fillStyle = P.bark; c.fillRect(Math.round(p.x + 12), Math.round(p.y - 30), 1, 18);
    c.fillStyle = D.color || (q.side === 'player' ? '#c9b458' : '#a04040'); c.fillRect(Math.round(p.x + 13), Math.round(p.y - 30 + Math.sin(this.t * 5 + q.id)), 7, 5);
    c.globalAlpha = 1;
    if (!q.worn) bar(c, Math.round(p.x - 12), Math.round(p.y + 6), 24, 2, q.hp / q.maxHp, q.side === 'player' ? '#8de08a' : '#e07a6a');
    if (q.contact && !q.worn) { c.fillStyle = '#fff'; const k = Math.floor(this.t * 10) % 2; if (k) { c.fillRect(Math.round(p.x - 2), Math.round(p.y - 34), 4, 1); c.fillRect(Math.round(p.x - 1), Math.round(p.y - 36), 2, 5); } }
  }
  drawAlerts(c) {
    // threatened player nodes keep an arrow while they're off screen (or under the HUD)
    const marks = this.alerts.slice();
    for (const id in this.threats) { const n = this.S.node(id); if (!marks.some(a => a.node === id)) marks.push({ x: n.x, y: n.y, node: id, threat: true }); }
    for (const a of marks) {
      const p = this.w2s(a.x, a.y);
      if (p.x > CLEAR.l + 6 && p.x < CLEAR.r - 6 && p.y > CLEAR.t + 12 && p.y < CLEAR.b - 12) continue;
      const x = clamp(p.x, CLEAR.l + 12, CLEAR.r - 12), y = clamp(p.y, CLEAR.t + 14, CLEAR.b - 14);
      const big = a.node === this.def.home && this.threats[a.node];
      c.fillStyle = Math.floor(this.t * 4) % 2 ? '#e07a6a' : '#f0d880';
      const ang = Math.atan2(p.y - y, p.x - x), sc = big ? 1.5 : 1;
      c.save(); c.translate(x, y); c.rotate(ang); c.scale(sc, sc); c.strokeStyle = '#2a1a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(10, 0); c.lineTo(-6, -7); c.lineTo(-6, 7); c.closePath(); c.stroke(); c.fill(); c.restore();
      const n = a.node && this.S.node(a.node); if (n && this.threats[a.node]) ui.text(n.letter, x - Math.cos(ang) * 14, y - Math.sin(ang) * 14 + 4, { align: 'center', size: 10, color: P.chalk });
      if (G.drawingTop) hits.add('alert', x - 10, y - 10, 20, 20);
      if (mouseIn(x - 10, y - 10, 20, 20) && input.click()) { input.mouse.pressed[0] = false; this.centerOn(a.x, a.y); }
    }
  }
  drawHud(c) {
    const S = this.S;
    // top bar
    c.fillStyle = 'rgba(18,14,24,0.75)'; c.fillRect(0, 0, W, 26);
    ui.text(this.data.name, 8, 17, { size: 10, color: P.gold });
    drawIcon(c, 'ico-supply', 210, 5, 16); ui.text('Supply ' + Math.floor(S.supply), 228, 17, { size: 10 });
    if (this.def.thump) ui.text(`The Long Thump: ${Math.floor(S.thumpT)} / 60`, 320, 17, { size: 10, color: '#f0d880' });
    else if (S.holdT > 0) ui.text(`Holding: ${Math.ceil(10 - S.holdT)}`, 320, 17, { size: 10, color: '#8de08a' });
    const live = !this.done;
    if (live && button(c, this.paused ? 'Play' : 'Pause', W - 222, 3, 52, 20, { size: 9, hitLabel: 'Pause/Play' })) this.paused = !this.paused;
    if (live && button(c, this.speed + 'x', W - 166, 3, 30, 20, { size: 9, hitLabel: 'Speed' })) this.speed = this.speed === 1 ? 2 : 1;
    // squad list
    const mine = this.listSquads();
    c.fillStyle = 'rgba(18,14,24,0.7)'; c.fillRect(0, 30, 130, Math.min(mine.length, 13) * 21 + 6);
    mine.slice(0, 13).forEach((q, i) => {
      const y = 33 + i * 21, D = SQUADS[q.sq];
      const sel = this.sel.has(q.id);
      if (sel) { c.fillStyle = 'rgba(232,201,90,0.25)'; c.fillRect(2, y, 126, 20); }
      if (G.drawingTop) hits.add('squad:' + D.name, 2, y, 126, 20, null, { squad: q.id });
      if (live && mouseIn(2, y, 126, 20) && input.click()) { input.mouse.pressed[0] = false; if (!input.shift) this.sel.clear(); if (!q.worn) this.sel.add(q.id); audio.synth('move'); if (q && !q.worn) {} }
      ui.text(i < 10 ? String((i + 1) % 10) : '', 6, y + 13, { size: 8, color: '#8a7e9a' });
      drawIcon(c, KINDS[q.kind].icon, 14, y + 2, 16);
      ui.text(D.name, 32, y + 9, { size: 8, color: q.worn ? '#6a6070' : P.chalk });
      bar(c, 32, y + 13, 90, 3, q.hp / q.maxHp, q.worn ? '#555' : '#8de08a');
    });
    // bottom: reinforce + abilities
    c.fillStyle = 'rgba(18,14,24,0.75)'; c.fillRect(0, H - 44, W, 44);
    if (!live) { this.drawMinimap(c); return; }
    const nsel = this.selected().length;
    if (button(c, 'Reinforce (T) 10', 140, H - 38, 120, 30, { size: 9, icon: 'ico-reinforce', disabled: !nsel || S.supply < 10, hitLabel: 'Reinforce' })) { let any = false; for (const q of this.selected()) any = reinforce(S, q) || any; if (!any) toast('Reinforce works on a friendly node, out of a fight.', 1.6); }
    let x = 268;
    for (const [id, A] of Object.entries(ABILITY)) {
      if (!S.abilities.includes(id)) continue;
      const key = A.key.slice(3);
      const label = `${A.name} (${key}) ${A.cost}`;
      if (button(c, label, x, H - 38, 116, 30, { size: 8, icon: 'ico-' + (id === 'monkey' ? 'monkey-drop' : id), disabled: S.supply < A.cost || (id === 'monkey' && S.monkeysUsed >= 2), sel: this.targeting === id, hitLabel: A.name })) this.startAbility(id);
      x += 120;
    }
    if (this.targeting) ui.text('Choose a node: press its letter or right-click it. Esc cancels.', 140, H - 48, { size: 9, color: P.gold });
    else if (!nsel) ui.text('Click a squad, then right-click a node (or press its letter).', 140, H - 48, { size: 9, color: '#c8bca8' });
    if (this.targeting || !nsel) { const tw = ui.measure(this.targeting ? 'Choose a node: press its letter or right-click it. Esc cancels.' : 'Click a squad, then right-click a node (or press its letter).', 9); c.fillStyle = 'rgba(18,14,24,0.75)'; c.fillRect(134, H - 58, Math.round(tw) + 12, 14); }
    this.drawMinimap(c);
  }
  drawMinimap(c) {
    const x0 = W - 134, y0 = 30, w = 128, h = 64, N = this.N, S = this.S;
    c.fillStyle = 'rgba(18,14,24,0.85)'; c.fillRect(x0 - 3, y0 - 3, w + 6, h + 6);
    c.fillStyle = '#4a6a3a'; c.beginPath(); c.moveTo(x0 + w / 2, y0); c.lineTo(x0 + w, y0 + h / 2); c.lineTo(x0 + w / 2, y0 + h); c.lineTo(x0, y0 + h / 2); c.fill();
    const mp = (x, y) => [x0 + w / 2 + (x - y) / N * w / 2, y0 + (x + y) / N * h / 2];
    for (const n of S.nodes) { if (n.dark) continue; const [px, py] = mp(n.x, n.y); c.fillStyle = n.owner === 'player' ? '#8de08a' : n.owner === 'enemy' ? '#e07a6a' : '#e8dcc0'; c.fillRect(px - 2, py - 2, 4, 4); ui.text(n.letter, px + 3, py + 2, { size: 7 }); }
    for (const q of S.squads) { if (q.worn || q.gone || (q.side === 'enemy' && hidden(S, q))) continue; const [px, py] = mp(q.x, q.y); c.fillStyle = q.side === 'player' ? '#f0f0a0' : '#ff6050'; c.fillRect(px - 1, py - 1, 2, 2); }
    // view rectangle
    const cx = this.camX + W / 2, cy = this.camY + H / 2; const tx = (cx / 16 + (cy - 8) / 8) / 2, ty = ((cy - 8) / 8 - cx / 16) / 2;
    const [vx, vy] = mp(tx, ty); const rw = W / 16 / N * w / 2, rh = H / 8 / N * h / 2;
    c.save(); c.beginPath(); c.rect(x0 - 3, y0 - 3, w + 6, h + 6); c.clip();
    c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(Math.round(vx - rw / 2) + 0.5, Math.round(vy - rh / 2) + 0.5, Math.round(rw), Math.round(rh)); c.restore();
    if (G.drawingTop) hits.add('minimap', x0, y0, w, h);
    const m = input.mouse;
    if (mouseIn(x0, y0, w, h)) {
      const u = (m.x - x0 - w / 2) / (w / 2) * N, v = (m.y - y0) / (h / 2) * N; const wx = (u + v) / 2, wy = (v - u) / 2;
      if (input.click()) { input.mouse.pressed[0] = false; this.centerOn(wx, wy); }
      if (input.rclick()) { input.mouse.pressed[2] = false; let best = null, bd = 1e9; for (const n of S.nodes) { if (n.dark) continue; const d = Math.hypot(n.x - wx, n.y - wy); if (d < bd) { bd = d; best = n; } } if (best) this.nodeCommand(best); }
    }
  }
  // the column under the minimap: the clock notice (or PAUSED), the raid alert, the tutorial tip
  layoutSide() {
    const out = []; let y = SIDE.y;
    const add = (k, text, size, hint) => {
      const lines = ui.wrap(text, SIDE.w - 14, size, true), lh = size + 3, h = lines.length * lh + 10 + (hint ? 10 : 0);
      out.push({ k, lines, size, lh, hint, x: SIDE.x, y, w: SIDE.w, h }); y += h + 3;
    };
    const ab = this.alertBanner;
    if (!this.started) add('clock', 'The battle begins with your first order.', 9);
    else if (this.o.revisit && !this.banner) { const b = bestOf(this.id); add('time', `Time ${fmtTime(this.S.tick)}${this.paused ? ' (paused)' : ''}` + (b ? `   Best ${fmtTime(b.ticks)}` : ''), 9); }
    else if (this.paused && !(ab && ab.text.endsWith('(paused)'))) add('paused', 'PAUSED (orders still work)', 9);
    if (ab) add('alert', ab.text, 10);
    if (this.prompt) add('tip', this.prompt.text, 9, this.prompt.wait && !this.prompt.cond);
    return out;
  }
  dodgeSide() {
    const side = this.layoutSide(); if (!side.length) return;
    const top = 26, bot = side[side.length - 1].y + side[side.length - 1].h;   // the minimap and the column under it
    const ps = this.listSquads().filter(q => !q.worn).map(q => this.sqPos(q)).filter(p => p.x > CLEAR.l - 40 && p.x < W + 40 && p.y > CLEAR.t && p.y < CLEAR.b + 30);
    // your squads, and enemies near or under the column's edge (fighting, or the next to fight)
    const foes = this.S.squads.filter(q => q.side === 'enemy' && !q.worn && !q.gone && !hidden(this.S, q)).map(q => this.sqPos(q)).filter(p => p.x < SIDE.x + 110);
    const under = [...ps, ...foes].filter(p => p.x + 16 > SIDE.x - 4 && p.x - 16 < W && p.y > top - 4 && p.y - 32 < bot);
    if (!under.length) return;
    // ...without pushing your squads or your nodes in view under the squad list
    const homes = this.S.nodes.filter(n => n.owner === 'player' && !n.dark).map(n => this.w2s(n.x, n.y).x - 30).filter(x => x > CLEAR.l - 30 && x < W);
    const need = Math.max(...under.map(p => p.x + 18)) - (SIDE.x - 6), room = Math.min(...ps.map(p => p.x - 18), ...homes) - CLEAR.l;
    const dx = Math.min(need, Math.max(0, room));
    if (dx > 0) { this.camTX += dx; this.clampCam(); }
  }
  drawSide(c) {
    this.promptBox = null;
    const flash = Math.floor(this.t * 4) % 2;
    for (const b of this.side) {
      const fill = b.k === 'alert' ? (flash ? '#7a2a28' : '#5a2030') : b.k === 'tip' ? '#3a2f48' : '#2a2236';
      const col = b.k === 'alert' ? (flash ? '#fff0c0' : P.gold) : b.k === 'tip' ? P.chalk : '#f0d880';
      panel(c, b.x, b.y, b.w, b.h, { fill });
      b.lines.forEach((l, i) => ui.text(l, b.x + 7, b.y + 4 + b.size + i * b.lh, { size: b.size, color: col }));
      if (b.k === 'tip') {
        this.promptBox = { x: b.x, y: b.y, w: b.w, h: b.h };
        if (G.drawingTop) hits.add('tip', b.x, b.y, b.w, b.h);
        if (b.hint) ui.text('Space or click', b.x + b.w - 7, b.y + b.h - 5, { align: 'right', size: 8, color: '#b8acc8' });
      }
      if (b.k === 'alert') {
        // a click on the alert looks at the threatened node
        const id = Object.keys(this.threats).sort((p, q) => this.threats[q] - this.threats[p])[0];
        if (id && mouseIn(b.x, b.y, b.w, b.h) && input.click()) { input.mouse.pressed[0] = false; const n = this.S.node(id); this.centerOn(n.x, n.y); }
      }
    }
  }
  summary() {
    const S = this.S;
    return { battle: this.id, tick: S.tick, paused: this.paused, speed: this.speed, supply: Math.floor(S.supply), result: S.result, targeting: this.targeting, holdT: S.holdT, thumpT: S.thumpT,
      camera: { x: Math.round(this.camX), y: Math.round(this.camY) }, prompt: this.prompt ? this.prompt.text : null, started: this.started,
      alert: this.alertBanner ? this.alertBanner.text : null, threats: { ...this.threats },
      nodes: S.nodes.filter(n => !n.dark).map(n => ({ id: n.id, letter: n.letter, kind: n.kind, owner: n.owner, x: n.x, y: n.y, screen: this.w2s(n.x, n.y) })),
      squads: S.squads.filter(q => !q.gone).map(q => ({ screen: (p => ({ x: Math.round(p.x), y: Math.round(p.y) }))(this.sqPos(q)), id: q.id, side: q.side, sq: q.sq, kind: q.kind, hp: Math.round(q.hp), max: Math.round(q.maxHp), at: q.at, edge: q.edge, worn: q.worn, selected: this.sel.has(q.id), contact: !!q.contact, hidden: hidden(S, q), x: q.x, y: q.y })),
      list: this.listSquads().map(q => q.id), selected: [...this.sel],
      revisit: !!this.o.revisit, banner: this.banner || null, bannerSub: this.bannerSub || null, rev: this.rev || null };
  }
}
