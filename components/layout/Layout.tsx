import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import Titlebar from '@/components/layout/Titlebar';
import Sidebar from '@/components/layout/Sidebar';
import Explorer from '@/components/layout/Explorer';
import Bottombar from '@/components/layout/Bottombar';
import Tabsbar from '@/components/layout/Tabsbar';
import PersonalityOnboardingModal from '@/components/overlays/PersonalityOnboardingModal';
import { PageTransitionProvider } from '@/components/animations/PageTransition';
import { PersonalityAnimationProvider } from '@/components/context/PersonalityAnimationContext';
import { MenuProvider, useMenu } from '@/components/context/MenuContext';
import { pages, REPO_BASE } from '@/data/pages';
import { CommandPalette } from '@/components/overlays/CommandPalette';
import { TerminalPanel } from '@/components/overlays/TerminalPanel';
import { ToastContainer } from '@/components/overlays/Toast';
import { FindPanel } from '@/components/overlays/FindPanel';
import { ContextMenu } from '@/components/overlays/ContextMenu';
import { QuestlineGame } from '@/games/questline';
import { MiniSnake } from '@/games/snake';
import { CloseDialog } from '@/components/overlays/CloseDialog';
import { GlitchUnlockTutorial } from '@/components/overlays/GlitchUnlockTutorial';
import { usePersonality } from '@/components/context/PersonalityContext';

import styles from './Layout.module.css';

const GLITCH_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%&?/\\-_';

function runGlitchOnElement(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes: { node: Text; original: string }[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    nodes.push({ node: n as Text, original: n.textContent ?? '' });
  }
  const fps = 24;
  const duration = 900;
  const frames = Math.round(duration / (1000 / fps));
  let frame = 0;
  const id = setInterval(() => {
    const progress = frame / frames;
    nodes.forEach(({ node, original }) => {
      const revealed = Math.floor(progress * original.length);
      node.textContent = original.split('').map((ch, i) => {
        if (i < revealed || ch === ' ' || ch === '\n') return ch;
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }).join('');
    });
    frame++;
    if (frame > frames) {
      clearInterval(id);
      nodes.forEach(({ node, original }) => { node.textContent = original; });
    }
  }, 1000 / fps);
}

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutInner({ children }: LayoutProps) {
  const router = useRouter();
  const { zenMode, toggleZenMode, sidebarVisible, showContextMenu, setFindOpen, setCommandPaletteOpen, setTerminalOpen, addToast, miniGameOpen, setMiniGameOpen } = useMenu();
  const { personality } = usePersonality();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onGlitch = () => {
      const el = mainRef.current;
      if (el) runGlitchOnElement(el);
    };
    window.addEventListener('glitchPage', onGlitch);
    return () => window.removeEventListener('glitchPage', onGlitch);
  }, []);

  const editorContextItems = [
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      action: () => document.execCommand('copy'),
    },
    {
      label: 'Find in Page',
      shortcut: 'Ctrl+F',
      action: () => setFindOpen(true),
    },
    { separator: true as const },
    {
      label: 'Command Palette...',
      shortcut: 'Ctrl+Shift+P',
      action: () => setCommandPaletteOpen(true),
    },
    {
      label: 'Open Terminal',
      shortcut: 'Ctrl+`',
      action: () => setTerminalOpen(true),
    },
    { separator: true as const },
    {
      label: 'View Page Source',
      action: () => {
        const page = pages.find(p => p.path === router.pathname);
        const file = page?.githubFile ?? 'pages/index.tsx';
        window.open(`${REPO_BASE}/${file}`, '_blank', 'noopener');
      },
    },
    {
      label: 'Inspect Element',
      shortcut: 'F12',
      action: () => addToast('Open your browser DevTools with F12 🔍', 'info'),
    },
  ];

  useEffect(() => {
    const main = document.getElementById('main-editor');
    if (main) main.scrollTop = 0;
  }, [router.pathname]);

  if (zenMode) {
    return (
      <div className={styles.zenWrapper}>
        <button className={styles.zenExit} onClick={toggleZenMode} title="Exit Zen Mode (Esc)">
          ✕ Exit Zen Mode
        </button>
        <main id="main-editor" className={`${styles.content} ${styles.zenContent}`}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Desktop shown behind when VSCode is "minimized" */}
      {miniGameOpen && personality === 'professional' && <MiniSnake onRestore={() => setMiniGameOpen(false)} />}
      {miniGameOpen && personality !== 'professional' && <QuestlineGame />}

      {/* VSCode surface — slides down on minimize */}
      <div className={`${styles.vscodeSurface} ${miniGameOpen ? styles.minimized : ''}`}>
        <PageTransitionProvider>
          <PersonalityAnimationProvider>
            <PersonalityOnboardingModal />
            <GlitchUnlockTutorial />
            <CommandPalette />
            <ContextMenu />
            <CloseDialog />
            <ToastContainer />
            <Titlebar />
            <div className={styles.main}>
              {sidebarVisible && <Sidebar />}
              <Explorer />
              <div className={styles.editorColumn}>
                <Tabsbar />
                <div className={styles.editorArea}>
                  <FindPanel />
                  <main
                    ref={mainRef}
                    id="main-editor"
                    className={styles.content}
                    onContextMenu={e => showContextMenu(e, editorContextItems)}
                  >
                    {children}
                  </main>
                </div>
                <TerminalPanel />
              </div>
            </div>
            <Bottombar />
          </PersonalityAnimationProvider>
        </PageTransitionProvider>
      </div>
    </>
  );
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <MenuProvider>
      <LayoutInner>{children}</LayoutInner>
    </MenuProvider>
  );
};

export default Layout;
