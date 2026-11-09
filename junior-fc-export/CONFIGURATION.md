# Configure guide · Junior FC Sports App Demo

Framework v1.1.0 · updated 6 Nov 2026. Configure is the second tab at the top of the demo (or add `#configure` to the address). Everything here changes the demo **in your browser only**: nobody else sees your changes until you export them (section 9). The phone on the right is a live preview.

This package is set up for **Junior FC**: the theme, photos, videos and text below are its defaults. You only need Configure to adjust something for a specific meeting.

## 1. Client

| Field | What it does |
|---|---|
| Client name | Shown above the journey list in Play and used in exported file names |
| Slug | Short name for files (letters, numbers, dashes), e.g. `junior-fc` |

## 2. Journeys

Turn a journey off to hide every way into it: its home sections, app-bar tab, buttons and its entry in the journey list. Homepage and General Use are hubs: switching them off only removes them from the list.

| Journey | First screen | Note |
| --- | --- | --- |
| Launch & Login | Loading Screen |  |
| Homepage | Homepage | Hub: stays reachable when off |
| Fixtures | Fixtures |  |
| Predictions | Predictions / Off Day |  |
| Live Rooms | Live Show / Calendar |  |
| Fantasy | Fantasy / Home |  |
| Community | Community / Teams |  |
| Watch | Watch / Live Channel / Channels / Free |  |
| My Space & Profile | My Space |  |
| Voting | Votiong Campaign Detail Page |  |
| General Use | Notification | Hub: stays reachable when off |

## 3. Theme

The theme is fixed to **Junior de Barranquilla (Light)**: its colours, photos, text, squad and league table. You can still **Import .json** to fine-tune colours; **Clear overrides** returns to the theme's own colours.

## 4. Opening animation

The moving gradient on the Loading Screen. Each theme has its own three colours; pick colours here to change them for this demo.

## 5. Images

All 292 images in the demo, one accordion per page, with a search box. Each row shows where the image appears and its size. **Replace** changes it everywhere it appears; **Reset** returns to the default. Rows tagged **Theme photo** show the selected theme's own image.

Upload the same shape as the shipped file so nothing stretches or crops. Up to 10 MB per image.

The key images sit at the top of their page:

| Page | Image | Upload |
| --- | --- | --- |
| Brand | Club crest (header, launch screen, match cards, posts) · theme photo | 256×256 PNG, transparent |
| Brand | Login screen logo (empty = club crest) · theme photo | 144×144 SVG or PNG |
| Brand | Round club badge (Community teams, fan clubs, fan club page) · theme photo | 176×176 JPG/PNG, square |
| Brand | Stadium banner (Fan Club page header) | 686×200 JPG |
| Home | Home banner 1 (Who Wins Tonight?) · theme photo | 672×400 JPG/PNG |
| Home | Home banner 2 (Post-match Interview) · theme photo | 672×400 JPG/PNG |
| Home | Home banner 3 (Fan Derby) · theme photo | 672×400 JPG/PNG |
| Home | Home bottom banner player cut-out · theme photo | 262×350 PNG, transparent |
| Fixtures | Opponent 1 logo · theme photo | 256×256 PNG, transparent |
| Fixtures | Opponent 2 logo · theme photo | 256×256 PNG, transparent |
| Fixtures | Opponent 3 logo · theme photo | 256×256 PNG, transparent |
| Fixtures | Opponent 4 logo · theme photo | 256×256 PNG, transparent |
| Fixtures | Player page photo (Squads › player) | 340×356 PNG, transparent |
| Watch | Watch: live channel still (mini player) | 750×384 JPG |
| Community | Community › Monthly Star 1 photo · theme photo | 112×112 JPG/PNG, square |
| Community | Community › Monthly Star 2 photo · theme photo | 112×112 JPG/PNG, square |
| Community | Community › Monthly Star 3 photo · theme photo | 112×112 JPG/PNG, square |
| Voting | Voting: lead candidate photo (Home card, ranking, profile, pop-up) | 750×906 JPG, portrait |
| My Space | My Space: profile photo (also Create Post) · theme photo | 200×200 JPG/PNG |
| My Space | My Space › Play: avatar (default plays the looping video; an upload replaces it with your still) · theme photo | 640×960 PNG, transparent |

## 6. Videos

Looping, muted background videos. MP4, MOV or WebM up to 60 MB. Use **MP4 (H.264)** so it plays in every browser: iPhone `.mov` files are usually HEVC, which Chrome on Windows and Firefox can't play. Each upload is checked and you're told if a browser can't play it.

| Video | Needed? | What to upload |
| --- | --- | --- |
| Live room background (Live / Default and your hosted room) · theme video | Built in for this theme | MP4 or MOV (H.264), portrait, loops, sound not used |
| My Space › Play: avatar · theme video | Built in for this theme | Needs a transparent background so the player floats over the page: WebM (VP9 alpha) for Chrome, Edge and Firefox; a .mov with alpha (HEVC or ProRes 4444) is transparent in Safari only. MP4 shows as a solid box. Keep the player in the top half: the avatar card covers the bottom |
| My Space › Play › Chat: avatar video · theme video | Built in for this theme | MP4 or MOV (H.264), portrait, loops, sound not used |
| Live match (video players, Watch Party, game-play stills) · theme video | Built in for this theme | MP4 or MOV (H.264), landscape 16:9, loops, sound not used. Plays in: Watch mini player, Video Player, Watch Party, and the game-play cards in Live Rooms (Watch Hall, Host Room). Nothing ships: until you upload one, these spots show their stills |
| Clip (Clips View) · theme video | Built in for this theme | MP4 or MOV (H.264), loops, sound not used. Fills the screen (cropped to fit), so portrait 9:16 works best. Nothing ships: until you upload one, Clips View shows its still |

## 7. Copy

Text that changes per client. Leave a field empty to keep the default shown in grey. Placeholders: `{team}` club name, `{full}` full club name, `{fans}` fan name, `{stadium}`, `{tags}` hashtags.

| Page | Field | Default in this package |
| --- | --- | --- |
| Brand | Club name | Junior FC |
| Brand | Full club name (Community, Fan Club page) | Junior de Barranquilla |
| Brand | Second team / B team | Junior Sub-20 |
| Brand | What fans are called (used in posts) | Junioristas |
| Brand | Home stadium (used in posts) | Metropolitano |
| Brand | Post hashtags | #JuniorFC #LosTiburones |
| Home | Home bottom banner slogan | ¡Junior, tu papá! |
| Home | Home Matches: first card opponent | Millonarios |
| Home | Home Matches: second card opponent | Deportivo Cali |
| Fixtures | Competition line | 2026 Liga BetPlay DIMAYOR · {team} · Group Stage |
| Fixtures | Opponent 1 | Millonarios |
| Fixtures | Opponent 2 | Chicó FC |
| Fixtures | Opponent 3 | Deportivo Cali |
| Fixtures | Opponent 4 | Millonarios |
| Fixtures | Pre-game stats: kick-off | Fri 4 September, 14:00 |
| Fixtures | Pre-game stats: competition | Liga BetPlay DIMAYOR |
| Fixtures | Pre-game stats: venue | Estadio Metropolitano Roberto Meléndez, Barranquilla |
| Fixtures | Player page: player name | Daniel Rivera |
| Watch | Watch: live show title | Junior Tonight |
| Watch | Watch: club TV channel | Junior TV |
| Community | Monthly Star names (comma-separated, 3) | Santiago Mele, Carlos Bacca, Rafael Perez |
| Community | Fan club name prefix (e.g. "Peña Bética" de Madrid) | Peña Juniorista |
| Voting | Voting campaign title | Reina Rojiblanca 2026 |
| Voting | Voting: lead candidate name | Sofía Reyes |
| My Space | My Space: username | tiburon_rojiblanco92 |
| My Space | My Space: membership name | Junior Pass |

## 8. Live preview

The phone on the right shows your changes as you make them. **Reset** above it restarts the preview from Homepage.

## 9. Save & share settings

| Button | Result |
|---|---|
| Export config | A `.json` with all your settings and uploads. Send it to a teammate |
| Import config | Loads a `.json` someone exported |
| Download offline copy (.zip) | The whole demo with your settings built in, Configure included. Opens from `index.html`, no internet needed. Includes these three guides. For your team |
| **Client link › Password** | Optional, off by default. Set one and the client enters it once per browser. Only a scrambled form is stored: write it down. It stops people who only have the link; for stronger protection also use the web host's password option |
| **Client link › Export client package (.zip)** | The Play-only page with your settings built in: no Configure, only this theme's photos. Upload everything inside it to the client's folder on the web server (or Vercel-style host), replacing the previous upload. Open client demos switch to it within about 30 seconds, at their next screen change. Also opens from disk |

The client link never shows your unsaved work: it changes only when you export and upload. Each export has its own id (in `publish.json` and the zip's README), so you can tell which version a client has.

## 10. If something goes wrong

- A screen shows "This screen couldn't open": press **Copy error details** and send the text to the owner. The rest of the demo still works.
- Settings look wrong or old: on the error page use **Reset settings…**, or clear the site's data in the browser. This deletes your uploads in that browser.
- "This browser blocks file storage": you are in a private window. Use a normal window.
- An upload says the video can't play: export it again as MP4 (H.264), for example QuickTime › File › Export As › 1080p with "Use HEVC" unticked.
