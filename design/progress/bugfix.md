# Final-review bug fixes

1. Escorts saved. `ExploreScene.escorts` is now a getter/setter over `G.s.escorts` (world/explore.js top), `newGame` adds `escorts: []` (state.js), so every `s.escort`, `s.escorting`, `escortingNow` (ch1) and `ex.escorts.some` (ch4 herd trigger) reads the saved list unchanged. Old saves with no `escorts` get Rumble / Pip back from their flags (screens/title.js `oldSaveEscorts`). Wick (ch2) keeps its own `wickBack` re-escort, now a no-op.
2. No autosave mid-script. `autosave()` (engine/save.js) only marks `ex.savePending` while the explore scene has a script running (`ex.busy`); `queueScript` writes it when the last script ends. This covers every warp / s.save / rest inside a scene (scan found c1.badger.door, c1.greatburrow.fight, c3-rts3.won, c4.quarry with flag-warp-then-effect; all go through queueScript). Badger's talk (`c1.badger.talk`) also recruits him if `c1_hogs_home && !g_recruit_badger`.
3. New Game keeps the old run: `keepPreviousAutosave()` moves the autosave to `prev`, shown in Load as "Previous autosave" (Load packs 5 rows tighter). Prompt now says exactly that.
4. One pause menu: explore `openMenu` guards pause/camp against the async double-open (blur + visibilitychange); rts `openPause` likewise.
5. Bad map: `valid()` checks the map (or a fallback) exists; `startGame` tries map -> lastDoor -> start with a toast, else back to the title with a toast.
6. Service worker: no skipWaiting on install; index.html posts 'skipWaiting' to a waiting worker only while the title screen is up with no game loaded (`window.__wpOnTitle`, main.js) and reloads on that controllerchange. Otherwise the update applies on next launch.
7. Fleeing a map enemy: `shooEnemy` steps it one tile away and it holds still 5 hops.
8. Army: `openPause` and Retreat do nothing once `this.done`; `finish` runs once.

## Verified (playwright session "fix", real input)
- 1: c4-herd played to Rumble joining; the autosave holds `escorts: [rumble]`; reload + Continue: Rumble follows; rest of c4-herd from there: herd trigger fires, Rumble recruited, rock cleared.
- 2: Badger scene run to mid-kitchen: the autosave is still the pre-scene one (c1-riverbank, no c1_hogs_home); reload + Continue replays it cleanly. A save with c1_hogs_home and no Badger: talking to Badger recruits him and saves.
- 3: New Game -> autosave c0-downs, "Previous autosave" c1-badger in Load (5 rows fit), loading it restores the old run.
- 4: visibilitychange + blur together -> one pause scene; Esc closes it and unpauses.
- 5: save with map and lastDoor missing -> Continue lands at Sorrel Down with a toast.
- 8: army battle won, Esc and P during the banner -> no pause, losses unchanged.
- Replays all {"ok": true}: c0-attack, c1-riverbank, c1-toadhall, c1-rts1, c3-barley, c4-herd, c4-root. No console errors.
- Not exercised in browser: 6 (needs a deployed SW), 7 (flee cooldown).
