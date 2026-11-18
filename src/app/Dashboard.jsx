import { VERSION, UPDATED_LABEL } from '../version.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useConfig, setConfig, defaultConfig, getSaveError, getConfig, isConfigFile, sanitiseConfig, switchTheme, defaultFor, copyOf, clientZipName, configFileName, isGenericMode, clientFor, teamName } from '../config/store.js';
import { storeFile, resolveMedia, pruneMedia, inlineMedia, absorbDataUrls, checkVideo } from '../config/media.js';
import { optimizeImage, optimizeVideo, parseSize } from '../config/optimize.js';
import MEDIA from '../config/media.json';
import { fileKey, themedPath, themedUrl, themeStill } from '../components/ui.jsx';
import { JOURNEYS, ASSET_SLOTS, COPY_FIELDS, SCREENS, TABS } from '../config/registry.js';
import { MODES, resolveTokens, parseThemeJson, contrastReport, launchColours, themeLaunchColours } from '../tokens/theme.js';
import { buildOfflineZip, buildClientZip, download } from './package.js';
import { hashPassword } from './client.jsx';
import { themeCopy } from '../tokens/themeText.js';
import { Device } from './Player.jsx';
import { sectionsOf } from '../config/sections.js';

const set = (fn) => setConfig((c) => { const n = structuredClone(c); fn(n); return n; });
const readFile = (file, as = 'text') => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = err; as === 'url' ? r.readAsDataURL(file) : r.readAsText(file); });

export default function Dashboard() {
  const config = useConfig();
  const [previewKey, setPreviewKey] = useState(0);
  const saveError = getSaveError();
  return (
    <div className="app-dash">
      <div className="app-dash__panels">
        <p className="app-version" title={`Build ${typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'}`}>Sports App Demo framework <b>v{VERSION}</b>{UPDATED_LABEL && <> · Updated {UPDATED_LABEL}</>}</p>
        <p className="app-intro">Changes apply instantly and are saved in this browser only, so you can't change the demo for anyone else. To hand your setup to someone, use Export config, then they use Import config.</p>
        {saveError && <p className="app-err">{saveError}</p>}
        <PanelToolbar />
        <ClientPanel config={config} />
        <SectionsPanel config={config} />
        <ThemePanel config={config} />
        <LaunchPanel config={config} />
        <AssetsPanel config={config} />
        <VideosPanel config={config} />
        <CopyPanel config={config} />
        <PackagePanel config={config} />
      </div>
      <aside className="app-dash__preview">
        <div className="app-dash__previewbar"><span>Live preview</span><button onClick={() => setPreviewKey((k) => k + 1)}>Reset</button></div>
        <div className="app-phone app-phone--sm"><Device key={previewKey} config={config} initial="home" /></div>
      </aside>
    </div>
  );
}

// Collapsible panels: each header toggles its panel; open/closed is remembered in this browser.
// Long lists (images, videos, copy) start collapsed so the page opens short.
const PANEL_KEY = 'bk-configure-panels';
const PANEL_DEFAULT_OPEN = new Set(['Client', 'Sections', 'Theme', 'Save & share settings', 'Client link']);
let panelOpen = (() => { try { return JSON.parse(localStorage.getItem(PANEL_KEY)) || {}; } catch { return {}; } })();
const panelSubs = new Set();
const isPanelOpen = (title) => panelOpen[title] ?? PANEL_DEFAULT_OPEN.has(title);
const setPanels = (next) => { panelOpen = { ...panelOpen, ...next }; try { localStorage.setItem(PANEL_KEY, JSON.stringify(panelOpen)); } catch { /* this visit only */ } panelSubs.forEach((f) => f()); };
const PANEL_TITLES = ['Client', 'Sections', 'Theme', 'Opening animation', 'Images', 'Videos', 'Copy', 'Save & share settings'];
function usePanels() { const [, force] = useState(0); useEffect(() => { const f = () => force((n) => n + 1); panelSubs.add(f); return () => panelSubs.delete(f); }, []); }
function PanelToolbar() {
  usePanels();
  const all = PANEL_TITLES;
  const anyOpen = all.some(isPanelOpen);
  return (
    <div className="app-paneltools">
      <button className="app-ghost" onClick={() => setPanels(Object.fromEntries(all.map((t) => [t, true])))}>Expand all</button>
      <button className="app-ghost" disabled={!anyOpen} onClick={() => setPanels(Object.fromEntries(all.map((t) => [t, false])))}>Collapse all</button>
    </div>
  );
}
function Panel({ title, hint, children }) {
  usePanels();
  const open = isPanelOpen(title);
  const id = 'panel-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <section className={'app-panel' + (open ? '' : ' is-collapsed')} aria-labelledby={id + '-h'}>
      <header>
        <h2 id={id + '-h'}>
          <button type="button" className="app-panel__toggle" aria-expanded={open} aria-controls={id} onClick={() => setPanels({ [title]: !open })}>
            <span>{title}</span><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </h2>
        {hint && <p>{hint}</p>}
      </header>
      <div id={id} className="app-panel__body" hidden={!open}>{children}</div>
    </section>
  );
}

function ClientPanel({ config }) {
  return (
    <Panel title="Client" hint="Shown above the journey list in Play, on the password screen and browser tab, and used to name every exported file.">
      <div className="app-grid2">
        {isGenericMode(config.theme.mode)
          ? <label>Client name<input value={config.client.name} onChange={(e) => set((c) => { c.client = clientFor(c.theme.mode, e.target.value); })} /></label>
          : <label>Client name<input value={config.client.name} readOnly aria-describedby="client-from-theme" /></label>}
        <label>Slug<input value={config.client.slug} readOnly /></label>
        <p id="client-from-theme" className="app-hint" style={{ gridColumn: '1 / -1', margin: 0 }}>{isGenericMode(config.theme.mode) ? 'Generic theme: type the client name; the slug follows it.' : <>From the theme “{config.theme.mode}”. To rename the client, rename that mode in the theme JSON; the slug and file names follow.</>}</p>
      </div>
    </Panel>
  );
}

// Configure › Sections: the journey list in Play. Rename, reorder, show/hide, and add sections that open on an
// existing screen (src/config/sections.js). New screens need a Figma design first.
function SectionsPanel({ config }) {
  const saved = sectionsOf(config);
  const [adding, setAdding] = useState(null); // { name, start }
  // Drag to reorder by the ⠿ handle (mouse, pen or touch); the arrows stay for keyboard users.
  const olRef = useRef();
  const [drag, setDrag] = useState(null); // { from, to }
  const list = drag ? (() => { const l = [...saved]; const [x] = l.splice(drag.from, 1); l.splice(drag.to, 0, x); return l; })() : saved;
  // Listeners sit on window: React moves the dragged row in the DOM, which would drop pointer capture on the handle
  const dragRef = useRef(null);
  const startDrag = (e, i) => {
    e.preventDefault();
    dragRef.current = { from: i, to: i };
    setDrag(dragRef.current);
    const move = (ev) => { const to = overIndex(ev.clientY); if (to !== dragRef.current.to) { dragRef.current = { ...dragRef.current, to }; setDrag(dragRef.current); } };
    const up = (ev) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      const d = dragRef.current; dragRef.current = null; setDrag(null);
      if (ev.type === 'pointerup' && d && d.from !== d.to) { const ids = saved.map((x) => x.id); const [x] = ids.splice(d.from, 1); ids.splice(d.to, 0, x); saveOrder(ids); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  };
  const overIndex = (y) => {
    const rows = [...olRef.current.children];
    const idx = rows.findIndex((r) => { const b = r.getBoundingClientRect(); return y < b.top + b.height / 2; });
    return idx === -1 ? rows.length - 1 : idx;
  };
  const saveOrder = (ids) => set((c) => { c.sections.order = ids; });
  const move = (i, d) => { const ids = list.map((x) => x.id); const j = i + d; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; saveOrder(ids); };
  const groups = JOURNEYS.filter((j) => !j.inDesign && !j.listOnly).map((j) => ({ j, screens: Object.entries(SCREENS).filter(([, s]) => s.journey === j.id && s.status === 'built' && !s.overlay) }));
  const add = () => {
    const name = adding.name.trim(); if (!name || !SCREENS[adding.start]) return;
    const id = 'custom-' + Date.now().toString(36);
    set((c) => { c.sections.custom.push({ id, name, start: adding.start }); c.flags[id] = true; c.sections.order = [...list.map((x) => x.id), id]; });
    setAdding(null);
  };
  return (
    <Panel title="Sections" hint="The section list beside the phone in Play (desktop). Off hides a section and every way into it: home sections, app-bar tab and buttons. Rename here, drag ⠿ (or use the arrows) to reorder; Add section opens on any existing screen.">
      <ol className={'app-sections' + (drag ? ' is-dragging' : '')} ref={olRef}>
        {list.map((j, i) => {
          const built = !j.custom && !j.inDesign && Object.values(SCREENS).filter((s) => s.journey === j.id && s.status === 'built').length;
          const note = j.inDesign ? 'Can\u2019t be switched on until its screens are built'
            : j.custom ? `Opens on ${SCREENS[j.start].name.split(' (')[0]}` + (config.flags[j.journey] === false ? ' · its screens are off (turn on the section they belong to)' : '')
            : j.listOnly ? 'Shortcut to My Space › Play with a ready-made avatar · off removes only the shortcut'
            : j.onHold ? 'On hold until links are sorted'
            : `${built} screens` + (j.hub ? ' · off removes it from the list only' : '') + (j.id === 'login' ? ' · off = demo opens on Homepage' : '') + (TABS.find((t) => t.journey === j.id && !t.always) ? ' · has app-bar tab' : '');
          return (
            <li key={j.id} className={(j.inDesign ? 'is-design' : '') + (drag && i === drag.to ? ' is-drag' : '')}>
              <span className="app-sections__grip" role="button" tabIndex={-1} aria-label={`Drag to reorder ${j.label}`} title="Drag to reorder"
                onPointerDown={(e) => startDrag(e, i)}>⠿</span>
              <input type="checkbox" aria-label={`Show ${j.label}`} disabled={j.onHold} checked={j.on} onChange={(e) => set((c) => { c.flags[j.id] = e.target.checked; })} />
              <div className="app-sections__main">
                <input className="app-sections__name" value={(config.sections.names || {})[j.id] ?? (j.custom ? j.name : '')} placeholder={j.name} disabled={j.inDesign} aria-label={`Name of ${j.name}`}
                  onChange={(e) => set((c) => { if (j.custom) { const x = c.sections.custom.find((y) => y.id === j.id); if (x) x.name = e.target.value || x.name; } else if (e.target.value.trim()) c.sections.names[j.id] = e.target.value; else delete c.sections.names[j.id]; })} />
                <small>{j.inDesign && <em className="app-tag">In design</em>}{j.key && <em title="Marked ★ in Figma"> ★ </em>}{note}</small>
              </div>
              <div className="app-sections__acts">
                <button className="app-ghost" aria-label={`Move ${j.label} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button className="app-ghost" aria-label={`Move ${j.label} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</button>
                {j.custom && <button className="app-ghost" onClick={() => set((c) => { c.sections.custom = c.sections.custom.filter((x) => x.id !== j.id); delete c.flags[j.id]; delete c.sections.names[j.id]; c.sections.order = c.sections.order.filter((x) => x !== j.id); })}>Remove</button>}
              </div>
            </li>
          );
        })}
      </ol>
      {adding ? (
        <div className="app-grid2 app-sections__add">
          <label>Section name<input autoFocus value={adding.name} placeholder="e.g. Matchday" onChange={(e) => setAdding({ ...adding, name: e.target.value })} /></label>
          <label>Opens on
            <select value={adding.start} onChange={(e) => setAdding({ ...adding, start: e.target.value })}>
              <option value="">Pick a screen</option>
              {groups.map(({ j, screens }) => <optgroup key={j.id} label={j.name}>{screens.map(([id, s]) => <option key={id} value={id}>{s.name.split(' (')[0]}</option>)}</optgroup>)}
            </select>
          </label>
          <div className="app-row"><button onClick={add} disabled={!adding.name.trim() || !adding.start}>Add section</button><button className="app-ghost" onClick={() => setAdding(null)}>Cancel</button></div>
          <small className="app-hint">Added at the end of the list; drag it by ⠿ or use the arrows to move it. A section can only open on a screen that exists: a new screen needs a Figma design first.</small>
        </div>
      ) : <div className="app-row"><button onClick={() => setAdding({ name: '', start: '' })}>+ Add section</button>{(config.sections.order.length > 0 || Object.keys(config.sections.names).length > 0) && <button className="app-ghost" onClick={() => set((c) => { c.sections.order = []; c.sections.names = {}; })}>Reset order and names</button>}</div>}
    </Panel>
  );
}

function ThemePanel({ config }) {
  const file = useRef();
  const [msg, setMsg] = useState(null);
  const tokens = useMemo(() => resolveTokens(config.theme.mode, config.theme.overrides), [config.theme]);
  const report = useMemo(() => contrastReport(tokens), [tokens]);
  const onImport = async (f) => {
    try {
      const json = JSON.parse(await readFile(f));
      if (isConfigFile(json)) throw new Error('This looks like an exported config, not a token file. Use Import config at the bottom of this page.');
      const { overrides, unknown, missing, skipped } = parseThemeJson(json, config.theme.mode);
      if (!Object.keys(overrides).length) throw new Error('No matching token names found. Names must match Figma, e.g. colour/brand/primary.');
      set((c) => { c.theme.overrides = overrides; c.theme.source = f.name; });
      setMsg({ ok: true, text: `Applied ${Object.keys(overrides).length} tokens from ${f.name}.` + (unknown.length ? ` Ignored ${unknown.length} unknown: ${unknown.slice(0, 5).join(', ')}${unknown.length > 5 ? '…' : ''}.` : '') + (skipped.length ? ` Skipped ${skipped.length} with values that can't be used: ${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? '…' : ''}.` : '') + (missing.length ? ` ${missing.length} colour tokens not in file — they keep the "${config.theme.mode}" value.` : '') });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    file.current.value = '';
  };
  return (
    <Panel title="Theme" hint="Pick a Figma mode, or import a .json of design tokens. Names must match the Figma variable names.">
      <div className="app-grid2">
        <label>Figma mode (base)
          <select value={config.theme.mode} onChange={(e) => switchTheme(e.target.value)}>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
        </label>
        <p className="app-hint" style={{ gridColumn: '1 / -1', margin: 0 }}>Each theme keeps its own settings: client name, uploads, text, journeys and password. Switching theme saves this one’s and opens the other’s.</p>
        <div className="app-field">
          <span>Token file</span>
          <div className="app-row">
            <button onClick={() => file.current.click()}>Import .json</button>
            {Object.keys(config.theme.overrides).length > 0 && <button className="app-ghost" onClick={() => set((c) => { c.theme.overrides = {}; c.theme.source = 'Figma mode'; })}>Clear overrides</button>}
            <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => e.target.files[0] && onImport(e.target.files[0])} />
          </div>
          <small>Source: {config.theme.source}</small>
        </div>
      </div>
      {msg && <p className={msg.ok ? 'app-ok' : 'app-err'}>{msg.text}</p>}
      <div className="app-swatches">
        {['colour/brand/primary', 'colour/action/primary', 'colour/action/secondary', 'colour/surface/default', 'colour/surface/raised', 'colour/text/primary', 'colour/text/secondary', 'colour/border/medium'].map((n) => (
          <div key={n} className="app-swatch"><i style={{ background: tokens[n] }} /><span>{n.replace('colour/', '')}</span><code>{String(tokens[n] ?? '')}</code></div>
        ))}
      </div>
      <table className="app-contrast">
        <thead><tr><th>Contrast check (WCAG AA)</th><th>Ratio</th><th /></tr></thead>
        <tbody>{report.map((r) => <tr key={r.label}><td>{r.label}</td><td>{r.ratio ?? '—'} : 1 (min {r.min})</td><td className={r.pass ? 'app-ok' : 'app-err'}>{r.pass ? 'Pass' : 'Fail'}</td></tr>)}</tbody>
      </table>
    </Panel>
  );
}

// [group, items] in first-seen order, so Configure lists Brand → Home → Fixtures → … like the registry
const groupsOf = (list) => { const m = new Map(); list.forEach((x) => { const g = x.group || 'Other'; if (!m.has(g)) m.set(g, []); m.get(g).push(x); }); return [...m]; };

// Configure › Images: one accordion per app page, listing every shipped image that page shows
// (src/config/media.json, generated by scripts/inventory.mjs + scripts/media-manifest.py).
// Key images (ASSET_SLOTS) sit first with their own label; one upload replaces the image everywhere it's used.
const SLOT_PAGE = { Home: 'Home', Fixtures: 'Fixtures', Watch: 'Watch', Community: 'Community', Voting: 'Voting', 'My Space': 'My Space & Profile' };
const fileName = (p) => p.split('/').pop();
function buildImageGroups() {
  const slotById = Object.fromEntries(ASSET_SLOTS.map((s) => [s.id, s]));
  const brandKeys = new Set(ASSET_SLOTS.filter((s) => s.group === 'Brand').map((s) => s.id));
  const row = (path, where, size) => {
    const key = fileKey(path); const slot = slotById[key];
    return { key, path, slot, title: slot ? slot.label : fileName(path), size: slot ? slot.size : size, where };
  };
  const groups = [{ name: 'Brand', rows: ASSET_SLOTS.filter((s) => s.group === 'Brand').map((s) => ({ key: s.id, path: s.default, slot: s, title: s.label, size: s.size, where: [] })) }];
  MEDIA.pages.forEach((pg) => {
    const rows = []; const keys = new Set();
    pg.items.forEach((it) => { const r = row(it.path, it.where, it.size); if (brandKeys.has(r.key) || keys.has(r.key)) return; keys.add(r.key); rows.push(r); });
    // Key images of this page that the crawl didn't reach (e.g. banner 3 shares banner 1's file)
    ASSET_SLOTS.filter((s) => SLOT_PAGE[s.group] === pg.name && !keys.has(s.id)).forEach((s) => rows.push({ key: s.id, path: s.default, slot: s, title: s.label, size: s.size, where: [] }));
    rows.sort((a, b) => (!!b.slot - !!a.slot));
    groups.push({ name: pg.name, rows });
  });
  return groups;
}
const IMAGE_GROUPS = buildImageGroups();

function useUpload(kind, setErr, setWarn = () => {}) {
  return async (key, file, title, size) => {
    if (!file) return;
    try {
      // Videos: check the codec plays before saving (a .mov from an iPhone is usually HEVC)
      const alpha = /avatar(-\d)?-player/.test(key);
      const check = kind === 'video' ? await checkVideo(file, { needsAlpha: alpha }) : {};
      if (check.error) { setWarn(null); setErr(`Not saved for ${title}: ${check.error}.`); return; }
      // Make it lighter before storing (src/config/optimize.js). Transparent avatar videos are kept as they are.
      setErr(null);
      let opt = { file, note: null };
      if (kind === 'image') { setWarn(`Optimizing ${title}…`); opt = await optimizeImage(file, parseSize(size)); }
      else if (!alpha) {
        setWarn(`Optimizing ${title}… plays through once, so this takes as long as the video`);
        opt = await optimizeVideo(file, { sound: /highlights/.test(key), onProgress: (p) => setWarn(`Optimizing ${title}… ${Math.round(p * 100)}%`) });
      }
      const ref = await storeFile(opt.file, kind); set((c) => { c.assets[key] = ref; });
      const msgs = [opt.note && `${title} optimized: ${opt.note}.`, check.warn && `${title}: ${check.warn}`].filter(Boolean);
      setWarn(msgs.length ? msgs.join(' ') : null);
    } catch (er) { setWarn(null); setErr(`Upload failed for ${title}: ${er?.message || 'try another file'}.`); }
  };
}
const resetKeys = (keys) => { set((c) => { keys.forEach((k) => delete c.assets[k]); }); pruneMedia(getConfig()); };

// The image or video a media row shows: an upload, else what the selected theme ships.
function MediaView({ r, config, kind, big }) {
  const v = config.assets[r.key];
  const themed = themedPath(r.path, config.theme.mode) !== r.path;
  const src = v ? resolveMedia(v) : themedUrl(r.path, config.theme.mode);
  // Theme without its own copy of this video: the room shows a photo instead
  const still = kind === 'video' && !v && themeStill(r.path, config.theme.mode);
  if (still) return <img src={themedUrl('assets/home/liveroom-1.webp', config.theme.mode)} alt="" />;
  if (kind === 'video' && r.optional && !v && !themed) return <img src={themedUrl(r.poster, config.theme.mode)} alt="" />;
  if (kind === 'video') return big
    ? <video key={src} src={src} poster={v ? undefined : themedUrl(r.poster, config.theme.mode)} muted loop playsInline autoPlay controls />
    : <video src={src} poster={v ? undefined : themedUrl(r.poster, config.theme.mode)} muted loop playsInline preload="metadata" onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} />;
  return <img src={src} alt="" loading={big ? undefined : 'lazy'} />;
}

function MediaInfo({ r, config, kind }) {
  const v = config.assets[r.key];
  const themed = themedPath(r.path, config.theme.mode) !== r.path;
  const still = kind === 'video' && !v && themeStill(r.path, config.theme.mode);
  return (
    <>
      <b>{r.phase && <i className={'app-phase is-' + r.phase} aria-hidden />}{r.title}{v ? <em className="app-tag">Replaced</em> : kind === 'video' && r.optional && !themed ? <em className="app-tag">Placeholder image</em> : still ? <em className="app-tag">Theme photo, no video</em> : themed && <em className="app-tag">Theme photo</em>}</b>
      {r.where?.length > 0 && <small>On: {r.where.join(' · ')}</small>}
      <small>{r.slot || kind === 'video' ? r.size : `Shipped ${r.size}${r.size === 'SVG' ? '' : ' px'}: upload the same shape`}{r.spec ? ` · ${r.spec}` : ''}</small>
    </>
  );
}

function MediaActions({ r, config, upload, kind }) {
  return (
    <>
      <label className="app-btnlike">Replace<input type="file" accept={kind === 'video' ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov' : 'image/*'} hidden onChange={(e) => { upload(r.key, e.target.files[0], r.title, r.size); e.target.value = ''; }} /></label>
      {config.assets[r.key] ? <button className="app-ghost" onClick={() => resetKeys([r.key])}>Reset</button> : <span />}
    </>
  );
}

function MediaRow({ r, config, upload, kind = 'image', onPreview }) {
  return (
    <li>
      <button type="button" className="app-thumb" onClick={onPreview} aria-label={`Preview ${r.title}`}><MediaView r={r} config={config} kind={kind} /></button>
      <div><MediaInfo r={r} config={config} kind={kind} /></div>
      <MediaActions r={r} config={config} upload={upload} kind={kind} />
    </li>
  );
}

// Larger preview of one image or video (click a thumbnail). ← / → step through the same group; Esc, × or a
// click outside closes it and returns focus to the thumbnail. Replace and Reset work from here.
function MediaPreview({ rows, index, setIndex, config, upload, kind }) {
  const r = rows[index];
  const box = useRef();
  const back = useRef(typeof document !== 'undefined' ? document.activeElement : null);
  const close = () => { setIndex(null); back.current?.focus?.(); };
  useEffect(() => { box.current?.focus(); }, []);
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(rows.length - 1, i + 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [rows.length]);
  const sx = useRef(null);
  if (!r) return null;
  return (
    <div className="app-preview" onClick={(e) => e.target === e.currentTarget && close()} role="dialog" aria-modal="true" aria-label={`Preview: ${r.title}`}>
      <div className="app-preview__box" ref={box} tabIndex={-1}>
        <div className="app-preview__stage"
          onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - (sx.current ?? 0); if (Math.abs(d) > 50) setIndex((i) => Math.max(0, Math.min(rows.length - 1, i + (d < 0 ? 1 : -1)))); }}>
          <MediaView r={r} config={config} kind={kind} big />
        </div>
        <div className="app-preview__info"><MediaInfo r={r} config={config} kind={kind} /></div>
        <div className="app-preview__bar">
          <button className="app-ghost" aria-label="Previous" disabled={index === 0} onClick={() => setIndex(index - 1)}>←</button>
          <span>{index + 1} / {rows.length}</span>
          <button className="app-ghost" aria-label="Next" disabled={index === rows.length - 1} onClick={() => setIndex(index + 1)}>→</button>
          <span className="app-preview__gap" />
          <MediaActions r={r} config={config} upload={upload} kind={kind} />
        </div>
        <button className="app-preview__close app-ghost" aria-label="Close preview" onClick={close}>×</button>
      </div>
    </div>
  );
}

function LaunchPanel({ config }) {
  const colours = launchColours(config);
  const custom = !!config.launch;
  const pick = (i, v) => set((c) => { const next = [...launchColours(c)]; next[i] = v.toLowerCase(); c.launch = { colors: next }; });
  return (
    <Panel title="Opening animation" hint="Colours of the moving gradient on the Loading Screen (Launch & Login). Each theme brings its own; pick colours here to change them for this demo.">
      <div className="app-launch">
        <div className="app-launch__preview" style={{ background: `linear-gradient(141deg, ${colours[0]} 0%, ${colours[1]} 50%, ${colours[2]} 100%)` }} aria-hidden="true" />
        <div className="app-launch__stops">
          {['Start', 'Middle', 'End'].map((label, i) => (
            <label key={label} className="app-launch__stop">
              <input type="color" value={colours[i]} onChange={(e) => pick(i, e.target.value)} aria-label={`${label} colour`} />
              <span>{label}<code>{colours[i]}</code></span>
            </label>
          ))}
        </div>
      </div>
      <div className="app-row app-row--wrap">
        <small>{custom ? 'Custom colours.' : `Using the "${config.theme.mode}" theme colours.`}</small>
        {custom && <button className="app-ghost" onClick={() => set((c) => { delete c.launch; })}>Reset to theme colours ({themeLaunchColours(config.theme.mode).join(', ')})</button>}
      </div>
    </Panel>
  );
}

function AssetsPanel({ config }) {
  const [err, setErr] = useState(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState({ Brand: true });
  const [warn, setWarn] = useState(null);
  const upload = useUpload('image', setErr, setWarn);
  const needle = q.trim().toLowerCase();
  const match = (r) => !needle || [r.title, r.path, ...(r.where || [])].join(' ').toLowerCase().includes(needle);
  const total = IMAGE_GROUPS.reduce((n, g) => n + g.rows.length, 0);
  const [pv, setPv] = useState(null); // { rows, index }
  return (
    <Panel title="Images" hint={`All ${total} images in the demo, grouped by page. Replacing one changes it everywhere it appears. Upload the same shape as the shipped file so nothing stretches or crops badly. Uploads are resized to the slot and saved as WebP to keep the demo fast and packages small.`}>
      {err && <p className="app-err">{err}</p>}
      {warn && <p className="app-warn" role="status">{warn}</p>}
      <input className="app-search" type="search" placeholder="Find an image by page, screen or file name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find an image" />
      {IMAGE_GROUPS.map((g) => {
        const rows = g.rows.filter(match);
        if (!rows.length) return null;
        const replaced = g.rows.filter((r) => config.assets[r.key]);
        const isOpen = needle ? true : !!open[g.name];
        return (
          <details key={g.name} className="app-acc" open={isOpen} onToggle={(e) => { if (!needle) { const o = e.currentTarget.open; setOpen((s) => (s[g.name] === o ? s : { ...s, [g.name]: o })); } }}>
            <summary>
              <span>{g.name}</span>
              <small>{needle ? `${rows.length} of ${g.rows.length}` : g.rows.length} images{replaced.length ? ` · ${replaced.length} replaced` : ''}</small>
            </summary>
            {isOpen && (
              <>
                {replaced.length > 1 && <button className="app-ghost app-acc__reset" onClick={() => resetKeys(replaced.map((r) => r.key))}>Reset {replaced.length} images on this page</button>}
                <ul className="app-slots">{rows.map((r, i) => <MediaRow key={r.key} r={r} config={config} upload={upload} onPreview={() => setPv({ rows, index: i })} />)}</ul>
              </>
            )}
          </details>
        );
      })}
      {pv && <MediaPreview rows={pv.rows} index={pv.index} setIndex={(f) => setPv((p) => { const index = typeof f === 'function' ? f(p.index) : f; return index == null ? null : { ...p, index }; })} config={config} upload={upload} kind="image" />}
    </Panel>
  );
}

function VideosPanel({ config }) {
  const [err, setErr] = useState(null);
  const [warn, setWarn] = useState(null);
  const upload = useUpload('video', setErr, setWarn);
  const [pv, setPv] = useState(null);
  const rows = MEDIA.videos.map((v) => ({ key: fileKey(v.path), path: v.path, poster: v.poster, title: v.avatar ? v.label.replace(`Avatar ${v.avatar}:`, `Avatar ${v.avatar} · ${copyOf(config, `avatar.${v.avatar}.name`, COPY_FIELDS.find((f) => f.id === `avatar.${v.avatar}.name`)?.default)}:`) : v.label, size: v.size, spec: v.spec, optional: v.optional, where: v.where, phase: v.phase }));
  return (
    <Panel title="Videos" hint="Background videos (muted), the three avatars' standing and chat videos, and the six Highlight videos (with sound; until one is uploaded, its placeholder image shows). Uploads are re-encoded smaller (up to 1280 px, H.264) in Chrome, Edge and Safari; this plays the video through once, so it takes as long as the clip. MP4, MOV or WebM up to 60 MB. For every browser, use H.264 (MP4 or MOV): iPhone .mov files are usually HEVC, which Chrome on Windows and Firefox can't play. A replaced video drops its old poster frame, so also replace the poster in Images if you want a still while it loads.">
      {err && <p className="app-err">{err}</p>}
      {warn && <p className="app-warn" role="status">{warn}</p>}
      <ul className="app-slots app-slots--video">{rows.map((r, i) => <MediaRow key={r.key} r={r} config={config} upload={upload} kind="video" onPreview={() => setPv(i)} />)}</ul>
      {pv != null && <MediaPreview rows={rows} index={pv} setIndex={(f) => setPv((p) => (typeof f === 'function' ? f(p) : f))} config={config} upload={upload} kind="video" />}
    </Panel>
  );
}

function CopyPanel({ config }) {
  return (
    <Panel title="Copy" hint="Text that changes per client. Leave a field empty to keep the default shown in grey (the selected theme can bring its own defaults). Placeholders: {team} club name, {full} full club name, {fans} fan name, {stadium}, {tags} hashtags.">
      {groupsOf(COPY_FIELDS).map(([g, fields]) => (
        <section key={g} className="app-group"><h4>{g}</h4>
          <div className="app-grid2">
            {fields.map((f) => (
              <label key={f.id}>{f.label}<input placeholder={themeCopy(config.theme.mode)[f.id] ?? f.default} value={config.copy[f.id] ?? ''} onChange={(e) => set((c) => { if (e.target.value) c.copy[f.id] = e.target.value; else delete c.copy[f.id]; })} /></label>
            ))}
          </div>
        </section>
      ))}
    </Panel>
  );
}

function PackagePanel({ config }) {
  const file = useRef();
  const [state, setState] = useState(null);
  const zip = async () => {
    setState({ busy: true, text: 'Packaging…' });
    try { const st = await download(await buildOfflineZip(config), clientZipName(config, VERSION, new Date(), 'Offline')); setState({ ok: true, text: st === 'saved' || st === 'delivered' ? 'Zip saved. Unzip and open index.html: it works offline and starts with your current settings.' : 'Save cancelled.' }); }
    catch (e) { setState({ ok: false, text: e.message }); }
  };
  return (
    <Panel title="Save & share settings" hint="Export your setup as a file to send to a teammate, or download an offline copy of the whole demo.">
      <div className="app-row app-row--wrap">
        <button onClick={zip} disabled={state?.busy}>Download offline copy (.zip)</button>
        <button className="app-ghost" onClick={async () => { try { await download(new Blob([JSON.stringify(await inlineMedia(config), null, 2)], { type: 'application/json' }), configFileName(config)); } catch (e) { setState({ ok: false, text: e.message }); } }}>Export config</button>
        <button className="app-ghost" onClick={() => file.current.click()}>Import config</button>
        <ConfirmButton label="Reset all" warning={Object.keys(config.assets).length ? `This deletes your ${Object.keys(config.assets).length} uploaded file${Object.keys(config.assets).length > 1 ? 's' : ''} and all typed text. They are saved only in this browser and can't be recovered — use Export config first to keep a copy.` : 'This clears everything changed in Configure. Use Export config first to keep a copy.'} confirmLabel="Delete and reset" onConfirm={() => { setConfig(defaultFor(getConfig().theme.mode)); pruneMedia(getConfig()); }} />
        <input ref={file} type="file" accept=".json" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const j = JSON.parse(await readFile(f)); if (!isConfigFile(j)) { setState({ ok: false, text: 'This isn\u2019t an exported config. For a design-token file, use Theme \u203a Import .json.' }); return; } setConfig(sanitiseConfig(await absorbDataUrls(j))); pruneMedia(getConfig()); setState({ ok: true, text: 'Config imported.' }); } catch { setState({ ok: false, text: 'Not a valid config file.' }); } finally { e.target.value = ''; } }} />
      </div>
      {state && <p className={state.ok ? 'app-ok' : state.busy ? '' : 'app-err'}>{state.text}</p>}
      <ClientLink config={config} />
    </Panel>
  );
}

// Client link: the Play-only page (no Configure) with these settings built in, plus an optional password
function ClientLink({ config }) {
  const [pw, setPw] = useState('');
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState(null);
  const has = !!config.access?.hash;
  const setPassword = () => {
    const salt = (crypto.randomUUID?.() || Math.random().toString(36).slice(2)).replace(/-/g, '').slice(0, 16);
    set((c) => { c.access = { salt, hash: hashPassword(salt, pw) }; });
    setPw(''); setEditing(false);
  };
  const exportClient = async () => {
    setState({ busy: true, text: 'Packaging the client link…' });
    try {
      const name = clientZipName(config, VERSION);
      const st = await download(await buildClientZip(config), name);
      setState({ ok: true, text: st === 'saved' || st === 'delivered' ? `Saved ${name}. Upload everything inside it to the client's folder on the web server, replacing the previous upload. Open demos switch to it within about 30 seconds.` : 'Download cancelled.' });
    } catch (e) { setState({ ok: false, text: e.message }); }
  };
  return (
    <div className="app-clientlink">
      <h3>Client link (Play only)</h3>
      <p className="app-sub">What the client opens: the demo without Configure, with these settings built in. Changes reach the client only when you export and upload again.</p>
      <div className="app-field">
        <span className="app-label">Password</span>
        {has && !editing ? (
          <div className="app-row app-row--wrap">
            <span className="app-tag">Password set</span>
            <button className="app-ghost" onClick={() => setEditing(true)}>Change</button>
            <button className="app-ghost" onClick={() => set((c) => { delete c.access; })}>Remove</button>
          </div>
        ) : (
          <form className="app-row app-row--wrap" onSubmit={(e) => { e.preventDefault(); if (pw.length >= 4) setPassword(); }}>
            <input type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Optional, at least 4 characters" aria-label="Client link password" autoComplete="off" />
            <button type="submit" disabled={pw.length < 4}>Set password</button>
            {editing && <button type="button" className="app-ghost" onClick={() => { setEditing(false); setPw(''); }}>Cancel</button>}
          </form>
        )}
        <small>{has ? 'The client enters it once per browser. Only a scrambled form is stored, so write the password down: it can\'t be shown again. It stops people who only have the link; for stronger protection also use the web host\'s password option.' : 'Off: anyone with the link can open the demo.'}</small>
      </div>
      <div className="app-row app-row--wrap">
        <button onClick={exportClient} disabled={state?.busy}>Export client package (.zip)</button>
      </div>
      <small className="app-hint">Named after the team: <b>{clientZipName(config, VERSION)}</b>, browser tab “{teamName(config)}_Demo”. The same name shows on the password screen, top bar and README.</small>
      {state && <p className={state.ok ? 'app-ok' : state.busy ? '' : 'app-err'}>{state.text}</p>}
    </div>
  );
}

function ConfirmButton({ label, confirmLabel, warning, onConfirm }) {
  const [armed, setArmed] = useState(false);
  return armed
    ? <span className="app-row app-row--wrap">{warning && <span className="app-err" role="alert">{warning}</span>}<button onClick={() => { onConfirm(); setArmed(false); }}>{confirmLabel}</button><button className="app-ghost" onClick={() => setArmed(false)}>Cancel</button></span>
    : <button className="app-ghost" onClick={() => setArmed(true)}>{label}</button>;
}
