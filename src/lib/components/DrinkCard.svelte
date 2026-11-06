<script lang="ts">
	import { rupiah, type Drink } from '$lib/data';

	let { drink, showBase = false, compact = false }: { drink: Drink; showBase?: boolean; compact?: boolean } = $props();
</script>

<article class="relative flex h-full flex-col">
	<div class="relative rounded-[12px] bg-white {compact ? 'h-36 sm:h-64' : 'h-52 sm:h-64'}">
		<img src="/img/site/drinks/{drink.slug}.webp" alt={drink.name} loading="lazy" decoding="async" class="absolute inset-0 size-full object-contain p-3 sm:p-4" />
	</div>
	{#if drink.best}
		<span class="absolute right-2 top-2 rounded-full bg-deep-forest px-2 py-1 font-display text-[9px] font-medium uppercase tracking-[0.12em] text-gold sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1.5 sm:text-[10px]">Best seller</span>
	{/if}
	<h3 class="mt-3 font-display font-medium text-ink {compact ? 'text-[15px] leading-5 sm:text-[21px] sm:leading-7' : 'text-[17px] leading-[22px] sm:text-[21px] sm:leading-7'}">{drink.name}</h3>
	{#if showBase && drink.base}<p class="mt-0.5 hidden text-[13px] leading-5 text-ink-muted sm:block">{drink.base}</p>{/if}
	<p class="price mt-1 text-forest {compact ? 'text-[14px] sm:text-[18px]' : 'text-[15px] sm:text-[18px]'}">{rupiah(drink.price)}</p>
</article>
