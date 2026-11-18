// Framework version: the shared Sports App Demo code, not a team's content. Set in package.json ("version"),
// stamped at build time with the date of the last commit (vite.config.js). Shown in Configure, zips, error details.
// Bump it when a release changes how the demo works: minor (1.2.0) for features, patch (1.1.1) for fixes.
export const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
export const UPDATED = typeof __APP_UPDATED__ !== 'undefined' ? __APP_UPDATED__ : '';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "6 Nov 2026" from "2026-11-06" (read as a calendar date, not a moment, so it never shifts a day by time zone) */
export const UPDATED_LABEL = UPDATED ? `${Number(UPDATED.slice(8, 10))} ${MONTHS.at(Number(UPDATED.slice(5, 7)) - 1)} ${UPDATED.slice(0, 4)}` : '';
export const VERSION_LABEL = `v${VERSION}${UPDATED_LABEL ? ` · updated ${UPDATED_LABEL}` : ''}`;
