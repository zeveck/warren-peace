# ch2 progress (round 3 helper)
## What the files held at start
- maps.js: c2-silverdown, c2-silverdown-warren, c2-depths, c2-underway, c2-moon, c2-moon-palace, c2-moon-craters, c2-moon-grove, c2-drowned, c2-drowned-pool (all syntax-ok).
- scripts.js: full story scripts (rts2 intro/won, Silverdown, Aster boss, depths, underway, moon/WuGang/traveller/Jade/Chang'e/hares/Moth Queen/Wick, Drowned/Tansy/Tidewarden).
- battles.js: encounters, shop c2.moon-toad, rts c2-rts2.
- index.js exported only maps/encounters/shops/rts: scripts NOT wired, no segments/banter/etc.
## Plan
1. Wire scripts into index.js, load game, fix errors, screenshot maps.
2. Segments c2-rts2, c2-aster, c2-moon-a, c2-moon-b, c2-drowned + solutions.
3. speakers, bestiary, memories, banter, quests, places, mapAdds, home.<id>.ch2.
## Status
(updated below)
- RTS2: segment c2-rts2 replays ok (army auto). rts-check: required-only Even 35%, with optionals+gear2 Strong.
- index.js now wires scripts, segments (segments.js), extra.js (bestiary, memories, banter, quests, places, home.<id>.ch2, mapAdds c0-warren visitors).
- build.js grid.trim(): tunnel maps (warren, depths, underway, drowned, pool) get void far from floors and floor-level ledges in front of floors (raised ones steal clicks: engine pick() tolerance 1.02 lets a +1 tile at (x+1,y)/(x,y+1)/(x+1,y+1) win over the floor tile clicked).
- Solutions are generated with a scratch helper that inserts fight/talkthrough when a walk is interrupted, then saved as plain solutions.
- c2-aster, c2-moon-a solutions generated (need replay verification).
- Tidewarden: tools/play.js fight autopilot loops forever when the only enemy is untargetable (submerged). Workaround in data: c2.tidewarden onRound summons a Cold Ripple on submerged rounds when it's alone.
- Long clicked walks fail silently (A* 600-node cap): solutions use intermediate walks.
- Tidewarden retuned (HP x0.6, sturdy summoned ripple x2.2 HP when it submerges alone): battle-check 12/12, ~9 rounds.
- play.js fight autopilot sometimes throws 'no button "Skill" among ' (empty buttons() mid-frame); rerun fixes. Flaky tool, not data.
- Moth Queen clearing: click (9,9), not (11,10) (moon-hare sprites at (10,11)/(12,11) cover that tile and steal the click).
- All 5 solutions generated; full replay running.
- ALL 5 solutions replay ok (rts2, aster, moon-a, moon-b, drowned). Next: screenshots.
- Screenshots: design/screenshots/ch2-*.png for all 10 maps, looked at, no problems found.
## Status: DONE. Open items: optional Wick quest and Moon Toad shop are written but no solution covers them. Ending c2-drowned warps to c0-downs, where ch0's onEnter replaces the quest line.
