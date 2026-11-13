// Chapter 1: the Depths of Thimblebank (the Depths, the Underway, the River Bank, home briefly, RTS 1 and the
// Great Burrow). Wonderland and the Shallows are ch1w's.
import depthsMaps from './maps-depths.js';
import riverMaps from './maps-river.js';
import { scripts } from './scripts.js';
import encounters from './encounters.js';
import rts from './rts.js';
import { speakers, bestiary, memories, banter, quests, places, shops, mapAdds } from './extra.js';
import { segments, segScripts } from './segments.js';

export default {
  maps: { ...depthsMaps, ...riverMaps },
  scripts: { ...scripts, ...segScripts },
  encounters, rts, shops, speakers, bestiary, memories, banter, quests, places, mapAdds, segments,
};
