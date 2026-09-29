<script lang="ts">
	import { Store, TabletSmartphone, Printer, PackageCheck, Blend, CupSoda, Leaf, GraduationCap, Check } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import BoothArt from './BoothArt.svelte';
	import { kit, promo, waLink } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	const icons = { booth: Store, pos: TabletSmartphone, printer: Printer, sealer: PackageCheck, shaker: Blend, cup: CupSoda, tea: Leaf, training: GraduationCap };
	const left = kit.slice(0, 4);
	const right = kit.slice(4);
</script>

{#snippet tile(k: (typeof kit)[number], i: number)}
	{@const Icon = icons[k.icon as keyof typeof icons]}
	<li data-reveal class="group flex items-center gap-4 rounded-[18px] bg-white p-4 ring-1 ring-linen transition-shadow duration-500 hover:shadow-[0_18px_40px_-24px_rgba(20,63,49,.5)]">
		<span class="relative grid size-14 shrink-0 place-items-center rounded-[14px] bg-sage-soft text-forest transition-transform duration-500 group-hover:-rotate-6">
			<Icon size={26} strokeWidth={1.6} />
			<span class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">{i + 1}</span>
		</span>
		<div>
			<p class="text-[16px] font-bold leading-tight text-ink">{k.t}</p>
			<p class="mt-0.5 text-[13px] leading-snug text-ink-muted">{k.d}</p>
		</div>
	</li>
{/snippet}

<section id="isi-paket" class="bg-cream-raised py-20 md:py-28">
	<div class="wrap">
		<div class="mx-auto max-w-3xl text-center" use:reveal>
			<div class="flex justify-center"><Eyebrow>Isi paket</Eyebrow></div>
			<h2 use:splitWords class="display mt-5 text-[clamp(2.1rem,4.6vw,3.7rem)] leading-[1.04] text-ink">
				Modal Rp 11,5 juta, <span class="text-forest">dapat apa saja?</span>
			</h2>
			<p class="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-muted" data-reveal>
				Ini isi paket <strong class="text-ink">Standard</strong>, paket yang kami rekomendasikan untuk mitra baru. Semua dikirim ke lokasi Anda, tinggal pasang dan jualan.
			</p>
		</div>

		<div class="mt-12 grid items-center gap-4 lg:mt-16 lg:grid-cols-[1fr_1.25fr_1fr] lg:gap-6">
			<ul class="grid gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-1" use:reveal={{ stagger: 0.07, y: 24 }}>
				{#each left as k, i}{@render tile(k, i)}{/each}
			</ul>
			<div class="relative order-first overflow-hidden rounded-[28px] bg-[#F3ECE0] ring-1 ring-linen lg:order-2" use:reveal>
				<div class="aspect-[4/3]" data-reveal><BoothArt id="booth-kecil" /></div>
				<div class="absolute left-4 top-4 rounded-full bg-deep-forest px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wider text-gold">Paling laris</div>
			</div>
			<ul class="grid gap-3 sm:grid-cols-2 lg:order-3 lg:grid-cols-1" use:reveal={{ stagger: 0.07, y: 24 }}>
				{#each right as k, i}{@render tile(k, i + 4)}{/each}
			</ul>
		</div>

		<div class="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-between gap-5 rounded-[22px] bg-deep-forest p-6 text-white md:flex-row md:p-7" use:reveal>
			<div data-reveal>
				<p class="text-[13px] font-semibold uppercase tracking-[0.16em] text-gold">Semua di atas</p>
				<p class="mt-1 text-[32px] font-extrabold tracking-tight">Rp 11.500.000</p>
				<p class="mt-1 flex items-center gap-2 text-[14px] text-white/75"><Check size={16} class="text-gold" />Tanpa royalti · POS gratis 6 bulan</p>
			</div>
			<a data-reveal href={waLink('Halo Chacha, saya tertarik paket Standard (Rp 11,5 jt). Boleh minta proposal & promonya?')} target="_blank" rel="noopener" class="btn btn-gold cta-shine !h-14 !px-7 !text-[16px] font-bold">Ambil Paket Ini</a>
		</div>
		{#if promo.ribbon}<p class="mt-4 text-center text-[13px] text-ink-muted">{promo.ribbon}.</p>{/if}
	</div>
</section>
