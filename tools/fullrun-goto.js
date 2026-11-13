// Extra step for the full playthrough (tools/fullrun-play.sh): {"goto": [x, y]} walks to a far tile on the current map
// with REAL clicks: it reads the A* path from the live explore scene (read-only), clicks the farthest tile along it that
// is on screen and that a click really resolves to (no person/prop in the way, not under the HUD), waits, repeats.
async function gotoTile(x, y, timeout = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const r = await page.evaluate(async ([x, y]) => {
      const { G } = await import('/src/core.js'); const { findPath } = await import('/src/engine/path.js'); const { view } = await import('/src/main.js');
      const ex = G.scenes[G.scenes.length - 1]; if (!ex || ex.kind !== 'explore') return { wait: 1 };
      if (ex.b.x === x && ex.b.y === y) return { done: 1 };
      if (ex.b.hop || ex.path && ex.path.length || ex.busy) return { wait: 1 };
      const p = findPath(ex.b.x, ex.b.y, x, y, (a, b, c, d) => ex.canStep(a, b, c, d), (a, b) => ex.hAt(a, b), 20000);
      if (!p) return { err: 'no path from ' + ex.b.x + ',' + ex.b.y + ' to ' + x + ',' + y };
      for (let i = Math.min(p.length, 14) - 1; i >= 0; i--) {
        const q = p[i]; const c = window.__game.tileToScreen(q.x, q.y); if (!c) continue;
        const mx = (c.x * view.DPR - view.OX) / view.K, my = (c.y * view.DPR - view.OY) / view.K;
        if (mx < 20 || mx > 620 || my < 45 || my > 330) continue;
        const wx = mx + ex.camX, wy = my + ex.camY;
        if (ex.map.actors.some(a => !a.hidden && a.talk && a._rect && wx >= a._rect.x && wx < a._rect.x + a._rect.w && wy >= a._rect.y && wy < a._rect.y + a._rect.h)) continue;
        const t = ex.screenToTile(mx, my); if (!t || t.x !== q.x || t.y !== q.y) continue;
        if (ex.propAt(q.x, q.y) || ex.enemyAt(q.x, q.y) || (ex.map.def.chests || []).some(ch => ch.x === q.x && ch.y === q.y)) continue;
        return { click: c, to: [q.x, q.y] };
      }
      return { hop: [p[0].x - ex.b.x, p[0].y - ex.b.y] };   // nothing clickable on screen (tall walls, HUD): one key hop along the path
    }, [x, y]);
    if (r.done) return true;
    if (r.err) throw new Error(r.err);
    if (r.wait) { const s = await G(); if (s.screen !== 'explore' || s.busy) return false; await sleep(150); continue; }
    if (r.hop) {
      const K = { '0,-1': ['ArrowUp', 'ArrowRight'], '-1,0': ['ArrowUp', 'ArrowLeft'], '1,0': ['ArrowDown', 'ArrowRight'], '0,1': ['ArrowDown', 'ArrowLeft'] }[r.hop.join(',')];
      for (const k of K) await page.keyboard.down(k); await sleep(70); for (const k of K) await page.keyboard.up(k);
      try { await until('!s.moving', 3000); } catch (e) { } await sleep(120);
      const s = await G(); if (s.screen !== 'explore' || s.busy) return false;
      continue;
    }
    await page.mouse.click(r.click.x, r.click.y); await sleep(250);
    try { await until(`(s.tile && s.tile.x === ${r.to[0]} && s.tile.y === ${r.to[1]} && !s.moving) || s.screen !== 'explore' || s.busy`, 15000); } catch (e) { }
    const s = await G(); if (s.screen !== 'explore' || s.busy) return false;   // a scene or a fight opened on the way
  }
  throw new Error('goto timeout');
}
async function runAll(steps) {
  let res = null;
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    if (st.shot && !st.spaceUntil) {   // {"shot": "path.png", "delay": ms}: a screenshot (after a short wait, past a fade-in)
      await sleep(st.delay || 0); await page.screenshot({ path: st.shot }); log.push(i + ' ok shot'); continue;
    }
    if (st.spaceUntil) {   // {"spaceUntil": "expr"}: advance dialog with Space until expr holds (e.g. stop ON a chapter card)
      try { const t0 = Date.now(); for (;;) { const ok = await page.evaluate(src => { const s = window.__game.state(), b = window.__game.battleState(), r = window.__game.rtsState(); return !!eval(src); }, st.spaceUntil); if (ok) { if (st.shot) await page.screenshot({ path: st.shot }); break; } if (Date.now() - t0 > (st.timeout || 30000)) throw new Error('timeout waiting for: ' + st.spaceUntil); const s = await G(); if (s.dialog.open && s.dialog.choices && s.dialog.full) throw new Error('a choice is open'); if (s.dialog.open || s.screen === 'picture') await page.keyboard.press('Space'); await sleep(250); } log.push(i + ' ok spaceUntil'); }
      catch (e) { const s = await G(); return { ok: false, step: i, stepDef: st, error: String(e.message || e), state: { screen: s.screen, map: s.map, tile: s.tile, dialog: s.dialog, quest: s.quest }, log: log.slice(-8) }; }
      continue;
    }
    if (st.fightIf !== undefined) {   // {"fightIf": ms}: a fight the segment plan expects, but this enemy may already be beaten earlier in the run: fight it if it opens within ms
      try { let open = false; try { await until('b', st.fightIf || 6000); open = true; } catch (e) { } if (open) { await fight(); await until('!b', 15000); await sleep(400); } log.push(i + ' ok fightIf ' + (open ? 'fought' : 'none')); }
      catch (e) { const s = await G(); return { ok: false, step: i, stepDef: st, error: String(e.message || e), state: { screen: s.screen, map: s.map, tile: s.tile, dialog: s.dialog, quest: s.quest }, log: log.slice(-8) }; }
      continue;
    }
    if (st.engage) {   // {"engage": "enemyId"}: click that wandering enemy where it is now (real click; Bramble walks up and bumps it), fight it
      try {
        let fought = false;
        for (let k = 0; k < 20 && !fought; k++) {
          const s = await G(); if (await B()) { fought = true; break; }
          const e = s.enemies && s.enemies.find(x => x.id === st.engage); if (!e) break;
          const c = await page.evaluate(([x, y]) => window.__game.tileToScreen(x, y), [e.x, e.y]);
          await page.mouse.click(c.x, c.y); await sleep(900);
          if (await B()) fought = true;
        }
        if (fought) { await fight(); await until('!b', 15000); await sleep(600); await talkthrough(); }
        log.push(i + ' ok engage ' + st.engage + (fought ? ' fought' : ' not found'));
      } catch (e) { const s = await G(); return { ok: false, step: i, stepDef: st, error: String(e.message || e), state: { screen: s.screen, map: s.map, tile: s.tile, dialog: s.dialog, quest: s.quest }, log: log.slice(-8) }; }
      continue;
    }
    if (st.goto) {
      try {
        // a wandering enemy that catches Bramble on the way is fought (counter autopilot), then the walk goes on;
        // any other scene (story dialog, a warp) ends the step: the next steps handle it
        for (let k = 0; k < 12; k++) {
          if (await gotoTile(st.goto[0], st.goto[1], st.timeout || 90000)) break;
          await sleep(600); const b = await B();
          if (b) { await fight(); await until('!b', 15000); await sleep(600); await talkthrough(); await until('s.screen === "explore" && !s.busy', 15000); continue; }
          break;
        }
        log.push(i + ' ok goto' + (st.note ? ' ' + st.note : '')); }
      catch (e) { const s = await G(); return { ok: false, step: i, stepDef: st, error: String(e.message || e), state: { screen: s.screen, map: s.map, tile: s.tile, dialog: s.dialog, quest: s.quest }, log: log.slice(-8) }; }
      continue;
    }
    let j = i; while (j < steps.length && !steps[j].goto && !steps[j].spaceUntil && steps[j].fightIf === undefined && !steps[j].engage && !steps[j].shot) j++;
    res = await run(steps.slice(i, j));
    if (res.error) { res.step += i; return res; }
    i = j - 1;
  }
  const s = await G();
  return res && !steps[steps.length - 1].goto && !steps[steps.length - 1].spaceUntil && steps[steps.length - 1].fightIf === undefined && !steps[steps.length - 1].engage && !steps[steps.length - 1].shot ? res : { ok: false, steps: steps.length, map: s.map, tile: s.tile, quest: s.quest, log: log.slice(-5) };
}
