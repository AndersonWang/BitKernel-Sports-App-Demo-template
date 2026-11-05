// Video journey — Figma, left to right:
// Video Detail Page 638:20918 → (Highlights) Modal/Flex 638:21302 shown over the page (638:20932)
// → (Play / Watch Now) Media/ Video Player 638:20990 → controls fade after a moment (638:21068)
// → (Full screen) Media/ Video Player / Horizontal 1309:76812
import { useEffect, useRef, useState } from 'react';
import { AppBar, Icon, useCopy, useSlot, asset, MatchMedia, clubFC, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';

const w = (f) => asset(`assets/watch/${f}`);

function StatusBar() {
  return <div className="p-statusbar p-statusbar--overlay"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color="var(--colour-text-white-overlay)" /></div>;
}

// Toggle Switch (segmented control)
function Segmented({ items, value, onChange }) {
  return (
    <div className="p-seg" role="radiogroup">
      {items.map((it) => (
        <button key={it} role="radio" aria-checked={it === value} className={'p-seg__btn' + (it === value ? ' is-selected' : '')} onClick={() => onChange(it)}>{it}</button>
      ))}
    </div>
  );
}

function Check({ on, label, onToggle, gap = 4 }) {
  return (
    <button className="p-check" style={{ gap }} role="checkbox" aria-checked={on} onClick={onToggle}>
      <Icon name={on ? 'checkbox-on' : 'checkbox-off'} size={24} color="var(--colour-icon-primary)" /><span>{label}</span>
    </button>
  );
}

// Modal/Flex — Customize Highlights
function HighlightsSheet({ open, onClose, onWatch }) {
  const team = useCopy('team.main');
  const opp = useCopy('opponent-1');
  const [dur, setDur] = useState('5 min');
  const [side, setSide] = useState(team);
  const [see, setSee] = useState({});
  const [remember, setRemember] = useState(true);
  const kinds = ['Key Moments', 'Goals & Chances', 'Defensive Plays', 'Skills'];
  return (
    <div className={'p-hsheet' + (open ? ' is-open' : '')} aria-hidden={!open}>
      <div className="p-hsheet__scrim" onClick={onClose} />
      <div className="p-hsheet__panel" role="dialog" aria-label="Customize Highlights">
        <div className="p-hsheet__head"><span>Customize Highlights</span><button aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <div className="p-hsheet__body">
          <div className="p-field2"><b>Duration</b><Segmented items={['5 min', '10 min', '15 min']} value={dur} onChange={setDur} /></div>
          <div className="p-field2"><b>Team</b><Segmented items={[team, opp, 'Both Teams']} value={side === team || side === opp || side === 'Both Teams' ? side : team} onChange={setSide} /></div>
          <div className="p-field2"><b>Choose a Player <i>(Optional)</i></b>
            <label className="p-search"><Icon name="search" size={18} color="var(--colour-icon-tertiary)" /><input placeholder="Search a player (Optional)" /></label>
          </div>
          <div className="p-field2"><b>Choose what you want to see</b>
            <div className="p-checks">{kinds.map((k) => <Check key={k} label={k} on={!!see[k]} onToggle={() => setSee((s) => ({ ...s, [k]: !s[k] }))} />)}</div>
          </div>
        </div>
        <div className="p-hsheet__foot">
          <button className="p-btn p-btn--primary p-btn--block" onClick={onWatch}><span>Watch Now</span></button>
          <Check label="Remember choices" on={remember} gap={6} onToggle={() => setRemember((v) => !v)} />
        </div>
      </div>
    </div>
  );
}

export function VideoDetail() {
  const nav = useNav();
  const team = useCopy('team.main');
  const opp = useCopy('opponent-1');
  const crest = useSlot('club-crest');
  const [about, setAbout] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState('');
  const [mine, setMine] = useState([]);
  const title = `${team} vs ${opp}`;
  const comments = [
    { name: 'James Bronel', photo: w('av-1.webp'), text: 'When will this start?', likes: 8, reply: true },
    { name: clubFC(team), photo: crest, club: true, text: 'Starting in 10 minutes. Just getting setup here.', likes: 80 },
    { name: 'Roberto Silva', photo: w('av-3.webp'), text: 'Thanks!', likes: 2 },
  ];
  const related = [['rel-1', 'One Year On: A Winger’s Transformation'], ['rel-2', 'The Making of a Transfer: Inside Our Summer Window'], ['rel-3', tx('Captain, Mentor, Bético')], ['rel-4', tx('Reborn in Verdiblanco: A Comeback Story')]];
  const send = () => { if (!draft.trim()) return; setMine((m) => [...m, draft.trim()]); setDraft(''); };
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <main className="p-main">
        <div className="p-vd">
          {/* Media/Video Banner */}
          <div className="p-vd__banner">
            <MatchMedia className="p-vd__photo" still={w('vd-banner.webp')} />
            <div className="p-vd__shadow" />
            <div className="p-vd__info">
              <div className="p-vd__titles">
                <h1>{title}</h1>
                <div className="p-vd__tags"><span>Highlights</span><i /><span>Matches</span></div>
                <div className="p-vd__meta"><span>102min</span><span>Jan 15, 2026</span><span className="p-vd__views"><Icon name="eye" size={12} color="var(--colour-text-tertiary)" />1.1k</span></div>
              </div>
              <div className="p-vd__ctas">
                <button className="p-btn p-btn--primary p-btn--lg" onClick={() => nav.go('live-player')}><Icon name="play-fill" size={18} color="var(--colour-icon-on-primary)" /><span>Play</span></button>
                <button className="p-btn p-btn--outline p-btn--lg" onClick={() => setSheet(true)}><Icon name="sparkle" size={18} color="var(--colour-icon-on-tertiary)" /><span>Highlights</span></button>
              </div>
            </div>
            <div className="p-vd__header">
              <StatusBar />
              <div className="p-titlebar">
                <button className="p-vd__back" aria-label="Back" onClick={nav.canBack ? nav.back : () => nav.tab('home')}><Icon name="back" size={24} color="var(--colour-text-white-overlay)" /></button>
                <button className="p-vd__add" aria-label="Add to list" onClick={nav.dead}><Icon name="add" size={16} color="var(--colour-icon-white-overlay)" /></button>
              </div>
            </div>
          </div>

          {/* Misc/About */}
          <div className={'p-about' + (about ? ' is-open' : '')}>
            <b>About</b>
            <p>Every goal, save, and celebration from the pitch — quick clips that let you relive the best moments from each {team} matchday.</p>
            <button aria-label={about ? 'Show less' : 'Show more'} aria-expanded={about} onClick={() => setAbout((v) => !v)}><Icon name="arrow-down" size={16} /></button>
          </div>

          {/* Utility/Posts-Bar */}
          <div className="p-postsbar">
            <div className="p-postsbar__left">
              <span><Icon name="like" size={20} />56</span>
              <span><Icon name="share" size={20} />2</span>
            </div>
            <span><Icon name="bookmark" size={20} />12</span>
          </div>

          {/* Comment */}
          <section className="p-comments">
            <h2 className="p-subtitle">Comments</h2>
            <div className="p-comments__list">
              <label className="p-cinput">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Leave a comment" />
                <button aria-label="Send" onClick={send}><Icon name="send" size={16} color="var(--colour-icon-on-primary)" /></button>
              </label>
              {[...mine.map((t) => ({ name: 'You', photo: w('av-1.webp'), text: t, likes: 0, own: true })), ...comments].map((c, i) => (
                <div key={i} className="p-comment">
                  <img className={'p-comment__photo' + (c.club ? ' is-club' : '')} src={c.photo} alt="" />
                  <div className="p-comment__body">
                    <div className="p-comment__who"><b>{c.name}</b>{c.club && <span className="p-verified p-verified--brand"><Icon name="verified" size={8} color="var(--colour-icon-white-overlay)" /></span>}<span>{c.own ? 'now' : '1h ago'}</span></div>
                    <p>{c.text}</p>
                    {c.reply && <span className="p-comment__reply">Reply</span>}
                  </div>
                  <span className="p-comment__like"><Icon name="like" size={20} /><small>{c.likes}</small></span>
                </div>
              ))}
            </div>
          </section>

          {/* Related / Cast */}
          <div className="p-tabs p-vd__tabs" role="tablist">
            <button role="tab" aria-selected className="p-tabs__item is-active">Related</button>
            <button role="tab" aria-selected={false} className="p-tabs__item" onClick={nav.dead}>Cast</button>
          </div>
          <div className="p-relgrid">
            {related.map(([f, t]) => (
              <button key={f} className="p-relcard" onClick={nav.dead}>
                <img src={w(f + '.webp')} alt="" /><span className="p-relcard__shadow" /><span className="p-relcard__title">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
      <AppBar active="watch" />
      <HighlightsSheet open={sheet} onClose={() => setSheet(false)} onWatch={() => { setSheet(false); nav.go('live-player'); }} />
    </div>
  );
}

// Media/ Video Player — controls fade out after a few seconds (Figma: After delay → 638:21068); tap to show them again.
function usePlayer() {
  const [shown, setShown] = useState(true);
  const [paused, setPaused] = useState(false);
  const [seek, setSeek] = useState(null);
  const t = useRef();
  const wake = () => { setShown(true); clearTimeout(t.current); t.current = setTimeout(() => setShown(false), 3000); };
  useEffect(() => { wake(); return () => clearTimeout(t.current); }, []);
  const jump = (s) => { setSeek(s); wake(); setTimeout(() => setSeek(null), 700); };
  return { shown, paused, seek, wake, toggle: () => { setPaused((p) => !p); wake(); }, jump };
}

function Controls({ p, horizontal }) {
  const nav = useNav();
  const team = useCopy('team.main');
  const opp = useCopy('opponent-1');
  return (
    <div className={'p-vplayer__ui' + (p.shown ? '' : ' is-hidden')} onClick={(e) => { if (e.target === e.currentTarget) p.shown ? null : p.wake(); }}>
      <div className="p-vplayer__mask" />
      <div className="p-vplayer__top">
        {!horizontal && <StatusBar />}
        <div className="p-vplayer__bar">
          <div className="p-vplayer__title">
            <button aria-label="Back" onClick={horizontal ? () => nav.swap('live-player') : nav.canBack ? nav.back : () => nav.tab('home')}><Icon name="back" size={24} color="var(--colour-text-white-overlay)" /></button>
            <span>{team} vs {opp}</span>
          </div>
          <div className="p-vplayer__icons">
            <button aria-label="Captions" onClick={nav.dead}><Icon name="captions" size={24} color="var(--colour-text-white-overlay)" /></button>
            <button aria-label="Settings" onClick={nav.dead}><Icon name="settings" size={24} color="var(--colour-text-white-overlay)" /></button>
          </div>
        </div>
      </div>
      <div className="p-vplayer__mid">
        <button aria-label="Back 15 seconds" onClick={() => p.jump(-15)}><Icon name="rewind15" size={36} color="var(--colour-text-white-overlay)" /></button>
        <button aria-label={p.paused ? 'Play' : 'Pause'} onClick={p.toggle}><Icon name={p.paused ? 'play-fill' : 'pause'} size={36} color="var(--colour-text-white-overlay)" /></button>
        <button aria-label="Forward 15 seconds" onClick={() => p.jump(15)}><Icon name="forward15" size={36} color="var(--colour-text-white-overlay)" /></button>
      </div>
      {!horizontal && <button className="p-vplayer__fs" onClick={() => nav.swap('video-player-h')}><img src={w('rotate-phone.svg')} alt="" width="20" height="20" /><span>Full screen</span></button>}
      <div className="p-vplayer__bottom">
        <span>01:40</span>
        <div className="p-vod"><i className="p-vod__done" /><i className="p-vod__knob" /><i className="p-vod__buf" /><i className="p-vod__rest" /></div>
        <span>15:00</span>
        {horizontal && <button aria-label="Exit full screen" onClick={() => nav.swap('live-player')}><img src={w('exit-fullscreen.svg')} alt="" width="24" height="24" style={{ padding: '3.5px 2px' }} /></button>}
      </div>
      {p.seek && <span className="p-vplayer__seek">{p.seek > 0 ? '+15s' : '−15s'}</span>}
    </div>
  );
}

export function VideoPlayer() {
  const p = usePlayer();
  return (
    <div className="p-screen p-vplayer" onClick={() => !p.shown && p.wake()}>
      <MatchMedia className="p-vplayer__video" still={w('video-still.webp')} />
      <Controls p={p} />
    </div>
  );
}

// Media/ Video Player / Horizontal (1309:76812): the phone is turned sideways.
export function VideoPlayerHorizontal() {
  const p = usePlayer();
  return (
    <div className="p-screen p-vplayer p-vplayer--h">
      <div className="p-vplayer__rot" onClick={() => !p.shown && p.wake()}>
        <MatchMedia className="p-vplayer__video" still={w('video-still.webp')} />
        <Controls p={p} horizontal />
      </div>
    </div>
  );
}
