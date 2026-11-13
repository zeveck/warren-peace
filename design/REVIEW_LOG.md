# Design review log

## Round 1

Reviewers: Player, Builder, Art and sound director. 30 findings (6 must-fix, 19 should-fix, 5 nice). All fixed by the refiner; none rejected.

#### Player findings

#### RTS node letters clash with the ability and speed keys
Severity: must-fix
What's wrong: Controls say "RTS: order | Select, then press a node's letter", and also "army ability | Q, W, E, R" and "F toggles 1x / 2x". RTS 4 has 10 nodes; lettered A to J, E and F do two jobs. Tab also cycles squads.
Why it matters: In the hardest battle, the player gives an order and something else happens; costs Supply.
Suggestion: Exclude Q, W, E, R, F, Tab, Space and digits from node labels (use A, S, D, G, H, J, K, L, Z, X, C, V), or make orders mouse-first with right-click on a node. State reserved keys.
Evidence: GAME_DESIGN.md controls table (plain from the table).

#### Arrow keys move along the grid, not the screen
Severity: should-fix
What's wrong: Up = up-right etc., 4 directions only. Going straight up the screen requires zigzagging; compass only in chapter 1.
Why it matters: 4 hours of hopping; feels wrong; tiring in tunnel mazes; kids struggle.
Suggestion: Screen-relative movement: Up+Right = up-right grid step; single Up alternates up-left/up-right so holding it walks straight up. Keep grid mapping as a Settings option with the compass on when enabled.
Evidence: judgment.

#### The attack comes too late for "a few minutes in"
Severity: should-fix
What's wrong: 6 surface rabbits, Pip's quest, warren maze with 8 more rabbits, Woodruff, then sweetgrass errand: 14 conversations before anything happens.
Why it matters: Request says "a few minutes in".
Suggestion: Hard target of 4–6 minutes to the attack. Only Pip, Tansy, Woodruff and Yarrow required; others optional and remain after with changed lines. Small rumble (shake + dust) around minute 2.
Evidence: judgment; rabbit-game.md "The start".

#### Recruiting is the star but gets no big moment
Severity: should-fix
What's wrong: Nothing in Juice or sound list for a recruit joining.
Suggestion: Must-have recruit moment: sting sfx, card sliding in with portrait, name, role/squad kind and first line, squad banner joining a row of banners; new friend shows up in Thimblebank next visit. Add sfx recruit-join to assets and budget.
Evidence: judgment.

#### Most army recruits have no quest, contradicting "every recruit has a quest"
Severity: should-fix
What's wrong: Hedgehogs, Otters, Flamingos, Card Gardeners, Lantern Moths, Cowardly Lion, Emerald Guard have no described quest. Lion and Scarecrow barely appear in the Oz walkthrough.
Suggestion: Every recruit gets at least a one-step favour (fetch, talk, small fight, choice), listed per world. Give the Lion (courage on the Kalidah bridge) and Scarecrow (unhooked from his pole) real on-screen scenes.
Evidence: judgment.

#### The chapter times don't fit their content; the Moon is squeezed
Severity: should-fix
What's wrong: Wonderland 30 min for 8 areas + size puzzles + boss + 5 recruits. Chapter 2 is 40 min for RTS 2, Aster boss, Silverdown Depths, whole Moon, Drowned Halls with 2 bosses; Moon gets ~10–15 min.
Suggestion: Give the Moon 25–30 min and Chapter 2 ~60, or cut Wonderland to 5–6 meatier areas. Re-sum totals.
Evidence: judgment.

#### No guaranteed way to beat a "Weak" army battle
Severity: should-fix
What's wrong: Buttons are finite; nothing promises required recruits alone reach "Even".
Suggestion: Promise each required battle is "Even" with only required recruits and no army gear; optional recruits and gear push to "Strong". After 2 losses, offer Easy mode or a one-time "the warren's rabbits rally" boost.
Evidence: judgment.

#### The finale battle with endless enemies could be a wall before the ending
Severity: should-fix
What's wrong: RTS 5 hold three stones at once vs endless spawns for 60s, Hard, new rules, right before the climax.
Suggestion: Each held stone weakens/slows dream-shapes; pause rather than reset the timer when a stone is lost; big rings showing held stones; introduce "hold a point" earlier in RTS 3 or 4.
Evidence: judgment.

#### The first army battle teaches nothing
Severity: nice
What's wrong: The unwinnable prologue battle drops a new player into the RTS with no tutorial.
Suggestion: Make it a short guided scene: teach "select Burdock, click a node" in 3 prompts, then enemy waves roll over the ridge until Yarrow calls the retreat.
Evidence: judgment.

#### "Attack" vs "kindness is the weapon"; Pip's training gap
Severity: nice
What's wrong: Basic command against Hum-taken rabbits is "Attack". Pip "trained with Burdock" while Burdock has been travelling with Bramble.
Suggestion: Rename the basic command (e.g. "Thump" or "Shake Awake") for Hum-taken targets; Pip trains with Comfrey or Woodruff, or Burdock between chapters.
Evidence: judgment.

#### Builder findings

#### The asset list leaves out about 20 sprites, and the budget is already over before audio retries
Severity: must-fix
What's wrong: "24 enemy types" but 31 regular types listed. Bosses with no art row: Chief Weasel, Knave, Moth Queen, Wicked Witch, the three Nightmares. Army-only squads with no sprite to copy: Hedgehogs, Otters, Flamingos, Moon Hares, Field-mouse Carollers. Speaking NPCs with no sprite: the Cook, Bill the Lizard. Real sprite count ~90, not ~70. Budget $21.40 vs $20; the 30% retry margin applies to images only (music $5.40, sfx $3.72 have no retries); $0.05/image is an assumption.
Suggestion: Exact sprite inventory, one row per sprite including every boss and army-only squad base. Re-price with audio retries. Use `--model gpt-image-2.5-flare` (~4x cheaper) for enemy tiers, icons, prop sheets; recolours of shared bases (Card Soldier→Card Gardener, Field Mouse Queen→Carollers and Field Mice); fewer sfx (menu sounds, talk blip, footsteps in code). Keep anchor, party and portraits on 2.6.
Evidence: GAME_DESIGN.md enemy list vs asset rows; imagegen2/2026.11.6/imagegen2/SKILL.md lines 39–40, reference.md line 22; reference.md 171–172 (no prices); audiogen SKILL.md 325–328.

#### The army battle simulation isn't specified well enough to build, balance or match the Lookout odds
Severity: must-fix
What's wrong: Formula `Strength x Size x matchup - enemy Toughness`; Size is both health and "3 to 5 sprites"; Rations "+1" unclear. No damage floor: once Toughness > Strength x Size x 0.75, damage ≤ 0 and fights never end. "Spread over the enemy" undefined for 2 vs 1. Lookout's "sum of squad power" is a different calc from the sim, will say "Even" for unwinnable battles. Corn tiles vs path-only movement undefined. No stat tables for 22 squad kinds or enemy squads.
Suggestion: Size = hit points; sprites shown = ceil(Size / per-sprite HP). Damage per tick `max(0.2 x base, Strength x matchup x gearMult x (Size/maxSize)^0.5 - Toughness)`, split evenly over enemies in contact. Stat table per squad kind and enemy squad. Compute Lookout odds by running sim.js headlessly with default enemy AI vs a simple "advance on nearest node" player AI. Corn is a per-edge property of paths.
Evidence: judgment; the zero-damage stall follows from the formula.

#### The recorded solutions break the play-test rules, and the debug hook is missing calls the play-test needs
Severity: must-fix
What's wrong: Solutions are "debug calls and key presses" using rtsOrder, give, recruit, setFlags, winBattle. playtest-guide says use the hook only to read state and jump to a level, never to fake the player's actions. No `buttons()` and no `audioState()`, which the play-test relies on. Real clicks won't replay deterministically unless orders tie to sim ticks.
Suggestion: Solutions use real keys and clicks only; `chapter(n)` is the one allowed jump; setFlags/give/winBattle for manual poking only. Add `buttons()` (menu items, battle commands, RTS node and squad rectangles) and `audioState()`. RTS solutions: pause, real keys/clicks for orders, unpause, each order keyed to `rtsState().tick`.
Evidence: playtest-guide.md lines 66–68 and 118–133; web-target.md lines 211–224 (hook spec with audioState and buttons).

#### The pixel-art pipeline will produce mush, and the 256 portrait size won't generate
Severity: should-fix
What's wrong: Area filter 1024→32 blurs the generator's uneven pseudo-pixels; 1-px outlines become sub-pixel. Battle sprite sizes contradict ("2x" vs "64x64 or 96x96 master"). Portraits "256 gen" but imagegen2 rejects images under 655,360 total pixels.
Suggestion: Prompt for sprite "drawn on a 48x48 pixel grid, chunky pixels"; detect grid, downscale by that factor nearest-neighbour, quantize, redraw 1-px Bark outline from alpha. Map sprite is master; battle sprites 2x nearest upscale. Portraits generated at 1024x1024.
Evidence: asset-guide.md step 5 ("downscale ... nearest-neighbor"); imagegen2/generate.cjs line 344 ("Total pixels must be between 655360 and 8294400").

#### Army battle hotkeys collide with each other and with global keys
Severity: should-fix
What's wrong: Node letters A–J clash with E (ability), F (speed), M, P. Tab cycles squads but also opens camp and moves browser focus. Space pauses in RTS but is confirm elsewhere.
Suggestion: Node labels skip Q W E R F M P (A B C D G H J K L N S T), or digits; or abilities on Z X C V. Catch Tab in army battles; camp menu unavailable there.
Evidence: GAME_DESIGN.md controls table, Flintcomb's 10 nodes.

#### The Wonderland size puzzles and Oz cracking tiles have no rules, so softlocks are likely
Severity: should-fix
What's wrong: Potion stock, size reset on map change, what blocks Grown Bramble, large-sprite collision/depth sorting all unspecified. China Country "some tiles crack" is the whole spec.
Suggestion: Potions from unlimited refilling sources; size resets on every map change; per-tile passability flag per size (small-only, normal, big-only). A cracked tile drops you to the area entrance with a crunch, never a dead end. A tiny per-map reachability check (search over position x size) proves every door reachable; runs in the play-test.
Evidence: judgment.

#### The isometric engine's hard parts aren't specified: height picking, multi-tile props, large sprites
Severity: should-fix
What's wrong: Heights 0–3, click A*, and big props (Toad Hall, Emerald gate, Winkie tower, Munchkin house) with no footprint. Multi-tile depth sorting, click picking on raised tiles, 48-px characters overlapping tiles are unaddressed.
Suggestion: Every prop has footprint (w x h tiles) and baseline tile, sorted by (x+y) of front-most footprint tile plus height. Buildings > 2x2 sit on map edges or are cut into one-tile-wide vertical strips. Clicks test top faces from height 3 down to 0, nearest first. Characters sorted at their foot tile, height tiebreak.
Evidence: judgment.

#### anim8gen can't safely invent Bramble's back view, and every other character has only one facing
Severity: should-fix
What's wrong: hop-ne from a down-right anchor is a new camera view; anim8gen says it's not for four-direction sprite packs. Others mirrored front-only, so enemies chasing upward face the camera. Design never says whether the party follows Bramble on the map.
Suggestion: Make static `spr-bramble-back` (up-right) with imagegen2 from the anchor, check it, use it as anim8gen reference for hop-ne. For others, accept front-only facing and say so: NPCs don't walk away from camera, enemies use a code hop. State whether party is shown on the map.
Evidence: anim8gen/2026.11.3/anim8gen/SKILL.md lines 16–18 and 146–150.

#### RPG balance and shared data files are left to separate chapter helpers
Severity: should-fix
What's wrong: No stat growth curves for 15 members to level 30, no XP curve, no stats for ~40 enemy types at 3 strengths. Shared data files every chapter edits; ids and flag names will collide.
Suggestion: Single stat formula in the bible (stat = base x (1 + level x growth), enemy tiers as multipliers) plus XP table, and a small Node balance script that simulates each boss with expected party/level/gear and asserts 8–15 turns. Each chapter owns its files (`data/ch3/enemies.js`), merged by an index; flags prefixed by chapter.
Evidence: judgment.

#### At the 1024x640 window in the definition of done, whole-number scaling gives 1x
Severity: nice
What's wrong: 640x360 at 1024x640 → 1x with big borders.
Suggestion: Fractional nearest-neighbour scale when whole-number would be < 2, or a 480x270 logical resolution (2x at 1024 wide).
Evidence: web-target.md line 50.

#### Art and sound director findings

#### The pixel pipeline mixes pixel sizes and will wipe out the outlines
Severity: must-fix
What's wrong: Sizes disagree: battle sprites "same art at 2x ... reduced to a 64x64 or 96x96 master"; portraits "64x64, shown at 2x"; spr-bramble "1024 gen, 96 master, 32 map" (96→32 is 3x, not 2x). Portraits at 2x would have pixels twice the size of sprites beside them. Reducing 1024→32 with an area filter and quantizing to ~48 colours blurs the promised 1-px dark outlines into smears and speckle. Backdrops pushed through the same 48-colour palette will band.
Why it matters: Mixed pixel sizes are the clearest sign of assembled generated parts; breaks "isometric pixel art" on every screen.
Suggestion: One rule: every image is drawn 1:1 on the 640x360 canvas at its native size. Map rabbits 32 px; battle sprites a separate 64 px reduction from the 1024 source; portraits 64 or 96 px drawn 1:1 (or on the UI canvas at a declared whole-number multiple). After reducing/quantizing, a Pillow step redraws a 1-px Bark (#3E2A1E) outline from the alpha mask. Backdrops get their own per-world ~32-colour palette, or are reduced without quantizing.
Evidence: GAME_DESIGN.md art direction and asset table (sizes contradict). Check: `python3 -c "from PIL import Image; Image.open('a.png').resize((32,32), Image.BOX).save('t.png')"`.

#### The asset list is missing several speaking bosses, a quarter of the enemies and every army-only recruit's face
Severity: must-fix
What's wrong: (a) Wicked Witch of the West, Knave of Hearts, Moth Queen, the Nightmares of Deepdelve and Flintcomb have no sprite or portrait; Chief Weasel has a portrait but no sprite. (b) Text says "24 enemy types" but the list names 31 non-boss types. (c) "every recruit has a face..." yet army-only recruits (Hedgehogs, Otters, Carollers, Card Gardeners, Flamingos, Moon Hares, Emerald Guard, White Rabbit's Heralds, Mastodon Herd) have no source sprite for the code-built squads and no portrait. (d) Missing: key-item icons (Old Key, Depths keys, silver shoes, Golden Cap, Jade pestle, Pip's button, Ninefold's dandelion); the Shallows mural; the ichthyosaur/plesiosaur seen far out; the Cook, Bill the Lizard, Guardian of the Gates, China Princess, Ninefold's cousin (shopkeeper).
Suggestion: Add spr-boss rows for Witch, Knave, Moth Queen, Chief Weasel, 2 Nightmares (Nightmares anchored on Hollow Rabbit and Raider sprites); fix the enemy count; a sprite plus 64-px portrait per army-only squad leader; an ico-key sheet; bg-mural (nanogen); sea-monster silhouette layer. Minor NPCs can share generic portraits.
Evidence: GAME_DESIGN.md; count enemy names against "24".

#### The budget is already over before retries, and its unit prices aren't in the tools' docs
Severity: must-fix
What's wrong: $21.40 vs $20 before ~25 missing assets. imagegen2 docs give no prices; nanogen default (Nano Banana 2.1) has no listed price. Reference images add input tokens. Music has no retries included.
Suggestion: Re-cost the corrected list. Use `--model gpt-image-2.5-flare` (~4x cheaper) for enemies, props, icons, minor NPCs; 2.6 for anchor, party sprites, portraits. Pin nanogen to `gemini-3.1-flash-image` at 1K ($0.034 listed). Music 60 s per track, only the 13 "must" tracks first. Enemies in sheets of 4. Keep ≥$2 reserve for anchor and hero portraits.
Evidence: imagegen2/2026.11.6/imagegen2/reference.md line 22 ("About 4x cheaper"), lines 171–172 (no prices); nanogen/2026.11.6/nanogen/SKILL.md lines 406–418.

#### The finale music can't be made the way it's described
Severity: should-fix
What's wrong: "Each held stone adds a beat ... music builds in layers"; m-finale "builds into the main theme"; m-peace "the main theme". audiogen makes single mixed tracks from text: no synced stems, can't reproduce m-title's melody.
Suggestion: Build layers in code: 2–3 thump sfx (soft single, deeper double, warren-drum hit) scheduled in Web Audio at fixed BPM over a drone bed (generated or the Hum loop), one layer per held stone. On victory crossfade into m-title. Drop m-peace; use m-title.
Evidence: audiogen/2026.11.6/audiogen/SKILL.md lines 84–100.

#### No target in-game image ties the code-drawn tiles to the generated props
Severity: should-fix
What's wrong: Code tiles, imagegen2 prop sheets and nanogen backdrops; nothing settles the look of a whole exploration screen. Generated props won't sit on a strict 2:1 grid; no footprint or pixel size for any prop.
Suggestion: Right after the anchor, make one mock screenshot with nanogen (the downs at 640x360 with Bramble, anchor as reference). Derive code-tile colours and dither density from it, use it as second reference for every prop sheet. Give each prop a footprint in tiles and target height in px; include "2:1 isometric, same angle as the reference" in every prop prompt.
Evidence: judgment.

#### Bramble's up-right hop has no back-view reference, and the rest of the cast doesn't hop
Severity: should-fix
What's wrong: Anchor faces down-right; hop-ne needs a back view; anim8gen inventing it will drift. Every other character is code-bob only with front views mirrored, so a raider walking away still shows its face.
Suggestion: Make a static back-view Bramble (imagegen2, anchor as reference), animate hop-ne from it. Add a back view and one 4-frame hop for the generic rabbit base used by warren rabbits, raiders and freed rabbits (~2 animations, ~$1). Cut anim-monkey-fly to pay for it.
Evidence: anim8gen/2026.11.3/anim8gen/SKILL.md lines 134–146.

#### The "eyes go from pale blue to brown" moment has no asset plan
Severity: should-fix
What's wrong: Tansy, Aster, Barley, Quarry, Chert and raiders need both eye states; the list has one sprite and portrait each.
Suggestion: After quantizing, eyes use one reserved palette index (e.g. "Eye" #6B4A2E); code swaps it to pale blue (#BFE3F0) for the Hum-taken state on sprite and portrait. Prompts must ask for clearly drawn eyes.
Evidence: judgment.

#### Icons at 16 px from sheets of 16 won't be readable
Severity: should-fix
What's wrong: 60 icons in 4x4 sheets reduced to 16x16; 45 gear pieces will blur into lookalikes.
Suggestion: 24x24 for item/gear icons, 16x16 for HUD glyphs. 3x3 sheets, one slot type per sheet. Show gear tiers with a code tint or corner pip, cutting unique gear icons to ~20.
Evidence: judgment.

#### Several actions in the design have no sound
Severity: should-fix
What's wrong: Missing: china tile cracking, splash and Witch melting, pepper sneeze, the Old Key turning, the whisper saying Bramble's name, Choir speaking, item use, buying, equipping, party swap, flee, RTS squad clash loop, Lidenbrock storm and waves, geyser, moving roots, thump layers. No ambience for River Bank water, Moon, depths drips. Hum-taken warrens all get cozy m-warren.
Suggestion: Add ~15 sfx (~$2). Make the whisper as a short audiogen `voice` line, breathy whisper. For taken warrens, play m-warren low-passed and slowed in code with the Hum loop on top.
Evidence: audiogen SKILL.md lines 135–144 (sfx `--loop`).

#### Text appears inside two generated images
Severity: nice
What's wrong: prop-journey '"A.S." carved rock' is the route puzzle; chapter cards "with a frame" need titles in code.
Suggestion: Generate a plain carved rock, draw "A.S." in code as an overlay. Same for chapter-card titles.
Evidence: asset-guide.md "No text or logos in images".

### Round 1 outcomes (refiner)

| Finding | Severity | Outcome |
|---|---|---|
| P1 RTS node letters clash | must-fix | Fixed: reserved keys; node labels A S D G H J K L Z X C V; mouse-first orders |
| P2 Grid-relative arrows | should-fix | Fixed: screen-relative movement; "Grid keys" option |
| P3 Attack too late | should-fix | Fixed: 4 required talks; tremor at ~2 min; attack 4–6 min in |
| P4 No recruit moment | should-fix | Fixed: recruit card, sting, banner row, friend appears at home |
| P5 Recruits without quests | should-fix | Fixed: 25-row recruits table; Lion and Scarecrow scenes |
| P6 Chapter times | should-fix | Fixed: Wonderland 6 areas; Moon 25 min; ~4–4.5 h |
| P7 "Weak" army battles | should-fix | Fixed: required recruits = Even (checked by tools/rts-balance.mjs); rally after 2 losses |
| P8 Finale wall | should-fix | Fixed: stones weaken shapes; timer pauses; RTS 4 teaches holding |
| P9 Prologue RTS teaches nothing | nice | Fixed: guided 3-prompt scene |
| P10 "Attack"; Pip gap | nice | Fixed: "Tussle"; Pip trains with Comfrey and Yarrow |
| B1/A2 Missing sprites | must-fix | Fixed: complete inventory |
| B2 RTS sim unspecified | must-fix | Fixed: full rules, stat tables, damage floor, sim-based odds |
| B3 Solutions fake input; hook gaps | must-fix | Fixed: web-target hook; real-input solutions; orders keyed to tick |
| B4/A1 Pixel pipeline | must-fix | Fixed: tools/pixelize.py; 1:1 native sizes; outline redraw; 1024 portrait sheets |
| B5 Hotkeys | should-fix | Fixed (with P1) |
| B6 Size puzzles / cracking tiles | should-fix | Fixed: tile flags, refills, reset; tools/reach.mjs |
| B7 Iso engine rules | should-fix | Fixed: projection, footprints, sorting, picking |
| B8/A6 Back view | should-fix | Fixed: static back view first; others front-only with code hop |
| B9 RPG balance, data ownership | should-fix | Fixed: formulas, tables, tools/balance.mjs, per-chapter files |
| B10 1024x640 scale | nice | Fixed: fractional nearest-neighbour below 2x |
| A3 Budget | must-fix | Fixed: 2.5-flare for bulk, low quality, sheets, nanogen 3.1 flash 1K; $18.54 + $1.46 reserve |
| A4 Finale music | should-fix | Fixed: code-scheduled thump layers over a drone; crossfade to m-title |
| A5 No target screen | should-fix | Fixed: nanogen mock screen after anchor; prop footprints |
| A7 Eye colour change | should-fix | Fixed: eye pixel positions recorded; code recolours |
| A8 Icons | should-fix | Fixed: 24px gear, 3x3 sheets, tier tint |
| A9 Missing sounds | should-fix | Fixed: full action-to-sound table |
| A10 Text in images | nice | Fixed: "A.S." and titles in code |

Decision: must-fix findings existed, so round 2 runs.

## Round 2

Between rounds the person raised the budget to $50 and said the budget is the least important part; the refiner was told to put quality first.

Reviewers: Player, Builder, Art and sound director. 29 findings (4 must-fix, 19 should-fix, 6 nice). 28 fixed, 1 partly not changed (party followers on the map; Talk tab and banters added instead).

#### Player findings

#### The army battlefield is bigger than the screen, and there is no way to look around it
Severity: must-fix
What's wrong: RTS maps ~48x48 → ~1536x768 logical px vs a 640x360 view. No scroll, zoom, minimap, edge-scroll, drag-pan or camera key; WASD unusable (A S D are node letters, W an ability).
Why it matters: can't plan what you can't see; off-screen waves; can't press letters for unseen nodes; RTS 4 and 5 need both ends on screen.
Suggestion: Either (a) smaller fields (~24x24, fits 640x360 at 1x), or (b) arrow-key and middle-drag panning, edge-scroll, a clickable corner minimap with every node, squad and incoming wave, and a key that centres on the selected squad; arrows free of other RTS jobs. Add "every node visible or reachable by minimap" to definition of done.
Evidence: GAME_DESIGN.md RTS controls/reserved keys, 48x48 field, RTS screen, projection formula.

#### Pluck never comes back between fights, so battles turn into Tussle spam
Severity: should-fix
What's wrong: Skills cost 4–10 PL; Bramble starts with 12; nothing restores Pluck after a win; nibbling restores Heart only.
Suggestion: Restore ~30% max Pluck to the party after each win (or full after a fight under 4 rounds); nibbling restores a little Pluck. balance.mjs simulates a whole dungeon run to catch Pluck starvation.
Evidence: design lines on nibbling, Guard, skill costs, items.

#### You can't tell which way enemies face, and sneaking has no rules
Severity: should-fix
What's wrong: Back-attack bonus but all non-Bramble sprites show front view. "Sneak past the giant shepherd" has no rules.
Suggestion: Show facing in code (chevron/arc under each map enemy). Define the sneak: the shepherd turns his head on a visible fixed rhythm, sees a faint ground cone of N tiles; being seen gently resets you to the last tall-mushroom hiding spot; some tiles count as cover. Add to segments and solutions.
Evidence: design.

#### The party you care about is invisible during play
Severity: should-fix
What's wrong: Only Bramble on the map; companions speak only at story points; no way to talk to your party, no banter.
Why it matters: "a party you care about" and "plenty of dialog"; roster becomes a checkbox.
Suggestion: A "Talk" tab in camp and at every rest stone, 1–2 lines per party member per area that change with who else is in the party; one HUD bubble per member on entering each new map; pair banters (Toad & Badger, Ninefold & Cheshire Cat, Tansy & Bramble). Line budget in BIBLE.md.
Evidence: design.

#### Moving up or down the screen is slow and zigzags
Severity: should-fix
What's wrong: 0.22 s/hop; vertical travel ~36 px/s, half horizontal; sprite flips each hop. Crossing a 56x56 map vertically ~25 s.
Suggestion: Shift to run (0.14 s/hop) or ramp up after 3 held hops; on a vertical zigzag keep facing constant and draw the bob as one smooth line; or move a whole diagonal pair per beat.
Evidence: arithmetic from the projection.

#### Nothing says how many buttons you earn, or how gear works for the bench
Severity: should-fix
What's wrong: Prices given; income only "3*L per enemy" plus chests. Unclear if gear moves between members or reserves fight ungeared. balance.mjs assumes gear the player may not afford.
Suggestion: Expected button income per chapter, checked in balance.mjs against the gear it assumes. Gear moves freely, "auto-equip best" button. Bigger reward chests on each recruit's quest.
Evidence: design.

#### The finale's story moment is over in about two rounds
Severity: should-fix
What's wrong: Every member can Tell a Story, each a fifth → 2 rounds. Memories fixed; nothing reflects optional content; nothing shown on screen.
Suggestion: One story per round (whoever acts first, or Bramble only). Each memory plays a 3–5 s vignette: backdrop crossfades to that world, the friend says a line; the Eye answers each. Memory list drawn from what this player earned (optional recruits add choices). Unlosable but weighty.
Evidence: design.

#### The 75-minute first chapter has no "home strikes back" moment until its end
Severity: nice
Suggestion: Lookout odds step visibly from Weak toward Even as each recruit joins ("4 of 7 squads"). After the River Bank, a small scripted return home: Ratty and Badger help Burdock clear one tunnel; a captured rabbit's message arrives.

#### More squads than number keys in late army battles
Severity: nice
What's wrong: Cap 10–12 + Echoes, hotkeys 1–9 and 0.
Suggestion: Control groups (Ctrl+digit), or clickable squad list with Shift-click to add.

#### Builder findings

#### The army triangle is broken: Wing loses to Stout under the design's own formula
Severity: must-fix
What's wrong: `DPS = max(0.3A, A*M*(0.5+0.5*hp/maxHp) - D)` with Stout 120/10/6, Wing 70/11/2: defence subtracted after the matchup cancels the 1.5x. Simulated 1v1: base Wing vs base Stout → Wing wiped in 19.5 s, Stout left 2%; Flamingos vs Diggers → Stout 23%; Flamingos vs Quarrymen → Stout 44%; Winged Monkeys vs Quarrymen → Stout 10%; on hilltop/fortified Stout keeps 25%/42%. Other edges work (Stout vs Swift Stout 78%; Swift vs Wing Swift 78%).
Why it matters: The triangle is the strategy layer; RTS 2 "flyers punish Stout" and the Lookout advice become wrong; RTS 4 teaches the opposite.
Suggestion: Defence as a multiplier, e.g. `A*M*hpF * 10/(10+D)` with the 0.3A floor; or raise Wing Atk / lower Stout Def. Duel test in rts-balance.mjs asserting every triangle edge wins with ≥30% HP left at base values and against the strongest Def multiplier (Quarrymen 1.3, fortified 1.5).
Evidence: a throwaway duel sim script (not kept).

#### The RTS field is ~2.4 screens wide with no scroll; Reinforce and ability targeting have no controls
Severity: should-fix
What's wrong: 48x48 ≈ 1536x768 px on 640x360; no pan, minimap, edge-scroll; WASD unusable. Reinforce has no key/button. Moonlight, Monkey Drop, Tunnel need targets but only "Q W E R". Left-click both selects and orders.
Suggestion: Arrow keys and edge-scroll pan; clickable minimap. Reinforce on a key (e.g. T, removed from node letters) and a button. Abilities: key, then click or letter a node/squad; Escape cancels. Orders right-click only; left-click only selects.

#### The recorded solutions won't replay exactly
Severity: should-fix
What's wrong: Polling rtsState().tick from playwright then pressing Space lands a few ticks late, varying per run. Map enemies wander/chase in real time; wall-clock input timelines differ run to run.
Suggestion: Make the game deterministic for input: map enemies step only when Bramble hops (or on fixed sim ticks); add a player-facing RTS "auto-pause every N seconds / on contact" option solutions can use. Solutions as state-gated steps ("press until state().battle", "wait for node C ours, then order"); RPG battles pick commands from battleState() and buttons().
Evidence: playtest-guide.md "Timed play"; web-target.md debug-hook section.

#### Warren bosses and Hum-taken enemies are 2–3 levels above the party when met
Severity: should-fix
What's wrong: Aster 15 / Silverdown raiders 14 right after Shallows 10–11; Barley 19 / raiders 18 after Drowned Halls 15–16; Quarry 24 after Stair 20–21. +25–40% stat gap.
Suggestion: Re-level by play order: Silverdown ~12 / Aster 13; Wheatsheaf ~17 / Barley 18; Flintcomb ~22 / Quarry 23. balance.mjs uses the expected party level at that point in play order.

#### balance.mjs's simple AI can't fight the mechanic bosses; bosses have no base template
Severity: should-fix
What's wrong: Queen's "Off with—" needs Guard; Watcher needs eyes hit; Choir needs a mouth silenced; Witch needs water; Tidewarden untargetable submerged; Eye needs Tell a Story. AI does none. No base template per boss. RTS 1 "required recruits" depends on whether the Shallows came first (Ninefold).
Suggestion: Each boss gets a template and a scripted counter policy in balance.mjs; assert "wins with the counter" and "loses or takes > 15 rounds without it". Run RTS 1 balance with and without the Polite Dark.

#### Several one-off mechanics have no rules; escorts contradict "only Bramble is shown"
Severity: should-fix
What's wrong: Kalidah "tree-bridge chase battle"; sneak past the giant shepherd; escorts (hedgehog lads, Rumble); Mole's scent markers.
Suggestion: One follower rule (NPC trails Bramble's previous tile, front view, code hop, never blocked; warps to him if separated). Deterministic sneak: fixed-cycle gaze on marked tiles; seen → back to zone start, nothing lost; reachability check covers it. Kalidah chase = normal battle with a 3-round "bridge falls" timer, or scripted. Scent markers = marked tiles in sequence.

#### Depth sorting is wrong for long props
Severity: should-fix
What's wrong: Key = prop's largest (x+y); a 3x1 tea table on (5,5)-(7,5) gets 12, Bramble at (5,6) gets 11.5 → table paints over him. Affects tea table, mural wall, tree-bridge (walked on), raft (walked on), 2x1 logs and car.
Suggestion: Cut every multi-tile prop not on a back edge into one-tile-wide strips. Walkable props (bridge, raft) are ground tiles with height, not props.

#### The asset list is still missing a few story things; sfx count off by one
Severity: should-fix
What's wrong: No pig-baby (Cheshire quest), wildcat (Field Mice quest), Munchkins, disguised Toad; no source for enemy squads Pigeon Riders, Rooks, Quarrymen; Wick has a portrait but no map sprite; sfx is 36 not 35.
Suggestion: Pig and wildcat in a sheet slot; Munchkins and disguised Toad as code recolours (or generated); Pigeon Riders from the Pigeon, Rooks from Crow of the West, Quarrymen from Hum-taken Digger warmed; Wick from Lantern Moth + tint. sfx 36.

#### MP3 loops and silence-split packs are fragile; ask for PCM
Severity: nice
Suggestion: Generate loops and packs with `--output-format pcm_44100`, wrap as WAV with Python's `wave` module; split packs offline into separate files and check before shipping; fall back to one generation per variant.
Evidence: audiogen SKILL.md lines 144–154 (sfx accepts pcm_*, rejects wav_*). MP3 padding gap is general knowledge, untested here.

#### Mirroring and half-size scaling damage Bramble's sprite
Severity: nice
What's wrong: Bramble's one flopped ear swaps sides when mirrored. Small Bramble at half size nearest drops pixels and outline.
Suggestion: Symmetric ears, or accept the flip. Run a 16-px small Bramble (and hop frames) from the 1024 sources.

#### Art and sound director findings

#### 1. The pixel pipeline's sizes contradict each other
Severity: must-fix
What's wrong: Style line "chunky pixels as if drawn at about 48 pixels tall"; targets 32 map / 64 battle. Step 2 grid-reduces first: 64-px battle sprites would need upscaling from ~48; 32-px map sprites get a 1.5x box reduction of a pixel grid that smears clusters, eyes, outlines. Kits (24) and big creatures (48/96) hit the same mismatch.
Suggestion: Drop "48 pixels tall"; use "chunky pixel art, large clean pixel clusters, bold simple shapes". Step 2 only when the result is still ≥2x the target; else box-reduce straight from 1024. A check failing any sprite whose eye pixels vanish at 32 px. Check each world's first sheet at 1x and 3x before making the rest.
Evidence: GAME_DESIGN.md style line, size table, pipeline.

#### 2. Props that the mechanics and story need are missing; big worlds get very few props
Severity: must-fix
What's wrong: No chest or sign prop. Underway has three carved doors (river, keyhole, eye-stair); only an eye door listed. No art for the Golden Cap cupboard, Barley's bell, star-stones, Elevenfold's stall. Interiors with no furniture: Badger's kitchen fire, Toad Hall banquet, Duchess's kitchen, trial court, Moon Palace, Emerald City throne room, Winkie castle, Field Mice's court. Moon (25 min) has 4 props; Oz (32 min) has 8.
Suggestion: ~8 more prop sheets: shared (chest closed/open, signpost, river door, keyhole door); interiors for Willows (hearth, banquet table), Wonderland (cauldron, courtroom bench), Moon (palace screen, moon-hare burrow), Oz (green throne, cupboard), Root (ruined burrow arch, Elevenfold's stall); key objects (Golden Cap, bell, star-stone, Saknussemm rock). Recheck every place in Chapters against the prop list.
Evidence: design.

#### 3. Several sprites break the one-pixel-size rule
Severity: should-fix
What's wrong: Small Bramble halved nearest-neighbour loses eyes/outline; Mastodons "Rumble at 1.3x" (non-integer); Grin "one big Cat"; exceptions list contradicts.
Suggestion: Make each odd size from the 1024 source through the pipeline: small Bramble at 16 (and his hop frames), Mastodons 62, big Grin 64. Big Bramble at 2x nearest is the only deliberate exception.

#### 4. Music loops will audibly restart
Severity: should-fix
What's wrong: Generated tracks build in and wind down; a short crossfade sounds like restarting every 60 s.
Suggestion: "continuous, steady, no intro, no ending, no fade-out" in every music prompt. Per-track `loopStart`/`loopEnd` on AudioBufferSourceNode in a data table tuned by ear; crossfade inside the window. Spend music retries on tracks whose seams can't be fixed.
Evidence: audiogen SKILL.md "Loop Caveat".

#### 5. Sound-effect packs split on silence are fragile; count off by one
Severity: should-fix
What's wrong: sfx model takes only a prompt; won't reliably give N variants with clean silences in order; reverb bridges gaps; crit depends on slice order. Table lists 30 effects + 6 loops = 36, not 35; with 8 retries $5.28.
Suggestion: audio.js checks slice count against expected and falls back to the whole file at varied pitch. Crit hit is its own effect. Fix count to 36 and re-total.

#### 6. Battle backdrops aren't tied to the sprite palette and may swamp the sprites
Severity: should-fix
Suggestion: Quantize each backdrop to master palette + that world's ramp (sky exception kept). Backdrop prompts add "soft, low-contrast, muted, simple shapes, empty foreground". Code applies slight value compression/haze behind sprites. Test the first battle backdrop with three sprites before making the other 17.

#### 7. All 15 party members and every boss have a single pose in battle
Severity: should-fix
Suggestion: One "action" pose per party member: edit each party sheet with imagegen2 `--image` ("the same four characters, same order, mid-action pose"), pipeline at battle size, swap in during the lunge. (Director note: budget is now $50 and quality-first; consider fuller treatment.)

#### 8. Ten named home rabbits and every freed warren's rabbits share 3 faces
Severity: should-fix
Suggestion: Code fur palette swaps (5–6 ramps: grey, sandy, dark, piebald, cream) and optional accessory overlay (scarf, ear notch) on sprite and portrait, as data per rabbit.

#### 9. Some assets invite garbled text, numbers or card symbols
Severity: nice
Suggestion: Prompt "blank tag", "blank card face", "abstract swirl, not letters"; draw card numbers/suits and bottle/cake labels in code; also the sealed door's sign.

#### 10. Music mood mismatch in the Wild Wood; long stays on 60-s loops
Severity: nice
Suggestion: Wild Wood plays m-riverbank at 0.85 low-passed with the wind loop (or its own track). m-oz and m-army 90 s.

### Round 2 outcomes (refiner)

| Finding | Severity | Outcome |
|---|---|---|
| P1/B2 RTS field bigger than screen; no camera, Reinforce or ability targeting | must-fix | Fixed: fields 20–32 tiles; arrow pan, edge-scroll, middle-drag, C/V centring, minimap, edge arrows; T = Reinforce; ability key then target; left-click selects, right-click orders |
| P2 Pluck never returns | should-fix | Fixed: +30% after each win, +3% per nibble; dungeon-run balance check |
| P3/B6 Enemy facing; sneak, escorts, Kalidah chase, scent trail | should-fix | Fixed: facing chevron; deterministic gaze-cycle sneak; one follower rule; 4-round bridge counter; scent tile sequence |
| P4 Party invisible | should-fix | Fixed: Talk tab, map-entry bubbles, pair banters. Not changed: followers on the map |
| P5 Slow zigzag vertical movement | should-fix | Fixed: hop ramp to 0.16 s; straight-line vertical drawing, steady facing |
| P6 Button income; bench gear | should-fix | Fixed: income table checked ≥1.1x; free gear moves; auto-equip |
| P7 Finale story too quick | should-fix | Fixed: one story per round, vignettes, optional memories, Eye replies |
| P8 Ch1 home moment | nice | Fixed: "Squads ready n of m"; home scene after River Bank |
| P9 Squad hotkeys | nice | Fixed: clickable list, Shift-add, B all |
| B1 Wing loses to Stout | must-fix | Fixed: defence divides (10/(10+D)), M 2.0/0.5; duel sim tri2.py: edges 87% / 85% / 56%, worst case 21% (confirmed by the director) |
| B3 Replays not exact | should-fix | Fixed: turn-stepped map enemies; state-gated solutions; RTS auto-pause option |
| B4 Warren bosses over-levelled | should-fix | Fixed: re-levelled by play order |
| B5 Balance AI vs mechanic bosses | should-fix | Fixed: boss templates and counter policies, with/without assertions |
| B7 Long-prop depth sorting | should-fix | Fixed: strips for all non-back-edge multi-tile props; walkable props as ground |
| B8/A5 Missing story sprites; sfx count | should-fix | Fixed: all added; 42 one-shots + 7 loops, no packs |
| B9 MP3 loops | nice | Fixed: loops as PCM→WAV; music loop windows |
| B10/A3 Ear flip; small Bramble; odd sizes | nice/should-fix | Fixed: four true facings; 16/32/64 from 1024 sources; no exceptions |
| A1 Pipeline sizes | must-fix | Fixed: style line fixed; conditional grid step; eye-pixel check; first-sheet check |
| A2 Missing props | must-fix | Fixed: 29 prop sheets; every place checked |
| A4 Music seams | should-fix | Fixed: no-intro/outro prompts; per-track loop windows; loop tuner |
| A6 Backdrops vs palette | should-fix | Fixed: palette quantize, low contrast, haze, first-backdrop test |
| A7 Single battle pose | should-fix | Fixed: action poses for all fighters; Cheshire and Witch animations |
| A8 Clone rabbits | should-fix | Fixed: fur ramps and accessories |
| A9 Text in images | nice | Fixed: blank prompts; labels in code |
| A10 Wild Wood music; short loops | nice | Fixed: m-wildwood; 120 s long-stay tracks |

Decision: the two rounds the settings allow are done. The round-2 findings are fixed; the director checked the army balance sim and the budget ($44.88 planned + $5.12 reserve of $50). Final read against the brief's "what they asked for" checklist: every item is in the design.
