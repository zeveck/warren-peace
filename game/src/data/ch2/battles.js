// Chapter 2 battles: the RPG encounters, the Moon Toad's shop, and the Battle of Silverdown (RTS 2).
const TANSY_HP = 1.87, TANSY_STR = 1.28, TANSY_SHIELD = true, TANSY_RECOIL = 0.06;
const ASTER_HP = 1.44, ASTER_ATK = 1, ASTER_FEED = 0.35;   // boss fix (design/progress/bosses.md)
const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export const encounters = {
  // ---- Silverdown (level 12): Hum-taken rabbits who keep pigeons
  'c2.sd-1': { enemies: [['raider', 12, 1], ['raider', 12], ['raider', 11]], bg: 'downs', tweak: hardy(1.2) },
  'c2.sd-2': { enemies: [['hum-digger', 12, 1], ['hum-lookout', 12], ['raider', 11]], bg: 'downs', tweak: hardy(1.2) },
  'c2.sd-3': { enemies: [['raider', 12, 1], ['hum-lookout', 12], ['hum-digger', 12]], bg: 'downs', tweak: hardy(1.2) },
  'c2.sd-4': { enemies: [['hum-digger', 12, 1], ['raider', 12, 1]], bg: 'downs', tweak: hardy(1.2) },
  'c2.sw-1': { enemies: [['hum-digger', 12, 1], ['hum-digger', 12], ['hum-lookout', 11]], bg: 'warren' },
  'c2.sw-2': { enemies: [['raider', 12, 1], ['hum-lookout', 12, 1], ['raider', 12]], bg: 'warren' },
  'c2.sw-3': { enemies: [['hum-digger', 12, 1], ['raider', 12], ['hum-lookout', 12], ['raider', 11]], bg: 'warren' },
  'c2.sw-4': { enemies: [['raider', 12, 2], ['raider', 12, 1], ['hum-lookout', 12]], bg: 'warren' },
  'c2.aster': { enemies: [['hum-lookout', 12, 1], ['aster', 13], ['hum-digger', 12, 1]], bg: 'warren', boss: true, music: 'm-boss',
    tweak(es) { for (const e of es) if (e.boss) { e.maxHp = e.hp = Math.round(e.maxHp * ASTER_HP); e.str = Math.round(e.str * ASTER_ATK); e.wit = Math.round(e.wit * ASTER_ATK); } },
    // boss fix: the Hum feeds on the Hummed. When a friend is left Hummed for a whole round, the Hum grows louder in Aster (her
    // Strength and Wits rise for the rest of the fight), so the counter (cure them at once: Spring-Cleaning) matters;
    // a party that ignores it faces a louder and louder Aster.
    onRound(sim) {
      const a = sim.enemies.find(e => e.id === 'aster' && !e.ko); if (!a) return [];
      const n = sim.party.filter(p => !p.ko && p.statuses.hummed === 1).length; if (!n) return [];   // still Hummed a whole round later: the Hum takes hold
      a.ms.base = a.ms.base || { str: a.str, wit: a.wit }; a.ms.loud = (a.ms.loud || 0) + n;
      a.str = Math.round(a.ms.base.str * (1 + ASTER_FEED * a.ms.loud)); a.wit = Math.round(a.ms.base.wit * (1 + ASTER_FEED * a.ms.loud));
      if (a.ms.loudSaid) return [];
      a.ms.loudSaid = true; return [{ t: 'say', text: 'The Hum grows louder in your Hummed friend... and in Aster. (Cure them, quickly!)' }];
    },
    intro: ['Aster turns. Her eyes are pale as the chalk.', '"Hush. Can you hear it? It wants us deeper. All of us."'] },
  // ---- Silverdown Depths (13)
  'c2.dp-1': { enemies: [['whisper', 13, 1], ['hum-digger', 13], ['whisper', 12]], bg: 'depths', tweak: hardy(1.15) },
  'c2.dp-2': { enemies: [['moving-carving', 13, 1], ['whisper', 13], ['whisper', 12]], bg: 'depths', tweak: hardy(1.15) },
  'c2.dp-3': { enemies: [['hum-digger', 13, 1], ['raider', 13, 1], ['hum-lookout', 13]], bg: 'depths', tweak: hardy(1.15) },
  // ---- the Moon (13 to 15)
  'c2.mn-1': { enemies: [['dust-hopper', 13, 1], ['dust-hopper', 13], ['dust-hopper', 13]], bg: 'moon', tweak: hardy(1.45) },
  'c2.mn-2': { enemies: [['lantern-moth', 13, 1], ['dust-hopper', 13, 1], ['lantern-moth', 13]], bg: 'moon', tweak: hardy(1.45) },
  'c2.mn-3': { enemies: [['lantern-moth', 14, 1], ['lantern-moth', 14], ['dust-hopper', 13, 1]], bg: 'moon', tweak: hardy(1.45) },
  'c2.mn-4': { enemies: [['dust-hopper', 14, 1], ['lantern-moth', 14, 1], ['dust-hopper', 14]], bg: 'moon', tweak: hardy(1.25) },
  'c2.mn-5': { enemies: [['dust-hopper', 14, 2], ['dust-hopper', 14, 1], ['lantern-moth', 14]], bg: 'moon', tweak: hardy(1.25) },
  'c2.mn-6': { enemies: [['lantern-moth', 14, 1], ['dust-hopper', 14, 1], ['lantern-moth', 14], ['dust-hopper', 14]], bg: 'moon', tweak: hardy(1.25) },
  'c2.mg-1': { enemies: [['lantern-moth', 15, 1], ['lantern-moth', 15], ['lantern-moth', 14]], bg: 'moon', tweak: hardy(1.25) },
  'c2.mg-2': { enemies: [['lantern-moth', 15, 1], ['dust-hopper', 15, 1], ['lantern-moth', 15]], bg: 'moon', tweak: hardy(1.25) },
  'c2.mg-3': { enemies: [['lantern-moth', 15, 2], ['lantern-moth', 15, 1], ['dust-hopper', 15]], bg: 'moon', tweak: hardy(1.25) },
  'c2.mg-4': { enemies: [['lantern-moth', 15, 1], ['lantern-moth', 15, 1], ['dust-hopper', 15], ['lantern-moth', 15]], bg: 'moon', tweak: hardy(1.25) },
  'c2.moth-queen': { enemies: [['lantern-moth', 14], ['moth-queen', 16], ['lantern-moth', 14]], bg: 'moon', boss: true, music: 'm-boss-whimsy',
    tweak(es) { for (const e of es) if (!e.boss) e.maxHp = e.hp = Math.round(e.maxHp / 1.3); else { e.maxHp = e.hp = Math.round(e.maxHp * 1.8); e.str = Math.round(e.str * 1.2); e.wit = Math.round(e.wit * 1.2); } },   // her moths keep the first draft's Heart; boss fix: she needs the counter (Light at her, keep a moth alive) to fall in time
    // the Moon Hares hold the grove's edge: after her first summons, no more moths can get through to her
    onRound(sim) {
      const q = sim.enemies.find(e => e.id === 'moth-queen'); if (!q || q.ko || !q.mech) return [];
      if (sim.enemies.filter(e => e.id === 'lantern-moth').length >= 4) { q.mech = null; return [{ t: 'say', text: 'The Moon Hares close round the grove. No more moths can reach her!' }]; }
      return [];
    },
    intro: ['The Moth Queen spreads her wings over the stolen pestle.', '"Mine. It glows. Everything that glows is MINE now. The humming says so."'] },
  // ---- the Drowned Halls (15 to 16)
  'c2.dr-1': { enemies: [['cold-ripple', 16, 1], ['cold-ripple', 16, 1], ['cold-ripple', 16]], bg: 'drowned' },
  'c2.dr-2': { enemies: [['drowned-eye', 16, 1], ['cold-ripple', 16, 1], ['drowned-eye', 16]], bg: 'drowned' },
  'c2.dr-3': { enemies: [['drowned-eye', 17, 1], ['cold-ripple', 16, 1], ['drowned-eye', 16, 1], ['cold-ripple', 16]], bg: 'drowned' },
  'c2.dr-4': { enemies: [['moving-carving', 17, 1], ['drowned-eye', 16, 1], ['moving-carving', 16, 1]], bg: 'drowned' },
  'c2.dr-5': { enemies: [['cold-ripple', 17, 2], ['drowned-eye', 17, 1], ['cold-ripple', 17, 1]], bg: 'drowned' },
  'c2.dr-6': { enemies: [['drowned-eye', 17, 1], ['cold-ripple', 17, 1], ['cold-ripple', 17, 1], ['drowned-eye', 17]], bg: 'drowned' },
  'c2.dr-7': { enemies: [['moving-carving', 17, 1], ['cold-ripple', 17, 1], ['drowned-eye', 17, 1]], bg: 'drowned' },
  'c2.tansy': { enemies: [['tansy-taken', 17]], bg: 'drowned', boss: true, story: true, music: 'm-boss-hum',
    tweak(es) { for (const e of es) { e.maxHp = e.hp = Math.round(e.hp * TANSY_HP); e.str = Math.round(e.str * TANSY_STR); } },   // boss fix (design/progress/bosses.md)
    // boss fix: the counter is "Shielded and Guard; Afraid on her". Every third round she crouches (ears flat, acts last,
    // once) and dashes through the whole party: Guard that round. Afraid, or facing a Shielded party, she loses her
    // second action. A party that only trades blows with her doesn't last.
    onRound(sim) {
      const t = sim.enemies.find(e => e.id === 'tansy-taken' && !e.ko); if (!t) return [];
      t.ms.moves0 = t.ms.moves0 || t.moves;
      if (!sim.tansyDash) {   // her dash into a braced (Guarding) rabbit: she tumbles (recoil per guard, and loses her next action)
        sim.tansyDash = true; const move = sim.enemyMove.bind(sim);
        sim.enemyMove = (e, mv, ev, f) => {
          const braced = mv === 'race-you-tansy' ? sim.alive('party').filter(p => p.guard) : [];
          move(e, mv, ev, f);
          if (!braced.length || e.ko) return;
          const dmg = Math.round(e.maxHp * TANSY_RECOIL * braced.length);
          ev.push({ t: 'say', text: braced.length > 1 ? 'She runs smack into the braced rabbits and tumbles head over heels!' : 'She runs smack into a braced rabbit and tumbles!' });
          ev.push({ t: 'hit', u: braced[0].uid, tg: e.uid, dmg, name: 'Tumble' }); sim.applyDamage(e, dmg, ev, braced[0]);
          if (!e.ko) e.statuses.stun = 1;
        };
      }
      if (sim.round % 3 === 0) {
        t.ms.strike = true; t.ms.last = true; t.mech = null; t.moves = ['race-you-tansy'];
        return [{ t: 'charge', u: t.uid, text: 'Tansy crouches low, ears flat, and stops humming. (Guard!)' }];
      }
      t.ms.strike = false; t.ms.last = false; t.moves = t.ms.moves0;
      const was = t.mech; t.mech = t.statuses.afraid || (TANSY_SHIELD && sim.party.filter(p => !p.ko).every(p => p.buffs.shielded)) ? null : 'two-actions';
      return t.mech === null && was ? [{ t: 'say', text: 'Tansy flinches and glances behind her. She\'s slower now!' }] : [];
    },
    intro: ['Tansy doesn\'t look up. Her paws keep digging. She hums.', '"Go away. I\'m busy. It\'s down here somewhere... it wants me to find it."'] },
  'c2.tidewarden': { enemies: [['tidewarden', 18]], backdrop: 'boss-tidewarden', boss: true, music: 'm-boss-hum',
    tweak(es) { for (const e of es) { e.maxHp = e.hp = Math.round(e.hp * 0.75); e.str = Math.round(e.str * 2.1); e.wit = Math.round(e.wit * 1.6); } },   // boss fix (design/progress/bosses.md): HP x0.6 -> x0.75, guard the Tide or lose
    // when it sinks, the water it pushes aside comes up as a Cold Ripple (so there's always something to face)
    onRound(sim) {
      const t = sim.enemies.find(e => e.id === 'tidewarden' && !e.ko);
      if (!t || !t.ms.submerged || sim.enemies.some(e => e !== t && !e.ko && e.hp >= 110)) return [];
      const u = sim.summon('cold-ripple', t.lvl - 2);
      u.maxHp = u.hp = Math.round(u.hp * 2.2);   // a big swell of water: it outlasts the round the Tidewarden is under
      return [{ t: 'summon', us: [u.uid], say: 'The black water heaves, and a Cold Ripple slides up out of the pool!' }];
    },
    intro: ['The black water bulges. A ring of pale eyes opens under the surface.', 'The Tidewarden rises: a shape too big to see all at once.'] },
};

export const shops = {
  'c2.moon-toad': { name: 'The Moon Toad\'s Pearl Stall', keeper: 'moon-toad', line: 'Pearls, please! Three legs, one counter, no refunds. Croak.',
    gear: ['pestle-tool+3', 'lantern+3', 'walking-stick+3', 'digging-claw+3', 'moon-silk+3', 'waistcoat+3', 'calm-stone+3', 'glow-bead+3', 'courage-ribbon+3'],
    items: ['mooncake', 'dandelion', 'carrot-cake', 'pluck-berry', 'jade-elixir', 'courage-biscuit'], army: 2 },
};

// RTS 2: a chalk ridge across the middle, two flanks round it, the dovecotes and the warren mouth at the top.
const ridgeH = [];
for (let y = 0; y < 28; y++) { let r = ''; for (let x = 0; x < 28; x++) { const d = Math.abs((x - 13) + (y - 13)); const along = Math.abs((x - 13) - (y - 13)); r += d <= 1 && along < 14 ? '2' : d <= 3 && along < 16 ? '1' : '0'; } ridgeH.push(r); }
export const rts = {
  'c2-rts2': {
    name: 'The Battle of Silverdown', sub: 'Over the chalk ridge, past the dovecotes: take Silverdown\'s warren mouth and hold it for 10 seconds.',
    // post-game revisit par times in seconds (tools/rts-par.mjs): Burdock's time to beat, and the medals
    medals: { burdock: 33.2, gold: 30.5, silver: 55, bronze: 85 },
    size: 28, cap: 9, world: 'silver', groundKind: 'grass', pathKind: 'chalk', heights: ridgeH, home: 'home', mouth: 'mouth', focus: 'clover',
    required: ['thimblebank-rabbits', 'thimblebank-diggers', 'otters', 'hedgehogs', 'reformed-weasels', 'flamingos', 'heralds', 'polite-dark', 'cherts-band'],
    nodes: [
      { id: 'home', kind: 'home', x: 4, y: 24, owner: 'player' },
      { id: 'clover', kind: 'clover', x: 9, y: 20 },
      { id: 'west', kind: 'plain', x: 4, y: 12 },
      { id: 'east', kind: 'plain', x: 16, y: 23 },
      { id: 'ridge', kind: 'hilltop', x: 13, y: 13 },
      { id: 'burrow', kind: 'burrow', x: 9, y: 5 },
      { id: 'cotes', kind: 'plain', x: 22, y: 14 },
      { id: 'mouth', kind: 'warren', x: 22, y: 5, owner: 'enemy' },
    ],
    paths: [['home', 'clover'], ['home', 'west'], ['home', 'east'], ['clover', 'ridge'], ['west', 'burrow'], ['west', 'ridge'], ['east', 'ridge'], ['east', 'cotes'],
      ['ridge', 'burrow'], ['ridge', 'cotes'], ['burrow', 'mouth'], ['cotes', 'mouth']],
    enemy: {
      tier: 1.0,
      // combined arms on every node: a Stout-heavy army gets dived on, a Swift-heavy one gets walled
      guards: [{ sq: 'diggers', node: 'ridge' }, { sq: 'pigeon-riders', node: 'ridge' }, { sq: 'raiders', node: 'cotes' }, { sq: 'pigeon-riders', node: 'cotes' },
        { sq: 'raiders', node: 'burrow' }, { sq: 'lookouts', node: 'burrow' }, { sq: 'diggers', node: 'mouth' }, { sq: 'raiders', node: 'mouth' }, { sq: 'pigeon-riders', node: 'mouth' }],
      // a Pigeon Rider wave off the dovecotes every 60 s, over the ridge at your clover and home
      every: 60, sq: ['pigeon-riders'], route: ['ridge', 'clover', 'home'],
    },
  },
};
