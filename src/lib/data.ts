// WhatsApp Business number (country code, no +).
export const WA_NUMBER = '6282246632200';

export const SITE_URL = 'https://www.chachatea.id';

export const waLink = (message: string) =>
	`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

export const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export const jutaan = (n: number) =>
	(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';

// ── Menu ──────────────────────────────────────────────────────────────────────
// Names, prices, best sellers and tea groupings follow the printed menu.

export type Category = 'Milk Tea' | 'Matcha' | 'Fresh Drink';

export type Drink = {
	slug: string; // image at /img/site/drinks/<slug>.webp
	name: string;
	category: Category;
	base?: string; // tea group on the printed menu
	price: number;
	best?: boolean;
};

export const categories: Category[] = ['Milk Tea', 'Matcha', 'Fresh Drink'];

export const drinks: Drink[] = [
	{ slug: 'classic-milk-tea', name: 'Classic Milk Tea', category: 'Milk Tea', base: 'Premium Black Tea', price: 14000, best: true },
	{ slug: 'classic-jelly-milk-tea', name: 'Classic Jelly Milk Tea', category: 'Milk Tea', base: 'Premium Black Tea', price: 16000 },
	{ slug: 'premium-oolong-milk-tea', name: 'Premium Oolong Milk Tea', category: 'Milk Tea', base: 'Red Oolong', price: 16000, best: true },
	{ slug: 'red-oolong-milk-tea', name: 'Red Oolong Milk Tea', category: 'Milk Tea', base: 'Red Oolong', price: 16000 },
	{ slug: 'jasmine-milk-tea', name: 'Jasmine Milk Tea', category: 'Milk Tea', base: 'Jasmine', price: 14000, best: true },
	{ slug: 'peach-oolong-milk-tea', name: 'Peach Oolong Milk Tea', category: 'Milk Tea', base: 'Premium Oolong', price: 15000 },
	{ slug: 'classic-matcha', name: 'Classic Matcha', category: 'Matcha', price: 14000, best: true },
	{ slug: 'crumble-matcha', name: 'Crumble Matcha', category: 'Matcha', price: 15000, best: true },
	{ slug: 'coconut-matcha', name: 'Coconut Matcha', category: 'Matcha', price: 15000 },
	{ slug: 'ube-cream-matcha', name: 'Ube Cream Matcha', category: 'Matcha', price: 15000 },
	{ slug: 'caramel-matcha', name: 'Caramel Matcha', category: 'Matcha', price: 15000 },
	{ slug: 'creamy-matcha', name: 'Creamy Matcha', category: 'Matcha', price: 14000 },
	{ slug: 'jasmine-tea', name: 'Jasmine Tea', category: 'Fresh Drink', price: 12000 },
	{ slug: 'peach-oolong-tea', name: 'Peach Oolong Tea', category: 'Fresh Drink', price: 12000, best: true },
	{ slug: 'mango-tea', name: 'Mango Tea', category: 'Fresh Drink', price: 12000 }
];

/** Tea shots shown above each menu group. */
export const teaBases = {
	'Milk Tea': [
		{ img: 'premium-black-tea', name: 'Premium Black Tea', leaf: 'orange pekoe' },
		{ img: 'red-oolong', name: 'Red Oolong', leaf: 'roasted oolong' },
		{ img: 'jasmine', name: 'Jasmine', leaf: 'jasmine tea' },
		{ img: 'premium-oolong', name: 'Premium Oolong', leaf: 'rolled oolong' }
	],
	Matcha: [{ img: 'matcha', name: 'Matcha', leaf: 'green tea powder' }],
	'Fresh Drink': [{ img: 'premium-oolong', name: 'Premium Oolong', leaf: 'rolled oolong' }]
};

export const sugarLevels = [
	{ value: '100%', note: 'Normal' },
	{ value: '50%', note: 'Less sweet' }
];

export const iceLevels = [
	{ value: 'Normal', note: 'Regular ice' },
	{ value: 'Less', note: 'Less ice' }
];

/**
 * Tea selection on the home page.
 * TASTING SIGN-OFF: leaf types and brew colours come from the menu and photos, but the aroma and
 * taste sentences have not been checked by someone who has tasted these teas.
 */
export const teas = [
	{ img: 'four-seasons', name: 'Four Seasons Oolong', desc: 'Oolong daun gulung, seduhannya jingga keemasan. Wangi bunganya segar, dengan rasa manis di akhir.' },
	{ img: 'premium-oolong', name: 'Premium Oolong', desc: 'Oolong daun gulung, seduhannya kuning madu. Wanginya lembut dan rasanya ringan.' },
	{ img: 'red-oolong', name: 'Red Oolong', desc: 'Oolong panggang, seduhannya merah gelap. Aroma panggangnya kuat dan rasanya tebal.' },
	{ img: 'black', name: 'Premium Black Tea', desc: 'Orange pekoe, seduhannya merah tembaga. Rasa tehnya tegas, tetap terasa walau dicampur susu.' },
	{ img: 'jasmine', name: 'Jasmine', desc: 'Teh melati, seduhannya kuning keemasan. Wangi melatinya muncul duluan, rasanya ringan.' },
	{ img: 'matcha', name: 'Matcha', desc: 'Bubuk teh hijau, warnanya hijau terang. Rasanya segar dengan pahit tipis di akhir.' }
];

// Fill these in and the home and menu pages show them. Empty lists stay hidden.
export const outlets: { name: string; address: string; hours: string; map: string }[] = [];
export const orderLinks: { label: string; href: string }[] = [];
export const socials: { label: string; href: string }[] = [];

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
		price: 4_500_000,
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

export const faqs = [
	{
		q: 'Boleh tanya-tanya dulu tanpa langsung daftar?',
		a: 'Boleh banget. Banyak yang ngobrol dengan kami berminggu-minggu dulu sebelum memutuskan. Tidak ada yang akan memaksa kamu, dan tidak ada "slot terakhir hari ini".'
	},
	{
		q: 'Ada royalti atau biaya bulanan?',
		a: 'Tidak ada royalti, dan kami tidak mengambil potongan dari omzetmu. Yang rutin hanya belanja bahan baku dan cup dari kami, supaya rasa di semua outlet sama. Kalau ada biaya lain, kami tulis di proposal sebelum kamu membayar apa pun.'
	},
	{
		q: 'Aku belum pernah jualan minuman. Bisa?',
		a: 'Bisa. Kebanyakan yang menghubungi kami juga belum pernah. Resepnya kami ajarkan sampai kamu bisa membuatnya tanpa melihat catatan, dan ada video SOP yang bisa diputar ulang kapan saja.'
	},
	{
		q: 'Lokasi seperti apa yang cocok?',
		a: 'Tempat yang ramai orang lewat dan belum banyak penjual milk tea: depan sekolah, dekat kampus, gerbang perumahan, area kantor. Kirim saja foto lokasinya ke WhatsApp. Kami beri pendapat jujur, termasuk kalau menurut kami kurang cocok.'
	},
	{
		q: 'Kalau ada mitra Chacha lain buka dekat lokasiku?',
		a: 'Tidak akan dalam radius 1 km. Sebelum menerima mitra baru, kami cek dulu siapa saja yang sudah ada di area itu.'
	},
	{
		q: 'Berapa lama sampai booth tiba di lokasi?',
		a: 'Biasanya 7–14 hari kerja setelah pelunasan. Untuk luar Jawa kami kirim lewat kargo. Ongkirnya dihitung terpisah dan kami kabari di awal, bukan belakangan.'
	},
	{
		q: 'Setelah buka, kewajibanku apa saja?',
		a: 'Mengambil bahan baku dan cup dari kami, dan mengikuti resep yang sudah diajarkan. Selebihnya usaha itu milikmu: jam buka, karyawan, promo di sekitar lokasi, kamu yang atur.'
	},
	{
		q: 'Angka di kalkulator itu pasti?',
		a: 'Tidak. Itu hitungan kasar supaya kamu punya gambaran. Hasil sebenarnya tergantung lokasi, harga sewa, dan seberapa konsisten kamu buka. Kami lebih senang kamu mulai dengan harapan yang realistis.'
	}
];

// ── Promo & conversion ────────────────────────────────────────────────────────
// Only show a strikethrough price (`was` on a package) or a slot count if it is true:
// a fake "normal price" or fake scarcity is misleading and can get Meta ads rejected.
export const promo = {
	cta: 'Tanya Dulu di WhatsApp, Gratis',
	ctaShort: 'Tanya Dulu di WhatsApp',
	message: 'Halo Kak, saya lihat website Chacha. Mau tanya-tanya soal kemitraan dan promo bulan ini.',
	/** e.g. 'Promo bulan ini: gratis 50 cup custom tambahan' — leave empty to hide the ribbon. */
	ribbon: 'Bulan ini ada promo untuk mitra baru. Tanya saja dulu',
	/** Remaining partner slots this month; null hides the counter. */
	slotsLeft: null as number | null
};

export const ticker = [
	'Tanpa royalti',
	'Booth tiba 7–14 hari kerja',
	'Tidak ada mitra lain dalam 1 km',
	'Resep diajarkan sampai bisa',
	'Bahan baku untuk 100 cup pertama',
	'Boleh tanya dulu, tanpa komitmen'
];

/** Equipment shown in the "Isi paket" unboxing. `img` is a background-removed cutout in static/img/kit. */
export const kitItems = [
	{ id: 'dispenser', name: 'Dispenser Minuman', spec: '8 liter', qty: 2, tip: 'Teh tetap di suhu yang pas dari buka sampai tutup.' },
	{ id: 'teko-takar', name: 'Teko Takar', spec: '2000 ml', qty: 1, tip: 'Buat menyeduh teh satu batch untuk seharian.' },
	{ id: 'shaker', name: 'Shaker', spec: '500 ml', qty: 2, tip: 'Dikocok 10 detik, milk tea jadi lembut.' },
	{ id: 'jigger', name: 'Jigger', spec: 'takaran presisi', qty: 2, tip: 'Supaya cup ke-1 dan cup ke-100 rasanya sama.' },
	{ id: 'botol-uht', name: 'Botol Kotak UHT', spec: '1 liter', qty: 2, tip: 'Simpan susu rapi di dalam cooler.' },
	{ id: 'botol-susu', name: 'Botol Susu', spec: 'squeeze', qty: 2, tip: 'Tuang susu kental dan saus dengan rapi.' },
	{ id: 'pompa-botol', name: 'Pompa Botol Sirup', spec: 'dosis tetap', qty: 2, tip: 'Sekali tekan, takarannya pas. Sangat membantu saat antre.' },
	{ id: 'pompa-air', name: 'Pompa Air', spec: 'elektrik', qty: 1, tip: 'Tidak perlu mengangkat galon lagi.' },
	{ id: 'saringan', name: 'Saringan Teh', spec: 'kain halus', qty: 1, tip: 'Teh jernih tanpa ampas.' },
	{ id: 'sendok-panjang', name: 'Sendok Panjang', spec: 'stainless', qty: 2, tip: 'Aduk sampai dasar cup.' },
	{ id: 'storage-box', name: 'Storage Box', spec: 'food grade', qty: 1, unit: 'set', tip: 'Simpan topping dan jelly tetap segar.' },
	{ id: 'timbangan', name: 'Timbangan Digital', spec: '+ timer', qty: 1, tip: 'Takaran teh sampai hitungan gram.' },
	{ id: 'termometer', name: 'Termometer Infrared', spec: 'tanpa sentuh', qty: 1, tip: 'Cek suhu seduhan tanpa menyentuh.' }
];

/** Also in the package but not photographed yet. */
export const kitExtras = ['Gelas takar 1000 ml', 'Botol teh (2)', 'Toples teh', 'Storage box jelly (2)', 'Cetakan jelly (1 set)', 'Centong jelly'];

/**
 * Partnership packages from the 2026 sales material. `price: null` renders a placeholder until
 * pricing is final.
 */
export const offers = [
	{
		id: 'peralatan',
		name: 'Paket 1',
		title: 'Peralatan Minuman',
		price: null as number | null,
		blurb: 'Buat kamu yang sudah punya meja, warung, atau kafe. Tinggal tambah menu Chacha.',
		includes: ['Peralatan minuman lengkap (19 item)', 'Resep & SOP Chacha', 'Akses bahan baku resmi Chacha'],
		excludes: ['Booth Chacha', 'Sealer cup'],
		message: 'Halo Kak, saya tertarik Paket 1 (peralatan saja). Boleh tahu harga dan isinya?'
	},
	{
		id: 'lengkap',
		name: 'Paket Lengkap',
		title: 'Siap Jualan',
		price: null as number | null,
		featured: true,
		blurb: 'Buat kamu yang mulai dari nol. Booth datang, alat lengkap, bahan baku cukup untuk 100 cup pertama.',
		includes: ['Booth Chacha 110 × 55 × 80 cm', 'Peralatan minuman lengkap', 'Sealer cup, timbangan & termometer', 'Bahan baku untuk 100 cup', 'Cup Chacha siap pakai'],
		excludes: [] as string[],
		message: 'Halo Kak, saya tertarik Paket Lengkap (booth + alat + bahan baku). Boleh tahu harga dan promonya?'
	}
];

/**
 * Social-proof slots. `src: null` renders a labelled placeholder that tells the team exactly
 * which real photo to shoot. Never fill these with another brand's photos.
 */
/**
 * LOCAL CONCEPT ONLY: third-party reference photo shown in an empty slot on the dev server, so the
 * layout can be judged with people in it. Returns null in production builds, where slots fall back
 * to their labelled placeholder. Files live in git-ignored static/ref/ (see scripts/ref-crops.mjs).
 */
export const ref = (name: string): string | null => (import.meta.env.DEV ? `/ref/crop/${name}.webp` : null);

export const proof = [
	{ src: null, ref: ref('queue-tall'), brief: 'Foto: pembeli antre memegang cup Chacha', cap: 'Antre di booth mitra', span: 'tall' },
	{ src: null, ref: ref('queue-wide'), brief: 'Foto: antrean pembeli di depan booth mitra', cap: 'Ramai sejak buka', span: 'wide' },
	{ src: '/img/g-duo.webp', ref: null, brief: '', cap: 'Cup premium, siap difoto', span: 'sq' },
	{ src: null, ref: ref('customer-right'), brief: 'Foto: pembeli menikmati Chacha, close-up wajah + cup', cap: 'Satu sedotan, langsung suka', span: 'sq' },
	{ src: null, ref: ref('crowd-group'), brief: 'Foto: rombongan teman berfoto dengan cup Chacha', cap: 'Diborong satu geng', span: 'sq' },
	{ src: null, ref: ref('courier'), brief: 'Foto: paket mitra dikirim dari gudang Chacha', cap: 'Paket dikirim tiap hari', span: 'sq' }
];

/** WhatsApp testimonial screenshots from real partners (with their permission). */
export const chats = [
	{ src: null as string | null, ref: ref('chat-1'), brief: 'Screenshot chat mitra: kabar hari pertama buka' },
	{ src: null as string | null, ref: ref('chat-2'), brief: 'Screenshot chat mitra: repeat order bahan baku' },
	{ src: null as string | null, ref: ref('chat-3'), brief: 'Screenshot chat mitra: omzet / antrean' }
];

// ── Human touch ───────────────────────────────────────────────────────────────
// Every `photo: null` renders a labelled slot. Fill with real Chacha people only.

/**
 * Track record: real photos from the team's existing outlet. They show another brand, so they are
 * always captioned as that outlet, never as a Chacha booth. Change `outlet` if the relationship
 * wording changes.
 */
export const trackRecord = {
	outlet: 'Mattchaboy',
	relation: 'dikelola tim yang sama',
	points: [
		'Resep dan cara kerja yang kami ajarkan dipakai setiap hari, bukan baru dicoba',
		'Kami pernah kewalahan saat jam pulang sekolah. Kami tahu cara menyiapkannya',
		'Yang mendampingimu nanti orang yang memang biasa berdiri di balik counter'
	],
	photos: [
		{ src: '/img/real/pelanggan-geng.webp', alt: 'Lima pelanggan berpose dengan minuman di depan outlet', note: 'Satu geng, satu kantong' },
		{ src: '/img/real/outlet-antre.webp', alt: 'Pelanggan duduk menunggu pesanan di depan booth', note: 'Sore hari, kursi penuh' },
		{ src: '/img/real/order-borongan.webp', alt: 'Belasan cup pesanan borongan siap diambil', note: 'Order 15 cup sekaligus' },
		{ src: '/img/real/pelanggan-duo.webp', alt: 'Dua pelanggan tersenyum memegang minuman', note: 'Balik lagi minggu depan' }
	]
};

/** People who answer WhatsApp. One number per person if available; falls back to WA_NUMBER. */
export const team = [
	{ name: 'Nama Admin', role: 'Bantu pilih paket & lokasi', hours: '08.00–21.00', photo: null as string | null, ref: ref('admin-1'), wa: null as string | null },
	{ name: 'Nama Admin', role: 'Dampingi sampai booth buka', hours: '08.00–17.00', photo: null as string | null, ref: ref('admin-2'), wa: null as string | null }
];
