# Review of the three change designs (Player + Builder hats)

I checked each design's claims about the code against `game/src`. I edited nothing. Most claims hold. These were confirmed:
- NG+: `keepPreviousAutosave`, `addMember`/`avgLevel`, `drops: 2*lvl`, summons at `e.lvl-2/3`, multiplicative `tweak`/`hardy`, `xpCatchUp(-1)=0.7`, giveXp to reserves, RTS doesn't depend on levels.
- Revisits: `TICK=0.1`, the RTS sim has no RNG (deterministic), `started` gates `step()`, losses++ only on lose, `startArmy` keeps music only on non-win, `rts.o` reaches `onStart`, rank 1.48, the `.won`/`.intro` side effects, the medal arithmetic.
- Epilogue: Shale, Flick, Knapper, `c4_needle`, Quarry's "digging the other way", `blocked`/`drawGround`/`drawOver` hooks, every reused prop/sfx/portrait, `newest()` starting at 5, `CH[6]` missing, `onEnter` on `c4-flintcomb`.

The wrong claims and the risks are below.

---

## 1. New Game+ (`design/changes/ngplus.md`)

### The Eye's phase 2 cannot work as written
Severity: must-fix
What's wrong: "a story told by the memory's own `friend` lowers the bar a fifth; told by anyone else, a tenth", with a target of "7-10 rounds".
- `sim.js` useSkill `case 'story'` (lines ~294-299) knocks the Eye out at `this.stories >= 5` no matter how much bar is left. It allows one story a round, and each memory can be used once (`rpg.js` `usedMem`, lines 124 and 168). So the fight always ends by round 5 and the tenth penalty never bites.
- Several memories' `friend` can never be in the party:
  - `mem-poppies` (a MAIN memory) → `mouse-queen` (ch3/extra.js:21).
  - `mem-wick` → `wick` (ch2/extra.js:32).
  - `mem-roses` → `white-rabbit` (ch1w/extra.js:21).
  - `mem-china` → `china-princess` (ch3/extra.js:22).
Why it matters: phase 2 does nothing, or it punishes memories the player can never tell "right". The balance target can't be reached.
Suggestion:
- In NG+ only, raise the cap (for example `stories >= 8`).
- Measure the bar in eighths: the right teller does 2, anyone else 1.
- Give each non-party friend a party stand-in, for example `mem-poppies` → tin-woodman, and `mem-wick` → jade-rabbit.
- Check that ≥8 eighths can always be reached with the memories a real run has. `ensureMemories` guarantees only 5.
Evidence: battle/sim.js lines 294-299; battle/rpg.js lines 124 and 168; the memory files above.

### The sim hook list misses where several boss mechanics live
Severity: must-fix
What's wrong: the hooks are `startRound` / `enemyAct` / `damage` / `hit` / `useSkill`, but:
- **Witch:** a pail splash goes through `useItem` (`x.pail`, sim.js ~316-319). It never calls `damage()` or `hit()`, so "a splash on the umbrella only does 10" has no hook.
- **Tansy and Aster:** Tansy's dash and Aster's Hum-feeds rule are in the encounter's `onRound` (ch2/battles.js:17 and 61-70), not in the sim.
- **Choir:** the glow is reset in `mechRoundStart` by the first mouth only, and the "glowing mouth speaks last" reorder handles only one mouth (sim.js:91-93 and 366-370). Two mouths glowing at once needs the hook to run after `mechRoundStart` and `onRound` and before the turn-order sort.
Why it matters: the builder will guess at hook order, and three bosses' phase 2 can't be built with the listed hooks.
Suggestion:
- State the order: `ng2.round` runs after mechRoundStart and onRound, before the sort.
- Add `ng2.itemMod` in `useItem`.
- Let `ng2` wrap or replace `enc.onRound` for Tansy and Aster.
- Make the reorder move every unit with `ms.glow`.
Evidence: battle/sim.js startRound, mechRoundStart, useItem; data/ch2/battles.js.

### New Game+ from the title can wipe the finished game
Severity: must-fix
What's wrong: "it uses the most recent [won save]… the same `keepPreviousAutosave()` rule". If the newest won save is the **Previous autosave**, `keepPreviousAutosave()` overwrites `prev` with the current autosave (save.js). The won save is gone and nothing warns the player. The confirm text only covers the case where the won save is the autosave.
Why it matters: with changes 2 and 3, the won save now holds the post-game (the epilogue and the revisits). Losing it loses both.
Suggestion: New Game+ must never move or overwrite the save it starts from. If that save isn't in a slot, copy it into a free slot first. If there is no free slot, ask which slot to use.
Evidence: engine/save.js `keepPreviousAutosave`; screens/title.js `startGame(null)`.

### The Woodruff route starts a new game from inside a running script, and the offer becomes unreachable
Severity: should-fix
What's wrong:
- `startGame` calls `replaceScenes` while `c5.last` is still awaiting. The old script's continuation, and the deferred autosave (`ex.savePending`), then run against the new `G.s`.
- `c5-sunset` can't be re-entered once the player leaves it: its door warps to `c0-warren` mouth, and no route leads back. So "Ask Woodruff" stops working after the first walk home.
Suggestion:
- Have the script return a request (for example `G.pendingNgPlus = save`), and start NG+ after the script finishes, or after a `quitToTitle`.
- Also offer it from home Woodruff (see conflict C).
Evidence: screens/title.js startGame; data/ch5/scripts.js `c5.sunset.door` (~343-346); engine/save.js autosave deferral.

### Scaling every ordinary fight to party −1 cancels what the person asked for
Severity: should-fix
What's wrong: "keeps your party's levels" turns into the base game with the numbers raised. At Lv 27, `xpNext` is about 5,600. A Lv-26 foe gives 234 × 0.7 XP, which is about 11 fights per level. So NG+ feels like the base game with almost no level-ups and no power fantasy.
Suggestion: run ordinary fights at party −4 (quick, 2-3 rounds, feel strong) and bosses at party +1, so phase 2 is the challenge. This is the one change that makes NG+ worth replaying.
Evidence: judgment, plus state.js `xpNext`/`xpCatchUp` and sim.js `makeEnemy` xp.

### Several second phases are easier than the first
Severity: should-fix
What's wrong: the request says "harder".
- **Queen:** in phase 1, Guard halves an all-party hit. In phase 2, Guard on the named rabbit means 0 damage and the Queen loses her next turn.
- **Barley:** one Afraid (35%) ends his phase for good.
- **Tansy:** two tumbles remove her second action for the rest of the fight.
Suggestion:
- Queen: Guard halves the named hit; only Swap or Hide avoid it, with no sulk.
- Barley: Afraid loosens him for 2 rounds only.
- Tansy: a tumble costs her one action, not her second action forever.
Evidence: judgment; sim.js `off-with` mechAct.

### Counters and assets the design names that don't exist at that point in NG+
Severity: should-fix
What's wrong:
- Barley's counter lists **Trumpet**. That is Rumble's skill, and Rumble joins in Ch4, after Barley (Ch3). The NG+ roster resets.
- There is **no "Thump" tag**. The tags in party.js are Dig, Light, Mind and Ranged. Match the skill ids `thump`/`long-thump` instead.
- There is **no `drift` battle sprite**; only `whisper` and `drowned-eye` exist.
- "A Hole in the Dream" needs an ENEMIES entry, or `makeEnemy` throws (sim.js:21).
- There is **no "Elite glow"** in rpg.js. Use the choir tint pattern at rpg.js:405.
Evidence: data/core/party.js; `find game/assets -iname '*drift*'` (none); data/core/enemies.js.

### The fifth title-menu item overlaps the controls hint
Severity: should-fix
What's wrong: with 5 items, `y0=214` puts the last button at y 318-340 and the panel bottom at 348. The hint band starts at H−32 = 328, and its text sits at y 351.
Suggestion: when there are 5 items, set `y0 = 188`.
Evidence: screens/title.js draw().

### The `data/ngplus/` "chapter" module breaks loadData's assumptions
Severity: should-fix
What's wrong:
- `loadData` sets `chapter: parseInt(ch.slice(2))`, which is NaN for `ngplus` (data/index.js:26).
- A module can't "generate variants" of the merged segments at import time. It would have to import each chapter's index.
- The tools hard-code their chapter lists (lib-battle.mjs:9, curve.mjs:62, rts-check.mjs:8).
- `goToLevel` must set `G.s.ng`, which is a hook.js edit.
- Carried XP must be applied by hand, because `addMember` sets `xp: 0`.
Suggestion: give each NG segment an explicit `chapter`, and keep `ng2` data out of the chapter files (see conflict E).
Evidence: data/index.js; hook.js goToLevel; state.js addMember.

### Bramble has Long Thump from minute one
Severity: nice
What's wrong: at Lv ≥20, `skillsOf` gives all 5 skills, so the finale's signature move is there in the prologue.
Suggestion: in NG+, lock `long-thump` until `g_ch4_done`, or add a storyteller line about it.
Evidence: state.js skillsOf; party.js line 6.

---

## 2. Army revisits (`design/changes/army-revisits.md`)

### "Back (or Esc) leaves" is wrong
Severity: should-fix
What's wrong: `DialogScene.update` never checks `input.back()`, so Esc does nothing on a choice list.
Suggestion: add an `o.cancel` choice index to DialogScene (Esc picks it). This is a small engine change and revisits owns it. Or use a small `RevisitScene`.
Evidence: world/script.js lines 207-226.

### Six rows don't fit, even with an empty prompt
Severity: should-fix
What's wrong: `ui.wrap('')` returns `['']`, so the rows still start at y0+34. The sixth row's baseline is y0+99 and its highlight reaches y0+102, past the 98 px panel.
Suggestion: add an `o.noPrompt` option that starts the rows at y0+18. Or use a small scene, which also fixes Esc and leaves room for medal icons.
Evidence: world/script.js draw (~235-258); core.js wrap.

### Gold is the bot's rush time rounded up, so a first naive rush gets gold
Severity: should-fix (fun)
What's wrong: gold = R rounded up to 5 s. Because the sim is deterministic, gold means finding one plan once. There's no reason to come back.
Suggestion: gold = 0.9 × R, and show R as "Burdock's time" to beat. This is the one change that gives the mode legs.
Evidence: judgment; rts/sim.js has no RNG.

### The new sunset trigger changes behaviour before the ending
Severity: should-fix
What's wrong: before `g_won`, the trigger at (6,24) now narrates a line. That map is `c5-ending`'s segment map.
Suggestion: give it `cond: () => flag('g_won')`, so the base game is byte-identical.
Evidence: data/ch5/maps.js sunset map.

### Keep the clock panel to revisits only
Severity: should-fix
What's wrong: `layoutSide` adds 'clock' only before the first order (rts.js:593). A permanent panel shifts the alert and tip positions and the `dodgeSide` geometry in every story battle.
Suggestion: state that it shows only when `o.revisit` is set.
Evidence: rts/rts.js layoutSide and dodgeSide.

### Don't edit `newGame()`
Severity: should-fix
What's wrong: the lazy `G.s.armyBest ||= {}` already covers new and old saves. Editing `newGame()` collides with NG+'s change to the same function.
Suggestion: drop the state.js edit (see conflict E).

### `s.chapter()` can't go backwards
Severity: nice
What's wrong: the listed risk "`s.chapter()` going backwards" can't happen: `chapter()` uses `Math.max`.
Evidence: world/script.js:171.

### Save after each run
Severity: nice
What's wrong: the times are saved only when the menu script ends.
Suggestion: call `s.save()` after each run as well. It's deferred anyway, but this makes the intent explicit.

---

## 3. Epilogue (`design/changes/epilogue.md`)

### The arrival flow is wrong
Severity: should-fix
What's wrong: "the first thing the player sees after the sunset door drops them at `c0-warren` mouth" is Shale on `c0-downs`. But the door warps to `c0-warren` 'mouth' (3,3), inside the warren. The player meets the home rabbits before reaching the downs.
Suggestion: put the hook where post-game saves actually are. Use a Shale NPC on `c5-sunset` at the feast, plus one on `c0-downs` for anyone who has left.
Evidence: data/ch5/scripts.js `c5.sunset.door`.

### Yarrow would be in two places
Severity: should-fix
What's wrong: `c4-warren` already has Yarrow at (12,13) with `cond: freed()`, forever. "I'll come down at the end" and "spawned for the scene" contradict that, and the scene would show two Yarrows.
Suggestion: add `&& !flag('c6_started')` to the ch4 Yarrow, then spawn him for the close.
Evidence: data/ch4/flintcomb.js warrenMap npcs.

### Shale already exists
Severity: should-fix
What's wrong: the woken doe is NPC `fc-doe` (speaker 'doe') at `c4-flintcomb` (12,11). A new `shale` NPC and speaker would put two of her at Flintcomb.
Suggestion: reuse `fc-doe` with the `shale` speaker after `g_freed_flintcomb`. Hide her at Flintcomb while she waits on the downs.
Evidence: data/ch4/flintcomb.js:275.

### There is no map thump animation
Severity: should-fix
What's wrong: `anims/map` has only hop, idle and nibble for Bramble.
Suggestion: say it's code: a hop in place, `s.shake`, and the sfx.
Evidence: `ls game/assets/anims/map`.

### Backtracking and brute-forcing make it errands
Severity: should-fix (fun)
What's wrong:
- Task D sends the player back across two maps for 3 of the 5 clocks.
- The alcove puzzle allows free wrong guesses, so 8 thumps always solve it and the clues don't matter.
- The three heaps are the same beat three times.
Suggestion:
- Put all 5 clocks on Flintcomb and its west downs.
- Use 5 alcoves, with solid ones giving a funny reaction.
- The one change: sow each patch the moment its heap is cleared. The player then sees before and after in one visit, and it also removes most of the re-warps.
Evidence: judgment.

### Re-warping to the same map to refresh props
Severity: should-fix
What's wrong: `s.warp` to the same map re-runs `onEnter`, the iris and `lastDoor` each time, and that would happen 6+ times.
Suggestion: write one `refreshConds(map)` helper that splices `s.ex.map.props`/`actors`.
Evidence: world/script.js warp.

### The home-lines fallback must be explicit
Severity: should-fix
What's wrong: `newest()` picks `home.<id>.ch6` as soon as `g_ch5_done` is set, which is right at the ending. So every ch6 home script must call its ch5 version itself until `c6_started`.
Suggestion: state this, because NG+'s Woodruff offer hangs off it (conflict C).
Evidence: data/ch0/home.js:11-15.

### Two lines don't match the game as played
Severity: nice
What's wrong:
- Quarry's "digging the other way" plays only if the player chose "Then help us put it right." (ch4/flintcomb.js:368-370).
- `c4_needle` is always set (line 379), so that condition is moot.
- Flick says "filling in the hole! ALL of it!" (ch5/adds.js:33), but the design says "the hole stays open".
Suggestion: add a Quarry line, along the lines of "a barrow at a time, a hundred years".

### Gate the Hum ambience on the epilogue flag
Severity: nice
What's wrong: the ch4 maps still play the Hum loop after Flintcomb is freed.
Suggestion: gate the getter on `c6_started` (or `g_won`), never on `freed()`, so the ch4 segments stay identical.

---

## Cross-design conflicts and how to resolve them

**A. NG+ and the post-game save.** The epilogue and the revisits live on the won save, and NG+ can destroy it (NG+ finding 3).
- NG+ always keeps a copy of the won save in a slot.
- NG+ resets all `c6_*` flags and `g_c6_done` (they're story flags), so the epilogue replays after the NG+ ending.
- `knappers-flint` and `mem-flintcomb` reset with the key items and memories. That's acceptable; state it in both designs.

**B. Best times and NG+.** Carry `armyBest` into NG+, the same way `met` carries. Use one field name and shape: `G.s.armyBest[id] = { ticks, easy, when }`.
- NG+'s `newGame(ngFrom)` copies `met` and `armyBest`.
- The revisits menu still needs `g_won` in the current cycle.
- Story army battles never record times.

**C. Woodruff's offer and the home lines.** The epilogue's `home.woodruff.ch6` shadows ch5's home lines from `g_ch5_done` on, and `c5-sunset` can't be reached once left.
- NG+ registers one script, `'ng.offer'`, in data/ch5/scripts.js.
- `c5.last` calls it for Woodruff.
- The epilogue's `home.woodruff.ch6` ends with `const f = G.data.scripts['ng.offer']; if (f && flag('g_won')) await f(s);`.
- NG+ starts only after the script finishes.

**D. Three post-game announcements at once.** The NG+ toast, Shale's invite and the stone menus all arrive right after the credits.
- The epilogue owns the post-game quest line.
- NG+ shows no toast. It's offered on the title screen and by Woodruff.
- Revisits stays silent until a stone is used. Optionally, Quarry mentions the Lookout Stone at the feast.

**E. Who owns which shared file** (one owner each):

| File | Owner | Notes |
|---|---|---|
| state.js | NG+ only | Revisits uses the lazy init in its new `rts/best.js` and doesn't touch `newGame` |
| engine/save.js | NG+ only | |
| screens/title.js | NG+ only | |
| hook.js | NG+ only | `state().ng`; `goToLevel` sets `G.s.ng` from `seg.ng` |
| screens/pause.js | NG+ | Also adds `'Epilogue'` as `CH[6]` in the same edit; the epilogue helper doesn't touch this file |
| battle/sim.js, battle/rpg.js, data/core/enemies.js | NG+ | |
| rts/*, data/ch0/story.js | Revisits | |
| data/ch0/home.js, data/core/items.js, data/ch4/flintcomb.js | Epilogue | |
| data/index.js | Epilogue edits first | `CHAPTERS = [..., 'ch5', 'ch6']`. NG+ then appends `'ng'`, and every NG segment sets `chapter` explicitly. Don't use a name that parses to NaN. |
| data/ch5/scripts.js, data/ch5/people.js | NG+ | |
| data/ch5/maps.js, data/ch5/rts.js, data/ch5/segments.js, data/ch5/index.js | Revisits | The sunset stone script goes in a new `ch5/revisits.js`, spread in via a one-line index edit |

- Avoid the 7-file encounter edits: NG+ keeps all phase-2 data in its own module, `data/ng/bosses.js`, keyed `{ encId: ng2 }`, which rpg.js and lib-battle read by encounter id. This removes NG+ from `ch4/flintcomb.js` (Quarry's encounter is at line ~191) and from the other chapter files, and it can't leak into the base game's balance.
- Order of merges: revisits (rts only), then the epilogue, then NG+ (sim and rpg last). Replay all 30 base segments after each merge, and check that `balance.mjs --all` and `curve.mjs` output is byte-identical after NG+.

**F. Segment numbering.** It doesn't matter. `play.sh` finds segments by id, so the index-preserving claims are moot.
- Segment ids aren't duplicate-checked in `loadData`, so keep the prefixes distinct: `ng-*`/`ng-start`, `pg-revisits` (ch5), `c6-*`.
- The NG segments must not copy the base `chapter` field implicitly.

**G. Lookout Stone branch order.** The revisits `g_won` branch in `lookoutStone` is safe in NG+, because the flags reset. The epilogue adds no stone logic. No conflict, as long as the epilogue's dandelion clocks and Shale on `c0-downs` avoid the ch5 visitors at (21,23), (26,28), (28,24) and (30,26), and the stone at (30,10).
