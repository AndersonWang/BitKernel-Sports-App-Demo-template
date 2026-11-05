// Avatar (My Space › Play) — Figma 1033:51370 (empty) → 1130:56343 Create → 1089:68602 Play → 1252:160390 Chat.
// Entered from the My Space avatar banner. Saving the Create form turns the empty Play page into the filled one.
import { useState } from 'react';
import { Header, AppBar, SectionTitle, Icon, useSlot, useSlotOverride, useCopy, asset, isReplaced, videoProps } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { mySpace } from './myspace.jsx';

const img = (f) => asset(`assets/myspace/${f}`);
// Safari can't draw VP9 alpha (it paints the transparent area black), so it gets the matching still.
const NO_ALPHA_VIDEO = typeof navigator !== 'undefined' && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

// Demo values from "Create / Filled" (1130:56428); used to pre-fill Customize.
const EMPTY = { name: '', gender: 'Female', age: '', height: '', position: null, sliders: [50, 50, 50, 50], league: '', team: '', jersey: '' };
const SAMPLE = import.meta.env.VITE_EDITION === 'junior' ? { league: 'Liga BetPlay DIMAYOR', team: 'Junior FC' } : { league: 'LPF (Liga Profesional de Fútbol)', team: 'Boca Jrs.' };
const SLIDERS = [['Classic', 'Creative'], ['Fast', 'Resistance'], ['Good Reception', 'Precise Control'], ['Good Technique', 'Effective']];
const POSITIONS = ['GK', 'CB', 'LB/RB', 'CM', 'AM', 'Winger', 'Striker'];

// Same frame chrome as My Space: the net sits behind a see-through header that turns solid on scroll.
function Shell({ title, children, appbar = true }) {
  const [clear, setClear] = useState(true);
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <img className="p-ms__net" src={asset('assets/fixtures/net.png')} alt="" aria-hidden />
      <div className={'p-ms__head' + (clear ? ' is-clear' : '')}><Header back title={title} ctas={['bell', 'search']} /></div>
      <main className="p-main" onScroll={(e) => setClear(e.currentTarget.scrollTop < 4)}>{children}</main>
      {appbar && <AppBar active="none" />}
    </div>
  );
}

// Avatar / Interactions ×5 — "Things to Try"
function ThingsToTry() {
  const nav = useNav();
  const team = useCopy('team.main');
  const items = [
    { tag: 'New', title: 'Talk with your player', text: <>Have a live chat with your AI player,<br />ask anything, any time.</>, go: () => nav.go('avatar-chat') },
    { title: 'Training Now', text: 'Run a training session and push your player’s stats up' },
    { title: 'Post-Match Talk', text: <>Chat with your avatar about the match<br />and share your thoughts.</> },
    { tag: 'New', title: 'Missions', text: <>Complete missions with your AI Avatar<br />and earn exciting rewards.</> },
    { title: `${team} Ball`, text: `Collect ${team.split(' ').map((w) => w[0]).join('')} Balls with your Avatar and unlock special surprises.` },
  ];
  return (
    <section className="p-ms__section">
      <SectionTitle title="Things to Try" />
      <div className="p-av__try">
        {items.map((it) => (
          <button key={it.title} className="p-av__interaction" onClick={it.go || nav.dead}>
            <span className="p-av__itext">
              {it.tag && <span className="p-av__new">{it.tag}</span>}
              <b>{it.title}</b>
              <small>{it.text}</small>
            </span>
            <Icon name="arrow-right" size={24} />
          </button>
        ))}
      </div>
    </section>
  );
}

// Avatar Container + Avatar / Avatar Card
function Hero({ filled }) {
  const nav = useNav();
  const player = useSlot('avatar-player');
  const a = mySpace.avatar;
  // Default client: the looping avatar video (keyed to transparent). A client who replaces the
  // "avatar player" image slot gets their still instead, so the Betis player never shows for them.
  // A replaced video (Configure › Videos) plays in every browser, Safari included.
  const video = !useSlotOverride('avatar-player');
  const still = NO_ALPHA_VIDEO && !isReplaced('assets/myspace/avatar-player.webm');
  return (
    <div className="p-av__hero">
      {video
        ? (still
          ? <img className="p-av__video" src={img('avatar-player-poster.webp')} alt="" />
          : <video className="p-av__video" {...videoProps('assets/myspace/avatar-player.webm', 'assets/myspace/avatar-player-poster.webp')} autoPlay muted loop playsInline aria-hidden />)
        : <img className="p-av__player" src={player} alt="" />}
      <div className={'p-av__card' + (filled ? ' is-filled' : '')}>
        <span className="p-av__tag"><Icon name="ms-star" size={12} />Avatar</span>
        <span className="p-av__cardtext">
          <b>{filled ? a.name : 'MY PLAYER'}</b>
          <small>{filled ? 'Your ultimate fantasy soccer star' : 'Build your ultimate fantasy star'}</small>
        </span>
        <button className="p-btn p-btn--primary p-btn--trail p-av__cta" onClick={() => nav.go('avatar-create')}>
          <span>{filled ? 'Customize' : 'Create'}</span><Icon name="chevron-right" size={18} color="var(--colour-icon-on-primary)" />
        </button>
      </div>
    </div>
  );
}

// My Space / Play (empty) — 1033:51370
export function AvatarPlay() {
  const filled = !!mySpace.avatar;
  return (
    <Shell title="Play">
      <div className="p-av">
        <Hero filled={filled} />
        {filled && <Performance />}
        <ThingsToTry />
      </div>
    </Shell>
  );
}

// Avatar / Performance — radar chart, 6 axes (1113:55066)
function Performance() {
  const axes = ['SPEED', 'STAMINA', 'PASSING', 'ACCURACY', 'DEFENCE', 'CROSSING'];
  const s = mySpace.avatar.sliders;
  // Sliders nudge the stats so the chart reflects what was configured; the defaults reproduce the Figma values.
  const player = [91, 88, 85, 79, 62, 93].map((v, i) => Math.max(30, Math.min(99, v + Math.round(((s[i % 4] ?? 50) - 50) / 10))));
  const avg = [82, 80, 78, 75, 58, 86];
  const cx = 100, cy = 88, R = 61;
  const pt = (i, r) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const poly = (vals) => vals.map((v, i) => pt(i, R * v / 100).join(',')).join(' ');
  const ring = (f) => axes.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const labels = [[100, -1, 'c'], [166, 38, 'c'], [166, 112, 'c'], [100, 150, 'c'], [26, 111, 'c'], [26, 36, 'c']];
  return (
    <section className="p-av__perf">
      <h3>Performance</h3>
      <div className="p-av__radar">
        <svg width="200" height="180" viewBox="0 0 200 180" aria-label={'Player stats: ' + axes.map((a, i) => `${a} ${player[i]}`).join(', ')}>
          {[1, .75, .5, .25].map((f) => <polygon key={f} points={ring(f)} fill="none" stroke="var(--colour-border-subtle)" />)}
          {axes.map((_, i) => <line key={i} x1={cx} y1={cy} x2={pt(i, R)[0]} y2={pt(i, R)[1]} stroke="var(--colour-border-subtle)" />)}
          <polygon points={poly(avg)} fill="none" stroke="#9b59b6" strokeWidth="1.5" />
          <polygon points={poly(player)} fill="rgba(92,92,92,.25)" stroke="var(--colour-action-primary)" strokeWidth="1.5" />
        </svg>
        {labels.map(([x, y], i) => <span key={axes[i]} className="p-av__axis" style={{ left: x, top: y }}><i>{axes[i]}</i><b>{player[i]}</b></span>)}
      </div>
      <div className="p-av__legend"><span><i />This Season</span><span><i className="is-avg" />Season Avg</span></div>
    </section>
  );
}

function Field({ label, value, placeholder, onChange, suffix, select, onTap, inputMode }) {
  return (
    <label className="p-av__field" onClick={select ? onTap : undefined}>
      <span className="p-av__fieldinner">
        {value !== '' && <small>{label}</small>}
        {select
          ? <span className={value ? '' : 'is-ph'}>{value || placeholder}</span>
          : <input value={value} placeholder={placeholder} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />}
      </span>
      {suffix && <em>{suffix}</em>}
      {select && <Icon name="chevron-down" size={18} color="var(--colour-icon-tertiary)" />}
    </label>
  );
}

// My Space / Play / Create — Empty 1130:56343 / Filled 1130:56428
export function AvatarCreate() {
  const nav = useNav();
  const [f, setF] = useState(() => ({ ...EMPTY, ...(mySpace.avatar || {}) }));
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(f) !== JSON.stringify(EMPTY);
  const valid = f.name.trim() && f.position;
  const save = () => {
    if (!valid) return nav.notify(!f.name.trim() ? 'Enter an avatar name' : 'Pick a position');
    mySpace.avatar = f;
    nav.popTo(2, 'avatar-play');
  };
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back title="Create My Player" ctas={[]} />
      <main className="p-main">
        <div className="p-av__form">
          <h3>Basic Information</h3>
          <Field label="Avatar Name" value={f.name} placeholder="Enter Avatar Name" onChange={set('name')} />
          <div className="p-seg p-av__seg" role="radiogroup">
            {['Female', 'Male'].map((g) => <button key={g} role="radio" aria-checked={f.gender === g} className={'p-seg__btn' + (f.gender === g ? ' is-active' : '')} onClick={() => set('gender')(g)}>{g}</button>)}
          </div>
          <div className="p-av__row">
            <Field label="Age" value={f.age} placeholder="Enter Age" inputMode="numeric" onChange={(v) => set('age')(v.replace(/\D/g, '').slice(0, 2))} />
            <Field label="Height" value={f.height} placeholder="Enter Height" suffix="cm" inputMode="numeric" onChange={(v) => set('height')(v.replace(/\D/g, '').slice(0, 3))} />
          </div>
          <h3>Playing Style</h3>
          <div className="p-av__positions">
            <small>Position</small>
            <div>{POSITIONS.map((p) => <button key={p} aria-pressed={f.position === p} className={'p-av__pill' + (f.position === p ? ' is-active' : '')} onClick={() => set('position')(p)}>{p}</button>)}</div>
          </div>
          {SLIDERS.map(([a, b], i) => (
            <div key={a} className="p-av__slider">
              <span><span>{a}</span><span>{b}</span></span>
              <input type="range" min="0" max="100" value={f.sliders[i]} aria-label={`${a} to ${b}`} style={{ '--v': f.sliders[i] + '%' }}
                onChange={(e) => setF((x) => ({ ...x, sliders: x.sliders.map((s, j) => (j === i ? +e.target.value : s)) }))} />
            </div>
          ))}
          <h3>Other</h3>
          <Field select label="League" value={f.league} placeholder="Select League" onTap={() => set('league')(f.league ? '' : SAMPLE.league)} />
          <Field select label="Team" value={f.team} placeholder="Select Team" onTap={() => set('team')(f.team ? '' : SAMPLE.team)} />
          <Field label="Jersey Number" value={f.jersey} placeholder="Enter Jersey Number" inputMode="numeric" onChange={(v) => set('jersey')(v.replace(/\D/g, '').slice(0, 2))} />
          <div className="p-av__actions">
            <button className={'p-btn p-av__reset' + (dirty ? '' : ' is-disabled')} disabled={!dirty} onClick={() => setF(EMPTY)}>Reset</button>
            <button className={'p-btn p-btn--primary' + (valid ? '' : ' is-disabled')} aria-disabled={!valid} onClick={save}>Save</button>
          </div>
        </div>
      </main>
      <AppBar active="none" />
    </div>
  );
}

// My Space / Play / Chat — 1252:160390 (full-screen overlay, X closes)
export function AvatarChat() {
  const nav = useNav();
  const tools = [['chat-gift', 'Gift'], ['chat-cut', 'Clip'], ['chat-edit', 'Edit'], ['chat-settings', 'Settings'], ['chat-pause', 'Pause'], ['chat-camoff', 'Camera off'], ['chat-swap', 'Switch'], ['chat-cc', 'Captions']];
  return (
    <div className="p-screen p-chat">
      {/* Figma fills this container with a video (1252:160424); the still is the poster while it loads */}
      <video className="p-chat__video" {...videoProps('assets/myspace/chat-avatar.mp4', 'assets/myspace/chat-avatar.webp')} autoPlay muted loop playsInline aria-hidden />
      <div className="p-chat__fade" />
      <div className="p-statusbar"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} /></div>
      <button className="p-chat__close" aria-label="Close chat" onClick={nav.back}><Icon name="close32" size={32} color="var(--colour-icon-primary)" /></button>
      <div className="p-chat__tools">
        {tools.map(([icon, label]) => <button key={icon} aria-label={label} onClick={nav.dead}><Icon name={icon} size={24} color="var(--colour-icon-white-overlay)" /></button>)}
      </div>
    </div>
  );
}
