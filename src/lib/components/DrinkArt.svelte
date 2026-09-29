<script lang="ts">
	import { rng, LEAF, PETAL } from '$lib/art';

	type DrinkStyle = {
		liquid: [string, string, string]; // top, middle, bottom
		extra: 'boba' | 'tiger' | 'matcha' | 'peach' | 'lychee' | 'lemon' | 'jasmine';
		tint: string;
	};

	let { style, id }: { style: DrinkStyle; id: string } = $props();

	// cup geometry (viewBox 400 × 400)
	const top = 96;
	const bottom = 318;
	const tw = 78; // half width at rim
	const bw = 58; // half width at base
	const cx = 200;
	const cupPath = `M${cx - tw} ${top} L${cx + tw} ${top} L${cx + bw} ${bottom} Q${cx + bw} ${bottom + 8} ${cx + bw - 8} ${bottom + 8} L${cx - bw + 8} ${bottom + 8} Q${cx - bw} ${bottom + 8} ${cx - bw} ${bottom} Z`;
	const liquidTop = 132;
	const halfAt = (y: number) => tw - ((tw - bw) * (y - top)) / (bottom - top);

	const r = rng(id.length * 97 + id.charCodeAt(0));
	const ice = Array.from({ length: 5 }, (_, i) => ({
		x: cx - 50 + i * 24 + (r() - 0.5) * 10,
		y: liquidTop + 6 + (i % 2) * 22 + r() * 8,
		a: (r() - 0.5) * 40,
		s: 20 + r() * 6
	}));
	const drops = Array.from({ length: 22 }, () => {
		const y = liquidTop + 10 + r() * 170;
		const hw = halfAt(y);
		return { x: cx - hw + 8 + r() * (hw * 2 - 16), y, r: 1 + r() * 2.2 };
	});
	const boba = Array.from({ length: 16 }, (_, i) => {
		const y = bottom - 8 - (i % 3) * 12 - r() * 4;
		const hw = halfAt(y) - 10;
		return { x: cx - hw + ((i * 23) % (hw * 2)), y };
	});
	const tiger = Array.from({ length: 9 }, (_, i) => {
		const x = cx - 64 + i * 16 + (r() - 0.5) * 8;
		return `M${x} ${liquidTop + 8} C${x + 12} ${liquidTop + 50} ${x - 14} ${liquidTop + 90} ${x + 6} ${liquidTop + 140} S${x - 8} ${bottom - 30} ${x + 4} ${bottom}`;
	});
</script>

<svg viewBox="36 36 328 328" preserveAspectRatio="xMidYMid slice" class="size-full" aria-hidden="true">
	<defs>
		<clipPath id="cup-{id}"><path d={cupPath} /></clipPath>
		<linearGradient id="liq-{id}" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color={style.liquid[0]} />
			<stop offset=".55" stop-color={style.liquid[1]} />
			<stop offset="1" stop-color={style.liquid[2]} />
		</linearGradient>
		<linearGradient id="glass-{id}" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#fff" stop-opacity=".55" />
			<stop offset=".12" stop-color="#fff" stop-opacity=".08" />
			<stop offset=".78" stop-color="#fff" stop-opacity="0" />
			<stop offset=".92" stop-color="#fff" stop-opacity=".25" />
			<stop offset="1" stop-color="#fff" stop-opacity=".05" />
		</linearGradient>
		<radialGradient id="glow-{id}" cx=".5" cy=".45" r=".6">
			<stop offset="0" stop-color="#fff" stop-opacity=".55" />
			<stop offset="1" stop-color="#fff" stop-opacity="0" />
		</radialGradient>
		<filter id="soft-{id}"><feGaussianBlur stdDeviation="9" /></filter>
		<filter id="speck-{id}">
			<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" />
			<feColorMatrix values="0 0 0 0 .55  0 0 0 0 .47  0 0 0 0 .38  0 0 0 -2.4 1.25" />
			<feComposite in2="SourceGraphic" operator="in" />
		</filter>
	</defs>

	<!-- wall + light -->
	<rect width="400" height="400" fill={style.tint} />
	<circle cx="230" cy="150" r="190" fill="url(#glow-{id})" />
	<g filter="url(#soft-{id})" fill="#3a3524" opacity=".13" class="leafshadow">
		{#each [[-10, 40, -30], [40, 10, 20], [330, 60, 150], [360, 130, 190], [20, 120, -60], [300, 0, 120]] as [x, y, a]}
			<ellipse cx={x} cy={y} rx="16" ry="44" transform="rotate({a} {x} {y})" />
		{/each}
		<path d="M-20 10 Q120 90 60 200" stroke="#3a3524" stroke-width="5" fill="none" />
	</g>

	<!-- travertine plinth -->
	<g>
		<rect x="96" y="326" width="208" height="46" rx="4" fill="#E9DFCF" />
		<rect x="96" y="326" width="208" height="46" rx="4" fill="#E9DFCF" filter="url(#speck-{id})" opacity=".8" />
		<rect x="96" y="326" width="208" height="6" rx="3" fill="#F4EDE2" />
		<rect x="96" y="366" width="208" height="6" fill="#000" opacity=".05" />
	</g>
	<!-- cup shadow on plinth -->
	<ellipse cx={cx + 14} cy="330" rx="74" ry="7" fill="#000" opacity=".12" filter="url(#soft-{id})" />

	<!-- cup -->
	<g class="drink">
		<path d={cupPath} fill="#fff" opacity=".35" />
		<g clip-path="url(#cup-{id})">
			<rect x="100" y={liquidTop} width="200" height={bottom - liquidTop + 10} fill="url(#liq-{id})" />
			{#if style.extra === 'tiger'}
				{#each tiger as t}
					<path d={t} stroke="#6b3a17" stroke-width={3 + (t.length % 6)} stroke-linecap="round" fill="none" opacity={0.28 + (t.length % 4) * 0.08} />
				{/each}
			{/if}
			{#if style.extra === 'boba' || style.extra === 'tiger'}
				{#each boba as b}
					<circle cx={b.x} cy={b.y} r="6.5" fill="#2d1a10" />
					<circle cx={b.x - 2} cy={b.y - 2} r="1.8" fill="#fff" opacity=".35" />
				{/each}
			{/if}
			{#if style.extra === 'peach'}
				{#each [[176, 214, -20], [222, 262, 30], [190, 292, 10]] as [x, y, a]}
					<g transform="translate({x} {y}) rotate({a})">
						<path d="M-26 0 A26 26 0 0 1 26 0 Z" fill="#F4A36B" opacity=".85" />
						<path d="M-20 0 A20 20 0 0 1 20 0 Z" fill="#F9C88F" opacity=".9" />
					</g>
				{/each}
			{/if}
			{#if style.extra === 'lychee'}
				{#each [[180, 230], [220, 250], [196, 286], [230, 292]] as [x, y]}
					<circle cx={x} cy={y} r="15" fill="#FBF3EE" opacity=".92" />
					<circle cx={x - 4} cy={y - 5} r="4" fill="#fff" />
				{/each}
			{/if}
			{#if style.extra === 'lemon'}
				{#each [[178, 220, 18], [222, 262, 16], [192, 296, 14]] as [x, y, s]}
					<g transform="translate({x} {y})">
						<circle r={s} fill="#F3DD6B" opacity=".85" />
						<circle r={s - 3} fill="#F8EBA4" />
						{#each [0, 60, 120, 180, 240, 300] as a}
							<line x2="0" y2={-(s - 4)} transform="rotate({a})" stroke="#F3DD6B" stroke-width="1.5" />
						{/each}
					</g>
				{/each}
			{/if}
			<!-- ice -->
			{#each ice as c}
				<rect x={c.x - c.s / 2} y={c.y - c.s / 2} width={c.s} height={c.s} rx="5" transform="rotate({c.a} {c.x} {c.y})" fill="#fff" opacity=".42" stroke="#fff" stroke-opacity=".7" />
			{/each}
			<!-- liquid surface -->
			<ellipse cx={cx} cy={liquidTop} rx={halfAt(liquidTop)} ry="6" fill={style.liquid[0]} />
			<ellipse cx={cx} cy={liquidTop} rx={halfAt(liquidTop)} ry="6" fill="#fff" opacity=".2" />
			<!-- condensation -->
			{#each drops as d}
				<circle cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity=".45" />
			{/each}
		</g>
		<path d={cupPath} fill="url(#glass-{id})" />
		<path d={cupPath} fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5" />
		<!-- sealed sage film lid -->
		<ellipse cx={cx} cy={top} rx={tw + 3} ry="11" fill="#6A9A7E" />
		<ellipse cx={cx} cy={top - 2} rx={tw - 4} ry="8" fill="#7FAA90" />
		<ellipse cx={cx - 24} cy={top - 4} rx="22" ry="3" fill="#fff" opacity=".22" />
		<rect x={cx - tw - 3} y={top} width={(tw + 3) * 2} height="7" rx="3" fill="#fff" opacity=".6" />
	</g>

	<!-- garnish -->
	{#if style.extra === 'jasmine' || style.extra === 'lychee'}
		<g transform="translate(92 334)" fill="#fff" stroke="#d8cdb8" stroke-width=".8">
			{#each [0, 72, 144, 216, 288] as a}<path d={PETAL} transform="rotate({a}) scale(.7)" />{/each}
			<circle r="3" fill="#E2C35E" stroke="none" />
		</g>
		<g transform="translate(78 346) rotate(-70)" fill="#5d8a5a" stroke="#4c7549" stroke-width=".6"><path d={LEAF} transform="scale(.6)" /></g>
	{/if}
	{#if style.extra === 'matcha'}
		<ellipse cx="316" cy="334" rx="18" ry="5" fill="#7E9B3E" />
		<ellipse cx="316" cy="331" rx="11" ry="4" fill="#94B04F" />
	{/if}
	{#if style.extra === 'tiger' || style.extra === 'boba'}
		<rect x="300" y="318" width="22" height="16" rx="3" fill="#A86A33" transform="rotate(-12 311 326)" />
		<rect x="318" y="324" width="16" height="12" rx="3" fill="#8E5626" transform="rotate(14 326 330)" />
	{/if}
	{#if style.extra === 'peach'}
		<circle cx="318" cy="324" r="16" fill="#F2A36D" />
		<path d="M318 308 q6 -8 12 -6" stroke="#5d8a5a" stroke-width="2" fill="none" />
	{/if}
	{#if style.extra === 'lemon'}
		<path d="M296 336 A18 18 0 0 1 332 336 Z" fill="#F3DD6B" />
		<path d="M300 336 A14 14 0 0 1 328 336 Z" fill="#F8EBA4" />
	{/if}
</svg>

<style>
	.drink {
		transform-origin: 200px 330px;
		transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
	}
	:global(.group:hover) .drink {
		transform: translateY(-6px) rotate(-1.5deg);
	}
	.leafshadow {
		animation: leaf 8s ease-in-out infinite alternate;
		transform-origin: 0 0;
	}
	@keyframes leaf {
		to {
			transform: translate(6px, 4px) rotate(1.5deg);
		}
	}
</style>
