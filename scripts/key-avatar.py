# Matte for the My Space avatar video: white-wall flood key (clean edges) + ML silhouette (rembg isnet)
# to recover near-white subject parts the key loses, e.g. the ball's white panels against the wall.
import cv2, numpy as np, glob
from PIL import Image
from rembg import new_session, remove
S = new_session('isnet-general-use')
SH = new_session('u2net_human_seg')  # body silhouette: keeps white jersey stripes, opens the arm/torso gap
def border_bg(im, th):
    m = (im.min(axis=2) >= th).astype(np.uint8)
    n, lab = cv2.connectedComponents(m, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    return np.isin(lab, list(border))
def fill_holes(b):
    b = b.astype(np.uint8); h, w = b.shape
    ff = b.copy(); mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, mask, (0, 0), 1)
    return b | (1 - ff)
import sys, os
for p in sorted(glob.glob('fr/*.png'))[int(sys.argv[1]):int(sys.argv[2])]:
    if os.path.exists('out/' + p.split('/')[-1]) and len(sys.argv) < 4: continue
    im = cv2.imread(p)
    ml = np.array(remove(Image.open(p).convert('RGB'), session=S, only_mask=True))
    R = fill_holes(ml > 25)
    R = cv2.erode(R, np.ones((5, 5), np.uint8))
    wall = np.median(np.concatenate([im[:8].reshape(-1, 3), im[-8:].reshape(-1, 3)]), axis=0)
    H = np.array(remove(Image.open(p).convert('RGB'), session=SH, only_mask=True))
    near = (np.abs(im.astype(np.int16) - wall).max(axis=2) < 16) & (ml < 25) & (H < 10)  # wall seen through gaps (arm/torso)
    s = ((~border_bg(im, 222)) | (R > 0)) & ~near
    s = s.astype(np.float32)
    s = cv2.morphologyEx(s, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    a = np.clip(cv2.GaussianBlur(s, (3, 3), 0.8), 0, 1)
    c = im.astype(np.float32); aa = np.maximum(a, 1e-3)[..., None]
    c = np.clip((c - (1 - aa) * 255) / aa, 0, 255)
    cv2.imwrite('out/' + p.split('/')[-1], np.dstack([c, a[..., None] * 255]).astype(np.uint8))
