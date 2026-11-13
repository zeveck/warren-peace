// Chapter 1 battles: Thimblebank Depths (3 to 5, always fleeable), the River Bank (5 to 8), the Chief Weasel (9),
// and Chert's band in the Great Burrow (11).
// xp: a bonus per Depths fight (the first lessons). Very easy for Bramble + Burdock: Heart x0.87 (x0.65 of the template
// with the ordinary-fight x0.75), attack x0.6 so hits are ~10% of max Heart and a wind-up ~20% (fights.md)
const D = { bg: 'depths', flee: 'always', xp: 60, tweak: es => { for (const e of es) { e.maxHp = e.hp = Math.round(e.maxHp * 0.87); e.str = Math.round(e.str * 0.6); e.wit = Math.round(e.wit * 0.6); } } };
const CHIEF_HP = 0.65, CHIEF_STR = 1.25;   // balance pass: ~11 rounds with the counter (hit-all on the summons, focus the Chief)
const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export default {
  // ---- Thimblebank Depths: very easy, teaching skills, Guard and items
  'c1.d-worm': { ...D, enemies: [['dazed-earthworm', 3, 0]], first: true,
    intro: ['A dazed earthworm, as long as a rabbit and twice as confused, wriggles into the way.', 'Burdock: "Try a skill. Thump costs Pluck, but it lands."'] },
  'c1.d-worms': { ...D, enemies: [['dazed-earthworm', 3, 0], ['dazed-earthworm', 3, 0]] },
  'c1.d-beetles': { ...D, enemies: [['burrowing-beetle', 4, 0], ['burrowing-beetle', 3, 0]],
    intro: ['Two burrowing beetles click their jaws. Quick little things.', 'Burdock: "If they nip hard, Guard. It halves the hurt and gets your Pluck back."'] },
  'c1.d-tangler': { ...D, enemies: [['root-tangler', 4, 0], ['dazed-earthworm', 4, 0]] },
  'c1.d-mixed': { ...D, enemies: [['burrowing-beetle', 4, 0], ['dazed-earthworm', 4, 0]] },
  'c1.d-tanglers': { ...D, enemies: [['root-tangler', 5, 0], ['root-tangler', 4, 0]],
    intro: ['Two old roots heave themselves out of the steps, creaking, grumpy at being trodden on for a hundred years.'] },

  // ---- the River Bank in summer (5 to 6)
  'c1.rb-weasels': { bg: 'riverbank', enemies: [['weasel', 5, 0], ['weasel', 5, 0]], intro: ['"Oi! Rabbits! This is our bank now!"'] },
  'c1.rb-stoat': { bg: 'riverbank', enemies: [['stoat', 5, 0], ['weasel', 5, 0]] },
  'c1.rb-ferret': { bg: 'riverbank', enemies: [['ferret-sentry', 6, 0], ['weasel', 5, 0], ['stoat', 5, 0]] },
  'c1.rb-north': { bg: 'riverbank', enemies: [['stoat', 6, 0], ['ferret-sentry', 5, 0], ['weasel', 6, 0]] },
  // ---- the Wild Wood in snow (6 to 7): snappish, cold, a little Hum-touched
  'c1.ww-1': { bg: 'wildwood', enemies: [['weasel', 6, 0], ['weasel', 6, 1], ['stoat', 6, 0]], intro: ['The weasel\'s eyes have a faint blue shine. "Cold," it hisses. "Cold, cold, go away."'] },
  'c1.ww-2': { bg: 'wildwood', enemies: [['ferret-sentry', 6, 0], ['stoat', 6, 1]] },
  'c1.ww-3': { bg: 'wildwood', enemies: [['stoat', 7, 0], ['weasel', 6, 1], ['ferret-sentry', 6, 0]] },
  'c1.ww-4': { bg: 'wildwood', enemies: [['weasel', 6, 0], ['ferret-sentry', 6, 1], ['weasel', 6, 0]] },
  'c1.ww-5': { bg: 'wildwood', enemies: [['stoat', 7, 0], ['stoat', 6, 1]] },
  // ---- the buried city and the road (7 to 8)
  'c1.bc-1': { bg: 'warren', enemies: [['stoat', 7, 0], ['weasel', 7, 1]], tweak: hardy(1.3), intro: ['Weasel scouts, sneaking through the old city toward Badger\'s larder!'] },
  'c1.bc-2': { bg: 'warren', enemies: [['ferret-sentry', 7, 0], ['weasel', 7, 0], ['stoat', 7, 0]], tweak: hardy(1.3) },
  'c1.rd-1': { bg: 'riverbank', enemies: [['weasel', 7, 0], ['weasel', 7, 0], ['ferret-sentry', 7, 0]], tweak: hardy(1.3) },
  'c1.rd-2': { bg: 'riverbank', enemies: [['ferret-sentry', 8, 0], ['stoat', 7, 1]], tweak: hardy(1.3) },
  // ---- Toad Hall (8)
  'c1.th-1': { bg: 'riverbank', enemies: [['weasel', 8, 0], ['weasel', 8, 1]], tweak: hardy(1.3), intro: ['A weasel with a drumstick in each paw. "Intruders! In the pantry!"'] },
  'c1.th-2': { bg: 'riverbank', enemies: [['stoat', 8, 0], ['ferret-sentry', 8, 0], ['weasel', 8, 0]], tweak: hardy(1.3) },
  // ---- the boss: the Chief Weasel at the banquet (9). Calls a weasel every 3 rounds.
  'c1.chief-weasel': { bg: 'riverbank', boss: true, music: 'm-boss', enemies: [['chief-weasel', 8], ['weasel', 7, 0]],
    tweak: (es) => { for (const e of es) if (e.id === 'chief-weasel') { e.maxHp = e.hp = Math.round(e.maxHp * CHIEF_HP); e.str = Math.round(e.str * CHIEF_STR); } },
    intro: ['The Chief Weasel stands up on Toad\'s chair and brandishes a chicken leg.', '"Lads! Weasels of the Wild Wood! At \'em!"'] },

  // ---- the Great Burrow after RTS 1: Chert's band (11, a normal fight that wakes them)
  'c1.great-burrow': { bg: 'warren', story: true, enemies: [['raider', 11, 1], ['hum-digger', 11, 0], ['hum-lookout', 11, 0]],
    intro: ['The last raiders turn as one, pale eyes catching the light. The humming fills the Burrow.', 'Wake them gently. Knock down the Hum.'],
    tweak: (es) => { const c = es.find(e => e.id === 'raider'); if (c) { c.sprite = 'chert'; c.name = 'Chert, Hum-taken'; } } },
};
