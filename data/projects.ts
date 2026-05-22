import { Project } from '@/types';

export const projectPageHeaders = {
  professional: {
    title: 'Personal Projects',
    subtitle: 'A curated selection of projects spanning game development, data science, systems programming, and web development.',
  },
  technical: {
    title: 'projects.cpp',
    subtitle: '// A collection of shipped code — engines, ML pipelines, automation tools, and full-stack systems.',
  },
  gamer: {
    title: '🏗️ builds.dat',
    subtitle: 'MISSIONS COMPLETED: 9  ·  TECH UNLOCKED: C++, Python, Unity, C#, Java  ·  PLATFORMS: PS5 · Xbox · PC · Android · iOS',
  },
};

export const projects: Project[] = [
  {
    slug: 'vscode-portfolio',
    link: 'https://github.com/dhrumilshukla258/dhrumilshukla258.github.io',
    startDate: new Date('2025-03-15'),
    techLogo: ['/logos/file_type_vscode.svg'],

    professional: {
      title: 'VSCode Themed Portfolio Website',
      overview: 'An interactive developer portfolio faithfully mimicking the VS Code editor UI — built with Next.js, TypeScript, and CSS Modules.',
      description: [
        'Designed the portfolio as a VS Code editor: functional sidebar, tabbed navigation, title bar, and status bar',
        'Implemented three personality modes (Professional, Technical, Gamer) that dynamically transform all page content',
        'Integrated the GitHub REST API for live repository stats and contribution calendar',
        'Supports 8 VS Code themes via CSS custom properties; fully responsive across desktop and mobile',
      ],
    },

    technical: {
      title: 'VSCode Themed Portfolio Website',
      overview: 'Next.js 15 SSG site with a React Context–driven personality system, 8-theme CSS variable architecture, and GitHub REST API integration.',
      description: [
        'Static generation via Next.js 15 — all pages pre-rendered at build time for zero server cost',
        'PersonalityContext (React Context API) propagates personality state globally; components subscribe and re-render on switch',
        'CSS custom property cascade implements 8 VS Code themes — single :root swap triggers full repaint across all modules',
        'GitHub REST API fetched client-side on the /github route — repos, star counts, and contribution calendar rendered live',
      ],
      architectureDiagram:
`  Next.js 15 (Static Site Generation)
  ┌──────────────────────────────────────┐
  │  pages/                             │
  │  ├─ index.tsx    (home.c)           │
  │  ├─ work.tsx     (experience.py)    │
  │  ├─ projects.tsx (projects.cpp)     │
  │  ├─ about.tsx    (about.json)       │
  │  └─ github.tsx   (github.md)        │
  │                                     │
  │  PersonalityContext (React Context) │
  │  └─ professional / technical / gamer│
  │                                     │
  │  8 VS Code themes via CSS variables │
  └──────────────────────────────────────┘
  GitHub REST API
  └─ repos + stats + contribution calendar`,
    },

    gamer: {
      title: 'Built the most meta portfolio ever',
      overview: 'Made a portfolio that IS a code editor. Recruiters open it and go "wait what?" — mission accomplished. Pick your fighter: Professional, Technical, or Gamer.',
      highlights: [
        '🎨 3 personality modes — pick your fighter',
        '🌙 8 VS Code themes because one is never enough',
        '📱 Fully responsive — even phones deserve this',
        '🔗 Live GitHub stats — no static screenshots here',
      ],
    },
  },

  {
    slug: 'home-lab',
    link: 'https://github.com/dhrumilshukla258',
    startDate: new Date('2023-10-01'),
    techLogo: ['/logos/file_type_python.svg'],

    professional: {
      title: 'Home Lab',
      overview: 'A self-hosted home server running a Proxmox hypervisor with 15+ containerized services including private cloud storage, media streaming, game streaming, and local AI inference.',
      description: [
        'Deployed Proxmox hypervisor on repurposed hardware with XFS + mergerfs storage pool spanning multiple HDDs',
        'Self-hosted OpenCloud (open cloud), Collabora Office, Jellyfin media server, and Moonlight/Sunshine game streaming',
        'Containerized 15+ microservices via Docker including private Ollama LLM instances for local AI inference',
      ],
    },

    technical: {
      title: 'Home Lab',
      overview: 'Proxmox-based bare-metal hypervisor with XFS + mergerfs storage, Docker service stacks, and a full self-hosted open-source cloud suite.',
      description: [
        'Proxmox VE on repurposed x86 hardware — XFS filesystems on spare HDDs pooled via mergerfs for unified storage mount',
        'Docker Compose stacks: OpenCloud (open cloud), Collabora Office, Jellyfin, Moonlight/Sunshine game streaming, Ollama LLMs',
        'Tailscale VPN + Nginx reverse proxy for secure remote access; Python/shell scripts for health monitoring and telemetry',
      ],
      architectureDiagram:
`  Hardware: Repurposed Laptop + Spare HDDs
  Storage:  XFS on each HDD → mergerfs pool
           │
           ▼
  Proxmox VE Hypervisor
  ┌──────────────────────────────────────┐
  │  VM-1: Linux Dev Environments        │
  │  VM-2: Docker Host                   │
  │    ├─ OpenCloud (Open Cloud)         │
  │    ├─ Collabora Office               │
  │    ├─ Jellyfin (Media Server)        │
  │    ├─ Sunshine (Game Streaming)      │
  │    ├─ Ollama LLM (local AI)          │
  │    └─ + other microservices          │
  │  VM-3: Network / DNS / VPN           │
  │    ├─ Tailscale                      │
  │    └─ Nginx Reverse Proxy            │
  └──────────────────────────────────────┘`,
    },

    gamer: {
      title: 'Built a home server from scratch',
      overview: 'Took an old laptop and spare HDDs and turned them into a full homelab. Proxmox, XFS + mergerfs storage, private cloud, media server, game streaming, and local AI. Household internet: still alive.',
      highlights: [
        '☁️ OpenCloud open cloud + Collabora Office — no Google needed',
        '🎮 Moonlight / Sunshine game streaming to any device',
        '🎬 Jellyfin media server — personal Netflix',
        '🤖 Private Ollama LLMs — local AI, no cloud bill',
        '💾 XFS + mergerfs storage pool across spare HDDs',
        '🔒 Tailscale VPN + Nginx for secure remote access',
      ],
    },
  },

  {
    slug: 'BellyBlaster',
    link: 'https://github.com/augdirt/BellyBlaster',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    techLogo: ['/logos/file_type_csharp2.svg'],

    professional: {
      title: 'Belly Blaster',
      overview: 'A 2D fighting game built in Unity for a gender reveal party, shipping on Windows and Mac with generative AI assets.',
      description: [
        'Built a 2D fighting game in Unity targeting Windows and Mac for a live event with real players',
        'Delivered smooth character behaviour, input handling, and physics-based combat for a fun multiplayer experience',
        'Used generative AI to produce character animations and environment assets, eliminating art production cost',
        'Shipped a complete product — round management, scoring, leaderboard, and game-over screen — on a tight timeline',
      ],
    },

    technical: {
      title: 'Belly Blaster',
      overview: 'Unity 2D fighting game with GenAI art pipeline, Rigidbody physics combat, and a state-machine driven game loop shipping cross-platform.',
      description: [
        'Unity 2D project targeting Windows + Mac via Unity Build System; single codebase, two platform targets',
        'Game state machine: Menu → Fight → Results; managed via Unity\'s Animator state graphs and C# GameManager singleton',
        'Combat: Rigidbody2D + PolygonCollider2D for hitboxes; frame-data-driven attack windows via coroutines',
        'GenAI pipeline: generated character sprite sheets and tiled environment art; imported as TextureAtlas with Unity Sprite Editor slicing',
      ],
      architectureDiagram:
`  Unity Engine (2D — Windows + Mac)
  ┌──────────────────────────────────┐
  │  Game State Machine (C#)        │
  │  ┌──────┬────────┬───────────┐  │
  │  │ Menu │ Fight  │ Game Over │  │
  │  └──────┴────────┴───────────┘  │
  │                                 │
  │  Character System               │
  │  ├─ Rigidbody2D + Colliders    │
  │  ├─ Input System (new)          │
  │  └─ Animator + Sprite Atlas    │
  │                                 │
  │  GenAI Art Pipeline             │
  │  └─ Sprite sheets + env assets  │
  └──────────────────────────────────┘
  Platforms: Windows · Mac`,
    },

    gamer: {
      title: 'Shipped a party game for a gender reveal',
      overview: 'My sister needed a game for her gender reveal party. Built a 2D Unity fighting game. It was a hit. The baby hadn\'t arrived and already had a game made for them.',
      highlights: [
        '🎉 Shipped for a live event with real live players',
        '🤖 GenAI character animations — no art budget needed',
        '🏆 Rounds, scoring, leaderboard, game-over screen',
        '👶 0 bugs reported by gender reveal attendees',
      ],
    },
  },

  {
    slug: 'spend-tracker',
    link: 'https://github.com/dhrumilshukla258',
    startDate: new Date('2023-05-01'),
    endDate: new Date('2023-05-31'),
    techLogo: ['/logos/file_type_python.svg'],

    professional: {
      title: 'Spend Tracker',
      overview: 'A personal finance tool that parses bank statement PDFs and generates automated spending analysis and trend reports.',
      description: [
        'Used PyMuPDF to parse and extract transactions, amounts, and categories from PDF bank statements',
        'Implemented data validation and quality control to ensure accuracy before analysis',
        'Generated spending breakdowns by category and monthly trend charts for personal financial insights',
      ],
    },

    technical: {
      title: 'Spend Tracker',
      overview: 'PyMuPDF-based PDF extraction pipeline with validation layer and matplotlib/pandas reporting backend.',
      description: [
        'PyMuPDF (fitz) for layout-aware PDF parsing — extracts table rows, merchant names, and amounts using bounding-box heuristics',
        'Pandas DataFrame pipeline for deduplication, category tagging via regex rules, and outlier flagging',
        'matplotlib + seaborn for stacked bar charts (spend by category) and line charts (monthly trends)',
      ],
      architectureDiagram:
`  Input: PDF Bank Statements
           │
           ▼  PyMuPDF (fitz)
  ┌─────────────────────────────┐
  │  Data Extraction            │
  │  ├─ Transaction amounts     │
  │  ├─ Merchant names          │
  │  └─ Categories + dates      │
  └─────────────┬───────────────┘
                │
                ▼  Pandas
  ┌─────────────────────────────┐
  │  Validation & Cleaning      │
  │  ├─ Dedup + regex tagging   │
  │  └─ Outlier detection       │
  └─────────────┬───────────────┘
                │
                ▼  matplotlib · seaborn
  ┌─────────────────────────────┐
  │  Analysis & Reporting       │
  │  ├─ Spend by category       │
  │  └─ Monthly trend charts    │
  └─────────────────────────────┘`,
    },

    gamer: {
      title: 'Built a tool to analyze my own spending',
      overview: 'Tired of wondering where my money went. Built a Python tool that parses bank statement PDFs and shows exactly where it all went. Spoiler: food.',
      highlights: [
        '📄 Auto-parses bank statement PDFs — no manual entry',
        '🔍 Validates and cleans data before analysis',
        '📊 Spending by category + monthly trends',
      ],
    },
  },

  {
    slug: 'masters-thesis',
    link: 'https://github.com/dhrumilshukla258/Thesis-Code',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-08-31'),
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg'],

    professional: {
      title: 'Masters Thesis — Tropical Cyclone Clustering',
      overview: 'Published ML research classifying tropical cyclone intensity via clustering of multi-channel SSMIS microwave satellite imagery (Dec 2020).',
      description: [
        'Extracted and cleaned brightness temperature data from SSMIS satellite imagery of tropical cyclones',
        'Applied K-Means, DBSCAN, and Hierarchical clustering to categorize cyclone structure patterns',
        'Parallelized image generation pipeline with Python multiprocessing, cutting runtime by 75%',
        'Co-authored published paper: "Clustering analysis of multi-channel microwave satellite imagery to classify tropical cyclone intensity" (Dec 2020)',
      ],
    },

    technical: {
      title: 'Masters Thesis — Tropical Cyclone Clustering',
      overview: 'Python ML pipeline on SSMIS NetCDF satellite data: parallel image generation + multi-algorithm clustering evaluation, resulting in a published paper.',
      description: [
        'Parsed SSMIS NetCDF/HDF files; projected brightness temperature channels onto geographic grids with Cartopy and NumPy',
        'Benchmarked K-Means, DBSCAN, and Agglomerative Hierarchical clustering — evaluated with Silhouette Score and Davies-Bouldin Index',
        'Python multiprocessing pool for parallel Matplotlib render jobs — 4× throughput on multi-core hardware',
        'OpenCV pipeline for preprocessing: per-channel normalization, noise reduction, and multi-band composite stacking',
      ],
      architectureDiagram:
`  Input: SSMIS Satellite Brightness Temp. (NetCDF)
           │
           ▼  NumPy · Cartopy
  ┌──────────────────────────────┐
  │  Extract, Project & Clean   │
  └─────────────┬────────────────┘
                │
                ▼  Python multiprocessing
  ┌──────────────────────────────────┐
  │  Parallel Image Generation       │
  │  ┌──────┬──────┬──────┬──────┐  │
  │  │ P-0  │ P-1  │ P-2  │ P-n  │  │  4× speedup
  └─────────────┬────────────────────┘
                │
                ▼  Scikit-learn
  ┌──────────────────────────────────────┐
  │  Clustering                          │
  │  K-Means │ DBSCAN │ Hierarchical     │
  └─────────────┬────────────────────────┘
                │  Silhouette · Davies-Bouldin
                ▼
  Published: cyclone intensity classification`,
    },

    gamer: {
      title: 'Defeated the final boss: tropical cyclones',
      overview: 'Two years of research, satellite data, and ML. Ran a 100% completion on tropical cyclone analysis — and published the results.',
      highlights: [
        '🌀 Cyclone Pokédex complete — ML intensity classification done',
        '⚡ 4× multiprocessing speedrun — pipeline PB set',
        '📄 Published Dec 2020 — peer-review boss: defeated',
        '🛰️ Data from actual orbiting SSMIS satellites',
      ],
    },
  },

  {
    slug: 'Robotest',
    link: 'https://github.com/dhrumilshukla258/Robotest',
    startDate: new Date('2019-01-01'),
    endDate: new Date('2019-04-30'),
    techLogo: ['/logos/file_type_cpp3.svg'],

    professional: {
      title: 'Robotest',
      overview: 'A 2.5D platformer built on a custom C++ game engine with ECS architecture and multi-threaded systems, by a team of 5.',
      description: [
        'Co-developed a 2.5D game on a custom game engine built by a team of 5 engineers at DigiPen',
        'Engine built on Entity Component System (ECS) architecture for data-driven, cache-friendly game object management',
        'Implemented a multi-threaded task pool for parallel system execution',
      ],
    },

    technical: {
      title: 'Robotest',
      overview: 'Custom C++ engine on ECS architecture with multi-thread pooling; 2.5D platformer built as the game layer by a 5-person team.',
      description: [
        'ECS implemented with component arrays (SoA layout) for cache-coherent iteration; systems query archetypes at fixed update intervals',
        'Thread pool with work-stealing queue — physics, AI, and audio systems dispatched as task graphs each frame',
        'Collision: AABB broadphase + SAT narrowphase for 2.5D contact manifold resolution',
        'Asset pipeline: custom binary format for meshes, sprites, and audio; hot-reload supported in editor mode',
      ],
      architectureDiagram:
`  Custom C++ Game Engine (ECS / SoA)
  ┌───────────────────────────────────────┐
  │  Entity   Component (SoA)  System     │
  │  ──────   ──────────────   ────────   │
  │  Player   Transform        Physics    │
  │  Enemy    Sprite           Collision  │
  │  Platform RigidBody        Renderer   │
  │           Script           Audio      │
  ├───────────────────────────────────────┤
  │  Thread Pool (work-stealing)          │
  │  ┌──────┬──────┬──────┬──────┐       │
  │  │ T-0  │ T-1  │ T-2  │ T-n  │       │
  │  └──────┴──────┴──────┴──────┘       │
  └───────────────────────────────────────┘
  Team: 5 engineers · DigiPen  Jan–Apr 2019`,
    },

    gamer: {
      title: 'Built a game engine AND a game on top',
      overview: 'Not enough to just make a game — had to build the engine too. Custom C++ ECS engine, multi-threaded systems, and a 2.5D platformer. Hard mode: engaged.',
      highlights: [
        '🔧 Custom C++ game engine — hard mode activated',
        '🧩 ECS architecture for cache-friendly game objects',
        '⚡ Multi-thread pooling — parallel system execution',
        '👥 5-engineer co-op build at DigiPen',
      ],
    },
  },

  {
    slug: 'minesweeper-solver',
    link: 'https://github.com/dhrumilshukla258/MinesweeperSolver',
    startDate: new Date('2019-09-01'),
    endDate: new Date('2019-12-31'),
    techLogo: ['/logos/file_type_cpp3.svg'],

    professional: {
      title: 'MineSweeper Solver',
      overview: 'An automated Minesweeper bot using C++ image processing and logical constraint solving — beats Expert boards on minesweeperonline.com.',
      description: [
        'Identified and parsed Minesweeper board state using image processing (OpenCV)',
        'Solved the board using constraint propagation and Proof by Contradiction logic',
        'Achieved Expert board completion in 26 seconds via automated interaction',
      ],
    },

    technical: {
      title: 'MineSweeper Solver',
      overview: 'C++ bot using OpenCV template matching for board state extraction, constraint propagation + Proof by Contradiction for solver, and OS automation for interaction.',
      description: [
        'Template matching (OpenCV) to classify each cell: numbered 1–8, blank, hidden, mine-flagged — pixel-perfect even at varying window scales',
        'Constraint-based solver: models board as a CSP; propagates number constraints across cell neighborhoods to deduce safe cells',
        'Proof by Contradiction: for ambiguous cells, temporarily assumes mine/safe and propagates to detect contradictions',
        'Win automation: OS-level mouse events sent to browser at target cell coordinates derived from board bounding box',
      ],
      architectureDiagram:
`  Screen Capture → minesweeperonline.com
           │
           ▼  OpenCV template matching
  ┌──────────────────────────────┐
  │  Board Parser                │
  │  └─ Cell state classification│
  │     (1-8 / blank / hidden)   │
  └──────────────┬───────────────┘
                 │
                 ▼  CSP + Proof by Contradiction
  ┌──────────────────────────────┐
  │  Solver                      │
  │  ├─ Constraint propagation   │
  │  ├─ Safe cell deduction      │
  │  └─ Probabilistic fallback   │
  └──────────────┬───────────────┘
                 │
                 ▼  OS mouse automation
  Expert board solved in 26 seconds`,
    },

    gamer: {
      title: 'Built a bot that beats Minesweeper Expert',
      overview: 'Minesweeper Expert mode? Defeated. C++ bot with image processing and Proof by Contradiction logic. 26 seconds. Expert board. Done.',
      highlights: [
        '💥 Expert Minesweeper solved in 26 seconds',
        '👁️ OpenCV image processing to read board state',
        '🧠 Proof by Contradiction for safe cell deduction',
      ],
    },
  },

  {
    slug: 'zombie-hunter',
    link: 'https://github.com/dhrumilshukla258/ZombieHunter',
    startDate: new Date('2018-09-01'),
    endDate: new Date('2018-12-31'),
    techLogo: ['/logos/file_type_c.svg'],

    professional: {
      title: 'Zombie Hunter',
      overview: 'A 2D zombie game built on a hand-rolled C engine with component-based architecture, custom math libraries, and a full sprite renderer.',
      description: [
        'Built a 2D game on a custom engine implementing Component-Based Architecture for optimized game data handling',
        'Designed vector, math, and matrix libraries from scratch to support AABB and circle physics',
        'Implemented textures, sprite animations, text renderer, power-ups, multiple levels, and state manager',
      ],
    },

    technical: {
      title: 'Zombie Hunter',
      overview: 'C engine with hand-rolled component system, vector/matrix math library, AABB + circle collision, and a sprite batch renderer.',
      description: [
        'Component registry maps entity IDs to typed component arrays; GameObject is a thin ID handle — zero virtual dispatch',
        'Math library: Vec2/Vec3/Mat3 with SIMD-friendly layout; AABB and circle-circle intersection with MTV resolution',
        'Sprite batch renderer: packs quads into a single VBO per texture atlas; draw call count kept minimal',
        'State manager: push/pop stack for pause → resume → restart transitions without heap allocation',
      ],
      architectureDiagram:
`  Custom C Game Engine
  (Component-Based Architecture)
  ┌────────────────────────────────────┐
  │  Component Registry                │
  │  ┌──────────┬──────────┬────────┐  │
  │  │Transform │  Sprite  │ Script │  │
  │  └──────────┴──────────┴────────┘  │
  │                                    │
  │  Math Library (hand-rolled)        │
  │  ├─ Vec2 / Vec3 / Mat3             │
  │  ├─ AABB + Circle Collision        │
  │  └─ MTV resolution                 │
  │                                    │
  │  Sprite Batch Renderer             │
  │  └─ VBO per atlas · minimal DCs   │
  └────────────────────────────────────┘
  Features: power-ups · multi-level · state stack`,
    },

    gamer: {
      title: 'Built a C engine and filled it with zombies',
      overview: 'Rolled a game engine from scratch in C — component system, vector math, collision, sprite renderer — then made a zombie game with it.',
      highlights: [
        '🧟 2D zombie game on a hand-built C engine',
        '📐 Hand-rolled Vec2/Mat3 math library',
        '💥 AABB + circle collision from first principles',
        '🎮 Power-ups, multi-level, pause/resume/restart',
      ],
    },
  },

  {
    slug: 'school-admission-system',
    link: 'https://github.com/dhrumilshukla258',
    startDate: new Date('2017-07-01'),
    endDate: new Date('2018-05-31'),
    techLogo: ['/logos/file_type_python.svg'],

    professional: {
      title: 'School Admission & Management System',
      overview: 'A full-stack web and mobile platform simplifying school admissions across 300+ institutions in Gujarat, India.',
      description: [
        'Co-developed a web application with Java and Spring Boot to streamline admissions for 300+ Gujarat schools',
        'Built a cross-platform mobile app on Angular/Ionic 3 targeting Android and iOS from a single codebase',
        'Designed a REST API with Slim Framework to synchronize data between the web portal and mobile app',
      ],
    },

    technical: {
      title: 'School Admission & Management System',
      overview: 'Angular 4 SPA + Spring Boot REST API + Ionic 3 cross-platform mobile app, synchronized via Slim Framework data layer with MySQL backend.',
      description: [
        'Angular 4 SPA with component-based routing; real-time school data fed from REST API with RxJS observable streams',
        'Spring Boot Java backend: RESTful controllers, JPA/Hibernate ORM on MySQL, DTO mapping with ModelMapper',
        'Slim Framework API as a lightweight sync layer between web and mobile clients — single source of truth for 300+ school records',
        'Ionic 3 Cordova app compiled to Android APK and iOS IPA from shared TypeScript/Angular codebase',
      ],
      architectureDiagram:
`  Angular 4 Web SPA
  ┌─────────────────────────────────┐
  │  Student & School Portal        │
  │  300+ Gujarat schools real-time │
  └──────────────┬──────────────────┘
                 │  Slim Framework REST API
                 ▼
  ┌─────────────────────────────────┐
  │  Sync Layer  (Web ↔ Mobile)    │
  └───────┬─────────────┬───────────┘
          │             │
          ▼             ▼
  Spring Boot         Ionic 3 App
  ┌────────────┐   ┌──────────────────┐
  │ Java + JPA │   │ Android + iOS    │
  │ MySQL      │   │ (single codebase)│
  └────────────┘   └──────────────────┘`,
    },

    gamer: {
      title: 'Full-stack app for 300+ schools — shipped',
      overview: 'Built a web + mobile platform handling school admissions for 300+ schools in Gujarat. Web, API, mobile — three-platform co-op run.',
      highlights: [
        '🏫 Real-time data for 300+ Gujarat schools',
        '📱 Android + iOS from one Ionic 3 codebase',
        '🔗 REST API syncs web portal + mobile app',
        '☕ Java + Spring Boot backend',
      ],
    },
  },
];
