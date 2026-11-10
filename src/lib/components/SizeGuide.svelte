<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Store, Building2, Smartphone, HandCoins, Video, Hammer, PencilRuler, Receipt, MapPin, ArrowRight } from '@lucide/svelte';
	import Eyebrow from './Eyebrow.svelte';
	import { waLink } from '$lib/data';
	import { reveal, splitWords } from '$lib/motion';

	// Advice is what the mitra does; support is what Chacha provides. Keep the two apart so promises stay clear.
	type Tip = { title: string; text: string; tag?: string };
	const guides: { id: string; icon: typeof Store; label: string; sub: string; tips: Tip[]; steps?: string[]; support: { icon: typeof Store; title: string; text: string }[]; note: string | null; cta: string; msg: string }[] = [
		{
			id: 'booth',
			icon: Store,
			label: 'Booth kecil',
			sub: 'Modal mulai Rp 4,5 juta',
			tips: [
				{
					title: 'Mulai dari paket yang paling pas, bukan yang paling besar',
					text: 'Sudah punya meja atau warung? Paket Peralatan Minuman saja cukup. Mulai dari nol? Paket Siap Jualan sudah termasuk booth dan bahan untuk 100 cup pertama.'
				},
				{
					title: 'Sewa tempat bulanan atau per tiga bulan',
					text: 'Jangan langsung bayar setahun. Uangnya lebih berguna untuk bahan baku di bulan-bulan awal.'
				},
				{
					title: 'Pilih penjaga booth yang kamu percaya',
					text: 'Saudara, tetangga, atau teman yang kamu kenal baik. Kamu tidak bisa selalu menunggui booth, jadi kejujurannya yang paling penting.'
				},
				{
					title: 'Bayar penjaganya dengan bagi hasil',
					text: 'Makin banyak cup terjual, makin besar bagiannya. Dia ikut menjaga booth seperti usahanya sendiri.',
					tag: 'Bisa dihitung otomatis di aplikasi kami'
				}
			],
			support: [
				{ icon: Smartphone, title: 'Aplikasi pantau penjualan', text: 'Buka dari HP atau browser. Penjualan hari ini terlihat walau kamu sedang di tempat lain.' },
				{ icon: HandCoins, title: 'Bagi hasil otomatis, kalau kamu mau', text: 'Aktifkan di aplikasi, bagian penjaga booth terhitung dari penjualannya.' },
				{ icon: Video, title: 'Video call gratis sebelum buka', text: 'Kita bahas lokasi, harga jual, dan cara meracik. Tanya sampai kamu yakin.' }
			],
			note: null,
			cta: 'Jadwalkan video call gratis',
			msg: 'Halo Kak, saya mau jadwalkan video call gratis untuk buka booth Chacha.'
		},
		{
			id: 'outlet',
			icon: Building2,
			label: 'Outlet, ruko, mall',
			sub: 'Biaya lewat konsultasi',
			tips: [
				{
					title: 'Kontrak 3 atau 6 bulan dulu, kalau bisa',
					text: 'Tanyakan ke pemilik tempat. Kamu punya waktu melihat ramainya lokasi sebelum terikat kontrak panjang.'
				},
				{
					title: 'Hubungi kami sebelum renovasi',
					text: 'Kirim ukuran dan foto tempatnya sebelum memanggil tukang, supaya booth dan interiornya dihitung sekalian.'
				}
			],
			support: [
				{ icon: Hammer, title: 'Booth dan interior dengan biaya hemat', text: 'Kami bantu buatkan, supaya modal awal tidak habis di bangunan.' },
				{ icon: PencilRuler, title: 'Konsep layout dan desain', text: 'Letak meja bar, alur antre, sampai papan menu, kami gambarkan untuk tempatmu.' },
				{ icon: Receipt, title: 'Kasir (POS) dan laporan untuk owner', text: 'Semua transaksi tercatat. Laporannya bisa kamu buka dari HP atau browser.' },
				{ icon: MapPin, title: 'Video call gratis, atau ketemu langsung', text: 'Untuk outlet besar kami bisa datang ke lokasimu. Waktu dan tempatnya kita sepakati bersama.' }
			],
			steps: ['Kirim ukuran dan foto tempatmu lewat WhatsApp', 'Video call gratis untuk membahas rencanamu', 'Kami kirim konsep layout dan hitungan biayanya'],
			note: 'Biaya outlet dan mall kami hitung setelah melihat tempatmu.',
			cta: 'Jadwalkan konsultasi gratis',
			msg: 'Halo Kak, saya mau konsultasi buka outlet Chacha. Tempat saya: '
		}
	];

	let active = $state(0);
	const g = $derived(guides[active]);

	function onKey(e: KeyboardEvent) {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		e.preventDefault();
		active = (active + 1) % guides.length;
		document.getElementById(`guide-tab-${guides[active].id}`)?.focus();
	}
</script>

<section id="mulai" class="scroll-mt-16 border-t border-forest/10 bg-cream py-20 md:py-28">
	<div class="wrap">
		<div class="max-w-3xl" use:reveal>
			<Eyebrow>Sebelum kamu mulai</Eyebrow>
			<h2 use:splitWords class="display mt-5 text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.06] text-forest">Booth kecil atau outlet di mall, modalnya bisa ditekan.</h2>
			<p class="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-muted" data-reveal>Saran ini datang dari outlet Chacha yang sudah jalan. Pilih yang paling dekat dengan rencanamu.</p>
		</div>

		<div class="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:max-w-2xl md:gap-4" role="tablist" aria-label="Ukuran usaha" tabindex="-1" onkeydown={onKey}>
			{#each guides as t, i}
				{@const Icon = t.icon}
				<button
					id="guide-tab-{t.id}"
					role="tab"
					aria-selected={active === i}
					aria-controls="guide-panel"
					tabindex={active === i ? 0 : -1}
					onclick={() => (active = i)}
					class="flex flex-col items-start gap-3 rounded-[18px] border-2 p-4 text-left transition-colors md:flex-row md:items-center md:p-5 {active === i
						? 'border-forest bg-white'
						: 'border-transparent bg-white/55 hover:bg-white'}"
				>
					<span class="grid size-11 shrink-0 place-items-center rounded-full {active === i ? 'bg-forest text-white' : 'bg-sage-soft text-forest'}"><Icon size={21} /></span>
					<span>
						<span class="block font-display text-[18px] font-medium leading-6 text-forest md:text-[20px]">{t.label}</span>
						<span class="mt-0.5 block text-[13px] leading-5 text-ink-muted md:text-[14px]">{t.sub}</span>
					</span>
				</button>
			{/each}
		</div>

		{#key active}
			<div id="guide-panel" role="tabpanel" aria-labelledby="guide-tab-{g.id}" class="mt-5 grid gap-5 lg:grid-cols-12" in:fade={{ duration: 280 }}>
				<!-- What we suggest the mitra does -->
				<div class="flex flex-col rounded-[24px] bg-white p-6 md:p-8 lg:col-span-7">
					<p class="label text-sage-text">Saran dari kami</p>
					<ol class="mt-5 grid gap-6">
						{#each g.tips as tip, n}
							<li class="grid grid-cols-[2.25rem_1fr] gap-3">
								<span class="font-display text-[26px] font-medium leading-7 text-gold-text">{n + 1}</span>
								<div>
									<h3 class="font-display text-[19px] font-medium leading-7 text-forest md:text-[21px]">{tip.title}</h3>
									<p class="mt-1 text-[15px] leading-relaxed text-ink-muted md:text-[16px]">{tip.text}</p>
									{#if tip.tag}
										<p class="mt-2.5 inline-flex rounded-full bg-sage-soft px-3 py-1 text-[13px] font-medium text-on-sage">{tip.tag}</p>
									{/if}
								</div>
							</li>
						{/each}
					</ol>
					{#if g.steps}
						<div class="mt-8 rounded-[18px] bg-cream p-5 lg:mt-auto">
							<p class="label text-sage-text">Alur konsultasi</p>
							<ol class="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-3">
								{#each g.steps as step, n}
									<li class="flex gap-3 sm:flex-col sm:gap-2">
										<span class="grid size-7 shrink-0 place-items-center rounded-full bg-forest text-[13px] font-semibold text-white">{n + 1}</span>
										<span class="text-[14px] leading-[21px] text-ink">{step}</span>
									</li>
								{/each}
							</ol>
						</div>
					{/if}
				</div>

				<!-- What Chacha provides -->
				<div class="flex flex-col rounded-[24px] bg-forest p-6 text-white md:p-8 lg:col-span-5">
					<p class="label text-[#e0c07a]">Yang kami siapkan</p>
					<ul class="mt-5 grid gap-5">
						{#each g.support as s}
							{@const Icon = s.icon}
							<li class="grid grid-cols-[2.5rem_1fr] gap-3">
								<span class="grid size-10 place-items-center rounded-full bg-white/10 text-gold"><Icon size={19} /></span>
								<div>
									<h3 class="font-display text-[17px] font-medium leading-6 md:text-[18px]">{s.title}</h3>
									<p class="mt-1 text-[14px] leading-6 text-mist md:text-[15px]">{s.text}</p>
								</div>
							</li>
						{/each}
					</ul>
					<div class="mt-8 lg:mt-auto lg:pt-8">
						{#if g.note}<p class="mb-4 text-[14px] leading-6 text-mist">{g.note}</p>{/if}
						<a href={waLink(g.msg)} target="_blank" rel="noopener" class="btn btn-gold w-full sm:w-auto">{g.cta}<ArrowRight size={18} /></a>
					</div>
				</div>
			</div>
		{/key}
	</div>
</section>
