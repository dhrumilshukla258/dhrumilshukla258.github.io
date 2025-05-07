
import { Project } from '@/types';

export const projectPageHeader = {
  title: "Personal Projects", 
  subtitle:`Here's a collection of variety of projects I have worked on. 
  These projects showcase my skills in software and game development,
  design, and problem-solving.`
};

export const projects: Project[] = [
  {
    title: 'IDE Themed Portfolio Website',
    description: [
      'An IDE themed developer portfolio built with Next.js and CSS Modules.',
      'Built with Next.js and TypeScript',
      'Implemented responsive design',
      'Deployed via Vercel with CI/CD setup',
    ],
    logos: [],
    link: 'https://github.com/dhrumilshukla258/dhrumilshukla258.github.io',
    slug: 'ide-portfolio',
    startDate: new Date('2025-03-15'),
  },
  {
    title: 'Belly Blaster',
    description:[
      'A game for my sisters baby shower',
    ],
    logos: [],
    link: 'https://github.com/augdirt/BellyBlaster',
    slug: 'BellyBlaster',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-07-15'),
  },
  {
    title: 'Masters Thesis',
    description:[
      'Deep dive in cyclones and clustering analysis.',
    ],
    logos: [],
    link: 'https://github.com/dhrumilshukla258/Thesis-Code',
    slug: 'subtrackt',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2023-07-15'),
  },
  {
    title: 'Robotest',
    description:[
      'A 2.5D platformer game built on a custom game engine.',
    ],
    logos: [],
    link: 'https://github.com/dhrumilshukla258/Robotest',
    slug: 'Robotest',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2023-07-15'),
  },
];
