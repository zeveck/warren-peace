// Chapter 1 (ch1w) story scripts: Wonderland (the Hall of Doors to the Queen's croquet) and the Shallows (Ninefold,
// the Whispering Choir, the mural). Ids are prefixed c1w.
import { G } from '../../core.js';
import { flag, setFlag, getVal, setActive } from '../../state.js';
import { floodHall } from './maps-wonder.js';
import { withNinefold } from './util.js';

// ---------------------------------------------------------------- helpers
export const lines = async (s, list) => { for (const l of list) { if (!l) continue; const [who, text, o] = l; if (who) await s.say(who, text, o || {}); else await s.narrate(text); } };
const trav = (s, id) => s.party().includes(id);
// first travelling companion among ids (for a reaction line), else null
const anyOf = (s, ...ids) => ids.find(id => trav(s, id)) || null;
const companion = (s) => s.party().filter(id => id !== 'bramble')[0] || null;
// cycle through sets of lines for a person each time they're talked to
async function cycle(s, key, sets) { const n = getVal('c1w_n_' + key) || 0; setFlag('c1w_n_' + key, n + 1); await lines(s, sets[n % sets.length]); }
const hasDandelion = (s) => s.has('ninefold-dandelion') || s.has('dandelion');
const roseCount = () => [0, 1, 2].filter(i => flag('c1w_rose' + i)).length;
const raceCount = () => [0, 1, 2].filter(i => flag('c1w_race' + i)).length;
function wonderQuest() {
  if (!flag('c1w_key')) return 'Get the little golden key from the glass table. (Eat Me makes you big.)';
  if (!flag('c1w_through')) return 'Shrink (Drink Me) and go through the tiny door.';
  if (!flag('c1w_caucus_done')) return flag('c1w_caucus_on') ? `Run the Caucus-race: hop on the glowing marks (${raceCount()} of 3).` : 'Talk to the Dodo on the shore of the Pool of Tears.';
  if (!flag('g_recruit_white-rabbit')) {
    if (!flag('c1w_wr_asked')) return 'Follow the lane from the shore (south-east) and find the White Rabbit.';
    if (!flag('c1w_gloves')) return 'Fetch the White Rabbit\'s gloves and fan from his house.';
    if (!flag('c1w_house_done')) return flag('c1w_cakes_in') ? 'Eat one of the little cakes on the floor.' : 'Got the gloves and fan. Now get out of the house!';
    return 'Give the White Rabbit his gloves and fan.';
  }
  if (!flag('g_recruit_caterpillar')) return 'Find the Caterpillar in the Mushroom Wood. His hedge ring has one tiny gap.';
  if (!flag('g_recruit_cheshire-cat')) {
    if (!flag('c1w_pigeon') && !flag('c1w_baby')) return 'Cross the great hedge (grow big) and find the Duchess\'s house.';
    if (!flag('c1w_baby')) return 'Visit the Duchess\'s kitchen, beyond the great hedge.';
    return 'The baby (a pig now) trotted off into the wood, south-east. Find it.';
  }
  if (!flag('c1w_tea_done')) return 'Join the Mad Tea-Party (east of the wood). Ask the Hatter, hear the Dormouse.';
  if (!flag('c1w_croquet_won')) return flag('c1w_garden') ? 'Talk to the Queen: the croquet match is about to begin.' : 'Shrink and go through the little door in the tree.';
  if (!flag('g_c1_wonder_done')) return 'Go to the court for the trial.';
  return 'Wonderland is done. The rabbit-hole in the garden\'s corner leads home.';
}
export { wonderQuest };
// once Chapter 1 is over, revisiting Wonderland/the Shallows must not replace the later chapters' quest line
const quest = (s) => { if (!flag('g_ch1_done')) s.quest(wonderQuest()); };
async function backToUnderway(s, entry) {
  if (G.data.maps['c1-underway']) await s.warp('c1-underway', entry);
  else await s.say(null, 'The way back up is a long climb. (The Underway is not here yet.)');
}
async function finishRace(s) {
  if (flag('c1w_caucus_done')) return;
  s.set('c1w_caucus_done');
  s.sfx('victory');
  await lines(s, [
    ['dodo', 'THE RACE IS OVER! Everyone stop! Stop! You may stop now.'],
    ['bramble', 'Who won?'],
    ['dodo', 'Everybody has won, and all must have prizes!'],
    ['dodo', 'And as you\'re the visitor, you shall hand them out. Here. Comfits. One each. Don\'t eat them all, they\'re the prizes.'],
  ]);
  await s.give({ comfits: 2, buttons: 15 });
  await lines(s, [
    ['dodo', 'And YOUR prize... what have you got in your pocket?'],
    ['bramble', 'Um. A button?'],
    ['dodo', 'Hand it over. ...We beg your acceptance of this elegant button. Splendid! It\'s yours!'],
    anyOf(s, 'toad') ? ['toad', 'I say, that was MY sort of race. Nobody lost! Toad, champion of the Caucus! Poop-poop!'] : null,
    anyOf(s, 'badger') ? ['badger', 'Hmph. A race where nobody loses. Sensible, in its way.'] : null,
    ['dodo', 'My shop is open, by the way. The Caucus Store. Prizes for sale. Prizes are much nicer when you buy them yourself.'],
    [null, 'Something white flicks past on the far side of the shore: a rabbit in a waistcoat, very late, running down the lane.'],
  ]);
  quest(s); s.save();
}

export const scripts = {
  // ================================================================ (a) THE HALL OF DOORS
  'c1w.hall.enter': async (s) => {
    if (flag('c1w_tears')) floodHall(s.ex);
    if (!flag('c1w_fell')) {
      s.set('c1w_fell');
      await lines(s, [
        [null, 'Down, down, down. Bramble falls past cupboards and shelves and a jar of orange marmalade, so slowly he has time to wonder.'],
        [null, 'Thump. A long, low hall, lit by lamps. Doors all round it, every one of them locked.'],
        ['bramble', 'I\'m... not hurt? I\'m not even dusty.'],
        companion(s) ? [companion(s), 'Bramble? Where are we? Why are we... inside you? Why is it cosy?'] : null,
        [null, 'His companions have tucked in close, the way kits do in a cold burrow. In this place, it seems, that\'s safest.'],
        ['bramble', 'A glass table with a little golden key. And a tiny door, no bigger than a rabbit-hole for mice.'],
      ]);
      s.save();
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.hall.table': async (s) => {
    if (flag('c1w_key')) { await s.say(null, 'The glass table. Nothing on it now but a smudge where the key was.'); return; }
    await lines(s, [
      [null, 'A little three-legged table, all of solid glass. On top: a tiny golden key, far, far above Bramble\'s ears.'],
      ['bramble', 'If I were twice as tall... three times...'],
    ]);
    quest(s);
  },
  'c1w.hall.key': async (s) => {
    if (flag('c1w_key')) { await s.say(null, 'From up here the glass table looks like a saucer.'); return; }
    s.set('c1w_key'); s.sfx('key-turn');
    { const t = s.ex.map.props.find(p => p.id === 'prop-glass-table'); if (t) t.id = 'prop-glass-table-empty'; }   // the key leaves the table
    await lines(s, [
      [null, 'From way up here the golden key is easy. Bramble pinches it up between two enormous claws.'],
      ['bramble', 'Got it! Now for the little door... oh.', { mood: 'worried' }],
      [null, 'The little door is about the size of one of his toes.'],
    ]);
    const c = await s.ask('bramble', 'How does Bramble feel about it?', ['Laugh: it\'s ridiculous.', 'Sigh. Of course.', 'Sniffle (only a little).']);
    await s.say('bramble', ['Ha! I\'m the biggest rabbit there ever was, and I can\'t get through a door.', 'Of course. Of COURSE it\'s too small.', 'I only want to find friends. Is that so much to ask?'][c]);
    await s.narrate('One huge tear rolls off his whiskers, then another. Splash. Splash. They run together across the floor and under the tiny door.');
    s.sfx('splash-melt'); s.set('c1w_tears'); floodHall(s.ex);
    await s.narrate('A whole corner of the hall is a pool now. Somewhere beyond the tiny door, water is lapping.');
    quest(s); s.save();
  },
  'c1w.hall.tinydoor': async (s) => {
    if (!flag('c1w_key')) { await s.say(null, 'A tiny door, locked. Through its keyhole: the loveliest garden, all roses and fountains, impossibly bright.'); quest(s); return; }
    if (s.size() !== 'small') { await s.say(null, 'You have the key, but the door is far too small for you. Something to drink, perhaps?'); quest(s); return; }
    s.set('c1w_through'); s.sfx('key-turn');
    await s.warp('c1w-pool', 'door');
  },
  'c1w.hall.up': async (s) => {
    const c = await s.ask('bramble', 'A tunnel, sloping steeply up. It smells of the Underway.', ['Climb back up', 'Stay']);
    if (c === 0) await backToUnderway(s, 'keyhole');
  },
  'c1w.stand': async (s) => {
    const c = await s.ask(null, 'A little stand: a bottle labelled DRINK ME, and a cake with EAT ME in currants. Both seem to fill themselves again.', ['Drink (shrink)', 'Eat (grow)', 'Leave them']);
    if (c === 0) { if (s.setSize('small')) await s.narrate('Cherry tart, custard, pineapple, roast turkey, toffee... Bramble shuts up like a telescope!'); else if (s.size() === 'small') await s.narrate('Already as small as a rabbit can sensibly be.'); }
    else if (c === 1) { if (s.setSize('big')) await s.narrate('Curiouser and curiouser! Bramble opens out like the largest telescope that ever was.'); else if (s.size() === 'big') await s.narrate('Any bigger and his ears would be in the next chapter.'); }
    quest(s);
  },
  'c1w.stub': async (s) => {
    if (s.size() === 'normal') { await s.narrate('A plain little mushroom. A nibble of it puts you back to your own size. You\'re already your own size.'); return; }
    s.setSize('normal'); await s.narrate('A nibble of the little mushroom, and Bramble is his own size again. What a relief. What a shame.');
  },

  // ================================================================ (a, b) THE POOL OF TEARS AND THE CAUCUS SHORE
  'c1w.pool.enter': async (s) => {
    s.set('c1w_through');
    if (!flag('c1w_pool_seen')) {
      s.set('c1w_pool_seen');
      await lines(s, [
        [null, 'Through the tiny door: a whole salty pool, warm as bathwater, and a sandy shore crowded with very wet creatures.'],
        ['bramble', 'Is this all... tears? MY tears?', { mood: 'worried' }],
        companion(s) ? [companion(s), 'You were a very big rabbit. That\'s a lot of tears. No shame in it.'] : null,
        [null, 'A Dodo is drying itself by standing very still and looking important. Beyond the shore, a lane winds off between hedges.'],
      ]);
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.dodo': async (s) => {
    if (flag('c1w_caucus_done')) {
      await cycle(s, 'dodo', [
        [['dodo', 'Prizes all round, and all of them earned! Even the ones that weren\'t. The Store is on the corner.']],
        [['dodo', 'The White Rabbit? Down the lane, always down the lane, always late. He\'ll be wanting someone to fetch something.']],
        [['dodo', 'I\'d tell you how to win a Caucus-race, but you\'ve already won one. Everyone has.']],
      ]);
      return;
    }
    if (flag('c1w_caucus_on')) {
      if (raceCount() >= 3) { await finishRace(s); return; }
      await s.say('dodo', `Keep running! Round and round! You\'ve touched ${raceCount()} of the marks. There are three. Or possibly more. Three.`);
      return;
    }
    await lines(s, [
      ['dodo', 'Ahem! You\'re dripping. Everyone is dripping. The best thing to get us dry would be a Caucus-race.'],
      ['bramble', 'What\'s a Caucus-race?'],
      ['dodo', 'Why, the best way to explain it is to do it. I\'ve marked out the course. In a sort of circle. The exact shape doesn\'t matter.'],
      ['dodo', 'Hop onto each of the three glowing marks, in any order you please. Begin when you like, leave off when you like.'],
      anyOf(s, 'ratty') ? ['ratty', 'A race on a beach, in no particular direction! I\'ve done worse things on a summer afternoon.'] : null,
    ]);
    s.set('c1w_caucus_on'); quest(s);
  },
  'c1w.race.0': async (s) => raceMark(s, 0),
  'c1w.race.1': async (s) => raceMark(s, 1),
  'c1w.race.2': async (s) => raceMark(s, 2),
  'c1w.dodo.shop': async (s) => { await s.shop('c1w.caucus-store'); },
  'c1w.pool.notyet': async (s) => {
    await s.say(null, 'The lane goes on between the hedges... but the Dodo is flapping at you: "You can\'t go dripping! Race first!"');
    quest(s);
  },

  // ================================================================ (c) THE WHITE RABBIT'S LANE AND HOUSE
  'c1w.lane.enter': async (s) => {
    if (!flag('c1w_lane_seen')) {
      s.set('c1w_lane_seen');
      await lines(s, [
        [null, 'A neat lane between hedges, and at the top of it a neat little house with a bright brass plate: W. RABBIT.'],
        ['white-rabbit', 'Oh my ears and whiskers, how late it\'s getting! The Duchess! She\'ll have me executed, as sure as ferrets are ferrets!'],
        ['bramble', 'A rabbit! A rabbit in a waistcoat!', { mood: 'happy' }],
      ]);
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.wr.talk': async (s) => {
    if (flag('c1w_house_done')) { await wrJoin(s); return; }
    if (flag('c1w_wr_asked')) {
      await cycle(s, 'wr', [
        [['white-rabbit', 'Gloves! Fan! The house, Mary Ann, the HOUSE! Up the path, the door\'s on the latch!']],
        [['white-rabbit', 'Every minute you stand there the Duchess gets a minute crosser. Quick, quick!']],
      ]);
      return;
    }
    await lines(s, [
      ['white-rabbit', 'Why, Mary Ann, what ARE you doing out here? Run home this moment and fetch me a pair of gloves and a fan!'],
      ['bramble', 'I\'m not Mary Ann. I\'m Bramble. From Thimblebank.'],
      ['white-rabbit', 'Bramble, Mary Ann, Bramble, what does it matter, you\'re a rabbit and you\'re standing about! Gloves! Fan! Quick!'],
    ]);
    const c = await s.ask('bramble', 'He\'s shaking all over.', ['"All right. I\'ll fetch them."', '"Only if you say please."', '"Is it always like this down here?"']);
    if (c === 1) await lines(s, [['white-rabbit', 'Please! Please, please, please, I\'ve no TIME for please!'], ['bramble', 'That\'ll do.']]);
    else if (c === 2) await lines(s, [['white-rabbit', 'Like what? Oh. Yes. Always. Gloves!']]);
    await s.say('white-rabbit', 'The house at the top of the path. White kid gloves, and the fan on the dresser. GO!');
    s.set('c1w_wr_asked'); quest(s);
  },
  'c1w.lane.door': async (s) => { await s.say(null, 'A bright brass plate: W. RABBIT. The door is shut, and it would be rude to walk in without being asked.'); },
  'c1w.lane.notyet': async (s) => { await s.say(null, 'The lane runs on into a wood of huge mushrooms. But the White Rabbit is hopping from foot to foot, waiting for you.'); quest(s); },
  'c1w.house.enter': async (s) => {
    if (!flag('c1w_house_seen')) {
      s.set('c1w_house_seen');
      await lines(s, [
        [null, 'A tidy little room. A dresser by the window, a hearth, an armchair. And on the table, a little bottle, not labelled at all.'],
        companion(s) ? [companion(s), 'It\'s a rabbit\'s house. A real one. With CHAIRS.'] : null,
      ]);
    }
    if (flag('c1w_cakes_in') && !flag('c1w_house_done')) {
      // back in a stuck house (reloaded): make sure the cakes are on the floor
      if (!s.ex.map.props.some(p => p.id === 'prop-banquet-table')) s.ex.map.props.push({ id: 'prop-banquet-table', x: 8, y: 6, w: 1, h: 1 });
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.house.dresser': async (s) => {
    if (flag('c1w_gloves')) { await s.say(null, 'The dresser. A spare waistcoat, a pocket watch with no hands, and a great many hankies.'); return; }
    s.set('c1w_gloves'); s.sfx('chest-open');
    await s.narrate('On the dresser, just where he said: a fan, and two or three pairs of tiny white kid gloves.');
    await s.give({ buttons: 10 }, 1, true);
    await s.narrate('Got the White Rabbit\'s gloves and fan! (And 30 buttons that were rolling about in the drawer.)');
    quest(s);
  },
  'c1w.house.bottle': async (s) => {
    if (flag('c1w_house_done')) { await s.say(null, 'An empty little bottle. No label. Best leave it that way.'); return; }
    if (!flag('c1w_gloves')) { await s.say(null, 'A little bottle with no label. Better find the gloves and fan first, before anything curious happens.'); return; }
    if (flag('c1w_cakes_in')) { await s.say(null, 'The bottle is empty. Which is just as well.'); return; }
    const c = await s.ask('bramble', 'No label. No DRINK ME. Something interesting always happens when I eat or drink anything here...', ['Drink it', 'Leave it']);
    if (c !== 0) return;
    s.setSize('big'); s.shake(0.6, 3); s.sfx('rumble');
    await lines(s, [
      [null, 'Before he has drunk half the bottle his ears are pressing the ceiling. He kneels. He lies down. One foot goes up the chimney.'],
      ['bramble', 'That\'s... enough now. That\'s quite enough!', { mood: 'worried' }],
      ['white-rabbit', '(outside) Mary Ann! Mary Ann! Fetch me my gloves this moment!'],
      ['white-rabbit', '(outside) What\'s that in the window? An ARM? A great furry ARM? Pat! Bill! Bill the Lizard! Down the chimney with you!'],
      [null, 'Scritch, scratch, scrabble: something small is climbing down the chimney toward Bramble\'s foot.'],
    ]);
    const k = await s.ask('bramble', 'Something is tickling his toes.', ['Give a little kick', 'Sneeze', 'Wiggle the foot']);
    s.sfx(k === 1 ? 'sneeze' : 'whoosh');
    await lines(s, [
      [null, ['A little kick, and', 'A tremendous sneeze, and', 'A wiggle of the foot, and'][k] + ' out of the top of the chimney shoots Bill the Lizard, like a cork out of a bottle.'],
      ['bill-lizard', '(far away) Oooooooh...'],
      ['white-rabbit', '(outside) There goes Bill! Well, we must burn the house down, then! No, no, throw something in! Pebbles!'],
    ]);
    s.sfx('hit-1'); await s.wait(0.25); s.sfx('hit-2');
    await s.narrate('A shower of little pebbles rattles in at the window. As they land on the floor, every one of them turns into a little cake.');
    s.set('c1w_cakes_in');
    if (!s.ex.map.props.some(p => p.id === 'prop-banquet-table')) s.ex.map.props.push({ id: 'prop-banquet-table', x: 8, y: 6, w: 1, h: 1 });
    await s.say('bramble', 'Cakes. If they make me bigger I can\'t possibly get any stuck-er. Let\'s try one.');
    quest(s);
  },
  'c1w.house.cake': async (s) => {
    if (flag('c1w_house_done')) return;
    await s.narrate('Bramble nibbles one of the little pebble-cakes... and shrinks, and shrinks, and keeps on shrinking.');
    s.setSize('small');
    s.set('c1w_house_done');
    await s.narrate('The moment he\'s small enough, he dashes out of the door with the gloves and fan held high.');
    await s.warp('c1w-lane', 'house');
    await wrJoin(s);
  },
  'c1w.house.stuck': async (s) => {
    await s.say(null, 'One great foot will just about fit through the door. The rest of Bramble will not.');
    quest(s);
  },
  'c1w.bill': async (s) => {
    await cycle(s, 'bill', [
      [['bill-lizard', 'Something came at me like a Jack-in-the-box, and up I goes like a sky-rocket! Thank ye, I\'m better now.'], ['bill-lizard', 'I\'m a deal too flustered to tell ye any more.']],
      [['bill-lizard', 'Was that you? With the foot? No offence taken. It were a very handsome foot.']],
      [['bill-lizard', 'They always send me down the chimney. "Bill\'s got to go down." Never "Bill, would you like a cup of tea."']],
    ]);
  },
  'c1w.pebblecakes': async (s) => {
    const c = await s.ask(null, 'A tray of the little pebble-cakes, set out on the lane. They seem to come back as fast as they\'re eaten.', ['Eat one (shrink)', 'Leave them']);
    if (c === 0) { if (s.setSize('small')) await s.narrate('Bramble shrinks to the size of a beetle. Every blade of grass is a tree.'); else await s.narrate('Small already. Any smaller and the beetles would start giving orders.'); }
  },

  // ================================================================ (d) THE MUSHROOM WOOD AND THE DUCHESS'S KITCHEN
  'c1w.wood.enter': async (s) => {
    if (!flag('c1w_wood_seen')) {
      s.set('c1w_wood_seen');
      await lines(s, [
        [null, 'A wood where the mushrooms are taller than the trees. Through the middle runs a hedge as tall as a house, with no gate in it at all.'],
        ['white-rabbit', '(from somewhere) The Duchess lives on the far side! Oh, I shall be late! I am already late!'],
        ['bramble', 'And somebody\'s sitting on top of that big mushroom inside the hedge ring. Smoking. Being... long.'],
      ]);
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.mushroom': async (s) => {
    const c = await s.ask(null, 'A great mushroom, wide as a table. One side of the cap smells sweet, the other sharp.', ['Nibble the sweet side (grow)', 'Nibble the sharp side (shrink)', 'Leave it']);
    if (c === 0) { if (s.setSize('big')) await s.narrate('Up shoots Bramble\'s neck, like a serpent. Hmm. Nobody had better see that.'); }
    else if (c === 1) { if (s.setSize('small')) await s.narrate('Down goes Bramble, chin nearly to his feet.'); }
    if (c < 2) s.set('c1w_used_mushroom');
  },
  'c1w.caterpillar': async (s) => {
    if (flag('c1w_cater_done')) { await s.say('caterpillar', 'Hm. You again. Still deciding who you are? Take your time. I\'m not going anywhere. Well. Eventually.'); return; }
    await lines(s, [
      [null, 'On top of the mushroom, arms folded, a large blue Caterpillar is smoking a long hookah. It looks at Bramble for a long time in silence.'],
      ['caterpillar', 'Who... are... YOU?'],
    ]);
    const a = await s.ask('bramble', 'Who is he?', ['"I\'m Bramble, of Thimblebank Warren."', '"I hardly know, just at present. I\'ve changed size three times today."', '"Who are YOU?"']);
    if (a === 0) await lines(s, [['caterpillar', 'Bramble. Of Thimblebank. You say it as if it settled something. Does it?'], ['bramble', 'It did yesterday.']]);
    else if (a === 1) await lines(s, [['caterpillar', 'It isn\'t confusing at all. One day you will be a butterfly, I expect. Or a rabbit. Something.']]);
    else await lines(s, [['caterpillar', 'Hm. Nobody asks back. I think YOU ought to tell ME first.'], ['bramble', 'Why?'], ['caterpillar', 'That is not an answer. Nor is that.']]);
    await lines(s, [
      ['caterpillar', 'So you think you\'re changed. Can you remember things as you used to? Repeat "You are old, Father William."'],
      [null, 'Bramble folds his paws and begins.'],
    ]);
    const l1 = await s.ask('bramble', '"You are old, Father William," the young man said...', ['"...and your hair has become very white."', '"...and your ears have gone floppy and grey."', '"...and you dig the most wonderful holes."']);
    const l2 = await s.ask('bramble', '"And yet you incessantly..."', ['"...stand on your head."', '"...thump on the ground."', '"...nibble the clover."']);
    const l3 = await s.ask('bramble', '"Do you think, at your age..."', ['"...it is right?"', '"...it is wise?"', '"...you will get home tonight?"']);
    const right = (l1 === 0) + (l2 === 0) + (l3 === 0);
    await lines(s, [
      [null, 'He gets through it, more or less. Bits of Thimblebank keep getting in.'],
      ['caterpillar', right === 3 ? 'That is not said right. A little wrong, I fear. Some of the words have got altered.' : 'It is wrong from beginning to end. Every line has a rabbit in it.'],
      ['caterpillar', 'Hm. Which is the first good answer anyone has given me in years. It is YOUR poem now. That is who you are.'],
      ['bramble', 'I\'m... a poem?'],
      ['caterpillar', 'You are a rabbit who changes, and remembers home anyway. Good. Keep doing that. Take this.'],
    ]);
    await s.give({ 'mushroom-halves': 1 });
    await lines(s, [
      ['caterpillar', 'One side will make you grow taller, the other side will make you grow shorter. Anywhere in this country. Use them from your pack.'],
      [null, 'From the hedge bottom, three pink necks rise, one after another: flamingos, hiding.'],
      ['caterpillar', 'And these. The Queen\'s croquet mallets. They hide here every afternoon. Flamingos, this rabbit is going somewhere other than croquet.'],
      [null, 'A flamingo, very quietly: "Somewhere... with no hedgehogs? And nobody holding us upside down by the ankles?"'],
      ['caterpillar', 'Probably. Go with him. So shall I, I suppose. I have been sitting on this mushroom a very long time, and I have changed my mind about it.'],
    ]);
    s.set('c1w_cater_done');
    await s.recruit('caterpillar', { line: 'Who... are... YOU? Hm. Good answer. I shall come and see what you turn into.', level: 8 });
    s.remove('flamingo-1'); s.remove('flamingo-2'); s.remove('flamingo-3'); s.remove('caterpillar');
    await s.say(null, 'The Flamingos will march with the army, in their fashion. The Caterpillar climbs onto Bramble\'s shoulder, then thinks better of it and walks.');
    quest(s); s.save();
  },
  'c1w.flamingo': async (s) => {
    await cycle(s, 'flamingo', [
      [[null, 'A flamingo, very quietly: "Shh! If the Queen finds us, it\'s croquet again. Upside down. With hedgehogs. Every. Single. Afternoon."']],
      [[null, 'A flamingo, very quietly: "The Caterpillar lets us hide here if we stand very still and don\'t say anything. ...Oops."']],
    ]);
  },
  'c1w.pigeon': async (s) => {
    if (flag('c1w_pigeon')) return;
    s.set('c1w_pigeon');
    s.sfx('wings');
    await lines(s, [
      [null, 'Bramble\'s head pokes up through the treetops beside a nest, and a large Pigeon flies straight into his face, beating him with her wings.'],
      ['pigeon', 'Serpent! SERPENT!'],
      ['bramble', 'I\'m not a serpent! I\'m a rabbit!'],
      ['pigeon', 'A likely story! I\'ve seen a good many rabbits in my time, and never one with such a neck as that! Serpent, I say!'],
      ['pigeon', 'Three weeks I\'ve been guarding these eggs, and now serpents come down from the SKY! Go away! Go on!'],
      anyOf(s, 'caterpillar') ? ['caterpillar', '(from inside Bramble somewhere) Hm. She has a point about the neck.'] : null,
    ]);
    quest(s);
  },
  'c1w.pigeon.talk': async (s) => {
    if (s.size() === 'big') { await s.say('pigeon', 'Serpent! I can see you up there! Away from my eggs!'); return; }
    await cycle(s, 'pigeon', [
      [['pigeon', 'Oh, a rabbit. A proper rabbit-sized rabbit. Have you seen a serpent? Long neck? Very rude?'], ['bramble', 'Er. No.']],
      [['pigeon', 'The Duchess\'s house is just there, past the dovecote. Mind the pepper. Mind the Duchess. Mind EVERYTHING.']],
    ]);
  },
  'c1w.duchess.door': async (s) => {
    if (s.size() === 'big') { await s.say(null, 'The Duchess\'s front door would fit one of your whiskers. Shrink first.'); return; }
    if (!flag('c1w_duchess_knock')) {
      s.set('c1w_duchess_knock');
      await s.narrate('Bramble knocks. Inside there is a most extraordinary noise: howling, sneezing, and every now and then a great crash.');
    }
    await s.warp('c1w-duchess', 'door');
  },
  'c1w.duchess.enter': async (s) => {
    if (!flag('c1w_kitchen_seen')) {
      s.set('c1w_kitchen_seen');
      s.sfx('sneeze');
      await lines(s, [
        [null, 'The kitchen is full of smoke and pepper. The Duchess sits on a three-legged stool, nursing a howling baby. The Cook stirs a huge cauldron of soup.'],
        [null, 'On the hearth, a large cat is grinning from ear to ear.'],
        companion(s) ? [companion(s), 'Achoo! Bramble, I can feel the pepper from INSIDE you. Achoo!'] : null,
      ]);
    }
    if (!flag('c1w_baby')) { if (!flag('g_ch1_done')) s.quest('Talk to the Duchess (and mind the pepper).'); }
    else quest(s);
    s.ex.enterBubble();
  },
  'c1w.duchess': async (s) => {
    if (flag('c1w_baby')) return;
    await lines(s, [
      ['duchess', 'If everybody minded their own business, the world would go round a deal faster than it does.'],
      ['bramble', 'Please, why does your cat grin like that?'],
      ['duchess', 'It\'s a Cheshire cat, and that\'s why. Pig!'],
      ['bramble', 'I beg your pardon?'],
      ['duchess', 'I said Pig! To the baby. And the moral of THAT is... oh, I have no time for morals. The Queen\'s croquet! Here! You may nurse it a bit, if you like!'],
    ]);
    s.sfx('whoosh');
    await lines(s, [
      [null, 'She flings the baby at Bramble and sweeps out, the Cook throwing a saucepan after her for luck.'],
      [null, 'Bramble holds on tight. The baby grunts. It is a queer-shaped little creature. Its nose turns up. Its eyes get small.'],
      ['bramble', 'If you\'re going to turn into a pig, I\'ll have nothing more to do with you. Mind now!'],
      [null, 'It grunts again, very decidedly a pig. Bramble sets it down, and it trots away quite contentedly, out of the door and off into the wood.'],
      ['cheshire-cat', 'By-the-bye, what became of the baby? I\'d nearly forgotten to ask.'],
      ['bramble', 'It turned into a pig.'],
      ['cheshire-cat', 'I thought it would. Do find out where it went. I should like to know how it ends.'],
      [null, 'And the Cat vanishes, quite slowly, beginning with the end of its tail, and ending with the grin, which stays some time after the rest has gone.'],
    ]);
    s.set('c1w_baby'); s.set('c1w_pig');
    s.remove('duchess'); s.remove('cheshire-cat');
    quest(s); s.save();
  },
  'c1w.cook': async (s) => {
    if (!flag('c1w_baby')) {
      await cycle(s, 'cook', [
        [['cook', 'Too much pepper? There\'s no such thing as too much pepper. Achoo! Pass the tongs.']],
        [[null, 'The Cook throws a frying pan at nothing in particular. It misses Bramble by a whisker.'], ['cook', 'Sorry, dear. Habit.']],
      ]);
      return;
    }
    await cycle(s, 'cook2', [
      [['cook', 'The baby went pig? Babies do. I always said so. Nobody listens to a cook.']],
      [['cook', 'Off to the croquet, is she? Good. Now I can put the proper amount of pepper in. ALL of it.']],
    ]);
  },
  'c1w.cat.kitchen': async (s) => {
    await cycle(s, 'catk', [
      [['cheshire-cat', 'Oh, a rabbit. A grown-up-sized one, for now. I do like your ears. One flops. The other is thinking about it.']],
      [['bramble', 'Which way should I go from here?'], ['cheshire-cat', 'That depends a good deal on where you want to get to.'], ['bramble', 'Somewhere with friends in it.'], ['cheshire-cat', 'Then you\'re sure to do that, if only you walk long enough.']],
    ]);
  },
  'c1w.pig': async (s) => {
    if (flag('g_recruit_cheshire-cat')) { await s.say(null, 'The little pig is rooting happily by the log. It looks much more comfortable as a pig.'); return; }
    s.sfx('scamper');
    await lines(s, [
      [null, 'There it is, by the hollow log: a little pig, rooting for acorns, perfectly happy.'],
      ['bramble', 'There you are. You make rather a handsome pig, you know.'],
      [null, 'It grunts, very satisfied with itself. Above Bramble, in the branches, a grin appears. Then, around it, a cat.'],
      ['cheshire-cat', 'Did you say pig, or fig?'],
      ['bramble', 'Pig. It\'s happy. I think that\'s the end of its story.'],
      ['cheshire-cat', 'How very tidy. Most stories here never end at all. Yours, though... Yours has a hum underneath it. I can hear it from here.'],
      ['bramble', 'You can hear the Hum?', { mood: 'worried' }],
      ['cheshire-cat', 'We\'re all mad here. But that sound is not our sort of mad. It is a sad sort, and it is coming up from the bottom of things.'],
    ]);
    const c = await s.ask('bramble', 'The grin waits.', ['"Come with me. Help me stop it."', '"Do you know the way down?"', '"Are you going to vanish again?"']);
    await s.say('cheshire-cat', ['Help? I never help. I come along. It\'s quite different, and much more fun.', 'Down? Every way is down if you\'re upside down. I\'ll show you. I\'ll come along.', 'Very probably. But I\'ll come back, which is the trick of it. I\'ll come along, I think.'][c]);
    await s.say('cheshire-cat', 'I should like to see how it ends.');
    await s.recruit('cheshire-cat', { line: 'I\'ll come along, to see how it ends. We\'re all mad here, you know.', level: 8 });
    s.remove('cheshire-cat'); s.set('c1w_cat_joined');
    await s.give({ buttons: 30 });
    quest(s); s.save();
  },
  'c1w.cat.wood': async (s) => {
    await s.say('cheshire-cat', 'The pig? It went that way. Or that way. One of them is south-east. Do look by the hollow log, they like logs.');
  },
  'c1w.wood.notyet': async (s) => {
    await s.say(null, 'A path goes east toward the sound of teacups. But somewhere in the wood, a baby (or a pig) still needs finding.');
    quest(s);
  },

  // ================================================================ (e) THE MAD TEA-PARTY
  'c1w.tea.enter': async (s) => {
    if (!flag('c1w_tea_seen')) {
      s.set('c1w_tea_seen');
      await lines(s, [
        [null, 'A long table set under a tree, laid for dozens. Only three are sitting at it, all crowded at one corner, and a Dormouse asleep between them.'],
        ['hatter', 'No room! No room!'],
        ['bramble', 'There\'s plenty of room!'],
        ['march-hare', 'Have some wine.'],
        ['bramble', 'I don\'t see any wine.'],
        ['march-hare', 'There isn\'t any.'],
      ]);
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.hatter': async (s) => {
    if (flag('c1w_riddle')) {
      if (flag('c1w_tea_done')) { await cycle(s, 'hatter', [
        [['hatter', 'The door in the tree, rabbit. Small door, small rabbit. Very logical. Most things here are, if you squint.']],
        [['hatter', 'I quarrelled with Time, you know. Now it\'s always six o\'clock. Always tea-time. I should hate it, if it weren\'t for the tea.']],
        [['hatter', 'Your hair wants cutting. Your ears, too. One of them, anyway. The flop. No, leave it. It suits you.']],
      ]); return; }
      await s.say('hatter', 'Ask the Dormouse for a story. Pinch him if you must. Everybody does.');
      return;
    }
    await lines(s, [
      ['hatter', 'Your hair wants cutting.'],
      ['bramble', 'You shouldn\'t make personal remarks. It\'s very rude.'],
      ['hatter', 'Why is a raven like a writing-desk?'],
    ]);
    const c = await s.ask('bramble', 'Why is a raven like a writing-desk?', ['"Because they both have... quills?"', '"Because a rabbit has never sat on either?"', '"I give up. What\'s the answer?"']);
    if (c === 2) await lines(s, [['hatter', 'I haven\'t the slightest idea!'], ['march-hare', 'Nor I!'], ['hatter', 'Splendid! Wonderful! Nobody has ever given up so well!']]);
    else await lines(s, [['hatter', c === 0 ? 'QUILLS! Quills! Ha! Do you hear, Hare? Quills!' : 'Never sat on either! Never! Ha! Hare, write that down!'], ['march-hare', 'I haven\'t got a writing-desk.'], ['hatter', 'Then write it on a raven! Oh, you are a delightful rabbit.']]);
    await lines(s, [
      ['hatter', 'We don\'t know the answer, you see. Nobody does. That\'s what makes it such a good riddle: every answer is right.'],
      ['bramble', 'That\'s the least sensible thing I ever heard.'],
      ['hatter', 'Thank you! Now. Wake the Dormouse, he owes us a story.'],
    ]);
    s.set('c1w_riddle'); await teaCheck(s);
  },
  'c1w.marchhare': async (s) => {
    await cycle(s, 'hare', [
      [['march-hare', 'Take some more tea.'], ['bramble', 'I\'ve had nothing yet, so I can\'t take more.'], ['march-hare', 'You mean you can\'t take LESS. It\'s very easy to take more than nothing.']],
      [['march-hare', 'I\'m a hare. You\'re a rabbit. We are practically cousins. That\'s why I\'m being so polite. This is me being polite.']],
      [['march-hare', 'It was the BEST butter. It really was. Don\'t ask about the watch.']],
    ]);
  },
  'c1w.dormouse': async (s) => {
    if (flag('c1w_treacle')) { await s.say('dormouse', '...twinkle, twinkle... zzz... treacle... zzz...'); return; }
    if (!flag('c1w_riddle')) { await s.say('dormouse', 'Zzz... I heard every word you fellows were saying... zzz...'); return; }
    await lines(s, [
      ['hatter', 'Wake up, Dormouse! Tell us a story!'],
      ['dormouse', 'Once upon a time there were three little sisters, and they lived at the bottom of a well...'],
      ['bramble', 'What did they live on?'],
      ['dormouse', 'They lived on treacle. It was a treacle-well. And they were learning to draw... they drew all manner of things... everything that begins with an M...'],
      ['bramble', 'Why with an M?'],
      ['march-hare', 'Why not?'],
      ['dormouse', '...mousetraps, and the moon, and memory, and muchness... you know you say things are much of a muchness... zzz...'],
      ['bramble', 'People who live at the bottom of something, and draw everything they remember...', { mood: 'worried' }],
      ['dormouse', 'Zzz... the bottom of the well is very deep... somebody down there is dreaming... zzz...'],
    ]);
    s.set('c1w_treacle'); await teaCheck(s);
  },
  'c1w.tree.door': async (s) => {
    if (!flag('c1w_tea_done')) { await s.say(null, 'A little door, right in the trunk of the tree. Curious. But the tea-party isn\'t finished with you yet.'); quest(s); return; }
    if (s.size() !== 'small') { await s.say(null, 'A little door in the tree trunk. You\'d have to be very small. (There\'s a Drink Me stand right beside it.)'); return; }
    await s.warp('c1w-garden', 'tree');
  },
  'c1w.tree.notyet': async (s) => {
    if (!flag('c1w_tea_done')) { await s.say(null, 'A little door in the trunk of the tree. The Hatter is waving his teacup at you: you haven\'t answered his riddle yet!'); quest(s); return; }
  },

  // ================================================================ (f) THE QUEEN'S GARDEN
  'c1w.garden.enter': async (s) => {
    if (!flag('c1w_garden')) {
      s.set('c1w_garden');
      await lines(s, [
        [null, 'At last: the lovely garden from the keyhole. Bright flower-beds, cool fountains, and a croquet ground, ridged and furrowed.'],
        [null, 'By the gate, three gardeners shaped like playing cards are busily painting a rose tree red.'],
        ['white-rabbit', '(far off) The Queen! The Queen! Make way for the Queen of Hearts!'],
        anyOf(s, 'cheshire-cat') ? ['cheshire-cat', 'Ah. Her Majesty. Mind your head. She will.'] : null,
      ]);
      s.save();
    }
    quest(s);
    s.ex.enterBubble();
  },
  'c1w.seven': async (s) => {
    if (flag('g_recruit_seven-of-spades')) return;
    if (flag('c1w_roses_on')) {
      if (roseCount() >= 3) { await rosesDone(s); return; }
      await s.say('seven-of-spades', `Quick! The white ones, by the gate! ${3 - roseCount()} left! If she sees white she\'ll have our heads!`);
      return;
    }
    await lines(s, [
      ['seven-of-spades', 'Look out now, Five! Don\'t go splashing paint over me like that!'],
      ['bramble', 'Why are you painting the roses?'],
      ['seven-of-spades', 'Why, the fact is, this here ought to have been a RED rose tree, and we put a white one in by mistake.'],
      ['seven-of-spades', 'If the Queen was to find it out, we should all have our heads cut off, you know. So we\'re doing our best afore she comes.'],
    ]);
    const c = await s.ask('bramble', 'Three bushes still glow white.', ['"I\'ll help. Give me a brush."', '"Maybe later."']);
    if (c === 0) {
      s.set('c1w_roses_on');
      await s.say('seven-of-spades', 'Bless your whiskers! Here\'s a brush. The three by the gate, the ones with the white blooms. Quick, quick!');
      s.quest('Paint the three white rose bushes red (by the gate) before the Queen comes.');
    } else await s.say('seven-of-spades', 'Later might be after the Queen. But all right.');
  },
  'c1w.twofive': async (s) => {
    if (flag('c1w_roses_on')) { await s.say('two', 'Paint quicker! Seven, you\'ve got red on your nose! Five, it\'s on your ear!'); return; }
    await cycle(s, 'twofive', [
      [['five', 'I heard the Queen say only yesterday you deserved to be beheaded, Seven!'], ['two', 'What for?'], ['five', 'That\'s none of YOUR business, Two!']],
      [['two', 'It\'s the paint, you see. It never quite covers. She can always tell.']],
    ]);
  },
  'c1w.rose.0': async (s) => paintRose(s, 0),
  'c1w.rose.1': async (s) => paintRose(s, 1),
  'c1w.rose.2': async (s) => paintRose(s, 2),
  'c1w.roses.hop': (ex) => {
    if (!flag('c1w_roses_on') || flag('g_recruit_seven-of-spades') || flag('c1w_roses_warned')) return;
    const n = (getVal('c1w_rose_hops') || 0) + 1; setFlag('c1w_rose_hops', n);
    if (n >= 40) { setFlag('c1w_roses_warned', true); ex.bubbles.push({ who: s0(), text: 'Hurry! Seven is waving his brush like a flag!', t: 3.5 }); }
  },
  'c1w.queen': async (s) => {
    if (flag('c1w_croquet_won')) return;
    await lines(s, [
      ['queen-of-hearts', 'And who is THIS? What\'s your name, child?'],
      ['bramble', 'My name is Bramble, so please your Majesty.'],
      ['queen-of-hearts', 'Can you play croquet?'],
    ]);
    const c = await s.ask('bramble', 'The whole garden is watching.', ['"Yes!"', '"I can learn."', '"With a flamingo?"']);
    await lines(s, [
      ['queen-of-hearts', ['Come on, then!', 'You shall learn by losing. Come on, then!', 'With a flamingo, and a hedgehog, and ME. Come on, then!'][c]],
      ['king-of-hearts', '(quietly) My dear, he is only a rabbit...'],
      ['queen-of-hearts', 'Get to your places! And if he wins... OFF WITH HIS HEAD!'],
      anyOf(s, 'badger', 'burdock') ? [anyOf(s, 'badger', 'burdock'), 'Hmph. Stand behind me, Bramble.'] : null,
    ]);
    s.quest('Beat the Queen at croquet! (Guard when she shouts "Off with-")');
    const r = await s.battle('c1w.croquet');
    if (r !== 'win') return;
    s.set('c1w_croquet_won');
    await lines(s, [
      [null, 'The last hoop. The hedgehog uncurls, the flamingo sighs, and the ball rolls neatly through. The Queen goes the colour of her own roses.'],
      ['queen-of-hearts', 'OFF WITH HIS HEAD! Off with ALL their heads! Off with...'],
      ['king-of-hearts', '(to everyone, very quietly) You are all pardoned.'],
      ['bramble', 'Thank you, your Majesty!'],
      ['king-of-hearts', 'Not at all. I pardon nearly everybody, nearly every afternoon. Now: we really must have the trial. Somebody stole the tarts.'],
    ]);
    await s.warp('c1w-garden', 'court');
    await runTrial(s);
  },
  'c1w.trial': async (s) => { await runTrial(s); },
  'c1w.king': async (s) => {
    await s.say('king-of-hearts', 'I don\'t like the look of the croquet at all. Nobody seems to play fair, and they all quarrel so dreadfully. Do be careful.');
  },
  'c1w.knave': async (s) => {
    await s.say('knave', '(he is holding a tart behind his back and looking very innocent) Afternoon.');
  },
  'c1w.queen.after': async (s) => {
    await cycle(s, 'queen', [
      [['queen-of-hearts', 'You! The rabbit who won at MY croquet. I shall have your head... framed. Over the throne. As a trophy. Don\'t move.']],
      [['queen-of-hearts', 'Off with... no. No. The King says I must count to ten first. One... two...'], ['bramble', 'I\'ll just be going.']],
    ]);
  },
  'c1w.king.after': async (s) => {
    await cycle(s, 'king', [
      [['king-of-hearts', 'Begin at the beginning, and go on till you come to the end: then stop. That is my advice for your journey, young rabbit.']],
      [['king-of-hearts', 'If there\'s no meaning in it, that saves a world of trouble, you know, as we needn\'t try to find any. But I think there is. In yours.']],
    ]);
  },
  'c1w.knave.after': async (s) => {
    await s.say('knave', 'Thanks for not mentioning the jam on my sleeve. You\'re all right, for a rabbit.');
  },
  'c1w.wr.court': async (s) => {
    await cycle(s, 'wrc', [
      [['white-rabbit', 'Herald to the court, Herald to the army! Oh, I shall be late for both. But I shall be there, Bramble. I promise.']],
      [['white-rabbit', 'When your battle comes, sound the trumpet and my Heralds will run faster than anyone. It\'s the one thing we\'re never late for.']],
    ]);
  },
  'c1w.dodo.court': async (s) => {
    await s.say('dodo', 'I\'ve come for the trial. I always come for the trial. Everyone wins a trial, you know, if you do it properly.');
  },
  'c1w.flamingo.g': async (s) => {
    await cycle(s, 'flg', [
      [[null, 'A flamingo, very quietly: "If anyone asks, I am a lawn ornament. A very still lawn ornament."']],
      [[null, 'A flamingo, very quietly: "You beat Her Majesty using MY cousins as mallets? Gently? Oh, they\'ll never stop talking about it."']],
    ]);
  },
  'c1w.hedgehog.g': async (s) => {
    await cycle(s, 'hhg', [
      [['hedgehog', 'Every afternoon I\'m a croquet ball. Every afternoon I walk off halfway through. Nobody ever notices.']],
      [['hedgehog', 'You\'ve got hedgehog friends up top? Badger\'s lads? Tell them a Wonderland hedgehog says: keep rolling.']],
    ]);
  },
  'c1w.garden.home': async (s) => {
    const c = await s.ask(null, 'A rabbit-hole, under the hedge. It smells of earth and stone and, faintly, of home.', ['Go down the rabbit-hole (back to the Underway)', 'Stay in Wonderland']);
    if (c === 0) await backToUnderway(s, 'keyhole');
  },

  // ================================================================ THE SHALLOWS
  'c1w.shallows.enter': async (s) => {
    if (!flag('c1w_sh_seen')) {
      s.set('c1w_sh_seen');
      s.music('m-depths');
      await lines(s, [
        [null, 'The stair goes down, and down, and then stops being a stair. The stone here is smooth and black, as if something had licked it smooth.'],
        [null, 'There are carvings on the pillars. Rabbits. Dozens of rabbits, carved with great care. But not by rabbits: the claws are wrong.'],
        ['bramble', 'Who would carve rabbits, down here, if they weren\'t rabbits?', { mood: 'worried' }],
        anyOf(s, 'cheshire-cat') ? ['cheshire-cat', 'Someone who was watching them. For a very long time.'] : null,
        anyOf(s, 'mole') ? ['mole', 'I don\'t like it, Bramble. I know dark, and this isn\'t the friendly sort.'] : null,
      ]);
      s.save();
    }
    if (!flag('g_ch1_done')) s.quest(flag('g_c1_shallows_done') ? withNinefold('The Shallows are quiet now. The eye-stair leads back up.') : flag('g_recruit_ninefold') ? 'Face the mouths in the wall, deep in the room bigger inside.' : 'Go deeper: through the eye door, into the room beyond.');
    s.ex.enterBubble();
  },
  'c1w.shallows.whisper': async (s) => {
    if (flag('c1w_whisper')) return;
    s.set('c1w_whisper');
    s.voice('vo-whisper');
    await lines(s, [
      [null, 'Bramble stands still a moment, to listen. The dark leans closer.'],
      [null, '"...Bramble..."'],
      ['bramble', 'Who said that?', { mood: 'worried' }],
      [null, 'Nobody. The whisper came out of the stone itself, the way cold does. It knew his name. It said it kindly. That was the worst part.'],
      companion(s) ? [companion(s), 'Keep moving. Whatever you do, don\'t stand still too long down here.'] : null,
    ]);
  },
  'c1w.shallows.face': async (s) => {
    await cycle(s, 'face', [
      [[null, 'A carved face, smooth and patient, eyes shut. You could swear it was facing the other way a moment ago.']],
      [[null, 'The stone face is facing you now. Its eyes are still shut. You don\'t look away first. Neither does it.']],
      [[null, 'A face in the stone. Under it, scratched small, a little row of rabbit-tracks going down, and none coming back up.']],
    ]);
  },
  'c1w.shallows.pillar': async (s) => {
    await cycle(s, 'pillar', [
      [[null, 'Carved rabbits, one above the other. Digging. Every one of them is digging, and every one is looking down.']],
      [[null, 'The carver got the ears exactly right. The eyes are a little too round, and there are a few too many of them.']],
      [[null, 'One carved rabbit at the very top of the pillar is not digging. It\'s looking up, as if somebody had called its name.']],
    ]);
  },
  'c1w.shallows.up': async (s) => {
    const c = await s.ask('bramble', 'The eye-stair climbs back up to the Underway.', ['Go back up', 'Stay']);
    if (c === 0) await backToUnderway(s, 'stair');
  },
  'c1w.deep.enter': async (s) => {
    if (!flag('c1w_deep_seen')) {
      s.set('c1w_deep_seen');
      await lines(s, [
        [null, 'The door was small. The room behind it is not. It goes on much further than the hill above it could possibly hold.'],
        ['bramble', 'This room is bigger inside than its door.'],
        anyOf(s, 'caterpillar') ? ['caterpillar', 'Hm. I know a few rooms like that. They are always thinking about something.'] : null,
        [null, 'Far off, in the corner where the glow-crystals grow, something is sitting very, very still, the way you sit when you don\'t want to frighten anyone.'],
      ]);
      s.save();
    }
    if (!flag('g_ch1_done')) s.quest(flag('g_c1_shallows_done') ? withNinefold('The Shallows are quiet now.') : !flag('g_recruit_ninefold') ? 'Something is sitting very still in the far corner (south).' : 'Face the stone mouths at the far end of the room (east).');
    s.ex.enterBubble();
  },
  'c1w.ninefold': async (s) => {
    if (!flag('c1w_nf_met')) {
      s.set('c1w_nf_met');
      await lines(s, [
        [null, 'It is about the size of a badger, made of soft dark folds, and it has nine pale eyes. They open one at a time, politely.'],
        ['ninefold', 'Oh. Good evening. Please do not scream.'],
      ]);
      const c = await s.ask('bramble', 'Nine eyes look at Bramble, very hopefully.', ['"I wasn\'t going to."', '"...Good evening."', '(Scream, just a little.)']);
      if (c === 2) await lines(s, [['bramble', 'Eep.'], ['ninefold', 'That was a very small scream. I think it was mostly surprise. I accept it as a greeting.']]);
      else await lines(s, [['ninefold', c === 0 ? 'You... were not going to. Oh. Oh my.' : 'Good evening! It said good evening back. Nobody has ever said good evening back.']]);
      await lines(s, [
        ['ninefold', 'I am Ninefold. I live in the Shallows. Everybody who comes down here screams, and runs, and I sit in my corner and am very sorry about it.'],
        ['bramble', 'I\'m Bramble. From Thimblebank, right up at the top.'],
        ['ninefold', 'The TOP. Where the light is. Is it true that things grow up there? Out of the ground? On purpose?'],
        ['bramble', 'Grass. Clover. Dandelions...'],
        ['ninefold', 'Dandelions. I have heard of dandelions. A yellow one, like a little sun, that turns into a clock of white seeds. I have never seen one.'],
        ['ninefold', 'It is a lot to ask a stranger. But if you ever went up, and came down again, would you... bring me one?'],
      ]);
      s.set('c1w_nf_asked');
    }
    if (flag('g_recruit_ninefold')) return;
    if (!hasDandelion(s)) {
      await s.say('ninefold', 'A dandelion, from up top, where the light is. I will wait. I am very good at waiting. It is the main thing I do.');
      s.quest('Bring Ninefold a dandelion from the surface (Sorrel Down has them, by the warren mouth).');
      return;
    }
    const fresh = s.has('ninefold-dandelion');
    await lines(s, [
      ['bramble', fresh ? 'I went up. I picked it this morning, by the warren mouth, with the dew still on.' : 'I\'ve got one. It was picked up top, on the downs. It\'s a bit squashed from the journey.'],
      [null, 'He holds it out. One small yellow sun, in the darkest room in the world.'],
      [null, 'All nine eyes open, one after another, very wide.'],
    ]);
    s.voice('vo-dandelion');
    await lines(s, [
      ['ninefold', 'I have never been offered a dandelion before. I will keep it forever.'],
      ['bramble', 'They do go to seed, you know. Into little white clocks.'],
      ['ninefold', 'Then I will keep the clock forever. And the seeds. And the memory of this exact moment, which I am keeping now, very carefully.'],
      ['ninefold', 'Bramble of Thimblebank. There is a voice in the wall, beyond. It says true things that hurt. I think it is not well. I think it is dreaming badly.'],
      ['ninefold', 'May I come with you? I would like to see the top. And I would like to stand beside someone who did not scream.'],
    ]);
    if (fresh) s.take('ninefold-dandelion'); else s.take('dandelion');
    s.remember('mem-dandelion');
    await s.recruit('ninefold', { line: 'I have never been offered a dandelion before. I will keep it forever.', level: 10 });
    // Ninefold steps into the line (its presence keeps Afraid away from the Choir's words)
    const act = G.s.party.active.filter(id => id !== 'ninefold');
    setActive(['ninefold', act[0]]); s.ex.buildFollowers(true);
    s.remove('ninefold');
    await s.give({ buttons: 40 });
    await s.say(null, 'Ninefold travels with you now. While it is in the party, nobody can be made Afraid.');
    s.quest('Face the stone mouths at the far end of the room (east).'); s.save();
  },
  'c1w.choir': async (s) => {
    if (flag('c1w_choir_won')) return;
    if (!flag('c1w_choir_seen')) {
      s.set('c1w_choir_seen');
      s.sfx('choir-sting');
      await lines(s, [
        [null, 'At the end of the room the wall is not a wall. It is three great mouths of stone, shut. As Bramble comes near, they breathe in.'],
        ['choir', 'Your warren is cold tonight.'],
        ['bramble', 'What?', { mood: 'worried' }],
        ['choir', 'Your elder is half-blind, and the half that sees is frightened. Your best friend is humming. She has forgotten the colour of your ears.'],
        trav(s, 'ninefold') ? ['ninefold', 'Do not listen to how it says it. Listen to me instead. It is only true things said cruelly. That is all it has.'] : null,
        anyOf(s, 'badger') ? ['badger', 'Steady, Bramble. True or not, it\'s talking to frighten you. Don\'t give it the satisfaction.'] : null,
      ]);
    }
    const c = await s.ask('bramble', 'The three mouths open. One begins to glow.', ['Face the Choir', 'Not yet (step back)']);
    if (c !== 0) { s.place('bramble', 27, 5, 'ne'); return; }
    const r = await s.battle('c1w.choir');
    if (r !== 'win') return;
    s.set('c1w_choir_won');
    s.sfx('fade-sigh');
    await lines(s, [
      [null, 'The last mouth closes, slowly, like someone falling asleep mid-sentence. The whisper goes out of the stone.'],
      ['choir', '...we only... said what it dreams...'],
      [null, 'And with a long grinding sigh, the wall of mouths sinks into the floor. Behind it, carved across the whole of the rock, is a picture.'],
    ]);
    await s.picture('bg-mural', [
      'Rabbits, digging. A whole warren of them, digging down and down: Deepdelve, in the old days.',
      'Below the rabbits, the rock goes on. And in the rock lies a long, long shape, curled like a sleeping cat the size of the hills.',
      'And at the bottom of it all, one great eye. Half-open.',
    ]);
    await lines(s, [
      ['bramble', 'That\'s it. That\'s what\'s under everything. The Sleeper, in Yarrow\'s rhyme.'],
      trav(s, 'ninefold') ? ['ninefold', 'It is not wicked, Bramble. I have lived above it all my life. It is only... dreaming badly. And the Hum is the dream, leaking up.'] : null,
      ['bramble', '"When all the warrens thump as one, the Sleeper\'s dream is soft and done." Every warren. One thump.'],
      anyOf(s, 'cheshire-cat') ? ['cheshire-cat', 'What a large lullaby you will need.'] : null,
    ]);
    s.set('g_c1_shallows_done');
    s.remember('mem-dandelion');
    s.ex.map.props = s.ex.map.props.filter(p => p.id !== 'prop-stone-mouth');
    if (!s.ex.map.props.some(p => p.id === 'prop-mural-wall')) s.ex.map.props.push({ id: 'prop-mural-wall', x: 27, y: 1, w: 3, h: 1, whole: true });
    s.save();
    const f = G.data.scripts['c1.checkDone']; if (f) await f(s);
    if (!flag('g_ch1_done')) s.quest(withNinefold(flag('g_c1-rts1_won') ? 'Back up to Thimblebank.' : 'The Shallows are done. Gather the army at the Lookout Stone (Sorrel Down).'));
  },
  'c1w.mural': async (s) => {
    await s.picture('bg-mural', ['Deepdelve, digging. A long shape, sleeping. And an eye.']);
  },

  // ================================================================ THIMBLEBANK: the Wonderland friends and Ninefold visit
  'c1w.home.cat': async (s) => {
    await cycle(s, 'hcat', [
      [['cheshire-cat', 'Your warren is full of corners. I approve of corners. One can appear in them so effectively.']],
      [['cheshire-cat', 'The kits keep asking where I go when I vanish. I tell them: somewhere with fewer questions.']],
    ]);
  },
  'c1w.home.caterpillar': async (s) => {
    await cycle(s, 'hcater', [
      [['caterpillar', 'Your elder asked who I was. I asked who HE was. We have been at it for an hour. It is the best talk I have had in years.']],
      [['caterpillar', 'Hm. Everything up here is the wrong size. The ceiling especially. I am thinking of changing it.']],
    ]);
  },
  'c1w.home.ninefold': async (s) => {
    await cycle(s, 'hnf', [
      [['ninefold', 'I am sitting in a dark corner so as not to frighten anybody. A kit brought me a beetle. I did not scream either. We are even.']],
      [['ninefold', 'This warren has a smell. Clover and earth and warm rabbit. I did not know a smell could be a kindness.']],
    ]);
  },
  'c1w.home.wr': async (s) => {
    await cycle(s, 'hwr', [
      [['white-rabbit', 'A whole warren of rabbits who are NOT late for anything? I can\'t think how you manage it.']],
      [['white-rabbit', 'The Heralds are drilling on the downs. Mostly they drill at being on time. We have a long way to go.']],
    ]);
  },
  'c1w.pick-dandelion': async (s) => {
    if (s.has('ninefold-dandelion')) { await s.say(null, 'A patch of dandelions, nodding in the wind. You already have the best one, for Ninefold.'); return; }
    await s.narrate('A patch of dandelions by the warren mouth, bright as little suns. Bramble picks the finest one, with the dew still on.');
    await s.give({ 'ninefold-dandelion': 1 });
  },
};

// the Caucus-race marks
async function raceMark(s, i) {
  if (flag('c1w_race' + i) || !flag('c1w_caucus_on')) return;
  s.set('c1w_race' + i); s.sfx('buff');
  const n = raceCount();
  s.bubble(companion(s) || 'bramble', ['Round we go!', 'Faster! Or slower! Either!', 'Is that it? Did we win?'][n - 1], 2);
  if (n >= 3) { await finishRace(s); return; }
  s.toast(`Caucus-race: ${n} of 3`);
  quest(s);
}
// the White Rabbit gets his gloves and joins the army
async function wrJoin(s) {
  if (flag('g_recruit_white-rabbit')) return;
  await lines(s, [
    ['white-rabbit', 'My gloves! My fan! Oh, you\'re not Mary Ann at all. You\'re... a rabbit. A proper, ordinary, PUNCTUAL rabbit.'],
    ['bramble', 'I\'m Bramble. My warren\'s in trouble. I\'m looking for friends.'],
    ['white-rabbit', 'Trouble? A warren? Rabbits in trouble?'],
    [null, 'The White Rabbit stops fussing for the first time since Bramble saw him. His nose goes very still.'],
    ['white-rabbit', 'I\'m a herald, you know. The Queen\'s herald. I know how to blow a trumpet and run very fast and tell everybody where to be.'],
    ['white-rabbit', 'And I have never once been asked to do it for other rabbits. When your battle comes, my Heralds will be there. ON TIME.'],
  ]);
  await s.recruit('white-rabbit', { line: 'For a fellow rabbit, I shall not be late. Not even a little!' });
  await s.give({ buttons: 30 });
  await lines(s, [
    ['white-rabbit', 'Now: the Duchess! The croquet! Through the wood, that way! Oh, my ears and whiskers!'],
    [null, 'And off he scurries down the lane, toward the Mushroom Wood.'],
  ]);
  s.remove('white-rabbit');
  quest(s); s.save();
}
async function teaCheck(s) {
  if (!flag('c1w_riddle') || !flag('c1w_treacle') || flag('c1w_tea_done')) { if (!flag('c1w_tea_done')) s.quest(flag('c1w_riddle') ? 'Wake the Dormouse for his story.' : 'Answer the Hatter\'s riddle.'); return; }
  s.set('c1w_tea_done');
  s.remember('mem-teaparty');
  await lines(s, [
    ['hatter', 'Move down! Move down! Clean cups! Everybody move one place on!'],
    [null, 'They all shuffle along. Bramble ends up with the March Hare\'s plate, which has milk in it. Somebody pours him tea. It is, as always, six o\'clock.'],
    ['bramble', 'I don\'t think I\'ve ever been anywhere so silly.', { mood: 'happy' }],
    ['hatter', 'Thank you! Now off you go: there\'s a door in that tree. You\'ll be wanting the garden. Everybody always wants the garden.'],
    ['march-hare', 'Come back for tea! It\'s always tea-time. You can\'t miss it. You literally cannot.'],
    anyOf(s, 'mole') ? ['mole', 'That was the nicest muddle I\'ve ever had tea in. I\'m going to tell Ratty all about it.'] : null,
    anyOf(s, 'toad') ? ['toad', 'Capital fellows! I offered to buy the table. They said it was already moving.'] : null,
  ]);
  quest(s); s.save();
}
async function paintRose(s, i) {
  if (flag('g_recruit_seven-of-spades')) { await s.say(null, 'A rose bush, red as red. Nobody will ever know.'); return; }
  if (flag('c1w_rose' + i)) { await s.say(null, 'This one is red now. Mostly. A little pink at the edges.'); return; }
  if (!flag('c1w_roses_on')) { await s.say(null, 'A rose bush with white blooms, the only white roses in the whole garden. The gardeners look terrified of it.'); return; }
  s.set('c1w_rose' + i); s.sfx('splash-melt', { vol: 0.5 });
  await s.narrate(['Slap, slap, dab: one bush, red as a pillar-box.', 'Another bush done. The paint gets on Bramble\'s nose. And ears.', 'The last white rose goes red. Bramble is now partly red too.'][roseCount() - 1]);
  if (roseCount() >= 3) await rosesDone(s);
  else s.quest(`Paint the white rose bushes red: ${roseCount()} of 3.`);
}
async function rosesDone(s) {
  if (flag('g_recruit_seven-of-spades')) return;
  await lines(s, [
    ['seven-of-spades', 'All red! All red! Two, Five, look! Our heads are perfectly safe!'],
    ['two', 'For today.'],
    ['seven-of-spades', 'For today is plenty! Rabbit, you saved three cards from the chop. Whatever army you\'re raising, the Card Gardeners will dig for it.'],
    ['five', 'And paint. We\'re very good at painting things the colour they ought to be.'],
  ]);
  s.remember('mem-roses');
  await s.recruit('seven-of-spades', { line: 'Three white roses, painted red in time. The Card Gardeners are yours!' });
  await s.give({ buttons: 40, 'courage-ribbon+2': 1 });
  s.remove('seven-of-spades'); s.remove('two'); s.remove('five');
  quest(s); s.save();
}
async function runTrial(s) {
  if (flag('c1w_trial_done')) return;
  s.set('c1w_trial_done');
  await lines(s, [
    [null, 'The court: the King and Queen of Hearts on their thrones, a jury of twelve small creatures writing very hard on slates, and a plate of tarts in the middle.'],
    ['white-rabbit', 'Silence in the court! The Knave of Hearts, he stole those tarts, and took them quite away!'],
    ['king-of-hearts', 'Consider your verdict.'],
    ['white-rabbit', 'Not yet, not yet! There\'s a great deal to come before that!'],
    ['king-of-hearts', 'Call the first witness. Call... the rabbit who won at croquet.'],
    ['queen-of-hearts', 'Sentence first! Verdict afterwards!'],
  ]);
  const c = await s.ask('bramble', 'Everybody looks at Bramble. The Knave looks very hard at his own feet.', ['"Stuff and nonsense! He hasn\'t had a trial yet!"', '"The tarts are right there. Nobody took them away."', '"Who stole the tarts? Does it matter, if everyone gets one?"']);
  await lines(s, [
    ['bramble', ['Stuff and nonsense! You can\'t have the sentence first!', 'But the tarts are right there. On the plate. Nobody took them away at all.', 'Does it matter who stole them, if there\'s one for everybody?'][c]],
    ['queen-of-hearts', 'Hold your tongue! Off with his...'],
    ['king-of-hearts', '(very quietly) My dear. Count to ten.'],
    ['queen-of-hearts', '...one... two... ...ten. Hmph. Somebody pass the tarts.'],
    [null, 'The tarts go round the court. Everyone gets one. The Knave gets two, looks guilty, and gives one back. The jury writes down "TARTS: NICE".'],
    ['king-of-hearts', 'The court finds that everybody is pardoned, and the tarts were delicious. You are all dismissed. Especially the rabbit.'],
    ['king-of-hearts', 'Young Bramble. The White Rabbit tells me you have a warren in trouble, and a long way to go. Wonderland is not much use in a fight.'],
    ['king-of-hearts', 'But we can be loud, and we can be a muddle, and we are very good at running about. Whatever you need of us, you shall have.'],
    anyOf(s, 'cheshire-cat') ? ['cheshire-cat', 'There. Even the Queen came round. I told you it was all a matter of which way you go.'] : null,
    anyOf(s, 'caterpillar') ? ['caterpillar', 'Hm. A trial with no verdict and a great many tarts. The most sensible thing I have seen here.'] : null,
  ]);
  s.set('g_c1_wonder_done');
  s.sfx('victory');
  await s.narrate('Wonderland is done. On the Underway\'s eye-stair, a little carved keyhole begins to glow pink.');
  s.quest(G.data.maps['c1w-shallows'] && flag('g_c1_riverbank_done') ? 'Back to the Underway (rabbit-hole, south-west of the garden): the eye-stair is open.' : 'Back to the Underway: the rabbit-hole in the garden\'s south-west corner leads home.');
  s.save();
}
// a speaker for a bubble on a hop hook (no script api there)
function s0() { const t = G.s.party.active; return t[0] || 'bramble'; }
