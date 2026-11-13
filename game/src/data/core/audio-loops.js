// Loop windows per music track: id -> [loopStart, loopEnd] in seconds (Chromium decode timing). Picked by measurement
// (design/progress/loops.md): the 3 s after loopEnd sound like the 3 s after loopStart (same phrase and beat), both
// sides agree in the 50 ms around the seam, the seam sits near matching zero crossings, and both are at the steady
// level before each track fades. Anything before loopStart plays once as an intro. The engine crossfades every seam
// over 30 ms (engine/audio.js), so a few ms of per-browser MP3 delay cannot click.
export const LOOPS = {
  'm-title': [11.4517, 65.4517], 'm-dream': [15.0593, 108.4817], 'm-wildwood': [4.5941, 29.6231], 'm-depths': [10.4949, 81.5614],
  'm-deep': [12.3871, 67.4602], 'm-wheatsheaf': [9.335, 53.3031], 'm-attack': [1.2628, 31.8131], 'm-boss': [16.7509, 68.462],
  'm-silverdown': [10.0932, 54.3183], 'm-flintcomb': [1.3593, 51.7597], 'm-journey': [33.2811, 101.8825], 'm-downs': [16.9191, 91.5973],
  'm-warren': [12.2679, 103.2129], 'm-battle': [18.538, 114.5349], 'm-army': [34.4632, 110.5035], 'm-riverbank': [35.3624, 97.5005],
  'm-wonderland': [19.6505, 107.8338], 'm-moon': [34.8004, 112.358], 'm-oz': [30.2155, 90.2259], 'm-battle-wonder': [31.4895, 94.0984],
  'm-battle-moon': [43.9742, 116.6999], 'm-battle-oz': [28.8512, 107.7387], 'm-battle-deep': [31.9545, 95.6212], 'm-battle-dream': [1.2738, 107.4646],
  'm-army2': [35.4223, 95.4321], 'm-army-finale': [29.1916, 105.6332], 'm-boss-whimsy': [22.4896, 74.9665], 'm-boss-hum': [20.1138, 75.8142],
  'm-drowned': [25.9137, 105.9078], 'm-sunset': [33.6164, 109.4359],
};
