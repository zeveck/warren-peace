// The Epilogue: "Digging the Other Way". After the ending, Bramble helps Flintcomb rebuild, upward.
// Design: design/changes/epilogue.md (+ design/changes/REVIEW.md section 3). Optional; the ending stays the ending.
import { MAPS } from './maps.js';
import scripts from './scripts.js';
import { MAP_ADDS } from './adds.js';
import { SEGMENTS } from './segments.js';
import * as EX from './extra.js';
export default {
  maps: MAPS,
  scripts: { ...scripts, ...EX.homeScripts },
  mapAdds: MAP_ADDS,
  speakers: EX.speakers, bestiary: EX.bestiary, memories: EX.memories, banter: EX.banter, quests: EX.quests, places: EX.places,
  segments: SEGMENTS,
};
