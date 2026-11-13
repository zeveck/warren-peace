// Headless army odds: node tools/rts-check.mjs <rtsId> <squad ...> [--freed N] [--gear rank] [--easy]
import { oddsOf } from '../game/src/rts/sim.js';
globalThis.location = undefined;
const a = process.argv.slice(2), id = a[0];
const opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const army = a.slice(1).filter((x, i, arr) => !x.startsWith('--') && !(arr[i - 1] || '').startsWith('--'));
const R = {};
for (const ch of ['ch0', 'ch1', 'ch1w', 'ch2', 'ch3', 'ch4', 'ch5']) { try { const m = (await import(`../game/src/data/${ch}/index.js`)).default; Object.assign(R, m.rts || {}); } catch (e) { if (!String(e).includes('Cannot find')) console.error(ch, e.message); } }
const d = R[id]; if (!d) { console.log('no rts', id); process.exit(1); }
const L = ['A', 'S', 'D', 'G', 'H', 'J', 'K', 'L', 'Z', 'X'];
const def = JSON.parse(JSON.stringify({ ...d, prompts: undefined }));
def.nodes.forEach((n, i) => { n.letter = n.letter || L[i]; });
def.paths = def.paths.map(([x, y, len]) => { const A = def.nodes.find(n => n.id === x), B = def.nodes.find(n => n.id === y); return [x, y, len || Math.abs(A.x - B.x) + Math.abs(A.y - B.y)]; });
const g = +(opt('--gear') || 0); const gear = {}; for (const k of ['stout', 'swift', 'wing', 'eerie']) gear[k] = { banner: g, mail: g, rations: g };
const r = oddsOf(def, army, { rank: 1 + 0.12 * +(opt('--freed') || 0), gear, easy: a.includes('--easy') });
console.log(JSON.stringify({ rts: id, army, odds: r.odds, heartLeft: r.left !== undefined ? Math.round(r.left * 100) + '%' : null, ticks: r.S.tick, result: r.S.result }));
