# Change: PS5 / Xbox controller support

## As built (2026-11-13): this section wins where the plan below differs

Built after review. Files: `engine/pad.js` (new), `engine/prompts.js` (new), `engine/input.js`, `main.js`, `hook.js`, `engine/save.js`, `rts/rts.js`, `rts/revisits.js`, `battle/rpg.js`, `world/explore.js`, `screens/{title,camp,shop,pause,picture,recruit}.js`, `data/ch0/story.js`, `data/ch1/rts.js`, `tools/play.js`. Tests in `design/solutions/pad/`.

- **The poll can't break the loop.** `pad.poll()` returns at once when `navigator.getGamepads` isn't a function. Everything else runs in try/catch, and the first error (a SecurityError from a permissions policy or iframe, say) sets `pad.off` for the session. `pad.off` shows in `state().padOff`.
- **Keyboard and mouse are unchanged.**
  - `hint()` draws the exact old string whenever the device isn't the pad.
  - `keyHints` still hides only the chips it hid before (picture, defeat and recruit cards); the text footers stay.
  - The title says "Press any key" until a pad has been used this session.
  - The one accepted pixel change is Settings: a "Controller..." row, with rows 22 px apart instead of 24. That row opens a second page: Vibration, Button icons (Auto / PlayStation / Xbox), Army camera stick (Slow / Normal / Fast), Stick deadzone (Small / Normal / Large).
- **No `act()` change and no `padCodes`.** The shop's L1/R1 send ArrowLeft/ArrowRight, since the shop already treats left/right as its tabs. KeyQ/KeyE are sent only in camp, which never calls `act()`. The pad's own just-pressed set (`pad.pressed`) is cleared by `endKeys`, `endFrame` and `eatAll` through `input.onClear`.
- **`input.padHeld`** is rebuilt on every poll and joins `held` in `isHeld()` and `heldDir()`.
- **Device switching.**
  - `input.device` becomes `'pad'` on any button edge or a stick past the deadzone.
  - While it's `'pad'`, `mouse.inside` reads false (so no hover look), army edge-scroll is off, and the canvas cursor is hidden.
  - A key press or a click switches back at once. A mouse move switches back once it is 3 logical px from where the pad took over.
- **Army battles** (`padNative`):
  - The R2 layer gives the abilities (Square Rally, Triangle Moonlight, Circle Monkey Drop, Cross Tunnel), plus **R2+R1 = speed** (toast "Speed 2x"/"Speed 1x") and **R2+L1 = jump home** (the cursor goes there too).
  - **While an ability is aiming, the R2 layer is off:** Cross fires at the cursor and Circle cancels, whatever R2 is doing. The face glyphs on the ability buttons show only while R2 is held and nothing is aiming; otherwise the first ability button shows an [R2] chip.
  - **L3** centres on the selection. **R3 is unused.** **Create/View** pauses.
  - **Select all = Square twice within 0.35 s.** The first Square selects the squads on the cursor's node. If none of yours stand there, it picks those walking on roads into that node, nearest first. L1/R1 only step through the squads; L2 is the "add" modifier for Square and L1/R1. Circle clears the selection.
  - The cursor snaps within a 65° cone (score = distance × (1 + 2·(1 − cos))). The stick repeats every 0.28 s; the d-pad repeats when held. The camera follows the cursor off-screen. The cursor has a gold ring and a label ("S · Hilltop · yours · 2 squads"), and a gold box on the minimap.
  - With the pad, the squad-list numbers hide and an L1R1 glyph sits under the list. "Reinforce 10" gets a Triangle glyph, the ability buttons lose their "(Q)" keys, Pause gets a Create glyph and Speed gets R2+R1.
  - The bottom hint line (`rts.js`, the `ui.text` lines and the band-width `ui.measure` line just after them) has a pad version with its own band.
- **Tips.** `{text, pad}` (either may be a function) are resolved when the tip appears. `layoutSide()` (via `tipText()`) is the only place that chooses between them, and `{r1}`-style tokens expand there. `rtsState().tip` is the text drawn now, and `tipWait` says whether it is waiting.
  - Pad texts are written for all six `c1-rts1` tips and all four `c0` guided ones.
  - One pad-only tip goes at the end of the queue when abilities exist: "Hold R2 and press the button shown on an ability to use it." It shows once per save (flag `pad_ability_tip`).
- **Preview.** Triangle starts the battle. Square toggles "The warren rallies" only when that button is shown (`rallyShown()`), and the footer shows the Square glyph under the same condition.
- **Sound with a pad only.** "Press any button" stays on its own line. "Click or press a key once for sound." goes on a separate line under it, and on the title menu just above the footer. It shows once a pad has been used for 1 s while the AudioContext isn't running. In exploration it is repeated once as a toast.
- **Fixes:**
  - The army battle's `onBlur` only pauses; a pad disconnect calls `onBlur`.
  - `CampScene(ex, startTab)` takes a start tab, which Create/View uses for the Map.
  - The Long Thump rumbles only when a new layer starts.
  - Rumble resets when the pause menu opens and when Vibration is turned off.
- **Quest text.** Quest text uses `{act}` ("press Space" / "press Cross" / "press A") through `padWords()`. It is expanded in the explore HUD, camp Quests and `state().quest`.
- **The HUD Nibble button.** The design promised one, but the code never had it. **GAME_DESIGN was corrected** rather than adding a button: a new button would change the keyboard HUD's pixels, and the pad and N already cover nibbling.
- **Prompt table additions:** `rts.js` hint band width (the `ui.measure` of the two hint strings), the title sound line, the explore sound toast, the shop's and camp's "for more" lines, the defeat card's chip (`picture.js`), and the Load screen's "Esc".
- **Test hooks.** `state()` adds `device`, `padKind`, `padSeen`, `padOff`, `hints` (the prompt strings and glyph lines drawn last frame, e.g. `[cross] buy [l1r1] tabs [circle] leave`) and `toast`. `rtsState()` adds `tip`, `tipWait` and `cursor`.
- **Test results (2026-11-13), simulated pad at 1280x720:**
  - All pass: `design/solutions/pad/` pad-title (`--no-jump`), pad-c0-surface, pad-shop, pad-ng-c1-toadhall (`fight: "pad"`; boss and hit rumbles), pad-c1-rts1 (start to finish, every pad tip), pad-c2-rts2 (`army: "pad"`, R2+Square Rally, the ability tip), pad-target (aiming turns R2 off), pad-menus, pad-device (switching both ways, 3 px rule, Xbox glyphs, disconnect pauses).
  - pad-blocked (getGamepads throws a SecurityError) and pad-noapi (no getGamepads) also pass: `padOff`, the game runs, keys work.
  - Full keyboard/mouse regression: 49/49 `{"ok": true}`.
  - Screenshots: `design/screenshots/controller/`.
  - One bug was found and fixed during testing: "Xbox Wireless Controller" matched the PlayStation pattern, so Xbox is now checked first.
- **New `play.js` steps:** `pad`, `padHold`, `chord`, `stick`, `rstick`, `padHop`, `padWalk` (A* path walked with the stick), `padUse`, `padTalk`, `padTalkthrough`, `padKind`, `padConnect`, `padOrder`, `fight: "pad"`, `army: "pad"`, `expect`, `js`, `pass`.

You can play the whole game on a controller: exploring, dialog, menus, shops, RPG battles and army battles. Button prompts switch to the controller as soon as it's used, and switch back on the next key press or mouse move. Keyboard and mouse don't change. Nothing here needs new art: every glyph is drawn in code in the palette.

## 1. Device layer (`engine/pad.js`, new, ~250 lines)

- **API.** It uses the Gamepad API with `mapping === 'standard'`. Buttons: 0 Cross/A, 1 Circle/B, 2 Square/X, 3 Triangle/Y, 4 L1/LB, 5 R1/RB, 6 L2/LT, 7 R2/RT, 8 Create/View, 9 Options/Menu, 10 L3, 11 R3, 12-15 d-pad up/down/left/right. Axes: 0-1 left stick, 2-3 right stick. Button 16 (PS/Guide) and 17 (DualSense touchpad) are never bound, because the OS or browser takes them.
- **Polling.** `pad.poll()` is the first line of `frame()` in `main.js`, so it runs once per animation frame before the update loop. It calls `navigator.getGamepads()` fresh every time. It never keeps the function or the pad objects: Chrome hands out snapshots, and tests replace the function. The pad it uses is whichever connected pad last changed a button or axis. Other pads are ignored.
- **Making it work with the existing input: a parallel layer that writes real key codes.** Most scenes stay unchanged.
  - A button edge goes through the top scene's **scheme** (§2) to a key code. That code is added to `input.pressed` and to a new `input.padCodes` set. `anyPressed` is set and the code is pushed to `input.order`. `endKeys()` clears it like a real key, so exactly one update sees it.
  - Held buttons and stick directions go into a new `input.padHeld` set, rebuilt on every poll. `isHeld()` and `heldDir()` read `held ∪ padHeld`, so the pad never deletes a held key the keyboard still holds.
  - **`act()`** changes to ignore `KeyE` when it is in `padCodes`. This is the one semantic change: R1 sends KeyE for tabs, and without it R1 would also accept the shop's auto-equip offer.
  - Two scene hooks cover what synthesis can't:
    - `scene.onPad(name)`: called before synthesis. Returning true eats the button. Used by the army preview's Start, Create/View in exploration, and the title.
    - `scene.padNative = true`: nothing is synthesised, and the scene reads `pad.pressed / pad.held / pad.ls / pad.rs` itself. Only the army battle does this. `pad.pressed` is cleared in `input.endKeys()`.
- **Sticks.**
  - Radial deadzone: on above 0.5, off below 0.35 (hysteresis).
  - **8-way direction:** the diagonal sectors are 60° wide and the cardinal ones 30°, with 8° of hysteresis. Iso grid steps run along the screen diagonals, so the stick favours clean steps.
  - The left stick and the d-pad merge into one direction. Analog triggers count as pressed above 0.5 and released below 0.35.
- **Repeat for menus.** A direction press goes in at once. After 0.32 s held it goes in again every 0.085 s. Only the pad repeats: keyboard `pressed` still ignores `e.repeat`. Exploration reads `heldDir()`, so the repeats are harmless there.
- **Connect and disconnect.**
  - Browsers hide pads until a button is pressed on the page, to stop fingerprinting. That first press is handled like any other, so it works as "Press any key" on the title.
  - The layer listens for `gamepadconnected` / `gamepaddisconnected` but doesn't rely on them. It also notices a new non-null slot while polling.
  - On connect it shows the toast "Controller connected" with the glyph set it picked.
  - On disconnect it shows "Controller disconnected" and clears `padHeld`. If the pad was the last device, it calls the top scene's `onBlur()`: exploration and army battles open Pause, just as they do when you switch tabs.
  - `blur` and `visibilitychange` clear `padHeld` too.
- **Audio unlock.** A pad press calls `audio.unlock()`. Chromium may not count a gamepad press as user activation. If the context is still suspended one second later, the title shows "Click or press a key once to turn the sound on" in its place.
- **Browser support.**
  - **Chromium:** DualSense and Xbox both report `standard` over USB and Bluetooth. `getGamepads` only works in a secure context; `localhost` and https are fine. Hosts that embed the game in an iframe (itch.io and the like) need `allow="gamepad"`.
  - **Firefox:** Xbox is standard on Windows. DualSense is often non-standard (`mapping: ''`), with shuffled buttons and the d-pad as a hat axis. There is a small fallback table for the DualSense id (`054c`, `0ce6` / `0df2`). Any other non-standard pad is read with the standard indices, and a one-time toast says "This controller isn't fully recognised."
  - **Safari:** DualSense and Xbox are standard through GameController.
  - **Vibration:** feature-detect it everywhere (§5).

## 2. Button map by context (PlayStation / Xbox)

The scheme is looked up by the top scene's `kind`. Anything not listed falls back to **menu**. "→ Key" means the synthesised code.

| Context (`kind`) | Left stick / d-pad | Cross/A | Circle/B | Square/X | Triangle/Y | L1/LB, R1/RB | Options/Menu | Create/View |
|---|---|---|---|---|---|---|---|---|
| **explore** | Hop (held arrows, below) | Talk / use / open → Space | (none) | Nibble → KeyN | Camp → Tab | (none) | Pause → Escape | Camp on the Map tab (`onPad`; `CampScene` takes a start tab) |
| **dialog** (incl. choices) | Pick a reply (repeat) | Advance / choose → Space | (none: never skips story) | (none) | (none) | (none) | (none) | (none) |
| **camp** | Rows (repeat) | Activate → Space | Back / close → Escape | (none) | Close → Tab | Tabs → KeyQ / KeyE | Close → Escape | (none) |
| **shop** | Rows; left/right are tabs as now | Buy → Space | Leave / decline auto-equip → Escape | (none) | (none) | Tabs → KeyQ / KeyE | Leave → Escape | (none) |
| **battle** (RPG) | 2x3 command grid, lists, targets → Arrows | Confirm → Space | Back → Escape | (none) | (none) | (none) | (none: RPG battles have no pause) | (none) |
| **title** | Menu | Choose → Space. **Any** button passes "Press any key" | (none) | (none) | (none) | (none) | (none) | (none) |
| **pause, load, confirm, revisits, defeat, chapter** (menu) | Rows (repeat) | → Space | Back → Escape | (none) | (none) | (none) | Close → Escape | (none) |
| **settings** | Up/down rows; left/right change the value | → Space | Back → Escape | (none) | (none) | Change the value ← / → | Back → Escape | (none) |
| **picture, recruit** | (none) | Continue → Space | Skip → Escape | (none) | (none) | (none) | (none) | (none) |
| **ending** | (none) | Hold to speed up the credits (held Space) | (none) | (none) | (none) | (none) | (none) | (none) |
| **rts-preview** | Squad list (repeat) | Pick / unpick → Space | Back → Escape | Toggle "The warren rallies" (`onPad`) | **Start the battle** (`onPad`) | (none) | (none) | (none) |
| **rts** | Native, see §3 | | | | | | | |

**Hopping in exploration.**
- **Screen-relative (default):** the stick's 8-way direction becomes held arrows. Straight up holds ArrowUp, the same zig-zag the Up key gives. Up-right holds ArrowUp+ArrowRight, one clean grid step. Holding keeps hopping, and the fast-hop rule applies as it does for keys.
- **Grid keys on:**
  - The **d-pad** follows the setting, exactly like the keys: Up hops up-right, and so on.
  - The **stick** always means "where I push on screen". It snaps to the four screen diagonals and sends the grid key for that diagonal: up-right sends ArrowUp, down-right ArrowRight, down-left ArrowDown, up-left ArrowLeft. The compass HUD stays as it is.
- The right stick, L1/R1 and L2/R2 do nothing in exploration (the camera follows Bramble).

**Mouse hover.** While the pad is the last device, `button()` treats `over` as false and the canvas gets `cursor: none`. A mouse sitting still can then never draw a second "selected" look. Moving the mouse more than 3 logical px brings both back.

## 3. Army battles on a controller

The goal is the same strategy game with the same "pause that accepts orders". Every action is one button, so speed doesn't come from fast hands. The model is **a node cursor plus a selection**: point at a place, pick who goes, confirm.

| Action | PlayStation / Xbox | Keyboard equivalent |
|---|---|---|
| Move the node cursor | Left stick or d-pad: jumps to the nearest node in that direction | node letters |
| Order the selected squads to the cursor node | Cross / A | the node's letter |
| Select the squads standing on the cursor node | Square / X | click / box |
| ...add them to the selection | L2 / LT held + Square / X | Shift-click |
| Next / previous squad (selects just that one) | R1 / RB, L1 / LB | Tab, digits |
| ...add the next / previous squad | L2 / LT held + R1 / RB or L1 / LB | Shift+digit |
| Select all | L1+R1 / LB+RB together (within 0.12 s, or one pressed while the other is held) | B |
| Reinforce the selected squads (10 Supply) | Triangle / Y | T |
| Abilities | R2 / RT held, then a face button: Square/X **Rally**, Triangle/Y **Moonlight**, Circle/B **Monkey Drop**, Cross/A **Tunnel** (left, top, right, bottom = Q W E R) | Q W E R |
| Fire a targeted ability | Move the cursor, then Cross / A | letter / right-click |
| Cancel targeting; otherwise clear the selection | Circle / B | Escape |
| Pause / play (orders still work while paused) | Create / View | Space |
| Speed 1x / 2x | R3 | F |
| Camera | Right stick pans (speed from Settings); L3 centres on the selected squad | arrows, C |
| Centre on home and put the cursor there | L3 pressed twice within 0.4 s | V |
| Close a waiting tutorial tip | Cross / A (eaten: it doesn't order) | Space |
| Pause menu (retreat, settings) | Options / Menu | Escape / P |

- **Why the d-pad isn't the ability pad:** the brief asks for the cursor on both the stick and the d-pad. The d-pad gives 4-way, exact cursor steps, which suits players who dislike sticks. Abilities therefore live under R2, the one "special" layer. While R2 is held, the bottom bar draws each ability's face glyph, and they fade when it's released.
- **Why pause is on Create/View:** Triangle is Reinforce (used often, needs a squad) and Cross is the order. Pausing is a mode switch that is never mixed into a chord, and on both pads it sits next to Options. The Pause/Play button in the HUD shows the glyph. The **first-battle tips teach it** (below), and "Army auto-pause" still works.
- **Cursor snapping** (`RtsScene.moveCursor(dx, dy)`):
  - Candidates are non-dark nodes other than the cursor's own node. Positions are in *screen* space (`w2s`), so "up" means up the screen.
  - A candidate must lie within 65° of the push. Score = distance × (1 + 2·(1 − cos θ)), and the lowest wins. If none qualifies, the cursor stays and `synth('cancel')` plays quietly.
  - The stick fires on reaching 0.5 and repeats every 0.28 s while held in the same 45° sector.
  - While targeting **Tunnel**, only burrow nodes you own are candidates, and the cursor jumps to the nearest one when targeting starts.
  - The cursor starts on home.
- **What the cursor looks like:**
  - A 2 px gold diamond ring round the node (code-drawn, like the order "ping"), with the node's letter drawn 1.5x.
  - A one-line label beside it: "S · Hilltop · yours · 2 squads", or "· theirs" / "· open".
  - The same ring, 6 px, on the minimap.
  - If the cursor's node is outside the clear field (`CLEAR`), the camera eases to it (`centerOn`). Pushing the cursor at an off-screen node therefore scrolls there, and the minimap letters act as the map for it.
- **Not on the pad:** right-clicking an enemy squad to chase it (`orderAttack`). Ordering to the node it's heading for does the same job, so it's left out on purpose.
- **Squad list:** the selected rows are highlighted as now. The "1..0" numbers hide while the pad is the last device, and an "L1 R1" glyph pair sits above the list.
- **Preview screen:** the list, Cross picks, Circle goes back, **Triangle starts**, Square toggles "The warren rallies" (§2). Keyboard Start stays the button (the `Enter && false` line is left as it is).
- **Revisits menu:** the plain menu scheme. The "1-5" digits have no pad equivalent, and none is needed.
- **Tutorial:** each prompt can carry a `pad` text, picked at draw time by `input.device`. `layoutSide()` rebuilds every frame, so a tip changes in place when the device switches. In tips, `{cross}`, `{r1}` and the like expand to the words "Cross" / "A" and "R1" / "RB". Wrapped text keeps to words, and glyphs are drawn only on hint lines.
  - `c0-guided` (Prologue):
    - "Press {r1} to select your squad. Nothing moves until you give an order."
    - "Move the cursor to the hilltop (S) with the left stick or d-pad, then press {cross} to send them."
    - "The right stick looks around the field. Press {l3} twice to jump home."
    - "{create} pauses; you can still give orders while paused."
  - `c1-rts1`: the same ideas with this battle's details. "{square} picks every squad on the cursor's node, {l1}+{r1} picks them all." "Hurt squads: press {triangle} to Reinforce (10 Supply)." Plus one new pad-only tip the first time abilities exist (`abilitiesNow().length`): "Hold {r2} and press the button shown on an ability to use it."

## 4. Button prompts

- **Device state.** `input.device` is `'kb'` or `'pad'`. It becomes `'pad'` on any button edge or a stick past the deadzone. It becomes `'kb'` on keydown, pointerdown, or a pointer move of more than 3 px.
- **Glyph set.** `input.padKind` is `'ps'` when the pad id matches `/054c|DualSense|DualShock|Wireless Controller/i`, and `'xbox'` for everything else. Unknown pads get Xbox letters. The Settings "Button icons" option overrides it.
- **New `engine/prompts.js`:**
  - `glyph(c, id, x, y)` draws one glyph and returns its width.
  - `hint(c, x, y, { kb: '<today's exact string>', pad: [['cross', 'buy'], ['l1r1', 'tabs'], ['circle', 'leave']] }, o)`:
    - On keyboard it draws the old string unchanged, so keyboard screenshots don't move.
    - On pad it draws each glyph followed by its word.
    - The `keyHints` setting hides both.
  - It records what it drew in `G.hintLog` (cleared each frame) for tests.
- **Glyphs** (12 px tall, like `keyHint`; the outline is `#120e18` and the fill `#4a3e5a`):

| Glyph | Drawn as | Colour |
|---|---|---|
| Face, PlayStation | an 11 px disc with a 5 px pixel symbol: ✕ diagonal / ○ ring / □ outline / △ outline | ✕ `P.pluck`, ○ `P.heart`, □ `#e8a0b8`, △ `P.emerald` |
| Face, Xbox | the same disc with the letter A / B / X / Y (text size 8) | A `P.emerald`, B `P.red`, X `P.pluck`, Y `P.gold` |
| Shoulder / trigger | a 16x10 pill: L1 R1 L2 R2 / LB RB LT RT (size 7) | `P.chalk` |
| Sticks | a disc with a 1 px ring and L or R; L3 / R3 add a dot | `P.chalk` |
| D-pad | a 9x9 plus; the pressed arm in gold when a direction is meant | `P.chalk` / `P.gold` |
| Options/Menu, Create/View | pills: ≡ (both pads use three bars) / two small offset squares | `P.chalk` |

- **Every prompt that switches** (keyboard text unchanged → pad version):

| Where | Now | Pad |
|---|---|---|
| `title.js:154` | "Press any key" | before any device: "Press any key or button"; after a pad: "Press any button" |
| `title.js:167` | "Arrows and Space, or the mouse. M mutes." | [d-pad] move [✕] choose |
| `picture.js:26` | "Esc: skip" | [○] skip |
| `picture.js:73`, `recruit.js:41` | [Space] or click | [✕] |
| `pause.js:117` (Load) | "Esc" beside Back | [○] |
| `camp.js:126` | "Q/E or click: tabs  Arrows + Space  Tab: close" | [L1][R1] tabs [✕] choose [△] close |
| `camp.js:141` | "mouse wheel or arrows for more" | "d-pad for more" |
| `camp.js:179` | "Space: send to reserve / travel with Bramble" | [✕] send to reserve / travel... |
| `camp.js:201` | "...Esc: back" | ...[○] back |
| `shop.js:95` | "(wheel, ▲▼ or arrow keys for more)" | (d-pad for more) |
| `shop.js:101` | "Space: buy  Left/Right: tabs  Esc: leave" | [✕] buy [L1][R1] tabs [○] leave |
| `rpg.js:587` | "Esc: back" | [○] back |
| `rpg.js:619` | "Space or click" | [✕] |
| `rts.js:140` (preview) | "Space: pick/unpick  Esc: back" | [✕] pick [□] rally [△] start [○] back |
| `rts.js:130` (preview) | "(mouse wheel or arrows for more)" | (d-pad for more) |
| `rts.js:589` | "Choose a node: press its letter or right-click it. Esc cancels." | Move the cursor to a node, [✕] to use it. [○] cancels. |
| `rts.js:590` | "Click a squad, then right-click a node (or press its letter)." | [R1] or [□] picks squads, [✕] sends them to the cursor. |
| `rts.js:580` | "Reinforce (T) 10" | "Reinforce 10" + [△] |
| `rts.js:585` | "Rally (Q) 25" etc. | "Rally 25" + face glyph, drawn while R2 is held (otherwise an [R2] chip at the bar's left) |
| `rts.js:560-561` | Pause/Play, 1x/2x buttons | + [Create/View], [R3] glyph under each |
| `rts.js:571` | squad numbers 1..0 | hidden; [L1][R1] above the list |
| `rts.js:654` | tip "Space or click" | [✕] |
| `revisits.js:61` | "Arrows / 1-5 / click: choose  Esc: back" | [d-pad] [✕] choose [○] back |
| `explore.js:871-872` | camp / pause icons | a tiny [△] / [Options] glyph under each (y 28) |
| `data/ch0/story.js:43` quest | "(face the log and press Space)" | `{act}` token, expanded when the quest line is drawn: "Space" / "Cross" / "A" |
| `data/ch0/story.js:73` narrate | the controls line | `controlsLine()` picks at show time: "The stick hops. Cross talks. Square nibbles clover. Triangle opens the camp menu." |
| `data/ch0/story.js:428-431`, `data/ch1/rts.js:46-50` | army tips | `pad:` texts (§3) |
| `design/GAME_DESIGN.md` Controls | keyboard and mouse tables | add the Controller column / tables from §2-3, and change "Desktop only" to "Desktop: keyboard and mouse, or a PS5 / Xbox controller" |

## 5. Rumble

`pad.rumble(kind)` plays `gp.vibrationActuator.playEffect('dual-rumble', { duration, strongMagnitude, weakMagnitude })`.
- **When:** only while `input.device === 'pad'`, the Vibration setting is on and the document is visible.
- **Skipped silently** when there's no `vibrationActuator`, when its `effects` list doesn't include `dual-rumble`, or when the promise rejects (Firefox; some Safari versions).
- **Reset:** `reset()` runs on blur, pause and disconnect.

| kind | strong / weak, ms | Called from |
|---|---|---|
| `hit` | 0.10 / 0.35, 90 | `rpg.js` hit event on a party member |
| `crit` | 0.55 / 0.45, 160 | `rpg.js` crit (where it already sets `shake`) |
| `boss` | 0.7 / 0.5, 300 | `rpg.js:275` phase change |
| `quake` | 0.6·amt/3 / 0.3, secs·1000 | `explore.shake()` |
| `thump` | 0.5 / 0.2, 110 | the Long Thump scheduler, fired by `setTimeout` to land on each scheduled beat |
| `alert` / `alertHome` | 0.3 / 0.4, 180 / two 0.8 / 0.5 pulses of 200 ms | `rts.raiseAlert` |
| `order` | 0 / 0.15, 40 | army order given from the pad (a light confirm) |

## 6. Settings

- **Layout.** A new **"Controller..."** row goes after "Army auto-pause" and opens a second page (the same `SettingsScene` class with a different `rows()`). Row spacing drops from 24 to 22 px so 12 rows fit the panel.
- **Controller page rows:**
  - **Vibration** On / Off
  - **Button icons** Auto / PlayStation / Xbox
  - **Army camera stick** Slow / Normal / Fast (0.7 / 1 / 1.4 × `CAMSPEED`)
  - **Stick deadzone** Small / Normal / Large (0.35 / 0.5 / 0.65 on, each with 0.15 hysteresis), for worn sticks that drift
  - Back
- "Grid keys" and "Key hints" stay on the main page. "Key hints" now covers pad glyphs too.
- **Defaults** (`DEFAULT_SETTINGS`): `vibration: true, padIcons: 'auto', padCam: 'normal', padDead: 'normal'`. They're saved with `saveSettings()` like the rest.

## 7. Testing (headless, no real pad)

- **Fake pad.** `play.js` gets `ensurePad(kind)`, which is `page.evaluate` installing:
  - `window.__pad`, a plain object: `{ id: 'DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)' | 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)', index: 0, connected: true, mapping: 'standard', timestamp, buttons: 17 × {pressed, touched, value}, axes: [0, 0, 0, 0], vibrationActuator: { effects: ['dual-rumble'], playEffect: (t, p) => (window.__rumbles.push(p), Promise.resolve('complete')), reset() {} } }`
  - `navigator.getGamepads = () => [window.__pad, null, null, null]`
  - a dispatched `Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad })`
  - Every change bumps `timestamp`.
  - This works because `pad.js` calls `navigator.getGamepads()` fresh each poll (§1).
- **New step kinds:**
  - `{"pad": "cross"}`: a tap, held 60 ms (about 3 frames) then released, 80 ms gap. `{"times": n}` repeats it.
  - `{"padHold": ["r2", "square"], "ms": 200}`: a chord.
  - `{"stick": [0, -1], "ms": 600}` / `{"rstick": [1, 0], "ms": 500}`
  - `{"padHop": "up", "n": 3}`: the d-pad version of `hop`.
  - `{"padKind": "xbox"}`, `{"padConnect": false}`
  - `{"fight": "pad"}`: the same `decide()` policy, but it reaches each command, list row and target with d-pad presses (reading `menu.sel` / `lsel` / `tsel` from `battleState()`) and Cross. No clicks.
  - `{"army": "pad"}`: the same policy as `army()`. It presses Triangle on the preview, then Create to pause. For each order it presses R1 until the squad is selected, steers the cursor (it pushes the stick toward the target's screen position and re-reads `rtsState().cursor` up to 12 times), then presses Cross. It unpauses with Create.
- **Hook additions:**
  - `state()`: `device`, `padKind`, `hints` (`G.hintLog`)
  - `rtsState()`: `cursor` (node id), `targeting`
  - `window.__rumbles`, which tests can read
- **Replay with the pad** (new `design/solutions/pad-*.json`; keyboard steps replaced by pad steps):
  1. **Title to New Game** (`--no-jump`): any button passes the title, the d-pad goes to New Game, Cross starts it. Assert `hints` shows `cross`.
  2. **Exploration:** `c0-surface`. Stick hops including diagonals, Cross talks, a dialog with a choice, Square nibbles clover, Triangle opens camp, L1/R1 change tabs, Circle closes. Assert the quest line expands `{act}` to "Cross".
  3. **Shop:** Mallow in `c0-warren` (`c0.mallow-shop`). L1/R1 tabs, buy with Cross, decline auto-equip with Circle, and check that R1 does not accept it (the `act()` fix).
  4. **RPG battle with a boss:** `c1-toadhall` with `{"fight": "pad"}` (Chief Weasel). Assert `__rumbles` got `hit` and `boss` effects.
  5. **Army battle start to finish:** `c1-rts1` with `{"army": "pad"}`. It goes from preview to win with every tutorial tip showing its `pad` text. Then the same battle with `{"padKind": "xbox"}` to check the glyph set.
  6. **Pause, settings, save/load:** Options opens Pause, Settings > Controller toggles Vibration (assert no more `__rumbles`), Save to slot 2, Load.
  7. **Device switching:** a pad press, then a key press. Assert `state().device` flips and the shop footer's `hints` go `cross` → `Space`.
  8. **Disconnect:** `{"padConnect": false}` in exploration opens Pause.
- **Keyboard and mouse regression:** run every `design/solutions/*.json` through `play.sh` and the full `tools/fullrun.sh`, unchanged. They must pass with no fake pad installed. This covers the `act()` change, `held ∪ padHeld`, the hover rule, the settings rows moving 2 px apart, and keyboard prompt strings that must stay the same. Also take one screenshot per prompt location on keyboard against the current build: the pixels must be the same.
- **Manual, once, with real pads** (a person; this can't be faked): a DualSense and an Xbox pad on Chrome, Firefox and Safari. Check the mapping, the glyph pick, rumble, and the first-press reveal.

## 8. Risks

- **Browser differences.** The DualSense under Firefox is non-standard. Safari's rumble is uncertain. Steam Input and DS4Windows can make a DualSense report as Xbox (wrong glyphs, and the Button icons setting fixes that). The secure-context and iframe `allow="gamepad"` rules can break a hosted build silently.
- **Audio unlock.** Chromium may not unlock audio from a pad press. A pad-only player could start in silence, which is why the one-line hint on the title is there.
- **Synthesised keys clashing.** KeyE / `act()` is handled. Any new scene kind falls back to the menu scheme, which is safe, but each new scene needs a look. The army battle is native, so Space / arrows / letters are never synthesised there.
- **Cursor snapping.** On crowded maps (RTS 4-5, up to 10 nodes) a push may land one node off. The 65° cone, the d-pad, the visible label and Circle make it cheap to fix. If play shows it's poor, add "hold L2 + stick = free pointer that snaps on release".
- **Scheme load.** The army scheme leans on R2 chords and Create/View for pause. The tips and the HUD glyphs must teach it, so the pad tips of `c1-rts1` need a fresh review once built.
- **Tutorial texts written twice.** The keyboard and pad versions can drift apart. Keep them side by side in the same object (`{ text, pad }`).
- **Rumble.** Effects must be short and reset on blur, pause and disconnect, so a pad never keeps buzzing. Never rumble on the title or in menus.
- **Hover suppression.** It must flip back instantly on mouse movement, or mouse players see no hover. The regression replays cover this.
