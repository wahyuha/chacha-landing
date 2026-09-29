<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { promo, waLink } from '$lib/data';

	// Full-width WhatsApp bar that follows the reader after the hero, like ad landing pages do.
	let show = $state(false);
	onMount(() => {
		const on = () => (show = window.scrollY > window.innerHeight * 0.6);
		on();
		window.addEventListener('scroll', on, { passive: true });
		return () => window.removeEventListener('scroll', on);
	});
</script>

{#if show}
	<div class="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:pb-5" transition:fly={{ y: 80, duration: 500 }}>
		<a
			href={waLink(promo.message)}
			target="_blank"
			rel="noopener"
			class="cta-shine mx-auto flex h-14 max-w-2xl items-center justify-center gap-2.5 rounded-[16px] bg-forest px-4 text-[13.5px] font-bold uppercase tracking-[0.01em] text-white sm:gap-3 sm:px-5 sm:text-[15px] sm:tracking-wide shadow-[0_18px_40px_-12px_rgba(20,63,49,.65)] ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-0.5 md:h-16 md:text-[16px]"
		>
			<span class="relative grid size-8 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
				<span class="absolute inset-0 animate-ping rounded-full bg-[#25D366]/50"></span>
				<svg viewBox="0 0 24 24" class="relative size-[18px] fill-current" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.93-4.66-4.11-.13-.18-1.11-1.48-1.11-2.83 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.28-.12.56.16.27.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.33Z" /></svg>
			</span>
			<span class="truncate sm:hidden">{promo.ctaShort}</span><span class="hidden truncate sm:inline">{promo.cta}</span>
			{#if promo.slotsLeft !== null}
				<span class="hidden shrink-0 rounded-full bg-gold px-2.5 py-1 text-[11px] text-deep-forest sm:inline">Sisa {promo.slotsLeft} slot</span>
			{/if}
		</a>
	</div>
{/if}
