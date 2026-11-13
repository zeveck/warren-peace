# Full playthrough (one run, real input, no jumps) — session "full"

Files: design/solutions/fullrun/NNN-*.json, replayed in order by `bash tools/fullrun.sh full [from] [to]`
(tools/fullrun-play.sh = play.js --no-jump + two extra real-input steps in tools/fullrun-goto.js: `goto` (clicks along the
A* path, farthest clickable tile each time) and `spaceUntil` (Space until a condition, e.g. stop on a chapter card)).
Segment copies: `done` steps became `until` on the segment's done condition (no segment index in a real run).
Log of every file: design/solutions/fullrun/run.log. Resume after a crash/fix: reload, then resume-slotN.json.

## RESULT: g_won reached (state().gameWon true), total play time 2:49:02 (10142 s), Bramble L24. No console errors.
Play time per chapter: Prologue 5:52 | Ch1 40:07 | Ch2 47:10 | Ch3 30:04 | Ch4 32:33 | Finale 13:16.
Not a clean single run: 4 page reloads, each after a data fix, each resumed from the game's own save (Load > slot);
and many lost fights retried inside the run (the *r / *x / *y files, used only after a loss). Session "full" closed.
Screenshots: fullrun-015-ch1-card.png, fullrun-042-c3-rts3.png (ch3 card), fullrun-031-ch2-lookout.png and
fullrun-053-ch4-lookout.png (cards closed by themselves before the shot), fullrun-ending-fadein.png, fullrun-won.png.

## Where the run is
- Prologue done (Bramble L2, Burdock L2), play time ~5:50. Saved: slot 1 (end of the Prologue, by the sealed door).
- Chapter 1 card reached (design/screenshots/fullrun-015-ch1-card.png).
- River Bank + Toad Hall done (L7, t=27:00). Saved: slot 2 (River Bank door, after Toad Hall). Home, briefly done
  (chalk pebble). Into Wonderland.

- Wonderland, Shallows (Choir), Ninefold (dandelion fetched from the surface), RTS1, Great Burrow: Chapter 1 done at
  t=46:00, L10. Saved: slot 1 (end of Chapter 1, Great Burrow) and slot 3 (Wonderland done, garden).
- RTS2 won from the Lookout (Chapter 2 card shown there; it auto-closed before the screenshot: missed).
  Home for Mallow (tier 2 gear) + Comfrey's rest, then Silverdown.

- Chapter 2 done at t=1:33:09 (5589 s), L16. Saved: slot 2 (Jade Rabbit joined, moon), slot 3 (Chapter 2 done, downs).
- RTS3 won (Chapter 3 card: design/screenshots/fullrun-042-c3-rts3.png). Barley woken, Pip joined. Saved: slot 1
  (Wheatsheaf, Barley done). Into Oz.

- Oz (Tin Woodman, Scarecrow, Lion, Mouse Queen, Wizard, Witch, Glinda), the China Country (back through the dust
  whirl: the Oz plan answers Glinda's "use the shoes now?" with yes), the Stair of Eyes / Watcher: Chapter 3 done at
  t=2:03:13 (7393 s), L19. Saved: slot 2 (Oz done), slot 3 (Chapter 3 done, foot of the Stair).
- Home (Mallow tier 5 for Tansy, Comfrey's rest), RTS4 won from the Lookout (L19). Into Flintcomb.

- Flintcomb: Quarry woken (slot 1), the hole, the sea, the mushroom forest, the herd (Rumble; slot 2), into the Root
  (L22, t=2:26:42).

## Bosses (level of Bramble / party at the fight)
- Chief Weasel (Toad Hall): L7 (Bramble, Badger 7, Mole 6). LOST the first try (Bramble+Badger had +2 coat/tool from
  Otter, Mole nothing; came in hurt after the stoat/ferret/weasel fight). Won the retry at full Heart (020r file).
  headless: L7 no gear 19/30, L7 all +1 gear 30/30. The segment assumes all +2 gear (8 pieces = 760 buttons); a real
  run has ~465 buttons at Otter's. A real player may lose here once.
- Choir (Shallows): L9, won first try. RTS1 (L9) won; Great Burrow (Chert's band) L9->10 won.
- RTS2: L10, won.
- Aster: L10 (segment expects 12). LOST the first try (came in after two fights); won the retry (034r) at full Heart.
- Moth Queen: L13 (Mole, Ninefold; Thimblebank +2/+3 gear). LOST TWICE (the walk after the first loss re-opened the
  fight at low Heart). Fixed by a real-player detour (038r): Moon Toad's stall (Lantern III, Pestle III, Star Amulet
  III, Moon-silk x2), Caterpillar + Ninefold, rest stone, won. headless at L13: gear2 Mole+Ninefold 23/30, gear3
  Caterpillar+Ninefold 30/30.
- Tansy (Hum-taken, Drowned Halls): L14, LOST once, won the retry (040r).
- Tidewarden: LOST at L14 and at L15. headless: L14 0-6/30 for every pair, L15 23/30, L16 27/30 (segment says 16).
  Enemies never respawn (explore.js), so the only XP is the wanderers the plans skip: 040x (pool), 040y (drowned
  halls, moon; plus the Moon Toad's +3 gear for Badger/Jade) took the party to L16; won on the third try.
- RTS3: L16, won.
- Barley: L16 (segment 18). LOST twice (first: party still hurt from the Tidewarden + RTS3, no rest on the way;
  second at full Heart with Badger+Jade); won the third (headless says 30/30 for that party: the browser fights are
  noticeably worse than battle-check for Barley).
- Hollow Rabbits (Root): L22-23, won (a wanderer fight in the Root was lost once before: 062r/062r2).
- RTS5: L23 won. Nightmare of Deepdelve L23 won. Nightmare of Flintcomb: L24, LOST with Rumble+Jade (headless 10/30;
  its counter is Cure/Ninefold), won with Ninefold+Jade (066r, headless 30/30). The Eye (stories): L24, won.
- Wicked Witch (Oz): L18, won first try. Watcher: L19, won (a stair wanderer was lost once before it: 052r).
- RTS4: L19, won.
- Captain Quarry: L20 (segment 22). LOST once (the plan fights three wanderers at the lip and doesn't use the rest
  stone beside Quarry); rested and won the retry (056r).

## Reloads
1. After the ch0 fix below: reload, Load slot 1 (Prologue end).
2./3. After the two ch1/extra.js fixes below: reload, Load slot 1 (end of Chapter 1, in the Great Burrow).

## Bugs found
- FIXED ch0/maps.js:272 home-10 (Lichen) stood at (25,20) inside the one-tile deep passage: after the raid nobody could
  reach the sealed door (soft-lock of the whole game after the Prologue; click "Can't get there", hop blocked). Moved
  to (26,15) in the root cellar. Also ch0/maps.js:254 lanterns L(25,19,5) and L(22,28,5) sat inside the same passage
  (they come back at home level 5 = after Chapter 3 and would block it again): moved to (24,17) and (21,16).
- FIXED ch1/extra.js:182 rescued rabbits 4 and 5 stood at (6,3),(5,4): together they plugged the 2-wide passage from
  the warren mouth to the Great Burrow once Thimblebank was freed. After the Great Burrow fight Bramble could not leave
  the warren (no way to the Lookout for Chapter 2 = soft-lock). Moved to (2,2),(2,4) (corners by the mouth).
- FIXED ch1/extra.js:182 rescued rabbit 3 at (16,5) closed the last gap (with home-6 at (15,3) and home-5 at (16,8))
  into the east half of the Great Burrow: Mallow's shop unreachable after Chapter 1. Moved to (21,6).
  (Checked with a read-only flood fill over the live map with people as walls: only 1-3 tile pockets remain.)
- Ninefold (Shallows) asks for a dandelion; the segment start carries 2, a real run has none. The real player must
  climb back to Sorrel Down (dandelions by the warren mouth), and down again: 2 long trips. Worse: once the Choir is
  done the quest line says "Gather the army at the Lookout Stone" and the Ninefold errand vanishes from the quest
  line (ch1w), so a player can easily leave Ninefold (and mem-dandelion, a main-path memory) behind. Not changed.
- FIXED ch1/extra.js:175 home Badger (c1-badger) stood at (14,3): whenever Badger is not travelling, he, Woodruff
  (12,5), kit-a (13,4, from home level 3) and home-6 (15,3) wall the Great Burrow off from the warren mouth (Mallow,
  Comfrey, Yarrow unreachable; in Chapter 4 the whole warren past the mouth). Moved to (18,3), a dead-end corner.
  (Reload 4: resumed from slot 3.)
- Underway rest stones list the OTHER known Underways first and "Stay here" last: a player who just wants to rest and
  presses Space twice gets warped to Thimblebank's Underway (it happened in this run once, with a wrong choice index).
  Not a bug, but "Stay here" first would be kinder.
- Chapter cards close by themselves after a few seconds (the ch2 and ch4 card screenshots were missed: the run only
  saw the dialog after them). Fine for players.
- Party picks in the camp's Party tab with the MOUSE are unreliable once the list scrolls (13+ members): the hover
  re-scrolls the 12-row list under the cursor, so a click can toggle the wrong rabbit (it dropped Jade instead of adding
  Captain Quarry here). Engine: game/src/screens/camp.js drawParty()/rowSel(): `start` depends on `this.sel`, and
  rowSel sets `this.sel = i` on mouse move, so the rows shift under a still cursor. Keyboard (arrows + Space) is fine.

# Run 2 (clean proof run, after the engine/calibration fixes)
Main-path files only: design/solutions/fullrun/NNN[a-z]-*.json (run 1's full set incl. retries is archived in
design/solutions/fullrun/run1/; resume files in fullrun/resume/). tools/fullrun.sh fixed: matches whole names
(051z ran), only NNN[a-z]-*.json. Segment copies regenerated from the current solutions; run-2 edits: rests at the
stones before Aster, Barley and Captain Quarry; shops on the way (Otter, Mallow each chapter, Moon Toad, Emerald
Market, Elevenfold); Glinda "Not yet" -> China -> shoes; Underway "Stay here" first; card/ending shots ({"shot"} step).

## Run 2 log
- New session "full" (fresh browser profile: no saves, so New Game asked no confirm; the title file was fixed for
  that and continued from its step 5 in the same page, no reload).
- Prologue: t=5:3x, L2-3. Chapter 1 card: design/screenshots/fullrun2-ch1-card.png (the card itself).
- River Bank: LOSS (not a boss): a respawned Wild Wood wanderer caught the party just after the solution's last
  fight:maybe window on the walk to Badger's door; the battle sat unplayed and was lost (L6, no gear yet, Bramble +
  Burdock + Ratty). Back at Mole End's door with the hedgehogs, continued in place (no reload). Fixed in the file:
  goto (which fights whatever catches the party) to Badger's door. Solution problem, not a game problem.
- Otter: Waistcoat II x2, Digging Claw II, Sling II (380 of 435); after Toad Hall Quill II, Oilskin II, Courage
  Ribbon II, Motor-goggles II (380 of 518).
- Chief Weasel won first try (L7-8; curve real 8.0). Queen (croquet) won, L~10 (curve 10.3). Choir won, L10-11 (11.3).
- Ninefold: dandelion fetched from the surface (027), RTS1 + Great Burrow won. Chapter 1 done ~t=36:30, L11.
- Chapter 2 card: design/screenshots/fullrun2-ch2-card.png (caught). RTS2 won (L11). Saved slot 1 (Chapter 1 end).
- Mallow (tier 2): Digging Claw III, Waistcoat III x3, Clover Charm II, 3 dandelions (965 of 1059).
- Aster won first try (L12-13, curve 12.1; rested at the Heart's stone first). Moth Queen won first try (L15, curve
  15.6; Moon Toad: Lantern III + Star Amulet III for Mole). Moon Toad again: Pestle III, Moon-silk III, Walking Stick
  III for the Drowned Halls pair (Jade, Badger).
- BOSS LOSS: Tansy (Hum-taken), L16 (curve real 17.0, boss L17), Bramble + Jade Rabbit + Badger; gear Bramble
  claw+3/waistcoat+3/goggles+2, Jade quill+2/moon-silk+3/ribbon+2, Badger stick+3/waistcoat+2/clover+2. headless at
  full Heart 30/30: the party walks in after three hall fights with no rest anywhere before her (same loss in run 1).
  FIXED (data) ch2/maps.js:434 + the drowned triggers line: a mossy rest stone (c2.rest) at (5,3) in Tansy's hall.
  Plan: rest there first. Reload 1 of run 2: back to the last chapter save (slot 1, end of Chapter 1) as asked.
- Chapter 2 replayed from slot 1 after the fix: Aster, Moth Queen, Tansy (rested at the new stone), Tidewarden all
  won first try. Chapter 2 done t=54:33, L17 (Tansy at L16-17 vs curve 17.0; Tidewarden L17 vs 17.4). Saved slot 3.
- Mallow (tier 3): Waistcoat IV (Badger), Quill III (Jade) (510 of 557). RTS3 won; Chapter 3 card caught
  (design/screenshots/fullrun2-ch3-card.png).
- Barley won first try (L18, curve 18.4; rested at the warren stone). Oz part A fine (Tin Woodman, Scarecrow, Lion,
  Mouse Queen). Emerald Market: Little Axe IV + Emerald Cloak III for the Tin Woodman (510 of 667).
- BOSS LOSS: the Wicked Witch, L19 (curve real 20.1, boss L21), Bramble + Jade + Tin Woodman; gear Bramble
  claw+3/waistcoat+4/goggles+2, Jade quill+2/waistcoat+2 (auto-equip moved her moon gear to reserves), Tin little-axe+4/
  emerald-cloak+3. headless at full Heart 30/30: the plan fights three Winkie wanderers back to back and walks straight
  into the castle; there is no rest stone in the Winkie Country or the castle.
  FIXED (data) ch3/maps-oz.js:390 + :397: a rest stone (c3.rest) at (2,17) by the castle door. The plan now rests
  there; also rests at the stair's stone (13,23) before the Watcher (it was already there, unused).
  Reload 2 of run 2: Load slot 1 (saved in 045 after Barley, the latest own save before the loss).
- Replay from slot 1: Oz A, Emerald Market (same buys), Witch won (rested at the new castle stone), L20.
- As-run detours (design/solutions/fullrun/asrun/, not main path): 048b: Glinda's "use the shoes now?" was answered
  Yes (the prompt sits in the talkthrough BEFORE the one with choose:[1]; 048 fixed), so back to Oz through the whirl
  for the China Country; 051y: 051z's goto to the Underway stone crossed the dust whirl (trigger 9..11 x 8..10 in the
  middle of c3-underway) and blew Bramble back to Oz: walked to Glinda again for the shoes. The rest is now in 051.
- Watcher won first try (L20-21, curve 21.5; rested at the stair stone). Chapter 3 done t=1:16:27, L21, 1373 buttons.
- Mallow tier 4: Digging Claw V, Waistcoat V (Tansy), Quill IV (Jade) (1245 of 1373). Chapter 4 card caught
  (design/screenshots/fullrun2-ch4-card.png). RTS4 won (L21).
- Captain Quarry won first try (L22, curve 23.1; rested at the lip stone). As run: asrun/057b (Quarry joins the
  travelling pair when recruited, so 057's toggle took him out; fixed in 057). The hole, the sea, the storm: L24.
- Herd (Rumble) fine. Root: LOSS (not a boss): reset to the Root's top during the star-things leg (step 11-13); the
  party was Bramble L24 + Rumble (no gear) + Jade. headless 30/30 and a watched rematch (by clicking the wanderer)
  won in 3 rounds: most likely a plan `walk` click landed on the battle screen as the wanderer engaged (Retreat).
  Continued in place (no reload): wanderer re-engaged, plan from step 14.
- Root: shop at Elevenfold (Mastodon-hide VI, Flint Pick VI, Lantern VI, Pearl Pendant VI: 2520 of ~2650);
  wanderers made fightIf; a wanderer caught the party mid-walk once (fought, won). Hollow Rabbits won first try (L25-26,
  curve 25.7). Finale card caught (design/screenshots/fullrun2-ch5-card.png). Saved slot 3 (Chapter 4 done).
- Finale: Ninefold + Jade; RTS5, both Nightmares, the Eye won first try (L26, curve 26.1-26.9). Saved slot 1 (sunset).
  Ending picture: design/screenshots/fullrun2-ending.png. g_won TRUE, play time 1:51:23 (6683 s), Bramble L27.
  Console: 0 errors. Session "full" closed.

## Run 2 result
- Reached g_won. Two BOSS LOSSES on the way (Tansy L16, the Wicked Witch L19), each fixed in data (a rest stone
  before the boss) and replayed from the last own save (2 reloads, no tool crashes). In the final timeline every boss
  was won first try. Two non-boss losses (River Bank wanderer, a Root wanderer) were solution timing problems,
  continued in place.
- Play time (final timeline): Prologue 3:03 | Ch1 33:00 | Ch2 18:32 | Ch3 21:54 | Ch4 25:02 | Finale 9:54 | 1:51:23.
- Level at each boss vs tools/curve.mjs real (boss level): Chief Weasel 7-8 vs 8.0 (8); Queen ~10 vs 10.3 (11);
  Choir 10-11 vs 11.3 (12); Aster 12-13 vs 12.1 (13); Moth Queen 15 vs 15.6 (16); Tansy 16-17 vs 17.0 (17);
  Tidewarden 17 vs 17.4 (18); Barley 18 vs 18.4 (19); Witch 19-20 vs 20.1 (21); Watcher 20-21 vs 21.5 (22);
  Quarry 22 vs 23.1 (23); storm 23-24 vs 24.3; Hollow 25-26 vs 25.7 (26); Nightmares + Eye 26 vs 26.1-26.9 (27).
  The run sits 0.5-1 level under the real curve from Chapter 3 on (Witch, Watcher, Quarry 1-2 under boss level).

# Run 3 (final proof)
## Step 1: segment replays (session full, reload before each, tools/play.sh)
All 30 ok after one fix: c0-surface, c0-warren, c0-attack, c1-depths, c1-riverbank, c1-toadhall, c1-rts1,
c1-greatburrow, c1w-wonder-a, c1w-wonder-b, c2-rts2, c2-aster, c2-moon-a, c2-moon-b, c2-drowned, c3-rts3, c3-barley,
c3-oz-a, c3-oz-b, c3-china, c3-stair, c4-rts4, c4-quarry, c4-hole, c4-herd, c4-root, c5-rts5, c5-dream, c5-ending ok
first time; c1w-shallows failed at step 12 (walk [18,9] from (3,21) after Ninefold: off screen with the centred
camera, and (18,12)-(18,16) are hidden behind the raised floor at x=20). Fixed (legit change): walks (11,21),
(18,20), (18,17), (18,11) before (18,9). Replay ok. No game bugs found.
## Step 2: Run 3
Main-path files regenerated from the current solutions + the run-2 edits (scratchpad apply_run3.py; run 2's set is
archived in design/solutions/fullrun/run2/). Glinda's prompts now put "Not yet" first (048 [0], 051 [1]).
- Prologue fine (t~3:00). Chapter 1 card: design/screenshots/fullrun3-ch1-card.png. Depths, River Bank (no losses:
  G.s.losses only has the Prologue's scripted c0-guided), Otter (Waistcoat II x2, Digging Claw II, Sling II),
  Toad Hall: Chief Weasel won first try (L7-8).
- Otter after Toad Hall: Quill II, Oilskin II by click; the shop now shows 9 rows, so Courage Ribbon II and
  Motor-goggles II were off the list: my keyboard fallback bought a second Sling II and a Waistcoat I by mistake
  (the selection was not where I assumed). Minor (125 buttons).
- Wonderland (Queen won), Shallows (Choir won), Ninefold's dandelion, RTS1, Great Burrow: Chapter 1 done t~33:30, L11,
  no losses. Chapter 2 card: design/screenshots/fullrun3-ch2-card.png (caught). RTS2 won. Saved slot 1.
- Mallow t2 (Digging Claw III, Waistcoat III x3, Clover Charm II, 3 dandelions), Aster (rested) won, Moon Toad
  (Lantern III, Star Amulet III), Moth Queen won L15, Moon Toad (Pestle III, Moon-silk III, Walking Stick III),
  Tansy (rested at the hall stone) and the Tidewarden won: Chapter 2 done t=51:54, L17, 678 buttons, no losses. Slot 3.
- Mallow t3 (Waistcoat IV, Quill III), RTS3 won, Chapter 3 card design/screenshots/fullrun3-ch3-card.png, Barley
  (rested) won L18, Oz A, Emerald Market (Little Axe IV, Tin Vest IV; the 9-row shop hides the T3 rows), Witch (rested
  at the castle stone) won L19-20, China (Glinda "Not yet"), shoes home, Watcher (rested) won L20-21:
  Chapter 3 done t=1:10:51, L21, 1374 buttons, no losses. Saved slot 3 next (053).
- As run: 048's walk (15,20) after the market detour was off screen: now a goto.
- Mallow t4 (Digging Claw V, Waistcoat V, Quill IV), Chapter 4 card design/screenshots/fullrun3-ch4-card.png, RTS4,
  Quarry (rested) won L21-22, hole + storm, herd (Rumble), Root (Elevenfold: Mastodon-hide VI, Flint Pick VI, Lantern
  VI, Pearl Pendant VI), Hollow Rabbits won: Chapter 4 done t=1:30:05, L26, no losses. Finale card
  design/screenshots/fullrun3-ch5-card.png (caught).
- BOSS LOSS: the Nightmare of Deepdelve, first try, L26 (curve real 26.1, boss L27), Bramble + Jade + Ninefold (gear
  Bramble flint-pick+6/mastodon-hide+6/clover+2, Jade lantern+6/waistcoat+3/ribbon+2, Ninefold quill+4/waistcoat+2),
  full Heart. The run was put back at the dream's start (upYouGet), c5_p1 unset. The fight was not logged; headless
  30/30, and a watched rematch right after (same party, by walking back) won in ~10 rounds with everyone above 1/3
  Heart. No game problem found. Continued in place (Run 3 rules: no reloads).
- Nightmare of Flintcomb and the Eye won; ending picture design/screenshots/fullrun3-ending.png. g_won TRUE.
- Console: 1 error, a 404 for assets/audio/sfx/rally.mp3 (requested during the run; no such file). Session closed.

## Run 3 result
One page session, New Game -> g_won, real input, no reloads, the game's own save at every chapter boundary.
Play time 1:43:04 (6184 s): Prologue 2:50 | Ch1 29:26 | Ch2 19:38 | Ch3 18:57 | Ch4 19:14 | Finale 12:59. Bramble L27.
One boss loss (Nightmare of Deepdelve, won on the retry in place); no other losses seen (no position resets).
Levels at bosses vs curve.mjs real: Chief Weasel 7-8/8.0, Queen ~10/10.3, Choir 10-11/11.3, Aster 12-13/12.1,
Moth Queen 14-15/15.6, Tansy 16-17/17.0, Tidewarden 17/17.4, Barley 18/18.4, Witch 19-20/20.1, Watcher 20-21/21.5,
Quarry 21-22/23.1, storm ~23/24.3, Hollow 25-26/25.7, Nightmares + Eye 26/26.1-26.9.
