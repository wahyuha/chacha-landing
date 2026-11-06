// Booth Kecil, concept v2 "Fresh Morning": 110 × 55 × 80 cm, the size sold in Paket Lengkap.
// Warm-white printed HPL panels between fluted oak corner columns, forest kick band, oak top, menu riser.
// Units are metres; the front faces +z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { FRONT, SIDE, RISER, KICK, C, paintFront, paintSide, paintRiser, paintOak } from './panels.ts';

const W = 1.1, D = 0.55;
const R = 0.06; // corner column radius
const PLINTH = 0.015; // recessed shadow gap under the body
const REVEAL = 0.012; // dark shadow line between the body and the countertop
const TOP_Y = PLINTH + FRONT.h + REVEAL; // underside of the countertop

function tex(c: HTMLCanvasElement, aniso = 8) {
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = aniso;
	return t;
}

/** Quarter-round column profile with shallow flutes, extruded vertically. Origin = inner corner. */
function columnGeometry(height: number, flutes: number) {
	const s = new THREE.Shape();
	s.moveTo(0, 0);
	const n = 240;
	for (let i = 0; i <= n; i++) {
		const a = (i / n) * (Math.PI / 2);
		// flutes: shallow concave scallops, flat lands between them
		const f = flutes ? Math.max(0, Math.sin(a * flutes * 2)) ** 0.6 * 0.0045 : 0;
		const r = R - f;
		s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
	}
	s.lineTo(0, 0);
	const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 1 });
	g.rotateX(-Math.PI / 2); // extrude up the y axis; profile lies in x / -z
	g.computeVertexNormals();
	return g;
}

export type BoothParts = { group: THREE.Group; dispose: () => void };

export function buildBooth(cups: { forest: HTMLImageElement; cream: HTMLImageElement }): BoothParts {
	const group = new THREE.Group();
	const disposables: { dispose(): void }[] = [];
	const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

	// --- materials
	const hpl = (map: THREE.Texture) =>
		keep(new THREE.MeshPhysicalMaterial({ map, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 }));
	const frontMat = hpl(keep(tex(paintFront(cups))));
	const sideMatL = hpl(keep(tex(paintSide(true))));
	const sideMatR = hpl(keep(tex(paintSide(false))));
	const plain = keep(new THREE.MeshPhysicalMaterial({ color: C.white, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4 }));

	const oakV = keep(tex(paintOak(1024, 1024, 3)));
	oakV.wrapS = oakV.wrapT = THREE.RepeatWrapping;
	oakV.rotation = Math.PI / 2; // grain runs up the columns
	oakV.repeat.set(0.6, 1.4);
	const oakCol = keep(new THREE.MeshPhysicalMaterial({ map: oakV, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.3 }));

	const oakH = keep(tex(paintOak(2048, 1024, 7)));
	oakH.wrapS = oakH.wrapT = THREE.RepeatWrapping;
	const oakTop = keep(new THREE.MeshPhysicalMaterial({ map: oakH, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.18 }));

	const forest = keep(new THREE.MeshPhysicalMaterial({ color: C.forest, roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.35 }));
	const shadowGap = keep(new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.9 }));
	const acrylic = keep(new THREE.MeshPhysicalMaterial({ map: keep(tex(paintRiser())), roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }));
	const acrylicPlain = keep(new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }));

	const add = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) => {
		keep(geo);
		const m = new THREE.Mesh(geo, mat);
		m.position.set(x, y, z);
		m.castShadow = m.receiveShadow = true;
		group.add(m);
		return m;
	};

	// --- recessed plinth
	add(new THREE.BoxGeometry(W - 0.05, PLINTH, D - 0.05), shadowGap, 0, PLINTH / 2, 0);

	// --- panels (thin boxes; only the outer face carries the print)
	const T = 0.018;
	const ix = W / 2 - R, iz = D / 2 - R; // inner-corner coordinates
	const panelY = PLINTH + FRONT.h / 2;
	// (the path tracer ignores per-face material arrays, so each print is its own plane 0.3 mm proud of the panel)
	const e = 0.0003;
	add(new THREE.BoxGeometry(FRONT.w, FRONT.h, T), plain, 0, panelY, D / 2 - T / 2);
	add(new THREE.BoxGeometry(FRONT.w, FRONT.h, T), plain, 0, panelY, -D / 2 + T / 2); // operator side
	add(new THREE.BoxGeometry(T, SIDE.h, SIDE.w), plain, W / 2 - T / 2, panelY, 0);
	add(new THREE.BoxGeometry(T, SIDE.h, SIDE.w), plain, -W / 2 + T / 2, panelY, 0);
	add(new THREE.PlaneGeometry(FRONT.w, FRONT.h), frontMat, 0, panelY, D / 2 + e).castShadow = false;
	add(new THREE.PlaneGeometry(SIDE.w, SIDE.h), sideMatR, W / 2 + e, panelY, 0).rotation.y = Math.PI / 2;
	add(new THREE.PlaneGeometry(SIDE.w, SIDE.h), sideMatL, -W / 2 - e, panelY, 0).rotation.y = -Math.PI / 2;

	// --- corner columns: oak above the kick band, forest below
	const oakH_ = FRONT.h - KICK - 0.012;
	const colOak = columnGeometry(oakH_, 9);
	const colKick = columnGeometry(KICK + 0.012, 0);
	const corners: [number, number, number][] = [
		// the profile sweeps +x → -z; rotate it so each quarter faces outwards
		[ix, iz, -Math.PI / 2],
		[-ix, iz, Math.PI],
		[-ix, -iz, Math.PI / 2],
		[ix, -iz, 0]
	];
	for (const [x, z, rot] of corners) {
		const a = add(colOak, oakCol, x, PLINTH + KICK + 0.012, z);
		a.rotation.y = rot;
		const b = add(colKick, forest, x, PLINTH, z);
		b.rotation.y = rot;
	}

	// --- shadow reveal: a recessed dark strip so the oak top reads as floating above the body
	add(new THREE.BoxGeometry(W - 0.04, REVEAL, D - 0.04), shadowGap, 0, TOP_Y - REVEAL / 2, 0);

	// --- countertop: oak slab with softly rounded edges, 3 cm overhang at the front, 1.5 cm elsewhere
	add(new RoundedBoxGeometry(W + 0.03, 0.04, D + 0.045, 6, 0.01), oakTop, 0, TOP_Y + 0.02, 0.0075);

	// --- menu riser on the counter, left of centre so the right side stays free for handing over drinks
	const rz = D / 2 - 0.05;
	const riser = add(new RoundedBoxGeometry(RISER.w + 0.01, RISER.h + 0.01, 0.06, 4, 0.004), acrylicPlain, -0.14, TOP_Y + 0.04 + RISER.h / 2 + 0.005, rz - 0.03);
	// printed face as a separate plane just proud of the riser front
	const face = add(new THREE.PlaneGeometry(RISER.w, RISER.h), acrylic, -0.14, TOP_Y + 0.04 + RISER.h / 2 + 0.005, rz + 0.0002);
	face.castShadow = false;
	void riser;

	return { group, dispose: () => disposables.forEach((d) => d.dispose()) };
}
