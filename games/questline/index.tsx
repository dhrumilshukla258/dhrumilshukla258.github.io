import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import * as THREE from 'three';
import {
  createCharacter, animateCharacter,
  createVSCodeBuilding,
  createZoneMarker, getNearestZone, Zone,
  createInputTracker, createRenderer, createCamera, handleResize,
  resolveCollisions, Collider,
} from '@/games/questline/engine';
import { useMenu } from '@/components/context/MenuContext';
import { Joystick } from '@/games/shared/Joystick';
import { MiniSnake } from '@/games/snake';
import { cityZones, spawnBuildingLabel, worldName } from './data/zones';
import { gameCity, skillsCity, buildsCity } from './data/districts';
import { npcSpawnDefs, partnerNpcDef, benchDefs, picnicDefs, laptopDefs, cafeTableDef, theaterSkins, theaterBodies, THEATER_ROWS, THEATER_COLS } from './data/npcs';
import { movieSlides, SCREEN_X, SCREEN_Z, PIXEL_PARK_BILLBOARD } from './data/theater';
import { PLAYER_COLORS, PORTAL_X, PORTAL_Z, FOUNTAIN_X, FOUNTAIN_Z } from './data/world';
import styles from './QuestlineGame.module.css';

import { _geoCache, geoBox, geoCyl, geoSph, geoPlane } from './geometry';
import { _lmats, _signCache, _texCache, lmat, addBillboard, SignData } from './materials';
import { createAudioEngine } from './audio';
import {
  GROUND,
  createPaths, addLamp, addPortal, addDistrictGround, addPad,
  createStreetLights,
} from './environment';
import {
  FullNPC, NpcIdleType, NpcAnim,
  _SIT_LT, _SIT_RT, _SIT_LS, _SIT_RS,
  _STD_LT, _STD_RT, _STD_LS, _STD_RS,
  NPC_POKE_LINES, makeSpeechBubble, showBubble, makeNPC,
  makeBench, makePicnicBlanket, makeLaptop,
} from './npcs';
import {
  addReactBuilding, addTypeScriptBuilding, addCppBuilding,
  addNBABuilding, addPythonBuilding, addGitBuilding,
  addDigiPenBuilding, addNWRABuilding, addLegoBuilding,
  addMinesweeperBuilding, addRobotestBuilding,
  addSkyscraper2K, addArtDecoBuilding, addGitHubTower,
  addAboutBuilding, addContactTower,
} from './buildings';

export function QuestlineGame() {
  const { setMiniGameOpen } = useMenu();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef  = useRef({ left: false, right: false, up: false, down: false, action: false });
  const [nearZone, setNearZone] = useState<string | null>(null);
  const [portalOpen, setPortalOpen] = useState(false);
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
    scene.background = new THREE.Color(isDay ? 0x5599cc : 0x0a1a3a);
    scene.fog = new THREE.Fog(isDay ? 0x88bbdd : 0x0a1a3a, 70, 140);

    scene.add(new THREE.AmbientLight(isDay ? 0xeef4ff : 0x4466bb, isDay ? 1.8 : 1.2));
    const sun = new THREE.DirectionalLight(isDay ? 0xfff8ee : 0x6688cc, isDay ? 2.0 : 1.0);
    sun.position.set(40, 70, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -65;
    sun.shadow.camera.right = sun.shadow.camera.top   =  65;
    sun.shadow.camera.far = 140;
    scene.add(sun);

    if (isDay) {
      const disc = new THREE.Mesh(geoSph(5, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xfff280 }));
      disc.position.set(80, 65, -100); scene.add(disc);
      const cm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [[-35,42,-65],[25,40,-80]].forEach(([cx,cy,cz]) => {
        [[0,0],[2.2,0.4],[-2.2,0.3]].forEach(([bx,by]) => {
          const p = new THREE.Mesh(geoSph(2, 5, 5), cm);
          p.position.set(cx+bx, cy+by, cz); scene.add(p);
        });
      });
    } else {
      const moon = new THREE.Mesh(geoSph(5, 8, 8),
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

    const ocean = new THREE.Mesh(geoPlane(260, 260),
      new THREE.MeshLambertMaterial({ color: isDay ? 0x1a6fa8 : 0x091a30 }));
    ocean.rotation.x = -Math.PI/2; ocean.position.y = -0.7; scene.add(ocean);

    const beach = new THREE.Mesh(geoCyl(60, 60, 0.5, 24),
      new THREE.MeshLambertMaterial({ color: 0xe8cc88 }));
    beach.position.y = -0.3; scene.add(beach);

    const island = new THREE.Mesh(geoCyl(50, 52, 0.8, 24),
      new THREE.MeshLambertMaterial({ color: 0x3d8c2a }));
    island.position.y = 0; island.receiveShadow = true; scene.add(island);

    const park = new THREE.Mesh(geoCyl(9, 9, 0.82, 20),
      new THREE.MeshLambertMaterial({ color: 0x2e7a1e }));
    park.position.set(0, 0.01, 0); scene.add(park);

    const rb = new THREE.Mesh(new THREE.TorusGeometry(46, 2.5, 4, 24),
      new THREE.MeshLambertMaterial({ color: 0xa89070 }));
    rb.rotation.x = -Math.PI/2; rb.position.y = 0.4; scene.add(rb);

    const trunkGeo = geoCyl(0.15, 0.2, 1, 5);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4226 });
    const crownGeo = geoSph(1.2, 5, 5);
    const crownMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
    [[5,3],[-4,5],[2,-6],[-6,-2],[7,-1],[-2,8]].forEach(([tx,tz]) => {
      const t2 = new THREE.Mesh(trunkGeo, trunkMat); t2.position.set(tx, 0.9, tz); scene.add(t2);
      const c2 = new THREE.Mesh(crownGeo, crownMat); c2.position.set(tx, 2.4, tz); scene.add(c2);
    });

    const fGeo = geoPlane(0.5, 0.5); fGeo.rotateX(-Math.PI/2);
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

    const rGeo = new THREE.IcosahedronGeometry(0.4, 0);
    const rIM  = new THREE.InstancedMesh(rGeo, new THREE.MeshLambertMaterial({ color: 0x998877 }), 14);
    for (let i = 0; i < 14; i++) {
      const a = (i/14)*Math.PI*2, r = 52+(i%3)*1.5;
      dummy.position.set(Math.cos(a)*r, -0.1, Math.sin(a)*r);
      dummy.rotation.y = i*0.5; dummy.updateMatrix(); rIM.setMatrixAt(i, dummy.matrix);
    }
    rIM.instanceMatrix.needsUpdate = true; scene.add(rIM);

    createPaths(scene);

    const vsBld = createVSCodeBuilding(scene);
    vsBld.position.set(0, 0, 0);
    addBillboard(scene, 0, 1.6, { line1: spawnBuildingLabel, line2: '', bg: '#001133', fg: '#007acc' }, 3, 1.1);
    addLamp(scene, -2.5, 2.5); addLamp(scene, 2.5, 2.5);

    const spawnRing = createZoneMarker(0x007acc);
    spawnRing.scale.set(2.5, 2.5, 2.5); spawnRing.position.set(0, 0.05, 0); scene.add(spawnRing);

    const colliders: Collider[] = [{ cx: 0, cz: 0, hw: 2.2, hd: 1.5 }];

    type BuildFn = (scene: THREE.Scene, x: number, z: number, sign: SignData) => [Collider[], THREE.Group];
    const buildFnMap: Record<string, BuildFn> = {
      skyscraper: addSkyscraper2K,
      artdeco:    addArtDecoBuilding,
      cylinder:   addGitHubTower,
      wide:       addAboutBuilding,
      triangle:   addContactTower,
    };

    const zoneDoors = new Map<string, THREE.Group>();

    const builtZones: Zone[] = cityZones.map(cz => {
      const buildFn = buildFnMap[cz.buildingType] ?? addSkyscraper2K;
      const sign: SignData = { line1: cz.label, line2: cz.subLabel, bg: cz.signBg, fg: cz.signFg, accent: cz.accentColor };
      const [cols, doorGroup] = buildFn(scene, cz.x, cz.z, sign);
      colliders.push(...cols);
      if (cz.path) zoneDoors.set(cz.path, doorGroup);

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

    const G = GROUND;
    const fBase = new THREE.Mesh(geoCyl(2, 2.4, 0.5, 14), lmat(0xd8d0c0));
    fBase.position.set(FOUNTAIN_X, G + 0.25, FOUNTAIN_Z); scene.add(fBase);
    const fPool = new THREE.Mesh(geoCyl(1.7, 1.7, 0.28, 14), lmat(0x5599cc));
    fPool.position.set(FOUNTAIN_X, G + 0.44, FOUNTAIN_Z); scene.add(fPool);
    const fPillar = new THREE.Mesh(geoCyl(0.14, 0.18, 1.4, 7), lmat(0xddddee));
    fPillar.position.set(FOUNTAIN_X, G + 1.1, FOUNTAIN_Z); scene.add(fPillar);
    const fTop = new THREE.Mesh(geoSph(0.32, 7, 7),
      new THREE.MeshBasicMaterial({ color: 0x007acc }));
    fTop.position.set(FOUNTAIN_X, G + 1.92, FOUNTAIN_Z); scene.add(fTop);

    const bCol = (bx: number, bz: number, r = 4) =>
      colliders.push({ cx: bx, cz: bz, hw: r, hd: r });

    const districtBuildFnMap: Record<string, (scene: THREE.Object3D, x: number, z: number) => void> = {
      react:      addReactBuilding,
      typescript: addTypeScriptBuilding,
      cpp:        addCppBuilding,
      python:     addPythonBuilding,
      git:        addGitBuilding,
      digipen:    addDigiPenBuilding,
      nwra:       addNWRABuilding,
      nba:        addNBABuilding,
      lego:       addLegoBuilding,
      robotest:   addRobotestBuilding,
    };

    const gameCityGroup   = new THREE.Group(); scene.add(gameCityGroup);
    const skillsCityGroup = new THREE.Group(); scene.add(skillsCityGroup);
    const buildsCityGroup = new THREE.Group(); scene.add(buildsCityGroup);

    for (const [districtDef, group] of [
      [gameCity,   gameCityGroup],
      [skillsCity, skillsCityGroup],
      [buildsCity, buildsCityGroup],
    ] as const) {
      const { ground: g, billboard: bb, buildings } = districtDef;
      addDistrictGround(group, g.x, g.z, g.rx, g.rz, g.color);
      addBillboard(group, bb.x, bb.z, { line1: bb.line1, line2: bb.line2, bg: bb.bg, fg: bb.fg }, 4, 1.1);
      for (const b of buildings) {
        if (b.type === 'minesweeper') {
          addMinesweeperBuilding(group, b.x, b.z, b.yBase ?? 0);
        } else {
          districtBuildFnMap[b.type]?.(group, b.x, b.z);
          if (b.colliderR > 0) bCol(b.x, b.z, b.colliderR);
        }
      }
    }

    const [portalRing, portalDisc] = addPortal(scene, PORTAL_X, PORTAL_Z);
    const portalMarker = createZoneMarker(0x00ffcc);
    portalMarker.scale.set(1.4, 1.4, 1.4);
    portalMarker.position.set(PORTAL_X, 0.05, PORTAL_Z + 5);
    scene.add(portalMarker);
    const portalZone: Zone = {
      label: 'PORTAL — Snake World',
      path: 'SNAKE_PORTAL',
      position: new THREE.Vector3(PORTAL_X, 0, PORTAL_Z + 2),
      radius: 8,
      marker: portalMarker,
    };
    builtZones.push(portalZone);

    const TH_X  = SCREEN_X;
    const SCR_Z = SCREEN_Z;
    const screenFrame = new THREE.Mesh(geoBox(12, 7, 0.35), lmat(0x222222));
    screenFrame.position.set(TH_X, GROUND + 4.5, SCR_Z); scene.add(screenFrame);
    colliders.push({ cx: TH_X, cz: SCR_Z, hw: 6.2, hd: 0.4 });
    const movieCanvas = document.createElement('canvas');
    movieCanvas.width = 512; movieCanvas.height = 288;
    const movieCtx = movieCanvas.getContext('2d')!;
    const movieTex = new THREE.CanvasTexture(movieCanvas);
    const screenMesh = new THREE.Mesh(geoPlane(11.2, 6.2),
      new THREE.MeshBasicMaterial({ map: movieTex }));
    screenMesh.position.set(TH_X, GROUND + 4.5, SCR_Z + 0.19); scene.add(screenMesh);
    [-4.5, 4.5].forEach(dx => {
      const leg = new THREE.Mesh(geoBox(0.3, 4, 0.3), lmat(0x333333));
      leg.position.set(TH_X + dx, GROUND + 2, SCR_Z); scene.add(leg);
    });
    const projPole = new THREE.Mesh(geoCyl(0.1, 0.1, 3.5, 6), lmat(0x444444));
    projPole.position.set(TH_X, GROUND + 1.75, SCR_Z + 18); scene.add(projPole);
    const projBox = new THREE.Mesh(geoBox(0.9, 0.5, 0.6), lmat(0x555555));
    projBox.position.set(TH_X, GROUND + 3.7, SCR_Z + 18); scene.add(projBox);
    const beam = new THREE.Mesh(geoCyl(0.04, 2.2, 18, 8),
      new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.05 }));
    beam.rotation.x = -Math.PI / 2; beam.position.set(TH_X, GROUND + 4.5, SCR_Z + 9); scene.add(beam);
    const popcornBucket = new THREE.Mesh(geoCyl(0.35, 0.26, 0.8, 8), lmat(0xee2222));
    popcornBucket.position.set(TH_X - 8, GROUND + 0.4, SCR_Z + 10); scene.add(popcornBucket);
    const popcornTop = new THREE.Mesh(geoSph(0.38, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.6), lmat(0xf0f0e0));
    popcornTop.position.set(TH_X - 8, GROUND + 0.86, SCR_Z + 10); scene.add(popcornTop);
    addBillboard(scene, PIXEL_PARK_BILLBOARD.x, PIXEL_PARK_BILLBOARD.z, { line1: PIXEL_PARK_BILLBOARD.line1, line2: PIXEL_PARK_BILLBOARD.line2, bg: PIXEL_PARK_BILLBOARD.bg, fg: PIXEL_PARK_BILLBOARD.fg }, 3, 1);

    let movieSlideIdx = 0;
    let movieFrameCount = 0;

    const drawMovieSlide = (idx: number) => {
      const s = movieSlides[idx];
      movieCtx.fillStyle = s.bg;
      movieCtx.fillRect(0, 0, 512, 288);
      movieCtx.fillStyle = 'rgba(255,255,255,0.02)';
      for (let i = 0; i < 300; i++) {
        movieCtx.fillRect(Math.random() * 512, Math.random() * 288, 1, 1);
      }
      movieCtx.fillStyle = s.fg;
      movieCtx.font = 'bold 44px monospace';
      movieCtx.textAlign = 'center';
      movieCtx.fillText(s.title, 256, 120);
      movieCtx.fillStyle = s.accent;
      movieCtx.font = '20px monospace';
      movieCtx.fillText(s.sub, 256, 165);
      movieCtx.strokeStyle = s.fg;
      movieCtx.lineWidth = 3;
      movieCtx.strokeRect(8, 8, 496, 272);
      movieTex.needsUpdate = true;
    };
    drawMovieSlide(0);

    const char = createCharacter(PLAYER_COLORS);
    const sword = new THREE.Mesh(geoBox(0.06, 0.7, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xddddff }));
    sword.position.set(0, -0.4, 0.08); char.rArm.add(sword);

    const faceMat  = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [[-0.1, 0.06], [0.1, 0.06]].forEach(([ex, ey]) => {
      const eye = new THREE.Mesh(geoBox(0.09, 0.09, 0.03), faceMat);
      eye.position.set(ex, ey, 0.27); char.head.add(eye);
      const hi = new THREE.Mesh(geoBox(0.03, 0.03, 0.03), whiteMat);
      hi.position.set(0.025, 0.025, 0.02); eye.add(hi);
    });
    const mouth = new THREE.Mesh(geoBox(0.12, 0.03, 0.03), faceMat);
    mouth.position.set(0, -0.1, 0.27); char.head.add(mouth);
    const savedPos = (() => { try { return JSON.parse(localStorage.getItem('gamerPos') || 'null'); } catch { return null; } })();
    char.group.position.set(savedPos?.x ?? 0, GROUND, savedPos?.z ?? 3.5);
    scene.add(char.group);

    const { state: keys, attach } = createInputTracker();
    const detach = attach();
    const ext = inputRef.current;

    let beaconLight: THREE.PointLight | null = null;
    scene.traverse(obj => { if (obj instanceof THREE.PointLight && obj.userData.beacon) beaconLight = obj as THREE.PointLight; });

    const FWATER = 16;
    const fwIM = new THREE.InstancedMesh(
      geoSph(0.07, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.75 }), FWATER);
    scene.add(fwIM);

    const bfColors = [0xff88cc, 0xffcc33, 0x44aaff, 0x88ff66, 0xff7744];
    const butterflies = bfColors.map((col, i) => {
      const g = new THREE.Group();
      const wingMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
      const wingGeo = geoPlane(0.32, 0.2);
      const wL = new THREE.Mesh(wingGeo, wingMat); wL.rotation.y =  0.5; wL.position.x = -0.16;
      const wR = new THREE.Mesh(wingGeo, wingMat); wR.rotation.y = -0.5; wR.position.x =  0.16;
      const body = new THREE.Mesh(geoSph(0.04, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x111111 }));
      g.add(wL, wR, body);
      scene.add(g);
      return { group: g, wL, wR, phase: (i / 5) * Math.PI * 2, r: 9 + i * 2.5, speed: 0.35 + i * 0.07 };
    });

    createStreetLights(scene, isDay);

    const BENCH_Y      = 0.20;
    const GROUND_SIT_Y = GROUND + 0.02 - 0.73;
    const STOOL_Y      = GROUND + 0.58 - 0.73;
    const SEAT_Y       = GROUND + 0.53 - 0.73;

    const groupYMap = { bench: BENCH_Y, ground_sit: GROUND_SIT_Y, stool: STOOL_Y, seat: SEAT_Y };

    const walkFacing = (sx: number, sz: number, tx: number, tz: number) =>
      Math.atan2(tx - sx, tz - sz);

    const spawnNPC = (
      spawnX: number, spawnZ: number,
      finalX: number, finalZ: number,
      finalFacingY: number, finalGroupY: number,
      skin: number, body: number, legs: number, hair: number,
      delay: number, idleType: NpcIdleType, idleIndex = 0,
    ): NpcAnim => {
      const dist = Math.sqrt((finalX - spawnX) ** 2 + (finalZ - spawnZ) ** 2);
      const npc = makeNPC(scene, spawnX, spawnZ,
        walkFacing(spawnX, spawnZ, finalX, finalZ),
        skin, body, legs, hair, false);
      npc.group.position.y = GROUND + 8;
      colliders.push({ cx: finalX, cz: finalZ, hw: 0.32, hd: 0.32 });
      const bubble = makeSpeechBubble(scene, npc.group);
      return { npc, spawnX, spawnZ, finalX, finalZ, finalGroupY,
        delay, walkDur: Math.max(dist / 3, 0.5), sitDur: 0.55,
        phase: 'wait', timer: 0, idleType, idleIndex,
        bubble, pokeTimer: 0, pokeCooldown: 0 };
    };

    // Spawn props from data defs
    for (const b of benchDefs) {
      makeBench(scene, b.x, b.z, b.rotY, b.scale);
      colliders.push({ cx: b.x, cz: b.z, hw: 0.58 * b.scale * 0.5 + 0.1, hd: 1.1 * b.scale * 0.5 + 0.1 });
    }
    for (const p of picnicDefs)  makePicnicBlanket(scene, p.x, p.z);
    for (const l of laptopDefs)  makeLaptop(scene, l.x, l.z, l.rotY);

    const tableTop = new THREE.Mesh(geoCyl(0.7, 0.7, 0.06, 8), lmat(0x8b5e2a));
    tableTop.position.set(cafeTableDef.tableX, GROUND + 0.85, cafeTableDef.tableZ); scene.add(tableTop);
    const tableLeg = new THREE.Mesh(geoCyl(0.06, 0.06, 0.85, 6), lmat(0x666666));
    tableLeg.position.set(cafeTableDef.tableX, GROUND + 0.44, cafeTableDef.tableZ); scene.add(tableLeg);
    const stoolSeat = new THREE.Mesh(geoCyl(0.28, 0.28, 0.05, 7), lmat(0x8b5e2a));
    stoolSeat.position.set(cafeTableDef.stoolX, GROUND + 0.58, cafeTableDef.stoolZ); scene.add(stoolSeat);
    const stoolLeg1 = new THREE.Mesh(geoCyl(0.04, 0.04, 0.58, 5), lmat(0x666666));
    stoolLeg1.position.set(cafeTableDef.stoolX, GROUND + 0.30, cafeTableDef.stoolZ); scene.add(stoolLeg1);

    // Partner NPC (custom hair mesh)
    const gfNpc = makeNPC(scene, partnerNpcDef.spawnX, partnerNpcDef.spawnZ,
      walkFacing(partnerNpcDef.spawnX, partnerNpcDef.spawnZ, partnerNpcDef.finalX, partnerNpcDef.finalZ),
      partnerNpcDef.skin, partnerNpcDef.body, partnerNpcDef.legs, partnerNpcDef.hair, false);
    gfNpc.group.position.y = GROUND + 8;
    colliders.push({ cx: partnerNpcDef.finalX, cz: partnerNpcDef.finalZ, hw: 0.32, hd: 0.32 });
    const gfLongHair = new THREE.Mesh(geoBox(0.52, 0.38, 0.52),
      new THREE.MeshLambertMaterial({ color: partnerNpcDef.longHairColor }));
    gfLongHair.position.set(0, 0.25, -0.05); gfNpc.head.add(gfLongHair);

    // Spawn regular NPCs from data
    const npcAnims: NpcAnim[] = npcSpawnDefs.map(def =>
      spawnNPC(def.spawnX, def.spawnZ, def.finalX, def.finalZ,
        def.finalFacingY, groupYMap[def.finalGroupY],
        def.skin, def.body, def.legs, def.hair,
        def.delay, def.idleType, def.idleIndex ?? 0)
    );

    // Partner NPC anim entry
    npcAnims.push({
      npc: gfNpc,
      spawnX: partnerNpcDef.spawnX, spawnZ: partnerNpcDef.spawnZ,
      finalX: partnerNpcDef.finalX, finalZ: partnerNpcDef.finalZ,
      finalGroupY: groupYMap[partnerNpcDef.finalGroupY],
      delay: partnerNpcDef.delay, walkDur: 1.8, sitDur: 0.55,
      phase: 'wait', timer: 0, idleType: partnerNpcDef.idleType, idleIndex: 0,
      bubble: makeSpeechBubble(scene, gfNpc.group), pokeTimer: 0, pokeCooldown: 0,
    });

    // Theater audience
    for (let row = 0; row < THEATER_ROWS; row++) {
      for (let col = 0; col < THEATER_COLS; col++) {
        const idx = row * THEATER_COLS + col;
        const nx = TH_X - 5.25 + col * 3.5;
        const nz = SCR_Z + 6 + row * 3.8;
        npcAnims.push(spawnNPC(nx - 14, nz, nx, nz, Math.PI, SEAT_Y,
          theaterSkins[idx], theaterBodies[idx], 0x222244, 0x1a1a1a,
          2.0 + idx * 0.3, 'theater', idx));
        const seat = new THREE.Mesh(geoBox(0.9, 0.06, 0.8), lmat(0x5a3a1a));
        seat.position.set(nx, GROUND + 0.53, nz + 0.15); scene.add(seat);
        const backrest = new THREE.Mesh(geoBox(0.9, 0.85, 0.07), lmat(0x5a3a1a));
        backrest.position.set(nx, GROUND + 0.98, nz + 0.55); scene.add(backrest);
        [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(geoBox(0.06, 0.5, 0.06), lmat(0x888888));
          leg.position.set(nx + lx, GROUND + 0.27, nz + 0.15 + lz); scene.add(leg);
        });
      }
    }

    const gemGeo = new THREE.OctahedronGeometry(0.38, 0);
    const gems = cityZones.map(cz => {
      const gem = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: cz.accentColor }));
      gem.position.set(cz.x, GROUND + 4.5, cz.z + 5);
      scene.add(gem);
      return gem;
    });

    const FFCOUNT = 22;
    const ffIM = new THREE.InstancedMesh(
      geoSph(0.09, 4, 4),
      new THREE.MeshBasicMaterial({ color: isDay ? 0xffee88 : 0xaaffaa }),
      FFCOUNT,
    );
    scene.add(ffIM);

    const DUST = 8;
    const dustIM = new THREE.InstancedMesh(
      geoSph(0.06, 3, 3),
      new THREE.MeshBasicMaterial({ color: 0xd8cdb8, transparent: true, opacity: 0.6 }),
      DUST,
    );
    scene.add(dustIM);

    const fwDummy = new THREE.Object3D();

    const audio = createAudioEngine();
    let lastNearLabel: string | null = null;
    let footstepTimer = 0;
    const playerKnockback = new THREE.Vector3();
    let lastTime = performance.now();
    let elapsed  = 0;
    let raf: number;
    let doorAnim: { group: THREE.Group; elapsed: number; path: string } | null = null;

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
        resolveCollisions(char.group.position, colliders, 0.35, 14 * 14);
        const pr = Math.sqrt(char.group.position.x**2 + char.group.position.z**2);
        if (pr > 43) {
          char.group.position.x = (char.group.position.x / pr) * 43;
          char.group.position.z = (char.group.position.z / pr) * 43;
        }
        const ta = Math.atan2(dx, dz);
        let diff = ta - char.group.rotation.y;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        char.group.rotation.y += diff * 0.25;
      }

      if (playerKnockback.lengthSq() > 0.002) {
        char.group.position.x += playerKnockback.x * dt;
        char.group.position.z += playerKnockback.z * dt;
        playerKnockback.multiplyScalar(0.82);
      }

      animateCharacter(char, translating, t);
      char.group.position.y += GROUND;

      if (translating) {
        const legSwing = Math.sin(t * 8);
        if (footstepTimer * legSwing < 0) audio.footstep();
        footstepTimer = legSwing;
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

      const playerX = char.group.position.x, playerZ = char.group.position.z;
      const dist2To = (x: number, z: number) => (playerX-x)**2 + (playerZ-z)**2;

      if (dist2To(0, 8) < 28*28) {
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
      }

      if (dist2To(0, 0) < 30*30) butterflies.forEach(b => {
        const angle = t * b.speed + b.phase;
        b.group.position.set(
          Math.cos(angle) * b.r,
          GROUND + 1.6 + Math.sin(t * 2.5 + b.phase) * 0.5,
          Math.sin(angle) * b.r,
        );
        b.group.rotation.y = angle + Math.PI / 2;
        const flap = Math.sin(t * 9 + b.phase) * 0.6;
        b.wL.rotation.z =  flap;
        b.wR.rotation.z = -flap;
      });

      const _px = char.group.position.x, _pz = char.group.position.z;
      npcAnims.forEach(a => {
        a.timer += dt;
        const { npc } = a;
        const _dx = _px - npc.group.position.x, _dz = _pz - npc.group.position.z;
        const _distFar = a.phase === 'idle' && _dx*_dx + _dz*_dz > 30*30;

        if (a.phase === 'wait') {
          if (a.timer >= a.delay) { a.phase = 'fall'; a.timer = 0; }
          return;
        }

        if (a.phase === 'fall') {
          const p = Math.min(a.timer / 0.45, 1);
          npc.group.position.y = GROUND + 8 * (1 - p) * (1 - p);
          npc.lArm.rotation.z =  0.8 * (1 - p);
          npc.rArm.rotation.z = -0.8 * (1 - p);
          if (p >= 1) {
            npc.group.position.y = GROUND;
            npc.lArm.rotation.z = 0; npc.rArm.rotation.z = 0;
            a.phase = 'walk'; a.timer = 0;
          }
          return;
        }

        if (a.phase === 'walk') {
          const p = Math.min(a.timer / a.walkDur, 1);
          npc.group.position.x = a.spawnX + (a.finalX - a.spawnX) * p;
          npc.group.position.z = a.spawnZ + (a.finalZ - a.spawnZ) * p;
          npc.group.position.y = GROUND;
          const sw = Math.sin(t * 9) * 0.5;
          npc.lThigh.position.copy(_STD_LT); npc.rThigh.position.copy(_STD_RT);
          npc.lShin.position.copy(_STD_LS);  npc.rShin.position.copy(_STD_RS);
          npc.lThigh.rotation.x =  sw; npc.rThigh.rotation.x = -sw;
          npc.lShin.rotation.x  = Math.max(0, -sw) * 0.6;
          npc.rShin.rotation.x  = Math.max(0,  sw) * 0.6;
          npc.lArm.rotation.x = -sw * 0.7; npc.rArm.rotation.x = sw * 0.7;
          if (p >= 1) {
            npc.group.position.set(a.finalX, GROUND, a.finalZ);
            npc.lThigh.rotation.x = 0; npc.rThigh.rotation.x = 0;
            npc.lShin.rotation.x  = 0; npc.rShin.rotation.x  = 0;
            npc.lArm.rotation.x   = 0; npc.rArm.rotation.x   = 0;
            npc.group.rotation.y = a.idleType === 'bench' ? -Math.PI / 2
              : a.idleType === 'picnic_a' ? -0.3
              : a.idleType === 'picnic_b' ? Math.PI + 0.4
              : a.idleType === 'laptop'   ? Math.PI
              : Math.PI;
            a.phase = 'sitdown'; a.timer = 0;
          }
          return;
        }

        if (a.phase === 'sitdown') {
          const p = Math.min(a.timer / a.sitDur, 1);
          npc.lThigh.position.lerpVectors(_STD_LT, _SIT_LT, p);
          npc.rThigh.position.lerpVectors(_STD_RT, _SIT_RT, p);
          npc.lShin.position.lerpVectors(_STD_LS, _SIT_LS, p);
          npc.rShin.position.lerpVectors(_STD_RS, _SIT_RS, p);
          npc.group.position.y = GROUND + (a.finalGroupY - GROUND) * p;
          if (p >= 1) { a.phase = 'idle'; }
          return;
        }

        if (a.phase === 'idle') {
          if (_distFar) return;
          const i = a.idleIndex;
          if (a.idleType === 'bench') {
            npc.head.rotation.y = Math.sin(t * 0.6) * 0.9;
            npc.head.rotation.x = Math.sin(t * 0.25) * 0.15;
          } else if (a.idleType === 'picnic_a') {
            npc.head.rotation.y = Math.sin(t * 0.4 + 1.0) * 0.35;
            npc.head.rotation.x = Math.sin(t * 1.2) * 0.08;
            npc.rArm.rotation.x = -0.6 + Math.sin(t * 1.5) * 0.15;
          } else if (a.idleType === 'picnic_b') {
            npc.head.rotation.y = Math.sin(t * 0.45 + 2.5) * 0.3;
            npc.head.rotation.x = Math.sin(t * 0.9) * 0.07;
            npc.lArm.rotation.x = -0.5 + Math.sin(t * 1.2 + 1) * 0.12;
          } else if (a.idleType === 'laptop') {
            npc.head.rotation.x = 0.35 + Math.sin(t * 0.3) * 0.05;
            npc.head.rotation.y = Math.sin(t * 0.2) * 0.1;
            npc.rArm.rotation.x = -0.8 + Math.sin(t * 6) * 0.08;
            npc.lArm.rotation.x = -0.8 + Math.sin(t * 6 + 1) * 0.08;
          } else {
            npc.head.rotation.x = 0.25 + Math.sin(t * 0.3 + i * 0.7) * 0.04;
            npc.head.rotation.y = Math.sin(t * 0.2 + i * 0.5) * 0.06;
            if (i % 3 === 0) npc.rArm.rotation.x = -0.3 + Math.sin(t * 0.5 + i) * 0.15;
          }
        }
      });

      if (movieFrameCount % 6 === 0) npcAnims.forEach(a => {
        a.pokeCooldown = Math.max(0, a.pokeCooldown - dt);
        if (a.pokeTimer > 0) {
          a.pokeTimer -= dt;
          if (a.pokeTimer <= 0) { a.bubble.visible = false; }
        }

        if (a.phase !== 'idle') return;
        const dx = char.group.position.x - a.finalX;
        const dz = char.group.position.z - a.finalZ;
        const dist2 = dx * dx + dz * dz;
        if (dist2 < 1.8 * 1.8 && a.pokeCooldown <= 0) {
          const lines = NPC_POKE_LINES[a.idleType];
          const msg = lines[Math.floor(Math.random() * lines.length)];
          showBubble(a.bubble, msg);
          a.pokeTimer = 2.2;
          a.pokeCooldown = 3.0;
          const pushLen = Math.sqrt(dist2) || 1;
          playerKnockback.set(dx / pushLen * 10, 0, dz / pushLen * 10);
          a.npc.rArm.rotation.x = -1.1;
          setTimeout(() => { if (a.npc.rArm) a.npc.rArm.rotation.x = 0; }, 400);
          a.npc.head.rotation.y = Math.atan2(dx, dz) - a.npc.group.rotation.y;
        }
      });

      portalRing.rotation.y = t * 0.6;
      const portalPulse = 0.9 + Math.sin(t * 2.5) * 0.1;
      (portalDisc.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 3) * 0.15;
      (portalDisc.material as THREE.MeshBasicMaterial).color.setHSL(0.45 + Math.sin(t * 0.8) * 0.05, 1, 0.15);
      portalRing.scale.setScalar(portalPulse);

      movieFrameCount++;
      if (movieFrameCount % 240 === 0) {
        movieSlideIdx = (movieSlideIdx + 1) % movieSlides.length;
        drawMovieSlide(movieSlideIdx);
      }

      gems.forEach((gem, i) => {
        gem.rotation.y = t * 1.2 + i;
        gem.position.y = GROUND + 4.5 + Math.sin(t * 1.8 + i) * 0.25;
      });

      if (elapsed % 2 < 1) {
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
      }

      if (translating) {
        for (let i = 0; i < DUST; i++) {
          const da = (i / DUST) * Math.PI * 2 + t * 3;
          const dr = (0.2 + (i % 3) * 0.15) * Math.sin(t * 8 + i);
          fwDummy.position.set(
            char.group.position.x + Math.cos(da) * dr,
            GROUND + 0.05,
            char.group.position.z + Math.sin(da) * dr,
          );
          fwDummy.updateMatrix(); dustIM.setMatrixAt(i, fwDummy.matrix);
        }
        dustIM.instanceMatrix.needsUpdate = true;
      }

      const near = getNearestZone(char.group.position, builtZones);
      nearZoneRef.current = near;
      const nl = near ? near.label : null;
      if (nl !== lastNearLabel) {
        if (nl) audio.zoneEnter(); else audio.zoneExit();
        lastNearLabel = nl; setNearZone(nl);
      }

      if (doorAnim) {
        doorAnim.elapsed += dt;
        const p = Math.min(doorAnim.elapsed / 0.55, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        doorAnim.group.rotation.y = -(Math.PI / 2) * ease;
        if (p >= 1) {
          const path = doorAnim.path;
          doorAnim = null;
          if (path === 'SNAKE_PORTAL') { setPortalOpen(true); }
          else { setMiniGameOpen(false); router.push(path); }
        }
      }

      if ((keys.action || ext.action) && near?.path && !doorAnim) {
        try { localStorage.setItem('gamerPos', JSON.stringify({ x: char.group.position.x, z: char.group.position.z })); } catch {}
        audio.navigate(); ext.action = false;
        const dg = zoneDoors.get(near.path);
        if (dg && near.path !== 'SNAKE_PORTAL') {
          doorAnim = { group: dg, elapsed: 0, path: near.path };
        } else if (near.path === 'SNAKE_PORTAL') {
          setPortalOpen(true);
        } else {
          setMiniGameOpen(false); router.push(near.path);
        }
      }

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
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach(mat => mat.dispose());
          else (m as THREE.Material).dispose();
        }
      });
      _geoCache.forEach(g => g.dispose()); _geoCache.clear();
      _lmats.forEach(m => m.dispose());    _lmats.clear();
      _signCache.forEach(t => t.dispose()); _signCache.clear();
      _texCache.forEach(t => t.dispose());  _texCache.clear();
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
            if (!z?.path) return;
            if (z.path === 'SNAKE_PORTAL') { setPortalOpen(true); }
            else { setMiniGameOpen(false); router.push(z.path); }
          }}>Enter →</button>
        </div>
      )}
      {portalOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#00ffcc', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '0.5rem', opacity: 0.7 }}>
            ⚡ SNAKE WORLD — Press ESC or close to open Work Experience
          </div>
          <MiniSnake onRestore={() => { setPortalOpen(false); router.push('/work'); }} />
        </div>
      )}
      <div className={styles.controlsHint}>WASD / Arrow keys · E or Enter to enter</div>
      <Joystick inputRef={inputRef} />
    </div>
  );
}
