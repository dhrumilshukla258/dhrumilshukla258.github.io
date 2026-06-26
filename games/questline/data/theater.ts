export interface MovieSlide {
  title:  string;
  sub:    string;
  bg:     string;
  fg:     string;
  accent: string;
}

export const movieSlides: MovieSlide[] = [
  { title: 'NBA 2K',       sub: 'Gameplay Engineer @ Visual Concepts',    bg: '#001833', fg: '#00aaff', accent: '#ffaa00' },
  { title: 'LEGO 2K DRIVE',sub: 'Open World Navigation — Unreal Engine',  bg: '#1a0800', fg: '#ffcc00', accent: '#ee2222' },
  { title: 'MINESWEEPER',  sub: 'Personal Project — TypeScript',          bg: '#001a00', fg: '#44ee44', accent: '#ffffff' },
  { title: 'ROBOTEST',     sub: 'Test Automation Framework',              bg: '#0a0812', fg: '#ff8844', accent: '#aaaaff' },
  { title: 'ML RESEARCH',  sub: 'Tropical Cyclone Intensity — DigiPen',   bg: '#0a0a2a', fg: '#aaaaff', accent: '#00ccff' },
  { title: 'SATELLITE DATA',sub: 'NASA LIS/SSMIS Pipelines — NWRA',      bg: '#1a1200', fg: '#ddaa44', accent: '#88ccff' },
];

// Screen + projector placement in world space
export const SCREEN_X  = 0;
export const SCREEN_Z  = 16;
export const PIXEL_PARK_BILLBOARD = { x: -8, z: SCREEN_Z - 2, line1: 'PIXEL PARK', line2: 'Now Playing', bg: '#0a0a1a', fg: '#ffcc44' } as const;
