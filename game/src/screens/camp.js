// The camp menu (Tab): Party, Talk, Gear, Items, Army, Quests, Map, Bestiary.
import { G, W, H, ui, pushScene, popScene, clamp, hits, toast } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { panel, button, bar, drawFace, drawIcon, drawPortrait, mouseIn, clickIn } from '../engine/gfx.js';
import { P, WORLD } from '../data/core/palette.js';
import { PARTY, SKILLS } from '../data/core/party.js';
import { ITEMS, KEY_ITEMS, gearInfo, ARMY_GEAR } from '../data/core/items.js';
import { SQUADS, KINDS } from '../data/core/squads.js';
import * as st from '../state.js';
import { runScript } from '../world/script.js';

const TABS = ['Party', 'Talk', 'Gear', 'Items', 'Army', 'Quests', 'Map', 'Bestiary'];
export function areaOf() { const m = G.data.maps[G.s.map]; return (m && m.area) || G.s.map; }
// Talk entries available now: [{who, title, run}] (1-2 lines per member per area, plus pair banters)
export function talkEntries() {
  const area = areaOf(), out = [];
  const trav = st.travelling();
  const B = G.data.banter || {};
  for (const id of trav) {
    if (id === 'bramble') continue;
    const L = (B['talk.' + area] || []).filter(l => l.who === id && (!l.cond || l.cond()));
    if (L.length) out.push({ who: id, title: PARTY[id].name, key: 'talk_' + area + '_' + id, lines: L.map(l => [id, l.line]) });
  }
  for (const pb of B.pairs || []) {
    if (!trav.includes(pb.a) || !trav.includes(pb.b)) continue;
    if (pb.area && pb.area !== area) continue;
    if (pb.cond && !pb.cond()) continue;
    out.push({ who: pb.a, title: `${PARTY[pb.a].name} and ${PARTY[pb.b].name}`, key: 'pair_' + pb.id, lines: pb.lines, pair: true });
  }
  return out;
}
export function hasNewTalk() { return talkEntries().some(e => !G.s.flags['heard_' + e.key]); }

export class CampScene {
  constructor(ex) { this.kind = 'camp'; this.opaque = false; this.ex = ex; this.tab = 0; this.sel = 0; this.sub = 0; this.focus = 'tabs'; this.slotSel = 0; this.mode = null; G.paused = true; }
  exit() { G.paused = false; }
  close() { popScene(this); this.ex.buildFollowers(false); }
  update() {
    if (this.busy) return;
    if (input.isPressed('Tab') || input.isPressed('KeyI') || (input.back() && !this.mode)) { audio.synth('cancel'); this.close(); input.eatAll(); return; }
    if (input.back() && this.mode) { this.mode = null; audio.synth('cancel'); return; }
    if (input.isPressed('KeyQ') || (input.left() && !this.mode && this.tabHasNoLeftRight())) { this.tab = (this.tab + TABS.length - 1) % TABS.length; this.sel = 0; this.scrollStart = 0; audio.synth('move'); }
    if (input.isPressed('KeyE') || (input.right() && !this.mode && this.tabHasNoLeftRight())) { this.tab = (this.tab + 1) % TABS.length; this.sel = 0; this.scrollStart = 0; audio.synth('move'); }
    const n = this.count();
    if (n) {
      if (input.up()) { this.sel = (this.sel + n - 1) % n; audio.synth('move'); }
      if (input.down()) { this.sel = (this.sel + 1) % n; audio.synth('move'); }
      if (input.isPressed('Space') || input.isPressed('Enter')) this.activate(this.sel);
    }
  }
  tabHasNoLeftRight() { return true; }
  count() {
    switch (TABS[this.tab]) {
      case 'Party': return G.s.party.order.length;
      case 'Talk': return talkEntries().length;
      case 'Gear': return this.mode === 'pick' ? this.gearList().length + 1 : st.travelling().length * 3;
      case 'Items': return this.mode === 'use' ? st.travelling().length : this.itemList().length;
      case 'Army': return this.armyRows().length;
      case 'Bestiary': return Object.keys(G.s.met).filter(k => G.data.bestiary && G.data.bestiary[k]).length;
      default: return 0;
    }
  }
  activate(i) {
    const tab = TABS[this.tab];
    if (tab === 'Party') {
      const id = G.s.party.order[i]; if (id === 'bramble') { toast('Bramble always leads.'); return; }
      const act = G.s.party.active.slice();
      if (act.includes(id)) { if (act.length <= 1 && G.s.party.order.length > 1) { act.splice(act.indexOf(id), 1); } else act.splice(act.indexOf(id), 1); }
      else { if (act.length >= 2) act.shift(); act.push(id); }
      st.setActive(act); audio.synth('equip');
    }
    if (tab === 'Talk') { const e = talkEntries()[i]; if (e) this.playTalk(e); }
    if (tab === 'Gear') {
      if (this.mode === 'pick') {
        const list = this.gearList(); const [mid, slot] = this.gearTarget;
        const g = i === 0 ? null : list[i - 1];
        if (st.equip(mid, slot, g)) audio.synth('equip'); else audio.synth('cancel');
        this.mode = null; this.sel = this.prevSel;
      } else { const ids = st.travelling(); this.gearTarget = [ids[Math.floor(i / 3)], ['tool', 'coat', 'charm'][i % 3]]; this.prevSel = i; this.mode = 'pick'; this.sel = 0; }
    }
    if (tab === 'Items') {
      const list = this.itemList();
      if (this.mode === 'use') {
        const id = this.useItem, x = ITEMS[id].use, mid = st.travelling()[i], m = st.member(mid);
        if (x.heal) { m.hp = Math.min(st.maxHp(mid), m.hp + x.heal); }
        else if (x.healAll) for (const t of st.travelling()) { const mm = st.member(t); mm.hp = Math.min(st.maxHp(t), mm.hp + x.healAll); }
        else if (x.pluck) m.pl = Math.min(st.maxPl(mid), m.pl + x.pluck);
        else if (x.pluckAll) for (const t of st.travelling()) { const mm = st.member(t); mm.pl = Math.min(st.maxPl(t), mm.pl + x.pluckAll); }
        else { toast('That\'s for battles.'); this.mode = null; return; }
        st.takeItem(id); audio.sfx('heal'); this.mode = null; this.sel = 0;
      } else { const id = list[i];
        if (id === 'mushroom-halves') {
          const ex = this.ex; if (!(ex.map.def.world === 'wonder')) { toast('The mushroom only works in Wonderland.'); return; }
          const next = { normal: 'small', small: 'big', big: 'normal' }[ex.size];
          if (ex.setSize(next)) { toast(next === 'small' ? 'A nibble of one side: you shrink!' : next === 'big' ? 'A nibble of the other side: you grow!' : 'Back to your own size.'); this.close(); }
          return;
        }
        if (!id || !ITEMS[id]) return; const x = ITEMS[id].use; if (!(x.heal || x.healAll || x.pluck || x.pluckAll)) { toast('That one is for battles.'); return; } this.useItem = id; this.mode = 'use'; this.sel = 0; }
    }
  }
  async playTalk(e) {
    this.busy = true;
    G.s.flags['heard_' + e.key] = true;
    await runScript(async s => { for (const [who, text] of e.lines) await s.say(who, text); }, this.ex);
    this.busy = false;
  }
  gearList() {
    const [, slot] = this.gearTarget || [];
    return Object.keys(G.s.gear).filter(id => { const g = gearInfo(id); return g && g.slot === slot && st.gearFree(id) > 0; }).sort((a, b) => gearInfo(b).t - gearInfo(a).t);
  }
  itemList() { return [...Object.keys(G.s.items).filter(k => G.s.items[k] > 0), ...Object.keys(G.s.keyItems).filter(k => G.s.keyItems[k] > 0)]; }
  armyRows() { return st.ownedSquads(); }

  draw(c) {
    c.fillStyle = 'rgba(10,8,16,0.55)'; c.fillRect(0, 0, W, H);
    panel(c, 8, 8, W - 16, H - 16);
    // tabs
    TABS.forEach((t, i) => {
      const x = 16 + i * 76;
      const newTalk = t === 'Talk' && hasNewTalk();
      if (button(c, t, x, 14, 72, 18, { sel: i === this.tab, size: 9, hitLabel: 'tab:' + t })) { this.tab = i; this.sel = 0; this.scrollStart = 0; this.mode = null; }
      if (newTalk) { c.fillStyle = P.sage; c.fillRect(x + 62, 15, 7, 5); c.fillStyle = '#4e7a40'; c.fillRect(x + 63, 17, 5, 1); }
    });
    ui.text(`${G.s.buttons} buttons`, W - 94, H - 22, { align: 'right', size: 9, color: P.gold });
    ui.text('Q/E or click: tabs   Arrows + Space   Tab: close', 20, H - 16, { size: 8, color: '#8a7e9a' });
    if (button(c, 'Close', W - 86, H - 34, 64, 16, { size: 9 })) { this.close(); return; }
    const y0 = 42;
    this['draw' + TABS[this.tab]](c, y0);
  }
  // scrolling window for long lists: moves only to keep the selection in view (so hovering a row never shifts the
  // rows under the mouse), and with the mouse wheel
  win(n, per) {
    let st0 = this.scrollStart || 0;
    if (input.mouse.wheel) st0 += input.mouse.wheel > 0 ? 1 : -1;
    if (this.sel !== this.lastSel) { if (this.sel < st0) st0 = this.sel; if (this.sel >= st0 + per) st0 = this.sel - per + 1; this.lastSel = this.sel; }
    st0 = clamp(st0, 0, Math.max(0, n - per));
    this.scrollStart = st0; return st0;
  }
  // under a long list: which rows are showing, so a player knows there are more
  more(x, y, start, per, n) { if (n > per) ui.text(`${start + 1}-${Math.min(n, start + per)} of ${n}   (mouse wheel or arrows for more)`, x, y, { size: 8, color: '#b8acc8' }); }
  rowSel(i, x, y, w, h, label) {
    if (G.drawingTop) hits.add(label, x, y, w, h);
    if (mouseIn(x, y, w, h) && input.mouse.moved) this.sel = i;
    if (clickIn(x, y, w, h)) { input.mouse.pressed[0] = false; this.sel = i; this.activate(i); }
    if (i === this.sel) { c2.fillStyle = 'rgba(232,201,90,0.16)'; c2.fillRect(x, y, w, h); }
  }
  drawParty(c, y0) {
    c2 = c;
    const ids = G.s.party.order;
    ui.text('Bramble and two friends travel; everyone else waits in reserve (and swaps in during battles).', 20, y0 + 6, { size: 8, color: '#c8bca8' });
    const per = 12, start = this.win(ids.length, per);
    ids.slice(start, start + per).forEach((id, j) => {
      const i = start + j, y = y0 + 12 + j * 20, m = st.member(id);
      this.rowSel(i, 18, y, 250, 19, 'member:' + PARTY[id].name);
      drawFace(c, id, 22, y + 1, 17);
      const trav = id === 'bramble' || G.s.party.active.includes(id);
      ui.text(PARTY[id].name, 44, y + 13, { size: 9, color: trav ? P.gold : P.chalk });
      ui.text(trav ? 'travelling' : 'reserve', 168, y + 13, { size: 8, color: trav ? '#8de08a' : '#8a7e9a' });
      ui.text('Lv ' + m.lvl, 262, y + 13, { size: 8, align: 'right' });
    });
    this.more(22, y0 + 12 + per * 20 + 10, start, per, ids.length);
    // details
    const id = ids[this.sel]; if (!id) return;
    const m = st.member(id), s = st.stats(id), Pm = PARTY[id];
    drawPortrait(c, id, 280, y0 + 10);
    ui.text(Pm.name, 372, y0 + 22, { size: 12, color: P.gold });
    ui.text(`${Pm.role}  ·  Level ${m.lvl}`, 372, y0 + 36, { size: 9 });
    ui.text(`XP ${m.xp} / ${st.xpNext(m.lvl)}`, 372, y0 + 48, { size: 8, color: '#b8acc8' });
    bar(c, 372, y0 + 56, 120, 4, m.hp / s.hp, P.heart); ui.text(`Heart ${m.hp}/${s.hp}`, 500, y0 + 61, { size: 8 });
    bar(c, 372, y0 + 66, 120, 3, m.pl / s.pl, P.pluck); ui.text(`Pluck ${m.pl}/${s.pl}`, 500, y0 + 70, { size: 8 });
    const stats = [['Strength', s.str], ['Toughness', s.tgh], ['Speed', s.spd], ['Wits', s.wit]];
    stats.forEach(([k, v], i) => ui.text(`${k} ${v}`, 284 + (i % 2) * 90, y0 + 112 + Math.floor(i / 2) * 12, { size: 9 }));
    ui.text('Skills', 284, y0 + 146, { size: 9, color: P.gold });
    st.skillsOf(id).forEach((k, i) => ui.text(`${SKILLS[k].name} (${SKILLS[k].pl}): ${SKILLS[k].d}`, 284, y0 + 159 + i * 11, { size: 8 }));
    const next = Pm.skills.length > st.skillsOf(id).length ? Pm.skills[st.skillsOf(id).length] : null;
    if (next) ui.text(`Next at level ${st.skillsOf(id).length === 3 ? 10 : 20}: ${SKILLS[next].name}`, 284, y0 + 159 + st.skillsOf(id).length * 11, { size: 8, color: '#8a7e9a' });
    const sq = SQUADS[Pm.squad]; if (sq) ui.text(`Leads: ${sq.name} (${KINDS[sq.kind].name})`, 284, y0 + 226, { size: 8, color: '#c8bca8' });
    if (id !== 'bramble') ui.text(G.s.party.active.includes(id) ? 'Space: send to reserve' : 'Space: travel with Bramble', 284, y0 + 240, { size: 8, color: '#b8acc8' });
    if (button(c, 'Auto-equip best', 472, y0 + 230, 140, 18, { size: 9 })) { st.autoEquip(); audio.synth('equip'); toast('Everyone travelling is wearing the best gear you own.'); }
  }
  drawTalk(c, y0) {
    c2 = c;
    const es = talkEntries();
    if (!es.length) { ui.text('Nobody has anything new to say here. Try somewhere else, or a rest stone.', 24, y0 + 20, { size: 9 }); return; }
    es.forEach((e, i) => {
      const y = y0 + 6 + i * 24;
      this.rowSel(i, 18, y, 400, 22, 'talk:' + e.title);
      drawFace(c, e.who, 22, y + 2, 18);
      ui.text(e.title, 46, y + 14, { size: 10 });
      if (!G.s.flags['heard_' + e.key]) { c.fillStyle = P.sage; c.fillRect(400, y + 7, 8, 6); }
    });
  }
  drawGear(c, y0) {
    c2 = c;
    const ids = st.travelling();
    if (this.mode === 'pick') {
      const [mid, slot] = this.gearTarget; const list = this.gearList();
      ui.text(`${PARTY[mid].name}: choose a ${slot}`, 20, y0 + 6, { size: 10, color: P.gold });
      const worn = st.member(mid).gear[slot] && gearInfo(st.member(mid).gear[slot]);
      ui.text(`Wearing: ${worn ? worn.name : 'nothing'}.  ${list.length ? '' : 'No spare ' + slot + 's in the pack (shops sell more).  '}Esc: back`, 370, y0 + 6, { size: 8, color: '#b8acc8' });
      ['(nothing)', ...list].forEach((g, i) => {
        const y = y0 + 14 + i * 18; if (y > H - 50) return;
        this.rowSel(i, 18, y, 330, 17, 'gear:' + (i ? gearInfo(g).name : 'none'));
        if (!i) { ui.text('(take it off)', 24, y + 12, { size: 9 }); return; }
        const G2 = gearInfo(g); drawIcon(c, G2.icon, 22, y - 3, 24);
        ui.text(G2.name, 50, y + 12, { size: 9 });
        ui.text(bonusText(G2), 346, y + 12, { size: 8, align: 'right', color: '#c8f0a0' });
      });
      return;
    }
    ids.forEach((id, k) => {
      const m = st.member(id), x = 20, y = y0 + 6 + k * 70;
      drawFace(c, id, x, y, 24); ui.text(PARTY[id].name, x + 30, y + 10, { size: 10, color: P.gold });
      ['tool', 'coat', 'charm'].forEach((slot, j) => {
        const i = k * 3 + j, yy = y + 16 + j * 17;
        this.rowSel(i, x + 28, yy, 300, 16, `slot:${PARTY[id].name}:${slot}`);
        const g = m.gear[slot] && gearInfo(m.gear[slot]);
        ui.text(slot[0].toUpperCase() + slot.slice(1), x + 32, yy + 11, { size: 8, color: '#b8acc8' });
        if (g) { drawIcon(c, g.icon, x + 72, yy - 4, 24); ui.text(g.name, x + 98, yy + 11, { size: 9 }); ui.text(bonusText(g), x + 326, yy + 11, { size: 8, align: 'right', color: '#c8f0a0' }); }
        else ui.text('(empty)', x + 98, yy + 11, { size: 9, color: '#8a7e9a' });
      });
    });
    if (button(c, 'Auto-equip best', 472, y0 + 6, 140, 18, { size: 9 })) { st.autoEquip(); audio.synth('equip'); }
    ui.text('Gear isn\'t tied to anyone: swap it freely.', 360, y0 + 40, { size: 8, color: '#b8acc8' });
  }
  drawItems(c, y0) {
    c2 = c;
    if (this.mode === 'use') {
      ui.text(`Use ${ITEMS[this.useItem].name} on whom?`, 20, y0 + 8, { size: 10, color: P.gold });
      st.travelling().forEach((id, i) => { const y = y0 + 16 + i * 26, m = st.member(id); this.rowSel(i, 18, y, 300, 24, 'use:' + PARTY[id].name); drawFace(c, id, 22, y + 2, 20); ui.text(PARTY[id].name, 48, y + 14, { size: 10 }); bar(c, 160, y + 8, 100, 4, m.hp / st.maxHp(id), P.heart); bar(c, 160, y + 15, 100, 3, m.pl / st.maxPl(id), P.pluck); });
      return;
    }
    const list = this.itemList();
    if (!list.length) { ui.text('Your pack is empty.', 24, y0 + 20, { size: 9 }); return; }
    const per = 13, start = this.win(list.length, per);
    list.slice(start, start + per).forEach((id, j) => {
      const i = start + j, y = y0 + 6 + j * 19; const D = ITEMS[id] || KEY_ITEMS[id];
      this.rowSel(i, 18, y, 330, 18, 'item:' + D.name);
      drawIcon(c, D.icon, 22, y - 3, 24); ui.text(D.name, 50, y + 12, { size: 9, color: KEY_ITEMS[id] ? P.gold : P.chalk });
      ui.text('x' + st.itemCount(id), 346, y + 12, { size: 9, align: 'right' });
    });
    this.more(22, y0 + 6 + per * 19 + 10, start, per, list.length);
    const cur = list[this.sel], D = cur && (ITEMS[cur] || KEY_ITEMS[cur]);
    if (D) ui.wrap(D.d, 240, 9).forEach((l, i) => ui.text(l, 370, y0 + 20 + i * 12, { size: 9 }));
  }
  drawArmy(c, y0) {
    c2 = c;
    const rows = this.armyRows();
    ui.text(`Army rank ${(1 + 0.12 * st.warrensFreed()).toFixed(2)}x  ·  ${rows.length} squads`, 20, y0 + 6, { size: 9, color: '#c8bca8' });
    const per = 12, start = this.win(rows.length, per);
    rows.slice(start, start + per).forEach((q, j) => {
      const i = start + j, y = y0 + 12 + j * 19, S = SQUADS[q];
      this.rowSel(i, 18, y, 330, 18, 'squad:' + S.name);
      drawIcon(c, KINDS[S.kind].icon, 22, y + 1, 16); ui.text(S.name, 42, y + 13, { size: 9 });
      ui.text(KINDS[S.kind].name, 340, y + 13, { size: 8, align: 'right', color: '#b8acc8' });
    });
    this.more(22, y0 + 12 + per * 19 + 10, start, per, rows.length);
    const q = rows[this.sel]; if (q) { const S = SQUADS[q]; ui.text(S.name, 370, y0 + 20, { size: 11, color: P.gold }); ui.text(`Led by ${S.leader ? (PARTY[S.leader] ? PARTY[S.leader].name : (G.data.speakers[S.leader] || {}).name || S.leader) : '-'}`, 370, y0 + 34, { size: 9 }); ui.wrap(perkText(S.perk), 240, 9).forEach((l, i) => ui.text(l, 370, y0 + 48 + i * 11, { size: 9, color: '#c8f0a0' })); }
    ui.text('Army gear', 370, y0 + 150, { size: 10, color: P.gold });
    ['stout', 'swift', 'wing', 'eerie'].forEach((k, i) => {
      const y = y0 + 164 + i * 16; drawIcon(c, KINDS[k].icon, 370, y - 2, 16);
      ui.text(`${KINDS[k].name}: Banners ${G.s.armyGear[k + ':banner'] || 0}, Mail ${G.s.armyGear[k + ':mail'] || 0}, Rations ${G.s.armyGear[k + ':rations'] || 0}`, 390, y + 10, { size: 8 });
    });
  }
  drawQuests(c, y0) {
    ui.text('Now:', 20, y0 + 10, { size: 10, color: P.gold });
    const now = ui.wrap(G.s.quest || 'Explore.', 552, 10);
    now.forEach((l, i) => ui.text(l, 60, y0 + 10 + i * 12, { size: 10 }));
    y0 += Math.max(0, now.length - 2) * 12;
    const qs = (G.data.quests || []).filter(q => !q.show || q.show());
    // long titles and steps wrap to their columns (title 26..250, step 260..616); rows grow to fit
    let y = y0 + 40;
    for (const q of qs) {
      const done = q.done && q.done();
      const tl = ui.wrap((done ? '✓ ' : '• ') + q.title, 226, 9), sl = !done && q.step ? ui.wrap(q.step(), 352, 8) : [];
      const rows = Math.max(tl.length, sl.length);
      if (y + (rows - 1) * 11 > H - 40) break;
      tl.forEach((l, k) => ui.text(k ? '   ' + l : l, 26, y + k * 11, { size: 9, color: done ? '#8a9e7a' : P.chalk }));
      sl.forEach((l, k) => ui.text(l, 260, y + k * 11, { size: 8, color: '#b8acc8' }));
      y += rows * 11 + 4;
    }
  }
  drawMap(c, y0) {
    this.drawMinimap(c, 18, y0 + 4, 418, H - 46 - (y0 + 4));
    const known = (G.data.places || []).filter(p => !p.cond || p.cond());
    ui.text('Places you know', 448, y0 + 12, { size: 10, color: P.gold });
    const rows = 19, shown = known.length > rows ? known.slice(0, rows - 1) : known;
    shown.forEach((p, i) => ui.text((G.s.map === p.map ? '> ' : '  ') + p.name, 448, y0 + 27 + i * 12, { size: 8, color: G.s.map === p.map ? P.gold : P.chalk }));
    if (known.length > rows) ui.text(`  ...and ${known.length - rows + 1} more`, 448, y0 + 27 + (rows - 1) * 12, { size: 8, color: '#b8acc8' });
    ui.text('Every Underway you know links to the others: use the carved stone in any Underway.', 20, H - 36, { size: 8, color: '#b8acc8' });
  }
  // the current map, drawn the way the world is seen (isometric), only the tiles Bramble has seen (world/explore.js markSeen)
  drawMinimap(c, X, Y, Wd, Hd) {
    const ex = this.ex, m = ex && ex.map; if (!m) return;
    c.fillStyle = 'rgba(14,10,20,0.55)'; c.fillRect(X, Y, Wd, Hd);
    ui.text(m.def.name || 'Here', X + 6, Y + 12, { size: 9, color: P.gold });
    if (!m.seen) ex.markSeen();
    const seen = m.seen || [];
    // fit the seen part (at least a 24-tile window) into the box: u = x - y across, v = x + y down
    let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (seen[y * m.w + x]) { u0 = Math.min(u0, x - y); u1 = Math.max(u1, x - y); v0 = Math.min(v0, x + y); v1 = Math.max(v1, x + y); }
    if (u0 > u1) { u0 = u1 = ex.b.x - ex.b.y; v0 = v1 = ex.b.x + ex.b.y; }
    const pad = (lo, hi) => { const need = Math.max(0, 24 - (hi - lo)) / 2; return [lo - need - 1, hi + need + 1]; };
    [u0, u1] = pad(u0, u1); [v0, v1] = pad(v0, v1);
    let a = Math.floor(Math.min((Wd - 16) / (u1 - u0), 2 * (Hd - 34) / (v1 - v0))); a = Math.max(2, Math.min(12, a - (a % 2)));
    const ox = Math.round(X + Wd / 2 - (u0 + u1) * a / 2), oy = Math.round(Y + 22 + (Hd - 34) / 2 - (v0 + v1) * a / 4);
    const scr = (x, y) => ({ x: ox + (x - y) * a, y: oy + (x + y) * a / 2 });
    c.save(); c.beginPath(); c.rect(X, Y + 16, Wd, Hd - 28); c.clip();
    const diamond = (x, y, col) => {
      const s = scr(x, y); c.fillStyle = col;
      for (let r = 0; r < a; r++) { const hw = Math.max(1, Math.round(a * (1 - Math.abs(r + 0.5 - a / 2) / (a / 2)))); c.fillRect(s.x - hw, s.y + r, 2 * hw, 1); }
    };
    const world = WORLD[m.world] || WORLD.downs;
    const mix = (hex, k) => { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)), ch = [239, 232, 214]; return `rgb(${v.map((x, i) => Math.round(x + (ch[i] - x) * k)).join(',')})`; };
    const colOf = {};
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const i = y * m.w + x, t = m.tiles[i]; if (!t || !seen[i]) continue;
      let col;
      if (t.wall) col = '#6a5a7e';
      else if (t.water && t.k !== 'lava') col = '#3e6e8e';
      else if (t.k === 'lava') col = '#b85a2a';
      else { const pal = world[t.k] || world.floor || world.grass || Object.values(world).find(Array.isArray); col = colOf[t.k] || (colOf[t.k] = mix(pal[1], 0.35)); }
      diamond(x, y, col);
    }
    const isSeen = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && seen[y * m.w + x];
    const dot = (x, y, col, sz = 4) => { const s = scr(x, y); c.fillStyle = '#1d1726'; c.fillRect(s.x - sz / 2 - 1, s.y + a / 2 - sz / 2 - 1, sz + 2, sz + 2); c.fillStyle = col; c.fillRect(s.x - sz / 2, s.y + a / 2 - sz / 2, sz, sz); };
    for (const d of m.def.doors || []) if ((!d.cond || d.cond()) && isSeen(d.x, d.y)) dot(d.x, d.y, P.gold);
    for (const p of m.props) if (/rest-stone/.test(p.id) && isSeen(p.x, p.y)) dot(p.x, p.y, P.sage);
    dot(ex.b.x, ex.b.y, Math.floor(G.time * 2) % 2 ? '#ffffff' : P.red, 6);
    c.restore();
    // legend
    const ly = Y + Hd - 8; let lx = X + 8;
    for (const [col, label] of [[P.red, 'Bramble'], [P.gold, 'Way out'], [P.sage, 'Rest stone']]) {
      c.fillStyle = '#1d1726'; c.fillRect(lx - 1, ly - 6, 6, 6); c.fillStyle = col; c.fillRect(lx, ly - 5, 4, 4);
      ui.text(label, lx + 8, ly, { size: 8, color: '#c8bca8' }); lx += 18 + ui.measure(label, 8);
    }
  }
  drawBestiary(c, y0) {
    c2 = c;
    const ids = Object.keys(G.s.met).filter(k => G.data.bestiary && G.data.bestiary[k]);
    if (!ids.length) { ui.text('Nobody yet.', 24, y0 + 20, { size: 9 }); return; }
    const per = 13, start = this.win(ids.length, per);
    ids.slice(start, start + per).forEach((id, j) => { const i = start + j, y = y0 + 6 + j * 19; this.rowSel(i, 18, y, 240, 18, 'met:' + id); drawFace(c, (G.data.speakers[id] || {}).por || id, 22, y + 1, 16); ui.text((G.data.speakers[id] || { name: id }).name, 44, y + 12, { size: 9 }); });
    this.more(22, y0 + 6 + per * 19 + 10, start, per, ids.length);
    const id = ids[this.sel]; if (id) { drawPortrait(c, (G.data.speakers[id] || {}).por || id, 290, y0 + 10); ui.text((G.data.speakers[id] || { name: id }).name, 384, y0 + 24, { size: 12, color: P.gold }); ui.wrap(G.data.bestiary[id], 230, 9).forEach((l, i) => ui.text(l, 384, y0 + 40 + i * 12, { size: 9 })); }
  }
}
let c2 = null;
export function bonusText(g) { const b = g.bonus, out = []; for (const k of ['str', 'wit', 'tgh', 'hp', 'spd']) if (b[k]) out.push(`+${b[k]} ${{ str: 'STR', wit: 'WIT', tgh: 'TGH', hp: 'Heart', spd: 'SPD' }[k]}`); if (g.d) out.push(g.d.replace('.', '')); return out.join(', '); }
export function perkText(p) {
  return ({ 'atk-aura': 'Friendly squads on its node hit 10% harder.', 'fast-tunnel': 'Tunnels between burrow mouths in 3 s.', 'regen-aura': 'Friendly squads on its node heal 1 a second.', thorns: 'Attackers in contact take 1 damage a second.', hidden: 'Always hidden until it\'s in a fight.', 'fast-capture': 'Captures nodes in 2 s.', 'capture-4': 'Captures nodes in 4 s.', aura: 'Eerie aura: nearby enemies hit 20% softer.', 'hum-resist': 'Hum-taken squads hit it 10% softer.', 'hill-def': '+20% defence on hilltops.', light: 'Light: double damage to Eerie squads.', 'light-reveal': 'Light, and reveals hidden squads nearby.', reveal: 'Reveals hidden squads within 6 tiles.', 'deep-cover': 'Hidden in the corn unless an enemy is right next to it.', 'supply-capture': '+3 Supply each time it takes a node.', 'def-aura': 'Friendly squads on its node defend 10% better.', outnumbered: '+25% attack when outnumbered.', regen: 'Heals 1 a second.' }[p]) || 'A steady, reliable squad.';
}
