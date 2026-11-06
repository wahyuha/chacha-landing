<script lang="ts">
	import { onMount } from 'svelte';
	import { kitItems, kitExtras } from '$lib/data';

	// Commercial poster for Paket 1 on a fixed 1080 × 1350 (IG 4:5) artboard: one studio-style group
	// shot on a seamless sweep, an editorial headline, and the inventory as a single quiet line.
	// `fit` scales it to the parent width; without it the artboard renders at full size (for export).
	let { fit = true }: { fit?: boolean } = $props();

	let box: HTMLDivElement | undefined = $state();
	let scale = $state(1);
	onMount(() => {
		if (!fit || !box) return;
		const ro = new ResizeObserver(([e]) => (scale = e.contentRect.width / 1080));
		ro.observe(box);
		return () => ro.disconnect();
	});

	// product family, back row then front row: x = centre, b = baseline on the floor, h = height
	const shot = [
		{ id: 'teko-takar', x: 190, b: 957, h: 254, z: 1 },
		{ id: 'botol-uht', x: 355, b: 952, h: 356, z: 2 },
		{ id: 'dispenser', x: 560, b: 962, h: 427, z: 3 },
		{ id: 'shaker', x: 765, b: 952, h: 297, z: 2 },
		{ id: 'storage-box', x: 920, b: 957, h: 313, z: 1 },
		{ id: 'pompa-air', x: 140, b: 1034, h: 181, z: 4 },
		{ id: 'botol-susu', x: 310, b: 1038, h: 235, z: 5 },
		{ id: 'jigger', x: 462, b: 1040, h: 138, z: 6 },
		{ id: 'saringan', x: 640, b: 1042, h: 80, z: 6 },
		{ id: 'termometer', x: 800, b: 1038, h: 181, z: 5 },
		{ id: 'sendok-panjang', x: 945, b: 1034, h: 212, z: 4 }
	];

	const short: Record<string, string> = {
		dispenser: 'Dispenser 8 L',
		'teko-takar': 'Teko takar 2 L',
		shaker: 'Shaker',
		jigger: 'Jigger',
		'botol-uht': 'Botol UHT',
		'botol-susu': 'Botol susu',
		'pompa-botol': 'Pompa sirup',
		'pompa-air': 'Pompa air',
		saringan: 'Saringan teh',
		'sendok-panjang': 'Sendok panjang',
		'storage-box': 'Storage box',
		timbangan: 'Timbangan digital',
		termometer: 'Termometer'
	};
	const inventory = [...kitItems.map((k) => (k.qty > 1 ? `${short[k.id]} ×${k.qty}` : short[k.id])), `+${kitExtras.length} lainnya`];
</script>

<div bind:this={box} class="relative w-full" style={fit ? 'aspect-ratio: 1080 / 1350' : 'width:1080px;height:1350px'}>
	<div class="poster absolute left-0 top-0 origin-top-left overflow-hidden" style="width:1080px;height:1350px;transform:scale({fit ? scale : 1})">
		<!-- seamless studio sweep -->
		<div class="sweep absolute inset-0"></div>
		<div class="absolute left-1/2 top-[360px] size-[900px] -translate-x-1/2 rounded-full bg-white opacity-70 blur-[120px]"></div>
		<div class="grain-p absolute inset-0"></div>

		<!-- masthead -->
		<div class="absolute left-[76px] right-[76px] top-[64px] flex items-center justify-between">
			<div class="leading-none">
				<p class="text-[22px] font-bold tracking-[0.36em] text-[#1D5A45]">CHACHA</p>
				<p class="mt-2 text-[10px] font-semibold tracking-[0.44em] text-[#6A9A7E]">FRESH DRINK &amp; MILK TEA</p>
			</div>
			<div class="flex items-center gap-3 text-[13px] font-semibold tracking-[0.32em] text-[#7A5E22]">
				<span class="h-px w-14 bg-[#C9A24E]"></span>PAKET 01
			</div>
		</div>

		<!-- headline -->
		<div class="absolute left-[76px] top-[150px]">
			<h1 class="leading-[0.95]">
				<span class="block text-[86px] font-extrabold tracking-[-0.045em] text-[#1E2B25]">Semua alatnya,</span>
				<span class="serif-p block text-[92px] font-medium italic tracking-[-0.015em] text-[#1D5A45]">sudah di dalam kotak.</span>
			</h1>
			<p class="mt-7 text-[21px] font-semibold text-[#1E2B25]">Paket 1 <span class="mx-2 text-[#C9A24E]">/</span> Peralatan Minuman</p>
			<p class="mt-1.5 max-w-[560px] text-[18px] leading-snug text-[#1E2B25]/60">Alat standar outlet Chacha, dikirim lengkap ke lokasimu.</p>
		</div>

		<!-- seal -->
		<div class="absolute right-[76px] top-[300px] grid size-[150px] rotate-[-8deg] place-items-center rounded-full bg-[#143F31] text-[#E6C77D] shadow-[0_24px_40px_-18px_rgba(20,63,49,.7)]">
			<svg viewBox="0 0 100 100" class="absolute inset-0 size-full" aria-hidden="true">
				<defs><path id="seal-ring" d="M50 50 m-39 0 a39 39 0 1 1 78 0 a39 39 0 1 1 -78 0" /></defs>
				<text font-size="7.4" font-weight="700" letter-spacing="2.6" fill="currentColor"><textPath href="#seal-ring">SIAP JUALAN • STANDAR CHACHA • </textPath></text>
			</svg>
			<div class="text-center leading-none">
				<p class="text-[52px] font-extrabold tracking-[-0.05em]">19</p>
				<p class="mt-0.5 text-[11px] font-bold tracking-[0.3em]">ALAT</p>
			</div>
		</div>

		<!-- group shot: reflections, contact shadows, objects -->
		{#each shot as s}
			<div class="absolute" style="left:{s.x}px;top:{s.b}px;height:{s.h}px;transform:translateX(-50%);z-index:{s.z}">
				<img src="/img/kit/{s.id}.webp" alt="" class="reflect h-full w-auto max-w-[260px] object-contain" />
			</div>
			<div class="absolute rounded-[50%] bg-[#3a2f1f]/35 blur-[10px]" style="left:{s.x - s.h * 0.36}px;top:{s.b - 12}px;width:{s.h * 0.72}px;height:22px;z-index:{s.z}"></div>
		{/each}
		<div class="floor-fade absolute inset-x-0 top-[975px] h-[200px]" style="z-index:7"></div>
		{#each shot as s}
			<div class="absolute" style="left:{s.x}px;top:{s.b - s.h}px;height:{s.h}px;transform:translateX(-50%);z-index:{s.z + 8}">
				<img src="/img/kit/{s.id}.webp" alt="" class="obj h-full w-auto max-w-[260px] object-contain" />
			</div>
		{/each}

		<!-- inventory, one quiet line -->
		<p class="absolute left-[76px] right-[76px] top-[1092px] flex flex-wrap justify-center gap-y-1 text-[13.5px] font-semibold uppercase leading-[1.7] tracking-[0.16em] text-[#1E2B25]/55" style="z-index:30">
			{#each inventory as it, i}
				<span class="whitespace-nowrap">{it}{#if i < inventory.length - 1}<span class="mx-3 text-[#C9A24E]">·</span>{/if}</span>
			{/each}
		</p>

		<!-- call to action -->
		<div class="absolute bottom-[56px] left-[76px] right-[76px] flex h-[92px] items-center justify-between rounded-full bg-[#143F31] pl-10 pr-3 shadow-[0_24px_40px_-24px_rgba(20,63,49,.8)]" style="z-index:30">
			<p class="text-[22px] font-semibold text-[#F5EEE3]">Tanya harga &amp; promo bulan ini</p>
			<div class="flex h-[68px] items-center gap-3 rounded-full bg-[#E6C77D] px-7 text-[#143F31]">
				<svg viewBox="0 0 24 24" class="size-7 fill-current" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.93-4.66-4.11-.13-.18-1.11-1.48-1.11-2.83 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.28-.12.56.16.27.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.33Z" /></svg>
				<span class="text-[22px] font-extrabold tracking-tight">chacha.id</span>
			</div>
		</div>
	</div>
</div>

<style>
	.poster {
		font-family: var(--font-sans);
		background: #efe8dc;
	}
	/* wall to floor, with a soft horizon like a paper sweep in a studio */
	.sweep {
		background:
			linear-gradient(180deg, #f6f1e8 0%, #efe7da 58%, #e6dccb 74%, #ded2bf 100%);
	}
	.floor-fade {
		background: linear-gradient(180deg, rgba(230, 220, 203, 0) 0%, rgba(226, 216, 199, 0.85) 45%, #ded2bf 100%);
	}
	.serif-p {
		font-family: var(--font-serif);
	}
	/* one colour grade for photos shot on different days */
	.obj {
		filter: contrast(1.05) saturate(0.9) sepia(0.07) brightness(1.02) drop-shadow(0 22px 18px rgba(58, 47, 31, 0.22));
	}
	.reflect {
		transform: scaleY(-1);
		opacity: 0.22;
		filter: blur(1.5px) saturate(0.8) sepia(0.1);
		mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 55%);
	}
	.grain-p {
		opacity: 0.06;
		mix-blend-mode: multiply;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
</style>
