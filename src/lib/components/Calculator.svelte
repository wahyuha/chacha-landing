<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { MessageCircle } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import Cloud from './Cloud.svelte';
	import { packages, rupiah, jutaan, waLink } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	const HPP = 6000;
	const DAYS = 26;
	const buyable = packages.filter((p) => p.price);

	const scenarios = [
		{ label: 'Sepi', cups: 30 },
		{ label: 'Normal', cups: 50 },
		{ label: 'Ramai', cups: 80 }
	];

	let cups = $state(30);
	let price = $state(15000);
	let fixed = $state(4_500_000);
	let pkgIdx = $state(1);

	const pkgPrice = $derived(buyable[pkgIdx].price!);
	const omzet = $derived(cups * price * DAYS);
	const gross = $derived(cups * (price - HPP) * DAYS);
	const net = $derived(gross - fixed);
	const bep = $derived(net > 0 ? pkgPrice / net : Infinity);
	const bepM = $derived(isFinite(bep) ? Math.ceil(bep) : 0);

	const tNet = new Tween(0, { duration: 600, easing: cubicOut });
	const tOmzet = new Tween(0, { duration: 600, easing: cubicOut });
	const tGross = new Tween(0, { duration: 600, easing: cubicOut });
	$effect(() => {
		tNet.target = net;
		tOmzet.target = omzet;
		tGross.target = gross;
	});

	const bepLabel = $derived(
		!isFinite(bep) ? 'Belum balik modal' : bep < 1 ? '< 1 bulan' : `±${bep.toLocaleString('id-ID', { maximumFractionDigits: 1 })} bulan`
	);
	const fill = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;
</script>

<section id="kalkulator" class="on-dark grain relative overflow-hidden bg-deep-forest py-24 text-cream md:py-36">
	<Cloud width={220} class="absolute -left-10 top-16 text-gold/25" />
	<Cloud width={160} class="absolute bottom-24 right-[4%] text-gold/20" />
	<div class="wrap relative">
		<div class="grid gap-8 md:grid-cols-12 md:items-end" use:reveal>
			<div class="md:col-span-7">
				<Eyebrow dark>Simulasi balik modal</Eyebrow>
				<h2 use:splitWords class="display mt-6 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04]">Coba hitung sendiri dulu</h2>
			</div>
			<p class="text-[16px] leading-[1.7] text-cream/70 md:col-span-5" data-reveal>
				Angkanya sengaja kami mulai dari hari yang sepi, 30 cup sehari. Geser sesuai perkiraan lokasimu.
			</p>
		</div>

		<div class="mt-14 grid gap-4 lg:grid-cols-12" use:reveal>
			<!-- inputs -->
			<div class="rounded-[24px] border border-cream/10 bg-cream/[.04] p-6 md:p-9 lg:col-span-7" data-reveal>
				<div class="flex flex-wrap items-center gap-2">
					<span class="label mr-2 text-[10px] text-cream/50">Skenario</span>
					{#each scenarios as s}
						<button onclick={() => (cups = s.cups)} class="rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors {cups === s.cups ? 'border-gold bg-gold text-deep-forest' : 'border-cream/20 text-cream/75 hover:border-cream/50'}">
							{s.label} · {s.cups}
						</button>
					{/each}
				</div>

				<div class="mt-9 grid gap-9">
					<label class="block">
						<span class="flex items-baseline justify-between"><span class="text-[14px] text-cream/75">Cup terjual per hari</span><span class="price text-[22px] text-cream">{cups}</span></span>
						<input type="range" min="10" max="150" step="5" bind:value={cups} style="--fill:{fill(cups, 10, 150)}" class="range mt-4" />
					</label>
					<label class="block">
						<span class="flex items-baseline justify-between"><span class="text-[14px] text-cream/75">Harga jual rata-rata</span><span class="price text-[22px] text-cream">{rupiah(price)}</span></span>
						<input type="range" min="12000" max="16000" step="500" bind:value={price} style="--fill:{fill(price, 12000, 16000)}" class="range mt-4" />
					</label>
					<label class="block">
						<span class="flex items-baseline justify-between"><span class="text-[14px] text-cream/75">Biaya tetap per bulan <span class="text-cream/45">(gaji, sewa, listrik)</span></span><span class="price text-[22px] text-cream">{jutaan(fixed)}</span></span>
						<input type="range" min="1000000" max="9000000" step="250000" bind:value={fixed} style="--fill:{fill(fixed, 1e6, 9e6)}" class="range mt-4" />
					</label>
					<div>
						<span class="text-[14px] text-cream/75">Paket</span>
						<div class="mt-3 grid grid-cols-3 gap-2">
							{#each buyable as p, i}
								<button onclick={() => (pkgIdx = i)} class="rounded-[12px] border px-3 py-3 text-left transition-colors {pkgIdx === i ? 'border-cream bg-cream text-deep-forest' : 'border-cream/15 text-cream/80 hover:border-cream/40'}">
									<span class="block text-[14px] font-semibold">{p.name}</span>
									<span class="price block text-[12px] opacity-75">{jutaan(p.price!)}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- results -->
			<div class="flex flex-col rounded-[24px] bg-cream p-6 text-ink md:p-9 lg:col-span-5" data-reveal>
				<p class="label text-[10px] text-sage-text">Estimasi laba bersih / bulan</p>
				<p class="price mt-3 text-[clamp(2.4rem,5vw,3.6rem)] leading-none {net > 0 ? 'text-forest' : 'text-[#A5402D]'}">{rupiah(tNet.current)}</p>

				<div class="mt-8 grid grid-cols-2 gap-4 border-y border-linen py-6">
					<div>
						<p class="text-[12px] text-ink-muted">Omzet / bulan</p>
						<p class="price mt-1 text-[18px]">{rupiah(tOmzet.current)}</p>
					</div>
					<div>
						<p class="text-[12px] text-ink-muted">Laba kotor / bulan</p>
						<p class="price mt-1 text-[18px]">{rupiah(tGross.current)}</p>
					</div>
				</div>

				<div class="mt-6">
					<div class="flex items-baseline justify-between">
						<p class="text-[14px] font-semibold">Balik modal</p>
						<p class="display text-[30px] font-semibold leading-none text-forest">{bepLabel}</p>
					</div>
					<ol class="mt-4 grid grid-cols-12 gap-1" aria-hidden="true">
						{#each Array(12) as _, m}
							<li class="h-2.5 rounded-full transition-colors duration-500" style="transition-delay:{m * 25}ms" class:bg-forest={m < bepM - 1} class:bg-gold={m === bepM - 1} class:bg-linen={m >= bepM}></li>
						{/each}
					</ol>
					<p class="mt-2 flex justify-between text-[11px] text-ink-muted"><span>Bulan 1</span><span>Bulan 12</span></p>
				</div>

				<a href={waLink(`Halo Chacha, saya sudah coba kalkulator: ${cups} cup/hari, paket ${buyable[pkgIdx].name}. Boleh diskusi lokasi saya?`)} target="_blank" rel="noopener" class="btn btn-primary mt-8 w-full">
					<MessageCircle size={18} />Diskusikan hasilnya dengan kami
				</a>
				<p class="mt-5 text-[12px] leading-relaxed text-ink-muted">
					Asumsi: HPP {rupiah(HPP)}/cup (bahan, cup, sedotan), buka {DAYS} hari sebulan. Ini hitungan kasar, bukan janji penghasilan. Hasil sebenarnya tergantung lokasi dan cara kamu menjalankannya.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.range {
		appearance: none;
		width: 100%;
		height: 4px;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--color-gold) var(--fill), rgba(245, 238, 227, 0.15) var(--fill));
		cursor: pointer;
	}
	.range::-webkit-slider-thumb {
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-cream);
		border: 6px solid var(--color-gold);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
		transition: transform 0.2s;
	}
	.range:active::-webkit-slider-thumb {
		transform: scale(1.15);
	}
	.range::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-cream);
		border: 6px solid var(--color-gold);
	}
</style>
