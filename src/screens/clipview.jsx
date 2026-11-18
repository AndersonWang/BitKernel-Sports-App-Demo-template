// Clips View — Unlike 727:50937 ⇄ Like 727:51573: a short-video overlay that slides up from the bottom; X slides it down.
// Opened from Homepage › Photos (first card) and the clip cards. Like swaps the two states; Share shows Modal/Toast 737:66990.
import { useState } from 'react';
import { Icon, useCopy, useSlot, asset, tx, clubFC, MatchMedia, CLIP_VIDEO } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';

let liked = false; // keeps the Like state while the demo runs, as the two Figma frames do

export function ClipView() {
  const nav = useNav();
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const [like, setLike] = useState(liked);
  const [toast, setToast] = useState(false);
  const [closing, setClosing] = useState(false);
  // X slides the overlay back down, then returns to the screen underneath
  const close = () => { if (closing) return; setClosing(true); setTimeout(nav.back, 260); };
  const toggle = () => { liked = !like; setLike(liked); };
  const share = () => { setToast(true); setTimeout(() => setToast(false), 1600); };
  const items = [
    { id: 'like', icon: like ? 'cv-like-fill' : 'cv-like', n: like ? 57 : 56, onClick: toggle, label: like ? 'Unlike' : 'Like', pressed: like },
    { id: 'comment', icon: 'cv-comment', n: 8, onClick: nav.openComments, label: 'Comments' },
    { id: 'save', icon: 'cv-bookmark', n: 4, onClick: nav.dead, label: 'Save' },
    { id: 'share', icon: 'cv-share', n: 12, onClick: share, label: 'Share' },
  ];
  return (
    <div className={'p-screen p-cv' + (closing ? ' is-closing' : '')}>
      <MatchMedia className="p-cv__media" video={CLIP_VIDEO} still={asset('assets/home/clip-view.webp')} />
      <div className="p-statusbar p-statusbar--overlay"><span>9:41</span><Icon name="status-bar" w={65.272} h={12} color="var(--colour-icon-white-overlay)" /></div>
      <button className="p-cv__close" aria-label="Close" onClick={close}><Icon name="close32" size={32} color="var(--colour-icon-white-overlay)" /></button>
      <div className="p-cv__bottom">
        <div className="p-cv__text">
          <span className="p-cv__tag"><img src={crest} alt="" />{clubFC(team)}</span>
          <p><span>{tx(`${team} STUN Real Madrid with last-second equalizer`)}</span><b>more</b></p>
        </div>
        <div className="p-cv__bar">
          {items.map((it) => (
            <button key={it.id} aria-label={it.label} aria-pressed={it.pressed} onClick={it.onClick}>
              <Icon name={it.icon} size={24} color="var(--colour-icon-white-overlay)" /><span>{it.n}</span>
            </button>
          ))}
        </div>
      </div>
      {toast && <div className="p-cv__toast" role="status"><Icon name="toast-check" size={24} color="var(--colour-text-primary)" /><span>Link Copied</span></div>}
    </div>
  );
}
