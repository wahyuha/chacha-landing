// Cut brand objects (booth views, cups) out of composed mockups. Usage: node scripts/cutout-brand.mjs
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const B = 'assets-src/brand';
const OUT = 'static/img/cut';
mkdirSync(OUT, { recursive: true });

/** [output, source, crop region, max width] */
const jobs = [
	['booth-front', `${B}/booth-kecil-views.webp`, { left: 140, top: 140, width: 590, height: 740 }, 900],
	['booth-left', `${B}/booth-kecil-views.webp`, { left: 990, top: 0, width: 480, height: 500 }, 800],
	['booth-right', `${B}/booth-kecil-views.webp`, { left: 1010, top: 520, width: 460, height: 425 }, 800],
	['cup-forest-front', `${B}/cup-forest-front.jpg`, null, 700],
	['cup-forest-side', `${B}/cup-forest-side.jpg`, null, 700],
	['cup-clear', `${B}/cups-clear.webp`, { left: 40, top: 100, width: 520, height: 780 }, 600],
	['cup-clear-quote', `${B}/cups-clear.webp`, { left: 560, top: 100, width: 520, height: 780 }, 600]
];

for (const [name, src, crop, w] of jobs) {
	let img = sharp(src);
	if (crop) img = img.extract(crop);
	const input = await img.png().toBuffer();
	const blob = await removeBackground(new Blob([input], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png' } });
	const info = await sharp(Buffer.from(await blob.arrayBuffer()))
		.trim({ threshold: 10 })
		.resize({ width: w, withoutEnlargement: true })
		.webp({ quality: 88, alphaQuality: 90 })
		.toFile(`${OUT}/${name}.webp`);
	console.log(`ok ${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`);
}
