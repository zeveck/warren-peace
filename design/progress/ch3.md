# ch3 progress (round 3 helper)
## What the files held at start
- maps-wheatsheaf.js: c3-wheatsheaf (cornfields), c3-wheatsheaf-warren (Barley's hall, deep door), c3-underway (cyclone, stair door).
- scripts-wheatsheaf.js: c3-rts3.won, Wheatsheaf rabbits, Barley boss, Pip arrives + bell find, bell ringing (frees warren, recruits Barley + Pip, gives wheatsheaf-key), Underway enter, cyclone -> c3-munchkin 'landing', stair locked.
- encounters.js: Wheatsheaf, Oz (kalidahs, chase, road, winkies, witch, hammer-heads), stair, watcher.
- rts.js c3-rts3; segments.js: c3-rts3, c3-barley, c3-oz-a, c3-oz-b, c3-china, c3-stair. Only c3-rts3 has a solution.
## Missing
- All Oz maps (c3-munchkin, forest/river/ditch road, poppies, c3-emerald, winkie country + castle, c3-south china/glinda) and scripts; c3-stair map + Watcher; extras (speakers, bestiary, memories, banter, quests, places, home lines, mapAdds); solutions for 5 segments.
## Plan
1. Load game, check wheatsheaf/barley, write c3-barley solution.
2. Oz a maps+scripts+solution; Oz b; China; Stair. 3. Extras.
## Status
- c3-rts3: solution rewritten (gather at stooks, then mill/cart/mouth); replays ok. NOTE play.js 'press: Shift+DigitN' doesn't keep shift (input.shift read per frame): use {keys:['Shift','DigitN'],ms:80}.
- (02:00) Wrote maps-oz.js (c3-munchkin, c3-forest, c3-river, c3-poppies, c3-emerald, c3-palace, c3-winkie, c3-castle, c3-south, c3-china, c3-stair), scripts-oz.js (whole Oz story, china princess, stair + Watcher, sets g_c3_oz_done / g_ch3_done), extra.js (market shop, memories mem-poppies/mem-china, bestiary, quests, places, banter, home.<id>.ch3, mapAdds c0-warren Barley/Pip/Tin). index.js wires all. Not yet play-tested beyond loading.
- c3-barley: generating solution (scratch gen.sh in scratchpad/ch3).
- Engine bug found: engine/assets.js recolor() caches by img.src; furRamp returns a canvas (no src), so fur + hum actors all share one cached 'undefined|hum' image (often a placeholder oval). Workaround: Wheatsheaf hum rabbits have no fur until freed (fur getter).
- Solutions are generated with scratchpad/ch3/gen2.py (one run-code per step; inserts fight/talkthrough). The old gen.sh (one long run-code) hung.
- c3-barley solution generated (done ok in gen); replay verification pending.
- c3-oz-a solution generated (done ok in gen). Poppy wake now uses place+fadeIn (warp to same map didn't move Bramble).
- build.js trimWalls(): walls within 3 tiles in front of a floor become flat unwalkable 'Q' ledges (tall walls stole clicks; tools/play.js clicks the tile under the cursor via pick()). Used on warren, underway, emerald, palace, castle, stair.
- gen2.py now auto-inserts on-screen waypoints (clicks on off-screen tiles do nothing).
- (02:55) c3-oz-b generating; then c3-china, c3-stair; then replay all and screenshots.
- (03:20) all 6 solutions generated (gen reached done). Next: replay all, screenshots.
- replays: c3-rts3 ok, c3-barley ok, c3-oz-b ok, c3-china ok; c3-oz-a and c3-stair being fixed.
- (03:50) All 6 segments replayed ok (rts3, barley, oz-a, oz-b, china, stair). Screenshots taken and looked at for every map.
- Asset quirks worked around: prop-oz-tree has a stray post baked into its sprite (using prop-hawthorn instead); prop-munchkin-fence and prop-winkie-pillar images are swapped (munchkin map uses prop-winkie-pillar = blue fence; castle uses prop-munchkin-fence = yellow pillar); prop-poppies looks like a little gate (using prop-rose-bush in the poppy field).
- Same-map s.warp didn't move Bramble in the poppy wake scene; used s.place + fadeIn.
- Left (optional polish): button economy not tuned against the table; the Hammer-Heads' hill and China Country have no segment beyond c3-china; scarecrow on his pole can't be clicked (he's in the river; he calls out on entry).
- (04:00) Final replay of all 6: ok; console clean. Session closed.
