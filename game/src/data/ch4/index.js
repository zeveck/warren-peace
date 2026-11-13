// Chapter 4: Flintcomb and the Center of the Earth.
import { RTS } from './rts.js';
import * as FC from './flintcomb.js';
import * as JN from './journey.js';
import * as HD from './herd.js';
import * as RT from './root.js';
import { SEGMENTS } from './segments.js';
import * as EX from './extra.js';
export default {
  maps: { ...FC.MAPS, ...JN.MAPS, ...HD.MAPS, ...RT.MAPS },
  scripts: { ...FC.SCRIPTS, ...JN.SCRIPTS, ...HD.SCRIPTS, ...RT.SCRIPTS, ...EX.homeScripts, ...EX.homeVisitors },
  encounters: { ...FC.ENCOUNTERS, ...JN.ENCOUNTERS, ...HD.ENCOUNTERS, ...RT.ENCOUNTERS },
  shops: { ...FC.SHOPS, ...RT.SHOPS },
  rts: RTS,
  speakers: { knapper: { name: 'Old Knapper', por: 'quarryman' } },
  bestiary: EX.bestiary, memories: EX.memories, banter: EX.banter, quests: EX.quests, places: EX.places, mapAdds: EX.mapAdds,
  segments: SEGMENTS,
};
