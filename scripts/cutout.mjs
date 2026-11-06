// Remove photo backgrounds from equipment shots so they sit on one shared surface.
// Usage: node scripts/cutout.mjs  (reads assets-src/kit/*.jpg, writes static/img/kit/*.webp)
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { readdirSync, mkdirSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC = 'assets-src/kit';
const OUT = 'static/img/kit';
mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
for (const file of readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
	const { name } = parse(file);
	if (only.length && !only.includes(name)) continue;
	const t = Date.now();
	const input = await sharp(join(SRC, file)).resize({ width: 1200, withoutEnlargement: true }).png().toBuffer();
	const blob = await removeBackground(new Blob([input], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png' } });
	const png = Buffer.from(await blob.arrayBuffer());
	const info = await sharp(png).trim({ threshold: 10 }).resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 90 }).toFile(join(OUT, `${name}.webp`));
	console.log(`ok ${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB ${Date.now() - t}ms`);
}
