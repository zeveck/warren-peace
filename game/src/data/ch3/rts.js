// RTS 3: the Battle of Wheatsheaf. Nine nodes in the cornfields; corn hides squads (cover). Rally and Moonlight.
export const REQUIRED_RTS3 = [
  // the squads of chapters 1 and 2's required recruits (the default army takes the first ten that are owned)
  'thimblebank-diggers', 'hedgehogs', 'flamingos', 'silverdown-rabbits', 'moon-hares', 'tansys-scouts', 'thimblebank-rabbits',
  'otters', 'polite-dark', 'cherts-band', 'reformed-weasels', 'the-grin', 'carollers', 'heralds',
];
export const rts = {
  'c3-rts3': {
    name: 'The Battle of Wheatsheaf', sub: 'Take Wheatsheaf\'s warren mouth in the cornfields and hold it for 10 seconds. The corn hides squads.',
    music: 'm-army2',   // the late, larger battles get the bigger march
    // post-game revisit par times in seconds (tools/rts-par.mjs): Burdock's time to beat, and the medals
    medals: { burdock: 41.2, gold: 37.5, silver: 90, bronze: 135 },
    size: 28, cap: 10, world: 'corn', groundKind: 'grass', pathKind: 'path', home: 'home', mouth: 'mouth', focus: 'stooks',
    required: REQUIRED_RTS3,
    nodes: [
      { id: 'home', kind: 'home', x: 24, y: 24, owner: 'player' },
      { id: 'stooks', kind: 'plain', x: 18, y: 21 },
      { id: 'lane', kind: 'clover', x: 22, y: 15 },
      { id: 'mill', kind: 'hilltop', x: 14, y: 16 },
      { id: 'pond', kind: 'clover', x: 9, y: 22 },
      { id: 'barn', kind: 'burrow', x: 18, y: 9 },
      { id: 'cart', kind: 'plain', x: 8, y: 12 },
      { id: 'scarecrow', kind: 'plain', x: 13, y: 6 },
      { id: 'mouth', kind: 'warren', x: 4, y: 4, owner: 'enemy' },
    ],
    paths: [
      ['home', 'stooks'], ['home', 'lane'], ['stooks', 'mill'], ['stooks', 'pond'], ['lane', 'mill'], ['lane', 'barn'],
      ['mill', 'cart'], ['mill', 'barn'], ['pond', 'cart'], ['barn', 'scarecrow'], ['cart', 'mouth'], ['scarecrow', 'mouth'], ['cart', 'scarecrow'],
    ],
    cover: { stooks: true, pond: true, cart: true, scarecrow: true },
    coverPaths: [['stooks', 'pond'], ['pond', 'cart'], ['cart', 'mouth'], ['barn', 'scarecrow'], ['scarecrow', 'mouth'], ['stooks', 'mill']],
    enemy: {
      tier: 1.35,
      guards: [
        { sq: 'diggers', node: 'mill' }, { sq: 'raiders', node: 'mill' },
        { sq: 'lookouts', node: 'barn' },
        { sq: 'diggers', node: 'cart' }, { sq: 'raiders', node: 'cart' },
        { sq: 'diggers', node: 'mouth' }, { sq: 'lookouts', node: 'mouth' },
      ],
      waves: [
        { at: 60, sq: ['raiders', 'rooks'], route: ['scarecrow', 'barn', 'lane', 'home'] },
        { at: 120, sq: ['raiders', 'rooks'], route: ['cart', 'pond', 'stooks', 'home'] },
        { at: 180, sq: ['rooks'], route: ['scarecrow', 'barn', 'mill', 'stooks', 'home'] },
      ],
    },
  },
};
