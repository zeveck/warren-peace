// Chapter 1 story scripts: the Depths, the Underway (and underway.stone for everyone), the River Bank and its four
// recruits, the Chief Weasel's banquet, home briefly, and the Great Burrow after the Battle of Sorrel Down.
import { G } from '../../core.js';
import { flag, setFlag, getVal } from '../../state.js';
import { SCENT, MOLE_AT, escortingNow } from './maps-river.js';
import { withNinefold } from '../ch1w/util.js';

// ---------------------------------------------------------------- helpers
const lines = async (s, list) => { for (const l of list) { if (!l) continue; const [who, text, o] = l; if (who) await s.say(who, text, o || {}); else await s.narrate(text); } };
const trav = (s, id) => s.party().includes(id);
// a free floor tile near Bramble (for staging people on maps whose layout we don't own)
function near(s, dx, dy, taken = []) {
  const ex = s.ex, b = ex.b;
  for (let r = 0; r < 7; r++) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
    if (Math.max(Math.abs(xx), Math.abs(yy)) !== r) continue;
    const x = b.x + dx + xx, y = b.y + dy + yy;
    if (x === b.x && y === b.y) continue;
    if (!ex.walkable(x, y) || ex.followers.some(f => f.x === x && f.y === y) || ex.map.enemies.some(e => e.x === x && e.y === y)) continue;
    if (taken.some(t => t[0] === x && t[1] === y)) continue;
    if ((ex.map.def.doors || []).some(d => d.x === x && d.y === y)) continue;
    taken.push([x, y]); return [x, y];
  }
  return [b.x + 1, b.y];
}
function removeProp(s, test) { const ps = s.ex.map.props; const i = ps.findIndex(test); if (i >= 0) ps.splice(i, 1); }
export async function checkCh1Done(s) {
  if (flag('g_ch1_done') || !flag('g_c1-rts1_won') || !flag('g_c1_shallows_done') || !flag('g_freed_thimblebank')) return false;
  s.set('g_ch1_done'); s.save();
  s.sfx('victory');
  await s.narrate('The River Bank, Wonderland, the Shallows, and Thimblebank\'s own hill: all of it, done. Chapter 1 is complete.');
  await s.say('bramble', 'Tansy went on to Silverdown. So that\'s where we go next. From the Lookout Stone.');
  s.quest(withNinefold('Chapter 2: go to the Lookout Stone. Silverdown is next.'));
  return true;
}
function underwayQuest() { return withNinefold(underwayQuest0()); }
function underwayQuest0() {
  if (!flag('g_c1_riverbank_done') && !flag('g_c1_wonder_done')) return 'Two doors are open: the river door and the keyhole door.';
  if (!flag('g_c1_riverbank_done')) return 'The river door: find friends on the River Bank.';
  if (!flag('g_c1_wonder_done')) return 'The keyhole door: find friends in Wonderland.';
  if (!flag('g_c1_shallows_done') && !flag('g_c1-rts1_won')) return 'Both symbols glow. The eye-stair is open, and the army can gather at the Lookout Stone.';
  if (!flag('g_c1_shallows_done')) return 'Go down the eye-stair into the Shallows.';
  if (!flag('g_c1-rts1_won')) return 'Gather the army at the Lookout Stone: take back Sorrel Down.';
  return '';
}

export const scripts = {
  // ================================================================ THIMBLEBANK DEPTHS
  'c1.depths.enter': async (s) => {
    s.set('c1_in_depths');
    if (!flag('c1_card')) {
      s.set('c1_card'); s.chapter(1);
      await s.chapterCard('The Depths of Thimblebank', 'Chapter 1', 'bg-battle-depths');
      await lines(s, [
        [null, 'Below the old door the tunnels are older than any Bramble knows: wider, rootier, smelling of stone and of something else. Something patient.'],
        ['bramble', 'These aren\'t our tunnels. Who dug these?', { mood: 'worried' }],
        s.member('burdock') ? ['burdock', 'Rabbits, a long time ago. Look at the claw marks. Same as mine, only older.'] : null,
        s.member('burdock') ? ['burdock', 'Hmph. Stay where I can see your ears.'] : null,
      ]);
      s.quest('Follow the old tunnels down. Find friends.');
      s.save();
    }
    s.ex.enterBubble();
  },
  'c1.depths.tip': async (s) => {
    await lines(s, [
      ['burdock', 'Something moving down there. Earthworms, by the wriggle. Gone strange and dozy.'],
      ['burdock', 'In a scrap, your skills cost Pluck. Thump\'s a good one. Guard halves what you take and gets you a bit of Pluck back.'],
      ['burdock', 'And clover bunches are for eating, not for keeping in your cheek. Use them if you\'re hurt.'],
      ['bramble', 'And if it all goes wrong?'],
      ['burdock', 'Down here? Run. Nothing in these tunnels is quick enough to follow a rabbit.'],
    ]);
  },
  'c1.depths.roots': async (s) => {
    s.ambience('hum', 0.2);
    await lines(s, [
      [null, 'A great cavern of roots. Somewhere under the floor, very faint, the hum from behind the door: lower here, and steadier.'],
      ['bramble', 'Can you hear that? Like the ground breathing out.', { mood: 'worried' }],
      s.member('burdock') ? ['burdock', 'I hear it. I\'m choosing not to listen.'] : null,
    ]);
    s.ambience('hum', 0.08);
  },
  'c1.depths.carving': async (s) => {
    await lines(s, [
      [null, 'Scratched into the old stones: three shapes in a row. A wavy line. A little keyhole. And an eye, shut tight.'],
      ['bramble', 'Three doors. Somebody drew a map for us, once.'],
    ]);
  },

  // ================================================================ THE UNDERWAY
  'c1.underway.enter': async (s) => {
    s.set('g_underway_c1');
    if (!flag('c1_underway_seen')) {
      s.set('c1_underway_seen');
      s.sfx('shimmer', { vol: 0.5 });
      await lines(s, [
        [null, 'The tunnel opens into a round cavern, smooth as the inside of an egg. Three carved doors stand around its edge.'],
        [null, 'One is carved with a river. One is only a keyhole, much too small for anyone. The third is a stair, sealed with a great shut eye.'],
        ['bramble', 'A river door. A keyhole door. And... that one.'],
        s.member('burdock') ? ['burdock', 'The eye one can stay shut, thank you.'] : null,
        [null, 'In the middle of the cavern sits a stone furred with moss, warm to the touch. It feels like a place to rest.'],
        ['bramble', 'Yarrow said: below, there are others. Find friends. Then these doors go to friends.'],
      ]);
      s.save();
    }
    s.quest(underwayQuest() || G.s.quest);
    if (await checkCh1Done(s)) return;
    s.ex.enterBubble();
  },
  'c1.underway.keyhole': async (s) => {
    if (G.data.maps['c1w-hall']) {
      if (!flag('c1_keyhole_seen')) {
        s.set('c1_keyhole_seen');
        await lines(s, [[null, 'Bramble kneels to peer through the keyhole. On the other side: a garden, very bright, very far down.'], [null, 'He leans closer. And closer. And then the floor isn\'t there at all.']]);
      }
      await s.warp('c1w-hall', 'fall');
      return;
    }
    await s.say(null, 'Through the keyhole: a lovely garden, impossibly bright. But the keyhole is far too small for a rabbit. (Not open yet.)');
  },
  'c1.underway.eye': async (s) => {
    const a = flag('g_c1_riverbank_done'), b = flag('g_c1_wonder_done');
    if (a && b && G.data.maps['c1w-shallows']) {
      if (!flag('c1_eye_open')) {
        s.set('c1_eye_open'); s.sfx('door-grind'); s.shake(1.0, 2);
        await lines(s, [
          [null, 'Both carved symbols are glowing: the river, and the keyhole. With a long stone sigh, the shut eye on the door... opens.'],
          [null, 'Behind it, a stair goes down into a darkness that is smoother and blacker than any dark should be.'],
          ['bramble', 'Down, then. Stay close, everyone.', { mood: 'worried' }],
        ]);
      }
      await s.warp('c1w-shallows', 'top');
      return;
    }
    const lit = [a ? 'the wavy river glows a soft blue' : 'the wavy river is dark', b ? 'the little keyhole glows pink' : 'the little keyhole is dark'];
    await s.say(null, `A stair sealed with a great shut eye. Two symbols are carved beside it: ${lit[0]}, and ${lit[1]}.`);
    if (a && b) await s.say(null, 'The eye trembles, as if it wants to open. (The way beyond isn\'t ready yet.)');
    else await s.say('bramble', 'Two symbols, two doors. I think it wants us to go through both of them first.');
  },
  // every Underway's mossy stone: rest, then travel between known Underways (for every chapter)
  'underway.stone': async (s) => {
    await s.rest();
    const names = { 'c1-underway': 'Thimblebank\'s Underway', 'c2-underway': 'Silverdown\'s Underway', 'c3-underway': 'Wheatsheaf\'s Underway', 'c4-underway': 'Flintcomb\'s Underway' };
    const here = s.ex.map.id;
    const known = [1, 2, 3, 4].map(n => `c${n}-underway`).filter((id, i) => flag('g_underway_c' + (i + 1)) && G.data.maps[id] && id !== here);
    if (!known.length) return;
    const c = await s.ask(null, 'The moss is warm, and under it the stone hums a little: the Underways are linked. Travel to another Underway?', ['Stay here', ...known.map(id => names[id] || G.data.maps[id].name)]);
    if (c > 0) { s.sfx('shimmer'); await s.warp(known[c - 1], 'stone'); }   // 'Stay here' first, so a double Space never warps
  },
  'c1.rest': async (s) => { await s.say(null, 'A mossy stone, warm as a sleeping animal. A good place to rest before whatever comes next.'); await s.rest(); },

  // ================================================================ THE RIVER BANK
  'c1.riverbank.enter': async (s) => {
    if (!flag('c1_rb_seen')) {
      s.set('c1_rb_seen');
      await lines(s, [
        [null, 'Sunlight! Bramble blinks. The river door has let out onto a river bank in high summer, all willows and dragonflies and the chuckle of water.'],
        ['bramble', 'We\'re outside. But we went down. Didn\'t we go down?', { mood: 'happy' }],
        s.member('burdock') ? ['burdock', 'Hmph. Don\'t ask the sky questions. It never answers.'] : null,
      ]);
      s.quest('Find whoever lives on the River Bank. There\'s someone by that hole near the water.');
      s.save();
    }
    if (flag('g_recruit_mole') && !flag('c1_mem_river')) { await scripts['c1.mole.river'](s); return; }
    if (flag('c1_toad_fled') && !flag('c1_toad_unmasked') && !flag('c1_ww_seen_wash')) {
      s.set('c1_ww_seen_wash');
      await s.say(null, 'Down by the weir there\'s a large washerwoman with a large bucket, scrubbing nothing at all, rather loudly.');
    }
    s.ex.enterBubble();
  },
  'c1.mole.river': async (s) => {
    s.set('c1_mem_river');
    await lines(s, [
      [null, 'Mole stops dead on the bank. He has never, in all his life, seen a river.'],
      ['mole', 'Oh. Oh my.'],
      ['mole', 'It\'s... going somewhere. All of it, all at once, and it\'s laughing about it.'],
      ['mole', 'Glints and gleams and sparkles, and that rustle and swirl! I could sit by it for ever and ever.'],
      flag('g_recruit_ratty') ? ['ratty', 'There\'s nothing, absolutely nothing, half so much worth doing as simply messing about by a river, old chap.'] : null,
    ]);
    const c = await s.ask('bramble', '', ['It\'s beautiful.', 'You\'ve really never seen one?']);
    await s.say('bramble', c === 0 ? 'It\'s beautiful. I\'m glad you saw it with us.' : 'You\'ve really never seen one? Then today\'s a good day.', { mood: 'happy' });
    await s.say('mole', 'I shall remember this. Whatever happens. I shall keep it.');
    s.remember('mem-river');
    s.toast('A memory: the river');
    s.ex.enterBubble();
  },
  'c1.ratty.talk': async (s) => {
    if (!flag('c1_metRatty')) {
      s.set('c1_metRatty');
      await lines(s, [
        ['ratty', 'Hullo! A rabbit! Two rabbits! Come out of the old bank-door, have you? Nobody\'s come through that in years.'],
        ['bramble', 'I\'m Bramble. From Thimblebank, above. Or below. It\'s complicated.'],
        ['ratty', 'Everything worth anything is. I\'m the Water Rat. Ratty, to friends, and you look like friends.'],
        ['ratty', 'You\'ve caught me in a fix, though. Look there: my boat, stuck fast behind the weir.'],
        ['ratty', 'Logs came down in the night and wedged themselves across the weir walk. Three great lumps of them.'],
        ['ratty', 'And there\'s a funny dark feeling in the water lately. The weasels are jumpy. Things washing down that oughtn\'t.'],
        ['ratty', 'Worse: Mole went up into the Wild Wood two days ago, and he hasn\'t come home. I can\'t get across to look for him without my boat.'],
      ]);
      const c = await s.ask('bramble', '', ['We\'ll shift those logs.', 'Two days? We should hurry.']);
      await s.say('bramble', c === 0 ? 'We\'ll shift those logs. Rabbits are good at shoving.' : 'Two days? Then we\'d better hurry. Logs first.');
      await s.say('ratty', 'Would you? Oh, splendid! Walk out along the weir from this side and give them a good shove. Mind the splash!');
      s.quest('Shove the three logs off the weir to free Ratty\'s boat.');
      return;
    }
    await s.say('ratty', ['Three logs on the weir walk. Shove from the bank side, and mind the splash!', 'Poor old boat. She hates being kept from the water.'][(G.s.playTime | 0) % 2]);
  },
  'c1.weir.log': async (s) => {
    if (!flag('c1_metRatty')) { await s.say(null, 'Three big logs are jammed across the weir walk. Somebody\'s boat is stuck behind them. Whose, though?'); return; }
    const f = s.ex.facingTile(); const n = f.y === 16 ? 1 : f.y === 14 ? 2 : 3;
    if (flag('c1_log' + n)) return;
    s.ex.b.nibbleT = -1;
    s.sfx('thump-1'); s.shake(0.3, 2); await s.wait(0.3);
    const words = ['Bramble sets his shoulder to the log and shoves. It rolls, wobbles... and drops into the river with a tremendous SPLASH.', 'Heave! The second log groans, tips, and goes over the weir in a burst of spray.', 'The last log is the biggest. Bramble digs his back feet in, thinks of Burdock, and SHOVES.'];
    await s.say(null, words[n - 1]);
    s.sfx('bridge-crash', { vol: 0.6 }); s.sfx('water-step');
    removeProp(s, p => p.id === 'prop-weir-logs' && p.log === n);
    s.set('c1_log' + n);
    if (n === 1 && s.member('burdock')) s.bubble('burdock', 'Hmph. Not bad. Keep your back straight.');
    if (n === 2) s.bubble('bramble', 'One more!');
    if (n < 3) { s.quest(`Shove the logs off the weir (${3 - n} left).`); return; }
    // the boat is free
    await s.fadeOut(0.5);
    removeProp(s, p => p.id === 'prop-boat');
    s.ex.map.props.push({ id: 'prop-boat', x: 10, y: 13, w: 2, h: 1 });
    const [rx, ry] = near(s, 0, 2);
    s.spawn({ id: 'ratty', x: rx, y: ry, facing: 'ne' });
    await s.fadeIn(0.5);
    await lines(s, [
      [null, 'The boat bobs free and spins gently round, as if it\'s stretching. Ratty comes scampering along the bank.'],
      ['ratty', 'She\'s free! Oh, you marvellous, shoving rabbit!'],
      ['ratty', 'Now. You\'re looking for friends, and I\'m looking for a Mole. Seems to me we\'d do better looking together.'],
      ['ratty', 'Besides, I know the Wild Wood a bit. And nobody should go into it at dusk without a Rat.'],
    ]);
    s.remove('ratty');
    await s.recruit('ratty', { line: 'Believe me, there is nothing half so much worth doing as messing about in boats. Or on adventures!', level: 5 });
    await s.give({ buttons: 25, dandelion: 1 });
    await s.say('ratty', 'A thank-you from the hamper. Otter minds my swap shop while I\'m out. Tell him I sent you.');
    s.quest('Ratty\'s friend Mole is lost in the Wild Wood. Cross the weir and take the path east.');
    s.save();
  },
  'c1.otter.talk': async (s) => {
    if (!flag('c1_otter_met')) {
      s.set('c1_otter_met');
      await lines(s, [['otter', 'Afternoon! Otter. I keep Ratty\'s Riverside Swap when he\'s off dreaming in his boat.'], ['otter', 'Buttons, is it? We take buttons. Shiny ones especially.']]);
    } else await s.say('otter', flag('g_c1_riverbank_done') ? 'Toad Hall back where it belongs! The whole river\'s talking. What\'ll it be?' : 'What\'ll it be, then? Fair trades, no weasels.');
    await s.shop('c1.ratty-shop');
  },
  'c1.rb.roadlocked': async (s) => {
    if (flag('g_recruit_ratty')) await s.say('ratty', 'That road goes to Toad Hall. Toad can wait; Toad always waits, noisily. Mole first, and I\'d want Badger\'s say-so too.');
    else await s.say(null, 'A road runs west along the bank toward a great house. It can wait.');
  },

  // ================================================================ THE WILD WOOD
  'c1.wildwood.enter': async (s) => {
    if (escortingNow('mole') || escortingNow('hedgehog-1') || escortingNow('hedgehog-2')) { s.ex.enterBubble(); return; }
    if (!flag('g_ch1_done')) s.quest(wildQuest());   // later chapters own the quest line
    s.ex.enterBubble();
  },
  'c1.ww.dusk': async (s) => {
    s.ambience('hum', 0.2);
    await lines(s, [
      [null, 'Through the gate it is suddenly winter, and evening. Snow lies thick between the trees. The light is going much too fast.'],
      ['bramble', 'It was summer a step ago!', { mood: 'worried' }],
      flag('g_recruit_ratty') ? ['ratty', 'The Wild Wood keeps its own weather. But it was never as dark as this. Not this early.'] : null,
      flag('g_recruit_ratty') ? ['ratty', 'Listen. Under the wind. Something humming.'] : null,
      ['bramble', 'The Hum. It\'s here too.', { mood: 'worried' }],
      s.member('burdock') ? ['burdock', 'Then it\'s further from home than we hoped. Keep together.'] : null,
    ]);
    s.ambience('hum', 0.08);
  },
  'c1.ww.scent': async (s) => {
    s.set('c1_scent_on');
    await lines(s, [
      ['ratty', 'Wait. Sniff. Sniff! There, in the snow... smell that?'],
      ['bramble', 'Warm. Like toast, and old books, and somebody\'s front room.'],
      ['ratty', 'That\'s Mole! He leaves a trail without meaning to; he can\'t help being cosy.'],
      [null, 'A faint warm shimmer glows on the snow ahead. Only one at a time, and only close by.'],
    ]);
    s.quest('Follow Mole\'s warm scent through the thicket, one shimmer at a time.');
  },
  'c1.mole.found': async (s) => {
    if ((getVal('c1_scent') || 0) < SCENT.length) return;
    s.set('c1_mole_found');
    await lines(s, [
      [null, 'Huddled in the snow under a bank is a small, velvety, very cold person in a waistcoat.'],
      ['mole', 'Oh! Oh my! Who\'s there? Not a weasel? Please don\'t be a weasel.'],
      ['bramble', 'Just a rabbit. Bramble. Ratty sent us. Well, Ratty came too.'],
      flag('g_recruit_ratty') ? ['ratty', 'Moly! You silly, splendid animal! Two days!'] : null,
      ['mole', 'Ratty! I only came to see the snow. And then it got dark, and the trees all looked the same, and the humming started...'],
      ['mole', 'And then, just now, I smelt it. Home! My own little home, Mole End. It\'s here, it\'s right here somewhere, and I can\'t find the door!'],
    ]);
    const c = await s.ask('bramble', '', ['Then let\'s dig.', 'Rabbits are good at doors.']);
    await s.say('bramble', c === 0 ? 'Then let\'s dig. Everyone, the bank!' : 'Leave it to us. Rabbits are very good at finding doors.');
    await s.fadeOut(0.4); s.sfx('thump-1'); await s.wait(0.25); s.sfx('thump-2'); await s.wait(0.25); s.sfx('thump-1');
    s.ex.map.props.push({ id: 'prop-mole-end-door', x: 32, y: 1, w: 1, h: 1 });
    await s.fadeIn(0.4);
    s.sfx('chest-open');
    await lines(s, [
      [null, 'Snow flies. And there, under a drift: a little round green door, with "MOLE END" painted over it in gothic letters.'],
      ['mole', 'Oh! Oh, my dear old home! I\'ve been so neglectful of you!'],
    ]);
    s.remove('mole');
    s.escort('mole', true, { sprite: 'mole' });
    s.quest('Go into Mole End with Mole.');
  },
  'c1.mole.again': async (s) => { await s.say('mole', 'Home! Come in, come in, all of you. I\'ll find some candles.'); s.remove('mole'); s.escort('mole', true, { sprite: 'mole' }); s.quest('Go into Mole End with Mole.'); },
  'c1.moleend.door': async (s) => {
    if (!flag('g_recruit_mole') && !escortingNow('mole')) { await s.say(null, 'Mole End\'s little green door. It wouldn\'t feel right going in without Mole.'); return; }
    await s.warp('c1-mole-end', 'door');
  },
  'c1.moleend.enter': async (s) => {
    if (!flag('g_recruit_mole') && escortingNow('mole')) {
      await lines(s, [
        [null, 'Mole End is small and dusty and a little sad, the way a home gets when it\'s been left alone. Mole rushes about lighting candles.'],
        ['mole', 'It\'s a poor little place, I know. Not like your warren, I expect. Not like Ratty\'s fine bank.'],
        ['bramble', 'It\'s lovely. It smells like you.', { mood: 'happy' }],
        [null, 'Then, outside in the snow: a shuffle of small feet, a cough, a "one, two, three"... and voices.'],
      ]);
      const taken = [];
      for (let i = 0; i < 4; i++) { const [x, y] = near(s, 1 + i % 2, 1, taken); s.spawn({ id: 'caroller-' + i, sprite: 'caroller', x, y, facing: 'nw' }); }
      s.sfx('wake-chime', { vol: 0.5 });
      await lines(s, [
        ['caroller', '"Snow lies deep on the wood and the weir, the lamps are lit and the year turns round..."'],
        ['caroller', '"...and every lost one, far or near, is coming home on the frozen ground."'],
        ['caroller', '"So knock at the door that you know so well: the hearth is warm, and all is well."'],
        [null, 'The field mice stand in a half-ring with their lantern, scarves up to their noses. They sing every verse, and then sing the first one again, in case.'],
        ['mole', 'Oh. Oh, they came. Every year they come, and I thought this year, with the dark and the humming...'],
        ['caroller', 'We always come to Mole End, Mr. Mole. Even if it\'s dark. Especially then.'],
      ]);
      const c = await s.ask('bramble', '', ['Thank you for singing.', 'Will you come with us?']);
      if (c === 1) await lines(s, [['bramble', 'Mole. There\'s a dark coming up under my warren too. Will you come with us?'], ['mole', 'Me? I\'m not brave, you know. I\'m not brave at all.']]);
      else await lines(s, [['bramble', 'Thank you for singing. I think it\'s the warmest thing I\'ve ever heard.'], ['mole', 'Bramble... you came all this way into the dark for somebody you\'d never met.']]);
      await lines(s, [
        ['mole', 'Somebody has to make sure everyone gets home. I think... I think I\'d like to help with that.'],
        ['caroller', 'We\'ll come too, sir! We can sing at things! And carry lanterns!'],
      ]);
      s.escort('mole', false);
      await s.recruit('mole', { line: 'Hang spring-cleaning! Somebody has to make sure everyone gets home.', level: 5 });
      for (let i = 0; i < 4; i++) s.remove('caroller-' + i);
      await s.give({ buttons: 30, 'clover-bunch': 2 });
      await s.say('mole', 'From my store cupboard. I\'ve been saving it for a special occasion, and I think this is one.');
      await s.say('mole', 'And you\'ll all have a rest before you go back out. Bed\'s just there, by the wall. Rest whenever you like.');
      s.heal();
      if (!flag('c1_hogs_home')) await s.say('ratty', 'Now, I heard little voices crying in the wood on our way. Badger\'s house is nearby, at the north-west. He\'d know what to do.');
      s.quest(wildQuest());
      s.save();
      return;
    }
    s.ex.enterBubble();
  },
  'c1.hog.talk': async (s, a) => {
    const id = a && a.id || 'hedgehog-1';
    const first = !flag('c1_hog_any');
    s.set('c1_hog_any');
    if (id === 'hedgehog-1') await lines(s, [['hedgehog', 'Please, sir, we\'re lost! Me and my brother were sent to school and the snow came and it all went dark and humming...'], ['hedgehog', 'Mother said if ever we were lost, go to Mr. Badger\'s. But I can\'t find it. And now I can\'t find my brother neither.']]);
    else await lines(s, [['hedgehog', 'Who\'s that? Oh! Rabbits! Have you seen my brother? He\'s littler than me and he cries more.'], ['hedgehog', 'Mr. Badger\'s door is somewhere up the north-west way, by the big bank. I\'m sure of it. Nearly sure.']]);
    if (first) await s.say('bramble', 'Stay right behind me. We\'ll take you to Badger\'s.');
    else await s.say('bramble', 'Come on. Your brother\'s with us. Badger\'s next.');
    s.remove(id);
    s.escort(id, true, { sprite: 'hedgehog', kid: true });
    s.quest(wildQuest());
  },
  'c1.badger.door': async (s) => {
    if (flag('c1_hogs_home') || flag('g_recruit_badger')) { await s.warp('c1-badger', 'door'); return; }
    const both = escortingNow('hedgehog-1') && escortingNow('hedgehog-2');
    s.sfx('thump-2', { vol: 0.6 });
    if (!both) {
      await s.say(null, 'A stout door in the side of a bank, with a bell-pull and a boot-scraper. Bramble knocks. A long pause.');
      await s.say('badger', '(from deep inside) Who is it, at this time of night? Go away. Come back in the morning, and bring a reason.');
      if (escortingNow('hedgehog-1') || escortingNow('hedgehog-2')) await s.say('hedgehog', 'We can\'t go in without my brother! Mother would skin us. Well, prickle us.');
      return;
    }
    await lines(s, [
      [null, 'Bramble knocks. A long pause. Then shuffling, grumbling, and the door opens a crack.'],
      ['badger', 'Who is it, at this time of night, in this weather? Some rabbits? And... bless me. Hedgehogs!'],
      ['hedgehog', 'Please, Mr. Badger, sir! We was lost, and these rabbits found us!'],
      ['badger', 'Lost in the Wild Wood at dusk, with the dark the way it is this winter? Come in, all of you. In, in. Never mind the snow on your feet.'],
    ]);
    s.escort('hedgehog-1', false); s.escort('hedgehog-2', false);
    s.set('c1_hogs_home');
    await s.warp('c1-badger', 'door');
    await lines(s, [
      [null, 'Badger\'s kitchen is the warmest place Bramble has ever been: a great fire, a long table, hams hanging from the rafters, and a settle by the hearth.'],
      [null, 'The two hedgehog lads are sat down to porridge before they can say thank you, and say it anyway, with their mouths full.'],
      ['badger', 'Now. Rabbits, a long way from any warren. You\'d better tell me why.'],
      ['bramble', 'Our warren was attacked. By rabbits with blank eyes, humming. They took my friend Tansy. There\'s a dark under everything, and it\'s coming up.'],
      ['badger', 'Hm. Hmm. The dark under the Wild Wood this winter. The weasels gone savage. The humming in the roots.'],
      ['badger', 'I am not fond of Society. I do not go out. But I will not sit by my fire while young creatures are taken from their homes.'],
      flag('g_recruit_ratty') ? ['ratty', 'Badger! You\'ll come? You never come anywhere!'] : null,
      ['badger', 'I am coming because it is right, Ratty, not because it is pleasant. There is a difference, and you would do well to learn it.'],
    ]);
    s.remove('badger');
    await s.recruit('badger', { line: 'I don\'t care for Society. But nobody takes the young ones while I\'m about.', level: 6 });
    s.set('c1_badger_gift'); await s.give({ buttons: 30, 'carrot-cake': 1 });
    await s.say('badger', 'Take that; you\'ll need feeding. And mind: there are stairs behind my larder to an old buried city. Very old. Very useful.');
    s.quest(flag('g_recruit_mole') ? 'Toad is in trouble on the road to Toad Hall, west of the River Bank.' : wildQuest());
    s.save();
  },
  'c1.moleend.bed': async (s) => {
    if (!flag('g_recruit_mole')) { await s.say(null, 'A little bed of moss, very neatly made. It isn\'t yours to sleep in.'); return; }
    await s.say('mole', 'Have a lie down! Everyone! There\'s room if you squash, and the fire\'s lit.');
    await s.rest();
  },
  'c1.badger.settle': async (s) => {
    if (!flag('c1_hogs_home')) return;
    await s.say(null, 'The settle by Badger\'s fire is deep and warm. Nobody could sit in it for long without nodding off.');
    await s.rest();
  },
  'c1.badger.talk': async (s) => {
    // fallback: the hedgehogs are home but Badger never joined (an old save cut mid-scene): he joins now
    if (flag('c1_hogs_home') && !flag('g_recruit_badger')) {
      await s.say('badger', 'You brought those lads home through the Wild Wood at dusk. I will not sit by my fire while young creatures are taken from their homes.');
      s.remove('badger');
      await s.recruit('badger', { line: 'I don\'t care for Society. But nobody takes the young ones while I\'m about.', level: 6 });
      if (!flag('c1_badger_gift')) { s.set('c1_badger_gift'); await s.give({ buttons: 30, 'carrot-cake': 1 }); }
      await s.say('badger', 'And mind: there are stairs behind my larder to an old buried city. Very old. Very useful.');
      s.quest(flag('g_recruit_mole') ? 'Toad is in trouble on the road to Toad Hall, west of the River Bank.' : wildQuest());
      s.save();
      return;
    }
    await s.say('badger', 'Sit by the fire. Nobody talks business before porridge.');
  },
  'c1.hog.breakfast': async (s, a) => {
    const done = flag('g_c1_riverbank_done');
    const L = a && a.id === 'hedgehog-2'
      ? (done ? ['I\'m going to be a Hedgehog when I grow up. A proper one, in Mr. Badger\'s army!', 'Mr. Toad came to tea and talked the whole time. Mr. Badger said "Toad" in his growly voice.'] : ['Thank you for finding us. I wasn\'t scared. I was a bit scared.', 'This is my third bowl of porridge. Mr. Badger says growing hedgehogs need four.'])
      : (done ? ['Mr. Badger says all our cousins can march with you. We\'re ever so prickly when we try.', 'Our mother came and fetched us. Then she stayed for supper.'] : ['Mr. Badger says we\'re to stay put till the snow stops. I don\'t mind. There\'s toast.', 'Is it true you\'re rabbits from up the top? Is it nice up there?']);
    await s.say('hedgehog', L[(G.s.playTime | 0) % 2]);
  },
  'c1.badgerhouse.enter': async (s) => {
    if (flag('c1_toad_unmasked') && !flag('g_recruit_toad') && escortingNow('toad') && !flag('c1_badger_tunnel_said')) {
      s.set('c1_badger_tunnel_said');
      await lines(s, [['badger', 'Through the larder and down the stairs. The old city runs right under the river and comes up beneath Toad Hall\'s butler\'s pantry.'], ['toad', 'A secret passage! Into my own house! Oh, this is famous!'], ['badger', 'Quietly, Toad.']]);
    }
    if (escortingNow('toad')) s.quest('Down the stairs behind Badger\'s larder (east wall) to the buried city.');
    s.ex.enterBubble();
  },
  'c1.toad.badgers': async (s) => { await s.say('toad', 'Ready when you are! Ready ages ago, actually!'); s.remove('toad'); s.escort('toad', true, { sprite: 'toad' }); s.quest('Take Toad down through Badger\'s buried city to the secret tunnel.'); },
  'c1.city.enter': async (s) => {
    await lines(s, [
      [null, 'Below Badger\'s larder lie streets: old flagstones, broken columns, an archway with nothing on either side of it.'],
      flag('g_recruit_badger') ? ['badger', 'People built a city here, once. They came, they stayed, they went. We badgers stayed. We always do.'] : null,
      ['bramble', 'It\'s like the Depths, but somebody lived in it on purpose.'],
    ]);
    if (flag('c1_toad_unmasked') && !flag('c1_chief_beaten')) s.quest('Follow the buried street to the low door at its far end: the secret tunnel to Toad Hall.');
  },
  'c1.tunnel.locked': async (s) => {
    await s.say(null, 'A low old door at the end of the buried street, its handle green with age. It leads somewhere under the river.');
    if (flag('g_recruit_badger')) await s.say('badger', 'That goes under Toad Hall. We\'ll have no need of it unless Toad gets himself into trouble. Which he will.');
  },

  // ================================================================ TOAD
  'c1.road.enter': async (s) => {
    if (!flag('c1_road_seen')) {
      s.set('c1_road_seen');
      await lines(s, [
        [null, 'The road runs along the river to a great handsome house of old red brick, with lawns down to the water: Toad Hall.'],
        [null, 'And across the road, upside down in the hedge with its wheels still spinning: a motor-car. Something in it is shouting.'],
        flag('g_recruit_ratty') ? ['ratty', 'Oh, Toad. Oh, Toad, not again.'] : null,
      ]);
      s.quest('Someone is stuck in the wrecked motor-car on the road.');
    }
    s.ex.enterBubble();
  },
  'c1.toad.car': async (s) => {
    await lines(s, [
      ['toad', 'Poop-poop! Help! Help! Is that a rescuer? Rescue me, then! I am Toad, of Toad Hall, and I am stuck in a hedge!'],
      ['bramble', 'Hold still! Everybody grab a leg. On three!'],
    ]);
    s.sfx('thump-1'); s.shake(0.4, 2); await s.wait(0.4); s.sfx('thump-2'); s.shake(0.4, 3); await s.wait(0.4);
    await lines(s, [
      [null, 'One... two... THREE! Toad comes out of the motor-car like a cork from a bottle and lands on the road in a heap.'],
      ['toad', 'Saved! Saved by... rabbits? Never mind. I am alive, and so is my genius!'],
      ['toad', 'I had only gone out for a little spin. Forty miles an hour. Possibly sixty. And while I was out, the weasels took my Hall!'],
      ['toad', 'Took it! Toad Hall! They\'re in there now, feasting on my food, sleeping in my beds, wearing my waistcoats!'],
      flag('g_recruit_badger') ? ['badger', 'Toad. Stop. We will make a plan.'] : null,
      ['toad', 'A plan? I am TOAD! I shall march up to my own front door and demand it back!'],
    ]);
    const tx = s.actor('toad');
    if (tx) { await s.move('toad', [[26, 14], [25, 14], [24, 14], [23, 14], [22, 14], [21, 14], [20, 14], [19, 14], [18, 14], [17, 14], [16, 14]], 0.14); }
    s.remove('toad');
    await s.fadeOut(0.3);
    s.sfx('hit-1'); await s.wait(0.3); s.sfx('hit-2'); await s.wait(0.2);
    await s.fadeIn(0.3);
    await lines(s, [
      [null, 'There is a shout of "Open up, you villains!", a lot of weasel laughter, a smart smack, and a cry of "Unhand me!" from up the drive.'],
      [null, 'Then a large green shape goes hurtling away over the hedge toward the river, and is gone.'],
      flag('g_recruit_ratty') ? ['ratty', 'Well. That went about as well as Toad\'s plans always go.'] : null,
      flag('g_recruit_badger') ? ['badger', 'He\'ll be lying low somewhere near water. Toads always do, when they\'ve been foolish. Let us look by the river.'] : null,
    ]);
    s.set('c1_toad_met'); s.set('c1_toad_fled');
    s.quest('Toad ran off toward the river. Look for him around the River Bank.');
    s.save();
  },
  'c1.doorweasel': async (s) => {
    const L = ['Toad Hall\'s ours now, rabbit! Hop it, before the Chief hears you.', 'We\'re having a banquet. You\'re not invited. Nobody\'s invited. Except weasels.', 'Stoats and ferrets too. But not rabbits. And definitely not toads.'];
    await s.say('weasel', L[(G.s.playTime | 0) % L.length]);
    if (flag('c1_toad_unmasked')) await s.say('bramble', '(Not through the front door, then. Badger\'s tunnel.)');
  },
  'c1.washerwoman': async (s) => {
    await lines(s, [
      ['washerwoman', 'Washing! Honest washing, a penny a shirt! Nobody here but a poor old washerwoman! Certainly no Toads!'],
      [null, 'The washerwoman has a large green face, a great wide mouth, gold-rimmed goggles pushed up under her bonnet, and webbed hands.'],
    ]);
    const c = await s.ask('bramble', '', ['Hello, Toad.', 'What lovely green... hands you have, ma\'am.']);
    if (c === 0) await s.say('bramble', 'Hello, Toad.');
    else await lines(s, [['bramble', 'What lovely green hands you have, ma\'am. And what lovely motoring goggles.'], ['washerwoman', 'They\'re... washing goggles. For the splashes.'], ['bramble', 'Toad.']]);
    await lines(s, [
      ['toad', 'Oh, bother and blow! Is it so obvious? It was a perfect disguise. I bought it off a real washerwoman, with real money!'],
      ['toad', 'They threw me out of my own house, you know. Over the hedge. A Toad of my standing! Oh, I am a wretched, miserable animal.'],
      ['badger', 'You are a foolish animal, Toad, and you will stop wailing and listen.'],
      ['badger', 'There is a secret passage. It runs from my buried city under the river and comes up in the butler\'s pantry of Toad Hall. Your father showed it me.'],
      ['toad', 'A secret passage! Into my own house! Oh, Badger, you clever old thing!'],
      ['badger', 'Tonight the weasels hold a banquet for their Chief. They will be full of food and pleased with themselves. That is when we go in.'],
      ['toad', 'I\'m coming! I\'m leading! Well. I\'m coming. Right behind you, rabbit. Very close behind.'],
    ]);
    s.set('c1_toad_unmasked');
    s.remove('washerwoman'); removeProp(s, p => p.id === 'prop-wash-bucket');
    s.escort('toad', true, { sprite: 'toad' });
    s.quest('Take Toad through Badger\'s house, down to the buried city and the secret tunnel.');
    s.save();
  },
  'c1.toadhall.enter': async (s) => {
    if (!flag('c1_chief_beaten') && !flag('c1_th_in')) {
      s.set('c1_th_in');
      await lines(s, [
        [null, 'Up through a trapdoor into the butler\'s pantry. From beyond the door: clattering plates, songs, and a great deal of weasel laughter.'],
        escortingNow('toad') ? ['toad', '(whispering very loudly) My pantry! My jam! They\'ve eaten my jam!'] : null,
        ['badger', 'Quietly. The Chief Weasel sits at the head of the table. Deal with him, and the rest will sit down soon enough.'],
      ]);
      s.quest('Find the Chief Weasel at the head of the banquet table.');
    }
    s.ex.enterBubble();
  },
  'c1.chief.talk': async (s) => {
    if (flag('c1_chief_beaten')) {
      const L = ['We\'re ever so sorry about the jam, Mr. Bramble. And the beds. And the waistcoats.', 'It was the dark, see. It got in our heads. Made us snappish. It\'s gone quieter now you\'ve all come.', 'If you\'re ever in a scrap, call on the lads. We owe you, and weasels pay their debts. Mostly.'];
      await s.say('chief-weasel', L[(G.s.playTime | 0) % L.length]); return;
    }
    await lines(s, [
      [null, 'At the head of the long table, in Toad\'s best armchair, in Toad\'s best waistcoat, sits the Chief Weasel.'],
      ['chief-weasel', 'Well, well. Rabbits. At my banquet. Who let rabbits in? Was it you, Bert? It was Bert.'],
      ['bramble', 'This is Toad\'s house. You\'re going to give it back.'],
      ['chief-weasel', 'Toad\'s? Finders keepers, little rabbit. The wood\'s gone dark and cold and humming, and Toad Hall\'s got fires. We\'re keeping it.'],
      escortingNow('toad') ? ['toad', 'Villain! Ruffian! That is MY waistcoat!'] : null,
      ['chief-weasel', 'Lads! Up from the table! Let\'s show these visitors out.'],
    ]);
    const r = await s.battle('c1.chief-weasel');
    if (r !== 'win') return;
    s.set('c1_chief_beaten');
    await lines(s, [
      [null, 'The Chief Weasel sits down very suddenly on the floor, with Toad\'s waistcoat over his ears. All round the hall the weasels lower their sticks.'],
      ['chief-weasel', 'All right. All right! We give up. It\'s your Hall, Mr. Toad.'],
      ['chief-weasel', 'Thing is... we didn\'t mean it, not really. The wood went dark this winter. Something humming under the roots, all night.'],
      ['chief-weasel', 'Got in our heads, it did. Made us mean and snappish and cold. And your Hall had all them fires.'],
      ['bramble', 'The Hum. It took our warren too. It\'s not your fault you were cold.'],
    ]);
    const c = await s.ask('bramble', '', ['Say sorry, and stay for supper.', 'You can make it right.']);
    await s.say('bramble', c === 0 ? 'Say sorry to Toad. Then everyone sit down. There\'s a whole banquet going cold.' : 'You can make it right. Starting with Toad\'s jam.');
    await lines(s, [
      ['chief-weasel', '(to Toad, very sheepish) Sorry, Mr. Toad. For the Hall. And the jam. And for throwing you over the hedge.'],
      [null, 'One by one, every weasel, stoat and ferret in the hall says sorry. Some of them say it twice. One of them cries a bit.'],
      escortingNow('toad') || true ? ['toad', 'Well! Hm. Well. Since you ask so nicely. Sit down, all of you! Sit down! A banquet is a banquet!'] : null,
      [null, 'And so they do. Badger at one end of the table, Toad at the other, weasels in between, all passing the gravy.'],
      ['toad', 'Bramble! Rabbit of my heart! You saved my Hall, and you didn\'t even want any of it! That\'s... that\'s rather wonderful, actually.'],
      ['toad', 'I hear there\'s a great adventure on. Dark things, a warren in peril. Well, an adventure needs a Toad! Who else will keep it from being dull?'],
      flag('g_recruit_badger') ? ['badger', 'Heaven help us all.'] : null,
    ]);
    s.escort('toad', false);
    await s.recruit('toad', { line: 'Poop-poop! The cleverest, handsomest, bravest Toad in all the world is at your service!', level: 7 });
    await lines(s, [['chief-weasel', 'And, er... if it\'s a fight against this humming thing, the lads would like to come. Make it up to everyone. If Mr. Toad leads us.'], ['toad', 'Lead them? Ha! Naturally!']]);
    s.set('g_squad_reformed-weasels');
    await s.give({ buttons: 35, 'carrot-cake': 2 });
    await s.say('toad', 'A little something from the Toad Hall strongroom. Spend it on something with wheels.');
    s.set('g_c1_riverbank_done');
    s.sfx('victory', { vol: 0.6 });
    await s.narrate('On the stone of the Underway, far below, the carved river begins to glow.');
    s.quest(flag('g_c1_wonder_done') ? 'Back to the Underway: the eye-stair is waiting. (Visit home on the way.)' : 'Back to the Underway: try the keyhole door. (And visit home: Burdock wants to see the nursery.)');
    s.save();
    await s.say('ratty', 'Now then. It\'s a long walk back to that old bank-door of yours, and I have a boat, and the river runs the right way. Shall I row us?');
    const row = await s.ask('bramble', '', ['Row us back, Ratty.', 'We\'ll walk.']);
    if (row === 0) {
      await s.narrate('Ratty rows them all down the river in the dusk, the boat low in the water and Toad singing in the bows until Badger tells him to stop.');
      await s.warp('c1-riverbank', 'underway');
    }
  },
  'c1.banqueter': async (s) => {
    if (flag('c1_chief_beaten')) { const L = ['More gravy, Mr. Rabbit? It\'s Mr. Toad\'s gravy. He says we can have some now.', 'Sorry about everything. I\'ve said it eleven times. I\'m going for twelve.', 'The humming\'s quieter here, with the fires going and everybody friends.']; await s.say('weasel', L[(G.s.playTime | 0) % L.length]); return; }
    const L = ['Oi! Paws off the pudding. That\'s the Chief\'s.', 'Toad Hall\'s ours, rabbit. Finders keepers.', 'Go and bother the Chief. He likes being bothered. Ha!'];
    await s.say('weasel', L[(G.s.playTime | 0) % L.length]);
  },

  // ================================================================ HOME, BRIEFLY (c0-warren, after the River Bank)
  'c1.home.brief': async (s) => {
    s.set('c1_home_brief');
    await lines(s, [
      [null, 'Thimblebank. Ratty stares about at the wrecked tunnels with his whiskers down. Badger says nothing at all, which is worse.'],
      ['burdock', 'Hmph. The nursery tunnel\'s still down. Half the kits are sleeping in the Great Burrow.'],
      ['badger', 'Then we dig. I have dug out worse than this in a winter, and on less porridge.'],
      ['ratty', 'I\'m not much of a digger, but I can carry. And I can tell everybody where they\'re going wrong.'],
    ]);
    await s.fadeOut(0.6);
    for (let i = 0; i < 4; i++) { s.sfx(i % 2 ? 'thump-2' : 'thump-1', { vol: 0.6 }); await s.wait(0.35); }
    removeProp(s, p => p.id === 'prop-tunnel-heap' && p.x < 12 && p.y > 10);
    s.set('g_c1_nursery_cleared');
    await s.fadeIn(0.6);
    await lines(s, [
      [null, 'Burdock, Badger and Ratty dig until the nursery tunnel is open again. Somebody lights a lantern-mushroom. The first room of Thimblebank is whole.'],
      ['burdock', '...Hmph. Good badger.'],
      ['badger', 'Good rabbit.'],
    ]);
    const [px, py] = near(s, 2, 1);
    s.spawn({ id: 'pip-run', sprite: 'pip', kid: true, x: px, y: py, facing: 'nw' });
    s.sfx('scamper');
    s.emote('pip-run', '!');
    await lines(s, [
      ['pip', 'Bramble! BRAMBLE! You\'re back! Look! Look what I found!'],
      ['pip', 'It came rolling down the hill from the east, all by itself, bump bump bump, right to the warren mouth!'],
      [null, 'In Pip\'s paws is a small white chalk pebble. Scratched into it, quick and sharp: a little leaping hare inside a circle.'],
      ['bramble', 'That\'s Tansy\'s mark. She scratches it on everything. She scratched it on my ear once.', { mood: 'worried' }],
    ]);
    const c = await s.ask('bramble', '', ['She\'s alive.', 'She\'s still herself.']);
    await s.say('bramble', c === 0 ? 'She\'s alive. She\'s alive, Pip!' : 'The Hum takes your name. But she remembered her mark. She\'s still herself, a little.', { mood: 'happy' });
    await s.say('pip', 'I knew it was important. I didn\'t lose it once! I held it the whole time! Even when I was asleep!');
    s.remove('pip-run');
    await s.give({ 'chalk-pebble': 1 });
    s.remember('mem-pebble');
    s.toast('A memory: Tansy\'s chalk pebble');
    s.quest(underwayQuest() || 'Back to the Underway.');
    s.save();
  },
  'c1.home.check': async (s) => { await checkCh1Done(s); },
  // ch1w calls this after the Shallows: Chapter 1 ends when RTS 1 and the Shallows are both done
  'c1.checkDone': async (s) => { await checkCh1Done(s); },
  'c1.home.badger': async (s) => {
    const L = flag('g_freed_thimblebank')
      ? ['A fine warren, this. Good deep rooms. Your Comfrey makes a respectable broth.', 'The young ones keep asking me for stories. I tell them about the buried city. They find it very dull. Good.']
      : ['I am sitting by your fire because it is the only warm thing in this warren, and somebody must guard it.', 'Your Burdock digs well. I have told her so. She said "Hmph." We understand each other.'];
    await s.say('badger', L[(G.s.playTime | 0) % 2]);
  },
  'c1.home.ratty': async (s) => { await s.say('ratty', ['No river in here, but you\'ve a lovely damp bit by the cellar. I\'ve been writing a poem about it.', 'Mallow drives a hard bargain! I traded him a verse for a button. He seemed to think he\'d won.'][(G.s.playTime | 0) % 2]); },
  'c1.home.mole': async (s) => { await s.say('mole', ['Your warren is ever so like Mole End, only bigger, and with more cousins.', 'I\'ve been helping Comfrey whitewash the nursery. It\'s the most fun I\'ve had in years.'][(G.s.playTime | 0) % 2]); },
  'c1.home.toad': async (s) => { await s.say('toad', ['Charming little warren! Needs a ballroom. And a motor-house. I shall draw up plans!', 'The kits asked me to tell the story of the banquet. I told it four times. It got better every time.'][(G.s.playTime | 0) % 2]); },
  'c1.home.chert': async (s) => {
    await s.say('chert', ['I keep waking at night to listen for it. The Hum. It\'s quiet here. I didn\'t know quiet could feel like a blanket.', 'Your Yarrow lets me sit with the elders. Me. After what I did to this warren.', 'Tansy kept scratching her mark on stones the whole way east. The others laughed at her. I didn\'t.'][(G.s.playTime | 0) % 3]);
  },
  'c1.home.rescued': async (s, a) => {
    const n = +(String(a && a.id || '1').split('-').pop()) || 1;
    const L = [
      'We were in a pen of flints. Nobody hummed at us; they just forgot we were there. That was worse.',
      'Tansy kept us going. She made us say our names every morning. "Say it! Say it like you mean it!"',
      'They took her on alone, north, to Silverdown. She shouted your name, Bramble. She said you\'d come.',
      'Home smells of clover and Comfrey\'s broth. I didn\'t know I\'d missed a smell.',
      'Chert opened the pen for us. One of THEM. Except he isn\'t, now. Funny.',
    ];
    await s.say(n % 2 ? 'doe' : 'buck', L[(n - 1) % L.length]);
  },

  // ================================================================ THE BATTLE OF SOREL DOWN: before and after
  'c1-rts1.intro': async (s) => {
    if (!flag('g_c1_riverbank_done') || !flag('g_c1_wonder_done')) {
      await s.say(null, 'From the Lookout Stone the raiders\' camp is plain to see: squads of them, humming in the grass around Thimblebank\'s mouth.');
      await s.say('burdock', 'Not enough of us yet. ' + (!flag('g_c1_riverbank_done') && !flag('g_c1_wonder_done') ? 'Two doors down there: the river and the keyhole. Friends behind both, Yarrow says.' : !flag('g_c1_riverbank_done') ? 'The river door, down in the Underway. Friends behind it.' : 'The keyhole door, down in the Underway. Friends behind it.'));
      return false;
    }
    if (!flag('c1_rts1_intro')) {
      s.set('c1_rts1_intro');
      await lines(s, [
        [null, 'From the Lookout Stone, the down below is full of raiders. But this time Bramble isn\'t alone.'],
        [null, 'Otters from the river. Hedgehogs in neat prickly rows. Field mice with lanterns. Weasels looking sheepish. Flamingos. A grin with no cat.'],
        ['burdock', 'Hmph. Thimblebank\'s never had an army before. Let\'s not waste it.'],
        s.member('badger') ? ['badger', 'Diggers stop runners. Fliers stop diggers. Runners catch fliers. Remember it, and nobody need get hurt.'] : null,
        s.member('toad') ? ['toad', 'Charge! Er. When the rabbit says so.'] : null,
      ]);
    }
  },
  'c1-rts1.won': async (s) => {
    s.set('g_c1-rts1_won');
    await lines(s, [
      [null, 'The raiders on the surface scatter and wake, blinking, in the grass. Sorrel Down is Thimblebank\'s again.'],
      [null, 'But down in the Great Burrow, a last band still holds the heart of the warren, humming in the dark, digging at the floor.'],
    ]);
    if (G.data.maps['c0-warren'] && s.ex.map.id !== 'c0-warren') await s.warp('c0-warren', 'great-burrow');
    await scripts['c1.greatburrow.fight'](s);
  },
  'c1.greatburrow.fight': async (s) => {
    s.remove('c1-chert-hum');
    const taken = [];
    const ids = ['gb-chert', 'gb-raider-1', 'gb-raider-2'];
    for (let i = 0; i < 3; i++) { const [x, y] = near(s, 2, i - 1, taken); s.spawn({ id: ids[i], sprite: ['chert', 'raider', 'hum-digger'][i], hum: true, x, y, facing: 'nw' }); }
    s.ambience('hum', 0.35);
    await lines(s, [
      ['raider', '(humming) ...deeper... dig deeper... more rabbits to dig...'],
      ['bramble', 'This is our home. Wake up. All of you, please, wake up.'],
      ['burdock', 'Gently, now. They\'re rabbits under all that hum. Same as us.'],
    ]);
    const r = await s.battle('c1.great-burrow', { canLose: true });
    if (r !== 'win') {
      s.ambience('hum', 0.12);
      for (const id of ids.slice(1)) s.remove(id);
      await s.say('burdock', 'Back! Back, and breathe. They\'re not going anywhere. Talk to that one with the torn ear when you\'re ready.');
      s.quest('Chert\'s band still hums in the Great Burrow. Rest, then face them again.');
      return;
    }
    s.ambience('hum', 0);
    for (const id of ids.slice(1)) s.remove(id);
    s.sfx('wake-chime');
    await lines(s, [
      [null, 'One by one the humming stops. The raiders sit down where they stand, blinking, shaking their heads, and very slowly remember their names.'],
      [null, 'The last to wake is a lean dark buck with a torn ear. His eyes clear from pale blue to brown. He looks round the wrecked Burrow, and his ears go flat.'],
      ['chert', 'I... I know this place. I dug at this floor. I pushed rabbits out of these tunnels.'],
      ['chert', 'My name is Chert. Of Flintcomb. I remember it now. I wish I didn\'t remember the rest.'],
      ['bramble', 'What does it feel like? The Hum?'],
      ['chert', 'Like a song you can\'t stop hearing. Like being very cold and not minding. Everything you love goes far off, and the only thing near is: dig. Deeper.'],
      ['chert', 'Something down there is having a bad dream. We were in it.'],
    ]);
    const c = await s.ask('bramble', '', ['It wasn\'t you.', 'Then help us wake the rest.']);
    await s.say('bramble', c === 0 ? 'It wasn\'t you. It was the Hum. And you\'re awake now.' : 'Then help us wake the rest. Every warren it\'s taken.');
    await lines(s, [
      ['chert', 'I\'ll do it. Whatever you need. I owe this warren a hundred times over.'],
      ['chert', 'And there\'s a thing I can do now. The ones we took: there\'s a pen in the flints, just over the east ridge. Come on. Quickly.'],
    ]);
    s.remove('gb-chert');
    await s.recruit('chert', { line: 'I helped the Hum dig. Now I\'ll help you stop it. Let me make amends.' });
    await s.fadeOut(0.7);
    await s.wait(0.6);
    await s.fadeIn(0.7);
    const taken2 = [];
    for (let i = 0; i < 5; i++) { const [x, y] = near(s, 1 + (i % 3), -1 + Math.floor(i / 3) * 2, taken2); s.spawn({ id: 'gb-home-' + i, sprite: i % 2 ? 'rabbit-buck' : 'rabbit-doe', fur: ['grey', 'sandy', 'cream', 'dark', 'ginger'][i], x, y, facing: 'nw' }); }
    s.sfx('victory', { vol: 0.5 });
    await lines(s, [
      [null, 'Behind a wall of flints over the east ridge: a pen, and in it, five Thimblebank rabbits, thin and dusty and very much themselves. They come home at a run.'],
      [null, 'Five. Bramble counts them twice.'],
      ['bramble', 'Where\'s Tansy? Chert. Where\'s Tansy?', { mood: 'worried' }],
      ['chert', 'She was here. She was the loudest rabbit in the pen. She made them all say their names every morning, so they wouldn\'t forget.'],
      ['chert', 'So they took her on. North, to Silverdown. The Hum wanted her most, because she fought it hardest.'],
      ['bramble', 'Then that\'s where we go. Silverdown.'],
    ]);
    for (let i = 0; i < 5; i++) s.remove('gb-home-' + i);
    await s.fadeOut(0.6);
    s.set('g_freed_thimblebank');
    await s.wait(0.4);
    if (G.data.maps['c0-warren'] && s.ex.map.id === 'c0-warren') await s.warp('c0-warren', 'great-burrow', undefined, undefined, { reload: true });
    await s.fadeIn(0.6);
    await lines(s, [
      [null, 'That night the whole warren digs. By morning the Great Burrow is cleared, a fire lit in its old hearth, the storyteller\'s seat set back on its feet.'],
      [null, 'Thimblebank is free. Its rabbits will march with you now, and its first rooms are home again.'],
    ]);
    s.toast('Thimblebank is free! Army rank up.');
    s.save();
    if (!(await checkCh1Done(s))) s.quest(flag('g_c1_shallows_done') ? withNinefold('Chapter 1 is done.') : 'One door left: the eye-stair in the Underway leads to the Shallows.');
  },
};

function wildQuest() {
  const hogs = (escortingNow('hedgehog-1') ? 1 : 0) + (escortingNow('hedgehog-2') ? 1 : 0);
  if (!flag('g_recruit_mole')) {
    if (escortingNow('mole')) return 'Go into Mole End with Mole.';
    if (flag('c1_mole_found')) return 'Mole End\'s door is open. Go in with Mole.';
    if (!flag('c1_scent_on')) return 'Look for Mole in the Wild Wood.';
    return 'Follow Mole\'s warm scent through the thicket, one shimmer at a time.';
  }
  if (!flag('c1_hogs_home')) {
    if (hogs === 2) return 'Take both hedgehog lads to Badger\'s door, north-west in the wood.';
    if (hogs === 1) return 'Find the other lost hedgehog lad in the snow.';
    return 'Little voices are crying in the snow: find whoever is lost.';
  }
  if (flag('g_c1_riverbank_done')) return underwayQuest() || 'Back to the Underway.';
  if (flag('c1_toad_unmasked') && !flag('c1_chief_beaten')) return 'Take Toad to Badger\'s door, north-west in the wood: the secret passage starts under his larder.';
  if (flag('c1_toad_fled')) return 'Toad ran off toward the river. Look for anyone acting oddly by the weir.';
  return 'Toad is in trouble on the road to Toad Hall, west of the River Bank.';
}

// home rabbits' Chapter 1 lines (ch0 runs home.<id>.ch1 while Chapter 1 is the newest started)
const HOME = {
  yarrow: [
    ['Back from below! I can smell river on you. And snow. And... jam?', 'Friends from the old stories, walking about in my warren. I always hoped the stories were true. I always feared it too.'],
    ['Our hill is ours again. Now Silverdown. The rhyme needs every warren, Bramble. Every one.', 'Chert sits with me in the evenings. He listens to the ground like I do. He hears it better.'],
  ],
  mallow: [
    ['Buttons from the River Bank? Otter\'s buttons! Brass, with anchors on! Oh, I\'ll give you a fair price for news of HIM.', 'Mr. Toad tried to buy my whole shelf. Then he tried to sell it back to me for twice as much. I like him.'],
    ['Five of us home and the Burrow lit. Business is looking up! Literally: we have a ceiling again.', 'Stock\'s better since the hill\'s ours. Have a look.'],
  ],
  woodruff: [
    ['Under the old door, a river? And a keyhole? That isn\'t in any story I know. Tell me everything. Slowly.', 'The Long Thump, little one: "When all the warrens thump as one." One warren, so far. Ours. That\'s a start.'],
    ['I\'m making a new story, about a rabbit who went down a door that never opened. The kits want to know how it ends. So do I.', 'Chert told me how the Hum feels. I wrote it down, so we\'ll know it if it comes again.'],
  ],
  comfrey: [
    ['Sit, sit. Heart and Pluck both low, I can tell by your ears. And who\'s this gentleman with the stick?', 'Mr. Mole has been helping me whitewash. He says it\'s the most fun he\'s had in years. Odd fellow. Lovely fellow.'],
    ['Five home and thin as reeds. I\'ve been feeding them broth by the bowl. Rest here when you need to.', 'Even the woken raiders come to me. Shaking, mostly. I give them broth too. Broth doesn\'t ask whose side you were on.'],
  ],
  pip: [
    ['Is it true there\'s a river under the door? And a Badger? A real Badger? Can I touch him? Did he let you touch him?', 'Yarrow\'s teaching me to listen to the ground. I heard a worm! Well. I think it was a worm.'],
    ['I keep checking the chalk pebble\'s still there. It is. Every time!', 'When you go to Silverdown, tell Tansy I didn\'t lose it. Promise?'],
  ],
};
const GEN = [
  ['You went through the old door! My nan always said there were dragons down there.', 'Any dragons? No? Shame. Well, glad you\'re back in one piece.'],
  ['Strange creatures in the tunnels. A Badger by the fire, a Rat who rhymes. I\'m getting used to it. Mostly.', 'The tall Rat asked me what I thought of the moon. I said it was fine. He wrote that down.'],
  ['I\'ve been clearing rubble every day. Burdock says I\'ve got the shoulders for it now.', 'Every lantern we light, it feels a bit less like the raid.'],
  ['The kits won\'t stop playing "Weasels and Rabbits". The weasels always say sorry at the end.', 'Is it true the weasels said sorry? Real weasels? Well I never.'],
  ['I keep waiting for the hum to come back. Then I hear Mr. Toad singing in the Burrow and I forget.', 'Do you think Tansy\'s all right? She always was the toughest of us.'],
  ['Nursery\'s open again! I cried. Don\'t tell anyone. Well, tell Badger, he\'d understand.', 'Burdock and that Badger dug side by side all night. Didn\'t say three words between them.'],
  ['Who\'s minding the hill, now you\'re down below? Oh, we are. Right. Yes. We are.', 'I made you a sweetgrass twist. It\'s for luck. You probably need some.'],
  ['The flint pen, the cold... I don\'t want to talk about it. But I\'m glad I\'m home. Thank you.', 'The hill looks different, after. Greener, somehow.'],
  ['My ears still ring with the raiders\' humming some nights. Then I count the lanterns till I sleep.', 'Comfrey says to eat more clover. Comfrey says that to everyone.'],
  ['Eh? Through the old door? I put my ear to it as a kit. Never thought I\'d see anyone walk through it. Mind the draught.', 'Eh? Friends from below, at our fire? In my day the only thing below was the cellar, and the cellar was quite enough.'],   // Lichen: old, half-deaf
];
// Before the River Bank is done, the lines above (Badger, Ratty, Toad, the weasels, the nursery) are too early:
// the elders fall back to their Prologue lines, the rest get one early line.
const EARLY = {
  pip: 'Did you find anyone down there yet? Yarrow says you will. I\'m practising listening to the ground, so I\'ll hear you coming home.',
  'home-2': 'Through the old sealed door, eh? I\'ve dug these tunnels all my life and never once tried that one. Mind the drainage down there.',
  'home-4': 'I\'ve planted fresh clover where the raiders trampled it. It\'s coming up slowly. Like everyone.',
  'home-5': 'The sealed door? I\'d have opened it myself. If I\'d had the key. And if it wasn\'t so dark. And so humming.',
  'home-6': 'The hum\'s gone quieter since you went below. I\'m making a song about it. It hasn\'t got an ending yet.',
};
const tooEarly = (id) => !flag('g_c1_riverbank_done') && !flag('g_freed_thimblebank') && (id in EARLY || ['yarrow', 'mallow', 'comfrey'].includes(id));
async function early(s, id, who) {
  if (EARLY[id]) { await s.say(who || id, EARLY[id]); return; }
  const f = G.data.scripts[`home.${id}.ch0`]; if (f) await f(s);
}
for (const [id, sets] of Object.entries(HOME)) {
  scripts[`home.${id}.ch1`] = async (s) => {
    if (tooEarly(id)) { await early(s, id); return; }
    const set = sets[flag('g_freed_thimblebank') ? 1 : 0];
    const k = 'c1_home_' + id; const n = getVal(k) || 0; setFlag(k, n + 1);
    await s.say(id, set[n % set.length]);
  };
}
for (let i = 1; i <= 10; i++) {
  scripts[`home.home-${i}.ch1`] = async (s, a) => {
    const set = GEN[i - 1];
    const sprite = a && a.sprite;
    if (tooEarly('home-' + i)) { await early(s, 'home-' + i, sprite === 'rabbit-buck' ? 'buck' : sprite === 'rabbit-kit' ? 'kit' : 'doe'); return; }
    const k = 'c1_home_h' + i; const n = getVal(k) || 0; setFlag(k, n + 1);
    await s.say(sprite === 'rabbit-buck' ? 'buck' : sprite === 'rabbit-kit' ? 'kit' : 'doe', set[n % set.length]);
  };
}
