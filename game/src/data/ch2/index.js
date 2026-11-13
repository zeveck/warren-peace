// Chapter 2: Silverdown and the Moon (RTS 2, Aster, Silverdown Depths, the Moon, the Drowned Halls).
import { encounters, shops, rts } from './battles.js';
import { maps } from './maps.js';
import { scripts } from './scripts.js';
import { segments } from './segments.js';
import { bestiary, memories, banter, quests, places, homeScripts, mapAdds, homeVisitors } from './extra.js';

export default {
  maps, encounters, shops, rts, segments,
  scripts: { ...scripts, ...homeScripts, ...homeVisitors },
  bestiary, memories, banter, quests, places, mapAdds,
};
