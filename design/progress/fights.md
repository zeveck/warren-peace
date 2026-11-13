# Short, sharp ordinary fights (fights helper)

Goal (final playtest's top finding): normal fights end in ~3-4 rounds with sensible play and not much longer when
mashing Tussle; enemies hit hard enough that Guard, skills and items matter, without one-shot spikes; each enemy
template shows one readable threat (a telegraphed wind-up with a "(Guard!)" line, or a clear status attack).
Depths stays very easy. Bosses, their Heart and the level curve unchanged.

## Step 1: measuring (done)
- tools/lib-battle.mjs: new party policy `tussle` (Tussle every turn at the first enemy standing: the menu default);
  runEncounter/runDungeon now also report Heart lost per fight (% of the three's max Heart) and the biggest single
  enemy hit (% of the target's max Heart). runDungeon takes `mode: 'counter' | 'plain' | 'tussle'`.
- tools/balance.mjs --all: every map's whole-dungeon run with both the counter and the tussle policy; `--table`
  prints the per-map table. Map check now: counter mean 2.5-4.5 rounds, every fight 2-6, tussle mean <= counter + 3,
  no counter losses.
- Baseline (before any change), whole-dungeon runs (Heart/Pluck carried, no rest), 6 seeds:
  counter 2.4-5.0 rounds, 4-17% Heart lost per fight (ch2-ch4 mostly 4-10%: padding);
  tussle 3.3-11.8 rounds, 9-95% Heart lost per fight, losses on 25 of 39 maps (attrition: long fights chip away).
  Biggest single hits 17-52% (unannounced Smash 1.5 / Dive 1.3 / Head Shot 1.3 + crits, tier-2 x1.5 stats).

## Step 2: readable threats + short fights (done)
ENGINE (game/src/battle/sim.js; only in ordinary fights = no boss or boss minion in the fight, so every boss fight,
its minions and summons behave exactly as before; balance.mjs boss lines identical):
- `NORMAL_FIGHT` scaling (data/core/enemies.js): enemy Heart x0.75, STR/WIT x1.15, TGH x0.5 (low Toughness helps
  Tussle more than skills: it narrows the masher's gap a little).
- Enemies don't crit in ordinary fights (no surprise x1.5 spikes; party crits unchanged).
- Wind-ups (sim.js `windup`): on its turn a foe with a wind-up threat may (60%) wind up and name its mark: a 'charge'
  event = the bosses' line style ending "(Guard!)" plus the red bar over it; on its next turn the blow lands
  (never misses, never crits; Guard halves it). Only one foe winds up at a time and at most one blow lands per round.
  Knocking the foe out, or putting it to sleep / stunning it, cancels the blow ("X loses its wind-up."). Burdock's
  taunt draws it. The marked member carries buff `marked` (`marked-all` for hit-all wind-ups) for the autopilot.
- Ordinary fights use `normalMoves` where given (bosses keep `moves`): the unannounced spikes are gone from them
  (Brute Smash 1.5, Dive 1.3 -> 1.15, Head Shot 1.3 -> 1.15, Caster Spark 1.2 -> 0.95, Jinx dropped).
Threat per template (one each):
| Template | Threat | Numbers (unguarded, % of the squishiest member's max Heart at map level) |
|---|---|---|
| Brute (Root-tangler, Stoat, Card Soldier, Kalidah, Hammer-Head, Winkie, Moving Root, Hum Digger; also the Carving that Moves) | "X rears back, glaring at Bramble... (Guard!)" -> Big Swing (pw 1.75) on the marked one | swing ~30-50%, bash 10-25% |
| Quick (Beetle, Weasel, Dust Hopper, Wolf, Cave Lizard, Raider, Hollow Rabbit) | "X crouches low, eyes on Mole... (Guard!)" -> Pounce (1.7) on the member with the lowest Heart % | 29-41% |
| Flyer (Teapot, Lantern Moth, Crow) | "X climbs high above Y... (Guard!)" -> Dive Bomb (1.7) | 31-41% |
| Caster (Ferret Sentry, Eel-cloud, Hum Lookout; Drowned Eye / Shut Eye / Star-Thing as Eerie casters) | "X gathers a crackling charge over everyone... (Guard!)" -> Spark Storm (1.05, all) | 24-40% each |
| Swarm (Earthworm, Cold Ripple, Trilobites) | status: Smother (Asleep 60%) | bites 3-19% |
| Eerie (Whisper, Late Footstep, dream-shapes) | status: Whisper (Afraid 75%) | chill ~20% |
| Pepper Cloud (caster) | status: Pepper Sneeze (Stunned), as before | |
Counter policy (tools/lib-battle.mjs): a member marked by a wind-up Guards.
Data: Depths tweak Heart x0.65 -> x0.87 (same Heart as before with the x0.75) and STR/WIT x0.7 (hits ~10%, wind-up
~20%); hardy(): c2 Silverdown sd-1..4 1.2 (new), c2 depths dp-1..3 1.15 (new), c3 hum-1..3 1.15 (new), hammer-1
1.25->1.1, hammer-2 ->0.9, stair-1/2 ->0.9, stair-3 ->0.8, c4 fc-1..5 1.6->1.45, fc-6 1.3->1.15, tb-1..4 1.9->1.6,
sea-3 1.6->1.3, mu-4 ->1.25, ro-2..4 ->1.25, dd-1 ->1.4, dd-3 ->1.2.
balance.mjs map check now: counter 2.3-4 rounds per map, every fight 2-6 (single-enemy tutorial fights excepted),
no counter losses; masher (fresh) <= 6.5 rounds and >= 90% wins. All 39 maps ok; boss lines as before (outliers
Barley, Hollow Rabbits, Undersleeper's Eye). curve.mjs: curve ok (unchanged).
- Named spikes (fresh fights, 40 seeds, real-path-like level/gear): Root-tangler in the Depths (Bramble L3 no gear):
  regular hits <= 8-10% (was a 37% crit Smash), wind-up <= 21% (half when Guarded), Depths attack x0.7 -> x0.6.
  Carving groups (c2.dr-4 / dr-7 at L15): the tier-2 Carving (x1.95 STR with its own x1.3) is now tier 1;
  Tussle-masher wins 40/40 (6-6.5 rounds, ~60% Heart), counter 3 rounds ~10% Heart (was: wiped in 2 rounds).
  Cave Lizards (c4.tb-1/2, mu-3, sea-2 at L22-24, gear T4-T5): the cause was Heart padding (hardy 1.6-1.9: 9-round
  chip fights); now counter 2.2-3.4 rounds, masher 5.4-6.9 rounds, 40/40 wins.
- Autopilot (tools/play.js decide) guards when marked, like the counter policy. Wind-up lines start "The ...".
- GAME_DESIGN: RPG section has the ordinary-fight rules and threat list; "Normal fights last about 3 to 4 rounds".

## Step 3: replays (session "fights", page reloaded before each run)
- Batch 1 ok: c0-attack, c1-depths, c1-riverbank, c1-toadhall.
- Batch 2 (page reloaded before each): ok c1w-wonder-a, c1w-wonder-b, c1w-shallows, c1-rts1, c1-greatburrow, c2-aster,
  c2-moon-a, c2-drowned, c3-rts3, c3-barley, c3-oz-a, c3-oz-b, c3-china, c3-stair, c4-hole, c4-herd, c4-root,
  c5-dream, c5-ending.
- FAILED twice, both on exploration steps (no fight involved), deterministic:
  - c2-moon-b step 8/9: the click on tile (13,6) in the Moon Palace now opens a lantern prop's examine text (the tall
    lantern drawn over the tile catches the click), so Bramble never talks to Chang'e; the crater door stays locked
    (step 27 times out).
  - c4-quarry step 17: walk to (13,16) from the warren mouth: tileToScreen gives y=732, below the 720-px view, so the
    click lands nowhere and Bramble stays at (4,4).
  Cause: click/camera handling in world/explore.js (changed 05:08 by the exploration-UX helper), not battle data.
  Both segments passed in every earlier pass. Not patched here (not my files; patching the solutions would hide it).
  Session "fights" closed.

## Final state
- balance.mjs --all: 0 map warnings; boss lines identical to before (outliers Barley, Hollow Rabbits, Undersleeper's
  Eye). curve.mjs: curve ok. Every edited file passes node --check.
- Files: game/src/battle/sim.js (normal-fight scaling, no enemy crits, wind-ups, normalMoves), game/src/data/core/
  enemies.js (NORMAL_FIGHT, threats, normalMoves, new moves), data ch1/encounters.js (Depths), ch2/battles.js,
  ch3/encounters.js, ch4/flintcomb.js, journey.js, herd.js, root.js (hardy), tools/lib-battle.mjs (tussle mode,
  metrics, Guard when marked), tools/balance.mjs (both policies, --table), tools/play.js (Guard when marked),
  design/GAME_DESIGN.md (RPG section).
