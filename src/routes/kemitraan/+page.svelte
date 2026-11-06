<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import CupShowcase from '$lib/components/CupShowcase.svelte';
	import MenuSection from '$lib/components/MenuSection.svelte';
	import Packages from '$lib/components/Packages.svelte';
	import Calculator from '$lib/components/Calculator.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Closing from '$lib/components/Closing.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Ticker from '$lib/components/Ticker.svelte';
	import Kit from '$lib/components/Kit.svelte';
	import StickyCta from '$lib/components/StickyCta.svelte';
	import PosterShare from '$lib/components/PosterShare.svelte';
	import TeamChat from '$lib/components/TeamChat.svelte';
	import { SITE_URL, faqs, packages, waLink } from '$lib/data';

	const title = 'Kemitraan Chacha | Mulai Rp 4,5 Juta';
	const description =
		'Punya usaha milk tea sendiri bersama Chacha. Booth, alat, dan bahan baku dikirim ke lokasimu, resepnya diajarkan sampai bisa. Tanpa royalti. Tanya dulu lewat WhatsApp.';
	const url = `${SITE_URL}/kemitraan`;

	const jsonld = [
		...packages
			.filter((p) => p.price)
			.map((p) => ({
				'@context': 'https://schema.org',
				'@type': 'Product',
				name: `Paket Kemitraan Chacha ${p.name} (${p.type})`,
				description: p.booth,
				brand: { '@type': 'Brand', name: 'Chacha' },
				offers: { '@type': 'Offer', price: p.price, priceCurrency: 'IDR', availability: 'https://schema.org/InStock' }
			})),
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
		}
	];
	const ld = `<script type="application/ld+json">${JSON.stringify(jsonld)}</` + 'script>';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<link rel="preload" as="image" href="/img/g-interior.webp" fetchpriority="high" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content="{SITE_URL}/og.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	{@html ld}
</svelte:head>

<Nav cta={{ label: 'Tanya Dulu', href: waLink('Halo Kak, saya mau tanya-tanya soal kemitraan Chacha.'), external: true }} />
<main>
	<Hero />
	<!-- Hidden for now: RealOutlet (Foto asli dari outlet kami) and Proof (Bikin Ketagihan, Kata mereka yang sudah jualan). Import and place them here to bring them back. -->
	<Ticker />
	<Kit />
	<Packages />
	<PosterShare />
	<Calculator />
	<MenuSection />
	<CupShowcase />
	<TeamChat />
	<Faq />
	<Closing />
</main>
<Footer note="Sebagian foto masih visual konsep. Angka simulasi hanya ilustrasi." />
<StickyCta />
