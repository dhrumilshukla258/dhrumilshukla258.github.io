import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import * as THREE from 'three';
import {
  createCharacter, animateCharacter,
  createVSCodeBuilding,
  createZoneMarker, getNearestZone, Zone,
  createInputTracker, createRenderer, createCamera, handleResize,
  resolveCollisions, Collider,
} from '@/lib/worldGame';
import { useMenu } from '@/components/MenuContext';
import { GameDpad, ActionBtn } from '@/components/GameDpad';
import { cityZones, spawnBuildingLabel, worldName } from '@/data/gamerWorld';
import styles from '@/styles/WorldGame.module.css';

// ── Procedural textures ────────────────────────────────────────────────────────

const _texCache = new Map<string, THREE.CanvasTexture>();

function makeTex(key: string, draw: (ctx: CanvasRenderingContext2D) => void, tileRepeat = 1): THREE.CanvasTexture {
  if (_texCache.has(key)) return _texCache.get(key)!;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (tileRepeat > 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(tileRepeat, tileRepeat); }
  _texCache.set(key, t);
  return t;
}

function stonePathTex() {
  return makeTex('stone', ctx => {
    // Base warm stone
    ctx.fillStyle = '#c4b89a'; ctx.fillRect(0, 0, 256, 256);
    // Random stone variation
    for (let i = 0; i < 40; i++) {
      const sx = Math.random()*256, sy = Math.random()*256;
      ctx.fillStyle = `rgba(${Math.random()>0.5?0:255},${Math.random()>0.5?0:255},0,0.04)`;
      ctx.fillRect(sx, sy, 18+Math.random()*20, 14+Math.random()*14);
    }
    // Mortar grid
    ctx.strokeStyle = '#8a7a62'; ctx.lineWidth = 3;
    const bw = 52, bh = 30;
    for (let row = 0; row < 10; row++) for (let col = 0; col < 6; col++) {
      const ox = row % 2 === 0 ? 0 : bw / 2;
      const rx = col*bw - ox, ry = row*bh;
      ctx.strokeRect(rx, ry, bw, bh);
      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(rx+3, ry+3, bw*0.5, bh*0.4);
    }
  }, 5);
}

function brickTex(base: string, line: string) {
  return makeTex(`brick${base}`, ctx => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = line; ctx.lineWidth = 3;
    const bw = 48, bh = 22;
    for (let row = 0; row < 12; row++) for (let col = 0; col < 6; col++) {
      const ox = row % 2 === 0 ? 0 : bw / 2;
      ctx.strokeRect(col * bw - ox, row * bh, bw, bh);
    }
  });
}

function glassTex(tint: string) {
  return makeTex(`glass${tint}`, ctx => {
    ctx.fillStyle = tint; ctx.fillRect(0, 0, 256, 256);
    // Grid of window panes
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i*32, 0); ctx.lineTo(i*32, 256); ctx.stroke(); }
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, i*32); ctx.lineTo(256, i*32); ctx.stroke(); }
    // Some lit windows
    ctx.fillStyle = 'rgba(255,240,180,0.4)';
    [[32,32],[96,64],[160,96],[64,160],[192,128]].forEach(([wx,wy]) => ctx.fillRect(wx+2, wy+2, 28, 28));
  });
}

// ── Sign billboard — on a pole, never clips buildings ─────────────────────────

const _signCache = new Map<string, THREE.CanvasTexture>();
function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxPx: number): number {
  let size = maxPx;
  ctx.font = `bold ${size}px Arial`;
  while (ctx.measureText(text).width > maxW && size > 14) { size -= 2; ctx.font = `bold ${size}px Arial`; }
  return size;
}

function makeSignTex(line1: string, line2: string, bg: string, fg: string): THREE.CanvasTexture {
  const key = `${line1}|${line2}|${bg}|${fg}`;
  if (_signCache.has(key)) return _signCache.get(key)!;
  const c = document.createElement('canvas'); c.width = 512; c.height = 200;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 200);
  ctx.strokeStyle = fg; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 504, 192);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (line2) {
    fitFont(ctx, line1, 490, 68); ctx.fillText(line1, 256, 72);
    fitFont(ctx, line2, 490, 52); ctx.globalAlpha = 0.75; ctx.fillText(line2, 256, 150); ctx.globalAlpha = 1;
  } else {
    fitFont(ctx, line1, 490, 82); ctx.fillText(line1, 256, 100);
  }
  const t = new THREE.CanvasTexture(c);
  _signCache.set(key, t);
  return t;
}

const _boardMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
const _poleMat2 = new THREE.MeshLambertMaterial({ color: 0x666677 });
const _bpGeo    = new THREE.CylinderGeometry(0.06, 0.09, 2.8, 5);

function addBillboard(
  scene: THREE.Scene, x: number, z: number,
  sign: { line1: string; line2: string; bg: string; fg: string },
  w = 3.5, h = 1.2,
) {
  // Pole (short — sign sits at eye level ~3 units)
  const pole = new THREE.Mesh(_bpGeo, _poleMat2);
  pole.position.set(x, 1.4, z); scene.add(pole);
  // Board backing
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h + 0.2, 0.15), _boardMat);
  back.position.set(x, 3.1, z); scene.add(back);
  // Sign face
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: makeSignTex(sign.line1, sign.line2, sign.bg, sign.fg) }),
  );
  face.position.set(x, 3.1, z + 0.09); scene.add(face);
}

// ── Shared lamp ────────────────────────────────────────────────────────────────

const _lpMat  = new THREE.MeshLambertMaterial({ color: 0x555566 });
const _lpGeo  = new THREE.CylinderGeometry(0.06, 0.09, 4, 5);
const _lgGeo  = new THREE.SphereGeometry(0.2, 5, 5);
const _lgMat  = new THREE.MeshBasicMaterial({ color: 0xffffcc });

function addLamp(scene: THREE.Scene, x: number, z: number) {
  const p = new THREE.Mesh(_lpGeo, _lpMat); p.position.set(x, 2, z); scene.add(p);
  const g = new THREE.Mesh(_lgGeo, _lgMat); g.position.set(x, 4.1, z); scene.add(g);
}

// ── Shared material helper ─────────────────────────────────────────────────────

const _lmats = new Map<number, THREE.MeshLambertMaterial>();
function lmat(color: number) {
  if (!_lmats.has(color)) _lmats.set(color, new THREE.MeshLambertMaterial({ color }));
  return _lmats.get(color)!;
}
function ltex(tex: THREE.CanvasTexture) {
  return new THREE.MeshLambertMaterial({ map: tex });
}

// Island top surface = y 0.4 (CylinderGeometry h=0.8, position.y=0)
const GROUND = 0.42; // sit slightly above island top

// ── District ground pads ───────────────────────────────────────────────────────

function addDistrictGround(scene: THREE.Scene, x: number, z: number, rx: number, rz: number, color: number) {
  // Elliptical ground zone using a scaled cylinder
  const mat = new THREE.MeshLambertMaterial({ color });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.12, 20), mat);
  disc.scale.set(rx, 1, rz);
  disc.position.set(x, GROUND, z);
  scene.add(disc);
}

// ── Footpaths ─────────────────────────────────────────────────────────────────

function createPaths(scene: THREE.Scene) {
  const PH = 0.14; // path slab height
  const Y  = GROUND + PH / 2;
  const pathMat  = new THREE.MeshLambertMaterial({ map: stonePathTex() });
  const plazaMat = new THREE.MeshLambertMaterial({ color: 0xe0d4b8 });
  const edgeMat  = new THREE.MeshLambertMaterial({ color: 0xaa9870 });

  // Helper: straight path from (x1,z1) to (x2,z2)
  function path(x1: number, z1: number, x2: number, z2: number, w: number) {
    const dx = x2 - x1, dz = z2 - z1;
    const dist = Math.sqrt(dx*dx + dz*dz);
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2;
    const angle = Math.atan2(dx, dz);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(w, PH, dist), pathMat);
    slab.position.set(mx, Y, mz); slab.rotation.y = angle; scene.add(slab);
    // Curb edges
    [-w/2 - 0.12, w/2 + 0.12].forEach(s => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, PH + 0.06, dist), edgeMat);
      curb.position.set(mx + Math.cos(angle)*s, Y, mz - Math.sin(angle)*s);
      curb.rotation.y = angle; scene.add(curb);
    });
  }

  function plaza(x: number, z: number, r: number) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.3, PH, 16), plazaMat);
    p.position.set(x, Y, z); scene.add(p);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.15, 0.18, 4, 20), edgeMat);
    ring.rotation.x = Math.PI / 2; ring.position.set(x, Y + PH/2, z); scene.add(ring);
  }

  // Central plaza
  plaza(0, 0, 7);

  // ── OFFICE PARK paths (NE quadrant, x>0 z<0) ──
  // Spawn → Work HQ
  path(0, 0, 22, -22, 3);
  path(22, -22, 22, -10, 2.5); // side branch to NBA Arena
  plaza(22, -22, 5);
  plaza(22, -10, 4);

  // ── SKILLS PARK paths (NW quadrant, x<0 z<0) ──
  path(0, 0, -22, -22, 3);
  path(-22, -22, -22, -10, 2.5);
  path(-22, -22, -30, -22, 2.5);
  plaza(-22, -22, 5);
  plaza(-22, -10, 3.5);
  plaza(-30, -22, 3.5);

  // ── GITHUB / ABOUT paths (south) ──
  path(0, 0, 22, 22, 3);
  path(0, 0, -22, 22, 3);
  plaza(22, 22, 5);
  plaza(-22, 22, 5);

  // ── CONTACT path (north) ──
  path(0, 0, 0, -30, 3);
  plaza(0, -30, 4.5);

  // Hedge border around the island perimeter — InstancedMesh for performance
  const hedgeGeo = new THREE.BoxGeometry(2.2, 1.6, 2.2);
  const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x2a6e18 });
  const pillarGeo = new THREE.BoxGeometry(0.6, 2.2, 0.6);
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

// ── Logo-inspired decorative buildings (non-navigable city filler) ────────────

// Shared ground pad for decorative buildings — sits ON TOP of island (y=0.42)
function addPad(scene: THREE.Scene, x: number, z: number, r = 2.5) {
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.2, 0.18, 10),
    new THREE.MeshLambertMaterial({ color: 0xd8cdb8 }));
  pad.position.set(x, GROUND + 0.09, z); scene.add(pad);
}

// React — atom with 3 electron ring orbits
function addReactBuilding(scene: THREE.Scene, x: number, z: number) {
  addPad(scene, x, z, 2.8);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x61dafb }));
  core.position.set(x, 1.8, z); scene.add(core);
  const nucleus = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.22, 8),
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

// TypeScript — blue cube with T and S letter blocks
function addTypeScriptBuilding(scene: THREE.Scene, x: number, z: number) {
  addPad(scene, x, z, 2.8);
  const blue = lmat(0x3178c6); const white = lmat(0xffffff);
  const box = new THREE.Mesh(new THREE.BoxGeometry(4, 3.5, 4), blue);
  box.position.set(x, 2.0, z); box.castShadow = true; scene.add(box);
  // T bar + stem on front
  const tBar = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.4, 0.18), white);
  tBar.position.set(x, 2.9, z + 2.02); scene.add(tBar);
  const tStem = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 0.18), white);
  tStem.position.set(x, 2.1, z + 2.02); scene.add(tStem);
  // S on back
  [2.8, 2.1, 1.4].forEach((sy, i) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(i===1?0.8:1.4, 0.32, 0.18), white);
    s.position.set(x + (i===1 ? -0.3:0.1), sy, z - 2.02); scene.add(s);
  });
  addBillboard(scene, x, z + 3, { line1: 'TypeScript', line2: '', bg: '#3178c6', fg: '#ffffff' }, 3, 1);
}

// C++ — hexagonal navy tower
function addCppBuilding(scene: THREE.Scene, x: number, z: number) {
  addPad(scene, x, z, 3);
  const navy = lmat(0x004488); const light = lmat(0x5599cc);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.7, 0.5, 6), navy);
  base.position.set(x, 0.47, z); scene.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.3, 3, 6), navy);
  body.position.set(x, 2.22, z); body.castShadow = true; scene.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0, 2.0, 0.9, 6), light);
  cap.position.set(x, 4.17, z); scene.add(cap);
  [-0.75, 0.75].forEach(ox => {
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.16), lmat(0xffffff));
    crossH.position.set(x + ox, 2.2, z + 1.95); scene.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 0.16), lmat(0xffffff));
    crossV.position.set(x + ox, 2.2, z + 1.95); scene.add(crossV);
  });
  addBillboard(scene, x, z + 3, { line1: 'C++', line2: '', bg: '#003366', fg: '#5599cc' }, 2.5, 1);
}

// NBA 2K — basketball arena dome
function addNBABuilding(scene: THREE.Scene, x: number, z: number) {
  addPad(scene, x, z, 4);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.4, 14), lmat(0x333333));
  ring.position.set(x, 0.42, z); scene.add(ring);
  const arena = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.3, 1.8, 14), lmat(0x1a1a2e));
  arena.position.set(x, 1.52, z); arena.castShadow = true; scene.add(arena);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.85, 10, 5, 0, Math.PI*2, 0, Math.PI/2),
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

// Python — alternating blue/yellow coil tower
function addPythonBuilding(scene: THREE.Scene, x: number, z: number) {
  addPad(scene, x, z, 2.5);
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 1.4, 9), lmat(0x3776ab));
  b1.position.set(x, 0.92, z); scene.add(b1);
  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 1.4, 9), lmat(0xffd43b));
  b2.position.set(x + 0.35, 2.32, z); scene.add(b2);
  const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.2, 1.4, 9), lmat(0x3776ab));
  b3.position.set(x, 3.72, z); scene.add(b3);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 7, 7), lmat(0x3776ab));
  head.position.set(x - 0.45, 4.85, z); scene.add(head);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xffd43b }));
  eye.position.set(x - 0.8, 4.96, z + 0.4); scene.add(eye);
  addBillboard(scene, x, z + 2.5, { line1: 'Python', line2: '', bg: '#3776ab', fg: '#ffd43b' }, 2.8, 1);
}

// Git — orange commit graph sculpture
function addGitBuilding(scene: THREE.Scene, x: number, z: number) {
  addPad(scene, x, z, 2.5);
  const orange = lmat(0xf05032); const gray = lmat(0x888888);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.8, 6), gray);
  trunk.position.set(x, 1.62, z); scene.add(trunk);
  const main = new THREE.Mesh(new THREE.SphereGeometry(0.65, 7, 7), orange);
  main.position.set(x, 3.1, z); scene.add(main);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.3, 5), gray);
  arm.rotation.z = -Math.PI/5; arm.position.set(x + 1.0, 2.1, z); scene.add(arm);
  const branch = new THREE.Mesh(new THREE.SphereGeometry(0.45, 7, 7), orange);
  branch.position.set(x + 1.9, 3.2, z); scene.add(branch);
  const merge = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.7, 5), gray);
  merge.rotation.z = Math.PI/5; merge.position.set(x + 0.95, 3.7, z); scene.add(merge);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.55, 7, 7), orange);
  top.position.set(x, 4.8, z); scene.add(top);
  addBillboard(scene, x, z + 2, { line1: 'Git', line2: '', bg: '#2b2b2b', fg: '#f05032' }, 2.2, 1);
}

// ── Building helpers ───────────────────────────────────────────────────────────

interface SignData { line1: string; line2: string; bg: string; fg: string; accent: number; }

// 1. 2K GAMES — Blue glass skyscraper with "2K" crown blocks
function addSkyscraper2K(scene: THREE.Scene, x: number, z: number, sign: SignData): Collider[] {
  const glass = ltex(glassTex('#1a4a7a'));
  const darkMat = lmat(0x0d1f33);
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  // Base podium — wide marble-ish
  const podium = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 7), ltex(brickTex('#c8d0d8', '#a0a8b0')));
  podium.position.set(x, 0.6, z); podium.castShadow = true; scene.add(podium);

  // Entry arch columns
  [-3.5, 3.5].forEach(ox => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.5, 6), lmat(0xddddee));
    col.position.set(x + ox, 1.85, z + 3.6); scene.add(col);
  });

  // Main glass tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 5.5), glass);
  tower.position.set(x, 3.45, z); tower.castShadow = true; scene.add(tower);

  // Stepped crown — "2K" silhouette (2 blocks like building crown)
  const crown1 = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 4), darkMat);
  crown1.position.set(x, 5.7, z); scene.add(crown1);
  const crown2 = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 3), darkMat);
  crown2.position.set(x, 6.8, z); scene.add(crown2);

  // Accent fins on sides
  [-3.6, 3.6].forEach(ox => {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 5.6), accentMat);
    fin.position.set(x + ox, 3.45, z); scene.add(fin);
  });

  // Corner beacons
  [[-3.2,-2.4],[3.2,-2.4],[-3.2,2.4],[3.2,2.4]].forEach(([bx,bz]) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.5, 4), accentMat);
    b.position.set(x+bx, 3.75, z+bz); scene.add(b);
  });

  addBillboard(scene, x, z + 4.5, sign, 5.5, 1.5);
  addLamp(scene, x - 5, z + 4.5); addLamp(scene, x + 5, z + 4.5);
  return [{ cx: x, cz: z, hw: 4.7, hd: 3.3 }];
}

// 2. PROJECTS — Aztec temple / Minecraft pyramid (stepped stone)
function addArtDecoBuilding(scene: THREE.Scene, x: number, z: number, sign: SignData): Collider[] {
  const sandBrick = ltex(brickTex('#d4a855', '#b88830'));
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  // 3 stepped tiers (each smaller and higher)
  const tiers = [{ w:10,d:8,h:1.6 },{ w:7.5,d:6,h:1.6 },{ w:5,d:4,h:1.6 }];
  let y = 0;
  tiers.forEach((t, i) => {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), sandBrick);
    tier.position.set(x, y + t.h/2, z); tier.castShadow = true; scene.add(tier);
    // Accent stripe on top edge
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(t.w+0.1, 0.15, t.d+0.1), accentMat);
    stripe.position.set(x, y + t.h, z); scene.add(stripe);
    // Corner torches
    if (i === 0) {
      [[-4.7,-3.7],[4.7,-3.7],[-4.7,3.7],[4.7,3.7]].forEach(([cx,cz]) => {
        const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1, 5), lmat(0x8b4513));
        torch.position.set(x+cx, y + t.h + 0.5, z+cz); scene.add(torch);
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.18, 4, 4),
          new THREE.MeshBasicMaterial({ color: sign.accent }));
        flame.position.set(x+cx, y + t.h + 1.1, z+cz); scene.add(flame);
      });
    }
    y += t.h;
  });

  // Capstone pyramid top
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0, 2, 1.5, 4), sandBrick);
  cap.position.set(x, y + 0.75, z); cap.rotation.y = Math.PI/4; scene.add(cap);

  addBillboard(scene, x, z + 4.6, sign, 6, 1.5);
  addLamp(scene, x - 6, z + 5); addLamp(scene, x + 6, z + 5);
  return [{ cx: x, cz: z, hw: 5.2, hd: 4.2 }];
}

// 3. GITHUB — Dark Octocat tower: cylinder with tentacle arches
function addGitHubTower(scene: THREE.Scene, x: number, z: number, sign: SignData): Collider[] {
  const darkMat = ltex(brickTex('#181c22', '#0d1117'));
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  // Wide dark slab base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.7, 16), lmat(0x0d1117));
  base.position.set(x, 0.35, z); scene.add(base);

  // Main cylinder body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.2, 4, 16), darkMat);
  body.position.set(x, 2.7, z); body.castShadow = true; scene.add(body);

  // Dome cap
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.85, 12, 6, 0, Math.PI*2, 0, Math.PI/2), lmat(0x1a1f28));
  dome.position.set(x, 4.7, z); scene.add(dome);

  // Octocat "tentacle" arches around base (8 curved arches)
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

  // Glowing rings
  [1.2, 2.8, 4.4].forEach(y => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.09, 5, 20),
      new THREE.MeshBasicMaterial({ color: sign.accent }));
    ring.rotation.x = Math.PI/2; ring.position.set(x, y, z); scene.add(ring);
  });

  addBillboard(scene, x, z + 5.2, sign, 4.5, 1.5);
  addLamp(scene, x + 6, z + 5.5); addLamp(scene, x - 6, z + 5.5);
  return [{ cx: x, cz: z, hw: 3.8, hd: 3.8 }];
}

// 4. ABOUT — Cozy cottage: pitched roof, warm brick, chimney
function addAboutBuilding(scene: THREE.Scene, x: number, z: number, sign: SignData): Collider[] {
  const warmBrick = ltex(brickTex('#c87840', '#a05828'));
  const roofMat  = lmat(0x3a5a3a);
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  // Wide main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 6.5), warmBrick);
  body.position.set(x, 1.5, z); body.castShadow = true; scene.add(body);

  // Pitched roof (prism shape via CylinderGeometry with 2 sides)
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 5.5, 2.5, 2, 1), roofMat);
  roof.position.set(x, 4, z); roof.rotation.y = Math.PI/2; roof.castShadow = true; scene.add(roof);

  // Chimney
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3, 0.8), lmat(0x885522));
  chimney.position.set(x + 3.2, 3.5, z - 1); scene.add(chimney);
  const chimTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), lmat(0x666666));
  chimTop.position.set(x + 3.2, 5.15, z - 1); scene.add(chimTop);
  const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.3, 5, 5), lmat(0xcccccc));
  smoke.position.set(x + 3.2, 5.6, z - 1); scene.add(smoke);

  // Door arch
  const door = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.15), lmat(0x5a3010));
  door.position.set(x, 1, z + 3.28); scene.add(door);
  const doorTop = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 8, 1, false, 0, Math.PI), lmat(0x5a3010));
  doorTop.rotation.z = Math.PI/2; doorTop.position.set(x, 2.05, z + 3.28); scene.add(doorTop);

  // Window shutters
  [-3, 3].forEach(ox => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.12), lmat(0x88ccff));
    win.position.set(x + ox, 1.6, z + 3.29); scene.add(win);
    const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.08), accentMat);
    shutter.position.set(x + ox + 0.7, 1.6, z + 3.3); scene.add(shutter);
  });

  addBillboard(scene, x, z + 4, sign, 5.5, 1.5);
  addLamp(scene, x - 6, z + 4.5); addLamp(scene, x + 6, z + 4.5);
  return [{ cx: x, cz: z, hw: 5.2, hd: 3.5 }];
}

// 5. CONTACT — Radio broadcast tower: mast + dish + blinking beacon
function addContactTower(scene: THREE.Scene, x: number, z: number, sign: SignData): Collider[] {
  const concMat = ltex(brickTex('#5a4870', '#3a2850'));
  const accentMat = new THREE.MeshBasicMaterial({ color: sign.accent });

  // Broad concrete base platform
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, 0.7, 8), lmat(0x3a2850));
  platform.position.set(x, 0.35, z); scene.add(platform);

  // Broadcast station building (bunker style)
  const bunker = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 5), concMat);
  bunker.position.set(x, 1.45, z); bunker.castShadow = true; scene.add(bunker);

  // Tapered mast shaft
  const mast1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 3, 6), lmat(0x5a4870));
  mast1.position.set(x, 4.05, z); scene.add(mast1);
  const mast2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 2, 6), lmat(0x44325a));
  mast2.position.set(x, 6.6, z); scene.add(mast2);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.18, 2.5, 5), accentMat);
  spire.position.set(x, 8.85, z); scene.add(spire);

  // Satellite dish
  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 5, 0, Math.PI*2, 0, Math.PI/2), lmat(0xccccdd));
  dish.rotation.x = -Math.PI/3; dish.rotation.y = 0.5; dish.position.set(x + 1.5, 3.8, z - 1); scene.add(dish);
  const dishArm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 4), lmat(0x888888));
  dishArm.rotation.z = Math.PI/4; dishArm.position.set(x + 0.9, 3.5, z - 0.8); scene.add(dishArm);

  // Cross-braces on mast
  [2.6, 4.5].forEach(my => {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.1), accentMat);
    brace.position.set(x, my, z); scene.add(brace);
  });

  // Blinking beacon
  const beacon = new THREE.PointLight(sign.accent, 4, 10);
  beacon.position.set(x, 10.2, z); beacon.userData.beacon = true; scene.add(beacon);

  addBillboard(scene, x, z + 3.2, sign, 4.5, 1.5);
  addLamp(scene, x + 3.5, z + 3.5); addLamp(scene, x - 3.5, z + 3.5);
  return [{ cx: x, cz: z, hw: 2.8, hd: 2.8 }];
}

// ── Audio engine (Web Audio API — no files needed) ─────────────────────────────

function createAudioEngine() {
  let ctx: AudioContext | null = null;
  const getCtx = () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const tone = (freq: number, dur: number, vol: number, type: OscillatorType = 'sine', t0 = 0) => {
    const c = getCtx();
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.connect(g); g.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    const at = c.currentTime + t0;
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.start(at); osc.stop(at + dur);
  };

  return {
    // Short gravel crunch — brown noise burst
    footstep() {
      const c = getCtx();
      const len = Math.floor(c.sampleRate * 0.055);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 280; f.Q.value = 0.8;
      const g = c.createGain(); g.gain.value = 0.1;
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start();
    },

    // Rising chime — entering a new zone
    zoneEnter() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 0.12, 'sine', i * 0.07));
    },

    // Success flourish — navigating to a page
    navigate() {
      [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 0.55, 0.18, 'sine', i * 0.055));
    },

    // Soft blip — entering no-man's zone (zone exit)
    zoneExit() {
      tone(400, 0.15, 0.08, 'sine');
      tone(300, 0.15, 0.06, 'sine', 0.08);
    },
  };
}

// ── Sitting NPC builder ────────────────────────────────────────────────────────

interface SittingNPC { group: THREE.Group; head: THREE.Mesh; rArm: THREE.Mesh; lArm: THREE.Mesh; }

function makeSittingNPC(
  scene: THREE.Scene,
  x: number, z: number,
  facingY: number,
  skin: number, body: number, legs: number, hair: number,
): SittingNPC {
  const g = new THREE.Group();
  const mk = (w: number, h: number, d: number, col: number) =>
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: col }));

  // Hair / head
  const head = mk(0.5, 0.5, 0.5, skin); head.position.set(0, 1.65, 0);
  const hairMesh = mk(0.52, 0.18, 0.52, hair); hairMesh.position.y = 0.18; head.add(hairMesh);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  [[-0.1, 0.06], [0.1, 0.06]].forEach(([ex, ey]) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.03), eyeMat);
    eye.position.set(ex, ey, 0.27); head.add(eye);
  });
  const mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), eyeMat);
  mouthMesh.position.set(0, -0.1, 0.27); head.add(mouthMesh);

  // Torso
  const torso = mk(0.55, 0.65, 0.28, body); torso.position.set(0, 1.1, 0);
  // Arms
  const lArm = mk(0.22, 0.55, 0.22, body); lArm.position.set(-0.39, 1.0, 0);
  const rArm = mk(0.22, 0.55, 0.22, body); rArm.position.set( 0.39, 1.0, 0);
  // Sitting legs: thigh horizontal (forward), shin hanging down
  const lThigh = mk(0.24, 0.22, 0.42, legs); lThigh.position.set(-0.14, 0.84, 0.22);
  const rThigh = mk(0.24, 0.22, 0.42, legs); rThigh.position.set( 0.14, 0.84, 0.22);
  const lShin  = mk(0.22, 0.38, 0.22, legs); lShin.position.set(-0.14, 0.58, 0.44);
  const rShin  = mk(0.22, 0.38, 0.22, legs); rShin.position.set( 0.14, 0.58, 0.44);

  g.add(head, torso, lArm, rArm, lThigh, rThigh, lShin, rShin);
  g.position.set(x, GROUND, z); g.rotation.y = facingY;
  scene.add(g);
  return { group: g, head, rArm, lArm };
}

function makeBench(scene: THREE.Scene, x: number, z: number, rotY = 0) {
  const wood = lmat(0x8b5e2a); const iron = lmat(0x555555);
  const g = new THREE.Group();
  // Seat slats
  [-0.1, 0, 0.1].forEach(ox => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.14), wood);
    slat.position.set(0, 0.48, ox); g.add(slat);
  });
  // Back rest slats
  [-0.08, 0.04].forEach(ox => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.12), wood);
    s.position.set(0, 0.85, -0.28 + ox); g.add(s);
  });
  // Iron side frames
  [-0.48, 0.48].forEach(sx => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.55), iron);
    frame.position.set(sx, 0.5, -0.05); g.add(frame);
    const feet = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.6), iron);
    feet.position.set(sx, 0.05, -0.05); g.add(feet);
  });
  g.position.set(x, GROUND, z); g.rotation.y = rotY;
  scene.add(g);
}

function makePicnicBlanket(scene: THREE.Scene, x: number, z: number) {
  // Checkered blanket via canvas texture
  const bc = document.createElement('canvas'); bc.width = bc.height = 128;
  const bctx = bc.getContext('2d')!;
  const cols = ['#cc3344', '#eeddcc'];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    bctx.fillStyle = cols[(r + c) % 2]; bctx.fillRect(c*16, r*16, 16, 16);
  }
  const blanket = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.8),
    new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(bc) }),
  );
  blanket.rotation.x = -Math.PI/2; blanket.position.set(x, GROUND + 0.02, z); scene.add(blanket);

  // Food items
  const apple = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), lmat(0xdd3333));
  apple.position.set(x, GROUND + 0.15, z); scene.add(apple);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 4), lmat(0x5a3010));
  stem.position.set(x, GROUND + 0.34, z); scene.add(stem);

  const sandwich = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.28), lmat(0xddbb77));
  sandwich.position.set(x + 0.5, GROUND + 0.1, z - 0.2); scene.add(sandwich);
  const filling = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.28), lmat(0x88cc44));
  filling.position.set(x + 0.5, GROUND + 0.1, z - 0.2); scene.add(filling);

  const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.25, 7), lmat(0xff6644));
  cup1.position.set(x - 0.5, GROUND + 0.14, z + 0.3); scene.add(cup1);
  const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.25, 7), lmat(0x44aaff));
  cup2.position.set(x + 0.4, GROUND + 0.14, z + 0.4); scene.add(cup2);
}

function makeLaptop(scene: THREE.Scene, x: number, z: number, rotY: number): THREE.Mesh {
  const g = new THREE.Group();
  // Base
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), lmat(0x888888));
  base.position.set(0, 0, 0); g.add(base);
  // Screen (tilted back ~110°)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.44, 0.03), lmat(0x222222));
  screen.position.set(0, 0.245, -0.24); screen.rotation.x = -0.45; g.add(screen);
  // Glowing VSCode display
  const display = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.38),
    new THREE.MeshBasicMaterial({ color: 0x1e1e2e }));
  display.position.set(0, 0.245, -0.225); display.rotation.x = -0.45; g.add(display);
  // Code lines on screen
  [0x007acc, 0x569cd6, 0x4ec9b0, 0xce9178].forEach((col, i) => {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.3 - i * 0.04, 0.025),
      new THREE.MeshBasicMaterial({ color: col }));
    line.position.set(-0.1 + i * 0.02, 0.28 - i * 0.065, -0.21);
    line.rotation.x = -0.45; g.add(line);
  });
  g.position.set(x, GROUND + 0.88, z); g.rotation.y = rotY;
  scene.add(g);
  return screen;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function GamerGame() {
  const { setMiniGameOpen } = useMenu();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef  = useRef({ left: false, right: false, up: false, down: false, action: false });
  const [nearZone, setNearZone] = useState<string | null>(null);
  const nearZoneRef = useRef<Zone | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = createRenderer(canvas);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const camera = createCamera();
    camera.position.set(0, 8, 15);

    const hour  = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDay ? 0x5599cc : 0x050a1a);
    scene.fog = new THREE.Fog(isDay ? 0x88bbdd : 0x050a1a, 70, 140);

    // Minimal lighting: 1 ambient + 1 directional
    scene.add(new THREE.AmbientLight(isDay ? 0xeef4ff : 0x111830, isDay ? 1.8 : 0.6));
    const sun = new THREE.DirectionalLight(isDay ? 0xfff8ee : 0x334466, isDay ? 2.0 : 0.3);
    sun.position.set(40, 70, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -65;
    sun.shadow.camera.right = sun.shadow.camera.top   =  65;
    sun.shadow.camera.far = 140;
    scene.add(sun);

    // Sun / Moon
    if (isDay) {
      const disc = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff280 }));
      disc.position.set(80, 65, -100); scene.add(disc);
      // 2 clouds
      const cm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [[-35,42,-65],[25,40,-80]].forEach(([cx,cy,cz]) => {
        [[0,0],[2.2,0.4],[-2.2,0.3]].forEach(([bx,by]) => {
          const p = new THREE.Mesh(new THREE.SphereGeometry(2, 5, 5), cm);
          p.position.set(cx+bx, cy+by, cz); scene.add(p);
        });
      });
    } else {
      const moon = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xf0f0cc }));
      moon.position.set(-75, 65, -100); scene.add(moon);
      const sp: number[] = [];
      for (let i = 0; i < 400; i++) {
        const r = 150, t = Math.random()*Math.PI*2, p = Math.random()*Math.PI*0.5;
        sp.push(r*Math.sin(p)*Math.cos(t), r*Math.cos(p), r*Math.sin(p)*Math.sin(t));
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sp), 3));
      scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));
    }

    // Ocean
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(260, 260),
      new THREE.MeshLambertMaterial({ color: isDay ? 0x1a6fa8 : 0x091a30 }));
    ocean.rotation.x = -Math.PI/2; ocean.position.y = -0.7; scene.add(ocean);

    // Beach + Island
    const beach = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 0.5, 24),
      new THREE.MeshLambertMaterial({ color: 0xe8cc88 }));
    beach.position.y = -0.3; scene.add(beach);

    const island = new THREE.Mesh(new THREE.CylinderGeometry(50, 52, 0.8, 24),
      new THREE.MeshLambertMaterial({ color: 0x3d8c2a }));
    island.position.y = 0; island.receiveShadow = true; scene.add(island);

    // Inner park (grass circle)
    const park = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.82, 20),
      new THREE.MeshLambertMaterial({ color: 0x2e7a1e }));
    park.position.set(0, 0.01, 0); scene.add(park);

    // Beach rock ring
    const rb = new THREE.Mesh(new THREE.TorusGeometry(46, 2.5, 4, 24),
      new THREE.MeshLambertMaterial({ color: 0xa89070 }));
    rb.rotation.x = -Math.PI/2; rb.position.y = 0.4; scene.add(rb);

    // Park trees
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1, 5);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4226 });
    const crownGeo = new THREE.SphereGeometry(1.2, 5, 5);
    const crownMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
    [[5,3],[-4,5],[2,-6],[-6,-2],[7,-1],[-2,8]].forEach(([tx,tz]) => {
      const t2 = new THREE.Mesh(trunkGeo, trunkMat); t2.position.set(tx, 0.9, tz); scene.add(t2);
      const c2 = new THREE.Mesh(crownGeo, crownMat); c2.position.set(tx, 2.4, tz); scene.add(c2);
    });

    // Flowers — InstancedMesh
    const fGeo = new THREE.PlaneGeometry(0.5, 0.5); fGeo.rotateX(-Math.PI/2);
    const dummy = new THREE.Object3D();
    [0xff6688, 0xffdd00, 0xff9922, 0xcc88ff].forEach(col => {
      const im = new THREE.InstancedMesh(fGeo, new THREE.MeshBasicMaterial({ color: col }), 10);
      for (let i = 0; i < 10; i++) {
        const a = Math.random()*Math.PI*2, r = 11+Math.random()*30;
        dummy.position.set(Math.cos(a)*r, 0.43, Math.sin(a)*r); dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
      }
      im.instanceMatrix.needsUpdate = true; scene.add(im);
    });

    // Beach rocks — InstancedMesh
    const rGeo = new THREE.IcosahedronGeometry(0.4, 0);
    const rIM  = new THREE.InstancedMesh(rGeo, new THREE.MeshLambertMaterial({ color: 0x998877 }), 14);
    for (let i = 0; i < 14; i++) {
      const a = (i/14)*Math.PI*2, r = 52+(i%3)*1.5;
      dummy.position.set(Math.cos(a)*r, -0.1, Math.sin(a)*r);
      dummy.rotation.y = i*0.5; dummy.updateMatrix(); rIM.setMatrixAt(i, dummy.matrix);
    }
    rIM.instanceMatrix.needsUpdate = true; scene.add(rIM);

    // Campus footpaths
    createPaths(scene);

    // VSCode spawn building
    const vsBld = createVSCodeBuilding(scene);
    vsBld.position.set(0, 0, 0);
    addBillboard(scene, 0, 1.6, { line1: spawnBuildingLabel, line2: '', bg: '#001133', fg: '#007acc' }, 3, 1.1);
    addLamp(scene, -2.5, 2.5); addLamp(scene, 2.5, 2.5);

    const spawnRing = createZoneMarker(0x007acc);
    spawnRing.scale.set(2.5, 2.5, 2.5); spawnRing.position.set(0, 0.05, 0); scene.add(spawnRing);

    // Zone buildings
    const colliders: Collider[] = [{ cx: 0, cz: 0, hw: 2.2, hd: 1.5 }];

    type BuildFn = (scene: THREE.Scene, x: number, z: number, sign: SignData) => Collider[];
    const buildFnMap: Record<string, BuildFn> = {
      skyscraper: addSkyscraper2K,
      artdeco:    addArtDecoBuilding,
      cylinder:   addGitHubTower,
      wide:       addAboutBuilding,
      triangle:   addContactTower,
    };

    const builtZones: Zone[] = cityZones.map(cz => {
      const buildFn = buildFnMap[cz.buildingType] ?? addSkyscraper2K;
      const sign: SignData = { line1: cz.label, line2: cz.subLabel, bg: cz.signBg, fg: cz.signFg, accent: cz.accentColor };
      const cols = buildFn(scene, cz.x, cz.z, sign);
      colliders.push(...cols);

      const marker = createZoneMarker(cz.accentColor);
      marker.scale.set(1.4, 1.4, 1.4);
      marker.position.set(cz.x, 0.05, cz.z + 5);
      scene.add(marker);

      return {
        label:    cz.subLabel ? `${cz.label} — ${cz.subLabel}` : cz.label,
        path:     cz.path,
        position: new THREE.Vector3(cz.x, 0, cz.z + 3),
        radius:   cz.radius + 2,
        marker,
      };
    });

    // Central fountain (at z=8, just south of spawn building)
    const G = GROUND;
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.4, 0.5, 14), lmat(0xd8d0c0));
    fBase.position.set(0, G + 0.25, 8); scene.add(fBase);
    const fPool = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.28, 14), lmat(0x5599cc));
    fPool.position.set(0, G + 0.44, 8); scene.add(fPool);
    const fPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.4, 7), lmat(0xddddee));
    fPillar.position.set(0, G + 1.1, 8); scene.add(fPillar);
    const fTop = new THREE.Mesh(new THREE.SphereGeometry(0.32, 7, 7),
      new THREE.MeshBasicMaterial({ color: 0x007acc }));
    fTop.position.set(0, G + 1.92, 8); scene.add(fTop);

    // ── OFFICE PARK district (NE: x>0, z<0) ─────────────────────────────────
    // Warm tan ground overlay for office park
    addDistrictGround(scene, 22, -15, 18, 18, 0x4a8c3a); // slightly different green

    // NBA 2K Arena — on the office path, related to 2K work
    addNBABuilding(scene, 22, -10);

    // District sign — OFFICE PARK
    addBillboard(scene, 10, -8, { line1: 'OFFICE PARK', line2: 'Work Experience', bg: '#1a2a3a', fg: '#00aaff' }, 4, 1.1);

    // ── SKILLS PARK district (NW: x<0, z<0) ──────────────────────────────────
    addDistrictGround(scene, -24, -18, 18, 18, 0x3d9e2a); // slightly brighter green

    // Skills buildings arranged in the NW quadrant
    addReactBuilding(scene,      -22, -10);
    addTypeScriptBuilding(scene, -30, -22);
    addCppBuilding(scene,         -14, -20);
    addPythonBuilding(scene,     -22,   0);
    addGitBuilding(scene,        -30,  -8);

    // District sign — SKILLS PARK
    addBillboard(scene, -10, -8, { line1: 'SKILLS PARK', line2: 'Tech Stack', bg: '#1a3a1a', fg: '#44ff88' }, 4, 1.1);

    // Character
    const char = createCharacter({ skin: 0xf0d0b0, body: 0xa0a8c0, legs: 0x5a3080, hair: 0x1a1a1a });
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xddddff }));
    sword.position.set(0, -0.4, 0.08); char.rArm.add(sword);

    // Face — Minecraft-style: two square eyes, small smile line
    const faceMat  = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // Eyes: dark square with white pixel highlight (classic Minecraft look)
    [[-0.1, 0.06], [0.1, 0.06]].forEach(([ex, ey]) => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.03), faceMat);
      eye.position.set(ex, ey, 0.27); char.head.add(eye);
      const hi = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), whiteMat);
      hi.position.set(0.025, 0.025, 0.02); eye.add(hi);
    });
    // Mouth: single small dark bar — simple, not creepy
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), faceMat);
    mouth.position.set(0, -0.1, 0.27); char.head.add(mouth);
    const savedPos = (() => { try { return JSON.parse(localStorage.getItem('gamerPos') || 'null'); } catch { return null; } })();
    char.group.position.set(savedPos?.x ?? 0, GROUND, savedPos?.z ?? 3.5);
    scene.add(char.group);

    // Input
    const { state: keys, attach } = createInputTracker();
    const detach = attach();
    const ext = inputRef.current;

    // Cache beacon
    let beaconLight: THREE.PointLight | null = null;
    scene.traverse(obj => { if (obj instanceof THREE.PointLight && obj.userData.beacon) beaconLight = obj as THREE.PointLight; });

    // ── Environment interactions ───────────────────────────────────────────────

    // 1. Fountain water spray (InstancedMesh)
    const FWATER = 16;
    const fwIM = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.07, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.75 }), FWATER);
    scene.add(fwIM);

    // 2. Butterflies — each is a Group with two angled wing planes (visible from all directions)
    const bfColors = [0xff88cc, 0xffcc33, 0x44aaff, 0x88ff66, 0xff7744];
    const butterflies = bfColors.map((col, i) => {
      const g = new THREE.Group();
      const wingMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
      const wingGeo = new THREE.PlaneGeometry(0.32, 0.2);
      // Left wing tilted up-out, right wing mirror
      const wL = new THREE.Mesh(wingGeo, wingMat); wL.rotation.y =  0.5; wL.position.x = -0.16;
      const wR = new THREE.Mesh(wingGeo, wingMat); wR.rotation.y = -0.5; wR.position.x =  0.16;
      // Body dot
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x111111 }));
      g.add(wL, wR, body);
      scene.add(g);
      return { group: g, wL, wR, phase: (i / 5) * Math.PI * 2, r: 9 + i * 2.5, speed: 0.35 + i * 0.07 };
    });

    // 3. NPC scenes ────────────────────────────────────────────────────────────

    // Scene A: NPC on bench near fountain, looking around
    makeBench(scene, 4, 12, 0);
    const npcBench = makeSittingNPC(scene, 4, 11.2, Math.PI, 0xffcc88, 0x3355aa, 0x222244, 0x221100);

    // Scene B: Picnic couple on blanket (-7, 13 area)
    makePicnicBlanket(scene, -7, 13);
    const npcPicnic = makeSittingNPC(scene, -7.7, 13.5, -0.3,  0xddaa77, 0xcc4433, 0x332211, 0x110800);
    const npcGf     = makeSittingNPC(scene, -6.3, 12.5,  Math.PI + 0.4, 0xffddbb, 0x995577, 0x332244, 0x550022);
    // GF has longer hair slab
    const gfLongHair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.38, 0.52),
      new THREE.MeshLambertMaterial({ color: 0x441100 }));
    gfLongHair.position.set(0, 0.25, -0.05); npcGf.head.add(gfLongHair);

    // Scene C: NPC with laptop — open area south-east of central plaza
    // Small outdoor table under a tree
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.06, 8), lmat(0x8b5e2a));
    tableTop.position.set(10, GROUND + 0.85, 6); scene.add(tableTop);
    const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 6), lmat(0x666666));
    tableLeg.position.set(10, GROUND + 0.44, 6); scene.add(tableLeg);
    const npcLaptop = makeSittingNPC(scene, 10, 7, Math.PI, 0xffcc99, 0x334455, 0x223344, 0x110000);
    makeLaptop(scene, 10, 6.4, Math.PI);

    // 4. Floating gems above each zone entrance
    const gemGeo = new THREE.OctahedronGeometry(0.38, 0);
    const gems = cityZones.map(cz => {
      const gem = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: cz.accentColor }));
      gem.position.set(cz.x, GROUND + 4.5, cz.z + 5);
      scene.add(gem);
      return gem;
    });

    // 5. Fireflies at night / pollen sparkles at day
    const FFCOUNT = 22;
    const ffIM = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.09, 4, 4),
      new THREE.MeshBasicMaterial({ color: isDay ? 0xffee88 : 0xaaffaa }),
      FFCOUNT,
    );
    scene.add(ffIM);

    // 6. Footstep dust — tiny particles burst when moving
    const DUST = 8;
    const dustIM = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.06, 3, 3),
      new THREE.MeshBasicMaterial({ color: 0xd8cdb8, transparent: true, opacity: 0.6 }),
      DUST,
    );
    scene.add(dustIM);

    const fwDummy = new THREE.Object3D();

    const audio = createAudioEngine();
    let lastNearLabel: string | null = null;
    let footstepTimer = 0;
    let lastTime = performance.now();
    let elapsed  = 0;
    let raf: number;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt  = Math.min((now - lastTime) / 1000, 0.05);
      elapsed  += dt; lastTime = now;
      const t   = elapsed;

      const l = keys.left  || ext.left;
      const r = keys.right || ext.right;
      const u = keys.up    || ext.up;
      const d = keys.down  || ext.down;

      let dx = 0, dz = 0;
      if (l) dx -= 1; if (r) dx += 1;
      if (u) dz -= 1; if (d) dz += 1;

      const translating = dx !== 0 || dz !== 0;
      if (translating) {
        const len = Math.sqrt(dx*dx + dz*dz);
        char.group.position.x += (dx/len)*6*dt;
        char.group.position.z += (dz/len)*6*dt;
        resolveCollisions(char.group.position, colliders);
        // Circular island boundary — keep player inside radius 45
        const pr = Math.sqrt(char.group.position.x**2 + char.group.position.z**2);
        if (pr > 45) {
          char.group.position.x = (char.group.position.x / pr) * 45;
          char.group.position.z = (char.group.position.z / pr) * 45;
        }
        const ta = Math.atan2(dx, dz);
        let diff = ta - char.group.rotation.y;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        char.group.rotation.y += diff * 0.25;
      }

      animateCharacter(char, translating, t);
      // Keep character on island surface (island top = GROUND = 0.42)
      char.group.position.y += GROUND;

      // Footstep sound — every ~0.28 s while moving
      if (translating) {
        footstepTimer += dt;
        if (footstepTimer >= 0.28) { footstepTimer = 0; audio.footstep(); }
      } else {
        footstepTimer = 0;
      }

      builtZones.forEach((z, i) => {
        if (z.marker) {
          z.marker.rotation.z = t * 0.7;
          (z.marker.material as THREE.MeshPhongMaterial).opacity = 0.3 + 0.5 * Math.sin(t * 1.5 + i);
        }
      });
      spawnRing.rotation.z = -t * 0.5;

      if (beaconLight) beaconLight.intensity = Math.sin(t * 4) > 0 ? 4 : 0.3;

      // ── Fountain spray ────────────────────────────────────────────────────
      for (let i = 0; i < FWATER; i++) {
        const phase    = (i / FWATER) * Math.PI * 2;
        const progress = ((t * 0.9 + i / FWATER) % 1);
        const height   = Math.sin(progress * Math.PI) * 2.2;
        const spread   = Math.sin(progress * Math.PI) * 0.55;
        fwDummy.position.set(
          Math.cos(phase) * spread,
          GROUND + 1.85 + height,
          8 + Math.sin(phase) * spread,
        );
        fwDummy.updateMatrix(); fwIM.setMatrixAt(i, fwDummy.matrix);
      }
      fwIM.instanceMatrix.needsUpdate = true;

      // ── Butterflies ───────────────────────────────────────────────────────
      butterflies.forEach(b => {
        const angle = t * b.speed + b.phase;
        b.group.position.set(
          Math.cos(angle) * b.r,
          GROUND + 1.6 + Math.sin(t * 2.5 + b.phase) * 0.5,
          Math.sin(angle) * b.r,
        );
        b.group.rotation.y = angle + Math.PI / 2;
        // Wing flap — rotate left and right wings in/out like real flap
        const flap = Math.sin(t * 9 + b.phase) * 0.6;
        b.wL.rotation.z =  flap;
        b.wR.rotation.z = -flap;
      });

      // ── NPC scenes ────────────────────────────────────────────────────────

      // Scene A: bench NPC looks around (head sweeps L/R, occasional nod)
      npcBench.head.rotation.y = Math.sin(t * 0.6) * 0.9;
      npcBench.head.rotation.x = Math.sin(t * 0.25) * 0.15;

      // Scene B: picnic couple — slight nods, look at each other occasionally
      npcPicnic.head.rotation.y = Math.sin(t * 0.4 + 1.0) * 0.35;
      npcPicnic.head.rotation.x = Math.sin(t * 1.2) * 0.08;
      npcGf.head.rotation.y     = Math.sin(t * 0.45 + 2.5) * 0.3;
      npcGf.head.rotation.x     = Math.sin(t * 0.9) * 0.07;
      // Arms animate gently (eating/talking gesture)
      npcPicnic.rArm.rotation.x = -0.6 + Math.sin(t * 1.5) * 0.15;
      npcGf.lArm.rotation.x     = -0.5 + Math.sin(t * 1.2 + 1) * 0.12;

      // Scene C: laptop NPC — head tilted at screen, typing fingers
      npcLaptop.head.rotation.x = 0.35 + Math.sin(t * 0.3) * 0.05;
      npcLaptop.head.rotation.y = Math.sin(t * 0.2) * 0.1;
      npcLaptop.rArm.rotation.x = -0.8 + Math.sin(t * 6) * 0.08; // typing
      npcLaptop.lArm.rotation.x = -0.8 + Math.sin(t * 6 + 1) * 0.08;

      // ── Floating gems ─────────────────────────────────────────────────────
      gems.forEach((gem, i) => {
        gem.rotation.y = t * 1.2 + i;
        gem.rotation.x = t * 0.4;
        gem.position.y = GROUND + 4.5 + Math.sin(t * 1.8 + i) * 0.25;
      });

      // ── Fireflies / pollen ────────────────────────────────────────────────
      for (let i = 0; i < FFCOUNT; i++) {
        const a = (i / FFCOUNT) * Math.PI * 2 + Math.sin(t * 0.25 + i * 0.7) * 0.8;
        const r = 6 + (i % 6) * 5.5;
        fwDummy.position.set(
          Math.cos(a) * r,
          GROUND + 0.7 + Math.sin(t * 1.4 + i * 0.9) * (isDay ? 0.6 : 1.4),
          Math.sin(a) * r,
        );
        fwDummy.updateMatrix(); ffIM.setMatrixAt(i, fwDummy.matrix);
      }
      ffIM.instanceMatrix.needsUpdate = true;

      // ── Footstep dust (when moving) ───────────────────────────────────────
      for (let i = 0; i < DUST; i++) {
        const da = (i / DUST) * Math.PI * 2 + t * 3;
        const dr = translating ? (0.2 + (i % 3) * 0.15) * Math.sin(t * 8 + i) : 0;
        fwDummy.position.set(
          char.group.position.x + Math.cos(da) * dr,
          GROUND + 0.05,
          char.group.position.z + Math.sin(da) * dr,
        );
        fwDummy.updateMatrix(); dustIM.setMatrixAt(i, fwDummy.matrix);
      }
      dustIM.instanceMatrix.needsUpdate = true;

      const near = getNearestZone(char.group.position, builtZones);
      nearZoneRef.current = near;
      const nl = near ? near.label : null;
      if (nl !== lastNearLabel) {
        if (nl) audio.zoneEnter(); else audio.zoneExit();
        lastNearLabel = nl; setNearZone(nl);
      }

      if ((keys.action || ext.action) && near?.path) {
        try { localStorage.setItem('gamerPos', JSON.stringify({ x: char.group.position.x, z: char.group.position.z })); } catch {}
        audio.navigate(); ext.action = false; setMiniGameOpen(false); router.push(near.path);
      }

      // Camera: moderate height — sees buildings but still feels grounded
      const tcx = char.group.position.x;
      const tcz = char.group.position.z + 14;
      camera.position.x += (tcx - camera.position.x) * 0.1;
      camera.position.z += (tcz - camera.position.z) * 0.1;
      camera.position.y += (10  - camera.position.y) * 0.1;
      camera.lookAt(char.group.position.x, 1, char.group.position.z);

      renderer.render(scene, camera);
    };

    animate();
    const onResize = () => handleResize(renderer, camera);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      detach();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.gameRoot}>
      <canvas ref={canvasRef} className={styles.gameCanvas} />
      <div className={styles.hudTop}>
        <span className={styles.worldName}>⚔️ {worldName}</span>
        <button className={styles.returnBtn} onClick={() => setMiniGameOpen(false)}>&larr; VSCode</button>
      </div>
      {nearZone && (
        <div className={styles.zonePrompt}>
          <span className={styles.zoneLabel}>{nearZone}</span>
          <span className={styles.zoneHint}>Press <kbd>E</kbd> / <kbd>Enter</kbd> to enter</span>
          <button className={styles.enterBtn} onClick={() => {
            const z = nearZoneRef.current;
            if (z?.path) { setMiniGameOpen(false); router.push(z.path); }
          }}>Enter →</button>
        </div>
      )}
      <div className={styles.controlsHint}>WASD / Arrow keys · E or Enter to enter</div>
      <GameDpad inputRef={inputRef} />
      {nearZone && <ActionBtn inputRef={inputRef} label="Enter" />}
    </div>
  );
}
