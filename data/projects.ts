export interface Project {
  title: string;
  description: string;
  logos?: string[];
  link: string;
  slug: string;
}

export const projects: Project[] = [
  {
    title: 'Belly Blaster',
    description:
      'Discover creative websites and developers. A portal for you to share your projects.',
    logos: [],
    link: 'https://github.com/augdirt/BellyBlaster',
    slug: 'BellyBlaster',
  },
  {
    title: 'IDE Themed Portfolio Website',
    description:
      'An IDE themed developer portfolio built with Next.js and CSS Modules.',
    logos: [],
    link: 'https://github.com/dhrumilshukla258/dhrumilshukla258.github.io',
    slug: 'ide-portfolio',
  },
  {
    title: 'Masters Thesis',
    description:
      'Deep dive in cyclones and clustering analysis.',
    logos: [],
    link: 'https://github.com/dhrumilshukla258/Thesis-Code',
    slug: 'subtrackt',
  },
  {
    title: 'Robotest',
    description:
      'A 2.5D platformer game built on a custom game engine.',
    logos: [],
    link: 'https://github.com/dhrumilshukla258/Robotest',
    slug: 'Robotest',
  },
];
