#!/usr/bin/env python3
"""Quick look at figures as the game will show them.
usage: preview.py OUT.png SIZE fig1.png fig2.png ...
Reduces each figure (box filter, alpha threshold 50%) so its longer side is SIZE,
and lays them out at 1x and 3x on sage green, with the style anchor for comparison."""
import sys
from PIL import Image
out=sys.argv[1]; size=int(sys.argv[2]); figs=['game/assets/style-anchor.png']+sys.argv[3:]
def red(p,s):
    im=Image.open(p).convert('RGBA'); bb=im.getbbox(); im=im.crop(bb) if bb else im
    w,h=im.size; k=s/max(w,h); r=im.resize((max(1,round(w*k)),max(1,round(h*k))),Image.BOX)
    r.putalpha(r.split()[3].point(lambda v:255 if v>127 else 0)); return r
anchor_size=32
rs=[red(figs[0],anchor_size)]+[red(p,size) for p in figs[1:]]
W=sum(r.width*4+12 for r in rs)+8; H=max(r.height for r in rs)*4+24
c=Image.new('RGBA',(W,H),(143,174,123,255)); x=8
for r in rs:
    c.alpha_composite(r,(x,8)); big=r.resize((r.width*3,r.height*3),Image.NEAREST)
    c.alpha_composite(big,(x+r.width+4,8)); x+=r.width*4+12
c.save(out); print(out)
