# Change: Epilogue, "Digging the Other Way"

A short optional chapter after the ending. Bramble helps Flintcomb rebuild: dig new homes up toward the sky instead of down toward the Sleeper. Playtime is 15 to 25 minutes, with no new threats and no required fights. The main ending stays the ending: `g_won`, the credits and the sunset scene are not touched. The epilogue is post-game wandering with a purpose, and it ends in a small stone-setting and a feast, not a second set of credits.

## 1. When and how the player finds it

- **Available** when `g_won` is set. Players with an old save (saved on `c5-sunset` after the credits) get it as soon as they load.
- **The hook.** Shale of Flintcomb (the doe Bramble woke in Ch4, who says "I'm Shale!") waits on Sorrel Down a few hops from the warren mouth (entry `warren`, 19,20). This is the first thing the player sees after the sunset door drops them at `c0-warren` mouth. A `once` trigger strip around the exit has her call out ("Bramble! Over here!", plus an `!` emote). If the player talks to her, she hands over a flint slate scratched by Quarry: *"BRAMBLE. COME DIG. UP THIS TIME. BRING THE BIG ONE. Q."* After that she hops off east (`s.move`, then `s.remove`), and the quest becomes "Go east to Flintcomb."
- **Backups.** A quest entry "Flintcomb's Rebuilding" (shown when `g_won`) reads "Someone from Flintcomb is waiting outside Thimblebank on Sorrel Down." Yarrow's ch6 home line also points the way ("Flintcomb's sent for you. Go on. I'll come down at the end; my knees insist on the end.").
- **Arrival.** The first visit to `c4-flintcomb` with `c6_invited` set shows a chapter card: `s.chapterCard('Digging the Other Way', 'Epilogue', 'bg-battle-downs')`, with `s.chapter(6)`. Then the opening scene runs (section 2).

## 2. The story

**Why Flintcomb needs rebuilding.** For a year the Hum had Flintcomb dig one thing: the hole. To feed the spiral they quarried out their own nursery, larder and burrows and heaped the spoil on the quarry floor, where nothing grows. Since the ending, the whole warren has slept in the bare spiral round the hole. The hole only purrs now, but nobody wants their kits sleeping beside it. Quarry's line from Ch4 ("Put it right. That's just digging the other way.") becomes the plan: dig new homes up and sideways into the downs, toward the sky.

**Who's there.**
- Captain Quarry runs the work and is loud again. He is played as an NPC or from the party (see the both-ways rule below).
- Old Knapper cuts the stone. He is deaf, and he feels the Sleeper's purr through his feet: "Put a stone where everyone can feel it."
- Chert and Shale are there, along with 4 to 6 generic Flintcomb rabbits.
- Two new characters: **Gault**, the last digger, a dark buck who can't stop digging at the lip, and **Chip**, his kit.
- Friends come to help. They appear when they aren't travelling with Bramble:
  - Burdock and Quarry keep up their digging rivalry: "Up, mind."
  - Mole spring-cleans in autumn, whitewash bucket in hand: "Whitewash! Oh, bother whitewash! No, whitewash is lovely, actually."
  - Badger: "Build on what's left. My city did."
  - Rumble does the heavy lifting.
  - A Wheatsheaf buck brings Barley's hay-cart of straw for bedding.
  - A Silverdown doe brings Aster's pigeons.
- Yarrow comes for the end.

**The both-ways rule.** Quarry, Rumble, Pip and Tansy may be travelling or not. Lines are always spoken with their own speaker id. When one of them isn't travelling, staging uses an NPC `c6-<id>` (mapAdd, cond `c6_started && !travelling().includes(id)`) or an escort with the same sprite. Every scene must work both ways.

**Opening scene** (surface, about 2 minutes). Quarry shows Bramble the bowl: spoil heaps, kits in scrapes, the half-begun new doorway in the west bank. "We dug the wrong way for a year. Now we dig the right way, and I want the rabbit who started all this ending to start the beginning." This opens four tasks in any order, except that task C opens after task B.

**Task A: The spoil heaps** (hauling with an escort, surface, 3 to 4 minutes)
- There are three heaps on the surface: (10,22), (24,19) and (16,6).
- Bring Rumble, either travelling or as the escort `c6-rumble` you get by talking to him. Then use the tile beside each heap.
- Each heap gets a 6 to 10 line beat: Rumble shoves, `s.shake`, the `rumble` sfx, and the spoil rattles away down the chute toward the hole ("Every barrow-load back where it came from. A hundred years, give or take," which echoes Flick's post-game line).
- Each heap leaves a bare chalk patch with stakes.
- Flags: `c6_heap1` to `c6_heap3`, then `c6_heaps_done`.

**Task B: The old rooms** (the small puzzle, new map `c6-upburrow`, 4 to 5 minutes)
- The new burrows break into the remains of Flintcomb's pre-Hum rooms, but the Hum took the plan out of Quarry's head.
- In the hall stands a tally-stone carved by Quarry's grandmother (a use-trigger on `prop-carved-rock`). It gives three clues:
  - "Nursery where the morning comes in" (the alcoves lit by the sun shaft).
  - "Larder where the chalk weeps" (a damp stain drawn in `drawGround`).
  - "Den by the warm" (beside the old hearth).
- There are eight flint alcoves. At each, Bramble uses the tile and thumps (the thump animation). Hollow alcoves boom (`thump-2`, low pitch); solid ones go "thock" (`hit-1`), and Pip or a companion makes a joke. Wrong guesses cost nothing.
- A hollow alcove leads to a short dig scene with Burdock or Quarry. The rubble goes, the room lights, and a Flintcomb family moves in.
- Flags: `c6_room_nursery`, `c6_room_larder`, `c6_room_den`, then `c6_rooms_done`.

**Task C: The last digger** (talking round plus an escort, `c4-warren` and `c6-upburrow`, 3 to 4 minutes)
- Gault stands at the lip (about 21,13) and scrapes at the edge out of habit: "My paws don't know how to stop."
- Talking to him only gets tone choices.
- In the new nursery, Chip won't sleep there without his dad. Escort Chip (`s.escort('c6-chip', true, {sprite:'rabbit-kit', kid:true})`) down the spiral to the lip.
- Chip asks him to dig a bed up in the nursery instead. Bramble picks a tone ("He needs you up there." / "Dig with him, not for it."). If `c4_needle` is set, Bramble shows him Quarry's needle: "It points home. Home's up now."
- Gault's paws stop. Both move to the nursery (NPCs with conds).
- Flags: `c6_gault_met`, `c6_gault_done`.

**Task D: Seed for the bowl** (gathering, Sorrel Down and Flintcomb's west downs, 4 minutes)
- Hob says dandelions "grow where nothing else will".
- Pick five dandelion clocks: three on `c0-downs` and two on the Flintcomb downs strip. These are props with `cond: !picked` and use-triggers. The quest counts "n of 5".
- With all five, Bramble blows them over the cleared patches from the quarry's west ledge. The scene uses narration and `shimmer`, with Ninefold's line if he's travelling ("A small sun, given away five times").
- Sprout props then appear on the cleared patches; patches not cleared yet get them when they're cleared.
- Flags: `c6_clock1` to `c6_clock5`, then `c6_sown`.

**Optional beat: Tansy's pen** (about 1 minute, if Tansy is travelling or standing at Flintcomb). At the old flint pen where she was held, she pulls out the first stone and asks for it to become a ring kits race round. The ring is reused fence and rim-stone props (`c6_pen`). It's not required.

**No combat.** An optional "friendly tussle" was considered and dropped. There is no un-Hummed rabbit enemy type (diggers and raiders carry Hum bars), and a fight cuts against what the epilogue is about.

**Closing: the Top Stone and the feast** (3 minutes, opens when tasks A to D are done)
1. Quarry: "Knapper's finished." Fade, then the crowd at the lip in `c4-warren`: Quarry, Knapper, Chert, Shale, Gault and Chip, Flintcomb rabbits, whichever helpers aren't travelling, and Yarrow (spawned for the scene).
2. The stone is a Thump Stone for the top of the world: `prop-thump-stone` at about (19,12), carved "Dig no deeper. Thump if you're lonely."
3. A gentle interactive set piece: three `s.ask('bramble', ..., ['Thump.'])`. Each one gets a bigger sound (`thump-1`, then `thump-2`, then `warren-drum`), a shake, and crowd bubbles.
4. The hole answers with a purr (low hum ambience, `wake-chime`). Yarrow: "There. It heard. Sleeping like a kit."
5. Fade to the surface at dusk. The patches bloom (`prop-dandelions`), there's a feast spread, and the music is `m-sunset`.
6. Memory picture: `s.picture('bg-epilogue', [3 captions])`.
7. Then `s.remember('mem-flintcomb')`, the keepsake, `g_c6_done`, `s.save()`, and the quest goes back to "Peace on the Downs. Wander, and talk to everyone."
8. Afterwards, using the stone replays the thump and offers to view the picture again.

## 3. Where, and how the maps change

The epilogue reuses `c4-flintcomb` and `c4-warren` through ch6 `mapAdds` (npcs, props, doors, triggers, all on `c6_*` conds) and adds one new map.

**Change to get right:** prop and NPC conds are read only when a map loads. After setting a flag, either re-warp to the same map under a fade (`s.warp(mapId, x, y, facing)`) or splice `s.ex.map.props` / `actors`. Without that, changes stay invisible until the player re-enters the map.

| Stage (flag) | `c4-flintcomb` (surface) | `c4-warren` | `c6-upburrow` |
|---|---|---|---|
| `c6_started` | Helpers' camp: hay-cart, wash bucket, lanterns; new `prop-flint-doorway` in the west bank at about (2,10), door at about (4,11) to `c6-upburrow`; music `m-warren`, Hum ambience off | Hum ambience off, music `m-warren`; Gault at the lip | Rooms dark behind rubble |
| each `c6_heapN` | Heap gone; `prop-sprout-patch` bare-stakes variant, or sprouts if sown | | |
| `c6_sown` | Sprouts on the cleared patches | | |
| each `c6_room_*` | Kits playing on the surface (one per room) | | Rubble gone, room lit and furnished, family in |
| `c6_gault_done` | | Lip empty except the rope | Gault and Chip in the nursery |
| `g_c6_done` | Dandelions in bloom, feast spread, crowd with "after" lines | Top Stone at the lip | Everyone home |

**New map `c6-upburrow`, "The New Burrows".**
- About 24x18, `world: 'warren'` (warm), with a flint legend copied from `ch4/common.js`.
- An entrance stair from the surface door leads into a long sunlit hall. The sun shaft is drawn in `drawOver`.
- Eight flint alcoves with use-tiles. Three of them hide rooms behind: the nursery (`prop-nursery-nest` x2, `prop-moss-bed`), the larder (`prop-cellar-baskets`, `prop-herb-rack`) and Quarry's den (`prop-hearth`, `prop-settle`, `prop-lantern`).
- Undug rooms are floor tiles that the `blocked(x,y)` hook shuts until their flag is set, with `prop-rubble` (cond) in their mouths. `drawOver` darkens them until dug.
- Map fields: `music: 'm-warren'`, `ambience: [['hearth', 0.3]]`, area `flintcomb`.
- Check with `node tools/reach.mjs` (or a manual walk) and screenshots.

**The hole stays open.** The Top Stone must not block ch4's `c4.climb` trigger at (18,13) or the rest stone at (12,18). Post-game wandering below still works, which keeps Yarrow's "the key in the lock" idea.

## 4. Rewards

- **Memory:** `mem-flintcomb` ("Five warrens and a mastodon, digging upward", friend `captain-quarry`, bg `epilogue`). It is stored, and an `eye` line is given for completeness, but the Dream is over. The picture is the real reward, and it can be viewed again at the stone.
- **Keepsake key item:** `knappers-flint`, "Knapper's Flint: a little heart knapped from Top Stone chips. Warm when the hills purr." It reuses `ico-chalk-pebble`. It's one line in `core/items.js` `KEY_ITEMS`.
- **No cosmetic.** The engine has no cosmetic slot, and adding one is out of scope.
- **Bestiary:** `gault`, `chip`, `shale`, plus an updated `knapper` line.
- **Places:** "The New Burrows".
- **Quests:** "Flintcomb's Rebuilding" (the umbrella, next step) and one each for A to D, each with live `step()` text and counts.
- **Talk:** extra `talk.flintcomb` lines (cond: epilogue running), `enter.c6-upburrow` bubbles, and three pair banters: burdock-quarry-2 ("up"), mole-badger (whitewash), pip-rumble (kits sitting on him).
- **Home lines:** `home.<id>.ch6` for all 14 home rabbits, two states each (during and after). Before `c6_started` they fall back to `home.<id>.ch5` (the ch2/ch3 pattern), so ch5's after-ending lines aren't lost. Penny's 'It came up!' sack and Hob's drainage get a callback.

## 5. Data: `game/src/data/ch6/`

```
index.js     export default { maps, scripts, mapAdds, speakers, bestiary, memories, banter, quests, places, segments }
maps.js      c6-upburrow (hooks: blocked, drawGround stain, drawOver shaft/dark)
scripts.js   c6.invite, c6.arrive (onEnter wrapper via trigger), c6.heap, c6.clock, c6.sow, c6.alcove, c6.tally,
             c6.gault, c6.chip, c6.pen, c6.stone, c6.closing, c6.upburrow.enter, c6.<npc> talk
adds.js      mapAdds on c0-downs (Shale, invite trigger, 3 clocks), c4-flintcomb (helpers, doorway+door, patches,
             sprouts, feast, 2 clocks, triggers), c4-warren (Gault, Top Stone, crowd)
extra.js     bestiary, memories, banter, quests, places, home.<id>.ch6
segments.js
```

`c4-flintcomb` has its own `onEnter` (`c4.flintcomb.enter`), so the arrival scene is a `once` trigger strip at the west entry (cond `c6_invited && !c6_started`). Speakers to add: `shale` (por `generic-doe`), `gault` (`generic-buck`), `chip` (`generic-kit`), and `c6-*` stand-ins mapped to the real portraits.

**Interface with ch5:** ch6 reads only `g_won` and `g_ch5_done`. It sets only `c6_*` and `g_c6_done`. It doesn't change ch5's visitors, the sunset or the ending.

**Edits outside `ch6/`** (small and listed; replay the regressions in section 7 after them):
1. `data/index.js`: add `'ch6'` to `CHAPTERS`.
2. `data/ch0/home.js`: the `newest()` loop starts at 6 instead of 5.
3. `screens/pause.js`: add `'Epilogue'` to `CH`, so saves don't read ": Flintcomb".
4. `data/ch4/flintcomb.js`:
   - Give the three surface spoil heaps `cond: () => !flag('c6_heapN')`.
   - Make `ambience` and `music` getters on `c4-flintcomb` and `c4-warren`, so the Hum loop is off once `c6_started` (arguably once `g_won`) and the music is `m-warren`.
5. `data/ch4/extra.js` (optional polish): ch4's home Quarry and Rumble get `&& !(flag('c6_started') && !flag('g_c6_done'))`, so they aren't in two places during the epilogue.
6. `data/core/items.js`: the keepsake line.

## 6. Assets ($20 budget; planned about $0.90)

Reused at no cost:
- All characters: Quarry, Rumble, Chert, Knapper (`quarryman`), Yarrow, the party, `rabbit-*` with fur.
- Portraits (`por-generic-*`) and `prop-thump-stone` (the Top Stone).
- Props: rubble, nursery-nest, moss-bed, hearth, settle, cellar-baskets, herb-rack, lantern, hay-cart, wash-bucket, fence, rim-stones, dandelions, carved-rock.
- `bg-battle-downs` (the card), music `m-warren` / `m-downs` / `m-sunset`, sfx thump-1/2, warren-drum, rumble, wake-chime, shimmer, hit-1, scamper.

New images, made through the existing pipeline (`art-src` to `tools/pixelize.py`, with entries added to `tools/sizes.py`; style line and anchor refs from `design/ART_BRIEF.md`):

| ID | What | Tool | Size | Est. |
|---|---|---|---|---|
| bg-epilogue | Closing memory picture: Flintcomb's quarry bowl at dusk, dandelions on the chalk, a clover feast; rabbits of every warren, Rumble with kits on his back, Quarry laughing, a new flint doorway in the bank, lanterns | imagegen2 high | 1536x1024 to 640x360 | 2 tries, $0.70 |
| prop sheet "rebuild" (4) | `prop-flint-doorway` (2x2, h 28: burrow mouth framed in knapped flint, round wooden door, lantern); `prop-sprout-patch` (2x1 ground: chalk patch, stakes, green shoots); `prop-feast-spread` (3x1 ground: cloth with clover heads, carrots, cakes); `prop-dandelion-clock` (1x1, h 10: seed clocks) | imagegen2 low | 1536x1024 sheet | 3 tries, $0.18 |

Not planned, but available: a working-song music track `m-rebuild` (audiogen, 120 s, $0.60) if `m-warren` feels too sleepy for the work. Log the spend in `design/ASSETS.md` under a new "Epilogue" table. The running total would be about $39.46 of $50; this change's own $20 is barely touched.

## 7. How to test

- **Segments** (appended after ch5, so existing `goToLevel` indices don't change). All three are level 28 with everyone recruited. Flags: ch5 `FLAGS4` plus `g_c5-rts5_won`, `g_c5_dream_done`, `c5_sunset_arrived`, `g_won`, `g_ch5_done`. Active party `['tansy','burdock']`, so Quarry, Rumble and Pip go through the NPC/escort branch.
  - `c6-bowl`: start `c0-downs` (19,21). Invitation, arrival, heaps, clocks, sowing. Done: `c6_heaps_done && c6_sown`.
  - `c6-burrows`: start `c4-flintcomb` west. Rooms puzzle, Gault. Done: `c6_rooms_done && c6_gault_done`.
  - `c6-stone`: start `c4-flintcomb`, all task flags set. Done: `g_c6_done`.
- **Solutions:** `design/solutions/c6-*.json`, replayed with `bash tools/play.sh c6 design/solutions/<id>.json`. They use walk, talk, talkthrough, and `press` for use-tiles.
- **Both-ways run:** replay `c6-bowl` and `c6-burrows` once more with `active: ['rumble','pip']` (a scratch copy of the segment), so the "travelling" branch is proven too.
- **From a real g_won save:**
  1. With `ch6` left out of `CHAPTERS`, replay `c5-ending` and save to a slot.
  2. Add ch6, reload, and load the slot. Check that Shale is visible, the quest shows, and Flick and the other ch5 visitors are unchanged.
  3. Play the epilogue by hand to the end, saving and reloading mid-task. Escorts live in the save, and props must reflect flags after the reload.
- **Chained run:** a `c6-full.json` file with segment `c5-ending`, its steps followed by all c6 steps, and a final `until` on `g_c6_done`.
- **Regressions after the outside edits:**
  - Replay `c4-rts4`, `c4-quarry`, `c4-hole`, `c4-root`, `c5-ending`.
  - The console must be clean: `loadData` throws on duplicate ids.
  - Check the save label reads "Epilogue".
  - Check the climb rope at the lip still works after `g_c6_done`.
- **Screenshots:** `design/screenshots/ch6-{bowl-before,bowl-after,upburrow,lip-stone}.png`. Read them: nothing in walls, doorway readable, stone not hiding the rope.

## 8. Risks

- **Edits outside `ch6/`** break the one-folder rule. They are six and tiny. Regressions are covered above.
- **Load-time conds.** A missed re-warp leaves changes invisible until the player re-enters the map. Test each task's visible change in the same visit.
- **Party-state branching.** Quarry, Rumble, Pip and Tansy may or may not be travelling, which risks duplicate sprites or a missing actor. Use one `who(id)` helper and the both-ways test run.
- **Tone drift.** Keep it small and warm: no new threat, the Hum stays a purr, nothing fills or seals the hole, and there are no second credits. Avoid contradicting ch5 visitors (Flick's "filling in the hole, a hundred years") and ch4 home lines (Penny's sack "came up", which can be the first patch).
- **Placement on ch4 maps:** the doorway on the west downs, Gault and the stone at the lip, clocks on `c0-downs` near the ch5 visitors and ch4's Knapper and Rumble. Use ch4's `placed()`/`freeSpot` pattern for anything on other chapters' maps, and check with screenshots.
- **Scope creep:** friend cameos and banter can balloon. Cap the epilogue at 4 tasks, 1 optional beat, and about 250 lines of dialog.
