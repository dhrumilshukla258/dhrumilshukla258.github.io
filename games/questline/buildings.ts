import * as THREE from 'three';
import { Collider } from '@/games/questline/engine';
import { geoBox, geoCyl, geoSph } from './geometry';
import { lmat, ltex, brickTex, glassTex, addBillboard, SignData } from './materials';
import { GROUND, addPad, addLamp } from './environment';

export type { SignData };

// ── District buildings ─────────────────────────────────────────────────────────

export function addReactBuilding(scene: THREE.Object3D, x: number, z: number) {
  addPad(scene, x, z, 2.8);
  const core = new THREE.Mesh(geoSph(0.55, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x61dafb }));
  core.position.set(x, 1.8, z); scene.add(core);
  const nucleus = new THREE.Mesh(geoCyl(1.8, 1.8, 0.22, 8),
    new THREE.MeshLambertMaterial({ color: 0x20232a }));
  nucleus.position.set(x, 0.33, z); scene.add(nucleus);
  [0, 60, 120].forEach(deg => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.09, 5, 24),
      new THREE.MeshBasicMaterial({ color: 0x61dafb }));
    ring.rotation.x = Math.PI/2;
    ring.rotation.z = (deg * Math.PI) / 180;
    ring.position.set(x, 1.8, z); scene.add(ring);
  });
  addBillboard(scene, x, z + 2.8, { line1: 'REACT', line2: '', bg: '#20232a', fg: '#61dafb' }, 2.5, 1);
}

export function addTypeScriptBuilding(scene: THREE.Object3D, x: number, z: number) {
  addPad(scene, x, z, 2.8);
  const blue = lmat(0x3178c6); const white = lmat(0xffffff);
  const box = new THREE.Mesh(geoBox(4, 3.5, 4), blue);
  box.position.set(x, 2.0, z); box.castShadow = true; scene.add(box);
  const tBar = new THREE.Mesh(geoBox(2.8, 0.4, 0.18), white);
  tBar.position.set(x, 2.9, z + 2.02); scene.add(tBar);
  const tStem = new THREE.Mesh(geoBox(0.4, 1.5, 0.18), white);
  tStem.position.set(x, 2.1, z + 2.02); scene.add(tStem);
  [2.8, 2.1, 1.4].forEach((sy, i) => {
    const s = new THREE.Mesh(geoBox(i===1?0.8:1.4, 0.32, 0.18), white);
    s.position.set(x + (i===1 ? -0.3:0.1), sy, z - 2.02); scene.add(s);
  });
  addBillboard(scene, x, z + 3, { line1: 'TypeScript', line2: '', bg: '#3178c6', fg: '#ffffff' }, 3, 1);
}

export function addCppBuilding(scene: THREE.Object3D, x: number, z: number) {
  addPad(scene, x, z, 3);
  const navy = lmat(0x004488); const light = lmat(0x5599cc);
  const base = new THREE.Mesh(geoCyl(2.4, 2.7, 0.5, 6), navy);
  base.position.set(x, 0.47, z); scene.add(base);
  const body = new THREE.Mesh(geoCyl(1.9, 2.3, 3, 6), navy);
  body.position.set(x, 2.22, z); body.castShadow = true; scene.add(body);
  const cap = new THREE.Mesh(geoCyl(0, 2.0, 0.9, 6), light);
  cap.position.set(x, 4.17, z); scene.add(cap);
  [-0.75, 0.75].forEach(ox => {
    const crossH = new THREE.Mesh(geoBox(0.9, 0.25, 0.16), lmat(0xffffff));
    crossH.position.set(x + ox, 2.2, z + 1.95); scene.add(crossH);
    const crossV = new THREE.Mesh(geoBox(0.25, 0.9, 0.16), lmat(0xffffff));
    crossV.position.set(x + ox, 2.2, z + 1.95); scene.add(crossV);
  });
  addBillboard(scene, x, z + 3, { line1: 'C++', line2: '', bg: '#003366', fg: '#5599cc' }, 2.5, 1);
}

export function addNBABuilding(scene: THREE.Object3D, x: number, z: number) {
  addPad(scene, x, z, 4);
  const ring = new THREE.Mesh(geoCyl(3.6, 3.8, 0.4, 14), lmat(0x333333));
  ring.position.set(x, 0.42, z); scene.add(ring);
  const arena = new THREE.Mesh(geoCyl(2.8, 3.3, 1.8, 14), lmat(0x1a1a2e));
  arena.position.set(x, 1.52, z); arena.castShadow = true; scene.add(arena);
  const dome = new THREE.Mesh(geoSph(2.85, 10, 5, 0, Math.PI*2, 0, Math.PI/2),
    lmat(0xcc5500));
  dome.position.set(x, 2.42, z); scene.add(dome);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [0, Math.PI/3, -Math.PI/3].forEach(angle => {
    const l = new THREE.Mesh(new THREE.TorusGeometry(2.86, 0.05, 4, 18), lineMat);
    l.rotation.x = Math.PI/2; l.rotation.z = angle;
    l.position.set(x, 2.42, z); scene.add(l);
  });
  addBillboard(scene, x, z + 4.3, { line1: 'NBA 2K', line2: 'ARENA', bg: '#1a1a2e', fg: '#cc5500' }, 3, 1);
}

export function addPythonBuilding(scene: THREE.Object3D, x: number, z: number) {
  addPad(scene, x, z, 2.5);
  const b1 = new THREE.Mesh(geoCyl(1.6, 2.0, 1.4, 9), lmat(0x3776ab));
  b1.position.set(x, 0.92, z); scene.add(b1);
  const b2 = new THREE.Mesh(geoCyl(1.2, 1.6, 1.4, 9), lmat(0xffd43b));
  b2.position.set(x + 0.35, 2.32, z); scene.add(b2);
  const b3 = new THREE.Mesh(geoCyl(0.85, 1.2, 1.4, 9), lmat(0x3776ab));
  b3.position.set(x, 3.72, z); scene.add(b3);
  const head = new THREE.Mesh(geoSph(0.65, 7, 7), lmat(0x3776ab));
  head.position.set(x - 0.45, 4.85, z); scene.add(head);
  const eye = new THREE.Mesh(geoSph(0.1, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xffd43b }));
  eye.position.set(x - 0.8, 4.96, z + 0.4); scene.add(eye);
  addBillboard(scene, x, z + 2.5, { line1: 'Python', line2: '', bg: '#3776ab', fg: '#ffd43b' }, 2.8, 1);
}

export function addGitBuilding(scene: THREE.Object3D, x: number, z: number) {
  addPad(scene, x, z, 2.5);
  const orange = lmat(0xf05032); const gray = lmat(0x888888);
  const trunk = new THREE.Mesh(geoCyl(0.28, 0.32, 2.8, 6), gray);
  trunk.position.set(x, 1.62, z); scene.add(trunk);
  const main = new THREE.Mesh(geoSph(0.65, 7, 7), orange);
  main.position.set(x, 3.1, z); scene.add(main);
  const arm = new THREE.Mesh(geoCyl(0.14, 0.18, 2.3, 5), gray);
  arm.rotation.z = -Math.PI/5; arm.position.set(x + 1.0, 2.1, z); scene.add(arm);
  const branch = new THREE.Mesh(geoSph(0.45, 7, 7), orange);
  branch.position.set(x + 1.9, 3.2, z); scene.add(branch);
  const merge = new THREE.Mesh(geoCyl(0.11, 0.14, 1.7, 5), gray);
  merge.rotation.z = Math.PI/5; merge.position.set(x + 0.95, 3.7, z); scene.add(merge);
  const top = new THREE.Mesh(geoSph(0.55, 7, 7), orange);
  top.position.set(x, 4.8, z); scene.add(top);
  addBillboard(scene, x, z + 2, { line1: 'Git', line2: '', bg: '#2b2b2b', fg: '#f05032' }, 2.2, 1);
}

export function addDigiPenBuilding(scene: THREE.Object3D, x: number, z: number) {
  const base = new THREE.Mesh(geoBox(4.5, 5.5, 4.5), lmat(0x1a2f5e));
  base.position.set(x, 2.75, z); scene.add(base);
  [1.2, 2.8, 4.4].forEach(y => {
    const band = new THREE.Mesh(geoBox(4.6, 0.18, 4.6), lmat(0xeeeeff));
    band.position.set(x, y, z); scene.add(band);
  });
  const dome = new THREE.Mesh(geoSph(1.3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    lmat(0x2244aa));
  dome.position.set(x, 5.5, z); scene.add(dome);
  const mast = new THREE.Mesh(geoCyl(0.05, 0.08, 3, 6), lmat(0xaaaacc));
  mast.position.set(x, 7.7, z); scene.add(mast);
  const dish = new THREE.Mesh(geoCyl(0.6, 0.0, 0.5, 8), lmat(0xccccee));
  dish.position.set(x + 0.8, 6.5, z); dish.rotation.z = Math.PI / 4; scene.add(dish);
  addBillboard(scene, x, z + 2.5,
    { line1: 'DIGIPEN', line2: 'Institute of Technology', bg: '#0a1a3a', fg: '#4488ff' }, 3, 1);
}

export function addNWRABuilding(scene: THREE.Object3D, x: number, z: number) {
  const body = new THREE.Mesh(geoBox(5, 4, 5), lmat(0x8a7560));
  body.position.set(x, 2, z); scene.add(body);
  const roof = new THREE.Mesh(geoBox(5.4, 0.3, 5.4), lmat(0x6a5848));
  roof.position.set(x, 4.15, z); scene.add(roof);
  [[-1, 1], [1, -1]].forEach(([dx, dz]) => {
    const d = new THREE.Mesh(geoCyl(0.5, 0.0, 0.4, 8), lmat(0xddccaa));
    d.position.set(x + dx, 4.6, z + dz); d.rotation.x = -0.5; scene.add(d);
    const arm = new THREE.Mesh(geoCyl(0.04, 0.04, 0.7, 5), lmat(0x888888));
    arm.position.set(x + dx, 4.35, z + dz); scene.add(arm);
  });
  addBillboard(scene, x, z + 2.8,
    { line1: 'NW RESEARCH', line2: 'Associates', bg: '#1a1208', fg: '#ddaa44' }, 3, 1);
}

export function addLegoBuilding(scene: THREE.Object3D, x: number, z: number) {
  const cols = [0xee2222, 0xeecc11, 0x1155ee, 0xee2222, 0xeecc11];
  cols.forEach((col, i) => {
    const block = new THREE.Mesh(geoBox(4, 1.1, 4), lmat(col));
    block.position.set(x, 0.55 + i * 1.1, z); scene.add(block);
    for (let sx = -1; sx <= 1; sx++) for (let sz = -1; sz <= 1; sz++) {
      const stud = new THREE.Mesh(geoCyl(0.25, 0.25, 0.18, 7), lmat(col));
      stud.position.set(x + sx * 1.2, 1.1 + i * 1.1, z + sz * 1.2); scene.add(stud);
    }
  });
  addBillboard(scene, x, z + 2.3,
    { line1: 'LEGO 2K DRIVE', line2: 'Open World', bg: '#110000', fg: '#ffcc00' }, 3.5, 1);
}

export function addMinesweeperBuilding(scene: THREE.Object3D, x: number, z: number, yBase = 0) {
  const base = new THREE.Mesh(geoBox(4.5, 4.5, 4.5), lmat(0x4a8a4a));
  base.position.set(x, yBase + 2.25, z); scene.add(base);
  for (let i = -1; i <= 1; i++) {
    const h = new THREE.Mesh(geoBox(4.6, 0.06, 0.06), lmat(0x226622));
    h.position.set(x, yBase + 2.25 + i * 1.1, z - 2.27); scene.add(h);
    const v = new THREE.Mesh(geoBox(0.06, 0.06, 4.6), lmat(0x226622));
    v.position.set(x + i * 1.1, yBase + 2.25, z - 2.27); scene.add(v);
  }
  [[0, 0], [1.1, -1.1], [-1.1, 1.1]].forEach(([dx, dy]) => {
    const mine = new THREE.Mesh(geoSph(0.2, 6, 6), lmat(0x111111));
    mine.position.set(x + dx, yBase + 2.25 + dy, z - 2.28); scene.add(mine);
  });
  const flagPole = new THREE.Mesh(geoCyl(0.05, 0.05, 1.4, 5), lmat(0x888888));
  flagPole.position.set(x + 1, yBase + 5.2, z); scene.add(flagPole);
  const flag = new THREE.Mesh(geoBox(0.7, 0.4, 0.05), lmat(0xee2222));
  flag.position.set(x + 1.35, yBase + 5.6, z); scene.add(flag);
  addBillboard(scene, x, z + 2.5,
    { line1: 'MINESWEEPER', line2: 'Side Project', bg: '#0a1a0a', fg: '#44ee44' }, 3.5, 1, yBase);
}

export function addRobotestBuilding(scene: THREE.Object3D, x: number, z: number) {
  const body = new THREE.Mesh(geoBox(4.8, 5, 4.8), lmat(0x555566));
  body.position.set(x, 2.5, z); scene.add(body);
  [0, 2, 4].forEach(y => {
    const stripe = new THREE.Mesh(geoBox(4.9, 0.3, 4.9), lmat(y % 4 === 0 ? 0xffcc00 : 0x222222));
    stripe.position.set(x, y + 0.15, z); scene.add(stripe);
  });
  const arm1 = new THREE.Mesh(geoBox(0.18, 1.8, 0.18), lmat(0xaaaaaa));
  arm1.position.set(x + 2.5, 6, z); scene.add(arm1);
  const arm2 = new THREE.Mesh(geoBox(1.2, 0.18, 0.18), lmat(0xaaaaaa));
  arm2.position.set(x + 3.1, 6.9, z); scene.add(arm2);
  const claw = new THREE.Mesh(geoSph(0.22, 6, 6), lmat(0xff6622));
  claw.position.set(x + 3.7, 6.9, z); scene.add(claw);
  addBillboard(scene, x, z + 2.6,
    { line1: 'ROBOTEST', line2: 'Test Framework', bg: '#111122', fg: '#ff8844' }, 3.5, 1);
}

// ── Zone buildings ─────────────────────────────────────────────────────────────

export function addSkyscraper2K(scene: THREE.Scene, x: number, z: number, sign: SignData): [Collider[], THREE.Group] {
  const glass = ltex(glassTex('#1a4a7a'));
  const darkMat = lmat(0x0d1f33);
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  const podium = new THREE.Mesh(geoBox(9, 1.2, 7), ltex(brickTex('#c8d0d8', '#a0a8b0')));
  podium.position.set(x, 0.6, z); podium.castShadow = true; scene.add(podium);

  [-3.5, 3.5].forEach(ox => {
    const col = new THREE.Mesh(geoCyl(0.22, 0.26, 2.5, 6), lmat(0xddddee));
    col.position.set(x + ox, 1.85, z + 3.6); scene.add(col);
  });

  const tower = new THREE.Mesh(geoBox(7, 4.5, 5.5), glass);
  tower.position.set(x, 3.45, z); tower.castShadow = true; scene.add(tower);

  const crown1 = new THREE.Mesh(geoBox(5, 1, 4), darkMat);
  crown1.position.set(x, 5.7, z); scene.add(crown1);
  const crown2 = new THREE.Mesh(geoBox(3, 1.2, 3), darkMat);
  crown2.position.set(x, 6.8, z); scene.add(crown2);

  [-3.6, 3.6].forEach(ox => {
    const fin = new THREE.Mesh(geoBox(0.2, 4.5, 5.6), accentMat);
    fin.position.set(x + ox, 3.45, z); scene.add(fin);
  });

  [[-3.2,-2.4],[3.2,-2.4],[-3.2,2.4],[3.2,2.4]].forEach(([bx,bz]) => {
    const b = new THREE.Mesh(geoCyl(0.12, 0.12, 7.5, 4), accentMat);
    b.position.set(x+bx, 3.75, z+bz); scene.add(b);
  });

  addBillboard(scene, x, z + 4.5, sign, 5.5, 1.5);
  addLamp(scene, x - 5, z + 4.5); addLamp(scene, x + 5, z + 4.5);

  const doorGroup1 = new THREE.Group();
  doorGroup1.position.set(x - 0.55, GROUND, z + 3.5);
  const doorMesh1 = new THREE.Mesh(geoBox(1.1, 2.2, 0.1), lmat(0x88aabb));
  doorMesh1.position.set(0.55, 1.1, 0);
  doorGroup1.add(doorMesh1);
  scene.add(doorGroup1);

  return [[{ cx: x, cz: z, hw: 4.7, hd: 3.3 }], doorGroup1];
}

export function addArtDecoBuilding(scene: THREE.Scene, x: number, z: number, sign: SignData): [Collider[], THREE.Group] {
  const sandBrick = ltex(brickTex('#d4a855', '#b88830'));
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  const tiers = [{ w:10,d:8,h:1.6 },{ w:7.5,d:6,h:1.6 },{ w:5,d:4,h:1.6 }];
  let y = 0;
  tiers.forEach((t, i) => {
    const tier = new THREE.Mesh(geoBox(t.w, t.h, t.d), sandBrick);
    tier.position.set(x, y + t.h/2, z); tier.castShadow = true; scene.add(tier);
    const stripe = new THREE.Mesh(geoBox(t.w+0.1, 0.15, t.d+0.1), accentMat);
    stripe.position.set(x, y + t.h, z); scene.add(stripe);
    if (i === 0) {
      [[-4.7,-3.7],[4.7,-3.7],[-4.7,3.7],[4.7,3.7]].forEach(([cx,cz]) => {
        const torch = new THREE.Mesh(geoCyl(0.1, 0.12, 1, 5), lmat(0x8b4513));
        torch.position.set(x+cx, y + t.h + 0.5, z+cz); scene.add(torch);
        const flame = new THREE.Mesh(geoSph(0.18, 4, 4),
          new THREE.MeshBasicMaterial({ color: sign.accent }));
        flame.position.set(x+cx, y + t.h + 1.1, z+cz); scene.add(flame);
      });
    }
    y += t.h;
  });

  const cap = new THREE.Mesh(geoCyl(0, 2, 1.5, 4), sandBrick);
  cap.position.set(x, y + 0.75, z); cap.rotation.y = Math.PI/4; scene.add(cap);

  addBillboard(scene, x, z + 4.6, sign, 6, 1.5);
  addLamp(scene, x - 6, z + 5); addLamp(scene, x + 6, z + 5);

  const doorGroup2 = new THREE.Group();
  doorGroup2.position.set(x - 0.5, GROUND, z + 4.0);
  const doorMesh2 = new THREE.Mesh(geoBox(1.0, 1.8, 0.1), lmat(0x886622));
  doorMesh2.position.set(0.5, 0.9, 0);
  doorGroup2.add(doorMesh2);
  scene.add(doorGroup2);

  return [[{ cx: x, cz: z, hw: 5.2, hd: 4.2 }], doorGroup2];
}

export function addGitHubTower(scene: THREE.Scene, x: number, z: number, sign: SignData): [Collider[], THREE.Group] {
  const darkMat = ltex(brickTex('#181c22', '#0d1117'));
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  const base = new THREE.Mesh(geoCyl(4.8, 5.2, 0.7, 16), lmat(0x0d1117));
  base.position.set(x, 0.35, z); scene.add(base);

  const body = new THREE.Mesh(geoCyl(3.8, 4.2, 4, 16), darkMat);
  body.position.set(x, 2.7, z); body.castShadow = true; scene.add(body);

  const dome = new THREE.Mesh(geoSph(3.85, 12, 6, 0, Math.PI*2, 0, Math.PI/2), lmat(0x1a1f28));
  dome.position.set(x, 4.7, z); scene.add(dome);

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const ax = x + Math.cos(angle) * 4.5, az = z + Math.sin(angle) * 4.5;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.12, 5, 8, Math.PI),
      new THREE.MeshBasicMaterial({ color: sign.accent }));
    arch.position.set(ax, 0.9, az);
    arch.rotation.y = angle + Math.PI/2;
    arch.rotation.z = Math.PI/2;
    scene.add(arch);
  }

  [1.2, 2.8, 4.4].forEach(y => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.09, 5, 20),
      new THREE.MeshBasicMaterial({ color: sign.accent }));
    ring.rotation.x = Math.PI/2; ring.position.set(x, y, z); scene.add(ring);
  });

  addBillboard(scene, x, z + 5.2, sign, 4.5, 1.5);
  addLamp(scene, x + 6, z + 5.5); addLamp(scene, x - 6, z + 5.5);

  const doorGroup3 = new THREE.Group();
  doorGroup3.position.set(x - 0.5, GROUND, z + 4.2);
  const doorMesh3 = new THREE.Mesh(geoBox(1.0, 1.9, 0.1), lmat(0x1a1f28));
  doorMesh3.position.set(0.5, 0.95, 0);
  doorGroup3.add(doorMesh3);
  scene.add(doorGroup3);

  return [[{ cx: x, cz: z, hw: 3.8, hd: 3.8 }], doorGroup3];
}

export function addAboutBuilding(scene: THREE.Scene, x: number, z: number, sign: SignData): [Collider[], THREE.Group] {
  const warmBrick = ltex(brickTex('#c87840', '#a05828'));
  const roofMat  = lmat(0x3a5a3a);
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  const body = new THREE.Mesh(geoBox(10, 3, 6.5), warmBrick);
  body.position.set(x, 1.5, z); body.castShadow = true; scene.add(body);

  const roof = new THREE.Mesh(geoCyl(0, 5.5, 2.5, 2, 1), roofMat);
  roof.position.set(x, 4, z); roof.rotation.y = Math.PI/2; roof.castShadow = true; scene.add(roof);

  const chimney = new THREE.Mesh(geoBox(0.8, 3, 0.8), lmat(0x885522));
  chimney.position.set(x + 3.2, 3.5, z - 1); scene.add(chimney);
  const chimTop = new THREE.Mesh(geoBox(1.2, 0.3, 1.2), lmat(0x666666));
  chimTop.position.set(x + 3.2, 5.15, z - 1); scene.add(chimTop);
  const smoke = new THREE.Mesh(geoSph(0.3, 5, 5), lmat(0xcccccc));
  smoke.position.set(x + 3.2, 5.6, z - 1); scene.add(smoke);

  const doorTop = new THREE.Mesh(geoCyl(0.5, 0.5, 0.15, 8, 1, false, 0, Math.PI), lmat(0x5a3010));
  doorTop.rotation.z = Math.PI/2; doorTop.position.set(x, 2.05, z + 3.28); scene.add(doorTop);

  [-3, 3].forEach(ox => {
    const win = new THREE.Mesh(geoBox(1, 0.9, 0.12), lmat(0x88ccff));
    win.position.set(x + ox, 1.6, z + 3.29); scene.add(win);
    const shutter = new THREE.Mesh(geoBox(0.4, 0.9, 0.08), accentMat);
    shutter.position.set(x + ox + 0.7, 1.6, z + 3.3); scene.add(shutter);
  });

  addBillboard(scene, x, z + 4, sign, 5.5, 1.5);
  addLamp(scene, x - 6, z + 4.5); addLamp(scene, x + 6, z + 4.5);

  const doorGroup4 = new THREE.Group();
  doorGroup4.position.set(x - 0.5, GROUND, z + 3.25);
  const doorMesh4 = new THREE.Mesh(geoBox(1.0, 2.0, 0.1), lmat(0x5a3010));
  doorMesh4.position.set(0.5, 1.0, 0);
  doorGroup4.add(doorMesh4);
  scene.add(doorGroup4);

  return [[{ cx: x, cz: z, hw: 5.2, hd: 3.5 }], doorGroup4];
}

export function addContactTower(scene: THREE.Scene, x: number, z: number, sign: SignData): [Collider[], THREE.Group] {
  const concMat = ltex(brickTex('#5a4870', '#3a2850'));
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  const platform = new THREE.Mesh(geoCyl(4, 4.5, 0.7, 8), lmat(0x3a2850));
  platform.position.set(x, 0.35, z); scene.add(platform);

  const bunker = new THREE.Mesh(geoBox(5, 2.2, 5), concMat);
  bunker.position.set(x, 1.45, z); bunker.castShadow = true; scene.add(bunker);

  const mast1 = new THREE.Mesh(geoCyl(0.5, 0.9, 3, 6), lmat(0x5a4870));
  mast1.position.set(x, 4.05, z); scene.add(mast1);
  const mast2 = new THREE.Mesh(geoCyl(0.2, 0.5, 2, 6), lmat(0x44325a));
  mast2.position.set(x, 6.6, z); scene.add(mast2);
  const spire = new THREE.Mesh(geoCyl(0.03, 0.18, 2.5, 5), accentMat);
  spire.position.set(x, 8.85, z); scene.add(spire);

  const dish = new THREE.Mesh(geoSph(1.2, 8, 5, 0, Math.PI*2, 0, Math.PI/2), lmat(0xccccdd));
  dish.rotation.x = -Math.PI/3; dish.rotation.y = 0.5; dish.position.set(x + 1.5, 3.8, z - 1); scene.add(dish);
  const dishArm = new THREE.Mesh(geoCyl(0.05, 0.05, 1.5, 4), lmat(0x888888));
  dishArm.rotation.z = Math.PI/4; dishArm.position.set(x + 0.9, 3.5, z - 0.8); scene.add(dishArm);

  [2.6, 4.5].forEach(my => {
    const brace = new THREE.Mesh(geoBox(2.5, 0.1, 0.1), accentMat);
    brace.position.set(x, my, z); scene.add(brace);
  });

  const beacon = new THREE.PointLight(sign.accent, 4, 10);
  beacon.position.set(x, 10.2, z); beacon.userData.beacon = true; scene.add(beacon);

  addBillboard(scene, x, z + 3.2, sign, 4.5, 1.5);
  addLamp(scene, x + 3.5, z + 3.5); addLamp(scene, x - 3.5, z + 3.5);

  const doorGroup5 = new THREE.Group();
  doorGroup5.position.set(x - 0.5, GROUND, z + 2.5);
  const doorMesh5 = new THREE.Mesh(geoBox(1.0, 1.8, 0.1), lmat(0x44325a));
  doorMesh5.position.set(0.5, 0.9, 0);
  doorGroup5.add(doorMesh5);
  scene.add(doorGroup5);

  return [[{ cx: x, cz: z, hw: 2.8, hd: 2.8 }], doorGroup5];
}
