// The debug hook for play-testing: read state, list pressable things, and jump to a segment.
import { G, hits, topScene, findScene, replaceScenes } from './core.js';
import { audio } from './engine/audio.js';
import { toScreen } from './engine/iso.js';
import { view } from './main.js';
import { newGame, addMember, travelling, member, maxHp, maxPl, giveItem, setActive, healAll } from './state.js';
import { PARTY } from './data/core/party.js';
import { input } from './engine/input.js';
import { pad, padWords } from './engine/pad.js';

function css(x, y) { return { x: (view.OX + x * view.K) / view.DPR, y: (view.OY + y * view.K) / view.DPR }; }

export function installHook() {
  const hook = {
    state() {
      const top = topScene(), ex = findScene('explore');
      const seg = G.segment != null ? G.data.segments[G.segment] : null;
      const dlg = findScene('dialog');
      return {
        screen: top ? top.kind : null, scenes: G.scenes.map(s => s.kind),
        segment: seg ? seg.id : null, segmentIndex: G.segment, chapter: G.s ? G.s.chapter : null,
        ...(ex && ex.map ? ex.summary() : {}),
        flags: G.s ? { ...G.s.flags } : {}, quest: G.s ? padWords(G.s.quest) : '',
        party: G.s ? travelling() : [], reserve: G.s ? G.s.party.order.filter(id => !travelling().includes(id)) : [],
        members: G.s ? Object.fromEntries(Object.entries(G.s.party.members).map(([id, m]) => [id, { lvl: m.lvl, hp: m.hp, maxHp: maxHp(id), pl: m.pl, maxPl: maxPl(id), gear: { ...m.gear } }])) : {},
        buttons: G.s ? G.s.buttons : 0, items: G.s ? { ...G.s.items, ...G.s.keyItems } : {},
        dialog: dlg ? { open: true, speaker: dlg.o.who, text: dlg.o.text, choices: dlg.o.choices || null, full: dlg.shown >= dlg.total } : { open: false },
        battle: findScene('battle') ? findScene('battle').summary() : null,
        segmentComplete: !!(seg && G.s && seg.done && seg.done(G.s)), gameWon: !!(G.s && G.s.flags.g_won), ng: G.s && G.s.ng ? G.s.ng.cycle || 0 : 0, playTime: G.s ? G.s.playTime : 0,
        paused: !!G.paused,
        device: input.device, padKind: input.padKind, padSeen: input.padSeen, padOff: pad.off, hints: (G.hintsShown || []).slice(), toast: G.flash ? G.flash.msg : null,
      };
    },
    levels() { return G.data.segments.map((s, i) => ({ n: i, id: s.id, name: s.name })); },
    async goToLevel(n) {
      let seg = G.data.segments[n]; if (!seg) throw new Error('no segment ' + n);
      G.segment = n;
      // New Game+ segments (data/ng/index.js): a base segment's start with the NG+ carry, every member at least seg.ng.level
      if (seg.base) {
        const b = G.data.segments.find(x => x.id === seg.base); if (!b) throw new Error('no base segment ' + seg.base);
        const L = (seg.ng && seg.ng.level) || 27;
        seg = { ...b, ...seg, party: (seg.party || b.party || []).map(([id, l]) => [id, Math.max(l, L)]), flags: { ...(b.flags || {}), ...(seg.flags || {}) } };
      }
      newGame();
      if (seg.ng) G.s.ng = { cycle: seg.ng.cycle || 1, levels: Object.fromEntries(Object.keys(PARTY).map(id => [id, seg.ng.level || 27])), xp: {}, prevTime: 0, from: 0 };
      for (const [id, lvl] of seg.party || []) if (id !== 'bramble') addMember(id, lvl); else member('bramble').lvl = lvl;
      for (const [id, lvl] of seg.party || []) { const m = member(id); m.lvl = lvl; }
      if (seg.active) setActive(seg.active);
      healAll();
      Object.assign(G.s.flags, seg.flags || {});
      for (const [id, n2] of Object.entries(seg.items || {})) giveItem(id, n2);
      for (const [id, n2] of Object.entries(seg.gear || {})) giveItem(id, n2);
      if (seg.equip) { const { autoEquip } = await import('./state.js'); autoEquip(); }
      G.s.buttons = seg.buttons || 0; G.s.chapter = seg.chapter || 0; G.s.memories = (seg.memories || []).slice(); G.s.armyGear = { ...(seg.armyGear || {}) };
      G.s.quest = seg.quest || '';
      const { ExploreScene } = await import('./world/explore.js');
      const ex = new ExploreScene(); replaceScenes(ex);
      G.s.lastDoor = { map: seg.map, x: seg.x, y: seg.y, f: seg.facing || 'se' };
      if (seg.escorts) ex.escorts = seg.escorts.map(e => typeof e === 'string' ? { id: e, sprite: e } : e);
      await ex.load(seg.map, seg.x, seg.y, seg.facing || 'se', { noEnter: !seg.enter });
      if (seg.script) ex.queueScript(seg.script);
      return true;
    },
    audioState() { return audio.state(); },
    buttons() { return hits.list.map(h => { const a = css(h.x, h.y), b = css(h.x + h.w, h.y + h.h); return { label: h.label, x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, disabled: !!h.disabled, node: h.node, squad: h.squad }; }); },
    tileToScreen(x, y) {
      const rts = findScene('rts'); if (rts && topScene() === rts) { const p = rts.w2s(x, y); return css(p.x, p.y); }
      const ex = findScene('explore'); if (!ex || !ex.map) return null;
      const s = toScreen(x, y, ex.hAt(x, y)); return css(s.x + ex.ox, s.y + 8 + ex.oy);
    },
    battleState() { const b = findScene('battle'); return b ? b.summary() : null; },
    rtsState() { const r = findScene('rts'); return r ? r.summary() : null; },
  };
  window.__game = hook;
  if (G.debug) {
    hook.dev = {
      warp: async (map, x, y) => { const ex = findScene('explore'); await ex.load(map, x, y, 'se'); },
      setFlags: (o) => Object.assign(G.s.flags, o), give: (id, n) => giveItem(id, n), recruit: (id, l) => addMember(id, l),
      level: (n) => { for (const m of Object.values(G.s.party.members)) m.lvl = n; healAll(); },
      winBattle: () => { const b = findScene('battle'); if (b) { for (const e of b.sim.enemies) { e.hp = 0; e.ko = true; } b.sim.result = 'win'; } },
      G,
    };
  }
}
