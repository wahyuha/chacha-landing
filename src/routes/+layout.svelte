<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initMotion } from '$lib/motion';

	let { children } = $props();
	onMount(() => initMotion());
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

{@render children()}
