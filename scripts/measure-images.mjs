import { createRequire } from 'module'; const require = createRequire('/opt/npm-tools/');
const { chromium } = require('playwright'); const fs = require('fs');
const [,, base, out] = process.argv;
const ids = JSON.parse(fs.readFileSync(process.env.SCREENS,'utf8'));
const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:500,height:900}});
const res = {};
const collect = async (p) => p.evaluate(() => {
  const out = [];
  const path = (u) => { try { const x = new URL(u, location.href); return decodeURIComponent(x.pathname).replace(/^\//,''); } catch { return null; } };
  for (const im of document.querySelectorAll('.app-phone img')) {
    const r = im.getBoundingClientRect(); if (!im.naturalWidth || r.width < 1) continue;
    out.push({ src: path(im.currentSrc || im.src), nw: im.naturalWidth, nh: im.naturalHeight, bw: r.width, bh: r.height, fit: getComputedStyle(im).objectFit });
  }
  for (const el of document.querySelectorAll('.app-phone *')) {
    const bg = getComputedStyle(el).backgroundImage; if (!bg || bg === 'none') continue;
    const m = [...bg.matchAll(/url\("?([^")]+)"?\)/g)]; if (!m.length) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1) continue;
    for (const x of m) out.push({ src: path(x[1]), bg: true, bw: r.width, bh: r.height, fit: getComputedStyle(el).backgroundSize });
  }
  return out;
});
for (const id of ids) {
  const p = await ctx.newPage(); await p.goto(base + '/inventory.html#' + id); await p.waitForTimeout(900);
  // scroll every scroller to load/measure everything (sizes don't depend on scroll)
  for (const it of await collect(p)) { const k = it.src; if (!k || !k.startsWith('assets/')) continue; const cur = res[k] || (res[k] = { ...it, bw: 0, bh: 0, screens: [] }); cur.bw = Math.max(cur.bw, it.bw); cur.bh = Math.max(cur.bh, it.bh); if (it.nw) { cur.nw = it.nw; cur.nh = it.nh; } cur.screens.includes(id) || cur.screens.push(id); }
  await p.close();
}
fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(Object.keys(res).length); await b.close();
