# UX pass: exploration and controls (final playtest findings)

## 1. Finding Bramble (marker, outline, camera)
- `world/explore.js` `drawMarker` (~729): a small gold iso ring with a dark under-rim on the ground under Bramble (gently breathing; sized for small/normal/big).
- `drawGhost` (~707): everything drawn after Bramble in the depth-sorted pass now goes onto an over-layer (`layer()`); his outline (gold rim + dark halo + faint chalk fill, `ghostOf`) is masked by that layer, so it shows only where something covers him (Lookout Stone, columns, mushroom caps, crowds). No pixel readback per frame.
- `drawChevron` (~720): a gold chevron bobs over his head when he is small (Wonderland checkerboard) or in a crowd (4+ people within 5 tiles: the ending feast).
- `camTarget` (~404): dead zone (40x22 px) round the centre, map-edge clamp as before, then a safe box (feet 150 px from the top, 80 from the bottom, 110 from the sides) that wins over the map clamp, so at the warren entry / Pool of Tears he no longer sits at the top edge. Recentres when he is far outside the last view (warps).
- Checked: lookout-behind, field-mushroom, pool-entry, hall-small, ending screenshots.

## 2. Clicking tall usable props
- `clickAt` (~521) + `usableTileOf` (~504): clicks on the opaque pixels of a prop's drawn sprite (`p._rect`, recorded in `queueProp`; alpha test `opaqueAt`) count as clicking it if the prop has a door, chest or use-trigger on its footprint: Bramble walks up and uses it (walkable doors: walks onto them). Decorative props are unaffected (clicks fall through to the tile).
- Checked: clicking the top of the Lookout Stone walks over and starts its scene; clicking the top of the sealed door (c0-warren) walks to (19,28) and opens its dialogue.

## 3. China tiles and click-walk
- `stepFn` (~517): on maps with china tiles (`m.china`, set in load) click-walk routes never cross china except a final single hop onto the clicked tile. Clicking far across china toasts "Tread softly: one china tile at a time."
- `design/solutions/c3-china.json` now clicks each china tile in turn (one hop each).

## 4. Map tab + pawprints
- Seen tiles: `markSeen` (~207) floods 4 hops over open floor (plus bordering walls) on load and every hop; stored per map in `G.s.seen[mapId]` as a base64 bitset (saved with the game). `seenBits` exported.
- `screens/camp.js` `drawMinimap` (~286): the current map drawn isometrically, only seen tiles, fitted to the seen area (min 24-tile window), with Bramble (blinking), ways out (doors, gold) and rest stones (sage), and a legend. Places list moved to the right column. No quest-target data exists, so none is drawn.
- `data/ch2/maps.js` `drownedTracks` (~425) + `drawGround` on the Drowned Halls: Tansy's sandy pawprints from the stair, west through the halls and north up the narrow stair between the pillars to her digging spot (hidden once she is recruited).

## 5. Battle command grid
- `battle/rpg.js` (~124): Up/Down move a row, Left/Right switch column in the 2x3 grid (wraps; odd last row falls back to column 0). Checked: Right 0->1, Down 1->3, Left 3->2, Down 2->4, Right 4->5, Up 5->3.

## Replays (after all the changes above)
c0-attack, c1-depths, c3-china, c4-herd, c2-drowned, c1w-wonder-a: all `{"ok": true}`.
- c3-china: rewritten to one click per china tile (the old long click-walks were exactly the one-click solve).
- c1w-wonder-a: added `walk [12,2]` before `walk [20,8]` at the Pool of Tears: with the new camera, (20,8) seen from the tiny door lies under the quest line (HUD), so the click was eaten. A player clicks a nearer tile the same way.

## Follow-up: c2-moon-b and c4-quarry regressions
- **Clicking a prop vs. walking** (explore.js `clickAt`, plus a new `coverage`): people still win, because they are checked first. A usable prop now takes the click only if (a) the tile under the pointer is not walkable, (b) the tile is the prop's own footprint, or (c) the prop's drawn pixels hide at least 75% of that tile's diamond (sampled against the alpha mask). A floor tile the prop only overlaps at the edge walks. The Lookout Stone top-click still works.
  - c2-moon-b's (13,6) is 84% hidden by the lantern at (15,8): it lies straight behind the lantern on screen, so the cursor really is on the lantern. The solution now walks to (14,5) instead (0% hidden).
- **Camera top margin** (`camTarget`): the safe box's top limit went from 150 to 100 px (feet). At a map's top edge, the 150 setting pushed the map below him off screen; in c4-warren, (13,16) seen from (4,4) fell under the view, where the old camera had shown it. At 100 his head still clears the party faces, and the Pool of Tears entry still sits well inside the view (pool-entry screenshot).
- Replays: c2-moon-b, c4-quarry, c0-attack, c2-drowned, c1w-wonder-a all `{"ok": true}`.
