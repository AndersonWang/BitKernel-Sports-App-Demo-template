import THEME_TEXT from './theme-text.json';
import EXTRA_TEMPLATE from './theme-text.template.json';
import EXTRA_JUNIOR from '../editions/junior/theme-text.json';
import EXTRA_BOCA from '../editions/boca/theme-text.json';

// Per-theme text. theme-text.json is the theme pack's data (e.g. Conor's Junior pack, unchanged).
// The edition's extra file adds copy defaults, rules and lists for pages the pack doesn't cover:
// the team files (src/editions/<id>/theme-text.json) win for their own theme in every build, so the template
// shows the same Junior FC and Boca text as their client packages; theme-text.template.json is the fallback.
// Pure functions of the theme mode, so both the config store and the screens can use them.
const EXTRA = { ...EXTRA_TEMPLATE, ...EXTRA_JUNIOR, ...EXTRA_BOCA };
const own = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')));
const packs = own(THEME_TEXT);
const extras = own(EXTRA);
const themes = Object.fromEntries([...new Set([...Object.keys(packs), ...Object.keys(extras)])].map((m) => {
  const p = packs[m] || {}; const x = extras[m] || {};
  return [m, {
    copy: { ...(x.copy || {}), ...(p.copy || {}) }, // the pack's own values win
    replace: [...(x.before || []), ...(p.replace || []), ...(x.after || [])],
    lists: x.lists || {},
    exact: { ...(p.exact || {}), ...(x.exact || {}) }, // whole-string swaps (a lone name or label), checked first
    cup: p.cup || x.cup || null,
  }];
}));

/** Copy-field defaults for a theme mode ({} when the theme has none). */
export const themeCopy = (mode) => themes[mode]?.copy || {};

/** A theme's replacement for a hard-coded list (e.g. Fan Clubs), or null to keep the shipped one. */
export const themeList = (mode, id) => themes[mode]?.lists[id] || null;

/** Apply the theme's ordered find/replace pairs to a string; anything else passes through untouched. */
export function themeText(mode, s) {
  const t = themes[mode];
  if (!t || typeof s !== 'string') return s;
  if (Object.prototype.hasOwnProperty.call(t.exact, s)) return t.exact[s];
  const pairs = t.replace;
  if (!pairs.length) return s;
  let out = s;
  for (const [from, to] of pairs) if (out.includes(from)) out = out.split(from).join(to);
  return out;
}

/** A theme's cup rule: matches against these opponents are labelled with the cup, not the league
 *  (Boca: Palmeiras and Flamengo → Copa Libertadores). null when the theme has none. */
export const themeCup = (mode, opponent) => {
  const c = themes[mode]?.cup;
  return c && c.opponents.some((o) => o.toLowerCase() === String(opponent || '').trim().toLowerCase()) ? c : null;
};
