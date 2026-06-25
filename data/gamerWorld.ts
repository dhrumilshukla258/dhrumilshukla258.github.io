// City zone and building config — derived from data/ files so changes here propagate to the game.

import { workexp } from './workexp';
import { pages } from './pages';
import { owner } from './owner';

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

// Pull current employer from work experience data
const currentJob   = workexp[0];
const compParts    = currentJob.company.split('—').map(s => s.trim());
const compLine1    = compParts[0].replace('Entertainment', '').trim(); // "Visual Concepts"
const compLine2    = compParts[1] ?? owner.companyShort;               // "2K Games"

// Page gamer display names by path
function gamerName(path: string): string {
  return pages.find(p => p.path === path)?.gamer.name.toUpperCase() ?? path.slice(1).toUpperCase();
}

export const cityZones: CityZone[] = [
  {
    label:        compLine1,
    subLabel:     compLine2,
    path:         '/work',
    buildingType: 'skyscraper',
    accentColor:  0x00aaff,
    signBg:       '#001133',
    signFg:       '#00aaff',
    x: 22, z: -22, radius: 6,
  },
  {
    label:        'PROJECTS',
    subLabel:     gamerName('/projects'),
    path:         '/projects',
    buildingType: 'artdeco',
    accentColor:  0xff8800,
    signBg:       '#221100',
    signFg:       '#ff8800',
    x: -22, z: -22, radius: 6,
  },
  {
    label:        'GITHUB',
    subLabel:     gamerName('/github'),
    path:         '/github',
    buildingType: 'cylinder',
    accentColor:  0x6e40c9,
    signBg:       '#0d1117',
    signFg:       '#6e40c9',
    x: 22, z: 22, radius: 6,
  },
  {
    label:        'ABOUT',
    subLabel:     gamerName('/about'),
    path:         '/about',
    buildingType: 'wide',
    accentColor:  0x22cc88,
    signBg:       '#0a2a1a',
    signFg:       '#22cc88',
    x: -22, z: 22, radius: 6,
  },
  {
    label:        'CONTACT',
    subLabel:     gamerName('/contact'),
    path:         '/contact',
    buildingType: 'triangle',
    accentColor:  0xff3366,
    signBg:       '#1a0020',
    signFg:       '#ff3366',
    x: 0, z: -30, radius: 6,
  },
];

export const spawnBuildingLabel = `${owner.companyShort} HQ`;
export const worldName = `${owner.companyShort} City`;
