import { JOURNEYS, SCREENS } from './registry.js';

// Sections = the journey list in Play (desktop side navigation). Configure › Sections can rename, reorder,
// show/hide them and add new ones that start on any existing screen. Stored in config.sections:
//   order: [id…]  names: { id: name }  custom: [{ id, name, start }]
// Show/hide stays in config.flags (a built-in section's flag also hides its screens' entry points; a custom
// section's flag only hides it from the list).

/** Every section in display order, with its current name and on/off state. */
export function sectionsOf(config) {
  const s = config.sections || {};
  const custom = (s.custom || []).filter((c) => SCREENS[c.start]).map((c) => ({ ...c, custom: true, journey: SCREENS[c.start].journey }));
  const all = [...JOURNEYS.map((j) => ({ ...j })), ...custom];
  const order = (s.order || []).filter((id) => all.some((x) => x.id === id));
  const rank = (x) => { const i = order.indexOf(x.id); return i < 0 ? order.length + all.indexOf(x) : i; };
  return all.sort((a, b) => rank(a) - rank(b)).map((x) => ({
    ...x,
    label: (s.names || {})[x.id] || x.name,
    on: x.custom ? config.flags[x.id] !== false : !!config.flags[x.id] && !x.onHold,
  }));
}

/** The sections Play lists: on, not on hold, with a start screen. */
export const playSections = (config) => sectionsOf(config).filter((x) => x.on && !x.onHold && x.start);

/** Clean config.sections from a saved or imported config. */
export function cleanSections(v) {
  const o = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  const str = (x) => typeof x === 'string';
  return {
    order: Array.isArray(o.order) ? o.order.filter(str) : [],
    names: Object.fromEntries(Object.entries(o.names && typeof o.names === 'object' ? o.names : {}).filter(([, n]) => str(n) && n.trim())),
    custom: Array.isArray(o.custom) ? o.custom.filter((c) => c && str(c.id) && str(c.name) && SCREENS[c.start]).map(({ id, name, start }) => ({ id, name, start })) : [],
  };
}
