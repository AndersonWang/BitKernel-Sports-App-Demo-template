import { useState } from 'react';
import { Header, AppBar, SectionTitle, SubNav, MatchCardLarge, PendingBlock } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { SCREENS, figmaLink } from '../config/registry.js';

function Screen({ header, appbar, children, bg = 'var(--colour-surface-default)' }) {
  return (
    <div className="p-screen" style={{ background: bg }}>
      {header}
      <main className="p-main">{children}</main>
      {appbar}
    </div>
  );
}

// Homepage — 643:19158
export function Home() {
  const nav = useNav();
  const fixtures = nav.enabled('fixtures');
  // Home sections in Figma order. Only "Fixtures" is coded; the rest keep their Figma footprint.
  const pending = [
    ['Small Banner Playlist', '660:116292', 216],
    ['Monthly Popular Creators', '652:38379', 172.75],
    ['Media/Horizontal Content List', '643:19174', 263],
    ['Media/Horizontal Content List', '643:19189', 240],
    ['Media/Horizontal Content List', '652:38825', 240],
    ['Media/Horizontal Content List', '643:19179', 314],
    ['Media/Horizontal Content List', '656:40097', 221],
    ['Posts', '643:19178', 201],
    ['Media/Horizontal Content List', '643:19184', 237],
    ['Voting', '1225:64716', 339],
    ['sports/placeholder bottom banner', '643:19190', 175],
  ];
  return (
    <Screen header={<Header />} appbar={<AppBar active="home" />}>
      <div className="p-stack" style={{ paddingTop: 'var(--spacing-default)', paddingBottom: 'var(--spacing-default)' }}>
        {fixtures && (
          <section>
            <SectionTitle title="Fixtures" action="Full Schedule" onAction={() => nav.go('fixtures')} />
            <div className="p-hscroll">
              <MatchCardLarge live opponent="opponent-1" onOpen={() => nav.go('fixtures')} />
              <MatchCardLarge opponent="opponent-2" onOpen={() => nav.go('fixtures')} />
              <MatchCardLarge opponent="opponent-3" onOpen={() => nav.go('fixtures')} />
              <MatchCardLarge opponent="opponent-4" onOpen={() => nav.go('fixtures')} />
            </div>
          </section>
        )}
        {pending.map(([name, node, h]) => <div key={node} className="p-pad16"><PendingBlock name={name} node={node} height={h} /></div>)}
      </div>
    </Screen>
  );
}

// Fixtures — 638:19155 (Upcoming tab)
export function Fixtures() {
  const nav = useNav();
  const [tab] = useState('upcoming');
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'results', label: 'Results', screen: 'fixtures-results' },
    { id: 'leagues', label: 'Leagues', screen: 'leagues' },
  ];
  return (
    <Screen header={<Header back title="Fixtures" ctas={['bell', 'search']} />} appbar={<AppBar active="none" />}>
      <div className="p-stack" style={{ padding: 'var(--spacing-default) 0 32px' }}>
        <SubNav items={tabs} active={tab} onSelect={(t) => t.screen && nav.go(t.screen)} />
        <section>
          <SectionTitle title="January" count={1} />
          <div className="p-vlist"><MatchCardLarge opponent="opponent-1" onOpen={() => nav.go('pre-game-stats')} /></div>
        </section>
        <section>
          <SectionTitle title="February" count={3} />
          <div className="p-vlist">
            <MatchCardLarge opponent="opponent-4" onOpen={() => nav.go('pre-game-stats')} />
            <MatchCardLarge opponent="opponent-2" onOpen={() => nav.go('pre-game-stats')} />
            <MatchCardLarge opponent="opponent-2" onOpen={() => nav.go('pre-game-stats')} />
          </div>
        </section>
      </div>
    </Screen>
  );
}

export function PendingScreen({ id }) {
  const nav = useNav();
  const s = SCREENS[id];
  return (
    <Screen header={<Header back={nav.canBack} title={nav.isClient ? '' : s.name.split(' / ')[0]} ctas={[]} />}>
      <div className="p-pendingscreen">
        <p className="p-subtitle">{nav.isClient ? 'Coming soon' : s.name}</p>
        {!nav.isClient && <>
          <p className="p-muted">Screen not coded yet. Figma frame {s.node}</p>
          <a className="p-link" href={figmaLink(s.node)} target="_blank" rel="noreferrer">Open in Figma</a>
        </>}
      </div>
    </Screen>
  );
}

const BUILT = { home: Home, fixtures: Fixtures };
export function renderScreen(id) {
  const C = BUILT[id];
  return C ? <C /> : <PendingScreen id={id} />;
}
