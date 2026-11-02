import { useMemo, useState } from 'react';
import { NavProvider, useNav } from '../proto/runtime.jsx';
import { renderScreen } from '../screens/screens.jsx';
import { JOURNEYS, SCREENS } from '../config/registry.js';
import { resolveTokens, tokensToStyle } from '../tokens/theme.js';

export function Device({ config, initial, isClient, children }) {
  const style = useMemo(() => tokensToStyle(resolveTokens(config.theme.mode, config.theme.overrides)), [config.theme]);
  return (
    <div className="p-device" style={style}>
      <NavProvider config={config} initial={initial} isClient={isClient}>
        <Current />
        {children}
      </NavProvider>
    </div>
  );
}
function Current() { const nav = useNav(); return <div key={nav.current}>{renderScreen(nav.current)}</div>; }

/** Device + journey list. Each journey resets the device to its start screen — no hunting for a way back. */
export function Player({ config, isClient }) {
  // Client links only list journeys whose start screen is built, so nobody lands on a stand-in.
  const journeys = JOURNEYS.filter((j) => config.flags[j.id] && !j.onHold && (!isClient || SCREENS[j.start]?.status === 'built'));
  const [run, setRun] = useState({ start: journeys[0]?.start || 'home', n: 0, id: journeys[0]?.id });
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
