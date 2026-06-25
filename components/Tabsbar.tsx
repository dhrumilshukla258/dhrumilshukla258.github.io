import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Tab from '@/components/Tab';
import { usePersonality } from '@/components/PersonalityContext';
import { pages } from '@/data/pages';
import styles from '@/styles/Tabsbar.module.css';

const ALL_PATHS = pages.map(p => p.path);

const Tabsbar = () => {
  const router = useRouter();
  const { personality } = usePersonality();

  const [openPaths, setOpenPaths] = useState<string[]>(ALL_PATHS);

  // On the welcome screen, switching TO professional navigates home.
  // Other personality switches leave the welcome screen as-is.
  useEffect(() => {
    if (router.pathname === '/welcome' && personality === 'professional') {
      setOpenPaths(ALL_PATHS);
      router.push('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personality]);

  // When the active route changes to a known page, auto-add it to the bar
  // (handles "reopen" case: user clicks a link from the welcome screen)
  useEffect(() => {
    const path = router.pathname;
    if (!ALL_PATHS.includes(path)) return;
    setOpenPaths(prev => prev.includes(path) ? prev : [...prev, path]);
  }, [router.pathname]);

  const dragFrom   = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const closeTab = useCallback((path: string) => {
    setOpenPaths(prev => {
      const idx  = prev.indexOf(path);
      const next = prev.filter(p => p !== path);
      if (router.pathname === path) {
        // Navigate to adjacent tab; if last tab closed go to welcome screen
        const dest = next[idx] ?? next[idx - 1] ?? null;
        router.push(dest ?? '/welcome');
      }
      return next;
    });
  }, [router]);

  const onDragStart = useCallback((path: string) => { dragFrom.current = path; }, []);

  const onDragOver = useCallback((path: string) => {
    if (dragFrom.current && dragFrom.current !== path) setDropTarget(path);
  }, []);

  const onDrop = useCallback((toPath: string) => {
    const from = dragFrom.current;
    if (!from || from === toPath) { dragFrom.current = null; setDropTarget(null); return; }
    setOpenPaths(prev => {
      const arr = [...prev];
      const fi = arr.indexOf(from), ti = arr.indexOf(toPath);
      if (fi === -1 || ti === -1) return prev;
      arr.splice(fi, 1); arr.splice(ti, 0, from);
      return arr;
    });
    dragFrom.current = null; setDropTarget(null);
  }, []);

  const onDragEnd = useCallback(() => { dragFrom.current = null; setDropTarget(null); }, []);

  if (personality === 'professional') return null;

  const openPages = pages
    .filter(p => openPaths.includes(p.path))
    .sort((a, b) => openPaths.indexOf(a.path) - openPaths.indexOf(b.path));

  return (
    <div className={`${styles.tabs} ${openPages.length === 0 ? styles.tabsEmpty : ''}`}>
      {openPages.map(page => {
        const { name, icon } = page[personality];
        return (
          <Tab
            key={page.path}
            icon={icon}
            filename={name}
            path={page.path}
            dropIndicator={dropTarget === page.path}
            onClose={() => closeTab(page.path)}
            onDragStart={() => onDragStart(page.path)}
            onDragOver={() => onDragOver(page.path)}
            onDrop={() => onDrop(page.path)}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </div>
  );
};

export default Tabsbar;
