// Builds smaller copies of large site images so phones download what they display.
// For each listed image it writes `name@<width>.webp` beside the original and records
// the sizes in src/lib/img-sizes.json, which `srcset()` in src/lib/img.ts reads.
// Run after replacing any listed image: node scripts/responsive.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const STATIC = 'static';
const MANIFEST = 'src/lib/img-sizes.json';

// [file or folder under static/, widths to build]
const SETS = [
	['img/site/drinks', [200, 300]],
	['img/site/teas', [480, 640, 800]],
	['img/site/bases', [480]],
	['img/site/duo-1200.webp', [640, 900]],
	['img/site/poster-layers-1200.webp', [640, 900]],
	['img/site/poster-peach-1200.webp', [640, 900]],
	['img/site/poster-matcha-1200.webp', [640, 900]],
	['img/site/hands.webp', [600, 900]],
	['img/kit', [200, 320]],
	['img/cut/cup-forest-front.webp', [240, 400]],
	['img/cut/cup-clear.webp', [240]],
	['img/cut/booth-front.webp', [700, 1000]],
	['img/cut/booth-left.webp', [700, 1000]],
	['img/cut/booth-right.webp', [700, 1000]],
	['img/cup-cream-render.webp', [160, 480]],
	['img/cup-render.webp', [480]]
];

const isVariant = (f) => /@\d+\.webp$/.test(f);
const files = (entry) => {
	const abs = path.join(STATIC, entry);
	if (fs.statSync(abs).isFile()) return [entry];
	return fs
		.readdirSync(abs)
		.filter((f) => f.endsWith('.webp') && !isVariant(f))
		.map((f) => path.posix.join(entry, f));
};

const manifest = {};
for (const [entry, widths] of SETS) {
	for (const rel of files(entry)) {
		const src = path.join(STATIC, rel);
		const { width } = await sharp(src).metadata();
		const built = [];
		for (const w of widths.filter((w) => w < width * 0.9)) {
			const out = src.replace(/\.webp$/, `@${w}.webp`);
			await sharp(src).resize({ width: w }).webp({ quality: 78, effort: 6 }).toFile(out);
			built.push(w);
		}
		manifest['/' + rel] = { w: width, v: built };
		console.log(rel, width, '->', built.join(', ') || 'none');
	}
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, '\t') + '\n');
console.log(`wrote ${MANIFEST} (${Object.keys(manifest).length} images)`);
