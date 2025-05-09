
import { Project } from '@/types';

export const projectPageHeader = {
  title: "Personal Projects", 
  subtitle:`Here's a collection of variety of projects I have worked on. 
  These projects showcase my skills in software and game development,
  design, and problem-solving.`
};

export const projects: Project[] = [
  {
    title: 'VSCode Themed Portfolio Website',
    overview: '',
    description: [
      'An VSCode themed developer portfolio built with Next.js and CSS Modules.',
      'Built with Next.js and TypeScript',
      'Implemented responsive design',
    ],
    techLogo: [],
    link: 'https://github.com/dhrumilshukla258/dhrumilshukla258.github.io',
    slug: 'vscode-portfolio',
    startDate: new Date('2025-03-15'),
  },
  {
    title: 'Belly Blaster',
    overview: '',
    description:[
      'A game for my sisters baby shower',
    ],
    techLogo: [],
    link: 'https://github.com/augdirt/BellyBlaster',
    slug: 'BellyBlaster',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-07-15'),
  },
  {
    title: 'Masters Thesis',
    overview: '',
    description:[
      'Deep dive in cyclones and clustering analysis.',
    ],
    techLogo: [],
    link: 'https://github.com/dhrumilshukla258/Thesis-Code',
    slug: 'subtrackt',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2023-07-15'),
  },
  {
    title: 'Robotest',
    overview: '',
    description:[
      'A 2.5D platformer game built on a custom game engine.',
    ],
    techLogo: [],
    link: 'https://github.com/dhrumilshukla258/Robotest',
    slug: 'Robotest',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2023-07-15'),
  },
];
