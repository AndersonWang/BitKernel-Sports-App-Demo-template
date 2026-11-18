// Sports Highlights — Figma page "Highlight Customization", section 1859:279431.
// Set up 1859:280557 → Customized Highlights (Sport 1859:280607, Leagues 1859:281354, Clubs 1859:281108,
// Players 1859:281007, Duration 1859:281246) → Created 1859:281301 → My Highlights 1859:280351.
// Highlights viewer (story style): Game 1859:279691/279775, Betting 1859:279855, Fantasy 1859:279941, Points 1859:280030.
// Highlight Preferences 1859:280376. Home › Highlights row 1859:280159 and My Space › My Highlights 1859:280137 live in
// home.jsx / myspace.jsx. Lime in the design is the theme's brand colour (decision 10 Nov).
import { useEffect, useRef, useState } from 'react';
import { Icon, LikeButton, AppBar, asset, isChanged, useCopy, useSlot, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { getConfig } from '../config/store.js';
import THEME_SQUADS from '../tokens/theme-squads.json';

const img = (f) => asset(`assets/highlights/${f}`);
// Sport icons and league logos are fixed (not per club) and share one sprite (assets/highlights/fixed-sprite.webp,
// 6 × 4 tiles of 96 px) to keep the template under the host's 511-file limit
const SPRITE = {"sport-badminton": 0, "sport-baseball": 1, "sport-basketball": 2, "sport-boxing": 3, "sport-cricket": 4, "sport-curling": 5, "sport-fieldhockey": 6, "sport-football": 7, "sport-golf": 8, "sport-hockey": 9, "sport-lacrosse": 10, "sport-martialarts": 11, "sport-pingpong": 12, "sport-soccer": 13, "sport-tennis": 14, "sport-volleyball": 15, "lg-brasileirao": 16, "lg-laliga": 17, "lg-ligue1": 18, "lg-lpf": 19, "lg-mls": 20, "lg-pl": 21, "lg-seriea": 22};
// Tiles drawn as the whole 32 px circle (Figma 1885:298806 Brasileirão, 1885:298828 Serie A): shown at full size
const SPRITE_FULL = new Set(['lg-brasileirao', 'lg-seriea']);
function Sprite({ id, className }) {
  const i = SPRITE[id] ?? 0;
  return <span className={'p-sprite' + (SPRITE_FULL.has(id) ? ' is-full' : '') + (className ? ' ' + className : '')} style={{ backgroundImage: `url(${img('fixed-sprite.webp')})`, backgroundPosition: `${(i % 6) * 20}% ${Math.floor(i / 6) * (100 / 3)}%` }} aria-hidden />;
}

// ---- shared demo state: what the fan picked (Set up, Preferences, the Created screen and the viewer read it)
export const hlPrefs = { sport: 'soccer', leagues: [], clubs: [], players: [], duration: '10 min', kinds: ['Key Moments', 'Skills', 'Commentary'], created: false, saved: false };

export const SPORTS = [['soccer', 'Football'], ['basketball', 'Basketball'], ['football', 'Rugby'], ['baseball', 'Baseball'], ['tennis', 'Tennis'], ['volleyball', 'Volleyball'], ['pingpong', 'Table Tennis'], ['badminton', 'Badminton'], ['hockey', 'Ice Hockey'], ['fieldhockey', 'Field Hockey'], ['lacrosse', 'Lacrosse'], ['cricket', 'Cricket'], ['golf', 'Golf'], ['boxing', 'Boxing'], ['martialarts', 'Martial Arts'], ['curling', 'Curling']];
export const LEAGUES = [['lpf', 'LPF (ARG)'], ['pl', 'Premiere League (UK)'], ['laliga', 'LALIGA (ES)'], ['seriea', 'Serie A (IT)'], ['ligue1', 'Ligue 1 (FR)'], ['brasileirao', 'Brasileirão Serie A (BR)'], ['mls', 'MLS (USA & CA)']];
export const KINDS = ['Key Moments', 'Goals & Chances', 'Defensive Plays', 'Skills', 'Commentary', 'Pre-Game', 'Post-Game'];

// The theme's own league opens first in the club list
const leagueOf = (name) => { const n = String(name).toLowerCase(); return n.includes('laliga') ? 'laliga' : n.includes('lpf') || n.includes('profesional') ? 'lpf' : n.includes('premier') ? 'pl' : n.includes('brasil') ? 'brasileirao' : n.includes('serie a') ? 'seriea' : n.includes('ligue') ? 'ligue1' : n.includes('mls') ? 'mls' : null; };

// The squad of the selected theme (same faces and names as Fixtures › Squads)
const LINEUP = [[1, 'Álvaro', 'home-gk'], [3, 'Llorente', 'home-d1'], [3, 'Diego', 'home-d2'], [4, 'Natan', 'home-d3'], [5, 'Marc', 'home-d4'], [12, 'Ángel', 'home-m1'], [16, 'Fornals', 'home-m2'], [23, 'Junior', 'home-m3'], [19, 'Parrott', 'home-f1'], [27, 'Antonio', 'home-f2'], [20, 'Petit', 'home-f3']];
export function squad() {
  const names = THEME_SQUADS[getConfig().theme.mode]?.names || {};
  return LINEUP.map(([num, name, id]) => ({ id, num, name: names[id] || name, photo: asset(`assets/fixtures/squads/${id}.png`) }));
}

// The clubs the fan can pick: their own club, then the three fixture opponents
export function useClubs() {
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const opp = [1, 3, 4].map((n) => ({ id: `opponent-${n}`, name: useCopy(`opponent-${n}`), logo: useSlot(`opponent-${n}`) }));
  return [{ id: 'own', name: team, logo: crest }, ...opp];
}

function StatusBar({ overlay }) {
  return <div className={'p-statusbar' + (overlay ? ' p-statusbar--overlay' : '')}><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color={overlay ? 'var(--colour-icon-white-overlay)' : undefined} /></div>;
}

function TitleBar({ title, onBack }) {
  return (
    <header className="p-header">
      <StatusBar />
      <div className="p-titlebar">
        <div className="p-titlebar__lead">
          {onBack && <button className="p-backbtn" onClick={onBack} aria-label="Back"><Icon name="back" size={24} /></button>}
          <h1 className="p-title2">{title}</h1>
        </div>
      </div>
    </header>
  );
}

const Logo = ({ src, sprite, cover }) => <span className={'p-hl__logo' + (cover ? ' is-cover' : '')}>{sprite ? <Sprite id={sprite} /> : <img src={src} alt="" />}</span>;

// ---- Set up your Highlights (1859:280557)
export function HighlightsIntro() {
  const nav = useNav();
  return (
    <div className="p-screen p-hl-intro">
      <img className="p-hl-intro__bg" src={img('intro-bg.webp')} alt="" />
      <StatusBar overlay />
      <div className="p-hl-intro__text">
        <h1>Set up your Highlights</h1>
        <p>Pick your favorite sports, teams, leagues, players, <br />and we’ll bring their best moments together.</p>
      </div>
      <div className="p-hl-intro__ctas">
        <button className="p-btn p-btn--primary p-btn--lg" onClick={() => nav.go('hl-setup')}><span>Get Started</span></button>
        <button className="p-btn p-btn--lg p-hl-intro__skip" onClick={() => nav.go('hl-mine')}><span>Skip For Now</span></button>
      </div>
    </div>
  );
}

// ---- Customized Highlights: five steps on one screen (step bars at the top)
// Selected: icon/primary filled check; unselected: icon/tertiary outline (Radio box_unselected in Figma)
function Radio({ on }) { return <Icon name={on ? 'radio-on' : 'radio-off'} size={24} color={on ? 'var(--colour-icon-primary)' : 'var(--colour-icon-tertiary)'} />; }
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function HighlightsSetup() {
  const nav = useNav();
  const league = useCopy('fixture.league');
  const clubs = useClubs();
  const [step, setStep] = useState(0);
  const [p, setP] = useState(() => ({ ...hlPrefs, leagues: [...hlPrefs.leagues], clubs: [...hlPrefs.clubs], players: [...hlPrefs.players], kinds: [] }));
  const [open, setOpen] = useState({ [leagueOf(league) || 'lpf']: true });
  const [q, setQ] = useState('');
  const players = squad();
  const own = leagueOf(league) || 'lpf';
  const groups = [own, ...LEAGUES.map(([id]) => id).filter((id) => id !== own)].slice(0, 4);
  const ready = [!!p.sport, p.leagues.length > 0, p.clubs.length > 0, p.players.length > 0, p.kinds.length > 0][step];
  const next = () => {
    if (step < 4) { setStep(step + 1); setQ(''); return; }
    Object.assign(hlPrefs, p, { created: true });
    nav.go('hl-done');
  };
  const back = () => (step ? setStep(step - 1) : nav.back());
  const match = (s) => !q || s.toLowerCase().includes(q.trim().toLowerCase());
  const search = (ph) => <label className="p-search"><Icon name="search" size={18} color="var(--colour-icon-tertiary)" /><input placeholder={ph} value={q} onChange={(e) => setQ(e.target.value)} /></label>;
  return (
    <div className="p-screen p-hl" style={{ background: 'var(--colour-surface-default)' }}>
      <TitleBar title="Customized Highlights" onBack={back} />
      <main className="p-main p-hl__body">
        <div className="p-hl__steps" aria-label={`Step ${step + 1} of 5`}>{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i <= step ? 'is-done' : ''} />)}</div>
        {step === 0 && (
          <>
            <h2 className="p-hl__q">Choose a Sport</h2>
            <div className="p-hl__sports">
              {SPORTS.map(([id, name]) => (
                <button key={id} className={'p-hl__sport' + (p.sport === id ? ' is-on' : '')} aria-pressed={p.sport === id} aria-label={name} onClick={() => setP({ ...p, sport: p.sport === id ? null : id })}>
                  <Sprite id={`sport-${id}`} className="p-hl__sporticon" />
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="p-hl__q">Select one or more Leagues</h2>
            {search('Search a league')}
            <ul className="p-hl__list">
              {LEAGUES.filter(([, n]) => match(n)).map(([id, name]) => (
                <li key={id}><button onClick={() => setP({ ...p, leagues: toggleIn(p.leagues, id) })} aria-pressed={p.leagues.includes(id)}><Logo sprite={`lg-${id}`} /><span>{name}</span><Radio on={p.leagues.includes(id)} /></button></li>
              ))}
            </ul>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="p-hl__q">Select one or more Clubs</h2>
            {search('Search a club')}
            <ul className="p-hl__list">
              {groups.map((g) => {
                const name = LEAGUES.find(([id]) => id === g)[1];
                const list = g === own ? clubs : [];
                const n = list.filter((c) => p.clubs.includes(c.name)).length;
                return (
                  <li key={g} className="p-hl__group">
                    <button className="p-hl__grouphead" aria-expanded={!!open[g]} onClick={() => (list.length ? setOpen({ ...open, [g]: !open[g] }) : nav.dead())}>
                      <span>{g === own ? league : name}{n > 0 && <small> ({n})</small>}</span><Icon name="chevron-down" size={24} style={open[g] ? { transform: 'rotate(180deg)' } : undefined} />
                    </button>
                    {open[g] && list.filter((c) => match(c.name)).map((c) => (
                      <button key={c.id} onClick={() => setP({ ...p, clubs: toggleIn(p.clubs, c.name) })} aria-pressed={p.clubs.includes(c.name)}><Logo src={c.logo} /><span>{c.name}</span><Radio on={p.clubs.includes(c.name)} /></button>
                    ))}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="p-hl__q">Select one or more Players</h2>
            {search('Search a player')}
            <ul className="p-hl__list">
              {players.filter((pl) => match(pl.name)).map((pl) => (
                <li key={pl.id}><button onClick={() => setP({ ...p, players: toggleIn(p.players, pl.name) })} aria-pressed={p.players.includes(pl.name)}><Logo src={pl.photo} cover /><b>{pl.num}</b><span>{pl.name}</span><Radio on={p.players.includes(pl.name)} /></button></li>
              ))}
            </ul>
          </>
        )}
        {step === 4 && (
          <div className="p-hl__duration">
            <div className="p-field2"><b>Duration</b><Seg items={['5 min', '10 min', '15 min']} value={p.duration} onChange={(d) => setP({ ...p, duration: d })} /></div>
            <div className="p-field2"><b>Choose what you want to see <i>(Select at least one)</i></b>
              {/* Full-width rows with the circle check on the right, like the League / Club / Player steps (1859:281191 → filled 1859:281246) */}
              <ul className="p-hl__list p-hl__kinds">
                {KINDS.map((k) => {
                  const on = p.kinds.includes(k);
                  return <li key={k}><button role="checkbox" aria-checked={on} onClick={() => setP({ ...p, kinds: toggleIn(p.kinds, k) })}><span>{k}</span><Radio on={on} /></button></li>;
                })}
              </ul>
            </div>
          </div>
        )}
      </main>
      <div className="p-hl__foot">
        {step < 4 && <button className="p-btn p-btn--secondary p-btn--lg" onClick={() => { setStep(step + 1); setQ(''); }}><span>Skip</span></button>}
        <button className="p-btn p-btn--primary p-btn--lg" disabled={!ready} onClick={next}><span>Continue</span></button>
      </div>
      <AppBar active="none" />
    </div>
  );
}

export function Seg({ items, value, onChange }) {
  return (
    <div className="p-seg is-primary" role="radiogroup">
      {items.map((it) => <button key={it} role="radio" aria-checked={it === value} className={'p-seg__btn' + (it === value ? ' is-selected' : '')} onClick={() => onChange(it)}>{it}</button>)}
    </div>
  );
}

// ---- Your Highlights have been created! (1859:281301)
export function HighlightsDone() {
  const nav = useNav();
  const clubs = useClubs();
  const players = squad();
  const logos = [
    ...hlPrefs.leagues.map((id) => ({ sprite: `lg-${id}` })),
    ...clubs.filter((c) => hlPrefs.clubs.includes(c.name)).map((c) => ({ src: c.logo })),
    ...players.filter((pl) => hlPrefs.players.includes(pl.name)).map((pl) => ({ src: pl.photo, cover: true })),
  ];
  return (
    <div className="p-screen p-hl-done" style={{ background: 'var(--colour-surface-default)' }}>
      <StatusBar />
      <div className="p-hl-done__content">
        <div className="p-hl-done__head">
          <Icon name="hl-done" size={40} color="var(--colour-brand-primary)" />
          <h1>Your Highlights have been created!</h1>
          <p>You can find them on <button onClick={() => nav.go('hl-mine')}>My Highlights</button> playlist on <button onClick={() => nav.go('myspace')}>My Space</button></p>
        </div>
        {logos.length > 0 && <div className="p-hl-done__logos">{logos.map((l, i) => <Logo key={i} {...l} />)}</div>}
        <div className="p-hl__chips">
          <span className="p-hl__chip is-tag"><Icon name="cm-time" size={12} color="var(--colour-icon-white-overlay)" />{hlPrefs.duration}</span>
          {hlPrefs.kinds.map((k) => <span key={k} className="p-hl__chip is-tag">{k}</span>)}
        </div>
        <button className="p-btn p-btn--primary p-btn--lg p-hl-done__ok" onClick={() => nav.go('hl-mine')}><span>OK</span></button>
      </div>
    </div>
  );
}

// ---- My Highlights (1859:280351)
export function useMyHighlights() {
  const team = useCopy('team.main');
  const opp = useCopy('opponent-1');
  // The bookmark in the Highlights viewer saves the compilation here (UI Details note), newest first
  const saved = hlPrefs.saved ? [{ title: `${team} vs ${opp} Highlights`, time: hlPrefs.duration.replace(' min', ':00'), date: 'Today', photo: img('hl-game.webp') }] : [];
  return [...saved, ...[
    [`${team} vs ${opp}`, '02:15', '20th October, 2026'],
    [tx('Boca Jrs. vs São Paulo'), '03:00', '18th October, 2026'],
    [tx('Boca Jrs. vs Vasco da Gama'), '05:00', '16th October, 2026'],
    ['Dortmund vs Chelsea', '05:00', '12th October, 2026'],
    ['Neymar Jr. on Santos FC', '10:30', '11th October, 2026'],
    ['Lionel Messi Weekly Recap', '15:00', '11th October, 2026'],
  ].map(([title, time, date], i) => ({ title, time, date, photo: img(`mh-${i + 1}.webp`) }))];
}

export function MyHighlights() {
  const nav = useNav();
  const items = useMyHighlights();
  const [sort, setSort] = useState('Newest First');
  const list = sort === 'Newest First' ? items : [...items].reverse();
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <header className="p-header">
        <StatusBar />
        <div className="p-titlebar">
          <div className="p-titlebar__lead"><h1 className="p-title2">My Highlights</h1></div>
          <div className="p-ctas">{['bell', 'search'].map((c) => <button key={c} className="p-cta" aria-label={c} onClick={() => nav.go(c === 'bell' ? 'notifications' : 'search')}><Icon name={c} size={16} /></button>)}</div>
        </div>
      </header>
      <main className="p-main">
        <div className="p-hl-mine__sort"><span>Sort by</span><button className="p-btn p-btn--secondary" onClick={() => setSort(sort === 'Newest First' ? 'Oldest First' : 'Newest First')}><span>{sort}</span><Icon name="chevron-down" size={18} color="var(--colour-text-on-secondary)" /></button></div>
        <div className="p-hl-mine__grid">
          {list.map((h) => (
            <button key={h.title} className="p-clip p-clip--fill" onClick={() => nav.go('hl-viewer')}>
              <div className="p-clip__photo" style={{ backgroundImage: `url(${h.photo})` }}><span className="p-clip__time">{h.time}</span></div>
              <div className="p-clip__body"><span className="p-clip__title">{h.title}</span><span className="p-caption">{h.date}</span></div>
            </button>
          ))}
        </div>
        <button className="p-hl-mine__add" aria-label="Highlight Preferences" onClick={() => nav.go('hl-prefs')}><Icon name="add" size={22} color="var(--colour-icon-on-primary)" /></button>
      </main>
      <AppBar active="none" />
    </div>
  );
}

// ---- Highlight Preferences (1859:280376)
export function HighlightPreferences() {
  const nav = useNav();
  const clubs = useClubs();
  const players = squad();
  const [, force] = useState(0);
  const [open, setOpen] = useState({ sports: true, leagues: true, clubs: true, players: true });
  // Until the fan sets them up, show the theme's own league, club and three of its players
  const league = leagueOf(useCopy('fixture.league')) || 'lpf';
  if (!hlPrefs.created && !hlPrefs.leagues.length) Object.assign(hlPrefs, { leagues: [league, 'brasileirao', 'laliga', 'seriea'].filter((v, i, a) => a.indexOf(v) === i), clubs: [clubs[0].name, clubs[1].name, clubs[3].name], players: [players[6].name, players[9].name, players[7].name], sports: ['soccer', 'football', 'tennis'] });
  hlPrefs.sports ||= [hlPrefs.sport || 'soccer'];
  const remove = (key, v) => { hlPrefs[key] = hlPrefs[key].filter((x) => x !== v); force((n) => n + 1); };
  const groups = [
    ['sports', 'Your Sports', hlPrefs.sports.map((id) => ({ v: id, label: SPORTS.find(([s]) => s === id)?.[1], sprite: `sport-${id}`, emoji: true }))],
    ['leagues', 'Your Leagues', hlPrefs.leagues.map((id) => ({ v: id, label: LEAGUES.find(([l]) => l === id)?.[1], sprite: `lg-${id}` }))],
    ['clubs', 'Your Clubs', hlPrefs.clubs.map((n) => ({ v: n, label: n, icon: clubs.find((c) => c.name === n)?.logo }))],
    ['players', 'Your Players', hlPrefs.players.map((n) => ({ v: n, label: n, icon: players.find((pl) => pl.name === n)?.photo, cover: true }))],
  ];
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <TitleBar title="Highlight Preferences" onBack={nav.back} />
      <main className="p-main p-hl-prefs">
        <div className="p-hl-prefs__create">
          <button className="p-btn p-btn--primary p-btn--lg" onClick={() => nav.go('hl-setup')}><Icon name="add" size={18} color="var(--colour-icon-on-primary)" /><span>Create Highlight</span></button>
          <p>Make a custom set of highlights above or change your recurring preferences below.</p>
        </div>
        {groups.map(([key, title, chips]) => (
          <section key={key} className="p-hl-prefs__group">
            <button className="p-hl-prefs__head" aria-expanded={open[key]} onClick={() => setOpen({ ...open, [key]: !open[key] })}><h2 className="p-subtitle">{title}</h2><Icon name="chevron-down" size={20} style={open[key] ? { transform: 'rotate(180deg)' } : undefined} /></button>
            {open[key] && (
              <div className="p-hl__chips is-start">
                {chips.map((c) => (
                  <span key={c.v} className="p-hl__chip is-big">
                    {c.emoji ? <span className="p-hl__emoji"><Sprite id={c.sprite} /></span> : (c.icon || c.sprite) && <Logo src={c.icon} sprite={c.sprite} cover={c.cover} />}
                    {c.label}
                    <button aria-label={`Remove ${c.label}`} onClick={() => remove(key, c.v)}><Icon name="close" size={16} color="var(--colour-icon-tertiary)" /></button>
                  </span>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
      <AppBar active="none" />
    </div>
  );
}

// ---- Highlights viewer: Pregame 1-2 → Game → Betting → Fantasy → Points → Postgame 1-2 (tap the right side for the next one)
// Top bar (UI Details 1859:281442): one dash per clip — Pregame (red), Highlights (brand), Postgame (blue).
// The pill sits on the current clip and names its phase; watched clips are dimmed. Tapping the bar advances.
// Six optional videos (Configure › Videos): Pregame 1-2, Highlights 1 (Game + Betting), Highlights 2 (Fantasy + Points), Postgame 1-2.
const TIMELINE = ['pre', 'pre', 'hl', 'hl', 'hl', 'hl', 'post', 'post'];
const PHASE = { pre: 'Pregame', hl: 'Highlights', post: 'Postgame' };
const FIRST = 2; // the Game highlight; Betting, Fantasy and Points follow
export const HL_VIDEO = ['pre-1', 'pre-2', 'hl-1', 'hl-1', 'hl-2', 'hl-2', 'post-1', 'post-2'].map((k) => `assets/highlights/${k}.mp4`);

export function HighlightsViewer() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const oppLogo = useSlot('opponent-1');
  const player = squad()[6].name;
  const [i, setI] = useState(FIRST);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [saved, setSaved] = useState(hlPrefs.saved);
  const [toast, setToast] = useState(null);
  const [closing, setClosing] = useState(false);
  const t = useRef();
  const designed = [
    { photo: img('hl-game.webp'), video: HL_VIDEO[2], score: '3 - 2', crests: [oppLogo, crest], side: true },
    { photo: img('hl-betting.webp'), video: HL_VIDEO[3], score: '2 - 1', crests: [crest, oppLogo], card: { kind: 'bet', big: '+$100 USD', small: tx(`${team} Scores`) } },
    { photo: img('hl-player.webp'), video: HL_VIDEO[4], card: { kind: 'glass', big: '+2.5 Points', small: [player, 'Scored a Goal'] } },
    { photo: img('hl-player.webp'), video: HL_VIDEO[5], pill: '+2 PTS', card: { kind: 'points', big: '+2 Points', small: [player, 'Scored a Goal'] } },
  ];
  // Clips outside the four designed ones reuse the Game layout: 0 - 0 before kick-off, the final score after
  const clip = (n) => designed[n - FIRST] || { photo: img(TIMELINE[n] === 'post' ? 'hl-betting.webp' : 'hl-game.webp'), video: HL_VIDEO[n], score: { pre: '0 - 0', hl: '1 - 1', post: '3 - 2' }[TIMELINE[n]], crests: [oppLogo, crest], side: true };
  const slides = TIMELINE;
  const s = clip(i);
  // Optional highlight videos (Configure › Videos): a slide with an uploaded video plays it while the viewer is playing
  // and moves on when it ends; without one, the still shows and Play advances every few seconds.
  const hasVideo = isChanged(s.video);
  const vid = useRef();
  // Rule: an uploaded video replaces the still completely (no poster, no still first) and plays as soon as its clip
  // opens; a clip without a video shows its still and waits for Play.
  useEffect(() => { if (hasVideo) setPlaying(true); }, [i, hasVideo]);
  useEffect(() => {
    const v = vid.current; if (!v) return;
    v.muted = muted;
    if (playing) v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); else v.pause();
  }, [playing, muted, i, hasVideo]);
  const close = () => { if (closing) return; setClosing(true); setTimeout(nav.back, 260); };
  const say = (m) => { setToast(m); clearTimeout(t.current); t.current = setTimeout(() => setToast(null), 1600); };
  // Playing advances to the next highlight after a few seconds, like a story
  useEffect(() => { if (!playing || hasVideo) return undefined; const id = setTimeout(() => (i < slides.length - 1 ? setI(i + 1) : setPlaying(false)), 4500); return () => clearTimeout(id); }, [playing, i]);
  // Playback controls: they hide 2.5s into playback. Moving the cursor brings them back (and restarts the timer);
  // a tap or click while they are hidden pauses (which shows them), and a tap in the middle resumes.
  const [shown, setShown] = useState(true);
  const hide = useRef();
  const wake = () => { setShown(true); clearTimeout(hide.current); if (playing) hide.current = setTimeout(() => setShown(false), 2500); };
  useEffect(() => { wake(); return () => clearTimeout(hide.current); }, [playing]);
  const hidden = playing && !shown;
  const tap = (e) => {
    if (hidden) { setPlaying(false); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.3) setI(Math.max(0, i - 1)); else if (x > 0.7) setI(Math.min(slides.length - 1, i + 1)); else setPlaying(!playing);
    wake();
  };
  return (
    <div className={'p-screen p-hlv' + (closing ? ' is-closing' : '')} onPointerMove={(e) => { if (e.pointerType === 'mouse' && playing) wake(); }}>
      {hasVideo
        ? <video key={i} ref={vid} className="p-hlv__photo" src={asset(s.video)} playsInline preload="auto" autoPlay muted={muted} onEnded={() => (i < slides.length - 1 ? setI(i + 1) : setPlaying(false))} aria-hidden />
        : <img key={i} className="p-hlv__photo" src={s.photo} alt="" />}
      <button className="p-hlv__tap" aria-label={hidden ? 'Pause' : 'Tap: left previous, middle play or pause, right next'} onClick={tap} />
      <div className="p-hlv__top">
        <StatusBar overlay />
        <button className="p-hlv__bar" aria-label={`${PHASE[TIMELINE[i]]}, clip ${i + 1} of ${slides.length}. Tap for the next one`} onClick={() => setI(Math.min(slides.length - 1, i + 1))}>
          {TIMELINE.map((k, n) => (n === i ? <span key={n} className={'p-hlv__pill is-' + k}>{PHASE[k]}</span> : <i key={n} className={'is-' + k + (n < i ? ' is-past' : '')} />))}
        </button>
        <div className="p-hlv__row">
          {s.score && <span className="p-hlv__score"><img src={s.crests[0]} alt="" /><b>{s.score}</b><img src={s.crests[1]} alt="" /></span>}
          <button className="p-hlv__glass p-hlv__x" aria-label="Close" onClick={close}><Icon name="close" size={24} color="var(--colour-icon-white-overlay)" /></button>
        </div>
      </div>
      {/* Volume + Play centred on every highlight; while playing they fade out, and a tap in the middle pauses and brings them back */}
      {(
        <div className={'p-hlv__controls' + (hidden ? ' is-faded' : '')}>
          <button className="p-hlv__glass p-hlv__mute" aria-pressed={muted} aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted(!muted)}><Icon name={muted ? 'volume-off' : 'volume'} size={16} color="var(--colour-icon-white-overlay)" /></button>
          {<button className="p-hlv__glass p-hlv__play" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}><Icon name={playing ? 'pause' : 'play-solid'} size={24} color="var(--colour-icon-white-overlay)" /></button>}
        </div>
      )}
      {s.side && (
        <div className="p-hlv__side">
          <LikeButton className="" icon="cv-like" size={24} color="var(--colour-icon-white-overlay)" count={56} countAs="span" />
          <button aria-label="Comments" onClick={nav.openComments}><Icon name="cv-comment" size={24} color="var(--colour-icon-white-overlay)" /><span>8</span></button>
          <button aria-label="Save to My Highlights" aria-pressed={saved} onClick={() => { setSaved(!saved); hlPrefs.saved = !saved; say(saved ? 'Removed from My Highlights' : 'Saved to My Space › My Highlights'); }}><Icon name={saved ? 'cv-bookmark' : 'cv-bookmark'} size={24} color={saved ? 'var(--colour-brand-primary)' : 'var(--colour-icon-white-overlay)'} /><span>{saved ? 5 : 4}</span></button>
          <button aria-label="Share" onClick={() => say('Link Copied')}><Icon name="cv-share" size={24} color="var(--colour-icon-white-overlay)" /><span>12</span></button>
          <button aria-label="More" onClick={nav.dead}><Icon name="more" size={24} color="var(--colour-icon-white-overlay)" /><span>More</span></button>
        </div>
      )}
      {s.card && (
        <div className="p-hlv__bottom">
          {s.pill && <span key={'pill' + i} className="p-hlv__reward">{s.pill}</span>}
          <div key={'card' + i} className={'p-hlv__card is-' + s.card.kind}>
            <b>{s.card.big}</b>
            {Array.isArray(s.card.small) ? <span>{s.card.small[0]}<i />{s.card.small[1]}</span> : <span>{s.card.small}</span>}
          </div>
        </div>
      )}
      {toast && <div className="p-cv__toast" role="status"><Icon name="toast-check" size={24} color="var(--colour-text-primary)" /><span>{toast}</span></div>}
    </div>
  );
}
