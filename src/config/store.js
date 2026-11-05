import { useEffect, useState } from 'react';
import { JOURNEYS } from './registry.js';
import { MODES, JUNIOR_MODE, sanitiseOverrides, cleanLaunchColours } from '../tokens/theme.js';
const JUNIOR = import.meta.env.VITE_EDITION === 'junior';
import { themeCopy } from '../tokens/themeText.js';

export const CONFIG_VERSION = 1;

/** Starting point for everyone who opens the link (config.js can override it, e.g. in a zip copy). */
export function defaultConfig() {
  const base = {
    version: CONFIG_VERSION,
    // Template: Real Betis by default (Junior is a theme option). Junior FC edition: Junior only.
    client: JUNIOR ? { name: 'Junior FC', slug: 'junior-fc' } : { name: 'Real Betis', slug: 'real-betis' },
    theme: { mode: JUNIOR ? JUNIOR_MODE : 'Real Betis', overrides: {}, source: 'Figma mode' },
    flags: Object.fromEntries(JOURNEYS.map((j) => [j.id, !j.onHold])),
    flagsV: 2,
    assets: {}, // slotId -> data URL
    copy: {}, // fieldId -> string
  };
  return merge(base, typeof window !== 'undefined' ? window.__PROTO_CONFIG__ : null);
}

function merge(base, saved) {
  // Settings saved before Login / Home was split into two flags
  if (saved?.flags && 'login-home' in saved.flags) {
    const { 'login-home': v, ...rest } = saved.flags;
    saved = { ...saved, flags: { login: v, home: v, ...rest } };
  }
  // Predictions was on hold (always off) before v26: turn it on once for settings saved before then
  if (saved?.flags && !saved.flagsV) saved = { ...saved, flagsV: 2, flags: { ...saved.flags, predictions: true } };
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return base;
  const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
  const str = (x, d) => (typeof x === 'string' ? x : d);
  // Only take the fields a config has, with the right types: a token file or a damaged save
  // (e.g. raw Figma colour objects stored by an older build) must never be able to blank the page.
  const theme = { ...base.theme, ...obj(saved.theme) };
  theme.mode = MODES.includes(theme.mode) ? theme.mode : base.theme.mode;
  theme.overrides = sanitiseOverrides(theme.overrides);
  theme.source = str(theme.source, base.theme.source);
  const flags = { ...base.flags };
  for (const [k, v] of Object.entries(obj(saved.flags))) if (k in flags) flags[k] = !!v;
  const strings = (o) => Object.fromEntries(Object.entries(obj(o)).filter(([, v]) => typeof v === 'string'));
  const client = { name: str(obj(saved.client).name, base.client.name), slug: str(obj(saved.client).slug, base.client.slug) };
  return { ...base, ...(saved.packagedAt ? { packagedAt: saved.packagedAt } : {}), flagsV: saved.flagsV ?? base.flagsV, client, theme, flags, assets: strings(saved.assets), copy: strings(saved.copy), ...(cleanLaunchColours(obj(saved.launch).colors) ? { launch: { colors: cleanLaunchColours(saved.launch.colors) } } : {}) };
}

/** An imported config, reduced to valid fields (see merge). */
export const sanitiseConfig = (json) => merge(defaultConfig(), json);

/** True when a parsed JSON file looks like an exported config (Export config), not a token file. */
export const isConfigFile = (j) => !!j && typeof j === 'object' && !Array.isArray(j) && ('theme' in j || 'flags' in j || 'copy' in j || 'client' in j) && !('colour' in j);

// Each person's settings live in their own browser. Nobody can change the demo for someone else.
// A packaged copy (offline zip) gets its own key per client and per package: copies opened from disk
// share one browser storage, so without this client B's zip would open with client A's edits.
const PKG = typeof window !== 'undefined' ? window.__PROTO_CONFIG__ : null;
const KEY = PKG ? `bk-proto-config:${PKG.client?.slug || 'client'}:${PKG.packagedAt || ''}` : JUNIOR ? 'bk-proto-config:junior-fc' : 'bk-proto-config';
function load() { try { return merge(defaultConfig(), JSON.parse(localStorage.getItem(KEY))); } catch { return defaultConfig(); } }
/** Escape hatch used by the crash screen: forget this browser's saved settings. */
export function resetSaved() { try { localStorage.removeItem(KEY); } catch {} }

let current = load();
let saveError = null;
const subs = new Set();
export function getConfig() { return current; }
export function setConfig(next) {
  current = typeof next === 'function' ? next(current) : next;
  try { localStorage.setItem(KEY, JSON.stringify(current)); saveError = null; }
  catch { saveError = 'Settings could not be saved in this browser (storage is full or blocked). They last until you close the page.'; }
  subs.forEach((f) => f(current));
}
export const getSaveError = () => saveError;
export function useConfig() {
  const [c, set] = useState(current);
  useEffect(() => { subs.add(set); return () => subs.delete(set); }, []);
  return c;
}

// Copy placeholders resolve to other copy fields, so one edit to the club name / fans / stadium flows everywhere.
// Lookup order for every field: the Configure value, then the selected theme's default (theme-text.json › copy),
// then the build default.
const TOKENS = { team: 'team.main', full: 'team.full', fans: 'team.fans', stadium: 'stadium', tags: 'team.hashtags' };
const TOKEN_DEFAULTS = { 'team.main': 'Real Betis', 'team.full': 'Real Betis Balompié', 'team.fans': 'Béticos', stadium: 'Benito Villamarín', 'team.hashtags': '#RealBetis #ManquePierda' };
const field = (config, id) => config.copy[id] || themeCopy(config.theme.mode)[id];
export const fillCopy = (config, text) => (typeof text === 'string'
  ? text.replace(/\{(team|full|fans|stadium|tags)\}/g, (_, k) => field(config, TOKENS[k]) || TOKEN_DEFAULTS[TOKENS[k]])
  : text);
export const copyOf = (config, id, fallback) => fillCopy(config, config.copy[id] ?? themeCopy(config.theme.mode)[id] ?? fallback);
