<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initMotion } from '$lib/motion';

	let { children } = $props();
	onMount(() => initMotion());
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

{@render children()}
