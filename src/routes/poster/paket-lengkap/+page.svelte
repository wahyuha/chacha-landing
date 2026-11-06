<script lang="ts">
	import PosterLengkap from '$lib/components/PosterLengkap.svelte';
</script>

<svelte:head>
	<title>Poster Paket Lengkap · Chacha</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- Full-size 1080 × 1350 artboard; scripts/export-poster.mjs screenshots this page. -->
<div class="poster-page">
	<PosterLengkap fit={false} />
</div>

<style>
	.poster-page {
		width: 1080px;
		height: 1350px;
		overflow: hidden;
	}
	:global(body:has(.poster-page)) {
		margin: 0;
	}
</style>
