<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children, dark = false }: { children: Snippet; dark?: boolean } = $props();
</script>

<p class="label flex items-center gap-3 {dark ? 'text-gold' : 'text-sage-text'}" data-reveal>
	<span class="h-px w-8 {dark ? 'bg-gold/60' : 'bg-sage'}"></span>
	{@render children()}
</p>
