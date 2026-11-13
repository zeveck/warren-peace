// localStorage saves: "warren-peace-save" v1 holds an autosave, the previous run's autosave (kept by New Game) and 3 slots; settings are separate.
import { G, findScene } from '../core.js';
const KEY = 'warren-peace-save', SKEY = 'warren-peace-settings', VERSION = 1;

export const DEFAULT_SETTINGS = { musicVol: 0.8, soundVol: 0.8, voiceVol: 0.9, mute: false, easy: false, textSpeed: 'normal', gridKeys: false, keyHints: true, edgeScroll: true, autoPause: 'off', vibration: true, padIcons: 'auto', padCam: 'normal', padDead: 'normal' };

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(SKEY) || '{}') || {}; } catch (_) { s = {}; }
  G.settings = { ...DEFAULT_SETTINGS, ...s };
}
export function saveSettings() { try { localStorage.setItem(SKEY, JSON.stringify(G.settings)); } catch (_) { /* storage full or blocked */ } }

function readAll() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && d.v === VERSION && typeof d === 'object') return { auto: d.auto || null, prev: d.prev || null, slots: Array.isArray(d.slots) ? d.slots.slice(0, 3) : [null, null, null] };
  } catch (_) { /* broken save: start fresh */ }
  return { auto: null, prev: null, slots: [null, null, null] };
}
function writeAll(all) { try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, ...all })); return true; } catch (_) { return false; } }

function snapshot() { return JSON.parse(JSON.stringify(G.s)); }
// a save is loadable if its shape is right and it points at a real map, or at least has a real door (or the
// start) to fall back to; title.js startGame does the falling back
export const mapExists = id => typeof id === 'string' && !!(G.data && G.data.maps && G.data.maps[id]);
function valid(s) {
  if (!s || typeof s !== 'object' || !s.flags || typeof s.flags !== 'object' || !s.party || !s.party.members || typeof s.map !== 'string') return false;
  if (!G.data || !G.data.maps) return true;
  return mapExists(s.map) || (s.lastDoor && mapExists(s.lastDoor.map)) || !!(G.data.start && mapExists(G.data.start.map));
}

// never mid-script: a warp or s.save() inside a running scene only marks the save as due, and the explore scene
// writes it when its last script ends (queueScript), so quitting halfway through a scene can't keep half its story
export function autosave() {
  if (!G.s || G.noSave) return;
  const ex = findScene('explore');
  if (ex && ex.busy > 0) { ex.savePending = true; return; }
  const all = readAll(); all.auto = { when: Date.now(), s: snapshot() }; writeAll(all);
}
export function saveSlot(i) { if (!G.s) return false; const all = readAll(); while (all.slots.length < 3) all.slots.push(null); all.slots[i] = { when: Date.now(), s: snapshot() }; return writeAll(all); }
// New Game: the current autosave becomes the "Previous autosave" (shown in Load) instead of being overwritten
export function keepPreviousAutosave() { const all = readAll(); if (!all.auto || !valid(all.auto.s)) return false; all.prev = all.auto; all.auto = null; return writeAll(all); }
export function slots() { const all = readAll(); return { auto: all.auto && valid(all.auto.s) ? all.auto : null, prev: all.prev && valid(all.prev.s) ? all.prev : null, slots: [0, 1, 2].map(i => all.slots[i] && valid(all.slots[i].s) ? all.slots[i] : null) }; }
export function hasAnySave() { const s = slots(); return !!(s.auto || s.prev || s.slots.some(Boolean)); }
export function latest() { const s = slots(); const all = [s.auto, s.prev, ...s.slots].filter(Boolean); all.sort((a, b) => b.when - a.when); return all[0] || null; }
// New Game+ (design/changes/ngplus.md): the won saves it can start from, newest first, each with where it lives
// ({ kind: 'auto' | 'prev' | 'slot', i, e })
export function wonSaves() {
  const s = slots(), out = [];
  if (s.auto && s.auto.s.flags.g_won) out.push({ kind: 'auto', e: s.auto });
  if (s.prev && s.prev.s.flags.g_won) out.push({ kind: 'prev', e: s.prev });
  s.slots.forEach((e, i) => { if (e && e.s.flags.g_won) out.push({ kind: 'slot', i, e }); });
  return out.sort((a, b) => b.e.when - a.e.when);
}
export function freeSlot() { const s = slots(); return s.slots.findIndex(e => !e); }
// write a given state (not the running game) into a slot: NG+ keeps a copy of the won save before it starts
export function saveStateToSlot(i, state, when) { const all = readAll(); while (all.slots.length < 3) all.slots.push(null); all.slots[i] = { when: when || Date.now(), s: JSON.parse(JSON.stringify(state)) }; return writeAll(all); }
export function clearAll() { try { localStorage.removeItem(KEY); } catch (_) { /* ignore */ } }
