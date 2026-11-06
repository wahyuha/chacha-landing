# Chacha website

Static SvelteKit site (Svelte 5, Tailwind v4, GSAP + Lenis, Threlte/three.js for the 360° cup).

| Route | Page |
|---|---|
| `/` | Brand home |
| `/menu` | Full menu |
| `/kemitraan` | Partnership landing page |
| `/booth`, `/poster/*` | In-house artwork exports |

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # static output in build/ (deploy to any static host / CDN)
```

## Hosting

Netlify project `chachatea` builds `main` on every push (settings in `netlify.toml`). This folder is linked to it, so `netlify status` and other CLI commands work here.

Both domains are registered at Hostinger, each with its apex A record set to `75.2.60.5` and `www` as a CNAME to `chachatea.netlify.app`. `chachatea.id` is the primary domain; `www.chachatea.id` and `chacha.id` redirect to it.

## Still to fill in

- **Tea descriptions**: `teas` in `src/lib/data.ts` need checking by someone who has tasted the teas.
- **Outlets, delivery apps, social accounts**: fill `outlets`, `orderLinks` and `socials` in `src/lib/data.ts`. Empty lists stay hidden; with no outlets, the home page asks people to message on WhatsApp.
- **Domain**: `SITE_URL` in `src/lib/data.ts`, `static/sitemap.xml` and `static/robots.txt` use `chachatea.id`. Booth and poster artwork still print `chacha.id`.

## Copy

Menu names, prices and tea groupings follow the printed menu and live in `src/lib/data.ts`, along with packages and FAQ. Colours, fonts and tone follow the Chacha design system.

## Images

`node scripts/site-assets.mjs [drinks|bases|teas|photos|logos]` builds the brand site's images from `assets-src/site/` into `static/img/site/`.

- **Drinks and tea shots** are sliced from the printed menu (`menu.webp`) and enlarged, so they will look soft on large screens. Replace the source with the original artwork when available.
- **Tea photos**: the raw photos are masked by hand-traced outlines (`TEA_MASKS` in the script) and placed on one shared ground.

`node scripts/assets.mjs` builds WebP files for the kemitraan page into `static/img/` from `../material` (brand mockups) and from `assets-src/` (real or generated photos). A file in `assets-src/` always wins over the mockup fallback.

Cutouts (transparent WebP, background removed on-device with `@imgly/background-removal-node`):

- `node scripts/cutout.mjs [name...]`: equipment photos in `assets-src/kit/` to `static/img/kit/` (used by Isi Paket).
- `node scripts/cutout-brand.mjs`: booth views and cups from `assets-src/brand/` to `static/img/cut/`.

Add a new equipment photo to `assets-src/kit/`, run the cutout script, then add it to `kitItems` in `src/lib/data.ts`.

## Conversion blocks (`src/lib/data.ts`)

- `promo`: sticky WhatsApp bar text, prefilled message, top ribbon, optional `slotsLeft` counter.
- `packages[].was`: optional strikethrough price. Use only if that normal price really applied.
- `proof` / `chats`: photo and WhatsApp-testimonial slots. `src: null` shows a labelled placeholder
  describing the shot to take. Fill with Chacha's own photos only.
