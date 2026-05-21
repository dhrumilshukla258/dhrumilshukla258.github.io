// ─── Work Experience ──────────────────────────────────────────────────────────

export interface WorkProfessional {
  overview: string;
  description: string[];
}

export interface WorkTechnical {
  overview: string;
  description: string[];
}

export interface WorkGamer {
  title: string;       // fun job title shown on the card
  overview: string;
  highlights: string[];
}

export interface WorkExp {
  slug: string;
  company: string;
  jobtitle: string;
  link: string;
  startDate: Date;
  endDate?: Date | null;
  techStack: string[];
  techLogo: string[];
  professional: WorkProfessional;
  technical: WorkTechnical;
  gamer: WorkGamer;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface ProjectProfessional {
  title: string;
  overview: string;
  description: string[];
}

export interface ProjectTechnical {
  title: string;
  overview: string;
  description: string[];
  architectureDiagram?: string;
}

export interface ProjectGamer {
  title: string;
  overview: string;
  highlights: string[];
}

export interface Project {
  slug: string;
  link: string;
  startDate?: Date;
  endDate?: Date | null;
  techLogo?: string[];
  professional: ProjectProfessional;
  technical: ProjectTechnical;
  gamer: ProjectGamer;
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

export interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  watchers: number;
  forks: number;
  stargazers_count: number;
  html_url: string;
  homepage: string;
}

export interface User {
  login: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
}
