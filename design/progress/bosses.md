# Boss difficulty fix (counter-policy autopilot)

Goal: bosses need their counter again (design: counter policy wins in 8-15 rounds, plain play loses or takes >15),
instead of being eased until the replay autopilot (close to the plain AI) could win.

## Step 1: autopilot plays the counter policy (done)
- `tools/play.js` `fight()` now calls `decide(b)`: a line-for-line port of `tools/lib-battle.mjs` partyAct counter mode
  (Shielded/Guard on the big-hit round, Quarry's collapse rounds, Tansy: keep Shielded + Afraid on her, pails on the
  Witch, revive, cures, heal at 40% (55% vs Barley), items when nobody else can heal, focus the boss where the policy
  says so, keep the last moth, Light vs Eerie, Ninefold's Unspeakable vs 2+ Hum-taken, hit-all at 2+ foes, glowing
  mouth / open eye first). The command is then played with real input (Guard / Skill / Item / Tussle buttons, list and
  target keys). Kept: the button-lookup retry (btn), "nothing targetable -> Guard", Tell a Story in the dream.
- `game/src/battle/rpg.js` summary() (the debug hook's battleState) now also exposes what the sim AI reads: per unit
  buffs, boss/mech/counter, eerie, hum, charge count, strike, str/wit, skill ids; the acting member's full skill defs,
  skillDefs for the party, dream and storyUsedRound. No gameplay change.
- Check: scratchpad harness runs play.js decide() inside BattleSim on a view built like summary(): identical results to
  the counter AI for every boss with the same seeds (e.g. Chief Weasel 30/30 11.7r, Choir 11.9r, Witch 8r).
- Counter-policy fix (both lib-battle.mjs and play.js): a cure must cure the friend's actual status (Brave Heart only
  cures Afraid; it was being cast on Hummed friends).

## Step 2: real difficulty back (done)
`node tools/balance.mjs --all` numbers (30 seeds; `@L` = boss level - 1, segment team, segment gear tier). "counter" =
lib-battle counter mode = the new autopilot (the scratchpad harness gives identical results with the same seeds).
Counter-policy additions (lib-battle.mjs and play.js, identical): the cure fix above; "bring the counter in": vs a
cure boss (Aster, Nightmare of Flintcomb), if nobody in the three can cure Hummed, a non-Bramble non-healer Swaps itself
for a reserve who can (Ninefold Welcome). (A Light hit-all swap for the Hollow Rabbits was tried and removed in step 3.)

| Boss | before: counter | before: plain | after: counter | after: plain | change |
|---|---|---|---|---|---|
| Queen of Hearts | @10 fresh: 30/30 8.1r | 30/30 7r | @9 arrival state: 30/30 11.6r (28%) | 16/30 9.5r | QHP 0.6->0.41, QSTR 1.1 (step 3) |
| Aster @12 | 30/30 7.5r | 30/30 8.4r | 29/30 13.1r | 17/30 | HP x1.15->1.44; new: the Hum takes hold |
| Moth Queen @15 | 30/30 5.7r | 30/30 7.3r | 30/30 10.2r | 22/30 14.7r | queen HP x1.8, STR/WIT x1.2; solution rests first |
| Tansy @16 | 30/30 8.7r | 27/30 6.7r | 30/30 9.6r (45%) | 6/30 | HP x1.44->1.87, STR x1.6->1.28; new: Race You! dash |
| Tidewarden @17 | 30/30 8.5r | 27/30 5.5r | 29/30 12.6r | 18/30 | HP x0.6->0.75 |
| Barley @18 | 30/30 7.1r | 30/30 6.8r | 30/30 11.5r | 28/30 10.1r | HP x1.1->1.43, STR x1.15 (outlier, below) |
| Captain Quarry @22 | 30/30 8.7r | 30/30 6.3r | 30/30 11.1r | 18/30 | HP x1.1, STR x0.95; collapse blow x2.2 |
| Hollow Rabbits @25 | 30/30 13.6r | 30/30 12.4r | 30/30 11.4r | 30/30 10.6r | HP x3.1->3.0, STR/WIT x0.9 (outlier, step 3) |
| Nightmare of Flintcomb @26 | 30/30 12.7r | 30/30 10.6r | 30/30 12.2r (Ninefold in) | 15/30 | HP x1.9->2.4, STR/WIT x1.25; Hum takes hold |

Mechanics added (all in the chapter encounter files, via tweak/onRound; nothing in the engine):
- Aster (ch2/battles.js): a friend still Hummed a whole round after being Hummed (status at 1 at round start) makes
  Aster louder: STR/WIT +35% of base per such friend, stacking for the fight (first time: a line "Cure them,
  quickly!"). Counting only the second round makes a prompt cure prevent it completely; counting every Hummed round
  (first try) or healing her (second try) didn't separate the policies.
- Nightmare of Flintcomb (ch5/encounters.js): the same rule (+30% per friend), since its counter is "Cure; Ninefold".
- Tansy (ch2/battles.js + core MOVES 'race-you-tansy'): every third round she crouches (telegraphed "(Guard!)", acts
  last, once) and dashes through the party (power 3.0). Each Guarding rabbit she runs into makes her tumble: 6% of her
  Heart each and she loses her next action. Afraid, or facing a fully Shielded party, she loses her second action.
  Why: without it the counter (Shielded + Afraid) is Pluck-bound (Badger can shield twice) and only slows the party
  down; plain won faster at every HP/STR setting tried.
- Captain Quarry (ch4/flintcomb.js): his STR is x2.2 on collapse rounds only (the collapse is his only action then),
  so Guarding the telegraphed collapse is what matters (his team has no Shielded skill).

Outliers left:
- Barley: plain 28/30 in 10.1r vs counter 11.5r. His counter is "don't Guard on his charge; heal after"; the plain AI
  never guards, so it already plays half the counter, and the other half (heal at 55% instead of 40%) can't be made
  decisive against a random-target Plough (tried: a plough-only STR surge x1.6/x2.0; counter and plain fell together).
  Now 8-15 rounds (was 7.1).
- Undersleeper's Eye: 5 rounds by rule (five stories end the dream), counter-only story finale.
- Not changed, already ok by the tool: Chief Weasel, Choir, Witch, Watcher (plain 12.8r vs 12.1r: only "slower"),
  Nightmare of Deepdelve (plain 12.1r vs 11.1r: only "slower").
- Map warnings: c1-depths mean 2.4 was there before this work (the replays' Depths easing); c3-wheatsheaf mean 3.0 ->
  2.9 only because the counter AI no longer wastes Bramble's turns on Brave Heart for Hummed friends. Normal fights
  not touched.
- Curve: tools/curve.mjs clean (unchanged).
- Engine note (not changed): Guard ends at the next round start, not "until next turn" as the design says, so a slow
  member (Badger vs the Queen) can't Guard a fast boss's blow. And BOSSES.tidewarden has hpMult inside `mult`, so it
  uses the default x8 (its encounter tweak absorbs it).

## Step 3: replays (session "boss", page reloaded before each run)
- Batch 1 (after step 2): ok c1w-shallows, c2-aster, c2-drowned (Tansy + Tidewarden), c3-barley, c4-quarry, c5-dream.
  Lost the boss: c1w-wonder-b (Queen), c2-moon-b (Moth Queen), c4-root (Hollow Rabbits). Measured at each boss door:
  - Queen: party arrives at L9 (not 10) with Bramble 49% Heart / 32% Pluck, Badger 64%, Mole 41% Pluck. Wonderland has
    no rest stone. From that state even the OLD eased Queen (QHP 0.6, QSTR 1.1) was too hard for the counter (28/40,
    18.9r): the problem was never modelled. Now QHP 0.41, QSTR 1.1, and balance.mjs checks her at the measured arrival
    state (new BOSS_ARRIVE: L9, 65% Heart, 40% Pluck, the segment's items; lib-battle runEncounter takes hpF/plF/items):
    counter 30/30 11.6r (28% Heart left), plain 16/30 in 9.5r.
  - Moth Queen: party arrives L14 at ~45-68% Pluck, but the grove has a rest stone (23,25) that the solution walked
    past. c2-moon-b solution: after the fight at step 55 it now walks back, rests at the stone and returns (14 steps
    inserted after step 56). Her HP x2 -> x1.8 (STR/WIT x1.2) for L14 rested with the real items (counter 38/40 10.9r,
    plain 21/40 15r); balance.mjs @15: counter 30/30 10.2r, plain 22/30 14.7r.
  - Hollow Rabbits: party full at L25; the autopilot's swap brought Caterpillar in, but reserves carry no gear (the
    segment equips only the travelling three), so she was knocked out every round and Jade spent her turns reviving.
    The Light swap is removed from the counter policy (lib + play.js; the Hummed-cure swap for the Nightmare of
    Flintcomb stays: c5-dream ok). With Rumble + Jade, counter and plain play the same (both use Moonbeam), so the
    Hollow Rabbits are an outlier like Barley: HP x3.0, STR/WIT x0.9: counter 30/30 11.4r, plain 30/30 10.6r.
- Batch 2-3: c1w-wonder-b ok, c4-root ok. c2-moon-b first try: a wandering grove enemy caught the party on the walk back
  to the stone. play.js got a `{"fight": "maybe"}` step (fight only if a battle opens within 1.5 s); the walk back
  now does walk / fight-maybe / walk for each leg. Then ok.
- All nine boss segments ok on current code: c1w-wonder-b, c1w-shallows, c2-aster, c2-moon-b, c2-drowned, c3-barley,
  c4-quarry, c4-root, c5-dream. (Batch-1 oks predate only the Queen/Moth Queen/Hollow edits and the Light-swap removal,
  none of which touch those fights.)
- Regression batch (the other 14 segments, once, page reloaded before each): all ok: c0-attack, c1-depths,
  c1-riverbank, c1-toadhall, c1-greatburrow, c1w-wonder-a, c2-moon-a, c3-oz-a, c3-oz-b, c3-china, c3-stair, c4-hole,
  c4-herd, c5-ending. Session "boss" closed.

## Final state
- balance.mjs: all bosses ok except the explained outliers Barley, Hollow Rabbits (plain not worse) and the
  Undersleeper's Eye (5 stories by rule). Map warnings c1-depths (pre-existing) and c3-wheatsheaf (2.9, tool fix).
- curve.mjs clean. Every file passes node --check. All 23 replayed segments ok.
- Files: tools/play.js (decide(), fight(), fight:maybe), tools/lib-battle.mjs (cure fix, Hummed-cure swap, hpF/plF/
  items), tools/balance.mjs (BOSS_ARRIVE), game/src/battle/rpg.js (summary fields), data: ch1w/encounters.js (Queen),
  ch2/battles.js (Aster, Moth Queen, Tansy, Tidewarden), core/enemies.js (MOVES race-you-tansy), ch3/encounters.js
  (Barley), ch4/flintcomb.js (Quarry), ch4/root.js (Hollow), ch5/encounters.js (Nightmare of Flintcomb),
  design/solutions/c2-moon-b.json (rest at the grove stone).
