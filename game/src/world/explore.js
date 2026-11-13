// The exploration scene: an isometric map with Bramble, his followers, people, props, map enemies,
// doors, triggers, chests, nibbling, size puzzles, china tiles and the HUD.
import { G, W, H, ui, hits, pushScene, clamp, lerp, toast, findScene } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { autosave } from '../engine/save.js';
import { toScreen, tileImage, drawWater, pick, LEGEND, LH } from '../engine/iso.js';
import { findPath } from '../engine/path.js';
import { prop as propImg, placeholder, imageReady, spritePath, has } from '../engine/assets.js';
import { panel, bar, drawFace, fade, button, keyHint, drawIcon } from '../engine/gfx.js';
import { P, WORLD } from '../data/core/palette.js';
import { DIRS, dirOf, drawActor, actorFrame } from './actors.js';
import { runScript } from './script.js';
import { travelling, member, maxHp, maxPl, flag, setFlag } from '../state.js';
import { pad, padWords } from '../engine/pad.js';
import { glyph, soundLocked, SOUND_HINT } from '../engine/prompts.js';

const HOP = 0.22, HOP_FAST = 0.16;

export class ExploreScene {
  constructor() { this.kind = 'explore'; this.opaque = true; this.map = null; this.busy = 0; this.fadeA = 1; this.iris = 0; this.bubbles = []; this.fx = []; this.shakeT = 0; this.shakeA = 0; this.size = 'normal'; this.placeT = 0; }
  // escorts (Mole, the hedgehogs, Toad, Wick, Pip, Rumble...) live in the save, so a reload keeps them following
  get escorts() { if (!G.s) return []; if (!Array.isArray(G.s.escorts)) G.s.escorts = []; return G.s.escorts; }
  set escorts(v) { if (G.s) G.s.escorts = v; }

  // ---------- loading a map
  async load(mapId, tx, ty, facing, opts = {}) {
    const def = G.data.maps[mapId];
    if (!def) throw new Error('no map ' + mapId);
    // wandering enemies come back once you leave a map and return (one-off 'once' enemies stay beaten by their flag)
    if (!this.map || this.map.id !== mapId) G.s.defeated[mapId] = {};
    // named entries: load(map, 'north') uses def.entries.north = [x, y, facing]
    if (typeof tx === 'string') { const e = (def.entries || {})[tx]; if (!e) throw new Error(`map ${mapId} has no entry "${tx}"`); [tx, ty] = e; facing = facing || e[2]; }
    const m = this.map = { def, id: mapId, world: def.world || 'downs', w: 0, h: 0, tiles: [], heights: [], props: [], actors: [], enemies: [], cracks: new Map() };
    const rows = def.tiles; m.h = rows.length; m.w = Math.max(...rows.map(r => r.length));
    const legend = { ...LEGEND, ...(def.legend || {}) };
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const ch = rows[y][x] || ' '; const L = legend[ch] || null;
      const hch = def.heights ? (def.heights[y] || '')[x] : '0';
      let h = hch && hch !== ' ' && hch !== '.' ? parseInt(hch, 36) : 0; if (isNaN(h)) h = 0;
      m.tiles.push(L ? { ...L, ch } : null); m.heights.push(L ? h + (L.wall ? 3 : 0) + (L.raise ? 0 : 0) : -1);
    }
    // props: [name, x, y] or {id, x, y, w, h, walk, cond, hide}
    for (const p of def.props || []) {
      const o = Array.isArray(p) ? { id: p[0], x: p[1], y: p[2], w: p[3] || 1, h: p[4] || 1 } : { w: 1, h: 1, ...p };
      if (o.cond && !o.cond()) continue;
      m.props.push(o);
    }
    // people
    for (const a of def.npcs || []) {
      if (a.cond && !a.cond()) continue;
      m.actors.push({ kind: 'npc', facing: 'se', hopT: -1, ...a, sprite: a.sprite || a.id, x: a.x, y: a.y, tx: a.x, ty: a.y });
    }
    // map enemies (not ones already beaten this visit; see the reset at the top of load)
    const beaten = (G.s.defeated[mapId] || {});
    for (const e of def.enemies || []) {
      if (beaten[e.id] || (e.cond && !e.cond())) continue;
      if (e.once && flag('beat_' + e.id)) continue;
      const loop = e.loop || [[e.x, e.y]];
      m.enemies.push({ kind: 'enemy', hopT: -1, facing: e.facing || 'sw', ...e, sprite: e.sprite || e.type, x: e.x, y: e.y, li: 0, loop, chasing: false, bob: Math.random() * 6, beat: 0, hum: e.hum });
    }
    this.size = 'normal';
    this.trail = [];
    // Bramble
    const b = this.b = { kind: 'player', sprite: 'bramble', x: tx, y: ty, facing: facing || 'se', hopT: -1, size: 'normal', idleT: -1, nibbleT: -1 };
    this.lineOff = { x: 0, y: 0 }; this.run = null; this.heldHops = 0; this.path = null; this.queued = null;
    this.buildFollowers(true);
    this.camGoal = null; this.cam = this.camTarget(); this.camX = this.cam.x; this.camY = this.cam.y;
    m.china = m.tiles.some(t => t && t.china);
    this.markSeen();
    G.s.map = mapId; G.s.x = tx; G.s.y = ty; G.s.facing = b.facing;
    G.s.placeName = def.name || '';
    if (G.data.chapterOf) G.s.chapter = G.data.chapterOf(mapId, G.s.chapter);
    this.placeT = 3.5;
    this.standStill = 0;
    // music and ambience
    const mus = typeof def.music === 'function' ? def.music() : def.music;
    if (mus !== undefined) audio.music(mus);
    audio.stopAmbience(def.ambience ? def.ambience.map(a => Array.isArray(a) ? a[0] : a) : []);
    for (const a of def.ambience || []) { const [id, v] = Array.isArray(a) ? a : [a, 0.4]; audio.ambience(id, v); }
    // warm the battle backdrops this map's fights use (battle/backdrops.js; not awaited)
    import('../battle/backdrops.js').then(b => b.preloadBattleBackdrops(def)).catch(() => {});
    // preload sprites on this map
    const names = new Set(['bramble-se', 'bramble-sw', 'bramble-ne', 'bramble-nw']);
    for (const a of [...m.actors, ...m.enemies]) { names.add(a.sprite); names.add(a.sprite + '-back'); }
    for (const id of travelling()) { names.add(id); names.add(id + '-back'); }
    const paths = [...names].filter(n => has('map', n)).map(n => spritePath('map', n));
    for (const p of m.props) if (has('props', p.id)) paths.push(`assets/sprites/props/${p.id}.png`);
    await Promise.race([Promise.all(paths.map(imageReady)), new Promise(r => setTimeout(r, 2500))]);
    if (!opts.noSave) autosave();
    if (def.onEnter && !opts.noEnter) this.queueScript(def.onEnter);
    else this.enterBubble();
  }

  // followers: escorts first, then the two travelling companions
  buildFollowers(place) {
    const ids = [...this.escorts.map(e => ({ id: e.id, sprite: e.sprite || e.id, escort: true, kid: e.kid })), ...travelling().filter(id => id !== 'bramble').map(id => ({ id, sprite: id, kid: id === 'pip' }))];
    const old = new Map((this.followers || []).map(f => [f.id, f]));
    this.followers = ids.map((f, i) => {
      const prev = old.get(f.id);
      if (prev && !place) return prev;
      return { kind: 'follower', ...f, x: this.b.x, y: this.b.y, facing: this.b.facing, hopT: -1, merge: 0, mergeTo: 0 };
    });
    if (place) {
      // line them up on the tiles behind Bramble
      const [dx, dy] = DIRS[this.b.facing];
      let px = this.b.x, py = this.b.y; this.trail = [];
      for (let i = 0; i < this.followers.length; i++) {
        const nx = px - dx, ny = py - dy;
        if (this.walkable(nx, ny, true) && Math.abs(this.hAt(nx, ny) - this.hAt(px, py)) <= 1) { px = nx; py = ny; }
        this.trail.push({ x: px, y: py });
        const f = this.followers[i]; f.x = px; f.y = py; f.facing = this.b.facing;
      }
    }
    this.updateMerge(true);
  }
  get merged() { return !!(this.map && this.map.def.merge) || this.size !== 'normal'; }
  updateMerge(instant) {
    for (const f of this.followers || []) {
      f.mergeTo = this.merged && !f.escort ? 1 : 0;
      if (instant) f.merge = f.mergeTo;
    }
  }
  setSize(sz) {
    if (this.size === sz) return false;
    if (sz === 'big' && this.map.def.low) { toast('The ceiling is far too low to grow in here!'); return false; }
    if (sz !== 'small') { const t = this.tile(this.b.x, this.b.y); if (t && t.small) { toast('Not here: there isn\'t room to grow.'); return false; } }
    const old = this.size; this.size = sz; this.b.size = sz;
    this.sizeTween = { from: old, t: 0 };
    if (sz === 'small') audio.sfxReverse('swanee'); else audio.sfx('swanee', { pitch: sz === 'big' ? 1 : 0.9 });
    this.updateMerge(false);
    if (this.merged) audio.synth('pop', 1.4);
    return true;
  }

  // ---------- map queries
  idx(x, y) { return y * this.map.w + x; }
  tile(x, y) { const m = this.map; return x >= 0 && y >= 0 && x < m.w && y < m.h ? m.tiles[this.idx(x, y)] : null; }
  hAt(x, y) { const m = this.map; return x >= 0 && y >= 0 && x < m.w && y < m.h ? m.heights[this.idx(x, y)] : -1; }
  propAt(x, y) { return this.map.props.find(p => !p.walk && !p.ground && x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h); }
  groundAt(x, y) { return this.map.props.find(p => p.ground && x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h); }
  actorAt(x, y) { return this.map.actors.find(a => !a.hidden && a.x === x && a.y === y && !a.walkThrough); }
  enemyAt(x, y) { return this.map.enemies.find(e => e.x === x && e.y === y); }
  walkable(x, y, ignoreActors) {
    const t = this.tile(x, y); if (!t) return false;
    const gp = this.groundAt(x, y);
    if (!t.walk && !gp) {
      if (t.hedge && this.size === 'big') return true;
      return false;
    }
    if (t.small && this.size !== 'small') return false;
    if (this.propAt(x, y)) return false;
    if (!ignoreActors && this.actorAt(x, y)) return false;
    const blk = this.map.def.blocked; if (blk && blk(x, y, this)) return false;
    return true;
  }
  canStep(fx, fy, tx, ty) {
    if (!this.walkable(tx, ty)) return false;
    const dh = Math.abs(this.hAt(tx, ty) - this.hAt(fx, fy));
    return dh <= (this.size === 'big' ? 2 : 1);
  }

  // ---------- movement
  tryHop(dx, dy, facing, opts = {}) {
    const b = this.b, tx = b.x + dx, ty = b.y + dy;
    b.facing = facing || dirOf(dx, dy);
    const enemy = this.enemyAt(tx, ty);
    if (enemy && this.canStepIgnoringEnemy(b.x, b.y, tx, ty)) { this.touchEnemy(enemy, true); return true; }
    if (!this.canStep(b.x, b.y, tx, ty)) {
      // a door on a blocked edge tile still counts
      const door = this.doorAt(tx, ty); if (door && this.tile(tx, ty)) { this.useDoor(door); return true; }
      return false;
    }
    this.startHop(tx, ty, opts.dur || HOP);
    return true;
  }
  canStepIgnoringEnemy(fx, fy, tx, ty) { return this.canStep(fx, fy, tx, ty); }
  startHop(tx, ty, dur) {
    const b = this.b;
    const from = { x: b.x, y: b.y, h: this.hAt(b.x, b.y) };
    b.hop = { fx: b.x, fy: b.y, fh: from.h, tx, ty, th: this.hAt(tx, ty), t: 0, dur };
    // the line correction (straight screen line on a single held key)
    const fromS = toScreen(b.x, b.y), toS = toScreen(tx, ty);
    if (this.run && this.run.mid) {
      const ax = this.run.axis;
      b.hop.o0 = { ...this.lineOff };
      b.hop.o1 = ax === 'x' ? { x: this.run.mid - toS.x, y: 0 } : { x: 0, y: this.run.mid - toS.y };
    } else { b.hop.o0 = { ...this.lineOff }; b.hop.o1 = { x: 0, y: 0 }; }
    b.x = tx; b.y = ty; b.hopT = 0; b.idleT = -1; b.nibbleT = -1;
    G.s.x = tx; G.s.y = ty; G.s.facing = b.facing;
    this.markSeen();
    audio.sfx(Math.random() < 0.5 ? 'hop-1' : 'hop-2', { vol: 0.35 });
    // followers step along the trail
    this.trail.unshift({ x: from.x, y: from.y }); this.trail.length = Math.min(this.trail.length, 8);
    for (let i = 0; i < this.followers.length; i++) {
      const f = this.followers[i], to = this.trail[i]; if (!to) continue;
      if (f.x === to.x && f.y === to.y) continue;
      const far = Math.abs(f.x - to.x) + Math.abs(f.y - to.y) > 3;
      if (far) { f.x = to.x; f.y = to.y; f.hop = null; f.hopT = -1; continue; }
      f.facing = dirOf(to.x - f.x, to.y - f.y);
      f.hop = { fx: f.x, fy: f.y, fh: this.hAt(f.x, f.y), tx: to.x, ty: to.y, th: this.hAt(to.x, to.y), t: 0, dur: dur * (1 + i * 0.04) };
      f.x = to.x; f.y = to.y; f.hopT = 0;
    }
    this.dust(from.x, from.y, from.h);
    this.standStill = 0;
    this.stepEnemies();
    if (this.map.def.onHop) this.map.def.onHop(this, tx, ty);
  }
  // tiles Bramble has seen (for the camp Map tab): a flood out to 4 hops over open floor, plus the walls around it;
  // kept per map in G.s.seen as a base64 bitset so it is saved with the game
  markSeen() {
    const m = this.map; if (!G.s || !m || !this.b) return;
    if (!m.seen) m.seen = seenBits(m.id, m.w * m.h);
    let changed = false;
    const mark = (x, y) => { const i = this.idx(x, y); if (!m.seen[i]) { m.seen[i] = 1; changed = true; } };
    const q = [[this.b.x, this.b.y, 0]], done = new Set([this.b.x + ',' + this.b.y]);
    while (q.length) {
      const [x, y, d] = q.shift(); mark(x, y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny, t = this.tile(nx, ny);
        if (!t || done.has(k)) continue; done.add(k);
        if (t.wall || d >= 4) { mark(nx, ny); continue; }
        q.push([nx, ny, d + 1]);
      }
    }
    if (changed) (G.s.seen = G.s.seen || {})[m.id] = encodeBits(m.seen);
  }
  dust(x, y, h) { const s = toScreen(x, y, h); this.fx.push({ k: 'dust', x: s.x, y: s.y + 10, t: 0, life: 0.35 }); }

  arrive() {
    const b = this.b, x = b.x, y = b.y, t = this.tile(x, y);
    // china tiles
    if (t && t.china) {
      const k = x + ',' + y, n = (this.map.cracks.get(k) || 0) + 1; this.map.cracks.set(k, n);
      if (n === 1) audio.sfx('china-crack', { vol: 0.7 });
      else { audio.sfx('china-crunch'); this.queueScript(async s => { await s.say(null, '"Oh, I am sorry!" The little china floor breaks with a crunch.'); await s.warp(this.map.id, this.map.def.entry[0], this.map.def.entry[1], this.map.def.entry[2]); }); return; }
    }
    // doors
    const door = this.doorAt(x, y); if (door) { if (this.useDoor(door)) return; }
    // step triggers
    for (const tr of this.map.def.triggers || []) {
      const w = tr.w || 1, h = tr.h || 1;
      if (x >= tr.x && x < tr.x + w && y >= tr.y && y < tr.y + h) {
        if (tr.use) continue;
        const key = 'trig_' + this.map.id + '_' + (tr.id || tr.x + '_' + tr.y);
        if (tr.once && flag(key)) continue;
        if (tr.cond && !tr.cond(this)) continue;
        if (tr.once) setFlag(key);
        this.queueScript(tr.run); this.path = null; return;
      }
    }
  }
  doorAt(x, y) { return (this.map.def.doors || []).find(d => d.x === x && d.y === y && (!d.cond || d.cond())); }
  useDoor(d) {
    if (d.locked && d.locked()) { if (d.lockedRun) this.queueScript(d.lockedRun); return true; }
    if (d.run) { this.queueScript(d.run); return true; }
    this.go(d.to, d.entry || d.tx, d.ty, d.facing);
    return true;
  }
  go(mapId, tx, ty, facing) {
    if (this.leaving) return; this.leaving = true; this.path = null;
    this.queueScript(async s => { await s.warp(mapId, tx, ty, facing); });
  }

  // turn-stepped map enemies: one step per Bramble hop; chase within 4 on 2 of 3 hops; give up beyond 7
  stepEnemies() {
    const b = this.b;
    for (const e of this.map.enemies) {
      if (e.still) continue;
      e.beat = (e.beat + 1) % 3;
      const d = Math.abs(e.x - b.x) + Math.abs(e.y - b.y);
      if (e.cool > 0) { e.cool--; e.chasing = false; continue; }   // just fled from: it holds still a few hops
      if (d <= 4 && !e.noChase) e.chasing = true; else if (d > 7) e.chasing = false;
      let nx = e.x, ny = e.y;
      if (e.chasing) {
        if (e.beat === 2) continue;
        const opts = [[Math.sign(b.x - e.x), 0], [0, Math.sign(b.y - e.y)]].filter(([dx, dy]) => dx || dy);
        if (Math.abs(b.y - e.y) > Math.abs(b.x - e.x)) opts.reverse();
        for (const [dx, dy] of opts) {
          const tx = e.x + dx, ty = e.y + dy;
          if (tx === b.x && ty === b.y) { nx = tx; ny = ty; break; }
          if (this.canEnemyStep(e, tx, ty)) { nx = tx; ny = ty; break; }
        }
      } else {
        // walk the loop (or back toward it)
        const tgt = e.loop[(e.li + 1) % e.loop.length];
        const [gx, gy] = tgt;
        if (e.x === gx && e.y === gy) { e.li = (e.li + 1) % e.loop.length; continue; }
        const dx = Math.sign(gx - e.x), dy = Math.sign(gy - e.y);
        if (dx && this.canEnemyStep(e, e.x + dx, e.y)) nx = e.x + dx; else if (dy && this.canEnemyStep(e, e.x, e.y + dy)) ny = e.y + dy;
        if (nx === gx && ny === gy) e.li = (e.li + 1) % e.loop.length;
      }
      if (nx !== e.x || ny !== e.y) {
        e.facing = dirOf(nx - e.x, ny - e.y);
        e.hop = { fx: e.x, fy: e.y, fh: this.hAt(e.x, e.y), tx: nx, ty: ny, th: this.hAt(nx, ny), t: 0, dur: 0.2 };
        e.x = nx; e.y = ny; e.hopT = 0;
        if (nx === b.x && ny === b.y) { const ee = e; setTimeout(() => {}, 0); this.pendingTouch = { e: ee, first: false }; }
      }
    }
  }
  // after a successful flee the enemy backs off a tile and won't chase for a few hops (no instant re-fight)
  shooEnemy(e) {
    e.cool = 5; e.chasing = false; e.hop = null; e.hopT = -1;
    const b = this.b, sx = Math.sign(e.x - b.x), sy = Math.sign(e.y - b.y);
    const opts = [[sx, 0], [0, sy], [sx || 1, 0], [0, sy || 1], [-(sx || 1), 0], [0, -(sy || 1)]].filter(([dx, dy]) => dx || dy);
    if (!e.still) for (const [dx, dy] of opts) {
      const nx = e.x + dx, ny = e.y + dy;
      if ((nx !== b.x || ny !== b.y) && this.canEnemyStep(e, nx, ny) && Math.abs(nx - b.x) + Math.abs(ny - b.y) > Math.abs(e.x - b.x) + Math.abs(e.y - b.y)) { e.x = nx; e.y = ny; break; }
    }
    if (this.pendingTouch && this.pendingTouch.e === e) this.pendingTouch = null;
  }
  canEnemyStep(e, x, y) {
    if (!this.walkable(x, y)) return false;
    if (this.enemyAt(x, y)) return false;
    const t = this.tile(x, y); if (t && t.small) return false;
    if (this.doorAt(x, y)) return false;
    if (Math.abs(this.hAt(x, y) - this.hAt(e.x, e.y)) > 1) return false;
    if (e.zone && !(x >= e.zone[0] && y >= e.zone[1] && x <= e.zone[2] && y <= e.zone[3])) return false;
    return true;
  }
  touchEnemy(e, byBramble) {
    if (this.busy) return;
    // stepping onto it from the tile behind it gives the party the first turn
    const [fx, fy] = DIRS[e.facing];
    const behind = byBramble && this.b.x === e.x - fx && this.b.y === e.y - fy;
    this.path = null;
    const enc = e.encounter;
    this.queueScript(async s => {
      const res = await s.battle(enc, { first: behind, mapEnemy: e.id, enemyType: e.type });
      if (res === 'fled' && this.map.enemies.includes(e)) this.shooEnemy(e);
      if (res === 'win') { (G.s.defeated[this.map.id] = G.s.defeated[this.map.id] || {})[e.id] = 1; if (e.once) setFlag('beat_' + e.id); this.map.enemies = this.map.enemies.filter(x => x !== e); if (e.after) await runScript(e.after, this); s.save(); }   // the design autosaves after every battle
    });
  }

  // ---------- scripts
  queueScript(fn) {
    this.busy++; this.b.idleT = -1;
    runScript(fn, this).finally(() => {
      this.busy = Math.max(0, this.busy - 1);
      // a save asked for mid-script (warp, s.save, rest) is written once the scene is over (engine/save.js)
      if (!this.busy && this.savePending) { this.savePending = false; if (G.scenes.includes(this)) autosave(); }
    });
  }

  // ---------- interaction
  facingTile() { const [dx, dy] = DIRS[this.b.facing]; return { x: this.b.x + dx, y: this.b.y + dy }; }
  interact() {
    const t = this.facingTile();
    const a = this.actorAt(t.x, t.y) || this.map.actors.find(a => !a.hidden && a.x === t.x && a.y === t.y);
    if (a && a.talk) { this.talkTo(a); return true; }
    const ch = (this.map.def.chests || []).find(c => c.x === t.x && c.y === t.y);
    if (ch) { this.openChest(ch); return true; }
    for (const tr of this.map.def.triggers || []) {
      if (!tr.use) continue;
      const w = tr.w || 1, h = tr.h || 1;
      const on = (t.x >= tr.x && t.x < tr.x + w && t.y >= tr.y && t.y < tr.y + h) || (tr.here && this.b.x >= tr.x && this.b.x < tr.x + w && this.b.y >= tr.y && this.b.y < tr.y + h);
      if (on && (!tr.cond || tr.cond(this))) { this.queueScript(tr.run); return true; }
    }
    const e = this.enemyAt(t.x, t.y); if (e) { this.touchEnemy(e, true); return true; }
    // a door on a blocked tile (inside a door prop, on an edge wall) is used by facing it, as hopping into it does
    const door = this.doorAt(t.x, t.y); if (door && this.tile(t.x, t.y) && !this.canStep(this.b.x, this.b.y, t.x, t.y)) { this.useDoor(door); return true; }
    return false;
  }
  talkTo(a) {
    this.path = null;
    // turn to each other
    a.facing = dirOf(this.b.x - a.x, this.b.y - a.y) || a.facing;
    this.queueScript(async s => { await runScript(a.talk, this, a); if (a.faceBack) a.facing = a.faceBack; });
  }
  openChest(ch) {
    const key = this.map.id + ':' + (ch.id || ch.x + ',' + ch.y);
    if (G.s.opened[key]) { toast('Empty.'); return; }
    if (ch.cond && !ch.cond()) return;
    this.queueScript(async s => {
      G.s.opened[key] = 1; audio.sfx('chest-open');
      if (ch.give) await s.give(ch.give);
      if (ch.run) await runScript(ch.run, this);
    });
  }
  nibble() {
    const t = this.tile(this.b.x, this.b.y);
    if (!t || !t.nib) { toast('Nothing tasty here.'); return; }
    const key = this.map.id + ':' + this.b.x + ',' + this.b.y;
    this.nibbled = this.nibbled || {};
    if ((this.nibbled[key] || 0) >= 3) { toast('This patch is nibbled bare.'); return; }
    this.nibbled[key] = (this.nibbled[key] || 0) + 1;
    this.b.facing = 'se'; this.b.nibbleT = 0; this.nibbleFor = 1.0;
    audio.sfx('nibble');
    const sweet = t.nib === 'sweet';
    for (const id of travelling()) { const m = member(id); m.hp = Math.min(maxHp(id), m.hp + Math.ceil(maxHp(id) * (sweet ? 0.25 : 0.05))); m.pl = Math.min(maxPl(id), m.pl + Math.ceil(maxPl(id) * (sweet ? 0.25 : 0.03))); }
    const s = toScreen(this.b.x, this.b.y, this.hAt(this.b.x, this.b.y));
    this.fx.push({ k: 'heart', x: s.x, y: s.y - 26, t: 0, life: 0.9 });
    if (this.map.def.onNibble) this.map.def.onNibble(this, t);
  }

  // ---------- camera
  footScreen(a, hopKey = 'hop') {
    let x = a.x, y = a.y, h = this.hAt(a.x, a.y);
    if (a.hop) { const t = Math.min(1, a.hop.t / a.hop.dur); x = lerp(a.hop.fx, a.hop.tx, t); y = lerp(a.hop.fy, a.hop.ty, t); h = lerp(a.hop.fh, a.hop.th, t); }
    const s = toScreen(x, y, h); return { x: s.x, y: s.y + 8 };
  }
  bScreen() {
    const s = this.footScreen(this.b); return { x: s.x + this.lineOff.x, y: s.y + this.lineOff.y };
  }
  // The camera keeps Bramble inside a dead zone around the centre (it only moves once he walks out of it), is
  // clamped to the map's edges, and then always keeps him inside a comfort box round the centre that wins over the
  // map clamp (so at an edge he stays central and the view shows a little void, not him at the screen's edge).
  camTarget() {
    const m = this.map, s = this.bScreen();
    const fy = s.y - 14;                     // aim at his body, not his feet
    const DZX = 40, DZY = 22;                // dead zone (half sizes) around the screen centre
    let cx = s.x - W / 2, cy = fy - H / 2;
    const g = this.camGoal;
    if (g && Math.abs(s.x - (g.x + W / 2)) < W / 2 && Math.abs(fy - (g.y + H / 2)) < H / 2) {   // near the last view: dead zone
      cx = clamp(g.x, s.x - W / 2 - DZX, s.x - W / 2 + DZX); cy = clamp(g.y, fy - H / 2 - DZY, fy - H / 2 + DZY);
    }
    // map bounds in screen space
    const minX = -(m.h) * 16, maxX = m.w * 16, minY = -3 * LH, maxY = (m.w + m.h) * 8 + 16;
    const spanX = maxX - minX, spanY = maxY - minY;
    cx = spanX <= W ? minX - (W - spanX) / 2 : clamp(cx, minX, maxX - W);
    cy = spanY <= H ? minY - (H - spanY) / 2 : clamp(cy, minY - 20, maxY - H + 20);
    // comfort box round the centre, which wins over the map clamp: at a map's edge the view goes past the edge (into
    // the sky / void) rather than pinning him near the screen's edge, behind a willow or under the HUD. His body
    // stays within 64 px of the centre across and 26 px up or down (well clear of the faces, the quest line and the
    // dialogue box), only a little more than the dead zone
    cx = clamp(cx, s.x - W / 2 - 64, s.x - W / 2 + 64);
    cy = clamp(cy, fy - H / 2 - 26, fy - H / 2 + 26);
    this.camGoal = { x: cx, y: cy };
    return { x: cx, y: cy };
  }

  // ---------- update
  update(dt) {
    if (!this.map) return;
    if (this.busy || this.leaving) return;
    // pending enemy touch (an enemy stepped onto Bramble)
    if (this.pendingTouch && !this.b.hop) { const p = this.pendingTouch; this.pendingTouch = null; if (this.map.enemies.includes(p.e)) { this.touchEnemy(p.e, false); return; } }
    // menus
    if (input.isPressed('Escape') || input.isPressed('KeyP')) { input.eatAll(); this.openPause(); return; }
    if (input.isPressed('Tab') || input.isPressed('KeyI')) { input.eatAll(); this.openCamp(); return; }
    // HUD buttons and clicks are handled in draw() (buttons) and here (tiles)
    if (this.hudClick) { const f = this.hudClick; this.hudClick = null; f(); return; }
    // a controller with the sound still locked: say so once, as a toast
    if (!G.soundToldPad && soundLocked()) { G.soundToldPad = true; toast(SOUND_HINT, 3); }
    if (this.b.hop) return;
    if (input.act()) { if (this.interact()) return; }
    if (input.isPressed('KeyN')) { this.nibble(); return; }
    if (this.nibbleFor > 0) return;
    // mouse
    if (input.click() && !this.overHud(input.mouse.px, input.mouse.py)) { this.clickAt(input.mouse.px, input.mouse.py); }   // where the press went down (a fast click may already have moved on)
    if (input.rclick() && input.mouse.inside) { const t = this.screenToTile(input.mouse.x, input.mouse.y); if (t && t.x === this.b.x && t.y === this.b.y) { this.nibble(); return; } }
    // keyboard movement
    const d = input.heldDir();
    const any = d.up || d.down || d.left || d.right;
    if (any) { this.path = null; this.keyMove(d); return; }
    this.run = null; this.heldHops = 0;
    // path following
    if (this.path && this.path.length) {
      const n = this.path.shift();
      const dx = n.x - this.b.x, dy = n.y - this.b.y;
      if (Math.abs(dx) + Math.abs(dy) !== 1 || !this.tryHop(dx, dy, null, { dur: HOP_FAST })) { this.path = null; }
      if (this.path && !this.path.length) { this.path = null; if (this.afterPath) { const f = this.afterPath; this.afterPath = null; this.pathDone = f; } }
      return;
    }
    if (this.pathDone) { const f = this.pathDone; this.pathDone = null; f(); return; }
  }
  keyMove(d) {
    let key, steps, facing;
    const grid = G.settings.gridKeys;
    const two = (d.up || d.down) && (d.left || d.right);
    if (grid) {
      key = d.up ? 'up' : d.down ? 'down' : d.left ? 'left' : 'right';
      const m = { up: [[0, -1]], right: [[1, 0]], down: [[0, 1]], left: [[-1, 0]] }; steps = m[key];
      facing = dirOf(...steps[0]);
    } else if (two) {
      key = (d.up ? 'u' : 'd') + (d.left ? 'l' : 'r');
      steps = [{ ur: [0, -1], ul: [-1, 0], dr: [1, 0], dl: [0, 1] }[key]]; facing = dirOf(...steps[0]);
    } else {
      key = d.up ? 'up' : d.down ? 'down' : d.left ? 'left' : 'right';
      const pairs = { up: [[-1, 0], [0, -1]], down: [[1, 0], [0, 1]], left: [[-1, 0], [0, 1]], right: [[1, 0], [0, -1]] };
      facing = { up: 'ne', down: 'se', left: 'sw', right: 'se' }[key];
      if (!this.run || this.run.key !== key) {
        const s0 = toScreen(this.b.x, this.b.y);
        this.run = { key, parity: 0, axis: key === 'up' || key === 'down' ? 'x' : 'y', start: s0, mid: null };
        this.heldHops = 0;
      }
      const p = pairs[key], i = this.run.parity % 2;
      steps = [p[i], p[1 - i]];
    }
    if (!this.run || this.run.key !== key) { this.run = { key, parity: 0 }; this.heldHops = 0; }
    // first hop of a straight run fixes the midline
    let hopped = false;
    for (let k = 0; k < steps.length; k++) {
      const [dx, dy] = steps[k];
      if (this.run.axis && this.run.mid === null && !two && !grid) {
        const s1 = toScreen(this.b.x + dx, this.b.y + dy);
        this.run.mid = this.run.axis === 'x' ? (this.run.start.x + s1.x) / 2 : (this.run.start.y + s1.y) / 2;
      }
      const vertical = !grid && !two && (key === 'up' || key === 'down');
      const dur = (this.heldHops >= 3 ? HOP_FAST : HOP) * (vertical ? 0.8 : 1);
      if (this.tryHop(dx, dy, facing, { dur })) { hopped = true; if (k === 0) this.run.parity++; break; }
      // the alternate is used; parity stays so we try the same order next time
      if (this.run.axis) this.run.mid = null;
    }
    if (hopped) this.heldHops++;
    else { this.b.facing = facing; this.run.mid = null; }
  }
  screenToTile(mx, my) {
    const shx = this.shakeX || 0, shy = this.shakeY || 0;
    return pick(mx + this.camX - shx, my + this.camY - shy, this.map.w, this.map.h, (x, y) => this.hAt(x, y));
  }
  // how much of tile (x, y)'s diamond a prop's drawn pixels hide (0..1, sampled)
  coverage(p, x, y) {
    const r = p._rect; if (!r) return 0;
    const s = toScreen(x, y, Math.max(0, this.hAt(x, y))); let n = 0, hid = 0;
    for (let dy = -6; dy <= 6; dy += 2) for (let dx = -14; dx <= 14; dx += 2) {
      if (Math.abs(dx) / 16 + Math.abs(dy) / 8 > 0.85) continue;
      n++; if (opaqueAt(r.im, s.x + dx - r.x, s.y + 8 + dy - r.y)) hid++;
    }
    return n ? hid / n : 0;
  }
  // a usable prop's tile: a door, a chest or a use-trigger on its footprint (null for plain decoration)
  usableTileOf(p) {
    const def = this.map.def, inP = (x, y) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h;
    const d = (def.doors || []).find(d => inP(d.x, d.y) && (!d.cond || d.cond())); if (d) return { x: d.x, y: d.y, door: d };
    const ch = (def.chests || []).find(c => inP(c.x, c.y)); if (ch) return { x: ch.x, y: ch.y };
    for (const tr of def.triggers || []) {
      if (!tr.use || (tr.cond && !tr.cond(this))) continue;
      const w = tr.w || 1, h = tr.h || 1;
      for (let y = tr.y; y < tr.y + h; y++) for (let x = tr.x; x < tr.x + w; x++) if (inP(x, y)) return { x, y, trig: tr };
    }
    return null;
  }
  // click-walk steps: on maps with china tiles the route never crosses china, except a final single hop onto it,
  // so the "tread softly, never twice" puzzle is still a puzzle with the mouse
  stepFn(dest) {
    const china = this.map.china;
    return (a, b2, c, d) => this.canStep(a, b2, c, d) && (!china || !(this.tile(c, d) || {}).china || (c === dest.x && d === dest.y));
  }
  clickAt(mx, my) {
    // people and chests first (by sprite rectangle)
    const wx = mx + this.camX, wy = my + this.camY;
    let target = null, propT = null, propP = null;
    for (const a of this.map.actors) {
      if (a.hidden || !a.talk || !a._rect) continue;
      const r = a._rect; if (wx >= r.x && wx < r.x + r.w && wy >= r.y && wy < r.y + r.h) target = a;
    }
    // then usable props (doors, chests, use-triggers) by their drawn sprite: the frontmost one under the pointer
    if (!target) {
      let best = -1;
      for (const p of this.map.props) {
        const r = p._rect; if (p.ground || p.hidden || !r || wx < r.x || wx >= r.x + r.w || wy < r.y || wy >= r.y + r.h) continue;
        if (!opaqueAt(r.im, wx - r.x, wy - r.y)) continue;
        const u = this.usableTileOf(p); if (!u) continue;
        const k = p.x + p.y + p.w + p.h; if (k > best) { best = k; propT = u; propP = p; }
      }
      // a walkable floor tile the prop only partly hides still walks: the prop wins only where it hides most of the tile
      // under the pointer (or the tile is its own footprint, blocked, or nothing)
      const pt = propT && this.screenToTile(mx, my), P0 = propP;
      if (pt && this.walkable(pt.x, pt.y) && !(pt.x >= P0.x && pt.x < P0.x + P0.w && pt.y >= P0.y && pt.y < P0.y + P0.h) && this.coverage(P0, pt.x, pt.y) < 0.75) propT = null;
    }
    const t = target ? { x: target.x, y: target.y } : propT || this.screenToTile(mx, my);
    if (!t) return;
    if (t.x === this.b.x && t.y === this.b.y) { if (propT && propT.trig) this.interact(); return; }
    const chest = (this.map.def.chests || []).find(c => c.x === t.x && c.y === t.y);
    const enemy = this.enemyAt(t.x, t.y);
    const blockedDoor = this.doorAt(t.x, t.y) && !this.walkable(t.x, t.y);   // clicking a door prop or edge door: walk up to it and go through
    const goal = target || chest || enemy || (this.propAt(t.x, t.y) || blockedDoor || (propT && propT.trig) ? t : null);
    if (goal) {
      // walk next to it, then use it
      let best = null;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = t.x + dx, ny = t.y + dy;
        if (nx === this.b.x && ny === this.b.y) { best = []; break; }
        if (!this.walkable(nx, ny)) continue;
        const p = findPath(this.b.x, this.b.y, nx, ny, this.stepFn({ x: nx, y: ny }), (x, y) => this.hAt(x, y));
        if (p && (!best || p.length < best.length)) best = p;
      }
      if (!best) return;
      this.path = best;
      const use = () => { this.b.facing = dirOf(t.x - this.b.x, t.y - this.b.y); if (enemy) this.touchEnemy(enemy, true); else this.interact(); };
      if (!best.length) use(); else this.afterPath = use;
      return;
    }
    const p = findPath(this.b.x, this.b.y, t.x, t.y, this.stepFn(t), (x, y) => this.hAt(x, y));
    if (p) { this.path = p; this.afterPath = null; }
    else if (this.map.china && findPath(this.b.x, this.b.y, t.x, t.y, (a, b2, c, d) => this.canStep(a, b2, c, d), (x, y) => this.hAt(x, y))) toast('Tread softly: one china tile at a time.', 1.4);
    else toast('Can\'t get there from here.', 1.2);
  }
  overHud(x = input.mouse.x, y = input.mouse.y) { return x < 0 || y < 0 || x >= W || y >= H || (y < 40 && (x < 130 || x > 530)) || (y > 340); }

  // ---------- tick (animation, runs even during scripts)
  tick(dt, isTop) {
    if (!this.map) return;
    const all = [this.b, ...this.followers, ...this.map.actors, ...this.map.enemies];
    for (const a of all) {
      if (a.hop) {
        a.hop.t += dt; a.hopT = Math.min(1, a.hop.t / a.hop.dur);
        if (a === this.b) { const t = a.hopT; this.lineOff.x = lerp(a.hop.o0.x, a.hop.o1.x, t); this.lineOff.y = lerp(a.hop.o0.y, a.hop.o1.y, t); }
        if (a.hop.t >= a.hop.dur) { a.hop = null; a.hopT = -1; if (a === this.b) this.arrive(); if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(); } }
      }
    }
    if (!this.b.hop && !this.run) { this.lineOff.x *= Math.pow(0.0001, dt); this.lineOff.y *= Math.pow(0.0001, dt); }
    if (this.nibbleFor > 0) { this.nibbleFor -= dt; this.b.nibbleT = 1 - this.nibbleFor; if (this.nibbleFor <= 0) this.b.nibbleT = -1; }
    // idle: ear twitch every few seconds
    if (!this.b.hop && this.b.nibbleT < 0) {
      this.idleClock = (this.idleClock || 0) + dt;
      if (this.idleClock > 4) { this.b.idleT = (this.idleClock - 4) / 0.8; if (this.b.idleT >= 1) { this.b.idleT = -1; this.idleClock = 0; } }
    } else this.idleClock = 0;
    // merge animation
    for (const f of this.followers) { if (f.merge !== f.mergeTo) { const d = Math.sign(f.mergeTo - f.merge) * dt * 3; f.merge = clamp(f.merge + d, 0, 1); if (f.merge === 1 && f.mergeTo === 1) { this.puff(this.b); } if (f.merge === 0 || f.merge === 1) {} } }
    for (const e of this.map.enemies) e.bob += dt * 3;
    // standing still (the Shallows whisper and others)
    if (!this.b.hop && !this.busy) this.standStill += dt;
    if (this.map.def.update) this.map.def.update(this, dt);
    // camera
    const c = this.camTarget(); const k = 1 - Math.pow(0.002, dt);
    this.camX = lerp(this.camX, c.x, k); this.camY = lerp(this.camY, c.y, k);
    if (Math.abs(this.camX - c.x) < 0.3) this.camX = c.x; if (Math.abs(this.camY - c.y) < 0.3) this.camY = c.y;
    // shake
    if (this.shakeT > 0) { this.shakeT -= dt; this.shakeX = Math.round((Math.random() * 2 - 1) * this.shakeA); this.shakeY = Math.round((Math.random() * 2 - 1) * this.shakeA); } else { this.shakeX = this.shakeY = 0; }
    // fx
    for (const f of this.fx) f.t += dt; this.fx = this.fx.filter(f => f.t < f.life);
    for (const bb of this.bubbles) bb.t -= dt; this.bubbles = this.bubbles.filter(bb => bb.t > 0);
    if (this.placeT > 0) this.placeT -= dt;
    if (this.fadeA > 0 && !this.holdFade) this.fadeA = Math.max(0, this.fadeA - dt * 2.5);
    if (this.sizeTween) { this.sizeTween.t += dt; if (this.sizeTween.t > 0.35) this.sizeTween = null; }
  }
  puff(a) { const s = this.footScreen(a); this.fx.push({ k: 'puff', x: s.x, y: s.y - 6, t: 0, life: 0.4 }); audio.synth('pop', 1.2); }
  shake(secs = 0.4, amt = 3) { this.shakeT = secs; this.shakeA = amt; pad.rumble('quake', Math.min(1.5, amt / 3)); }

  // map-entry bubble: one of the two travelling companions says a line
  enterBubble() {
    const lines = G.data.banter && G.data.banter['enter.' + this.map.id];
    if (!lines) return;
    const trav = travelling().filter(id => id !== 'bramble');
    const key = 'bub_' + this.map.id;
    const pool = lines.filter(l => trav.includes(l.who) && (!l.cond || l.cond()));
    if (!pool.length) return;
    const seen = G.s.flags[key] || 0;
    const l = pool[seen % pool.length]; G.s.flags[key] = seen + 1;
    this.bubbles.push({ who: l.who, text: l.line, t: 4.5 });
  }

  // ---------- drawing
  draw(c, isTop) {
    if (!this.map) { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); return; }
    const m = this.map, def = m.def, world = m.world;
    const pal = WORLD[world] || WORLD.downs;
    c.fillStyle = def.sky || pal.sky || '#1a1622'; c.fillRect(0, 0, W, H);
    if (def.drawBack) def.drawBack(this, c);
    const ox = Math.round(-this.camX + (this.shakeX || 0)), oy = Math.round(-this.camY + (this.shakeY || 0));
    this.ox = ox; this.oy = oy;
    // visible tile range (generous)
    const items = [];
    const dark = def.dark || 0;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.tiles[y * m.w + x]; if (!t) continue;
      const h = m.heights[y * m.w + x];
      const s = toScreen(x, y, h);
      const sx = s.x + ox, sy = s.y + oy;
      if (sx < -40 || sx > W + 40 || sy < -60 || sy > H + 120) continue;
      items.push({ key: x + y, h, x, sub: 0, t, tx: x, ty: y, sx, sy });
    }
    // ground pass: tile tops at their heights, walls as tall blocks (drawn in depth order)
    items.sort((a, b) => a.key - b.key || a.h - b.h || a.x - b.x);
    const t = G.time;
    for (const it of items) this.drawTile(c, it, world, dark, t);
    // cracks on china
    for (const [k, n] of m.cracks) { const [x, y] = k.split(',').map(Number); const s = toScreen(x, y, this.hAt(x, y)); c.fillStyle = '#5a6a8a'; c.fillRect(s.x + ox - 6, s.y + oy + 7, 12, 1); c.fillRect(s.x + ox - 2, s.y + oy + 5, 1, 5); if (n > 1) c.fillRect(s.x + ox + 3, s.y + oy + 4, 1, 6); }
    // ground pieces (walkable props: bridge, raft, weir)
    for (const p of m.props) if (p.ground) this.drawProp(c, p, ox, oy, null);
    if (def.drawGround) def.drawGround(this, c, ox, oy);
    this.drawMarker(c, ox, oy);
    // sorted pass: occluding tiles, props (in strips), actors
    const sorted = [];
    for (const it of items) {
      if (it.t.wall || it.t.hedge || this.occludes(it.tx, it.ty)) sorted.push({ k: it.key, h: it.h, x: it.tx, draw: (cc = c) => this.drawTile(cc, it, world, dark, t, true) });
    }
    for (const p of m.props) if (!p.ground) this.queueProp(sorted, p, c, ox, oy);
    const addActor = (a, extra = {}) => {
      const fs = a === this.b ? this.bScreen() : this.footScreen(a);
      let kx = a.x, ky = a.y; if (a.hop) { kx = Math.max(a.hop.fx, a.hop.tx); ky = Math.max(a.hop.fy, a.hop.ty); }
      sorted.push({ k: kx + ky + 0.5 + (extra.bias || 0), h: 9, x: kx, me: a === this.b, draw: (cc = c) => {
        if (a.hidden) return;
        const r = drawActor(cc, a, Math.round(fs.x + ox), Math.round(fs.y + oy), extra);
        if (r) a._rect = { x: r.x - ox, y: r.y - oy, w: r.w, h: r.h };
        a._fs = { x: fs.x + ox, y: fs.y + oy };
      } });
    };
    for (const a of m.actors) addActor(a, a.alpha !== undefined && a.alpha < 1 ? { alpha: a.alpha } : {});   // a.alpha: a map hook can fade a big figure
    for (const e of m.enemies) addActor(e, { bob: e.hop ? undefined : e.bob });
    for (const f of this.followers) { if (f.merge >= 1) continue; addActor(f, { merge: f.merge, bias: -0.01 }); }
    this.b.size = this.size; addActor(this.b, { bias: 0.01 });
    sorted.sort((a, b) => a.k - b.k || a.h - b.h || a.x - b.x);
    // whatever is drawn after (over) Bramble goes on a layer, so his outline can show through it (drawGhost)
    const bi = sorted.findIndex(s => s.me);
    for (let i = 0; i < sorted.length; i++) { if (i === bi + 1) this.layer(true); sorted[i].draw(i > bi && bi >= 0 ? this.lay : c); }
    if (bi >= 0 && bi < sorted.length - 1) { c.drawImage(this.lay.canvas, 0, 0); this.drawGhost(c); }
    this.drawChevron(c);
    // enemy facing chevrons
    for (const e of m.enemies) {
      if (e.hop || e.still) continue;
      const [dx, dy] = DIRS[e.facing]; const s = toScreen(e.x + dx * 0.55, e.y + dy * 0.55, this.hAt(e.x, e.y));
      c.fillStyle = e.chasing ? 'rgba(220,90,70,0.8)' : 'rgba(240,230,210,0.55)';
      const cx = s.x + ox, cy = s.y + oy + 8; c.fillRect(cx - 1, cy - 1, 3, 3);
      if (e.chasing) { c.fillStyle = '#e05a40'; c.fillRect(e._fs ? e._fs.x - 1 : cx, e._fs ? e._fs.y - 40 : cy - 40, 3, 6); c.fillRect(e._fs ? e._fs.x - 1 : cx, e._fs ? e._fs.y - 32 : cy - 32, 3, 2); }
    }
    if (def.drawOver) def.drawOver(this, c, ox, oy);
    // fx
    for (const f of this.fx) this.drawFx(c, f, ox, oy);
    // emotes on actors
    for (const a of [this.b, ...m.actors, ...this.followers]) if (a.emote && a._fs) this.drawEmote(c, a);
    if (dark > 0 && def.vignette !== false) this.vignette(c, dark);
    if (def.tint) { c.fillStyle = def.tint; c.fillRect(0, 0, W, H); }
    // bubbles
    for (const bb of this.bubbles) this.drawBubble(c, bb);
    // HUD
    if (!this.hideHud) this.drawHud(c, isTop);
    fade(c, this.fadeA);
    if (this.iris > 0) this.drawIris(c, this.iris);
  }
  // the over-Bramble layer (a W x H canvas, cleared each frame)
  layer(clear) {
    if (!this.lay) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; this.lay = cv.getContext('2d'); this.lay.imageSmoothingEnabled = false; }
    if (clear) this.lay.clearRect(0, 0, W, H);
    return this.lay;
  }
  // Bramble's outline wherever something was drawn over him (tall props, columns, crowds): his ghost masked by the layer
  drawGhost(c) {
    const b = this.b, r = b._rect; if (b.hidden || !r || this.hideHud) return;
    const { img } = actorFrame(b), g = ghostOf(img);
    if (!this.gh) { const cv = document.createElement('canvas'); cv.width = 96; cv.height = 96; this.gh = cv.getContext('2d'); }
    const gx = this.gh, x0 = r.x + this.ox - 2, y0 = r.y + this.oy - 2;
    gx.globalCompositeOperation = 'source-over'; gx.clearRect(0, 0, 96, 96);
    gx.drawImage(g, 0, 0);
    gx.globalCompositeOperation = 'destination-in';
    gx.drawImage(this.lay.canvas, x0, y0, g.width, g.height, 0, 0, g.width, g.height);
    gx.globalCompositeOperation = 'source-over';
    c.drawImage(this.gh.canvas, 0, 0, g.width, g.height, Math.round(x0), Math.round(y0), g.width, g.height);
  }
  // when Bramble is small (Wonderland) or in a crowd (the ending), a little gold chevron bobs over his head too
  drawChevron(c) {
    const b = this.b, r = b._rect; if (!r || b.hidden || this.hideHud) return;
    const crowd = this.map.actors.filter(a => !a.hidden && Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 5).length >= 4;
    if (this.size !== 'small' && !crowd) return;
    const x = Math.round(r.x + this.ox + r.w / 2), y = Math.round(r.y + this.oy - 7 + Math.sin(G.time * 4) * 1.5);
    c.fillStyle = P.bark; c.fillRect(x - 4, y - 1, 9, 3); c.fillRect(x - 3, y + 2, 7, 2); c.fillRect(x - 2, y + 4, 5, 1); c.fillRect(x - 1, y + 5, 3, 1);
    c.fillStyle = P.gold; c.fillRect(x - 3, y, 7, 1); c.fillRect(x - 2, y + 1, 5, 1); c.fillRect(x - 1, y + 2, 3, 1); c.fillRect(x, y + 3, 1, 1);
  }
  // a small soft ring on the ground under Bramble (gold, pixel-crisp, gently breathing)
  drawMarker(c, ox, oy) {
    const b = this.b; if (!b || b.hidden || this.hideHud) return;
    const s = this.bScreen(), x = Math.round(s.x + ox), y = Math.round(s.y + oy);
    const big = this.size === 'big', small = this.size === 'small';
    const hw = big ? 11 : small ? 6 : 9, hh = big ? 4 : small ? 2 : 3;
    const ring = (dx, dy) => {
      c.fillRect(x - hw + 3 + dx, y - hh - 1 + dy, 2 * hw - 6, 1); c.fillRect(x - hw + 3 + dx, y + hh + dy, 2 * hw - 6, 1);
      c.fillRect(x - hw + 1 + dx, y - hh + dy, 2, 1); c.fillRect(x + hw - 3 + dx, y - hh + dy, 2, 1);
      c.fillRect(x - hw + 1 + dx, y + hh - 1 + dy, 2, 1); c.fillRect(x + hw - 3 + dx, y + hh - 1 + dy, 2, 1);
      c.fillRect(x - hw + dx, y - hh + 1 + dy, 1, 2 * hh - 2); c.fillRect(x + hw - 1 + dx, y - hh + 1 + dy, 1, 2 * hh - 2);
    };
    c.save(); c.globalAlpha = 0.45; c.fillStyle = P.bark; ring(0, 1);     // a dark under-rim so it reads on pale ground
    c.globalAlpha = 0.8 + 0.2 * Math.sin(G.time * 3); c.fillStyle = P.gold; ring(0, 0);
    c.restore();
  }
  occludes(x, y) {
    const h = this.hAt(x, y); if (h <= 0) return false;
    return this.hAt(x - 1, y) < h || this.hAt(x, y - 1) < h || this.hAt(x - 1, y - 1) < h;
  }
  drawTile(c, it, world, dark, t, again) {
    const { tx: x, ty: y, h, sx, sy } = it, T = it.t;
    if (T.water) { const below = Math.max(0, h); const side = below; c.drawImage(tileImage(world, T.k === 'lava' ? 'lava' : 'earth', side, 0, dark), sx - 16, sy + 3); drawWater(c, world, sx - 16, sy + 1, t, x, y); return; }
    const side = T.wall ? h : Math.max(h, 1);
    const kind = T.wall ? (T.k === 'rock' ? 'rock' : 'wall') : T.hedge ? 'hedge' : T.k;
    const img = tileImage(world, kind, side, (x * 7 + y * 13) % 3, dark);
    c.drawImage(img, sx - 16, sy);
    if (T.hedge) { // a hedge is a raised green block with a leafy top
      c.fillStyle = 'rgba(30,60,30,0.35)'; c.fillRect(sx - 8, sy + 4, 16, 2);
    }
  }
  queueProp(sorted, p, c, ox, oy) {
    const img = propImg(p.id);
    const fw = p.w, fh = p.h;
    // footprint screen box: left corner of tile (x, y+h-1), right corner of (x+w-1, y), bottom corner of (x+w-1, y+h-1)
    const hh = this.hAt(p.x, p.y) < 0 ? 0 : this.hAt(p.x, p.y);
    const left = toScreen(p.x, p.y + fh - 1, hh).x - 16, right = toScreen(p.x + fw - 1, p.y, hh).x + 16;
    const bottom = toScreen(p.x + fw - 1, p.y + fh - 1, hh).y + 16;
    const cx = (left + right) / 2;
    const im = img || placeholder(Math.max(16, (fw + fh) * 14), p.ph || 32, '#7a8a5a');
    const dx = Math.round(cx - im.width / 2 + ox + (p.dx || 0)), dy = Math.round(bottom - im.height + oy + (p.dy || 0) + (p.sink || 2));
    const key = p.x + p.y + fw - 1 + fh - 1;
    p._rect = { x: dx - ox, y: dy - oy, w: im.width, h: im.height, im };   // for clicks on the drawn sprite (clickAt)
    if ((fw === 1 && fh === 1) || p.whole) { sorted.push({ k: p.whole ? key : p.x + p.y, h: hh + 0.5, x: p.x, draw: (cc = c) => { if (!p.hidden) cc.drawImage(im, dx, dy); } }); return; }
    // strips: one 16-px column per diagonal step, sorted by the frontmost footprint tile covering it
    const cols = fw + fh; const colW = im.width / cols;
    for (let i = 0; i < cols; i++) {
      // column i covers screen x in [left + i*16, left + (i+1)*16]; frontmost tile whose diamond spans it
      let kmax = -1;
      for (let a = 0; a < fw; a++) for (let b = 0; b < fh; b++) {
        const col = (a - b) + (fh - 1); // tile (x+a, y+b) left corner column index
        if (col === i || col + 1 === i) kmax = Math.max(kmax, p.x + a + p.y + b);
      }
      if (kmax < 0) kmax = key;
      const sx0 = Math.floor(i * colW), sw = Math.floor((i + 1) * colW) - sx0;
      sorted.push({ k: kmax, h: hh + 0.5, x: p.x, draw: (cc = c) => { if (!p.hidden) cc.drawImage(im, sx0, 0, sw, im.height, dx + sx0, dy, sw, im.height); } });
    }
  }
  drawProp(c, p, ox, oy) {
    const img = propImg(p.id); const fw = p.w, fh = p.h;
    const hh = Math.max(0, this.hAt(p.x, p.y) + (p.lift || 0));
    const left = toScreen(p.x, p.y + fh - 1, hh).x - 16, right = toScreen(p.x + fw - 1, p.y, hh).x + 16;
    const bottom = toScreen(p.x + fw - 1, p.y + fh - 1, hh).y + 16;
    const im = img || placeholder((fw + fh) * 16, 16, '#8a6a4a');
    c.drawImage(im, Math.round((left + right) / 2 - im.width / 2 + ox), Math.round(bottom - im.height + oy + 2));
  }
  drawFx(c, f, ox, oy) {
    const k = f.t / f.life;
    if (f.k === 'dust') { c.fillStyle = `rgba(230,220,200,${0.6 * (1 - k)})`; const r = 2 + k * 6; c.fillRect(Math.round(f.x + ox - r), Math.round(f.y + oy - 2 - k * 3), 2, 2); c.fillRect(Math.round(f.x + ox + r - 2), Math.round(f.y + oy - 2 - k * 3), 2, 2); }
    else if (f.k === 'puff') { c.fillStyle = `rgba(250,245,235,${0.8 * (1 - k)})`; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; c.fillRect(Math.round(f.x + ox + Math.cos(a) * (3 + k * 9)), Math.round(f.y + oy + Math.sin(a) * (2 + k * 5)), 2, 2); } }
    else if (f.k === 'heart') { c.globalAlpha = 1 - k; drawHeart(c, Math.round(f.x + ox - 3), Math.round(f.y + oy - k * 10)); c.globalAlpha = 1; }
    else if (f.k === 'spark') { c.fillStyle = `rgba(255,240,180,${1 - k})`; c.fillRect(Math.round(f.x + ox), Math.round(f.y + oy - k * 8), 2, 2); }
  }
  drawEmote(c, a) {
    const x = Math.round(a._fs.x), y = Math.round(a._fs.y - (a._rect ? a._rect.h : 30) - 10);
    c.fillStyle = P.bark; c.fillRect(x - 6, y - 7, 13, 12); c.fillStyle = P.chalk; c.fillRect(x - 5, y - 6, 11, 10);
    c.fillRect(x - 1, y + 4, 3, 2);
    if (a.emote === 'heart') drawHeart(c, x - 3, y - 4);
    else ui.text(a.emote, x + 0.5, y + 2.5, { align: 'center', size: 9, color: P.bark, shadow: false });
  }
  drawBubble(c, bb) {
    // over the follower's sprite, or the HUD portrait while tucked in
    const f = this.followers.find(f => f.id === bb.who);
    let x, y;
    if (f && f.merge < 1 && f._fs) { x = f._fs.x; y = f._fs.y - (f._rect ? f._rect.h : 30) - 8; }
    else { const i = travelling().indexOf(bb.who); x = 18 + i * 40 + 30; y = 52; }
    const lines = ui.wrap(bb.text, 150, 9), w = Math.min(160, Math.max(...lines.map(l => ui.measure(l, 9)))) + 12, h = lines.length * 10 + 8;
    let bx = clamp(Math.round(x - w / 2), 4, W - w - 4), by = clamp(Math.round(y - h), 44, H - h - 30);
    c.globalAlpha = Math.min(1, bb.t * 2);
    c.fillStyle = P.bark; c.fillRect(bx - 1, by, w + 2, h); c.fillRect(bx, by - 1, w, h + 2);
    c.fillStyle = P.paper; c.fillRect(bx, by, w, h);
    c.fillStyle = P.paper; c.fillRect(clamp(x - 2, bx + 4, bx + w - 8), by + h, 4, 3);
    c.globalAlpha = 1;
    lines.forEach((l, i) => ui.text(l, bx + 6, by + 12 + i * 10, { size: 9, color: P.bark, shadow: false, alpha: Math.min(1, bb.t * 2) }));
  }
  vignette(c, d) {
    const g = c.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 380);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(5,5,15,${0.75 * d})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  drawIris(c, k) {
    // a rabbit-hole iris: everything outside a shrinking circle goes dark
    const s = this.bScreen(); const x = s.x + this.ox, y = s.y + this.oy - 12;
    const r = (1 - k) * 420;
    c.save(); c.fillStyle = '#0a0810'; c.beginPath(); c.rect(0, 0, W, H); c.arc(x, y, Math.max(0, r), 0, Math.PI * 2, true); c.fill('evenodd'); c.restore();
  }
  drawHud(c, isTop) {
    // party faces
    const ids = travelling();
    ids.forEach((id, i) => {
      const x = 6 + i * 40, y = 6, m = member(id);
      drawFace(c, id, x, y, 32);
      bar(c, x, y + 35, 32, 3, m.hp / maxHp(id), P.heart);
      bar(c, x, y + 40, 32, 2, m.pl / maxPl(id), P.pluck);
      const f = this.followers.find(f => f.id === id);
      if (f && f.merge >= 1) { c.fillStyle = P.sage; c.fillRect(x + 25, y + 1, 6, 4); c.fillRect(x + 27, y, 2, 1); c.fillStyle = '#4e7a40'; c.fillRect(x + 26, y + 2, 4, 1); }
    });
    // place name
    if (this.placeT > 0 && G.s.placeName) {
      const a = Math.min(1, this.placeT);
      ui.text(G.s.placeName, W / 2, 26, { align: 'center', size: 14, alpha: a, color: P.chalk });
    }
    // buttons: camp, pause, mute
    if (isTop && !this.busy) {
      if (button(c, '', W - 70, 6, 20, 20, { icon: 'ico-camp', hitLabel: 'Camp' })) this.hudClick = () => this.openCamp();
      if (button(c, '', W - 47, 6, 20, 20, { icon: 'ico-pause', hitLabel: 'Pause' })) this.hudClick = () => this.openPause();
      if (button(c, '', W - 24, 6, 20, 20, { icon: G.settings.mute ? 'ico-mute-on' : 'ico-mute-off', hitLabel: 'Mute' })) this.hudClick = () => { G.settings.mute = !G.settings.mute; audio.applyVolumes(); import('../engine/save.js').then(m => m.saveSettings()); };
      this.drawHudGlyphs(c);
      // with a controller: the button for each HUD icon under it
      if (input.device === 'pad' && G.settings.keyHints !== false) { glyph(c, 'triangle', W - 66, 28); glyph(c, 'options', W - 44, 28); }
    }
    // quest line
    if (G.s.quest && !this.busy) {
      const quest = padWords(G.s.quest);
      const w = Math.min(560, ui.measure(quest, 9) + 26);
      c.fillStyle = 'rgba(18,14,24,0.7)'; c.fillRect((W - w) / 2, H - 20, w, 16);
      drawIcon(c, 'ico-quest', (W - w) / 2 + 3, H - 20, 16);
      ui.text(quest, (W - w) / 2 + 21, H - 8, { size: 9, color: P.chalk });
    }
    if (G.settings.gridKeys) this.drawCompass(c);
  }
  drawHudGlyphs(c) {
    // fallback glyphs when the icon images are missing
    const glyph = (x, y, kind) => {
      c.fillStyle = P.chalk;
      if (kind === 'camp') { c.fillRect(x + 5, y + 12, 10, 2); c.fillRect(x + 7, y + 8, 6, 4); c.fillRect(x + 9, y + 5, 2, 3); }
      if (kind === 'pause') { c.fillRect(x + 6, y + 5, 3, 10); c.fillRect(x + 11, y + 5, 3, 10); }
      if (kind === 'mute') { c.fillRect(x + 5, y + 8, 3, 4); c.fillRect(x + 8, y + 6, 2, 8); c.fillRect(x + 10, y + 4, 2, 12); if (G.settings.mute) { c.fillStyle = P.red; for (let i = 0; i < 6; i++) c.fillRect(x + 12 + i * 0.5, y + 6 + i, 1, 1); } else { c.fillRect(x + 14, y + 7, 1, 6); } }
    };
    import('../engine/assets.js').then(() => {});
    if (!G._iconsChecked) { G._iconsChecked = true; }
    const has = n => !!document && (window.__icons || {})[n];
    if (!has('ico-camp')) glyph(W - 70, 6, 'camp');
    if (!has('ico-pause')) glyph(W - 47, 6, 'pause');
    if (!has('ico-mute-off')) glyph(W - 24, 6, 'mute');
  }
  drawCompass(c) {
    const x = W - 30, y = 50;
    c.fillStyle = 'rgba(18,14,24,0.6)'; c.fillRect(x - 22, y - 14, 44, 30);
    ui.text('↑', x + 10, y - 2, { size: 8 }); ui.text('→', x + 12, y + 12, { size: 8 });
  }

  // visibilitychange and blur both fire on a tab switch: guard so only one menu ever opens (the import is async)
  openCamp(tab) { this.openMenu('camp', () => import('../screens/camp.js').then(m => new m.CampScene(this, tab))); }
  // controller: Create/View opens the camp on its Map tab
  onPad(name) { if (name !== 'create') return false; if (this.map && !this.busy && !this.leaving) this.openCamp('Map'); return true; }
  openPause() { this.openMenu('pause', () => import('../screens/pause.js').then(m => new m.PauseScene())); }
  openMenu(kind, make) {
    if (this.opening || findScene('pause') || findScene('camp')) return;
    this.opening = true;
    make().then(sc => { this.opening = false; if (!findScene('pause') && !findScene('camp') && G.scenes.includes(this)) pushScene(sc); }, () => { this.opening = false; });
  }
  onBlur() { if (!this.busy) this.openPause(); }

  // debug-hook summary
  summary() {
    if (!this.map) return null;
    return {
      map: this.map.id, tile: { x: this.b.x, y: this.b.y }, height: this.hAt(this.b.x, this.b.y), size: this.size, facing: this.b.facing,
      moving: !!this.b.hop, busy: this.busy > 0,
      followers: this.followers.map(f => ({ id: f.id, x: f.x, y: f.y, facing: f.facing, merged: f.merge >= 1, escort: !!f.escort })),
      enemies: this.map.enemies.map(e => ({ id: e.id, type: e.type, x: e.x, y: e.y, facing: e.facing, chasing: e.chasing })),
      npcs: this.map.actors.filter(a => !a.hidden).map(a => ({ id: a.id, x: a.x, y: a.y })),
      doors: (this.map.def.doors || []).map(d => ({ x: d.x, y: d.y, to: d.to })),
      gaze: this.map.def.gazeState ? this.map.def.gazeState(this) : undefined,
    };
  }
}
function drawHeart(c, x, y) { c.fillStyle = '#d9604a'; c.fillRect(x, y + 1, 2, 2); c.fillRect(x + 3, y + 1, 2, 2); c.fillRect(x, y + 2, 5, 2); c.fillRect(x + 1, y + 4, 3, 1); c.fillRect(x + 2, y + 5, 1, 1); }
// seen-tile bitsets (G.s.seen[mapId]): 6 tiles per base64 character
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function encodeBits(bits) { let s = ''; for (let i = 0; i < bits.length; i += 6) { let v = 0; for (let j = 0; j < 6; j++) if (bits[i + j]) v |= 1 << j; s += B64[v]; } return s; }
export function seenBits(mapId, n) {
  const bits = new Uint8Array(n), s = (G.s && G.s.seen && G.s.seen[mapId]) || '';
  for (let c = 0; c < s.length; c++) { const v = B64.indexOf(s[c]); for (let j = 0; j < 6; j++) if (v & (1 << j) && c * 6 + j < n) bits[c * 6 + j] = 1; }
  return bits;
}
// alpha test for clicks on a prop's drawn sprite (cached per image)
const alphaCache = new Map();
function opaqueAt(im, x, y) {
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= im.width || y >= im.height) return false;
  let d = alphaCache.get(im);
  if (!d) {
    try { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0); d = cx.getImageData(0, 0, im.width, im.height).data; }
    catch (e) { d = null; }
    alphaCache.set(im, d || 'all');
    if (!d) return true;
  }
  return d === 'all' || d[(y * im.width + x) * 4 + 3] > 40;
}
// Bramble's see-through outline: a 1 px gold rim and a dark halo round a faint chalk fill, 2 px larger on every side
const ghostCache = new Map();
function ghostOf(img) {
  let g = ghostCache.get(img); if (g) return g;
  const w = img.width, h = img.height;
  const src = document.createElement('canvas'); src.width = w; src.height = h; src.getContext('2d').drawImage(img, 0, 0);
  const a = src.getContext('2d').getImageData(0, 0, w, h).data;
  const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 60;
  g = document.createElement('canvas'); g.width = w + 4; g.height = h + 4;
  const gx = g.getContext('2d'), out = gx.createImageData(w + 4, h + 4), o = out.data;
  const near = (x, y) => op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1);
  const near2 = (x, y) => near(x - 1, y) || near(x + 1, y) || near(x, y - 1) || near(x, y + 1);
  for (let y = -2; y <= h + 1; y++) for (let x = -2; x <= w + 1; x++) {
    const i = ((y + 2) * (w + 4) + (x + 2)) * 4;
    const set = (r, gg, b, al) => { o[i] = r; o[i + 1] = gg; o[i + 2] = b; o[i + 3] = al; };
    if (op(x, y)) { const rim = !op(x - 1, y) || !op(x + 1, y) || !op(x, y - 1) || !op(x, y + 1); set(239, 232, 214, rim ? 200 : 70); }
    else if (near(x, y)) set(232, 201, 90, 235);          // gold rim
    else if (near2(x, y)) set(62, 42, 30, 150);           // a dark bark halo so the rim reads on pale stone too
  }
  gx.putImageData(out, 0, 0);
  ghostCache.set(img, g); return g;
}
