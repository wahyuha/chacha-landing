// Builds the Paket Lengkap promo poster (1080 × 1350, IG 4:5) and renders it to PNG at 2x with headless Chrome.
// Usage: node print/poster-promo/build.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const f = (p) => `file://${root}/${p}`;

const src = readFileSync(`${root}/src/lib/brand/logo-paths.ts`, 'utf8');
const LOGO = JSON.parse(src.match(/export const LOGO = (\{.*\});/)[1]);
const LEAF = JSON.parse(src.match(/export const LEAF_A = (\{.*\});/)[1]);

const leaf = (size, fill) => `<svg viewBox="0 0 ${LEAF.width} 101" width="${size}" height="${(size * 101) / LEAF.width}" aria-hidden="true"><path d="${LEAF.d}" fill="${fill}"/></svg>`;

// x = centre, b = floor line, h = height (artboard px); z orders the overlap
const front = [
	{ src: 'static/img/kit/botol-uht.webp', x: 282, b: 950, h: 225, z: 2 },
	{ src: 'static/img/kit/dispenser.webp', x: 150, b: 962, h: 300, z: 3 },
	{ src: 'static/img/kit/shaker.webp', x: 366, b: 958, h: 178, z: 3 },
	{ src: 'static/img/kit/teko-takar.webp', x: 92, b: 1000, h: 150, z: 5 },
	{ src: 'static/img/kit/timbangan.webp', x: 256, b: 1004, h: 168, z: 5 },
	{ src: 'static/img/kit/termometer.webp', x: 392, b: 1000, h: 112, z: 6 },
	{ src: 'static/img/kit/jigger.webp', x: 470, b: 996, h: 80, z: 6 },
	{ src: 'static/img/cut/cup-forest-front.webp', x: 884, b: 990, h: 300, z: 5 },
	{ src: 'static/img/cut/cup-clear.webp', x: 972, b: 1002, h: 218, z: 6 }
];
const piece = (p) =>
	`<div class="shadow" style="left:${p.x - p.h * 0.34}px;top:${p.b - 14}px;width:${p.h * 0.68}px;height:26px;z-index:${p.z}"></div>` +
	`<img class="obj" src="${f(p.src)}" style="left:${p.x}px;top:${p.b - p.h}px;height:${p.h}px;transform:translateX(-50%);z-index:${p.z}" alt="">`;

const perks = [
	['Booth siap jualan', '110 × 55 × 80 cm, berlampu'],
	['19 alat minuman', 'dispenser, shaker, timbangan'],
	['Bahan baku awal', 'cukup untuk 100 cup'],
	['Diajari sampai bisa', 'plus video SOP'],
	['0% royalti', 'omzetnya utuh milikmu'],
	['Dikirim ke lokasimu', 'sampai dalam 7–14 hari']
];

// 9-lobed scallop for the sticker
const scallop = (() => {
	const n = 9, R = 100, r = 84, pts = [];
	for (let i = 0; i < n; i++) {
		const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5) / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
		const p = (a, rad) => `${(110 + Math.cos(a) * rad).toFixed(1)} ${(110 + Math.sin(a) * rad).toFixed(1)}`;
		pts.push(`${i ? 'L' : 'M'}${p(a0, r)} Q${p(a1, R * 1.16)} ${p(a2, r)}`);
	}
	return pts.join(' ') + 'Z';
})();

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Jakarta;font-weight:200 800;src:url('${f('node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2')}') format('woff2')}
@font-face{font-family:Corm;font-style:italic;font-weight:600;src:url('${f('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2')}') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden;background:#fbfaf6}
.p{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:Jakarta,sans-serif;color:#143F31;background:#fbfaf6}
.p>*{position:absolute}
.photo{left:150px;top:170px;width:890px;height:780px;border-radius:40px;overflow:hidden;background:#eceae3}
.photo img{width:100%;height:100%;object-fit:cover;object-position:30% 50%;filter:grayscale(1) contrast(.9) brightness(1.12);opacity:.38}
.photo::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(251,250,246,.15) 0%,rgba(251,250,246,0) 40%,rgba(251,250,246,.85) 88%,#fbfaf6 100%)}
.obj{position:absolute;object-fit:contain;filter:contrast(1.05) saturate(.95) drop-shadow(0 18px 18px rgba(30,40,30,.18))}
.shadow{position:absolute;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(20,35,28,.45),rgba(20,35,28,0) 100%)}
.price{font-weight:800;letter-spacing:-.065em;line-height:.8;color:#143F31;-webkit-text-stroke:14px #fbfaf6;paint-order:stroke fill}
.perk b{display:block;font-size:20px;font-weight:800;letter-spacing:-.01em;line-height:1.15}
.perk span{display:block;margin-top:3px;font-size:15px;color:rgba(20,63,49,.62);line-height:1.3}
</style></head><body><div class="p">
<div class="photo"><img src="${f('static/img/g-interior.webp')}" alt=""></div>

<!-- faint leaf pattern, top-left -->
<div style="left:-40px;top:-30px;opacity:.07;transform:rotate(-18deg)">${leaf(260, '#1D5A45')}</div>
<div style="left:930px;top:1120px;opacity:.06;transform:rotate(160deg)">${leaf(220, '#1D5A45')}</div>

<!-- price hook -->
<p style="left:66px;top:58px;font-size:23px;font-weight:700;letter-spacing:-.01em">Kemitraan Chacha, mulai</p>
<div style="left:46px;top:96px;display:flex;align-items:flex-start;z-index:8">
	<span class="price" style="font-size:236px">8,5</span>
	<span class="price" style="font-size:72px;margin-top:6px;margin-left:6px;color:#C9A24E;-webkit-text-stroke:10px #fbfaf6">jt</span>
</div>

<!-- logo -->
<svg style="right:64px;top:62px" width="236" viewBox="0 0 ${LOGO.width} ${LOGO.height}" aria-label="Chacha"><path d="${LOGO.word}" fill="#1D5A45"/><path d="${LOGO.sub}" fill="#6A9A7E"/></svg>

<!-- sticker -->
<div style="left:60px;top:330px;width:220px;height:220px;transform:rotate(-9deg);z-index:9;filter:drop-shadow(0 16px 22px rgba(122,94,34,.35))">
	<svg viewBox="0 0 220 220" width="220" height="220"><path d="${scallop}" fill="#D4B062"/></svg>
	<p style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-size:36px;font-weight:800;line-height:.98;letter-spacing:-.03em;color:#143F31">Paling<br>Lengkap!</p>
</div>

<!-- booth -->
<div class="shadow" style="left:362px;top:924px;width:470px;height:40px;z-index:1"></div>
<img class="obj" src="${f('static/img/cut/booth-front.webp')}" style="left:346px;top:300px;height:640px;z-index:1" alt="">

${front.map(piece).join('\n')}

<!-- callout: cups + raw materials -->
<div style="left:836px;top:500px;transform:rotate(6deg);z-index:9;text-align:center">
	<p style="background:#143F31;color:#fbfaf6;border-radius:18px;padding:12px 18px;font-size:19px;font-weight:800;line-height:1.12;letter-spacing:-.01em;box-shadow:0 14px 26px -12px rgba(20,63,49,.6)">Bahan baku<br><span style="color:#E6C77D">100 cup</span> pertama</p>
	<svg width="60" height="90" viewBox="0 0 60 90" style="margin:4px auto 0;display:block"><path d="M30 4 C 10 30, 46 50, 26 82" stroke="#143F31" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M16 72 L26 84 L34 70" stroke="#143F31" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
</div>

<!-- title + CTA -->
<h1 style="left:62px;top:1040px;font-size:104px;font-weight:800;line-height:.9;letter-spacing:-.055em">Paket<br><span style="font-family:Corm,serif;font-style:italic;font-weight:600;letter-spacing:-.02em;font-size:118px;color:#1D5A45">Lengkap</span></h1>
<div style="left:64px;top:1252px;height:50px;display:flex;align-items:center;gap:10px;padding:0 22px 0 16px;border-radius:999px;background:#143F31;color:#fbfaf6;font-size:17px;font-weight:700">
	<svg viewBox="0 0 24 24" width="22" height="22" fill="#E6C77D"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Z"/></svg>
	Tanya dulu di WhatsApp <span style="opacity:.5">·</span> <span style="color:#E6C77D">chacha.id</span>
</div>

<!-- perks -->
<div style="left:500px;top:1046px;width:516px;display:grid;grid-template-columns:1fr 1fr;column-gap:28px;row-gap:26px">
${perks.map(([t, d]) => `<div class="perk" style="display:flex;gap:12px"><div style="flex:none;margin-top:2px">${leaf(22, '#C9A24E')}</div><div><b>${t}</b><span>${d}</span></div></div>`).join('')}
</div>
</div></body></html>`;

writeFileSync(`${here}/poster.html`, html);
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--allow-file-access-from-files', '--force-device-scale-factor=2', '--window-size=1080,1350', '--virtual-time-budget=5000', `--screenshot=${here}/chacha-paket-lengkap-promo.png`, `file://${here}/poster.html`], { stdio: 'ignore' });
console.log('ok', `${here}/chacha-paket-lengkap-promo.png`);
