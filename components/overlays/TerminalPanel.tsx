import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import { useMenu } from '@/components/context/MenuContext';
import { usePersonality } from '@/components/context/PersonalityContext';
import { pages } from '@/data/pages';
import { owner, REPO_URL } from '@/data/owner';
import { VscChromeClose, VscSplitHorizontal } from 'react-icons/vsc';
import styles from './TerminalPanel.module.css';

type Personality = 'professional' | 'gamer' | 'technical';

interface Line {
  type: 'input' | 'output' | 'error';
  text: string;
}

const ABOUT = {
  name:      owner.name,
  title:     owner.title,
  education: owner.education,
  hobbies:   owner.hobbies,
  keyboard:  owner.keyboard,
  contact:   owner.email,
};

const PAGES: Record<Personality, Record<string, string>> = (() => {
  const build = (p: Personality) =>
    Object.fromEntries(pages.map(pg => [pg.path, pg[p].name]));
  return { professional: build('professional'), gamer: build('gamer'), technical: build('technical') };
})();

function processCommand(
  cmd: string,
  router: ReturnType<typeof useRouter>,
  personality: Personality,
  openGame: () => void,
): Line[] {
  const parts = cmd.trim().split(/\s+/);
  const prog = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (prog === '') return [];

  if (prog === 'help') {
    return [{ type: 'output', text: `
Available commands:
  help          Show this help
  whoami        Display info about the portfolio owner
  ls            List available pages
  pwd           Print current page path
  cd <path>     Navigate to a page (e.g. cd /work)
  cat <file>    Read a file (try: cat about.json, cat resume.txt)
  neofetch      System info (portfolio edition)
  history       Show command history
  clear         Clear the terminal
  theme <name>  Change theme (github-dark|dracula|nord|vscode|unreal|...)
  echo <text>   Print text
  glitch        Glitch the current page ⚡
  open <url>    Open a URL (opens in new tab)
  start game    Launch the game for your current personality
`.trim() }];
  }

  if (prog === 'whoami') {
    return [{ type: 'output', text: `${ABOUT.name} — ${ABOUT.title}` }];
  }

  if (prog === 'ls') {
    const pathArg = args[0] ?? '';
    if (!pathArg || pathArg === '.') {
      return [{ type: 'output', text: Object.values(PAGES[personality]).join('  ') }];
    }
    return [{ type: 'error', text: `ls: cannot access '${pathArg}': No such file or directory` }];
  }

  if (prog === 'pwd') {
    return [{ type: 'output', text: router.pathname }];
  }

  if (prog === 'cd') {
    const target = args[0] ?? '/';
    const pages = PAGES[personality];
    // allow both path (/work) and filename (career.log)
    const byPath = Object.keys(pages).includes(target);
    const byName = Object.entries(pages).find(([, name]) => name === target);
    if (byPath) {
      router.push(target);
      return [{ type: 'output', text: `Navigating to ${target}...` }];
    }
    if (byName) {
      router.push(byName[0]);
      return [{ type: 'output', text: `Navigating to ${byName[0]}...` }];
    }
    return [{ type: 'error', text: `cd: ${target}: No such directory` }];
  }

  if (prog === 'cat') {
    const file = args[0] ?? '';
    if (file === 'about.json' || file === 'about') {
      return [{ type: 'output', text: JSON.stringify(ABOUT, null, 2) }];
    }
    if (file === 'resume.txt' || file === 'resume') {
      return [{ type: 'output', text: `${owner.name} — ${owner.title}
${owner.education[0]}
${owner.education[1]}

For full resume details, visit /work and /projects.
Contact: ${ABOUT.contact}` }];
    }
    if (file === 'contact.txt' || file === 'contact') {
      return [{ type: 'output', text: `Email: ${ABOUT.contact}\nGitHub: ${REPO_URL}` }];
    }
    if (!file) {
      return [{ type: 'error', text: 'cat: missing file operand' }];
    }
    return [{ type: 'error', text: `cat: ${file}: No such file or directory` }];
  }

  if (prog === 'echo') {
    return [{ type: 'output', text: args.join(' ') }];
  }

  if (prog === 'theme') {
    const themeId = args[0];
    const valid = ['github-dark', 'dracula', 'nord', 'vscode', 'unreal', 'ayu-dark', 'ayu-mirage', 'night-owl', 'professional', 'unity'];
    if (!themeId) {
      return [{ type: 'output', text: `Current theme: ${document.documentElement.getAttribute('data-theme') ?? 'github-dark'}\nAvailable: ${valid.join(', ')}` }];
    }
    if (valid.includes(themeId)) {
      document.documentElement.setAttribute('data-theme', themeId);
      const p = document.documentElement.getAttribute('data-personality') ?? 'professional';
      localStorage.setItem(`theme_${p}`, themeId);
      return [{ type: 'output', text: `Theme set to: ${themeId}` }];
    }
    return [{ type: 'error', text: `theme: unknown theme '${themeId}'. Run 'theme' to see available themes.` }];
  }

  if (prog === 'open') {
    const url = args[0];
    if (!url) return [{ type: 'error', text: 'open: missing URL' }];
    window.open(url, '_blank', 'noopener,noreferrer');
    return [{ type: 'output', text: `Opening ${url}...` }];
  }

  if (prog === 'neofetch') {
    const theme = document.documentElement.getAttribute('data-theme') ?? 'github-dark';
    const personality = document.documentElement.getAttribute('data-personality') ?? 'professional';
    return [{ type: 'output', text: `
       ██████╗     ${owner.name}
      ██╔══██╗    ─────────────────────────────
      ██║  ██║    OS: Portfolio OS ${owner.version}
      ██║  ██║    Host: ${owner.site}
      ╚█████╔╝    Shell: Next.js 15
       ╚════╝     Theme: ${theme}
                  Personality: ${personality}
                  DE: VS Code (web edition)
                  Resolution: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '—'}
                  Memory: ∞ (JavaScript heap)
`.trim() }];
  }

  if (prog === 'history') {
    return [{ type: 'output', text: '(Use the ↑ and ↓ arrow keys to browse command history)' }];
  }

  if (prog === 'clear') {
    return [{ type: 'output', text: '__clear__' }];
  }

  if (prog === 'glitch') {
    window.dispatchEvent(new Event('glitchPage'));
    const msg: Record<Personality, string> = {
      professional: 'Initiating page corruption sequence...',
      gamer:        '> CORRUPTING SAVE DATA... just kidding 👾',
      technical:    '$ ./glitch.sh --target=dom --mode=chaos',
    };
    return [{ type: 'output', text: msg[personality] }];
  }

  if (prog === 'start' && args[0] === 'game') {
    openGame();
    const msg: Record<Personality, string> = {
      professional: 'Launching boardroom simulation...',
      gamer:        '> LAUNCHING THE MAIN QUESTLINE... ready player one 🎮',
      technical:    '$ ./start_game.sh — process started',
    };
    return [{ type: 'output', text: msg[personality] }];
  }

  return [{ type: 'error', text: `command not found: ${prog}` }];
}

const WELCOME: Record<Personality, Line[]> = {
  professional: [
    { type: 'output', text: 'Portfolio Terminal  —  Welcome.' },
    { type: 'output', text: 'Type "help" to view available commands.' },
    { type: 'output', text: '' },
  ],
  gamer: [
    { type: 'output', text: '[ PORTFOLIO OS v1.0 ]  SYSTEM BOOT COMPLETE.' },
    { type: 'output', text: 'Welcome, player.' },
    { type: 'output', text: 'Type "help" for command list.' },
    { type: 'output', text: '' },
  ],
  technical: [
    { type: 'output', text: 'Portfolio Terminal v1.0.0 (Next.js/TypeScript)' },
    { type: 'output', text: '# type "help" for available commands' },
    { type: 'output', text: '' },
  ],
};

const PROMPT: Record<Personality, string> = {
  professional: '>',
  gamer: '▸',
  technical: '$',
};

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 600;
const DEFAULT_HEIGHT = 220;

export function TerminalPanel() {
  const router = useRouter();
  const { terminalOpen, setTerminalOpen, addToast: menuAddToast, setMiniGameOpen } = useMenu();
  const { personality } = usePersonality();
  const [lines, setLines] = useState<Line[]>(WELCOME[personality]);
  const [input, setInput] = useState('');
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const prompt = PROMPT[personality];
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragState = useRef<{ startY: number; startH: number } | null>(null);

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = { startY: e.clientY, startH: height };

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const delta = dragState.current.startY - ev.clientY;
      const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, dragState.current.startH + delta));
      setHeight(next);
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Reset terminal when personality changes
  useEffect(() => {
    setLines(WELCOME[personality]);
    setInput('');
    setHistoryList([]);
    setHistoryIdx(-1);
  }, [personality]);

  useEffect(() => {
    if (terminalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [terminalOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      const inputLine: Line = { type: 'input', text: `${prompt} ${cmd}` };

      if (cmd) {
        setHistoryList(h => [cmd, ...h]);
        setHistoryIdx(-1);
        const result = processCommand(cmd, router, personality, () => {
          setMiniGameOpen(true);
          setTerminalOpen(false);
        });

        if (result.length === 1 && result[0].text === '__clear__') {
          setLines(WELCOME[personality]);
        } else {
          setLines(ls => [...ls, inputLine, ...result]);
        }
      } else {
        setLines(ls => [...ls, inputLine]);
      }
      setInput('');
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(historyIdx + 1, historyList.length - 1);
      setHistoryIdx(next);
      setInput(historyList[next] ?? '');
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(historyIdx - 1, -1);
      setHistoryIdx(next);
      setInput(next === -1 ? '' : historyList[next] ?? '');
    }
  };

  if (!terminalOpen) return null;

  return (
    <div className={`${styles.panel} ${styles[personality]}`} style={{ height }}>
      <div className={styles.dragHandle} onMouseDown={onDragStart} title="Drag to resize" />
      <div className={styles.header}>
        <div className={styles.tabs}>
          <span className={styles.activeTab}>TERMINAL</span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            title="Split Terminal"
            onClick={() => menuAddToast('Not enough RAM for a second terminal 😅', 'error')}
          >
            <VscSplitHorizontal size={14} />
          </button>
          <button
            className={styles.actionBtn}
            title="Close Terminal"
            onClick={() => setTerminalOpen(false)}
          >
            <VscChromeClose size={14} />
          </button>
        </div>
      </div>
      <div className={styles.output} onClick={() => inputRef.current?.focus()}>
        {lines.map((line, i) => (
          <div key={i} className={`${styles.line} ${styles[line.type]}`}>
            <pre className={styles.lineText}>{line.text}</pre>
          </div>
        ))}
        <div className={styles.promptRow}>
          <span className={styles.prompt}>{prompt}</span>
          <input
            ref={inputRef}
            className={styles.inputField}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
