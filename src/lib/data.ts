// Placeholder number — replace with the real WhatsApp Business number (country code, no +).
export const WA_NUMBER = '6281200000000';

export const waLink = (message: string) =>
	`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

export const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export const jutaan = (n: number) =>
	(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';

export type Drink = {
	name: string;
	category: 'Milk Tea' | 'Fruit Tea' | 'Signature';
	price: number;
	note: string;
	img: string;
	tint: string;
	photo?: boolean; // true once a real photo exists at `img`.webp
	liquid: [string, string, string];
	extra: 'boba' | 'tiger' | 'matcha' | 'peach' | 'lychee' | 'lemon' | 'jasmine';
};

export const drinks: Drink[] = [
	{
		name: 'Jasmine Milk Tea',
		category: 'Milk Tea',
		price: 18000,
		note: 'Teh melati diseduh segar, susu lembut, wangi yang tertinggal.',
		img: '/img/menu-jasmine',
		tint: '#E9DCC8',
		liquid: ['#E3CBA8', '#D9BC93', '#C9A77A'],
		extra: 'jasmine'
	},
	{
		name: 'Brown Sugar Milk',
		category: 'Milk Tea',
		price: 20000,
		note: 'Gula aren karamel yang melapisi gelas, susu dingin, boba kenyal.',
		img: '/img/menu-brownsugar',
		tint: '#E6D3BD',
		liquid: ['#E8D5B9', '#D8BC98', '#B98B5E'],
		extra: 'tiger'
	},
	{
		name: 'Matcha Latte',
		category: 'Signature',
		price: 22000,
		note: 'Matcha pekat di atas susu segar. Pahit manis yang seimbang.',
		img: '/img/menu-matcha',
		tint: '#DCE8DF',
		liquid: ['#7FA24A', '#B9CC8A', '#F4F0E6'],
		extra: 'matcha'
	},
	{
		name: 'Peach Oolong',
		category: 'Fruit Tea',
		price: 18000,
		note: 'Oolong panggang ringan dengan irisan persik segar.',
		img: '/img/menu-peach',
		tint: '#F1DCC6',
		liquid: ['#F4C58E', '#EDAE70', '#E39A5A'],
		extra: 'peach'
	},
	{
		name: 'Lychee Jasmine',
		category: 'Fruit Tea',
		price: 18000,
		note: 'Leci utuh dan teh melati. Manis yang bersih, ringan di akhir.',
		img: '/img/menu-lychee',
		tint: '#F0DEDA',
		liquid: ['#F6DCD6', '#EFC7C0', '#E7B3AC'],
		extra: 'lychee'
	},
	{
		name: 'Lemon Green Tea',
		category: 'Fruit Tea',
		price: 15000,
		note: 'Teh hijau segar, perasan lemon, penyegar paling ringan.',
		img: '/img/menu-lemon',
		tint: '#E8E6C8',
		liquid: ['#EBE4A0', '#DED483', '#CFC267'],
		extra: 'lemon'
	}
];

export type Pkg = {
	id: string;
	type: string;
	name: string;
	price: number | null;
	was?: number; // strikethrough "normal" price — only if it really applied before
	featured?: boolean;
	img: string;
	photo?: boolean; // true once a real booth photo exists at `img`.webp
	size: string;
	booth: string;
	equipment: string[];
	stock: string;
	pos: string[];
	marketing: string;
	training: string;
};

export const packages: Pkg[] = [
	{
		id: 'portable',
		type: 'Portable',
		name: 'Basic',
		price: 8_500_000,
		img: '/img/booth-portable',
		size: '100 cm · lipat',
		booth: 'Booth portable lipat 100 cm, finishing premium',
		equipment: ['Shaker', 'Sealer cup manual', 'Termos', 'Dispenser'],
		stock: '±150 cup bahan baku + 150 cup custom',
		pos: ['Tablet POS', 'Printer struk', 'Dudukan tablet'],
		marketing: 'X-banner + 1 template promo',
		training: 'Online + SOP video'
	},
	{
		id: 'booth-kecil',
		type: 'Booth Kecil',
		name: 'Standard',
		price: 11_500_000,
		featured: true,
		img: '/img/booth-kecil',
		size: '120 cm · kayu/HPL',
		booth: 'Booth kayu/HPL 120 cm, lampu LED, sign bulat',
		equipment: ['Semua isi Basic', 'Sealer semi-otomatis', 'Pompa sirup'],
		stock: '±250 cup bahan baku + 250 cup custom',
		pos: ['Tablet POS', 'Printer struk', 'Laci kasir'],
		marketing: 'X-banner + paket konten sosmed pembukaan',
		training: 'Online + SOP video'
	},
	{
		id: 'booth-plus',
		type: 'Booth Plus',
		name: 'Premium',
		price: 15_000_000,
		img: '/img/booth-plus',
		size: '150 cm · neon box',
		booth: 'Booth 150 cm, neon box, menu board',
		equipment: ['Semua isi Standard', 'Sealer otomatis', 'Freezer / cooler'],
		stock: '±400 cup bahan baku + 400 cup custom + paper bag',
		pos: ['Tablet POS', 'Printer struk', 'Laci kasir', 'Layar menu digital'],
		marketing: 'Iklan lokal pembukaan dibiayai pusat',
		training: 'Training langsung 1 hari'
	},
	{
		id: 'mall',
		type: 'Mall / Custom',
		name: 'Kiosk',
		price: null,
		img: '/img/booth-mall',
		size: 'Custom · sesuai aturan mall',
		booth: 'Kiosk custom sesuai aturan mall',
		equipment: ['Full set peralatan', 'Mesin tea brewer'],
		stock: 'Bahan baku & cup sesuai kontrak',
		pos: ['Set POS lengkap'],
		marketing: 'Grand opening',
		training: 'Training di lokasi'
	}
];

export const promises = [
	{
		n: '01',
		title: 'Tampilan kelas mall',
		body: 'Booth, cup dan menu board dirancang setara brand mall. Pembeli rela membayar Rp 15–22 ribu, bukan Rp 8 ribu.'
	},
	{
		n: '02',
		title: 'POS lengkap dengan perangkat',
		body: 'Tablet, printer struk dan perlengkapan kasir sudah termasuk. Langganan gratis 6 bulan pertama.'
	},
	{
		n: '03',
		title: 'Terima beres',
		body: 'Booth, alat, bahan baku awal, cup custom dan training. Datang, pasang, langsung jualan.'
	},
	{
		n: '04',
		title: 'Tanpa royalti',
		body: 'Tidak ada potongan omzet. Kewajiban Anda hanya mengambil bahan baku dari pusat.'
	}
];

export const steps = [
	{ t: 'Chat WhatsApp', d: 'Ceritakan kota, rencana lokasi dan budget Anda.' },
	{ t: 'Proposal & video', d: 'Kami kirim proposal lengkap: paket, foto booth, simulasi.' },
	{ t: 'Konsultasi 10 menit', d: 'Telepon singkat untuk membantu memilih paket dan lokasi.' },
	{ t: 'DP 50% & perjanjian', d: 'Tanda tangan perjanjian kemitraan, booth mulai diproduksi.' },
	{ t: 'Pelunasan & kirim', d: 'Paket lengkap dikirim, estimasi 7–14 hari kerja.' },
	{ t: 'Training & buka', d: 'Training resep, kebersihan dan POS. Booth Anda siap buka.' }
];

export const faqs = [
	{
		q: 'Apakah ada royalti atau biaya bulanan?',
		a: 'Tidak ada royalti dan tidak ada potongan omzet. Satu-satunya biaya rutin adalah langganan POS setelah 6 bulan gratis. Besarannya kami tulis terang di proposal, tanpa biaya tersembunyi.'
	},
	{
		q: 'Apa kewajiban mitra setelah booth buka?',
		a: 'Mengambil bahan baku dan cup dari pusat agar rasa dan tampilan di semua outlet tetap sama. Logo dan SOP tetap milik pusat.'
	},
	{
		q: 'Apakah wilayah saya dilindungi?',
		a: 'Ya. Kami menjaga jarak minimal 1 km antar mitra Chacha agar setiap outlet punya pasarnya sendiri.'
	},
	{
		q: 'Berapa lama sampai booth bisa buka?',
		a: 'Setelah pelunasan, paket dikirim dalam estimasi 7–14 hari kerja. Pengiriman ke luar Jawa memakai ekspedisi kargo; ongkir dihitung terpisah.'
	},
	{
		q: 'Saya belum pernah usaha minuman. Apakah bisa?',
		a: 'Bisa. Setiap paket sudah termasuk training dan SOP video. Satu minuman dibuat dalam kurang dari satu menit, dan POS membantu mencatat stok serta penjualan.'
	},
	{
		q: 'Lokasi seperti apa yang cocok?',
		a: 'Sekolah, kampus, perumahan, perkantoran, dan kota yang belum dijangkau gerai milk tea besar. Kirim foto lokasi Anda, tim kami bantu menilai sebelum Anda memutuskan.'
	},
	{
		q: 'Apakah hasil di kalkulator dijamin?',
		a: 'Tidak. Kalkulator memakai asumsi rata-rata untuk gambaran awal. Hasil nyata bergantung pada lokasi, harga jual, biaya sewa dan konsistensi operasional.'
	}
];

// ── Promo & conversion ────────────────────────────────────────────────────────
// Only show a strikethrough price (`was` on a package) or a slot count if it is true:
// a fake "normal price" or fake scarcity is misleading and can get Meta ads rejected.
export const promo = {
	cta: 'Gabung Kemitraan, Ambil Promonya',
	ctaShort: 'Gabung & Ambil Promonya',
	message: 'Halo Chacha, saya mau gabung kemitraan dan ambil promonya. Boleh info paket & promo bulan ini?',
	/** e.g. 'Promo bulan ini: gratis 50 cup custom tambahan' — leave empty to hide the ribbon. */
	ribbon: 'Promo mitra baru bulan ini, tanya detailnya via WhatsApp',
	/** Remaining partner slots this month; null hides the counter. */
	slotsLeft: null as number | null
};

export const ticker = [
	'Tanpa royalti',
	'POS + tablet termasuk',
	'Gratis langganan POS 6 bulan',
	'Booth jadi 7–14 hari kerja',
	'Perlindungan zona 1 km',
	'Training & SOP video',
	'Cup custom premium',
	'Bahan baku awal termasuk'
];

/** "Isi paket" flat-lay tiles (Standard package). */
export const kit = [
	{ icon: 'booth', t: 'Booth 120 cm', d: 'Kayu/HPL, lampu LED, sign bulat' },
	{ icon: 'pos', t: 'Tablet POS', d: 'Kasir, stok & laporan penjualan' },
	{ icon: 'printer', t: 'Printer struk', d: '+ laci kasir' },
	{ icon: 'sealer', t: 'Sealer cup', d: 'Semi-otomatis, rapi & anti tumpah' },
	{ icon: 'shaker', t: 'Shaker & alat', d: 'Termos, dispenser, pompa sirup' },
	{ icon: 'cup', t: '250 cup custom', d: 'Desain premium Chacha' },
	{ icon: 'tea', t: 'Bahan baku awal', d: '±250 cup siap jual' },
	{ icon: 'training', t: 'Training + SOP', d: 'Resep, kebersihan, POS' }
];

export const compare = {
	cols: ['Chacha', 'Kemitraan biasa'],
	rows: [
		{ k: 'Tampilan booth & cup', a: 'Setara brand mall', b: 'Booth standar' },
		{ k: 'POS + tablet', a: 'Termasuk, gratis 6 bulan', b: 'Jarang disediakan' },
		{ k: 'Royalti bulanan', a: 'Tidak ada', b: 'Bervariasi' },
		{ k: 'Harga jual menu', a: 'Rp 15–22 ribu', b: 'Rp 8–12 ribu' },
		{ k: 'Perlindungan wilayah', a: 'Zona 1 km', b: 'Tidak selalu ada' },
		{ k: 'Laporan penjualan', a: 'Otomatis dari POS', b: 'Catat manual' }
	]
};

/**
 * Social-proof slots. `src: null` renders a labelled placeholder that tells the team exactly
 * which real photo to shoot. Never fill these with another brand's photos.
 */
export const proof = [
	{ src: '/img/g-interior.webp', brief: 'Outlet mitra ramai pembeli', cap: 'Suasana booth Chacha', span: 'tall' },
	{ src: null, brief: 'Foto: antrean pembeli di depan booth mitra', cap: 'Antrean di booth mitra', span: 'wide' },
	{ src: '/img/g-duo.webp', brief: '', cap: 'Cup premium, siap difoto', span: 'sq' },
	{ src: null, brief: 'Foto: mitra berdiri di depan booth barunya', cap: 'Mitra baru buka', span: 'sq' },
	{ src: '/img/g-clear.webp', brief: '', cap: 'Fruit tea segar', span: 'sq' },
	{ src: null, brief: 'Foto: unboxing paket mitra (semua isi dijejer)', cap: 'Isi paket saat tiba', span: 'sq' }
] as const;

/** WhatsApp testimonial screenshots from real partners (with their permission). */
export const chats = [
	{ src: null as string | null, brief: 'Screenshot chat mitra: kabar hari pertama buka' },
	{ src: null as string | null, brief: 'Screenshot chat mitra: repeat order bahan baku' },
	{ src: null as string | null, brief: 'Screenshot chat mitra: omzet / antrean' }
];
