<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Plus } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { faqs, waLink } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	let open = $state<number | null>(0);
</script>

<section id="faq" class="bg-cream py-24 md:py-36">
	<div class="wrap grid gap-12 md:grid-cols-12">
		<div class="md:col-span-5" use:reveal>
			<Eyebrow>Pertanyaan</Eyebrow>
			<h2 use:splitWords class="display mt-6 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.04] text-forest">Yang biasanya ditanyakan duluan</h2>
			<p class="mt-6 max-w-[36ch] text-[16px] leading-[1.7] text-ink-muted" data-reveal>
				Pertanyaanmu tidak ada di sini? Tanya langsung saja. Kami balas setiap hari jam 08.00–21.00.
			</p>
			<a href={waLink('Halo Kak, saya mau tanya soal kemitraan Chacha.')} target="_blank" rel="noopener" class="btn btn-outline mt-8 text-forest" data-reveal>Tanya langsung</a>
		</div>
		<ul class="md:col-span-7" use:reveal={{ stagger: 0.05 }}>
			{#each faqs as f, i}
				<li class="border-b border-linen first:border-t" data-reveal>
					<h3>
						<button class="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={open === i} aria-controls="faq-{i}" onclick={() => (open = open === i ? null : i)}>
							<span class="text-[17px] font-semibold leading-snug text-ink md:text-[19px]">{f.q}</span>
							<span class="grid size-9 shrink-0 place-items-center rounded-full border border-linen text-forest transition-all duration-500 ease-(--ease-soft) {open === i ? 'rotate-45 border-forest bg-forest text-on-forest' : ''}"><Plus size={16} /></span>
						</button>
					</h3>
					{#if open === i}
						<div id="faq-{i}" transition:slide={{ duration: 450, easing: cubicOut }}>
							<p class="max-w-[60ch] pb-7 text-[15px] leading-[1.75] text-ink-muted">{f.a}</p>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</section>
