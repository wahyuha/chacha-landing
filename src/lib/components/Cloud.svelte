<script lang="ts">
	import { CLOUD } from '$lib/art';
	let { class: cls = '', width = 120, stroke = 1.2 }: { class?: string; width?: number; stroke?: number } = $props();
</script>

<svg viewBox="0 0 120 48" width={width} height={width * 0.4} class={cls} aria-hidden="true" fill="none">
	<path d={CLOUD} stroke="currentColor" stroke-width={stroke} stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
</svg>
