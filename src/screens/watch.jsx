// Watch — Figma section "Live Channels" (674:26407) + Watch / Betis OG + Watch / BETIS+.
// One Figma frame = one screen id (see registry). Tabs inside Watch swap the current screen,
// so Back returns to wherever you came from instead of replaying every tab you tapped.
import { useState } from 'react';
import { Header, AppBar, SectionTitle, MatchCardLarge, Button, Icon, useCopy, useSlot, asset, tx, shortName, MatchMedia, MATCH_VIDEO, isReplaced } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { ConceptCard } from './home.jsx';
import { setStatsOpponent, PGR_open, PGR_WatchStatsBody } from './pregame.jsx';

const w = (f) => asset(`assets/watch/${f}`);
const home = (f) => asset(`assets/home/${f}.webp`);

const CHANNELS = [
  { no: '001', name: 'ESPN', get logo() { return w('ch-espn.webp'); } },
  { no: '002', name: 'CINEMAX', get logo() { return w('ch-cinemax.webp'); } },
  { no: '003', name: 'SPORTV', get logo() { return w('ch-sportv.svg'); } },
  { no: '004', name: 'SPORT2', get logo() { return w('ch-sportv2.svg'); } },
  { no: '005', name: 'COMBATE', get logo() { return w('ch-combate.webp'); } },
  { no: '006', name: 'ESPN2', get logo() { return w('ch-espn2.webp'); } },
  { no: '007', name: 'ESPN3', get logo() { return w('ch-espn3.webp'); } },
  { no: '008', name: 'ESPN4', get logo() { return w('ch-espn4.webp'); } },
  { no: '009', name: 'BAND SPORTS', get logo() { return w('ch-band.webp'); } },
];

// Navigation/Sub: Live Channel / Betis Original / BETIS+
function WatchTop({ active }) {
  const nav = useNav();
  const items = [
    { id: 'live', label: 'Live Channel', screen: 'watch' },
    { id: 'og', label: tx('Betis Original'), screen: 'watch-og' },
    { id: 'plus', label: tx('BETIS+'), screen: 'watch-betisplus' },
  ];
  return (
    <div className="p-subnav">
      {items.map((it) => (
        <button key={it.id} className={'p-subnav__item p-subnav__item--watch' + (it.id === active ? ' is-selected' : '')}
          onClick={() => it.id !== active && nav.swap(it.screen)}>{it.label}</button>
      ))}
    </div>
  );
}

function WatchScreen({ top, children }) {
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header />
      <main className="p-main">
        <div className="p-watch">
          <div className="p-watch__top"><WatchTop active={top} />{top === 'live' && <MiniPlayer />}</div>
          {children}
        </div>
      </main>
      <AppBar active="watch" />
    </div>
  );
}

// media/minimized player
function MiniPlayer({ onStats }) {
  const nav = useNav();
  const still = useSlot('watch-live');
  const show = useCopy('watch.show');
  const channel = useCopy('watch.channel');
  return (
    <div className="p-miniplayer">
      <div className="p-miniplayer__video" style={{ backgroundImage: `url(${still})` }} onClick={() => nav.go('live-player')} role="button" aria-label="Open player">
        {isReplaced(MATCH_VIDEO) && <MatchMedia className="p-miniplayer__media" still={still} />}
        <span className="p-livetag"><i />LIVE</span>
        <div className="p-miniplayer__bar">
          {['screen-cast', 'volume', 'fullscreen'].map((i) => <Icon key={i} name={i} size={20} color="var(--colour-icon-white-overlay)" />)}
        </div>
      </div>
      <div className="p-miniplayer__info">
        <div className="p-miniplayer__text">
          <span className="p-miniplayer__title">{show}</span>
          <span className="p-miniplayer__cap"><Icon name="live-tv" size={16} color="var(--colour-text-secondary)" />{channel}<span>{tx('· LaLiga · Men’s ')}</span><span> · Group Stage</span></span>
        </div>
        <button className="p-iconbtn" aria-label="Stats" onClick={onStats || (() => nav.go('watch-stats'))}><Icon name="stats" size={24} /></button>
      </div>
    </div>
  );
}

// Button/Pill row: Channels / Playback / Guide / Fixture
function Pills({ active }) {
  const nav = useNav();
  const items = [['channels', 'Channels', 'watch'], ['playback', 'Playback', 'watch-playback'], ['guide', 'Guide', 'watch-guide'], ['fixture', 'Fixture', 'watch-upcoming']];
  return (
    <div className="p-pills">
      {items.map(([id, label, screen]) => (
        <button key={id} className={'p-pill' + (id === active ? ' is-selected' : '')} onClick={() => id !== active && nav.swap(screen)}>{label}</button>
      ))}
    </div>
  );
}

// Navigation/Tab-Underline
function UnderlineTabs({ items, active }) {
  const nav = useNav();
  return (
    <div className="p-tabs p-wtabs" role="tablist">
      {items.map(([id, label, screen]) => (
        <button key={id} role="tab" aria-selected={id === active} className={'p-tabs__item' + (id === active ? ' is-active' : '')}
          onClick={() => id !== active && nav.swap(screen)}>{label}</button>
      ))}
    </div>
  );
}

// ---- Channels: Free / BETIS+ / Premium (668:20509, 670:20846, 674:23712)
function Channels({ tier }) {
  const nav = useNav();
  const [sel, setSel] = useState(0);
  const locked = tier !== 'free';
  const tabs = [['free', 'Free Channels', 'watch'], ['plus', tx('BETIS+'), 'watch-plus'], ['premium', 'Premium', 'watch-premium']];
  return (
    <WatchScreen top="live">
      <div className="p-watch__group">
        <Pills active="channels" />
        <UnderlineTabs items={tabs} active={tier} />
        <div className="p-chgrid">
          {CHANNELS.map((c, i) => (
            <button key={c.no} className={'p-chcard' + (!locked && i === sel ? ' is-selected' : '')} onClick={() => (locked ? nav.notify('Subscribe to unlock this channel') : setSel(i))}>
              <span className="p-chcard__logo"><img src={c.logo} alt="" /></span>
              <span className="p-chcard__no">{c.no}</span>
              <span className="p-chcard__name">{locked ? 'Title' : c.name}</span>
              {locked && <span className="p-chcard__lock"><Icon name="lock" size={16} color="var(--colour-icon-inverse)" /></span>}
            </button>
          ))}
        </div>
      </div>
    </WatchScreen>
  );
}
export const WatchFree = () => <Channels tier="free" />;
export const WatchPlus = () => <Channels tier="plus" />;
export const WatchPremium = () => <Channels tier="premium" />;

// livetv/date navigator
function DateNav() {
  const [sel, setSel] = useState(0);
  const days = [['Tue', '3/5'], ['Wed', '3/6'], ['Thu', '3/7'], ['Fri', '3/8'], ['Sat', '3/9'], ['Sun', '3/10']];
  return (
    <div className="p-datenav">
      {days.map(([d, n], i) => (
        <button key={d} className={'p-datenav__item' + (i === sel ? ' is-selected' : '')} onClick={() => setSel(i)}><b>{d}</b><span>{n}</span></button>
      ))}
    </div>
  );
}

// ---- Playback (670:21345)
export function WatchPlayback() {
  const nav = useNav();
  const [sel, setSel] = useState(0);
  const stations = [['001', 'ESPN', 'ch-espn.webp'], ['002', 'CINEMAX', 'ch-cinemax.webp'], ['003', 'SPORTTV', 'ch-sportv2.svg'], ['004', 'SPORTTV2', 'ch-sportv2.svg'], ['005', 'COMBATE', 'ch-combate.webp']];
  const list = [[tx('Betis vs Sevilla · Full Match'), '16:00~18:00'], [tx('Betis vs Real Madrid · Highlights'), '18:00~18:30'], [tx('Betis Round 27 · Goals Show'), '18:30~19:30'], ['Fan League Matchday · Replay', '19:30~21:00']];
  return (
    <WatchScreen top="live">
      <div className="p-watch__group">
        <Pills active="playback" />
        <div className="p-stations">
          {stations.map(([no, name, logo], i) => (
            <button key={no} className={'p-station' + (i === sel ? ' is-selected' : '')} onClick={() => setSel(i)}>
              <span className="p-station__pic"><img src={w(logo)} alt="" /></span>
              <span className="p-station__no">{no}</span>
              <span className="p-station__name">{name}</span>
            </button>
          ))}
        </div>
        <DateNav />
        <section>
          <SectionTitle title="Playback List" />
          <div className="p-epglist">
            {list.map(([t, time]) => (
              <div key={t} className="p-epgitem">
                <div className="p-epgitem__text"><span className="p-epgitem__title">{t}</span><span className="p-epgitem__time">{time}</span></div>
                <Button variant="secondary" onClick={() => nav.go('live-player')}>Playback</Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WatchScreen>
  );
}

// ---- Guide (670:22709): EPG grid, scrolls sideways as one block
export function WatchGuide() {
  const nav = useNav();
  const rows = [
    { no: '001', ch: 'SPORTV', selected: true, now: { left: '3m left', title: 'FC Barcelona vs Athletic Club', live: true }, next: 'Movistar Plus+' },
    { no: '002', ch: 'ESPN', now: { left: '3m left', title: tx('Betis vs Sevilla'), live: true }, next: 'Sports Center' },
    { no: '003', ch: 'PREMIERE', now: { left: '3m left', title: 'Premier Replay' }, next: 'Newsroom' },
    { no: '005', ch: 'TNT SPORTS', long: { left: '1:23m left', title: 'Champions Night' } },
    { no: '006', ch: 'BANDSPORTS', long: { left: '1:23m left', title: 'Fan League Match day' } },
  ];
  return (
    <WatchScreen top="live">
      <div className="p-watch__group">
        <Pills active="guide" />
        <DateNav />
        <div className="p-epg">
          <div className="p-epg__inner">
            <div className="p-epg__times">
              {['21:00PM', '21:30PM', '22:00PM', '22:30PM'].map((t) => <span key={t} className="p-epg__slot"><span>{t}</span><i /></span>)}
            </div>
            <div className="p-epg__rows">
              {rows.map((r) => (
                <div key={r.no} className="p-epg__row">
                  <span className={'p-epg__ch' + (r.selected ? ' is-selected' : '')}><small>{r.no}</small><b>{r.ch}</b></span>
                  {r.now && (
                    <button className={'p-epg__card p-epg__card--now' + (r.now.live ? ' is-live' : '') + (r.selected ? ' is-selected' : '')} onClick={() => nav.go('live-player')}>
                      <small>{r.now.left}</small><span>{r.now.title}</span>
                    </button>
                  )}
                  {r.next && <button className="p-epg__card p-epg__card--next" onClick={nav.dead}><small>22:00PM - 23:00PM</small><span>{r.next}</span></button>}
                  {r.long && <button className="p-epg__card p-epg__card--long" onClick={() => nav.go('live-player')}><small>{r.long.left}</small><span>{r.long.title}</span></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WatchScreen>
  );
}

// ---- Fixture: Upcoming / Results / Leagues (674:24485, 674:25066, 674:25607)
function Fixture({ tab }) {
  const nav = useNav();
  const stats = (opp) => { setStatsOpponent(opp); nav.go('pre-game-stats'); };
  const tabs = [['upcoming', 'Upcoming', 'watch-upcoming'], ['results', 'Results', 'watch-results'], ['leagues', 'Leagues', 'watch-leagues']];
  const men = tx('2025-2026 La Liga · Men’s · Group Stage');
  const women = '2025-2026 Libertadores · Women’s · Group Stage';
  const result = (comp, replay, key) => <MatchCardLarge key={key} result replay={replay} competition={comp} opponent="opponent-2" onOpen={() => PGR_open(nav, comp.includes('Libertadores') ? 'watch-res-lib' : 'watch-res')} onDetails={() => PGR_open(nav, comp.includes('Libertadores') ? 'watch-res-lib' : 'watch-res')} />;
  return (
    <WatchScreen top="live">
      <div className="p-watch__group">
        <Pills active="fixture" />
        <UnderlineTabs items={tabs} active={tab} />
        {tab === 'leagues' && (
          <div className="p-sortrow">
            <span>Sort by</span>
            <button className="p-btn p-btn--secondary p-sortrow__btn" onClick={nav.dead}><span>All Leagues</span><Icon name="chevron-down" size={18} color="var(--colour-icon-on-secondary)" /></button>
          </div>
        )}
      </div>
      {tab === 'upcoming' ? <>
        <section>
          <SectionTitle title="January" count={2} />
          <div className="p-vlist">
            <MatchCardLarge live opponent="opponent-1" onOpen={() => PGR_open(nav, 'live-home')} />
            <MatchCardLarge predict opponent="opponent-3" onOpen={() => stats('opponent-3')} />
          </div>
        </section>
        <section>
          <SectionTitle title="February" count={3} />
          <div className="p-vlist">
            {['opponent-4', 'opponent-2', 'opponent-2'].map((o, i) => <MatchCardLarge key={i} predict opponent={o} onOpen={() => stats(o)} />)}
          </div>
        </section>
      </> : <>
        <section>
          <SectionTitle title="January" count={2} />
          <div className="p-vlist">{result(men, true, 1)}{result(women, false, 2)}</div>
        </section>
        <section>
          <SectionTitle title="February" count={3} />
          <div className="p-vlist">{[1, 2, 3].map((k) => result(women, false, k))}</div>
        </section>
      </>}
    </WatchScreen>
  );
}
export const WatchUpcoming = () => <Fixture tab="upcoming" />;
export const WatchResults = () => <Fixture tab="results" />;
export const WatchLeagues = () => <Fixture tab="leagues" />;

// Card/Clips (optionally locked)
function Clip({ photo, title, locked, onClick }) {
  return (
    <button className="p-clip" onClick={onClick}>
      <div className="p-clip__photo" style={{ backgroundImage: `url(${photo})` }}>
        {locked && <span className="p-lockbadge"><Icon name="lock" size={20} color="var(--colour-icon-white-overlay)" /></span>}
        <span className="p-clip__time">00:15</span>
      </div>
      <div className="p-clip__body"><span className="p-clip__title">{title}</span><span className="p-caption">1.1k views</span></div>
    </button>
  );
}

function ContentLists({ lists, clips }) {
  const nav = useNav();
  return <>
    {lists.map((l) => (
      <section key={l.title}>
        <SectionTitle title={l.title} action="All" onAction={() => nav.go('video-playlist')} />
        <div className="p-hscroll" style={{ gap: 10 }}>
          {l.cards.map((c, i) => <ConceptCard key={i} {...c} onClick={() => nav.go('video-detail')} />)}
        </div>
      </section>
    ))}
    <section>
      <SectionTitle title={clips.title} action="All" onAction={() => nav.go('clips-list')} />
      <div className="p-hscroll" style={{ gap: 10 }}>
        {clips.cards.map((c, i) => <Clip key={i} {...c} onClick={() => nav.go('clips')} />)}
      </div>
    </section>
  </>;
}

// ---- Betis Original (674:26408)
export function WatchOriginal() {
  const team = useCopy('team.main');
  const og = (title, sub, i) => ({ photo: w(i % 2 ? 'og-2.webp' : 'og-1.webp'), title, sub: `Aug 17 2026 • ${sub}`, play: true });
  const lists = [
    { title: `Inside ${shortName(team)}`, cards: [og('Pre-Match Media Day', 'Press Conference', 0), og('Inside the tunnel', 'Podcast', 1), og('Away trip to Bilbao', 'Press Conference', 2)] },
    { title: 'Road To First Team', cards: [og('U19 Trials', 'Press Conference', 0), og('First Day at the Academy', 'Podcast', 1), og('Balancing School and Football', 'Press Conference', 2)] },
    { title: 'First Team', cards: [og('Pre-Match Media Day', 'Press Conference', 0), og('Tactical Talk', 'Podcast', 1), og('Pre-Match Media Day', 'Press Conference', 2)] },
  ];
  const clips = { title: 'Highlights', cards: [
    { photo: home('clip-1'), title: 'Today we are creating a' },
    { photo: home('clip-2'), title: tx(`${team} STUN Real Madrid with last-second equalizer`) },
    { photo: home('clip-2'), title: 'Today we are creating a', locked: true },
    { photo: home('clip-1'), title: 'Today we are creating a', locked: true },
  ] };
  return <WatchScreen top="og"><ContentLists lists={lists} clips={clips} /></WatchScreen>;
}

// ---- BETIS+ (674:27334): everything is behind the subscription lock
export function WatchBetisPlus() {
  const p = (title, sub, i, more = false) => ({ photo: w(i % 2 ? 'og-2.webp' : 'og-1.webp'), title, sub, locked: true, more });
  const lists = [
    { title: 'Full Match', cards: [p(tx('Betis 1 - 0 Sevilla'), '212k reviews', 0), p(tx('Betis 2 - 1 Real Madrid'), '86.5k reviews', 1), p(tx('Villarreal 1 - 3 Betis'), '54.2k reviews', 2)] },
    { title: 'Highlights', cards: [p('Derbi in 5 minutes', '148k reviews', 0, true), p(tx('Betis vs Real Madrid'), '62.8k reviews', 1, true), p(tx('Villarreal vs Betis'), '38.4k reviews', 2, true)] },
    { title: 'Brief Highlights', cards: [p('Derbi in 90 seconds', '96.1k reviews', 0), p(tx('Betis at the Bernabéu in 90s'), '44.0k reviews', 1), p(tx('Betis at La Cerámica in 90s'), '27.6k reviews', 2)] },
  ];
  const clips = { title: 'Goals', cards: [
    { photo: home('clip-1'), title: tx('Isco 62′ vs Sevilla'), locked: true },
    { photo: home('clip-2'), title: tx('Antony 12′ vs Real Madrid'), locked: true },
    { photo: home('clip-2'), title: 'Lo Celso 48′ vs Villarreal', locked: true },
    { photo: home('clip-1'), title: 'Bakambu 77′ vs Athletic', locked: true },
  ] };
  return <WatchScreen top="plus"><ContentLists lists={lists} clips={clips} /></WatchScreen>;
}

// Watch / Stats — 638:19075. Every mini-player Stats icon (Channels, Playback, Guide, Fixture) opens it.
export function WatchStats() {
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back ctas={['bell', 'search']} />
      <main className="p-main">
        <div className="p-wstats">
          <MiniPlayer onStats={() => {}} />
          <PGR_WatchStatsBody />
        </div>
      </main>
      <AppBar active="watch" />
    </div>
  );
}
