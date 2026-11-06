<script lang="ts">
	import { Check, Camera } from '@lucide/svelte';
	import { trackRecord as tr } from '$lib/data';
	import { reveal } from '$lib/motion';

	// Snapshot layout: fixed tilts so the collage reads as hand-pinned photos, not a grid.
	const tilt = ['-4deg', '3deg', '-2deg', '4deg'];
	const lift = ['0px', '48px', '-12px', '36px'];
</script>

<section id="outlet" class="relative overflow-hidden bg-cream-raised py-20 md:py-28">
	<div class="wrap grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-12 lg:gap-10">
		<div class="lg:col-span-4" use:reveal={{ stagger: 0.08 }}>
			<p class="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-forest ring-1 ring-linen" data-reveal>
				<Camera size={14} />Foto asli dari outlet kami
			</p>
			<h2 class="display mt-5 text-[clamp(2.1rem,3.6vw,3.2rem)] leading-[1.03] text-ink" data-reveal>
				Kami tidak cuma jual paket. <span class="text-forest">Kami juga jualan setiap hari.</span>
			</h2>
			<p class="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-ink-muted" data-reveal>
				Ini foto dari outlet <strong class="text-ink">{tr.outlet}</strong> yang {tr.relation} dengan Chacha, diambil pakai HP waktu jam ramai. Pembelinya asli, antreannya juga.
			</p>
			<ul class="mt-7 grid gap-3">
				{#each tr.points as p}
					<li class="flex items-start gap-3 text-[15px] leading-snug text-ink/85" data-reveal>
						<span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-forest text-white"><Check size={14} strokeWidth={3} /></span>{p}
					</li>
				{/each}
			</ul>
		</div>

		<!-- snapshots -->
		<div class="lg:col-span-8" use:reveal={{ stagger: 0.12, y: 50 }}>
			<div class="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-10 pt-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 lg:-mr-6 lg:gap-5">
				{#each tr.photos as ph, i}
					<figure data-reveal class="w-[58vw] max-w-[260px] shrink-0 snap-center sm:w-auto sm:max-w-none" style="--t:{tilt[i]};--y:{lift[i]}">
						<div class="snap rounded-[6px] bg-white p-2 pb-10 shadow-[0_26px_50px_-28px_rgba(20,30,25,.55)] ring-1 ring-black/5">
							<div class="aspect-[3/4.4] overflow-hidden rounded-[3px] bg-linen">
								<img src={ph.src} alt={ph.alt} loading="lazy" class="size-full object-cover transition-transform duration-[1.2s] ease-(--ease-soft)" />
							</div>
							<figcaption class="serif absolute bottom-2.5 left-0 right-0 text-center text-[17px] leading-tight text-ink/80">{ph.note}</figcaption>
						</div>
					</figure>
				{/each}
			</div>
			<p class="text-center text-[12.5px] text-ink-muted sm:text-right">Outlet {tr.outlet} · {tr.relation}</p>
		</div>
	</div>
</section>

<style>
	.snap {
		position: relative;
		transform: rotate(var(--t)) translateY(var(--y));
		transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.snap:hover {
		transform: rotate(0deg) translateY(calc(var(--y) - 8px)) scale(1.04);
		z-index: 2;
	}
	.snap:hover img {
		transform: scale(1.05);
	}
	@media (max-width: 639px) {
		.snap {
			transform: rotate(var(--t));
		}
	}
</style>
