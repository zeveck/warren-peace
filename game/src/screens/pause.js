// Pause, save/load slots, settings, and a yes/no confirm.
import { G, W, H, ui, pushScene, popScene, findScene, toast } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { panel, button, fade, drawFace } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { saveSlot, slots, saveSettings } from '../engine/save.js';

// A vertical menu: items [{label, fn, disabled}]
class Menu {
  constructor(title, items, o = {}) { this.title = title; this.items = items; this.sel = 0; this.o = o; }
  update() {
    const n = this.items.length;
    if (input.up()) { do { this.sel = (this.sel + n - 1) % n; } while (this.items[this.sel].disabled && n > 1); audio.synth('move'); }
    if (input.down()) { do { this.sel = (this.sel + 1) % n; } while (this.items[this.sel].disabled && n > 1); audio.synth('move'); }
    if (input.act()) { const it = this.items[this.sel]; if (!it.disabled) { audio.synth('confirm'); it.fn(); } }
  }
  draw(c, x, y, w) {
    if (this.title) ui.text(this.title, x + w / 2, y - 8, { align: 'center', size: 14, color: P.gold });
    this.items.forEach((it, i) => { if (button(c, it.label, x, y + i * 26, w, 22, { sel: i === this.sel, disabled: it.disabled, size: 10 })) { this.sel = i; it.fn(); } });
  }
}

export class PauseScene {
  constructor(o = {}) {
    this.kind = 'pause'; this.o = o; G.paused = true;
    const inBattle = !!o.army;
    const items = [{ label: 'Resume', fn: () => this.close() }];
    if (!inBattle) items.push({ label: 'Save', fn: () => pushScene(new LoadScene(true)) });
    items.push({ label: 'Load', fn: () => pushScene(new LoadScene(false)) });
    items.push({ label: 'Settings', fn: () => pushScene(new SettingsScene()) });
    if (o.retreat) items.push({ label: 'Retreat', fn: () => { this.close(); o.retreat(); } });
    items.push({ label: 'Quit to title', fn: () => pushScene(new ConfirmScene('Quit to the title? Progress since your last save will be lost (the game autosaves at every doorway).', ok => { if (ok) quitToTitle(); })) });
    this.menu = new Menu('Paused', items);
  }
  enter() { audio.duck(true); }
  exit() { audio.duck(false); G.paused = false; }
  close() { popScene(this); }
  update() { if (input.back() || input.isPressed('KeyP')) { this.close(); return; } this.menu.update(); }
  draw(c, isTop = true) {
    c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(0, 0, W, H);
    if (!isTop) return;   // under Save / Load / Settings / the quit confirm: just the dim, no half-covered menu around it
    const h = this.menu.items.length * 26 + 50;
    panel(c, W / 2 - 90, H / 2 - h / 2 - 10, 180, h + 10);
    this.menu.draw(c, W / 2 - 70, H / 2 - h / 2 + 30, 140);
    if (G.s) { const t = Math.floor(G.s.playTime || 0); ui.text(`Play time ${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}`, W / 2, H / 2 + h / 2 - 6, { align: 'center', size: 8, color: '#b8acc8' }); }
  }
}
export async function quitToTitle() {
  audio.stopAmbience(); audio.stopThumps();
  const { TitleScene } = await import('./title.js');
  while (G.scenes.length) popScene();
  G.s = null; G.paused = false;
  const t = new TitleScene(); t.started = true; pushScene(t); audio.music('m-title');
}

export class ConfirmScene {
  constructor(text, cb) { this.kind = 'confirm'; this.text = text; this.cb = cb; this.menu = new Menu(null, [{ label: 'Yes', fn: () => this.done(true) }, { label: 'No', fn: () => this.done(false) }]); this.menu.sel = 1; }
  done(v) { popScene(this); this.cb(v); }
  update() { if (input.back()) { this.done(false); return; } this.menu.update(); }
  draw(c) {
    c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(0, 0, W, H);
    const lines = ui.wrap(this.text, 280, 10);
    const h = lines.length * 13 + 80;
    panel(c, W / 2 - 160, H / 2 - h / 2, 320, h);
    lines.forEach((l, i) => ui.text(l, W / 2, H / 2 - h / 2 + 22 + i * 13, { align: 'center', size: 10 }));
    this.menu.draw(c, W / 2 - 50, H / 2 - h / 2 + 30 + lines.length * 13, 100);
  }
}

function fmtWhen(ms) { const d = new Date(ms); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }
const CH = ['Prologue', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Finale', 'Epilogue'];
export class LoadScene {
  // o (New Game+ keeping the won save): { title, onPick(slotIndex) } picks a slot instead of saving the running game
  constructor(saving, o = {}) { this.kind = 'load'; this.saving = saving; this.o = o; this.sel = 0; this.refresh(); }
  refresh() { const s = slots(); this.entries = this.saving ? s.slots.map((e, i) => ({ e, i })) : [s.auto ? { e: s.auto, auto: true } : null, s.prev ? { e: s.prev, prev: true } : null, ...s.slots.map((e, i) => ({ e, i }))].filter(Boolean); }
  update() {
    if (input.back()) { popScene(this); return; }
    const n = this.entries.length;
    if (input.up()) { this.sel = (this.sel + n - 1) % n; audio.synth('move'); }
    if (input.down()) { this.sel = (this.sel + 1) % n; audio.synth('move'); }
    if (input.act()) this.pick(this.entries[this.sel]);
  }
  async pick(en) {
    if (this.saving && this.o.onPick) { audio.synth('confirm'); popScene(this); this.o.onPick(en.i); return; }
    if (this.saving) {
      if (saveSlot(en.i)) { audio.synth('confirm'); toast('Saved in slot ' + (en.i + 1) + '.'); this.refresh(); } else toast('Couldn\'t save (storage is full or blocked).');
      return;
    }
    if (!en.e) { audio.synth('cancel'); return; }
    audio.synth('confirm');
    const { startGame } = await import('./title.js');
    await startGame(en.e.s);
  }
  draw(c) {
    c.fillStyle = 'rgba(10,8,16,0.7)'; c.fillRect(0, 0, W, H);
    panel(c, 120, 30, 400, 300);
    ui.text(this.o.title || (this.saving ? 'Save' : 'Load'), W / 2, 54, { align: 'center', size: 14, color: P.gold });
    this.entries.forEach((en, j) => {
      // three save slots sit centred; four with the autosave; five (tighter rows) with the previous run's autosave too
      const tight = this.entries.length > 4, step = tight ? 45 : 56, bh = tight ? 42 : 50;
      const y = (this.saving ? 94 : tight ? 62 : 66) + j * step, sel = j === this.sel;
      const label = en.auto ? 'Autosave' : en.prev ? 'Previous autosave' : 'Slot ' + (en.i + 1);
      if (button(c, '', 134, y, 372, bh, { sel, hitLabel: label })) { this.sel = j; this.pick(en); }
      ui.text(label, 144, y + (tight ? 13 : 16), { size: 10, color: P.gold });
      if (en.e) {
        const s = en.e.s; const t = Math.floor(s.playTime || 0);
        ui.text(`${CH[s.chapter] || ''}: ${s.placeName || s.map}`, 144, y + (tight ? 26 : 31), { size: 9 });
        // New Game+ saves carry a small gold tag beside the slot's name
        if (s.ng && s.ng.cycle) ui.text(s.ng.cycle > 1 ? `New Game+ ${s.ng.cycle}` : 'New Game+', 144 + ui.measure(label, 10) + 10, y + (tight ? 13 : 16), { size: 8, color: P.gold });
        ui.text(`${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}  ·  ${fmtWhen(en.e.when)}`, 144, y + (tight ? 37 : 44), { size: 8, color: '#b8acc8' });
        const ids = ['bramble', ...(s.party.active || [])];
        ids.forEach((id, k) => drawFace(c, id, 420 + k * 28, y + (tight ? 10 : 14), 24));
      } else ui.text('Empty', 144, y + (tight ? 27 : 32), { size: 9, color: '#8a7e9a' });
    });
    if (button(c, 'Back', W / 2 - 40, 293, 80, 18, { size: 9 })) { popScene(this); return; }
    ui.text('Esc', W / 2 + 48, 305, { size: 8, color: '#8a7e9a' });
  }
}

const SPEEDS = ['slow', 'normal', 'fast', 'instant'];
const AUTOP = ['off', 'every10', 'contact'];
export class SettingsScene {
  constructor() { this.kind = 'settings'; this.sel = 0; }
  rows() {
    const s = G.settings, pct = v => Math.round(v * 100) + '%';
    return [
      { label: 'Music volume', val: pct(s.musicVol), adj: d => { s.musicVol = clamp01(s.musicVol + d * 0.1); } },
      { label: 'Sound volume', val: pct(s.soundVol), adj: d => { s.soundVol = clamp01(s.soundVol + d * 0.1); audio.synth('confirm'); } },
      { label: 'Voice volume', val: pct(s.voiceVol), adj: d => { s.voiceVol = clamp01(s.voiceVol + d * 0.1); } },
      { label: 'Mute', val: s.mute ? 'On' : 'Off', adj: () => { s.mute = !s.mute; } },
      { label: 'Easy mode', val: s.easy ? 'On' : 'Off', adj: () => { s.easy = !s.easy; } },
      { label: 'Text speed', val: s.textSpeed[0].toUpperCase() + s.textSpeed.slice(1), adj: d => { s.textSpeed = SPEEDS[(SPEEDS.indexOf(s.textSpeed) + d + 4) % 4]; } },
      { label: 'Grid keys', val: s.gridKeys ? 'On' : 'Off', adj: () => { s.gridKeys = !s.gridKeys; } },
      { label: 'Key hints', val: s.keyHints ? 'On' : 'Off', adj: () => { s.keyHints = !s.keyHints; } },
      { label: 'Army edge-scroll', val: s.edgeScroll ? 'On' : 'Off', adj: () => { s.edgeScroll = !s.edgeScroll; } },
      { label: 'Army auto-pause', val: { off: 'Off', every10: 'Every 10 s', contact: 'On first contact' }[s.autoPause], adj: d => { s.autoPause = AUTOP[(AUTOP.indexOf(s.autoPause) + d + 3) % 3]; } },
      { label: 'Back', val: '', adj: null },
    ];
  }
  update() {
    const r = this.rows();
    if (input.back()) { this.close(); return; }
    if (input.up()) { this.sel = (this.sel + r.length - 1) % r.length; audio.synth('move'); }
    if (input.down()) { this.sel = (this.sel + 1) % r.length; audio.synth('move'); }
    const row = r[this.sel];
    if (row.adj && (input.left() || input.right())) { row.adj(input.left() ? -1 : 1); this.changed(); }
    if (input.act()) { if (!row.adj) this.close(); else { row.adj(1); this.changed(); } }
  }
  changed() { audio.applyVolumes(); saveSettings(); }
  close() { saveSettings(); popScene(this); }
  draw(c) {
    c.fillStyle = 'rgba(10,8,16,0.7)'; c.fillRect(0, 0, W, H);
    panel(c, 150, 24, 340, 312);
    ui.text('Settings', W / 2, 46, { align: 'center', size: 14, color: P.gold });
    this.rows().forEach((r, i) => {
      const y = 56 + i * 24, sel = i === this.sel;
      if (!r.adj) { if (button(c, 'Back', W / 2 - 50, y + 2, 100, 20, { sel, size: 10 })) this.close(); return; }
      if (button(c, r.label, 164, y, 150, 20, { sel, size: 9, hitLabel: r.label })) { this.sel = i; r.adj(1); this.changed(); }
      if (button(c, '<', 322, y, 20, 20, { size: 9, hitLabel: r.label + ' down' })) { this.sel = i; r.adj(-1); this.changed(); }
      ui.text(r.val, 401, y + 14, { align: 'center', size: 10, color: sel ? P.gold : P.chalk });
      if (button(c, '>', 460, y, 20, 20, { size: 9, hitLabel: r.label + ' up' })) { this.sel = i; r.adj(1); this.changed(); }
    });
  }
}
function clamp01(v) { return Math.max(0, Math.min(1, Math.round(v * 10) / 10)); }
