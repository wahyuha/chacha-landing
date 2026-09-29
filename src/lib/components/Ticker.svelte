<script lang="ts">
	import { ticker } from '$lib/data';
	const items = [...ticker, ...ticker];
</script>

<div class="on-dark relative overflow-hidden bg-deep-forest py-4 text-white md:py-5" aria-label="Keunggulan kemitraan Chacha">
	<ul class="marquee flex w-max items-center gap-8 whitespace-nowrap text-[15px] font-bold uppercase tracking-wide md:text-[17px]">
		{#each items as t, i}
			<li class="flex items-center gap-8" aria-hidden={i >= ticker.length}>
				{t}<svg viewBox="-12 -12 24 24" class="size-4 text-gold" aria-hidden="true"><path d="M0 -11 C1 -2 2 -1 11 0 C2 1 1 2 0 11 C-1 2 -2 1 -11 0 C-2 -1 -1 -2 0 -11Z" fill="currentColor" /></svg>
			</li>
		{/each}
	</ul>
</div>

<style>
	.marquee {
		animation: marquee 38s linear infinite;
	}
	.marquee:hover {
		animation-play-state: paused;
	}
	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}
</style>
