<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { MessageCircle, Clock, CheckCheck } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { team, WA_NUMBER, waLink } from '$lib/data';
	import { reducedMotion, reveal } from '$lib/motion';

	// Illustrative first conversation, mirroring the real WhatsApp auto-reply and sales flow.
	const script = [
		{ me: true, t: 'Halo Kak, mau tanya kemitraan Chacha 🙏', at: '09.12' },
		{ me: false, t: 'Halo Kak, terima kasih sudah menghubungi Chacha! 😊 Boleh tahu kota dan rencana lokasinya? Sudah punya tempat jualan?', at: '09.13' },
		{ me: true, t: 'Bandung, dekat kampus. Belum punya booth.', at: '09.15' },
		{ me: false, t: 'Kalau begitu Paket Lengkap paling pas, Kak. Saya kirim foto booth, video isi paket, dan hitungannya ya 📄', at: '09.15' }
	];

	let section: HTMLElement;
	let shown = $state(reducedMotion() ? script.length : 0);
	let typing = $state(false);

	onMount(() => {
		if (reducedMotion()) {
			shown = script.length;
			return;
		}
		let timers: ReturnType<typeof setTimeout>[] = [];
		const play = () => {
			timers.forEach(clearTimeout);
			timers = [];
			shown = 0;
			let t = 400;
			script.forEach((m, i) => {
				if (!m.me) {
					timers.push(setTimeout(() => (typing = true), t));
					t += 1300;
				}
				timers.push(setTimeout(() => ((typing = false), (shown = i + 1)), t));
				t += 900;
			});
		};
		const io = new IntersectionObserver(([e]) => e.isIntersecting && (io.disconnect(), play()), { threshold: 0.35 });
		io.observe(section);
		return () => (io.disconnect(), timers.forEach(clearTimeout));
	});

	const link = (m: (typeof team)[number]) => {
		const msg = `Halo Kak ${m.name}, saya mau tanya kemitraan Chacha.`;
		return m.wa ? `https://wa.me/${m.wa}?text=${encodeURIComponent(msg)}` : waLink(msg);
	};
</script>

<section bind:this={section} id="ngobrol" class="relative overflow-hidden bg-cream py-20 md:py-28">
	<div class="wrap grid items-center gap-12 lg:grid-cols-12">
		<div class="lg:col-span-6" use:reveal={{ stagger: 0.08 }}>
			<Eyebrow>Ngobrol dulu</Eyebrow>
			<h2 class="display mt-5 text-[clamp(2.1rem,4.2vw,3.4rem)] leading-[1.04] text-ink" data-reveal>
				Tanya apa saja. <span class="text-forest">Yang membalas orang, bukan bot.</span>
			</h2>
			<p class="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink-muted" data-reveal>
				Ceritakan rencanamu sesantai ngobrol dengan teman. Kami bantu hitung dan cek lokasinya. Kalau ternyata belum cocok, juga tidak apa-apa.
			</p>

			<ul class="mt-8 grid gap-3 sm:grid-cols-2">
				{#each team as m}
					<li data-reveal>
						<a href={link(m)} target="_blank" rel="noopener" class="group flex items-center gap-4 rounded-[20px] bg-white p-4 ring-1 ring-linen transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_40px_-26px_rgba(20,63,49,.55)]">
							<span class="relative shrink-0">
								<span class="block size-16 overflow-hidden rounded-full bg-sage-soft ring-2 ring-white">
									{#if m.photo ?? m.ref}
										<img src={m.photo ?? m.ref} alt={m.name} class="size-full object-cover" loading="lazy" />
									{:else}
										<span class="grid size-full place-items-center text-[18px] font-bold text-forest">{m.name.slice(0, 1)}</span>
									{/if}
								</span>
								<span class="absolute bottom-0.5 right-0.5 size-3.5 rounded-full bg-[#25D366] ring-2 ring-white"></span>
								{#if !m.photo && m.ref}<span class="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-[#E5484D] px-1.5 text-[8px] font-bold uppercase leading-[14px] text-white">ref</span>{/if}
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-[16px] font-bold leading-tight text-ink">{m.name}</span>
								<span class="block text-[13px] text-ink-muted">{m.role}</span>
								<span class="mt-1 flex items-center gap-1 text-[12px] text-sage-text"><Clock size={12} />{m.hours}</span>
							</span>
							<span class="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-white transition-transform duration-500 group-hover:scale-110"><MessageCircle size={17} /></span>
						</a>
					</li>
				{/each}
			</ul>
			<p class="mt-4 text-[13px] text-ink-muted" data-reveal>Atau langsung ke WhatsApp +{WA_NUMBER}</p>
		</div>

		<!-- phone -->
		<div class="lg:col-span-6" use:reveal>
			<div class="relative mx-auto w-full max-w-[380px]" data-reveal>
				<div class="rounded-[42px] bg-ink p-2.5 shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)]">
					<div class="overflow-hidden rounded-[34px] bg-[#EFE7DE]">
						<div class="flex items-center gap-3 bg-forest px-4 pb-3 pt-5 text-white">
							<span class="grid size-9 place-items-center rounded-full bg-white text-[11px] font-extrabold tracking-[0.1em] text-forest">CH</span>
							<div class="leading-tight">
								<p class="text-[15px] font-semibold">Chacha Kemitraan</p>
								<p class="text-[11.5px] text-white/75">{typing ? 'sedang mengetik…' : 'online'}</p>
							</div>
						</div>
						<div class="chatbg flex min-h-[420px] flex-col gap-2 px-3 py-4">
							<p class="mx-auto mb-1 rounded-full bg-white/80 px-3 py-1 text-[10.5px] font-semibold text-ink-muted">Contoh percakapan</p>
							{#each script.slice(0, shown) as m}
								<div class="max-w-[82%] rounded-[14px] px-3 py-2 text-[13.5px] leading-snug shadow-sm {m.me ? 'self-end rounded-tr-[4px] bg-[#D9FDD3]' : 'self-start rounded-tl-[4px] bg-white'}" in:fly={{ y: 12, duration: 350, easing: cubicOut }}>
									{m.t}
									<span class="float-right ml-2 mt-1.5 flex items-center gap-0.5 text-[10px] text-ink-muted">{m.at}{#if m.me}<CheckCheck size={13} class="text-[#53BDEB]" />{/if}</span>
								</div>
							{/each}
							{#if typing}
								<div class="flex gap-1 self-start rounded-[14px] rounded-tl-[4px] bg-white px-3.5 py-3 shadow-sm" in:fly={{ y: 8, duration: 250 }}>
									{#each [0, 1, 2] as d}<span class="dot size-1.5 rounded-full bg-ink-muted" style="animation-delay:{d * 0.15}s"></span>{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.chatbg {
		background-image: radial-gradient(rgba(20, 63, 49, 0.06) 1px, transparent 1px);
		background-size: 16px 16px;
	}
	.dot {
		animation: bounce 1s ease-in-out infinite;
	}
	@keyframes bounce {
		50% {
			transform: translateY(-4px);
			opacity: 0.5;
		}
	}
</style>
