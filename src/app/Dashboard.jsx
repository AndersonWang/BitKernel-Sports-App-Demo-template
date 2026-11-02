import { useMemo, useRef, useState } from 'react';
import { useConfig, setConfig, defaultConfig } from '../config/store.js';
import { JOURNEYS, ASSET_SLOTS, COPY_FIELDS, SCREENS, TABS } from '../config/registry.js';
import { MODES, resolveTokens, parseThemeJson, contrastReport } from '../tokens/theme.js';
import { buildClientZip, download } from './package.js';
import { Device } from './Player.jsx';

const set = (fn) => setConfig((c) => { const n = structuredClone(c); fn(n); return n; });
const readFile = (file, as = 'text') => new Promise((ok, err) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = err; as === 'url' ? r.readAsDataURL(file) : r.readAsText(file); });

export default function Dashboard() {
  const config = useConfig();
  const [previewKey, setPreviewKey] = useState(0);
  return (
    <div className="app-dash">
      <div className="app-dash__panels">
        <ClientPanel config={config} />
        <JourneysPanel config={config} />
        <ThemePanel config={config} />
        <AssetsPanel config={config} />
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
    <Panel title="Client" hint="Name and link slug used for the package and client link.">
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
              <small>{j.onHold ? 'On hold until links are sorted' : `${built}/${total} screens built`}{tab ? ' · has app-bar tab' : ''}</small>
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
      const { overrides, unknown, missing } = parseThemeJson(json, config.theme.mode);
      if (!Object.keys(overrides).length) throw new Error('No matching token names found. Names must match Figma, e.g. colour/brand/primary.');
      set((c) => { c.theme.overrides = overrides; c.theme.source = f.name; });
      setMsg({ ok: true, text: `Applied ${Object.keys(overrides).length} tokens from ${f.name}.` + (unknown.length ? ` Ignored ${unknown.length} unknown: ${unknown.slice(0, 5).join(', ')}${unknown.length > 5 ? '…' : ''}.` : '') + (missing.length ? ` ${missing.length} colour tokens not in file — they keep the "${config.theme.mode}" value.` : '') });
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
          <div key={n} className="app-swatch"><i style={{ background: tokens[n] }} /><span>{n.replace('colour/', '')}</span><code>{tokens[n]}</code></div>
        ))}
      </div>
      <table className="app-contrast">
        <thead><tr><th>Contrast check (WCAG AA)</th><th>Ratio</th><th /></tr></thead>
        <tbody>{report.map((r) => <tr key={r.label}><td>{r.label}</td><td>{r.ratio ?? '—'} : 1 (min {r.min})</td><td className={r.pass ? 'app-ok' : 'app-err'}>{r.pass ? 'Pass' : 'Fail'}</td></tr>)}</tbody>
      </table>
    </Panel>
  );
}

function AssetsPanel({ config }) {
  return (
    <Panel title="Images" hint="Upload a replacement per slot. Use the size listed so nothing stretches.">
      <ul className="app-slots">
        {ASSET_SLOTS.map((s) => (
          <li key={s.id}>
            <img src={config.assets[s.id] || './' + s.default} alt="" />
            <div><b>{s.label}</b><small>{s.size}</small></div>
            <label className="app-btnlike">Replace<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; const url = await readFile(f, 'url'); set((c) => { c.assets[s.id] = url; }); }} /></label>
            {config.assets[s.id] && <button className="app-ghost" onClick={() => set((c) => { delete c.assets[s.id]; })}>Reset</button>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CopyPanel({ config }) {
  return (
    <Panel title="Copy" hint="Text that changes per client. {team} inserts the club name.">
      <div className="app-grid2">
        {COPY_FIELDS.map((f) => (
          <label key={f.id}>{f.label}<input placeholder={f.default} value={config.copy[f.id] ?? ''} onChange={(e) => set((c) => { if (e.target.value) c.copy[f.id] = e.target.value; else delete c.copy[f.id]; })} /></label>
        ))}
      </div>
    </Panel>
  );
}

function PackagePanel({ config }) {
  const file = useRef();
  const [state, setState] = useState(null);
  const zip = async () => {
    setState({ busy: true, text: 'Packaging…' });
    try { download(await buildClientZip(config), `${config.client.slug}-prototype.zip`); setState({ ok: true, text: 'Zip downloaded. It opens from index.html with no server and shows only the enabled journeys.' }); }
    catch (e) { setState({ ok: false, text: e.message }); }
  };
  return (
    <Panel title="Share" hint="Client links and zips are read-only: no dashboard, no Figma links, no way to change settings.">
      <div className="app-row app-row--wrap">
        <button onClick={zip} disabled={state?.busy}>Download client zip</button>
        <a className="app-btnlike" href="#/client" target="_blank" rel="noreferrer">Preview client view</a>
        <button className="app-ghost" onClick={() => download(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }), `${config.client.slug}.config.json`)}>Export config</button>
        <button className="app-ghost" onClick={() => file.current.click()}>Import config</button>
        <button className="app-ghost" onClick={() => confirm('Reset all settings to defaults?') && setConfig(defaultConfig())}>Reset all</button>
        <input ref={file} type="file" accept=".json" hidden onChange={async (e) => { const f = e.target.files[0]; if (!f) return; try { setConfig({ ...defaultConfig(), ...JSON.parse(await readFile(f)) }); setState({ ok: true, text: 'Config imported.' }); } catch { setState({ ok: false, text: 'Not a valid config file.' }); } }} />
      </div>
      {state && <p className={state.ok ? 'app-ok' : state.busy ? '' : 'app-err'}>{state.text}</p>}
      <p className="app-note">Hosted client links (<code>/c/{config.client.slug}</code>) need the file-server details. Not built yet.</p>
    </Panel>
  );
}
