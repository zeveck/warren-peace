# ch1 progress (round 3 helper)

## What the files already hold (from rounds 1-2)
- maps: c1-depths, c1-underway, c1-riverbank, c1-wildwood (scent trail hooks), c1-mole-end, c1-badger, c1-buried-city, c1-road, c1-toadhall-in. Screenshots exist from round 2 (not yet re-checked).
- scripts.js: full story for Depths, Underway (+ underway.stone), River Bank (Ratty/weir, Mole/scent/carol, hedgehogs/Badger, Toad car/washerwoman/tunnel/Chief Weasel), home briefly (pebble), RTS1 intro/won, Great Burrow (Chert, rescued five), home.<id>.ch1 lines.
- encounters (depths, riverbank, wildwood, buried city, road, toad hall, chief weasel, great burrow), rts c1-rts1, extra.js (speakers, bestiary, memories, banter, quests, places, shop, mapAdds for c0-warren), 5 segments (no solutions).

## Missing / plan
1. Load check in browser, console errors.
2. Solutions: c1-depths -> c1-riverbank -> c1-toadhall -> c1-rts1 -> c1-greatburrow, each replayed with play.sh.
3. Balance (battle-check / rts-check), screenshots re-taken and looked at.
4. Fill gaps: bestiary/banter extras, pairs, etc.

## Status
(updated below after each stretch)
- [round3] Indoor maps: added `rim()` in build.js (walls nobody stands behind become void, back rims only) so tunnels are clickable/readable. Rest stones/beds added: Depths room E, Mole End bed, Badger's settle.
- [round3] c1-depths solution written, replays ok (with the button-race patch, see below). c1-riverbank solution written (Ratty, Mole, Badger), ran ok live; full replay pending.
- TOOL BUG: tools/play.js btn() fails "no button X among" when it polls in the ~16 ms between the battle menu appearing and the next draw (askCommand resolves in a microtask after draw). Fights fail ~20-30% at random. I validate with a scratch copy whose btn() retries for 1.5 s; the official tool needs that one-line change.
- [round3] c1-toadhall solution written (road, Toad, washerwoman, Badger's, buried city, Toad Hall, Chief Weasel at party L9), ran ok live; full replay pending.
- [round3] c1-rts1 now starts at c0-downs by the Lookout Stone (ch0's lookout.stone runs it); solution is a manual plan (B selects all, letters order; tutorial prompts dismissed as they come). Won. Odds: required only = Even (35%), +Gardeners/Polite Dark + rank-1 gear = Strong.
- [round3] c1-greatburrow starts in c0-warren's Great Burrow running `c1-rts1.won`; ok. Home-briefly scene tested by hand (pebble given, memory).
- NOTE: playwright "Shift+Digit2" doesn't add to the RTS selection (input.digit reads the shifted key?), use B.
- [round3] Added talk lines for Cheshire Cat/Caterpillar/Ninefold/Chert in ch1 areas, 4 more pair banters, bestiary (stoat, ferret, washerwoman), quest-line fixes while escorting Toad.
- [round3 FINAL] All 5 solutions (c1-depths, c1-riverbank, c1-toadhall, c1-rts1, c1-greatburrow) replay {"ok": true} first try with the official tools/play.sh (after the coordinator's btn() retry fix). No console errors. Screenshots re-taken: depths, underway, riverbank-a/b, wildwood-a/b, moleend, badger, buriedcity, road, toadhall, greatburrow.
- Left/optional: c0-downs mapAdds for visiting squads; more home lines per recruit; RTS1 tier untouched (1.0 = Even/Strong as designed).
