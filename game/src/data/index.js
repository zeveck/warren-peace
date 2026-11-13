// Loads every chapter module and merges their registries; throws on a duplicate id.
import { SPEAKERS, BESTIARY_CORE } from './core/speakers.js';

const CHAPTERS = ['ch0', 'ch1', 'ch1w', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ng'];   // ng: New Game+ segments only (data/ng)
const KEYS = ['maps', 'scripts', 'encounters', 'shops', 'rts', 'speakers', 'bestiary', 'memories'];

export async function loadData() {
  const D = { maps: {}, scripts: {}, encounters: {}, shops: {}, rts: {}, speakers: { ...SPEAKERS }, bestiary: { ...BESTIARY_CORE }, memories: {}, banter: { pairs: [] }, segments: [], quests: [], places: [], chapterMaps: {} };
  for (const ch of CHAPTERS) {
    let mod;
    try { mod = (await import(`./${ch}/index.js`)).default; }
    catch (e) { if (String(e).includes('Failed to fetch') || String(e).includes('Cannot find') || String(e).includes('404') || String(e).includes('error loading')) { console.warn('chapter missing:', ch); continue; } throw e; }
    if (!mod) continue;
    for (const k of KEYS) {
      for (const [id, v] of Object.entries(mod[k] || {})) {
        if (k === 'speakers' || k === 'bestiary') { D[k][id] = v; continue; }
        if (D[k][id]) throw new Error(`duplicate ${k} id "${id}" in ${ch}`);
        D[k][id] = v;
        if (k === 'maps') D.chapterMaps[id] = parseInt(ch.slice(2), 10);
      }
    }
    for (const [key, list] of Object.entries(mod.banter || {})) {
      if (key === 'pairs') D.banter.pairs.push(...list);
      else (D.banter[key] = D.banter[key] || []).push(...list);
    }
    D.segments.push(...(mod.segments || []).map(s => ({ ...s, chapter: s.chapter === undefined ? parseInt(ch.slice(2), 10) : s.chapter })));
    D.quests.push(...(mod.quests || []));
    D.places.push(...(mod.places || []));
    for (const [mapId, add] of Object.entries(mod.mapAdds || {})) (D.mapAddsList = D.mapAddsList || []).push([mapId, add, ch]);
    if (mod.start) D.start = mod.start;
    if (mod.onLoad) D.onLoad = mod.onLoad;
  }
  // chapters may add people, props, doors, triggers and chests to other chapters' maps (Thimblebank rebuilding)
  for (const [mapId, add, ch] of D.mapAddsList || []) {
    const m = D.maps[mapId]; if (!m) { console.warn(`${ch} adds to missing map ${mapId}`); continue; }
    for (const k of ['npcs', 'props', 'doors', 'triggers', 'chests', 'enemies']) if (add[k]) m[k] = [...(m[k] || []), ...add[k]];
    if (add.entries) m.entries = { ...(m.entries || {}), ...add.entries };
  }
  // the chapter shown in saves follows the chapter flags, not the map
  D.chapterOf = (mapId, cur) => cur;
  D.credit = 'Rich Conlan';
  return D;
}
