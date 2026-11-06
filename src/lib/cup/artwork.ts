// The cup wrap artwork, drawn through a canvas-like context so the same drawing feeds
// the website's 3D texture (real canvas) and the print file (SVG recorder in scripts/cup-print.ts).
import { ridge, terraces, rng, CLOUD, PETAL } from '../art.ts';
import { LOGO } from '../brand/logo-paths.ts';

export type Variant = 'forest' | 'cream';

export type Palette = { bg: string; gold: string; line: string; flower: string; flowerFill: string; word: string };

export const palettes: Record<Variant, Palette> = {
	forest: { bg: '#143F31', gold: '#D9B869', line: '#D9B869', flower: '#D9B869', flowerFill: '#F3EBDD', word: '#D9B869' },
	// cream matches the dispenser wrap: forest line-art and logo, gold for the sun, stars, tagline and bands
	cream: { bg: '#F4EDE1', gold: '#C9A24E', line: '#1D5A45', flower: '#1D5A45', flowerFill: '#FFFFFF', word: '#1D5A45' }
};

/** Gold-only mask: white where gold shows, black elsewhere (metalness map / foil plate). */
export const mask = (p: Palette): Palette => ({
	bg: '#000',
	gold: '#fff',
	line: p.line === p.gold ? '#fff' : '#000',
	flower: p.flower === p.gold ? '#fff' : '#000',
	flowerFill: '#000',
	word: p.word === p.gold ? '#fff' : '#000'
});

/** Artwork space: x runs once around the cup, y from rim (0) to base (H). */
export const W = 2048;
export const H = 1024;

export type Ctx = CanvasRenderingContext2D & { letterSpacing: string };
export type MakePath = (d: string) => Path2D;

/** `grow` shortens the vine from the top while its base stays put; flowers and leaves keep their shape. */
function vine(ctx: Ctx, P: MakePath, p: Palette, x: number, y: number, dir: 1 | -1, seed: number, bloom = 1, grow = 1, lw = 1) {
	const r = rng(seed);
	ctx.save();
	ctx.translate(x, y + 420 * (1 - grow));
	ctx.scale(dir, 1);
	ctx.strokeStyle = p.line;
	ctx.lineWidth = 3 * lw;
	ctx.lineCap = 'round';
	// stem rising from the base (stem base sits at local y = 420)
	ctx.save();
	ctx.scale(1, grow);
	ctx.stroke(P('M0 420 C40 300 -30 200 20 60 C40 0 30 -60 70 -120'));
	ctx.stroke(P('M10 250 C70 220 110 170 150 150 M22 120 C-40 90 -60 40 -80 10'));
	ctx.restore();
	// leaves
	const leaf = P('M0 0 C-14 -16 -14 -44 0 -62 C14 -44 14 -16 0 0 Z M0 -4 L0 -56');
	const spots: [number, number, number][] = [
		[18, 330, -40], [4, 200, 50], [30, 80, -30], [60, -90, 40], [120, 170, 70], [-60, 30, -70], [90, 205, 20]
	];
	for (const [lx, ly, a] of spots) {
		ctx.save();
		ctx.translate(lx, ly * grow);
		ctx.rotate(((a + (r() - 0.5) * 20) * Math.PI) / 180);
		ctx.stroke(leaf);
		ctx.restore();
	}
	// jasmine blossoms
	const petal = P(PETAL);
	const blooms: [number, number, number][] = [
		[150, 150, 2.4], [-80, 10, 2.0], [70, -125, 2.2], [26, 260, 1.5], [-10, 400, 1.8]
	];
	for (const [bx, by, s] of blooms) {
		ctx.save();
		ctx.translate(bx, by * grow);
		ctx.scale(s * bloom, s * bloom);
		ctx.rotate(r() * Math.PI);
		for (let k = 0; k < 5; k++) {
			ctx.save();
			ctx.rotate((k * 2 * Math.PI) / 5);
			ctx.fillStyle = p.flowerFill;
			ctx.fill(petal);
			ctx.lineWidth = 1.3 * lw;
			ctx.strokeStyle = p.flower;
			ctx.stroke(petal);
			ctx.restore();
		}
		ctx.fillStyle = p.gold;
		ctx.beginPath();
		ctx.arc(0, 0, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	ctx.restore();
}

/** Print-only tweaks; the defaults reproduce the website cup exactly. */
export type PaintOptions = {
	bloomScale?: number;
	/** heights of the four vines: centre-left, centre-right, back-left, back-right (1 = full) */
	vineGrow?: [number, number, number, number];
	/** website on a gold ring round the base (green text), plus how far the ring shows below its top edge, in artwork units */
	footer?: string;
	/** vector brand logo (paths in its own units, top-left origin); replaces the typed wordmark */
	logo?: { word: string; sub: string; width: number; height: number; cap: number };
	/** cap height of the logo in artwork units; the lockup is centred between the clouds and the sun */
	logoCap?: number;
	ringDepth?: number;
	/** multiplies every line-art stroke; the small on-screen 3D cup needs heavier lines than print */
	lineScale?: number;
};

/** The finished cup design, shared by the website's 3D cup and the print files (which add ringDepth from the die-line). */
export const BRAND_ART = {
	bloomScale: 0.6,
	vineGrow: [0.69, 0.69, 1, 0.82] as [number, number, number, number], // centre pair tops out just under the highest peak
	footer: 'chacha.id',
	logo: LOGO, // brand lockup: leaf-A wordmark + FRESH DRINK & MILK TEA
	logoCap: 62 // ≈ half the visible front; subline still ≈1.8 mm cap height in print
} satisfies PaintOptions;

export function paint(ctx: Ctx, P: MakePath, p: Palette, variant: Variant, opts: PaintOptions = {}) {
	const bloom = opts.bloomScale ?? 1;
	const lw = opts.lineScale ?? 1;
	const grow = opts.vineGrow ?? [1, 1, 1, 1];
	ctx.fillStyle = p.bg;
	ctx.fillRect(0, 0, W, H);
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	// sky: clouds and a few stars
	const clouds: [number, number, number][] = [
		[180, 90, 2.4], [640, 150, 1.6], [1180, 80, 2.2], [1560, 160, 1.7], [1880, 90, 1.4], [880, 60, 1.2]
	];
	ctx.strokeStyle = p.line; // clouds are line-art like the mountains (gold on forest, forest on cream)
	ctx.lineWidth = 2.2 * lw;
	for (const [x, y, s] of clouds) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.lineWidth = (2.2 * lw) / s;
		ctx.stroke(P(CLOUD));
		ctx.restore();
	}
	const r = rng(9);
	ctx.fillStyle = p.gold;
	for (let i = 0; i < 26; i++) {
		const x = r() * W;
		const y = 40 + r() * 300;
		if (Math.abs(x - W / 2) < (opts.logo ? 360 : 280) && y > 220) continue; // keep stars off the wordmark
		const s = 3 + r() * 5;
		ctx.save();
		ctx.translate(x, y);
		ctx.beginPath();
		ctx.moveTo(0, -s);
		ctx.quadraticCurveTo(0, 0, s, 0);
		ctx.quadraticCurveTo(0, 0, 0, s);
		ctx.quadraticCurveTo(0, 0, -s, 0);
		ctx.quadraticCurveTo(0, 0, 0, -s);
		ctx.fill();
		ctx.restore();
	}

	// sun disc above the peaks, centred under the wordmark
	ctx.fillStyle = p.gold;
	ctx.beginPath();
	ctx.arc(W / 2, 560, 30, 0, Math.PI * 2);
	ctx.fill();

	// mountain ranges
	const ranges = [
		ridge({ width: W, height: H, base: 760, peaks: 6, amp: 230, seed: 4, hatch: 8 }),
		ridge({ width: W, height: H, base: 820, peaks: 9, amp: 150, seed: 17, hatch: 5 }),
		ridge({ width: W, height: H, base: 880, peaks: 7, amp: 90, seed: 29, hatch: 3, sharp: false })
	];
	ranges.forEach((rg, i) => {
		ctx.fillStyle = p.bg;
		ctx.fill(P(rg.fill));
		ctx.strokeStyle = p.line;
		ctx.lineWidth = (3 - i * 0.5) * lw;
		ctx.stroke(P(rg.line));
		ctx.lineWidth = 1.4 * lw;
		ctx.globalAlpha = 0.7;
		ctx.stroke(P(rg.hatch));
		ctx.globalAlpha = 1;
	});
	ctx.lineWidth = 1.6 * lw;
	ctx.globalAlpha = 0.7;
	ctx.stroke(P(terraces(W, 900, 990, 5, 3)));
	ctx.globalAlpha = 1;

	// website ring: a gold band all the way round the base, its top edge on the thin base line (y = 1012),
	// running down past the artwork edge to the cup's foot; "chacha.id" repeats five times in forest green
	if (opts.footer) {
		const top = 1012;
		ctx.fillStyle = p.gold;
		ctx.fillRect(0, top, W, 200);
		ctx.fillStyle = variant === 'cream' ? p.word : p.bg; // cream on gold is too faint to read
		ctx.textAlign = 'center';
		ctx.font = '600 20px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
		ctx.letterSpacing = '6px';
		const n = 3; // evenly round the cup, one centred at the front; none lands on the back seam
		const step = W / n;
		const mid = top + (opts.ringDepth ?? 76) / 2;
		// each repeat is framed by a star either side at a fixed margin, so it reads as one unit
		const margin = 30;
		const half = (ctx.measureText(opts.footer).width - 6) / 2; // minus the trailing letter-space
		for (let i = 0; i < n; i++) {
			const cx = W / 2 + (i - (n - 1) / 2) * step;
			ctx.fillText(opts.footer, cx + 3, mid + 7); // baseline set so the ascender height centres in the ring
			for (const sx of [cx - half - margin, cx + half + margin]) {
				ctx.save();
				ctx.translate(sx, mid);
				ctx.beginPath();
				ctx.moveTo(0, -7);
				ctx.quadraticCurveTo(0, 0, 7, 0);
				ctx.quadraticCurveTo(0, 0, 0, 7);
				ctx.quadraticCurveTo(0, 0, -7, 0);
				ctx.quadraticCurveTo(0, 0, 0, -7);
				ctx.fill();
				ctx.restore();
			}
		}
	}

	// jasmine vines framing the wordmark
	vine(ctx, P, p, W / 2 - 380, 560, -1, 3, bloom, grow[0], lw);
	vine(ctx, P, p, W / 2 + 380, 560, 1, 8, bloom, grow[1], lw);
	vine(ctx, P, p, 60, 600, 1, 12, bloom, grow[2], lw);
	vine(ctx, P, p, W - 60, 600, -1, 15, bloom, grow[3], lw);

	// wordmark: the vector brand logo when supplied (print), otherwise set in type (website texture)
	if (opts.logo) {
		const L = opts.logo;
		const s = (opts.logoCap ?? 90) / L.cap;
		const centreY = 392; // optical middle of the open sky between the cloud line (~250) and the sun (~530)
		ctx.save();
		ctx.translate(W / 2 - (L.width * s) / 2, centreY - (L.height * s) / 2);
		ctx.scale(s, s);
		ctx.fillStyle = p.word;
		ctx.fill(P(L.word));
		ctx.fillStyle = p.gold;
		ctx.fill(P(L.sub));
		ctx.restore();
	} else {
		ctx.fillStyle = p.word;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		ctx.font = '650 118px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
		ctx.letterSpacing = '22px';
		ctx.fillText('CHACHA', W / 2 + 11, 420);
		ctx.fillStyle = p.gold;
		ctx.font = '600 44px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
		ctx.letterSpacing = '14px';
		ctx.fillText('MILK TEA', W / 2 + 7, 492);
	}

	// foil bands at the base (both variants, like the dispenser wrap)
	ctx.fillStyle = p.gold;
	ctx.fillRect(0, 1000, W, 5);
	ctx.fillRect(0, 1012, W, 2);
}
