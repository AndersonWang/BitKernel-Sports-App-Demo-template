import { useMemo, useRef, useState } from 'react';
import { useConfig, setConfig, defaultConfig, getSaveError, getConfig, isConfigFile, sanitiseConfig } from '../config/store.js';
import { storeFile, resolveMedia, pruneMedia, inlineMedia, absorbDataUrls, checkVideo } from '../config/media.js';
import MEDIA from '../config/media.json';
import { fileKey, themedPath } from '../components/ui.jsx';
import { JOURNEYS, ASSET_SLOTS, COPY_FIELDS, SCREENS, TABS } from '../config/registry.js';
import { MODES, resolveTokens, parseThemeJson, contrastReport, launchColours, themeLaunchColours } from '../tokens/theme.js';
import { buildOfflineZip, download } from './package.js';
import { themeCopy } from '../tokens/themeText.js';
import { Device } from './Player.jsx';

const set = (fn) => setConfig((c) => { const n = structuredClone(c); fn(n); return n; });
const readFile = (file, as = 'text') => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = err; as === 'url' ? r.readAsDataURL(file) : r.readAsText(file); });

export default function Dashboard() {
  const config = useConfig();
  const [previewKey, setPreviewKey] = useState(0);
  const saveError = getSaveError();
  return (
    <div className="app-dash">
      <div className="app-dash__panels">
        <p className="app-intro">Changes apply instantly and are saved in this browser only, so you can't change the demo for anyone else. To hand your setup to someone, use Export config, then they use Import config.</p>
        {saveError && <p className="app-err">{saveError}</p>}
        <ClientPanel config={config} />
        <JourneysPanel config={config} />
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

function Panel({ title, hint, children }) {
  return <section className="app-panel"><header><h2>{title}</h2>{hint && <p>{hint}</p>}</header>{children}</section>;
}

function ClientPanel({ config }) {
  return (
    <Panel title="Client" hint="Shown above the journey list in Play, and used to name exported files.">
      <div className="app-grid2">
        <label>Client name<input value={config.client.name} onChange={(e) => set((c) => { c.client.name = e.target.value; })} /></label>
        <label>Slug<input value={config.client.slug} onChange={(e) => set((c) => { c.client.slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'); })} /></label>
      </div>
    </Panel>
  );
}

function JourneysPanel({ config }) {
  return (
    <Panel title="Journeys (feature flags)" hint="Off = every entry point is hidden: home sections, app-bar tab, buttons and journey list.">
      <ul className="app-toggles">
        {JOURNEYS.map((j) => {
          const built = Object.values(SCREENS).filter((s) => s.journey === j.id && s.status === 'built').length;
          const total = Object.values(SCREENS).filter((s) => s.journey === j.id).length;
          const tab = TABS.find((t) => t.journey === j.id && !t.always);
          return (
            <li key={j.id}>
              <label className="app-switch">
                <input type="checkbox" disabled={j.onHold} checked={!!config.flags[j.id] && !j.onHold} onChange={(e) => set((c) => { c.flags[j.id] = e.target.checked; })} />
                <span>{j.name}{j.key && <em title="Marked ★ in Figma"> ★</em>}</span>
              </label>
              <small>{j.onHold ? 'On hold until links are sorted' : `${built}/${total} screens built`}{j.hub ? ' · off hides it from the journey list only (Home tab still works)' : ''}{j.id === 'login' ? ' · off = demo opens on Homepage' : ''}{tab ? ' · has app-bar tab' : ''}</small>
            </li>
          );
        })}
      </ul>
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
          <select value={config.theme.mode} onChange={(e) => set((c) => { c.theme.mode = e.target.value; })}>{MODES.map((m) => <option key={m}>{m}</option>)}</select>
        </label>
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
  return async (key, file, title) => {
    if (!file) return;
    try {
      // Videos: check the codec plays before saving (a .mov from an iPhone is usually HEVC)
      const check = kind === 'video' ? await checkVideo(file, { needsAlpha: /avatar-player/.test(key) }) : {};
      if (check.error) { setWarn(null); setErr(`Not saved for ${title}: ${check.error}.`); return; }
      const ref = await storeFile(file, kind); set((c) => { c.assets[key] = ref; }); setErr(null); setWarn(check.warn ? `${title}: ${check.warn}` : null);
    } catch (er) { setErr(`Upload failed for ${title}: ${er?.message || 'try another file'}.`); }
  };
}
const resetKeys = (keys) => { set((c) => { keys.forEach((k) => delete c.assets[k]); }); pruneMedia(getConfig()); };

function MediaRow({ r, config, upload, kind = 'image' }) {
  const v = config.assets[r.key];
  // Without an upload, show what the selected theme shows (its own copy, if it has one)
  const shipped = themedPath(r.path, config.theme.mode);
  const themed = shipped !== r.path;
  const src = v ? resolveMedia(v) : './' + shipped;
  return (
    <li>
      {kind === 'video' && r.optional && !v
        ? <img src={'./' + themedPath(r.poster, config.theme.mode)} alt="" />
        : kind === 'video'
        ? <video src={src} poster={v ? undefined : './' + themedPath(r.poster, config.theme.mode)} muted loop playsInline preload="metadata" onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => e.target.pause()} />
        : <img src={src} alt="" loading="lazy" />}
      <div>
        <b>{r.title}{v ? <em className="app-tag">Replaced</em> : themed && <em className="app-tag">Theme photo</em>}</b>
        {r.where?.length > 0 && <small>On: {r.where.join(' · ')}</small>}
        <small>{r.slot || kind === 'video' ? r.size : `Shipped ${r.size}${r.size === 'SVG' ? '' : ' px'}: upload the same shape`}{r.spec ? ` · ${r.spec}` : ''}</small>
      </div>
      <label className="app-btnlike">Replace<input type="file" accept={kind === 'video' ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov' : 'image/*'} hidden onChange={(e) => { upload(r.key, e.target.files[0], r.title); e.target.value = ''; }} /></label>
      {v ? <button className="app-ghost" onClick={() => resetKeys([r.key])}>Reset</button> : <span />}
    </li>
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
  const upload = useUpload('image', setErr);
  const needle = q.trim().toLowerCase();
  const match = (r) => !needle || [r.title, r.path, ...(r.where || [])].join(' ').toLowerCase().includes(needle);
  const total = IMAGE_GROUPS.reduce((n, g) => n + g.rows.length, 0);
  return (
    <Panel title="Images" hint={`All ${total} images in the demo, grouped by page. Replacing one changes it everywhere it appears. Upload the same shape as the shipped file so nothing stretches or crops badly.`}>
      {err && <p className="app-err">{err}</p>}
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
                <ul className="app-slots">{rows.map((r) => <MediaRow key={r.key} r={r} config={config} upload={upload} />)}</ul>
              </>
            )}
          </details>
        );
      })}
    </Panel>
  );
}

function VideosPanel({ config }) {
  const [err, setErr] = useState(null);
  const [warn, setWarn] = useState(null);
  const upload = useUpload('video', setErr, setWarn);
  const rows = MEDIA.videos.map((v) => ({ key: fileKey(v.path), path: v.path, poster: v.poster, title: v.label, size: v.size, spec: v.spec, optional: v.optional }));
  return (
    <Panel title="Videos" hint="Looping background videos, played muted. MP4, MOV or WebM up to 60 MB. For every browser, use H.264 (MP4 or MOV): iPhone .mov files are usually HEVC, which Chrome on Windows and Firefox can't play. A replaced video drops its old poster frame, so also replace the poster in Images if you want a still while it loads.">
      {err && <p className="app-err">{err}</p>}
      {warn && <p className="app-warn" role="status">{warn}</p>}
      <ul className="app-slots app-slots--video">{rows.map((r) => <MediaRow key={r.key} r={r} config={config} upload={upload} kind="video" />)}</ul>
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
    try { const st = await download(await buildOfflineZip(config), `${config.client.slug}-sports-demo.zip`); setState({ ok: true, text: st === 'saved' || st === 'delivered' ? 'Zip saved. Unzip and open index.html: it works offline and starts with your current settings.' : 'Save cancelled.' }); }
    catch (e) { setState({ ok: false, text: e.message }); }
  };
  return (
    <Panel title="Save & share settings" hint="Export your setup as a file to send to a teammate, or download an offline copy of the whole demo.">
      <div className="app-row app-row--wrap">
        <button onClick={zip} disabled={state?.busy}>Download offline copy (.zip)</button>
        <button className="app-ghost" onClick={async () => { try { await download(new Blob([JSON.stringify(await inlineMedia(config), null, 2)], { type: 'application/json' }), `${config.client.slug}.config.json`); } catch (e) { setState({ ok: false, text: e.message }); } }}>Export config</button>
        <button className="app-ghost" onClick={() => file.current.click()}>Import config</button>
        <ConfirmButton label="Reset all" warning={Object.keys(config.assets).length ? `This deletes your ${Object.keys(config.assets).length} uploaded file${Object.keys(config.assets).length > 1 ? 's' : ''} and all typed text. They are saved only in this browser and can't be recovered — use Export config first to keep a copy.` : 'This clears everything changed in Configure. Use Export config first to keep a copy.'} confirmLabel="Delete and reset" onConfirm={() => { setConfig(defaultConfig()); pruneMedia(getConfig()); }} />
        <input ref={file} type="file" accept=".json" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { const j = JSON.parse(await readFile(f)); if (!isConfigFile(j)) { setState({ ok: false, text: 'This isn\u2019t an exported config. For a design-token file, use Theme \u203a Import .json.' }); return; } setConfig(sanitiseConfig(await absorbDataUrls(j))); pruneMedia(getConfig()); setState({ ok: true, text: 'Config imported.' }); } catch { setState({ ok: false, text: 'Not a valid config file.' }); } finally { e.target.value = ''; } }} />
      </div>
      {state && <p className={state.ok ? 'app-ok' : state.busy ? '' : 'app-err'}>{state.text}</p>}
    </Panel>
  );
}

function ConfirmButton({ label, confirmLabel, warning, onConfirm }) {
  const [armed, setArmed] = useState(false);
  return armed
    ? <span className="app-row app-row--wrap">{warning && <span className="app-err" role="alert">{warning}</span>}<button onClick={() => { onConfirm(); setArmed(false); }}>{confirmLabel}</button><button className="app-ghost" onClick={() => setArmed(false)}>Cancel</button></span>
    : <button className="app-ghost" onClick={() => setArmed(true)}>{label}</button>;
}
