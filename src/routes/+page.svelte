<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import CupShowcase from '$lib/components/CupShowcase.svelte';
	import MenuSection from '$lib/components/MenuSection.svelte';
	import Packages from '$lib/components/Packages.svelte';
	import Calculator from '$lib/components/Calculator.svelte';
	import Steps from '$lib/components/Steps.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Closing from '$lib/components/Closing.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Ticker from '$lib/components/Ticker.svelte';
	import PostCards from '$lib/components/PostCards.svelte';
	import Kit from '$lib/components/Kit.svelte';
	import Proof from '$lib/components/Proof.svelte';
	import Compare from '$lib/components/Compare.svelte';
	import StickyCta from '$lib/components/StickyCta.svelte';
	import { faqs, packages } from '$lib/data';

	const title = 'Chacha — Kemitraan Milk Tea Premium, Mulai Rp 8,5 Juta';
	const description =
		'Milk tea kelas mall dalam booth yang bisa Anda miliki. Paket kemitraan Chacha mulai Rp 8,5 juta: booth, bahan baku, cup custom, training dan POS lengkap. Tanpa royalti.';
	const url = 'https://chacha.id/';

	const jsonld = [
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: 'Chacha',
			url,
			slogan: 'From Nature to Your Cup',
			logo: `${url}favicon.svg`
		},
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
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content="{url}og.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="preload" as="image" href="/img/hero-portrait.webp" fetchpriority="high" />
	{@html ld}
</svelte:head>

<Nav />
<main>
	<Hero />
	<Ticker />
	<PostCards />
	<Kit />
	<Packages />
	<Proof />
	<Compare />
	<MenuSection />
	<CupShowcase />
	<Calculator />
	<Steps />
	<Faq />
	<Closing />
</main>
<Footer />
<StickyCta />
