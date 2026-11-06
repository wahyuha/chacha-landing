<script lang="ts">
	import { MessageCircle } from '@lucide/svelte';
	import Mountains from './Mountains.svelte';
	import Jasmine from './Jasmine.svelte';
	import { promo, waLink } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';
</script>

<section class="on-dark grain relative overflow-hidden bg-deep-forest text-cream">
	<div class="wrap relative z-10 flex flex-col items-center pt-28 text-center md:pt-36" use:reveal>
		<Jasmine size={54} class="text-gold" />
		<h2 use:splitWords class="display mt-8 max-w-[16ch] text-[clamp(2.3rem,5.6vw,4.6rem)] leading-[1.02]">
			Mulai dari satu chat <em class="italic text-gold">dulu</em>
		</h2>
		<p class="mt-7 max-w-[44ch] text-[17px] leading-[1.7] text-cream/75" data-reveal>
			Ceritakan kota dan rencana lokasimu. Kami kirim foto booth, isi paket, dan hitungannya. Setelah itu kamu yang memutuskan, tidak perlu buru-buru.
		</p>
		<div class="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
			<a href={waLink(promo.message)} target="_blank" rel="noopener" class="btn btn-gold"><MessageCircle size={18} />Chat Kami di WhatsApp</a>
		</div>
		<p class="mt-5 text-[13px] text-cream/50" data-reveal>Kami balas setiap hari, 08.00–21.00</p>
	</div>
	<div class="relative -mt-6 h-[38vh] min-h-[240px]">
		<Mountains class="absolute inset-0 size-full" seed={42} />
		<div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night to-transparent"></div>
	</div>
</section>
