// Poster B (Adobe Express version): dark "night stage" Paket Lengkap poster, 1080 × 1350.
// Lighting, floor and contact shadows are baked into one background PNG so they survive the Express import;
// every word stays live text and every product stays its own image layer.
// Usage: node print/poster-adobe/build.mjs  → poster.html (self-contained) + preview.png
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const W = 1080, H = 1350;

const src = readFileSync(`${root}/src/lib/brand/logo-paths.ts`, 'utf8');
const LOGO = JSON.parse(src.match(/export const LOGO = (\{.*\});/)[1]);

// product layers: x = centre, b = floor line, h = height
const stage = [
	{ id: 'booth', file: 'static/img/cut/booth-front.webp', x: 540, b: 935, h: 518, crop: 712 },
	{ id: 'dispenser', file: 'static/img/kit/dispenser.webp', x: 190, b: 958, h: 250 },
	{ id: 'shaker', file: 'static/img/kit/shaker.webp', x: 318, b: 968, h: 150 },
	{ id: 'cup-forest', file: 'static/img/cut/cup-forest-front.webp', x: 842, b: 960, h: 262 },
	{ id: 'cup-clear', file: 'static/img/cut/cup-clear.webp', x: 950, b: 970, h: 206 }
];
const strip = [
	['dispenser', 'Dispenser', 2],
	['shaker', 'Shaker', 2],
	['teko-takar', 'Teko takar', 1],
	['timbangan', 'Timbangan', 1],
	['termometer', 'Termometer', 1],
	['botol-susu', 'Botol susu', 2],
	['jigger', 'Jigger', 2]
];

// On the dark stage the cutouts' faint semi-transparent fringes show up as grey haze, so clip weak alpha.
const png64 = async (file, h, cropH) => {
	let img = sharp(`${root}/${file}`);
	if (cropH) img = sharp(await img.extract({ left: 0, top: 0, width: (await img.metadata()).width, height: cropH }).toBuffer());
	const m = await img.metadata();
	const { data, info } = await img.resize({ height: Math.round(h * 2) }).modulate({ saturation: 0.96 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	for (let i = 3; i < data.length; i += 4) data[i] = data[i] < 110 ? 0 : Math.min(255, Math.round((data[i] - 110) * (255 / 145)));
	const buf = await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer();
	return { uri: `data:image/png;base64,${buf.toString('base64')}`, w: Math.round((m.width / m.height) * h) };
};

// background: forest night, spotlight, warm LED spill, floor, contact shadows
const shadows = stage.map((p) => `<ellipse cx="${p.x}" cy="${p.b - 4}" rx="${p.id === 'booth' ? 250 : p.h * 0.34}" ry="${p.id === 'booth' ? 20 : 12}" fill="#020d08" opacity=".75" filter="url(#s)"/>`).join('');
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
	<radialGradient id="spot" cx="540" cy="640" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2f7a5c" stop-opacity=".95"/><stop offset=".55" stop-color="#1a4d3b" stop-opacity=".6"/><stop offset="1" stop-color="#0f3327" stop-opacity="0"/></radialGradient>
	<radialGradient id="led" cx="540" cy="760" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2c46d" stop-opacity=".30"/><stop offset="1" stop-color="#f2c46d" stop-opacity="0"/></radialGradient>
	<linearGradient id="floor" x1="0" y1="880" x2="0" y2="1060" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b2a20" stop-opacity="0"/><stop offset=".35" stop-color="#0b2a20" stop-opacity=".55"/><stop offset="1" stop-color="#081f17" stop-opacity=".9"/></linearGradient>
	<linearGradient id="vign" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0a2a1f" stop-opacity=".55"/><stop offset=".25" stop-color="#0a2a1f" stop-opacity="0"/></linearGradient>
	<filter id="s" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>
	<filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="#123b2e"/>
<rect width="${W}" height="${H}" fill="url(#spot)"/>
<rect width="${W}" height="${H}" fill="url(#led)"/>
<rect y="880" width="${W}" height="${H - 880}" fill="url(#floor)"/>
<line x1="0" y1="930" x2="${W}" y2="930" stroke="#e6c77d" stroke-opacity=".10" stroke-width="2" filter="url(#soft)"/>
<rect width="${W}" height="${H}" fill="url(#vign)"/>
${shadows}
</svg>`;
const bg = await sharp(Buffer.from(bgSvg)).resize(W * 2).png().toBuffer();
const bgUri = `data:image/png;base64,${bg.toString('base64')}`;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.width} ${LOGO.height}"><path d="${LOGO.word}" fill="#F5EEE3"/><path d="${LOGO.sub}" fill="#E6C77D"/></svg>`;
const logo = await sharp(Buffer.from(logoSvg)).resize(440).png().toBuffer();
const logoUri = `data:image/png;base64,${logo.toString('base64')}`;

const stageImgs = [];
for (const p of stage) {
	const { uri, w } = await png64(p.file, p.h, p.crop);
	stageImgs.push(`<img src="${uri}" alt="" style="position:absolute;left:${Math.round(p.x - w / 2)}px;top:${p.b - p.h}px;width:${w}px;height:${p.h}px">`);
}
// booth first so the tools and cups sit in front of it

const cellW = 920 / strip.length;
const stripCells = [];
for (const [i, [id, label, q]] of strip.entries()) {
	const ih = { dispenser: 78, shaker: 64, 'teko-takar': 62, timbangan: 74, termometer: 62, 'botol-susu': 76, jigger: 50 }[id];
	const { uri, w } = await png64(`static/img/kit/${id}.webp`, ih);
	const cx = 80 + cellW * i + cellW / 2;
	stripCells.push(
		`<img src="${uri}" alt="" style="position:absolute;left:${Math.round(cx - w / 2)}px;top:${1146 - ih}px;width:${w}px;height:${ih}px">` +
			`<p style="position:absolute;left:${Math.round(cx - cellW / 2)}px;top:1156px;width:${Math.round(cellW)}px;text-align:center;font-family:figtree,sans-serif;font-weight:700;font-size:14px;line-height:18px;color:#143F31;margin:0">${label}${q > 1 ? `<span style="color:#9a7a34"> ×${q}</span>` : ''}</p>`
	);
}

const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<meta name="hz:slide-selector" content=".slide">
<meta name="viewport" content="width=${W}">
<title>Chacha Paket Lengkap — Poster B</title>
<link rel="stylesheet" href="https://use.typekit.net/avz3syv.css">
<style>
html,body{margin:0;padding:0;background:#123b2e}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#123b2e}
.slide p,.slide h1{margin:0}
</style></head>
<body>
<section class="slide" data-canvas-width="${W}" data-canvas-height="${H}">
	<img src="${bgUri}" alt="" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">

	<img src="${logoUri}" alt="Chacha Fresh Drink &amp; Milk Tea" style="position:absolute;left:64px;top:60px;width:200px;height:52px">
	<p style="position:absolute;left:776px;top:66px;width:240px;height:44px;box-sizing:border-box;border:1.5px solid #E6C77D;border-radius:22px;text-align:center;font-family:figtree,sans-serif;font-weight:700;font-size:15px;line-height:41px;letter-spacing:3px;color:#E6C77D">PAKET LENGKAP</p>

	<h1 style="position:absolute;left:62px;top:150px;width:760px;font-family:figtree,sans-serif;font-weight:800;font-size:90px;line-height:92px;letter-spacing:-3px;color:#F5EEE3">Tinggal pasang,</h1>
	<p style="position:absolute;left:62px;top:238px;width:760px;font-family:cormorant-garamond,serif;font-style:italic;font-weight:600;font-size:110px;line-height:112px;letter-spacing:-1px;color:#E6C77D">langsung jualan.</p>
	<p style="position:absolute;left:66px;top:368px;width:640px;font-family:figtree,sans-serif;font-weight:500;font-size:21px;line-height:30px;color:#cfe0d6">Booth, alat, dan bahan baku dikirim ke lokasimu.<br>Kamu tinggal siapkan tempatnya.</p>

	${stageImgs.join('\n\t')}

	<!-- price seal -->
	<div style="position:absolute;left:822px;top:330px;width:196px;height:196px;border-radius:98px;background:#E6C77D;transform:rotate(-8deg)">
		<p style="position:absolute;left:0;top:38px;width:196px;text-align:center;font-family:figtree,sans-serif;font-weight:800;font-size:16px;line-height:18px;letter-spacing:3px;color:#143F31">MULAI</p>
		<p style="position:absolute;left:0;top:58px;width:196px;text-align:center;font-family:figtree,sans-serif;font-weight:900;font-size:76px;line-height:76px;letter-spacing:-3px;color:#143F31">8,5</p>
		<p style="position:absolute;left:0;top:136px;width:196px;text-align:center;font-family:figtree,sans-serif;font-weight:800;font-size:20px;line-height:22px;letter-spacing:1px;color:#143F31">JUTA</p>
	</div>

	<!-- contents card -->
	<div style="position:absolute;left:48px;top:1010px;width:984px;height:282px;border-radius:32px;background:#F5EEE3"></div>
	<p style="position:absolute;left:80px;top:1034px;width:400px;font-family:figtree,sans-serif;font-weight:800;font-size:14px;line-height:18px;letter-spacing:3px;color:#9a7a34">ISI PAKET LENGKAP</p>
	<p style="position:absolute;left:500px;top:1033px;width:500px;text-align:right;font-family:figtree,sans-serif;font-weight:700;font-size:16px;line-height:20px;color:#143F31">Booth + 19 alat + bahan baku 100 cup</p>
	<div style="position:absolute;left:80px;top:1062px;width:920px;height:1px;background:#d9cfbd"></div>
	${stripCells.join('\n\t')}

	<div style="position:absolute;left:72px;top:1200px;width:936px;height:68px;border-radius:30px;background:#143F31"></div>
	<p style="position:absolute;left:104px;top:1222px;width:470px;font-family:figtree,sans-serif;font-weight:700;font-size:21px;line-height:24px;color:#F5EEE3">Tanya harga &amp; promo bulan ini</p>
	<div style="position:absolute;left:744px;top:1208px;width:256px;height:52px;border-radius:22px;background:#E6C77D"></div>
	<p style="position:absolute;left:744px;top:1222px;width:256px;text-align:center;font-family:figtree,sans-serif;font-weight:800;font-size:19px;line-height:24px;color:#143F31">WhatsApp · chacha.id</p>
</section>
</body></html>`;

writeFileSync(`${here}/poster.html`, html);
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=2', `--window-size=${W},${H}`, '--virtual-time-budget=8000', `--screenshot=${here}/preview.png`, `file://${here}/poster.html`], { stdio: 'ignore' });
console.log('ok', (html.length / 1024 / 1024).toFixed(2) + ' MB html');
