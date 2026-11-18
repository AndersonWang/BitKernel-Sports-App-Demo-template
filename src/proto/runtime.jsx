import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SCREENS, JOURNEYS } from '../config/registry.js';

const Nav = createContext(null);
export const useNav = () => useContext(Nav);

/** Navigation for one device. Screens are ids from SCREENS; flags decide what's reachable. */
export function NavProvider({ config, initial = 'home', children, isClient }) {
  const [stack, setStack] = useState([initial]);
  const [toast, setToast] = useState(null);
  const [comments, setComments] = useState(false); // shared Comments bottom sheet (Modal/Flex 727:50303)
  const [transition, setTransition] = useState(null); // { from, type, duration } while a Figma transition plays
  const t = useRef();
  const tt = useRef();

  const enabled = useCallback((journeyId) => {
    const j = JOURNEYS.find((x) => x.id === journeyId);
    return !!config.flags[journeyId] && !(j && j.onHold);
  }, [config.flags]);

  const notify = useCallback((msg) => { setToast(msg); clearTimeout(t.current); t.current = setTimeout(() => setToast(null), 2200); }, []);

  const go = useCallback((id) => {
    const s = SCREENS[id];
    if (!s) return notify('Not part of this demo');
    if (!enabled(s.journey) && !JOURNEYS.find((j) => j.id === s.journey)?.hub) return notify('Not available in this demo');
    setStack((st) => [...st, id]);
  }, [enabled, notify]);

  const api = useMemo(() => ({
    current: stack[stack.length - 1],
    // Screen under the current one (overlays such as Clips View draw over it)
    under: stack[stack.length - 2],
    go,
    tab: (id) => setStack([id]),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    reset: (id) => setStack([id]),
    // Swap the current screen in place: in-page tabs (Watch pills, sub-tabs) shouldn't pile up Back history.
    swap: (id) => setStack((st) => [...st.slice(0, -1), id]),
    // Pop n screens then push id (a form's Save that lands on its result, e.g. Create → Play).
    popTo: (n, id) => setStack((st) => [...st.slice(0, Math.max(1, st.length - n)), id]),
    // Replace the whole history (e.g. launch → login → home: no way "back" to the splash).
    replace: (id, opts = {}) => {
      setStack((st) => {
        if (opts.transition) {
          setTransition({ from: st[st.length - 1], type: opts.transition, duration: opts.duration || 300 });
          clearTimeout(tt.current); tt.current = setTimeout(() => setTransition(null), (opts.duration || 300) + 50);
        }
        return [id];
      });
    },
    transition,
    comments, openComments: () => setComments(true), closeComments: () => setComments(false),
    canBack: stack.length > 1,
    dead: () => notify('Not part of this demo'), // hotspots with no destination in Figma
    enabled, notify, config, isClient,
  }), [stack, go, enabled, notify, config, isClient, transition, comments]);

  return <Nav.Provider value={api}>{children}{toast && <div className="p-toast" role="status">{toast}</div>}</Nav.Provider>;
}
