// ─── Edit this file to update your portfolio everywhere ───────────────────────

export const owner = {
  name:       'Dhrumil Shukla',
  title:      'Software Engineer',
  tagline:    'Avid Software Engineer building games and software you\'d love to use',
  email:      'dhrumilshukla258@gmail.com',
  github:     'dhrumilshukla258',
  site:       'dhrumilshukla258.github.io',
  repo:       'dhrumilshukla258.github.io',
  branch:     'gh-pages',
  version:    '1.0.0',
  license:    'MIT',
  keyboard:   'Ortholinear columnar + Engram layout',

  // Current job
  company:          'Visual Concepts Entertainment',
  companyShort:     '2K Games',
  faction:          '2K Games',
  yearsExperience:  '5+',
  jobStartYear:     2020,
  shipped:          ['NBA 2K Series', 'LEGO 2K Drive'],
  focus:            'Gameplay Systems · UI/HUD · Shaders · Profiling',
  stack:            'C++ · Python · TypeScript · Perforce · Git',

  // Bio per personality (used on home page)
  bio: {
    professional: 'Software Engineer at Visual Concepts / 2K Games with 5+ years building gameplay systems, UI/HUD, and tools for the NBA 2K series. Passionate about clean code, team collaboration, and shipping great player experiences.',
    gamer:        'Quest-hardened game dev who shipped NBA 2K Series and LEGO 2K Drive. Specializes in gameplay systems, UI/HUD, and performance sorcery. Currently on the main storyline at Visual Concepts — no plans to abandon this questline anytime soon.',
    technical:    '/* Visual Concepts Entertainment — C++ Game Engineer\n * Shipped: NBA 2K Series · LEGO 2K Drive\n * Focus:   Gameplay Systems · UI/HUD · Shaders · Profiling\n * Stack:   C++ · Python · TypeScript · Perforce · Git\n * Status:  ACTIVE  [Oct 2020 → present]\n */',
  },

  education: [
    'M.S. Computer Science — DigiPen Institute of Technology (2020)',
    'B.E. Computer Engineering — Gujarat Technological University (2018)',
  ],
  educationStructured: [
    { degree: 'M.S. Computer Science',    school: 'DigiPen Institute of Technology', dates: 'Sep 2018 – Dec 2020' },
    { degree: 'B.E. Computer Engineering', school: 'Gujarat Technological University', dates: 'Aug 2014 – May 2018' },
  ],
  hobbies: ['video games', 'tennis', 'skating', 'Letterboxd', 'home server'],

  // og:description / meta description
  description: 'Software engineer and game developer building gameplay systems, UI/HUD, and tools shipped in NBA 2K and LEGO 2K Drive.',

  // SEO keywords
  keywords: [
    'dhrumil', 'shukla', 'dhrumil shukla', 'software', 'engineer', 'software engineer',
    'game', 'developer', 'game developer', 'programmer', 'portfolio', 'developer portfolio',
    'ide-portfolio', 'vscode-portfolio', 'unity-portfolio', 'unreal-portfolio',
    'nba 2k', 'lego 2k drive', '2k', 'take-two', 'visual concepts', 'digipen',
  ],
};

// ─── Home page CTA link labels per personality ────────────────────────────────
export const homeLinks = {
  professional: [
    { href: '/projects', label: 'View Projects' },
    { href: '/work',     label: 'Work Experience' },
  ],
  gamer: [
    { href: '/projects', label: '🏗️ builds.dat' },
    { href: '/work',     label: '📋 career.log' },
  ],
  technical: [
    { href: '/projects', label: './projects.cpp' },
    { href: '/work',     label: './experience.py' },
  ],
};

export const REPO_URL   = `https://github.com/${owner.github}/${owner.repo}`;
export const REPO_BASE  = `${REPO_URL}/blob/${owner.branch}`;
export const ISSUES_URL = `${REPO_URL}/issues`;

// ─── Themes ───────────────────────────────────────────────────────────────────
export interface ThemeDef {
  id: string;
  label: string;
}

export const themes: ThemeDef[] = [
  { id: 'github-dark',  label: 'GitHub Dark' },
  { id: 'unreal',       label: 'Unreal Engine' },
  { id: 'dracula',      label: 'Dracula' },
  { id: 'ayu-dark',     label: 'Ayu Dark' },
  { id: 'ayu-mirage',   label: 'Ayu Mirage' },
  { id: 'nord',         label: 'Nord' },
  { id: 'night-owl',    label: 'Night Owl' },
  { id: 'professional', label: 'Parchment (Professional)' },
  { id: 'vscode',       label: 'VS Code Dark+' },
  { id: 'unity',        label: 'Unity Engine' },
];

// Default theme per personality — change here to update the first-visit theme
export const defaultTheme: Record<string, string> = {
  professional: 'professional',
  gamer:        'unreal',
  technical:    'github-dark',
};

// ─── Welcome (empty tabs) screen per personality ─────────────────────────────
export const welcomeScreen = {
  professional: { headline: 'Welcome back.',        sub: 'All tabs closed — open a file to continue.' },
  gamer:        { headline: 'PLAYER 1 HAS PAUSED.', sub: 'No active quests. Choose your next mission.' },
  technical:    { headline: '// workspace cleared', sub: '/* open a module to resume */' },
};

// ─── Work page headers per personality ────────────────────────────────────────
export const workPageHeaders = {
  professional: {
    title:    'Work Experience',
    subtitle: 'A record of my professional journey across game development, research, and data science.',
  },
  technical: {
    title:    'experience.py',
    subtitle: `# ${owner.yearsExperience} years of C++ game engineering, ML research, and data pipelines across industry and academia.`,
  },
  gamer: {
    title:    '📋 career.log',
    subtitle: `ACTIVE QUESTS: 1  ·  COMPLETED: 4  ·  TOTAL XP: ${owner.yearsExperience} years  ·  CURRENT FACTION: ${owner.company}`,
  },
};
