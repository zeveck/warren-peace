// The Undersleeper's Eye answers each story. Memories are defined by the chapters that award them; the Finale
// only adds the Eye's answering line where a chapter's entry has none, and (so the finale can never get stuck)
// a plain fallback entry for any main-path memory whose chapter isn't loaded.
import { G } from '../../core.js';

export const MAIN_MEMORIES = ['mem-river', 'mem-pebble', 'mem-dandelion', 'mem-teaparty', 'mem-traveller', 'mem-poppies', 'mem-mushrooms'];
export const OPTIONAL_MEMORIES = ['mem-roses', 'mem-wick', 'mem-china', 'mem-stars'];

export const EYE_LINES = {
  'mem-river': 'The Eye remembers water. Long ago, before the chalk, it was a sea, and it was not afraid of anything.',
  'mem-pebble': 'Somewhere far above, a small stone is warm in a paw. The Eye has never been carried by anyone. It thinks about that.',
  'mem-dandelion': 'A gift, from someone to a thing that has never been given anything. The dark folds itself a little smaller, shyly.',
  'mem-teaparty': 'The Eye does not understand the riddle either. For the first time in an age, it finds that funny.',
  'mem-traveller': 'Kindness given with nothing to give. The black sun flickers, and for a moment it is the colour of the moon.',
  'mem-poppies': 'So many small creatures, carrying the sleepers out into the air. The Eye feels lifted, gently, from underneath.',
  'mem-mushrooms': 'Things that grow in the dark and are not afraid of it. The Eye has been the dark for so long. It never knew it could grow things.',
  'mem-roses': 'Roses painted red, out of fear, then left white, out of kindness. The dream lets a little colour back in.',
  'mem-wick': 'A little flame carried a long way for someone else. The Eye, which has never been warm, leans toward it.',
  'mem-china': 'Something so easy to break, kept whole by people being careful. The Eye goes very still, so as not to crack anything.',
  'mem-stars': 'Stars in the stone, deep down, where nobody looks. The Eye looks. They were always there. They were its own.',
};

// shown only if a chapter's memory is missing (so the finale still works when a chapter isn't loaded)
const FALLBACK = {
  'mem-river': { title: 'The river', friend: 'mole', line: 'Mole saw the river for the first time and sat down in the grass, quite overcome. "Oh my! Oh my!"', bg: 'riverbank' },
  'mem-pebble': { title: 'Tansy\'s chalk pebble', friend: 'tansy', line: 'A chalk pebble scratched with Tansy\'s mark, rolled all the way from the east so somebody would know she was still herself.', bg: 'downs' },
  'mem-dandelion': { title: 'Ninefold\'s dandelion', friend: 'ninefold', line: '"I have never been offered a dandelion before. I will keep it forever." And it has.', bg: 'shallows' },
  'mem-teaparty': { title: 'The tea-party', friend: 'cheshire-cat', line: 'Always six o\'clock, always tea, and a riddle with no answer that made the Hatter happier every time you guessed.', bg: 'wonder-garden' },
  'mem-traveller': { title: 'The old traveller', friend: 'jade-rabbit', line: 'A hungry old traveller on the moon, and a share of sweetgrass given when there was nothing else to give.', bg: 'moon' },
  'mem-poppies': { title: 'The poppy field', friend: 'mouse-queen', line: 'Asleep in the poppies, and ten thousand field mice pulling the whole party out into the clean air.', bg: 'oz-road' },
  'mem-mushrooms': { title: 'The giant mushrooms', friend: 'rumble', line: 'A forest of mushrooms taller than trees, glowing under the earth, and a little mastodon trumpeting at every one.', bg: 'mushroom' },
  'mem-roses': { title: 'The painted roses', friend: 'seven-of-spades', line: 'Three white roses painted red in a hurry, before the Queen came, and nobody\'s head came off.', bg: 'wonder-garden' },
  'mem-wick': { title: 'Wick\'s flame', friend: 'wick', line: 'A flame from Chang\'e\'s lanterns, carried all the way to the moths\' grove, so they could have a light of their own.', bg: 'moon' },
  'mem-china': { title: 'The China Princess', friend: 'tin-woodman', line: 'A tiny china princess on a shelf of a country, who would crack if she ever left it, and so was left in peace.', bg: 'emerald' },
  'mem-stars': { title: 'Elevenfold\'s star-stones', friend: 'elevenfold', line: 'Three star-stones from the Root of the World, glowing in the paw, traded for nothing but a thank-you.', bg: 'root' },
};

// fill in the Eye's lines (and any missing main-path memory); make sure there are five stories to tell
export function ensureMemories() {
  const M = G.data.memories = G.data.memories || {};
  for (const id of [...MAIN_MEMORIES, ...OPTIONAL_MEMORIES]) {
    if (!M[id] && FALLBACK[id]) M[id] = { ...FALLBACK[id], eye: EYE_LINES[id] };
    else if (M[id] && !M[id].eye) M[id].eye = EYE_LINES[id];
  }
  const have = (G.s.memories || []).filter(id => M[id]);
  if (have.length < 5) for (const id of MAIN_MEMORIES) if (!G.s.memories.includes(id) && G.s.memories.filter(m => M[m]).length < 5) G.s.memories.push(id);
}
