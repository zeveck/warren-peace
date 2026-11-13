# Warren Peace

*A war between warrens, a door that was never meant to open, and the long way down to peace.*

## Pitch

You are Bramble, a young rabbit of Thimblebank Warren. When maddened neighbours wreck your home and carry your friends away, the elder hands you the key to a door that has never opened. Below it you find storybook worlds (the River Bank, Wonderland, the Moon, Oz, the hollow heart of the Earth) and a deeper, stranger dark beneath them all. Explore in isometric pixel art, talk to everyone, fight easy-going turn-based battles with a party of three, and lead everyone you've befriended into light, thoughtful army battles on the downs. You free one warren after another until every rabbit stands together in the evening sun.

## Settings

- Platform: desktop (keyboard and mouse; no touch layout)
- Target: web (plain HTML and JavaScript as ES modules, no build step)
- Scope: large (asked for): about 4 to 4.5 hours, a prologue, 4 chapters and a finale
- Budget: $50 (raised by the person during design review; quality first)
- Tools available: imagegen2 and anim8gen (OpenAI key ok), nanogen (Gemini key ok), audiogen (ElevenLabs, creator plan), Python 3 with Pillow, Node, playwright-cli for play-testing. No ffmpeg, no numpy.
- Credit: Rich Conlan
- Decisions made on the player's behalf:
  - Title "Warren Peace" (the person's own suggestion; warm, and exactly the story).
  - Hero Bramble, a young buck (fixed name; the story is written for him). All other names are invented or come from the public-domain books. Nothing from Watership Down: no names, no rabbit language, no plot.
  - The creature (the Undersleeper), its influence (the Hum) and how it's broken (waking battles, the Long Thump, the told story) are invented; see Story.
  - Battles never kill or hurt in a grisly way: Hum-taken rabbits are *woken*, depth creatures *fade*, storybook foes are *sent packing*, worn-out allies *rest* and are back after the fight.
  - Visible enemies on maps, no random encounters (less grind, testable).
  - Terrain tiles drawn in code from per-world palettes (seamless and consistent); characters, props, portraits and backdrops generated.
  - The two travelling companions follow Bramble on the exploration map in a little line (escorts first, then the companions), each with a front and a back view and a code hop (mirrored for left and right). They hop into Bramble (a puff, "tuck in") wherever only one rabbit can manage: Wonderland's size-puzzle maps (and any time Bramble isn't normal size), the shepherd's field, and the China Country; they hop back out on the next map. Bramble has all four facings with real hops; the generic rabbit and the raider have front and back views with real hops; every other character uses a mirrored front view with a code hop. (Changed at the person's request, which replaced the earlier "Bramble alone on the map".)
  - Movement keys are screen-relative (Up goes up the screen); the grid mapping is an option.

## The player's fantasy

Being small and brave: a rabbit who sets off with a key and a good heart, makes friends with every odd creature in every storybook, and turns that band of friends into an army that heals instead of conquers. The joy is the growing roster (a mole, a toad, a grin with a cat around it, a polite thing with nine eyes), and watching your wrecked warren fill back up, room by room.

## Core loop

- **10 seconds:** hop across an isometric map (one tile per hop, with a squash-and-stretch bounce), talk to someone, nibble a patch of clover, spot an enemy and choose to fight it or slip past.
- **1 minute:** a conversation that opens a path, a short turn-based battle (3 to 6 turns), a chest of buttons, a recruit's quest step, a word with your party.
- **10 to 30 minutes:** a world. Explore its surface and its warren, recruit its allies (each with a small quest), beat its boss, open the next layer down. Then go home, shop, rest, and take the fight back to the downs in an army battle.
- **Session:** every chapter ends with a warren freed, a new world unlocked, more rooms of Thimblebank rebuilt and more friends in the army. The Hum gets louder, the depths stranger, and you want to see what's at the bottom.

**The mechanic the game lives or dies by:** recruiting. Every friend matters twice, in the party or the army, and every recruit has a face, a voice in dialog, a quest, a squad, things to say on the road and a big moment when they join (the recruit card, see Juice). If recruiting feels like a checkbox the game is thin; if each new friend feels like a little story, the game works.

## Controls

Desktop only: keyboard and mouse, or a PS5 / Xbox controller (below). The input layer records "just pressed" on keydown and calls `preventDefault` on every key the game uses (arrows, Space, Tab).

Exploration, menus and RPG battles

| Action | Keyboard | Mouse |
|---|---|---|
| Hop | Arrows or WASD, **screen-relative**: Up goes up the screen, Right goes right, and so on. A single key alternates the two grid steps either side of it, drawn as one smooth straight line with a steady facing; two keys together (Up+Right) take the one diagonal grid step that way. Hold to keep hopping: after 3 held hops the hop time drops from 0.22 s to 0.16 s; straight up or down the screen hops take 0.8x the time. Settings has "Grid keys" (Up = up-right, Right = down-right...) with a compass in the HUD. | Left-click a tile: hop there by the shortest path (at the fast hop speed); click a person or chest to walk up and use it |
| Talk / use / open | Space, Enter or E | Click the person or thing |
| Nibble (clover, grass, sweetgrass) | N | Right-click your own tile |
| Advance dialog / choose a reply | Space, Enter, E; arrows to pick | Click |
| Camp menu (party, talk, gear, items, army, quests, map, bestiary) | Tab or I (exploration only) | HUD button |
| Pause / settings / save | Escape or P | HUD button |
| Mute | M | HUD button |
| RPG battle commands | Arrows + Space/Enter; Escape = back | Click command, then click target |

Army battles (left-click only ever selects; right-click only ever orders)

| Action | Keyboard | Mouse |
|---|---|---|
| Select squads | 1 to 9 and 0 (the first ten in the squad list); Shift+digit adds; B selects all; Tab cycles (caught by the game, never moves browser focus) | Left-click a squad or its squad-list entry; Shift-click adds; drag a box; left-click empty ground clears |
| Order | Press a node's letter (also shown on the minimap, so off-screen nodes work) | Right-click a node or enemy squad, on the field or on the minimap |
| Reinforce (10 Supply) | T: reinforces every selected squad that can be | Reinforce button |
| Army abilities | Q, W, E, R, then target: a node's letter or a right-click (Moonlight, Monkey Drop), or a burrow mouth's letter for the selected squad (Tunnel); Rally fires at once. Escape cancels targeting | Ability buttons, then right-click the target |
| Camera | Arrow keys pan; C centres on the selected squad; V centres on home | Edge-scroll (Settings, on by default); middle-drag; left-click the minimap to jump there |
| Pause / speed | Space pauses (orders still allowed while paused); F toggles 1x / 2x. Settings: "Army auto-pause" off / every 10 s / on first contact (Easy defaults to on contact) | Pause and speed buttons |

### Controller (PS5 DualSense / Xbox; `engine/pad.js`, design in `design/changes/controller.md`)

The Gamepad API's "standard" mapping, polled once per frame. Most screens get the keys their buttons stand for; the army battle reads the pad itself. Prompts switch to drawn button glyphs (PlayStation or Xbox, from the pad's id or Settings > Controller > Button icons) as soon as the pad is used, and back on the next key press, click or mouse move. Names are PlayStation / Xbox.

| Context | Left stick / d-pad | Cross/A | Circle/B | Square/X | Triangle/Y | L1/LB, R1/RB | Options/Menu | Create/View |
|---|---|---|---|---|---|---|---|---|
| Exploring | Hop (stick: 8-way, screen-relative; with Grid keys the d-pad follows the setting and the stick snaps to the 4 screen diagonals) | Talk / use | | Nibble | Camp menu | | Pause | Camp on the Map tab |
| Dialog and choices | Pick a reply | Advance / choose | | | | | | |
| Camp menu | Rows | Choose | Back / close | | Close | Tabs | Close | |
| Shops | Rows (left/right: tabs) | Buy | Leave / decline auto-equip | | | Tabs | Leave | |
| RPG battles | The 2x3 command grid, lists, targets | Confirm | Back | | | | | |
| Title, pause, save/load, settings, revisits | Rows (held: repeats); settings: left/right change a value | Choose | Back | | | Settings: change a value | Back | |
| Pictures, recruit cards | | Continue | Skip | | | | | |
| Army preview | Squad list | Pick / unpick | Back | "The warren rallies" (when shown) | Start the battle | | | |
| Credits | | Hold to speed up | | | | | | |

Army battles on the pad: a **node cursor** (a gold ring with the node's name) plus the selection.

| Action | Pad |
|---|---|
| Move the cursor to the nearest node that way | Left stick or d-pad (the camera follows it) |
| Order the selected squads to the cursor's node | Cross / A |
| Select the squads on the cursor's node (none there: those on the roads into it) | Square / X; twice quickly selects all |
| Next / previous squad | R1 / RB, L1 / LB |
| Add to the selection | hold L2 / LT with Square or L1/R1 |
| Reinforce the selected | Triangle / Y |
| Abilities | hold R2 / RT: Square Rally, Triangle Moonlight, Circle Monkey Drop, Cross Tunnel (Q W E R); then cursor + Cross to aim, Circle cancels. While aiming, R2 does nothing. |
| Speed 1x / 2x; jump home | R2 + R1; R2 + L1 |
| Pause / play (orders still work) | Create / View |
| Camera; centre on the selection | Right stick; L3 |
| Clear the selection | Circle / B |
| Close a waiting tip | Cross / A |
| Pause menu | Options / Menu |

Rumble (Settings > Controller > Vibration; skipped where unsupported): hits on the party, crits, a boss's second phase, map tremors, a new Long Thump layer, army alerts and orders.

**RTS reserved keys:** Q W E R T F C V B, Space, Tab, Escape, P, M, the arrows and the digits. Node labels use only **A S D G H J K L Z X** (10 letters; the biggest battle has 10 nodes). WASD don't move the camera in army battles (A S D are node letters). The camp menu and talk are unavailable during army battles.

## Story

### The creature, the Hum, and how it ends

Below every warren, below the storybook worlds, run the **Depths**: one continuous dark that gets older and stranger the further down you go. At the very bottom sleeps the **Undersleeper**, a vast, ancient dreamer as old as the chalk. It is not wicked. It only sleeps, and while it sleeps peacefully, the downs are quiet.

Long ago, **Deepdelve Warren** dug too deep and woke it a little. Its bad dreams leaked upward as **the Hum**: a low drone in the soil that gets into rabbits' heads. Hum-taken rabbits forget their names and homes, their eyes go flat and pale blue, and they want only to dig deeper and gather more rabbits to dig. Deepdelve was lost; the other warrens sealed their deep doors, and their elders kept the keys and the secret. Over generations it became a nursery story.

Now **Flintcomb Warren**, on the hard flinty downs to the east, has quarried too deep. The Hum took them first, and it spreads: Flintcomb took Silverdown, then Wheatsheaf, and now comes for Thimblebank.

How it's broken:
- **Waking.** In battle, a Hum-taken rabbit's "Hum" bar is what you knock down. At zero they shake their head, remember their name, and sit down blinking. Kindness is the weapon.
- **Freeing a warren.** Winning an army battle at a warren and then waking its chief (an RPG boss in the warren's heart) frees the whole warren. The freed warren joins your army and gives you its Depths key.
- **The Long Thump.** Rabbits thump their back feet to warn each other. Old Yarrow's nursery rhyme: "When all the warrens thump as one, the Sleeper's dream is soft and done." In the finale every freed warren thumps together, one heartbeat, while Bramble walks into the Undersleeper's dream and tells it the story of the journey (the player picks memories from the worlds). It dreams a kind dream and sinks back into deep sleep. The Hum becomes a faint hum of contentment, like a cat purring under the hills.

### Cast

Home (Thimblebank Warren, on Sorrel Down)
- **Bramble**: the hero, a young brown buck whose left ear flops. Curious, kind, a bit too brave. Short lines; the player picks his replies at key moments (tone only, never branching the plot).
- **Old Yarrow**: the elder, grey and half-blind, keeper of the key. Gentle, cryptic, funny. Voiced in a few short barks.
- **Tansy**: Bramble's best friend, a quick, sharp-tongued sandy doe; carried off in the attack. Found Hum-taken in the Drowned Halls (Ch2), woken, joins the party.
- **Burdock**: a big, gruff, soft-hearted doe who digs better than anyone. Joins in the Prologue.
- **Pip**: a tiny kit who loses things and asks questions. Hides through the attack; trains with Comfrey and Old Yarrow while Bramble is away ("Yarrow taught me to listen to the ground!"). Joins in Ch3.
- **Mallow** the button-trader (shop), **Woodruff** the storyteller (lore), **Comfrey** the healer (rest point), plus 10 more named warren rabbits drawn from the 3 generic rabbit bases, each with its own fur colour and accessory (see Art direction), and more who return as the warren is rebuilt.
- Each chapter brings a home friend forward: Burdock (Prologue), Tansy (Ch2), Pip (Ch3), Yarrow (comes down to Flintcomb's lip in Ch4 to see Quarry woken).

Other warrens
- **Captain Quarry** of Flintcomb: once its cheerful head digger, now the Hum's loudest voice. Final warren boss (Ch4). Woken, he's horrified, and joins the party ("I dug the hole. I'll walk it.").
- **Chert**: a Flintcomb raider woken after RTS 1, the first proof that waking works; a sad, decent rabbit who explains what the Hum feels like. Leads Chert's Band in the army.
- **Aster**, chief of Silverdown (moon-pale, poetic). **Barley**, chief of Wheatsheaf (broad, slow-spoken farmer). Bosses while taken; army leaders when freed; both stand at the ending.

Storybook friends (from the original books)
- *The Wind in the Willows* (1908): **Mole**, **Ratty**, **Badger**, **Toad** (party); the field-mouse carol singers of Mole End, the two hedgehog lads of Badger's kitchen, the Otter, and the weasels who sheepishly reform after the Toad Hall banquet (their squads).
- *Alice's Adventures in Wonderland* (1865): the **Cheshire Cat**, the **Caterpillar** (party); the **White Rabbit** (army: the Heralds; a delighted fellow rabbit), the gardeners **Two, Five and Seven** (army: Card Gardeners, led by Seven), the **Flamingos**. NPCs: the Dodo (shop, the Caucus Store), the Duchess and her baby (who turns into a pig), the Cook, the Hatter, the March Hare, the Dormouse, the Pigeon, Bill the Lizard, the Queen and King of Hearts, the Knave.
- *The Moon Rabbit* (folk tale): the **Jade Rabbit** (party), the Moon Hares, the woken Lantern Moths and their leader **Wick**, the **Three-legged Moon Toad** (shop), Chang'e in the palace (kind and sad), Wu Gang (forever chopping the cassia tree that heals itself), and a hungry old traveller (from the tale of the rabbit who had nothing to give but kindness).
- *The Wonderful Wizard of Oz* (1900): the **Tin Woodman** (party; later ruler of the Winkies, who become his squad), the **Scarecrow** (army: the Emerald Guard, since he rules the Emerald City), the **Cowardly Lion** (army: the Lion's Beasts), the **Queen of the Field Mice** and her mice, the **Winged Monkeys** and their King (via the Golden Cap). NPCs: the Munchkins, the Good Witch of the North, Glinda, the Guardian of the Gates, the Wizard (a humbug, kindly), the Stork, the China Princess. Silver shoes, green spectacles, Kalidahs, Hammer-Heads, the wildcat, the deadly poppy field, the China Country, the Wicked Witch of the West's Winkie castle.
- *Journey to the Center of the Earth* (1864): **Rumble**, a mastodon calf from the herd tended by the giant shepherd (party, Ch4). Echoes: Arne Saknussemm's carved initials "A.S." mark the true path; the Hansbach stream; the whispering gallery where voices carry through rock; the Lidenbrock Sea under glowing cloud; the ichthyosaur and plesiosaur fighting far out (seen, not fought); the electric storm that turns the compass needle backwards; the geyser island; the giant mushroom forest; the plain of bones; the blocked tunnel.

The Depths (our own)
- **Ninefold**: a small, polite, many-eyed thing from the Shallows, badger-sized, made of soft dark folds with nine pale eyes. Has never met anyone who didn't scream. Joins the party (Ch1). Very formal, delighted by everything ("I have never been offered a dandelion before. I will keep it forever."). Its cousin **Elevenfold** keeps a strange stall in the Root of the World.
- **The Whispering Choir** (Shallows boss), **the Tidewarden** (Drowned Halls boss), **the Watcher on the Stair** (Stair of Eyes boss), **the Hollow Rabbits of Deepdelve** (Root of the World), and **the Undersleeper**.

### Recruits and their quests

Every recruit has a quest of at least one step and a squad. "Req" recruits are on the main path; required recruits alone make every army battle "Even" (see army battles). Every recruit quest ends with a reward chest worth `10 * L` buttons (L = the area's level).

| Recruit | Where | Quest (one line) | Joins as | Squad led | Req |
|---|---|---|---|---|---|
| Burdock | Prologue | Arrives mid-way through the first battle and won't leave Bramble's side | Party | Thimblebank Diggers | yes |
| Ratty | River Bank | Shove the logs off the weir to free his boat | Party | Otters | yes |
| Mole | River Bank | Lost in the snowy Wild Wood at dusk: follow his scent markers home to Mole End, where the field mice sing their carol | Party | Field-mouse Carollers | yes |
| Badger | River Bank | Bring the two lost hedgehog lads through the snow to his door (escort) | Party | Hedgehogs | yes |
| Toad | River Bank | Pull him from his wrecked motor-car, see through his washerwoman disguise, retake Toad Hall through the secret tunnel (boss: Chief Weasel); the weasels apologise at the banquet | Party | Reformed Weasels | yes |
| White Rabbit | Wonderland | Fetch his gloves and fan from his house (grow too big inside; Bill the Lizard pops out of the chimney like a cork) | Army | White Rabbit's Heralds | yes |
| Caterpillar | Wonderland | Answer "Who are you?" by reciting "You are old, Father William" (pick the lines); he gives the two sides of the mushroom, and talks the Flamingos (hiding from croquet in his wood) into joining | Party | Flamingos | yes |
| Cheshire Cat | Wonderland | Find where the Duchess's baby (now a pig) trotted off to in the wood; the Cat grins and comes along "to see how it ends" | Party | The Grin | yes |
| Seven of Spades | Wonderland | Help Two, Five and Seven paint three white roses red before the Queen comes | Army | Card Gardeners | no |
| Ninefold | Shallows | Fetch a dandelion from the surface and offer it | Party | The Polite Dark | yes (not counted for RTS 1: the Shallows may come after it) |
| Chert | After RTS 1 | Woken in the Great Burrow fight; asks to make amends | Army | Chert's Band | yes |
| Aster | Silverdown | Woken after RTS 2 | Army | Silverdown Rabbits | yes |
| Jade Rabbit | Moon | Share your sweetgrass with a hungry old traveller (she sees it), then win her stolen pestle back from the Moth Queen with the Moon Hares | Party | Moon Hares | yes |
| Wick | Moon | The woken Lantern Moths want light: carry a flame from Chang'e's palace lanterns to their grove (Wick follows as an escort) | Army | Lantern Moths | no |
| Tansy | Drowned Halls | Woken in battle at the bottom of the flooded stair | Party | Tansy's Scouts | yes |
| Barley | Wheatsheaf | Woken after RTS 3 | Army | Wheatsheaf Rabbits | yes |
| Pip | Wheatsheaf | Comes to Wheatsheaf on Yarrow's orders after RTS 3 and finds Barley's lost bell (his first find that matters) | Party | Pip's Kits | yes |
| Tin Woodman | Oz | Oil his rusted joints in the forest; after the Witch melts, the Winkies make him their ruler | Party | Winkies | yes |
| Scarecrow | Oz | Stuck on a pole in the river: help the Stork lift him off | Army | Emerald Guard | yes |
| Cowardly Lion | Oz | At the Kalidah ditch he roars to hold them while the tree-bridge falls; the Wizard gives him a dish of green "courage" | Army | Lion's Beasts | yes |
| Queen of the Field Mice | Oz | The Tin Woodman saves her from the wildcat; her thousands pull the sleeping party out of the poppies | Army | Field Mice | yes |
| Monkey King | Oz | Win the Golden Cap from the Witch's cupboard; the first wish frees them | Army | Winged Monkeys | yes |
| Captain Quarry | Flintcomb | Woken at the lip of the hole after RTS 4 | Party | Flintcomb Diggers | yes |
| Rumble | Journey | Lead the lost calf back to the herd past the giant shepherd (escort and sneak); he chooses to stay with Bramble, and the herd follows | Party | Mastodon Herd | yes |
| Elevenfold | Root of the World | Optional: bring it three star-stones from the Root for its best stock | Shop | (none) | no |

### Chapters

Times are targets for a first play.

**Prologue: Sorrel Down (about 15 minutes; the attack 4 to 6 minutes in)**
1. Morning on Sorrel Down (about 2 minutes). Learn to hop, talk, nibble. Required: **Tansy** (teases Bramble, races him to the warren mouth) and **Pip** (lost a button in a hollow log: finding it teaches "use" and gives the first buttons). Four more rabbits are optional, each with a line about the strange rumbling lately. About 2 minutes in, a small rumble: the screen shakes, dust puffs, every rabbit looks up.
2. Down into **Thimblebank Warren** (about 2 to 3 minutes): a maze of tunnels and rooms (the Great Burrow, the nursery, Yarrow's den, Mallow's trading nook, the root cellar, the deep passage ending at the old sealed door with its curling sign; pressing an ear to it, Bramble hears a faint hum). Required: **Old Yarrow** and **Woodruff** (the nursery rhyme of the Long Thump). Eight more rabbits optional; they stay afterwards with changed lines.
3. Yarrow sends Bramble up for sweetgrass, which grows by the warren mouth. When he picks it, **the attack**: three big shakes, then Flintcomb raiders pour over the hill, eyes pale and blank, humming. A short scripted scene: tunnels collapse in chalk dust, rabbits scatter, Tansy and five others are herded off east. One raider pushes Bramble aside without seeing him. Nobody is hurt on screen; the horror is the blankness.
4. The first battle: two dazed raiders left behind (tutorial, unlosable; Burdock arrives and joins mid-battle).
5. The **Lookout Stone** on the downs: the army battle is offered here and from now on at any time. The first time is a guided scene: four prompts ("Click your squad", "Right-click the hilltop", "Arrow keys or the minimap look around", "Space pauses; you can still give orders"), then Flintcomb's six squads roll over the ridge, and when Bramble's squad drops below half (or after 45 seconds) Yarrow's voice calls "Not like this, Bramble. Not alone," and the army falls back with no loss. From then on the Lookout Stone shows the odds (Weak / Even / Strong) for the next battle and how many of its needed squads you have ("Squads ready: 4 of 7"); the player can try any time.
6. Yarrow, in the wrecked Great Burrow, gives Bramble the **Old Key** and the truth: the door leads to the Depths; elders kept it locked because of Deepdelve; "the Hum is that old story come true. Below, there are others. Find friends." End of prologue.

**Chapter 1: The Depths of Thimblebank (about 75 minutes)**
- **Thimblebank Depths** (8 min): rooty, older tunnels; beetles, root-tanglers and dazed earthworms (easy battles that teach skills, Guard and items). It opens into **the Underway**, a round cavern with three carved doors: a river, a keyhole, and a stair sealed with an eye. Every warren's Depths ends in its own Underway; once two are known, they link (fast travel between Underways).
- **The River Bank** (22 min), through the river door. Surface: the River Bank in summer, Ratty's hole and the weir, the Wild Wood (in snow at dusk, darker than it should be: the Hum has leaked even here, and the weasels and stoats are snappish), the road and Toad Hall. Warren: **Badger's house** (the warm kitchen and its fire, the hedgehog lads at breakfast) and the old buried city beneath it, and **Mole End** (the carol). Quests: see the recruit table. Boss: **the Chief Weasel** at the Toad Hall banquet.
- **Home, briefly** (after the River Bank, 2 min, on the next visit home): Ratty and Badger help Burdock clear the collapsed nursery tunnel (one room rebuilt early, lit), and Pip runs in with a chalk pebble found rolling down from the east, scratched with Tansy's mark: she's alive, and still herself enough to leave a sign.
- **Wonderland** (22 min), through the keyhole door: Bramble falls down a rabbit-hole into the hall of doors. Twist: **Drink Me / Eat Me** change Bramble's size on the map (see Size puzzles). Six areas: (a) the Hall of Doors and the Pool of Tears; (b) the Caucus-race shore (everyone has won; the Dodo hands round comfits and runs the shop); (c) the White Rabbit's house; (d) the Caterpillar's mushroom wood (the Pigeon shrieks "Serpent!" at big Bramble) and the Duchess's peppery kitchen; (e) the Mad Tea-Party (always six o'clock; the Dormouse's treacle-well story; "Why is a raven like a writing-desk?" has no answer and every reply delights the Hatter); (f) the Queen's garden: the gardeners painting roses, croquet with flamingos and hedgehogs, the trial of the Knave ("Who stole the tarts?"). Boss: **the Queen of Hearts' croquet match** (Queen, Knave and card soldiers; she shouts "Off with—" and the King quietly pardons everyone, as in the book).
- **The Shallows** (10 min): the sealed stair opens when both worlds are done (two carved symbols glow). Smooth black stone, carvings of rabbits not carved by rabbits, a whisper that says Bramble's name when he stands still for 5 seconds, a room bigger inside than its door. Meet **Ninefold**. Boss: **the Whispering Choir**, stone mouths in a wall, whose "attack" is to say true, unsettling things ("Your warren is cold tonight."). After it fades, a mural shows Deepdelve digging, and below it a long shape, and an eye.
- **The Battle of Sorrel Down (RTS 1, 13 min)**, open once River Bank and Wonderland are done (Shallows before or after, either order). Win to retake Thimblebank's surface; then an RPG battle in the Great Burrow wakes **Chert** and the raiders there. The five captured rabbits come home from a Flintcomb pen nearby, but not Tansy: Chert says she was taken on to Silverdown. Thimblebank's first rooms are rebuilt. The chapter ends when RTS 1 and the Shallows are both done.

**Chapter 2: Silverdown and the Moon (about 55 minutes)**
- **Battle of Silverdown (RTS 2, 10 min)**: a pale-chalk warren to the north whose rabbits keep pigeons (flyers). Win, then wake **Aster** in Silverdown's heart (boss). Aster gives the Depths key and leads the Silverdown Rabbits.
- **Silverdown Depths** (5 min): Tansy isn't in the warren; her tracks go down.
- **The Moon** (25 min): the moon-door opens on a moonbeam stair. Silver dust; the cassia tree and Wu Gang chopping it (it heals every night); the hungry old traveller; the Moon Palace and Chang'e, who has watched the downs from far off and knows of the Undersleeper's dreams ("Even here, some nights, the light flickers."); the crater warren of the Moon Hares; the lantern grove. The **Jade Rabbit** pounds the elixir of life under the tree, but her pestle was stolen by Hum-touched lantern moths. Boss: **the Moth Queen**. Mooncakes are the Moon's healing item; the Moon Toad runs the shop.
- **The Drowned Halls** (layer 2, 15 min): flooded columns, cold black water, carvings that turn their heads, a shut door with an eye. Here is **Tansy**, Hum-taken, digging at the floor (a fight to wake her: tough and fast, a moment not a wall). Then **the Tidewarden**, a vast shape under the water that rises only as an outline of eyes.

**Chapter 3: Wheatsheaf and Oz (about 50 minutes)**
- **Battle of Wheatsheaf (RTS 3, 10 min)**: a farmland warren in the cornfields to the west; corn hides squads. Win, wake **Barley**; Pip arrives.
- **Wheatsheaf Depths**: a cyclone of dust in a round cave; step in, and it carries you to Oz.
- **Oz** (32 min): the blue Munchkin Country beside a house that fell from the sky (the Witch of the East is gone, only her silver shoes left; the Munchkins give them to Bramble). The Good Witch of the North kisses his forehead (a protecting mark). The road of yellow brick: the forest (the rusted Tin Woodman), the river (the Scarecrow and the Stork), the Kalidah ditch (the tree-bridge chase battle; the Lion's roar), the wildcat and the Queen of the Field Mice, the deadly poppy field (the party falls asleep; the mice pull you out). Oz's warren is the Field Mice's court under the poppies. The **Emerald City**: green spectacles, the Guardian of the Gates, the Wizard's great Head on the green throne that turns out to be a humbug, who admits it kindly. The yellow Winkie Country: the Witch sends wolves, crows and Winkie soldiers (sent home happy); boss: **the Wicked Witch of the West**, who melts into a puddle when splashed, played for comedy as in the book. The **Golden Cap** in her cupboard commands the Winged Monkeys. Optional: the fragile **China Country** (see Cracking tiles) and the Hammer-Heads' hill. Glinda in the south explains the silver shoes carry their wearer anywhere in three steps; in the finale they carry Bramble into the Undersleeper's dream.
- **The Stair of Eyes** (layer 3, 8 min): a stair that goes down further than it should, carvings with too many eyes that follow you, footsteps that echo a beat too late, a landing where the light slowly dims while you stand still. Boss: **the Watcher on the Stair**, a tall thin shape made of shut eyes that opens one each turn (a timed fight). Beyond, a breath of warm air from below.

**Chapter 4: Flintcomb and the Center of the Earth (about 50 minutes)**
- **Battle of Flintcomb (RTS 4, 12 min)**: the hardest army battle, around a white flint quarry pocked with burrows. Win, then descend Flintcomb's warren, a spiral of tunnels round a deep, deep hole. **Captain Quarry** (boss) at its lip; Yarrow comes to see him woken.
- **The Hole** (23 min): climb down the hole Flintcomb dug, which breaks into the volcanic tubes of Verne's world. Saknussemm's "A.S." marks the true way at each fork (the route puzzle). In the whispering gallery Bramble hears Flintcomb diggers through the rock. The Hansbach stream leads to the **Lidenbrock Sea** under glowing cloud: a raft crossing (the ichthyosaur and plesiosaur fight far out; an electric storm turns the compass backwards), the geyser island, the giant mushroom forest, the plain of bones and the mastodon herd with its giant shepherd (eerie and quiet: you sneak past him with Rumble). Recruit **Rumble**. A fallen rock blocks the way down; Rumble and Quarry dig through together.
- **The Root of the World** (layer 4, 15 min): stars glow in the rock; roots as thick as trees, that move. The ruins of **Deepdelve Warren**: rabbit rooms, nurseries, a storyteller's seat, all empty, and the **Hollow Rabbits**, rabbit-shaped shadows who've forgotten everything; waking them is the chapter's last battle, and they thank you in whispers and fade, at peace. Elevenfold's stall. The way down to the Sleeping Deep.

**Finale: The Sleeping Deep (about 25 minutes)**
- Every freed warren comes down behind Bramble: Thimblebank, Silverdown, Wheatsheaf, Flintcomb, Deepdelve's echoes, and the storybook friends.
- **The Long Thump (RTS 5)**: take and hold three **Thump Stones** at once while the Undersleeper's dream-shapes roll in from the dark (rules in the army section). Yarrow's voice speaks the rhyme as it begins; each held stone adds a layer to the thumping heartbeat.
- **The Dream** (RPG finale): the silver shoes take Bramble and his party into the dream: an upside-down Sorrel Down under a black sun. Three phases (the Nightmare of Deepdelve, the Nightmare of Flintcomb, the Undersleeper's Eye), each making the dream stranger. The Eye's bar reads "Dreaming"; attacks barely move it (1 point each). **Tell a Story** appears in every member's commands, but the party may tell **one story per round** (whoever acts first; the command greys out for the rest of the round). Each story picks a memory from the list the player earned (below), usable once, and lowers the bar by a fifth. Each plays as a 4-second vignette: the dream backdrop crossfades to that world's battle backdrop, the friend's portrait appears with their line, the Eye answers in a line of its own, and the dream comes back a little kinder. Five stories (five rounds at least) and it closes its eye, and smiles. In this phase a worn-out member gets up again next round ("Up you get"), so it can't be lost, but it takes time and choices.
  - Always available (from the main path): Mole's first sight of the river, the tea-party, the traveller and the Jade Rabbit, the poppy-field mice, the giant mushrooms, Ninefold's dandelion, Tansy's chalk pebble.
  - Added by optional content: the painted roses (Seven of Spades), Wick's flame (Wick), the China Princess (China Country), Elevenfold's star-stones (Elevenfold).
- **Ending:** Sorrel Down at sunset. Every warren together, every recruit somewhere on the map, each with a last line. A feast of clover. Tansy and Bramble on the Lookout Stone. Old Yarrow locks the door one last time, then leaves the key in it. Credits roll over the scene, each character hopping past. Then "Warren Peace", the final save, and the player can keep wandering and talking to everyone.

## Structure and difficulty

| Part | New thing | Difficulty |
|---|---|---|
| Prologue | Hop, talk, nibble, camp menu; one unlosable battle; the guided Lookout scene | None |
| Thimblebank Depths | Skills, Guard, items, Pluck | Very easy: enemies hit for about 10% of max Heart |
| River Bank | Party of 3, swapping, first boss, first gear, escorts, the scent trail | Easy |
| Wonderland | Size puzzles; Shrunk, Grown, Asleep | Easy |
| Shallows | Afraid, the Eerie tag, a talking boss | Easy-medium |
| RTS 1 | The whole RTS: orders, nodes, camera and minimap, Supply, the triangle (step-by-step tutorial) | Easy army battle |
| Silverdown / Moon | Light skills; a boss with a summon | Medium |
| RTS 2 | Flyers; first army ability (Rally) | Medium |
| Drowned Halls | Bosses with phases | Medium |
| RTS 3 | Cover (corn hides squads); Moonlight | Medium |
| Oz | A long road, a chase battle, fragile tiles, the Golden Cap | Medium |
| Stair of Eyes | A timed boss | Medium-hard |
| RTS 4 | Fortified nodes, reinforcements, hold two nodes at once | Hard |
| Journey / Root of the World | Long dungeon, the sneak, strongest enemies | Hard (rest points frequent) |
| Finale | Hold three stones; the story finale | Hard, then gentle |

Difficulty rises through enemy count (2 at first, up to 4), tiers, statuses and boss mechanics, not stat inflation (see RPG formulas).

How it avoids frustration:
- No random battles: enemies are visible and mostly avoidable; defeated enemies stay gone until you leave the world.
- **Losing an RPG battle** puts you back at the last door with full Heart, nothing lost (Yarrow's voice: "Up you get."). Bosses can be retried at once.
- **Losing an army battle** returns you to the Lookout Stone with no loss. After two losses in the same battle, the preview offers "The warren rallies" (all squads +15% for that battle, once) and points at Easy mode.
- Every required army battle is "Even" with only required recruits and no army gear; optional recruits and gear make it "Strong" (checked by the balance tool).
- Rest points (Comfrey at home, a mossy stone in every Underway and before every boss) heal fully and save.
- Pluck comes back: 30% of max Pluck after every won battle, a little from nibbling, all of it at rest points, so skills stay in use.
- A player who fights most visible enemies arrives at each boss at or within one level of it. **Easy** (half enemy damage in RPG battles, army enemies 25% weaker, finale spawns slower, army auto-pause on contact) can be turned on or off in Settings at any time.
- The quest log always shows the next step in one line.

## Systems

### Exploration and the isometric engine

- **Tiles:** 2:1 diamonds, 32x16 pixels at the 640x360 logical resolution. Grid x runs down-right, y runs down-left. Heights 0 to 3, 8 pixels a level. Screen position of a tile's top corner: `sx = (x - y) * 16`, `sy = (x + y) * 8 - h * 8`, minus the camera.
- **Hops:** one tile, 0.22 s (0.16 s after 3 held hops or on a clicked path; straight up/down the screen 0.8x), squash-and-stretch arc. A hop may go up or down one height level; tiles more than one level apart are blocked. Screen-relative keys: Up alternates (x-1) and (y-1), Right alternates (x+1) and (y-1), Down alternates (x+1) and (y+1), Left alternates (x-1) and (y+1); if one of the pair is blocked, the other is used. While a single key is held, the sprite's drawn position follows the straight screen line between tile centres (not the zigzag), and its facing stays the one it started with. Two keys together take the single step between them (Up+Right = y-1).
- **Map data:** text grids, one character per tile (legend per world), a height grid of digits, plus lists of props, actors, enemies, doors (`{x, y, to, tx, ty}`), triggers and flags. Up to 56x56 tiles; about 45 maps.
- **Props:** each has a footprint (w x h tiles), a base tile (its back corner) and a pixel height. Footprint tiles are impassable unless marked. **Walkable** pieces (the tree-bridge, the raft, weir planks) are not props: they're ground-layer images with a height, drawn under every actor.
- **Depth sorting:** everything (ground blocks, props, actors) gets a key = (x + y) of its own tile, then height, then x. Actors sort at their foot tile + 0.5. **Every prop wider than one tile** that isn't on a map's back edge (the tea table, logs, the motor-car, the Munchkin house, the banquet table, the moving root) is cut at load into one-tile-wide vertical strips, one per footprint tile, each sorted on its own tile; so a 3x1 tea table on (5,5) to (7,5) sorts as 10, 11 and 12, and Bramble at (5,6) (11.5) draws over the strip at (5,5) and under the one at (7,5), as he should. Props on back edges where nobody can walk behind them (Toad Hall, the Emerald City gate, the Winkie tower, the White Rabbit's house, the palace gate, the mural wall) stay whole.
- **Picking:** a click tests tile top faces from height 3 down to 0; among hits, the nearest to the camera (largest x + y) wins. Actors and props are tested first by their sprite rectangle.
- **Pathfinding:** A* on 4 neighbours, cost 1 per hop + 0.5 per height change, capped at 600 nodes; clicking a person or chest walks to the nearest free neighbour, then uses it.
- **Camera:** follows Bramble with a short ease, clamped to the map; small maps are centred. The ground layer of each map is pre-rendered once to an offscreen canvas in 512x512 chunks.
- **People:** talk; lines change with flags. Every named character has at least two sets of lines (before and after their story beat). Shopkeepers, rest points, chests (buttons or items) and blank signposts whose words are drawn in code.
- **Nibbling:** on clover, grass or sweetgrass tiles, N nibbles (Bramble turns to face down-right, plays the nibble animation and a munch). +5% of everyone's Heart and +3% Pluck; each patch 3 times per visit. Sweetgrass (rare) +25% Heart and Pluck.
- **Enemies on maps (turn-stepped):** map enemies move only when Bramble hops, so the same key presses always give the same result. Each of his hops, a wandering enemy takes one step along its fixed loop of 3 to 6 tiles; within 4 tiles it chases, stepping toward him on 2 of every 3 of his hops (so he can always outpace it); beyond 7 it walks back. Standing still, they idle in place (code bob). Touching one starts a battle; stepping onto it from the tile behind it gives the party the first turn. Each map enemy shows its facing with a small code-drawn chevron on the ground in front of it (the tile opposite is its back). Non-Bramble sprites use their front view and a code hop (squash, bob), mirrored for left and right; when walking up the screen they keep the front view, except generic rabbits and raiders, which have back views and real hops.
- **Followers:** the line behind Bramble is: anyone he's escorting (the hedgehog lads, Wick, Rumble), then the two travelling companions in party order. Each follower steps onto the tile the one ahead of it just left (a trail of Bramble's last tiles), hopping with a code hop (squash, stretch, a small arc, a dust puff) in its front view when moving down the screen and its **back view** when moving up, mirrored for left and right. Followers are never blocked and never block (Bramble can hop back through them; they just shuffle), never trigger enemies or triggers, and warp in behind him on a map change, a cutscene teleport, or if more than 3 tiles adrift. A clicked path makes them follow at the fast hop speed. They stand still and face Bramble when he talks; while he nibbles they nibble or sit.
- **Merging ("tuck in"):** on maps marked `merge` (every Wonderland map with size puzzles, the shepherd's field, the China Country), and whenever Bramble isn't normal size, the companions hop into Bramble: each does one last hop onto his tile, shrinks into him with a soft pop and a puff, and is drawn no longer; the HUD portraits get a small "tucked in" leaf. Leaving the map (or Bramble returning to normal size on an unmarked map) pops them back out onto the tiles behind him, one at a time. Escorts don't merge: Rumble still follows in the sneak (he's the point of it). So size puzzles only ever involve Bramble's body, china tiles are only ever stepped on by Bramble, and the shepherd only ever has to see Bramble and Rumble: the puzzles and the reachability check are unchanged. `state().followers` lists each follower's id, tile, facing and `merged`.
- **Companions' voices:**
  - **Map-entry bubbles:** on entering each new map, one of the two travelling companions says a line, in a bubble over their map sprite (over their HUD portrait while tucked in) (about 45 maps x 1 to 2 lines, chosen by who's travelling).
  - **Talk** (camp menu tab, and at every rest stone): 1 to 2 lines per party member per area, varying with who else is in the party, plus **pair banters** that play when both are travelling (Toad and Badger, Ninefold and the Cheshire Cat, Tansy and Bramble, Ratty and Mole, Pip and Captain Quarry, the Tin Woodman and Rumble). A small leaf marks the tab when someone has something new to say. Line budget in `design/BIBLE.md`: about 15 members x 12 areas x 1.5 lines + 30 banters of 4 to 6 lines.
  - Story-point bubbles, as before.
- **Camp menu (Tab):** Party (pick the 2 who travel with Bramble; stats; equip), Talk, Items, Army (squads, gear), Quests, Map, Bestiary (everyone you've met: portrait and a line).
- **Thimblebank rebuilds:** after each chapter more rooms are repaired and lit, rescued and freed rabbits move in, recruits visit (Badger by the fire, Ninefold in a dark corner, being polite), and each new recruit appears there on your next visit.

### One-off mechanics

- **Mole's scent trail (Wild Wood):** six warm-shimmer tiles (code-drawn glow on the snow) in a fixed order; only the next one is visible, and only within 4 tiles of the last one stepped on. Wrong turns cost nothing; the snow and the darkening palette make it eerie. The last marker is Mole himself.
- **The Kalidah chase (Oz):** a scripted crossing of the tree-bridge (a walkable ground piece over the ditch), then the Lion's roar scene, then a normal battle against two Kalidahs with a "The bridge creaks: 4 rounds" counter shown in the turn bar. At zero, the Tin Woodman's axe drops the bridge and the Kalidahs tumble into the ditch, grumbling (sent packing): the battle ends as a win either way.
- **Sneaking past the giant shepherd (Journey):** he stands on a rise; his gaze points in one of four directions on a fixed 2-second rhythm (the order is in the map data), shown as a faint pale cone on the ground 5 tiles long; half a second before he turns, a low creak. Tiles under the tall mushrooms are cover. If Bramble (or Rumble, following) ends a hop in the cone and not on cover, the screen dims, a soft hum, and both are back at the zone's last mushroom checkpoint; nothing lost. `state().gaze` exposes the direction and ticks to the next turn; the reachability check proves a path from checkpoint to checkpoint exists through at least one gaze window.

### Size puzzles (Wonderland)

- Bramble has three sizes: **small** (his own 16-pixel sprite and hop frames, made from the 1024 sources; fits `s` tiles: little doors, under tables, the mouse-hole), **normal**, **big** (his 64-pixel sprite and hop frames; steps over `h` hedge tiles and up two height levels; reaches `t` high-shelf triggers; cannot enter `s` tiles or indoor maps marked `low`).
- Size changes come only from **unlimited sources** on the map: Drink Me bottles (small) and Eat Me cakes (big) refill every time; a normal-size stub of mushroom returns you to normal. After the Caterpillar, the two sides of the mushroom let you change size anywhere in Wonderland from the camp menu.
- Size resets to normal on every map change.
- Big Bramble's sprite covers neighbouring tiles visually; big-only regions keep tall props at least one tile away so sorting stays clean.
- **Reachability check** (`tools/reach.mjs`): a search over (x, y, height, size) for every Wonderland map and the China Country, from every entrance, proves every door, chest, person and trigger is reachable and every exit can be reached back. It also covers the shepherd's field (with gaze state). Runs in the play-test.

### Cracking tiles (China Country, optional)

- `c` tiles are thin china. The first step leaves a visible crack; the second step on the same tile breaks it, with a crunch and "Oh, I am sorry!", and Bramble is set back at the map's entrance, nothing lost. Cracks reset when you re-enter.
- Every route through needs each `c` tile at most once; the reachability check proves it (a crack counts as state).

### RPG battles

- **Screen:** a painted backdrop plus a strip of code tiles; party of 3 on the left, up to 4 enemies on the right (64-pixel battle sprites). Each party member, regular enemy and boss has a second **action pose** that swaps in during its lunge, skill or cast.
- **Rounds:** each round everyone acts once in order of Speed (ties: party first, then lower id), shown as a row of portraits at the top.
- **Commands:** **Tussle** (the basic move: a friendly scuffle, power 1.0), **Skill** (costs Pluck), **Item**, **Guard** (damage taken halved until next turn, +10% max Pluck), **Swap** (bring in a reserve; the newcomer acts next round), **Flee** (not from bosses or story battles; always works in Thimblebank Depths, 70% elsewhere, seeded).
- **Stats:** Heart (HP), Pluck (PL), Strength (STR), Toughness (TGH), Speed (SPD), Wits (WIT). Level cap 30. All party members, including reserves, get full XP from every win.
- **After a win:** everyone (reserves included) regains 30% of max Pluck; Heart stays as it was.
- **Enemy bars:** Hum-taken show a **Hum** bar (woken at zero); depth creatures **Shadow** (fade at zero); storybook foes Heart ("sent packing").

**RPG formulas** (in `data/core/formulas.js`; every chapter uses them unchanged):
- Stat at level L: `stat(L) = round(base * (1 + 0.1 * (L - 1)))`. Same for party and enemies.
- Damage: `max(1, round((ATK * power - DEF * 0.5) * variance * crit * mods))`. ATK is STR (physical) or WIT (Light, mind, eerie); DEF is the target's TGH. Variance 0.9 to 1.1; crit 5% for x1.5. Guard x0.5; Shielded x0.6.
- Heals: `round(WIT * power)`; power 1.5 single, 0.9 all.
- Skill rules: single hit power 1.4 to 1.8, 4 to 6 PL; hit all 0.9 to 1.1, 8 to 10 PL; status skills 70% chance (35% on bosses), 3 turns; buffs +30% for 3 turns. Each member gets 3 skills at join, a 4th at level 10, a 5th at level 20.
- Statuses: **Afraid** (STR -30%; Ninefold in the party and Courage gear prevent it), **Asleep** (skip turns; wakes when hit; 3 turns at most), **Hummed** (50% chance to act on a random target), **Shrunk** (dodge +30%, STR -30%), **Grown** (STR +30%, dodge -20%), **Shielded** (damage taken x0.6, 2 turns). Base dodge 5%.
- Tags: **Eerie** enemies take x1.5 from Light skills; **Flying** enemies dodge 50% of skills tagged Dig.
- XP to the next level: `round(55 * L^1.4 + 60)` (balance pass; the first draft's `12 * L^1.6 + 20` levelled the party about 3x too fast for the real encounter lists). Enemy XP: `round(9 * L * tier)` (calibration: was 8), and each member gets it times a level catch-up `clamp(1 + 0.3 * (foe level - member level), 0.25, 2)` (state.js xpCatchUp: a main-path player who skipped wanderers catches up, a full-clear or grinding player levels slower; see design/progress/calibration.md); bosses x5 (a boss made of several parts, the Choir's mouths and the Hollow Rabbits, shares one boss's XP). Buttons dropped: `2 * L` per enemy (was 3). `tools/curve.mjs` plays every visible fight in order and checks the party's level at each boss and segment, and each chapter's button income.
- New members join at `max(their join level, the party's average level)`.
- Enemy tiers (code tint and stat bump): Normal x1, Strong x1.25 (warm tint), Elite x1.5 (tint and glow), all stats except SPD. Bosses: Heart x8 (the four Hollow Rabbits x2 each), other stats x1.25, plus their listed mechanic.

Target levels (in play order): Prologue 1 to 3, Depths 3 to 5, River Bank 5 to 8, Wonderland 7 to 10, Shallows 10 to 11, RTS 1 and the Great Burrow 11, Silverdown 12 (Aster 13), Moon 13 to 15, Drowned Halls 15 to 16, Wheatsheaf 17 (Barley 18), Oz 17 to 20, Stair 20 to 21, Flintcomb 22 (Quarry 23), Journey 23 to 25, Root 25 to 26, Finale 26 to 28. Bosses sit one level above their area. Normal fights last about 3 to 4 rounds, bosses 8 to 15. (Balance pass, as built: Chief Weasel 8, Tansy 17, Tidewarden 18, Barley 19, the finale's bosses 27 and its dream-shapes 26; the RTS 1 and Great Burrow party is 12, the Drowned Halls 16, Wheatsheaf 18.)

**`tools/balance.mjs`** (run in the play-test) uses each point's expected party level (from the play order above), the chapter's shop gear and its expected party, and checks:
- every boss, played with its **counter policy** (below), is won in 8 to 15 rounds; played with the plain AI (heal below 40%, else best skill) it is lost or takes more than 15 rounds;
- a sample of normal fights ends in 3 to 6 rounds;
- a **whole-dungeon run** for every world and depth layer (all its fights in order, Pluck carried over, the 30% restore after each win, no rest until the rest stone) never leaves the party unable to afford a skill for more than one fight in a row;
- each chapter's expected button income (below) is at least 1.1x the gear and items it assumes.

Bosses: base template and counter policy

| Boss (level) | Template | Mechanic | Counter policy the balance tool plays |
|---|---|---|---|
| Chief Weasel (9) | Brute | Calls a Weasel every 3 rounds | Hit-all skills on the round a Weasel arrives |
| Queen of Hearts (11) with the Knave | Brute + Quick | "Off with—" charges 2 rounds, then a big hit; Knave steals an item | Guard the round it lands |
| Whispering Choir (12) | Eerie Caster, 3 mouth targets | One mouth speaks each round (glows): its line inflicts Afraid on all | Hit the glowing mouth: silenced, no Afraid that round |
| Aster (13) | Caster | Hummed on one | Cure with Spring-Cleaning; keep Ninefold in |
| Moth Queen (16) | Flyer | Summons 2 moths when alone | Light skills; keep a moth alive |
| Tansy, Hum-taken (16) | Quick | Fast, 2 actions | Shielded and Guard; Afraid on her |
| Tidewarden (17) | Eerie Brute | 2 phases; submerged (untargetable) every 3rd round, then a big strike | Guard and buff on submerged rounds |
| Barley (18) | Brute | Guard-breaking Plough | Don't Guard on his charge; heal after |
| Wicked Witch of the West (21) | Caster | Sends a wave each phase | Each Water Pail splash takes a third of her Heart (three melt her); the castle well refills pails and two sit by the door |
| Watcher on the Stair (22) | Eerie Caster, 7 eye targets | Opens 1 of 7 eyes a round; 7 open = "Seen" (big hit all + Afraid), then all close | Hit an open eye every round |
| Captain Quarry (23) | Brute | Quarry Collapse every 3 rounds | Shielded before the collapse |
| Hollow Rabbits (26) | 4 Eerie Quick | Each wakes into a fading mote | Light hit-all |
| Nightmare of Deepdelve (28) | Eerie Brute | Pulls one member out for a round | Swap in a reserve |
| Nightmare of Flintcomb (28) | Eerie Quick | Hums the party (Hummed) | Cure; Ninefold's Unspeakable |
| The Undersleeper's Eye (28) | Eerie Caster | The Dreaming bar | Tell a Story each round |

Party base stats at level 1 (HP, PL, STR, TGH, SPD, WIT), join level, role and starting skills

| Member | HP | PL | STR | TGH | SPD | WIT | Joins (lvl) | Role | Skills (first three, then 10, 20) | Squad |
|---|---|---|---|---|---|---|---|---|---|---|
| Bramble | 40 | 12 | 10 | 8 | 10 | 8 | Start (1) | All-rounder | Thump (hit, 20% stun), Rally (party +PL), Burrow Dash (act first next round); Brave Heart; Long Thump (big hit all) | Thimblebank Rabbits |
| Burdock | 50 | 8 | 11 | 12 | 6 | 5 | Prologue (1) | Guard | Dig In (taunt + Shielded), Shove, Earthwork (party TGH up); Landslide; Hold the Line | Thimblebank Diggers |
| Mole | 38 | 16 | 7 | 8 | 8 | 12 | River Bank (5) | Healer | Mole End Supper (heal one), Tunnel Under (Dig hit, ignores Guard), Spring-Cleaning (cure); Whitewash; Home at Last (heal all) | Field-mouse Carollers |
| Ratty | 36 | 14 | 10 | 7 | 11 | 9 | River Bank (5) | Ranged | Pebble Sling, Messing About in Boats (party SPD up), A Poem (heal PL); Oar Sweep; Picnic Hamper | Otters |
| Badger | 56 | 8 | 12 | 13 | 5 | 6 | River Bank (6) | Tank | Stout Stick, Stern Word (Afraid), Old Fortress (party Shielded); Wild Wood Lore; Head of the Table | Hedgehogs |
| Toad | 42 | 10 | 12 | 6 | 9 | 6 | River Bank (7) | Wild card | Poop-poop! (random 0.8 to 2.4 hit), Boast (STR up, self), Disguise (ignored 1 round); Motor-car; Toad of Toad Hall | Reformed Weasels |
| Cheshire Cat | 34 | 14 | 10 | 6 | 14 | 10 | Wonderland (8) | Rogue | Vanish (untargetable 1 round), Grin (Afraid, not Eerie), Which Way? (Hummed on enemy); We're All Mad Here; Grin Without a Cat | The Grin |
| Caterpillar | 32 | 20 | 5 | 6 | 7 | 14 | Wonderland (8) | Mage | Who Are You? (WIT hit), One Side (Grown on ally), Other Side (Shrunk on enemy); Hookah Haze (Asleep all); Butterfly Dream | Flamingos |
| Ninefold | 38 | 18 | 6 | 8 | 7 | 14 | Shallows (10) | Eerie mage | Nine Eyes Open (reveal, TGH down), Fold (take a hit for an ally), Unspeakable (Afraid all; x1.5 vs Hum-taken); Polite Refusal; Ninefold Welcome | The Polite Dark |
| Jade Rabbit | 36 | 20 | 6 | 7 | 10 | 14 | Moon (13) | Light healer | Elixir (heal all), Moonbeam (Light hit), Pestle (hit); Mooncake; Moonrise (revive) | Moon Hares |
| Tansy | 36 | 12 | 12 | 6 | 14 | 7 | Drowned Halls (16) | Fast striker | Quick Paws (2 hits), Sharp Tongue (Afraid), Lookout (party dodge up); Race You; Best Friend (protect Bramble) | Tansy's Scouts |
| Tin Woodman | 48 | 10 | 13 | 12 | 6 | 6 | Oz (17) | Stout hitter | Axe, Oil Can (cure + heal self), A Kind Heart (heal one); Tin Shield; Woodman's Swing (hit all) | Winkies |
| Pip | 30 | 16 | 6 | 6 | 13 | 10 | Wheatsheaf (17) | Support | Found It! (random useful item), Hide (untargetable, then surprise hit), Cheer (small heal all); Listen to the Ground; Brave Little Kit | Pip's Kits |
| Captain Quarry | 52 | 10 | 14 | 12 | 6 | 5 | Flintcomb (23) | Heavy digger | Flint Strike, Quarry Collapse (Dig hit all), Never Again (party Guard); Deep Memory; Last Dig | Flintcomb Diggers |
| Rumble | 64 | 8 | 14 | 14 | 4 | 4 | Journey (24) | Bruiser | Trumpet (Afraid all), Trample (hit all), Shelter (party Shielded); Herd Call; Mastodon March | Mastodon Herd |

Enemy templates at level 1 (HP, STR, TGH, SPD, WIT): **Brute** 47, 9, 8, 5, 4; **Quick** 34, 8, 5, 12, 5; **Caster** 31, 5, 5, 8, 10; **Swarm** 39, 6, 4, 9, 4 (hits twice at power 0.6); **Flyer** 31, 8, 4, 13, 5 (Flying); **Eerie** 39, 6, 6, 7, 10 (Eerie; Afraid skill). (Heart is 1.3x the first draft so normal fights last 3 to 6 rounds; bosses' Heart multiplier is 6.2 instead of 8 so their Heart is unchanged. Deeper areas give their normal fights a little more Heart in data where the party's gear out-scales them.)

**Ordinary fights (no boss): short and sharp** (design/progress/fights.md). Enemy Heart x0.75, STR/WIT x1.15, TGH x0.5 (data/core/enemies.js `NORMAL_FIGHT`); enemies don't crit; each template shows one readable threat:
- **Brute** (and the Carving that Moves): winds up for a turn, naming its mark ("The Stoat rears back, glaring at Bramble... (Guard!)"), then Big Swing (power 1.75) on it.
- **Quick**: crouches, eyeing the member with the lowest Heart, then Pounce (1.7). **Flyer**: climbs above its mark, then Dive Bomb (1.7).
- **Caster** (and the Eerie eyes: Drowned Eye, Shut Eye, Star-Thing): gathers a charge over everyone, then Spark Storm (1.05, all).
- **Swarm**: Smother (Asleep). **Eerie**: Whisper (Afraid). Pepper Cloud: Sneeze (Stunned).
A wind-up blow never misses or crits and Guard halves it; only one foe winds up at a time and at most one blow lands per round; knocking the foe out, or putting it to sleep or stunning it, cancels the blow. Targets: 3 to 4 rounds with sensible play (2.5 late in the game, where hit-all skills are strong), at most ~6.5 when mashing Tussle; regular hits up to ~30% of the squishiest member's Heart, wind-ups ~30 to 50% (half when Guarded); Depths hits ~10%, wind-ups ~20%. Boss fights, their minions and summons keep the moves and numbers above.

Enemies (31 types, each at up to 3 tiers)

| World (level) | Enemies (template) | Boss (level) |
|---|---|---|
| Thimblebank Depths (2 to 4) | Root-tangler (Brute), Dazed Earthworm (Swarm), Burrowing Beetle (Quick) | none |
| River Bank (5 to 8) | Weasel (Quick), Stoat (Brute), Ferret Sentry (Caster) | Chief Weasel (9) |
| Wonderland (8 to 10) | Card Soldier (Brute), Pepper Cloud (Caster; Sneeze skips a turn), Flying Teapot (Flyer) | Queen of Hearts with the Knave (11) |
| Shallows (10 to 11) | Whisper (Eerie), Carving that Moves (Eerie Brute) | Whispering Choir (12) |
| Hum-taken rabbits | Hum-taken Raider (Quick), Digger (Brute), Lookout (Caster: raises allies' SPD) at Thimblebank 11, Silverdown 12, Wheatsheaf 17, Flintcomb 22 | Chert's band (11, normal fight), Aster (13), Barley (18), Captain Quarry (23) |
| Moon (13 to 15) | Lantern Moth (Flyer), Dust Hopper (Quick) | Moth Queen (16) |
| Drowned Halls (15 to 16) | Drowned Eye (Eerie Caster), Cold Ripple (Eerie Swarm) | Tansy, Hum-taken (16); Tidewarden (17) |
| Oz (17 to 20) | Kalidah (Brute), Hammer-Head (Brute, ranged), Winkie Guard (Brute), Crow of the West (Flyer), Wolf of the West (Quick) | Wicked Witch of the West (21) |
| Stair of Eyes (20 to 21) | Late Footstep (Eerie Quick), Shut Eye (Eerie Caster) | Watcher on the Stair (22) |
| Journey (23 to 25) | Cave Lizard (Quick), Trilobite Swarm (Swarm), Electric Eel-cloud (Caster) | none (the sea monsters are scenery) |
| Root of the World (25 to 26) | Moving Root (Brute), Star-Thing (Eerie Caster), Hollow Rabbit (Eerie Quick) | Hollow Rabbits (26) |
| Finale (27 to 28) | Dream-shapes: Drift, Weight, Flicker (tints of Whisper, Late Footstep, Star-Thing) | Nightmare of Deepdelve, Nightmare of Flintcomb, the Undersleeper's Eye (28) |

### Gear, items and shops

- Currency: **buttons** (Wonderland pays in card pips, the Moon in pearls, Oz in emeralds; one total).
- Each party member has 3 slots: **Tool** (+3t STR or WIT), **Coat** (+2t TGH, +6t HP), **Charm** (one effect plus +t to one stat: Courage Ribbon prevents Afraid, Poppy Ward prevents Asleep, Silver Bell gives first turn, Motor-goggles +SPD...). t is the gear tier, 1 to 6. Price `round(30 * t^1.7 / 5) * 5` buttons (30, 95, 195, 315, 465, 630). About 45 pieces, 6 to 10 per shop, each shop themed (Mole's spare waistcoats, the Dodo's thimble armour, moon-silk coats, emerald-spectacle charms, mastodon-hide coats).
- **Gear isn't tied to anyone:** any piece can go on any member and come off again; reserves keep what they last wore. **Auto-equip best** (one button in Party, and offered after every purchase) fills the travelling three from everything owned. So 9 pieces per tier outfit the party.
- Items (15): Clover Bunch (heal 30), Dandelion (heal 80), Carrot Cake (heal all 60), Pluck Berry (+15 PL), Smelling Salts (cure Asleep), Courage Biscuit (cure Afraid), Drink Me / Eat Me (battle: Shrunk / Grown), Comfits (Wonderland: heal 40 all), Mooncake (Moon: heal 120), Jade Elixir (revive at 50%), Emerald Lozenge (+30 PL all), Water Pail (Oz: a third of the Witch's Heart), Glow-Mushroom (heal all 200), Star-stone (Root: cure all statuses). Key items (11): Old Key, Pip's button, sweetgrass, Tansy's chalk pebble, Ninefold's dandelion, mushroom halves, Jade pestle, silver shoes, Golden Cap, Barley's bell, Silverdown and Wheatsheaf Depths keys (one icon, tinted).
- **Army gear** (bought at the same shops), per squad kind (Stout, Swift, Wing, Eerie), three ranks each: **Banners** (Atk +15% per rank), **Mail** (damage taken -10% per rank), **Rations** (HP +10% per rank). Prices 60 / 150 / 300 buttons. Rank 1 on sale from Ch1, rank 2 from Ch2, rank 3 from Ch3.
- Shops: Mallow (Thimblebank, tier rises each chapter), Ratty's Riverside Swap (t1 to 2), the Dodo's Caucus Store (t2), the Moon Toad (t3), the Emerald City Market (t4), Quarry's old store (Flintcomb, t5), Elevenfold's stall (Root, t6).

**Button economy** (targets the builder tunes encounter lists and chests to; `balance.mjs` checks income ≥ 1.1x what's assumed)

| Chapter | Expected income (80% of visible fights, chests, quest chests) | What balance assumes is bought | Cost |
|---|---|---|---|
| Ch1 | about 2,300 (40 fights, avg level 8) | 9 t2 pieces, 4 rank-1 army items, items | about 1,450 |
| Ch2 | about 3,200 (30 fights, avg 14) | 9 t3 pieces, 4 rank-2 army items, items | about 2,750 |
| Ch3 | about 5,000 (32 fights, avg 19) | 9 t4 pieces, 4 rank-3 army items, items | about 4,550 |
| Ch4 | about 6,700 (32 fights, avg 24) | 9 t5 pieces, 4 rank-3 army items, items | about 6,000 |

Elevenfold's t6 stock is a reward for players who have saved or cleared everything.

### The army battles (light RTS)

Strategy over clicking: few squads, a pause that accepts orders, battles decided by where you send squads and which matchups you choose. The simulation (`src/rts/sim.js`) is pure, deterministic and has no randomness; drawing reads from it.

**Field, camera and movement**
- The same isometric engine on a downs map with 7 to 10 **nodes** linked by **paths** (polylines of tiles). Field sizes: Prologue 20x20, RTS 1 to 3 about 28x28 (896x448 pixels), RTS 4 32x32 (1024x512), RTS 5 22x22 (fits one screen). Squads move only along paths, node to node. Path length is its tile count.
- **Camera:** pans with the arrow keys (8 tiles a second), edge-scroll (the outer 12 pixels; on by default, off in Settings) and middle-drag; C centres on the selected squad, V on home. Starts centred between home and the first contested node.
- **Minimap** (top-right, 128x64, a diamond of the whole field): every node as a coloured dot with its letter, squads as small dots in their side's colour (hidden squads not shown), the view as a rectangle, and incoming waves as a blinking marker. Left-click jumps the camera; right-click orders the selected squads to the nearest node.
- **Off-screen alerts:** when a wave leaves the warren mouth or a held node is contested off-screen, an arrow at the screen edge points to it with a horn note; clicking the arrow jumps there.
- Simulation tick: 10 per second at 1x (20 at 2x). Orders given while paused apply on the next tick. **Auto-pause** (Settings, off / every 10 s / on first contact) stops the sim exactly on the tick.
- Node kinds: **home** (yours), **warren mouth** (theirs), **clover** (+0.5 Supply/s to its holder), **hilltop** (+25% Def to its holder's squads on it), **burrow mouth** (Stout squads can tunnel to any other friendly burrow mouth in 6 s, unseen), **fortified** (+50% Def to its holder), **Thump Stone** (finale), **plain**.
- **Cover** is a property of paths and nodes (corn): squads on cover are hidden from the other side unless an enemy squad is within 3 tiles (6 for squads with "reveal"). Hidden squads aren't drawn, can't be ordered against, and are ignored by enemy AI, but fight on contact.
- **Capturing:** a node changes hands when one side has squads on it and the other has none, for its capture time (5 s; Swift 3 s; perks below). Contested progress pauses; leaving resets it. Neutral nodes start neutral.
- **Contact:** squads on the same node, or on the same path within 1 tile, are in contact and stop moving. A squad ordered away disengages and takes one second of free hits.
- **Worn out:** a squad at 0 HP limps back to home and sits out the rest of that battle (it's back at full strength next battle).

**Squad kinds** (base values)

| Kind | HP | Atk | Def | Speed (tiles/s) | Capture | Special |
|---|---|---|---|---|---|---|
| Stout | 120 | 10 | 6 | 1.2 | 5 s | Tunnels between friendly burrow mouths |
| Swift | 80 | 12 | 3 | 2.0 | 3 s | none |
| Wing | 70 | 11 | 2 | 2.4 | 5 s | Not slowed or hidden by cover |
| Eerie | 100 | 9 | 5 | 0.9 | 5 s | Aura: non-Eerie enemies in contact or within 3 tiles have -20% Atk; Reinforce costs +5 |

**The triangle:** Stout beats Swift (a wall they can't get past), Swift beats Wing (quick enough to catch them landing), Wing beats Stout (dive over the wall). Matchup M is **2.0** when the attacker's kind beats the target's, **0.5** when it's beaten, else 1.0. **Light** squads (Moon Hares, Lantern Moths) have M = 2.0 against Eerie.

**Combat:** each squad attacks one target in contact: the one with the best M for it, then the lowest HP, then the lowest id. Each tick it deals one tenth of

`DPS = A * M * (0.5 + 0.5 * hp / maxHp) * 10 / (10 + D)`

where `A = Atk * squadAtk * scale * banner * buffs * aura` and `D = Def * squadDef * nodeBonus * perks` (Def is a divisor, not a subtraction, so it can't cancel the matchup; damage is always above zero, so every fight ends). Damage taken is then multiplied by `(1 - 0.1 * mailRank)`. `scale` multiplies Atk and HP (not Def): the player's **army rank** `1 + 0.12 * warrensFreed` for your squads (1.0 at RTS 1, 1.12 at RTS 2, 1.24, 1.36, 1.48 at RTS 5) and the battle's **tier** for theirs (below). HP = base HP x squadHP x scale x rations. A squad is drawn as `max(1, ceil(5 * hp / maxHp))` copies of its leader's (or base) map sprite, with a banner in its colour and a health bar.

**Duel check** (one squad against one, from `tools/rts-balance.mjs`; the same numbers came from the design's prototype sim). Every triangle edge must win with at least 30% HP left at base values, still win against the strongest Def multipliers, and mirrors must end:

| Duel | Time | Winner, HP left |
|---|---|---|
| Stout v Swift | 5.4 s | Stout, 87% |
| Swift v Wing | 3.7 s | Swift, 85% |
| Wing v Stout | 10.0 s | Wing, 56% |
| Wing v Quarrymen (Stout 1.2 HP, 1.3 Def) | 14.1 s | Wing, 38% |
| Wing v Stout on a hilltop | 11.1 s | Wing, 51% |
| Wing v Stout fortified | 12.2 s | Wing, 46% |
| Flamingos v Quarrymen fortified (worst case, RTS 4's warren mouth) | 18.2 s | Wing, 21% |
| Winged Monkeys v Quarrymen fortified | 14.4 s | Wing, 37% |
| Stout v Silverdown Rabbits on a hilltop (+20%) | 6.1 s | Stout, 86% |
| Swift v Wing fortified | 4.0 s | Swift, 84% |
| Mirrors: Stout, Swift, Wing, Eerie | 26.6, 12.0, 10.6, 23.1 s | both worn out |
| Eerie v Stout / Swift / Wing (aura on) | 24.4 / 14.2 / 10.8 s | Stout 17% / Eerie 33% / Eerie 53% |
| Moon Hares (Light) v Eerie | 9.7 s | Moon Hares, 32% |

**Supply:** start 20; +0.5/s from home and +0.5/s per held clover; cap 99. Spent on:
- **Reinforce** (10, key T or the button): heals 40% of max HP for each selected squad on a friendly node, not in contact; 5 s cooldown per squad.
- **Abilities** (one per freed warren, keys Q W E R, then a target): **Rally** (from RTS 2, 25: all squads +20% Atk for 10 s; no target), **Moonlight** (from RTS 3, 30: reveal everything for 20 s and heal 25% for squads on the target node and its neighbours), **Monkey Drop** (from RTS 4, 35, twice per battle: place a temporary Winged Monkeys squad on the target node for 30 s), **Tunnel** (RTS 5, 20: move the selected squad instantly to the target friendly burrow mouth). While targeting, valid nodes glow and their letters pulse; Escape cancels with no cost. The finale's Long Thump is the battle itself.

**Winning and losing:** take the enemy's warren mouth and hold it uncontested for 10 s (RTS 4: hold the warren mouth and the quarry lip together for 10 s). You lose if they take your home node or every squad is worn out. "Retreat" in the pause menu counts as a loss. Either way, nothing is lost and you can retry at once.

**Enemy behaviour** (data per battle, no randomness): **guards** hold a node and attack anything that enters it or the paths next to it, then return; **waves** leave the warren mouth at fixed times along a fixed route of nodes, and each wave aims at the nearest node on its route that the player holds.

**The Lookout Stone odds** are computed by running the same sim headlessly (about 3,000 ticks, well under 100 ms) with the default army choice and a simple player AI (every squad advances by the shortest path on the nearest node it doesn't hold, fighting what it meets). Auto-AI loses: **Weak**. Wins with under 40% of total HP left: **Even**. Wins with more: **Strong**. A thoughtful player using the triangle and pause beats the simple AI, so "Even" means winnable. The stone also shows "Squads ready: n of m" (m = the required recruits for that battle). The advice line names the kind that beats the enemy's most common kind and an unpicked or unrecruited squad of that kind ("Their army is mostly Stout. Flyers would help: the Flamingos are waiting in the camp menu."), or else a gear rank to buy.

**Balance targets** (`tools/rts-balance.mjs`, run in the play-test): the duel table above holds (every edge ≥ 30% at base values, wins against Quarrymen, hilltop and fortified, mirrors end); for each battle, required recruits only with no army gear give Even; with optional recruits and rank-appropriate gear, Strong. RTS 1 is checked both with and without the Polite Dark (the Shallows may come after it) and must be Even without it. The builder tunes each battle's tier to meet them.

Player squads (multipliers on the kind's base: HP, Atk, Def, Speed)

| Squad | Leader | Kind | HP | Atk | Def | Spd | Perk |
|---|---|---|---|---|---|---|---|
| Thimblebank Rabbits | Bramble | Swift | 1.0 | 1.0 | 1.0 | 1.0 | Friendly squads on its node +10% Atk |
| Thimblebank Diggers | Burdock | Stout | 1.1 | 1.0 | 1.1 | 1.0 | Tunnels in 3 s |
| Field-mouse Carollers | Mole | Swift | 0.8 | 0.9 | 1.0 | 1.0 | Friendly squads on its node regain 1 HP/s |
| Otters | Ratty | Swift | 1.0 | 1.1 | 1.0 | 1.2 | none |
| Hedgehogs | Badger | Stout | 1.2 | 0.9 | 1.2 | 0.9 | Attackers in contact take 1 damage/s |
| Reformed Weasels | Toad | Swift | 0.9 | 1.2 | 0.8 | 1.1 | none |
| The Grin | Cheshire Cat | Swift | 0.7 | 1.3 | 0.8 | 1.1 | Always hidden until in contact (drawn as the Cat's own 64-pixel battle sprite, one figure) |
| Flamingos | Caterpillar | Wing | 1.0 | 1.0 | 1.0 | 1.0 | none |
| White Rabbit's Heralds | White Rabbit | Swift | 0.8 | 0.9 | 0.9 | 1.4 | Captures in 2 s |
| Card Gardeners (optional) | Seven of Spades | Stout | 1.0 | 1.0 | 1.0 | 1.0 | Captures in 4 s |
| The Polite Dark | Ninefold | Eerie | 1.0 | 1.0 | 1.0 | 1.0 | Aura |
| Chert's Band | Chert | Swift | 0.9 | 1.0 | 0.9 | 1.0 | Hum-taken squads deal it -10% |
| Silverdown Rabbits | Aster | Swift | 1.0 | 1.0 | 1.0 | 1.0 | +20% Def on hilltops |
| Moon Hares | Jade Rabbit | Swift | 0.9 | 1.0 | 1.0 | 1.2 | Light |
| Lantern Moths (optional) | Wick | Wing | 0.8 | 1.0 | 0.9 | 1.0 | Light; reveal |
| Tansy's Scouts | Tansy | Swift | 0.8 | 1.1 | 0.9 | 1.3 | Reveal |
| Wheatsheaf Rabbits | Barley | Stout | 1.1 | 1.0 | 1.1 | 1.0 | Hidden on cover unless an enemy is within 1 tile |
| Pip's Kits | Pip | Swift | 0.7 | 0.8 | 0.8 | 1.2 | +3 Supply per capture |
| Winkies | Tin Woodman | Stout | 1.2 | 1.0 | 1.3 | 0.9 | none |
| Emerald Guard | Scarecrow | Stout | 1.0 | 0.9 | 1.2 | 1.0 | Friendly squads on its node +10% Def |
| Lion's Beasts | Cowardly Lion | Stout | 1.1 | 1.3 | 1.0 | 1.0 | +25% Atk when outnumbered in contact |
| Field Mice | Queen of the Field Mice | Swift | 1.0 | 0.8 | 0.8 | 1.1 | Regains 1 HP/s |
| Winged Monkeys | Monkey King | Wing | 1.0 | 1.2 | 1.0 | 1.1 | none |
| Flintcomb Diggers | Captain Quarry | Stout | 1.2 | 1.1 | 1.1 | 0.9 | Tunnels in 3 s |
| Mastodon Herd | Rumble | Stout | 1.6 | 1.2 | 1.2 | 0.7 | none (drawn with the adult mastodon sprite) |
| Deepdelve Echoes | (finale only, free) | Eerie | 1.0 | 1.0 | 1.0 | 1.0 | Aura; doesn't count toward the cap |

Enemy squads: **Raiders** (Swift, 1/1/1/1), **Diggers** (Stout, 1/1/1/1), **Lookouts** (Swift, 0.8/0.8/0.8/1.3, reveal), **Pigeon Riders** (Wing, 0.9/1/1/1.1), **Rooks** (Wing, 0.9/1.1/0.9/1.1), **Quarrymen** (Stout, 1.2/1/1.3/0.9), and the dream-shapes **Drift** (Eerie, 0.6/0.9/0.8/1.6), **Weight** (Eerie, 1.6/1.1/1.2/0.6), **Flicker** (Eerie, 0.8/1/0.8/1.3).

The battles

| Battle | Field | Nodes | Your cap | Enemy (starting tier) | Rules |
|---|---|---|---|---|---|
| Prologue (guided) | 20x20 | 5 | 2 | Raiders 3, Diggers 3 (x3) | Tutorial prompts; ends in the retreat |
| RTS 1 Sorrel Down | 28x28 | 7: home, ridge hilltop, central clover, 2 plains, burrow mouth, warren mouth | 8 | Raiders 4, Diggers 3, Lookouts 1 (0.8); a Raider wave every 60 s, 3 waves | Step-by-step tutorial: select, order, camera and minimap, take a node, the triangle, Reinforce |
| RTS 2 Silverdown | 28x28 | 8, a chalk ridge with two flanks | 9 | Raiders 3, Diggers 2, Pigeon Riders 4, Lookouts 1 (1.0); a Pigeon wave every 60 s | Flyers punish a Stout-heavy army; Rally |
| RTS 3 Wheatsheaf | 28x28 | 9, cornfields (cover) | 10 | Raiders 4, Diggers 3, Rooks 3, Lookouts 2 (1.15); waves every 60 s | Cover; Moonlight |
| RTS 4 Flintcomb | 32x32 | 10, quarry; warren mouth fortified, reached by two paths and a burrow tunnel | 10 | Quarrymen 5, Raiders 4, Diggers 2, Pigeon Riders 2, Rooks 1 (1.3); 2 squads every 45 s, 4 waves | Hold the warren mouth and the quarry lip together; Monkey Drop |
| RTS 5 The Long Thump | 22x22 | 6: home, 3 Thump Stones, 2 plains, plus 3 dark edges (spawn points, not orderable) | 12 (+ Echoes) | One dream-shape every 8 s (11 s on Easy) from the dark edges, cycling Drift, Weight, Flicker (1.35) | See below |

Squads beyond the tenth in the list (RTS 5) are selected by clicking the squad list, Tab, Shift-click or B.

**The Long Thump:** with n stones held, dream-shapes move at `1 - 0.15n` speed and attack at `1 - 0.1n`. The 60-second timer runs only while all three are held and **pauses** (doesn't reset) when one is lost. Each held stone shows a big glowing ring and adds a thump layer to the music. Win: the timer reaches 60. Lose: home taken or all squads worn out. RTS 4's "hold two at once" teaches the idea first.

## Win, lose and progress

- **Win the game:** finish the Dream; see the ending. The save then shows "Peace on the Downs" and you can keep wandering.
- **Lose:** nothing is ever lost; you return to the last door or the Lookout Stone.
- **Saving:** autosave on every map change and after every battle, plus 3 manual slots from the pause menu (anywhere outside battles and cutscenes). Each slot shows chapter, place, play time, party portraits. Settings saved separately.

## Screens

- **Title:** painted key art of Sorrel Down at dusk with the warren entrance glowing; the title in the game's font (code); Continue / New Game / Load / Settings. "Press any key" first (starts audio).
- **Intro:** three illustrated cards with a line each ("Under the downs, the rabbits of Thimblebank..."), skippable.
- **Exploration HUD:** top-left Bramble and his two companions' portraits with Heart bars (a "tucked in" leaf while merged); top-right the place name (fades after 3 s) and camp, pause, mute buttons; bottom the quest line (hidden while talking). The compass shows only with "Grid keys" on.
- **Dialog box:** the bottom 104 pixels: 80x80 portrait on the left (the listener's on the right in two-person talks), name tag, typed-out text (Space finishes the line, again advances), replies as a list.
- **Recruit card:** slides in when someone joins: portrait, name, party role and/or squad name and kind, their first line; then their banner joins a row of banners. 2.5 s, any key skips.
- **Camp menu:** tabs for Party, Talk, Gear, Items, Army, Quests, Map, Bestiary.
- **Shop:** stock with icon, price and an up/down arrow for each party member (or squad kind for army gear); "Auto-equip best" after buying.
- **RPG battle:** turn-order bar (with the bridge counter in the Kalidah chase), party with Heart and Pluck bars, enemies with their bar, command menu, damage numbers.
- **RTS preview:** the map, the odds and "Squads ready: n of m", your squads (pick up to the cap; strongest preselected), the advice, Start / Back (and "The warren rallies" after two losses).
- **RTS battle:** the field with node letters, squad list on the left (clickable, numbered 1 to 0), Supply, Reinforce and abilities at the bottom, pause and speed at the top, the minimap top-right, off-screen alert arrows at the edges.
- **Chapter cards:** a crop of a backdrop with a painted-style frame drawn in code and the chapter name in the font.
- **Pause:** Resume, Save, Load, Settings, Quit to title (and Retreat in army battles).
- **Settings:** music volume, sound volume, voice volume, mute, Easy mode, text speed (slow, normal, fast, instant), Grid keys, key hints, army edge-scroll, army auto-pause.
- **Game over** isn't a screen: a soft fade, "Up you get," and you're back at the door.
- **Ending and credits:** the sunset scene, credits scrolling over it (including "An idea by Rich Conlan").

## Juice

Must-haves:
- Squash-and-stretch hop with a tiny dust puff; ears bounce one frame behind. Every rabbit on the map hops for real (Bramble in four facings; generic rabbits and raiders in two, mirrored). Companions follow in a line with code hops in front and back views; tucking in is a little shrink-and-pop into Bramble with a puff, popping back out the reverse.
- Typewriter text with a soft blip every few letters, a different pitch per speaker.
- Battle hits: the attacker's action pose and lunge, 60 ms hit pause, white flash, a little knockback, numbers that arc and fade; crits shake the screen slightly and have their own sound.
- **The recruit moment:** the recruit card with its sting, the banner joining the row, and the friend showing up in Thimblebank on the next visit.
- Waking: the Hum bar shatters into glitter, the rabbit's eyes go from pale blue to brown, a little "?" then a heart.
- Depth creatures fade into drifting motes.
- Map transitions: an iris wipe shaped like a rabbit hole.
- RTS: squads bob as they march, banners wave, a taken node changes colour with a ripple, a drumbeat when an ability fires, glowing rings on held Thump Stones, edge arrows with a horn for off-screen waves.
- The Hum: in the Depths, a faint screen wobble and a low drone that grows each layer; carvings' eyes follow Bramble.
- Thimblebank's rooms light up as they're rebuilt.
- The finale's story vignettes: crossfade to the remembered world, the friend's line, the Eye's answer, a shimmer.
- The Witch's melt (animated), the Cheshire Cat's vanish (animated), Winged Monkeys flapping in.

Nice:
- Grass sways around Bramble's feet; fireflies at dusk on Sorrel Down.
- Wonderland shrink/grow: a stretchy scale tween between the three sprite sizes and a swanee-whistle.
- Day turns to evening as chapters pass (palette tint).
- Nibbling: cheeks puff.

## Art direction

- **Style line (pasted into every image prompt):** "clean isometric pixel art, chunky pixel art with large clean pixel clusters and bold simple shapes, cozy storybook mood, soft rounded shapes, warm downland palette of chalk white, sage green, meadow gold and earth brown, with deep indigo and teal for shadow, 1-pixel dark brown outlines, soft top-left lighting, clearly drawn eyes, no text, no letters, no numbers."
  - Depths art adds: "cold palette of indigo, slate and pale teal, faint glow, eerie but gentle, no gore."
  - Props add: "2:1 isometric, the same angle and ground as the reference image."
  - Battle backdrops add: "soft, low-contrast, muted, simple shapes, empty foreground, no characters."
  - Anything that could grow writing: "blank tag", "blank card face", "plain bottle with a blank label", "abstract swirl, not letters". Card numbers and suits, the Drink Me and Eat Me labels, the sealed door's sign, signposts, "A.S." on the carved rock, chapter titles and the title are drawn in code.
- **Style anchor:** Bramble's sprite, three-quarter view facing down-right, full body, made first (imagegen2 2.6 at `high`, transparent), saved as `game/assets/style-anchor.png`. Every character, portrait and prop prompt uses it as the first reference image.
- **Bramble's flopped ear:** his left ear flops (the near ear when he faces right, the far ear when he faces left). Left-facing views are not mirrors: the down-left and up-left stills are made by mirroring the down-right and up-right images and editing them with imagegen2 ("move the flopped ear to the far ear; change nothing else"), and his left-facing hops are animated from those. Every other character is mirrored freely.
- **Target screen:** right after the anchor, one nanogen mock screenshot of Sorrel Down at 640x360 with Bramble on it (anchor as reference). The code-tile colours and dither density are taken from it, and it's the second reference for every prop sheet.
- **Camera:** isometric (2:1 diamond tiles), fixed angle. Battles use the same characters at their battle size.
- **Logical resolution:** 640x360. Scale by whole numbers when that gives 2x or more (2x at 1280x720, 3x at 1920x1080), letterboxed; below 2x (an 800x600 or 1024x640 window), use the fractional fit with nearest-neighbour. Smoothing off for pixel art. **UI text** is drawn on a second, full-resolution canvas over the game in the bundled pixel font, so long dialog stays crisp.
- **One pixel size, no exceptions:** every image is drawn 1:1 on the 640x360 canvas at its native size; nothing is scaled at draw time. Odd sizes (small and big Bramble, the adult mastodon, the Grin squad) are their own reductions from the 1024 sources.

| Kind | Native size |
|---|---|
| Map sprites | rabbits 32x32 (kits 24, small Bramble 16, big Bramble 64), big creatures (Badger, Tin Woodman, Lion, Rumble) 48x48, adult mastodon 64x64 |
| Battle sprites and action poses | a separate reduction from the same source: rabbits 64x64, big creatures 96x96, bosses up to 200x160, the Choir 240x120, the Watcher 96x200 |
| Animation frames | reduced from their 1024 frames to every size they're used at (Bramble's hops at 16, 32 and 64) |
| Portraits | 80x80 |
| Props | their listed footprint and pixel height |
| Icons | items and gear 24x24, HUD and status glyphs 16x16 |
| Backdrops and key art | 640x360 |

- **The pixel pipeline** (`tools/pixelize.py`, Pillow): (1) cut each figure from its sheet by alpha bounds; (2) if the source shows a regular pseudo-pixel grid (run-length mode of 6 pixels or more) **and** dividing by it leaves the image at least 2x the target size, downscale by that grid with nearest-neighbour first; otherwise skip this step; (3) downscale to the target size with a box filter, straight from the cut source; (4) quantize to the master palette (plus the world's ramp) with no dithering; (5) threshold alpha at 50% (fully on or off); (6) redraw the outermost ring of opaque pixels in Bark (#3E2A1E) for a clean 1-pixel outline. Every size of every sprite is made from the 1024 source, never from another size.
- **Checks in the pipeline:** each character's data entry records its eye pixels at each size; `pixelize.py` fails any result where those pixels aren't the eye colour or don't differ from their neighbours (eyes lost at 32 or 16 pixels). The first sheet of each world is looked at at 1x and 3x, beside the anchor, before the rest of that world's sheets are generated; every result is looked at at 1x and 3x.
- **Backdrops and key art** are box-reduced to 640x360 and quantized to the master palette plus that world's ramp (at most 64 colours) with no dithering; a sky that bands gets its own 16-colour sky ramp. In battle, code lays a 15% haze of the world's mid-tone over the backdrop behind the sprites. The first battle backdrop is tested with three party sprites and two enemies on it before the other 17 are made.
- **Hum-taken eyes:** each rabbit sprite, animation frame and portrait that can be Hum-taken (Tansy, Aster, Barley, Quarry, Chert, the raider bases) uses its recorded eye pixels; code draws pale blue (#BFE3F0) over them while taken, and the waking effect removes it.
- **Rabbits that share a base:** the 10 named home rabbits and every freed warren's rabbits are the generic doe, buck and kit with code **fur ramps** (brown, grey, sandy, dark, cream, ginger: one palette swap each) and an optional **accessory overlay** (scarf, flower behind the ear, ear notch, neckerchief, white blaze), stored as data per rabbit and applied to the map sprite, hop frames and portrait alike. Each warren leans to its own ramps (Silverdown pale grey and cream, Wheatsheaf sandy and ginger, Flintcomb dark and grey).
- **Palette:** Chalk #EFE8D6, Sage #8FAE7B, Meadow #C9B458, Earth #7A5638, Bark #3E2A1E (outlines), Dusk #4B3F72, Teal #3E8A8A, Moon #CFD8E8, Emerald #3FA45B, Ember #D9773A, Hum blue #BFE3F0, Eye #2A1C14, plus short ramps per world: 48 colours in all.
- **Terrain tiles drawn in code** from each world's palette: flat and raised diamonds with dithered texture, edge highlights and seeded noise (grass, chalk path, earth, tunnel floor and wall, water with an animated shimmer, sand, stone, moon dust, yellow brick, cornfield, flint, mushroom floor, snow, black depth-stone with faint carvings, china floor with cracks).
- **Sheets:** characters, props and enemies are generated 4 to an image (1536x1024, "four separate figures in a row, evenly spaced, not touching, transparent background"), portraits 4 to an image (1024x1024, 2x2 grid), icons 9 to an image (1024x1024, 3x3 grid), then cut apart in code. **Action-pose sheets** are imagegen2 edits of the finished sheet ("the same four characters, same order and spacing, each in a mid-action pose").
- **Consistency across tools:** imagegen2 2.6 makes every character, portrait, prop, icon and key-art image with the anchor as the first reference; nanogen makes only the mock screen, the battle backdrops and the two painted boss scenes, with the anchor and the mock screen as references; everything goes through the same pixel pipeline and palette.

## Audio direction

Music (instrumental, `--force-instrumental`). Every music prompt ends "continuous and steady, no intro, no ending, no fade-out". Each track gets a **loop window** (`loopStart`, `loopEnd` on the AudioBufferSourceNode) in `data/core/audio-loops.js`, found with `tools/loop-tuner.html` (decodes the file, suggests end points whose next 50 ms best match the start, plays the seam on repeat) and confirmed by ear; this also skips the MP3's leading padding. Tracks crossfade to each other in 1.5 s, never at their own seam.

| Track | Where | Mood | Length |
|---|---|---|---|
| m-title | Title, credits, the ending | The main theme: gentle English folk, solo flute over plucked strings, wistful and hopeful | 90 s |
| m-downs | Sorrel Down and the downs | Warm pastoral, flute and acoustic guitar | 120 s |
| m-warren | Thimblebank and freed warrens | Cozy, small, plucked strings and soft woodblock | 120 s |
| m-attack | The attack, army losses | Tense low drums and a droning cello | 40 s |
| m-battle | RPG battles | Brave and bouncy folk, fiddle and drum | 120 s |
| m-boss | Boss battles | Bigger, heavier, brass and timpani | 75 s |
| m-army | Army battles | Marching folk, snare and pipes | 120 s |
| m-riverbank | The River Bank in summer | Edwardian summer: clarinet and strings, lazy and sunny | 120 s |
| m-wildwood | The Wild Wood in snow | Hushed winter woods: celesta, low strings, a hint of unease | 60 s |
| m-wonderland | Wonderland | Whimsical music-box waltz, slightly off-kilter | 120 s |
| m-moon | The Moon | Dreamy, guzheng and erhu, slow and silver | 120 s |
| m-oz | Oz | Bright, hopeful road-walking march for small orchestra | 120 s |
| m-journey | The Hole and the Lidenbrock Sea | Vast and cavernous, cello and low strings, wonder | 120 s |
| m-depths | Shallows and Drowned Halls | Low drone, soft distant choir, a slow heartbeat | 90 s |
| m-deep | Stair of Eyes and Root of the World | Deeper, stranger drone, detuned bells | 90 s |
| m-silverdown | Silverdown while taken | Thin, pale flute over a hollow drone, a lullaby half-forgotten | 60 s |
| m-wheatsheaf | Wheatsheaf while taken | Wind through empty corn, a slow broken fiddle | 60 s |
| m-flintcomb | Flintcomb's spiral round the hole | Hard, ringing, stone-tapping rhythm under a low drone | 60 s |
| m-dream | The Dream (all three phases) | Strange and tender: reversed-sounding piano, soft choir, the folk theme's mood heard from underwater | 120 s |

- **Taken warrens** play their own track with the Hum loop on top; once freed they switch to m-warren.
- **The finale:** RTS 5 is a generated drone-bed loop under three thump layers scheduled in Web Audio at 72 BPM, one layer per held Thump Stone (the soft single thump, the deeper double, the warren drum). The Dream plays m-dream; as the Eye closes it crossfades into m-title, which plays over the ending.
- **The Hum:** a looping ambience under every Depths track, louder each layer (code volume).

**Formats:** music and one-shot effects are MP3 (one-shots have their leading silence trimmed at load: the first sample above -40 dB). Loops are generated as `--output-format pcm_22050` (accepted for sfx per audiogen's docs) and wrapped into WAV with Python's `wave` module, so they loop with no gap; each loop is 12 to 15 s.

Sound effects (audiogen sfx, one generation per sound, 0.5 to 2 s; variety comes from pitch and volume jitter in code, ±6%):

| Action | Sound |
|---|---|
| Hop (2 takes, alternated), nibble, chest opening, coins (pickup and buying) | sfx |
| The Old Key turning; the sealed door grinding open | sfx |
| Map transition whoosh, recruit sting, battle start, victory fanfare, level up | sfx |
| Hit (2 takes), crit, guard, heal (also item use), buff, skill whoosh, wake chime, fade sigh | sfx |
| Flee and party swap (scamper), squad worn out | sfx |
| Shrink/grow swanee (reversed in code for shrink), pepper sneeze, china crack, china crunch, splash-and-melt | sfx |
| RTS order (reed-pipe toot), node taken, off-screen alert horn, soft single thump, deeper double thump, warren drum (abilities, finale layers) | sfx |
| Earth rumble (the attack and the minute-2 tremor), geyser, Choir sting when it speaks, water footstep (Drowned Halls) | sfx |
| Tree-bridge creak and crash, Winged Monkeys' rush of wings, the shepherd's low hum (seen), story-vignette shimmer | sfx |
| Loops: the Hum, wind on the downs, river water, storm and waves (Lidenbrock), RTS squad clash, finale drone bed, hearth crackle (Badger's kitchen, Thimblebank's Great Burrow once rebuilt) | sfx `--loop`, PCM |
| Menu move, confirm, cancel; talk blip; equip; Afraid shiver; depth drips; moon chimes; root creak (the door sound pitched down); scent-trail twinkle | code (Web Audio oscillators and noise) |

That's 42 one-shots and 7 loops (49 generations).

Voice (audiogen voice, `eleven_v4`; every voiced line also shows as text):

| Line | Who | Where |
|---|---|---|
| "Bramble..." `[whispering]` | the Shallows | standing still in the Shallows |
| "Up you get." | Old Yarrow | every lost battle's fade |
| "Not like this, Bramble. Not alone." | Old Yarrow | the guided Lookout retreat |
| "When all the warrens thump as one, the Sleeper's dream is soft and done." | Old Yarrow | the start of the Long Thump |
| "I have never been offered a dandelion before." | Ninefold | its recruit card |

## Asset list

Every generated image goes through the pixel pipeline. Model notes: all imagegen2 work is on **2.6** (the default `gpt-image-2.6-flare`); quality `low` unless noted. nanogen is pinned to `--model gemini-3.1-flash-image` at 1K (the listed $0.034 price; deprecated but still served; if it stops, use the default 2.1 with `--thinking minimal` and record the real cost).

Characters (1536x1024 sheets of 4 unless noted; transparent)

| ID | What it is | Tool | Sizes | Priority |
|---|---|---|---|---|
| spr-bramble | Bramble facing down-right, the style anchor | imagegen2, `high`, 1024x1024 | 16, 32, 64 map; 64 battle | must |
| spr-bramble-ne, -sw, -nw | Bramble from behind facing up-right (anchor as reference); down-left and up-left (mirror + ear edit, see Art direction) | imagegen2 edits, `medium`, 1024x1024 | 16, 32, 64 | must |
| spr-party-a..d | Mole, Ratty, Badger, Toad / Cheshire Cat, Caterpillar, Ninefold, Burdock / Jade Rabbit, Tansy, Pip, Captain Quarry / Tin Woodman, Rumble, Toad as the washerwoman, the adult mastodon (herd and squad) | imagegen2, `medium` | 32/48/64 map, 64/96 battle | must |
| spr-party-act-a..d | The 15 party members' action poses (edits of the four sheets; Bramble's comes from the Thump animation) | imagegen2 edits, `medium` | 64/96 battle | must |
| spr-party-back-a..d | Back views (seen from behind, facing up-right) of the 14 companions, for following on the map: Mole, Ratty, Badger, Toad / Cheshire Cat, Caterpillar, Ninefold, Burdock / Jade Rabbit, Tansy, Pip, Captain Quarry / Tin Woodman, Rumble (edits of spr-party-a..d: "the same characters, same order and spacing, seen from behind"; the washerwoman and adult mastodon slots are left out) | imagegen2 edits, `medium` | 32/48 map | must |
| spr-home-a..d | Yarrow, Mallow, Woodruff, Comfrey / Chert, Aster, Barley, generic doe / generic buck, generic kit, generic buck back view, Hum-taken Raider / Hum-taken Raider back view, Hum-taken Digger, Hum-taken Lookout, Moon Hare | imagegen2 | 32/24 map, 64 battle | must |
| spr-world-a..j | White Rabbit, Dodo, Duchess, Cook / Hatter, March Hare, Dormouse, Bill the Lizard / Queen of Hearts, King of Hearts, Flamingo, the Pigeon / Hedgehog, Otter, field-mouse Caroller, Elevenfold / Chang'e, Wu Gang, Moon Toad, the old traveller / Good Witch of the North, Glinda, Guardian of the Gates, the Wizard / Scarecrow, Cowardly Lion, Queen of the Field Mice, Monkey King / China Princess, the Stork, giant shepherd (silhouette), the Wizard's great Head / a Munchkin, a Winkie, the pig-baby, the wildcat / Pigeon Rider (a Silverdown rabbit on a pigeon), Rook, Quarryman (a flint-dusted Flintcomb digger), Wick | imagegen2 | 32/48 map, 64/96 battle | must |
| spr-enemy-a..g | 27 regular enemy types grouped by world (all except the three Hum-taken bases and the Hollow Rabbit) + the ichthyosaur and plesiosaur locked in their fight (one far-off silhouette) | imagegen2 | 32/48 map, 64/96 battle | must |
| spr-enemy-act-a..g | Action poses for the 27 (edits of the sheets) | imagegen2 edits | 64/96 battle | must |
| spr-hollow | Hollow Rabbit: the generic buck filled dark indigo, pale eyes, 70% alpha, motes | code | from spr-home | must |
| spr-boss-a | Chief Weasel, Knave of Hearts, Moth Queen, Wicked Witch of the West | imagegen2, `medium` | 64/96 battle, 32/48 map | must |
| spr-boss-act | Queen of Hearts shouting "Off with—", Chief Weasel, Moth Queen and the Witch in action (edit of spr-boss-a with the Queen from spr-world-c as a second reference) | imagegen2 edit, `medium` | battle | must |
| spr-boss-b | Nightmare of Deepdelve, Nightmare of Flintcomb (Hollow Rabbit and Raider sprites as references) | imagegen2, `medium` | 200x160 | must |
| spr-choir | The Whispering Choir: a wall of stone mouths | imagegen2, `medium` | 240x120 (code mouth-glow overlays) | must |
| spr-watcher | The Watcher on the Stair | imagegen2, `medium`, 1024x1536 | 96x200 (7 code eye overlays) | must |
| boss-tidewarden, boss-eye | The Tidewarden rising (a Drowned Halls backdrop variant) and the Undersleeper's Eye (the Dream backdrop variant); eyes are code overlays | nanogen | 640x360 | must |
| spr-squads | Squads drawn from leader or base map sprites (Card Gardeners from the Card Soldier recoloured to spades; Field Mice from the Caroller without scarf; Winkies from a Winkie; Heralds from the White Rabbit; Reformed Weasels from the Weasel; Pigeon Riders, Rooks and Quarrymen from spr-world-j; Lantern Moths from Wick and the Lantern Moth; Mastodon Herd from the adult mastodon; The Grin from the Cat's battle sprite; Kits, Scouts and warren rabbits from the generic bases with fur ramps) | code | native sizes | must |

Animations (anim8gen, always `noshow`, 4 frames at 1024, the named still as the canonical reference; frames reduced by the pipeline to every size used)

| ID | What it is | Reference | Sizes | Priority |
|---|---|---|---|---|
| anim-bramble-hop-se, -sw, -ne, -nw | Bramble's hop in all four facings | spr-bramble, -sw, -ne, -nw | 16, 32, 64 | must |
| anim-bramble-idle | Ear twitch and nose wiggle (facing down-right) | spr-bramble | 32 | must |
| anim-bramble-nibble | Nibbling grass (facing down-right) | spr-bramble | 32 | must |
| anim-bramble-thump | The battle Thump (also his action pose) | spr-bramble | 64 | must |
| anim-rabbit-hop-se, -ne | The generic buck's hop, front and back (mirrored for left): every generic rabbit that moves on the map uses it with its own fur ramp and accessory, and kits use the same frames reduced to 24; the generic doe sprite is for rabbits who stand and talk | generic buck, its back view | 24, 32 | must |
| anim-raider-hop-se, -ne | The Hum-taken Raider's hop, front and back | Raider, its back view | 32 | must |
| anim-cheshire-vanish | The Cat fading until only the grin is left | Cheshire Cat | 64 | must |
| anim-monkey-flap | A Winged Monkey flapping (squad, Monkey Drop, the Golden Cap scene) | Monkey King | 32, 64 | should |
| anim-moth-flutter | A Lantern Moth fluttering (map enemy, Wick's squad) | Lantern Moth | 32, 64 | should |
| anim-witch-melt | The Wicked Witch melting into a puddle | Wicked Witch | 96 | must |

Portraits (80x80; 4 to a 1024x1024 sheet, `medium`, each figure's sprite as a reference)

| ID | What it is | Priority |
|---|---|---|
| por-sheet-1..6 | Bramble (neutral, worried, happy), Tansy / Burdock, Mole, Ratty, Badger / Toad, Cheshire Cat, Caterpillar, Ninefold / Jade Rabbit, Tin Woodman, Pip, Captain Quarry / Rumble, Yarrow, Mallow, Woodruff / Comfrey, Chert, Aster, Barley | must |
| por-sheet-7..16 | White Rabbit, Dodo, Duchess, Cook / Hatter, March Hare, Dormouse, Bill / Queen, King, the Pigeon, Seven of Spades / Chang'e, Wu Gang, Moon Toad, the traveller / Good Witch, Glinda, Guardian of the Gates, the Wizard / Scarecrow, Cowardly Lion, Queen of the Field Mice, Monkey King / China Princess, Otter, Hedgehog lad, Elevenfold / Chief Weasel, Knave, Moth Queen, Wicked Witch / generic doe, buck, kit, Wick / a Munchkin, a Winkie, the Stork, a Moon Hare | must |
| por-crop | The Choir and the Hollow Rabbits (who speak a line or two): a code crop of their sprite source, reduced to 80x80 | must |

Props (4 to a 1536x1024 sheet; anchor and mock screen as references; footprint w x h tiles / pixel height; anything wider than one tile is cut into strips at load unless on a back edge; walkable pieces are ground-layer images)

| ID | What it is | Priority |
|---|---|---|
| prop-shared-a, b | chest closed 1x1/16, chest open 1x1/18, blank signpost 1x1/28, mossy rest stone 1x1/16 / the Underway's river door 1x1/56, keyhole door 1x1/56, the Golden Cap on its cushion 1x1/16, star-stone 1x1/10 | must |
| prop-downs-a, b | gorse 1x1/24, hawthorn 1x1/56, the Lookout Stone 1x1/40, hollow log 2x1/16 / dandelions 1x1/8, warren entrance 2x2/28, chalk boulder 1x1/20, fence 1x1/20 | must |
| prop-warren-a, b, c | root pillar 1x1/48, moss bed 1x2/12, button shelves 1x1/40, the sealed door (carved, sign in code) 1x1/48 / rubble 1x1/16, lantern-mushroom 1x1/20, table 1x1/16, storyteller's seat 1x1/24 / nursery nest 1x1/12, Comfrey's herb rack 1x1/36, root-cellar baskets 1x1/20, collapsed-tunnel heap 2x1/28 | must |
| prop-warrens-b | Silverdown's dovecote 1x1/56, Wheatsheaf's corn stook 1x1/32, hay cart 2x1/32, Barley's bell on its post 1x1/40 | must |
| prop-flint | quarry spoil heap 2x1/24, flint wall 1x1/40, Quarry's store counter 2x1/24, rim stones at the hole's lip 1x1/16 | must |
| prop-willows-a..d | willow 1x1/64, Ratty's boat 2x1/20, Toad Hall facade 4x2/96 (back edge), Wild Wood tree in snow 1x1/64 / Badger's door 1x1/40, wrecked motor-car 2x1/28, weir logs 2x1/12, snowy stump 1x1/20 / Badger's hearth 2x1/40, settle bench 2x1/24, banquet-table section 1x1/20 (repeated), kitchen dresser 1x1/48 / Ratty's hole 1x1/24, reeds 1x1/24, Mole End door 1x1/36, buried-city column 1x1/56 | must |
| prop-wonder-a..d | tiny door 1x1/24, glass table with key 1x1/32, giant mushroom 2x2/64, tea table 3x1/24 / rose bush 1x1/28, croquet hoop-card (blank face) 1x1/24, hedge 1x1/24, Drink Me and Eat Me stand (blank labels) 1x1/24 / the Duchess's cauldron 1x1/24, kitchen stove 1x1/40, jury box 2x1/32, the throne of hearts 1x1/48 / the White Rabbit's house 3x1/80 (back edge), tea-party armchair 1x1/28, Caucus-shore rock 1x1/16, pool-of-tears rock 1x1/12 | must |
| prop-depths-a, b, c | carved pillar 1x1/56, the eye-stair door 1x1/56, stone face 1x1/32, drowned column 1x1/64 / stair with eyes 2x2/40, giant moving root 2x1/40, mural wall 3x1/56 (back edge; the painting is bg-mural), single stone mouth 1x1/24 / Deepdelve's ruined burrow arch 1x1/48, Elevenfold's stall 2x1/40, star-rock cluster 1x1/28, ruined storyteller's seat 1x1/20 | must |
| prop-moon-a, b | cassia tree 2x2/96, palace gate 3x1/80 (back edge), pestle and mortar 1x1/24, lantern 1x1/32 / palace screen 2x1/48, Moon Hare burrow mouth 1x1/16, crater rock 1x1/20, lantern-grove tree 1x1/56 | must |
| prop-oz-a..d | Munchkin house 2x2/64, yellow brick bits 1x1/4, poppies 1x1/12, Emerald City gate 3x1/96 (back edge) / Winkie tower 2x2/112 (back edge), china house 1x1/32, Scarecrow's river pole 1x1/40, tree-bridge 3x1 (walkable ground piece) / the green throne 1x1/56, the Witch's cupboard 1x1/48, wash bucket 1x1/12, Field Mice's throne 1x1/20 / Oz forest tree 1x1/64, blue Munchkin fence 1x1/20, Winkie castle pillar 1x1/64, ditch-edge rock 1x1/16 | must |
| prop-journey-a, b | giant mushroom 2x2/80, glow crystal 1x1/24, raft 2x2 (walkable ground piece), plain carved rock (initials drawn in code) 1x1/24 / bones 2x1/16, geyser vent 1x1/12, volcanic tube mouth 2x1/40, fallen rock 2x2/48 | must |
| prop-rts | node markers: clover patch, hilltop flag, burrow mouth, Thump Stone (each 1x1/24) | must |
| prop-fx | Drawn in code: dust puff, sparkle, heart, "?", chalk debris, glitter, motes, ripple, facing chevron, gaze cone, scent shimmer | must |

Every map's place in Chapters has its props here: the downs, Thimblebank (rooms before and after rebuilding), Silverdown, Wheatsheaf, Flintcomb, the Underway, the River Bank (with Badger's kitchen, the buried city, Mole End and the Toad Hall banquet), the six Wonderland areas (with the Duchess's kitchen and the court), the Shallows, the Moon (with the palace and the crater warren), the Drowned Halls, Oz (with the Field Mice's court, the throne room and the Winkie castle), the Stair, the Hole and the sea, and the Root.

Backdrops and key art (reduced to 640x360)

| ID | What it is | Tool | Priority |
|---|---|---|---|
| mock-screen | The target in-game screen (style reference only, not shipped) | nanogen | must |
| bg-title | Sorrel Down at dusk, the warren entrance glowing, a hint of eye-shaped stones | imagegen2, `high`, 1536x1024 | must |
| bg-ending | All the warrens on the downs at sunset | imagegen2, `high`, 1536x1024 | must |
| bg-attack | Raiders on the ridge, blank eyes, chalk dust | imagegen2, `medium`, 1536x1024 | must |
| bg-intro-1..3 | The three intro cards | imagegen2, `medium`, 1536x1024 | must |
| bg-mural | The Shallows mural: Deepdelve digging, a long shape, an eye | imagegen2, `medium`, 1536x1024 | must |
| bg-battle-* (18) | downs, warren tunnel, Thimblebank Depths, River Bank, Wild Wood in snow, Wonderland garden, Wonderland hall, Shallows, Moon, Drowned Halls, Oz road, Emerald City, Winkie castle, Stair of Eyes, Lidenbrock shore, mushroom forest, Root of the World, the Dream | nanogen, 16:9 1K | must |
| bg-sea | The Lidenbrock Sea for the raft scene (monster silhouettes are a separate sprite) | nanogen | must |
| bg-chapter-1..5 | Crops of backdrops with a code frame and title | code | must |

UI and icons

| ID | What it is | Tool | Size | Priority |
|---|---|---|---|---|
| ui-frames | Dialog box, panels, buttons, bars, recruit card, banners, minimap frame, alert arrows: 9-slice drawn in code in the palette | code | - | must |
| ico-items-1..3 | 15 items + 11 key items (3x3 sheets; 1 slot spare) | imagegen2 | 24x24 | must |
| ico-gear-1..3 | 24 base gear icons (8 Tools, 8 Coats, 8 Charms); the 45 pieces are bases plus a code tier tint and corner pip; army gear uses banner, mail and ration icons tinted per squad kind | imagegen2 | 24x24 | must |
| ico-ui-1..3 | camp, pause, mute on/off, buttons currency, Supply, 4 squad kinds, Light, 7 statuses, nibble, quest, save, talk leaf, Reinforce, 4 abilities | imagegen2 | 16x16 | must |
| app-icon | Bramble's head before the warren door, made in code from por-bramble and a door prop; favicon, apple-touch, 192, 512, maskable 512 | code (Pillow) | 1024 → all sizes | must |
| social-card | 1200x630 from the title art and logo, per web-target.md | code | 1200x630 JPG | must |
| font | Pixelify Sans (SIL OFL), bundled with its license | download | TTF/WOFF2 | must |

Audio

| ID | What it is | Tool | Length | Priority |
|---|---|---|---|---|
| music | The 19 tracks above (30.4 minutes) | audiogen music, `--force-instrumental`, MP3 | 40 to 120 s | must |
| sfx | 42 one-shots (MP3) + 7 loops (PCM → WAV) | audiogen sfx | 0.5 to 2 s; loops 12 to 15 s | must |
| vo | The 5 voiced lines | audiogen voice, `eleven_v4` | 1 to 5 s each | must |

## Tech plan

```
game/
  index.html          two canvases (640x360 pixel layer, full-res UI layer), meta tags
  src/
    main.js           boot, loading, scene switching, fixed-step loop (60 Hz, accumulator, gap clamp)
    engine/
      input.js        keys and mouse to actions; just-pressed buffering; preventDefault
      audio.js        Web Audio: music with loop windows and crossfade, sfx with pitch jitter, PCM loops, voice, Hum layer, thump scheduler, mute
      save.js         localStorage "warren-peace-save" v1: autosave + 3 slots, settings; try/catch fallback
      iso.js          projection, code tiles, chunk pre-render, prop strips, depth sorting, picking, camera
      text.js         font, word wrap, typewriter, the UI layer
      tween.js        tweens and screen shake
      path.js         A*
    world/  map.js  actor.js (hops, facings, followers)  enemies.js (turn-stepped)  size.js (size puzzles, cracks)  sneak.js  script.js (say, choose, move, flag, give, battle, fade, recruit, vignette)
    battle/ rpg.js  formulas.js
    rts/    rts.js (scene, UI)  camera.js (pan, edge-scroll, minimap, alerts)  sim.js (pure, deterministic)  ai.js  odds.js (headless sim + auto-player)
    screens/ title, intro, camp (with Talk), shop, pause, settings, preview, recruit card, chapter card, ending
    data/
      index.js        imports every chapter module and merges registries; throws on a duplicate id
      core/           party.js squads.js items.js gear.js enemy-templates.js bosses.js formulas-constants.js palette.js fur-ramps.js audio-loops.js
      ch0/ .. ch5/    maps/*.js dialog.js banter.js enemies.js encounters.js quests.js shops.js rts.js cutscenes.js segments.js
  assets/  fonts/  manifest.webmanifest  sw.js  icons  social-card.jpg
tools/                (not shipped) pixelize.py  reach.mjs  balance.mjs  rts-balance.mjs  loop-tuner.html  wrap-pcm.py
design/BIBLE.md       the story bible: voices, the creature, the rules, dialog style, line budgets, id and flag naming
```

- **Loading:** a small loading bar on first start; title assets first, then each chapter's assets on demand.
- **Scaling:** as in Art direction; the UI canvas matches real device pixels; recompute on resize.
- **Pause:** on `visibilitychange` and blur; music ducks; never two copies of a track.
- **Story state:** a flags object drives dialog and events; everything is in the save.
- **Data ownership** (so chapter helpers never edit each other's files):
  - The core builder writes the engine, `data/core/` and `data/index.js` first, plus `design/BIBLE.md`. Only the core builder edits them; chapter helpers ask for changes.
  - `ch0` Prologue and the Thimblebank maps; `ch1` Thimblebank Depths, River Bank, the brief home visit, Wonderland, Shallows, RTS 1, the Great Burrow; `ch2` RTS 2, Silverdown, the Moon, the Drowned Halls; `ch3` RTS 3, Wheatsheaf, Oz, the Stair of Eyes; `ch4` RTS 4, Flintcomb, the Hole, the Root of the World; `ch5` RTS 5, the Dream, the ending.
  - Each chapter also owns Thimblebank's state after it: its `dialog.js` holds the home rabbits' lines keyed `home.<speaker>.after.chN`, its `banter.js` the party's Talk lines and map-entry bubbles for its areas, and its `maps/` the rebuilt-room overlays.
  - Ids are prefixed by chapter (`c2.moth-queen`, `c3-oz-road` for maps); flags are `c3_metLion`; shared ids (party members, squads, items, `g_` global flags such as `g_recruit_<id>`) live only in `core`.
- **Debug hook** (`window.__game`, per web-target.md; read-only plus the one allowed jump):
  - `state()`: screen, segment id, chapter, map, Bramble's tile, height, size and facing, followers, map enemies (id, tile, facing, chasing), the shepherd's `gaze` (direction, ticks to next turn), flags, party, reserve, levels, Heart, Pluck, buttons held, quest line, dialog (open, speaker, choices), battle summary, `segmentComplete`, `gameWon`, play time.
  - `levels()`: the list of segments (below). `goToLevel(n)`: start segment n fresh, with that segment's standard party, levels, gear and flags from `segments.js`, as if just arrived.
  - `audioState()`: `{ context, musicMuted, sfxMuted, track }`.
  - `buttons()`: everything pressable on the canvas now, as `{label, x, y, w, h}` in CSS pixels: menu items, dialog replies, battle commands and targets, RTS nodes (with letters), squads, squad-list entries, the minimap, alert arrows, Reinforce and ability buttons.
  - `tileToScreen(x, y)`: CSS-pixel centre of a tile, for clicking (in army battles, for the current camera). `battleState()`, `rtsState()` (tick, paused, camera, targeting, Supply, nodes, squads with HP and position, result).
  - Manual helpers (`__game.dev`: warp, setFlags, give, recruit, level, winBattle) exist only with `?debug=1`, are for poking by hand, and are never used in solutions.
- **Segments** (the "levels" the play-test replays), 30 in all: prologue surface, prologue warren, attack and Lookout; c1 Depths, River Bank, Toad Hall, Wonderland a (a to c), Wonderland b (d to f), Shallows, RTS 1, Great Burrow; c2 RTS 2, Aster, Moon a, Moon b, Drowned Halls; c3 RTS 3, Barley, Oz a (Munchkins to poppies), Oz b (Emerald City to the Witch), China Country, Stair of Eyes; c4 RTS 4, Quarry, Hole and sea, mushrooms and herd, Root; c5 RTS 5, the Dream, ending.
- **Solutions:** each segment has `design/solutions/<segment>.json`: a list of **state-gated steps**, each "do these real inputs, then wait until this condition on `state()` / `battleState()` / `rtsState()` holds" (for example: press ArrowUp, wait until Bramble's tile changes; wait until the shepherd's gaze is direction 2, then hop). Click targets are read from `buttons()` and `tileToScreen()` at replay time. Replayed with `run-code` after `goToLevel(n)`, ending with `state().segmentComplete`. Because map enemies only move when Bramble hops, exploration replays exactly. RPG battles choose each command from `battleState()` (whose turn, which targets) and press it through `buttons()`. Army battles turn on **auto-pause every 10 s** in Settings (a real player option, set by real clicks), give orders by real keys and clicks while paused, then unpause; the sim stops exactly on each 100th tick, so the replay is exact. Every battle in a solution is actually fought. Randomness (crits, variance, Flee) uses a seed of the encounter id and attempt count, so a fight replays the same.
- **Install and offline:** manifest and service worker per web-target.md (registered only off localhost or with `?sw=1`); works offline after first load.

## Cut list

Only for a technical problem or a real overspend (the budget itself is no longer a reason), first to go:
1. An animation that won't keep the character on model after three tries: code tweens on the still (squash, bob, alpha fade for the Cheshire vanish, a squash-and-sink for the Witch's melt).
2. Bramble's edited left-facing stills, if the ear edit drifts the character: mirror the right-facing ones and accept the flipped ear.
3. If the first images' real prices overrun (see Budget): the `low` bulk sheets (world NPCs, enemies, props, icons) move to `gpt-image-2.5-flare`; then music retries stop; then similar battle backdrops merge (Wonderland hall and garden; Stair of Eyes and Root of the World).
4. The China Country and the Hammer-Heads' hill (optional Oz side areas), only if the reachability check can't be made to pass for them.

Never cut: exploration, talking, nibbling, the attack, the RPG battles, the party of 3 and all 15 members, recruiting and every recruit's quest, the party's Talk lines, the army battles (all 5) with their camera and minimap, shops for party and army, every world asked for (River Bank, Wonderland, Moon, Oz, Journey), the four depth layers, the finale and the ending.

## Budget estimate

imagegen2 lists no prices (its reference says to check OpenAI's pricing page), so image costs are planning figures, including reference-image inputs: 2.6 Flare `low` about $0.04 at 1024x1024 and $0.06 at 1536x1024; `medium` about $0.10 and $0.15; `high` about $0.25 and $0.35. **The first three images' reported token usage gets priced against OpenAI's page and noted in `ASSETS.md`; if real 2.6 costs are more than 25% above these figures, step 3 of the cut list applies to the `low` bulk sheets before anything else.** anim8gen frames are imagegen2 2.6 `low` 1024 images, about $0.05 each with the reference. nanogen at the listed $0.034 (3.1 Flash, 1K). audiogen at its listed $0.30 a minute of music, $0.12 an effect and about $0.10 per 1,000 characters of voice. Most images get 2 tries, the stars 3 (party, bosses) or 4 (the anchor), plus retry pools.

| Kind | Count (tries) | Estimate |
|---|---|---|
| Anchor (2.6 `high`) | 1 image (4) | $1.00 |
| Bramble's back and left-facing stills (2.6 `medium` edits) | 3 images (9) | $0.90 |
| Party sheets and action-pose edits (2.6 `medium`) | 8 sheets (12 + 8) | $3.00 |
| Companion back-view edits (2.6 `medium`) | 4 sheets (8) | $1.20 (from the reserve) |
| Home rabbit sheets (2.6 `low`) | 4 sheets (8 + 2 pool) | $0.60 |
| World NPC sheets (2.6 `low`) | 10 sheets (20 + 4 pool) | $1.44 |
| Enemy sheets and action-pose edits (2.6 `low`) | 14 sheets (14 + 3 pool, 14) | $1.86 |
| Boss sheets (2.6 `medium`) | 5 images (15) | $2.25 |
| Portraits (2.6 `medium`) | 16 sheets (32 + 2 pool) | $3.40 |
| Props (2.6 `low`) | 29 sheets (58 + 4 pool) | $3.72 |
| Icons (2.6 `low`) | 9 sheets (18 + 4 pool) | $0.88 |
| Key art: title and ending (`high`, 2 tries + a `medium` draft each); attack, 3 intro cards, mural (`medium`, 2 tries) | 7 images (16) | $3.20 |
| Mock screen, battle backdrops, sea, painted bosses (nanogen) | 22 images (4 + 42 + 4 pool) | $1.70 |
| Animations (anim8gen) | 15 animations: Bramble's 7 x 6 frames, 8 others x 5 frames = 82 frames | $4.10 |
| Music | 19 tracks, 30.4 min + 3 min of retries | $10.03 |
| Sound effects | 49 generations + 6 retries | $6.60 |
| Voice | 5 lines, 2 to 3 takes each | $0.20 |
| **Planned spend** | 128 images and sheets (about 440 figures; 297 image tries plus 82 animation frames), 15 animations, 19 tracks, 49 sounds, 5 voiced lines | **$44.88** |
| **Reserve** | about 8%: re-dos of anything that misses after its tries, price surprises (the back views took $1.20 of it) | **$3.92** |

Spending order: anchor and mock screen first (price check on these), then Bramble's stills and hops, then must-haves by chapter, then shoulds; at 80% of the budget say so in `STATUS.md`.

**What the raise to $50 bought:** all images on 2.6 (no 2.5), the anchor and key art at `high` and portraits, party and bosses at `medium`; Bramble in four true facings (his flopped ear stays on the correct side) with real hops, and real hops for the generic rabbits and raiders; action poses for every party member, enemy and boss; the Cheshire vanish, the Witch's melt, monkey and moth flaps; about 14 more prop sheets for interiors and story objects; longer music (up to 120 s), the Wild Wood's own track, a theme for each taken warren, m-dream for the finale; one generation per sound instead of split packs; five voiced lines; and third tries for the stars.

## Definition of done

- [ ] Starts with no errors at 1280x720, 1920x1080 and a small 800x600 window.
- [ ] The prologue plays from New Game to the key; the attack begins 4 to 6 minutes in on a direct play; the guided Lookout battle runs and returns safely.
- [ ] Every segment's recorded solution replays to `segmentComplete` with real input, including a real fight with every boss and a real win of every army battle.
- [ ] The whole game is played from New Game to the credits in one run with real input (text speed set to instant in Settings is allowed; every battle fought).
- [ ] `tools/reach.mjs` passes for every Wonderland map, the China Country and the shepherd's field; `tools/balance.mjs` passes (bosses 8 to 15 rounds with their counter, worse without; no Pluck starvation in any dungeon run; income covers assumed gear); `tools/rts-balance.mjs` passes (the duel table holds; required-only armies "Even", RTS 1 without the Polite Dark).
- [ ] Every party member can be recruited, equipped and used in battle; every squad appears in the army and can fight; every recruit shows the recruit card, has Talk lines, and appears in Thimblebank afterwards.
- [ ] Every shop sells party gear and army gear, and both have an effect; Auto-equip works.
- [ ] Losing an RPG battle and an army battle returns you safely with nothing lost; "The warren rallies" appears after two losses; nothing gets stuck (size puzzles, cracking tiles, the sneak, escorts, followers tucking in and popping out, menus, pausing, losing focus).
- [ ] Keyboard and mouse both work for exploring, menus, battles and army orders; no RTS key does two jobs; left-click never orders; Tab never moves browser focus.
- [ ] In every army battle, every node is on screen or reachable through the minimap, the camera reaches every corner, and off-screen waves show an edge arrow.
- [ ] Every screen looks finished at every size, from the first load: no junk text, nothing cut off, every icon showing, one pixel size everywhere (nothing scaled at draw time).
- [ ] Bramble's flopped ear is on the correct side in all four facings and at all three sizes.
- [ ] The two travelling companions follow Bramble on every map, front view going down and back view going up; they tuck into him on Wonderland's size-puzzle maps (and whenever he isn't normal size), in the shepherd's field and in the China Country, and pop back out on the next map; swapping the party in the camp menu changes who follows.
- [ ] Every speaking character has a portrait; dialog changes after story beats; every place in Chapters has its props.
- [ ] Music and sound play after the first key or click; no music seam is audible on a full loop of any track; every action listed in Audio direction makes its sound; mute and volumes work and are remembered.
- [ ] Progress is saved and restored (autosave and all 3 slots), and a broken save falls back safely.
- [ ] (Web) Installs as an app and works offline.
- [ ] No names, characters or text from Watership Down; the storybook worlds follow the original books (silver shoes, no film details).
