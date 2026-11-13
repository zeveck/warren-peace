# Warren Peace

## Requests

1. `/gamegen the game in rabbit-game.md --scope large --platform desktop --plan-only --out .`
   (the description is the file `rabbit-game.md` in this folder; it's the request's full text)
2. `Oh, we can budget $50`
3. `The budget is the least important part here.`
4. `/gamegen --continue have the two travelling companions follow Bramble on the map, with a back view for each companion and a code hop; they merge into Bramble in Wonderland's size puzzles, the shepherd sneak and the China Country`
   (applied to the design: followers, "tuck in" merging, 4 back-view sheets for the 14 companions, $1.20 from the reserve)
5. `continue` (2026-11-10: the build was interrupted; picked up at the chapter builds)
6. `Be sure to use Opus 5.5 or even Sonnet 5.5 where you trust them to do a highly reliable job.`
7. `/gamegen --continue` (2026-11-11: the container crashed again ~08:51 on 11-10, ~15 min into the second helper round)
8. `Do each of those three proposed changes and report when ready.` (2026-11-12; the three ideas from the report: `/gamegen --change add a New Game+ that keeps your party's levels and gives every boss a harder second phase`, `/gamegen --change let players revisit any army battle from the Lookout Stone after the ending, with a best-time score`, `/gamegen --change add a short epilogue chapter where Bramble helps rebuild Flintcomb`)
9. `When the changes are all done, go ahead with /gamegen --publish.` (2026-11-12: publish after NG+ lands and the final regression passes)
10. `/gamegen --change What I take to be the town map kept flashing between rendering other scenes during the opening. I've seen that happen with other games a bit, so (1) we should fix it and (2) figure out what to file against gamegen so games know to avoid it -- making sure the opening screens render properly without flicker is critical to initial impressions.`
11. `/gamegen --publish --no-confirm`
12. `/gamegen --change add PS5/Xbox controller support: exploring, dialog, menus, shops and battles, button prompts that switch to the controller when it's used, and a controller scheme for army battles`
13. `When done, /gamegen --feedback hidden, then /gamegen --publish --no-confirm.` (2026-11-13: after the controller change lands and its regression passes)

## Settings

- Platform: desktop
- Target: web
- Scope: large (asked for)
- Budget: $50 (raised from the $20 default during design review). The person says the budget is the least important part: quality and completeness come first; spend what clearly improves the game.
- Design review rounds: 2 (default)
- Plan only: was yes; now building (`--continue`, 2026-11-07)
- Out: `.` (this folder: `/workspaces/gg-test3`)
- 3D: no (2D isometric pixel art, as asked)
- Credit: Rich Conlan (from GAMEGEN_CREDIT)
- Publish defaults in `.env`: domain synapticnoise.com, gallery zeveck/synapticnoise, making-of on

## Available

- OpenAI key: ok (imagegen2, anim8gen)
- Gemini key: ok (nanogen)
- ElevenLabs key: ok, tier: creator (paid plan: no ElevenLabs credit line needed)
- Python + Pillow: Pillow was missing, installed 13.0.0
- playwright-cli: ok
- Plugins: up to date

## Phases

- [x] Preflight: all keys pass; Pillow installed.
- [x] 1 Brief: written (design/BRIEF.md), title Warren Peace.
- [x] 2 Design: first draft written; 15 party members, 5 worlds, 4 depth layers, 5 army battles, ~$21 est.
- [x] 3 Design review: 2 rounds, 59 findings, all dealt with; army balance verified by duel sim; budget re-planned for $50 ($44.88 + $5.12 reserve). Stopped here (plan only); run `/gamegen --continue` to build.
- [x] 4 Art, animation and audio: every planned asset made (~$31.66 of $50): anchor, mock screen, 19 tracks, 43 sfx, 7 loops, 5 voice lines, ~400 figures (party with back views, cast, enemies, bosses, props, icons, portraits), 28 backdrops/key art, 15 animations. Pipeline: tools/pixelize.py -> game/assets/ + manifest.json.
- [x] 5 Build: engine + 7 chapters (57 maps, ~460 scripts, 127 battles, 6 army battles, 30 segments with replaying solutions). Chapter helpers ran 3 at a time after two container crashes (7 parallel browsers ran it out of memory). Then: art mislabel fix (tools/cut_sheet.py), integration (all joins walked, home maps per stage), balance + boss pass (counter autopilot; bosses need their counters), real-path calibration (XP catch-up, gear per segment), engine fixes (door clicks, path cap, Guard to next turn, respawn on revisit, camp scroll, ligatures, recolor cache, actor scale). Details: design/progress/*.md (HELPER_BRIEF, ch0..ch5, art-fix, integration, balance, bosses, calibration, fullrun, playtest).
- [x] 6 Play-test: every screen at 1280x720 (+1920x1080, 1024x640) opened, read and left; ~30 fixes (design/progress/playtest.md); two full New Game -> win runs (design/progress/fullrun.md). Left: offline needs the published build's file list in sw.js; first load ~11 s on slow 4G; army preview 'needed' now 'suggested' up to the cap (RTS1 listed 9 for cap 8, RTS3 14 for cap 10).
- [x] 7 Final review: bug hunter (8 findings, all fixed: escorts saved, no mid-script autosave, New Game keeps a Previous autosave, single pause, bad-save fallback, safe SW updates, flee, no Retreat after a result) and playtester (no must-fix; Bramble marker/outline/camera, prop clicks, fights short and sharp with named wind-ups, China hops, Map tab, army tutorial/alerts, set pieces, 11 new music tracks). Notes: design/progress/{bugfix,ux,fights,army-polish,music}.md.
- [x] 8 Polish pass: fresh polish reviewer, 18 findings, all fixed (loops crossfaded and re-picked; backdrops preloaded; army HUD column, result screen, preview counts; labels; victory/defeat cards; recruit card; credits; quests wrap + Title Case; hover vs selected; overlays; title hint; sunset sky + fireflies; chapter-card backdrops; shop icons + wheel/arrow scrolling; centred camera; press-point clicks). Then all 30 segments replay ok and Run 3: New Game -> g_won in one page session, no reloads, 1:43 play, one boss lost once (Nightmare of Deepdelve, rematch won). Notes: design/progress/{loops,armyui,battleui,menus,fullrun}.md.
- [x] Change 5 (controller support): DONE 2026-11-13. Designed + reviewed (1 must-fix: never let a blocked getGamepads freeze the loop; keyboard truly unchanged; army: double-tap Square = all, R2+R1 speed, R2 layer off while targeting). Built: engine/pad.js, engine/prompts.js, army node cursor, pad tips, Controller settings page, rumble. 11 pad replays (design/solutions/pad/) + 49/49 keyboard/mouse regression ok. Real pads on Chrome/Firefox/Safari untested here. Next: /gamegen --feedback hidden, then --publish --no-confirm (request 13). (design/changes/controller.md, design/progress/controller.md).
- [x] Change 4 (opening flicker): fixed in the engine (core.js cover hold + main.js draw; picture/chapter/defeat/title marked cover; title held while New Game loads the map). Frame log before: title, 4 map frames, picture, 1 map frame, picture, 1 map frame, picture; after: no map frames between covers. Filed zeveck/gamegen#23. 12 picture/card segment replays ok; README updated; published 2026-11-13 (request 11). Follow-up: dialog boxes blinked for 1 frame between consecutive lines; dialogs now linger up to 3 frames (core.js LINGER_FRAMES, main.js draw); 16 dialog-heavy replays ok; added to gamegen#23.
- [x] Change 1 (NG+), Change 2 (army revisits + best times), Change 3 (Flintcomb epilogue): DONE. Designs done (design/changes/*.md), reviewed (design/changes/REVIEW.md: 3 must-fix in NG+, file ownership table), now building in parallel: revisits.md, epilogue.md, ngplus.md (design/progress/). REVISITS DONE: Lookout Stone menu after g_won (rts/revisits.js), battle-time scores per save (rts/best.js), medals from tools/rts-par.mjs (gold = 0.9 x Burdock's rush, never faster than a 600-plan search), no story scripts or losses in revisits; pg-revisits (+ reload) and 7 base army/ending replays ok. EPILOGUE DONE ("Digging the Other Way", data/ch6 + c6-upburrow map; Shale invites from the sunset feast and the downs; heaps -> sown patches, 5 alcoves, Gault and Chip, Top Stone, feast, picture bg-epilogue, mem-flintcomb, Knapper's Flint; art $0.41): c6-bowl/burrows/stone (+ -b branches) ok, real-save test ok, 6 base ch4/ch5 replays ok. NG+ DONE (data/ng/bosses.js 15 phase-2s, battle/ngplus.js scaling party-4/boss+1, won save copied to a slot first, G.pendingNgPlus after scripts, Eye eighths + stand-ins, Long Thump locked till ch4): balance --ng all pass; base balance/curve byte-identical; 12 NG boss segments + ng-start + title route ok; 30 base ok. Epilogue hint now fires once ever (c6_hinted). README updated. FINAL REGRESSION: 49 of 49 solutions replay ok (2026-11-12). PUBLISHED 2026-11-13: repo zeveck/warren-peace (public; game, README, media, design, rabbit-game.md; art-src/tools/root assets kept out), GoDaddy CNAME added, Pages at warrenpeace.synapticnoise.com, deploy ok, live game checked (title links, New Game, Settings, 1280 + 1024, no console errors), added to the top of zeveck/synapticnoise (index + sitemap), live there. HTTPS: cert stalled until the user nudged it in GitHub; now issued and required (https 200, http redirects). Budget per change: $20 default.
- [x] 9 Wrap up: social card (game/social-card.jpg), README.md with media/screenshots/, Pages workflow (.github/workflows/pages.yml, publishes game/), game served at http://127.0.0.1:8000 (no-cache server). Spend $38.56 of $50. reach.mjs: 0 errors; 42 warnings, all intentional (doors used by facing; Scarecrow/shepherd by script; China folk and cows are cheering scenery).
