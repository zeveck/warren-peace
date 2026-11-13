// Chapter 1 (Wonderland and the Shallows): the keyhole door and the eye-stair off Thimblebank's Underway.
import wonderMaps from './maps-wonder.js';
import shallowsMaps from './maps-shallows.js';
import encounters from './encounters.js';
import { scripts } from './scripts.js';
import { shops, speakers, memories, bestiary, quests, places, mapAdds } from './extra.js';
import banter from './banter.js';
import { segments } from './segments.js';

export default {
  maps: { ...wonderMaps, ...shallowsMaps },
  scripts, encounters, shops, speakers, memories, bestiary, banter, quests, places, mapAdds, segments,
};
