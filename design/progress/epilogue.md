# Epilogue ("Digging the Other Way") build notes

Design: `design/changes/epilogue.md`, with every must-fix and should-fix finding from `design/changes/REVIEW.md` section 3 applied (and conflicts C, D).

## What was built
- `game/src/data/ch6/` (new):
  - `index.js`, `common.js` (flags, `nextStep()`, `refreshConds(ex)`, `thump(s)`, staging helpers)
  - `maps.js`: `c6-upburrow`, The New Burrows. Its tiles and heights are getters, so a room's floor exists only once it's dug.
  - `adds.js`: mapAdds on `c5-sunset`, `c0-downs`, `c4-flintcomb` and `c4-warren`.
  - `scripts.js`, `extra.js` (speakers, bestiary, `mem-flintcomb`, banter, quests, places, `home.<id>.ch6`), `segments.js`.
- **The hook.** Shale waits on `c5-sunset` at the feast (8,10), where post-ending saves are, and on `c0-downs` by the warren mouth (22,19), clear of the ch5 visitors and the Lookout. On each map a full-map `once` step trigger (cond `g_won && !c6_invited`) makes her emote and sets the post-game quest line, so the Epilogue owns that line (conflict D). Talking to her gives the invitation.
- **Shale is `fc-doe`.** At Flintcomb, ch4's `fc-doe` is hidden while she waits on the downs (`g_won && !c6_invited`). Her talk goes to `c6.shale` once the Epilogue starts, and her freed line now uses the `shale` speaker.
- **Arrival.** `c4.flintcomb.enter` hands off to `c6.arrive` once `c6_invited && !c6_started`. That sets `c6_started`, `s.chapter(6)` and the chapter card, followed by Quarry's opening.
- **Tasks:**
  - **A, heaps:** Rumble shoves the three surface heaps (escort `c6-rumble`, or Rumble travelling). The three beats differ: Quarry's "a barrow at a time, a hundred years" line, then the kits helping, then the solo show-off that turns up the nursery's button tin.
  - **D, clocks:** all five clocks are on Flintcomb's west downs. Each cleared patch is sown the moment its heap goes if Bramble carries a clock; otherwise using the bare chalk sows it later. The last two clocks are blown over the bowl.
  - **B, old rooms:** five flint-stopped alcoves in the new burrows. The tally-stone gives three clues, each drawn on the map: a sunbeam, a damp weep, the hearth. Hollow alcoves boom and dig open with a fade. The two solid ones get funny "thock" reactions, and one answers "EH? WHO'S THAT?", because Knapper's store is on the other side.
  - **C, Gault:** Chip (escort from the nursery) talks his dad round at the lip, with Quarry's needle ("Home's up now").
- **Thump** is code-made: a hop in place, a shake and the sfx. It skips the hop on tiles with step triggers, because a landing re-ran ch4's climb trigger at Quarry's rope.
- **`refreshConds(ex)`** re-reads props, npcs and (for `retile` maps) tiles in place. There are no same-map re-warps.
- **Closing.** It runs straight after the last task if Bramble is at the lip, or else from a step trigger at the lip's edge (x 12, y 14-17).
  - The crowd is spawned, Yarrow is spawned (ch4's Yarrow is now hidden with `!c6_started`), and the Top Stone (`prop-thump-stone` at 19,12) appears.
  - Three `Thump` choices, then the purr.
  - Up to the bowl, now with a dusk tint, the feast spread and dandelions. Then the picture `bg-epilogue`, `mem-flintcomb` and the `knappers-flint` keepsake, and `g_c6_done`.
  - Afterwards the stone can be thumped, or the picture viewed again.
- **Home lines.** `home.<id>.ch6` explicitly plays `home.<id>.ch5` until `c6_started`. `home.woodruff.ch6` ends with `G.data.scripts['ng.offer']` when it exists and `g_won` is set (conflict C).

## Edits outside ch6
- `data/index.js`: `'ch6'` added to `CHAPTERS`.
- `data/ch0/home.js`: `newest()` starts at 6.
- `data/core/items.js`: `knappers-flint` key item.
- `data/ch4/flintcomb.js`:
  - Spoil-heap conds.
  - Music and ambience getters gated on `c6_started`: the Hum loop goes, surface music becomes `m-downs`, warren music `m-warren`. All ch4 segments are unchanged because the getters are never gated on `freed()`.
  - `fc-doe` cond and speaker; Yarrow `&& !c6_started`; the arrival hand-off in `c4.flintcomb.enter`; a dusk `tint` getter after `g_c6_done`.
- `tools/sizes.py`: four prop sizes.

## Tests
- `c6-bowl`, `c6-burrows` and `c6-stone` replay to `{"ok": true}`, with Quarry, Rumble and Pip standing on the map (active: Tansy, Burdock).
- Both-ways run: `c6-bowl-b` (Rumble and Quarry travelling) and `c6-burrows-b` (Pip and Quarry travelling) also replay `{"ok": true}`. Run on the same files, minus the Rumble talk.
- Console is clean (0 errors, 0 warnings).
- Screenshots looked at: `design/screenshots/ch6-*.png`.
- Regressions after the edits, reloading before each: `c4-quarry`, `c4-hole`, `c4-herd`, `c4-root`, `c5-dream` and `c5-ending` all `{"ok": true}`, with 0 console errors. The c6 replays pass in the same batch.
- **Real-save test.** Replayed `c5-ending` to get the post-credits autosave, then reloaded and used title Continue. The save is on `c5-sunset` with ch5's quest. On the first hop, Shale emotes and the quest becomes hers. Then the invitation, the sunset door, Thimblebank, the downs, the bowl, the burrows and Gault, ending in the closing with the keepsake and chapter 6.
  - Saved and reloaded mid-Epilogue twice. After the reload, props and npcs matched the flags. The Chip escort survives a reload; `chip()` now saves.
  - Segment-made saves lack `c0_intro`, so the title replays the intro on Continue. That's a test artefact, so I patched the flag in localStorage for this test.
  - They also lack `c4_seen_*`, so ch4's first-visit narration plays. `c6.arrive` now sets `c4_seen_flintcomb` as a guard.
- **Woodruff after the Epilogue.** His ch6 line, then NG+'s `ng.offer` (its "Tell it again" choice), which works end to end.

## Notes
- Clicks on the upburrow's front flint walls or the hearth can hit the prop sprite instead of the floor. The solutions use key presses or approach tiles there.
- The ch4 lip trigger (`c4.lip-arrive`, once) stops a walk on the gap at (11,15..16). The solutions wait for it, then hop onto the lip.
