<script lang="ts">
	import PosterPaket1 from '$lib/components/PosterPaket1.svelte';
</script>

<svelte:head>
	<title>Poster Paket 1 · Chacha</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- Full-size 1080 × 1350 artboard; scripts/export-poster.mjs screenshots this page. -->
<div class="poster-page">
	<PosterPaket1 fit={false} />
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
