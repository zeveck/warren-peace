// The recruit card: slides in when someone joins (portrait, name, role and squad, first line), then
// their banner joins the row. Stays up until a key or click (after a short beat), with a hint.
import { G, W, H, ui, popScene } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { panel, drawPortrait, keyHint } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { chip, padOn } from '../engine/prompts.js';
import { PARTY } from '../data/core/party.js';
import { SQUADS, KINDS } from '../data/core/squads.js';

export class RecruitCard {
  constructor(id, line, done) {
    this.kind = 'recruit'; this.id = id; this.line = line; this.done = done; this.t = 0;
    const sq = Object.entries(SQUADS).find(([, q]) => q.leader === id);
    this.sq = sq ? sq[1] : null;
    this.name = PARTY[id] ? PARTY[id].name : (G.data.speakers[id] || { name: id }).name;
    this.role = PARTY[id] ? PARTY[id].role : null;
    this.banners = Object.entries(SQUADS).filter(([k, q]) => q.leader && (G.s.flags['g_recruit_' + q.leader]) && !q.free).map(([, q]) => q.color);
  }
  enter() { audio.sfx('recruit-sting'); if (this.id === 'ninefold') setTimeout(() => audio.voice('vo-dandelion'), 500); }
  update(dt) {
    this.t += dt;
    if ((input.anyPressed || input.click()) && this.t > 0.6) { input.eatAll(); popScene(this); this.done(); }
  }
  draw(c) {
    const pw = 360, k = Math.min(1, this.t / 0.35), x = Math.round(-pw - 40 + k * (W / 2 - pw / 2 + pw + 40));
    c.fillStyle = `rgba(10,8,16,${0.5 * k})`; c.fillRect(0, 0, W, H);
    // the quote, balanced so no word sits alone on the last line
    const qw = pw - 114, quote = this.line ? ui.wrap('"' + this.line + '"', qw, 9, true) : [];
    let ty = 134 + 16 + (this.role ? 12 : 0) + (this.sq ? 12 : 0);
    const textEnd = quote.length ? ty + 6 + (quote.length - 1) * 11 + 4 : ty;
    const ph = Math.max(116 + 22, textEnd - 90 + 26), y0 = 90;
    panel(c, x, y0, pw, ph, { fill: '#3a2f48' });
    ui.text('A new friend!', x + pw / 2, y0 + 16, { align: 'center', size: 9, color: '#c8bca8' });
    drawPortrait(c, (G.data.speakers[this.id] || {}).por || this.id, x + 10, y0 + 26);
    ui.text(this.name, x + 102, y0 + 44, { size: 14, color: P.gold });
    let y = y0 + 60;
    if (this.role) { ui.text('Party: ' + this.role, x + 102, y, { size: 9 }); y += 12; }
    if (this.sq) { ui.text(`Army: ${this.sq.name} (${KINDS[this.sq.kind].name})`, x + 102, y, { size: 9 }); y += 12; }
    quote.forEach((l, i) => ui.text(l, x + 102, y + 6 + i * 11, { size: 9, color: '#e8dcc0' }));
    if (this.t > 0.6) { const kx = x + pw - 96, ky = y0 + ph - 18, kw = chip(c, 'Space', 'cross', kx, ky); if (!padOn()) ui.text('or click', kx + kw + 5, ky + 9, { size: 8, color: '#b8acc8' }); }
    this.bannerY = y0 + ph + 12;
    // the row of banners
    const n = this.banners.length, bw = 9, total = n * (bw + 3);
    this.banners.forEach((col, i) => {
      const bx = Math.round(W / 2 - total / 2 + i * (bw + 3)), last = i === n - 1;
      const drop = last ? Math.max(0, 1 - (this.t - 0.6) / 0.4) * -30 : 0;
      if (last && this.t < 0.6) return;
      const by = this.bannerY || 250;
      c.fillStyle = P.bark; c.fillRect(bx, by + drop, 1, 22);
      c.fillStyle = col; c.fillRect(bx + 1, by + 1 + drop + Math.round(Math.sin(G.time * 5 + i) * 1), bw - 1, 7);
    });
  }
}
