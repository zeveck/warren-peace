# Music loop seams (2026-11-12)

Polish review: five tracks clicked on every loop (hard jump at the seam bigger than any step in the track), and several
seams didn't line up with the music. Measuring every track showed most of the old tracks were as bad (m-oz, m-army,
m-wonderland, m-battle, m-title...).

## Engine (game/src/engine/audio.js)
- Music no longer uses `src.loop`. Each track is played as overlapping one-shot segments: a segment fades out over
  30 ms centred on loopEnd (equal-power sin/cos curve, `setValueCurveAtTime`, linear-ramp fallback) while the next
  starts at loopStart - 15 ms and fades in. Small mismatches and the per-browser MP3 delay (~25 ms; these files have
  no LAME gapless tag, so browsers may differ) can't click.
- Always one segment queued ahead: when a segment ends (`onended`, ~loopEnd), the one after the queued one is
  scheduled, a full loop in advance. No timers, so background-tab throttling can't starve it. If the main thread
  ever stalls past a start time, the offset is advanced to stay in time.
- Per-track gain sits above the segment gains, so the 1.5 s track crossfade (`fadeOut`), mute (master), duck and
  volume (musicBus) are unchanged. Track change: old token is faded, then `stopTrack` stops every segment
  (queued ones never start) and `onended` won't queue more (`music === token && !token.dead`). Token guard unchanged.
- A track with no LOOPS entry loops lead..duration with the same crossfade.

## Loop windows (game/src/data/core/audio-loops.js)
All 30 re-picked by measurement (Node, mpg123-decoder wasm; its output is sample-identical to Chromium's
decodeAudioData for these files, checked on three tracks):
1. Phrase match: 9 log band energies every 11.6 ms; for every (start, end) pair, the 3 s after the end must look like
   the 3 s after the start (and the 1.5 s before), with a penalty if either side is >4 dB under the track average.
   Cost = match / median match + 0.5 x (1 - loop length / usable span), loops at least 45% of the span, ends at least
   3 s before each track's fade. Top 15 distinct pairs kept.
2. Each pair: waveform lag (100 ms correlation, +-34 ms), then both points moved together (lag kept) either locally
   or up to +-150 ms to where both sides agree across the crossfade, snapped to the sample with the smallest jump,
   matching slope, near zero. Best total of phrase cost + 0.3 x seam score (jump / track max, 50 ms correlation,
   correlation with both points shifted +-25 ms, level difference).
3. Values kept to 0.1 ms (rounding to 1 ms would break the sample lag).

Trade-off: many loops now start later (the part before loopStart plays once as an intro) and some are shorter where
the track doesn't repeat well over a longer span: m-wildwood 25 s (was 46), m-title 54 (84), m-boss 52 (72),
m-boss-whimsy 52 (77), m-battle-deep 64 (113), m-army2 60 (109), m-oz 60 (115). Not checked by ear.

## Measurements (Node, hard loop without the crossfade; jump = |x[loopStart] - x[loopEnd]|, max over L/R; c50 = mono correlation of the 50 ms after loopEnd vs after loopStart)
| Track | Old window | Old jump / track max | Old c50 | New window | New jump | New c50 (at -25/+25 ms) | New lvStart/lvEnd dB |
|---|---|---|---|---|---|---|---|
| m-title | 1-85 | 0.209 / 0.091 | -0.09 | 11.4517-65.4517 (54 s) | 0.037 | 0.7 (0.75 / 0.64) | -0.7 / 2.6 |
| m-dream | 13-111 | 0.076 / 0.077 | -0.24 | 15.0593-108.4817 (93.4 s) | 0.015 | 0.2 (0.09 / 0.13) | -3.5 / -2.3 |
| m-wildwood | 2-48 | 0.04 / 0.07 | 0.1 | 4.5941-29.6231 (25 s) | 0.002 | 0.9 (0.86 / 0.87) | 2 / 2.2 |
| m-depths | 2-86 | 0.045 / 0.025 | -0.03 | 10.4949-81.5614 (71.1 s) | 0.002 | 0.51 (0.42 / 0.51) | 2.1 / 0.5 |
| m-deep | 3-84 | 0.139 / 0.121 | -0.8 | 12.3871-67.4602 (55.1 s) | 0.01 | 0.8 (0.79 / 0.8) | 2 / 1.6 |
| m-wheatsheaf | 3-56 | 0.109 / 0.328 | 0.21 | 9.335-53.3031 (44 s) | 0.006 | 0.81 (0.82 / 0.75) | -2.1 / -2.1 |
| m-attack | 0.5-35.5 | 0.095 / 0.097 | 0.01 | 1.2628-31.8131 (30.6 s) | 0.001 | 0.94 (0.96 / 0.9) | -0.2 / 0.7 |
| m-boss | 0.5-73 | 0.162 / 0.386 | -0.21 | 16.7509-68.462 (51.7 s) | 0.005 | 0.68 (0.69 / 0.6) | 1.5 / 1.7 |
| m-silverdown | 0.5-57 | 0.049 / 0.029 | 0.31 | 10.0932-54.3183 (44.2 s) | 0.016 | 0.94 (0.91 / 0.95) | 0.8 / -0.4 |
| m-flintcomb | 0.5-58 | 0.384 / 0.543 | 0.36 | 1.3593-51.7597 (50.4 s) | 0.02 | 0.64 (0.5 / 0.67) | -3.8 / -1 |
| m-journey | 2-115 | 0.014 / 0.095 | -0.7 | 33.2811-101.8825 (68.6 s) | 0.008 | 0.74 (0.73 / 0.72) | -0.4 / 2 |
| m-downs | 0.5-115 | 0.245 / 0.422 | 0.12 | 16.9191-91.5973 (74.7 s) | 0.003 | 0.85 (0.86 / 0.86) | 0.3 / 0.5 |
| m-warren | 0.5-112 | 0.024 / 0.081 | 0.04 | 12.2679-103.2129 (90.9 s) | 0.003 | 0.97 (0.96 / 0.92) | -2.9 / -2.8 |
| m-battle | 0.5-115 | 0.353 / 0.599 | 0.22 | 18.538-114.5349 (96 s) | 0.11 | 0.61 (0.46 / 0.54) | -0.1 / 1 |
| m-army | 0.5-115 | 0.361 / 0.29 | 0.03 | 34.4632-110.5035 (76 s) | 0.017 | 0.44 (0.35 / 0.43) | -3.2 / -1.9 |
| m-riverbank | 0.5-115 | 0.167 / 0.085 | 0.27 | 35.3624-97.5005 (62.1 s) | 0.047 | 0.5 (0.46 / 0.37) | 0.3 / 1.6 |
| m-wonderland | 0.5-115 | 0.372 / 0.24 | -0.09 | 19.6505-107.8338 (88.2 s) | 0.012 | 0.68 (0.7 / 0.58) | -3.4 / -2.7 |
| m-moon | 0.5-115 | 0.186 / 0.441 | 0.53 | 34.8004-112.358 (77.6 s) | 0.027 | 0.65 (0.61 / 0.56) | -4.3 / -2.7 |
| m-oz | 0.5-115 | 0.409 / 0.38 | 0.08 | 30.2155-90.2259 (60 s) | 0.008 | 0.77 (0.73 / 0.78) | 1.1 / 3.9 |
| m-battle-wonder | 0.5-109.29 | 0.09 / 0.458 | 0.41 | 31.4895-94.0984 (62.6 s) | 0.031 | 0.65 (0.6 / 0.66) | 0.2 / 0.8 |
| m-battle-moon | 32-112.22 | 0.177 / 0.942 | 0.29 | 43.9742-116.6999 (72.7 s) | 0.136 | 0.35 (0.24 / 0.31) | 1.5 / 3.5 |
| m-battle-oz | 14-106.45 | 0.148 / 0.358 | 0.08 | 28.8512-107.7387 (78.9 s) | 0.015 | 0.59 (0.61 / 0.43) | 0.5 / 1.8 |
| m-battle-deep | 0.5-113.37 | 0.687 / 0.227 | 0.4 | 31.9545-95.6212 (63.7 s) | 0.014 | 0.58 (0.37 / 0.6) | -1.8 / -1.9 |
| m-battle-dream | 0.5-107.64 | 0.084 / 0.138 | 0.37 | 1.2738-107.4646 (106.2 s) | 0.011 | 0.74 (0.76 / 0.72) | -5 / -3.9 |
| m-army2 | 2.5-111.39 | 0.115 / 0.372 | -0.17 | 35.4223-95.4321 (60 s) | 0.139 | 0.6 (0.61 / 0.55) | 2.5 / 1.7 |
| m-army-finale | 5-101.42 | 0.106 / 0.145 | -0.08 | 29.1916-105.6332 (76.4 s) | 0.08 | 0.7 (0.68 / 0.68) | -0.3 / -0.9 |
| m-boss-whimsy | 1-78.32 | 0.144 / 0.161 | 0.6 | 22.4896-74.9665 (52.5 s) | 0.012 | 0.71 (0.61 / 0.49) | 0.2 / 0.3 |
| m-boss-hum | 0.5-68.19 | 0.134 / 0.113 | 0.64 | 20.1138-75.8142 (55.7 s) | 0.011 | 0.7 (0.68 / 0.73) | -4 / -1.2 |
| m-drowned | 4-99.85 | 0.298 / 0.074 | 0.87 | 25.9137-105.9078 (80 s) | 0.015 | 0.93 (0.94 / 0.9) | 0.9 / 0.6 |
| m-sunset | 0.5-110.69 | 0.206 / 0.164 | -0.2 | 33.6164-109.4359 (75.8 s) | 0.074 | 0.72 (0.78 / 0.66) | 0.5 / 0.6 |

With the engine crossfade (simulated in Node at the decode alignment and with both points shifted +-25 ms, and
rendered in Chromium with OfflineAudioContext using the engine's curves), the largest step in the 100 ms around every
seam is no bigger than the music's own steps around loopStart (e.g. m-battle-deep 0.036 vs 0.044 nearby, m-drowned
0.018 vs 0.016, m-sunset 0.087 vs 0.075, m-boss-hum 0.023 vs 0.027). Level through the crossfade is within -3..+6 dB of
the 30 ms before it (the + side is drum hits landing in the window).

Still weakest (phrase-level, not clicks): m-dream c50 0.2 (through-composed, no good repeat), m-battle-moon 0.35,
m-army 0.44. m-army2 loop start is now +2.5 dB vs average (was -7.1); m-army-finale's end -0.9 dB (was -3.9).

## Browser check (Chromium, session "loops", ?debug=1)
- Title plays m-title; segments start at t0 (offset lead) and the next is queued at exactly seam - 15 ms, offset loopStart - 15 ms.
- startBattle('c1w.croquet') (m-boss-whimsy, loopEnd 74.97): passed loopEnd at ctx ~131 s, the next segment was
  queued for the following seam, track kept playing. No console errors or warnings.
- startBattle('c2.mn-1') -> m-battle-moon; winBattle -> back to m-downs; warp to c2-drowned -> m-drowned.
- M mutes (musicMuted true) and unmutes.
- node --check on both files.

Scripts were in the session scratchpad (decode.mjs, pick.mjs, fine.mjs, evaluate.mjs); to redo: decode with
`npm i mpg123-decoder`, then the steps above.
