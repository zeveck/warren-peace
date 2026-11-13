// RTS 1: the Battle of Sorrel Down. Seven nodes on the home down; a step-by-step tutorial in prompts.
// Required: Bramble and Burdock's squads plus the River Bank and Wonderland recruits (not the Polite Dark:
// the Shallows may come after this battle). Listed in the order the default army picks them (cap 8).
export const REQUIRED_RTS1 = ['thimblebank-rabbits', 'thimblebank-diggers', 'hedgehogs', 'flamingos', 'otters', 'reformed-weasels', 'the-grin', 'heralds', 'carollers'];

const mine = (r, id) => r.S.squads.some(q => q.side === 'player' && (q.goal === id || q.at === id));
const since = (r, s) => r.t - r.prompt.shownAt > s;

export default {
  'c1-rts1': {
    name: 'The Battle of Sorrel Down', sub: 'Take back Thimblebank\'s warren mouth and hold it for 10 seconds.',
    // post-game revisit par times in seconds (tools/rts-par.mjs): Burdock's time to beat, and the medals
    medals: { burdock: 36.6, gold: 33, silver: 55, bronze: 80 },
    size: 28, cap: 8, world: 'downs', home: 'home', mouth: 'mouth', focus: 'ridge',
    required: REQUIRED_RTS1,
    nodes: [
      { id: 'home', kind: 'home', x: 3, y: 24, owner: 'player' },      // A: the Lookout Stone
      { id: 'ridge', kind: 'hilltop', x: 8, y: 16 },                   // S
      { id: 'clover', kind: 'clover', x: 14, y: 15 },                  // D
      { id: 'west', kind: 'plain', x: 8, y: 7 },                       // G: the hawthorn field
      { id: 'south', kind: 'plain', x: 17, y: 22 },                    // H: the old log
      { id: 'burrow', kind: 'burrow', x: 19, y: 10 },                  // J: the bolt-hole
      { id: 'mouth', kind: 'warren', x: 24, y: 4, owner: 'enemy' },    // K: Thimblebank's mouth
    ],
    paths: [
      ['home', 'ridge'], ['home', 'south'], ['ridge', 'clover'], ['ridge', 'west'], ['clover', 'south'],
      ['clover', 'burrow'], ['west', 'burrow'], ['west', 'mouth'], ['south', 'burrow'], ['burrow', 'mouth'],
    ],
    enemy: {
      tier: 1.0,
      guards: [
        { sq: 'raiders', node: 'clover' },
        { sq: 'raiders', node: 'west' },
        { sq: 'diggers', node: 'burrow' }, { sq: 'raiders', node: 'burrow' },
        { sq: 'diggers', node: 'mouth' }, { sq: 'diggers', node: 'mouth' }, { sq: 'lookouts', node: 'mouth' },
      ],
      waves: [
        { at: 60, sq: ['raiders'], route: ['burrow', 'clover', 'ridge', 'home'] },
        { at: 120, sq: ['raiders'], route: ['burrow', 'south', 'home'] },
        { at: 180, sq: ['raiders'], route: ['west', 'ridge', 'home'] },
      ],
    },
    // the tutorial, six tips, only two that pause: select, order + capture, the camera, the triangle + pausing, Reinforce,
    // then the warning before the first raider wave (the battle's clock waits for the first order)
    prompts: [
      { text: r => { const i = r.listSquads().findIndex(q => q.sq === 'thimblebank-rabbits'); return `Your army waits round the Lookout Stone (A). Click a squad, or press its number${i >= 0 && i < 10 ? ` (${(i + 1) % 10} is Bramble's)` : ''}, to select it. B selects them all.`; }, cond: r => r.sel.size > 0 || since(r, 15) },
      { text: 'Right-click the ridge, or press its letter S, to send them. A node is yours when only your squads stand on it a few seconds. Hilltops make squads tougher.', cond: r => mine(r, 'ridge') || since(r, 20) },
      { text: 'Arrow keys, the screen edge or the minimap (top right) move the view. C centres on your squad, V on home.', cond: r => since(r, 9) },
      { text: 'The triangle: Stout beats Swift, Swift beats Wing, Wing beats Stout. Their raiders are Swift (send Diggers or Hedgehogs); their diggers are Stout (send Flamingos). Space pauses, and orders still work while paused.', wait: true, when: r => r.S.squads.some(q => q.contact) || r.S.t > 25 },
      { text: 'Hurt squads: on a friendly node, out of the fight, press T to Reinforce (10 Supply). The clover (D) earns Supply.', cond: r => since(r, 12), when: r => r.S.squads.some(q => q.side === 'player' && q.hp < q.maxHp * 0.6) || r.S.t > 40 },
      { text: 'Raiders come out of their mouth every minute and go for your nodes: a horn and a red arrow will warn you. Keep a squad at home (A)! Take their mouth (K) and hold it 10 seconds to win.', wait: true, when: r => r.S.t > 52 },
    ],
  },
};
