<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, scale } from 'svelte/transition';
	import Eyebrow from './Eyebrow.svelte';
	import Cloud from './Cloud.svelte';
	import DrinkArt from './DrinkArt.svelte';
	import { drinks, rupiah } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	const tabs = ['Semua', 'Milk Tea', 'Fruit Tea', 'Signature'] as const;
	let tab: (typeof tabs)[number] = $state('Semua');
	let list = $derived(tab === 'Semua' ? drinks : drinks.filter((d) => d.category === tab));

	function tilt(node: HTMLElement) {
		const img = node.querySelector<HTMLElement>('[data-tilt]');
		const move = (e: PointerEvent) => {
			const r = node.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			if (img) img.style.transform = `translate3d(${x * 14}px, ${y * 10}px, 0) scale(1.06) rotate(${x * 2}deg)`;
		};
		const leave = () => img && (img.style.transform = '');
		node.addEventListener('pointermove', move);
		node.addEventListener('pointerleave', leave);
		return { destroy: () => (node.removeEventListener('pointermove', move), node.removeEventListener('pointerleave', leave)) };
	}
</script>

<section id="menu" class="relative bg-cream py-24 md:py-36">
	<Cloud width={180} class="absolute right-[6%] top-20 hidden text-gold/70 md:block" />
	<div class="wrap">
		<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end" use:reveal>
			<div>
				<Eyebrow>Menu</Eyebrow>
				<h2 use:splitWords class="display mt-6 max-w-[14ch] text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-forest">Diseduh segar, disajikan cantik</h2>
			</div>
			<div class="flex flex-wrap gap-2" role="tablist" aria-label="Kategori menu" data-reveal>
				{#each tabs as t}
					<button
						role="tab"
						aria-selected={tab === t}
						onclick={() => (tab = t)}
						class="rounded-full border px-4 py-2 text-[14px] font-semibold transition-all duration-300 {tab === t ? 'border-forest bg-forest text-on-forest' : 'border-linen text-ink/70 hover:border-sage hover:text-forest'}"
					>{t}</button>
				{/each}
			</div>
		</div>

		<ul class="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-20 md:grid-cols-3 md:gap-x-8 md:gap-y-16" use:reveal={{ stagger: 0.07 }}>
			{#each list as d (d.name)}
				<li animate:flip={{ duration: 600 }} in:scale={{ start: 0.94, duration: 500 }} out:fade={{ duration: 150 }} data-reveal>
					<article use:tilt class="group">
						<div class="relative aspect-square overflow-hidden rounded-[20px]" style="background:{d.tint}">
							{#if d.photo}
								<img data-tilt src="{d.img}.webp" alt={d.name} loading="lazy" class="size-full object-cover transition-transform duration-700 ease-(--ease-soft)" />
							{:else}
								<div data-tilt class="size-full transition-transform duration-700 ease-(--ease-soft)" role="img" aria-label="Ilustrasi {d.name}">
									<DrinkArt id={d.img.split('-')[1]} style={{ liquid: d.liquid, extra: d.extra, tint: d.tint }} />
								</div>
							{/if}
							<span class="label absolute left-4 top-4 rounded-full bg-cream-raised/85 px-3 py-1.5 text-[10px] text-sage-text backdrop-blur">{d.category}</span>
						</div>
						<div class="mt-5 flex items-baseline justify-between gap-3">
							<h3 class="display text-[clamp(1.35rem,2.2vw,1.9rem)] font-semibold leading-tight text-ink">{d.name}</h3>
							<p class="price shrink-0 text-[15px] text-forest md:text-[17px]">{rupiah(d.price)}</p>
						</div>
						<p class="mt-2 hidden max-w-[34ch] text-[14px] leading-relaxed text-ink-muted sm:block">{d.note}</p>
					</article>
				</li>
			{/each}
		</ul>
		<p class="mt-12 text-[13px] text-ink-muted">Harga jual yang disarankan untuk outlet mitra. Dapat berbeda di tiap lokasi.</p>
	</div>
</section>
