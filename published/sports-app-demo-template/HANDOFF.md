# Sports App Demo — handoff (start here)

Last updated 6 Nov 2026 · framework v1.1.0 · template package (Real Betis by default, every theme) · owner Anderson Wang (BitKernel Design)

A configurable, client-brandable sports app prototype, built 1:1 from Figma. One build serves every client: Configure swaps the theme, images, copy and which journeys show. The rest of the content is fixed in code and needs a developer agent to change.

---

## 1. What's in this package

Every package carries three guides scoped to it: **README.md** (part 1 for the BD team, part 2 for AI agents), **CONFIGURATION.md** (Configure, with that package's defaults) and **HANDOFF.md**. The template's HANDOFF is this file; each team edition has its own (`src/editions/<id>/HANDOFF.md`).

| Package | Scope | Contents |
|---|---|---|
| `BitKernel-Sports-App-Demo-source.zip` | Template + all editions, source code | Code, all images, `README.md`, `CONFIGURATION.md`, `HANDOFF.md` (this file), `AGENT-SETUP.md` |
| Template offline copy (Configure › Download offline copy on the template link) | Template, built | The demo + the three guides (template scope) |
| `junior-fc-sports-demo_v<version>.zip` | Junior FC only, built | The demo + the three guides (Junior scope) |
| `boca-juniors-sports-demo_v<version>.zip` | Boca Juniors only, built | The demo + the three guides (Boca scope) |
| `configurable-prototype-plan.md` (project doc) | Background | Full decision log and change history |

**Keeping the guides current** (`scripts/docs.mjs`): README and CONFIGURATION are generated from `docs/README.md.tpl` and `docs/CONFIGURATION.md.tpl` with each package's values (version, links, theme, journeys, image and video lists, copy defaults, themed-photo counts). Every build writes all three guides into its output folder; `npm run docs` refreshes the source folder's README.md and CONFIGURATION.md. When something changes: edit the templates, this file, or the edition's HANDOFF.md (open questions, change log), never the generated copies.

## 2. Two ways to work

**A. Reskin with Configure (no code, no Claude).** Open the demo, or `index.html` from an offline zip, then go to **Configure**:
- Client name and slug (the slug names exported files and the offline copy's saved settings)
- Theme: one of the 10 Figma client modes, or a token JSON exported from Figma
- Journeys on/off (each journey's entry points hide with it)
- **Images: every image in the demo (about 290), one accordion per page** (Brand, Home, Fixtures, Predictions, Live Rooms, Fantasy, Community, Watch, My Space & Profile, Voting, Notifications/Search/Settings, Shared across pages). Each row says which screens show it and the shipped size. The 20 key images (crest, login logo, club badge, stadium banner, home banners, opponents, player photo, Watch still, Monthly Stars, voting candidate, profile photo, avatar) sit at the top of their page with a plain-language label. One upload replaces the image everywhere it appears. A search box finds images by page, screen or file name
- **Videos:** the 3 looping videos (live room background, My Space avatar, avatar chat), plus 2 optional ones with no shipped file: **Live match** (Watch mini player, Video Player, Watch Party, and the game-play still cards Watch Hall / Host Room) and **Clip** (Clips View only). Until uploaded, those spots show their stills. MP4, MOV or WebM. Each upload is checked: a codec this browser can't play (iPhone HEVC .mov in Chrome, ProRes) is refused with how to re-export; HEVC/ProRes that does play gets a Safari-only warning. The avatar needs a transparent background: WebM (VP9 alpha) for Chrome/Firefox, alpha .mov for Safari
- 24 copy fields, grouped the same way: club name, full name, B team, fan name, stadium, hashtags, slogan, competition, opponents, kick-off/league/venue, player name, Watch show + channel, Monthly Star names, fan-club prefix, voting title + lead candidate, username, membership
- Placeholders inside copy (and inside the demo's post text): {team} {full} {fans} {stadium} {tags}
- **Export config** saves a `.json` that someone else can import with **Import config**. **Download offline copy** makes a zip that opens from disk and starts with these settings.

Limits: images up to 10 MB, videos up to 60 MB. Uploads are stored in the browser's IndexedDB (settings keep a short `idb:` reference), so they live in that one browser only. Export config carries them inside the .json; the offline zip carries them as files in `media/`.

**B. Change the code (Claude or a developer).** Screen copy outside the copy fields (product names, academy names, post text) is fixed in the build. A permanent reskin replaces files in `public/assets/` and strings in `src/screens/`. Follow `AGENT-SETUP.md`.

## 3. Run and build

```bash
npm install
npm run dev        # http://localhost:5173  → #play and #configure
npm run build      # dist/ (iife bundle; opens from file://)
npm run preview    # serves dist/ — Download offline copy needs this, or the hosted page
```

`npm run build` also writes three files the hosting and packaging rely on:
- `dist/artifact.html`: the page without its document skeleton, for claude.ai hosting
- `dist/standalone.html`: becomes `index.html` inside offline zips
- `dist/files.json`: the list of files the offline zip copies

Node 18+ is enough (tested on 22).

## 4. Code map

| Path | What |
|---|---|
| `src/config/registry.js` | **Every screen** (id → Figma node, status built/pending, journey, `overlay`), journeys, app-bar tabs, image slots, copy fields |
| `src/config/store.js` | Settings: defaults, saved in browser storage (key per packaged client), migrations |
| `src/proto/runtime.jsx` | Navigation: `go`, `back`, `tab`, `swap` (in-page tabs), `popTo`, `replace`, `dead()` ("Not part of this demo"), `notify`, comments sheet |
| `src/app/Player.jsx` | Phone frame; overlay screens draw over the screen underneath |
| `src/app/Dashboard.jsx`, `src/app/package.js` | Configure page; offline zip packaging |
| `src/config/media.json`, `media.js` | Configure › Images/Videos list (generated) and IndexedDB storage for uploads. Every image goes through `asset(path)` in `ui.jsx`, which returns the upload if there is one. Don't build image URLs at module level (they'd miss uploads): use a function or getter |
| `scripts/inventory.mjs`, `scripts/media-manifest.py` | Regenerate `media.json` after adding screens or images: `npx vite --port 4210 &`, `node scripts/inventory.mjs`, `python3 scripts/media-manifest.py`. Images shown only after a tap are listed in `STATES` in the .py |
| `src/components/ui.jsx` | Shared parts: Header, AppBar, Button, Icon (CSS-mask SVGs from `src/assets/icons`), SectionTitle, cards |
| `src/screens/*.jsx` | One file per area: home, auth, watch, video, pregame (Fixtures/Predictions, teammate code), fantasy (teammate code), myspace, avatar, wallet, voting, liverooms, liveroom, community, general, clipview |
| `src/proto/proto.css` | All screen CSS, on token variables only |
| `src/tokens/semantics.json` | Figma `Semantics` collection: 10 client modes → CSS variables (`--colour-text-primary` = `colour/text/primary`) |
| `public/assets/<area>/` | Images (WebP at 2× display size) |

## 4b. Editions and client themes (since v58)

One source, three builds:

| Build | Command | Output | Defaults | Theme list | Hosted |
|---|---|---|---|---|---|
| **Template** (keep for future clients) | `npm run build` | `dist/` | Real Betis | all 12 modes, incl. Junior de Barranquilla (Light) and Boca Juniors (Light) | existing Sports App Demo artifact |
| **Junior FC edition** (client demo) | `npm run build:junior` (`.env.junior`) | `dist-junior/` | Junior FC / junior-fc | Junior only | separate artifact "Junior FC Sports App Demo" (private until shared) |
| **Boca Juniors edition** (client demo) | `npm run build:boca` (`.env.boca`) | `dist-boca/` | Boca Juniors / boca-juniors | Boca only | separate artifact "Boca Juniors Sports App Demo" (private until shared) |

Editions ship only their own theme folder. The template build packs Boca's photos into one file (`assets/themes/boca-juniors-light.pack.js`, loaded when the theme is selected; `src/tokens/themePacks.js`, `PACKED` in `vite.config.js`) because the artifact host allows 511 files per artifact. Only photos are packed: a packed theme's videos stay plain files in its folder (9 Nov), so the pack stays small and videos load only when played. Theme photo URLs carry `?v=<hash of the theme folder>` so a re-exported photo isn't served from cache, while an unchanged theme stays cached.

**Theme engine** (from Conor's Junior pack, `patch/theme-engine.patch`, merged by hand where it conflicted). A theme mode can bring its own photos, text, league table and opening-animation colours:
- `src/tokens/theme-assets.json`: per-theme image swaps; the copies live in `public/assets/themes/<theme>/<same path>`. `asset(path)` order: Configure upload → theme copy → shipped file.
- `src/tokens/theme-text.json`: the pack's copy defaults and find/replace rules, applied by `tx()` and by `useFill()`. Copy lookup order: Configure value → theme default → build default.
- `src/tokens/theme-text.template.json` (template build) and `src/editions/junior/theme-text.json` (Junior build): our additions for pages the pack doesn't cover. `before`/`after` rules run around the pack's rules; `lists.fanclubs` replaces the Fan Clubs list. Template = generic, non-team copy; Junior build = team-specific copy.
- `src/tokens/theme-squads.json`: per-theme squad names and bench photos for Pre-game › Squads (Junior's came from a hand edit someone published straight to the Junior artifact on 4 Nov; ported to source so rebuilds keep it).
- `src/tokens/theme-tables.json` (league table), `theme-launch.json` (Loading Screen gradient; Configure › Opening animation can override).
- Conor's fixes also came in: Fantasy player tap no longer crashes; an error screen with Reload replaces a blank page; theme/config import checks.
- To add another client theme: get a pack like Conor's (or add entries to the four theme-*.json files + a mode in `semantics.json`), add a Junior-style edition file if the client needs its own build.

**Junior: what is themed and what is not** (as Conor's instructions require, nothing was guessed; the club round badge is the only image made here, from Junior's own crest and launch colours):

| Page | Junior images | Still the shipped (Betis/LaLiga-era) images |
|---|---|---|
| Home | 31 of 39 | Who Wins / Post-match / Fan Derby banners, bottom-banner player, Voting cards, photo viewer |
| Fixtures | 17 of 52 | away squad and bench headshots (home XI, coach and most bench rows have Junior photos and names since 4 Nov), player page photo, Spain flag, Club World Cup / Libertadores logos (league table uses Junior's own) |
| Live Rooms | 13 of 49 | shop jerseys, co-host cams, PK battle, Watch Party video, start-room cover, room background video |
| Fantasy | 5 of 25 | Premier League kits and crests (Fantasy is a Premier League game in Figma) |
| Community | 1 of 27 | Monthly Star photos, post photos/videos, fan club banner and Live Now still (Betis players) |
| Watch | 22 of 38 | live channel still, TV channel logos, chat avatars |
| My Space | 18 of 32 | membership collage, chat avatar video, profile photo (avatar video, poster and banner still are Junior since 4 Nov: keyed from Anderson's Junior player video, same pipeline as Betis) |
| Voting | 0 of 10 | campaign banner and candidate photos |
| Videos | 1 of 3 | live room background and avatar chat still show Betis kit |

Text on every screen was checked under Junior: no "Betis", "LaLiga", "Sevilla" or "Villamarín" left. Remaining on purpose: "FC Barcelona vs Athletic Club" in the Watch TV guide (a third-party channel listing) and "Antony / Fornals" as Goal Scorers in match Predictions (player names, like the headshots).

**Open items for the client / team** (carry over):
- The Junior mode is **not in Figma yet**, by decision (Anderson will add it by hand). Until then the next token sync from Figma would drop it. Source export: Conor's pack `data/junior_barranquilla_light_tokens.json`.
- League standings (points, goal difference) are placeholder demo numbers.
- Venue: the demo says Estadio Metropolitano (Barranquilla). 2026 reports say Junior plays home games in Cartagena during the renovation. Confirm with the client.
- Team page Trophies "Last won" years are LaLiga-era placeholders (e.g. Copa Libertadores "Last won 2021": Junior has not won it). Fix with the client's real honours.
- Photos were supplied by the client for demo use; check usage rights before any external showing.
- Junior edition copy to confirm: fan name "Junioristas", slogan "¡Junior, tu papá!", channel "Junior TV", show "Junior Tonight", fan clubs (Bogotá, El Prado, Barrio Abajo, Medellín, Santa Marta, Cartagena), voting "Reina Rojiblanca 2026", derby rival "Unión Magdalena", B team "Junior Sub-20". Player names (Monthly Stars, player page) are fictional on purpose: the photos are still Betis players, so real Junior names would mislabel real people.

**Junior FC theme assets (5 Nov):** Anderson's Configure setup (28 files: banners 1–3 and bottom player, stars, community posts, jerseys, co-host, start cover, profile avatar, Watch chat avatar, and the live-bg, avatar-player, chat-avatar, clip and match videos) is built into the Junior theme: files in `public/assets/themes/junior-de-barranquilla-light/`, listed in `src/tokens/theme-assets.json`. The Junior edition shows them by default; the template shows them when the Junior theme is selected; Betis is unchanged. The optional match/clip videos count as set when the theme has a copy (`isChanged` in `ui.jsx`). Banner 3 now has its own default file (`assets/home/banner-3.webp`) so it can be themed separately. To change one: replace the file at the same path (images WebP, videos H.264 under 15 MB, the artifact host's per-file limit). The Junior storage key moved to `bk-proto-config:junior-fc:2`, so old local uploads no longer override these. Configure › Reset on a row returns that spot to the theme file.

**Boca Juniors (5 Nov, ported from Conor's package `boca-juniors-sports-demo.zip`, built on the Junior edition v19 by hand-editing the bundle):** review in the project doc `claude/boca-review-2026-11-05.md`. Theme data: tokens (navy #0e2c52 / #0a213e, gold #f8c100 in the launch gradient), `theme-text.json` (pack copy and rules), `src/editions/boca/theme-text.json` (team copy) and its generic twin in `theme-text.template.json`, `theme-tables.json`, `theme-squads.json`, 177 files in `public/assets/themes/boca-juniors-light/`. His edits to shared screens became theme data so Betis and Junior keep theirs:
- `exact` (pack): whole-string swaps checked before rules (180 cm, 32 yrs, ARG, Lanús, Vélez Sarsfield on the player profile).
- `cup` (pack): matches against Palmeiras / Flamengo are labelled Copa Libertadores (match cards and Pre-game Stats). `cupFor()` in `ui.jsx`.
- Home player names outside the pitch view (match events, Goal Scorers) follow the theme squad by line-up slot (`PGS_pname` in `pregame.jsx`); off-line-up names use `players` in `theme-squads.json` (Boca: Antony → Paredes). Junior's match events now show Junior names too.
- Fantasy player (Di Lollo), clip titles and the "Riquelme" live room: `before` rules in the edition text.
- `shortName("Boca Juniors")` = Boca; `clubFC` adds no "FC" to "… Juniors".
- 9 Nov: Boca media from Anderson's export `boca-junior-client_v1.1.0_2026-11-09.zip` merged into the theme: live-room video (`live/live-bg.mp4`, also used for the Home clip via `same`), avatar chat video (`myspace/chat-avatar.mp4`, re-encoded CRF 19), new home, away and third jerseys (`live/jersey-1..3.webp`, transparent, jersey-big = jersey-1 via `same`). The live-room `stills` fallback is removed. Its Watch match video was not used: it is the Junior vs Santa Fe footage.
- CSS from his package for every theme: video progress bar and knob use the brand colour (were Betis green everywhere); long club names wrap in tables; wider coach surname.
- 5 Nov optimisations applied: banner 3 has its own Boca file, theme videos count as set, storage key `bk-proto-config:boca-juniors:2`. His `?v=12` and `voting/../home/vote-1.webp` workarounds replaced by the build cache-buster and path normalising in `themedPath`.

## 4c. Phones (client link)

On a touch screen up to 600px wide (any phone in portrait), Play is the app alone, full screen: no top bar, no journey list, no phone frame (`MobilePlayer` in `src/app/Player.jsx`).
- The 375px Figma layout is zoomed to the screen width (CSS `zoom`, so every Figma pixel position holds) and the device takes the screen's height (screens scroll inside, app bar stays at the bottom).
- It starts on the first journey that is on (Launch & Login, else Homepage); the app's own navigation moves between journeys.
- The fake 9:41 status bar and the Create Post keyboard image are hidden (the phone has real ones); inputs use 16px so iOS doesn't zoom on focus.
- Landscape shows "Turn your phone upright". Desktop, tablets and narrow desktop windows keep the journey list (the switch only happens on touch screens).
- To test on a computer: Chrome DevTools › device toolbar (it emulates touch). Configure is still at `#configure` on a phone.
- Share setting: our organization allows outside access to claude.ai links only by email invite. For an open client link, use a web server (see the Play-only client link plan).

## 4f. Play-only client link (phase 1, 6 Nov)

Plan and decisions: Claude Doc "Play-only client link: plan" (https://claude.ai/artifact/XvrVmGygUyFM3tRdQUYXkp). Default host: a company web server or a Vercel-style static host; claude.ai as backup.
- **Two pages per build** (`scripts/build.mjs` runs Vite twice into the same folder): `index.html` + `assets/app.js` (owner, with Configure) and `play.html` + `assets/play.js` (client, `__PLAY_ONLY__`: no Configure code, no `#configure`, settings only from the config file, nothing saved; a visitor's avatar, cart and votes reset on reload).
- **Configure › Save & share › Client link**: optional password (salted SHA-256 in `config.access`, plain-JS `src/app/sha256.js` so it works on file:// and http; remembered per browser) and **Export client package** (`buildClientZip` in `src/app/package.js`): play.html → `index.html` pointing at `config.<exportId>.js`, `publish.json` `{id}`, only the selected theme's folder/pack, `media/` uploads, a short README. No team guides, no Configure bundle.
- **Updates** (`src/app/client.jsx`): on http(s) the client page fetches `publish.json` every 30 s (no-store); a new id is applied at the next screen change by reloading with `?v=<id>&screen=<screen>`, which fetches a fresh `index.html` and reopens that screen. From disk it never checks.
- **Limits:** the password stops people who only have the link; files stay reachable by direct address. Not live: changes need an export and upload. Phase 3 (live sync on claude.ai) dropped.

## 4d. Framework version (since v1.1.0, 6 Nov)

Configure shows `Sports App Demo framework v1.1.0 · Updated 6 Nov 2026` at the top. It is the version of the shared code, the same for every team (template and all editions). Source: `version` in `package.json` plus the date of the last git commit, stamped at build (`vite.config.js`, `src/version.js`; without git, the build date). It also goes into each offline zip's README and into "Copy error details".
- Bump `package.json` "version" with each release that changes how the demo works: minor (1.2.0) for features, patch (1.1.1) for fixes. Team content changes (photos, copy) don't bump it.

## 4e. Loading speed (6 Nov)

- Images: `scripts/measure-images.mjs` records the largest box every image is drawn in on every screen of the template and each edition (`src/config/image-sizes.json`); `scripts/optimize-images.py --write` shrinks any file to 3.5x that box (3x retina phones plus the phone-view zoom). Same paths, formats and transparency; checked at 3x against the previous build (differences only in resampling of crests). Images only seen after a tap are left alone. Run both after adding or replacing large images.
- Videos: Junior's live-room video re-encoded (H.264 CRF 19, web-optimized so it starts before it has fully downloaded, silent track removed; SSIM 0.991) and chat avatar likewise. Junior's clip was the same file as the live-room video: `same` in `theme-assets.json` now points it at that one file, so it downloads once.
- JS: JSZip (95 KB) loads only when someone packages a zip (`public/assets/vendor/jszip.min.js`).
- Caching: theme photos carry `?v=<hash of that theme folder>`, so they stay cached across releases until the theme itself changes.
- Prefetch: once a screen settles, the images of the other screens in its journey load in the background (3 at a time, low priority; skipped on Data Saver and 2G) (`src/app/prefetch.js`).
- Plan for a Play-only client link: Claude Doc "Play-only client link: plan" (https://claude.ai/artifact/XvrVmGygUyFM3tRdQUYXkp).

## 4g. Template only, v1.2.0 (9 Nov)

Decision (Anderson, 9 Nov): only the template is built and published. Junior FC and Boca are set up in it and delivered as client packages; their separate builds and owner artifacts (Junior v26, Boca v7) are frozen. The `build:junior` / `build:boca` scripts still work but are not used.

- **Team data in every build:** `themeText.js` merges `src/editions/<id>/theme-text.json` for its own theme in every build (no more `VITE_EDITION` switch). The preset avatar (`presetAvatar()` in `myspace.jsx`, Andrés Pacheco) takes its league and club from the theme's copy (`fixture.league`, `team.main`); edits in Customize last until reload.
- **Settings per theme** (`store.js`): `switchTheme(mode)` parks the current settings in localStorage `<key>:themes` and restores the other theme's, or `defaultFor(mode)` (client name = theme name without the mode). `pruneMedia` keeps uploads any parked theme still uses. Configure › Reset all resets the current theme only.
- **Sections** (`src/config/sections.js`, Configure › Sections): `config.sections = { order, names, custom: [{ id, name, start }] }`; on/off stays in `config.flags`. A custom section opens on an existing screen and is enabled only if that screen's journey is on. New registry entries: `avatar` (listOnly: a shortcut to `avatar-play`; its screens belong to My Space) and `live-betting`, `sports-highlights` (`inDesign`, always off, greyed in Configure, never in Play).
- **Client package naming** (`teamName`, `clientZipName` in `store.js`; `buildClientZip`): the package carries the theme's name without the mode (Default, Adult, Religion fall back to the client name): `Boca-Juniors_Demo_v1.2.0_Nov09.zip`, `<title>Boca Juniors_Demo</title>`, the same name in the gate, top bar, section list, crash screen and README. Desktop section list ends with `v<version> · Updated <export time>` (client page only).
- **Thumbnail preview** (Configure › Images / Videos): `MediaPreview` in `Dashboard.jsx`.
- **Safari / iPhone avatar** (`src/components/alphaVideo.jsx`): Safari and all iOS browsers play `myspace/avatar-player-alpha.mp4` (H.264, picture on top, mask below) through WebGL; make one with `sh scripts/stack-alpha.sh <avatar-player.webm>`. Boca's poster is now a frame of its own video. Uploaded avatar videos are not converted: in Safari they show without transparency.
- **Configure buttons:** `.app-ghost` now renders as a light button (it was overridden by the primary button rule).

## 5. Status (screens built)

| Journey | Built |
|---|---|
| Launch & Login | Launch, Login |
| Homepage | All sections; Clips View overlay; Photo Albums + Photo viewer (Like/Unlike) |
| Fixtures | Upcoming, Results, Leagues, Pre-game / Post-game / Live stats, League & Team pages, Player |
| Predictions | Off Day, Ranking, match Predictions → ticket → success |
| Live Rooms | Calendar, Programs (Today/Future, reminders), Shows; Live room (gifts, co-host, shop → Apple Pay → order), Watch Party, Challenge Room. Start a Room → host view |
| Fantasy | Home, Pick Team |
| Watch | All 16 screens (incl. Watch / Stats from the mini-player Stats icon) |
| My Space & Profile | My Space, Social Profile, Avatar (Play/Create/Chat), Wallet + recharge, Settings, Membership (Pick your plan → Apple Pay) |
| Voting | Campaign, Candidate (+ voted state, pop-up) |
| Community | Teams (Vote → Voted_Progress Bar), Posts feed (poll, video, 1/2/9-photo posts), Create Post → Publishing → Published toast, Fan Clubs, Fan Club page (Watch / Posts / Missions › Tip Goals, Join Group ↔ Joined) |
| General | Notifications, Search (open from every header bell / search), Settings (from My Space) |

Unbuilt screens keep the header and app bar, so a journey never dead-ends.

## 6. Rules (keep these)

1. **Figma → code only.** Don't add or change layout that isn't in Figma. If Figma is wrong or inconsistent, build it as designed and flag it.
2. **Tokens only.** Every colour, spacing and radius uses a token CSS variable. Primitives that aren't semantic tokens (e.g. `gold/600`) are hard-coded with a comment saying so.
3. **Register every screen** in `registry.js` with its Figma node id and status.
4. **Icons:** export rendered SVGs through the Figma Plugin API (`exportAsync`) from the instance on the screen. The MCP asset URLs often point at the wrong glyph (the main component, not the swapped one).
5. **Images:** WebP at 2× display size. Video fills can't be exported from Figma: use a still and ask for the video.
6. **Edit the source, never the published bundle.** A teammate edited the built `assets/app.js` directly several times and each edit had to be ported by hand. Rebuild from source and republish.
7. Figma strokes sit inside the frame: use `box-shadow: inset` or a fixed height so borders don't add size.
8. Interactions: hotspots with no destination in Figma call `nav.dead()`. Overlays (live rooms, Clips View) slide up and close with X.
9. **Keep each package's guides current** (§1): open questions and change log in the right HANDOFF, then rebuild so README/CONFIGURATION regenerate.

## 7. Known issues / open questions

- Boca (client to confirm): squad and coach names are placeholders per Conor; league table shows 15 of 30 clubs with placeholder points; real people (Riquelme, current players, star photos) need rights checks; no Boca live-match video yet (Watch, Watch Party; the export's match video was Junior's footage); live-room photos are 524–686 px tall, soft on a phone at 2x.

- Safari compatibility (5 Nov, second pass): the Loading Screen's WebGPU shader now runs only in Chromium browsers (Chrome, Edge, Arc, the Claude desktop app); Safari and Firefox get the same colours as a CSS-animated gradient. Every screen is wrapped in its own error guard: a screen that fails shows "This screen couldn't open" with Go back / Home and a "Copy error details" button (error, screen id, browser, stack), and the rest of the demo keeps working. `app.js` is loaded as `app.js?v=<build>` so browsers can't keep running an old cached bundle after a fix.
- Fixed 5 Nov: "This screen hit an error · Type error" on Play in Safari 26 / iOS 26 (browsers with WebGPU but no ResizeObserver 'device-pixel-content-box'). The Loading Screen shader now falls back, and a shader failure can only hide the animation (the gradient stays), never crash the demo. Zips and source copies made before 5 Nov still have the bug.

- Video fills: export with Figma MCP export_video from a temporary clone of the frame with its layers removed (match the timeline duration), then delete the clone. Live / Default uses this (v53).
- Figma data inconsistencies kept as designed: Programs dates (Oct 11 "Today" vs Calendar 12; Wed 10/12, Thu 10/14), Challenge result 20/18 votes vs 59/41 %, Cart in $ elsewhere €.
- Not wired yet: watch-brand shop pop-up (638:21324), Watch Hall (798:27588), PK Battle (638:21605).
- Community: Fan Club Live Now (Watch Party) and Upcoming (Watch Hall) cards both open the Peña New York room, as linked in Figma. Fan Clubs list shows Peña Bética de Madrid as Joined, but its page opens on Join Group and shows Real Betis Balompié. Create Post's counter in Figma stays 0/1500 (the prototype counts). Requests / Weekly Bids / View, Chip In, Invite and Support have no Figma destination.

## 8. Links (BitKernel access needed)

- Live demo (claude.ai artifact, BitKernel org only): https://claude.ai/artifact/6c88f9EUBmrX3kJbhPH8p7. **Don't publish a different client over it.** Make your own artifact.
- Junior FC edition (private to Anderson until shared): https://claude.ai/artifact/3cmbuzehuJg3ssV5UTHmSM. Publish `dist-junior/` here (over 255 files: two publishes).
- Boca Juniors edition (private to Anderson until shared): https://claude.ai/artifact/BfN7Eob4W8XcPzDcZPFaPE. Publish `dist-boca/` here (two publishes).
- Client-view previews on claude.ai (Play only, from the 6 Nov client exports; private until shared): Boca https://claude.ai/artifact/6k26mdPK11bGw1FEDCZb5A · Junior FC https://claude.ai/artifact/FmJwaSG5gG6z1WYaDpc857. To refresh one: Export client package, unzip, publish its files (page = index.html's head without the document skeleton, two publishes). They don't switch to new uploads by themselves: re-publish after each export.
- Figma screens: https://www.figma.com/design/4rXmmKuEkeFmzMeZzUdd95/Sports-Prototype?node-id=638-19059
- Figma tokens (10 client modes): https://www.figma.com/design/Cy5Hgz2f87ZSzLQG2WAeht (collection "Semantics")
