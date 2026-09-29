<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import Mountains from './Mountains.svelte';
	import Jasmine from './Jasmine.svelte';
	import { reveal, splitWords } from '$lib/motion';

	// 4:5 cards shaped like Instagram posts, so the same layouts can be reused in the feed.
	type Card = { tone: 'forest' | 'sage' | 'white' | 'gold' | 'photo'; kicker: string; big: string; line: string; foot?: string; img?: string };
	const cards: Card[] = [
		{ tone: 'forest', kicker: 'Modal awal', big: 'Rp 8,5 jt', line: 'Sudah dapat booth, alat, bahan baku, cup custom & POS.', img: '/img/cup-forest.webp' },
		{ tone: 'sage', kicker: 'Royalti bulanan', big: '0%', line: 'Omzet 100% milik Anda. Cukup ambil bahan baku dari pusat.' },
		{ tone: 'white', kicker: 'Tablet POS', big: 'Gratis 6 bln', line: 'Kasir, stok & laporan penjualan dalam satu layar. Kompetitor sekelas jarang menyediakan.' },
		{ tone: 'photo', kicker: 'Harga jual', big: 'Rp 15–22 rb', line: 'Tampilan kelas mall membuat pembeli rela membayar lebih.', img: '/img/g-jasmine.webp' },
		{ tone: 'gold', kicker: 'Balik modal*', big: '±4–5 bln', line: 'Di skenario sepi: 30 cup/hari, paket Standard.', foot: '*Simulasi, bukan jaminan penghasilan.' },
		{ tone: 'forest', kicker: 'Siap jualan', big: '7–14 hari', line: 'Dari pelunasan sampai booth menyala di lokasi Anda.' }
	];

	let track: HTMLDivElement;
	const step = (dir: 1 | -1) => {
		const card = track.querySelector<HTMLElement>('article');
		track.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 16), behavior: 'smooth' });
	};

	const tone = {
		forest: 'bg-deep-forest text-white',
		sage: 'bg-sage text-on-sage',
		white: 'bg-cream-raised text-ink ring-1 ring-linen',
		gold: 'bg-gold text-deep-forest',
		photo: 'bg-ink text-white'
	};
</script>

<section id="kemitraan" class="bg-cream py-20 md:py-28">
	<div class="wrap flex items-end justify-between gap-6" use:reveal>
		<div>
			<Eyebrow>Kenapa Chacha</Eyebrow>
			<h2 use:splitWords class="display mt-5 max-w-[18ch] text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-ink">
				Alasan mitra memilih <em class="text-forest">Chacha</em>
			</h2>
		</div>
		<div class="hidden gap-2 md:flex" data-reveal>
			<button class="grid size-12 place-items-center rounded-full border border-linen text-forest transition-colors hover:border-forest" onclick={() => step(-1)} aria-label="Sebelumnya"><ArrowLeft size={18} /></button>
			<button class="grid size-12 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-deep-forest" onclick={() => step(1)} aria-label="Berikutnya"><ArrowRight size={18} /></button>
		</div>
	</div>

	<div bind:this={track} class="rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-6 [scrollbar-width:none] md:mt-14" use:reveal={{ stagger: 0.08, y: 50 }}>
		{#each cards as c}
			<article data-reveal class="group relative aspect-[4/5] w-[78vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-[24px] p-6 md:w-[340px] md:p-7 {tone[c.tone]}">
				{#if c.tone === 'photo' && c.img}
					<img src={c.img} alt="" loading="lazy" class="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />
					<div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.55),transparent_45%,rgba(0,0,0,.65))]"></div>
				{/if}
				{#if c.tone === 'forest'}
					<Mountains class="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] w-full opacity-70" sun={false} parallax={false} seed={c.big.length * 7} />
				{/if}
				{#if c.tone === 'forest' && c.img}
					<img src={c.img} alt="" loading="lazy" class="absolute -bottom-6 -right-10 h-[62%] w-auto rotate-[8deg] rounded-[18px] object-cover shadow-2xl transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:rotate-[4deg] group-hover:scale-105" />
				{/if}
				{#if c.tone === 'sage'}
					<Jasmine size={220} stroke={1.4} class="absolute -bottom-12 -right-12 text-white/35" />
				{/if}
				{#if c.tone === 'white'}
					<!-- tablet + receipt motif -->
					<svg viewBox="0 0 200 150" class="absolute -bottom-2 right-0 w-[70%] text-forest" aria-hidden="true">
						<rect x="40" y="20" width="130" height="92" rx="10" fill="#1e1e1e" />
						<rect x="47" y="27" width="116" height="78" rx="4" fill="#E9EFE9" />
						<rect x="53" y="33" width="40" height="66" rx="3" fill="#6A9A7E" opacity=".5" />
						{#each [0, 1, 2, 3, 4] as i}<rect x="100" y={36 + i * 12} width="56" height="7" rx="2" fill="currentColor" opacity={0.25 + i * 0.08} />{/each}
						<path d="M92 112 L118 112 L112 138 L98 138 Z" fill="#2a2a2a" />
						<path d="M150 70 L186 70 L186 140 L180 136 L174 140 L168 136 L162 140 L156 136 L150 140 Z" fill="#fff" stroke="#e1ddd3" />
						{#each [80, 90, 100, 110] as y}<line x1="156" x2="180" y1={y} y2={y} stroke="#cfcac0" stroke-width="2" />{/each}
					</svg>
				{/if}

				<div class="relative flex h-full flex-col">
					<p class="text-[12px] font-bold uppercase tracking-[0.16em] opacity-80">{c.kicker}</p>
					<p class="mt-3 text-[clamp(2.8rem,4.2vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">{c.big}</p>
					<p class="mt-4 max-w-[24ch] text-[15px] font-medium leading-snug opacity-90">{c.line}</p>
					{#if c.foot}<p class="mt-auto text-[11px] opacity-75">{c.foot}</p>{/if}
					<p class="mt-auto flex items-center gap-2 pt-4 text-[11px] font-bold tracking-[0.2em] opacity-70 {c.foot ? 'hidden' : ''}">CHACHA</p>
				</div>
			</article>
		{/each}
	</div>
</section>

<style>
	/* align the first card with the page gutter, let the rest bleed to the edge */
	.rail {
		--g: 20px;
		padding-inline: max(var(--g), calc((100vw - 1240px) / 2 + var(--g)));
		scroll-padding-inline: max(var(--g), calc((100vw - 1240px) / 2 + var(--g)));
	}
	@media (min-width: 768px) {
		.rail {
			--g: 40px;
		}
	}
</style>
