// Army squads (design "The army battles"). Multipliers on the kind's base: hp, atk, def, spd.
export const KINDS = {
  stout: { name: 'Stout', hp: 120, atk: 10, def: 6, spd: 1.2, cap: 5, icon: 'ico-stout' },
  swift: { name: 'Swift', hp: 80, atk: 12, def: 3, spd: 2.0, cap: 3, icon: 'ico-swift' },
  wing: { name: 'Wing', hp: 70, atk: 11, def: 2, spd: 2.4, cap: 5, icon: 'ico-wing' },
  eerie: { name: 'Eerie', hp: 100, atk: 9, def: 5, spd: 0.9, cap: 5, icon: 'ico-eerie' },
};
// sprite: the map sprite each squad figure uses; fur: a fur ramp for generic rabbit squads
export const SQUADS = {
  'thimblebank-rabbits': { name: 'Thimblebank Rabbits', leader: 'bramble', kind: 'swift', m: [1, 1, 1, 1], perk: 'atk-aura', sprite: 'rabbit-buck', fur: 'brown', color: '#c9b458' },
  'thimblebank-diggers': { name: 'Thimblebank Diggers', leader: 'burdock', kind: 'stout', m: [1.1, 1, 1.1, 1], perk: 'fast-tunnel', sprite: 'burdock', color: '#9a6a3a' },
  carollers: { name: 'Field-mouse Carollers', leader: 'mole', kind: 'swift', m: [0.8, 0.9, 1, 1], perk: 'regen-aura', sprite: 'caroller', color: '#d9773a' },
  otters: { name: 'Otters', leader: 'ratty', kind: 'swift', m: [1, 1.1, 1, 1.2], sprite: 'otter', color: '#5a9ab0' },
  hedgehogs: { name: 'Hedgehogs', leader: 'badger', kind: 'stout', m: [1.2, 0.9, 1.2, 0.9], perk: 'thorns', sprite: 'hedgehog', color: '#7a6a5a' },
  'reformed-weasels': { name: 'Reformed Weasels', leader: 'toad', kind: 'swift', m: [0.9, 1.2, 0.8, 1.1], sprite: 'weasel', color: '#6aa04a' },
  'the-grin': { name: 'The Grin', leader: 'cheshire-cat', kind: 'swift', m: [0.7, 1.3, 0.8, 1.1], perk: 'hidden', sprite: 'cheshire-cat', battleSprite: true, one: true, color: '#c86aa0' },
  flamingos: { name: 'Flamingos', leader: 'caterpillar', kind: 'wing', m: [1, 1, 1, 1], sprite: 'flamingo', color: '#e88aa0' },
  heralds: { name: 'White Rabbit\'s Heralds', leader: 'white-rabbit', kind: 'swift', m: [0.8, 0.9, 0.9, 1.4], perk: 'fast-capture', sprite: 'white-rabbit', color: '#f0e8f0' },
  'card-gardeners': { name: 'Card Gardeners', leader: 'seven-of-spades', kind: 'stout', m: [1, 1, 1, 1], perk: 'capture-4', sprite: 'card-soldier', color: '#3a3a4a', optional: true },
  'polite-dark': { name: 'The Polite Dark', leader: 'ninefold', kind: 'eerie', m: [1, 1, 1, 1], perk: 'aura', sprite: 'ninefold', color: '#4b3f72' },
  'cherts-band': { name: 'Chert\'s Band', leader: 'chert', kind: 'swift', m: [0.9, 1, 0.9, 1], perk: 'hum-resist', sprite: 'raider', fur: 'dark', color: '#6a6a7a' },
  'silverdown-rabbits': { name: 'Silverdown Rabbits', leader: 'aster', kind: 'swift', m: [1, 1, 1, 1], perk: 'hill-def', sprite: 'rabbit-buck', fur: 'silver', color: '#cfd8e8' },
  'moon-hares': { name: 'Moon Hares', leader: 'jade-rabbit', kind: 'swift', m: [0.9, 1, 1, 1.2], perk: 'light', sprite: 'moon-hare', color: '#a0e0c0' },
  'lantern-moths': { name: 'Lantern Moths', leader: 'wick', kind: 'wing', m: [0.8, 1, 0.9, 1], perk: 'light-reveal', sprite: 'wick', color: '#f0c860', optional: true },
  'tansys-scouts': { name: 'Tansy\'s Scouts', leader: 'tansy', kind: 'swift', m: [0.8, 1.1, 0.9, 1.3], perk: 'reveal', sprite: 'rabbit-buck', fur: 'sandy', color: '#e8d4a4' },
  'wheatsheaf-rabbits': { name: 'Wheatsheaf Rabbits', leader: 'barley', kind: 'stout', m: [1.1, 1, 1.1, 1], perk: 'deep-cover', sprite: 'rabbit-buck', fur: 'ginger', color: '#d8a048' },
  'pips-kits': { name: 'Pip\'s Kits', leader: 'pip', kind: 'swift', m: [0.7, 0.8, 0.8, 1.2], perk: 'supply-capture', sprite: 'rabbit-kit', kid: true, fur: 'brown', color: '#d4b088' },
  winkies: { name: 'Winkies', leader: 'tin-woodman', kind: 'stout', m: [1.2, 1, 1.3, 0.9], sprite: 'winkie', color: '#e0c040' },
  'emerald-guard': { name: 'Emerald Guard', leader: 'scarecrow', kind: 'stout', m: [1, 0.9, 1.2, 1], perk: 'def-aura', sprite: 'guardian', color: '#3fa45b' },
  'lions-beasts': { name: 'Lion\'s Beasts', leader: 'cowardly-lion', kind: 'stout', m: [1.1, 1.3, 1, 1], perk: 'outnumbered', sprite: 'cowardly-lion', color: '#c89040' },
  'field-mice': { name: 'Field Mice', leader: 'mouse-queen', kind: 'swift', m: [1, 0.8, 0.8, 1.1], perk: 'regen', sprite: 'mouse-queen', color: '#a0a0a8' },
  'winged-monkeys': { name: 'Winged Monkeys', leader: 'monkey-king', kind: 'wing', m: [1, 1.2, 1, 1.1], sprite: 'monkey-king', color: '#8a6a4a' },
  'flintcomb-diggers': { name: 'Flintcomb Diggers', leader: 'captain-quarry', kind: 'stout', m: [1.2, 1.1, 1.1, 0.9], perk: 'fast-tunnel', sprite: 'quarryman', color: '#8a8a8e' },
  'mastodon-herd': { name: 'Mastodon Herd', leader: 'rumble', kind: 'stout', m: [1.6, 1.2, 1.2, 0.7], sprite: 'mastodon', color: '#8a5a3a' },
  'deepdelve-echoes': { name: 'Deepdelve Echoes', leader: null, kind: 'eerie', m: [1, 1, 1, 1], perk: 'aura', sprite: 'rabbit-buck', look: 'hollow', free: true, color: '#6a7aa0' },
};
export const ENEMY_SQUADS = {
  raiders: { name: 'Raiders', kind: 'swift', m: [1, 1, 1, 1], sprite: 'raider' },
  diggers: { name: 'Diggers', kind: 'stout', m: [1, 1, 1, 1], sprite: 'hum-digger' },
  lookouts: { name: 'Lookouts', kind: 'swift', m: [0.8, 0.8, 0.8, 1.3], perk: 'reveal', sprite: 'hum-lookout' },
  'pigeon-riders': { name: 'Pigeon Riders', kind: 'wing', m: [0.9, 1, 1, 1.1], sprite: 'pigeon-rider' },
  rooks: { name: 'Rooks', kind: 'wing', m: [0.9, 1.1, 0.9, 1.1], sprite: 'rook' },
  quarrymen: { name: 'Quarrymen', kind: 'stout', m: [1.2, 1, 1.3, 0.9], sprite: 'quarryman' },
  drift: { name: 'Drift', kind: 'eerie', m: [0.6, 0.9, 0.8, 1.6], sprite: 'whisper', look: 'dream' },
  weight: { name: 'Weight', kind: 'eerie', m: [1.6, 1.1, 1.2, 0.6], sprite: 'late-footstep', look: 'dream' },
  flicker: { name: 'Flicker', kind: 'eerie', m: [0.8, 1, 0.8, 1.3], sprite: 'star-thing', look: 'dream' },
};
// matchup multiplier
export function matchup(a, b, aLight) {
  if (aLight && b === 'eerie') return 2.0;
  const beats = { stout: 'swift', swift: 'wing', wing: 'stout' };
  if (beats[a] === b) return 2.0;
  if (beats[b] === a) return 0.5;
  return 1.0;
}
