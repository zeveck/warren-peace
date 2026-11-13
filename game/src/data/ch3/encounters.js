// Chapter 3 battles: Wheatsheaf (Hum-taken at 17, Barley 18), Oz (17 to 20, the Witch 21), the Stair of Eyes (20 to 21, the Watcher 22).
const BARLEY_HP = 1.43, BARLEY_STR = 1.15;   // boss fix (design/progress/bosses.md): 8-15 rounds; plain can't be made worse (it never Guards = his counter)
const hardy = k => es => { for (const e of es) e.maxHp = e.hp = Math.round(e.maxHp * k); };   // balance pass: Heart for 3-6 round fights at this depth
export const encounters = {
  // ---- Wheatsheaf (the cornfields, then the warren heart)
  'c3.hum-1': { enemies: [['raider', 18, 1], ['hum-digger', 18, 1], ['raider', 18]], bg: 'downs', tweak: hardy(1.15) },
  'c3.hum-2': { enemies: [['raider', 18, 1], ['raider', 18, 1], ['hum-lookout', 18, 1]], bg: 'downs', tweak: hardy(1.15) },
  'c3.hum-3': { enemies: [['hum-digger', 18, 1], ['hum-digger', 18, 1], ['hum-lookout', 18, 1]], bg: 'downs', tweak: hardy(1.15) },
  'c3.hum-4': { enemies: [['raider', 18, 2], ['hum-digger', 18, 1], ['hum-lookout', 18, 1], ['raider', 18, 1]], bg: 'warren' },
  'c3.barley': {
    enemies: [['barley', 19]], bg: 'warren', boss: true, music: 'm-boss',
    tweak(es) { for (const e of es) if (e.boss) { e.maxHp = e.hp = Math.round(e.maxHp * BARLEY_HP); e.str = Math.round(e.str * BARLEY_STR); } },   // boss fix (design/progress/bosses.md)
    intro: ['Barley stands in the middle of his empty hall, humming, head down like a bull in a furrow.', '"Plough... deeper..."'],
  },
  // ---- Oz: the road of yellow brick
  'c3.kalidah-1': { enemies: [['kalidah', 18, 1], ['kalidah', 18, 1], ['crow-west', 18, 1]], bg: 'oz-road' },
  'c3.kalidah-2': { enemies: [['kalidah', 18, 2], ['crow-west', 18, 1], ['crow-west', 18, 1]], bg: 'oz-road' },
  'c3.kalidah-3': { enemies: [['kalidah', 18, 1], ['kalidah', 18, 1], ['kalidah', 18, 1]], bg: 'oz-road' },
  // the Kalidah chase: hold them for four rounds, then the Tin Woodman's axe drops the bridge
  'c3.kalidah-chase': {
    enemies: [['kalidah', 19, 1], ['kalidah', 19, 1]], bg: 'oz-road', story: true, music: 'm-boss-whimsy',
    tweak(es) { for (const e of es) { e.maxHp = Math.round(e.maxHp * 3); e.hp = e.maxHp; } },
    intro: ['Two Kalidahs: bodies like bears, heads like tigers. They pad onto the tree-bridge.', 'The Tin Woodman is already chopping at the bridge\'s end. Hold them off!'],
    counter: (sim) => sim.result ? null : `The bridge creaks: ${Math.max(0, 5 - Math.max(1, sim.round))}`,
    onRound(sim) {
      const left = 5 - sim.round;
      if (left === 3 || left === 2 || left === 1) return [{ t: 'say', text: left === 1 ? 'CRACK! The bridge sags. One more chop!' : 'Chop... chop... The bridge creaks under the Kalidahs.' }];
      if (left <= 0) {
        for (const e of sim.enemies) if (!e.ko) { e.out = true; }
        sim.result = 'win';
        return [{ t: 'say', text: 'The Tin Woodman\'s axe bites through! The tree-bridge drops, and both Kalidahs tumble into the ditch, grumbling.' }];
      }
      return [];
    },
  },
  // the wildcat (a Wolf of the West's stats in a wildcat's coat): the Tin Woodman stands in its way
  'c3.wildcat': {
    enemies: [['wolf-west', 19, 2]], bg: 'oz-road', story: true,
    tweak(es) { const e = es[0]; e.sprite = 'wildcat'; e.name = 'The Wildcat'; e.maxHp = Math.round(e.maxHp * 2.2); e.hp = e.maxHp; },
    intro: ['The wildcat arches its back and spits. The little mouse hides behind your paws.'],
  },
  'c3.road-1': { enemies: [['crow-west', 18, 1], ['crow-west', 18, 1], ['kalidah', 18, 1], ['crow-west', 18]], bg: 'oz-road', tweak: hardy(1.25) },
  'c3.road-2': { enemies: [['wolf-west', 18, 1], ['wolf-west', 18, 1], ['crow-west', 18, 1]], bg: 'oz-road', tweak: hardy(1.25) },
  // ---- the Winkie Country (the Witch's wolves, crows and soldiers)
  'c3.wolves': { enemies: [['wolf-west', 19, 1], ['wolf-west', 19, 1], ['wolf-west', 19, 1], ['wolf-west', 19]], bg: 'winkie', tweak: hardy(1.25) },
  'c3.crows': { enemies: [['crow-west', 19, 1], ['crow-west', 19, 1], ['crow-west', 19, 1], ['crow-west', 19, 1]], bg: 'winkie', tweak: hardy(1.25) },
  'c3.winkies-1': { enemies: [['winkie-guard', 19, 1], ['winkie-guard', 19, 1], ['winkie-guard', 19]], bg: 'winkie', tweak: hardy(1.25) },
  'c3.winkies-2': { enemies: [['winkie-guard', 20, 1], ['wolf-west', 19, 1], ['crow-west', 19]], bg: 'winkie', tweak: hardy(1.25) },
  'c3.winkies-3': { enemies: [['winkie-guard', 20, 1], ['winkie-guard', 19, 1], ['winkie-guard', 19]], bg: 'winkie', tweak: hardy(1.25) },
  // the Wicked Witch of the West: she hides the pails behind her, and the friends run them back from the well one at a time
  'c3.witch': {
    enemies: [['wicked-witch', 21]], bg: 'winkie', boss: true, music: 'm-boss-whimsy',
    intro: ['"So! The little rabbit with the silver shoes." She shakes her umbrella.', 'She has a horror of water. And there are pails by the door...'],
    tweak(es) { const w = es[0]; w.maxHp = Math.round(w.maxHp * 4.4); w.hp = w.maxHp; },   // balance pass (was x2.2): the pails still take a third each
    counter: (sim) => sim.result ? null : `Pails ready: ${sim.items['water-pail'] || 0}`,
    onRound(sim) {
      const ms = sim.c3pails = sim.c3pails || { stash: null };
      if (ms.stash === null) {
        // the Witch kicks all but one pail behind her throne; the friends fetch them back from the well
        const n = sim.items['water-pail'] || 0;
        ms.stash = Math.max(0, n - 1); sim.items['water-pail'] = Math.min(1, n);
        return n > 1 ? [{ t: 'say', text: 'The Witch kicks the other pails away with a cackle! Only one is left in reach.' }] : [];
      }
      if (ms.stash > 0 && sim.round % 4 === 0) {
        ms.stash--; sim.items['water-pail'] = (sim.items['water-pail'] || 0) + 1;
        return [{ t: 'say', text: 'A Winkie, sent home happy, scurries back from the well with a brimming pail!' }];
      }
      return [];
    },
  },
  // ---- the Quadling Country (optional: the Hammer-Heads' hill)
  'c3.hammer-1': { enemies: [['hammer-head', 20, 1], ['hammer-head', 20, 1], ['hammer-head', 20]], bg: 'oz-road', tweak: hardy(1.1) },
  'c3.hammer-2': { enemies: [['hammer-head', 20, 2], ['hammer-head', 20, 1], ['hammer-head', 20, 1], ['hammer-head', 20]], bg: 'oz-road', tweak: hardy(0.9) },
  // ---- the Stair of Eyes
  'c3.stair-1': { enemies: [['late-footstep', 20, 1], ['shut-eye', 20, 1], ['late-footstep', 20, 1], ['shut-eye', 20]], bg: 'stair', tweak: hardy(0.9) },
  'c3.stair-2': { enemies: [['shut-eye', 21, 1], ['shut-eye', 21, 1], ['late-footstep', 21, 1], ['shut-eye', 20]], bg: 'stair', tweak: hardy(0.9) },
  'c3.stair-3': { enemies: [['late-footstep', 21, 2], ['late-footstep', 21, 1], ['shut-eye', 21, 1], ['shut-eye', 21, 1]], bg: 'stair', tweak: hardy(0.8) },
  'c3.watcher': {
    enemies: [['watcher', 22]], bg: 'stair', boss: true, music: 'm-boss-hum',
    tweak(es) { const w = es[0]; w.maxHp = Math.round(w.maxHp * 2.8); w.hp = w.maxHp; w.str = Math.round(w.str * 1.25); w.wit = Math.round(w.wit * 1.25); },   // balance pass (was HP x1.6)
    intro: ['At the bottom of the stair stands something tall and thin, made of shut eyes.', 'One of them opens. It looks at you. Hit the open eyes, or it will See you all.'],
  },
};
