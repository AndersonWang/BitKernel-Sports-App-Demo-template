// Theme packs: in the template build, a theme's photos can ship as one script (assets/themes/<dir>.pack.js,
// a map of file → data URL) instead of ~180 separate files. The claude.ai host allows 511 files per artifact
// and the template carries every theme, so Boca's photos are packed there (vite.config.js PACKED).
// Client editions and dev keep plain files. The pack loads when its theme is selected.
const PACKED = typeof __PACKED_THEMES__ !== 'undefined' ? __PACKED_THEMES__ : {}; // mode -> folder
const packs = typeof window !== 'undefined' ? (window.__THEME_PACKS__ ||= {}) : {};
const pending = {};

/** The loaded pack for a theme folder (null until loaded, or when the theme isn't packed). */
export const packOf = (dir) => packs[dir] || null;

/** Loads the selected theme's pack if it has one. Resolves true when a pack was newly loaded. */
export function loadThemePack(mode) {
  const dir = PACKED[mode];
  if (!dir || packs[dir] || typeof document === 'undefined') return Promise.resolve(false);
  return (pending[dir] ||= new Promise((ok) => {
    const s = document.createElement('script');
    const v = typeof __THEME_HASH__ !== 'undefined' && __THEME_HASH__[dir];
    s.src = `./assets/themes/${dir}.pack.js${v ? `?v=${v}` : ''}`;
    s.onload = () => ok(true);
    s.onerror = () => ok(false); // falls back to plain file paths
    document.head.appendChild(s);
  }));
}
