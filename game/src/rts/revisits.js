// The post-game Lookout Stone menu: pick an army battle to fight again for the best time (or Back / Esc).
// openRevisits() resolves the chosen battle id, or null.
import { G, W, ui, pushScene, popScene, hits } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { panel, button, clickIn, mouseIn } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { REVISITS, bestOf, medalOf, medalsOf, fmtTime, fmtSecs, shortName, MEDAL_NAME, MEDAL_COLOR } from './best.js';

export function revisitList() { return REVISITS.filter(id => G.data.rts[id] && G.s.flags['g_' + id + '_won']); }

export function openRevisits() {
  return new Promise(res => pushScene(new RevisitScene(revisitList(), res)));
}

// a small medal disc drawn in code
export function drawMedal(c, x, y, kind, r = 4) {
  c.fillStyle = '#120e18'; c.beginPath(); c.arc(x, y, r + 1, 0, 7); c.fill();
  c.fillStyle = MEDAL_COLOR[kind]; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(Math.round(x - r / 2), Math.round(y - r / 2), 2, 1);
}

const PX = 100, PW = W - 200, PY = 44, ROW = 38, RY = 92;
class RevisitScene {
  constructor(ids, done) { this.kind = 'revisits'; this.ids = ids; this.done = done; this.sel = 0; }
  enter() { input.eatAll(); }
  pick(i) { audio.synth('confirm'); popScene(this); this.done(i < this.ids.length ? this.ids[i] : null); }
  update() {
    const n = this.ids.length + 1;   // the battles, then Back
    if (input.back()) { audio.synth('cancel'); popScene(this); this.done(null); return; }
    if (input.up()) { this.sel = (this.sel + n - 1) % n; audio.synth('move'); }
    if (input.down()) { this.sel = (this.sel + 1) % n; audio.synth('move'); }
    const d = input.digit(); if (d >= 1 && d <= this.ids.length) { this.pick(d - 1); return; }
    if (input.act()) { this.pick(this.sel); return; }
  }
  draw(c, isTop) {
    c.fillStyle = 'rgba(10,8,16,0.55)'; c.fillRect(0, 0, W, 360);
    const ph = RY - PY + this.ids.length * ROW + 56;
    panel(c, PX, PY, PW, ph);
    ui.text('The Lookout Stone', W / 2, PY + 22, { align: 'center', size: 14, color: P.gold });
    ui.text('Fight any battle again, for the best time. The clock starts with your first order.', W / 2, PY + 37, { align: 'center', size: 8, color: '#c8bca8' });
    let chose = -1;
    this.ids.forEach((id, i) => {
      const x = PX + 14, y = RY + i * ROW, w = PW - 28, h = ROW - 4, sel = i === this.sel;
      if (isTop && mouseIn(x, y, w, h) && input.mouse.moved) this.sel = i;
      panel(c, x, y, w, h, { fill: sel ? '#5a4a72' : P.panel2, edge: sel ? P.gold : '#6b5a7e' });
      ui.text(`${i + 1}  ${shortName(id)}`, x + 10, y + 15, { size: 11, color: sel ? '#fff6d8' : P.chalk });
      const m = medalsOf(id), b = bestOf(id), med = medalOf(id);
      if (m) ui.text(`Burdock's time ${fmtSecs(m.burdock)}    Gold ${fmtSecs(m.gold)}`, x + 26, y + 28, { size: 8, color: '#b8acc8' });
      if (b) {
        ui.text(`Best ${fmtTime(b.ticks)}${b.easy ? ' (Easy)' : ''}`, x + w - 10, y + 15, { size: 10, align: 'right', color: P.chalk });
        if (med) { drawMedal(c, x + w - 18, y + 25, med); ui.text(MEDAL_NAME[med], x + w - 28, y + 28, { size: 8, align: 'right', color: MEDAL_COLOR[med] }); }
        else ui.text(b.easy ? 'no medal on Easy' : 'no medal yet', x + w - 10, y + 28, { size: 8, align: 'right', color: '#8a7e9a' });
      } else ui.text('not yet', x + w - 10, y + 15, { size: 10, align: 'right', color: '#8a7e9a' });
      if (G.drawingTop) hits.add(`${shortName(id)}: ${b ? 'best ' + fmtTime(b.ticks) + (med ? ' (' + med + ')' : '') : 'not yet'}`, x, y, w, h);   // the play-test reads the best time off the label
      if (isTop && chose < 0 && clickIn(x, y, w, h)) { input.mouse.pressed[0] = false; this.sel = i; chose = i; }
    });
    if (chose >= 0) { this.pick(chose); return; }
    const by = RY + this.ids.length * ROW + 6;
    if (button(c, 'Back', W / 2 - 50, by, 100, 22, { size: 10, sel: this.sel === this.ids.length })) { popScene(this); this.done(null); return; }
    ui.text('Arrows / 1-5 / click: choose    Esc: back', W / 2, by + 34, { align: 'center', size: 8, color: '#8a7e9a' });
  }
}
