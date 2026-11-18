// Uploads are made lighter before they're stored, so the demo loads fast and client packages stay small.
// Everything runs in the browser with built-in APIs (no extra libraries). The original file is kept whenever a
// step isn't supported here or the result wouldn't be meaningfully smaller.
//
// Images: scaled down to the slot's size (never up), saved as WebP (JPEG where the browser can't write WebP and
//   the image has no transparency). SVG and GIF are left as they are.
// Videos: re-recorded at up to 1280 px on the long side, H.264 MP4 at ~2.5 Mbit/s, with sound only where the
//   spot plays it. Uses MediaRecorder's MP4 output (Chrome/Edge 126+, Safari); other browsers keep the original.

const KEEP_RATIO = 0.9; // use the optimized file only if it is at least 10% smaller
const MAX_SIDE = 2048; // images with no known slot size

/** "750×1624" / "512 × 512 px" → [750, 1624]; anything else → null */
export const parseSize = (s) => { const m = String(s || '').match(/(\d+)\s*[×x]\s*(\d+)/); return m ? [Number(m[1]), Number(m[2])] : null; };

const fit = (w, h, maxW, maxH) => { const k = Math.min(1, maxW / w, maxH / h); return [Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))]; };
const toBlob = (canvas, type, q) => new Promise((ok) => canvas.toBlob(ok, type, q));
const named = (blob, file, ext) => new File([blob], file.name.replace(/\.[^.]+$/, '') + ext, { type: blob.type });

/** Returns { file, note } — note says what changed ("1.8 MB → 240 KB, WebP 750×1624"), or null if kept as is. */
export async function optimizeImage(file, slotSize) {
  if (!/^image\/(png|jpe?g|webp|bmp|avif|heic|heif)$/i.test(file.type)) return { file, note: null };
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { return { file, note: null }; }
  // Keep the upload's own shape; cap its long side at the slot's long side (shipped files are already 2-3x)
  const side = Math.min(slotSize ? Math.max(...slotSize) : MAX_SIDE, MAX_SIDE);
  const [w, h] = fit(bmp.width, bmp.height, side, side);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high';
  g.drawImage(bmp, 0, 0, w, h); bmp.close?.();
  let out = await toBlob(c, 'image/webp', 0.82);
  let ext = '.webp';
  if (!out || out.type !== 'image/webp') {
    // No WebP encoder (older Safari): JPEG for opaque images, otherwise keep the original
    const d = g.getImageData(0, 0, w, h).data; let alpha = false;
    for (let i = 3; i < d.length; i += 16) if (d[i] < 250) { alpha = true; break; }
    if (alpha) return { file, note: null };
    out = await toBlob(c, 'image/jpeg', 0.85); ext = '.jpg';
  }
  if (!out || out.size > file.size * KEEP_RATIO) return { file, note: null };
  return { file: named(out, file, ext), note: `${fmt(file.size)} → ${fmt(out.size)}, ${ext === '.webp' ? 'WebP' : 'JPEG'} ${w}×${h}` };
}

const MP4 = ['video/mp4;codecs=avc1.4d401f,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4'];
export const canOptimizeVideo = () => typeof MediaRecorder !== 'undefined' && typeof HTMLCanvasElement !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream && MP4.some((t) => MediaRecorder.isTypeSupported?.(t));

/**
 * Re-records a video smaller. Takes as long as the clip plays (it runs in real time), so long files are skipped.
 * onProgress(0..1). Returns { file, note } like optimizeImage.
 */
export async function optimizeVideo(file, { sound = false, onProgress = () => {}, maxSeconds = 90 } = {}) {
  if (!canOptimizeVideo()) return { file, note: null };
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.src = url; v.playsInline = true; v.preload = 'auto'; v.crossOrigin = 'anonymous';
  let ctx;
  try {
    await new Promise((ok, err) => { v.onloadedmetadata = ok; v.onerror = () => err(new Error('unreadable')); });
    const dur = v.duration;
    if (!isFinite(dur) || dur <= 0 || dur > maxSeconds) return { file, note: null };
    const [w, h] = fit(v.videoWidth, v.videoHeight, 1280, 1280).map((n) => n - (n % 2));
    const bitrate = Math.round(2500000 * (w * h) / (1280 * 720));
    // Already small enough: same size or lighter than what we'd make
    if (w === v.videoWidth - (v.videoWidth % 2) && file.size * 8 / dur <= bitrate * 1.2) return { file, note: null };
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const stream = c.captureStream(30);
    if (sound) {
      // Sound goes to the recorder only, never to the speakers
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = ctx.createMediaElementSource(v); const dest = ctx.createMediaStreamDestination(); src.connect(dest);
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch { v.muted = true; }
    } else v.muted = true;
    const type = MP4.find((t) => MediaRecorder.isTypeSupported(t) && (stream.getAudioTracks().length || !t.includes('mp4a')));
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: bitrate, audioBitsPerSecond: 128000 });
    const parts = []; rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
    const stopped = new Promise((ok) => { rec.onstop = ok; });
    const draw = () => { g.drawImage(v, 0, 0, w, h); };
    let raf;
    const loop = () => { draw(); onProgress(Math.min(1, v.currentTime / dur)); if (!v.ended) raf = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(loop) : requestAnimationFrame(loop); };
    v.currentTime = 0;
    await new Promise((ok) => { v.onseeked = ok; setTimeout(ok, 500); });
    draw();
    rec.start(1000);
    try { await v.play(); } catch {
      // Autoplay with sound refused: record silent rather than not at all
      v.muted = true; await v.play();
    }
    loop();
    await new Promise((ok) => { v.onended = ok; });
    cancelAnimationFrame(raf);
    rec.stop(); await stopped;
    onProgress(1);
    const out = new Blob(parts, { type: 'video/mp4' });
    if (!out.size || out.size > file.size * KEEP_RATIO) return { file, note: null };
    return { file: named(out, file, '.mp4'), note: `${fmt(file.size)} → ${fmt(out.size)}, MP4 ${w}×${h}` };
  } catch {
    return { file, note: null };
  } finally {
    URL.revokeObjectURL(url); v.removeAttribute('src'); ctx?.close?.();
  }
}

export const fmt = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
