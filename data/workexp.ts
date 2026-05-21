import { WorkExp } from '@/types';

export const workexp: WorkExp[] = [
  {
    slug: 'VisualConceptsEntertainment',
    company: 'Visual Concepts Entertainment — 2K Games',
    jobtitle: 'Software Engineer',
    link: 'https://vcentertainment.com/',
    startDate: new Date('2020-10-05'),
    techStack: ['Proprietary Engine', 'C++-like', 'Unreal Engine', 'Perforce', 'Helix'],
    techLogo: ['/logos/file_type_cpp3.svg', '/logos/file_type_helix.svg'],

    professional: {
      overview: 'Shipped NBA 2K (2022–present) and LEGO 2K Drive across PS5, Xbox Series X, PS4, Xbox One, Switch, and PC.',
      description: [
        'Engineered gameplay and UI elements — overlays, menus, and camera systems — in Visual Concepts\' proprietary engine across online and offline NBA 2K game modes',
        'Shipped Instant Replay, Photo Moments, Highlight Builder, Activity transitions, and the open-world Quest system',
        'Built in-game navigation, fast travel, and map filter systems for LEGO 2K Drive using Unreal Engine and Blueprints',
        'Resolved complex engine and gameplay bugs during critical release phases, ensuring polished player experience',
        'Leveraged in-house GPU Profiler, Gooey, and Director tools for performance diagnostics and live gameplay debugging',
      ],
    },

    technical: {
      overview: 'Gameplay and UI engineering in Visual Concepts\' proprietary engine (C++-like) across console/PC platforms; Unreal Engine for LEGO 2K Drive.',
      description: [
        'Implemented gameplay and UI systems in Visual Concepts\' proprietary engine (C++-like scripting) — overlays, menus, camera rigs across online/offline modes',
        'Integrated Instant Replay, Photo Moments, Highlight Builder using proprietary engine APIs; wired Activity transitions and open-world Quest system',
        'Shipped LEGO 2K Drive features via Unreal Engine + Blueprints: marker navigation, fast travel, and map filter state management',
        'Platform-ported features across PS5, Xbox Series X, PS4, Xbox One, Switch, and PC — resolved cross-platform rendering and compatibility issues',
        'Used in-house GPU Profiler for frame-time budgeting, Gooey for overlay management, and Director for live event inspection',
      ],
    },

    gamer: {
      title: '⚔️ Code Warrior @ Visual Concepts / 2K Games',
      overview: 'Shipped code into games you\'ve actually played. NBA 2K, LEGO 2K Drive — built the menus, cameras, and open-world systems that players click, cheer, and rage-quit on.',
      highlights: [
        '🏆 Shipped NBA 2K starting 2022 — millions of players ran this code',
        '🗺️ Built Quest system & fast travel in LEGO 2K Drive open world',
        '📸 Shipped Instant Replay, Photo Moments & Highlight Builder',
        '⚡ Ported features to PS5, Xbox Series X, Xbox One, Switch & PC',
        '🔧 Fixed critical engine bugs 48 hours before gold master',
      ],
    },
  },

  {
    slug: 'DigipenResearchAssistant',
    company: 'DigiPen Institute of Technology',
    jobtitle: 'Research Assistant — Data Visualization & Machine Learning',
    link: 'https://www.digipen.edu/',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-08-31'),
    techStack: ['Python', 'OpenCV', 'Cartopy', 'Scikit-learn', 'MATLAB', 'Jupyter'],
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg'],

    professional: {
      overview: 'Masters thesis research: clustering analysis on tropical cyclone microwave satellite imagery, resulting in a published paper (Dec 2020).',
      description: [
        'Extracted, cleaned, and analyzed brightness temperature data from SSMIS satellite imagery of tropical cyclones',
        'Parallelized image generation pipeline using Python multiprocessing, reducing processing time by 75%',
        'Evaluated K-Means, DBSCAN, and Hierarchical clustering for tropical cyclone intensity classification',
        'Co-authored: "Clustering analysis of multi-channel microwave satellite imagery to classify tropical cyclone intensity" (Dec 2020)',
      ],
    },

    technical: {
      overview: 'Python ML pipeline processing SSMIS satellite brightness temperature data; parallel image generation + clustering evaluation.',
      description: [
        'Parsed and cleaned SSMIS satellite NetCDF/HDF files; engineered brightness temperature feature arrays with NumPy and Cartopy projections',
        'Benchmarked K-Means, DBSCAN, and Agglomerative Hierarchical clustering — evaluated with Silhouette Score and Davies-Bouldin Index',
        'Parallelized Matplotlib image rendering across N CPU cores using Python multiprocessing — 4× throughput improvement',
        'OpenCV-based preprocessing pipeline: normalization, noise reduction, and channel stacking for multi-band microwave composites',
      ],
    },

    gamer: {
      title: '🌀 Data Wizard @ DigiPen Research Lab',
      overview: 'Turned a mountain of NASA satellite data into published science. Cyclones, machine learning, and Python scripts that needed 4× the CPU — a boss-rush research gauntlet.',
      highlights: [
        '🌀 Built a cyclone Pokédex — classified intensity with clustering ML',
        '⚡ 4× multiprocessing speedrun — new pipeline throughput PB',
        '📄 Published paper in Dec 2020 — peer-review final boss: defeated',
        '🛰️ Data sourced from actual orbiting SSMIS satellites',
      ],
    },
  },

  {
    slug: 'NorthWestResearchAssociates',
    company: 'Northwest Research Associates',
    jobtitle: 'Data Science Intern',
    link: 'https://www.nwra.com/',
    startDate: new Date('2019-09-03'),
    endDate: new Date('2019-12-13'),
    techStack: ['Python', 'MATLAB', 'Tableau', 'Jupyter', 'Scikit-learn'],
    techLogo: ['/logos/file_type_python.svg', '/logos/file_type_jupyter.svg'],

    professional: {
      overview: 'Data engineering and analysis on NASA lightning and microwave satellite datasets for atmospheric science research.',
      description: [
        'Processed raw datasets from NASA and partner institutes on lightning and microwave sensors, converting them to images using MATLAB and Python',
        'Segregated cyclone images by intensity using ML techniques and domain knowledge of atmospheric science',
        'Delivered statistical and graphical analysis using Tableau and matplotlib',
      ],
    },

    technical: {
      overview: 'Converted NASA raw satellite data (Lightning Imaging Sensor + SSMIS) into labeled image datasets using MATLAB/Python pipelines.',
      description: [
        'Ingested NASA LIS and SSMIS raw binary datasets; reprojected geolocation data using MATLAB mapping toolbox and Cartopy',
        'Applied supervised ML classification (Scikit-learn) to label cyclone images by Saffir-Simpson intensity category',
        'Built Tableau dashboards and matplotlib visualizations for atmospheric feature distributions and model accuracy metrics',
      ],
    },

    gamer: {
      title: '🛰️ Science Intern @ NW Research Associates',
      overview: 'NASA handed us raw satellite data. We turned it into images and insights — like decoding cheat codes, except the cheat codes were cyclone intensity levels.',
      highlights: [
        '🛰️ Processed NASA lightning & microwave satellite data — actual space stuff',
        '🤖 ML-classified cyclone images by intensity — automated the grind',
        '📊 Tableau + matplotlib dashboards for atmospheric analysis',
      ],
    },
  },

  {
    slug: 'DigipenTAAlgorithms',
    company: 'DigiPen Institute of Technology',
    jobtitle: 'Teaching Assistant — Algorithms & Data Structures',
    link: 'https://www.digipen.edu/',
    startDate: new Date('2019-05-01'),
    endDate: new Date('2020-07-31'),
    techStack: ['C++', 'Shell', 'Algorithms'],
    techLogo: ['/logos/file_type_c.svg', '/logos/file_type_cpp3.svg'],

    professional: {
      overview: 'Supported Prof. Dmitri Volper with Algorithm Analysis coursework — grading, assignment design, and automated infrastructure.',
      description: [
        'Assisted students and graded assignments on Algorithm Analysis under Prof. Dmitri Volper',
        'Designed assignments covering searching, sorting, and sweepline algorithms',
        'Automated grading pipeline with shell scripts, reducing manual overhead significantly',
      ],
    },

    technical: {
      overview: 'Shell-scripted automated grading system; designed algorithm assignments covering O(n log n) sorting, sweep-line geometry, and search.',
      description: [
        'Authored shell scripts to batch-compile, run, and diff student submissions against reference outputs — zero manual grading for correctness checks',
        'Designed problem sets on comparison-based sorting, O(n log n) algorithms, binary search variants, and plane sweep for computational geometry',
        'Held office hours debugging students\' C++ implementations of trees, heaps, and graph traversal',
      ],
    },

    gamer: {
      title: '🎓 Algorithm Sensei @ DigiPen',
      overview: 'Guided students through the algorithm dungeon. Designed quests on sorting and sweepline — then wrote shell scripts to automate the loot drops (grades).',
      highlights: [
        '⚙️ Shell-scripted automated grading — removed the manual grind',
        '🗺️ Designed assignments on Searching, Sorting & Sweepline Algos',
        '🎓 Helped students survive the algorithm dungeon',
      ],
    },
  },

  {
    slug: 'DigipenTAPhysics',
    company: 'DigiPen Institute of Technology',
    jobtitle: 'Teaching Assistant — Physics Department',
    link: 'https://www.digipen.edu/',
    startDate: new Date('2019-01-07'),
    endDate: new Date('2019-05-31'),
    techStack: ['Physics', 'Lab Supervision'],
    techLogo: ['/logos/file_type_vscode.svg'],

    professional: {
      overview: 'Supervised the Motion Dynamics Lab and supported students with physics experiments and lab report grading.',
      description: [
        'Supervised the Motion Dynamics Lab; guided students through experiments',
        'Graded lab reports under the professor\'s guidance',
      ],
    },

    technical: {
      overview: 'Motion dynamics lab supervision; graded reports on Newtonian mechanics, kinematics, and energy conservation experiments.',
      description: [
        'Supervised Motion Dynamics Lab — kinematics, Newton\'s laws, energy/momentum conservation experiments',
        'Graded lab reports evaluating data analysis, error propagation, and methodology',
      ],
    },

    gamer: {
      title: '🔬 Lab Warden @ DigiPen Physics',
      overview: 'Ran the Motion Dynamics Lab. Helped students survive real-world physics experiments and kept the professor\'s quest log clear.',
      highlights: [
        '🔬 Supervised Motion Dynamics Lab experiments',
        '📋 Graded lab reports — cleared the professor\'s queue',
      ],
    },
  },
];
