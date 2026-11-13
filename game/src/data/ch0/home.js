// The home rabbits of Thimblebank: the talk dispatch (home.<id> runs the newest home.<id>.chN whose
// chapter has started), ch0's own lines, Old Yarrow's Old Key scene, Mallow's shop and Comfrey's rest.
import { G } from '../../core.js';
import { flag } from '../../state.js';
import { attacked, homeBack, homeLevel } from './maps.js';
import { warrenQuest, attackQuest } from './story.js';

export const HOME_IDS = ['yarrow', 'mallow', 'woodruff', 'comfrey', 'home-1', 'home-2', 'home-3', 'home-4', 'home-5', 'home-6', 'home-7', 'home-8', 'home-9', 'home-10'];

// chapter N has started once g_ch<N-1>_done is set
function newest(id) {
  for (let n = 6; n >= 1; n--) {   // ch6 = the Epilogue (its home lines fall back to ch5 until it starts)
    const f = G.data.scripts[`home.${id}.ch${n}`];
    if (f && flag(`g_ch${n - 1}_done`)) return f;
  }
  return G.data.scripts[`home.${id}.ch0`];
}
// Mallow and Comfrey always offer their trade and their rest after whatever chapter lines they say
async function mallowTrade(s) {
  const c = await s.ask('mallow', 'Well? Buttons for goods, goods for buttons.', ['Let\'s trade', 'Just saying hello']);
  if (c === 0) await s.shop('c0.mallow-shop');
}
async function comfreyRest(s) {
  const c = await s.ask('comfrey', 'Lie down a while?', ['Rest (heal and save)', 'Not now']);
  if (c === 0) await s.rest();
}
const dispatch = {};
for (const id of HOME_IDS) {
  dispatch['home.' + id] = async (s, actor) => {
    const f = newest(id);
    if (f) await f(s, actor);
    if (id === 'mallow') await mallowTrade(s);
    if (id === 'comfrey') await comfreyRest(s);
  };
}

// ---------------------------------------------------------------- Old Yarrow (and the Old Key)
async function yarrow(s) {
  if (attacked()) {
    if (!flag('c0_guided')) {
      await s.say('yarrow', 'Bramble? Is that you, or a very short badger? Come here. Let me feel your ears. Both there. Good.');
      await s.say('yarrow', 'They took Tansy. I know. I heard it all through the ground, every hop of it.');
      await s.say('yarrow', 'Go up to the Lookout Stone. Look at what\'s left of us. Then come back to me. I have something to tell you.');
      s.quest(attackQuest());
      return;
    }
    if (!flag('g_ch0_done')) { await oldKey(s); return; }
    await s.say('yarrow', 'The door at the end of the deep passage, Bramble. The key knows the way, even if you don\'t.');
    await s.say('yarrow', 'And take some sweetgrass with you. Never go into the dark without something nice to chew.');
    return;
  }
  if (!flag('c0_rhyme')) {
    await s.say('yarrow', 'Bramble! I\'d know those enormous feet anywhere. Mostly by the sound of them.');
    await s.say('yarrow', 'Has Woodruff told the old rhyme yet? Go and hear it, in the Great Burrow. Then come back. I have an errand for a pair of young legs.');
    return;
  }
  if (!flag('c0_yarrow_asked')) {
    await s.say('yarrow', 'There you are. Did Woodruff tell it properly? With the thumps?');
    s.voice('vo-rhyme');
    await s.say('yarrow', '"When all the warrens thump as one, the Sleeper\'s dream is soft and done."');
    const c = await s.ask('bramble', '', ['Is it true? Is there a sleeper?', 'It\'s just a story for kits.']);
    if (c === 0) await s.say('yarrow', 'True? Hmm. Most old stories are true somewhere. Usually somewhere inconvenient.');
    else await s.say('yarrow', 'Kits are cleverer than they look. So are stories. So, now and then, am I.');
    await s.say('yarrow', 'The ground rumbled this morning. You felt it. My old feet felt it all night.');
    await s.say('yarrow', 'Never mind. Old rabbits worry. It\'s our job, like digging is Burdock\'s and talking is Tansy\'s.');
    await s.say('yarrow', 'Now. My teeth fancy something sweet. Sweetgrass grows by the warren mouth, the good stuff. Fetch me a mouthful?');
    s.set('c0_yarrow_asked');
    s.quest(warrenQuest());
    return;
  }
  await s.say('yarrow', 'Sweetgrass, Bramble. By the warren mouth. Unless you\'ve eaten it all on the way, which I would have, at your age.');
}
async function oldKey(s) {
  s.music(null);
  await s.say('yarrow', 'You heard me, up on the hill. Good. I didn\'t know if an old voice could carry that far. It seems the ground helps.');
  await s.say('bramble', 'We couldn\'t hold them. There were too many, and they didn\'t even see us.', { mood: 'worried' });
  await s.say('yarrow', 'No. Not like this, and not alone. Sit down, Bramble. It\'s time somebody told you the truth.');
  await s.say('yarrow', 'The rhyme is true. Under the downs, under everything, something sleeps. Very old. Not wicked. Just asleep.');
  await s.say('yarrow', 'Long ago a warren called Deepdelve dug too deep, and woke it, a little. Its bad dreams leaked up through the soil.');
  await s.say('yarrow', 'A hum. It got into Deepdelve\'s heads. They forgot their names. Their eyes went pale. They only wanted to dig.');
  await s.say('yarrow', 'Deepdelve was lost. So every other warren sealed its deep door, and the elders kept the keys, and the secret.');
  await s.say('yarrow', 'Over the years the secret turned into a nursery rhyme. That was the idea. Safer as a rhyme.');
  const c = await s.ask('bramble', '', ['The raiders' + '\'' + ' eyes. They were pale.', 'So Flintcomb dug too deep.']);
  await s.say('yarrow', c === 0 ? 'Yes. You saw it. The Hum is that old story come true.' : 'Yes. Flintcomb dug too deep, and the Hum took them first. The Hum is that old story come true.');
  await s.say('yarrow', 'And it\'s spreading. Silverdown. Wheatsheaf. Now us.');
  await s.say(null, 'Yarrow fumbles in the fur at his neck and draws out a key on a plaited grass cord: old iron, black with age, warm from his heart.');
  s.sfx('chest-open', { vol: 0.5 });
  await s.give({ 'old-key': 1 });
  await s.say('yarrow', 'The Old Key. It opens the door at the end of the deep passage. The door goes down, into the Depths.');
  await s.say('yarrow', 'We kept it locked to keep the dark out. But the dark has come up anyway. So now somebody has to go down.');
  await s.say('yarrow', 'Below, there are others. Other places, other folk, stranger than you can think. Find friends, Bramble.');
  await s.say('yarrow', 'Friends enough to come back up those stairs and take our warren home.');
  const c2 = await s.ask('bramble', '', ['I\'ll find them. And Tansy.', 'Why me?']);
  if (c2 === 0) await s.say('yarrow', 'I know you will. You never could leave a thing lost. Pip\'s buttons. Tansy\'s temper.');
  else await s.say('yarrow', 'Because you squared up to two raiders with nothing but your feet. And because I asked. Mostly the feet.');
  if (s.member('burdock')) await s.say('burdock', 'Hmph. He won\'t be alone. I\'m going too.');
  await s.say('yarrow', 'Good. Good. Now go on. Comfrey will patch you up first. And mind the third step. It\'s been loose for a hundred years.');
  s.set('g_ch0_done');
  s.music('m-warren');
  s.quest(attackQuest());
  s.save();
}

// ---------------------------------------------------------------- the elders and keepers
async function woodruff(s) {
  if (attacked()) {
    if (homeBack()) { await s.say('woodruff', 'Every rabbit home, and a new story every evening. I\'ve never been so busy, and I\'ve never been happier.'); return; }
    await s.say('woodruff', 'I\'ve told that rhyme a thousand times, Bramble. Today is the first time I believed it.');
    await s.say('woodruff', 'Stories are like seeds. You plant them in kits and you forget them. Then one day, there\'s a tree.');
    return;
  }
  if (!flag('c0_rhyme')) {
    await s.say('woodruff', 'Ah, Bramble. Sit, sit. Not on the kits. There. Now, where was I?');
    await s.say('woodruff', 'Long ago, before the oldest hawthorn was a seed, there was a sleeper under the hills. Vast as the downs. Old as the chalk.');
    await s.say('woodruff', 'And when it dreamed bad dreams, the ground trembled, and the rabbits were afraid.');
    await s.say('woodruff', 'So the rabbits of every warren stood up together, and thumped their back feet, all at once, like one great heart.');
    s.sfx('thump-1'); s.shake(0.2, 1);
    await s.say('c0-kit-a', 'THUMP!', {});
    s.sfx('thump-2'); s.shake(0.2, 1);
    await s.say('c0-kit-b', 'THUMP THUMP!');
    await s.say('woodruff', 'Just so. And the sleeper heard, and its dream grew soft, and it slept sweetly. And what do we say?');
    await s.say('woodruff', '"When all the warrens thump as one, the Sleeper\'s dream is soft and done."');
    await s.say('c0-kit-a', 'Again! Again!');
    await s.say('woodruff', 'Tomorrow. Now, Bramble, Old Yarrow was asking for you. His den is through the south tunnel.');
    s.set('c0_rhyme');
    s.quest(warrenQuest());
    return;
  }
  await s.say('woodruff', 'The rhyme is very old, Bramble. Older than Thimblebank. Some say every warren on the downs knows it.');
  await s.say('woodruff', 'Funny thing. Silverdown sings it, Wheatsheaf hums it, and Flintcomb used to shout it. Nobody remembers why.');
}
async function mallow(s) {
  if (attacked()) {
    if (homeBack()) { await s.say('mallow', 'Business is booming! Rabbits coming home need everything, and I have everything, at very fair prices.'); return; }
    await s.say('mallow', 'They walked right past my buttons. Right past! Not one of them looked. What sort of raider ignores buttons?');
    await s.say('mallow', 'It\'s not natural, Bramble. A rabbit who doesn\'t want a shiny button has forgotten something important.');
    return;
  }
  if (!flag('c0_pip_done')) { await s.say('mallow', 'Bramble! Buttons for goods, goods for buttons. That\'s trade. That\'s civilisation.'); return; }
  await s.say('mallow', 'Found a button hoard in a log, did you? Lucky beetle, lucky you, lucky me. Let\'s see what it buys.');
}
async function comfrey(s) {
  if (attacked()) {
    if (homeBack()) { await s.say('comfrey', 'Everyone home, and only one sprained paw between them. Teasel, naturally. Showing off.'); return; }
    await s.say('comfrey', 'Nobody\'s hurt. Shaken, every one. I\'ve given away every calming leaf in the warren.');
    if (s.member('burdock')) await s.say('comfrey', 'Burdock, you\'ve chalk in your ears. No, the other ear. Hold still.');
    return;
  }
  await s.say('comfrey', 'Stubbed paw? Sniffles? Bad dreams? Sit. Comfrey fixes most things, and the rest she sits with.');
}

// ---------------------------------------------------------------- the ten (generic rabbits with names)
// Before the tremor / after the tremor / after the attack / home again (fallback if a later chapter writes nothing)
const TEN = {
  'home-1': [ // Clary: grey doe, a sprig of heather behind one ear, the warren's sky-watcher, a born worrier
    ['I watch the sky for hawks every morning. Today there\'s not a single hawk. I find that suspicious.', 'The rumbling lately. It comes at night. I count the rumbles instead of sheep. Fourteen, last night.'],
    ['Fifteen. That\'s fifteen. And that one was in daylight, Bramble. Rumbles don\'t come in daylight.'],
    [],
    ['They kept us in a pen of flint. I counted the stars every night so I\'d remember my own name. Clary. Clary. Still here.'],
  ],
  'home-2': [ // Hob: dark buck with a notched ear, old digger, grumbles about drainage
    ['This bank needs propping. Young diggers today, no respect for drainage. In my day we drained.', 'Rumbling? That\'s water moving deep down. Or it isn\'t. Either way, bad drainage.'],
    ['That was NOT drainage. I\'ve dug forty summers. Ground doesn\'t hum.'],
    ['Shifting rubble. Somebody has to. You go on, I\'ll have this tunnel standing by tea-time. Ish.', 'Forty summers digging, and I never saw chalk come down like that. Like the ground let go.'],
    ['Look at these walls. Straight as a stem. That\'s Hob\'s drainage, that is.'],
  ],
  'home-3': [ // Teasel: ginger buck with a white blaze, a show-off jumper
    ['Watch this! I can clear that gorse in one bound. Nearly. Mostly. Watch anyway!', 'The ground keeps rumbling right when I land. I\'m starting to think it\'s applauding.'],
    ['Did I do that? Was that my landing? No? Shame. That would have been a record.'],
    [],
    ['Raiders made us walk for days. Nobody let me jump. I\'m making up for it. Watch!'],
  ],
  'home-4': [ // Penny (Pennywort): cream doe with a clover flower behind her ear, keeps the clover garden
    ['Mind the clover, Bramble! This patch is for the nursery. You can nibble the wild stuff over there.', 'The clover\'s growing in rings lately. Like ripples. Like something underneath is breathing.'],
    ['Oh! My poor clover, all shaken about. I\'ll have to tell it everything\'s all right. Is everything all right?'],
    [],
    ['I hid in the gorse for three days. I talked to the clover the whole time. It\'s a very good listener.'],
  ],
  'home-5': [ // Nettle: sandy buck with a red neckerchief, prickly, young, talks tough
    ['What? I\'m not scared of a bit of rumbling. I\'m just standing near the exit. For no reason.', 'If it\'s Flintcomb digging, someone should go and tell them to stop. Someone. Not me. But someone.'],
    ['Right. RIGHT. That\'s it. When I\'m bigger I\'m going over to Flintcomb and having words.'],
    [],
    ['I went to Flintcomb. Had words. Turns out you just hum. I\'d rather not talk about it.'],
  ],
  'home-6': [ // Sloe: silver doe, the warren's singer, dreamy
    ['Hm-hm-hmm... Oh! Bramble. I was humming the rumble. It has a tune, if you listen. A sad one.', 'Do you ever think the ground sings? Under all of us? Low, low down?'],
    ['There. Did you hear it? That was a note. A very low, very lonely note.'],
    [],
    ['I don\'t hum any more. I sing. Proper songs, with words. Words are how you keep hold of things.'],
  ],
  'home-7': [ // Bryony: brown doe with a white blaze, the nursery mother; warm, tired
    ['Shh, Bramble, the little ones are finally down. Tread on your big feet softly, love.', 'The kits wake crying every time the ground rumbles. So do I, if I\'m honest. Don\'t tell them.'],
    ['Every kit in this nursery is under my chin, right now, and they can stay there all week.'],
    ['I sat on Pip and Tuft through the whole thing. They wriggled. I sat harder.', 'Bring them home, Bramble. Tansy and the others. Every one of them was a kit in this nest once.'],
    ['Six empty nests filled again. I counted twice. Then I had a little cry. Then I counted again.'],
  ],
  'home-8': [ // Rush: grey buck in a knitted scarf, tunnel-mender, very precise
    ['Root cellar holds forty-two baskets. Forty-one, since Burdock found the carrots. I know it was Burdock.', 'Every time it rumbles, a crack opens in the cellar wall. Hairline. Seven so far. I\'ve named them.'],
    ['Eight cracks. Eight. That one goes right up to the ceiling. I\'m calling it Trouble.'],
    [],
    ['I mended forty yards of tunnel since I got home. Precisely forty. Forty and a bit. I\'m rounding.'],
  ],
  'home-9': [ // Tuft: brown kit, Pip's best friend, a chatterbox
    ['Woodruff\'s story is the BEST one. The thumping bit. I thump so hard my ears go flappy.', 'Pip says if you thump loud enough the sleeper rolls over. I think it just snores louder.'],
    ['Was that the sleeper? Did somebody thump too hard? It wasn\'t me. Probably.'],
    ['I hid. Bryony sat on me. Pip was under there too. Pip\'s elbows are very pointy.', 'When you find Tansy, tell her I\'ve been practising thumping. Every day. For when she\'s back.'],
    ['Everyone\'s back! Well. Everyone except Pip, who keeps going off on adventures. Lucky.'],
  ],
  'home-10': [ // Lichen: old grey doe, half-deaf, naps in the deep passage, remembers the old days
    ['Eh? Oh, Bramble. I nap here. It\'s quiet. Except lately, when it isn\'t. Hum, hum, hum. Like my old mother snoring.', 'When I was a kit, the elders said never to put your ear to that door. So naturally I did. Eh? What did I hear? Nothing. Probably.'],
    ['Did the floor just move? Or did I? At my age it\'s hard to say.'],
    ['Eh? Raiders? I slept through it, down here by the door. They never came this far. Too close to that door, I suppose.', 'The hum\'s louder since the raid, Bramble. Like my old mother snoring, only she\'s been gone forty summers.'],
    ['Everyone home again! Eh? I said EVERYONE HOME AGAIN. Lovely. Now hush, I\'m napping.'],
  ],
};
function tenLines(id) {
  return async (s) => {
    const set = TEN[id];
    let lines;
    if (attacked()) lines = homeBack() || !set[2].length ? (homeBack() ? set[3] : set[2]) : set[2];
    else lines = flag('c0_tremor') ? set[1] : set[0];
    if (!lines || !lines.length) lines = set[0];
    const k = 'c0_talk_' + id; const n = s.val(k) || 0; s.set(k, n + 1);
    await s.say(id, lines[n % lines.length]);
  };
}

async function kitA(s) {
  if (attacked()) { await s.say('c0-kit-a', 'The Great Burrow\'s even BIGGER now! Woodruff says we\'re a proper warren again.'); return; }
  await s.say('c0-kit-a', 'Woodruff says if you thump really hard, the sleeper rolls over and snores! I want to hear it snore.');
}
async function kitB(s) {
  if (attacked()) { await s.say('c0-kit-b', 'I\'m not scared of raiders. I\'m holding my own ears because they\'re cold. Still.'); return; }
  await s.say('c0-kit-b', 'I\'m not scared of the rumbling. I\'m only holding my ears because they\'re cold.');
}

const scripts = {
  ...dispatch,
  'home.yarrow.ch0': yarrow, 'home.woodruff.ch0': woodruff, 'home.mallow.ch0': mallow, 'home.comfrey.ch0': comfrey,
  'c0.kit-a': kitA, 'c0.kit-b': kitB,
};
for (const id of Object.keys(TEN)) scripts[`home.${id}.ch0`] = tenLines(id);
export default scripts;

export const HOME_NAMES = {
  'home-1': ['Clary', 'generic-doe'], 'home-2': ['Hob', 'generic-buck'], 'home-3': ['Teasel', 'generic-buck'], 'home-4': ['Penny', 'generic-doe'],
  'home-5': ['Nettle', 'generic-buck'], 'home-6': ['Sloe', 'generic-doe'], 'home-7': ['Bryony', 'generic-doe'], 'home-8': ['Rush', 'generic-buck'],
  'home-9': ['Tuft', 'generic-kit'], 'home-10': ['Lichen', 'generic-doe'],
};
export { homeLevel };
