# ch5 (Finale) progress

**Interface for ch4:** the way down from the Root of the World warps to map `c5-deep` (The Sleeping Deep), entry `top`
(`s.warp('c5-deep', 'top')`, or a door `{ to: 'c5-deep', entry: 'top' }`). The Sleeping Deep's way back up (door at
its top steps) finds whichever map has a door with `to: 'c5-deep'` and returns to that map's nearest entry, so ch4
needs nothing else. ch4 should set `g_ch4_done` before the player goes down (the finale assumes it).

Army battle id: `c5-rts5` (run from Old Yarrow at the Thump Stones in the Sleeping Deep, not from the Lookout Stone).
Flags ch5 owns: `g_c5-rts5_won`, `g_c5_dream_done`, `g_won`, `g_ch5_done`.

## Status
### Round 3 (helper 3, started)
Files already there: maps (c5-deep with the gathering crowd + 3 thump stones + rest stone, c5-dream with 3 phase
triggers/NPCs + rest, c5-sunset with ~45 people), scripts (gathering, Yarrow -> army c5-rts5 -> longThumpWon -> intoDream,
3 dream phases, sunset arrival, Tansy finale -> Yarrow locks door -> s.ending() -> g_won, home.<id>.ch5), encounters
(3 dream bosses), rts c5-rts5, people lines (deep pre/post, last lines), extras (speakers, bestiary, banter, quests,
places), memories (Eye lines + fallbacks), segments c5-rts5 / c5-dream / c5-ending with solutions (unverified).
Missing / to check: replay all 3 solutions; screenshots of the 3 maps; mapAdds (none yet); balance checks.
Plan: load game, check console, replay solutions in order, fix, screenshot+look, then polish (mapAdds, banter).
- Verified: c5-rts5 (2.5 min), c5-dream (3 min), c5-ending (1.5 min) all replay to {"ok": true}, no console errors.
- Screenshots looked at: design/screenshots/ch5-deep.png, ch5-deep-stones.png, ch5-dream.png, ch5-dream-eye.png,
  ch5-sunset.png, ch5-sunset-2.png. Fixed the sunset Lookout hill (square terraces instead of a ragged circle) and moved
  Ninefold/Elevenfold out from behind the Lookout Stone; c5-ending solution's walk changed to [10,19] (raised tile).
- Balance: dream bosses 13/13/5 rounds avg at L27 (14/15, 14/15, 15/15 wins); c5-rts5 Even (25%) with required squads
  and no gear, Strong with gear 2+.
- Added adds.js: mapAdds on c0-downs (four post-ending visitors from Deepdelve/Silverdown/Wheatsheaf/Flintcomb, cond g_won).
- The Old Key is no longer taken at the end (ch0's sealed door needs it for post-game wandering below).
- DONE: all three segments replay ok (re-verified c5-ending after the changes).
