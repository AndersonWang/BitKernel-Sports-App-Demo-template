# BitKernel Sports App Demo

A configurable sports app prototype built with React 18 and Vite. Explore the demo, switch client themes, update images and copy, toggle journeys, and export an offline client copy.

## Run locally

Requires Node.js 22.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The template build outputs to `dist/`. The Junior edition uses `npm run build:junior` and outputs to `dist-junior/`.

## Demo routes

- `#play`: interactive sports app demo
- `#configure`: branding, content, journeys, and offline export

Configuration changes are saved in the current browser. Export and import a configuration JSON to transfer them to another browser. Committed source changes are shared through GitHub.

## Deploy to Vercel

Import this repository and select the `portfolio-demo-v58` branch for the portfolio version. Use the Vite framework preset, Node.js 22, `npm run build`, and the `dist` output directory. No secret environment variables are required.

The original `main` branch is preserved. Internal handoff and audit documents are excluded from this public version.
