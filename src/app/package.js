import { isRef, blobOf } from '../config/media.js';
import { VERSION_LABEL } from '../version.js';
import { teamName, slugOf } from '../config/store.js';
import THEME_ASSETS from '../tokens/theme-assets.json';

// JSZip (95 KB) is only needed when someone packages a zip, so it loads on demand instead of with the app.
let jszip;
const loadJSZip = () => (jszip ||= new Promise((ok, err) => {
  if (window.JSZip) return ok(window.JSZip);
  const s = document.createElement('script');
  s.src = './assets/vendor/jszip.min.js';
  s.onload = () => (window.JSZip ? ok(window.JSZip) : err(new Error('Zip library failed to load')));
  s.onerror = () => { jszip = null; err(new Error('Zip library failed to load. Check the connection and try again.')); };
  document.head.appendChild(s);
}));

const blobToDataUrl = (b) => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = err; r.readAsDataURL(b); });

const EXT = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };
const THEME_DIRS = Object.fromEntries(Object.entries(THEME_ASSETS).filter(([k]) => !k.startsWith('$')).map(([mode, t]) => [mode, t.dir.slice(14, -1)]));
const DOCS = new Set(['README.md', 'CONFIGURATION.md', 'HANDOFF.md']);

// Copies the built files into the zip (pick decides which, and under what name) and the settings' uploads into
// media/. Returns the settings with each upload pointing at its file in the zip.
async function pack(config, pick) {
  let files;
  try {
    const res = await fetch('./files.json', { cache: 'no-store' });
    if (!res.ok) throw new Error();
    files = await res.json();
  } catch {
    throw new Error(location.protocol === 'file:' ? 'A package can\'t be made from a copy opened by double-clicking index.html: the browser won\'t let the page read its own files. Use the online link, or serve the folder from a web server.' : 'This copy is missing its file list (files.json), so it can\'t make a package. Use the online link or a copy downloaded after 6 Nov 2026.');
  }
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  const root = zip.folder(config.client.slug || 'client');
  await Promise.all(files.map(async (f) => {
    const name = pick(f);
    if (!name) return;
    const r = await fetch('./' + f);
    if (!r.ok) throw new Error('Missing file in build: ' + f);
    root.file(name, await r.arrayBuffer());
  }));
  const assets = {};
  for (const [k, url] of Object.entries(config.assets || {})) {
    // Uploads stored in this browser go into the zip as files (videos are too big for config.js)
    if (isRef(url)) { const b = blobOf(url); if (!b) continue; const f = `media/${url.slice(4)}.${EXT[b.type] || 'bin'}`; root.file(f, b); assets[k] = f; continue; }
    if (String(url).startsWith('data:')) { assets[k] = url; continue; }
    // Already a file of a packaged copy (media/…): carry the file over too
    if (url.startsWith('media/')) { const r = await fetch('./' + url); if (r.ok) { root.file(url, await r.arrayBuffer()); assets[k] = url; } continue; }
    const r = await fetch(url); if (r.ok) assets[k] = await blobToDataUrl(await r.blob());
  }
  return { zip, root, settings: { ...config, assets } };
}

/**
 * Re-packages the running app into a zip that works offline, starting from the given settings.
 * Needs a production build (vite preview, file server or the hosted page).
 */
export async function buildOfflineZip(config) {
  // The owner page (with Configure); the Play-only page and its bundle are left out
  // The owner page with Configure, plus the Play-only page so this copy can export client packages too
  const { zip, root, settings } = await pack(config, (f) => (f === 'standalone.html' ? 'index.html' : f));
  root.file('files.json', JSON.stringify(await (await fetch('./files.json', { cache: 'no-store' })).json(), null, 1)); // lets this copy package again
  const packagedAt = new Date().toISOString();
  const packaged = { ...settings, packagedAt };
  // The copy starts from these settings; anyone opening it can still change them in Configure.
  root.file('config.js', `window.__PROTO_CONFIG__ = ${JSON.stringify(packaged)};\n`);
  // The build ships README.md, CONFIGURATION.md and HANDOFF.md for its scope; note what this copy starts with
  const readme = root.file('README.md');
  if (readme) root.file('README.md', (await readme.async('string')) + `\n---\n\n## This copy\n\nMade with Configure › Download offline copy on ${packagedAt.slice(0, 10)}. It starts with the settings for **${config.client.name}** (theme: ${config.theme.mode}); uploads are in \`media/\`. Framework ${VERSION_LABEL}. Changes made in this copy save in that browser only.\n`);
  return zip.generateAsync({ type: 'blob' });
}

/**
 * The client package: the Play-only page with these settings built in. No Configure, no guides for the team,
 * only the selected theme's photos. Upload the folder to a web server (or open index.html from disk).
 * Every export gets its own id: the config file is named after it (so no browser shows a cached older one) and
 * publish.json carries it (an open client page checks it every 30 s and switches to a newer upload).
 */
export async function buildClientZip(config) {
  const own = THEME_DIRS[config.theme.mode];
  // The package carries the team's name everywhere (tab, password screen, top bar, section list, README)
  const team = teamName(config);
  config = { ...config, client: { name: team, slug: slugOf(team) } };
  const { zip, root, settings } = await pack(config, (f) => {
    if (f === 'play.html') return null; // written below with this export's config file name
    if (f === 'assets/app.js' || f === 'standalone.html' || f.startsWith('assets/vendor/') || DOCS.has(f)) return null;
    const theme = f.match(/^assets\/themes\/([^/]+?)(?:\.pack\.js|\/)/);
    if (theme && theme[1] !== own) return null; // other themes can't show
    return f;
  });
  const exportedAt = new Date().toISOString();
  const id = Date.now().toString(36);
  const html = await (await fetch('./play.html', { cache: 'no-store' })).text().catch(() => '');
  if (!html.includes('./config.js')) throw new Error('This build has no client page yet. Rebuild with npm run build (it makes play.html).');
  root.file('index.html', html.replace('./config.js', `./config.${id}.js`).replace(/<title>[^<]*<\/title>/, `<title>${team.replace(/[<&]/g, '')}_Demo</title>`));
  root.file(`config.${id}.js`, `window.__PROTO_CONFIG__ = ${JSON.stringify({ ...settings, packagedAt: exportedAt, publishId: id })};\n`);
  root.file('publish.json', JSON.stringify({ id, exportedAt, client: config.client.name, framework: VERSION_LABEL }, null, 1) + '\n');
  root.file('README.md', `# ${team}_Demo (client link)\n\nExported ${exportedAt.slice(0, 10)} · framework ${VERSION_LABEL} · export ${id}\n\n**To publish:** upload everything in this folder to one folder on the web server (e.g. \`/demo/${config.client.slug}/\`), replacing the previous upload. Open demos switch to the new upload within about 30 seconds, at the next screen change.\n\n**To open offline:** double-click \`index.html\`.\n\n${settings.access?.hash ? 'This demo asks for a password the first time it opens in a browser.' : 'No password: anyone with the link can open it.'}\n\nThis is the Play-only page: there is no Configure here. Changes are made in the owner's copy and exported again.\n`);
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
