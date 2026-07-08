import { ResumeData } from '@/types';

// Single source of truth for the printable /resume page.
// Wrap terms in *asterisks* for italics (e.g. game titles) — rendered by renderBullet() in pages/resume.tsx.
export const resume: ResumeData = {
  name: 'Dhrumil Shukla',
  role: 'Software Engineer',

  contacts: [
    { icon: '@', label: 'dhrumilshukla258@gmail.com', href: 'mailto:dhrumilshukla258@gmail.com' },
    { icon: '☎', label: '+1-437-376-5756', href: 'tel:+14373765756' },
    { icon: '●', label: 'ON, Canada' },
    { icon: 'in', label: 'linkedin/dhrumilshukla258', href: 'https://www.linkedin.com/in/dhrumilshukla258/' },
    { icon: '🔗', label: 'dhrumilshukla258.github.io', href: 'https://dhrumilshukla258.github.io' },
    { icon: 'gh', label: 'github/dhrumilshukla258', href: 'https://github.com/dhrumilshukla258' },
  ],

  profile:
    'As a skilled Software Engineer, I excel at breaking down complex problems into manageable subtasks. ' +
    'My 5+ years at Visual Concepts involved contributions to gameplay elements, shader code, user interface, ' +
    'profiling tools, code reviews, and critical bug resolution. I thrive on collaboration with engineers, ' +
    'artists, producers and players, fostering innovative problem-solving approaches. My technical expertise ' +
    'includes software design, architecture, memory management, multithreading, and code optimization. ' +
    'Outside of work, I\'m passionate about personal projects, such as building a home lab and exploring ' +
    'game development with Unity and Unreal.',

  skills: [
    { label: 'Programming Languages', items: 'C++, Python, C#, Shell, AngleScript' },
    { label: 'APIs', items: 'STL, C++ Threads, Boost, OpenGL, OpenCV, Cartopy, Scipy, Scikit-learn, Pandas, Numpy, OpenCL, Python Multiprocessing, TensorFlow, Keras, PyTorch' },
    { label: 'Tools & IDE', items: 'Visual Studio, Anaconda, CMake, Unity, Unreal, Jira, Confluence, Shotgrid, Helix ALM' },
    { label: 'Version Control & DB Systems', items: 'Git, Perforce, MySQL, SQL Server, MongoDb' },
  ],

  education: [
    {
      degree: 'Master of Science in Computer Science,',
      school: 'DigiPen Institute of Technology',
      dates: 'Sep 2018 – Dec 2020 | Redmond, USA',
    },
    {
      degree: 'Bachelor of Engineering in Computer Engineering,',
      school: 'Gujarat Technological University',
      dates: 'Aug 2014 – May 2018 | Ahmedabad, India',
    },
  ],

  publications: [
    {
      title: 'Clustering analysis of multi-channel microwave satellite imagery to classify tropical cyclone intensity.',
      date: 'Dec 15, 2020',
      authors: 'Shukla, Dhrumil & Solorzano, Natalia & Bede, Barnabas & Thomas, Jeremy & Bracy, Connor. (2020).',
      technologies: 'Image Processing, Sensor Data, Cluster Analysis, Python, OpenCV, Cartopy, MATLAB',
    },
  ],

  experience: [
    {
      title: 'Software Engineer,',
      company: 'Visual Concepts Entertainment',
      companyHref: 'https://vcentertainment.com/',
      dates: 'Oct 2020 – present | Toronto, ON, Canada; Irvine, CA, USA',
      bullets: [
        'Successfully shipped *NBA 2K* starting from 2022, *Lego 2K Drive* for PS5, Xbox Series X, PS4, Xbox One, Switch and PC',
      ],
      subGroups: [
        {
          label: '*NBA 2K*:',
          bullets: [
            'Engineered diverse gameplay and UI elements, including overlays, menus, and camera systems, across multiple online and offline game modes',
            'Successfully migrated features between different gaming platforms, ensuring a consistent player experience',
            'Integrated innovative features including Instant Replay, Photo Moments, Highlight Builder, seamless Activity transitions and the engaging Quest system within the open world, empowering players with a wide range of interactive capabilities',
            'Resolved complex engine and gameplay bugs during the critical release phase, ensuring a polished and stable gaming experience',
            'Provided technical assistance to artists, streamlining their workflow within our proprietary world editors',
            'Leveraged in-house GPU Profiler to diagnose graphics and UI performance, utilized Gooey tool for efficient overlay management, and employed the Director tool to analyze and dynamically modify events and records during gameplay',
          ],
        },
        {
          label: '*Lego 2K Drive*:',
          bullets: [
            'Engineered in-game navigation: Utilized Unreal Engine and Blueprints to develop robust marker and fast travel systems, enhancing player navigation',
            'Enhanced map customization: Implemented filter settings to allow players to tailor their world map view according to preferences, improving immersion',
            'Improved vehicle handling in max speed zones thereby providing players better car control',
          ],
        },
      ],
    },
  ],

  projects: [
    {
      title: 'Home Lab',
      dates: 'Oct 2023 – Present',
      href: 'https://github.com/dhrumilshukla258',
      bullets: [
        'Deployed a Proxmox hypervisor to spin up, stress-test, and inevitably smash bleeding-edge linux environments keeping the chaos safely isolated so the household internet stays alive.',
        'Containerized 15+ microservices and private Ollama LLMs via Docker, optimizing local resource allocation and token streaming like a strict system admin protecting server tick rates.',
        'Wrote Python scripts and SQL pipelines to eliminate life\'s boring bits, turning manual budgeting and server health telemetry into automated background tasks.',
      ],
    },
  ],
};
