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
      walk(outDir);
      fs.writeFileSync(path.join(outDir, 'files.json'), JSON.stringify(files.filter((f) => f !== 'config.js' && f !== 'files.json'), null, 1));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), staticPackage()],
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'assets/app.js', assetFileNames: 'assets/[name]-[hash][extname]' } },
  },
});
