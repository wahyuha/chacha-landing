<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { Menu, X } from '@lucide/svelte';

	type Cta = { label: string; href: string; external?: boolean };
	// `solid` keeps the bar opaque for pages that open on a dark band.
	let { cta = { label: 'Lihat menu', href: '/menu' }, solid = false }: { cta?: Cta; solid?: boolean } = $props();

	const links = [
		{ href: '/menu', label: 'Menu' },
		{ href: '/#teh', label: 'Teh Kami' },
		{ href: '/#outlet', label: 'Outlet' },
		{ href: '/kemitraan', label: 'Kemitraan' }
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

	const current = (href: string) => (page.url.pathname === href ? 'page' : undefined);
</script>

<header
	class="fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-(--ease-soft)
	{scrolled || solid ? 'bg-cream/95 shadow-[0_1px_0_var(--color-linen)] backdrop-blur-xl' : ''}
	{hidden ? '-translate-y-full' : ''}"
>
	<nav class="wrap flex h-18 items-center justify-between gap-6" aria-label="Utama">
		<a href="/" class="flex items-center gap-3" aria-label="Chacha, ke beranda">
			<img src="/img/site/logo-mark.webp" alt="" width="42" height="42" class="h-10.5 w-auto" />
			<img src="/img/site/logo-wordmark.webp" alt="" width="104" height="19" class="h-[15px] w-auto" />
		</a>
		<ul class="hidden items-center gap-9 text-[15px] font-semibold text-forest lg:flex">
			{#each links as l}
				<li>
					<a href={l.href} aria-current={current(l.href)} class="link relative py-2 aria-[current=page]:underline aria-[current=page]:underline-offset-8">{l.label}</a>
				</li>
			{/each}
		</ul>
		<div class="flex items-center gap-2">
			<a href={cta.href} target={cta.external ? '_blank' : undefined} rel={cta.external ? 'noopener' : undefined} class="btn btn-primary hidden !h-11 !px-5 !text-[14px] sm:inline-flex">{cta.label}</a>
			<button class="grid size-11 place-items-center rounded-full text-forest lg:hidden" onclick={() => (open = !open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}>
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
					<a href={l.href} onclick={() => (open = false)} class="display block py-5 text-[36px] leading-none text-forest">{l.label}</a>
				</li>
			{/each}
		</ul>
		<div class="wrap mt-10" in:fly={{ y: 24, delay: 300, duration: 500 }}>
			<a href={cta.href} onclick={() => (open = false)} target={cta.external ? '_blank' : undefined} rel={cta.external ? 'noopener' : undefined} class="btn btn-primary w-full">{cta.label}</a>
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
