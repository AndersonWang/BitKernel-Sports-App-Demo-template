import { useEffect, useState } from 'react';
import { JOURNEYS } from './registry.js';
import { cleanSections } from './sections.js';
import { MODES, EDITION, EDITION_MODE, sanitiseOverrides, cleanLaunchColours } from '../tokens/theme.js';
// Client editions (frozen 9 Nov): their own theme and storage key; the client name comes from the theme. Template = Real Betis.
// key :2 = settings reset (5 Nov): uploads saved before the theme defaults were built in no longer override them.
const EDITIONS = {
  junior: { key: 'bk-proto-config:junior-fc:2' },
  boca: { key: 'bk-proto-config:boca-juniors:2' },
};
const ED = EDITIONS[EDITION] || null;
import { themeCopy } from '../tokens/themeText.js';
import { loadThemePack } from '../tokens/themePacks.js';
import { loadMedia } from './media.js';

export const CONFIG_VERSION = 1;

/** Starting point for everyone who opens the link (config.js can override it, e.g. in a zip copy). */
/** Client name for a theme: the theme's name without its mode ("Junior de Barranquilla (Light)" → "Junior de Barranquilla").
 *  The theme JSON (src/tokens/semantics.json "modes") is the single source: client name, slug, package and file names,
 *  browser tab, password screen and top bars all follow it. Rename the mode in the theme JSON to rename the client. */
export const themeClientName = (mode) => String(mode || '').replace(/\s*\([^)]*\)\s*$/, '').trim() || 'Sports App';
export const slugOf = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client';
/** "Boca Juniors" → "Boca-Juniors": the name as used in file names */
export const fileNameOf = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Client';
// Theme modes that aren't a club: there the client name is typed in Configure (the slug still follows it).
export const GENERIC_MODES = new Set(['Default', 'Adult', 'Religion']);
export const isGenericMode = (mode) => GENERIC_MODES.has(mode);
/** { name, slug } for a theme: from the theme JSON for a club mode, from the typed name for a generic one. */
export const clientFor = (mode, typed) => { const name = isGenericMode(mode) ? (String(typed || '').trim() || 'Client') : themeClientName(mode); return { name, slug: slugOf(name) }; };
/** The team / client name everything shows. Same as config.client.name (kept in step by merge). */
export const teamName = (config) => clientFor(config.theme.mode, config.client?.name).name;

export function defaultConfig() {
  const base = {
    version: CONFIG_VERSION,
    // Template: Real Betis by default (Junior and Boca are theme options). Client editions: their theme only.
    client: clientFor(EDITION_MODE || 'Real Betis'),
    theme: { mode: EDITION_MODE || 'Real Betis', overrides: {}, source: 'Figma mode' },
    flags: Object.fromEntries(JOURNEYS.map((j) => [j.id, !j.onHold])),
    flagsV: 3,
    assets: {}, // slotId -> data URL
    copy: {}, // fieldId -> string
    sections: { order: [], names: {}, custom: [] }, // Configure › Sections (src/config/sections.js)
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
  // Sports Highlights became a real section on 10 Nov (it was an "In design" placeholder, always off)
  if (saved?.flags && (saved.flagsV ?? 0) < 3) saved = { ...saved, flagsV: 3, flags: { ...saved.flags, 'sports-highlights': true } };
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
  const sections = cleanSections(saved.sections);
  sections.custom.forEach((c) => { if (!(c.id in flags)) flags[c.id] = true; });
  for (const [k, v] of Object.entries(obj(saved.flags))) if (k in flags) flags[k] = !!v;
  const strings = (o) => Object.fromEntries(Object.entries(obj(o)).filter(([, v]) => typeof v === 'string'));
  // Client name + slug always follow the theme (generic modes: the typed name), never a stale saved value
  const client = clientFor(theme.mode, str(obj(saved.client).name, base.client.name));
  // Client link password: only its salt + hash (Configure › Save & share › Client link)
  const acc = obj(saved.access);
  const access = typeof acc.salt === 'string' && /^[0-9a-f]{64}$/.test(acc.hash || '') ? { access: { salt: acc.salt, hash: acc.hash } } : {};
  // Highlight videos moved to six slots on 12 Nov: Game → Highlights 1, Fantasy → Highlights 2
  const assets = strings(saved.assets);
  for (const [from, to] of [['hl-game', 'hl-1'], ['hl-fantasy', 'hl-2']]) { const k = `@assets/highlights/${from}.mp4`; if (assets[k] && !assets[`@assets/highlights/${to}.mp4`]) assets[`@assets/highlights/${to}.mp4`] = assets[k]; }
  ['hl-game', 'hl-betting', 'hl-fantasy', 'hl-points', 'hl-player'].forEach((x) => delete assets[`@assets/highlights/${x}.mp4`]);
  return { ...base, ...access, ...(saved.packagedAt ? { packagedAt: saved.packagedAt } : {}), flagsV: saved.flagsV ?? base.flagsV, client, theme, flags, sections, assets, copy: strings(saved.copy), ...(cleanLaunchColours(obj(saved.launch).colors) ? { launch: { colors: cleanLaunchColours(saved.launch.colors) } } : {}) };
}

/** "Boca Juniors" → "Boca-Juniors_Demo_v1.1.0_Nov09.zip" */
export const clientZipName = (config, version, d = new Date(), kind = '') =>
  `${fileNameOf(teamName(config))}_Demo${kind ? '_' + kind : ''}_v${version}_${d.toLocaleString('en-US', { month: 'short' })}${String(d.getDate()).padStart(2, '0')}.zip`;
/** "Boca-Juniors_Demo_config.json" */
export const configFileName = (config) => `${fileNameOf(teamName(config))}_Demo_config.json`;

/** Fresh settings for one theme: defaults, that theme, its client name. */
export function defaultFor(mode) {
  const base = defaultConfig();
  if (!mode || mode === base.theme.mode) return base;
  return { ...base, client: clientFor(mode), theme: { ...base.theme, mode }, copy: {}, assets: {} };
}

/** An imported config, reduced to valid fields (see merge). */
export const sanitiseConfig = (json) => merge(defaultConfig(), json);

/** True when a parsed JSON file looks like an exported config (Export config), not a token file. */
export const isConfigFile = (j) => !!j && typeof j === 'object' && !Array.isArray(j) && ('theme' in j || 'flags' in j || 'copy' in j || 'client' in j) && !('colour' in j);

// Each person's settings live in their own browser. Nobody can change the demo for someone else.
// A packaged copy (offline zip) gets its own key per client and per package: copies opened from disk
// share one browser storage, so without this client B's zip would open with client A's edits.
const PKG = typeof window !== 'undefined' ? window.__PROTO_CONFIG__ : null;
const KEY = PKG ? `bk-proto-config:${PKG.client?.slug || 'client'}:${PKG.packagedAt || ''}` : ED ? ED.key : 'bk-proto-config';
// The Play-only client page reads only the exported config file: no saved settings, nothing saved back
const PLAY_ONLY = typeof __PLAY_ONLY__ !== 'undefined' && __PLAY_ONLY__;
function load() { if (PLAY_ONLY) return defaultConfig(); try { return merge(defaultConfig(), JSON.parse(localStorage.getItem(KEY))); } catch { return defaultConfig(); } }
// Settings per theme (template): switching theme in Configure parks the current theme's settings and brings back
// the new theme's own (or fresh ones), so Boca's uploads and text never leak into Junior's package.
const STASH = KEY + ':themes';
let stash = {};
if (!PLAY_ONLY) try { stash = JSON.parse(localStorage.getItem(STASH)) || {}; } catch { stash = {}; }
const saveStash = () => { try { localStorage.setItem(STASH, JSON.stringify(stash)); } catch {} };
/** Media refs used by any theme's saved settings (so pruning one theme's uploads keeps the others'). */
export const stashedAssets = () => Object.values(stash).flatMap((c) => Object.values(c?.assets || {}));
/** Configure › Theme: switch to another theme's own settings. */
export function switchTheme(mode) {
  if (mode === current.theme.mode) return;
  stash = { ...stash, [current.theme.mode]: current };
  const { [mode]: saved, ...rest } = stash;
  stash = rest; saveStash();
  setConfig(saved ? merge(defaultFor(mode), { ...saved, theme: { ...saved.theme, mode } }) : defaultFor(mode));
  loadMedia(current).then(() => { current = { ...current }; subs.forEach((f) => f(current)); });
}
/** Escape hatch used by the crash screen: forget this browser's saved settings. */
export function resetSaved() { try { localStorage.removeItem(KEY); } catch {} }

let current = load();
let saveError = null;
const subs = new Set();
export function getConfig() { return current; }
export function setConfig(next) {
  current = typeof next === 'function' ? next(current) : next;
  if (!PLAY_ONLY) try { localStorage.setItem(KEY, JSON.stringify(current)); saveError = null; }
  catch { saveError = 'Settings could not be saved in this browser (storage is full or blocked). They last until you close the page.'; }
  subs.forEach((f) => f(current));
  // A packed theme (template build) loads its photos on first selection, then everything re-renders
  loadThemePack(current.theme.mode).then((loaded) => { if (loaded) { current = { ...current }; subs.forEach((f) => f(current)); } });
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
