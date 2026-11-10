// Builds the brand site's images from assets-src/site into static/img/site.
// Usage: node scripts/site-assets.mjs [drinks|bases|teas|photos|logos ...]   (no args builds everything)
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'assets-src/site';
const OUT = 'static/img/site';
mkdirSync(`${OUT}/drinks`, { recursive: true });
mkdirSync(`${OUT}/bases`, { recursive: true });
mkdirSync(`${OUT}/teas`, { recursive: true });

const only = process.argv.slice(2);
const wants = (step) => !only.length || only.includes(step);

/** Flat ground sampled from the Four Seasons photo, so every tea sits on the same surface. */
const TEA_GROUND = { r: 234, g: 233, b: 231 };

async function cutout(buffer) {
	const blob = await removeBackground(new Blob([buffer], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png' } });
	return Buffer.from(await blob.arrayBuffer());
}

/** Crop a region of the printed menu, enlarge it and remove the paper background. */
async function fromMenu(box, scale) {
	const up = await sharp(`${SRC}/menu.webp`)
		.extract(box)
		.resize({ width: box.width * scale, kernel: 'lanczos3' })
		.sharpen({ sigma: 0.8 })
		.png()
		.toBuffer();
	return sharp(await cutout(up)).trim({ threshold: 10 }).toBuffer();
}

// Boxes are in pixels of the 2000 x 1413 menu.
const DRINKS = {
	'classic-milk-tea': [165, 408, 130, 200],
	'classic-jelly-milk-tea': [465, 408, 130, 200],
	'premium-oolong-milk-tea': [780, 412, 130, 200],
	'red-oolong-milk-tea': [1080, 412, 130, 200],
	'jasmine-milk-tea': [1392, 396, 130, 210],
	'peach-oolong-milk-tea': [1705, 396, 130, 210],
	'classic-matcha': [552, 765, 106, 188],
	'crumble-matcha': [794, 765, 104, 188],
	'coconut-matcha': [1030, 765, 118, 188],
	'ube-cream-matcha': [1270, 765, 118, 188],
	'caramel-matcha': [1510, 765, 118, 188],
	'creamy-matcha': [1750, 765, 118, 188],
	'jasmine-tea': [590, 1078, 135, 215],
	'peach-oolong-tea': [928, 1078, 135, 215],
	'mango-tea': [1262, 1078, 135, 215]
};

const BASES = {
	'premium-black-tea': [195, 228, 370, 140],
	'red-oolong': [810, 228, 370, 145],
	jasmine: [1310, 232, 295, 108],
	'premium-oolong': [1625, 232, 295, 105],
	matcha: [75, 775, 390, 150]
};

if (wants('drinks')) {
	for (const [name, [left, top, width, height]] of Object.entries(DRINKS)) {
		const png = await fromMenu({ left, top, width, height }, 4);
		const info = await sharp(png).webp({ quality: 88, alphaQuality: 90 }).toFile(`${OUT}/drinks/${name}.webp`);
		console.log('drink', name, info.width, info.height);
	}
}

if (wants('bases')) {
	for (const [name, [left, top, width, height]] of Object.entries(BASES)) {
		// Automatic cutout removes the wooden paddles, so these keep the menu's paper background.
		const info = await sharp(`${SRC}/menu.webp`)
			.extract({ left, top, width, height })
			.resize({ width: width * 3, kernel: 'lanczos3' })
			.sharpen({ sigma: 0.8 })
			.webp({ quality: 88 })
			.toFile(`${OUT}/bases/${name}.webp`);
		console.log('base', name, info.width, info.height);
	}
}

// Hand-traced outlines (tray, cup, plate) in the coordinates of a 1000 x 750 view of each photo.
// Automatic cutout fails here: the steel table reflects through the white plates.
const TEA_MASKS = {
	black: {
		tray: '385,183 490,183 930,410 978,530 975,565 940,595 95,615 20,585 75,365',
		ellipses: [[247, 308, 178, 150], [698, 330, 246, 210]]
	},
	'red-oolong': {
		tray: '92,300 400,265 880,262 905,270 968,440 965,472 600,482 50,492 36,462',
		ellipses: [[268, 285, 128, 125], [125, 300, 45, 52], [687, 345, 198, 162]]
	},
	jasmine: {
		tray: '125,195 360,182 850,178 880,200 993,565 975,605 95,632 30,595 30,580',
		ellipses: [[240, 328, 182, 158], [693, 355, 256, 225]]
	},
	'premium-oolong': {
		tray: '370,152 880,180 905,205 975,590 950,628 60,556 35,520 105,355',
		ellipses: [[238, 268, 172, 148], [678, 360, 258, 230]]
	}
};

/** Place a masked tea photo on the shared ground at 3:2 with a soft contact shadow. */
async function teaOnGround(name) {
	const W = 1200, H = 800, SW = 1600, SH = 1200, k = SW / 1000;
	const { tray, ellipses } = TEA_MASKS[name];
	const points = tray.split(' ').map((p) => p.split(',').map((n) => n * k).join(',')).join(' ');
	const shapes = `<polygon points="${points}" fill="#fff" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>`
		+ ellipses.map(([x, y, rx, ry]) => `<ellipse cx="${x * k}" cy="${y * k}" rx="${rx * k}" ry="${ry * k}" fill="#fff"/>`).join('');
	const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}"><rect width="100%" height="100%" fill="#000"/>${shapes}</svg>`);
	const mask = await sharp(svg).blur(1.5).extractChannel('red').raw().toBuffer();
	const rgb = await sharp(`${SRC}/tea-${name}.jpg`).resize(SW, SH).removeAlpha().modulate({ brightness: 1.04 }).png().toBuffer();
	const cut = await sharp(rgb).joinChannel(mask, { raw: { width: SW, height: SH, channels: 1 } }).png().toBuffer();
	const trimmed = await sharp(cut).trim({ threshold: 5 }).toBuffer();
	const piece = await sharp(trimmed).resize({ width: Math.round(W * 0.88), height: Math.round(H * 0.82), fit: 'inside' }).png().toBuffer();
	const { width, height } = await sharp(piece).metadata();
	const left = Math.round((W - width) / 2);
	const top = Math.round((H - height) / 2);
	const alpha = await sharp(piece).extractChannel('alpha').linear(0.3, 0).raw().toBuffer();
	const shadowPiece = await sharp({ create: { width, height, channels: 3, background: { r: 50, g: 42, b: 34 } } })
		.joinChannel(alpha, { raw: { width, height, channels: 1 } })
		.png()
		.toBuffer();
	const shadow = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
		.composite([{ input: shadowPiece, left, top: top + 14 }])
		.png()
		.toBuffer();
	const soft = await sharp(shadow).blur(18).png().toBuffer();
	await sharp({ create: { width: W, height: H, channels: 3, background: TEA_GROUND } })
		.composite([{ input: soft }, { input: piece, left, top }])
		.webp({ quality: 84 })
		.toFile(`${OUT}/teas/${name}.webp`);
	console.log('tea', name);
}

if (wants('teas')) {
	for (const name of Object.keys(TEA_MASKS)) await teaOnGround(name);
	// Matcha exists only as a menu slice (no raw photo yet), so it keeps the menu's paper background.
	await sharp(`${SRC}/menu.webp`)
		.extract({ left: 75, top: 775, width: 390, height: 150 })
		.resize({ width: 1170, kernel: 'lanczos3' })
		.sharpen({ sigma: 0.8 })
		.extend({ top: 165, bottom: 165, extendWith: 'copy' })
		.webp({ quality: 84 })
		.toFile(`${OUT}/teas/matcha.webp`);
	// Four Seasons is already on the right ground: crop above its printed label and logo.
	await sharp(`${SRC}/tea-four-seasons.jpg`)
		.extract({ left: 40, top: 0, width: 1920, height: 1280 })
		.resize({ width: 1200 })
		.webp({ quality: 84 })
		.toFile(`${OUT}/teas/four-seasons.webp`);
}

if (wants('photos')) {
	for (const [src, name] of [['poster-peach', 'poster-peach'], ['poster-matcha', 'poster-matcha'], ['poster-layers', 'poster-layers'], ['duo', 'duo']]) {
		// Smaller copies come from scripts/responsive.mjs.
		await sharp(`${SRC}/${src}.jpg`).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${OUT}/${name}-1200.webp`);
	}
	// Kemitraan hero: the real outlet photo.
	for (const w of [1500, 800]) {
		await sharp(`${SRC}/outlet-hero.jpg`).resize({ width: w }).webp({ quality: 84 }).toFile(`${OUT}/outlet-hero-${w}.webp`);
	}
	// Hands: crop away the poster's headline, logo and the white strips on its edges.
	await sharp(`${SRC}/poster-hands.jpg`)
		.extract({ left: 60, top: 300, width: 1480, height: 1370 })
		.resize({ width: 1200 })
		.webp({ quality: 82 })
		.toFile(`${OUT}/hands.webp`);
	await sharp(`${SRC}/duo.jpg`).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82 }).toFile(`${OUT}/og-home.jpg`);
}

if (wants('logos')) {
	// White lockup: the full-colour logo's darkness becomes transparency, which keeps the softer outer ring.
	const stacked = await sharp(`${SRC}/logo-stacked.webp`).flatten({ background: '#ffffff' }).resize({ width: 480 }).png().toBuffer();
	const { data: grey, info: greyInfo } = await sharp(stacked).greyscale().raw().toBuffer({ resolveWithObject: true });
	const { width: lw, height: lh } = greyInfo;
	const INK = 62; // brightness of the logo's darkest green
	const inkAlpha = Buffer.from(grey.map((g) => Math.min(255, Math.round(((255 - g) / (255 - INK)) * 255))));
	await sharp({ create: { width: lw, height: lh, channels: 3, background: '#ffffff' } })
		.joinChannel(inkAlpha, { raw: { width: lw, height: lh, channels: 1 } })
		.webp({ quality: 92, alphaQuality: 100 })
		.toFile(`${OUT}/logo-stacked-white.webp`);
	await sharp(`${SRC}/logo-wordmark.png`).trim().resize({ width: 640 }).webp({ quality: 92 }).toFile(`${OUT}/logo-wordmark.webp`);
	await sharp(`${SRC}/logo-mark.png`).trim().resize({ width: 240 }).webp({ quality: 92 }).toFile(`${OUT}/logo-mark.webp`);
	// Favicon: the green mark on ivory.
	const mark = await sharp(`${SRC}/logo-mark.png`).trim().resize({ width: 136, height: 136, fit: 'inside' }).png().toBuffer();
	await sharp({ create: { width: 180, height: 180, channels: 4, background: '#F7F4EE' } })
		.composite([{ input: mark, gravity: 'center' }])
		.png()
		.toFile('static/favicon.png');
}
console.log('done');
