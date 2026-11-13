// The RPG battle rules, pure and deterministic (no drawing, no DOM): used by the battle scene and by
// tools/balance.mjs. Everything that happens comes back as a list of events for the scene to animate.
import { SKILLS } from '../data/core/party.js';
import { TEMPLATES, MOVES, ENEMIES, BOSSES, NORMAL_FIGHT } from '../data/core/enemies.js';

export const statAt = (base, L) => Math.round(base * (1 + 0.1 * (L - 1)));
// XP to the next level: refit to the real encounter lists (was 12*L^1.6+20; see design/progress/balance.md)
export const xpNext = L => Math.round(55 * Math.pow(L, 1.4) + 60);
const TIER = [1, 1.25, 1.5];

export function rngOf(seedStr) {
  let h = 2166136261; for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// Build an enemy unit: spec = [typeId, level, tier] or {type, lvl, tier, boss}
export function makeEnemy(spec, uid) {
  const [type, lvl, tier = 0] = Array.isArray(spec) ? spec : [spec.type, spec.lvl, spec.tier || 0];
  const boss = BOSSES[type];
  const E = boss || ENEMIES[type]; if (!E) throw new Error('no enemy ' + type);
  const T = TEMPLATES[E.tpl]; const mult = E.mult || {};
  const tm = TIER[tier] || 1;
  const st = k => Math.round(statAt(T[k], lvl) * (mult[k] || 1) * (k === 'spd' ? 1 : tm) * (boss && !boss.minion ? (k === 'hp' ? 1 : 1.25) : 1));
  let hp = st('hp');
  if (boss && !boss.minion) hp = Math.round(hp * (boss.hpMult || 8));
  return {
    uid, side: 'enemy', id: type, name: E.name, sprite: E.sprite || type, look: E.look, lvl, tier,
    maxHp: hp, hp, str: st('str'), tgh: st('tgh'), spd: st('spd'), wit: st('wit'), maxPl: 99, pl: 99,
    bar: E.bar, eerie: !!(E.eerie || T.eerie), flying: !!T.flying, hum: !!E.hum,
    moves: E.moves || T.moves, normalMoves: E.normalMoves || (E.moves ? null : T.normalMoves) || null, threat: boss ? null : E.threat !== undefined ? E.threat : T.threat || null, boss: !!(boss && !boss.minion), mech: boss ? boss.mech : null, minion: !!(boss && boss.minion),
    statuses: {}, buffs: {}, ko: false, xp: Math.round(9 * lvl * (1 + tier * 0.25) * (boss && !boss.minion ? 5 : 1)), drops: 2 * lvl,   // buttons: 2 x level (was 3: income ran 1.4-3.7x the design table; design/progress/balance.md)
    ms: {},   // mechanic state
  };
}
// Build a party unit from a member summary {id, lvl, hp, pl, stats:{hp,pl,str,tgh,spd,wit,effects}, skills}
export function makeAlly(m, uid) {
  return { uid, side: 'party', id: m.id, name: m.name, sprite: m.id, lvl: m.lvl, maxHp: m.stats.hp, hp: Math.max(0, m.hp), maxPl: m.stats.pl, pl: m.pl,
    str: m.stats.str, tgh: m.stats.tgh, spd: m.stats.spd, wit: m.stats.wit, effects: m.stats.effects || [], skills: m.skills,
    statuses: {}, buffs: {}, ms: {}, ko: m.hp <= 0, bar: 'heart' };
}

export class BattleSim {
  // opts: { seed, easy, first (party first in round 1), flee: 'always'|'normal'|'never', ninefold (in party => no Afraid),
  //         items: {id: count}, reserves: [unit...], itemDefs, onRound(sim) }
  constructor(party, enemies, opts = {}) {
    this.party = party; this.enemies = enemies; this.o = opts; this.rng = rngOf(opts.seed || 'battle');
    this.round = 0; this.order = []; this.turn = null; this.result = null; this.log = []; this.first = !!opts.first;
    this.reserves = opts.reserves || []; this.items = opts.items || {}; this.nextUid = 100;
    this.storyUsedRound = -1; this.stories = 0;
    // New Game+ only (design/changes/ngplus.md): the boss's second phase. Every ng2 hook below is inert without it.
    this.ng2 = opts.ng2 || null; this.phase2 = false; this.ngs = {};
    // ordinary fights (no boss or boss minion): enemies use their template's readable threat (wind-ups) and the
    // normal-fight Heart / attack scaling (data/core/enemies.js NORMAL_FIGHT; bosses' fights are untouched)
    this.normal = !enemies.some(e => e.boss || e.minion); this.lastRelease = -1;
    if (this.normal) for (const e of enemies) this.scaleNormal(e);
  }
  scaleNormal(e) {
    const N = NORMAL_FIGHT; if (e.scaled) return; e.scaled = true;
    e.maxHp = e.hp = Math.max(1, Math.round(e.maxHp * N.hp)); e.str = Math.round(e.str * N.str); e.wit = Math.round(e.wit * N.wit); e.tgh = Math.round(e.tgh * N.tgh);
  }
  alive(side) { return (side === 'party' ? this.party : this.enemies).filter(u => !u.ko && !u.out); }
  all() { return [...this.party, ...this.enemies]; }
  noAfraid(u) { return u.side === 'party' && (this.party.some(p => p.id === 'ninefold' && !p.ko) || (u.effects || []).includes('noAfraid')); }

  // ---- rounds
  startRound() {
    this.round++;
    const ev = [];
    // statuses and buffs tick down at round start
    for (const u of this.all()) {
      if (u.out && u.outRound < this.round) { u.out = false; ev.push({ t: 'return', u: u.uid }); }
      for (const k of Object.keys(u.buffs)) { if (--u.buffs[k] <= 0) delete u.buffs[k]; }
      for (const k of Object.keys(u.statuses)) { if (k === 'asleep' || k === 'stun') continue; if (--u.statuses[k] <= 0) { delete u.statuses[k]; } }
      // Guard lasts until the guarder's next turn (cleared in nextActor); a rabbit that loses its turn keeps it one round at most
      if (u.guard && !(u.guardRound >= this.round - 1)) delete u.guard;
      delete u.hitThisRound;
      if (u.side === 'party' && u.ko && this.o.dream) { u.ko = false; u.hp = Math.ceil(u.maxHp * 0.5); ev.push({ t: 'revive', u: u.uid, say: 'Up you get!' }); }
    }
    // boss mechanics that act at round start
    for (const e of this.enemies) if (!e.ko && e.mech) ev.push(...this.mechRoundStart(e));
    if (this.o.onRound) ev.push(...((this.ng2 && this.ng2.onRound ? this.ng2.onRound(this, this.o.onRound) : this.o.onRound(this)) || []));
    // NG+ second phase: after the boss mechanics and the encounter's onRound, before the turn order is sorted
    if (this.ng2) ev.push(...this.ngRound());
    const units = this.all().filter(u => !u.ko && !u.out);
    const spd = u => u.spd * (u.buffs.spd ? 1.3 : 1) * (u.effects && u.effects.includes('spd') ? 1.1 : 1);
    units.sort((a, b) => {
      const fa = (this.first && this.round === 1 && a.side === 'party') || a.buffs.first || (this.round === 1 && (a.effects || []).includes('first'));
      const fb = (this.first && this.round === 1 && b.side === 'party') || b.buffs.first || (this.round === 1 && (b.effects || []).includes('first'));
      if (fa !== fb) return fa ? -1 : 1;
      if (a.ms && a.ms.last) return 1; if (b.ms && b.ms.last) return -1;
      return spd(b) - spd(a) || (a.side === 'party' ? -1 : 1) || a.uid - b.uid;
    });
    this.order = [];
    for (const u of units) { this.order.push(u.uid); if (u.mech === 'two-actions') this.order.push(u.uid); }
    // the Choir's glowing mouth (or mouths, in NG+) speaks last
    const glows = this.enemies.filter(e => e.ms.glow && !e.ko).map(e => e.uid);
    if (glows.length) { this.order = this.order.filter(x => !glows.includes(x)); this.order.push(...glows); }
    return ev;
  }
  // ---- NG+ second phase (ng2 data: data/ng/bosses.js). Fires once, at a round start, when ng2.trigger(sim) holds
  // (default: the boss at or below ng2.at of its bar); then ng2.round runs every round start.
  ngBoss() { return this.enemies.find(e => e.boss && !e.ko) || this.enemies.find(e => e.boss) || null; }
  ngRound() {
    const d = this.ng2, ev = [];
    if (!this.phase2) {
      const b = this.ngBoss();
      const on = d.trigger ? d.trigger(this) : !!(b && !b.ko && b.hp <= b.maxHp * (d.at || 0.5));
      if (!on || this.result) return ev;
      this.phase2 = true; this.phase2Round = this.round;
      ev.push({ t: 'phase', u: b ? b.uid : null, lines: d.lines || [], sfx: d.sfx || 'alert-horn' });
      if (d.enter) ev.push(...(d.enter(this, b) || []));
    }
    if (d.round) ev.push(...(d.round(this, this.ngBoss()) || []));
    return ev;
  }
  // next actor (skips the knocked out); returns unit or null when the round is over
  nextActor() {
    while (this.order.length) {
      const uid = this.order.shift(); const u = this.unit(uid);
      if (!u || u.ko || u.out) continue;
      delete u.guard;
      this.turn = u; return u;
    }
    this.turn = null; return null;
  }
  unit(uid) { return this.all().find(u => u.uid === uid); }

  // ---- maths
  atk(u, st) {
    let v = st === 'wit' ? u.wit : u.str;
    if (st !== 'wit') {
      if (u.statuses.afraid) v *= 0.7; if (u.statuses.shrunk) v *= 0.7; if (u.statuses.grown) v *= 1.3;
    }
    if (u.buffs.str) v *= 1.3;
    return v;
  }
  def(u) { let v = u.tgh; if (u.buffs.tgh) v *= 1.3; if (u.buffs['tgh-down'] || u.statuses['tgh-down']) v *= 0.7; return v; }
  dodge(u) { let d = 0.05; if (u.statuses.shrunk) d += 0.3; if (u.statuses.grown) d -= 0.2; if (u.buffs.dodge) d += 0.2; return Math.max(0, d); }
  damage(src, tgt, power, st, o = {}) {
    const A = this.atk(src, st), D = this.def(tgt);
    const variance = 0.9 + this.rng() * 0.2;
    const critChance = 0.05 + ((src.effects || []).includes('crit') ? 0.07 : 0);
    // (ordinary fights: enemies never crit, so no hit is a surprise spike; fights.md)
    const crit = this.rng() < critChance && !o.noCrit && !(this.normal && src.side === 'enemy') ? 1.5 : 1;
    let mods = 1;
    if (tgt.guard && !o.pierce) mods *= 0.5;
    if (tgt.buffs.shielded || tgt.statuses.shielded) mods *= 0.6;
    if (o.light && tgt.eerie) mods *= 1.5;
    if (o.light && (src.effects || []).includes('light')) mods *= 1.2;
    if (o.humBonus && tgt.hum) mods *= o.humBonus;
    if (src.side === 'enemy' && this.o.easy) mods *= 0.5;
    if (this.phase2 && this.ng2.takeMod) mods *= this.ng2.takeMod(this, src, tgt, o);
    let dmg = Math.max(1, Math.round((A * power - D * 0.5) * variance * crit * mods));
    if (tgt.bar === 'dream') dmg = 1;
    return { dmg, crit: crit > 1 };
  }
  applyDamage(tgt, dmg, ev, src) {
    // Fold / Best Friend: someone else takes it
    if (tgt.side === 'party') {
      const coverer = this.party.find(p => !p.ko && p !== tgt && (p.buffs.cover === tgt.uid || (p.buffs['cover-bramble'] && tgt.id === 'bramble')));
      if (coverer) { ev.push({ t: 'cover', u: coverer.uid, for: tgt.uid }); tgt = coverer; }
    }
    tgt.hp = Math.max(0, tgt.hp - dmg); tgt.hitThisRound = true;
    if (tgt.statuses.asleep) { delete tgt.statuses.asleep; ev.push({ t: 'wakeup', u: tgt.uid }); }
    if (tgt.hp <= 0 && !tgt.ko) {
      if (tgt.bar === 'dream') { tgt.hp = 1; return tgt; }
      tgt.ko = true; this.order = this.order.filter(x => x !== tgt.uid);
      if (tgt.ms && tgt.ms.windup) this.clearWindup(tgt);   // knocked out mid wind-up: the blow never comes
      ev.push({ t: 'ko', u: tgt.uid, bar: tgt.bar });
    }
    return tgt;
  }
  targetable(u) { return !u.ko && !u.out && !u.buffs.hidden && !u.buffs['hidden-strike'] && !u.ms.submerged; }
  pickTarget(src, side) {
    const pool = (side === 'party' ? this.party : this.enemies).filter(u => this.targetable(u));
    if (!pool.length) return null;
    const taunt = pool.find(u => u.buffs.taunt); if (taunt) return taunt;
    return pool[Math.floor(this.rng() * pool.length)];
  }
  applyStatus(tgt, status, chance, ev) {
    if (tgt.ko) return;
    if (status === 'afraid' && this.noAfraid(tgt)) { ev.push({ t: 'resist', u: tgt.uid, what: 'Afraid' }); return; }
    if (status === 'asleep' && (tgt.effects || []).includes('noAsleep')) { ev.push({ t: 'resist', u: tgt.uid, what: 'Asleep' }); return; }
    if (status === 'hummed' && (tgt.effects || []).includes('noHummed')) { ev.push({ t: 'resist', u: tgt.uid, what: 'Hummed' }); return; }
    const c = tgt.boss ? chance / 2 : chance;
    if (this.rng() < c) { tgt.statuses[status] = status === 'stun' ? 1 : 3; ev.push({ t: 'status', u: tgt.uid, s: status }); }
    else ev.push({ t: 'miss', u: tgt.uid });
  }

  // ---- party commands. cmd: {k:'tussle'|'skill'|'item'|'guard'|'swap'|'flee', skill, item, target uid, reserve unit}
  act(u, cmd) {
    const ev = [];
    if (u.statuses.asleep) { if (--u.statuses.asleep <= 0) delete u.statuses.asleep; ev.push({ t: 'sleeping', u: u.uid }); return this.after(ev); }
    if (u.statuses.stun) { delete u.statuses.stun; ev.push({ t: 'stunned', u: u.uid }); return this.after(ev); }
    // Hummed: 50% chance to act on a random target
    if (u.statuses.hummed && (cmd.k === 'tussle' || cmd.k === 'skill') && this.rng() < 0.5) {
      const all = this.all().filter(x => this.targetable(x) && x !== u);
      const t = all[Math.floor(this.rng() * all.length)];
      if (t) { ev.push({ t: 'confused', u: u.uid }); cmd = { ...cmd, k: 'tussle', target: t.uid }; }
    }
    if (u.buffs['hidden-strike']) { // Pip's Hide: the surprise hit happens now
      delete u.buffs['hidden-strike'];
      const t = this.unit(cmd.target) && !this.unit(cmd.target).ko ? this.unit(cmd.target) : this.pickTarget(u, 'enemy');
      if (t) { const { dmg, crit } = this.damage(u, t, 2.2, 'str'); ev.push({ t: 'hit', u: u.uid, tg: t.uid, dmg, crit, name: 'Surprise!' }); this.applyDamage(t, dmg, ev, u); }
      return this.after(ev);
    }
    if (cmd.k === 'tussle') {
      const t = this.validTarget(cmd.target, u, 'enemy');
      if (t) this.hit(u, t, 1.0, 'str', ev, { name: 'Tussle' });
    } else if (cmd.k === 'guard') {
      u.guard = true; u.guardRound = this.round; u.pl = Math.min(u.maxPl, u.pl + Math.ceil(u.maxPl * 0.1)); ev.push({ t: 'guard', u: u.uid });
    } else if (cmd.k === 'skill') {
      ev.push(...this.useSkill(u, cmd.skill, cmd.target));
    } else if (cmd.k === 'item') {
      ev.push(...this.useItem(u, cmd.item, cmd.target));
    } else if (cmd.k === 'swap') {
      const r = cmd.reserve; const i = this.party.indexOf(u);
      this.party[i] = r; this.reserves = this.reserves.filter(x => x !== r); this.reserves.push(u);
      r.uid = r.uid || this.nextUid++; ev.push({ t: 'swap', out: u.uid, in: r.uid, slot: i });
    } else if (cmd.k === 'flee') {
      const ok = this.o.flee === 'always' || (this.o.flee !== 'never' && this.rng() < 0.7);
      ev.push({ t: 'flee', ok }); if (ok) this.result = 'fled';
    }
    return this.after(ev);
  }
  validTarget(uid, src, defSide) {
    let t = this.unit(uid);
    if (!t || t.ko || (t.side === 'enemy' && !this.targetable(t))) t = this.pickTarget(src, defSide === 'enemy' ? 'enemy' : 'party');
    return t;
  }
  hit(u, t, power, st, ev, o = {}) {
    if (t.side === 'enemy' && t.flying && (o.tags || []).includes('Dig') && this.rng() < 0.5) { ev.push({ t: 'dodge', u: t.uid, by: u.uid }); return; }
    if (this.rng() < this.dodge(t) && !o.sure) { ev.push({ t: 'dodge', u: t.uid, by: u.uid }); return; }
    const { dmg, crit } = this.damage(u, t, power, st, o);
    ev.push({ t: 'hit', u: u.uid, tg: t.uid, dmg, crit, name: o.name, light: o.light, ...(o.heavy ? { heavy: true } : {}) });
    const real = this.applyDamage(t, dmg, ev, u);
    if (this.phase2 && this.ng2.onHit) this.ng2.onHit(this, u, real, o, ev, dmg);
    // the Watcher: hitting it while an eye is open closes that eye
    if (real.mech === 'watcher' && real.ms.eyes > 0) { real.ms.eyes--; ev.push({ t: 'eye-close', u: real.uid, eyes: real.ms.eyes }); }
    if (real.mech === 'choir' && real.ms.glow) { real.ms.silenced = true; ev.push({ t: 'say', u: real.uid, text: 'The glowing mouth falls silent.' }); }
    return real;
  }
  useSkill(u, sid, target) {
    const S = SKILLS[sid], ev = [];
    if (!S) return ev;
    if (u.pl < S.pl) { ev.push({ t: 'nopl', u: u.uid }); return ev; }
    u.pl -= S.pl;
    ev.push({ t: 'skill', u: u.uid, name: S.name, k: S.k });
    const light = (S.tags || []).includes('Light');
    const enemies = () => this.enemies.filter(e => this.targetable(e));
    const allies = () => this.party.filter(p => !p.ko && !p.out);
    const one = (side) => this.validTarget(target, u, side);
    const power = S.pw === 'rand' ? 0.8 + this.rng() * 1.6 : S.pw;
    switch (S.k) {
      case 'hit': {
        const tg = S.t === 'enemies' ? enemies() : [one('enemy')].filter(Boolean);
        for (const t of tg) for (let i = 0; i < (S.hits || 1); i++) if (!t.ko) {
          const r = this.hit(u, t, power, S.st, ev, { name: S.name, light, pierce: S.pierce, tags: S.tags, humBonus: S.humBonus, skill: sid });
          if (r && S.status && !r.ko && i === 0) this.applyStatus(r, S.status, S.chance, ev);
        }
        break;
      }
      case 'heal': {
        const tg = S.t === 'allies' ? allies() : S.t === 'self' ? [u] : [this.unit(target) && !this.unit(target).ko ? this.unit(target) : u];
        for (const t of tg) { const amt = Math.round(u.wit * power); t.hp = Math.min(t.maxHp, t.hp + amt); ev.push({ t: 'heal', u: t.uid, amt }); }
        if (S.cure) for (const t of tg) this.cure(t, S.cure, ev);
        break;
      }
      case 'pluck': {
        const tg = S.t === 'allies' ? allies() : [this.unit(target) || u];
        for (const t of tg) { const amt = Math.ceil(t.maxPl * power); t.pl = Math.min(t.maxPl, t.pl + amt); ev.push({ t: 'pluck', u: t.uid, amt }); }
        break;
      }
      case 'cure': { const t = this.unit(target) || u; this.cure(t, ['all'], ev); break; }
      case 'status': {
        if (S.t === 'ally') { const t = this.unit(target) || u; t.statuses[S.status] = 3; ev.push({ t: 'status', u: t.uid, s: S.status }); break; }
        const tg = S.t === 'enemies' ? enemies() : [one('enemy')].filter(Boolean);
        for (const t of tg) {
          if (S.notEerie && t.eerie) { ev.push({ t: 'resist', u: t.uid, what: S.status }); continue; }
          if (S.humBonus && t.hum) { const { dmg } = this.damage(u, t, 0.8, 'wit', { humBonus: S.humBonus }); ev.push({ t: 'hit', u: u.uid, tg: t.uid, dmg, name: S.name }); this.applyDamage(t, dmg, ev, u); }
          if (!t.ko) this.applyStatus(t, S.status, S.chance, ev);
        }
        break;
      }
      case 'buff': {
        const b = S.buff;
        if (S.t === 'enemies' || S.t === 'enemy') {
          const tg = S.t === 'enemies' ? enemies() : [one('enemy')].filter(Boolean);
          for (const t of tg) { t.statuses['tgh-down'] = 3; ev.push({ t: 'status', u: t.uid, s: 'tgh-down' }); }
          break;
        }
        const tg = S.t === 'allies' ? allies() : S.t === 'self' ? [u] : [this.unit(target) || u];
        for (const t of tg) {
          if (b === 'guard') { t.guard = true; t.guardRound = this.round; ev.push({ t: 'guard', u: t.uid }); continue; }
          if (b === 'cover') { u.buffs.cover = t.uid; ev.push({ t: 'buff', u: u.uid, b: 'cover' }); continue; }
          if (b === 'first') { t.buffs.first = 2; t.buffs.str = 2; ev.push({ t: 'buff', u: t.uid, b: 'first' }); continue; }
          t.buffs[b] = b === 'hidden' || b === 'hidden-strike' ? 2 : b === 'shielded' ? 2 : 3;
          if (S.also) t.buffs[S.also] = 2;
          ev.push({ t: 'buff', u: t.uid, b });
        }
        if (S.cure) for (const t of tg) this.cure(t, S.cure, ev);
        break;
      }
      case 'revive': {
        const t = this.unit(target);
        if (t && t.ko) { t.ko = false; t.hp = Math.ceil(t.maxHp * power); ev.push({ t: 'revive', u: t.uid }); } else ev.push({ t: 'miss', u: u.uid });
        break;
      }
      case 'found': {
        const pool = ['clover-bunch', 'dandelion', 'pluck-berry', 'courage-biscuit', 'smelling-salts', 'carrot-cake'];
        const it = pool[Math.floor(this.rng() * pool.length)];
        this.items[it] = (this.items[it] || 0) + 1; ev.push({ t: 'found', u: u.uid, item: it });
        break;
      }
      case 'story': {
        if (this.storyUsedRound === this.round) { ev.push({ t: 'say', text: 'One story a round. The dream is still listening to the last one.' }); u.pl += S.pl; break; }
        if (this.ng2 && this.ng2.story) { this.storyUsedRound = this.round; this.stories++; this.ng2.story(this, u, target, ev); break; }   // NG+: the bar in eighths
        this.storyUsedRound = this.round; this.stories++;
        const eye = this.enemies.find(e => e.bar === 'dream');
        ev.push({ t: 'story', u: u.uid, memory: target });
        if (eye) { eye.hp = Math.max(0, eye.hp - Math.ceil(eye.maxHp / 5)); if (eye.hp <= 0 || this.stories >= 5) { eye.hp = 0; eye.ko = true; ev.push({ t: 'ko', u: eye.uid, bar: 'dream' }); } }
        break;
      }
    }
    return ev;
  }
  cure(t, which, ev) {
    const all = which.includes('all');
    for (const s of ['afraid', 'asleep', 'hummed', 'shrunk', 'stun']) if ((all || which.includes(s)) && t.statuses[s]) { delete t.statuses[s]; ev.push({ t: 'cure', u: t.uid, s }); }
  }
  useItem(u, id, target) {
    const ev = [], D = (this.o.itemDefs || {})[id];
    if (!D || !(this.items[id] > 0)) return ev;
    this.items[id]--; ev.push({ t: 'item', u: u.uid, item: id, name: D.name });
    const x = D.use, t = this.unit(target) || u;
    if (x.heal) { const a = Math.min(t.maxHp - t.hp, x.heal); if (!t.ko) { t.hp += a; ev.push({ t: 'heal', u: t.uid, amt: x.heal }); } }
    if (x.healAll) for (const p of this.party) if (!p.ko) { p.hp = Math.min(p.maxHp, p.hp + x.healAll); ev.push({ t: 'heal', u: p.uid, amt: x.healAll }); }
    if (x.pluck) { t.pl = Math.min(t.maxPl, t.pl + x.pluck); ev.push({ t: 'pluck', u: t.uid, amt: x.pluck }); }
    if (x.pluckAll) for (const p of this.party) if (!p.ko) { p.pl = Math.min(p.maxPl, p.pl + x.pluckAll); ev.push({ t: 'pluck', u: p.uid, amt: x.pluckAll }); }
    if (x.cure) this.cure(t, [x.cure], ev);
    if (x.cureAll) for (const p of this.party) this.cure(p, ['all'], ev);
    if (x.revive) { if (t.ko) { t.ko = false; t.hp = Math.ceil(t.maxHp * x.revive); ev.push({ t: 'revive', u: t.uid }); } }
    if (x.status) { if (x.foe) { const e = t.side === 'enemy' ? t : this.pickTarget(u, 'enemy'); if (e) { e.statuses[x.status] = 3; ev.push({ t: 'status', u: e.uid, s: x.status }); } } else { t.statuses[x.status] = 3; ev.push({ t: 'status', u: t.uid, s: x.status }); } }
    if (x.pail) {
      const e = t.side === 'enemy' ? t : this.enemies.find(e => e.mech === 'witch' && !e.ko) || this.pickTarget(u, 'enemy');
      if (e) { let dmg = e.mech === 'witch' ? Math.ceil(e.maxHp / 3) : 10; if (this.phase2 && this.ng2.itemMod) dmg = this.ng2.itemMod(this, id, e, dmg, ev); ev.push({ t: 'hit', u: u.uid, tg: e.uid, dmg, name: 'Splash!', splash: true }); this.applyDamage(e, dmg, ev, u); }
    }
    return ev;
  }

  // ---- enemy turns
  enemyAct(e) {
    const ev = [];
    // a sleeping or stunned foe loses its wind-up (one more way to stop a telegraphed blow)
    if ((e.statuses.asleep || e.statuses.stun) && e.ms.windup) { this.clearWindup(e); ev.push({ t: 'say', u: e.uid, text: `${e.name} loses its wind-up.` }); }
    if (e.statuses.asleep) { if (--e.statuses.asleep <= 0) delete e.statuses.asleep; ev.push({ t: 'sleeping', u: e.uid }); return this.after(ev); }
    if (e.statuses.stun) { delete e.statuses.stun; ev.push({ t: 'stunned', u: e.uid }); return this.after(ev); }
    if (this.phase2 && this.ng2.act) { const r = this.ng2.act(this, e); if (r) return this.after(r); }
    if (e.mech) { const r = this.mechAct(e); if (r) return this.after(r); }
    if (this.normal && e.threat && e.threat.kind === 'windup') { const r = this.windup(e); if (r) return this.after(r); }
    const list = (this.normal && e.normalMoves) || e.moves;
    const mv = list[Math.floor(this.rng() * list.length)];
    this.enemyMove(e, mv, ev);
    return this.after(ev);
  }
  enemyMove(e, mv, ev, forced) {
    const M = MOVES[mv] || MOVES.bash;
    if (M.t === 'allies') { for (const a of this.alive('enemy')) a.buffs[M.buff] = 3; ev.push({ t: 'skill', u: e.uid, name: M.name }); ev.push({ t: 'buff', u: e.uid, b: M.buff }); return; }
    let hummedTarget = null;
    if (e.statuses.hummed && this.rng() < 0.5) { const pool = this.enemies.filter(x => this.targetable(x) && x !== e); if (pool.length) { hummedTarget = pool[Math.floor(this.rng() * pool.length)]; ev.push({ t: 'confused', u: e.uid }); } }
    ev.push({ t: 'skill', u: e.uid, name: M.name, enemy: true });
    const tg = M.t === 'all' && !hummedTarget ? this.alive('party').filter(p => this.targetable(p)) : [hummedTarget || forced || this.pickTarget(e, 'party')].filter(Boolean);
    for (const t of tg) for (let i = 0; i < (M.hits || 1); i++) {
      if (t.ko) break;
      const r = this.hit(e, t, M.pw || 1, M.st || 'str', ev, { name: M.name });
      if (r && M.status && !r.ko) this.applyStatus(r, M.status, M.chance, ev);
    }
  }
  // ---- ordinary enemies' readable threat: a wind-up. On its turn a foe winds up and names its mark (the 'charge'
  // event: a "(Guard!)" line and the red bar over it); on its next turn the blow lands (Guard halves it, as ever; no
  // crit, never misses). Only one foe winds up at a time and at most one blow lands per round, so threats come one
  // by one and can be read. Knocking the foe out, or putting it to sleep or stunning it, stops the blow.
  // threat: { kind: 'windup', aim: 'random' | 'weakest' | 'all', move: MOVES id, say: text with {e} (foe) and {t} (mark) }
  clearWindup(e) { const w = e.ms.windup; if (!w) return; for (const p of this.party) { delete p.buffs.marked; delete p.buffs['marked-all']; } delete e.ms.windup; }
  windup(e) {
    const th = e.threat, ev = [], w = e.ms.windup;
    if (w) {
      this.clearWindup(e); this.lastRelease = this.round;
      const M = MOVES[th.move];
      ev.push({ t: 'skill', u: e.uid, name: M.name, enemy: true, big: true });
      let tg;
      if (w.all) tg = this.alive('party').filter(p => this.targetable(p));
      else { const taunt = this.party.find(p => this.targetable(p) && p.buffs.taunt); const m = this.unit(w.mark); tg = [taunt || (m && this.targetable(m) ? m : this.pickTarget(e, 'party'))].filter(Boolean); }
      for (const t of tg) { const r = this.hit(e, t, M.pw, M.st || 'str', ev, { name: M.name, sure: true, noCrit: true, heavy: true }); if (r && M.status && !r.ko) this.applyStatus(r, M.status, M.chance, ev); }
      return ev;
    }
    if (this.enemies.some(x => x !== e && !x.ko && x.ms.windup) || this.lastRelease === this.round || this.rng() >= (th.chance || 0.6)) return null;
    const pool = this.party.filter(p => this.targetable(p)); if (!pool.length) return null;
    let mark = null;
    if (th.aim === 'all') { for (const p of pool) p.buffs['marked-all'] = 2; }
    else {
      mark = pool.find(p => p.buffs.taunt) || (th.aim === 'weakest' ? pool.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] : pool[Math.floor(this.rng() * pool.length)]);
      mark.buffs.marked = 2;
    }
    e.ms.windup = { mark: mark && mark.uid, all: th.aim === 'all' };
    ev.push({ t: 'charge', u: e.uid, mark: mark ? mark.uid : 'all', text: th.say.replace('{e}', e.name).replace('{t}', mark ? mark.name : 'everyone') });
    return ev;
  }
  // boss mechanics at round start
  mechRoundStart(e) {
    const ev = [], ms = e.ms, r = this.round;
    switch (e.mech) {
      case 'choir': {
        // one mouth glows each round, in turn
        const mouths = this.enemies.filter(x => x.mech === 'choir' && !x.ko);
        // (only the first mouth runs this: each mouth used to clear the glow the first one had just set, so no mouth ever spoke)
        if (e === mouths[0]) { for (const m of mouths) { m.ms.glow = false; m.ms.silenced = false; } const g = mouths[(r - 1) % mouths.length]; g.ms.glow = true; ev.push({ t: 'glow', u: g.uid }); }
        break;
      }
      case 'watcher': {
        ms.eyes = (ms.eyes || 0) + 1; ev.push({ t: 'eye-open', u: e.uid, eyes: ms.eyes });
        break;
      }
      case 'submerge': {
        ms.submerged = r % 3 === 0; if (ms.submerged) ev.push({ t: 'say', u: e.uid, text: 'The Tidewarden sinks under the black water...' });
        break;
      }
      case 'witch': {
        const frac = e.hp / e.maxHp; ms.phase = ms.phase || 0;
        const ph = frac <= 0.34 ? 2 : frac <= 0.67 ? 1 : 0;
        if (ph > ms.phase || r === 1) {
          ms.phase = Math.max(ms.phase, ph);
          const waves = [['wolf-west', 'wolf-west'], ['crow-west', 'crow-west'], ['winkie-guard', 'winkie-guard']];
          const wave = waves[Math.min(2, r === 1 ? 0 : ph)];
          const room = 4 - this.alive('enemy').length;
          const add = wave.slice(0, Math.max(0, room)).map(t => this.summon(t, e.lvl - 3));
          if (add.length) ev.push({ t: 'summon', us: add.map(a => a.uid), say: ['"Wolves! Tear them— er, chase them off!"', '"Crows! Peck their eyes— peck at them!"', '"Winkies! Seize them!"'][Math.min(2, r === 1 ? 0 : ph)] });
        }
        break;
      }
      case 'pull-out': {
        if (r % 3 === 0) { const t = this.pickTarget(e, 'party'); if (t) { t.out = true; t.outRound = r; this.order = this.order.filter(x => x !== t.uid); ev.push({ t: 'pulled', u: t.uid }); } }
        break;
      }
    }
    return ev;
  }
  summon(type, lvl) { const u = makeEnemy([type, Math.max(1, lvl), 0], this.nextUid++); if (this.o.lvlShift) u.drops = 2 * Math.max(1, lvl - this.o.lvlShift); this.enemies.push(u); return u; }
  // boss mechanics on the boss's own turn: return events, or null to act normally
  mechAct(e) {
    const ev = [], ms = e.ms, r = this.round;
    switch (e.mech) {
      case 'summon-weasel':
        if (r % 3 === 0 && this.alive('enemy').length < 4) { const a = this.summon('weasel', e.lvl - 2); ev.push({ t: 'summon', us: [a.uid], say: '"Lads! Another one here!"' }); return ev; }
        return null;
      case 'off-with':
        if (ms.charge === 2) { ms.charge = 0; ev.push({ t: 'skill', u: e.uid, name: '"—OFF WITH THEIR HEADS!"', enemy: true, big: true }); for (const t of this.alive('party')) if (this.targetable(t)) this.hit(e, t, 1.6, 'str', ev, { name: 'Off with—', sure: true }); ev.push({ t: 'say', text: 'The King quietly pardons everyone.' }); return ev; }
        if (r % 3 === 1 && r > 1 || ms.charge === 1) { ms.charge = (ms.charge || 0) + 1; ev.push({ t: 'charge', u: e.uid, text: ms.charge === 1 ? '"Off with—" (the Queen draws a big breath)' : '"Off with their—" (Guard!)' }); return ev; }
        return null;
      case 'steal':
        if (this.rng() < 0.3) { const ids = Object.keys(this.items).filter(k => this.items[k] > 0 && k !== 'water-pail'); if (ids.length) { const it = ids[Math.floor(this.rng() * ids.length)]; this.items[it]--; ev.push({ t: 'steal', u: e.uid, item: it }); return ev; } }
        return null;
      case 'choir': {
        if (!ms.glow) { ev.push({ t: 'say', u: e.uid, text: 'A stone mouth murmurs, too softly to hear.' }); return ev; }
        if (ms.silenced) { ev.push({ t: 'say', u: e.uid, text: 'The glowing mouth opens... and can\'t find its words.' }); return ev; }
        const lines = ['"Your warren is cold tonight."', '"They have forgotten your name already."', '"You are very small, and it is very deep."', '"Somebody is digging, right now, under your feet."'];
        ev.push({ t: 'skill', u: e.uid, name: lines[r % lines.length], enemy: true, big: true });
        for (const t of this.alive('party')) { const { dmg } = this.damage(e, t, 0.5, 'wit'); ev.push({ t: 'hit', u: e.uid, tg: t.uid, dmg }); this.applyDamage(t, dmg, ev, e); if (!t.ko) this.applyStatus(t, 'afraid', 1, ev); }
        return ev;
      }
      case 'hummer':
        if (this.rng() < 0.5) { this.enemyMove(e, 'hum', ev); return ev; }
        return null;
      case 'moth-summon':
        if (this.alive('enemy').length === 1) { const a = [this.summon('lantern-moth', e.lvl - 3), this.summon('lantern-moth', e.lvl - 3)]; ev.push({ t: 'summon', us: a.map(x => x.uid), say: 'The Moth Queen calls her moths back!' }); return ev; }
        return null;
      case 'submerge':
        if (ms.submerged) { ev.push({ t: 'say', u: e.uid, text: 'Something huge moves under the water.' }); ms.strike = true; return ev; }
        if (ms.strike) { ms.strike = false; ev.push({ t: 'skill', u: e.uid, name: 'The Tide Rises', enemy: true, big: true }); const pw = e.hp < e.maxHp / 2 ? 1.6 : 1.3; for (const t of this.alive('party')) if (this.targetable(t)) this.hit(e, t, pw, 'str', ev, { name: 'Tide', sure: true }); return ev; }
        return null;
      case 'plough':
        if (ms.charge) { ms.charge = false; const t = this.pickTarget(e, 'party'); ev.push({ t: 'skill', u: e.uid, name: 'Plough', enemy: true, big: true }); if (t) { t.guard = false; this.hit(e, t, 2.0, 'str', ev, { name: 'Plough', pierce: true, sure: true }); } return ev; }
        if (r % 3 === 0) { ms.charge = true; ev.push({ t: 'charge', u: e.uid, text: 'Barley lowers his head and digs in his feet. (Guarding won\'t help!)' }); return ev; }
        return null;
      case 'witch':
        if (this.rng() < 0.4) { this.enemyMove(e, 'jinx', ev); return ev; }
        return null;
      case 'watcher':
        if (ms.eyes >= 7) {
          ms.eyes = 0; ev.push({ t: 'skill', u: e.uid, name: 'SEEN', enemy: true, big: true });
          for (const t of this.alive('party')) { if (!this.targetable(t)) continue; this.hit(e, t, 1.8, 'wit', ev, { name: 'Seen', sure: true }); if (!t.ko) this.applyStatus(t, 'afraid', 1, ev); }
          ev.push({ t: 'eye-close', u: e.uid, eyes: 0 }); return ev;
        }
        return null;
      case 'collapse':
        if (r % 3 === 0) { ev.push({ t: 'skill', u: e.uid, name: 'Quarry Collapse', enemy: true, big: true }); for (const t of this.alive('party')) if (this.targetable(t)) this.hit(e, t, 1.4, 'str', ev, { name: 'Collapse', sure: true }); return ev; }
        if (r % 3 === 2) { ev.push({ t: 'charge', u: e.uid, text: 'Quarry hums and the chalk overhead groans. (Shield up!)' }); }
        return null;
      case 'hum-all':
        if (r % 2 === 0) { ev.push({ t: 'skill', u: e.uid, name: 'The Hum', enemy: true, big: true }); for (const t of this.alive('party')) this.applyStatus(t, 'hummed', 0.6, ev); return ev; }
        return null;
      case 'dream': {
        const lines = ['The Eye looks at you, sleepily, as if from very far away.', 'The upside-down hills tilt. The black sun hums.', 'The dream turns over, restless.'];
        ev.push({ t: 'say', u: e.uid, text: lines[r % lines.length] });
        if (r % 2 === 0) for (const t of this.alive('party')) { const { dmg } = this.damage(e, t, 0.7, 'wit'); ev.push({ t: 'hit', u: e.uid, tg: t.uid, dmg }); this.applyDamage(t, dmg, ev, e); }
        return ev;
      }
    }
    return null;
  }
  after(ev) {
    if (!this.result) {
      if (!this.alive('enemy').some(e => e.bar !== 'mote')) this.result = 'win';
      else if (!this.party.some(p => !p.ko)) this.result = 'lose';
    }
    return ev;
  }
}
