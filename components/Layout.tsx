import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Titlebar from '@/components/Titlebar';
import Sidebar from '@/components/Sidebar';
import Explorer from '@/components/Explorer';
import Bottombar from '@/components/Bottombar';
import Tabsbar from '@/components/Tabsbar';
import PersonalityOnboardingModal from '@/components/PersonalityOnboardingModal';
import { PageTransitionProvider } from '@/components/PageTransition';
import { PersonalityAnimationProvider } from '@/components/PersonalityAnimationContext';
import { MenuProvider, useMenu } from '@/components/MenuContext';
import { pages, REPO_BASE } from '@/data/pages';
import { CommandPalette } from '@/components/CommandPalette';
import { TerminalPanel } from '@/components/TerminalPanel';
import { ToastContainer } from '@/components/Toast';
import { FindPanel } from '@/components/FindPanel';
import { ContextMenu } from '@/components/ContextMenu';
import { MinimizedDesktop } from '@/components/MinimizedDesktop';
import { CloseDialog } from '@/components/CloseDialog';

import styles from '@/styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutInner({ children }: LayoutProps) {
  const router = useRouter();
  const { zenMode, toggleZenMode, sidebarVisible, showContextMenu, setFindOpen, setCommandPaletteOpen, setTerminalOpen, addToast, miniGameOpen } = useMenu();

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
      {miniGameOpen && <MinimizedDesktop />}

      {/* VSCode surface — slides down on minimize */}
      <div className={`${styles.vscodeSurface} ${miniGameOpen ? styles.minimized : ''}`}>
        <PageTransitionProvider>
          <PersonalityAnimationProvider>
            <PersonalityOnboardingModal />
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
