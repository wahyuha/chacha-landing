import { paint, palettes, mask, W, H, BRAND_ART, type Ctx, type Variant } from './artwork.ts';

export type { Variant };

const P = (d: string) => new Path2D(d);

// The printed cup keeps 8 mm of wall below the artwork edge for the gold ring; extend the texture the
// same way (≈66 artwork units) so the 3D cup shows the ring down to its foot.
const TEX_H = H + 66;
const OPTS = { ...BRAND_ART, ringDepth: TEX_H - 1012 };
// thin forest lines on cream fade at on-screen size (gold on forest holds up), so draw them heavier for the 3D cup
const LINE_SCALE: Record<Variant, number> = { forest: 1, cream: 2.2 };

export async function makeCanvases(variant: Variant) {
	if ('fonts' in document) {
		await document.fonts.load('600 20px "Plus Jakarta Sans Variable"').catch(() => {});
	}
	const color = document.createElement('canvas');
	color.width = W;
	color.height = TEX_H;
	paint(color.getContext('2d') as Ctx, P, palettes[variant], variant, { ...OPTS, lineScale: LINE_SCALE[variant] });
	const metal = document.createElement('canvas');
	metal.width = W;
	metal.height = TEX_H;
	paint(metal.getContext('2d') as Ctx, P, mask(palettes[variant]), variant, { ...OPTS, lineScale: LINE_SCALE[variant] });
	return { color, metal };
}
