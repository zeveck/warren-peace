# Army battles, set pieces and polish (final playtest fixes)

## 1. RTS1 "press its number (1 is Bramble's)"
- `data/ch1/rts.js` prompts: the first tip's text is now a function computed from the squad list (`listSquads()` index of `thimblebank-rabbits`). `rts/rts.js`: prompt `text` may be a function `(rts) => string`, resolved when the tip shows. Guided Lookout battle (`data/ch0/story.js`) does the same.

## 2. Squads stacked on home under the squad list
- `rts/rts.js` `fanOffset`/`sqPos`/`easeFan`: squads standing on a node fan out on a diamond lattice (FAN, players first then enemies; drawing and clicking only, the sim is unchanged); arrivals slide into place.
- Start camera keeps home at least 250 px right (clear of the list and the fan) and 196..H-94 down (clear of the tip panel and the bottom bar). Screenshot: design/screenshots/army-rts1-start.png.

## 3. Warnings, fewer interruptions, orders under tips
- `rts/rts.js` `watchThreats`/`raiseAlert`: a player node with raiders heading for it (a wave whose road ends there, or within 5 tiles), on it, or capturing it gets a pulsing red ring, a horn (home: horn + warren drum), a flashing banner ("Raiders are coming for home (A)! Send someone back!", "Home (A) is being taken!") and an off-screen/under-HUD arrow with its letter (home's arrow is bigger). With Settings > Army auto-pause on, the first threat to home also pauses once. Losing because home fell says so under "The army falls back." Screenshot: design/screenshots/army-rts1-alert.png.
- A waiting tip no longer swallows input: B, digits, node letters and clicks work underneath (the battle stays paused); Space/Enter or a click on the tip closes it, and giving an order closes it too. (Before: every key was dropped while a wait tip showed, so B then J did nothing.)
- Every army battle's clock now waits for the first order ("The battle begins with your first order."), `startOnOrder: false` opts out.
- RTS1 tips: 8 (4 pausing) -> 6 (2 pausing): select (+B), order + capture + hilltops, camera (timed, no pause), triangle + Space (pauses), Reinforce (timed), the raider-wave warning at 52 s (pauses, "keep a squad at home"). Solution c1-rts1 updated for the new tips; c3-rts3/c4-rts4 waited on `r.tick > 3` (the clock now waits for the first order): now `r && r.nodes`.

## 4. Guided Lookout battle
- Its 45 s timer is sim time, and the clock now starts with the first order, so reading tip 1 costs nothing; the camera and pause tips show (traced: order, camera tip, pause tip, then 18 s of battle before Yarrow's voice). Screens: design/screenshots/army-guided-1.png, army-guided-2.png.

## 8. Quest line through the raid
- `data/ch0/story.js` attack(): `s.quest(attackQuest())` right after "That's not the chalk settling."; the line reads "Raiders at the warren mouth! Stand your ground." until Burdock joins.

## 9. "Got A and B!"
- `world/script.js` give(): 2+ things join as "A, B and C".

## 10. Golden key on the glass table
- New prop `prop-glass-table-empty` (the key painted out; manifest entry). `data/ch1w/maps-wonder.js`: table props by `c1w_key`; `data/ch1w/scripts.js` swaps the live prop when Bramble takes the key.

## 11. Speakers not in the party
- `data/ch0/story.js`: Burdock's lines (RTS loss, wreck, Lookout, sealed door, edge roads) now check `s.party().includes('burdock')` (travelling), not `s.member`. `data/ch4/flintcomb.js`: Tin Woodman / Pip lines at the Chapter 4 card likewise.

## 12. Enemy labels on the Nightmare
- `battle/rpg.js` posOf: beside a lone big boss (image > 100 px wide, at [500, 270]) the other enemies stand in front of it at BESIDE_BIG ([380,236], [318,298], [392,178]) instead of the FOE_POS slots that sat on the boss, so their sprites and names are clear. Screenshot: design/screenshots/army-dream-labels.png.

## 13. Pip twice in the ending
- `data/ch5/maps.js` c5-sunset: `merge: true`, so the travelling friends join the feast (every party member has a place in SUNSET_PEOPLE) instead of following Bramble. Hiding the feast NPCs instead would have hidden Tansy, whose NPC at the Lookout Stone starts the finale (the ending segment travels with Tansy and Pip).

## 14. The 5 that reads as S
- Checked Pixelify Sans at 16-22 px (game sizes 8-11 at 2x), weights 400-700: the 5 has a curled top and is the same shape as the S (design/screenshots/army-font-5-before.png). `main.js` flushText -> fillText5: text with a 5 is drawn in runs, each 5 replaced by a flat-topped pixel 5 (a 7-row and a 5-row drawing, whichever height best matches the font's digits) in the font's own advance; everything else is the font, unchanged. design/screenshots/army-font-5-after.png ("25 2S", sizes 8-15).

## 5. The China Country's people and cows
- `data/ch3/maps-oz.js` CHINA_FOLK: eight china folk (the princess and munchkin sprites, porcelain tint `tintCol`, `scale: 0.6` so they stand about ear-high to Bramble) beside the path and eight china cows out in the fields, none on china path tiles (they stand on the unwalkable flowerbeds). New map sprite `china-cow` (20x14, hand-pixelled white porcelain with blue spots; manifest entry). Map `update` hook `chinaCheer`: folk within 2.6 tiles turn to Bramble and cheer (heart / !) once every 6 s. Screenshot: design/screenshots/army-china-folk.png. c3-china replay ok.

## 6. The giant shepherd
- `data/ch4/herd.js`: the shepherd actor has `scale: 2` (192 px, four times Rumble's 48 px; the old sprite was 96). He has no `talk`, and `clickAt` only picks actors with a talk, so his sprite takes no clicks (the stone-heap use-trigger is how you speak to him after). The map `update` fades him to 40% while Bramble or a follower is behind him, so the sneak and the gaze cone behind him stay visible (`world/explore.js` addActor passes an actor's `alpha` to drawActor: one line). Gaze cone/sneak logic untouched; c4-herd replay ok. Screens: design/screenshots/army-shepherd-giant.png, army-shepherd.png (faded, Bramble behind him).

## 7. Sorrel Down
- `data/ch0/maps.js`: the Lookout hill is three square terraces (Chebyshev rings round (30,10): h3 / h2 / h1) with grass lips and earth step faces, instead of a Manhattan diamond whose stepped chalk rims drew as a checkerboard of pillars (the chalk-rim rule now skips the hill). More clover patches and nibble tufts; `drawGround` paints a seeded scatter of daisies, buttercups, pink clover heads and dark grass tufts on open grass (skipping tiles a higher tile in front would cover); five rabbits (DOWN_RABBITS, two kits) nibble about the down when it's peaceful, each with a line before and after the raid (`c0.downs.rabbit` in story.js). Screens: design/screenshots/army-downs-meadow.png, army-downs-hill.png.

## Verification
- Replays (reload before each), all {"ok": true}: c0-surface, c0-attack, c1-rts1 (solution rewritten for the new tips), c2-rts2, c3-rts3, c4-rts4 (both: `r.tick > 3` -> `r && r.nodes`), c5-rts5, c3-china, c4-herd, c1w-wonder-a, c5-dream, c5-ending.
- rts-check: c1-rts1 required army "Even" (sim unchanged); c0-guided "Weak" (meant to fall back).
- Extra screens: army-ending-feast.png (no followers at the feast, Pip once), army-hall-key-taken.png (empty glass table).
