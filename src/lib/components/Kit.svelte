<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Plus, ArrowDown } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { kitItems, kitExtras } from '$lib/data';
	import { reducedMotion, reveal } from '$lib/motion';
	import { rng } from '$lib/art';
	import { srcset } from '$lib/img';

	// "Buka kotaknya": on desktop the equipment starts as a messy pile around the booth and snaps
	// into a knolling flat-lay as the reader scrolls. On phones it is a plain staggered grid.
	const total = kitItems.length + kitExtras.length;

	let section: HTMLElement;
	let tray: HTMLDivElement;
	let count = $state(total);

	onMount(() => {
		if (reducedMotion()) return;
		gsap.registerPlugin(ScrollTrigger);
		const mm = gsap.matchMedia();
		mm.add('(min-width: 1024px) and (min-height: 640px)', () => {
			const r = rng(11);
			const items = gsap.utils.toArray<HTMLElement>('[data-item]', tray);
			const jitter = items.map(() => ({ x: (r() - 0.5) * 340, y: (r() - 0.5) * 200, rot: (r() - 0.5) * 80, s: 0.62 + r() * 0.25 }));
			// distance from each tile to the middle of the tray, measured live so resizes stay correct
			const toCenter = (el: HTMLElement) => {
				const t = tray.getBoundingClientRect();
				const b = el.getBoundingClientRect();
				return { x: t.left + t.width / 2 - (b.left + b.width / 2), y: t.top + t.height / 2 - (b.top + b.height / 2) };
			};
			count = 0;

			const tl = gsap.timeline({
				defaults: { ease: 'power2.inOut' },
				scrollTrigger: {
					trigger: section,
					start: 'top top',
					end: '+=170%',
					pin: true,
					scrub: 0.7,
					invalidateOnRefresh: true,
					onUpdate: (st) => (count = Math.round(gsap.utils.clamp(0, 1, (st.progress - 0.1) / 0.6) * total))
				}
			});
			tl.from('[data-booth]', { scale: 0.85, yPercent: 10, opacity: 0.4, duration: 1 }, 0)
				.from(
					items.map((el) => el.querySelector('[data-obj]')),
					{
						x: (i) => toCenter(items[i]).x * 0.6 + jitter[i].x,
						y: (i) => toCenter(items[i]).y * 0.55 + jitter[i].y,
						rotate: (i) => jitter[i].rot,
						scale: (i) => jitter[i].s,
						duration: 1,
						stagger: { each: 0.035, from: 'center' }
					},
					0
				)
				.from('[data-cell]', { opacity: 0, duration: 0.4, stagger: 0.02 }, 0.55)
				.from('[data-label]', { opacity: 0, y: 12, duration: 0.4, stagger: 0.025 }, 0.7)
				.from('[data-hint]', { opacity: 1, duration: 0.2 }, 0)
				.to('[data-hint]', { opacity: 0, duration: 0.2 }, 0.15);

			return () => (count = total);
		});
		return () => mm.revert();
	});
</script>

{#snippet obj(id: string, name: string)}
	<img data-obj src="/img/kit/{id}.webp" srcset={srcset(`/img/kit/${id}.webp`)} sizes="(min-width: 1024px) 160px, 110px" alt={name} loading="lazy" draggable="false" class="obj pointer-events-none max-h-full max-w-full object-contain" />
{/snippet}

<section bind:this={section} id="isi-paket" class="relative overflow-hidden border-t border-forest/10 bg-cream py-20 lg:h-[100svh] lg:min-h-[680px] lg:py-0">
	<div class="wrap grid gap-10 lg:h-full lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-8 lg:pb-24 lg:pt-24">
		<!-- left: copy, counter, booth -->
		<div class="flex flex-col lg:min-h-0" use:reveal>
			<Eyebrow>Isi paket</Eyebrow>
			<h2 class="display mt-4 text-[clamp(2.1rem,3.4vw,3.1rem)] leading-[1.02] text-ink" data-reveal>
				Ini yang kamu terima <span class="text-forest">di dalam kotak.</span>
			</h2>
			<p class="mt-3 max-w-[40ch] text-[15.5px] leading-relaxed text-ink-muted" data-reveal>
				Kami foto satu per satu, apa adanya di meja dapur kami. Alat yang sama yang kami pakai sendiri setiap hari.
			</p>
			<div class="mt-5 flex items-end gap-3" data-reveal>
				<p class="text-[clamp(3.4rem,5vw,4.6rem)] font-extrabold leading-[0.85] tracking-[-0.05em] text-forest tabular-nums">{count}</p>
				<p class="pb-1 text-[12px] font-semibold uppercase leading-tight tracking-[0.14em] text-ink-muted">item<br />peralatan</p>
			</div>
			<figure data-booth class="relative mt-6 flex h-[280px] min-h-0 flex-col items-center justify-end rounded-[24px] bg-[radial-gradient(70%_60%_at_50%_75%,#f3ece0,transparent)] lg:h-auto lg:flex-1">
				<img src="/img/cut/booth-front.webp" srcset={srcset('/img/cut/booth-front.webp')} sizes="(min-width: 1024px) 30vw, 90vw" alt="Booth Chacha tampak depan" class="booth min-h-0 w-auto max-w-full flex-1 object-contain object-bottom" loading="lazy" />
				<figcaption class="mt-2 text-center text-[12.5px] text-ink-muted"><strong class="text-ink">+ Booth 110 × 55 × 80 cm</strong> di Paket Lengkap</figcaption>
			</figure>
		</div>

		<!-- right: the tray -->
		<div bind:this={tray} class="mat relative grid grid-cols-2 gap-3 rounded-[28px] p-3 sm:grid-cols-3 md:p-4 lg:min-h-0 lg:grid-cols-5 lg:grid-rows-3 lg:gap-2.5" use:reveal={{ stagger: 0.04, y: 24 }}>
			{#each kitItems as k, i}
				<article data-item data-reveal class="tile group relative flex min-h-[200px] flex-col rounded-[18px] p-3 lg:min-h-0">
					<div data-cell class="absolute inset-0 rounded-[18px] bg-white ring-1 ring-black/5 transition-shadow duration-500 group-hover:shadow-[0_22px_40px_-24px_rgba(20,63,49,.55)]"></div>
					<span data-label class="absolute left-2.5 top-2.5 z-10 grid size-6 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{i + 1}</span>
					<span data-label class="absolute right-2.5 top-2.5 z-10 rounded-full bg-sage-soft px-2 py-0.5 text-[11px] font-bold text-forest">×{k.qty}{k.unit ? ` ${k.unit}` : ''}</span>
					<div class="lift relative z-[1] flex min-h-0 flex-1 items-center justify-center px-1 pb-1.5 pt-7">{@render obj(k.id, k.name)}</div>
					<div data-label class="relative z-[1] text-center">
						<p class="text-[13.5px] font-bold leading-tight text-ink">{k.name}</p>
						<p class="text-[11.5px] text-ink-muted">{k.spec}</p>
					</div>
					<!-- usage tip on hover -->
					<p class="pointer-events-none absolute inset-x-2 bottom-2 z-20 hidden translate-y-1 rounded-[12px] bg-ink/95 px-3 py-2 text-center text-[12px] leading-snug text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:block">{k.tip}</p>
				</article>
			{/each}

			<!-- the rest -->
			<article data-item data-reveal class="relative col-span-2 flex min-h-[200px] flex-col justify-center rounded-[18px] p-5 sm:col-span-1 lg:col-span-2 lg:min-h-0">
				<div data-cell class="absolute inset-0 rounded-[18px] bg-forest"></div>
				<div data-obj class="relative z-[1] text-white">
					<span class="grid size-9 place-items-center rounded-full bg-white/15 text-gold"><Plus size={18} /></span>
					<p class="mt-2 text-[24px] font-extrabold leading-none tracking-tight">+{kitExtras.length} lainnya</p>
					<ul data-label class="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[12px] leading-snug text-white/75">
						{#each kitExtras as e}<li>{e}</li>{/each}
					</ul>
				</div>
			</article>

			<p data-hint class="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-forest opacity-0 shadow-md lg:flex"><ArrowDown size={15} class="animate-bounce" />Gulir untuk merapikan</p>
		</div>
	</div>
</section>


<style>
	/* a soft cutting-mat surface so every cutout sits on the same ground */
	.mat {
		background-color: #ece6da;
		background-image:
			linear-gradient(rgba(20, 63, 49, 0.06) 1px, transparent 1px),
			linear-gradient(90deg, rgba(20, 63, 49, 0.06) 1px, transparent 1px);
		background-size: 28px 28px;
		box-shadow: inset 0 2px 20px rgba(0, 0, 0, 0.05);
	}
	.obj,
	.booth {
		filter: drop-shadow(0 14px 14px rgba(30, 25, 15, 0.22)) drop-shadow(0 2px 3px rgba(30, 25, 15, 0.18));
	}
	.lift {
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.tile:hover .lift {
		transform: translateY(-6px) rotate(-3deg) scale(1.06);
	}
	.tile .obj {
		max-height: 140px;
	}
	@media (min-width: 1024px) {
		.tile .obj {
			max-height: 100%;
		}
	}
</style>
