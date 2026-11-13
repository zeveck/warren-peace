// Chapter 3 scripts: the Battle of Wheatsheaf's aftermath, Barley, Pip and the bell, the deep door, the Underway's cyclone.
import { G } from '../../core.js';
import { flag, hasItem, travelling, member, maxHp, maxPl } from '../../state.js';

export const call = async (s, id, actor) => { const f = G.data.scripts[id]; if (f) await f(s, actor); };
const said = (s, k) => { if (s.flag(k)) return true; s.set(k); return false; };

export const wheatsheafScripts = {
  // the Lookout Stone runs this after the army wins RTS 3 (it sets g_c3-rts3_won)
  'c3-rts3.won': async (s) => {
    s.set('g_ch3_open'); s.chapter(3);
    await s.narrate('The corn closes behind the last of Flintcomb\'s raiders. Wheatsheaf\'s fields are yours.');
    await s.say('tansy', 'They hid in the corn, so we hid in the corn. Ha! Nobody out-sneaks Tansy\'s Scouts.');
    await s.say('yarrow', 'Wheatsheaf is still asleep inside, Bramble. Its chief, Barley, hums in his hall. Go and wake him.');
    // Barley comes straight after the Tidewarden and this battle: the army's supper is a rest (calibration.md)
    await s.narrate('Before you go in, Thimblebank\'s army shares its supper in the stubble. Everyone eats, and rests.');
    await s.rest({ quiet: true });
    await s.chapterCard('Wheatsheaf and Oz', 'Chapter 3', 'bg-battle-oz-road');
    s.quest('Go west into Wheatsheaf\'s warren and wake its chief, Barley.');
    await s.warp('c3-wheatsheaf', 'east');
  },
  'c3.wheatsheaf.enter': async (s) => {
    s.set('g_ch3_open');
    if (!said(s, 'c3_wsSeen')) {
      await s.narrate('Wheatsheaf. The corn stands tall and gold on every side, and nothing in it moves.');
      await s.narrate('Under the rustle there is a hum, low and flat, coming up out of the ground.');
      const p = s.party().filter(id => id !== 'bramble');
      if (p[0]) await s.say(p[0], { mole: 'Oh my. It\'s such a pretty place. It oughtn\'t to sound like that.', ratty: 'Corn ought to whisper, not hum. I don\'t like it.', badger: 'Hmph. Mind your step. The Hum is thick here.', toad: 'A farm! I\'ve always fancied a farm. Not a humming one, though.', tansy: 'This is where they brought us, after Silverdown. For a night. I remember the corn.', 'jade-rabbit': 'The ground here sings one note over and over. It is a lonely song.', ninefold: 'Forgive me. The humming is very loud to my eyes.', 'cheshire-cat': 'What a lot of corn. And what a lot of nobody in it.', caterpillar: 'Humming. How tiresome.', burdock: 'Hmph. Too quiet.' }[p[0]] || 'It\'s too quiet.');
      s.quest('Wake Barley, Wheatsheaf\'s chief, in the hall under the warren mouth.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.ws.sign': async (s) => { await s.narrate('WHEATSHEAF. Someone has scratched underneath, in a careful hand: "Ring the bell for supper."'); },
  'c3.ws.rabbit1': async (s, a) => {
    if (!flag('g_freed_wheatsheaf')) { await s.say('doe', 'Mmmmm. Deeper. The roots go deeper, and so must we.'); await s.say('bramble', 'Hello? What\'s your name?'); await s.say('doe', 'Name? Mmmmm...'); return; }
    await s.say('doe', 'I\'m Hazel-of-the-Furrow! I know that now. I didn\'t know it this morning.'); await s.say('doe', 'Thank you. And thank that little one with the big ears.');
  },
  'c3.ws.rabbit2': async (s) => {
    if (!flag('g_freed_wheatsheaf')) { await s.say('buck', 'Dig. Under the corn. Under the stones. Mmmmm.'); return; }
    await s.say('buck', 'I sat in the corn for nine days humming. My back legs have gone to sleep.'); await s.say('buck', 'When Barley\'s bell rang, it was like somebody opened a window in my head.');
  },
  'c3.ws.rabbit3': async (s) => {
    if (!flag('g_freed_wheatsheaf')) { await s.say('kit', 'Mmm... mmm...'); await s.narrate('The kit stares at the soil with flat, pale eyes.'); return; }
    await s.say('kit', 'I\'m going to be a bell-ringer when I\'m big! Like Pip! Is Pip a bell-ringer?'); await s.say('bramble', 'Pip\'s a finder. The best one.');
  },
  'c3.ws.rabbit4': async (s) => { await s.say('doe', 'Barley says Thimblebank\'s army came over the hill like a summer storm. A friendly one.'); await s.say('doe', 'We\'ll come to your warren for the feast, after. Wheatsheaf always brings the bread.'); },
  'c3.ws.rabbit5': async (s) => { await s.say('buck', 'The hay cart was full of humming rabbits when you came. Now it\'s full of hay again. Much better.'); },
  'c3.ws.nursery': async (s) => {
    if (!flag('g_freed_wheatsheaf')) { await s.say('kit', 'Mmmm... the nests are cold.'); return; }
    await s.say('kit', 'The nests are warm again! Somebody brought clover. Was it you?');
  },
  'c3.ws.granary': async (s) => { await s.say('doe', 'The granary\'s been eaten half empty by mice. Real mice, not Hum mice. I don\'t mind. They were hungry too.'); },
  'c3.wswarren.enter': async (s) => {
    if (!flag('c3_barleyWoken') && !said(s, 'c3_wswSeen')) {
      await s.narrate('Wheatsheaf\'s tunnels are swept and tidy, and empty. From the hall below comes a deep, slow hum.');
      return;
    }
    s.ex.enterBubble();
  },
  'c3.rest': async (s) => { await s.rest(); },

  // ---- Barley
  'c3.barley.boss': async (s) => {
    await s.narrate('A broad ginger buck stands among the corn sheaves of his hall, swaying, humming one long low note.');
    if (!said(s, 'c3_barleyMet')) {
      await s.say('bramble', 'Barley? Chief of Wheatsheaf? We\'ve come from Thimblebank. You\'re safe now.');
      await s.say('barley', 'Mmmmm. Furrow\'s not deep enough. Plough... deeper.');
      const c = await s.ask('bramble', 'He lowers his head like a bull.', ['We\'re going to wake you up, Barley.', 'Sorry about this!']);
      await s.say('bramble', c === 0 ? 'Whatever it takes.' : 'Really sorry.', { mood: 'worried' });
    }
    // hurt? the rest stone is a few hops back up the hall stair (10,9) (calibration.md)
    if (travelling().some(id => { const m = member(id); return m && (m.hp < maxHp(id) * 0.8 || m.pl < maxPl(id) * 0.6); })) {
      const c = await s.ask('bramble', 'He\'s huge, and we\'re worn. The resting stone is just back up the stair.', ['Rest at the stone first.', 'Wake him now.']);
      if (c === 0) await s.rest();
    }
    const r = await s.battle('c3.barley');
    if (r !== 'win') return;
    s.set('c3_barleyWoken');
    const b = s.actor('barley'); if (b) { b.hum = false; s.emote('barley', '?'); }
    s.sfx('wake-chime');
    await s.wait(0.6);
    await s.say('barley', '...Oh. Oh, my head. Like a cart\'s run over it. Both ways.');
    await s.narrate('Barley shares out a heel of bread from his hall stores. Everybody feels better for it.');
    s.heal();
    await s.say('barley', 'Who... I\'m Barley. Of Wheatsheaf. That\'s right. And you\'re a long way from home, young \'un.');
    await s.say('bramble', 'I\'m Bramble, from Thimblebank. Your rabbits are still humming, up in the corn.');
    await s.say('barley', 'Ah. I rang my bell when the Hum came up through the floor. Rang it and rang it till my arms ached.');
    await s.say('barley', 'Then I... I don\'t rightly know. I put it down somewhere. A bell like that would wake them all, if I could find it.');
    // Pip arrives
    s.sfx('scamper');
    s.spawn({ id: 'pip', x: 11, y: 11, facing: 'se' });
    await s.move('pip', [[11, 12], [11, 13]], 0.16);
    s.emote('pip', '!');
    await s.say('pip', 'Bramble! Bramble! I found you! I followed your tracks all the way from the Lookout!');
    await s.say('bramble', 'Pip?! What are you doing here?', { mood: 'happy' });
    await s.say('pip', 'Old Yarrow sent me. He said, "Go and help Bramble, and don\'t lose anything on the way." I only lost one acorn.');
    await s.say('pip', 'Is that the chief? Why is he sitting on the floor? Did he lose something too?');
    await s.say('barley', 'My bell, little \'un. My big brass bell.');
    await s.say('pip', 'Oh! Shh. Shh, everyone.');
    await s.narrate('Pip lays one ear flat to the floor and goes very still.');
    await s.say('pip', 'Yarrow taught me to listen to the ground! There\'s something... ringing. Ever so faint. Out in the corn, by the hay cart!');
    await s.say('barley', 'The hay cart. I ran that way, at the end. I remember the corn round my ears.');
    await s.say('pip', 'Come on, Bramble! I\'ll find it! I\'m good at finding. I\'m good at losing too, but mostly finding.');
    s.remove('pip'); s.escort('pip', true, { kid: true });
    s.set('c3_pipSearching');
    await s.say('barley', 'I\'ll meet you up top, by the old bell post. Mind the corn, it\'s taller than both of you.');
    s.remove('barley');
    s.quest('Follow Pip out to the hay cart in the corn and find Barley\'s bell.');
  },
  'c3.bell.find': async (s) => {
    await s.say('pip', 'Here! It\'s here! Right under my feet!');
    await s.narrate('Pip digs like a terrier. Soil flies. Something under it goes "dong" in a muffled, offended sort of way.');
    s.shake(0.3, 2); s.sfx('wake-chime', { vol: 0.5, pitch: 0.8 });
    await s.give({ 'barleys-bell': 1 });
    await s.say('pip', 'I found it! I found a thing that MATTERS!');
    await s.say('bramble', 'You did, Pip. You really did.', { mood: 'happy' });
    s.quest('Take the bell back to Barley at the old bell post by the warren mouth.');
  },
  'c3.barley.surface': async (s) => {
    if (flag('g_freed_wheatsheaf')) {
      await s.say('barley', 'Wheatsheaf\'s awake, and it\'s your doing, yours and the little \'un\'s.');
      await s.say('barley', hasItem('wheatsheaf-key') && !flag('g_underway_c3') ? 'The deep door\'s past my hall, down the long passage. Mind how you go. It\'s cold down there.' : 'My rabbits\'ll march with yours wherever you need us. Corn hides a lot of rabbits.');
      return;
    }
    if (!hasItem('barleys-bell')) {
      await s.say('barley', 'That little \'un of yours has ears like a barn owl. Go on, follow him. I\'ll wait by the post.');
      return;
    }
    await s.say('barley', 'My bell! Bless your whiskers, that\'s her! Dented, but she\'ll ring.');
    s.take('barleys-bell');
    s.set('c3_bellHung');
    s.ex.map.props.push({ id: 'prop-bell-post', x: 12, y: 7, w: 1, h: 1 });
    await s.narrate('Barley hangs the bell on its post, takes a deep breath, and pulls the rope.');
    s.music(null);
    for (let i = 0; i < 3; i++) { s.sfx('wake-chime', { vol: 0.9, pitch: 0.7 + i * 0.05 }); s.shake(0.25, 2); await s.wait(0.8); }
    s.set('g_freed_wheatsheaf');
    s.ambience('hum', 0);
    for (const a of s.ex.map.actors) { if (a.hum) { a.hum = false; s.emote(a.id, '!', 2.5); } }
    await s.wait(0.6);
    s.music('m-wheatsheaf');
    await s.narrate('DONG. DONG. DONG. All through the corn, heads come up. Pale blue eyes blink brown again.');
    await s.say('barley', 'There. Hear that? No humming. Just the wind in the wheat, the way it ought to be.');
    await s.say('barley', 'Wheatsheaf owes Thimblebank. My rabbits will stand with yours. Every one of us.');
    await s.recruit('barley', { line: 'Corn hides a lot of rabbits. Let\'s go and surprise somebody.' });
    s.escort('pip', false);
    await s.say('pip', 'Bramble? Can I come with you? Properly? I can listen to the ground, and I\'m small, and I hardly ever lose anything any more.');
    const c = await s.ask('bramble', 'Pip looks up at you with enormous eyes.', ['Of course you can, Pip.', 'Only if you stay close.']);
    await s.say('pip', c === 0 ? 'Yes! YES! Wait till I tell Yarrow!' : 'I\'ll stay so close you\'ll trip over me!');
    await s.recruit('pip', { line: 'Yarrow taught me to listen to the ground!' });
    await s.say('barley', 'One more thing. Wheatsheaf\'s deep door. We sealed it, like all the old warrens did.');
    await s.say('barley', 'Something\'s been blowing up through it lately. Dust, round and round, like a little whirlwind. Take the key.');
    await s.give({ 'wheatsheaf-key': 1 });
    s.quest('Open Wheatsheaf\'s deep door, past Barley\'s hall in the warren.');
  },
  'c3.deepdoor.look': async (s) => { await s.narrate('An old round door, sealed tight. A thin breath of dust whistles through the keyhole, round and round.'); },
  'c3.deepdoor.locked': async (s) => { await s.narrate('The deep door is sealed. Barley will have the key.'); },

  // ---- the Underway
  'c3.underway.enter': async (s) => {
    s.set('g_underway_c3');
    if (!said(s, 'c3_underwaySeen')) {
      await s.narrate('Another Underway: a round cavern, older than any warren. In the middle, the dust is turning.');
      await s.narrate('Round and round it goes, a whirl of grit as tall as a willow, humming to itself like a top.');
      if (s.member('pip')) await s.say('pip', 'Is it a wind? Can a wind live underground? Does it have a name?');
      await s.narrate('Across the cave, a stair carved with eyes leads down into the dark. A cold draught comes up it.');
      s.quest(flag('g_c3_oz_done') ? 'Go down the Stair of Eyes, across the Underway.' : 'Step into the whirling dust in the middle of the Underway.');
      return;
    }
    if (flag('g_c3_oz_done') && !flag('g_ch3_done')) s.quest('Go down the Stair of Eyes, across the Underway.');
    s.ex.enterBubble();
  },
  'c3.cyclone': async (s) => {
    if (!flag('c3_ozVisited')) {
      await s.narrate('The dust takes hold of your ears, then your paws, then all of you.');
      s.sfx('whoosh'); s.ambience('storm', 0.6); s.shake(1.2, 3);
      await s.fadeOut(0.8);
      await s.picture('bg-battle-oz-road', ['Round and round, up and up. The dark of the Underway spins away below.', 'Somewhere in the whirl, a little thatched cottage goes tumbling past. You grab hold of its doorstep.', 'For a long time there is only wind, and the house rocking like a cradle...', '...and then, BUMP.'], { skippable: true });
      s.ambience('storm', 0);
      s.set('c3_ozVisited');
      await s.warp('c3-munchkin', 'landing');
      return;
    }
    // after the first time, ask: a walk across the cavern shouldn't whisk you to Oz (full playthrough, Run 2)
    if (s.ex.map.whirlNo) return;
    const c = await s.ask('bramble', 'The dust is still turning, round and round. It would carry you back to Oz.', ['Not now.', 'Step into the whirl (to Oz).']);
    if (c !== 1) { s.ex.map.whirlNo = true; return; }   // don't ask again until you leave the Underway
    s.sfx('whoosh'); s.shake(0.6, 2);
    await s.warp('c3-munchkin', 'landing');
  },
  'c3.stair.locked': async (s) => {
    if (!flag('c3_stairLook')) { s.set('c3_stairLook'); await s.narrate('The stair goes down and down. Carved eyes line its walls. Some of them seem to be looking at you.'); }
    await s.narrate('A cold breath comes up the stair, and the carved eyes all turn toward the dust-whirl, as if to say: not yet. Oz first.');
  },
};
