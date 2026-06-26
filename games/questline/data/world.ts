import type { CharacterColors } from '../engine';

// ── Player character ───────────────────────────────────────────────────────────
export const PLAYER_COLORS: CharacterColors = {
  skin: 0xf0d0b0,
  body: 0xa0a8c0,
  legs: 0x5a3080,
  hair: 0x1a1a1a,
};

// ── Key world positions ────────────────────────────────────────────────────────
export const PORTAL_X   = 0;
export const PORTAL_Z   = 36;
export const FOUNTAIN_X = 0;
export const FOUNTAIN_Z = 8;

// ── Street lights ─────────────────────────────────────────────────────────────
export const STREET_LIGHT_POSITIONS: [number, number][] = [
  [10,-10],[18,-18],[24,-24],
  [-10,-10],[-18,-18],[-24,-24],
  [10,10],[18,18],[24,24],
  [-10,10],[-18,18],[-24,24],
  [0,-12],[0,-22],[0,-32],
];

// Active only at night — fewer point lights for perf
export const NIGHT_POINT_LIGHTS: [number, number][] = [
  [14,-14],[-14,-14],[14,14],[-14,14],[0,-18],[0,0],
];
