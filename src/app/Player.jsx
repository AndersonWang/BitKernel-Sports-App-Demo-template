import { useEffect, useMemo, useRef, useState } from 'react';
import { attachSwipe } from '../proto/swipe.js';
import { NavProvider, useNav } from '../proto/runtime.jsx';
import { renderScreen } from '../screens/screens.jsx';
import { CommentsSheet } from '../components/comments.jsx';
import { JOURNEYS, SCREENS } from '../config/registry.js';
import { resolveTokens, tokensToStyle } from '../tokens/theme.js';

export function Device({ config, initial, isClient, children, height }) {
  const tokens = useMemo(() => tokensToStyle(resolveTokens(config.theme.mode, config.theme.overrides)), [config.theme]);
  // Phone view: the device takes the screen's height instead of the 812px Figma frame
  const style = height ? { ...tokens, height, '--p-h': height + 'px' } : tokens;
  const ref = useRef(null);
  useEffect(() => (ref.current ? attachSwipe(ref.current) : undefined), []);
  return (
    <div className="p-device" style={style} ref={ref}>
      <NavProvider config={config} initial={initial} isClient={isClient}>
        <Current />
        {children}
      </NavProvider>
    </div>
  );
}
// Renders the current screen; during a Figma "Dissolve" the new screen fades in over the old one.
function Current() {
  const nav = useNav();
  const tr = nav.transition;
  return (
    <>
      {tr && <div key={'from-' + tr.from} className="p-layer">{renderScreen(tr.from)}</div>}
      {/* Overlay screens (Figma "Open overlay", e.g. Clips View) slide up over the screen they were opened from */}
      {SCREENS[nav.current]?.overlay && nav.under && <div key={nav.under} className="p-layer">{renderScreen(nav.under)}</div>}
      <div key={nav.current} className={'p-layer' + (tr ? ' p-dissolve-in' : '') + (SCREENS[nav.current]?.overlay && nav.under ? ' p-layer--overlay' : '')} style={tr ? { animationDuration: tr.duration + 'ms' } : undefined}>{renderScreen(nav.current)}</div>
      {nav.comments && <CommentsSheet onClose={nav.closeComments} />}
    </>
  );
}

/** Phones and small tablets in portrait: just the app, full screen (no journey list, no frame). */
// Touch screens only, so a narrow desktop window (or the claude.ai side panel) keeps the journey list.
export const MOBILE_QUERY = '(pointer: coarse) and (max-width: 600px), (pointer: coarse) and (max-height: 500px)';
export function useMobile() {
  const q = typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY) : null;
  const [m, setM] = useState(() => !!q?.matches);
  useEffect(() => { if (!q) return undefined; const f = () => setM(q.matches); q.addEventListener('change', f); return () => q.removeEventListener('change', f); }, []);
  return m;
}
// Live viewport size (visualViewport follows the mobile URL bar showing and hiding).
function useViewport() {
  const read = () => ({ w: window.visualViewport?.width || window.innerWidth, h: window.visualViewport?.height || window.innerHeight });
  const [v, setV] = useState(read);
  useEffect(() => {
    const f = () => setV(read());
    window.addEventListener('resize', f); window.visualViewport?.addEventListener('resize', f);
    return () => { window.removeEventListener('resize', f); window.visualViewport?.removeEventListener('resize', f); };
  }, []);
  return v;
}

// The client link on a phone: the prototype fills the screen. The 375px Figma layout is zoomed to the
// screen width (CSS zoom keeps every pixel position from Figma), and the device takes the screen height.
// Starts on the first journey that is on (Launch & Login when on, else Homepage); the app's own
// navigation (app bar, Home) moves between journeys. Landscape asks to turn the phone upright.
export function MobilePlayer({ config }) {
  const journeys = JOURNEYS.filter((j) => config.flags[j.id] && !j.onHold);
  const start = journeys[0]?.start || 'home';
  const { w, h } = useViewport();
  const landscape = w > h;
  const zoom = w / 375;
  useEffect(() => { document.documentElement.classList.add('is-mobile-play'); return () => document.documentElement.classList.remove('is-mobile-play'); }, []);
  if (landscape) return <div className="app-rotate" role="status"><span aria-hidden="true">↻</span><p>Turn your phone upright to use the demo.</p></div>;
  return (
    <div className="app-mobile" style={{ zoom }}>
      <Device key={start} config={config} initial={start} isClient height={Math.round(h / zoom)} />
    </div>
  );
}

/** Device + journey list. Each journey resets the device to its start screen — no hunting for a way back. */
// Play is what a client sees: stand-ins read "Coming soon" and no Figma links are shown.
export function Player({ config, isClient = true }) {
  const journeys = JOURNEYS.filter((j) => config.flags[j.id] && !j.onHold);
  const first = { start: journeys[0]?.start || 'home', id: journeys[0]?.id };
  const [picked, setRun] = useState({ ...first, n: 0 });
  // A journey switched off while it was playing falls back to the first one still on (Homepage when Login is off).
  const run = journeys.some((j) => j.id === picked.id) ? picked : { ...first, n: picked.n + 0.5 };
  const launch = (j) => setRun((r) => ({ start: j.start, n: r.n + 1, id: j.id }));
  return (
    <div className="app-player">
      <aside className="app-journeys" aria-label="Journeys">
        <div className="app-journeys__client">{config.client.name}</div>
        <h2>Journeys</h2>
        <ul>
          {journeys.map((j) => {
            const built = SCREENS[j.start]?.status === 'built';
            return (
              <li key={j.id}>
                <button className={'app-journey' + (run.id === j.id ? ' is-active' : '')} onClick={() => launch(j)}>
                  <span>{j.name}</span>
                  {!isClient && !built && <small>start screen not built</small>}
                </button>
              </li>
            );
          })}
        </ul>
        <button className="app-restart" onClick={() => setRun((r) => ({ ...r, n: r.n + 1 }))}>Restart this journey</button>
      </aside>
      <div className="app-stage">
        <div className="app-phone"><Device key={run.n} config={config} initial={run.start} isClient={isClient} /></div>
      </div>
    </div>
  );
}
