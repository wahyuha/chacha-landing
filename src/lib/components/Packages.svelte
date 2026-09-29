<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { Check, MessageCircle, TabletSmartphone, Ruler } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import BoothArt from './BoothArt.svelte';
	import { packages, rupiah, waLink } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	let active = $state(1);
	let pkg = $derived(packages[active]);
	const price = new Tween(packages[1].price ?? 0, { duration: 700, easing: cubicOut });
	$effect(() => {
		if (pkg.price) price.target = pkg.price;
	});

	const msg = $derived(
		pkg.price
			? `Halo Chacha, saya tertarik paket ${pkg.name} (${pkg.type}). Boleh minta proposalnya?`
			: 'Halo Chacha, saya tertarik booth Mall / Custom. Boleh jadwalkan survei lokasi?'
	);

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') active = (active + 1) % packages.length;
		else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') active = (active + packages.length - 1) % packages.length;
		else return;
		e.preventDefault();
		(document.getElementById(`pkg-tab-${active}`) as HTMLElement)?.focus();
	}
</script>

<section id="paket" class="bg-cream py-24 md:py-36">
	<div class="wrap">
		<div class="grid gap-8 md:grid-cols-12 md:items-end" use:reveal>
			<div class="md:col-span-7">
				<Eyebrow>Paket kemitraan</Eyebrow>
				<h2 use:splitWords class="display mt-6 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-forest">Pilih booth, sisanya kami siapkan</h2>
			</div>
			<p class="text-[16px] leading-[1.7] text-ink-muted md:col-span-5" data-reveal>
				Semua paket sudah termasuk booth, peralatan, bahan baku awal, cup custom, training, dan <strong class="font-semibold text-forest">POS lengkap dengan perangkat</strong>. Tanpa royalti.
			</p>
		</div>

		<!-- selector -->
		<div class="mt-14 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3" role="tablist" aria-label="Tipe booth" tabindex="-1" onkeydown={onKey}>
			{#each packages as p, i}
				<button
					id="pkg-tab-{i}"
					role="tab"
					aria-selected={active === i}
					aria-controls="pkg-panel"
					tabindex={active === i ? 0 : -1}
					onclick={() => (active = i)}
					class="relative rounded-[16px] border p-4 text-left transition-[border-color,background-color,box-shadow] duration-500 ease-(--ease-soft) md:p-5
					{active === i ? 'border-forest bg-cream-raised shadow-[0_16px_40px_-24px_rgba(29,90,69,.55)]' : 'border-linen hover:border-sage hover:bg-cream-raised/60'}"
				>
					{#if p.featured}
						<span class="label absolute -top-2.5 right-3 rounded-full bg-deep-forest px-2.5 py-1 text-[9px] text-gold">Paling Laris</span>
					{/if}
					<span class="label block text-[10px] {active === i ? 'text-sage-text' : 'text-ink-muted'}">{p.type}</span>
					<span class="display mt-2 block text-[24px] font-semibold leading-none text-ink md:text-[28px]">{p.name}</span>
					{#if p.was}<span class="mt-3 block text-[12px] text-ink-muted line-through">{rupiah(p.was)}</span>{/if}
					<span class="price block text-[14px] text-forest md:text-[16px] {p.was ? '' : 'mt-3'}">{p.price ? rupiah(p.price) : 'Setelah survei'}</span>
				</button>
			{/each}
		</div>

		<!-- panel -->
		<div id="pkg-panel" role="tabpanel" aria-labelledby="pkg-tab-{active}" class="mt-4 grid overflow-hidden rounded-[24px] border bg-cream-raised transition-shadow duration-700 lg:grid-cols-2 {pkg.featured ? 'border-sage shadow-glow' : 'border-linen'}">
			<div class="relative aspect-[4/3] overflow-hidden bg-[#F3ECE0] lg:aspect-auto lg:min-h-[560px]">
				{#key pkg.id}
					<div class="absolute inset-0" in:fade={{ duration: 600 }} out:fade={{ duration: 400 }}>
						{#if pkg.photo}
							<img src="{pkg.img}.webp" alt="Render booth Chacha {pkg.type}" class="size-full object-cover" />
						{:else}
							<div class="size-full" role="img" aria-label="Tampak depan booth Chacha {pkg.type}, {pkg.size}">
								<BoothArt id={pkg.id} />
							</div>
						{/if}
					</div>
				{/key}
				<div class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-cream-raised/90 px-3.5 py-2 text-[13px] font-semibold text-forest backdrop-blur">
					<Ruler size={15} />{pkg.size}
				</div>
			</div>

			<div class="flex flex-col p-6 md:p-10">
				{#key pkg.id}
					<div in:fly={{ y: 14, duration: 500, delay: 80 }}>
						<p class="label text-sage-text">{pkg.type}</p>
						<div class="mt-2 flex flex-wrap items-end justify-between gap-4">
							<h3 class="display text-[44px] font-semibold leading-none text-ink">{pkg.name}</h3>
							{#if pkg.price}
								<div class="text-right">
									{#if pkg.was}<p class="text-[14px] text-ink-muted"><span class="line-through">{rupiah(pkg.was)}</span> <span class="ml-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-deep-forest">Hemat {rupiah(pkg.was - (pkg.price ?? 0))}</span></p>{/if}
									<p class="price text-[28px] leading-none text-forest">{rupiah(price.current)}</p>
								</div>
							{:else}
								<p class="text-[15px] font-semibold text-forest">Harga setelah survei lokasi</p>
							{/if}
						</div>
						<p class="mt-5 text-[16px] leading-relaxed text-ink/85">{pkg.booth}.</p>
					</div>
				{/key}

				<dl class="mt-8 grid gap-5 border-t border-linen pt-8 text-[15px]">
					<div class="grid grid-cols-[110px_1fr] gap-4">
						<dt class="label pt-0.5 text-[10px] text-ink-muted">Peralatan</dt>
						<dd class="flex flex-wrap gap-1.5">
							{#each pkg.equipment as e (e)}
								<span class="rounded-full bg-sage-soft px-3 py-1 text-[13px] text-sage-text" in:fade={{ duration: 300 }}>{e}</span>
							{/each}
						</dd>
					</div>
					<div class="grid grid-cols-[110px_1fr] gap-4">
						<dt class="label pt-0.5 text-[10px] text-ink-muted">Bahan & cup</dt>
						<dd class="text-ink/85">{pkg.stock}</dd>
					</div>
					<div class="grid grid-cols-[110px_1fr] gap-4">
						<dt class="label pt-0.5 text-[10px] text-ink-muted">Marketing</dt>
						<dd class="text-ink/85">{pkg.marketing}</dd>
					</div>
					<div class="grid grid-cols-[110px_1fr] gap-4">
						<dt class="label pt-0.5 text-[10px] text-ink-muted">Training</dt>
						<dd class="text-ink/85">{pkg.training}</dd>
					</div>
				</dl>

				<div class="mt-8 flex items-start gap-4 rounded-[16px] bg-deep-forest p-5 text-cream">
					<span class="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><TabletSmartphone size={22} strokeWidth={1.6} /></span>
					<div>
						<p class="text-[15px] font-semibold">POS {pkg.pos.join(' + ')}</p>
						<p class="mt-1 text-[13px] text-cream/70">Gratis langganan 6 bulan pertama. Stok, penjualan & pengingat restock dalam satu tablet.</p>
					</div>
				</div>

				<div class="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center">
					<a href={waLink(msg)} target="_blank" rel="noopener" class="btn btn-primary group">
						<MessageCircle size={18} />
						{pkg.price ? `Tanya paket ${pkg.name}` : 'Jadwalkan survei'}
					</a>
					<p class="flex items-center gap-2 text-[13px] text-ink-muted"><Check size={15} class="text-sage" />Tanpa royalti · zona 1 km</p>
				</div>
			</div>
		</div>
		<p class="mt-5 text-[13px] text-ink-muted">Harga belum termasuk ongkir. Isi paket dapat disesuaikan saat konsultasi.</p>
	</div>
</section>
