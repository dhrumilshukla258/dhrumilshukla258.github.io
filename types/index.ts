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

// ─── Resume (printable /resume page) ─────────────────────────────────────────

export interface ResumeContact {
  icon: string;
  label: string;
  href?: string;
}

export interface ResumeSkillGroup {
  label: string;
  items: string;
}

export interface ResumeEducationEntry {
  degree: string;
  school: string;
  dates: string;
}

export interface ResumePublication {
  title: string;
  date: string;
  authors: string;
  technologies: string;
}

export interface ResumeSubGroup {
  label: string;
  bullets: string[];
}

export interface ResumeJob {
  title: string;
  company: string;
  companyHref?: string;
  dates: string;
  bullets: string[];
  subGroups?: ResumeSubGroup[];
}

export interface ResumeProject {
  title: string;
  dates: string;
  bullets: string[];
  href?: string;
}

export interface ResumeData {
  name: string;
  role: string;
  contacts: ResumeContact[];
  profile: string;
  skills: ResumeSkillGroup[];
  education: ResumeEducationEntry[];
  publications: ResumePublication[];
  experience: ResumeJob[];
  projects: ResumeProject[];
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
