// Print files + mockup for the Chacha cup, built from the same artwork as the website's 3D cup.
//
//   node scripts/cup-print.ts [forest|cream]   → print/
//
// The artwork is replayed into an SVG recorder (text becomes outlines), then bent onto the flat "fan"
// die-line a paper cup is cut from. CUP dimensions are a standard 16 oz single-wall cup; replace them
// with the numbers on your cup supplier's die-line before sending to print.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
const { parse } = opentype;
type Font = ReturnType<typeof parse>;
import { paint, palettes, mask, W, H, BRAND_ART, type Ctx, type Variant, type Palette } from '../src/lib/cup/artwork.ts';
import { cmdsToD } from './logo.ts';
import { specSvg } from './cup-spec.ts';

const VARIANT = (process.argv[2] ?? 'forest') as Variant;
if (!(VARIANT in palettes)) throw new Error(`unknown variant ${VARIANT}; use ${Object.keys(palettes).join(', ')}`);
const OUT = 'print';
const NAME = `chacha-cup-16oz-${VARIANT}`;

// ── cup geometry (mm) ─────────────────────────────────────────────────────────
const CUP = {
	topDiameter: 90,
	bottomDiameter: 60,
	height: 136,
	rimMargin: 4, // top band hidden by the rolled rim / lid
	baseMargin: 8, // gap between the artwork edge and the cup foot (visible; the ring fills it)
	bottomSafe: 2, // keep text at least this far above the cup foot
	fold: 8, // extra paper below the foot, folded in under the base disc
	overlap: 7, // glue overlap at the seam
	bleed: 3
};
const GOLD_CMYK = 'C15 M28 Y70 K0';
// print-only artwork tweaks (the website cup keeps the defaults)
// the finished design is shared with the website cup; print adds the ring depth from the die-line
const ART = { ...BRAND_ART, ringDepth: 0 };

// ── tiny 2D geometry ──────────────────────────────────────────────────────────
type Pt = [number, number];
type M = [number, number, number, number, number, number]; // canvas matrix a b c d e f
const I: M = [1, 0, 0, 1, 0, 0];
const mul = (m: M, n: M): M => [
	m[0] * n[0] + m[2] * n[1],
	m[1] * n[0] + m[3] * n[1],
	m[0] * n[2] + m[2] * n[3],
	m[1] * n[2] + m[3] * n[3],
	m[0] * n[4] + m[2] * n[5] + m[4],
	m[1] * n[4] + m[3] * n[5] + m[5]
];
const ap = (m: M, [x, y]: Pt): Pt => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

type Seg = { t: 'M' | 'L' | 'Q' | 'C' | 'Z'; p: Pt[] };

/** Parse the subset of SVG path syntax the artwork uses (M L H V C Q Z, absolute and relative). */
function parsePath(d: string): Seg[] {
	const tok = d.match(/[MmLlHhVvCcQqZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
	const segs: Seg[] = [];
	let i = 0;
	let cmd = '';
	let cur: Pt = [0, 0];
	let start: Pt = [0, 0];
	const num = () => parseFloat(tok[i++]);
	while (i < tok.length) {
		if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
		const rel = cmd === cmd.toLowerCase();
		const o = (x: number, y: number): Pt => (rel ? [cur[0] + x, cur[1] + y] : [x, y]);
		switch (cmd.toUpperCase()) {
			case 'M': {
				cur = start = o(num(), num());
				segs.push({ t: 'M', p: [cur] });
				cmd = rel ? 'l' : 'L';
				break;
			}
			case 'L':
				cur = o(num(), num());
				segs.push({ t: 'L', p: [cur] });
				break;
			case 'H':
				cur = [rel ? cur[0] + num() : num(), cur[1]];
				segs.push({ t: 'L', p: [cur] });
				break;
			case 'V':
				cur = [cur[0], rel ? cur[1] + num() : num()];
				segs.push({ t: 'L', p: [cur] });
				break;
			case 'C': {
				const a = o(num(), num());
				const b = o(num(), num());
				const c = o(num(), num());
				segs.push({ t: 'C', p: [a, b, c] });
				cur = c;
				break;
			}
			case 'Q': {
				const a = o(num(), num());
				const c = o(num(), num());
				segs.push({ t: 'Q', p: [a, c] });
				cur = c;
				break;
			}
			case 'Z':
				segs.push({ t: 'Z', p: [] });
				cur = start;
				break;
			default:
				throw new Error(`unsupported path command ${cmd}`);
		}
	}
	return segs;
}

/** Transform then flatten to polylines (short straight pieces, so they survive the fan warp). */
function flatten(segs: Seg[], m: M, step = 2.5): { pts: Pt[]; closed: boolean }[] {
	const out: { pts: Pt[]; closed: boolean }[] = [];
	let sub: Pt[] = [];
	const push = (p: Pt) => sub.push(p);
	const line = (a: Pt, b: Pt) => {
		const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
		for (let k = 1; k <= n; k++) push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
	};
	for (const s of segs) {
		const last = sub[sub.length - 1];
		const p = s.p.map((q) => ap(m, q));
		if (s.t === 'M') {
			if (sub.length > 1) out.push({ pts: sub, closed: false });
			sub = [p[0]];
		} else if (s.t === 'L') line(last, p[0]);
		else if (s.t === 'Q' || s.t === 'C') {
			const ctrl = [last, ...p];
			const len = ctrl.slice(1).reduce((acc, q, k) => acc + Math.hypot(q[0] - ctrl[k][0], q[1] - ctrl[k][1]), 0);
			const n = Math.min(200, Math.max(4, Math.ceil(len / step)));
			for (let k = 1; k <= n; k++) {
				const t = k / n;
				const u = 1 - t;
				if (s.t === 'Q') {
					const [a, b, c] = ctrl;
					push([u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]);
				} else {
					const [a, b, c, d] = ctrl;
					push([
						u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
						u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]
					]);
				}
			}
		} else if (s.t === 'Z') {
			if (sub.length) {
				line(sub[sub.length - 1], sub[0]);
				out.push({ pts: sub, closed: true });
				sub = [sub[0]];
			}
		}
	}
	if (sub.length > 1) out.push({ pts: sub, closed: false });
	return out;
}

// ── canvas-like recorder ──────────────────────────────────────────────────────
type Item = { kind: 'fill' | 'stroke'; subs: { pts: Pt[]; closed: boolean }[]; color: string; alpha: number; width: number; cap: string };

const fonts: Record<number, Font> = {};
const font = (weight: number) => {
	const w = weight >= 650 ? 700 : 600;
	return (fonts[w] ??= parse(
		readFileSync(`node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff`).buffer as ArrayBuffer
	));
};

class Recorder {
	items: Item[] = [];
	fillStyle = '#000';
	strokeStyle = '#000';
	lineWidth = 1;
	lineCap = 'butt';
	lineJoin = 'miter';
	globalAlpha = 1;
	font = '16px sans-serif';
	textAlign = 'start';
	textBaseline = 'alphabetic';
	letterSpacing = '0px';
	private m: M = I;
	private stack: unknown[] = [];
	private path: Seg[] = [];

	save() {
		this.stack.push([this.m, this.fillStyle, this.strokeStyle, this.lineWidth, this.lineCap, this.globalAlpha, this.font, this.letterSpacing]);
	}
	restore() {
		const s = this.stack.pop() as [M, string, string, number, string, number, string, string];
		[this.m, this.fillStyle, this.strokeStyle, this.lineWidth, this.lineCap, this.globalAlpha, this.font, this.letterSpacing] = s;
	}
	translate(x: number, y: number) {
		this.m = mul(this.m, [1, 0, 0, 1, x, y]);
	}
	scale(x: number, y: number) {
		this.m = mul(this.m, [x, 0, 0, y, 0, 0]);
	}
	rotate(a: number) {
		this.m = mul(this.m, [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
	}
	// current path is stored already transformed, like canvas does
	beginPath() {
		this.path = [];
	}
	moveTo(x: number, y: number) {
		this.path.push({ t: 'M', p: [ap(this.m, [x, y])] });
	}
	lineTo(x: number, y: number) {
		this.path.push({ t: 'L', p: [ap(this.m, [x, y])] });
	}
	quadraticCurveTo(a: number, b: number, x: number, y: number) {
		this.path.push({ t: 'Q', p: [ap(this.m, [a, b]), ap(this.m, [x, y])] });
	}
	arc(x: number, y: number, r: number, a0: number, a1: number) {
		const n = 48;
		for (let k = 0; k <= n; k++) {
			const a = a0 + ((a1 - a0) * k) / n;
			this.path.push({ t: k === 0 && !this.path.length ? 'M' : 'L', p: [ap(this.m, [x + r * Math.cos(a), y + r * Math.sin(a)])] });
		}
	}
	closePath() {
		this.path.push({ t: 'Z', p: [] });
	}
	private scaleOf() {
		return Math.sqrt(Math.abs(this.m[0] * this.m[3] - this.m[1] * this.m[2]));
	}
	private add(kind: Item['kind'], subs: Item['subs']) {
		this.items.push({
			kind,
			subs,
			color: kind === 'fill' ? this.fillStyle : this.strokeStyle,
			alpha: this.globalAlpha,
			width: this.lineWidth * this.scaleOf(),
			cap: this.lineCap
		});
	}
	fill(path?: { d: string }) {
		this.add('fill', path ? flatten(parsePath(path.d), this.m) : flatten(this.path, I));
	}
	stroke(path?: { d: string }) {
		this.add('stroke', path ? flatten(parsePath(path.d), this.m) : flatten(this.path, I));
	}
	fillRect(x: number, y: number, w: number, h: number) {
		this.fill({ d: `M${x} ${y} H${x + w} V${y + h} H${x} Z` });
	}
	/** Canvas-accurate enough: letter-spacing after every glyph, centre alignment on the full advance. */
	private layout(text: string) {
		const [, weight, size] = this.font.match(/(\d+)\s+(\d+(?:\.\d+)?)px/)!.map(Number);
		const f = font(weight);
		const ls = parseFloat(this.letterSpacing) || 0;
		const scale = size / f.unitsPerEm;
		const glyphs = [...text].map((ch) => f.charToGlyph(ch)); // plain Latin text: no shaping needed
		const total = glyphs.reduce((a, g) => a + (g.advanceWidth ?? 0) * scale + ls, 0);
		return { glyphs, size, scale, ls, total };
	}
	measureText(text: string) {
		return { width: this.layout(text).total };
	}
	fillText(text: string, x: number, y: number) {
		const { glyphs, size, scale, ls, total } = this.layout(text);
		let gx = this.textAlign === 'center' ? x - total / 2 : x;
		let d = '';
		for (const g of glyphs) {
			d += cmdsToD(g.getPath(gx, y, size).commands as Parameters<typeof cmdsToD>[0]) + ' ';
			gx += (g.advanceWidth ?? 0) * scale + ls;
		}
		this.fill({ d });
	}
}

function record(p: Palette) {
	const rec = new Recorder();
	paint(rec as unknown as Ctx, ((d: string) => ({ d })) as unknown as (d: string) => Path2D, p, VARIANT, ART);
	return rec.items;
}

// ── SVG writers ───────────────────────────────────────────────────────────────
const f2 = (n: number) => (Math.round(n * 100) / 100).toString();
const hex = (c: string) => (c.length === 4 ? '#' + [...c.slice(1)].map((ch) => ch + ch).join('') : c).toLowerCase();
const mix = (a: string, b: string, t: number) => {
	const A = hex(a).match(/\w\w/g)!.map((h) => parseInt(h, 16));
	const B = hex(b).match(/\w\w/g)!.map((h) => parseInt(h, 16));
	return '#' + A.map((v, i) => Math.round(v * t + B[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
};

type Warp = { map: (p: Pt) => Pt; k: number };

function itemsToSvg(items: Item[], warp: Warp, opts: { bg: string; flattenAlpha: boolean; recolor?: (c: string) => string; minStroke?: number; shifts?: number[] }) {
	let s = '';
	for (const shift of opts.shifts ?? [0]) {
		for (const it of items) {
			const d = it.subs
				.map(({ pts, closed }) => 'M' + pts.map((p) => warp.map([p[0] + shift, p[1]]).map(f2).join(' ')).join('L') + (closed ? 'Z' : ''))
				.join('');
			let color = opts.recolor ? opts.recolor(it.color) : it.color;
			let alpha = it.alpha;
			if (opts.flattenAlpha && alpha < 1) {
				color = mix(color, opts.recolor ? opts.recolor(opts.bg) : opts.bg, alpha);
				alpha = 1;
			}
			const op = alpha < 1 ? ` opacity="${alpha}"` : '';
			if (it.kind === 'fill') s += `<path d="${d}" fill="${color}"${op}/>`;
			else {
				const w = Math.max(opts.minStroke ?? 0, it.width * warp.k);
				s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${f2(w)}" stroke-linecap="${it.cap}" stroke-linejoin="round"${op}/>`;
			}
		}
	}
	return s;
}

// ── fan die-line ──────────────────────────────────────────────────────────────
const R = CUP.topDiameter / 2;
const r = CUP.bottomDiameter / 2;
const slant = Math.hypot(CUP.height, R - r);
const Ro = (slant * R) / (R - r); // outer (rim) radius of the flat fan
const Ri = Ro - slant; // radius at the cup foot
const Rb = Ri - CUP.fold; // blank edge, including the base fold
const theta = (2 * Math.PI * R) / Ro; // fan angle for one full turn
const overlapA = CUP.overlap / Rb; // at least `overlap` mm everywhere along the seam
const bleedA = CUP.bleed / Rb;
const artH = slant - CUP.rimMargin - CUP.baseMargin;
const kmm = artH / H; // mm per artwork unit (vertical)
// the gold ring runs from its top edge (y = 1012) down to the cup foot
ART.ringDepth = H + CUP.baseMargin / kmm - 1012;
// the flat texture extends below the artwork edge so the mockup shows the ring down to the table
const FLAT_H = Math.ceil(H + (CUP.baseMargin + CUP.fold) / kmm);

const a0 = -theta / 2 - bleedA; // left bleed edge
const a1 = theta / 2 + overlapA + bleedA; // right bleed edge (after overlap)
const polar = (rad: number, a: number): Pt => [rad * Math.sin(a), -rad * Math.cos(a)];
const ext = [polar(Ro + CUP.bleed, a0), polar(Ro + CUP.bleed, a1), polar(Rb - CUP.bleed, a0), polar(Rb - CUP.bleed, a1), polar(Ro + CUP.bleed, 0)];
const MARGIN = 12;
const minX = Math.min(...ext.map((p) => p[0])) - MARGIN;
const maxX = Math.max(...ext.map((p) => p[0])) + MARGIN;
const minY = Math.min(...ext.map((p) => p[1])) - MARGIN;
const LEGEND = 16; // room under the fan for the proof legend
const maxY = Math.max(...ext.map((p) => p[1])) + MARGIN + LEGEND;
const PW = maxX - minX;
const PH = maxY - minY;
const toPage = ([x, y]: Pt): Pt => [x - minX, y - minY];

const fanWarp: Warp = {
	map: ([x, y]) => toPage(polar(Ro - CUP.rimMargin - y * kmm, (x / W) * theta - theta / 2)),
	k: kmm
};

const arcPath = (rad: number, from: number, to: number, move = true) => {
	const [x1, y1] = toPage(polar(rad, from));
	const [x2, y2] = toPage(polar(rad, to));
	const large = to - from > Math.PI ? 1 : 0;
	const sweep = to > from ? 1 : 0;
	return `${move ? `M${f2(x1)} ${f2(y1)}` : `L${f2(x1)} ${f2(y1)}`} A${f2(rad)} ${f2(rad)} 0 ${large} ${sweep} ${f2(x2)} ${f2(y2)}`;
};
const sector = (rin: number, rout: number, from: number, to: number) =>
	`${arcPath(rout, from, to)} ${arcPath(rin, to, from, false)} Z`;

const cutPath = sector(Rb, Ro, -theta / 2, theta / 2 + overlapA);
const bleedPath = sector(Rb - CUP.bleed, Ro + CUP.bleed, a0, a1);

function fanSvg(content: string, opts: { bg: string; guides: 'none' | 'cut' | 'proof' }) {
	const guides =
		opts.guides === 'none'
			? ''
			: `<g id="dieline" fill="none" stroke="#EC008C" stroke-width="0.25"><path d="${cutPath}"/></g>` +
				(opts.guides === 'proof'
					? `<g id="guides" fill="none" stroke-width="0.2">
<path d="${arcPath(Ro - CUP.rimMargin, -theta / 2, theta / 2)}" stroke="#00AEEF" stroke-dasharray="1.5 1"/>
<path d="${arcPath(Ri + CUP.bottomSafe, -theta / 2, theta / 2)}" stroke="#00AEEF" stroke-dasharray="1.5 1"/>
<path d="${arcPath(Ri, -theta / 2, theta / 2 + overlapA)}" stroke="#8a8a8a" stroke-dasharray="3 1.2"/>
<path d="M${toPage(polar(Rb, theta / 2)).map(f2).join(' ')} L${toPage(polar(Ro, theta / 2)).map(f2).join(' ')}" stroke="#EC008C" stroke-dasharray="1 1"/>
<path d="${bleedPath}" stroke="#999" stroke-dasharray="0.6 0.8"/>
</g>
<g id="labels" font-family="Helvetica, Arial, sans-serif" font-size="3.4" fill="#333">
<text x="${f2(PW / 2)}" y="${f2(PH - LEGEND + 2)}" font-size="3" text-anchor="middle">Magenta = cut line (glue overlap ${CUP.overlap} mm right of the dashed seam) · Grey dotted = bleed ${CUP.bleed} mm</text>
<text x="${f2(PW / 2)}" y="${f2(PH - LEGEND + 7)}" font-size="3" text-anchor="middle">Blue dashed = safe zone (rim ${CUP.rimMargin} mm, foot ${CUP.bottomSafe} mm) · Grey dashed = cup foot, ${CUP.fold} mm fold below · Gold ≈ ${GOLD_CMYK} or hot-foil (see foil plate)</text>
${label(Ro + CUP.bleed + 5, 0, `CHACHA · Cup 16 oz · Ø${CUP.topDiameter} / Ø${CUP.bottomDiameter} × ${CUP.height} mm`, 4.2, true)}
</g>`
					: '');
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${f2(PW)}mm" height="${f2(PH)}mm" viewBox="0 0 ${f2(PW)} ${f2(PH)}">
<rect width="100%" height="100%" fill="#fff"/>
<defs><clipPath id="bleed"><path d="${bleedPath}"/></clipPath></defs>
<g id="artwork" clip-path="url(#bleed)"><path d="${bleedPath}" fill="${opts.bg}"/>${content}</g>
${guides}
</svg>`;
}

function label(rad: number, a: number, text: string, size: number, center = false, extraRot = 0) {
	const [x, y] = toPage(polar(rad, a));
	const rot = (a * 180) / Math.PI + extraRot;
	return `<text x="${f2(x)}" y="${f2(y)}" font-size="${size}" transform="rotate(${f2(rot)} ${f2(x)} ${f2(y)})"${center ? ' text-anchor="middle"' : ''}>${text}</text>`;
}

// ── flat artwork (for reference + mockup texture) ─────────────────────────────
const flatSvg = (content: string, bg: string) =>
	`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${FLAT_H}" viewBox="0 0 ${W} ${FLAT_H}"><rect width="${W}" height="${FLAT_H}" fill="${bg}"/>${content}</svg>`;

// ── mockup renderer ───────────────────────────────────────────────────────────
async function mockup(artPng: string, maskPng: string, rot: number, file: string, transparent = false) {
	const S = 2; // supersample for smooth edges
	const k = 11 * S; // px per mm
	const OW = 1500 * S;
	const OH = 2100 * S;
	const cx = OW / 2;
	const e = 0.16; // camera elevation → ellipse squash
	const lidH = 22 * k;
	const y0 = 230 * S + lidH; // rim line
	const bodyH = CUP.height * k;
	const rT = R * k;
	const rB = r * k;

	const art = await sharp(artPng).raw().toBuffer({ resolveWithObject: true });
	const gm = await sharp(maskPng).greyscale().raw().toBuffer({ resolveWithObject: true });
	const AW = art.info.width;
	const AH = art.info.height;
	const AC = art.info.channels;
	const bgc = hex(palettes[VARIANT].bg).match(/\w\w/g)!.map((h) => parseInt(h, 16));
	const sample = (u: number, v: number) => {
		if (v < 0) return [...bgc, 0] as number[];
		const x = ((u % 1) + 1) % 1 * (AW - 1);
		const y = Math.min(1, (v * H) / FLAT_H) * (AH - 1); // v is in artwork units of H; the texture runs on to FLAT_H
		const x0 = Math.floor(x);
		const y0_ = Math.floor(y);
		const x1 = (x0 + 1) % AW;
		const y1 = Math.min(AH - 1, y0_ + 1);
		const fx = x - x0;
		const fy = y - y0_;
		const px = (xx: number, yy: number, c: number) => art.data[(yy * AW + xx) * AC + c];
		const out = [0, 1, 2].map((c) => (px(x0, y0_, c) * (1 - fx) + px(x1, y0_, c) * fx) * (1 - fy) + (px(x0, y1, c) * (1 - fx) + px(x1, y1, c) * fx) * fy);
		const gx = Math.round((x / (AW - 1)) * (gm.info.width - 1));
		const gy = Math.round((y / (AH - 1)) * (gm.info.height - 1));
		out.push(gm.data[gy * gm.info.width + gx] / 255);
		return out;
	};

	const L = (() => {
		const v = [-0.55, -0.3, 0.78];
		const n = Math.hypot(...v);
		return v.map((c) => c / n);
	})();
	const Hv = (() => {
		const v = [L[0], L[1], L[2] + 1];
		const n = Math.hypot(...v);
		return v.map((c) => c / n);
	})();

	const buf = Buffer.alloc(OW * OH * 4);
	const top = Math.floor(y0 - e * rT - 2);
	const bottom = Math.ceil(y0 + bodyH + e * rB + 2);
	for (let Y = top; Y < bottom; Y++) {
		for (let X = Math.floor(cx - rT - 2); X < Math.ceil(cx + rT + 2); X++) {
			const dx = X - cx;
			let t = (Y - y0) / bodyH;
			let rad = 0;
			let c = 0;
			let ok = true;
			for (let it = 0; it < 6; it++) {
				const tc = Math.min(1, Math.max(0, t));
				rad = rT + (rB - rT) * tc;
				if (Math.abs(dx) > rad) {
					ok = false;
					break;
				}
				c = Math.sqrt(1 - (dx / rad) ** 2);
				t = (Y - y0 - e * rad * c) / bodyH;
			}
			if (!ok || t < 0 || t > 1) continue;
			const phi = Math.asin(dx / rad);
			const mmFromRim = t * CUP.height;
			const v = (mmFromRim - CUP.rimMargin) / artH;
			const [cr, cg, cb, gold] = sample(0.5 + (phi + rot) / (2 * Math.PI), v);
			const n = [Math.sin(phi), 0.12, Math.cos(phi)];
			const diff = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
			const nh = Math.max(0, n[0] * Hv[0] + n[1] * Hv[1] + n[2] * Hv[2]);
			const edge = 0.72 + 0.28 * Math.cos(phi);
			let shade = (0.34 + 0.78 * diff) * edge;
			let spec = Math.pow(nh, 38) * 0.14;
			let tint = [255, 255, 255];
			if (gold > 0.5) {
				shade = (0.3 + 0.62 * diff) * edge;
				spec = Math.pow(nh, 10) * 0.55 + Math.pow(nh, 60) * 0.35;
				tint = [255, 236, 190];
			}
			const i = (Y * OW + X) * 4;
			buf[i] = Math.min(255, cr * shade + tint[0] * spec);
			buf[i + 1] = Math.min(255, cg * shade + tint[1] * spec);
			buf[i + 2] = Math.min(255, cb * shade + tint[2] * spec);
			buf[i + 3] = 255;
		}
	}

	// lid, background and shadow as vector layers
	const lidR = (R + 3) * k;
	const yA = y0 + 4 * k; // skirt bottom (hugs the rim)
	const yB = y0 - 5 * k; // skirt top
	const domeR = (R - 2) * k;
	const topR = (R - 6) * k;
	const yT = yB - 12 * k;
	const frustum = (a: number, ya: number, b: number, yb: number) =>
		`M${cx - b} ${yb} A${b} ${e * b} 0 0 1 ${cx + b} ${yb} L${cx + a} ${ya} A${a} ${e * a} 0 0 1 ${cx - a} ${ya} Z`;
	const sideGrad = (id: string, dark: string, mid: string, hi: string) =>
		`<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${dark}"/><stop offset=".32" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
	const lid = `<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}">
<defs>${sideGrad('skirt', '#0b0b0b', '#1c1c1c', '#3a3a3a')}${sideGrad('dome', '#0d0d0d', '#1d1d1d', '#383838')}
<radialGradient id="face" cx=".38" cy=".35" r=".8"><stop offset="0" stop-color="#2e2e2e"/><stop offset="1" stop-color="#121212"/></radialGradient></defs>
<path d="${frustum(lidR, yA, lidR, yB)}" fill="url(#skirt)"/>
<path d="M${cx - lidR} ${yA} A${lidR} ${e * lidR} 0 0 0 ${cx + lidR} ${yA}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="${1.2 * k * 0.4}"/>
<ellipse cx="${cx}" cy="${yB}" rx="${lidR}" ry="${e * lidR}" fill="#181818"/>
<path d="${frustum(domeR, yB, topR, yT)}" fill="url(#dome)"/>
<ellipse cx="${cx}" cy="${yT}" rx="${topR}" ry="${e * topR}" fill="url(#face)"/>
<ellipse cx="${cx}" cy="${yT + e * topR * 0.62}" rx="${7 * k}" ry="${e * 3.2 * k}" fill="#050505"/>
<ellipse cx="${cx - topR * 0.35}" cy="${yT - e * topR * 0.3}" rx="${topR * 0.45}" ry="${e * topR * 0.25}" fill="#fff" opacity=".06"/>
</svg>`;
	const shadowY = y0 + bodyH + e * rB * 0.4;
	const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}">
<defs><radialGradient id="bgg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#EEF0EC"/></radialGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${18 * S}"/></filter></defs>
${transparent ? '' : `<rect width="100%" height="100%" fill="url(#bgg)"/>`}
<ellipse cx="${cx + 20 * S}" cy="${shadowY}" rx="${rB * 1.5}" ry="${e * rB * 1.1}" fill="#0b2a20" opacity=".35" filter="url(#blur)"/>
</svg>`;

	const body = await sharp(buf, { raw: { width: OW, height: OH, channels: 4 } }).png().toBuffer();
	// composite at full size first; sharp would otherwise resize the base before compositing
	const full = await sharp(Buffer.from(bg))
		.composite([{ input: body }, { input: Buffer.from(lid) }])
		.png()
		.toBuffer();
	await sharp(full).resize(OW / S, OH / S).png().toFile(file);
}

// ── build ─────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
const pal = palettes[VARIANT];
const items = record(pal);
const maskItems = record({ ...mask(pal) });

const rsvg = (inp: string, out: string, args: string[] = []) => execFileSync('rsvg-convert', [...args, '-o', out, inp]);
const write = (file: string, s: string) => writeFileSync(join(OUT, file), s);

// flat reference + mockup textures
write(`${NAME}_flat.svg`, flatSvg(itemsToSvg(items, { map: (p) => p, k: 1 }, { bg: pal.bg, flattenAlpha: false }), pal.bg));
write(`.mask-flat.svg`, flatSvg(itemsToSvg(maskItems, { map: (p) => p, k: 1 }, { bg: '#000', flattenAlpha: false }), '#000'));
rsvg(join(OUT, `${NAME}_flat.svg`), join(OUT, `${NAME}_flat.png`), ['-w', '4096']);
rsvg(join(OUT, `.mask-flat.svg`), join(OUT, `.mask-flat.png`), ['-w', '4096']);

// print: repeat the art one turn left and right so bleed and the glue overlap continue the pattern
const shifts = [-W, 0, W];
const printArt = itemsToSvg(items, fanWarp, { bg: pal.bg, flattenAlpha: true, minStroke: 0.2, shifts });
write(`${NAME}_print.svg`, fanSvg(printArt, { bg: pal.bg, guides: 'cut' }));
write(`${NAME}_proof.svg`, fanSvg(printArt, { bg: pal.bg, guides: 'proof' }));
rsvg(join(OUT, `${NAME}_print.svg`), join(OUT, `${NAME}_print-300dpi.png`), ['-d', '300', '-p', '300']);
rsvg(join(OUT, `${NAME}_proof.svg`), join(OUT, `${NAME}_proof.png`), ['-d', '200', '-p', '200']);

// foil plate: black where the gold shows (same paint order, so hidden lines stay hidden)
const foil = itemsToSvg(maskItems, fanWarp, {
	bg: '#000',
	flattenAlpha: false,
	minStroke: 0.2,
	shifts,
	recolor: (c) => (hex(c) === '#ffffff' ? '#000000' : '#ffffff')
}).replace(/ opacity="[\d.]+"/g, '');
write(`${NAME}_foil-plate.svg`, fanSvg(foil, { bg: '#ffffff', guides: 'cut' }));
rsvg(join(OUT, `${NAME}_foil-plate.svg`), join(OUT, `${NAME}_foil-plate.pdf`), ['-f', 'pdf']);

// mockups
await mockup(join(OUT, `${NAME}_flat.png`), join(OUT, `.mask-flat.png`), 0, join(OUT, `${NAME}_mockup-front.png`));
await mockup(join(OUT, `${NAME}_flat.png`), join(OUT, `.mask-flat.png`), 1.15, join(OUT, `${NAME}_mockup-side.png`));
// cut-out version for the website (cup + soft shadow on transparent)
await mockup(join(OUT, `${NAME}_flat.png`), join(OUT, `.mask-flat.png`), 0, join(OUT, `${NAME}_mockup-front-transparent.png`), true);

console.log(
	JSON.stringify(
		{
			fan: { outerRadius: f2(Ro), footRadius: f2(Ri), blankInnerRadius: f2(Rb), angleDeg: f2((theta * 180) / Math.PI), slantHeight: f2(slant) },
			page_mm: [f2(PW), f2(PH)],
			artScale_mm_per_unit: f2(kmm)
		},
		null,
		1
	)
);

// intermediate textures only feed the mockup renderer
// print PDF: page 1 artwork, page 2 colour codes + fonts (Indonesian)
const logoCapMm = ART.logoCap * kmm;
write('.spec.svg', specSvg({
	pageW: PW,
	pageH: PH,
	mockupPng: join(OUT, `${NAME}_mockup-front.png`),
	cup: CUP,
	logoCapMm,
	logoWidthMm: (ART.logo.width / ART.logo.cap) * logoCapMm,
	ringTextMm: 20 * kmm,
	variant: VARIANT
}));
execFileSync('rsvg-convert', ['-f', 'pdf', '-o', join(OUT, `${NAME}_print.pdf`), join(OUT, `${NAME}_print.svg`), join(OUT, '.spec.svg')]);

for (const f of ['.mask-flat.svg', '.mask-flat.png', '.spec.svg']) rmSync(join(OUT, f), { force: true });
