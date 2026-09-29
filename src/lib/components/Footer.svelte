<script lang="ts">
	import Wordmark from './Wordmark.svelte';
	import { WA_NUMBER, waLink } from '$lib/data';
	const year = new Date().getFullYear();
</script>

<footer class="on-dark bg-night text-cream/70">
	<div class="wrap grid gap-12 py-16 md:grid-cols-12">
		<div class="md:col-span-5">
			<Wordmark size={24} class="text-cream" />
			<p class="serif mt-6 text-[26px] leading-snug text-cream">Good tea, good mood.</p>
		</div>
		<div class="text-[14px] md:col-span-3">
			<p class="label text-[10px] text-gold">Kemitraan</p>
			<ul class="mt-4 grid gap-2.5">
				<li><a class="hover:text-cream" href="#paket">Paket booth</a></li>
				<li><a class="hover:text-cream" href="#kalkulator">Simulasi balik modal</a></li>
				<li><a class="hover:text-cream" href="#faq">Pertanyaan umum</a></li>
			</ul>
		</div>
		<div class="text-[14px] md:col-span-4">
			<p class="label text-[10px] text-gold">Hubungi</p>
			<ul class="mt-4 grid gap-2.5">
				<li><a class="hover:text-cream" href={waLink('Halo Chacha')} target="_blank" rel="noopener">WhatsApp +{WA_NUMBER}</a></li>
			</ul>
		</div>
	</div>
	<div class="border-t border-cream/10">
		<div class="wrap flex flex-col justify-between gap-2 pb-28 pt-6 text-[12px] text-cream/45 md:flex-row">
			<p>© {year} Chacha. From Nature to Your Cup.</p>
			<p>Foto adalah visual konsep. Angka simulasi bersifat ilustrasi.</p>
		</div>
	</div>
</footer>
