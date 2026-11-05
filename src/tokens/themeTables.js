import TABLES from './theme-tables.json';

// Per-theme league table (theme-tables.json), in the tuple shape the Fixtures code uses:
// [name, logo, crop, games, diff, points]. Returns null when the theme has no table of its own.
export function themeTable(mode) {
  const t = TABLES[mode];
  if (!t || !Array.isArray(t.rows)) return null;
  const rows = t.rows.map(([name, logo, gp, diff, pts]) => [name, logo, 'contain', gp, diff, pts]);
  const club = Math.max(0, rows.findIndex((r) => r[0] === t.club));
  return { rows, club };
}
