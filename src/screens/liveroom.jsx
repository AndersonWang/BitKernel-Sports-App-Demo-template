// Live rooms (overlays: slide up from the bottom, X slides them back down).
// Live / Default 638:19792 (Peña New York) — side menu laid out as in the Figma flow, left → right:
//   Join → Join Co-Host 638:19820 → Leave → End Co-Host 638:19832
//   Gifts → Send Gifts sheet 638:19806 → gift picked 638:19813 → sent 638:19798 (rose)
//   Shop: merch bar appears 5 s in (638:19953) → Shop Drawer 638:20231 → Item Detail 638:20511
//         → Buy Now → Apple Pay 638:20535 → Order Confirmed 638:20561
//         → Add to Cart → Drawer with badge 638:20599 → Cart 638:20881 → Checkout
// Watch Party 638:21603 · Challenge Room 795:42089 → Selected 795:42135 → Result 795:42181
import { useEffect, useRef, useState } from 'react';
import { Icon, AppBar, useSlot, useCopy, asset, videoProps, tx, MatchMedia, themeStill, isChanged, MATCH_VIDEO } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { mySpace, fmt } from './myspace.jsx';
import { ApplePaySheet } from './wallet.jsx';
import { roomHost } from './roomHost.js';
import { MatchCanvas } from './matchsim.jsx';

// Live room background: the live-bg video (Figma fills Live / Default with it; the first frame is the poster).
// A theme without its own copy of the video ("stills" in theme-assets.json, e.g. Boca) shows a photo that fits
// the room instead of the Real Betis footage: Live / Default (fan room, opened from "Insights and Stories from the
// Field") uses that card's photo; your hosted room ("On the Pitch") uses an on-pitch photo.
const LIVE_BG = 'assets/live/live-bg.mp4';
function LiveBackground({ still }) {
  return themeStill(LIVE_BG)
    ? <img className="p-lv__bg" src={asset(still)} alt="" />
    : <video className="p-lv__bg" {...videoProps(LIVE_BG, 'assets/live/live-bg-poster.webp')} autoPlay muted loop playsInline aria-hidden />;
}

const img = (f) => asset(`assets/live/${f}`);
const W = 'var(--colour-icon-white-overlay)';

// ---- shared pieces -------------------------------------------------------

// Host shown in the room header: the card's host when opened from a live card, otherwise the Figma room's own.
// Crest-style images (club crest) are shown whole rather than cropped.
function useRoomHost(name, avatar, contain = false) {
  const [h] = useState(() => { const c = roomHost.next; roomHost.next = null; return c; });
  if (!h) return { name, avatar, contain };
  return { name: h.name, avatar: h.img, contain: h.img === avatar ? contain : /crest|club-av|\.png($|\?)/.test(h.img || '') };
}

// X slides the overlay back down, then returns to the screen underneath (same as Clips View)
function useClose() {
  const nav = useNav();
  const [closing, setClosing] = useState(false);
  return [closing, () => { if (closing) return; setClosing(true); setTimeout(nav.back, 260); }];
}

const Coin = ({ size = 12 }) => <img className="p-lv__coin" src={img('coin.png')} alt="" style={{ width: size, height: size }} />;

// Chat feed. New messages keep arriving so the room feels live; the newest sits at the bottom.
const SEED = [
  { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing!!' },
  { n: 'Mike2124', c: '#fb64b6', t: 'Let’s gooo' },
  { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' },
  { n: 'Jacky_Chen', c: '#c27aff', t: 'My favorite team!' },
  { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' },
  { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' },
  { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
];
const MORE = [
  { n: 'User156', c: '#fb64b6', t: 'Best stream ever!' }, { n: 'User725', c: '#51a2ff', t: 'You’re amazing!' },
  { n: 'User814', c: '#00d3f2', t: 'Keep going! 💪' }, { n: 'User765', c: '#fdc700', t: 'Love the energy!' },
  { n: 'User106', c: '#c27aff', t: 'Let’s go team!' }, { n: 'User180', c: '#fb64b6', t: 'This is incredible!' },
];
function useChat(seed = SEED, more = MORE) {
  const [msgs, setMsgs] = useState(seed);
  const i = useRef(0);
  const keep = Math.max(12, seed.length) - 1; // tall chat areas keep more lines
  useEffect(() => {
    if (!more) return undefined; // small rooms (Personal) bring their own chatter
    const t = setInterval(() => { setMsgs((m) => [...m.slice(-keep), more[i.current++ % more.length]]); }, 2600);
    return () => clearInterval(t);
  }, []);
  return [msgs, (m) => setMsgs((list) => [...list.slice(-keep), m])];
}

function ChatList({ msgs, h = 178 }) {
  return (
    <div className="p-lv__chat" style={{ height: h }} aria-live="polite">
      {msgs.map((m, k) => (
        m.sys ? <div key={k} className="p-lv__msg is-sys"><span className="p-lv__sys">{m.t}</span></div> : <div key={k} className="p-lv__msg">
          <b style={{ color: m.c }}>{m.n}</b>
          {m.tip ? (
            <span className="p-lv__tip">{m.label || 'Tipped'}
              {m.tip === 'coin' ? <><Coin size={14} /><em className="is-coin">{m.x}</em></> : <><img src={m.giftImg || img('rose.webp')} alt="" /><em>{m.x}</em></>}
            </span>
          ) : <span>{m.t}</span>}
        </div>
      ))}
    </div>
  );
}

function SideBar({ items }) {
  return (
    <div className="p-lv__side">
      {items.map((it) => (
        <button key={it.id} className="p-lv__sidebtn" aria-label={it.label} aria-pressed={it.pressed} onClick={it.onClick}>
          <Icon name={it.icon} size={24} color={W} />{it.text !== false && <span>{it.label}</span>}
        </button>
      ))}
    </div>
  );
}

// Input/Livestream-Chat Bar — type and send adds your message to the chat
function ChatBar({ onSend, onCrown }) {
  const nav = useNav();
  const me = useCopy('user.name');
  const [v, setV] = useState('');
  const send = () => { if (!v.trim()) return; onSend({ n: me, c: '#ffffff', t: v.trim() }); setV(''); };
  return (
    <div className="p-lv__bar">
      <label className="p-lv__input">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Chat or ask question..." aria-label="Chat message" />
        <button className="p-lv__send" aria-label="Send" onClick={send}><Icon name="lr-send" size={16} color="var(--colour-icon-on-primary)" /></button>
      </label>
      <button className="p-lv__crown" aria-label={onCrown ? 'Live Room Goals' : 'Membership'} onClick={onCrown || nav.dead}><Icon name="lr-crown" size={24} color="#1e1e1e" /></button>
    </div>
  );
}

// Header/Web Mobile, type=live: host pill + Follow/Following + X
// hearts: the viewer-side heart count next to the viewer count (BPD-6912, rooms designed from 12 Nov)
function LiveHeader({ name, avatar, contain, viewers = '13.3K', hearts, following: init = true, onClose, children }) {
  const [following, setFollowing] = useState(init);
  return (
    <div className="p-lv__head">
      <div className="p-statusbar p-statusbar--overlay"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color={W} /></div>
      <div className="p-lv__headrow">
        {children || (
          <div className="p-lv__host">
            <img src={avatar} alt="" style={contain ? { objectFit: 'contain' } : undefined} />
            <span className="p-lv__hostinfo"><b>{name}</b><span><Icon name="lr-users" size={12} color={W} />{viewers}{hearts && <><Icon name="lr-like" size={12} color={W} style={{ marginLeft: 6 }} />{hearts}</>}</span></span>
            <button className={'p-lv__follow' + (following ? '' : ' is-follow')} aria-pressed={following} onClick={() => setFollowing(!following)}>
              <Icon name={following ? 'lr-check' : 'add'} size={16} color={following ? 'var(--colour-brand-primary)' : 'var(--colour-text-on-primary)'} />{following ? 'Following' : 'Follow'}
            </button>
          </div>
        )}
        <button className="p-lv__x" aria-label="Close" onClick={onClose}><Icon name="lr-close" size={32} color={W} /></button>
      </div>
    </div>
  );
}

// ---- Send Gifts sheet (Modal/Send Gifts 638:19806 / 638:19813) ----------
const GIFTS = [10, 10, 10, 20, 20, 20, 50, 100, 100, 200, 200, 500, 500, 500, 600, 1000, 3000].map((p, i) => ({ id: i, price: p, get src() { return img(`gift-g${String(i + 1).padStart(2, '0')}.webp`); } })); // getters: Configure uploads apply without a reload
const QTY = [1, 5, 10, 50, 100, 1000];

// sides (PK rooms): [{ id, name, img, cls }] — who the gift backs; it's asked at the top of the sheet
function GiftSheet({ onClose, onSent, sides, side: side0 }) {
  const nav = useNav();
  const [side, setSide] = useState(side0 || sides?.[0]?.id);
  const [pick, setPick] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const send = () => {
    const g = GIFTS[pick];
    const cost = g.price * qty;
    if (cost > mySpace.tokens) return nav.notify('Not enough tokens');
    mySpace.tokens -= cost;
    onSent(g, qty, msg, side);
  };
  return (
    <div className="p-sheet p-lv__sheet" role="dialog" aria-modal="true" aria-label="Send Gifts">
      <button className="p-sheet__scrim is-clear" aria-label="Close" onClick={onClose} />
      <div className="p-sheet__panel p-gift">
        <div className="p-sheet__head"><h2>Send Gifts</h2><button aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <div className="p-gift__body">
          {sides && (
            <div className="p-pk__sides" role="radiogroup" aria-label="Back a player">
              {sides.map((x) => (
                <button key={x.id} role="radio" aria-checked={side === x.id} className={x.cls + (side === x.id ? ' is-sel' : '')} onClick={() => setSide(x.id)}>
                  <img src={x.img} alt="" /><span>{x.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className="p-gift__bal">
            <span>Token Balance: {fmt(mySpace.tokens)}</span>
            <button onClick={nav.dead}>Buy Tokens<Icon name="chevron-right" size={14} color="var(--colour-text-on-secondary)" /></button>
          </div>
          <div className="p-gift__grid" role="radiogroup" aria-label="Gifts">
            {GIFTS.map((g) => (
              <button key={g.id} role="radio" aria-checked={pick === g.id} className={'p-gift__card' + (pick === g.id ? ' is-sel' : '')} onClick={() => setPick(g.id)}>
                <img src={g.src} alt="" />
                <span><Coin />{g.price}</span>
              </button>
            ))}
          </div>
          <label className="p-gift__msg">
            <input maxLength={50} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Enter Message (Optional)" />
            <span>{msg.length}/50</span>
          </label>
          <div className="p-gift__qty" role="radiogroup" aria-label="Quantity">
            {QTY.map((q) => <button key={q} role="radio" aria-checked={qty === q} className={'p-pill' + (qty === q ? ' is-selected' : '')} onClick={() => setQty(q)}>{q}</button>)}
          </div>
        </div>
        <div className="p-gift__cta"><button className="p-btn p-btn--primary p-btn--block p-btn--lg" disabled={pick === null} onClick={send}><span>Send Now</span></button></div>
      </div>
    </div>
  );
}

// Gift sent (638:19798): the gift pops over the stream, then the room returns to default
function GiftBurst({ src }) {
  return <div className="p-lv__burst" aria-hidden="true"><img src={src} alt="" /></div>;
}

function useGifts(addMsg, pk) {
  const me = useCopy('user.name');
  const [sheet, setSheet] = useState(false);
  const [burst, setBurst] = useState(null);
  const onSent = (g, qty, msg, side) => {
    setSheet(false);
    pk?.onGift(side, g.price * qty);
    setBurst(g.src);
    setTimeout(() => setBurst(null), 1800);
    // Live/Chat Container (Nov): a gift shows as 'Gifted 🌹 x5', or carries its message in the pill ('I love this song! 🌹 x5')
    addMsg({ n: me, c: '#ffffff', tip: 'gift', label: msg.trim() || 'Gifted', giftImg: g.src, x: 'x' + qty });
  };
  const ui = <>{burst && <GiftBurst src={burst} />}{sheet && <GiftSheet onClose={() => setSheet(false)} onSent={onSent} sides={pk?.sides} side={pk?.side} />}</>;
  return [() => setSheet(true), ui];
}

// ---- Shop (merch bar → drawer → item / cart → Apple Pay → confirmation) --
const ITEMS = [
  { id: 'home', get name() { return tx('Real Betis Home Jersey'); }, price: 89.99, get thumb() { return img('jersey-1.webp'); } },
  { id: 'special', get name() { return tx('Real Betis Special Edition Jersey'); }, price: 89.99, get thumb() { return img('jersey-2.webp'); } },
  // crop: the shipped Betis away photo has a hanger and extra margin; a theme's or uploaded jersey is framed like the others
  { id: 'away', get name() { return tx('Real Betis Away Jersey'); }, price: 79.99, get thumb() { return img('jersey-3.webp'); }, get crop() { return !isChanged('assets/live/jersey-3.webp'); } },
];
const SHIPPING = 6;
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const shop = { merchShown: false, merchClosed: false, cart: null }; // survives closing/reopening the room

function MerchBar({ onBuy, onClose }) {
  const it = ITEMS[0];
  return (
    <div className="p-merch">
      <div className="p-merch__row">
        <img src={it.thumb} alt="" />
        <b>{it.name}</b>
        <span className="p-merch__price">{eur(it.price)}</span>
        <button className="p-merch__x" aria-label="Hide" onClick={onClose}><Icon name="lr-x16" size={16} color="var(--colour-text-secondary)" /></button>
      </div>
      <button className="p-btn p-btn--primary p-btn--block p-merch__buy" onClick={onBuy}><Icon name="lr-bag" size={18} color="var(--colour-icon-on-primary)" /><span>Buy Now</span></button>
    </div>
  );
}

function ShopDrawer({ onClose, onItem, onCart, count }) {
  const nav = useNav();
  const tabs = ['Jerseys', 'Jackets', 'Shorts', 'Accessories', 'Tickets'];
  return (
    <div className="p-sheet p-lv__sheet" role="dialog" aria-modal="true" aria-label="Shop">
      <button className="p-sheet__scrim" aria-label="Close" onClick={onClose} />
      <div className="p-sheet__panel p-shop">
        <div className="p-sheet__head">
          <button aria-label="Back" onClick={onClose}><Icon name="back" size={20} /></button>
          <h2>Shop</h2>
          <button className="p-shop__cart" aria-label={`Cart${count ? `, ${count} item` : ''}`} onClick={onCart}>
            <Icon name="lr-cart" size={25} />{count > 0 && <i>{count}</i>}
          </button>
        </div>
        <div className="p-shop__tabs" role="tablist">
          {tabs.map((t, i) => <button key={t} role="tab" aria-selected={i === 0} className={'p-tabs__item' + (i === 0 ? ' is-active' : '')} onClick={i ? nav.dead : undefined}>{t}</button>)}
        </div>
        <div className="p-shop__list">
          {ITEMS.map((it, i) => (
            <button key={it.id} className="p-shop__item" onClick={() => (i === 0 ? onItem() : nav.dead())}>
              <span className={'p-shop__thumb' + (it.crop ? ' is-crop' : '')}><img src={it.thumb} alt="" /></span>
              <span className="p-shop__text"><b>{it.name}</b><span>{eur(it.price)}</span></span>
              <Icon name="chevron-right" size={16} color="var(--colour-icon-tertiary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, onBack }) {
  return (
    <header className="p-header">
      <div className="p-statusbar"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} /></div>
      <div className="p-titlebar">
        <div className="p-titlebar__lead">
          {onBack && <button className="p-backbtn" onClick={onBack} aria-label="Back"><Icon name="back" size={24} /></button>}
          {title && <h1 className="p-title2">{title}</h1>}
        </div>
      </div>
    </header>
  );
}

// Live / Default / Shop Drawer / Item Detail Page — 638:20511
function ItemPage({ size, setSize, onBack, onBuy, onAdd }) {
  const it = ITEMS[0];
  return (
    <div className="p-lvpage">
      <PageHeader onBack={onBack} />
      <div className="p-lvpage__scroll">
        <div className="p-item__img"><img src={img('jersey-big.webp')} alt="" /><span className="p-item__dots" aria-hidden="true"><i className="is-on" /><i /><i /><i /><i /></span></div>
        <div className="p-item__title"><b>{it.name}</b><b>{eur(it.price)}</b></div>
        <div className="p-item__size">
          <span>Select Size</span>
          <div className="p-item__sizes" role="radiogroup" aria-label="Size">
            {['S', 'M', 'L', 'XL'].map((s) => <button key={s} role="radio" aria-checked={size === s} className={'p-pill' + (size === s ? ' is-selected' : '')} onClick={() => setSize(s)}>{s}</button>)}
          </div>
        </div>
      </div>
      <div className="p-item__ctas">
        <button className="p-btn p-btn--primary p-btn--block p-btn--lg" onClick={onBuy}><span>Buy Now</span></button>
        <button className="p-btn p-btn--secondary p-btn--block p-btn--lg" onClick={onAdd}><span>Add to Cart</span></button>
      </div>
    </div>
  );
}

// Live / Shop / Drawer / Cart — 638:20881
function CartPage({ cart, setQty, onBack, onCheckout }) {
  const it = ITEMS[0];
  const sub = it.price * cart.qty;
  return (
    <div className="p-lvpage">
      <PageHeader title="Cart" onBack={onBack} />
      <div className="p-lvpage__scroll">
        <div className="p-cart__item">
          <img src={it.thumb} alt="" />
          <div className="p-cart__info">
            <span><b>{it.name}</b><small>Size: {cart.size}</small></span>
            <span className="p-cart__row">
              <span>{eur(it.price)}</span>
              <span className="p-cart__qty">
                <button aria-label="Decrease" disabled={cart.qty <= 1} onClick={() => setQty(cart.qty - 1)}><Icon name="lr-minus" size={12} color="var(--colour-text-secondary)" /></button>
                <b aria-live="polite">{cart.qty}</b>
                <button aria-label="Increase" onClick={() => setQty(cart.qty + 1)}><Icon name="lr-plus" size={12} color="var(--colour-text-secondary)" /></button>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div className="p-cart__sum">
        <b className="p-cart__h">Order Summary</b>
        <div className="p-cart__lines"><span><i>Subtotal</i><i>{eur(sub)}</i></span><span><i>Shipping</i><i>{eur(SHIPPING)}</i></span></div>
        <div className="p-cart__total"><b>Total</b><b>{eur(sub + SHIPPING)}</b></div>
        <button className="p-btn p-btn--primary p-btn--block p-btn--lg" onClick={onCheckout}><span>Checkout</span></button>
      </div>
    </div>
  );
}

// Live / Default / Shop Drawer / Purchase Confirmation — 638:20561
function OrderPage({ order, onDone }) {
  const it = ITEMS[0];
  const sub = it.price * order.qty;
  return (
    <div className="p-lvpage">
      <PageHeader />
      <div className="p-lvpage__scroll p-order">
        <div className="p-order__head">
          <img src={asset('assets/fixtures/success.svg')} alt="" />
          <h2>Order Confirmed!</h2>
          <p>Thanks for your purchase.<br />You can continue watching the livestream.</p>
        </div>
        <div className="p-order__card">
          <div className="p-order__top">
            <span>Order Summary</span>
            <div className="p-order__item"><img src={it.thumb} alt="" /><span><b>{it.name}</b><small>Size: {order.size}{order.qty > 1 ? ` · Qty ${order.qty}` : ''}</small></span><i>{eur(sub)}</i></div>
          </div>
          <div className="p-order__lines"><span><i>Subtotal</i><i>{eur(sub)}</i></span><span><i>Shipping</i><i>{eur(SHIPPING)}</i></span></div>
          <div className="p-order__total"><b>Total</b><i>{eur(sub + SHIPPING)}</i></div>
        </div>
      </div>
      <div className="p-order__cta"><button className="p-btn p-btn--primary p-btn--block p-btn--lg" onClick={onDone}><span>Back to Livestream</span></button></div>
    </div>
  );
}

function useShop() {
  const [merch, setMerch] = useState(shop.merchShown && !shop.merchClosed);
  const [drawer, setDrawer] = useState(false);
  const [page, setPage] = useState(null); // 'item' | 'cart' | 'order'
  const [pay, setPay] = useState(null); // { qty, size } while Apple Pay is up
  const [order, setOrder] = useState(null);
  const [size, setSize] = useState('S');
  const [cart, setCart] = useState(shop.cart);
  // The merch option slides in 5 seconds into the live
  useEffect(() => {
    if (shop.merchShown || shop.merchClosed) return;
    const t = setTimeout(() => { shop.merchShown = true; setMerch(true); }, 5000);
    return () => clearTimeout(t);
  }, []);
  const saveCart = (c) => { shop.cart = c; setCart(c); };
  const api = {
    merch,
    closeMerch: () => { shop.merchClosed = true; setMerch(false); },
    openDrawer: () => setDrawer(true),
  };
  const ui = (
    <>
      {drawer && !page && <ShopDrawer count={cart ? cart.qty : 0} onClose={() => setDrawer(false)} onItem={() => setPage('item')} onCart={() => (cart ? setPage('cart') : null)} />}
      {page === 'item' && <ItemPage size={size} setSize={setSize} onBack={() => setPage(null)} onBuy={() => setPay({ qty: 1, size })} onAdd={() => { saveCart({ size, qty: (cart?.qty || 0) + 1 }); setPage(null); }} />}
      {page === 'cart' && cart && <CartPage cart={cart} setQty={(q) => saveCart({ ...cart, qty: q })} onBack={() => setPage(null)} onCheckout={() => setPay({ ...cart, fromCart: true })} />}
      {page === 'order' && order && <OrderPage order={order} onDone={() => { setPage(null); setDrawer(false); setOrder(null); }} />}
      {pay && <ApplePaySheet pack={{ price: eur(ITEMS[0].price * pay.qty + SHIPPING) }} onClose={() => setPay(null)} onConfirm={() => { setOrder(pay); if (pay.fromCart) saveCart(null); setPay(null); setPage('order'); }} />}
    </>
  );
  return [api, ui];
}

// ---- Co-host (Join → Join Co-Host 638:19820 → Leave → End Co-Host 638:19832)
function CoHostToolbar({ onLeave, onMute }) {
  const [mute, setMute] = useState(false);
  useEffect(() => { onMute?.(mute); }, [mute]); // eslint-disable-line react-hooks/exhaustive-deps
  const [cam, setCam] = useState(true);
  const nav = useNav();
  const b = [
    { id: 'mic', icon: 'lr-mic', label: mute ? 'Unmute' : 'Mute', on: () => setMute(!mute), pressed: mute },
    { id: 'cam', icon: 'lr-cam', label: cam ? 'Cam Off' : 'Cam On', on: () => setCam(!cam), pressed: !cam },
    { id: 'leave', icon: 'lr-leave', label: 'Leave', on: onLeave },
    { id: 'manage', icon: 'settings', label: 'Manage', on: nav.dead },
  ];
  return (
    <div className="p-cohost__tools">
      {b.map((x) => <button key={x.id} aria-pressed={x.pressed} onClick={x.on}><Icon name={x.icon} size={20} color={W} /><span>{x.label}</span></button>)}
    </div>
  );
}

function EndCoHost({ onCancel, onEnd }) {
  return (
    <div className="p-modal" role="alertdialog" aria-modal="true" aria-labelledby="lv-end-title">
      <button className="p-sheet__scrim" aria-label="Cancel" onClick={onCancel} />
      <div className="p-endpop">
        <h2 id="lv-end-title">End Co-Host?</h2>
        <p>This will end the co-host session. The Live will continue.</p>
        <div className="p-endpop__ctas">
          <button className="p-btn p-btn--secondary" onClick={onCancel}><span>Cancel</span></button>
          <button className="p-btn p-btn--primary" autoFocus onClick={onEnd}><span>End Now</span></button>
        </div>
      </div>
    </div>
  );
}

// ---- Live / Default — Peña New York ---------------------------------------
export function LiveRoom() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const [closing, close] = useClose();
  const [msgs, addMsg] = useChat();
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [s, shopUI] = useShop();
  const host = useRoomHost(team, crest, true);
  const [mode, setMode] = useState('live'); // 'live' | 'cohost' | 'ending'
  const [liked, setLiked] = useState(false);
  const like = { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => setLiked(!liked), pressed: liked };
  const gift = { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts };
  const more = { id: 'more', icon: 'more', label: 'More', onClick: nav.dead };
  const cohost = mode !== 'live';
  return (
    <div className={'p-screen p-lv' + (cohost ? ' is-cohost' : '') + (closing ? ' is-closing' : '')}>
      {mode === 'cohost'
        ? <div className="p-cohost__cams"><img src={img('cohost-t.webp')} alt="" /><img src={img('cohost-b.webp')} alt="" /></div>
        // Figma fills Live / Default with a video (6.5 s, exported from the frame's timeline); the first frame is the poster
        : <LiveBackground still="assets/home/liveroom-1.webp" />}
      <LiveHeader {...host} hearts="22.1K" onClose={close} />
      <div className="p-lv__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} />
          <SideBar items={cohost ? [like, gift, more] : [{ id: 'join', icon: 'lr-join', label: 'Join', onClick: () => setMode('cohost') }, like, gift, { id: 'share', icon: 'lr-share', label: 'Share', onClick: nav.dead }, more]} />
        </div>
        {cohost
          ? <CoHostToolbar onLeave={() => setMode('ending')} />
          : <>{s.merch && <MerchBar onBuy={s.openDrawer} onClose={s.closeMerch} />}<ChatBar onSend={addMsg} /></>}
      </div>
      {mode === 'ending' && <EndCoHost onCancel={() => setMode('cohost')} onEnd={() => setMode('live')} />}
      {giftsUI}
      {!cohost && shopUI}
    </div>
  );
}

// ---- Watch Hall — viewer side 798:27588 (Watch Hall cards). Watch Party (host-led replay, 638:21603) is WatchPartyRoom below
export function WatchParty() {
  const nav = useNav();
  const [closing, close] = useClose();
  // Chat: the first 15 messages fill the 364px chat area (as in Figma).
  const [msgs, addMsg] = useChat([
    { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing!!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Let’s goooo' }, { n: 'Jacky_Chen', c: '#c27aff', t: 'Great game!' },
    { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' }, { n: 'User156', c: '#fb64b6', t: 'Best stream ever!' },
    { n: 'User725', c: '#ff8904', t: 'You’re amazing!' }, { n: 'User814', c: '#c27aff', t: 'Keep going! 💪' }, { n: 'User765', c: '#51a2ff', t: 'Love the energy!' },
    { n: 'User106', c: '#00d3f2', t: 'Let’s go team! 💪' }, { n: 'User653', c: '#ff8904', t: 'Love the energy!' }, { n: 'User750', c: '#fdc700', t: 'Love the energy!' },
    { n: 'User180', c: '#fb64b6', t: 'This is incredible!' }, { n: 'User476', c: '#fb64b6', t: 'Love the energy!' }, { n: 'User242', c: '#ff637e', t: 'This is incredible!' },
  ]);
  const host = useRoomHost('Joaquín', img('card2.webp'));
  const team = useCopy('team.main'); const opp = useCopy('opponent-1');
  const abbr = (n) => (String(n).trim().split(/\s+/).pop() || '').slice(0, 3).toUpperCase();
  // Live match state for the score bug; goals come from the simulated match
  const [score, setScore] = useState({ home: 1, away: 0 });
  const [goal, setGoal] = useState(null);
  const [floats, setFloats] = useState([]);
  const [t0] = useState(() => Date.now() - (63 * 60 + 12) * 1000);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const mins = Math.floor((Date.now() - t0) / 1000);
  const floatUp = (n = 1, kind = 'heart') => {
    const add = Array.from({ length: n }, (_, k) => ({ id: Math.random().toString(36).slice(2), kind, d: (Math.random() - 0.5) * 40, delay: k * 90 }));
    setFloats((f) => [...f.slice(-24), ...add]);
    setTimeout(() => setFloats((f) => f.filter((x) => !add.includes(x))), 2200 + n * 90);
  };
  const onGoal = (side) => {
    setScore((sc) => ({ ...sc, [side]: sc[side] + 1 }));
    setGoal({ side, k: Date.now() });
    setTimeout(() => setGoal(null), 2800);
    floatUp(10, 'ball');
    const who = side === 'home' ? team : opp;
    [['Sarah Lnd', '#51a2ff', 'GOOOOL ⚽⚽⚽'], ['Mike2124', '#fb64b6', side === 'home' ? `VAMOS ${abbr(team)}!!` : 'Noooo 😩'], ['User814', '#c27aff', 'What a finish 🔥'], ['Jacky_Chen', '#00d3f2', `${who} scores!`]]
      .forEach(([n, c, t], k) => setTimeout(() => addMsg({ n, c, t }), 300 + k * 450));
  };
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [liked, setLiked] = useState(false);
  // Viewer side (Watch Hall 798:27588): host pill, Like / Gifts / More
  const side = [
    { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => { setLiked(true); floatUp(3); }, pressed: liked },
    { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts },
    { id: 'more', icon: 'more', label: 'More', onClick: nav.dead },
  ];
  return (
    <div className={'p-screen p-lv p-wp' + (closing ? ' is-closing' : '')}>
      <LiveHeader {...host} hearts="22.1K" following={false} onClose={close} />
      <div className="p-wp__video">
        {/* A generic match drawn live (matchsim.jsx); an uploaded Live match video (Configure) takes its place */}
        {isChanged(MATCH_VIDEO) ? <video src={asset(MATCH_VIDEO)} autoPlay muted loop playsInline aria-hidden /> : <MatchCanvas className="p-wp__canvas" onGoal={onGoal} />}
        <span className="p-wp__bug" aria-label={`${team} ${score.home}, ${opp} ${score.away}, ${Math.floor(mins / 60)} minutes`}>
          <i className="p-wp__kit is-home" /><b>{abbr(team)}</b><em>{score.home}–{score.away}</em><b>{abbr(opp)}</b><i className="p-wp__kit is-away" /><small>{String(Math.floor(mins / 60)).padStart(2, '0')}:{String(mins % 60).padStart(2, '0')}</small>
        </span>
        <span className="p-ir__live p-wp__live"><i />LIVE</span>
        {goal && <b key={goal.k} className="p-wp__goal">GOAL!<small>{goal.side === 'home' ? team : opp}</small></b>}
        {/* No play / pause / skip: a Watch Party is live, so there's nothing to pause or rewind */}
        <div className="p-wp__vod"><span>{String(Math.floor(mins / 60)).padStart(2, '0')}:{String(mins % 60).padStart(2, '0')}</span><div className="p-vod p-wp__live-bar"><i className="p-vod__done" style={{ width: Math.min(96, (mins / 5400) * 100) + '%' }} /><i className="p-vod__knob" style={{ left: `calc(${Math.min(96, (mins / 5400) * 100)}% - 2px)` }} /><i className="p-vod__rest" /></div><span>90:00</span></div>
        <div className="p-wp__icons">
          {[['volume', 'Volume'], ['captions', 'Captions'], ['settings', 'Settings']].map(([i, l]) => <button key={i} aria-label={l} onClick={nav.dead}><Icon name={i} size={24} color={W} /></button>)}
          <button aria-label="Full screen" onClick={nav.dead}><img src={asset('assets/watch/rotate-phone.svg')} alt="" width="24" height="24" /></button>
        </div>
      </div>
      <div className="p-lv__bottom p-wp__bottom">
        <div className="p-lv__row"><ChatList msgs={msgs} h={364} /><SideBar items={side} /></div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-wp__floats" aria-hidden="true">{floats.map((f) => <i key={f.id} className={'is-' + f.kind} style={{ '--d': f.d + 'px', animationDelay: f.delay + 'ms', backgroundImage: f.kind === 'ball' ? `url("${img('gift-g06.webp')}")` : undefined }} />)}</span>
      <span className="p-homebar" aria-hidden="true" />
      {giftsUI}
    </div>
  );
}

// ---- Challenge Room — 795:42089 Options → 795:42135 Selected → 795:42181 Result, played live
// Crossbar Challenge: each contestant gets 5 attempts at the crossbar, taken in turn; hits are counted on stage.
// The crowd's side vote follows the Polls & Vote PRD (BPD-7128, LR-PV-F6): two standing support buttons — tap a side
// to support it, tap the other to switch, tap yours again to withdraw. Free, never touches likes or gifts, opens with
// the challenge and settles with it. One contestant briefly drops mid-challenge to show the PRD's left state: their
// count freezes and their button is disabled until they're back. Demo-compressed: 5 + 5 attempts, about a minute.
const CH = { intro: 3, shots: 5, every: 4.2, result: 10, dropAt: 4, dropFor: 7 };
const CH_SIDES = [
  { id: 'a', name: 'Andrew Chavez', short: 'Andrew', cls: 'is-a', get img() { return img('av-andrew.webp'); } },
  { id: 'b', name: 'Lucas Veríssimo', short: 'Lucas', cls: 'is-b', get img() { return img('av-lucas.webp'); } },
];
const CH_MISS = ['Over the bar', 'Wide', 'Under the bar', 'Off the post'];
export function ChallengeRoom() {
  const host = useRoomHost('Lucía Navarro', img('host-lucia.webp'));
  const [closing, close] = useClose();
  const nav = useNav();
  const [msgs, addMsg] = useChat([
    { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing kick!!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Let’s goo' }, { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' },
    { n: 'Jacky_Chen', c: '#c27aff', t: 'Very nice!!' }, { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' }, { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
  ]);
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [liked, setLiked] = useState(false);
  const [phase, setPhase] = useState('intro'); // intro | live | result
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const [shots, setShots] = useState({ a: [], b: [] }); // true = hit
  const [flash, setFlash] = useState(null); // { side, hit, text, k }
  const [votes, setVotes] = useState({ a: 0, b: 0 });
  const [mine, setMine] = useState(null);
  const bias = useRef(0.5);
  const elapsed = (now - t0) / 1000;
  const total = CH.shots * 2;
  const taken = shots.a.length + shots.b.length;
  // Lucas drops after his 4th-ish attempt window, then reconnects
  const dropT = CH.dropAt * 2 * CH.every;
  const liveLeftOf = (e) => Math.max(0, Math.ceil(total * CH.every + 1 - e));
  const away = phase === 'live' && elapsed > dropT && elapsed < dropT + CH.dropFor ? 'b' : null;
  // The challenge clock holds while a contestant is away (attempts wait for them)
  const eff = phase === 'live' ? elapsed - Math.min(CH.dropFor, Math.max(0, elapsed - dropT)) : elapsed;
  const liveLeft = liveLeftOf(eff);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(t); }, []);
  // Phases + attempts on one clock
  useEffect(() => {
    if (phase === 'intro' && elapsed >= CH.intro) { setPhase('live'); setT0(Date.now()); addMsg({ sys: true, t: '🎯 Crossbar Challenge is live — 5 shots each. Back a player below, it’s free.' }); return; }
    if (phase === 'live') {
      const due = Math.min(total, Math.floor(eff / CH.every));
      if (away) return; // the challenge waits for the contestant to come back
      if (due > taken) {
        const side = taken % 2 === 0 ? 'a' : 'b';
        const hit = Math.random() < (side === 'a' ? 0.5 : 0.48);
        setShots((sh) => ({ ...sh, [side]: [...sh[side], hit] }));
        setFlash({ side, hit, text: hit ? 'CROSSBAR!' : pick(CH_MISS), k: taken });
        setTimeout(() => setFlash((f) => (f && f.k === taken ? null : f)), 1600);
      } else if (taken >= total && eff >= total * CH.every + 1) {
        setPhase('result'); setT0(Date.now());
        const ha = shots.a.filter(Boolean).length; const hb = shots.b.filter(Boolean).length;
        const tv = votes.a + votes.b; const pa = tv ? Math.round((votes.a / tv) * 100) : 50;
        const crowd = votes.a === votes.b ? 'split 50–50' : `${votes.a > votes.b ? 'Andrew' : 'Lucas'} ${votes.a > votes.b ? pa : 100 - pa}%`;
        addMsg({ sys: true, t: `🏁 Challenge over · ${ha === hb ? `Level on ${ha} hits` : `${ha > hb ? 'Andrew' : 'Lucas'} wins ${Math.max(ha, hb)}–${Math.min(ha, hb)} on crossbar hits`} · Crowd: ${crowd}` });
      }
    }
    if (phase === 'result' && elapsed >= CH.result) {
      setShots({ a: [], b: [] }); setVotes({ a: 0, b: 0 }); setMine(null); setFlash(null); bias.current = 0.5;
      setPhase('intro'); setT0(Date.now()); addMsg({ sys: true, t: '🔁 New challenge — support resets.' });
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps
  // The crowd keeps voting while the challenge is open; a side that's away is frozen
  useEffect(() => {
    if (phase !== 'live') return undefined;
    const t = setInterval(() => {
      bias.current = Math.min(0.68, Math.max(0.32, bias.current + (Math.random() - 0.5) * 0.12));
      setVotes((v) => ({ a: v.a + (Math.random() < bias.current ? 1 + Math.floor(Math.random() * 3) : 0), b: away === 'b' ? v.b : v.b + (Math.random() > bias.current ? 1 + Math.floor(Math.random() * 3) : 0) }));
    }, 650);
    return () => clearInterval(t);
  }, [phase, away]);
  const support = (side) => {
    if (phase !== 'live') return nav.notify(phase === 'intro' ? 'Voting opens when the challenge starts' : 'This challenge has ended');
    if (side === away) return;
    setVotes((v) => {
      const n = { ...v };
      if (mine) n[mine] -= 1;
      if (mine !== side) n[side] += 1;
      return n;
    });
    setMine(mine === side ? null : side);
  };
  const tv = votes.a + votes.b;
  const pct = (x) => (tv ? Math.round((votes[x] / tv) * 100) : 0);
  const hits = (x) => shots[x].filter(Boolean).length;
  const nextSide = phase === 'live' && taken < total ? (taken % 2 === 0 ? 'a' : 'b') : null;
  const winner = phase === 'result' ? (hits('a') === hits('b') ? 'draw' : hits('a') > hits('b') ? 'a' : 'b') : null;
  const clock = phase === 'intro' ? mmss2(Math.ceil(total * CH.every + 1)) : phase === 'result' ? 'FT' : mmss2(liveLeft);
  return (
    <div className={'p-screen p-lv p-ch is-' + phase + (closing ? ' is-closing' : '')}>
      <LiveHeader {...host} hearts="22.1K" following={false} onClose={close} />
      <div className="p-ch__media">
        {CH_SIDES.map((x, i) => (
          <div key={x.id} className={'p-ch__half ' + x.cls + (nextSide === x.id ? ' is-up' : '') + (away === x.id ? ' is-away' : '') + (winner === x.id ? ' is-win' : winner && winner !== 'draw' ? ' is-lose' : '')}>
            <video {...videoProps(`assets/live/ch-${i ? 'b' : 'a'}.mp4`, `assets/live/ch-${i ? 'b' : 'a'}.webp`)} autoPlay muted loop playsInline aria-hidden />
            <span className="p-ch__shots" aria-label={`${x.name}: ${hits(x.id)} hits from ${shots[x.id].length} of ${CH.shots} shots`}>
              {Array.from({ length: CH.shots }, (_, k) => <i key={k} className={k < shots[x.id].length ? (shots[x.id][k] ? 'is-hit' : 'is-miss') : ''} />)}
              <b>{hits(x.id)}</b>
            </span>
            {nextSide === x.id && !flash && away !== x.id && <em className="p-ch__up">On the spot</em>}
            {flash && flash.side === x.id && <b key={flash.k} className={'p-ch__flash' + (flash.hit ? ' is-hit' : '')}>{flash.text}</b>}
            {away === x.id && <span className="p-ch__away"><i />Reconnecting…</span>}
            {winner && <span className={'p-pk__stamp' + (winner === 'draw' ? ' is-draw' : winner === x.id ? ' is-win' : ' is-lose')}>{winner === 'draw' ? 'LEVEL' : winner === x.id ? <><img src={img('gift-g05.webp')} alt="" />WIN</> : 'LOSE'}</span>}
            <span className={'p-ch__tag ' + x.cls}><img src={x.img} alt="" />{x.name}</span>
          </div>
        ))}
        <span className={'p-ch__timer' + (phase === 'live' && liveLeft <= 10 ? ' is-final' : '')}><Icon name="replay" size={14} color={W} />{clock}</span>
        {phase === 'intro' && <span className="p-pk__kick"><small>CHALLENGE STARTS IN</small><b key={Math.ceil(CH.intro - elapsed)}>{Math.max(1, Math.ceil(CH.intro - elapsed))}</b></span>}
      </div>
      <div className="p-ch__vote">
        <div className="p-ch__q"><b>Who’s the better kicker?</b><small>{phase === 'result' ? 'Final' : phase === 'live' ? `Live · ${tv} votes` : 'Opens at kick-off'}</small></div>
        {mine || phase === 'result' ? (
          <div className="p-ch__bars" role="radiogroup" aria-label="Support a player">
            {CH_SIDES.map((x) => (
              <button key={x.id} role="radio" aria-checked={mine === x.id} disabled={phase !== 'live' || away === x.id} className={'p-ch__bar ' + x.cls + (mine === x.id ? ' is-mine' : '') + (away === x.id ? ' is-away' : '')} onClick={() => support(x.id)}>
                <i style={{ width: pct(x.id) + '%' }} /><b>{x.short}{mine === x.id && <Icon name="lr-check" size={12} color={W} />}</b><span><small>{away === x.id ? 'Left · frozen' : `${votes[x.id]} votes`}</small><b>{pct(x.id)}%</b></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-ch__opts" role="radiogroup" aria-label="Support a player">
            {CH_SIDES.map((x) => <button key={x.id} role="radio" aria-checked={false} disabled={phase !== 'live' || away === x.id} className={away === x.id ? 'is-away' : ''} onClick={() => support(x.id)}>{x.short}{away === x.id && <small> · away</small>}</button>)}
          </div>
        )}
        {mine && phase === 'live' && <p className="p-ch__hint">Tap {CH_SIDES.find((x) => x.id === mine).short} again to withdraw · Free</p>}
      </div>
      <div className="p-lv__bottom p-ch__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} />
          <SideBar items={[{ id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => setLiked(!liked), pressed: liked }, { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts }, { id: 'more', icon: 'more', label: 'More', onClick: nav.dead }]} />
        </div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-homebar" aria-hidden="true" />
      {giftsUI}
    </div>
  );
}

// ---- Player Knockout — 638:21605, played as a live PK battle (PRD: BPD-7127 LR-PK-F3…F6; TikTok LIVE Match as precedent)
// Phases: kick-off (3·2·1) → battle (server-style countdown; demo runs 60 s, the PRD allows 3, 5 or 10 min) → full time
// (scores freeze, WIN/LOSE, punishment posts in chat) → rematch starts fresh. Score = gift tokens × 10 + likes × 1.
// Other viewers' gifts and likes are simulated so the bar moves; tapping a half sends likes to that side (capped 5/s,
// 300 per battle; over-cap taps still animate but score nothing). One short stretch shows the PRD's "score delayed"
// state: the last known scores hold, then catch up — never extrapolated.
const PK_SIDES = [
  { id: 'a', name: 'Andrew Chavez', short: 'Andrew', cls: 'is-a', get img() { return img('av-andrew.webp'); } },
  { id: 'b', name: 'Lucas Veríssimo', short: 'Lucas', cls: 'is-b', get img() { return img('av-lucas.webp'); } },
];
const RINGS = ['#fff7cc', '#eef2f3', '#b89c93']; // gold, silver, bronze — rank 1 sits nearest the middle
const PK = { intro: 3, battle: 60, result: 9, staleAt: 34, staleFor: 3 };
const PK_PUNISHMENT = '10 weak-foot keepie-uppies live on stream';
// Simulated viewers backing each side (gift icons are the shipped soccer gifts: ball, whistle, trophy, goal, red card…)
const PK_FANS = {
  a: [['Tito_Verdi', 'pk-fan1.webp'], ['Sevilla_Ana', 'pk-fan2.webp'], ['Rubén.10', 'pk-fan3.webp'], ['Mari_B', 'pk-fan2.webp']],
  b: [['Lu_Gol', 'pk-fan4.webp'], ['Paco1907', 'pk-fan5.webp'], ['Nerea.V', 'pk-fan6.webp'], ['JoseGK', 'pk-fan5.webp']],
};
const PK_GIFTS = [[5, 10], [4, 20], [9, 50], [6, 20], [10, 200], [3, 20], [11, 500], [12, 500], [7, 50]]; // [gift index, token price]
const kfmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n));
const mmss2 = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Numbers count up to their new value instead of jumping (scores, from the authoritative total)
function useCountUp(v) {
  const [n, setN] = useState(v);
  const from = useRef(v);
  useEffect(() => {
    const a = from.current; const t0 = performance.now(); let raf;
    const step = (t) => { const k = Math.min(1, (t - t0) / 500); const x = Math.round(a + (v - a) * (1 - (1 - k) ** 3)); setN(x); from.current = x; if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [v]);
  return n;
}

export function PlayerKnockout() {
  const nav = useNav();
  const team = useCopy('team.main');
  const me = useCopy('user.name');
  const crest = useSlot('club-crest');
  const meImg = useSlot('user-avatar');
  const host = useRoomHost(team, crest, true);
  const [closing, close] = useClose();
  const [msgs, addMsg] = useChat([
    { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing kick!!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Let’s gooo' }, { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' },
    { n: 'Jacky_Chen', c: '#c27aff', t: 'Very nice!!' }, { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' }, { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
  ]);
  // Battle state. `truth` is what the server would hold; `shown` is what the overlay draws (it holds while stale).
  const [phase, setPhase] = useState('intro'); // intro | battle | result
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const truth = useRef({ a: 0, b: 0 });
  const [shown, setShown] = useState({ a: 0, b: 0 });
  const contrib = useRef({ a: {}, b: {} }); // name -> points, per side
  const likes = useRef({ stamps: [], total: 0 });
  const bias = useRef(0.5);
  const [toasts, setToasts] = useState([]);
  const [hearts, setHearts] = useState([]);
  const [backed, setBacked] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bump, setBump] = useState({ a: 0, b: 0 });
  const elapsed = (now - t0) / 1000;
  const left = phase === 'battle' ? Math.max(0, Math.ceil(PK.battle - elapsed)) : phase === 'intro' ? PK.battle : 0;
  const stale = phase === 'battle' && left <= PK.staleAt && left > PK.staleAt - PK.staleFor;

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(t); }, []);
  // Phase changes ride on the same clock
  useEffect(() => {
    if (phase === 'intro' && elapsed >= PK.intro) { setPhase('battle'); setT0(Date.now()); addMsg({ sys: true, t: '⚽ Kick-off! Tap a side to cheer, send gifts to score.' }); }
    else if (phase === 'battle' && elapsed >= PK.battle) {
      setShown({ ...truth.current }); setPhase('result'); setT0(Date.now());
      const { a, b } = truth.current;
      if (a !== b) addMsg({ sys: true, t: `🏁 Full time — ${(a > b ? PK_SIDES[0] : PK_SIDES[1]).short} wins. Punishment for ${(a > b ? PK_SIDES[1] : PK_SIDES[0]).short}: ${PK_PUNISHMENT}` });
      else addMsg({ sys: true, t: '🏁 Full time — it’s a draw. No punishment.' });
    } else if (phase === 'result' && elapsed >= PK.result) {
      truth.current = { a: 0, b: 0 }; contrib.current = { a: {}, b: {} }; likes.current = { stamps: [], total: 0 }; bias.current = 0.5;
      setShown({ a: 0, b: 0 }); setToasts([]); setPhase('intro'); setT0(Date.now()); addMsg({ sys: true, t: '🔁 Rematch! Scores reset.' });
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps
  // Push the authoritative total to the overlay about once a second, except while the score stream is delayed
  useEffect(() => { if (phase === 'battle' && !stale) setShown({ ...truth.current }); }, [now, stale, phase]);

  const score = (side, pts, who) => {
    if (phase !== 'battle') return false;
    truth.current = { ...truth.current, [side]: truth.current[side] + pts };
    if (who) contrib.current[side][who] = (contrib.current[side][who] || 0) + pts;
    setBump((b) => ({ ...b, [side]: b[side] + 1 }));
    return true;
  };
  const toast = (side, who, avatar, giftIdx, qty, pts) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((l) => [...l.filter((x) => x.side === side).slice(-1), ...l.filter((x) => x.side !== side), { id, side, who, avatar, gift: img(`gift-g${String(giftIdx + 1).padStart(2, '0')}.webp`), qty, pts }]);
    setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), 2600);
  };
  // Simulated crowd: gifts every 1.2–3 s (side drifts so the lead changes hands) and a trickle of likes
  useEffect(() => {
    if (phase !== 'battle') return undefined;
    let alive = true; let tm;
    const gift = () => {
      if (!alive) return;
      bias.current = Math.min(0.75, Math.max(0.25, bias.current + (Math.random() - 0.5) * 0.25));
      const side = Math.random() < bias.current ? 'a' : 'b';
      const [who, av] = pick(PK_FANS[side]); const [gi, price] = pick(PK_GIFTS); const qty = pick([1, 1, 1, 5, 5, 10]);
      const pts = price * qty * 10;
      if (score(side, pts, who)) toast(side, who, img(av), gi, qty, pts);
      tm = setTimeout(gift, 1200 + Math.random() * 1800);
    };
    tm = setTimeout(gift, 700);
    const lk = setInterval(() => { score('a', Math.floor(Math.random() * 6)); score('b', Math.floor(Math.random() * 6)); }, 600);
    return () => { alive = false; clearTimeout(tm); clearInterval(lk); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tap a half: likes for that side (PRD caps: 5 taps/s, 300 per battle; over-cap taps animate but score nothing)
  const tap = (side, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Math.random().toString(36).slice(2);
    setHearts((h) => [...h.slice(-14), { id, side, x: e.clientX - r.left, y: e.clientY - r.top, d: (Math.random() - 0.5) * 40 }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1100);
    if (phase !== 'battle') return;
    const t = Date.now(); const L = likes.current;
    L.stamps = L.stamps.filter((x) => t - x < 1000);
    if (L.stamps.length >= 5 || L.total >= 300) return;
    L.stamps.push(t); L.total += 1;
    score(side, 1, me);
    setBacked(side);
  };
  const onGift = (side, tokens) => {
    if (phase !== 'battle') { nav.notify('Gift sent — it scores once the next battle kicks off'); return; }
    score(side, tokens * 10, me);
    setBacked(side);
    setTimeout(() => nav.notify(`+${kfmt(tokens * 10)} for ${PK_SIDES.find((x) => x.id === side).short}`), 300);
  };
  const [openGifts, giftsUI] = useGifts(addMsg, { sides: PK_SIDES, side: backed, onGift });

  const sa = useCountUp(shown.a); const sb = useCountUp(shown.b);
  const total = shown.a + shown.b;
  const share = total ? Math.min(88, Math.max(12, (shown.a / total) * 100)) : 50;
  const winner = phase === 'result' ? (shown.a === shown.b ? 'draw' : shown.a > shown.b ? 'a' : 'b') : null;
  const top3 = (side) => Object.entries(contrib.current[side]).sort((x, y) => y[1] - x[1]).slice(0, 3)
    .map(([who]) => (who === me ? meImg : img((PK_FANS[side].find((f) => f[0] === who) || [])[1] || 'pk-fan1.webp')));
  const final10 = phase === 'battle' && left <= 10 && left > 0;
  const introN = Math.max(1, PK.intro - Math.floor(elapsed));
  const youWon = winner && winner !== 'draw' && backed === winner;
  return (
    <div className={'p-screen p-lv p-pk is-' + phase + (closing ? ' is-closing' : '')}>
      <LiveHeader {...host} hearts="22.1K" following={false} onClose={close} />
      <div className="p-pk__media">
        <div className={'p-pk__bar' + (stale ? ' is-stale' : '')} role="img" aria-label={`Score: ${PK_SIDES[0].name} ${shown.a}, ${PK_SIDES[1].name} ${shown.b}`}>
          <span className="is-a" style={{ width: share + '%' }}><b key={'a' + bump.a} className="p-pk__n">{kfmt(sa)}</b></span>
          <span className="is-b"><b key={'b' + bump.b} className="p-pk__n">{kfmt(sb)}</b></span>
          <img className="p-pk__ball" src={img('gift-g06.webp')} alt="" style={{ left: share + '%' }} />
          {stale && <em className="p-pk__stale"><i />Score delayed</em>}
        </div>
        <div className="p-pk__video">
          {PK_SIDES.map((x, i) => (
            <button key={x.id} className={'p-pk__half ' + x.cls + (winner === x.id ? ' is-win' : winner && winner !== 'draw' ? ' is-lose' : '')} aria-label={`Cheer for ${x.name}`} onClick={(e) => tap(x.id, e)}>
              <video {...videoProps(`assets/live/pk-${i ? 'b' : 'a'}.mp4`, `assets/live/pk-${i ? 'b' : 'a'}.webp`)} autoPlay muted loop playsInline aria-hidden />
              {hearts.filter((h) => h.side === x.id).map((h) => <img key={h.id} className="p-pk__heart" src={img('gift-g06.webp')} alt="" style={{ left: h.x, top: h.y, '--d': h.d + 'px' }} />)}
              <span className="p-pk__toasts">
                {toasts.filter((t) => t.side === x.id).map((t) => (
                  <span key={t.id} className="p-pk__toast"><img src={t.avatar} alt="" /><b>{t.who}</b><img src={t.gift} alt="" />×{t.qty}<em>+{kfmt(t.pts)}</em></span>
                ))}
              </span>
              <span className="p-pk__tag"><img src={x.img} alt="" /><span>{x.name}</span></span>
              {winner && <span className={'p-pk__stamp' + (winner === 'draw' ? ' is-draw' : winner === x.id ? ' is-win' : ' is-lose')}>{winner === 'draw' ? 'DRAW' : winner === x.id ? <><img src={img('gift-g05.webp')} alt="" />WIN</> : 'LOSE'}</span>}
            </button>
          ))}
          <span className={'p-ch__timer p-pk__timer' + (final10 ? ' is-final' : '')} role="timer" aria-live="off"><img src={img('gift-g10.webp')} alt="" />{phase === 'result' ? 'FT' : mmss2(left)}</span>
          <img className={'p-pk__vs' + (phase === 'intro' ? ' is-big' : '')} src={asset('assets/live/pk-vs.svg')} alt="" />
          {phase === 'intro' && <span className="p-pk__kick" aria-live="assertive"><small>KICK-OFF IN</small><b key={introN}>{introN}</b></span>}
          {final10 && <b key={left} className="p-pk__final" aria-hidden="true">{left}</b>}
        </div>
        {phase === 'result' ? (
          <div className="p-pk__result" aria-live="polite">
            <b>{winner === 'draw' ? 'Full time · Draw' : `Full time · ${PK_SIDES.find((x) => x.id === winner).short} wins`}</b>
            <span>{youWon ? 'Your side won! ' : ''}Rematch in {Math.max(0, Math.ceil(PK.result - elapsed))}s</span>
          </div>
        ) : (
          <div className="p-pk__fans">
            {PK_SIDES.map((x) => {
              const f = top3(x.id);
              const list = x.id === 'a' ? [...f].reverse() : f; // rank 1 nearest the middle
              return (
                <span key={x.id} className={'p-pk__group ' + x.cls} aria-label={`${x.name} top supporters`}>
                  {list.map((src, k) => { const rank = x.id === 'a' ? list.length - 1 - k : k; return <img key={src + k} src={src} alt="" style={{ borderColor: RINGS[rank], zIndex: 3 - rank }} className={src === meImg ? 'is-me' : ''} />; })}
                  {!f.length && <small>Send a gift to top the board</small>}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-lv__bottom p-pk__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} />
          <SideBar items={[{ id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => setLiked(!liked), pressed: liked }, { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts }, { id: 'more', icon: 'more', label: 'More', onClick: nav.dead }]} />
        </div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-homebar" aria-hidden="true" />
      {giftsUI}
    </div>
  );
}

// ---- Start a Room — 638:19766 (empty) → 638:19779 (filled) → Start Live → host view 638:19937 ----
// Figma jumps from the empty form to the filled one on tap; the demo does the same (tap anywhere in the form).
const START = { title: 'On the Pitch', category: 'Fan Room', visibility: 'Public', orientation: 'Portrait' };
export function StartRoom() {
  const nav = useNav();
  const [filled, setFilled] = useState(false);
  const fill = () => !filled && setFilled(true);
  const Field = ({ value, placeholder, count }) => (
    <div className={'p-sr__field' + (value ? ' is-filled' : '')}>
      <span>{value || placeholder}</span>
      {count ? <i>{value ? value.length : 0}/20</i> : <Icon name="chevron-down" size={18} color="var(--colour-icon-primary)" />}
    </div>
  );
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <header className="p-header">
        <div className="p-statusbar"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} /></div>
        <div className="p-titlebar"><div className="p-titlebar__lead"><button className="p-backbtn" onClick={nav.back} aria-label="Back"><Icon name="back" size={24} /></button><h1 className="p-title2">Start a Room</h1></div></div>
      </header>
      <main className="p-main">
        <div className="p-sr" onClick={fill}>
          <div className="p-sr__form">
            {filled ? (
              <span className="p-sr__cover"><img src={img('start-cover.webp')} alt="" /><button aria-label="Remove cover" onClick={(e) => { e.stopPropagation(); setFilled(false); }}><Icon name="lr-x16" size={12} color={W} /></button></span>
            ) : (
              <button className="p-sr__upload"><Icon name="add" size={24} color="var(--colour-icon-primary)" /><span>Cover</span></button>
            )}
            <Field count value={filled && START.title} placeholder="Enter live room title" />
            <Field value={filled && START.category} placeholder="Select live category" />
            <Field value={filled && START.visibility} placeholder="Visibility" />
            <Field value={filled && START.orientation} placeholder="Orientation" />
          </div>
          <button className={'p-btn p-btn--block p-sr__go' + (filled ? ' p-btn--primary' : '')} disabled={!filled} onClick={(e) => { e.stopPropagation(); nav.swap('live-host'); }}><span>Start Live</span></button>
        </div>
      </main>
      <AppBar active="community" />
    </div>
  );
}

// Host view — 638:19937. Same video background as Live / Default; the timer counts up from the moment you go live
// (Figma shows a fixed 1:32:29). X ends the room and lands on My Space, as linked in Figma (996:33722).
const HOST_SEED = [
  { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing!!' },
  { n: 'Mike2124', c: '#fb64b6', t: 'So ready for the game' },
  { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' },
  { n: 'Jacky_Chen', c: '#c27aff', t: 'Let’s go team!' },
  { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' },
  { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' },
  { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
];
export function HostRoom() {
  const nav = useNav();
  const [msgs] = useChat(HOST_SEED);
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  useEffect(() => { const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, []);
  const time = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const tools = [
    { icon: 'lr-mic', label: muted ? 'Unmute' : 'Mute', on: muted, onClick: () => setMuted(!muted) },
    { icon: camOff ? 'chat-camoff' : 'lr-cam', label: camOff ? 'Cam On' : 'Cam Off', on: camOff, onClick: () => setCamOff(!camOff) },
    { icon: 'chat-swap', label: 'Flip', onClick: nav.dead },
    { icon: 'cm-tipping', label: 'Goals', onClick: nav.dead },
    { icon: 'settings', label: 'Manage', onClick: nav.dead },
  ];
  return (
    <div className="p-screen p-lv p-host">
      {camOff ? <div className="p-host__off"><Icon name="chat-camoff" size={32} color={W} /><span>Camera is off</span></div>
        : <LiveBackground still="assets/live/live-bg.webp" />}
      <LiveHeader onClose={() => nav.swap('myspace')}>
        <div className="p-wp__title"><i aria-hidden="true" /><b>{START.category}</b><u aria-hidden="true" /><b>{time}</b><u aria-hidden="true" /><span><small>ID:</small> <b>3234121</b></span></div>
      </LiveHeader>
      <button className="p-host__stats" onClick={nav.dead}>
        <span><Icon name="viewers" size={14} color={W} />73.1K</span><u />
        <span><Icon name="lr-like" size={14} color={W} />22.1K</span><u />
        <span><Coin size={14} />4.7k</span>
        <Icon name="chevron-right" size={18} color={W} />
      </button>
      <div className="p-lv__bottom p-host__bottom">
        <ChatList msgs={msgs} h={178} />
        <div className="p-host__tools">
          {tools.map((t) => (
            <button key={t.label} aria-pressed={t.on} onClick={t.onClick}><Icon name={t.icon} size={20} color={W} /><span>{t.label}</span></button>
          ))}
        </div>
      </div>
      <span className="p-homebar" aria-hidden="true" />
    </div>
  );
}

// ---- Call-in Room — 1925:43177: base 43178 → Ask 43225 → Waiting 43285 → Stream access 43245/43265 → On stage 43196
// The host accepts on their own after a short countdown (Figma shows 10 s; the demo uses 3 s so the flow keeps
// moving). Grant Permission is simulated: no browser prompt, both rows flip to Completed, then you're on stage.
const CALLIN_WAIT = 3;
const CALLIN_STREAM = 'assets/live/callin-stream.mp4'; // optional host video (Configure › Videos); nothing ships
const CALLIN_SEED = [
  { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing performance!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Love this song!' },
  { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' }, { n: 'Jacky_Chen', c: '#c27aff', t: 'I love your performance!' },
  { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' }, { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
];
const PERM_STEPS = ['Tap the lock icon in the address bar', 'Select “Site settings”', 'Enable “Camera” and “Microphone”', 'Refresh and try again'];

// Who's talking pulses: the host most of the time, the on-stage guest now and then, and you when unmuted
function Talk() { return <span className="p-ci__talk" aria-hidden="true"><i /><i /><i /></span>; }
function Seats({ joined, onSeat, speaking, meImg, muted }) {
  const guest = img('host-tatiana.webp');
  return (
    <div className="p-ci__seats">
      <div className={'p-ci__seat is-host' + (speaking === 'host' ? ' is-speaking' : '')}><Icon name="profile" size={20} color={W} /><span>Host</span>{speaking === 'host' && <Talk />}</div>
      {[0, 1, 2].map((i) => (joined && i < 2
        ? <div key={i} className={'p-ci__seat is-taken' + ((i === 0 && !muted && speaking === 'me') || (i === 1 && speaking === 'guest') ? ' is-speaking' : '')}>
            <img src={i === 0 ? meImg : guest} alt="" />{i === 0 && <em>{muted ? <Icon name="lr-mic" size={10} color="#ff4d6b" /> : 'You'}</em>}
            {((i === 0 && !muted && speaking === 'me') || (i === 1 && speaking === 'guest')) && <Talk />}
          </div>
        : <button key={i} className="p-ci__seat" aria-label="Ask to join" onClick={onSeat}><Icon name="add" size={24} color={W} /></button>))}
    </div>
  );
}

function CallInPop({ step, left, onRequest, onWithdraw, onClose }) {
  const ask = step === 'ask';
  return (
    <div className="p-modal p-ci__popwrap" role="dialog" aria-modal="true" aria-labelledby="ci-pop-title">
      <button className="p-sheet__scrim is-clear" aria-label="Close" onClick={onClose} />
      <div className="p-ci__pop">
        <button className="p-ci__popx" aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button>
        <Icon name="lr-people" size={32} />
        {ask ? (
          <><h2 id="ci-pop-title">Ask to Join this Live?</h2><p>Viewers will see and hear you.</p>
            <button className="p-btn p-btn--primary p-btn--block" onClick={onRequest}><span>Request</span></button></>
        ) : (
          <><h2 id="ci-pop-title">Waiting for Host to Accept</h2><b className="p-ci__count" aria-live="polite">{left}s</b>
            <div className="p-ci__ctas">
              <button className="p-btn p-btn--outline" onClick={onWithdraw}><span>Withdraw</span></button>
              <button className="p-btn p-ci__sent" disabled><span>Request Sent</span></button>
            </div></>
        )}
      </div>
    </div>
  );
}

function StreamAccess({ granted, onGrant, onCancel }) {
  const rows = [['lr-cam', 'Camera'], ['lr-mic', 'Microphone']];
  return (
    <div className="p-modal p-ci__mask" role="dialog" aria-modal="true" aria-labelledby="ci-perm-title">
      <div className="p-ci__perm">
        <button className="p-ci__popx" aria-label="Close" onClick={onCancel}><Icon name="close" size={20} /></button>
        <div className="p-ci__permhead"><h2 id="ci-perm-title">Enable Stream Access</h2><p>Grant camera and microphone permissions</p></div>
        <div className="p-ci__rows">
          {rows.map(([icon, label]) => (
            <div key={label} className="p-ci__row"><Icon name={icon} size={20} /><span>{label}</span>
              <em className={granted ? 'is-done' : ''}>{granted ? 'Completed' : 'Pending'}</em></div>
          ))}
        </div>
        <div className="p-ci__help">
          <b><Icon name="st-info" size={14} color="var(--colour-brand-primary)" />If permissions are blocked:</b>
          <ol>{PERM_STEPS.map((t) => <li key={t}>{t}</li>)}</ol>
        </div>
        <div className="p-ci__permctas">
          <button className="p-btn p-btn--primary p-btn--block p-btn--lg" disabled={granted} onClick={onGrant}><span>Grant Permission</span></button>
          <button className="p-ci__cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function CallInRoom() {
  const nav = useNav();
  const host = useRoomHost('Dani Morales', img('host-dani.webp'));
  const [closing, close] = useClose();
  const [msgs, addMsg] = useChat(CALLIN_SEED);
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [liked, setLiked] = useState(false);
  // 'live' | 'ask' | 'wait' | 'perm' | 'stage'
  const [step, setStep] = useState('live');
  const [left, setLeft] = useState(CALLIN_WAIT);
  const [granted, setGranted] = useState(false);
  const meImg = useSlot('user-avatar');
  const [muted, setMuted] = useState(false);
  // A live room breathes: who's talking rotates, the viewer count drifts, likes float up
  const [speaking, setSpeaking] = useState('host');
  const [viewers, setViewers] = useState(13300);
  const [floats, setFloats] = useState([]);
  useEffect(() => {
    const t = setInterval(() => {
      setViewers((v) => Math.max(12900, v + Math.round((Math.random() - 0.4) * 60)));
      setSpeaking((sp) => { const r = Math.random(); return r < 0.55 ? 'host' : r < 0.75 ? 'guest' : r < 0.9 ? 'me' : sp; });
    }, 2200);
    return () => clearInterval(t);
  }, []);
  const floatUp = (n = 3) => {
    const add = Array.from({ length: n }, (_, k) => ({ id: Math.random().toString(36).slice(2), d: (Math.random() - 0.5) * 40, delay: k * 90 }));
    setFloats((f) => [...f.slice(-24), ...add]);
    setTimeout(() => setFloats((f) => f.filter((x) => !add.includes(x))), 2400);
  };
  // Ambient likes from other viewers
  useEffect(() => { const t = setInterval(() => Math.random() < 0.6 && floatUp(1 + Math.floor(Math.random() * 2)), 1800); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (step !== 'wait') return undefined;
    if (left <= 0) { setStep('perm'); return undefined; }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [step, left]);
  const ask = () => step === 'live' && setStep('ask');
  const request = () => { setLeft(CALLIN_WAIT); setStep('wait'); };
  const grant = () => { setGranted(true); setTimeout(() => { setStep('stage'); nav.notify('You’re on stage'); }, 900); };
  const leave = () => { setStep('live'); setGranted(false); nav.notify('You left the stage'); };
  const like = { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => { setLiked(true); floatUp(4); }, pressed: liked };
  const gift = { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts };
  const more = { id: 'more', icon: 'more', label: 'More', onClick: nav.dead };
  const stage = step === 'stage';
  return (
    <div className={'p-screen p-lv p-ci' + (stage ? ' is-cohost' : '') + (closing ? ' is-closing' : '')}>
      {/* The host's stream: an uploaded Call-in video (Configure) plays here; until then the still drifts like a handheld phone */}
      {isChanged(CALLIN_STREAM) ? <video className="p-lv__bg" {...videoProps(CALLIN_STREAM, 'assets/live/callin-bg.webp')} autoPlay muted loop playsInline aria-hidden /> : <img className="p-lv__bg p-ci__handheld" src={img('callin-bg.webp')} alt="" />}
      <LiveHeader {...host} viewers={(viewers / 1000).toFixed(1) + 'K'} hearts="22.1K" following={false} onClose={close} />
      <Seats joined={stage} onSeat={ask} speaking={speaking} meImg={meImg} muted={muted} />
      <div className="p-lv__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} />
          <SideBar items={stage ? [like, gift, { id: 'share', icon: 'lr-share', label: 'Share', onClick: nav.dead }, more] : [{ id: 'join', icon: 'lr-join', label: 'Join', onClick: ask }, like, gift, more]} />
        </div>
        {stage ? <CoHostToolbar onLeave={leave} onMute={setMuted} /> : <ChatBar onSend={addMsg} />}
      </div>
      {(step === 'ask' || step === 'wait') && <CallInPop step={step} left={left} onRequest={request} onWithdraw={() => setStep('live')} onClose={() => setStep('live')} />}
      {step === 'perm' && <StreamAccess granted={granted} onGrant={grant} onCancel={() => { setStep('live'); setGranted(false); }} />}
      <span className="p-wp__floats p-ci__floats" aria-hidden="true">{floats.map((f) => <i key={f.id} className="is-heart" style={{ '--d': f.d + 'px', animationDelay: f.delay + 'ms' }} />)}</span>
      {giftsUI}
      {stage && <span className="p-homebar" aria-hidden="true" />}
    </div>
  );
}

// ---- Interactive Room — 1925:48787 (live state only; the feed-interrupted and feed-dropped frames are not built)
// The stream sits in a landscape player under the header. It's live: no seek bar or play/pause (removed in Figma).
// Chat fills the space under the player (Live/Chat Container, 365px tall), as updated in Figma
const IR_SEED = [
  { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing performance! 🎵' }, { n: 'Mike2124', c: '#fb64b6', t: 'Love this song! 🎵' },
  { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' }, { n: 'Jacky_Chen', c: '#c27aff', t: 'I love your performance!' },
  { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' }, { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
  { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', label: 'Gifted', x: 'x5' }, { n: 'User156', c: '#fb64b6', t: 'Best stream ever!' },
  { n: 'User725', c: '#ff8904', t: 'You’re amazing!' }, { n: 'User814', c: '#c27aff', t: 'Keep going! 💪' }, { n: 'User765', c: '#51a2ff', t: 'Love the energy!' },
  { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', label: 'I love this song!', x: 'x5' }, { n: 'User106', c: '#00d3f2', t: 'Keep going! 💪' },
];
export function InteractiveRoom() {
  const nav = useNav();
  const host = useRoomHost('Leo Vargas', img('host-leo.webp'));
  const [closing, close] = useClose();
  const [msgs, addMsg] = useChat(IR_SEED);
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [liked, setLiked] = useState(false);
  return (
    <div className={'p-screen p-lv p-ir' + (closing ? ' is-closing' : '')}>
      <LiveHeader {...host} hearts="22.1K" following={false} onClose={close} />
      <div className="p-ir__video">
        <video {...videoProps('assets/live/interactive-feed.mp4', 'assets/live/interactive-feed.webp')} autoPlay muted loop playsInline aria-hidden />
        <span className="p-ir__live"><i />LIVE</span>
        <span className="p-ir__src">Streaming from OBS</span>
        <span className="p-ir__cam" aria-hidden><img src={img('interactive-facecam.webp')} alt="" /></span>
        <div className="p-ir__icons">
          {[['volume', 'Volume'], ['captions', 'Captions'], ['settings', 'Settings']].map(([i, l]) => <button key={i} aria-label={l} onClick={nav.dead}><Icon name={i} size={24} color={W} /></button>)}
          <button aria-label="Full screen" onClick={nav.dead}><img src={asset('assets/watch/rotate-phone.svg')} alt="" width="24" height="24" /></button>
        </div>
      </div>
      <div className="p-lv__bottom p-ir__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} h={365} />
          <SideBar items={[{ id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => setLiked(!liked), pressed: liked }, { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts }, { id: 'more', icon: 'more', label: 'More', onClick: nav.dead }]} />
        </div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-homebar" aria-hidden="true" />
      {giftsUI}
    </div>
  );
}

// ---- Mission Room — 1925:50554 (multi-goal; goals are football-skill missions since the Nov update): goal chips 50555 → Live Room Goals 50824 → Support Goal 50977 → gift burst
// Goals live outside the screen so progress and timers carry over when the room is closed and reopened.
// Sending spends the demo wallet (mySpace.tokens) and moves that goal's bar; a goal that reaches its target completes.
const GOALS = [
  { id: 'sing', icon: 'goal-hearts.webp', title: 'Keep the ball up with both feet', n: 3, of: 15, secs: 620, price: 50 },
  { id: 'guitar', icon: 'goal-lips.webp', title: 'Beat a defender with a nutmeg', n: 3, of: 10, secs: 875, price: 100 },
  { id: 'draw', icon: 'goal-clap.webp', title: 'Link stepovers and sole rolls to beat a defender in a tight space', n: 3, of: 40, secs: 1530, price: 20 },
  { id: 'burger', icon: 'goal-letter.webp', title: 'Flick the ball up, land an around-the-world, then regain control without letting it touch the ground', n: 35, of: 35, secs: 0, price: 200 },
];
const missions = { started: null };
const goalLeft = (g) => Math.max(0, g.secs - Math.floor((Date.now() - missions.started) / 1000));
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const goalDone = (g) => g.n >= g.of;

function GoalChips({ goals, onOpen }) {
  return (
    // Goal chip row (1925:50827): icon 15×18 + count, 12px dividers between goals, all on one 20px line
    <button className="p-mr__chips" aria-label={'Live Room Goals: ' + goals.map((g) => `${g.n} of ${g.of}`).join(', ')} onClick={onOpen}>
      {goals.map((g, i) => [
        i > 0 && <u key={g.id + '-d'} aria-hidden="true" />,
        <span key={g.id} className="p-mr__chip" aria-hidden="true">
          <i className={'p-mr__ci is-' + g.id}><img src={img(g.icon)} alt="" /></i>
          <span><b key={g.n} className="p-mr__n">{g.n}</b><em>/</em><small>{g.of}</small></span>
        </span>,
      ])}
    </button>
  );
}

function GoalsSheet({ goals, onClose, onSend }) {
  return (
    <div className="p-sheet p-lv__sheet" role="dialog" aria-modal="true" aria-label="Live Room Goals">
      <button className="p-sheet__scrim is-clear" aria-label="Close" onClick={onClose} />
      <div className="p-sheet__panel p-mr__sheet">
        <div className="p-sheet__head"><h2>Live Room Goals</h2><button aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <div className="p-mr__list">
          {goals.map((g) => {
            const done = goalDone(g);
            return (
              <div key={g.id} className="p-mr__goal">
                <div className="p-mr__goalrow">
                  <span className="p-mr__gicon"><img src={img(g.icon)} alt="" /><span><b>{g.n}</b>/{g.of}</span></span>
                  <span className="p-mr__gbody"><span>{g.title}</span><i className="p-mr__bar"><i style={{ width: Math.min(100, (g.n / g.of) * 100) + '%' }} /></i></span>
                  <span className="p-mr__clock"><Icon name="lr-clock" size={13} color="#fdc700" />{mmss(done ? 0 : goalLeft(g))}</span>
                </div>
                {done
                  ? <button className="p-btn p-btn--block p-mr__done" disabled><span>Completed</span></button>
                  : <button className="p-btn p-btn--primary p-btn--block" onClick={() => onSend(g)}><span>Send</span></button>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SupportGoal({ goal, onClose, onSent }) {
  const nav = useNav();
  const [qty, setQty] = useState(5);
  const cost = goal.price * qty;
  const send = () => {
    if (cost > mySpace.tokens) return nav.notify('Not enough tokens');
    mySpace.tokens -= cost;
    onSent(goal, qty);
  };
  return (
    <div className="p-sheet p-lv__sheet" role="dialog" aria-modal="true" aria-label="Support Goal">
      <button className="p-sheet__scrim is-clear" aria-label="Close" onClick={onClose} />
      <div className="p-sheet__panel p-mr__support">
        <div className="p-sheet__head p-mr__shead"><div><h2>Support Goal</h2><p>{goal.title}</p></div><button aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <div className="p-mr__sbody">
          <div className="p-gift__bal"><span>Token Balance: {fmt(mySpace.tokens)}</span><button onClick={nav.dead}>Buy Tokens<Icon name="chevron-right" size={14} color="var(--colour-text-on-secondary)" /></button></div>
          <div className="p-mr__stepper">
            <button aria-label="Fewer" disabled={qty <= 1} onClick={() => setQty(qty - 1)}><Icon name="lr-minus" size={32} /></button>
            <span><img src={img(goal.icon)} alt="" /><b aria-live="polite">{qty}</b></span>
            <button aria-label="More" onClick={() => setQty(qty + 1)}><Icon name="lr-plus" size={32} /></button>
          </div>
          <button className="p-btn p-btn--primary p-btn--block p-mr__sendbtn" onClick={send}>
            <span>Send</span><img src={img(goal.icon)} alt="" /><span>{qty}</span><span className="p-mr__cost">(<Coin size={14} />{fmt(cost)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function MissionRoom() {
  const nav = useNav();
  const host = useRoomHost('Dani Morales', img('host-dani.webp'));
  const me = useCopy('user.name');
  const [closing, close] = useClose();
  const [msgs, addMsg] = useChat(CALLIN_SEED);
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [liked, setLiked] = useState(false);
  const [sheet, setSheet] = useState(null); // null | 'goals' | goal
  const [burst, setBurst] = useState(null);
  const [, tick] = useState(0);
  if (!missions.started) missions.started = Date.now();
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);
  const [toast, setToast] = useState(null);
  const [done, setDone] = useState(null);
  const [floats, setFloats] = useState([]);
  const floatUp = (n = 3, kind = 'heart') => {
    const add = Array.from({ length: n }, (_, k) => ({ id: Math.random().toString(36).slice(2), kind, d: (Math.random() - 0.5) * 40, delay: k * 90 }));
    setFloats((f) => [...f.slice(-24), ...add]);
    setTimeout(() => setFloats((f) => f.filter((x) => !add.includes(x))), 2400 + n * 90);
  };
  const complete = (g) => {
    setDone({ g, k: Date.now() });
    setTimeout(() => setDone(null), 3200);
    floatUp(10, 'ball');
    addMsg({ sys: true, t: `🏆 Mission complete: ${g.title}` });
  };
  // Other viewers keep supporting the missions (Wishlist PRD: viewer fulfilment), so the counts climb on their own
  useEffect(() => {
    const t = setInterval(() => {
      const open = GOALS.filter((g) => !goalDone(g));
      if (!open.length) return;
      const g = open[Math.floor(Math.random() * open.length)];
      const qty = Math.random() < 0.7 ? 1 : 2;
      g.n = Math.min(g.of, g.n + qty);
      const who = ['Lu_Gol', 'Paco1907', 'Nerea.V', 'Tito_Verdi', 'Mari_B', 'Rubén.10'][Math.floor(Math.random() * 6)];
      setToast({ who, g, qty, k: Date.now() });
      if (goalDone(g)) setTimeout(() => complete(g), 600);
    }, 3500);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setInterval(() => Math.random() < 0.5 && floatUp(1 + Math.floor(Math.random() * 2)), 2000); return () => clearInterval(t); }, []);
  const onSent = (g, qty) => {
    const was = goalDone(g);
    g.n = Math.min(g.of, g.n + qty);
    setSheet(null);
    setBurst(img(g.icon));
    setTimeout(() => setBurst(null), 1800);
    addMsg({ n: me, c: '#ffffff', tip: 'gift', label: 'Gifted', giftImg: img(g.icon), x: 'x' + qty });
    if (!was && goalDone(g)) setTimeout(() => complete(g), 1900);
  };
  const side = [
    { id: 'join', icon: 'lr-join', label: 'Join', onClick: nav.dead },
    { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => { setLiked(true); floatUp(4); }, pressed: liked },
    { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts },
    { id: 'share', icon: 'lr-share', label: 'Share', onClick: nav.dead },
    { id: 'more', icon: 'more', label: 'More', onClick: nav.dead },
  ];
  return (
    <div className={'p-screen p-lv p-mr' + (closing ? ' is-closing' : '')}>
      {/* Stream: the right-hand Challenge Room footage (feet and ball on asphalt — generic, no kit), re-exported full screen */}
      <video className="p-lv__bg" {...videoProps('assets/live/mission-stream.mp4', 'assets/live/mission-stream.webp')} autoPlay muted loop playsInline aria-hidden />
      <LiveHeader {...host} hearts="22.1K" following={false} onClose={close} />
      <GoalChips goals={GOALS} onOpen={() => setSheet('goals')} />
      {toast && <span key={toast.k} className="p-mr__toast"><b>{toast.who}</b> sent <img src={img(toast.g.icon)} alt="" />×{toast.qty}<small>{toast.g.title}</small></span>}
      {done && <div key={done.k} className="p-mr__done-burst" role="status"><img src={img(done.g.icon)} alt="" /><b>MISSION COMPLETE</b><span>{done.g.title}</span></div>}
      <span className="p-wp__floats p-mr__floats" aria-hidden="true">{floats.map((f) => <i key={f.id} className={'is-' + f.kind} style={{ '--d': f.d + 'px', animationDelay: f.delay + 'ms', backgroundImage: f.kind === 'ball' ? `url("${img('gift-g06.webp')}")` : undefined }} />)}</span>
      <div className="p-lv__bottom">
        <div className="p-lv__row"><ChatList msgs={msgs} /><SideBar items={side} /></div>
        <ChatBar onSend={addMsg} onCrown={() => setSheet('goals')} />
      </div>
      <span className="p-homebar" aria-hidden="true" />
      {burst && <GiftBurst src={burst} />}
      {sheet === 'goals' && <GoalsSheet goals={GOALS} onClose={() => setSheet(null)} onSend={(g) => setSheet(g)} />}
      {sheet && sheet !== 'goals' && <SupportGoal goal={sheet} onClose={() => setSheet('goals')} onSent={onSent} />}
      {giftsUI}
    </div>
  );
}

// ---- Passcode gate (Enter Passcode, Modal/Flex 1925:46149 on 1925:46091) → Personal room. Any 4 digits open it.
const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
export function PasscodeSheet() {
  const nav = useNav();
  const [pin, setPin] = useState('');
  const [closing, setClosing] = useState(false);
  const title = roomHost.next?.title || PERSONAL_TITLE; // read, not consumed: the room needs the host
  const press = (k) => setPin((p) => (k === 'del' ? p.slice(0, -1) : p.length < 4 ? p + k : p));
  useEffect(() => {
    const onKey = (e) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  const close = () => { if (closing) return; setClosing(true); setTimeout(nav.back, 220); };
  const full = pin.length === 4;
  return (
    <div className={'p-sheet p-pass' + (closing ? ' is-closing' : '')} role="dialog" aria-modal="true" aria-label="Enter Passcode">
      <button className="p-sheet__scrim" aria-label="Close" onClick={close} />
      <div className="p-sheet__panel p-pass__panel">
        <div className="p-pass__head">
          <div><h2>Enter Passcode</h2><p>{title}</p></div>
          <button className="p-pass__x" aria-label="Close" onClick={close}><Icon name="close" size={24} /></button>
        </div>
        <div className="p-pass__boxes" aria-label={`${pin.length} of 4 digits entered`}>
          {[0, 1, 2, 3].map((i) => <span key={i} className={'p-pass__box' + (i === pin.length ? ' is-active' : '') + (pin[i] ? ' is-filled' : '')}>{pin[i] ? '•' : ''}</span>)}
        </div>
        <div className="p-pass__keys">
          {PIN_KEYS.map((k, i) => (k === '' ? <span key={i} /> : (
            <button key={i} className="p-pass__key" aria-label={k === 'del' ? 'Delete' : k} onClick={() => press(k)}>
              {k === 'del' ? <Icon name="chevron-right" size={24} style={{ transform: 'rotate(180deg)' }} /> : k}
            </button>
          )))}
        </div>
        <div className="p-pass__foot">
          <button className="p-btn p-btn--primary p-btn--block" disabled={!full} onClick={() => nav.swap('personal-room')}><span>Enter Room</span></button>
        </div>
      </div>
    </div>
  );
}

// ---- Private room — invitation link only (not listed on Live Rooms; Notifications › Private Room Invitation).
// Our layout: the host's phone selfie stream, "Private · Invite only" strip with who's here, a small friends' chat
// that keeps talking, Like / Gifts / Invite.
export const PRIVATE_ROOM = { title: 'Friends Only: Post-Training Hangout', host: 'Sofía Reyes', inviter: 'Marco_10' };
const PR_FRIENDS = [
  { n: 'Marco_10', c: '#51a2ff', img: 'pk-fan1.webp' }, { n: 'Tomás', c: '#fdc700', img: 'pk-fan2.webp' }, { n: 'Ana.Bel', c: '#fb64b6', img: 'pk-fan3.webp' },
];
const PR_SEED = [
  { sys: true, t: '🔒 Private room · only people with an invitation link can join' },
  { n: 'Marco_10', c: '#51a2ff', t: 'Finally home 😅 legs are gone' },
  { n: 'Tomás', c: '#fdc700', t: 'That last drill was brutal' },
  { n: 'Ana.Bel', c: '#fb64b6', t: 'Coach said Thursday is 8am again…' },
  { n: 'Marco_10', c: '#51a2ff', t: 'Who’s watching the match Saturday?' },
  { n: 'Tomás', c: '#fdc700', t: 'Me! Same place as last time?' },
];
const PR_TALK = [
  ['Ana.Bel', '#fb64b6', 'Bringing snacks this time 🍿'], ['Marco_10', '#51a2ff', 'Sofía that volley today though 🔥'],
  ['Tomás', '#fdc700', 'Rematch on the 5-a-side Sunday?'], ['Ana.Bel', '#fb64b6', 'Send the invite to Leo, he’s asking'],
  ['Marco_10', '#51a2ff', 'Lineup prediction anyone?'], ['Tomás', '#fdc700', 'Haha the ball is in the shot again ⚽'],
];
export function PrivateRoom() {
  const nav = useNav();
  const host = useRoomHost(PRIVATE_ROOM.host, img('host-sofia.webp'));
  const [closing, close] = useClose();
  const me = useCopy('user.name');
  const [msgs, addMsg] = useChat([...PR_SEED, { sys: true, t: `${me} joined via ${PRIVATE_ROOM.inviter}’s invitation` }], null);
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [liked, setLiked] = useState(false);
  const [floats, setFloats] = useState([]);
  const floatUp = (n = 3) => {
    const add = Array.from({ length: n }, (_, k) => ({ id: Math.random().toString(36).slice(2), d: (Math.random() - 0.5) * 40, delay: k * 90 }));
    setFloats((f) => [...f.slice(-24), ...add]);
    setTimeout(() => setFloats((f) => f.filter((x) => !add.includes(x))), 2400);
  };
  // the friends keep chatting (a small room: one line every ~5 s, the odd like)
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { const [n, c, tx2] = PR_TALK[i++ % PR_TALK.length]; addMsg({ n, c, t: tx2 }); if (Math.random() < 0.4) floatUp(1); }, 4200);
    return () => clearInterval(t);
  }, []);
  const invite = () => nav.notify('Invite link copied · only people you send it to can join');
  return (
    <div className={'p-screen p-lv p-pr' + (closing ? ' is-closing' : '')}>
      <img className="p-lv__bg p-ci__handheld" src={img('personal-bg.webp')} alt="" />
      <LiveHeader {...host} viewers="4" hearts="128" onClose={close} />
      <div className="p-pr__strip">
        <span className="p-pr__private"><Icon name="lock" size={12} color={W} />Private · Invite only</span>
        <span className="p-pr__who" aria-label="Watching: Marco_10, Tomás, Ana.Bel and you">
          {PR_FRIENDS.map((f) => <img key={f.n} src={img(f.img)} alt="" />)}
          <b>+ you</b>
        </span>
      </div>
      <div className="p-lv__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} />
          <SideBar items={[
            { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => { setLiked(true); floatUp(4); }, pressed: liked },
            { id: 'gift', icon: 'lr-gift', label: 'Gifts', onClick: openGifts },
            { id: 'invite', icon: 'cm-invite', label: 'Invite', onClick: invite },
          ]} />
        </div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-wp__floats p-ci__floats" aria-hidden="true">{floats.map((f) => <i key={f.id} className="is-heart" style={{ '--d': f.d + 'px', animationDelay: f.delay + 'ms' }} />)}</span>
      <span className="p-homebar" aria-hidden="true" />
      {giftsUI}
    </div>
  );
}

// ---- Watch Party — 638:21603 (Live Room/Vertical): a host-led replay. You are in the host's seat: the room header
// (live dot · name · uptime · viewers), the replay player with ±15 s / pause / seek (the host controls playback for
// everyone), the host camera tile, chat, and the host toolbar (mic, camera, flip, like, share, settings).
// Player = the generic canvas match (paused with the replay); an uploaded Live match video replaces it.
const WP_DUR = 9000; // 2:30:00 replay
const hms = (s) => { const h = Math.floor(s / 3600); const m = Math.floor(s / 60) % 60; const x = Math.floor(s % 60); return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(x).padStart(2, '0'); };
// ---- Personal room — 2007:51061: the same host-led layout; the host plays a video from their cloud drive in a
// passcode-protected room. Small audience (friends), no stranger chatter, cloud-drive file chip on the player.
export const PERSONAL_TITLE = 'Cloud Drive Rewatch: Last Season’s Cup Final';
const PERSONAL_SEED = [
  { sys: true, t: '🔒 Passcode-protected room · playing from Sofía’s cloud drive' },
  { n: 'Marco_10', c: '#51a2ff', t: 'No spoilers, I never saw this one 🙈' }, { n: 'Tomás', c: '#fdc700', t: 'Wait for the 80th minute…' },
  { n: 'Ana.Bel', c: '#fb64b6', t: 'Where did you even find this file?' }, { n: 'Marco_10', c: '#51a2ff', t: 'Turn it up!' },
];
const PERSONAL_TALK = [
  ['Tomás', '#fdc700', 'That pass 😮'], ['Ana.Bel', '#fb64b6', 'Rewind that, rewind that!'], ['Marco_10', '#51a2ff', 'Ref was blind that day 😂'],
  ['Ana.Bel', '#fb64b6', 'Best final in years'], ['Tomás', '#fdc700', 'Pause after this, need snacks'],
];
export function PersonalRoom() { return <WatchPartyRoom personal />; }
export function WatchPartyRoom({ personal = false }) {
  const nav = useNav();
  const [closing, close] = useClose();
  const me = useCopy('user.name');
  const host = useRoomHost(personal ? 'Sofía Reyes' : 'Joaquín', img(personal ? 'host-sofia.webp' : 'host-joaquin.webp'));
  const who = personal ? host.name.split(' ')[0] : 'Host';
  const [msgs, addMsg] = useChat(personal ? [...PERSONAL_SEED, { sys: true, t: `${me} entered with the passcode` }] : [
    { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing!!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Let’s goooo' }, { n: 'Jacky_Chen', c: '#c27aff', t: 'Great game!' },
    { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' }, { n: 'User156', c: '#fb64b6', t: 'Best stream ever!' },
    { n: 'User725', c: '#ff8904', t: 'You’re amazing!' }, { n: 'User814', c: '#c27aff', t: 'Keep going! 💪' }, { n: 'User765', c: '#51a2ff', t: 'Love the energy!' },
    { n: 'User106', c: '#00d3f2', t: 'Let’s go team! 💪' }, { n: 'User653', c: '#ff8904', t: 'Love the energy!' },
  ], personal ? null : undefined);
  const [paused, setPaused] = useState(false);
  const [pos, setPos] = useState(100); // 01:40
  const [up, setUp] = useState(1 * 3600 + 32 * 60 + 29); // room uptime 1:32:29
  const [viewers, setViewers] = useState(personal ? 4 : 1742);
  const [ctrls, setCtrls] = useState(true);
  const [seek, setSeek] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [talking, setTalking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [floats, setFloats] = useState([]);
  const hide = useRef(0);
  const pausedRef = useRef(false);
  const poke = () => { setCtrls(true); clearTimeout(hide.current); hide.current = setTimeout(() => !pausedRef.current && setCtrls(false), 3000); }; // controls stay up while paused
  useEffect(() => { poke(); return () => clearTimeout(hide.current); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      setUp((u) => u + 1);
      if (!personal) setViewers((v) => Math.max(1600, v + Math.round((Math.random() - 0.4) * 9)));
      setTalking(Math.random() < 0.45);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (paused) return undefined; const t = setInterval(() => setPos((p) => Math.min(WP_DUR, p + 1)), 1000); return () => clearInterval(t); }, [paused]);
  useEffect(() => { // personal room: the friends keep talking
    if (!personal) return undefined;
    let i = 0;
    const t = setInterval(() => { const [n, c, m] = PERSONAL_TALK[i++ % PERSONAL_TALK.length]; addMsg({ n, c, t: m }); }, 4500);
    return () => clearInterval(t);
  }, []);
  const floatUp = (n = 3) => {
    const add = Array.from({ length: n }, (_, k) => ({ id: Math.random().toString(36).slice(2), d: (Math.random() - 0.5) * 40, delay: k * 90 }));
    setFloats((f) => [...f.slice(-24), ...add]);
    setTimeout(() => setFloats((f) => f.filter((x) => !add.includes(x))), 2400);
  };
  const jump = (d) => { setPos((p) => Math.max(0, Math.min(WP_DUR, p + d))); setSeek({ d, k: Date.now() }); setTimeout(() => setSeek(null), 700); poke(); };
  const toggle = () => { setPaused((v) => { pausedRef.current = !v; addMsg({ sys: true, t: `${who} ${v ? 'resumed' : 'paused'} the ${personal ? 'video' : 'replay'}${v ? '' : ' for everyone'}` }); return !v; }); poke(); };
  const scrub = (e) => { const r = e.currentTarget.getBoundingClientRect(); setPos(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * WP_DUR)); poke(); };
  const pct = (pos / WP_DUR) * 100;
  const tools = [
    { id: 'mic', icon: 'lr-mic', label: muted ? 'Unmute' : 'Mute', onClick: () => { setMuted(!muted); nav.notify(muted ? 'Mic on' : 'Mic muted'); }, pressed: muted },
    { id: 'cam', icon: camOff ? 'chat-camoff' : 'lr-cam', label: camOff ? 'Camera on' : 'Camera off', onClick: () => setCamOff(!camOff), pressed: camOff },
    { id: 'flip', icon: 'chat-swap', label: 'Flip camera', onClick: () => nav.notify('Camera flipped') },
    { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => { setLiked(true); floatUp(4); } },
    { id: 'share', icon: 'lr-share', label: 'Share', onClick: () => nav.notify(personal ? 'Room link copied · send the passcode separately' : 'Watch Party link copied') },
    { id: 'settings', icon: 'settings', label: 'Settings', onClick: nav.dead },
  ];
  return (
    <div className={'p-screen p-lv p-wpr' + (closing ? ' is-closing' : '')}>
      <div className="p-lv__head">
        <div className="p-statusbar p-statusbar--overlay"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color={W} /></div>
        <div className="p-wpr__head">
          <i className="p-wpr__dot" aria-hidden />
          <b>{host.name}</b><span className="p-wpr__sep" /><span>{hms(up)}</span><span className="p-wpr__sep" /><span><em>Viewers:</em> {viewers.toLocaleString('en-US')}</span>
          <button className="p-lv__x" aria-label="Close" onClick={close}><Icon name="lr-close" size={32} color={W} /></button>
        </div>
      </div>
      <div className={'p-wp__video p-wpr__video' + (ctrls ? ' is-ctrls' : '')} onClick={(e) => { if (e.target === e.currentTarget || e.target.tagName === 'CANVAS' || e.target.tagName === 'VIDEO') poke(); }}>
        {isChanged(MATCH_VIDEO) ? <video src={asset(MATCH_VIDEO)} autoPlay muted loop playsInline aria-hidden /> : <MatchCanvas className="p-wp__canvas" paused={paused} />}
        <div className="p-wpr__ctrls">
          <div className="p-wpr__mid">
            <button aria-label="Back 15 seconds" onClick={() => jump(-15)}><Icon name="rewind15" size={36} color={W} /></button>
            <button aria-label={paused ? 'Play' : 'Pause'} onClick={toggle}><Icon name={paused ? 'play-fill' : 'pause'} size={36} color={W} /></button>
            <button aria-label="Forward 15 seconds" onClick={() => jump(15)}><Icon name="forward15" size={36} color={W} /></button>
          </div>
          <div className="p-wpr__bar">
            <span>{hms(pos)}</span>
            <div className="p-vod p-wpr__seek" role="slider" aria-label="Replay position" aria-valuemin={0} aria-valuemax={WP_DUR} aria-valuenow={pos} onClick={scrub}>
              <i className="p-vod__done" style={{ width: pct + '%' }} /><i className="p-vod__knob" style={{ left: `calc(${pct}% - 8px)` }} /><i className="p-vod__rest" />
            </div>
            <span>{hms(WP_DUR)}</span>
          </div>
          <div className="p-wp__icons p-wpr__icons">
            {[['volume', 'Volume'], ['captions', 'Captions'], ['settings', 'Settings']].map(([i, l]) => <button key={i} aria-label={l} onClick={nav.dead}><Icon name={i} size={24} color={W} /></button>)}
            <button aria-label="Full screen" onClick={nav.dead}><img src={asset('assets/watch/rotate-phone.svg')} alt="" width="24" height="24" /></button>
          </div>
        </div>
        {personal && !paused && <span className="p-wpr__paused p-wpr__file"><Icon name="lock" size={10} color={W} />Cloud drive · cup-final-rewatch.mp4</span>}
        {paused && <span className="p-wpr__paused">Paused for everyone</span>}
        {seek && <span key={seek.k} className="p-vplayer__seek p-wpr__seekmsg">{seek.d > 0 ? '+15s' : '−15s'}</span>}
      </div>
      <div className={'p-wpr__cam' + (talking && !muted && !camOff ? ' is-talking' : '')}>
        {camOff ? <span className="p-wpr__camoff"><img src={host.avatar} alt="" /></span> : <img src={img(personal ? 'personal-hostcam.webp' : 'wp-hostcam.webp')} alt="" />}
        <span className="p-wpr__camlabel">{muted && <Icon name="lr-mic" size={10} color="#ff4d6b" />}Host</span>
      </div>
      <div className="p-lv__bottom p-wpr__bottom">
        <div className="p-lv__row">
          <ChatList msgs={msgs} h={250} />
          <div className="p-wpr__tools">
            {tools.map((it) => <button key={it.id} className={'p-wpr__tool' + (it.pressed ? ' is-on' : '')} aria-label={it.label} aria-pressed={it.pressed} onClick={it.onClick}><Icon name={it.icon} size={24} color={W} /></button>)}
          </div>
        </div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-wp__floats p-wpr__floats" aria-hidden="true">{floats.map((f) => <i key={f.id} className="is-heart" style={{ '--d': f.d + 'px', animationDelay: f.delay + 'ms' }} />)}</span>
      <span className="p-homebar" aria-hidden="true" />
    </div>
  );
}
