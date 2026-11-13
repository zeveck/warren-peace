#!/usr/bin/env python3
"""contact.py OUT.png KIND [names...] [--scale N]: lay out game-size images on sage at Nx (default 2)."""
import sys, os, glob
from PIL import Image
args=sys.argv[1:]; sc=2
if '--scale' in args: i=args.index('--scale'); sc=int(args[i+1]); args=args[:i]+args[i+2:]
out, kind, names = args[0], args[1], args[2:]
base={'portraits':'game/assets/portraits','bg':'game/assets/bg'}.get(kind, f'game/assets/sprites/{kind}')
if kind.startswith('anim-'): base='game/assets/anims/'+kind[5:]
files=[f'{base}/{n}.png' for n in names] if names else sorted(glob.glob(base+'/*.png'))
ims=[Image.open(f).convert('RGBA') for f in files if os.path.exists(f)]
W=1400; x=y=4; rowh=0; pos=[]
for im in ims:
    w,h=im.width*sc,im.height*sc
    if x+w>W: x=4; y+=rowh+4; rowh=0
    pos.append((x,y)); x+=w+4; rowh=max(rowh,h)
c=Image.new('RGBA',(W,y+rowh+4),(143,174,123,255))
for im,(x,y) in zip(ims,pos): c.alpha_composite(im.resize((im.width*sc,im.height*sc),Image.NEAREST),(x,y))
c.save(out); print(out, len(ims))
