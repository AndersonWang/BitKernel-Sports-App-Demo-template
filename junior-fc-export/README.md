# Junior FC Sports App Demo

Framework v1.1.0 · updated 6 Nov 2026 · team package for Junior FC

This folder is a working demo of a football club app, built 1:1 from BitKernel's Figma prototype. It's a clickable demo, not a live app: no real accounts, payments, streams or live data.

| Read this | If you are | For |
|---|---|---|
| **README.md** (this file) | Everyone | What the demo is, how to open and present it |
| **CONFIGURATION.md** | BD team, designers | Changing names, photos, videos, colours and journeys in Configure, no code needed |
| **HANDOFF.md** | Designers, developers, AI agents | How it's built, what's specific to this package, open questions, how to update it |

---

## Part 1 · For the business development team

### What's in this package

- The **Junior FC** demo: colours, crest, photos, videos and wording are already set for Junior FC. It opens straight into the club, with nothing to set up.
- It's built for showing to Junior FC and their agency. Content still to confirm with the club is listed in HANDOFF.md › Open questions.

### Open the demo

| Where | How |
|---|---|
| Online | https://claude.ai/artifact/3cmbuzehuJg3ssV5UTHmSM (claude.ai, BitKernel organization; the client needs an invite) |
| From this folder | Double-click `index.html`. It opens in your browser and works offline. |

Use Chrome, Edge or Safari (Firefox works, with a simpler opening animation).

### Present it

- **Play** (top left) is the demo. Pick a journey on the left, such as Homepage, Fixtures or Live Rooms. **Restart this journey** takes you back to its first screen.
- On a **phone**, the demo fills the screen like a real app, with no journey list. Hold the phone upright.
- Most buttons work the way they do in Figma. A button with nowhere to go shows "Not part of this demo".
- 11 journeys are included: Launch & Login, Homepage, Fixtures, Predictions, Live Rooms, Fantasy, Community, Watch, My Space & Profile, Voting, General Use.
- The fan's avatar is already created (Andrés Pacheco), so My Space › Play opens filled in.

### Change the content yourself

Open **Configure** (top left). You can change the club name and wording, any of the demo's photos, the videos, the colours and which journeys show. **CONFIGURATION.md** explains each section. Changes save in your browser only: nobody else sees them until you share them (below).

### Share it

| To share | Do this |
|---|---|
| Your settings with a teammate | Configure › Save & share settings › **Export config**, send the `.json`; they use **Import config** |
| The whole demo, offline | Configure › **Download offline copy (.zip)**: anyone can open its `index.html` |
| **A client link (Play only)** | Configure › Save & share › Client link › **Export client package (.zip)**, then upload everything inside it to the client's folder on the web server, replacing the previous upload. Open demos switch to the new upload within about 30 seconds. Optional password in the same place (off by default) |
| The owner link | Ask the owner to share the online link (claude.ai: by invite) |

The client link has no Configure: the client can't change anything, and nothing they do is kept after a reload. Your changes reach them only when you export and upload again.

### Good to know

- Images up to 10 MB and videos up to 60 MB can be uploaded. Use MP4 (H.264) for videos so they play in every browser.
- Some names and numbers are placeholders (league points, some player names). Check HANDOFF.md › Open questions before showing details as facts.
- Photos of real people need the club's permission before the demo is shown outside a pitch.
- If a screen shows "This screen couldn't open", press **Copy error details** and send the text to the owner.

**Owner:** Anderson Wang, BitKernel Design.

---

## Part 2 · For AI agents

Read in this order: this file, then `HANDOFF.md`, then `CONFIGURATION.md`.

| Item | Value |
|---|---|
| Package scope | Team edition: Junior FC (theme "Junior de Barranquilla (Light)" only) · built, no source |
| Framework | v1.1.0 (`package.json` "version"), last updated 6 Nov 2026 |
| Build | `npm run build:junior` → `dist-junior/` (`.env.junior`: VITE_EDITION=junior) |
| Default theme mode | Junior de Barranquilla (Light) |
| Settings storage key | `bk-proto-config:junior-fc:2` (browser localStorage; uploads in IndexedDB `bk-proto-media`) |
| Hosted at | https://claude.ai/artifact/3cmbuzehuJg3ssV5UTHmSM |

**This is a built package: there is no source code here.** Content changes go through Configure (CONFIGURATION.md). Code changes need the source package (`BitKernel-Sports-App-Demo-source.zip`, from the owner); build this package from it with `npm run build:junior`.

| Path | What |
|---|---|
| `index.html` | The page; opens from disk (classic scripts, no server needed) |
| `config.js` | Starting settings (`window.__PROTO_CONFIG__`); empty in a fresh build, filled in a Configure offline copy |
| `assets/app.js`, `assets/style-*.css` | The app (one bundle) |
| `assets/<area>/` | Shipped images and videos |
| `assets/themes/<theme>/` | The theme's own copies of shipped files (same paths) |
| `media/` | Only in Configure offline copies: files uploaded in Configure |
| `play.html`, `assets/play.js` | The Play-only client page (no Configure code); Export client package turns it into the client's `index.html` |
| `files.json` | File list Configure uses to make an offline copy or a client package |

Rules that apply to any change:

1. Edit the source, never the built `assets/app.js`. A hand-edited bundle is lost on the next build.
2. Layout stays 1:1 with Figma. Club-specific text and photos belong in theme data or Configure, not in screen code.
3. Before replacing a published artifact, check for newer versions published by teammates and port their changes into the source first.
4. After any change, update this package's HANDOFF.md (what changed, open questions) and, for a new release, bump `version` in `package.json`.
