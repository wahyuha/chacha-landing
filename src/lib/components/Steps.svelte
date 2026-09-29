<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Eyebrow from './Eyebrow.svelte';
	import { steps } from '$lib/data';
	import { reducedMotion, reveal, splitWords } from '$lib/motion';

	let list: HTMLOListElement;
	let bar: HTMLDivElement;

	onMount(() => {
		if (reducedMotion()) return;
		gsap.registerPlugin(ScrollTrigger);
		const ctx = gsap.context(() => {
			gsap.fromTo(bar, { scaleX: 0, scaleY: 0 }, {
				scaleX: 1,
				scaleY: 1,
				ease: 'none',
				scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: true }
			});
			list.querySelectorAll('li').forEach((li) => {
				ScrollTrigger.create({
					trigger: li,
					start: 'top 68%',
					onEnter: () => li.classList.add('on'),
					onLeaveBack: () => li.classList.remove('on')
				});
			});
		});
		return () => ctx.revert();
	});
</script>

<section class="bg-cream py-24 md:py-36">
	<div class="wrap">
		<div class="max-w-2xl" use:reveal>
			<Eyebrow>Alur kemitraan</Eyebrow>
			<h2 use:splitWords class="display mt-6 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.04] text-forest">Dari chat pertama sampai booth menyala</h2>
		</div>

		<ol bind:this={list} class="relative mt-16 grid gap-10 pl-10 md:mt-24 md:grid-cols-6 md:gap-6 md:pl-0 md:pt-12">
			<!-- track -->
			<div class="absolute bottom-2 left-[11px] top-2 w-px bg-linen md:bottom-auto md:left-0 md:right-0 md:top-[11px] md:h-px md:w-auto"></div>
			<div bind:this={bar} class="absolute bottom-2 left-[11px] top-2 w-px origin-top bg-forest md:bottom-auto md:left-0 md:right-0 md:top-[11px] md:h-px md:w-auto md:origin-left"></div>
			{#each steps as s, i}
				<li class="step relative">
					<span class="dot absolute -left-10 top-0 grid size-[23px] place-items-center rounded-full border border-linen bg-cream md:-top-12 md:left-0">
						<span class="size-2 rounded-full bg-linen transition-colors duration-500"></span>
					</span>
					<p class="serif text-[15px] text-gold-text">Langkah {i + 1}</p>
					<h3 class="mt-2 text-[18px] font-semibold leading-snug text-ink">{s.t}</h3>
					<p class="mt-2 text-[14px] leading-relaxed text-ink-muted">{s.d}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.step {
		opacity: 0.45;
		transition: opacity 0.6s;
	}
	:global(.step.on) {
		opacity: 1;
	}
	:global(.step.on .dot) {
		border-color: var(--color-forest);
	}
	:global(.step.on .dot span) {
		background: var(--color-forest);
	}
	@media (prefers-reduced-motion: reduce) {
		.step {
			opacity: 1;
		}
	}
</style>
