// Export posters to static/poster/<name>.png (1080 × 1350, IG 4:5) with headless Chrome.
// Needs the dev server running on :5178. Usage: node scripts/export-poster.mjs [paket-1 paket-lengkap]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.POSTER_BASE ?? 'http://localhost:5178/poster';
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['paket-1', 'paket-lengkap'];
mkdirSync('static/poster', { recursive: true });
for (const name of names) {
	execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1350', '--virtual-time-budget=6000', `--screenshot=static/poster/${name}.png`, `${BASE}/${name}`], { stdio: 'ignore' });
	console.log(`ok static/poster/${name}.png`);
}
