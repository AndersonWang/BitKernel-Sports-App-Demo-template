// Homepage sections — Figma 643:19158 › Main Content Container (643:19159).
// Content is demo data from the Figma file; club-specific text runs through copy fields ({team}).
import { useRef, useState } from 'react';
import { SectionTitle, Button, Icon, asset, tx, useSlot, useCopy, matchNav, shortName, clubFC, StillOrMatch } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { useVote, useLead, CANDIDATES, voting, fmtVotes } from './voting.jsx';

const img = (f) => asset(`assets/home/${f}.webp`);

function Row({ children, gap = 10 }) {
  return <div className="p-hscroll" style={{ gap }}>{children}</div>;
}

// Small Banner Playlist — 660:116292
export function BannerPlaylist() {
  const nav = useNav();
  const team = useCopy('team.main');
  const b1 = useSlot('home-banner-1');
  const b2 = useSlot('home-banner-2');
  const b3 = useSlot('home-banner-3');
  const items = [
    { bg: b1, tag: 'TODAY', tagKind: 'glass', title: 'Who Wins Tonight?', cta: 'Juanito’s Pick', go: 'pre-game-stats', predict: true },
    { bg: b2, tag: 'LIVE', tagKind: 'live', title: 'Post-match Interview', cta: 'Watch Live', go: null },
    { bg: b3, tag: 'FAN DERBY', tagKind: 'brand', title: tx(`${shortName(team)} vs Atlético de Madrid`), cta: 'See Bracket', go: null },
  ];
  const [active, setActive] = useState(0);
  const ref = useRef();
  // Swipeable; only the first banner (Who Wins Tonight?) is linked in the demo — the others show "Not part of this demo".
  const onScroll = () => { const el = ref.current; if (el) setActive(Math.round(el.scrollLeft / (336 + 10))); };
  return (
    <section className="p-banners">
      <div className="p-hscroll" ref={ref} onScroll={onScroll} style={{ gap: 10 }}>
        {items.map((it) => (
          <article key={it.title} className="p-banner" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${it.bg})` }}>
            <div className="p-banner__top">
              <span className={`p-tag p-tag--${it.tagKind}`}>{it.tag}</span>
              <h3 className="p-title2 p-banner__title">{it.title}</h3>
            </div>
            <Button variant="primary" iconAfter="arrow-right" onClick={() => { if (it.predict && !nav.enabled('predictions')) return nav.notify('Coming soon'); if (it.predict) matchNav.open('opponent-1', 'predictions'); it.go ? nav.go(it.go) : nav.dead(); }}>{it.cta}</Button>
          </article>
        ))}
      </div>
      {/* Pot gp — page dots. Figma shows 5 dots for 3 banners; kept at 5 to match the design. */}
      <div className="p-dots" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i === active ? 'is-active' : ''} />)}</div>
    </section>
  );
}

// Monthly Popular Creators — 652:38379 (Card/Circular)
export function Creators() {
  const nav = useNav();
  const people = [['Joaquín Mendez', 'Today', '20:00'], ['Lucia Fernandez', 'Sun', '18:30'], ['Miguel Torres', 'Mon', '21:00'], ['Sofia Alvarez', 'Tue', '19:00'], ['Escardi Alvarez', 'Wed', '19:00'], ['Nakar', 'Thu', '19:00']];
  return (
    <section>
      <SectionTitle title="Monthly Popular Creators" action="All" onAction={() => nav.go('live-room-list')} />
      <Row>
        {people.map(([name, day, time], i) => (
          <button key={name} className="p-creator" onClick={() => nav.go('live-rooms')}>
            <img src={img(`creator-${i + 1}`)} alt="" />
            <span className="p-creator__name">{name}</span>
            <span className="p-creator__when">{day} <b className={i === 0 ? 'is-today' : ''}>{time}</b></span>
          </button>
        ))}
      </Row>
    </section>
  );
}

// Card/Live — shared by the home Live Rooms row and the full Live Rooms list (894:147765)
// plain: no live-red border (Live Rooms Calendar / Programs); h: card height from the frame.
export function LiveRoomCard({ photo, crop, room = 'Player Room', viewers = '8.7k', host, hostImg, verified, tag, title, onClick, plain, h, upcoming }) {
  return (
    <button className={'p-livecard' + (plain ? ' p-livecard--plain' : '')} style={h ? { height: h } : undefined} onClick={onClick}>
      <div className="p-livecard__photo">
        <StillOrMatch src={photo} style={crop || { inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="p-livecard__tags">
          <span className="p-left-tags">
            {!upcoming && <span className="p-tag p-tag--live"><i className="p-livedot" />LIVE</span>}
            <span className="p-tag p-tag--room">{room}</span>
          </span>
          {/* upcoming rooms (Fan Club › Upcoming) show the start time instead of the viewer count */}
          <span className="p-tag p-tag--glass">{upcoming ? <><Icon name="cm-time" size={12} color="var(--colour-text-white-overlay)" />{upcoming}</> : <><Icon name="viewers" size={12} color="var(--colour-text-white-overlay)" />{viewers}</>}</span>
        </div>
      </div>
      <div className="p-livecard__body">
        <div className="p-livecard__info">
          <span className="p-livecard__host">
            <img src={hostImg} alt="" />{host}
            {verified && <span className="p-verified p-verified--brand"><Icon name="verified" size={10.667} color="var(--colour-icon-white-overlay)" /></span>}
          </span>
          {tag && <span className="p-contenttag">{tag}</span>}
        </div>
        <span className="p-livecard__title">{title}</span>
      </div>
    </button>
  );
}

// Live Rooms — 643:19174
export function LiveRooms() {
  const nav = useNav();
  return (
    <section>
      <SectionTitle title="Live Rooms" action="All" onAction={() => nav.go('live-room-list')} />
      <div className="p-pad16">
        <LiveRoomCard photo={img('liveroom-1')} host="Joaquín" hostImg={img('liveroom-1-host')} title="Insights and Stories from the Field" onClick={() => nav.go('live-room')} />
      </div>
    </section>
  );
}

// Card/Large Concept — used by Latest Videos, Recommended and Matches
export function ConceptCard({ photo, title, sub, more = true, play = false, locked = false, crop, onClick, onMore }) {
  return (
    <button className="p-concept" onClick={onClick}>
      <div className="p-concept__photo">
        <img src={photo} alt="" style={crop} />
        {locked && <span className="p-lockbadge"><Icon name="lock" size={20} color="var(--colour-icon-white-overlay)" /></span>}
        {play && <span className="p-playbtn"><Icon name="play-solid" size={20} color="var(--colour-text-white-overlay)" /></span>}
      </div>
      <div className="p-concept__body">
        <div className="p-concept__row"><span className="p-concept__title">{title}</span>{more && (onMore
          ? <span className="p-concept__more" role="button" tabIndex={0} aria-label="More" onClick={(e) => { e.stopPropagation(); onMore(); }}><Icon name="more" size={24} color="var(--colour-icon-primary)" /></span>
          : <Icon name="more" size={24} color="var(--colour-icon-primary)" />)}</div>
        <span className="p-caption">{sub}</span>
      </div>
    </button>
  );
}

// Latest Videos — 643:19189
export function LatestVideos() {
  const nav = useNav();
  const team = useCopy('team.main');
  const cards = [
    { photo: img('video-1'), title: tx(`${team} vs Real Madrid`), sub: 'Match day highlights', crop: { height: '224.55%', top: '-12.55%', left: '0.1%', width: '100%', position: 'absolute', objectFit: 'fill' } },
    { photo: img('video-2'), title: tx('Inside Betis Training'), sub: tx('Preparing for LaLiga action') },
    { photo: img('video-3'), title: tx('The Verdiblanco Fans'), sub: tx('Green-and-white LaLiga passion') },
  ];
  return (
    <section>
      <SectionTitle title="Latest Videos" action="All" onAction={() => nav.go('video-playlist')} />
      <Row>{cards.map((c) => <ConceptCard key={c.title} {...c} onClick={() => nav.go('video-detail')} />)}</Row>
    </section>
  );
}

// Recommended — 652:38825
export function Recommended() {
  const nav = useNav();
  const cards = [
    { photo: img('rec-1'), title: tx('Betis: LaLiga Build-Up'), sub: 'Inside the squad’s preparations' },
    { photo: img('rec-2'), title: tx('Betis: The Passing Game'), sub: tx('How Betis build from the back') },
    { photo: img('rec-3'), title: tx('The Spirit of Betis'), sub: tx('LaLiga through the fans’ eyes') },
  ];
  return (
    <section>
      <SectionTitle title="Recommended" action="All" onAction={() => nav.go('watch')} />
      <Row>{cards.map((c) => <ConceptCard key={c.title} {...c} onClick={() => nav.go('video-detail')} />)}</Row>
    </section>
  );
}

// Highlights — 643:19179 (Card/Clips)
export function Highlights() {
  const nav = useNav();
  const team = useCopy('team.main');
  const clips = [
    ['clip-1', 'Today we are creating a'],
    ['clip-2', tx(`${team} STUN Real Madrid with last-second equalizer`)],
    ['clip-3', 'Today we are creating a'],
    ['clip-4', 'Today we are creating a'],
  ];
  return (
    <section>
      <SectionTitle title="Highlights" action="All" onAction={() => nav.go('clips-list')} />
      <Row>
        {clips.map(([f, title], i) => (
          <button key={i} className="p-clip" onClick={() => nav.go('clips')}>
            <div className="p-clip__photo" style={{ backgroundImage: `url(${img(f)})` }}><span className="p-clip__time">00:15</span></div>
            <div className="p-clip__body"><span className="p-clip__title">{title}</span><span className="p-caption">1.1k views</span></div>
          </button>
        ))}
      </Row>
    </section>
  );
}

// Photos — 656:40097 (Card/Photo Album)
export function Photos() {
  const nav = useNav();
  const team = useCopy('team.main');
  return (
    <section>
      <SectionTitle title="Photos" action="All" onAction={() => nav.go('photo-albums')} />
      <Row>
        {[1, 2, 3, 4].map((n) => (
          // Every album opens the photo viewer (Photos / Unlike 727:51061), per design review 4 Nov
          <button key={n} className="p-album" onClick={() => nav.go('photos')}>
            <div className="p-album__photo" style={{ backgroundImage: `url(${img(`photo-${n}`)})` }}>
              <span className="p-album__count"><Icon name="photos" size={20} color="var(--colour-text-white-overlay)" />6</span>
            </div>
            <div className="p-album__body">
              <div className="p-album__row"><span className="p-concept__title">{shortName(team)} Moments</span><Icon name="more" size={24} color="var(--colour-icon-primary)" /></div>
              <span className="p-caption">{clubFC(team)}</span>
            </div>
          </button>
        ))}
      </Row>
    </section>
  );
}

// Posts — 643:19178 (Card/Post)
export function Posts() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  return (
    <section>
      <SectionTitle title="Posts" action="All" onAction={() => nav.go('community-posts')} />
      <Row>
        {[1, 2].map((n) => (
          <article key={n} className="p-post" onClick={() => nav.go('community-posts')}>
            <div className="p-post__profile">
              <img className="p-post__avatar" src={crest} alt="" />
              <div className="p-post__who">
                <div className="p-post__namerow">
                  <span className="p-post__name">{team}<span className="p-verified"><Icon name="verified" size={10} color="var(--colour-icon-inverse)" /></span></span>
                  <Icon name="more" size={24} color="var(--colour-icon-primary)" />
                </div>
                <span className="p-post__date">Mar 1, 2026</span>
              </div>
            </div>
            <p className="p-post__text">{tx(`Not just a club. A feeling passed down for generations. 💚🤍 #${team.replace(/\s+/g, '')} #BeticosPorElMundo`)}</p>
            <div className="p-post__bar">
              <span className="p-post__actions">
                <span><Icon name="like" size={20} />56</span>
                <button className="p-post__cm" aria-label="Comments" onClick={(e) => { e.stopPropagation(); nav.openComments(); }}><Icon name="comment" size={20} />8</button>
              </span>
              <span><Icon name="share" size={20} />12</span>
            </div>
          </article>
        ))}
      </Row>
    </section>
  );
}

// Matches — 643:19184 (Card/Large Concept with play button)
export function Matches() {
  const nav = useNav();
  const team = useCopy('team.main');
  const opp1 = useCopy('home.match-1.opponent'); // Boca Juniors (Light): River Plate (theme-text.json)
  const opp2 = useCopy('home.match-2.opponent'); // Junior de Barranquilla (Light): Deportivo Cali
  const cards = [
    { photo: img('match-1'), title: `${team} vs ${opp1}`, sub: 'Aug 20, 2026' },
    { photo: img('match-2'), title: `${team} vs ${opp2}`, sub: 'Jul 02, 2026' },
    { photo: img('match-3'), title: 'Pre-Match Media Day', sub: 'Aug 17 2026 • Press Conference' },
  ];
  return (
    <section>
      <SectionTitle title="Matches" action="All" onAction={() => nav.go('watch')} />
      <Row>{cards.map((c) => <ConceptCard key={c.title} {...c} more={false} play onClick={() => nav.go('video-detail')} />)}</Row>
    </section>
  );
}

// Voting — 1225:64716 (Card/Voting). Card → Candidate Detail; Vote → "Thank you for voting!" pop-up (only Sofía Reyes is votable).
export function Voting() {
  const nav = useNav();
  const title = useCopy('home.voting.title');
  const { voted, cast, popup } = useVote();
  const lead = useLead('../home/vote-1.webp');
  return (
    <section>
      <SectionTitle title={title} action="All" onAction={() => nav.go('voting')} />
      <Row>
        {CANDIDATES.slice(0, 3).map(({ name, badge }, i) => (
          <div key={name} className="p-vote" onClick={() => (i === 0 ? nav.go('candidate') : nav.dead())}>
            <img className="p-vote__photo" src={i === 0 ? lead.photo : img(`vote-${i + 1}`)} alt="" />
            <div className="p-vote__body">
              <div className="p-vote__text">
                <span className="p-vote__name"><b style={{ background: badge }}>{i + 1}</b>{i === 0 ? lead.name : name}</span>
                <span className="p-caption">{fmtVotes(voting.votes[i])} Votes</span>
              </div>
              <Button variant="primary" block disabled={i === 0 && voted} onClick={(e) => cast(e, i)}>Vote</Button>
            </div>
          </div>
        ))}
      </Row>
      {popup}
    </section>
  );
}

// sports/placeholder bottom banner — 643:19190. Club art: colours here are hard-coded in Figma.
export function BottomBanner() {
  const team = useCopy('team.main');
  const slogan = useCopy('home.slogan');
  const crest = useSlot('club-crest');
  const player = useSlot('home-bottom-player');
  return (
    <section className="p-bottombanner">
      <div className="p-bottombanner__bg"><img src={crest} alt="" /></div>
      <div className="p-bottombanner__left" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), url(${img('banner-bottom-texture')})` }}>
        <img className="p-bottombanner__crest" src={crest} alt="" />
        <div className="p-bottombanner__text"><strong>{team.toUpperCase()}</strong><em>{slogan}</em></div>
      </div>
      <img className="p-bottombanner__player" src={player} alt="" />
    </section>
  );
}
