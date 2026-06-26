export type DistrictBuildingType =
  | 'react' | 'typescript' | 'cpp' | 'python' | 'git'
  | 'digipen' | 'nwra'
  | 'nba' | 'lego' | 'robotest' | 'minesweeper';

export interface BuildingPlacement {
  type:      DistrictBuildingType;
  x:         number;
  z:         number;
  colliderR: number;
  yBase?:    number; // optional vertical offset (used by minesweeper)
}

export interface DistrictDef {
  ground:    { x: number; z: number; rx: number; rz: number; color: number };
  billboard: { x: number; z: number; line1: string; line2: string; bg: string; fg: string };
  buildings: BuildingPlacement[];
}

export const gameCity: DistrictDef = {
  ground:    { x: 34, z: -28, rx: 24, rz: 20, color: 0x4a8c3a },
  billboard: { x: 16, z: -14, line1: 'GAME CITY', line2: 'Work Experience', bg: '#1a2a3a', fg: '#00aaff' },
  buildings: [
    { type: 'digipen', x: 36, z: -18, colliderR: 2.5 },
    { type: 'nwra',    x: 20, z: -28, colliderR: 2.5 },
  ],
};

export const skillsCity: DistrictDef = {
  ground:    { x: -34, z: -26, rx: 26, rz: 22, color: 0x3d9e2a },
  billboard: { x: -16, z: -14, line1: 'SKILLS CITY', line2: 'Tech Stack', bg: '#1a3a1a', fg: '#44ff88' },
  buildings: [
    { type: 'react',      x: -30, z: -12, colliderR: 2 },
    { type: 'typescript', x: -34, z: -22, colliderR: 2 },
    { type: 'cpp',        x: -20, z: -30, colliderR: 2 },
    { type: 'python',     x: -30, z:  -2, colliderR: 2 },
    { type: 'git',        x: -36, z: -12, colliderR: 2 },
  ],
};

export const buildsCity: DistrictDef = {
  ground:    { x: 22, z: 34, rx: 18, rz: 14, color: 0x4a6e3a },
  billboard: { x: 14, z: 18, line1: 'BUILDS CITY', line2: 'Projects', bg: '#1a1100', fg: '#ffaa22' },
  buildings: [
    { type: 'nba',         x: 34, z: 24, colliderR: 2.5 },
    { type: 'lego',        x: 14, z: 38, colliderR: 2 },
    { type: 'robotest',    x: 18, z: 30, colliderR: 2.5 },
    { type: 'minesweeper', x: 18, z: 30, colliderR: 0, yBase: 5 },
  ],
};
