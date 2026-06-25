import { useEffect, useRef } from 'react';
import { useMenu } from '@/components/MenuContext';
import { DropdownMenu } from '@/components/DropdownMenu';
import styles from '@/styles/ContextMenu.module.css';

export function ContextMenu() {
  const { contextMenu, hideContextMenu } = useMenu();
  const ref = useRef<HTMLDivElement>(null);

  // Clamp position so the menu doesn't overflow the viewport
  const getPosition = () => {
    if (!contextMenu) return { top: 0, left: 0 };
    const menuW = 220;
    const menuH = 300; // estimate
    const left = Math.min(contextMenu.x, window.innerWidth - menuW - 8);
    const top = Math.min(contextMenu.y, window.innerHeight - menuH - 8);
    return { top, left };
  };

  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        hideContextMenu();
      }
    };
    // small delay so the mousedown that opened it doesn't immediately close it
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [contextMenu, hideContextMenu]);

  if (!contextMenu) return null;

  const { top, left } = getPosition();

  return (
    <div ref={ref} className={styles.wrapper} style={{ top, left }}>
      <DropdownMenu items={contextMenu.items} onClose={hideContextMenu} />
    </div>
  );
}
