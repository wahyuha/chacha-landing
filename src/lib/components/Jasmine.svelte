<script lang="ts">
	import { PETAL } from '$lib/art';
	let { class: cls = '', size = 64, stroke = 1.1, filled = false }: { class?: string; size?: number; stroke?: number; filled?: boolean } = $props();
</script>

<svg viewBox="-30 -30 60 60" width={size} height={size} class={cls} aria-hidden="true">
	{#each [0, 72, 144, 216, 288] as a}
		<path d={PETAL} transform="rotate({a})" fill={filled ? 'currentColor' : 'none'} fill-opacity={filled ? 0.12 : 0} stroke="currentColor" stroke-width={stroke} vector-effect="non-scaling-stroke" />
	{/each}
	<circle r="3.2" fill="currentColor" />
	{#each [0, 60, 120, 180, 240, 300] as a}
		<line x1="0" y1="0" x2="0" y2="-7" transform="rotate({a + 30})" stroke="currentColor" stroke-width={stroke * 0.8} vector-effect="non-scaling-stroke" />
	{/each}
</svg>
