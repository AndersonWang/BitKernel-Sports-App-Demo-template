import THEME_TEXT from './theme-text.json';
import EXTRA_TEMPLATE from './theme-text.template.json';
import EXTRA_JUNIOR from '../editions/junior/theme-text.json';

// Per-theme text. theme-text.json is the theme pack's data (e.g. Conor's Junior pack, unchanged).
// The edition's extra file adds copy defaults, rules and lists for pages the pack doesn't cover:
// generic values in the template build, team-specific ones in the Junior FC build (VITE_EDITION=junior).
// Pure functions of the theme mode, so both the config store and the screens can use them.
const EXTRA = import.meta.env.VITE_EDITION === 'junior' ? EXTRA_JUNIOR : EXTRA_TEMPLATE;
const own = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')));
const packs = own(THEME_TEXT);
const extras = own(EXTRA);
const themes = Object.fromEntries([...new Set([...Object.keys(packs), ...Object.keys(extras)])].map((m) => {
  const p = packs[m] || {}; const x = extras[m] || {};
  return [m, {
    copy: { ...(x.copy || {}), ...(p.copy || {}) }, // the pack's own values win
    replace: [...(x.before || []), ...(p.replace || []), ...(x.after || [])],
    lists: x.lists || {},
  }];
}));

/** Copy-field defaults for a theme mode ({} when the theme has none). */
export const themeCopy = (mode) => themes[mode]?.copy || {};

/** A theme's replacement for a hard-coded list (e.g. Fan Clubs), or null to keep the shipped one. */
export const themeList = (mode, id) => themes[mode]?.lists[id] || null;

/** Apply the theme's ordered find/replace pairs to a string; anything else passes through untouched. */
export function themeText(mode, s) {
  const pairs = themes[mode]?.replace;
  if (!pairs || !pairs.length || typeof s !== 'string') return s;
  let out = s;
  for (const [from, to] of pairs) if (out.includes(from)) out = out.split(from).join(to);
  return out;
}
