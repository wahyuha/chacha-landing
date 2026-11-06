// Printed artwork for the Booth Kecil wrap (concept v2 "Fresh Morning"): warm-white HPL panels with the
// cup's mountain line-art in pale sage, the vector logo, two hero cups on the front and the slogan on the sides.
// Drawn at 2000 px per metre so the same canvases can feed the 3D render and, later, a print file.
import { ridge, terraces, rng, CLOUD, PETAL } from '../art.ts';
import { LOGO } from '../brand/logo-paths.ts';

/** Drinks printed on the booth's counter riser. This artwork keeps its own list, separate from the website menu. */
const BOOTH_MENU = [
	{ name: 'Jasmine Milk Tea', liquid: ['#E3CBA8', '#D9BC93', '#C9A77A'] },
	{ name: 'Brown Sugar Milk', liquid: ['#E8D5B9', '#D8BC98', '#B98B5E'] },
	{ name: 'Matcha Latte', liquid: ['#7FA24A', '#B9CC8A', '#F4F0E6'] },
	{ name: 'Peach Oolong', liquid: ['#F4C58E', '#EDAE70', '#E39A5A'] },
	{ name: 'Lychee Jasmine', liquid: ['#F6DCD6', '#EFC7C0', '#E7B3AC'] },
	{ name: 'Lemon Green Tea', liquid: ['#EBE4A0', '#DED483', '#CFC267'] }
];

export const PX = 2000; // px per metre

/** Panel sizes in metres (see model.ts). */
export const FRONT = { w: 0.98, h: 0.733 };
export const SIDE = { w: 0.43, h: 0.733 };
export const RISER = { w: 0.72, h: 0.15 };
export const KICK = 0.09; // forest kick band at the foot of every panel

export const C = {
	white: '#FBF9F4',
	forest: '#1D5A45',
	deep: '#143F31',
	gold: '#C9A24E',
	sage: '#86AE98',
	sageSoft: '#B3CEBE',
	cream: '#F3EBDD'
};

const SANS = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
const SERIF = '"Cormorant Garamond", Georgia, serif';

function canvas(w: number, h: number) {
	const c = document.createElement('canvas');
	c.width = Math.round(w * PX);
	c.height = Math.round(h * PX);
	const g = c.getContext('2d')!;
	g.lineJoin = 'round';
	g.lineCap = 'round';
	return { c, g };
}

function star(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
	g.save();
	g.translate(x, y);
	g.beginPath();
	g.moveTo(0, -s);
	g.quadraticCurveTo(0, 0, s, 0);
	g.quadraticCurveTo(0, 0, 0, s);
	g.quadraticCurveTo(0, 0, -s, 0);
	g.quadraticCurveTo(0, 0, 0, -s);
	g.fill();
	g.restore();
}

/** Pale line-art landscape across the lower part of a panel; ridges are filled with the panel colour so they overlap cleanly. */
function landscape(g: CanvasRenderingContext2D, w: number, base: number, seed: number, scale = 1) {
	const ranges = [
		{ rg: ridge({ width: w, height: base + 400, base: base - 150 * scale, peaks: Math.max(3, Math.round(w / 420)), amp: 330 * scale, seed, hatch: 6 }), col: C.sageSoft, lw: 4.5 },
		{ rg: ridge({ width: w, height: base + 400, base: base - 60 * scale, peaks: Math.max(4, Math.round(w / 280)), amp: 210 * scale, seed: seed + 13, hatch: 4 }), col: C.sage, lw: 5 },
		{ rg: ridge({ width: w, height: base + 400, base: base, peaks: Math.max(3, Math.round(w / 330)), amp: 110 * scale, seed: seed + 25, hatch: 2, sharp: false }), col: C.sage, lw: 4.5 }
	];
	for (const { rg, col, lw } of ranges) {
		g.fillStyle = C.white;
		g.fill(new Path2D(rg.fill));
		g.strokeStyle = col;
		g.lineWidth = lw;
		g.stroke(new Path2D(rg.line));
		g.lineWidth = 2.6;
		g.globalAlpha = 0.75;
		g.stroke(new Path2D(rg.hatch));
		g.globalAlpha = 1;
	}
	g.strokeStyle = C.sageSoft;
	g.lineWidth = 2.4;
	g.stroke(new Path2D(terraces(w, base + 30, base + 110, 3, seed + 3)));
}

function cloud(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
	g.save();
	g.translate(x, y);
	g.scale(s, s);
	g.strokeStyle = C.sage;
	g.lineWidth = 4.4 / s;
	g.stroke(new Path2D(CLOUD));
	g.restore();
}

/** Jasmine sprig: a curved stem with leaves and white five-petal blossoms outlined in forest. */
function sprig(g: CanvasRenderingContext2D, x: number, y: number, s: number, dir: 1 | -1, seed: number) {
	const r = rng(seed);
	g.save();
	g.translate(x, y);
	g.scale(s * dir, s);
	g.strokeStyle = C.forest;
	g.lineWidth = 3.6 / s;
	g.stroke(new Path2D('M0 0 C10 -90 -20 -170 30 -260 C50 -300 60 -330 90 -360'));
	g.stroke(new Path2D('M8 -120 C50 -140 80 -170 100 -200 M18 -210 C-20 -230 -40 -260 -50 -290'));
	const leaf = new Path2D('M0 0 C-12 -14 -12 -38 0 -54 C12 -38 12 -14 0 0 Z M0 -4 L0 -48');
	for (const [lx, ly, a] of [
		[4, -60, -35],
		[2, -150, 40],
		[40, -250, -25],
		[70, -170, 65],
		[-30, -260, -60]
	] as const) {
		g.save();
		g.translate(lx, ly);
		g.rotate(((a + (r() - 0.5) * 16) * Math.PI) / 180);
		g.fillStyle = C.white;
		g.fill(leaf);
		g.stroke(leaf);
		g.restore();
	}
	const petal = new Path2D(PETAL);
	for (const [bx, by, bs] of [
		[100, -200, 1.5],
		[-50, -290, 1.25],
		[90, -362, 1.4],
		[30, -95, 0.9]
	] as const) {
		g.save();
		g.translate(bx, by);
		g.scale(bs, bs);
		g.rotate(r() * Math.PI);
		for (let k = 0; k < 5; k++) {
			g.save();
			g.rotate((k * 2 * Math.PI) / 5);
			g.fillStyle = '#FFFFFF';
			g.fill(petal);
			g.lineWidth = 2 / (s * bs);
			g.stroke(petal);
			g.restore();
		}
		g.fillStyle = C.gold;
		g.beginPath();
		g.arc(0, 0, 4.5, 0, Math.PI * 2);
		g.fill();
		g.restore();
	}
	g.restore();
}

/** Forest kick band with a fine gold line on top and the website centred in it. */
function kick(g: CanvasRenderingContext2D, w: number, h: number, label = true) {
	const k = KICK * PX;
	g.fillStyle = C.forest;
	g.fillRect(0, h - k, w, k);
	g.fillStyle = C.gold;
	g.fillRect(0, h - k - 14, w, 4);
	if (label) {
		g.fillStyle = C.cream;
		g.font = `600 34px ${SANS}`;
		g.letterSpacing = '14px';
		g.textAlign = 'center';
		g.textBaseline = 'middle';
		const t = 'CHACHA.ID';
		g.fillText(t, w / 2 + 7, h - k / 2 + 2);
		const half = g.measureText(t).width / 2;
		for (const sx of [w / 2 - half - 40, w / 2 + half + 40]) star(g, sx, h - k / 2, 9);
		g.letterSpacing = '0px';
	}
}

function logo(g: CanvasRenderingContext2D, x: number, y: number, width: number, word = C.forest, sub = C.forest) {
	const s = width / LOGO.width;
	g.save();
	g.translate(x, y);
	g.scale(s, s);
	g.fillStyle = word;
	g.fill(new Path2D(LOGO.word));
	g.fillStyle = sub;
	g.fill(new Path2D(LOGO.sub));
	g.restore();
	return LOGO.height * s;
}

/** Soft printed shadow under a cup so it sits on the landscape instead of floating. */
function groundShadow(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, a = 0.22) {
	g.save();
	g.translate(cx, cy);
	g.scale(1, ry / rx);
	const grd = g.createRadialGradient(0, 0, 0, 0, 0, rx);
	grd.addColorStop(0, `rgba(20,63,49,${a})`);
	grd.addColorStop(1, 'rgba(20,63,49,0)');
	g.fillStyle = grd;
	g.beginPath();
	g.arc(0, 0, rx, 0, Math.PI * 2);
	g.fill();
	g.restore();
}

/** Crop to the opaque bounds of a transparent PNG so placement uses the cup itself, not its padding. */
function opaqueBounds(img: HTMLImageElement) {
	const c = document.createElement('canvas');
	c.width = img.naturalWidth;
	c.height = img.naturalHeight;
	const g = c.getContext('2d')!;
	g.drawImage(img, 0, 0);
	const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
	let x0 = width, y0 = height, x1 = 0, y1 = 0;
	for (let y = 0; y < height; y += 2)
		for (let x = 0; x < width; x += 2)
			if (data[(y * width + x) * 4 + 3] > 40) {
				if (x < x0) x0 = x;
				if (x > x1) x1 = x;
				if (y < y0) y0 = y;
				if (y > y1) y1 = y;
			}
	return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function drawCup(g: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, bottom: number, height: number) {
	const b = opaqueBounds(img);
	const s = height / b.h;
	const w = b.w * s;
	groundShadow(g, cx, bottom - 6, w * 0.62, 34);
	g.drawImage(img, b.x, b.y, b.w, b.h, cx - w / 2, bottom - height, w, height);
}

export function paintFront(cups: { forest: HTMLImageElement; cream: HTMLImageElement }) {
	const { c, g } = canvas(FRONT.w, FRONT.h);
	const W = c.width, H = c.height;
	g.fillStyle = C.white;
	g.fillRect(0, 0, W, H);

	// a pale sage moon rising behind the ridges gives the cups a stage; a thin gold arc rims its top
	g.fillStyle = '#DAE8DF';
	g.beginPath();
	g.arc(1420, 700, 420, 0, Math.PI * 2);
	g.fill();
	g.strokeStyle = C.gold;
	g.lineWidth = 4;
	g.beginPath();
	g.arc(1420, 700, 452, Math.PI * 1.08, Math.PI * 1.92);
	g.stroke();

	// sky
	cloud(g, 230, 640, 1.7);
	cloud(g, 660, 560, 1.2);
	g.fillStyle = C.gold;
	const r = rng(5);
	for (let i = 0; i < 9; i++) star(g, 120 + r() * 760, 520 + r() * 220, 5 + r() * 6);

	landscape(g, W, 1150, 4, 0.85);
	sprig(g, 100, 1240, 0.9, 1, 2);
	sprig(g, 800, 1250, 0.65, -1, 6);

	// logo lockup, top-left, with a short gold rule under it
	const lx = 120, ly = 150, lw = 780;
	const lh = logo(g, lx, ly, lw);
	g.fillStyle = C.gold;
	g.fillRect(lx + 4, ly + lh + 50, 130, 7);

	// hero cups: forest behind-left, cream in front-right, standing in front of the moon
	drawCup(g, cups.forest, 1250, 1225, 960);
	drawCup(g, cups.cream, 1610, 1245, 820);

	kick(g, W, H);
	return c;
}

export function paintSide(flip = false) {
	const { c, g } = canvas(SIDE.w, SIDE.h);
	const W = c.width, H = c.height;
	g.fillStyle = C.white;
	g.fillRect(0, 0, W, H);

	landscape(g, W, 1160, flip ? 41 : 33, 0.65);

	// slogan, set like a tea-house sign: two upright lines in forest, the last in gold italic
	const x = 100;
	g.fillStyle = C.gold;
	g.beginPath();
	g.arc(x + 20, 220, 20, 0, Math.PI * 2);
	g.fill();
	g.textAlign = 'left';
	g.textBaseline = 'alphabetic';
	g.fillStyle = C.forest;
	g.font = `500 140px ${SERIF}`;
	g.fillText('Good tea.', x, 420);
	g.fillText('Good mood.', x, 580);
	g.fillStyle = C.gold;
	g.font = `italic 500 140px ${SERIF}`;
	g.fillText('Every day.', x, 740);
	g.fillStyle = C.forest;
	g.fillRect(x + 4, 810, 110, 5);

	sprig(g, flip ? 130 : W - 130, 1250, 0.85, flip ? 1 : -1, flip ? 9 : 4);
	kick(g, W, H, false);
	return c;
}

/** Menu strip on the counter riser: the six drinks as little clear cups with their real liquid colours. */
export function paintRiser() {
	const { c, g } = canvas(RISER.w, RISER.h);
	const W = c.width, H = c.height;
	g.fillStyle = '#FFFFFF';
	g.fillRect(0, 0, W, H);
	g.fillStyle = C.forest;
	g.fillRect(0, H - 18, W, 18);

	g.textBaseline = 'alphabetic';
	g.textAlign = 'left';
	g.fillStyle = C.forest;
	g.font = `italic 500 84px ${SERIF}`;
	g.fillText('Menu', 60, 150);
	g.font = `600 22px ${SANS}`;
	g.letterSpacing = '5px';
	g.fillStyle = C.gold;
	g.fillText('FRESH DAILY', 62, 196);
	g.letterSpacing = '0px';
	g.fillStyle = C.gold;
	g.fillRect(300, 50, 3, H - 110);

	const items = BOOTH_MENU;
	const x0 = 360, step = (W - x0 - 40) / items.length;
	items.forEach((d, i) => {
		const cx = x0 + step * i + step / 2;
		const top = 46, bot = 196, tw = 70, bw = 52;
		const cup = new Path2D(`M${cx - tw / 2} ${top} L${cx + tw / 2} ${top} L${cx + bw / 2} ${bot} L${cx - bw / 2} ${bot} Z`);
		const grd = g.createLinearGradient(0, top + 20, 0, bot);
		grd.addColorStop(0, d.liquid[0]);
		grd.addColorStop(0.55, d.liquid[1]);
		grd.addColorStop(1, d.liquid[2]);
		g.save();
		g.clip(cup);
		g.fillStyle = grd;
		g.fillRect(cx - tw, top + 16, tw * 2, bot);
		g.restore();
		g.strokeStyle = 'rgba(20,63,49,.35)';
		g.lineWidth = 2;
		g.stroke(cup);
		g.fillStyle = '#1b1b1b';
		g.beginPath();
		g.ellipse(cx, top, tw / 2 + 4, 9, 0, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = C.forest;
		g.font = `600 19px ${SANS}`;
		g.textAlign = 'center';
		const [a, ...b] = d.name.split(' ');
		g.fillText(b.length ? `${a} ${b.slice(0, -1).join(' ')}`.trim() : a, cx, 230);
		g.fillText(b.length ? b[b.length - 1] : '', cx, 254);
	});
	return c;
}

/** Procedural oak: honey base with long streaky grain and a few soft growth bands. `along` = grain direction. */
export function paintOak(w: number, h: number, seed = 1) {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	const g = c.getContext('2d')!;
	g.fillStyle = '#D9B58A';
	g.fillRect(0, 0, w, h);
	const r = rng(seed);
	for (let i = 0; i < 70; i++) {
		const y = r() * h;
		const band = 6 + r() * 40;
		g.fillStyle = r() > 0.5 ? `rgba(160,110,60,${0.05 + r() * 0.08})` : `rgba(250,225,185,${0.05 + r() * 0.1})`;
		g.beginPath();
		g.moveTo(0, y);
		for (let x = 0; x <= w; x += w / 16) g.lineTo(x, y + Math.sin(x / (120 + r() * 200) + i) * 10);
		for (let x = w; x >= 0; x -= w / 16) g.lineTo(x, y + band + Math.sin(x / 160 + i) * 8);
		g.fill();
	}
	for (let i = 0; i < 900; i++) {
		const y = r() * h;
		const x = r() * w;
		const len = 40 + r() * 260;
		g.strokeStyle = `rgba(120,78,40,${0.05 + r() * 0.12})`;
		g.lineWidth = 0.6 + r() * 1.4;
		g.beginPath();
		g.moveTo(x, y);
		g.quadraticCurveTo(x + len / 2, y + (r() - 0.5) * 6, x + len, y + (r() - 0.5) * 4);
		g.stroke();
	}
	return c;
}
