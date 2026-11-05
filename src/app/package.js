import JSZip from 'jszip';
import { isRef, blobOf } from '../config/media.js';

const blobToDataUrl = (b) => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = err; r.readAsDataURL(b); });

/**
 * Re-packages the running app into a zip that works offline, starting from the given settings.
 * Needs a production build (vite preview, file server or the hosted page).
 */
export async function buildOfflineZip(config) {
  const res = await fetch('./files.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Packaging needs the built app. Run npm run build, then npm run preview.');
  const files = await res.json();
  const zip = new JSZip();
  const root = zip.folder(config.client.slug || 'client');
  await Promise.all(files.map(async (f) => {
    const r = await fetch('./' + f);
    if (!r.ok) throw new Error('Missing file in build: ' + f);
    root.file(f === 'standalone.html' ? 'index.html' : f, await r.arrayBuffer());
  }));
  const assets = {};
  const EXT = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };
  for (const [k, url] of Object.entries(config.assets || {})) {
    // Uploads stored in this browser go into the zip as files (videos are too big for config.js)
    if (isRef(url)) { const b = blobOf(url); if (!b) continue; const f = `media/${url.slice(4)}.${EXT[b.type] || 'bin'}`; root.file(f, b); assets[k] = f; continue; }
    if (String(url).startsWith('data:') || url.startsWith('media/')) { assets[k] = url; continue; }
    const r = await fetch(url); if (r.ok) assets[k] = await blobToDataUrl(await r.blob());
  }
  const packagedAt = new Date().toISOString();
  const packaged = { ...config, assets, packagedAt };
  // The copy starts from these settings; anyone opening it can still change them in Configure.
  root.file('config.js', `window.__PROTO_CONFIG__ = ${JSON.stringify(packaged)};\n`);
  root.file('README.txt', `Open index.html in Chrome, Edge or Safari. No install or internet needed.\nStarts with the settings for: ${config.client.name}\nPackaged: ${packagedAt}\n\nPlay: tap through the journeys. Configure: change theme, images, copy and journeys; changes are saved in this browser for this copy only.\nTo pass your setup on: Configure > Export config (a .json), or Download offline copy (a new zip).\nThis copy has no source code. To change anything Configure can't, ask the owner for the source package and HANDOFF.md.\n`);
  return zip.generateAsync({ type: 'blob' });
}

/** Hosted pages must go through the downloads capability; locally a plain link works. */
export async function download(blob, filename) {
  const downloads = window.claude?.use ? await window.claude.use('downloads') : null;
  if (downloads) {
    const r = await downloads.save({ filename, data: blob });
    return r.status;
  }
  if (window.claude?.use) throw new Error('Downloads are not available in this view.');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return 'saved';
}

/** Images are kept as data URLs inside the viewer's own settings. */
export async function storeImage(file) {
  if (file.size > 1.5 * 1024 * 1024) throw new Error('Image is over 1.5 MB. Export it smaller (256×256 is enough for logos)');
  return blobToDataUrl(file);
}
