# Controller support: build progress

Design: design/changes/controller.md (with "As built" notes). Coordinator review decisions 1-12 apply.

## Steps
- [x] engine/pad.js + input.js (padHeld, device, hover) + main.js poll
- [x] prompts.js (glyphs, hint) + every prompt location (code written, untested)
- [x] RTS native scheme + tips (code written, untested)
- [x] settings controller page, rumble, title/audio (code written, untested)
- [ ] play.js pad steps + hook
- [ ] pad replays (8), throwing getGamepads, full kb regression, screenshots
- pad-title, pad-c0-surface replays ok (design/solutions/pad/)
- docs: GAME_DESIGN Controls + Nibble fix; controller.md As built (results pending)
- pad-shop ok; pad-ng-c1-toadhall (fight:pad, boss+hit rumble) ok
- pad-c1-rts1 (army start to finish, all pad tips) ok
- pad-menus, pad-device (fixed: "Xbox Wireless Controller" matched the PS regex), pad-blocked, pad-noapi, pad-c2-rts2 (abilities, army:pad), pad-target ok
- screenshots: design/screenshots/controller/{ps,xbox}-{title,title-press,explore,dialog,shop,camp,battle,army,army-order}.png, ps-title-sound.png
- NEXT: full keyboard regression (scratchpad regress.sh -> regress.log)
- DONE: full keyboard/mouse regression, 49/49 design/solutions/*.json (all but *-reload) {"ok": true}, fresh page before each (log: design/progress/controller-regression.log). Session "pad" closed.
