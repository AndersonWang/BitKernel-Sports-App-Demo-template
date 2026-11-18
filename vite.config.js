import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { writeDocs } from './scripts/docs.mjs';

// Classic (non-module) script so the packaged zip opens from file:// without a server,
// plus files.json so the dashboard can re-package the build into a client zip.
// WOFF fallbacks: every supported browser loads the WOFF2 copy, so the .woff files only cost file count
// (the claude.ai host allows 511 files per artifact). Both build passes emit them, so both drop them.
function dropWoff(outDir) {
  const adir = path.join(outDir, 'assets');
  fs.readdirSync(adir).filter((f) => f.endsWith('.css')).forEach((f) => { const p = path.join(adir, f); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/,\s*url\(\.\/[^)]+\.woff\)\s*format\(["']woff["']\)/g, '')); });
  fs.readdirSync(adir).filter((f) => f.endsWith('.woff')).forEach((f) => fs.rmSync(path.join(adir, f)));
}

function staticPackage() {
  let outDir, mode, root;
  return {
    name: 'static-package',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); mode = c.mode; root = c.root; },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          // ?v=<build time>: app.js keeps a fixed name (zip packaging), so without this Safari can
          // keep running a cached, older bundle after a fix is published.
          .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, `<script defer src="$1?v=${BUILD}"></script>`)
          .replace(/ crossorigin/g, '');
      },
    },
    async closeBundle() {
      if (!outDir || !fs.existsSync(outDir)) return;
      if (PLAY) { dropWoff(outDir); return writeFileList(outDir); } // second pass (play.html + assets/play.js): the main pass did the rest
      // README.md, CONFIGURATION.md and HANDOFF.md scoped to this package (template or one team), see scripts/docs.mjs
      await writeDocs(EDITIONS.includes(mode) ? mode : 'template', 'built', outDir);
      // A client edition ships only its own theme's photos (the other themes can't be selected there)
      const own = { junior: 'Junior de Barranquilla (Light)', boca: 'Boca Juniors (Light)' }[mode];
      if (own) {
        const dir = JSON.parse(fs.readFileSync(path.join(root, 'src/tokens/theme-assets.json'), 'utf8'))[own].dir.replace(/^assets\/themes\//, '').replace(/\/$/, '');
        const themes = path.join(outDir, 'assets/themes');
        if (fs.existsSync(themes)) fs.readdirSync(themes).filter((d) => d !== dir).forEach((d) => fs.rmSync(path.join(themes, d), { recursive: true, force: true }));
      }
      if (mode === 'production') Object.values(PACKED).forEach((dir) => {
        const src = path.join(outDir, 'assets/themes', dir);
        if (!fs.existsSync(src)) return;
        const map = {};
        const add = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
          const p = path.join(d, e.name);
          if (e.isDirectory()) return add(p);
          if (/\.(mp4|webm|mov)$/i.test(e.name)) return; // videos stay plain files: base64 would add a third and load them up front
          const rel = path.relative(src, p).split(path.sep).join('/');
          map[rel] = `data:${MIME[path.extname(p).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(p).toString('base64')}`;
        });
        add(src);
        fs.writeFileSync(path.join(outDir, 'assets/themes', dir + '.pack.js'), `(window.__THEME_PACKS__ ||= {})[${JSON.stringify(dir)}] = ${JSON.stringify(map)};\n`);
        Object.keys(map).forEach((rel) => fs.rmSync(path.join(src, rel)));
        const prune = (d) => { fs.readdirSync(d, { withFileTypes: true }).forEach((e) => e.isDirectory() && prune(path.join(d, e.name))); if (!fs.readdirSync(d).length) fs.rmdirSync(d); };
        prune(src);
      });
      // standalone.html = the page as a normal document (used as index.html inside client zips)
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      fs.writeFileSync(path.join(outDir, 'standalone.html'), html);
      // artifact.html = same page without the document skeleton, for claude.ai hosting
      const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<!--[\s\S]*?-->/g, '');
      fs.writeFileSync(path.join(outDir, 'artifact.html'), head.trim() + '\n<div id="root"></div>\n');
      dropWoff(outDir);
      writeFileList(outDir);
    },
  };
}

// files.json: every file Configure copies into an offline copy or a client package (src/app/package.js)
function writeFileList(outDir) {
  const files = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else files.push(path.relative(outDir, p).split(path.sep).join('/'));
  });
  walk(outDir);
  const skip = new Set(['config.js', 'files.json', 'index.html', 'artifact.html']);
  fs.writeFileSync(path.join(outDir, 'files.json'), JSON.stringify(files.filter((f) => !skip.has(f)).sort(), null, 1));
}

// `vite build --mode junior|boca` (npm run build:junior / build:boca) makes a client edition in dist-<mode>/ (.env.<mode>).
const EDITIONS = ['junior', 'boca'];
// Second build pass for the Play-only client page (scripts/build.mjs sets PLAY=1): play.html + assets/play.js,
// no Configure code, settings only from the exported config file. Same output folder, public/ not copied again.
const PLAY = process.env.PLAY === '1';
// Template build: themes shipped as one pack file each (see src/tokens/themePacks.js). Keeps the artifact under
// the host's 511-file limit. Photos only: the theme's videos stay plain files next to it.
const PACKED = { 'Boca Juniors (Light)': 'boca-juniors-light', 'Junior de Barranquilla (Light)': 'junior-de-barranquilla-light' };
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const BUILD = Date.now().toString(36);
// Framework version (package.json) + the date of the last commit, shown in Configure (src/version.js)
const APP_VERSION = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
let APP_UPDATED;
try { APP_UPDATED = execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* source zip without git */ }
if (!/^\d{4}-\d{2}-\d{2}$/.test(APP_UPDATED || '')) APP_UPDATED = new Date().toISOString().slice(0, 10);
// One short hash per theme folder: theme photo URLs carry it (ui.jsx), so they change only when the theme does
const THEME_HASH = Object.fromEntries(fs.readdirSync('public/assets/themes', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => {
  const h = crypto.createHash('md5');
  const add = (p) => fs.readdirSync(p, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => { const q = path.join(p, e.name); if (e.isDirectory()) add(q); else h.update(e.name).update(fs.readFileSync(q)); });
  add(path.join('public/assets/themes', d.name));
  return [d.name, h.digest('hex').slice(0, 8)];
}));
export default defineConfig(({ mode }) => ({
  base: './',
  define: { __BUILD__: JSON.stringify(BUILD), __APP_VERSION__: JSON.stringify(APP_VERSION), __APP_UPDATED__: JSON.stringify(APP_UPDATED), __THEME_HASH__: JSON.stringify(THEME_HASH), __PACKED_THEMES__: JSON.stringify(mode === 'production' ? PACKED : {}), __PLAY_ONLY__: JSON.stringify(PLAY) }, // cache-buster for theme photos (ui.jsx themedPath)
  plugins: [react(), staticPackage()],
  publicDir: PLAY ? false : 'public',
  build: {
    outDir: EDITIONS.includes(mode) ? `dist-${mode}` : 'dist',
    emptyOutDir: !PLAY,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: { input: PLAY ? 'play.html' : 'index.html', output: { format: 'iife', inlineDynamicImports: true, entryFileNames: PLAY ? 'assets/play.js' : 'assets/app.js', assetFileNames: 'assets/[name]-[hash][extname]' } },
  },
}));
