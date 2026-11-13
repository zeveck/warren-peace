// Enemy templates (level-1 stats), the 31 regular enemy types, and bosses.
// Template Heart is 1.3x the first draft (36/26/24/30/24/30) so normal fights last 3-6 rounds; bosses use hpMult 6.2
// (= the design's x8 of the old Heart; Hollow Rabbits 1.54 = x2). Balance pass, see design/progress/balance.md.
// bar: 'hum' (Hum-taken: woken at zero), 'shadow' (depth creatures: fade), 'heart' (storybook foes: sent packing)
// moves: what the foe does in a boss's fight (as before); normalMoves + threat: in ordinary fights (no boss), where every
// template shows one readable threat: brute / quick / flyer / caster a telegraphed wind-up (MOVES big-swing, pounce,
// dive-bomb, spark-storm), swarm Smother (Asleep), eerie Whisper (Afraid). design/progress/fights.md
export const TEMPLATES = {
  brute: { hp: 47, str: 9, tgh: 8, spd: 5, wit: 4, moves: ['bash', 'bash', 'smash'], normalMoves: ['bash'],
    threat: { kind: 'windup', aim: 'random', move: 'big-swing', say: 'The {e} rears back, glaring at {t}... (Guard!)' } },
  quick: { hp: 34, str: 8, tgh: 5, spd: 12, wit: 5, moves: ['nip', 'flurry'],
    threat: { kind: 'windup', aim: 'weakest', move: 'pounce', say: 'The {e} crouches low, eyes on {t}... (Guard!)' } },
  caster: { hp: 31, str: 5, tgh: 5, spd: 8, wit: 10, moves: ['spark', 'spark', 'jinx'], normalMoves: ['zap'],
    threat: { kind: 'windup', aim: 'all', move: 'spark-storm', say: 'The {e} gathers a crackling charge over everyone... (Guard!)' } },
  swarm: { hp: 39, str: 6, tgh: 4, spd: 9, wit: 4, moves: ['swarm'], normalMoves: ['swarm-bite', 'swarm-bite', 'smother'] },
  flyer: { hp: 31, str: 8, tgh: 4, spd: 13, wit: 5, moves: ['dive', 'nip'], normalMoves: ['swoop', 'nip'], flying: true,
    threat: { kind: 'windup', aim: 'random', move: 'dive-bomb', say: 'The {e} climbs high above {t}... (Guard!)' } },
  eerie: { hp: 39, str: 6, tgh: 6, spd: 7, wit: 10, moves: ['whisper', 'chill', 'chill'], normalMoves: ['dread-whisper', 'chill', 'chill'], eerie: true },
};
// Ordinary fights (no boss in the fight): enemy Heart and attack scaled from the templates so fights are short and
// sharp (3-4 rounds, hits that make Guard, skills and items matter). Boss fights (and their minions) don't use it.
// design/progress/fights.md
export const NORMAL_FIGHT = { hp: 0.75, str: 1.15, wit: 1.15, tgh: 0.5 };
// Enemy moves: pw power, st stat, t target, status/chance, hits
export const MOVES = {
  bash: { name: 'Bash', pw: 1.1, st: 'str', t: 'one' },
  // wind-up blows (template threats; telegraphed the turn before, never miss, never crit)
  'big-swing': { name: 'Big Swing', pw: 1.75, st: 'str', t: 'one' },
  pounce: { name: 'Pounce', pw: 1.7, st: 'str', t: 'one' },
  'spark-storm': { name: 'Spark Storm', pw: 1.05, st: 'wit', t: 'all' },
  'dive-bomb': { name: 'Dive Bomb', pw: 1.7, st: 'str', t: 'one' },
  smother: { name: 'Smother', pw: 0.8, st: 'str', t: 'one', status: 'asleep', chance: 0.6 },
  'swarm-bite': { name: 'Swarm', pw: 0.95, hits: 2, st: 'str', t: 'one' },
  zap: { name: 'Spark', pw: 0.95, st: 'wit', t: 'one' },
  smash: { name: 'Smash', pw: 1.5, st: 'str', t: 'one' },
  nip: { name: 'Nip', pw: 1.0, st: 'str', t: 'one' },
  flurry: { name: 'Flurry', pw: 0.65, hits: 2, st: 'str', t: 'one' },
  spark: { name: 'Spark', pw: 1.2, st: 'wit', t: 'one' },
  jinx: { name: 'Jinx', pw: 0.7, st: 'wit', t: 'all' },
  swarm: { name: 'Swarm', pw: 0.6, hits: 2, st: 'str', t: 'one' },
  dive: { name: 'Dive', pw: 1.3, st: 'str', t: 'one' },
  swoop: { name: 'Dive', pw: 1.15, st: 'str', t: 'one' },
  whisper: { name: 'Whisper', pw: 0.5, st: 'wit', t: 'one', status: 'afraid', chance: 0.5 },
  'dread-whisper': { name: 'Whisper', pw: 0.5, st: 'wit', t: 'one', status: 'afraid', chance: 0.75 },   // ordinary fights: the Eerie's threat
  chill: { name: 'Chill', pw: 1.1, st: 'wit', t: 'one' },
  sneeze: { name: 'Pepper Sneeze', pw: 0.6, st: 'wit', t: 'one', status: 'stun', chance: 0.5 },
  hum: { name: 'Hum', pw: 0.5, st: 'wit', t: 'one', status: 'hummed', chance: 0.5 },
  rally: { name: 'Lookout\'s Call', t: 'allies', buff: 'spd' },
  headbutt: { name: 'Head Shot', pw: 1.3, st: 'str', t: 'one' },
  'head-shot': { name: 'Head Shot', pw: 1.15, st: 'str', t: 'one' },
  'race-you-tansy': { name: 'Race You!', pw: 3.0, st: 'str', t: 'all' },   // Tansy's wound-up dash (c2.tansy, every third round: Guard it)
};
// Enemy types. tpl = template, bar, sprite (defaults to id), tags, extra moves, tint (code tint for shared sprites)
export const ENEMIES = {
  'root-tangler': { name: 'Root-tangler', tpl: 'brute', bar: 'heart' },
  'dazed-earthworm': { name: 'Dazed Earthworm', tpl: 'swarm', bar: 'heart' },
  'burrowing-beetle': { name: 'Burrowing Beetle', tpl: 'quick', bar: 'heart' },
  weasel: { name: 'Weasel', tpl: 'quick', bar: 'heart' },
  stoat: { name: 'Stoat', tpl: 'brute', bar: 'heart' },
  'ferret-sentry': { name: 'Ferret Sentry', tpl: 'caster', bar: 'heart' },
  'card-soldier': { name: 'Card Soldier', tpl: 'brute', bar: 'heart' },
  'pepper-cloud': { name: 'Pepper Cloud', tpl: 'caster', bar: 'heart', moves: ['sneeze', 'spark'], threat: null },   // threat: Pepper Sneeze (Stunned)
  'flying-teapot': { name: 'Flying Teapot', tpl: 'flyer', bar: 'heart' },
  whisper: { name: 'Whisper', tpl: 'eerie', bar: 'shadow' },
  'moving-carving': { name: 'Carving that Moves', tpl: 'eerie', bar: 'shadow', mult: { hp: 1.2, str: 1.3, tgh: 1.3 }, moves: ['bash', 'whisper'], normalMoves: ['bash', 'bash'],
    threat: { kind: 'windup', aim: 'random', move: 'big-swing', say: 'The {e} slowly turns its stone head toward {t}... (Guard!)' } },
  raider: { name: 'Hum-taken Raider', tpl: 'quick', bar: 'hum', hum: true, moves: ['nip', 'flurry', 'hum'] },
  'hum-digger': { name: 'Hum-taken Digger', tpl: 'brute', bar: 'hum', hum: true, moves: ['bash', 'smash', 'hum'], normalMoves: ['bash', 'hum'] },
  'hum-lookout': { name: 'Hum-taken Lookout', tpl: 'caster', bar: 'hum', hum: true, moves: ['rally', 'spark', 'hum'] },
  'lantern-moth': { name: 'Lantern Moth', tpl: 'flyer', bar: 'heart' },
  'dust-hopper': { name: 'Dust Hopper', tpl: 'quick', bar: 'heart' },
  'drowned-eye': { name: 'Drowned Eye', tpl: 'eerie', bar: 'shadow', mult: { wit: 1.2 }, moves: ['spark', 'whisper'], normalMoves: ['zap', 'zap', 'dread-whisper'],
    threat: { kind: 'windup', aim: 'all', move: 'spark-storm', say: 'The {e} opens wider and wider... (Guard!)' } },
  'cold-ripple': { name: 'Cold Ripple', tpl: 'swarm', bar: 'shadow', eerie: true },
  kalidah: { name: 'Kalidah', tpl: 'brute', bar: 'heart' },
  'hammer-head': { name: 'Hammer-Head', tpl: 'brute', bar: 'heart', moves: ['headbutt', 'bash'], normalMoves: ['head-shot', 'bash'] },
  'winkie-guard': { name: 'Winkie Guard', tpl: 'brute', bar: 'heart' },
  'crow-west': { name: 'Crow of the West', tpl: 'flyer', bar: 'heart' },
  'wolf-west': { name: 'Wolf of the West', tpl: 'quick', bar: 'heart' },
  'late-footstep': { name: 'Late Footstep', tpl: 'eerie', bar: 'shadow', mult: { spd: 1.6 }, moves: ['nip', 'whisper'], normalMoves: ['nip', 'nip', 'dread-whisper'] },
  'shut-eye': { name: 'Shut Eye', tpl: 'eerie', bar: 'shadow', mult: { wit: 1.2 }, moves: ['spark', 'whisper'], normalMoves: ['zap', 'zap', 'dread-whisper'],
    threat: { kind: 'windup', aim: 'all', move: 'spark-storm', say: 'The {e} begins, very slowly, to open... (Guard!)' } },
  'cave-lizard': { name: 'Cave Lizard', tpl: 'quick', bar: 'heart' },
  'trilobite-swarm': { name: 'Trilobite Swarm', tpl: 'swarm', bar: 'heart' },
  'eel-cloud': { name: 'Electric Eel-cloud', tpl: 'caster', bar: 'heart' },
  'moving-root': { name: 'Moving Root', tpl: 'brute', bar: 'shadow', eerie: true },
  'star-thing': { name: 'Star-Thing', tpl: 'eerie', bar: 'shadow', mult: { wit: 1.2 }, moves: ['spark', 'whisper'], normalMoves: ['zap', 'zap', 'dread-whisper'],
    threat: { kind: 'windup', aim: 'all', move: 'spark-storm', say: 'The {e} draws the cold starlight in... (Guard!)' } },
  'hollow-rabbit': { name: 'Hollow Rabbit', tpl: 'quick', bar: 'shadow', eerie: true, sprite: 'rabbit-buck', look: 'hollow', moves: ['nip', 'whisper'], normalMoves: ['nip', 'nip', 'dread-whisper'] },
  // dream-shapes (finale), tints of others
  drift: { name: 'Drift', tpl: 'eerie', bar: 'shadow', sprite: 'whisper', look: 'dream' },
  weight: { name: 'Weight', tpl: 'eerie', bar: 'shadow', sprite: 'late-footstep', look: 'dream', mult: { hp: 1.3, str: 1.3 } },
  flicker: { name: 'Flicker', tpl: 'eerie', bar: 'shadow', sprite: 'star-thing', look: 'dream', mult: { spd: 1.4 } },
  // New Game+ only (data/ng/bosses.js): the Nightmare of Deepdelve's second phase holds a pulled-out friend in one of these
  'dream-hole': { name: 'A Hole in the Dream', tpl: 'eerie', bar: 'shadow', sprite: 'whisper', look: 'dream', moves: ['whisper'], threat: null },
};
// Bosses: base template, size, mechanic id (handled in battle/bosses.js), counter policy (for tools/balance.mjs)
export const BOSSES = {
  'chief-weasel': { name: 'Chief Weasel', tpl: 'brute', bar: 'heart', mech: 'summon-weasel', counter: 'aoe-on-summon', hpMult: 6.2 },
  'queen-of-hearts': { name: 'Queen of Hearts', tpl: 'brute', bar: 'heart', mech: 'off-with', counter: 'guard-on-charge', with: ['knave'], hpMult: 6.2 },
  knave: { name: 'Knave of Hearts', tpl: 'quick', bar: 'heart', mech: 'steal', minion: true },
  choir: { name: 'Whispering Choir', tpl: 'eerie', bar: 'shadow', mech: 'choir', counter: 'hit-glowing', parts: 3, sprite: 'choir', hpMult: 6.2 },
  aster: { name: 'Aster', tpl: 'caster', bar: 'hum', hum: true, mech: 'hummer', counter: 'cure', hpMult: 6.2 },
  'moth-queen': { name: 'Moth Queen', tpl: 'flyer', bar: 'heart', mech: 'moth-summon', counter: 'light', hpMult: 6.2 },
  'tansy-taken': { name: 'Tansy', tpl: 'quick', bar: 'hum', hum: true, mech: 'two-actions', counter: 'shield-guard', sprite: 'tansy', hpMult: 6.2 },
  tidewarden: { name: 'The Tidewarden', tpl: 'eerie', bar: 'shadow', mech: 'submerge', counter: 'guard-submerged', mult: { str: 1.3, tgh: 1.2, hpMult: 6.2 }, backdrop: 'boss-tidewarden' },
  barley: { name: 'Barley', tpl: 'brute', bar: 'hum', hum: true, mech: 'plough', counter: 'no-guard-on-charge', hpMult: 6.2 },
  'wicked-witch': { name: 'The Wicked Witch of the West', tpl: 'caster', bar: 'heart', mech: 'witch', counter: 'pail', hpMult: 6.2 },
  watcher: { name: 'The Watcher on the Stair', tpl: 'eerie', bar: 'shadow', mech: 'watcher', counter: 'hit-open-eye', parts: 7, hpMult: 6.2 },
  'captain-quarry-boss': { name: 'Captain Quarry', tpl: 'brute', bar: 'hum', hum: true, mech: 'collapse', counter: 'shield-before', sprite: 'captain-quarry', hpMult: 6.2 },
  'hollow-rabbits': { name: 'Hollow Rabbit', tpl: 'quick', bar: 'shadow', eerie: true, mech: 'hollow', counter: 'light-aoe', sprite: 'rabbit-buck', look: 'hollow', hpMult: 1.54 },
  'nightmare-deepdelve': { name: 'Nightmare of Deepdelve', tpl: 'brute', bar: 'shadow', eerie: true, mech: 'pull-out', counter: 'swap', hpMult: 6.2 },
  'nightmare-flintcomb': { name: 'Nightmare of Flintcomb', tpl: 'quick', bar: 'shadow', eerie: true, mech: 'hum-all', counter: 'cure', hpMult: 6.2 },
  'undersleeper-eye': { name: 'The Undersleeper\'s Eye', tpl: 'caster', bar: 'dream', eerie: true, mech: 'dream', counter: 'story', backdrop: 'boss-eye', hpMult: 6.2 },
};
