<script lang="ts">
	import { onMount } from 'svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import DrinkCard from '$lib/components/DrinkCard.svelte';
	import { SITE_URL, categories, drinks, iceLevels, orderLinks, sugarLevels, teaBases, type Category } from '$lib/data';
	import { scrollToId } from '$lib/motion';

	const title = 'Menu Chacha | Milk Tea, Matcha, Fresh Drink';
	const description = 'Semua menu Chacha: 6 milk tea, 6 matcha, dan 3 fresh drink, mulai Rp 12.000. Gula dan es bisa diatur.';
	const url = `${SITE_URL}/menu`;

	const anchor = (c: Category) => c.toLowerCase().replace(' ', '-');

	let bestOnly = $state(false);
	let active: Category = $state('Milk Tea');
	const listFor = (c: Category) => drinks.filter((d) => d.category === c && (!bestOnly || d.best));

	onMount(() => {
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) active = categories.find((c) => anchor(c) === e.target.id) ?? active;
			},
			{ rootMargin: '-30% 0px -60% 0px' }
		);
		categories.forEach((c) => {
			const el = document.getElementById(anchor(c));
			if (el) io.observe(el);
		});
		return () => io.disconnect();
	});

	function go(e: MouseEvent, c: Category) {
		e.preventDefault();
		active = c;
		scrollToId(anchor(c), -76);
	}
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
	<meta property="og:image" content="{SITE_URL}/img/site/og-home.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#snippet levels(name: string, items: { value: string; note: string }[])}
	<div>
		<p class="label text-sage-text">{name}</p>
		<ul class="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-1">
			{#each items as l}
				<li class="rounded-[12px] bg-sage-soft px-4 py-3">
					<p class="font-display text-[21px] font-medium leading-7 text-forest">{l.value}</p>
					<p class="text-[13px] leading-[18px] text-ink-muted">{l.note}</p>
				</li>
			{/each}
		</ul>
	</div>
{/snippet}

<Nav solid />
<main class="bg-cream pt-18">
	<header class="on-dark bg-forest py-8 text-white md:py-12">
		<div class="wrap">
			<h1 class="display text-[clamp(2.2rem,5vw,4rem)] leading-tight tracking-[0.3em]">MENU</h1>
			<p class="tagline text-[14px] leading-snug text-mist md:text-[16px]">milk tea &amp; fresh drink</p>
		</div>
	</header>

	<nav aria-label="Kategori menu" class="sticky top-0 z-30 border-b border-linen bg-white">
		<div class="wrap flex items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none]">
			{#each categories as c}
				<a
					href="#{anchor(c)}"
					onclick={(e) => go(e, c)}
					aria-current={active === c ? 'true' : undefined}
					class="inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-semibold transition-colors md:px-5 md:text-[15px] {active === c ? 'border-forest bg-forest text-white' : 'border-linen text-forest hover:border-forest'}"
				>{c}</a>
			{/each}
			<button
				type="button"
				onclick={() => (bestOnly = !bestOnly)}
				aria-pressed={bestOnly}
				class="ml-auto inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-semibold transition-colors md:px-5 md:text-[15px] {bestOnly ? 'border-gold-text bg-gold-text text-white' : 'border-gold text-gold-text'}"
			>Best seller saja</button>
		</div>
	</nav>

	<div class="wrap flex flex-col gap-12 py-10 md:py-14 lg:flex-row lg:items-start">
		<div class="flex min-w-0 flex-1 flex-col gap-14 md:gap-18">
			{#each categories as c}
				{@const list = listFor(c)}
				{@const bases = teaBases[c]}
				<section id={anchor(c)} class="flex flex-col gap-5 md:gap-7">
					{#if bases.length > 1}
						<h2 class="font-display text-[15px] font-medium uppercase leading-5 tracking-[0.32em] text-forest">{c}</h2>
						<ul class="-mx-5 flex gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:rounded-[12px] sm:bg-paper sm:p-4 sm:px-4">
							{#each bases as b}
								<li class="w-48 shrink-0 sm:w-auto">
									<img src="/img/site/bases/{b.img}.webp" alt="Seduhan dan daun {b.name}" loading="lazy" class="h-auto w-full" />
									<p class="mt-1 font-display text-[11px] font-medium uppercase leading-4 tracking-[0.16em] text-forest">{b.name}</p>
									<p class="text-[13px] leading-[18px] text-ink-muted">{b.leaf}</p>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="flex items-center gap-4 rounded-[12px] bg-paper p-3 md:gap-8 md:p-4">
							<img src="/img/site/bases/{bases[0].img}.webp" alt="Seduhan dan daun {bases[0].name}" loading="lazy" class="h-auto w-36 md:w-72" />
							<div>
								<h2 class="font-display text-[15px] font-medium uppercase leading-5 tracking-[0.32em] text-forest">{c}</h2>
								<p class="mt-1 text-[13px] leading-[18px] text-ink-muted">{c === 'Fresh Drink' ? `${bases[0].name}, ${bases[0].leaf}` : bases[0].leaf}</p>
							</div>
						</div>
					{/if}
					<ul class="grid gap-x-3 gap-y-7 md:gap-x-5 md:gap-y-9 {c === 'Fresh Drink' ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3'}">
						{#each list as d (d.slug)}
							<li><DrinkCard drink={d} showBase={c === 'Milk Tea'} compact={c === 'Fresh Drink'} /></li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>

		<aside class="flex shrink-0 flex-col gap-6 rounded-[24px] bg-white p-5 lg:sticky lg:top-24 lg:w-72 lg:p-6" aria-label="Pilihan gula dan es">
			{@render levels('Sugar level', sugarLevels)}
			{@render levels('Ice level', iceLevels)}
			{#if orderLinks.length}
				<div class="flex flex-col gap-2">
					<p class="label text-sage-text">Pesan online</p>
					{#each orderLinks as o}
						<a href={o.href} target="_blank" rel="noopener" class="btn btn-outline !h-11 text-forest">{o.label}</a>
					{/each}
				</div>
			{/if}
		</aside>
	</div>
</main>
<Footer />
