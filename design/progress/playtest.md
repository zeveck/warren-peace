# Play-test pass: screens, menus, definition of done (session "pt", one at a time)

Sizes: 1280x720, 1920x1080, 1024x640. Screenshots: design/screenshots/screen-<name>-<w>.png.

## Log
- Title (press any key, menu), Settings (all 10 rows, keyboard + mouse, persist after reload), Load, Save, Pause, Quit confirm,
  intro cards (Esc skip), dialog + choices (keys + mouse): checked at 1280. Save slot 1 -> quit -> reload -> Load: map, tile,
  flags, quest, play time all back. Broken save -> title offers New Game only, no errors.
- FIXED: text measured at 8x but drawn at K (fonts hint wider at small sizes) -> quest line spilled out of its box
  (core.js ui.measure now measures at the draw scale; main.js resize sets it).
- FIXED: intro caption lone last word (core.js ui.wrap(..., balance); picture.js uses it); "Esc: skip" unreadable on bright art (dark chip).
- FIXED: Continue from the New Game autosave (made before the intro) left no intro and no quest (title.js startGame replays the start script).
- FIXED: camp "N buttons" overlapped the Close button (camp.js). HUD mute button didn't save the setting (explore.js).
- FIXED: tab hidden ducked music forever unless the pause menu opened (main.js un-ducks on return); duck() level ignored the 0.7 music trim (audio.js).
- FIXED: Save/Load had no mouse way back (Back button added); save list centred; text speed value capitalised; title menu moved
  right so it no longer covers Bramble in the key art; icon-only buttons centre their icon (mute icon touched the edge).
- Camp (all 8 tabs) at Ch4 Root with 15 members / 23 squads: party swap (Space + click), Talk entries play, Gear take off / re-equip,
  Items use (Dandelion healed), key item, Army, Quests, Map, Bestiary; Tab / I / Esc / Close button all close it. HUD camp/pause/mute buttons by mouse.
- FIXED camp.js: long lists (Party 15, Army 23) gave no hint there were more rows: "3-14 of 15 (mouse wheel or arrows for more)".
  Gear pick shows what's worn and "No spare tools in the pack" instead of a lone "(take it off)".
- RPG battle (Root + c1-depths): Tussle by mouse target, Skill, Item, Guard, Swap, Flee, win results, level-up line, lose ->
  "Up you get" back at the door, healed, buttons kept, moves fine.
- FIXED rpg.js: party/foe slots overlapped (Jade Rabbit sat on Burdock's head; two Moving Roots and their names stacked):
  PARTY_POS/FOE_POS spread sideways. Skill/Item list: 4th row ran under "Esc: back" and the Back button covered its cost
  (11 px rows + footer line, "1-4 of 5" when longer; no 24 px icons squeezed into 11 px rows). "Round n" got a dark strip
  (unreadable on bright backdrops). Target arrow sat on the enemy's name (moved above). Status panel kept the old level after a level-up.
- Shop (Mallow, c1-greatburrow jump): buy gear -> auto-equip offer (Yes), items, army gear, can't-afford toast, Leave button / Esc.
  FIXED shop.js: army tab showed 11 of 12 rows with the 11th touching the description and no hint (10 rows + "1-10 of 12").
- Army battle (RTS4 and RTS1 via the Lookout Stone): preview (pick by Space/click/wheel), HUD, B / digits / Shift+digit / Tab /
  letters / Space / F / arrows / C / V / T, click list, drag box, left-click never orders, right-click node + minimap orders,
  minimap jump, Esc pause -> Retreat; two losses -> "The warren rallies" shows. Map music comes back after retreat.
- FIXED rts.js: preview goal text ran under "Squads ready" (wrapped); list showed 10 of 21 squads with no hint, header now
  "8 of 8 picked" + "5-14 of 21" + mouse wheel; army started hidden under the squad list (camera nudged right, left clamp +130);
  node letters (text layer) were drawn over the HUD bars/list/minimap (skipped there); tip line got a dark strip; tutorial tip
  box overlapped the minimap (narrower); Esc/P did nothing while a tutorial tip waited (now opens pause); rally note ran out of
  the panel; map music stayed silent after Back/retreat (startArmy restores it unless won).
- FIXED picture.js: chapter card title had no backing on bright backdrops (soft dark band).
- Recruit card (shown with the script API for a look: Tin Woodman): fine. Ending + credits (c5-ending solution, real input): fine;
  FIXED ending.js: credit lines were hard to read on the bright sunset art (soft dark column behind them).
- Regression replays after the fixes (real input): c1-rts1 ok, c1-toadhall ok (Chief Weasel boss), c5-dream ok (five stories), c1-depths ok.
- 1920x1080 and 1024x640: title, settings, load, narration, explore HUD, camp party/army/gear, pause, army preview/HUD/pause:
  all fit and read well (1024 uses the fractional fit; text ~13 px). No console errors.
- Tab hidden (emulated visibilitychange): explore opens pause, battle keeps going safely; resize to 900x700 mid-play fine.
- FIXED explore.js: no autosave after a map battle (design: "after every battle"); now saves after the win.
- First load filmed (scripts/first-load.sh) at 1280 and 1920: FIXED index.html + main.js: the loading bar's frame showed ~1 s
  before its "Warren Peace" text (font blocked); the loading screen now appears once its font is in. Full load on the slow-4G
  setting takes ~11 s (bar sits at 40% while the chapter modules load); the title then appears once, real font and art.
- Offline (?sw=1, fresh session "off", closed): SW controls the page. Offline right after one reload, New Game failed
  (src/world/explore.js not cached: the local, unstamped sw.js caches only what was fetched; the Pages workflow fills FILES).
  After one online visit into the game, offline reload + Continue + moving works.
- scan-text (DOM): no findings. Console: no errors, no failed requests (online).
- All sessions closed.
