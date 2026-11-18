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
    'sports-highlights': 'Sports Highlights',
}
ORDER = ['Launch & Login', 'Home', 'Fixtures', 'Predictions', 'Live Rooms', 'Fantasy', 'Community', 'Watch',
         'My Space & Profile', 'Voting', 'Sports Highlights', 'Notifications, Search & Settings', 'Shared across pages']

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
    ('assets/live/card3b', 'Live Rooms', 'Live Show › Programs › Today (PK Battle card)'),
    ('assets/live/host-mateo', 'Live Rooms', 'Live Show › Programs › Today (PK Battle card)'),
    ('assets/live/pk-fan', 'Live Rooms', 'Player Knockout › top supporters'),
    ('assets/live/ch-', 'Live Rooms', 'Challenge Room (vote) › the two players'),
    ('assets/live/av-andrew', 'Live Rooms', 'Player Knockout › Gifts sheet (back a player)'),
    ('assets/live/goal-', 'Live Rooms', 'Mission room › goal chips, Live Room Goals, Support Goal'),
    ('assets/live/host-tatiana', 'Live Rooms', 'Call-in room › guest seats once you join'),
    ('assets/myspace/apple-card', 'My Space & Profile', 'Apple Pay sheet (Wallet, Membership, Live shop)'),
    ('assets/myspace/applepay-side', 'My Space & Profile', 'Apple Pay sheet › side button hint'),
    ('assets/voting/check.svg', 'Voting', 'Vote › confirmation pop-up'),
    ('assets/watch/av-2', 'Watch', 'Watch › live chat'),
    ('assets/highlights/hl-', 'Sports Highlights', 'Highlights viewer (Game, Betting, Fantasy, Points)'),
    ('assets/highlights/card-', 'Home', 'Highlights row (Sports Highlights on)'),
    ('assets/highlights/mh-', 'Sports Highlights', 'My Highlights (also My Space › My Highlights)'),
]
VIDEO_EXT = ('.mp4', '.webm')
VIDEOS = {
    'assets/live/live-bg.mp4': ('Live room background (Live / Default and your hosted room)', 'assets/live/live-bg-poster.webp', 'MP4 or MOV (H.264), portrait, loops, sound not used'),
    'assets/myspace/avatar-player.webm': ('Avatar 1: standing video (My Space › Play)', 'assets/myspace/avatar-player-poster.webp', 'Needs a transparent background so the player floats over the page: WebM (VP9 alpha) for Chrome, Edge and Firefox; a .mov with alpha (HEVC or ProRes 4444) is transparent in Safari only. MP4 shows as a solid box. Keep the player in the top half: the avatar card covers the bottom'),
    'assets/live/interactive-feed.mp4': ('Interactive room: live stream (OBS feed)', 'assets/live/interactive-feed.webp', 'MP4 or MOV (H.264), landscape 16:9 (shown in a 375×241 player, cover-cropped), loops, sound not used'),
    'assets/live/ch-a.mp4': ('Challenge Room: left contestant', 'assets/live/ch-a.webp', 'MP4 or MOV (H.264), portrait 188×239 box (shown cover-cropped), loops, sound not used; 10–15 s reads as live'),
    'assets/live/ch-b.mp4': ('Challenge Room: right contestant', 'assets/live/ch-b.webp', 'MP4 or MOV (H.264), portrait 188×239 box (shown cover-cropped), loops, sound not used; 10–15 s reads as live'),
    'assets/live/mission-stream.mp4': ('Mission room: host stream', 'assets/live/mission-stream.webp', 'MP4 or MOV (H.264), portrait 9:16 (fills the room), loops, sound not used'),
    'assets/live/pk-a.mp4': ('PK battle: left player (red side)', 'assets/live/pk-a.webp', 'MP4 or MOV (H.264), portrait 188×345 box (shown cover-cropped), loops, sound not used; 10–15 s reads as live'),
    'assets/live/pk-b.mp4': ('PK battle: right player (blue side)', 'assets/live/pk-b.webp', 'MP4 or MOV (H.264), portrait 188×345 box (shown cover-cropped), loops, sound not used; 10–15 s reads as live'),
    'assets/myspace/chat-avatar.mp4': ('Avatar 1: chat video (Talk with your player)', 'assets/myspace/chat-avatar.webp', 'MP4 or MOV (H.264), portrait, loops, sound not used'),
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
               'spec': 'MP4 or MOV (H.264), landscape 16:9, loops, sound not used. Plays in: Watch mini player, Video Player, Watch Party, and the game-play cards in Live Rooms (Watch Hall, Host Room). Nothing ships: until you upload one, these spots show their stills', 'size': 'Optional'})
videos.append({'path': 'assets/live/callin-stream.mp4', 'label': 'Call-in room: host stream', 'poster': 'assets/live/callin-bg.webp', 'optional': True,
               'spec': 'MP4 or MOV (H.264), portrait 9:16 selfie-style stream of the host talking to camera, loops, sound not used. Fills the room behind the seats and chat. Nothing ships: until you upload one, the room shows its photo with a handheld-camera drift', 'size': 'Optional'})
videos.append({'path': 'assets/home/clip.mp4', 'label': 'Clip (Clips View)', 'poster': 'assets/home/clip-view.webp', 'optional': True,
               'spec': 'MP4 or MOV (H.264), loops, sound not used. Fills the screen (cropped to fit), so portrait 9:16 works best. Nothing ships: until you upload one, Clips View shows its still', 'size': 'Optional'})
HL = [('pre-1', 'hl-game', 'Pregame 1', 'pre', 'clip 1 of 8, red Pregame tag'), ('pre-2', 'hl-game', 'Pregame 2', 'pre', 'clip 2 of 8, red Pregame tag'),
      ('hl-1', 'hl-game', 'Highlights 1', 'hl', 'clips 3-4: Game and Betting'), ('hl-2', 'hl-player', 'Highlights 2', 'hl', 'clips 5-6: Fantasy and Points'),
      ('post-1', 'hl-betting', 'Postgame 1', 'post', 'clip 7 of 8, blue Postgame tag'), ('post-2', 'hl-betting', 'Postgame 2', 'post', 'clip 8 of 8, blue Postgame tag')]
for slug, still, label, phase, where in HL:
    videos.append({'path': f'assets/highlights/{slug}.mp4', 'label': f'Highlight video: {label}', 'poster': f'assets/highlights/{still}.webp', 'optional': True, 'phase': phase,
                   'where': [f'Sports Highlights › Highlights viewer, {where}'],
                   'spec': 'MP4 or MOV (H.264), portrait 9:16 works best (fills the screen, cropped to fit), with sound. Plays as soon as its clip opens and moves to the next clip when it ends; the mute button applies. Until you upload one, the placeholder image shows', 'size': 'Optional'})
for n in (2, 3):
    videos.append({'path': f'assets/myspace/avatar-{n}-player.webm', 'label': f'Avatar {n}: standing video (My Space › Play)', 'poster': 'assets/myspace/avatar-player-poster.webp', 'optional': True, 'avatar': n,
                   'where': [f'My Space › Play › Avatar Switcher, panel {n} (swipe)'],
                   'spec': 'Transparent background so the player floats over the page: WebM (VP9 alpha) for Chrome, Edge and Firefox; Safari shows a WebM\'s transparent area black, so for Safari use a .mov with alpha (HEVC). Portrait, loops, sound not used. Until you upload one, Avatar 1\'s still is the placeholder', 'size': 'Optional'})
    videos.append({'path': f'assets/myspace/chat-avatar-{n}.mp4', 'label': f'Avatar {n}: chat video (Talk with your player)', 'poster': 'assets/myspace/chat-avatar.webp', 'optional': True, 'avatar': n,
                   'where': [f'My Space › Play › Things to Try › Talk with your player, when Avatar {n} is selected'],
                   'spec': 'MP4 or MOV (H.264), portrait, fills the screen, loops, sound not used. Until you upload one, Avatar 1\'s chat still is the placeholder', 'size': 'Optional'})
WHERE = {'assets/live/live-bg.mp4': ['Live Rooms › Live / Default room', 'My Space › your hosted room'],
         'assets/myspace/avatar-player.webm': ['My Space › Play › Avatar Switcher, panel 1', 'Avatar section'],
         'assets/myspace/chat-avatar.mp4': ['My Space › Play › Things to Try › Talk with your player, when Avatar 1 is selected'],
         'assets/watch/match.mp4': ['Watch › mini player', 'Video Player', 'Live Rooms › Watch Party, Watch Hall, Host Room game cards'],
         'assets/home/clip.mp4': ['Home / Watch › Clips View']}
for v in videos:
    if v['path'] in WHERE: v['where'] = WHERE[v['path']]
for v in videos:
    if v['path'] in ('assets/myspace/avatar-player.webm', 'assets/myspace/chat-avatar.mp4'): v['avatar'] = 1
# Configure order: background, the three avatars (standing + chat each), match and clip, then the highlight timeline
rank = lambda v: (0 if 'live-bg' in v['path'] else 1 if v.get('avatar') else 2 if 'highlights' not in v['path'] else 3, v.get('avatar') or 0)
videos.sort(key=rank)
out = {'pages': [{'name': k, 'items': v} for k, v in pages.items() if v], 'videos': videos, 'unused': unused}
json.dump(out, open('src/config/media.json', 'w'), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in pages.items()}, 'videos', len(videos), 'unused', unused)
