import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { usePersonality } from '@/components/PersonalityContext';
import { useMenu } from '@/components/MenuContext';
import { VscChevronRight, VscSettings } from 'react-icons/vsc';
import { pages } from '@/data/pages';

import styles from '@/styles/Explorer.module.css';

const LABELS: Record<string, string> = { professional: 'Portfolio', gamer: 'SAVE DATA', technical: 'Portfolio' };

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
  const { showContextMenu, addToast } = useMenu();

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
          {pages.map((page) => {
            const { name, icon } = page[personality];
            return (
              <Link href={page.path} key={page.path}>
                <div
                  className={`${styles.file} ${router.pathname === page.path ? styles.fileActive : ''}`}
                  onContextMenu={e => showContextMenu(e, fileContextMenu(page))}
                >
                  <Image src={icon} alt={name} height={18} width={18} />
                  <p>{name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className={styles.settingsLink}>
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
