<script lang="ts">
	import { Camera } from '@lucide/svelte';
	// Placeholder that tells the team which real photo belongs here. On the dev server a third-party
	// reference image (`ref`) can stand in, always badged so it is never mistaken for final art.
	let { brief, ref = null, class: cls = '' }: { brief: string; ref?: string | null; class?: string } = $props();
</script>

{#if ref}
	<div class="group/ref relative size-full {cls}">
		<img src={ref} alt="" class="size-full object-cover" loading="lazy" />
		<span class="absolute left-2 top-2 z-10 rounded-full bg-[#E5484D] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white shadow">Referensi<span class="hidden sm:inline"> · ganti foto asli</span></span>
		<p class="absolute inset-x-2 bottom-2 z-10 rounded-[10px] bg-black/70 px-2.5 py-1.5 text-[11px] leading-snug text-white opacity-0 backdrop-blur transition-opacity group-hover/ref:opacity-100">{brief}</p>
	</div>
{:else}
	<div class="flex size-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,#f6f5f1_0_14px,#f1efe9_14px_28px)] p-5 text-center {cls}">
		<span class="grid size-12 place-items-center rounded-full bg-white text-sage ring-1 ring-linen"><Camera size={20} strokeWidth={1.7} /></span>
		<p class="max-w-[26ch] text-[13px] font-semibold leading-snug text-ink/70">{brief}</p>
		<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-sage-text">Foto asli menyusul</p>
	</div>
{/if}
