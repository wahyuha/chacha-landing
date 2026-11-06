<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ArrowRight, BadgePercent, GraduationCap, Timer, Sparkles } from '@lucide/svelte';
	import { reducedMotion, scrollToId, splitWords } from '$lib/motion';
	import { promo, waLink } from '$lib/data';

	let section: HTMLElement;
	let frame: HTMLDivElement;
	let photo: HTMLImageElement;

	onMount(() => {
		if (reducedMotion()) return;
		const ctx = gsap.context(() => {
			gsap.from(frame, { clipPath: 'inset(14% 10% 14% 10% round 28px)', duration: 1.6, ease: 'power4.inOut' });
			gsap.from(photo, { scale: 1.3, duration: 2.2, ease: 'power3.out' });
			gsap.from('[data-hero-in]', { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.5 });
			gsap.from('[data-sticker]', { scale: 0, rotate: -40, duration: 1.1, ease: 'back.out(1.8)', delay: 1.2 });
			gsap.from('[data-float]', { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.15, delay: 1.4 });
			gsap.to(photo, { scale: 1.07, duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.2 });
		}, section);
		return () => ctx.revert();
	});
</script>

<section bind:this={section} id="top" class="relative overflow-hidden bg-cream pb-16 pt-24 md:pb-24 md:pt-32">
	<div class="wrap relative grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
		<div class="relative z-10 lg:col-span-6">
			{#if promo.ribbon}
				<a href={waLink(promo.message)} target="_blank" rel="noopener" data-hero-in class="group inline-flex items-center gap-2 rounded-full bg-sage-soft py-1.5 pl-1.5 pr-4 text-[13px] font-semibold text-forest">
					<span class="rounded-full bg-forest px-2.5 py-1 text-[11px] uppercase tracking-wider text-gold">Promo</span>
					{promo.ribbon}
					<ArrowRight size={14} class="transition-transform group-hover:translate-x-0.5" />
				</a>
			{/if}
			<h1 use:splitWords={{ scroll: false, delay: 0.15 }} class="display mt-6 text-[clamp(2.7rem,6.2vw,5.4rem)] leading-[0.98] text-ink">
				Punya usaha milk tea sendiri, mulai <span class="marker text-forest">Rp&nbsp;4,5&nbsp;juta</span>
			</h1>
			<p class="mt-6 max-w-[40ch] text-[17px] leading-[1.65] text-ink-muted md:text-[18px]" data-hero-in>
				Kami kirim booth, alat, dan bahan baku untuk 100 cup pertama, lalu mengajarimu sampai bisa. Kamu tinggal siapkan tempatnya.
			</p>
			<div class="mt-8 flex flex-wrap gap-3" data-hero-in>
				<a href={waLink(promo.message)} target="_blank" rel="noopener" class="btn btn-primary cta-shine group !h-14 !px-7 !text-[16px]">
					<svg viewBox="0 0 24 24" class="size-5 fill-current" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Z" /></svg>
					Tanya Dulu di WhatsApp
				</a>
				<a href="#paket" onclick={(e) => { e.preventDefault(); scrollToId('paket'); }} class="btn btn-outline !h-14 text-forest">Lihat Paket <ArrowRight size={17} /></a>
			</div>
			<ul class="mt-10 grid max-w-xl grid-cols-3 gap-3" data-hero-in>
				{#each [{ I: BadgePercent, t: '0% royalti', d: 'Omzetnya utuh milikmu' }, { I: GraduationCap, t: 'Diajari sampai bisa', d: 'Plus video SOP' }, { I: Timer, t: '7–14 hari', d: 'Booth sampai di lokasi' }] as f}
					<li class="rounded-[14px] border border-linen p-3 md:p-4">
						<f.I size={20} class="text-sage" strokeWidth={1.8} />
						<p class="mt-2 text-[15px] font-bold leading-tight text-ink">{f.t}</p>
						<p class="text-[12px] text-ink-muted">{f.d}</p>
					</li>
				{/each}
			</ul>
		</div>

		<div class="relative lg:col-span-6">
			<div bind:this={frame} class="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-cream-raised sm:aspect-[5/5] lg:aspect-[4/5]" style="clip-path: inset(0 round 28px)">
				<img bind:this={photo} src="/img/g-interior.webp" alt="Interior outlet Chacha: counter kayu oak berlampu hangat, lampu gantung hijau sage dan meja pembeli" class="size-full object-cover object-[28%_50%]" fetchpriority="high" />
			</div>
			<!-- price sticker -->
			<div data-sticker class="absolute -left-3 top-6 grid size-32 place-items-center rounded-full bg-gold text-deep-forest shadow-[0_18px_40px_-14px_rgba(122,94,34,.7)] md:-left-8 md:size-40">
				<svg viewBox="0 0 100 100" class="spin absolute inset-0 size-full" aria-hidden="true">
					<defs><path id="ring" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" /></defs>
					<text font-size="8.6" font-weight="700" letter-spacing="2.2" fill="currentColor"><textPath href="#ring">TANPA ROYALTI • BOLEH TANYA DULU • </textPath></text>
				</svg>
				<div class="text-center leading-none">
					<p class="text-[11px] font-bold uppercase tracking-wider">Mulai</p>
					<p class="mt-1 text-[26px] font-extrabold tracking-tight md:text-[32px]">4,5jt</p>
				</div>
			</div>
			<div data-float class="absolute -bottom-5 right-3 flex items-center gap-3 rounded-[18px] bg-white p-3 pr-5 shadow-[0_24px_60px_-20px_rgba(20,63,49,.45)] md:-right-4">
				<img src="/img/cup-cream-render.webp" alt="" class="size-14 rounded-[12px] bg-cream-raised object-cover object-[50%_46%]" />
				<div>
					<p class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sage-text"><Sparkles size={12} />Harga jual</p>
					<p class="text-[20px] font-extrabold tracking-tight text-ink">Rp 12–16 rb<span class="text-[13px] font-medium text-ink-muted"> /cup</span></p>
				</div>
			</div>
			<div data-float class="absolute right-4 top-4 hidden rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-forest backdrop-blur md:block">Rasa kelas mall, dekat rumah</div>
		</div>
	</div>
</section>

<style>
	.marker {
		background: linear-gradient(transparent 62%, rgba(212, 176, 98, 0.45) 62%, rgba(212, 176, 98, 0.45) 92%, transparent 92%);
		padding: 0 0.06em;
	}
	.spin {
		animation: spin 18s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
