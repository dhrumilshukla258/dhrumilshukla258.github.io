import type { NpcIdleType } from '../npcs';

export interface NpcSpawnDef {
  spawnX:       number;
  spawnZ:       number;
  finalX:       number;
  finalZ:       number;
  finalFacingY: number;
  finalGroupY:  'bench' | 'ground_sit' | 'stool' | 'seat'; // resolved to Y at runtime
  skin:  number;
  body:  number;
  legs:  number;
  hair:  number;
  delay: number;
  idleType:  NpcIdleType;
  idleIndex?: number;
}

// Special NPC with custom hair mesh (the partner/girlfriend character)
export interface PartnerNpcDef {
  spawnX: number; spawnZ: number;
  finalX: number; finalZ: number;
  finalFacingY: number;
  finalGroupY: 'ground_sit';
  skin: number; body: number; legs: number; hair: number;
  longHairColor: number;
  delay: number;
  idleType: NpcIdleType;
}

export interface BenchDef {
  x: number; z: number; rotY: number; scale: number;
}

export interface PicnicDef {
  x: number; z: number;
}

export interface LaptopDef {
  x: number; z: number; rotY: number;
}

export interface CafeTableDef {
  tableX: number; tableZ: number;
  stoolX: number; stoolZ: number;
}

// ── Bench ─────────────────────────────────────────────────────────────────────
export const benchDefs: BenchDef[] = [
  { x: -38, z: 8, rotY: -Math.PI / 2, scale: 2.2 },
];

// ── Picnic spots ──────────────────────────────────────────────────────────────
export const picnicDefs: PicnicDef[] = [
  { x: -20, z: 2 },
];

// ── Laptop desks ──────────────────────────────────────────────────────────────
export const laptopDefs: LaptopDef[] = [
  { x: -2, z: 6.4, rotY: Math.PI },
];

// ── Cafe table ────────────────────────────────────────────────────────────────
export const cafeTableDef: CafeTableDef = {
  tableX: -2, tableZ: 6,
  stoolX: -2, stoolZ: 7.0,
};

// ── NPC spawns ────────────────────────────────────────────────────────────────
export const npcSpawnDefs: NpcSpawnDef[] = [
  {
    spawnX: -38, spawnZ: 18,
    finalX: -38, finalZ: 8.4,
    finalFacingY: -Math.PI / 2, finalGroupY: 'bench',
    skin: 0xffcc88, body: 0x3355aa, legs: 0x222244, hair: 0x221100,
    delay: 0.5, idleType: 'bench',
  },
  {
    spawnX: -10, spawnZ: 2,
    finalX: -20.5, finalZ: 2.5,
    finalFacingY: -0.3, finalGroupY: 'ground_sit',
    skin: 0xddaa77, body: 0xcc4433, legs: 0x332211, hair: 0x110800,
    delay: 1.0, idleType: 'picnic_a',
  },
  {
    spawnX: 8, spawnZ: -4,
    finalX: -2, finalZ: 7.0,
    finalFacingY: Math.PI, finalGroupY: 'stool',
    skin: 0xffcc99, body: 0x334455, legs: 0x223344, hair: 0x110000,
    delay: 1.5, idleType: 'laptop',
  },
];

export const partnerNpcDef: PartnerNpcDef = {
  spawnX: -10, spawnZ: -2,
  finalX: -19.5, finalZ: 1.5,
  finalFacingY: -0.3, finalGroupY: 'ground_sit',
  skin: 0xffddbb, body: 0x995577, legs: 0x332244, hair: 0x550022,
  longHairColor: 0x441100,
  delay: 1.2, idleType: 'picnic_b',
};

// ── Theater audience ──────────────────────────────────────────────────────────
export const theaterSkins: number[]  = [0xf5c5a0, 0xd4956b, 0xfde8c8, 0xe8b88a, 0xc87040, 0xfcd5b0, 0xb06030, 0xf0d090];
export const theaterBodies: number[] = [0x3355aa, 0xaa3355, 0x338833, 0x996633, 0x555599, 0xaa5533, 0x33aaaa, 0x884488];
export const THEATER_ROWS = 2;
export const THEATER_COLS = 4;
