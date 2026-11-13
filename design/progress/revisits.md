# Army revisits (post-game Lookout Stone): build notes

Design: design/changes/army-revisits.md, with every REVIEW.md section 2 must/should-fix applied.

## What was built
- **Menu** `rts/revisits.js` (`RevisitScene`, kind `revisits`): a small panel over the map, one row per won battle (RTS 1-5: name, "Burdock's time", gold time, your best, a code-drawn medal disc), Back. Arrows / 1-5 / click choose, **Esc or Back leaves** (no DialogScene change needed). Row hit labels read `"<name>: best m:ss.t (medal)"` / `"<name>: not yet"` so the play-test can read them.
- **Scores** `rts/best.js`: battle time = `S.tick` at the win (sim ticks from the first order; 1x/2x and pauses don't count; hold battles include the 10 s hold, the Long Thump its 60 s). `G.s.armyBest[id] = { ticks, easy, when }`, created lazily (state.js / `newGame()` untouched). A Normal time always replaces an Easy best; Easy times show "(Easy)" and earn no medal.
- **Medals** in each battle def `medals: { burdock, gold, silver, bronze }` (ch1/rts.js, ch2/battles.js, ch3/rts.js, ch4/rts.js, ch5/rts.js), from `node tools/rts-par.mjs` (post-game default army, rank 1.48, army gear 2):
  - burdock = R, the rush bot ("Burdock's time", shown as the time to beat)
  - gold = max(0.9 R, P) rounded up to 0.5 s, where P is the best of a seeded 600-plan search (proves gold is reachable by orders alone; 0.9 R alone was below anything found for RTS 2 and RTS 5)
  - silver = A (the Lookout odds auto-player), bronze = 1.5 A, rounded up to 5 s

  | Battle | Burdock | Gold | Silver | Bronze | (plan P) |
  |---|---|---|---|---|---|
  | Sorrel Down | 36.6 | 33.0 | 55 | 80 | 32.7 |
  | Silverdown | 33.2 | 30.5 | 55 | 85 | 30.1 |
  | Wheatsheaf | 41.2 | 37.5 | 90 | 135 | 35.5 |
  | Flintcomb | 65.4 | 59.0 | 100 | 150 | 53.1 |
  | The Long Thump | 71.5 | 70.5 | 125 | 190 | 70.4 |

  Real input, default pick, "B then the mouth letter": Sorrel Down 0:36.2, Silverdown 0:32.9 (both just beat Burdock: silver), Wheatsheaf 0:41.2 (level with Burdock). Gold needs a better pick and split. The army autopilot on Flintcomb: 1:21.1 (silver).
- **rts/rts.js** (all behind `o.revisit`, story battles unchanged):
  - `startArmy`: map music comes back after every revisit result (a win otherwise left silence).
  - Preview: no "warren rallies"; instead "Your best", the medal, "Burdock's time" and the three medal times under the field map (+ an Easy note).
  - Battle: no tutorial tips; a "Time m:ss.t (paused)  Best m:ss.t" panel at the top of the tips column after the first order (revisits only; `sideKey`/dodge unaffected).
  - `finish()`: no `G.s.losses` count; the banner sub-line "Time 0:32.9. New best! Silver medal. Faster than Burdock!" (or "Best ..." / "Burdock's time: ..." / "(Easy: no medal.)"), a twinkle on a new best, 3.2 s on screen; a loss says "No time this run. Nothing lost: try again from the stone."
  - `summary()` adds `revisit`, `banner`, `bannerSub`, `rev` ({ result, ticks, isNew, medal }).
- **data/ch0/story.js** `lookoutStone`: first line is `if (flag('g_won')) { await revisits(s); return; }` (before the pre-attack branch, so it is independent of other flags). `revisits(s)`: a one-time narration + Burdock line (flag `pg_revisits_seen`), then loop menu -> `s.army(id, { revisit: true })` -> (a loss: one line) -> `s.save()`. It never calls `<id>.intro`/`<id>.won` and never sets `g_<id>_won`.
- **data/ch5/maps.js** c5-sunset: a use-trigger on the Lookout Stone prop (6,24) running `lookout.stone`, `cond: afterDark` (= `g_won`), so the base game is unchanged before the ending. (No ch5/revisits.js / index edit was needed: the trigger runs ch0's script.)
- **data/ch5/rts.js** `onStart`: Yarrow's `vo-rhyme` only outside revisits (the free Echoes still come).
- **Segment** `pg-revisits` (ch5/segments.js): the ending state + `g_won`, `g_ch5_done`, `c5_sunset_arrived`, `c0_intro`/`c0_attack`/`c0_guided` (real-play flags the ch5 segments lack: without `c0_intro`, Continue from the title replays the New Game intro), at the sunset stone. Done when RTS 1 and RTS 4 have best times.

## Tests (real input, session "rev")
- `bash tools/play.sh rev design/solutions/pg-revisits.json`: stone -> first-time lines -> menu "not yet" -> Sorrel Down (B, K rush) -> win, "New best!" -> menu shows the best -> Silverdown, Esc, Retreat -> one line, menu still "not yet" (no time, no loss) -> Flintcomb (army autopilot) -> win -> Esc leaves -> still c5-sunset, chapter 5, quest unchanged -> the autosave holds both best times and `losses` is empty -> done.
- Page reload, then `bash tools/play.sh rev design/solutions/pg-revisits-reload.json --no-jump`: title -> Continue -> stone -> the menu rows still show both best times and Silverdown "not yet" -> Back. (Its final `ok` is false by construction: after a reload there is no segment for `segmentComplete`; all its steps pass.)
- Base segments replayed (reload before each), all `{"ok": true}`: c0-attack, c1-rts1, c2-rts2, c3-rts3, c4-rts4, c5-rts5, c5-ending. pg-revisits re-run after the last text tweak: ok; the reload part: every step ok. Console: no errors. Session "rev" closed.
- `node --check` on every edited file; `node tools/rts-check.mjs` still loads.

## Screenshots (looked at)
design/screenshots/revisits-menu-1280.png, revisits-menu-1024.png (the menu, two best times with silver discs), revisits-preview-1280.png, revisits-preview-1024.png (best / Burdock / medal times under the field map), revisits-clock-1024.png (the time panel under the minimap, paused), revisits-newbest-1280.png, revisits-newbest-1024.png (the "New best!" banners).
