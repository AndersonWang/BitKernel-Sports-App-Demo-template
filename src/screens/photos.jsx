// Photos / Unlike 727:51061 ⇄ Photos / Like 727:51029 — full-screen photo viewer (every Home › Photos album, Photo Albums).
// Membership 1040:51806 — "Pick your plan" (My Space › membership banner): Season plan + add-ons → Apple Pay (1182:58620).
import { useState } from 'react';
import { Header, AppBar, Icon, useCopy, asset, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { ApplePaySheet } from './wallet.jsx';

let photoLiked = false; // the Like state holds while the demo runs, as the two Figma frames do

export function PhotoView() {
  const nav = useNav();
  const [like, setLike] = useState(photoLiked);
  const [toast, setToast] = useState(false);
  const toggle = () => { photoLiked = !like; setLike(photoLiked); };
  // Share → Modal/Toast "Link Copied" (737:66990), same as Clips View
  const share = () => { setToast(true); setTimeout(() => setToast(false), 1600); };
  return (
    <div className="p-screen p-ph">
      <img className="p-ph__img" src={asset('assets/photos/photo-1.webp')} alt="" />
      <span className="p-ph__top" aria-hidden="true" />
      <span className="p-ph__bottom" aria-hidden="true" />
      <header className="p-ph__head">
        <div className="p-statusbar p-statusbar--overlay"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color="var(--colour-icon-white-overlay)" /></div>
        <div className="p-titlebar">
          <button className="p-backbtn" onClick={nav.back} aria-label="Back"><Icon name="back" size={24} color="var(--colour-icon-white-overlay)" /></button>
          {/* Figma shows one photo labelled 1/12; the other 11 aren't designed, so the count is static */}
          <span className="p-ph__count">1/12</span>
          <button className="p-ph__more" aria-label="More" onClick={nav.dead}><Icon name="more" size={24} color="var(--colour-icon-white-overlay)" /></button>
        </div>
      </header>
      <div className="p-ph__bar">
        <span>
          <button aria-label={like ? 'Unlike' : 'Like'} aria-pressed={like} onClick={toggle}><Icon name={like ? 'cv-like-fill' : 'cv-like'} size={24} color="var(--colour-icon-white-overlay)" /><span>{like ? 57 : 56}</span></button>
          <button aria-label="Comments" onClick={nav.openComments}><Icon name="cv-comment" size={24} color="var(--colour-icon-white-overlay)" /><span>8</span></button>
          <button aria-label="Share" onClick={share}><Icon name="cv-share" size={24} color="var(--colour-icon-white-overlay)" /><span>12</span></button>
        </span>
        <button aria-label="Save" onClick={nav.dead}><Icon name="cv-bookmark" size={24} color="var(--colour-icon-white-overlay)" /><span>4</span></button>
      </div>
      {toast && <div className="p-cv__toast" role="status"><Icon name="toast-check" size={24} color="var(--colour-text-primary)" /><span>Link Copied</span></div>}
    </div>
  );
}

const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const BASE = 249.99;
const ADDONS = [
  { id: 'plus', get name() { return tx('BETIS+'); }, price: 6.99, perks: ['Originals and sports channels', '1,000 tokens each month', 'Full VOD archive and replays'] },
  { id: 'premium', name: 'Premium', price: 24.99, perks: ['LaLiga and Champions League live', 'Full VOD archive and replays', 'Post & engage with exclusive content'] },
];
const owned = { addons: [] };

function Perks({ items }) {
  return <ul className="p-plan__perks">{items.map((t) => <li key={t}><Icon name="ms-pass" size={18} color="var(--colour-icon-primary)" />{t}</li>)}</ul>;
}

export function Membership() {
  const nav = useNav();
  const [addons, setAddons] = useState(owned.addons);
  const [pay, setPay] = useState(false);
  const toggle = (id) => { owned.addons = addons.includes(id) ? addons.filter((a) => a !== id) : [...addons, id]; setAddons(owned.addons); };
  // Figma's Purchase button reads 249,99 € (Season only); selected add-ons are added to the total.
  const total = BASE + ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const img = (n) => asset(`assets/membership/m${n}.webp`);
  const cols = [[3, 4, 13, -20], [1, 2, 103, -47], [5, 6, 193, -24], [7, 8, 283, -47]];
  return (
    <div className="p-screen" style={{ background: 'var(--colour-surface-default)' }}>
      <Header back title="Pick your plan" ctas={[]} />
      <main className="p-main">
        <div className="p-plan">
          <div className="p-plan__collage" aria-hidden="true">
            {cols.map(([a, b, left, top]) => (
              <span key={a} style={{ left, top }}><img src={img(a)} alt="" /><img src={img(b)} alt="" /></span>
            ))}
            <i className="is-top" /><i />
          </div>
          <section className="p-plan__card">
            <div className="p-plan__seg" role="tablist" aria-label="Plan length">
              {/* Only Season is designed; Matchday and Monthly have no prices in Figma */}
              <button role="tab" aria-selected="false" onClick={nav.dead}>Matchday</button>
              <button role="tab" aria-selected="false" onClick={nav.dead}>Monthly</button>
              <button role="tab" aria-selected="true" className="is-on">Season</button>
              <span className="p-plan__save">Save 20%</span>
            </div>
            <div className="p-plan__body">
              <div className="p-plan__head">
                <h2>Every match. Every fan derby. No ads.</h2>
                <s>299,99 €/ Season</s>
                <b>249,99 €/ Season</b>
                <span className="p-plan__tag">Renewable Plan</span>
              </div>
              <Perks items={['40 free tokens & prediction credits', 'Participate in exclusive player streams', 'Unlocks predictions for all matches', 'Post & engage with official content']} />
              <button className="p-btn p-btn--block p-plan__selected" aria-pressed="true"><span>Selected</span></button>
            </div>
          </section>
          <hr className="p-plan__divider" />
          <div className="p-plan__addon-title"><h2>Add On</h2><p>To access add-ons, please select a basic plan.</p></div>
          {ADDONS.map((a) => {
            const on = addons.includes(a.id);
            return (
              <section key={a.id} className="p-plan__card is-addon">
                <div className="p-plan__body">
                  <div className="p-plan__head"><h2>{a.name}</h2><b>{eur(a.price)}/month</b></div>
                  <Perks items={a.perks.map(tx)} />
                  <button className={'p-btn p-btn--block ' + (on ? 'p-plan__selected' : 'p-btn--primary')} aria-pressed={on} onClick={() => toggle(a.id)}><span>{on ? 'Selected' : 'Select'}</span></button>
                </div>
              </section>
            );
          })}
          <button className="p-btn p-btn--primary p-plan__buy" onClick={() => setPay(true)}><span>Purchase - {eur(total)}</span></button>
        </div>
      </main>
      <AppBar active="none" />
      {pay && <ApplePaySheet pack={{ price: eur(total) }} onClose={() => setPay(false)} onConfirm={() => setPay(false)} />}
    </div>
  );
}
