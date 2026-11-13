// New Game+ battle scaling, shared by the battle scene (battle/rpg.js) and the balance tools (tools/lib-battle.mjs).
// design/changes/ngplus.md: every encounter is shifted up (never down) so its highest level is the party's level - 4
// for ordinary fights (quick: the party feels strong) and the party's level + 1 for bosses (phase 2 is the challenge).
// Buttons still drop at the original level, so the button economy holds; XP comes from the shifted level.
import { makeEnemy } from './sim.js';
import { NG2 } from '../data/ng/bosses.js';

export const NG_GAP = 4, NG_ABOVE = 1;
const spec = e => Array.isArray(e) ? [e[0], e[1], e[2] || 0] : [e.type, e.lvl, e.tier || 0];

// enemies for an encounter in NG+: returns { enemies, shift, ng2 } (tweak already applied, NG Heart applied)
export function ngEnemies(encId, enc, partyLvl) {
  const specs = enc.enemies.map(spec);
  const top = Math.max(...specs.map(s => s[1]));
  const target = enc.boss ? partyLvl + NG_ABOVE : partyLvl - NG_GAP;
  const shift = Math.max(0, Math.round(target - top));
  const enemies = specs.map(([t, l, tier], i) => { const e = makeEnemy([t, l + shift, tier], 50 + i); e.drops = 2 * l; return e; });
  if (enc.tweak) enc.tweak(enemies);
  const ng2 = enc.boss ? NG2[encId] || null : null;
  if (ng2 && ng2.hp) for (const e of enemies) if (e.boss) { e.maxHp = e.hp = Math.round(e.maxHp * ng2.hp); }
  if (ng2 && ng2.atk) for (const e of enemies) if (e.boss) { e.str = Math.round(e.str * ng2.atk); e.wit = Math.round(e.wit * ng2.atk); }
  return { enemies, shift, ng2 };
}
