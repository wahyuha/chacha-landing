<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Mountains from './Mountains.svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { reveal } from '$lib/motion';
	import type { Variant } from '$lib/cup/texture';

	let section: HTMLElement;
	let stage: HTMLDivElement;
	let variant: Variant = $state('forest');
	let progress = $state(0);
	let pointer = $state({ x: 0, y: 0 });
	let Canvas: Component<any> | null = $state(null);
	let Scene: Component<any> | null = $state(null);
	let failed = $state(false);

	const hasWebGL = () => {
		try {
			const c = document.createElement('canvas');
			return !!(c.getContext('webgl2') || c.getContext('webgl'));
		} catch {
			return false;
		}
	};

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		const st = ScrollTrigger.create({
			trigger: section,
			start: 'top bottom',
			end: 'bottom top',
			onUpdate: (s) => (progress = s.progress)
		});
		// load three.js only when the section approaches
		const io = new IntersectionObserver(
			async ([e]) => {
				if (!e.isIntersecting) return;
				io.disconnect();
				if (!hasWebGL()) return (failed = true);
				try {
					const [core, scene] = await Promise.all([import('@threlte/core'), import('$lib/cup/Scene.svelte')]);
					Canvas = core.Canvas;
					Scene = scene.default;
				} catch {
					failed = true;
				}
			},
			{ rootMargin: '600px' }
		);
		io.observe(section);
		return () => {
			st.kill();
			io.disconnect();
		};
	});

	function onMove(e: PointerEvent) {
		const r = stage.getBoundingClientRect();
		pointer = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
	}
</script>

<section bind:this={section} class="on-dark grain relative overflow-hidden bg-deep-forest text-cream">
	<Mountains class="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] w-full opacity-70" seed={21} />
	<div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent"></div>

	<div class="wrap relative grid min-h-[100svh] items-center gap-6 py-24 md:grid-cols-12 md:py-32">
		<div class="relative z-10 md:col-span-5" use:reveal>
			<Eyebrow dark>Desain cup</Eyebrow>
			<h2 class="display mt-6 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.04]">
				Cup yang bikin pembeli <em class="italic text-gold">mengeluarkan HP</em>
			</h2>
			<p class="mt-6 max-w-[40ch] text-[16px] leading-[1.75] text-cream/75" data-reveal>
				Ilustrasinya kebun teh di kaki gunung, digambar dengan garis emas. Buat kamu, itu promosi gratis setiap kali ada yang memotretnya.
			</p>
			<div class="mt-9 inline-flex rounded-full border border-cream/15 p-1" role="radiogroup" aria-label="Pilih desain cup" data-reveal>
				{#each [{ v: 'forest', l: 'Hijau Hutan' }, { v: 'cream', l: 'Krem Pagi' }] as o}
					<button
						role="radio"
						aria-checked={variant === o.v}
						onclick={() => (variant = o.v as Variant)}
						class="flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors duration-300 {variant === o.v ? 'bg-cream text-deep-forest' : 'text-cream/70 hover:text-cream'}"
					>
						<span class="size-3 rounded-full border border-gold {o.v === 'forest' ? 'bg-forest' : 'bg-cream'}"></span>{o.l}
					</button>
				{/each}
			</div>
			<p class="mt-5 text-[13px] text-cream/45" data-reveal>Geser untuk memutar cup</p>
		</div>

		<div bind:this={stage} class="relative z-10 -mx-5 h-[62svh] min-h-[420px] md:col-span-7 md:mx-0 md:h-[82svh]" onpointermove={onMove} onpointerleave={() => (pointer = { x: 0, y: 0 })} role="img" aria-label="Cup Chacha berputar 360 derajat, desain {variant === 'forest' ? 'hijau hutan' : 'krem pagi'}">
			<div class="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"></div>
			{#if Canvas && Scene && !failed}
				<Canvas dpr={[1, 2]}>
					<Scene {variant} {progress} {pointer} />
				</Canvas>
			{:else}
				<img src={variant === 'forest' ? '/img/cup-render.webp' : '/img/cup-cream-render.webp'} alt="" class="absolute inset-0 m-auto h-[80%] w-auto object-contain" loading="lazy" />
			{/if}
		</div>
	</div>
</section>
