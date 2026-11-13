// Full-screen pictures with captions (intro cards, the attack, the mural) and chapter cards.
import { G, W, H, ui, popScene } from '../core.js';
import { audio } from '../engine/audio.js';
import { input } from '../engine/input.js';
import { bg } from '../engine/assets.js';
import { panel, fade, drawPortrait, keyHint } from '../engine/gfx.js';
import { P } from '../data/core/palette.js';

export class PictureScene {
  // lines: array of strings shown one at a time (any key advances); o.skippable: Escape skips all
  constructor(bgId, lines, done, o = {}) { this.kind = 'picture'; this.opaque = true; this.bgId = bgId; this.lines = lines; this.done = done; this.i = 0; this.t = 0; this.o = o; }
  update(dt) {
    this.t += dt;
    if (this.o.skippable && input.back()) { this.finish(); return; }
    if ((input.act() || input.click()) && this.t > 0.4) { this.i++; this.t = 0.15; if (this.i >= this.lines.length) this.finish(); }
  }
  finish() { popScene(this); this.done(); }
  draw(c) {
    const b = bg(this.bgId); if (b) c.drawImage(b, 0, 0); else { c.fillStyle = '#2a2236'; c.fillRect(0, 0, W, H); }
    const line = this.lines[Math.min(this.i, this.lines.length - 1)];
    if (line) {
      const ls = ui.wrap(line, 540, 11, true), h = ls.length * 15 + 16;
      c.fillStyle = 'rgba(18,14,24,0.78)'; c.fillRect(30, H - h - 18, W - 60, h);
      ls.forEach((l, i) => ui.text(l, W / 2, H - h - 18 + 20 + i * 15, { align: 'center', size: 11 }));
    }
    if (this.o.skippable) { const w = ui.measure('Esc: skip', 8) + 10; c.fillStyle = 'rgba(18,14,24,0.7)'; c.fillRect(W - 7 - w, 4, w, 14); ui.text('Esc: skip', W - 12, 14, { align: 'right', size: 8, color: '#e8dcc0' }); }
    fade(c, Math.max(0, 1 - this.t * 3) * (this.i === 0 ? 1 : 0));
  }
}
export class ChapterCard {
  constructor(title, sub, bgId, done) { this.kind = 'chapter'; this.opaque = true; this.title = title; this.sub = sub; this.bgId = bgId; this.done = done; this.t = 0; }
  update(dt) { this.t += dt; if ((input.anyPressed && this.t > 0.8) || this.t > 4) { input.eatAll(); popScene(this); this.done(); } }
  draw(c) {
    const b = bg(this.bgId);
    c.fillStyle = '#17121f'; c.fillRect(0, 0, W, H);
    if (b) { c.globalAlpha = 0.85; c.drawImage(b, 0, 0); c.globalAlpha = 1; }
    // a painted-style frame drawn in code
    c.fillStyle = 'rgba(18,14,24,0.45)'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#e8c95a'; c.lineWidth = 2; c.strokeRect(40, 40, W - 80, H - 80); c.strokeStyle = '#7a5638'; c.lineWidth = 1; c.strokeRect(46, 46, W - 92, H - 92);
    for (const [x, y] of [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]]) { c.fillStyle = '#e8c95a'; c.fillRect(x - 4, y - 4, 8, 8); }
    const a = Math.min(1, this.t * 2) * Math.min(1, (4 - this.t) * 2);
    // a soft dark band behind the words: the backdrops are bright in places
    c.globalAlpha = Math.max(0, a) * 0.55; c.fillStyle = '#120e18'; c.fillRect(60, H / 2 - 42, W - 120, 66); c.globalAlpha = 1;
    ui.text(this.sub || '', W / 2, H / 2 - 22, { align: 'center', size: 11, color: '#e8dcc0', alpha: a });
    ui.text(this.title, W / 2, H / 2 + 12, { align: 'center', size: 26, color: '#f6e7b8', alpha: a });
  }
}

// After a lost fight: the battle's backdrop, dimmed, and a friend helping everyone up. Nothing is lost:
// the party is back at the last door with full Heart (world/script.js upYouGet). Waits for a key or click.
// o: { bg: backdrop name, who: party id saying it, place: where they are now }
export class DefeatCard {
  constructor(o, done) { this.kind = 'defeat'; this.opaque = true; this.o = o || {}; this.done = done; this.t = 0; }
  update(dt) {
    this.t += dt;
    if ((input.act() || input.click()) && this.t > 0.6) { input.eatAll(); audio.synth('confirm'); popScene(this); this.done(); }
  }
  draw(c) {
    const o = this.o, b = o.bg && bg(o.bg);
    c.fillStyle = '#17121f'; c.fillRect(0, 0, W, H);
    if (b) { c.globalAlpha = 0.6; c.drawImage(b, 0, 0); c.globalAlpha = 1; }
    c.fillStyle = 'rgba(30,18,40,0.5)'; c.fillRect(0, 0, W, H);
    const pw = 440, ph = 118, px = (W - pw) / 2, py = (H - ph) / 2 - 10;
    panel(c, px, py, pw, ph, { fill: '#2b2236' });
    const who = o.who || 'bramble', sp = (G.data.speakers || {})[who] || {};
    drawPortrait(c, sp.por || who, px + 12, py + 17);
    const tx = px + 110, tw = pw - 122;
    ui.text(sp.name || 'A friend', tx, py + 22, { size: 10, color: P.gold });
    ui.text('"Up you get. We\'ll try again when we\'re ready."', tx, py + 40, { size: 11, color: '#f6e7b8' });
    const where = o.place ? `Everyone is back at ${o.place}, Heart and all, and nothing is lost.` : 'Everyone is back at the last door, Heart and all, and nothing is lost.';
    ui.wrap('The fight was too much this time, so the friends carried each other home. ' + where, tw, 9, true)
      .forEach((l, i) => ui.text(l, tx, py + 60 + i * 12, { size: 9, color: '#d8ccb0' }));
    if (this.t > 0.6) { const kw = keyHint(c, 'Space', px + pw - 112, py + ph - 18); ui.text('or click', px + pw - 106 + kw, py + ph - 9, { size: 8, color: '#b8acc8' }); }
    fade(c, Math.max(0, 1 - this.t * 2.5));
  }
}
