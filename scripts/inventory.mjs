// node scripts/inventory.mjs  (with `npx vite --port 4210` running) → src/config/media-seen.json
// Opens every registered screen and records the shipped images/videos it renders.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
const src = fs.readFileSync('src/config/registry.js', 'utf8');
const ids = [...src.slice(src.indexOf('export const SCREENS'), src.indexOf('export const JOURNEYS')).matchAll(/^\s+'?([a-z0-9-]+)'?: \{ name/gm)].map((m) => m[1]);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 500, height: 900 } });
await page.goto('http://localhost:4210/inventory.html');
await page.evaluate(() => localStorage.setItem('bk-proto-config', JSON.stringify({ flags: { login: false }, flagsV: 2 })));
const seen = {};
for (const id of ids) {
  await page.goto('http://localhost:4210/inventory.html#' + id);
  await page.reload();
  await page.waitForTimeout(900);
  const list = await page.evaluate(() => {
    const out = new Set();
    document.querySelectorAll('img[src], video[src], video[poster], source[src]').forEach((e) => {
      [e.getAttribute('src'), e.getAttribute('poster')].forEach((v) => { const m = v && v.match(/assets\/.+$/); if (m) out.add(m[0]); });
    });
    document.querySelectorAll('[style*="url("]').forEach((e) => {
      for (const m of e.getAttribute('style').matchAll(/url\(["']?([^"')]+)/g)) { const a = m[1].match(/assets\/.+$/); if (a) out.add(a[0]); }
    });
    // assets/voting/../home/x → assets/home/x
    return [...out].map((p) => { const parts = []; p.split('/').forEach((s) => (s === '..' ? parts.pop() : parts.push(s))); return parts.join('/'); });
  });
  seen[id] = [...new Set(list)].sort();
  console.log(id, list.length);
}
await browser.close();
fs.writeFileSync('src/config/media-seen.json', JSON.stringify(seen, null, 1));
