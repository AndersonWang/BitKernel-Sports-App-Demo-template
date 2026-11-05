import { useState } from 'react';
import { Header, AppBar, SectionTitle, SubNav, MatchCardLarge, PendingBlock, Icon, useCopy, useSlot, asset, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { SCREENS, TABS, figmaLink } from '../config/registry.js';
import * as H from './home.jsx';
import { Launch, Login } from './auth.jsx';
import { PreGameStats, PlayerStats, setStatsOpponent, PGR_open, PGR_ResultsScreen, PGR_LeaguesScreen, PGR_PostGameScreen, PGR_LiveScreen, PGL_LeagueScreen, PGL_TeamScreen, PGP_PredictionsScreen, PGP_RankingScreen } from './pregame.jsx';
import * as W from './watch.jsx';
import { MySpace, SocialProfile } from './myspace.jsx';
import { Wallet } from './wallet.jsx';
import { VotingCampaign, Candidate } from './voting.jsx';
import { LiveCalendar, LivePrograms, LiveShows } from './liverooms.jsx';
import { LiveRoom, WatchParty, ChallengeRoom, StartRoom, HostRoom } from './liveroom.jsx';
import { ClipView } from './clipview.jsx';
import { PhotoView, Membership } from './photos.jsx';
import { Notifications, Search, Settings } from './general.jsx';
import { CommunityTeams, CommunityPosts, CreatePost, CommunityFanClubs, FanClub } from './community.jsx';
import { PGF_HomeScreen, PGF_PickScreen } from './fantasy.jsx';
import { AvatarPlay, AvatarCreate, AvatarChat } from './avatar.jsx';
import { VideoDetail, VideoPlayer, VideoPlayerHorizontal } from './video.jsx';

function Screen({ header, appbar, children, bg = 'var(--colour-surface-default)' }) {
  return (
    <div className="p-screen" style={{ background: bg }}>
      {header}
      <main className="p-main">{children}</main>
      {appbar}
    </div>
  );
}

// Homepage — 643:19158. Each section hides with the journey it belongs to.
export function Home() {
  const nav = useNav();
  const on = (j) => nav.enabled(j);
  return (
    <Screen header={<Header />} appbar={<AppBar active="home" />}>
      <div className="p-stack" style={{ paddingTop: 'var(--spacing-default)' }}>
        {on('fixtures') && (
          <section>
            <SectionTitle title="Fixtures" action="Full Schedule" onAction={() => nav.go('fixtures')} />
            <div className="p-hscroll">
              <MatchCardLarge live opponent="opponent-1" onOpen={() => PGR_open(nav, 'live-home')} />
              <MatchCardLarge opponent="opponent-2" onOpen={() => nav.go('fixtures')} />
              <MatchCardLarge opponent="opponent-3" onOpen={() => nav.go('fixtures')} />
              <MatchCardLarge opponent="opponent-4" onOpen={() => nav.go('fixtures')} />
            </div>
          </section>
        )}
        <H.BannerPlaylist />
        {on('live-rooms') && <H.Creators />}
        {on('live-rooms') && <H.LiveRooms />}
        {on('watch') && <H.LatestVideos />}
        {on('watch') && <H.Recommended />}
        {on('watch') && <H.Highlights />}
        <H.Photos />
        {on('community') && <H.Posts />}
        {on('watch') && <H.Matches />}
        {on('voting') && <H.Voting />}
        <H.BottomBanner />
      </div>
    </Screen>
  );
}

// Fixtures — 638:19155 (Upcoming tab)
export function Fixtures() {
  const nav = useNav();
  const openStats = (opp) => { setStatsOpponent(opp); nav.go('pre-game-stats'); };
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
          <div className="p-vlist"><MatchCardLarge opponent="opponent-1" predict onOpen={() => openStats("opponent-1")} /></div>
        </section>
        <section>
          <SectionTitle title="February" count={3} />
          <div className="p-vlist">
            <MatchCardLarge opponent="opponent-4" predict onOpen={() => openStats("opponent-4")} />
            <MatchCardLarge opponent="opponent-2" predict onOpen={() => openStats("opponent-2")} />
            <MatchCardLarge opponent="opponent-2" predict onOpen={() => openStats("opponent-2")} />
          </div>
        </section>
      </div>
    </Screen>
  );
}

// Not-yet-built screens keep the global header and app bar, so a demo can always move on to another page.
export function PendingScreen({ id }) {
  const nav = useNav();
  const s = SCREENS[id];
  const tab = TABS.find((t) => t.screen === id);
  return (
    <Screen header={<Header back={nav.canBack} title={s.name.split(' / ')[0]} />} appbar={<AppBar active={tab ? tab.id : 'none'} />}>
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

// Home/ Full Liveroom List — 894:147765 (opened from Home › Live Rooms › All)
export function LiveRoomList() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const img = (f) => asset(`assets/home/${f}.webp`);
  const crop = (h, top, left = '0%') => ({ height: h, top, left, width: '100%' });
  const rooms = [
    { photo: img('lr-1'), crop: crop('245.39%', '-89.29%'), room: 'Standard', host: 'Joaquín', hostImg: img('lr-host-1'), tag: 'Fan Meetup', title: 'Interview' },
    { photo: img('lr-2'), crop: crop('290.65%', '-10.52%', '0.14%'), room: 'Watch Hall', host: team, hostImg: crest, verified: true, tag: 'Full Match', title: 'Post-Match Breakdown' },
    { photo: img('lr-3'), room: 'Watch Hall', host: tx('Béticos Live Hangout'), hostImg: img('lr-host-1'), tag: 'Training', title: 'From the Field' },
    { photo: img('lr-4'), crop: crop('121.37%', '0.17%'), room: 'Watch Hall', host: tx('Verdiblanco Voices'), hostImg: img('lr-host-1'), tag: 'Behind the Scenes', title: 'Sneak Peek: Training Practice' },
  ];
  return (
    <Screen header={<Header back title="Live Rooms" ctas={['bell', 'search']} />} appbar={<AppBar active="none" />}>
      <div className="p-vlist" style={{ padding: 'var(--spacing-medium) 16px 32px' }}>
        {rooms.map((r) => <H.LiveRoomCard key={r.title} {...r} onClick={() => nav.go('live-room')} />)}
      </div>
    </Screen>
  );
}

// Video Playlist — 901:149257 (Home › Latest Videos › All)
export function VideoPlaylist() {
  const nav = useNav();
  const team = useCopy('team.main');
  const img = (f) => asset(`assets/home/${f}.webp`);
  const SORTS = ['Newest First', 'Oldest First'];
  const [sort, setSort] = useState(0);
  const crop1 = { height: '224.55%', top: '-12.55%', left: '0.1%', width: '100%' };
  const items = [
    ['vp-1', tx(`${team} vs Real Madrid`), crop1], ['vp-2', 'Tactical Talk'], ['vp-base', 'Pre-Match Media Day'], ['vp-3', 'Exploring the Canadian Wilderness'],
    ['vp-base', 'Exploring the Canadian Wilderness'], ['vp-4', 'Exploring the Canadian Wilderness'], ['vp-2', 'Exploring the Canadian Wilderness'], ['vp-5', 'Exploring the Canadian Wilderness'],
    ['vp-base', 'Exploring the Canadian Wilderness'], ['vp-6', 'Exploring the Canadian Wilderness'],
  ];
  const list = sort ? [...items].reverse() : items;
  return (
    <Screen header={<Header back title="Latest Videos" ctas={['bell', 'search']} />} appbar={<AppBar active="none" />}>
      <div className="p-stack" style={{ padding: 'var(--spacing-medium) 0', gap: 'var(--spacing-medium)' }}>
        <div className="p-sortbar">
          <span>Sort by</span>
          <button className="p-btn p-btn--secondary p-sortbtn" onClick={() => setSort((v) => (v + 1) % SORTS.length)}>
            <span>{SORTS[sort]}</span><Icon name="chevron-down" size={18} color="var(--colour-icon-on-secondary)" />
          </button>
        </div>
        <div className="p-grid2">
          {list.map(([f, title, crop], i) => (
            <button key={i} className="p-contentcard" onClick={() => nav.go('video-detail')}>
              <div className="p-contentcard__photo">
                <img src={img(f)} alt="" style={crop || undefined} />
                <span className="p-playbtn"><Icon name="play-solid" size={20} color="var(--colour-text-white-overlay)" /></span>
              </div>
              <span className="p-contentcard__title">{title}</span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// Clips — 894:148801 (Home › Highlights › All)
export function ClipsList() {
  const nav = useNav();
  const team = useCopy('team.main');
  const img = (f) => asset(`assets/home/${f}.webp`);
  const titles = ['Today we are creating a', tx(`${team} STUN Real Madrid with last-second equalizer`), 'Today we are creating a', 'Today we are creating a', 'Today we are creating a', 'Today we are creating a'];
  return (
    <Screen header={<Header back title="Clips" ctas={['bell', 'search']} />} appbar={<AppBar active="none" />}>
      <div className="p-grid2" style={{ padding: 'var(--spacing-medium) 16px calc(var(--spacing-medium) * 2)' }}>
        {titles.map((t, i) => (
          <button key={i} className="p-clip p-clip--fill" onClick={() => nav.go('clips')}>
            <div className="p-clip__photo" style={{ backgroundImage: `url(${img(`cl-${i + 1}`)})` }}><span className="p-clip__time">00:15</span></div>
            <div className="p-clip__body"><span className="p-clip__title">{t}</span><span className="p-caption">1.1k views</span></div>
          </button>
        ))}
      </div>
    </Screen>
  );
}

// Photos — 905:195614 (Home › Photos › All). Card/Photo Album grid; the 2nd album is behind the lock.
export function PhotoAlbums() {
  const nav = useNav();
  const img = (f) => asset(`assets/home/${f}.webp`);
  const albums = ['pa-1', 'pa-2', 'pa-3', 'pa-4', 'pa-2', 'pa-5'];
  return (
    <Screen header={<Header back title="Photo Albums" ctas={['bell', 'search']} />} appbar={<AppBar active="none" />}>
      <div className="p-grid2" style={{ padding: 'var(--spacing-medium) 16px' }}>
        {albums.map((f, i) => (
          <button key={i} className="p-album p-album--fill" onClick={() => (i === 1 ? nav.notify('Subscribe to unlock this album') : nav.go('photos'))}>
            <div className="p-album__photo" style={{ backgroundImage: `url(${img(f)})` }}>
              {i === 1 && <span className="p-lockbadge"><Icon name="lock" size={20} color="var(--colour-icon-white-overlay)" /></span>}
              <span className="p-album__count"><Icon name="photos" size={20} color="var(--colour-text-white-overlay)" />6</span>
            </div>
            <div className="p-album__body">
              <div className="p-album__row"><span className="p-concept__title">Title</span></div>
              <span className="p-caption">Creator Name</span>
            </div>
          </button>
        ))}
      </div>
    </Screen>
  );
}

// Journey launcher entry for Predictions: the first match, opened on the Predictions tab.
function MatchPredictions() { setStatsOpponent('opponent-1', 'predictions'); return <PreGameStats />; }

const BUILT = { 'live-start': StartRoom, 'live-host': HostRoom, photos: PhotoView, 'photos-liked': PhotoView, membership: Membership, 'watch-stats': W.WatchStats, notifications: Notifications, search: Search, settings: Settings, community: CommunityTeams, 'community-posts': CommunityPosts, 'create-post': CreatePost, 'community-fanclubs': CommunityFanClubs, fanclub: FanClub, 'live-rooms': LiveCalendar, 'live-programs': LivePrograms, 'live-shows': LiveShows, 'live-room': LiveRoom, 'watch-party': WatchParty, 'challenge-room': ChallengeRoom, voting: VotingCampaign, candidate: Candidate, fantasy: PGF_HomeScreen, 'fantasy-pick': PGF_PickScreen, clips: ClipView, 'clips-liked': ClipView, myspace: MySpace, 'social-profile': SocialProfile, avatar: AvatarPlay, wallet: Wallet, 'wallet-recharged': Wallet, 'avatar-play': AvatarPlay, 'avatar-create': AvatarCreate, 'avatar-chat': AvatarChat, 'photo-albums': PhotoAlbums, 'live-room-list': LiveRoomList, 'video-playlist': VideoPlaylist, 'clips-list': ClipsList, loading: Launch, login: Login, home: Home, fixtures: Fixtures, 'pre-game-stats': PreGameStats, 'match-predictions': MatchPredictions, 'fixtures-results': PGR_ResultsScreen, leagues: PGR_LeaguesScreen, 'post-game-stats': PGR_PostGameScreen, 'live-stats': PGR_LiveScreen, 'league-page': PGL_LeagueScreen, 'team-page': PGL_TeamScreen, predictions: PGP_PredictionsScreen, 'predictions-ranking': PGP_RankingScreen, 'player-stats': PlayerStats,
  watch: W.WatchFree, 'watch-plus': W.WatchPlus, 'watch-premium': W.WatchPremium, 'watch-playback': W.WatchPlayback, 'watch-guide': W.WatchGuide,
  'watch-upcoming': W.WatchUpcoming, 'watch-results': W.WatchResults, 'watch-leagues': W.WatchLeagues, 'watch-og': W.WatchOriginal, 'watch-betisplus': W.WatchBetisPlus,
  'video-detail': VideoDetail, 'live-player': VideoPlayer, 'video-player-h': VideoPlayerHorizontal };
export function renderScreen(id) {
  const C = BUILT[id];
  return C ? <C /> : <PendingScreen id={id} />;
}
