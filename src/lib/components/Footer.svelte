<script lang="ts">
	import { socials, waLink } from '$lib/data';

	let { note = '' }: { note?: string } = $props();
	const year = new Date().getFullYear();
</script>

<footer class="on-dark bg-deep-forest text-mist">
	<div class="wrap grid gap-12 py-16 md:grid-cols-12">
		<div class="md:col-span-5">
			<img src="/img/site/logo-stacked-white.webp" alt="Chacha, milk tea and fresh drink" width="132" height="152" class="h-auto w-33" loading="lazy" />
			<p class="tagline mt-6 text-[16px] leading-snug">From Nature to Your Cup</p>
		</div>
		<div class="text-[14px] md:col-span-3">
			<p class="label text-gold">Chacha</p>
			<ul class="mt-4 grid gap-2.5">
				<li><a class="hover:text-white" href="/menu">Menu</a></li>
				<li><a class="hover:text-white" href="/#teh">Teh kami</a></li>
				<li><a class="hover:text-white" href="/#outlet">Outlet</a></li>
			</ul>
		</div>
		<div class="text-[14px] md:col-span-4">
			<p class="label text-gold">Hubungi</p>
			<ul class="mt-4 grid gap-2.5">
				<li><a class="hover:text-white" href="/kemitraan">Kemitraan</a></li>
				<li><a class="hover:text-white" href={waLink('Halo Chacha')} target="_blank" rel="noopener">WhatsApp</a></li>
				{#each socials as s}
					<li><a class="hover:text-white" href={s.href} target="_blank" rel="noopener">{s.label}</a></li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="border-t border-white/10">
		<!-- Bottom padding clears the sticky bars: on all widths for the kemitraan page (the one with a note), phones only elsewhere. -->
		<div class="wrap flex flex-col justify-between gap-2 pt-6 text-[12px] text-mist/80 md:flex-row {note ? 'pb-28' : 'pb-24 md:pb-8'}">
			<p>© {year} Chacha. www.chachatea.id</p>
			{#if note}<p>{note}</p>{/if}
		</div>
	</div>
</footer>
