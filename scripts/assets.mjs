// Build web images from source material into static/img (WebP, sized for the layout).
// Usage: node scripts/assets.mjs
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const MAT = '../material';
const SRC = 'assets-src'; // generated images (Canva) land here
const OUT = 'static/img';
mkdirSync(OUT, { recursive: true });

const m = (name) => join(MAT, `WhatsApp Image ${name}.jpeg`);
const s = (name) => join(SRC, name);

/** [output, source, { width, crop?: {left, top, width, height}, quality? }] */
const jobs = [
	// gallery (brand mockups)
	['g-interior', m('2026-09-29 at 15.56.53'), { width: 1400, crop: { left: 0, top: 0, width: 1370, height: 1086 } }],
	['g-jasmine', m('2026-09-24 at 10.46.16'), { width: 900 }],
	['g-clear', m('2026-09-24 at 09.22.39'), { width: 1300, crop: { left: 0, top: 60, width: 1060, height: 900 } }],
	['g-duo', m('2026-09-04 at 10.25.29'), { width: 1400 }],
	['cup-forest', m('2026-09-24 at 10.46.16 (1)'), { width: 800 }],
	['cup-cream', m('2026-09-24 at 10.46.16 (2)'), { width: 800 }],
	// hero; a generated/real photo in assets-src overrides the mockup
	['hero-portrait', s('hero-portrait.png'), { width: 1100, quality: 80 }, m('2026-09-24 at 10.46.16 (1)')],
	['menu-jasmine', s('menu-jasmine.png'), { width: 900 }],
	['menu-brownsugar', s('menu-brownsugar.png'), { width: 900 }],
	['menu-matcha', s('menu-matcha.png'), { width: 900 }],
	['menu-peach', s('menu-peach.png'), { width: 900 }],
	['menu-lychee', s('menu-lychee.png'), { width: 900 }],
	['menu-lemon', s('menu-lemon.png'), { width: 900 }],
	['booth-portable', s('booth-portable.png'), { width: 1300 }],
	['booth-kecil', s('booth-kecil.png'), { width: 1300 }],
	['booth-plus', s('booth-plus.png'), { width: 1300 }],
	['booth-mall', s('booth-mall.png'), { width: 1300 }]
];

for (const [out, src, opt, fallback] of jobs) {
	const file = existsSync(src) ? src : fallback && existsSync(fallback) ? fallback : null;
	if (!file) {
		console.log(`skip  ${out} (missing ${src})`);
		continue;
	}
	let img = sharp(file);
	const meta = await img.metadata();
	if (opt.crop === 'portrait') {
		const w = Math.round(meta.height * 0.8);
		img = img.extract({ left: Math.round((meta.width - w) * 0.55), top: 0, width: w, height: meta.height });
	} else if (opt.crop) img = img.extract(opt.crop);
	img = img.resize({ width: opt.width, withoutEnlargement: true });
	const info = await img.webp({ quality: opt.quality ?? 80, effort: 6 }).toFile(join(OUT, `${out}.webp`));
	console.log(`ok    ${out}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB${file === src ? '' : ' (fallback)'}`);
}

// Open Graph card
{
	await sharp(m('2026-09-04 at 10.25.29')).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toFile('static/og.jpg');
	console.log('ok    og.jpg');
}
