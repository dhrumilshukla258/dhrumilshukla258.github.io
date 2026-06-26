import { workexp } from '@/data/workexp';
import { pages } from '@/data/pages';
import { owner } from '@/data/owner';

export interface CityZone {
  label:        string;
  subLabel:     string;
  path:         string | null;
  buildingType: 'skyscraper' | 'artdeco' | 'cylinder' | 'wide' | 'triangle';
  accentColor:  number;
  signBg:       string;
  signFg:       string;
  x: number;
  z: number;
  radius: number;
}

const currentJob = workexp[0];
const compParts  = currentJob.company.split('—').map(s => s.trim());
const compLine1  = compParts[0].replace('Entertainment', '').trim();
const compLine2  = compParts[1] ?? owner.companyShort;

function gamerName(path: string): string {
  return pages.find(p => p.path === path)?.gamer.name.toUpperCase() ?? path.slice(1).toUpperCase();
}

export const cityZones: CityZone[] = [
  {
    label: compLine1, subLabel: compLine2,
    path: '/work', buildingType: 'skyscraper',
    accentColor: 0x00aaff, signBg: '#001133', signFg: '#00aaff',
    x: 30, z: -30, radius: 6,
  },
  {
    label: 'PROJECTS', subLabel: gamerName('/projects'),
    path: '/projects', buildingType: 'artdeco',
    accentColor: 0xff8800, signBg: '#221100', signFg: '#ff8800',
    x: -30, z: -30, radius: 6,
  },
  {
    label: 'GITHUB', subLabel: gamerName('/github'),
    path: '/github', buildingType: 'cylinder',
    accentColor: 0x6e40c9, signBg: '#0d1117', signFg: '#6e40c9',
    x: 30, z: 12, radius: 6,
  },
  {
    label: 'ABOUT', subLabel: gamerName('/about'),
    path: '/about', buildingType: 'wide',
    accentColor: 0x22cc88, signBg: '#0a2a1a', signFg: '#22cc88',
    x: -24, z: 24, radius: 6,
  },
  {
    label: 'CONTACT', subLabel: gamerName('/contact'),
    path: '/contact', buildingType: 'triangle',
    accentColor: 0xff3366, signBg: '#1a0020', signFg: '#ff3366',
    x: 0, z: -42, radius: 6,
  },
];

export const spawnBuildingLabel = 'FACTION HQ';
export const worldName          = 'FACTION HQ';
