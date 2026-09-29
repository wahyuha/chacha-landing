<script lang="ts">
	import { Check, Minus } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { compare } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';
</script>

<section class="bg-cream-raised py-20 md:py-28">
	<div class="wrap max-w-5xl">
		<div class="text-center" use:reveal>
			<div class="flex justify-center"><Eyebrow>Bandingkan</Eyebrow></div>
			<h2 use:splitWords class="display mt-5 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-ink">
				Sedikit lebih mahal, <span class="text-forest">jauh lebih lengkap</span>
			</h2>
		</div>
		<div class="mt-10 overflow-hidden rounded-[24px] bg-white ring-1 ring-linen md:mt-14" use:reveal={{ stagger: 0.05, y: 16 }}>
			<div class="grid grid-cols-[1.1fr_1fr_1fr] border-b border-linen text-[12px] font-bold uppercase tracking-[0.14em] md:text-[13px]">
				<div class="p-4 md:p-5"></div>
				<div class="bg-deep-forest p-4 text-center text-gold md:p-5">{compare.cols[0]}</div>
				<div class="p-4 text-center text-ink-muted md:p-5">{compare.cols[1]}</div>
			</div>
			{#each compare.rows as r, i}
				<div data-reveal class="grid grid-cols-[1.1fr_1fr_1fr] text-[14px] md:text-[15px] {i < compare.rows.length - 1 ? 'border-b border-linen' : ''}">
					<div class="p-4 font-semibold text-ink md:p-5">{r.k}</div>
					<div class="flex items-start gap-2 bg-sage-soft/60 p-4 font-semibold text-forest md:p-5"><Check size={18} class="mt-0.5 shrink-0 text-sage" strokeWidth={2.5} /><span>{r.a}</span></div>
					<div class="flex items-start gap-2 p-4 text-ink-muted md:p-5"><Minus size={18} class="mt-0.5 shrink-0 opacity-50" /><span>{r.b}</span></div>
				</div>
			{/each}
		</div>
		<p class="mt-4 text-center text-[12px] text-ink-muted">Perbandingan umum dengan paket kemitraan minuman di kisaran harga Rp 2–5 juta.</p>
	</div>
</section>
