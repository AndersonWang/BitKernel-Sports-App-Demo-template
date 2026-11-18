// My Space & Profile journey — Figma section 982:32719.
// My Space (996:33722) is entered from the header profile icon on every page; Back pops the stack,
// so it returns to whichever page opened it.
import { useState } from 'react';
import { Header, AppBar, SectionTitle, Button, MatchCardLarge, Icon, LikeButton, useCopy, useSlot, useSlotOverride, asset, tx, shortName } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { getConfig, copyOf } from '../config/store.js';
import { useMyHighlights } from './highlights.jsx';

const img = (f) => asset(`assets/myspace/${f}`);

// Shared demo state for the journey: the wallet recharge updates the balance shown here,
// and the avatar banner opens the empty Play page until an avatar has been created.
// Every theme opens with a preset avatar (skips the empty Play page and Create); its league and club come
// from the selected theme's copy, so it follows a theme switch until the fan edits it in Customize.
// Three ready-made avatars (My Space › Play › Avatar Switchers, 1896:394925); names are Configure › Text fields.
// Each has its own standing video and chat video (Configure › Videos › Avatar 1-3). Avatars the fan creates are
// added after them; they have no videos yet (Figma "New Avatar" 1896:395060).
const PRESETS = [
  { name: 'Andrés Pacheco', gender: 'Male', age: '24', height: '182', position: 'AM', sliders: [55, 60, 70, 65], jersey: '10', stats: [91, 88, 85, 79, 62, 93] },
  { name: 'Lucía Ferrer', gender: 'Female', age: '22', height: '168', position: 'Striker', sliders: [75, 40, 55, 80], jersey: '9', stats: [95, 79, 72, 92, 41, 80] },
  { name: 'Mateo Ruiz', gender: 'Male', age: '27', height: '191', position: 'GK', sliders: [30, 75, 85, 35], jersey: '1', stats: [58, 76, 74, 89, 93, 52] },
];
export const PRESET_COUNT = PRESETS.length;
export const presetAvatar = (i = 0) => { const c = getConfig(); return { ...PRESETS[i], n: i + 1, name: copyOf(c, `avatar.${i + 1}.name`, PRESETS[i].name), league: copyOf(c, 'fixture.league', 'LaLiga'), team: copyOf(c, 'team.main', 'Real Betis') }; };
const edits = {}; // preset index -> the fan's Customize changes
const created = []; // avatars made with Create
export const mySpace = {
  tokens: 1250, points: 341299,
  current: 0, // selected in the switcher; === avatars.length means the "New Avatar" panel
  editing: 0, // what Create / Customize opens: an index, or 'new'
  get avatars() { return [...PRESETS.map((_, i) => edits[i] || presetAvatar(i)), ...created]; },
  get avatar() { return this.avatars[this.current] || null; },
  set avatar(a) {
    if (this.editing === 'new') { created.push({ ...a, n: null, made: true }); this.current = PRESET_COUNT + created.length - 1; return; }
    const i = this.editing;
    if (i < PRESET_COUNT) edits[i] = { ...a, n: i + 1 }; else created[i - PRESET_COUNT] = { ...a, n: null, made: true };
  },
};
export const fmt = (n) => n.toLocaleString('en-US');

// The "light net" (1000:50339) sits on the frame, behind a see-through header, and doesn't scroll.
// The header turns solid once content scrolls under it.
function Screen({ header, appbar, children }) {
  const [clear, setClear] = useState(true);
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <img className="p-ms__net" src={asset('assets/fixtures/net.png')} alt="" aria-hidden />
      <div className={'p-ms__head' + (clear ? ' is-clear' : '')}>{header}</div>
      <main className="p-main" onScroll={(e) => setClear(e.currentTarget.scrollTop < 4)}>{children}</main>
      {appbar}
    </div>
  );
}

// Misc/MySpace Profile › container
function Profile() {
  const nav = useNav();
  const name = useCopy('user.name');
  const photo = useSlot('user-avatar');
  return (
    <div className="p-ms__profile">
      <div className="p-ms__id">
        <span className="p-ms__photo">
          <img src={photo} alt="" />
          <button className="p-ms__camera" aria-label="Change photo" onClick={nav.dead}><Icon name="ms-camera" size={18} color="var(--colour-icon-white-overlay)" /></button>
        </span>
        <span className="p-ms__name">{name}</span>
      </div>
      <div className="p-ms__ctas">
        <Button variant="primary" icon="ms-social" onClick={() => nav.go('social-profile')}>Social Profile</Button>
        <Button variant="secondary" icon="settings" onClick={() => nav.go('settings')}>Settings</Button>
      </div>
    </div>
  );
}

// utility/avatar banner — 1081:53767 (My Space) and 1895:394835 (Homepage, under Live Rooms)
export function AvatarBanner() {
  const nav = useNav();
  const player = useSlot('avatar-player');
  return (
    <button className="p-ms__avatar" onClick={() => nav.go(mySpace.avatar ? 'avatar-play' : 'avatar')}>
      <span className="p-ms__bannertext"><b>Avatar</b><small>Build your ultimate fantasy soccer star</small></span>
      <span className="p-ms__avatarimg" aria-hidden><img src={player} alt="" /></span>
    </button>
  );
}

// Homepage › Avatars (replaces the avatar banner there): a swipeable row of tall cards, one per ready-made avatar, using
// the same card as Home › Highlights. Each card shows that avatar's cut-out cropped chest-up (the banner's crop) and its
// name; tapping a card opens the chat with that avatar. All → My Space › Play (avatar switcher).
export function AvatarRow() {
  const nav = useNav();
  const slots = [useSlot('avatar-player'), useSlot('avatar-2-player'), useSlot('avatar-3-player')];
  const own = [true, !!useSlotOverride('avatar-2-player'), !!useSlotOverride('avatar-3-player')];
  const avatars = mySpace.avatars.slice(0, PRESET_COUNT);
  return (
    <section>
      <SectionTitle title="Avatars" action="All" onAction={() => nav.go('avatar-play')} />
      <div className="p-hscroll" style={{ gap: 10 }}>
        {avatars.map((a, i) => (
          <button key={i} className="p-clip p-hlcard p-avcard" aria-label={`Talk with ${a.name}`} onClick={() => { mySpace.current = i; nav.go('avatar-chat'); }}>
            <div className={'p-clip__photo p-avcard__photo' + (own[i] ? '' : ' is-placeholder')} style={{ backgroundImage: `url(${slots[i]})` }} />
            <div className="p-clip__body"><span className="p-clip__title">{a.name}</span><span className="p-caption">Talk with your player</span></div>
          </button>
        ))}
      </div>
    </section>
  );
}

// Wallet Example — 996:33750
export function WalletCard() {
  const nav = useNav();
  return (
    <section className="p-ms__wallet">
      <div className="p-ms__wallethead"><Icon name="ms-wallet" size={20} /><span>My Wallet</span></div>
      <div className="p-ms__assets">
        <button className="p-ms__asset" onClick={() => nav.go('wallet')}>
          <img className="p-coin p-ms__coin" src={img('coin.svg')} alt="" style={{ '--s': '24px' }} />
          <span className="p-ms__assetinfo"><span className="p-ms__amount"><b>{fmt(mySpace.tokens)}</b><small>Tokens</small></span></span>
          <Icon name="chevron-right" size={16} />
        </button>
        <button className="p-ms__asset" onClick={nav.dead}>
          <span className="p-ms__pointicon"><img src={img('points3d.svg')} alt="" /></span>
          <span className="p-ms__assetinfo">
            <span className="p-ms__amount"><b>{fmt(mySpace.points)}</b><small>Points</small></span>
            <span className="p-ms__refill"><small>Refill in:</small>12d 10hr 30m</span>
          </span>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </section>
  );
}

// utility/membership banner — 996:33751
function Membership() {
  const nav = useNav();
  const crest = useSlot('club-crest');
  const pass = useCopy('membership.name');
  return (
    <button className="p-ms__member" onClick={() => nav.go('membership')}>
      <img className="p-ms__crest" src={crest} alt="" />
      <span className="p-ms__bannertext">
        <b>{pass}</b>
        <small>{tx('Season’s Pass & BETIS+')}</small>
        <small className="is-light">3 days left of Membership Benefits</small>
      </span>
      <span className="p-ms__benefits">Benefits<Icon name="chevron-right" size={15} color="var(--colour-brand-primary)" /></span>
    </button>
  );
}

// Quick Actions — 1334:39763 (Menu/Narrow ×5). Icons (all Type=Fill): Live or VOD, Clips, Photo Library, Post, Video
function QuickActions() {
  const nav = useNav();
  const items = [
    ['ms-liveroom', 'Start Live Room', () => nav.go('live-start')],
    ['ms-clips', 'Add Clips', nav.dead],
    ['ms-photos', 'Add Photos', nav.dead],
    ['ms-posts', 'Add Posts', nav.dead],
    ['ms-custom', 'Add Custom Menu Item', nav.dead],
  ];
  return (
    <section className="p-ms__section">
      <SectionTitle title="Quick Actions" />
      <div className="p-pad16">
        <div className="p-ms__menu">
          {items.map(([icon, label, onClick]) => (
            <button key={label} className="p-ms__menuitem" onClick={onClick}>
              <span><Icon name={icon} size={20} />{label}</span>
              <Icon name="chevron-right" size={16} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ children }) { return <div className="p-hscroll" style={{ gap: 10 }}>{children}</div>; }

// Card/Content (Continue Watching = with history bar + play button, My List = plain)
function ContentCard({ photo, title, progress, locked, tall, onClick }) {
  return (
    <button className={'p-ms__content' + (progress || tall ? ' is-tall' : '')} onClick={onClick}>
      <span className="p-ms__contentphoto">
        <img src={photo} alt="" />
        {progress && <span className="p-ms__play"><Icon name="play-solid" size={16.67} color="var(--colour-text-white-overlay)" /></span>}
        {progress && <img className="p-ms__history" src={img('histbar.svg')} alt="" />}
        {locked && <span className="p-lockbadge p-lockbadge--sm"><Icon name="lock" size={16} color="var(--colour-icon-white-overlay)" /></span>}
      </span>
      <span className={'p-ms__contenttitle' + (progress || tall ? ' is-center' : '')}>{title}</span>
    </button>
  );
}

function Lists() {
  const nav = useNav();
  const team = useCopy('team.main');
  const short = shortName(team);
  const myList = [`Matchday at ${short}`, `Inside ${short}`, `${short} in training`, tx('Béticos in full voice')];
  const mine = useMyHighlights();
  const clips = [[tx('Benito Villamarín Stadium Tour'), '12.4k'], [tx('Goal Celebration vs Sevilla'), '8.7k'], ['Training Session Highlights', '5.2k'], ['Fan Reactions After Match', '14.9k']];
  const articles = [
    [`Inside ${short} Training`, 'A closer look at daily training', `and teamwork at ${team}.`],
    [tx('The Bético Spirit'), tx('Green-and-white pride brings'), tx(`${short} fans together in Seville.`)],
    [`${short} on the Ball`, 'Explore the passing and movement', `behind ${team} football.`],
  ];
  return (
    <>
      <section className="p-ms__section">
        <SectionTitle title="Continue Watching" action="All" onAction={() => nav.go('video-playlist')} />
        <Row>{[1, 2, 3].map((n) => <ContentCard key={n} progress photo={img(`cw-${n}.webp`)} title="Exploring the Canadian Wilderness" onClick={() => nav.go('video-detail')} />)}</Row>
      </section>
      <section className="p-ms__section">
        <SectionTitle title="My List" action="All" onAction={() => nav.go('video-playlist')} />
        <Row>{myList.map((t, i) => <ContentCard key={t} photo={img(`ml-${i + 1}.webp`)} title={t} locked={i === 3} onClick={() => (i === 3 ? nav.notify('Subscribe to unlock this video') : nav.go('video-detail'))} />)}</Row>
      </section>
      {nav.enabled('sports-highlights') && (
        // My Highlights (1859:280137): the fan's created highlights; All opens the full list
        <section className="p-ms__section">
          <SectionTitle title="My Highlights" action="All" onAction={() => nav.go('hl-mine')} />
          <Row>{mine.slice(0, 3).map((h) => <ContentCard key={h.title} tall photo={h.photo} title={h.title} onClick={() => nav.go('hl-viewer')} />)}</Row>
        </section>
      )}
      <section className="p-ms__section">
        <SectionTitle title="Saved Clips" action="All" onAction={() => nav.go('clips-list')} />
        <Row>
          {clips.map(([t, v], i) => (
            <button key={t} className="p-clip" onClick={() => (i === 3 ? nav.notify('Subscribe to unlock this clip') : nav.go('clips'))}>
              <div className="p-clip__photo" style={{ backgroundImage: `url(${img(`sc-${i + 1}.webp`)})` }}>
                {i === 3 && <span className="p-lockbadge p-lockbadge--tr"><Icon name="lock" size={20} color="var(--colour-icon-white-overlay)" /></span>}
                <span className="p-clip__time">00:15</span>
              </div>
              <div className="p-clip__body"><span className="p-clip__title">{t}</span><span className="p-caption">{v} views</span></div>
            </button>
          ))}
        </Row>
      </section>
      <section className="p-ms__section">
        <SectionTitle title="Saved Matches" action="All" onAction={() => nav.go('fixtures')} />
        <div className="p-pad16"><MatchCardLarge opponent="opponent-2" predict competition={`2025-2026 Libertadores · Women's · Group Stage`} onOpen={() => nav.go('fixtures')} /></div>
      </section>
      <section className="p-ms__section">
        <SectionTitle title="Saved Articles" action="All" onAction={nav.dead} />
        <Row>
          {articles.map(([t, a, b], i) => (
            <button key={t} className="p-ms__article" onClick={nav.dead}>
              <span className="p-ms__articlephoto"><img src={img(`art-${i + 1}.webp`)} alt="" /></span>
              <span className="p-ms__articlebody"><b>{t}</b><small>{a}<br />{b}</small></span>
            </button>
          ))}
        </Row>
      </section>
    </>
  );
}

// My Space — 996:33722
export function MySpace() {
  const nav = useNav();
  const logout = () => (nav.enabled('login') ? nav.reset('login') : nav.notify('Logged out (Launch & Login is off in this demo)'));
  return (
    <Screen header={<Header back title="My Space" ctas={['bell', 'search']} />} appbar={<AppBar active="none" />}>
      <div className="p-ms">
        <div className="p-ms__top">
          <Profile />
          <AvatarBanner />
          <WalletCard />
          <Membership />
        </div>
        <QuickActions />
        <Lists />
        <div className="p-ms__logout"><Button variant="primary" block onClick={logout}>Logout</Button></div>
      </div>
    </Screen>
  );
}

// Profile (social) — 1270:43788, opened from My Space › Social Profile
export function SocialProfile() {
  const nav = useNav();
  const name = useCopy('user.name');
  const photo = useSlot('user-avatar');
  const team = useCopy('team.main');
  const short = shortName(team);
  const tabs = ['Posts', 'Live', 'Custom', 'Clips', 'Albums'];
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back ctas={['bell', 'search']} />
      <main className="p-main">
        <div className="p-sp">
          <div className="p-sp__top">
            <img className="p-sp__photo" src={photo} alt="" />
            <div className="p-sp__text">
              <b>{name}</b>
              <span>Lifelong {short} fan.</span>
              <span className="p-sp__followers"><strong>544</strong> Followers</span>
            </div>
          </div>
          <div className="p-tabs p-sp__tabs" role="tablist">
            {tabs.map((t, i) => <button key={t} role="tab" aria-selected={i === 0} className={'p-tabs__item' + (i === 0 ? ' is-active' : '')} onClick={i ? nav.dead : undefined}>{t}</button>)}
          </div>
          <article className="p-post p-sp__post">
            <div className="p-post__profile">
              <img className="p-post__avatar" style={{ objectFit: 'cover' }} src={photo} alt="" />
              <div className="p-post__who">
                <div className="p-post__namerow"><span className="p-post__name">{name}</span><Icon name="more" size={24} /></div>
                <span className="p-post__date">Mar 1, 2026</span>
              </div>
            </div>
            <p className="p-post__text">{tx(`Matchday. There's nothing quite like walking into the Benito Villamarín on a day like today — the noise building hours before kickoff, the whole city turning green and white. 90 minutes, one badge, and a fanbase that never stops believing. Let's go, Béticos. 💚🤍 #${team.replace(/\s+/g, '')} #ManquePierda`)}</p>
            <button className="p-sp__media" onClick={nav.dead} aria-label="Play video">
              <img src={img('post-1.webp')} alt="" />
              <span className="p-sp__play"><Icon name="play-solid" size={20} color="var(--colour-text-white-overlay)" /></span>
            </button>
            <div className="p-post__bar">
              <span className="p-post__actions"><LikeButton count={56} /><button className="p-post__cm" aria-label="Comments" onClick={nav.openComments}><Icon name="comment" size={20} />8</button></span>
              <span><Icon name="share" size={20} />12</span>
            </div>
          </article>
        </div>
      </main>
      <button className="p-sp__fab" aria-label="Add post" onClick={nav.dead}><Icon name="add" size={22} color="var(--colour-icon-on-primary)" /></button>
      <AppBar active="none" />
    </div>
  );
}
