# Army battle UI: polish reviewer's findings

All in `game/src/rts/rts.js` (no sim or data changes; `sim.js` untouched, so no rts-check needed).

## 1. "The battle begins with your first order." had no backing
- It's now a panel in the tips column (below), gold on dark, shown until the first order. "PAUSED (orders still work)" moved there too (it used to float over the field); it's skipped when the alert already says "(paused)".

## 2. Tips, alerts and the minimap covered the fighting
- HUD layout: top bar, squad list (left), minimap (top right) with a **tips column** under it (`SIDE`, x = W-137, 134 wide, from y 102), bottom bar. The clock notice / PAUSED, the red raid alert and the tutorial tip stack in that column (`layoutSide`/`drawSide`); nothing floats over the middle of the field any more. A click on the alert looks at the threatened node; a click on the tip (or Space/Enter) still closes a waiting tip (`promptBox`).
- `CLEAR` = the field between the panels (x 134..W-142, y 28..H-48). Camera clamp (`clampCam`) is from the nodes' screen extent: every node, with its squads fanned round it (112 px each side, 70 above, 62 below, so clear of the hint line too), can be scrolled into CLEAR, and no further (it used to allow screens of empty sky past the bottom/right and too little past the squad list). Checked by pushing the camera to all four corners in RTS1, RTS3, RTS4: the extreme nodes sit inside CLEAR.
- `centerOn` (start, C, V, minimap and alert clicks) centres on CLEAR, not the whole screen. The start camera keeps home's fan clear of the list, the column and the bottom bar.
- `dodgeSide`: when a new tip or alert appears, the view nudges once so your squads, and enemies near the column's edge, aren't under the minimap/column, without pushing your squads or owned nodes under the squad list.
- Off-screen/threat arrows clamp to CLEAR (were drawn under the old tip/minimap). Node letters (text draws above pixels) are skipped under the column panels and the result banner.

## 3. Live controls on the result screen
- Once the battle has a result: no Play/Pause/1x, PAUSED, hint line, Reinforce/ability buttons, tips, alerts or arrows; squad-list clicks are ignored. The banner is centred on the field: green "Victory!", red-brown "The army falls back." with the "They took home (A)..." line wrapped under it.

## 4. Preview counts, Bramble's squad, the tick
- One line: "Picked 8 of 8 allowed (9 available)" (the "Squads ready: x of y" line on the right is gone).
- `defaultArmy`: Bramble's squad (`thimblebank-rabbits`) always goes. If the battle's story squads fill the cap, it takes the last slot (RTS4: drops Tansy's Scouts, slot 10), so the others keep their numbers (the replays select by number). The preview list shows the default pick first, in squad-number order, then the rest; "suggested" marks the default pick.
- Checkbox: 10x10 with a dark rim, ticked with a two-pixel-thick pixel tick (`TICK_PX`, `drawCheck`).

## Verification
- Screenshots at 1280x720, 1920x1080, 1024x640 for RTS1, RTS3, RTS4: preview, start (clock notice + tip), after the first order (tips, raid alert in RTS1), forced lose/win banners, camera at the four corners.
- Replays (reload before each), all {"ok": true}: c1-rts1, c3-rts3, c4-rts4, c5-rts5.
