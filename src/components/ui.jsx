// Prototype components rebuilt from the BitCore Mobile Component Library instances used in
// "Prototype (Real Betis) - 2nd Version". Comments carry the Figma component name.
import { useNav } from '../proto/runtime.jsx';
import { TABS, ASSET_SLOTS, COPY_FIELDS, JOURNEYS } from '../config/registry.js';
import { copyOf, fillCopy, getConfig } from '../config/store.js';
import { resolveMedia } from '../config/media.js';
import THEME_ASSETS from '../tokens/theme-assets.json';
import { themeText } from '../tokens/themeText.js';

const base = './';
// A shipped file a key slot also uses (e.g. the crest) follows that slot's upload, so one replace covers every spot.
export const PATH_SLOT = {};
ASSET_SLOTS.forEach((s) => { if (!PATH_SLOT[s.default]) PATH_SLOT[s.default] = s.id; });
/** Key under which Configure stores an upload for a shipped file. */
export const fileKey = (p) => PATH_SLOT[p] || '@' + p;
// Theme-specific photos (src/tokens/theme-assets.json): a theme mode can swap listed images for its
// own copies, e.g. Junior de Barranquilla (Light) shows Junior photos in the content cards. Resolved at render time.
const themeSets = Object.fromEntries(Object.entries(THEME_ASSETS).filter(([k]) => !k.startsWith('$')).map(([mode, t]) => [mode, { dir: t.dir, files: new Set(t.files) }]));
/** The file a shipped path shows under the selected theme (its own copy if the theme lists it). */
export const themedPath = (p, mode = getConfig().theme.mode) => {
  const t = themeSets[mode];
  const rel = p.startsWith('assets/') ? p.slice(7) : null;
  return t && rel && t.files.has(rel) ? t.dir + rel : p;
};
/** Theme text: under a theme with text rules (theme-text.json), swaps club/league words in screen copy. */
export const tx = (str) => themeText(getConfig().theme.mode, str);
/** "Real Betis" → "Betis", "Junior FC" → "Junior" (headlines that use the short club name). */
export const shortName = (team) => team.replace(/\s+(FC|CF|SC)$/i, '').split(' ').pop();
/** Club account name: "Real Betis" → "Real Betis FC", "Junior FC" stays "Junior FC". */
export const clubFC = (team) => (/\b(FC|CF|SC)$/i.test(team) ? team : `${team} FC`);
/** Every image and video goes through here. Order: Configure upload, then the theme's copy, then the shipped file. */
export const asset = (p) => { const o = getConfig().assets[fileKey(p)]; return o ? resolveMedia(o) : base + themedPath(p); };
export const isReplaced = (p) => !!getConfig().assets[fileKey(p)];
/** src + poster for a shipped video. A replaced video drops the old poster (it would flash the old first frame). */
/** Optional match video (Configure › Videos): no file ships; until one is uploaded every spot shows its still. */
export const MATCH_VIDEO = 'assets/watch/match.mp4';
/** Optional Clips View video (Configure › Videos), separate from the match video. */
export const CLIP_VIDEO = 'assets/home/clip.mp4';
export function MatchMedia({ still, className, style, video = MATCH_VIDEO }) {
  return isReplaced(video)
    ? <video className={className} style={style} src={asset(video)} poster={still} autoPlay muted loop playsInline aria-hidden />
    : <img className={className} style={style} src={still} alt="" />;
}
// Shipped stills that show match broadcast footage: they play the Live match video once one is uploaded.
const GAMEPLAY = ['assets/watch/player.webp', 'assets/watch/video-still.webp', 'assets/live/wp-video.webp', 'assets/live/up3.webp', 'assets/home/lr-3.webp'];
export const isGameplay = (url) => typeof url === 'string' && GAMEPLAY.some((p) => url.endsWith(p));
/** An <img>, unless it is a game-play still and a Live match video is uploaded: then that video plays in its place. */
export function StillOrMatch({ src, className, style }) {
  return isReplaced(MATCH_VIDEO) && isGameplay(src)
    ? <video className={className} style={style} src={asset(MATCH_VIDEO)} poster={src} autoPlay muted loop playsInline aria-hidden />
    : <img className={className} style={style} src={src} alt="" />;
}
export const videoProps = (p, poster) => ({ src: asset(p), poster: isReplaced(p) && !isReplaced(poster) ? undefined : asset(poster) });

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
  return resolveMedia(config.assets[id]) || asset(ASSET_SLOTS.find((s) => s.id === id)?.default || '');
}
// Fills {team} {full} {fans} {stadium} {tags} in hard-coded demo copy from the Configure copy fields.
export function useFill() { const { config } = useNav(); return (t) => themeText(config.theme.mode, fillCopy(config, t)); }
// True when Configure has an upload for this slot (lets a screen keep Figma's own crops until a client replaces the image).
export function useSlotOverride(id) { const { config } = useNav(); return resolveMedia(config.assets[id]) || null; }
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
  // A journey switched off in Configure hides its tab. A journey that's on hold (still being designed)
  // keeps its tab so the bar matches Figma's 5 items; tapping it says it's coming soon.
  const onHold = (t) => JOURNEYS.find((j) => j.id === t.journey)?.onHold;
  // A tab with `alt` (Community) stays when either journey is on and opens the first one that is.
  const on = (t) => nav.enabled(t.journey) || (t.alt && nav.enabled(t.alt.journey));
  const tabs = TABS.filter((t) => t.always || on(t) || onHold(t));
  const tap = (t) => { if (active === t.id) return; if (onHold(t)) return nav.notify('Coming soon'); nav.tab(nav.enabled(t.journey) || !t.alt ? t.screen : t.alt.screen); };
  return (
    <nav className="p-appbar">
      {tabs.map((t) => (
        <button key={t.id} className="p-appbar__item" aria-label={t.id} aria-current={active === t.id} onClick={() => tap(t)}>
          {/* Utility/Nav-Bar-Item: Selected = filled icon, Unselected = stroke icon */}
          <Icon name={active === t.id ? t.icon + '-fill' : t.icon} size={24} color={active === t.id ? 'var(--colour-icon-primary)' : 'var(--colour-icon-tertiary)'} />
        </button>
      ))}
    </nav>
  );
}

// Media/Horizontal Content List › Title
export function SectionTitle({ title, sub, action, onAction, count }) {
  return (
    <div className="p-sectiontitle">
      {sub ? <div className="p-sectiontitle__text"><h2 className="p-subtitle">{title}</h2><span>{sub}</span></div> : <h2 className="p-subtitle">{title}</h2>}
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

// Set by the Pre-game Stats module: open(opponent, tab) picks the match before navigating to it.
export const matchNav = { open: () => {} };

// Button/Main
const TRAIL = ['arrow-right', 'chevron-right'];
export function Button({ variant = 'primary', icon, iconAfter, children, onClick, block, disabled }) {
  const iconColor = { primary: 'var(--colour-icon-on-primary)', secondary: 'var(--colour-icon-on-secondary)', tertiary: 'var(--colour-icon-on-tertiary)' }[variant];
  return (
    // Trailing arrow/chevron: label centred on the button's full width, arrow pinned to the right padding.
    <button className={`p-btn p-btn--${variant}` + (block ? ' p-btn--block' : '') + (TRAIL.includes(iconAfter) ? ' p-btn--trail' : '')} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={18} color={iconColor} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={18} color={iconColor} />}
    </button>
  );
}

// sports/card/matches large
// result: finished game (date + score, Match Details / optional Replay). competition overrides the top line.
export function MatchCardLarge({ live, result, replay, competition, opponent, date = 'Jan 12, 2026', time = '14:00', score = '3 - 2', minute = '82’', onOpen, onDetails, onReplay, predict }) {
  const nav = useNav();
  const crest = useSlot('club-crest');
  const oppLogo = useSlot(opponent);
  const team = useCopy('team.main', 'Real Betis');
  const oppName = useCopy(opponent);
  const compDefault = useCopy('competition', '2025-2026 LaLiga · {team} · Group Stage');
  const comp = tx(competition || compDefault);
  // "Make Prediction" shows when the Predictions journey is on; it opens this match's Pre-game Stats on the Predictions tab.
  const predictions = nav.enabled('predictions');
  return (
    <article className={'p-matchcard' + (live ? ' is-live' : '')} onClick={onOpen} role={onOpen ? 'button' : undefined}>
      <div className="p-matchcard__top">{comp}</div>
      <div className="p-matchcard__content">
        <div className="p-matchcard__row">
          <div className="p-team"><img src={crest} alt="" /><span>{team}</span></div>
          <div className="p-infobox">
            {live ? <span className="p-live">LIVE</span> : <span className="p-infobox__date">{date}</span>}
            <span className="p-score">{live || result ? score : time}</span>
            {live && <span className="p-infobox__date">{minute}</span>}
          </div>
          <div className="p-team"><img src={oppLogo} alt="" /><span>{oppName}</span></div>
        </div>
        {result ? (
          <div className="p-matchcard__ctas">
            <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onDetails ? onDetails() : nav.dead(); }}>Match Details</Button>
            {replay && <Button variant="primary" icon="replay" onClick={(e) => { e.stopPropagation(); onReplay ? onReplay() : nav.go('live-player'); }}>Replay</Button>}
          </div>
        ) : live ? (
          <Button variant="primary" icon="play" block onClick={(e) => { e.stopPropagation(); nav.go('live-player'); }}>Watch Now</Button>
        ) : predictions ? (
          <Button variant="secondary" icon="predict" block onClick={(e) => { e.stopPropagation(); matchNav.open(opponent, 'predictions'); nav.go('pre-game-stats'); }}>Make Prediction</Button>
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
