// Writes each package's guides from one set of templates, so every package carries docs scoped to it:
//   README.md         for the BD team (part 1) and AI agents (part 2)        ← docs/README.md.tpl
//   CONFIGURATION.md  how to use Configure, with this package's defaults     ← docs/CONFIGURATION.md.tpl
//   HANDOFF.md        template: the root HANDOFF.md · team edition: src/editions/<id>/HANDOFF.md
// Templates use {{name}} values and <!--if X-->…<!--endif--> blocks (X = template, edition, source, built, or an edition id).
// Run by every build for its own output folder (vite.config.js); `npm run docs` refreshes the source folder's
// README.md and CONFIGURATION.md. Edit the templates or HANDOFF files, never the generated copies.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const own = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')));
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (head, rows) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function versionInfo() {
  const version = json('package.json').version;
  let updated;
  try { updated = execSync('git log -1 --format=%cs', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* no git */ }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated || '')) updated = new Date().toISOString().slice(0, 10);
  const label = `${Number(updated.slice(8))} ${MONTHS[Number(updated.slice(5, 7)) - 1]} ${updated.slice(0, 4)}`;
  return { version, updated: label, version_label: `v${version} · updated ${label}` };
}

function render(tpl, vars, flags) {
  const out = tpl.replace(/<!--if ([\w-]+)-->\n?([\s\S]*?)<!--endif-->\n?/g, (_, f, body) => (flags.has(f) ? body : ''));
  return out.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m)).replace(/\n{3,}/g, '\n\n');
}

/** scope: 'template' or an edition id ('junior', 'boca'); target: 'source' (the repo) or 'built' (a build folder). */
export async function docsFor(scope, target) {
  const { JOURNEYS, ASSET_SLOTS, COPY_FIELDS, SCREENS } = await import(pathToFileURL(path.join(ROOT, 'src/config/registry.js')).href);
  const media = json('src/config/media.json');
  const semantics = json('src/tokens/semantics.json');
  const themeAssets = json('src/tokens/theme-assets.json');
  const pack = own(json('src/tokens/theme-text.json'));
  const edition = scope === 'template' ? null : json(`src/editions/${scope}/edition.json`);
  const extras = own(json(edition ? `src/editions/${scope}/theme-text.json` : 'src/tokens/theme-text.template.json'));
  const mode = edition ? edition.mode : 'Real Betis';
  const themeCopy = { ...(extras[mode]?.copy || {}), ...(pack[mode]?.copy || {}) };
  const ta = themeAssets[mode];
  const themed = (p) => !!ta && p.startsWith('assets/') && ta.files.includes(p.slice(7));
  const v = versionInfo();
  const flags = new Set([edition ? 'edition' : 'template', target, scope]);
  const imageCount = media.pages.reduce((n, p) => n + p.items.length, 0);

  const vars = {
    ...v,
    title: edition ? `${edition.client} Sports App Demo` : 'Sports App Demo (template)',
    scope_line: edition ? `team package for ${edition.client}` : 'template package: Real Betis by default, every theme available',
    client: edition?.client || 'Real Betis',
    slug: edition?.slug || 'real-betis',
    default_mode: mode,
    theme_count: String(semantics.modes.length),
    themes_list: semantics.modes.map((m) => `- ${m}`).join('\n'),
    link_line: edition ? `${edition.link} (${edition.linkNote})` : 'https://claude.ai/artifact/6c88f9EUBmrX3kJbhPH8p7 (claude.ai, BitKernel organization)',
    link: edition?.link || 'https://claude.ai/artifact/6c88f9EUBmrX3kJbhPH8p7',
    link_note: edition?.linkNote || '',
    journey_count: String(JOURNEYS.filter((j) => !j.inDesign).length),
    journey_names: JOURNEYS.filter((j) => !j.inDesign).map((j) => j.name).join(', '),
    in_design_line: ((d) => (d.length ? `${d.join(' and ')} ${d.length > 1 ? 'are' : 'is'} being designed and will be added later.` : ''))(JOURNEYS.filter((j) => j.inDesign).map((j) => j.name)),
    agent_extra_read: target === 'source' ? ', then `AGENT-SETUP.md` (the prompt for starting a new client)' : '',
    agent_scope: `${edition ? `Team edition: ${edition.client} (theme "${mode}" only)` : 'Template: every theme, Real Betis by default'} · ${target === 'source' ? 'source code' : 'built, no source'}`,
    agent_build: edition ? `\`npm run build:${scope}\` → \`dist-${scope}/\` (\`.env.${scope}\`: VITE_EDITION=${scope})` : '`npm run build` → `dist/`',
    agent_build_cmd: edition ? `npm run build:${scope}` : 'npm run build',
    storage_key: edition ? `bk-proto-config:${edition.slug}:2` : 'bk-proto-config',
    agent_link: edition ? edition.link : 'https://claude.ai/artifact/6c88f9EUBmrX3kJbhPH8p7 (template; never publish a client over it)',
    image_count: String(imageCount),
    journeys_table: table(['Journey', 'First screen', 'Note'], JOURNEYS.map((j) => [j.name, j.inDesign ? '-' : (SCREENS[j.start]?.name || j.start).split(' (')[0], j.inDesign ? 'In design: listed, can\'t be switched on yet' : j.listOnly ? 'Shortcut to My Space › Play with the preset avatar; off removes only the shortcut' : j.hub ? 'Hub: stays reachable when off' : ''])),
    key_images_table: table(['Page', 'Image', 'Upload'], ASSET_SLOTS.map((s) => [s.group, s.label + (themed(s.default) ? ' · theme photo' : ''), s.size || ''])),
    videos_table: table(['Video', 'Needed?', 'What to upload'], media.videos.map((x) => [x.label + (themed(x.path) || ta?.same?.[x.path.slice(7)] ? ' · theme video' : ''), (themed(x.path) || ta?.same?.[x.path.slice(7)]) ? 'Built in for this theme' : ta?.stills?.includes(x.path.slice(7)) ? 'Not yet: shows a photo instead' : x.optional ? 'Optional: shows its still until uploaded' : 'Ships with the demo', x.spec])),
    copy_table: table(['Page', 'Field', `Default in this package`], COPY_FIELDS.map((f) => [f.group, f.label, themeCopy[f.id] ?? f.default])),
    themed_table: ta ? table(['Page', `${edition?.client || mode} images`, 'Of'], media.pages.map((p) => [p.name, String(p.items.filter((i) => themed(i.path)).length), String(p.items.length)])) : '',
  };
  const files = {
    'README.md': render(read('docs/README.md.tpl'), vars, flags),
    'CONFIGURATION.md': render(read('docs/CONFIGURATION.md.tpl'), vars, flags),
  };
  if (target === 'built') files['HANDOFF.md'] = edition ? render(read(`src/editions/${scope}/HANDOFF.md`), vars, flags) : read('HANDOFF.md');
  return files;
}

export async function writeDocs(scope, target, outDir) {
  const files = await docsFor(scope, target);
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(outDir, name), text);
  return Object.keys(files);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  console.log('wrote', await writeDocs('template', 'source', ROOT));
}
