// Wonderland and Shallows battles.
const QHP = 0.41, QSTR = 1.1, CHP = 0.42;   // Queen: boss fix (design/progress/bosses.md): tuned at the real arrival state (no rest stone in Wonderland); Choir: balance pass
const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export default {
  // Wonderland (levels 7 to 10)
  'c1w.teapots-1': { enemies: [['flying-teapot', 8, 0], ['flying-teapot', 8, 0], ['flying-teapot', 8, 1]], bg: 'wonder-hall' },
  'c1w.cards-1': { enemies: [['card-soldier', 8, 0], ['card-soldier', 8, 0], ['flying-teapot', 8, 0]], bg: 'wonder-garden' },
  'c1w.mixed-1': { enemies: [['card-soldier', 8, 1], ['flying-teapot', 8, 0], ['pepper-cloud', 8, 0]], bg: 'wonder-hall' },
  'c1w.pepper-1': { enemies: [['pepper-cloud', 9, 0], ['pepper-cloud', 9, 0], ['flying-teapot', 9, 1]], bg: 'wonder-hall', tweak: hardy(1.25) },
  'c1w.wood-1': { enemies: [['flying-teapot', 9, 0], ['pepper-cloud', 9, 0], ['card-soldier', 9, 0]], bg: 'mushroom' },
  'c1w.wood-2': { enemies: [['card-soldier', 9, 1], ['flying-teapot', 9, 0], ['pepper-cloud', 9, 0]], bg: 'mushroom' },
  'c1w.tea-1': { enemies: [['flying-teapot', 9, 0], ['flying-teapot', 9, 1], ['flying-teapot', 9, 1]], bg: 'wonder-garden' },
  'c1w.cards-2': { enemies: [['card-soldier', 10, 0], ['card-soldier', 9, 0], ['card-soldier', 9, 0]], bg: 'wonder-garden' },
  'c1w.cards-3': { enemies: [['card-soldier', 10, 1], ['flying-teapot', 10, 0], ['card-soldier', 9, 1]], bg: 'wonder-garden' },
  'c1w.croquet': { enemies: [['queen-of-hearts', 11], ['knave', 9], ['card-soldier', 8, 0]], bg: 'wonder-garden', boss: true, music: 'm-boss-whimsy',
    tweak: (es) => { for (const e of es) if (e.id === 'queen-of-hearts') { e.maxHp = e.hp = Math.round(e.maxHp * QHP); e.str = Math.round(e.str * QSTR); } },
    intro: ['"Get to your places!" shouts the Queen, in a voice of thunder.', 'The flamingos tuck their heads in. The hedgehogs uncurl and run.', '"You play croquet against ME. Begin!"'] },
  // The Shallows (levels 10 to 11)
  'c1w.whispers-1': { enemies: [['whisper', 10, 0], ['whisper', 10, 0], ['whisper', 10, 1]], bg: 'shallows' },
  'c1w.carving-1': { enemies: [['moving-carving', 10, 1], ['whisper', 10, 0], ['whisper', 10, 0]], bg: 'shallows' },
  'c1w.whispers-2': { enemies: [['whisper', 11, 1], ['whisper', 10, 0], ['whisper', 10, 0], ['whisper', 10, 0]], bg: 'shallows' },
  'c1w.carving-2': { enemies: [['moving-carving', 11, 1], ['moving-carving', 10, 0], ['whisper', 11, 1]], bg: 'shallows' },
  'c1w.choir': { enemies: [['choir', 12], ['choir', 12], ['choir', 12], ['moving-carving', 11, 1]], bg: 'shallows', boss: true, music: 'm-boss-hum',
    tweak: (es) => { for (const e of es) if (e.id === 'choir') { e.maxHp = e.hp = Math.round(e.maxHp * CHP); e.wit = Math.round(e.wit * 2.4); e.xp = Math.round(e.xp / 3); } },   // wit: an unsilenced line hurts even when Ninefold stops the Afraid; three mouths share one boss's XP
    intro: ['Three stone mouths open in the wall, one after another.', 'They breathe in. The dark leans closer to listen.', '"Brammmble," they say, all together, very softly.'] },
};
