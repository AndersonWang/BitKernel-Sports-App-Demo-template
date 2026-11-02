import { useEffect, useState } from 'react';
import { JOURNEYS } from './registry.js';

export const CONFIG_VERSION = 1;

export function defaultConfig() {
  return {
    version: CONFIG_VERSION,
    client: { name: 'Real Betis', slug: 'real-betis' },
    theme: { mode: 'Real Betis', overrides: {}, source: 'Figma mode' },
    flags: Object.fromEntries(JOURNEYS.map((j) => [j.id, !j.onHold])),
    assets: {}, // slotId -> data URL
    copy: {}, // fieldId -> string
    publishedAt: null,
  };
}

const KEY = 'bk-proto-config';
// Packaged client builds inject window.__PROTO_CONFIG__ via config.js and are read-only.
export const IS_CLIENT = typeof window !== 'undefined' && window.__PROTO_MODE__ === 'client';
const PACKAGED = typeof window !== 'undefined' ? window.__PROTO_CONFIG__ : null;

function merge(base, saved) {
  return saved ? { ...base, ...saved, theme: { ...base.theme, ...saved.theme }, flags: { ...base.flags, ...saved.flags } } : base;
}

export function loadConfig() {
  if (PACKAGED) return merge(defaultConfig(), PACKAGED);
  try { return merge(defaultConfig(), JSON.parse(localStorage.getItem(KEY))); } catch { return defaultConfig(); }
}

let current = loadConfig();
const subs = new Set();
export function getConfig() { return current; }
export function setConfig(next) {
  if (IS_CLIENT) return; // client links can't be changed from the browser
  current = typeof next === 'function' ? next(current) : next;
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* storage blocked: keep in memory */ }
  subs.forEach((f) => f(current));
}
export function useConfig() {
  const [c, set] = useState(current);
  useEffect(() => { subs.add(set); const onStorage = (e) => { if (e.key === KEY) { current = loadConfig(); set(current); } }; window.addEventListener('storage', onStorage); return () => { subs.delete(set); window.removeEventListener('storage', onStorage); }; }, []);
  return c;
}

export const copyOf = (config, id, fallback) => {
  const team = config.copy['team.main'] || 'Real Betis';
  const val = config.copy[id] ?? fallback;
  return typeof val === 'string' ? val.replace('{team}', team) : val;
};
