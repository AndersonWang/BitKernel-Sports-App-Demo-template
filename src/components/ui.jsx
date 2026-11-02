// Prototype components rebuilt from the BitCore Mobile Component Library instances used in
// "Prototype (Real Betis) - 2nd Version". Comments carry the Figma component name.
import { useNav } from '../proto/runtime.jsx';
import { TABS, ASSET_SLOTS, COPY_FIELDS } from '../config/registry.js';
import { copyOf } from '../config/store.js';

const base = './';
export const asset = (p) => base + p;

// Icons are bundled as data URIs so masks also work when the zip is opened from file://
const ICONS = Object.fromEntries(Object.entries(import.meta.glob('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }))
  .map(([path, svg]) => [path.split('/').pop().replace('.svg', ''), `url("data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}")`]));

/** Mono icons are masks so their colour follows tokens instead of the hard-coded SVG fill. */
export function Icon({ name, size = 24, w, h, color = 'var(--colour-icon-primary)', style }) {
  const url = ICONS[name];
  return <span aria-hidden className="p-icon" style={{ width: w ?? size, height: h ?? size, background: color, WebkitMaskImage: url, maskImage: url, ...style }} />;
}

export function useSlot(id) {
  const { config } = useNav();
  return config.assets[id] || asset(ASSET_SLOTS.find((s) => s.id === id)?.default || '');
}
export function useCopy(id, fallback) { const { config } = useNav(); return copyOf(config, id, fallback ?? COPY_FIELDS.find((f) => f.id === id)?.default ?? ''); }

// Header/Web Mobile — status bar + Utility/Header Title Component
export function Header({ title, back, ctas = ['bell', 'search', 'profile'] }) {
  const nav = useNav();
  const crest = useSlot('club-crest');
  const ctaTarget = { bell: 'notifications', search: 'search', profile: 'myspace' };
  return (
    <header className="p-header">
      <div className="p-statusbar">
        <span>9:41</span>
        <Icon name="status-bar" w={65.272} h={12} />
      </div>
      <div className="p-titlebar">
        <div className="p-titlebar__lead">
          {back ? (
            <button className="p-backbtn" onClick={nav.back} aria-label="Back"><Icon name="back" size={24} /></button>
          ) : (
            <span className="p-crest32"><img src={crest} alt="" /></span>
          )}
          {title && <h1 className="p-title2">{title}</h1>}
        </div>
        <div className="p-ctas">
          {ctas.map((c) => (
            <button key={c} className="p-cta" aria-label={c} onClick={() => nav.go(ctaTarget[c])}>
              <Icon name={c} size={16} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// Navigation/App-Bar
export function AppBar({ active = 'home' }) {
  const nav = useNav();
  const tabs = TABS.filter((t) => t.always || nav.enabled(t.journey));
  return (
    <nav className="p-appbar">
      {tabs.map((t) => (
        <button key={t.id} className="p-appbar__item" aria-label={t.id} aria-current={active === t.id} onClick={() => (active === t.id ? null : nav.tab(t.screen))}>
          <Icon name={t.icon} size={24} color={active === t.id ? 'var(--colour-icon-primary)' : 'var(--colour-icon-tertiary)'} />
        </button>
      ))}
    </nav>
  );
}

// Media/Horizontal Content List › Title
export function SectionTitle({ title, action, onAction, count }) {
  return (
    <div className="p-sectiontitle">
      <h2 className="p-subtitle">{title}</h2>
      {action && (
        <button className="p-sectiontitle__action" onClick={onAction}>
          <span>{action}</span><Icon name="chevron-right" size={14} color="var(--colour-text-secondary)" />
        </button>
      )}
      {count != null && <span className="p-sectiontitle__count">Matches: <b>{count}</b></span>}
    </div>
  );
}

// Navigation/Sub
export function SubNav({ items, active, onSelect }) {
  return (
    <div className="p-subnav">
      {items.map((it) => (
        <button key={it.id} className={'p-subnav__item' + (it.id === active ? ' is-selected' : '')} onClick={() => onSelect(it)}>{it.label}</button>
      ))}
    </div>
  );
}

// Button/Main
export function Button({ variant = 'primary', icon, children, onClick, block }) {
  const iconColor = { primary: 'var(--colour-icon-on-primary)', secondary: 'var(--colour-icon-on-secondary)' }[variant];
  return (
    <button className={`p-btn p-btn--${variant}` + (block ? ' p-btn--block' : '')} onClick={onClick}>
      {icon && <Icon name={icon} size={18} color={iconColor} />}
      <span>{children}</span>
    </button>
  );
}

// sports/card/matches large
export function MatchCardLarge({ live, opponent, date = 'Jan 12, 2026', time = '14:00', score = '3 - 2', minute = '82’', onOpen }) {
  const nav = useNav();
  const crest = useSlot('club-crest');
  const oppLogo = useSlot(opponent);
  const team = useCopy('team.main', 'Real Betis');
  const oppName = useCopy(opponent);
  const comp = useCopy('competition', '2025-2026 LaLiga · {team} · Group Stage');
  const predictions = nav.enabled('predictions');
  return (
    <article className={'p-matchcard' + (live ? ' is-live' : '')} onClick={onOpen} role={onOpen ? 'button' : undefined}>
      <div className="p-matchcard__top">{comp}</div>
      <div className="p-matchcard__content">
        <div className="p-matchcard__row">
          <div className="p-team"><img src={crest} alt="" /><span>{team}</span></div>
          <div className="p-infobox">
            {live ? <span className="p-live">LIVE</span> : <span className="p-infobox__date">{date}</span>}
            <span className="p-score">{live ? score : time}</span>
            {live && <span className="p-infobox__date">{minute}</span>}
          </div>
          <div className="p-team"><img src={oppLogo} alt="" /><span>{oppName}</span></div>
        </div>
        {live ? (
          <Button variant="primary" icon="play" block onClick={(e) => { e.stopPropagation(); nav.go('live-player'); }}>Watch Now</Button>
        ) : predictions ? (
          <Button variant="secondary" icon="predict" block onClick={(e) => { e.stopPropagation(); nav.go('predictions'); }}>Make Prediction</Button>
        ) : null}
      </div>
    </article>
  );
}

/** Stand-in for a Figma section/screen that hasn't been coded yet. Same footprint as the frame. */
export function PendingBlock({ name, node, height }) {
  const nav = useNav();
  return (
    <div className="p-pending" style={{ height }} onClick={nav.dead}>
      <span>{nav.isClient ? 'Coming soon' : `Not built yet · ${name}`}</span>
      {!nav.isClient && <code>{node}</code>}
    </div>
  );
}
