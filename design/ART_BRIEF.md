# Art brief for the asset helpers (Warren Peace)

You are making art for **Warren Peace**, a cozy-epic 2D isometric pixel-art rabbit RPG (web, desktop). Read `design/GAME_DESIGN.md` sections "Story > Cast", "Art direction" and "Asset list" for who everyone is and how they look. Characters from the public-domain books follow the ORIGINAL books (Tenniel/Denslow-era descriptions, Kenneth Grahame's text), never later films: silver shoes not ruby, etc. Nothing from Watership Down.

## Rules for every helper

- **Spending is pre-approved** up to your share of the budget (given in your task). You can't ask the person anything: decide and keep going. Stop if your share runs out and report what's missing.
- **Folder:** run every generator from `/workspaces/gg-test3` (the `.env` with keys is there). Generate every take into `.gamegen/candidates/<your-area>/`. Copy only accepted takes onward.
- **Tools:** load the plugin skills (`imagegen2:imagegen2`, `nanogen:nanogen`, `anim8gen:anim8gen`, `audiogen:audiogen`) or read their SKILL.md and use their CLIs:
  - imagegen2: `the imagegen2 plugin's generate.cjs` (model default gpt-image-2.6-flare; don't pass --model)
  - nanogen: `the nanogen plugin's generate.cjs --model gemini-3.1-flash-image` (outputs JPEG: name outputs `.jpg`)
- **Style line** (paste into EVERY image prompt):
  "clean isometric pixel art, chunky pixel art with large clean pixel clusters and bold simple shapes, cozy storybook mood, soft rounded shapes, warm downland palette of chalk white, sage green, meadow gold and earth brown, with deep indigo and teal for shadow, 1-pixel dark brown outlines, soft top-left lighting, clearly drawn eyes, no text, no letters, no numbers"
  - Depths art adds: "cold palette of indigo, slate and pale teal, faint glow, eerie but gentle, no gore."
  - Props add: "2:1 isometric, the same angle and ground as the reference image."
  - Battle backdrops add: "soft, low-contrast, muted, simple shapes, empty foreground, no characters."
  - Anything that might grow writing: "blank tag", "blank card face", "plain bottle with a blank label", "abstract swirl, not letters".
- **References:** the style anchor `game/assets/style-anchor.png` (Bramble) is the FIRST `--image` for every character, portrait, prop and key-art prompt. The mock screen `design/mock-screen.jpg` is the second reference for props and backdrops.
- **Sheets:** characters, props and enemies: 4 figures per 1536x1024 image, "four separate figures in a row, evenly spaced, not touching, each full body, isolated on a transparent background, no ground, no shadows". Portraits: 4 per 1024x1024 image in a 2x2 grid, "head-and-shoulders portraits, each on its own soft plain round vignette... separate, not touching" (portraits may use a plain soft background inside each cell, transparent between). Icons: 9 per 1024x1024 in a 3x3 grid, separate, transparent. Use `--background transparent` for everything except backdrops and key art.
- Characters face **down-right, three-quarter view** unless told otherwise (back views face up-right, seen from behind).
- **Look at every image** (Read it). Check: right characters in the right order, on model with the anchor's style, clean transparency, no text/letters/watermarks, nothing touching. Then check at game size: `python3 tools/preview.py <out.png> <size> <figure.png ...>` and Read the preview (eyes must still read at 32 px). A bad take gets a better prompt, at most twice more; then simplify or report it.
- **Cutting:** save the accepted sheet to `art-src/sheets/<sheet-id>.png`, then cut it: `python3 tools/cut_sheet.py art-src/sheets/<sheet-id>.png name1 name2 name3 name4` (row by row, left to right; `-` skips a slot; `--min N` to ignore small specks). Figures land in `art-src/figures/<name>.png`. If the count mismatches, look at the blobs it prints: regenerate, or use `--min`.
- **Names** (lowercase kebab-case): map/battle figure `<who>` (e.g. `mole`, `cheshire-cat`, `card-soldier`), action pose `<who>-act`, back view `<who>-back`, portrait `por-<who>` (Bramble's three: `por-bramble`, `por-bramble-worried`, `por-bramble-happy`), props `prop-<what>`, icons `ico-<what>`, backdrops `bg-<what>` (saved in `art-src/bg/`).
- **Return** (as your final message): a table, one row per asset: ID, final file(s), tool, tries, estimated cost, one-line verdict; plus your total spend and anything missing or weak. Prices: imagegen2 2.6 low $0.04 (1024) / $0.06 (1536x1024); medium $0.10 / $0.15; high $0.25 / $0.35; edits same as generation; anim8gen frames ~$0.05 each (count tries in `.anim8gen/runs/*/candidates.jsonl`); nanogen $0.034.
- Don't edit the design files, `game/` code, or other helpers' files.
