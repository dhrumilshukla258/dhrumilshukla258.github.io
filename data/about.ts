// ─── About page content ───────────────────────────────────────────────────────
// Edit the text here; the component reads it all dynamically.

export const aboutProfessional = {
  paragraphs: [
    `It started with games. As a kid I was more interested in what was happening under the hood than on screen — cracking open a hex editor to hunt for cheat codes, changing bytes, watching the numbers in-game shift. That moment of "wait, I can control this" led to a first "Hello, World" in C, which led to an obsession that never really switched off.`,
    `I love the creative side of engineering — the part where you go from a blank screen to something that actually does something. I thrive in collaborative sessions: whiteboard design discussions, debating trade-offs, iterating on ideas with teammates. That same curiosity bleeds into everything else — I've taught myself an ortholinear keyboard layout just to see if I could, and I genuinely enjoy tinkering with home infrastructure purely for the challenge of it.`,
  ],
  outsideOfWork: `I play a lot of video games — it's both a hobby and honestly useful context for working in the industry. Tennis and skating are my go-to ways to step away from screens. I track almost every movie I watch on Letterboxd, which has become its own rabbit hole. And I run a home server that keeps getting more services added to it, which I tell myself is "infrastructure practice."`,
};

export const aboutTechnical = {
  currentlyCurious: [
    {
      label: 'Local LLM inference tuning',
      desc: 'Running Ollama on homelab hardware — quantization, context window tradeoffs, prompt caching',
    },
    {
      label: 'Self-hosted everything',
      desc: 'Replacing cloud services one Docker container at a time — OpenCloud, Jellyfin, Sunshine, Collabora',
    },
  ],
  // Fields used in the generated code block (see about.tsx)
  editorName: 'VS Code (obviously)',
  shell:      'zsh + tmux',
  homelab:    'Proxmox + Docker + XFS/mergerfs + too many services',
  currentReads: ['local LLM inference', 'self-hosting everything'],
};

export const aboutGamer = {
  charStats: [
    { label: 'FIRST GAME',  value: 'Hex Editor + Cheat Codes' },
    { label: 'ARCHETYPE',   value: 'Explorer / Tinkerer' },
    { label: 'MAIN HOBBY',  value: 'Video Games' },
    { label: 'KEYBOARD',    value: 'Ortholinear + Engram' },
  ],
  videoGames: [
    { icon: '🏀', label: 'NBA 2K Series',   desc: 'Worked on it AND plays it. The lore goes deep.' },
    { icon: '🧱', label: 'LEGO 2K Drive',   desc: "Built it, raced in it. Yes, that's a flex." },
    { icon: '🌍', label: 'The Last of Us',  desc: 'Peak storytelling. Joel was right.' },
    { icon: '🍳', label: 'Overcooked',      desc: 'Has caused more real-life arguments than any other game.' },
  ],
  boardGames: [
    { icon: '🏜️', label: 'Dune Imperium',  desc: 'Deck-building meets worker placement. The spice must flow.' },
    { icon: '🟦', label: 'Azul',            desc: 'Deceptively serene tile-drafting game. Ruthlessly cut off your opponents.' },
    { icon: '🚂', label: 'Ticket to Ride',  desc: 'Classic. Someone always blocks your route. Always.' },
    { icon: '⏳', label: 'Anachrony',       desc: 'Time-travel resource management. Surprisingly not as confusing as it sounds.' },
  ],
  offDuty: [
    { icon: '🎾', label: 'Tennis',                desc: 'Casual ranked. Strong forehand. Questionable backhand.' },
    { icon: '🛼', label: 'Skating',               desc: 'Best way to AFK from screens without actually logging off.' },
    { icon: '🎬', label: 'Movies (Letterboxd)',   desc: 'Logs everything. Has opinions. Will recommend a film unprompted.' },
    { icon: '🖥️', label: 'Home Lab',             desc: 'Self-hosting things no one asked for. On purpose. For fun.' },
    { icon: '⌨️', label: 'Ortholinear Keyboard', desc: 'Engram layout on a columnar stagger board. Peak nerd activity.' },
  ],
  originStory: [
    `The first cheat code wasn't typed — it was found. Opened a hex editor on a game save file as a kid, changed some bytes, and the numbers in-game changed too. That was the moment. Shortly after: first C program, `,
    `printf("Hello, World\\n")`,
    `, compiled, ran. Obsession unlocked. Been farming code XP ever since.`,
  ],
  originStory2: `Loves building things, breaking things, and understanding why they broke. Plays too many games, watches too many movies, and runs a home server that keeps getting more services added to it. No regrets.`,
};

// ─── Onboarding modal personality cards ───────────────────────────────────────
export const personalityCards = [
  {
    type:    'professional' as const,
    label:   'Professional',
    tagline: "Clean, formal, résumé-ready. See my experience through a recruiter's lens.",
    icon:    '/personality/professional.png',
  },
  {
    type:    'gamer' as const,
    label:   'Gamer',
    tagline: 'XP, achievements, and side quests. See my story the way I actually live it.',
    icon:    '/personality/gamer.png',
  },
  {
    type:    'technical' as const,
    label:   'Technical',
    tagline: 'Raw specs, stack decisions, and implementation depth — for engineers.',
    icon:    '/personality/technical.png',
  },
];
