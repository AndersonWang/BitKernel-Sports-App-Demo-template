# BitKernel Sports App Demo

Configurable, client-brandable prototype built from the Figma file **Sports-Prototype** (`4rXmmKuEkeFmzMeZzUdd95`, page "Prototype (Real Betis) - 2nd Version") and the token library **📱 BitCore - Mobile Component Library** (`Cy5Hgz2f87ZSzLQG2WAeht`).

## Run

```bash
npm install
npm run dev        # internal preview + dashboard at http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ — needed for "Download client zip"
```

| URL | Who | What |
|---|---|---|
| `#/` | Design / BD | Phone preview + journey list |
| `#/dashboard` | Design / BD | Flags, theme, images, copy, packaging |
| `#/client` | Design / BD | What the client will see (read-only) |
| Client zip | Client | Opens from `index.html`, no server. Player only, curated journeys, settings locked |

## How it maps to Figma

| Layer | Source of truth | Where in code |
|---|---|---|
| Screens, layout, flows | Figma source file | `src/screens/`, `src/components/` — each screen has its Figma node id in `src/config/registry.js` |
| Tokens (10 client modes) | Figma `Semantics` collection | `src/tokens/semantics.json` → CSS variables (`--colour-text-primary` = `colour/text/primary`) |
| Client images, copy, flags | Dashboard (per client config) | `config.json` / packaged `config.js` |

Rules: no layout edits in code that aren't in Figma. Every colour, spacing and radius uses a token variable.

## Sync from Figma

A design change is picked up when a **named version** ("Ready for prototype: …") is saved in Figma. The sync diffs changed frames against `SCREENS` in `src/config/registry.js`, updates code on a branch, and opens a PR.

Tokens are exported through the Figma Plugin API (the Variables REST API is Enterprise-only), regenerating `src/tokens/semantics.json`.

## Theme JSON import

The dashboard accepts any of these shapes, matched by Figma variable name:

- this repo's format `{ modes: [...], vars: { "colour/brand/primary": [..per mode..] } }`
- a flat map `{ "colour/brand/primary": "#008b28" }`
- nested W3C / Tokens Studio `{ colour: { brand: { primary: { $value: "#008b28" } } } }`

Unknown names are reported and ignored. A WCAG AA contrast check runs on every change.

## Status

| Journey | State |
|---|---|
| Login / Home | Homepage header, Fixtures carousel, app bar built. Other home sections are stand-ins sized to their Figma frames |
| Fixtures | Fixtures (Upcoming) built. Results, Leagues, Pre-game Stats pending |
| Predictions | On hold until links are sorted |
| Others | Pending |

Hosted client links (`/c/{slug}`) are not built yet: they need the file-server details.
