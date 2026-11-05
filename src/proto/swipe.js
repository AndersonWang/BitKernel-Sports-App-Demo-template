// Mouse/trackpad drag-to-swipe for every horizontal carousel (.p-hscroll) inside the phone.
// Touch already scrolls natively; on desktop a click-drag now pages the row like a finger swipe,
// then settles on the nearest card (scroll-snap is paused while dragging so the row follows the pointer).
// A drag longer than 6px swallows the click that follows, so swiping never opens a card by accident.
export function attachSwipe(root) {
  let row = null, startX = 0, startLeft = 0, moved = false, lastX = 0, lastT = 0, v = 0;
  const down = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const r = e.target.closest('.p-hscroll');
    if (!r || r.scrollWidth <= r.clientWidth || e.target.closest('input, textarea')) return;
    row = r; startX = lastX = e.clientX; startLeft = r.scrollLeft; moved = false; lastT = performance.now(); v = 0;
  };
  const move = (e) => {
    if (!row) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved) { moved = true; row.style.scrollSnapType = 'none'; row.style.scrollBehavior = 'auto'; row.classList.add('is-dragging'); }
    row.scrollLeft = startLeft - dx;
    const t = performance.now(); v = (e.clientX - lastX) / Math.max(1, t - lastT); lastX = e.clientX; lastT = t;
    e.preventDefault();
  };
  const up = () => {
    if (!row) return;
    const r = row; row = null;
    if (!moved) return;
    r.classList.remove('is-dragging');
    // settle on the nearest card, nudged one card further on a quick flick
    const kids = [...r.children];
    const pad = parseFloat(getComputedStyle(r).paddingLeft) || 0;
    const step = (kids[0]?.offsetWidth || 200) * 0.6;
    const target = r.scrollLeft - Math.max(-step, Math.min(step, v * 180));
    let best = 0, bestD = Infinity;
    kids.forEach((k) => { const d = Math.abs(k.offsetLeft - pad - target); if (d < bestD) { bestD = d; best = k.offsetLeft - pad; } });
    r.style.scrollBehavior = 'smooth';
    r.scrollTo({ left: best, behavior: 'smooth' });
    setTimeout(() => { r.style.scrollSnapType = ''; r.style.scrollBehavior = ''; }, 450);
    const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    root.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => root.removeEventListener('click', swallow, { capture: true }), 0);
  };
  root.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  // Images inside cards would otherwise start a native image drag
  const noDrag = (e) => { if (e.target.closest && e.target.closest('.p-hscroll')) e.preventDefault(); };
  root.addEventListener('dragstart', noDrag);
  return () => {
    root.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    root.removeEventListener('dragstart', noDrag);
  };
}
