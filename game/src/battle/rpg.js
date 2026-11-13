// The RPG battle scene: draws the battle, takes commands, and animates BattleSim's events.
import { G, W, H, ui, pushScene, popScene, sleep, clamp, hits } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { sprite, bg as bgImg, anim, flipped, humEyes, silhouette, tint, placeholder, imageReady, has, spritePath } from '../engine/assets.js';
import { panel, bar, button, drawFace, drawIcon, fade, keyHint, mouseIn } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { PARTY, SKILLS } from '../data/core/party.js';
import { ITEMS } from '../data/core/items.js';
import { BattleSim, makeEnemy, makeAlly } from './sim.js';
import { BOSSES } from '../data/core/enemies.js';
import * as st from '../state.js';
import { ngEnemies } from './ngplus.js';
import { tellerOf } from '../data/ng/bosses.js';

let attempts = {};
// normal fights: a battle theme per world, picked by the backdrop (the downs, Thimblebank, River Bank and Depths keep m-battle)
const WORLD_BATTLE = { 'wonder-garden': 'm-battle-wonder', 'wonder-hall': 'm-battle-wonder', moon: 'm-battle-moon', 'oz-road': 'm-battle-oz', emerald: 'm-battle-oz', winkie: 'm-battle-oz',
  lidenbrock: 'm-battle-deep', root: 'm-battle-deep', stair: 'm-battle-deep', dream: 'm-battle-dream' };
function battleMusic(encId, enc) {
  if (enc.bg === 'mushroom') return encId.startsWith('c1w') ? 'm-battle-wonder' : 'm-battle-deep';   // Wonderland's wood and the Journey's mushroom forest share a backdrop
  return WORLD_BATTLE[enc.bg] || 'm-battle';
}
export function startBattle(encId, o = {}) {
  const enc = G.data.encounters[encId];
  if (!enc) { console.warn('no encounter', encId); return Promise.resolve('win'); }
  attempts[encId] = (attempts[encId] || 0) + 1;
  return new Promise(res => pushScene(new BattleScene(encId, enc, o, res)));
}

const STATUS_ICON = { afraid: 'ico-afraid', asleep: 'ico-asleep', hummed: 'ico-hummed', shrunk: 'ico-shrunk', grown: 'ico-grown', shielded: 'ico-shielded', stun: 'ico-stunned', 'tgh-down': 'ico-shrunk' };
const STATUS_NAME = { afraid: 'Afraid', asleep: 'Asleep', hummed: 'Hummed', shrunk: 'Shrunk', grown: 'Grown', shielded: 'Shielded', stun: 'Stunned', 'tgh-down': 'Toughness down' };
// staggered so no sprite (or enemy name) sits on top of another: back and front slots are far enough apart sideways
const PARTY_POS = [[200, 266], [146, 232], [96, 290]];
const FOE_POS = [[440, 266], [500, 232], [560, 290], [608, 244]];
const BESIDE_BIG = [[380, 236], [318, 298], [392, 178]];   // left of a big boss at [500, 270] (about x 400..600)

class BattleScene {
  constructor(encId, enc, o, done) {
    this.kind = 'battle'; this.opaque = true; this.encId = encId; this.enc = enc; this.o = o; this.done = done;
    this.t = 0; this.fx = []; this.nums = []; this.banner = null; this.flashT = {}; this.offset = {}; this.alpha = {}; this.woken = {};
    this.menu = null; this.shake = 0; this.fadeA = 1; this.phase = 'intro'; this.pose = {}; this.vignette = null;
    // party units: the travelling three; reserves for Swap
    const mk = (id, uid) => { const m = st.member(id); return makeAlly({ id, name: PARTY[id].name, lvl: m.lvl, hp: m.hp, pl: m.pl, stats: st.stats(id), skills: st.skillsOf(id) }, uid); };
    const trav = st.travelling();
    const party = trav.map((id, i) => mk(id, i + 1));
    const reserves = st.reserves().map((id, i) => mk(id, 10 + i));
    // New Game+: the encounter scaled to the party (battle/ngplus.js) and the boss's second phase (data/ng/bosses.js)
    let enemies, ngo = null;
    if (G.s.ng) {
      const r = ngEnemies(encId, enc, st.avgLevel()); enemies = r.enemies;
      ngo = { ng2: r.ng2, lvlShift: r.shift, memFriend: Object.fromEntries(Object.entries(G.data.memories || {}).map(([k, m]) => [k, m.friend])) };
    } else {
      enemies = enc.enemies.map((e, i) => makeEnemy(e, 50 + i));
      // per-encounter tweaks (story fights at a set strength)
      if (enc.tweak) enc.tweak(enemies);
    }
    this.sim = new BattleSim(party, enemies, {
      ...(ngo || {}),
      seed: encId + '#' + attempts[encId], easy: G.settings.easy, first: !!(o.first || enc.first),
      flee: enc.boss || enc.story ? 'never' : enc.flee || 'normal', items: { ...G.s.items }, itemDefs: ITEMS, reserves,
      onRound: enc.onRound ? (sim) => enc.onRound(sim, G) : null, dream: !!enc.dream,
    });
    this.bgName = enc.bg ? 'bg-battle-' + enc.bg : null;
    if (enc.backdrop) this.bgName = enc.backdrop;
    this.music = enc.music || (enc.boss ? 'm-boss' : battleMusic(encId, enc));
  }
  enter() {
    this.prevMusic = audio.currentMusic();
    audio.music(this.music, 0.6); audio.sfx('battle-start');
    // preload the backdrop and the battle sprites; run() holds the fade-in until they are here (or 2.5 s pass),
    // so a new backdrop never opens as the flat fallback gradient with the painting popping in later
    const names = [...this.sim.party, ...this.sim.reserves, ...this.sim.enemies].flatMap(u => [u.sprite, u.sprite + '-act']);
    const waits = names.filter(n => has('battle', n)).map(n => imageReady(spritePath('battle', n)));
    if (this.bgName && has('bg', this.bgName)) waits.push(imageReady(`assets/bg/${this.bgName}.png`));
    this.ready = Promise.race([Promise.all(waits), sleep(2.5)]);
    this.run().catch(e => { console.error(e); this.finish('win'); });
  }

  // ---------- the main flow
  async run() {
    const intro = this.enc.intro;
    await this.ready;
    await this.fadeTo(0, 0.35);
    if (intro) for (const l of intro) await this.say(l, 1.8);
    const sim = this.sim;
    while (!sim.result) {
      await this.play(sim.startRound());
      if (sim.result) break;
      let u;
      while (!sim.result && (u = sim.nextActor())) {
        this.active = u.uid;
        if (u.side === 'party') {
          let cmd;
          if (u.statuses.asleep || u.statuses.stun) cmd = { k: 'tussle' };
          else cmd = await this.askCommand(u);
          this.menu = null;
          if (cmd.k === 'swap') { this.swapIn = cmd.reserve.uid; }
          if (cmd.k === 'story') { await this.play(sim.useSkill(u, 'tell-a-story', cmd.memory)); sim.after([]); }
          else await this.play(sim.act(u, cmd));
        } else {
          await sleep(0.15);
          await this.play(sim.enemyAct(u));
        }
        this.active = null;
      }
    }
    await this.end(sim.result);
  }
  fadeTo(a, secs) { return new Promise(async r => { const from = this.fadeA, t0 = G.time; while (G.time - t0 < secs) { this.fadeA = from + (a - from) * (G.time - t0) / secs; await sleep(0); } this.fadeA = a; r(); }); }
  async say(text, secs = 1.4, who) {
    this.banner = { text, who, t: secs };
    const t0 = G.time; while (G.time - t0 < secs && !(input.act() && G.time - t0 > 0.25)) await sleep(0);
    this.banner = null;
  }

  // ---------- command input
  askCommand(u) {
    return new Promise(res => {
      const dream = !!this.enc.dream;
      const cmds = ['Tussle', 'Skill', 'Item', 'Guard', 'Swap', 'Flee'];
      if (dream) cmds.splice(0, 0, 'Tell a Story');
      this.menu = { u, res, cmds, sel: 0, mode: 'cmd', list: null, lsel: 0, tsel: 0 };
    });
  }
  menuDisabled(name, u) {
    const sim = this.sim;
    if (name === 'Flee') return sim.o.flee === 'never';
    if (name === 'Swap') return !sim.reserves.some(r => !r.ko) || this.enc.noSwap;
    if (name === 'Item') return !Object.keys(sim.items).some(k => sim.items[k] > 0 && ITEMS[k]);
    if (name === 'Tell a Story') return sim.storyUsedRound === sim.round || !this.availableMemories().length;
    return false;
  }
  availableMemories() {
    const used = this.usedMem || (this.usedMem = new Set());
    const left = (G.s.memories || []).filter(m => !used.has(m) && G.data.memories[m]);
    // NG+: the Eye's bar is in eighths and can outlast the memories told; then any memory may be told again
    if (!left.length && this.sim.ng2 && this.sim.ng2.story && this.sim.enemies.some(e => e.bar === 'dream' && !e.ko)) { used.clear(); return (G.s.memories || []).filter(m => G.data.memories[m]); }
    return left;
  }
  update(dt) {
    const m = this.menu; if (!m) { if (this.phase === 'results' && (input.act() || input.click()) && this.resultsReady) this.resultsDone(); return; }
    const u = m.u;
    if (m.mode === 'cmd') {
      // the commands are drawn as a 2-column grid (drawMenu): arrows move within it (up/down a row, left/right a column)
      const n = m.cmds.length, rows = Math.ceil(n / 2);
      let r = Math.floor(m.sel / 2), col = m.sel % 2, moved = false;
      if (input.up()) { r = (r + rows - 1) % rows; moved = true; }
      if (input.down()) { r = (r + 1) % rows; moved = true; }
      if (input.left() || input.right()) { col = 1 - col; moved = true; }
      if (moved) { let i = r * 2 + col; if (i >= n) i = r * 2; m.sel = i; audio.synth('move'); }
      if (input.act()) this.pickCmd(m.cmds[m.sel]);
    } else if (m.mode === 'list') {
      const n = m.list.length;
      if (input.up()) { m.lsel = (m.lsel + n - 1) % n; audio.synth('move'); }
      if (input.down()) { m.lsel = (m.lsel + 1) % n; audio.synth('move'); }
      if (input.back()) { m.mode = 'cmd'; audio.synth('cancel'); return; }
      if (input.act()) this.pickListItem(m.list[m.lsel]);
    } else if (m.mode === 'target') {
      const ts = m.targets;
      if (input.left() || input.up()) { m.tsel = (m.tsel + ts.length - 1) % ts.length; audio.synth('move'); }
      if (input.right() || input.down()) { m.tsel = (m.tsel + 1) % ts.length; audio.synth('move'); }
      if (input.back()) { m.mode = m.back || 'cmd'; audio.synth('cancel'); return; }
      if (input.act()) { audio.synth('confirm'); m.res({ ...m.pending, target: ts[m.tsel].uid }); }
    }
    if (input.back() && m.mode === 'cmd') audio.synth('cancel');
  }
  pickCmd(name) {
    const m = this.menu, u = m.u; if (this.menuDisabled(name, u)) { audio.synth('cancel'); return; }
    audio.synth('confirm');
    if (name === 'Tussle') return this.chooseTarget({ k: 'tussle' }, 'enemy', 'cmd');
    if (name === 'Guard') return m.res({ k: 'guard' });
    if (name === 'Flee') return m.res({ k: 'flee' });
    if (name === 'Skill') { m.mode = 'list'; m.lsel = 0; m.list = u.skills.map(id => ({ kind: 'skill', id, name: SKILLS[id].name, cost: SKILLS[id].pl, d: SKILLS[id].d, off: SKILLS[id].pl > u.pl })); return; }
    if (name === 'Item') { m.mode = 'list'; m.lsel = 0; m.list = Object.keys(this.sim.items).filter(k => this.sim.items[k] > 0 && ITEMS[k]).map(id => ({ kind: 'item', id, name: ITEMS[id].name, cost: 'x' + this.sim.items[id], d: ITEMS[id].d, icon: ITEMS[id].icon })); return; }
    if (name === 'Swap') { m.mode = 'list'; m.lsel = 0; m.list = this.sim.reserves.filter(r => !r.ko).map(r => ({ kind: 'swap', r, name: r.name, cost: `${r.hp}/${r.maxHp}`, d: PARTY[r.id].role })); return; }
    if (name === 'Tell a Story') { m.mode = 'list'; m.lsel = 0; m.list = this.availableMemories().map(id => ({ kind: 'story', id, name: G.data.memories[id].title, cost: '', d: G.data.memories[id].hint || '' })); return; }
  }
  pickListItem(it) {
    const m = this.menu;
    if (it.off) { audio.synth('cancel'); return; }
    audio.synth('confirm');
    if (it.kind === 'swap') return m.res({ k: 'swap', reserve: it.r });
    if (it.kind === 'story') { this.usedMem.add(it.id); return m.res({ k: 'story', memory: it.id }); }
    if (it.kind === 'skill') {
      const S = SKILLS[it.id];
      if (S.t === 'enemy') return this.chooseTarget({ k: 'skill', skill: it.id }, 'enemy', 'list');
      if (S.t === 'ally') return this.chooseTarget({ k: 'skill', skill: it.id }, 'ally', 'list');
      if (S.t === 'ally-ko') return this.chooseTarget({ k: 'skill', skill: it.id }, 'ko', 'list');
      return m.res({ k: 'skill', skill: it.id, target: m.u.uid });
    }
    if (it.kind === 'item') {
      const x = ITEMS[it.id].use;
      if (x.healAll || x.pluckAll || x.cureAll) return m.res({ k: 'item', item: it.id, target: m.u.uid });
      if (x.foe || x.pail) return this.chooseTarget({ k: 'item', item: it.id }, 'enemy', 'list');
      if (x.revive) return this.chooseTarget({ k: 'item', item: it.id }, 'ko', 'list');
      return this.chooseTarget({ k: 'item', item: it.id }, 'ally', 'list');
    }
  }
  chooseTarget(pending, side, back) {
    const m = this.menu, sim = this.sim;
    let ts = side === 'enemy' ? sim.enemies.filter(e => sim.targetable(e)) : side === 'ko' ? sim.party.filter(p => p.ko) : sim.party.filter(p => !p.ko);
    if (!ts.length) { audio.synth('cancel'); return; }
    m.mode = 'target'; m.targets = ts; m.tsel = 0; m.pending = pending; m.back = back;
    // default target: an open eye / glowing mouth if there is one
    const pref = ts.findIndex(t => t.ms && (t.ms.glow || t.ms.eyes > 0)); if (pref >= 0) m.tsel = pref;
  }

  // ---------- event playback
  async play(events) {
    for (const e of events) await this.playOne(e);
  }
  unit(uid) { return this.sim.unit(uid); }
  posOf(u) {
    if (!u) return [320, 260];
    if (u.side === 'party') { const i = this.sim.party.indexOf(u); return PARTY_POS[Math.max(0, i)] || PARTY_POS[0]; }
    const alive = this.sim.enemies; const i = alive.indexOf(u);
    if (u.boss && this.sim.enemies.filter(e => e.boss).length === 1 && !u.minion && this.bigBoss(u)) return [500, 270];
    // beside a big boss (the Nightmares, the Choir...) the others stand in front of it, not on it, so their names stay clear
    const big = this.sim.enemies.filter(e => e.boss).length === 1 && alive.find(e => e !== u && e.boss && !e.minion && this.bigBoss(e));
    if (big) { const rest = alive.filter(e => e !== big); return BESIDE_BIG[Math.max(0, rest.indexOf(u)) % BESIDE_BIG.length]; }
    return FOE_POS[i % 4];
  }
  bigBoss(u) { const im = this.battleImg(u); return im && im.width > 100; }
  async playOne(e) {
    const U = e.u !== undefined ? this.unit(e.u) : null;
    switch (e.t) {
      case 'skill': {
        if (e.name && e.name !== 'Tussle') { this.banner = { text: e.name, t: 0.9, big: e.big }; audio.sfx(e.enemy ? 'skill-whoosh' : 'skill-whoosh', { vol: 0.5 }); }
        this.pose[e.u] = 0.6; await sleep(e.big ? 0.8 : 0.45); this.banner = null; break;
      }
      case 'hit': {
        const src = this.unit(e.u), tg = this.unit(e.tg);
        this.pose[e.u] = 0.4;
        if (src) { const dir = src.side === 'party' ? 1 : -1; this.offset[e.u] = { x: 18 * dir, t: 0.18 }; }
        await sleep(0.12);
        audio.sfx(e.crit ? 'crit' : e.splash ? 'splash-melt' : Math.random() < 0.5 ? 'hit-1' : 'hit-2', { vol: 0.8 });
        this.flashT[e.tg] = 0.12; if (tg) this.offset[e.tg] = { x: (tg.side === 'party' ? -1 : 1) * 5, t: 0.15 };
        if (e.crit) this.shake = 0.25;
        const [x, y] = this.posOf(tg);
        this.nums.push({ x, y: y - 60, text: String(e.dmg), col: e.crit ? P.gold : '#fff', t: 0, crit: e.crit });
        await sleep(0.06); // hit pause
        await sleep(0.25);
        break;
      }
      case 'heal': case 'pluck': { const u = this.unit(e.u); const [x, y] = this.posOf(u); this.nums.push({ x, y: y - 60, text: '+' + e.amt, col: e.t === 'heal' ? '#8de08a' : '#8ac8f0', t: 0 }); audio.sfx('heal', { vol: 1 }); this.sparkle(u, '#bff0b0'); await sleep(0.35); break; }
      case 'guard': { const u = this.unit(e.u); this.textAt(u, 'Guard', '#cfd8e8'); audio.sfx('guard', { vol: 0.6 }); await sleep(0.35); break; }
      case 'buff': { const u = this.unit(e.u); this.textAt(u, { str: 'Strength up', tgh: 'Toughness up', spd: 'Speed up', dodge: 'Dodge up', shielded: 'Shielded', taunt: 'On guard!', hidden: 'Hidden', 'hidden-strike': 'Hiding...', cover: 'Covering', 'cover-bramble': 'Covering Bramble', first: 'Ready!', reveal: 'Found them!' }[e.b] || 'Up!', '#f0d880'); audio.sfx('buff', { vol: 0.6 }); await sleep(0.3); break; }
      case 'status': { const u = this.unit(e.u); this.textAt(u, STATUS_NAME[e.s] || e.s, '#e0a0f0'); if (e.s === 'afraid') audio.synth('shiver'); if (e.s === 'shrunk' || e.s === 'grown') audio.sfx('swanee', { vol: 0.5 }); await sleep(0.3); break; }
      case 'cure': { const u = this.unit(e.u); this.textAt(u, 'Cured', '#c0f0c0'); await sleep(0.25); break; }
      case 'resist': { const u = this.unit(e.u); this.textAt(u, 'No effect', '#cccccc'); await sleep(0.25); break; }
      case 'miss': case 'dodge': { const u = this.unit(e.u); this.textAt(u, 'Miss', '#cccccc'); audio.sfx('skill-whoosh', { vol: 0.3, pitch: 1.4 }); await sleep(0.3); break; }
      case 'sleeping': { this.textAt(U, 'Zzz...', '#cfd8e8'); await sleep(0.45); break; }
      case 'stunned': { this.textAt(U, 'Stunned!', '#f0d880'); await sleep(0.45); break; }
      case 'wakeup': { this.textAt(U, 'Awake!', '#f0d880'); await sleep(0.2); break; }
      case 'confused': { this.textAt(U, 'Hummed...', '#bfe3f0'); await sleep(0.35); break; }
      case 'nopl': { this.textAt(U, 'Not enough Pluck', '#cccccc'); await sleep(0.4); break; }
      case 'ko': await this.koAnim(U, e.bar); break;
      case 'revive': { this.textAt(U, 'Up you get!', '#f0d880'); audio.sfx('heal'); await sleep(0.4); break; }
      case 'summon': { for (const id of e.us) { const u = this.unit(id); this.alpha[id] = 0; this.fadeInUnit(id); } if (e.say) await this.say(e.say, 1.4); else await sleep(0.5); break; }
      case 'say': await this.say(e.text, 1.6); break;
      case 'charge': { const u = this.unit(e.u); this.chargeFx = { u: e.u, t: 1 }; await this.say(e.text, 1.6); break; }
      case 'glow': { await sleep(0.2); break; }
      case 'eye-open': { audio.synth('creak'); await sleep(0.25); break; }
      case 'eye-close': { this.textAt(U, e.eyes === 0 ? 'All eyes shut' : 'An eye shuts', '#cfd8e8'); await sleep(0.25); break; }
      case 'pulled': { this.textAt(U, 'Pulled into the dark!', '#a0a0f0'); audio.synth('shiver'); await sleep(0.6); break; }
      case 'return': { this.textAt(U, 'Back!', '#f0d880'); await sleep(0.3); break; }
      case 'steal': { await this.say(`The Knave pinches a ${ITEMS[e.item].name}!`, 1.4); break; }
      case 'found': { await this.say(`Pip found a ${ITEMS[e.item].name}!`, 1.2); audio.synth('twinkle'); break; }
      case 'cover': { this.textAt(U, 'Takes the hit!', '#f0d880'); break; }
      case 'swap': { audio.sfx('scamper'); this.alpha[e.in] = 0; this.fadeInUnit(e.in); await sleep(0.4); break; }
      case 'flee': { audio.sfx('scamper'); await this.say(e.ok ? 'Got away!' : 'Couldn\'t get away!', 1.0); break; }
      case 'story': await this.storyVignette(e.memory, U); break;
      case 'phase': {   // NG+: a boss's second phase begins
        audio.sfx(e.sfx || 'alert-horn', { vol: 0.9 }); this.shake = 0.5; this.phase2At = this.t;
        for (const l of e.lines || []) await this.say(l, 2.0);
        break;
      }
    }
  }
  fadeInUnit(id) { const step = () => { this.alpha[id] = Math.min(1, (this.alpha[id] || 0) + 0.08); if (this.alpha[id] < 1) setTimeout(step, 16); }; step(); }
  textAt(u, text, col, dy = -70) { if (!u) return; const [x, y] = this.posOf(u); this.nums.push({ x, y: y + dy, text, col, t: 0, small: true }); }
  sparkle(u, col) { const [x, y] = this.posOf(u); for (let i = 0; i < 8; i++) this.fx.push({ k: 'spark', x: x + (Math.random() - 0.5) * 30, y: y - Math.random() * 50, vy: -20 - Math.random() * 20, t: 0, life: 0.7, col }); }
  async koAnim(u, barKind) {
    if (!u) return;
    // above the damage number that knocked them out (it rises from y - 60 through y - 82), so the two never cross
    if (u.side === 'party') { this.textAt(u, 'Resting', '#cccccc', -104); audio.sfx('fade-sigh', { vol: 0.5 }); await sleep(0.4); return; }
    const [x, y] = this.posOf(u);
    if (barKind === 'hum') {
      // waking: the Hum shatters into glitter, the eyes go brown, a "?" then a heart
      audio.sfx('wake-chime', { vol: 1 });
      for (let i = 0; i < 18; i++) this.fx.push({ k: 'spark', x: x + (Math.random() - 0.5) * 40, y: y - 40 + (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 40, vx: (Math.random() - 0.5) * 60, t: 0, life: 0.9, col: '#bfe3f0' });
      this.woken[u.uid] = 1; await sleep(0.35);
      this.emote = { u: u.uid, e: '?', t: 0.7 }; await sleep(0.7);
      this.emote = { u: u.uid, e: 'heart', t: 0.7 }; await sleep(0.6);
      this.gone(u.uid, 'sit');
    } else if (barKind === 'shadow' || barKind === 'dream') {
      audio.sfx('fade-sigh', { vol: 0.8 });
      for (let i = 0; i < 14; i++) this.fx.push({ k: 'mote', x: x + (Math.random() - 0.5) * 40, y: y - Math.random() * 60, vy: -15 - Math.random() * 25, t: 0, life: 1.4, col: '#a0b0f0' });
      this.gone(u.uid, 'fade'); await sleep(0.6);
    } else if (u.id === 'wicked-witch') {
      audio.sfx('splash-melt'); this.gone(u.uid, 'melt'); await this.say('"I\'m melting! Melting! Oh, what a world!"', 2.2);
    } else {
      // sent packing: a hop and away
      audio.sfx('scamper', { vol: 0.7 });
      this.gone(u.uid, 'run'); await sleep(0.5);
    }
  }
  gone(uid, how) { this.leaving = this.leaving || {}; this.leaving[uid] = { how, t: 0 }; }
  async storyVignette(memId, teller) {
    const M = G.data.memories[memId]; if (!M) return;
    audio.sfx('shimmer', { vol: 1 });
    this.vignette = { M, t: 0 };
    const t0 = G.time; while (G.time - t0 < 4.2 && !(input.act() && G.time - t0 > 1.2)) { this.vignette.t = G.time - t0; await sleep(0); }
    this.vignette = null;
  }

  // ---------- end of battle
  async end(result) {
    const sim = this.sim;
    // write back Heart and Pluck
    const all = [...sim.party, ...sim.reserves];
    for (const u of all) { const m = st.member(u.id); if (!m) continue; m.hp = u.ko ? 1 : u.hp; m.pl = u.pl; if (u.side === 'party') m.hp = Math.min(m.hp, st.maxHp(u.id)); }
    // items used or stolen
    for (const k of Object.keys(G.s.items)) { const left = sim.items[k] || 0; if (left <= 0) delete G.s.items[k]; else G.s.items[k] = left; }
    for (const k of Object.keys(sim.items)) if (sim.items[k] > 0 && ITEMS[k]) G.s.items[k] = sim.items[k];
    if (result === 'win') {
      await sleep(0.3);
      audio.music(null, 0.3); audio.sfx('victory');
      const xp = sim.enemies.reduce((a, e) => a + (e.xp || 0), 0) + (this.enc.xp || 0);
      const btn = sim.enemies.reduce((a, e) => a + (e.drops || 0), 0) + (this.enc.buttons || 0);
      G.s.buttons += btn;
      const xw = sim.enemies.reduce((a, e) => a + (e.xp || 0), 0), foeLvl = xw ? sim.enemies.reduce((a, e) => a + (e.xp || 0) * e.lvl, 0) / xw : undefined;
      const bl = st.member('bramble') ? st.member('bramble').lvl : 0;   // the XP shown is Bramble's (catch-up: state.js xpCatchUp)
      const shown = foeLvl !== undefined && bl ? Math.round(xp * st.xpCatchUp(foeLvl - bl)) : xp;
      const ups = st.giveXp(xp, foeLvl);
      st.restorePluck(0.3);
      this.results = { xp: shown, btn, ups };
      for (const up of ups) { const u = sim.party.find(p => p.id === up.id); if (u) u.lvl = up.lvl; }   // the status panel shows the new level too
      this.phase = 'results'; this.resultsReady = false;
      if (ups.length) setTimeout(() => audio.sfx('level-up'), 600);
      setTimeout(() => { this.resultsReady = true; }, 500);
      await new Promise(r => { this.resultsDone = r; });
    } else if (result === 'lose') {
      // for the defeat card (screens/picture.js DefeatCard, shown by world/script.js upYouGet): this backdrop, and a friend to say it
      const friend = sim.party.map(u => u.id).find(id => id !== 'bramble') || 'bramble';
      G.lastDefeat = { bg: this.bgName && has('bg', this.bgName) ? this.bgName : null, who: friend };
      await this.fadeTo(1, 0.8);
    } else if (result === 'fled') {
      await this.fadeTo(1, 0.3);
    }
    if (result !== 'lose') await this.fadeTo(1, 0.3);
    popScene(this);
    if (this.prevMusic && result !== 'lose') audio.music(this.prevMusic, 0.8);
    this.done(result);
  }
  finish(r) { popScene(this); this.done(r); }

  // ---------- drawing
  battleImg(u, act) {
    let name = u.sprite;
    let img = null;
    if (act) {
      if (u.id === 'bramble') { const th = anim('battle', 'anim-bramble-thump'); if (th) img = frameOf(th, Math.min(th.n - 1, 2)); }
      if (!img) img = sprite('battle', name + '-act');
    }
    if (!img && u.id === 'wicked-witch' && this.leaving && this.leaving[u.uid]) { const m = anim('battle', 'anim-witch-melt'); if (m) img = frameOf(m, Math.min(m.n - 1, Math.floor(this.leaving[u.uid].t / 0.3))); }
    if (!img && u.sprite === 'lantern-moth') { const m = anim('battle', 'anim-moth-flutter'); if (m) img = frameOf(m, Math.floor(this.t * 8) % m.n); }
    if (!img) img = sprite('battle', name);
    if (!img && u.id === 'bramble') img = sprite('battle', 'bramble-se');
    if (!img) img = sprite('map', name);
    if (!img) img = placeholder(48, 56, u.side === 'party' ? '#a08060' : '#8a5a6a');
    if (u.look === 'hollow') img = silhouette(img, '#3a3a7a', 0.72);
    if (u.look === 'dream') img = silhouette(img, '#6a4a8a', 0.8);
    if (u.hum && !this.woken[u.uid]) img = humEyes(img);
    if (u.side === 'enemy' && u.tier === 1) img = tint(img, '#e0a040', 0.18);
    if (u.side === 'enemy' && u.tier === 2) img = tint(img, '#f0e0a0', 0.25);
    if (u.side === 'enemy') img = flipped(img);
    return img;
  }
  tick(dt) {
    this.t += dt;
    for (const k in this.pose) { this.pose[k] -= dt; if (this.pose[k] <= 0) delete this.pose[k]; }
    for (const k in this.flashT) { this.flashT[k] -= dt; if (this.flashT[k] <= 0) delete this.flashT[k]; }
    for (const k in this.offset) { const o = this.offset[k]; o.t -= dt; if (o.t <= 0) delete this.offset[k]; }
    for (const f of this.fx) { f.t += dt; f.y += (f.vy || 0) * dt; f.x += (f.vx || 0) * dt; } this.fx = this.fx.filter(f => f.t < f.life);
    for (const n of this.nums) n.t += dt; this.nums = this.nums.filter(n => n.t < 1.0);
    if (this.leaving) for (const k in this.leaving) this.leaving[k].t += dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.emote) { this.emote.t -= dt; if (this.emote.t <= 0) this.emote = null; }
    if (this.chargeFx) { this.chargeFx.t -= dt; if (this.chargeFx.t <= 0) this.chargeFx = null; }
  }
  draw(c) {
    const sx = this.shake > 0 ? Math.round((Math.random() - 0.5) * 6) : 0, sy = this.shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
    c.save(); c.translate(sx, sy);
    const b = this.bgName && bgImg(this.bgName);
    if (b) c.drawImage(b, 0, 0); else { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4a5a7a'); g.addColorStop(1, '#2a3a2a'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    c.fillStyle = 'rgba(60,50,70,0.15)'; c.fillRect(0, 0, W, H);
    // the Watcher's eyes, the Choir's glow, the Tidewarden's eyes
    // units
    const sim = this.sim;
    const drawUnit = (u) => {
      if (u.out) return;
      const lv = this.leaving && this.leaving[u.uid];
      if (lv && lv.how === 'fade' && lv.t > 0.8) return;
      const [x0, y0] = this.posOf(u);
      let x = x0, y = y0;
      const o = this.offset[u.uid]; if (o) x += o.x * Math.min(1, o.t / 0.1);
      const act = this.pose[u.uid] > 0 || (this.menu && this.menu.u === u && false);
      let img = this.battleImg(u, act);
      if (u.ms && u.ms.submerged) return;
      let alpha = this.alpha[u.uid] === undefined ? 1 : this.alpha[u.uid];
      if (lv) { if (lv.how === 'fade') alpha *= Math.max(0, 1 - lv.t / 0.8); if (lv.how === 'run') { x += lv.t * 500; y -= Math.sin(Math.min(1, lv.t * 4) * Math.PI) * 10; if (x > W + 60) return; } }
      if (u.ko && u.side === 'party') alpha *= 0.45;
      if (u.buffs.hidden || u.buffs['hidden-strike']) alpha *= 0.35;
      const bob = u.ko ? 0 : Math.round(Math.sin(this.t * 2.5 + u.uid) * 1);
      c.globalAlpha = alpha;
      c.fillStyle = 'rgba(20,15,25,0.3)'; c.fillRect(Math.round(x - img.width * 0.3), y - 1, Math.round(img.width * 0.6), 3);
      const ix = Math.round(x - img.width / 2), iy = Math.round(y - img.height + 2 - bob + (u.ko && u.side === 'party' ? 6 : 0));
      c.drawImage(img, ix, iy);
      if (this.flashT[u.uid]) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.7; c.drawImage(img, ix, iy); c.globalCompositeOperation = 'source-over'; }
      c.globalAlpha = 1;
      u._box = { x: ix, y: iy, w: img.width, h: img.height };
      // mechanic overlays
      if (u.mech === 'watcher') { for (let i = 0; i < 7; i++) { const ex = ix + img.width / 2 + Math.round(Math.sin(i * 2.1) * 14), ey = iy + 24 + i * 22; const open = i < (u.ms.eyes || 0); c.fillStyle = open ? '#f4f0e0' : '#3a3a5a'; c.fillRect(ex - 4, ey - 1, 8, open ? 4 : 1); if (open) { c.fillStyle = '#2a1c14'; c.fillRect(ex - 1, ey, 2, 2); } } }
      // NG+ second phase: the boss pulses with a warm glow (the Choir's glow pattern)
      if (sim.phase2 && u.boss && !u.ko && !lv) { c.globalAlpha = 0.26 + 0.14 * Math.sin(this.t * 4); c.fillStyle = '#f08a50'; c.fillRect(ix + 6, iy + 6, img.width - 12, img.height - 12); c.globalAlpha = 1; }
      if (u.mech === 'choir' && u.ms.glow && !u.ko) { c.globalAlpha = 0.35 + 0.25 * Math.sin(this.t * 6); c.fillStyle = '#7ad0d0'; c.fillRect(ix + 4, iy + 4, img.width - 8, img.height - 8); c.globalAlpha = 1; }
      if (this.chargeFx && this.chargeFx.u === u.uid) { c.globalAlpha = 0.5; c.fillStyle = '#e05a40'; c.fillRect(ix, iy - 4, img.width, 2); c.globalAlpha = 1; }
      // enemy bar and name, where layoutLabels put them (clear of the other labels and sprites)
      if (u.side === 'enemy' && !u.ko && !lv) {
        const L = labels.get(u.uid) || { cx: x, top: iy - 19, text: this.labelText(u), bw: 40 };
        const bx = Math.round(L.cx - L.bw / 2), by = L.top + 11;
        const col = u.bar === 'hum' ? '#bfe3f0' : u.bar === 'shadow' ? '#8a7ad0' : u.bar === 'dream' ? '#d0a0e0' : P.heart;
        bar(c, bx, by, L.bw, 3, u.hp / u.maxHp, col);
        ui.text(L.text, L.cx, by - 3, { align: 'center', size: 8, alpha: clamp(1 - this.fadeA, 0, 1) });   // fades in with the scene
        this.drawStatuses(c, u, bx, by + 5);
      }
    };
    const labels = this.layoutLabels();
    // back to front
    const order = [...sim.enemies, ...sim.party].sort((a, b) => this.posOf(a)[1] - this.posOf(b)[1]);
    for (const u of order) drawUnit(u);
    // emote over a woken rabbit
    if (this.emote) { const u = this.unit(this.emote.u); if (u && u._box) { const ex = u._box.x + u._box.w / 2, ey = u._box.y - 12; c.fillStyle = P.chalk; c.fillRect(ex - 6, ey - 7, 13, 12); if (this.emote.e === 'heart') { c.fillStyle = '#d9604a'; c.fillRect(ex - 3, ey - 4, 2, 2); c.fillRect(ex + 1, ey - 4, 2, 2); c.fillRect(ex - 3, ey - 3, 6, 2); c.fillRect(ex - 2, ey - 1, 4, 1); } else ui.text('?', ex + 0.5, ey + 2.5, { align: 'center', size: 9, color: P.bark, shadow: false }); } }
    // fx
    for (const f of this.fx) { c.globalAlpha = 1 - f.t / f.life; c.fillStyle = f.col || '#fff'; c.fillRect(Math.round(f.x), Math.round(f.y), 2, 2); } c.globalAlpha = 1;
    // numbers
    for (const n of this.nums) { const k = n.t; ui.text(n.text, n.x, n.y - k * 22 + (n.small ? 0 : Math.sin(k * 3) * 0), { align: 'center', size: n.small ? 9 : n.crit ? 16 : 13, color: n.col, alpha: k < 0.7 ? 1 : (1 - k) / 0.3 }); }
    // targeting cursor
    const m = this.menu;
    if (m && m.mode === 'target') {
      m.targets.forEach((t, i) => {
        const bx = t._box; if (!bx) return;
        if (G.drawingTop) hits.add('target:' + t.name + '#' + t.uid, bx.x, bx.y, bx.w, bx.h);
        if (mouseIn(bx.x, bx.y, bx.w, bx.h)) { if (input.mouse.moved) m.tsel = i; if (input.click()) { input.mouse.pressed[0] = false; m.tsel = i; audio.synth('confirm'); m.res({ ...m.pending, target: t.uid }); } }
      });
      const t = m.targets[m.tsel]; if (t && t._box) { const k = Math.floor(this.t * 4) % 2; c.fillStyle = P.gold; const ax = t._box.x + t._box.w / 2; const ay = t._box.y - (t.side === 'enemy' ? 28 : 18) - k; c.fillRect(ax - 3, ay, 7, 2); c.fillRect(ax - 2, ay + 2, 5, 2); c.fillRect(ax - 1, ay + 4, 3, 2); }
    }
    c.restore();
    this.drawTurnBar(c);
    this.drawPanel(c);
    if (this.banner) {
      const w = Math.min(560, ui.measure(this.banner.text, this.banner.big ? 13 : 11) + 30);
      panel(c, (W - w) / 2, 34, w, this.banner.big ? 26 : 22);
      ui.text(this.banner.text, W / 2, this.banner.big ? 52 : 49, { align: 'center', size: this.banner.big ? 13 : 11, color: this.banner.big ? '#ffd8a0' : P.chalk });
    }
    if (this.vignette) this.drawVignette(c);
    if (this.phase === 'results') this.drawResults(c);
    fade(c, this.fadeA);
  }
  // "(Hum)" only when the name doesn't already say so ("Hum-taken Raider" does)
  labelText(u) { return u.name + (u.bar === 'hum' && !/hum/i.test(u.name) ? ' (Hum)' : u.bar === 'dream' && !/dream/i.test(u.name) ? ' (Dreaming)' : ''); }
  // Place each enemy's name + bar above its head; if that would cross another label or another unit's sprite,
  // try nearby spots (sideways, then higher) and take the first clear one (or the least crowded).
  layoutLabels() {
    const sim = this.sim, out = new Map(), boxes = [];
    const units = [...sim.enemies, ...sim.party].filter(u => !u.out && !(u.ms && u.ms.submerged));
    for (const u of units) {
      const img = this.battleImg(u), [x, y] = this.posOf(u);
      // sprites have see-through margins: test against the body, not the whole image
      boxes.push({ uid: u.uid, x: x - img.width * 0.42, y: y - img.height * 0.92, w: img.width * 0.84, h: img.height * 0.92, img });
    }
    const placed = [];
    const hit = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));   // overlap area
    const cands = [];
    for (const dy of [0, -9, -18, -27, -36, -45]) for (const dx of [0, -16, 16, -32, 32, -48, 48, -64, 64, -80, 80]) cands.push([dx, dy]);
    cands.sort((a, b) => Math.abs(a[0]) + 1.6 * Math.abs(a[1]) - Math.abs(b[0]) - 1.6 * Math.abs(b[1]));
    const enemies = sim.enemies.filter(u => !u.out && !u.ko && !(this.leaving && this.leaving[u.uid]) && !(u.ms && u.ms.submerged))
      .sort((a, b) => this.posOf(a)[1] - this.posOf(b)[1]);
    for (const u of enemies) {
      const own = boxes.find(b => b.uid === u.uid), img = own.img, [x, y] = this.posOf(u);
      const text = this.labelText(u), bw = Math.round(Math.min(60, Math.max(36, img.width * 0.7)));
      const w = Math.max(bw, ui.measure(text, 8)) + 4, iy = Math.round(y - img.height + 2);
      let best = null, bestScore = Infinity;
      for (const [dx, dy] of cands) {
        const cx = clamp(x + dx, 4 + w / 2, W - 4 - w / 2), top = Math.max(34, iy - 19 + dy);
        const r = { x: cx - w / 2 - 2, y: top, w: w + 4, h: 16 };
        let score = 0;
        for (const p of placed) score += hit(r, p) * 20;   // labels must never touch: weigh them far above sprites
        for (const b of boxes) if (b.uid !== u.uid) score += hit(r, b);
        score += (Math.abs(cx - x) + Math.abs(top - (iy - 19))) * 0.5;   // and stay near their own rabbit
        if (score < bestScore) { best = { cx: Math.round(cx), top: Math.round(top), text, bw, r }; bestScore = score; }
        if (score === (Math.abs(cx - x) + Math.abs(top - (iy - 19))) * 0.5) break;   // nothing crossed: the nearest clear spot
      }
      placed.push(best.r); out.set(u.uid, best);
    }
    return out;
  }
  drawStatuses(c, u, x, y) {
    let i = 0;
    for (const s of Object.keys(u.statuses)) { drawIcon(c, STATUS_ICON[s] || 'ico-stunned', x + i * 13, y, 16); i++; }
    if (u.buffs.shielded) { drawIcon(c, 'ico-shielded', x + i * 13, y, 16); i++; }
  }
  // the turn bar's counter: the encounter's own, and in NG+ the second phase's (e.g. "Pestle glow: 2/3")
  counterText() {
    const sim = this.sim, a = this.enc.counter ? this.enc.counter(sim) : null;
    const d = sim.ng2, b = d && d.counter && (sim.phase2 || d.counterAlways) && !sim.result ? d.counter(sim) : null;
    return [a, b].filter(Boolean).join('  ·  ') || null;
  }
  drawTurnBar(c) {
    const sim = this.sim; const ids = [this.active, ...sim.order].filter(Boolean).slice(0, 9);
    if (!ids.length) return;
    const w = ids.length * 22 + 8, x0 = (W - w) / 2;
    // one dark strip behind the round, the portraits and any counter, so the words stay readable on bright backdrops
    const rw = ui.measure('Round ' + sim.round, 9) + 12, txt = this.counterText(), cw = txt ? ui.measure(txt, 9) + 12 : 0;
    c.fillStyle = 'rgba(18,14,24,0.7)'; c.fillRect(Math.round(x0 - rw), 4, Math.round(w + rw + cw), 26);
    ui.text('Round ' + sim.round, x0 - 6, 21, { align: 'right', size: 9, color: '#d8ccb0' });
    if (txt) ui.text(txt, x0 + w + 6, 21, { size: 9, color: '#ffd8a0' });
    ids.forEach((uid, i) => {
      const u = this.unit(uid); if (!u) return;
      const x = x0 + 4 + i * 22, y = 6;
      c.fillStyle = u.side === 'party' ? '#5a7a4a' : '#7a3a3a'; c.fillRect(x, y, 20, 22);
      if (u.side === 'party') drawFace(c, u.id, x + 1, y + 1, 18);
      else { const img = this.battleImg(u); const k = Math.min(18 / img.width, 20 / img.height); c.drawImage(img, x + 1, y + 1, Math.max(1, Math.round(img.width * k)), Math.max(1, Math.round(img.height * k))); }
      if (i === 0) { c.fillStyle = P.gold; c.fillRect(x, y + 22, 20, 2); }
    });
  }
  drawPanel(c) {
    const sim = this.sim, y0 = H - 66;
    panel(c, 4, y0, W - 8, 62);
    // party status (right)
    sim.party.forEach((u, i) => {
      const x = 236 + i * 134, y = y0 + 6;
      const act = this.active === u.uid;
      if (act) { c.fillStyle = 'rgba(232,201,90,0.15)'; c.fillRect(x - 3, y - 2, 130, 54); }
      drawFace(c, u.id, x, y, 24);
      ui.text(u.name, x + 29, y + 9, { size: 9, color: act ? P.gold : P.chalk });
      ui.text('Lv ' + u.lvl, x + 126, y + 9, { size: 8, align: 'right', color: '#b8acc8' });
      bar(c, x + 29, y + 14, 96, 4, u.hp / u.maxHp, P.heart);
      ui.text(`${u.hp}/${u.maxHp}`, x + 126, y + 26, { size: 8, align: 'right' });
      bar(c, x + 29, y + 30, 96, 3, u.pl / u.maxPl, P.pluck);
      ui.text(`${u.pl}`, x + 126, y + 41, { size: 8, align: 'right', color: '#a8d0f0' });
      // a resting friend shows just "Resting" (their status icons used to sit on top of it: "Re?ting")
      if (u.ko) ui.text('Resting', x + 29, y + 48, { size: 8, color: '#b0a0a0' });
      else {
        let k = 0; for (const s of Object.keys(u.statuses)) { drawIcon(c, STATUS_ICON[s] || 'ico-stunned', x + 29 + k * 13, y + 36, 16); k++; }
        if (u.buffs.shielded) drawIcon(c, 'ico-shielded', x + 29 + k * 13, y + 36, 16);
      }
    });
    // commands (left)
    const m = this.menu;
    if (!m) return;
    if (m.mode === 'cmd' || m.mode === 'target' && m.back === 'cmd') {
      const cols = 2, rows = Math.ceil(m.cmds.length / cols);
      m.cmds.forEach((name, i) => {
        const cx = 12 + (i % cols) * 108, cy = y0 + 6 + Math.floor(i / cols) * (rows > 3 ? 13 : 17);
        const dis = this.menuDisabled(name, m.u);
        if (button(c, name, cx, cy, 104, rows > 3 ? 12 : 16, { sel: m.mode === 'cmd' && i === m.sel, disabled: dis, size: 9 }) && m.mode === 'cmd') { m.sel = i; this.pickCmd(name); }
      });
    } else if (m.mode === 'list' || m.mode === 'target') {
      const list = m.list || []; const per = 4; const start = clamp(m.lsel - per + 1, 0, Math.max(0, list.length - per));
      list.slice(start, start + per).forEach((it, j) => {
        // four 11 px rows, then a footer line (hint, "1-4 of 5", Back) that never overlaps them
        const i = start + j, cy = y0 + 4 + j * 11, sel = i === m.lsel;
        if (G.drawingTop) hits.add(it.name, 10, cy, 216, 11);
        if (mouseIn(10, cy, 216, 11)) { if (input.mouse.moved) m.lsel = i; if (input.click() && m.mode === 'list') { input.mouse.pressed[0] = false; m.lsel = i; this.pickListItem(it); } }
        if (sel) { c.fillStyle = 'rgba(232,201,90,0.18)'; c.fillRect(10, cy, 216, 11); }
        // no icons here: the 24 px item icons don't fit 11 px rows (the camp and shops show them)
        ui.text(it.name, 14, cy + 8.5, { size: 9, color: it.off ? '#7a7084' : sel ? P.gold : P.chalk });
        ui.text(String(it.cost), 222, cy + 8.5, { size: 9, align: 'right', color: it.kind === 'skill' ? '#a8d0f0' : '#d8ccb0' });
      });
      if (list.length > per) ui.text(`${start + 1}-${Math.min(list.length, start + per)} of ${list.length}`, 104, y0 + 58, { size: 8, color: '#8a7e9a' });
      const cur = list[m.lsel];
      if (cur && cur.d) { c.fillStyle = 'rgba(18,14,24,0.85)'; const lines = ui.wrap(cur.d, 300, 9); const w = 316; c.fillRect(8, y0 - 6 - lines.length * 11 - 4, w, lines.length * 11 + 6); lines.forEach((l, i) => ui.text(l, 14, y0 - 6 - lines.length * 11 + 6 + i * 11, { size: 9, color: '#e8dcc0' })); }
      if (m.mode === 'target') ui.text('Choose a target', 14, y0 + 58, { size: 8, color: '#b8acc8' });
      else ui.text('Esc: back', 14, y0 + 58, { size: 8, color: '#b8acc8' });
      if (m.mode === 'list' && button(c, 'Back', 172, y0 + 49, 54, 11, { size: 8, hitLabel: 'Back' })) { m.mode = 'cmd'; }
    }
  }
  drawVignette(c) {
    const v = this.vignette, M = v.M, k = Math.min(1, v.t / 0.6);
    const b = bgImg('bg-battle-' + M.bg) || bgImg(M.bg);
    c.globalAlpha = k; if (b) c.drawImage(b, 0, 0); else { c.fillStyle = '#2a2236'; c.fillRect(0, 0, W, H); }
    c.fillStyle = 'rgba(255,240,220,0.12)'; c.fillRect(0, 0, W, H);
    c.globalAlpha = 1;
    panel(c, 60, 210, W - 120, 92, { fill: 'rgba(43,34,54,0.92)' });
    const fr = M.friend || 'bramble';
    c.globalAlpha = k; import('../engine/gfx.js').then(() => {});
    drawPortraitSmall(c, fr, 70, 220);
    c.globalAlpha = 1;
    const lines = ui.wrap(M.line, 400, 10);
    lines.forEach((l, i) => ui.text(l, 152, 236 + i * 13, { size: 10, alpha: k }));
    if (v.t > 2) ui.text(M.eye || 'The Eye listens. The dream grows a little kinder.', 152, 236 + lines.length * 13 + 10, { size: 10, color: '#d0a0e0', alpha: Math.min(1, (v.t - 2) / 0.5) });
  }
  drawResults(c) {
    const r = this.results; if (!r) return;
    // level-ups: one line per friend ("Bramble reached level 12!"), however many levels they gained at once,
    // and at most five lines (then "and N more"), so the panel always stays above the status panel
    const best = new Map(); for (const u of r.ups) { const b = best.get(u.id); best.set(u.id, { id: u.id, lvl: Math.max(u.lvl, b ? b.lvl : 0), n: (b ? b.n : 0) + 1 }); }
    const all = [...best.values()];
    let lines = all.map(u => `${PARTY[u.id].name} reached level ${u.lvl}!` + (u.n > 1 ? ` (+${u.n})` : ''));
    if (lines.length > 5) { const rest = all.slice(4), same = rest.every(u => u.lvl === rest[0].lvl); lines = [...lines.slice(0, 4), `and ${rest.length} more ${same ? 'reached level ' + rest[0].lvl : 'grew stronger'}!`]; }
    const pw = 300, px = (W - pw) / 2, h = 70 + (lines.length ? lines.length * 13 + 6 : 0), py = Math.max(40, Math.round((H - 70 - h) / 2));
    panel(c, px, py, pw, h);
    ui.text('Victory!', W / 2, py + 22, { align: 'center', size: 15, color: P.gold });
    ui.text(`${r.xp} XP   ${r.btn} buttons`, W / 2, py + 40, { align: 'center', size: 10 });
    lines.forEach((l, i) => ui.text(l, W / 2, py + 58 + i * 13, { align: 'center', size: 10, color: '#c0f0a0' }));
    if (this.resultsReady) ui.text('Space or click', W / 2, py + h - 9, { align: 'center', size: 8, color: '#b8acc8' });
    if (G.drawingTop) hits.add('Continue', px, py, pw, h);
  }
  // debug-hook summary
  summary() {
    const sim = this.sim, m = this.menu;
    const u2 = u => ({ uid: u.uid, id: u.id, name: u.name, hp: u.hp, max: u.maxHp, pl: u.pl, maxPl: u.maxPl, ko: !!u.ko, out: !!u.out, statuses: Object.keys(u.statuses), targetable: sim.targetable(u), glow: !!(u.ms && u.ms.glow), eyes: u.ms ? u.ms.eyes || 0 : 0, submerged: !!(u.ms && u.ms.submerged), charging: !!(u.ms && (u.ms.charge || u.ms.strike)),
      // for the replay autopilot's counter policy (tools/play.js): what tools/lib-battle.mjs reads from the sim
      buffs: Object.keys(u.buffs || {}), boss: !!u.boss, mech: u.mech || null, counter: u.boss && BOSSES[u.id] ? BOSSES[u.id].counter || null : null, eerie: !!u.eerie, hum: !!u.hum, charge: u.ms ? u.ms.charge || 0 : 0, strike: !!(u.ms && u.ms.strike), str: u.str, wit: u.wit, skillIds: u.skills || null, silenced: !!(u.ms && u.ms.silenced), ngEye: !!u.ngEye });
    return {
      encounter: this.encId, round: sim.round, phase: this.phase, result: sim.result,
      turn: m ? m.u.id : null, menu: m ? { mode: m.mode, cmds: m.cmds, sel: m.sel, list: m.list ? m.list.map(i => i.id || i.name) : null, lsel: m.lsel, targets: m.targets ? m.targets.map(t => t.uid) : null, tsel: m.tsel, disabled: m.cmds.filter(n => this.menuDisabled(n, m.u)) } : null,
      party: sim.party.map(u2), reserves: sim.reserves.map(u2), enemies: sim.enemies.map(u2), items: { ...sim.items },
      skills: m ? m.u.skills.map(id => ({ ...SKILLS[id], id })) : null, skillDefs: m ? Object.fromEntries([...sim.party, ...sim.reserves].flatMap(p => p.skills || []).map(id => [id, { ...SKILLS[id], id }])) : null,
      dream: !!this.enc.dream, storyUsedRound: sim.storyUsedRound,
      storyAvailable: this.enc.dream ? this.availableMemories() : undefined, resultsReady: !!this.resultsReady,
      // NG+ (tools/play.js reads these for the second-phase counters)
      ng: !!sim.ng2, phase2: !!sim.phase2, ngs: { ...sim.ngs }, counter2: sim.ng2 ? sim.ng2.counter2 || null : null, counterText: this.counterText(),
      tellers: sim.ng2 && sim.ng2.story ? Object.fromEntries((G.s.memories || []).map(m => [m, tellerOf(sim, m)])) : undefined,
    };
  }
}
const frameCache = new Map();
function frameOf(sheet, i) {
  const k = sheet.img.src + '#' + i; if (frameCache.has(k)) return frameCache.get(k);
  const c = document.createElement('canvas'); frameCache.set(k, c); c.width = sheet.fw; c.height = sheet.fh;
  c.getContext('2d').drawImage(sheet.img, i * sheet.fw, 0, sheet.fw, sheet.fh, 0, 0, sheet.fw, sheet.fh); return c;
}
import { drawPortrait } from '../engine/gfx.js';
function drawPortraitSmall(c, who, x, y) { drawPortrait(c, (G.data.speakers[who] || {}).por || who, x, y); }
