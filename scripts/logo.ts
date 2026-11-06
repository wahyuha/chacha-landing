// Chacha logo, rebuilt as vector paths to match the brand signage (Montserrat caps + the leaf-A).
// A redraw from photos until the official vector exists; proportions measured from the café sign.
//
//   node scripts/logo.ts        → print/logo/ (SVG + PNG lockups and a side-by-side check)
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import opentype from 'opentype.js';

type Pt = [number, number];
const font = (w: number) =>
	opentype.parse(readFileSync(`node_modules/@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff`).buffer as ArrayBuffer);

const f2 = (n: number) => (Math.round(n * 100) / 100).toString();
/** opentype's toPathData(decimals) can emit NaN, so serialise the commands directly. */
type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };
export const cmdsToD = (cmds: Cmd[]) =>
	cmds
		.map((c) =>
			c.type === 'Z'
				? 'Z'
				: c.type === 'Q'
					? `Q${f2(c.x1!)} ${f2(c.y1!)} ${f2(c.x!)} ${f2(c.y!)}`
					: c.type === 'C'
						? `C${f2(c.x1!)} ${f2(c.y1!)} ${f2(c.x2!)} ${f2(c.y2!)} ${f2(c.x!)} ${f2(c.y!)}`
						: `${c.type}${f2(c.x!)} ${f2(c.y!)}`
		)
		.join('');
const poly = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${f2(x)} ${f2(y)}`).join('L') + 'Z';
const area = (pts: Pt[]) => pts.reduce((a, p, i) => a + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0) / 2;
/** Force winding so holes cut out under the default nonzero fill rule. */
const wind = (pts: Pt[], clockwise: boolean) => ((area(pts) > 0) === clockwise ? pts : [...pts].reverse());
const quad = (a: Pt, c: Pt, b: Pt, n = 24): Pt[] =>
	Array.from({ length: n + 1 }, (_, i) => {
		const t = i / n;
		const u = 1 - t;
		return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
	});

/**
 * The leaf-A. A thin arch cuts right across the letter, bowing upward just above half height.
 * Above it the letter is an open Λ (no crossbar); below it two tea leaves fill the base,
 * parted by a narrow V that rises from the baseline to the arch. `x` is the left edge, `w` the width.
 */
function leafA(x: number, cap: number, w: number, stem: number) {
	const base = cap;
	const apexHalf = stem * 0.28;
	const slope = (w / 2 - apexHalf) / cap; // horizontal run per unit of height on the outer edges
	const leftOuter = (y: number) => x + slope * (base - y);
	const rightOuter = (y: number) => x + w - slope * (base - y);
	const leftInner = (y: number) => leftOuter(y) + stem;
	const rightInner = (y: number) => rightOuter(y) - stem;
	const innerApexY = (stem / 2 + apexHalf) / slope; // where the two inner edges meet

	// arch: a gentle parabola, highest a little right of centre
	const xp = x + w * 0.53;
	const archTop = (px: number) => base - cap * (0.3 + 0.12 * (1 - ((px - xp) / (w / 2)) ** 2));
	const gap = cap * 0.05;
	const archBot = (px: number) => archTop(px) + gap;
	/** x where a curve meets an edge (bisection on the sign change). */
	const meet = (curve: (px: number) => number, edge: (y: number) => number, lo: number, hi: number) => {
		const g = (px: number) => px - edge(curve(px));
		for (let i = 0; i < 60; i++) {
			const mid = (lo + hi) / 2;
			if (Math.sign(g(mid)) === Math.sign(g(lo))) lo = mid;
			else hi = mid;
		}
		return (lo + hi) / 2;
	};
	const sample = (curve: (px: number) => number, a: number, b: number, n = 40): Pt[] =>
		Array.from({ length: n + 1 }, (_, i) => {
			const px = a + ((b - a) * i) / n;
			return [px, curve(px)];
		});

	// upper Λ: outer edges down to the arch, closed along the arch
	const tl = meet(archTop, leftOuter, x - w * 0.1, x + w * 0.5);
	const tr = meet(archTop, rightOuter, x + w * 0.5, x + w * 1.1);
	const upper: Pt[] = [[x + w / 2 - apexHalf, 0], [x + w / 2 + apexHalf, 0], ...sample(archTop, tr, tl).slice(0)];
	// open counter of the Λ, from the inner apex down to the arch
	const cl = meet(archTop, leftInner, x, x + w / 2);
	const cr = meet(archTop, rightInner, x + w / 2, x + w);
	const counter: Pt[] = [[x + w / 2, innerApexY], ...sample(archTop, cr, cl)];

	// two leaves below the arch: each runs from its outer tip on the baseline to a shared point under the
	// arch; the underside bows down to sit on the baseline, which opens a V between them
	const bl = meet(archBot, leftOuter, x - w * 0.1, x + w * 0.5);
	const br = meet(archBot, rightOuter, x + w * 0.5, x + w * 1.1);
	const vx = x + w * 0.52;
	const tip: Pt = [vx, archBot(vx) + cap * 0.012];
	const leftLeaf: Pt[] = [
		[x, base],
		...sample(archBot, bl, vx - w * 0.005),
		tip,
		...quad(tip, [x + w * 0.4, base + cap * 0.035], [x + w * 0.06, base]).slice(1)
	];
	const rightLeaf: Pt[] = [
		tip,
		...sample(archBot, vx + w * 0.005, br),
		[x + w, base],
		...quad([x + w * 0.94, base], [x + w * 0.64, base + cap * 0.035], tip).slice(1, -1)
	];

	return [poly(wind(upper, true)), poly(wind(counter, false)), poly(wind(leftLeaf, true)), poly(wind(rightLeaf, true))].join(' ');
}

export type Logo = { word: string; sub: string; width: number; height: number; cap: number };

/** Wordmark + "FRESH DRINK & MILK TEA" lockup, cap height `cap`, origin at the top-left of the caps. */
export function buildLogo(cap = 100, withSub = true): Logo {
	const bold = font(700);
	const medium = font(600);
	const capUnits = bold.tables.os2.sCapHeight || 700;
	const size = (cap / capUnits) * bold.unitsPerEm; // font size giving the wanted cap height
	const tracking = cap * 0.07;

	// C H A C H + leaf-A
	let d = '';
	let x = 0;
	for (const ch of 'CHACH') {
		const g = bold.charToGlyph(ch);
		d += cmdsToD(g.getPath(x, cap, size).commands as Cmd[]) + ' ';
		x += (g.advanceWidth! / bold.unitsPerEm) * size + tracking;
	}
	const aGlyph = bold.charToGlyph('A');
	const aBox = aGlyph.getBoundingBox();
	const sc = size / bold.unitsPerEm;
	const aLeft = x + aBox.x1 * sc;
	const aW = (aBox.x2 - aBox.x1) * sc;
	const stem = cap * 0.205;
	d += leafA(aLeft, cap, aW, stem);
	const width = aLeft + aW;

	let sub = '';
	let height = cap;
	if (withSub) {
		const subCap = cap * 0.24;
		const subSize = (subCap / (medium.tables.os2.sCapHeight || 700)) * medium.unitsPerEm;
		const text = 'FRESH DRINK & MILK TEA';
		const glyphs = [...text].map((c) => medium.charToGlyph(c));
		const adv = glyphs.map((g) => (g.advanceWidth! / medium.unitsPerEm) * subSize);
		const natural = adv.reduce((a, b) => a + b, 0);
		const target = width * 0.97; // the longer tagline runs almost the full wordmark width
		const track = (target - natural) / (glyphs.length - 1);
		let sx = (width - target) / 2;
		const sy = cap + cap * 0.55 + subCap;
		for (let i = 0; i < glyphs.length; i++) {
			sub += cmdsToD(glyphs[i].getPath(sx, sy, subSize).commands as Cmd[]) + ' ';
			sx += adv[i] + track;
		}
		height = sy;
	}
	return { word: d.trim(), sub: sub.trim(), width, height, cap };
}

// ── CLI: write lockups + a comparison against the sign photo ──────────────────
/** The leaf-A on its own (app icon, favicon), cap height `cap`, left edge at 0. */
export function buildIcon(cap = 100) {
	const bold = font(700);
	const size = (cap / (bold.tables.os2.sCapHeight || 700)) * bold.unitsPerEm;
	const box = bold.charToGlyph('A').getBoundingBox();
	const w = ((box.x2 - box.x1) * size) / bold.unitsPerEm;
	return { d: leafA(0, cap, w, cap * 0.205), width: w, cap };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const OUT = 'print/logo';
	mkdirSync(OUT, { recursive: true });
	const L = buildLogo(100);
	const pad = 40;
	const svg = (fg: string, bg: string | null, sub = true) =>
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${f2(L.width + 2 * pad)} ${f2(L.height + 2 * pad)}" width="${f2((L.width + 2 * pad) * 4)}" height="${f2((L.height + 2 * pad) * 4)}">${bg ? `<rect x="${-pad}" y="${-pad}" width="100%" height="100%" fill="${bg}"/>` : ''}<path d="${L.word}" fill="${fg}"/>${sub ? `<path d="${L.sub}" fill="${fg}"/>` : ''}</svg>`;
	const files: [string, string][] = [
		['chacha-logo_forest.svg', svg('#1D5A45', null)],
		['chacha-logo_gold-on-forest.svg', svg('#D9B869', '#143F31')],
		['chacha-logo_cream-on-forest.svg', svg('#F5EEE3', '#143F31')],
		['chacha-logo_wordmark-only.svg', svg('#1D5A45', null, false)]
	];
	for (const [name, s] of files) {
		writeFileSync(`${OUT}/${name}`, s);
		execFileSync('rsvg-convert', ['-o', `${OUT}/${name.replace('.svg', '.png')}`, `${OUT}/${name}`]);
	}
	// website: the paths as a data module (no font tooling at runtime) + a leaf-A favicon
	const icon = buildIcon(100);
	writeFileSync(
		'src/lib/brand/logo-paths.ts',
		`// Generated by scripts/logo.ts — do not edit by hand.\n` +
			`export const LOGO = ${JSON.stringify({ word: L.word, sub: L.sub, width: +f2(L.width), height: +f2(L.height), cap: L.cap })};\n` +
			`export const LEAF_A = ${JSON.stringify({ d: icon.d, width: +f2(icon.width), cap: icon.cap })};\n`
	);
	const iw = icon.width;
	const box = 160;
	const k = 96 / icon.cap; // leaf-A 96 units tall inside a 160 square
	writeFileSync(
		'static/favicon.svg',
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}"><rect width="${box}" height="${box}" rx="36" fill="#143F31"/>` +
			`<path transform="translate(${f2((box - iw * k) / 2)} ${f2((box - 96) / 2 + 2)}) scale(${f2(k)})" d="${icon.d}" fill="#D9B869"/></svg>`
	);
	console.log(`width/cap ${f2(L.width / L.cap)}  height ${f2(L.height)}`);
}
