# Warren Peace: story bible and builder's guide

This is for everyone writing a chapter. Read it whole, then `design/GAME_DESIGN.md` (your chapter's parts, the Cast, Recruits table, the RPG and army sections). The engine is done; chapters are **data modules** in `game/src/data/<chapter>/index.js` (split into more files under that folder as you like, imported from your index.js).

## 1. Voice and rules

- **Cozy-epic, all ages.** Warm, funny, kind; the eerie thread is genuinely eerie but never gory or hopeless. Nobody is killed or hurt on screen: Hum-taken rabbits are *woken*, depth creatures *fade*, storybook foes are *sent packing*, worn-out friends *rest*.
- **Original work.** Nothing from Watership Down: no names, rabbit words, plot or lines. Storybook characters follow the ORIGINAL books (Grahame 1908, Carroll 1865, Baum 1900: silver shoes, not ruby; Verne 1864). Quote the books only a little (a famous line here and there is fine: "Off with her head!", "We're all mad here", "Poop-poop!"); write everything else fresh, in their voice.
- **Bramble** (the player): a young brown buck, curious, kind, a bit too brave; short lines. At key moments the player picks his reply (tone only, never the plot): `s.ask('bramble', ...)`.
- **Dialog style:** short lines (most under 140 characters; the box fits about 3 lines of ~70 characters), lots of them. Every named character has at least two sets of lines (before and after their story beat). Characters remember things; friends tease each other. Each recruit's joining is a little story with a big moment (the recruit card).
- **Party voices:** Burdock: gruff, few words, soft-hearted, "Hmph." Tansy: quick, sharp-tongued, loyal, teases Bramble. Pip: tiny, asks questions, loses things, brave by the end. Old Yarrow: gentle, cryptic, funny, half-blind. Mole: earnest, easily delighted, homesick. Ratty: easy-going, poetic, loves the river. Badger: gruff, wise, hates Society, kind to the young. Toad: boastful, impulsive, generous, "Poop-poop!". Cheshire Cat: amused, riddling, vanishes mid-sentence. Caterpillar: languid, curt, "Who are YOU?". Ninefold: very formal, delighted by everything ordinary, never met anyone who didn't scream ("I have never been offered a dandelion before. I will keep it forever."). Jade Rabbit: serene, generous, a little lonely. Tin Woodman: tender-hearted, weeps (and rusts), careful never to hurt anything. Captain Quarry: once cheerful head digger, now guilty and grimly determined ("I dug the hole. I'll walk it."). Rumble: a mastodon calf, speaks in short trumpety bursts and feelings, loves Bramble.
- **The Hum** (the creature's bad dreams leaking up): Hum-taken rabbits forget their names, eyes go pale blue, they hum and want to dig deeper. The **Undersleeper** sleeps beneath everything; it isn't wicked. The Long Thump rhyme: "When all the warrens thump as one, the Sleeper's dream is soft and done."

## 2. A chapter module

```js
// game/src/data/ch1/index.js
import maps from './maps.js';           // split however you like
export default {
  maps: { 'c1-depths': {...}, ... },    // map ids are prefixed by chapter: c0-, c1-, c1w-, c2-, ...
  scripts: { 'c1.badger.talk': async (s, actor) => {...}, ... },   // ids prefixed c1. etc.
  encounters: { 'c1.weasels-1': {...} },
  shops: { 'c1.ratty-shop': {...} },
  rts: { 'c1-rts1': {...} },            // army battles
  speakers: { 'chief-weasel': { name: 'The Chief Weasel', por: 'chief-weasel' } },  // extra speakers (core has most)
  bestiary: { mole: 'A homesick, earnest mole...' },   // one or two lines per character met (camp Bestiary)
  memories: { 'mem-river': {...} },     // story memories for the finale
  banter: { 'talk.riverbank': [...], 'enter.c1-riverbank': [...], pairs: [...] },
  quests: [ { title, show: () => bool, done: () => bool, step: () => 'next step' } ],
  places: [ { name: 'The River Bank', map: 'c1-riverbank', cond: () => s.flag(...) } ],
  mapAdds: { 'c0-warren': { npcs: [...], props: [...], triggers: [...] } },   // add to other chapters' maps
  segments: [ {...} ],                  // the play-test's levels, see section 9
};
```
Import helpers: `import { flag, setFlag, hasItem, hasMember } from '../../state.js';` and `import { G } from '../../core.js';` (G.s is the save). Everything else goes through the script API `s`.

## 3. Maps

```js
'c1-riverbank': {
  name: 'The River Bank',            // shown on entry and in saves
  world: 'willows',                  // palette: downs, warren, depths, willows, wonder, moon, oz, journey, flint, corn, silver
  area: 'riverbank',                 // Talk area id (camp Talk lines), shared by the maps of one place
  music: 'm-riverbank',              // or a function returning an id; null = silence; undefined = keep playing
  ambience: [['river', 0.4]],
  battle: 'riverbank',               // default battle backdrop for map enemies' encounters (bg-battle-<id>)
  dark: 0,                           // 0..1 darkens tiles and adds a vignette (depths 0.3-0.6)
  sky: '#123',                       // background colour behind the map (else the world's sky)
  merge: false,                      // true: the two companions tuck into Bramble on this map (size puzzles, shepherd, china)
  low: false,                        // true: big Bramble can't be here (indoor Wonderland rooms)
  tiles: [ '....~~~', ... ],         // one string per row (y); one char per tile (x). Up to 56 x 56.
  heights: [ '0000111', ... ],       // same shape; digits 0-3 (walls add 3 on top). Optional.
  legend: { 'Q': { k: 'path', walk: 1 } },   // optional extra chars
  entries: { start: [x, y, 'se'], river: [x, y, 'nw'] },   // named arrival points (doors and warps use them)
  props: [ ['prop-willow', x, y], ['prop-boat', x, y, 2, 1], { id: 'prop-tree-bridge', x, y, w: 3, h: 1, ground: true }, { id, x, y, cond: () => bool } ],
  npcs: [ { id: 'ratty', x, y, facing: 'sw', talk: 'c1.ratty.talk', cond: () => !flag('g_recruit_ratty') } ],
  enemies: [ { id: 'w1', type: 'weasel', x, y, loop: [[x,y],[x2,y],[x2,y2]], encounter: 'c1.weasels-1', facing: 'sw' } ],
  doors: [ { x, y, to: 'c1-wildwood', entry: 'south' }, { x, y, to: 'c0-downs', entry: 'warren', cond: () => bool, locked: () => bool, lockedRun: async s => s.say(...) } ],
  triggers: [ { x, y, w: 1, h: 1, run: 'c1.weir', once: true, cond: (ex) => bool }, { x, y, use: true, run: ... } ],
  chests: [ { id: 'c1', x, y, give: { buttons: 50, dandelion: 2 } } ],
  entry: [x, y, 'se'],               // for china maps: where a broken tile sends Bramble back to
  onEnter: 'c1.riverbank.enter',     // script run on every arrival (check flags inside); omit = companion bubble only
  // optional hooks (functions): update(ex, dt), onHop(ex, x, y), drawGround(ex, c, ox, oy), drawOver(ex, c, ox, oy),
  //   drawBack(ex, c), blocked(x, y, ex) -> bool, onNibble(ex, tile), gazeState(ex) -> object (shown in state().gaze)
}
```
**Legend (default):** `.` grass, `,` clover (nibble), `;` sweetgrass (nibble, rare), `G` grass you can nibble, `_` path, `x` chalk, `e` earth, `f` floor, `m` moss, `r` root floor, `w` wood floor, `k` checker floor, `n` snow, `d` moon dust, `b` yellow brick, `u` blue grass, `g` emerald, `y` yellow, `p` poppies, `z` sand, `q` flint, `v` corn (cover), `a` rock floor, `j` bone, `o` carved stone, `c` china (cracks!), `s` small-only tile (mouse holes, under tables), `h` hedge (only big Bramble steps over), `t` floor with a high shelf (put a trigger there with `cond: ex => ex.size === 'big'`), `~` water (blocked), `L` lava (blocked), `#` wall (tall block, blocked), `%` rock wall, space = nothing (void, the sky shows).
Palette kinds that exist per world are in `game/src/data/core/palette.js`; a missing kind falls back sensibly.

**Coordinates:** x runs down-right on screen, y runs down-left. Row strings are y; character index is x. A map 30 wide is 30 characters. Tiles more than one height level apart block a hop.
**Prop footprints** (w x h tiles; give w,h for anything bigger than 1x1): see the Props table in GAME_DESIGN.md "Asset list" (e.g. hollow-log 2x1, warren-entrance 2x2, toad-hall 4x2, tea-table 3x1, munchkin-house 2x2, giant-mushroom 2x2, wonder-mushroom 2x2, cassia-tree 2x2, winkie-tower 2x2, emerald-gate 3x1, palace-gate 3x1, rabbit-house 3x1, mural-wall 3x1, eye-stair 2x2, fallen-rock 2x2, raft 2x2 ground, tree-bridge 3x1 ground, weir-logs 2x1 ground). Props block their tiles unless `ground: true` (walkable pieces drawn flat) or `walk: true`. Put big buildings on a map's back edge (small x+y) with `whole: true` so nothing walks behind them.
**People:** any character with a map sprite can stand on a map; generic rabbits use `sprite: 'rabbit-buck' | 'rabbit-doe' | 'rabbit-kit'` with `fur: 'brown'|'grey'|'sandy'|'dark'|'cream'|'ginger'|'silver'`, and `hum: true` gives pale Hum-blue eyes; `look: 'hollow'` makes a Hollow Rabbit. Facing: 'se' (down-right), 'sw', 'ne', 'nw'.
**Map enemies** move one step per Bramble hop (loop, chase within 4, give up beyond 7); touching starts the encounter; beaten ones stay gone until the map is left by a door... (they stay gone for the rest of the session for that map). `once: true` = beaten for good (story fights), `still: true` = doesn't move, `zone: [x0,y0,x1,y1]` keeps it in a box, `noChase: true`.

## 4. The script API (`s`)

Scripts are `async (s, actor) => {...}`. Every call that shows something is awaited.
- `await s.say(who, text, {mood, listener, voice})` — `who` = speaker id (party ids, 'yarrow', 'white-rabbit', ...; null = narration). `mood: 'worried'|'happy'` for Bramble.
- `await s.ask(who, text, ['choice 1', 'choice 2'])` → index. `await s.narrate(text)`.
- `s.bubble(who, text, secs)` — a speech bubble over a follower (no wait).
- `s.flag(k)`, `s.set(k, v=true)`, `s.val(k)`; `s.has(item)`, `s.count(item)`, `s.take(item, n)`; `await s.give({buttons: 30, dandelion: 2, 'old-key': 1})` (shows "Got ..."), `s.give(x, 1, true)` quietly; `s.member(id)` (in party?), `s.party()` (travelling ids).
- `s.quest('one line: what to do next')` — the quest line at the bottom. Keep it current at every step.
- `await s.recruit(id, {line, level})` — party members join the party (and army); army-only recruits (white-rabbit, seven-of-spades, chert, aster, wick, barley, scarecrow, cowardly-lion, mouse-queen, monkey-king) join the army. Shows the recruit card. Then they follow Bramble if travelling.
- `await s.battle(encounterId, {canLose})` → 'win' | 'fled' (a loss without canLose puts the party back at the last door with "Up you get" and ends the script). Bosses: retryable by talking/stepping again.
- `await s.army(rtsId, {guided})` → 'win' | 'lose' | 'back'.
- `await s.shop(shopId)`, `await s.rest()` (heal, save; rest stones), `s.heal()`.
- `await s.warp(mapId, entryName | x, y, facing)` — rabbit-hole iris to another map (or the same, to reposition).
- `await s.fadeOut()`, `await s.fadeIn()`, `await s.wait(secs)`, `s.shake(secs, amt)`, `s.sfx(id, {vol, pitch})`, `s.music(id)`, `s.voice(id)`, `s.ambience(id, vol)`.
- Staging: `s.actor(id)` ('bramble' too), `await s.move(id, [[x,y],...], hopSecs)`, `s.face(id, 'sw' | {x,y})`, `s.place(id, x, y, facing)`, `s.hide(id)`, `s.show(id)`, `s.spawn({id, sprite, x, y, facing, talk})`, `s.remove(id)`, `s.emote(id, '!' | '?' | 'heart')`.
- `s.setSize('small'|'normal'|'big')` → true if it worked; `s.size()`. Size resets to normal on every map change.
- `s.escort(id, true|false, {sprite, kid})` — someone follows Bramble (first in line, before the companions); `s.escorting(id)`.
- `await s.picture(bgId, ['caption 1', 'caption 2'], {skippable})`, `await s.chapterCard('Chapter 1', 'The Depths of Thimblebank', bgId)`, `await s.ending()`.
- `s.remember(memoryId)` — adds a finale memory. `s.chapter(n)`, `s.save()`, `s.toast(text)`.
- `s.ex` is the exploration scene (advanced: `s.ex.map`, `s.ex.b`, `s.ex.size`, `s.ex.shake()`, `s.ex.hAt(x,y)`, `s.ex.map.actors`).
The player can't move while a script runs. Use `once: true` triggers or flags so story events happen once.

## 5. Battles

```js
'c1.weasels-1': { enemies: [['weasel', 6, 0], ['stoat', 6, 0]], bg: 'wildwood' },        // [type, level, tier 0|1|2]
'c1.chief-weasel': { enemies: [['chief-weasel', 9], ['weasel', 7]], bg: 'riverbank', boss: true, intro: ['"Who goes there?"'], music: 'm-boss' },
```
Fields: `enemies`, `bg` (bg-battle-<id>: downs, warren, depths, riverbank, wildwood, wonder-garden, wonder-hall, shallows, moon, drowned, oz-road, emerald, winkie, stair, lidenbrock, mushroom, root, dream), `backdrop` (full bg id, e.g. boss-tidewarden, boss-eye), `boss`, `story` (no fleeing), `flee: 'always'` (Thimblebank Depths), `first` (party acts first), `intro` (lines), `xp`, `buttons` (extra), `noSwap`, `dream` (finale), `onRound(sim, G)` (return events like `[{t:'say', text}]`; may set `sim.result = 'win'`), `counter(sim)` → text shown in the turn bar (e.g. 'The bridge creaks: 3'), `tweak(enemies)`.
**Enemy types:** see `game/src/data/core/enemies.js` (ENEMIES and BOSSES). Boss mechanics are built in by id: chief-weasel (summons), queen-of-hearts (+ knave), choir (use THREE `['choir', 12]` entries = three mouths), aster, moth-queen, tansy-taken, tidewarden, barley, wicked-witch (give the party `water-pail` items before: each splash = a third of her Heart), watcher, captain-quarry-boss, hollow-rabbits (four of them), nightmare-deepdelve, nightmare-flintcomb, undersleeper-eye (`dream: true`).
**Levels:** follow GAME_DESIGN "Target levels" (Prologue 1-3, Depths 3-5, River Bank 5-8, Wonderland 7-10, Shallows 10-11, RTS1/Great Burrow 11, Silverdown 12 (Aster 13), Moon 13-15, Drowned 15-16, Wheatsheaf 17 (Barley 18), Oz 17-20, Stair 20-21, Flintcomb 22 (Quarry 23), Journey 23-25, Root 25-26, Finale 26-28). 2 enemies early, up to 4 later; normal fights 3-6 rounds; bosses one level above the area. Put enough visible map enemies on the main path that a player fighting most of them arrives at the boss at about its level (XP per enemy = 9 x level, bosses x5, times the level catch-up 1 + 0.3 per level the foes stand above, 0.25x-2x; the XP curve is `55*L^1.4+60`; check with `node tools/curve.mjs`: its 'real' column is the main path, enemies on or next to the full playthrough's route + 20% of the rest). Buttons: 2 x level per enemy plus chests; follow the Button economy table. Balance: `node tools/balance.mjs --all` (bosses 8-15 rounds with the counter AI, plain AI worse; every map's fights 3-6 rounds as a whole-dungeon run).
**Quick balance check:** `node tools/battle-check.mjs` (section 9).

## 6. Army battles

```js
'c1-rts1': {
  name: 'The Battle of Sorrel Down', sub: 'Take back the warren mouth and hold it for 10 seconds.',
  size: 28, cap: 8, world: 'downs', home: 'home', mouth: 'mouth',     // node ids
  required: ['thimblebank-rabbits', 'thimblebank-diggers', ...],      // squads the required recruits give
  nodes: [ { id: 'home', kind: 'home', x: 3, y: 24, owner: 'player' }, { id: 'ridge', kind: 'hilltop', x: 8, y: 15 }, ..., { id: 'mouth', kind: 'warren', x: 24, y: 4, owner: 'enemy' } ],
  // kinds: home, warren (their mouth), clover, hilltop, burrow, fortified, plain, thump; dark: true = spawn edge (not orderable)
  paths: [ ['home', 'ridge'], ... ],          // length = tile distance unless given as a third number
  cover: { nodeId: true }, coverPaths: [['a','b']],   // corn
  hold: ['mouth', 'lip'],                     // RTS4: hold all of these 10 s (default: the mouth)
  enemy: { tier: 0.8, guards: [{ sq: 'diggers', node: 'burrow' }], waves: [{ at: 60, sq: ['raiders'], route: ['clover', 'ridge', 'home'] }] },
  //   or for the finale: every: 8, cycle: ['drift','weight','flicker'], spawnAt: ['dark1','dark2','dark3'], hunt: true
  thump: true,                                 // the finale's rules
  prompts: [ { text: 'Click your squad...', cond: rts => rts.sel.size > 0 }, { text: '...', wait: true } ],   // tutorial
  onStart(rts) {}, update(rts, dt) {},         // hooks (rts.S is the sim; rts.S.result = 'lose' to end)
}
```
Enemy squads: raiders, diggers, lookouts, pigeon-riders, rooks, quarrymen, drift, weight, flicker. Player squads: `game/src/data/core/squads.js`. Abilities come from freed warrens automatically. The Lookout Stone (ch0) launches each chapter's battle (section 8). **Balance:** required recruits only, no army gear → "Even"; with optional recruits and gear → "Strong". Check with `node tools/rts-check.mjs <rtsId> <squad...>` (section 9).

## 7. Shops, Talk, quests, memories

- Shop: `{ name, keeper: 'ratty', line: 'Welcome aboard!', gear: ['sling+1', 'waistcoat+2', 'courage-ribbon+1'], items: ['clover-bunch', 'dandelion'], army: 1 }` (gear ids are `<base>+<tier>`, bases in `game/src/data/core/items.js` GEAR_BASES; `army` = highest army-gear rank sold; gear/army may be functions). Tiers per GAME_DESIGN shop list.
- Talk (camp Talk tab and rest stones): `banter['talk.<area>'] = [{ who: 'mole', line: '...', cond }]` (1-2 lines per party member who could be travelling in that area; write for everyone who might be there). Map-entry bubbles: `banter['enter.<mapId>'] = [{ who: 'ratty', line: 'Short!' }]` (1-2 per map, several different speakers). Pair banters: `banter.pairs = [{ id: 'toad-badger-1', a: 'toad', b: 'badger', area (optional), cond, lines: [['toad', '...'], ['badger', '...'], ...] }]` (4-6 lines).
- Quests: `{ title: 'Ratty\'s boat', show: () => flag('c1_metRatty'), done: () => flag('g_recruit_ratty'), step: () => 'Shove the logs off the weir.' }`.
- Memories (finale stories): `{ title: 'The river', friend: 'mole', line: 'Mole saw the river for the first time...', eye: 'The Eye remembers water...', bg: 'riverbank', hint: '' }`.

## 8. How the chapters connect (fixed interface: do not change these names)

**Map ids and entries other chapters rely on:**
- `c0-downs` (Sorrel Down, the hub, ch0). Entries: `start`, `warren` (outside the warren mouth), `lookout` (next to the Lookout Stone), `north` (arriving from Silverdown), `west` (from Wheatsheaf), `east` (from Flintcomb). Its north/west/east edges have doors to `c2-silverdown` entry `south` (cond `g_ch2_open`), `c3-wheatsheaf` entry `east` (cond `g_ch3_open`), `c4-flintcomb` entry `west` (cond `g_ch4_open`); closed, they say why. **ch2/ch3/ch4 must provide those maps and entries**, with a door back to `c0-downs` entry `north`/`west`/`east`.
- `c0-warren` (Thimblebank Warren, ch0). Entries: `mouth`, `deep` (by the old sealed door), `great-burrow`. The sealed door (ch0) opens with the Old Key after the Prologue and warps to `c1-depths` entry `top`. **ch1 provides `c1-depths` with entry `top` and a way back up.**
- Underways: `c1-underway` (Thimblebank's, ch1; doors: river → River Bank, keyhole → `c1w-hall` entry `fall` (ch1w), eye-stair → `c1w-shallows` entry `top` (ch1w; sealed until `g_c1_riverbank_done` and `g_c1_wonder_done`)), `c2-underway` (Silverdown's: moon door, drowned stair), `c3-underway` (Wheatsheaf's: cyclone to Oz, the Stair of Eyes), `c4-underway` (Flintcomb's, at the bottom of the hole: way to the Root). Each Underway has entry `stone` and a mossy rest stone (prop-rest-stone) with a use-trigger running `underway.stone` (ch1 writes it: rest, then "Travel to another Underway?" listing every Underway whose flag `g_underway_c1..c4` is set; each Underway map sets its flag in onEnter). ch1w gets back to `c1-underway` entry `keyhole` / `stair`.
- The **Lookout Stone** (ch0, on `c0-downs`) runs the next army battle: the first of `c1-rts1`, `c2-rts2`, `c3-rts3`, `c4-rts4` that exists in the data, isn't won (`g_<id>_won`), and is open (`c1-rts1` after the Prologue; `c2-rts2` when `g_ch1_done`; `c3-rts3` when `g_ch2_done`; `c4-rts4` when `g_ch3_done`). It first shows the preview (odds, "Squads ready"); on a win it sets `g_<id>_won` and runs the script `<id>.won` that the chapter provides (e.g. `c1-rts1.won`: the Great Burrow fight that wakes Chert...). On a loss: "Not like this" encouragement and back at the stone. The Prologue's guided battle `c0-guided` is ch0's.
- **Chapter flags:** `g_ch0_done` (the Old Key given), `g_ch1_done` (RTS1 won and the Shallows done: ch1 sets it when both are true, whichever comes last; ch1w sets `g_c1_shallows_done`), `g_ch2_done`, `g_ch3_done`, `g_ch4_done`, `g_won` (ch5). Freed warrens (army rank and abilities count these): `g_freed_thimblebank` (ch1, after the Great Burrow), `g_freed_silverdown` (ch2, Aster woken), `g_freed_wheatsheaf` (ch3, Barley woken), `g_freed_flintcomb` (ch4, Quarry woken). Open flags: `g_ch2_open` (ch2 sets after RTS2 is won), `g_ch3_open`, `g_ch4_open`. World progress: `g_c1_riverbank_done` (Chief Weasel beaten and all four Willows friends recruited), `g_c1_wonder_done` (Queen's croquet done and the Wonderland recruits in), `g_c1_shallows_done`.
- **Chapter cards:** each chapter shows its own card at its first story moment (ch1: stepping into the Depths the first time; ch2: the first time the player uses the Lookout after `g_ch1_done`, or arriving at Silverdown; etc.). Use the backdrop of the place.
- **Home (Thimblebank) after each chapter:** ch0 places the home rabbits (`yarrow`, `mallow`, `woodruff`, `comfrey`, and `home-1` ... `home-10`) on `c0-warren`/`c0-downs`, each with talk script `home.<id>`. ch0's `home.<id>` script runs the newest of `home.<id>.ch5` ... `home.<id>.ch1`, `home.<id>.ch0` whose chapter has started (chN started = `g_ch<N-1>_done`). **Each chapter writes `home.<id>.chN` scripts** for the home rabbits (a fresh line or two each), and uses `mapAdds` to put its recruits in Thimblebank after they join (Badger by the fire, Ninefold in a dark corner being polite, etc.) with conds. Rescued rabbits (after RTS1) and freed warrens' visitors appear too.
- **Mallow's shop** (`c0.mallow-shop`, ch0) raises its tier each chapter.
- **Memories** (finale stories; each chapter defines its own in `memories` and calls `s.remember(id)` at the moment it happens): main path `mem-river` (ch1: Mole's first sight of the river), `mem-pebble` (ch1: Tansy's chalk pebble), `mem-dandelion` (ch1w: Ninefold's dandelion), `mem-teaparty` (ch1w), `mem-traveller` (ch2), `mem-poppies` (ch3), `mem-mushrooms` (ch4); optional `mem-roses` (ch1w, Seven of Spades), `mem-wick` (ch2), `mem-china` (ch3, the China Princess), `mem-stars` (ch4, Elevenfold).
- **Party at each point** (for segments): Prologue: Bramble (+Burdock mid-battle). After ch1: + Mole, Ratty, Badger, Toad, Cheshire Cat, Caterpillar, Ninefold (+ army: White Rabbit, Chert, Seven optional). After ch2: + Jade Rabbit, Tansy (+ Aster, Wick optional). After ch3: + Pip, Tin Woodman (+ Barley, Scarecrow, Lion, Mouse Queen, Monkey King). After ch4: + Captain Quarry, Rumble. Expected levels at each segment start: see the target levels.

## 9. Segments, solutions and testing

**Segments** (the play-test's "levels"; each chapter writes its own from GAME_DESIGN "Segments"):
```js
{ id: 'c1-riverbank', name: 'The River Bank', map: 'c1-underway', x: 10, y: 12, facing: 'se',      // where it starts
  party: [['bramble', 5], ['burdock', 5]], active: ['burdock'], flags: { g_ch0_done: true, ... }, items: { 'old-key': 1, dandelion: 2 },
  gear: { 'sling+1': 1 }, equip: true, buttons: 200, memories: [], quest: 'Find allies beyond the river door.',
  escorts: [], enter: false, script: undefined,
  done: (s) => s.flags.g_c1_riverbank_done }        // s = the save state
```
`window.__game.goToLevel(n)` sets up that state fresh and drops Bramble at `map`/`x`/`y`.
**Solutions:** for every segment, `design/solutions/<segment id>.json` = `{ "segment": "<id>", "steps": [...] }`, replayed with REAL input by `bash tools/play.sh <session> design/solutions/<id>.json` (prints `{"ok": true, ...}` when the segment's `done` holds at the end). Step kinds are listed at the top of `tools/play.js`: `walk` (click a tile and wait to arrive), `talk` (click a person), `talkthrough` (advance dialog, choosing), `fight` (battle autopilot: real menu input), `army` (army autopilot), `hop`, `hold`, `press`, `button`, `until`, `wait`, `done`. Every battle in a solution is actually fought. Walks go tile to tile by clicking (A* path), so put intermediate `walk`s around obstacles; doors trigger when Bramble steps on them. If the autopilot can't win a fight at the segment's levels, the fight is too hard: rebalance (or raise the segment's levels if they were set too low).
**Testing setup** (shared): the game is served at `http://127.0.0.1:8000/` (already running, caching off; don't start or stop servers). Use your OWN playwright session named after your chapter, from the project root `/workspaces/gg-test3`:
```bash
playwright-cli -s=ch1 open http://127.0.0.1:8000/ ; playwright-cli -s=ch1 resize 1280 720
playwright-cli -s=ch1 reload                       # after edits
playwright-cli -s=ch1 console                      # errors
playwright-cli -s=ch1 eval "JSON.stringify(window.__game.state())"
playwright-cli -s=ch1 screenshot --filename=design/screenshots/ch1-riverbank.png
bash tools/play.sh ch1 design/solutions/c1-riverbank.json
node tools/battle-check.mjs c1.chief-weasel 9 mole:9 ratty:9 badger:9      # quick headless balance of an encounter
node tools/rts-check.mjs c1-rts1 thimblebank-rabbits thimblebank-diggers ...   # army odds headless
```
Close your session when done (`playwright-cli -s=ch1 close`). Look at your screenshots (Read them): maps should look good (props placed sensibly, no characters in walls, paths readable, nothing important hidden behind tall props).
**Rules:** edit only your own chapter folder (`game/src/data/<ch>/`), your solutions (`design/solutions/<your segment ids>.json`) and your screenshots (`design/screenshots/<ch>-*.png`). Never edit the engine (`game/src/*.js`, `engine/`, `world/`, `battle/`, `rts/`, `screens/`, `data/core/`, `data/index.js`) or other chapters. If the engine blocks you, work around it with map hooks or scripts if you can, and list the problem in your report with the exact error.

## 10. Assets you can use

Map sprites (draw with sprite: <name>; back views are picked automatically when walking up): aster, badger, badger-back, barley, bill-lizard, bramble-ne, bramble-nw, bramble-se, bramble-sw, burdock, burdock-back, burrowing-beetle, captain-quarry, captain-quarry-back, card-soldier, caroller, caterpillar, caterpillar-back, cave-lizard, change, chert, cheshire-cat, cheshire-cat-back, chief-weasel, china-princess, cold-ripple, comfrey, cook, cowardly-lion, crow-west, dazed-earthworm, dodo, dormouse, drowned-eye, duchess, dust-hopper, eel-cloud, elevenfold, ferret-sentry, flamingo, flying-teapot, glinda, good-witch, great-head, guardian, hammer-head, hatter, hedgehog, hum-digger, hum-lookout, jade-rabbit, jade-rabbit-back, kalidah, king-of-hearts, knave, lantern-moth, late-footstep, mallow, march-hare, mastodon, mole, mole-back, monkey-king, moon-hare, moon-toad, moth-queen, mouse-queen, moving-carving, moving-root, munchkin, ninefold, ninefold-back, otter, pepper-cloud, pig-baby, pigeon, pigeon-rider, pip, pip-back, quarryman, queen-of-hearts, rabbit-buck, rabbit-buck-back, rabbit-doe, rabbit-kit, raider, raider-back, ratty, ratty-back, rook, root-tangler, rumble, rumble-back, scarecrow, sea-monsters, shepherd, shut-eye, star-thing, stoat, stork, tansy, tansy-back, tin-woodman, tin-woodman-back, toad, toad-back, toad-washerwoman, traveller, trilobite-swarm, watcher, weasel, whisper, white-rabbit, wick, wick-2, wicked-witch, wildcat, winkie, winkie-guard, wizard, wolf-west, woodruff, wu-gang, yarrow

Battle sprites: aster, badger, badger-act, barley, bill-lizard, bramble-se, burdock, burdock-act, burrowing-beetle, burrowing-beetle-act, captain-quarry, captain-quarry-act, card-soldier, card-soldier-act, caroller, caterpillar, caterpillar-act, cave-lizard, cave-lizard-act, change, chert, cheshire-cat, cheshire-cat-act, chief-weasel, chief-weasel-act, china-princess, choir, cold-ripple, cold-ripple-act, comfrey, cook, cowardly-lion, crow-west, crow-west-act, dazed-earthworm, dazed-earthworm-act, dodo, dormouse, drowned-eye, drowned-eye-act, duchess, dust-hopper, dust-hopper-act, eel-cloud, eel-cloud-act, elevenfold, ferret-sentry, ferret-sentry-act, flamingo, flying-teapot, flying-teapot-act, glinda, good-witch, great-head, guardian, hammer-head, hammer-head-act, hatter, hedgehog, hum-digger, hum-lookout, jade-rabbit, jade-rabbit-act, kalidah, kalidah-act, king-of-hearts, knave, lantern-moth, late-footstep, late-footstep-act, mallow, march-hare, mastodon, mastodon-act, mole, mole-act, monkey-king, moon-hare, moon-toad, moth-queen, moth-queen-act, mouse-queen, moving-carving, moving-carving-act, moving-root, moving-root-act, munchkin, nightmare-deepdelve, nightmare-flintcomb, ninefold, ninefold-act, otter, pepper-cloud, pepper-cloud-act, pig-baby, pigeon, pigeon-rider, pip, pip-act, quarryman, queen-of-hearts, queen-of-hearts-act, rabbit-buck, rabbit-doe, rabbit-kit, raider, ratty, ratty-act, rook, root-tangler, root-tangler-act, rumble, rumble-act, scarecrow, shepherd, shut-eye, shut-eye-act, star-thing, star-thing-act, stoat, stoat-act, stork, tansy, tansy-act, tin-woodman, tin-woodman-act, toad, toad-act, toad-washerwoman, toad-washerwoman-act, traveller, trilobite-swarm, trilobite-swarm-act, watcher, weasel, weasel-act, whisper, whisper-act, white-rabbit, wick, wick-2, wicked-witch, wicked-witch-act, wildcat, winkie, winkie-guard, winkie-guard-act, wizard, wolf-west, wolf-west-act, woodruff, wu-gang, yarrow

Props (use exact names): prop-armchair, prop-badger-door, prop-banquet-table, prop-bell-post, prop-boat, prop-bones, prop-brick-bits, prop-button-shelves, prop-carved-pillar, prop-carved-rock, prop-cassia-tree, prop-caucus-rock, prop-cauldron, prop-cellar-baskets, prop-chalk-boulder, prop-chest, prop-chest-open, prop-china-house, prop-city-column, prop-corn-stook, prop-crater-rock, prop-dandelions, prop-ditch-rock, prop-door-eye, prop-door-keyhole, prop-door-river, prop-dovecote, prop-dresser, prop-drink-stand, prop-drowned-column, prop-elevenfold-stall, prop-emerald-gate, prop-eye-stair, prop-fallen-rock, prop-fence, prop-flint-wall, prop-geyser-vent, prop-giant-mushroom, prop-giant-root, prop-glass-table, prop-glow-crystal, prop-golden-cap, prop-gorse, prop-green-throne, prop-hare-burrow, prop-hawthorn, prop-hay-cart, prop-heart-throne, prop-hearth, prop-hedge, prop-herb-rack, prop-hollow-log, prop-hoop-card, prop-jury-box, prop-lantern, prop-lantern-mushroom, prop-lantern-tree, prop-lookout-stone, prop-mole-end-door, prop-mortar, prop-moss-bed, prop-motor-car, prop-mouse-throne, prop-munchkin-fence, prop-munchkin-house, prop-mural-wall, prop-node-burrow, prop-node-clover, prop-node-flag, prop-nursery-nest, prop-oz-tree, prop-palace-gate, prop-palace-screen, prop-pool-rock, prop-poppies, prop-rabbit-house, prop-raft, prop-ratty-hole, prop-reeds, prop-rest-stone, prop-rim-stones, prop-root-pillar, prop-rose-bush, prop-rubble, prop-ruin-arch, prop-ruin-seat, prop-scarecrow-pole, prop-sealed-door, prop-settle, prop-signpost, prop-snow-stump, prop-snow-tree, prop-spoil-heap, prop-star-rock, prop-star-stone, prop-stone-face, prop-stone-mouth, prop-store-counter, prop-storyteller-seat, prop-stove, prop-table, prop-tea-table, prop-thump-stone, prop-tiny-door, prop-toad-hall, prop-tree-bridge, prop-tube-mouth, prop-tunnel-heap, prop-warren-entrance, prop-wash-bucket, prop-weir-logs, prop-willow, prop-winkie-pillar, prop-winkie-tower, prop-witch-cupboard, prop-wonder-mushroom

Backdrops / pictures (bg ids; battle backdrops are used as bg: "<place>" for bg-battle-<place>): bg-attack, bg-battle-depths, bg-battle-downs, bg-battle-dream, bg-battle-drowned, bg-battle-emerald, bg-battle-lidenbrock, bg-battle-moon, bg-battle-mushroom, bg-battle-oz-road, bg-battle-riverbank, bg-battle-root, bg-battle-shallows, bg-battle-stair, bg-battle-warren, bg-battle-wildwood, bg-battle-winkie, bg-battle-wonder-garden, bg-battle-wonder-hall, bg-ending, bg-intro-1, bg-intro-2, bg-intro-3, bg-mural, bg-sea, bg-title, boss-eye, boss-tidewarden

Portraits: por-aster, por-badger, por-barley, por-bill-lizard, por-bramble, por-bramble-happy, por-bramble-worried, por-burdock, por-captain-quarry, por-caterpillar, por-change, por-chert, por-cheshire-cat, por-chief-weasel, por-china-princess, por-choir, por-comfrey, por-cook, por-cowardly-lion, por-dodo, por-dormouse, por-duchess, por-elevenfold, por-generic-buck, por-generic-doe, por-generic-kit, por-glinda, por-good-witch, por-guardian, por-hatter, por-hedgehog, por-hollow-rabbit, por-hum-digger, por-jade-rabbit, por-king-of-hearts, por-knave, por-mallow, por-march-hare, por-mole, por-monkey-king, por-moon-hare, por-moon-toad, por-moth-queen, por-mouse-queen, por-munchkin, por-ninefold, por-old-yarrow, por-otter, por-pigeon, por-pigeon-rider, por-pip, por-quarryman, por-queen-of-hearts, por-raider, por-ratty, por-rumble, por-scarecrow, por-seven-of-spades, por-shepherd, por-stork, por-tansy, por-tin-woodman, por-toad, por-traveller, por-watcher, por-white-rabbit, por-wick, por-wicked-witch, por-winkie, por-wizard, por-woodruff, por-wu-gang

Icons: ico-afraid, ico-asleep, ico-banner, ico-barleys-bell, ico-button, ico-camp, ico-carrot-cake, ico-chalk-pebble, ico-clover-bunch, ico-clover-charm, ico-comfits, ico-courage-biscuit, ico-courage-ribbon, ico-dandelion, ico-depths-key, ico-digging-claw, ico-drink-me, ico-eat-me, ico-eerie, ico-emerald-cloak, ico-emerald-lozenge, ico-emerald-specs, ico-flint-pick, ico-glow-mushroom, ico-golden-cap, ico-grown, ico-hummed, ico-jade-elixir, ico-jade-pestle, ico-lantern, ico-light, ico-little-axe, ico-mail, ico-mastodon-coat, ico-monkey-drop, ico-moon-silk-coat, ico-mooncake, ico-moonlight, ico-motor-goggles, ico-mushroom-halves, ico-mute-off, ico-mute-on, ico-nibble, ico-ninefold-dandelion, ico-oilskin-coat, ico-old-key, ico-pause, ico-pearl, ico-pearl-pendant, ico-pestle, ico-pips-button, ico-pluck-berry, ico-poppy-ward, ico-quest, ico-quill, ico-rally, ico-ration, ico-reinforce, ico-save, ico-shielded, ico-shrunk, ico-silver-bell, ico-silver-shoes, ico-sling, ico-smelling-salts, ico-star-amulet, ico-star-stone, ico-stout, ico-straw-vest, ico-stunned, ico-supply, ico-sweetgrass, ico-swift, ico-talk, ico-thimble-armour, ico-tin-vest, ico-tunnel, ico-waistcoat, ico-walking-stick, ico-water-pail, ico-wing

Music: m-army, m-attack, m-battle, m-boss, m-deep, m-depths, m-downs, m-dream, m-flintcomb, m-journey, m-moon, m-oz, m-riverbank, m-silverdown, m-title, m-warren, m-wheatsheaf, m-wildwood, m-wonderland

Sound effects (s.sfx(id)): alert-horn, battle-start, bridge-crash, bridge-creak, buff, chest-open, china-crack, china-crunch, choir-sting, coins, crit, door-grind, fade-sigh, geyser, guard, heal, hit-1, hit-2, hop-1, hop-2, key-turn, level-up, nibble, node-taken, recruit-sting, rts-order, rumble, scamper, shepherd-hum, shimmer, skill-whoosh, sneeze, splash-melt, squad-worn, swanee, thump-1, thump-2, victory, wake-chime, warren-drum, water-step, whoosh, wings

Ambience loops (map ambience: [[id, volume]]): clash, drone-bed, hearth, hum, river, storm, wind

Voice lines (s.voice(id)): vo-dandelion, vo-notalone, vo-rhyme, vo-upyouget, vo-whisper
