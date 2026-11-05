// General Use — Notifications 1282:36974 · Search 1282:36986 · Settings 1334:38890.
// Every header bell / search button (Header ctas) opens these; Settings opens from My Space.
import { useState } from 'react';
import { Header, Icon, asset, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';

function Page({ title, children }) {
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back title={title} ctas={[]} />
      <main className="p-main">{children}</main>
    </div>
  );
}

// Card/Notification ×6 — Figma has no tap destination; the unread dot clears when tapped.
const unread = [true, true, true, true, true, true];
export function Notifications() {
  const [dots, setDots] = useState([...unread]);
  const read = (i) => { unread[i] = false; setDots([...unread]); };
  return (
    <Page title="Notifications">
      <ul className="p-notifs">
        {dots.map((on, i) => (
          <li key={i}>
            <button className="p-notif" onClick={() => read(i)}>
              <span className="p-notif__head"><span>20:00 14-07-2024</span><b>New Stream Alert</b></span>
              <span className="p-notif__row">
                <span className="p-notif__text">Don't miss "Galactic Explorers" and "Echoes of the Deep" premiering next Friday!</span>
                {on && <i className="p-notif__dot" aria-label="Unread" />}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Page>
  );
}

// Search — Input/Search Form + Trending (Card/Horizontal History ×3)
export function Search() {
  const nav = useNav();
  const [q, setQ] = useState('');
  const trend = ['trend-1.webp', 'trend-2.webp', 'trend-2.webp'];
  return (
    <Page title="Search">
      <div className="p-srch">
        <label className="p-srch__input">
          <Icon name="search" size={18} color="var(--colour-icon-primary)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." aria-label="Search" />
        </label>
        <section>
          <h2 className="p-srch__title">Trending</h2>
          <div className="p-srch__list">
            {trend.map((f, i) => (
              <button key={i} className="p-hist" onClick={nav.dead}>
                <span className="p-hist__cover">
                  <img src={asset(`assets/general/${f}`)} alt="" />
                  <span className="p-hist__play"><Icon name="play-solid" size={16.67} color="var(--colour-text-white-overlay)" /></span>
                </span>
                <span className="p-hist__name">{tx('Real Betis Podcast')}</span>
                <Icon name="chevron-right" size={18} color="var(--colour-icon-primary)" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}

// Settings — Utility/Settings: 4 groups of Menu/Narrow rows. No row has a Figma destination yet.
const GROUPS = [
  [['st-language', 'Language (English)']],
  [['st-link', 'Link Account'], ['st-card', 'Payment Method']],
  [['st-info', 'Version Details'], ['st-password', 'Change Password'], ['st-delete', 'Delete Account']],
  [['st-details', 'Terms of Service'], ['st-key', 'Privacy Policy'], ['st-details', '2257 / Records Custodian'], ['st-details', 'Anti-Trafficking policy'], ['st-email', 'Report an Issue'], ['st-contact', 'Contact Us']],
];
export function Settings() {
  const nav = useNav();
  return (
    <Page title="Settings">
      <div className="p-set">
        {GROUPS.map((g, gi) => (
          <div key={gi} className="p-set__group">
            {g.map(([icon, label]) => (
              <button key={label} className="p-set__row" onClick={nav.dead}>
                <Icon name={icon} size={20} color="var(--colour-icon-primary)" />
                <span className="p-set__label">{label}</span>
                <Icon name="chevron-right" size={16} color="var(--colour-icon-primary)" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </Page>
  );
}
