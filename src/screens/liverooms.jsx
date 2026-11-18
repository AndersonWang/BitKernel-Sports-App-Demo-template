// Live Rooms — first layer (shares the Community app-bar tab; Live Rooms | Communities pills at the top).
// Calendar 763:42309 · Programs / Today 774:60610 · Programs / Future 833:144094 · Shows 798:35439.
// "Michael's Version" (833:142974) is intentionally not built. Tabs swap in place so Back doesn't replay them.
import { useState } from 'react';
import { Header, AppBar, SectionTitle, Icon, useCopy, useSlot, asset, StillOrMatch, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { LiveRoomCard, ConceptCard } from './home.jsx';

const img = (f) => asset(`assets/live/${f}`);

// Which overlay each room type opens: PK Battle → Player Knockout (638:21605), Challenge → vote Challenge Room
// (795:42089). Each room's header shows the host of the card it was opened from (roomHost.js).
export const ROOM_SCREEN = { Standard: 'live-room', 'Watch Party': 'watch-party', 'PK Battle': 'pk-room', Challenge: 'challenge-room', 'Call-in': 'callin-room', Interactive: 'interactive-room', Mission: 'mission-room', 'Watch Hall': 'watch-hall', Personal: 'personal-pass' };
// Watch Hall → viewer room (798:27588); Watch Party → host-led replay (638:21603).

// The nine live rooms (Figma order) shown on Calendar and Programs / Today (Card/Live). Today's PK Battle card is a different
// show (Penalty Shootout Battle, 774:60610) from the Calendar's Player Knockout.
export function useLiveRooms(today = false) {
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  return [
    { id: 'pena', photo: img('card1.webp'), room: 'Standard', viewers: '8.7k', host: 'Manolo Rodríguez', hostImg: img('host-manolo.webp'), title: 'Pre-Match Talk: Lineups & Predictions', h: 233 },
    today
      ? { id: 'pk', photo: img('card3b.webp'), room: 'PK Battle', viewers: '13.3K', host: 'Mateo Ortega', hostImg: img('host-mateo.webp'), title: 'Penalty Shootout Battle', h: 226 }
      : { id: 'pk', photo: img('card3.webp'), room: 'PK Battle', viewers: '13.3K', host: team, hostImg: crest, title: 'Player Knockout: Back Your Player', h: 226 },
    { id: 'hall', photo: img('card8.webp'), room: 'Watch Hall', viewers: '21.4K', host: team, hostImg: crest, verified: true, title: 'Matchday Fan Zone: Big-Screen Watch-Along', h: 226 },
    { id: 'wp', photo: img('card2.webp'), room: 'Watch Party', viewers: '13.3K', host: 'Joaquín', hostImg: img('host-joaquin.webp'), title: 'Watch Party: Classic Final Replay', h: 226 },
    { id: 'challenge', photo: img('card4.webp'), room: 'Challenge', viewers: '13.3K', host: 'Lucía Navarro', hostImg: img('host-lucia.webp'), title: 'Crossbar Challenge: Who Hits More?', h: 226 },
    { id: 'callin', photo: img('card5.webp'), room: 'Call-in', viewers: '13.3K', host: 'Dani Morales', hostImg: img('host-dani.webp'), title: 'Post-Match Debate: Fans Call In', h: 226 },
    { id: 'interactive', photo: img('card6.webp'), room: 'Interactive', viewers: '13.3K', host: 'Leo Vargas', hostImg: img('host-leo.webp'), title: 'Career Mode Stream: Road to Glory', h: 226 },
    { id: 'mission', photo: img('card7.webp'), room: 'Mission', viewers: '13.3K', host: 'Dani Morales', hostImg: img('host-dani.webp'), title: 'Street Skills: Fan Missions', h: 226 },
    { id: 'personal', photo: img('card9.webp'), room: 'Personal', viewers: '3', host: 'Sofía Reyes', hostImg: img('host-sofia.webp'), title: 'Cloud Drive Rewatch: Last Season’s Cup Final', locked: true, h: 226 },
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

// Live Show / Calendar — 763:42309
export function LiveCalendar() {
  const nav = useNav();
  const rooms = useLiveRooms();
  const [day, setDay] = useState(0);
  return (
    <LiveScreen tab="calendar">
      <div className="p-lr__head">
        <span>All Rooms</span>
        {/* Start Room → Start a Room 638:19766 → filled 638:19779 → host view 638:19937 */}
        <button className="p-btn p-btn--primary" onClick={() => nav.go('live-start')}><Icon name="lr-startroom" size={18} color="var(--colour-icon-on-primary)" /><span>Start Room</span></button>
      </div>
      {/* Month grid (Calendar date picker 774:59612) replaced by the Programs date strip, per review comment */}
      <DateNav day={day} onPick={(i) => (i === 0 ? setDay(0) : nav.notify('Only today’s rooms are in this demo'))} />
      <div className="p-cal__legend"><span><b />Official</span><span><b />KOL</span><span><b className="is-post" />Post</span></div>
      <div className="p-lr__cards">{rooms.map((r) => <RoomCard key={r.id} r={r} />)}</div>
    </LiveScreen>
  );
}

// Programs: livetv/date navigator. Figma's labels kept as designed (Today, then 10/12 …).
const DAYS = [['Mon', 'Today'], ['Wed', '10/12'], ['Thu', '10/14'], ['Fri', '10/15'], ['Sat', '10/16'], ['Sun', '10/18']];
// Date strip (Programs' livetv/date navigator) — also used on Calendar, per review comment (17 Nov)
function DateNav({ day, onPick }) {
  return (
    <div className="p-datenav" role="tablist" aria-label="Day">
      {DAYS.map(([d, n], i) => (
        <button key={d} role="tab" aria-selected={i === day} className={'p-datenav__d' + (i === day ? ' is-sel' : '')} onClick={() => onPick(i)}>
          <b>{d}</b><span>{n}</span><i className="p-cal__dots"><b /><b /></i>
        </button>
      ))}
    </div>
  );
}

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
  const rooms = useLiveRooms(true);
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
      <DateNav day={day} onPick={pick} />
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
