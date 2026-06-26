import * as THREE from 'three';
import { geoBox, geoCyl, geoSph, geoPlane } from './geometry';
import { lmat } from './materials';

export const GROUND = 0.42;

// ── NPC types ──────────────────────────────────────────────────────────────────

export interface FullNPC {
  group: THREE.Group; head: THREE.Mesh;
  rArm: THREE.Mesh; lArm: THREE.Mesh;
  lThigh: THREE.Mesh; rThigh: THREE.Mesh;
  lShin: THREE.Mesh; rShin: THREE.Mesh;
}

export type NpcIdleType = 'bench' | 'picnic_a' | 'picnic_b' | 'laptop' | 'theater';

export interface NpcAnim {
  npc: FullNPC;
  spawnX: number; spawnZ: number;
  finalX: number; finalZ: number;
  finalGroupY: number;
  delay: number;
  walkDur: number;
  sitDur: number;
  phase: 'wait' | 'fall' | 'walk' | 'sitdown' | 'idle';
  timer: number;
  idleType: NpcIdleType;
  idleIndex: number;
  bubble: THREE.Sprite;
  pokeTimer: number;
  pokeCooldown: number;
}

// Pose keyframes (local positions within the NPC group)
export const _SIT_LT = new THREE.Vector3(-0.14, 0.84, 0.22);
export const _SIT_RT = new THREE.Vector3( 0.14, 0.84, 0.22);
export const _SIT_LS = new THREE.Vector3(-0.14, 0.58, 0.44);
export const _SIT_RS = new THREE.Vector3( 0.14, 0.58, 0.44);
export const _STD_LT = new THREE.Vector3(-0.14, 0.52, 0.04);
export const _STD_RT = new THREE.Vector3( 0.14, 0.52, 0.04);
export const _STD_LS = new THREE.Vector3(-0.14, 0.24, 0.04);
export const _STD_RS = new THREE.Vector3( 0.14, 0.24, 0.04);

export const NPC_POKE_LINES: Record<NpcIdleType, string[]> = {
  bench:    ['Occupied! 😤', 'Personal space!', 'Back off!'],
  picnic_a: ['PRIVATE PICNIC!', 'Go away! 😠', "We're on a date!"],
  picnic_b: ['Seriously?! 😒', 'SO RUDE.', 'BUZZ OFF!'],
  laptop:   ["I'm coding! 💻", 'NO DISTRACTIONS!', 'ERROR: YOU'],
  theater:  ["SIT DOWN! 🍿", "SHHHH! 🤫", "I CAN'T SEE!", 'MOVE IT!', 'Bro... 😤'],
};

export function makeSpeechBubble(scene: THREE.Scene, npcGroup: THREE.Group): THREE.Sprite {
  const c = document.createElement('canvas'); c.width = 280; c.height = 88;
  const cx = c.getContext('2d')!;
  void cx; // used on demand
  const tex = new THREE.CanvasTexture(c);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  spr.scale.set(2.8, 0.88, 1); spr.visible = false;
  spr.position.set(0, 2.6, 0);
  npcGroup.add(spr);
  (spr as THREE.Sprite & { _canvas: HTMLCanvasElement; _tex: THREE.CanvasTexture })._canvas = c;
  (spr as THREE.Sprite & { _canvas: HTMLCanvasElement; _tex: THREE.CanvasTexture })._tex    = tex;
  return spr;
}

export function showBubble(spr: THREE.Sprite, msg: string) {
  const s = spr as THREE.Sprite & { _canvas: HTMLCanvasElement; _tex: THREE.CanvasTexture };
  const cx = s._canvas.getContext('2d')!;
  cx.clearRect(0, 0, 280, 88);
  cx.fillStyle = 'rgba(255,255,220,0.95)';
  cx.beginPath(); cx.roundRect(4, 4, 272, 64, 12); cx.fill();
  cx.strokeStyle = '#555'; cx.lineWidth = 2;
  cx.beginPath(); cx.roundRect(4, 4, 272, 64, 12); cx.stroke();
  cx.fillStyle = '#111'; cx.font = 'bold 20px monospace';
  cx.textAlign = 'center'; cx.fillText(msg, 140, 44);
  cx.fillStyle = 'rgba(255,255,220,0.95)';
  cx.beginPath(); cx.moveTo(120, 68); cx.lineTo(140, 85); cx.lineTo(160, 68); cx.fill();
  s._tex.needsUpdate = true; spr.visible = true;
}

export function makeNPC(
  scene: THREE.Scene,
  x: number, z: number,
  facingY: number,
  skin: number, body: number, legs: number, hair: number,
  startSitting = false,
): FullNPC {
  const g = new THREE.Group();
  const mk = (w: number, h: number, d: number, col: number) =>
    new THREE.Mesh(geoBox(w, h, d), new THREE.MeshLambertMaterial({ color: col }));

  const head = mk(0.5, 0.5, 0.5, skin); head.position.set(0, 1.65, 0);
  const hairMesh = mk(0.52, 0.18, 0.52, hair); hairMesh.position.y = 0.18; head.add(hairMesh);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  [[-0.1, 0.06], [0.1, 0.06]].forEach(([ex, ey]) => {
    const eye = new THREE.Mesh(geoBox(0.09, 0.09, 0.03), eyeMat);
    eye.position.set(ex, ey, 0.27); head.add(eye);
  });
  const mouth = new THREE.Mesh(geoBox(0.12, 0.03, 0.03), eyeMat);
  mouth.position.set(0, -0.1, 0.27); head.add(mouth);

  const torso  = mk(0.55, 0.65, 0.28, body); torso.position.set(0, 1.1, 0);
  const lArm   = mk(0.22, 0.55, 0.22, body); lArm.position.set(-0.39, 1.0, 0);
  const rArm   = mk(0.22, 0.55, 0.22, body); rArm.position.set( 0.39, 1.0, 0);
  const lThigh = mk(0.24, 0.22, 0.42, legs);
  const rThigh = mk(0.24, 0.22, 0.42, legs);
  const lShin  = mk(0.22, 0.38, 0.22, legs);
  const rShin  = mk(0.22, 0.38, 0.22, legs);

  if (startSitting) {
    lThigh.position.copy(_SIT_LT); rThigh.position.copy(_SIT_RT);
    lShin.position.copy(_SIT_LS);  rShin.position.copy(_SIT_RS);
  } else {
    lThigh.position.copy(_STD_LT); rThigh.position.copy(_STD_RT);
    lShin.position.copy(_STD_LS);  rShin.position.copy(_STD_RS);
  }

  g.add(head, torso, lArm, rArm, lThigh, rThigh, lShin, rShin);
  g.position.set(x, GROUND, z); g.rotation.y = facingY;
  scene.add(g);
  return { group: g, head, rArm, lArm, lThigh, rThigh, lShin, rShin };
}

// keep old name as alias so existing calls compile
export const makeSittingNPC = (scene: THREE.Scene, x: number, z: number, facingY: number,
  skin: number, body: number, legs: number, hair: number) =>
  makeNPC(scene, x, z, facingY, skin, body, legs, hair, true);

export function makeBench(scene: THREE.Scene, x: number, z: number, rotY = 0, scale = 1) {
  const wood = lmat(0x8b5e2a); const iron = lmat(0x555555);
  const g = new THREE.Group();
  const W = 1.1 * scale;
  [-0.12, 0, 0.12].forEach(ox => {
    const slat = new THREE.Mesh(geoBox(W, 0.07 * scale, 0.17 * scale), wood);
    slat.position.set(0, 0.48 * scale, ox * scale); g.add(slat);
  });
  [-0.1, 0.05].forEach(ox => {
    const s = new THREE.Mesh(geoBox(W, 0.07 * scale, 0.14 * scale), wood);
    s.position.set(0, 0.85 * scale, (-0.28 + ox) * scale); g.add(s);
  });
  [-(W / 2 + 0.04), (W / 2 + 0.04)].forEach(sx => {
    const frame = new THREE.Mesh(geoBox(0.07 * scale, 1.0 * scale, 0.58 * scale), iron);
    frame.position.set(sx, 0.5 * scale, -0.05 * scale); g.add(frame);
    const feet = new THREE.Mesh(geoBox(0.09 * scale, 0.11 * scale, 0.65 * scale), iron);
    feet.position.set(sx, 0.055 * scale, -0.05 * scale); g.add(feet);
  });
  g.position.set(x, GROUND, z); g.rotation.y = rotY;
  scene.add(g);
}

export function makePicnicBlanket(scene: THREE.Scene, x: number, z: number) {
  const bc = document.createElement('canvas'); bc.width = bc.height = 128;
  const bctx = bc.getContext('2d')!;
  const cols = ['#cc3344', '#eeddcc'];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    bctx.fillStyle = cols[(r + c) % 2]; bctx.fillRect(c*16, r*16, 16, 16);
  }
  const blanket = new THREE.Mesh(
    geoPlane(3.2, 2.8),
    new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(bc) }),
  );
  blanket.rotation.x = -Math.PI/2; blanket.position.set(x, GROUND + 0.02, z); scene.add(blanket);

  const apple = new THREE.Mesh(geoSph(0.14, 6, 6), lmat(0xdd3333));
  apple.position.set(x, GROUND + 0.15, z); scene.add(apple);
  const stem = new THREE.Mesh(geoCyl(0.02, 0.02, 0.18, 4), lmat(0x5a3010));
  stem.position.set(x, GROUND + 0.34, z); scene.add(stem);

  const sandwich = new THREE.Mesh(geoBox(0.4, 0.14, 0.28), lmat(0xddbb77));
  sandwich.position.set(x + 0.5, GROUND + 0.1, z - 0.2); scene.add(sandwich);
  const filling = new THREE.Mesh(geoBox(0.4, 0.06, 0.28), lmat(0x88cc44));
  filling.position.set(x + 0.5, GROUND + 0.1, z - 0.2); scene.add(filling);

  const cup1 = new THREE.Mesh(geoCyl(0.1, 0.08, 0.25, 7), lmat(0xff6644));
  cup1.position.set(x - 0.5, GROUND + 0.14, z + 0.3); scene.add(cup1);
  const cup2 = new THREE.Mesh(geoCyl(0.1, 0.08, 0.25, 7), lmat(0x44aaff));
  cup2.position.set(x + 0.4, GROUND + 0.14, z + 0.4); scene.add(cup2);
}

export function makeLaptop(scene: THREE.Scene, x: number, z: number, rotY: number): THREE.Mesh {
  const g = new THREE.Group();
  const base = new THREE.Mesh(geoBox(0.7, 0.05, 0.5), lmat(0x888888));
  base.position.set(0, 0, 0); g.add(base);
  const screen = new THREE.Mesh(geoBox(0.66, 0.44, 0.03), lmat(0x222222));
  screen.position.set(0, 0.245, -0.24); screen.rotation.x = -0.45; g.add(screen);
  const display = new THREE.Mesh(geoPlane(0.58, 0.38),
    new THREE.MeshBasicMaterial({ color: 0x1e1e2e }));
  display.position.set(0, 0.245, -0.225); display.rotation.x = -0.45; g.add(display);
  [0x007acc, 0x569cd6, 0x4ec9b0, 0xce9178].forEach((col, i) => {
    const line = new THREE.Mesh(geoPlane(0.3 - i * 0.04, 0.025),
      new THREE.MeshBasicMaterial({ color: col }));
    line.position.set(-0.1 + i * 0.02, 0.28 - i * 0.065, -0.21);
    line.rotation.x = -0.45; g.add(line);
  });
  g.position.set(x, GROUND + 0.88, z); g.rotation.y = rotY;
  scene.add(g);
  return screen;
}
