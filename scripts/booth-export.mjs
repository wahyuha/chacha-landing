// Turn the path-traced booth renders (assets-src/booth/booth-<view>.png, from /booth + booth-receive.mjs)
// into the website cut-outs (static/img/cut/booth-<view>.webp, WebP with alpha).
// The turntable swaps views in place, so every view gets the same crop size, centred on the booth itself
// (not its shadow, which falls to one side): the booth then keeps one scale and one centre while it "spins".
// Usage: node scripts/booth-export.mjs
import sharp from 'sharp';

const VIEWS = ['front', 'left', 'right'];
const PAD = 24;
const OUT_W = 1400;

async function bounds(src) {
	const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width: W, height: H } = info;
	const solid = { x0: W, x1: 0, y0: H, y1: 0 }; // the booth
	const any = { x0: W, x1: 0, y0: H, y1: 0 }; // booth + visible floor shadow
	for (let y = 0; y < H; y++)
		for (let x = 0; x < W; x++) {
			const a = data[(y * W + x) * 4 + 3];
			for (const [b, t] of [[solid, 250], [any, 14]]) {
				if (a < t) continue;
				if (x < b.x0) b.x0 = x;
				if (x > b.x1) b.x1 = x;
				if (y < b.y0) b.y0 = y;
				if (y > b.y1) b.y1 = y;
			}
		}
	return { W, H, solid, any, cx: (solid.x0 + solid.x1) / 2 };
}

const b = Object.fromEntries(await Promise.all(VIEWS.map(async (v) => [v, await bounds(`assets-src/booth/booth-${v}.png`)])));
const half = Math.max(...VIEWS.map((v) => Math.max(b[v].cx - b[v].any.x0, b[v].any.x1 - b[v].cx))) + PAD;
const top = Math.min(...VIEWS.map((v) => b[v].any.y0)) - PAD;
const bottom = Math.max(...VIEWS.map((v) => b[v].any.y1)) + PAD;
const width = Math.round(half * 2), height = bottom - top;

for (const v of VIEWS) {
	const { W, H, cx } = b[v];
	const left = Math.round(cx - half);
	// extend with transparency where the shared crop runs past the render's edge
	const ext = { top: Math.max(0, -top), bottom: Math.max(0, bottom - H), left: Math.max(0, -left), right: Math.max(0, left + width - W), background: { r: 0, g: 0, b: 0, alpha: 0 } };
	const img = await sharp(`assets-src/booth/booth-${v}.png`).extend(ext).toBuffer();
	const r = await sharp(img)
		.extract({ left: left + ext.left, top: top + ext.top, width, height })
		.resize({ width: OUT_W })
		.webp({ quality: 88, alphaQuality: 90, effort: 6 })
		.toFile(`static/img/cut/booth-${v}.webp`);
	const s = b[v].solid, pct = (n, d) => ((n / d) * 100).toFixed(1);
	console.log(`ok booth-${v}.webp ${r.width}×${r.height} ${Math.round(r.size / 1024)} KB · booth x ${pct(s.x0 - left, width)}–${pct(s.x1 - left, width)}% y ${pct(s.y0 - top, height)}–${pct(s.y1 - top, height)}%`);
}
