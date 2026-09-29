<script lang="ts">
	import { Camera } from '@lucide/svelte';
	// Placeholder that tells the team which real photo belongs here.
	let { brief, class: cls = '' }: { brief: string; class?: string } = $props();
</script>

<div class="flex size-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,#f6f5f1_0_14px,#f1efe9_14px_28px)] p-5 text-center {cls}">
	<span class="grid size-12 place-items-center rounded-full bg-white text-sage ring-1 ring-linen"><Camera size={20} strokeWidth={1.7} /></span>
	<p class="max-w-[26ch] text-[13px] font-semibold leading-snug text-ink/70">{brief}</p>
	<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-sage-text">Foto asli menyusul</p>
</div>
