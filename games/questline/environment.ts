import * as THREE from 'three';
import { geoBox, geoCyl, geoSph, geoPlane } from './geometry';
import { lmat, ltex, stonePathTex, addBillboard } from './materials';
import { STREET_LIGHT_POSITIONS, NIGHT_POINT_LIGHTS } from './data/world';

export const GROUND = 0.42;

// ── District ground pads ───────────────────────────────────────────────────────

export function addDistrictGround(scene: THREE.Object3D, x: number, z: number, rx: number, rz: number, color: number) {
  const mat = new THREE.MeshLambertMaterial({ color });
  const disc = new THREE.Mesh(geoCyl(1, 1, 0.04, 20), mat);
  disc.scale.set(rx, 1, rz);
  disc.position.set(x, GROUND + 0.01, z);
  scene.add(disc);
}

// ── Footpaths ─────────────────────────────────────────────────────────────────

export function createPaths(scene: THREE.Scene) {
  const PH = 0.14;
  const Y  = GROUND + PH / 2;
  const pathMat  = new THREE.MeshLambertMaterial({ map: stonePathTex() });
  const plazaMat = new THREE.MeshLambertMaterial({ color: 0xe0d4b8 });
  const edgeMat  = new THREE.MeshLambertMaterial({ color: 0xaa9870 });

  function path(x1: number, z1: number, x2: number, z2: number, w: number) {
    const dx = x2 - x1, dz = z2 - z1;
    const dist = Math.sqrt(dx*dx + dz*dz);
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
    const angle = Math.atan2(dx, dz);
    const slab = new THREE.Mesh(geoBox(w, PH, dist), pathMat);
    slab.position.set(mx, Y, mz); slab.rotation.y = angle; scene.add(slab);
    [-w/2 - 0.12, w/2 + 0.12].forEach(s => {
      const curb = new THREE.Mesh(geoBox(0.18, PH + 0.06, dist), edgeMat);
      curb.position.set(mx + Math.cos(angle)*s, Y, mz - Math.sin(angle)*s);
      curb.rotation.y = angle; scene.add(curb);
    });
  }

  function plaza(x: number, z: number, r: number) {
    const p = new THREE.Mesh(geoCyl(r, r + 0.3, PH, 16), plazaMat);
    p.position.set(x, Y, z); scene.add(p);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.15, 0.18, 4, 20), edgeMat);
    ring.rotation.x = Math.PI / 2; ring.position.set(x, Y + PH/2, z); scene.add(ring);
  }

  plaza(0, 0, 7);

  path(0, 0, 22, -22, 3);
  path(22, -22, 22, -10, 2.5);
  plaza(22, -22, 5);
  plaza(22, -10, 4);

  path(0, 0, -22, -22, 3);
  path(-22, -22, -22, -10, 2.5);
  path(-22, -22, -30, -22, 2.5);
  plaza(-22, -22, 5);
  plaza(-22, -10, 3.5);
  plaza(-30, -22, 3.5);

  path(0, 0, 22, 22, 3);
  path(0, 0, -22, 22, 3);
  plaza(22, 22, 5);
  plaza(-22, 22, 5);

  path(0, 0, 0, -30, 3);
  plaza(0, -30, 4.5);

  const hedgeGeo = geoBox(2.2, 1.6, 2.2);
  const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x2a6e18 });
  const pillarGeo = geoBox(0.6, 2.2, 0.6);
  const pillarMat = new THREE.MeshLambertMaterial({ color: 0xc8b888 });

  const hedgeCount = 56, pillarEvery = 4;
  const hedgeIM  = new THREE.InstancedMesh(hedgeGeo,  hedgeMat,  hedgeCount);
  const pillarIM = new THREE.InstancedMesh(pillarGeo, pillarMat, Math.ceil(hedgeCount / pillarEvery));
  const dm = new THREE.Object3D();
  let pi = 0;

  for (let i = 0; i < hedgeCount; i++) {
    const angle = (i / hedgeCount) * Math.PI * 2;
    const r = 43;
    dm.position.set(Math.cos(angle) * r, GROUND + 0.8, Math.sin(angle) * r);
    dm.rotation.y = -angle;
    dm.updateMatrix();
    hedgeIM.setMatrixAt(i, dm.matrix);

    if (i % pillarEvery === 0) {
      dm.position.set(Math.cos(angle) * r, GROUND + 1.1, Math.sin(angle) * r);
      dm.rotation.y = -angle; dm.updateMatrix();
      pillarIM.setMatrixAt(pi++, dm.matrix);
    }
  }
  hedgeIM.instanceMatrix.needsUpdate  = true; scene.add(hedgeIM);
  pillarIM.instanceMatrix.needsUpdate = true; scene.add(pillarIM);
}

// ── Shared lamp ────────────────────────────────────────────────────────────────

const _lpMat  = new THREE.MeshLambertMaterial({ color: 0x555566 });
const _lpGeo  = geoCyl(0.06, 0.09, 4, 5);
const _lgGeo  = geoSph(0.2, 5, 5);
const _lgMat  = new THREE.MeshBasicMaterial({ color: 0xffffcc });

export function addLamp(scene: THREE.Scene, x: number, z: number) {
  const p = new THREE.Mesh(_lpGeo, _lpMat); p.position.set(x, 2, z); scene.add(p);
  const g = new THREE.Mesh(_lgGeo, _lgMat); g.position.set(x, 4.1, z); scene.add(g);
}

// ── Portal ─────────────────────────────────────────────────────────────────────

export function addPortal(scene: THREE.Scene, x: number, z: number): THREE.Mesh[] {
  const ringGeo = new THREE.TorusGeometry(2.8, 0.22, 10, 40);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2 + 0.15;
  ring.position.set(x, GROUND + 3.2, z); scene.add(ring);

  [2.9, 3.0].forEach(r => {
    const gr = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 6, 40),
      new THREE.MeshBasicMaterial({ color: 0x00aa88, transparent: true, opacity: 0.35 }));
    gr.rotation.copy(ring.rotation); gr.position.copy(ring.position); scene.add(gr);
  });

  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.5, 32),
    new THREE.MeshBasicMaterial({ color: 0x003322, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
  disc.rotation.copy(ring.rotation); disc.position.copy(ring.position); scene.add(disc);

  [-3.2, 3.2].forEach(dx => {
    const pillar = new THREE.Mesh(geoBox(0.7, 6.5, 0.7), lmat(0x887766));
    pillar.position.set(x + dx, GROUND + 3.25, z); scene.add(pillar);
    const cap = new THREE.Mesh(geoBox(1.0, 0.5, 1.0), lmat(0x998877));
    cap.position.set(x + dx, GROUND + 6.75, z); scene.add(cap);
  });

  const runeGeo = geoBox(0.12, 0.12, 0.04);
  const runeMat = new THREE.MeshBasicMaterial({ color: 0x88ffdd });
  for (let i = 0; i < 8; i++) {
    const rune = new THREE.Mesh(runeGeo, runeMat);
    const a = (i / 8) * Math.PI * 2;
    rune.position.set(x + Math.cos(a) * 3.3, GROUND + 3.2 + Math.sin(a) * 2.2, z);
    scene.add(rune);
  }

  addBillboard(scene, x, z + 3.2,
    { line1: '⚡ PORTAL', line2: 'Snake World', bg: '#001a11', fg: '#00ffcc' }, 3, 1);

  return [ring, disc];
}

// ── Shared ground pad for decorative buildings ─────────────────────────────────

export function addPad(scene: THREE.Object3D, x: number, z: number, r = 2.5) {
  const pad = new THREE.Mesh(geoCyl(r, r + 0.2, 0.18, 10),
    new THREE.MeshLambertMaterial({ color: 0xd8cdb8 }));
  pad.position.set(x, GROUND + 0.09, z); scene.add(pad);
}

// ── Street lights — InstancedMesh setup ────────────────────────────────────────

export function createStreetLights(scene: THREE.Scene, isDay: boolean): [THREE.InstancedMesh, THREE.InstancedMesh, THREE.InstancedMesh] {
  const slN     = STREET_LIGHT_POSITIONS.length;
  const slDummy = new THREE.Object3D();
  const poleIM  = new THREE.InstancedMesh(geoCyl(0.06,0.08,4.2,6), lmat(0x888899), slN);
  const armIM   = new THREE.InstancedMesh(geoCyl(0.04,0.04,1.2,5), lmat(0x888899), slN);
  const globeIM = new THREE.InstancedMesh(geoSph(0.18,6,4),
    new THREE.MeshBasicMaterial({ color: isDay ? 0xfff8cc : 0xffee88 }), slN);
  STREET_LIGHT_POSITIONS.forEach(([lx, lz], i) => {
    slDummy.rotation.set(0,0,0);
    slDummy.position.set(lx, GROUND+2.1, lz); slDummy.updateMatrix();
    poleIM.setMatrixAt(i, slDummy.matrix);
    slDummy.rotation.z = Math.PI/2;
    slDummy.position.set(lx+0.6, GROUND+4.1, lz); slDummy.updateMatrix();
    armIM.setMatrixAt(i, slDummy.matrix);
    slDummy.rotation.z = 0;
    slDummy.position.set(lx+1.2, GROUND+4.1, lz); slDummy.updateMatrix();
    globeIM.setMatrixAt(i, slDummy.matrix);
  });
  if (!isDay) {
    NIGHT_POINT_LIGHTS.forEach(([lx, lz]) => {
      const pt = new THREE.PointLight(0xffdd88, 3, 16, 2);
      pt.position.set(lx, GROUND+4.1, lz); scene.add(pt);
    });
  }
  poleIM.instanceMatrix.needsUpdate  = true;
  armIM.instanceMatrix.needsUpdate   = true;
  globeIM.instanceMatrix.needsUpdate = true;
  scene.add(poleIM, armIM, globeIM);
  return [poleIM, armIM, globeIM];
}

// re-export ltex for buildings.ts which needs it
export { ltex };
