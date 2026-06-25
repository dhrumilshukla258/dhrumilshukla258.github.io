import * as THREE from 'three';

// ── Character factory ──────────────────────────────────────────────────────────
// Minecraft-proportioned box character, all parts accessible for animation.

export interface CharacterColors {
  skin: number;
  body: number;
  legs: number;
  hair?: number;
}

export interface CharacterParts {
  group: THREE.Group;
  head:  THREE.Mesh;
  body:  THREE.Mesh;
  lArm:  THREE.Mesh;
  rArm:  THREE.Mesh;
  lLeg:  THREE.Mesh;
  rLeg:  THREE.Mesh;
}

function box(w: number, h: number, d: number, color: number, emissive = 0): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshPhongMaterial({ color, emissive, shininess: 30 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

export function createCharacter(colors: CharacterColors): CharacterParts {
  const g = new THREE.Group();

  const head = box(0.5, 0.5, 0.5, colors.skin);
  head.position.y = 1.6;
  g.add(head);

  if (colors.hair !== undefined) {
    const hair = box(0.52, 0.18, 0.52, colors.hair);
    hair.position.y = 0.18;
    head.add(hair);
  }

  const body = box(0.55, 0.65, 0.28, colors.body);
  body.position.y = 1.02;
  g.add(body);

  const lArm = box(0.22, 0.6, 0.22, colors.body);
  lArm.position.set(-0.385, 1.02, 0);
  g.add(lArm);

  const rArm = box(0.22, 0.6, 0.22, colors.body);
  rArm.position.set(0.385, 1.02, 0);
  g.add(rArm);

  const lLeg = box(0.24, 0.6, 0.24, colors.legs);
  lLeg.position.set(-0.14, 0.3, 0);
  g.add(lLeg);

  const rLeg = box(0.24, 0.6, 0.24, colors.legs);
  rLeg.position.set(0.14, 0.3, 0);
  g.add(rLeg);

  return { group: g, head, body, lArm, rArm, lLeg, rLeg };
}

export function animateCharacter(parts: CharacterParts, moving: boolean, t: number) {
  const swing = moving ? Math.sin(t * 8) * 0.55 : 0;
  parts.lArm.rotation.x = -swing;
  parts.rArm.rotation.x =  swing;
  parts.lLeg.rotation.x =  swing;
  parts.rLeg.rotation.x = -swing;
  parts.group.position.y = moving ? Math.abs(Math.sin(t * 8)) * 0.04 : 0;
}

// ── Building helpers ───────────────────────────────────────────────────────────

export function createBuilding(
  w: number, h: number, d: number,
  color: number,
  x: number, z: number,
  emissive = 0,
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshPhongMaterial({ color, emissive, shininess: 20 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createTree(x: number, z: number, trunkColor = 0x8B5E3C, leavesColor = 0x4a7c3f): THREE.Group {
  const g = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 0.8, 6),
    new THREE.MeshPhongMaterial({ color: trunkColor }),
  );
  trunk.position.y = 0.4;
  trunk.castShadow = true;
  g.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 1.4, 7),
    new THREE.MeshPhongMaterial({ color: leavesColor }),
  );
  leaves.position.y = 1.5;
  leaves.castShadow = true;
  g.add(leaves);

  g.position.set(x, 0, z);
  return g;
}

// ── VSCode spawn building ──────────────────────────────────────────────────────
// Always the same shape — a wide building with a glowing blue core.

export function createVSCodeBuilding(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group();

  // Main body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4, 6, 2.5),
    new THREE.MeshPhongMaterial({ color: 0x1e1e2e, emissive: 0x001133 }),
  );
  body.position.y = 3;
  body.castShadow = true;
  g.add(body);

  // Blue glass front panel
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 5, 0.05),
    new THREE.MeshPhongMaterial({ color: 0x007acc, emissive: 0x003366, transparent: true, opacity: 0.85 }),
  );
  panel.position.set(0, 3, 1.28);
  g.add(panel);

  // "<>" logo blocks
  const logoMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x4499ff });
  const logoL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.12), logoMat);
  logoL.position.set(-0.55, 3.2, 1.35);
  g.add(logoL);
  const logoR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.12), logoMat);
  logoR.position.set(0.55, 3.2, 1.35);
  g.add(logoR);

  // Glow point light
  const light = new THREE.PointLight(0x007acc, 3, 10);
  light.position.set(0, 3, 2);
  g.add(light);

  scene.add(g);
  return g;
}

// ── Collision helpers ──────────────────────────────────────────────────────────

export interface Collider { cx: number; cz: number; hw: number; hd: number; }

/** Push `pos` out of any overlapping AABB colliders. `pr` = player half-width. */
export function resolveCollisions(pos: THREE.Vector3, colliders: Collider[], pr = 0.35) {
  for (const { cx, cz, hw, hd } of colliders) {
    const ox = pos.x - cx;
    const oz = pos.z - cz;
    const overlapX = hw + pr - Math.abs(ox);
    const overlapZ = hd + pr - Math.abs(oz);
    if (overlapX > 0 && overlapZ > 0) {
      if (overlapX < overlapZ) {
        pos.x += ox < 0 ? -overlapX : overlapX;
      } else {
        pos.z += oz < 0 ? -overlapZ : overlapZ;
      }
    }
  }
}

// ── Zone system ────────────────────────────────────────────────────────────────

export interface Zone {
  label: string;
  path: string | null;   // null = no navigation (e.g. stay/play)
  position: THREE.Vector3;
  radius: number;
  marker?: THREE.Mesh;   // optional floating ring added to scene
}

export function createZoneMarker(color: number): THREE.Mesh {
  const geo = new THREE.TorusGeometry(1.2, 0.06, 8, 32);
  const mat = new THREE.MeshPhongMaterial({ color, emissive: color, transparent: true, opacity: 0.8 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.08;
  return mesh;
}

export function getNearestZone(playerPos: THREE.Vector3, zones: Zone[]): Zone | null {
  for (const zone of zones) {
    if (playerPos.distanceTo(zone.position) < zone.radius) return zone;
  }
  return null;
}

// ── Input tracker ──────────────────────────────────────────────────────────────

export interface InputState {
  left: boolean; right: boolean; up: boolean; down: boolean; action: boolean;
}

export function createInputTracker(): { state: InputState; attach: () => () => void } {
  const state: InputState = { left: false, right: false, up: false, down: false, action: false };

  const attach = () => {
    const onKey = (e: KeyboardEvent, val: boolean) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') state.left   = val;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.right  = val;
      if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W') state.up     = val;
      if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') state.down   = val;
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') state.action = val;
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  };

  return { state, attach };
}

// ── Renderer / camera setup ────────────────────────────────────────────────────

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Use window dimensions — canvas.clientWidth/Height are 0 before first paint
  r.setSize(window.innerWidth, window.innerHeight, false);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.0;
  return r;
}

export function createCamera(): THREE.PerspectiveCamera {
  return new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 500);
}

export function followCamera(camera: THREE.PerspectiveCamera, target: THREE.Vector3, heightOffset = 9, depthOffset = 13) {
  const tx = target.x;
  const tz = target.z + depthOffset;
  camera.position.x += (tx - camera.position.x) * 0.08;
  camera.position.z += (tz - camera.position.z) * 0.08;
  camera.position.y  = heightOffset;
  camera.lookAt(target.x, 0.8, target.z);
}

export function handleResize(renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
