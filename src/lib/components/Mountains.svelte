<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ridge, terraces, CLOUD } from '$lib/art';
	import { reducedMotion } from '$lib/motion';

	let {
		tone = 'gold',
		class: cls = '',
		sun = true,
		parallax = true,
		draw = true,
		seed = 7
	}: { tone?: 'gold' | 'forest'; class?: string; sun?: boolean; parallax?: boolean; draw?: boolean; seed?: number } = $props();

	const W = 1600;
	const H = 560;
	const layers = [
		ridge({ width: W, height: H, base: 300, peaks: 4, amp: 230, seed: seed, hatch: 7 }),
		ridge({ width: W, height: H, base: 360, peaks: 6, amp: 170, seed: seed + 11, hatch: 5 }),
		ridge({ width: W, height: H, base: 420, peaks: 5, amp: 120, seed: seed + 23, hatch: 3, sharp: false })
	];
	const fields = terraces(W, 460, H + 20, 7, seed + 5);

	const stroke = tone === 'gold' ? 'var(--color-gold)' : 'var(--color-forest)';
	const fillFor = (i: number) =>
		tone === 'gold'
			? ['#16463a', '#123b30', '#0f3329'][i]
			: ['#efe6d6', '#ebe0cd', '#e7dbc6'][i];

	let root: SVGSVGElement;

	onMount(() => {
		if (reducedMotion()) return;
		gsap.registerPlugin(ScrollTrigger);
		const ctx = gsap.context(() => {
			if (draw) {
				const lines = root.querySelectorAll<SVGPathElement>('.draw');
				lines.forEach((p) => {
					const len = p.getTotalLength();
					p.style.strokeDasharray = `${len}`;
					p.style.strokeDashoffset = `${len}`;
				});
				gsap.to(lines, {
					strokeDashoffset: 0,
					duration: 2.6,
					ease: 'power2.inOut',
					stagger: 0.18,
					scrollTrigger: { trigger: root, start: 'top 85%', once: true }
				});
				gsap.from(root.querySelectorAll('.hatch'), {
					opacity: 0,
					duration: 1.6,
					delay: 1.2,
					stagger: 0.2,
					scrollTrigger: { trigger: root, start: 'top 85%', once: true }
				});
			}
			if (parallax) {
				root.querySelectorAll<SVGGElement>('[data-depth]').forEach((g) => {
					const depth = Number(g.dataset.depth);
					gsap.fromTo(
						g,
						{ y: depth * 60 },
						{
							y: -depth * 60,
							ease: 'none',
							scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true }
						}
					);
				});
			}
		}, root);
		return () => ctx.revert();
	});
</script>

<svg bind:this={root} viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" class={cls} aria-hidden="true" fill="none">
	{#if sun}
		<g data-depth="1.6">
			<circle cx={W * 0.62} cy="150" r="34" fill="var(--color-gold)" />
			<circle cx={W * 0.62} cy="150" r="52" stroke="var(--color-gold)" stroke-opacity=".35" stroke-width="1" />
		</g>
	{/if}
	<g data-depth="1.3" stroke={stroke} stroke-width="1.3" stroke-linecap="round" opacity=".85">
		<path d={CLOUD} transform="translate({W * 0.18} 70) scale(1.4)" vector-effect="non-scaling-stroke" class="draw" />
		<path d={CLOUD} transform="translate({W * 0.76} 40) scale(1.1)" vector-effect="non-scaling-stroke" class="draw" />
		<path d={CLOUD} transform="translate({W * 0.44} 30) scale(0.8)" vector-effect="non-scaling-stroke" class="draw" />
	</g>
	{#each layers as l, i}
		<g data-depth={1 - i * 0.4}>
			<path d={l.fill} fill={fillFor(i)} />
			<path d={l.line} stroke={stroke} stroke-width={1.6 - i * 0.2} vector-effect="non-scaling-stroke" class="draw" />
			{#if l.hatch}
				<path d={l.hatch} stroke={stroke} stroke-width="0.8" stroke-opacity=".6" vector-effect="non-scaling-stroke" class="hatch" />
			{/if}
		</g>
	{/each}
	<g data-depth="-0.2">
		<path d={fields} stroke={stroke} stroke-width="0.9" stroke-opacity=".55" vector-effect="non-scaling-stroke" class="draw" />
	</g>
</svg>
