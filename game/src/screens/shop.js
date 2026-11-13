// Shops: party gear (with up/down arrows for each travelling member), items, and army gear by squad kind.
import { G, W, H, ui, popScene, clamp, hits, toast } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { panel, button, drawIcon, drawIconFit, drawFace, drawPortrait, mouseIn, clickIn } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { ITEMS, gearInfo, armyGearPrice } from '../data/core/items.js';
import { KINDS } from '../data/core/squads.js';
import { PARTY } from '../data/core/party.js';
import * as st from '../state.js';
import { bonusText } from './camp.js';

export class ShopScene {
  constructor(id, done) {
    this.kind = 'shop'; this.id = id; this.done = done; this.D = G.data.shops[id]; this.tab = 0; this.sel = 0; this.offerAuto = false;
    this.tabs = ['Gear', 'Items', 'Army'];
  }
  rows() {
    const D = this.D;
    if (this.tab === 0) return (typeof D.gear === 'function' ? D.gear() : D.gear || []).map(id => ({ kind: 'gear', id, g: gearInfo(id), price: gearInfo(id).price }));
    if (this.tab === 1) return (D.items || []).map(id => ({ kind: 'item', id, price: ITEMS[id].price }));
    const maxRank = typeof D.army === 'function' ? D.army() : D.army || 0;
    const out = [];
    for (const k of ['stout', 'swift', 'wing', 'eerie']) for (const g of ['banner', 'mail', 'rations']) {
      const cur = G.s.armyGear[k + ':' + g] || 0; if (cur >= maxRank) continue;
      out.push({ kind: 'army', k, g, rank: cur + 1, price: armyGearPrice(cur + 1) });
    }
    return out;
  }
  close() { popScene(this); this.done(); }
  update() {
    if (this.offerAuto) { if (input.act()) { st.autoEquip(); audio.synth('equip'); this.offerAuto = false; toast('Auto-equipped.'); } if (input.back()) this.offerAuto = false; return; }
    if (input.back()) { this.close(); return; }
    if (input.left() || input.isPressed('KeyQ')) { this.tab = (this.tab + 2) % 3; this.sel = 0; audio.synth('move'); }
    if (input.right() || input.isPressed('KeyE')) { this.tab = (this.tab + 1) % 3; this.sel = 0; audio.synth('move'); }
    const r = this.rows(); if (!r.length) return;
    this.sel = clamp(this.sel, 0, r.length - 1);
    if (input.up()) { this.sel = (this.sel + r.length - 1) % r.length; audio.synth('move'); }
    if (input.down()) { this.sel = (this.sel + 1) % r.length; audio.synth('move'); }
    if (input.isPressed('Space') || input.isPressed('Enter')) this.buy(r[this.sel]);
  }
  buy(row) {
    if (!row) return;
    if (G.s.buttons < row.price) { audio.synth('cancel'); toast('Not enough buttons.', 1.4); return; }
    G.s.buttons -= row.price; audio.sfx('coins', { vol: 0.8 });
    if (row.kind === 'gear') { st.giveItem(row.id); this.offerAuto = true; }
    if (row.kind === 'item') st.giveItem(row.id);
    if (row.kind === 'army') G.s.armyGear[row.k + ':' + row.g] = row.rank;
  }
  draw(c) {
    c.fillStyle = 'rgba(10,8,16,0.6)'; c.fillRect(0, 0, W, H);
    panel(c, 8, 8, W - 16, H - 16);
    const D = this.D;
    drawPortrait(c, (G.data.speakers[D.keeper] || {}).por || D.keeper, 16, 16);
    ui.text(D.name, 108, 32, { size: 13, color: P.gold });
    ui.wrap(D.line || '', 330, 9).forEach((l, i) => ui.text(l, 108, 48 + i * 11, { size: 9, color: '#e8dcc0' }));
    drawIcon(c, 'ico-button', 470, 20, 16); ui.text(`${G.s.buttons} buttons`, 490, 32, { size: 11, color: P.gold });
    this.tabs.forEach((t, i) => { if (button(c, t, 108 + i * 80, 80, 76, 18, { sel: i === this.tab, size: 9, hitLabel: 'tab:' + t })) { this.tab = i; this.sel = 0; this.scrollStart = 0; } });
    const rows = this.rows(), per = 9, RH = 24;
    // the list scrolls to keep the keyboard selection in view, with the mouse wheel, or with the ▲/▼ buttons
    // (hovering never scrolls, so the rows don't move under the mouse)
    let start = this.scrollStart || 0;
    if (input.mouse.wheel && mouseIn(18, 106, 600, per * RH)) start += input.mouse.wheel > 0 ? 1 : -1;
    if (this.sel !== this.lastSel) { if (this.sel < start) start = this.sel; if (this.sel >= start + per) start = this.sel - per + 1; this.lastSel = this.sel; }
    const maxStart = Math.max(0, rows.length - per);
    if (rows.length > per) {
      if (button(c, '▲', 600, 106, 18, 18, { size: 9, disabled: start <= 0, hitLabel: 'shop:up' })) start--;
      if (button(c, '▼', 600, 106 + per * RH - 19, 18, 18, { size: 9, disabled: start >= maxStart, hitLabel: 'shop:down' })) start++;
    }
    start = clamp(start, 0, maxStart); this.scrollStart = start;
    if (!rows.length) ui.text('Nothing more to sell you here.', 24, 124, { size: 9 });
    const trav = st.travelling();
    rows.slice(start, start + per).forEach((r, j) => {
      const i = start + j, y = 106 + j * RH, sel = i === this.sel;
      const label = r.kind === 'gear' ? r.g.name : r.kind === 'item' ? ITEMS[r.id].name : `${KINDS[r.k].name} ${{ banner: 'Banners', mail: 'Mail', rations: 'Rations' }[r.g]} ${['', 'I', 'II', 'III'][r.rank]}`;
      if (G.drawingTop) hits.add('buy:' + label, 18, y, 578, RH - 1);
      if (mouseIn(18, y, 578, RH - 1) && input.mouse.moved) { this.sel = i; this.lastSel = i; }
      if (clickIn(18, y, 578, RH - 1) && !this.offerAuto) { input.mouse.pressed[0] = false; this.sel = i; this.buy(r); }
      if (sel) { c.fillStyle = 'rgba(232,201,90,0.16)'; c.fillRect(18, y, 578, RH - 1); }
      const icon = r.kind === 'gear' ? r.g.icon : r.kind === 'item' ? ITEMS[r.id].icon : 'ico-' + (r.g === 'rations' ? 'ration' : r.g);
      drawIconFit(c, icon, 22, y + 1, RH - 3);   // every tab's icons the same size, inside the row
      ui.text(label, 50, y + 15, { size: 9 });
      ui.text(String(r.price), 340, y + 15, { size: 9, align: 'right', color: G.s.buttons >= r.price ? P.gold : '#8a7e9a' });
      if (r.kind === 'gear') {
        // an up/down arrow for each travelling member: would this beat what they wear?
        trav.forEach((id, k) => {
          const cur = st.member(id).gear[r.g.slot]; const cg = cur ? gearInfo(cur) : null;
          const score = g => g ? Object.values(g.bonus).reduce((a, b) => a + b, 0) + (g.effect ? 2 : 0) : 0;
          const d = score(r.g) - score(cg);
          const x = 370 + k * 76; drawFace(c, id, x, y + 3, 16);
          ui.text(d > 0 ? '▲' : d < 0 ? '▼' : '=', x + 22, y + 15, { size: 9, color: d > 0 ? '#8de08a' : d < 0 ? '#e08a7a' : '#b8acc8' });
        });
      } else if (r.kind === 'item') ui.text(`have ${st.itemCount(r.id)}`, 370, y + 15, { size: 8, color: '#b8acc8' });
    });
    if (rows.length > per) ui.text(`${start + 1}-${Math.min(rows.length, start + per)} of ${rows.length}  (wheel, ▲▼ or arrow keys for more)`, 540, H - 30, { size: 8, align: 'right', color: '#b8acc8' });
    const cur = rows[this.sel];
    if (cur) {
      const desc = cur.kind === 'gear' ? `${cur.g.slot[0].toUpperCase() + cur.g.slot.slice(1)}: ${bonusText(cur.g)}` : cur.kind === 'item' ? ITEMS[cur.id].d : { banner: 'Attack +15% per rank', mail: 'Damage taken -10% per rank', rations: 'Heart +10% per rank' }[cur.g] + ` for every ${KINDS[cur.k].name} squad.`;
      ui.text(desc, 24, H - 30, { size: 9, color: '#c8f0a0' });
    }
    ui.text('Space: buy   Left/Right: tabs   Esc: leave', 24, H - 16, { size: 8, color: '#8a7e9a' });
    if (button(c, 'Leave', W - 86, H - 34, 64, 18, { size: 9 })) this.close();
    if (this.offerAuto) {
      panel(c, W / 2 - 140, H / 2 - 30, 280, 60);
      ui.text('Auto-equip the best gear you own?', W / 2, H / 2 - 8, { align: 'center', size: 10 });
      if (button(c, 'Yes', W / 2 - 70, H / 2 + 6, 60, 18, { size: 9, sel: true })) { st.autoEquip(); audio.synth('equip'); this.offerAuto = false; }
      if (button(c, 'No', W / 2 + 10, H / 2 + 6, 60, 18, { size: 9 })) this.offerAuto = false;
    }
  }
}
