import { VERSION_LABEL } from '../version.js';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { attachSwipe } from '../proto/swipe.js';
import { NavProvider, useNav } from '../proto/runtime.jsx';
import { renderScreen } from '../screens/screens.jsx';
import { CommentsSheet } from '../components/comments.jsx';
import { SCREENS } from '../config/registry.js';
import { playSections } from '../config/sections.js';
import { prefetchJourney } from './prefetch.js';
import { onScreenChange, resumeScreen, PLAY_ONLY } from './client.jsx';
import { VERSION } from '../version.js';
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
// A screen that throws shows this inside the phone (with a way back), instead of the whole-page crash.
// The details are what to send when reporting it.
export const errorDetails = (e, where) => [`${e?.name || 'Error'}: ${e?.message || e}`, where && `Screen: ${where}`, `Framework: ${VERSION_LABEL}`, `Browser: ${navigator.userAgent}`, String(e?.stack || '').split('\n').slice(0, 6).join('\n')].filter(Boolean).join('\n');
class ScreenGuard extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(e) { console.error('Screen error', this.props.id, e); }
  render() {
    if (!this.state.error) return this.props.children;
    const details = errorDetails(this.state.error, this.props.id);
    return (
      <div className="p-screen p-screenerr" role="alert">
        <b>This screen couldn't open</b>
        <p>The rest of the demo still works.</p>
        <div><button onClick={this.props.onBack}>Go back</button><button onClick={this.props.onHome}>Home</button></div>
        <button className="p-screenerr__copy" onClick={() => navigator.clipboard?.writeText(details)}>Copy error details</button>
        <pre>{details}</pre>
      </div>
    );
  }
}
const guarded = (id, nav) => <ScreenGuard key={id} id={id} onBack={nav.back} onHome={() => nav.replace('home')}>{renderScreen(id)}</ScreenGuard>;

// Renders the current screen; during a Figma "Dissolve" the new screen fades in over the old one.
function Current() {
  const nav = useNav();
  const tr = nav.transition;
  // After the screen has settled (its own images first), warm the rest of its journey
  const journey = SCREENS[nav.current]?.journey;
  useEffect(() => { const t = setTimeout(() => prefetchJourney(journey), 1500); return () => clearTimeout(t); }, [journey]);
  // Client page: a newer upload waiting is applied as the screen changes, never mid-tap
  useEffect(() => { onScreenChange(nav.current); }, [nav.current]);
  return (
    <>
      {tr && <div key={'from-' + tr.from} className="p-layer">{guarded(tr.from, nav)}</div>}
      {/* Overlay screens (Figma "Open overlay", e.g. Clips View) slide up over the screen they were opened from */}
      {SCREENS[nav.current]?.overlay && nav.under && <div key={nav.under} className="p-layer">{guarded(nav.under, nav)}</div>}
      <div key={nav.current} className={'p-layer' + (tr ? ' p-dissolve-in' : '') + (SCREENS[nav.current]?.overlay && nav.under ? ' p-layer--overlay' : '')} style={tr ? { animationDuration: tr.duration + 'ms' } : undefined}>{guarded(nav.current, nav)}</div>
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
  const journeys = playSections(config);
  const [start] = useState(() => resumeScreen() || journeys[0]?.start || 'home');
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

// "9 Nov 2026, 14:30" in the viewer's own time zone: when this client package was exported
const exportedLabel = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

/** Device + journey list. Each journey resets the device to its start screen — no hunting for a way back. */
// Play is what a client sees: stand-ins read "Coming soon" and no Figma links are shown.
export function Player({ config, isClient = true }) {
  const journeys = playSections(config);
  const first = { start: journeys[0]?.start || 'home', id: journeys[0]?.id };
  const [picked, setRun] = useState(() => { const s = resumeScreen(); return s ? { start: s, id: journeys.find((j) => j.start === s)?.id || SCREENS[s].journey, n: 0 } : { ...first, n: 0 }; });
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
                  <span>{j.label}</span>
                  {!isClient && !built && <small>start screen not built</small>}
                </button>
              </li>
            );
          })}
        </ul>
        <button className="app-restart" onClick={() => setRun((r) => ({ ...r, n: r.n + 1 }))}>Restart this journey</button>
        {PLAY_ONLY && config.packagedAt && <p className="app-journeys__ver">v{VERSION} · Updated {exportedLabel(config.packagedAt)}</p>}
      </aside>
      <div className="app-stage">
        <div className="app-phone"><Device key={run.n} config={config} initial={run.start} isClient={isClient} /></div>
      </div>
    </div>
  );
}
