// Community — shares the Community app-bar tab with Live Rooms (Live Rooms | Communities pills at the top).
// Teams 909:29756 · Posts 914:30563 · Create Post 638:19889 → 638:19876 → Publishing 638:19882 → Published 638:19895
// Fan Clubs 920:34930 · Fan Club Watch 967:33496 / Posts 967:34867 / Missions › Tip Goals 976:37729
// Tabs swap in place (nav.swap) so Back doesn't replay them, same as Live Rooms.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Header, AppBar, SectionTitle, Icon, useCopy, useSlot, useFill, asset, shortName, clubFC, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { themeList } from '../tokens/themeText.js';
import { LiveRoomCard } from './home.jsx';

const img = (f) => asset(`assets/community/${f}`);

// Renders into the current screen layer so masks cover the whole phone (same helper as voting.jsx).
function Portal({ children }) {
  const [host, setHost] = useState(null);
  return <span hidden ref={(n) => { if (n && !host) setHost(n.closest('.p-layer') || n.closest('.p-device')); }}>{host && createPortal(children, host)}</span>;
}

// Navigation/Sub (Live Rooms | Communities) + Navigation/Tab-Underline (Teams | Posts | Fan Clubs)
function CommunityTop({ tab }) {
  const nav = useNav();
  const tabs = [['teams', 'Teams', 'community'], ['posts', 'Posts', 'community-posts'], ['fanclubs', 'Fan Clubs', 'community-fanclubs']];
  const live = () => (nav.enabled('live-rooms') ? nav.swap('live-rooms') : nav.notify('Not available in this demo'));
  return (
    <div className="p-lr__top">
      <div className="p-subnav">
        <button className="p-subnav__item p-lr__pill" onClick={live}>Live Rooms</button>
        <button className="p-subnav__item p-lr__pill is-selected">Communities</button>
      </div>
      <div className="p-tabs p-tabs--start p-lr__tabs" role="tablist">
        {tabs.map(([id, label, screen]) => (
          <button key={id} role="tab" aria-selected={id === tab} className={'p-tabs__item' + (id === tab ? ' is-active' : '')} onClick={() => id !== tab && nav.swap(screen)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function CommunityScreen({ tab, children, extra }) {
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header />
      <main className="p-main"><div className="p-lr"><CommunityTop tab={tab} />{children}</div></main>
      <AppBar active="community" />
      {extra}
    </div>
  );
}

/* ---------------------------------------------------------------- Teams */

// Vote per list: { [list title]: voted card id } (module level so it survives tab swaps). The voted card changes to
// Card/Horizontal Voting › Voted_Progress Bar (1548:74711); the rest of that list is locked.
const teamVotes = {};

// Card/Horizontal Voting — Default and Voted_Progress Bar. `members` cards (Team, Academy) have no rank or button.
// One vote per list (design review, 4 Nov): once a card is voted, the list's other Vote buttons go to the disabled state.
function VoteCard({ rank, photo, name, members, voted, locked, onVote }) {
  const nav = useNav();
  return (
    <div className="p-vtcard p-cmvote" onClick={nav.dead}>
      {rank && <b className="p-vtcard__rank">{rank}</b>}
      <img className="p-vtcard__photo" src={photo} alt="" />
      <span className="p-vtcard__text">
        <span className="p-vtcard__name">{name}</span>
        {members ? <span className="p-cmvote__members">{members}</span>
          : voted ? (
            <span className="p-cmvote__tier">
              <span className="p-cmvote__legend">1,240/<b>100K</b> Stars</span>
              <span className="p-cmvote__bar"><i style={{ width: '9.4%' }} /></span>
            </span>
          ) : <span className="p-vtcard__link">View Profile</span>}
      </span>
      {voted && <span className="p-cmvote__count"><b>1240</b><i>votes</i></span>}
      {!members && <button className="p-btn p-btn--primary" disabled={voted || locked} onClick={(e) => { e.stopPropagation(); onVote(); }}><span>Vote</span></button>}
    </div>
  );
}

function VoteList({ title, all, chevron = true, items }) {
  const nav = useNav();
  const [votedId, setVotedId] = useState(teamVotes[title] || null);
  const vote = (id) => { if (teamVotes[title]) return; teamVotes[title] = id; setVotedId(id); };
  return (
    <section>
      <div className="p-sectiontitle">
        <h2 className="p-subtitle">{title}</h2>
        <button className="p-sectiontitle__action" onClick={nav.dead}>
          <span>{all}</span>{chevron && <Icon name="chevron-right" size={14} color="var(--colour-text-secondary)" />}
        </button>
      </div>
      <div className="p-cmlist">{items.map((it) => <VoteCard key={it.id} {...it} voted={votedId === it.id} locked={!!votedId && votedId !== it.id} onVote={() => vote(it.id)} />)}</div>
    </section>
  );
}

// Community / Teams — 909:29756
export function CommunityTeams() {
  const club = useSlot('club-avatar');
  const team = useCopy('team.main');
  const full = useCopy('team.full');
  const second = useCopy('team.second');
  const stars = useCopy('community.stars').split(',').map((x) => x.trim());
  const starImg = [useSlot('star-1'), useSlot('star-2'), useSlot('star-3')];
  const lists = [
    { title: 'Monthly Star', all: 'All', items: [0, 1, 2].map((i) => ({ id: 'star' + i, rank: i + 1, name: stars[i] || '', photo: starImg[i] })) },
    { title: 'Best Team Monthly', all: 'All', items: [full, tx(`${team} Féminas`), second].map((n, i) => ({ id: 'team' + i, rank: i + 1, name: n, photo: club })) },
    { title: 'Team', all: '4 Teams', chevron: false, items: [[full, '9.2k'], [second, '14.2k'], [`${team} C`, '1k'], [tx(`${team} Féminas`), '1k']].map(([n, m], i) => ({ id: 'squad' + i, name: n, members: m + ' Members', photo: club })) },
    // "Ciudad Deportiva Luis del Sol" is Betis's training ground: themes rename it through tx() (theme-text rules).
    { title: 'Academy', all: '3 Academies', chevron: false, items: [[tx('Ciudad Deportiva Luis del Sol'), '897'], [`${team} Miami`, '1.2k'], [tx(`${team} Chicureo`), '1.7k']].map(([n, m], i) => ({ id: 'acad' + i, name: n, members: m + ' Members', photo: club })) },
  ];
  return (
    <CommunityScreen tab="teams">
      <div className="p-cm__lists">{lists.map((l) => <VoteList key={l.title} {...l} />)}</div>
    </CommunityScreen>
  );
}

/* ---------------------------------------------------------------- Posts */

// Card/Post. media: { kind: 'video'|'one'|'two'|'grid', src } ; poll: true shows the final-results poll.
export function PostCard({ name, avatar, verified, date = 'Mar 1, 2026', text: raw, more, media, poll }) {
  const nav = useNav();
  const text = useFill()(raw);
  return (
    <article className="p-post p-post--feed">
      <div className="p-post__profile">
        <img className="p-post__avatar" src={avatar} alt="" style={verified ? undefined : { objectFit: 'cover' }} />
        <div className="p-post__who">
          <div className="p-post__namerow">
            <span className="p-post__name">{name}{verified && <span className="p-verified"><Icon name="verified" size={10} color="var(--colour-icon-inverse)" /></span>}</span>
            <button aria-label="More" onClick={nav.dead}><Icon name="more" size={24} color="var(--colour-icon-primary)" /></button>
          </div>
          <span className="p-post__date">{date}</span>
        </div>
      </div>
      {text && <p className={'p-post__text' + (poll ? ' is-poll' : '')}>{text}{more && <> <b onClick={nav.dead}>more</b></>}</p>}
      {poll && (
        <div className="p-poll">
          <div className="p-poll__row is-win"><i style={{ width: `${(158 / 313) * 100}%` }} /><span>Agree</span><b>58%</b></div>
          <div className="p-poll__row"><i style={{ width: `${(94.5 / 313) * 100}%` }} /><span>Disagree</span><b>42%</b></div>
          <span className="p-poll__meta">303 votes - Final results</span>
        </div>
      )}
      {media?.kind === 'video' && (
        <button className="p-post__video" onClick={nav.dead} aria-label="Play video">
          <img src={media.src} alt="" style={media.crop} />
          <span className="p-post__play"><Icon name="play-solid" size={20} color="var(--colour-text-white-overlay)" /></span>
        </button>
      )}
      {media?.kind === 'one' && <img className="p-post__one" src={media.src[0]} alt="" />}
      {media?.kind === 'two' && <div className="p-post__two">{media.src.map((s, i) => <img key={i} src={s} alt="" />)}</div>}
      {media?.kind === 'grid' && <div className="p-post__grid">{media.src.map((s, i) => <img key={i} src={s} alt="" />)}</div>}
      <div className="p-post__bar">
        <span className="p-post__actions">
          <span><Icon name="like" size={20} />56</span>
          <button className="p-post__cm" aria-label="Comments" onClick={nav.openComments}><Icon name="comment" size={20} />8</button>
        </span>
        <span><Icon name="share" size={20} />12</span>
      </div>
    </article>
  );
}

export const BAROLO = "Matchday. There's nothing quite like walking into the {stadium} on a day like today — the noise building hours before kickoff, the whole city turning green and white. 90 minutes, one badge, and a fanbase that never stops believing. Let's go, {fans}. 💚🤍 {tags}";
export const VIDEO_CROP = { position: 'absolute', left: 0, top: '-17.21%', width: '100%', height: '165.21%', maxWidth: 'none' };

// Set by Create Post when it finishes; the Posts tab shows the "Published successfully!" toast once.
const publish = { toast: false };

// Community / Post — 914:30563 (Published state 638:19895)
export function CommunityPosts() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const [toast, setToast] = useState(publish.toast);
  useEffect(() => { publish.toast = false; }, []);
  const club = { name: clubFC(team), avatar: crest, verified: true };
  const swim = 'Execute a perfect somersault from the dive board into the pool. Then, to the best....';
  const p = (n) => img(`post-${n}.webp`);
  const posts = [
    { ...club, text: 'Tag a Bético who never misses a matchday. 💚🤍👇' },
    { ...club, date: 'Mar 5, 2026', poll: true, text: 'Agree or Disagree: "The club should always prioritize academy graduates over expensive signings."' },
    { name: 'BAROLO JOGOS', avatar: img('av-barolo.webp'), text: BAROLO, media: { kind: 'video', src: img('post-video.webp'), crop: VIDEO_CROP } },
    { ...club, text: swim, more: true },
    { ...club, text: swim, more: true, media: { kind: 'two', src: [p(4), p(7)] } },
    { ...club, text: swim, more: true, media: { kind: 'one', src: [p(4)] } },
    { ...club, text: swim, more: true, media: { kind: 'grid', src: [1, 2, 3, 4, 6, 7, 8, 9, 5].map(p) } },
  ];
  const fab = <button className="p-cm__fab" aria-label="Create post" onClick={() => nav.go('create-post')}><span><Icon name="cm-plus" size={22} color="var(--colour-icon-on-primary)" /></span></button>;
  const mask = toast && (
    <Portal>
      <div className="p-modal p-cm__published" role="status" onClick={() => setToast(false)}>
        <span className="p-cm__mask" />
        <div className="p-cv__toast p-cm__toast"><Icon name="toast-check" size={24} color="var(--colour-feedback-success)" /><span>Published successfully!</span></div>
      </div>
    </Portal>
  );
  return (
    <CommunityScreen tab="posts" extra={<>{fab}{mask}</>}>
      <div className="p-cm__feed">{posts.map((x, i) => <PostCard key={i} {...x} />)}</div>
    </CommunityScreen>
  );
}

/* ---------------------------------------------------------------- Create Post */

const DRAFT_T = "Matchday. There's nothing quite like walking into the {stadium} on a day like today — the noise building hours before kickoff, the whole city turning green and white. 90 minutes, one badge, and a fanbase that never stops believing. Let's go, {fans}. 💚🤍 {tags}\nGo team!";
const UPLOADS = ['cp-up1.webp', 'cp-up2.webp', 'cp-up3.webp', 'cp-up1.webp'];

// Create Post — empty 638:19889 → filled 638:19876 → Publishing 638:19882 (2 s) → Posts + toast 638:19895.
// Figma jumps from empty to filled on tap; the prototype types the draft in (~1 s) and then adds the 4 uploads.
export function CreatePost() {
  const nav = useNav();
  const DRAFT = useFill()(DRAFT_T);
  const avatar = useSlot('user-avatar');
  const [text, setText] = useState('');
  const [ups, setUps] = useState([]);
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const fill = () => {
    if (text) return;
    const step = Math.ceil(DRAFT.length / 40);
    for (let i = 1; i <= 40; i++) later(() => setText(DRAFT.slice(0, i * step)), i * 25);
    later(() => setUps(UPLOADS), 1100);
  };
  const ready = text === DRAFT || text.length >= DRAFT.length;
  const post = () => {
    if (!ready || busy) return;
    setBusy(true);
    later(() => { publish.toast = true; nav.back(); }, 2000);
  };
  return (
    <div className="p-screen p-cp" style={{ background: 'var(--colour-surface-default)' }}>
      <header className="p-header">
        <div className="p-statusbar"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} /></div>
        <div className="p-titlebar">
          <div className="p-titlebar__lead">
            <button className="p-backbtn" onClick={nav.back} aria-label="Back"><Icon name="back" size={24} /></button>
            <h1 className="p-title2">Create Post</h1>
          </div>
          <button className="p-btn p-btn--primary" onClick={post} aria-disabled={!ready}><span>Post</span></button>
        </div>
      </header>
      <main className="p-cp__body" onClick={fill}>
        <div className="p-cp__post">
          <img className="p-cp__avatar" src={avatar} alt="" />
          <p className={'p-cp__text' + (text ? '' : ' is-empty')}>{text || 'What’s on your mind?'}</p>
        </div>
        {ups.length > 0 && (
          <div className="p-cp__ups">
            {ups.map((u, i) => (
              <span key={i} className="p-cp__up">
                <img src={img(u)} alt="" />
                <button aria-label="Remove" onClick={(e) => { e.stopPropagation(); setUps(ups.filter((_, j) => j !== i)); }}><Icon name="lr-x16" size={12} color="var(--colour-icon-white-overlay)" /></button>
              </span>
            ))}
          </div>
        )}
      </main>
      <div className="p-cp__info">
        <span><button aria-label="Add photo" onClick={nav.dead}><Icon name="cm-gallery" size={24} /></button><button aria-label="Add video" onClick={nav.dead}><Icon name="cm-video" size={24} /></button></span>
        <i>{text.length}/1500</i>
      </div>
      <img className="p-cp__kb" src={img('keyboard.webp')} alt="" />
      {busy && (
        <div className="p-cp__publishing" role="status">
          <span className="p-cp__loader"><b /><b /></span>
          <span>Publishing…</span>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Fan Clubs */

// [suffix after the fan-club prefix ("Peña Bética" by default), city, members, joined]
const CLUBS = [
  ['de Madrid', 'Madrid', '1,320', true],
  ['Heliópolis', 'Sevilla', '2,140'],
  ['Triana', 'Sevilla', '1,860'],
  ['de Barcelona', 'Barcelona', '980'],
  ['de Madrid', 'Madrid', '1,320'],
  ['de Cádiz', 'Cádiz', '870'],
  ['de Málaga', 'Málaga', '640'],
  ['New York', 'New York', '444'],
];
const joinedList = CLUBS.map((c) => !!c[3]);

// Community / Fan Clubs — 920:34930. The first card opens the Fan Club page (the only one linked in Figma).
export function CommunityFanClubs() {
  const nav = useNav();
  const club = useSlot('club-avatar');
  const prefix = useCopy('fanclub.prefix');
  const [joined, setJoined] = useState([...joinedList]);
  const toggle = (e, i) => { e.stopPropagation(); joinedList[i] = !joinedList[i]; setJoined([...joinedList]); };
  return (
    <CommunityScreen tab="fanclubs">
      <div className="p-fclist">
        {(themeList(nav.config.theme.mode, 'fanclubs') || CLUBS).map(([name, city, n], i) => (
          <div key={i} className="p-fccard" onClick={() => { if (i) return nav.dead(); fanclub.tab = 'watch'; nav.go('fanclub'); }}>
            <img src={club} alt="" />
            <span className="p-fccard__text"><b>{prefix} {name}</b><span>{city} · {n} members</span></span>
            <button className={'p-btn ' + (joined[i] ? 'p-btn--tertiary' : 'p-btn--primary')} aria-pressed={joined[i]} onClick={(e) => toggle(e, i)}><span>{joined[i] ? 'Joined' : 'Join'}</span></button>
          </div>
        ))}
      </div>
    </CommunityScreen>
  );
}

/* ---------------------------------------------------------------- Fan Club page */

// Join Group → Joined (1548:71985); Joined → back to Join Group (1548:71984). Shared across the three tabs.
const fanclub = { joined: false, tab: 'watch' };

function GroupHeader() {
  const nav = useNav();
  const club = useSlot('club-avatar');
  const stadium = useSlot('stadium');
  const full = useCopy('team.full');
  const short = shortName(useCopy('team.main'));
  const [joined, setJoined] = useState(fanclub.joined);
  const set = (v) => { fanclub.joined = v; setJoined(v); };
  return (
    <div className="p-group">
      <img className="p-group__banner" src={stadium} alt="" />
      <div className="p-group__id">
        <span className="p-group__crest"><img src={club} alt="" /></span>
        <b>{full}</b>
        <span>9.4K Members</span>
      </div>
      <div className="p-group__body">
        <p>The home of passionate {short} fans. Join match talk, challenges and fan activities.</p>
        {joined ? (
          <div className="p-group__ctas">
            <button className="p-btn p-btn--tertiary" onClick={() => set(false)}><Icon name="cm-check" size={18} color="var(--colour-text-on-tertiary)" /><span>Joined</span></button>
            <button className="p-btn p-btn--secondary" onClick={nav.dead}><Icon name="cm-invite" size={18} color="var(--colour-text-on-secondary)" /><span>Invite</span></button>
            <button className="p-btn p-btn--secondary" onClick={nav.dead}><img src={asset('assets/myspace/coin.svg')} alt="" width="18" height="18" /><span>Support</span></button>
          </div>
        ) : (
          <button className="p-btn p-btn--primary p-btn--block" onClick={() => set(true)}><Icon name="add" size={18} color="var(--colour-icon-on-primary)" /><span>Join Group</span></button>
        )}
      </div>
    </div>
  );
}

function FanWatch() {
  const nav = useNav();
  const open = () => nav.go('live-room'); // Figma: both cards open the Peña New York live room (638:19792)
  return (
    <>
      <section>
        <SectionTitle title="Live Now" />
        <div className="p-pad16">
          <LiveRoomCard plain photo={img('fc-live.webp')} crop={{ left: 0, top: '-89.29%', width: '100%', height: '245.39%' }} room="Watch Party" viewers="8.7k" host="Joaquín" hostImg={img('fc-team-av.webp')} tag="Fan Club" title="Pre-match talk" onClick={open} />
        </div>
      </section>
      <section>
        <SectionTitle title="Upcoming" />
        <div className="p-pad16">
          <LiveRoomCard plain upcoming="10/25 20:00" photo={img('fc-up.webp')} room="Watch Hall" host="Renan Fontes" hostImg={img('fc-team-av.webp')} tag="Fan Club" title="Sunday Derby" onClick={open} />
        </div>
      </section>
    </>
  );
}

function FanPosts() {
  const who = { name: 'BAROLO JOGOS', avatar: img('av-barolo.webp') };
  const posts = [
    { ...who, text: BAROLO, media: { kind: 'video', src: img('post-video.webp'), crop: VIDEO_CROP } },
    { ...who, text: 'Aitor Ruibal never stops running. Tracking back, chasing every loose ball, then going again down the wing — exactly the commitment you want in this shirt. Not every contribution makes the highlights, but the fans notice. Keep going, Aitor. 💚🤍 {tags}', media: { kind: 'video', src: img('fc-v-aitor.webp') } },
    { name: 'BAROLO JOGOS', avatar: img('av-barolo2.webp'), text: 'Watching Isco on the ball is worth the trip alone. That first touch, the little turn away from pressure, the pass nobody else sees. Football just feels different with him in green and white. Who else could watch him all day? 💚🤍 #{team} #Isco', media: { kind: 'video', src: img('fc-v-isco.webp') } },
  ];
  return (
    <section>
      <SectionTitle title="Posts" />
      <div className="p-cm__feed is-tight">{posts.map((p, i) => <PostCard key={i} {...p} />)}</div>
    </section>
  );
}

const GOALS = [
  { status: 'Requested', icon: 'cm-calendar', ends: 'End in 7 days', title: 'Full studio tour with the new lighting rig', desc: 'Every corner, every cable, questions answered live.', have: '1,200', need: '2,000', pct: 174 / 310 },
  { status: 'In Progress', icon: 'cm-tipping', brand: true, ends: 'End in 3 days', title: 'Locker room tour', desc: "Take a detailed tour of the {team} base locker room, exploring the vibrant atmosphere where players prepare for their matches, showcasing the team's facilities, locker setups, and the unique elements that make this space special.", have: '1,200', need: '2,000', pct: 174 / 310 },
  { status: 'Goal Reached', icon: 'cm-check', brand: true, done: true, title: 'Full training session', desc: "An exclusive tour of a full training session at {team} FC's home base. Inside look at the team's preparation and training routines. Experience the energy and dedication that fuels the players. This unique opportunity offers a behind-the-scenes glimpse into the heart of {team}.", have: '8,020', need: '8,000', pct: 1 },
];

function FanMissions() {
  const nav = useNav();
  const fill = useFill();
  const pills = ['Requests', 'Tip Goals', 'Weekly Bids', 'View'];
  return (
    <>
      <div className="p-cm__pills">
        {pills.map((p) => <button key={p} className={'p-pill' + (p === 'Tip Goals' ? ' is-selected' : '')} onClick={p === 'Tip Goals' ? undefined : nav.dead}>{p}</button>)}
      </div>
      <section>
        <div className="p-sectiontitle"><h2 className="p-subtitle">Goals</h2><span className="p-sectiontitle__action">3</span></div>
        <div className="p-goals">
          {GOALS.map((g) => (
            <div key={g.title} className="p-goal">
              <div className="p-goal__main">
                <div className="p-goal__tags">
                  <span className={'p-goal__status' + (g.brand ? ' is-brand' : '')}><Icon name={g.icon} size={18} color="var(--colour-text-primary)" />{g.status}</span>
                  {g.ends && <span className="p-goal__clock"><Icon name="cm-time" size={13} color="var(--colour-live-yellow)" />{g.ends}</span>}
                </div>
                <div className="p-goal__copy">
                  <b>{g.title}</b>
                  <p>{fill(g.desc)}</p>
                  <span className="p-goal__legend">{g.have}/ <b>{g.need}</b> Tokens</span>
                  <span className="p-cmvote__bar is-goal"><i style={{ width: `${g.pct * 100}%` }} /></span>
                </div>
                {!g.done && <button className="p-btn p-btn--primary p-btn--block" onClick={nav.dead}><span>Chip In</span></button>}
              </div>
              <div className="p-post__bar p-goal__bar">
                <span className="p-post__actions">
                  <span><Icon name="like" size={20} />56</span>
                  <button className="p-post__cm" aria-label="Comments" onClick={nav.openComments}><Icon name="comment" size={20} />8</button>
                </span>
                <span><Icon name="share" size={20} />12</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// Community / Fan Clubs / Watch 967:33496 · Posts 967:34867 · Missions › Tip Goals 976:37729
export function FanClub() {
  const [tab, setTab] = useState(fanclub.tab);
  const pick = (t) => { fanclub.tab = t; setTab(t); };
  const tabs = [['watch', 'Watch'], ['posts', 'Posts'], ['missions', 'Missions']];
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back />
      <main className="p-main">
        <div className="p-fc">
          <div className="p-pad16"><GroupHeader /></div>
          <div className="p-subnav" role="tablist">
            {tabs.map(([id, label]) => <button key={id} role="tab" aria-selected={id === tab} className={'p-subnav__item p-lr__pill' + (id === tab ? ' is-selected' : '')} onClick={() => pick(id)}>{label}</button>)}
          </div>
          {tab === 'watch' && <FanWatch />}
          {tab === 'posts' && <FanPosts />}
          {tab === 'missions' && <FanMissions />}
        </div>
      </main>
      <AppBar active="community" />
    </div>
  );
}
