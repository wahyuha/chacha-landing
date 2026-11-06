<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Download, Share2, MessageCircle } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import PosterPaket1 from './PosterPaket1.svelte';
	import { waLink } from '$lib/data';
	import { reveal } from '$lib/motion';

	// A poster is either a finished image (img) or a live component (C); png is what gets shared or saved.
	const posters = [
		{ id: 'lengkap', label: 'Paket Lengkap', png: '/poster/paket-lengkap.png', file: 'Chacha-Paket-Lengkap.png', img: '/poster/paket-lengkap.webp', C: null },
		{ id: 'paket-1', label: 'Paket 1 · Peralatan', png: '/poster/paket-1.png', file: 'Chacha-Paket-1-Peralatan.png', img: null, C: PosterPaket1 }
	];
	let active = $state(0);
	const p = $derived(posters[active]);

	// The native share sheet with the image attached is the fastest way into a family WhatsApp group.
	let canShare = $state(false);
	onMount(() => {
		try {
			canShare = !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] });
		} catch {
			canShare = false;
		}
	});

	async function share() {
		try {
			const blob = await (await fetch(p.png)).blob();
			await navigator.share({ files: [new File([blob], p.file, { type: 'image/png' })], text: `Ini ${p.label} Chacha yang aku ceritakan.` });
		} catch {
			/* user closed the sheet */
		}
	}
</script>

<section class="relative overflow-hidden bg-cream-raised py-20 md:py-28">
	<div class="wrap grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-12 lg:gap-14">
		<div class="lg:col-span-5" use:reveal={{ stagger: 0.08 }}>
			<Eyebrow>Simpan untuk nanti</Eyebrow>
			<h2 class="display mt-5 text-[clamp(2.1rem,4vw,3.3rem)] leading-[1.04] text-ink" data-reveal>
				Mau dirundingkan dulu dengan keluarga? <span class="text-forest">Bawa posternya.</span>
			</h2>
			<p class="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-ink-muted" data-reveal>
				Keputusan buka usaha jarang diambil sendirian. Simpan posternya, kirim ke grup keluarga atau pasanganmu, lalu kabari kami kalau ada yang ingin ditanyakan.
			</p>

			<div class="mt-7 inline-flex rounded-full bg-white p-1 ring-1 ring-linen" role="tablist" aria-label="Pilih poster" data-reveal>
				{#each posters as po, i}
					<button role="tab" aria-selected={active === i} onclick={() => (active = i)} class="rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors {active === i ? 'bg-forest text-white' : 'text-ink/70 hover:text-forest'}">{po.label}</button>
				{/each}
			</div>

			<div class="mt-5 flex flex-wrap gap-3" data-reveal>
				{#if canShare}
					<button onclick={share} class="btn btn-primary !h-13 !px-6"><Share2 size={18} />Bagikan poster</button>
				{/if}
				<a href={p.png} download={p.file} class="btn {canShare ? 'btn-outline text-forest' : 'btn-primary'} !h-13 !px-6"><Download size={18} />Simpan poster</a>
			</div>
			<a href={waLink(`Halo Kak, saya sudah lihat poster ${p.label}. Mau tanya-tanya dulu.`)} target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest" data-reveal>
				<MessageCircle size={16} />Atau langsung tanya kami
			</a>
		</div>

		<div class="lg:col-span-7" use:reveal>
			<div data-reveal class="relative mx-auto max-w-[520px] rotate-[1.5deg] overflow-hidden rounded-[18px] shadow-[0_50px_90px_-45px_rgba(20,63,49,.6)] ring-1 ring-black/5 transition-transform duration-700 ease-(--ease-soft) hover:rotate-0">
				{#key p.id}
					<div in:fade={{ duration: 450 }}>
						{#if p.img}
							<img src={p.img} alt="Poster {p.label} Chacha: booth, peralatan minuman dan cup" width="1080" height="1350" loading="lazy" class="block h-auto w-full" />
						{:else if p.C}
							<p.C />
						{/if}
					</div>
				{/key}
			</div>
		</div>
	</div>
</section>
