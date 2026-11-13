# Whole-game balance pass (balance helper)

## Findings at start
- `node tools/balance.mjs --all` crashed: ch0 first-fight onRound calls game state (member()). Fixed in tools/lib-battle.mjs
  (onRound wrapped in try/catch). After that: 37 problems: every boss 3-8 rounds (target 8-15), plain AI == counter AI,
  many normal fights 1-2 rounds (ch4 worst).
- New tool `tools/curve.mjs`: plays every visible map enemy (x0.9) + scripted battles in play order, reports party level at
  each segment start and boss vs targets, and button income per chapter vs the design's purchases.
- Curve with the design's formulas (enemy XP 8*L*tier, bosses x5; xpNext 12*L^1.6+20): party is L9.4 at c1-toadhall
  (target 7), L15.7 at the Queen (11), L20 at Aster (13), L30 by the Witch (21). The formulas give ~3x too much XP for
  the content (design itself: 40 fights in ch1 x 2.5 enemies x 64 XP = 6400 vs ~2200 needed for L3->11).
- Buttons: income/cost ratio ch1 3.5, ch2 2.1, ch3 1.4, ch4 1.25 (target >= 1.1, near the table's 1.1-1.6).

## Plan
1. Refit the XP curve (xpNext / enemy XP, numbers in state.js + sim.js) so the curve hits targets; then per-chapter fixes.
2. ch4: restore 3-4 enemy fights, drop the Hollow Rabbits' XP cut; all bosses 8-15 rounds (BOSSES hpMult in core data).
3. Choir threat; plain-AI tool fix (shared AI in lib-battle, battle-check uses it); economy; RTS curve; replays.

## Log
- [step 1 done] XP curve: xpNext 12*L^1.6+20 -> 55*L^1.4+60 (game/src/state.js + battle/sim.js; enemy XP 8*L*tier unchanged).
  Content: ch0 first-fight xp 40->200; Depths fights 1-2 -> 2-3 enemies + xp 25 each; riverbank 4 + wildwood 3 fights 2->3
  enemies; Choir mouths' XP /3 (three boss shares = one); Hollow Rabbits XP x0.3 -> x0.25 (4 shares = one boss);
  ch4 normal fights restored to 3-4 enemies (tier mix); Chief Weasel 9->8; Drowned enemies +1 (16-17), Tansy 16->17,
  Tidewarden 17->18; Wheatsheaf hum fights 17->18, Barley 18->19, kalidah-1 17->18; finale bosses 28->27, shapes 27->26.
  Segment party levels: c1w-shallows 10->11, c1-rts1/c1-greatburrow 11->12, c2-drowned 15->16, c3-rts3/c3-barley 17->18,
  c3-oz-a 18->19, c3-china 20->21, c5-dream 27->26, c5-ending 28->27. tools/curve.mjs: all within 1 level.
- [step 2 done] Tools: lib-battle.mjs now has ONE party AI with two modes. plain = heal <40%, else strongest skill at the
  weakest foe (hit-all at 3+), no Guard/items/cures/mechanic reading. counter = the boss's counter policy (Shielded/Guard
  on the round a big hit lands, Quarry's collapse rounds, Tansy: keep Shielded, focus the Chief/Tidewarden, keep the
  last moth, Light vs Eerie, cure, revive, pails, glowing mouth/open eyes). battle-check.mjs now uses it (--plain,
  --gear T); before, --plain only skipped Guard and pails, so for most bosses both runs were identical (same seeds).
  balance.mjs: COUNTER_PARTY (Hollow Rabbits: Caterpillar's Light hit-all in the three).
- ENGINE BUG fixed (game/src/battle/sim.js mechRoundStart 'choir'): every mouth cleared the glow the first mouth had
  just set, so no mouth ever glowed or spoke: the Choir did nothing at all (not only with Ninefold). Now only the first
  mouth runs the rotation.
- Choir threat: mouth WIT x1.5 -> x2.4 (an unsilenced line deals real damage even when Ninefold blocks the Afraid) and a
  Carving that Moves (11, tier 1) guards the mouths (steady pressure). Counter 11 rounds 78% Heart; plain loses ~half.
- Boss tweaks (HP / STR multipliers on top of the x8 template): Chief Weasel HP x0.5->0.65 STR x1.25; Queen HP
  x0.38->0.855 STR x1.5; Aster HP x2 STR/WIT x1.25 (new); Moth Queen HP x2.25 STR/WIT x1.25 (new); Tansy HP x1.2->1.56
  STR x1.95; Tidewarden HP x0.6->1.05 STR x1.4->2.24 WIT x1.6; Barley HP x1.5 STR x1.25 (new); Witch HP x2.2->4.4;
  Watcher HP x1.6->2.8 STR/WIT x1.25; Quarry HP x1.5 STR x1.5 (new); Hollow Rabbits HP x3.3 (new); Nightmare of
  Deepdelve HP x1.1->1.9, of Flintcomb x1.5->1.9.
- [step 3 done] Normal fights were 2-3 rounds everywhere (not only ch4; the formulas + gear + 4th/5th skills).
  core/enemies.js TEMPLATES Heart x1.3 (brute 36->47, quick 26->34, caster 24->31, swarm 30->39, flyer 24->31,
  eerie 30->39); BOSSES hpMult 6.2 (= the old x8 of the old Heart; Hollow Rabbits 1.54 = old x2), so boss Heart unchanged.
  Per-chapter `hardy(k)` Heart tweaks on normal fights where the party out-scales them: c1 bc/rd/th x1.3, c1w pepper-1
  x1.25, c2 moon mn-1..3 x1.45, mn-4..6/mg x1.25, c3 road/wolves/crows/winkies/hammer/stair x1.25, c4 x1.6 (fc-s1/s2,
  tb-1..4 x1.9, fc-6 x1.3). c4.ro-4 back to 3 enemies. Queen HP x0.855->0.73, Tidewarden x1.05->0.68, Aster x2->1.8.
- balance.mjs --all now runs every map's fights as a whole-dungeon run (lib-battle runDungeon: Heart/Pluck carried,
  30% Pluck after wins, no rest) and checks 3-6 rounds per map from that (fresh fights only checked for 12/12 wins).
  All 38 maps ok. Bosses: 11/15 ok. Explained outliers: Barley (plough breaks Guard; the plain AI never guards, so it
  is immune by construction), Nightmare of Flintcomb and Aster-like Hum bosses (Hummed only redirects half the hummed
  member's actions; curing costs about what it saves), Undersleeper's Eye (5 stories end the dream: always 5 rounds,
  engine rule; a story-telling finale, not a fight).
- [step 4 done] Buttons: drops 3*L -> 2*L per enemy (engine number, game/src/battle/sim.js makeEnemy); ch1+ch1w chests
  and scripted gifts x0.4, ch2 chests/gifts x0.5 (rounded to 5). Income (80% of visible fights + bosses + chests + gifts)
  vs assumed purchases (9 gear of the chapter tier + 4 army items + items): ch1 2537/1245 (2.0x; design ~2300),
  ch2 3389/2655 (1.28x; ~3200), ch3 4965/4435 (1.12x; ~5000), ch4 6949/5835 (1.19x; ~6700). No solution buys anything.
- [step 5 done] Army curve (rts-check sim, required squads only/no gear -> required + rank gear -> +optional + gear;
  % = HP left): rts1 tier 1.0->0.93: Even 33% / Strong 58% / Strong 58%; rts2 (1.0): Even 35% / Strong 72% / 74%;
  rts3 (1.35): Even 38% / Strong 83% / 89%; rts4 (1.3): Even 27% / Strong 73% / 77%; rts5 (2.6): Even 23% / Strong 77% / 66%.
  Sensible: every battle Even with required squads (the hardest are RTS4/5 as designed), Strong with gear. rts5's 2.6 is
  not comparable with the others (continuous spawns that slow with stones held, 0.6-1.6 HP dream shapes vs rank 1.48).
  RTS1 was the hardest-but-one (23%) before; now easiest-ish as the tutorial should be.
- Docs: GAME_DESIGN formulas/templates/target-levels lines and BIBLE 'Levels' line updated to the new numbers.
- [step 6 running] Replays (session "bal"), batch 1: c2-drowned c1w-wonder-b c0-attack c1-depths c1-riverbank c1-toadhall.
  Results go below as they come.
  - c2-drowned: FAILED first run (lost the Tansy fight to the autopilot; party back at the door). Tansy eased: HP x1.2*1.2, STR x1.6 (counter 30/30 8.7r at L16 with the segment's Jade+Badger). Tansy now a plain-AI outlier (a story rescue, not a wall).
  - c1w-wonder-b: FAILED first run (Queen beat the autopilot at L9-10). Queen eased: HP x0.73->0.65, STR x1.5->1.3 (counter 30/30 9.7r 46% Heart at L10 Badger+Mole t2); now a plain-AI outlier.
- Autopilot (tools/play.js fight) is weaker than the counter AI, so bosses were eased to win 12/12 with each segment's
  real team at its start level (scratchpad segboss check): Aster HP x1.6 STR/WIT x1.15; Moth Queen HP x1.7 STR/WIT x1.2;
  Tidewarden HP x0.6 STR x2.1; Barley HP x1.45 STR x1.15; Quarry HP x1.3 STR x1.35; Hollow Rabbits HP x3.1.
  - c0-attack: ok
  - c1-depths: FAILED (walk/battle timing). Cause: Depths/early River Bank fights I'd grown to 3 enemies (+1.3x Heart) are
    too much for Bramble + Burdock alone. Reverted Depths and rb-weasels/rb-stoat to 2 enemies; Depths fights now xp +60
    each and Heart x0.8 (d-tanglers at L4 plain 30/30, 5 rounds). Curve still ok (depths 3.0, riverbank 4.7, toadhall 6.7).
  - c1-riverbank: FAILED at step 118 (a battle started during the walk to Badger's door). Investigating.
  - c1-toadhall: ok after inserting a fight (a riverbank stoat now catches Bramble on the bank path; steps 38-41).
  - c1-riverbank: solution patched (fight inserted after step 114, a Wild Wood weasel), replay pending.
  - NOTE: batch 1-2 replays ran on modules cached at page open (04:24), before later edits: their failures are not conclusive. replay.sh now reloads the page before each run.
  - batch 3 (page reloaded): c2-drowned ok, c1-toadhall ok, c1w-wonder-a ok, c1w-shallows ok. c1-riverbank: my inserted
    fight was an artefact of the stale page; removed again (original solution). c1-depths: lost a Depths fight with
    Bramble+Burdock carrying damage: Depths Heart x0.8 -> x0.65. c1w-wonder-b: Queen lost again: QHP 0.65->0.6,
    QSTR 1.3->1.1 (plain at L9 30/30, 52% Heart left). Re-run pending.
- Coordinator report: c4-quarry, c2-moon-b, c1-rts1 failed twice on current code. Fixes: Captain Quarry back to the
  template (no HP/STR tweak; plain no-gear L22 Tansy+Jade 25/30, with t4 30/30); Moth Queen HP x1.1, no STR/WIT bump
  (plain L14 Mole+Ninefold no gear 23/30, t3 30/30); RTS1 tier back to 1.0 (the scripted manual plan relies on its
  timing). Consequence: balance.mjs shows both bosses at 5-6 rounds with full chapter gear (outliers, by choice: the
  autopilot replays must pass). Army curve: RTS1 required-only Even 23%.
  - batch 3 results: ok c2-drowned, c1-toadhall, c1w-wonder-a, c1w-shallows, c1-greatburrow, c2-moon-a, c3-rts3, c3-oz-a,
    c3-oz-b, c3-china, c3-stair, c4-hole, c4-herd, c4-root, c5-dream. Failed (boss lost to the autopilot, or ran before a
    fix): c1w-wonder-b, c1-depths, c1-riverbank, c1-rts1, c2-aster, c2-moon-b, c3-barley, c4-quarry.
    Eased further: Aster HP x1.15 (no STR/WIT bump), Barley HP x1.1 (no STR bump). Re-running the 8 (batch 4).
  - batch 4: ok c4-quarry, c1-rts1, c1w-wonder-b, c1-depths, c1-riverbank (original solution), c2-aster, c3-barley.
    c2-moon-b lost the Moth Queen again (Bramble enters at half Heart with Mole+Ninefold): Moth Queen tweak now only
    brings her two moths back to the first draft's Heart (queen untouched). c5-ending failed once in batch 3 at the
    credits wait (no battle in it; only party level 28->27). Re-running both (batch 5).
- balance.mjs: bosses now played with the team the segment solutions take in (BOSS_TEAM) and the gear tier the party has
  at that point (BOSS_GEAR); maps fought before the usual three join use MAP_PARTY (Depths: Bramble+Burdock L4,
  River Bank: +Ratty L5). Result: all 38 maps ok; bosses ok: Chief Weasel, Choir, Witch, Watcher, Nightmare of Deepdelve;
  in 8-15 rounds but plain not worse: Queen, Tansy, Tidewarden, Quarry, Hollow Rabbits, Nightmare of Flintcomb;
  under 8 rounds: Aster 7.5, Barley 7.1, Moth Queen 5.7; Eye 5 (5 stories, by rule).
  - batch 5: c2-moon-b ok; c5-ending ok after its credits wait was loosened (a dialog now opens straight after the
    credits, so `!s.busy` never came; step 10 now also accepts an open dialog). Session "bal" closed.
## Final state
- Replays ok on current code (page reloaded before each): c0-attack, c1-depths, c1-riverbank, c1-toadhall (fight
  inserted at steps 38-41), c1w-wonder-a, c1w-wonder-b, c1w-shallows, c1-rts1, c1-greatburrow, c2-aster, c2-moon-a,
  c2-moon-b, c2-drowned, c3-rts3, c3-barley, c3-oz-a, c3-oz-b, c3-china, c3-stair, c4-quarry, c4-hole, c4-herd, c4-root,
  c5-dream, c5-ending. Not replayed (no fights, no data of theirs changed): c0-surface, c0-warren, c2-rts2, c4-rts4, c5-rts5.
- tools/curve.mjs: curve ok. tools/balance.mjs --all: all maps ok; 10 boss lines flagged (see above): the bosses had to be
  eased so the play.js autopilot (close to the plain AI) wins the replays, which conflicts with "plain loses".
