// Controllers: the Gamepad API's "standard" mapping (PS5 DualSense and Xbox pads), polled once per animation frame before
// the updates (main.js). Most scenes never see the pad: its buttons are turned into the key codes they already read
// (input.pressed, and input.padHeld for held keys), by a scheme picked from the top scene's kind. A scene can take a
// button first with onPad(name) (return true to eat it), or read the pad itself with padNative = true (the army battle).
// The layer can never break the loop: no API, or the first error (a permissions policy, an insecure page), and it turns
// itself off for the session.
import { reportOpen } from './feedback.js';
import { G, topScene, toast } from '../core.js';
import { input } from './input.js';

// standard mapping button indices
export const NAMES = ['cross', 'circle', 'square', 'triangle', 'l1', 'r1', 'l2', 'r2', 'create', 'options', 'l3', 'r3', 'up', 'down', 'left', 'right'];
const DPAD = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

// pad button -> key code, by the top scene's kind. Anything not listed uses MENU.
const MENU = { cross: 'Space', circle: 'Escape', options: 'Escape' };
const SCHEMES = {
  explore: { cross: 'Space', square: 'KeyN', triangle: 'Tab', options: 'Escape', dir8: true },
  dialog: { cross: 'Space' },
  camp: { cross: 'Space', circle: 'Escape', triangle: 'Tab', l1: 'KeyQ', r1: 'KeyE', options: 'Escape' },
  // the shop already treats left/right as its tabs (and calls act(), which KeyE would trigger)
  shop: { cross: 'Space', circle: 'Escape', l1: 'ArrowLeft', r1: 'ArrowRight', options: 'Escape' },
  battle: { cross: 'Space', circle: 'Escape' },
  title: { cross: 'Space' },
  settings: { cross: 'Space', circle: 'Escape', options: 'Escape', l1: 'ArrowLeft', r1: 'ArrowRight' },
  picture: { cross: 'Space', circle: 'Escape' },
  recruit: { cross: 'Space' },
  ending: { cross: 'Space' },
  'rts-preview': { cross: 'Space', circle: 'Escape' },
};
const DEAD = { small: 0.35, normal: 0.5, large: 0.65 };
const REPEAT_FIRST = 0.32, REPEAT_NEXT = 0.085;

// short rumbles: [strong, weak, ms]
const RUMBLE = {
  hit: [0.10, 0.35, 90], crit: [0.55, 0.45, 160], boss: [0.7, 0.5, 300], thump: [0.5, 0.2, 110],
  alert: [0.3, 0.4, 180], alertHome: [0.8, 0.5, 200], order: [0, 0.15, 40], quake: [0.6, 0.3, 400],
};

// Xbox first: "Xbox Wireless Controller" would match the DualShock's "Wireless Controller"
function kindOf(id) { id = id || ''; if (/xbox|045e|xinput/i.test(id)) return 'xbox'; return /054c|dualsense|dualshock|wireless controller|playstation|ps[345]/i.test(id) ? 'ps' : 'xbox'; }
function btnDown(b, i, was) {
  const v = b[i]; if (v == null) return false;
  if (typeof v === 'number') return v > 0.5;
  // analog triggers: on above 0.5, off below 0.35
  if (i === 6 || i === 7) { const x = typeof v.value === 'number' ? v.value : (v.pressed ? 1 : 0); return was ? x > 0.35 : x > 0.5 || (!!v.pressed && x === 0); }
  return !!v.pressed;
}

export const pad = {
  off: false,            // turned off for the session (no API, or it threw)
  index: -1,             // the pad in use
  id: '',
  pressed: new Set(),    // button names pressed since the last update (cleared with the keys)
  held: new Set(),       // button names held now
  ls: { x: 0, y: 0, on: false }, rs: { x: 0, y: 0, on: false },
  known: new Map(),      // index -> id of the pads seen
  warnedMap: false,
  last: [],              // last poll's button states
  dirHeld: new Map(),    // direction code -> { t, next } (menu repeat)
  lastT: 0,

  init() { input.onClear = () => this.pressed.clear(); },
  setKind() {
    const o = G.settings && G.settings.padIcons;
    input.padKind = o === 'ps' ? 'ps' : o === 'xbox' ? 'xbox' : kindOf(this.id);
  },
  takeOver() {
    if (input.device !== 'pad') {
      input.device = 'pad';
      input.padAnchor = { x: input.mouse.x, y: input.mouse.y };
      input.mouse.inside = false;
      if (input.canvas) input.canvas.style.cursor = 'none';
    }
    if (!input.padSeen) { input.padSeen = true; input.padSeenAt = performance.now(); }
    this.setKind();
    if (input.onFirstInput) input.onFirstInput();
  },
  clearHeld() { this.held.clear(); this.pressed.clear(); input.padHeld.clear(); this.dirHeld.clear(); this.last = []; this.ls.on = this.rs.on = false; },

  poll(now) {
    if (this.off) return;
    if (reportOpen()) { this.lastT = now; this.whileReport(); return; }   // the bug-report form is open: the game sees no controller input
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') { this.off = true; return; }
    const dt = this.lastT ? Math.min(0.25, (now - this.lastT) / 1000) : 0; this.lastT = now;
    try {
      if (document.hidden) { input.padHeld.clear(); return; }
      this.read(navigator.getGamepads() || [], dt);
    } catch (e) {
      this.off = true;
      try { this.clearHeld(); } catch (_) { /* ignore */ }
      console.warn('Controllers are off for this session:', e && e.message);
    }
  },

  // While the report form is open the game gets nothing from the pad: no presses, no held keys. Circle/B (the usual
  // "back") closes the form, so a controller player who opened it can always get back to the pause menu. Buttons are
  // still tracked, so nothing pressed or let go meanwhile turns into a press once the form closes.
  whileReport() {
    input.padHeld.clear(); this.pressed.clear();
    if (this.off || typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
    try {
      const gp = (navigator.getGamepads() || [])[this.index];
      if (!gp || gp.connected === false) return;
      const b = gp.buttons || [];
      for (let i = 0; i < NAMES.length; i++) {
        const on = btnDown(b, i, this.last[i]);
        if (on && !this.last[i] && NAMES[i] === 'circle') { const f = document.getElementById('report'); if (f && f.close) f.close(); }
        this.last[i] = on;
      }
    } catch (_) { /* never break the loop */ }
  },

  read(list, dt) {
    // connect / disconnect
    const now = new Map();
    for (let i = 0; i < list.length; i++) { const g = list[i]; if (g && g.connected !== false) now.set(i, g.id || 'Controller'); }
    for (const [i, id] of now) if (!this.known.has(i)) { this.known.set(i, id); toast('Controller connected', 1.6); }
    for (const [i] of [...this.known]) if (!now.has(i)) {
      this.known.delete(i);
      if (i === this.index) {
        const wasPad = input.device === 'pad';
        this.index = -1; this.clearHeld();
        toast('Controller disconnected', 2);
        const top = topScene(); if (wasPad && top && top.onBlur) top.onBlur();
      }
    }
    if (!now.size) { if (input.padHeld.size) input.padHeld.clear(); return; }
    // the pad in use: the current one, or whichever has a button down
    if (!now.has(this.index)) this.index = [...now.keys()][0];
    for (const [i] of now) if (i !== this.index) { const g = list[i]; if (g.buttons && [...g.buttons].some(b => b && (typeof b === 'number' ? b > 0.5 : b.pressed))) { this.index = i; this.last = []; break; } }
    const gp = list[this.index];
    if (gp.id !== this.id) { this.id = gp.id; this.setKind(); }
    if (gp.mapping !== 'standard' && !this.warnedMap) { this.warnedMap = true; toast('This controller isn\'t fully recognised: some buttons may be wrong.', 3); }

    // buttons
    const b = gp.buttons || [], edges = [];
    const held = new Set();
    for (let i = 0; i < NAMES.length; i++) {
      const on = btnDown(b, i, this.last[i]);
      if (on) held.add(NAMES[i]);
      if (on && !this.last[i]) edges.push(NAMES[i]);
      this.last[i] = on;
    }
    this.held = held;
    // sticks: a radial deadzone with hysteresis
    const ax = gp.axes || [];
    const on = DEAD[(G.settings && G.settings.padDead) || 'normal'] || 0.5, offT = on - 0.15;
    const stick = (s, x, y) => {
      x = +x || 0; y = +y || 0; const m = Math.hypot(x, y);
      const was = s.on; s.on = m > (was ? offT : on); s.x = s.on ? x : 0; s.y = s.on ? y : 0; s.m = s.on ? m : 0;
      return s.on && !was;
    };
    const lsNew = stick(this.ls, ax[0], ax[1]), rsNew = stick(this.rs, ax[2], ax[3]);
    if (edges.length || lsNew || rsNew) this.takeOver();
    for (const n of edges) this.pressed.add(n);

    const top = topScene();
    if (top && top.padNative) { input.padHeld.clear(); this.dirHeld.clear(); return; }
    const sc = (top && SCHEMES[top.kind]) || MENU;
    // button edges -> key presses (a scene may take a button first)
    for (const n of edges) {
      input.anyPressed = true;
      if (top && top.onPad && top.onPad(n)) continue;
      const code = sc[n]; if (!code || DPAD[n]) continue;
      input.pressed.add(code); input.order.push(code);
    }
    // held keys: buttons with a code, plus the directions (d-pad and left stick)
    const ph = new Set();
    for (const n of held) { const code = sc[n]; if (code && !DPAD[n]) ph.add(code); }
    const dirs = this.dirCodes(sc, top);
    for (const d of dirs) ph.add(d);
    input.padHeld = ph;
    // direction presses, repeating in menus
    for (const d of dirs) {
      const h = this.dirHeld.get(d);
      if (!h) { this.dirHeld.set(d, { t: 0, next: REPEAT_FIRST }); input.pressed.add(d); input.order.push(d); input.anyPressed = true; continue; }
      h.t += dt; if (h.t >= h.next) { h.next += REPEAT_NEXT; input.pressed.add(d); }
    }
    for (const d of [...this.dirHeld.keys()]) if (!dirs.has(d)) this.dirHeld.delete(d);
  },

  // the arrow keys the d-pad and the left stick hold
  dirCodes(sc, top) {
    const out = new Set();
    for (const n of ['up', 'down', 'left', 'right']) if (this.held.has(n)) out.add(DPAD[n]);
    if (!this.ls.on) return out;
    const deg = (Math.atan2(this.ls.y, this.ls.x) * 180 / Math.PI + 360) % 360;   // 0 right, 90 down
    if (sc.dir8) {
      // exploring: diagonals are clean grid steps, so their sectors are wider (60 degrees) than the straight ones (30)
      const diag = Math.round((deg - 45) / 90) * 90 + 45, off = Math.abs(((deg - diag) + 540) % 360 - 180);
      const grid = G.settings && G.settings.gridKeys;
      if (grid) {
        // Grid keys: the stick still means "where I push on screen": the nearest screen diagonal's grid key
        const k = ((diag % 360) + 360) % 360;
        out.add({ 315: 'ArrowUp', 45: 'ArrowRight', 135: 'ArrowDown', 225: 'ArrowLeft' }[k]);
        return out;
      }
      if (off <= 30) {
        const k = ((diag % 360) + 360) % 360;
        for (const c of { 315: ['ArrowUp', 'ArrowRight'], 45: ['ArrowDown', 'ArrowRight'], 135: ['ArrowDown', 'ArrowLeft'], 225: ['ArrowUp', 'ArrowLeft'] }[k]) out.add(c);
      } else {
        const card = Math.round(deg / 90) % 4;
        out.add(['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'][card]);
      }
      return out;
    }
    // menus: the stronger axis only, so a slightly diagonal push never also changes a tab
    if (Math.abs(this.ls.x) > Math.abs(this.ls.y)) out.add(this.ls.x > 0 ? 'ArrowRight' : 'ArrowLeft');
    else out.add(this.ls.y > 0 ? 'ArrowDown' : 'ArrowUp');
    return out;
  },

  // the live Gamepad object of the pad in use (Chrome hands out snapshots: never keep one)
  current() {
    if (this.off || this.index < 0 || typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return null;
    try { return (navigator.getGamepads() || [])[this.index] || null; } catch (_) { return null; }
  },
  rumble(kind, scale = 1) {
    try {
      if (this.off || input.device !== 'pad' || !G.settings || G.settings.vibration === false || document.hidden) return;
      const R = RUMBLE[kind]; if (!R) return;
      const gp = this.current(), va = gp && gp.vibrationActuator;
      if (!va || typeof va.playEffect !== 'function') return;
      if (va.effects && typeof va.effects.includes === 'function' && !va.effects.includes('dual-rumble')) return;
      const go = () => { const p = va.playEffect('dual-rumble', { startDelay: 0, duration: R[2], strongMagnitude: Math.min(1, R[0] * scale), weakMagnitude: Math.min(1, R[1] * scale) }); if (p && p.catch) p.catch(() => {}); };
      go();
      if (kind === 'alertHome') setTimeout(() => { try { go(); } catch (_) { /* ignore */ } }, 320);
    } catch (_) { /* unsupported: skip silently */ }
  },
  stopRumble() {
    try { const gp = this.current(), va = gp && gp.vibrationActuator; if (va && typeof va.reset === 'function') { const p = va.reset(); if (p && p.catch) p.catch(() => {}); } } catch (_) { /* ignore */ }
  },
  // the name of a button in words, for tips: 'Cross' / 'A'
  word(n) {
    const ps = input.padKind === 'ps';
    return ({ cross: ps ? 'Cross' : 'A', circle: ps ? 'Circle' : 'B', square: ps ? 'Square' : 'X', triangle: ps ? 'Triangle' : 'Y',
      l1: ps ? 'L1' : 'LB', r1: ps ? 'R1' : 'RB', l2: ps ? 'L2' : 'LT', r2: ps ? 'R2' : 'RT', l3: 'L3', r3: 'R3',
      options: ps ? 'Options' : 'Menu', create: ps ? 'Create' : 'View', lstick: 'the left stick', rstick: 'the right stick', dpad: 'the d-pad' })[n] || n;
  },
};

// "{cross} to send" -> "Cross to send" / "A to send"; {act} is Space on the keyboard
export function padWords(str) {
  if (!str || str.indexOf('{') < 0) return str;
  return String(str).replace(/\{(\w+)\}/g, (m, n) => n === 'act' ? (input.device === 'pad' ? pad.word('cross') : 'Space') : pad.word(n));
}
