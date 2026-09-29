<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Menu, X } from '@lucide/svelte';
	import Wordmark from './Wordmark.svelte';
	import { scrollToId } from '$lib/motion';
	import { waLink } from '$lib/data';

	const links = [
		{ id: 'isi-paket', label: 'Isi Paket' },
		{ id: 'paket', label: 'Harga Paket' },
		{ id: 'bukti', label: 'Bukti' },
		{ id: 'menu', label: 'Menu' },
		{ id: 'kalkulator', label: 'Kalkulator' },
		{ id: 'faq', label: 'FAQ' }
	];

	let scrolled = $state(false);
	let hidden = $state(false);
	let open = $state(false);

	onMount(() => {
		let last = 0;
		const onScroll = () => {
			const y = window.scrollY;
			scrolled = y > 40;
			hidden = y > 600 && y > last + 4 && !open;
			if (y < last - 4) hidden = false;
			last = y;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function go(e: MouseEvent, id: string) {
		e.preventDefault();
		open = false;
		scrollToId(id);
	}
</script>

<header
	class="fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-(--ease-soft)
	{scrolled ? 'bg-cream/80 shadow-[0_1px_0_var(--color-linen)] backdrop-blur-xl' : ''}
	{hidden ? '-translate-y-full' : ''}"
>
	<nav class="wrap flex h-18 items-center justify-between" aria-label="Utama">
		<a href="#top" onclick={(e) => go(e, 'top')} class="text-forest" aria-label="Chacha, ke atas">
			<Wordmark size={19} />
		</a>
		<ul class="hidden items-center gap-9 text-[14px] font-medium text-ink/80 lg:flex">
			{#each links as l}
				<li>
					<a href="#{l.id}" onclick={(e) => go(e, l.id)} class="link relative py-2 transition-colors hover:text-forest">{l.label}</a>
				</li>
			{/each}
		</ul>
		<div class="flex items-center gap-2">
			<a href={waLink('Halo Chacha, saya ingin konsultasi kemitraan.')} target="_blank" rel="noopener" class="btn btn-primary hidden !h-11 !px-5 !text-[14px] sm:inline-flex">
				Konsultasi Gratis
			</a>
			<button class="grid size-11 place-items-center rounded-full text-forest lg:hidden" onclick={() => (open = !open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Tutup menu' : 'Buka menu'}>
				{#if open}<X size={22} />{:else}<Menu size={22} />{/if}
			</button>
		</div>
	</nav>
</header>

{#if open}
	<div id="mobile-menu" class="fixed inset-0 z-40 bg-cream pt-24 lg:hidden" transition:fade={{ duration: 250 }}>
		<ul class="wrap flex flex-col">
			{#each links as l, i}
				<li in:fly={{ y: 24, delay: 60 + i * 50, duration: 500 }} class="border-b border-linen">
					<a href="#{l.id}" onclick={(e) => go(e, l.id)} class="display block py-5 text-[40px] leading-none text-forest">{l.label}</a>
				</li>
			{/each}
		</ul>
		<div class="wrap mt-10" in:fly={{ y: 24, delay: 350, duration: 500 }}>
			<a href={waLink('Halo Chacha, saya ingin konsultasi kemitraan.')} target="_blank" rel="noopener" class="btn btn-primary w-full">Konsultasi Gratis via WhatsApp</a>
		</div>
	</div>
{/if}

<style>
	.link::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 2px;
		height: 1px;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.5s var(--ease-soft);
	}
	.link:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}
</style>
