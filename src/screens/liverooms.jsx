// Live Rooms — first layer (shares the Community app-bar tab; Live Rooms | Communities pills at the top).
// Calendar 763:42309 · Programs / Today 774:60610 · Programs / Future 833:144094 · Shows 798:35439.
// "Michael's Version" (833:142974) is intentionally not built. Tabs swap in place so Back doesn't replay them.
import { useState } from 'react';
import { Header, AppBar, SectionTitle, Icon, useCopy, useSlot, asset, StillOrMatch } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { LiveRoomCard, ConceptCard } from './home.jsx';

const img = (f) => asset(`assets/live/${f}`);

// Which overlay each room type opens. PK Battle cards open the Challenge Room (Figma links them to 795:42089).
export const ROOM_SCREEN = { Standard: 'live-room', 'Watch Party': 'watch-party', 'PK Battle': 'challenge-room' };

// The three live rooms shown on Calendar and Programs / Today (Card/Live)
export function useLiveRooms() {
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  return [
    { id: 'pena', photo: img('card1.webp'), room: 'Standard', viewers: '8.7k', host: 'Manolo Rodríguez', hostImg: img('host-manolo.webp'), title: 'Peña New York', h: 233 },
    { id: 'wp', photo: img('card2.webp'), room: 'Watch Party', viewers: '13.3K', host: 'Joaquín', hostImg: img('card2.webp'), title: 'Gordillo on the 1977 Copa', h: 226 },
    { id: 'pk', photo: img('card3.webp'), room: 'PK Battle', viewers: '13.3K', host: team, hostImg: crest, title: 'Player Knockout', h: 226 },
  ];
}

// Navigation/Sub (Live Rooms | Communities) + Navigation/Tab-Underline (Calendar | Programs | Shows)
function LiveTop({ tab }) {
  const nav = useNav();
  const tabs = [['calendar', 'Calendar', 'live-rooms'], ['programs', 'Programs', 'live-programs'], ['shows', 'Shows', 'live-shows']];
  const communities = () => (nav.enabled('community') ? nav.swap('community') : nav.notify('Not available in this demo'));
  return (
    <div className="p-lr__top">
      <div className="p-subnav">
        <button className="p-subnav__item p-lr__pill is-selected">Live Rooms</button>
        <button className="p-subnav__item p-lr__pill" onClick={communities}>Communities</button>
      </div>
      <div className="p-tabs p-tabs--start p-lr__tabs" role="tablist">
        {tabs.map(([id, label, screen]) => (
          <button key={id} role="tab" aria-selected={id === tab} className={'p-tabs__item' + (id === tab ? ' is-active' : '')} onClick={() => id !== tab && nav.swap(screen)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function LiveScreen({ tab, children }) {
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header />
      <main className="p-main"><div className="p-lr"><LiveTop tab={tab} />{children}</div></main>
      <AppBar active="community" />
    </div>
  );
}

function RoomCard({ r }) {
  const nav = useNav();
  return <LiveRoomCard {...r} plain={!r.border} onClick={() => nav.go(ROOM_SCREEN[r.room])} />;
}

// Calendar date picker — October 2026, 12 selected. Days with programmes show two dots (Program Legend).
const NO_DOTS = new Set([5, 10, 17, 18, 19, 20, 21, 22, 23]);
function Calendar() {
  const nav = useNav();
  const [sel, setSel] = useState(12);
  const weeks = [[27, 28, 29, 30, 1, 2, 3], [4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30, 31]];
  return (
    <div className="p-cal">
      <div className="p-cal__body">
        <div className="p-cal__month">
          <h2>October 2026</h2>
          <button aria-label="Previous month" onClick={nav.dead}><Icon name="chevron-right" size={24} style={{ transform: 'scaleX(-1)' }} /></button>
          <button aria-label="Next month" onClick={nav.dead}><Icon name="chevron-right" size={24} /></button>
        </div>
        <div className="p-cal__wk">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d}>{d}</span>)}</div>
        <div className="p-cal__dates">
          {weeks.map((w, wi) => (
            <div key={wi} className="p-cal__row">
              {w.map((d, di) => {
                const prev = wi === 0 && d > 7;
                const key = (prev ? 'p' : '') + d;
                const dots = prev ? d !== 30 : !NO_DOTS.has(d);
                const on = !prev && d === sel;
                return (
                  <button key={key} className={'p-cal__d' + (prev ? ' is-prev' : '') + (on ? ' is-sel' : '')} aria-pressed={on} onClick={() => (prev ? nav.dead() : setSel(d))}>
                    <span>{d}</span>
                    {dots && !on && <i className="p-cal__dots"><b /><b /></i>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="p-cal__legend"><span><b />Official</span><span><b />KOL</span><span><b className="is-post" />Post</span></div>
    </div>
  );
}

// Live Show / Calendar — 763:42309
export function LiveCalendar() {
  const nav = useNav();
  const rooms = useLiveRooms();
  return (
    <LiveScreen tab="calendar">
      <div className="p-lr__head">
        <span>All Rooms</span>
        {/* Start Room → Start a Room 638:19766 → filled 638:19779 → host view 638:19937 */}
        <button className="p-btn p-btn--primary" onClick={() => nav.go('live-start')}><Icon name="lr-startroom" size={18} color="var(--colour-icon-on-primary)" /><span>Start Room</span></button>
      </div>
      <Calendar />
      <div className="p-lr__cards">{rooms.map((r) => <RoomCard key={r.id} r={r} />)}</div>
    </LiveScreen>
  );
}

// Programs: livetv/date navigator. Figma's labels kept as designed (Today, then 10/12 …).
const DAYS = [['Mon', 'Today'], ['Wed', '10/12'], ['Thu', '10/14'], ['Fri', '10/15'], ['Sat', '10/16'], ['Sun', '10/18']];
// Reminder state per upcoming room; the first one is on in Figma (filled bell with white ring).
const reminders = [true, false, false];

function UpcomingCard({ i, photo, tag, tagStyle, onToggle, on }) {
  return (
    <div className="p-upcard">
      <div className="p-upcard__img">
        <StillOrMatch src={photo} />
        <span className={'p-upcard__tag' + (tagStyle ? ' is-' + tagStyle : '')}>{tag}</span>
        <button className={'p-upcard__bell' + (on ? ' is-on' : '')} aria-pressed={on} aria-label={on ? 'Reminder on' : 'Remind me'} onClick={() => onToggle(i)}>
          <Icon name={on ? 'lr-bell-fill' : 'lr-bell'} size={20} color="var(--colour-icon-white-overlay)" />
        </button>
      </div>
      <div className="p-upcard__desc"><b>Azeez Balogun from the Field</b><span>Oct 21 · 19:00</span></div>
    </div>
  );
}

// Live Show / Program / Today 774:60610 and / Future 833:144094
export function LivePrograms() {
  const nav = useNav();
  const rooms = useLiveRooms();
  const [day, setDay] = useState(0);
  const [rem, setRem] = useState([...reminders]);
  const toggle = (i) => {
    reminders[i] = !reminders[i];
    setRem([...reminders]);
    nav.notify(reminders[i] ? 'Reminder set' : 'Reminder removed');
  };
  const pick = (i) => (i < 2 ? setDay(i) : nav.dead());
  const up = [
    { photo: img('up1.webp'), tag: 'Standard Room' },
    { photo: img('up2.webp'), tag: 'Player Room' },
    { photo: img('up3.webp'), tag: 'Host Room', tagStyle: 'grey' },
  ];
  return (
    <LiveScreen tab="programs">
      <div className="p-datenav" role="tablist" aria-label="Day">
        {DAYS.map(([d, n], i) => (
          <button key={d} role="tab" aria-selected={i === day} className={'p-datenav__d' + (i === day ? ' is-sel' : '')} onClick={() => pick(i)}>
            <b>{d}</b><span>{n}</span><i className="p-cal__dots"><b /><b /></i>
          </button>
        ))}
      </div>
      <div className="p-upcoming">
        <div className="p-upcoming__date"><span>Oct</span><b>{day === 0 ? 11 : 12}</b></div>
        <div className="p-upcoming__list">
          {day === 0
            ? rooms.map((r) => <RoomCard key={r.id} r={r} />)
            : up.map((u, i) => <UpcomingCard key={i} i={i} {...u} on={rem[i]} onToggle={toggle} />)}
        </div>
      </div>
    </LiveScreen>
  );
}

// Live Show / Shows — 798:35439 (three Media/Horizontal Content List rows)
export function LiveShows() {
  const nav = useNav();
  const rows = [
    ['Reality', 'Unscripted daily life, filmed around the clock.'],
    ['Creator House', 'Shared houses, shared drama, weekly cuts.'],
    ['Creator Trip', 'Road formats with creators away from home.'],
  ];
  const cards = [
    { photo: img('show1.webp'), title: 'Pre-Match Media Day', sub: 'Aug 17 2026 • Press Conference' },
    { photo: img('show2.webp'), title: 'Tactical Talk', sub: 'Aug 17 2026 • Podcast' },
    { photo: img('show1.webp'), title: 'Pre-Match Media Day', sub: 'Aug 17 2026 • Press Conference' },
  ];
  return (
    <LiveScreen tab="shows">
      <div className="p-lr__shows">
        {rows.map(([t, s]) => (
          <section key={t}>
            <SectionTitle title={t} sub={s} action="All" onAction={nav.dead} />
            <div className="p-hscroll" style={{ gap: 10 }}>{cards.map((c, i) => <ConceptCard key={i} {...c} play onClick={nav.dead} onMore={nav.dead} />)}</div>
          </section>
        ))}
      </div>
    </LiveScreen>
  );
}
