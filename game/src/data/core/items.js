// Items, key items, party gear and army gear (design "Gear, items and shops").
export const ITEMS = {
  'clover-bunch': { name: 'Clover Bunch', icon: 'ico-clover-bunch', price: 12, use: { heal: 30 }, d: 'Heal 30 Heart.' },
  dandelion: { name: 'Dandelion', icon: 'ico-dandelion', price: 30, use: { heal: 80 }, d: 'Heal 80 Heart.' },
  'carrot-cake': { name: 'Carrot Cake', icon: 'ico-carrot-cake', price: 60, use: { healAll: 60 }, d: 'Heal everyone 60 Heart.' },
  'pluck-berry': { name: 'Pluck Berry', icon: 'ico-pluck-berry', price: 25, use: { pluck: 15 }, d: '+15 Pluck to one.' },
  'smelling-salts': { name: 'Smelling Salts', icon: 'ico-smelling-salts', price: 15, use: { cure: 'asleep' }, d: 'Wake one friend.' },
  'courage-biscuit': { name: 'Courage Biscuit', icon: 'ico-courage-biscuit', price: 15, use: { cure: 'afraid' }, d: 'Cure Afraid.' },
  'drink-me': { name: 'Drink Me', icon: 'ico-drink-me', price: 20, use: { status: 'shrunk', foe: true }, d: 'In battle: Shrunk on a foe.' },
  'eat-me': { name: 'Eat Me', icon: 'ico-eat-me', price: 20, use: { status: 'grown' }, d: 'In battle: Grown on a friend.' },
  comfits: { name: 'Comfits', icon: 'ico-comfits', price: 45, use: { healAll: 40 }, d: 'Heal everyone 40 Heart.' },
  mooncake: { name: 'Mooncake', icon: 'ico-mooncake', price: 70, use: { heal: 120 }, d: 'Heal 120 Heart.' },
  'jade-elixir': { name: 'Jade Elixir', icon: 'ico-jade-elixir', price: 120, use: { revive: 0.5 }, d: 'Get a resting friend up at half Heart.' },
  'emerald-lozenge': { name: 'Emerald Lozenge', icon: 'ico-emerald-lozenge', price: 90, use: { pluckAll: 30 }, d: '+30 Pluck to everyone.' },
  'water-pail': { name: 'Water Pail', icon: 'ico-water-pail', price: 0, use: { pail: true, foe: true }, d: 'Splash! (The Witch can\'t abide water.)' },
  'glow-mushroom': { name: 'Glow-Mushroom', icon: 'ico-glow-mushroom', price: 160, use: { healAll: 200 }, d: 'Heal everyone 200 Heart.' },
  'star-stone-item': { name: 'Star-stone', icon: 'ico-star-stone', price: 80, use: { cureAll: true }, d: 'Cure every status on everyone.' },
};
export const KEY_ITEMS = {
  'old-key': { name: 'The Old Key', icon: 'ico-old-key', d: 'Yarrow\'s key to the door that never opened.' },
  'pips-button': { name: 'Pip\'s Button', icon: 'ico-pips-button', d: 'A shiny brass button. Pip lost it.' },
  sweetgrass: { name: 'Sweetgrass', icon: 'ico-sweetgrass', d: 'For Yarrow. Sweet and green.' },
  'chalk-pebble': { name: 'Tansy\'s Chalk Pebble', icon: 'ico-chalk-pebble', d: 'Scratched with Tansy\'s mark. She\'s alive.' },
  'ninefold-dandelion': { name: 'A Dandelion for Ninefold', icon: 'ico-ninefold-dandelion', d: 'A gift. It has never been given one.' },
  'mushroom-halves': { name: 'The Two Sides of the Mushroom', icon: 'ico-mushroom-halves', d: 'One side makes you grow taller, the other shorter.' },
  'jade-pestle': { name: 'The Jade Pestle', icon: 'ico-jade-pestle', d: 'The Jade Rabbit\'s pestle.' },
  'silver-shoes': { name: 'The Silver Shoes', icon: 'ico-silver-shoes', d: 'Three steps take you anywhere. Even into a dream.' },
  'golden-cap': { name: 'The Golden Cap', icon: 'ico-golden-cap', d: 'Its wearer may call the Winged Monkeys three times.' },
  'barleys-bell': { name: 'Barley\'s Bell', icon: 'ico-barleys-bell', d: 'Wheatsheaf\'s old warning bell.' },
  'silverdown-key': { name: 'Silverdown\'s Depths Key', icon: 'ico-depths-key', d: 'Opens Silverdown\'s deep door.' },
  'wheatsheaf-key': { name: 'Wheatsheaf\'s Depths Key', icon: 'ico-depths-key', d: 'Opens Wheatsheaf\'s deep door.' },
  'flintcomb-key': { name: 'Flintcomb\'s Depths Key', icon: 'ico-depths-key', d: 'Flintcomb\'s door was dug through long ago.' },
  'star-stones': { name: 'Star-stones', icon: 'ico-star-stone', d: 'Elevenfold would like three.' },
  'gloves-fan': { name: 'Gloves and Fan', icon: 'ico-pearl', d: 'The White Rabbit\'s. He\'s late without them.' },
  'flame': { name: 'A Palace Flame', icon: 'ico-light', d: 'A flame from Chang\'e\'s lanterns, for the moths.' },
  'scent': { name: 'Mole\'s Scent', icon: 'ico-nibble', d: '' },
  'knappers-flint': { name: 'Knapper\'s Flint', icon: 'ico-chalk-pebble', d: 'A little heart knapped from the Top Stone\'s chips. Warm when the hills purr.' },   // the Epilogue's keepsake
};
// Party gear: 24 bases x 6 tiers would be too many; each shop sells specific (base, tier) pieces.
// slot: tool (+3t STR or WIT), coat (+2t TGH, +6t HP), charm (effect + t to one stat)
export const GEAR_BASES = {
  'digging-claw': { slot: 'tool', name: 'Digging Claw', stat: 'str', icon: 'ico-digging-claw' },
  sling: { slot: 'tool', name: 'Sling', stat: 'str', icon: 'ico-sling' },
  'walking-stick': { slot: 'tool', name: 'Walking Stick', stat: 'str', icon: 'ico-walking-stick' },
  quill: { slot: 'tool', name: 'Quill', stat: 'wit', icon: 'ico-quill' },
  'little-axe': { slot: 'tool', name: 'Little Axe', stat: 'str', icon: 'ico-little-axe' },
  lantern: { slot: 'tool', name: 'Lantern', stat: 'wit', icon: 'ico-lantern' },
  'pestle-tool': { slot: 'tool', name: 'Pestle', stat: 'wit', icon: 'ico-pestle' },
  'flint-pick': { slot: 'tool', name: 'Flint Pick', stat: 'str', icon: 'ico-flint-pick' },
  waistcoat: { slot: 'coat', name: 'Waistcoat', icon: 'ico-waistcoat' },
  'thimble-armour': { slot: 'coat', name: 'Thimble Armour', icon: 'ico-thimble-armour' },
  'moon-silk': { slot: 'coat', name: 'Moon-silk Coat', icon: 'ico-moon-silk-coat' },
  'mastodon-hide': { slot: 'coat', name: 'Mastodon-hide Coat', icon: 'ico-mastodon-coat' },
  'oilskin': { slot: 'coat', name: 'Oilskin', icon: 'ico-oilskin-coat' },
  'straw-vest': { slot: 'coat', name: 'Straw Vest', icon: 'ico-straw-vest' },
  'emerald-cloak': { slot: 'coat', name: 'Emerald Cloak', icon: 'ico-emerald-cloak' },
  'tin-vest': { slot: 'coat', name: 'Tin Vest', icon: 'ico-tin-vest' },
  'courage-ribbon': { slot: 'charm', name: 'Courage Ribbon', effect: 'noAfraid', stat: 'tgh', icon: 'ico-courage-ribbon', d: 'Prevents Afraid.' },
  'poppy-ward': { slot: 'charm', name: 'Poppy Ward', effect: 'noAsleep', stat: 'wit', icon: 'ico-poppy-ward', d: 'Prevents Asleep.' },
  'silver-bell': { slot: 'charm', name: 'Silver Bell', effect: 'first', stat: 'spd', icon: 'ico-silver-bell', d: 'Acts first in the first round.' },
  'motor-goggles': { slot: 'charm', name: 'Motor-goggles', effect: 'spd', stat: 'spd', icon: 'ico-motor-goggles', d: 'Speed up.' },
  'lucky-clover': { slot: 'charm', name: 'Clover Charm', effect: 'crit', stat: 'str', icon: 'ico-clover-charm', d: 'Crits more often.' },
  'calm-stone': { slot: 'charm', name: 'Pearl Pendant', effect: 'noHummed', stat: 'wit', icon: 'ico-pearl-pendant', d: 'Prevents Hummed.' },
  'acorn-cap': { slot: 'charm', name: 'Emerald Spectacles', effect: 'hp', stat: 'tgh', icon: 'ico-emerald-specs', d: 'More Heart.' },
  'glow-bead': { slot: 'charm', name: 'Star Amulet', effect: 'light', stat: 'wit', icon: 'ico-star-amulet', d: 'Light skills hit harder.' },
};
export const gearPrice = t => Math.round(30 * Math.pow(t, 1.7) / 5) * 5;
export const gearId = (base, t) => `${base}+${t}`;
export function gearInfo(id) {
  const [base, ts] = id.split('+'); const t = +ts; const b = GEAR_BASES[base]; if (!b) return null;
  const name = b.name + (t > 1 ? ' ' + ['', '', 'II', 'III', 'IV', 'V', 'VI'][t] : '');
  const bonus = { str: 0, wit: 0, tgh: 0, hp: 0, spd: 0 };
  if (b.slot === 'tool') bonus[b.stat] += 3 * t;
  if (b.slot === 'coat') { bonus.tgh += 2 * t; bonus.hp += 6 * t; }
  if (b.slot === 'charm') { bonus[b.stat] += t; if (b.effect === 'spd') bonus.spd += t; if (b.effect === 'hp') bonus.hp += 4 * t; }
  return { id, base, t, slot: b.slot, name, icon: b.icon, bonus, effect: b.effect, d: b.d, price: gearPrice(t) };
}
// Army gear: per squad kind, banner (Atk +15%/rank), mail (dmg taken -10%/rank), rations (HP +10%/rank)
export const ARMY_GEAR = { banner: { name: 'Banners', icon: 'ico-banner' }, mail: { name: 'Mail', icon: 'ico-mail' }, rations: { name: 'Rations', icon: 'ico-ration' } };
export const armyGearPrice = r => [0, 60, 150, 300][r];
