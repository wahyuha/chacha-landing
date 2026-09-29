<script lang="ts">
	import { ridge, CLOUD } from '$lib/art';

	// Front elevations drawn to the brand: oak slats, cream panels, sage & forest, a warm LED line.
	let { id }: { id: string } = $props();

	const FLOOR = 520;
	const oak = '#C99A68';
	const oakDark = '#B5854F';
	const cream = '#F7F1E7';
	const stone = '#FBF8F2';
	const forest = '#1D5A45';
	const deep = '#143F31';
	const sage = '#6A9A7E';
	const gold = '#D4B062';
	const ink = '#26302B';

	const slats = (x: number, y: number, w: number, h: number, gap = 12) =>
		Array.from({ length: Math.floor(w / gap) }, (_, i) => x + gap / 2 + i * gap);

	const mallRidge = ridge({ width: 330, height: 120, base: 100, peaks: 4, amp: 60, seed: 3, hatch: 3 });
	const mallRidge2 = ridge({ width: 330, height: 120, base: 110, peaks: 6, amp: 34, seed: 9, hatch: 0, sharp: false });

	const dims: Record<string, { x1: number; x2: number; label: string }> = {
		portable: { x1: 240, x2: 560, label: '1000 mm' },
		'booth-kecil': { x1: 208, x2: 592, label: '1200 mm' },
		'booth-plus': { x1: 160, x2: 640, label: '1500 mm' },
		mall: { x1: 96, x2: 704, label: 'Custom · ±3000 mm' }
	};
	const dim = $derived(dims[id] ?? dims['booth-kecil']);
</script>

{#snippet wordmark(x: number, y: number, size: number, color: string, sub = true, subColor = color)}
	<text x={x} y={y} text-anchor="middle" fill={color} font-size={size} font-weight="650" letter-spacing={size * 0.16} font-family="Plus Jakarta Sans Variable, Plus Jakarta Sans, sans-serif">CHACHA</text>
	{#if sub}
		<text x={x} y={y + size * 0.62} text-anchor="middle" fill={subColor} font-size={size * 0.3} font-weight="600" letter-spacing={size * 0.1} font-family="Plus Jakarta Sans Variable, Plus Jakarta Sans, sans-serif">FRESH &amp; MILK TEA</text>
	{/if}
{/snippet}

{#snippet tablet(x: number, y: number)}
	<g transform="translate({x} {y})">
		<rect x="-4" y="-4" width="8" height="4" fill="#333" />
		<path d="M-10 0 L10 0 L4 -14 L-4 -14 Z" fill="#2a2a2a" />
		<rect x="-26" y="-50" width="52" height="36" rx="4" fill="#1e1e1e" />
		<rect x="-22" y="-46" width="44" height="28" rx="2" fill="#E9EFE9" />
		<rect x="-19" y="-43" width="16" height="22" rx="1" fill={sage} opacity=".55" />
		{#each [0, 1, 2] as i}<rect x="0" y={-42 + i * 7} width="18" height="4" rx="1" fill={forest} opacity=".35" />{/each}
	</g>
{/snippet}

{#snippet cups(x: number, y: number, n = 3)}
	{#each Array(n) as _, i}
		<g transform="translate({x + i * 22} {y})">
			<path d="M-8 0 L8 0 L10 -46 L-10 -46 Z" fill="#fff" opacity=".7" stroke="#d9d2c4" stroke-width="1" />
			{#each [10, 18, 26, 34] as t}<line x1="-9" x2="9" y1={-t} y2={-t} stroke="#e4ddcf" />{/each}
		</g>
	{/each}
{/snippet}

{#snippet plant(x: number, y: number)}
	<g transform="translate({x} {y})">
		<path d="M-12 0 L12 0 L10 -18 L-10 -18 Z" fill="#fff" stroke="#e1d9ca" />
		{#each [-40, -15, 10, 35, -60, 55] as a, i}
			<ellipse cx="0" cy="-30" rx="5" ry="14" fill={i % 2 ? '#5f8f60' : '#6fa06d'} transform="rotate({a} 0 -18)" />
		{/each}
	</g>
{/snippet}

{#snippet sealer(x: number, y: number, w = 40)}
	<g transform="translate({x} {y})">
		<rect x={-w / 2} y="-44" width={w} height="44" rx="4" fill="#d8d8d6" />
		<rect x={-w / 2 + 4} y="-40" width={w - 8} height="10" rx="2" fill="#bdbdbb" />
		<rect x={-w / 2 + 6} y="-22" width={w - 12} height="16" rx="2" fill="#efefed" />
	</g>
{/snippet}

{#snippet pumps(x: number, y: number)}
	{#each [0, 1, 2] as i}
		<g transform="translate({x + i * 16} {y})">
			<rect x="-6" y="-36" width="12" height="36" rx="2" fill={['#6b3a17', '#d9a441', '#e9d9c2'][i]} opacity=".9" />
			<rect x="-2" y="-46" width="4" height="10" fill="#222" />
			<rect x="-2" y="-48" width="10" height="3" fill="#222" />
		</g>
	{/each}
{/snippet}

{#snippet led(x1: number, x2: number, y: number)}
	<line x1={x1} x2={x2} y1={y} y2={y} stroke={gold} stroke-width="10" opacity=".35" filter="url(#glow)" />
	<line x1={x1} x2={x2} y1={y} y2={y} stroke="#F6D98C" stroke-width="2" />
{/snippet}

<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMax meet" class="size-full" aria-hidden="true">
	<defs>
		<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#F3ECE0" />
			<stop offset="1" stop-color="#EDE4D5" />
		</linearGradient>
		<filter id="glow" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="6" /></filter>
		<filter id="blur"><feGaussianBlur stdDeviation="10" /></filter>
		<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
			<path d="M40 0 L0 0 0 40" fill="none" stroke="#d9cdb8" stroke-width=".6" opacity=".6" />
		</pattern>
	</defs>

	<rect width="800" height="600" fill="url(#wall)" />
	<rect width="800" height={FLOOR} fill="url(#grid)" opacity=".45" />
	<rect y={FLOOR} width="800" height={600 - FLOOR} fill="#E6DCCB" />
	<ellipse cx="400" cy={FLOOR + 6} rx={(dim.x2 - dim.x1) / 2 + 30} ry="10" fill="#000" opacity=".12" filter="url(#blur)" />

	{#if id === 'portable'}
		<!-- poles + fabric header -->
		<rect x="252" y="96" width="6" height="140" fill="#9a9a96" />
		<rect x="542" y="96" width="6" height="140" fill="#9a9a96" />
		<rect x="240" y="80" width="320" height="56" rx="6" fill={sage} />
		{@render wordmark(400, 114, 22, '#10231C', false)}
		<!-- items -->
		{@render tablet(300, 236)}
		{@render cups(370, 236)}
		<g transform="translate(450 236)"><rect x="-10" y="-40" width="20" height="40" rx="4" fill="#c9c9c6" /><rect x="-8" y="-50" width="16" height="10" rx="3" fill="#aaa" /></g>
		<g transform="translate(500 236)"><rect x="-16" y="-54" width="32" height="54" rx="6" fill={forest} /><rect x="-5" y="-30" width="10" height="8" fill="#ddd" /></g>
		<!-- folding counter -->
		<rect x="236" y="236" width="328" height="10" rx="2" fill={stone} stroke="#e4dccd" />
		<rect x="240" y="246" width="320" height="274" fill={cream} />
		<rect x="240" y="470" width="320" height="50" fill={sage} />
		{@render wordmark(400, 350, 34, forest, true)}
		<text x="400" y="500" text-anchor="middle" fill="#10231C" font-size="11" font-weight="600" letter-spacing="3" font-family="Plus Jakarta Sans Variable, sans-serif">FROM NATURE TO YOUR CUP</text>
	{:else if id === 'booth-kecil'}
		<!-- round sign -->
		<rect x="232" y="118" width="6" height="118" fill={oakDark} />
		<circle cx="235" cy="100" r="50" fill={sage} />
		<circle cx="235" cy="100" r="44" fill="none" stroke="#fff" stroke-opacity=".5" />
		{@render wordmark(235, 106, 15, '#fff', false)}
		<!-- menu strip on counter -->
		<rect x="300" y="186" width="280" height="44" rx="3" fill="#fff" stroke="#e6ddcc" />
		{#each Array(6) as _, i}
			<rect x={318 + i * 42} y="194" width="12" height="24" rx="2" fill={['#D9BC93', '#B98B5E', '#9fbb72', '#EDAE70', '#EFC7C0', '#DED483'][i]} />
		{/each}
		{@render tablet(262, 236)}
		{@render cups(520, 186, 2)}
		{@render plant(566, 236)}
		<!-- counter -->
		<rect x="204" y="236" width="392" height="12" rx="2" fill={stone} stroke="#e4dccd" />
		<rect x="208" y="248" width="384" height="262" fill={cream} />
		<rect x="208" y="248" width="112" height="262" fill={oak} />
		{#each slats(208, 248, 112, 262) as x}<line x1={x} x2={x} y1="248" y2="510" stroke={oakDark} stroke-width="3" />{/each}
		{@render wordmark(456, 380, 40, forest, true)}
		<rect x="208" y="510" width="384" height="10" fill={oakDark} />
		{@render led(212, 588, 512)}
	{:else if id === 'booth-plus'}
		<!-- neon box header -->
		<rect x="176" y="66" width="8" height="170" fill={deep} />
		<rect x="616" y="66" width="8" height="170" fill={deep} />
		<rect x="160" y="50" width="480" height="64" rx="8" fill={deep} />
		<rect x="160" y="50" width="480" height="64" rx="8" fill="none" stroke={gold} stroke-opacity=".5" />
		<g filter="url(#glow)" opacity=".6">{@render wordmark(400, 92, 28, gold, false)}</g>
		{@render wordmark(400, 92, 28, '#F2D58A', false)}
		<!-- menu board -->
		<rect x="176" y="120" width="448" height="62" fill="#fff" stroke="#e6ddcc" />
		{#each Array(8) as _, i}
			<g transform="translate({206 + i * 55} 170)">
				<path d="M-7 0 L7 0 L9 -34 L-9 -34 Z" fill={['#D9BC93', '#B98B5E', '#9fbb72', '#EDAE70', '#EFC7C0', '#DED483', '#C9A77A', '#E3CBA8'][i]} />
				<rect x="-9" y="-38" width="18" height="4" rx="2" fill={sage} />
			</g>
		{/each}
		{@render tablet(214, 236)}
		<!-- digital menu display -->
		<g transform="translate(290 236)"><rect x="-3" y="-20" width="6" height="20" fill="#333" /><rect x="-36" y="-66" width="72" height="46" rx="3" fill="#1e1e1e" /><rect x="-32" y="-62" width="64" height="38" fill={deep} /><text x="0" y="-38" text-anchor="middle" fill={gold} font-size="9" font-weight="600" letter-spacing="2" font-family="Plus Jakarta Sans Variable, sans-serif">MENU</text></g>
		{@render sealer(370, 236, 46)}
		{@render pumps(430, 236)}
		{@render cups(500, 236, 3)}
		{@render plant(600, 236)}
		<!-- counter -->
		<rect x="156" y="236" width="488" height="12" rx="2" fill={stone} stroke="#e4dccd" />
		<rect x="160" y="248" width="480" height="262" fill={cream} />
		<rect x="160" y="248" width="96" height="262" fill={oak} />
		<rect x="544" y="248" width="96" height="262" fill={oak} />
		{#each slats(160, 248, 96, 262) as x}<line x1={x} x2={x} y1="248" y2="510" stroke={oakDark} stroke-width="3" />{/each}
		{#each slats(544, 248, 96, 262) as x}<line x1={x} x2={x} y1="248" y2="510" stroke={oakDark} stroke-width="3" />{/each}
		{@render wordmark(400, 380, 42, forest, true)}
		<rect x="160" y="510" width="480" height="10" fill={oakDark} />
		{@render led(164, 636, 512)}
	{:else}
		<!-- mall kiosk: canopy, slatted column, illustrated counter -->
		<rect x="96" y="36" width="608" height="88" rx="44" fill={cream} stroke="#e6ddcc" />
		<rect x="96" y="112" width="608" height="12" fill={forest} />
		{@render wordmark(360, 84, 30, forest, true, '#7A5E22')}
		<rect x="112" y="124" width="10" height="210" fill={forest} />
		<!-- menu boards -->
		{#each [0, 1, 2] as b}
			<rect x={144 + b * 132} y="138" width="124" height="62" fill="#fff" stroke={forest} stroke-width="2" />
			{#each Array(4) as _, i}
				<rect x={156 + b * 132 + i * 28} y="154" width="10" height="24" rx="2" fill={['#D9BC93', '#9fbb72', '#EDAE70', '#EFC7C0'][(i + b) % 4]} />
			{/each}
		{/each}
		<!-- back wall tins -->
		<rect x="140" y="214" width="380" height="120" fill="#EFE7DA" />
		{#each Array(6) as _, i}
			<rect x={156 + i * 42} y="238" width="30" height="42" rx="3" fill={forest} />
			<rect x={156 + i * 42} y="234" width="30" height="6" rx="2" fill="#2a2a2a" />
		{/each}
		<!-- slatted column + poster -->
		<rect x="540" y="124" width="140" height="396" fill={forest} />
		{#each slats(540, 124, 140, 396, 10) as x}<line x1={x} x2={x} y1="124" y2="520" stroke={deep} stroke-width="2" />{/each}
		<rect x="566" y="160" width="88" height="140" rx="10" fill={cream} stroke={gold} stroke-width="2" />
		<text x="610" y="186" text-anchor="middle" fill={forest} font-size="7" font-weight="600" letter-spacing="1.5" font-family="Plus Jakarta Sans Variable, sans-serif">FROM NATURE</text>
		<text x="610" y="196" text-anchor="middle" fill={forest} font-size="7" font-weight="600" letter-spacing="1.5" font-family="Plus Jakarta Sans Variable, sans-serif">TO YOUR CUP</text>
		<circle cx="610" cy="214" r="5" fill={gold} />
		<path d="M594 234 L606 226 L626 226 L630 280 L590 280 Z" fill={deep} />
		<!-- glass display -->
		<rect x="540" y="330" width="164" height="70" fill="#dfeee8" opacity=".55" stroke="#c9dcd4" />
		{#each Array(5) as _, i}<rect x={552 + i * 30} y="360" width="16" height="30" rx="2" fill={i % 2 ? '#F4EDE1' : forest} />{/each}
		<!-- counter with mountains -->
		{@render tablet(170, 334)}
		{@render sealer(250, 334, 44)}
		{@render pumps(320, 334)}
		{@render cups(410, 334, 3)}
		<rect x="92" y="334" width="452" height="12" rx="2" fill={stone} stroke="#e4dccd" />
		<rect x="96" y="346" width="444" height="164" fill={cream} />
		<g transform="translate(160 402)" fill="none" stroke={sage}>
			<path d={mallRidge.fill} fill={cream} stroke="none" />
			<path d={mallRidge.line} stroke-width="1.5" />
			<path d={mallRidge.hatch} stroke-width=".8" opacity=".7" />
			<path d={mallRidge2.line} stroke-width="1.2" />
			<circle cx="296" cy="36" r="9" fill={gold} stroke="none" />
			<path d={CLOUD} transform="translate(-4 34) scale(.5)" stroke={gold} stroke-width="1.6" />
		</g>
		{@render wordmark(318, 384, 26, forest, true, "#7A5E22")}
		<rect x="96" y="508" width="608" height="12" fill={forest} />
		{@render led(100, 536, 506)}
	{/if}

	<!-- dimension line -->
	<g stroke={ink} stroke-opacity=".55" fill={ink}>
		<line x1={dim.x1} x2={dim.x2} y1="556" y2="556" />
		<line x1={dim.x1} x2={dim.x1} y1="548" y2="564" />
		<line x1={dim.x2} x2={dim.x2} y1="548" y2="564" />
	</g>
	<rect x="336" y="546" width="128" height="20" fill="#E6DCCB" />
	<text x="400" y="560" text-anchor="middle" fill={ink} fill-opacity=".75" font-size="12" font-weight="600" letter-spacing="1" font-family="Plus Jakarta Sans Variable, sans-serif">{dim.label}</text>
</svg>
