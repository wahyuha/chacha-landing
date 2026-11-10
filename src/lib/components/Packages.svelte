<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Check, X, MessageCircle, Move3d, ArrowRight } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { offers, rupiah, waLink } from '$lib/data';
	import { reducedMotion, reveal } from '$lib/motion';
	import { srcset } from '$lib/img';

	let active = $state(1);
	const offer = $derived(offers[active]);

	// Turntable: three path-traced booth angles (src/routes/booth) stand in for a 3D spin. Drag (or wait) to rotate.
	const views = [
		{ src: '/img/cut/booth-front.webp', label: 'Depan' },
		{ src: '/img/cut/booth-left.webp', label: 'Kiri' },
		{ src: '/img/cut/booth-right.webp', label: 'Kanan' }
	];
	let view = $state(0);
	let dragX: number | null = null;
	let paused = $state(false);

	// parallax tilt
	let stage: HTMLDivElement;
	let tilt = $state({ x: 0, y: 0 });

	onMount(() => {
		if (reducedMotion()) return;
		const id = setInterval(() => {
			if (!paused && active === 1) view = (view + 1) % views.length;
		}, 3200);
		return () => clearInterval(id);
	});

	function onDown(e: PointerEvent) {
		dragX = e.clientX;
		paused = true;
	}
	function onMove(e: PointerEvent) {
		const r = stage.getBoundingClientRect();
		tilt = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 };
		if (dragX === null) return;
		const dx = e.clientX - dragX;
		if (Math.abs(dx) > 50) {
			view = (view + (dx < 0 ? 1 : views.length - 1)) % views.length;
			dragX = e.clientX;
		}
	}
	function onUp() {
		dragX = null;
	}
	const layer = (d: number) => `transform: translate3d(${tilt.x * d * 14}px, ${tilt.y * d * 8}px, 0)`;

	// equipment cluster for Paket 1
	const cluster = [
		{ id: 'dispenser', x: 50, y: 52, h: 46, z: 3, d: 1 },
		{ id: 'teko-takar', x: 22, y: 64, h: 28, z: 4, d: 1.6 },
		{ id: 'shaker', x: 78, y: 66, h: 26, z: 4, d: 1.6 },
		{ id: 'botol-uht', x: 33, y: 40, h: 34, z: 2, d: 0.6 },
		{ id: 'timbangan', x: 68, y: 40, h: 30, z: 2, d: 0.6 },
		{ id: 'jigger', x: 40, y: 80, h: 16, z: 5, d: 2.2 },
		{ id: 'botol-susu', x: 61, y: 82, h: 20, z: 5, d: 2.2 },
		{ id: 'termometer', x: 86, y: 44, h: 18, z: 1, d: 0.4 },
		{ id: 'saringan', x: 14, y: 42, h: 12, z: 1, d: 0.4 }
	];
</script>

<section id="paket" class="on-dark grain relative overflow-hidden bg-deep-forest py-20 text-white md:py-28">
	<!-- soft light pools -->
	<div class="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-sage/25 blur-[120px]"></div>
	<div class="pointer-events-none absolute -right-20 bottom-0 size-[420px] rounded-full bg-gold/15 blur-[120px]"></div>

	<div class="wrap relative">
		<div class="flex flex-col justify-between gap-6 md:flex-row md:items-end" use:reveal>
			<div>
				<Eyebrow dark>Paket kemitraan</Eyebrow>
				<h2 class="display mt-5 text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[1.02]" data-reveal>
					Mau mulai <em class="text-gold">dari mana?</em>
				</h2>
			</div>
			<p class="max-w-[42ch] text-[16px] leading-relaxed text-white/70" data-reveal>
				Ada dua cara. Kalau kamu sudah punya tempat jualan, cukup ambil peralatannya. Kalau mulai dari nol, booth-nya ikut kami kirim.
			</p>
		</div>

		<div class="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
			<!-- stage -->
			<div
				bind:this={stage}
				role="img"
				aria-label={active === 1 ? `Booth Chacha tampak ${views[view].label.toLowerCase()}, 110 × 55 × 80 cm` : 'Peralatan minuman Paket 1'}
				class="stage relative aspect-[4/3.4] touch-pan-y select-none overflow-hidden rounded-[28px] lg:sticky lg:top-24 lg:col-span-7 lg:aspect-auto lg:h-[min(620px,calc(100svh-8.5rem))] lg:self-start {active === 1 ? 'cursor-grab active:cursor-grabbing' : ''}"
				onpointerdown={onDown}
				onpointermove={onMove}
				onpointerup={onUp}
				onpointerleave={() => {
					onUp();
					tilt = { x: 0, y: 0 };
					paused = false;
				}}
			>
				<!-- turntable platform -->
				<div class="absolute bottom-[9%] left-1/2 h-[16%] w-[78%] -translate-x-1/2" style={layer(0.3)}>
					<div class="absolute inset-0 rounded-[50%] bg-[radial-gradient(closest-side,rgba(212,176,98,.28),rgba(212,176,98,.06)_70%,transparent)]"></div>
					<svg class="absolute inset-0 size-full" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true" fill="none">
						<ellipse cx="100" cy="20" rx="94" ry="17" stroke="#D4B062" stroke-opacity=".45" vector-effect="non-scaling-stroke" />
						<ellipse class="march" cx="100" cy="20" rx="72" ry="12" stroke="#D4B062" stroke-opacity=".35" stroke-dasharray="3 5" vector-effect="non-scaling-stroke" />
					</svg>
					<div class="absolute inset-x-[18%] bottom-[30%] h-[30%] rounded-[50%] bg-black/45 blur-xl"></div>
				</div>

				{#if active === 1}
					<div class="absolute inset-0" in:fade={{ duration: 500 }} out:fade={{ duration: 250 }}>
						{#each views as v, i}
							<img
								src={v.src}
								srcset={srcset(v.src)}
								sizes="(min-width: 1024px) 45vw, 90vw"
								alt=""
								draggable="false"
								class="view pointer-events-none absolute bottom-[17%] left-1/2 max-h-[70%] w-auto max-w-[88%] object-contain {view === i ? 'on' : ''}"
								style="--d:{i - view}"
							/>
						{/each}
						<!-- dimension callouts on the front view -->
						{#if view === 0}
							<svg class="dims pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" in:fade={{ duration: 400, delay: 300 }}>
								<g stroke="#D4B062" stroke-width="0.25" vector-effect="non-scaling-stroke">
									<line x1="26.6" x2="73.4" y1="86" y2="86" />
									<line x1="26.6" x2="26.6" y1="84.5" y2="87.5" />
									<line x1="73.4" x2="73.4" y1="84.5" y2="87.5" />
									<line x1="77" x2="77" y1="44" y2="78" />
									<line x1="75.8" x2="78.2" y1="44" y2="44" />
									<line x1="75.8" x2="78.2" y1="78" y2="78" />
								</g>
							</svg>
							<span class="absolute bottom-[8.4%] left-1/2 -translate-x-1/2 rounded-full bg-deep-forest px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-gold" in:fade={{ delay: 400 }}>110 cm</span>
							<span class="absolute right-[17%] top-[58%] rounded-full bg-deep-forest px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-gold" in:fade={{ delay: 400 }}>80 cm</span>
						{/if}
						<!-- foreground cups -->
						<img src="/img/cut/cup-forest-front.webp" srcset={srcset('/img/cut/cup-forest-front.webp')} sizes="(min-width: 1024px) 120px, 64px" alt="" class="float pointer-events-none absolute bottom-[6%] left-[5%] h-[30%] w-auto drop-shadow-[0_20px_20px_rgba(0,0,0,.45)]" style={layer(2)} />
						<img src="/img/cut/cup-clear.webp" srcset={srcset('/img/cut/cup-clear.webp')} sizes="(min-width: 1024px) 120px, 64px" alt="" class="float pointer-events-none absolute bottom-[5%] right-[6%] h-[28%] w-auto drop-shadow-[0_20px_20px_rgba(0,0,0,.4)]" style="{layer(2.2)};animation-delay:-2s" />
					</div>
					<!-- view switcher -->
					<div class="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/25 p-1 backdrop-blur" role="tablist" aria-label="Sudut booth">
						{#each views as v, i}
							<button role="tab" aria-selected={view === i} class="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors {view === i ? 'bg-white text-deep-forest' : 'text-white/75 hover:text-white'}" onclick={() => ((view = i), (paused = true))}>{v.label}</button>
						{/each}
					</div>
					<p class="absolute right-4 top-4 hidden items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-[12px] text-white/80 backdrop-blur sm:flex"><Move3d size={14} />Geser untuk memutar</p>
				{:else}
					<div class="absolute inset-0" in:fade={{ duration: 500 }} out:fade={{ duration: 250 }}>
						{#each cluster as c, i}
							<img
								src="/img/kit/{c.id}.webp"
								srcset={srcset(`/img/kit/${c.id}.webp`)}
								sizes="(min-width: 1024px) 160px, 110px"
								alt=""
								draggable="false"
								class="pointer-events-none absolute w-auto -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,.4)]"
								style="left:{c.x}%;top:{c.y}%;height:{c.h}%;z-index:{c.z};{layer(c.d)}"
								in:fly={{ y: 40, duration: 700, delay: 60 * i, easing: cubicOut }}
							/>
						{/each}
						<p class="absolute left-4 top-4 rounded-full bg-black/25 px-3 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur">19 item peralatan · tanpa booth</p>
					</div>
				{/if}
			</div>

			<!-- offers -->
			<div class="flex flex-col gap-4 lg:col-span-5" role="radiogroup" aria-label="Pilih paket">
				{#each offers as o, i}
					<div
						role="radio"
						tabindex="0"
						aria-checked={active === i}
						onclick={() => (active = i)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (active = i))}
						class="offer relative cursor-pointer overflow-hidden rounded-[24px] p-6 text-left transition-all duration-500 md:p-7
						{active === i ? 'bg-white text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]' : 'bg-white/[.06] text-white ring-1 ring-white/12 hover:bg-white/[.1]'}"
					>
						{#if o.featured}
							<span class="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-deep-forest">Paling lengkap</span>
						{/if}
						<p class="text-[12px] font-bold uppercase tracking-[0.16em] {active === i ? 'text-sage-text' : 'text-white/60'}">{o.name}</p>
						<h3 class="mt-1 text-[28px] font-extrabold leading-tight tracking-tight">{o.title}</h3>
						<p class="mt-2 text-[14.5px] leading-relaxed {active === i ? 'text-ink-muted' : 'text-white/65'}">{o.blurb}</p>

						<div class="mt-5 flex items-end justify-between gap-3">
							{#if o.price}
								<p class="text-[30px] font-extrabold tracking-tight {active === i ? 'text-forest' : ''}">{rupiah(o.price)}</p>
							{:else}
								<div>
									<p class="price-ph whitespace-nowrap text-[24px] font-extrabold tracking-tight sm:text-[30px] {active === i ? 'text-forest' : ''}" aria-label="Harga segera diumumkan">Rp ●●.●●●.●●●</p>
									<p class="text-[12px] {active === i ? 'text-ink-muted' : 'text-white/55'}">Harga & promo bulan ini kami kirim lewat WhatsApp</p>
								</div>
							{/if}
						</div>

						{#if active === i}
							<div transition:fly={{ y: 10, duration: 400 }}>
								<ul class="mt-5 grid gap-2 border-t border-linen pt-5 text-[14.5px]">
									{#each o.includes as it}
										<li class="flex items-start gap-2.5"><span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sage-soft text-forest"><Check size={13} strokeWidth={3} /></span>{it}</li>
									{/each}
									{#each o.excludes as it}
										<li class="flex items-start gap-2.5 text-ink-muted line-through decoration-ink/30"><span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-cream-raised text-ink-muted"><X size={12} strokeWidth={3} /></span>{it}</li>
									{/each}
								</ul>
								<a href={waLink(o.message)} target="_blank" rel="noopener" onclick={(e) => e.stopPropagation()} class="btn btn-primary cta-shine mt-6 w-full !h-14 !text-[16px]">
									<MessageCircle size={18} />Tanya {o.name}
								</a>
							</div>
						{/if}
					</div>
				{/each}

				<a href={waLink('Halo Chacha, saya butuh booth custom / kiosk mall. Boleh konsultasi?')} target="_blank" rel="noopener" class="group flex items-center justify-between gap-4 rounded-[20px] border border-dashed border-white/25 px-5 py-4 text-[14px] text-white/80 transition-colors hover:border-gold hover:text-white">
					<span><strong class="text-white">Mau booth lebih besar atau buka di mall?</strong> Ceritakan saja, kami buatkan.</span>
					<ArrowRight size={18} class="shrink-0 text-gold transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.stage {
		background:
			radial-gradient(120% 80% at 50% 0%, rgba(106, 154, 126, 0.35), transparent 60%),
			linear-gradient(180deg, #1b4d3d 0%, #123a2e 100%);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}
	.view {
		opacity: 0;
		transform: translateX(calc(-50% + var(--d) * 18%)) scale(0.92) rotateY(calc(var(--d) * -25deg));
		filter: drop-shadow(0 30px 30px rgba(0, 0, 0, 0.45)) blur(2px);
		transition:
			opacity 0.7s ease,
			transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
			filter 0.7s ease;
	}
	.view.on {
		opacity: 1;
		transform: translateX(-50%) scale(1);
		filter: drop-shadow(0 30px 30px rgba(0, 0, 0, 0.45));
	}
	.march {
		animation: march 4s linear infinite;
	}
	@keyframes march {
		to {
			stroke-dashoffset: -80;
		}
	}
	.float {
		animation: float 6s ease-in-out infinite;
	}
	@keyframes float {
		50% {
			translate: 0 -10px;
		}
	}
	.dims line {
		stroke-dasharray: 100;
		stroke-dashoffset: 100;
		animation: draw 1.2s 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	.price-ph {
		letter-spacing: 0.02em;
		opacity: 0.85;
	}
</style>
