"""Shrinks shipped images that are larger than any phone shows them. Visual output is unchanged:
every file keeps at least 3.5x the size it is drawn at (3x retina phones, plus the phone view's zoom on
wide phones), the same format, path, aspect and transparency.

Input: src/config/image-sizes.json, the largest box each image is drawn in across every screen and theme
(scripts/measure-images.mjs, run against the dev servers of the template and each edition).
Images only seen after a tap (sheets, pop-ups) are not measured and are left as they are.
  python3 scripts/optimize-images.py          # dry run
  python3 scripts/optimize-images.py --write
"""
import json, os, sys, math
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DPR = 3.5          # pixels kept per drawn CSS pixel
SHRINK_BELOW = 0.75  # only touch files that are at least 25% larger than needed
write = '--write' in sys.argv
sizes = json.load(open(os.path.join(ROOT, 'src/config/image-sizes.json')))
saved = 0
for path, v in sizes.items():
    p = os.path.join(ROOT, 'public', path)
    if not os.path.exists(p) or not p.endswith(('.png', '.webp', '.jpg')):
        continue
    im = Image.open(p); nw, nh = im.size
    fits = v['fits']
    if any(f.startswith(('contain', 'scale-down')) for f in fits):
        scale = min(v['bw'] / nw, v['bh'] / nh)
    elif any(f.endswith('/bg') and 'auto' in f for f in fits):
        continue  # drawn at natural size
    else:
        scale = max(v['bw'] / nw, v['bh'] / nh)  # cover / fill / bg cover
    need = scale * DPR
    if need >= SHRINK_BELOW:
        continue
    tw, th = math.ceil(nw * need * 1.05), math.ceil(nh * need * 1.05)
    out = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB').resize((tw, th), Image.LANCZOS)
    tmp = p + '.tmp'
    if p.endswith('.png'):
        out.save(tmp, 'PNG', optimize=True)
    elif p.endswith('.webp'):
        out.save(tmp, 'WEBP', quality=92, method=6)
    else:
        out.save(tmp, 'JPEG', quality=92, optimize=True)
    before, after = os.path.getsize(p), os.path.getsize(tmp)
    if after >= before * 0.9:
        os.remove(tmp); continue
    saved += before - after
    print(f'{path}: {nw}x{nh} -> {tw}x{th}, {before // 1024} -> {after // 1024} KB')
    if write: os.replace(tmp, p)
    else: os.remove(tmp)
print(f'{"saved" if write else "would save"} {saved / 1e6:.2f} MB')
