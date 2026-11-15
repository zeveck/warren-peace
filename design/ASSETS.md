# Warren Peace: assets and spending

Budget: $50 (planned $46.08 incl. back views; reserve $3.92). Prices are estimates.
imagegen2 prices: OpenAI lists no fixed per-image price for gpt-image-2.6; estimated from reported tokens and the design's planning figures (2026-11-07): `high` 1024 ~1,760 output tokens. Using the design's figures (low $0.04/$0.06, medium $0.10/$0.15, high $0.25/$0.35) as a safe upper estimate.
nanogen gemini-3.1-flash-image 1K: $0.034. audiogen: $0.30/min music, $0.12/sfx, ~$0.10 per 1,000 voice chars.

Sources (1024-scale, not shipped) live in `art-src/` (sheets, figures, bg); the pixel pipeline (`tools/pixelize.py`) makes `game/assets/` from them.

| ID | File | Tool | Prompt (short) | Tries | Est. cost |
|---|---|---|---|---|---|
| spr-bramble (style anchor) | game/assets/style-anchor.png, art-src/figures/bramble-se.png | imagegen2 high 1024 | Bramble, brown buck, left ear flopped, facing down-right | 2 | $0.50 |
| mock-screen | design/mock-screen.jpg | nanogen 3.1 flash 16:9 | Sorrel Down mock screen with Bramble | 2 | $0.07 |

| audio: 19 music tracks | game/assets/audio/music/*.mp3 | audiogen music | 21 | $9.30 |
| audio: 43 sfx | game/assets/audio/sfx/*.mp3 | audiogen sfx | 43 | $5.16 |
| audio: 7 loops (stereo PCM averaged to mono WAV, 14 s) | game/assets/audio/loops/*.wav | audiogen sfx --loop | 10 | $1.20 |
| audio: 5 voice lines (Yarrow: Grimblewood; whisper: Lou; Ninefold: River) | game/assets/audio/vo/*.mp3 | audiogen voice eleven_v4 | 15 | $0.15 |
| spr-party-a..d, -act, -back (14 back views) | art-src/figures/<who>, <who>-act, <who>-back | imagegen2 medium | 15 | $2.25 |
| por-sheet-1..6 (24 portraits) | art-src/figures/por-* | imagegen2 medium | 7 | $0.70 |
| prop sheets x29 (116 props, 34 sheet tries) | art-src/figures/prop-* | imagegen2 low | 34 | $2.04 |
| icon sheets x9 (81 icons) | art-src/figures/ico-* | imagegen2 low | 9 | $0.36 |
| key art: title, ending (high), attack, intro 1-3, mural (medium) | art-src/bg/*.png | imagegen2 | 8 | $1.60 |
| 18 battle backdrops, sea, tidewarden, eye | art-src/bg/*.jpg | nanogen 3.1 flash | 28 | $0.95 |
| spr-home-a..c, spr-world-a..j (51 figures incl. wick-2) | art-src/figures/ | imagegen2 low | 14 | $0.84 |
| spr-enemy-a..g + 7 action edits (26 enemies + sea-monsters) | art-src/figures/ | imagegen2 low | 16 | $0.96 |
| bosses: boss-a, boss-act, boss-b, choir, watcher | art-src/figures/ | imagegen2 medium | 7 | $1.05 |
| por-sheet-7..16 (40 portraits) | art-src/figures/por-* | imagegen2 medium | 10 | $1.00 |
| Bramble ne/sw/nw stills (medium edits) | art-src/figures/bramble-* | imagegen2 | 4 | $0.40 |
| rabbit-buck(-back), doe, kit, raider(-back) | art-src/figures/ | imagegen2 low | 7 | $0.28 |
| 15 animations (Bramble hops x4, idle, nibble, thump; rabbit and raider hops; monkey, moth, witch melt; cheshire vanish by alpha masks) | art-src/anim/*/ | anim8gen | 57 frames | $2.85 |

Notes: design said 42 one-shots; its table lists 43, all made. Quiet sfx (wake-chime, heal, shimmer, scamper, nibble, hop-1) need gain in code. Music loop windows are set in data/core/audio-loops.js (tracks fade at their ends).

Earlier running total: $31.66 of $50 (all planned assets made; reserve and remainder unspent) (audio $15.81 at list price; ElevenLabs credits actually used ~28k)

Music variety pass (2026-11-12, design/progress/music.md): 11 new tracks, audiogen music `--force-instrumental`, MP3 44.1 kHz 128 kbps like the others; every prompt ends "continuous and steady, no intro, no ending, no fade-out". Two first calls hit the 2-concurrent-request limit (429, no charge).

| ID | File | Tool | Prompt (short) | Tries | Est. cost |
|---|---|---|---|---|---|
| m-battle-wonder | game/assets/audio/music/m-battle-wonder.mp3 (120 s) | audiogen music | Whimsical storybook battle jig in Wonderland: fiddle, music box, pizzicato, bassoon, bodhran and woodblock, 138 BPM (try 2 added "full energy from the first second, constant loudness": try 1 built up from -27 dB over 40 s) | 2 | $1.20 |
| m-battle-moon | game/assets/audio/music/m-battle-moon.mp3 (120 s) | audiogen music | Brave battle on the Moon: guzheng runs, soaring erhu, frame drum, small cymbals, silvery pads, folk fiddle edge, 132 BPM | 1 | $0.60 |
| m-battle-oz | game/assets/audio/music/m-battle-oz.mp3 (120 s) | audiogen music | Bright brave Oz battle: quick marching chamber orchestra, woodwinds, fiddle, light brass, pizzicato, glockenspiel, snare, 140 BPM | 1 | $0.60 |
| m-battle-deep | game/assets/audio/music/m-battle-deep.mp3 (120 s) | audiogen music | Brave battle deep underground: low cello ostinato, pizzicato bass, folk fiddle, deep echoing frame drums, 132 BPM | 1 | $0.60 |
| m-battle-dream | game/assets/audio/music/m-battle-dream.mp3 (120 s) | audiogen music | Strange dreamlike battle: reversed-attack piano, wistful fiddle, wordless choir pad, muffled heartbeat drum, 126 BPM | 1 | $0.60 |
| m-army2 | game/assets/audio/music/m-army2.mp3 (120 s) | audiogen music | Bigger marching folk for a large army: snare and bass drum, reed pipes and tin whistle with low brass and strings, 112 BPM | 1 | $0.60 |
| m-army-finale | game/assets/audio/music/m-army-finale.mp3 (120 s) | audiogen music | Solemn rising finale march at 72 BPM with no drums (the Thump Stone layers carry the beat): low strings, warm horns, reed pipes, tin whistle folk melody | 1 | $0.60 |
| m-boss-whimsy | game/assets/audio/music/m-boss-whimsy.mp3 (90 s) | audiogen music | Storybook boss, whimsical and grand: brass and timpani with an off-kilter music-box waltz figure, pizzicato, bassoon, fiddle, 3/4 at 144 BPM | 1 | $0.45 |
| m-boss-hum | game/assets/audio/music/m-boss-hum.mp3 (90 s) | audiogen music | Solemn eerie boss: timpani and low frame drums, droning cello and low brass, distant wordless choir, detuned bells, a hum drone, 112 BPM | 1 | $0.45 |
| m-drowned | game/assets/audio/music/m-drowned.mp3 (120 s) | audiogen music | Drowned halls ambient: dripping harp and celesta over low drone, distant choir heard through water, lapping echo, 60 BPM | 1 | $0.60 |
| m-sunset | game/assets/audio/music/m-sunset.mp3 (120 s) | audiogen music | The main theme at sunset: solo wooden flute over plucked strings and harp (the m-title prompt) with warm strings swelling, resolving and at peace, 76 BPM | 1 | $0.60 |

Music variety pass: 23 min generated = $6.90.

Running total: $38.56 of $50 ($31.66 + $6.90 music variety pass) (audio $22.71 at list price)

Epilogue (2026-11-12, design/changes/epilogue.md; its own $20 budget): imagegen2 (gpt-image-2.6-flare), refs `game/assets/style-anchor.png` + `design/mock-screen.jpg`, the ART_BRIEF style line. Both accepted on the first try.

| ID | File | Tool | Prompt (short) | Tries | Est. cost |
|---|---|---|---|---|---|
| bg-epilogue (closing memory picture) | art-src/bg/bg-epilogue.png -> game/assets/bg/bg-epilogue.png (640x360) | imagegen2 high 1536x1024 | Flintcomb's quarry bowl at golden dusk, clover and dandelions on the chalk, a feast of rabbits of every fur round a picnic cloth, a woolly mastodon calf with kits on its back, a laughing grey captain, a flint-framed round burrow door in the bank | 1 | $0.35 |
| prop sheet "rebuild": prop-flint-doorway (2x2), prop-sprout-patch (2x2 ground), prop-feast-spread (2x2 ground), prop-dandelion-clock (1x1) | art-src/sheets/prop-rebuild.png (+ -split.png: the patch and the cloth touched, so a 120 px gap was inserted before cut_sheet) -> game/assets/sprites/props/ | imagegen2 low 1536x1024, transparent (native alpha) | four props in a row: flint-framed burrow doorway in a grassy bank with a lantern; a staked patch of clover shoots and dandelions; a picnic cloth of clover, carrots and cakes; dandelion seed clocks | 1 | $0.06 |

Sizes added to tools/sizes.py (PROPS). Epilogue spend: $0.41 of its $20. Overall running total: $38.97 ($38.56 + $0.41).

Issue #1 fix (2026-11-15, "Rabbit cut off on intro screen"; its own $20 budget): the 3:2 backdrop sources were trimmed to 16:9 equally top and bottom, which cut the hilltop rabbit's ears off bg-intro-1. tools/pixelize.py now takes a per-backdrop trim focus (BG_FOCUS_Y: bg-intro-1 top, bg-intro-3 0.3 for ear headroom; everything else centred as before). All 29 backdrop crops were checked; only these two came near anything that matters.

| ID | File | Tool | Prompt (short) | Tries | Est. cost |
|---|---|---|---|---|---|
| bg-intro-1 sky extension | art-src/bg/bg-intro-1.png (original moved down 96 px; new sky strip from .gamegen/candidates/issue1/extend-1.png, blended in above the ears, deeper on the right; original kept as .gamegen/candidates/issue1/original-bg-intro-1.png) -> game/assets/bg/bg-intro-1.png | imagegen2 high 1536x1024, edit of the shifted canvas | repaint only the top placeholder strip as sky, clouds and meadow, ears complete with sky above, keep everything else | 1 | $0.35 |

Issue #1 spend: $0.35 of its $20. Overall running total: $39.32 ($38.97 + $0.35).
