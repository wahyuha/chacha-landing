// Procedural line-art in the spirit of the Chacha cup: mountain ridges with etched hatching,
// auspicious clouds, jasmine blossoms. Deterministic so SSR and client match.

export function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

type Pt = [number, number];

const f = (n: number) => Math.round(n * 10) / 10;

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
export function smooth(pts: Pt[], tension = 0.5): string {
	if (pts.length < 2) return '';
	let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2];
		const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2];
		d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
	}
	return d;
}

export type Ridge = { line: string; fill: string; hatch: string; peaks: Pt[] };

/**
 * One mountain range across `width`. Peaks alternate with valleys; hatching falls from the
 * ridge down the shaded (right) flank of each peak, like engraved line-art.
 */
export function ridge(opts: {
	width: number;
	height: number;
	base: number;
	peaks: number;
	amp: number;
	seed: number;
	hatch?: number;
	sharp?: boolean;
}): Ridge {
	const { width, height, base, peaks, amp, seed, hatch = 0, sharp = true } = opts;
	const r = rng(seed);
	const step = width / peaks;
	const pts: Pt[] = [[-20, base + amp * 0.15]];
	const peakPts: Pt[] = [];
	for (let i = 0; i < peaks; i++) {
		const x0 = i * step;
		const px = x0 + step * (0.3 + r() * 0.4);
		const py = base - amp * (0.45 + r() * 0.55);
		const vx = x0 + step;
		const vy = base - amp * (0.05 + r() * 0.2);
		// shoulders give the ridge its craggy silhouette
		pts.push([px - step * (0.18 + r() * 0.08), py + amp * (0.18 + r() * 0.12)]);
		pts.push([px, py]);
		if (sharp) pts.push([px + step * (0.08 + r() * 0.06), py + amp * (0.1 + r() * 0.08)]);
		pts.push([vx, vy]);
		peakPts.push([px, py]);
	}
	pts.push([width + 20, base]);
	const line = smooth(pts, sharp ? 0.35 : 0.5);
	const fill = `${line} L${width + 20} ${height} L-20 ${height} Z`;

	let h = '';
	if (hatch > 0) {
		for (const [px, py] of peakPts) {
			const count = Math.round(hatch * (0.6 + r() * 0.6));
			for (let k = 1; k <= count; k++) {
				const t = k / (count + 1);
				const sx = px + step * 0.34 * t;
				const sy = py + (base - py) * t * 0.55 + amp * 0.02;
				const len = (base - sy) * (0.25 + r() * 0.35);
				const dx = step * 0.06 * (0.5 + r());
				h += `M${f(sx)} ${f(sy)} q${f(dx * 0.3)} ${f(len * 0.5)} ${f(dx)} ${f(len)} `;
			}
		}
	}
	return { line, fill, hatch: h.trim(), peaks: peakPts };
}

/** Rolling tea-garden terraces: gently curved parallel contour lines. */
export function terraces(width: number, top: number, bottom: number, rows: number, seed: number) {
	const r = rng(seed);
	let d = '';
	for (let i = 0; i < rows; i++) {
		const y = top + ((bottom - top) * i) / rows;
		const pts: Pt[] = [];
		const n = 6;
		for (let k = 0; k <= n; k++) {
			pts.push([(width * k) / n, y + Math.sin(k * 1.3 + i * 0.7 + r() * 0.6) * (6 + i * 1.5)]);
		}
		d += smooth(pts) + ' ';
	}
	return d.trim();
}

/** Auspicious cloud motif, 120 × 48 box, origin at top-left. */
export const CLOUD =
	'M6 42 H114 M18 42 C6 42 4 26 18 24 C28 22 34 32 27 36 C22 39 17 34 21 30 ' +
	'M30 24 C32 10 52 4 62 16 C66 8 82 6 88 18 C98 14 110 22 106 32 C104 40 94 40 92 34 C90 29 96 27 98 30 ' +
	'M62 16 C66 22 64 28 58 28 C53 28 52 22 56 21';

/** One jasmine petal pointing up from the origin; rotate five of them around the centre. */
export const PETAL = 'M0 0 C-7 -6 -8 -18 0 -26 C8 -18 7 -6 0 0 Z';

/** Tea leaf, pointing up, origin at stem. */
export const LEAF = 'M0 0 C-10 -12 -10 -34 0 -48 C10 -34 10 -12 0 0 Z M0 -2 L0 -44';
