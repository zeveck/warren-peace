// Battle backdrops a map can use, preloaded when the map loads (world/explore.js load), so the first
// fight there opens on its painting. Light on purpose: no import of the battle scene itself.
import { G } from '../core.js';
import { has, imageReady } from '../engine/assets.js';

const BATTLE_RE = /battle\(\s*['"`]([^'"`]+)['"`]/g;

// encounter ids: the map's wandering enemies, plus s.battle('id') calls in its scripts
function encountersOf(def) {
  const ids = new Set();
  for (const e of def.enemies || []) if (e.encounter) ids.add(e.encounter);
  const seen = new Set();
  const scan = (v, depth) => {
    if (!v || depth > 3 || seen.has(v)) return;
    if (typeof v === 'function') { seen.add(v); for (const m of String(v).matchAll(BATTLE_RE)) ids.add(m[1]); return; }
    if (typeof v !== 'object') return;
    seen.add(v);
    if (Array.isArray(v)) { if (typeof v[0] === 'string' && v.length > 8) return; for (const x of v) scan(x, depth + 1); return; }   // skip tile rows
    for (const k of Object.keys(v)) if (k !== 'tiles' && k !== 'heights') scan(v[k], depth + 1);
  };
  scan(def, 0);
  return ids;
}
export function battleBackdropsFor(def) {
  const out = new Set(), encs = (G.data && G.data.encounters) || {};
  for (const id of encountersOf(def || {})) {
    const enc = encs[id]; if (!enc) continue;
    const name = enc.backdrop || (enc.bg ? 'bg-battle-' + enc.bg : null);
    if (name && has('bg', name)) out.add(name);
  }
  return [...out];
}
// fire and forget: the images warm the cache while the player walks about
export function preloadBattleBackdrops(def) {
  try { for (const n of battleBackdropsFor(def)) imageReady(`assets/bg/${n}.png`); } catch (e) { console.warn('backdrop preload', e); }
}
