#!/usr/bin/env python3
"""The pixel pipeline: art-src/ (1024-scale sources) -> game/assets/ (native pixel sizes).

usage: pixelize.py [names...]      (no names: everything in art-src/figures, art-src/anim, art-src/bg)

Rules (see design "Art direction"):
 1 cut by alpha bounds; 2 pre-shrink by a pseudo-pixel grid when present;
 3 box-reduce straight from the source to the target box; 4 quantize (adaptive, <= 24 colours
 per sprite, no dither); 5 alpha threshold 50%; 6 redraw the outermost opaque ring in Bark.
Sizes come from tools/sizes.py. Every size is made from the source, never from another size.
"""
import sys, os, glob, json
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sizes import sizes_for, BG_SIZE

BARK = (0x3E, 0x2A, 0x1E, 255)
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'art-src')
OUT = os.path.join(ROOT, 'game', 'assets')

def grid_mode(im):
    # run-length mode of equal-colour runs along a few rows
    px = im.load(); w, h = im.size; runs = {}
    for y in range(h // 4, h * 3 // 4, max(1, h // 12)):
        run = 1
        for x in range(1, w):
            if px[x, y][:3] == px[x - 1, y][:3] and px[x, y][3] > 0: run += 1
            else:
                if run > 1: runs[run] = runs.get(run, 0) + 1
                run = 1
    if not runs: return 1
    return max(runs, key=runs.get)

def reduce(im, box_w, box_h, outline=True, colours=24):
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    w, h = im.size
    k = min(box_w / w, box_h / h)
    tw, th = max(1, round(w * k)), max(1, round(h * k))
    g = grid_mode(im)
    if g >= 6 and w / g >= 2 * tw:
        im = im.resize((max(1, round(w / g)), max(1, round(h / g))), Image.NEAREST)
    r = im.resize((tw, th), Image.BOX)
    a = r.split()[3].point(lambda v: 255 if v > 127 else 0)
    rgb = Image.new('RGB', r.size, (0, 0, 0)); rgb.paste(r.convert('RGB'), mask=a)
    q = rgb.quantize(colors=colours, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGBA')
    q.putalpha(a)
    if outline:
        p = q.load(); W, H = q.size; edge = []
        for y in range(H):
            for x in range(W):
                if p[x, y][3] == 0: continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if nx < 0 or ny < 0 or nx >= W or ny >= H or p[nx, ny][3] == 0:
                        edge.append((x, y)); break
        # only outline when the sprite is big enough that an outline doesn't eat it
        if min(W, H) >= 12:
            for x, y in edge: p[x, y] = BARK
    return q

def fit_canvas(img, cw, ch, anchor='bottom'):
    c = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    x = (cw - img.width) // 2
    y = ch - img.height if anchor == 'bottom' else (ch - img.height) // 2
    c.paste(img, (x, y)); return c

def do_figure(path, manifest):
    name = os.path.splitext(os.path.basename(path))[0]
    src = Image.open(path).convert('RGBA')
    for kind, (bw, bh), canvas in sizes_for(name):
        if kind == 'portrait':
            # portraits keep their vignette: no outline, more colours, fill the box
            r = reduce(src, bw, bh, outline=False, colours=32)
            img = fit_canvas(r, bw, bh, 'center')
            d = os.path.join(OUT, 'portraits'); os.makedirs(d, exist_ok=True)
            img.save(os.path.join(d, name + '.png'))
            manifest.setdefault('portraits', {})[name] = [img.width, img.height]
            continue
        r = reduce(src, bw, bh)
        img = fit_canvas(r, canvas[0], canvas[1]) if canvas else r
        d = os.path.join(OUT, 'sprites', kind); os.makedirs(d, exist_ok=True)
        img.save(os.path.join(d, name + '.png'))
        manifest.setdefault(kind, {})[name] = [img.width, img.height]

def do_anim(folder, manifest):
    name = os.path.basename(folder.rstrip('/'))
    frames = sorted(glob.glob(os.path.join(folder, 'f*.png')), key=lambda p: int(os.path.basename(p)[1:-4]))
    if not frames: return
    srcs = [Image.open(f).convert('RGBA') for f in frames]
    # one shared crop for all frames so they don't jitter
    boxes = [s.getbbox() for s in srcs if s.getbbox()]
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes); x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    for kind, (bw, bh), canvas in sizes_for(name):
        outs = []
        for s in srcs:
            c = s.crop((x0, y0, x1, y1))
            # pad so reduce()'s own bbox crop keeps the shared frame
            c.putpixel((0, 0), (0, 0, 0, 1)); c.putpixel((c.width - 1, c.height - 1), (0, 0, 0, 1))
            outs.append(reduce(c, bw * 4, bh))   # fit by height, so the character stays the size of its still
        fw = max(o.width for o in outs); fh = max(o.height for o in outs)
        sheet = Image.new('RGBA', (fw * len(outs), fh), (0, 0, 0, 0))
        for i, o in enumerate(outs): sheet.paste(o, (i * fw + (fw - o.width) // 2, fh - o.height))
        d = os.path.join(OUT, 'anims', kind); os.makedirs(d, exist_ok=True)
        sheet.save(os.path.join(d, name + '.png'))
        manifest.setdefault('anim-' + kind, {})[name] = [fw, fh, len(outs)]

# Where to trim a backdrop that is taller than 16:9: 0 = keep the top, 1 = keep the bottom,
# 0.5 (default) = trim equally. Set one when the centre trim cuts into something that matters.
# bg-intro-1's source was extended upward (sky) so the rabbit on the hill has headroom.
BG_FOCUS_Y = {'bg-intro-1': 0.0, 'bg-intro-3': 0.3}

def do_bg(path, manifest):
    name = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path).convert('RGB')
    W, H = BG_SIZE
    k = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.BOX)
    x = (im.width - W) // 2; y = round((im.height - H) * BG_FOCUS_Y.get(name, 0.5))
    im = im.crop((x, y, x + W, y + H)).quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    d = os.path.join(OUT, 'bg'); os.makedirs(d, exist_ok=True)
    im.save(os.path.join(d, name + '.png'))
    manifest.setdefault('bg', {})[name] = [W, H]

def main():
    names = set(sys.argv[1:])
    mpath = os.path.join(OUT, 'manifest.json')
    manifest = json.load(open(mpath)) if os.path.exists(mpath) else {}
    for p in sorted(glob.glob(os.path.join(SRC, 'figures', '*.png'))):
        n = os.path.splitext(os.path.basename(p))[0]
        if names and n not in names: continue
        do_figure(p, manifest)
    for f in sorted(glob.glob(os.path.join(SRC, 'anim', '*/'))):
        n = os.path.basename(f.rstrip('/'))
        if names and n not in names: continue
        do_anim(f, manifest)
    for p in sorted(glob.glob(os.path.join(SRC, 'bg', '*'))):
        n = os.path.splitext(os.path.basename(p))[0]
        if names and n not in names: continue
        do_bg(p, manifest)
    json.dump(manifest, open(mpath, 'w'), indent=0, sort_keys=True)
    print('manifest:', {k: len(v) for k, v in manifest.items()})

if __name__ == '__main__':
    main()
