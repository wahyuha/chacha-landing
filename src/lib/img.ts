import sizes from './img-sizes.json';

type Entry = { w: number; v: number[] };
const table = sizes as Record<string, Entry>;

/** `srcset` for an image built by scripts/responsive.mjs, or undefined if it has no smaller copies. */
export function srcset(src: string): string | undefined {
	const e = table[src];
	if (!e || !e.v.length) return undefined;
	const base = src.replace(/\.webp$/, '');
	return [...e.v.map((w) => `${base}@${w}.webp ${w}w`), `${src} ${e.w}w`].join(', ');
}

/** Smallest copy at least `min` px wide, for images shown at one fixed small size. */
export function sized(src: string, min: number): string {
	const e = table[src];
	const w = e?.v.find((w) => w >= min);
	return w ? src.replace(/\.webp$/, `@${w}.webp`) : src;
}
