<script lang="ts">
	import { LOGO } from '$lib/brand/logo-paths';

	// The brand logo (leaf-A wordmark + "FRESH DRINK & MILK TEA"), drawn from vector paths in currentColor.
	// `cap` is the height of the capitals in px; the subline is too small to read below ~cap 24.
	let { cap = 20, sub = false, class: cls = '' }: { cap?: number; sub?: boolean; class?: string } = $props();

	const pad = 2; // room for the round letters' overshoot
	const vbH = $derived(sub ? LOGO.height + pad : LOGO.cap + pad * 2);
	const width = $derived((LOGO.width / LOGO.cap) * cap);
	const height = $derived((vbH / LOGO.cap) * cap);
</script>

<svg viewBox="0 {-pad} {LOGO.width} {vbH}" {width} {height} class="block {cls}" role="img" aria-label="Chacha{sub ? ' — Fresh Drink & Milk Tea' : ''}">
	<path d={LOGO.word} fill="currentColor" />
	{#if sub}<path d={LOGO.sub} fill="currentColor" />{/if}
</svg>
