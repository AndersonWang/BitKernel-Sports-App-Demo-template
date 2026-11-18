// Voting journey — Campaign Detail 1190:58703, Candidate Detail 1195:59115 (Voted 1195:59128), "Thank you for voting!" pop-up 1195:59229.
// One vote per demo run, and only Sofía Reyes can be voted for. Every Vote button (Home, Campaign, Candidate) casts the
// vote, shows the pop-up, then turns into the Button component's disabled state ("Vote Counted" on the Candidate page).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppBar, Icon, useCopy, useSlotOverride, asset, shortName, clubFC } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';

const img = (f) => asset(`assets/voting/${f}`);

// Card/Horizontal Voting rank badges: gold/600 and real betis/orange/600 are primitives, not semantic tokens, in the library.
export const CANDIDATES = [
  { name: 'Sofía Reyes', badge: '#bd9b29' },
  { name: 'Ana Wong', badge: 'var(--colour-icon-quartenary)' },
  { name: 'Sarah Parker', badge: '#a86700' },
  { name: 'Laura Michaels' },
  { name: 'Monica Pharrell' },
  { name: 'Kristy Gomez' },
];
export const voting = { voted: false, votes: [12572, 10500, 9560] };
const PARALLAX = 0.4; // photo speed vs the sheet (1 = scrolls with the page)
export const fmtVotes = (n) => n.toLocaleString('en-US');
// Lead candidate (the only votable one): name and photo come from Configure. Until a client uploads a photo,
// each screen keeps Figma's own crop of Sofía (file = that screen's default image).
export function useLead(file) {
  const name = useCopy('voting.candidate');
  const photo = useSlotOverride('candidate-photo') || (file && img(file));
  return { name, photo };
}

// Renders into the current screen layer, so the pop-up covers the whole phone even when opened from inside a scroll area.
function Portal({ children }) {
  const [host, setHost] = useState(null);
  return <span hidden ref={(n) => { if (n && !host) setHost(n.closest('.p-layer') || n.closest('.p-device')); }}>{host && createPortal(children, host)}</span>;
}

// pop-up flex — 1195:59229
function VotePopup({ onClose }) {
  const lead = useLead('sofia.webp');
  return (
    <Portal>
      <div className="p-modal" role="alertdialog" aria-modal="true" aria-labelledby="vt-pop-title" aria-describedby="vt-pop-desc">
        <button className="p-sheet__scrim" aria-label="Close" onClick={onClose} />
        <div className="p-vtpop">
          <div className="p-vtpop__content">
            <div className="p-vtpop__head">
              <span className="p-vtpop__icon"><img src={img('check.svg')} alt="" /></span>
              <div className="p-vtpop__text">
                <h2 id="vt-pop-title">Thank you for voting!</h2>
                <p id="vt-pop-desc">Come back tomorrow for a new chance to vote.</p>
              </div>
            </div>
            <div className="p-vtpop__who">
              <img src={lead.photo} alt="" />
              <span><span>{lead.name}</span><b>+1</b></span>
            </div>
          </div>
          <div className="p-vtpop__bar"><button className="p-btn p-btn--primary p-btn--block" autoFocus onClick={onClose}>OK</button></div>
        </div>
      </div>
    </Portal>
  );
}

// Shared by all three Vote buttons. cast(e, i): i = candidate index; only 0 (Sofía Reyes) is votable in the demo.
export function useVote() {
  const nav = useNav();
  const [voted, setVoted] = useState(voting.voted);
  const [popup, setPopup] = useState(false);
  const cast = (e, i = 0) => {
    e?.stopPropagation();
    if (i !== 0) return nav.dead();
    if (voting.voted) return;
    voting.voted = true;
    voting.votes[0] += 1;
    setVoted(true);
    setPopup(true);
  };
  return { voted, cast, popup: popup && <VotePopup onClose={() => setPopup(false)} /> };
}

// Countdown: starts at Figma's 30 : 12 : 50 : 30 when the demo loads and ticks down every second.
const END = Date.now() + (((30 * 24 + 12) * 60 + 50) * 60 + 30) * 1000;
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = Math.max(0, Math.round((END - now) / 1000));
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

function StatusBar() {
  return <div className="p-statusbar"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} /></div>;
}

// Votiong Campaign Detail Page — 1190:58703
export function VotingCampaign() {
  const nav = useNav();
  const title = useCopy('home.voting.title');
  const team = useCopy('team.main');
  const short = shortName(team);
  const { voted, cast, popup } = useVote();
  const lead = useLead('c1.webp');
  const [d, h, m, s] = useCountdown();
  const cd = [[d, 'Days'], [h, 'Hours'], [m, 'Minutes'], [s, 'Seconds']];
  return (
    <div className="p-screen p-vt" style={{ background: 'var(--colour-surface-default)' }}>
      <main className="p-main">
        <div className="p-vt__hero">
          <img className="p-vt__base" src={img('banner-base.webp')} alt="" />
          <span className="p-vt__crop"><img src={img('banner.webp')} alt="" /></span>
          <span className="p-vt__shade" />
          <div className="p-vt__headline">
            <h1>{title}</h1>
            <div className="p-vt__countdown" role="timer" aria-label={`${d} days ${h} hours ${m} minutes ${s} seconds left`}>
              {cd.map(([v, l], i) => (
                <span key={l} className="p-vt__cdgroup">
                  {i > 0 && <span className="p-vt__cdsep" aria-hidden="true">:</span>}
                  <span className={'p-vt__cd is-' + l.toLowerCase()}><b>{String(v).padStart(2, '0')}</b><i>{l}</i></span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="p-vt__about">
          <p>Help choose the next {title}!</p>
          <p>Vote for the creator you want representing {clubFC(team)} throughout the season. The winning {short} Señorita will take fans behind the scenes with exclusive access, matchday coverage, player interviews, live streams, and special club content available only through the app.</p>
          <p>Every vote helps decide who becomes the face of the {clubFC(team)} community.</p>
        </div>
        <div className="p-vt__hint"><Icon name="pgs-info" size={20} /><p>You can vote once a day.</p></div>
        <section className="p-vt__ranking">
          <h2>Current Ranking</h2>
          <div className="p-vt__list">
            {CANDIDATES.map((c, i) => (
              <div key={c.name} className="p-vtcard" onClick={() => (i === 0 ? nav.go('candidate') : nav.dead())}>
                <b className={'p-vtcard__rank' + (c.badge ? ' is-top' : '')} style={c.badge ? { background: c.badge } : undefined}>{i + 1}</b>
                <img className="p-vtcard__photo" src={i === 0 ? lead.photo : img(`c${i + 1}.webp`)} alt="" />
                <span className="p-vtcard__text">
                  <span className="p-vtcard__name">{i === 0 ? lead.name : c.name}</span>
                  <span className="p-vtcard__link">View Profile</span>
                </span>
                <button className="p-btn p-btn--primary" disabled={i === 0 && voted} onClick={(e) => cast(e, i)}><span>Vote</span></button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <div className="p-vt__header">
        <StatusBar />
        <div className="p-titlebar"><button className="p-backbtn" onClick={nav.back} aria-label="Back"><Icon name="back" size={24} /></button></div>
      </div>
      <AppBar active="none" />
      {popup}
    </div>
  );
}

// Candidate Detail Page — 1195:59115; after voting it shows Candidate Detail Page / Voted (1195:59128)
export function Candidate() {
  const nav = useNav();
  const { voted, cast, popup } = useVote();
  const lead = useLead('sofia.webp');
  // Parallax: the photo moves at 40% of the scroll speed, so the sheet slides up over it. Written straight to the
  // transform on each frame (no re-render). Off when the viewer asks for reduced motion.
  const mainRef = useRef(null);
  const photoRef = useRef(null);
  useEffect(() => {
    const main = mainRef.current, photo = photoRef.current;
    if (!main || !photo || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => { raf = 0; const y = Math.max(0, main.scrollTop); photo.style.transform = `translate3d(0, ${y * PARALLAX}px, 0)`; };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => { main.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const social = [['instagram', 'Instagram'], ['x', 'X'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['facebook', 'Facebook']];
  return (
    <div className="p-screen p-vt" style={{ background: 'var(--colour-surface-default)' }}>
      <main className="p-main" ref={mainRef}>
        <div className="p-cd__photo">
          <img ref={photoRef} src={lead.photo} alt="" />
          <span className="p-cd__dots" aria-hidden="true"><i className="is-active" /><i /><i /><i /><i /></span>
        </div>
        <div className="p-cd__panel">
          <h1>{lead.name}</h1>
          <div className="p-cd__social">
            {social.map(([id, label]) => (
              <button key={id} aria-label={label} onClick={nav.dead}><Icon name={'vt-' + id} size={24} color="var(--colour-icon-on-secondary)" /></button>
            ))}
          </div>
          <div className="p-cd__rank">
            <div><span>Ranking Position</span><b>No. 1</b></div>
            <i aria-hidden="true" />
            <div><span>Votes</span><b>{fmtVotes(voting.votes[0])}</b></div>
          </div>
          <button className="p-btn p-btn--primary p-cd__vote" disabled={voted} onClick={cast}><span>{voted ? 'Vote Counted' : 'Vote'}</span></button>
          <p className="p-cd__bio">She’s a passionate football creator known for her match-day reactions, tactical insights, and fan-focused content. Whether covering big games, player performances, or breaking news, she brings energy, knowledge, and authentic fan perspective to every piece of content.</p>
        </div>
      </main>
      <div className="p-vt__header is-candidate">
        <StatusBar />
        <div className="p-titlebar">
          <button className="p-backbtn" onClick={nav.back} aria-label="Back"><Icon name="back" size={24} /></button>
          <button className="p-cd__share" aria-label="Share" onClick={nav.dead}><Icon name="share" size={16} /></button>
        </div>
      </div>
      <AppBar active="none" />
      {popup}
    </div>
  );
}
