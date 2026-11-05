// Uploaded images and videos live in this browser's IndexedDB, not in the settings (localStorage
// holds ~5 MB, one video would fill it). The settings keep a short reference: "idb:<id>".
// Older settings may still hold data: URLs, and packaged zips hold relative paths (media/<id>.<ext>);
// both resolve as they are.
const DB = 'bk-proto-media';
const STORE = 'files';
const urls = new Map(); // idb:<id> -> object URL
const blobs = new Map(); // idb:<id> -> Blob

function open() {
  return new Promise((ok, err) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => err(r.error);
  });
}
function tx(mode, fn) {
  return open().then((db) => new Promise((ok, err) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => ok(req?.result);
    t.onerror = () => err(t.error);
  }));
}

export const isRef = (v) => typeof v === 'string' && v.startsWith('idb:');
/** URL to put in src: idb refs become object URLs; anything else is already a URL. */
export const resolveMedia = (v) => (isRef(v) ? urls.get(v) || '' : v);

const remember = (ref, blob) => { blobs.set(ref, blob); urls.set(ref, URL.createObjectURL(blob)); };

/** Stores a file and returns its reference. Throws if this browser blocks storage. */
export async function putMedia(file) {
  const ref = 'idb:' + (crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  await tx('readwrite', (s) => s.put(file, ref));
  remember(ref, file);
  return ref;
}

/** Loads every stored file the settings point at (call once before the first render). */
export async function loadMedia(config) {
  const refs = Object.values(config?.assets || {}).filter(isRef).filter((r) => !urls.has(r));
  if (!refs.length) return;
  try {
    await Promise.all(refs.map((ref) => tx('readonly', (s) => s.get(ref)).then((b) => b && remember(ref, b))));
  } catch { /* storage blocked: those slots fall back to the shipped file */ }
}

/** Removes stored files no setting points at any more. */
export function pruneMedia(config) {
  const used = new Set(Object.values(config.assets || {}));
  [...blobs.keys()].filter((r) => !used.has(r)).forEach((ref) => {
    URL.revokeObjectURL(urls.get(ref)); urls.delete(ref); blobs.delete(ref);
    tx('readwrite', (s) => s.delete(ref)).catch(() => {});
  });
}

export const blobOf = (ref) => blobs.get(ref);

/** Imported configs carry files as data: URLs; move them into IndexedDB so the settings stay small. */
export async function absorbDataUrls(config) {
  const assets = { ...(config.assets || {}) };
  for (const [k, v] of Object.entries(assets)) {
    if (typeof v === 'string' && v.startsWith('data:')) {
      try { assets[k] = await putMedia(await (await fetch(v)).blob()); } catch { /* keep the data URL */ }
    }
  }
  return { ...config, assets };
}

const toDataUrl = (b) => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = err; r.readAsDataURL(b); });
/** Export: replace idb refs with data: URLs so the .json carries the files to another browser. */
export async function inlineMedia(config) {
  const assets = {};
  for (const [k, v] of Object.entries(config.assets || {})) assets[k] = isRef(v) && blobs.get(v) ? await toDataUrl(blobs.get(v)) : v;
  return { ...config, assets };
}

const MB = 1024 * 1024;
/** Upload from Configure. Images up to 10 MB, videos up to 60 MB. */
export async function storeFile(file, kind) {
  const max = kind === 'video' ? 60 : 10;
  if (file.size > max * MB) throw new Error(`File is over ${max} MB. Export it smaller`);
  try { return await putMedia(file); } catch {
    // Storage blocked (some private windows): small images still fit in the settings themselves
    if (kind === 'image' && file.size <= 1.5 * MB) return toDataUrl(file);
    throw new Error('This browser blocks file storage (private window?). Use a normal window');
  }
}

// ---- Video checks (Configure › Videos). MP4, WebM and MOV are accepted; what matters is the codec inside.
// H.264 (avc1) and VP8/VP9 play in every browser. HEVC (hvc1/hev1, the iPhone default) plays in Safari and
// on some Macs/PCs only. ProRes (apch/apcn/apcs/apco/ap4h/ap4x) plays in Safari only.
const SAFARI = typeof navigator !== 'undefined' && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
const CODECS = [['avc1', 'H.264'], ['avc3', 'H.264'], ['hvc1', 'HEVC'], ['hev1', 'HEVC'], ['ap4h', 'ProRes'], ['ap4x', 'ProRes'], ['apch', 'ProRes'], ['apcn', 'ProRes'], ['apcs', 'ProRes'], ['apco', 'ProRes'], ['vp09', 'VP9'], ['av01', 'AV1']];
async function sniffCodec(file) {
  if (/webm/i.test(file.type) || /\.webm$/i.test(file.name)) return 'VP8/VP9';
  // The codec tag sits in the moov box, which cameras often write at the end: scan the whole file
  const text = new TextDecoder('latin1').decode(new Uint8Array(await file.arrayBuffer()));
  const hit = CODECS.find(([tag]) => text.includes(tag));
  return hit ? hit[1] : null;
}
// Loads the file; resolves { ok, alpha } where alpha = share of transparent pixels in a frame (0 = opaque)
function probe(file) {
  return new Promise((ok) => {
    const v = document.createElement('video'); const url = URL.createObjectURL(file); v.muted = true; v.preload = 'auto'; v.playsInline = true;
    const done = (r) => { clearTimeout(t); URL.revokeObjectURL(url); v.removeAttribute('src'); ok(r); };
    const t = setTimeout(() => done({ ok: v.videoWidth > 0, alpha: null }), 8000);
    v.onerror = () => done({ ok: false });
    v.onloadeddata = () => { if (!v.videoWidth) return done({ ok: false }); v.currentTime = Math.min(1, (v.duration || 2) / 2); };
    v.onseeked = () => {
      try {
        const w = 120, h = Math.round(120 * v.videoHeight / v.videoWidth);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(v, 0, 0, w, h);
        const d = g.getImageData(0, 0, w, h).data; let clear = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] < 250) clear++;
        done({ ok: true, alpha: clear / (w * h) });
      } catch { done({ ok: true, alpha: null }); }
    };
    v.src = url;
  });
}
/** { error } blocks the upload; { warn } saves it with a note shown in Configure. */
export async function checkVideo(file, { needsAlpha = false } = {}) {
  const isMov = /quicktime/i.test(file.type) || /\.mov$/i.test(file.name);
  const codec = await sniffCodec(file);
  const { ok, alpha } = await probe(file);
  const fix = 'Export it again as MP4 (H.264), e.g. QuickTime › File › Export As › 1080p with "Use HEVC" unticked, or HandBrake';
  if (!ok) return { error: `this browser can't play it${codec ? ` (${codec}${isMov ? ' in a .mov' : ''})` : ''}. ${fix}` };
  // The avatar floats over the page: a file that draws no transparent pixels here shows as a solid box.
  if (needsAlpha && alpha !== null && alpha < 0.02) {
    const why = SAFARI && codec === 'VP8/VP9' ? "Safari can't show transparency in WebM; open Configure in Chrome or Edge, or use a .mov with alpha (HEVC) for Safari"
      : codec === 'H.264' ? "H.264 (MP4, or a .mov exported as H.264) can't carry transparency. Export WebM (VP9) with alpha, e.g. After Effects › Render Queue › WebM with RGB + Alpha, or Shutter Encoder › VP9 with alpha"
        : 'the file has no transparent pixels (its background is part of the picture). Export it again with an alpha channel as WebM (VP9)';
    return { warn: `Saved, but no transparent background was found, so it shows as a box over the page instead of floating like the default avatar: ${why}.` };
  }
  if (codec === 'HEVC') return { warn: `Saved, but it's HEVC: it plays here and in Safari, but can show blank in Chrome on Windows and in Firefox. For a demo on someone else's computer, use MP4 (H.264).` };
  if (codec === 'ProRes') return { warn: `Saved, but it's ProRes: it plays in Safari only, and the file is large. Use MP4 (H.264) unless the demo runs in Safari.` };
  return {};
}
