# ch4 (Flintcomb and the Center of the Earth) progress

## Round 3 (helper 3, started 01:45)
Files already there (from helpers 1-2): `common.js` (legend, freeSpot/placed helpers, pixelText "A.S."), `grid.js` (grid carving
helpers), `flintcomb.js` (maps c4-flintcomb + c4-warren, encounters, Quarry's store shop, scripts up to Quarry woken and
`c4.climb` which warps to `c4-underway` entry `top`), `rts.js` (c4-rts4), `segments.js` (5 segments, maps c4-underway,
c4-mushrooms, c4-root referenced but not built), `index.js`. Only `c4-quarry` has a solution (untested by me yet).

Missing: maps c4-underway, the tubes (A.S. forks, whispering gallery, Hansbach), the Lidenbrock Sea (raft, storm,
geyser island), the mushroom forest + plain of bones + shepherd sneak + Rumble, the fallen rock, c4-root (Deepdelve ruins,
Hollow Rabbits boss, Elevenfold stall + star-stones quest, way down to c5-deep with g_ch4_done), encounters for Journey/Root,
banter, bestiary, memories (mem-mushrooms, mem-stars), quests, places, home.<id>.ch4 lines, mapAdds (Quarry/Rumble at home),
solutions for c4-rts4, c4-hole, c4-herd, c4-root.

Plan: check existing maps load + c4-quarry replays; then build c4-underway + c4-tubes + c4-sea (segment c4-hole), then
c4-mushrooms (c4-herd), then c4-root (c4-root), then extras.

### 02:10 update
- c4-quarry solution fixed (it stopped at the lip trigger) and replays ok.
- New files: `journey.js` (c4-underway, c4-tubes with A.S. forks/gallery/Hansbach, c4-sea with raft, sea monsters, storm
  battle, geysers), `herd.js` (c4-mushrooms with glade memory + Rumble found, c4-field = shepherd sneak (merge map, gaze
  cone in update/onHop/gazeState, cover tiles 'C'), herd reunion, Rumble recruit, fallen rock), `root.js` (c4-root with
  stars, moving roots, Elevenfold stall + 3 star-stones quest (mem-stars), c4-deepdelve with Hollow Rabbits boss, sets
  g_ch4_done, door to c5-deep 'top'). All wired in index.js. Not yet play-tested; solutions for hole/herd/root next.

### 02:45 update
- Solutions written: c4-hole (replayed ok once, encounters since trimmed to pairs: re-running), c4-herd (pieces ok:
  sneak works with `until s.gaze.dir === N && s.gaze.next > 1.6` then walk), c4-root (pieces ok incl. Elevenfold's
  quest, boss, and the way down into c5-deep). Full replays running.
- extra.js: bestiary, memories (mem-mushrooms, mem-stars), banter (talk.flintcomb/hole/sea/mushrooms/root, enter.* for
  all 9 maps, 6 pairs), quests, places, home.<id>.ch4 for all 14 home rabbits, mapAdds (Quarry in c0-warren, Rumble
  and Knapper on c0-downs).
- XP: fights trimmed to 2 enemies (tier 2 + tier 1) and the Hollow Rabbits' XP x0.3 (tweak) so the player is ~26
  entering the finale. Fights are short (2-3 rounds); boss ~5 rounds in battle-check without gear.
- Left: c4-rts4 solution, screenshots of all maps, final replays.

### 02:40 update
- c4-root replays ok end to end (into c5-deep), c4-herd replays ok. c4-hole re-running after raft move (rafts now sit
  fully on water: w (11,19), iw (20,19), ie (35,19), e (43,19)). c4-rts4.json written (army autopilot), untested yet.
- Shepherd gaze only advances while the explore scene is on top and not paused.

### 02:55 update
- c4-rts4 replays ok with manual orders (KeyB everyone: spoil -> floor -> lip; then squads 2,3,5,7,8,9 to the mouth,
  1 and 4 hold the lip). The army autopilot loses this one (it never holds both nodes): use the scripted solution.
- Final full replays of hole/herd/quarry running. Then screenshots of warren/tubes/flintcomb.

### 03:05 final
- All five solutions replay to {"ok": true}: c4-rts4, c4-quarry, c4-hole, c4-herd, c4-root (the last ends in c5-deep).
- Fixed a page hang: placed()/freeSpot (common.js) read other chapters' getter-placed npcs/props on c0 maps, whose
  getters read ours back (ch1w spotNear) -> runaway recursion when loading c0-downs/c0-warren. Now only plain numbers are
  read, placed() has a reentrancy guard and marks its npcs `mine: true` (ch1w's spotNear skips those).
- Screenshots: design/screenshots/ch4-{flintcomb,warren,underway,tubes,sea,mushrooms,field,root,deepdelve}.png.
- Known: normal fights are short (2-3 rounds) and the Hollow Rabbits ~5 rounds (gear makes it shorter) because the
  XP curve was prioritised (player ~26-27 entering the finale). Army autopilot loses c4-rts4; the solution uses orders.
