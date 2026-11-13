// New Game+ only: every boss's second phase (design/changes/ngplus.md, review fixes in design/changes/REVIEW.md 1).
// Keyed by encounter id; read by battle/rpg.js and tools/lib-battle.mjs and handed to BattleSim as opts.ng2.
// Hooks (battle/sim.js, all inert in the base game):
//   trigger(sim) -> bool (default: the boss at or below `at` of its bar), checked at each round start;
//   lines, sfx: the phase banner; enter(sim, boss) -> events, once; round(sim, boss) -> events, every round start
//     from then on (after mechRoundStart and the encounter's onRound, before the turn order is sorted);
//   onRound(sim, base) -> events: wraps the encounter's own onRound (Tansy, the Tidewarden);
//   act(sim, e) -> events | null: an enemy's turn in phase 2, before the boss mechanic;
//   takeMod(sim, src, tgt, o) -> damage multiplier; onHit(sim, src, tgt, o, ev, dmg); itemMod(sim, id, e, dmg, ev);
//   story(sim, teller, memory, ev): Tell a Story in NG+ (the Eye's bar in eighths);
//   counter(sim) -> turn-bar text; counter2: the autopilot's counter policy id; hp / atk: NG+ boss multipliers.
// sim.ngs is a scratch object for the phase's state (shown to the autopilot by battleState().ngs).
import { PARTY } from '../core/party.js';

const say = text => ({ t: 'say', text });
const live = (sim, id) => sim.enemies.find(e => e.id === id && !e.ko);
const open = sim => sim.alive('party').filter(p => sim.targetable(p));
const pick = (sim, pool) => pool[Math.floor(sim.rng() * pool.length)];
const since = sim => sim.round - sim.phase2Round;   // 0 on the round phase 2 began
const normal = (sim, e) => { const ev = []; sim.enemyMove(e, e.moves[Math.floor(sim.rng() * e.moves.length)], ev); return ev; };

// the Eye: who should tell each memory. Friends who can't be in the party have a stand-in who was there too.
export const TELLER = {
  'mem-river': 'mole', 'mem-pebble': 'pip', 'mem-dandelion': 'ninefold', 'mem-teaparty': 'cheshire-cat', 'mem-traveller': 'jade-rabbit',
  'mem-poppies': 'tin-woodman', 'mem-mushrooms': 'pip', 'mem-roses': 'cheshire-cat', 'mem-wick': 'jade-rabbit', 'mem-china': 'tin-woodman', 'mem-stars': 'ninefold',
};
export const tellerOf = (sim, mem) => TELLER[mem] || ((sim.o.memFriend || {})[mem]) || null;

// tuning (tools/balance.mjs --ng)
const CARVE_PW = 3.0, QUEEN_PW = 3.2, MOTH_PW = 2.4, TANSY_PW = 3.4, TANSY_TUMBLE = 0.12, EYE_HP = 0.35, TIDE_PW = [1.0, 0.8], PLOUGH_PW = 2.2,
  ROOTED = 0.35, VERSE_BREAK = 0.1, VERSE_MEND = 0.25, SEEN_PW = 3.4, SEEN_LEARN = 1.15, QUARRY_PW = 1.6, HOLLOW_MEND = 0.07, FORGET_PW = 3.0, HOLLOW_DARK = 0.5, HELD_COST = 0.35, DRONE = 0.5;
// a telegraphed single blow (the "(Guard!)" pattern): mark on one turn, land on the next
const markBlow = (sim, e, text) => { const pool = open(sim); if (!pool.length) return null; const t = pick(sim, pool); e.ms.ngMark = t.uid; t.buffs.marked = 2; return [{ t: 'charge', u: e.uid, mark: t.uid, text: text(t) }]; };
const landBlow = (sim, e, name, pw, ev) => {
  const t = sim.unit(e.ms.ngMark); delete e.ms.ngMark; for (const p of sim.party) delete p.buffs.marked;
  if (!t || !sim.party.includes(t) || !sim.targetable(t)) return false;
  ev.push({ t: 'skill', u: e.uid, name, enemy: true, big: true }); sim.hit(e, t, pw, 'str', ev, { name, sure: true, noCrit: true, heavy: true }); return true;
};

const verse = (sim, a) => { Object.assign(sim.ngs, { verse: 2, verseStart: sim.round, verseHp: a.hp }); return [{ t: 'charge', u: a.uid, text: 'Aster begins to recite the Deep Verse. (Hit her before she finishes!)' }]; };

export const NG2 = {
  // ---- the Chief Weasel: two lads a time, and he hides behind them
  'c1.chief-weasel': {
    counter2: 'aoe-then-boss', at: 0.6,
    lines: ['The Chief Weasel jumps up on the banquet table and bangs a spoon.', '"Second helpings, lads! Everybody up on the table!"'],
    act(sim, e) {
      if (e.id !== 'chief-weasel') return null;
      // the carving fork: named the round before (Guard!), then the blow
      if (e.ms.ngMark) { const ev = []; if (!landBlow(sim, e, 'The Carving Fork', CARVE_PW, ev)) ev.push(say('The Chief Weasel jabs the fork at nobody and looks silly.')); return ev; }
      if (sim.round % 3 === 1) return markBlow(sim, e, t => `The Chief Weasel raises the carving fork at ${t.name}... (Guard!)`);
      if (sim.round % 3 !== 0) return null;
      // up to two lads at the table at a time (more chairs only as they're cleared)
      const room = Math.min(4 - sim.alive('enemy').length, 2 - sim.enemies.filter(x => x.id === 'weasel' && !x.ko).length); if (room <= 0) return null;
      const us = []; for (let i = 0; i < room; i++) us.push(sim.summon('weasel', e.lvl - 2));
      return [{ t: 'summon', us: us.map(u => u.uid), say: '"Two more chairs at the table, lads!"' }];
    },
    round(sim) {
      const c = live(sim, 'chief-weasel'); if (!c) return [];
      const behind = sim.enemies.filter(e => e.id === 'weasel' && !e.ko).length >= 2, was = sim.ngs.behind;
      sim.ngs.behind = behind; if (behind) c.buffs.shielded = 1;
      if (behind && !was) return [say('The Chief Weasel ducks behind his lads. (Clear them away!)')];
      if (!behind && was) return [say('The Chief Weasel is out in the open!')];
      return [];
    },
    counter: sim => sim.ngs.behind ? 'Behind his lads' : 'In the open',
  },
  // ---- the Queen of Hearts: she names one head at a time. Guard halves it; only hiding or swapping out dodges it.
  'c1w.croquet': {
    counter2: 'guard-named', at: 0.6,
    lines: ['The Queen goes crimson. "Who has been PAINTING my roses?"', 'The King, quietly: "One at a time, my dear."'],
    enter(sim, q) {
      if (q) q.ms.charge = 0;
      if (!q || sim.alive('enemy').length >= 4) return [];
      const s = sim.summon('card-soldier', q.lvl - 3);
      return [{ t: 'summon', us: [s.uid], say: '"Soldiers! To your places!"' }];
    },
    act(sim, e) {
      if (e.id !== 'queen-of-hearts') return null;
      const ms = e.ms, ev = [];
      if (ms.ngMark) {
        const t = sim.unit(ms.ngMark); delete ms.ngMark; ms.ngLast = sim.round;
        for (const p of sim.party) delete p.buffs.marked;
        if (t && sim.party.includes(t) && sim.targetable(t)) {
          ev.push({ t: 'skill', u: e.uid, name: '"—OFF WITH YOUR HEAD!"', enemy: true, big: true });
          sim.hit(e, t, QUEEN_PW, 'str', ev, { name: 'Off with—', sure: true, noCrit: true, heavy: true });
          ev.push(say('The King quietly pardons them.'));
        } else ev.push(say('The executioner looks everywhere. You can\'t cut off a head that isn\'t there.'));
        return ev;
      }
      if (sim.round - (ms.ngLast || -9) >= 2) {
        const pool = open(sim);
        if (pool.length) { const t = pick(sim, pool); ms.ngMark = t.uid; t.buffs.marked = 2; return [{ t: 'charge', u: e.uid, mark: t.uid, text: `"Off with ${t.name}'s—" (Guard it, hide, or swap out!)` }]; }
      }
      return normal(sim, e);
    },
  },
  // ---- the Whispering Choir: the two mouths left speak in a round, both glowing
  'c1w.choir': {
    counter2: 'aoe-glowing', sfx: 'choir-sting',
    trigger: sim => sim.enemies.some(e => e.mech === 'choir' && e.ko),
    lines: ['One mouth goes quiet. The other two take a breath together...', '...and begin to speak in a round.'],
    round(sim) {
      const ev = [];
      for (const m of sim.enemies.filter(e => e.mech === 'choir' && !e.ko)) if (!m.ms.glow) { m.ms.glow = true; m.ms.silenced = false; ev.push({ t: 'glow', u: m.uid }); }
      return ev;
    },
    act(sim, e) {
      if (e.mech !== 'choir' || !e.ms.glow || e.ms.silenced) return null;
      const lines = ['"We will remember you, even when you forget."', '"Brammmble... Brammble... Bramble..."', '"The deep is listening, and it is very patient."', '"Your friends are a long way up. A long, long way."'];
      const ev = [{ t: 'skill', u: e.uid, name: lines[(sim.round + e.uid) % lines.length], enemy: true, big: true }];
      for (const t of sim.alive('party')) { const { dmg } = sim.damage(e, t, 0.5, 'wit'); ev.push({ t: 'hit', u: e.uid, tg: t.uid, dmg }); sim.applyDamage(t, dmg, ev, e); if (!t.ko) sim.applyStatus(t, 'afraid', 1, ev); }
      return ev;
    },
    counter: sim => 'Speaking in a round',
  },
  // ---- Aster: the Deep Verse. Break her concentration (hit her hard) before she finishes, or everyone is Hummed.
  'c2.aster': {
    counter2: 'focus-verse', at: 0.6,
    lines: ['Aster closes her eyes. "I wrote a new poem in the dark."', '"Listen. It goes deeper every line."'],
    enter: (sim, a) => a ? verse(sim, a) : [],
    round(sim) {
      const a = live(sim, 'aster'), n = sim.ngs; if (!a) return [];
      if (n.verse > 0 && sim.round > n.verseStart) {
        if (n.verseHp - a.hp >= a.maxHp * VERSE_BREAK) { n.verse = 0; n.next = sim.round + 2; return [say('Aster stumbles on a word and blinks. For a moment her eyes are brown.'), say('She has lost her place in the verse.')]; }
        n.verse--;
        if (n.verse > 0) return [{ t: 'charge', u: a.uid, text: 'Aster recites on, softly. One line left! (Stop her!)' }];
        n.next = sim.round + 2;
        const ev = [{ t: 'skill', u: a.uid, name: 'The Deep Verse', enemy: true, big: true }];
        for (const t of sim.alive('party')) sim.applyStatus(t, 'hummed', 0.7, ev);
        const amt = Math.min(a.maxHp - a.hp, Math.round(a.maxHp * VERSE_MEND)); if (amt > 0) { a.hp += amt; ev.push({ t: 'heal', u: a.uid, amt }); }
        a.buffs.str = 3; ev.push({ t: 'buff', u: a.uid, b: 'str' });
        return ev;
      }
      if (!n.verse && sim.round >= n.next) return verse(sim, a);
      return [];
    },
    counter: sim => sim.ngs.verse > 0 ? `Verse: ${sim.ngs.verse} line${sim.ngs.verse > 1 ? 's' : ''} left` : null,
  },
  // ---- the Moth Queen: the stolen pestle glows brighter each round; Light on her dims it
  'c2.moth-queen': {
    counter2: 'light-dims', at: 0.5,
    lines: ['The Moth Queen holds up the stolen pestle. It begins to glow.', '"Everything that glows is MINE. Look how it glows for me!"'],
    round(sim) {
      const q = live(sim, 'moth-queen'); if (!q) return [];
      // a full glow is let loose the round after it's reached (she waits for the end of that round)
      if ((sim.ngs.glow || 0) >= 3) { sim.ngs.dust = true; q.ms.last = true; return [{ t: 'charge', u: q.uid, text: 'She lifts the blazing pestle high... (Light at her, or brace!)' }]; }
      sim.ngs.glow = (sim.ngs.glow || 0) + 1;
      return sim.ngs.glow >= 3 ? [say('The pestle blazes white! (Light at her, before she lets it loose!)')] : [];
    },
    act(sim, e) {
      if (e.id !== 'moth-queen' || !sim.ngs.dust) return null;
      sim.ngs.glow = 0; sim.ngs.dust = false; e.ms.last = false;
      const ev = [{ t: 'skill', u: e.uid, name: 'Moon-dust', enemy: true, big: true }];
      for (const t of open(sim)) { const r = sim.hit(e, t, MOTH_PW, 'str', ev, { name: 'Moon-dust', sure: true, noCrit: true }); if (r && !r.ko) sim.applyStatus(r, 'asleep', 0.6, ev); }
      return ev;
    },
    onHit(sim, src, tgt, o, ev) { if (tgt.id === 'moth-queen' && o.light && (sim.ngs.glow || 0) > 0) { sim.ngs.glow = 0; sim.ngs.dust = false; tgt.ms.last = false; ev.push(say('The light outshines the pestle. She squints, and it dims.')); } },
    counter: sim => `Pestle glow: ${sim.ngs.glow || 0}/3`,
  },
  // ---- Tansy: she nearly remembers, and races Bramble every other round. Bramble braced: she tumbles (one action lost).
  'c2.tansy': {
    counter2: 'bramble-guards', at: 0.5,
    lines: ['Tansy stops. "Bramble?"', '"...Race you to the warren mouth." Her eyes go pale again. She crouches.'],
    onRound(sim, base) {
      if (!sim.phase2) return base(sim);
      const t = live(sim, 'tansy-taken'); if (!t) return [];
      t.ms.moves0 = t.ms.moves0 || t.moves; t.ms.strike = false;
      if (since(sim) % 2 === 1) {
        t.ms.ngDash = true; t.ms.last = true; t.mech = null;
        const b = sim.party.find(p => p.id === 'bramble' && !p.ko && !p.out); if (b) b.buffs.marked = 2;
        return [{ t: 'charge', u: t.uid, mark: b && b.uid, text: 'Tansy crouches, eyes on Bramble. "Race you..." (Bramble: Guard!)' }];
      }
      t.ms.ngDash = false; t.ms.last = false; t.moves = t.ms.moves0;
      const was = t.mech; t.mech = t.statuses.afraid || sim.party.filter(p => !p.ko).every(p => p.buffs.shielded) ? null : 'two-actions';
      return t.mech === null && was ? [say('Tansy flinches and glances behind her. She\'s slower now!')] : [];
    },
    act(sim, e) {
      if (e.id !== 'tansy-taken' || !e.ms.ngDash) return null;
      e.ms.ngDash = false; for (const p of sim.party) delete p.buffs.marked;
      const ev = [{ t: 'skill', u: e.uid, name: 'Race You!', enemy: true, big: true }];
      const b = sim.party.find(p => p.id === 'bramble' && sim.targetable(p)) || sim.pickTarget(e, 'party'); if (!b) return ev;
      const braced = b.id === 'bramble' && !!b.guard;
      sim.hit(e, b, TANSY_PW, 'str', ev, { name: 'Race You!', sure: true, noCrit: true, heavy: true });
      if (braced && !e.ko) {
        const dmg = Math.round(e.maxHp * TANSY_TUMBLE);
        ev.push(say('She runs smack into Bramble and they both tumble. She remembers... something.'));
        ev.push({ t: 'hit', u: b.uid, tg: e.uid, dmg, name: 'Tumble' }); sim.applyDamage(e, dmg, ev, b);
        if (!e.ko) e.statuses.stun = 1;
      } else if (!braced) { e.buffs.str = 3; ev.push(say('"Won!" She sounds almost like herself. Then the Hum hums louder.')); ev.push({ t: 'buff', u: e.uid, b: 'str' }); }
      return ev;
    },
  },
  // ---- the Tidewarden: the pool opens its eyes while it's under. Shut them, or the Tide comes up bigger.
  'c2.tidewarden': {
    counter2: 'hit-eyes', at: 0.5,
    lines: ['The Tidewarden sinks lower...', '...and all around the pool, the water opens its eyes.'],
    onRound(sim, base) {
      if (!sim.phase2) return base(sim);
      const t = live(sim, 'tidewarden'); if (!t || !t.ms.submerged) return [];
      const room = 4 - sim.alive('enemy').length, us = [];
      for (let i = 0; i < Math.min(2, room); i++) { const u = sim.summon('drowned-eye', t.lvl - 2); u.name = 'Pool Eye'; u.maxHp = u.hp = Math.round(u.maxHp * EYE_HP); u.xp = 0; u.drops = 0; u.ngEye = true; us.push(u); }
      return us.length ? [{ t: 'summon', us: us.map(u => u.uid), say: 'Pale eyes open all round the pool, watching. (Shut them before the Tide!)' }] : [];
    },
    act(sim, e) {
      if (e.id !== 'tidewarden' || !e.ms.strike || e.ms.submerged) return null;
      e.ms.strike = false;
      const eyes = sim.enemies.filter(x => x.ngEye && !x.ko), ev = [];
      if (!eyes.length) { ev.push(say('The Tide finds nothing to look at. It rolls back.')); return ev; }
      ev.push({ t: 'skill', u: e.uid, name: 'The Tide Rises', enemy: true, big: true });
      for (const t of open(sim)) sim.hit(e, t, TIDE_PW[0] + TIDE_PW[1] * eyes.length, 'str', ev, { name: 'Tide', sure: true });
      for (const x of eyes) { x.ko = true; x.hp = 0; sim.order = sim.order.filter(id => id !== x.uid); ev.push({ t: 'ko', u: x.uid, bar: 'shadow' }); }
      return ev;
    },
    counter: sim => { const n = sim.enemies.filter(x => x.ngEye && !x.ko).length; return n ? `Pool eyes open: ${n}` : null; },
  },
  // ---- Barley: rooted in his furrow (takes half), ploughing every other round. Afraid loosens him for 2 rounds.
  'c3.barley': {
    counter2: 'afraid-unroots', at: 0.5,
    lines: ['"Deep furrow... deeper..." Barley plants his feet.', 'Corn-roots wind round his legs. (Startle him loose!)'],
    round(sim) {
      const b = live(sim, 'barley'); if (!b) return [];
      const n = sim.ngs, af = !!b.statuses.afraid, ev = [];
      if (af && !n.wasAfraid) { n.looseUntil = sim.round + 2; ev.push(say('Barley startles. His feet come up out of the furrow!')); }
      n.wasAfraid = af;
      const rooted = sim.round >= (n.looseUntil || 0);
      if (rooted && n.rooted === false) ev.push(say('Barley hums, and the roots wind round his feet again.'));
      n.rooted = rooted; return ev;
    },
    takeMod: (sim, src, tgt) => tgt.id === 'barley' && src.side === 'party' && sim.ngs.rooted ? ROOTED : 1,
    act(sim, e) {
      if (e.id !== 'barley') return null;
      const ms = e.ms;
      if (ms.charge) {
        ms.charge = false; const t = sim.pickTarget(e, 'party'), ev = [{ t: 'skill', u: e.uid, name: 'The Long Furrow', enemy: true, big: true }];
        if (t) { t.guard = false; sim.hit(e, t, PLOUGH_PW, 'str', ev, { name: 'Plough', pierce: true, sure: true }); }
        return ev;
      }
      if (since(sim) % 2 === 0) { ms.charge = true; return [{ t: 'charge', u: e.uid, text: 'Barley lowers his head and digs in his feet. (Guarding won\'t help!)' }]; }
      return normal(sim, e);
    },
    counter: sim => sim.ngs.rooted ? 'Rooted (startle him!)' : 'Loose!',
  },
  // ---- the Wicked Witch: her black umbrella is up 2 rounds in 3 (its closing is warned the round before); pails run off it
  'c3.witch': {
    counter2: 'pail-when-open', at: 0.7,
    lines: ['"Water? WATER? Not today, my pretty little rabbit!"', 'She snaps open a big black umbrella.'],
    round(sim) {
      if (!live(sim, 'wicked-witch')) return [];
      const k = since(sim) % 3, n = sim.ngs, was = n.umbrella, ev = [];
      n.umbrella = k !== 2;
      if (!n.umbrella && was) ev.push(say('The umbrella snaps shut. Now\'s your chance!'));
      if (k === 0 && sim.round > sim.phase2Round) ev.push(say('Up goes the umbrella again!'));
      if (k === 1) ev.push({ t: 'charge', u: live(sim, 'wicked-witch').uid, text: 'The Witch fumbles with her umbrella catch... (it shuts next round!)' });
      return ev;
    },
    itemMod(sim, id, e, dmg, ev) { if (e.id === 'wicked-witch' && sim.ngs.umbrella) { ev.push(say('The water runs off her umbrella! "Ha!"')); return 10; } return dmg; },
    counter: sim => sim.ngs.umbrella ? 'Umbrella UP' : 'Umbrella down',
  },
  // ---- the Watcher on the Stair: three eyes a round, and the whole stair looks every third round (or at 7 eyes):
  // when SEEN is announced, look away (Guard); every rabbit it sees makes it stronger
  'c3.watcher': {
    counter2: 'all-hit-eyes', at: 0.5,
    lines: ['Every shut eye on the Watcher flickers.', 'It isn\'t one thing watching any more. It\'s the whole stair.'],
    round(sim) {
      const w = live(sim, 'watcher'); if (!w) return [];
      w.ms.eyes = Math.min(7, (w.ms.eyes || 0) + 2); const ev = [{ t: 'eye-open', u: w.uid, eyes: w.ms.eyes }];
      if ((w.ms.eyes >= 7 || since(sim) % 3 === 2) && !sim.ngs.seen) { sim.ngs.seen = true; w.ms.last = true; ev.push({ t: 'charge', u: w.uid, text: 'Every eye on the stair turns toward you. (Look away: Guard!)' }); }
      return ev;
    },
    // SEEN, once announced, comes whatever you shut; only a rabbit who looks away (Guards) isn't seen
    act(sim, e) {
      if (e.id !== 'watcher' || !sim.ngs.seen) return null;
      sim.ngs.seen = false; e.ms.eyes = 0; e.ms.last = false;
      const ev = [{ t: 'skill', u: e.uid, name: 'SEEN', enemy: true, big: true }];
      for (const t of open(sim)) {
        if (t.guard) { ev.push(say(`${t.name} looks away. Not seen.`)); continue; }
        const r = sim.hit(e, t, SEEN_PW, 'wit', ev, { name: 'Seen', sure: true, noCrit: true }); if (r && !r.ko) sim.applyStatus(r, 'afraid', 1, ev);
        e.wit = Math.round(e.wit * SEEN_LEARN); e.str = Math.round(e.str * SEEN_LEARN);   // every rabbit it sees, it knows a little better
      }
      ev.push({ t: 'eye-close', u: e.uid, eyes: 0 }); return ev;
    },
    counter: sim => { const w = live(sim, 'watcher'); return w ? `Open eyes: ${w.ms.eyes || 0}/7` : null; },
  },
  // ---- Captain Quarry: he digs straight down; Dig skills backfill the hole
  'c4.quarry': {
    counter2: 'dig-backfill', at: 0.5, sfx: 'rumble',
    lines: ['Quarry drops his flint and digs straight down with his bare paws. "Deeper. It\'s just a little deeper."', 'Yarrow, from the lip: "Fill it in, Bramble! Dig against him!"'],
    round(sim) {
      const q = live(sim, 'captain-quarry-boss'); if (!q) return [];
      sim.ngs.hole = Math.min(4, (sim.ngs.hole || 0) + 1);
      return sim.ngs.hole >= 4 ? [{ t: 'charge', u: q.uid, text: 'The floor of the hole groans. He\'s nearly through! (Backfill it!)' }] : [];
    },
    act(sim, e) {
      if (e.id !== 'captain-quarry-boss' || (sim.ngs.hole || 0) < 4 || sim.round % 3 === 0) return null;
      sim.ngs.hole = 0;
      const ev = [{ t: 'skill', u: e.uid, name: 'Breakthrough', enemy: true, big: true }];
      for (const t of open(sim)) { const r = sim.hit(e, t, QUARRY_PW, 'str', ev, { name: 'Breakthrough', sure: true, noCrit: true }); if (r && !r.ko) sim.applyStatus(r, 'afraid', 0.6, ev); }
      ev.push(say('The hole breaks through into the dark below. Cold air pours up. He starts a new one.'));
      return ev;
    },
    onHit(sim, src, tgt, o, ev) {
      if (tgt.id === 'captain-quarry-boss' && src.side === 'party' && (o.tags || []).includes('Dig') && (sim.ngs.hole || 0) > 0) { sim.ngs.hole--; ev.push(say(`${src.name} backfills the hole! (Hole: ${sim.ngs.hole}/4)`)); }
    },
    counter: sim => `Hole: ${sim.ngs.hole || 0}/4`,
  },
  // ---- the Hollow Rabbits: the last two hold paws (mending each other) and whisper everyone to sleep
  'c4.hollow': {
    counter2: 'light-aoe',
    trigger: sim => sim.enemies.filter(e => e.id === 'hollow-rabbits' && e.ko).length >= 2,
    lines: ['Two Hollow Rabbits fade. The other two take each other\'s paws, and the dark folds round them.', '"Stay," they whisper. "Forget with us." (Only light reaches them now.)'],
    round(sim) {
      const hs = sim.enemies.filter(e => e.id === 'hollow-rabbits' && !e.ko), ev = []; if (!hs.length) return ev;
      if (hs.length === 2) for (const h of hs) { const amt = Math.min(h.maxHp - h.hp, Math.round(h.maxHp * HOLLOW_MEND)); if (amt > 0) { h.hp += amt; ev.push({ t: 'heal', u: h.uid, amt }); } }
      // "Come and forget": whispered the round before (Guard!), then it lands at the next round's start on everyone;
      // a braced (Guarding) rabbit holds on to their name: half the chill, and no sleep
      if (sim.ngs.forget) {
        sim.ngs.forget = false;
        ev.push({ t: 'skill', u: hs[0].uid, name: '"...and forget."', enemy: true, big: true });
        for (const t of open(sim)) { const braced = !!t.guard; const r = sim.hit(hs[0], t, FORGET_PW, 'wit', ev, { name: 'Forget', sure: true, noCrit: true }); if (r && !r.ko) { if (braced) ev.push(say(`${t.name} holds on to their own name.`)); else sim.applyStatus(r, 'asleep', 0.8, ev); } }
      } else if (since(sim) % 3 === 1) { sim.ngs.forget = true; ev.push({ t: 'charge', u: hs[0].uid, text: '"Come and forget..." the whisper fills the ruins. (Brace: Guard!)' }); }
      return ev;
    },
    // holding paws, they fade into the dark together: only light reaches them properly
    takeMod: (sim, src, tgt, o) => tgt.id === 'hollow-rabbits' && src.side === 'party' && !o.light && sim.enemies.filter(e => e.id === 'hollow-rabbits' && !e.ko).length === 2 ? HOLLOW_DARK : 1,
    counter: sim => sim.enemies.filter(e => e.id === 'hollow-rabbits' && !e.ko).length === 2 ? 'Holding paws (only light reaches them)' : null,
  },
  // ---- the Nightmare of Deepdelve: a pulled friend is held 2 rounds in a Hole in the Dream; hit the hole to pull them out
  'c5.nightmare-deepdelve': {
    counter2: 'rescue-hole', at: 0.5,
    lines: ['The dream opens a dark mouth in the grass.', '"Down here," it says, in Deepdelve\'s voice. "Stay down here."'],
    round(sim) {
      const ev = [];
      // a hole whose friend came back on their own closes; and with nothing else left in the dream, the fight is over
      for (const h of sim.enemies.filter(e => e.id === 'dream-hole' && !e.ko)) {
        const f = sim.unit(h.ngHole); if (f && f.out && sim.enemies.some(e => !e.ko && e.id !== 'dream-hole')) continue;
        // left down there the whole time, the friend climbs out cold and frightened
        if (f && !f.ko && !f.out) { f.hp = Math.max(1, f.hp - Math.round(f.maxHp * HELD_COST)); ev.push(say(`${f.name} climbs out of the dark on their own, cold and shaking.`)); sim.applyStatus(f, 'afraid', 1, ev); }
        h.ko = true; h.hp = 0; ev.push({ t: 'ko', u: h.uid, bar: 'shadow' });
      }
      if (!sim.enemies.some(e => !e.ko)) { sim.after([]); return ev; }
      const n = live(sim, 'nightmare-deepdelve'); if (!n) return ev;
      n.mech = null;   // its own pull is replaced: every other round, and held for two
      if (since(sim) % 2 !== 0) return ev;
      const t = sim.pickTarget(n, 'party'); if (!t || sim.alive('party').length < 2) return ev;
      t.out = true; t.ngHeld = true; t.outRound = sim.round + 1; sim.order = sim.order.filter(x => x !== t.uid); ev.push({ t: 'pulled', u: t.uid });
      if (sim.alive('enemy').length >= 4) { ev.push(say(`The dark holds ${t.name} down for longer.`)); return ev; }
      const h = sim.summon('dream-hole', n.lvl - 2); h.maxHp = h.hp = n.maxHp; h.xp = 0; h.drops = 0; h.ngHole = t.uid;   // deep: but one hit on it pulls the friend out
      ev.push({ t: 'summon', us: [h.uid], say: `A hole in the dream holds ${t.name}. (Hit it to pull them out!)` });
      return ev;
    },
    act(sim, e) { return e.id === 'dream-hole' ? [say('The hole in the dream yawns, and waits.')] : null; },
    onHit(sim, src, tgt, o, ev) {
      if (tgt.id !== 'dream-hole' || tgt.ngDone) return;
      tgt.ngDone = true;
      if (!tgt.ko) { tgt.hp = 0; tgt.ko = true; sim.order = sim.order.filter(x => x !== tgt.uid); ev.push({ t: 'ko', u: tgt.uid, bar: 'shadow' }); }
      const f = sim.unit(tgt.ngHole);
      if (f && f.out) { f.out = false; f.ngHeld = false; ev.push({ t: 'return', u: f.uid }); ev.push(say(`${src.name} reaches in and hauls ${f.name} back out!`)); }
    },
  },
  // ---- the Nightmare of Flintcomb: the Drone shields it; Bramble's Thump (or Long Thump) breaks it for 2 rounds
  'c5.nightmare-flintcomb': {
    counter2: 'thump-drone', at: 0.5,
    lines: ['Its hum drops low and steady as a drill.', 'Far above, faintly, someone is thumping. (Thump back!)'],
    round(sim) {
      if (!live(sim, 'nightmare-flintcomb')) return [];
      const s = sim.ngs, was = s.drone; s.drone = sim.round >= (s.brokenUntil || 0);
      return s.drone && was === false ? [say('The drone settles back in, steady as a drill.')] : [];
    },
    takeMod: (sim, src, tgt) => tgt.id === 'nightmare-flintcomb' && src.side === 'party' && sim.ngs.drone ? DRONE : 1,
    onHit(sim, src, tgt, o, ev) {
      if (tgt.id !== 'nightmare-flintcomb' || src.id !== 'bramble' || (o.skill !== 'thump' && o.skill !== 'long-thump')) return;
      const fresh = sim.ngs.drone; sim.ngs.drone = false; sim.ngs.brokenUntil = sim.round + 2;
      if (fresh) ev.push(say('Bramble thumps, and the drone stumbles out of time!'));
    },
    counter: sim => sim.ngs.drone ? 'Drone: unbroken' : 'Drone: broken!',
  },
  // ---- the Undersleeper's Eye: eight eighths of Dreaming. A story is one eighth; past half, the Eye wants the one who
  // was there: the right teller (or their stand-in) is two eighths, anyone else one.
  'c5.undersleeper-eye': {
    counter2: 'right-teller', sfx: 'choir-sting',
    trigger: sim => (sim.ngs.eighths || 0) >= 4,
    lines: ['The Eye opens wider. The black sun hums louder.', '"Who was THERE?" the dream asks. "Tell me from the one who was there."'],
    story(sim, u, mem, ev) {
      ev.push({ t: 'story', u: u.uid, memory: mem });
      const eye = sim.enemies.find(e => e.bar === 'dream' && !e.ko); if (!eye) return;
      const who = tellerOf(sim, mem), right = !who || who === u.id;
      sim.ngs.eighths = (sim.ngs.eighths || 0) + (sim.phase2 && right ? 2 : 1);
      eye.hp = Math.max(0, eye.maxHp - Math.ceil(eye.maxHp * sim.ngs.eighths / 8));
      if (sim.phase2) ev.push(say(right ? 'The one who was there. The Eye listens with all of itself.' : `The Eye listens, but it wants to hear it from ${(PARTY[who] || { name: who }).name}.`));
      if (sim.ngs.eighths >= 8) { eye.hp = 0; eye.ko = true; ev.push({ t: 'ko', u: eye.uid, bar: 'dream' }); }
    },
    act(sim, e) {
      if (e.mech !== 'dream') return null;
      const lines = ['The Eye looks straight at you, wide awake for a moment.', 'The upside-down hills turn over. The black sun hums louder.', 'The dream holds its breath, waiting for the right voice.'];
      const ev = [say(lines[sim.round % lines.length])];
      for (const t of sim.alive('party')) { const { dmg } = sim.damage(e, t, 0.7, 'wit'); ev.push({ t: 'hit', u: e.uid, tg: t.uid, dmg }); sim.applyDamage(t, dmg, ev, e); }
      return ev;
    },
    counterAlways: true, counter: sim => `Dreaming: ${8 - (sim.ngs.eighths || 0)}/8`,
  },
};

// NG+ boss Heart (after the encounter's own tweak), tuned with tools/balance.mjs --ng
const NG_HP = { 'c2.moth-queen': 1.3, 'c1.chief-weasel': 1.2, 'c1w.croquet': 1.0, 'c1w.choir': 1.15, 'c2.aster': 1.4, 'c2.tansy': 1.1, 'c2.tidewarden': 1.3, 'c3.barley': 0.8, 'c4.hollow': 0.75 };
for (const [k, v] of Object.entries(NG_HP)) NG2[k].hp = v;
