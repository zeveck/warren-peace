# ch1w progress (Wonderland + the Shallows)

## Round 3 helper start (2026-11-11)
Files found:
- maps-wonder.js: 8 maps (c1w-hall, c1w-pool, c1w-lane, c1w-rabbit-house, c1w-wood, c1w-duchess, c1w-tea, c1w-garden) with props/npcs/enemies/doors/triggers referencing ~70 script ids that DON'T exist yet.
- maps-shallows.js: c1w-shallows (entries top/deep), c1w-deep (Ninefold, Choir mouths, mural, rest stone).
- encounters.js: 14 encounters incl. c1w.croquet (Queen boss) and c1w.choir.
- util.js: map painting helpers, label/glow drawing, chest(), setTile(), spotNear() for mapAdds.
- index.js: stub exporting only encounters. So nothing playable yet.
Missing: all scripts, index wiring, shop (c1w.dodo-shop), speakers, segments + solutions, banter, bestiary, memories, quests, places, mapAdds, home.<id>.ch1 lines (ch1 may own those: check).

Plan: 1) scripts for the main path + index wiring (maps load), 2) segment c1w-wonder-a (hall..White Rabbit) + solution,
3) c1w-wonder-b (wood..croquet), 4) c1w-shallows (Ninefold, Choir), 5) banter/bestiary/quests/places/mapAdds/memories.

## Stretch 1 done
- index.js now exports maps, scripts (scripts.js), encounters, shop c1w.caucus-store, memories (mem-dandelion, mem-teaparty, mem-roses), bestiary, quests, places, mapAdds (visitors in c0-warren/c0-downs, Ninefold's dandelion patch on c0-downs), segments (segments.js). banter.js is a stub.
- Segment c1w-wonder-a replays {"ok": true} (design/solutions/c1w-wonder-a.json). Note: put {"wait":1500} before a "fight" that starts mid-walk (play.js fight() races the battle intro).
- Next: c1w-wonder-b (wood, Duchess, tea, garden, croquet, trial), then c1w-shallows, then banter.

## Stretch 2-3 done
- c1w-wonder-b and c1w-shallows solutions written and replayed ok individually. Fights: wait with
  {"until": "s.screen === 'battle' && window.__game.buttons().some(x => x.label === 'Skill')"} before {"fight"} (play.js fight() fails if buttons aren't drawn yet).
- Encounters toughened (3-4 enemies; normal fights now 3-5 rounds in battle-check). Queen HP x0.38 (12-13 rounds, 80-100% wins at 9-10), Choir 11-13 rounds.
- banter.js written: talk.hall/shore/rabbit-house/wood/tea/garden/shallows, enter.<10 maps>, 6 pairs.
- home.<id>.ch1 lines are owned by ch1 (one script id each), so ch1w adds no home.* scripts; instead mapAdds put Cat/Caterpillar/Ninefold in c0-warren and the White Rabbit on c0-downs.
- Left: full re-replay after edits, screenshots of all maps (look at them), console check.
- Full replay round: wonder-a ok; wonder-b and shallows each once failed INSIDE a boss fight with play.js "no button X among" (empty buttons() while battleState().menu is set: menu appears a frame before its buttons are drawn; worse under CPU load). Re-running passes (shallows re-run ok). Tools race, not data.

## Status at hand-off (round 3)
- All three segments written and replayed ok: c1w-wonder-a (full run ok, twice), c1w-shallows (full run ok), c1w-wonder-b (ok in a full run earlier; later full runs under load stop inside some fight with play.js "no button X among " and pass when continued from there with --no-jump).
  Cause (measured with a page-side monitor): battleState().menu is set one frame before the battle draws its buttons (menu appears "cmd/0 buttons" for ~1 frame), and fight() reads B() then clicks btn() immediately. Under CPU load the window grows. Fix belongs in tools/play.js (retry btn() a few frames) or battle/rpg.js; not edited (not ours).
- Screenshots: design/screenshots/ch1w-{hall,pool,lane,rabbit-house,wood,duchess,tea,garden,shallows,deep}.png, looked at.
- No console errors.
- Not done / ideas: tools/reach.mjs not run for ch1w maps; Choir deals almost no damage (its attack is Afraid; with Ninefold in the party nobody can be Afraid) so it ends at ~100% Heart.
- tools/reach.mjs: no ch1w ERR; fixed two blocked enemy loop points (pool-pots, garden-pots, off the solution routes). Remaining warns: prop-doors on blocked tiles (intended: entered by hopping into them); c0-warren visitors show (-1,-1) headless only because spotNear needs G.data (fine in game).
