// Solution player for playwright-cli run-code. Drives the game with REAL input (keys, clicks) and
// reads state through window.__game. Used as:  bash tools/play.sh <session> <segmentIndex|-1> <solution.json>
// (play.sh wraps this file into an `async page => {...}` function with STEPS and SEG filled in).
//
// Step kinds (each may have "note"):
//  {"press": "Space"}                          tap a key ({"times": n} to repeat)
//  {"hold": "ArrowUp", "ms": 600}              hold one key ({"keys": ["ArrowUp","ArrowRight"]} for two)
//  {"walk": [x, y]}                            click that tile and wait until Bramble stands there (or a scene opens)
//  {"hop": "ArrowUp", "n": 3}                  n single hops with that key (waits for each to land)
//  {"click": [x, y]} / {"rclick": [x, y]}      click a tile (no waiting)
//  {"talk": "npcId"}                           click a person (walks over and talks)
//  {"button": "Label"}                         click a canvas button by its label (exact, or starting with "Label")
//  {"talkthrough": true, "choose": [0, 1]}     advance dialog with Space until it closes; picks choices in order
//  {"fight": "auto"}                           fight the open battle to the end with real menu input (the counter policy, decide())
//  {"fight": "maybe"}                          the same if a battle opens within 1.5 s (a wandering enemy on a walk), else nothing
//  {"army": "auto"}                            play the open army battle: preview Start, then orders while paused
//  {"wait": ms}
//  {"until": "js expr using s (state), b (battleState), r (rtsState)", "timeout": ms}
//  {"done": true}                              assert state().segmentComplete
// Controller steps (a fake standard pad, window.__pad; see ensurePad):
//  {"pad": "cross"} tap a button ({"times": n}); {"padHold": ["l2"], "ms": 300}; {"chord": ["r2", "r1"]} hold, then tap the last
//  {"stick": [x, y], "ms": 300} / {"rstick": [x, y]}; {"padHop": "up", "n": 2} grid hops (up = 0,-1); {"padWalk": [x, y]}
//  {"padUse": [x, y]} walk next to a tile, face it, Cross; {"padTalk": "npcId"}; {"padTalkthrough": true, "choose": [..]}
//  {"padKind": "xbox"|"ps"}; {"padConnect": false}; {"padOrder": "nodeId", "all": true}; {"fight": "pad"}; {"army": "pad"}
//  {"expect": "js expr (s, b, r, rum = window.__rumbles)"}; {"js": "async body; may import /src modules; false fails"}; {"mouse": [cssX, cssY]} moves the pointer; {"shot": "file.png"}
const log = [];
const G = () => page.evaluate(() => window.__game.state());
const B = () => page.evaluate(() => window.__game.battleState());
const R = () => page.evaluate(() => window.__game.rtsState());
const sleep = ms => page.waitForTimeout(ms);
async function until(fnSrc, timeout = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const ok = await page.evaluate(src => { const s = window.__game.state(), b = window.__game.battleState(), r = window.__game.rtsState(); return !!eval(src); }, fnSrc);
    if (ok) return true; await sleep(100);
  }
  throw new Error('timeout waiting for: ' + fnSrc);
}
async function btn(label, right) {
  // the battle menu state can flip a frame or two before its buttons are drawn: retry briefly
  let bs = [], b = null;
  for (let i = 0; i < 20 && !b; i++) {
    if (i) await sleep(50);
    bs = await page.evaluate(() => window.__game.buttons());
    b = bs.find(b => b.label === label) || bs.find(b => b.label.startsWith(label));
  }
  if (!b) throw new Error('no button "' + label + '" among ' + bs.map(b => b.label).join(' | '));
  await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2, right ? { button: 'right' } : {});
  await sleep(120);
}
async function tile(x, y, right) {
  const p = await page.evaluate(([x, y]) => window.__game.tileToScreen(x, y), [x, y]);
  await page.mouse.click(p.x, p.y, right ? { button: 'right' } : {}); await sleep(80);
}
async function talkthrough(choices = []) {
  let ci = 0;
  for (let i = 0; i < 400; i++) {
    const s = await G();
    if (s.screen === 'battle' || s.screen === 'rts' || s.screen === 'rts-preview' || s.screen === 'shop') return;
    if (!s.dialog.open && s.screen !== 'recruit' && s.screen !== 'picture' && s.screen !== 'chapter' && s.screen !== 'ending') { if (!s.busy) return; await sleep(150); continue; }
    if (s.dialog.open && s.dialog.choices && s.dialog.full) {
      const want = choices[ci++] || 0;
      for (let k = 0; k < want; k++) { await page.keyboard.press('ArrowDown'); await sleep(40); }
      await page.keyboard.press('Space'); await sleep(150); continue;
    }
    await page.keyboard.press('Space'); await sleep(s.dialog.open && !s.dialog.full ? 60 : 160);
  }
}
// battle policy: the design's COUNTER policy (a port of tools/lib-battle.mjs partyAct, counter mode), decided from
// battleState() and played with real menu input. decide(b) is pure (b = battleState()) and returns a command:
// {k:'story'|'guard'|'tussle'|'skill'|'item', skill, item, target uid}.
function decide(b) {
  const D = b.skillDefs || {};
  const me = b.party.find(p => p.id === b.turn) || b.party[0];
  const foes = b.enemies.filter(e => e.targetable);
  const sk = (b.skills || []).filter(S => S.pl <= me.pl).map(S => [S.id, S]);
  const has = f => sk.find(([, S]) => f(S));
  const party = b.party.filter(p => !p.ko && !p.out);
  if (b.dream && b.storyUsedRound !== b.round) {
    // NG+ (lib-battle ngStory): the memory this teller was there for; past half, let the right teller tell it, or swap one in
    if (b.ng && b.tellers) {
      const left = b.storyAvailable || [], mine = left.find(m => b.tellers[m] === me.id);
      if (mine) return { k: 'story', memory: mine };
      if (b.phase2) {
        const anyRight = left.some(m => party.some(p => p.id === b.tellers[m]));
        if (!anyRight && me.id !== 'bramble') { const r = (b.reserves || []).find(x => !x.ko && left.some(m => b.tellers[m] === x.id)); if (r) return { k: 'swap', reserve: r.uid, name: r.name }; }
        if (anyRight) return { k: 'guard' };
      }
      return { k: 'story', memory: left[0] };
    }
    return { k: 'story' };
  }
  const low = party.slice().sort((a, c) => a.hp / a.max - c.hp / c.max)[0];
  const heal = has(S => S.k === 'heal');
  const hits = sk.filter(([, S]) => S.k === 'hit');
  const pw = S => (S.pw === 'rand' ? 1.6 : S.pw) * (S.hits || 1);
  const boss = b.enemies.find(e => e.boss && !e.ko) || b.enemies.find(e => e.boss);
  const ctr = boss ? boss.counter : null;
  const r = b.round;
  // NG+ second-phase counters (tools/lib-battle.mjs counter2Pre / counter2Post, line for line)
  const c2 = b.phase2 ? b.counter2 : null, ngs = b.ngs || {};
  const lightSk = has(S => S.k === 'hit' && (S.tags || []).includes('Light'));
  if (c2 === 'guard-named' && me.buffs.includes('marked')) { const hide = has(S => S.k === 'buff' && (S.buff === 'hidden' || S.buff === 'hidden-strike') && S.t === 'self'); if (hide) return { k: 'skill', skill: hide[0] }; }
  if (c2 === 'all-hit-eyes' && ngs.seen) return { k: 'guard' };
  if (c2 === 'light-dims' && ngs.dust && !lightSk) return { k: 'guard' };
  if (c2 === 'light-aoe' && ngs.forget) return { k: 'guard' };
  if (c2 === 'hit-eyes') {
    const eyes = foes.filter(e => e.ngEye);
    if (eyes.length) { const ao = hits.find(([, S]) => S.t === 'enemies'); if (ao && eyes.length >= 2) return { k: 'skill', skill: ao[0] }; const on = hits.filter(([, S]) => S.t === 'enemy').sort((a, c) => c[1].pw - a[1].pw)[0]; const t = eyes.slice().sort((a, c) => a.hp - c.hp)[0]; return on ? { k: 'skill', skill: on[0], target: t.uid } : { k: 'tussle', target: t.uid }; }
  }
  // a big hit lands this round: Shielded if nobody has it, else Guard
  const shield = has(S => S.k === 'buff' && S.buff === 'shielded' && S.t === 'allies');
  const shielded = party.every(p => p.buffs.includes('shielded'));
  const bigNow = foes.some(e => (e.charge === 2 && e.mech === 'off-with') || e.strike) || (ctr === 'shield-before' && r % 3 === 0) || foes.some(e => e.mech === 'watcher' && e.eyes >= 6);
  const bigNext = (ctr === 'shield-before' && r % 3 === 2) || ctr === 'shield-guard';   // a fast two-action boss: keep the party Shielded
  if ((bigNow || bigNext) && !shielded && shield) return { k: 'skill', skill: shield[0] };
  if (bigNow && !shielded && !(foes.some(e => e.mech === 'watcher') && foes.some(e => e.eyes > 0))) return { k: 'guard' };
  // an ordinary foe's wind-up names this member (or everyone): Guard it (the "(Guard!)" line; sim.js windup)
  if (me.buffs.includes('marked') || me.buffs.includes('marked-all')) return { k: 'guard' };
  const witch = foes.find(e => e.mech === 'witch'); if (witch && (b.items['water-pail'] || 0) > 0 && !(b.phase2 && ngs.umbrella)) return { k: 'item', item: 'water-pail', target: witch.uid };
  // bring the counter in: a Hummed cure vs a Hum boss (Ninefold Welcome): a non-healer without it swaps itself out for a
  // reserve who has it. (Not done for Light hit-all vs the Hollow Rabbits: Caterpillar waits ungeared in reserve and is
  // knocked out in a round; design/progress/bosses.md.)
  const want = ctr === 'cure' ? S => S.k === 'cure' || (S.cure && S.t !== 'self' && (S.cure.includes('all') || S.cure.includes('hummed'))) : null;
  const can = x => (x.skillIds || []).some(k => D[k] && want(D[k]));
  if (want && me.id !== 'bramble' && !party.some(can) && !(me.skillIds || []).some(k => D[k] && D[k].k === 'heal')) {
    const r = (b.reserves || []).find(x => !x.ko && can(x)); if (r) return { k: 'swap', reserve: r.uid, name: r.name };
  }
  const ko = b.party.find(p => p.ko); const rev = has(S => S.k === 'revive'); if (ko && rev) return { k: 'skill', skill: rev[0], target: ko.uid };
  // cure a Hummed / Asleep friend (or an Afraid hitter) with a skill that really cures that status (Brave Heart only cures Afraid)
  const ill = p => ['hummed', 'asleep', ...(p.str >= p.wit ? ['afraid'] : [])].filter(k => p.statuses.includes(k));
  const cures = (S, ks) => S.k === 'cure' || (S.cure && S.t !== 'self' && (S.cure.includes('all') || ks.some(k => S.cure.includes(k))));
  const sick = party.find(p => ill(p).length && has(S => cures(S, ill(p)))); const cure = sick && has(S => cures(S, ill(sick)));
  if (sick && cure) return { k: 'skill', skill: cure[0], target: sick.uid };
  const healAt = ctr === 'no-guard-on-charge' ? 0.55 : 0.4;
  if (low && low.hp / low.max < healAt && heal) return { k: 'skill', skill: heal[0], target: low.uid };
  if (low && low.hp / low.max < 0.3 && !party.some(p => p !== me && (p.skillIds || []).some(k => D[k] && D[k].k === 'heal' && D[k].pl <= p.pl))) {
    const it = ['dandelion', 'clover-bunch'].find(k => (b.items[k] || 0) > 0); if (it) return { k: 'item', item: it, target: low.uid };
  }
  // Afraid on a fast boss (Tansy)
  if (ctr === 'shield-guard' && boss && !boss.statuses.includes('afraid')) { const fr = has(S => S.k === 'status' && S.status === 'afraid' && S.t === 'enemy'); if (fr) return { k: 'skill', skill: fr[0], target: boss.uid }; }
  if (c2) {
    const single = t => { const on = hits.filter(([, S]) => S.t === 'enemy').sort((a, c) => (c[1].pw === 'rand' ? 1.6 : c[1].pw) * (c[1].hits || 1) - (a[1].pw === 'rand' ? 1.6 : a[1].pw) * (a[1].hits || 1))[0]; return on ? { k: 'skill', skill: on[0], target: t.uid } : { k: 'tussle', target: t.uid }; };
    const ao = hits.filter(([, S]) => S.t === 'enemies').sort((a, c) => c[1].pw - a[1].pw)[0];
    if (c2 === 'aoe-then-boss') { const lads = foes.filter(e => !e.boss); if (lads.length >= 2 && ao && me.pl >= ao[1].pl) return { k: 'skill', skill: ao[0] }; if (boss && boss.buffs.includes('shielded') && lads.length) return single(lads.slice().sort((a, c) => a.hp - c.hp)[0]); }
    if (c2 === 'aoe-glowing' && foes.filter(e => e.glow && !e.silenced).length >= 2 && ao && me.pl >= ao[1].pl) return { k: 'skill', skill: ao[0] };
    if (c2 === 'focus-verse' && ngs.verse > 0 && boss && boss.targetable) return single(boss);
    if (c2 === 'light-dims' && boss && boss.targetable && (ngs.glow || 0) >= 2 && lightSk) return { k: 'skill', skill: lightSk[0], target: boss.uid };
    if (c2 === 'afraid-unroots' && boss && ngs.rooted && !boss.statuses.includes('afraid')) { const f = has(S => S.k === 'status' && S.status === 'afraid' && (S.t === 'enemy' || S.t === 'enemies')); if (f) return { k: 'skill', skill: f[0], target: boss.uid }; }
    if (c2 === 'dig-backfill' && boss && boss.targetable && (ngs.hole || 0) >= 2) { const d = has(S => S.k === 'hit' && (S.tags || []).includes('Dig')); if (d) return { k: 'skill', skill: d[0], target: boss.uid }; }
    if (c2 === 'light-aoe' && foes.filter(e => e.id === 'hollow-rabbits').length === 2) { const t = foes.slice().sort((a, c) => a.hp - c.hp)[0]; if (lightSk) return { k: 'skill', skill: lightSk[0], target: t.uid }; return single(t); }
    if (c2 === 'rescue-hole') { const h = foes.find(e => e.id === 'dream-hole'); if (h) return { k: 'tussle', target: h.uid }; }
    if (c2 === 'thump-drone' && me.id === 'bramble' && boss && boss.targetable && ngs.drone) { const t = has(S => S.name === 'Thump'); if (t) return { k: 'skill', skill: t[0], target: boss.uid }; }
  }
  let tgt = foes.find(e => e.glow) || foes.find(e => e.eyes > 0) || foes.slice().sort((a, c) => a.hp - c.hp)[0];
  if ((ctr === 'aoe-on-summon' || ctr === 'swap' || ctr === 'guard-submerged') && boss && boss.targetable) tgt = boss;
  if (ctr === 'light' && boss && foes.filter(e => !e.boss).length <= 1 && boss.targetable) tgt = boss;   // keep the last moth alive
  const light = foes.some(e => e.eerie);
  const lt = S => light && (S.tags || []).includes('Light') ? 1.5 : 1;
  const aoe = hits.filter(([, S]) => S.t === 'enemies').sort((a, c) => pw(c[1]) * lt(c[1]) - pw(a[1]) * lt(a[1]))[0];
  const one = hits.filter(([, S]) => S.t === 'enemy').sort((a, c) => pw(c[1]) * lt(c[1]) - pw(a[1]) * lt(a[1]))[0];
  const focus = foes.some(e => e.glow || e.eyes > 0);
  const unsp = has(S => S.humBonus && S.t === 'enemies'); if (unsp && foes.filter(e => e.hum).length >= 2 && me.pl >= unsp[1].pl + 2) return { k: 'skill', skill: unsp[0] };   // Ninefold vs the Hum-taken
  if (aoe && !focus && foes.length >= 2 && me.pl >= aoe[1].pl + 2) return { k: 'skill', skill: aoe[0] };
  if (one && tgt) return { k: 'skill', skill: one[0], target: tgt.uid };
  return { k: 'tussle', target: tgt && tgt.uid };
}
async function fight() {
  for (let i = 0; i < 2000; i++) {
    const b = await B();
    if (!b) return;
    if (b.phase === 'results') { if (b.resultsReady) { await page.keyboard.press('Space'); await sleep(400); } else await sleep(200); continue; }
    const m = b.menu;
    if (!m) { await sleep(120); continue; }
    if (m.mode !== 'cmd') { await page.keyboard.press('Escape'); await sleep(80); continue; }
    let c = decide(b);
    // the dream: tell a story (the command only shows in the dream; skip it once the memories run out)
    if (c.k === 'story') { if (m.cmds.includes('Tell a Story') && !m.disabled.includes('Tell a Story')) { await btn('Tell a Story'); await sleep(150); if (c.memory) await pickFromList(c.memory); else await page.keyboard.press('Space'); await sleep(300); continue; } c = decide({ ...b, dream: false }); }
    if (c.k === 'item' && m.disabled.includes('Item')) c = { k: 'guard' };
    if (c.k === 'swap') { if (m.disabled.includes('Swap')) c = { k: 'guard' }; else { await btn('Swap'); await sleep(120); await pickFromList(c.name); await sleep(300); continue; } }
    if ((c.k === 'tussle' || (c.k === 'skill' && b.skillDefs[c.skill] && b.skillDefs[c.skill].t === 'enemy')) && !b.enemies.some(e => e.targetable && !e.ko)) c = { k: 'guard' };   // nothing targetable (e.g. a submerged boss): guard rather than wait forever
    if (c.k === 'guard') { await btn('Guard'); await sleep(200); continue; }
    if (c.k === 'skill') { await useSkill(c.skill, c.target); continue; }
    if (c.k === 'item') { await btn('Item'); await sleep(120); await pickFromList(c.item); await sleep(150); await target(c.target); continue; }
    await btn('Tussle'); await sleep(120); await target(c.target);
  }
  async function pickFromList(id) {
    const b2 = await B(); if (!b2 || !b2.menu || b2.menu.mode !== 'list') return;
    const i = Math.max(0, b2.menu.list.indexOf(id)); let cur = b2.menu.lsel || 0;
    while (cur !== i) { await page.keyboard.press('ArrowDown'); await sleep(30); cur = (cur + 1) % b2.menu.list.length; }
    await page.keyboard.press('Space'); await sleep(150);
  }
  async function useSkill(id, uid) {
    await btn('Skill'); await sleep(120);
    await pickFromList(id);
    const b3 = await B(); if (b3 && b3.menu && b3.menu.mode === 'target') await target(uid);
    await sleep(150);
  }
  async function target(uid) {
    const b2 = await B(); if (!b2 || !b2.menu || b2.menu.mode !== 'target') return;
    const ts = b2.menu.targets; let i = ts.indexOf(uid); if (i < 0) i = b2.menu.tsel;
    let cur = b2.menu.tsel; let guard = 0;
    while (cur !== i && guard++ < 10) { await page.keyboard.press('ArrowRight'); await sleep(30); cur = (cur + 1) % ts.length; }
    await page.keyboard.press('Space'); await sleep(250);
  }
}
// army autopilot: start from the preview, then every few seconds pause, order each squad to the nearest node it
// doesn't hold (stout/wing split toward the mouth), unpause. Uses real clicks and letter keys.
async function army() {
  let s = await G();
  if (s.screen === 'rts-preview') { await btn('Start the battle'); await sleep(1500); }
  for (let i = 0; i < 400; i++) {
    const r = await R(); if (!r) return; if (r.result) { await sleep(2500); return; }
    if (r.prompt) { await page.keyboard.press('Space'); await sleep(300); }
    if (!r.paused) { await page.keyboard.press('Space'); await sleep(150); }
    const r2 = await R(); if (!r2 || r2.result) continue;
    const mine = r2.squads.filter(q => q.side === 'player' && !q.worn);
    const notMine = r2.nodes.filter(n => n.owner !== 'player');
    const mouth = r2.nodes.find(n => n.kind === 'warren' || n.id === 'mouth') || notMine[notMine.length - 1];
    for (let k = 0; k < mine.length; k++) {
      const q = mine[k]; if (q.contact) continue;
      let tgt = null;
      if (r2.thumpT !== undefined && r2.nodes.some(n => n.kind === 'thump')) { const st = r2.nodes.filter(n => n.kind === 'thump'); tgt = st[k % st.length]; }
      else { const cand = notMine.slice().sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y)); tgt = k % 3 === 2 && mouth ? mouth : cand[0] || mouth; }
      if (!tgt || q.at === tgt.id) continue;
      const li = r2.list.indexOf(q.id); if (li < 0) continue;
      if (li < 10) await page.keyboard.press('Digit' + ((li + 1) % 10)); else continue;
      await sleep(40); await page.keyboard.press('Key' + tgt.letter); await sleep(40);
    }
    // reinforce the hurt ones
    await page.keyboard.press('Space'); await sleep(3000);
  }
}
// ---- controller steps: a fake "standard" pad (window.__pad) that navigator.getGamepads returns; the game polls it
const PADB = ['cross', 'circle', 'square', 'triangle', 'l1', 'r1', 'l2', 'r2', 'create', 'options', 'l3', 'r3', 'up', 'down', 'left', 'right'];
async function ensurePad(kind) {
  await page.evaluate(k => {
    const ids = { ps: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)', xbox: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)' };
    if (!window.__pad) {
      window.__rumbles = [];
      window.__pad = { id: ids[k || 'ps'], index: 0, connected: true, mapping: 'standard', timestamp: performance.now(),
        buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), axes: [0, 0, 0, 0],
        vibrationActuator: { type: 'dual-rumble', effects: ['dual-rumble', 'trigger-rumble'], playEffect: (t, p) => { window.__rumbles.push({ type: t, ...p, at: performance.now() }); return Promise.resolve('complete'); }, reset: () => Promise.resolve('complete') } };
      navigator.getGamepads = () => [window.__pad.connected ? window.__pad : null, null, null, null];
      window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad }));
    } else if (k) window.__pad.id = ids[k];
  }, kind || null);
}
async function padSet(names, on) {
  await ensurePad();
  await page.evaluate(([ns, on, B]) => { for (const n of ns) { const b = window.__pad.buttons[B.indexOf(n)]; b.pressed = on; b.touched = on; b.value = on ? 1 : 0; } window.__pad.timestamp = performance.now(); }, [names, on, PADB]);
}
async function padAxes(i, x, y) { await ensurePad(); await page.evaluate(([i, x, y]) => { window.__pad.axes[i] = x; window.__pad.axes[i + 1] = y; window.__pad.timestamp = performance.now(); }, [i, x, y]); }
// a tap: held ~4 frames, then released
async function tap(name, gap = 90) { const ns = [].concat(name); await padSet(ns, true); await sleep(70); await padSet(ns, false); await sleep(gap); }
// a chord: hold the first buttons, tap the last
async function chord(names, gap = 120) { const hold = names.slice(0, -1), last = names[names.length - 1]; await padSet(hold, true); await sleep(60); await tap(last, 60); await padSet(hold, false); await sleep(gap); }
const STEPDIR = { '0,-1': [0.75, -0.75], '-1,0': [-0.75, -0.75], '1,0': [0.75, 0.75], '0,1': [-0.75, 0.75] };
// one hop with the stick (screen-relative diagonals are clean grid steps)
async function padStep(dx, dy) {
  const [x, y] = STEPDIR[dx + ',' + dy]; const a = (await G()).tile;
  await padAxes(0, x, y);
  const t0 = Date.now(); let moved = false;
  while (Date.now() - t0 < 600) { const s = await G(); if (s.moving || (s.tile && (s.tile.x !== a.x || s.tile.y !== a.y)) || s.screen !== 'explore' || s.busy) { moved = true; break; } await sleep(15); }
  await padAxes(0, 0, 0);
  if (moved) await until('!s.moving || s.screen !== "explore" || s.busy', 4000);
  await sleep(40);
  return moved;
}
async function pathTo(x, y, near) {
  return page.evaluate(async ([x, y, near]) => {
    const { G } = await import('/src/core.js'); const { findPath } = await import('/src/engine/path.js');
    const ex = G.scenes.find(s => s.kind === 'explore'); if (!ex) return null;
    const goals = near ? [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] : [[x, y]];
    let best = null;
    for (const [gx, gy] of goals) {
      if (ex.b.x === gx && ex.b.y === gy) return { path: [], at: [gx, gy] };
      const p = findPath(ex.b.x, ex.b.y, gx, gy, (a, b, c, d) => ex.canStep(a, b, c, d), (a, b) => ex.hAt(a, b), 20000);
      if (p && (!best || p.length < best.path.length)) best = { path: p.map(q => [q.x, q.y]), at: [gx, gy] };
    }
    return best;
  }, [x, y, !!near]);
}
// walk with the stick along the game's own A* path (re-planned if a hop doesn't land)
async function padWalk(x, y, near) {
  for (let tries = 0; tries < 6; tries++) {
    const p = await pathTo(x, y, near); if (!p) throw new Error('padWalk: no path to ' + x + ',' + y);
    let ok = true;
    for (const [px, py] of p.path) {
      const s = await G(); if (s.screen !== 'explore' || s.busy) return;
      const dx = px - s.tile.x, dy = py - s.tile.y;
      if (Math.abs(dx) + Math.abs(dy) !== 1) { ok = false; break; }
      await padStep(dx, dy);
      const s2 = await G(); if (!s2.tile || s2.tile.x !== px || s2.tile.y !== py) { ok = false; break; }
    }
    if (ok) return p.at;
  }
  throw new Error('padWalk: could not reach ' + x + ',' + y);
}
// walk next to someone (or something), face it with the stick, and press Cross
async function padUse(x, y) {
  const at = await padWalk(x, y, true); if (!at) return;
  const s = await G(); if (s.screen !== 'explore' || s.busy) return;
  const [ax, ay] = STEPDIR[(x - s.tile.x) + ',' + (y - s.tile.y)] || [0, 0];
  if (ax || ay) { await padAxes(0, ax, ay); await sleep(70); await padAxes(0, 0, 0); await sleep(120); }
  await tap('cross', 150);
}
async function padTalkthrough(choices = []) {
  let ci = 0;
  for (let i = 0; i < 400; i++) {
    const s = await G();
    if (s.screen === 'battle' || s.screen === 'rts' || s.screen === 'rts-preview' || s.screen === 'shop') return;
    if (!s.dialog.open && s.screen !== 'recruit' && s.screen !== 'picture' && s.screen !== 'chapter' && s.screen !== 'ending') { if (!s.busy) return; await sleep(150); continue; }
    if (s.dialog.open && s.dialog.choices && s.dialog.full) {
      const want = choices[ci++] || 0;
      for (let k = 0; k < want; k++) await tap('down', 50);
      await tap('cross', 150); continue;
    }
    await tap('cross', s.dialog.open && !s.dialog.full ? 40 : 140);
  }
}
// army: select every squad (Square twice), steer the cursor to a node with the stick, Cross
async function padCursorTo(id) {
  for (let k = 0; k < 14; k++) {
    const r = await R(); if (!r) return false; if (r.cursor === id) return true;
    const a = r.nodes.find(n => n.id === r.cursor), b = r.nodes.find(n => n.id === id); if (!a || !b) return false;
    const dx = b.screen.x - a.screen.x, dy = b.screen.y - a.screen.y, d = Math.hypot(dx, dy) || 1;
    await padAxes(0, dx / d, dy / d); await sleep(70); await padAxes(0, 0, 0); await sleep(80);
  }
  return (await R()).cursor === id;
}
async function padSelectAll() { await tap('square', 40); await tap('square', 120); }
async function padOrder(id, all) {
  if (all) await padSelectAll();
  if (!await padCursorTo(id)) throw new Error('cursor never reached ' + id);
  await tap('cross', 150);
}
async function armyPad() {
  let s = await G();
  if (s.screen === 'rts-preview') { await tap('triangle'); await sleep(1500); }
  for (let i = 0; i < 400; i++) {
    const r = await R(); if (!r) return; if (r.result) { await sleep(2500); return; }
    if (r.tipWait) { await tap('cross', 200); continue; }
    if (!r.paused) { await tap('create', 120); }
    const r2 = await R(); if (!r2 || r2.result) continue;
    const mine = r2.squads.filter(q => q.side === 'player' && !q.worn);
    const notMine = r2.nodes.filter(n => n.owner !== 'player');
    const mouth = r2.nodes.find(n => n.kind === 'warren' || n.id === 'mouth') || notMine[notMine.length - 1];
    for (let k = 0; k < mine.length; k++) {
      const q = mine[k]; if (q.contact) continue;
      let tgt = null;
      if (r2.thumpT !== undefined && r2.nodes.some(n => n.kind === 'thump')) { const st = r2.nodes.filter(n => n.kind === 'thump'); tgt = st[k % st.length]; }
      else { const cand = notMine.slice().sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y)); tgt = k % 3 === 2 && mouth ? mouth : cand[0] || mouth; }
      if (!tgt || q.at === tgt.id) continue;
      // R1 until just this squad is selected
      for (let j = 0; j < 15; j++) { const r3 = await R(); if (!r3 || (r3.selected.length === 1 && r3.selected[0] === q.id)) break; await tap('r1', 40); }
      if (!await padCursorTo(tgt.id)) continue;
      await tap('cross', 60);
    }
    await tap('create', 120); await sleep(3000);
  }
}
// RPG battle with the pad: the same decide() policy, every choice reached with the d-pad and Cross
async function fightPad() {
  async function cmd(label) {
    for (let k = 0; k < 12; k++) {
      const b = await B(); if (!b || !b.menu || b.menu.mode !== 'cmd') return;
      const i = b.menu.cmds.indexOf(label); if (i < 0) throw new Error('no command ' + label);
      const m = b.menu; if (m.sel === i) break;
      if (Math.floor(m.sel / 2) !== Math.floor(i / 2)) await tap('down', 40); else await tap('right', 40);
    }
    await tap('cross', 120);
  }
  async function pick(id) {
    const b2 = await B(); if (!b2 || !b2.menu || b2.menu.mode !== 'list') return;
    const i = Math.max(0, b2.menu.list.indexOf(id)); let cur = b2.menu.lsel || 0;
    while (cur !== i) { await tap('down', 30); cur = (cur + 1) % b2.menu.list.length; }
    await tap('cross', 150);
  }
  async function target(uid) {
    const b2 = await B(); if (!b2 || !b2.menu || b2.menu.mode !== 'target') return;
    const ts = b2.menu.targets; let i = ts.indexOf(uid); if (i < 0) i = b2.menu.tsel;
    let cur = b2.menu.tsel, guard = 0;
    while (cur !== i && guard++ < 10) { await tap('right', 30); cur = (cur + 1) % ts.length; }
    await tap('cross', 250);
  }
  for (let i = 0; i < 2000; i++) {
    const b = await B();
    if (!b) return;
    if (b.phase === 'results') { if (b.resultsReady) { await tap('cross', 400); } else await sleep(200); continue; }
    const m = b.menu;
    if (!m) { await sleep(120); continue; }
    if (m.mode !== 'cmd') { await tap('circle', 80); continue; }
    let c = decide(b);
    if (c.k === 'story') { if (m.cmds.includes('Tell a Story') && !m.disabled.includes('Tell a Story')) { await cmd('Tell a Story'); await sleep(150); if (c.memory) await pick(c.memory); else await tap('cross'); await sleep(300); continue; } c = decide({ ...b, dream: false }); }
    if (c.k === 'item' && m.disabled.includes('Item')) c = { k: 'guard' };
    if (c.k === 'swap') { if (m.disabled.includes('Swap')) c = { k: 'guard' }; else { await cmd('Swap'); await sleep(120); await pick(c.name); await sleep(300); continue; } }
    if ((c.k === 'tussle' || (c.k === 'skill' && b.skillDefs[c.skill] && b.skillDefs[c.skill].t === 'enemy')) && !b.enemies.some(e => e.targetable && !e.ko)) c = { k: 'guard' };
    if (c.k === 'guard') { await cmd('Guard'); await sleep(200); continue; }
    if (c.k === 'skill') { await cmd('Skill'); await sleep(120); await pick(c.skill); const b3 = await B(); if (b3 && b3.menu && b3.menu.mode === 'target') await target(c.target); await sleep(150); continue; }
    if (c.k === 'item') { await cmd('Item'); await sleep(120); await pick(c.item); await sleep(150); await target(c.target); continue; }
    await cmd('Tussle'); await sleep(120); await target(c.target);
  }
}
async function padStepRun(st) {
  if (st.pad) { await ensurePad(); for (let k = 0; k < (st.times || 1); k++) await tap(st.pad, st.gap || 120); return true; }
  if (st.padHold) { await ensurePad(); await padSet(st.padHold, true); await sleep(st.ms || 200); await padSet(st.padHold, false); await sleep(120); return true; }
  if (st.chord) { await ensurePad(); await chord(st.chord); return true; }
  if (st.stick || st.rstick) { const [x, y] = st.stick || st.rstick, i = st.stick ? 0 : 2; await padAxes(i, x, y); await sleep(st.ms || 300); await padAxes(i, 0, 0); await sleep(150); return true; }
  if (st.padHop) { const d = { up: '0,-1', left: '-1,0', right: '1,0', down: '0,1' }[st.padHop] || st.padHop; const [dx, dy] = d.split(',').map(Number); for (let k = 0; k < (st.n || 1); k++) await padStep(dx, dy); return true; }
  if (st.padWalk) { await padWalk(st.padWalk[0], st.padWalk[1]); return true; }
  if (st.padUse) { await padUse(st.padUse[0], st.padUse[1]); return true; }
  if (st.padTalk) { const s = await G(); const a = s.npcs.find(n => n.id === st.padTalk); if (!a) throw new Error('no npc ' + st.padTalk); await padUse(a.x, a.y); await until('s.dialog.open || s.screen !== "explore"', st.timeout || 20000); return true; }
  if (st.padTalkthrough) { await padTalkthrough(st.choose || []); return true; }
  if (st.padKind) { await ensurePad(st.padKind); await tap('l3', 100); return true; }
  if (st.padConnect !== undefined) { await ensurePad(); await page.evaluate(on => { window.__pad.connected = on; window.__pad.timestamp = performance.now(); if (!on) window.dispatchEvent(Object.assign(new Event('gamepaddisconnected'), { gamepad: window.__pad })); }, st.padConnect); await sleep(300); return true; }
  if (st.padOrder) { await padOrder(st.padOrder, st.all); return true; }
  if (st.fight === 'pad') { await until('b', 8000); await fightPad(); await until('!b', 15000); await sleep(400); return true; }
  if (st.army === 'pad') { await until('s.screen === "rts" || s.screen === "rts-preview"', 8000); await armyPad(); await until('!r', 15000); await sleep(400); return true; }
  if (st.shot) { await sleep(st.ms || 250); await page.screenshot({ path: st.shot }); return true; }
  if (st.mouse) { await page.mouse.move(st.mouse[0], st.mouse[1]); await sleep(120); return true; }
  if (st.js) { const r = await page.evaluate(src => (new Function('return (async () => {' + src + '})()'))(), st.js); if (r === false) throw new Error('js step returned false: ' + st.js); return true; }
  if (st.expect) { const ok = await page.evaluate(src => { const s = window.__game.state(), b = window.__game.battleState(), r = window.__game.rtsState(); const rum = window.__rumbles || []; return !!eval(src); }, st.expect); if (!ok) throw new Error('expect failed: ' + st.expect); return true; }
  return false;
}
async function run(steps) {
  for (const [i, st] of steps.entries()) {
    try {
      if (st.pass) { log.push(i + ' pass'); return { ok: true, steps: steps.length, log: log.slice(-5) }; }
      if (await padStepRun(st)) { /* a controller step */ }
      else if (st.press) { for (let k = 0; k < (st.times || 1); k++) { await page.keyboard.press(st.press); await sleep(st.gap || 120); } }
      else if (st.hold || st.keys) { const ks = st.keys || [st.hold]; for (const k of ks) await page.keyboard.down(k); await sleep(st.ms || 300); for (const k of ks) await page.keyboard.up(k); await sleep(250); }
      else if (st.hop) { for (let k = 0; k < (st.n || 1); k++) { const a = (await G()).tile; await page.keyboard.down(st.hop); await sleep(40); await page.keyboard.up(st.hop); await until('!s.moving || s.screen !== "explore"', 3000); await sleep(60); const b0 = (await G()); if (b0.screen !== 'explore') break; } }
      else if (st.walk) { await tile(st.walk[0], st.walk[1]); await until(`(s.tile && s.tile.x === ${st.walk[0]} && s.tile.y === ${st.walk[1]} && !s.moving) || s.screen !== 'explore' || s.busy`, st.timeout || 20000); await sleep(150); }
      else if (st.click) { await tile(st.click[0], st.click[1]); }
      else if (st.rclick) { await tile(st.rclick[0], st.rclick[1], true); }
      else if (st.talk) { const s = await G(); const a = s.npcs.find(n => n.id === st.talk); if (!a) throw new Error('no npc ' + st.talk); await tile(a.x, a.y - 0); await until('s.dialog.open || s.screen !== "explore"', st.timeout || 20000); }
      else if (st.button) { await btn(st.button); }
      else if (st.talkthrough) { await talkthrough(st.choose || []); }
      else if (st.fight === 'maybe') { let open = false; try { await until('b', 1500); open = true; } catch (e) { } if (open) { await fight(); await until('!b', 15000); await sleep(400); } }
      else if (st.fight) { await until('b', 8000); await fight(); await until('!b', 15000); await sleep(400); }
      else if (st.army) { await until('s.screen === "rts" || s.screen === "rts-preview"', 8000); await army(); await until('!r', 15000); await sleep(400); }
      else if (st.wait) await sleep(st.wait);
      else if (st.until) await until(st.until, st.timeout || 15000);
      else if (st.done) { const s = await G(); if (!s.segmentComplete) throw new Error('segment not complete'); }
      log.push(i + ' ok' + (st.note ? ' ' + st.note : ''));
    } catch (e) {
      const s = await G();
      return { ok: false, step: i, stepDef: st, error: String(e.message || e), state: { screen: s.screen, map: s.map, tile: s.tile, dialog: s.dialog, quest: s.quest }, log: log.slice(-8) };
    }
  }
  const s = await G();
  return { ok: s.segmentComplete, steps: steps.length, segment: s.segment, map: s.map, tile: s.tile, quest: s.quest, log: log.slice(-5) };
}
