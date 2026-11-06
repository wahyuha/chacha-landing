// Receives path-traced booth renders from /booth (window.__booth.batch) and writes them to disk.
// Headless Chrome 154's Metal backend renders the booth unlit, so renders run in a normal browser tab
// and post their PNGs here. Usage: node scripts/booth-receive.mjs [outDir]  (listens on :5199)
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const OUT = process.argv[2] ?? 'assets-src/booth';
mkdirSync(OUT, { recursive: true });

createServer((req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	if (req.method !== 'POST') return res.end();
	const chunks = [];
	req.on('data', (c) => chunks.push(c));
	req.on('end', () => {
		const url = Buffer.concat(chunks).toString();
		const file = join(OUT, basename(decodeURIComponent(req.url)));
		writeFileSync(file, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
		console.log('saved', file);
		res.end('ok');
	});
}).listen(5199, () => console.log(`booth-receive → ${OUT}`));
