# Art fix: mislabelled cuts (cut_sheet row-grouping bug)

Status log (append as we go).

- Started. Flagged sheets: cast/por-14-1, cast/world-b-1, cast/world-e-1, party/por-sheet-3-1, world/ico-gear-2-1, world/ico-ui-3-1, world/prop-downs-a-1, prop-oz-a-1, prop-oz-b-1/-2, prop-oz-d-1, prop-willows-a-1, prop-wonder-a-1.
- Already done by user: munchkin-fence<->winkie-pillar swap in game assets + maps-oz.js; stray post erased from prop-oz-tree.png.
- Located each art-src figure in its sheet by pixel matching (scratchpad locate.py). Character sheets were cut by hand/other means (merged blobs split): por-14-1 (weasel/knave/moth-queen/witch), world-b-1 (hatter/march-hare/dormouse/bill-lizard), world-e-1 (change/wu-gang/moon-toad/traveller), por-sheet-3-1 (toad/cheshire/caterpillar/ninefold): all figures sit at the right place per prompt and look right. NOT affected.
- Takes actually used (art-src/sheets/<id>.png identical to candidate): downs-a = prop-downs-a-2 (the -1 has an opaque grey bg -> 21 blobs, never used), oz-b = prop-oz-b-2, others -1.
- Visual check of game assets vs sheets:
  - OK: oz-b (winkie-tower, china-house, scarecrow-pole, tree-bridge), willows-a (willow, boat, toad-hall, snow-tree), downs-a (gorse, hawthorn, lookout-stone, hollow-log), ico-gear-2 (all 9 coats), ico-ui-3 (nibble, quest, talk, reinforce, rally, moonlight, monkey-drop, tunnel; acorn unused).
  - WRONG: oz-a: prop-brick-bits=poppies, prop-poppies=gate, prop-emerald-gate=bricks.
  - WRONG: wonder-a: prop-glass-table=mushroom (+ table fragment), prop-wonder-mushroom=tea table, prop-tea-table=glass table.
  - oz-d sources: prop-munchkin-fence.png figure = pillar, prop-winkie-pillar.png figure = fence (+ tree fragment), prop-oz-tree figure includes a fence post (bbox crop overlap). Game files were hand-swapped by user.
- tools/cut_sheet.py: added per-blob masking (pixels of a neighbouring blob inside this blob's box are cleared) so overlapping boxes (oz-d tree/fence, wonder-a table/mushroom) cut clean. Original backed up in scratchpad.
- RE-CUT + pixelized (done, verified visually, manifest dims checked against all files: 0 mismatches):
  prop-oz-a (munchkin-house, brick-bits, poppies, emerald-gate), prop-oz-d (oz-tree clean w/o post, munchkin-fence, winkie-pillar, ditch-rock), prop-wonder-a (tiny-door, glass-table, wonder-mushroom, tea-table).
  New dims: brick-bits 32x24, emerald-gate 73x99, glass-table 32x39, munchkin-fence 32x34, oz-tree 51x70, poppies 32x27, tea-table 64x51, winkie-pillar 36x120, wonder-mushroom 73x98.
- Next: list game/src workarounds.
- Locate run confirmed old figure mapping (ico-ui-3 acorn = ico-save, in right place; willows-a toad-hall/snow-tree were hand-split from one merged blob, correct).
- Workarounds that can now be undone (for user to apply; game/src not edited):
  - ch3/maps-oz.js:19 trees() -> 'prop-oz-tree' (was prop-hawthorn because of the stray post); also direct prop-hawthorn in Oz maps at :310, :359, :414.
  - ch3/maps-oz.js:278-279 poppy field: prop-rose-bush x12 -> 'prop-poppies'.
  - ch1w/maps-wonder.js:2-4,9 GLASS_TABLE/TEA_TABLE/STUB aliases -> real names; :32 glass table is now 1x1 (drop w:2,h:2); STUB (small mushroom, :32, :84, :194) has no true art now -> prop-lantern-mushroom or prop-wonder-mushroom 2x2.
  - Now correct with no change: ch3 :181 brick-bits, :307 emerald-gate, :183-184 fence, :358/:386 pillar; ch1/maps-river.js:252 brick-bits; ch5/maps.js:171 prop-tea-table (was showing the glass table).
- DONE.
