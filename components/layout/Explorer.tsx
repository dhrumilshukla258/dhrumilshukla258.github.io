import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { usePersonality } from '@/components/context/PersonalityContext';
import { useMenu } from '@/components/context/MenuContext';
import { VscChevronRight, VscSettings } from 'react-icons/vsc';
import { pages } from '@/data/pages';


import styles from './Explorer.module.css';

const LABELS: Record<string, string> = { professional: 'Portfolio', gamer: 'SAVE DATA', technical: 'Portfolio' };

const GLITCH_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%&?/\\-_';

function useGlitchText(finalText: string, active: boolean): { display: string; glitching: boolean } {
  const [display, setDisplay] = useState(finalText);
  const [glitching, setGlitching] = useState(false);

  // Keep display in sync when not animating (e.g. personality switch)
  useEffect(() => {
    if (!active) setDisplay(finalText);
  }, [finalText, active]);

  useEffect(() => {
    if (!active) return;
    const duration = 820;
    const fps = 24;
    const interval = 1000 / fps;
    const frames = Math.round(duration / interval);
    let frame = 0;
    setGlitching(true);
    const id = setInterval(() => {
      const progress = frame / frames;
      // linear left-to-right lock-in so each char visibly snaps into place
      const revealed = Math.floor(progress * finalText.length);
      const scrambled = finalText
        .split('')
        .map((ch, i) => {
          if (i < revealed) return ch;
          if (ch === ' ') return ' ';
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        })
        .join('');
      setDisplay(scrambled);
      frame++;
      if (frame > frames) {
        clearInterval(id);
        setDisplay(finalText);
        setGlitching(false);
      }
    }, interval);
    return () => clearInterval(id);
  }, [active, finalText]);

  return { display, glitching };
}

function GlitchEntry({ personality, glitchActive, active }: { personality: string; glitchActive: boolean; active: boolean }) {
  const welcomePage = pages.find(p => p.path === '/welcome')!;
  const { name, icon } = welcomePage[personality as 'gamer' | 'technical' | 'professional'];
  const { display, glitching } = useGlitchText(name, glitchActive);
  return (
    <Link
      href="/welcome"
      className={`${styles.file} ${active ? styles.fileActive : ''} ${styles.easterEggEntry} ${glitching ? styles.glitching : ''}`}
    >
      <Image src={icon} alt={name} height={16} width={16} style={{ flexShrink: 0 }} />
      <p className={styles.glitchText}>{display}</p>
    </Link>
  );
}

const MIN_WIDTH = 120;
const MAX_WIDTH = 500;
const COLLAPSE_THRESHOLD = 80;
const DEFAULT_WIDTH = 220;

interface ExplorerPanelProps {
  className: string;
}

function ExplorerPanel({ className }: ExplorerPanelProps) {
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const dragState = useRef<{ startX: number; startW: number } | null>(null);
  const router = useRouter();
  const { personality } = usePersonality();
  const { showContextMenu, addToast, sidebarVisible } = useMenu();
  const [easterEggFound, setEasterEggFound] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('welcomeFound')) setEasterEggFound(true);
    const onFound = () => {
      setEasterEggFound(true);
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 860);
    };
    window.addEventListener('welcomeFound', onFound);
    window.addEventListener('storage', onFound);
    return () => {
      window.removeEventListener('welcomeFound', onFound);
      window.removeEventListener('storage', onFound);
    };
  }, []);

  // Sync sidebarVisible toggle (View > Toggle Sidebar) → collapsed state
  useEffect(() => {
    setCollapsed(!sidebarVisible);
  }, [sidebarVisible]);

  // Auto-collapse below 768px, restore above (only when user hasn't manually toggled)
  const autoCollapsed = useRef(false);
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) {
        autoCollapsed.current = true;
        setCollapsed(true);
      } else if (autoCollapsed.current) {
        autoCollapsed.current = false;
        setCollapsed(!sidebarVisible);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startW: collapsed ? 0 : width };
    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const next = dragState.current.startW + (ev.clientX - dragState.current.startX);
      if (next < COLLAPSE_THRESHOLD) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
      }
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const fileContextMenu = (page: typeof pages[0]) => [
    {
      label: 'Open',
      action: () => router.push(page.path),
    },
    {
      label: 'Open to the Side',
      action: () => { router.push(page.path); addToast('Split view not available in browser 😄', 'info'); },
    },
    { separator: true as const },
    {
      label: 'Copy Path',
      action: () => {
        const url = window.location.origin + page.path;
        navigator.clipboard.writeText(url).then(() => addToast(`Copied: ${url}`, 'success'));
      },
    },
    {
      label: 'Copy Relative Path',
      action: () => {
        navigator.clipboard.writeText(page.path).then(() => addToast(`Copied: ${page.path}`, 'success'));
      },
    },
    { separator: true as const },
    {
      label: 'Rename',
      action: () => addToast(`"${page[personality].name}" is read-only — this is a portfolio 😄`, 'info'),
    },
    {
      label: 'Delete',
      action: () => addToast(`Nice try. "${page[personality].name}" cannot be deleted.`, 'error'),
    },
  ];

  if (collapsed) {
    return (
      <div
        className={`${className} ${styles.collapsed}`}
        style={{ width: 4 }}
      >
        <div className={styles.dragHandle} onMouseDown={onDragStart} title="Drag to expand" />
      </div>
    );
  }

  return (
    <div className={className} style={{ width }}>
      <div className={styles.dragHandle} onMouseDown={onDragStart} title="Drag to resize" />
      <p className={styles.title}>Explorer</p>
      <div>
        <input
          type="checkbox"
          className={styles.checkbox}
          id="explorer-checkbox"
          checked={open}
          onChange={() => setOpen(!open)}
        />
        <label htmlFor="explorer-checkbox" className={styles.heading}>
          <VscChevronRight
            className={styles.chevron}
            style={open ? { transform: 'rotate(90deg)' } : {}}
          />
          {LABELS[personality]}
        </label>
        <div className={styles.files} style={open ? { display: 'block' } : { display: 'none' }}>
          {pages.filter(p => p.path !== '/welcome').map((page) => {
            const { name, icon } = page[personality];
            return (
              <Link href={page.path} key={page.path}>
                <div
                  className={`${styles.file} ${router.pathname === page.path ? styles.fileActive : ''}`}
                  onContextMenu={e => showContextMenu(e, fileContextMenu(page))}
                >
                  <Image src={icon} alt={name} height={18} width={18} />
                  <span>{name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className={styles.bottomLinks}>
        {easterEggFound && (
          <GlitchEntry
            personality={personality}
            glitchActive={glitchActive}
            active={router.pathname === '/welcome'}
          />
        )}
        <Link href="/settings">
          <div className={`${styles.file} ${router.pathname === '/settings' ? styles.fileActive : ''}`}>
            <VscSettings size={16} />
            <p>settings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

const Explorer = () => {
  const { personality } = usePersonality();
  if (personality === 'professional') return null;
  return <ExplorerPanel className={styles.explorerSmallOnly} />;
};

export default Explorer;
