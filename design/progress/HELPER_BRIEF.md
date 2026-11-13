# Chapter helper brief (Warren Peace)

You are finishing ONE chapter of "Warren Peace", a large 2D isometric pixel-art rabbit adventure-RPG with
army battles (web, desktop, plain ES modules, no build step). Project root: `/workspaces/gg-test3`.
The engine, art and audio are done. Chapters are data modules in `game/src/data/<chapter>/`.

An earlier helper started your chapter and was interrupted about 15 minutes in. Its partial files are in your
chapter folder. **Continue from them: read them first, keep what is good, fix what is wrong, finish the rest.**
Do not start over.

## Read first, in this order
1. `design/BIBLE.md`, whole. It is the builder's guide: voice, the module format, maps, the script API, battles,
   army battles, how chapters connect (section 8 is a fixed interface), segments, solutions, testing, asset names.
2. `design/GAME_DESIGN.md`: "Story" (the creature, Cast, Recruits and their quests, Chapters: your chapter),
   "Structure and difficulty", the parts of "Systems" your chapter uses (one-off mechanics, size puzzles,
   cracking tiles, RPG battles incl. target levels and the button economy, shops, army battles), and "Segments"
   wherever the design lists them (grep for "Segment").
3. Every file already in your chapter folder, and `design/progress/<your chapter>.md` if it exists.
4. Engine files as needed to see how things really behave: `game/src/world/explore.js`, `world/script.js`,
   `world/actors.js`, `battle/sim.js`, `rts/sim.js`, `data/core/*.js`, `data/index.js`, `hook.js`, `tools/play.js`.
   Trust the code over the bible where they differ, and say so in your report.

## What "finished" means for your chapter
- `index.js` exports everything the bible's section 2 lists for your chapter: all maps, scripts, encounters,
  shops, army battles, speakers, bestiary lines, memories, banter (talk.<area>, enter.<map>, pairs), quests,
  places, mapAdds, the `home.<id>.chN` lines, and segments.
- The whole chapter in GAME_DESIGN is there: every place, every recruit's joining story, every boss, every
  one-off mechanic, plenty of dialog in the right voices. It is a full game with a real story; do not thin it out.
- Every interface name in bible section 8 that your chapter owns exists exactly as named.
- One segment per stretch of play (as the design's segment list says), each with `design/solutions/<id>.json`
  that `bash tools/play.sh <session> design/solutions/<id>.json` replays to `{"ok": true}` with real input,
  every battle really fought. Balance checked with `tools/battle-check.mjs` / `tools/rts-check.mjs`.
- No console errors. Each map screenshotted to `design/screenshots/<ch>-<map>.png` and LOOKED at (Read it):
  props placed sensibly, nobody in a wall, paths readable, nothing important hidden behind tall props, no map
  that is a bare rectangle.

## Working rules
- Edit only `game/src/data/<your chapter>/`, `design/solutions/<your segment ids>.json`,
  `design/screenshots/<ch>-*.png`, and `design/progress/<your chapter>.md`. Never edit the engine, `data/core/`,
  `data/index.js` or another chapter's folder: other helpers are working on them right now.
- **Keep `index.js` importable at all times** (a syntax error in your chapter stops the whole game loading for
  everyone). Check with `node --check` on each file you touch before reloading. If the game will not load because
  of another chapter's file, wait a minute and reload; do not fix their file.
- Other chapters are being written at the same time, so a map or script of theirs you rely on may not exist yet.
  Start your segments on your own maps with flags set, and guard cross-chapter calls
  (`const f = G.data.scripts[id]; if (f) await f(s)`).
- The game is served at `http://127.0.0.1:8000/` (caching off; do not start or stop servers). Use your own
  playwright session named after your chapter (`playwright-cli -s=<ch> ...`), from the project root, at 1280x720.
  Close it when you finish. Add `?debug=1` if you want `window.__game.dev` (see hook.js for how debug is enabled).
- Work in this order so that a cut-off still leaves something usable: maps and the main story path first, then
  the first segment and its solution replaying, then each following stretch with its segment, then optional
  content, banter, bestiary, home lines, quests, places.
- After each stretch, update `design/progress/<your chapter>.md` (a few lines: what is done and replays, what is
  left, anything odd). If you are cut off, the next helper reads it.
- If the engine blocks you, work around it in your own data (map hooks, scripts) if you can; otherwise write the
  exact problem (file, function, error, what you needed) in your report. Do not leave a stretch untested because
  of it without saying so.

## Your report (short)
What is in the chapter (places, recruits, bosses, segments), which solutions replay ok, engine problems with
exact details, anything from the design you could not do and why. No praise, no padding.

## Round 3 notes (2026-11-11)
The container crashed twice, both times ~15 minutes into a round of seven helpers, most likely out of memory
(7.7 GB shared by everyone). So:
- **Write `design/progress/<ch>.md` within your first 10 minutes** (what the files already hold, what is missing,
  your plan), then update it after every stretch. Most chapters had no progress file after two rounds.
- Use **one** playwright session only, and `playwright-cli -s=<ch> close` whenever you will be reading/writing
  code for more than a few minutes. Never open a second browser or start a server.
- Don't run heavy node jobs in loops (balance sims: keep run counts modest).
