# Agent setup — continue the Sports App Demo for a new client

## For the person (do this first)

1. In the Claude desktop app, create a **new Project** named after your client (e.g. "Sevilla Sports Demo").
2. Add `README.md`, `HANDOFF.md`, `CONFIGURATION.md` and this file (`AGENT-SETUP.md`) to the project's files.
3. Start a task in that project and **attach `BitKernel-Sports-App-Demo-source.zip`**. If you'd rather keep the files on your computer, unzip it into a folder and connect that folder instead.
4. Optional:
   - Connect **Figma** (only if you'll build or change screens from Figma; you need view access to the two files in HANDOFF.md §8).
   - Attach your client's images (logos, player photos, kits, banners) and the theme token JSON, if you have them.
5. Fill in the brackets below and paste it as your first message.

---

## Prompt to paste

```
You're taking over a configurable sports app prototype (React 18 + Vite, plain CSS on design-token variables). Read README.md (part 2), HANDOFF.md, CONFIGURATION.md and AGENT-SETUP.md in this project before doing anything else, and follow the rules in HANDOFF.md §6.

Client: [CLIENT NAME], slug [client-slug]
Theme: [Figma mode name, or "token JSON attached"]
Journeys to show: [e.g. all built ones / Homepage, Fixtures, Live Rooms, Watch]
Assets attached: [list, or "none yet"]

Setup, in this order:
1. Unzip the attached source into a working folder (don't edit inside the zip). Run `npm install` and `npm run build`. Then `npm run preview` and confirm #play and #configure load with no console errors. Tell me if anything fails.
2. `git init` and commit the untouched source as the baseline, so every change after it can be reviewed and undone.
3. Read src/config/registry.js and give me a one-screen summary: journeys, which screens are built, image slots and copy fields.
4. Inventory every image under public/assets/ and every hard-coded string in src/screens/ that shows the current club (Real Betis): player photos, kits/jerseys, crests, stadiums, banners, product names, captions. Group them by screen and journey, and say for each one whether Configure can replace it (an image in Configure › Images, a copy field in Configure › Copy, or theme data as for the Junior and Boca editions) or it needs a code change. Don't change anything yet.
5. Wait for me to confirm the list.

When we start changing things:
- Prefer the Configure slots and copy fields. Only change code for what they can't cover.
- Replacement images: same file name and path, WebP at 2× the displayed size, and the same aspect ratio as the original, unless I say otherwise.
- Move club-specific strings into copy fields (registry.js COPY_FIELDS + useCopy) rather than editing the old text in place. This makes the next reskin a Configure job.
- Keep layout 1:1 with Figma. Don't redesign. If something can't be done without a layout change, ask me.
- After each batch: run `npm run build`, open the changed screens in a headless browser, check them visually, then commit.
- Publish as a NEW artifact for this client. Never publish to the Real Betis artifact (https://claude.ai/artifact/6c88f9EUBmrX3kJbhPH8p7).
- For a team-only version, follow the Junior/Boca pattern in HANDOFF.md §4b: a theme mode + `src/editions/<id>/` (edition.json, theme-text.json, HANDOFF.md) + an `npm run build:<id>` script.
- When done, update the right HANDOFF (status, what changed, open questions); README.md and CONFIGURATION.md regenerate on build. Save a fresh source zip (`git archive -o <client>-sports-demo-source.zip HEAD`) and give me a client offline copy from Configure › Download offline copy.
```

---

## Notes for the agent

- **Published files:**
  - The page is `dist/artifact.html` and its supporting files are under `dist/`: `assets/app.js`, the hashed `assets/style-*.css`, `files.json` and `assets/**`.
  - The CSS name changes on each build. On republish, map the new CSS file and set the old name to `null`.
  - Upload every image folder the page uses.
- **Offline zip:**
  - Works only from a production build (`npm run preview` or the hosted page). It fetches `files.json` and copies every listed file.
  - Settings packed into the zip are stored under their own key (`bk-proto-config:<slug>:<packagedAt>`), so two clients' copies on one computer don't mix.
- **Icons** are CSS masks. Add a new one as `src/assets/icons/<name>.svg` and use `<Icon name="<name>" />`. Export it from the rendered Figma instance (HANDOFF §6.4).
- **Teammate code:** `src/screens/pregame.jsx` (Fixtures, Predictions) and `src/screens/fantasy.jsx` were ported from a minified bundle. They're dense but correct, so edit them carefully.
- **Don't guess Figma:** if a link or state is missing, use `nav.dead()` and list it as an open question.
