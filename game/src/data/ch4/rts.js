// RTS 4: The Battle of Flintcomb. The hardest army battle: a white flint quarry pocked with burrows,
// the warren mouth fortified and reached by two paths and a burrow tunnel; hold the mouth AND the lip.
export const RTS = {
  'c4-rts4': {
    name: 'The Battle of Flintcomb',
    sub: 'Take Flintcomb\'s warren mouth and the quarry lip, and hold both together for 10 seconds.',
    music: 'm-army2',   // the late, larger battles get the bigger march
    // post-game revisit par times in seconds (tools/rts-par.mjs): Burdock's time to beat, and the medals
    medals: { burdock: 65.4, gold: 59, silver: 100, bronze: 150 },
    size: 32, cap: 10, world: 'flint', home: 'home', mouth: 'mouth',
    hold: ['mouth', 'lip'],
    required: ['winkies', 'emerald-guard', 'lions-beasts', 'field-mice', 'winged-monkeys', 'pips-kits', 'wheatsheaf-rabbits', 'flamingos', 'thimblebank-diggers', 'tansys-scouts'],
    nodes: [
      { id: 'home', kind: 'home', x: 3, y: 28, owner: 'player' },
      { id: 'clover-w', kind: 'clover', x: 4, y: 18 },
      { id: 'spoil', kind: 'hilltop', x: 11, y: 22 },
      { id: 'clover-s', kind: 'clover', x: 14, y: 28 },
      { id: 'burrow-w', kind: 'burrow', x: 10, y: 12 },
      { id: 'floor', kind: 'plain', x: 17, y: 17 },
      { id: 'cut', kind: 'plain', x: 24, y: 24 },
      { id: 'lip', kind: 'hilltop', x: 22, y: 12 },
      { id: 'burrow-e', kind: 'burrow', x: 16, y: 6 },
      { id: 'mouth', kind: 'fortified', x: 27, y: 5, owner: 'enemy' },
    ],
    paths: [
      ['home', 'clover-w'], ['home', 'spoil'], ['home', 'clover-s'],
      ['clover-w', 'burrow-w'], ['clover-w', 'spoil'], ['spoil', 'floor'], ['clover-s', 'cut'], ['spoil', 'clover-s'],
      ['burrow-w', 'floor'], ['burrow-w', 'burrow-e'], ['floor', 'lip'], ['floor', 'cut'],
      ['cut', 'mouth', 22],          // the east path round the quarry rim
      ['lip', 'mouth'],              // the north path along the lip
      ['burrow-e', 'mouth', 8],      // the burrow tunnel
    ],
    enemy: {
      tier: 1.3,
      guards: [
        { sq: 'quarrymen', node: 'mouth' }, { sq: 'quarrymen', node: 'mouth' },
        { sq: 'quarrymen', node: 'lip' }, { sq: 'quarrymen', node: 'lip' },
        { sq: 'quarrymen', node: 'mouth' }, { sq: 'diggers', node: 'burrow-e' },
      ],
      waves: [
        { at: 45, sq: ['raiders', 'raiders'], route: ['lip', 'floor', 'spoil', 'home'] },
        { at: 90, sq: ['pigeon-riders', 'raiders'], route: ['cut', 'clover-s', 'home'] },
        { at: 135, sq: ['rooks', 'raiders'], route: ['lip', 'floor', 'spoil', 'home'] },
        { at: 180, sq: ['pigeon-riders', 'diggers'], route: ['cut', 'clover-s', 'home'] },
      ],
    },
  },
};
