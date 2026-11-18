// Comments bottom sheet — Modal/Flex 727:50303 (Misc/Comment ×4 + Input/Comment). One shared component:
// any comment icon in the app opens it with nav.openComments(); X or tapping outside closes it.
import { useState } from 'react';
import { Icon, useCopy, useSlot, asset, clubFC } from './ui.jsx';
import { useNav } from '../proto/runtime.jsx';

const av = (f) => asset(`assets/comments/${f}.webp`);

function Comment({ c, small, onReply, onLike }) {
  return (
    <div className={'p-cm__item' + (small ? ' is-reply' : '')}>
      <div className="p-cm__main">
        <img className={'p-cm__photo' + (c.club ? ' is-club' : '')} src={c.photo} alt="" />
        <div className="p-cm__body">
          <div className="p-cm__who">
            <b>{c.name}</b>
            {c.club && <span className="p-verified p-verified--brand"><Icon name="verified" size={8} color="var(--colour-icon-white-overlay)" /></span>}
            <span>{c.when || '1h ago'}</span>
          </div>
          <p>{c.text}</p>
          <button className="p-cm__reply" onClick={() => onReply(c.name)}>Reply</button>
        </div>
      </div>
      <button className="p-cm__like" aria-label={c.liked ? 'Unlike' : 'Like'} aria-pressed={!!c.liked} onClick={onLike}>
        <Icon name={c.liked ? 'cv-like-fill' : 'cv-like'} size={20} color="var(--colour-icon-primary)" />
        <small>{c.likes + (c.liked ? 1 : 0)}</small>
      </button>
    </div>
  );
}

export function CommentsSheet({ onClose }) {
  const team = useCopy('team.main');
  const crest = useSlot('club-crest');
  const me = useSlot('user-avatar');
  const name = useCopy('user.name');
  const [list, setList] = useState(() => [
    { id: 1, name: 'Roberto Silva', photo: av('roberto'), text: 'When will this start?', likes: 8 },
    { id: 2, name: clubFC(team), photo: crest, club: true, text: 'Starting in 10 minutes. Just getting setup here.', likes: 80 },
    { id: 3, name: 'Roberto Silva', photo: av('roberto'), text: 'Thanks!', likes: 2, replies: [
      { id: 31, name: 'Geraldine Jupiter', photo: av('geraldine'), text: 'Great! Thanks for asking!', likes: 10 },
      { id: 32, name: 'Carol Whitecloud', photo: av('carol'), text: '@Geraldine Jupiter Great photo!', likes: 10 },
    ], open: false },
    { id: 4, name: 'Roberto Silva', photo: av('roberto'), text: 'Thanks!', likes: 2, replies: [
      { id: 41, name: 'Geraldine Jupiter', photo: av('geraldine'), text: 'Great! Thanks for asking!', likes: 10 },
      { id: 42, name: 'Carol Whitecloud', photo: av('carol'), text: '@Geraldine Jupiter Great photo!', likes: 10 },
    ], open: true },
  ]);
  const [draft, setDraft] = useState('');
  const upd = (id, fn) => setList((l) => l.map((c) => (c.id === id ? fn(c) : c.replies ? { ...c, replies: c.replies.map((r) => (r.id === id ? fn(r) : r)) } : c)));
  const like = (id) => upd(id, (c) => ({ ...c, liked: !c.liked }));
  const reply = (who) => setDraft(`@${who} `);
  const send = () => { const t = draft.trim(); if (!t) return; setList((l) => [{ id: Date.now(), name, photo: me, text: t, likes: 0, when: 'now' }, ...l]); setDraft(''); };
  return (
    <div className="p-sheet p-cm" role="dialog" aria-modal="true" aria-label="Comments">
      <button className="p-sheet__scrim" aria-label="Close comments" onClick={onClose} />
      <div className="p-sheet__panel p-cm__panel">
        <div className="p-sheet__head"><h2>Comments</h2><button className="p-cm__x" aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button></div>
        <div className="p-cm__list">
          {list.map((c) => (
            <div key={c.id} className="p-cm__thread">
              <Comment c={c} onReply={reply} onLike={() => like(c.id)} />
              {c.replies && c.open && c.replies.map((r) => <Comment key={r.id} c={r} small onReply={reply} onLike={() => like(r.id)} />)}
              {c.replies && (
                <button className="p-cm__more" onClick={() => upd(c.id, (x) => ({ ...x, open: !x.open }))}>
                  <i aria-hidden />{c.open ? 'Hide replies' : `View ${c.replies.length} more replies`}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-cm__input">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Leave a comment..." aria-label="Leave a comment" />
          <button aria-label="Send" onClick={send}><Icon name="send" size={16} color="var(--colour-icon-on-primary)" /></button>
        </div>
      </div>
    </div>
  );
}
