// Title screen: painted key art, the title in the game's font, Continue / New Game / Load / Settings.
import { G, W, H, ui, pushScene, popScene, replaceScenes, toast, findScene } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { bg } from '../engine/assets.js';
import { button, fade, panel } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { hasAnySave, latest, slots, keepPreviousAutosave, mapExists, wonSaves, freeSlot, saveStateToSlot } from '../engine/save.js';
import { newGame } from '../state.js';

export async function startGame(saveState) {
  const { ExploreScene } = await import('../world/explore.js');
  const ex = new ExploreScene();
  replaceScenes(ex);
  if (saveState) {
    G.s = JSON.parse(JSON.stringify(saveState));
    if (!Array.isArray(G.s.escorts)) G.s.escorts = oldSaveEscorts(G.s);
    G.s.lastDoor = G.s.lastDoor || { map: G.s.map, x: G.s.x, y: G.s.y, f: G.s.facing };
    if (G.data.onLoad) G.data.onLoad(G.s);
    if (!await loadOrFallBack(ex, G.s.map, G.s.x, G.s.y, G.s.facing)) return null;
    if (G.data.resumeScript) ex.queueScript(G.data.resumeScript);
    // a save made before the intro finished (New Game autosaves on arrival) plays the intro again, so the quest is set
    else if (!G.s.flags.c0_intro && G.data.start && G.data.start.script) ex.queueScript(G.data.start.script);
  } else {
    keepPreviousAutosave();   // the last run's autosave stays loadable as "Previous autosave"
    newGame();
    const st = G.data.start;
    G.s.lastDoor = { map: st.map, x: st.x, y: st.y, f: st.facing };
    await ex.load(st.map, st.x, st.y, st.facing, { noEnter: true });
    if (st.script) ex.queueScript(st.script);
  }
  return ex;
}

// New Game+ from a won save's state (design/changes/ngplus.md). The caller has already made sure the won save is kept
// in a slot; the autosave moves to "Previous autosave" as with New Game.
export async function startNgPlus(src) {
  const { ExploreScene } = await import('../world/explore.js');
  const ex = new ExploreScene();
  replaceScenes(ex);
  keepPreviousAutosave();
  newGame(src);
  const st = G.data.start;
  G.s.lastDoor = { map: st.map, x: st.x, y: st.y, f: st.facing };
  await ex.load(st.map, st.x, st.y, st.facing, { noEnter: true });
  ex.queueScript(async s => {
    await s.say('woodruff', 'Again? Good. Stories are better the second time. Everyone already knows their part.');
    const f = typeof st.script === 'string' ? G.data.scripts[st.script] : st.script;
    if (f) await f(s);
  });
  return ex;
}
// from inside a running script (Woodruff's offer): start New Game+ only once that script, and the autosave it may have
// asked for, are finished (a new game must never start under a running scene)
export function requestNgPlus(src) {
  G.pendingNgPlus = src;
  const tick = () => {
    if (!G.pendingNgPlus) return;
    const ex = findScene('explore');
    if (ex && (ex.busy > 0 || ex.savePending)) { setTimeout(tick, 100); return; }
    const s = G.pendingNgPlus; G.pendingNgPlus = null; startNgPlus(s);
  };
  setTimeout(tick, 100);
}

// a save whose map is gone (renamed in an update, or a broken save) goes to its last door, else the start: never a dead screen
async function loadOrFallBack(ex, map, x, y, f) {
  const tries = [[map, x, y, f]];
  const d = G.s.lastDoor; if (d && d.map) tries.push([d.map, d.x, d.y, d.f]);
  const st = G.data.start; if (st) tries.push([st.map, st.x, st.y, st.facing]);
  for (let i = 0; i < tries.length; i++) {
    const [m, tx, ty, tf] = tries[i];
    if (!mapExists(m)) continue;
    try {
      await ex.load(m, tx, ty, tf, { noEnter: true, noSave: true });
      if (i > 0) { G.s.lastDoor = { map: m, x: ex.b.x, y: ex.b.y, f: ex.b.facing }; toast('That save pointed at a place that no longer exists, so you\'re back at ' + (G.s.placeName || 'a safe spot') + '.', 4); }
      return true;
    } catch (e) { console.warn('save load failed at', m, e); }
  }
  toast('That save couldn\'t be loaded.', 4);
  const { quitToTitle } = await import('./pause.js');
  await quitToTitle();
  return false;
}

// saves from before escorts were saved: put back the escorts the story flags say should be following
function oldSaveEscorts(s) {
  const f = k => !!s.flags[k], out = [];
  if (f('c4_rumble_met') && !f('c4_herd_done')) out.push({ id: 'rumble', sprite: 'rumble' });
  if (f('c3_pipSearching') && !f('c3_bellHung')) out.push({ id: 'pip', sprite: 'pip', kid: true });
  return out;
}

export class TitleScene {
  constructor() { this.kind = 'title'; this.opaque = true; this.t = 0; this.started = false; this.sel = 0; this.fadeA = 0; }
  enter() { if (audio.ctx) audio.music('m-title'); }
  resume() { this.items = null; }
  menu() {
    if (this.items) return this.items;
    const it = [];
    if (hasAnySave()) it.push('Continue');
    it.push('New Game');
    if (wonSaves().length) it.push('New Game+');
    if (hasAnySave()) it.push('Load');
    it.push('Settings');
    return this.items = it;
  }
  update(dt) {
    this.t += dt;
    if (!this.started) { if (input.anyPressed) { this.started = true; audio.unlock(); audio.music('m-title'); input.eatAll(); } return; }
    const it = this.menu();
    if (input.up()) { this.sel = (this.sel + it.length - 1) % it.length; audio.synth('move'); }
    if (input.down()) { this.sel = (this.sel + 1) % it.length; audio.synth('move'); }
    if (input.act()) this.choose(it[this.sel]);
  }
  async choose(name) {
    audio.synth('confirm');
    if (name === 'Continue') { const l = latest(); if (l) { this.leaving = true; await startGame(l.s); } }
    if (name === 'New Game') {
      if (hasAnySave()) {
        const { ConfirmScene } = await import('./pause.js');
        const hasAuto = !!slots().auto;
        pushScene(new ConfirmScene(hasAuto ? 'Start a new game? Your autosave moves to Load as "Previous autosave" (replacing any older one there). Save slots are not touched.' : 'Start a new game? Your saves stay in Load, untouched.', async ok => { if (ok) { this.leaving = true; await startGame(null); } }));
      } else { this.leaving = true; await startGame(null); }
    }
    if (name === 'New Game+') await this.ngPlus();
    if (name === 'Load') { const { LoadScene } = await import('./pause.js'); pushScene(new LoadScene()); }
    if (name === 'Settings') { const { SettingsScene } = await import('./pause.js'); pushScene(new SettingsScene()); }
  }
  // New Game+ never moves or overwrites the won save it starts from: one in a slot stays there; otherwise it is copied
  // into a free slot first, or (no slot free) the player picks the slot to keep it in
  async ngPlus() {
    const w = wonSaves()[0]; if (!w) return;
    const { ConfirmScene, LoadScene } = await import('./pause.js');
    const b = w.e.s.party.members.bramble, lv = b ? b.lvl : 1;
    const confirm = (where, copy) => pushScene(new ConfirmScene(`Start New Game+ from your finished game? Bramble (Lv ${lv}) and every friend keep their levels; the story, gear, items and buttons start again. ${where} The autosave moves to Load as "Previous autosave".`,
      async ok => { if (!ok) return; if (copy && !copy()) { toast('Couldn\'t keep a copy of your finished game (storage is full or blocked).', 4); return; } this.leaving = true; await startNgPlus(w.e.s); }));
    if (w.kind === 'slot') return confirm(`Your finished game stays in Slot ${w.i + 1}.`);
    const f = freeSlot();
    if (f >= 0) return confirm(`Your finished game is copied into Slot ${f + 1} first, so it's kept.`, () => saveStateToSlot(f, w.e.s, w.e.when));
    pushScene(new LoadScene(true, { title: 'Keep your finished game in which slot?', onPick: i => confirm(`Your finished game is copied into Slot ${i + 1} first (replacing what's there), so it's kept.`, () => saveStateToSlot(i, w.e.s, w.e.when)) }));
  }
  draw(c, isTop = true) {
    const b = bg('bg-title');
    if (b) c.drawImage(b, 0, 0); else { c.fillStyle = '#3a2f48'; c.fillRect(0, 0, W, H); }
    // soft top gradient for the title
    const g = c.createLinearGradient(0, 0, 0, 130); g.addColorStop(0, 'rgba(25,18,40,0.65)'); g.addColorStop(1, 'rgba(25,18,40,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 130);
    ui.text('Warren Peace', W / 2, 66, { align: 'center', size: 40, color: '#f6e7b8', shadow: 'rgba(40,20,30,0.9)' });
    ui.text('a war between warrens, and the long way down to peace', W / 2, 88, { align: 'center', size: 10, color: '#e8dcc0' });
    if (!this.started) {
      const a = 0.55 + 0.45 * Math.sin(this.t * 3);
      ui.text('Press any key', W / 2, 300, { align: 'center', size: 13, color: P.chalk, alpha: a });
      return;
    }
    // under Settings / Load / a confirm: only the art (dimmed by that panel), so no half-hidden menu peeks out beside it
    if (!isTop) return;
    const it = this.menu();
    // the menu sits right of centre, beside Bramble rather than over him
    const y0 = it.length >= 5 ? 188 : 214, mx = 470;   // five items: start higher, clear of the controls hint
    panel(c, mx - 74, y0 - 10, 148, it.length * 26 + 14, { fill: 'rgba(43,34,54,0.85)' });
    it.forEach((name, i) => { if (button(c, name, mx - 64, y0 + i * 26, 128, 22, { sel: i === this.sel, size: 11 })) { this.sel = i; this.choose(name); } });
    // the controls hint on a soft dark band: the art at the bottom is light rocks and flowers
    const hg = c.createLinearGradient(0, H - 32, 0, H); hg.addColorStop(0, 'rgba(20,14,30,0)'); hg.addColorStop(0.4, 'rgba(20,14,30,0.72)'); hg.addColorStop(1, 'rgba(20,14,30,0.82)');
    c.fillStyle = hg; c.fillRect(0, H - 32, W, 32);
    ui.text('Arrows and Space, or the mouse.  M mutes.', W / 2, H - 9, { align: 'center', size: 8, color: '#efe4c8' });
  }
}
