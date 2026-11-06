// Chacha dispenser wrap (8 L stainless dispenser, Ø 23 cm, H 32 cm), drawn in the same gold line-art
// language as the cup and the site's closing section: etched mountain ranges, clouds, stars, a sun,
// jasmine vines, tea terraces. The only mark is the Chacha logo, front (tap side) and back.
// Outputs the flat print artwork (PDF + 300 dpi PNG), a dieline preview, and a mockup on the real photo.
// Usage: node print/dispenser-wrap/build.mjs [path/to/dispenser-photo.jpg]
import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { rng, smooth, terraces, CLOUD, PETAL } from '../../src/lib/art.ts';
import { LOGO } from '../../src/lib/brand/logo-paths.ts';

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ---- geometry (mm) ----
const D = 230; // outer diameter given by the supplier
const C = Math.PI * D; // 722.6 mm around
const OVERLAP = 15; // tuck-under strip at the seam
const W = C + OVERLAP; // trim width
const H = 250; // trim height (stainless band ≈ 265 mm, ~7 mm clear of lid and base)
const BLEED = 3;
const BAND = 265; // stainless band between lid and base (mm), estimated from the photo — measure to confirm
const TOP_GAP = 7; // wrap starts this far below the lid
const TAP_Y = H - 48, TAP_R = 17.5; // tap nut ≈ 56 mm above the base (perspective-corrected from the photo) → Ø35 mm hole

// ---- artwork units: same scale as the cup artwork (1024 units tall) ----
const U = H / 1024; // mm per unit
const CU = C / U; // units once around
const FRONT = CU / 4, BACK = (3 * CU) / 4; // seam sits at the side, 90° from the tap
// colour variants: line = mountains, clouds, vines; accent = sun, stars, foil bands, tap ring
const PALETTES = {
	forest: { bg: '#143F31', line: '#D9B869', accent: '#D9B869', word: '#D9B869', sub: '#D9B869', flowerFill: '#F3EBDD', flowerHeart: '#D9B869' },
	gold: { bg: '#D4B062', line: '#143F31', accent: '#143F31', word: '#143F31', sub: '#143F31', flowerFill: '#FBF7F0', flowerHeart: '#143F31' },
	cream: { bg: '#F4EDE1', line: '#1D5A45', accent: '#C9A24E', word: '#1D5A45', sub: '#C9A24E', flowerFill: '#FFFFFF', flowerHeart: '#C9A24E' }
};
const VARIANT = process.argv[3] ?? 'forest';
const pal = PALETTES[VARIANT];
if (!pal) throw new Error(`unknown variant ${VARIANT}; use ${Object.keys(PALETTES).join(', ')}`);
const NAME = `chacha-dispenser-wrap-${VARIANT}`;

// a mountain range that wraps seamlessly around the body
function wrapRidge({ base, peaks, amp, seed, hatch = 0, sharp = true }) {
	const r = rng(seed);
	const step = CU / peaks;
	const one = [];
	const peakPts = [];
	const valleys = [];
	for (let i = 0; i < peaks; i++) {
		const x0 = i * step;
		const px = x0 + step * (0.3 + r() * 0.4);
		const py = base - amp * (0.45 + r() * 0.55);
		const vy = base - amp * (0.05 + r() * 0.2);
		one.push([px - step * (0.18 + r() * 0.08), py + amp * (0.18 + r() * 0.12)]);
		one.push([px, py]);
		if (sharp) one.push([px + step * (0.08 + r() * 0.06), py + amp * (0.1 + r() * 0.08)]);
		one.push([x0 + step, vy]);
		valleys.push(vy);
		peakPts.push([px, py]);
	}
	// start on the last valley so the range joins itself at the seam
	const loop = [[0, valleys[peaks - 1]], ...one];
	const pts = [...loop.slice(0, -1).map(([x, y]) => [x - CU, y]), ...loop.slice(0, -1), ...loop.map(([x, y]) => [x + CU, y])];
	const line = smooth(pts, sharp ? 0.35 : 0.5);
	const fill = `${line} L${2 * CU} 1100 L${-CU} 1100 Z`;
	let h = '';
	if (hatch) {
		for (const [px, py] of peakPts) {
			const count = Math.round(hatch * (0.6 + r() * 0.6));
			for (let k = 1; k <= count; k++) {
				const t = k / (count + 1);
				const sx = px + step * 0.34 * t, sy = py + (base - py) * t * 0.55 + amp * 0.02;
				const len = (base - sy) * (0.25 + r() * 0.35), dx = step * 0.06 * (0.5 + r());
				for (const off of [-CU, 0, CU]) h += `M${(sx + off).toFixed(1)} ${sy.toFixed(1)} q${(dx * 0.3).toFixed(1)} ${(len * 0.5).toFixed(1)} ${dx.toFixed(1)} ${len.toFixed(1)} `;
			}
		}
	}
	return { line, fill, hatch: h };
}

// jasmine vine, a straight port of the cup's vine so the two read as one family
function vine(x, y, dir, seed, bloom = 0.6, grow = 1) {
	const r = rng(seed);
	let g = `<g transform="translate(${x} ${y + 420 * (1 - grow)}) scale(${dir} 1)" stroke="${pal.line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">`;
	g += `<g transform="scale(1 ${grow})"><path d="M0 420 C40 300 -30 200 20 60 C40 0 30 -60 70 -120"/><path d="M10 250 C70 220 110 170 150 150 M22 120 C-40 90 -60 40 -80 10"/></g>`;
	const leaf = 'M0 0 C-14 -16 -14 -44 0 -62 C14 -44 14 -16 0 0 Z M0 -4 L0 -56';
	for (const [lx, ly, a] of [[18, 330, -40], [4, 200, 50], [30, 80, -30], [60, -90, 40], [120, 170, 70], [-60, 30, -70], [90, 205, 20]])
		g += `<path d="${leaf}" transform="translate(${lx} ${ly * grow}) rotate(${(a + (r() - 0.5) * 20).toFixed(1)})"/>`;
	for (const [bx, by, s] of [[150, 150, 2.4], [-80, 10, 2.0], [70, -125, 2.2], [26, 260, 1.5], [-10, 400, 1.8]]) {
		const rot = ((r() * Math.PI * 180) / Math.PI).toFixed(1);
		g += `<g transform="translate(${bx} ${by * grow}) scale(${s * bloom}) rotate(${rot})">`;
		for (let k = 0; k < 5; k++) g += `<path d="${PETAL}" transform="rotate(${k * 72})" fill="${pal.flowerFill}" stroke-width="1.3"/>`;
		g += `<circle r="4" fill="${pal.flowerHeart}" stroke="none"/></g>`;
	}
	return g + '</g>';
}

const star = (x, y, s) => `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z" fill="${pal.accent}"/>`;
const cloud = (x, y, s) => `<path d="${CLOUD}" transform="translate(${x} ${y}) scale(${s})" stroke="${pal.line}" stroke-width="${(2.2 / s).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
// anything near the seam is drawn twice so the overlap strip continues the pattern
const tile = (x, g) => g(x) + (x < 160 ? g(x + CU) : '') + (x > CU - 160 ? g(x - CU) : '');

// logo lockup: about 15 cm wide, centred in the open sky above the sun
const LOGO_W = 600, LOGO_S = LOGO_W / LOGO.width, LOGO_H = LOGO.height * LOGO_S, LOGO_Y = 300;
const logo = (cx) => `<g transform="translate(${cx - LOGO_W / 2} ${LOGO_Y - LOGO_H / 2}) scale(${LOGO_S})"><path d="${LOGO.word}" fill="${pal.word}"/><path d="${LOGO.sub}" fill="${pal.sub}"/></g>`;
const nearLogo = (x, y) => [FRONT, BACK].some((c) => Math.abs(x - c) < LOGO_W / 2 + 70 && y > LOGO_Y - LOGO_H / 2 - 50 && y < LOGO_Y + LOGO_H / 2 + 40);

let sky = '';
const CLOUDS = [[90, 90, 1.6], [430, 120, 1.3], [1010, 70, 1.5], [1260, 150, 1.9], [1520, 80, 1.2], [1760, 140, 1.5], [2450, 70, 1.8], [2700, 150, 1.3], [2050, 60, 1.1]];
for (const [x, y, s] of CLOUDS) sky += tile(x, (xx) => cloud(xx, y, s));
const nearCloud = (x, y) => CLOUDS.some(([cx, cy, s]) => [-CU, 0, CU].some((o) => x > cx + o - 20 && x < cx + o + 120 * s + 20 && y > cy - 20 && y < cy + 48 * s + 20));
const sr = rng(9);
for (let i = 0; i < 110; i++) {
	const x = sr() * CU, y = 40 + sr() * 420, s = 9 + sr() * 9;
	if (nearLogo(x, y) || nearCloud(x, y) || y > 440) continue;
	sky += tile(x, (xx) => star(+xx.toFixed(1), +y.toFixed(1), +s.toFixed(1)));
}

const ranges = [
	wrapRidge({ base: 740, peaks: 9, amp: 260, seed: 4, hatch: 8 }),
	wrapRidge({ base: 810, peaks: 13, amp: 170, seed: 17, hatch: 5 }),
	wrapRidge({ base: 880, peaks: 10, amp: 90, seed: 29, hatch: 3, sharp: false })
];
let land = '';
ranges.forEach((rg, i) => {
	land += `<path d="${rg.fill}" fill="${pal.bg}"/><path d="${rg.line}" stroke="${pal.line}" stroke-width="${3 - i * 0.5}" fill="none"/>`;
	if (rg.hatch) land += `<path d="${rg.hatch}" stroke="${pal.line}" stroke-width="1.4" stroke-opacity=".7" fill="none" stroke-linecap="round"/>`;
});
// terraces sized to one lap; drawn at -CU, 0 and +CU so they continue through the seam
const tr = terraces(CU, 905, 985, 5, 3);
land += [-CU, 0, CU].map((o) => `<path d="${tr}" transform="translate(${o} 0)" stroke="${pal.line}" stroke-width="1.6" stroke-opacity=".7" fill="none"/>`).join('');

const suns = [FRONT, BACK].map((x) => `<circle cx="${x}" cy="540" r="30" fill="${pal.accent}"/><circle cx="${x}" cy="540" r="46" fill="none" stroke="${pal.accent}" stroke-opacity=".35" stroke-width="1.5"/>`).join('');
const vines = [FRONT, BACK].map((x, i) => vine(x - 420, 560, -1, 3 + i * 10, 0.6, 0.72) + vine(x + 420, 560, 1, 8 + i * 10, 0.6, 0.72)).join('') + tile(40, (xx) => vine(xx, 600, 1, 12, 0.6, 0.9)) + vine(CU / 2, 600, -1, 15, 0.6, 0.9);
// thin foil lines along the base, like the cup
const bands = `<rect x="${-CU}" y="1000" width="${3 * CU}" height="5" fill="${pal.accent}"/><rect x="${-CU}" y="1012" width="${3 * CU}" height="2" fill="${pal.accent}"/>`;
// a hairline gold ring framing the tap opening
const tapRing = `<circle cx="${FRONT}" cy="${TAP_Y / U}" r="${(TAP_R + 2.5) / U}" fill="none" stroke="${pal.accent}" stroke-width="3"/>`;

const art = `<g transform="scale(${U})">
<rect x="${-CU}" y="-40" width="${3 * CU}" height="1110" fill="${pal.bg}"/>
${sky}${suns}${land}${vines}${bands}${tapRing}${logo(FRONT)}${logo(BACK)}
</g>`;

const dieline = `<g fill="none" stroke-width=".5">
	<rect x="0" y="0" width="${W}" height="${H}" stroke="#ff2bd6"/>
	<rect x="${-BLEED}" y="${-BLEED}" width="${W + 2 * BLEED}" height="${H + 2 * BLEED}" stroke="#00b7ff" stroke-dasharray="3 2"/>
	<circle cx="${C / 4}" cy="${TAP_Y}" r="${TAP_R}" stroke="#ff2bd6"/>
	<line x1="${C / 4}" y1="${TAP_Y + TAP_R}" x2="${C / 4}" y2="${H}" stroke="#ff2bd6"/>
	<rect x="${C}" y="0" width="${OVERLAP}" height="${H}" fill="#ff2bd6" fill-opacity=".18" stroke="#ff2bd6" stroke-dasharray="2 2"/>
	${[C / 4, (3 * C) / 4].map((x) => `<line x1="${x}" y1="-6" x2="${x}" y2="${H + 6}" stroke="#ffd400" stroke-dasharray="1 2"/>`).join('')}
</g>
<g font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="5" fill="#ff2bd6">
	<text x="${C + 9}" y="${H / 2}" transform="rotate(-90 ${C + 9} ${H / 2})" text-anchor="middle">OVERLAP 15 mm</text>
	<text x="${C / 4 + TAP_R + 4}" y="${TAP_Y + 4}">Lubang keran Ø35 mm + celah ke bawah</text>
	<text x="${C / 4 + 2}" y="-1.5" fill="#c9a300">DEPAN (keran)</text>
	<text x="${(3 * C) / 4 + 2}" y="-1.5" fill="#c9a300">BELAKANG</text>
</g>`;

const svg = (die) => {
	const pad = die ? 10 : 0;
	const w = W + 2 * BLEED + 2 * pad, h = H + 2 * BLEED + 2 * pad;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="${-BLEED - pad} ${-BLEED - pad} ${w} ${h}">${die ? `<rect x="${-BLEED - pad}" y="${-BLEED - pad}" width="${w}" height="${h}" fill="#fff"/>` : ''}<defs><clipPath id="bleed"><rect x="${-BLEED}" y="${-BLEED}" width="${W + 2 * BLEED}" height="${H + 2 * BLEED}"/></clipPath></defs><g clip-path="url(#bleed)">${art}</g>${die ? dieline : ''}</svg>`;
};

writeFileSync(`${here}/${NAME}.svg`, svg(false));
writeFileSync(`${here}/wrap-dieline.svg`, svg(true));
const DPI = 300, pxW = Math.round(((W + 2 * BLEED) / 25.4) * DPI);
await sharp(Buffer.from(svg(false)), { density: DPI, limitInputPixels: false }).resize(pxW).png().toFile(`${here}/${NAME}-print.png`);
await sharp(Buffer.from(svg(true)), { density: 120, limitInputPixels: false }).png().toFile(`${here}/${NAME}-dieline.png`);
writeFileSync(`${here}/${NAME}.html`, `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:${W + 2 * BLEED}mm ${H + 2 * BLEED}mm;margin:0}html,body{margin:0}svg{display:block}</style></head><body>${svg(false)}</body></html>`);
execFileSync(CHROME, ['--headless=new', '--no-pdf-header-footer', `--print-to-pdf=${here}/${NAME}-print.pdf`, `file://${here}/${NAME}.html`], { stdio: 'ignore' });

// ---- mockup on the real photo ----
// The body is a straight cylinder; the photo sees it in perspective (camera near lid height, looking down),
// so the front looks wider at the top and the bottom rim curves much more than the top one.
// Model: real height z (0 = top rim, 1 = bottom rim) → image position, fitted to the rims measured on the photo.
const photo = process.argv[2];
if (photo && existsSync(photo)) {
	const P = await sharp(photo).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const pw = P.info.width, pd = P.data;
	const flat = await sharp(`${here}/${NAME}-print.png`, { limitInputPixels: false }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
	const fw = flat.info.width, fh = flat.info.height, fd = flat.data;
	const pxPerMm = fw / (W + 2 * BLEED);
	const sc = pw / 1500; // measurements below are on the 1500 × 2000 photo
	const y0 = 686 * sc, y1 = 1739 * sc; // front point of the top and bottom rims
	const xc0 = 726 * sc, xc1 = 740 * sc; // axis at the top and bottom rims
	const a0 = 384 * sc, a1 = 340 * sc; // half-widths at the top and bottom rims
	const e0 = 15 * sc, e1 = 183 * sc; // rim ellipse depths (how far the front dips below the sides)
	const k = a0 / a1 - 1; // depth grows linearly down a vertical line, so screen size shrinks as 1/(1 + k z)
	const persp = (v0, v1, z) => (v0 + (v1 * (1 + k) - v0) * z) / (1 + k * z);
	const tilt0 = e0 / a0, tilt1 = e1 / a1; // ellipse openness grows linearly with depth below the camera
	const geo = (z) => {
		const a = a0 / (1 + k * z);
		return { yf: persp(y0, y1, z), xc: persp(xc0, xc1, z), a, e: a * (tilt0 + (tilt1 - tilt0) * z) };
	};
	const zt = TOP_GAP / BAND, zb = (TOP_GAP + H) / BAND; // the wrap band
	const tapX = 790 * sc, tapG = geo(0.8), thetaTap = Math.asin((tapX - tapG.xc) / tapG.a);
	// the real tap (the heart handle higher up is only its reflection in the steel)
	// the real tap traced from the photo as one solid silhouette (handle, valve housing, round collar, spout),
	// so its glossy highlights stay tap instead of turning into sticker. The heart-shaped hole in the handle
	// is the only place the body (and so the sticker) shows through.
	const tapPoly = [[712, 1346], [715, 1337], [723, 1331], [740, 1329], [830, 1332], [839, 1336], [843, 1346], [838, 1400], [832, 1460], [830, 1490], [837, 1502], [843, 1538], [856, 1553], [859, 1600], [859, 1770], [729, 1770], [729, 1602], [711, 1596], [699, 1576], [697, 1546], [707, 1524], [727, 1510], [733, 1492], [721, 1470], [712, 1440]].map(([x, y]) => [x * sc, y * sc]);
	const inPoly = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
	const heart = { x0: 742 * sc, x1: 829 * sc, y0: 1376 * sc, y1: 1478 * sc };
	const lum = (x, y) => { const i = (Math.floor(y) * pw + Math.floor(x)) * 3; return (pd[i] + pd[i + 1] + pd[i + 2]) / 3; };
	const onTap = (x, y) => inPoly(tapPoly, x, y) && !(x > heart.x0 && x < heart.x1 && y > heart.y0 && y < heart.y1 && lum(x, y) > 105);
	// where a photo point lands on the wrap: solve for z (screen y rises monotonically with z for a given x)
	const unwrap = (x, y) => {
		let lo = zt, hi = zb;
		const yAt = (z) => { const g = geo(z); const s = (x - g.xc) / g.a; return Math.abs(s) > 1 ? null : g.yf - g.e * (1 - Math.sqrt(1 - s * s)); };
		// near the silhouette only part of the band reaches this x (the body looks wider at the top): trim the range to it
		const inside = (z) => yAt(z) !== null;
		if (!inside(lo) && !inside(hi)) return null;
		if (!inside(hi) || !inside(lo)) {
			let a = lo, b = hi; const keepLo = inside(lo);
			for (let it = 0; it < 30; it++) { const m = (a + b) / 2; if (inside(m) === keepLo) a = m; else b = m; }
			if (keepLo) hi = a; else lo = b;
		}
		const yl = yAt(lo), yh = yAt(hi);
		if (yl === null || yh === null || y < yl || y > yh) return null;
		for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; const ym = yAt(m); if (ym === null || ym < y) lo = m; else hi = m; }
		const z = (lo + hi) / 2, g = geo(z), th = Math.asin((x - g.xc) / g.a);
		return { th, wy: ((z - zt) / (zb - zt)) * H };
	};
	const out = Buffer.from(pd);
	const SS = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
	const yMin = Math.floor(geo(zt).yf - geo(zt).e - 2), yMax = Math.ceil(geo(zb).yf + 2);
	for (let y = yMin; y < yMax; y++)
		for (let x = Math.floor(xc0 - a0 - 2); x < xc0 + a0 + 2; x++) {
			const i = (y * pw + x) * 3;
			const L = (pd[i] + pd[i + 1] + pd[i + 2]) / 3;
			let r = 0, gg = 0, b = 0, n = 0;
			for (const [dx, dy] of SS) {
				if (onTap(x + dx, y + dy)) continue; // the tap sits in front of the sticker
				const u = unwrap(x + dx, y + dy);
				if (!u) continue;
				let wx = C / 4 + ((u.th - thetaTap) / (2 * Math.PI)) * C;
				wx = ((wx % C) + C) % C;
				const fx = Math.min(fw - 1, Math.round((wx + BLEED) * pxPerMm)), fy = Math.min(fh - 1, Math.max(0, Math.round((u.wy + BLEED) * pxPerMm)));
				const j = (fy * fw + fx) * 3;
				const cosT = Math.cos(u.th);
				const shade = 0.34 + 0.66 * Math.pow(cosT, 0.75); // matte vinyl: falls off toward the silhouette
				r += fd[j] * shade; gg += fd[j + 1] * shade; b += fd[j + 2] * shade; n++;
			}
			if (!n) continue;
			const cov = n / 4, spec = Math.max(0, L - 215) / 40; // a hint of the photo's brightest reflections
			const mix = (c, w) => Math.min(255, (w / n) * 1.02 + 90 * spec * 0.25);
			out[i] = pd[i] * (1 - cov) + mix(0, r) * cov;
			out[i + 1] = pd[i + 1] * (1 - cov) + mix(1, gg) * cov;
			out[i + 2] = pd[i + 2] * (1 - cov) + mix(2, b) * cov;
		}
	await sharp(out, { raw: P.info }).jpeg({ quality: 92 }).toFile(`${here}/${NAME}-mockup.jpg`);
}
console.log('ok', VARIANT, `${W.toFixed(1)} × ${H} mm (+${BLEED} mm bleed)`);
