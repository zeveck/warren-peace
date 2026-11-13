# New Game+ (ngplus helper)

Design: design/changes/ngplus.md, with every must-fix and should-fix from design/changes/REVIEW.md section 1 and the
cross-design conflicts A-E applied. (Results and replays are at the end.)

## What was built
- **Start.** The title shows **New Game+** (between New Game and Load) when any valid save has `g_won`. It uses the
  newest such save. Woodruff offers it too: at sunset (`c5.last`), in his ch5 home lines after the ending, and via the
  script `ng.offer` (ch5/scripts.js), which the epilogue's home Woodruff calls.
  No toast (conflict D).
- **The won save is never moved or overwritten.**
  - Title: a won save already in a slot stays there. One in the autosave or "Previous autosave" is first copied into
    a free slot. With no free slot, a Load-style picker (LoadScene `onPick`) asks which slot keeps it. Only then does
    `keepPreviousAutosave()` run.
  - Woodruff: after the confirmation, the running won game is copied into a free slot (or a slot the player picks).
- **No new game inside a script.** `ng.offer` calls `requestNgPlus(state)` (screens/title.js). This sets
  `G.pendingNgPlus` and starts NG+ only once the explore scene has no script running and no autosave pending.
- **Carry** (state.js `newGame(ngFrom)` / `ngCarry`): every member's level and XP (`G.s.ng.levels/xp`, applied in
  `addMember` as `max(join, avg, carried)`), `ng.cycle`, `ng.prevTime`, `met` (bestiary), and `armyBest` (conflict B,
  same shape). Everything else is fresh. That includes all story flags (so `c6_*` and `g_c6_done` reset, conflict A),
  gear, items, key items, buttons, army gear and memories.
- **Long Thump lock** (nice): in NG+, Bramble's `long-thump` is hidden until `g_ch4_done` (state.js `skillsOf`).
- **Saves:** additive `G.s.ng`; v stays 1. Load shows a gold "New Game+" ("New Game+ 2"...) tag. `CH[6] = 'Epilogue'`
  (pause.js). `state().ng` = the cycle.
- **Scaling** (battle/ngplus.js `ngEnemies`, shared with the tools):
  - Ordinary fights are shifted so their top level = party − 4; bosses = party + 1. Never shifted down.
  - The encounter tweaks still apply. Drops stay at the original level, and summons' drops too (`o.lvlShift`).
- **Second phases:** data/ng/bosses.js, keyed by encounter id. No chapter encounter file is edited.
- **Sim hooks** (battle/sim.js, all inert without `opts.ng2`):
  - At round start, `ng2.onRound` wraps the encounter's onRound (Tansy, the Tidewarden). Then `ngRound` (the trigger
    and `ng2.round`) runs after mechRoundStart and onRound, before the sort.
  - The Choir's reorder moves every glowing mouth to the end.
  - `ng2.act` runs before mechAct.
  - Also `ng2.takeMod` in damage, `ng2.onHit` in hit (useSkill passes `skill`), `ng2.itemMod` in useItem (the pail),
    and `ng2.story` (the Eye).
- **The Eye in NG+:** its bar is in eighths, so the 5-story cap doesn't apply. A story is 1 eighth; after 4, phase 2
  starts and the right teller (or a stand-in) gives 2, anyone else 1. Stand-ins: poppies and china → Tin Woodman,
  roses → Cheshire Cat, wick → Jade Rabbit (`TELLER` in data/ng/bosses.js). When the memories run out, any memory can
  be told again (rpg.js `availableMemories`, NG only), so the fight always ends.
- **rpg.js:**
  - Plays the `phase` event: the sfx, a shake, the boss's lines in the banner.
  - Phase-2 bosses pulse with a warm overlay (the Choir's glow pattern), and the turn bar shows the phase counter.
  - `summary()` adds `ng`, `phase2`, `ngs`, `counter2`, `counterText`, `tellers`, and per unit `silenced` and `ngEye`.
- **data/core/enemies.js:** the ENEMIES entry `dream-hole` (the whisper sprite with the dream tint; no new asset).
- **Segments** (data/ng/index.js, appended to data/index.js CHAPTERS after ch6):
  - 12 `ng-<boss segment>` entries, each with an explicit chapter. hook.js `goToLevel` resolves `base`, sets `G.s.ng`
    and raises everyone to 27.
  - `ng-start` = the c5-ending state with `g_won` set.
  - Solutions: design/solutions/ng-*.json (copies of the base ones with the segment id changed) and ng-start.json.
- **Tools:**
  - lib-battle `runEncounter`/`runDungeon` take `ng: {party, lockLT, phase}`.
  - Counter policies `counter2Pre`/`counter2Post` and `ngStory`, mirrored line for line in tools/play.js `decide()`.
    A Story step can name its memory.
  - balance.mjs `--ng [--all]`.

## Second phases as built (data/ng/bosses.js; NG Heart in NG_HP)
| Boss | Trigger | Phase 2 | Counter (counter2) |
|---|---|---|---|
| Chief Weasel | 60% | The carving fork: names a rabbit (Guard!) and lands 3.0 next turn. Up to 2 lads at the table; he's Shielded while 2 stand | Guard the named one; hit-all the lads, then hit him in the open |
| Queen of Hearts | 60% | Names one head (Guard it, hide or swap out!), 3.2 single blow; Guard only halves it; hidden or swapped out dodges it (no sulk); calls a card soldier | Guard / Vanish / Disguise the named one |
| Whispering Choir | first mouth fades | Both remaining mouths glow and speak (Afraid all each) | A hit-all on the glowing round silences both |
| Aster | 60% | The Deep Verse, 2 rounds: 10% of her Hum dealt breaks it; otherwise Hummed 70% on all, she mends 25%, STR up | Focus her during the verse; cure the Hummed |
| Moth Queen | 50% | The pestle glows +1/round; at 3 she lifts it and lets loose next round (Moon-dust 2.4 STR all, Asleep 60%); Light on her dims it | Light at her, or brace (Guard) the release |
| Tansy | 50% | "Race you" every other round at Bramble only (3.4); braced: she tumbles (12%, stunned, one action lost); unbraced: STR up | Bramble Guards |
| Tidewarden | 50% | Two Pool Eyes surface while it's under; Tide = 1.0 + 0.8 per open eye; both shut: no Tide | Hit-all the eyes while it's under |
| Barley | 50% | Rooted (takes x0.35), Long Furrow (2.2, breaks Guard) every other round; Afraid loosens him for 2 rounds | Afraid on him (Sharp Tongue, Stern Word...); don't Guard the furrow |
| Wicked Witch | 70% | The umbrella is up 2 rounds in 3 (its closing warned): a pail on it does 10 | Throw pails when it's down |
| Watcher on the Stair | 50% | 3 eyes/round; SEEN announced every 3rd round or at 7 eyes, lands last in the round (3.4 all + Afraid; it grows 15% per rabbit seen); a Guarding rabbit isn't seen | Guard when SEEN is announced |
| Captain Quarry | 50% | Digs down: Hole +1/round, at 4 a Breakthrough (1.6 all + Afraid); a Dig hit on him backfills 1; Yarrow's line | Mole's Tunnel Under / Burdock's Landslide |
| Hollow Rabbits | 2 faded | The last two hold paws: mend 7%/round each; non-Light hits x0.5; "Come and forget" warned, then 3.0 all + Asleep 80% (a braced rabbit keeps their name, no sleep) | Light; Guard the whisper |
| Nightmare of Deepdelve | 50% | Pulls a friend every other round, held 2 rounds in A Hole in the Dream (one hit on it pulls them out); left there, they come back −35% Heart and Afraid | Hit the hole |
| Nightmare of Flintcomb | 50% | The Drone: takes x0.5 until Bramble's Thump / Long Thump breaks it for 2 rounds | Bramble thumps; keep curing |
| Undersleeper's Eye | after 4 eighths | Right teller (or stand-in) 2 eighths, others 1; the dream pulses every round | Tell each memory with the friend who was there (swap them in) |

## Results
- `node tools/balance.mjs --ng`: **all 15 bosses ok** (party Lv 27, bosses 28; counter ≥ 80% wins in 10-18 rounds,
  phase 2 reached in every win; plain < 60% wins or ≥ 3 rounds slower; the Eye counter-only 7 rounds, plain 8). The
  Queen is checked at the measured no-rest arrival state (BOSS_ARRIVE), like the base check. Lines (counter / plain):
  - Chief Weasel 25/30, 13.1r / 7/30.
  - Queen (at arrival) 25/30, 12.8r / 6/30.
  - Choir 30/30, 11.1r / 0/30.
  - Aster 24/30, 11.9r / 17/30.
  - Moth Queen 27/30, 15.5r / 3/30.
  - Tansy 29/30, 10.4r / 1/30.
  - Tidewarden 27/30, 15.3r / 17/30.
  - Barley 26/30, 13r / 7/30.
  - Witch 30/30, 10r / 0/30.
  - Watcher 30/30, 13.6r / 0/30.
  - Quarry 26/30, 12.3r / 14/30.
  - Hollow 28/30, 17.3r / 15/30.
  - Deepdelve 30/30, 15.5r / 12/30.
  - Flintcomb 25/30, 13.8r / 4/30.
  - Eye 7r / 8r.
  - Barley and the Hollow Rabbits are no longer outliers.
- `node tools/balance.mjs --ng --all`: every map ok at party − 4 (counter 1.5-3.4 rounds, ≤ 14% Heart a fight;
  Tussle 3.1-6.1 rounds, 100% wins).
- **Base game unchanged**: `balance.mjs --all` and `curve.mjs` outputs are byte-identical to the captured "before".
- **NG replays** (real input, session "ng", reloaded before each): all 12 `ng-*` boss segments ok, plus `ng-start`.
  ng-c1w-wonder-b (Queen) and ng-c4-root (Hollow Rabbits) first lost the boss. Both were retuned (the Queen at the
  measured arrival state; the Hollow Rabbits' whisper and Heart) and passed on rerun. ng-c1-toadhall was rerun after
  the Chief's final tuning.
- **ng-start**: from the won sunset save, through Woodruff to Prologue with Bramble Lv 27 and `ng` = 1. The won game
  was kept in Slot 1 (and the old autosave moved to Previous autosave).
- **Title route**: with the won save only in "Previous autosave", New Game+ copied it into Slot 1 first. After NG+
  started, Slot 1 still held the won game (`g_won`, c5-sunset). Screenshots: the title with 5 items (no overlap with
  the hint), Load with the gold "New Game+" tag, and a phase-2 transition (Barley's banner, the warm pulse, the
  counter "Rooted (startle him!)").
- **All 30 base segments replayed ok** after the engine changes (page reloaded before each).
- Note for the epilogue helper: ch6 adds a whole-map `once` trigger `c6-hint` on c5-sunset. In my runs it stopped
  Bramble's first walk and hops there. ng-start sets `c6_invited` to stay clear of it; worth a look.
