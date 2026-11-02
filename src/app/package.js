import JSZip from 'jszip';

/**
 * Re-packages the running build into a client zip: same files + a config.js that locks the
 * player into client mode with this config. Works when the app is served from a build
 * (vite preview / file server); in `npm run dev` there is no files.json yet.
 */
export async function buildClientZip(config) {
  const res = await fetch('./files.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Package export needs a production build (npm run build, then serve dist/).');
  const files = await res.json();
  const zip = new JSZip();
  const root = zip.folder(config.client.slug || 'client');
  await Promise.all(files.map(async (f) => {
    const r = await fetch('./' + f);
    if (!r.ok) throw new Error('Missing file in build: ' + f);
    root.file(f, await r.arrayBuffer());
  }));
  const published = { ...config, publishedAt: new Date().toISOString() };
  root.file('config.js', `window.__PROTO_MODE__ = 'client';\nwindow.__PROTO_CONFIG__ = ${JSON.stringify(published)};\n`);
  root.file('README.txt', `Open index.html in Chrome, Edge or Safari. No install or internet needed.\nClient: ${config.client.name}\nPackaged: ${published.publishedAt}\n`);
  return zip.generateAsync({ type: 'blob' });
}

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
