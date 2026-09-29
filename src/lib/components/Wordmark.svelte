<script lang="ts">
	// The approved mark is a leaf-A wordmark; until the vector exists the name is set in type.
	let { sub = true, size = 22, class: cls = '' }: { sub?: boolean; size?: number; class?: string } = $props();
</script>

<span class="inline-flex flex-col items-center leading-none {cls}">
	<span style="font-size:{size}px;letter-spacing:0.16em;font-weight:650" class="pl-[0.16em]">CHACHA</span>
	{#if sub}
		<span style="font-size:{Math.max(8, size * 0.36)}px;letter-spacing:0.32em;font-weight:600" class="mt-[0.45em] pl-[0.32em] opacity-80">FRESH &amp; MILK TEA</span>
	{/if}
</span>
