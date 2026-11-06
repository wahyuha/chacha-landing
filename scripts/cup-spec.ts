// Page 2 of the cup print PDF: colour codes, fonts and printing notes in Indonesian.
// All text is set as outlines (like the artwork) so the page looks the same on any printer.
import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import { cmdsToD } from './logo.ts';

type Face = 'body' | 'bodyBold' | 'bodySemi' | 'mont700' | 'mont600';
const files: Record<Face, string> = {
	body: 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff',
	bodySemi: 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff',
	bodyBold: 'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff',
	mont700: 'node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff',
	mont600: 'node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff'
};
const cache: Partial<Record<Face, ReturnType<typeof opentype.parse>>> = {};
const face = (f: Face) => (cache[f] ??= opentype.parse(readFileSync(files[f]).buffer as ArrayBuffer));

/** Text as an outlined path. `size` is the font size in mm; `track` adds letter-spacing in em. */
function text(str: string, x: number, y: number, size: number, f: Face, color: string, track = 0) {
	const font = face(f);
	const scale = size / font.unitsPerEm;
	let d = '';
	let gx = x;
	for (const ch of str) {
		const g = font.charToGlyph(ch);
		d += cmdsToD(g.getPath(gx, y, size).commands as Parameters<typeof cmdsToD>[0]);
		gx += (g.advanceWidth ?? 0) * scale + track * size;
	}
	return `<path d="${d}" fill="${color}"/>`;
}

export type SpecInput = {
	pageW: number;
	pageH: number;
	mockupPng: string;
	cup: { topDiameter: number; bottomDiameter: number; height: number; rimMargin: number; bottomSafe: number; fold: number; overlap: number; bleed: number };
	logoCapMm: number;
	logoWidthMm: number;
	ringTextMm: number;
	variant: 'forest' | 'cream';
};

const INK = '#26302B';
const MUTED = '#5E6A63';
const FOREST = '#143F31';
const GOLD = '#D9B869';
const CREAM = '#F3EBDD';

const CREAM_SWATCHES = [
	{ hex: '#F4EDE1', name: 'Krem Pagi', rgb: '244 · 237 · 225', cmyk: 'C3 M6 Y12 K0', pantone: 'Pantone 9224 C (terdekat)', use: 'Warna dasar seluruh cup' },
	{ hex: '#1D5A45', name: 'Hijau Hutan', rgb: '29 · 90 · 69', cmyk: 'C82 M35 Y72 K28', pantone: 'Pantone 3425 C (terdekat)', use: 'Logo CHACHA, garis ilustrasi gunung, awan dan sulur melati' },
	{ hex: '#C9A24E', name: 'Emas', rgb: '201 · 162 · 78', cmyk: 'C20 M35 Y80 K5', pantone: 'atau hot-foil emas (Pantone 871 C)', use: 'Tagline, matahari, bintang, garis dan ring bawah' }
];

export function specSvg(s: SpecInput) {
	const M = 16;
	const img = readFileSync(s.mockupPng).toString('base64');
	const imgH = s.pageH - 2 * M - 8; // leaves a line under the image for the caption
	const imgW = (imgH * 1500) / 2100;
	const colW = s.pageW - 3 * M - imgW;
	let y = M + 8;
	const out: string[] = [];
	const line = (str: string, size = 2.9, f: Face = 'body', color = INK, dx = 0, lead = 4.3) => {
		out.push(text(str, M + dx, y, size, f, color));
		y += lead;
	};
	const heading = (str: string) => {
		y += 3.5;
		out.push(text(str.toUpperCase(), M, y, 2.6, 'bodyBold', '#426553', 0.16));
		out.push(`<rect x="${M}" y="${y + 1.8}" width="${colW}" height="0.25" fill="#E4D8C4"/>`);
		y += 7;
	};

	// title
	out.push(text('Spesifikasi Desain Cup', M, y, 8.2, 'bodyBold', FOREST, -0.01));
	y += 7;
	line(`CHACHA · Paper cup 16 oz · Desain ${s.variant === 'cream' ? 'Krem Pagi' : 'Hijau Hutan'}`, 3.2, 'bodySemi', MUTED, 0, 3);

	// size
	heading('Ukuran');
	const c = s.cup;
	line(`Diameter atas ${c.topDiameter} mm · diameter bawah ${c.bottomDiameter} mm · tinggi ${c.height} mm`);
	line(`Lipatan dasar ${c.fold} mm · overlap lem ${c.overlap} mm · bleed ${c.bleed} mm`);
	line(`Zona aman: ${c.rimMargin} mm di bawah bibir cup, ${c.bottomSafe} mm di atas dasar cup`);
	line(`Logo di cup: lebar ± ${Math.round(s.logoWidthMm)} mm, tinggi huruf ± ${s.logoCapMm.toFixed(1).replace('.', ',')} mm`);

	// colours
	heading('Warna');
	const swatches = s.variant === 'cream' ? CREAM_SWATCHES : [
		{
			hex: FOREST,
			name: 'Hijau Hutan',
			rgb: '20 · 63 · 49',
			cmyk: 'C85 M45 Y75 K45',
			pantone: 'Pantone 3435 C (terdekat)',
			use: 'Warna dasar seluruh cup dan teks chacha.id'
		},
		{
			hex: GOLD,
			name: 'Emas',
			rgb: '217 · 184 · 105',
			cmyk: 'C15 M28 Y70 K0',
			pantone: 'atau hot-foil emas (Pantone 871 C)',
			use: 'Logo, garis ilustrasi, matahari, ring bawah'
		},
		{
			hex: CREAM,
			name: 'Krem Melati',
			rgb: '243 · 235 · 221',
			cmyk: 'C3 M6 Y12 K0',
			pantone: '',
			use: 'Isi kelopak bunga melati'
		}
	];
	for (const sw of swatches) {
		const top = y - 3.2;
		out.push(`<rect x="${M}" y="${top}" width="15" height="15" rx="2.5" fill="${sw.hex}" stroke="#D8CCB8" stroke-width="0.25"/>`);
		out.push(text(sw.name, M + 19, y, 3.3, 'bodyBold', INK));
		out.push(text(`HEX ${sw.hex}   ·   RGB ${sw.rgb}`, M + 19, y + 4.4, 2.7, 'bodySemi', INK));
		out.push(text(`CMYK (perkiraan) ${sw.cmyk}${sw.pantone ? '   ·   ' + sw.pantone : ''}`, M + 19, y + 8.4, 2.7, 'body', INK));
		out.push(text(sw.use, M + 19, y + 12.2, 2.6, 'body', MUTED));
		y += 19;
	}

	// fonts
	heading('Font');
	const fonts: [string, string, string, Face, number, number][] = [
		['Logo CHACHA', 'Montserrat Bold (700) · huruf A terakhir digambar khusus (leaf-A)', 'CHACHA', 'mont700', 0.02, 4.6],
		['FRESH DRINK & MILK TEA', 'Montserrat SemiBold (600) · spasi huruf lebar', 'FRESH DRINK & MILK TEA', 'mont600', 0.28, 2.6],
		['chacha.id', `Plus Jakarta Sans SemiBold (600) · ± 7 pt · spasi huruf 0,3 em`, 'chacha.id', 'bodySemi', 0.3, 3.8]
	];
	for (const [label, desc, sample, f, tr, size] of fonts) {
		out.push(text(sample, M, y + 1, size, f, FOREST, tr));
		out.push(text(label, M + 62, y - 0.6, 2.9, 'bodyBold', INK));
		out.push(text(desc, M + 62, y + 3.6, 2.6, 'body', MUTED));
		y += 10.5;
	}
	line('Semua teks sudah diubah ke outline, jadi percetakan tidak perlu menginstal font.', 2.6, 'body', MUTED);
	line('Font gratis dari Google Fonts (lisensi SIL Open Font License).', 2.6, 'body', MUTED);

	// print notes
	heading('Catatan cetak');
	line('• Kode CMYK adalah perkiraan. Cocokkan warna dengan proof cetak sebelum produksi massal.', 2.7);
	line('• Emas bisa dicetak CMYK atau hot-foil. Untuk foil pakai file foil-plate (hitam = area foil).', 2.7);
	line('• Sesuaikan ukuran dengan die-line dari supplier cup sebelum dicetak.', 2.7);

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${s.pageW}mm" height="${s.pageH}mm" viewBox="0 0 ${s.pageW} ${s.pageH}">
<rect width="100%" height="100%" fill="#FBF7F0"/>
${out.join('\n')}
<rect x="${s.pageW - M - imgW}" y="${M}" width="${imgW}" height="${imgH}" rx="4" fill="#F1F3EF"/>
<image x="${s.pageW - M - imgW}" y="${M}" width="${imgW}" height="${imgH}" xlink:href="data:image/png;base64,${img}"/>
${text('Mockup untuk referensi, bukan file cetak', s.pageW - M - imgW, s.pageH - M - 2, 2.4, 'body', MUTED)}
</svg>`;
}
