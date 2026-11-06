<script lang="ts">
	// Booth Kecil render studio (dev only, noindex). Live raster preview with orbit controls. To render the product views:
	//   1. node scripts/booth-receive.mjs            (saves posted PNGs to assets-src/booth)
	//   2. open /booth?render in a normal browser tab and run window.__booth.batch(['front', 'left', 'right'], { w: 2000, h: 1700, samples: 700, exposure: 0.36 })
	//   3. node scripts/booth-export.mjs             (→ static/img/cut/booth-*.webp)
	// Headless Chrome 154 (Metal) renders the booth unlit, hence the browser tab + receiver. Keep the tab in front: hidden tabs are throttled.
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { buildBooth } from '$lib/booth/model';
	import { studioEnvironment, trace, mask, composite, flatten } from '$lib/booth/studio';
	import forestUrl from '$lib/booth/img/cup-forest.webp?url';
	import creamUrl from '$lib/booth/img/cup-cream.webp?url';

	let host: HTMLDivElement;
	let status = $state('loading');

	// product views: yaw of the camera around the booth (deg), camera height and distance (m)
	const VIEWS = {
		front: { yaw: 0, y: 1.1, dist: 4.1 },
		left: { yaw: -38, y: 1.15, dist: 4.2 },
		right: { yaw: 38, y: 1.15, dist: 4.2 },
		hero: { yaw: -24, y: 0.95, dist: 3.9 }
	} as const;
	type View = keyof typeof VIEWS;
	const TARGET = new THREE.Vector3(0, 0.47, 0);

	function place(cam: THREE.PerspectiveCamera, v: View) {
		const { yaw, y, dist } = VIEWS[v];
		const a = (yaw * Math.PI) / 180;
		cam.position.set(Math.sin(a) * dist, y, Math.cos(a) * dist);
		cam.lookAt(TARGET);
		cam.updateMatrixWorld();
	}

	const load = (src: string) =>
		new Promise<HTMLImageElement>((res, rej) => {
			const i = new Image();
			i.onload = () => res(i);
			i.onerror = rej;
			i.src = src;
		});

	function toDataURL(px: Uint8ClampedArray, w: number, h: number) {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		c.getContext('2d')!.putImageData(new ImageData(px as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
		return c.toDataURL('image/png');
	}

	onMount(() => {
		let alive = true;
		let raf = 0;
		(async () => {
			await document.fonts.ready;
			await Promise.all([
				document.fonts.load('500 100px "Cormorant Garamond"'),
				document.fonts.load('italic 500 100px "Cormorant Garamond"'),
				document.fonts.load('600 40px "Plus Jakarta Sans Variable"')
			]);
			const [forest, cream] = await Promise.all([load(forestUrl), load(creamUrl)]);

			const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
			renderer.setPixelRatio(1);
			renderer.toneMapping = THREE.NeutralToneMapping;
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			host.appendChild(renderer.domElement);

			const scene = new THREE.Scene();
			const env = studioEnvironment();
			scene.environment = env;
			scene.background = new THREE.Color('#e9e7e2');

			const booth = buildBooth({ forest, cream });
			scene.add(booth.group);

			const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.85 }));
			floor.rotation.x = -Math.PI / 2;
			floor.receiveShadow = true;
			scene.add(floor);

			// raster-only key light so the preview reads; the path tracer uses the environment alone
			const key = new THREE.DirectionalLight('#fff5e8', 1.6);
			key.position.set(-3, 4, 3.5);
			key.castShadow = true;
			key.shadow.mapSize.set(2048, 2048);
			key.shadow.camera.left = key.shadow.camera.bottom = -2;
			key.shadow.camera.right = key.shadow.camera.top = 2;
			key.shadow.radius = 6;
			scene.add(key);

			const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
			place(cam, 'left');
			const controls = new OrbitControls(cam, renderer.domElement);
			controls.target.copy(TARGET);
			controls.update();

			const resize = () => {
				const w = host.clientWidth, h = host.clientHeight;
				renderer.setSize(w, h);
				cam.aspect = w / h;
				cam.updateProjectionMatrix();
			};
			resize();
			window.addEventListener('resize', resize);
			let previewing = !location.search.includes('render');
			let warmed = false;
			const loop = () => {
				if (!alive) return;
				if (previewing) {
					controls.update();
					renderer.render(scene, cam);
				}
				raf = requestAnimationFrame(loop);
			};
			loop();
			status = 'ready';

			(window as any).__booth = {
				view(v: View) {
					place(cam, v);
					controls.target.copy(TARGET);
					controls.update();
				},
				/** Path-trace one view. Returns PNG data URLs: `cut` (transparent with floor shadow) and `flat` (on the studio floor). */
				async render(v: View, o: { w?: number; h?: number; samples?: number; exposure?: number } = {}) {
					const w = o.w ?? 1600, h = o.h ?? 1400, samples = o.samples ?? 400, exposure = o.exposure ?? 0.32;
					previewing = false;
					renderer.setSize(w, h, false);
					const rc = new THREE.PerspectiveCamera(26, w / h, 0.1, 100);
					place(rc, v);
					key.visible = false;
					scene.background = null;
					const t0 = performance.now();
					// the first trace after load comes back with an unlit booth (textures still uploading); burn one
					if (!warmed) {
						await trace(renderer, scene, rc, { samples: 8, exposure });
						warmed = true;
					}
					status = `tracing ${v} (full)`;
					const full = await trace(renderer, scene, rc, { samples, exposure, onProgress: (n) => (status = `tracing ${v} full ${n}/${samples}`) });
					booth.group.visible = false;
					const floorOnly = await trace(renderer, scene, rc, { samples: Math.max(64, samples / 2), exposure, onProgress: (n) => (status = `tracing ${v} floor ${n}`) });
					booth.group.visible = true;
					const m = mask(renderer, scene, rc, booth.group, [floor], w, h);
					const cut = toDataURL(composite(full.buf, floorOnly.buf, m, w, h, exposure), w, h);
					const flat = toDataURL(flatten(full.buf, w, h, exposure), w, h);
					key.visible = true;
					scene.background = new THREE.Color('#e9e7e2');
					resize();
					previewing = !location.search.includes('render');
					status = `done ${v} in ${Math.round((performance.now() - t0) / 1000)}s`;
					return { cut, flat, ms: performance.now() - t0 };
				},
				/** Render several views and POST each PNG to scripts/booth-receive.mjs (default :5199). Fire and forget. */
				async batch(views: View[], o: { w?: number; h?: number; samples?: number; exposure?: number } = {}, to = 'http://localhost:5199') {
					for (const v of views) {
						const r = await this.render(v, o);
						await fetch(`${to}/booth-${v}.png`, { method: 'POST', body: r.cut });
					}
					status = `batch done: ${views.join(', ')}`;
				}
			};
		})().catch((e) => {
			status = `error: ${e?.message ?? e}`;
			console.error(e);
		});
		return () => {
			alive = false;
			cancelAnimationFrame(raf);
		};
	});
</script>

<svelte:head>
	<title>Booth studio · Chacha</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="fixed inset-0 bg-[#e9e7e2]">
	<div bind:this={host} class="absolute inset-0"></div>
	<p id="status" class="absolute left-3 top-3 rounded bg-white/80 px-2 py-1 font-mono text-xs text-black">{status}</p>
</div>
