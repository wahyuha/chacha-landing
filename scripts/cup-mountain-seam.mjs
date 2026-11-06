// Seam fix for the 16 oz DW mountain cup wrap (W 234.37 × H 130.02 mm).
//
//   node scripts/cup-mountain-seam.mjs   → print/mountain/
//
// The supplied flat (assets-src/cup-mountain/flat-original.webp) ends the mountain painting in hard vertical cuts
// at both glue edges, and the two ends are different scenes, so the wrapped cup shows a visible break at the back.
// This keeps the fan geometry and artwork where they are and bridges the seam with mountains:
//   1. each end of the painting is mirrored past its hard cut, so the cut line itself disappears;
//   2. the two mirrored extensions overlap across the seam like two watercolour ranges, one in front of the other;
//   3. the art repeats with a period of (circumference − glue overlap), so it lines up whichever edge is glued on top.
// Sides and top also get a 3 mm bleed (which simply continues the repeating art).
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/cup-mountain/flat-original.webp';
const OUT = 'print/mountain';
const NAME = 'chacha-cup-16oz-dw-mountain';

const PAGE = { w: 234.37, h: 130.02 }; // printer's artboard (mm)
const DPI = Number(process.argv[2] ?? 300); // e.g. `node scripts/cup-mountain-seam.mjs 600`
const UPSCALE = 4; // the source is resampled once with Lanczos + light sharpening, then sampled from that
const BLEED = 3; // mm, sides + top
const OVERLAP = 7; // mm glue overlap: the last 7 mm of the right edge repeat the first 7 mm of the left edge
const BRIDGE = 22; // mm either side of the seam that is rebuilt
const GREEN = [29, 76, 67]; // background green, measured from the artwork (#1D4C43)

// ── fan geometry of the source, measured in source pixels ─────────────────────
// side edges meet at C; top arc of the green and its bottom arc are slightly non-concentric in the supplied file,
// so each is its own circle (edge slope 0.2574 px/px).
const C = [1000, 3969];
const ALPHA = Math.atan(0.2574); // half angle of the fan
const TOP = { c: [1000, 3865], r: 3805 };
const BOT = { c: [1000, 4072], r: 3145 };

const meta = await sharp(SRC).metadata();
const SW = meta.width; // geometry below stays in original source pixels
const SH = meta.height;
const src = await sharp(SRC)
	.removeAlpha()
	.resize(SW * UPSCALE, SH * UPSCALE, { kernel: 'lanczos3' })
	.sharpen({ sigma: 1.2, m1: 0.6, m2: 1.4 })
	.raw()
	.toBuffer({ resolveWithObject: true });
const UW = src.info.width;
const UH = src.info.height;
const SPX = SW / PAGE.w; // source px per mm (the webp is the full artboard)

/** Distance from C along the ray at angle θ (0 = straight up) to circle k. */
function rayHit(theta, k) {
	const dx = Math.sin(theta);
	const dy = -Math.cos(theta);
	const ox = C[0] - k.c[0];
	const oy = C[1] - k.c[1];
	const b = ox * dx + oy * dy;
	return -b + Math.sqrt(b * b - (ox * ox + oy * oy - k.r * k.r));
}

/** Source point for fan coordinates u (-1 left edge … 1 right edge) and v (0 top … 1 bottom of the green). */
function fanPoint(u, v) {
	const t = u * ALPHA;
	const rt = rayHit(t, TOP);
	const rb = rayHit(t, BOT);
	const rho = rt + (rb - rt) * v;
	return [C[0] + Math.sin(t) * rho, C[1] - Math.cos(t) * rho];
}

function fanCoords(x, y) {
	const t = Math.atan2(x - C[0], C[1] - y);
	const rho = Math.hypot(x - C[0], C[1] - y);
	const rt = rayHit(t, TOP);
	const rb = rayHit(t, BOT);
	return { u: t / ALPHA, v: (rt - rho) / (rt - rb), rho, rt, rb };
}

function sample(x, y, out) {
	x = Math.min(UW - 1.001, Math.max(0, x * UPSCALE + (UPSCALE - 1) / 2));
	y = Math.min(UH - 1.001, Math.max(0, y * UPSCALE + (UPSCALE - 1) / 2));
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const fx = x - x0;
	const fy = y - y0;
	const d = src.data;
	const i00 = (y0 * UW + x0) * 3;
	const i10 = i00 + 3;
	const i01 = i00 + UW * 3;
	const i11 = i01 + 3;
	for (let c = 0; c < 3; c++) {
		const a = d[i00 + c] + (d[i10 + c] - d[i00 + c]) * fx;
		const b = d[i01 + c] + (d[i11 + c] - d[i01 + c]) * fx;
		out[c] = a + (b - a) * fy;
	}
}

/** Original art at angle φ (0 = left edge … 2α = right edge) and height v, kept off the anti-aliased rims. */
const vSafe = (v) => Math.max(4 / 860, Math.min(1 - 3 / 860, v));
function orig(phi, v, out) {
	const [sx, sy] = fanPoint(phi / ALPHA - 1, vSafe(v));
	sample(sx, sy, out);
}

// smooth value noise, so the hand-over line wanders like a watercolour edge
const hash = (n) => {
	const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};
const noise1 = (x, seed) => {
	const i = Math.floor(x);
	const f = x - i;
	const k = f * f * (3 - 2 * f);
	return hash(i + seed * 101) * (1 - k) + hash(i + 1 + seed * 101) * k;
};
const fbm = (x, seed) => noise1(x, seed) * 0.6 + noise1(x * 2.7, seed + 7) * 0.28 + noise1(x * 7.3, seed + 13) * 0.12;
const smooth = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};

// ── where the painting is cut at each end, per row ────────────────────────────
// Scan in from each edge (skipping the 1 mm paper rim) for the first pixel that is not background green.
// Rows with only sky get the 1 mm line, and mirroring green there just gives green.
const ROWS = 1024;
const rhoEdge = (v) => {
	const rt = rayHit(ALPHA, TOP);
	return rt + (rayHit(ALPHA, BOT) - rt) * v;
};
const cutL = new Float64Array(ROWS);
const cutR = new Float64Array(ROWS);
{
	const col = [0, 0, 0];
	const isArt = (c) => Math.abs(c[0] - GREEN[0]) + Math.abs(c[1] - GREEN[1]) + Math.abs(c[2] - GREEN[2]) > 45;
	const rawL = [];
	const rawR = [];
	for (let r = 0; r < ROWS; r++) {
		const v = (r + 0.5) / ROWS;
		const mm = SPX / rhoEdge(v); // radians per mm at this height
		let l = 1;
		let rr = 1;
		for (let d = 1; d < 20; d += 0.2) {
			orig(d * mm, v, col);
			if (isArt(col)) {
				l = d + 0.3;
				break;
			}
		}
		for (let d = 1; d < 20; d += 0.2) {
			orig(2 * ALPHA - d * mm, v, col);
			if (isArt(col)) {
				rr = d + 0.3;
				break;
			}
		}
		rawL.push(l);
		rawR.push(rr);
	}
	// rows with art share one straight cut; median so stray specks don't kink the mirror line
	const med = (a) => {
		const s = a.filter((d) => d > 1).sort((x, y) => x - y);
		return s.length ? s[s.length >> 1] : 1;
	};
	const mL = med(rawL);
	const mR = med(rawR);
	for (let r = 0; r < ROWS; r++) {
		const mm = SPX / rhoEdge((r + 0.5) / ROWS);
		cutL[r] = (rawL[r] > 1 ? mL : 1) * mm;
		cutR[r] = 2 * ALPHA - (rawR[r] > 1 ? mR : 1) * mm;
	}
	console.log(`art cut: ${mL.toFixed(1)} mm in from the left edge, ${mR.toFixed(1)} mm in from the right edge`);
}

/** Art at signed distance t (mm) from the seam: t < 0 is the right end of the flat, t > 0 the left end. */
const tmpA = [0, 0, 0];
const tmpB = [0, 0, 0];
function bridge(t, v, period, perMm, out) {
	const r = Math.min(ROWS - 1, Math.max(0, Math.floor(v * ROWS)));
	// A: right end, mirrored past its cut
	let pa = period + t * perMm;
	if (pa > cutR[r]) pa = 2 * cutR[r] - pa;
	orig(pa, v, tmpA);
	// B: left end, mirrored before its cut
	let pb = t * perMm;
	if (pb < cutL[r]) pb = 2 * cutL[r] - pb;
	orig(pb, v, tmpB);
	// hand-over: both ranges overlap in the middle, A in front on its side, B on the other
	const wA = 1 - smooth(-3, 15, t + (fbm(v * 9, 1) - 0.5) * 10);
	const wB = smooth(-15, 3, t + (fbm(v * 9, 2) - 0.5) * 10);
	for (let c = 0; c < 3; c++) {
		const dA = (tmpA[c] - GREEN[c]) * wA;
		const dB = (tmpB[c] - GREEN[c]) * wB;
		// light-on-dark union: the lighter wash wins where both paint, darker details keep their own shade
		const d = dA >= 0 && dB >= 0 ? Math.max(dA, dB) : dA <= 0 && dB <= 0 ? Math.min(dA, dB) : dA + dB;
		out[c] = GREEN[c] + d;
	}
}

/** Corrected art at angle φ along the fan (any value; wraps with the cup's repeat). */
function art(phi, v, rho, out) {
	const perMm = SPX / rho;
	const period = 2 * ALPHA - OVERLAP * perMm;
	const p = ((phi % period) + period) % period;
	const fromLeft = p / perMm;
	const fromRight = (period - p) / perMm;
	if (fromLeft < BRIDGE) bridge(fromLeft, v, period, perMm, out);
	else if (fromRight < BRIDGE) bridge(-fromRight, v, period, perMm, out);
	else orig(p, v, out);
}

// ── print file: 300 dpi, white outside the fan, 3 mm bleed at sides and top ───
function render(pxPerMm, { bleed = BLEED, bg = [255, 255, 255] } = {}) {
	const ow = Math.round(PAGE.w * pxPerMm);
	const oh = Math.round(PAGE.h * pxPerMm);
	const k = pxPerMm / SPX;
	const yOff = (SH - PAGE.h * SPX) / 2;
	const buf = Buffer.alloc(ow * oh * 3);
	const mask = Buffer.alloc(ow * oh); // fan coverage, 0..255
	const col = [0, 0, 0];
	const bleedPx = bleed * pxPerMm;
	for (let Y = 0; Y < oh; Y++) {
		for (let X = 0; X < ow; X++) {
			const x = (X + 0.5) / k;
			const y = (Y + 0.5) / k + yOff;
			const f = fanCoords(x, y);
			const outSide = (Math.abs(f.u) - 1) * ALPHA * f.rho * k - bleedPx;
			const outTop = (f.rho - f.rt) * k - bleedPx;
			const outBot = (f.rb - f.rho) * k;
			const cov = Math.min(1, Math.max(0, 0.5 - Math.max(outSide, outTop, outBot)));
			const i = (Y * ow + X) * 3;
			mask[Y * ow + X] = Math.round(cov * 255);
			if (cov <= 0) {
				buf[i] = bg[0];
				buf[i + 1] = bg[1];
				buf[i + 2] = bg[2];
				continue;
			}
			art((f.u + 1) * ALPHA, f.v, f.rho, col);
			for (let c = 0; c < 3; c++) buf[i + c] = Math.round(bg[c] + (col[c] - bg[c]) * cov);
		}
	}
	return { buf, mask, ow, oh };
}

/** The wrap as seen around the cup (one repeat, glue overlap removed), rolled so the seam sits in the middle. */
function strip(width, height, { fix = true } = {}) {
	const buf = Buffer.alloc(width * height * 3);
	const col = [0, 0, 0];
	for (let Y = 0; Y < height; Y++) {
		const v = (Y + 0.5) / height;
		const rho = rhoEdge(v);
		const period = 2 * ALPHA - (OVERLAP * SPX) / rho;
		for (let X = 0; X < width; X++) {
			const s = ((X + 0.5) / width + 0.5) % 1; // seam at the centre
			if (fix) art(s * period, v, rho, col);
			else {
				// as printed before: left edge glued over the right edge's overlap
				const phi = s * period;
				orig(phi < 1e-9 ? 0 : phi, v, col);
			}
			const i = (Y * width + X) * 3;
			buf[i] = col[0];
			buf[i + 1] = col[1];
			buf[i + 2] = col[2];
		}
	}
	return buf;
}

/** Back of the cup like a photo: the seam-centred strip projected onto a cylinder (half the circumference visible). */
function cylinder(stripBuf, sw, sh, w) {
	const buf = Buffer.alloc(w * sh * 3);
	for (let Y = 0; Y < sh; Y++) {
		for (let X = 0; X < w; X++) {
			const p = ((X + 0.5) / w) * 2 - 1; // -1..1 across the visible face
			const phi = Math.asin(p); // -90°..90°
			const s = 0.5 + phi / (2 * Math.PI); // seam (0.5 of the rolled strip) faces the viewer
			const sx = Math.min(sw - 1, Math.floor(s * sw));
			const shade = 0.78 + 0.22 * Math.cos(phi);
			const i = (Y * w + X) * 3;
			const j = (Y * sw + sx) * 3;
			for (let c = 0; c < 3; c++) buf[i + c] = Math.round(stripBuf[j + c] * shade);
		}
	}
	return buf;
}

mkdirSync(OUT, { recursive: true });
const raw = (b, w, h) => sharp(b, { raw: { width: w, height: h, channels: 3 } });

const pxmm = DPI / 25.4;
const print = render(pxmm);
const printPng = join(OUT, `${NAME}_print-${DPI}dpi.png`);
await raw(print.buf, print.ow, print.oh).withIccProfile("srgb").withMetadata({ density: DPI }).png({ compressionLevel: 9 }).toFile(printPng);

// PDF at the exact artboard size
const svg = join(OUT, `.${NAME}_print.svg`);
writeFileSync(
	svg,
	`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${PAGE.w}mm" height="${PAGE.h}mm" viewBox="0 0 ${PAGE.w} ${PAGE.h}">` +
		`<image width="${PAGE.w}" height="${PAGE.h}" preserveAspectRatio="none" xlink:href="${NAME}_print-${DPI}dpi.png"/></svg>`
);
execFileSync('rsvg-convert', ['-f', 'pdf', '-o', join(OUT, `${NAME}_print.pdf`), svg]);

// proof: trim line in magenta, plus a dashed line where the glue overlap starts on the right edge
const trim = render(pxmm, { bleed: 0 });
const edge = await sharp(trim.mask, { raw: { width: trim.ow, height: trim.oh, channels: 1 } })
	.convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
	.threshold(40)
	.extractChannel(0)
	.raw()
	.toBuffer();
const proof = Buffer.from(print.buf);
for (let i = 0; i < edge.length; i++) if (edge[i]) proof.set([236, 0, 140], i * 3);
{
	const k = pxmm / SPX;
	const yOff = (SH - PAGE.h * SPX) / 2;
	for (let s = 0; s <= 1; s += 0.0005) {
		if (Math.floor(s * 80) % 2) continue; // dashes
		const rt = rayHit(ALPHA, TOP);
		const rho = rt + (rayHit(ALPHA, BOT) - rt) * s;
		const th = ALPHA - (OVERLAP * SPX) / rho;
		const X = Math.round((C[0] + Math.sin(th) * rho) * k);
		const Y = Math.round((C[1] - Math.cos(th) * rho - yOff) * k);
		for (let dx = -1; dx <= 1; dx++) if (X + dx >= 0 && X + dx < print.ow && Y >= 0 && Y < print.oh) proof.set([236, 0, 140], (Y * print.ow + X + dx) * 3);
	}
}
await raw(proof, print.ow, print.oh).png().toFile(join(OUT, `${NAME}_proof-trimline.png`));

// seam checks: unrolled strip with the seam in the middle, and the back of the cup before / after
const SWID = 2400;
const SHGT = 860;
const before = strip(SWID, SHGT, { fix: false });
const after = strip(SWID, SHGT);
const cw = 700;
await raw(after, SWID, SHGT).png().toFile(join(OUT, `${NAME}_unrolled-seam-centre.png`));
const gap = 40;
await sharp({ create: { width: cw * 2 + gap, height: SHGT, channels: 3, background: '#ffffff' } })
	.composite([
		{ input: await raw(cylinder(before, SWID, SHGT, cw), cw, SHGT).png().toBuffer(), left: 0, top: 0 },
		{ input: await raw(cylinder(after, SWID, SHGT, cw), cw, SHGT).png().toBuffer(), left: cw + gap, top: 0 }
	])
	.png()
	.toFile(join(OUT, `${NAME}_seam-before-after.png`));

console.log(`wrote ${OUT}/ (${print.ow}×${print.oh} px @ ${DPI} dpi)`);
