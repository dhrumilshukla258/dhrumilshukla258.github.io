import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { usePersonality, PersonalityType } from '@/components/context/PersonalityContext';
import { usePersonalityAnimation, ANIM_PERSONALITY_ORDER } from '@/components/context/PersonalityAnimationContext';
import { usePageTransition } from '@/components/animations/PageTransition';
import { useMenu, MenuId } from '@/components/context/MenuContext';
import { DropdownMenu, MenuItemDef } from '@/components/overlays/DropdownMenu';
import { pages } from '@/data/pages';
import { owner, ISSUES_URL, themes } from '@/data/owner';
import styles from './Titlebar.module.css';

const personalities: { type: PersonalityType; label: string }[] = [
  { type: 'professional', label: 'Professional' },
  { type: 'gamer', label: 'Gamer' },
  { type: 'technical', label: 'Technical' },
];

const THEMES = themes;

function useMenuDefs() {
  const router = useRouter();
  const {
    toggleZenMode, toggleSidebar,
    setTerminalOpen, setCommandPaletteOpen, setFindOpen,
    addToast, adjustZoom, resetZoom,
  } = useMenu();

  const [buildRunning, setBuildRunning] = useState(false);
  const [easterEggFound, setEasterEggFound] = useState(false);

  useEffect(() => {
    setEasterEggFound(!!localStorage.getItem('welcomeFound'));
    const onFound = () => setEasterEggFound(true);
    window.addEventListener('welcomeFound', onFound);
    window.addEventListener('storage', onFound);
    return () => {
      window.removeEventListener('welcomeFound', onFound);
      window.removeEventListener('storage', onFound);
    };
  }, []);

  const applyTheme = useCallback((id: string) => {
    document.documentElement.setAttribute('data-theme', id);
    const p = document.documentElement.getAttribute('data-personality') ?? 'professional';
    localStorage.setItem(`theme_${p}`, id);
    addToast(`Theme: ${THEMES.find(t => t.id === id)?.label ?? id}`, 'success');
  }, [addToast]);

  const runBuild = useCallback(() => {
    if (buildRunning) return;
    setBuildRunning(true);
    addToast('Building portfolio...', 'info');
    setTimeout(() => {
      addToast('Build succeeded ✓ (0 errors, 0 warnings)', 'success');
      setBuildRunning(false);
    }, 2000);
  }, [buildRunning, addToast]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => addToast('Link copied to clipboard', 'success'))
      .catch(() => addToast('Failed to copy link', 'error'));
  }, [addToast]);

  const defs: Record<MenuId & string, MenuItemDef[]> = {
    file: [
      {
        label: 'New File',
        shortcut: 'Ctrl+N',
        action: () => addToast('portfolio.tsx created (unsaved)', 'info'),
      },
      { separator: true },
      {
        label: 'Open Recent',
        submenu: pages.map(p => ({ label: p.professional.name, href: p.path })),
      },
      { separator: true },
      {
        label: 'Save',
        shortcut: 'Ctrl+S',
        action: () => addToast('All changes saved ✓', 'success'),
      },
      {
        label: 'Save As...',
        shortcut: 'Ctrl+Shift+S',
        action: () => addToast('Already saved to the cloud ☁', 'info'),
      },
      { separator: true },
      {
        label: 'Download Resume',
        action: () => addToast('Resume PDF coming soon — check /contact in the meantime!', 'info'),
      },
      { separator: true },
      {
        label: 'Close Editor',
        shortcut: 'Ctrl+W',
        action: () => router.push('/'),
      },
    ],

    edit: [
      {
        label: 'Find',
        shortcut: 'Ctrl+F',
        action: () => setFindOpen(true),
      },
      {
        label: 'Copy Link',
        shortcut: 'Ctrl+L',
        action: copyLink,
      },
      { separator: true },
      {
        label: 'Command Palette...',
        shortcut: 'Ctrl+Shift+P',
        action: () => setCommandPaletteOpen(true),
      },
    ],

    view: [
      {
        label: 'Toggle Sidebar',
        shortcut: 'Ctrl+B',
        action: toggleSidebar,
      },
      {
        label: 'Zen Mode',
        shortcut: 'Ctrl+K Z',
        action: toggleZenMode,
      },
      { separator: true },
      {
        label: 'Change Theme',
        submenu: THEMES.map(t => ({
          label: t.label,
          action: () => applyTheme(t.id),
        })),
      },
      ...(easterEggFound ? [
        { separator: true as const },
        {
          label: '⚡ Glitch Page',
          action: () => window.dispatchEvent(new Event('glitchPage')),
          glitch: true as const,
        },
      ] : []),
      { separator: true },
      {
        label: 'Zoom In',
        shortcut: 'Ctrl+=',
        action: () => adjustZoom(1),
      },
      {
        label: 'Zoom Out',
        shortcut: 'Ctrl+-',
        action: () => adjustZoom(-1),
      },
      {
        label: 'Reset Zoom',
        shortcut: 'Ctrl+0',
        action: resetZoom,
      },
    ],

    go: [
      {
        label: 'Back',
        shortcut: 'Alt+←',
        action: () => router.back(),
      },
      {
        label: 'Forward',
        shortcut: 'Alt+→',
        action: () => router.forward(),
      },
      { separator: true },
      ...pages.map(p => ({ label: `Go to ${p.professional.name}`, href: p.path })),
      { separator: true },
      {
        label: 'Go to File...',
        shortcut: 'Ctrl+Shift+P',
        action: () => setCommandPaletteOpen(true),
      },
    ],

    run: [
      {
        label: buildRunning ? 'Building...' : 'Run Portfolio',
        shortcut: 'F5',
        disabled: buildRunning,
        action: runBuild,
      },
      { separator: true },
      {
        label: 'View Debug Console',
        action: () => { setTerminalOpen(true); addToast('Debug console opened', 'info'); },
      },
    ],

    terminal: [
      {
        label: 'New Terminal',
        shortcut: 'Ctrl+`',
        action: () => setTerminalOpen(true),
      },
      {
        label: 'Split Terminal',
        action: () => addToast('Not enough RAM for a second terminal 😅', 'error'),
      },
      { separator: true },
      {
        label: 'Kill Terminal',
        action: () => { setTerminalOpen(false); addToast('Terminal session ended', 'info'); },
      },
    ],

    help: [
      {
        label: 'About',
        action: () => {
          addToast(`Portfolio v${owner.version} — Built with Next.js & TypeScript\nMade by ${owner.name}`, 'info');
        },
      },
      {
        label: 'Keyboard Shortcuts',
        action: () => {
          addToast(
            'Ctrl+Shift+P → Command Palette\nCtrl+F → Find\nCtrl+` → Terminal\nCtrl+B → Sidebar\nCtrl+± → Zoom',
            'info'
          );
        },
      },
      { separator: true },
      {
        label: 'Report Issue',
        href: ISSUES_URL,
      },
      {
        label: 'View License',
        action: () => addToast(`${owner.license} License — Free to use with attribution. © ${owner.name}`, 'info'),
      },
    ],
  };

  return defs;
}

const MENU_LABELS: { id: MenuId & string; label: string }[] = [
  { id: 'file',     label: 'File' },
  { id: 'edit',     label: 'Edit' },
  { id: 'view',     label: 'View' },
  { id: 'go',       label: 'Go' },
  { id: 'run',      label: 'Run' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'help',     label: 'Help' },
];

const Titlebar = () => {
  const { personality, setPersonality } = usePersonality();
  const { pillIconRefs, triggerSameClick, shaking } = usePersonalityAnimation();
  const { trigger: triggerTransition, isActive: isTransitioning } = usePageTransition();
  const { activeMenu, setActiveMenu, setMiniGameOpen, setCloseDialogOpen } = useMenu();
  const menuDefs = useMenuDefs();
  const barRef = useRef<HTMLDivElement>(null);

  // Close menu when resized below the breakpoint where menu labels are hidden
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= 900) setActiveMenu(null);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [setActiveMenu]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setActiveMenu]);

  return (
    <section className={styles.titlebar}>
      <Image
        src="/logos/vscode_icon.svg"
        alt="VSCode Icon"
        height={15}
        width={15}
        className={styles.icon}
      />

      <div className={styles.items} ref={barRef}>
        {MENU_LABELS.map(({ id, label }) => (
          <div key={id} className={styles.menuWrapper}>
            <p
              className={`${styles.menuLabel} ${activeMenu === id ? styles.menuActive : ''}`}
              onClick={() => setActiveMenu(activeMenu === id ? null : id as MenuId)}
              onMouseEnter={() => activeMenu && activeMenu !== id && setActiveMenu(id as MenuId)}
            >
              {label}
            </p>
            {activeMenu === id && menuDefs[id] && (
              <DropdownMenu items={menuDefs[id]} onClose={() => setActiveMenu(null)} />
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.personalityPill} ${shaking ? styles.pillShake : ''}`}>
        {personalities.map(({ type, label }) => {
          const animIndex = ANIM_PERSONALITY_ORDER.indexOf(type);
          return (
            <button
              key={type}
              className={`${styles.pillOption} ${personality === type ? styles.pillActive : ''}`}
              onClick={() => {
                if (isTransitioning) return;
                if (personality === type) { triggerSameClick(); return; }
                triggerTransition(type, () => setPersonality(type));
              }}
            >
              <span
                className={`${styles.pillIcon} ${personality === type ? styles.pillIconActive : ''}`}
                ref={(el) => { pillIconRefs.current[animIndex] = el; }}
              >
                <Image
                  src={`/personality/${type}.png`}
                  alt={label}
                  fill
                  sizes="32px"
                  className="image-contain"
                />
              </span>
              <span className={styles.pillLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.windowButtons}>
        <span
          className={styles.minimize}
          title="Minimize — The Main Questline"
          onClick={() => setMiniGameOpen(true)}
        />
        <span
          className={styles.maximize}
          title="Toggle fullscreen"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
        />
        <span
          className={styles.close}
          title="Close"
          onClick={() => setCloseDialogOpen(true)}
        />
      </div>
    </section>
  );
};

export default Titlebar;
