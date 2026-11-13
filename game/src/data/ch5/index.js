// The Finale: the Sleeping Deep, the Long Thump (RTS 5), the Dream, and the ending at sunset.
import encounters from './encounters.js';
import rts from './rts.js';
import maps from './maps.js';
import scripts from './scripts.js';
import { SPEAKERS, BESTIARY, BANTER, QUESTS, PLACES } from './extras.js';
import { SEGMENTS } from './segments.js';
import { MAP_ADDS, ADD_SPEAKERS, ADD_SCRIPTS } from './adds.js';

export default {
  maps, scripts: { ...scripts, ...ADD_SCRIPTS }, encounters, rts, mapAdds: MAP_ADDS,
  speakers: { ...SPEAKERS, ...ADD_SPEAKERS }, bestiary: BESTIARY, banter: BANTER, quests: QUESTS, places: PLACES,
  segments: SEGMENTS,
};
