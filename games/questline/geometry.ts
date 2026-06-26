import * as THREE from 'three';

export const _geoCache = new Map<string, THREE.BufferGeometry>();

export const geoBox = (w: number, h: number, d: number, sw=1, sh=1, sd=1): THREE.BoxGeometry => {
  const k = `B${w},${h},${d},${sw},${sh},${sd}`;
  if (!_geoCache.has(k)) _geoCache.set(k, new THREE.BoxGeometry(w,h,d,sw,sh,sd));
  return _geoCache.get(k) as THREE.BoxGeometry;
};

export const geoCyl = (rt: number, rb: number, h: number, seg=8, hs=1, open=false, ts=0, tl=Math.PI*2): THREE.CylinderGeometry => {
  const k = `C${rt},${rb},${h},${seg},${hs},${open},${ts.toFixed(3)},${tl.toFixed(3)}`;
  if (!_geoCache.has(k)) _geoCache.set(k, new THREE.CylinderGeometry(rt,rb,h,seg,hs,open,ts,tl));
  return _geoCache.get(k) as THREE.CylinderGeometry;
};

export const geoSph = (r: number, ws=8, hs=6, ps=0, pl=Math.PI*2, ts=0, tl=Math.PI): THREE.SphereGeometry => {
  const k = `S${r},${ws},${hs},${ps.toFixed(3)},${pl.toFixed(3)},${ts.toFixed(3)},${tl.toFixed(3)}`;
  if (!_geoCache.has(k)) _geoCache.set(k, new THREE.SphereGeometry(r,ws,hs,ps,pl,ts,tl));
  return _geoCache.get(k) as THREE.SphereGeometry;
};

export const geoPlane = (w: number, h: number): THREE.PlaneGeometry => {
  const k = `P${w},${h}`;
  if (!_geoCache.has(k)) _geoCache.set(k, new THREE.PlaneGeometry(w,h));
  return _geoCache.get(k) as THREE.PlaneGeometry;
};
