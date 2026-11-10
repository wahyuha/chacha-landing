<script lang="ts">
	import Eyebrow from './Eyebrow.svelte';
	import { reveal, splitWords } from '$lib/motion';
	import { srcset } from '$lib/img';

	// Schematic only: circles show mitra areas that never overlap. Two distances, two kinds of area.
	const areas = [
		{
			title: 'Area ramai',
			range: 'Mulai 1 km',
			r: 44,
			pins: [
				[82, 86],
				[186, 70],
				[248, 158],
				[132, 170]
			],
			line: [82, 86, 186, 70],
			label: [134, 66]
		},
		{
			title: 'Area lebih sepi',
			range: 'Sampai 10 km',
			r: 64,
			pins: [
				[78, 120],
				[242, 120]
			],
			line: [78, 120, 242, 120],
			label: [160, 110]
		}
	];

	const posters = [
		{ src: '/img/site/poster-matcha-1200.webp', cls: '-rotate-6 translate-x-3 translate-y-2' },
		{ src: '/img/site/poster-layers-1200.webp', cls: 'z-10 -translate-y-1' },
		{ src: '/img/site/poster-peach-1200.webp', cls: 'rotate-6 -translate-x-3 translate-y-2' }
	];
</script>

<section id="mitra" class="bg-white py-20 md:py-28">
	<div class="wrap">
		<div class="max-w-3xl" use:reveal>
			<Eyebrow>Setelah kamu gabung</Eyebrow>
			<h2 use:splitWords class="display mt-5 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] text-forest">Areamu kami jaga, kontenmu kami bantu.</h2>
			<p class="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-muted" data-reveal>Kami yang mengatur jarak antar mitra, supaya kamu tidak berebut pembeli dengan sesama Chacha.</p>
		</div>

		<!-- Coverage -->
		<div class="mt-12 grid items-center gap-8 rounded-[24px] bg-cream p-5 md:mt-16 md:p-8 lg:grid-cols-12 lg:gap-10" use:reveal>
			<div class="lg:col-span-4" data-reveal>
				<p class="label text-sage-text">Area mitra</p>
				<h3 class="display mt-3 text-[clamp(1.6rem,2.8vw,2.25rem)] leading-tight text-forest">Jarak antar mitra 1 sampai 10 km</h3>
				<p class="mt-3 text-[16px] leading-relaxed text-ink-muted">Jaraknya tergantung area. Sebelum menerima mitra baru, kami cek dulu siapa saja yang sudah ada di sana.</p>
			</div>
			<div class="grid gap-4 sm:grid-cols-2 lg:col-span-8" data-reveal>
				{#each areas as a}
					<figure class="overflow-hidden rounded-[16px] bg-white">
						<svg viewBox="0 0 320 230" class="block h-auto w-full bg-sage-soft" role="img" aria-label="Ilustrasi {a.title.toLowerCase()}: jarak antar mitra {a.range.toLowerCase()}, area mereka tidak saling menimpa">
							<g stroke="#ffffff" stroke-width="5" fill="none" opacity="0.8" aria-hidden="true">
								<path d="M-10 48 L330 26 M-10 128 L330 142 M-10 206 L330 190 M58 -10 L44 240 M152 -10 L166 240 M262 -10 L276 240" />
							</g>
							{#each a.pins as [x, y]}
								<circle cx={x} cy={y} r={a.r} fill="#164942" fill-opacity="0.14" stroke="#164942" stroke-opacity="0.45" stroke-width="1.5" stroke-dasharray="5 5" />
							{/each}
							<line x1={a.line[0]} y1={a.line[1]} x2={a.line[2]} y2={a.line[3]} stroke="#86622c" stroke-width="2" stroke-dasharray="3 5" />
							{#each a.pins as [x, y]}
								<circle cx={x} cy={y} r="8" fill="#164942" stroke="#ffffff" stroke-width="2.5" />
							{/each}
							<text x={a.label[0]} y={a.label[1]} text-anchor="middle" font-size="14" font-weight="700" fill="#0f302b" stroke="#e3eae6" stroke-width="4" paint-order="stroke" font-family="Plus Jakarta Sans Variable, system-ui, sans-serif">{a.range}</text>
						</svg>
						<figcaption class="px-4 py-3 font-display text-[18px] font-medium leading-6 text-forest">{a.title}</figcaption>
					</figure>
				{/each}
				<p class="text-[13px] text-ink-muted sm:col-span-2">Ilustrasi, bukan peta sebenarnya.</p>
			</div>
		</div>

		<div class="mt-5 grid gap-5 lg:grid-cols-2" use:reveal={{ stagger: 0.1 }}>
			<!-- Masterclass -->
			<article class="flex flex-col rounded-[24px] bg-forest p-6 text-white md:p-8" data-reveal>
				<p class="label text-gold">Masterclass</p>
				<h3 class="display mt-3 text-[clamp(1.6rem,2.8vw,2.25rem)] leading-tight">Belajar bikin konten yang bikin orang mampir</h3>
				<p class="mt-3 text-[16px] leading-relaxed text-mist">Kami ajari cara menulis caption dan konten jualan untuk outletmu.</p>
				<div class="mt-7 grid gap-3 sm:mt-auto sm:pt-7">
					<div class="rounded-[14px] border border-white/20 p-4">
						<p class="text-[12px] font-semibold uppercase tracking-wider text-mist">Sebelum</p>
						<p class="mt-1.5 text-[15px] leading-6 text-mist line-through decoration-white/40">Promo minuman enak! Yuk beli sekarang!!!</p>
					</div>
					<div class="rounded-[14px] bg-white p-4 text-ink">
						<p class="text-[12px] font-semibold uppercase tracking-wider text-gold-text">Sesudah</p>
						<p class="mt-1.5 font-display text-[19px] font-medium leading-7 text-forest">Habis rapat tiga jam. Maybe you need a little Chacha.</p>
					</div>
				</div>
			</article>

			<!-- Visuals -->
			<article class="flex flex-col overflow-hidden rounded-[24px] bg-sage-soft p-6 md:p-8" data-reveal>
				<p class="label text-sage-text">Visual</p>
				<h3 class="display mt-3 text-[clamp(1.6rem,2.8vw,2.25rem)] leading-tight text-forest">Foto dan poster yang siap kamu pakai</h3>
				<p class="mt-3 text-[16px] leading-relaxed text-ink-muted">Akun jualanmu tetap terlihat rapi, walau kamu tidak punya desainer.</p>
				<div class="mt-7 grid grid-cols-3 items-end px-1 sm:mt-auto sm:pt-7" aria-hidden="true">
					{#each posters as p}
						<img src={p.src} srcset={srcset(p.src)} sizes="(min-width: 1024px) 180px, 30vw" alt="" loading="lazy" width="640" height="804" class="h-auto w-full rounded-[10px] shadow-[0_18px_36px_-18px_rgba(15,48,43,.6)] {p.cls}" />
					{/each}
				</div>
			</article>
		</div>
	</div>
</section>
