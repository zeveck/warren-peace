# Integration pass (cross-chapter)

## Step 1: tools/reach.mjs
Start: 1 ERR (c5-sunset entry "feast" not walkable), 33 warnings. Working through them.
Fixed (data only):
- c5-sunset (ch5/maps.js): entry "feast" (14,14) sat on the banquet table -> (14,15). Unused by scripts.
- c4-deepdelve (ch4/root.js): prop-mural-wall (9..11,26) plugged the only corridor into the mural room, so hollow-b
  (and the bones/rubble room) was unreachable. Mural moved onto the room's back row (8..10,27), its use-trigger with it,
  corridor tiles behind it (9,26),(10,26) made wall; the way in is x=11. c4-root solution's mural step -> walk [10,27].
- c4-deepdelve dd1 loop (5,16),(8,16) were wall tiles -> (5,17),(8,17). Engine enemies walk greedily to the next loop
  point and stall forever on a blocked one, so these were real.
- c4-warren fw5 started inside the W wall (25,18) -> (26,18). c4-sea sea1 loop ran through prop-pool-rock (5,14) ->
  loop round it [[4,13],[7,13],[7,16],[4,16]]. c1-riverbank rb4 loop point (30,9) was prop-dandelions -> (31,9).
- c4-field shepherd: marked deco (ch4 removed his talk on purpose: his big sprite eats clicks); added a use-trigger on
  his stone heap (after the herd is home) so his existing c4.shepherd lines are reachable by facing it + Space.
Left as intentional (reach now: 0 ERR, 26 warnings):
- Doors on blocked tiles (13): all are doors inside door props (sealed door, keyhole, river door, eye door, badger
  door, Toad Hall, ruin arch, tube mouth, warren entrance) or on map-edge wall tiles; each has a walkable tile in front
  and works by hopping into it (explore.js tryHop). c1-road Toad Hall door is guarded by two weasels until the Chief is
  beaten (story). NOTE (engine, not changed): clicking a door prop walks next to it and calls interact(), which ignores
  doors, so these doors need a key hop; mouse-only players can't use them. One-line fix would be in explore.js interact().
- c3-river scarecrow on his pole in the river: unreachable on purpose; the Stork (talkable) lifts him off.
- c4-field shepherd: deco now, still "can't be reached" (stands on his raised heap).
- c0-warren c1w visitors at (-1,-1): headless only (spotNear needs G.data at runtime); checked in the browser (step 3).
- tidewarden / undersleeper-eye battle sprites: drawn by their own backdrops (boss-tidewarden / boss-eye).

## Step 2: chapter joins (real clicks/keys in the browser, session "integ")
- ch0 sealed door -> c1-depths: BROKEN for the mouse. c0-warren's deep passage (and the tunnels [25,18..27], [24,9..11],
  [8..10,15]) are one tile wide with a height-1 wall row in front; engine pick() gives every click to that wall, so
  "Can't get there" everywhere in the passage and on the door. Fixed in ch0/maps.js buildWarren(): low walls directly
  in front (x+1 / y+1 / both) of one-tile tunnels and the door threshold are now floor-level ledges (height 0).
  After: walked (25,20)->(25,28)->(21,28) by clicks, clicked the door: key turns, c1-depths, Chapter 1 card,
  quest "Follow the old tunnels down. Find friends." Back up by hopping into the door: c0-warren 'deep'.
- ch0 warren entry: the first-visit and wreck branches also called s.quest; now guarded by !c0_door_open like the
  third branch (only reachable on segment jumps, but harmless).
- c1-underway keyhole (click) -> c1w-hall 'fall', quest = ch1w's; c1w-hall arch (click) -> c1-underway 'keyhole',
  quest = ch1's underway line. Eye-stair (click, after riverbank+wonder) -> c1w-shallows 'top' (eye opens), quest
  ch1w's; stair (walk on) -> ask -> c1-underway 'stair', quest "Both symbols glow...". River door (click) ->
  c1-riverbank 'underway' and the warren-entrance (click) -> back. All OK.
- ch1 completion, Shallows-last order: replayed the c1w-shallows solution on a state with RTS1 won + Great Burrow
  done. After the Choir, ch1w calls c1.checkDone: g_ch1_done set, quest "Chapter 2: go to the Lookout Stone.
  Silverdown is next." OK.
- Quest-line audit (scratchpad audit.js): for each stage, load the next chapter's segment, then enter every earlier
  chapter map TWICE (second entry = a returning player) with a sentinel quest. Found after ch1: every Wonderland map
  (ch1w quest(s) helper / s.quest(wonderQuest())), c1w-shallows, c1w-deep ("The Shallows are quiet now") and
  c1-wildwood ("Back to the Underway.") replaced the later chapter's line. Fixed: ch1w/scripts.js quest helper +
  hall/duchess/shallows/deep enter calls, and ch1/scripts.js c1.wildwood.enter, now skip once g_ch1_done is set.
- Quest audit, later stages: c2-moon re-set moonQuest() on every entry ("Back down the moonbeam stair...") -> now only
  until Tansy is recruited (ch2/scripts.js). ch3/ch4 maps: nothing overwrites. (c2-underway is guarded already.)
- Step 5: replayed c2-drowned (ok); after the Tidewarden "Go home" -> c0-downs 'north', quest stays ch2's
  "Chapter 3: from the Lookout Stone, Wheatsheaf is next." Confirmed.
- c0-downs north door (hop) -> c2-silverdown 'south' and its door back -> c0-downs 'north', quest kept. West door
  closed before RTS3 (line shown). Lookout Stone (click) -> c3-rts3 preview -> (win forced) -> c3-rts3.won: Chapter 3
  card, warp c3-wheatsheaf 'east', quest "Wake Barley...". Wheatsheaf door (29,15) -> c0-downs 'west' -> west door ->
  back. OK.
- ch3 -> ch4: east door closed before RTS4. Lookout (click) -> c4-rts4.intro card -> preview c4-rts4 -> (win forced)
  -> c4-rts4.won -> c4-flintcomb 'west', quest "Find the warren mouth...". Flintcomb west edge <-> c0-downs east OK.
  (Jump-state note: ch4's segment flags lack c0_attack, so the Lookout gives the pre-raid line on a jump; real play OK.)
- ch4 Root -> c5-deep: replayed c4-root (ok, 85 steps, incl. the moved mural): ends on c5-deep, Chapter 5, quest
  "Talk to Old Yarrow at the Thump Stones to begin the Long Thump."

## Step 3: home maps at every stage (scratchpad home.js: segment state + stage flags, enter both maps, check
## positions, talk to every home rabbit, collect console/page errors)
Stages: after ch0 (seg 3), ch1 (seg 12), ch2 (seg 17), ch3 (seg 23), ch4 (seg 28), won (seg 29 + g_won).
- No hang at any stage (loads 4-240 ms), no console/page errors, nobody on a wall/prop tile or sharing a tile,
  every talkable person has an open tile beside them (up to 27 people in the warren, 12 on the downs).
- Fixed: Mallow and Comfrey asked "trade?"/"rest?" twice in ch2 and ch3 (the chapter scripts asked, then ch0's
  dispatcher asked again). Removed the chapter copies (ch2/extra.js, ch3/extra.js).
- Fixed lines said too early:
  * ch1 (ch1/scripts.js): before the River Bank is done, Yarrow/Mallow/Comfrey/Pip/home-2,4,5,6 talked about Badger,
    Ratty, Toad, the weasels' apology and the reopened nursery. Now: elders fall back to their Prologue post-raid
    lines, Pip and home-2/4/5/6 get one new early line each.
  * ch2 (ch2/extra.js): moon lines (Woodruff, Comfrey's mooncakes, Yarrow, home-6/9/10) only after c2_mn_seen;
    with nothing left the Chapter 1 line plays.
  * ch3 (ch3/extra.js): Woodruff/Mallow/home-4/6/8's "before Pip" lines describe Wheatsheaf already woken, but it
    is woken in the same scene that recruits Pip. They now join the after-set; before it those five keep their
    Chapter 2 lines.
  * Pip stood at home in ch3 while Yarrow/Comfrey/home-5/7/9 say he has gone after Bramble: ch0's home Pip now
    leaves when g_ch2_done (ch3's mapAdds bring him back once recruited).
- Defensive: ch0's morning Tansy on c0-downs now also needs !attacked() (she showed on segment jumps).
- ch3, ch4 and post-game (g_won) lines all fit their stage; ch5 visitors (c5-echo, -sd, -ws, -fc) appear after g_won.
- Also: ch2/ch3 fallbacks now pass the actor through (home-9, a kit, was speaking as "doe"); ch1's home-10 lines were
  a kid's ("When I'm grown...") but home-10 is Lichen, an old half-deaf doe (ch0): two new lines in her voice.
- Re-ran stages ch0-ch2 after the fixes: lines fit, no errors.

## Step 4: "Home, briefly" (by hand)
State: River Bank done, Wonderland not, no pebble. Came up through the sealed door by a key hop, clicked one tile
into the deep passage: the scene runs (Ratty/Badger/Burdock, fade + digging, nursery tunnel heap removed, Pip runs in
with the chalk pebble, reply choice, "Got Tansy's Chalk Pebble!"). After: mem-pebble in memories, chalk-pebble 1,
c1_home_brief + g_c1_nursery_cleared set, quest back to ch1's ("The keyhole door: find friends in Wonderland.").
Screenshot looked at: Pip, Badger and Bramble by the door, fine. Note (left): Burdock and Ratty speak in the scene
even when they are not among the two travelling companions (they're in the party, just not on screen).
- Fixed: the ch1w visitors (Cheshire Cat, Caterpillar, Ninefold) never appeared in c0-warren at any stage. Their
  spots came from spotNear(), which skips trigger and people tiles: the deep passage is now all ch1's "Home, briefly"
  triggers (Ninefold got null) and the Great Burrow is crowded (the Cat/Caterpillar asked for the 3rd/4th spot ->
  null). Now fixed tiles, chosen against every chapter's people/props/triggers: Cat (18,8) and Caterpillar (9,9) in
  the Great Burrow, Ninefold (27,7) in the nook's far corner. reach.mjs: 20 warnings, 0 ERR.
- Caterpillar's first fixed tile (9,9) was boxed in by a root pillar; moved to (11,10) (the only free tile with
  open sides left in the Great Burrow). Positions re-checked at "won": ok. All three talk. Screenshots looked at:
  design/screenshots/integ-warren-burrow.png, integ-warren-deep.png (flattened passage edge reads fine),
  integ-deepdelve-mural.png (mural on the back row, room reachable, hollow-b inside).

## Replays after my edits (tools/play.sh, session integ, one at a time)
ok: c0-surface, c0-warren, c0-attack, c1-toadhall, c1-greatburrow, c1w-wonder-a, c1w-shallows, c2-moon-a,
c2-drowned, c3-oz-a, c3-oz-b, c3-china, c4-rts4, c4-hole, c4-herd, c4-root (earlier), c5-rts5, c5-ending.
Failed in the first batch, all inside battles being retuned right now by the balance pass (files edited 04:19-05:02):
- c1-riverbank step 115: a Wild Wood weasel the balance pass's new step expects never catches up (solution edited 04:44).
- c1-rts1 step 34: army battle not won in time (ch1/rts.js edited 04:24). The Lookout launch itself worked.
- c1w-wonder-b step 72: Queen of Hearts croquet lost (ch1w/encounters.js edited 04:33).
- c2-moon-b step 65: Moth Queen lost, back at the grove door (ch2/battles.js edited 05:02).
- c4-quarry step 42: Captain Quarry lost, back at the top (ch4/flintcomb.js edited 04:33).
Retry of the five: c1-riverbank ok (covers the rb4 loop fix), c1w-wonder-b ok. Still failing the same way:
c4-quarry (battle-check c4.quarry at the segment's L22: 4/30 wins, 25 rounds; the balance pass also made the
c4.fc-* fights 3-4 enemies with hardy(1.6)), c2-moon-b (Moth Queen), c1-rts1 (army not won in 200 s). None of them
touch what I changed (my c0-downs edit is the morning Tansy cond; fw5 only moved out of the wall and loops at
x 26-27, away from the route to the lip). Left for the balance pass.

## Final state
node --check on every file I touched: ok. reach.mjs: 0 ERR, 20 warnings (all listed above as intentional:
13 door-in-prop/edge doors, scarecrow on his pole, shepherd on his heap (2), 2 boss battle sprites drawn by
their backdrops, c4-deepdelve/c4-root edge doors). Session "integ" closed.
