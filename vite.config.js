import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Classic (non-module) script so the packaged zip opens from file:// without a server,
// plus files.json so the dashboard can re-package the build into a client zip.
function staticPackage() {
  let outDir;
  return {
    name: 'static-package',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
          .replace(/ crossorigin/g, '');
      },
    },
    closeBundle() {
      if (!outDir || !fs.existsSync(outDir)) return;
      const files = [];
      const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p); else files.push(path.relative(outDir, p).split(path.sep).join('/'));
      });
      // standalone.html = the page as a normal document (used as index.html inside client zips)
      const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      fs.writeFileSync(path.join(outDir, 'standalone.html'), html);
      // artifact.html = same page without the document skeleton, for claude.ai hosting
      const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<!--[\s\S]*?-->/g, '');
      fs.writeFileSync(path.join(outDir, 'artifact.html'), head.trim() + '\n<div id="root"></div>\n');
      walk(outDir);
      const skip = new Set(['config.js', 'files.json', 'index.html', 'artifact.html']);
      fs.writeFileSync(path.join(outDir, 'files.json'), JSON.stringify(files.filter((f) => !skip.has(f)), null, 1));
    },
  };
}

// `vite build --mode junior` (npm run build:junior) makes the Junior FC edition in dist-junior/ (.env.junior).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), staticPackage()],
  build: {
    outDir: mode === 'junior' ? 'dist-junior' : 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'assets/app.js', assetFileNames: 'assets/[name]-[hash][extname]' } },
  },
}));
