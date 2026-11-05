// Wallet / Token — 1228:65161 → Recharge Token sheet (Modal/Flex 1237:36347) → Apple Pay sheet (1247:42640)
// → "Confirm with Side Button" → Wallet / Token / Recharged (1247:42700). Entered from My Space › Token Balance.
import { useState } from 'react';
import { Header, AppBar, SubNav, Icon, asset } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { mySpace, fmt } from './myspace.jsx';

const img = (f) => asset(`assets/myspace/${f}`);

// Utility/Purchase Token Container — 6 packs; 12,000 is pre-selected in Figma
const PACKS = [
  { tokens: 500, price: '9,90 €' },
  { tokens: 1200, bonus: 100, price: '19,90 €' },
  { tokens: 2500, bonus: 400, price: '39,90 €', tag: 'Value' },
  { tokens: 6000, bonus: 1200, price: '89,90 €' },
  { tokens: 12000, bonus: 3000, price: '169,90 €' },
  { tokens: 25000, bonus: 8000, price: '299,90 €' },
];

if (!mySpace.tx) {
  mySpace.tx = [
    { icon: 'wl-tip', title: 'Tip to @userName', date: '2026-10-02 10:15:26', amount: -20 },
    { icon: 'wl-unlock', title: 'Content unlock', date: '2026-10-01 10:15:26', amount: -120 },
    { icon: 'wl-tip', title: 'Tip to @userName', date: '2026-10-01 10:15:26', amount: -20 },
    { icon: 'wl-tip', title: 'Tip to @userName', date: '2026-10-01 10:15:26', amount: -20 },
  ];
}

const Coin = ({ size = 16 }) => <img className="p-coin" src={img('coin.svg')} alt="" style={{ width: size, height: size, '--s': size + 'px' }} />;

function RechargeSheet({ pick, setPick, onClose, onApplePay }) {
  const nav = useNav();
  return (
    <div className="p-sheet" role="dialog" aria-modal="true" aria-label="Recharge Token">
      <button className="p-sheet__scrim" aria-label="Close" onClick={onClose} />
      <div className="p-sheet__panel p-wl__sheet">
        <div className="p-sheet__head"><h2>Recharge Token</h2><button aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <p className="p-wl__balance">Token Balance: {fmt(mySpace.tokens)}</p>
        <div className="p-wl__packs" role="radiogroup" aria-label="Token packs">
          {PACKS.map((p, i) => (
            <button key={p.tokens} role="radio" aria-checked={pick === i} className={'p-wl__pack' + (pick === i ? ' is-selected' : '')} onClick={() => setPick(i)}>
              {p.tag && <span className="p-wl__tag">{p.tag}</span>}
              <span className="p-wl__packtokens"><Coin />{fmt(p.tokens)}</span>
              {p.bonus && <span className="p-wl__bonus">+{fmt(p.bonus)} bonus</span>}
              <span className="p-wl__price">{p.price}</span>
            </button>
          ))}
        </div>
        <div className="p-wl__bottom">
          <p className="p-wl__policy">By continuing, you agree to <b>Virtual Items Policy</b></p>
          <button className="p-btn p-btn--primary p-wl__cta" onClick={nav.dead}>Purchase</button>
          <button className="p-btn p-btn--secondary p-wl__cta" onClick={onApplePay}>Pay with <span className="p-wl__apay"><Icon name="apple" w={13} h={15} color="var(--colour-text-on-secondary)" />Pay</span></button>
        </div>
      </div>
    </div>
  );
}

// Apple Pay Sheet/iPhone — native iOS sheet, so it keeps Apple's light styling in every theme
export function ApplePaySheet({ pack, onClose, onConfirm }) {
  const nav = useNav();
  return (
    <div className="p-sheet p-apay" role="dialog" aria-modal="true" aria-label="Apple Pay">
      <button className="p-sheet__scrim" aria-label="Cancel" onClick={onClose} />
      <div className="p-apay__panel">
        <div className="p-apay__title"><span><Icon name="apple" w={21} h={24} color="#000" />Pay</span><button className="p-apay__x" aria-label="Cancel" onClick={onClose}><Icon name="close" size={20} color="#999" /></button></div>
        <div className="p-apay__rows">
          <button className="p-apay__row" onClick={nav.dead}><img src={img('apple-card.png')} alt="" className="p-apay__card" /><span><b>Apple Card</b><i>•••• 1234</i><i>27 Fredrick Butte Rd, Brothers OR 97712 United States</i></span><Icon name="chevron-right" size={16} color="#c4c4c6" /></button>
          <button className="p-apay__row" onClick={nav.dead}><span className="p-apay__ic"><svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="5.5" r="3.5" fill="#000"/><path d="M2 16c0-3.6 3.1-6 7-6s7 2.4 7 6z" fill="#000"/></svg></span><span><i>Contact</i><b>j.appleseed@icloud.com</b><b>(458) 555-2863</b></span><Icon name="chevron-right" size={16} color="#c4c4c6" /></button>
          <button className="p-apay__row" onClick={nav.dead}><span className="p-apay__ic"><svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="6" r="4" fill="#000"/><rect x="8.25" y="9" width="1.5" height="7" rx=".75" fill="#000"/></svg></span><span><i className="is-dark">Ship to</i><b>John Appleseed</b><b>27 Fredrick Butte Rd</b><b>Brothers OR 97712</b><b>United States</b></span><Icon name="chevron-right" size={16} color="#c4c4c6" /></button>
        </div>
        <button className="p-apay__confirm" onClick={onConfirm}>
          <span className="p-apay__amount"><i>Pay Merchant Name</i><b>{pack.price}</b><Icon name="chevron-right" size={16} color="#c4c4c6" /></span>
          <img src={img('applepay-side.svg')} alt="" />
          <span className="p-apay__side">Confirm with Side Button</span>
        </button>
      </div>
    </div>
  );
}

export function Wallet() {
  const nav = useNav();
  const [sheet, setSheet] = useState(null); // null | 'recharge' | 'applepay'
  const [pick, setPick] = useState(4);
  const [, bump] = useState(0);
  const confirm = () => {
    const p = PACKS[pick];
    // Figma's Recharged frame credits the pack size only (1,250 + 12,000 = 13,250); the bonus isn't added.
    mySpace.tokens += p.tokens;
    mySpace.tx = [{ icon: 'ms-wallet', title: 'Token Purchase', date: '2026-10-03 10:15:26', amount: p.tokens }, ...mySpace.tx];
    setSheet(null); bump((n) => n + 1);
    nav.notify(`${fmt(p.tokens)} tokens added`);
  };
  const tabs = [{ id: 'tokens', label: 'Tokens' }, { id: 'tickets', label: 'Tickets' }, { id: 'prediction', label: 'Prediction' }];
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back title="Wallet" ctas={['bell', 'search']} />
      <main className="p-main">
        <div className="p-wl">
          <SubNav items={tabs} active="tokens" onSelect={(t) => t.id !== 'tokens' && nav.dead()} />
          <div className="p-wl__balwrap">
            <div className="p-wl__card">
              <span className="p-wl__cardl">
                <Coin size={28} />
                <span><small>Token Balance</small><span className="p-ms__amount"><b>{fmt(mySpace.tokens)}</b><small>Tokens</small></span></span>
              </span>
              <button className="p-btn p-btn--primary p-wl__recharge" onClick={() => setSheet('recharge')}>Recharge</button>
            </div>
            <p className="p-wl__note">Spendable on tips, gifts and unlocks. Tokens are not withdrawable.</p>
          </div>
          <div className="p-wl__history">
            <button className="p-btn p-btn--secondary p-btn--block" onClick={nav.dead}><Icon name="wl-history" size={18} color="var(--colour-icon-on-secondary)" /><span>View History</span></button>
            <div className="p-wl__activity">
              <h3>Recent Activity</h3>
              {mySpace.tx.map((t, i) => (
                <button key={i} className="p-wl__tx" onClick={nav.dead}>
                  <span className="p-wl__txl"><Icon name={t.icon} size={20} /><span><b>{t.title}</b><small>{t.date}</small></span></span>
                  <span className={'p-wl__amt' + (t.amount > 0 ? ' is-plus' : '')}>{t.amount > 0 ? '+' + fmt(t.amount) : t.amount}<Icon name="chevron-right" size={14} /></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <AppBar active="none" />
      {sheet === 'recharge' && <RechargeSheet pick={pick} setPick={setPick} onClose={() => setSheet(null)} onApplePay={() => setSheet('applepay')} />}
      {sheet === 'applepay' && <ApplePaySheet pack={PACKS[pick]} onClose={() => setSheet('recharge')} onConfirm={confirm} />}
    </div>
  );
}
