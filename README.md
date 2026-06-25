# VS Code Portfolio — Dhrumil Shukla

A personal portfolio built to look and feel like Visual Studio Code, with a personality-switching system that adapts all content and styling to three modes: **Professional**, **Technical**, and **Gamer**.

Live at: [dhrumilshukla258.github.io](https://dhrumilshukla258.github.io)

---

## Features

- **Personality System** — switch between Professional, Technical, and Gamer modes. Every page adapts its copy, layout, filenames, terminal prompt, and visual style.
- **VS Code chrome** — Titlebar with 7 working menus, Explorer sidebar, Tabsbar, Bottombar, and Status bar replicate the VS Code UI shell.
- **Command Palette** (`Ctrl+Shift+P`) — fuzzy-search navigation, theme switching, and view toggles.
- **Interactive Terminal** (`Ctrl+\``) — personality-aware shell with `ls`, `cd`, `cat`, `neofetch`, `theme`, and more. Drag to resize.
- **Find in Page** (`Ctrl+F`) — real browser text search with a VS Code-style panel.
- **Right-click context menus** — on the editor area, Explorer files, and tabs.
- **10 color themes** — switchable per personality; default per personality is data-driven.
- **Contact form** — Formspree-powered with client-side validation and spam prevention.
- **Zen Mode** (`Ctrl+K Z`) — distraction-free view with a translucent exit button.
- **Fully data-driven** — add a page, update personal info, or change themes entirely from the `data/` folder.
- **Mini-games** — each personality hides a playable game. Minimize VSCode to reveal it (see below).
- **Static site** — deploys to GitHub Pages as a fully static export.

---

## Mini-Games

Clicking the minimize button in the Titlebar slides VSCode down to reveal a personality-specific desktop with a playable game. Click **Restore** (or the window) to slide VSCode back up.

| Personality | Game | Description |
|---|---|---|
| **Professional** | Snake (`snake.py`) | Classic Snake styled as a VSCode Python file. WASD or arrow keys; snake wraps edges. |
| **Technical** | Snake (`./snake --wrap`) | Same Snake engine embedded in a fake terminal session; segfault game-over screen. |
| **Gamer** | 3-D Open World | Three.js city with a VSCode building. Walk around, enter zones, and interact. Mobile D-pad supported. |

A compact **MiniSnake** variant also runs directly on the minimized desktop for Professional and Technical personalities, personality-themed with matching colors and copy.

---

## Tech Stack

- **Next.js 15** (Pages Router, Static Site Generation)
- **React 19**
- **TypeScript 5**
- **CSS Modules** (theming via CSS custom properties on `data-theme` / `data-personality`)
- **Formspree** (`@formspree/react`) for contact form submissions

---

## Project Structure

```
pages/          # Route pages (index, work, projects, about, contact, github, settings)
components/     # UI shell and interactive features
  Layout.tsx          # Root layout — wires all panels together
  Titlebar.tsx        # 7-menu menu bar + personality switcher
  Explorer.tsx        # Sidebar file tree
  Tabsbar.tsx         # Open-file tabs
  Bottombar.tsx       # Status bar
  CommandPalette.tsx  # Ctrl+Shift+P palette
  TerminalPanel.tsx   # Interactive terminal panel
  FindPanel.tsx       # Ctrl+F find bar
  ContextMenu.tsx     # Right-click menus
  Toast.tsx           # Notification toasts
  ContactForm.tsx     # Per-personality contact form
  MenuContext.tsx     # Global UI state (terminal, zen mode, sidebar, toasts, zoom…)
  PersonalityContext.tsx  # Active personality + theme initialization
  MinimizedDesktop.tsx    # OS desktop shown behind VSCode when minimized
  GamerDesktop.tsx        # Gamer personality desktop surface
  GamerGame.tsx           # Three.js open-world city game (Gamer mode)
  ProfessionalDesktop.tsx # Professional personality desktop surface
  ProfessionalGame.tsx    # Snake game styled as snake.py (Professional mode)
  TechnicalDesktop.tsx    # Technical personality desktop surface
  MiniSnake.tsx           # Compact Snake variant on the minimized desktop
  GameDpad.tsx            # On-screen D-pad for mobile gamer controls
data/           # ← Edit here to update content everywhere
  owner.ts      # Personal info, themes list, default theme per personality
  pages.ts      # Page routes, per-personality filenames/icons, GitHub file paths
  workexp.ts    # Work experience entries
  projects.ts   # Project entries
  contacts.ts   # Contact links
styles/         # CSS Modules per component/page
public/logos/   # SVG icons used in tabs and explorer
```

---

## Customizing Content

Everything you need to change lives in `data/`. No component knowledge required.

### Personal info — `data/owner.ts`

```ts
export const owner = {
  name:    'Your Name',
  title:   'Your Title',
  tagline: 'Your meta description',
  email:   'you@example.com',
  github:  'your-github-username',
  site:    'your-site.github.io',
  repo:    'your-repo-name',
  branch:  'gh-pages',
  version: '1.0.0',
  license: 'MIT',
  keyboard: 'your keyboard setup',
  education: ['Degree — School (Year)'],
  hobbies:   ['hobby1', 'hobby2'],
};
```

Changing `github` / `repo` / `branch` automatically updates the Bottombar repo link, "View Page Source" right-click action, and Help → Report Issue URL.

### Color themes — `data/owner.ts`

```ts
export const themes: ThemeDef[] = [
  { id: 'github-dark', label: 'GitHub Dark' },
  // add or remove themes here — they flow into the View menu,
  // Command Palette, and terminal `theme` command automatically
];

export const defaultTheme = {
  professional: 'professional',  // first-visit theme for each personality
  gamer:        'unreal',
  technical:    'github-dark',
};
```

### Pages / navigation — `data/pages.ts`

```ts
export const pages: PageDef[] = [
  {
    path:        '/work',
    githubFile:  'pages/work.tsx',
    professional: { name: 'experience.py', icon: '/logos/file_type_python.svg' },
    gamer:        { name: 'career.log',    icon: '/logos/file_type_log.svg' },
    technical:    { name: 'experience.py', icon: '/logos/file_type_python.svg' },
  },
  // add a new entry here → it appears in Explorer, Tabsbar, terminal ls/cd,
  // CommandPalette, Titlebar Open Recent, Titlebar Go menu, and View Page Source
];
```

### Work experience — `data/workexp.ts`

Each entry has `professional`, `technical`, and `gamer` sub-objects with personality-specific copy.

### Projects — `data/projects.ts`

Each entry has `title`, `description`, `tags`, `href`, and optional per-personality overrides.

### Contact links — `data/contacts.ts`

Array of `{ label, value, href }` objects displayed on the contact page.

---

## Personality System

The active personality is stored in `localStorage` and applied via `data-personality` on `<html>`. Each personality has its own:

- Page filenames and icons (Explorer, Tabsbar)
- Terminal prompt character and color scheme
- Default color theme (overridable per-session)
- Page copy and component variants

Switch personality via the pill in the Titlebar, or visit `/settings`.

---

## Running Locally

```bash
npm install
npm run dev       # dev server at http://localhost:3000
npm run build     # production build + static export
npm run lint      # ESLint
npx tsc --noEmit  # type-check only
```

---

## Deployment

Deployed to GitHub Pages from the `gh-pages` branch via `next build`. The `next.config.js` sets `output: 'export'` for full static generation.
