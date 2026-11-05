import semantics from './semantics.json';
import LAUNCH from './theme-launch.json';

// Figma token name -> CSS custom property. "colour/text/on-Primary" -> "--colour-text-on-primary"
export const cssVar = (name) => '--' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const v = (name) => `var(${cssVar(name)})`;

// The Junior FC edition (VITE_EDITION=junior) offers only its own theme; the template offers every mode.
export const JUNIOR_MODE = 'Junior de Barranquilla (Light)';
export const MODES = import.meta.env.VITE_EDITION === 'junior' ? [JUNIOR_MODE] : semantics.modes;
export const TOKEN_NAMES = Object.keys(semantics.vars);

/** Resolve every token for a Figma mode, then apply per-client overrides (from an imported theme JSON). */
export function resolveTokens(mode, overrides = {}) {
  const i = Math.max(0, semantics.modes.indexOf(mode));
  const out = {};
  for (const [name, val] of Object.entries(semantics.vars)) out[name] = Array.isArray(val) ? val[i] : val;
  return { ...out, ...overrides };
}

export function tokensToStyle(tokens) {
  const style = {};
  for (const [name, val] of Object.entries(tokens)) {
    if (typeof val === 'number') style[cssVar(name)] = name.startsWith('rounding') || name.startsWith('spacing') ? `${val}px` : String(val);
    else if (typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb'))) style[cssVar(name)] = val;
  }
  return style;
}

/**
 * Accepts three shapes so designers can export however is easiest:
 *  1. This repo's format: { modes: [...], vars: { name: [perMode] | value } }  (+ optional "mode" to pick one)
 *  2. Flat map: { "colour/brand/primary": "#008b28", ... }
 *  3. Nested W3C/Tokens-Studio style: { colour: { brand: { primary: { $value: "#008b28" } } } }
 * Returns { overrides, unknown, missing } — unknown names are reported, never silently applied.
 */
export function parseThemeJson(json, preferredMode) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('This file is not a token file (expected a JSON object of tokens).');
  let flat = {};
  const types = {};
  if (Array.isArray(json.modes) && json.vars) {
    const i = Math.max(0, json.modes.indexOf(preferredMode || json.mode || json.modes[0]));
    for (const [k, val] of Object.entries(json.vars)) flat[k] = Array.isArray(val) ? val[i] : val;
  } else {
    const walk = (obj, prefix) => {
      for (const [k, val] of Object.entries(obj)) {
        if (k.startsWith('$')) continue;
        const name = prefix ? `${prefix}/${k}` : k;
        if (val && typeof val === 'object' && !Array.isArray(val) && ('$value' in val || 'value' in val)) {
          flat[name] = val.$value ?? val.value;
          types[name] = val.$extensions?.['com.figma.type'] || val.$type || val.type;
        } else if (val && typeof val === 'object' && !Array.isArray(val)) walk(val, name);
        else flat[name] = val;
      }
    };
    walk(json, '');
  }
  // Aliases like "{colour.brand.primary}" point at another token in the same file.
  const resolveAlias = (val, depth = 0) => {
    const m = typeof val === 'string' && val.match(/^\{([^}]+)\}$/);
    if (!m || depth > 10) return val;
    const target = m[1].replace(/\./g, '/');
    return target in flat ? resolveAlias(flat[target], depth + 1) : undefined;
  };
  const known = new Set(TOKEN_NAMES);
  // Designers sometimes annotate a variable name in Figma, e.g. "surface/input (change to faint if not input)".
  const match = (k) => (known.has(k) ? k : known.has(k.replace(/\s*\([^)]*\)\s*$/, '')) ? k.replace(/\s*\([^)]*\)\s*$/, '') : null);
  const overrides = {}; const unknown = []; const skipped = [];
  for (const [k, raw] of Object.entries(flat)) {
    const name = match(k);
    if (!name) { unknown.push(k); continue; }
    const val = normaliseTokenValue(resolveAlias(raw), types[k]);
    if (val === undefined) skipped.push(k); else overrides[name] = val;
  }
  const missing = TOKEN_NAMES.filter((n) => n.startsWith('colour/') && !(n in overrides));
  return { overrides, unknown, missing, skipped };
}

const hex2 = (x) => Math.round(Math.min(1, Math.max(0, Number(x))) * 255).toString(16).padStart(2, '0');
/**
 * Turn any token value a Figma / W3C / Tokens Studio export can hold into the plain value the app uses:
 * "#rrggbb" or "#rrggbbaa" for colours, a number, a boolean or a string. Returns undefined for anything
 * else (e.g. an unresolved Figma VARIABLE_ALIAS), so an odd file can never put an object into the theme.
 */
export function normaliseTokenValue(val, type) {
  if (val == null) return undefined;
  if (type === 'boolean') return typeof val === 'string' ? val === 'true' : !!val;
  if (typeof val === 'number' || typeof val === 'boolean') return Number.isFinite(val) || typeof val === 'boolean' ? val : undefined;
  if (typeof val === 'string') return val;
  if (typeof val !== 'object' || Array.isArray(val)) return undefined;
  // W3C 2025 / Figma native export: { colorSpace, components: [r,g,b] 0–1, alpha, hex }
  const alpha = val.alpha ?? val.a ?? 1;
  const aa = alpha < 1 ? hex2(alpha) : '';
  if (typeof val.hex === 'string' && /^#?[0-9a-f]{6}$/i.test(val.hex)) return ('#' + val.hex.replace('#', '') + aa).toLowerCase();
  if (Array.isArray(val.components) && val.components.length >= 3 && (!val.colorSpace || val.colorSpace === 'srgb')) return '#' + val.components.slice(0, 3).map(hex2).join('') + aa;
  // Figma Plugin API colour: { r, g, b, a } 0–1
  if (['r', 'g', 'b'].every((c) => typeof val[c] === 'number')) return '#' + [val.r, val.g, val.b].map(hex2).join('') + aa;
  return undefined;
}

/** Keep only valid token values (repairs settings saved by older builds that stored raw objects). */
export function sanitiseOverrides(overrides) {
  const out = {};
  if (!overrides || typeof overrides !== 'object') return out;
  for (const [k, v] of Object.entries(overrides)) {
    const val = normaliseTokenValue(v);
    if (val !== undefined && TOKEN_NAMES.includes(k)) out[k] = val;
  }
  return out;
}

// --- WCAG contrast (AA) on the pairs a client theme most often breaks ---
function rgb(hex) {
  const h = String(hex).replace('#', '');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
function lum(hex) {
  const c = rgb(hex); if (!c) return null;
  const [r, g, b] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const la = lum(a), lb = lum(b); if (la == null || lb == null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const PAIRS = [
  ['colour/text/primary', 'colour/surface/default', 4.5, 'Body text on page'],
  ['colour/text/secondary', 'colour/surface/default', 4.5, 'Secondary text on page'],
  ['colour/text/primary', 'colour/surface/raised', 4.5, 'Text on cards'],
  ['colour/text/on-Primary', 'colour/action/primary', 4.5, 'Primary button label'],
  ['colour/text/on-Secondary', 'colour/action/secondary', 4.5, 'Secondary button label'],
  ['colour/icon/primary', 'colour/surface/default', 3, 'Icons on page'],
];
export function contrastReport(tokens) {
  return PAIRS.map(([fg, bg, min, label]) => {
    const ratio = contrast(tokens[fg], tokens[bg]);
    return { label, fg, bg, ratio: ratio ? Math.round(ratio * 100) / 100 : null, min, pass: ratio != null && ratio >= min };
  });
}

// --- Opening animation colours (Loading Screen gradient + shader) ---
const isHex6 = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
/** Three valid #rrggbb stops, or null. */
export const cleanLaunchColours = (c) => (Array.isArray(c) && c.length === 3 && c.every(isHex6) ? c.map((x) => x.toLowerCase()) : null);
/** The theme's own launch colours (theme-launch.json), falling back to the Figma default. */
export const themeLaunchColours = (mode) => cleanLaunchColours(LAUNCH[mode]) || LAUNCH.default;
/** What the Loading Screen shows: a Configure choice first, then the theme's colours. */
export const launchColours = (config) => cleanLaunchColours(config?.launch?.colors) || themeLaunchColours(config?.theme?.mode);
