# Configure guide · {{title}}

Framework {{version_label}}. Configure is the second tab at the top of the demo (or add `#configure` to the address). Everything here changes the demo **in your browser only**: nobody else sees your changes until you export them (section 9). The phone on the right is a live preview.

<!--if edition-->
This package is set up for **{{client}}**: the theme, photos, videos and text below are its defaults. You only need Configure to adjust something for a specific meeting.
<!--endif-->
<!--if template-->
This is the template: it opens as **Real Betis**. To prepare a new club, pick or import its theme (section 3), then work down the sections.
<!--endif-->

## 1. Client

| Field | What it does |
|---|---|
| Client name | Comes from the theme: the theme JSON's mode name without "(Light)", e.g. "Boca Juniors (Light)" → Boca Juniors. Read-only here; rename the mode in the theme JSON to change it. Generic themes (Default, Adult, Religion) let you type it. Shown above the section list in Play, on the password screen, in the browser tab and in every file name |
| Slug | Follows the client name automatically (letters, numbers, dashes), e.g. `{{slug}}`. Read-only |
| File names | `<Team>_Demo_v<version>_<MonDD>.zip` (client link), `<Team>_Demo_Offline_v<version>_<MonDD>.zip` (offline copy), `<Team>_Demo_config.json` (exported settings) |

## 2. Sections

The list beside the phone in Play (desktop; phones have no list). For each section:

- **Tick box:** off hides the section and every way into it (home sections, app-bar tab, buttons). Homepage and General Use are hubs: off only removes them from the list.
- **Name:** click it to rename. Empty = the Figma name.
- **↑ ↓:** move it in the list. **Reset order and names** undoes both.
- **+ Add section:** a name and the screen it opens on (any existing screen). It goes to the end of the list; **Remove** deletes it. A section can only open on a screen that exists: a new screen needs a Figma design first.

**Avatar** is a shortcut to My Space › Play with a ready-made avatar (Andrés Pacheco, in the theme's league and club). **Sports Highlights** (since 10 Nov): set up your highlights (sport, leagues, clubs, players, length and content), My Highlights, Highlight Preferences and a story-style viewer for Game, Betting, Fantasy and Points highlights. When it's on, Home › Highlights shows the highlights playlist and My Space gets a My Highlights row. **Live Betting** is being designed: it's listed greyed out and can't be switched on yet.

{{journeys_table}}

## 3. Theme

<!--if template-->
Pick one of the {{theme_count}} Figma modes, or **Import .json** with design tokens exported from Figma (names must match the Figma variable names). A WCAG contrast check runs on every change. **Clear overrides** returns to the mode's own colours.

{{themes_list}}

Two modes also bring their own photos, videos, text, squad and league table: **Junior de Barranquilla (Light)** and **Boca Juniors (Light)**. Selecting one changes those across the demo.

**Each theme keeps its own settings**: client name, uploads, text, sections and password. Switching theme saves the current theme's settings and opens the other theme's (or fresh ones, named after the theme). So you can prepare Boca and Junior in the same browser without one leaking into the other's package.
<!--endif-->
<!--if edition-->
The theme is fixed to **{{default_mode}}**: its colours, photos, text, squad and league table. You can still **Import .json** to fine-tune colours; **Clear overrides** returns to the theme's own colours.
<!--endif-->

## 4. Opening animation

The moving gradient on the Loading Screen. Each theme has its own three colours; pick colours here to change them for this demo.

## 5. Images

All {{image_count}} images in the demo, one accordion per page, with a search box. Each row shows where the image appears and its size. **Click a thumbnail** for a larger preview (as large as the window allows, never above its real size): ← / → step through the page, Esc closes it, and Replace and Reset work from there. **Replace** changes it everywhere it appears; **Reset** returns to the default. Rows tagged **Theme photo** show the selected theme's own image.

Upload the same shape as the shipped file so nothing stretches or crops. Up to 10 MB per image.

The key images sit at the top of their page:

{{key_images_table}}

## 6. Videos

Looping, muted background videos. MP4, MOV or WebM up to 60 MB. Use **MP4 (H.264)** so it plays in every browser: iPhone `.mov` files are usually HEVC, which Chrome on Windows and Firefox can't play. Each upload is checked and you're told if a browser can't play it. Click a thumbnail to play it larger.

The My Space avatar moves with a see-through background in every browser: Safari and iPhones play a special MP4 copy of the shipped avatars. An avatar video you upload yourself shows see-through in Chrome, Edge and Firefox only.

{{videos_table}}

## 7. Copy

Text that changes per client. Leave a field empty to keep the default shown in grey. Placeholders: `{team}` club name, `{full}` full club name, `{fans}` fan name, `{stadium}`, `{tags}` hashtags.

{{copy_table}}

## 8. Live preview

The phone on the right shows your changes as you make them. **Reset** above it restarts the preview from Homepage.

## 9. Save & share settings

| Button | Result |
|---|---|
| Export config | A `.json` with all your settings and uploads. Send it to a teammate |
| Import config | Loads a `.json` someone exported |
| Download offline copy (.zip) | The whole demo with your settings built in, Configure included. Opens from `index.html`, no internet needed. Includes these three guides. For your team |
| **Client link › Password** | Optional, off by default. Set one and the client enters it once per browser. Only a scrambled form is stored: write it down. It stops people who only have the link; for stronger protection also use the web host's password option |
| **Client link › Export client package (.zip)** | The Play-only page with your settings built in: no Configure, only this theme's photos. Named after the team (the theme's name without "(Light)"), e.g. `Boca-Juniors_Demo_v{{version}}_Nov09.zip`; the browser tab reads "Boca Juniors_Demo" and the password screen, top bar, section list and README use the same name. The bottom of its section list shows the version and when it was exported, e.g. "v{{version}} · Updated 9 Nov 2026, 14:30" (desktop only). Upload everything inside it to the client's folder on the web server (or Vercel-style host), replacing the previous upload. Open client demos switch to it within about 30 seconds, at their next screen change. Also opens from disk |

The client link never shows your unsaved work: it changes only when you export and upload. Each export has its own id (in `publish.json` and the zip's README), so you can tell which version a client has.

## 10. If something goes wrong

- A screen shows "This screen couldn't open": press **Copy error details** and send the text to the owner. The rest of the demo still works.
- Settings look wrong or old: on the error page use **Reset settings…**, or clear the site's data in the browser. This deletes your uploads in that browser.
- "This browser blocks file storage": you are in a private window. Use a normal window.
- An upload says the video can't play: export it again as MP4 (H.264), for example QuickTime › File › Export As › 1080p with "Use HEVC" unticked.
