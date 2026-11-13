"""Native sizes per figure. Returns a list of (kind, (box_w, box_h), canvas or None).
kind: 'map' (exploration), 'battle', 'small'/'big' (Bramble's Wonderland sizes), 'portrait'."""
BG_SIZE = (640, 360)
BIG = {'badger', 'tin-woodman', 'cowardly-lion', 'rumble', 'kalidah', 'hammer-head', 'wolf-west',
       'mastodon', 'great-head', 'chang-e', 'change', 'glinda', 'good-witch', 'wu-gang', 'traveller',
       'wizard', 'scarecrow', 'guardian', 'duchess', 'cook', 'hatter', 'queen-of-hearts', 'king-of-hearts',
       'knave', 'flamingo', 'stork', 'elevenfold', 'ninefold', 'moving-root', 'star-thing', 'cave-lizard',
       'wicked-witch', 'moth-queen', 'chief-weasel', 'toad-washerwoman', 'winkie-guard', 'card-soldier'}
KIDS = {'pip', 'rabbit-kit'}
HUGE = {'mastodon': ((64, 64), (96, 96)), 'shepherd': ((64, 96), (96, 160)),
        'nightmare-deepdelve': (None, (200, 160)), 'nightmare-flintcomb': (None, (200, 160)),
        'choir': (None, (240, 120)), 'watcher': ((48, 100), (96, 200)), 'sea-monsters': ((160, 64), None),
        'great-head': ((48, 48), (120, 120)), 'queen-of-hearts': ((48, 48), (110, 110)),
        'wicked-witch': ((48, 48), (110, 110)), 'moth-queen': ((48, 48), (120, 110)),
        'chief-weasel': ((48, 48), (100, 100)), 'knave': ((40, 48), (96, 96)), 'ninefold': ((40, 40), (80, 80)), 'elevenfold': ((40, 40), (80, 80))}
BRAMBLE_SIZES = {'small': 16, 'map': 32, 'big': 64}

def base(name):
    for suf in ('-act', '-back'):
        if name.endswith(suf): return name[:-len(suf)], suf
    return name, ''

def sizes_for(name):
    if name.startswith('por-'):
        return [('portrait', (80, 80), None)]
    if name.startswith('prop-'):
        return [('props', (PROP_BOX.get(name, (64, 96))), None)]
    if name.startswith('ico-'):
        return [('icons', (24, 24), (24, 24))] if not name.startswith('ico-ui') and name.split('-',1)[1] not in UI_ICONS else [('icons', (16, 16), (16, 16))]
    if name.startswith('anim-'):
        who = name[5:].split('-hop')[0].split('-idle')[0].split('-nibble')[0].split('-thump')[0]
        if who == 'bramble':
            if '-hop' in name: return [(k, (s, s), None) for k, s in BRAMBLE_SIZES.items()]
            if '-thump' in name: return [('battle', (64, 64), None)]
            return [('map', (32, 32), None)]
        if who in ('rabbit',): return [('map', (32, 32), None), ('kid', (24, 24), None)]
        if who == 'raider': return [('map', (32, 32), None)]
        if 'cheshire' in name or 'witch' in name: return [('battle', (96, 96) if 'witch' in name else (64, 64), None)]
        return [('map', (32, 32), None), ('battle', (64, 64), None)]
    b, suf = base(name)
    if b in HUGE:
        m, bt = HUGE[b]
        out = []
        if m and suf != '-act': out.append(('map', m, None))
        if bt and suf != '-back': out.append(('battle', bt, None))
        return out
    if b.startswith('bramble'):
        out = [('map', (32, 32), None), ('small', (16, 16), None), ('big', (64, 64), None)]
        if b == 'bramble-se': out.append(('battle', (64, 64), None))
        return out
    m = 48 if b in BIG else (24 if b in KIDS else 32)
    bt = 96 if b in BIG else (48 if b in KIDS else 64)
    out = []
    if suf != '-act': out.append(('map', (m, m), None))
    if suf != '-back': out.append(('battle', (bt, bt), None))
    return out

UI_ICONS = set()  # filled by naming: icons named ico-ui-* or listed here are 16x16
PROP_BOX = {}     # per-prop pixel boxes (w = 32 * footprint width, h = listed pixel height + base)

# Prop footprints (w x h tiles) and pixel heights from the design's Props table.
# The box is (w+h)*16 wide and height + (w+h)*8 tall (the footprint diamond plus the object's height).
PROPS = {
 'chest': (1,1,16), 'chest-open': (1,1,18), 'signpost': (1,1,28), 'rest-stone': (1,1,16), 'door-river': (1,1,56), 'door-keyhole': (1,1,56),
 'golden-cap': (1,1,16), 'star-stone': (1,1,10), 'gorse': (1,1,24), 'hawthorn': (1,1,56), 'lookout-stone': (1,1,40), 'hollow-log': (2,1,16),
 'dandelions': (1,1,8), 'warren-entrance': (2,2,28), 'chalk-boulder': (1,1,20), 'fence': (1,1,20), 'root-pillar': (1,1,48), 'moss-bed': (1,2,12),
 'button-shelves': (1,1,40), 'sealed-door': (1,1,48), 'rubble': (1,1,16), 'lantern-mushroom': (1,1,20), 'table': (1,1,16), 'storyteller-seat': (1,1,24),
 'nursery-nest': (1,1,12), 'herb-rack': (1,1,36), 'cellar-baskets': (1,1,20), 'tunnel-heap': (2,1,28), 'dovecote': (1,1,56), 'corn-stook': (1,1,32),
 'hay-cart': (2,1,32), 'bell-post': (1,1,40), 'spoil-heap': (2,1,24), 'flint-wall': (1,1,40), 'store-counter': (2,1,24), 'rim-stones': (1,1,16),
 'willow': (1,1,64), 'boat': (2,1,20), 'toad-hall': (4,2,96), 'snow-tree': (1,1,64), 'badger-door': (1,1,40), 'motor-car': (2,1,28), 'weir-logs': (2,1,12),
 'snow-stump': (1,1,20), 'hearth': (2,1,40), 'settle': (2,1,24), 'banquet-table': (1,1,20), 'dresser': (1,1,48), 'ratty-hole': (1,1,24), 'reeds': (1,1,24),
 'mole-end-door': (1,1,36), 'city-column': (1,1,56), 'tiny-door': (1,1,24), 'glass-table': (1,1,32), 'wonder-mushroom': (2,2,64), 'tea-table': (3,1,24),
 'rose-bush': (1,1,28), 'hoop-card': (1,1,24), 'hedge': (1,1,24), 'drink-stand': (1,1,24), 'cauldron': (1,1,24), 'stove': (1,1,40), 'jury-box': (2,1,32),
 'heart-throne': (1,1,48), 'rabbit-house': (3,1,80), 'armchair': (1,1,28), 'caucus-rock': (1,1,16), 'pool-rock': (1,1,12), 'carved-pillar': (1,1,56),
 'door-eye': (1,1,56), 'stone-face': (1,1,32), 'drowned-column': (1,1,64), 'eye-stair': (2,2,40), 'giant-root': (2,1,40), 'mural-wall': (3,1,56),
 'stone-mouth': (1,1,24), 'ruin-arch': (1,1,48), 'elevenfold-stall': (2,1,40), 'star-rock': (1,1,28), 'ruin-seat': (1,1,20), 'cassia-tree': (2,2,96),
 'palace-gate': (3,1,80), 'mortar': (1,1,24), 'lantern': (1,1,32), 'palace-screen': (2,1,48), 'hare-burrow': (1,1,16), 'crater-rock': (1,1,20),
 'lantern-tree': (1,1,56), 'munchkin-house': (2,2,64), 'brick-bits': (1,1,4), 'poppies': (1,1,12), 'emerald-gate': (3,1,96), 'winkie-tower': (2,2,112),
 'china-house': (1,1,32), 'scarecrow-pole': (1,1,40), 'tree-bridge': (3,1,0), 'green-throne': (1,1,56), 'witch-cupboard': (1,1,48), 'wash-bucket': (1,1,12),
 'mouse-throne': (1,1,20), 'oz-tree': (1,1,64), 'munchkin-fence': (1,1,20), 'winkie-pillar': (1,1,64), 'ditch-rock': (1,1,16), 'giant-mushroom': (2,2,80),
 'glow-crystal': (1,1,24), 'raft': (2,2,0), 'carved-rock': (1,1,24), 'bones': (2,1,16), 'geyser-vent': (1,1,12), 'tube-mouth': (2,1,40), 'fallen-rock': (2,2,48),
 'node-clover': (1,1,24), 'node-flag': (1,1,24), 'node-burrow': (1,1,24), 'thump-stone': (1,1,24),
 'flint-doorway': (2,2,28), 'sprout-patch': (2,2,6), 'feast-spread': (2,2,6), 'dandelion-clock': (1,1,14),   # epilogue
}
for k, (fw, fh, ph) in PROPS.items():
    PROP_BOX['prop-' + k] = (int((fw + fh) * 16 * (1.6 if ph >= 40 and fw * fh == 1 else 1.15 if ph >= 40 else 1)), int((ph + (fw + fh) * 8) * 1.5))
UI_ICONS.update(['camp','pause','mute-on','mute-off','button','supply','stout','swift','wing','eerie','light','afraid','asleep','hummed','shrunk','grown','shielded','stunned','nibble','quest','save','talk','reinforce','rally','moonlight','monkey-drop','tunnel','banner','mail','ration'])
