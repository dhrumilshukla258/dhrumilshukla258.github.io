export interface PageDef {
  path: string;
  githubFile: string;
  professional: { name: string; icon: string };
  gamer: { name: string; icon: string };
  technical: { name: string; icon: string };
}

export const pages: PageDef[] = [
  {
    path: '/',
    githubFile: 'pages/index.tsx',
    professional: { name: 'home.c',        icon: '/logos/file_type_c.svg' },
    gamer:        { name: 'home.exe',       icon: '/logos/file_type_bat.svg' },
    technical:    { name: 'home.c',         icon: '/logos/file_type_c.svg' },
  },
  {
    path: '/work',
    githubFile: 'pages/work.tsx',
    professional: { name: 'experience.py',  icon: '/logos/file_type_python.svg' },
    gamer:        { name: 'career.log',     icon: '/logos/file_type_log.svg' },
    technical:    { name: 'experience.py',  icon: '/logos/file_type_python.svg' },
  },
  {
    path: '/projects',
    githubFile: 'pages/projects.tsx',
    professional: { name: 'projects.cpp',   icon: '/logos/file_type_cpp3.svg' },
    gamer:        { name: 'builds.dat',     icon: '/logos/file_type_binary.svg' },
    technical:    { name: 'projects.cpp',   icon: '/logos/file_type_cpp3.svg' },
  },
  {
    path: '/about',
    githubFile: 'pages/about.tsx',
    professional: { name: 'about.json',     icon: '/logos/json_icon.svg' },
    gamer:        { name: 'character.cfg',  icon: '/logos/file_type_config.svg' },
    technical:    { name: 'about.json',     icon: '/logos/json_icon.svg' },
  },
  {
    path: '/contact',
    githubFile: 'pages/contact.tsx',
    professional: { name: 'contact.cs',     icon: '/logos/file_type_csharp2.svg' },
    gamer:        { name: 'contact.msg',    icon: '/logos/file_type_db.svg' },
    technical:    { name: 'contact.cs',     icon: '/logos/file_type_csharp2.svg' },
  },
  {
    path: '/github',
    githubFile: 'pages/github.tsx',
    professional: { name: 'github.md',      icon: '/logos/markdown_icon.svg' },
    gamer:        { name: 'source.git',     icon: '/logos/file_type_git.svg' },
    technical:    { name: 'github.md',      icon: '/logos/markdown_icon.svg' },
  },
];

export { REPO_BASE } from '@/data/owner';
