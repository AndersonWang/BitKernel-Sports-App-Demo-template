// Live rooms (overlays: slide up from the bottom, X slides them back down).
// Live / Default 638:19792 (Peña New York) — side menu laid out as in the Figma flow, left → right:
//   Join → Join Co-Host 638:19820 → Leave → End Co-Host 638:19832
//   Gifts → Send Gifts sheet 638:19806 → gift picked 638:19813 → sent 638:19798 (rose)
//   Shop: merch bar appears 5 s in (638:19953) → Shop Drawer 638:20231 → Item Detail 638:20511
//         → Buy Now → Apple Pay 638:20535 → Order Confirmed 638:20561
//         → Add to Cart → Drawer with badge 638:20599 → Cart 638:20881 → Checkout
// Watch Party 638:21603 · Challenge Room 795:42089 → Selected 795:42135 → Result 795:42181
import { useEffect, useRef, useState } from 'react';
import { Icon, AppBar, useSlot, useCopy, asset, videoProps, tx, MatchMedia } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { mySpace, fmt } from './myspace.jsx';
import { ApplePaySheet } from './wallet.jsx';

const img = (f) => asset(`assets/live/${f}`);
const W = 'var(--colour-icon-white-overlay)';

// ---- shared pieces -------------------------------------------------------

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
function useChat(seed = SEED) {
  const [msgs, setMsgs] = useState(seed);
  const i = useRef(0);
  useEffect(() => {
    const t = setInterval(() => { setMsgs((m) => [...m.slice(-11), MORE[i.current++ % MORE.length]]); }, 2600);
    return () => clearInterval(t);
  }, []);
  return [msgs, (m) => setMsgs((list) => [...list.slice(-11), m])];
}

function ChatList({ msgs, h = 178 }) {
  return (
    <div className="p-lv__chat" style={{ height: h }} aria-live="polite">
      {msgs.map((m, k) => (
        <div key={k} className="p-lv__msg">
          <b style={{ color: m.c }}>{m.n}</b>
          {m.tip ? (
            <span className="p-lv__tip">Tipped
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
function ChatBar({ onSend }) {
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
      <button className="p-lv__crown" aria-label="Membership" onClick={nav.dead}><Icon name="lr-crown" size={24} color="#1e1e1e" /></button>
    </div>
  );
}

// Header/Web Mobile, type=live: host pill + Follow/Following + X
function LiveHeader({ name, avatar, contain, viewers = '13.3K', following: init = true, onClose, children }) {
  const [following, setFollowing] = useState(init);
  return (
    <div className="p-lv__head">
      <div className="p-statusbar p-statusbar--overlay"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color={W} /></div>
      <div className="p-lv__headrow">
        {children || (
          <div className="p-lv__host">
            <img src={avatar} alt="" style={contain ? { objectFit: 'contain' } : undefined} />
            <span className="p-lv__hostinfo"><b>{name}</b><span><Icon name="lr-users" size={12} color={W} />{viewers}</span></span>
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

function GiftSheet({ onClose, onSent }) {
  const nav = useNav();
  const [pick, setPick] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const send = () => {
    const g = GIFTS[pick];
    const cost = g.price * qty;
    if (cost > mySpace.tokens) return nav.notify('Not enough tokens');
    mySpace.tokens -= cost;
    onSent(g, qty, msg);
  };
  return (
    <div className="p-sheet p-lv__sheet" role="dialog" aria-modal="true" aria-label="Send Gifts">
      <button className="p-sheet__scrim is-clear" aria-label="Close" onClick={onClose} />
      <div className="p-sheet__panel p-gift">
        <div className="p-sheet__head"><h2>Send Gifts</h2><button aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <div className="p-gift__body">
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

function useGifts(addMsg) {
  const me = useCopy('user.name');
  const [sheet, setSheet] = useState(false);
  const [burst, setBurst] = useState(null);
  const onSent = (g, qty, msg) => {
    setSheet(false);
    setBurst(g.src);
    setTimeout(() => setBurst(null), 1800);
    addMsg({ n: me, c: '#ffffff', tip: 'gift', giftImg: g.src, x: 'x' + qty });
    if (msg.trim()) addMsg({ n: me, c: '#ffffff', t: msg.trim() });
  };
  const ui = <>{burst && <GiftBurst src={burst} />}{sheet && <GiftSheet onClose={() => setSheet(false)} onSent={onSent} />}</>;
  return [() => setSheet(true), ui];
}

// ---- Shop (merch bar → drawer → item / cart → Apple Pay → confirmation) --
const ITEMS = [
  { id: 'home', get name() { return tx('Real Betis Home Jersey'); }, price: 89.99, get thumb() { return img('jersey-1.webp'); } },
  { id: 'special', get name() { return tx('Real Betis Special Edition Jersey'); }, price: 89.99, get thumb() { return img('jersey-2.webp'); } },
  { id: 'away', get name() { return tx('Real Betis Away Jersey'); }, price: 79.99, get thumb() { return img('jersey-3.webp'); }, crop: true },
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
function CoHostToolbar({ onLeave }) {
  const [mute, setMute] = useState(false);
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
        : <video className="p-lv__bg" {...videoProps('assets/live/live-bg.mp4', 'assets/live/live-bg-poster.webp')} autoPlay muted loop playsInline aria-hidden />}
      <LiveHeader name={team} avatar={crest} contain onClose={close} />
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

// ---- Watch Party — 638:21603 (Live Room/Vertical, User=Creator) ------------
export function WatchParty() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const [closing, close] = useClose();
  // Chat as in the latest Figma (638:21603): the first 15 of its 42 messages fill the 364px chat area.
  const [msgs, addMsg] = useChat([
    { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing!!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Let’s goooo' }, { n: 'Jacky_Chen', c: '#c27aff', t: 'Great game!' },
    { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' }, { n: 'User156', c: '#fb64b6', t: 'Best stream ever!' },
    { n: 'User725', c: '#ff8904', t: 'You’re amazing!' }, { n: 'User814', c: '#c27aff', t: 'Keep going! 💪' }, { n: 'User765', c: '#51a2ff', t: 'Love the energy!' },
    { n: 'User106', c: '#00d3f2', t: 'Let’s go team! 💪' }, { n: 'User653', c: '#ff8904', t: 'Love the energy!' }, { n: 'User750', c: '#fdc700', t: 'Love the energy!' },
    { n: 'User180', c: '#fb64b6', t: 'This is incredible!' }, { n: 'User476', c: '#fb64b6', t: 'Love the energy!' }, { n: 'User242', c: '#ff637e', t: 'This is incredible!' },
  ]);
  const [paused, setPaused] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [liked, setLiked] = useState(false);
  const side = [
    { id: 'mic', icon: 'lr-mic', label: mic ? 'Mute' : 'Unmute', onClick: () => setMic(!mic), pressed: !mic, text: false },
    { id: 'cam', icon: 'lr-cam', label: cam ? 'Camera off' : 'Camera on', onClick: () => setCam(!cam), pressed: !cam, text: false },
    { id: 'flip', icon: 'chat-swap', label: 'Flip camera', onClick: nav.dead, text: false },
    { id: 'like', icon: liked ? 'cv-like-fill' : 'lr-like', label: 'Like', onClick: () => setLiked(!liked), pressed: liked, text: false },
    { id: 'share', icon: 'lr-share', label: 'Share', onClick: nav.dead, text: false },
    { id: 'room', icon: 'settings', label: 'Room settings', onClick: nav.dead, text: false },
  ];
  return (
    <div className={'p-screen p-lv p-wp' + (closing ? ' is-closing' : '')}>
      <LiveHeader onClose={close}>
        <div className="p-wp__title"><i aria-hidden="true" /><b>{team}</b><u aria-hidden="true" /><b>1:32:29</b><u aria-hidden="true" /><span><small>Viewers:</small> <b>1742</b></span></div>
      </LiveHeader>
      <div className="p-wp__video">
        <MatchMedia still={img('wp-video.webp')} />
        <span className="p-wp__mask" />
        <div className="p-wp__ctrl">
          <button aria-label="Back 15 seconds" onClick={nav.dead}><Icon name="rewind15" size={36} color={W} /></button>
          <button aria-label={paused ? 'Play' : 'Pause'} onClick={() => setPaused(!paused)}><Icon name={paused ? 'play-fill' : 'pause'} size={36} color={W} /></button>
          <button aria-label="Forward 15 seconds" onClick={nav.dead}><Icon name="forward15" size={36} color={W} /></button>
        </div>
        <div className="p-wp__vod"><span>01:40</span><div className="p-vod"><i className="p-vod__done" /><i className="p-vod__knob" /><i className="p-vod__buf" /><i className="p-vod__rest" /></div><span>2:30:00</span></div>
        <div className="p-wp__icons">
          {[['volume', 'Volume'], ['captions', 'Captions'], ['settings', 'Settings']].map(([i, l]) => <button key={i} aria-label={l} onClick={nav.dead}><Icon name={i} size={24} color={W} /></button>)}
          <button aria-label="Full screen" onClick={nav.dead}><img src={asset('assets/watch/rotate-phone.svg')} alt="" width="24" height="24" /></button>
        </div>
      </div>
      <div className="p-lv__bottom p-wp__bottom">
        <div className="p-lv__row"><ChatList msgs={msgs} h={364} /><SideBar items={side} /></div>
        <ChatBar onSend={addMsg} />
      </div>
      <span className="p-homebar" aria-hidden="true" />
    </div>
  );
}

// ---- Challenge Room — Options 795:42089 → Selected 795:42135 → Result 795:42181
const VOTES = { Andrew: { n: 20, pct: 59, cls: 'is-a' }, Lucas: { n: 18, pct: 41, cls: 'is-b' } };
export function ChallengeRoom() {
  const [closing, close] = useClose();
  const nav = useNav();
  const [msgs, addMsg] = useChat([
    { n: 'Sarah Lnd', c: '#51a2ff', t: 'Amazing kick!!' }, { n: 'Mike2124', c: '#fb64b6', t: 'Let’s goo' }, { n: 'Jacky_Chen', c: '#c27aff', tip: 'gift', x: 'x5' },
    { n: 'Jacky_Chen', c: '#c27aff', t: 'Very nice!!' }, { n: 'User123', c: '#00d3f2', tip: 'coin', x: 'x500' }, { n: 'User156', c: '#fdc700', t: 'So talented!! ❤️❤️❤️❤️' }, { n: 'Sarah Lnd', c: '#51a2ff', t: '🔥' },
  ]);
  const [openGifts, giftsUI] = useGifts(addMsg);
  const [vote, setVote] = useState(null);
  const [result, setResult] = useState(false);
  const [left, setLeft] = useState(600);
  const [liked, setLiked] = useState(false);
  useEffect(() => { const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  const cast = (who) => { if (vote) return; setVote(who); setTimeout(() => setResult(true), 900); };
  const mm = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  return (
    <div className={'p-screen p-lv p-ch' + (closing ? ' is-closing' : '')}>
      <LiveHeader name="Ferreirinha" avatar={img('av-ferreirinha.webp')} following={false} onClose={close} />
      <div className="p-ch__media">
        <img src={img('pk-a.webp')} alt="" /><img src={img('pk-b.webp')} alt="" />
        <span className="p-ch__timer"><Icon name="replay" size={14} color={W} />{mm}</span>
        <span className="p-ch__tag is-a"><img src={img('av-andrew.webp')} alt="" />Andrew Chavez</span>
        <span className="p-ch__tag is-b"><img src={img('av-lucas.webp')} alt="" />Lucas Veríssimo</span>
      </div>
      <div className="p-ch__vote">
        <b>Who’s the better kicker?</b>
        {result ? (
          <div className="p-ch__bars">
            {Object.entries(VOTES).map(([k, v]) => (
              <div key={k} className={'p-ch__bar ' + v.cls + (vote === k ? ' is-mine' : '')}>
                <i style={{ width: v.pct + '%' }} /><b>{k}</b><span><small>{v.n} votes</small><b>{v.pct}%</b></span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-ch__opts">
            {Object.keys(VOTES).map((k) => <button key={k} className={vote === k ? 'is-sel' : ''} aria-pressed={vote === k} onClick={() => cast(k)}>{k}</button>)}
          </div>
        )}
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
        : <video className="p-lv__bg" {...videoProps('assets/live/live-bg.mp4', 'assets/live/live-bg-poster.webp')} autoPlay muted loop playsInline aria-hidden />}
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
