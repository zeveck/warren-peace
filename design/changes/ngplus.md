# Change: New Game+ ("Tell It Again")

Request: "add a New Game+ that keeps your party's levels and gives every boss a harder second phase".

**As built** (after design/changes/REVIEW.md section 1): see design/progress/ngplus.md. It differs from this design in a few places:
- Ordinary fights scale to party −4, not −1.
- Phase-2 data lives in data/ng/bosses.js.
- The won save is always kept in a slot before NG+ starts.
- The Eye's bar is counted in eighths, with stand-in tellers.
- Several second phases were reworked to be truly harder.
- No toast is shown.

## 1. Starting NG+

**Where it's offered** (both routes run one function, `startNgPlus(wonSave)` in `screens/title.js`):
- **After the ending.** Once `g_won` is set (ch5/scripts.js, after the last narration), a toast says: "New Game+ is open. Ask Woodruff, or pick it on the title." Talking to **Woodruff** on `c5-sunset` after `g_won` adds a choice: "Tell it again, from the very start?" The fiction: Woodruff tells the whole story again, and in a story told twice everyone already knows their part. If the player says yes, the confirm below appears.
- **On the title.** A **New Game+** item sits between New Game and Load. It shows when any valid save (autosave, previous autosave or a slot) has `flags.g_won`, and it uses the most recent of those. Confirm text: "Start New Game+ from your finished game (Bramble Lv 27)? Your autosave moves to Load as "Previous autosave". Save slots are not touched." This is the same `keepPreviousAutosave()` rule New Game uses. If the finished game exists only as the autosave, the text adds: "Save your finished game in a slot first if you want to keep it."

**What carries over, and why:**

| Carries | Why |
|---|---|
| **Every party member's level and XP**, for all 15 members (`ng.levels`, `ng.xp`) | This is the request. Reserves get full XP, and all 15 are required recruits, so a won save has everyone at about 26 to 28. |
| **Bestiary** (`met`) | It's knowledge, not power. Filling it is a completionist's goal, and a second run shouldn't wipe it. |
| **Total play time** (`ng.prevTime`) | Shown in Load. |

| Resets | Why |
|---|---|
| Story flags, recruits (the roster starts as Bramble alone), quest, `defeated`, `opened`, escorts, chapter | It's the story again. Every recruit's join scene and recruit card should play. |
| Gear, items, key items, buttons, army gear | Gear tiers and shop stock pace the chapters, and the button economy is balanced to buy each chapter's set. If T5/T6 gear carried over, the Depths would hit for 1. Gear is a flat bonus, so at Lv 27 a T1 tool matters less than it did at Lv 8. That keeps early fights honest once enemies scale (section 2). |
| Finale memories | They're earned by living the moments, and the Dream needs them told again. |
| Army battles | Untouched. Army rank comes from freed warrens, not party levels, so RTS 1-5 play exactly as before. |

**Recruits not yet recruited.** `addMember(id, level)` (state.js) becomes `lvl = max(level || join, avgLevel(), ng.levels[id] || 0)`. Bramble starts at his carried level. Burdock is still carried into the first fight, at her carried level. Mole joins in the River Bank at his own carried level. Story-wise the friends don't remember the first run: no dialog changes beyond the phase lines below and Woodruff's offer. The levels are a gift from the storyteller. XP and the level cap (30) work as before, so a third run (NG++) is allowed: `ng.cycle` counts up, with the same rules.

**How saves mark NG+.** There's one new field, `G.s.ng = { cycle: 1, levels: {...}, xp: {...}, prevTime, from: <when> }`. A plain game has no `ng` (cycle 0). The save `v` stays 1: the field is additive, and old saves load unchanged. Slots are the same autosave, previous autosave and 3 slots. Load (`screens/pause.js` LoadScene) draws a small gold "New Game+" tag ("New Game+ 2" for cycle 2) after the place name. `__game.state()` gains `ng: cycle`.

## 2. Difficulty: scaling ordinary enemies

The design already says difficulty rises "through enemy count, tiers, statuses and boss mechanics, not stat inflation". So NG+ uses **one flat rule**: each encounter is shifted up so its highest level = **party level - 1** for ordinary fights and **party level + 1** for bosses. It is never shifted down. **Party level** = `avgLevel()` of the travelling three.
- All enemies in an encounter shift by the same amount, so tiers, level gaps within a fight, and summons (`e.lvl - 2/3`) keep their shape. Per-encounter `tweak`s still apply after the shift: the Depths easing (STR x0.6), `hardy()`, and the boss multipliers. So the Depths stay "very easy" and the Root stays hard, relative to the party.
- **Buttons** drop at the *original* level (`drops = 2 x base lvl`), so the button economy table holds. **XP** comes from the shifted level. With the catch-up rule (foes 1 below gives 0.7x) the party creeps toward 30 and never runs away.
- Easy mode applies as usual. The Kalidah chase, the Great Burrow and the prologue's first fight scale like any ordinary fight. The first fight stays `canLose`, and its scripted Burdock join is unchanged.
- One tuning knob per chapter, `NG_GAP` (default 1), lets the balance tool widen the gap where T1-T2 gear at Lv 27 makes fights run long. Target: ordinary fights take 3-4 rounds with sensible play, and Tussle-mashing averages 6.5 rounds or fewer with at least 90% wins (the current map check, rerun at NG+ levels).

## 3. A second phase for every boss (NG+ only)

**NG+ only: confirmed.** The base game's boss balance (counter wins in 8-15 rounds, plain worse) and its 23 replays are proven and stay byte-identical. All phase-2 code runs only when `G.s.ng` is set.

**Shared rules.** Phase 2 triggers at the start of the round after the boss falls to **50% of its bar**, unless the table says otherwise. It fires once, with the boss's line in the battle banner, a short screen shake, the boss's existing sfx (default `alert-horn`), and a code tint pulse on the boss (like the Elite glow). From then on, the turn-bar strip shows the phase's counter text. The NG+ boss Heart multiplier `NG_BOSS_HP` defaults to 1.0 per boss; phase 2's mechanic is what adds the rounds. There's no Heart refill, because refills feel cheap. Every twist builds on the boss's first-phase lesson, so a player who learned the boss once learns one new thing.

| Boss | Phase 2: trigger, what changes | Line announcing it | Counter to learn |
|---|---|---|---|
| **Chief Weasel** | 50%. Summon rounds now bring **two** weasels. While 2+ of his weasels stand he's "behind the lads" (takes x0.6). | "Second helpings, lads! Everybody up on the table!" | Hit-all the round they arrive, then hit him while he's in the open. |
| **Queen of Hearts** (+ Knave) | 50%. "Off with—" now **names one** rabbit and lands as one big single hit (power 2.6). If the named one is Guarding, hidden (Vanish, Disguise, Hide) or swapped out, the King and the executioner argue that you can't cut off a head that isn't there, and the Queen sulks (loses her next turn). | The Queen goes crimson. "Who has been PAINTING my roses?" The King, quietly: "One at a time, my dear." | The named rabbit Guards, vanishes or swaps out, and the sulk is a free round. |
| **Whispering Choir** | When the **first mouth fades**. The other two **both glow** each round and speak in a round, one a beat after the other. Each unsilenced mouth gives Afraid on all. | One mouth goes quiet. The other two take a breath together, and begin to speak in a round. | Silence both: a hit-all on a glowing round shuts them together (Long Thump, Oar Sweep, Landslide). |
| **Aster** | 50%. She begins **the Deep Verse**: 2 rounds ("Verse: 2 lines left"). If the party deals 10% of her max Hum during it, she loses her place ("For a moment her eyes are brown."). If she finishes: Hummed on all (100%), and the Hum-feeds rule bites. | "I wrote a new poem in the dark. Listen. It goes deeper every line." | Turn every hit onto her during the verse (not the Lookout or the Digger). Keep a cure-all ready (Ninefold Welcome). |
| **Moth Queen** | 50%. She holds up the stolen pestle. It **glows +1 a round** ("Pestle glow: 2/3"). At 3: Moon-dust (hit all, Asleep 60%). Any Light hit on her resets it to 0. | "Everything that glows is MINE. Look how it glows for me!" | Light at her every other round (Butterfly Dream, Light gear). Poppy Ward, Smelling Salts. |
| **Tansy**, Hum-taken | 50%. She almost remembers. Her every-third-round dash now **races Bramble only** (power 3.4). If he's Guarding she runs into him: tumble (12% Hum), stunned, and after two tumbles she loses her second action for good. If he's not Guarding she "wins" (STR up 3 rounds). | "Bramble? ...Race you to the warren mouth." Her eyes go pale again. She crouches. | Bramble Guards on her dash rounds. The rest keep Shielded and Afraid on her. |
| **Tidewarden** | 50%. On submerged rounds **two Drowned Eyes** surface (minions, little Heart) instead of the Cold Ripple. The Tide's power = 0.9 + 0.6 per eye still open (both open: 2.1, more than phase 1's 1.6). Both shut: "The Tide finds nothing to look at. It rolls back." | The Tidewarden sinks, and all around the pool, the water opens its eyes. | Phase 1 taught Guard. Phase 2 teaches hit-all the eyes while it's under. |
| **Barley** | 50%. He hums the old ploughing song and is **Rooted**: takes x0.5, and Ploughs every 2nd round. Any Afraid on him pulls him loose for the rest of the fight. | "Deep furrow... deeper..." The corn-roots wind round his feet. (Startle him loose!) | Afraid on him (Sharp Tongue, Stern Word, Whitewash, Trumpet; 35% on a boss, so keep trying). Still don't Guard the Plough. This gives Barley a counter the plain AI misses (today he's an outlier). |
| **Wicked Witch** | 50%. She snaps open her **black umbrella** for 2 rounds in every 4, telegraphed the round before ("Umbrella up!"). A pail splash on the umbrella only does 10. | "Water? WATER? Not today, my pretty little rabbit!" | Hold the pails for umbrella-down rounds; fight the wolves and crows meanwhile. |
| **Watcher on the Stair** | 50%. It opens **two eyes a round** (Seen still at 7). Every hit on it closes one, and multi-hit skills close one per hit. | Every shut eye flickers. It isn't one thing watching any more. It's the whole stair. | Everyone hits it every round. Quick Paws closes two. Heal with items before Seen, not with turns. |
| **Captain Quarry** | 50%. He drops his flint and **digs straight down**: "Hole: 1/4" rises each round, and at 4 he breaks through (hit all, power 1.6, Afraid). Each Dig-tagged hit fills it back one (Tunnel Under, Landslide). The collapse rhythm continues. Yarrow calls from the lip. | "Deeper. It's just a little deeper." Yarrow, from the lip: "Fill it in, Bramble! Dig against him!" | Bring a digger (Mole, Burdock) and backfill. Shield before the collapse as before. |
| **Hollow Rabbits** | When **two have faded**. The last two take paws and share every hit (damage split between them). Every 2nd round: "Come and forget" (Asleep 50% on all). | Two fade. The other two take each other's paws. "Stay," they whisper. "Forget with us." | Light hit-all (sharing makes it twice as good). Poppy Ward, Star-stones (the Root's own item). |
| **Nightmare of Deepdelve** | 50%. A pulled-out friend now stays gone **2 rounds**, and **A Hole in the Dream** (a target, Drift sprite) appears. One hit on it hauls them back. | The dream opens a dark mouth. "Down here," it says, in Deepdelve's voice. "Stay down here." | Hit the hole at once, or swap a reserve into the gap. |
| **Nightmare of Flintcomb** | 50%. The **Drone**: it's Shielded (x0.6) while its hum is unbroken, and it hums every round. A Thump or Long Thump breaks the drone for 2 rounds. | Its hum drops low and steady as a drill. Far above, faintly, someone is thumping. (Thump back!) | Bramble thumps every other round (the Long Thump, in miniature). Keep curing Hummed. |
| **Undersleeper's Eye** | **After the third story.** It half-wakes and will only really listen to whoever was there: a story told by the memory's own `friend` lowers the bar a fifth; told by anyone else, a tenth ("The Eye listens, but it wants to hear it from Mole."). The dream pulses every round. It still can't be lost. | The Eye opens wider. "Who was THERE?" the dream asks. "Tell me the one who was there." | Swap the right friend in before telling (Mole for the river, Ninefold for the dandelion, Pip for the pebble). |

All the lines are short (under 140 characters), nobody is hurt, and the bosses are woken, faded or sent packing as before.

## 4. Engine and data changes

- **state.js**: `newGame(ngFrom)` copies the carried fields. `addMember` applies the `max(...)` above. New helper `ngCycle()`.
- **engine/save.js**: `wonSaves()` returns the valid saves with `g_won`, newest first. No format change.
- **screens/title.js**: the New Game+ menu item, the confirm, and `startNgPlus(save)` (like `startGame(null)`, plus `G.s.ng` and a Woodruff line on arrival: "Again? Good. Stories are better the second time."). **screens/pause.js**: the Load tag.
- **data/ch5/scripts.js, people.js**: Woodruff's post-`g_won` choice and the toast.
- **New `battle/ngplus.js`** (shared by the game and the tools): `ngShift(enc, partyLvl, gap)` returns shifted specs and original drops.
- **battle/rpg.js**: if `G.s.ng`, the BattleScene constructor shifts the specs before `makeEnemy`, restores drops, and passes `ng2: enc.ng2` to the sim. It animates the new `phase` event (banner lines, shake, sfx, tint pulse), shows `ng2.counter(sim)` in the turn bar, and adds `phase2` plus the `ng2` state to `summary()` for the autopilot.
- **battle/sim.js**: a generic hook, inert when `o.ng2` is absent:
  - `startRound` checks the trigger (`ng2.at` fraction of the boss's bar, or `ng2.trigger(sim)`) once, pushes `{t:'phase'}`, then calls `ng2.enter` and, every later round, `ng2.round`.
  - `enemyAct` tries `ng2.act(sim, e)` before `mechAct`.
  - `damage` multiplies by `ng2.takeMod(sim, src, tgt, o)`.
  - `hit` calls `ng2.onHit(sim, src, tgt, o, ev)`; `useSkill` passes `skill` and `tags` in `o`, for Light, Dig and Thump.
  - Dream: story damage reads `ng2.storyFrac(sim, teller, memory)`; the scene passes `memories: {id: friend}` in the opts.
- **Encounter data** (`ng2: { at, lines, sfx, enter, round, act, onHit, takeMod, counter }`, plus `NG_BOSS_HP`): ch1/encounters.js, ch1w/encounters.js, ch2/battles.js, ch3/encounters.js, ch4/flintcomb.js, ch4/root.js, ch5/encounters.js. New enemy moves (moon-dust, race-bramble, breakthrough, come-and-forget) go in data/core/enemies.js MOVES, and a `counter2` id per boss goes in BOSSES for the autopilot.
- **Assets: none.** Tints, banners and the hole and eye targets reuse existing sprites (drift/whisper, drowned-eye) and code drawing. **Sfx**: existing ones (choir-sting, alert-horn, rumble, splash-melt, thump-2, shimmer). **Music**: each boss keeps its track (m-boss / m-boss-whimsy / m-boss-hum, m-dream), with a 0.5 s duck under the phase sting. Cost: $0.

## 5. Testing

- **tools/lib-battle.mjs**: `runEncounter(..., { ng: { partyLvl } })` applies `ngShift` and `ng2` exactly as the game does. `partyAct` counter mode learns each `counter2` (from the Counter column above). **tools/play.js `decide()`** gets the same changes line for line, as in bosses.md.
- **tools/balance.mjs `--ng`**: party at Lv 27 (boss 28), with the segment's team and gear (BOSS_TEAM / BOSS_GEAR, plus an NG team where the counter needs one: Caterpillar for the Moth Queen, Mole for Quarry). Targets per boss:
  - Counter wins at least 80%, in **10-18 rounds**, and phase 2 is reached in at least 90% of wins.
  - Plain is **clearly worse**: under 60% wins, or at least 3 rounds slower.
  - The Eye is counter-only: 7-10 rounds.
- **`balance.mjs --ng --all`**: the map checks at Lv 27 with each chapter's gear (2.3-4 rounds counter, Tussle ≤ 6.5 rounds and ≥ 90% wins); tune `NG_GAP`.
- **Base game unchanged**: `balance.mjs --all` and `curve.mjs` give byte-identical output.
- **Segments**: a new `data/ngplus/` module, loaded like a chapter, generates NG variants of the 12 boss segments: `ng-c1-toadhall`, `ng-c1w-wonder-b`, `ng-c1w-shallows`, `ng-c2-aster`, `ng-c2-moon-b`, `ng-c2-drowned`, `ng-c3-barley`, `ng-c3-oz-b`, `ng-c3-stair`, `ng-c4-quarry`, `ng-c4-root`, `ng-c5-dream`. Each is the base segment with `ng: {cycle: 1}` and every member at max(level, 27). `goToLevel` sets `G.s.ng`. The solutions are copies of the base ones with the segment id changed: exploration is identical, because map enemies only move on hops and the fights are fought by the autopilot.
- **`ng-start` segment**: starts at `c5-sunset` with the `c5-ending` end state (`g_won`, party 27). Talk to Woodruff, "Tell it again", confirm, then wait until `ng.cycle === 1`, the map is `c0-downs` and Bramble is Lv 27. Its done check is that state, and the replay continues through `c0.first-fight` (scaled, still won). The title path is checked by hand once with playwright: finish `c5-ending`, reload, New Game+ shows and starts the same way, and Load shows the tag.
- **Replays**: all 13 NG segments, plus the base regression batch (all 30 base segments) after the sim hook lands.

## 6. Risks

- **Phase-2 code leaking into the base game.** All of it is gated on `o.ng2`/`G.s.ng`, and the byte-identical base balance output is the check.
- **Gear at Lv 27.** Flat gear bonuses shrink relative to stats, and five skills from the start add power. The net effect is unknown until measured, which is why `NG_GAP` and `NG_BOSS_HP` are tuning knobs, not fixed numbers.
- **Counters that need a specific friend** (Light for the Moth Queen, Dig for Quarry, the right teller for the Eye). Reserves carry no gear in the segments, which bit the Hollow Rabbits' Light swap before (bosses.md). Each such counter has a second way in (Light gear, Burdock's Landslide, the plain tenth-a-story), and the NG teams equip their counter member.
- **Barley and the Hollow Rabbits are outliers today.** Phase 2 gives each a counter the plain AI doesn't play. If plain still keeps up, record them as outliers again.
- **Saves.** Starting NG+ from the title pushes an older "Previous autosave" out. The confirm says so, and the won save in a slot is never touched. Older builds ignore `ng`.
- **Scripts that set levels.** `s.recruit(id, {level})` and segment levels go through the same `max`, so nobody joins below their carried level.
- **Replay flakiness.** The new `phase` event adds banner time. The autopilot already waits on `battleState()`, so no timing is hard-coded.
