<script lang="ts">
	import Eyebrow from './Eyebrow.svelte';
	import PhotoSlot from './PhotoSlot.svelte';
	import { proof, chats } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	const span = { tall: 'row-span-2', wide: 'col-span-2', sq: '' } as const;
</script>

<section id="bukti" class="bg-cream py-20 md:py-28">
	<div class="wrap">
		<div class="grid gap-6 md:grid-cols-12 md:items-end" use:reveal>
			<div class="md:col-span-7">
				<Eyebrow>Bukti di lapangan</Eyebrow>
				<h2 use:splitWords class="display mt-5 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-ink">
					Booth yang bikin orang <span class="marker text-forest">berhenti &amp; antre</span>
				</h2>
			</div>
			<p class="text-[16px] leading-relaxed text-ink-muted md:col-span-5" data-reveal>
				Tampilan premium bukan sekadar cantik. Cup dan booth yang layak difoto membuat pembeli datang, memotret, dan membagikannya.
			</p>
		</div>

		<div class="mt-10 grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 md:mt-14 md:auto-rows-[220px] md:grid-cols-4 md:gap-4" use:reveal={{ stagger: 0.07 }}>
			{#each proof as p}
				<figure data-reveal class="group relative overflow-hidden rounded-[20px] ring-1 ring-linen {span[p.span]}">
					{#if p.src}
						<img src={p.src} alt={p.cap} loading="lazy" class="size-full object-cover transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-105" />
						<figcaption class="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-ink backdrop-blur">{p.cap}</figcaption>
					{:else}
						<PhotoSlot brief={p.brief} />
					{/if}
				</figure>
			{/each}
		</div>

		<div class="mt-16 md:mt-20" use:reveal>
			<div class="flex flex-col justify-between gap-3 md:flex-row md:items-end" data-reveal>
				<h3 class="display text-[clamp(1.6rem,3vw,2.3rem)] leading-tight text-ink">Kata mitra Chacha</h3>
				<p class="text-[13px] text-ink-muted">Screenshot asli, ditampilkan dengan izin mitra.</p>
			</div>
			<ul class="mt-6 grid gap-4 sm:grid-cols-3">
				{#each chats as c}
					<li data-reveal class="mx-auto w-full max-w-[300px]">
						<!-- phone frame -->
						<div class="rounded-[32px] bg-ink p-2 shadow-[0_24px_50px_-24px_rgba(0,0,0,.5)]">
							<div class="aspect-[9/16] overflow-hidden rounded-[26px] bg-[#ECE5DD]">
								{#if c.src}
									<img src={c.src} alt="Testimoni mitra Chacha via WhatsApp" loading="lazy" class="size-full object-cover object-top" />
								{:else}
									<PhotoSlot brief={c.brief} />
								{/if}
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.marker {
		background: linear-gradient(transparent 62%, rgba(212, 176, 98, 0.45) 62%, rgba(212, 176, 98, 0.45) 92%, transparent 92%);
	}
</style>
