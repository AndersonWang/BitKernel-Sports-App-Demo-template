import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SCREENS, JOURNEYS } from '../config/registry.js';

const Nav = createContext(null);
export const useNav = () => useContext(Nav);

/** Navigation for one device. Screens are ids from SCREENS; flags decide what's reachable. */
export function NavProvider({ config, initial = 'home', children, isClient }) {
  const [stack, setStack] = useState([initial]);
  const [toast, setToast] = useState(null);
  const t = useRef();

  const enabled = useCallback((journeyId) => {
    const j = JOURNEYS.find((x) => x.id === journeyId);
    return !!config.flags[journeyId] && !(j && j.onHold);
  }, [config.flags]);

  const notify = useCallback((msg) => { setToast(msg); clearTimeout(t.current); t.current = setTimeout(() => setToast(null), 2200); }, []);

  const go = useCallback((id) => {
    const s = SCREENS[id];
    if (!s) return notify('Not part of this demo');
    if (!enabled(s.journey) && s.journey !== 'login-home') return notify('Not available in this demo');
    setStack((st) => [...st, id]);
  }, [enabled, notify]);

  const api = useMemo(() => ({
    current: stack[stack.length - 1],
    go,
    tab: (id) => setStack([id]),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    reset: (id) => setStack([id]),
    canBack: stack.length > 1,
    dead: () => notify('Not part of this demo'), // hotspots with no destination in Figma
    enabled, notify, config, isClient,
  }), [stack, go, enabled, notify, config, isClient]);

  return <Nav.Provider value={api}>{children}{toast && <div className="p-toast" role="status">{toast}</div>}</Nav.Provider>;
}
