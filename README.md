# VS Code Portfolio — Dhrumil Shukla

A personal portfolio built to look and feel like Visual Studio Code, with a personality-switching system that adapts all content and styling to three modes: **Professional**, **Technical**, and **Gamer**.

Live at: [dhrumilshukla258.github.io](https://dhrumilshukla258.github.io)

---

## Features

- **Personality System** — switch between Professional, Technical, and Gamer modes. Every page adapts its copy, layout, filenames, terminal prompt, and visual style.
- **VS Code chrome** — Titlebar with working menus, Explorer sidebar, Tabsbar, Bottombar, and Status bar replicating the VS Code UI shell.
- **Command Palette** (`Ctrl+Shift+P`) — fuzzy-search navigation, theme switching, and view toggles.
- **Interactive Terminal** (`Ctrl+\``) — personality-aware shell with `ls`, `cd`, `cat`, `neofetch`, `theme`, `start game`, `glitch`, and more. Drag to resize.
- **Find in Page** (`Ctrl+F`) — real browser text search with a VS Code-style panel.
- **Right-click context menus** — on the editor area, Explorer files, and tabs.
- **10 color themes** — switchable per personality; default per personality is data-driven.
- **Per-personality sidebar toggle** — toggling sidebar in one personality doesn't affect others.
- **Contact form** — Formspree-powered with client-side validation and spam prevention.
- **Zen Mode** (`Ctrl+K Z`) — distraction-free view.
- **Fully data-driven** — add a page, update personal info, or change themes entirely from the `data/` folder.
- **Mini-games** — minimize VSCode to reveal a personality-specific game.
- **Static site** — deploys to GitHub Pages as a fully static export.

---

## Easter Egg — Welcome Page

Close all open tabs to discover a hidden welcome screen. When found:

- A personality-matched file entry (`welcome.save` / `welcome.sh`) glitch-animates into the Explorer bottom
- The character for your active personality walks along the Titlebar, opens the **View** menu, and walks down to click **⚡ Glitch Page** — teaching you the new feature
- The welcome page itself glitch-reveals all its text on load
- **⚡ Glitch Page** is unlocked in `View` menu and via the `glitch` terminal command — scrambles any page's text with a left-to-right char reveal

---

## Mini-Games

Click the minimize button in the Titlebar (or type `start game` in the terminal) to slide VSCode down and reveal a playable game. Click **Restore** to slide back up.

| Personality | Game |
|---|---|
| **Professional** | MiniSnake — classic Snake with personality-themed colors and copy |
| **Gamer** | The Main Questline — Three.js open-world RPG city (FACTION HQ) |
| **Technical** | The Main Questline — same Three.js world |

Inside The Main Questline, a portal in the center of the map opens MiniSnake as an overlay.

---

## Tech Stack

- **Next.js 16** (Pages Router, Static Site Generation)
- **React 19**
- **TypeScript 5**
- **Three.js 0.184** — open-world game
- **CSS Modules** co-located with each component (theming via CSS custom properties on `data-theme` / `data-personality`)
- **Formspree** (`@formspree/react`) for contact form submissions

---

## Project Structure

```
pages/               # Next.js routes — each file is a page
  *.module.css       # Page styles co-located here

components/
  animations/        # Page transition canvas effects + avatars
    effects/
      gamer/         # overcooking.tsx · basketball.tsx · platformer.tsx
      professional/  # boardroom.tsx · newspaper.tsx · typewriter.tsx
      technical/     # glitch.tsx · team-build.tsx · ssh.tsx
  cards/             # ProjectCard · RepoCard
  context/           # React context providers
    MenuContext.tsx              # Global UI state (panels, toasts, zoom, game, sidebar per-personality)
    PersonalityContext.tsx       # Active personality + theme
    PersonalityAnimationContext.tsx  # Refs for pill fly-out animation
  layout/            # VSCode chrome skeleton
    Layout.tsx       # Root shell — wires all panels + game routing + glitchPage event listener
    Titlebar.tsx     # Menu bar + personality switcher
    Explorer.tsx     # Sidebar file tree (Easter egg entry + glitch animation)
    Tabsbar.tsx      # Open-file tabs (Easter egg discovery trigger)
    Sidebar.tsx      # Professional icon sidebar (Easter egg VscBeaker icon)
    Bottombar.tsx    # Status bar
  overlays/          # UI layers that float above the layout
    CommandPalette.tsx
    TerminalPanel.tsx
    ContextMenu.tsx · DropdownMenu.tsx
    FindPanel.tsx · Modal.tsx · CloseDialog.tsx · Toast.tsx
    PersonalityOnboardingModal.tsx
    GlitchUnlockTutorial.tsx   # Canvas character walks along titlebar → clicks ⚡ Glitch Page
  widgets/           # Page-embedded interactive components
    ContactCode.tsx · ContactForm.tsx · ThemeInfo.tsx

games/
  questline/         # The Main Questline — Three.js open-world RPG
    index.tsx        # QuestlineGame component
    engine.ts · buildings.ts · geometry.ts · materials.ts
    audio.ts · environment.ts · npcs.ts
    data/            # Serialized world data (positions, colors, spawns)
      zones.ts       # cityZones[] — 5 zones keyed to page paths
      districts.ts   # gameCity, skillsCity, buildsCity — district building placements
      npcs.ts        # NPC spawn defs, bench/picnic/laptop/cafe positions, theater data
      theater.ts     # movieSlides[], screen position, Pixel Park billboard
      world.ts       # PLAYER_COLORS, portal/fountain positions, street light positions
  snake/             # MiniSnake canvas game
    index.tsx · useSnakeGame.ts
  shared/
    GameDpad.tsx     # Mobile D-pad for QuestlineGame

data/                # ← Edit here to update content everywhere
  owner.ts           # Personal info, themes, default theme per personality
  pages.ts           # Routes with per-personality filenames, icons, and labels
  workexp.ts         # Work experience (3 personality sub-objects each)
  projects.ts        # Project cards
  contacts.ts        # Contact links
  about.ts           # Personality onboarding card content

styles/              # Global styles only
  globals.css · themes.css

public/              # Static assets (logos, images)
types/               # Shared TypeScript types
```

---

## Customizing Content

Everything you need to change lives in `data/`. No component knowledge required.

### Personal info — `data/owner.ts`

```ts
export const owner = {
  name:    'Your Name',
  title:   'Your Title',
  company: 'Your Company',
  github:  'your-github-username',
  // ...
};
```

### Color themes — `data/owner.ts`

```ts
export const themes: ThemeDef[] = [
  { id: 'github-dark', label: 'GitHub Dark' },
  // themes flow into the View menu, Command Palette, and terminal `theme` command
];

export const defaultTheme = {
  professional: 'github-dark',
  gamer:        'one-dark-pro',
  technical:    'dracula',
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
    technical:    { name: 'experience.sh', icon: '/logos/file_type_shell.svg' },
  },
  // add a new entry here → it appears in Explorer, Tabsbar, terminal ls/cd,
  // CommandPalette, and Go menu automatically
];
```

### Work experience — `data/workexp.ts`

Each entry has `professional`, `technical`, and `gamer` sub-objects with personality-specific copy.

### Questline game world — `games/questline/data/`

Game world data is split into focused files. Edit `zones.ts` to reorder zone buildings, `districts.ts` to adjust district layouts, `npcs.ts` for NPC spawns, `theater.ts` for movie slides, and `world.ts` for player colors and light positions. Behavior code stays in `games/questline/` — these files are pure data.

---

## Personality System

The active personality is stored in `localStorage` and applied via `data-personality` on `<html>`. Each personality has its own:

- Page filenames and icons (Explorer, Tabsbar)
- Terminal prompt character and color scheme
- Default color theme (overridable per-session)
- Page copy and component variants
- Page transition animation set (3 effects each)
- Minimize game (Snake vs The Main Questline)
- Sidebar visibility state (independent per personality)

Switch personality via the pill in the Titlebar, or visit `/settings`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+F` | Find in page |
| `Ctrl+\`` | Terminal |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+=` / `Ctrl+-` | Zoom in / out |
| `Ctrl+0` | Reset zoom |
| `Esc` | Close all overlays |

---

## Terminal Commands

| Command | Description |
|---|---|
| `help` | List all commands |
| `whoami` | Portfolio owner info |
| `ls` | List pages |
| `pwd` | Current page path |
| `cd <path>` | Navigate to a page |
| `cat <file>` | Read a file |
| `echo <text>` | Print text |
| `theme <name>` | Change color theme |
| `neofetch` | System info (portfolio edition) |
| `history` | Command history |
| `clear` | Clear terminal |
| `start game` | Launch the mini-game |
| `glitch` | ⚡ Glitch current page *(unlocked via Easter egg)* |
| `open <url>` | Open a URL |

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

Deployed to GitHub Pages from the `gh-pages` branch via `next build`. The `next.config.ts` sets `output: 'export'` for full static generation.
