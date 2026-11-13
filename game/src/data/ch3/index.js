// Chapter 3: Wheatsheaf and Oz (and the Stair of Eyes).
import { G } from '../../core.js';
import { encounters } from './encounters.js';
import { rts } from './rts.js';
import { wheatsheafMaps } from './maps-wheatsheaf.js';
import { wheatsheafScripts } from './scripts-wheatsheaf.js';
import { ozMaps } from './maps-oz.js';
import { ozScripts } from './scripts-oz.js';
import { shops, speakers, memories, bestiary, quests, places, banter, homeScripts, mapAdds, homeVisitors } from './extra.js';
import { segments } from './segments.js';

const segScripts = {
  'c3.seg.rts3': async (s) => {
    const r = await s.army('c3-rts3');
    if (r === 'win') { s.set('g_c3-rts3_won'); const f = G.data.scripts['c3-rts3.won']; if (f) await f(s); }
  },
};

export default {
  maps: { ...wheatsheafMaps, ...ozMaps },
  scripts: { ...wheatsheafScripts, ...ozScripts, ...homeScripts, ...homeVisitors, ...segScripts },
  encounters, rts, shops, speakers, memories, bestiary, banter, quests, places, mapAdds, segments,
};
