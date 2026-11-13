#!/usr/bin/env python3
"""Cut a transparent sheet into separate figures.
usage: cut_sheet.py SHEET.png name1 name2 ... [--rows N] [--out art-src/figures] [--min 2000]
Figures are found as connected blobs of alpha>40 (blobs closer than 12 px merge),
ordered row by row (top to bottom, then left to right), and each saved cropped
with an 8 px transparent margin as <out>/<name>.png. Use '-' as a name to skip one.
Prints what it found; fails if the count of big blobs doesn't match the names."""
import sys, os
from PIL import Image, ImageFilter
args=sys.argv[1:]; out='art-src/figures'; rows=None; minarea=2000
def take(flag):
    global args
    if flag in args:
        i=args.index(flag); v=args[i+1]; args=args[:i]+args[i+2:]; return v
v=take('--out'); out=v or out
v=take('--rows'); rows=int(v) if v else None
v=take('--min'); minarea=int(v) if v else minarea
sheet=args[0]; names=args[1:]
im=Image.open(sheet).convert('RGBA'); W,H=im.size
a=im.split()[3].point(lambda v:255 if v>40 else 0)
m=a.filter(ImageFilter.MaxFilter(25))  # merge nearby parts (ears, tails, props)
px=m.load(); seen=bytearray(W*H); blobs=[]; lab={}  # lab: grid point -> blob id (for masking neighbours out)
for y in range(0,H,2):
    for x in range(0,W,2):
        if px[x,y] and not seen[y*W+x]:
            st=[(x,y)]; seen[y*W+x]=1; x0=x1=x; y0=y1=y; n=0; pts=[]
            while st:
                cx,cy=st.pop(); n+=1; pts.append((cx,cy))
                x0=min(x0,cx);x1=max(x1,cx);y0=min(y0,cy);y1=max(y1,cy)
                for dx,dy in ((2,0),(-2,0),(0,2),(0,-2)):
                    nx,ny=cx+dx,cy+dy
                    if 0<=nx<W and 0<=ny<H and px[nx,ny] and not seen[ny*W+nx]:
                        seen[ny*W+nx]=1; st.append((nx,ny))
            if n*4>=minarea:
                for q in pts: lab[q]=len(blobs)
                blobs.append([x0,y0,x1+2,y1+2,len(blobs)])
# order: rows, then left to right. A blob joins a row when it overlaps the row's vertical span by at least
# a third of the smaller height (objects of very different heights in one row stay one row). --rows 1 forces one row.
blobs.sort(key=lambda b:b[1])
rowsl=[]
for b in blobs:
    if rows==1 and rowsl: rowsl[0][1].append(b); continue
    placed=False
    for r in rowsl:
        top,bot=r[2],r[3]
        ov=min(bot,b[3])-max(top,b[1]); mh=min(bot-top,b[3]-b[1])
        if ov>=mh/3: r[1].append(b); r[2]=min(top,b[1]); r[3]=max(bot,b[3]); placed=True; break
    if not placed: rowsl.append([(b[1]+b[3])/2,[b],b[1],b[3]])
rowsl.sort(key=lambda r:r[2])
ordered=[b for r in rowsl for b in sorted(r[1],key=lambda b:b[0])]
print(f'{sheet}: {len(ordered)} figures in {len(rowsl)} rows; names given {len(names)}')
if len(ordered)!=len(names):
    for b in ordered: print('  blob',b[:4])
    sys.exit('count mismatch: fix the names or regenerate the sheet')
os.makedirs(out,exist_ok=True)
for b,nm in zip(ordered,names):
    if nm=='-': continue
    bx0,by0,bx1,by1=max(0,b[0]-8),max(0,b[1]-8),min(W,b[2]+8),min(H,b[3]+8)
    c=im.crop((bx0,by0,bx1,by1)); cp=c.load()
    # clear pixels that belong to a neighbouring blob whose box overlaps this one
    for yy in range(c.height):
        for xx in range(c.width):
            if cp[xx,yy][3] and lab.get(((bx0+xx)//2*2,(by0+yy)//2*2),b[4])!=b[4]: cp[xx,yy]=(0,0,0,0)
    # keep only the real alpha content
    bb=c.getbbox()
    c=c.crop(bb) if bb else c
    pad=Image.new('RGBA',(c.width+16,c.height+16),(0,0,0,0)); pad.paste(c,(8,8))
    pad.save(os.path.join(out,nm+'.png')); print('  ',nm,pad.size)
