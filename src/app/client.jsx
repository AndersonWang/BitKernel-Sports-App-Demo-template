// Play-only client page (play.html, built with __PLAY_ONLY__): the password gate and the new-upload check.
import { useState } from 'react';
import { sha256 } from './sha256.js';
import { getConfig } from '../config/store.js';
import { SCREENS } from '../config/registry.js';

export const PLAY_ONLY = typeof __PLAY_ONLY__ !== 'undefined' && __PLAY_ONLY__;

// ---- Optional password (Configure › Save & share › Client link). Only {salt, hash} travel in the package.
export const hashPassword = (salt, password) => sha256(`${salt}:${password}`);
const okKey = (a) => `bk-play-ok:${a.hash.slice(0, 16)}`;
export function isUnlocked() {
  const a = getConfig().access;
  if (!PLAY_ONLY || !a?.hash) return true;
  try { return localStorage.getItem(okKey(a)) === '1'; } catch { return false; }
}

export function Gate({ onOpen }) {
  const a = getConfig().access;
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (hashPassword(a.salt, value) !== a.hash) { setWrong(true); return; }
    try { localStorage.setItem(okKey(a), '1'); } catch { /* remembered for this visit only */ }
    onOpen();
  };
  return (
    <form className="app-gate" onSubmit={submit}>
      <h1>{getConfig().client.name}</h1>
      <p>This demo is password protected.</p>
      <label htmlFor="gate-pw">Password</label>
      <input id="gate-pw" type="password" autoFocus autoComplete="current-password" value={value} onChange={(e) => { setValue(e.target.value); setWrong(false); }} aria-invalid={wrong} aria-describedby={wrong ? 'gate-err' : undefined} />
      {wrong && <p id="gate-err" className="app-err" role="alert">That password isn't right. Check with the person who sent you the link.</p>}
      <button type="submit" disabled={!value}>Open the demo</button>
    </form>
  );
}

// ---- New upload check. A client package carries publish.json ({ id }) beside index.html. On a web server the
// page fetches it every 30 s (never cached); when the id differs from the loaded one, it reloads the next time
// the screen changes, so nothing jumps mid-tap. Opened from disk (file://) it never checks.
let pending = null;
export function startUpdateCheck() {
  const loaded = window.__PROTO_CONFIG__?.publishId;
  if (!PLAY_ONLY || !loaded || !/^https?:/.test(location.protocol)) return;
  const check = async () => {
    try {
      const r = await fetch(`./publish.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) return;
      const { id } = await r.json();
      if (id && id !== loaded) pending = id;
    } catch { /* offline for a moment: try again next time */ }
  };
  setInterval(check, 30000);
}
/** Called whenever the phone shows a new screen: switch to a newer upload if one is waiting. */
export function onScreenChange(screen) {
  if (!pending) return;
  // A new query string makes the browser fetch index.html again, which points at the new config file;
  // ?screen= reopens the screen the client had just moved to, so the switch feels like a normal tap
  location.replace(`${location.pathname}?v=${pending}&screen=${encodeURIComponent(screen || '')}${location.hash}`);
}
/** The screen to reopen after switching to a newer upload (client page only), or null. */
export function resumeScreen() {
  if (!PLAY_ONLY) return null;
  const s = new URLSearchParams(location.search).get('screen');
  return s && SCREENS[s] ? s : null;
}
