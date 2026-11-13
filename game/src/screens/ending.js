// The ending: Sorrel Down at sunset, credits scrolling over it with each character hopping past,
// then "Warren Peace" and back to wandering.
import { G, W, H, ui, popScene } from '../core.js';
import { input } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { bg, sprite, flipped } from '../engine/assets.js';
import { fade } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';
import { PARTY_ORDER } from '../data/core/party.js';

// the credits scroll inside a dark column that ends above the parade lane, so the two never cross
const LANE_TOP = H - 54, TEXT_BOTTOM = LANE_TOP - 12, TEXT_TOP = 14, COL_W = 380;
export class EndingScene {
  constructor(done) {
    this.kind = 'ending'; this.opaque = true; this.done = done; this.t = 0;
    const credit = (G.data.credit || '').trim();
    this.lines = [
      ['Warren Peace', 22], ['', 0], ['Every warren is free, and at peace.', 11], ['', 0],
      ['The friends', 12], ...PARTY_ORDER.map(id => [G.data.speakers[id] ? G.data.speakers[id].name : id, 10]),
      ['', 0], ['and the White Rabbit, the Seven of Spades, Wick, Chert,', 10], ['Aster, Barley, the Scarecrow, the Cowardly Lion,', 10], ['the Queen of the Field Mice and the Monkey King', 10], ['', 0],
      ['Storybook friends from', 12], ['The Wind in the Willows, by Kenneth Grahame (1908)', 10], ['Alice\'s Adventures in Wonderland, by Lewis Carroll (1865)', 10], ['The Wonderful Wizard of Oz, by L. Frank Baum (1900)', 10], ['Journey to the Center of the Earth, by Jules Verne (1864)', 10], ['and the old tale of the Moon Rabbit', 10], ['', 0],
      ...(credit ? [[`An idea by ${credit}`, 11], ['', 0]] : []),
      ['Made with gamegen', 10], ['Pixelify Sans font by the Pixelify Sans Project Authors (SIL OFL)', 9], ['', 0], ['Thank you for playing.', 12],
    ];
    this.cast = PARTY_ORDER.slice();
    this.total = this.lines.length * 16 + TEXT_BOTTOM + 20;
  }
  enter() { audio.music('m-sunset', 2); }
  update(dt) {
    this.t += dt;
    const speed = input.isHeld('Space') ? 60 : 18;
    this.scroll = (this.scroll || 0) + dt * speed;
    if (this.scroll > this.total && !this.endT) this.endT = this.t;
    if (this.endT && (input.anyPressed || this.t - this.endT > 6)) { input.eatAll(); popScene(this); this.done(); }
  }
  draw(c) {
    const b = bg('bg-ending'); if (b) c.drawImage(b, 0, 0); else { c.fillStyle = '#d88a48'; c.fillRect(0, 0, W, H); }
    c.fillStyle = 'rgba(30,15,30,0.35)'; c.fillRect(0, 0, W, H);
    const show = Math.min(1, this.t / 1.2) * (this.endT ? Math.max(0, 1 - (this.t - this.endT) / 1.2) : 1);
    if (show > 0) {
      // a dark reading column behind the scrolling names (the painting is bright and full of faces), soft at its sides
      const x0 = (W - COL_W) / 2, g = c.createLinearGradient(x0 - 24, 0, x0 + COL_W + 24, 0);
      g.addColorStop(0, 'rgba(22,12,22,0)'); g.addColorStop(0.07, 'rgba(22,12,22,0.8)'); g.addColorStop(0.93, 'rgba(22,12,22,0.8)'); g.addColorStop(1, 'rgba(22,12,22,0)');
      c.globalAlpha = show; c.fillStyle = g; c.fillRect(x0 - 24, 0, COL_W + 48, LANE_TOP - 4); c.globalAlpha = 1;
    }
    // the parade lane along the bottom: its own darker strip, below the credits
    const lg = c.createLinearGradient(0, LANE_TOP - 6, 0, H); lg.addColorStop(0, 'rgba(22,12,22,0)'); lg.addColorStop(0.25, 'rgba(22,12,22,0.5)'); lg.addColorStop(1, 'rgba(22,12,22,0.6)');
    c.fillStyle = lg; c.fillRect(0, LANE_TOP - 6, W, H - LANE_TOP + 6);
    // characters hopping past along the bottom (their heads stay below LANE_TOP)
    const n = this.cast.length;
    for (let i = 0; i < n; i++) {
      const x = ((this.t * 40 + i * (W + 120) / n) % (W + 120)) - 60;
      const img = sprite('map', this.cast[i] === 'bramble' ? 'bramble-se' : this.cast[i]); if (!img) continue;
      const hop = Math.abs(Math.sin(this.t * 5 + i)) * 5;
      const k = Math.min(1, (H - 6 - LANE_TOP - 6) / img.height), w = Math.round(img.width * k), h = Math.round(img.height * k);
      c.drawImage(img, Math.round(x - w / 2), Math.round(H - 6 - h - hop), w, h);
    }
    if (!this.endT) {
      this.lines.forEach(([text, size], i) => {
        const y = TEXT_BOTTOM + 20 + i * 16 - (this.scroll || 0);
        if (y < TEXT_TOP - 4 || y > TEXT_BOTTOM || !text) return;
        // fade in at the bottom edge of the column and out at the top
        const a = Math.min(1, (TEXT_BOTTOM - y) / 18, (y - TEXT_TOP + 4) / 18);
        ui.text(text, W / 2, y, { align: 'center', size: size || 10, color: size >= 12 ? '#f6e7b8' : '#f0e6d4', alpha: Math.max(0, a), shadow: '#120a12' });
      });
    } else {
      const a = Math.min(1, (this.t - this.endT) / 1.5);
      c.globalAlpha = a * 0.55; c.fillStyle = '#160c16'; c.fillRect(0, H / 2 - 34, W, 70); c.globalAlpha = 1;
      ui.text('Warren Peace', W / 2, H / 2, { align: 'center', size: 36, color: '#f6e7b8', alpha: a });
      ui.text('Peace on the Downs', W / 2, H / 2 + 24, { align: 'center', size: 11, alpha: a });
    }
    fade(c, Math.max(0, 1 - this.t));
  }
}
