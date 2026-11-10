<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { ArrowRight } from '@lucide/svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DrinkCard from '$lib/components/DrinkCard.svelte';
	import { SITE_URL, categories, drinks, orderLinks, outlets, rupiah, teas, waLink } from '$lib/data';
	import { reveal } from '$lib/motion';
	import { srcset } from '$lib/img';

	const title = 'Chacha | Milk Tea & Fresh Drink';
	const description = 'Milk tea, matcha, dan fresh drink dari Chacha, mulai Rp 12.000. Lihat menu lengkapnya dan cari outlet terdekat.';
	const url = `${SITE_URL}/`;

	const best = drinks.filter((d) => d.best);
	const count = (c: string) => drinks.filter((d) => d.category === c).length;
	const peach = drinks.find((d) => d.slug === 'peach-oolong-milk-tea')!;

	const layers = [
		{ name: 'Creamy Topping', note: 'Cream cheese dan fresh jelly' },
		{ name: 'Ice Cube' },
		{ name: 'Fresh Milk' },
		{ name: 'Premium Tea' }
	];

	const jsonld = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Chacha',
		url,
		slogan: 'From Nature to Your Cup',
		logo: `${SITE_URL}/favicon.png`
	};
	const ld = `<script type="application/ld+json">${JSON.stringify(jsonld)}</` + 'script>';

	// On phones, keep the menu one tap away once the hero has scrolled off.
	let showBar = $state(false);
	onMount(() => {
		const on = () => (showBar = window.scrollY > window.innerHeight * 0.7);
		on();
		window.addEventListener('scroll', on, { passive: true });
		return () => window.removeEventListener('scroll', on);
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<link rel="preload" as="image" href="/img/site/duo-1200.webp" imagesrcset={srcset('/img/site/duo-1200.webp')} imagesizes="(min-width: 1024px) 50vw, 100vw" fetchpriority="high" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content="{SITE_URL}/img/site/og-home.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	{@html ld}
</svelte:head>

<Nav />
<main class="bg-cream">
	<!-- Hero -->
	<section class="pb-14 pt-22 md:pb-20 md:pt-28">
		<div class="wrap grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
			<div class="order-2 flex flex-col gap-6 lg:order-1">
				<p class="label text-sage-text">milk tea &amp; fresh drink</p>
				<h1 class="display text-[clamp(2.75rem,6vw,5.25rem)] leading-[1.04] text-forest">Maybe you need a little Chacha.</h1>
				<p class="max-w-[42ch] text-[17px] leading-7 md:text-[18px] md:leading-[30px]">Milk tea, matcha, dan fresh drink. Mulai {rupiah(12000)}.</p>
				<div class="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
					<a href="/menu" class="btn btn-primary">Lihat menu</a>
					<a href="#outlet" class="btn btn-outline text-forest">Cari outlet</a>
				</div>
				<ul class="flex flex-wrap gap-x-10 gap-y-4 border-t border-linen pt-6">
					{#each categories as c}
						<li>
							<a href="/menu" class="group block">
								<span class="block font-display text-[28px] font-medium leading-tight text-forest">{count(c)}</span>
								<span class="label block text-sage-text">{c}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<div class="arch-right order-1 h-[clamp(380px,56vw,720px)] overflow-hidden lg:order-2">
				<img
					src="/img/site/duo-1200.webp"
					srcset={srcset('/img/site/duo-1200.webp')}
					sizes="(min-width: 1024px) 50vw, 100vw"
					alt="Cup hijau Chacha dan cup bening berisi teh di atas balok kayu, dengan pegunungan berkabut di belakangnya"
					fetchpriority="high"
					class="size-full object-cover object-[50%_62%]"
				/>
			</div>
		</div>
	</section>

	<!-- Best seller -->
	<section class="bg-white py-14 md:py-20">
		<div class="wrap flex flex-col gap-7 md:gap-9">
			<div class="flex flex-wrap items-end justify-between gap-4" use:reveal>
				<div class="flex flex-col gap-3" data-reveal>
					<p class="label text-sage-text">Best seller</p>
					<h2 class="display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.15] text-forest">Yang paling sering dipesan</h2>
				</div>
				<a href="/menu" class="inline-flex min-h-11 items-center gap-2 font-semibold text-forest" data-reveal>Lihat semua menu <ArrowRight size={17} /></a>
			</div>
			<ul class="-mx-5 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 xl:grid-cols-6">
				{#each best as d}
					<li class="w-40 shrink-0 md:w-auto"><DrinkCard drink={d} /></li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Highlight -->
	<section class="py-14 md:py-20">
		<div class="-mx-0 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] md:mx-auto md:grid md:max-w-[1240px] md:grid-cols-2 md:gap-6 md:overflow-visible md:px-10">
			<figure class="flex w-[78vw] max-w-[340px] shrink-0 flex-col gap-4 md:w-auto md:max-w-none">
				<img src="/img/site/poster-peach-1200.webp" srcset={srcset('/img/site/poster-peach-1200.webp')} sizes="(min-width: 768px) 50vw, 78vw" width="1200" height="1508" alt="Poster Peach Oolong Milk Tea: cup hijau Chacha di samping buah peach" loading="lazy" class="h-auto w-full rounded-[24px]" />
				<figcaption class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
					<span>
						<a href="/menu" class="font-display text-[22px] font-medium leading-7 text-forest">{peach.name}</a>
						<span class="block text-[14px] leading-[22px] text-ink-muted">Creamy, Segar, dan Harum</span>
					</span>
					<span class="price text-[18px] text-forest">{rupiah(peach.price)}</span>
				</figcaption>
			</figure>
			<figure class="flex w-[78vw] max-w-[340px] shrink-0 flex-col gap-4 md:w-auto md:max-w-none">
				<img src="/img/site/poster-matcha-1200.webp" srcset={srcset('/img/site/poster-matcha-1200.webp')} sizes="(min-width: 768px) 50vw, 78vw" width="1200" height="1508" alt="Poster 100% Pure Matcha: minuman matcha berlapis di atas tatakan kayu" loading="lazy" class="h-auto w-full rounded-[24px]" />
				<figcaption>
					<a href="/menu#matcha" class="font-display text-[22px] font-medium leading-7 text-forest">Matcha</a>
					<span class="block text-[14px] leading-[22px] text-ink-muted">Made for a brighter day</span>
				</figcaption>
			</figure>
		</div>
	</section>

	<!-- Tea selection -->
	<section id="teh" class="scroll-mt-20 bg-white py-14 md:py-20">
		<div class="wrap flex flex-col gap-7 md:gap-9">
			<div class="flex flex-col gap-3" use:reveal>
				<p class="label text-sage-text" data-reveal>Tea selection</p>
				<h2 class="display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.15] text-forest" data-reveal>Pilihan teh kami</h2>
			</div>
			<ul class="-mx-5 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 lg:grid-cols-3">
				{#each teas as t}
					<li class="flex w-72 shrink-0 flex-col gap-2.5 md:w-auto">
						<img src="/img/site/teas/{t.img}.webp" srcset={srcset(`/img/site/teas/${t.img}.webp`)} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 288px" alt="Secangkir seduhan dan daun {t.name}" width="1200" height="800" loading="lazy" class="aspect-[3/2] h-auto w-full rounded-[12px] object-cover" />
						<h3 class="mt-1 font-display text-[21px] font-medium leading-7 text-forest md:text-[24px] md:leading-[30px]">{t.name}</h3>
						<p class="text-[14px] leading-[22px] text-ink-muted md:text-[15px] md:leading-6">{t.desc}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Inside the cup -->
	<section class="py-14 md:py-20">
		<div class="wrap grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
			<img src="/img/site/poster-layers-1200.webp" srcset={srcset('/img/site/poster-layers-1200.webp')} sizes="(min-width: 1024px) 42vw, 100vw" width="1200" height="1697" alt="Poster Layers of Flavor: potongan gelas memperlihatkan creamy topping, es batu, fresh milk, dan premium tea" loading="lazy" class="h-auto w-full max-w-[540px] rounded-[24px]" />
			<div class="flex flex-col gap-7" use:reveal>
				<div class="flex flex-col gap-3" data-reveal>
					<p class="label text-sage-text">Di dalam gelas</p>
					<h2 class="display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.15] text-forest">Layers of flavor, secret of joy.</h2>
				</div>
				<dl class="border-t border-linen" data-reveal>
					{#each layers as l}
						<div class="border-b border-linen py-3">
							<dt class="font-display text-[20px] font-medium leading-[26px] text-forest">{l.name}</dt>
							{#if l.note}<dd class="text-[14px] leading-[22px] text-ink-muted">{l.note}</dd>{/if}
						</div>
					{/each}
				</dl>
				<div class="grid grid-cols-2 gap-3" data-reveal>
					<div class="rounded-[12px] bg-sage-soft p-4 md:p-5">
						<p class="label text-sage-text">Gula</p>
						<p class="mt-2 text-[14px] font-semibold leading-5 md:text-[16px] md:leading-6">100% atau 50%</p>
					</div>
					<div class="rounded-[12px] bg-sage-soft p-4 md:p-5">
						<p class="label text-sage-text">Es</p>
						<p class="mt-2 text-[14px] font-semibold leading-5 md:text-[16px] md:leading-6">Normal atau less</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Brand -->
	<section class="on-dark bg-forest py-14 text-white md:py-20">
		<div class="wrap grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
			<div class="flex flex-col items-start gap-6" use:reveal>
				<img src="/img/site/logo-stacked-white.webp" alt="" width="140" height="161" loading="lazy" class="h-auto w-30 md:w-36" data-reveal />
				<h2 class="display text-[clamp(2.1rem,4.4vw,3.75rem)] leading-[1.1]" data-reveal>From nature to your cup.</h2>
				<p class="max-w-[44ch] text-[17px] leading-7 text-mist md:text-[18px] md:leading-[30px]" data-reveal>Good tea brings people closer. Jadi pesan dua: satu buat kamu, satu buat orang yang lagi kamu kangenin.</p>
			</div>
			<div class="arch-left aspect-[1.08] overflow-hidden">
				<img src="/img/site/hands.webp" srcset={srcset('/img/site/hands.webp')} sizes="(min-width: 1024px) 45vw, 100vw" alt="Dua tangan memegang cup hijau Chacha" width="1200" height="1111" loading="lazy" class="size-full object-cover" />
			</div>
		</div>
	</section>

	<!-- Where to buy -->
	<section id="outlet" class="scroll-mt-20 py-14 md:py-20">
		<div class="wrap flex flex-col gap-7">
			<div class="flex flex-col gap-3">
				<p class="label text-sage-text">Outlet</p>
				<h2 class="display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.15] text-forest">Cari Chacha terdekat</h2>
			</div>
			{#if outlets.length}
				<ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each outlets as o}
						<li class="flex flex-col gap-1 rounded-[12px] bg-white p-5">
							<h3 class="font-display text-[21px] font-medium leading-7 text-forest">{o.name}</h3>
							<p class="text-[14px] leading-[22px] text-ink-muted">{o.address}</p>
							<p class="text-[14px] leading-[22px] text-ink-muted">{o.hours}</p>
							<a href={o.map} target="_blank" rel="noopener" class="mt-1 inline-flex min-h-11 items-center font-semibold text-forest">Buka peta</a>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="flex flex-wrap items-center justify-between gap-5 rounded-[12px] bg-white p-5 md:p-7">
					<p class="max-w-[48ch]">Kirim kota atau lokasimu lewat WhatsApp. Nanti kami kasih tahu outlet yang paling dekat.</p>
					<a href={waLink('Halo Chacha, outlet terdekat dari lokasi saya di mana ya? Saya di: ')} target="_blank" rel="noopener" class="btn btn-outline w-full text-forest sm:w-auto">Tanya lewat WhatsApp</a>
				</div>
			{/if}
			{#if orderLinks.length}
				<div class="flex flex-wrap items-center gap-3">
					<p class="label w-full text-sage-text md:w-auto">Pesan online</p>
					{#each orderLinks as o}
						<a href={o.href} target="_blank" rel="noopener" class="btn btn-outline !h-11 text-forest">{o.label}</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Partnership -->
	<section class="pb-14 md:pb-20">
		<div class="wrap">
			<div class="grid items-center gap-8 rounded-[24px] bg-sage-soft p-6 md:grid-cols-2 md:p-10">
				<div class="flex flex-col items-start gap-4">
					<p class="label text-sage-text">Kemitraan</p>
					<h2 class="display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.15] text-forest">Mau buka booth Chacha sendiri?</h2>
					<p class="max-w-[44ch]">Booth, alat, dan bahan baku dikirim ke lokasimu. Mulai Rp 4,5 juta, tanpa royalti.</p>
					<a href="/kemitraan" class="btn btn-outline w-full text-forest sm:w-auto">Lihat paket kemitraan</a>
				</div>
				<img src="/img/cut/booth-front.webp" srcset={srcset('/img/cut/booth-front.webp')} sizes="(min-width: 640px) 440px, 80vw" alt="Booth Chacha tampak depan" loading="lazy" class="mx-auto h-auto w-full max-w-[440px]" />
			</div>
		</div>
	</section>
</main>
<Footer />

{#if showBar}
	<div class="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-white p-2.5 pb-[max(10px,env(safe-area-inset-bottom))] md:hidden" transition:fly={{ y: 60, duration: 400 }}>
		<a href="/menu" class="btn btn-primary w-full">Lihat menu</a>
	</div>
{/if}
