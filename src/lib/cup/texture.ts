import { ridge, terraces, rng, CLOUD, PETAL } from '$lib/art';

export type Variant = 'forest' | 'cream';

type Palette = { bg: string; gold: string; line: string; flower: string; flowerFill: string; word: string };

const palettes: Record<Variant, Palette> = {
	forest: { bg: '#143F31', gold: '#D9B869', line: '#D9B869', flower: '#D9B869', flowerFill: '#F3EBDD', word: '#D9B869' },
	cream: { bg: '#F4EDE1', gold: '#C9A24E', line: '#6F8F79', flower: '#6F8F79', flowerFill: '#FBF7F0', word: '#1D5A45' }
};

// Gold-only mask drives metalness so the foil catches light as the cup turns.
const mask = (p: Palette): Palette => ({
	bg: '#000',
	gold: '#fff',
	line: p.line === p.gold ? '#fff' : '#000',
	flower: p.flower === p.gold ? '#fff' : '#000',
	flowerFill: '#000',
	word: p.word === p.gold ? '#fff' : '#000'
});

export const W = 2048;
export const H = 1024;

function vine(ctx: CanvasRenderingContext2D, p: Palette, x: number, y: number, dir: 1 | -1, seed: number) {
	const r = rng(seed);
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(dir, 1);
	ctx.strokeStyle = p.line;
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	// stem rising from the base
	const stem = new Path2D('M0 420 C40 300 -30 200 20 60 C40 0 30 -60 70 -120');
	ctx.stroke(stem);
	const branch = new Path2D('M10 250 C70 220 110 170 150 150 M22 120 C-40 90 -60 40 -80 10');
	ctx.stroke(branch);
	// leaves
	const leaf = new Path2D('M0 0 C-14 -16 -14 -44 0 -62 C14 -44 14 -16 0 0 Z M0 -4 L0 -56');
	const spots: [number, number, number][] = [
		[18, 330, -40], [4, 200, 50], [30, 80, -30], [60, -90, 40], [120, 170, 70], [-60, 30, -70], [90, 205, 20]
	];
	for (const [lx, ly, a] of spots) {
		ctx.save();
		ctx.translate(lx, ly);
		ctx.rotate(((a + (r() - 0.5) * 20) * Math.PI) / 180);
		ctx.stroke(leaf);
		ctx.restore();
	}
	// jasmine blossoms
	const petal = new Path2D(PETAL);
	const blooms: [number, number, number][] = [
		[150, 150, 2.4], [-80, 10, 2.0], [70, -125, 2.2], [26, 260, 1.5], [-10, 400, 1.8]
	];
	for (const [bx, by, s] of blooms) {
		ctx.save();
		ctx.translate(bx, by);
		ctx.scale(s, s);
		ctx.rotate(r() * Math.PI);
		for (let k = 0; k < 5; k++) {
			ctx.save();
			ctx.rotate((k * 2 * Math.PI) / 5);
			ctx.fillStyle = p.flowerFill;
			ctx.fill(petal);
			ctx.lineWidth = 1.3;
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

function paint(ctx: CanvasRenderingContext2D, p: Palette, variant: Variant) {
	ctx.fillStyle = p.bg;
	ctx.fillRect(0, 0, W, H);
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';

	// sky: clouds and a few stars
	const clouds: [number, number, number][] = [
		[180, 90, 2.4], [640, 150, 1.6], [1180, 80, 2.2], [1560, 160, 1.7], [1880, 90, 1.4], [880, 60, 1.2]
	];
	ctx.strokeStyle = p.gold;
	ctx.lineWidth = 2.2;
	for (const [x, y, s] of clouds) {
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(s, s);
		ctx.lineWidth = 2.2 / s;
		ctx.stroke(new Path2D(CLOUD));
		ctx.restore();
	}
	const r = rng(9);
	ctx.fillStyle = p.gold;
	for (let i = 0; i < 26; i++) {
		const x = r() * W;
		const y = 40 + r() * 300;
		if (Math.abs(x - W / 2) < 280 && y > 220) continue;
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
		ctx.fill(new Path2D(rg.fill));
		ctx.strokeStyle = p.line;
		ctx.lineWidth = 3 - i * 0.5;
		ctx.stroke(new Path2D(rg.line));
		ctx.lineWidth = 1.4;
		ctx.globalAlpha = 0.7;
		ctx.stroke(new Path2D(rg.hatch));
		ctx.globalAlpha = 1;
	});
	ctx.lineWidth = 1.6;
	ctx.globalAlpha = 0.7;
	ctx.stroke(new Path2D(terraces(W, 900, 990, 5, 3)));
	ctx.globalAlpha = 1;

	// jasmine vines framing the wordmark
	vine(ctx, p, W / 2 - 380, 560, -1, 3);
	vine(ctx, p, W / 2 + 380, 560, 1, 8);
	vine(ctx, p, 60, 600, 1, 12);
	vine(ctx, p, W - 60, 600, -1, 15);

	// wordmark
	ctx.fillStyle = p.word;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'alphabetic';
	ctx.font = '650 118px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
	(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '22px';
	ctx.fillText('CHACHA', W / 2 + 11, 420);
	ctx.fillStyle = p.gold;
	ctx.font = '600 44px "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';
	(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '14px';
	ctx.fillText('MILK TEA', W / 2 + 7, 492);

	// foil bands at the base
	if (variant === 'forest') {
		ctx.fillStyle = p.gold;
		ctx.fillRect(0, 1000, W, 5);
		ctx.fillRect(0, 1012, W, 2);
	}
}

export async function makeCanvases(variant: Variant) {
	if ('fonts' in document) {
		await document.fonts.load('650 118px "Plus Jakarta Sans Variable"').catch(() => {});
	}
	const color = document.createElement('canvas');
	color.width = W;
	color.height = H;
	paint(color.getContext('2d')!, palettes[variant], variant);
	const metal = document.createElement('canvas');
	metal.width = W;
	metal.height = H;
	paint(metal.getContext('2d')!, mask(palettes[variant]), variant);
	return { color, metal };
}
