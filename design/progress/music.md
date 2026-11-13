# Music variety pass (2026-11-12)

Playtest note: one m-battle under every normal fight, one m-army for all 5 army battles, m-depths in both the Depths and the Drowned Halls, m-title over the ending, m-boss used 13 times.

## New tracks (game/assets/audio/music, MP3 44.1 kHz 128 kbps like the others)

| ID | Length | Loop window | Plays |
|---|---|---|---|
| m-battle-wonder | 120 s | 0.5-109.29 | Normal fights on wonder-garden, wonder-hall, and mushroom (only c1w.* encounters) backdrops |
| m-battle-moon | 120 s | 32-112.22 | Normal fights on the moon backdrop |
| m-battle-oz | 120 s | 14-106.45 | oz-road, emerald, winkie backdrops |
| m-battle-deep | 120 s | 0.5-113.37 | lidenbrock, root, stair, and mushroom (c4.*) backdrops |
| m-battle-dream | 120 s | 0.5-107.64 | dream backdrop |
| m-army2 | 120 s | 2.5-111.39 | RTS3 Wheatsheaf, RTS4 Flintcomb (data `music`), and the RTS5 preview (`previewMusic`) |
| m-army-finale | 120 s | 5-101.42 | RTS5 Long Thump, under the 72 BPM thump layers (no drums of its own); its drone-bed drops 0.6 to 0.35 when a track plays |
| m-boss-whimsy | 90 s | 1-78.32 | Queen of Hearts croquet, Moth Queen, Kalidahs, Wicked Witch |
| m-boss-hum | 90 s | 0.5-68.19 | The Choir, Tansy (taken), Tidewarden, the Watcher, the Hollow Rabbits, both ch5 Nightmares (they had m-dream) |
| m-drowned | 120 s | 4-99.85 | The Drowned Halls (c2-drowned); the Drowned Pool after g_ch2_done (before that it stays m-deep) |
| m-sunset | 120 s | 0.5-110.69 | When the Eye closes (ch5 scripts), the sunset map, the credits (screens/ending.js) |

m-boss now plays for: Chief Weasel, Aster, Barley, Captain Quarry (4 instead of 13). The downs, Thimblebank, River Bank, Wild Wood, Shallows, Depths and Drowned backdrops keep m-battle. The Undersleeper Eye keeps m-dream. The title keeps m-title.

## Code
- battle/rpg.js: `WORLD_BATTLE` map and `battleMusic(encId, enc)`. Explicit `enc.music` still wins, bosses still fall back to m-boss, anything unmapped falls back to m-battle.
- rts/rts.js: the preview plays `previewMusic || music || 'm-army'`; the battle plays `data.music`, or the old default.
- Boss `music:` fields in ch1w/ch2/ch3/ch4/ch5 encounter defs; `music:` in ch2 maps (drowned), ch5 maps (sunset), ch5 scripts, screens/ending.js.
- data/core/audio-loops.js: loop windows. Loop ends were found by decoding in Chromium: the best 50 ms waveform match to the loop start, before each track's fade. The moon, oz, finale and drowned tracks have a quieter opening that plays once before the loop starts. Each window was checked against the level envelope, but none has been checked by ear.
- sw.js fills FILES from the folder at deploy, and manifest.json lists no audio, so neither needed a change.

## Checks
- Levels (Chromium decode, whole-track RMS): new tracks are -14.7 to -19.3 dBFS; the old ones are -15.6 to -17.3. m-drowned is the loudest at -14.7 and m-boss-whimsy the quietest at -19.3. Peaks are -0.9 to -3.6 dBFS.
- m-battle-wonder try 1 started at -27 dB and took about 40 s to build up, which is weak for a battle, so I regenerated it once. Try 2 starts at -22 dB and settles near -18.
- Browser check (?debug=1, New Game, then dev warp): the Drowned Halls gives `track: 'm-drowned'`; startBattle('c2.mn-1') gives `track: 'm-battle-moon'`. No console errors.
- node --check passed on every touched file.
