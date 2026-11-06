<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, scale } from 'svelte/transition';
	import Eyebrow from './Eyebrow.svelte';
	import Cloud from './Cloud.svelte';
	import DrinkCard from './DrinkCard.svelte';
	import { categories, drinks } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	const tabs = ['Semua', ...categories] as const;
	let tab: (typeof tabs)[number] = $state('Semua');
	let list = $derived(tab === 'Semua' ? drinks : drinks.filter((d) => d.category === tab));
</script>

<section id="menu" class="relative bg-cream py-24 md:py-36">
	<Cloud width={180} class="absolute right-[6%] top-20 hidden text-gold/70 md:block" />
	<div class="wrap">
		<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end" use:reveal>
			<div>
				<Eyebrow>Menu</Eyebrow>
				<h2 use:splitWords class="display mt-6 max-w-[14ch] text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-forest">Menu yang akan kamu jual</h2>
			</div>
			<div class="flex flex-wrap gap-2" role="tablist" aria-label="Kategori menu" data-reveal>
				{#each tabs as t}
					<button
						role="tab"
						aria-selected={tab === t}
						onclick={() => (tab = t)}
						class="min-h-11 rounded-full border px-4 py-2 text-[14px] font-semibold transition-all duration-300 {tab === t ? 'border-forest bg-forest text-on-forest' : 'border-linen text-ink/70 hover:border-sage hover:text-forest'}"
					>{t}</button>
				{/each}
			</div>
		</div>

		<ul class="mt-14 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-20 md:grid-cols-3 md:gap-x-6 lg:grid-cols-5" use:reveal={{ stagger: 0.05 }}>
			{#each list as d (d.slug)}
				<li animate:flip={{ duration: 600 }} in:scale={{ start: 0.94, duration: 500 }} out:fade={{ duration: 150 }} data-reveal>
					<DrinkCard drink={d} />
				</li>
			{/each}
		</ul>
		<p class="mt-12 text-[13px] text-ink-muted">Harga di atas saran harga jual. Kamu boleh menyesuaikan dengan lokasimu.</p>
	</div>
</section>
