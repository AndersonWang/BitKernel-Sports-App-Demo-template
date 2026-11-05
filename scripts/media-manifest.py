"""Builds src/config/media.json for Configure › Images / Videos.

Inputs: src/config/media-seen.json (scripts/inventory.mjs: files each screen renders on open) and
STATES below (files only shown after a tap: sheets, tabs, pop-ups). Run after adding screens or assets:
  npx vite --port 4210 &  node scripts/inventory.mjs  &&  python3 scripts/media-manifest.py
"""
import json, os, re, subprocess
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
seen = json.load(open('src/config/media-seen.json'))
reg = open('src/config/registry.js').read()
screens = {m[0]: (m[1], m[2]) for m in re.findall(r"^\s+'?([a-z0-9-]+)'?: \{ name: '([^']+)'.*?journey: '([a-z-]+)'", reg, re.M)}

PAGES = {
    'login': 'Launch & Login', 'home': 'Home', 'fixtures': 'Fixtures', 'predictions': 'Predictions',
    'live-rooms': 'Live Rooms', 'fantasy': 'Fantasy', 'community': 'Community', 'watch': 'Watch',
    'my-space': 'My Space & Profile', 'voting': 'Voting', 'general': 'Notifications, Search & Settings',
}
ORDER = ['Launch & Login', 'Home', 'Fixtures', 'Predictions', 'Live Rooms', 'Fantasy', 'Community', 'Watch',
         'My Space & Profile', 'Voting', 'Notifications, Search & Settings', 'Shared across pages']

# Files that only appear after an interaction: (path prefix, page, where)
STATES = [
    ('assets/comments/', 'Shared across pages', 'Comments sheet (any Comments button)'),
    ('assets/community/cp-up', 'Community', 'Create Post › photos added'),
    ('assets/community/fc-v-', 'Community', 'Fan Club › Watch tab'),
    ('assets/community/av-barolo2', 'Community', 'Fan Club › Posts tab'),
    ('assets/fantasy/crest-', 'Fantasy', 'Pick Team › player details › fixtures'),
    ('assets/fantasy/player-gomez', 'Fantasy', 'Pick Team › player details'),
    ('assets/fixtures/squads/', 'Fixtures', 'Pre-game Stats › Squads tab (also Watch › Stats › Squads)'),
    ('assets/fixtures/success.svg', 'Predictions', 'Prediction ticket › Success pop-up'),
    ('assets/fixtures/table/laliga', 'Fixtures', 'Table tab › league logo'),
    ('assets/live/gift-', 'Live Rooms', 'Live room › Gifts sheet'),
    ('assets/live/jersey-', 'Live Rooms', 'Live room › Shop drawer'),
    ('assets/live/cohost-', 'Live Rooms', 'Live room › Co-Host'),
    ('assets/live/up', 'Live Rooms', 'Live Show › Calendar › Upcoming rooms'),
    ('assets/live/live-bg.webp', 'Live Rooms', 'Live room background (browsers without video)'),
    ('assets/live/start-cover', 'Live Rooms', 'Start a Room › cover added'),
    ('assets/myspace/apple-card', 'My Space & Profile', 'Apple Pay sheet (Wallet, Membership, Live shop)'),
    ('assets/myspace/applepay-side', 'My Space & Profile', 'Apple Pay sheet › side button hint'),
    ('assets/voting/check.svg', 'Voting', 'Vote › confirmation pop-up'),
    ('assets/watch/av-2', 'Watch', 'Watch › live chat'),
]
VIDEO_EXT = ('.mp4', '.webm')
VIDEOS = {
    'assets/live/live-bg.mp4': ('Live room background (Live / Default and your hosted room)', 'assets/live/live-bg-poster.webp', 'MP4 or MOV (H.264), portrait, loops, sound not used'),
    'assets/myspace/avatar-player.webm': ('My Space › Play: avatar', 'assets/myspace/avatar-player-poster.webp', 'Needs a transparent background so the player floats over the page: WebM (VP9 alpha) for Chrome, Edge and Firefox; a .mov with alpha (HEVC or ProRes 4444) is transparent in Safari only. MP4 shows as a solid box. Keep the player in the top half: the avatar card covers the bottom'),
    'assets/myspace/chat-avatar.mp4': ('My Space › Play › Chat: avatar video', 'assets/myspace/chat-avatar.webp', 'MP4 or MOV (H.264), portrait, loops, sound not used'),
}


def short(name):
    return re.split(r' \(| →| \+ | ⇄', name)[0].strip()


def dims(path):
    p = os.path.join('public', path)
    if p.endswith('.svg'):
        return 'SVG'
    try:
        with Image.open(p) as im:
            return f'{im.width}×{im.height}'
    except Exception:
        return ''


def vdims(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', os.path.join('public', path)], capture_output=True, text=True).stdout
    j = json.loads(out)
    s = j['streams'][0]
    return f"{s['width']}×{s['height']}, {float(j['format']['duration']):.1f} s"


# assets/themes/<theme>/ holds a theme's own copies of shipped files (theme-assets.json): not separate images
allf = sorted(p for p in (os.path.relpath(os.path.join(r, f), 'public').replace(os.sep, '/') for r, _, fs in os.walk('public/assets') for f in fs) if not p.startswith('assets/themes/'))
where = {}  # path -> {page: set(where)}
for sid, files in seen.items():
    if sid not in screens:
        continue
    name, journey = screens[sid]
    for p in files:
        where.setdefault(p, {}).setdefault(PAGES[journey], set()).add(short(name))
for p in allf:
    if p in where:
        continue
    for prefix, page, w in STATES:
        if p.startswith(prefix):
            where[p] = {page: {w}}
            break

pages = {k: [] for k in ORDER}
unused = []
for p in allf:
    if p.endswith(VIDEO_EXT):
        continue
    if p not in where:
        unused.append(p)
        continue
    ws = where[p]
    item = {'path': p, 'size': dims(p), 'where': sorted({w for s in ws.values() for w in s})}
    # Used on 4+ pages (crest, logos): one row in Shared instead of a copy in every page
    targets = ['Shared across pages'] if len(ws) >= 4 else sorted(ws)
    for t in targets:
        pages[t].append(item)

videos = [{'path': p, 'label': v[0], 'poster': v[1], 'spec': v[2], 'size': vdims(p)} for p, v in VIDEOS.items()]
# Optional videos: no file ships; each spot shows its still until one is uploaded
videos.append({'path': 'assets/watch/match.mp4', 'label': 'Live match (video players, Watch Party, game-play stills)', 'poster': 'assets/watch/player.webp', 'optional': True,
               'spec': 'MP4 or MOV (H.264), landscape 16:9, loops, sound not used. Plays in: Watch mini player, Video Player, Video Detail, Watch Party, and the game-play cards in Live Rooms (Watch Hall, Host Room). Nothing ships: until you upload one, these spots show their stills', 'size': 'Optional'})
videos.append({'path': 'assets/home/clip.mp4', 'label': 'Clip (Clips View)', 'poster': 'assets/home/clip-view.webp', 'optional': True,
               'spec': 'MP4 or MOV (H.264), loops, sound not used. Fills the screen (cropped to fit), so portrait 9:16 works best. Nothing ships: until you upload one, Clips View shows its still', 'size': 'Optional'})
out = {'pages': [{'name': k, 'items': v} for k, v in pages.items() if v], 'videos': videos, 'unused': unused}
json.dump(out, open('src/config/media.json', 'w'), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in pages.items()}, 'videos', len(videos), 'unused', unused)
