// The Dream's three phases.
const hp = (k, a = 1) => en => { for (const e of en) if (e.boss) { e.maxHp = Math.round(e.maxHp * k); e.hp = e.maxHp; e.str = Math.round(e.str * a); e.wit = Math.round(e.wit * a); } };
const NF_HP = 2.4, NF_ATK = 1.25, NF_FEED = 0.3;   // Nightmare of Flintcomb: boss fix (design/progress/bosses.md)
export default {
  'c5.nightmare-deepdelve': { enemies: [['nightmare-deepdelve', 27], ['drift', 26], ['drift', 26]], bg: 'dream', boss: true, story: true, music: 'm-boss-hum', tweak: hp(1.9) },
  'c5.nightmare-flintcomb': { enemies: [['nightmare-flintcomb', 27], ['weight', 26], ['flicker', 26]], bg: 'dream', boss: true, story: true, music: 'm-boss-hum', tweak: hp(NF_HP, NF_ATK),
    // boss fix (design/progress/bosses.md): the counter is "Cure; Ninefold". A friend left Hummed for a whole round lets the
    // Hum take hold: the Nightmare grows stronger (STR/WIT +NF_FEED of base per friend, for the rest of the fight).
    onRound(sim) {
      const n = sim.enemies.find(e => e.id === 'nightmare-flintcomb' && !e.ko); if (!n) return [];
      const k = sim.party.filter(p => !p.ko && p.statuses.hummed === 1).length; if (!k) return [];
      n.ms.base = n.ms.base || { str: n.str, wit: n.wit }; n.ms.loud = (n.ms.loud || 0) + k;
      n.str = Math.round(n.ms.base.str * (1 + NF_FEED * n.ms.loud)); n.wit = Math.round(n.ms.base.wit * (1 + NF_FEED * n.ms.loud));
      if (n.ms.loudSaid) return [];
      n.ms.loudSaid = true; return [{ t: 'say', text: 'The Hum takes hold of your Hummed friends, and the Nightmare swells. (Cure them!)' }];
    } },
  'c5.undersleeper-eye': { enemies: [['undersleeper-eye', 27]], backdrop: 'boss-eye', boss: true, story: true, dream: true, music: 'm-dream' },
};
