# Calibration to a real player (calib helper)

Goal: a player who plays the main path normally reaches each boss at about its level (boss L - 1 .. boss L), with gear
they could afford, and a full-clear player at most ~2 above. Source: the full New Game -> win run (fullrun.md).

## Step 1: the real-path model (done)
- New `tools/route.mjs`: reads the full run's step files (design/solutions/fullrun/NNN-*.json; retries `*r`, the
  grinding detours `040x/040y`, `040t` and resume files skipped), tracks map and tile through walk/click/talk/goto
  targets, door tiles, segment starts and `until s.map === ...` waits, joins the points with A* over walkable tiles and
  writes design/solutions/fullrun/route.json (per map: route tiles, fights the run took). `--notes` lists them.
- `tools/curve.mjs` now prints three models side by side at every segment start, map and boss:
  - all = the old model (every visible map enemy x0.9, once);
  - full = full clear (every visible enemy once; the most a non-grinding player gets);
  - real = enemies on or next to the route (any tile of their position or patrol loop within 1 tile of a route tile)
    + 20% of the others (`--opt`); chests within 4 tiles of the route + 20% of the others; scripted gifts.
  It also tracks the real path's buttons against the gear each segment assumes (each segment's gear pieces not held
  in an earlier segment's set are bought before it starts) and prints `spare` = real buttons - gear spent.
  Checks: real boss arrival in [L - 1.5, L + 0.25], full clear <= L + 1, segment level within 1 of real, spare >= 0.
- Validation with the OLD numbers: radius 3 counted ~117 fights and put the real path only ~0.5-1 below the old curve,
  far above the run. Radius 1 (on or next to the route) + 20% optional: 99 fights; levels at the bosses (model vs the
  full run): Choir 10.4 / 9, Aster 11.1 / 10, Moth Queen 14.4 / 13 (run had a detour), Tansy 15.7 / 14,
  Tidewarden 16.0 / 14-15, Barley 16.9 / 16 (after 2 levels of grinding), Witch 18.5 / 18, Watcher 19.8 / 19,
  Quarry 21.3 / 20, Hollow 23.8 / 22-23, Nightmare 24.1 / 23-24. The model sits ~0.5-1 above the run (a few
  optional fights more), i.e. it reproduces the problem: 2-3 levels short from Chapter 2 on.
- Old numbers, real model: Choir -1.6, Aster -1.9, Tidewarden -2.0, Barley -2.1, Witch -2.5, Watcher -2.2,
  Hollow -2.2, Nightmares -2.9..-2.3 below boss level; full clear +0.0..+1.1. The real-full gap was 2-3 levels.

## Step 2: XP retune (done)
The gap between a main-path player and a full-clear player (2-3 levels) is larger than the window (boss L - 1 .. L,
full clear <= L + 1), so no flat XP change can fix both. A level catch-up closes it:
- ENGINE (number + small formula), game/src/state.js: new `xpCatchUp(d) = clamp(1 + 0.3 d, 0.25, 2)`, d = the beaten
  foes' level (XP-weighted) - the member's level; `giveXp(xp, foeLvl)` applies it per member (reserves too).
  game/src/battle/rpg.js end(): passes foeLvl; the results line shows Bramble's XP. Effect: a player who skipped
  fights gets up to 2x from the next ones, a full-clear player (or a grinder: wanderers now respawn) levels slower,
  down to 0.25x at 2.5+ levels above the foes.
- ENGINE number, game/src/battle/sim.js makeEnemy: enemy XP 8 x level -> 9 x level (bosses x5, tier bonus unchanged).
- No content changes were needed (enemy levels/counts unchanged).
- Result (curve.mjs; real / full arrival vs boss level): Chief Weasel 8.0 / 8.3 (L8), Queen 10.3 / 11.1 (11),
  Choir 11.3 / 12.3 (12), Aster 12.1 / 13.3 (13), Moth Queen 15.6 / 16.1 (16), Tansy 17.0 / 17.4 (17),
  Tidewarden 17.4 / 18.1 (18), Barley 18.4 / 19.2 (19), Witch 20.1 / 20.9 (21), Watcher 21.5 / 22.4 (22),
  Quarry 23.1 / 23.6 (23), Hollow 25.7 / 26.3 (26), Nightmares 26.1-26.9 / 26.6-27.3 (27).
  Robust: with no optional fights at all (--opt 0) the real path is at most 1.3 below; with half of them, at most 0.6.
- Segment party levels already match the real path within 0.7 (c3-oz-b 20 vs 19.3 the largest): unchanged.

## Step 2b: gear the main path can afford (done)
Income was not raised; segment start gear was lowered to what the real path affords (curve.mjs `spare` column:
real-path buttons at the segment start minus every gear piece the segments assumed so far; old -> new):
- c1-toadhall: full T2 set (880 incl. T1) -> T1 set + sling+2, digging-claw+2, waistcoat+2 x2 (500). Real path
  has 780 there (spare -100 -> 280); start buttons 300 -> 250.
- c1w-wonder-a: full T2 -> Toad Hall's gear (spare 98 -> 478). wonder-b / shallows keep full T2 (spare 249 / 690);
  wonder-b start buttons 300 -> 250.
- c2-moon-b / c2-drowned: T3 set without courage-ribbon+3 (the T2 one still stops Afraid): 2635 -> 2440
  (spare 244 -> 439); moon-b start buttons 600 -> 400.
- c3-oz-b: full T4 set (2835) -> T4 tools x3 + emerald-cloak+4 + tin-vest+4, the rest T3 (spare -925 -> 335);
  c3-china / c3-stair add straw-vest+4 (spare -114 -> 831 / 977). Start buttons oz-b 900 -> 300, china 900 -> 800,
  stair 1000 -> 900.
- c4-rts4 / c4-quarry: T4 charms (ribbon, poppy-ward, goggles +4) -> T3 charms (spare 1395).
- c4-hole: full T5 (4185) -> T5 tools x3 + oilskin+5 + tin-vest+5 on top of the T4 set (spare -2476 -> 644);
  c4-herd + waistcoat+5, calm-stone+5 (-1190 -> 1000); c4-root full T5 (-644 -> 616).
- c5 (all three): calm-stone+6 -> calm-stone+5 (spare -849 -> 1041 at c5-rts5).
- balance.mjs BOSS_GEAR (average tier of the three's tool/coat/charm) to match: Chief Weasel 1 -> 1.4 (the real path
  now arrives with more than T1), Moth Queen / Tansy / Tidewarden 3 -> 2.9, Witch 4 -> 3.6, Watcher / Quarry 4 -> 3.7.
  Result: unchanged verdicts: all bosses ok except the known outliers Barley, Hollow Rabbits, Undersleeper's Eye.
  (Chief Weasel: counter 30/30 9.5r, plain 27/30 in 14.4r; Witch 30/30 8r; Watcher 30/30 13r; Quarry 30/30 11.5r.)
- Per chapter (real path): ch1 income 1831 (cost table 1245), ch2 2504 (2655), ch3 2676 (4435), ch4 5351 (5835):
  the design's "9 new pieces of the chapter tier + army + items" is not affordable on the main path from ch2 on;
  the segments now assume partial sets instead.

## Step 3: fixes from the full run (done)
- Ninefold's errand: new ch1w/util.js `withNinefold(text)`: while Ninefold asked for a dandelion and has not joined,
  the quest line adds "(Ninefold still waits for a dandelion.)". Used on every quest line set after the Choir: the
  Choir's end and the Shallows re-entry lines (ch1w/scripts.js), the Underway lines, Chapter 1 done and the Great
  Burrow end (ch1/scripts.js), and the first Chapter 2 line (ch2/scripts.js). The camp's quest list had it already.
- Captain Quarry (ch4/flintcomb.js): arriving at the lip, Bramble now says to rest at the mossy stone by the lantern
  first; and before the fight, if anyone in the three is below 80% Heart or 60% Pluck, "We're worn out... The mossy
  stone is just behind us" -> [Rest at the stone first. / Wake him now.] (rest = full Heart and Pluck, saved).
- Barley (ch3/scripts-wheatsheaf.js): after RTS 3 is won the army shares its supper: a full rest before Wheatsheaf
  (Barley follows the Tidewarden and RTS 3 with no rest in between). Plus the same hurt-check prompt before his fight
  (the warren's rest stone (10,9) is on the way, a few hops up the hall stair).
- Glinda (ch3/scripts-oz.js): she now says the China Country is just north-west, optional and lovely; the prompt reads
  "Use the silver shoes now? (Yes skips the China Country, which is optional.)" [Yes: knock your heels, back to the
  Underway now. / Not yet: see the south and the China Country first.]; her later prompt says "(skips the China
  Country)" until the Princess was met.

## Step 4: replays (session calib, page reloaded before each run)
- c1-toadhall: ok (311 s; new gear T1 + two T2 tools/coats; Chief Weasel won).
- c1w-wonder-a ok, c2-moon-b ok (Moth Queen with T3 minus ribbon), c2-drowned ok (Tansy + Tidewarden), c3-rts3 ok (new supper rest).
- c3-barley: Barley won, but a respawned Wheatsheaf wanderer caught the party on the walk back to the bell post (battle open at the done check). Solution: fight:maybe after each walk of that leg and before talking to Barley; re-run pending.
- c3-oz-b ok (Witch with the partial T4 gear; Glinda's new line/choice), c3-china ok, c3-stair ok (Watcher), c4-quarry ok (Captain Quarry).
- c4-hole ok, c4-herd ok, c4-root ok (Hollow Rabbits), c5-dream ok (both Nightmares + the Eye), c5-ending ok.
- c0-attack ok, c1-depths ok, c1w-shallows ok (Choir).
- c1-riverbank: a Wild Wood wanderer (back on revisit) caught the party on the walk to Badger's door. Solution: fight:maybe after each walk of that leg. Re-run pending.
- c1w-wonder-b: on the wood revisit a respawned wanderer caught Bramble on the way to the pig, so the talk opened a fight instead and the Cat never joined (tea door stayed locked). Solution: fight:maybe before/after the pig talk, the talk repeated (the second one recruits the Cat if the first was interrupted, else is the 'happy pig' line), and the scripted (26,14) fight turned into walk/fight:maybe/walk/fight:maybe. Re-run pending.
- c1-rts1 ok, c1-greatburrow ok, c2-aster ok (Aster), c2-moon-a ok, c3-oz-a ok.
- re-runs: c1-riverbank ok, c1w-wonder-b ok (Queen). c3-barley: now the corn wanderer caught the party on the walk before its scripted fight step, which then timed out: that step is fight:maybe too; re-run pending.
- c3-barley re-run: ok (Barley won; the walk back now copes with the corn wanderer wherever it catches the party).

## Final state
- Replays ok on current code (page reloaded before each, session calib, now closed): c0-attack, c1-depths,
  c1-riverbank, c1-toadhall, c1w-wonder-a, c1w-wonder-b, c1w-shallows, c1-rts1, c1-greatburrow, c2-aster, c2-moon-a,
  c2-moon-b, c2-drowned, c3-rts3, c3-barley, c3-oz-a, c3-oz-b, c3-china, c3-stair, c4-quarry, c4-hole, c4-herd,
  c4-root, c5-dream, c5-ending. Not replayed (no fights): c0-surface, c0-warren, c2-rts2, c4-rts4, c5-rts5.
- Solutions changed for the respawning wanderers: c1-riverbank, c1w-wonder-b, c3-barley (fight:maybe steps).
- tools/curve.mjs: curve ok (real path within [L-1, L+0.2] of every boss, full clear <= L+0.6, spare >= 0 everywhere).
- tools/balance.mjs --all: unchanged verdicts (outliers Barley, Hollow Rabbits, Undersleeper's Eye; map warnings
  c1-depths and c3-wheatsheaf as before). tools/reach.mjs: 0 errors. Every file passes node --check.
- Docs: GAME_DESIGN formulas line and BIBLE Levels line describe enemy XP 9 x L and the catch-up.
