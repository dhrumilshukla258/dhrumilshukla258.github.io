import * as THREE from 'three';
import { geoBox, geoCyl, geoPlane } from './geometry';

// ── Shared material helper ─────────────────────────────────────────────────────

export const _lmats = new Map<number, THREE.MeshLambertMaterial>();
export function lmat(color: number) {
  if (!_lmats.has(color)) _lmats.set(color, new THREE.MeshLambertMaterial({ color }));
  return _lmats.get(color)!;
}
export function ltex(tex: THREE.CanvasTexture) {
  return new THREE.MeshLambertMaterial({ map: tex });
}

// ── Procedural textures ────────────────────────────────────────────────────────

export const _texCache = new Map<string, THREE.CanvasTexture>();

export function makeTex(key: string, draw: (ctx: CanvasRenderingContext2D) => void, tileRepeat = 1): THREE.CanvasTexture {
  if (_texCache.has(key)) return _texCache.get(key)!;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (tileRepeat > 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(tileRepeat, tileRepeat); }
  _texCache.set(key, t);
  return t;
}

export function stonePathTex() {
  return makeTex('stone', ctx => {
    ctx.fillStyle = '#c4b89a'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      const sx = Math.random()*256, sy = Math.random()*256;
      ctx.fillStyle = `rgba(${Math.random()>0.5?0:255},${Math.random()>0.5?0:255},0,0.04)`;
      ctx.fillRect(sx, sy, 18+Math.random()*20, 14+Math.random()*14);
    }
    ctx.strokeStyle = '#8a7a62'; ctx.lineWidth = 3;
    const bw = 52, bh = 30;
    for (let row = 0; row < 10; row++) for (let col = 0; col < 6; col++) {
      const ox = row % 2 === 0 ? 0 : bw / 2;
      const rx = col*bw - ox, ry = row*bh;
      ctx.strokeRect(rx, ry, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(rx+3, ry+3, bw*0.5, bh*0.4);
    }
  }, 5);
}

export function brickTex(base: string, line: string) {
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

export function glassTex(tint: string) {
  return makeTex(`glass${tint}`, ctx => {
    ctx.fillStyle = tint; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i*32, 0); ctx.lineTo(i*32, 256); ctx.stroke(); }
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, i*32); ctx.lineTo(256, i*32); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,240,180,0.4)';
    [[32,32],[96,64],[160,96],[64,160],[192,128]].forEach(([wx,wy]) => ctx.fillRect(wx+2, wy+2, 28, 28));
  });
}

// ── Sign billboard ─────────────────────────────────────────────────────────────

export const _signCache = new Map<string, THREE.CanvasTexture>();

export function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxPx: number): number {
  let size = maxPx;
  ctx.font = `bold ${size}px Arial`;
  while (ctx.measureText(text).width > maxW && size > 14) { size -= 2; ctx.font = `bold ${size}px Arial`; }
  return size;
}

export function makeSignTex(line1: string, line2: string, bg: string, fg: string): THREE.CanvasTexture {
  const key = `${line1}|${line2}|${bg}|${fg}`;
  if (_signCache.has(key)) return _signCache.get(key)!;
  const c = document.createElement('canvas'); c.width = 256; c.height = 100;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 100);
  ctx.strokeStyle = fg; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 252, 96);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (line2) {
    fitFont(ctx, line1, 245, 34); ctx.fillText(line1, 128, 36);
    fitFont(ctx, line2, 245, 26); ctx.globalAlpha = 0.75; ctx.fillText(line2, 128, 75); ctx.globalAlpha = 1;
  } else {
    fitFont(ctx, line1, 245, 41); ctx.fillText(line1, 128, 50);
  }
  const t = new THREE.CanvasTexture(c);
  _signCache.set(key, t);
  return t;
}

export const _boardMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
export const _poleMat2 = new THREE.MeshLambertMaterial({ color: 0x666677 });
export const _bpGeo    = geoCyl(0.06, 0.09, 2.8, 5);

export function addBillboard(
  scene: THREE.Object3D, x: number, z: number,
  sign: { line1: string; line2: string; bg: string; fg: string },
  w = 3.5, h = 1.2, yOffset = 0,
) {
  const pole = new THREE.Mesh(_bpGeo, _poleMat2);
  pole.position.set(x, yOffset + 1.4, z); scene.add(pole);
  const back = new THREE.Mesh(geoBox(w + 0.2, h + 0.2, 0.15), _boardMat);
  back.position.set(x, yOffset + 3.1, z); scene.add(back);
  const face = new THREE.Mesh(
    geoPlane(w, h),
    new THREE.MeshBasicMaterial({ map: makeSignTex(sign.line1, sign.line2, sign.bg, sign.fg) }),
  );
  face.position.set(x, yOffset + 3.1, z + 0.09); scene.add(face);
}

export interface SignData { line1: string; line2: string; bg: string; fg: string; accent: number; }
