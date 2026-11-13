# Change: army revisits from the Lookout Stone (post-game)

After the ending, the Lookout Stone lets you fight any army battle again with your full post-game army, for a best time. No story runs, nothing is lost, and the only reward is the time and a medal.

## 1. How it's offered
- **Only when `g_won` is set.** `lookoutStone(s)` (`data/ch0/story.js`) gets a new branch straight after the `c0_guided` / `g_ch0_done` checks: `if (flag('g_won')) { await revisits(s); return; }`. Before the ending, nothing changes.
- **Both stones.** Post-game starts on `c5-sunset`, whose Lookout Stone prop (6,24) is decoration only. Add a use-trigger `{ x: 6, y: 24, use: true, run: 'c5.sunset.lookout' }` (`data/ch5/maps.js`). That script (`data/ch5/scripts.js`) runs `G.data.scripts['lookout.stone']` when `g_won` is set, and otherwise narrates one line ("The Lookout Stone, still warm from the sun."). Tansy stands at (7,23), so the tiles don't clash. The `c0-downs` stone (30,10) gets the menu through the branch above.
- **The menu** is one `s.narrate` line the first time ("Every battlefield is quiet now. The army could walk any of them again, just for the fun of it.") and then `s.ask(null, '', choices)`. The empty prompt matters: six 13 px rows fit the 98 px dialog box only with no prompt line. There's one row per battle in story order, plus Back: `Sorrel Down: best 0:38.2 (gold)`, `Silverdown: not yet`, ..., `The Long Thump: best 1:52.0 (silver)`, `Back`. The short name is `D.short || D.name.replace(/^The Battle of /, '')`. A battle is listed only if `G.data.rts[id]` exists and `g_<id>_won` is set (post-game, that's all five). The guided `c0-guided` is left out: it is scripted to end in a retreat.
- After each revisit the menu shows again, so replays are quick. Back (or Esc) leaves.

## 2. What a revisit is
- It's a call to `s.army(id, { revisit: true })`. The same `G.data.rts[id]` def is used, so the map, guards, waves, tier, hold rules and Long Thump rules are all the same.
- **Army:** the normal preview screen with every owned squad. `defaultArmy` is unchanged (the story squads, then the strongest, up to the cap, plus Bramble's). Rank is `1 + 0.12 * warrensFreed()` = 1.48 post-game, and current army gear applies. RTS 5's free Deepdelve Echoes still come (`onStart`).
- **Off in revisits:**
  - the tutorial tips (`this.prompts = []` when `o.revisit`)
  - "The warren rallies" button (hidden, so times stay comparable)
  - RTS 5's `vo-rhyme` voice (`onStart` skips `audio.voice` when `rts.o.revisit`; the Echoes still spawn)
- **No story:** the revisit path never calls `<id>.intro`, never sets `g_<id>_won`, and never calls `<id>.won`. These must not run again: `c1-rts1.won` warps to the Great Burrow fight, `c3-rts3.won` rests and warps, `c4-rts4.intro`/`.won` call `s.chapter(4)` and warp, and `c5-rts5.won` is `longThumpWon`, which plays the ending again. The menu calls `s.army` directly. It shares none of the story branch's code.
- **Rewards:** none beyond the time and the medal. Optional, cuttable: when all five are gold, the stone's first line becomes "Every one of them, gold. Burdock would say 'Hmph.' He'd mean it kindly."

## 3. The best-time score
- **What's timed:** battle time, `S.tick` at the tick `S.result` becomes `'win'`, shown as `m:ss.t` (ticks / 10).
  - `step()` only runs once `started` is true (the first order), so the clock already starts on the first order.
  - Sim time ignores 1x/2x speed and pauses. Pausing to give orders is free; this is the game's core rule ("a pause that accepts orders"), and the score keeps it.
  - Real time is never used.
- **Hold battles** (RTS 1-3: the mouth; RTS 4: the mouth and the lip) are timed to the win tick, which includes the 10 s hold. The fastest possible time is "get there + 10 s".
- **The Long Thump** is timed the same way, so it includes the 60 s count and any time a stone is lost. The fastest possible time is just over 60 s.
- **Stored** in the save, so each slot keeps its own: `G.s.armyBest[id] = { ticks, easy, when }`.
  - `newGame()` adds `armyBest: {}`. Old saves get it lazily (`G.s.armyBest ||= {}` in the helpers). The save version stays at 1.
  - A Normal time replaces an Easy best even if it is slower. An Easy time is stored only when there is no Normal one, and it is shown as "(Easy)" with no medal.
  - Writing: `recordBest` sets `G.s` in `finish()`. The menu script ends with `s.save()`, and the explore scene writes the deferred autosave when the script ends. Manual slots save it too.
- **Shown in three places:**
  - **During the battle:** the tips column's top panel (`layoutSide` 'clock') reads `Time 0:42.3  Best 0:38.2`, with `(paused)` added when paused. The `sideKey` dodge ignores it, so the ticking clock doesn't nudge the camera.
  - **On the result banner:** "Victory!" with a sub-line, `Time 0:36.9. New best! Gold.` or `Time 0:44.0 (best 0:36.9).` A new best also plays `audio.synth('twinkle')` after `victory`. In revisits the banner stays up for 3.0 s instead of 2.2.
  - **In the menu list.**
- **Medals:** each battle def gets `medals: [gold, silver, bronze]` in seconds (in `data/ch1/rts.js`, `ch2/battles.js`, `ch3/rts.js`, `ch4/rts.js`, `ch5/rts.js`). They are set by a new headless tool, `tools/rts-par.mjs`. It loads the defs like `rts-check.mjs`, uses the default post-game army (rank 1.48) and army gear rank 2 (the ch5 segment's `ARMY3`, which is fairer than max gear), and runs two players:
  - **Auto** (A): `autoPlay`.
  - **Rush** (R): every squad but one goes straight to the goal nodes and is re-ordered each second.

  Gold = R rounded up to 5 s, silver = A rounded up, bronze = 1.5 A rounded up. A medal needs time ≤ target. Measured now (a scratch version of the tool):

  | Battle | Rush R | Auto A | Gold | Silver | Bronze |
  |---|---|---|---|---|---|
  | c1-rts1 | 36.6 s | 52.4 s | 0:40 | 0:55 | 1:20 |
  | c2-rts2 | 33.2 | 54.4 | 0:35 | 0:55 | 1:25 |
  | c3-rts3 | 41.2 | 86.9 | 0:45 | 1:30 | 2:15 |
  | c4-rts4 | 65.4 | 99.0 | 1:10 | 1:40 | 2:30 |
  | c5-rts5 | 71.5 | 125.4 | 1:15 | 2:10 | 3:10 |

  The tool re-runs after any balance change, and the play-test checks that gold is reachable with real input (section 6).

## 4. Retreat and loss
Retreat (pause menu) and a loss both end with the "The army falls back." banner and a return to the menu, after one line: "The army trots back up to the Lookout Stone, puffing. Nobody minds." In a revisit, nothing about the run is kept or changed:
- `finish()` skips `G.s.losses[id]++` (so the story's "warren rallies" count stays as it was)
- no time is recorded
- no Burdock tips
- 'back' from the preview goes straight back to the menu.

## 5. Changes, by file
- **`rts/rts.js`:**
  - `startArmy`: with `o.revisit`, bring back the previous music on every result, not just non-wins. `finish()` mutes music on a win, and in a revisit no story script picks the next track.
  - `PreviewScene`: hide Rally when revisiting. Under the sub-line, add `Best 0:38.2 (gold). Gold 0:40, silver 0:55, bronze 1:20.`
  - `RtsScene`: no prompts; the clock panel; in `finish()`, no losses count, call `recordBest`, and set the banner sub-line.
  - `summary()`: add `revisit`, `time` (ticks), `best`.
- **New `rts/best.js`:** `fmtTime(ticks)`, `bestOf(id)`, `recordBest(id, ticks, easy) -> { isNew, prev }`, `medalOf(id, best)`. No drawing.
- **`state.js`:** `armyBest: {}` in `newGame()`.
- **`data/ch0/story.js`:** the `g_won` branch and `revisits(s)`, which loops: menu → `s.army` → line → menu.
- **`data/ch5`:** the sunset stone trigger and script, the `onStart` voice guard, and the segment (section 6).
- **`data/ch1-5`:** the `medals` arrays.
- **`tools/rts-par.mjs`:** new.
- **No new assets.**
- **Sounds:** reused (`victory`, `squad-worn`, `twinkle`, `confirm`).
- **Music:** each battle's own track (preview `m-army`/`m-army2`, finale `m-army-finale` plus thumps) and then the map's track again. `exit()` already stops the thumps, the drone and the clash. Then `revisits` re-applies the map ambience (`s.ambience('wind', 0.2)`).
- **New UI:** only the menu rows, the clock panel, the banner line and the preview's medal line.

## 6. How to test
- **The segment `pg-revisits`** (ch5 `SEGMENTS`) is the `c5-ending` state plus `g_won`, `g_ch5_done` and `c5_sunset_arrived`, on `c5-sunset` at (7,24), next to the stone. Its quest is "Peace on the Downs...". `done: s => s.armyBest && s.armyBest['c1-rts1'] && s.armyBest['c4-rts4']`.
- **`design/solutions/pg-revisits.json`** (real input):
  1. Click the stone at (6,24), then `talkthrough` choosing 0 (Sorrel Down). In the preview, `Start the battle`, then `B`, `K` (the rush). Wait until `r.result === 'win'`, then until the menu dialog is back. Check that `s.dialog.choices[0]` includes `best`.
  2. Choose 1 (Silverdown), Start, then `Escape` and `button: Retreat`. Check that `s.losses` is unchanged (equal to the segment's), there's no `armyBest['c2-rts2']`, and the dialog is back.
  3. Choose 3 (Flintcomb), `{"army": "auto"}`, and wait for the win.
  4. Choose Back. Check that `s.map === 'c5-sunset'` and the quest and chapter are unchanged, so no `.won` warp or chapter card ran. Then `done`.
- **Reload:** `playwright-cli -s=pg reload`, then `pg-revisits-reload.json` with `--no-jump`: any key, `button: Continue`, walk to and click the stone. Check that the choice rows still show both best times, then Back. Optionally, save to slot 2 from the pause menu before reloading, and load slot 2.
- **Also:** a headless check that the game's real `defaultArmy` reaches gold in RTS 1 with the B+K rush (the medal table is meant to be reachable).
- **Re-run all existing segments** to confirm the story path is untouched: `c1-rts1`, `c2-rts2`, `c3-rts3`, `c4-rts4`, `c5-rts5`, `c5-ending`, the fullrun, and `rts-check`. Also click a stone before the ending (c4 segment): the old behaviour, with no menu.

## 7. Risks
- **`.won`/`.intro` side effects** (warps, `s.chapter()` going backwards, quests, rest, the ending). Revisits never call them, and the test checks the map, chapter and quest afterwards. Anyone who later adds `<id>.won` logic must keep it out of `revisits`.
- **The losses counter and Rally:** guarded by `o.revisit`. A missed guard would quietly change the story's retry help.
- **Music and ambience:** without the `startArmy` change, a revisit win leaves silence on the sunset map. The finale's thumps and drone must stop on exit; that's already in `exit()`.
- **Camera:** the explore scene sits under the opaque RTS scene untouched, so it returns as it was. Each battle's camera is fresh.
- **Sim determinism:** a fixed plan always gives the same time, so gold is "find the plan". That's fine for a post-game toy. The medal times must be re-run if `sim.js` or the tiers change.
- **Easy mode** is much quicker (tier × 0.75). Easy times are marked and get no medals.
- **The menu box only fits six rows.** A sixth battle would need a scrolling list or a small scene.
- **Old saves** have no `armyBest`; the lazy init covers it. A save loaded from before the ending sees no menu until `g_won`.
