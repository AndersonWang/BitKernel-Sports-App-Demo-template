// npm run build[:junior|:boca]: the owner page (index.html + assets/app.js, with Configure) and the
// Play-only client page (play.html + assets/play.js) into the same output folder.
import { build } from 'vite';
const mode = process.argv[2] || 'production';
await build({ mode, logLevel: 'warn' });
process.env.PLAY = '1';
await build({ mode, logLevel: 'warn' });

// Vercel excludes README.md from static output. Keep it available for offline exports.
const { copyFile } = await import('node:fs/promises');
const outputDirectory = mode === 'production' ? 'dist' : `dist-${mode}`;
await copyFile(`${outputDirectory}/README.md`, `${outputDirectory}/package-readme.md`);
