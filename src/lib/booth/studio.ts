// Photo-studio lighting and the path-traced render of the booth.
// The environment is a procedural equirect "studio": soft grey dome, a big warm key softbox front-left,
// a cooler fill right, a top scrim and a rim strip behind. The path tracer importance-samples it.
import * as THREE from 'three';
import { WebGLPathTracer } from 'three-gpu-pathtracer';

type Box = { dir: [number, number, number]; w: number; h: number; power: number; tint: [number, number, number] };

const BOXES: Box[] = [
	{ dir: [-0.75, 0.55, 0.85], w: 0.42, h: 0.5, power: 22, tint: [1, 0.96, 0.9] }, // key
	{ dir: [0.95, 0.25, 0.55], w: 0.35, h: 0.45, power: 3.5, tint: [0.94, 0.97, 1] }, // fill
	{ dir: [0, 1, 0.15], w: 0.7, h: 0.7, power: 3.5, tint: [1, 1, 1] }, // top scrim
	{ dir: [0.25, 0.35, -1], w: 0.6, h: 0.18, power: 6, tint: [1, 0.97, 0.92] } // rim behind
];

export function studioEnvironment(width = 1024) {
	const height = width / 2;
	const data = new Float32Array(width * height * 4);
	const boxes = BOXES.map((b) => {
		const n = new THREE.Vector3(...b.dir).normalize();
		const t = new THREE.Vector3(0, 1, 0).cross(n);
		if (t.lengthSq() < 1e-4) t.set(1, 0, 0);
		t.normalize();
		const bt = n.clone().cross(t).normalize();
		return { ...b, n, t, bt };
	});
	const d = new THREE.Vector3();
	for (let j = 0; j < height; j++) {
		const lat = ((j + 0.5) / height - 0.5) * Math.PI;
		for (let i = 0; i < width; i++) {
			const phi = ((i + 0.5) / width - 0.5) * Math.PI * 2;
			d.set(Math.cos(phi) * Math.cos(lat), Math.sin(lat), Math.sin(phi) * Math.cos(lat));
			// dome: light grey overhead, darker towards the floor
			const up = d.y;
			let v = up > 0 ? 0.4 + 0.3 * up : 0.32 + 0.16 * up;
			let r = v, g = v, b = v * 1.01;
			for (const bx of boxes) {
				const c = d.dot(bx.n);
				if (c <= 0) continue;
				const u = d.dot(bx.t) / c, w = d.dot(bx.bt) / c;
				const e = Math.max(Math.abs(u) / bx.w, Math.abs(w) / bx.h);
				const k = 1 - THREE.MathUtils.smoothstep(e, 0.8, 1.05);
				if (k > 0) {
					r += bx.power * k * bx.tint[0];
					g += bx.power * k * bx.tint[1];
					b += bx.power * k * bx.tint[2];
				}
			}
			const o = (j * width + i) * 4;
			data[o] = r;
			data[o + 1] = g;
			data[o + 2] = b;
			data[o + 3] = 1;
		}
	}
	const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
	tex.mapping = THREE.EquirectangularReflectionMapping;
	tex.magFilter = tex.minFilter = THREE.LinearFilter;
	tex.generateMipmaps = false;
	tex.needsUpdate = true;
	return tex;
}

/** Khronos PBR Neutral tone mapping: keeps brand colours (forest, gold) true while rolling off highlights. */
export function neutral(c: [number, number, number]): [number, number, number] {
	let [r, g, b] = c;
	const x = Math.min(r, g, b);
	const off = x < 0.08 ? x - 6.25 * x * x : 0.04;
	r -= off; g -= off; b -= off;
	const peak = Math.max(r, g, b);
	const start = 0.76;
	if (peak < start) return [r, g, b];
	const dd = 1 - start;
	const np = 1 - (dd * dd) / (peak + dd - start);
	const s = np / peak;
	r *= s; g *= s; b *= s;
	const k = 1 - 1 / (0.15 * (peak - np) + 1);
	return [r + (np - r) * k, g + (np - g) * k, b + (np - b) * k];
}

const srgb = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

export type TraceOpts = { samples: number; exposure: number; onProgress?: (n: number) => void };

/** Accumulate `samples` path-traced samples and return the linear RGBA float buffer. */
export async function trace(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, opts: TraceOpts) {
	const pt = new WebGLPathTracer(renderer);
	pt.renderToCanvas = false;
	pt.rasterizeScene = false;
	pt.textureSize.set(2048, 2048);
	pt.bounces = 8;
	pt.filterGlossyFactor = 0.4;
	pt.renderDelay = 0;
	pt.minSamples = 0;
	pt.fadeDuration = 0;
	pt.tiles.set(2, 2);
	pt.setScene(scene, camera);
	while (pt.samples < opts.samples) {
		pt.renderSample();
		if (Math.floor(pt.samples) % 48 === 0) {
			opts.onProgress?.(pt.samples);
			await new Promise((r) => setTimeout(r, 0));
		}
	}
	const t = pt.target;
	const buf = new Float32Array(t.width * t.height * 4);
	renderer.readRenderTargetPixels(t, 0, 0, t.width, t.height, buf);
	pt.dispose();
	return { buf, width: t.width, height: t.height };
}

/** Coverage mask (1 = booth) rendered with MSAA at the same camera. */
export function mask(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, booth: THREE.Object3D, hide: THREE.Object3D[], w: number, h: number) {
	const rt = new THREE.WebGLRenderTarget(w, h, { samples: 8, type: THREE.UnsignedByteType });
	const white = new THREE.MeshBasicMaterial({ color: '#fff' });
	const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
	booth.traverse((o) => {
		if ((o as THREE.Mesh).isMesh) {
			const m = o as THREE.Mesh;
			saved.set(m, m.material);
			m.material = white;
		}
	});
	const vis = hide.map((o) => o.visible);
	hide.forEach((o) => (o.visible = false));
	const bg = scene.background, env = scene.environment;
	scene.background = new THREE.Color('#000');
	scene.environment = null;
	const tm = renderer.toneMapping;
	renderer.toneMapping = THREE.NoToneMapping;
	renderer.setRenderTarget(rt);
	renderer.render(scene, camera);
	const px = new Uint8Array(w * h * 4);
	renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
	renderer.setRenderTarget(null);
	renderer.toneMapping = tm;
	scene.background = bg;
	scene.environment = env;
	hide.forEach((o, i) => (o.visible = vis[i]));
	saved.forEach((m, mesh) => (mesh.material = m));
	rt.dispose();
	white.dispose();
	return px;
}

/**
 * Shadow-catcher composite: booth pixels from the full render, and outside the booth only the darkening
 * the booth casts on the floor (full ÷ floor-only), as black with alpha. Rows are flipped to top-down.
 */
export function composite(full: Float32Array, floor: Float32Array, m: Uint8Array, w: number, h: number, exposure: number, shadow = 0.9) {
	const out = new Uint8ClampedArray(w * h * 4);
	// luminance of both passes, box-blurred so sampling noise doesn't turn into a grey veil over the whole floor
	const lumOf = (a: Float32Array) => {
		const l = new Float32Array(w * h);
		for (let k = 0; k < w * h; k++) l[k] = 0.2126 * a[k * 4] + 0.7152 * a[k * 4 + 1] + 0.0722 * a[k * 4 + 2];
		return blur(blur(l, w, h, 4), w, h, 4);
	};
	const lFull = lumOf(full), lFloor = lumOf(floor);
	const floorAlpha = (k: number) => floor[k * 4 + 3];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const k = y * w + x;
			const i = k * 4;
			const o = ((h - 1 - y) * w + x) * 4;
			const cov = m[i] / 255;
			const lf = lFloor[k];
			const s = lf > 1e-4 && floorAlpha(k) > 0.5 ? Math.min(1, lFull[k] / lf) : 1;
			const sa = Math.max(0, (1 - s - 0.035) / 0.965) * shadow;
			const a = cov + (1 - cov) * sa;
			if (a <= 0.002) continue;
			const [r, g, b] = neutral([full[i] * exposure, full[i + 1] * exposure, full[i + 2] * exposure]);
			// premultiplied: booth colour × coverage + black shadow; un-premultiply by alpha
			out[o] = (srgb(Math.max(0, r)) * 255 * cov) / a;
			out[o + 1] = (srgb(Math.max(0, g)) * 255 * cov) / a;
			out[o + 2] = (srgb(Math.max(0, b)) * 255 * cov) / a;
			out[o + 3] = a * 255;
		}
	}
	return out;
}

/** Separable box blur (radius r), run twice above for a near-Gaussian falloff. */
function blur(src: Float32Array, w: number, h: number, r: number) {
	const tmp = new Float32Array(w * h), dst = new Float32Array(w * h);
	const n = 2 * r + 1;
	for (let y = 0; y < h; y++) {
		let acc = 0;
		for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
		for (let x = 0; x < w; x++) {
			tmp[y * w + x] = acc / n;
			acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
		}
	}
	for (let x = 0; x < w; x++) {
		let acc = 0;
		for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
		for (let y = 0; y < h; y++) {
			dst[y * w + x] = acc / n;
			acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
		}
	}
	return dst;
}

/** Opaque version on a solid backdrop (for quick looks and the poster). Rows flipped to top-down. */
export function flatten(full: Float32Array, w: number, h: number, exposure: number) {
	const out = new Uint8ClampedArray(w * h * 4);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const i = (y * w + x) * 4;
			const o = ((h - 1 - y) * w + x) * 4;
			const [r, g, b] = neutral([full[i] * exposure, full[i + 1] * exposure, full[i + 2] * exposure]);
			out[o] = srgb(Math.max(0, r)) * 255;
			out[o + 1] = srgb(Math.max(0, g)) * 255;
			out[o + 2] = srgb(Math.max(0, b)) * 255;
			out[o + 3] = 255;
		}
	}
	return out;
}
