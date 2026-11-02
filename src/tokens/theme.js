import semantics from './semantics.json';

// Figma token name -> CSS custom property. "colour/text/on-Primary" -> "--colour-text-on-primary"
export const cssVar = (name) => '--' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const v = (name) => `var(${cssVar(name)})`;

export const MODES = semantics.modes;
export const TOKEN_NAMES = Object.keys(semantics.vars);

/** Resolve every token for a Figma mode, then apply per-client overrides (from an imported theme JSON). */
export function resolveTokens(mode, overrides = {}) {
  const i = Math.max(0, MODES.indexOf(mode));
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
  let flat = {};
  if (json && Array.isArray(json.modes) && json.vars) {
    const i = Math.max(0, json.modes.indexOf(preferredMode || json.mode || json.modes[0]));
    for (const [k, val] of Object.entries(json.vars)) flat[k] = Array.isArray(val) ? val[i] : val;
  } else {
    const walk = (obj, prefix) => {
      for (const [k, val] of Object.entries(obj)) {
        if (k.startsWith('$')) continue;
        const name = prefix ? `${prefix}/${k}` : k;
        if (val && typeof val === 'object' && ('$value' in val || 'value' in val)) flat[name] = val.$value ?? val.value;
        else if (val && typeof val === 'object') walk(val, name);
        else flat[name] = val;
      }
    };
    walk(json, '');
  }
  const known = new Set(TOKEN_NAMES);
  const overrides = {}; const unknown = [];
  for (const [k, val] of Object.entries(flat)) (known.has(k) ? (overrides[k] = val) : unknown.push(k));
  const missing = TOKEN_NAMES.filter((n) => n.startsWith('colour/') && !(n in overrides));
  return { overrides, unknown, missing };
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
