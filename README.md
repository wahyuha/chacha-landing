# Chacha — landing page

Static SvelteKit site (Svelte 5, Tailwind v4, GSAP + Lenis, Threlte/three.js for the 360° cup).

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # static output in build/ (deploy to any static host / CDN)
```

## Before launch

- **WhatsApp number**: `WA_NUMBER` in `src/lib/data.ts` is a placeholder.
- **Copy & prices**: menu, packages, FAQ and steps all live in `src/lib/data.ts`.
- **Logo**: the wordmark is set in type (`Wordmark.svelte`) until the leaf-A vector exists; `static/favicon.svg` is a placeholder leaf.

## Images

`node scripts/assets.mjs` builds WebP files into `static/img/` from `../material` (brand mockups) and from
`assets-src/` (real or generated photos). A file in `assets-src/` always wins over the mockup fallback.

Menu drinks and booth packages currently render as SVG illustrations (`DrinkArt.svelte`, `BoothArt.svelte`).
To switch one to a photo: add e.g. `assets-src/menu-matcha.png`, run the script, then set `photo: true`
on that item in `src/lib/data.ts`.

## Conversion blocks (`src/lib/data.ts`)

- `promo`: sticky WhatsApp bar text, prefilled message, top ribbon, optional `slotsLeft` counter.
- `packages[].was`: optional strikethrough price. Use only if that normal price really applied.
- `proof` / `chats`: photo and WhatsApp-testimonial slots. `src: null` shows a labelled placeholder
  describing the shot to take. Fill with Chacha's own photos only.
