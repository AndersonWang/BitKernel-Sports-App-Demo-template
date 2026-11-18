// Warm the browser cache for the journey being played: once a screen has settled, the images of the other
// screens in the same journey load quietly in the background (3 at a time, low priority, when the browser is
// idle), so tapping to the next screen shows its photos at once on a slow connection. Videos are skipped.
// Nothing changes on screen. Skipped when the phone asks to save data or the connection is 2G.
import SEEN from '../config/media-seen.json';
import { SCREENS } from '../config/registry.js';
import { asset } from '../components/ui.jsx';
import { getConfig } from '../config/store.js';

const done = new Set();
const queue = [];
let busy = 0;
const slow = () => { const c = typeof navigator !== 'undefined' && navigator.connection; return !!c && (c.saveData || /2g/.test(c.effectiveType || '')); };
const idle = (f) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(f, { timeout: 2000 }) : setTimeout(f, 200));

function pump() {
  while (busy < 3 && queue.length) {
    const p = queue.shift();
    busy++;
    idle(() => {
      const url = asset(p);
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) { busy--; pump(); return; } // already in memory
      const img = new Image();
      img.fetchPriority = 'low';
      img.decoding = 'async';
      img.onload = img.onerror = () => { busy--; pump(); };
      img.src = url;
    });
  }
}

/** Queue the images of every screen in this journey (once per journey and theme). */
export function prefetchJourney(journey) {
  const key = journey + '|' + getConfig().theme.mode;
  if (!journey || done.has(key) || slow()) return;
  done.add(key);
  const files = new Set();
  for (const [id, s] of Object.entries(SCREENS)) if (s.journey === journey) (SEEN[id] || []).forEach((f) => { if (!/\.(mp4|webm|mov)$/i.test(f)) files.add(f); });
  queue.push(...files);
  pump();
}
