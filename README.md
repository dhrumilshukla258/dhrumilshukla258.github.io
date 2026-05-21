# VS Code Portfolio — Dhrumil Shukla

A personal portfolio built to look and feel like Visual Studio Code, with a personality-switching system that adapts all content and styling to three modes: **Professional**, **Technical**, and **Gamer**.

Live at: [dhrumilshukla258.github.io](https://dhrumilshukla258.github.io)

## Features

- **Personality System** — switch between Professional, Technical, and Gamer modes via the settings page. Every page (Home, About, Work, Projects, Contact) adapts its copy, layout, and visual style.
- **VS Code chrome** — Titlebar, Sidebar (Explorer), Tabsbar, and Bottombar replicate the VS Code UI shell.
- **Static site** — built with `getStaticProps` throughout; deploys to GitHub Pages as a fully static export.

## Tech Stack

- **Next.js 15** (Pages Router, Static Site Generation)
- **React 19**
- **TypeScript 5**
- **CSS Modules** (theme via CSS custom properties)

## Project Structure

```
pages/          # Route pages (index, work, projects, about, contact, github, settings)
components/     # UI shell (Titlebar, Tabsbar, Sidebar, Layout, WorkCard, ProjectCard, ...)
data/           # Content files
  workexp.ts    # Work experience entries
  projects.ts   # Project entries
  contacts.ts   # Contact links
styles/         # CSS Modules per component/page
public/logos/   # SVG icons used in tabs and cards
```

## Personality System

Each page reads `usePersonality()` from `PersonalityContext` and renders personality-keyed content. Data files use sub-objects:

```ts
// data/workexp.ts
{
  professional: { overview, description[] },
  technical:    { overview, description[] },
  gamer:        { title, overview, highlights[] },
}
```

To change the active personality, visit `/settings` in the running app.

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
npx tsc --noEmit  # type check
```

## Customizing Content

| What to change | Where |
|---|---|
| Work experience | `data/workexp.ts` |
| Projects | `data/projects.ts` |
| Contact links | `data/contacts.ts` |
| Page copy | `pages/*.tsx` (each page has per-personality sections) |
| Sidebar file tree | `components/Explorer.tsx` |
| Tab filenames | `components/Tabsbar.tsx` |

## Deployment

Deployed to GitHub Pages from the `gh-pages` branch via `next build` + static export.
