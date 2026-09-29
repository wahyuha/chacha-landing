<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import * as THREE from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
	import { makeCanvases, type Variant } from './texture';

	let { variant, progress, pointer }: { variant: Variant; progress: number; pointer: { x: number; y: number } } = $props();

	const { renderer, scene, invalidate, size } = useThrelte();
	let camera: THREE.PerspectiveCamera | undefined = $state();
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

	// Paper wall: tapered, open-ended cylinder. Rotate the geometry so the wordmark (u = .5) faces the camera.
	const wall = new THREE.CylinderGeometry(1, 0.74, 2.9, 128, 1, true);
	wall.rotateY(Math.PI);

	const material = new THREE.MeshPhysicalMaterial({
		roughness: 0.55,
		metalness: 1,
		clearcoat: 0.25,
		clearcoatRoughness: 0.6,
		side: THREE.FrontSide
	});

	const textures: Partial<Record<Variant, { map: THREE.CanvasTexture; metal: THREE.CanvasTexture }>> = {};
	const maxAniso = renderer.capabilities.getMaxAnisotropy();

	async function load(v: Variant) {
		if (!textures[v]) {
			const { color, metal } = await makeCanvases(v);
			const map = new THREE.CanvasTexture(color);
			map.colorSpace = THREE.SRGBColorSpace;
			map.anisotropy = maxAniso;
			const m = new THREE.CanvasTexture(metal);
			m.anisotropy = maxAniso;
			textures[v] = { map, metal: m };
		}
		const t = textures[v]!;
		material.map = t.map;
		material.metalnessMap = t.metal;
		material.roughness = v === 'forest' ? 0.5 : 0.62;
		material.needsUpdate = true;
		invalidate();
	}

	$effect(() => {
		load(variant);
	});

	function makeShadow() {
		const c = document.createElement('canvas');
		c.width = c.height = 128;
		const g = c.getContext('2d')!;
		const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
		grd.addColorStop(0, '#fff');
		grd.addColorStop(1, '#000');
		g.fillStyle = grd;
		g.fillRect(0, 0, 128, 128);
		const alphaMap = new THREE.CanvasTexture(c);
		return new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.45, depthWrite: false, alphaMap });
	}
	const shadowMat = makeShadow();

	let group: THREE.Group | undefined = $state();
	let spin = 0;
	let tiltX = 0;
	let tiltZ = 0;

	useTask((delta) => {
		if (camera) {
			// keep the whole cup in frame on tall, narrow stages
			const aspect = size.current.width / Math.max(1, size.current.height);
			const z = Math.max(9.6, 3.1 / (0.536 * aspect));
			camera.position.z += (z - camera.position.z) * 0.2;
		}
		if (!group) return;
		spin += delta * 0.18;
		const target = progress * Math.PI * 2.2 + spin;
		group.rotation.y += (target - group.rotation.y) * Math.min(1, delta * 4);
		tiltX += (pointer.y * 0.12 - tiltX) * Math.min(1, delta * 3);
		tiltZ += (-pointer.x * 0.08 - tiltZ) * Math.min(1, delta * 3);
		group.rotation.x = 0.08 + tiltX;
		group.rotation.z = tiltZ;
		group.position.y = Math.sin(performance.now() / 1400) * 0.05;
	});
</script>

<T.PerspectiveCamera makeDefault bind:ref={camera} position={[0, 0.45, 8.2]} fov={30} oncreate={(c) => c.lookAt(0, 0.15, 0)} />
<T.DirectionalLight position={[3, 5, 4]} intensity={2.2} color="#fff4e0" />
<T.DirectionalLight position={[-4, 2, -2]} intensity={0.6} color="#cfe3d6" />
<T.AmbientLight intensity={0.25} />

<T.Group bind:ref={group}>
	<!-- printed wall -->
	<T.Mesh geometry={wall} {material} />
	<!-- inner wall -->
	<T.Mesh>
		<T.CylinderGeometry args={[0.99, 0.73, 2.9, 96, 1, true]} />
		<T.MeshStandardMaterial color="#efe7da" roughness={0.9} side={THREE.BackSide} />
	</T.Mesh>
	<!-- base -->
	<T.Mesh position.y={-1.45} rotation.x={Math.PI / 2}>
		<T.CircleGeometry args={[0.74, 64]} />
		<T.MeshStandardMaterial color="#e4dccf" side={THREE.DoubleSide} />
	</T.Mesh>
	<!-- rolled rim -->
	<T.Mesh position.y={1.45} rotation.x={Math.PI / 2}>
		<T.TorusGeometry args={[1.0, 0.035, 16, 128]} />
		<T.MeshStandardMaterial color="#f1ebe0" roughness={0.6} />
	</T.Mesh>
	<!-- lid -->
	<T.Group position.y={1.5}>
		<T.Mesh>
			<T.CylinderGeometry args={[1.07, 1.05, 0.14, 96]} />
			<T.MeshStandardMaterial color="#141414" roughness={0.35} metalness={0.1} />
		</T.Mesh>
		<T.Mesh position.y={0.16}>
			<T.CylinderGeometry args={[0.9, 1.0, 0.2, 96]} />
			<T.MeshStandardMaterial color="#151515" roughness={0.32} metalness={0.1} />
		</T.Mesh>
		<T.Mesh position.y={0.265}>
			<T.CylinderGeometry args={[0.86, 0.9, 0.02, 96]} />
			<T.MeshStandardMaterial color="#1b1b1b" roughness={0.45} />
		</T.Mesh>
		<T.Mesh position={[0, 0.29, 0.58]}>
			<T.BoxGeometry args={[0.28, 0.035, 0.12]} />
			<T.MeshStandardMaterial color="#0e0e0e" roughness={0.5} />
		</T.Mesh>
	</T.Group>
</T.Group>

<!-- soft contact shadow -->
<T.Mesh position.y={-1.62} rotation.x={-Math.PI / 2} material={shadowMat}>
	<T.CircleGeometry args={[1.5, 64]} />
</T.Mesh>
